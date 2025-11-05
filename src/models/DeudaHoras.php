<?php

namespace App\Models;

use App\config\Database;
use PDO;

class DeudaHoras
{
    private $conn;

    // ⭐ CAMBIO: 21 horas SEMANALES = 84 horas MENSUALES
    private $horas_semanales_requeridas = 21;
    private $horas_mensuales_requeridas = 84; // 21h × 4 semanas
    private $costo_hora_faltante = 160; // $160 por cada hora no trabajada

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    /**
     * Obtener deuda/estado de horas DEL MES ACTUAL
     * Horas requeridas: 84h mensuales (21h semanales × 4 semanas)
     * Horas cumplidas: las que tiene registradas (aprobadas o no)
     * Deuda: (Horas faltantes) × $160
     */
    public function obtenerDeudaActual($id_usuario)
    {
        try {
            error_log("=== obtenerDeudaActual (Sistema Semanal: 21h/semana) ===");
            error_log("ID Usuario: " . $id_usuario);

            // Mes y año actuales
            $mes_actual = date('n');
            $anio_actual = date('Y');

            // Obtener horas trabajadas del mes actual (sin importar estado)
            $stmt = $this->conn->prepare("
                SELECT COALESCE(SUM(total_horas), 0) as total_horas
                FROM Registro_Horas
                WHERE id_usuario = :id_usuario
                AND MONTH(fecha) = :mes
                AND YEAR(fecha) = :anio
                AND hora_salida IS NOT NULL
                AND total_horas > 0
            ");

            $stmt->execute([
                'id_usuario' => $id_usuario,
                'mes' => $mes_actual,
                'anio' => $anio_actual
            ]);

            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
            $horas_trabajadas = (float)$resultado['total_horas'];

            // ✅ OBTENER HORAS JUSTIFICADAS DEL MES ACTUAL
            $stmt = $this->conn->prepare("
                SELECT COALESCE(SUM(horas_justificadas), 0) as horas_justificadas,
                       COALESCE(SUM(monto_descontado), 0) as monto_descontado
                FROM Justificaciones_Horas
                WHERE id_usuario = :id_usuario
                AND mes = :mes
                AND anio = :anio
                AND estado = 'aprobada'
            ");

            $stmt->execute([
                'id_usuario' => $id_usuario,
                'mes' => $mes_actual,
                'anio' => $anio_actual
            ]);

            $justificacion = $stmt->fetch(PDO::FETCH_ASSOC);
            $horas_justificadas = (float)($justificacion['horas_justificadas'] ?? 0);
            $monto_justificado = (float)($justificacion['monto_descontado'] ?? 0);

            error_log("Horas trabajadas este mes: " . $horas_trabajadas . "h");
            error_log("Horas justificadas este mes: " . $horas_justificadas . "h");
            error_log("Monto justificado: $" . $monto_justificado);
            error_log("Horas requeridas mensuales: " . $this->horas_mensuales_requeridas . "h (21h/semana × 4)");

            // ✅ CALCULAR HORAS FALTANTES CONSIDERANDO JUSTIFICACIONES
            // Horas faltantes = Requeridas - Trabajadas - Justificadas
            $horas_efectivas = $horas_trabajadas + $horas_justificadas;
            $horas_faltantes = max(0, $this->horas_mensuales_requeridas - $horas_efectivas);
            $horas_excedentes = max(0, $horas_efectivas - $this->horas_mensuales_requeridas);

            // ✅ CALCULAR DEUDA EN PESOS: Solo las horas REALMENTE faltantes
            $deuda_mes_actual = $horas_faltantes * $this->costo_hora_faltante;

            // Obtener deuda acumulada de meses anteriores
            $deuda_anterior = $this->calcularDeudaAcumulada($id_usuario, $mes_actual, $anio_actual);

            // Deuda total = deuda del mes actual + deuda acumulada
            $deuda_total = $deuda_mes_actual + $deuda_anterior;

            $porcentaje_cumplido = $this->horas_mensuales_requeridas > 0
                ? round(($horas_efectivas / $this->horas_mensuales_requeridas) * 100, 2)
                : 0;

            // Determinar estado
            $estado = 'pendiente';
            if ($horas_efectivas >= $this->horas_mensuales_requeridas) {
                $estado = 'cumplido';
            } elseif ($horas_efectivas > 0) {
                $estado = 'progreso';
            }

            // Calcular promedio semanal
            $semana_actual = date('W');
            $semana_inicio_mes = date('W', strtotime(date('Y-m-01')));
            $semanas_transcurridas = max(1, $semana_actual - $semana_inicio_mes + 1);
            $promedio_semanal = $semanas_transcurridas > 0 ? $horas_trabajadas / $semanas_transcurridas : 0;

            error_log("Horas efectivas (trabajadas + justificadas): " . $horas_efectivas . "h");
            error_log("Horas faltantes: " . $horas_faltantes . "h");
            error_log("Deuda mes actual: $" . $deuda_mes_actual);
            error_log("Deuda acumulada: $" . $deuda_anterior);
            error_log("Deuda total: $" . $deuda_total);
            error_log("Porcentaje cumplido: " . $porcentaje_cumplido . "%");

            return [
                'mes' => $mes_actual,
                'anio' => $anio_actual,
                'horas_requeridas_mensuales' => $this->horas_mensuales_requeridas,
                'horas_requeridas_semanales' => $this->horas_semanales_requeridas,
                'horas_trabajadas' => round($horas_trabajadas, 2),
                'horas_justificadas' => round($horas_justificadas, 2),
                'horas_efectivas' => round($horas_efectivas, 2),
                'horas_faltantes' => round($horas_faltantes, 2),
                'horas_excedentes' => round($horas_excedentes, 2),
                'promedio_semanal' => round($promedio_semanal, 2),
                'semanas_transcurridas' => $semanas_transcurridas,
                'monto_justificado' => round($monto_justificado, 2),
                'deuda_mes_actual' => round($deuda_mes_actual, 2),
                'deuda_acumulada' => round($deuda_anterior, 2),
                'deuda_en_pesos' => round($deuda_total, 2),
                'costo_por_hora' => $this->costo_hora_faltante,
                'porcentaje_cumplido' => $porcentaje_cumplido,
                'estado' => $estado
            ];
        } catch (\PDOException $e) {
            error_log("Error en obtenerDeudaActual: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());

            return [
                'mes' => date('n'),
                'anio' => date('Y'),
                'horas_requeridas_mensuales' => $this->horas_mensuales_requeridas,
                'horas_requeridas_semanales' => $this->horas_semanales_requeridas,
                'horas_trabajadas' => 0,
                'horas_justificadas' => 0,
                'horas_efectivas' => 0,
                'horas_faltantes' => $this->horas_mensuales_requeridas,
                'horas_excedentes' => 0,
                'promedio_semanal' => 0,
                'semanas_transcurridas' => 1,
                'monto_justificado' => 0,
                'deuda_mes_actual' => $this->horas_mensuales_requeridas * $this->costo_hora_faltante,
                'deuda_acumulada' => 0,
                'deuda_en_pesos' => $this->horas_mensuales_requeridas * $this->costo_hora_faltante,
                'costo_por_hora' => $this->costo_hora_faltante,
                'porcentaje_cumplido' => 0,
                'estado' => 'pendiente'
            ];
        }
    }

    /**
     * Calcular deuda acumulada de meses anteriores
     * Suma las horas faltantes de todos los meses anteriores × $160
     */
    private function calcularDeudaAcumulada($id_usuario, $mes_actual, $anio_actual)
    {
        try {
            // Obtener meses anteriores
            $stmt = $this->conn->prepare("
                SELECT DISTINCT YEAR(fecha) as anio, MONTH(fecha) as mes
                FROM Registro_Horas
                WHERE id_usuario = :id_usuario
                AND (
                    YEAR(fecha) < :anio_actual OR 
                    (YEAR(fecha) = :anio_actual AND MONTH(fecha) < :mes_actual)
                )
                ORDER BY anio, mes
            ");

            $stmt->execute([
                'id_usuario' => $id_usuario,
                'anio_actual' => $anio_actual,
                'mes_actual' => $mes_actual
            ]);

            $meses_anteriores = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $deuda_acumulada = 0;

            foreach ($meses_anteriores as $periodo) {
                // ✅ VERIFICAR SI YA FUE PAGADA
                $stmtPagada = $this->conn->prepare("
                    SELECT COUNT(*) as pagada
                    FROM Pagos_Cuotas pc
                    INNER JOIN Cuotas_Mensuales cm ON pc.id_cuota = cm.id_cuota
                    WHERE cm.id_usuario = :id_usuario
                    AND cm.mes = :mes
                    AND cm.anio = :anio
                    AND pc.incluye_deuda_horas = TRUE
                    AND pc.estado_validacion = 'aprobado'
                ");

                $stmtPagada->execute([
                    'id_usuario' => $id_usuario,
                    'mes' => $periodo['mes'],
                    'anio' => $periodo['anio']
                ]);

                $pagada = $stmtPagada->fetchColumn();

                // Si ya fue pagada, saltar este mes
                if ($pagada > 0) {
                    error_log("Mes {$periodo['mes']}/{$periodo['anio']} - Deuda ya pagada, omitiendo");
                    continue;
                }

                // Obtener horas trabajadas
                $stmtHoras = $this->conn->prepare("
                    SELECT COALESCE(SUM(total_horas), 0) as total_horas
                    FROM Registro_Horas
                    WHERE id_usuario = :id_usuario
                    AND MONTH(fecha) = :mes
                    AND YEAR(fecha) = :anio
                    AND hora_salida IS NOT NULL
                    AND total_horas > 0
                ");

                $stmtHoras->execute([
                    'id_usuario' => $id_usuario,
                    'mes' => $periodo['mes'],
                    'anio' => $periodo['anio']
                ]);

                $horas_mes = (float)$stmtHoras->fetchColumn();

                // ⭐ CAMBIO: Comparar con 84h mensuales
                if ($horas_mes < $this->horas_mensuales_requeridas) {
                    $horas_faltantes = $this->horas_mensuales_requeridas - $horas_mes;
                    $deuda_mes = $horas_faltantes * $this->costo_hora_faltante;
                    $deuda_acumulada += $deuda_mes;

                    error_log("Mes {$periodo['mes']}/{$periodo['anio']}: {$horas_mes}h trabajadas, faltan {$horas_faltantes}h = \${$deuda_mes}");
                }
            }

            error_log("Deuda acumulada total: $" . $deuda_acumulada);
            return $deuda_acumulada;
        } catch (\PDOException $e) {
            error_log("Error en calcularDeudaAcumulada: " . $e->getMessage());
            return 0;
        }
    }



    /**
     * Obtener historial de los últimos N meses
     * Resumen mensual de horas trabajadas
     */
    public function obtenerHistorialMensual($id_usuario, $meses = 6)
    {
        try {
            error_log("=== obtenerHistorialMensual ===");
            error_log("ID Usuario: " . $id_usuario);
            error_log("Meses: " . $meses);

            $stmt = $this->conn->prepare("
                SELECT 
                    YEAR(fecha) as anio,
                    MONTH(fecha) as mes,
                    COUNT(DISTINCT fecha) as dias_trabajados,
                    SUM(total_horas) as total_horas,
                    :horas_requeridas as horas_requeridas
                FROM Registro_Horas
                WHERE id_usuario = :id_usuario
                AND hora_salida IS NOT NULL
                AND total_horas > 0
                AND fecha >= DATE_SUB(CURDATE(), INTERVAL :meses MONTH)
                GROUP BY YEAR(fecha), MONTH(fecha)
                ORDER BY anio DESC, mes DESC
            ");

            $stmt->execute([
                'id_usuario' => $id_usuario,
                'meses' => $meses,
                'horas_requeridas' => $this->horas_mensuales_requeridas
            ]);

            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            error_log("Meses encontrados: " . count($resultados));

            return $resultados;
        } catch (\PDOException $e) {
            error_log("Error en obtenerHistorialMensual: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    
    public function obtenerHistorialDeuda($id_usuario, $limite = 20)
    {
        try {
            error_log("=== obtenerHistorialDeuda ===");
            error_log("ID Usuario: " . $id_usuario);
            error_log("Límite: " . $limite);

            $historial = [];

            // 1️⃣ OBTENER REGISTROS DE HORAS MENSUALES
            $stmt = $this->conn->prepare("
            SELECT 
                YEAR(fecha) as anio,
                MONTH(fecha) as mes,
                DATE_FORMAT(MIN(fecha), '%Y-%m-%d') as fecha_inicio,
                DATE_FORMAT(MAX(fecha), '%Y-%m-%d') as fecha_fin,
                COALESCE(SUM(total_horas), 0) as horas_trabajadas,
                COUNT(DISTINCT fecha) as dias_trabajados,
                'trabajo' as tipo
            FROM Registro_Horas
            WHERE id_usuario = :id_usuario
            AND hora_salida IS NOT NULL
            AND total_horas > 0
            GROUP BY YEAR(fecha), MONTH(fecha)
            ORDER BY anio DESC, mes DESC
            LIMIT :limite
        ");

            $stmt->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
            $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
            $stmt->execute();

            $meses_trabajo = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($meses_trabajo as $mes) {
                $horas_trabajadas = (float)$mes['horas_trabajadas'];

                // Obtener justificaciones del mes
                $stmtJust = $this->conn->prepare("
                SELECT 
                    COALESCE(SUM(horas_justificadas), 0) as horas_justificadas,
                    COALESCE(SUM(monto_descontado), 0) as monto_descontado
                FROM Justificaciones_Horas
                WHERE id_usuario = :id_usuario
                AND mes = :mes
                AND anio = :anio
                AND estado = 'aprobada'
            ");

                $stmtJust->execute([
                    'id_usuario' => $id_usuario,
                    'mes' => $mes['mes'],
                    'anio' => $mes['anio']
                ]);

                $just = $stmtJust->fetch(PDO::FETCH_ASSOC);
                $horas_justificadas = (float)($just['horas_justificadas'] ?? 0);
                $monto_justificado = (float)($just['monto_descontado'] ?? 0);

                // Calcular con justificaciones
                $horas_efectivas = $horas_trabajadas + $horas_justificadas;
                $horas_faltantes_real = max(0, $this->horas_mensuales_requeridas - $horas_efectivas);
                $horas_excedentes = max(0, $horas_efectivas - $this->horas_mensuales_requeridas);
                $deuda_final = $horas_faltantes_real * $this->costo_hora_faltante;

                // ✅ Verificar si fue pagada
                $stmtPagada = $this->conn->prepare("
                SELECT COUNT(*) as pagada
                FROM Pagos_Cuotas pc
                INNER JOIN Cuotas_Mensuales cm ON pc.id_cuota = cm.id_cuota
                WHERE cm.id_usuario = :id_usuario
                AND cm.mes = :mes
                AND cm.anio = :anio
                AND pc.incluye_deuda_horas = 1
                AND pc.estado_validacion = 'aprobado'
            ");

                $stmtPagada->execute([
                    'id_usuario' => $id_usuario,
                    'mes' => $mes['mes'],
                    'anio' => $mes['anio']
                ]);

                $fue_pagada = $stmtPagada->fetchColumn() > 0;

                $historial[] = [
                    'fecha' => $mes['fecha_fin'],
                    'tipo' => 'cierre_mes',
                    'mes' => (int)$mes['mes'],
                    'anio' => (int)$mes['anio'],
                    'mes_nombre' => $this->getNombreMes($mes['mes']),
                    'descripcion' => "Cierre mensual - {$mes['dias_trabajados']} días trabajados",
                    'horas_requeridas' => $this->horas_mensuales_requeridas,
                    'horas_trabajadas' => round($horas_trabajadas, 2),
                    'horas_justificadas' => round($horas_justificadas, 2),
                    'horas_efectivas' => round($horas_efectivas, 2),
                    'horas_faltantes' => round($horas_faltantes_real, 2),
                    'horas_excedentes' => round($horas_excedentes, 2),
                    'monto_justificado' => round($monto_justificado, 2),
                    'deuda_generada' => round($deuda_final, 2),
                    'fue_pagada' => $fue_pagada,
                    'estado' => $fue_pagada ? 'pagado' : ($horas_efectivas >= $this->horas_mensuales_requeridas ? 'cumplido' : 'deuda'),
                    'icono' => $fue_pagada ? '💰' : ($horas_efectivas >= $this->horas_mensuales_requeridas ? '✅' : '⚠')
                ];
            }

            // 2️⃣ OBTENER JUSTIFICACIONES APROBADAS
            $stmtJustif = $this->conn->prepare("
            SELECT 
                id_justificacion,
                mes,
                anio,
                fecha_justificacion,
                motivo,
                horas_justificadas,
                monto_descontado,
                observaciones,
                archivo_adjunto,
                'justificacion' as tipo
            FROM Justificaciones_Horas
            WHERE id_usuario = :id_usuario
            AND estado = 'aprobada'
            ORDER BY anio DESC, mes DESC, fecha_justificacion DESC
            LIMIT :limite
        ");

            $stmtJustif->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
            $stmtJustif->bindValue(':limite', $limite, PDO::PARAM_INT);
            $stmtJustif->execute();

            $justificaciones = $stmtJustif->fetchAll(PDO::FETCH_ASSOC);

            foreach ($justificaciones as $just) {
                $historial[] = [
                    'fecha' => $just['fecha_justificacion'],
                    'tipo' => 'justificacion',
                    'mes' => (int)$just['mes'],
                    'anio' => (int)$just['anio'],
                    'mes_nombre' => $this->getNombreMes($just['mes']),
                    'descripcion' => "Justificación aprobada: " . $just['motivo'],
                    'horas_justificadas' => round((float)$just['horas_justificadas'], 2),
                    'monto_descontado' => round((float)$just['monto_descontado'], 2),
                    'deuda_reducida' => round((float)$just['monto_descontado'], 2),
                    'observaciones' => $just['observaciones'] ?? '',
                    'archivo_adjunto' => $just['archivo_adjunto'] ?? null,
                    'estado' => 'aprobada',
                    'icono' => '📋'
                ];
            }

            // 3️⃣ OBTENER PAGOS RELACIONADOS CON DEUDA DE HORAS
            $stmtPagos = $this->conn->prepare("
            SELECT 
                pc.id_pago,
                pc.fecha_pago,
                pc.monto_pagado,
                pc.monto_deuda_horas,
                cm.mes,
                cm.anio,
                pc.metodo_pago,
                pc.comprobante_archivo,
                pc.numero_comprobante,
                'pago' as tipo
            FROM Pagos_Cuotas pc
            INNER JOIN Cuotas_Mensuales cm ON pc.id_cuota = cm.id_cuota
            WHERE cm.id_usuario = :id_usuario
            AND pc.incluye_deuda_horas = 1
            AND pc.estado_validacion = 'aprobado'
            ORDER BY pc.fecha_pago DESC
            LIMIT :limite
        ");

            $stmtPagos->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
            $stmtPagos->bindValue(':limite', $limite, PDO::PARAM_INT);
            $stmtPagos->execute();

            $pagos = $stmtPagos->fetchAll(PDO::FETCH_ASSOC);

            foreach ($pagos as $pago) {
                $historial[] = [
                    'fecha' => $pago['fecha_pago'],
                    'tipo' => 'pago',
                    'mes' => (int)$pago['mes'],
                    'anio' => (int)$pago['anio'],
                    'mes_nombre' => $this->getNombreMes($pago['mes']),
                    'descripcion' => "Pago de deuda de horas - " . ucfirst($pago['metodo_pago']),
                    'monto_pagado' => round((float)$pago['monto_pagado'], 2),
                    'monto_deuda_horas' => round((float)$pago['monto_deuda_horas'], 2),
                    'deuda_saldada' => round((float)$pago['monto_deuda_horas'], 2),
                    'metodo_pago' => $pago['metodo_pago'],
                    'comprobante' => $pago['comprobante_archivo'] ?? '',
                    'numero_comprobante' => $pago['numero_comprobante'] ?? '',
                    'estado' => 'pagado',
                    'icono' => '💰'
                ];
            }

            // 4️⃣ ORDENAR TODO POR FECHA DESCENDENTE
            usort($historial, function ($a, $b) {
                return strtotime($b['fecha']) - strtotime($a['fecha']);
            });

            // Limitar al máximo solicitado
            $historial = array_slice($historial, 0, $limite);

            error_log("Total registros en historial: " . count($historial));

            return $historial;
        } catch (\PDOException $e) {
            error_log("Error en obtenerHistorialDeuda: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Obtener nombre del mes en español
     */
    private function getNombreMes($num_mes)
    {
        $meses = [
            1 => 'Enero',
            2 => 'Febrero',
            3 => 'Marzo',
            4 => 'Abril',
            5 => 'Mayo',
            6 => 'Junio',
            7 => 'Julio',
            8 => 'Agosto',
            9 => 'Septiembre',
            10 => 'Octubre',
            11 => 'Noviembre',
            12 => 'Diciembre'
        ];

        return $meses[$num_mes] ?? 'Desconocido';
    }
}
