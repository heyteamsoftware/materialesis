<?php
declare(strict_types=1);

final class AdminController
{
    public static function stats(): never
    {
        Auth::requireAdmin();
        $now = Db::now();
        Http::json([
            'users'            => (int) Db::value("SELECT COUNT(*) FROM users WHERE role = 'user'"),
            'licenses'         => (int) Db::value("SELECT COUNT(*) FROM users WHERE role = 'user' AND license_until >= ?", [$now]),
            'license_requests' => (int) Db::value("SELECT COUNT(*) FROM users WHERE role = 'user' AND license_requested_at IS NOT NULL AND (license_until IS NULL OR license_until < ?)", [$now]),
            'materials'        => (int) Db::value('SELECT COUNT(*) FROM materials'),
            'pending_reviews'  => (int) Db::value("SELECT COUNT(*) FROM reviews WHERE status = 'pending'"),
            'unread_messages'  => (int) Db::value('SELECT COUNT(*) FROM messages WHERE is_read = 0'),
            'payments'         => (int) Db::value("SELECT COUNT(*) FROM payments WHERE status = 'paid'"),
        ]);
    }

    /* ---------- Pagos ---------- */

    public static function payments(): never
    {
        Auth::requireAdmin();
        $rows = Db::all('SELECT p.*, u.username FROM payments p LEFT JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC, p.id DESC');
        $total = (int) Db::value("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'paid'");
        Http::json(['payments' => $rows, 'total' => $total]);
    }

    /* ---------- Materiales ---------- */

    public static function materials(): never
    {
        $admin = Auth::requireAdmin();
        $rows = Db::all('SELECT * FROM materials ORDER BY section, CASE access WHEN \'demo\' THEN 0 ELSE 1 END, position, id');
        Http::json([
            'materials'        => array_map(fn ($m) => Materials::serialize($m, $admin, true), $rows),
            'sections'         => Materials::SECTIONS,
            'interactive_keys' => Materials::INTERACTIVE_KEYS,
            'max_upload_mb'    => Http::$config['max_upload_mb'],
        ]);
    }

    public static function createMaterial(): never
    {
        $admin = Auth::requireAdmin();
        $data = self::materialInput(null);
        $data['created_at'] = Db::now();
        $id = Db::insert('materials', $data);
        Http::json(['material' => Materials::serialize(Materials::find($id), $admin, true)], 201);
    }

    public static function updateMaterial(array $p): never
    {
        $admin = Auth::requireAdmin();
        $current = Materials::find((int) $p['id']);
        Db::update('materials', (int) $current['id'], self::materialInput($current));
        Http::json(['material' => Materials::serialize(Materials::find((int) $current['id']), $admin, true)]);
    }

    public static function deleteMaterial(array $p): never
    {
        Auth::requireAdmin();
        $m = Materials::find((int) $p['id']);
        foreach (Materials::pages($m) as $page) {
            if (($page['type'] ?? '') === 'image') {
                Materials::deleteUpload($page['file'] ?? null);
            }
        }
        Materials::deleteUpload($m['file_path']);
        Db::run('DELETE FROM materials WHERE id = ?', [$m['id']]);
        Http::json(['ok' => true]);
    }

