<?php
declare(strict_types=1);

final class Auth
{
    private static ?array $cached = null;
    private static bool $loaded = false;

    public static function user(): ?array
    {
        if (!self::$loaded) {
            self::$loaded = true;
            $id = (int) ($_SESSION['uid'] ?? 0);
            self::$cached = $id > 0 ? Db::one('SELECT * FROM users WHERE id = ?', [$id]) : null;
            if ($id > 0 && self::$cached === null) {
                unset($_SESSION['uid']); // usuario borrado
            }
        }
        return self::$cached;
    }

    public static function require(): array
    {
        return self::user() ?? Http::error('Necesitas iniciar sesión', 401);
    }

    public static function requireAdmin(): array
    {
        $user = self::require();
        if ($user['role'] !== 'admin') {
            Http::error('Acceso reservado a administración', 403);
        }
        return $user;
    }

    public static function login(array $user): void
    {
        session_regenerate_id(true);
        $_SESSION['uid'] = (int) $user['id'];
        self::$cached = $user;
        self::$loaded = true;
        Db::run('UPDATE users SET last_login_at = ? WHERE id = ?', [Db::now(), $user['id']]);
    }

    public static function logout(): void
    {
        $_SESSION = [];
        session_regenerate_id(true);
        self::$cached = null;
    }

    public static function hasLicense(?array $user): bool
    {
        if ($user === null) {
            return false;
        }
        if ($user['role'] === 'admin') {
            return true;
        }
        return !empty($user['license_until']) && strtotime($user['license_until']) >= time();
    }

    /**
     * Activa o renueva la licencia: suma los días configurados desde hoy,
     * o desde la fecha de fin si todavía está vigente. Devuelve la nueva fecha.
     */
    public static function extendLicense(array $user): string
    {
        $current = !empty($user['license_until']) ? strtotime($user['license_until']) : 0;
        $from = $current > time() ? $current : time();
        $until = date('Y-m-d 23:59:59', $from + (int) Http::$config['license_days'] * 86400);
        Db::run('UPDATE users SET license_until = ?, license_requested_at = NULL WHERE id = ?', [$until, $user['id']]);
        return $until;
    }

    /** Datos del usuario que se pueden enviar al navegador. */
    public static function publicUser(array $u): array
    {
        return [
            'id'                   => (int) $u['id'],
            'username'             => $u['username'],
            'name'                 => $u['name'],
            'email'                => $u['email'],
            'role'                 => $u['role'],
            'license_active'       => self::hasLicense($u),
            'license_until'        => $u['license_until'],
            'license_requested_at' => $u['license_requested_at'],
            'created_at'           => $u['created_at'],
        ];
    }

    /** Limita los intentos de login por IP: 10 en 15 minutos. */
    public static function throttle(): void
    {
        $since = date('Y-m-d H:i:s', time() - 15 * 60);
        Db::run('DELETE FROM login_attempts WHERE attempted_at < ?', [$since]);
        $count = (int) Db::value('SELECT COUNT(*) FROM login_attempts WHERE ip = ?', [Http::clientIp()]);
        if ($count >= 10) {
            Http::error('Demasiados intentos. Espera unos minutos y vuelve a probar.', 429);
        }
    }

    public static function recordFailure(): void
    {
        Db::insert('login_attempts', ['ip' => Http::clientIp(), 'attempted_at' => Db::now()]);
    }
}
