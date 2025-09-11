<?php

namespace App\models;

use App\config\Database;

class User
{
    private $id;
    private $nombre_completo;
    private $passwordHash;
    private $email;
    private $ci;
    private $fecha_nacimiento;
    private $direccion;


    // CRUD

    public function create($nombre_completo, $password, $email, $ci, $fecha_nacimiento, $direccion)
    {
        // Aquí iría la lógica para crear un usuario en la base de datos
        $this->nombre_completo = $nombre_completo;
        $this->passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $this->email = $email;
        $this->ci = $ci;
        $this->fecha_nacimiento = $fecha_nacimiento;
        $this->direccion = $direccion;

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('INSERT INTO Usuario (nombre_completo, contrasena, email, cedula, fecha_nacimiento, direccion) VALUES (:nombre_completo, :contrasena, :email, :cedula, :fecha_nacimiento, :direccion)');
        $stmt->execute([
            'nombre_completo' => $this->nombre_completo,
            'contrasena' => $this->passwordHash,
            'email' => $this->email,
            'cedula' => $this->ci,
            'fecha_nacimiento' => $this->fecha_nacimiento,
            'direccion' => $this->direccion
        ]);
        $this->id = $pdo->lastInsertId();
    }


    public function findByEmail($email)
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM Usuario WHERE email = :email');
        $stmt->execute(['email' => $email]);
        $data = $stmt->fetch();
        if ($data) {
            $user = new User();
            $user->id = $data['id_usuario'];
            $user->nombre_completo = $data['nombre_completo'];
            $user->passwordHash = $data['contrasena'];
            $user->email = $data['email'];
            $user->ci = $data['cedula'];
            $user->fecha_nacimiento = $data['fecha_nacimiento'];
            $user->direccion = $data['direccion'];
            return $user;
        }
    }

    public function update($id, $nombre_completo, $password, $email)
    {
        // Aquí iría la lógica para actualizar un usuario en la base de datos
        $this->id = $id;
        $this->nombre_completo = $nombre_completo;
        if ($password) {
            $this->passwordHash = password_hash($password, PASSWORD_BCRYPT);
        }
        $this->email = $email;
    }
    public function delete($id)
    {
        // Aquí iría la lógica para eliminar un usuario de la base de datos
        $this->id = $id;
    }

    public function registrarHoras() {}

    public function registrarPagos() {}

    // getters
    public function getId()
    {
        return $this->id;
    }

    public function getNombreCompleto()
    {
        return $this->nombre_completo;
    }

    public function getPasswordHash()
    {
        return $this->passwordHash;
    }

    public function getEmail()
    {
        return $this->email;
    }

    public function getCi()
    {
        return $this->ci;
    }

    public function getFechaNacimiento()
    {
        return $this->fecha_nacimiento;
    }
    public function getDireccion()
    {
        return $this->direccion;
    }
}
