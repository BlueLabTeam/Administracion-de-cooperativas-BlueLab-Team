<?php

namespace App\utils;

class Herramientas
{
    private static array $estadoRutas = [
        'pendiente' => '/pagoPendiente',
        'enviado'   => '/pagoEnviado',
        'aceptado'  => '/dashboard'
    ];

    public static function startSession()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function safeRedirect(string $ruta)
    {
        $currentURL = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        if ($currentURL !== $ruta) {
            header("Location: $ruta");
            exit();
        }
    }

    public static function validarLogin()
    {
        self::startSession();
        if (!isset($_SESSION['user_id'])) {
            if (self::isApiRequest()) {
                http_response_code(401);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'error' => 'no_autenticado',
                    'message' => 'Debe iniciar sesión'
                ]);
                exit();
            }
            self::safeRedirect('/login');
        }
    }

    public static function validarEstado()
    {
        self::startSession();

        $currentURL = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        $rutasExcluidas = [
            '/dashboard-admin',
            '/api/notifications/users',
            '/api/notifications/create',
            '/api/notifications/user',
            '/api/notifications/mark-read',
            '/api/payment/approve',
            '/api/payment/reject',
            '/api/tasks/create',
            '/api/tasks/user',
            '/api/tasks/all',
            '/api/tasks/update-progress',
            '/api/tasks/add-avance',
            '/api/tasks/details',
            '/api/tasks/users',
            '/api/tasks/nucleos',
            '/api/tasks/cancel',
            '/api/users/all',
            '/api/users/details',
            '/api/pay/firstPay',
            '/api/nucleos/create',          
            '/api/nucleos/all',              
            '/api/nucleos/details',          
            '/api/nucleos/update',           
            '/api/nucleos/delete',           
            '/api/nucleos/users-available',
              '/api/materiales/create',
            '/api/materiales/all',
           '/api/materiales/details',
        '/api/materiales/update',
    '/api/materiales/update-stock',
    '/api/materiales/delete',
    '/api/materiales/search',
    '/api/materiales/assign-task',
    '/api/materiales/task-materials',
    '/api/materiales/remove-from-task',
    '/api/materiales/request',
    '/api/materiales/requests'   
        ];
        
        if (in_array($currentURL, $rutasExcluidas)) {
            return;
        }

        if ($currentURL === '/dashboard-admin' && isset($_SESSION['is_admin']) && $_SESSION['is_admin']) {
            return;
        }

        $estado = $_SESSION['estado'] ?? 'pendiente';

        if (isset(self::$estadoRutas[$estado])) {
            if (self::isApiRequest()) {
                http_response_code(403);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'error' => 'estado_invalido',
                    'message' => 'Su cuenta no está activa o requiere acción',
                    'estado' => $estado,
                    'redirect' => self::$estadoRutas[$estado]
                ]);
                exit();
            }
            self::safeRedirect(self::$estadoRutas[$estado]);
        } else {
            if (self::isApiRequest()) {
                http_response_code(403);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'error' => 'estado_desconocido',
                    'message' => 'Estado de cuenta desconocido'
                ]);
                exit();
            }
            self::safeRedirect('/login');
        }
    }

    private static function isApiRequest(): bool
    {
        $currentURL = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        if (strpos($currentURL, '/api/') === 0) {
            return true;
        }
        
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
            strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
            return true;
        }
        
        if (isset($_SERVER['HTTP_ACCEPT']) && 
            strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
            return true;
        }
        
        return false;
    }
}