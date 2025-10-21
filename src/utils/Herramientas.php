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
            if (!headers_sent()) {
                session_start();
            } else {
                error_log("⚠️ Headers already sent, no se puede iniciar sesión");
            }
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
        
        // ✅ Detectar admin por ROL o flag is_admin
        $isAdmin = ($_SESSION['is_admin'] ?? false) || ($_SESSION['rol'] ?? '') === 'admin';
        $estado = $_SESSION['estado'] ?? 'pendiente';

        // ✅ ADMINISTRADORES: Acceso completo sin restricciones
        if ($isAdmin) {
            return;
        }

        // ✅ USUARIOS ACEPTADOS: Acceso completo sin restricciones
        if ($estado === 'aceptado') {
            return;
        }

        // ⚠️ Rutas permitidas para usuarios NO aceptados (pendiente/enviado)
        $rutasPermitidasSinAceptacion = [
            '/api/pay/firstPay',
            '/pagoPendiente',
            '/pagoEnviado'
        ];

        if (in_array($currentURL, $rutasPermitidasSinAceptacion)) {
            return;
        }

        // ❌ Para estados NO aceptados, redirigir según el estado
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
            // Estado desconocido o rechazado
            if (self::isApiRequest()) {
                http_response_code(403);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'error' => 'estado_desconocido',
                    'message' => 'Estado de cuenta desconocido o rechazado'
                ]);
                exit();
            }
            session_destroy();
            self::safeRedirect('/login?error=invalid_state');
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

    public static function debug($data, $exit = false)
    {
        echo '<pre>';
        var_dump($data);
        echo '</pre>';
        if ($exit) exit;
    }
}