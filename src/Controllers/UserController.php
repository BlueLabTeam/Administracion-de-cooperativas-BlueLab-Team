<?php

namespace App\Controllers;

use App\Models\User;

class UserController
{
    private $userModel;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->userModel = new User();
    }

    // PATRÓN IDÉNTICO A NotificationController::getUsers()
 public function getAllUsers()
{
    header('Content-Type: application/json');

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'No autenticado']);
        exit();
    }

    if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'No autorizado - Solo administradores']);
        exit();
    }

    try {
        $users = $this->userModel->getAllUsersWithPayments();
        
        echo json_encode([
            'success' => true,
            'users' => $users,
            'count' => count($users)
        ]);
    } catch (\Exception $e) {
        error_log("Error en getAllUsers: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error al obtener usuarios: ' . $e->getMessage()
        ]);
    }
    exit();
}

    // Obtener detalles de un usuario específico
    public function getUserById()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

       $userId = $_GET['id_usuario'] ?? $_GET['user_id'] ?? null;

        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
            exit();
        }

        try {
            $user = $this->userModel->findById($userId);
            
            if ($user) {
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id_usuario' => $user->getId(),
                        'nombre_completo' => $user->getNombreCompleto(),
                        'cedula' => $user->getCedula(),
                        'email' => $user->getEmail(),
                        'direccion' => $user->getDireccion(),
                        'estado' => $user->getEstado(),
                        'fecha_ingreso' => $user->getFechaIngreso(),
                        'fecha_nacimiento' => $user->getFechaNacimiento(),
                        'id_nucleo' => $user->getIdNucleo(),
                        'rol' => $user->getRoleName()
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
            }
        } catch (\Exception $e) {
            error_log("Error en getUserById: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener usuario']);
        }
        exit();
    }
}