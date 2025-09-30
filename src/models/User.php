<?php

namespace App\Models;

use App\config\Database;
use PDO;
use PDOException;

class User
{
    private $id;
    private $nombre_completo;
    private $cedula;
    private $password_hash;
    private $direccion;
    private $estado;
    private $fecha_ingreso;
    private $fecha_nacimiento;
    private $email;
    private $id_nucleo;
    private $id_rol;

    public function findByEmail($email)
    {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('SELECT * FROM Usuario WHERE email = ?');
            $stmt->execute([$email]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($userData) {
                $this->id = $userData['id_usuario'];
                $this->nombre_completo = $userData['nombre_completo'];
                $this->cedula = $userData['cedula'];
                $this->password_hash = $userData['contrasena'];
                $this->direccion = $userData['direccion'];
                $this->estado = $userData['estado'];
                $this->fecha_ingreso = $userData['fecha_ingreso'];
                $this->fecha_nacimiento = $userData['fecha_nacimiento'];
                $this->email = $userData['email'];
                $this->id_nucleo = $userData['id_nucleo'];
                $this->id_rol = $userData['id_rol'];

                return $this;
            }
            return null;
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public function findById($id)
    {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('SELECT * FROM Usuario WHERE id_usuario = ?');
            $stmt->execute([$id]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($userData) {
                $this->id = $userData['id_usuario'];
                $this->nombre_completo = $userData['nombre_completo'];
                $this->cedula = $userData['cedula'];
                $this->password_hash = $userData['contrasena'];
                $this->direccion = $userData['direccion'];
                $this->estado = $userData['estado'];
                $this->fecha_ingreso = $userData['fecha_ingreso'];
                $this->fecha_nacimiento = $userData['fecha_nacimiento'];
                $this->email = $userData['email'];
                $this->id_nucleo = $userData['id_nucleo'];
                $this->id_rol = $userData['id_rol'];

                return $this;
            }
            return null;
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public function create($nombre_completo, $password, $email, $cedula, $fecha_nacimiento, $direccion)
    {
        try {
            $pdo = Database::getConnection();
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare('INSERT INTO Usuario (nombre_completo, cedula, contrasena, direccion, fecha_nacimiento, email) VALUES (?, ?, ?, ?, ?, ?)');
            return $stmt->execute([$nombre_completo, $cedula, $password_hash, $direccion, $fecha_nacimiento, $email]);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function updateEstado($id_usuario, $nuevo_estado)
    {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('UPDATE Usuario SET estado = ? WHERE id_usuario = ?');
            return $stmt->execute([$nuevo_estado, $id_usuario]);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function getPendingPayments()
    {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('
                SELECT 
                    u.id_usuario,
                    u.nombre_completo,
                    u.email,
                    u.cedula,
                    u.estado,
                    cp.id_comprobante,
                    cp.fecha_pago,
                    cp.archivo
                FROM Usuario u
                INNER JOIN Comprobante_Pago cp ON u.id_usuario = cp.id_usuario
                WHERE u.estado = "enviado"
                ORDER BY cp.fecha_pago DESC
            ');
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return [];
        }
    }

    public function isAdmin()
    {
        // Asumiendo que el rol de admin tiene id_rol = 1
        // Ajusta según tu base de datos
        return $this->id_rol !== null && $this->id_rol == 1;
    }

    public function getRoleName()
    {
        if ($this->id_rol === null) {
            return null;
        }
        
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('SELECT nombre_rol FROM Rol WHERE id_rol = ?');
            $stmt->execute([$this->id_rol]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? $result['nombre_rol'] : null;
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    // Getters
    public function getId()
    {
        return $this->id;
    }

    public function getNombreCompleto()
    {
        return $this->nombre_completo;
    }

    public function getCedula()
    {
        return $this->cedula;
    }

    public function getPasswordHash()
    {
        return $this->password_hash;
    }

    public function getDireccion()
    {
        return $this->direccion;
    }

    public function getEstado()
    {
        return $this->estado;
    }

    public function getFechaIngreso()
    {
        return $this->fecha_ingreso;
    }

    public function getFechaNacimiento()
    {
        return $this->fecha_nacimiento;
    }

    public function getEmail()
    {
        return $this->email;
    }

    public function getIdNucleo()
    {
        return $this->id_nucleo;
    }

    public function getIdRol()
    {
        return $this->id_rol;
    }
}