    /**
     * Lee el formulario multipart de un material.
     * - pages_json: lista ordenada de páginas [{type:text,title,body} | {type:image,file}]
     * - page_images[]: nuevas imágenes que se añaden al final
     * - file: fichero descargable; remove_file=1 lo elimina
     */
    private static function materialInput(?array $current): array
    {
        Http::required(['title' => 'Título', 'summary' => 'Resumen', 'section' => 'Sección']);
        $section = Http::str('section', 40);
        $kind    = Http::str('kind', 20, 'fisico');
        $access  = Http::str('access', 20, 'premium');
        if (!isset(Materials::SECTIONS[$section])) Http::error('Sección no válida', 422, ['field' => 'section']);
        if (!in_array($kind, Materials::KINDS, true)) Http::error('Tipo no válido', 422, ['field' => 'kind']);
        if (!in_array($access, Materials::ACCESS, true)) Http::error('Acceso no válido', 422, ['field' => 'access']);

        $interactive = Http::str('interactive_key', 40);
        if ($interactive !== '' && !in_array($interactive, Materials::INTERACTIVE_KEYS, true)) {
            Http::error('Herramienta interactiva desconocida', 422, ['field' => 'interactive_key']);
        }
        $embed = Http::str('embed_url', 500);
        if ($embed !== '' && !preg_match('#^https://#i', $embed)) {
            Http::error('El enlace incrustado debe empezar por https://', 422, ['field' => 'embed_url']);
        }

        // Páginas: se conservan solo las imágenes que ya pertenecían a este material
        $oldPages  = $current ? Materials::pages($current) : [];
        $oldImages = array_column(array_filter($oldPages, fn ($p) => ($p['type'] ?? '') === 'image'), 'file');
        $incoming  = json_decode(Http::str('pages_json', 200000, '[]'), true);
        $pages = [];
        foreach (is_array($incoming) ? $incoming : [] as $p) {
            if (($p['type'] ?? '') === 'image' && in_array($p['file'] ?? '', $oldImages, true)) {
                $pages[] = ['type' => 'image', 'file' => $p['file'], 'caption' => mb_substr((string) ($p['caption'] ?? ''), 0, 200)];
            } elseif (($p['type'] ?? '') === 'text') {
                $pages[] = [
                    'type'  => 'text',
                    'title' => mb_substr(trim((string) ($p['title'] ?? '')), 0, 200),
                    'body'  => mb_substr((string) ($p['body'] ?? ''), 0, 20000),
                ];
            }
        }
        // Borra del disco las imágenes que se han quitado
        $kept = array_column(array_filter($pages, fn ($p) => $p['type'] === 'image'), 'file');
        foreach (array_diff($oldImages, $kept) as $removed) {
            Materials::deleteUpload($removed);
        }
        // Nuevas imágenes de página
        if (!empty($_FILES['page_images']['name']) && is_array($_FILES['page_images']['name'])) {
            foreach (array_keys($_FILES['page_images']['name']) as $i) {
                if ($_FILES['page_images']['error'][$i] === UPLOAD_ERR_NO_FILE) continue;
                $file = array_combine(array_keys($_FILES['page_images']), array_column($_FILES['page_images'], $i));
                [$stored] = Materials::storeUpload($file, Materials::PAGE_IMAGE_TYPES);
                $pages[] = ['type' => 'image', 'file' => $stored, 'caption' => ''];
            }
        }

        $data = [
            'section'         => $section,
            'title'           => Http::str('title', 200),
            'summary'         => Http::str('summary', 2000),
            'kind'            => $kind,
            'access'          => $access,
            'format'          => Http::str('format', 80),
            'duration'        => Http::str('duration', 80),
            'audience'        => Http::str('audience', 160),
            'interactive_key' => $interactive !== '' ? $interactive : null,
            'embed_url'       => $embed !== '' ? $embed : null,
            'pages'           => json_encode($pages, JSON_UNESCAPED_UNICODE),
            'position'        => Http::int('position', (int) ($current['position'] ?? 50)),
            'published'       => Http::str('published', 5, '1') === '0' ? 0 : 1,
            'updated_at'      => Db::now(),
        ];

        // Fichero descargable
        if (!empty($_FILES['file']) && $_FILES['file']['error'] !== UPLOAD_ERR_NO_FILE) {
            [$stored, $original] = Materials::storeUpload($_FILES['file'], Materials::FILE_TYPES);
            Materials::deleteUpload($current['file_path'] ?? null);
            $data['file_path'] = $stored;
            $data['file_name'] = $original;
        } elseif (Http::str('remove_file') === '1') {
            Materials::deleteUpload($current['file_path'] ?? null);
            $data['file_path'] = null;
            $data['file_name'] = null;
        }
        return $data;
    }

    /* ---------- Usuarios ---------- */

