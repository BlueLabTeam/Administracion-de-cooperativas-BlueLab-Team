<?php
date_default_timezone_set('America/Montevideo');

require __DIR__ . '/../vendor/autoload.php';

use App\middlewares\Middleware;
use App\utils\Herramientas;

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Manejo de archivos estaticos ANTES de iniciar sesion
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

// Rutas que solo requieren login (no validacion de estado)
$loginOnlyRoutes = [
    '/api/pay/firstPay',
    '/api/viviendas/tipos',
    '/api/users/my-profile',       
    '/api/users/update-profile',
];

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
    '/api/users/aprobar-rechazar',
    '/api/users/details',
    '/api/users/payment-details',
    '/api/users/fecha-mas-antigua',
    '/api/nucleos/create',      
    '/api/nucleos/all',            
    '/api/nucleos/details',        
    '/api/nucleos/update',       
    '/api/nucleos/delete',       
    '/api/nucleos/users-available',
    '/api/nucleos/disponibles',
    '/api/nucleos/solicitar-unirse',
    '/api/nucleos/mi-nucleo-info',
    '/api/nucleos/mis-solicitudes',
    '/api/nucleos/cancelar-solicitud',
    '/api/nucleos/solicitudes-pendientes',
    '/api/nucleos/aprobar-solicitud',
    '/api/nucleos/rechazar-solicitud',
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
    '/api/horas/deuda-actual',       
    '/api/horas/historial-mensual',
    '/api/cuotas/mis-cuotas',
    '/api/cuotas/detalle',
    '/api/cuotas/pagar',
    '/api/cuotas/verificar-cuota-mes',
    '/api/cuotas/generar-mi-cuota',
    '/api/cuotas/all',
    '/api/cuotas/validar-pago',
    '/api/cuotas/generar-masivas',
    '/api/cuotas/estadisticas',
    '/api/cuotas/precios',
    '/api/cuotas/verificar-auto',
    '/api/cuotas/actualizar-precio',
    '/api/solicitudes/create',
    '/api/solicitudes/mis-solicitudes',
    '/api/solicitudes/detalle',
    '/api/solicitudes/responder',
    '/api/solicitudes/all',
    '/api/solicitudes/update-estado',
    '/api/solicitudes/estadisticas',
    '/api/justificaciones/crear',
    '/api/justificaciones/usuario',
    '/api/justificaciones/eliminar',
    '/api/reporte/mensual',
    '/api/reporte/horas',
    '/api/reporte/tareas',
    '/api/reporte/cuotas',
    '/api/reporte/estadisticas',
    '/api/reporte/exportar',
];


if (in_array($uri, $loginOnlyRoutes)) {
    Herramientas::validarLogin();
} elseif (in_array($uri, $privateRoutes)) {
    Middleware::handle();
}

