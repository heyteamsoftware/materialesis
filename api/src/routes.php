<?php
declare(strict_types=1);

$r = new Router();

$r->get('/', fn () => Http::json(['app' => 'materialesis', 'ok' => true]));

// Autenticación
$r->get('/auth/me', [AuthController::class, 'me']);
$r->post('/auth/register', [AuthController::class, 'register']);
$r->post('/auth/login', [AuthController::class, 'login']);
$r->post('/auth/logout', [AuthController::class, 'logout']);
$r->post('/auth/password', [AuthController::class, 'changePassword']);

// Zona privada: materiales
$r->get('/sections', [MaterialController::class, 'sections']);
$r->get('/materials', [MaterialController::class, 'index']);
$r->get('/materials/{id}', [MaterialController::class, 'show']);
$r->get('/materials/{id}/page/{n}', [MaterialController::class, 'page']);
$r->get('/materials/{id}/download', [MaterialController::class, 'download']);

// Comunidad
$r->get('/reviews', [CommunityController::class, 'reviews']);
$r->post('/reviews', [CommunityController::class, 'createReview']);
$r->post('/contact', [CommunityController::class, 'contact']);
$r->post('/license/request', [CommunityController::class, 'requestLicense']);
$r->post('/license/checkout', [CommunityController::class, 'checkout']);
$r->get('/license/payments', [CommunityController::class, 'myPayments']);

// Administración
$r->get('/admin/stats', [AdminController::class, 'stats']);
$r->get('/admin/materials', [AdminController::class, 'materials']);
$r->post('/admin/materials', [AdminController::class, 'createMaterial']);
$r->post('/admin/materials/{id}', [AdminController::class, 'updateMaterial']); // multipart: POST
$r->delete('/admin/materials/{id}', [AdminController::class, 'deleteMaterial']);
$r->get('/admin/users', [AdminController::class, 'users']);
$r->patch('/admin/users/{id}', [AdminController::class, 'updateUser']);
$r->delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
$r->get('/admin/reviews', [AdminController::class, 'reviews']);
$r->patch('/admin/reviews/{id}', [AdminController::class, 'updateReview']);
$r->delete('/admin/reviews/{id}', [AdminController::class, 'deleteReview']);
$r->get('/admin/payments', [AdminController::class, 'payments']);
$r->get('/admin/messages',[AdminController::class, 'messages']);
$r->patch('/admin/messages/{id}', [AdminController::class, 'updateMessage']);
$r->delete('/admin/messages/{id}', [AdminController::class, 'deleteMessage']);

$r->dispatch();
