<?php

namespace App\controllers;

use App\models\Pay;

class PaymentsController
{
    public function addPay()
    {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => 'Metodo no permitido']);
            exit;
        }
        $usuario_id = $_SESSION['user_id'];
        $archivo = $_FILES['archivo'];
        $nombreArchivo = time() . '_' . basename($archivo['name']);

        // para que se guarde en storage
        $directorio = __DIR__ . '/../../storage/uploads/pagos/'; //no tiene permiso de escritura
        $destino = $directorio . $nombreArchivo;

        // ruta para guardarlo en la BD (relativa)
        $rutaRelativa = 'uploads/pagos/' . $nombreArchivo;

        if (!is_dir($directorio)) {
            mkdir($directorio, 0775, true);
        }

        if (!move_uploaded_file($archivo['tmp_name'], $destino)) {
            echo json_encode(['success' => false, 'message' => 'Error al guardar el archivo']);
            exit;
        }

        // Para guardar en la BD
        $pay = new Pay();
        $resultado = $pay->addPay($usuario_id, $rutaRelativa);

        if ($resultado) {

            $userModel = new \App\models\User();
            $userModel->updateEstado($usuario_id, 'enviado');
            $_SESSION['estado'] = 'enviado';

            echo json_encode([
                'success' => true,
                'message' => 'pago enviado, Se le notificará proximamente si fue aprobado',
                'redirect' => '/pagoEnviado'
            ]);
        } else {
            if (file_exists($destino)) {
                unlink($destino);
            }
            echo json_encode([
                'success' => false,
                'message' => 'error al realizar el registro',
            ]);
        }
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
