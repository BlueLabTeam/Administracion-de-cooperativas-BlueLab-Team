<?php

namespace App\controllers;

use App\models\JustificacionHoras;

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
            error_log("FILES: " . json_encode(array_keys($_FILES)));
            error_log("SESSION completa: " . json_encode($_SESSION));

            //  VERIFICAR SESIÓN (con múltiples campos posibles)
            $userId = $_SESSION['user_id'] ?? $_SESSION['id_usuario'] ?? $_SESSION['usuario_id'] ?? null;
            
            if (!$userId) {
                error_log(" No hay user_id en sesión");
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'Sesión no iniciada'
                ]);
                exit();
            }

            //  VERIFICAR PERMISOS DE ADMIN (con múltiples campos posibles)
            $isAdmin = false;
            
            // Método 1: Campo is_admin
            if (isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true) {
                $isAdmin = true;
            }
            
            // Método 2: Campo id_rol == 1
            if (isset($_SESSION['id_rol']) && $_SESSION['id_rol'] == 1) {
                $isAdmin = true;
            }
            
            // Método 3: Campo rol == 'admin'
            if (isset($_SESSION['rol']) && $_SESSION['rol'] === 'admin') {
                $isAdmin = true;
            }
            
            if (!$isAdmin) {
                error_log(" Usuario no es admin");
                error_log("   - is_admin: " . json_encode($_SESSION['is_admin'] ?? null));
                error_log("   - id_rol: " . json_encode($_SESSION['id_rol'] ?? null));
                error_log("   - rol: " . json_encode($_SESSION['rol'] ?? null));
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'No tienes permisos de administrador'
                ]);
                exit();
            }

            error_log(" Permisos OK - Admin verificado");

            //  VALIDAR CAMPOS REQUERIDOS
            $requiredFields = ['id_usuario', 'mes', 'anio', 'horas_justificadas', 'motivo'];
            $missingFields = [];
            
            foreach ($requiredFields as $field) {
                if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
                    $missingFields[] = $field;
                }
            }
            
            if (!empty($missingFields)) {
                error_log(" Campos faltantes: " . implode(', ', $missingFields));
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Campos requeridos faltantes: ' . implode(', ', $missingFields),
                    'missing_fields' => $missingFields
                ]);
                exit();
            }

            //  EXTRAER Y VALIDAR DATOS
            $idUsuario = intval($_POST['id_usuario']);
            $mes = intval($_POST['mes']);
            $anio = intval($_POST['anio']);
            $horasJustificadas = floatval($_POST['horas_justificadas']);
            $motivo = trim($_POST['motivo']);
            $observaciones = isset($_POST['observaciones']) ? trim($_POST['observaciones']) : null;
            $idAdmin = $userId;

            error_log(" Datos validados:");
            error_log("   - Usuario: $idUsuario");
            error_log("   - Período: $mes/$anio");
            error_log("   - Horas: $horasJustificadas");
            error_log("   - Motivo: " . substr($motivo, 0, 50) . "...");

            // Validar horas positivas
            if ($horasJustificadas <= 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Las horas deben ser mayor a 0'
                ]);
                exit();
            }

            // Validar mes y año
            if ($mes < 1 || $mes > 12) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Mes inválido (debe ser entre 1 y 12)'
                ]);
                exit();
            }

            if ($anio < 2020 || $anio > 2030) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Año inválido'
                ]);
                exit();
            }

            //  PROCESAR ARCHIVO ADJUNTO
            $archivoAdjunto = null;
            if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../../storage/justificaciones/';
                
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                    error_log(" Directorio creado: $uploadDir");
                }

                $extension = pathinfo($_FILES['archivo']['name'], PATHINFO_EXTENSION);
                $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
                
                if (!in_array(strtolower($extension), $allowedExtensions)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Formato de archivo no permitido. Use: PDF, JPG, PNG, DOC, DOCX'
                    ]);
                    exit();
                }

                $nombreArchivo = 'justificacion_' . $idUsuario . '_' . $mes . '_' . $anio . '_' . time() . '.' . $extension;
                $rutaDestino = $uploadDir . $nombreArchivo;

                if (move_uploaded_file($_FILES['archivo']['tmp_name'], $rutaDestino)) {
                    $archivoAdjunto = 'justificaciones/' . $nombreArchivo;
                    error_log(" Archivo guardado: $archivoAdjunto");
                } else {
                    error_log("⚠️ Error al mover archivo");
                }
            }

            //  CREAR JUSTIFICACIÓN
            error_log("📝 Llamando al modelo para crear justificación...");
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

            error_log(" Resultado del modelo: " . json_encode($resultado));

            http_response_code($resultado['success'] ? 200 : 400);
            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log(" Exception en crearJustificacion: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
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

            if (!isset($_SESSION['user_id']) && !isset($_SESSION['id_usuario'])) {
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
            error_log(" Error en getJustificacionesUsuario: " . $e->getMessage());
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

            // Verificar que sea admin (con múltiples métodos)
            $userId = $_SESSION['user_id'] ?? $_SESSION['id_usuario'] ?? null;
            $isAdmin = ($_SESSION['is_admin'] ?? false) || 
                       ($_SESSION['id_rol'] ?? 0) == 1 || 
                       ($_SESSION['rol'] ?? '') === 'admin';

            if (!$userId || !$isAdmin) {
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

            $resultado = $this->justificacionModel->eliminarJustificacion($idJustificacion, $userId);

            http_response_code($resultado['success'] ? 200 : 400);
            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log(" Error en eliminarJustificacion: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno'
            ]);
        }
        exit();
    }
}