<?php

namespace App\controllers;

use App\models\User;
use App\config\Database;

class UserController
{
    private $userModel;
    private $conn;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->userModel = new User();
        $this->conn = Database::getConnection();
    }

    /**
     * ✅ CORREGIDO: Obtener todos los usuarios con sus datos completos
     */
    public function getAllUsers()
    {
        header('Content-Type: application/json');

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

        try {
            $sql = "SELECT 
                        u.id_usuario,
                        u.nombre_completo,
                        u.cedula,
                        u.email,
                        u.direccion,
                        u.estado,
                        u.fecha_ingreso,
                        u.fecha_nacimiento,
                        u.id_nucleo,
                        u.id_rol,
                        r.nombre_rol,
                        nf.nombre_nucleo,
                        t.telefono,
                        p.id_pago,
                        p.comprobante_archivo,
                        p.fecha_pago,
                        p.estado_validacion as estado_pago,
                        p.monto as monto_pago
                    FROM Usuario u
                    LEFT JOIN Rol r ON u.id_rol = r.id_rol
                    LEFT JOIN Nucleo_Familiar nf ON u.id_nucleo = nf.id_nucleo
                    LEFT JOIN Telefonos t ON u.id_usuario = t.entidad_id 
                        AND t.entidad_tipo = 'usuario'
                    LEFT JOIN pagos p ON u.id_usuario = p.id_usuario 
                        AND p.tipo_pago = 'primer_pago'
                        AND p.id_pago = (
                            SELECT MAX(id_pago) 
                            FROM pagos 
                            WHERE id_usuario = u.id_usuario 
                            AND tipo_pago = 'primer_pago'
                        )
                    ORDER BY 
                        CASE 
                            WHEN u.estado = 'enviado' THEN 1
                            WHEN u.estado = 'pendiente' THEN 2
                            WHEN u.estado = 'aceptado' THEN 3
                            WHEN u.estado = 'rechazado' THEN 4
                        END,
                        u.fecha_ingreso DESC";
            
            $stmt = $this->conn->query($sql);
            $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'users' => $users,
                'count' => count($users)
            ], JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log("Error en getAllUsers: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'message' => 'Error al obtener usuarios: ' . $e->getMessage()
            ]);
        }
        exit();
    }

    /**
     * ✅ CORREGIDO: Obtener perfil del usuario actual
     */
    public function getMyProfile()
    {
        while (ob_get_level()) {
            ob_end_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-cache, must-revalidate');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado'], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            $sql = "SELECT 
                        u.id_usuario,
                        u.nombre_completo,
                        u.cedula,
                        u.email,
                        u.direccion,
                        u.fecha_nacimiento,
                        u.fecha_ingreso,
                        u.estado,
                        u.id_nucleo,
                        u.id_rol,
                        t.telefono,
                        r.nombre_rol,
                        nf.nombre_nucleo
                    FROM Usuario u
                    LEFT JOIN Telefonos t ON u.id_usuario = t.entidad_id 
                        AND t.entidad_tipo = 'usuario'
                    LEFT JOIN Rol r ON u.id_rol = r.id_rol
                    LEFT JOIN Nucleo_Familiar nf ON u.id_nucleo = nf.id_nucleo
                    WHERE u.id_usuario = :user_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':user_id' => $_SESSION['user_id']]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($user) {
                $user['id_usuario'] = (int)$user['id_usuario'];
                $user['id_nucleo'] = $user['id_nucleo'] ? (int)$user['id_nucleo'] : null;
                $user['id_rol'] = $user['id_rol'] ? (int)$user['id_rol'] : null;
                
                echo json_encode([
                    'success' => true,
                    'user' => $user
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], JSON_UNESCAPED_UNICODE);
            }
        } catch (\Exception $e) {
            error_log("Error en getMyProfile: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al obtener perfil',
                'debug' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
        
        exit();
    }

    /**
 * ✅ NUEVO: Obtener detalles de pago de un usuario
 */
public function getPaymentDetails()
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

    $userId = $_GET['id_usuario'] ?? null;

    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
        exit();
    }

    try {
        // Obtener info del usuario
        $sqlUser = "SELECT 
                        id_usuario,
                        nombre_completo,
                        cedula,
                        email,
                        estado
                    FROM Usuario 
                    WHERE id_usuario = :user_id";
        
        $stmtUser = $this->conn->prepare($sqlUser);
        $stmtUser->execute([':user_id' => $userId]);
        $usuario = $stmtUser->fetch(\PDO::FETCH_ASSOC);

        if (!$usuario) {
            echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
            exit();
        }

        // Obtener info del pago (primer pago)
        $sqlPago = "SELECT 
                        id_pago,
                        comprobante_archivo,
                        monto,
                        fecha_pago,
                        estado_validacion,
                        observaciones,
                        tipo_pago
                    FROM pagos
                    WHERE id_usuario = :user_id 
                    AND tipo_pago = 'primer_pago'
                    ORDER BY fecha_pago DESC
                    LIMIT 1";
        
        $stmtPago = $this->conn->prepare($sqlPago);
        $stmtPago->execute([':user_id' => $userId]);
        $pago = $stmtPago->fetch(\PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'usuario' => $usuario,
            'pago' => $pago ?: null
        ], JSON_UNESCAPED_UNICODE);

    } catch (\Exception $e) {
        error_log("Error en getPaymentDetails: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al obtener detalles']);
    }
    exit();
}

    /**
     * ✅ CORREGIDO: Actualizar perfil del usuario
     */
    public function updateProfile()
    {
        header('Content-Type: application/json');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        try {
            $userId = $_SESSION['user_id'];
            $nombreCompleto = $_POST['nombre_completo'] ?? '';
            $email = $_POST['email'] ?? '';
            $direccion = $_POST['direccion'] ?? '';
            $fechaNacimiento = $_POST['fecha_nacimiento'] ?? null;
            $telefono = $_POST['telefono'] ?? '';
            
            $passwordActual = $_POST['password_actual'] ?? '';
            $passwordNueva = $_POST['password_nueva'] ?? '';

            if (empty($nombreCompleto) || empty($email)) {
                echo json_encode(['success' => false, 'message' => 'Nombre y email son obligatorios']);
                exit();
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success' => false, 'message' => 'Email inválido']);
                exit();
            }

            // Verificar si el email ya existe en otro usuario
            $sqlCheck = "SELECT id_usuario FROM Usuario WHERE email = :email AND id_usuario != :user_id";
            $stmtCheck = $this->conn->prepare($sqlCheck);
            $stmtCheck->execute([':email' => $email, ':user_id' => $userId]);
            
            if ($stmtCheck->fetch()) {
                echo json_encode(['success' => false, 'message' => 'El email ya está registrado por otro usuario']);
                exit();
            }

            // Verificar contraseña actual si se quiere cambiar
            $cambiarPassword = false;
            if (!empty($passwordActual) && !empty($passwordNueva)) {
                $sqlPass = "SELECT contrasena FROM Usuario WHERE id_usuario = :user_id";
                $stmtPass = $this->conn->prepare($sqlPass);
                $stmtPass->execute([':user_id' => $userId]);
                $userData = $stmtPass->fetch(\PDO::FETCH_ASSOC);
                
                if (!password_verify($passwordActual, $userData['contrasena'])) {
                    echo json_encode(['success' => false, 'message' => 'La contraseña actual es incorrecta']);
                    exit();
                }
                
                if (strlen($passwordNueva) < 6) {
                    echo json_encode(['success' => false, 'message' => 'La nueva contraseña debe tener al menos 6 caracteres']);
                    exit();
                }
                
                $cambiarPassword = true;
            }

            // Iniciar transacción
            $this->conn->beginTransaction();

            // Actualizar datos del usuario
            $updateFields = [
                'nombre_completo = :nombre',
                'email = :email',
                'direccion = :direccion'
            ];
            $params = [
                ':nombre' => $nombreCompleto,
                ':email' => $email,
                ':direccion' => $direccion,
                ':user_id' => $userId
            ];
            
            if (!empty($fechaNacimiento)) {
                $updateFields[] = 'fecha_nacimiento = :fecha_nac';
                $params[':fecha_nac'] = $fechaNacimiento;
            }

            if ($cambiarPassword) {
                $updateFields[] = 'contrasena = :password';
                $params[':password'] = password_hash($passwordNueva, PASSWORD_BCRYPT);
            }

            $sql = "UPDATE Usuario SET " . implode(', ', $updateFields) . " WHERE id_usuario = :user_id";
            $stmt = $this->conn->prepare($sql);
            $resultado = $stmt->execute($params);

            if (!$resultado) {
                $this->conn->rollBack();
                echo json_encode(['success' => false, 'message' => 'Error al actualizar perfil']);
                exit();
            }

            // Actualizar teléfono
            if (!empty($telefono)) {
                $sqlTelCheck = "SELECT COUNT(*) as count FROM Telefonos 
                                WHERE entidad_tipo = 'usuario' AND entidad_id = :user_id";
                $stmtTelCheck = $this->conn->prepare($sqlTelCheck);
                $stmtTelCheck->execute([':user_id' => $userId]);
                $telExists = $stmtTelCheck->fetch(\PDO::FETCH_ASSOC);
                
                if ($telExists['count'] > 0) {
                    $sqlTel = "UPDATE Telefonos SET telefono = :telefono 
                               WHERE entidad_tipo = 'usuario' AND entidad_id = :user_id";
                } else {
                    $sqlTel = "INSERT INTO Telefonos (entidad_tipo, entidad_id, telefono, tipo) 
                               VALUES ('usuario', :user_id, :telefono, 'movil')";
                }
                
                $stmtTel = $this->conn->prepare($sqlTel);
                $stmtTel->execute([':telefono' => $telefono, ':user_id' => $userId]);
            }

            $this->conn->commit();

            // Actualizar sesión
            $_SESSION['nombre_completo'] = $nombreCompleto;
            $_SESSION['email'] = $email;

            echo json_encode([
                'success' => true,
                'message' => 'Perfil actualizado correctamente',
                'reload' => $cambiarPassword
            ]);

        } catch (\Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            error_log("Error en updateProfile: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al actualizar perfil: ' . $e->getMessage()]);
        }
        exit();
    }

    /**
     * ✅ CORREGIDO: Obtener usuario por ID
     */
    public function getUserById()
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

        $userId = $_GET['id_usuario'] ?? $_GET['user_id'] ?? null;

        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
            exit();
        }

        try {
            $sql = "SELECT 
                        u.id_usuario,
                        u.nombre_completo,
                        u.cedula,
                        u.email,
                        u.direccion,
                        u.estado,
                        u.fecha_ingreso,
                        u.fecha_nacimiento,
                        u.id_nucleo,
                        u.id_rol,
                        r.nombre_rol,
                        nf.nombre_nucleo,
                        t.telefono
                    FROM Usuario u
                    LEFT JOIN Rol r ON u.id_rol = r.id_rol
                    LEFT JOIN Nucleo_Familiar nf ON u.id_nucleo = nf.id_nucleo
                    LEFT JOIN Telefonos t ON u.id_usuario = t.entidad_id 
                        AND t.entidad_tipo = 'usuario'
                    WHERE u.id_usuario = :user_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':user_id' => $userId]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($user) {
                echo json_encode([
                    'success' => true,
                    'user' => $user
                ], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
            }
        } catch (\Exception $e) {
            error_log("Error en getUserById: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al obtener usuario']);
        }
        exit();
    }

    /**
     * ✅✅ FIXED: Aprobar o rechazar usuario + validar primer pago
     */
    public function aprobarRechazar()
    {
        while (ob_get_level()) {
            ob_end_clean();
        }
        
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-cache, must-revalidate');

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'No autenticado'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Solo administradores pueden aprobar/rechazar usuarios'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Método no permitido'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // Soportar FormData y JSON
        $data = $_POST;
        if (empty($data)) {
            $jsonData = file_get_contents('php://input');
            if ($jsonData) {
                $data = json_decode($jsonData, true) ?? [];
            }
        }

        $idUsuario = $data['id_usuario'] ?? null;
        $accion = $data['accion'] ?? null;
        $motivo = $data['motivo'] ?? null;

        if (!$idUsuario || !$accion) {
            error_log("⚠️ Parámetros incompletos: " . print_r($data, true));
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Parámetros incompletos',
                'debug' => [
                    'id_usuario' => $idUsuario,
                    'accion' => $accion
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (!in_array($accion, ['aprobar', 'rechazar'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Acción inválida'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        try {
            // Verificar usuario
            $sqlCheck = "SELECT u.id_usuario, u.nombre_completo, u.email, u.estado,
                         p.id_pago, p.comprobante_archivo, p.monto, p.estado_validacion
                         FROM Usuario u
                         LEFT JOIN pagos p ON u.id_usuario = p.id_usuario 
                            AND p.tipo_pago = 'primer_pago'
                            AND p.id_pago = (
                                SELECT MAX(id_pago) FROM pagos 
                                WHERE id_usuario = u.id_usuario 
                                AND tipo_pago = 'primer_pago'
                            )
                         WHERE u.id_usuario = :id_usuario";
            
            $stmtCheck = $this->conn->prepare($sqlCheck);
            $stmtCheck->execute([':id_usuario' => $idUsuario]);
            $usuario = $stmtCheck->fetch(\PDO::FETCH_ASSOC);

            if (!$usuario) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }

            if (!in_array($usuario['estado'], ['pendiente', 'enviado'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'El usuario no está en estado pendiente (Estado actual: ' . $usuario['estado'] . ')'
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }

            // Validar que tenga pago si se va a aprobar
            if ($accion === 'aprobar' && !$usuario['id_pago']) {
                echo json_encode([
                    'success' => false,
                    'message' => 'No se puede aprobar: el usuario no ha enviado el comprobante de pago'
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }

            // Iniciar transacción
            $this->conn->beginTransaction();

            if ($accion === 'aprobar') {
                // ✅ APROBAR USUARIO
                
                // 1. Actualizar estado del usuario
                $sqlUpdate = "UPDATE Usuario 
                              SET estado = 'aceptado',
                                  fecha_ingreso = CURRENT_TIMESTAMP
                              WHERE id_usuario = :id_usuario";
                
                $stmtUpdate = $this->conn->prepare($sqlUpdate);
                $resultado = $stmtUpdate->execute([':id_usuario' => $idUsuario]);

                if (!$resultado) {
                    $this->conn->rollBack();
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error al actualizar estado del usuario'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }

                // 2. Aprobar el pago (si existe)
                if ($usuario['id_pago']) {
                    $sqlPago = "UPDATE pagos 
                                SET estado_validacion = 'aprobado',
                                    fecha_validacion = CURRENT_TIMESTAMP
                                WHERE id_pago = :id_pago";
                    
                    $stmtPago = $this->conn->prepare($sqlPago);
                    $stmtPago->execute([':id_pago' => $usuario['id_pago']]);
                }

                // 3. Notificar al usuario
                $sqlNotif = "INSERT INTO notificaciones (titulo, mensaje, tipo)
                             VALUES (:titulo, :mensaje, 'exito')";
                
                $stmtNotif = $this->conn->prepare($sqlNotif);
                $stmtNotif->execute([
                    ':titulo' => '🎉 ¡Bienvenido a la cooperativa!',
                    ':mensaje' => 'Tu registro ha sido aprobado exitosamente. Ya puedes acceder a todas las funcionalidades del sistema. Tu primer pago ha sido validado correctamente.'
                ]);
                
                $idNotificacion = $this->conn->lastInsertId();
                
                // Asignar notificación al usuario
                $sqlAsignar = "INSERT INTO usuario_notificaciones (id_usuario, id_notificacion)
                               VALUES (:id_usuario, :id_notificacion)";
                
                $stmtAsignar = $this->conn->prepare($sqlAsignar);
                $stmtAsignar->execute([
                    ':id_usuario' => $idUsuario,
                    ':id_notificacion' => $idNotificacion
                ]);

                $this->conn->commit();

                error_log("✅ Usuario {$usuario['nombre_completo']} (ID: {$idUsuario}) aprobado correctamente");

                echo json_encode([
                    'success' => true,
                    'message' => "Usuario {$usuario['nombre_completo']} aprobado correctamente",
                    'usuario' => [
                        'id' => $idUsuario,
                        'nombre' => $usuario['nombre_completo'],
                        'nuevo_estado' => 'aceptado'
                    ]
                ], JSON_UNESCAPED_UNICODE);

            } else {
                // ❌ RECHAZAR USUARIO
                
                // 1. Actualizar estado del usuario
                $sqlUpdate = "UPDATE Usuario 
                              SET estado = 'rechazado'
                              WHERE id_usuario = :id_usuario";
                
                $stmtUpdate = $this->conn->prepare($sqlUpdate);
                $resultado = $stmtUpdate->execute([':id_usuario' => $idUsuario]);

                if (!$resultado) {
                    $this->conn->rollBack();
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error al actualizar estado del usuario'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }

                // 2. Rechazar el pago (si existe)
                if ($usuario['id_pago']) {
                    $sqlPago = "UPDATE pagos 
                                SET estado_validacion = 'rechazado',
                                    fecha_validacion = CURRENT_TIMESTAMP,
                                    observaciones = :observaciones
                                WHERE id_pago = :id_pago";
                    
                    $stmtPago = $this->conn->prepare($sqlPago);
                    $stmtPago->execute([
                        ':id_pago' => $usuario['id_pago'],
                        ':observaciones' => $motivo ?? 'Pago rechazado por el administrador'
                    ]);
                }

                // 3. Notificar al usuario
                $mensajeRechazo = "Lamentablemente tu solicitud de registro ha sido rechazada.";
                if ($motivo) {
                    $mensajeRechazo .= "\n\n📝 Motivo: " . htmlspecialchars($motivo);
                }
                $mensajeRechazo .= "\n\n💬 Puedes contactar con la administración para más información o realizar un nuevo registro.";

                $sqlNotif = "INSERT INTO notificaciones (titulo, mensaje, tipo)
                             VALUES (:titulo, :mensaje, 'importante')";
                
                $stmtNotif = $this->conn->prepare($sqlNotif);
                $stmtNotif->execute([
                    ':titulo' => '❌ Solicitud de registro rechazada',
                    ':mensaje' => $mensajeRechazo
                ]);
                
                $idNotificacion = $this->conn->lastInsertId();
                
                // Asignar notificación al usuario
                $sqlAsignar = "INSERT INTO usuario_notificaciones (id_usuario, id_notificacion)
                               VALUES (:id_usuario, :id_notificacion)";
                
                $stmtAsignar = $this->conn->prepare($sqlAsignar);
                $stmtAsignar->execute([
                    ':id_usuario' => $idUsuario,
                    ':id_notificacion' => $idNotificacion
                ]);

                $this->conn->commit();

                error_log("❌ Usuario {$usuario['nombre_completo']} (ID: {$idUsuario}) rechazado");

                echo json_encode([
                    'success' => true,
                    'message' => "Usuario {$usuario['nombre_completo']} rechazado",
                    'usuario' => [
                        'id' => $idUsuario,
                        'nombre' => $usuario['nombre_completo'],
                        'nuevo_estado' => 'rechazado'
                    ]
                ], JSON_UNESCAPED_UNICODE);
            }

        } catch (\PDOException $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            
            error_log("❌ Error PDO en aprobarRechazar: " . $e->getMessage());
            error_log("❌ Stack trace: " . $e->getTraceAsString());
            
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error de base de datos',
                'error' => $e->getMessage(),
                'file' => basename($e->getFile()),
                'line' => $e->getLine()
            ], JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            
            error_log("❌ Error general en aprobarRechazar: " . $e->getMessage());
            
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error inesperado',
                'error' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
        
        exit();
    }
}