    public static function users(): never
    {
        Auth::requireAdmin();
        $rows = Db::all('SELECT * FROM users ORDER BY
            CASE WHEN license_requested_at IS NOT NULL AND (license_until IS NULL OR license_until < ?) THEN 0 ELSE 1 END,
            created_at DESC', [Db::now()]);
        Http::json(['users' => array_map(fn ($u) => Auth::publicUser($u) + ['last_login_at' => $u['last_login_at']], $rows)]);
    }

    public static function updateUser(array $p): never
    {
        $admin = Auth::requireAdmin();
        $id = (int) $p['id'];
        $user = Db::one('SELECT * FROM users WHERE id = ?', [$id]) ?? Http::error('Usuario no encontrado', 404);
        $action = Http::str('action', 20);

        switch ($action) {
            case 'activate':
                Auth::extendLicense($user);
                break;
            case 'deactivate':
                Db::run('UPDATE users SET license_until = NULL WHERE id = ?', [$id]);
                break;
            case 'role':
                $role = Http::str('role', 10);
                if (!in_array($role, ['user', 'admin'], true)) Http::error('Rol no válido', 422);
                if ($id === (int) $admin['id'] && $role !== 'admin') Http::error('No puedes quitarte el rol de administración a ti mismo', 422);
                Db::run('UPDATE users SET role = ? WHERE id = ?', [$role, $id]);
                break;
            default:
                Http::error('Acción no válida', 422);
        }
        $fresh = Db::one('SELECT * FROM users WHERE id = ?', [$id]);
        Http::json(['user' => Auth::publicUser($fresh) + ['last_login_at' => $fresh['last_login_at']]]);
    }

    public static function deleteUser(array $p): never
    {
        $admin = Auth::requireAdmin();
        if ((int) $p['id'] === (int) $admin['id']) {
            Http::error('No puedes borrar tu propia cuenta', 422);
        }
        Db::run('UPDATE reviews SET user_id = NULL WHERE user_id = ?', [(int) $p['id']]);
        Db::run('DELETE FROM users WHERE id = ?', [(int) $p['id']]);
        Http::json(['ok' => true]);
    }

    /* ---------- Reseñas ---------- */

    public static function reviews(): never
    {
        Auth::requireAdmin();
        $rows = Db::all("SELECT r.*, u.username FROM reviews r LEFT JOIN users u ON u.id = r.user_id
                         ORDER BY CASE r.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, r.created_at DESC");
        Http::json(['reviews' => $rows]);
    }

    public static function updateReview(array $p): never
    {
        Auth::requireAdmin();
        $status = Http::str('status', 20);
        if (!in_array($status, ['pending', 'approved', 'hidden'], true)) {
            Http::error('Estado no válido', 422);
        }
        if (!Db::run('UPDATE reviews SET status = ? WHERE id = ?', [$status, (int) $p['id']])) {
            Db::value('SELECT 1 FROM reviews WHERE id = ?', [(int) $p['id']]) || Http::error('Reseña no encontrada', 404);
        }
        Http::json(['ok' => true, 'status' => $status]);
    }

    public static function deleteReview(array $p): never
    {
        Auth::requireAdmin();
        Db::run('DELETE FROM reviews WHERE id = ?', [(int) $p['id']]);
        Http::json(['ok' => true]);
    }

    /* ---------- Mensajes de contacto ---------- */

    public static function messages(): never
    {
        Auth::requireAdmin();
        Http::json(['messages' => Db::all('SELECT * FROM messages ORDER BY is_read, created_at DESC')]);
    }

    public static function updateMessage(array $p): never
    {
        Auth::requireAdmin();
        Db::run('UPDATE messages SET is_read = ? WHERE id = ?', [Http::int('is_read', 1) ? 1 : 0, (int) $p['id']]);
        Http::json(['ok' => true]);
    }

    public static function deleteMessage(array $p): never
    {
        Auth::requireAdmin();
        Db::run('DELETE FROM messages WHERE id = ?', [(int) $p['id']]);
        Http::json(['ok' => true]);
    }
}
