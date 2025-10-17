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
            
            error_log("Horas trabajadas este mes: " . $horas_trabajadas . "h");
            error_log("Horas requeridas mensuales: " . $this->horas_mensuales_requeridas . "h (21h/semana × 4)");
            
            // Calcular horas faltantes o excedentes
            $horas_faltantes = max(0, $this->horas_mensuales_requeridas - $horas_trabajadas);
            $horas_excedentes = max(0, $horas_trabajadas - $this->horas_mensuales_requeridas);
            
            // CALCULAR DEUDA EN PESOS: Horas faltantes × $160
            $deuda_mes_actual = $horas_faltantes * $this->costo_hora_faltante;
            
            // Obtener deuda acumulada de meses anteriores
            $deuda_anterior = $this->calcularDeudaAcumulada($id_usuario, $mes_actual, $anio_actual);
            
            // Deuda total = deuda del mes actual + deuda acumulada
            $deuda_total = $deuda_mes_actual + $deuda_anterior;
            
            $porcentaje_cumplido = $this->horas_mensuales_requeridas > 0 
                ? round(($horas_trabajadas / $this->horas_mensuales_requeridas) * 100, 2)
                : 0;

            // Determinar estado
            $estado = 'pendiente';
            if ($horas_trabajadas >= $this->horas_mensuales_requeridas) {
                $estado = 'cumplido';
            } elseif ($horas_trabajadas > 0) {
                $estado = 'progreso';
            }

            // Calcular promedio semanal
            $semana_actual = date('W');
            $semana_inicio_mes = date('W', strtotime(date('Y-m-01')));
            $semanas_transcurridas = max(1, $semana_actual - $semana_inicio_mes + 1);
            $promedio_semanal = $semanas_transcurridas > 0 ? $horas_trabajadas / $semanas_transcurridas : 0;

            error_log("Horas faltantes: " . $horas_faltantes . "h");
            error_log("Deuda mes actual: $" . $deuda_mes_actual);
            error_log("Deuda acumulada: $" . $deuda_anterior);
            error_log("Deuda total: $" . $deuda_total);
            error_log("Porcentaje cumplido: " . $porcentaje_cumplido . "%");
            error_log("Promedio semanal: " . round($promedio_semanal, 2) . "h/semana");

            return [
                'mes' => $mes_actual,
                'anio' => $anio_actual,
                'horas_requeridas_mensuales' => $this->horas_mensuales_requeridas,
                'horas_requeridas_semanales' => $this->horas_semanales_requeridas,
                'horas_trabajadas' => round($horas_trabajadas, 2),
                'horas_faltantes' => round($horas_faltantes, 2),
                'horas_excedentes' => round($horas_excedentes, 2),
                'promedio_semanal' => round($promedio_semanal, 2),
                'semanas_transcurridas' => $semanas_transcurridas,
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
                'horas_faltantes' => $this->horas_mensuales_requeridas,
                'horas_excedentes' => 0,
                'promedio_semanal' => 0,
                'semanas_transcurridas' => 1,
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
}