switch ($uri) {
    // VISTAS
    case '/':
        $controller = new App\controllers\ViewsController();
        $controller->index();
        break;
    case '/home':
        $controller = new App\controllers\ViewsController();
        $controller->index();
        break;
    case '/login':
        $controller = new App\controllers\ViewsController();
        $controller->showLoginForm();
        break;
    case '/register':
        $controller = new App\controllers\ViewsController();
        $controller->showRegistrationForm();
        break;
    case '/dashboard':
        $controller = new App\controllers\ViewsController();
        $controller->showDashboard();
        break;
    case '/dashboard-admin':
        $controller = new App\controllers\ViewsController();
        $controller->showDashboardAdmin();
        break;
    case '/pagoPendiente':
        $controller = new App\controllers\ViewsController();
        $controller->showRegistrarPago();
        break;
    case '/pagoEnviado':
        $controller = new App\controllers\ViewsController();
        $controller->showSalaEspera();
        break;

    // API AUTH
    case '/api/login':
        (new App\controllers\AuthController())->login();
        break;
    case '/api/register':
        (new App\controllers\AuthController())->register();
        break;
    case '/api/logout':
        (new App\controllers\AuthController())->logout();
        break;

    // API PAGOS
    case '/api/pay/firstPay':
        (new App\controllers\PaymentsController())->addPay();
        break;
    case '/api/payment/approve':
        (new App\controllers\PaymentsController())->approvePayment();
        break;
    case '/api/payment/reject':
        (new App\controllers\PaymentsController())->rejectPayment();
        break;

    // API NOTIFICACIONES
    case '/api/notifications/create':
        (new App\controllers\NotificationController())->create();
        break;
    case '/api/notifications/user':
        (new App\controllers\NotificationController())->getUserNotifications();
        break;
    case '/api/notifications/mark-read':
        (new App\controllers\NotificationController())->markAsRead();
        break;
    case '/api/notifications/users':
        (new App\controllers\NotificationController())->getUsers();
        break;

    // API TAREAS
    case '/api/tasks/create':
        (new App\controllers\TaskController())->create();
        break;
    case '/api/tasks/user':
        (new App\controllers\TaskController())->getUserTasks();
        break;
    case '/api/tasks/all':
        (new App\controllers\TaskController())->getAllTasks();
        break;
    case '/api/tasks/update-progress':
        (new App\controllers\TaskController())->updateProgress();
        break;
    case '/api/tasks/add-avance':
        $tareaId = $_POST['id_tarea'] ?? null;
        $userId = $_POST['id_usuario'] ?? null;
        $comentario = $_POST['comentario'] ?? null;
        $progreso = $_POST['progreso_reportado'] ?? 0;
        $archivo = $_FILES['archivo']['name'] ?? null;
        if ($tareaId && $userId && $comentario) {
            (new App\controllers\TaskController())->addAvance($tareaId, $userId, $comentario, $progreso, $archivo);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan parametros']);
        }
        break;
    case '/api/tasks/details':
        (new App\controllers\TaskController())->getTaskDetails();
        break;
    case '/api/tasks/users':
        (new App\controllers\TaskController())->getUsers();
        break;
    case '/api/tasks/nucleos':
        (new App\controllers\TaskController())->getNucleos();
        break;
    case '/api/tasks/cancel':
        (new App\controllers\TaskController())->cancelTask();
        break;

    // API USUARIOS
    case '/api/users/all':
        (new App\controllers\UserController())->getAllUsers();
        break;
    case '/api/users/details':
        $userId = $_GET['id_usuario'] ?? null;
        if ($userId) {
            (new App\controllers\UserController())->getUserById($userId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Falta id_usuario']);
        }
        break;
    case '/api/users/my-profile':
        (new App\controllers\UserController())->getMyProfile();
        break;
    case '/api/users/update-profile':
        (new App\controllers\UserController())->updateProfile();
        break;
    case '/api/users/aprobar-rechazar':
        (new App\controllers\UserController())->aprobarRechazar();
        break;
        case '/api/users/payment-details':
    (new App\controllers\UserController())->getPaymentDetails();
    break;
    
    case '/api/users/fecha-mas-antigua':
    (new App\controllers\UserController())->getFechaMasAntigua();
    break;

    // API NUCLEOS
    case '/api/nucleos/create':
        (new App\controllers\NucleoController())->create();
        break;
    case '/api/nucleos/all':
        (new App\controllers\NucleoController())->getAll();
        break;
    case '/api/nucleos/details':
        (new App\controllers\NucleoController())->getDetails();
        break;
    case '/api/nucleos/update':
        (new App\controllers\NucleoController())->update();
        break;
    case '/api/nucleos/delete':
        (new App\controllers\NucleoController())->delete();
        break;
    case '/api/nucleos/users-available':
        (new App\controllers\NucleoController())->getAvailableUsers();
        break;
    case '/api/nucleos/disponibles':
        (new App\controllers\NucleoController())->getNucleosDisponibles();
        break;
    case '/api/nucleos/solicitar-unirse':
        (new App\controllers\NucleoController())->solicitarUnirse();
        break;
    case '/api/nucleos/mis-solicitudes':
        (new App\controllers\NucleoController())->getMisSolicitudesNucleo();
        break;
    case '/api/nucleos/cancelar-solicitud':
        (new App\controllers\NucleoController())->cancelarSolicitudNucleo();
        break;
    case '/api/nucleos/solicitudes-pendientes':
        (new App\controllers\NucleoController())->getSolicitudesPendientesAdmin();
        break;
    case '/api/nucleos/aprobar-solicitud':
        (new App\controllers\NucleoController())->aprobarSolicitudNucleo();
        break;
    case '/api/nucleos/rechazar-solicitud':
        (new App\controllers\NucleoController())->rechazarSolicitudNucleo();
        break;
    case '/api/nucleos/mi-nucleo-info':
        (new App\controllers\NucleoController())->getMiNucleoInfo();
        break;
        
    // API MATERIALES
    case '/api/materiales/create':
        (new App\controllers\MaterialController())->create();
        break;
    case '/api/materiales/all':
        (new App\controllers\MaterialController())->getAll();
        break;
    case '/api/materiales/details':
        (new App\controllers\MaterialController())->getById();
        break;
    case '/api/materiales/update':
        (new App\controllers\MaterialController())->update();
        break;
    case '/api/materiales/update-stock':
        (new App\controllers\MaterialController())->updateStock();
        break;
    case '/api/materiales/delete':
        (new App\controllers\MaterialController())->delete();
        break;
    case '/api/materiales/search':
        (new App\controllers\MaterialController())->search();
        break;
    case '/api/materiales/assign-task':
        (new App\controllers\MaterialController())->assignToTask();
        break;
    case '/api/materiales/task-materials':
        (new App\controllers\MaterialController())->getTaskMaterials();
        break;
    case '/api/materiales/remove-from-task':
        (new App\controllers\MaterialController())->removeFromTask();
        break;
    case '/api/materiales/request':
        (new App\controllers\MaterialController())->createRequest();
        break;
    case '/api/materiales/requests':
        (new App\controllers\MaterialController())->getRequests();
        break;

    // API VIVIENDAS
    case '/api/viviendas/all':
        (new App\controllers\ViviendaController())->getAll();
        break;
    case '/api/viviendas/details':
        (new App\controllers\ViviendaController())->getById();
        break;
    case '/api/viviendas/create':
        (new App\controllers\ViviendaController())->create();
        break;
    case '/api/viviendas/update':
        (new App\controllers\ViviendaController())->update();
        break;
    case '/api/viviendas/delete':
        (new App\controllers\ViviendaController())->delete();
        break;
    case '/api/viviendas/asignar':
        (new App\controllers\ViviendaController())->asignar();
        break;
    case '/api/viviendas/desasignar':
        (new App\controllers\ViviendaController())->desasignar();
        break;
    case '/api/viviendas/tipos':
        Herramientas::validarLogin();
        (new App\controllers\ViviendaController())->getTipos();
        break;
    case '/api/viviendas/my-vivienda':
        (new App\controllers\ViviendaController())->getMyVivienda();
        break;

    // API REGISTRO DE HORAS - USUARIO
    case '/api/horas/iniciar':
        (new App\controllers\RegistroHorasController())->iniciarJornada();
        break;
    case '/api/horas/cerrar':
        (new App\controllers\RegistroHorasController())->cerrarJornada();
        break;
    case '/api/horas/mis-registros':
        (new App\controllers\RegistroHorasController())->getMisRegistros();
        break;
    case '/api/horas/registro-abierto':
        (new App\controllers\RegistroHorasController())->getRegistroAbiertoHoy();
        break;
    case '/api/horas/resumen-semanal':
        (new App\controllers\RegistroHorasController())->getResumenSemanal();
        break;
    case '/api/horas/estadisticas':
        (new App\controllers\RegistroHorasController())->getEstadisticasMes();
        break;
    case '/api/horas/editar':
        (new App\controllers\RegistroHorasController())->editarRegistro();
        break;

    // API REGISTRO DE HORAS - ADMIN
    case '/api/horas/all':
        (new App\controllers\RegistroHorasController())->getAllRegistros();
        break;
    case '/api/horas/aprobar':
        (new App\controllers\RegistroHorasController())->aprobarHoras();
        break;
    case '/api/horas/rechazar':
        (new App\controllers\RegistroHorasController())->rechazarHoras();
        break;
    case '/api/horas/resumen-usuario':
        (new App\controllers\RegistroHorasController())->getResumenPorUsuario();
        break;

    // API DEUDA DE HORAS
    case '/api/horas/deuda-actual':
        (new App\controllers\DeudaHorasController())->getDeudaActual();
        break;
    case '/api/horas/historial-mensual':
        (new App\controllers\DeudaHorasController())->getHistorialMensual();
        break;

    // API CUOTAS - USUARIO
    case '/api/cuotas/mis-cuotas':
        (new App\controllers\CuotaController())->getMisCuotas();
        break;
    case '/api/cuotas/detalle':
        (new App\controllers\CuotaController())->getDetalleCuota();
        break;
    case '/api/cuotas/generar-mi-cuota':
        (new App\controllers\CuotaController())->generarMiCuota();
        break;
    case '/api/cuotas/verificar-cuota-mes':
        (new App\controllers\CuotaController())->verificarCuotaMes();
        break;
    case '/api/cuotas/pagar':
        (new App\controllers\CuotaController())->pagarCuota();
        break;
    case '/api/cuotas/verificar-auto':
        (new App\controllers\CuotaController())->verificarYGenerarCuotaAuto();
        break;

    // API CUOTAS - ADMIN
    case '/api/cuotas/all':
        (new App\controllers\CuotaController())->getAllCuotas();
        break;
    case '/api/cuotas/validar-pago':
        (new App\controllers\CuotaController())->validarPago();
        break;
    case '/api/cuotas/generar-masivas':
        (new App\controllers\CuotaController())->generarCuotasMasivas();
        break;
    case '/api/cuotas/estadisticas':
        (new App\controllers\CuotaController())->getEstadisticas();
        break;
    case '/api/cuotas/precios':
        (new App\controllers\CuotaController())->getPreciosActuales();
        break;
    case '/api/cuotas/actualizar-precio':
        (new App\controllers\CuotaController())->actualizarPrecio();
        break;

    // API SOLICITUDES - USUARIO
    case '/api/solicitudes/create':
        (new App\controllers\SolicitudController())->create();
        break;
    case '/api/solicitudes/mis-solicitudes':
        (new App\controllers\SolicitudController())->getMisSolicitudes();
        break;
    case '/api/solicitudes/detalle':
        (new App\controllers\SolicitudController())->getDetalle();
        break;
    case '/api/solicitudes/responder':
        (new App\controllers\SolicitudController())->addRespuesta();
        break;
    
    // API SOLICITUDES - ADMIN
    case '/api/solicitudes/all':
        (new App\controllers\SolicitudController())->getAllSolicitudes();
        break;
    case '/api/solicitudes/update-estado':
        (new App\controllers\SolicitudController())->updateEstado();
        break;
    case '/api/solicitudes/estadisticas':
        (new App\controllers\SolicitudController())->getEstadisticas();
        break;

    // API JUSTIFICACIONES DE HORAS
    case '/api/justificaciones/crear':
        (new App\controllers\JustificacionHorasController())->crearJustificacion();
        break;
    case '/api/justificaciones/usuario':
        (new App\controllers\JustificacionHorasController())->getJustificacionesUsuario();
        break;
    case '/api/justificaciones/eliminar':
        (new App\controllers\JustificacionHorasController())->eliminarJustificacion();
        break;

    // API REPORTES - ADMIN
    case '/api/reporte/mensual':
        (new App\controllers\ReporteController())->generarReporteMensual();
        break;
    case '/api/reporte/horas':
        (new App\controllers\ReporteController())->getResumenHorasMensual();
        break;
    case '/api/reporte/tareas':
        (new App\controllers\ReporteController())->getResumenTareasMensual();
        break;
    case '/api/reporte/cuotas':
        (new App\controllers\ReporteController())->getResumenCuotasMensual();
        break;
    case '/api/reporte/estadisticas':
        (new App\controllers\ReporteController())->getEstadisticasGenerales();
        break;
    case '/api/reporte/exportar':
        (new App\controllers\ReporteController())->exportarReporteMensual();
        break;

    



    default:
        http_response_code(404);
        include __DIR__ . '/../src/views/404error.php';
        break;
}