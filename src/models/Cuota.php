<?php

namespace App\Models;

use App\config\Database;
use PDO;

class Cuota
{
    private $conn;
    
    // ⭐ SISTEMA SEMANAL: 21h/semana × 4 semanas = 84h mensuales
    private $horas_mensuales_requeridas = 84;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    /**
     * Generar cuotas mensuales
     */
    public function generarCuotasMensuales($mes, $anio)
    {
        try {
            error_log("📅 Generando cuotas para mes: $mes, año: $anio");
            
            $stmt = $this->conn->prepare("CALL GenerarCuotasMensuales(:mes, :anio)");
            $stmt->execute([
                'mes' => $mes,
                'anio' => $anio
            ]);
            
            // Contar cuotas generadas
            $stmtCount = $this->conn->prepare("
                SELECT COUNT(*) as total
                FROM Cuotas_Mensuales
                WHERE mes = :mes AND anio = :anio
            ");
            $stmtCount->execute(['mes' => $mes, 'anio' => $anio]);
            $result = $stmtCount->fetch(PDO::FETCH_ASSOC);
            
            $total = $result['total'];
            error_log("✅ Cuotas generadas: $total");
            
            return [
                'success' => true,
                'message' => "Se generaron $total cuotas correctamente",
                'cuotas_generadas' => $total
            ];
            
        } catch (\PDOException $e) {
            error_log("❌ Error al generar cuotas: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al generar cuotas: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener cuotas del usuario
     */
    public function getCuotasUsuario($idUsuario, $filtros = [])
{
    try {
        $params = ['id_usuario' => $idUsuario];
        
        $sql = "
            SELECT 
                cm.id_cuota,
                cm.id_usuario,
                cm.id_vivienda,
                cm.mes,
                cm.anio,
                -- ✅ USAR PRECIO ACTUAL DE CONFIG SI ESTÁ PENDIENTE
                CASE 
                    WHEN cm.estado IN ('pendiente', 'vencida') THEN cc.monto_mensual
                    ELSE cm.monto
                END as monto,
                cm.monto as monto_original,
                cc.monto_mensual as monto_base,
                cm.monto_pendiente_anterior,
                (CASE 
                    WHEN cm.estado IN ('pendiente', 'vencida') THEN cc.monto_mensual
                    ELSE cm.monto
                END + cm.monto_pendiente_anterior) as monto_total,
                cm.estado,
                cm.fecha_vencimiento,
                cm.fecha_generacion,
                cm.horas_requeridas,
                cm.horas_cumplidas,
                cm.horas_validadas,
                cm.observaciones,
                v.numero_vivienda,
                tv.nombre as tipo_vivienda,
                tv.habitaciones,
                u.nombre_completo,
                u.email,
                pc.id_pago,
                pc.monto_pagado,
                pc.fecha_pago,
                pc.comprobante_archivo,
                pc.estado_validacion as estado_pago,
                pc.observaciones_validacion,
                CASE 
                    WHEN cm.fecha_vencimiento < CURDATE() AND cm.estado = 'pendiente' THEN 'vencida'
                    ELSE cm.estado
                END as estado_actual
            FROM Cuotas_Mensuales cm
            INNER JOIN Viviendas v ON cm.id_vivienda = v.id_vivienda
            INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
            -- ✅ JOIN CON CONFIG_CUOTAS PARA PRECIO ACTUAL
            INNER JOIN Config_Cuotas cc ON tv.id_tipo = cc.id_tipo AND cc.activo = TRUE
            INNER JOIN Usuario u ON cm.id_usuario = u.id_usuario
            LEFT JOIN Pagos_Cuotas pc ON cm.id_cuota = pc.id_cuota AND pc.estado_validacion != 'rechazado'
            WHERE cm.id_usuario = :id_usuario
        ";
        
        if (!empty($filtros['mes'])) {
            $sql .= " AND cm.mes = :mes";
            $params['mes'] = $filtros['mes'];
        }
        
        if (!empty($filtros['anio'])) {
            $sql .= " AND cm.anio = :anio";
            $params['anio'] = $filtros['anio'];
        }
        
        if (!empty($filtros['estado'])) {
            if ($filtros['estado'] === 'vencida') {
                $sql .= " AND cm.fecha_vencimiento < CURDATE() AND cm.estado = 'pendiente'";
            } else {
                $sql .= " AND cm.estado = :estado";
                $params['estado'] = $filtros['estado'];
            }
        }
        
        $sql .= " ORDER BY cm.anio DESC, cm.mes DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
        
    } catch (\PDOException $e) {
        error_log("❌ Error en getCuotasUsuario: " . $e->getMessage());
        return [];
    }
}

    /**
     * Obtener todas las cuotas (Admin)
     */
    public function getAllCuotas($filtros = [])
{
    try {
        $sql = "
            SELECT 
                cm.*,
                -- ✅ PRECIO ACTUAL PARA PENDIENTES
                CASE 
                    WHEN cm.estado IN ('pendiente', 'vencida') THEN cc.monto_mensual
                    ELSE cm.monto
                END as monto_actual,
                cc.monto_mensual as monto_base,
                v.numero_vivienda,
                tv.nombre as tipo_vivienda,
                u.nombre_completo,
                u.email,
                pc.estado_validacion as estado_pago,
                pc.comprobante_archivo,
                CASE 
                    WHEN cm.fecha_vencimiento < CURDATE() AND cm.estado = 'pendiente' THEN 'vencida'
                    ELSE cm.estado
                END as estado_actual
            FROM Cuotas_Mensuales cm
            INNER JOIN Viviendas v ON cm.id_vivienda = v.id_vivienda
            INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
            INNER JOIN Config_Cuotas cc ON tv.id_tipo = cc.id_tipo AND cc.activo = TRUE
            INNER JOIN Usuario u ON cm.id_usuario = u.id_usuario
            LEFT JOIN Pagos_Cuotas pc ON cm.id_cuota = pc.id_cuota
            WHERE 1=1
        ";
        
        $params = [];
        
        if (!empty($filtros['mes'])) {
            $sql .= " AND cm.mes = :mes";
            $params['mes'] = $filtros['mes'];
        }
        
        if (!empty($filtros['anio'])) {
            $sql .= " AND cm.anio = :anio";
            $params['anio'] = $filtros['anio'];
        }
        
        if (!empty($filtros['estado'])) {
            if ($filtros['estado'] === 'vencida') {
                $sql .= " AND cm.fecha_vencimiento < CURDATE() AND cm.estado = 'pendiente'";
            } else {
                $sql .= " AND cm.estado = :estado";
                $params['estado'] = $filtros['estado'];
            }
        }
        
        $sql .= " ORDER BY cm.anio DESC, cm.mes DESC, u.nombre_completo ASC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
        
    } catch (\PDOException $e) {
        error_log("Error en getAllCuotas: " . $e->getMessage());
        return [];
    }
}

    /**
     * Obtener detalle de cuota por ID
     */
    public function getCuotaById($cuotaId)
    {
        try {
            $stmt = $this->conn->prepare("
                SELECT * FROM Vista_Cuotas_Completa
                WHERE id_cuota = :id_cuota
            ");
            $stmt->execute(['id_cuota' => $cuotaId]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (\PDOException $e) {
            error_log("Error en getCuotaById: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Verificar si puede pagar
     */
    public function puedeRealizarPago($cuotaId)
    {
        try {
            $cuota = $this->getCuotaById($cuotaId);
            
            if (!$cuota) {
                return [
                    'puede_pagar' => false,
                    'motivo' => 'Cuota no encontrada'
                ];
            }
            
            if ($cuota['estado'] === 'pagada') {
                return [
                    'puede_pagar' => false,
                    'motivo' => 'Esta cuota ya está pagada'
                ];
            }
            
            $horasCumplidas = floatval($cuota['horas_cumplidas']);
            $horasRequeridas = floatval($cuota['horas_requeridas']);
            
            return [
                'puede_pagar' => true,
                'horas_cumplidas' => $horasCumplidas,
                'horas_requeridas' => $horasRequeridas,
                'deuda_horas' => max(0, $horasRequeridas - $horasCumplidas)
            ];
            
        } catch (\PDOException $e) {
            error_log("Error en puedeRealizarPago: " . $e->getMessage());
            return ['puede_pagar' => false, 'motivo' => 'Error al verificar'];
        }
    }

    /**
     * Registrar pago de cuota
     * ⭐ SOLO TRANSFERENCIA BANCARIA
     */
    public function registrarPago(
        $cuotaId, 
        $idUsuario, 
        $montoPagado, 
        $metodoPago, 
        $comprobanteArchivo, 
        $numeroComprobante = null,
        $incluyeDeudaHoras = false,
        $montoDeudaHoras = 0
    ) {
        try {
            $this->conn->beginTransaction();
            
            $cuota = $this->getCuotaById($cuotaId);
            
            if (!$cuota) {
                throw new \Exception('Cuota no encontrada');
            }
            
            if ($cuota['id_usuario'] != $idUsuario) {
                throw new \Exception('Esta cuota no te pertenece');
            }
            
            if ($cuota['estado'] === 'pagada') {
                throw new \Exception('Esta cuota ya está pagada');
            }
            
            // ⭐ VALIDAR: Solo transferencia
            if ($metodoPago !== 'transferencia') {
                throw new \Exception('Método de pago inválido. Solo se acepta transferencia bancaria.');
            }
            
            $stmt = $this->conn->prepare("
                INSERT INTO Pagos_Cuotas 
                (id_cuota, id_usuario, monto_pagado, metodo_pago, comprobante_archivo, 
                 numero_comprobante, incluye_deuda_horas, monto_deuda_horas)
                VALUES 
                (:id_cuota, :id_usuario, :monto_pagado, :metodo_pago, :comprobante_archivo, 
                 :numero_comprobante, :incluye_deuda_horas, :monto_deuda_horas)
            ");
            
            $stmt->execute([
                'id_cuota' => $cuotaId,
                'id_usuario' => $idUsuario,
                'monto_pagado' => $montoPagado,
                'metodo_pago' => 'transferencia', // Forzar transferencia
                'comprobante_archivo' => $comprobanteArchivo,
                'numero_comprobante' => $numeroComprobante,
                'incluye_deuda_horas' => $incluyeDeudaHoras ? 1 : 0,
                'monto_deuda_horas' => $montoDeudaHoras
            ]);
            
            $this->conn->commit();
            
            return [
                'success' => true,
                'mensaje' => 'Pago registrado exitosamente. Será revisado por un administrador.'
            ];
            
        } catch (\Exception $e) {
            $this->conn->rollBack();
            error_log("Error en registrarPago: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Validar pago (Admin)
     */
    public function validarPago($pagoId, $idAdmin, $accion, $observaciones = '')
    {
        try {
            $this->conn->beginTransaction();
            
            $estadoValidacion = $accion === 'aprobar' ? 'aprobado' : 'rechazado';
            
            $stmt = $this->conn->prepare("
                UPDATE Pagos_Cuotas 
                SET estado_validacion = :estado,
                    observaciones_validacion = :observaciones,
                    fecha_validacion = NOW()
                WHERE id_pago = :id_pago
            ");
            
            $stmt->execute([
                'estado' => $estadoValidacion,
                'observaciones' => $observaciones,
                'id_pago' => $pagoId
            ]);
            
            if ($accion === 'aprobar') {
                $stmtCuota = $this->conn->prepare("
                    UPDATE Cuotas_Mensuales 
                    SET estado = 'pagada'
                    WHERE id_cuota = (SELECT id_cuota FROM Pagos_Cuotas WHERE id_pago = :id_pago)
                ");
                $stmtCuota->execute(['id_pago' => $pagoId]);
            }
            
            $this->conn->commit();
            
            return [
                'success' => true,
                'mensaje' => $accion === 'aprobar' ? 'Pago aprobado exitosamente' : 'Pago rechazado'
            ];
            
        } catch (\PDOException $e) {
            $this->conn->rollBack();
            error_log("Error en validarPago: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al validar pago'
            ];
        }
    }

    /**
     * Obtener precios actuales
     */
    public function getPreciosActuales()
    {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    cc.id_tipo,
                    tv.nombre as tipo_vivienda,
                    tv.habitaciones,
                    cc.monto_mensual,
                    cc.fecha_vigencia_desde
                FROM Config_Cuotas cc
                INNER JOIN Tipo_Vivienda tv ON cc.id_tipo = tv.id_tipo
                WHERE cc.activo = TRUE
                ORDER BY tv.habitaciones ASC
            ");
            
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (\PDOException $e) {
            error_log("Error en getPreciosActuales: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Actualizar precio
     */
    public function actualizarPrecio($idTipo, $montoMensual)
{
    try {
        $this->conn->beginTransaction();
        
        // 1️⃣ Actualizar precio en Config_Cuotas
        $stmt = $this->conn->prepare("
            UPDATE Config_Cuotas 
            SET monto_mensual = :monto
            WHERE id_tipo = :id_tipo
            AND activo = TRUE
        ");
        
        $stmt->execute([
            'monto' => $montoMensual,
            'id_tipo' => $idTipo
        ]);
        
        error_log("✅ Precio actualizado en Config_Cuotas");
        
        // 2️⃣ Actualizar cuotas PENDIENTES/VENCIDAS del mes actual
        $mesActual = date('n');
        $anioActual = date('Y');
        
        $stmtUpdate = $this->conn->prepare("
            UPDATE Cuotas_Mensuales cm
            INNER JOIN Viviendas v ON cm.id_vivienda = v.id_vivienda
            SET cm.monto = :nuevo_monto
            WHERE v.id_tipo = :id_tipo
            AND cm.estado IN ('pendiente', 'vencida')
            AND cm.mes = :mes
            AND cm.anio = :anio
        ");
        
        $stmtUpdate->execute([
            'nuevo_monto' => $montoMensual,
            'id_tipo' => $idTipo,
            'mes' => $mesActual,
            'anio' => $anioActual
        ]);
        
        $cuotasActualizadas = $stmtUpdate->rowCount();
        error_log("✅ Cuotas actualizadas: $cuotasActualizadas");
        
        $this->conn->commit();
        
        return [
            'success' => true,
            'message' => "Precio actualizado. $cuotasActualizadas cuotas del mes actual fueron ajustadas.",
            'cuotas_actualizadas' => $cuotasActualizadas
        ];
        
    } catch (\PDOException $e) {
        $this->conn->rollBack();
        error_log("❌ Error en actualizarPrecio: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error al actualizar precio: ' . $e->getMessage()
        ];
    }
}

    /**
     * Generar cuota individual del mes para un usuario específico
     */
    public function generarCuotaIndividual($idUsuario, $mes, $anio)
    {
        try {
            error_log("📄 [generarCuotaIndividual] Usuario: $idUsuario | Mes: $mes | Año: $anio");

            // 1. Verificar si ya existe
            $cuotasExistentes = $this->getCuotasUsuario($idUsuario, [
                'mes' => $mes,
                'anio' => $anio
            ]);

            if (count($cuotasExistentes) > 0) {
                error_log("📄 Cuota ya existe: " . $cuotasExistentes[0]['id_cuota']);
                $cuota = $cuotasExistentes[0];
                $cuota['monto_base'] = $cuota['monto'];
                
                return [
                    'success' => true,
                    'message' => 'La cuota del mes ya existe',
                    'cuota_id' => $cuota['id_cuota'],
                    'cuota' => $cuota
                ];
            }

            // 2. Obtener vivienda del usuario
            $stmtVivienda = $this->conn->prepare("
                SELECT DISTINCT av.id_vivienda, v.id_tipo
                FROM Asignacion_Vivienda av
                INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                INNER JOIN Usuario u ON (av.id_usuario = u.id_usuario OR av.id_nucleo = u.id_nucleo)
                WHERE u.id_usuario = :id_usuario
                AND av.activa = TRUE
                LIMIT 1
            ");
            $stmtVivienda->execute(['id_usuario' => $idUsuario]);
            $vivienda = $stmtVivienda->fetch(\PDO::FETCH_ASSOC);

            if (!$vivienda) {
                return [
                    'success' => false,
                    'message' => 'No tienes una vivienda asignada. Contacta al administrador.'
                ];
            }

            // 3. Obtener precio del tipo de vivienda
            $stmtPrecio = $this->conn->prepare("
                SELECT monto_mensual
                FROM Config_Cuotas
                WHERE id_tipo = :id_tipo
                AND activo = TRUE
                LIMIT 1
            ");
            $stmtPrecio->execute(['id_tipo' => $vivienda['id_tipo']]);
            $config = $stmtPrecio->fetch(\PDO::FETCH_ASSOC);

            if (!$config) {
                return [
                    'success' => false,
                    'message' => 'No se encontró configuración de precio para tu vivienda'
                ];
            }

            $montoCuota = floatval($config['monto_mensual']);
            error_log("📄 Monto cuota base: $montoCuota");

            // 4. Calcular deuda acumulada
            $stmtDeuda = $this->conn->prepare("
                SELECT COALESCE(SUM(monto + monto_pendiente_anterior), 0) as deuda_anterior
                FROM Cuotas_Mensuales
                WHERE id_usuario = :id_usuario
                AND estado != 'pagada'
                AND (anio < :anio OR (anio = :anio AND mes < :mes))
            ");
            $stmtDeuda->execute([
                'id_usuario' => $idUsuario,
                'mes' => $mes,
                'anio' => $anio
            ]);
            $deudaAnterior = floatval($stmtDeuda->fetchColumn());
            error_log("📄 Deuda anterior: $deudaAnterior");

            // 5. Fecha de vencimiento
            $fechaVencimiento = date('Y-m-t', strtotime("$anio-$mes-01"));

            // 6. Insertar cuota con 84 horas requeridas
            $stmtInsert = $this->conn->prepare("
                INSERT INTO Cuotas_Mensuales 
                (id_usuario, id_vivienda, mes, anio, monto, monto_pendiente_anterior, 
                 fecha_vencimiento, horas_requeridas, estado)
                VALUES 
                (:id_usuario, :id_vivienda, :mes, :anio, :monto, :deuda_anterior,
                 :fecha_venc, 84.00, 'pendiente')
            ");

            $insertSuccess = $stmtInsert->execute([
                'id_usuario' => $idUsuario,
                'id_vivienda' => $vivienda['id_vivienda'],
                'mes' => $mes,
                'anio' => $anio,
                'monto' => $montoCuota,
                'deuda_anterior' => $deudaAnterior,
                'fecha_venc' => $fechaVencimiento
            ]);

            if (!$insertSuccess) {
                error_log("❌ Error al insertar: " . print_r($stmtInsert->errorInfo(), true));
                return [
                    'success' => false,
                    'message' => 'Error al crear la cuota en la base de datos'
                ];
            }

            $nuevaCuotaId = $this->conn->lastInsertId();
            error_log("✅ Cuota creada con ID: $nuevaCuotaId");

            // 7. Recuperar cuota completa
            $cuotaCreada = $this->getCuotaById($nuevaCuotaId);
            
            if ($cuotaCreada) {
                if (!isset($cuotaCreada['monto_base'])) {
                    $cuotaCreada['monto_base'] = $cuotaCreada['monto'];
                }
                
                return [
                    'success' => true,
                    'message' => 'Cuota generada correctamente',
                    'cuota' => $cuotaCreada,
                    'cuota_id' => $nuevaCuotaId
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Cuota creada pero no se pudo recuperar',
                    'cuota_id' => $nuevaCuotaId
                ];
            }

        } catch (\PDOException $e) {
            error_log("❌ Exception en generarCuotaIndividual: " . $e->getMessage());
            error_log("Stack: " . $e->getTraceAsString());
            return [
                'success' => false,
                'message' => 'Error al generar cuota: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener estadísticas
     */
    public function getEstadisticasCuotas($mes = null, $anio = null)
    {
        try {
            $sql = "
                SELECT 
                    COUNT(*) as total_cuotas,
                    SUM(CASE WHEN estado = 'pagada' THEN 1 ELSE 0 END) as pagadas,
                    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                    SUM(CASE WHEN estado_actual = 'vencida' THEN 1 ELSE 0 END) as vencidas,
                    SUM(CASE WHEN estado = 'pagada' THEN monto_total ELSE 0 END) as monto_cobrado
                FROM Vista_Cuotas_Completa
                WHERE 1=1
            ";
            
            $params = [];
            
            if ($mes) {
                $sql .= " AND mes = :mes";
                $params['mes'] = $mes;
            }
            
            if ($anio) {
                $sql .= " AND anio = :anio";
                $params['anio'] = $anio;
            }
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (\PDOException $e) {
            error_log("Error en getEstadisticasCuotas: " . $e->getMessage());
            return [];
        }
    }
}