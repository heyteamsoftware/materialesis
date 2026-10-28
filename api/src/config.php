<?php
// Configuración por defecto. Para sobrescribir en un servidor concreto,
// crea api/config.local.php devolviendo un array solo con las claves a cambiar.
$root = dirname(__DIR__, 2); // carpeta de la app (contiene /api y /data)

return [
    // Cualquier DSN de PDO: sqlite:...  o  mysql:host=...;dbname=...;charset=utf8mb4
    'db_dsn'        => 'sqlite:' . $root . '/data/materialesis.sqlite',
    'db_user'       => null,
    'db_pass'       => null,
    'uploads_dir'   => $root . '/data/uploads',
    'session_name'  => 'mis_session',
    'cookie_path'   => '/materialesis',
    'license_days'  => 365,
    'license_price' => 49,       // € / año (se muestra en la web)
    'payment_mode'  => 'manual', // el admin activa la licencia al confirmar el pago
    'admin_user'    => 'admin',  // credenciales iniciales (solo se usan al crear la BD)
    'admin_pass'    => 'integracion',
    'max_upload_mb' => 40,
];
