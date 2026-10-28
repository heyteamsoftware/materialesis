<?php
declare(strict_types=1);

final class MaterialController
{
    /** Resumen de las 7 secciones para el panel de inicio. */
    public static function sections(): never
    {
        $user = Auth::require();
        $rows = Db::all("SELECT section,
                COUNT(*) AS total,
                SUM(CASE WHEN access = 'demo' THEN 1 ELSE 0 END) AS demos
            FROM materials WHERE published = 1 GROUP BY section");
        $bySection = [];
        foreach ($rows as $r) {
            $bySection[$r['section']] = ['total' => (int) $r['total'], 'demos' => (int) $r['demos']];
        }
        $out = [];
        foreach (Materials::SECTIONS as $slug => $name) {
            $out[] = ['slug' => $slug, 'name' => $name] + ($bySection[$slug] ?? ['total' => 0, 'demos' => 0]);
        }
        Http::json(['sections' => $out, 'has_license' => Auth::hasLicense($user)]);
    }

    public static function index(): never
    {
        $user = Auth::require();
        $section = (string) ($_GET['section'] ?? '');
        if (!isset(Materials::SECTIONS[$section])) {
            Http::error('Sección no válida', 404);
        }
        $rows = Db::all(
            "SELECT * FROM materials WHERE section = ? AND published = 1
             ORDER BY CASE access WHEN 'demo' THEN 0 ELSE 1 END, position, id",
            [$section]
        );
        Http::json([
            'section'     => ['slug' => $section, 'name' => Materials::SECTIONS[$section]],
            'has_license' => Auth::hasLicense($user),
            'materials'   => array_map(fn ($m) => Materials::serialize($m, $user), $rows),
        ]);
    }

    public static function show(array $p): never
    {
        $user = Auth::require();
        $m = Materials::find((int) $p['id']);
        if (!(int) $m['published'] && $user['role'] !== 'admin') {
            Http::error('Material no encontrado', 404);
        }
        Http::json(['material' => Materials::serialize($m, $user)]);
    }

    /** Imagen de una página del visor (demo o con licencia). */
    public static function page(array $p): never
    {
        $user = Auth::require();
        $m = Materials::find((int) $p['id']);
        if (!Materials::canAccess($m, $user)) {
            Http::error('Material bloqueado: necesitas la licencia anual', 403);
        }
        $page = Materials::pages($m)[(int) $p['n']] ?? null;
        if (!$page || ($page['type'] ?? '') !== 'image') {
            Http::error('Página no encontrada', 404);
        }
        Http::sendFile(Materials::uploadPath($page['file']));
    }

    /** Descarga del fichero original: solo con licencia activa. */
    public static function download(array $p): never
    {
        $user = Auth::require();
        $m = Materials::find((int) $p['id']);
        if (!Auth::hasLicense($user)) {
            Http::error('La descarga está disponible con la licencia anual', 403);
        }
        if (empty($m['file_path'])) {
            Http::error('Este material no tiene fichero descargable', 404);
        }
        Http::sendFile(Materials::uploadPath($m['file_path']), (string) $m['file_name'], true);
    }
}
