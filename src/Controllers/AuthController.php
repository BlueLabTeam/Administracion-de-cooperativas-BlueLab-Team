<?php

namespace App\controllers;

use App\models\User;

class AuthController
{
    public function login()
    {
        
        header('Content-Type: application/json');
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method Not Allowed',
                'redirect' => '/login'
            ]);
            exit();
        }

        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Email y contraseña son requeridos',
                'redirect' => '/login'
            ]);
            exit();
        }

        $userModel = new User();
        $user = $userModel->findByEmail($email);

        if ($user && password_verify($password, $user->getPasswordHash())) {
            $_SESSION['user_id'] = $user->getId();
            $_SESSION['nombre_completo'] = $user->getNombreCompleto();
            $_SESSION['direccion'] = $user->getDireccion();
            $_SESSION['estado'] = $user->getEstado();
            $_SESSION['fecha_nacimiento'] = $user->getFechaNacimiento();
            $_SESSION['email'] = $user->getEmail();
            $_SESSION['id_rol'] = $user->getIdRol() ?? null;
            $_SESSION['is_admin'] = $user->isAdmin();

            echo json_encode([
                'success' => true,
                'message' => 'Login exitoso, Bienvenido',
                'redirect' => '/dashboard'
            ]);
            exit();
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Credenciales inválidas. Intente nuevamente',
                'redirect' => '/login'
            ]);
            exit();
        }
    }

    public function register()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        header('Content-Type: application/json');
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
            exit();
        }

        $nombre_completo = $_POST['nombre_completo'] ?? '';
        $ci = $_POST['CI'] ?? '';
        $email = $_POST['email'] ?? '';
        $direccion = $_POST['direccion'] ?? '';
        $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? '';
        $password = $_POST['password'] ?? '';

        // Validación básica
        if (empty($nombre_completo) || empty($ci) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Todos los campos son obligatorios'
            ]);
            exit();
        }

        $userModel = new \App\Models\User();
        $existingUser = $userModel->findByEmail($email);

        if ($existingUser) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'El usuario ya existe',
                'redirect' => '/login'
            ]);
            exit();
        }

        $result = $userModel->create($nombre_completo, $password, $email, $ci, $fecha_nacimiento, $direccion);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Le enviaremos un correo proximamente',
                'redirect' => '/login'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al crear el usuario'
            ]);
        }
        exit();
    }

    public function logout()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_destroy();
        header('Location: /login');
        exit();
    }
}