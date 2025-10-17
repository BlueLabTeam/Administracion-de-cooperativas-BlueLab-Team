<?php

namespace App\Controllers;

use App\Models\Cuota;
use App\Models\Vivienda;

class CuotaController
{
    private $cuotaModel;
    private $viviendaModel;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->cuotaModel = new Cuota();
        $this->viviendaModel = new Vivienda();
    }

    /**
     * Obtener cuotas del usuario logueado
     */
    public function getMisCuotas()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $filtros = [
                'estado' => $_GET['estado'] ?? null,
                'mes' => $_GET['mes'] ?? null,
                'anio' => $_GET['anio'] ?? null
            ];
            error_log("🔍 Filtros usados en getMisCuotas: " . json_encode($filtros));


            $cuotas = $this->cuotaModel->getCuotasUsuario($_SESSION['user_id'], $filtros);

            echo json_encode([
                'success' => true,
                'cuotas' => $cuotas,
                'count' => count($cuotas)
            ]);

        } catch (\Exception $e) {
            error_log("Error en getMisCuotas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener cuotas']);
        }
        exit();
    }

    /**
     * Obtener detalle de una cuota
     */
    public function getDetalleCuota()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        $cuotaId = $_GET['cuota_id'] ?? null;

        if (!$cuotaId) {
            echo json_encode(['success' => false, 'message' => 'ID de cuota requerido']);
            exit();
        }

        try {
            $cuota = $this->cuotaModel->getCuotaById($cuotaId);

            if (!$cuota) {
                echo json_encode(['success' => false, 'message' => 'Cuota no encontrada']);
                exit();
            }

            // Verificar que la cuota pertenezca al usuario
            if ($cuota['id_usuario'] != $_SESSION['user_id'] && !$_SESSION['is_admin']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'No autorizado']);
                exit();
            }

            // Verificar si puede pagar
            $validacion = $this->cuotaModel->puedeRealizarPago($cuotaId);

            echo json_encode([
                'success' => true,
                'cuota' => $cuota,
                'validacion' => $validacion
            ]);

        } catch (\Exception $e) {
            error_log("Error en getDetalleCuota: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener detalle']);
        }
        exit();
    }

    /**
     * Pagar cuota del usuario
     */
    public function pagarCuota()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        error_log("=== INICIO pagarCuota ===");

        try {
            $cuotaId = $_POST['cuota_id'] ?? null;
            $montoPagado = $_POST['monto_pagado'] ?? null;
            $metodoPago = $_POST['metodo_pago'] ?? 'transferencia';
            $numeroComprobante = $_POST['numero_comprobante'] ?? null;

            if (!$cuotaId || !$montoPagado) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Datos incompletos'
                ]);
                exit();
            }

            // Verificar archivo
            if (!isset($_FILES['comprobante'])) {
                error_log("❌ No se recibió archivo");
                echo json_encode([
                    'success' => false,
                    'message' => 'No se recibió el comprobante'
                ]);
                exit();
            }

            $archivo = $_FILES['comprobante'];

            if ($archivo['error'] !== UPLOAD_ERR_OK) {
                error_log("❌ Error en upload: " . $archivo['error']);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al subir el archivo'
                ]);
                exit();
            }
            $incluyeDeudaHoras = $_POST['incluye_deuda_horas'] ?? 'false';
$montoDeudaHoras = $_POST['monto_deuda_horas'] ?? 0;

if ($incluyeDeudaHoras === 'true') {
    error_log("💰 Pago incluye deuda de horas: $" . $montoDeudaHoras);
}


            // Procesar archivo
            $nombreArchivo = time() . '_' . basename($archivo['name']);
            $directorio = __DIR__ . '/../../storage/uploads/cuotas/';
            $destino = $directorio . $nombreArchivo;
            
            error_log("📁 Directorio destino: $directorio");

            // Ruta relativa para la BD
            $rutaRelativa = 'uploads/cuotas/' . $nombreArchivo;

            // Crear directorio si no existe
            if (!is_dir($directorio)) {
                mkdir($directorio, 0775, true);
            }

            // Mover archivo
            if (!move_uploaded_file($archivo['tmp_name'], $destino)) {
                error_log("❌ Error al mover archivo");
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al guardar el comprobante'
                ]);
                exit();
            }

            error_log("✅ Archivo guardado exitosamente");

            // Registrar pago en BD
           $resultado = $this->cuotaModel->registrarPago(
    $cuotaId,
    $_SESSION['user_id'],
    $montoPagado,
    $metodoPago,
    $rutaRelativa,
    $numeroComprobante,
    $incluyeDeudaHoras === 'true',  // NUEVO
    $montoDeudaHoras                // NUEVO
);

            if (!$resultado['success'] && file_exists($destino)) {
                unlink($destino);
                error_log("🗑️ Archivo eliminado por error en BD");
            }

            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log("❌ Error en pagarCuota: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al registrar pago'
            ]);
        }
        
        error_log("=== FIN pagarCuota ===");
        exit();
    }

    /**
 * Verificar si existe cuota del mes para el usuario
 * ENDPOINT: GET /api/cuotas/verificar-cuota-mes?mes=10&anio=2025
 */
