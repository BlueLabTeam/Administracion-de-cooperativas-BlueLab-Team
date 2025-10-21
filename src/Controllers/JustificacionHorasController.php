<?php

namespace App\Controllers;

use App\Models\JustificacionHoras;

class JustificacionHorasController
{
    private $justificacionModel;

    public function __construct()
    {
        // Limpiar output previo
        while (ob_get_level()) {
            ob_end_clean();
        }
        ob_start();
        
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $this->justificacionModel = new JustificacionHoras();
    }

    /**
     * Crear justificación de horas
     * ENDPOINT: POST /api/justificaciones/crear
     */
    public function crearJustificacion()
    
          {
       
    try {
        ob_clean();
        header('Content-Type: application/json; charset=utf-8');

        error_log("=== crearJustificacion INICIADO ===");
        error_log("POST: " . json_encode($_POST));
        error_log("SESSION user_id: " . ($_SESSION['user_id'] ?? 'NO SET'));
        error_log("SESSION is_admin: " . ($_SESSION['is_admin'] ?? 'NO SET'));

        // Verificar sesión
        if (!isset($_SESSION['user_id'])) {
            error_log("❌ No hay user_id en sesión");
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Sesión no iniciada'
            ]);
            exit();
        }

        // Verificar que sea admin
        $isAdmin = ($_SESSION['is_admin'] ?? false) || ($_SESSION['id_rol'] ?? 0) == 1;
        
        if (!$isAdmin) {
            error_log("❌ Usuario no es admin. id_rol: " . ($_SESSION['id_rol'] ?? 'NO SET') . ", is_admin: " . ($_SESSION['is_admin'] ?? 'NO SET'));
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'No tienes permisos de administrador'
            ]);
            exit();
        }

        error_log("✅ Permisos OK");

            // Validar datos requeridos
            $requiredFields = ['id_usuario', 'mes', 'anio', 'horas_justificadas', 'motivo'];
            foreach ($requiredFields as $field) {
                if (!isset($_POST[$field])) {
                    error_log("❌ Campo faltante: $field");
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => "Campo requerido faltante: $field"
                    ]);
                    exit();
                }
            }

            $idUsuario = intval($_POST['id_usuario']);
            $mes = intval($_POST['mes']);
            $anio = intval($_POST['anio']);
            $horasJustificadas = floatval($_POST['horas_justificadas']);
            $motivo = trim($_POST['motivo']);
            $observaciones = isset($_POST['observaciones']) ? trim($_POST['observaciones']) : null;
            $idAdmin = $_SESSION['user_id'];

            error_log("✅ Datos validados: $horasJustificadas horas para usuario $idUsuario");

            // Validar horas
            if ($horasJustificadas <= 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Las horas deben ser mayor a 0'
                ]);
                exit();
            }

            // Procesar archivo adjunto si existe
            $archivoAdjunto = null;
            if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../../storage/justificaciones/';
                
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                $extension = pathinfo($_FILES['archivo']['name'], PATHINFO_EXTENSION);
                $nombreArchivo = 'justificacion_' . $idUsuario . '_' . $mes . '_' . $anio . '_' . time() . '.' . $extension;
                $rutaDestino = $uploadDir . $nombreArchivo;

                if (move_uploaded_file($_FILES['archivo']['tmp_name'], $rutaDestino)) {
                    $archivoAdjunto = 'justificaciones/' . $nombreArchivo;
                    error_log("✅ Archivo guardado: $archivoAdjunto");
                }
            }

            // Crear justificación
            error_log("📝 Llamando al modelo...");
            $resultado = $this->justificacionModel->crearJustificacion(
                $idUsuario,
                $mes,
                $anio,
                $horasJustificadas,
                $motivo,
                $idAdmin,
                $archivoAdjunto,
                $observaciones
            );

            error_log("✅ Resultado: " . json_encode($resultado));

            http_response_code($resultado['success'] ? 200 : 400);
            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log("❌ Exception: " . $e->getMessage());
            error_log("Stack: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno: ' . $e->getMessage()
            ]);
        }
        exit();
    }

    /**
     * Obtener justificaciones de un usuario
     * ENDPOINT: GET /api/justificaciones/usuario?id_usuario=X&mes=X&anio=X
     */
    public function getJustificacionesUsuario()
    {
        try {
            ob_clean();
            header('Content-Type: application/json; charset=utf-8');

            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'No autenticado'
                ]);
                exit();
            }

            if (!isset($_GET['id_usuario'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'ID de usuario requerido'
                ]);
                exit();
            }

            $idUsuario = intval($_GET['id_usuario']);
            $mes = isset($_GET['mes']) ? intval($_GET['mes']) : null;
            $anio = isset($_GET['anio']) ? intval($_GET['anio']) : null;

            $justificaciones = $this->justificacionModel->getJustificaciones($idUsuario, $mes, $anio);

            echo json_encode([
                'success' => true,
                'justificaciones' => $justificaciones,
                'count' => count($justificaciones)
            ]);

        } catch (\Exception $e) {
            error_log("❌ Error en getJustificacionesUsuario: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener justificaciones'
            ]);
        }
        exit();
    }

    /**
     * Eliminar justificación
     * ENDPOINT: POST /api/justificaciones/eliminar
     */
    public function eliminarJustificacion()
    {
        try {
            ob_clean();
            header('Content-Type: application/json; charset=utf-8');

            // Verificar que sea admin
            if (!isset($_SESSION['user_id']) || $_SESSION['rol'] !== 'admin') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'No tienes permisos'
                ]);
                exit();
            }

            if (!isset($_POST['id_justificacion'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'ID de justificación requerido'
                ]);
                exit();
            }

            $idJustificacion = intval($_POST['id_justificacion']);
            $idAdmin = $_SESSION['user_id'];

            $resultado = $this->justificacionModel->eliminarJustificacion($idJustificacion, $idAdmin);

            http_response_code($resultado['success'] ? 200 : 400);
            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log("❌ Error en eliminarJustificacion: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno'
            ]);
        }
        exit();
    }
}