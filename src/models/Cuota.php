<?php

namespace App\Models;

use App\config\Database;
use PDO;

class Cuota
{
    private $conn;

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
     * Obtener cuotas del usuario (USA VISTA)
     */
    public function getCuotasUsuario($idUsuario, $filtros = [])
    {
        try {
        $sql = "
            SELECT 
                cm.*,
                cm.monto as monto_base,  -- ✅ AGREGAR ESTO
                (cm.monto + COALESCE(
                    (SELECT SUM(monto_deuda_horas) 
                     FROM Pagos_Cuotas 
                     WHERE id_cuota = cm.id_cuota 
                     AND estado_validacion = 'aprobado' 
                     AND incluye_deuda_horas = TRUE
                     LIMIT 1), 0)
                ) as monto_total,
                vc.*
            FROM Cuotas_Mensuales cm
            INNER JOIN Vista_Cuotas_Completa vc ON cm.id_cuota = vc.id_cuota
            WHERE vc.id_usuario = :id_usuario
        ";
            
            if (!empty($filtros['mes'])) {
                $sql .= " AND mes = :mes";
                $params['mes'] = $filtros['mes'];
            }
            
            if (!empty($filtros['anio'])) {
                $sql .= " AND anio = :anio";
                $params['anio'] = $filtros['anio'];
            }
            
            if (!empty($filtros['estado'])) {
                if ($filtros['estado'] === 'vencida') {
                    $sql .= " AND estado_actual = 'vencida'";
                } else {
                    $sql .= " AND estado = :estado";
                    $params['estado'] = $filtros['estado'];
                }
            }
            
            $sql .= " ORDER BY anio DESC, mes DESC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (\PDOException $e) {
            error_log("Error en getCuotasUsuario: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener todas las cuotas (Admin)
     */
    public function getAllCuotas($filtros = [])
    {
        try {
            $sql = "SELECT * FROM Vista_Cuotas_Completa WHERE 1=1";
            $params = [];
            
            if (!empty($filtros['mes'])) {
                $sql .= " AND mes = :mes";
                $params['mes'] = $filtros['mes'];
            }
            
            if (!empty($filtros['anio'])) {
                $sql .= " AND anio = :anio";
                $params['anio'] = $filtros['anio'];
            }
            
            if (!empty($filtros['estado'])) {
                if ($filtros['estado'] === 'vencida') {
                    $sql .= " AND estado_actual = 'vencida'";
                } else {
                    $sql .= " AND estado = :estado";
                    $params['estado'] = $filtros['estado'];
                }
            }
            
            $sql .= " ORDER BY anio DESC, mes DESC, nombre_completo ASC";
            
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
                'metodo_pago' => $metodoPago,
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
            
            return [
                'success' => true,
                'message' => 'Precio actualizado exitosamente'
            ];
            
        } catch (\PDOException $e) {
            error_log("Error en actualizarPrecio: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al actualizar precio'
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