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

/**
     * Obtener perfil del usuario autenticado
     */
    public function getMyProfile()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $user = $this->userModel->findById($_SESSION['user_id']);
            
            if ($user) {
                // Obtener teléfono si existe
                $telefono = $this->userModel->getTelefonoByUserId($_SESSION['user_id']);
                
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id_usuario' => $user->getId(),
                        'nombre_completo' => $user->getNombreCompleto(),
                        'cedula' => $user->getCedula(),
                        'email' => $user->getEmail(),
                        'direccion' => $user->getDireccion(),
                        'fecha_nacimiento' => $user->getFechaNacimiento(),
                        'fecha_ingreso' => $user->getFechaIngreso(),
                        'estado' => $user->getEstado(),
                        'telefono' => $telefono
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
            }
        } catch (\Exception $e) {
            error_log("Error en getMyProfile: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener perfil']);
        }
        exit();
    }

    /**
     * Actualizar perfil del usuario
     */
    public function updateProfile()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $userId = $_SESSION['user_id'];
            $nombreCompleto = $_POST['nombre_completo'] ?? '';
            $email = $_POST['email'] ?? '';
            $direccion = $_POST['direccion'] ?? '';
            $fechaNacimiento = $_POST['fecha_nacimiento'] ?? null;
            $telefono = $_POST['telefono'] ?? '';
            
            $passwordActual = $_POST['password_actual'] ?? '';
            $passwordNueva = $_POST['password_nueva'] ?? '';

            // Validaciones
            if (empty($nombreCompleto) || empty($email)) {
                echo json_encode(['success' => false, 'message' => 'Nombre y email son obligatorios']);
                exit();
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success' => false, 'message' => 'Email inválido']);
                exit();
            }

            // Verificar si el email ya existe (excepto el propio)
            $existingUser = $this->userModel->findByEmail($email);
            if ($existingUser && $existingUser->getId() != $userId) {
                echo json_encode(['success' => false, 'message' => 'El email ya está registrado por otro usuario']);
                exit();
            }

            // Obtener usuario actual
            $user = $this->userModel->findById($userId);
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
                exit();
            }

            // Verificar contraseña si se quiere cambiar
            $cambiarPassword = false;
            if (!empty($passwordActual) && !empty($passwordNueva)) {
                // CORREGIDO: usar getPasswordHash() en lugar de getContrasena()
                if (!password_verify($passwordActual, $user->getPasswordHash())) {
                    echo json_encode(['success' => false, 'message' => 'La contraseña actual es incorrecta']);
                    exit();
                }
                
                if (strlen($passwordNueva) < 6) {
                    echo json_encode(['success' => false, 'message' => 'La nueva contraseña debe tener al menos 6 caracteres']);
                    exit();
                }
                
                $cambiarPassword = true;
            }

            // Actualizar datos del usuario
            $updateData = [
                'nombre_completo' => $nombreCompleto,
                'email' => $email,
                'direccion' => $direccion
            ];
            
            // Solo agregar fecha_nacimiento si no está vacía
            if (!empty($fechaNacimiento)) {
                $updateData['fecha_nacimiento'] = $fechaNacimiento;
            }

            if ($cambiarPassword) {
                $updateData['contrasena'] = password_hash($passwordNueva, PASSWORD_BCRYPT);
            }

            $resultado = $this->userModel->updateUser($userId, $updateData);

            if (!$resultado) {
                echo json_encode(['success' => false, 'message' => 'Error al actualizar perfil']);
                exit();
            }

            // Actualizar/agregar teléfono
            if (!empty($telefono)) {
                $this->userModel->updateTelefono($userId, $telefono);
            }

            // Actualizar sesión
            $_SESSION['nombre_completo'] = $nombreCompleto;
            $_SESSION['email'] = $email;
            $_SESSION['direccion'] = $direccion;
            if (!empty($fechaNacimiento)) {
                $_SESSION['fecha_nacimiento'] = $fechaNacimiento;
            }

            echo json_encode([
                'success' => true,
                'message' => 'Perfil actualizado correctamente',
                'reload' => $cambiarPassword // Recargar si cambió contraseña
            ]);

        } catch (\Exception $e) {
            error_log("Error en updateProfile: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al actualizar perfil: ' . $e->getMessage()]);
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

