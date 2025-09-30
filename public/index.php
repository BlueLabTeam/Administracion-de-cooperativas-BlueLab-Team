<?php

require __DIR__ . '/../vendor/autoload.php';

use App\middlewares\Middleware;
use App\utils\Herramientas;

//app 
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

Herramientas::startSession();

$privateRoutes = ['/dashboard', '/dashboard-admin', '/pagoPendiente', '/pagoEnviado', 'api/pay/firstPay'];
if (in_array($uri, $privateRoutes)) {
    Middleware::handle();
}

switch ($uri) {

    case '/':
        $controller = new App\Controllers\ViewsController();
        $controller->index();
        break;
    case '/home':
        $controller = new App\Controllers\ViewsController();
        $controller->index();
        break;
    case '/login':
        $controller = new App\Controllers\ViewsController();
        $controller->showLoginForm();
        break;
    case '/register':
        $controller = new App\Controllers\ViewsController();
        $controller->showRegistrationForm();
        break;
    case '/dashboard':
        $controller = new App\Controllers\ViewsController();
        $controller->showDashboard();
        break;
    case '/dashboard-admin':
        $controller = new App\Controllers\ViewsController();
        $controller->showDashboardAdmin();
        break;
    case '/pagoPendiente':
        $controller = new App\controllers\ViewsController();
        $controller->showRegistrarPago();
        break;
    case '/pagoEnviado':
        $controller = new App\controllers\ViewsController;
        $controller->showSalaEspera();
        break;


    // APIS

    case '/api/login':
    $login = new App\Controllers\AuthController();
    $login->login();  // ✅ Sin parámetros
    break;
case '/api/register':
    $register = new App\Controllers\AuthController();
    $register->register();  // ✅ Sin parámetros
    break;
    
    case '/api/logout':
        $logout = new App\Controllers\AuthController();
        $logout->logout();
        break;

    case '/api/pay/firstPay':
        $pay = new App\controllers\PaymentsController();
        $pay->addPay();
        break;

        case '/api/payment/approve':
    $payments = new App\Controllers\PaymentsController();
    $payments->approvePayment();
    break;

case '/api/payment/reject':
    $payments = new App\Controllers\PaymentsController();
    $payments->rejectPayment();
    break;

    default:
        http_response_code(404);
        include __DIR__ . '/../src/views/404error.php';
        break;
}