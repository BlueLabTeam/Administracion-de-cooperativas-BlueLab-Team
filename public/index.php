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
    '/api/pay/firstPay',
    '/api/viviendas/tipos',
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
    '/api/nucleos/users-available',
    '/api/materiales/create',
    '/api/materiales/all',
    '/api/materiales/details',
    '/api/materiales/update',
    '/api/materiales/update-stock',
    '/api/materiales/delete',
    '/api/materiales/search',
    '/api/materiales/assign-task',
    '/api/materiales/task-materials',
    '/api/materiales/remove-from-task',
    '/api/materiales/request',
    '/api/materiales/requests',
    '/api/viviendas/all',
    '/api/viviendas/details',
    '/api/viviendas/create',
    '/api/viviendas/update',
    '/api/viviendas/delete',
    '/api/viviendas/asignar',
    '/api/viviendas/desasignar',
    '/api/viviendas/my-vivienda',
    '/api/horas/iniciar',
    '/api/horas/cerrar',
    '/api/horas/mis-registros',
    '/api/horas/registro-abierto',
    '/api/horas/resumen-semanal',
    '/api/horas/estadisticas',
    '/api/horas/editar',
    '/api/horas/all',
    '/api/horas/aprobar',
    '/api/horas/rechazar',
    '/api/horas/resumen-usuario',
];

// Aplicar middleware según el tipo de ruta
if (in_array($uri, $loginOnlyRoutes)) {
    Herramientas::validarLogin();
} elseif (in_array($uri, $privateRoutes)) {
    Middleware::handle();
}

