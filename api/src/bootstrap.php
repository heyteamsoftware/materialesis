<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
mb_internal_encoding('UTF-8');
date_default_timezone_set('Atlantic/Canary');

$config = require __DIR__ . '/config.php';
$local  = dirname(__DIR__) . '/config.local.php';
if (is_file($local)) {
    $config = array_replace($config, require $local);
}

require __DIR__ . '/Http.php';
require __DIR__ . '/Db.php';
require __DIR__ . '/Seed.php';
require __DIR__ . '/Auth.php';
require __DIR__ . '/Router.php';
require __DIR__ . '/Materials.php';
foreach (glob(__DIR__ . '/Controllers/*.php') as $file) {
    require $file;
}

Http::$config = $config;

set_exception_handler(function (Throwable $e) {
    error_log('[materialesis] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    Http::error('Error interno del servidor', 500);
});

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
session_name($config['session_name']);
session_set_cookie_params([
    'lifetime' => 60 * 60 * 24 * 14,
    'path'     => $config['cookie_path'],
    'secure'   => $secure,
    'httponly' => true,
    'samesite' => 'Lax',
]);
ini_set('session.gc_maxlifetime', (string) (60 * 60 * 24 * 14));
session_start();

Db::init($config);

// Protección CSRF: toda petición que modifica datos debe llevar la cabecera X-MIS.
// Un formulario de otra web no puede añadir cabeceras personalizadas.
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD', 'OPTIONS'], true)
    && ($_SERVER['HTTP_X_MIS'] ?? '') !== '1') {
    Http::error('Petición no permitida', 403);
}
