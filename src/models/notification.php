<?php

namespace App\Models;

use App\config\Database;
use PDO;

class Notification
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // Crear una notificación
    public function create($titulo, $mensaje, $tipo = 'info')
    {
        $sql = "INSERT INTO notificaciones (titulo, mensaje, tipo, fecha_creacion) 
                VALUES (:titulo, :mensaje, :tipo, NOW())";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':titulo' => $titulo,
            ':mensaje' => $mensaje,
            ':tipo' => $tipo
        ]);
        
        return $this->db->lastInsertId();
    }

    // Asignar notificación a usuarios específicos
    public function assignToUsers($notificacionId, $usuariosIds)
    {
        $sql = "INSERT INTO usuario_notificaciones (id_usuario, id_notificacion, leida, fecha_asignacion) 
                VALUES (:id_usuario, :id_notificacion, 0, NOW())";
        
        $stmt = $this->db->prepare($sql);
        
        foreach ($usuariosIds as $userId) {
            $stmt->execute([
                ':id_usuario' => $userId,
                ':id_notificacion' => $notificacionId
            ]);
        }
        
        return true;
    }

    // Obtener notificaciones de un usuario
    public function getUserNotifications($userId, $limit = 10)
    {
        $sql = "SELECT n.*, un.leida, un.fecha_asignacion 
                FROM notificaciones n
                INNER JOIN usuario_notificaciones un ON n.id = un.id_notificacion
                WHERE un.id_usuario = :user_id
                ORDER BY n.fecha_creacion DESC
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Contar notificaciones no leídas
    public function getUnreadCount($userId)
    {
        $sql = "SELECT COUNT(*) as count 
                FROM usuario_notificaciones 
                WHERE id_usuario = :user_id AND leida = 0";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result['count'];
    }

    // Marcar notificación como leída
    public function markAsRead($userId, $notificacionId)
    {
        $sql = "UPDATE usuario_notificaciones 
                SET leida = 1, fecha_lectura = NOW() 
                WHERE id_usuario = :user_id AND id_notificacion = :notif_id";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':user_id' => $userId,
            ':notif_id' => $notificacionId
        ]);
    }

    // Obtener todos los usuarios (para el selector del admin)
    public function getAllUsers()
    {
        $sql = "SELECT id_usuario, nombre_completo, email, estado 
                FROM Usuario 
                WHERE estado != 'rechazado'
                ORDER BY nombre_completo";
        
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Obtener todas las notificaciones (admin)
    public function getAllNotifications($limit = 50)
    {
        $sql = "SELECT n.*, 
                COUNT(un.id_usuario) as total_usuarios,
                COUNT(CASE WHEN un.leida = 1 THEN 1 END) as leidas
                FROM notificaciones n
                LEFT JOIN usuario_notificaciones un ON n.id = un.id_notificacion
                GROUP BY n.id
                ORDER BY n.fecha_creacion DESC
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}