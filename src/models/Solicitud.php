<?php

namespace App\models;

use App\config\Database;
use PDO;

class Solicitud
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    /**
     * Crear nueva solicitud
     */
    public function create($idUsuario, $tipo, $asunto, $descripcion, $archivo = null, $prioridad = 'media')
    {
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO Solicitudes 
                (id_usuario, tipo_solicitud, asunto, descripcion, archivo_adjunto, prioridad)
                VALUES 
                (:id_usuario, :tipo, :asunto, :descripcion, :archivo, :prioridad)
            ");

            $stmt->execute([
                'id_usuario' => $idUsuario,
                'tipo' => $tipo,
                'asunto' => $asunto,
                'descripcion' => $descripcion,
                'archivo' => $archivo,
                'prioridad' => $prioridad
            ]);

            $solicitudId = $this->conn->lastInsertId();

            return [
                'success' => true,
                'message' => 'Solicitud enviada correctamente',
                'id_solicitud' => $solicitudId
            ];

        } catch (\PDOException $e) {
            error_log("Error al crear solicitud: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al enviar solicitud'
            ];
        }
    }

    /**
     * Obtener solicitudes del usuario -  USAR VISTA
     */
    public function getMisSolicitudes($idUsuario, $filtros = [])
    {
        try {
            error_log("========================================");
            error_log("getMisSolicitudes - Usando Vista");
            error_log("Usuario ID: $idUsuario");
            error_log("Filtros: " . json_encode($filtros));

            //  USAR VISTA OPTIMIZADA
            $sql = "
                SELECT * FROM Vista_Solicitudes_Completa
                WHERE id_usuario = :id_usuario
            ";

            $params = ['id_usuario' => $idUsuario];

            if (!empty($filtros['estado'])) {
                $sql .= " AND estado = :estado";
                $params['estado'] = $filtros['estado'];
            }

            if (!empty($filtros['tipo'])) {
                $sql .= " AND tipo_solicitud = :tipo";
                $params['tipo'] = $filtros['tipo'];
            }

            $sql .= " ORDER BY fecha_creacion DESC";

            error_log("SQL: $sql");
            error_log("Params: " . json_encode($params));

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);

            $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Solicitudes encontradas: " . count($resultado));
            
            if (count($resultado) > 0) {
                error_log("Primera solicitud: " . json_encode($resultado[0]));
            }

            error_log("getMisSolicitudes - Fin");
            error_log("========================================");

            return $resultado;

        } catch (\PDOException $e) {
            error_log(" Error en getMisSolicitudes: " . $e->getMessage());
            error_log("SQL State: " . $e->getCode());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Obtener TODAS las solicitudes (Admin) -  USAR VISTA
     */
    public function getAllSolicitudes($filtros = [])
    {
        try {
            error_log("========================================");
            error_log("getAllSolicitudes - Usando Vista");
            error_log("Filtros: " . json_encode($filtros));

            //  USAR VISTA OPTIMIZADA
            $sql = "SELECT * FROM Vista_Solicitudes_Completa WHERE 1=1";

            $params = [];

            if (!empty($filtros['estado'])) {
                $sql .= " AND estado = :estado";
                $params['estado'] = $filtros['estado'];
            }

            if (!empty($filtros['tipo'])) {
                $sql .= " AND tipo_solicitud = :tipo";
                $params['tipo'] = $filtros['tipo'];
            }

            if (!empty($filtros['prioridad'])) {
                $sql .= " AND prioridad = :prioridad";
                $params['prioridad'] = $filtros['prioridad'];
            }

            $sql .= " ORDER BY 
                CASE prioridad 
                    WHEN 'alta' THEN 1 
                    WHEN 'media' THEN 2 
                    WHEN 'baja' THEN 3 
                END,
                fecha_creacion DESC";

            error_log("SQL: $sql");
            error_log("Params: " . json_encode($params));

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);

            $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Solicitudes encontradas: " . count($resultado));
            error_log("getAllSolicitudes - Fin");
            error_log("========================================");

            return $resultado;

        } catch (\PDOException $e) {
            error_log(" Error en getAllSolicitudes: " . $e->getMessage());
            error_log("SQL State: " . $e->getCode());
            return [];
        }
    }

    /**
     * Obtener detalle de una solicitud -  USAR VISTA
     */
    public function getById($solicitudId)
    {
        try {
            $stmt = $this->conn->prepare("
                SELECT * FROM Vista_Solicitudes_Completa
                WHERE id_solicitud = :id
            ");

            $stmt->execute(['id' => $solicitudId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);

        } catch (\PDOException $e) {
            error_log("Error en getById: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtener respuestas de una solicitud
     */
    public function getRespuestas($solicitudId)
    {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    rs.*,
                    u.nombre_completo,
                    u.email
                FROM Respuestas_Solicitudes rs
                INNER JOIN Usuario u ON rs.id_usuario = u.id_usuario
                WHERE rs.id_solicitud = :id_solicitud
                ORDER BY rs.fecha_respuesta ASC
            ");
            $stmt->execute(['id_solicitud' => $solicitudId]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (\PDOException $e) {
            error_log("Error en getRespuestas: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Agregar respuesta a una solicitud
     */
    public function addRespuesta($solicitudId, $idUsuario, $mensaje, $esAdmin = false, $archivo = null)
    {
        try {
            $this->conn->beginTransaction();

            // Insertar respuesta
            $stmt = $this->conn->prepare("
                INSERT INTO Respuestas_Solicitudes 
                (id_solicitud, id_usuario, es_admin, mensaje, archivo_adjunto)
                VALUES 
                (:id_solicitud, :id_usuario, :es_admin, :mensaje, :archivo)
            ");

            $stmt->execute([
                'id_solicitud' => $solicitudId,
                'id_usuario' => $idUsuario,
                'es_admin' => $esAdmin ? 1 : 0,
                'mensaje' => $mensaje,
                'archivo' => $archivo
            ]);

            // Actualizar estado si es admin quien responde
            if ($esAdmin) {
                $stmtUpdate = $this->conn->prepare("
                    UPDATE Solicitudes 
                    SET estado = 'en_revision'
                    WHERE id_solicitud = :id
                    AND estado = 'pendiente'
                ");
                $stmtUpdate->execute(['id' => $solicitudId]);
            }

            $this->conn->commit();

            return [
                'success' => true,
                'message' => 'Respuesta enviada correctamente'
            ];

        } catch (\PDOException $e) {
            $this->conn->rollBack();
            error_log("Error en addRespuesta: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al enviar respuesta'
            ];
        }
    }

    /**
     * Actualizar estado de solicitud (Admin)
     */
    public function updateEstado($solicitudId, $nuevoEstado, $idAdmin)
    {
        try {
            $stmt = $this->conn->prepare("
                UPDATE Solicitudes 
                SET estado = :estado
                WHERE id_solicitud = :id
            ");

            $stmt->execute([
                'estado' => $nuevoEstado,
                'id' => $solicitudId
            ]);

            return [
                'success' => true,
                'message' => 'Estado actualizado correctamente'
            ];

        } catch (\PDOException $e) {
            error_log("Error en updateEstado: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al actualizar estado'
            ];
        }
    }

    /**
     * Obtener estadísticas de solicitudes (Admin)
     */
    public function getEstadisticas()
    {
        try {
            $stmt = $this->conn->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                    SUM(CASE WHEN estado = 'en_revision' THEN 1 ELSE 0 END) as en_revision,
                    SUM(CASE WHEN estado = 'resuelta' THEN 1 ELSE 0 END) as resueltas,
                    SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as rechazadas,
                    SUM(CASE WHEN prioridad = 'alta' THEN 1 ELSE 0 END) as prioridad_alta
                FROM Solicitudes
            ");

            return $stmt->fetch(PDO::FETCH_ASSOC);

        } catch (\PDOException $e) {
            error_log("Error en getEstadisticas: " . $e->getMessage());
            return [];
        }
    }
}