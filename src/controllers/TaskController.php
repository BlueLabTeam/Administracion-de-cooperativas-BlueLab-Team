<?php

namespace App\Controllers;

use App\Models\Task;

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
        error_log("TaskController::create called");

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            error_log("Permission denied - is_admin: " . ($_SESSION['is_admin'] ?? 'NOT_SET'));
            echo json_encode(['success' => false, 'message' => 'No tienes permisos']);
            return;
        }

        try {
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

            $tareaId = $this->taskModel->create(
                $titulo,
                $descripcion,
                $fechaInicio,
                $fechaFin,
                $prioridad,
                $tipoAsignacion,
                $_SESSION['user_id']
            );

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

            echo json_encode([
                'success' => true,
                'message' => 'Tarea creada y asignada exitosamente',
                'tarea_id' => $tareaId
            ]);

        } catch (\Exception $e) {
            error_log("Error al crear tarea: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            echo json_encode(['success' => false, 'message' => 'Error al crear la tarea: ' . $e->getMessage()]);
        }
    }

    public function getUserTasks()
    {
        header('Content-Type: application/json');
        error_log("TaskController::getUserTasks called for user: " . ($_SESSION['user_id'] ?? 'NONE'));

        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            return;
        }

        try {
            $incluirFinalizadas = isset($_GET['incluir_finalizadas']) && $_GET['incluir_finalizadas'] === 'true';
            
            $tareasUsuario = $this->taskModel->getUserTasks($_SESSION['user_id'], $incluirFinalizadas);
            $tareasNucleo = $this->taskModel->getNucleoTasks($_SESSION['user_id'], $incluirFinalizadas);
            $pendientesCount = $this->taskModel->getPendingTasksCount($_SESSION['user_id']);

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
            $asignacionId = $_POST['asignacion_id'] ?? '';
            $tipoAsignacion = $_POST['tipo_asignacion'] ?? 'usuario';
            $progreso = intval($_POST['progreso'] ?? 0);
            $estado = $_POST['estado'] ?? null;

            if (empty($asignacionId)) {
                echo json_encode(['success' => false, 'message' => 'ID de asignación requerido']);
                return;
            }

            if ($progreso < 0 || $progreso > 100) {
                echo json_encode(['success' => false, 'message' => 'El progreso debe estar entre 0 y 100']);
                return;
            }

            if ($progreso === 100 && !$estado) {
                $estado = 'completada';
            }

            $this->taskModel->updateProgress($asignacionId, $tipoAsignacion, $progreso, $estado);

            echo json_encode([
                'success' => true,
                'message' => 'Progreso actualizado correctamente'
            ]);

        } catch (\Exception $e) {
            error_log("Error al actualizar progreso: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    public function addAvance()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            return;
        }

        try {
            $tareaId = $_POST['tarea_id'] ?? '';
            $comentario = $_POST['comentario'] ?? '';
            $progresoReportado = intval($_POST['progreso_reportado'] ?? 0);

            if (empty($tareaId) || empty($comentario)) {
                echo json_encode(['success' => false, 'message' => 'Tarea y comentario requeridos']);
                return;
            }

            $archivoPath = null;
            if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../../storage/avances/';
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
            $tareaId = $_POST['tarea_id'] ?? '';

            if (empty($tareaId)) {
                echo json_encode(['success' => false, 'message' => 'ID de tarea requerido']);
                return;
            }

            $this->taskModel->cancelTask($tareaId);

            echo json_encode([
                'success' => true,
                'message' => 'Tarea cancelada exitosamente'
            ]);

        } catch (\Exception $e) {
            error_log("Error al cancelar tarea: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    public function getTaskDetails()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            return;
        }

        try {
            $tareaId = $_GET['tarea_id'] ?? '';

            if (empty($tareaId)) {
                echo json_encode(['success' => false, 'message' => 'ID de tarea requerido']);
                return;
            }

            $detalles = $this->taskModel->getTaskDetails($tareaId);
            $avances = $this->taskModel->getAvances($tareaId);

            if (!$detalles) {
                echo json_encode(['success' => false, 'message' => 'Tarea no encontrada']);
                return;
            }

            echo json_encode([
                'success' => true,
                'tarea' => $detalles,
                'avances' => $avances
            ]);

        } catch (\Exception $e) {
            error_log("Error al obtener detalles: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
}