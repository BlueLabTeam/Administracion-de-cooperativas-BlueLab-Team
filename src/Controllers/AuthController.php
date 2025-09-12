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
                'error' => 'Method Not Allowed',
                'redirect' => '/login'
            ]);

            exit();
        }
        $email = $_POST['email'];
        $password = $_POST['password'];
        // Aquí iría la lógica de autenticación

        $userModel = new \App\Models\User();
        $user = $userModel->findByEmail($email);
        if ($user && password_verify($password, $user->getPasswordHash())) {
            $_SESSION['user_id'] = $user->getId();
            $_SESSION['nombre_completo'] = $user->getNombreCompleto();
            $_SESSION['direccion'] = $user->getDireccion();
            $_SESSION['estado'] = $user->getEstado();
            $_SESSION['fecha_nacimiento'] = $user->getFechaNacimiento();
            $_SESSION['email'] = $user->getEmail();

            echo json_encode([
                'success' => true,
                'message' => 'login exitoso, Bienvenido',
                'redirect' => '/dashboard'
            ]);

            exit();
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => 'false',
                'error' => 'Invalid credentials',
                'message' => 'Intente nuevamente',
                'redirect' => '/login'
            ]);
        }
    }
    public function register()
    {
        header('Content-Type: application/json');
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit();
        }

        $nombre_completo = $_POST['nombre_completo'];
        $ci = $_POST['CI'];
        // $telefono = $_POST['telefono']; // No se usa en el modelo por el momento
        $email = $_POST['email'];
        $direccion = $_POST['direccion'];
        $fecha_nacimiento = $_POST['fecha_nacimiento'];
        $password = $_POST['password'];

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
        $userModel->create($nombre_completo, $password, $email, $ci, $fecha_nacimiento, $direccion);
        echo json_encode([
            'success' => true,
            'message' => 'Le enviaremos un correo proximamente',
            'redirect' => '/login'
        ]);
        exit();
    }
    public function logout()
    {
        session_start();
        session_destroy();
        header('Location: /login');
        exit();
    }
}
