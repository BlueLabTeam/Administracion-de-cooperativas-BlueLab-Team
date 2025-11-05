<?php

namespace App\controllers;

use App\models\Vivienda;
use App\models\User;
use App\models\Nucleo;
use App\config\Database;
use PDO;

class ViviendaController
{
    private $viviendaModel;
    private $conn;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->viviendaModel = new Vivienda();
        $this->conn = Database::getConnection();
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
            
            error_log("Viviendas obtenidas: " . count($viviendas));
            
            echo json_encode([
                'success' => true,
                'viviendas' => $viviendas,
                'count' => count($viviendas)
            ]);
        } catch (\Exception $e) {
            error_log("Error en ViviendaController::getAll: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'message' => 'Error al obtener viviendas',
                'error' => $e->getMessage()
            ]);
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

/**
 * 
 * FIX: Maneja correctamente NULL para id_usuario o id_nucleo
 */
  public function asignar()
{
    // Limpiar output buffer
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    header('Content-Type: application/json; charset=utf-8');

    if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'No autorizado']);
        exit();
    }

    try {
        // Obtener datos
        $idVivienda = $_POST['vivienda_id'] ?? null;
        $idUsuario = !empty($_POST['usuario_id']) ? intval($_POST['usuario_id']) : null;
        $idNucleo = !empty($_POST['nucleo_id']) ? intval($_POST['nucleo_id']) : null;
        $observaciones = $_POST['observaciones'] ?? '';

        error_log("🏠 [ASIGNAR] Vivienda: $idVivienda | Usuario: " . var_export($idUsuario, true) . " | Núcleo: " . var_export($idNucleo, true));

        // Validar
        if (!$idVivienda) {
            echo json_encode(['success' => false, 'message' => 'ID de vivienda requerido']);
            exit();
        }

        if (!$idUsuario && !$idNucleo) {
            echo json_encode(['success' => false, 'message' => 'Debe especificar usuario O núcleo']);
            exit();
        }

        if ($idUsuario && $idNucleo) {
            echo json_encode(['success' => false, 'message' => 'No puede asignar a ambos']);
            exit();
        }

        $this->conn->beginTransaction();

        // Verificar vivienda
        $stmtVivienda = $this->conn->prepare("
            SELECT v.*, tv.nombre as tipo_vivienda, tv.habitaciones, cc.monto_mensual
            FROM Viviendas v
            INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
            LEFT JOIN Config_Cuotas cc ON cc.id_tipo = v.id_tipo AND cc.activo = 1
            WHERE v.id_vivienda = ?
        ");
        $stmtVivienda->execute([$idVivienda]);
        $vivienda = $stmtVivienda->fetch(PDO::FETCH_ASSOC);

        if (!$vivienda) {
            $this->conn->rollBack();
            echo json_encode(['success' => false, 'message' => 'Vivienda no encontrada']);
            exit();
        }

        error_log(" [ASIGNAR] Vivienda: {$vivienda['numero_vivienda']} | Tipo: {$vivienda['tipo_vivienda']} | Monto: \${$vivienda['monto_mensual']}");

        // Verificar si está asignada
        $stmtCheck = $this->conn->prepare("
            SELECT COUNT(*) FROM Asignacion_Vivienda 
            WHERE id_vivienda = ? AND activa = 1
        ");
        $stmtCheck->execute([$idVivienda]);
        
        if ($stmtCheck->fetchColumn() > 0) {
            $this->conn->rollBack();
            echo json_encode(['success' => false, 'message' => 'Vivienda ya asignada']);
            exit();
        }

        // 🔧 SOLUCIÓN: SQL condicional según el tipo de asignación
        if ($idUsuario) {
            //  Asignar a USUARIO - Solo insertar columnas necesarias
            error_log("👤 [ASIGNAR] Insertando asignación a USUARIO $idUsuario");
            
            $sql = "INSERT INTO Asignacion_Vivienda 
                    (id_vivienda, id_usuario, activa, observaciones, fecha_asignacion)
                    VALUES (?, ?, 1, ?, NOW())";
            
            $stmtAsignar = $this->conn->prepare($sql);
            $stmtAsignar->execute([$idVivienda, $idUsuario, $observaciones]);
            
        } else {
            //  Asignar a NÚCLEO - Solo insertar columnas necesarias
            error_log("👨‍👩‍👧‍👦 [ASIGNAR] Insertando asignación a NÚCLEO $idNucleo");
            
            $sql = "INSERT INTO Asignacion_Vivienda 
                    (id_vivienda, id_nucleo, activa, observaciones, fecha_asignacion)
                    VALUES (?, ?, 1, ?, NOW())";
            
            $stmtAsignar = $this->conn->prepare($sql);
            $stmtAsignar->execute([$idVivienda, $idNucleo, $observaciones]);
        }

        $idAsignacion = $this->conn->lastInsertId();
        error_log(" [ASIGNAR] INSERT exitoso! ID asignación: $idAsignacion");

        // Actualizar estado vivienda
        $stmtUpdate = $this->conn->prepare("UPDATE Viviendas SET estado = 'ocupada' WHERE id_vivienda = ?");
        $stmtUpdate->execute([$idVivienda]);

        $cuotasActualizadas = 0;

        // 👤 ACTUALIZAR CUOTAS DEL USUARIO
        if ($idUsuario) {
            error_log("📊 [ASIGNAR] Actualizando cuotas para usuario $idUsuario");
            
            $stmtUpdateCuotas = $this->conn->prepare("
                UPDATE Cuotas_Mensuales cm
                SET 
                    cm.id_vivienda = ?,
                    cm.monto = ?,
                    cm.pendiente_asignacion = 0,
                    cm.observaciones = CONCAT(
                        COALESCE(cm.observaciones, ''),
                        IF(cm.observaciones IS NOT NULL AND cm.observaciones != '', '\n', ''),
                        ' Vivienda ', ?, ' asignada el ', NOW()
                    )
                WHERE cm.id_usuario = ?
                AND cm.pendiente_asignacion = 1
                AND (
                    (cm.anio = YEAR(CURDATE()) AND cm.mes >= MONTH(CURDATE())) OR
                    cm.anio > YEAR(CURDATE())
                )
            ");

            $stmtUpdateCuotas->execute([
                $idVivienda,
                $vivienda['monto_mensual'] ?? 0,
                $vivienda['numero_vivienda'],
                $idUsuario
            ]);

            $cuotasActualizadas = $stmtUpdateCuotas->rowCount();
            error_log("📊 [ASIGNAR] Cuotas actualizadas: $cuotasActualizadas");

            // Notificar
            if ($cuotasActualizadas > 0) {
                $stmtNotif = $this->conn->prepare("
                    INSERT INTO notificaciones (titulo, mensaje, tipo)
                    VALUES ('🏠 Vivienda Asignada', ?, 'exito')
                ");
                
                $mensaje = sprintf(
                    'Se te ha asignado la vivienda %s (%s). %d cuota(s) actualizada(s) con $%s.',
                    $vivienda['numero_vivienda'],
                    $vivienda['tipo_vivienda'],
                    $cuotasActualizadas,
                    number_format($vivienda['monto_mensual'] ?? 0, 2)
                );
                
                $stmtNotif->execute([$mensaje]);
                $idNotificacion = $this->conn->lastInsertId();

                $stmtUserNotif = $this->conn->prepare("
                    INSERT INTO usuario_notificaciones (id_usuario, id_notificacion)
                    VALUES (?, ?)
                ");
                $stmtUserNotif->execute([$idUsuario, $idNotificacion]);
            }
        }

        // 👨‍👩‍👧‍👦 ACTUALIZAR CUOTAS DEL NÚCLEO
        if ($idNucleo) {
            error_log("👨‍👩‍👧‍👦 [ASIGNAR] Obteniendo miembros del núcleo $idNucleo");
            
            $stmtMiembros = $this->conn->prepare("
                SELECT id_usuario, nombre_completo 
                FROM Usuario 
                WHERE id_nucleo = ?
            ");
            $stmtMiembros->execute([$idNucleo]);
            $miembros = $stmtMiembros->fetchAll(PDO::FETCH_ASSOC);

            error_log("👨‍👩‍👧‍👦 [ASIGNAR] Miembros encontrados: " . count($miembros));

            foreach ($miembros as $miembro) {
                error_log("   → Procesando: {$miembro['nombre_completo']} (ID: {$miembro['id_usuario']})");
                
                $stmtUpdateCuotas = $this->conn->prepare("
                    UPDATE Cuotas_Mensuales cm
                    SET 
                        cm.id_vivienda = ?,
                        cm.monto = ?,
                        cm.pendiente_asignacion = 0,
                        cm.observaciones = CONCAT(
                            COALESCE(cm.observaciones, ''),
                            IF(cm.observaciones IS NOT NULL AND cm.observaciones != '', '\n', ''),
                            ' Vivienda asignada a núcleo el ', NOW()
                        )
                    WHERE cm.id_usuario = ?
                    AND cm.pendiente_asignacion = 1
                    AND (
                        (cm.anio = YEAR(CURDATE()) AND cm.mes >= MONTH(CURDATE())) OR
                        cm.anio > YEAR(CURDATE())
                    )
                ");

                $stmtUpdateCuotas->execute([
                    $idVivienda,
                    $vivienda['monto_mensual'] ?? 0,
                    $miembro['id_usuario']
                ]);

                $cuotasMiembro = $stmtUpdateCuotas->rowCount();
                $cuotasActualizadas += $cuotasMiembro;

                error_log("   → Cuotas actualizadas: $cuotasMiembro");

                // Notificar a cada miembro
                if ($cuotasMiembro > 0) {
                    $stmtNotif = $this->conn->prepare("
                        INSERT INTO notificaciones (titulo, mensaje, tipo)
                        VALUES ('🏠 Vivienda Asignada a tu Núcleo', ?, 'exito')
                    ");
                    
                    $mensaje = sprintf(
                        'Se asignó la vivienda %s a tu núcleo. %d cuota(s) actualizada(s) con $%s.',
                        $vivienda['numero_vivienda'],
                        $cuotasMiembro,
                        number_format($vivienda['monto_mensual'] ?? 0, 2)
                    );
                    
                    $stmtNotif->execute([$mensaje]);
                    $idNotificacion = $this->conn->lastInsertId();

                    $stmtUserNotif = $this->conn->prepare("
                        INSERT INTO usuario_notificaciones (id_usuario, id_notificacion)
                        VALUES (?, ?)
                    ");
                    $stmtUserNotif->execute([$miembro['id_usuario'], $idNotificacion]);
                }
            }
        }

        $this->conn->commit();
        error_log(" [ASIGNAR] COMPLETADO - Cuotas actualizadas: $cuotasActualizadas");

        echo json_encode([
            'success' => true,
            'message' => 'Vivienda asignada correctamente' . 
                        ($cuotasActualizadas > 0 
                            ? " y {$cuotasActualizadas} cuota(s) actualizada(s)" 
                            : ''),
            'cuotas_actualizadas' => $cuotasActualizadas,
            'id_asignacion' => $idAsignacion
        ], JSON_UNESCAPED_UNICODE);

    } catch (\PDOException $e) {
        if (isset($this->conn) && $this->conn->inTransaction()) {
            $this->conn->rollBack();
        }
        
        error_log(" [ASIGNAR] ERROR PDO: " . $e->getMessage());
        error_log("   Código: " . $e->getCode());
        error_log("   Stack: " . $e->getTraceAsString());
        
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error al asignar vivienda: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (\Exception $e) {
        if (isset($this->conn) && $this->conn->inTransaction()) {
            $this->conn->rollBack();
        }
        
        error_log(" [ASIGNAR] ERROR: " . $e->getMessage());
        
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error inesperado: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
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


