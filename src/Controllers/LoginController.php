<?php

namespace App\Controllers;

class LoginController
{
    public function showLoginForm()
    {
        include __DIR__ . '/../views/login.php';
    }
}
