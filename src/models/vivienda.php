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

    // ✅ OPTIMIZADO: Ahora incluye etapa directamente desde Viviendas
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
                    v.id_etapa,
                    tv.nombre as tipo_nombre,
                    tv.habitaciones,
                    tv.descripcion as tipo_descripcion,
                    e.nombre as etapa_nombre,
                    e.estado as etapa_estado,
                    e.fechas as etapa_fechas,
                    av.id_asignacion,
                    av.fecha_asignacion,
                    av.activa,
                    
                    -- ✅ USUARIO ASIGNADO DIRECTO
                    u.id_usuario,
                    u.nombre_completo as usuario_asignado,
                    
                    -- ✅ NÚCLEO ASIGNADO
                    nf.id_nucleo,
                    nf.nombre_nucleo as nucleo_asignado,
                    
                    -- ✅ TODOS LOS MIEMBROS DEL NÚCLEO (separados por comas)
                    GROUP_CONCAT(
                        DISTINCT u_nucleo.nombre_completo 
                        ORDER BY u_nucleo.nombre_completo 
                        SEPARATOR ', '
                    ) as miembros_nucleo,
                    
                    -- ✅ CANTIDAD DE MIEMBROS DEL NÚCLEO
                    COUNT(DISTINCT u_nucleo.id_usuario) as total_miembros_nucleo
                    
                FROM Viviendas v
                INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                LEFT JOIN Etapas e ON v.id_etapa = e.id_etapa
                LEFT JOIN Asignacion_Vivienda av ON v.id_vivienda = av.id_vivienda AND av.activa = TRUE
                LEFT JOIN Usuario u ON av.id_usuario = u.id_usuario
                LEFT JOIN Nucleo_Familiar nf ON av.id_nucleo = nf.id_nucleo
                
                -- ✅ JOIN PARA OBTENER TODOS LOS MIEMBROS DEL NÚCLEO
                LEFT JOIN Usuario u_nucleo ON u_nucleo.id_nucleo = nf.id_nucleo
                
                GROUP BY 
                    v.id_vivienda, 
                    v.numero_vivienda,
                    v.direccion,
                    v.estado,
                    v.metros_cuadrados,
                    v.observaciones,
                    v.fecha_construccion,
                    v.id_tipo,
                    v.id_etapa,
                    tv.nombre,
                    tv.habitaciones,
                    tv.descripcion,
                    e.nombre,
                    e.estado,
                    e.fechas,
                    av.id_asignacion,
                    av.fecha_asignacion,
                    av.activa,
                    u.id_usuario,
                    u.nombre_completo,
                    nf.id_nucleo,
                    nf.nombre_nucleo
                
                ORDER BY v.numero_vivienda";
        
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Error en Vivienda::getAll: " . $e->getMessage());
        throw $e;
    }
}

    // ✅ OPTIMIZADO: Incluye etapa
    public function getById($id)
    {
        try {
            $sql = "SELECT 
                        v.*,
                        tv.nombre as tipo_nombre,
                        tv.habitaciones,
                        tv.descripcion as tipo_descripcion,
                        e.nombre as etapa_nombre,
                        e.estado as etapa_estado
                    FROM Viviendas v
                    INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                    LEFT JOIN Etapas e ON v.id_etapa = e.id_etapa
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

    // ✅ OPTIMIZADO: Ahora incluye id_etapa
    public function create($data)
    {
        try {
            $sql = "INSERT INTO Viviendas 
                    (numero_vivienda, direccion, id_tipo, id_etapa, estado, metros_cuadrados, observaciones, fecha_construccion) 
                    VALUES (:numero, :direccion, :tipo, :etapa, :estado, :metros, :observaciones, :fecha)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':numero', $data['numero_vivienda']);
            $stmt->bindParam(':direccion', $data['direccion']);
            $stmt->bindParam(':tipo', $data['id_tipo'], PDO::PARAM_INT);
            
            $etapa = $data['id_etapa'] ?? null;
            $stmt->bindParam(':etapa', $etapa, $etapa ? PDO::PARAM_INT : PDO::PARAM_NULL);
            
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

    // ✅ OPTIMIZADO: Incluye id_etapa
    public function update($id, $data)
    {
        try {
            $sql = "UPDATE Viviendas 
                    SET numero_vivienda = :numero,
                        direccion = :direccion,
                        id_tipo = :tipo,
                        id_etapa = :etapa,
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
            
            $etapa = $data['id_etapa'] ?? null;
            $stmt->bindParam(':etapa', $etapa, $etapa ? PDO::PARAM_INT : PDO::PARAM_NULL);
            
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

    public function asignar($viviendaId, $usuarioId = null, $nucleoId = null, $observaciones = '')
    {
        try {
            if (!$usuarioId && !$nucleoId) {
                throw new \Exception("Debe especificar un usuario o núcleo");
            }
            
            $sql = "SELECT COUNT(*) FROM Asignacion_Vivienda WHERE id_vivienda = :vivienda AND activa = TRUE";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':vivienda', $viviendaId, PDO::PARAM_INT);
            $stmt->execute();
            
            if ($stmt->fetchColumn() > 0) {
                throw new \Exception("La vivienda ya está asignada");
            }
            
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

    // ✅ OPTIMIZADO: Incluye etapa
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
                        v.id_etapa,
                        tv.nombre as tipo_nombre,
                        tv.habitaciones,
                        tv.descripcion as tipo_descripcion,
                        e.nombre as etapa_nombre,
                        e.estado as etapa_estado,
                        av.fecha_asignacion,
                        av.observaciones as asignacion_observaciones
                    FROM Asignacion_Vivienda av
                    INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                    INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                    LEFT JOIN Etapas e ON v.id_etapa = e.id_etapa
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

    // ✅ OPTIMIZADO: Incluye etapa
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
                        v.id_etapa,
                        tv.nombre as tipo_nombre,
                        tv.habitaciones,
                        tv.descripcion as tipo_descripcion,
                        e.nombre as etapa_nombre,
                        e.estado as etapa_estado,
                        av.fecha_asignacion,
                        av.observaciones as asignacion_observaciones
                    FROM Asignacion_Vivienda av
                    INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                    INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                    LEFT JOIN Etapas e ON v.id_etapa = e.id_etapa
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
    
    // ✅ NUEVA FUNCIÓN: Obtener todas las etapas
    public function getEtapas()
    {
        try {
            $sql = "SELECT * FROM Etapas ORDER BY id_etapa";
            $stmt = $this->conn->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en Vivienda::getEtapas: " . $e->getMessage());
            throw $e;
        }
    }
}