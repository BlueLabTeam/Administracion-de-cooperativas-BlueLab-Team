<?php


namespace App\models;

use App\config\Database;
use PDO;

class JustificacionHoras
{
    private $conn;
    private $costo_hora = 160;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    /**
     * Crear justificación de horas
     */
    public function crearJustificacion(
        $idUsuario, 
        $mes, 
        $anio, 
        $horasJustificadas, 
        $motivo, 
        $idAdmin, 
        $archivoAdjunto = null,
        $observaciones = null
    ) {
        try {
            $this->conn->beginTransaction();
            
            error_log("=== Creando justificación ===");
            error_log("Usuario: $idUsuario, Mes: $mes, Año: $anio, Horas: $horasJustificadas");
            
            // Validar que no exceda las horas faltantes
            $stmt = $this->conn->prepare("
                SELECT 
                    cm.horas_requeridas,
                    cm.horas_cumplidas,
                    COALESCE(SUM(jh.horas_justificadas), 0) as ya_justificadas,
                    GREATEST(0, cm.horas_requeridas - cm.horas_cumplidas - COALESCE(SUM(jh.horas_justificadas), 0)) as horas_disponibles
                FROM Cuotas_Mensuales cm
                LEFT JOIN Justificaciones_Horas jh ON 
                    cm.id_usuario = jh.id_usuario AND 
                    cm.mes = jh.mes AND 
                    cm.anio = jh.anio AND
                    jh.estado = 'aprobada'
                WHERE cm.id_usuario = :id_usuario 
                AND cm.mes = :mes 
                AND cm.anio = :anio
                GROUP BY cm.id_cuota
            ");
            
            $stmt->execute([
                'id_usuario' => $idUsuario,
                'mes' => $mes,
                'anio' => $anio
            ]);
            
            $info = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$info) {
                throw new \Exception('No se encontró la cuota del período especificado');
            }
            
            error_log("Horas disponibles para justificar: " . $info['horas_disponibles']);
            
            if ($horasJustificadas > $info['horas_disponibles']) {
                throw new \Exception("Solo puedes justificar hasta {$info['horas_disponibles']}h (ya hay {$info['ya_justificadas']}h justificadas)");
            }
            
            // Calcular descuento
            $montoDescontado = $horasJustificadas * $this->costo_hora;
            
            error_log("Monto a descontar: $" . $montoDescontado);
            
            // Insertar justificación
            $stmt = $this->conn->prepare("
                INSERT INTO Justificaciones_Horas 
                (id_usuario, mes, anio, horas_justificadas, motivo, archivo_adjunto, 
                 monto_descontado, id_admin, observaciones, estado)
                VALUES 
                (:id_usuario, :mes, :anio, :horas_justificadas, :motivo, :archivo_adjunto,
                 :monto_descontado, :id_admin, :observaciones, 'aprobada')
            ");
            
            $stmt->execute([
                'id_usuario' => $idUsuario,
                'mes' => $mes,
                'anio' => $anio,
                'horas_justificadas' => $horasJustificadas,
                'motivo' => $motivo,
                'archivo_adjunto' => $archivoAdjunto,
                'monto_descontado' => $montoDescontado,
                'id_admin' => $idAdmin,
                'observaciones' => $observaciones
            ]);
            
            $justificacionId = $this->conn->lastInsertId();
            
            error_log(" Justificación creada con ID: $justificacionId");
            
            $this->conn->commit();
            
            return [
                'success' => true,
                'message' => "Justificación aprobada: {$horasJustificadas}h × \$160 = \${$montoDescontado}",
                'id_justificacion' => $justificacionId,
                'horas_justificadas' => $horasJustificadas,
                'monto_descontado' => $montoDescontado
            ];
            
        } catch (\Exception $e) {
            $this->conn->rollBack();
            error_log(" Error en crearJustificacion: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtener justificaciones de un usuario en un período
     */
    public function getJustificaciones($idUsuario, $mes = null, $anio = null)
    {
        try {
            $sql = "
                SELECT 
                    jh.*,
                    u_admin.nombre_completo as admin_nombre,
                    u_usuario.nombre_completo as usuario_nombre
                FROM Justificaciones_Horas jh
                INNER JOIN Usuario u_usuario ON jh.id_usuario = u_usuario.id_usuario
                INNER JOIN Usuario u_admin ON jh.id_admin = u_admin.id_usuario
                WHERE jh.id_usuario = :id_usuario
            ";
            
            $params = ['id_usuario' => $idUsuario];
            
            if ($mes) {
                $sql .= " AND jh.mes = :mes";
                $params['mes'] = $mes;
            }
            
            if ($anio) {
                $sql .= " AND jh.anio = :anio";
                $params['anio'] = $anio;
            }
            
            $sql .= " ORDER BY jh.fecha_justificacion DESC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (\PDOException $e) {
            error_log("Error en getJustificaciones: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Eliminar justificación
     */
    public function eliminarJustificacion($idJustificacion, $idAdmin)
    {
        try {
            $this->conn->beginTransaction();
            
            // Verificar que existe y obtener info
            $stmt = $this->conn->prepare("
                SELECT * FROM Justificaciones_Horas 
                WHERE id_justificacion = :id
            ");
            $stmt->execute(['id' => $idJustificacion]);
            $justificacion = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$justificacion) {
                throw new \Exception('Justificación no encontrada');
            }
            
            // Eliminar archivo si existe
            if ($justificacion['archivo_adjunto']) {
                $rutaArchivo = __DIR__ . '/../../storage/' . $justificacion['archivo_adjunto'];
                if (file_exists($rutaArchivo)) {
                    unlink($rutaArchivo);
                }
            }
            
            // Eliminar registro
            $stmt = $this->conn->prepare("
                DELETE FROM Justificaciones_Horas 
                WHERE id_justificacion = :id
            ");
            $stmt->execute(['id' => $idJustificacion]);
            
            $this->conn->commit();
            
            return [
                'success' => true,
                'message' => 'Justificación eliminada correctamente'
            ];
            
        } catch (\Exception $e) {
            $this->conn->rollBack();
            error_log("Error en eliminarJustificacion: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}