<?php

namespace App\middlewares;

use App\utils\Herramientas;

class Middleware{
    public static function handle()
    {
        Herramientas::validarLogin();
        Herramientas::validarEstado();
    }
}