<?php

namespace App\controllers;

use App\models\Pay;
use App\models\User;

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
        $directorio = __DIR__ . '/../../storage/uploads/pagos';
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

        $pay = new Pay();
        $resultado = $pay->addPay($usuario_id, $rutaRelativa);

        if ($resultado) {

            $userModel = new User();
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
}
