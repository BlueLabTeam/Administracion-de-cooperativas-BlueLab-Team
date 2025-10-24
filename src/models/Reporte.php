<?php

namespace App\Models;

use App\config\Database;
use PDO;

class Reporte
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function generarReporteMensual($mes, $anio)
    {
        error_log("=== INICIO Reporte::generarReporteMensual ===");
        error_log("Mes: $mes, Anio: $anio");
        
        try {
            $usuarios = $this->getUsuariosConVivienda();
            
            if (empty($usuarios)) {
                error_log("WARNING: No se encontraron usuarios con vivienda");
                return [
                    'periodo' => [
                        'mes' => $mes,
                        'anio' => $anio,
                        'nombre_mes' => $this->getNombreMes($mes)
                    ],
                    'usuarios' => [],
                    'resumen' => [
                        'total_usuarios' => 0,
                        'total_horas_trabajadas' => 0,
                        'total_horas_requeridas' => 0,
                        'total_deuda_horas' => 0,
                        'total_tareas_asignadas' => 0,
                        'total_tareas_completadas' => 0,
                        'total_cuotas_pagadas' => 0,
                        'total_cuotas_pendientes' => 0,
                        'promedio_cumplimiento' => 0
                    ]
                ];
            }
            
            $resultado = [
                'periodo' => [
                    'mes' => $mes,
                    'anio' => $anio,
                    'nombre_mes' => $this->getNombreMes($mes)
                ],
                'usuarios' => [],
                'resumen' => [
                    'total_usuarios' => 0,
                    'total_horas_trabajadas' => 0,
                    'total_horas_requeridas' => 0,
                    'total_deuda_horas' => 0,
                    'total_tareas_asignadas' => 0,
                    'total_tareas_completadas' => 0,
                    'total_cuotas_pagadas' => 0,
                    'total_cuotas_pendientes' => 0,
                    'promedio_cumplimiento' => 0
                ]
            ];

            $sumaCumplimiento = 0;

            foreach ($usuarios as $usuario) {
                $datosUsuario = [
                    'id_usuario' => $usuario['id_usuario'],
                    'nombre_completo' => $usuario['nombre_completo'],
                    'cedula' => $usuario['cedula'],
                    'email' => $usuario['email'],
                    'vivienda' => $usuario['numero_vivienda'],
                    'tipo_vivienda' => $usuario['tipo_vivienda']
                ];

                // Horas
                $horas = $this->getHorasUsuarioMes($usuario['id_usuario'], $mes, $anio);
                $datosUsuario['horas_trabajadas'] = $horas['total_horas'];
                $datosUsuario['horas_requeridas'] = $horas['horas_requeridas'];
                $datosUsuario['horas_aprobadas'] = $horas['horas_aprobadas'];
                $datosUsuario['horas_pendientes'] = $horas['horas_pendientes'];
                $datosUsuario['horas_faltantes'] = max(0, $horas['horas_requeridas'] - $horas['horas_aprobadas']);
                $datosUsuario['porcentaje_cumplimiento'] = $horas['horas_requeridas'] > 0 
                    ? round(($horas['horas_aprobadas'] / $horas['horas_requeridas']) * 100, 2) 
                    : 0;
                $datosUsuario['deuda_horas'] = $datosUsuario['horas_faltantes'] * 160;

                // Tareas
                $tareas = $this->getTareasUsuarioMes($usuario['id_usuario'], $mes, $anio);
                $datosUsuario['tareas_asignadas'] = $tareas['total'];
                $datosUsuario['tareas_completadas'] = $tareas['completadas'];
                $datosUsuario['tareas_pendientes'] = $tareas['pendientes'];
                $datosUsuario['progreso_tareas'] = $tareas['total'] > 0 
                    ? round(($tareas['completadas'] / $tareas['total']) * 100, 2) 
                    : 0;

                // Cuotas
                $cuota = $this->getCuotaUsuarioMes($usuario['id_usuario'], $mes, $anio);
                $datosUsuario['estado_cuota'] = $cuota['estado'] ?? 'sin_cuota';
                $datosUsuario['monto_cuota'] = $cuota['monto_total'] ?? 0;
                $datosUsuario['fecha_pago'] = $cuota['fecha_pago'] ?? null;

                // Estado general
                $datosUsuario['estado_general'] = $this->calcularEstadoGeneral($datosUsuario);

                $resultado['usuarios'][] = $datosUsuario;

                // Acumular para resumen
                $resultado['resumen']['total_usuarios']++;
                $resultado['resumen']['total_horas_trabajadas'] += $horas['total_horas'];
                $resultado['resumen']['total_horas_requeridas'] += $horas['horas_requeridas'];
                $resultado['resumen']['total_deuda_horas'] += $datosUsuario['deuda_horas'];
                $resultado['resumen']['total_tareas_asignadas'] += $tareas['total'];
                $resultado['resumen']['total_tareas_completadas'] += $tareas['completadas'];
                
                if ($datosUsuario['estado_cuota'] === 'pagada') {
                    $resultado['resumen']['total_cuotas_pagadas']++;
                } else {
                    $resultado['resumen']['total_cuotas_pendientes']++;
                }

                $sumaCumplimiento += $datosUsuario['porcentaje_cumplimiento'];
            }

            if ($resultado['resumen']['total_usuarios'] > 0) {
                $resultado['resumen']['promedio_cumplimiento'] = round(
                    $sumaCumplimiento / $resultado['resumen']['total_usuarios'], 
                    2
                );
            }

            error_log("SUCCESS: Reporte generado con " . count($resultado['usuarios']) . " usuarios");
            return $resultado;

        } catch (\Exception $e) {
            error_log("ERROR en generarReporteMensual: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    private function getUsuariosConVivienda()
    {
        error_log("Ejecutando getUsuariosConVivienda()");
        
        $sql = "SELECT 
                    u.id_usuario,
                    u.nombre_completo,
                    u.cedula,
                    u.email,
                    v.numero_vivienda,
                    tv.nombre as tipo_vivienda
                FROM Usuario u
                INNER JOIN Asignacion_Vivienda av ON u.id_usuario = av.id_usuario
                INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                WHERE av.activa = 1
                ORDER BY u.nombre_completo";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("Usuarios encontrados: " . count($usuarios));
            if (count($usuarios) > 0) {
                error_log("Primer usuario: " . $usuarios[0]['nombre_completo']);
            }
            
            return $usuarios;
        } catch (\PDOException $e) {
            error_log("Error en getUsuariosConVivienda: " . $e->getMessage());
            throw $e;
        }
    }

    private function getHorasUsuarioMes($idUsuario, $mes, $anio)
    {
        // Primero obtenemos las horas requeridas de la vivienda asignada
        $sqlHorasRequeridas = "SELECT tv.habitaciones * 21 as horas_requeridas
                               FROM Tipo_Vivienda tv
                               INNER JOIN Viviendas v ON tv.id_tipo = v.id_tipo
                               INNER JOIN Asignacion_Vivienda av ON v.id_vivienda = av.id_vivienda
                               WHERE av.id_usuario = :id_usuario AND av.activa = 1
                               LIMIT 1";
        
        try {
            $stmtRequeridas = $this->conn->prepare($sqlHorasRequeridas);
            $stmtRequeridas->execute([':id_usuario' => $idUsuario]);
            $horasReq = $stmtRequeridas->fetch(PDO::FETCH_ASSOC);
            $horasRequeridas = $horasReq['horas_requeridas'] ?? 0;
        } catch (\PDOException $e) {
            error_log("Error obteniendo horas requeridas: " . $e->getMessage());
            $horasRequeridas = 0;
        }
        
        // Luego obtenemos las horas trabajadas
        $sql = "SELECT 
                    COALESCE(SUM(rh.total_horas), 0) as total_horas,
                    COALESCE(SUM(CASE WHEN rh.estado = 'aprobado' THEN rh.total_horas ELSE 0 END), 0) as horas_aprobadas,
                    COALESCE(SUM(CASE WHEN rh.estado = 'pendiente' THEN rh.total_horas ELSE 0 END), 0) as horas_pendientes
                FROM Registro_Horas rh
                WHERE rh.id_usuario = :id_usuario
                AND MONTH(rh.fecha) = :mes
                AND YEAR(rh.fecha) = :anio";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':id_usuario' => $idUsuario,
                ':mes' => $mes,
                ':anio' => $anio
            ]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $result['horas_requeridas'] = $horasRequeridas;
            
            return $result;
        } catch (\PDOException $e) {
            error_log("Error en getHorasUsuarioMes: " . $e->getMessage());
            return [
                'total_horas' => 0,
                'horas_aprobadas' => 0,
                'horas_pendientes' => 0,
                'horas_requeridas' => $horasRequeridas
            ];
        }
    }

    private function getTareasUsuarioMes($idUsuario, $mes, $anio)
    {
        $sql = "SELECT 
                    COUNT(*) as total,
                    COALESCE(SUM(CASE WHEN tu.estado_usuario = 'completada' THEN 1 ELSE 0 END), 0) as completadas,
                    COALESCE(SUM(CASE WHEN tu.estado_usuario != 'completada' THEN 1 ELSE 0 END), 0) as pendientes
                FROM Tarea_Usuario tu
                INNER JOIN Tareas t ON tu.id_tarea = t.id_tarea
                WHERE tu.id_usuario = :id_usuario
                AND ((MONTH(t.fecha_inicio) = :mes AND YEAR(t.fecha_inicio) = :anio)
                     OR (MONTH(t.fecha_fin) = :mes AND YEAR(t.fecha_fin) = :anio))";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':id_usuario' => $idUsuario,
                ':mes' => $mes,
                ':anio' => $anio
            ]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log("Error en getTareasUsuarioMes: " . $e->getMessage());
            return ['total' => 0, 'completadas' => 0, 'pendientes' => 0];
        }
    }

    private function getCuotaUsuarioMes($idUsuario, $mes, $anio)
    {
        $sql = "SELECT 
                    c.estado,
                    (c.monto + c.monto_pendiente_anterior) as monto_total,
                    p.fecha_pago
                FROM Cuotas_Mensuales c
                LEFT JOIN Pagos_Cuotas p ON c.id_cuota = p.id_cuota AND p.estado_validacion = 'aprobado'
                WHERE c.id_usuario = :id_usuario
                AND c.mes = :mes
                AND c.anio = :anio
                LIMIT 1";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':id_usuario' => $idUsuario,
                ':mes' => $mes,
                ':anio' => $anio
            ]);

            return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
        } catch (\PDOException $e) {
            error_log("Error en getCuotaUsuarioMes: " . $e->getMessage());
            return [];
        }
    }

    private function calcularEstadoGeneral($datos)
    {
        $cumplimiento = $datos['porcentaje_cumplimiento'];
        $estadoCuota = $datos['estado_cuota'];
        $progresoTareas = $datos['progreso_tareas'];

        if ($cumplimiento >= 90 && $estadoCuota === 'pagada' && $progresoTareas >= 80) {
            return 'excelente';
        } elseif ($cumplimiento >= 70 && $estadoCuota !== 'vencida') {
            return 'bueno';
        } elseif ($cumplimiento >= 50) {
            return 'regular';
        } else {
            return 'critico';
        }
    }

    public function getResumenHorasPorUsuario($mes, $anio)
    {
        $sql = "SELECT 
                    u.id_usuario,
                    u.nombre_completo,
                    COALESCE(SUM(rh.total_horas), 0) as total_horas,
                    (tv.habitaciones * 21) as horas_requeridas,
                    COALESCE(SUM(CASE WHEN rh.estado = 'aprobado' THEN rh.total_horas ELSE 0 END), 0) as horas_aprobadas
                FROM Usuario u
                INNER JOIN Asignacion_Vivienda av ON u.id_usuario = av.id_usuario AND av.activa = 1
                INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                LEFT JOIN Registro_Horas rh ON u.id_usuario = rh.id_usuario 
                    AND MONTH(rh.fecha) = :mes 
                    AND YEAR(rh.fecha) = :anio
                GROUP BY u.id_usuario, u.nombre_completo, tv.habitaciones
                ORDER BY u.nombre_completo";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':mes' => $mes, ':anio' => $anio]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getResumenTareasPorUsuario($mes, $anio)
    {
        $sql = "SELECT 
                    u.id_usuario,
                    u.nombre_completo,
                    COUNT(DISTINCT tu.id_tarea) as tareas_asignadas,
                    COALESCE(SUM(CASE WHEN tu.estado_usuario = 'completada' THEN 1 ELSE 0 END), 0) as tareas_completadas
                FROM Usuario u
                LEFT JOIN Tarea_Usuario tu ON u.id_usuario = tu.id_usuario
                LEFT JOIN Tareas t ON tu.id_tarea = t.id_tarea
                    AND ((MONTH(t.fecha_inicio) = :mes AND YEAR(t.fecha_inicio) = :anio)
                         OR (MONTH(t.fecha_fin) = :mes AND YEAR(t.fecha_fin) = :anio))
                GROUP BY u.id_usuario, u.nombre_completo
                ORDER BY u.nombre_completo";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':mes' => $mes, ':anio' => $anio]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getResumenCuotasPorUsuario($mes, $anio)
    {
        $sql = "SELECT 
                    u.id_usuario,
                    u.nombre_completo,
                    c.estado,
                    (c.monto + c.monto_pendiente_anterior) as monto_total,
                    p.fecha_pago
                FROM Usuario u
                LEFT JOIN Cuotas_Mensuales c ON u.id_usuario = c.id_usuario 
                    AND c.mes = :mes 
                    AND c.anio = :anio
                LEFT JOIN Pagos_Cuotas p ON c.id_cuota = p.id_cuota AND p.estado_validacion = 'aprobado'
                ORDER BY u.nombre_completo";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':mes' => $mes, ':anio' => $anio]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEstadisticasGenerales($mes, $anio)
    {
        return [
            'horas' => $this->getEstadisticasHoras($mes, $anio),
            'tareas' => $this->getEstadisticasTareas($mes, $anio),
            'cuotas' => $this->getEstadisticasCuotas($mes, $anio)
        ];
    }

    private function getEstadisticasHoras($mes, $anio)
    {
        $sql = "SELECT 
                    COUNT(DISTINCT rh.id_usuario) as usuarios_activos,
                    COALESCE(SUM(rh.total_horas), 0) as total_horas,
                    COALESCE(AVG(rh.total_horas), 0) as promedio_horas
                FROM Registro_Horas rh
                WHERE MONTH(rh.fecha) = :mes AND YEAR(rh.fecha) = :anio";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':mes' => $mes, ':anio' => $anio]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getEstadisticasTareas($mes, $anio)
    {
        $sql = "SELECT 
                    COUNT(*) as total_tareas,
                    COALESCE(SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END), 0) as completadas,
                    COALESCE(SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END), 0) as canceladas
                FROM Tareas
                WHERE (MONTH(fecha_inicio) = :mes AND YEAR(fecha_inicio) = :anio)
                   OR (MONTH(fecha_fin) = :mes AND YEAR(fecha_fin) = :anio)";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':mes' => $mes, ':anio' => $anio]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getEstadisticasCuotas($mes, $anio)
    {
        $sql = "SELECT 
                    COUNT(*) as total_cuotas,
                    COALESCE(SUM(CASE WHEN estado = 'pagada' THEN 1 ELSE 0 END), 0) as pagadas,
                    COALESCE(SUM(monto + monto_pendiente_anterior), 0) as monto_total
                FROM Cuotas_Mensuales
                WHERE mes = :mes AND anio = :anio";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':mes' => $mes, ':anio' => $anio]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getNombreMes($mes)
    {
        $meses = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];
        return $meses[$mes] ?? 'Desconocido';
    }
}