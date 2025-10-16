<?php

namespace App\Models;

use App\config\Database;
use PDO;
use PDOException;

class Cuota
{
    public $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    /**
     * Obtener cuotas del usuario con toda la información
     */
    public function getCuotasUsuario($userId, $filtros = [])
    {
        try {
            $sql = "SELECT 
                        cm.id_cuota,
                        cm.id_usuario,
                        cm.id_vivienda,
                        cm.mes,
                        cm.anio,
                        cm.monto,
                        cm.monto_pendiente_anterior,
                        cm.monto_total,
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
                        pc.id_pago,
                        pc.monto_pagado,
                        pc.fecha_pago,
                        pc.metodo_pago,
                        pc.comprobante_archivo,
                        pc.numero_comprobante,
                        pc.estado_validacion as estado_pago,
                        pc.observaciones_validacion,
                        CASE 
                            WHEN cm.fecha_vencimiento < CURDATE() AND cm.estado = 'pendiente' THEN 'vencida'
                            ELSE cm.estado
                        END as estado_actual
                    FROM Cuotas_Mensuales cm
                    INNER JOIN Viviendas v ON cm.id_vivienda = v.id_vivienda
                    INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                    LEFT JOIN Pagos_Cuotas pc ON cm.id_cuota = pc.id_cuota AND pc.estado_validacion != 'rechazado'
                    WHERE cm.id_usuario = :user_id";

            if (!empty($filtros['estado'])) {
                $sql .= " AND cm.estado = :estado";
            }

            if (!empty($filtros['mes'])) {
                $sql .= " AND cm.mes = :mes";
            }

            if (!empty($filtros['anio'])) {
                $sql .= " AND cm.anio = :anio";
            }

            $sql .= " ORDER BY cm.anio DESC, cm.mes DESC";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);

            if (!empty($filtros['estado'])) {
                $stmt->bindParam(':estado', $filtros['estado']);
            }
            if (!empty($filtros['mes'])) {
                $stmt->bindParam(':mes', $filtros['mes'], PDO::PARAM_INT);
            }
            if (!empty($filtros['anio'])) {
                $stmt->bindParam(':anio', $filtros['anio'], PDO::PARAM_INT);
            }

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            error_log("Error en getCuotasUsuario: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Obtener detalle completo de una cuota
     */
    public function getCuotaById($cuotaId)
    {
        try {
            $sql = "SELECT 
                        cm.*,
                        v.numero_vivienda,
                        tv.nombre as tipo_vivienda,
                        tv.habitaciones,
                        u.nombre_completo,
                        u.email,
                        pc.id_pago,
                        pc.comprobante_archivo,
                        pc.estado_validacion as estado_pago,
                        pc.fecha_pago,
                        pc.observaciones_validacion
                    FROM Cuotas_Mensuales cm
                    INNER JOIN Viviendas v ON cm.id_vivienda = v.id_vivienda
                    INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                    INNER JOIN Usuario u ON cm.id_usuario = u.id_usuario
                    LEFT JOIN Pagos_Cuotas pc ON cm.id_cuota = pc.id_cuota
                    WHERE cm.id_cuota = :cuota_id";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':cuota_id', $cuotaId, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            error_log("Error en getCuotaById: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generar TODAS las cuotas del mes para todos los usuarios
     * Se ejecuta automáticamente el 1° de cada mes (CRON JOB)
     */
    public function generarCuotasMensuales($mes, $anio)
    {
        try {
            error_log("=== INICIO generarCuotasMensuales ===");
            error_log("Mes: $mes, Año: $anio");

            $this->conn->beginTransaction();

            // Obtener todos los usuarios con vivienda asignada activa
            $sql = "SELECT DISTINCT
                        u.id_usuario,
                        av.id_vivienda,
                        v.id_tipo
                    FROM Usuario u
                    INNER JOIN Asignacion_Vivienda av ON (
                        (av.id_usuario = u.id_usuario AND av.id_nucleo IS NULL) OR
                        (av.id_nucleo = u.id_nucleo AND av.id_usuario IS NULL)
                    )
                    INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                    WHERE av.activa = TRUE
                    AND u.estado = 'aceptado'
                    AND av.fecha_asignacion <= CURDATE()";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

            error_log("Usuarios con vivienda: " . count($usuarios));

            $generadas = 0;

            foreach ($usuarios as $user) {
                // Verificar si ya existe cuota para este mes
                $sql = "SELECT id_cuota FROM Cuotas_Mensuales 
                        WHERE id_usuario = :user_id AND mes = :mes AND anio = :anio";
                
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([
                    'user_id' => $user['id_usuario'],
                    'mes' => $mes,
                    'anio' => $anio
                ]);

                if ($stmt->fetch()) {
                    error_log("Cuota ya existe para usuario {$user['id_usuario']}");
                    continue;
                }

                // Obtener MONTO GLOBAL del tipo de vivienda (PRECIO ÚNICO)
                $sql = "SELECT monto_mensual FROM Config_Cuotas
                        WHERE id_tipo = :id_tipo
                        AND activo = TRUE
                        AND fecha_vigencia_desde <= CURDATE()
                        AND (fecha_vigencia_hasta IS NULL OR fecha_vigencia_hasta >= CURDATE())
                        LIMIT 1";
                
                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':id_tipo', $user['id_tipo'], PDO::PARAM_INT);
                $stmt->execute();
                $config = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$config) {
                    error_log("⚠️ No hay precio configurado para tipo {$user['id_tipo']}");
                    continue;
                }

                $montoBase = $config['monto_mensual'];

                // CALCULAR DEUDA ACUMULADA DEL MES ANTERIOR (NO PAGADA)
                $montoPendiente = $this->calcularDeudaAnterior($user['id_usuario'], $mes, $anio);

                // Monto total = monto base + deuda anterior
                $montoTotal = $montoBase + $montoPendiente;

                // Fecha de vencimiento (último día del mes)
                $fechaVencimiento = date('Y-m-t', strtotime("$anio-$mes-01"));

                // Insertar cuota
                $sql = "INSERT INTO Cuotas_Mensuales 
                        (id_usuario, id_vivienda, mes, anio, monto, monto_pendiente_anterior, 
                         monto_total, fecha_vencimiento, horas_requeridas, estado)
                        VALUES (:user_id, :vivienda_id, :mes, :anio, :monto, :pendiente, 
                                :total, :fecha_venc, 40.00, 'pendiente')";

                $stmt = $this->conn->prepare($sql);
                $result = $stmt->execute([
                    'user_id' => $user['id_usuario'],
                    'vivienda_id' => $user['id_vivienda'],
                    'mes' => $mes,
                    'anio' => $anio,
                    'monto' => $montoBase,
                    'pendiente' => $montoPendiente,
                    'total' => $montoTotal,
                    'fecha_venc' => $fechaVencimiento
                ]);

                if ($result) {
                    $generadas++;
                    error_log("✓ Cuota generada para usuario {$user['id_usuario']} - Total: $montoTotal");
                }
            }

            $this->conn->commit();
            error_log("✓ Total cuotas generadas: $generadas");
            error_log("=== FIN generarCuotasMensuales ===");

            return [
                'success' => true,
                'cuotas_generadas' => $generadas,
                'mensaje' => "Se generaron $generadas cuotas para $mes/$anio"
            ];

        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("❌ Error en generarCuotasMensuales: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * IMPORTANTE: Calcular deuda acumulada de meses anteriores NO PAGADOS
     * Si un usuario no pagó en meses anteriores, eso se suma a la nueva cuota
     */
    private function calcularDeudaAnterior($userId, $mesActual, $anioActual)
    {
        try {
            // Sumar MONTO TOTAL de cuotas NO pagadas de meses anteriores
            $sql = "SELECT COALESCE(SUM(monto_total), 0) as deuda_total
                    FROM Cuotas_Mensuales
                    WHERE id_usuario = :user_id
                    AND estado NOT IN ('pagada', 'exonerada')
                    AND (
                        anio < :anio
                        OR (anio = :anio AND mes < :mes)
                    )";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                'user_id' => $userId,
                'anio' => $anioActual,
                'mes' => $mesActual
            ]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (float)($result['deuda_total'] ?? 0);

        } catch (PDOException $e) {
            error_log("Error en calcularDeudaAnterior: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Verificar si puede pagar (validar horas trabajadas)
     */
    public function puedeRealizarPago($cuotaId)
    {
        try {
            $cuota = $this->getCuotaById($cuotaId);

            if (!$cuota) {
                return [
                    'puede_pagar' => false,
                    'mensaje' => 'Cuota no encontrada'
                ];
            }

            // Ya pagada
            if ($cuota['estado'] === 'pagada') {
                return [
                    'puede_pagar' => false,
                    'mensaje' => 'Esta cuota ya está pagada'
                ];
            }

            // Verificar horas trabajadas del mes
            $sql = "SELECT COALESCE(SUM(total_horas), 0) as horas_trabajadas
                    FROM Registro_Horas
                    WHERE id_usuario = :user_id
                    AND MONTH(fecha) = :mes
                    AND YEAR(fecha) = :anio
                    AND estado = 'aprobado'";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                'user_id' => $cuota['id_usuario'],
                'mes' => $cuota['mes'],
                'anio' => $cuota['anio']
            ]);

            $horasCumplidas = $stmt->fetchColumn();

            // Actualizar horas en la cuota
            $sqlUpdate = "UPDATE Cuotas_Mensuales 
                         SET horas_cumplidas = :horas 
                         WHERE id_cuota = :cuota_id";
            $stmtUpdate = $this->conn->prepare($sqlUpdate);
            $stmtUpdate->execute([
                'horas' => $horasCumplidas,
                'cuota_id' => $cuotaId
            ]);

            $horasRequeridas = $cuota['horas_requeridas'];
            $horasFaltantes = max(0, $horasRequeridas - $horasCumplidas);

            // PERMITIR PAGO SIEMPRE (aunque falten horas)
            return [
                'puede_pagar' => true,
                'mensaje' => $horasCumplidas >= $horasRequeridas 
                    ? 'Puedes realizar el pago' 
                    : 'Puedes pagar, pero aún faltan horas de trabajo.',
                'horas_requeridas' => $horasRequeridas,
                'horas_cumplidas' => (float)$horasCumplidas,
                'horas_faltantes' => $horasFaltantes,
                'cumple_horas' => $horasCumplidas >= $horasRequeridas
            ];

        } catch (PDOException $e) {
            error_log("Error en puedeRealizarPago: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Registrar pago (subir comprobante)
     */
    public function registrarPago($cuotaId, $userId, $montoPagado, $metodoPago, $archivoComprobante, $numeroComprobante)
    {
        try {
            error_log("=== INICIO registrarPago ===");
            error_log("Cuota ID: $cuotaId, Usuario ID: $userId, Monto: $montoPagado");

            $this->conn->beginTransaction();

            // Verificar cuota
            $cuota = $this->getCuotaById($cuotaId);
            if (!$cuota) {
                throw new \Exception("Cuota no encontrada");
            }

            if ($cuota['estado'] === 'pagada') {
                throw new \Exception("Esta cuota ya está pagada");
            }

            // Verificar si ya existe un pago pendiente
            $sql = "SELECT COUNT(*) FROM Pagos_Cuotas 
                    WHERE id_cuota = :cuota_id AND estado_validacion = 'pendiente'";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute(['cuota_id' => $cuotaId]);
            
            if ($stmt->fetchColumn() > 0) {
                throw new \Exception("Ya existe un pago pendiente de validación para esta cuota");
            }

            // Insertar pago pendiente de aprobación
            $sql = "INSERT INTO Pagos_Cuotas 
                    (id_cuota, id_usuario, monto_pagado, metodo_pago, comprobante_archivo, 
                     numero_comprobante, estado_validacion, fecha_pago)
                    VALUES (:cuota_id, :user_id, :monto, :metodo, :archivo, :numero, 'pendiente', NOW())";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                'cuota_id' => $cuotaId,
                'user_id' => $userId,
                'monto' => $montoPagado,
                'metodo' => $metodoPago,
                'archivo' => $archivoComprobante,
                'numero' => $numeroComprobante
            ]);

            $pagoId = $this->conn->lastInsertId();

            $this->conn->commit();

            error_log("✓ Pago registrado con ID: $pagoId");
            error_log("=== FIN registrarPago ===");

            return [
                'success' => true,
                'mensaje' => 'Pago enviado correctamente. Será revisado por un administrador.',
                'id_pago' => $pagoId
            ];

        } catch (\Exception $e) {
            $this->conn->rollBack();
            error_log("❌ Error en registrarPago: " . $e->getMessage());
            return [
                'success' => false,
                'mensaje' => $e->getMessage()
            ];
        }
    }

    /**
     * Validar pago (ADMIN aprueba/rechaza)
     */
    public function validarPago($pagoId, $adminId, $accion, $observaciones = '')
    {
        try {
            error_log("=== INICIO validarPago ===");
            error_log("Pago ID: $pagoId, Acción: $accion");

            $this->conn->beginTransaction();

            // Obtener información del pago
            $sql = "SELECT pc.*, cm.id_cuota, cm.estado as cuota_estado
                    FROM Pagos_Cuotas pc
                    INNER JOIN Cuotas_Mensuales cm ON pc.id_cuota = cm.id_cuota
                    WHERE pc.id_pago = :pago_id";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':pago_id', $pagoId, PDO::PARAM_INT);
            $stmt->execute();
            $pago = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$pago) {
                throw new \Exception("Pago no encontrado");
            }

            $nuevoEstado = ($accion === 'aprobar') ? 'aprobado' : 'rechazado';

            // Actualizar estado del pago
            $sql = "UPDATE Pagos_Cuotas 
                    SET estado_validacion = :estado,
                        validado_por = :admin_id,
                        fecha_validacion = NOW(),
                        observaciones_validacion = :obs
                    WHERE id_pago = :pago_id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                'estado' => $nuevoEstado,
                'admin_id' => $adminId,
                'obs' => $observaciones,
                'pago_id' => $pagoId
            ]);

            // Si se APRUEBA el pago
            if ($accion === 'aprobar') {
                $sql = "UPDATE Cuotas_Mensuales 
                        SET estado = 'pagada',
                            horas_validadas = TRUE
                        WHERE id_cuota = :cuota_id";

                $stmt = $this->conn->prepare($sql);
                $stmt->bindParam(':cuota_id', $pago['id_cuota'], PDO::PARAM_INT);
                $stmt->execute();

                error_log("✓ Cuota marcada como pagada");
            } else {
                // Si se RECHAZA, el usuario puede reintentar
                error_log("⚠️ Pago rechazado - usuario puede reintentar");
            }

            $this->conn->commit();

            error_log("=== FIN validarPago ===");

            return [
                'success' => true,
                'mensaje' => $accion === 'aprobar' 
                    ? 'Pago aprobado correctamente' 
                    : 'Pago rechazado. El usuario podrá volver a intentarlo'
            ];

        } catch (\Exception $e) {
            $this->conn->rollBack();
            error_log("❌ Error en validarPago: " . $e->getMessage());
            return [
                'success' => false,
                'mensaje' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtener todas las cuotas (ADMIN)
     */
    public function getAllCuotas($filtros = [])
    {
        try {
            $sql = "SELECT 
                        cm.id_cuota,
                        cm.id_usuario,
                        cm.mes,
                        cm.anio,
                        cm.monto,
                        cm.monto_pendiente_anterior,
                        cm.monto_total,
                        cm.estado,
                        cm.fecha_vencimiento,
                        cm.horas_cumplidas,
                        cm.horas_requeridas,
                        u.nombre_completo,
                        u.email,
                        v.numero_vivienda,
                        tv.nombre as tipo_vivienda,
                        pc.id_pago,
                        pc.fecha_pago,
                        pc.estado_validacion as estado_pago,
                        pc.comprobante_archivo,
                        CASE 
                            WHEN cm.fecha_vencimiento < CURDATE() AND cm.estado = 'pendiente' THEN 'vencida'
                            ELSE cm.estado
                        END as estado_actual
                    FROM Cuotas_Mensuales cm
                    INNER JOIN Usuario u ON cm.id_usuario = u.id_usuario
                    INNER JOIN Viviendas v ON cm.id_vivienda = v.id_vivienda
                    INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                    LEFT JOIN Pagos_Cuotas pc ON cm.id_cuota = pc.id_cuota
                    WHERE 1=1";

            if (!empty($filtros['estado'])) {
                $sql .= " AND cm.estado = :estado";
            }

            if (!empty($filtros['mes'])) {
                $sql .= " AND cm.mes = :mes";
            }

            if (!empty($filtros['anio'])) {
                $sql .= " AND cm.anio = :anio";
            }

            $sql .= " ORDER BY cm.anio DESC, cm.mes DESC, u.nombre_completo";

            $stmt = $this->conn->prepare($sql);

            if (!empty($filtros['estado'])) {
                $stmt->bindParam(':estado', $filtros['estado']);
            }
            if (!empty($filtros['mes'])) {
                $stmt->bindParam(':mes', $filtros['mes'], PDO::PARAM_INT);
            }
            if (!empty($filtros['anio'])) {
                $stmt->bindParam(':anio', $filtros['anio'], PDO::PARAM_INT);
            }

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            error_log("Error en getAllCuotas: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Obtener estadísticas
     */
    public function getEstadisticasCuotas($mes = null, $anio = null)
    {
        try {
            $sql = "SELECT 
                        COUNT(*) as total_cuotas,
                        SUM(CASE WHEN estado = 'pagada' THEN 1 ELSE 0 END) as pagadas,
                        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                        SUM(CASE WHEN fecha_vencimiento < CURDATE() AND estado = 'pendiente' THEN 1 ELSE 0 END) as vencidas,
                        SUM(CASE WHEN estado = 'pagada' THEN monto_total ELSE 0 END) as monto_cobrado,
                        SUM(CASE WHEN estado != 'pagada' THEN monto_total ELSE 0 END) as monto_pendiente
                    FROM Cuotas_Mensuales
                    WHERE 1=1";

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

        } catch (PDOException $e) {
            error_log("Error en getEstadisticasCuotas: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Obtener precios actuales (GLOBALES por tipo de vivienda)
     */
    public function getPreciosActuales()
    {
        try {
            $sql = "SELECT 
                        cc.id_config,
                        cc.id_tipo,
                        tv.nombre as tipo_vivienda,
                        tv.habitaciones,
                        cc.monto_mensual,
                        cc.fecha_vigencia_desde
                    FROM Config_Cuotas cc
                    INNER JOIN Tipo_Vivienda tv ON cc.id_tipo = tv.id_tipo
                    WHERE cc.activo = TRUE
                    ORDER BY tv.habitaciones";

            $stmt = $this->conn->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            error_log("Error en getPreciosActuales: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Actualizar precio GLOBAL (afecta a todos los usuarios de ese tipo)
     */
    public function actualizarPrecio($idTipo, $montoMensual)
    {
        try {
            error_log("Actualizando precio: Tipo $idTipo = $montoMensual");

            $this->conn->beginTransaction();

            // Desactivar configuración anterior
            $sql = "UPDATE Config_Cuotas 
                    SET activo = FALSE, fecha_vigencia_hasta = CURDATE()
                    WHERE id_tipo = :id_tipo AND activo = TRUE";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute(['id_tipo' => $idTipo]);

            // Insertar nueva configuración (GLOBAL)
            $sql = "INSERT INTO Config_Cuotas (id_tipo, monto_mensual, fecha_vigencia_desde)
                    VALUES (:id_tipo, :monto, CURDATE())";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                'id_tipo' => $idTipo,
                'monto' => $montoMensual
            ]);

            $this->conn->commit();

            error_log("✓ Precio actualizado - próximas cuotas usarán este monto");

            return [
                'success' => true,
                'mensaje' => 'Precio actualizado exitosamente. Las próximas cuotas generadas usarán este nuevo monto.'
            ];

        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("❌ Error en actualizarPrecio: " . $e->getMessage());
            throw $e;
        }
    }
}