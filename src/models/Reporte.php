<?php

namespace App\models;

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
        error_log("🔍 Generando reporte para: MES=$mes, AÑO=$anio");
        
        try {
            $usuarios = $this->getUsuariosConVivienda();
            
            if (empty($usuarios)) {
                error_log("WARNING: No se encontraron usuarios con vivienda");
                return [
                    'periodo' => [
                        'mes' => (int)$mes,
                        'anio' => (int)$anio,
                        'nombre_mes' => $this->getNombreMes($mes)
                    ],
                    'usuarios' => [],
                    'resumen' => $this->getResumenVacio()
                ];
            }
            
            $resultado = [
                'periodo' => [
                    'mes' => (int)$mes,
                    'anio' => (int)$anio,
                    'nombre_mes' => $this->getNombreMes($mes)
                ],
                'usuarios' => [],
                'resumen' => $this->getResumenVacio()
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

                //  HORAS CON JUSTIFICACIONES (mes/año específico)
                $horas = $this->getHorasUsuarioMesConJustificaciones($usuario['id_usuario'], $mes, $anio);
                $datosUsuario['horas_trabajadas'] = $horas['total_horas'];
                $datosUsuario['horas_requeridas'] = $horas['horas_requeridas'];
                $datosUsuario['horas_aprobadas'] = $horas['horas_aprobadas'];
                $datosUsuario['horas_pendientes'] = $horas['horas_pendientes'];
                $datosUsuario['horas_justificadas'] = $horas['horas_justificadas'];
                $datosUsuario['horas_efectivas'] = $horas['horas_efectivas'];
                $datosUsuario['horas_faltantes'] = $horas['horas_faltantes_real'];
                $datosUsuario['porcentaje_cumplimiento'] = $horas['porcentaje_cumplimiento'];
                $datosUsuario['deuda_horas'] = $horas['deuda_horas_pesos'];

                //  Tareas (mes/año específico)
                $tareas = $this->getTareasUsuarioMes($usuario['id_usuario'], $mes, $anio);
                $datosUsuario['tareas_asignadas'] = $tareas['total'];
                $datosUsuario['tareas_completadas'] = $tareas['completadas'];
                $datosUsuario['tareas_pendientes'] = $tareas['pendientes'];
                $datosUsuario['progreso_tareas'] = $tareas['total'] > 0 
                    ? round(($tareas['completadas'] / $tareas['total']) * 100, 2) 
                    : 0;

                //  Cuotas (mes/año específico)
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

            error_log(" Reporte generado: " . count($resultado['usuarios']) . " usuarios para $mes/$anio");
            return $resultado;

        } catch (\Exception $e) {
            error_log(" ERROR en generarReporteMensual: " . $e->getMessage());
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
                LEFT JOIN Asignacion_Vivienda av ON u.id_usuario = av.id_usuario AND av.activa = 1
                LEFT JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                LEFT JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                WHERE u.estado = 'aceptado'
                ORDER BY u.nombre_completo";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("Usuarios encontrados: " . count($usuarios));
            return $usuarios;
        } catch (\PDOException $e) {
            error_log("Error en getUsuariosConVivienda: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Obtener horas del mes/año específico
     */
    private function getHorasUsuarioMesConJustificaciones($idUsuario, $mes, $anio)
    {
        error_log("🕐 Obteniendo horas para usuario $idUsuario: mes=$mes, año=$anio");
        
        // Obtener horas requeridas
        $sqlHorasRequeridas = "SELECT 
                                COALESCE(tv.habitaciones * 21, 84) as horas_requeridas
                               FROM Usuario u
                               LEFT JOIN Asignacion_Vivienda av ON u.id_usuario = av.id_usuario AND av.activa = 1
                               LEFT JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                               LEFT JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
                               WHERE u.id_usuario = :id_usuario
                               LIMIT 1";
        
        try {
            $stmtRequeridas = $this->conn->prepare($sqlHorasRequeridas);
            $stmtRequeridas->execute([':id_usuario' => $idUsuario]);
            $horasReq = $stmtRequeridas->fetch(PDO::FETCH_ASSOC);
            $horasRequeridas = $horasReq['horas_requeridas'] ?? 84;
        } catch (\PDOException $e) {
            error_log("Error obteniendo horas requeridas: " . $e->getMessage());
            $horasRequeridas = 84;
        }
            
        //  FILTRAR POR MES/AÑO ESPECÍFICO
        $sql = "SELECT 
                    COALESCE(SUM(rh.total_horas), 0) as total_horas,
                    COALESCE(SUM(CASE WHEN rh.estado = 'aprobado' THEN rh.total_horas ELSE 0 END), 0) as horas_aprobadas,
                    COALESCE(SUM(CASE WHEN rh.estado = 'pendiente' THEN rh.total_horas ELSE 0 END), 0) as horas_pendientes
                FROM Registro_Horas rh
                WHERE rh.id_usuario = :id_usuario
                AND MONTH(rh.fecha) = :mes
                AND YEAR(rh.fecha) = :anio";

        //  FILTRAR JUSTIFICACIONES POR MES/AÑO ESPECÍFICO
        $sqlJustificadas = "SELECT COALESCE(SUM(horas_justificadas), 0) as horas_justificadas
                            FROM Justificaciones_Horas
                            WHERE id_usuario = :id_usuario
                            AND mes = :mes
                            AND anio = :anio
                            AND estado = 'aprobada'";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':id_usuario' => $idUsuario,
                ':mes' => $mes,
                ':anio' => $anio
            ]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $stmtJust = $this->conn->prepare($sqlJustificadas);
            $stmtJust->execute([
                ':id_usuario' => $idUsuario,
                ':mes' => $mes,
                ':anio' => $anio
            ]);
            $justResult = $stmtJust->fetch(PDO::FETCH_ASSOC);
            
            $horasJustificadas = floatval($justResult['horas_justificadas'] ?? 0);
            $horasEfectivas = floatval($result['horas_aprobadas']) + $horasJustificadas;
            $horasFaltantesReal = max(0, $horasRequeridas - $horasEfectivas);
            $deudaHorasPesos = $horasFaltantesReal * 160;
            $porcentajeCumplimiento = $horasRequeridas > 0 
                ? round(($horasEfectivas / $horasRequeridas) * 100, 2)
                : 0;
            
            error_log(" Horas calculadas: aprobadas={$result['horas_aprobadas']}, justificadas=$horasJustificadas, efectivas=$horasEfectivas");
            
            return [
                'total_horas' => floatval($result['total_horas']),
                'horas_aprobadas' => floatval($result['horas_aprobadas']),
                'horas_pendientes' => floatval($result['horas_pendientes']),
                'horas_requeridas' => $horasRequeridas,
                'horas_justificadas' => $horasJustificadas,
                'horas_efectivas' => $horasEfectivas,
                'horas_faltantes_real' => $horasFaltantesReal,
                'deuda_horas_pesos' => $deudaHorasPesos,
                'porcentaje_cumplimiento' => $porcentajeCumplimiento
            ];
        } catch (\PDOException $e) {
            error_log("Error en getHorasUsuarioMesConJustificaciones: " . $e->getMessage());
            return [
                'total_horas' => 0,
                'horas_aprobadas' => 0,
                'horas_pendientes' => 0,
                'horas_requeridas' => $horasRequeridas,
                'horas_justificadas' => 0,
                'horas_efectivas' => 0,
                'horas_faltantes_real' => $horasRequeridas,
                'deuda_horas_pesos' => $horasRequeridas * 160,
                'porcentaje_cumplimiento' => 0
            ];
        }
    }


    private function getTareasUsuarioMes($idUsuario, $mes, $anio)
    {
        error_log("📋 Obteniendo tareas para usuario $idUsuario: mes=$mes, año=$anio");
        
        //  CALCULAR primer y último día del mes
        $primerDia = "$anio-" . str_pad($mes, 2, '0', STR_PAD_LEFT) . "-01";
        $ultimoDia = date("Y-m-t", strtotime($primerDia));
        
        error_log("📅 Rango de fechas: $primerDia a $ultimoDia");
        
        //  Seleccionar tareas que están activas DURANTE el mes
        $sql = "SELECT 
                    COUNT(*) as total,
                    COALESCE(SUM(CASE WHEN tu.estado_usuario = 'completada' THEN 1 ELSE 0 END), 0) as completadas,
                    COALESCE(SUM(CASE WHEN tu.estado_usuario != 'completada' THEN 1 ELSE 0 END), 0) as pendientes
                FROM Tarea_Usuario tu
                INNER JOIN Tareas t ON tu.id_tarea = t.id_tarea
                WHERE tu.id_usuario = :id_usuario
                AND t.fecha_inicio <= :ultimo_dia
                AND t.fecha_fin >= :primer_dia
                AND t.estado != 'cancelada'";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':id_usuario' => $idUsuario,
                ':primer_dia' => $primerDia,
                ':ultimo_dia' => $ultimoDia
            ]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log(" Tareas encontradas: {$result['total']} (completadas: {$result['completadas']})");
            
            return $result;
        } catch (\PDOException $e) {
            error_log("Error en getTareasUsuarioMes: " . $e->getMessage());
            return ['total' => 0, 'completadas' => 0, 'pendientes' => 0];
        }
    }

    /**
     * Ya filtra por mes/año específico
     */
    private function getCuotaUsuarioMes($idUsuario, $mes, $anio)
    {
        error_log("💰 Obteniendo cuota para usuario $idUsuario: mes=$mes, año=$anio");
        
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

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log(" Cuota estado: " . ($result['estado'] ?? 'sin_cuota'));
            
            return $result ?: [];
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

    /**
     *  Resumen de horas por mes/año
     */
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
                WHERE u.estado = 'aceptado'
                GROUP BY u.id_usuario, u.nombre_completo, tv.habitaciones
                ORDER BY u.nombre_completo";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':mes' => $mes, ':anio' => $anio]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     *  Resumen de tareas por mes/año
     */
    public function getResumenTareasPorUsuario($mes, $anio)
    {
        $primerDia = "$anio-" . str_pad($mes, 2, '0', STR_PAD_LEFT) . "-01";
        $ultimoDia = date("Y-m-t", strtotime($primerDia));
        
        $sql = "SELECT 
                    u.id_usuario,
                    u.nombre_completo,
                    COUNT(DISTINCT tu.id_tarea) as tareas_asignadas,
                    COALESCE(SUM(CASE WHEN tu.estado_usuario = 'completada' THEN 1 ELSE 0 END), 0) as tareas_completadas
                FROM Usuario u
                LEFT JOIN Tarea_Usuario tu ON u.id_usuario = tu.id_usuario
                LEFT JOIN Tareas t ON tu.id_tarea = t.id_tarea
                    AND t.fecha_inicio <= :ultimo_dia
                    AND t.fecha_fin >= :primer_dia
                    AND t.estado != 'cancelada'
                WHERE u.estado = 'aceptado'
                GROUP BY u.id_usuario, u.nombre_completo
                ORDER BY u.nombre_completo";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':primer_dia' => $primerDia,
            ':ultimo_dia' => $ultimoDia
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     *   Ya filtra por mes/año
     */
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
                WHERE u.estado = 'aceptado'
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

    /**
     *  Ya filtra por mes/año
     */
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

    /**
     * Estadísticas de tareas activas en el mes
     */
    private function getEstadisticasTareas($mes, $anio)
    {
        $primerDia = "$anio-" . str_pad($mes, 2, '0', STR_PAD_LEFT) . "-01";
        $ultimoDia = date("Y-m-t", strtotime($primerDia));
        
        $sql = "SELECT 
                    COUNT(*) as total_tareas,
                    COALESCE(SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END), 0) as completadas,
                    COALESCE(SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END), 0) as canceladas
                FROM Tareas
                WHERE fecha_inicio <= :ultimo_dia
                AND fecha_fin >= :primer_dia";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':primer_dia' => $primerDia,
            ':ultimo_dia' => $ultimoDia
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     *  Ya filtra por mes/año
     */
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

    private function getResumenVacio()
    {
        return [
            'total_usuarios' => 0,
            'total_horas_trabajadas' => 0,
            'total_horas_requeridas' => 0,
            'total_deuda_horas' => 0,
            'total_tareas_asignadas' => 0,
            'total_tareas_completadas' => 0,
            'total_cuotas_pagadas' => 0,
            'total_cuotas_pendientes' => 0,
            'promedio_cumplimiento' => 0
        ];
    }
}