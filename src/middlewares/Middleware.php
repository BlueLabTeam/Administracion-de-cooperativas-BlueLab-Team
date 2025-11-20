<?php

namespace App\middlewares;

use App\utils\Herramientas;

class Middleware
{
    public static function handle()
    {
        // Validar que esté logueado
        Herramientas::validarLogin();
        
        // Validar el estado de la cuenta
        Herramientas::validarEstado();
    }
}