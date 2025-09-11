<?php

namespace App\controllers;

use App\utils\Validaciones;

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
        Validaciones::validarUsuario();
        require __DIR__ . '/../Views/dashboardUsuario.php';
    }
}
