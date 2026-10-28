<?php
declare(strict_types=1);

final class AuthController
{
    public static function me(): never
    {
        $user = Auth::user();
        Http::json([
            'user'    => $user ? Auth::publicUser($user) : null,
            'license' => [
                'price' => Http::$config['license_price'],
                'days'  => Http::$config['license_days'],
                'mode'  => Http::$config['payment_mode'],
            ],
        ]);
    }

    public static function register(): never
    {
        Http::required(['name' => 'Nombre', 'username' => 'Usuario', 'email' => 'Email', 'password' => 'Contraseña']);
        if (empty(Http::body()['accept_privacy'])) {
            Http::error('Debes aceptar la política de privacidad', 422, ['field' => 'accept_privacy']);
        }
        $username = mb_strtolower(Http::str('username', 40));
        $email    = mb_strtolower(Http::str('email', 160));
        $password = (string) (Http::body()['password'] ?? '');

        if (!preg_match('/^[a-z0-9._-]{3,40}$/', $username)) {
            Http::error('El usuario debe tener entre 3 y 40 caracteres: letras, números, punto, guion o guion bajo', 422, ['field' => 'username']);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Http::error('El email no parece válido', 422, ['field' => 'email']);
        }
        if (mb_strlen($password) < 8) {
            Http::error('La contraseña debe tener al menos 8 caracteres', 422, ['field' => 'password']);
        }
        if (Db::value('SELECT 1 FROM users WHERE username = ?', [$username])) {
            Http::error('Ese nombre de usuario ya está en uso', 409, ['field' => 'username']);
        }

        $id = Db::insert('users', [
            'username'      => $username,
            'name'          => Http::str('name', 120),
            'email'         => $email,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'role'          => 'user',
            'created_at'    => Db::now(),
            'privacy_at'    => Db::now(),
        ]);
        $user = Db::one('SELECT * FROM users WHERE id = ?', [$id]);
        Auth::login($user);
        Http::json(['user' => Auth::publicUser($user)], 201);
    }

    public static function login(): never
    {
        Auth::throttle();
        Http::required(['username' => 'Usuario', 'password' => 'Contraseña']);
        $user = Db::one('SELECT * FROM users WHERE username = ?', [mb_strtolower(Http::str('username', 40))]);
        $password = (string) (Http::body()['password'] ?? '');

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Auth::recordFailure();
            Http::error('Usuario o contraseña incorrectos', 401);
        }
        if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
            Db::run('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), $user['id']]);
        }
        Auth::login($user);
        Http::json(['user' => Auth::publicUser($user)]);
    }

    public static function logout(): never
    {
        Auth::logout();
        Http::json(['ok' => true]);
    }

    /** Modifica nombre, usuario y email de la propia cuenta. */
    public static function updateProfile(): never
    {
        $user = Auth::require();
        Http::required(['name' => 'Nombre', 'username' => 'Usuario', 'email' => 'Email']);
        $username = mb_strtolower(Http::str('username', 40));
        $email    = mb_strtolower(Http::str('email', 160));

        if (!preg_match('/^[a-z0-9._-]{3,40}$/', $username)) {
            Http::error('El usuario debe tener entre 3 y 40 caracteres: letras, números, punto, guion o guion bajo', 422, ['field' => 'username']);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Http::error('El email no parece válido', 422, ['field' => 'email']);
        }
        if (Db::value('SELECT 1 FROM users WHERE username = ? AND id <> ?', [$username, $user['id']])) {
            Http::error('Ese nombre de usuario ya está en uso', 409, ['field' => 'username']);
        }

        Db::update('users', (int) $user['id'], [
            'name'     => Http::str('name', 120),
            'username' => $username,
            'email'    => $email,
        ]);
        $fresh = Db::one('SELECT * FROM users WHERE id = ?', [$user['id']]);
        Http::json(['user' => Auth::publicUser($fresh)]);
    }

    /**
     * Borra la cuenta propia tras confirmar la contraseña.
     * Las opiniones publicadas quedan como «Usuario eliminado», los pagos conservan
     * el nombre como justificante (sin vincularlos a la cuenta) y se borran los
     * mensajes de contacto enviados con ese mismo email.
     */
    public static function deleteAccount(): never
    {
        $user = Auth::require();
        if ($user['role'] === 'admin') {
            Http::error('La cuenta de administración no se puede borrar desde aquí', 403);
        }
        $password = (string) (Http::body()['password'] ?? '');
        if (!password_verify($password, $user['password_hash'])) {
            Http::error('La contraseña no es correcta', 422, ['field' => 'password']);
        }

        Db::run("UPDATE reviews SET user_id = NULL, author_name = 'Usuario eliminado' WHERE user_id = ?", [$user['id']]);
        Db::run('UPDATE payments SET user_id = NULL WHERE user_id = ?', [$user['id']]);
        Db::run('DELETE FROM messages WHERE email = ?', [$user['email']]);
        Db::run('DELETE FROM users WHERE id = ?', [$user['id']]);
        Auth::logout();
        Http::json(['ok' => true]);
    }

    public static function changePassword(): never
    {
        $user = Auth::require();
        $current = (string) (Http::body()['current'] ?? '');
        $next    = (string) (Http::body()['password'] ?? '');
        if (!password_verify($current, $user['password_hash'])) {
            Http::error('La contraseña actual no es correcta', 422, ['field' => 'current']);
        }
        if (mb_strlen($next) < 8) {
            Http::error('La nueva contraseña debe tener al menos 8 caracteres', 422, ['field' => 'password']);
        }
        Db::run('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($next, PASSWORD_DEFAULT), $user['id']]);
        Http::json(['ok' => true]);
    }
}
