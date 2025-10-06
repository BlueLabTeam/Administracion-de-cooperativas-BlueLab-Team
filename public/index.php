<?php

require __DIR__ . '/../vendor/autoload.php';

use App\middlewares\Middleware;
use App\utils\Herramientas;

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

// Rutas que solo requieren login (no validación de estado)
$loginOnlyRoutes = [
    '/api/pay/firstPay',  // Esta ruta SOLO valida login, NO estado
];

// Rutas que requieren login Y validación de estado
$privateRoutes = [
    '/dashboard', 
    '/dashboard-admin', 
    '/pagoPendiente', 
    '/pagoEnviado',
    '/api/notifications/users', 
    '/api/notifications/create', 
    '/api/notifications/user', 
    '/api/notifications/mark-read',
    '/api/payment/approve',
    '/api/payment/reject',
    '/api/tasks/create',
    '/api/tasks/user',
    '/api/tasks/all',
    '/api/tasks/update-progress',
    '/api/tasks/add-avance',
    '/api/tasks/details',
    '/api/tasks/users',
    '/api/tasks/nucleos',
    '/api/tasks/cancel',
    '/api/users/all',
    '/api/users/details',
    '/api/nucleos/create',      
    '/api/nucleos/all',            
    '/api/nucleos/details',        
    '/api/nucleos/update',       
    '/api/nucleos/delete',       
    '/api/nucleos/users-available' 
];

// Aplicar middleware según el tipo de ruta
if (in_array($uri, $loginOnlyRoutes)) {
    // Solo validar login, NO estado
    Herramientas::validarLogin();
} elseif (in_array($uri, $privateRoutes)) {
    // Validar login Y estado
    Middleware::handle();
}

switch ($uri) {
    // VISTAS
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

    // API AUTH
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

    // API PAGOS
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

    // API NOTIFICACIONES
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

    // API TAREAS
    case '/api/tasks/create':
        $task = new App\Controllers\TaskController();
        $task->create();
        break;
    case '/api/tasks/user':
        $task = new App\Controllers\TaskController();
        $task->getUserTasks();
        break;
    case '/api/tasks/all':
        $task = new App\Controllers\TaskController();
        $task->getAllTasks();
        break;
    case '/api/tasks/update-progress':
        $task = new App\Controllers\TaskController();
        $task->updateProgress();
        break;
    case '/api/tasks/add-avance':
        $task = new App\Controllers\TaskController();
        $task->addAvance();
        break;
    case '/api/tasks/details':
        $task = new App\Controllers\TaskController();
        $task->getTaskDetails();
        break;
    case '/api/tasks/users':
        $task = new App\Controllers\TaskController();
        $task->getUsers();
        break;
    case '/api/tasks/nucleos':
        $task = new App\Controllers\TaskController();
        $task->getNucleos();
        break;
    case '/api/tasks/cancel':
        $task = new App\Controllers\TaskController();
        $task->cancelTask();
        break;

    // API USUARIOS
    case '/api/users/all':
        $users = new App\Controllers\UserController();
        $users->getAllUsers();
        break;
    case '/api/users/details':
        $users = new App\Controllers\UserController();
        $users->getUserById();
        break;

    default:
        http_response_code(404);
        include __DIR__ . '/../src/views/404error.php';
        break;

        // API NUCLEOS
    case '/api/nucleos/create':
        $nucleos = new App\Controllers\NucleoController();
        $nucleos->create();
        break;
    case '/api/nucleos/all':
        $nucleos = new App\Controllers\NucleoController();
        $nucleos->getAll();
        break;
    case '/api/nucleos/details':
        $nucleos = new App\Controllers\NucleoController();
        $nucleos->getDetails();
        break;
    case '/api/nucleos/update':
        $nucleos = new App\Controllers\NucleoController();
        $nucleos->update();
        break;
    case '/api/nucleos/delete':
        $nucleos = new App\Controllers\NucleoController();
        $nucleos->delete();
        break;
    case '/api/nucleos/users-available':
        $nucleos = new App\Controllers\NucleoController();
        $nucleos->getAvailableUsers();
        break;
}

