<?php

namespace App\Controllers;

use App\Models\Notification;

class NotificationController
{
    private $notificationModel;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->notificationModel = new Notification();
    }

    // Obtener todos los usuarios (para selector en admin)
    public function getUsers()
    {
        header('Content-Type: application/json');

        // Verificar que el usuario esté autenticado
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        // Verificar que sea admin
        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado - Solo administradores']);
            exit();
        }

        try {
            $users = $this->notificationModel->getAllUsers();
            
            echo json_encode([
                'success' => true,
                'users' => $users,
                'count' => count($users)
            ]);
        } catch (\Exception $e) {
            error_log("Error en getUsers: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'message' => 'Error al obtener usuarios: ' . $e->getMessage()
            ]);
        }
        exit();
    }

    // Crear y enviar notificación (Admin)
    public function create()
    {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
            exit();
        }

        // Verificar que sea admin
        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        $titulo = $_POST['titulo'] ?? '';
        $mensaje = $_POST['mensaje'] ?? '';
        $tipo = $_POST['tipo'] ?? 'info';
        $usuarios = $_POST['usuarios'] ?? [];

        if (empty($titulo) || empty($mensaje)) {
            echo json_encode(['success' => false, 'message' => 'Título y mensaje son requeridos']);
            exit();
        }

        if (empty($usuarios)) {
            echo json_encode(['success' => false, 'message' => 'Debe seleccionar al menos un usuario']);
            exit();
        }

        try {
            // Crear la notificación
            $notificacionId = $this->notificationModel->create($titulo, $mensaje, $tipo);
            
            // Asignar a los usuarios seleccionados
            $this->notificationModel->assignToUsers($notificacionId, $usuarios);

            echo json_encode([
                'success' => true,
                'message' => 'Notificación enviada exitosamente a ' . count($usuarios) . ' usuario(s)'
            ]);
        } catch (\Exception $e) {
            error_log("Error al crear notificación: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al enviar notificación: ' . $e->getMessage()]);
        }
        exit();
    }

    // Obtener notificaciones del usuario
    public function getUserNotifications()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $notifications = $this->notificationModel->getUserNotifications($_SESSION['user_id']);
            $unreadCount = $this->notificationModel->getUnreadCount($_SESSION['user_id']);

            echo json_encode([
                'success' => true,
                'notifications' => $notifications,
                'unread_count' => $unreadCount
            ]);
        } catch (\Exception $e) {
            error_log("Error al obtener notificaciones: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al cargar notificaciones']);
        }
        exit();
    }

    // Marcar notificación como leída
    public function markAsRead()
    {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
            exit();
        }

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        $notificacionId = $_POST['notificacion_id'] ?? null;

        if (!$notificacionId) {
            echo json_encode(['success' => false, 'message' => 'ID de notificación no proporcionado']);
            exit();
        }

        try {
            $result = $this->notificationModel->markAsRead($_SESSION['user_id'], $notificacionId);

            echo json_encode([
                'success' => $result,
                'message' => $result ? 'Notificación marcada como leída' : 'Error al marcar notificación'
            ]);
        } catch (\Exception $e) {
            error_log("Error al marcar como leída: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al procesar solicitud']);
        }
        exit();
    }
}