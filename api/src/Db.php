<?php
declare(strict_types=1);

/**
 * Acceso a datos con PDO. Funciona con SQLite (por defecto) y MySQL/MariaDB:
 * basta con cambiar db_dsn / db_user / db_pass en config.local.php.
 */
final class Db
{
    private static PDO $pdo;
    private static string $driver;

    public static function init(array $config): void
    {
        if (str_starts_with($config['db_dsn'], 'sqlite:')) {
            $dir = dirname(substr($config['db_dsn'], 7));
            if (!is_dir($dir)) {
                mkdir($dir, 0775, true);
            }
        }
        if (!is_dir($config['uploads_dir'])) {
            mkdir($config['uploads_dir'], 0775, true);
        }

        self::$pdo = new PDO($config['db_dsn'], $config['db_user'], $config['db_pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        self::$driver = self::$pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if (self::$driver === 'sqlite') {
            self::$pdo->exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 4000;');
        }

        self::migrate($config);
    }

    public static function pdo(): PDO
    {
        return self::$pdo;
    }

    public static function all(string $sql, array $params = []): array
    {
        $st = self::$pdo->prepare($sql);
        $st->execute($params);
        return $st->fetchAll();
    }

    public static function one(string $sql, array $params = []): ?array
    {
        $st = self::$pdo->prepare($sql);
        $st->execute($params);
        $row = $st->fetch();
        return $row === false ? null : $row;
    }

    public static function value(string $sql, array $params = []): mixed
    {
        $st = self::$pdo->prepare($sql);
        $st->execute($params);
        return $st->fetchColumn();
    }

    public static function run(string $sql, array $params = []): int
    {
        $st = self::$pdo->prepare($sql);
        $st->execute($params);
        return $st->rowCount();
    }

    public static function insert(string $table, array $data): int
    {
        $cols = array_keys($data);
        $sql = sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            $table,
            implode(', ', $cols),
            implode(', ', array_map(fn ($c) => ':' . $c, $cols))
        );
        self::run($sql, $data);
        return (int) self::$pdo->lastInsertId();
    }

    public static function update(string $table, int $id, array $data): void
    {
        $sets = implode(', ', array_map(fn ($c) => "$c = :$c", array_keys($data)));
        self::run("UPDATE $table SET $sets WHERE id = :id", $data + ['id' => $id]);
    }

    public static function now(): string
    {
        return date('Y-m-d H:i:s');
    }

    private static function migrate(array $config): void
    {
        $pk   = self::$driver === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY';
        $text = self::$driver === 'sqlite' ? 'TEXT' : 'MEDIUMTEXT';
        $str  = self::$driver === 'sqlite' ? 'TEXT' : 'VARCHAR(255)';

        self::$pdo->exec("CREATE TABLE IF NOT EXISTS users (
            id $pk,
            username $str NOT NULL UNIQUE,
            name $str NOT NULL,
            email $str NOT NULL,
            password_hash $str NOT NULL,
            role $str NOT NULL DEFAULT 'user',
            license_until $str NULL,
            license_requested_at $str NULL,
            created_at $str NOT NULL,
            last_login_at $str NULL
        )");

        self::$pdo->exec("CREATE TABLE IF NOT EXISTS materials (
            id $pk,
            section $str NOT NULL,
            title $str NOT NULL,
            summary $text NOT NULL,
            kind $str NOT NULL,
            access $str NOT NULL DEFAULT 'premium',
            format $str NOT NULL DEFAULT '',
            duration $str NOT NULL DEFAULT '',
            audience $str NOT NULL DEFAULT '',
            interactive_key $str NULL,
            embed_url $str NULL,
            pages $text NOT NULL,
            file_path $str NULL,
            file_name $str NULL,
            position INT NOT NULL DEFAULT 0,
            published INT NOT NULL DEFAULT 1,
            created_at $str NOT NULL,
            updated_at $str NOT NULL
        )");

        self::$pdo->exec("CREATE TABLE IF NOT EXISTS reviews (
            id $pk,
            user_id INT NULL,
            author_name $str NOT NULL,
            author_role $str NOT NULL DEFAULT '',
            section $str NULL,
            rating INT NOT NULL,
            body $text NOT NULL,
            status $str NOT NULL DEFAULT 'pending',
            created_at $str NOT NULL
        )");

        self::$pdo->exec("CREATE TABLE IF NOT EXISTS messages (
            id $pk,
            name $str NOT NULL,
            email $str NOT NULL,
            subject $str NOT NULL,
            body $text NOT NULL,
            is_read INT NOT NULL DEFAULT 0,
            created_at $str NOT NULL
        )");

        self::$pdo->exec("CREATE TABLE IF NOT EXISTS login_attempts (
            id $pk,
            ip $str NOT NULL,
            attempted_at $str NOT NULL
        )");

        if ((int) self::value('SELECT COUNT(*) FROM users') === 0) {
            Seed::run($config);
        }
    }
}
