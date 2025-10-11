<?php

namespace App\Controllers;

use App\Models\RegistroHoras;

class RegistroHorasController
{
    private $registroHorasModel;

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
        
        $this->registroHorasModel = new RegistroHoras();
    }

    /**
     * Iniciar jornada (marcar entrada)
     */
    public function iniciarJornada()
    {
        try {
            ob_clean();
            header('Content-Type: application/json; charset=utf-8');
            
            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode([
                    'success' => false, 
                    'message' => 'No autenticado'
                ]);
                exit();
            }

            $id_usuario = intval($_SESSION['user_id']);
            $fecha = $_POST['fecha'] ?? date('Y-m-d');
            $hora_entrada = $_POST['hora_entrada'] ?? date('H:i:s');
            $descripcion = trim($_POST['descripcion'] ?? '');

            error_log("=== INICIAR JORNADA ===");
            error_log("Usuario ID: " . $id_usuario);
            error_log("Fecha: " . $fecha);
            error_log("Hora entrada: " . $hora_entrada);

         

            $resultado = $this->registroHorasModel->iniciarJornada(
                $id_usuario,
                $fecha,
                $hora_entrada,
                $descripcion
            );

            error_log("Resultado: " . json_encode($resultado));
            echo json_encode($resultado);

        } catch (\Exception $e) {
            error_log("❌ Error en iniciarJornada: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al iniciar jornada',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    /**
     * Cerrar jornada (marcar salida)
     */
    public function cerrarJornada()
    {
        try {
            ob_clean();
            header('Content-Type: application/json; charset=utf-8');

            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'No autenticado']);
                exit();
            }

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
                'message' => 'Error al cerrar jornada',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    /**
     * Obtener registros del usuario autenticado
     */
    public function getMisRegistros()
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
                'message' => 'Error al obtener registros',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    /**
     * Obtener registro abierto del día actual
     */
    public function getRegistroAbiertoHoy()
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
                'message' => 'Error al obtener registro',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    /**
     * Obtener resumen semanal
     */
    public function getResumenSemanal()
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
            $fecha = $_GET['fecha'] ?? null;

            $resumen = $this->registroHorasModel->getResumenSemanal($id_usuario, $fecha);

            echo json_encode([
                'success' => true,
                'resumen' => $resumen
            ]);

        } catch (\Exception $e) {
            error_log("Error en getResumenSemanal: " . $e->getMessage());
            error_log("Stack: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener resumen',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    /**
     * Obtener estadísticas del mes
     */
    public function getEstadisticasMes()
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
            $mes = $_GET['mes'] ?? date('m');
            $anio = $_GET['anio'] ?? date('Y');

            $estadisticas = $this->registroHorasModel->getEstadisticas($id_usuario, $mes, $anio);

            echo json_encode([
                'success' => true,
                'estadisticas' => $estadisticas
            ]);

        } catch (\Exception $e) {
            error_log("Error en getEstadisticasMes: " . $e->getMessage());
            error_log("Stack: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    /**
     * Editar registro existente
     */
    public function editarRegistro()
    {
        try {
            ob_clean();
            header('Content-Type: application/json; charset=utf-8');

            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'No autenticado']);
                exit();
            }

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
                'message' => 'Error al editar registro',
                'error' => $e->getMessage()
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
        try {
            ob_clean();
            header('Content-Type: application/json; charset=utf-8');

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
                'message' => 'Error al obtener registros',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    /**
     * Aprobar registro de horas (Admin)
     */
    public function aprobarHoras()
    {
        try {
            ob_clean();
            header('Content-Type: application/json; charset=utf-8');

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
                'message' => 'Error al aprobar horas',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    /**
     * Rechazar registro de horas (Admin)
     */
    public function rechazarHoras()
    {
        try {
            ob_clean();
            header('Content-Type: application/json; charset=utf-8');

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
                'message' => 'Error al rechazar horas',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }

    /**
     * Obtener resumen de horas por usuario (Admin)
     */
    public function getResumenPorUsuario()
    {
        try {
            ob_clean();
            header('Content-Type: application/json; charset=utf-8');

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
                'message' => 'Error al obtener resumen',
                'error' => $e->getMessage()
            ]);
        }
        exit();
    }
}