<?php

namespace App\Models;

use App\config\Database;
use PDO;
use PDOException;

class Material
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    // Crear nuevo material
    public function create($nombre, $caracteristicas)
    {
        try {
            $query = "INSERT INTO Materiales (nombre, caracteristicas) VALUES (:nombre, :caracteristicas)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':caracteristicas', $caracteristicas);
            $stmt->execute();
            
            $materialId = $this->conn->lastInsertId();
            
            // Inicializar stock en 0
            $stockQuery = "INSERT INTO Stock_Materiales (id_material, cantidad_disponible) VALUES (:id_material, 0)";
            $stockStmt = $this->conn->prepare($stockQuery);
            $stockStmt->bindParam(':id_material', $materialId);
            $stockStmt->execute();
            
            return $materialId;
        } catch (PDOException $e) {
            error_log("Error al crear material: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener todos los materiales con su stock
    public function getAll()
    {
        try {
            $query = "SELECT 
                        m.id_material,
                        m.nombre,
                        m.caracteristicas,
                        COALESCE(s.cantidad_disponible, 0) as stock
                      FROM Materiales m
                      LEFT JOIN Stock_Materiales s ON m.id_material = s.id_material
                      ORDER BY m.nombre ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener materiales: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener material por ID
    public function getById($id)
    {
        try {
            $query = "SELECT 
                        m.id_material,
                        m.nombre,
                        m.caracteristicas,
                        COALESCE(s.cantidad_disponible, 0) as stock
                      FROM Materiales m
                      LEFT JOIN Stock_Materiales s ON m.id_material = s.id_material
                      WHERE m.id_material = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener material: " . $e->getMessage());
            throw $e;
        }
    }

    // Actualizar material
    public function update($id, $nombre, $caracteristicas)
    {
        try {
            $query = "UPDATE Materiales SET nombre = :nombre, caracteristicas = :caracteristicas WHERE id_material = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':caracteristicas', $caracteristicas);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error al actualizar material: " . $e->getMessage());
            throw $e;
        }
    }

    // Actualizar stock
    public function updateStock($id, $cantidad)
    {
        try {
            $query = "UPDATE Stock_Materiales SET cantidad_disponible = :cantidad WHERE id_material = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':cantidad', $cantidad);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error al actualizar stock: " . $e->getMessage());
            throw $e;
        }
    }

    // Eliminar material
    public function delete($id)
    {
        try {
            // Verificar si el material está asignado a alguna tarea
            $checkQuery = "SELECT COUNT(*) as count FROM Tarea_Material WHERE id_material = :id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result['count'] > 0) {
                throw new \Exception("No se puede eliminar el material porque está asignado a tareas");
            }
            
            // Eliminar stock primero (FK constraint)
            $stockQuery = "DELETE FROM Stock_Materiales WHERE id_material = :id";
            $stockStmt = $this->conn->prepare($stockQuery);
            $stockStmt->bindParam(':id', $id);
            $stockStmt->execute();
            
            // Eliminar material
            $query = "DELETE FROM Materiales WHERE id_material = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error al eliminar material: " . $e->getMessage());
            throw $e;
        }
    }

    // Buscar materiales
    public function search($searchTerm)
    {
        try {
            $searchTerm = "%{$searchTerm}%";
            $query = "SELECT 
                        m.id_material,
                        m.nombre,
                        m.caracteristicas,
                        COALESCE(s.cantidad_disponible, 0) as stock
                      FROM Materiales m
                      LEFT JOIN Stock_Materiales s ON m.id_material = s.id_material
                      WHERE m.nombre LIKE :search OR m.caracteristicas LIKE :search
                      ORDER BY m.nombre ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':search', $searchTerm);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al buscar materiales: " . $e->getMessage());
            throw $e;
        }
    }

    // Asignar material a tarea
    // Asignar material a tarea
public function assignToTask($tareaId, $materialId, $cantidadRequerida)
{
    try {
        $query = "INSERT INTO Tarea_Material (id_tarea, id_material, cantidad_requerida) 
                  VALUES (:tarea_id, :material_id, :cantidad)
                  ON DUPLICATE KEY UPDATE cantidad_requerida = VALUES(cantidad_requerida)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':tarea_id', $tareaId, PDO::PARAM_INT);
        $stmt->bindParam(':material_id', $materialId, PDO::PARAM_INT);
        $stmt->bindParam(':cantidad', $cantidadRequerida, PDO::PARAM_INT);
        
        $result = $stmt->execute();
        
        if (!$result) {
            error_log("Error en execute: " . print_r($stmt->errorInfo(), true));
        }
        
        return $result;
    } catch (PDOException $e) {
        error_log("Error al asignar material a tarea: " . $e->getMessage());
        throw $e;
    }
}

    // Obtener materiales de una tarea
    public function getTaskMaterials($tareaId)
    {
        try {
            $query = "SELECT 
                        m.id_material,
                        m.nombre,
                        m.caracteristicas,
                        tm.cantidad_requerida,
                        COALESCE(s.cantidad_disponible, 0) as stock_disponible
                      FROM Tarea_Material tm
                      INNER JOIN Materiales m ON tm.id_material = m.id_material
                      LEFT JOIN Stock_Materiales s ON m.id_material = s.id_material
                      WHERE tm.id_tarea = :tarea_id
                      ORDER BY m.nombre ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':tarea_id', $tareaId);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener materiales de tarea: " . $e->getMessage());
            throw $e;
        }
    }

    // Remover material de tarea
    public function removeFromTask($tareaId, $materialId)
    {
        try {
            $query = "DELETE FROM Tarea_Material WHERE id_tarea = :tarea_id AND id_material = :material_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':tarea_id', $tareaId);
            $stmt->bindParam(':material_id', $materialId);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error al remover material de tarea: " . $e->getMessage());
            throw $e;
        }
    }

    // Solicitar material (pedido)
    public function createRequest($materialId, $cantidad, $usuarioId, $descripcion = null)
    {
        try {
            $query = "INSERT INTO Solicitud_Material (id_material, cantidad_solicitada, id_usuario, descripcion, estado, fecha_solicitud) 
                      VALUES (:material_id, :cantidad, :usuario_id, :descripcion, 'pendiente', NOW())";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':material_id', $materialId);
            $stmt->bindParam(':cantidad', $cantidad);
            $stmt->bindParam(':usuario_id', $usuarioId);
            $stmt->bindParam(':descripcion', $descripcion);
            $stmt->execute();
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log("Error al crear solicitud de material: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener solicitudes de materiales
    public function getRequests($estado = null)
    {
        try {
            $whereClause = $estado ? "WHERE sm.estado = :estado" : "";
            
            $query = "SELECT 
                        sm.id_solicitud,
                        sm.cantidad_solicitada,
                        sm.descripcion,
                        sm.estado,
                        sm.fecha_solicitud,
                        m.nombre as material_nombre,
                        u.nombre_completo as solicitante
                      FROM Solicitud_Material sm
                      INNER JOIN Materiales m ON sm.id_material = m.id_material
                      INNER JOIN Usuario u ON sm.id_usuario = u.id_usuario
                      $whereClause
                      ORDER BY sm.fecha_solicitud DESC";
            
            $stmt = $this->conn->prepare($query);
            if ($estado) {
                $stmt->bindParam(':estado', $estado);
            }
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener solicitudes: " . $e->getMessage());
            throw $e;
        }
    }
}