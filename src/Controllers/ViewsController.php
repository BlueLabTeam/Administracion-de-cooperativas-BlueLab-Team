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
        require __DIR__ . '/../Views/dashboardBackoffice.php';
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
