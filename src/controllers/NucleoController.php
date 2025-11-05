<?php

namespace App\controllers;

use App\models\Nucleo;

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

    // ========== NUEVOS ENDPOINTS PARA SOLICITUDES ==========

    /**
     * Obtener núcleos disponibles para solicitar (Usuario)
     */
    public function getNucleosDisponibles()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $nucleos = $this->nucleoModel->getNucleosDisponibles();
            echo json_encode(['success' => true, 'nucleos' => $nucleos]);
        } catch (\Exception $e) {
            error_log("Error en getNucleosDisponibles: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al cargar núcleos']);
        }
        exit();
    }

    /**
     * Crear solicitud para unirse a un núcleo (Usuario)
     */
    public function solicitarUnirse()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $idNucleo = $_POST['id_nucleo'] ?? null;
            $mensaje = $_POST['mensaje'] ?? '';

            if (!$idNucleo) {
                echo json_encode(['success' => false, 'message' => 'ID de núcleo requerido']);
                exit();
            }

            $solicitudId = $this->nucleoModel->crearSolicitudNucleo(
                $_SESSION['user_id'],
                $idNucleo,
                $mensaje
            );

            echo json_encode([
                'success' => true,
                'message' => 'Solicitud enviada correctamente. Espera la aprobación del administrador.',
                'id_solicitud' => $solicitudId
            ]);
        } catch (\Exception $e) {
            error_log("Error en solicitarUnirse: " . $e->getMessage());
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit();
    }

    /**
     * Obtener solicitudes del usuario actual
     */
    public function getMisSolicitudesNucleo()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $solicitudes = $this->nucleoModel->getSolicitudesUsuario($_SESSION['user_id']);
            echo json_encode(['success' => true, 'solicitudes' => $solicitudes]);
        } catch (\Exception $e) {
            error_log("Error en getMisSolicitudesNucleo: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al cargar solicitudes']);
        }
        exit();
    }

    /**
     * Cancelar solicitud pendiente (Usuario)
     */
    public function cancelarSolicitudNucleo()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $solicitudId = $_POST['id_solicitud'] ?? null;

            if (!$solicitudId) {
                echo json_encode(['success' => false, 'message' => 'ID de solicitud requerido']);
                exit();
            }

            $resultado = $this->nucleoModel->cancelarSolicitud($solicitudId, $_SESSION['user_id']);

            if ($resultado) {
                echo json_encode(['success' => true, 'message' => 'Solicitud cancelada']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se pudo cancelar la solicitud']);
            }
        } catch (\Exception $e) {
            error_log("Error en cancelarSolicitudNucleo: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al cancelar solicitud']);
        }
        exit();
    }

    /**
     * Obtener solicitudes pendientes (Admin)
     */
    public function getSolicitudesPendientesAdmin()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $solicitudes = $this->nucleoModel->getSolicitudesPendientes();
            echo json_encode(['success' => true, 'solicitudes' => $solicitudes]);
        } catch (\Exception $e) {
            error_log("Error en getSolicitudesPendientesAdmin: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al cargar solicitudes']);
        }
        exit();
    }

    /**
     * Aprobar solicitud de núcleo (Admin)
     */
    public function aprobarSolicitudNucleo()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $solicitudId = $_POST['id_solicitud'] ?? null;
            $observaciones = $_POST['observaciones'] ?? '';

            if (!$solicitudId) {
                echo json_encode(['success' => false, 'message' => 'ID de solicitud requerido']);
                exit();
            }

            $this->nucleoModel->aprobarSolicitudNucleo(
                $solicitudId,
                $_SESSION['user_id'],
                $observaciones
            );

            echo json_encode([
                'success' => true,
                'message' => 'Usuario agregado al núcleo correctamente'
            ]);
        } catch (\Exception $e) {
            error_log("Error en aprobarSolicitudNucleo: " . $e->getMessage());
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit();
    }

    /**
     * Rechazar solicitud de núcleo (Admin)
     */
    public function rechazarSolicitudNucleo()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $solicitudId = $_POST['id_solicitud'] ?? null;
            $motivo = $_POST['motivo'] ?? 'Solicitud rechazada';

            if (!$solicitudId) {
                echo json_encode(['success' => false, 'message' => 'ID de solicitud requerido']);
                exit();
            }

            $this->nucleoModel->rechazarSolicitudNucleo(
                $solicitudId,
                $_SESSION['user_id'],
                $motivo
            );

            echo json_encode(['success' => true, 'message' => 'Solicitud rechazada']);
        } catch (\Exception $e) {
            error_log("Error en rechazarSolicitudNucleo: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al rechazar solicitud']);
        }
        exit();
    }

    /**
     * Obtener información del núcleo familiar del usuario actual
     */

public function getMiNucleoInfo()
{
    header('Content-Type: application/json');

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'No autenticado']);
        exit();
    }

    try {
        $resultado = $this->nucleoModel->getMiNucleoCompleto($_SESSION['user_id']);

        if (!$resultado) {
            echo json_encode([
                'success' => false,
                'message' => 'No perteneces a ningún núcleo'
            ]);
            exit();
        }

        echo json_encode([
            'success' => true,
            'nucleo' => $resultado['nucleo'],
            'miembros' => $resultado['miembros'],
            'mi_id' => $_SESSION['user_id']
        ]);
        
    } catch (\Exception $e) {
        error_log("Error en getMiNucleoInfo: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al cargar información']);
    }
    exit();
}
}