public function verificarCuotaMes()
{
    header('Content-Type: application/json');

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'No autenticado']);
        exit();
    }

    $mes = $_GET['mes'] ?? date('n');
    $anio = $_GET['anio'] ?? date('Y');

    try {
        // ✅ USAR cuotaModel en lugar de conn
        $cuotas = $this->cuotaModel->getCuotasUsuario($_SESSION['user_id'], [
            'mes' => $mes,
            'anio' => $anio
        ]);

        $existe = count($cuotas) > 0;

        echo json_encode([
            'success' => true,
            'existe' => $existe,
            'mes' => $mes,
            'anio' => $anio
        ]);

    } catch (\Exception $e) {
        error_log("Error en verificarCuotaMes: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al verificar cuota']);
    }
    exit();
}

/**
 * Generar cuota del mes actual para MI usuario
 * ENDPOINT: POST /api/cuotas/generar-mi-cuota
 */
public function generarMiCuota()
{
    // Limpiar output buffer
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    header('Content-Type: application/json; charset=utf-8');

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'No autenticado']);
        exit();
    }

    try {
        $mes = intval($_POST['mes'] ?? date('n'));
        $anio = intval($_POST['anio'] ?? date('Y'));
        
        $resultado = $this->cuotaModel->generarCuotaIndividual(
            $_SESSION['user_id'], 
            $mes, 
            $anio
        );

        echo json_encode($resultado);

    } catch (\Exception $e) {
        error_log("❌ Error en generarMiCuota: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al generar cuota'
        ]);
    }
    
    exit();
}
    // ========================================
    // FUNCIONES DE ADMINISTRADOR
    // ========================================

    /**
     * Obtener todas las cuotas (Admin)
     */
    public function getAllCuotas()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $filtros = [
                'estado' => $_GET['estado'] ?? null,
                'mes' => $_GET['mes'] ?? null,
                'anio' => $_GET['anio'] ?? null
            ];

            $cuotas = $this->cuotaModel->getAllCuotas($filtros);

            echo json_encode([
                'success' => true,
                'cuotas' => $cuotas,
                'count' => count($cuotas)
            ]);

        } catch (\Exception $e) {
            error_log("Error en getAllCuotas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener cuotas']);
        }
        exit();
    }

    /**
     * Validar pago de cuota (Admin) - APROBAR/RECHAZAR
     */
    public function validarPago()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        error_log("=== INICIO validarPago (ADMIN) ===");

        try {
            $pagoId = $_POST['pago_id'] ?? null;
            $accion = $_POST['accion'] ?? null;
            $observaciones = $_POST['observaciones'] ?? '';

            if (!$pagoId || !$accion) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Datos incompletos'
                ]);
                exit();
            }

            if (!in_array($accion, ['aprobar', 'rechazar'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Acción inválida'
                ]);
                exit();
            }

            $resultado = $this->cuotaModel->validarPago(
                $pagoId,
                $_SESSION['user_id'],
                $accion,
                $observaciones
            );

            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log("❌ Error en validarPago: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al validar pago'
            ]);
        }
        
        error_log("=== FIN validarPago ===");
        exit();
    }

    /**
     * Generar cuotas masivas para el mes (Admin)
     * IMPORTANTE: Se ejecuta automáticamente el 1° de cada mes via CRON
     */
    public function generarCuotasMasivas()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $mes = intval($_POST['mes'] ?? date('n'));
            $anio = intval($_POST['anio'] ?? date('Y'));

            error_log("📅 Generando cuotas para: $mes/$anio");

            // Llamar al método del modelo
            $resultado = $this->cuotaModel->generarCuotasMensuales($mes, $anio);

            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log("❌ Error en generarCuotasMasivas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al generar cuotas: ' . $e->getMessage()
            ]);
        }
        exit();
    }

    /**
     * Obtener estadísticas de cuotas (Admin)
     */
    public function getEstadisticas()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $mes = $_GET['mes'] ?? null;
            $anio = $_GET['anio'] ?? null;

            $estadisticas = $this->cuotaModel->getEstadisticasCuotas($mes, $anio);

            echo json_encode([
                'success' => true,
                'estadisticas' => $estadisticas
            ]);

        } catch (\Exception $e) {
            error_log("Error en getEstadisticas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener estadísticas']);
        }
        exit();
    }

    /**
     * Actualizar precio GLOBAL (afecta a todos los usuarios de ese tipo)
     * IMPORTANTE: Solo actualiza la configuración para próximas cuotas
     */
    public function actualizarPrecio()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $idTipo = $_POST['id_tipo'] ?? null;
            $montoMensual = $_POST['monto_mensual'] ?? null;

            if (!$idTipo || !$montoMensual) {
                echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
                exit();
            }

            $resultado = $this->cuotaModel->actualizarPrecio($idTipo, $montoMensual);

            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log("Error en actualizarPrecio: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al actualizar precio']);
        }
        exit();
    }

    /**
     * Obtener precios actuales (GLOBALES por tipo de vivienda)
     */
    public function getPreciosActuales()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $precios = $this->cuotaModel->getPreciosActuales();

            echo json_encode([
                'success' => true,
                'precios' => $precios
            ]);

        } catch (\Exception $e) {
            error_log("Error en getPreciosActuales: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener precios']);
        }
        exit();
    }
}