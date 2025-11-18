<?php

namespace App\models;

use App\config\Database;
use PDO;
use PDOException;

class Pay
{
    private $conn;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Registrar primer pago de un usuario
     */
    public function addPay($usuario_id, $rutaArchivo, $monto = 5000.00)
    {
        try {
            error_log("=== addPay() INICIADO ===");
            error_log("Usuario ID: $usuario_id");
            error_log("Ruta archivo: $rutaArchivo");
            error_log("Monto: $monto");
            
            // Verificar si ya existe un pago para este usuario
            $checkQuery = "SELECT COUNT(*) FROM pagos WHERE id_usuario = :usuario_id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
            $checkStmt->execute();
            
            if ($checkStmt->fetchColumn() > 0) {
                error_log("ERROR: Usuario ya tiene un pago registrado");
                return false;
            }
            
            // Insertar nuevo pago
            $query = "INSERT INTO pagos 
                      (id_usuario, comprobante_archivo, monto, fecha_pago, estado_validacion, tipo_pago) 
                      VALUES 
                      (:usuario_id, :archivo, :monto, NOW(), 'pendiente', 'primer_pago')";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
            $stmt->bindParam(':archivo', $rutaArchivo, PDO::PARAM_STR);
            $stmt->bindParam(':monto', $monto, PDO::PARAM_STR);
            
            $result = $stmt->execute();
            
            if (!$result) {
                error_log("ERROR EN SQL: " . print_r($stmt->errorInfo(), true));
                return false;
            }
            
            $lastId = $this->conn->lastInsertId();
            error_log(" Pago registrado exitosamente. ID: $lastId");
            
            return true;
            
        } catch (PDOException $e) {
            error_log("EXCEPCIÓN EN addPay(): " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Obtener pago de un usuario
     */
    public function getPayByUser($usuario_id)
    {
        try {
            $query = "SELECT * FROM pagos WHERE id_usuario = :usuario_id ORDER BY fecha_pago DESC LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            error_log("Error en getPayByUser: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtener todos los pagos pendientes
     */
    public function getPendingPayments()
    {
        try {
            $query = "SELECT p.*, u.nombre_completo, u.email, u.cedula 
                      FROM pagos p
                      INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
                      WHERE p.estado_validacion = 'pendiente'
                      ORDER BY p.fecha_pago DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            error_log("Error en getPendingPayments: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Aprobar pago
     */
    public function approvePayment($pago_id, $observaciones = null)
    {
        try {
            $query = "UPDATE pagos 
                      SET estado_validacion = 'aprobado', 
                          fecha_validacion = NOW(),
                          observaciones = :observaciones
                      WHERE id_pago = :pago_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':pago_id', $pago_id, PDO::PARAM_INT);
            $stmt->bindParam(':observaciones', $observaciones, PDO::PARAM_STR);
            
            return $stmt->execute();
            
        } catch (PDOException $e) {
            error_log("Error en approvePayment: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Rechazar pago
     */
    public function rejectPayment($pago_id, $motivo)
    {
        try {
            $query = "UPDATE pagos 
                      SET estado_validacion = 'rechazado', 
                          fecha_validacion = NOW(),
                          observaciones = :motivo
                      WHERE id_pago = :pago_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':pago_id', $pago_id, PDO::PARAM_INT);
            $stmt->bindParam(':motivo', $motivo, PDO::PARAM_STR);
            
            return $stmt->execute();
            
        } catch (PDOException $e) {
            error_log("Error en rejectPayment: " . $e->getMessage());
            return false;
        }
    }
}
