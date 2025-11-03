<?php

namespace App\Controllers;

use App\Models\Material;

class MaterialController
{
    private $materialModel;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->materialModel = new Material();
    }

    // Verificar que sea admin
    private function checkAdmin()
    {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado - Solo administradores']);
            exit();
        }
    }

    // Crear material
    public function create()
    {
        header('Content-Type: application/json');
        $this->checkAdmin();

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['nombre'])) {
                echo json_encode(['success' => false, 'message' => 'El nombre es requerido']);
                exit();
            }

            $nombre = $data['nombre'];
            $caracteristicas = $data['caracteristicas'] ?? '';

            $materialId = $this->materialModel->create($nombre, $caracteristicas);

            echo json_encode([
                'success' => true,
                'message' => 'Material creado exitosamente',
                'id_material' => $materialId
            ]);
        } catch (\Exception $e) {
            error_log("Error en create material: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al crear material']);
        }
        exit();
    }

    // Obtener todos los materiales
    public function getAll()
    {
        header('Content-Type: application/json');
        $this->checkAdmin();

        try {
            $materiales = $this->materialModel->getAll();
            
            echo json_encode([
                'success' => true,
                'materiales' => $materiales,
                'count' => count($materiales)
            ]);
        } catch (\Exception $e) {
            error_log("Error en getAll materiales: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener materiales']);
        }
        exit();
    }

    // Obtener material por ID
    public function getById()
    {
        header('Content-Type: application/json');
        $this->checkAdmin();

        $id = $_GET['id'] ?? null;

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID requerido']);
            exit();
        }

        try {
            $material = $this->materialModel->getById($id);
            
            if ($material) {
                echo json_encode(['success' => true, 'material' => $material]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Material no encontrado']);
            }
        } catch (\Exception $e) {
            error_log("Error en getById material: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener material']);
        }
        exit();
    }

    // Actualizar material
    public function update()
    {
        header('Content-Type: application/json');
        $this->checkAdmin();

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['id']) || empty($data['nombre'])) {
                echo json_encode(['success' => false, 'message' => 'ID y nombre son requeridos']);
                exit();
            }

            $id = $data['id'];
            $nombre = $data['nombre'];
            $caracteristicas = $data['caracteristicas'] ?? '';

            $this->materialModel->update($id, $nombre, $caracteristicas);

            echo json_encode(['success' => true, 'message' => 'Material actualizado exitosamente']);
        } catch (\Exception $e) {
            error_log("Error en update material: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al actualizar material']);
        }
        exit();
    }

    // Actualizar stock
    public function updateStock()
    {
        header('Content-Type: application/json');
        $this->checkAdmin();

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['id']) || !isset($data['cantidad'])) {
                echo json_encode(['success' => false, 'message' => 'ID y cantidad son requeridos']);
                exit();
            }

            $id = $data['id'];
            $cantidad = $data['cantidad'];

            if ($cantidad < 0) {
                echo json_encode(['success' => false, 'message' => 'La cantidad no puede ser negativa']);
                exit();
            }

            $this->materialModel->updateStock($id, $cantidad);

            echo json_encode(['success' => true, 'message' => 'Stock actualizado exitosamente']);
        } catch (\Exception $e) {
            error_log("Error en updateStock: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al actualizar stock']);
        }
        exit();
    }

    // Eliminar material
    public function delete()
    {
        header('Content-Type: application/json');
        $this->checkAdmin();

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['id'])) {
                echo json_encode(['success' => false, 'message' => 'ID requerido']);
                exit();
            }

            $this->materialModel->delete($data['id']);

            echo json_encode(['success' => true, 'message' => 'Material eliminado exitosamente']);
        } catch (\Exception $e) {
            error_log("Error en delete material: " . $e->getMessage());
            
            if (strpos($e->getMessage(), 'asignado a tareas') !== false) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error al eliminar material']);
            }
        }
        exit();
    }

    // Buscar materiales
    public function search()
    {
        header('Content-Type: application/json');
        $this->checkAdmin();

        $searchTerm = $_GET['q'] ?? '';

        if (empty($searchTerm)) {
            echo json_encode(['success' => false, 'message' => 'Término de búsqueda requerido']);
            exit();
        }

        try {
            $materiales = $this->materialModel->search($searchTerm);
            
            echo json_encode([
                'success' => true,
                'materiales' => $materiales,
                'count' => count($materiales)
            ]);
        } catch (\Exception $e) {
            error_log("Error en search materiales: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al buscar materiales']);
        }
        exit();
    }

    // Asignar material a tarea
    public function assignToTask()
    {
        header('Content-Type: application/json');
        $this->checkAdmin();

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['tarea_id']) || empty($data['material_id']) || !isset($data['cantidad'])) {
                echo json_encode(['success' => false, 'message' => 'Tarea ID, Material ID y cantidad son requeridos']);
                exit();
            }

            $tareaId = $data['tarea_id'];
            $materialId = $data['material_id'];
            $cantidad = $data['cantidad'];

            if ($cantidad <= 0) {
                echo json_encode(['success' => false, 'message' => 'La cantidad debe ser mayor a 0']);
                exit();
            }

            $this->materialModel->assignToTask($tareaId, $materialId, $cantidad);

            echo json_encode(['success' => true, 'message' => 'Material asignado a la tarea exitosamente']);
        } catch (\Exception $e) {
            error_log("Error en assignToTask: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al asignar material']);
        }
        exit();
    }

    // Obtener materiales de una tarea
    public function getTaskMaterials()
    {
        header('Content-Type: application/json');

        // Usuarios también pueden ver los materiales de sus tareas
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        $tareaId = $_GET['tarea_id'] ?? null;

        if (!$tareaId) {
            echo json_encode(['success' => false, 'message' => 'ID de tarea requerido']);
            exit();
        }

        try {
            $materiales = $this->materialModel->getTaskMaterials($tareaId);
            
            echo json_encode([
                'success' => true,
                'materiales' => $materiales,
                'count' => count($materiales)
            ]);
        } catch (\Exception $e) {
            error_log("Error en getTaskMaterials: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener materiales de la tarea']);
        }
        exit();
    }

    // Remover material de tarea
    public function removeFromTask()
    {
        header('Content-Type: application/json');
        $this->checkAdmin();

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['tarea_id']) || empty($data['material_id'])) {
                echo json_encode(['success' => false, 'message' => 'Tarea ID y Material ID son requeridos']);
                exit();
            }

            $this->materialModel->removeFromTask($data['tarea_id'], $data['material_id']);

            echo json_encode(['success' => true, 'message' => 'Material removido de la tarea']);
        } catch (\Exception $e) {
            error_log("Error en removeFromTask: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al remover material']);
        }
        exit();
    }

    // Crear solicitud de material
    public function createRequest()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['material_id']) || !isset($data['cantidad'])) {
                echo json_encode(['success' => false, 'message' => 'Material ID y cantidad son requeridos']);
                exit();
            }

            $materialId = $data['material_id'];
            $cantidad = $data['cantidad'];
            $descripcion = $data['descripcion'] ?? null;
            $usuarioId = $_SESSION['user_id'];

            if ($cantidad <= 0) {
                echo json_encode(['success' => false, 'message' => 'La cantidad debe ser mayor a 0']);
                exit();
            }

            $solicitudId = $this->materialModel->createRequest($materialId, $cantidad, $usuarioId, $descripcion);

            echo json_encode([
                'success' => true,
                'message' => 'Solicitud de material creada exitosamente',
                'id_solicitud' => $solicitudId
            ]);
        } catch (\Exception $e) {
            error_log("Error en createRequest: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al crear solicitud']);
        }
        exit();
    }

    // Obtener solicitudes de materiales
    public function getRequests()
    {
        header('Content-Type: application/json');
        $this->checkAdmin();

        $estado = $_GET['estado'] ?? null;

        try {
            $solicitudes = $this->materialModel->getRequests($estado);
            
            echo json_encode([
                'success' => true,
                'solicitudes' => $solicitudes,
                'count' => count($solicitudes)
            ]);
        } catch (\Exception $e) {
            error_log("Error en getRequests: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener solicitudes']);
        }
        exit();
    }
}