switch ($uri) {
    // VISTAS
    case '/':
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
        $controller = new App\Controllers\ViewsController();
        $controller->showRegistrarPago();
        break;
    case '/pagoEnviado':
        $controller = new App\Controllers\ViewsController();
        $controller->showSalaEspera();
        break;

    // API AUTH
    case '/api/login':
        (new App\Controllers\AuthController())->login();
        break;
    case '/api/register':
        (new App\Controllers\AuthController())->register();
        break;
    case '/api/logout':
        (new App\Controllers\AuthController())->logout();
        break;

    // API PAGOS
    case '/api/pay/firstPay':
        (new App\Controllers\PaymentsController())->addPay();
        break;
    case '/api/payment/approve':
        (new App\Controllers\PaymentsController())->approvePayment();
        break;
    case '/api/payment/reject':
        (new App\Controllers\PaymentsController())->rejectPayment();
        break;

    // API NOTIFICACIONES
    case '/api/notifications/create':
        (new App\Controllers\NotificationController())->create();
        break;
    case '/api/notifications/user':
        (new App\Controllers\NotificationController())->getUserNotifications();
        break;
    case '/api/notifications/mark-read':
        (new App\Controllers\NotificationController())->markAsRead();
        break;
    case '/api/notifications/users':
        (new App\Controllers\NotificationController())->getUsers();
        break;

    // API TAREAS
    case '/api/tasks/create':
        (new App\Controllers\TaskController())->create();
        break;
    case '/api/tasks/user':
        (new App\Controllers\TaskController())->getUserTasks();
        break;
    case '/api/tasks/all':
        (new App\Controllers\TaskController())->getAllTasks();
        break;
    case '/api/tasks/update-progress':
        (new App\Controllers\TaskController())->updateProgress();
        break;
    case '/api/tasks/add-avance':
        $tareaId = $_POST['id_tarea'] ?? null;
        $userId = $_POST['id_usuario'] ?? null;
        $comentario = $_POST['comentario'] ?? null;
        $progreso = $_POST['progreso_reportado'] ?? 0;
        $archivo = $_FILES['archivo']['name'] ?? null;
        if ($tareaId && $userId && $comentario) {
            (new App\Controllers\TaskController())->addAvance($tareaId, $userId, $comentario, $progreso, $archivo);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan parámetros']);
        }
        break;
    case '/api/tasks/details':
        (new App\Controllers\TaskController())->getTaskDetails();
        break;
    case '/api/tasks/users':
        (new App\Controllers\TaskController())->getUsers();
        break;
    case '/api/tasks/nucleos':
        (new App\Controllers\TaskController())->getNucleos();
        break;
    case '/api/tasks/cancel':
        (new App\Controllers\TaskController())->cancelTask();
        break;

    // API USUARIOS
    case '/api/users/all':
        (new App\Controllers\UserController())->getAllUsers();
        break;
    case '/api/users/details':
        $userId = $_GET['id_usuario'] ?? null;
        if ($userId) {
            (new App\Controllers\UserController())->getUserById($userId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Falta id_usuario']);
        }
        break;

    // API NUCLEOS
    case '/api/nucleos/create':
        (new App\Controllers\NucleoController())->create();
        break;
    case '/api/nucleos/all':
        (new App\Controllers\NucleoController())->getAll();
        break;
    case '/api/nucleos/details':
        (new App\Controllers\NucleoController())->getDetails();
        break;
    case '/api/nucleos/update':
        (new App\Controllers\NucleoController())->update();
        break;
    case '/api/nucleos/delete':
        (new App\Controllers\NucleoController())->delete();
        break;
    case '/api/nucleos/users-available':
        (new App\Controllers\NucleoController())->getAvailableUsers();
        break;

    // API MATERIALES
    case '/api/materiales/create':
        (new App\Controllers\MaterialController())->create();
        break;
    case '/api/materiales/all':
        (new App\Controllers\MaterialController())->getAll();
        break;
    case '/api/materiales/details':
        (new App\Controllers\MaterialController())->getById();
        break;
    case '/api/materiales/update':
        (new App\Controllers\MaterialController())->update();
        break;
    case '/api/materiales/update-stock':
        (new App\Controllers\MaterialController())->updateStock();
        break;
    case '/api/materiales/delete':
        (new App\Controllers\MaterialController())->delete();
        break;
    case '/api/materiales/search':
        (new App\Controllers\MaterialController())->search();
        break;
    case '/api/materiales/assign-task':
        (new App\Controllers\MaterialController())->assignToTask();
        break;
    case '/api/materiales/task-materials':
        (new App\Controllers\MaterialController())->getTaskMaterials();
        break;
    case '/api/materiales/remove-from-task':
        (new App\Controllers\MaterialController())->removeFromTask();
        break;
    case '/api/materiales/request':
        (new App\Controllers\MaterialController())->createRequest();
        break;
    case '/api/materiales/requests':
        (new App\Controllers\MaterialController())->getRequests();
        break;

    // API VIVIENDAS
    case '/api/viviendas/all':
        (new App\Controllers\ViviendaController())->getAll();
        break;
    case '/api/viviendas/details':
        (new App\Controllers\ViviendaController())->getById();
        break;
    case '/api/viviendas/create':
        (new App\Controllers\ViviendaController())->create();
        break;
    case '/api/viviendas/update':
        (new App\Controllers\ViviendaController())->update();
        break;
    case '/api/viviendas/delete':
        (new App\Controllers\ViviendaController())->delete();
        break;
    case '/api/viviendas/asignar':
        (new App\Controllers\ViviendaController())->asignar();
        break;
    case '/api/viviendas/desasignar':
        (new App\Controllers\ViviendaController())->desasignar();
        break;
    case '/api/viviendas/tipos':
        Herramientas::validarLogin();
        (new App\Controllers\ViviendaController())->getTipos();
        break;
    case '/api/viviendas/my-vivienda':
        (new App\Controllers\ViviendaController())->getMyVivienda();
        break;

 
    // API REGISTRO DE HORAS - USUARIO
    case '/api/horas/iniciar':
        (new App\Controllers\RegistroHorasController())->iniciarJornada();
        break;

    case '/api/horas/cerrar':
        (new App\Controllers\RegistroHorasController())->cerrarJornada();
        break;

    case '/api/horas/mis-registros':
        (new App\Controllers\RegistroHorasController())->getMisRegistros();
        break;

    case '/api/horas/registro-abierto':
        (new App\Controllers\RegistroHorasController())->getRegistroAbiertoHoy();
        break;

    case '/api/horas/resumen-semanal':
        (new App\Controllers\RegistroHorasController())->getResumenSemanal();
        break;

    case '/api/horas/estadisticas':
        (new App\Controllers\RegistroHorasController())->getEstadisticasMes();
        break;

    case '/api/horas/editar':
        (new App\Controllers\RegistroHorasController())->editarRegistro();
        break;

    // API REGISTRO DE HORAS - ADMIN
    case '/api/horas/all':
        (new App\Controllers\RegistroHorasController())->getAllRegistros();
        break;

    case '/api/horas/aprobar':
        (new App\Controllers\RegistroHorasController())->aprobarHoras();
        break;

    case '/api/horas/rechazar':
        (new App\Controllers\RegistroHorasController())->rechazarHoras();
        break;

    case '/api/horas/resumen-usuario':
        (new App\Controllers\RegistroHorasController())->getResumenPorUsuario();
        break;

    default:
        http_response_code(404);
        include __DIR__ . '/../src/views/404error.php';
        break;
}