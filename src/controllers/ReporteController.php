<?php

namespace App\controllers;

use App\models\Reporte;
use App\utils\Herramientas;



class ReporteController
{
    private $reporteModel;

    public function __construct()
    {
        $this->reporteModel = new Reporte();
    }

    
    /**
 * Generar reporte mensual completo
 */
public function generarReporteMensual()
{
    error_log("=== INICIO generarReporteMensual ===");
    error_log("GET params: " . print_r($_GET, true));
    
    try {
        Herramientas::validarAdmin();

        $mes = $_GET['mes'] ?? date('n');
        $anio = $_GET['anio'] ?? date('Y');

        error_log("Procesando: mes=$mes, anio=$anio");

        // Validar mes y año
        if ($mes < 1 || $mes > 12 || $anio < 2024 || $anio > 2030) {
            error_log("ERROR: Mes o año inválido");
            Herramientas::jsonResponse(false, 'Mes o año inválido', [], 400);
            return;
        }

        $reporte = $this->reporteModel->generarReporteMensual($mes, $anio);

        if ($reporte) {
            error_log(" Reporte generado exitosamente");
            Herramientas::jsonResponse(true, 'Reporte generado exitosamente', [
                'reporte' => $reporte
            ]);
        } else {
            error_log("ERROR: Reporte retornó null");
            Herramientas::jsonResponse(false, 'No se pudo generar el reporte', [], 500);
        }
    } catch (\Exception $e) {
        error_log("💥 EXCEPCIÓN en generarReporteMensual: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        Herramientas::jsonResponse(false, 'Error del servidor: ' . $e->getMessage(), [], 500);
    }
}

    /**
     * Obtener resumen de horas por usuario
     */
     public function getResumenHorasMensual()
    {
        try {
            Herramientas::validarAdmin();

            $mes = $_GET['mes'] ?? date('n');
            $anio = $_GET['anio'] ?? date('Y');

            $resumen = $this->reporteModel->getResumenHorasPorUsuario($mes, $anio);

            Herramientas::jsonResponse(true, 'Resumen obtenido', [
                'resumen' => $resumen,
                'periodo' => ['mes' => $mes, 'anio' => $anio]
            ]);
        } catch (\Exception $e) {
            error_log("Error en getResumenHorasMensual: " . $e->getMessage());
            Herramientas::jsonResponse(false, 'Error del servidor', [], 500);
        }
    }

    /**
     * Obtener resumen de tareas por usuario
     */
    public function getResumenTareasMensual()
    {
        try {
            Herramientas::validarAdmin();

            $mes = $_GET['mes'] ?? date('n');
            $anio = $_GET['anio'] ?? date('Y');

            $resumen = $this->reporteModel->getResumenTareasPorUsuario($mes, $anio);

            Herramientas::jsonResponse(true, 'Resumen obtenido', [
                'resumen' => $resumen
            ]);
        } catch (\Exception $e) {
            error_log("Error en getResumenTareasMensual: " . $e->getMessage());
            Herramientas::jsonResponse(false, 'Error del servidor', [], 500);
        }
    }

    /**
     * Obtener resumen de cuotas del mes
     */
   public function getResumenCuotasMensual()
    {
        try {
            Herramientas::validarAdmin();

            $mes = $_GET['mes'] ?? date('n');
            $anio = $_GET['anio'] ?? date('Y');

            $resumen = $this->reporteModel->getResumenCuotasPorUsuario($mes, $anio);

            Herramientas::jsonResponse(true, 'Resumen obtenido', [
                'resumen' => $resumen
            ]);
        } catch (\Exception $e) {
            error_log("Error en getResumenCuotasMensual: " . $e->getMessage());
            Herramientas::jsonResponse(false, 'Error del servidor', [], 500);
        }
    }

    /**
     * Generar reporte completo en formato exportable
     */
    public function exportarReporteMensual()
    {
        try {
            Herramientas::validarAdmin();

            $mes = $_GET['mes'] ?? date('n');
            $anio = $_GET['anio'] ?? date('Y');
            $formato = $_GET['formato'] ?? 'json';

            $reporte = $this->reporteModel->generarReporteMensual($mes, $anio);

            if (!$reporte) {
                Herramientas::jsonResponse(false, 'Error al generar reporte', [], 500);
                return;
            }

            switch ($formato) {
                case 'csv':
                    $this->exportarCSV($reporte, $mes, $anio);
                    break;
                    
                case 'json':
                default:
                    Herramientas::jsonResponse(true, 'Reporte exportado', [
                        'reporte' => $reporte
                    ]);
                    break;
            }
        } catch (\Exception $e) {
            error_log("Error en exportarReporteMensual: " . $e->getMessage());
            Herramientas::jsonResponse(false, 'Error del servidor', [], 500);
        }
    }

    /**
     * Exportar reporte a CSV
     */
    private function exportarCSV($reporte, $mes, $anio)
    {
        $nombreMes = $this->getNombreMes($mes);
        $filename = "reporte_{$nombreMes}_{$anio}.csv";

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $output = fopen('php://output', 'w');

        // BOM para UTF-8
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

        // Cabecera
        fputcsv($output, [
            'Usuario',
            'Cédula',
            'Email',
            'Vivienda',
            'Horas Trabajadas',
            'Horas Requeridas',
            'Cumplimiento %',
            'Deuda Horas ($)',
            'Tareas Asignadas',
            'Tareas Completadas',
            'Estado Cuota',
            'Monto Cuota',
            'Estado General'
        ]);

        // Datos
        foreach ($reporte['usuarios'] as $usuario) {
            fputcsv($output, [
                $usuario['nombre_completo'],
                $usuario['cedula'],
                $usuario['email'],
                $usuario['vivienda'] ?? 'Sin asignar',
                $usuario['horas_trabajadas'],
                $usuario['horas_requeridas'],
                $usuario['porcentaje_cumplimiento'] . '%',
                '$' . number_format($usuario['deuda_horas'], 2),
                $usuario['tareas_asignadas'],
                $usuario['tareas_completadas'],
                $usuario['estado_cuota'],
                '$' . number_format($usuario['monto_cuota'], 2),
                $usuario['estado_general']
            ]);
        }

        fclose($output);
        exit;
    }

    /**
     * Obtener estadísticas generales
     */
    public function getEstadisticasGenerales()
    {
        try {
            Herramientas::validarAdmin();

            $mes = $_GET['mes'] ?? date('n');
            $anio = $_GET['anio'] ?? date('Y');

            $stats = $this->reporteModel->getEstadisticasGenerales($mes, $anio);

            Herramientas::jsonResponse(true, 'Estadísticas obtenidas', [
                'estadisticas' => $stats
            ]);
        } catch (\Exception $e) {
            error_log("Error en getEstadisticasGenerales: " . $e->getMessage());
            Herramientas::jsonResponse(false, 'Error del servidor', [], 500);
        }
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