<?php

namespace App\controllers;

use App\models\Task;

class TaskController
{
    private $taskModel;

    public function __construct()
    {
        // Iniciar sesión si no está iniciada
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $this->taskModel = new Task();
        error_log("TaskController initialized - User ID: " . ($_SESSION['user_id'] ?? 'NOT_SET'));
    }

    public function create()
{
    header('Content-Type: application/json');
    error_log("=== TaskController::create INICIO ===");

    if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
        echo json_encode(['success' => false, 'message' => 'No tienes permisos']);
        return;
    }

    try {
        // Log del POST completo
        error_log("POST recibido: " . print_r($_POST, true));
        
        $titulo = $_POST['titulo'] ?? '';
        $descripcion = $_POST['descripcion'] ?? '';
        $fechaInicio = $_POST['fecha_inicio'] ?? '';
        $fechaFin = $_POST['fecha_fin'] ?? '';
        $prioridad = $_POST['prioridad'] ?? 'media';
        $tipoAsignacion = $_POST['tipo_asignacion'] ?? 'usuario';

        if (empty($titulo) || empty($descripcion) || empty($fechaInicio) || empty($fechaFin)) {
            echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
            return;
        }

        if (strtotime($fechaFin) < strtotime($fechaInicio)) {
            echo json_encode(['success' => false, 'message' => 'La fecha de fin debe ser posterior a la fecha de inicio']);
            return;
        }

        // Crear la tarea
        $tareaId = $this->taskModel->create(
            $titulo,
            $descripcion,
            $fechaInicio,
            $fechaFin,
            $prioridad,
            $tipoAsignacion,
            $_SESSION['user_id']
        );

        error_log("Tarea creada con ID: $tareaId");

        // Asignar a usuarios o núcleos
        if ($tipoAsignacion === 'usuario') {
            $usuarios = $_POST['usuarios'] ?? [];
            if (empty($usuarios)) {
                echo json_encode(['success' => false, 'message' => 'Debes seleccionar al menos un usuario']);
                return;
            }
            $this->taskModel->assignToUsers($tareaId, $usuarios);
        } else {
            $nucleos = $_POST['nucleos'] ?? [];
            if (empty($nucleos)) {
                echo json_encode(['success' => false, 'message' => 'Debes seleccionar al menos un núcleo familiar']);
                return;
            }
            $this->taskModel->assignToNucleos($tareaId, $nucleos);
        }

        // PROCESAR MATERIALES
        if (isset($_POST['materiales_json']) && !empty($_POST['materiales_json'])) {
            error_log("=== PROCESANDO MATERIALES ===");
            error_log("materiales_json RAW: " . $_POST['materiales_json']);
            
            $materialesData = json_decode($_POST['materiales_json'], true);
            $jsonError = json_last_error();
            
            if ($jsonError !== JSON_ERROR_NONE) {
                error_log("ERROR JSON: " . json_last_error_msg());
            } else {
                error_log("JSON decodificado OK. Materiales: " . count($materialesData));
                
                if ($materialesData && is_array($materialesData) && count($materialesData) > 0) {
                    $materialModel = new \App\Models\Material();
                    
                    foreach ($materialesData as $material) {
                        error_log("Procesando material: " . print_r($material, true));
                        
                        if (isset($material['id']) && isset($material['cantidad'])) {
                            $materialId = intval($material['id']);
                            $cantidad = intval($material['cantidad']);
                            
                            if ($materialId > 0 && $cantidad > 0) {
                                error_log("Guardando: Material ID=$materialId, Cantidad=$cantidad, Tarea=$tareaId");
                                
                                try {
                                    // Asignar material a la tarea
                                    $resultado = $materialModel->assignToTask($tareaId, $materialId, $cantidad);
                                    error_log("assignToTask resultado: " . ($resultado ? 'OK' : 'FALLO'));
                                    
                                    // Reducir stock
                                    $materialActual = $materialModel->getById($materialId);
                                    if ($materialActual) {
                                        $stockAnterior = intval($materialActual['stock']);
                                        $nuevoStock = max(0, $stockAnterior - $cantidad);
                                        $materialModel->updateStock($materialId, $nuevoStock);
                                        error_log("Stock actualizado: $stockAnterior -> $nuevoStock");
                                    }
                                    
                                } catch (\Exception $e) {
                                    error_log("ERROR guardando material: " . $e->getMessage());
                                    error_log("Stack: " . $e->getTraceAsString());
                                }
                            }
                        }
                    }
                } else {
                    error_log("Array de materiales vacío o inválido");
                }
            }
        } else {
            error_log("No se recibió materiales_json en POST");
        }

        echo json_encode([
            'success' => true,
            'message' => 'Tarea creada y asignada exitosamente',
            'id_tarea' => $tareaId
        ]);

    } catch (\Exception $e) {
        error_log("ERROR CRÍTICO: " . $e->getMessage());
        error_log("Stack: " . $e->getTraceAsString());
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

    public function getUserTasks()
{
    header('Content-Type: application/json');
    
    //  Obtener userId de la sesión (ya autenticado por middleware)
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'No autenticado']);
        return;
    }
    
    $userId = $_SESSION['user_id'];
    error_log("TaskController::getUserTasks called for user: " . $userId);

    try {
        $incluirFinalizadas = isset($_GET['incluir_finalizadas']) && $_GET['incluir_finalizadas'] === 'true';
        
        $tareasUsuario = $this->taskModel->getUserTasks($userId, $incluirFinalizadas);
        $tareasNucleo = $this->taskModel->getNucleoTasks($userId, $incluirFinalizadas);
        $pendientesCount = $this->taskModel->getPendingTasksCount($userId);

        echo json_encode([
            'success' => true,
            'tareas_usuario' => $tareasUsuario,
            'tareas_nucleo' => $tareasNucleo,
            'pendientes_count' => $pendientesCount
        ]);

    } catch (\Exception $e) {
        error_log("Error al obtener tareas: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error al cargar tareas: ' . $e->getMessage()]);
    }
}

    public function updateProgress()
{
    header('Content-Type: application/json');

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'No autenticado']);
        return;
    }

    try {
        //  Extraer datos de POST
        $asignacionId = $_POST['asignacion_id'] ?? null;
        $tipoAsignacion = $_POST['tipo_asignacion'] ?? 'usuario';
        $progreso = isset($_POST['progreso']) ? intval($_POST['progreso']) : null;
        $estado = $_POST['estado'] ?? null;

        //  LOG para debug
        error_log("=== updateProgress DEBUG ===");
        error_log("POST completo: " . print_r($_POST, true));
        error_log("asignacion_id: " . $asignacionId);
        error_log("tipo_asignacion: " . $tipoAsignacion);
        error_log("progreso: " . $progreso);
        error_log("estado: " . $estado);

        //  Validaciones
        if (empty($asignacionId)) {
            echo json_encode(['success' => false, 'message' => 'ID de asignación requerido', 'error' => 'Falta asignacion_id']);
            return;
        }

        if ($progreso === null) {
            echo json_encode(['success' => false, 'message' => 'Progreso requerido', 'error' => 'Falta progreso']);
            return;
        }

        if ($progreso < 0 || $progreso > 100) {
            echo json_encode(['success' => false, 'message' => 'El progreso debe estar entre 0 y 100']);
            return;
        }

        //  Si progreso es 100 y no hay estado, forzar 'completada'
        if ($progreso === 100 && !$estado) {
            $estado = 'completada';
        }

        //  Actualizar en BD
        $result = $this->taskModel->updateProgress($asignacionId, $tipoAsignacion, $progreso, $estado);

        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Progreso actualizado correctamente'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No se pudo actualizar el progreso'
            ]);
        }

    } catch (\Exception $e) {
        error_log("Error al actualizar progreso: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}
   public function addAvance()
{
    header('Content-Type: application/json');

    //  LOGS DE DEBUG
    error_log("=== addAvance DEBUG ===");
    error_log("POST completo: " . print_r($_POST, true));
    error_log("FILES completo: " . print_r($_FILES, true));

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'No autenticado']);
        return;
    }

    try {
        $tareaId = $_POST['id_tarea'] ?? '';
        $comentario = $_POST['comentario'] ?? '';
        $progresoReportado = intval($_POST['progreso_reportado'] ?? 0);

        if (empty($tareaId) || empty($comentario)) {
            echo json_encode([
                'success' => false, 
                'message' => 'Tarea y comentario requeridos',
                'error' => 'Faltan parametros',
                'debug' => [
                    'id_tarea' => $tareaId,
                    'comentario' => $comentario,
                    'progreso_reportado' => $progresoReportado,
                    'post_keys' => array_keys($_POST)
                ]
            ]);
            return;
        } 

        $archivoPath = null;
        if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = _DIR_ . '/../../storage/avances/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $extension = strtolower(pathinfo($_FILES['archivo']['name'], PATHINFO_EXTENSION));
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];

            if (in_array($extension, $allowedExtensions)) {
                $fileName = 'avance_' . time() . '_' . uniqid() . '.' . $extension;
                $targetPath = $uploadDir . $fileName;

                if (move_uploaded_file($_FILES['archivo']['tmp_name'], $targetPath)) {
                    $archivoPath = 'avances/' . $fileName;
                }
            }
        }

        //  AHORA SÍ SE EJECUTA EL MODELO
        $this->taskModel->addAvance(
            $tareaId,
            $_SESSION['user_id'],
            $comentario,
            $progresoReportado,
            $archivoPath
        );

        echo json_encode([
            'success' => true,
            'message' => 'Avance registrado correctamente'
        ]);

    } catch (\Exception $e) {
        error_log("Error al agregar avance: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
}


    public function getAllTasks()
    {
        header('Content-Type: application/json');
        error_log("TaskController::getAllTasks called");

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            echo json_encode(['success' => false, 'message' => 'No tienes permisos']);
            return;
        }

        try {
            $filtroEstado = $_GET['estado'] ?? null;
            $tareas = $this->taskModel->getAllTasks($filtroEstado);

            echo json_encode([
                'success' => true,
                'tareas' => $tareas
            ]);

        } catch (\Exception $e) {
            error_log("Error al obtener todas las tareas: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    public function getNucleos()
    {
        header('Content-Type: application/json');
        error_log("TaskController::getNucleos called");

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            echo json_encode(['success' => false, 'message' => 'No tienes permisos']);
            return;
        }

        try {
            $nucleos = $this->taskModel->getAllNucleos();

            echo json_encode([
                'success' => true,
                'nucleos' => $nucleos
            ]);

        } catch (\Exception $e) {
            error_log("Error al obtener núcleos: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    public function getUsers()
    {
        header('Content-Type: application/json');
        
        // DEBUG: Agregar log al inicio
        error_log("=== TaskController::getUsers INICIO ===");
        error_log("Method: " . $_SERVER['REQUEST_METHOD']);
        error_log("is_admin: " . ($_SESSION['is_admin'] ?? 'NOT_SET'));
        error_log("user_id: " . ($_SESSION['user_id'] ?? 'NOT_SET'));

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            error_log("Permission denied in getUsers");
            echo json_encode(['success' => false, 'message' => 'No tienes permisos']);
            return;
        }

        try {
            error_log("Calling taskModel->getAllUsers()");
            $usuarios = $this->taskModel->getAllUsers();
            error_log("Found " . count($usuarios) . " users");

            echo json_encode([
                'success' => true,
                'usuarios' => $usuarios
            ]);

        } catch (\Exception $e) {
            error_log("Error al obtener usuarios: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    public function cancelTask()
{
    header('Content-Type: application/json');

    if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
        echo json_encode(['success' => false, 'message' => 'No tienes permisos']);
        return;
    }

    try {
        //  El parámetro viene como 'id_tarea' desde JavaScript
        $tareaId = $_POST['id_tarea'] ?? null;

        error_log("=== cancelTask DEBUG ===");
        error_log("POST completo: " . print_r($_POST, true));
        error_log("id_tarea recibido: " . $tareaId);

        if (empty($tareaId)) {
            echo json_encode([
                'success' => false, 
                'message' => 'ID de tarea requerido',
                'debug' => 'POST recibido: ' . json_encode($_POST)
            ]);
            return;
        }

        $result = $this->taskModel->cancelTask($tareaId);

        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Tarea cancelada exitosamente'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No se pudo cancelar la tarea'
            ]);
        }

    } catch (\Exception $e) {
        error_log("Error al cancelar tarea: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

   public function getTaskDetails()
{
    header('Content-Type: application/json');

    //  Usuarios también pueden ver detalles de sus propias tareas
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'No autenticado']);
        return;
    }

    try {
        //  El parámetro viene como 'id_tarea' en GET
        $tareaId = $_GET['id_tarea'] ?? null;

        error_log("=== getTaskDetails DEBUG ===");
        error_log("GET completo: " . print_r($_GET, true));
        error_log("id_tarea recibido: " . $tareaId);

        if (empty($tareaId)) {
            echo json_encode([
                'success' => false, 
                'message' => 'ID de tarea requerido',
                'debug' => 'GET recibido: ' . json_encode($_GET)
            ]);
            return;
        }

        $tarea = $this->taskModel->getTaskDetails($tareaId);

        if (!$tarea) {
            echo json_encode([
                'success' => false,
                'message' => 'Tarea no encontrada'
            ]);
            return;
        }

        $avances = $this->taskModel->getAvances($tareaId);

        echo json_encode([
            'success' => true,
            'tarea' => $tarea,
            'avances' => $avances
        ]);

    } catch (\Exception $e) {
        error_log("Error al obtener detalles: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}
}


