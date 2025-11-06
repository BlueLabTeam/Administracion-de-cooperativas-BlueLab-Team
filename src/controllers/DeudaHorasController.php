<?php

namespace App\controllers;

use App\models\DeudaHoras;

class DeudaHorasController
{
    private $deudaHorasModel;

    public function __construct()
    {
        // Limpiar cualquier output previo
        while (ob_get_level()) {
            ob_end_clean();
        }
        ob_start();
        
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $this->deudaHorasModel = new DeudaHoras();
    }

    /**
     * Obtener deuda actual del usuario
     * 
     */
    public function getDeudaActual()
    {
        try {
            ob_clean();
            header('Content-Type: application/json; charset=utf-8');

            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'No autenticado']);
                exit();
            }

            $id_usuario = $_SESSION['user_id'];
            
            error_log("=== getDeudaActual ===");
            error_log("Usuario ID: " . $id_usuario);
            
            $deuda = $this->deudaHorasModel->obtenerDeudaActual($id_usuario);
            
            error_log("Deuda calculada: " . json_encode($deuda));

            echo json_encode([
                'success' => true,
                'deuda' => $deuda
            ]);

        } catch (\Exception $e) {
            error_log("Error en getDeudaActual: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener deuda',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    /**
 * Obtener historial mensual de horas
 * 
 */
public function getHistorialMensual()
{
    try {
        ob_clean();
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        $id_usuario = $_SESSION['user_id'];
        $meses = isset($_GET['meses']) ? intval($_GET['meses']) : 6;
        
        error_log("=== getHistorialMensual ===");
        error_log("Usuario ID: " . $id_usuario);
        error_log("Meses a consultar: " . $meses);

        $historial = $this->deudaHorasModel->obtenerHistorialMensual($id_usuario, $meses);
        
        error_log("Registros encontrados: " . count($historial));

        echo json_encode([
            'success' => true,
            'historial' => $historial,
            'total' => count($historial)
        ]);

    } catch (\Exception $e) {
        error_log("Error en getHistorialMensual: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener historial',
            'error' => $e->getMessage()
        ]);
    }
    exit();
}


    /**
     * Obtener historial de cambios
     * 
     */
    public function getHistorialDeuda()
    {
        try {
            ob_clean();
            header('Content-Type: application/json; charset=utf-8');

            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'No autenticado']);
                exit();
            }

            $id_usuario = $_SESSION['user_id'];
            $limite = isset($_GET['limite']) ? intval($_GET['limite']) : 20;
            
            error_log("=== getHistorialDeuda ===");
            error_log("Usuario ID: " . $id_usuario);
            error_log("Límite: " . $limite);

            $historial = $this->deudaHorasModel->obtenerHistorialDeuda($id_usuario, $limite);
            
            error_log("Registros encontrados: " . count($historial));

            echo json_encode([
                'success' => true,
                'historial' => $historial,
                'total' => count($historial)
            ]);

        } catch (\Exception $e) {
            error_log("Error en getHistorialDeuda: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener historial',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }
}


