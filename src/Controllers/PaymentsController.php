<?php

namespace App\controllers;

use App\models\Pay;

class PaymentsController
{
    public function addPay()
    {
        // DEBUGGING: Log todo lo que llega
        error_log("=== INICIO addPay ===");
        error_log("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
        error_log("POST data: " . print_r($_POST, true));
        error_log("FILES data: " . print_r($_FILES, true));
        error_log("SESSION data: " . print_r($_SESSION, true));
        
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            error_log("ERROR: Método no POST");
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
            exit;
        }

        if (!isset($_SESSION['user_id'])) {
            error_log("ERROR: No hay user_id en sesión");
            echo json_encode(['success' => false, 'message' => 'Usuario no autenticado']);
            exit;
        }

        if (!isset($_FILES['archivo'])) {
            error_log("ERROR: No se recibió archivo");
            echo json_encode(['success' => false, 'message' => 'No se recibió el archivo']);
            exit;
        }

        $usuario_id = $_SESSION['user_id'];
        $archivo = $_FILES['archivo'];
        
        error_log("Usuario ID: $usuario_id");
        error_log("Archivo nombre: " . $archivo['name']);
        error_log("Archivo tmp: " . $archivo['tmp_name']);
        error_log("Archivo error: " . $archivo['error']);
        
        $nombreArchivo = time() . '_' . basename($archivo['name']);

        // para que se guarde en storage
        $directorio = __DIR__ . '/../../storage/uploads/pagos/';
        $destino = $directorio . $nombreArchivo;

        error_log("Directorio destino: $directorio");
        error_log("Archivo destino: $destino");

        // ruta para guardarlo en la BD (relativa)
        $rutaRelativa = 'uploads/pagos/' . $nombreArchivo;

        if (!is_dir($directorio)) {
            error_log("Creando directorio: $directorio");
            mkdir($directorio, 0775, true);
        }

        if (!move_uploaded_file($archivo['tmp_name'], $destino)) {
            error_log("ERROR: No se pudo mover el archivo");
            error_log("Error move_uploaded_file: " . print_r(error_get_last(), true));
            echo json_encode(['success' => false, 'message' => 'Error al guardar el archivo']);
            exit;
        }

        error_log("Archivo movido exitosamente a: $destino");

        $pay = new Pay();
        $resultado = $pay->addPay($usuario_id, $rutaRelativa);

        error_log("Resultado addPay BD: " . ($resultado ? 'true' : 'false'));

        if ($resultado) {

            $userModel = new \App\models\User();
            $updateResult = $userModel->updateEstado($usuario_id, 'enviado');
            error_log("Resultado updateEstado: " . ($updateResult ? 'true' : 'false'));
            
            $_SESSION['estado'] = 'enviado';

            error_log("=== ÉXITO addPay ===");
            echo json_encode([
                'success' => true,
                'message' => 'pago enviado, Se le notificará proximamente si fue aprobado',
                'redirect' => '/pagoEnviado'
            ]);
        } else {
            if (file_exists($destino)) {
                unlink($destino);
                error_log("Archivo eliminado por error en BD");
            }
            error_log("ERROR: Fallo al guardar en BD");
            echo json_encode([
                'success' => false,
                'message' => 'error al realizar el registro',
            ]);
        }
        
        error_log("=== FIN addPay ===");
        exit;
    }

    public function approvePayment()
    {
        header('Content-Type: application/json');
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
            exit();
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Verificar que sea admin
        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        $id_usuario = $_POST['id_usuario'] ?? null;

        if (!$id_usuario) {
            echo json_encode(['success' => false, 'message' => 'ID de usuario no proporcionado']);
            exit();
        }

        $userModel = new \App\Models\User();
        $resultado = $userModel->updateEstado($id_usuario, 'aceptado');

        if ($resultado) {
            echo json_encode(['success' => true, 'message' => 'Pago aprobado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al aprobar el pago']);
        }
        exit();
    }

    public function rejectPayment()
    {
        header('Content-Type: application/json');
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
            exit();
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Verificar que sea admin
        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        $id_usuario = $_POST['id_usuario'] ?? null;

        if (!$id_usuario) {
            echo json_encode(['success' => false, 'message' => 'ID de usuario no proporcionado']);
            exit();
        }

        $userModel = new \App\Models\User();
        // Cambiar a 'pendiente' para que pueda volver a subir el pago
        $resultado = $userModel->updateEstado($id_usuario, 'pendiente');

        if ($resultado) {
            echo json_encode(['success' => true, 'message' => 'Pago rechazado. El usuario podrá volver a intentarlo']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al rechazar el pago']);
        }
        exit();
    }
}