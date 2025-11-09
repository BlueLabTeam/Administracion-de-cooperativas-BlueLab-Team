<?php

namespace App\controllers;

use App\models\Cuota;
use App\models\Vivienda;

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
        // Limpiar TODOS los buffers de salida
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        // Evitar cualquier output antes del header
        error_reporting(E_ALL);
        ini_set('display_errors', 0);
        
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $userId = $_SESSION['user_id'];
            
            $filtros = [
                'estado' => $_GET['estado'] ?? null,
                'mes' => $_GET['mes'] ?? null,
                'anio' => $_GET['anio'] ?? null
            ];
            
            error_log("===========================================");
            error_log("🔍 [getMisCuotas] Usuario ID: $userId");
            error_log("🔍 Filtros: " . json_encode($filtros));
            
            $cuotas = $this->cuotaModel->getCuotasUsuario($userId, $filtros);
            
            error_log("📊 Cuotas obtenidas: " . count($cuotas));
            error_log("===========================================");
            
            echo json_encode([
                'success' => true,
                'cuotas' => $cuotas,
                'count' => count($cuotas)
            ], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log(" ERROR en getMisCuotas: " . $e->getMessage());
            error_log(" Stack: " . $e->getTraceAsString());
            
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'message' => 'Error al obtener cuotas',
                'error' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
        
        exit();
    }

    /**
     * Obtener detalle de una cuota
     */
    public function getDetalleCuota()
    {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

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
            ], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en getDetalleCuota: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener detalle']);
        }
        exit();
    }

    /**
     * Verificar y generar cuota automaticamente si no existe
     */
    public function verificarYGenerarCuotaAuto()
    {
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
            $mes = intval($_GET['mes'] ?? date('n'));
            $anio = intval($_GET['anio'] ?? date('Y'));
            
            $cuotas = $this->cuotaModel->getCuotasUsuario($_SESSION['user_id'], [
                'mes' => $mes,
                'anio' => $anio
            ]);

            if (count($cuotas) > 0) {
                echo json_encode([
                    'success' => true,
                    'existe' => true,
                    'cuota' => $cuotas[0],
                    'generada' => false
                ], JSON_UNESCAPED_UNICODE);
            } else {
                $resultado = $this->cuotaModel->generarCuotaIndividual(
                    $_SESSION['user_id'], 
                    $mes, 
                    $anio
                );

                echo json_encode([
                    'success' => $resultado['success'],
                    'existe' => false,
                    'generada' => true,
                    'cuota' => $resultado['cuota'] ?? null,
                    'message' => $resultado['message']
                ], JSON_UNESCAPED_UNICODE);
            }

        } catch (\Exception $e) {
            error_log("Error en verificarYGenerarCuotaAuto: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al verificar cuota'
            ], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    /**
     * Pagar cuota del usuario
     */
    public function pagarCuota()
    {
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
            $cuotaId = $_POST['cuota_id'] ?? null;
            $montoPagado = $_POST['monto_pagado'] ?? null;
            $metodoPago = $_POST['metodo_pago'] ?? 'transferencia';
            $numeroComprobante = $_POST['numero_comprobante'] ?? null;
            $incluyeDeudaHoras = $_POST['incluye_deuda_horas'] ?? 'false';
            $montoDeudaHoras = $_POST['monto_deuda_horas'] ?? 0;

            if (!$cuotaId || !$montoPagado) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Datos incompletos'
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }

            if (!isset($_FILES['comprobante'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'No se recibio el comprobante'
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }

            $archivo = $_FILES['comprobante'];

            if ($archivo['error'] !== UPLOAD_ERR_OK) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al subir el archivo'
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }

            $nombreArchivo = time() . '_' . basename($archivo['name']);
            $directorio = __DIR__ . '/../../storage/uploads/cuotas/';
            $destino = $directorio . $nombreArchivo;
            $rutaRelativa = 'uploads/cuotas/' . $nombreArchivo;

            if (!is_dir($directorio)) {
                mkdir($directorio, 0775, true);
            }

            if (!move_uploaded_file($archivo['tmp_name'], $destino)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al guardar el comprobante'
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }

            $resultado = $this->cuotaModel->registrarPago(
                $cuotaId,
                $_SESSION['user_id'],
                $montoPagado,
                $metodoPago,
                $rutaRelativa,
                $numeroComprobante,
                $incluyeDeudaHoras === 'true',
                $montoDeudaHoras
            );

            if (!$resultado['success'] && file_exists($destino)) {
                unlink($destino);
            }

            echo json_encode($resultado, JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en pagarCuota: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al registrar pago'
            ], JSON_UNESCAPED_UNICODE);
        }
        
        exit();
    }

    /**
 * ✅ ENDPOINT: Liquidar deuda de una cuota (marcarla como pagada)
 * Ruta: POST /api/cuotas/liquidar
 */
