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
    '/api/debug/mis-cuotas',
    '/api/test/generar-cuota-simple',
];

// Aplicar middleware segun el tipo de ruta
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
            echo json_encode(['error' => 'Faltan parametros']);
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
    case '/api/users/my-profile':
        (new App\Controllers\UserController())->getMyProfile();
        break;
    case '/api/users/update-profile':
        (new App\Controllers\UserController())->updateProfile();
        break;
    case '/api/users/aprobar-rechazar':
        (new App\Controllers\UserController())->aprobarRechazar();
        break;
        case '/api/users/payment-details':
    (new App\Controllers\UserController())->getPaymentDetails();
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
    case '/api/nucleos/disponibles':
        (new App\Controllers\NucleoController())->getNucleosDisponibles();
        break;
    case '/api/nucleos/solicitar-unirse':
        (new App\Controllers\NucleoController())->solicitarUnirse();
        break;
    case '/api/nucleos/mis-solicitudes':
        (new App\Controllers\NucleoController())->getMisSolicitudesNucleo();
        break;
    case '/api/nucleos/cancelar-solicitud':
        (new App\Controllers\NucleoController())->cancelarSolicitudNucleo();
        break;
    case '/api/nucleos/solicitudes-pendientes':
        (new App\Controllers\NucleoController())->getSolicitudesPendientesAdmin();
        break;
    case '/api/nucleos/aprobar-solicitud':
        (new App\Controllers\NucleoController())->aprobarSolicitudNucleo();
        break;
    case '/api/nucleos/rechazar-solicitud':
        (new App\Controllers\NucleoController())->rechazarSolicitudNucleo();
        break;
    case '/api/nucleos/mi-nucleo-info':
        (new App\Controllers\NucleoController())->getMiNucleoInfo();
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

    // API DEUDA DE HORAS
    case '/api/horas/deuda-actual':
        (new App\Controllers\DeudaHorasController())->getDeudaActual();
        break;
    case '/api/horas/historial-mensual':
        (new App\Controllers\DeudaHorasController())->getHistorialMensual();
        break;

    // API CUOTAS - USUARIO
    case '/api/cuotas/mis-cuotas':
        (new App\Controllers\CuotaController())->getMisCuotas();
        break;
    case '/api/cuotas/detalle':
        (new App\Controllers\CuotaController())->getDetalleCuota();
        break;
    case '/api/cuotas/generar-mi-cuota':
        (new App\Controllers\CuotaController())->generarMiCuota();
        break;
    case '/api/cuotas/verificar-cuota-mes':
        (new App\Controllers\CuotaController())->verificarCuotaMes();
        break;
    case '/api/cuotas/pagar':
        (new App\Controllers\CuotaController())->pagarCuota();
        break;
    case '/api/cuotas/verificar-auto':
        (new App\Controllers\CuotaController())->verificarYGenerarCuotaAuto();
        break;

    // API CUOTAS - ADMIN
    case '/api/cuotas/all':
        (new App\Controllers\CuotaController())->getAllCuotas();
        break;
    case '/api/cuotas/validar-pago':
        (new App\Controllers\CuotaController())->validarPago();
        break;
    case '/api/cuotas/generar-masivas':
        (new App\Controllers\CuotaController())->generarCuotasMasivas();
        break;
    case '/api/cuotas/estadisticas':
        (new App\Controllers\CuotaController())->getEstadisticas();
        break;
    case '/api/cuotas/precios':
        (new App\Controllers\CuotaController())->getPreciosActuales();
        break;
    case '/api/cuotas/actualizar-precio':
        (new App\Controllers\CuotaController())->actualizarPrecio();
        break;

    // API SOLICITUDES - USUARIO
    case '/api/solicitudes/create':
        (new App\Controllers\SolicitudController())->create();
        break;
    case '/api/solicitudes/mis-solicitudes':
        (new App\Controllers\SolicitudController())->getMisSolicitudes();
        break;
    case '/api/solicitudes/detalle':
        (new App\Controllers\SolicitudController())->getDetalle();
        break;
    case '/api/solicitudes/responder':
        (new App\Controllers\SolicitudController())->addRespuesta();
        break;
    
    // API SOLICITUDES - ADMIN
    case '/api/solicitudes/all':
        (new App\Controllers\SolicitudController())->getAllSolicitudes();
        break;
    case '/api/solicitudes/update-estado':
        (new App\Controllers\SolicitudController())->updateEstado();
        break;
    case '/api/solicitudes/estadisticas':
        (new App\Controllers\SolicitudController())->getEstadisticas();
        break;

    // API JUSTIFICACIONES DE HORAS
    case '/api/justificaciones/crear':
        (new App\Controllers\JustificacionHorasController())->crearJustificacion();
        break;
    case '/api/justificaciones/usuario':
        (new App\Controllers\JustificacionHorasController())->getJustificacionesUsuario();
        break;
    case '/api/justificaciones/eliminar':
        (new App\Controllers\JustificacionHorasController())->eliminarJustificacion();
        break;

    // API REPORTES - ADMIN
    case '/api/reporte/mensual':
        (new App\Controllers\ReporteController())->generarReporteMensual();
        break;
    case '/api/reporte/horas':
        (new App\Controllers\ReporteController())->getResumenHorasMensual();
        break;
    case '/api/reporte/tareas':
        (new App\Controllers\ReporteController())->getResumenTareasMensual();
        break;
    case '/api/reporte/cuotas':
        (new App\Controllers\ReporteController())->getResumenCuotasMensual();
        break;
    case '/api/reporte/estadisticas':
        (new App\Controllers\ReporteController())->getEstadisticasGenerales();
        break;
    case '/api/reporte/exportar':
        (new App\Controllers\ReporteController())->exportarReporteMensual();
        break;

    // DEBUG: Verificar cuotas del usuario
    case '/api/debug/mis-cuotas':
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');
        
        try {
            if (!isset($_SESSION['user_id'])) {
                echo json_encode(['error' => 'No autenticado'], JSON_UNESCAPED_UNICODE);
                exit();
            }
            
            $userId = $_SESSION['user_id'];
            $pdo = \App\config\Database::getConnection();
            
            // 1. Verificar usuario
            $stmtUser = $pdo->prepare("SELECT * FROM Usuario WHERE id_usuario = ?");
            $stmtUser->execute([$userId]);
            $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
            
            // 2. Buscar cuotas directamente
            $stmtCuotas = $pdo->prepare("
                SELECT * FROM Cuotas_Mensuales 
                WHERE id_usuario = ? 
                ORDER BY anio DESC, mes DESC
            ");
            $stmtCuotas->execute([$userId]);
            $cuotasDirectas = $stmtCuotas->fetchAll(PDO::FETCH_ASSOC);
            
            // 3. Buscar desde vista
            $stmtVista = $pdo->prepare("
                SELECT * FROM Vista_Cuotas_Con_Justificaciones 
                WHERE id_usuario = ? 
                ORDER BY anio DESC, mes DESC
            ");
            $stmtVista->execute([$userId]);
            $cuotasVista = $stmtVista->fetchAll(PDO::FETCH_ASSOC);
            
            // 4. Verificar vivienda
            $stmtVivienda = $pdo->prepare("
                SELECT av.*, v.numero_vivienda, v.id_tipo
                FROM Asignacion_Vivienda av
                LEFT JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                WHERE (av.id_usuario = ? OR av.id_nucleo = (
                    SELECT id_nucleo FROM Usuario WHERE id_usuario = ?
                ))
                AND av.activa = 1
            ");
            $stmtVivienda->execute([$userId, $userId]);
            $vivienda = $stmtVivienda->fetch(PDO::FETCH_ASSOC);
            
            // 5. Verificar configuracion de precios
            $stmtPrecios = $pdo->prepare("
                SELECT cc.*, tv.nombre as tipo_nombre
                FROM Config_Cuotas cc
                INNER JOIN Tipo_Vivienda tv ON cc.id_tipo = tv.id_tipo
                WHERE cc.activo = 1
            ");
            $stmtPrecios->execute();
            $precios = $stmtPrecios->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'usuario' => [
                    'id' => $user['id_usuario'],
                    'nombre' => $user['nombre_completo'],
                    'estado' => $user['estado'],
                    'id_nucleo' => $user['id_nucleo']
                ],
                'vivienda' => $vivienda ?: null,
                'precios_configurados' => $precios,
                'cuotas_tabla_directa' => [
                    'count' => count($cuotasDirectas),
                    'data' => $cuotasDirectas
                ],
                'cuotas_vista' => [
                    'count' => count($cuotasVista),
                    'data' => $cuotasVista
                ],
                'mes_actual' => date('n'),
                'anio_actual' => date('Y')
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log("Error en debug: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => 'Error interno',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], JSON_UNESCAPED_UNICODE);
        }
        
        exit();

    // TEST: Endpoint simple para generar cuota
    case '/api/test/generar-cuota-simple':
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');
        
        try {
            if (!isset($_SESSION['user_id'])) {
                echo json_encode(['error' => 'No autenticado']);
                exit();
            }
            
            $userId = $_SESSION['user_id'];
            $mes = intval($_POST['mes'] ?? date('n'));
            $anio = intval($_POST['anio'] ?? date('Y'));
            
            error_log("=== TEST GENERAR CUOTA ===");
            error_log("Usuario: $userId | Mes: $mes | Anio: $anio");
            
            $cuotaModel = new \App\Models\Cuota();
            $resultado = $cuotaModel->generarCuotaIndividual($userId, $mes, $anio);
            
            error_log("Resultado: " . json_encode($resultado));
            
            echo json_encode($resultado, JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log("ERROR: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
        
        exit();

    default:
        http_response_code(404);
        include __DIR__ . '/../src/views/404error.php';
        break;
}