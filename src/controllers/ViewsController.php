<?php

namespace App\controllers;

class ViewsController
{
    public function index()
    {
        require __DIR__ . '/../Views/home.php';
    }

    public function showLoginForm()
    {
        require __DIR__ . '/../Views/login.php';
    }

    public function showRegistrationForm()
    {
        require __DIR__ . '/../Views/register.php';
    }

    public function showDashboard()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user_id'])) {
            header('Location: /login');
            exit();
        }
        
        // Verificar y actualizar el estado de admin desde la BD
        $userModel = new \App\models\User();
        $user = $userModel->findById($_SESSION['user_id']);
        if ($user) {
            $_SESSION['is_admin'] = $user->isAdmin();
            $_SESSION['id_rol'] = $user->getIdRol();
        }
        
        require __DIR__ . '/../Views/dashboardUsuario.php';
    }

    public function showDashboardAdmin()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Verificar que el usuario esté autenticado
        if (!isset($_SESSION['user_id'])) {
            error_log(" NO HAY user_id - Redirigiendo a login");
            header('Location: /login');
            exit();
        }
        
        // Verificar en la BD si el usuario es admin
        $userModel = new \App\models\User();
        $user = $userModel->findById($_SESSION['user_id']);
        
        if (!$user || !$user->isAdmin()) {
            error_log(" NO ES ADMIN - Redirigiendo a dashboard");
            header('Location: /dashboard');
            exit();
        }
        
        error_log(" ES ADMIN - Cargando dashboardBackoffice.php");
        
        // Actualizar sesión
        $_SESSION['is_admin'] = true;
        $_SESSION['id_rol'] = $user->getIdRol();
        
        $dashboardPath = __DIR__ . '/../Views/dashboardBackoffice.php';
        
        if (!file_exists($dashboardPath)) {
            die("Error: No se encuentra el archivo dashboardBackoffice.php en: " . $dashboardPath);
        }
        
        require $dashboardPath;
    }

    public function showRegistrarPago()
    {
        require __DIR__ . '/../Views/registrarPago.php';
    }

    public function showSalaEspera()
    {
        require __DIR__ . '/../Views/salaEspera.php';
    }
}