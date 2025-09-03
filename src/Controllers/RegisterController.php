<?php

namespace APP\Controllers;

use APP\Models\Usuario;

class RegisterController
{
    public function showRegisterForm()
    {
        include __DIR__ . '/../views/register.php';
    }
    public function registrarUsuario($request)
    {
        $usuario = new Usuario();
        $usuario->registrar(
            $request['nombre'],
            $request['email'],
            password_hash($request['password'], PASSWORD_BCRYPT)
        );
        return "Registro enviado para aprobación";
    }
}
