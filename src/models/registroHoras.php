<?php

namespace App\models;

use App\config\Database;
use PDO;

class RegistroHoras
{
    private $conn;

  public function __construct()
{
    $this->conn = Database::getConnection(); // ← Cambiar aquí
}

    /**
     * Iniciar una nueva jornada
     */
   public function iniciarJornada($id_usuario, $fecha, $hora_entrada, $descripcion = '')
    {
        try {
            error_log("=== MODEL: iniciarJornada ===");
            error_log("Usuario: $id_usuario, Fecha: $fecha, Hora: $hora_entrada");

           
        /*
        $dia_semana = date('N', strtotime($fecha));
        if ($dia_semana > 5) {
            error_log("❌ Intento de registro en fin de semana");
            return [
                'success' => false,
                'message' => 'No se pueden registrar horas en fin de semana'
            ];
        }
        */

            // Verificar si ya existe un registro para hoy
            $stmt = $this->conn->prepare("
                SELECT id_registro, hora_salida 
                FROM Registro_Horas 
                WHERE id_usuario = :id_usuario 
                AND fecha = :fecha
            ");
            
            if (!$stmt) {
                error_log("❌ Error al preparar statement: " . json_encode($this->conn->errorInfo()));
                throw new \Exception("Error al preparar consulta");
            }
            
            $stmt->execute([
                'id_usuario' => $id_usuario,
                'fecha' => $fecha
            ]);
            
            $registro_existente = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($registro_existente) {
                error_log("⚠️ Registro existente encontrado: " . json_encode($registro_existente));
                if ($registro_existente['hora_salida'] === null) {
                    return [
                        'success' => false,
                        'message' => 'Ya tienes una jornada abierta para hoy'
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Ya completaste tu jornada de hoy'
                    ];
                }
            }

            // Crear nuevo registro
            error_log("✅ Creando nuevo registro...");
            $stmt = $this->conn->prepare("
                INSERT INTO Registro_Horas 
                (id_usuario, fecha, hora_entrada, descripcion, estado) 
                VALUES (:id_usuario, :fecha, :hora_entrada, :descripcion, 'pendiente')
            ");

            if (!$stmt) {
                error_log("❌ Error al preparar INSERT: " . json_encode($this->conn->errorInfo()));
                throw new \Exception("Error al preparar INSERT");
            }

            $ejecutado = $stmt->execute([
                'id_usuario' => $id_usuario,
                'fecha' => $fecha,
                'hora_entrada' => $hora_entrada,
                'descripcion' => $descripcion
            ]);

            if (!$ejecutado) {
                error_log("❌ Error al ejecutar INSERT: " . json_encode($stmt->errorInfo()));
                throw new \Exception("Error al ejecutar INSERT");
            }

            $id_registro = $this->conn->lastInsertId();
            error_log("✅ Registro creado con ID: " . $id_registro);

            return [
                'success' => true,
                'message' => 'Entrada registrada correctamente',
                'id_registro' => $id_registro,
                'hora_entrada' => $hora_entrada
            ];

        } catch (\PDOException $e) {
            error_log("❌ PDOException en iniciarJornada: " . $e->getMessage());
            error_log("Stack: " . $e->getTraceAsString());
            return [
                'success' => false,
                'message' => 'Error de base de datos: ' . $e->getMessage(),
                'debug' => [
                    'code' => $e->getCode(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ];
        } catch (\Exception $e) {
            error_log("❌ Exception en iniciarJornada: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al registrar entrada: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Cerrar jornada (marcar salida)
     */
    public function cerrarJornada($id_registro, $hora_salida)
    {
        try {
            // Obtener el registro
            $stmt = $this->conn->prepare("
                SELECT hora_entrada, fecha 
                FROM Registro_Horas 
                WHERE id_registro = :id_registro
            ");
            $stmt->execute(['id_registro' => $id_registro]);
            $registro = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$registro) {
                return [
                    'success' => false,
                    'message' => 'Registro no encontrado'
                ];
            }

            // Calcular horas trabajadas
            $entrada = new \DateTime($registro['fecha'] . ' ' . $registro['hora_entrada']);
            $salida = new \DateTime($registro['fecha'] . ' ' . $hora_salida);
            
            if ($salida <= $entrada) {
                return [
                    'success' => false,
                    'message' => 'La hora de salida debe ser posterior a la entrada'
                ];
            }

            $interval = $entrada->diff($salida);
            $total_horas = $interval->h + ($interval->i / 60);

            // Validar que no exceda 12 horas
            if ($total_horas > 12) {
                return [
                    'success' => false,
                    'message' => 'No se pueden registrar más de 12 horas en un día'
                ];
            }

            // Actualizar registro
            $stmt = $this->conn->prepare("
                UPDATE Registro_Horas 
                SET hora_salida = :hora_salida,
                    total_horas = :total_horas
                WHERE id_registro = :id_registro
            ");

            $stmt->execute([
                'hora_salida' => $hora_salida,
                'total_horas' => round($total_horas, 2),
                'id_registro' => $id_registro
            ]);

            return [
                'success' => true,
                'message' => 'Salida registrada correctamente',
                'total_horas' => round($total_horas, 2)
            ];

        } catch (\PDOException $e) {
            error_log("Error en cerrarJornada: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al registrar salida: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener registros de un usuario
     */
    public function getRegistrosByUsuario($id_usuario, $fecha_inicio = null, $fecha_fin = null)
    {
        try {
            $sql = "
                SELECT 
                    r.*,
                    u.nombre_completo
                FROM Registro_Horas r
                INNER JOIN Usuario u ON r.id_usuario = u.id_usuario
                WHERE r.id_usuario = :id_usuario
            ";

            $params = ['id_usuario' => $id_usuario];

            if ($fecha_inicio) {
                $sql .= " AND r.fecha >= :fecha_inicio";
                $params['fecha_inicio'] = $fecha_inicio;
            }

            if ($fecha_fin) {
                $sql .= " AND r.fecha <= :fecha_fin";
                $params['fecha_fin'] = $fecha_fin;
            }

            $sql .= " ORDER BY r.fecha DESC, r.hora_entrada DESC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (\PDOException $e) {
            error_log("Error en getRegistrosByUsuario: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener registro abierto del día actual
     */
    public function getRegistroAbiertoHoy($id_usuario)
    {
        try {
            $stmt = $this->conn->prepare("
                SELECT * 
                FROM Registro_Horas 
                WHERE id_usuario = :id_usuario 
                AND fecha = CURDATE()
                AND hora_salida IS NULL
            ");

            $stmt->execute(['id_usuario' => $id_usuario]);
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

        } catch (\PDOException $e) {
            error_log("Error en getRegistroAbiertoHoy: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Resumen semanal
     */
    public function getResumenSemanal($id_usuario, $fecha = null)
    {
        try {
            if (!$fecha) {
                $fecha = date('Y-m-d');
            }

            // Obtener el lunes de la semana
            $fecha_obj = new \DateTime($fecha);
            $dia_semana = $fecha_obj->format('N'); // 1=Lunes, 7=Domingo
            $fecha_obj->modify('-' . ($dia_semana - 1) . ' days');
            $lunes = $fecha_obj->format('Y-m-d');

            // Obtener el viernes
            $fecha_obj->modify('+4 days');
            $viernes = $fecha_obj->format('Y-m-d');

            $stmt = $this->conn->prepare("
                SELECT 
                    fecha,
                    hora_entrada,
                    hora_salida,
                    total_horas,
                    estado,
                    descripcion
                FROM Registro_Horas
                WHERE id_usuario = :id_usuario
                AND fecha BETWEEN :lunes AND :viernes
                ORDER BY fecha
            ");

            $stmt->execute([
                'id_usuario' => $id_usuario,
                'lunes' => $lunes,
                'viernes' => $viernes
            ]);

            $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Calcular totales
            $total_horas = 0;
            $dias_trabajados = 0;

            foreach ($registros as $registro) {
                if ($registro['total_horas'] > 0) {
                    $total_horas += $registro['total_horas'];
                    $dias_trabajados++;
                }
            }

            return [
                'semana' => [
                    'inicio' => $lunes,
                    'fin' => $viernes
                ],
                'registros' => $registros,
                'total_horas' => round($total_horas, 2),
                'dias_trabajados' => $dias_trabajados
            ];

        } catch (\PDOException $e) {
            error_log("Error en getResumenSemanal: " . $e->getMessage());
            return [
                'registros' => [],
                'total_horas' => 0,
                'dias_trabajados' => 0
            ];
        }
    }

    /**
     * Estadísticas del mes
     */
    public function getEstadisticas($id_usuario, $mes, $anio)
    {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    COUNT(*) as total_dias,
                    SUM(total_horas) as total_horas,
                    AVG(total_horas) as promedio_horas,
                    MAX(total_horas) as max_horas,
                    MIN(total_horas) as min_horas
                FROM Registro_Horas
                WHERE id_usuario = :id_usuario
                AND MONTH(fecha) = :mes
                AND YEAR(fecha) = :anio
                AND total_horas > 0
            ");

            $stmt->execute([
                'id_usuario' => $id_usuario,
                'mes' => $mes,
                'anio' => $anio
            ]);

            $stats = $stmt->fetch(PDO::FETCH_ASSOC);

            return [
                'mes' => $mes,
                'anio' => $anio,
                'total_dias' => (int)$stats['total_dias'],
                'total_horas' => round((float)$stats['total_horas'], 2),
                'promedio_horas' => round((float)$stats['promedio_horas'], 2),
                'max_horas' => round((float)$stats['max_horas'], 2),
                'min_horas' => round((float)$stats['min_horas'], 2)
            ];

        } catch (\PDOException $e) {
            error_log("Error en getEstadisticas: " . $e->getMessage());
            return [
                'total_dias' => 0,
                'total_horas' => 0,
                'promedio_horas' => 0,
                'max_horas' => 0,
                'min_horas' => 0
            ];
        }
    }

    /**
     * Editar registro
     */
    public function editarRegistro($id_registro, $hora_entrada, $hora_salida = null, $descripcion = '')
    {
        try {
            // Obtener fecha del registro
            $stmt = $this->conn->prepare("SELECT fecha FROM Registro_Horas WHERE id_registro = :id");
            $stmt->execute(['id' => $id_registro]);
            $registro = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$registro) {
                return ['success' => false, 'message' => 'Registro no encontrado'];
            }

            // Calcular horas si hay salida
            $total_horas = 0;
            if ($hora_salida) {
                $entrada = new \DateTime($registro['fecha'] . ' ' . $hora_entrada);
                $salida = new \DateTime($registro['fecha'] . ' ' . $hora_salida);
                
                if ($salida <= $entrada) {
                    return [
                        'success' => false,
                        'message' => 'La hora de salida debe ser posterior a la entrada'
                    ];
                }

                $interval = $entrada->diff($salida);
                $total_horas = $interval->h + ($interval->i / 60);

                if ($total_horas > 12) {
                    return [
                        'success' => false,
                        'message' => 'No se pueden registrar más de 12 horas'
                    ];
                }
            }

            // Actualizar
            $stmt = $this->conn->prepare("
                UPDATE Registro_Horas 
                SET hora_entrada = :hora_entrada,
                    hora_salida = :hora_salida,
                    total_horas = :total_horas,
                    descripcion = :descripcion,
                    estado = 'pendiente'
                WHERE id_registro = :id_registro
            ");

            $stmt->execute([
                'hora_entrada' => $hora_entrada,
                'hora_salida' => $hora_salida,
                'total_horas' => round($total_horas, 2),
                'descripcion' => $descripcion,
                'id_registro' => $id_registro
            ]);

            return [
                'success' => true,
                'message' => 'Registro actualizado correctamente'
            ];

        } catch (\PDOException $e) {
            error_log("Error en editarRegistro: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al editar registro'
            ];
        }
    }

    /**
     * Obtener todos los registros (Admin)
     */
    public function getAllRegistros($filtros = [])
    {
        try {
            $sql = "
                SELECT 
                    r.*,
                    u.nombre_completo,
                    u.email
                FROM Registro_Horas r
                INNER JOIN Usuario u ON r.id_usuario = u.id_usuario
                WHERE 1=1
            ";

            $params = [];

            if (!empty($filtros['usuario_id'])) {
                $sql .= " AND r.id_usuario = :usuario_id";
                $params['usuario_id'] = $filtros['usuario_id'];
            }

            if (!empty($filtros['estado'])) {
                $sql .= " AND r.estado = :estado";
                $params['estado'] = $filtros['estado'];
            }

            if (!empty($filtros['fecha_inicio'])) {
                $sql .= " AND r.fecha >= :fecha_inicio";
                $params['fecha_inicio'] = $filtros['fecha_inicio'];
            }

            if (!empty($filtros['fecha_fin'])) {
                $sql .= " AND r.fecha <= :fecha_fin";
                $params['fecha_fin'] = $filtros['fecha_fin'];
            }

            $sql .= " ORDER BY r.fecha DESC, r.hora_entrada DESC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (\PDOException $e) {
            error_log("Error en getAllRegistros: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Aprobar/Rechazar horas (Admin)
     */
    public function aprobarRechazarHoras($id_registro, $accion, $observaciones = '')
    {
        try {
            $estado = ($accion === 'aprobar') ? 'aprobado' : 'rechazado';

            $stmt = $this->conn->prepare("
                UPDATE Registro_Horas 
                SET estado = :estado,
                    observaciones = :observaciones
                WHERE id_registro = :id_registro
            ");

            $stmt->execute([
                'estado' => $estado,
                'observaciones' => $observaciones,
                'id_registro' => $id_registro
            ]);

            return [
                'success' => true,
                'message' => 'Registro ' . ($accion === 'aprobar' ? 'aprobado' : 'rechazado') . ' correctamente'
            ];

        } catch (\PDOException $e) {
            error_log("Error en aprobarRechazarHoras: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al procesar solicitud'
            ];
        }
    }
}