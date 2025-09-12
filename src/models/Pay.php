<?php

namespace App\models;

use App\config\Database;
use PDOException;

class Pay
{

    public function addPay($usuario_id, $archivo)
    {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('INSERT INTO Comprobante_Pago (id_usuario, archivo, fecha_pago) VALUES (?,?,NOW())');
            return $stmt->execute([$usuario_id, $archivo]);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }
}
