<?php

require __DIR__ . '/../vendor/autoload.php';

use App\middlewares\Middleware;
use App\utils\Herramientas;

//app 
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Manejo de archivos estáticos ANTES de iniciar sesión
if (strpos($uri, '/files/') === 0) {
    $path = $_GET['path'] ?? '';
    
    if (empty($path)) {
        http_response_code(400);
        die('Ruta no especificada');
    }
    
    $fullPath = __DIR__ . '/../storage/' . $path;
    $realPath = realpath($fullPath);
    $storageDir = realpath(__DIR__ . '/../storage');
    
    if (!$realPath || !file_exists($realPath) || !is_file($realPath)) {
        http_response_code(404);
        die('Archivo no encontrado');
    }
    
    if (strpos($realPath, $storageDir) !== 0) {
        http_response_code(403);
        die('Acceso denegado');
    }
    
    $extension = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'webp'];
    
    if (!in_array($extension, $allowedExtensions)) {
        http_response_code(403);
        die('Tipo de archivo no permitido');
    }
    
    $mimeTypes = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'gif'  => 'image/gif',
        'pdf'  => 'application/pdf',
        'webp' => 'image/webp'
    ];
    
    $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
    
    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . filesize($realPath));
    header('Cache-Control: public, max-age=86400');
    header('Content-Disposition: inline; filename="' . basename($realPath) . '"');
    
    if (ob_get_level()) {
        ob_clean();
        flush();
    }
    
    readfile($realPath);
    exit;
}

Herramientas::startSession();

$privateRoutes = ['/dashboard', '/dashboard-admin', '/pagoPendiente', '/pagoEnviado', 'api/pay/firstPay', '/api/notifications/users', '/api/notifications/create', '/api/notifications/user', '/api/notifications/mark-read'];
if (in_array($uri, $privateRoutes)) {
    Middleware::handle();
}

switch ($uri) {

    case '/':
        $controller = new App\Controllers\ViewsController();
        $controller->index();
        break;
    case '/home':
        $controller = new App\Controllers\ViewsController();
        $controller->index();
        break;
    case '/login':
        $controller = new App\Controllers\ViewsController();
        $controller->showLoginForm();
        break;
    case '/register':
        $controller = new App\Controllers\ViewsController();
        $controller->showRegistrationForm();
        break;
    case '/dashboard':
        $controller = new App\Controllers\ViewsController();
        $controller->showDashboard();
        break;
    case '/dashboard-admin':
        $controller = new App\Controllers\ViewsController();
        $controller->showDashboardAdmin();
        break;
    case '/pagoPendiente':
        $controller = new App\controllers\ViewsController();
        $controller->showRegistrarPago();
        break;
    case '/pagoEnviado':
        $controller = new App\controllers\ViewsController;
        $controller->showSalaEspera();
        break;


    // APIS

    case '/api/login':
        $login = new App\Controllers\AuthController();
        $login->login();
        break;
    case '/api/register':
        $register = new App\Controllers\AuthController();
        $register->register();
        break;
    
    case '/api/logout':
        $logout = new App\Controllers\AuthController();
        $logout->logout();
        break;

    case '/api/pay/firstPay':
        $pay = new App\controllers\PaymentsController();
        $pay->addPay();
        break;

    case '/api/payment/approve':
        $payments = new App\Controllers\PaymentsController();
        $payments->approvePayment();
        break;

    case '/api/payment/reject':
        $payments = new App\Controllers\PaymentsController();
        $payments->rejectPayment();
        break;

    case '/api/notifications/create':
        $notification = new App\Controllers\NotificationController();
        $notification->create();
        break;

    case '/api/notifications/user':
        $notification = new App\Controllers\NotificationController();
        $notification->getUserNotifications();
        break;

    case '/api/notifications/mark-read':
        $notification = new App\Controllers\NotificationController();
        $notification->markAsRead();
        break;

    case '/api/notifications/users':
        $notification = new App\Controllers\NotificationController();
        $notification->getUsers();
        break;

    default:
        http_response_code(404);
        include __DIR__ . '/../src/views/404error.php';
        break;
}