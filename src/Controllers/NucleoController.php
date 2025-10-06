<?php

namespace App\Controllers;

use App\Models\Nucleo;

class NucleoController
{
    private $nucleoModel;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->nucleoModel = new Nucleo();
    }

    // Crear nuevo núcleo
    public function create()
    {
        // Limpiar buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $nombreNucleo = $_POST['nombre_nucleo'] ?? '';
        $direccion = $_POST['direccion'] ?? '';
        $usuariosIds = $_POST['usuarios'] ?? [];

        if (empty($nombreNucleo)) {
            echo json_encode(['success' => false, 'message' => 'El nombre del núcleo es obligatorio'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (empty($usuariosIds)) {
            echo json_encode(['success' => false, 'message' => 'Debe seleccionar al menos un usuario'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $nucleoId = $this->nucleoModel->create($nombreNucleo, $direccion);
            
            if ($nucleoId) {
                $this->nucleoModel->assignUsers($nucleoId, $usuariosIds);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Núcleo familiar creado exitosamente',
                    'nucleo_id' => $nucleoId
                ], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al crear núcleo'], JSON_UNESCAPED_UNICODE);
            }
        } catch (\Exception $e) {
            error_log("Error al crear núcleo: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    // Obtener todos los núcleos con sus miembros
    public function getAll()
    {
        // Limpiar buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $nucleos = $this->nucleoModel->getAllWithMembers();
            
            echo json_encode([
                'success' => true,
                'nucleos' => $nucleos
            ], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            error_log("Error al obtener núcleos: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al cargar núcleos'], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    // Obtener detalles de un núcleo específico
    public function getDetails()
    {
        // Limpiar buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $nucleoId = $_GET['nucleo_id'] ?? null;

        if (!$nucleoId) {
            echo json_encode(['success' => false, 'message' => 'ID de núcleo requerido'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $nucleo = $this->nucleoModel->getById($nucleoId);
            $miembros = $this->nucleoModel->getMembers($nucleoId);
            
            echo json_encode([
                'success' => true,
                'nucleo' => $nucleo,
                'miembros' => $miembros
            ], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            error_log("Error al obtener detalles: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error al cargar detalles'], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    // Actualizar núcleo
    public function update()
    {
        // Limpiar buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $nucleoId = $_POST['nucleo_id'] ?? null;
        $nombreNucleo = $_POST['nombre_nucleo'] ?? '';
        $direccion = $_POST['direccion'] ?? '';
        $usuariosIds = $_POST['usuarios'] ?? [];

        if (!$nucleoId || empty($nombreNucleo)) {
            echo json_encode(['success' => false, 'message' => 'Datos incompletos'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $this->nucleoModel->update($nucleoId, $nombreNucleo, $direccion);
            $this->nucleoModel->updateMembers($nucleoId, $usuariosIds);
            
            echo json_encode([
                'success' => true,
                'message' => 'Núcleo actualizado exitosamente'
            ], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            error_log("Error al actualizar núcleo: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    // Eliminar núcleo
    public function delete()
    {
        // Limpiar buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $nucleoId = $_POST['nucleo_id'] ?? null;

        if (!$nucleoId) {
            echo json_encode(['success' => false, 'message' => 'ID de núcleo requerido'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $this->nucleoModel->delete($nucleoId);
            
            echo json_encode([
                'success' => true,
                'message' => 'Núcleo eliminado exitosamente'
            ], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            error_log("Error al eliminar núcleo: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }

    // Obtener usuarios disponibles (sin núcleo asignado)
    public function getAvailableUsers()
    {
        // Limpiar cualquier output previo
        if (ob_get_level()) {
            ob_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $usuarios = $this->nucleoModel->getAvailableUsers();
            
            echo json_encode([
                'success' => true,
                'usuarios' => $usuarios,
                'count' => count($usuarios)
            ], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            error_log("Error al obtener usuarios disponibles: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'message' => 'Error al cargar usuarios: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }
}