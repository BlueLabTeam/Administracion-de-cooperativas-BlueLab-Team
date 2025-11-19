<?php

namespace App\Controllers;

use App\models\Solicitud;

class SolicitudController
{
    private $solicitudModel;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->solicitudModel = new Solicitud();
    }

    /**
     * Crear nueva solicitud 
     */
    public function create()
    {
        // Limpiar TODOS los buffers de salida
        while (ob_get_level()) {
            ob_end_clean();
        }
        
        //  Establecer header ANTES de cualquier output
        header('Content-Type: application/json; charset=utf-8');
        
        //  Deshabilitar output buffering
        if (function_exists('apache_setenv')) {
            @apache_setenv('no-gzip', '1');
        }
        @ini_set('zlib.output_compression', 0);
        @ini_set('implicit_flush', 1);

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode([
                'success' => false, 
                'message' => 'No autenticado'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        error_log("========================================");
        error_log("INICIO crear solicitud");
        error_log("========================================");
        error_log("Usuario ID: " . $_SESSION['user_id']);
        error_log("POST: " . json_encode($_POST));
        error_log("FILES: " . json_encode(array_map(function($file) {
            return [
                'name' => $file['name'],
                'size' => $file['size'],
                'error' => $file['error']
            ];
        }, $_FILES)));

        try {
            // Validar datos obligatorios
            $tipo = $_POST['tipo_solicitud'] ?? 'general';
            $asunto = trim($_POST['asunto'] ?? '');
            $descripcion = trim($_POST['descripcion'] ?? '');
            $prioridad = $_POST['prioridad'] ?? 'media';

            error_log("Datos recibidos:");
            error_log("  - Tipo: $tipo");
            error_log("  - Asunto: $asunto");
            error_log("  - Prioridad: $prioridad");

            if (empty($asunto) || empty($descripcion)) {
                error_log(" Validación fallida: asunto o descripción vacíos");
                echo json_encode([
                    'success' => false,
                    'message' => 'El asunto y la descripción son obligatorios'
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }

            $archivo = null;

            // Procesar archivo si existe
            if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
                error_log("🔎 Procesando archivo...");
                
                $archivoTemp = $_FILES['archivo'];
                $nombreOriginal = $archivoTemp['name'];
                $tamanio = $archivoTemp['size'];
                $tmpName = $archivoTemp['tmp_name'];
                
                error_log("  - Nombre: $nombreOriginal");
                error_log("  - Tamaño: $tamanio bytes");
                error_log("  - Temp: $tmpName");

                // Validar tamaño (5MB)
                if ($tamanio > 5242880) {
                    error_log(" Archivo muy grande: $tamanio bytes");
                    echo json_encode([
                        'success' => false,
                        'message' => 'El archivo es demasiado grande. Máximo 5MB.'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }

                // Validar tipo
                $extension = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
                $permitidos = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
                
                if (!in_array($extension, $permitidos)) {
                    error_log(" Tipo no permitido: $extension");
                    echo json_encode([
                        'success' => false,
                        'message' => "Tipo de archivo no permitido. Solo: " . implode(', ', $permitidos)
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }

                // Generar nombre único
                $nombreLimpio = preg_replace('/[^a-zA-Z0-9._-]/', '', basename($nombreOriginal));
                $nombreArchivo = time() . '_' . uniqid() . '_' . $nombreLimpio;
                
                // Ruta completa
                $directorio = __DIR__ . '/../../storage/uploads/solicitudes/';
                $destino = $directorio . $nombreArchivo;
                
                // Ruta relativa para BD
                $archivo = 'uploads/solicitudes/' . $nombreArchivo;

                error_log("📁 Preparando guardado:");
                error_log("  - Directorio: $directorio");
                error_log("  - Destino: $destino");
                error_log("  - BD path: $archivo");

                // Crear directorio si no existe
                if (!is_dir($directorio)) {
                    error_log("📁 Creando directorio...");
                    if (!mkdir($directorio, 0775, true)) {
                        error_log(" No se pudo crear directorio");
                        echo json_encode([
                            'success' => false,
                            'message' => 'Error al crear directorio de almacenamiento'
                        ], JSON_UNESCAPED_UNICODE);
                        exit();
                    }
                    error_log(" Directorio creado");
                }

                // Verificar permisos de escritura
                if (!is_writable($directorio)) {
                    error_log(" Directorio sin permisos de escritura: $directorio");
                    echo json_encode([
                        'success' => false,
                        'message' => 'El directorio no tiene permisos de escritura'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }

                // Mover archivo
                error_log("📄 Moviendo archivo de $tmpName a $destino");
                if (!move_uploaded_file($tmpName, $destino)) {
                    error_log(" Error al mover archivo");
                    error_log("  - Origen existe: " . (file_exists($tmpName) ? 'SI' : 'NO'));
                    error_log("  - Destino existe: " . (file_exists($destino) ? 'SI' : 'NO'));
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error al guardar el archivo adjunto'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }

                // Verificar que se guardó
                if (!file_exists($destino)) {
                    error_log(" Archivo no existe después de mover");
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error: el archivo no se guardó correctamente'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }

                error_log(" Archivo guardado correctamente:");
                error_log("  - Ruta física: $destino");
                error_log("  - Ruta BD: $archivo");
                error_log("  - Tamaño final: " . filesize($destino) . " bytes");

            } elseif (isset($_FILES['archivo']) && $_FILES['archivo']['error'] !== UPLOAD_ERR_NO_FILE) {
                // Hubo un error al subir
                $errorCode = $_FILES['archivo']['error'];
                $errores = [
                    UPLOAD_ERR_INI_SIZE => 'Archivo excede upload_max_filesize',
                    UPLOAD_ERR_FORM_SIZE => 'Archivo excede MAX_FILE_SIZE del formulario',
                    UPLOAD_ERR_PARTIAL => 'Archivo subido parcialmente',
                    UPLOAD_ERR_NO_TMP_DIR => 'Falta carpeta temporal',
                    UPLOAD_ERR_CANT_WRITE => 'Error al escribir en disco',
                    UPLOAD_ERR_EXTENSION => 'Extensión de PHP detuvo la subida'
                ];
                
                $mensajeError = $errores[$errorCode] ?? "Error desconocido ($errorCode)";
                error_log(" Error upload: $mensajeError");
                
                echo json_encode([
                    'success' => false,
                    'message' => "Error al subir archivo: $mensajeError"
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }

            // Guardar en base de datos
            error_log(" Guardando solicitud en BD...");
            error_log("  - Usuario: " . $_SESSION['user_id']);
            error_log("  - Tipo: $tipo");
            error_log("  - Asunto: $asunto");
            error_log("  - Archivo: " . ($archivo ?? 'NULL'));
            error_log("  - Prioridad: $prioridad");

            $resultado = $this->solicitudModel->create(
                $_SESSION['user_id'],
                $tipo,
                $asunto,
                $descripcion,
                $archivo,
                $prioridad
            );

            error_log(" Resultado de create():");
            error_log(json_encode($resultado));

            if (!$resultado['success']) {
                error_log(" Error al crear solicitud en BD");
                echo json_encode($resultado, JSON_UNESCAPED_UNICODE);
                exit();
            }

            error_log(" Solicitud creada en BD. ID: " . $resultado['id_solicitud']);

            // Respuesta exitosa
            error_log(" SOLICITUD CREADA EXITOSAMENTE");
            error_log("========================================");
            
            echo json_encode([
                'success' => true,
                'message' => 'Solicitud enviada correctamente',
                'id_solicitud' => $resultado['id_solicitud'],
                'archivo_guardado' => !empty($archivo)
            ], JSON_UNESCAPED_UNICODE);
            exit();

        } catch (\Exception $e) {
            error_log(" EXCEPCIÓN CAPTURADA:");
            error_log("  - Mensaje: " . $e->getMessage());
            error_log("  - Archivo: " . $e->getFile());
            error_log("  - Línea: " . $e->getLine());
            error_log("  - Stack trace:");
            error_log($e->getTraceAsString());
            
            echo json_encode([
                'success' => false,
                'message' => 'Error al procesar solicitud: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
    }

    /**
     * Obtener mis solicitudes
     */
    public function getMisSolicitudes()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json; charset=utf-8');

        error_log("========================================");
        error_log("CONTROLLER getMisSolicitudes - INICIO");
        error_log("SESSION user_id: " . ($_SESSION['user_id'] ?? 'NO DEFINIDO'));
        error_log("SESSION is_admin: " . ($_SESSION['is_admin'] ?? 'NO DEFINIDO'));
        error_log("GET params: " . json_encode($_GET));

        if (!isset($_SESSION['user_id'])) {
            error_log(" Usuario no autenticado");
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $filtros = [
                'estado' => $_GET['estado'] ?? null,
                'tipo' => $_GET['tipo'] ?? null
            ];

            error_log("Filtros aplicados: " . json_encode($filtros));

            $solicitudes = $this->solicitudModel->getMisSolicitudes($_SESSION['user_id'], $filtros);

            error_log(" Solicitudes obtenidas: " . count($solicitudes));

            if (count($solicitudes) > 0) {
                error_log("Primera solicitud: " . json_encode($solicitudes[0]));
            }

            $response = [
                'success' => true,
                'solicitudes' => $solicitudes,
                'count' => count($solicitudes)
            ];

            error_log("Respuesta JSON: " . json_encode($response));
            error_log("CONTROLLER getMisSolicitudes - FIN");
            error_log("========================================");

            echo json_encode($response, JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log(" EXCEPCIÓN en getMisSolicitudes Controller: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener solicitudes'], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    /**
     * Obtener detalle de solicitud
     */
    public function getDetalle()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $solicitudId = $_GET['id_solicitud'] ?? null;

        if (!$solicitudId) {
            echo json_encode(['success' => false, 'message' => 'ID requerido'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $solicitud = $this->solicitudModel->getById($solicitudId);

            if (!$solicitud) {
                echo json_encode(['success' => false, 'message' => 'Solicitud no encontrada'], JSON_UNESCAPED_UNICODE);
                exit();
            }

            // Verificar permisos
            if ($solicitud['id_usuario'] != $_SESSION['user_id'] && !$_SESSION['is_admin']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'No autorizado'], JSON_UNESCAPED_UNICODE);
                exit();
            }

            $respuestas = $this->solicitudModel->getRespuestas($solicitudId);

            echo json_encode([
                'success' => true,
                'solicitud' => $solicitud,
                'respuestas' => $respuestas
            ], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en getDetalle: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener detalle'], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    /**
     * Agregar respuesta
     */
    public function addRespuesta()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $solicitudId = $_POST['id_solicitud'] ?? null;
            $mensaje = trim($_POST['mensaje'] ?? '');

            if (!$solicitudId || empty($mensaje)) {
                echo json_encode(['success' => false, 'message' => 'Datos incompletos'], JSON_UNESCAPED_UNICODE);
                exit();
            }

            $solicitud = $this->solicitudModel->getById($solicitudId);

            if (!$solicitud) {
                echo json_encode(['success' => false, 'message' => 'Solicitud no encontrada'], JSON_UNESCAPED_UNICODE);
                exit();
            }

            // Verificar permisos
            $esAdmin = $_SESSION['is_admin'] ?? false;
            $esPropietario = $solicitud['id_usuario'] == $_SESSION['user_id'];

            if (!$esAdmin && !$esPropietario) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'No autorizado'], JSON_UNESCAPED_UNICODE);
                exit();
            }

            $archivo = null;

            // Procesar archivo si existe
            if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
                $archivoTemp = $_FILES['archivo'];
                
                if ($archivoTemp['size'] > 5242880) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Archivo demasiado grande. Máximo 5MB.'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }
                
                $nombreLimpio = preg_replace('/[^a-zA-Z0-9._-]/', '', basename($archivoTemp['name']));
                $nombreArchivo = time() . '_' . uniqid() . '_' . $nombreLimpio;
                $directorio = __DIR__ . '/../../storage/uploads/solicitudes/respuestas/';
                $destino = $directorio . $nombreArchivo;
                $archivo = 'uploads/solicitudes/respuestas/' . $nombreArchivo;

                if (!is_dir($directorio)) {
                    mkdir($directorio, 0775, true);
                }

                if (!move_uploaded_file($archivoTemp['tmp_name'], $destino)) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error al guardar archivo'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }
            }

            $resultado = $this->solicitudModel->addRespuesta(
                $solicitudId,
                $_SESSION['user_id'],
                $mensaje,
                $esAdmin,
                $archivo
            );

            echo json_encode($resultado, JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en addRespuesta: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al enviar respuesta'], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    // ========================================
    // FUNCIONES DE ADMINISTRADOR
    // ========================================

    /**
     * Obtener todas las solicitudes (Admin)
     */
    public function getAllSolicitudes()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $filtros = [
                'estado' => $_GET['estado'] ?? null,
                'tipo' => $_GET['tipo'] ?? null,
                'prioridad' => $_GET['prioridad'] ?? null
            ];

            $solicitudes = $this->solicitudModel->getAllSolicitudes($filtros);

            echo json_encode([
                'success' => true,
                'solicitudes' => $solicitudes,
                'count' => count($solicitudes)
            ], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en getAllSolicitudes: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener solicitudes'], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    /**
     * Actualizar estado de solicitud (Admin)
     */
    public function updateEstado()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $solicitudId = $_POST['id_solicitud'] ?? null;
            $nuevoEstado = $_POST['estado'] ?? null;

            if (!$solicitudId || !$nuevoEstado) {
                echo json_encode(['success' => false, 'message' => 'Datos incompletos'], JSON_UNESCAPED_UNICODE);
                exit();
            }

            $estadosValidos = ['pendiente', 'en_revision', 'resuelta', 'rechazada'];
            if (!in_array($nuevoEstado, $estadosValidos)) {
                echo json_encode(['success' => false, 'message' => 'Estado inválido'], JSON_UNESCAPED_UNICODE);
                exit();
            }

            $resultado = $this->solicitudModel->updateEstado(
                $solicitudId,
                $nuevoEstado,
                $_SESSION['user_id']
            );

            echo json_encode($resultado, JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en updateEstado: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al actualizar estado'], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    /**
     * Obtener estadísticas (Admin)
     */
    public function getEstadisticas()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $estadisticas = $this->solicitudModel->getEstadisticas();

            echo json_encode([
                'success' => true,
                'estadisticas' => $estadisticas
            ], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en getEstadisticas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener estadísticas'], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }
}