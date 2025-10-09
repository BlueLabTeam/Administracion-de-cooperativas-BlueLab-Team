<?php

namespace App\Controllers;

use App\Models\RegistroHoras;

class RegistroHorasController
{
    private $registroHorasModel;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->registroHorasModel = new RegistroHoras();
    }

    /**
     * Iniciar jornada (marcar entrada)
     */
    public function iniciarJornada()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $id_usuario = $_SESSION['user_id'];
            $fecha = $_POST['fecha'] ?? date('Y-m-d');
            $hora_entrada = $_POST['hora_entrada'] ?? date('H:i:s');
            $descripcion = $_POST['descripcion'] ?? '';

            // Validar que no sea fin de semana
            $dia_semana = date('N', strtotime($fecha));
            if ($dia_semana > 5) { // 6 = sábado, 7 = domingo
                echo json_encode([
                    'success' => false,
                    'message' => 'No se pueden registrar horas en fin de semana'
                ]);
                exit();
            }

            $resultado = $this->registroHorasModel->iniciarJornada(
                $id_usuario,
                $fecha,
                $hora_entrada,
                $descripcion
            );

            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log("Error en iniciarJornada: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al iniciar jornada'
            ]);
        }
        exit();
    }

    /**
     * Cerrar jornada (marcar salida)
     */
    public function cerrarJornada()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $id_registro = $_POST['id_registro'] ?? null;
            $hora_salida = $_POST['hora_salida'] ?? date('H:i:s');

            if (!$id_registro) {
                echo json_encode([
                    'success' => false,
                    'message' => 'ID de registro requerido'
                ]);
                exit();
            }

            $resultado = $this->registroHorasModel->cerrarJornada($id_registro, $hora_salida);
            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log("Error en cerrarJornada: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al cerrar jornada'
            ]);
        }
        exit();
    }

    /**
     * Obtener registros del usuario autenticado
     */
    public function getMisRegistros()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $id_usuario = $_SESSION['user_id'];
            $fecha_inicio = $_GET['fecha_inicio'] ?? null;
            $fecha_fin = $_GET['fecha_fin'] ?? null;

            $registros = $this->registroHorasModel->getRegistrosByUsuario(
                $id_usuario,
                $fecha_inicio,
                $fecha_fin
            );

            echo json_encode([
                'success' => true,
                'registros' => $registros,
                'count' => count($registros)
            ]);

        } catch (\Exception $e) {
            error_log("Error en getMisRegistros: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener registros'
            ]);
        }
        exit();
    }

    /**
     * Obtener registro abierto del día actual
     */
    public function getRegistroAbiertoHoy()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $id_usuario = $_SESSION['user_id'];
            $registro = $this->registroHorasModel->getRegistroAbiertoHoy($id_usuario);

            echo json_encode([
                'success' => true,
                'registro' => $registro
            ]);

        } catch (\Exception $e) {
            error_log("Error en getRegistroAbiertoHoy: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener registro'
            ]);
        }
        exit();
    }

    /**
     * Obtener resumen semanal
     */
    public function getResumenSemanal()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $id_usuario = $_SESSION['user_id'];
            $fecha = $_GET['fecha'] ?? null;

            $resumen = $this->registroHorasModel->getResumenSemanal($id_usuario, $fecha);

            echo json_encode([
                'success' => true,
                'resumen' => $resumen
            ]);

        } catch (\Exception $e) {
            error_log("Error en getResumenSemanal: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener resumen'
            ]);
        }
        exit();
    }

    /**
     * Obtener estadísticas del mes
     */
    public function getEstadisticasMes()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $id_usuario = $_SESSION['user_id'];
            $mes = $_GET['mes'] ?? date('m');
            $anio = $_GET['anio'] ?? date('Y');

            $estadisticas = $this->registroHorasModel->getEstadisticas($id_usuario, $mes, $anio);

            echo json_encode([
                'success' => true,
                'estadisticas' => $estadisticas
            ]);

        } catch (\Exception $e) {
            error_log("Error en getEstadisticasMes: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener estadísticas'
            ]);
        }
        exit();
    }

    /**
     * Editar registro existente
     */
    public function editarRegistro()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $id_registro = $_POST['id_registro'] ?? null;
            $hora_entrada = $_POST['hora_entrada'] ?? null;
            $hora_salida = $_POST['hora_salida'] ?? null;
            $descripcion = $_POST['descripcion'] ?? '';

            if (!$id_registro || !$hora_entrada) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Datos incompletos'
                ]);
                exit();
            }

            $resultado = $this->registroHorasModel->editarRegistro(
                $id_registro,
                $hora_entrada,
                $hora_salida,
                $descripcion
            );

            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log("Error en editarRegistro: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al editar registro'
            ]);
        }
        exit();
    }

    // ==========================================
    // FUNCIONES PARA ADMINISTRADORES
    // ==========================================

    /**
     * Obtener todos los registros (Admin)
     */
    public function getAllRegistros()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $filtros = [
                'usuario_id' => $_GET['usuario_id'] ?? null,
                'estado' => $_GET['estado'] ?? null,
                'fecha_inicio' => $_GET['fecha_inicio'] ?? null,
                'fecha_fin' => $_GET['fecha_fin'] ?? null
            ];

            $registros = $this->registroHorasModel->getAllRegistros($filtros);

            echo json_encode([
                'success' => true,
                'registros' => $registros,
                'count' => count($registros)
            ]);

        } catch (\Exception $e) {
            error_log("Error en getAllRegistros: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener registros'
            ]);
        }
        exit();
    }

    /**
     * Aprobar registro de horas (Admin)
     */
    public function aprobarHoras()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $id_registro = $_POST['id_registro'] ?? null;
            $observaciones = $_POST['observaciones'] ?? '';

            if (!$id_registro) {
                echo json_encode([
                    'success' => false,
                    'message' => 'ID de registro requerido'
                ]);
                exit();
            }

            $resultado = $this->registroHorasModel->aprobarRechazarHoras(
                $id_registro,
                'aprobar',
                $observaciones
            );

            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log("Error en aprobarHoras: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al aprobar horas'
            ]);
        }
        exit();
    }

    /**
     * Rechazar registro de horas (Admin)
     */
    public function rechazarHoras()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $id_registro = $_POST['id_registro'] ?? null;
            $observaciones = $_POST['observaciones'] ?? '';

            if (!$id_registro) {
                echo json_encode([
                    'success' => false,
                    'message' => 'ID de registro requerido'
                ]);
                exit();
            }

            if (empty($observaciones)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Debe proporcionar una razón para el rechazo'
                ]);
                exit();
            }

            $resultado = $this->registroHorasModel->aprobarRechazarHoras(
                $id_registro,
                'rechazar',
                $observaciones
            );

            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log("Error en rechazarHoras: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al rechazar horas'
            ]);
        }
        exit();
    }

    /**
     * Obtener resumen de horas por usuario (Admin)
     */
    public function getResumenPorUsuario()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        try {
            $usuario_id = $_GET['usuario_id'] ?? null;
            $mes = $_GET['mes'] ?? date('m');
            $anio = $_GET['anio'] ?? date('Y');

            if (!$usuario_id) {
                echo json_encode([
                    'success' => false,
                    'message' => 'ID de usuario requerido'
                ]);
                exit();
            }

            $estadisticas = $this->registroHorasModel->getEstadisticas($usuario_id, $mes, $anio);
            $resumen_semanal = $this->registroHorasModel->getResumenSemanal($usuario_id);

            echo json_encode([
                'success' => true,
                'estadisticas' => $estadisticas,
                'resumen_semanal' => $resumen_semanal
            ]);

        } catch (\Exception $e) {
            error_log("Error en getResumenPorUsuario: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener resumen'
            ]);
        }
        exit();
    }
}