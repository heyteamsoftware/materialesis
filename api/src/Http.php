<?php
declare(strict_types=1);

final class Http
{
    public static array $config = [];
    private static ?array $body = null;

    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function error(string $message, int $status = 400, array $extra = []): never
    {
        self::json(['error' => $message] + $extra, $status);
    }

    /** Cuerpo de la petición: JSON o formulario multipart. */
    public static function body(): array
    {
        if (self::$body === null) {
            $type = $_SERVER['CONTENT_TYPE'] ?? '';
            if (str_starts_with($type, 'application/json')) {
                $decoded = json_decode((string) file_get_contents('php://input'), true);
                self::$body = is_array($decoded) ? $decoded : [];
            } else {
                self::$body = $_POST;
            }
        }
        return self::$body;
    }

    public static function str(string $key, int $max = 500, string $default = ''): string
    {
        $value = self::body()[$key] ?? $default;
        if (!is_scalar($value)) {
            return $default;
        }
        return mb_substr(trim((string) $value), 0, $max);
    }

    public static function int(string $key, int $default = 0): int
    {
        $value = self::body()[$key] ?? $default;
        return is_numeric($value) ? (int) $value : $default;
    }

    /** @param array<string,string> $fields campo => etiqueta visible */
    public static function required(array $fields): void
    {
        foreach ($fields as $field => $label) {
            if (self::str($field, 20000) === '') {
                self::error("El campo «{$label}» es obligatorio", 422, ['field' => $field]);
            }
        }
    }

    public static function clientIp(): string
    {
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    /** Envía un fichero del disco al navegador. */
    public static function sendFile(string $path, string $downloadName = '', bool $attachment = false): never
    {
        if (!is_file($path)) {
            self::error('Fichero no encontrado', 404);
        }
        $mime = mime_content_type($path) ?: 'application/octet-stream';
        header("Content-Security-Policy: default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'self'");
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($path));
        header('Cache-Control: private, max-age=3600');
        $name = $downloadName !== '' ? $downloadName : basename($path);
        $ascii = preg_replace('/[^A-Za-z0-9._\- ]+/', '_', $name);
        header(sprintf(
            "Content-Disposition: %s; filename=\"%s\"; filename*=UTF-8''%s",
            $attachment ? 'attachment' : 'inline',
            $ascii,
            rawurlencode($name)
        ));
        readfile($path);
        exit;
    }
}
