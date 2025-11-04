<?php

namespace App\models;

use App\config\Database;
use PDO;

class Task
{
    private $conn;

   public function __construct()
{
    $this->conn = Database::getConnection();
}
    // Crear nueva tarea
      public function create($titulo, $descripcion, $fechaInicio, $fechaFin, $prioridad, $tipoAsignacion, $idCreador)
    {
        try {
            $query = "INSERT INTO Tareas (titulo, descripcion, fecha_inicio, fecha_fin, prioridad, tipo_asignacion, id_creador) 
                      VALUES (:titulo, :descripcion, :fecha_inicio, :fecha_fin, :prioridad, :tipo_asignacion, :id_creador)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':titulo', $titulo);
            $stmt->bindParam(':descripcion', $descripcion);
            $stmt->bindParam(':fecha_inicio', $fechaInicio);
            $stmt->bindParam(':fecha_fin', $fechaFin);
            $stmt->bindParam(':prioridad', $prioridad);
            $stmt->bindParam(':tipo_asignacion', $tipoAsignacion);
            $stmt->bindParam(':id_creador', $idCreador);
            
            $stmt->execute();
            return $this->conn->lastInsertId();
        } catch (\PDOException $e) {
            error_log("Error al crear tarea: " . $e->getMessage());
            throw $e;
        }
    }

    // Asignar tarea a usuarios
    public function assignToUsers($tareaId, $usuarios)
    {
        try {
            $query = "INSERT INTO Tarea_Usuario (id_tarea, id_usuario) VALUES (:id_tarea, :id_usuario)";
            $stmt = $this->conn->prepare($query);
            
            foreach ($usuarios as $userId) {
                $stmt->bindParam(':id_tarea', $tareaId);
                $stmt->bindParam(':id_usuario', $userId);
                $stmt->execute();
            }
            
            return true;
        } catch (\PDOException $e) {
            error_log("Error al asignar tarea a usuarios: " . $e->getMessage());
            throw $e;
        }
    }

    // Asignar tarea a núcleos familiares
    public function assignToNucleos($tareaId, $nucleos)
    {
        try {
            $query = "INSERT INTO Tarea_Nucleo (id_tarea, id_nucleo) VALUES (:id_tarea, :id_nucleo)";
            $stmt = $this->conn->prepare($query);
            
            foreach ($nucleos as $nucleoId) {
                $stmt->bindParam(':id_tarea', $tareaId);
                $stmt->bindParam(':id_nucleo', $nucleoId);
                $stmt->execute();
            }
            
            return true;
        } catch (\PDOException $e) {
            error_log("Error al asignar tarea a núcleos: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener tareas asignadas a un usuario
    public function getUserTasks($userId, $incluirFinalizadas = false)
    {
        try {
            $estadoCondition = $incluirFinalizadas ? "" : "AND tu.estado_usuario != 'completada'";
            
            $query = "SELECT 
                        t.id_tarea,
                        t.titulo,
                        t.descripcion,
                        t.fecha_inicio,
                        t.fecha_fin,
                        t.prioridad,
                        t.estado as estado_general,
                        tu.id_asignacion,
                        tu.progreso,
                        tu.estado_usuario,
                        tu.fecha_asignacion,
                        tu.fecha_completada,
                        u.nombre_completo as creador
                      FROM Tarea_Usuario tu
                      INNER JOIN Tareas t ON tu.id_tarea = t.id_tarea
                      INNER JOIN Usuario u ON t.id_creador = u.id_usuario
                      WHERE tu.id_usuario = :user_id
                      $estadoCondition
                      ORDER BY t.fecha_fin ASC, t.prioridad DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $userId);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log("Error al obtener tareas del usuario: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener tareas del núcleo familiar del usuario
    public function getNucleoTasks($userId, $incluirFinalizadas = false)
    {
        try {
            $estadoCondition = $incluirFinalizadas ? "" : "AND tn.estado_nucleo != 'completada'";
            
            $query = "SELECT 
                        t.id_tarea,
                        t.titulo,
                        t.descripcion,
                        t.fecha_inicio,
                        t.fecha_fin,
                        t.prioridad,
                        t.estado as estado_general,
                        tn.id_asignacion,
                        tn.progreso,
                        tn.estado_nucleo as estado_usuario,
                        tn.fecha_asignacion,
                        tn.fecha_completada,
                        u.nombre_completo as creador,
                        nf.nombre_nucleo
                      FROM Usuario usr
                      INNER JOIN Nucleo_Familiar nf ON usr.id_nucleo = nf.id_nucleo
                      INNER JOIN Tarea_Nucleo tn ON nf.id_nucleo = tn.id_nucleo
                      INNER JOIN Tareas t ON tn.id_tarea = t.id_tarea
                      INNER JOIN Usuario u ON t.id_creador = u.id_usuario
                      WHERE usr.id_usuario = :user_id
                      $estadoCondition
                      ORDER BY t.fecha_fin ASC, t.prioridad DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $userId);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log("Error al obtener tareas del núcleo: " . $e->getMessage());
            return [];
        }
    }


    // Actualizar progreso de tarea
    public function updateProgress($asignacionId, $tipoAsignacion, $progreso, $estado = null)
    {
        try {
            $tabla = ($tipoAsignacion === 'usuario') ? 'Tarea_Usuario' : 'Tarea_Nucleo';
            $campoEstado = ($tipoAsignacion === 'usuario') ? 'estado_usuario' : 'estado_nucleo';
            
            // Primero, obtener el id_tarea de esta asignación
            $queryGetTarea = "SELECT id_tarea FROM $tabla WHERE id_asignacion = :id_asignacion";
            $stmtGetTarea = $this->conn->prepare($queryGetTarea);
            $stmtGetTarea->bindParam(':id_asignacion', $asignacionId, \PDO::PARAM_INT);
            $stmtGetTarea->execute();
            $tareaRow = $stmtGetTarea->fetch(PDO::FETCH_ASSOC);
            
            if (!$tareaRow) {
                throw new \Exception("Asignación no encontrada");
            }
            
            $tareaId = $tareaRow['id_tarea'];
            
            // Actualizar el progreso de la asignación
            if ($estado) {
                $query = "UPDATE $tabla 
                          SET progreso = :progreso, 
                              $campoEstado = :estado,
                              fecha_completada = CASE WHEN :estado_check = 'completada' THEN NOW() ELSE fecha_completada END
                          WHERE id_asignacion = :id_asignacion";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':progreso', $progreso, \PDO::PARAM_INT);
                $stmt->bindParam(':estado', $estado, \PDO::PARAM_STR);
                $stmt->bindParam(':estado_check', $estado, \PDO::PARAM_STR);
                $stmt->bindParam(':id_asignacion', $asignacionId, \PDO::PARAM_INT);
            } else {
                $query = "UPDATE $tabla SET progreso = :progreso WHERE id_asignacion = :id_asignacion";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':progreso', $progreso, \PDO::PARAM_INT);
                $stmt->bindParam(':id_asignacion', $asignacionId, \PDO::PARAM_INT);
            }
            
            $result = $stmt->execute();
            
            // ✅ NUEVA LÓGICA: Verificar si todos completaron la tarea
            if ($result) {
                $this->checkAndUpdateTaskCompletion($tareaId);
            }
            
            return $result;
        } catch (\PDOException $e) {
            error_log("Error al actualizar progreso: " . $e->getMessage());
            throw $e;
        }
    }

     private function checkAndUpdateTaskCompletion($tareaId)
    {
        try {
            // Obtener el tipo de asignación de la tarea
            $queryTipo = "SELECT tipo_asignacion FROM Tareas WHERE id_tarea = :tarea_id";
            $stmtTipo = $this->conn->prepare($queryTipo);
            $stmtTipo->bindParam(':tarea_id', $tareaId, \PDO::PARAM_INT);
            $stmtTipo->execute();
            $tareaInfo = $stmtTipo->fetch(PDO::FETCH_ASSOC);
            
            if (!$tareaInfo) {
                return;
            }
            
            $tipoAsignacion = $tareaInfo['tipo_asignacion'];
            
            if ($tipoAsignacion === 'usuario') {
                // Verificar si todos los usuarios completaron
                $queryCheck = "SELECT 
                                COUNT(*) as total,
                                SUM(CASE WHEN estado_usuario = 'completada' THEN 1 ELSE 0 END) as completadas
                               FROM Tarea_Usuario 
                               WHERE id_tarea = :tarea_id";
            } else {
                // Verificar si todos los núcleos completaron
                $queryCheck = "SELECT 
                                COUNT(*) as total,
                                SUM(CASE WHEN estado_nucleo = 'completada' THEN 1 ELSE 0 END) as completadas
                               FROM Tarea_Nucleo 
                               WHERE id_tarea = :tarea_id";
            }
            
            $stmtCheck = $this->conn->prepare($queryCheck);
            $stmtCheck->bindParam(':tarea_id', $tareaId, \PDO::PARAM_INT);
            $stmtCheck->execute();
            $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);
            
            // Si todos completaron, actualizar el estado general de la tarea
            if ($result['total'] > 0 && $result['total'] == $result['completadas']) {
                $queryUpdate = "UPDATE Tareas 
                                SET estado = 'completada' 
                                WHERE id_tarea = :tarea_id";
                $stmtUpdate = $this->conn->prepare($queryUpdate);
                $stmtUpdate->bindParam(':tarea_id', $tareaId, \PDO::PARAM_INT);
                $stmtUpdate->execute();
                
                error_log("✅ Tarea $tareaId marcada como completada (todos los asignados terminaron)");
            }
            
        } catch (\PDOException $e) {
            error_log("Error al verificar completado de tarea: " . $e->getMessage());
            // No lanzamos excepción para no interrumpir el flujo principal
        }
    }


     public function getTaskProgress($tareaId)
    {
        try {
            // Obtener tipo de asignación
            $queryTipo = "SELECT tipo_asignacion FROM Tareas WHERE id_tarea = :tarea_id";
            $stmtTipo = $this->conn->prepare($queryTipo);
            $stmtTipo->bindParam(':tarea_id', $tareaId);
            $stmtTipo->execute();
            $tareaInfo = $stmtTipo->fetch(PDO::FETCH_ASSOC);
            
            if (!$tareaInfo) {
                return null;
            }
            
            if ($tareaInfo['tipo_asignacion'] === 'usuario') {
                $query = "SELECT 
                            COUNT(*) as total_asignados,
                            AVG(progreso) as progreso_promedio,
                            SUM(CASE WHEN estado_usuario = 'completada' THEN 1 ELSE 0 END) as completadas
                          FROM Tarea_Usuario 
                          WHERE id_tarea = :tarea_id";
            } else {
                $query = "SELECT 
                            COUNT(*) as total_asignados,
                            AVG(progreso) as progreso_promedio,
                            SUM(CASE WHEN estado_nucleo = 'completada' THEN 1 ELSE 0 END) as completadas
                          FROM Tarea_Nucleo 
                          WHERE id_tarea = :tarea_id";
            }
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':tarea_id', $tareaId);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (\PDOException $e) {
            error_log("Error al obtener progreso de tarea: " . $e->getMessage());
            return null;
        }
    }

    // Agregar avance/comentario
    public function addAvance($tareaId, $userId, $comentario, $progresoReportado, $archivo = null)
    {
        try {
            $query = "INSERT INTO Tarea_Avances (id_tarea, id_usuario, comentario, progreso_reportado, archivo) 
                      VALUES (:id_tarea, :id_usuario, :comentario, :progreso_reportado, :archivo)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_tarea', $tareaId);
            $stmt->bindParam(':id_usuario', $userId);
            $stmt->bindParam(':comentario', $comentario);
            $stmt->bindParam(':progreso_reportado', $progresoReportado);
            $stmt->bindParam(':archivo', $archivo);
            
            return $stmt->execute();
        } catch (\PDOException $e) {
            error_log("Error al agregar avance: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener avances de una tarea
    public function getAvances($tareaId)
    {
        try {
            $query = "SELECT 
                        ta.id_avance,
                        ta.comentario,
                        ta.progreso_reportado,
                        ta.archivo,
                        ta.fecha_avance,
                        u.nombre_completo
                      FROM Tarea_Avances ta
                      INNER JOIN Usuario u ON ta.id_usuario = u.id_usuario
                      WHERE ta.id_tarea = :tarea_id
                      ORDER BY ta.fecha_avance DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':tarea_id', $tareaId);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log("Error al obtener avances: " . $e->getMessage());
            throw $e;
        }
    }

    // ✅ FUNCIÓN MODIFICADA: Obtener todas las tareas con progreso calculado
    public function getAllTasks($filtroEstado = null)
    {
        try {
            $estadoCondition = $filtroEstado ? "WHERE t.estado = :estado" : "";
            
            $query = "SELECT 
                        t.id_tarea,
                        t.titulo,
                        t.descripcion,
                        t.fecha_inicio,
                        t.fecha_fin,
                        t.prioridad,
                        t.estado,
                        t.tipo_asignacion,
                        t.fecha_creacion,
                        u.nombre_completo as creador,
                        COUNT(DISTINCT CASE WHEN t.tipo_asignacion = 'usuario' THEN tu.id_usuario END) as total_usuarios,
                        COUNT(DISTINCT CASE WHEN t.tipo_asignacion = 'nucleo' THEN tn.id_nucleo END) as total_nucleos,
                        -- ✅ CALCULAR PROGRESO PROMEDIO
                        CASE 
                            WHEN t.tipo_asignacion = 'usuario' THEN 
                                COALESCE(AVG(tu.progreso), 0)
                            WHEN t.tipo_asignacion = 'nucleo' THEN 
                                COALESCE(AVG(tn.progreso), 0)
                            ELSE 0
                        END as progreso_promedio,
                        -- ✅ CONTAR ASIGNACIONES COMPLETADAS
                        CASE 
                            WHEN t.tipo_asignacion = 'usuario' THEN 
                                SUM(CASE WHEN tu.estado_usuario = 'completada' THEN 1 ELSE 0 END)
                            WHEN t.tipo_asignacion = 'nucleo' THEN 
                                SUM(CASE WHEN tn.estado_nucleo = 'completada' THEN 1 ELSE 0 END)
                            ELSE 0
                        END as asignaciones_completadas
                      FROM Tareas t
                      INNER JOIN Usuario u ON t.id_creador = u.id_usuario
                      LEFT JOIN Tarea_Usuario tu ON t.id_tarea = tu.id_tarea
                      LEFT JOIN Tarea_Nucleo tn ON t.id_tarea = tn.id_tarea
                      $estadoCondition
                      GROUP BY t.id_tarea
                      ORDER BY t.fecha_creacion DESC";
            
            $stmt = $this->conn->prepare($query);
            if ($filtroEstado) {
                $stmt->bindParam(':estado', $filtroEstado);
            }
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log("Error al obtener todas las tareas: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener detalles completos de una tarea
    public function getTaskDetails($tareaId)
    {
        try {
            $query = "SELECT 
                        t.*,
                        u.nombre_completo as creador
                      FROM Tareas t
                      INNER JOIN Usuario u ON t.id_creador = u.id_usuario
                      WHERE t.id_tarea = :tarea_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':tarea_id', $tareaId);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log("Error al obtener detalles de tarea: " . $e->getMessage());
            throw $e;
        }
    }

    // Obtener todos los núcleos familiares
    public function getAllNucleos()
    {
        try {
            $query = "SELECT 
                        nf.id_nucleo,
                        nf.nombre_nucleo,
                        nf.direccion,
                        COUNT(u.id_usuario) as total_miembros
                      FROM Nucleo_Familiar nf
                      LEFT JOIN Usuario u ON nf.id_nucleo = u.id_nucleo
                      GROUP BY nf.id_nucleo
                      ORDER BY nf.nombre_nucleo";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log("Error al obtener núcleos: " . $e->getMessage());
            throw $e;
        }
    }

    // Cancelar tarea (Admin)
    public function cancelTask($tareaId)
    {
        try {
            $query = "UPDATE Tareas SET estado = 'cancelada' WHERE id_tarea = :tarea_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':tarea_id', $tareaId);
            
            return $stmt->execute();
        } catch (\PDOException $e) {
            error_log("Error al cancelar tarea: " . $e->getMessage());
            throw $e;
        }
    }

    // Contar tareas pendientes del usuario
    public function getPendingTasksCount($userId)
    {
        try {
            $query = "SELECT COUNT(*) as total
                      FROM Tarea_Usuario tu
                      INNER JOIN Tareas t ON tu.id_tarea = t.id_tarea
                      WHERE tu.id_usuario = :user_id 
                      AND tu.estado_usuario != 'completada'
                      AND t.estado != 'cancelada'";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $userId);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['total'] ?? 0;
        } catch (\PDOException $e) {
            error_log("Error al contar tareas pendientes: " . $e->getMessage());
            return 0;
        }
    }

    // Obtener todos los usuarios (para asignación)
    public function getAllUsers()
    {
        try {
            $query = "SELECT 
                        id_usuario,
                        nombre_completo,
                        email,
                        estado
                      FROM Usuario
                      WHERE estado = 'aceptado'
                      ORDER BY nombre_completo";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log("Error al obtener usuarios: " . $e->getMessage());
            throw $e;
        }
    }
}