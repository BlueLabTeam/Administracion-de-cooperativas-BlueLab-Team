<?php

namespace App\controllers;

use App\models\Pay;
use App\models\User;

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
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
            exit;
        }

        if (!isset($_SESSION['user_id'])) {
            error_log("ERROR: No hay user_id en sesión");
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Usuario no autenticado']);
            exit;
        }

        if (!isset($_FILES['archivo'])) {
            error_log("ERROR: No se recibió archivo");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No se recibió el archivo']);
            exit;
        }

        $usuario_id = $_SESSION['user_id'];
        $archivo = $_FILES['archivo'];
        
        error_log("Usuario ID: $usuario_id");
        error_log("Archivo nombre: " . $archivo['name']);
        error_log("Archivo tmp: " . $archivo['tmp_name']);
        error_log("Archivo error: " . $archivo['error']);
        
        //  VALIDAR ERRORES DE SUBIDA
        if ($archivo['error'] !== UPLOAD_ERR_OK) {
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE => 'El archivo excede upload_max_filesize en php.ini',
                UPLOAD_ERR_FORM_SIZE => 'El archivo excede MAX_FILE_SIZE del formulario',
                UPLOAD_ERR_PARTIAL => 'El archivo se subió parcialmente',
                UPLOAD_ERR_NO_FILE => 'No se subió ningún archivo',
                UPLOAD_ERR_NO_TMP_DIR => 'Falta carpeta temporal',
                UPLOAD_ERR_CANT_WRITE => 'Error al escribir en disco',
                UPLOAD_ERR_EXTENSION => 'Extensión PHP detuvo la subida'
            ];
            
            $errorMsg = $errorMessages[$archivo['error']] ?? 'Error desconocido';
            error_log("ERROR DE SUBIDA: $errorMsg (código: {$archivo['error']})");
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Error al subir archivo: ' . $errorMsg,
                'error_code' => $archivo['error']
            ]);
            exit;
        }
        
        //  VALIDAR EXTENSIÓN
        $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'webp'];
        
        if (!in_array($extension, $allowedExtensions)) {
            error_log("ERROR: Extensión no permitida: $extension");
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Formato de archivo no permitido. Solo: ' . implode(', ', $allowedExtensions)
            ]);
            exit;
        }
        
        //  VALIDAR TAMAÑO (5MB máximo)
        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($archivo['size'] > $maxSize) {
            error_log("ERROR: Archivo muy grande: {$archivo['size']} bytes");
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El archivo es muy grande. Máximo 5MB'
            ]);
            exit;
        }
        
        //  GENERAR NOMBRE SEGURO 
        $nombreArchivo = time() . '_' . uniqid() . '.' . $extension;

        // Para que se guarde en storage
        $directorio = __DIR__ . '/../../storage/uploads/pagos/';
        $destino = $directorio . $nombreArchivo;

        error_log("Directorio destino: $directorio");
        error_log("Archivo destino: $destino");

        // Ruta para guardarlo en la BD (relativa)
        $rutaRelativa = 'uploads/pagos/' . $nombreArchivo;

        //  CREAR DIRECTORIO SI NO EXISTE
        if (!is_dir($directorio)) {
            error_log("Creando directorio: $directorio");
            if (!mkdir($directorio, 0775, true)) {
                error_log("ERROR: No se pudo crear el directorio");
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al crear carpeta de uploads',
                    'debug' => 'No se pudo crear: ' . $directorio
                ]);
                exit;
            }
            error_log("Directorio creado exitosamente");
        }
        
        //  VERIFICAR PERMISOS DE ESCRITURA
        if (!is_writable($directorio)) {
            error_log("ERROR: Directorio sin permisos de escritura: $directorio");
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Carpeta sin permisos de escritura',
                'debug' => 'Ejecuta: sudo chown -R www-data:www-data storage/ && sudo chmod -R 775 storage/',
                'directory' => $directorio,
                'writable' => is_writable($directorio),
                'exists' => is_dir($directorio)
            ]);
            exit;
        }

        //  MOVER ARCHIVO
        if (!move_uploaded_file($archivo['tmp_name'], $destino)) {
            error_log("ERROR: No se pudo mover el archivo");
            error_log("Detalles del error: " . print_r(error_get_last(), true));
            
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al guardar el archivo en el servidor',
                'debug' => [
                    'tmp_name' => $archivo['tmp_name'],
                    'destination' => $destino,
                    'tmp_exists' => file_exists($archivo['tmp_name']),
                    'dir_writable' => is_writable($directorio),
                    'dir_exists' => is_dir($directorio),
                    'last_error' => error_get_last()
                ]
            ]);
            exit;
        }

        error_log("Archivo movido exitosamente a: $destino");
        
        //  VERIFICAR QUE EL ARCHIVO SE GUARDÓ
        if (!file_exists($destino)) {
            error_log("ERROR: El archivo no existe después de move_uploaded_file");
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'El archivo no se guardó correctamente'
            ]);
            exit;
        }

        //  GUARDAR EN BASE DE DATOS
        $pay = new Pay();
        $resultado = $pay->addPay($usuario_id, $rutaRelativa);

        error_log("Resultado addPay BD: " . ($resultado ? 'true' : 'false'));

        if ($resultado) {
            //  ACTUALIZAR ESTADO DEL USUARIO
            $userModel = new \App\models\User();
            $updateResult = $userModel->updateEstado($usuario_id, 'enviado');
            error_log("Resultado updateEstado: " . ($updateResult ? 'true' : 'false'));
            
            $_SESSION['estado'] = 'enviado';

            error_log("=== ÉXITO addPay ===");
            echo json_encode([
                'success' => true,
                'message' => 'Pago enviado exitosamente. Se le notificará si fue aprobado',
                'redirect' => '/pagoEnviado'
            ]);
        } else {
            //  ELIMINAR ARCHIVO SI FALLA LA BD
            if (file_exists($destino)) {
                unlink($destino);
                error_log("Archivo eliminado por error en BD");
            }
            error_log("ERROR: Fallo al guardar en BD");
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al registrar el pago en la base de datos',
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
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de usuario no proporcionado']);
            exit();
        }

        $userModel = new \App\Models\User();
        $resultado = $userModel->updateEstado($id_usuario, 'aceptado');

        if ($resultado) {
            echo json_encode(['success' => true, 'message' => 'Pago aprobado exitosamente']);
        } else {
            http_response_code(500);
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
        $motivo = $_POST['motivo'] ?? 'Sin motivo especificado';

        if (!$id_usuario) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de usuario no proporcionado']);
            exit();
        }

        $userModel = new \App\Models\User();
        // Cambiar a 'pendiente' para que pueda volver a subir el pago
        $resultado = $userModel->updateEstado($id_usuario, 'pendiente');

        if ($resultado) {
          
            error_log("Pago rechazado para usuario $id_usuario. Motivo: $motivo");
            echo json_encode(['success' => true, 'message' => 'Pago rechazado. El usuario podrá volver a intentarlo']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al rechazar el pago']);
        }
        exit();
    }
}