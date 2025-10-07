<?php

namespace App\Models;

use App\config\Database;
use PDO;
use PDOException;

class Vivienda
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    // Obtener todas las viviendas con información completa
    public function getAll()
    {
        try {
            $sql = "SELECT 
                        v.id_vivienda,
                        v.numero_vivienda,
                        v.direccion,
                        v.estado,
                        v.metros_cuadrados,
                        v.observaciones,
                        v.fecha_construccion,
                        v.id_tipo,
                        tv.nombre as tipo_nombre,
                        tv.habitaciones,
                        tv.descripcion as tipo_descripcion,
                        av.id_asignacion,
                        av.fecha_asignacion,
                        av.activa,
                        u.id_usuario,
                        u.nombre_completo as usuario_asignado,
                        nf.id_nucleo,
                        nf.nombre_nucleo as nucleo_asignado
                    FROM Viviendas v
                    INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                    LEFT JOIN Asignacion_Vivienda av ON v.id_vivienda = av.id_vivienda AND av.activa = TRUE
                    LEFT JOIN Usuario u ON av.id_usuario = u.id_usuario
                    LEFT JOIN Nucleo_Familiar nf ON av.id_nucleo = nf.id_nucleo
                    ORDER BY v.numero_vivienda";
            
            $stmt = $this->conn->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en Vivienda::getAll: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener vivienda por ID
    public function getById($id)
    {
        try {
            $sql = "SELECT 
                        v.*,
                        tv.nombre as tipo_nombre,
                        tv.habitaciones,
                        tv.descripcion as tipo_descripcion
                    FROM Viviendas v
                    INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                    WHERE v.id_vivienda = :id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en Vivienda::getById: " . $e->getMessage());
            throw $e;
        }
    }

    // Crear nueva vivienda
    public function create($data)
    {
        try {
            $sql = "INSERT INTO Viviendas (numero_vivienda, direccion, id_tipo, estado, metros_cuadrados, observaciones, fecha_construccion) 
                    VALUES (:numero, :direccion, :tipo, :estado, :metros, :observaciones, :fecha)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':numero', $data['numero_vivienda']);
            $stmt->bindParam(':direccion', $data['direccion']);
            $stmt->bindParam(':tipo', $data['id_tipo'], PDO::PARAM_INT);
            $stmt->bindParam(':estado', $data['estado']);
            
            $metros = $data['metros_cuadrados'] ?: null;
            $stmt->bindParam(':metros', $metros);
            
            $stmt->bindParam(':observaciones', $data['observaciones']);
            
            $fecha = $data['fecha_construccion'] ?: null;
            $stmt->bindParam(':fecha', $fecha);
            
            $stmt->execute();
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log("Error en Vivienda::create: " . $e->getMessage());
            throw $e;
        }
    }

    // Actualizar vivienda
    public function update($id, $data)
    {
        try {
            $sql = "UPDATE Viviendas 
                    SET numero_vivienda = :numero,
                        direccion = :direccion,
                        id_tipo = :tipo,
                        estado = :estado,
                        metros_cuadrados = :metros,
                        observaciones = :observaciones,
                        fecha_construccion = :fecha
                    WHERE id_vivienda = :id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':numero', $data['numero_vivienda']);
            $stmt->bindParam(':direccion', $data['direccion']);
            $stmt->bindParam(':tipo', $data['id_tipo'], PDO::PARAM_INT);
            $stmt->bindParam(':estado', $data['estado']);
            
            $metros = $data['metros_cuadrados'] ?: null;
            $stmt->bindParam(':metros', $metros);
            
            $stmt->bindParam(':observaciones', $data['observaciones']);
            
            $fecha = $data['fecha_construccion'] ?: null;
            $stmt->bindParam(':fecha', $fecha);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en Vivienda::update: " . $e->getMessage());
            throw $e;
        }
    }

    // Eliminar vivienda
    public function delete($id)
    {
        try {
            // Verificar si tiene asignaciones activas
            $sql = "SELECT COUNT(*) FROM Asignacion_Vivienda WHERE id_vivienda = :id AND activa = TRUE";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            if ($stmt->fetchColumn() > 0) {
                throw new \Exception("No se puede eliminar: la vivienda tiene asignaciones activas");
            }
            
            $sql = "DELETE FROM Viviendas WHERE id_vivienda = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en Vivienda::delete: " . $e->getMessage());
            throw $e;
        }
    }

    // Asignar vivienda a usuario o núcleo
    public function asignar($viviendaId, $usuarioId = null, $nucleoId = null, $observaciones = '')
    {
        try {
            // Validar que haya al menos uno
            if (!$usuarioId && !$nucleoId) {
                throw new \Exception("Debe especificar un usuario o núcleo");
            }
            
            // Verificar si la vivienda ya está asignada
            $sql = "SELECT COUNT(*) FROM Asignacion_Vivienda WHERE id_vivienda = :vivienda AND activa = TRUE";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':vivienda', $viviendaId, PDO::PARAM_INT);
            $stmt->execute();
            
            if ($stmt->fetchColumn() > 0) {
                throw new \Exception("La vivienda ya está asignada");
            }
            
            // Crear asignación
            $sql = "INSERT INTO Asignacion_Vivienda (id_vivienda, id_usuario, id_nucleo, observaciones, activa, fecha_asignacion) 
                    VALUES (:vivienda, :usuario, :nucleo, :obs, TRUE, NOW())";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':vivienda', $viviendaId, PDO::PARAM_INT);
            $stmt->bindParam(':usuario', $usuarioId, $usuarioId ? PDO::PARAM_INT : PDO::PARAM_NULL);
            $stmt->bindParam(':nucleo', $nucleoId, $nucleoId ? PDO::PARAM_INT : PDO::PARAM_NULL);
            $stmt->bindParam(':obs', $observaciones);
            $stmt->execute();
            
            // Actualizar estado de vivienda
            $sql = "UPDATE Viviendas SET estado = 'ocupada' WHERE id_vivienda = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $viviendaId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log("Error en Vivienda::asignar: " . $e->getMessage());
            throw $e;
        }
    }

    // Desasignar vivienda
    public function desasignar($asignacionId)
    {
        try {
            // Obtener datos de la asignación
            $sql = "SELECT id_vivienda FROM Asignacion_Vivienda WHERE id_asignacion = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $asignacionId, PDO::PARAM_INT);
            $stmt->execute();
            $viviendaId = $stmt->fetchColumn();
            
            if (!$viviendaId) {
                throw new \Exception("Asignación no encontrada");
            }
            
            // Desactivar asignación
            $sql = "UPDATE Asignacion_Vivienda SET activa = FALSE, fecha_fin = NOW() WHERE id_asignacion = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $asignacionId, PDO::PARAM_INT);
            $stmt->execute();
            
            // Actualizar estado de vivienda
            $sql = "UPDATE Viviendas SET estado = 'disponible' WHERE id_vivienda = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':id', $viviendaId, PDO::PARAM_INT);
            $stmt->execute();
            
            return true;
        } catch (PDOException $e) {
            error_log("Error en Vivienda::desasignar: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener tipos de vivienda
    public function getTipos()
    {
        try {
            $sql = "SELECT * FROM Tipo_Vivienda ORDER BY habitaciones";
            $stmt = $this->conn->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en Vivienda::getTipos: " . $e->getMessage());
            throw $e;
        }
    }

    // ✅ CORREGIDO: Obtener vivienda asignada a un usuario
    public function getViviendaUsuario($usuarioId)
    {
        try {
            $sql = "SELECT 
                        v.id_vivienda,
                        v.numero_vivienda,
                        v.direccion,
                        v.estado,
                        v.metros_cuadrados,
                        v.observaciones,
                        v.fecha_construccion,
                        tv.nombre as tipo_nombre,
                        tv.habitaciones,
                        tv.descripcion as tipo_descripcion,
                        av.fecha_asignacion,
                        av.observaciones as asignacion_observaciones
                    FROM Asignacion_Vivienda av
                    INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                    INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                    WHERE av.id_usuario = :usuario AND av.activa = TRUE
                    LIMIT 1";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':usuario', $usuarioId, PDO::PARAM_INT);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: null;
        } catch (PDOException $e) {
            error_log("Error en Vivienda::getViviendaUsuario: " . $e->getMessage());
            error_log("Usuario ID: " . $usuarioId);
            throw $e;
        }
    }

    // ✅ CORREGIDO: Obtener vivienda asignada a un núcleo
    public function getViviendaNucleo($nucleoId)
    {
        try {
            $sql = "SELECT 
                        v.id_vivienda,
                        v.numero_vivienda,
                        v.direccion,
                        v.estado,
                        v.metros_cuadrados,
                        v.observaciones,
                        v.fecha_construccion,
                        tv.nombre as tipo_nombre,
                        tv.habitaciones,
                        tv.descripcion as tipo_descripcion,
                        av.fecha_asignacion,
                        av.observaciones as asignacion_observaciones
                    FROM Asignacion_Vivienda av
                    INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                    INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                    WHERE av.id_nucleo = :nucleo AND av.activa = TRUE
                    LIMIT 1";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':nucleo', $nucleoId, PDO::PARAM_INT);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: null;
        } catch (PDOException $e) {
            error_log("Error en Vivienda::getViviendaNucleo: " . $e->getMessage());
            error_log("Nucleo ID: " . $nucleoId);
            throw $e;
        }
    }
}