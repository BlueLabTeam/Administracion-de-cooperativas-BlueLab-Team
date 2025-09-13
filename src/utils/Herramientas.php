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
            self::safeRedirect('/login');
        }
    }

    public static function validarEstado()
    {
        self::startSession();

        $estado = $_SESSION['estado'] ?? 'pendiente';

        // Si existe ruta para el estado, redirige automáticamente
        if (isset(self::$estadoRutas[$estado])) {
            self::safeRedirect(self::$estadoRutas[$estado]);
        } else {
            // Por seguridad, si el estado es inesperado
            self::safeRedirect('/login');
        }
    }
}
