<?php

namespace App\Models;

use App\config\Database;
use PDO;
use PDOException;

class Nucleo
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    // Crear nuevo núcleo familiar
    public function create($nombreNucleo, $direccion)
    {
        try {
            $sql = "INSERT INTO Nucleo_Familiar (nombre_nucleo, direccion) VALUES (:nombre, :direccion)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':nombre', $nombreNucleo);
            $stmt->bindParam(':direccion', $direccion);
            $stmt->execute();
            
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log("Error al crear núcleo: " . $e->getMessage());
            throw $e;
        }
    }

    // Asignar usuarios a un núcleo
    public function assignUsers($nucleoId, $usuariosIds)
    {
        try {
            $sql = "UPDATE Usuario SET id_nucleo = :nucleo_id WHERE id_usuario = :user_id";
            $stmt = $this->conn->prepare($sql);
            
            foreach ($usuariosIds as $userId) {
                $stmt->bindParam(':nucleo_id', $nucleoId);
                $stmt->bindParam(':user_id', $userId);
                $stmt->execute();
            }
            
            return true;
        } catch (PDOException $e) {
            error_log("Error al asignar usuarios: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener todos los núcleos con información de miembros
    public function getAllWithMembers()
    {
        try {
            $sql = "SELECT 
                        nf.id_nucleo,
                        nf.nombre_nucleo,
                        nf.direccion,
                        COUNT(u.id_usuario) as total_miembros,
                        GROUP_CONCAT(u.nombre_completo SEPARATOR ', ') as miembros_nombres
                    FROM Nucleo_Familiar nf
                    LEFT JOIN Usuario u ON nf.id_nucleo = u.id_nucleo
                    GROUP BY nf.id_nucleo
                    ORDER BY nf.nombre_nucleo";
            
            $stmt = $this->conn->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener núcleos: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener núcleo por ID
    public function getById($nucleoId)
    {
        try {
            $sql = "SELECT * FROM Nucleo_Familiar WHERE id_nucleo = :nucleo_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':nucleo_id', $nucleoId);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener núcleo: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener miembros de un núcleo
    public function getMembers($nucleoId)
    {
        try {
            $sql = "SELECT 
                        u.id_usuario,
                        u.nombre_completo,
                        u.email,
                        u.cedula,
                        u.estado,
                        r.nombre_rol
                    FROM Usuario u
                    LEFT JOIN Rol r ON u.id_rol = r.id_rol
                    WHERE u.id_nucleo = :nucleo_id
                    ORDER BY u.nombre_completo";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':nucleo_id', $nucleoId);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener miembros: " . $e->getMessage());
            throw $e;
        }
    }

    // Actualizar información del núcleo
    public function update($nucleoId, $nombreNucleo, $direccion)
    {
        try {
            $sql = "UPDATE Nucleo_Familiar 
                    SET nombre_nucleo = :nombre, direccion = :direccion 
                    WHERE id_nucleo = :nucleo_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':nombre', $nombreNucleo);
            $stmt->bindParam(':direccion', $direccion);
            $stmt->bindParam(':nucleo_id', $nucleoId);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error al actualizar núcleo: " . $e->getMessage());
            throw $e;
        }
    }

    // Actualizar miembros del núcleo
    public function updateMembers($nucleoId, $nuevosUsuariosIds)
    {
        try {
            // Primero, remover el núcleo de todos los usuarios actuales
            $sql = "UPDATE Usuario SET id_nucleo = NULL WHERE id_nucleo = :nucleo_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':nucleo_id', $nucleoId);
            $stmt->execute();
            
            // Luego, asignar los nuevos usuarios
            if (!empty($nuevosUsuariosIds)) {
                $this->assignUsers($nucleoId, $nuevosUsuariosIds);
            }
            
            return true;
        } catch (PDOException $e) {
            error_log("Error al actualizar miembros: " . $e->getMessage());
            throw $e;
        }
    }

    // Eliminar núcleo
    public function delete($nucleoId)
    {
        try {
            // Primero, desasignar usuarios
            $sql = "UPDATE Usuario SET id_nucleo = NULL WHERE id_nucleo = :nucleo_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':nucleo_id', $nucleoId);
            $stmt->execute();
            
            // Luego, eliminar el núcleo
            $sql = "DELETE FROM Nucleo_Familiar WHERE id_nucleo = :nucleo_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':nucleo_id', $nucleoId);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error al eliminar núcleo: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener usuarios disponibles (sin núcleo o del núcleo actual)
    public function getAvailableUsers($nucleoIdExclude = null)
    {
        try {
            $sql = "SELECT 
                        u.id_usuario,
                        u.nombre_completo,
                        u.email,
                        u.cedula,
                        u.estado,
                        u.id_nucleo
                    FROM Usuario u
                    WHERE u.estado = 'aceptado'
                    ORDER BY u.nombre_completo";
            
            $stmt = $this->conn->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener usuarios disponibles: " . $e->getMessage());
            throw $e;
        }
    }

    // Verificar si un núcleo tiene tareas asignadas
    public function hasTasks($nucleoId)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM Tarea_Nucleo WHERE id_nucleo = :nucleo_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':nucleo_id', $nucleoId);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'] > 0;
        } catch (PDOException $e) {
            error_log("Error al verificar tareas: " . $e->getMessage());
            return false;
        }
    }

    // ========== NUEVOS MÉTODOS PARA SOLICITUDES ==========

    /**
     * Obtener núcleos disponibles (sin filtrar por usuario)
     */
    public function getNucleosDisponibles()
    {
        try {
            $sql = "SELECT 
                        nf.id_nucleo,
                        nf.nombre_nucleo,
                        nf.direccion,
                        COUNT(DISTINCT u.id_usuario) as total_miembros,
                        GROUP_CONCAT(DISTINCT u.nombre_completo ORDER BY u.nombre_completo SEPARATOR ', ') as miembros_nombres
                    FROM Nucleo_Familiar nf
                    LEFT JOIN Usuario u ON nf.id_nucleo = u.id_nucleo
                    GROUP BY nf.id_nucleo
                    ORDER BY nf.nombre_nucleo";
            
            $stmt = $this->conn->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en getNucleosDisponibles: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Crear solicitud para unirse a un núcleo
     */
    public function crearSolicitudNucleo($idUsuario, $idNucleo, $mensaje = '')
    {
        try {
            // Verificar que el usuario no tenga ya un núcleo
            $sql = "SELECT id_nucleo FROM Usuario WHERE id_usuario = :usuario";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':usuario' => $idUsuario]);
            $usuarioData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($usuarioData && $usuarioData['id_nucleo']) {
                throw new \Exception("Ya perteneces a un núcleo familiar");
            }

            // Verificar que no exista solicitud pendiente
            $sql = "SELECT COUNT(*) as count FROM Solicitudes_Nucleo 
                    WHERE id_usuario = :usuario AND id_nucleo = :nucleo AND estado = 'pendiente'";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':usuario' => $idUsuario, ':nucleo' => $idNucleo]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result['count'] > 0) {
                throw new \Exception("Ya tienes una solicitud pendiente para este núcleo");
            }

            // Crear solicitud
            $sql = "INSERT INTO Solicitudes_Nucleo (id_usuario, id_nucleo, mensaje, estado, fecha_solicitud) 
                    VALUES (:usuario, :nucleo, :mensaje, 'pendiente', NOW())";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':usuario' => $idUsuario,
                ':nucleo' => $idNucleo,
                ':mensaje' => $mensaje
            ]);
            
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log("Error en crearSolicitudNucleo: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Obtener solicitudes del usuario actual
     */
    public function getSolicitudesUsuario($idUsuario)
    {
        try {
            $sql = "SELECT * FROM Vista_Solicitudes_Nucleo 
                    WHERE id_usuario = :usuario 
                    ORDER BY fecha_solicitud DESC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':usuario' => $idUsuario]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en getSolicitudesUsuario: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Obtener todas las solicitudes pendientes (Admin)
     */
    public function getSolicitudesPendientes()
    {
        try {
            $sql = "SELECT * FROM Vista_Solicitudes_Nucleo 
                    WHERE estado = 'pendiente' 
                    ORDER BY fecha_solicitud ASC";
            
            $stmt = $this->conn->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en getSolicitudesPendientes: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Aprobar solicitud de núcleo
     */
    public function aprobarSolicitudNucleo($solicitudId, $adminId, $observaciones = '')
    {
        try {
            $this->conn->beginTransaction();

            // Obtener datos de la solicitud
            $sql = "SELECT id_usuario, id_nucleo FROM Solicitudes_Nucleo WHERE id_solicitud_nucleo = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $solicitudId]);
            $solicitud = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$solicitud) {
                throw new \Exception("Solicitud no encontrada");
            }

            // Verificar que el usuario no tenga núcleo
            $sql = "SELECT id_nucleo FROM Usuario WHERE id_usuario = :usuario";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':usuario' => $solicitud['id_usuario']]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario && $usuario['id_nucleo']) {
                throw new \Exception("El usuario ya pertenece a un núcleo");
            }

            // Asignar usuario al núcleo
            $sql = "UPDATE Usuario SET id_nucleo = :nucleo WHERE id_usuario = :usuario";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':nucleo' => $solicitud['id_nucleo'],
                ':usuario' => $solicitud['id_usuario']
            ]);

            // Actualizar solicitud
            $sql = "UPDATE Solicitudes_Nucleo 
                    SET estado = 'aprobada', 
                        fecha_respuesta = NOW(), 
                        id_admin_respuesta = :admin,
                        observaciones_admin = :obs
                    WHERE id_solicitud_nucleo = :id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':id' => $solicitudId,
                ':admin' => $adminId,
                ':obs' => $observaciones
            ]);

            $this->conn->commit();
            return true;
        } catch (\Exception $e) {
            $this->conn->rollBack();
            error_log("Error en aprobarSolicitudNucleo: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Rechazar solicitud de núcleo
     */
    public function rechazarSolicitudNucleo($solicitudId, $adminId, $motivo)
    {
        try {
            $sql = "UPDATE Solicitudes_Nucleo 
                    SET estado = 'rechazada', 
                        fecha_respuesta = NOW(), 
                        id_admin_respuesta = :admin,
                        observaciones_admin = :motivo
                    WHERE id_solicitud_nucleo = :id";
            
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([
                ':id' => $solicitudId,
                ':admin' => $adminId,
                ':motivo' => $motivo
            ]);
        } catch (PDOException $e) {
            error_log("Error en rechazarSolicitudNucleo: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Cancelar solicitud (Usuario)
     */
    public function cancelarSolicitud($solicitudId, $idUsuario)
    {
        try {
            // Verificar que la solicitud pertenezca al usuario
            $sql = "DELETE FROM Solicitudes_Nucleo 
                    WHERE id_solicitud_nucleo = :id 
                    AND id_usuario = :usuario 
                    AND estado = 'pendiente'";
            
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([
                ':id' => $solicitudId,
                ':usuario' => $idUsuario
            ]);
        } catch (PDOException $e) {
            error_log("Error en cancelarSolicitud: " . $e->getMessage());
            throw $e;
        }
    }

    /**
 * Obtener información completa del núcleo de un usuario
 */
public function getMiNucleoCompleto($idUsuario)
{
    try {
        // Obtener id_nucleo del usuario
        $sql = "SELECT id_nucleo FROM Usuario WHERE id_usuario = :user_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':user_id' => $idUsuario]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$userData || !$userData['id_nucleo']) {
            return null;
        }

        $nucleoId = $userData['id_nucleo'];

        // Obtener datos del núcleo con total de miembros
        $sql = "SELECT 
                    nf.*,
                    COUNT(u.id_usuario) as total_miembros
                FROM Nucleo_Familiar nf
                LEFT JOIN Usuario u ON nf.id_nucleo = u.id_nucleo
                WHERE nf.id_nucleo = :nucleo_id
                GROUP BY nf.id_nucleo";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':nucleo_id' => $nucleoId]);
        $nucleo = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$nucleo) {
            return null;
        }

        // Obtener miembros
        $miembros = $this->getMembers($nucleoId);

        return [
            'nucleo' => $nucleo,
            'miembros' => $miembros
        ];
        
    } catch (PDOException $e) {
        error_log("Error en getMiNucleoCompleto: " . $e->getMessage());
        throw $e;
    }
}
}