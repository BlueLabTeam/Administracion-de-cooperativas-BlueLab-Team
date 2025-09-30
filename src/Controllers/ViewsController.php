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
        $userModel = new \App\Models\User();
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
        
        // DEBUG
        echo "<pre style='background: yellow; padding: 20px;'>";
        echo "=== DEBUG showDashboardAdmin ===\n";
        echo "user_id en sesión: " . ($_SESSION['user_id'] ?? 'NO EXISTE') . "\n";
        echo "is_admin en sesión: " . (isset($_SESSION['is_admin']) ? ($_SESSION['is_admin'] ? 'TRUE' : 'FALSE') : 'NO EXISTE') . "\n";
        echo "id_rol en sesión: " . ($_SESSION['id_rol'] ?? 'NO EXISTE') . "\n\n";
        
        // Verificar que el usuario esté autenticado
        if (!isset($_SESSION['user_id'])) {
            echo "❌ NO HAY user_id - Redirigiendo a login\n";
            echo "</pre>";
            header('Location: /login');
            exit();
        }
        
        // Verificar en la BD si el usuario es admin
        $userModel = new \App\Models\User();
        $user = $userModel->findById($_SESSION['user_id']);
        
        echo "Usuario encontrado en BD: " . ($user ? 'SÍ' : 'NO') . "\n";
        
        if ($user) {
            echo "id_rol del usuario en BD: " . $user->getIdRol() . "\n";
            echo "isAdmin() devuelve: " . ($user->isAdmin() ? 'TRUE' : 'FALSE') . "\n";
        }
        
        if (!$user || !$user->isAdmin()) {
            echo "\n❌ NO ES ADMIN - Redirigiendo a dashboard\n";
            echo "</pre>";
            // Comenta temporalmente esta línea para ver el debug
            // header('Location: /dashboard');
            die("STOP - Usuario NO es admin");
            exit();
        }
        
        echo "\n✅ ES ADMIN - Cargando dashboardBackoffice.php\n";
        echo "</pre>";
        
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