public function liquidarCuota()
{
    // Limpiar buffers de salida
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    header('Content-Type: application/json; charset=utf-8');

    // ✅ Verificar autenticación y rol de admin
    if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'message' => 'No autorizado. Solo administradores pueden liquidar cuotas.'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    try {
        // 📥 Obtener ID de cuota del POST
        $cuotaId = $_POST['id_cuota'] ?? null;

        // ✅ Validar que se recibió el ID
        if (!$cuotaId || !is_numeric($cuotaId)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de cuota requerido y debe ser numérico'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        error_log("🔵 [CONTROLLER] liquidarCuota iniciado");
        error_log("🔵 [CONTROLLER] ID Cuota: $cuotaId");
        error_log("🔵 [CONTROLLER] Admin ID: " . $_SESSION['user_id']);

        // ✅ Llamar al método del modelo
        $resultado = $this->cuotaModel->liquidarCuotaForzada(
            intval($cuotaId), 
            intval($_SESSION['user_id'])
        );

        error_log("🔵 [CONTROLLER] Resultado: " . json_encode($resultado));

        // ✅ Establecer código de respuesta HTTP
        if ($resultado['success']) {
            http_response_code(200);
        } else {
            http_response_code(400);
        }

        // ✅ Enviar respuesta JSON
        echo json_encode($resultado, JSON_UNESCAPED_UNICODE);

    } catch (\Exception $e) {
        error_log("❌ [CONTROLLER] Error en liquidarCuota: " . $e->getMessage());
        error_log("❌ [CONTROLLER] Stack: " . $e->getTraceAsString());
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error interno del servidor al liquidar cuota',
            'error' => $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    
    exit();
}



  
   

    /**
     * Verificar si existe cuota del mes
     */
    public function verificarCuotaMes()
    {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        $mes = $_GET['mes'] ?? date('n');
        $anio = $_GET['anio'] ?? date('Y');

        try {
            $cuotas = $this->cuotaModel->getCuotasUsuario($_SESSION['user_id'], [
                'mes' => $mes,
                'anio' => $anio
            ]);

            $existe = count($cuotas) > 0;

            echo json_encode([
                'success' => true,
                'existe' => $existe,
                'cuota' => $existe ? $cuotas[0] : null,
                'mes' => $mes,
                'anio' => $anio
            ], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en verificarCuotaMes: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al verificar cuota']);
        }
        exit();
    }

    /**
     * Generar cuota del mes actual para MI usuario
     */
    public function generarMiCuota()
    {
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
            
            error_log("📅 [generarMiCuota] Usuario: {$_SESSION['user_id']}, Mes: $mes, Año: $anio");
            
            $resultado = $this->cuotaModel->generarCuotaIndividual(
                $_SESSION['user_id'], 
                $mes, 
                $anio
            );

            echo json_encode($resultado, JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log(" Error en generarMiCuota: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al generar cuota: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
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
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

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
            ], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en getAllCuotas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener cuotas']);
        }
        exit();
    }

    /**
     * Validar pago de cuota (Admin)
     */
    public function validarPago()
    {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

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
                    'message' => 'Accion invalida'
                ]);
                exit();
            }

            $resultado = $this->cuotaModel->validarPago(
                $pagoId,
                $_SESSION['user_id'],
                $accion,
                $observaciones
            );

            echo json_encode($resultado, JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en validarPago: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al validar pago'
            ], JSON_UNESCAPED_UNICODE);
        }
        
        exit();
    }

    /**
     * Generar cuotas masivas (Admin)
     */
    public function generarCuotasMasivas()
    {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $mes = intval($_POST['mes'] ?? date('n'));
            $anio = intval($_POST['anio'] ?? date('Y'));

            error_log("📅 [ADMIN] Generando cuotas masivas para: $mes/$anio");

            $resultado = $this->cuotaModel->generarCuotasMensuales($mes, $anio);

            echo json_encode($resultado, JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en generarCuotasMasivas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al generar cuotas: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    /**
     * Obtener estadisticas (Admin)
     */
    public function getEstadisticas()
    {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

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
            ], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en getEstadisticas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener estadisticas']);
        }
        exit();
    }

    /**
     * Actualizar precio
     */
    public function actualizarPrecio()
    {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

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

            echo json_encode($resultado, JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en actualizarPrecio: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al actualizar precio']);
        }
        exit();
    }

    public function getResumenDeuda()
{
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
        $resultado = $this->cuotaModel->getResumenDeuda($_SESSION['user_id']);
        echo json_encode($resultado, JSON_UNESCAPED_UNICODE);
        
    } catch (\Exception $e) {
        error_log("Error en getResumenDeuda: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener resumen de deuda'
        ], JSON_UNESCAPED_UNICODE);
    }
    
    exit();
}


public function recalcularDeuda()
{
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    header('Content-Type: application/json; charset=utf-8');

    if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'No autorizado']);
        exit();
    }

    try {
        $idUsuario = $_POST['id_usuario'] ?? null;
        
        if (!$idUsuario) {
            echo json_encode([
                'success' => false,
                'message' => 'ID de usuario requerido'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
        
        $resultado = $this->cuotaModel->recalcularDeudaAcumulada($idUsuario);
        echo json_encode($resultado, JSON_UNESCAPED_UNICODE);
        
    } catch (\Exception $e) {
        error_log("Error en recalcularDeuda: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al recalcular deuda'
        ], JSON_UNESCAPED_UNICODE);
    }
    
    exit();
}

    /**
     * Obtener precios actuales
     */
    public function getPreciosActuales()
    {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

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
            ], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            error_log("Error en getPreciosActuales: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener precios']);
        }
        exit();
    }
}