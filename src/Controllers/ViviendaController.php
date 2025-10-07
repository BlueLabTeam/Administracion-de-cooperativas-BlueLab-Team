<?php

namespace App\Controllers;

use App\Models\Vivienda;
use App\Models\User;
use App\Models\Nucleo;

class ViviendaController
{
    private $viviendaModel;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->viviendaModel = new Vivienda();
    }

    // Obtener todas las viviendas (Admin)
    public function getAll()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $viviendas = $this->viviendaModel->getAll();
            echo json_encode([
                'success' => true,
                'viviendas' => $viviendas,
                'count' => count($viviendas)
            ]);
        } catch (\Exception $e) {
            error_log("Error en getAll: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener viviendas']);
        }
        exit();
    }

    // Obtener vivienda por ID
    public function getById()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID requerido']);
            exit();
        }

        try {
            $vivienda = $this->viviendaModel->getById($id);
            if ($vivienda) {
                echo json_encode(['success' => true, 'vivienda' => $vivienda]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Vivienda no encontrada']);
            }
        } catch (\Exception $e) {
            error_log("Error en getById: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener vivienda']);
        }
        exit();
    }

    // Crear vivienda
    public function create()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $data = [
                'numero_vivienda' => $_POST['numero_vivienda'] ?? '',
                'direccion' => $_POST['direccion'] ?? '',
                'id_tipo' => $_POST['id_tipo'] ?? null,
                'estado' => $_POST['estado'] ?? 'disponible',
                'metros_cuadrados' => $_POST['metros_cuadrados'] ?? 0,
                'observaciones' => $_POST['observaciones'] ?? '',
                'fecha_construccion' => $_POST['fecha_construccion'] ?? null
            ];

            if (empty($data['numero_vivienda']) || !$data['id_tipo']) {
                echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
                exit();
            }

            $id = $this->viviendaModel->create($data);
            echo json_encode([
                'success' => true,
                'message' => 'Vivienda creada exitosamente',
                'id' => $id
            ]);
        } catch (\Exception $e) {
            error_log("Error en create: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al crear vivienda: ' . $e->getMessage()]);
        }
        exit();
    }

    // Actualizar vivienda
    public function update()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $id = $_POST['id'] ?? null;
            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'ID requerido']);
                exit();
            }

            $data = [
                'numero_vivienda' => $_POST['numero_vivienda'] ?? '',
                'direccion' => $_POST['direccion'] ?? '',
                'id_tipo' => $_POST['id_tipo'] ?? null,
                'estado' => $_POST['estado'] ?? 'disponible',
                'metros_cuadrados' => $_POST['metros_cuadrados'] ?? 0,
                'observaciones' => $_POST['observaciones'] ?? '',
                'fecha_construccion' => $_POST['fecha_construccion'] ?? null
            ];

            $this->viviendaModel->update($id, $data);
            echo json_encode(['success' => true, 'message' => 'Vivienda actualizada exitosamente']);
        } catch (\Exception $e) {
            error_log("Error en update: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al actualizar vivienda']);
        }
        exit();
    }

    // Eliminar vivienda
    public function delete()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $id = $_POST['id'] ?? null;
            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'ID requerido']);
                exit();
            }

            $this->viviendaModel->delete($id);
            echo json_encode(['success' => true, 'message' => 'Vivienda eliminada exitosamente']);
        } catch (\Exception $e) {
            error_log("Error en delete: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit();
    }

    // Asignar vivienda
    public function asignar()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $viviendaId = $_POST['vivienda_id'] ?? null;
            $usuarioId = $_POST['usuario_id'] ?? null;
            $nucleoId = $_POST['nucleo_id'] ?? null;
            $observaciones = $_POST['observaciones'] ?? '';

            if (!$viviendaId) {
                echo json_encode(['success' => false, 'message' => 'ID de vivienda requerido']);
                exit();
            }

            $id = $this->viviendaModel->asignar($viviendaId, $usuarioId, $nucleoId, $observaciones);
            echo json_encode([
                'success' => true,
                'message' => 'Vivienda asignada exitosamente',
                'id' => $id
            ]);
        } catch (\Exception $e) {
            error_log("Error en asignar: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit();
    }

    // Desasignar vivienda
    public function desasignar()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $asignacionId = $_POST['asignacion_id'] ?? null;
            if (!$asignacionId) {
                echo json_encode(['success' => false, 'message' => 'ID de asignación requerido']);
                exit();
            }

            $this->viviendaModel->desasignar($asignacionId);
            echo json_encode(['success' => true, 'message' => 'Vivienda desasignada exitosamente']);
        } catch (\Exception $e) {
            error_log("Error en desasignar: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al desasignar vivienda']);
        }
        exit();
    }

    // Obtener tipos de vivienda
    public function getTipos()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $tipos = $this->viviendaModel->getTipos();
            echo json_encode(['success' => true, 'tipos' => $tipos]);
        } catch (\Exception $e) {
            error_log("Error en getTipos: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener tipos']);
        }
        exit();
    }

    // Obtener vivienda del usuario actual
    public function getMyVivienda()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $userId = $_SESSION['user_id'];
            
            // Primero buscar asignación directa al usuario
            $vivienda = $this->viviendaModel->getViviendaUsuario($userId);
            
            // Si no tiene asignación directa, buscar por núcleo
            if (!$vivienda) {
                $userModel = new User();
                $user = $userModel->findById($userId);
                
                if ($user && $user->getIdNucleo()) {
                    $vivienda = $this->viviendaModel->getViviendaNucleo($user->getIdNucleo());
                }
            }

            if ($vivienda) {
                echo json_encode(['success' => true, 'vivienda' => $vivienda]);
            } else {
                echo json_encode(['success' => true, 'vivienda' => null, 'message' => 'Sin vivienda asignada']);
            }
        } catch (\Exception $e) {
            error_log("Error en getMyVivienda: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener vivienda']);
        }
        exit();
    }
}