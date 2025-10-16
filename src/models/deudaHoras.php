<?php

namespace App\Models;

use App\config\Database;
use PDO;

class DeudaHoras
{
    private $conn;
    private $deuda_inicial = 3360; // Deuda fija inicial

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    /**
     * Obtener deuda actual del usuario
     * Deuda inicial - horas aprobadas
     */
    public function obtenerDeudaActual($id_usuario)
    {
        try {
            error_log("=== obtenerDeudaActual ===");
            error_log("ID Usuario: " . $id_usuario);
            
            // Obtener total de horas aprobadas
            $stmt = $this->conn->prepare("
                SELECT COALESCE(SUM(total_horas), 0) as total_horas
                FROM Registro_Horas
                WHERE id_usuario = :id_usuario
                AND estado = 'aprobado'
                AND total_horas > 0
            ");

            $stmt->execute(['id_usuario' => $id_usuario]);
            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $horas_aprobadas = (float)$resultado['total_horas'];
            
            error_log("Horas aprobadas: " . $horas_aprobadas);
            
            // Deuda restante = deuda inicial - horas aprobadas
            $deuda_restante = max(0, $this->deuda_inicial - $horas_aprobadas);
            
            $porcentaje_pagado = $this->deuda_inicial > 0 
                ? round(($horas_aprobadas / $this->deuda_inicial) * 100, 2)
                : 0;

            error_log("Deuda restante: " . $deuda_restante);
            error_log("Porcentaje pagado: " . $porcentaje_pagado);

            return [
                'deuda_inicial' => $this->deuda_inicial,
                'horas_aprobadas' => round($horas_aprobadas, 2),
                'deuda_restante' => round($deuda_restante, 2),
                'porcentaje_pagado' => $porcentaje_pagado
            ];

        } catch (\PDOException $e) {
            error_log("Error en obtenerDeudaActual: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            return [
                'deuda_inicial' => $this->deuda_inicial,
                'horas_aprobadas' => 0,
                'deuda_restante' => $this->deuda_inicial,
                'porcentaje_pagado' => 0
            ];
        }
    }

    /**
     * Obtener historial de cambios en deuda (últimos registros aprobados)
     */
    public function obtenerHistorialDeuda($id_usuario, $limite = 10)
    {
        try {
            error_log("=== obtenerHistorialDeuda ===");
            error_log("ID Usuario: " . $id_usuario);
            error_log("Límite: " . $limite);
            
            $stmt = $this->conn->prepare("
                SELECT 
                    id_registro,
                    fecha,
                    hora_entrada,
                    hora_salida,
                    total_horas,
                    estado,
                    descripcion
                FROM Registro_Horas
                WHERE id_usuario = :id_usuario
                AND estado = 'aprobado'
                AND total_horas > 0
                ORDER BY fecha DESC, hora_entrada DESC
                LIMIT :limite
            ");

            $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
            $stmt->bindParam(':limite', $limite, PDO::PARAM_INT);
            $stmt->execute();

            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("Registros encontrados: " . count($resultados));

            return $resultados;

        } catch (\PDOException $e) {
            error_log("Error en obtenerHistorialDeuda: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }
}