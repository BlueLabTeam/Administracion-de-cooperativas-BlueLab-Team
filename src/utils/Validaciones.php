<?php
namespace App\utils;

class Validaciones{
    public static function validarUsuario() {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            header('Location: /login');
            exit();
        }
    }
}
