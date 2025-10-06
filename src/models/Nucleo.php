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
}