<?php
declare(strict_types=1);

/** Reglas de negocio de los materiales: secciones, acceso y ficheros. */
final class Materials
{
    public const SECTIONS = [
        'contexto'          => 'Contexto',
        'inmersion'         => 'Inmersión',
        'fol'               => 'FOL',
        'metodologia'       => 'Metodología',
        'promocion'         => 'Promoción',
        'mediacion'         => 'Mediación',
        'apoyo-idiomatico'  => 'Apoyo idiomático',
    ];

    public const KINDS = ['fisico', 'digital'];
    public const ACCESS = ['demo', 'premium'];

    /** Herramientas interactivas que existen en el frontend. */
    public const INTERACTIVE_KEYS = ['ecomapa', 'entrevista', 'competencias', 'planificador', 'cartel', 'mensajes-yo', 'frases'];

    public const PAGE_IMAGE_TYPES = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp'];

    public const FILE_TYPES = [
        'application/pdf' => 'pdf',
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/webp' => 'webp',
        'application/zip' => 'zip',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
        'application/vnd.oasis.opendocument.text' => 'odt',
        'application/vnd.oasis.opendocument.presentation' => 'odp',
    ];

    public static function canAccess(array $m, ?array $user): bool
    {
        if (!(int) $m['published'] && ($user['role'] ?? '') !== 'admin') {
            return false;
        }
        return $m['access'] === 'demo' || Auth::hasLicense($user);
    }

    public static function pages(array $m): array
    {
        $pages = json_decode((string) $m['pages'], true);
        return is_array($pages) ? $pages : [];
    }

    /** Material listo para el navegador. Si está bloqueado, sin contenido. */
    public static function serialize(array $m, ?array $user, bool $admin = false): array
    {
        $pages    = self::pages($m);
        $licensed = Auth::hasLicense($user);
        $unlocked = self::canAccess($m, $user);
        $out = [
            'id'         => (int) $m['id'],
            'section'    => $m['section'],
            'title'      => $m['title'],
            'summary'    => $m['summary'],
            'kind'       => $m['kind'],
            'access'     => $m['access'],
            'format'     => $m['format'],
            'duration'   => $m['duration'],
            'audience'   => $m['audience'],
            'position'   => (int) $m['position'],
            'page_count' => count($pages),
            'has_file'   => !empty($m['file_path']),
            'locked'     => !$unlocked,
        ];
        if ($unlocked) {
            $out['interactive_key'] = $m['interactive_key'];
            $out['embed_url']       = $m['embed_url'];
            $out['pages'] = array_map(function ($p, $i) use ($m) {
                if (($p['type'] ?? '') === 'image') {
                    return ['type' => 'image', 'url' => "api/materials/{$m['id']}/page/$i", 'caption' => $p['caption'] ?? ''];
                }
                return ['type' => 'text', 'title' => $p['title'] ?? '', 'body' => $p['body'] ?? ''];
            }, $pages, array_keys($pages));
            // Las demos solo se visualizan: la descarga exige licencia.
            $out['can_download'] = $licensed && !empty($m['file_path']);
            $out['file_name']    = $licensed ? $m['file_name'] : null;
        }
        if ($admin) {
            $out['published']   = (bool) $m['published'];
            $out['raw_pages']   = $pages;
            $out['file_name']   = $m['file_name'];
            $out['interactive_key'] = $m['interactive_key'];
            $out['embed_url']   = $m['embed_url'];
            $out['updated_at']  = $m['updated_at'];
        }
        return $out;
    }

    public static function find(int $id): array
    {
        return Db::one('SELECT * FROM materials WHERE id = ?', [$id]) ?? Http::error('Material no encontrado', 404);
    }

    /** Guarda un fichero subido y devuelve [ruta relativa, nombre original]. */
    public static function storeUpload(array $file, array $allowed): array
    {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            Http::error('No se pudo subir el fichero (código ' . ($file['error'] ?? '?') . ')', 422);
        }
        $maxBytes = (int) Http::$config['max_upload_mb'] * 1024 * 1024;
        if ($file['size'] > $maxBytes) {
            Http::error('El fichero supera el tamaño máximo de ' . Http::$config['max_upload_mb'] . ' MB', 422);
        }
        $mime = mime_content_type($file['tmp_name']) ?: '';
        if (!isset($allowed[$mime])) {
            Http::error("Tipo de fichero no permitido ($mime)", 422);
        }
        $name = bin2hex(random_bytes(12)) . '.' . $allowed[$mime];
        $dest = rtrim(Http::$config['uploads_dir'], '/') . '/' . $name;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            Http::error('No se pudo guardar el fichero en el servidor', 500);
        }
        $original = mb_substr(basename((string) $file['name']), 0, 180);
        return [$name, $original];
    }

    public static function deleteUpload(?string $name): void
    {
        if ($name && preg_match('/^[a-f0-9]{24}\.[a-z]+$/', $name)) {
            $path = rtrim(Http::$config['uploads_dir'], '/') . '/' . $name;
            if (is_file($path)) {
                unlink($path);
            }
        }
    }

    public static function uploadPath(string $name): string
    {
        if (!preg_match('/^[a-f0-9]{24}\.[a-z]+$/', $name)) {
            Http::error('Fichero no válido', 404);
        }
        return rtrim(Http::$config['uploads_dir'], '/') . '/' . $name;
    }
}
