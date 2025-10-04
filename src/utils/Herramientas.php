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
            // Detectar si es una petición AJAX/API
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
            '/api/pay/firstPay'  // AÑADIDO: Excluir la ruta de primer pago
        ];
        
        if (in_array($currentURL, $rutasExcluidas)) {
            return; // Permitir acceso sin validar estado
        }

        // Si es admin y está en dashboard-admin, no redirigir
        if ($currentURL === '/dashboard-admin' && isset($_SESSION['is_admin']) && $_SESSION['is_admin']) {
            return;
        }

        $estado = $_SESSION['estado'] ?? 'pendiente';

        // Si existe ruta para el estado
        if (isset(self::$estadoRutas[$estado])) {
            // Detectar si es una petición AJAX/API
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
            // Por seguridad, si el estado es inesperado
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

    /**
     * Detecta si la petición es una llamada a API
     */
    private static function isApiRequest(): bool
    {
        $currentURL = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Si la URL comienza con /api/
        if (strpos($currentURL, '/api/') === 0) {
            return true;
        }
        
        // Si hay un header que indica que es una petición AJAX
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
            strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
            return true;
        }
        
        // Si el Accept header prefiere JSON
        if (isset($_SERVER['HTTP_ACCEPT']) && 
            strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
            return true;
        }
        
        return false;
    }
}