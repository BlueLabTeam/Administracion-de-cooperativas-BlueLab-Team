<?php

require __DIR__ . '/../vendor/autoload.php';

use App\Controllers\HomeController;
use App\Controllers\LoginController;
use App\Controllers\RegisterController;

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);


switch ($uri) {
    case '/login':
        $loginController = new LoginController();
        $loginController->showLoginForm();
        break;
    case '/register':
        $registerController = new RegisterController();
        $registerController->showRegisterForm();
        break;
    case '/dashboard':
        echo "Dashboard Page";
        break;
    case '/admins':
        echo "Admins Page";
        break;

    default:
        $homeController = new HomeController();
        $homeController->render();
        break;
}
