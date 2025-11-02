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

    // ✅ OPTIMIZADO: Stock ahora está en Materiales.cantidad_disponible
    public function create($nombre, $caracteristicas, $stockInicial = 0)
    {
        try {
            $query = "INSERT INTO Materiales (nombre, caracteristicas, cantidad_disponible) 
                      VALUES (:nombre, :caracteristicas, :stock)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':caracteristicas', $caracteristicas);
            $stmt->bindParam(':stock', $stockInicial, PDO::PARAM_INT);
            $stmt->execute();
            
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log("Error al crear material: " . $e->getMessage());
            throw $e;
        }
    }

    // ✅ OPTIMIZADO: Obtener todos con stock integrado
    public function getAll()
    {
        try {
            $query = "SELECT 
                        id_material,
                        nombre,
                        caracteristicas,
                        cantidad_disponible as stock
                      FROM Materiales
                      ORDER BY nombre ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener materiales: " . $e->getMessage());
            throw $e;
        }
    }

    // ✅ OPTIMIZADO: Obtener por ID con stock integrado
    public function getById($id)
    {
        try {
            $query = "SELECT 
                        id_material,
                        nombre,
                        caracteristicas,
                        cantidad_disponible as stock
                      FROM Materiales
                      WHERE id_material = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener material: " . $e->getMessage());
            throw $e;
        }
    }

    public function update($id, $nombre, $caracteristicas)
    {
        try {
            $query = "UPDATE Materiales 
                      SET nombre = :nombre, caracteristicas = :caracteristicas 
                      WHERE id_material = :id";
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

    // ✅ OPTIMIZADO: Actualizar stock directamente en Materiales
    public function updateStock($id, $cantidad)
    {
        try {
            $query = "UPDATE Materiales 
                      SET cantidad_disponible = :cantidad 
                      WHERE id_material = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':cantidad', $cantidad, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error al actualizar stock: " . $e->getMessage());
            throw $e;
        }
    }

    // ✅ OPTIMIZADO: Eliminar sin tabla Stock_Materiales
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
            
            // Eliminar material directamente (FK cascade eliminará de Proveedor_Material)
            $query = "DELETE FROM Materiales WHERE id_material = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error al eliminar material: " . $e->getMessage());
            throw $e;
        }
    }

    // ✅ OPTIMIZADO: Buscar con stock integrado
    public function search($searchTerm)
    {
        try {
            $searchTerm = "%{$searchTerm}%";
            $query = "SELECT 
                        id_material,
                        nombre,
                        caracteristicas,
                        cantidad_disponible as stock
                      FROM Materiales
                      WHERE nombre LIKE :search OR caracteristicas LIKE :search
                      ORDER BY nombre ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':search', $searchTerm);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al buscar materiales: " . $e->getMessage());
            throw $e;
        }
    }

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

    // ✅ OPTIMIZADO: Obtener materiales de tarea con stock integrado
    public function getTaskMaterials($tareaId)
    {
        try {
            $query = "SELECT 
                        m.id_material,
                        m.nombre,
                        m.caracteristicas,
                        tm.cantidad_requerida,
                        m.cantidad_disponible as stock_disponible
                      FROM Tarea_Material tm
                      INNER JOIN Materiales m ON tm.id_material = m.id_material
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