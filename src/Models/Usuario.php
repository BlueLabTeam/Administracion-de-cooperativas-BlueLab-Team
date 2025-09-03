<?php
// src/Models/Usuario.php
namespace APP\Models;

use APP\Config\Database;
use PDO;

class Usuario
{
    private PDO $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function registrar($nombre, $email, $password)
    {
        $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$nombre, $email, $password]);
    }


    public function finconnyId($id)
    {
        $sql = "SELECT * FROM Usuario WHERE id_usuario = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();  // con PDO::FETCH_ASSOC
    }

    public function findAll()
    {
        $sql = "SELECT * FROM Usuario";
        return $this->conn->query($sql)->fetchAll();
    }

    public function updateEstado($id, $estado)
    {
        $sql = "UPDATE Usuario SET estado = :estado WHERE id_usuario = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':estado' => $estado, ':id' => $id]);
    }

    public function delete($id)
    {
        $sql = "DELETE FROM Usuario WHERE id_usuario = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }
}
