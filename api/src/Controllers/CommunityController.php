<?php
declare(strict_types=1);

/** Reseñas ("Tu opinión"), contacto y solicitud de licencia. */
final class CommunityController
{
    public static function reviews(): never
    {
        $rows = Db::all("SELECT id, author_name, author_role, section, rating, body, created_at
                         FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT 200");
        $avg = Db::one("SELECT AVG(rating) AS avg, COUNT(*) AS n FROM reviews WHERE status = 'approved'");
        $mine = [];
        if ($user = Auth::user()) {
            $mine = Db::all("SELECT id, rating, body, status, created_at FROM reviews WHERE user_id = ? ORDER BY created_at DESC", [$user['id']]);
        }
        Http::json([
            'reviews' => array_map(fn ($r) => ['id' => (int) $r['id'], 'rating' => (int) $r['rating']] + $r, $rows),
            'average' => $avg['n'] ? round((float) $avg['avg'], 1) : null,
            'count'   => (int) $avg['n'],
            'mine'    => $mine,
        ]);
    }

    public static function createReview(): never
    {
        $user = Auth::require();
        if (empty(Http::body()['accept_privacy'])) {
            Http::error('Debes aceptar la política de privacidad', 422, ['field' => 'accept_privacy']);
        }
        Http::required(['body' => 'Tu opinión']);
        $rating = Http::int('rating');
        if ($rating < 1 || $rating > 5) {
            Http::error('Elige una valoración de 1 a 5 estrellas', 422, ['field' => 'rating']);
        }
        $body = Http::str('body', 1200);
        if (mb_strlen($body) < 15) {
            Http::error('Cuéntanos un poco más (mínimo 15 caracteres)', 422, ['field' => 'body']);
        }
        $pending = (int) Db::value("SELECT COUNT(*) FROM reviews WHERE user_id = ? AND status = 'pending'", [$user['id']]);
        if ($pending >= 3) {
            Http::error('Tienes varias opiniones pendientes de revisión. Espera a que se publiquen.', 429);
        }
        $section = Http::str('section', 40);
        Db::insert('reviews', [
            'user_id'     => $user['id'],
            'author_name' => Http::str('author_name', 80) ?: $user['name'],
            'author_role' => Http::str('author_role', 120),
            'section'     => isset(Materials::SECTIONS[$section]) ? $section : null,
            'rating'      => $rating,
            'body'        => $body,
            'status'      => 'pending',
            'created_at'  => Db::now(),
            'privacy_at'  => Db::now(),
        ]);
        Http::json(['ok' => true, 'message' => 'Gracias. Tu opinión se publicará tras una revisión.'], 201);
    }

    public static function contact(): never
    {
        // Campo trampa para bots: los humanos no lo ven ni lo rellenan
        if (Http::str('website') !== '') {
            Http::json(['ok' => true]);
        }
        if (empty(Http::body()['accept_privacy'])) {
            Http::error('Debes aceptar la política de privacidad', 422, ['field' => 'accept_privacy']);
        }
        Http::required(['name' => 'Nombre', 'email' => 'Email', 'subject' => 'Asunto', 'message' => 'Mensaje']);
        $email = Http::str('email', 160);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Http::error('El email no parece válido', 422, ['field' => 'email']);
        }
        $recent = (int) Db::value('SELECT COUNT(*) FROM messages WHERE email = ? AND created_at > ?',
            [$email, date('Y-m-d H:i:s', time() - 3600)]);
        if ($recent >= 5) {
            Http::error('Has enviado varios mensajes en poco tiempo. Inténtalo más tarde.', 429);
        }
        Db::insert('messages', [
            'name'       => Http::str('name', 120),
            'email'      => $email,
            'subject'    => Http::str('subject', 160),
            'body'       => Http::str('message', 4000),
            'created_at' => Db::now(),
            'privacy_at' => Db::now(),
        ]);
        Http::json(['ok' => true], 201);
    }

    /**
     * Pasarela de pago SIMULADA (payment_mode = 'simulado').
     * No se piden ni se guardan datos bancarios y no se cobra nada: se registra
     * un pago de prueba y se activa la licencia al momento.
     * Para pasar a un cobro real, sustituir este método por la integración con
     * la pasarela (Stripe, Redsys…) y activar la licencia en su confirmación.
     */
    public static function checkout(): never
    {
        $user = Auth::require();
        if (Http::$config['payment_mode'] !== 'simulado') {
            Http::error('El pago en línea no está disponible', 409);
        }
        $method = Http::str('method', 20);
        if (!in_array($method, ['tarjeta', 'bizum'], true)) {
            Http::error('Elige un método de pago', 422, ['field' => 'method']);
        }
        $recent = (int) Db::value('SELECT COUNT(*) FROM payments WHERE user_id = ? AND created_at > ?',
            [$user['id'], date('Y-m-d H:i:s', time() - 600)]);
        if ($recent >= 10) {
            Http::error('Demasiados intentos de pago seguidos. Espera unos minutos.', 429);
        }

        $payment = [
            'user_id'    => $user['id'],
            'user_name'  => $user['name'],
            'amount'     => (int) Http::$config['license_price'],
            'method'     => $method,
            'reference'  => 'MIS-' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(3))),
            'simulated'  => 1,
            'created_at' => Db::now(),
        ];

        // Permite probar el caso de pago rechazado
        if (!empty(Http::body()['simulate_failure'])) {
            Db::insert('payments', $payment + ['status' => 'rejected', 'license_until' => null]);
            Http::error('El banco ha rechazado el pago (simulación). No se ha activado la licencia.', 402, ['reference' => $payment['reference']]);
        }

        $until = Auth::extendLicense($user);
        $id = Db::insert('payments', $payment + ['status' => 'paid', 'license_until' => $until]);
        $fresh = Db::one('SELECT * FROM users WHERE id = ?', [$user['id']]);
        Http::json([
            'user'    => Auth::publicUser($fresh),
            'payment' => ['id' => $id, 'status' => 'paid', 'license_until' => $until] + $payment,
        ], 201);
    }

    /** Historial de pagos de la propia cuenta. */
    public static function myPayments(): never
    {
        $user = Auth::require();
        Http::json(['payments' => Db::all(
            'SELECT id, amount, method, reference, status, simulated, license_until, created_at FROM payments WHERE user_id = ? ORDER BY created_at DESC, id DESC',
            [$user['id']]
        )]);
    }

    /**
     * Solicitud de licencia anual. En modo 'manual' queda pendiente hasta que
     * administración confirma el pago y la activa desde el panel.
     * Aquí se conectaría una pasarela (Stripe, Redsys...) en el futuro.
     */
    public static function requestLicense(): never
    {
        $user = Auth::require();
        if (Auth::hasLicense($user)) {
            Http::error('Ya tienes una licencia activa', 409);
        }
        Db::run('UPDATE users SET license_requested_at = ? WHERE id = ?', [Db::now(), $user['id']]);
        $user = Db::one('SELECT * FROM users WHERE id = ?', [$user['id']]);
        Http::json(['user' => Auth::publicUser($user)]);
    }
}
