<?php

require __DIR__ . '/../vendor/autoload.php';

use App\middlewares\Middleware;
use App\utils\Herramientas;
// // Cargar variables de entorno pruebas prometheus
// use Prometheus\CollectorRegistry;
// use Prometheus\RenderTextFormat;

// $registry = new CollectorRegistry(new \Prometheus\Storage\InMemory());
// $counter = $registry->getOrRegisterCounter('app', 'requests_total', 'Total de requests', ['method']);
// $counter->inc(['GET']);

// if ($_SERVER['REQUEST_URI'] === '/metrics') {
//     header('Content-Type: ' . RenderTextFormat::MIME_TYPE);
//     echo (new RenderTextFormat())->render($registry->getMetricFamilySamples());
//     exit;
// }


//app 
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

Herramientas::startSession();

$privateRoutes = ['/dashboard', '/pagoPendiente', '/pagoEnviado', 'api/pay/firstPay'];
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
        $login->login($_POST);
        break;
    case '/api/register':
        $register = new App\Controllers\AuthController();
        $register->register($_POST);
        break;
    case '/api/logout':
        $logout = new App\Controllers\AuthController();
        $logout->logout();
        break;

    case '/api/pay/firstPay':
        $pay = new App\controllers\PaymentsController();
        $pay->addPay();
        break;

    default:
        http_response_code(404);
        include __DIR__ . '/../src/views/404error.html';
        break;
}
