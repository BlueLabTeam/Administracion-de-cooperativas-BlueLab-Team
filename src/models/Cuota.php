<?php

namespace App\models;

use App\config\Database;
use PDO;

class Cuota
{
    private $conn;
    private $horas_mensuales_requeridas = 84;

    public function __construct()
    {
        $this->conn = Database::getConnection();
        
        // Deshabilitar ONLY_FULL_GROUP_BY para esta conexion
        try {
            $this->conn->exec("SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))");
        } catch (\PDOException $e) {
            error_log("Warning: No se pudo cambiar sql_mode: " . $e->getMessage());
        }
    }

    /**
     * Generar cuotas mensuales masivas
     */
    public function generarCuotasMensuales($mes, $anio)
    {
        try {
            error_log("=== [generarCuotasMensuales] Mes: $mes, Año: $anio ===");
            
            $this->conn->beginTransaction();
            
            // 1. Obtener TODOS los usuarios aceptados
            $stmtUsuarios = $this->conn->prepare("
                SELECT DISTINCT u.id_usuario
                FROM Usuario u
                WHERE u.estado = 'aceptado'
                ORDER BY u.id_usuario
            ");
            
            $stmtUsuarios->execute();
            $usuarios = $stmtUsuarios->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("Usuarios encontrados: " . count($usuarios));
            
            if (empty($usuarios)) {
                $this->conn->rollBack();
                return [
                    'success' => false,
                    'message' => 'No se encontraron usuarios activos'
                ];
            }
            
            $cuotasGeneradas = 0;
            $cuotasExistentes = 0;
            $cuotasSinVivienda = 0;
            $errores = [];
            
            foreach ($usuarios as $usuario) {
                try {
                    $idUsuario = $usuario['id_usuario'];
                    
                    // Verificar si ya existe
                    $stmtCheck = $this->conn->prepare("
                        SELECT COUNT(*) as existe
                        FROM Cuotas_Mensuales
                        WHERE id_usuario = ?
                        AND mes = ?
                        AND anio = ?
                    ");
                    $stmtCheck->execute([$idUsuario, $mes, $anio]);
                    $existe = $stmtCheck->fetch(PDO::FETCH_ASSOC)['existe'];
                    
                    if ($existe > 0) {
                        $cuotasExistentes++;
                        continue;
                    }
                    
                    // Buscar vivienda
                    $stmtVivienda = $this->conn->prepare("
                        SELECT av.id_vivienda, v.id_tipo
                        FROM Asignacion_Vivienda av
                        INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                        WHERE av.id_usuario = ?
                        AND av.activa = 1
                        LIMIT 1
                    ");
                    $stmtVivienda->execute([$idUsuario]);
                    $vivienda = $stmtVivienda->fetch(PDO::FETCH_ASSOC);
                    
                    // Si no tiene vivienda personal, buscar por nucleo
                    if (!$vivienda) {
                        $stmtViviendaNucleo = $this->conn->prepare("
                            SELECT av.id_vivienda, v.id_tipo
                            FROM Asignacion_Vivienda av
                            INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                            INNER JOIN Usuario u ON av.id_nucleo = u.id_nucleo
                            WHERE u.id_usuario = ?
                            AND av.activa = 1
                            LIMIT 1
                        ");
                        $stmtViviendaNucleo->execute([$idUsuario]);
                        $vivienda = $stmtViviendaNucleo->fetch(PDO::FETCH_ASSOC);
                    }
                    
                    $idVivienda = null;
                    $montoBase = 0;
                    $pendienteAsignacion = 0;
                    
                    if ($vivienda) {
                        $idVivienda = $vivienda['id_vivienda'];
                        
                        $stmtPrecio = $this->conn->prepare("
                            SELECT monto_mensual
                            FROM Config_Cuotas
                            WHERE id_tipo = ?
                            AND activo = 1
                            LIMIT 1
                        ");
                        $stmtPrecio->execute([$vivienda['id_tipo']]);
                        $config = $stmtPrecio->fetch(PDO::FETCH_ASSOC);
                        
                        $montoBase = $config ? floatval($config['monto_mensual']) : 0;
                    } else {
                        $pendienteAsignacion = 1;
                        $cuotasSinVivienda++;
                    }
                    
                    // Calcular deuda anterior
                    $stmtDeuda = $this->conn->prepare("
                        SELECT COALESCE(SUM(monto + monto_pendiente_anterior), 0) as deuda
                        FROM Cuotas_Mensuales
                        WHERE id_usuario = ?
                        AND estado != 'pagada'
                        AND (anio < ? OR (anio = ? AND mes < ?))
                    ");
                    $stmtDeuda->execute([$idUsuario, $anio, $anio, $mes]);
                    $deudaAnterior = floatval($stmtDeuda->fetch(PDO::FETCH_ASSOC)['deuda']);
                    
                    // Calcular horas cumplidas
                    $horasCumplidas = $this->calcularHorasCumplidasMes($idUsuario, $mes, $anio);
                    
                    // Fecha de vencimiento
                    $fechaVencimiento = date('Y-m-t', strtotime("$anio-$mes-01"));
                    
                    // Insertar cuota
                    $stmtInsert = $this->conn->prepare("
                        INSERT INTO Cuotas_Mensuales 
                        (id_usuario, id_vivienda, mes, anio, monto, monto_pendiente_anterior, 
                         fecha_vencimiento, horas_requeridas, horas_cumplidas, estado, 
                         pendiente_asignacion, observaciones)
                        VALUES 
                        (?, ?, ?, ?, ?, ?, ?, 84.00, ?, 'pendiente', ?, ?)
                    ");
                    
                    $stmtInsert->execute([
                        $idUsuario,
                        $idVivienda,
                        $mes,
                        $anio,
                        $montoBase,
                        $deudaAnterior,
                        $fechaVencimiento,
                        $horasCumplidas,
                        $pendienteAsignacion,
                        $pendienteAsignacion ? 'Pendiente: Asignar vivienda' : null
                    ]);
                    
                    $cuotasGeneradas++;
                    
                } catch (\PDOException $e) {
                    error_log("Error al generar cuota para usuario $idUsuario: " . $e->getMessage());
                    $errores[] = "Usuario $idUsuario: {$e->getMessage()}";
                }
            }
            
            $this->conn->commit();
            
            $mensaje = "Se generaron $cuotasGeneradas cuotas correctamente";
            if ($cuotasExistentes > 0) {
                $mensaje .= " ($cuotasExistentes ya existian)";
            }
            if ($cuotasSinVivienda > 0) {
                $mensaje .= ". $cuotasSinVivienda usuarios sin vivienda asignada";
            }
            
            return [
                'success' => true,
                'message' => $mensaje,
                'cuotas_generadas' => $cuotasGeneradas,
                'cuotas_existentes' => $cuotasExistentes,
                'cuotas_sin_vivienda' => $cuotasSinVivienda,
                'errores' => $errores
            ];
            
        } catch (\PDOException $e) {
            $this->conn->rollBack();
            error_log("Error critico al generar cuotas: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al generar cuotas: ' . $e->getMessage()
            ];
        }
    }


    public function recalcularDeudaAcumulada($idUsuario)
{
    try {
        error_log("🔄 [recalcularDeudaAcumulada] Usuario: $idUsuario");
        
        // Obtener todas las cuotas NO pagadas ordenadas cronológicamente
        $stmt = $this->conn->prepare("
            SELECT 
                id_cuota,
                mes,
                anio,
                monto,
                estado,
                monto_pendiente_anterior
            FROM Cuotas_Mensuales
            WHERE id_usuario = ?
            ORDER BY anio ASC, mes ASC
        ");
        $stmt->execute([$idUsuario]);
        $cuotas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $deudaAcumulada = 0;
        $actualizaciones = 0;
        
        foreach ($cuotas as $cuota) {
            if ($cuota['estado'] === 'pagada') {
                // Si está pagada, no contribuye a la deuda acumulada
                $deudaAcumulada = 0; // Resetear deuda
            } else {
                // Actualizar monto_pendiente_anterior de esta cuota
                $stmtUpdate = $this->conn->prepare("
                    UPDATE Cuotas_Mensuales
                    SET monto_pendiente_anterior = ?
                    WHERE id_cuota = ?
                ");
                $stmtUpdate->execute([$deudaAcumulada, $cuota['id_cuota']]);
                
                // Acumular deuda para la siguiente cuota
                $deudaAcumulada += $cuota['monto'];
                $actualizaciones++;
                
                error_log("  - Cuota {$cuota['mes']}/{$cuota['anio']}: deuda_anterior = {$cuota['monto_pendiente_anterior']} → $deudaAcumulada");
            }
        }
        
        error_log("✓ Recalculadas $actualizaciones cuotas");
        
        return [
            'success' => true,
            'cuotas_actualizadas' => $actualizaciones
        ];
        
    } catch (\PDOException $e) {
        error_log("💥 Error en recalcularDeudaAcumulada: " . $e->getMessage());
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

/**
 * ✅ Obtener resumen de deuda del usuario
 */
public function getResumenDeuda($idUsuario)
{
    try {
        $stmt = $this->conn->prepare("
            SELECT 
                COUNT(*) as total_cuotas_pendientes,
                SUM(monto) as deuda_mensualidades,
                SUM(monto_pendiente_anterior) as deuda_acumulada_anterior,
                SUM(monto + monto_pendiente_anterior) as deuda_total
            FROM Cuotas_Mensuales
            WHERE id_usuario = ?
            AND estado != 'pagada'
        ");
        
        $stmt->execute([$idUsuario]);
        $resumen = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'resumen' => [
                'cuotas_pendientes' => intval($resumen['total_cuotas_pendientes'] ?? 0),
                'deuda_mensualidades' => floatval($resumen['deuda_mensualidades'] ?? 0),
                'deuda_acumulada' => floatval($resumen['deuda_acumulada_anterior'] ?? 0),
                'total_a_pagar' => floatval($resumen['deuda_total'] ?? 0)
            ]
        ];
        
    } catch (\PDOException $e) {
        error_log("Error en getResumenDeuda: " . $e->getMessage());
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

    /**
     * Generar cuota individual
     */
    public function generarCuotaIndividual($idUsuario, $mes, $anio)
    {
        try {
            error_log("===========================================");
            error_log("📝 [generarCuotaIndividual] INICIO");
            error_log("Usuario: $idUsuario | Mes: $mes | Año: $anio");

            // Verificar si ya existe
            $cuotasExistentes = $this->getCuotasUsuario($idUsuario, [
                'mes' => $mes,
                'anio' => $anio
            ]);

            if (count($cuotasExistentes) > 0) {
                error_log(" Cuota ya existe: ID " . $cuotasExistentes[0]['id_cuota']);
                error_log("===========================================");
                return [
                    'success' => true,
                    'message' => 'La cuota del mes ya existe',
                    'cuota_id' => $cuotasExistentes[0]['id_cuota'],
                    'cuota' => $cuotasExistentes[0]
                ];
            }

            error_log("🔍 No existe cuota, procediendo a crear...");

            // Buscar vivienda personal
            $stmtVivienda = $this->conn->prepare("
                SELECT av.id_vivienda, v.id_tipo
                FROM Asignacion_Vivienda av
                INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                WHERE av.id_usuario = ?
                AND av.activa = 1
                LIMIT 1
            ");
            $stmtVivienda->execute([$idUsuario]);
            $vivienda = $stmtVivienda->fetch(PDO::FETCH_ASSOC);

            // Si no tiene vivienda personal, buscar por nucleo
            if (!$vivienda) {
                error_log("🔍 No tiene vivienda personal, buscando por núcleo...");
                $stmtViviendaNucleo = $this->conn->prepare("
                    SELECT av.id_vivienda, v.id_tipo
                    FROM Asignacion_Vivienda av
                    INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
                    INNER JOIN Usuario u ON av.id_nucleo = u.id_nucleo
                    WHERE u.id_usuario = ?
                    AND av.activa = 1
                    LIMIT 1
                ");
                $stmtViviendaNucleo->execute([$idUsuario]);
                $vivienda = $stmtViviendaNucleo->fetch(PDO::FETCH_ASSOC);
            }

            $idVivienda = null;
            $montoCuota = 0;
            $pendienteAsignacion = 0;

            if ($vivienda) {
                $idVivienda = $vivienda['id_vivienda'];
                
                $stmtPrecio = $this->conn->prepare("
                    SELECT monto_mensual
                    FROM Config_Cuotas
                    WHERE id_tipo = ?
                    AND activo = 1
                    LIMIT 1
                ");
                $stmtPrecio->execute([$vivienda['id_tipo']]);
                $config = $stmtPrecio->fetch(PDO::FETCH_ASSOC);

                $montoCuota = $config ? floatval($config['monto_mensual']) : 0;
                error_log(" Vivienda encontrada - ID: $idVivienda - Monto: $$montoCuota");
            } else {
                $pendienteAsignacion = 1;
                error_log("⚠️ Usuario sin vivienda - Cuota creada con monto = 0");
            }

            // 💰 CALCULAR DEUDA ACUMULADA CORRECTAMENTE
// Incluir TODAS las cuotas pendientes/vencidas de meses anteriores
// INCLUYENDO la deuda por horas no trabajadas
$stmtDeuda = $this->conn->prepare("
    SELECT 
        COALESCE(SUM(
            monto + 
            monto_pendiente_anterior + 
            (GREATEST(0, horas_requeridas - horas_cumplidas - COALESCE(
                (SELECT SUM(horas_justificadas) 
                 FROM Justificaciones_Horas jh 
                 WHERE jh.id_usuario = cm.id_usuario 
                 AND jh.mes = cm.mes 
                 AND jh.anio = cm.anio 
                 AND jh.estado = 'aprobada'), 0
            )) * 160)
        ), 0) as deuda_anterior
    FROM Cuotas_Mensuales cm
    WHERE cm.id_usuario = ?
    AND cm.estado != 'pagada'
    AND (cm.anio < ? OR (cm.anio = ? AND cm.mes < ?))
");
$stmtDeuda->execute([$idUsuario, $anio, $anio, $mes]);
$deudaAnterior = floatval($stmtDeuda->fetchColumn());
error_log("💰 Deuda acumulada de meses anteriores: $$deudaAnterior");

            // Calcular horas cumplidas
            $horasCumplidas = $this->calcularHorasCumplidasMes($idUsuario, $mes, $anio);
            error_log("⏰ Horas cumplidas: $horasCumplidas");

            // Fecha de vencimiento
            $fechaVencimiento = date('Y-m-t', strtotime("$anio-$mes-01"));
            error_log("📅 Fecha vencimiento: $fechaVencimiento");

            // Insertar cuota
            $stmtInsert = $this->conn->prepare("
                INSERT INTO Cuotas_Mensuales 
                (id_usuario, id_vivienda, mes, anio, monto, monto_pendiente_anterior, 
                 fecha_vencimiento, horas_requeridas, horas_cumplidas, estado,
                 pendiente_asignacion, observaciones)
                VALUES 
                (?, ?, ?, ?, ?, ?, ?, 84.00, ?, 'pendiente', ?, ?)
            ");

            $insertSuccess = $stmtInsert->execute([
                $idUsuario,
                $idVivienda,
                $mes,
                $anio,
                $montoCuota,
                $deudaAnterior,
                $fechaVencimiento,
                $horasCumplidas,
                $pendienteAsignacion,
                $pendienteAsignacion ? 'Pendiente: Asignar vivienda' : null
            ]);

            if (!$insertSuccess) {
                $errorInfo = $stmtInsert->errorInfo();
                error_log(" Error al insertar: " . print_r($errorInfo, true));
                error_log("===========================================");
                return [
                    'success' => false,
                    'message' => 'Error al crear la cuota en la base de datos: ' . $errorInfo[2]
                ];
            }

            $nuevaCuotaId = $this->conn->lastInsertId();
            error_log(" Cuota creada con ID: $nuevaCuotaId");

            // Recuperar cuota completa
            $cuotaCreada = $this->getCuotaById($nuevaCuotaId);
            
            error_log(" Cuota recuperada correctamente");
            error_log("===========================================");
            
            return [
                'success' => true,
                'message' => $pendienteAsignacion 
                    ? 'Cuota generada. Esperando asignacion de vivienda.' 
                    : 'Cuota generada correctamente',
                'cuota' => $cuotaCreada,
                'cuota_id' => $nuevaCuotaId,
                'pendiente_asignacion' => $pendienteAsignacion
            ];

        } catch (\PDOException $e) {
            error_log(" Exception en generarCuotaIndividual: " . $e->getMessage());
            error_log(" Stack trace: " . $e->getTraceAsString());
            error_log("===========================================");
            return [
                'success' => false,
                'message' => 'Error al generar cuota: ' . $e->getMessage()
            ];
        }
    }
    /**
     * Calcular horas cumplidas del mes
     */
     private function calcularHorasCumplidasMes($idUsuario, $mes, $anio)
    {
        try {
            $stmt = $this->conn->prepare("
                SELECT COALESCE(SUM(total_horas), 0) as total
                FROM Registro_Horas
                WHERE id_usuario = ?
                AND MONTH(fecha) = ?
                AND YEAR(fecha) = ?
                AND estado = 'aprobado'
            ");
            $stmt->execute([$idUsuario, $mes, $anio]);
            
            return floatval($stmt->fetch(PDO::FETCH_ASSOC)['total']);
        } catch (\PDOException $e) {
            error_log("Error al calcular horas: " . $e->getMessage());
            return 0;
        }
    }
    /**
     * Obtener cuota por ID
     */
    public function getCuotaById($cuotaId)
    {
        try {
            // Intentar con vista primero
            $stmt = $this->conn->prepare("
                SELECT * FROM Vista_Cuotas_Con_Justificaciones
                WHERE id_cuota = ?
            ");
            $stmt->execute([$cuotaId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                return $result;
            }
            
            // Fallback: consulta directa
            error_log("⚠️ [getCuotaById] Vista no disponible, usando consulta directa");
            $stmt2 = $this->conn->prepare("
                SELECT cm.*, u.nombre_completo, u.email
                FROM Cuotas_Mensuales cm
                INNER JOIN Usuario u ON cm.id_usuario = u.id_usuario
                WHERE cm.id_cuota = ?
            ");
            $stmt2->execute([$cuotaId]);
            return $stmt2->fetch(PDO::FETCH_ASSOC);
            
        } catch (\PDOException $e) {
            error_log("Error en getCuotaById: " . $e->getMessage());
            return null;
        }
    }

       private function getCuotasUsuarioDirecto($idUsuario, $filtros = [])
{
    try {
        error_log("🔄 [getCuotasUsuarioDirecto] Usando consulta sin vista");
        
        $params = ['id_usuario' => $idUsuario];
        
        $sql = "
            SELECT 
                cm.id_cuota,
                cm.id_usuario,
                u.nombre_completo,
                u.email,
                cm.id_vivienda,
                CASE 
                    WHEN cm.id_vivienda IS NULL THEN 'SIN ASIGNAR'
                    ELSE v.numero_vivienda
                END as numero_vivienda,
                CASE 
                    WHEN cm.id_vivienda IS NULL THEN 'Sin vivienda'
                    ELSE tv.nombre
                END as tipo_vivienda,
                COALESCE(tv.habitaciones, 0) as habitaciones,
                cm.mes,
                cm.anio,
                cm.monto as monto_base,
                cm.monto,
                cm.monto_pendiente_anterior,
                cm.horas_requeridas,
                cm.horas_cumplidas,
                COALESCE(
                    (SELECT SUM(horas_justificadas) 
                     FROM Justificaciones_Horas jh 
                     WHERE jh.id_usuario = cm.id_usuario 
                     AND jh.mes = cm.mes 
                     AND jh.anio = cm.anio 
                     AND jh.estado = 'aprobada'), 0
                ) as horas_justificadas,
                GREATEST(0, cm.horas_requeridas - cm.horas_cumplidas - COALESCE(
                    (SELECT SUM(horas_justificadas) 
                     FROM Justificaciones_Horas jh 
                     WHERE jh.id_usuario = cm.id_usuario 
                     AND jh.mes = cm.mes 
                     AND jh.anio = cm.anio 
                     AND jh.estado = 'aprobada'), 0
                )) as horas_faltantes_real,
                GREATEST(0, cm.horas_requeridas - cm.horas_cumplidas - COALESCE(
                    (SELECT SUM(horas_justificadas) 
                     FROM Justificaciones_Horas jh 
                     WHERE jh.id_usuario = cm.id_usuario 
                     AND jh.mes = cm.mes 
                     AND jh.anio = cm.anio 
                     AND jh.estado = 'aprobada'), 0
                )) * 160 as deuda_horas_pesos,
                (cm.monto + cm.monto_pendiente_anterior + 
                 (GREATEST(0, cm.horas_requeridas - cm.horas_cumplidas - COALESCE(
                    (SELECT SUM(horas_justificadas) 
                     FROM Justificaciones_Horas jh 
                     WHERE jh.id_usuario = cm.id_usuario 
                     AND jh.mes = cm.mes 
                     AND jh.anio = cm.anio 
                     AND jh.estado = 'aprobada'), 0
                )) * 160)) as monto_total,
                cm.estado,
                cm.fecha_vencimiento,
                cm.pendiente_asignacion,
                cm.observaciones,
                CASE 
                    WHEN cm.pendiente_asignacion = 1 THEN 'sin_vivienda'
                    WHEN cm.fecha_vencimiento < CURDATE() AND cm.estado = 'pendiente' THEN 'vencida'
                    ELSE cm.estado
                END as estado_actual,
                pc.id_pago,
                pc.monto_pagado,
                pc.fecha_pago,
                pc.comprobante_archivo,
                pc.estado_validacion as estado_pago,
                pc.observaciones_validacion,
                CASE 
                    WHEN pc.estado_validacion = 'aprobado' AND cm.estado = 'pagada' THEN 'aceptado'
                    WHEN pc.estado_validacion = 'rechazado' THEN 'rechazado'
                    ELSE NULL
                END as estado_usuario
            FROM Cuotas_Mensuales cm
            INNER JOIN Usuario u ON cm.id_usuario = u.id_usuario
            LEFT JOIN Viviendas v ON cm.id_vivienda = v.id_vivienda
            LEFT JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
            LEFT JOIN Pagos_Cuotas pc ON cm.id_cuota = pc.id_cuota AND pc.estado_validacion != 'rechazado'
            WHERE cm.id_usuario = :id_usuario
        ";
            
            if (!empty($filtros['mes'])) {
                $sql .= " AND cm.mes = :mes";
                $params['mes'] = $filtros['mes'];
            }
            
            if (!empty($filtros['anio'])) {
                $sql .= " AND cm.anio = :anio";
                $params['anio'] = $filtros['anio'];
            }
            
            if (!empty($filtros['estado'])) {
                if ($filtros['estado'] === 'vencida') {
                    $sql .= " AND cm.fecha_vencimiento < CURDATE() AND cm.estado = 'pendiente'";
                } else {
                    $sql .= " AND cm.estado = :estado";
                    $params['estado'] = $filtros['estado'];
                }
            }
            
            $sql .= " ORDER BY cm.anio DESC, cm.mes DESC";
            
            error_log("📋 SQL directo: " . substr($sql, 0, 200) . "...");
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log(" Resultados consulta directa: " . count($resultados));
            
            return $resultados;
            
        } catch (\PDOException $e) {
            error_log(" ERROR en getCuotasUsuarioDirecto: " . $e->getMessage());
            return [];
        }
    }

     

    /**
     * Obtener cuotas del usuario
     */
      public function getCuotasUsuario($idUsuario, $filtros = [])
    {
        try {
            error_log("===========================================");
            error_log("🔍 [getCuotasUsuario] INICIO");
            error_log("Usuario ID: $idUsuario");
            error_log("Filtros recibidos: " . json_encode($filtros));
            
            // PASO 1: Verificar si la vista existe
            try {
                $testVista = $this->conn->query("SELECT COUNT(*) FROM Vista_Cuotas_Con_Justificaciones LIMIT 1");
                error_log(" Vista existe y es accesible");
            } catch (\PDOException $e) {
                error_log(" ERROR: Vista no existe o no es accesible: " . $e->getMessage());
                
                // Fallback: consulta directa sin vista
                error_log("⚠️ Usando consulta directa sin vista...");
                return $this->getCuotasUsuarioDirecto($idUsuario, $filtros);
            }
            
            // PASO 2: Construir query con parámetros nombrados
            $params = ['id_usuario' => $idUsuario];
            
            $sql = "
                SELECT 
                    vcj.id_cuota,
                    vcj.id_usuario,
                    vcj.nombre_completo,
                    vcj.email,
                    vcj.id_vivienda,
                    vcj.numero_vivienda,
                    vcj.tipo_vivienda,
                    vcj.habitaciones,
                    vcj.mes,
                    vcj.anio,
                    vcj.monto_base,
                    vcj.monto,
                    vcj.monto_pendiente_anterior,
                    vcj.horas_requeridas,
                    vcj.horas_cumplidas,
                    vcj.horas_justificadas,
                    vcj.horas_faltantes_real,
                    vcj.deuda_horas_pesos,
                    vcj.monto_total,
                    vcj.estado,
                    vcj.fecha_vencimiento,
                    vcj.pendiente_asignacion,
                    vcj.estado_actual,
                    vcj.observaciones,
                    vcj.id_pago,
                    vcj.monto_pagado,
                    vcj.fecha_pago,
                    vcj.comprobante_archivo,
                    vcj.estado_pago,
                    vcj.observaciones_validacion
                FROM Vista_Cuotas_Con_Justificaciones vcj
                WHERE vcj.id_usuario = :id_usuario
            ";
            
            if (!empty($filtros['mes'])) {
                $sql .= " AND vcj.mes = :mes";
                $params['mes'] = $filtros['mes'];
            }
            
            if (!empty($filtros['anio'])) {
                $sql .= " AND vcj.anio = :anio";
                $params['anio'] = $filtros['anio'];
            }
            
            if (!empty($filtros['estado'])) {
                if ($filtros['estado'] === 'vencida') {
                    $sql .= " AND vcj.estado_actual = 'vencida'";
                } else {
                    $sql .= " AND vcj.estado = :estado";
                    $params['estado'] = $filtros['estado'];
                }
            }
            
            $sql .= " ORDER BY 
    CASE WHEN vcj.estado = 'pagada' THEN 1 ELSE 0 END ASC,
    vcj.anio DESC, 
    vcj.mes DESC";
            
            error_log("📋 SQL Query: " . $sql);
            error_log("📋 Params: " . json_encode($params));
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("📊 Resultados encontrados: " . count($resultados));
            
            if (count($resultados) > 0) {
                error_log("📄 Primera cuota:");
                error_log("   - id_cuota: " . ($resultados[0]['id_cuota'] ?? 'NULL'));
                error_log("   - mes/año: " . ($resultados[0]['mes'] ?? 'NULL') . '/' . ($resultados[0]['anio'] ?? 'NULL'));
                error_log("   - monto: " . ($resultados[0]['monto'] ?? 'NULL'));
                error_log("   - estado: " . ($resultados[0]['estado'] ?? 'NULL'));
                error_log("   - pendiente_asignacion: " . ($resultados[0]['pendiente_asignacion'] ?? 'NULL'));
            } else {
                error_log("⚠️ NO SE ENCONTRARON CUOTAS");
                error_log("🔍 Verificando si existen cuotas en la tabla directa...");
                
                $checkDirecto = $this->conn->prepare("
                    SELECT COUNT(*) as total FROM Cuotas_Mensuales WHERE id_usuario = ?
                ");
                $checkDirecto->execute([$idUsuario]);
                $totalDirecto = $checkDirecto->fetchColumn();
                
                error_log("📊 Cuotas en tabla directa: $totalDirecto");
                
                if ($totalDirecto > 0) {
                    error_log("⚠️ Hay cuotas en la tabla pero no en la vista. Usando consulta directa...");
                    return $this->getCuotasUsuarioDirecto($idUsuario, $filtros);
                }
            }
            
            error_log("===========================================");
            
            return $resultados;
            
        } catch (\PDOException $e) {
            error_log(" ERROR en getCuotasUsuario: " . $e->getMessage());
            error_log(" SQL State: " . $e->getCode());
            error_log(" Stack trace: " . $e->getTraceAsString());
            
            // Fallback: consulta directa
            error_log("⚠️ Intentando con consulta directa...");
            return $this->getCuotasUsuarioDirecto($idUsuario, $filtros);
        }
    }

    /**
     * Obtener todas las cuotas (Admin)
     */
    public function getAllCuotas($filtros = [])
    {
        try {
            $sql = "
                SELECT 
                    vcj.*,
                    pc.estado_validacion as estado_pago,
                    pc.comprobante_archivo,
                    pc.incluye_deuda_horas,
                    pc.monto_deuda_horas
                FROM Vista_Cuotas_Con_Justificaciones vcj
                LEFT JOIN Pagos_Cuotas pc ON vcj.id_cuota = pc.id_cuota
                WHERE 1=1
            ";
            
            $params = [];
            
            if (!empty($filtros['mes'])) {
                $sql .= " AND vcj.mes = :mes";
                $params['mes'] = $filtros['mes'];
            }
            
            if (!empty($filtros['anio'])) {
                $sql .= " AND vcj.anio = :anio";
                $params['anio'] = $filtros['anio'];
            }
            
            if (!empty($filtros['estado'])) {
                if ($filtros['estado'] === 'vencida') {
                    $sql .= " AND vcj.estado_actual = 'vencida'";
                } else {
                    $sql .= " AND vcj.estado = :estado";
                    $params['estado'] = $filtros['estado'];
                }
            }
            
            $sql .= " ORDER BY vcj.anio DESC, vcj.mes DESC, vcj.nombre_completo ASC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (\PDOException $e) {
            error_log("Error en getAllCuotas: " . $e->getMessage());
            return [];
        }
    }

    

    /**
     * Verificar si puede pagar
     */
    public function puedeRealizarPago($cuotaId)
    {
        try {
            $cuota = $this->getCuotaById($cuotaId);
            
            if (!$cuota) {
                return [
                    'puede_pagar' => false,
                    'motivo' => 'Cuota no encontrada'
                ];
            }
            
            if ($cuota['pendiente_asignacion'] == 1) {
                return [
                    'puede_pagar' => false,
                    'motivo' => 'Debes esperar a que te asignen una vivienda antes de pagar'
                ];
            }
            
            if ($cuota['estado'] === 'pagada') {
                return [
                    'puede_pagar' => false,
                    'motivo' => 'Esta cuota ya esta pagada'
                ];
            }
            
            $horasCumplidas = floatval($cuota['horas_cumplidas']);
            $horasRequeridas = floatval($cuota['horas_requeridas']);
            $horasJustificadas = floatval($cuota['horas_justificadas'] ?? 0);
            
            return [
                'puede_pagar' => true,
                'horas_cumplidas' => $horasCumplidas,
                'horas_requeridas' => $horasRequeridas,
                'horas_justificadas' => $horasJustificadas,
                'deuda_horas' => max(0, $horasRequeridas - $horasCumplidas - $horasJustificadas)
            ];
            
        } catch (\PDOException $e) {
            error_log("Error en puedeRealizarPago: " . $e->getMessage());
            return ['puede_pagar' => false, 'motivo' => 'Error al verificar'];
        }
    }

    /**
     * Registrar pago
     */
    public function registrarPago(
        $cuotaId, 
        $idUsuario, 
        $montoPagado, 
        $metodoPago, 
        $comprobanteArchivo, 
        $numeroComprobante = null,
        $incluyeDeudaHoras = false,
        $montoDeudaHoras = 0
    ) {
        try {
            $this->conn->beginTransaction();
            
            $cuota = $this->getCuotaById($cuotaId);
            
            if (!$cuota) {
                throw new \Exception('Cuota no encontrada');
            }
            
            if ($cuota['id_usuario'] != $idUsuario) {
                throw new \Exception('Esta cuota no te pertenece');
            }
            
            if ($cuota['estado'] === 'pagada') {
                throw new \Exception('Esta cuota ya esta pagada');
            }
            
            if ($metodoPago !== 'transferencia') {
                throw new \Exception('Metodo de pago invalido. Solo se acepta transferencia bancaria.');
            }
            
            $stmt = $this->conn->prepare("
                INSERT INTO Pagos_Cuotas 
                (id_cuota, id_usuario, monto_pagado, metodo_pago, comprobante_archivo, 
                 numero_comprobante, incluye_deuda_horas, monto_deuda_horas)
                VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $cuotaId,
                $idUsuario,
                $montoPagado,
                'transferencia',
                $comprobanteArchivo,
                $numeroComprobante,
                $incluyeDeudaHoras ? 1 : 0,
                $montoDeudaHoras
            ]);
            
            $this->conn->commit();
            
            return [
                'success' => true,
                'mensaje' => 'Pago registrado exitosamente. Sera revisado por un administrador.'
            ];
            
        } catch (\Exception $e) {
            $this->conn->rollBack();
            error_log("Error en registrarPago: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Validar pago (Admin)
     */
    /**
 * Validar pago (Admin)
 */
public function validarPago($pagoId, $idAdmin, $accion, $observaciones = '')
{
    try {
        error_log("═══════════════════════════════════════");
        error_log("🔍 [validarPago] INICIO");
        error_log("Pago ID: $pagoId");
        error_log("Acción: $accion");
        
        $this->conn->beginTransaction();
        
        // Obtener información del pago
        $stmtInfo = $this->conn->prepare("
            SELECT pc.id_cuota, pc.id_usuario, cm.estado as estado_cuota
            FROM Pagos_Cuotas pc
            INNER JOIN Cuotas_Mensuales cm ON pc.id_cuota = cm.id_cuota
            WHERE pc.id_pago = ?
        ");
        $stmtInfo->execute([$pagoId]);
        $infoPago = $stmtInfo->fetch(PDO::FETCH_ASSOC);
        
        if (!$infoPago) {
            throw new \Exception("Pago no encontrado");
        }
        
        error_log("✓ Pago encontrado - Cuota: {$infoPago['id_cuota']}, Usuario: {$infoPago['id_usuario']}");
        
        $estadoValidacion = $accion === 'aprobar' ? 'aprobado' : 'rechazado';
        
        // Actualizar pago
        $stmtPago = $this->conn->prepare("
            UPDATE Pagos_Cuotas 
            SET estado_validacion = ?,
                observaciones_validacion = ?,
                fecha_validacion = NOW()
            WHERE id_pago = ?
        ");
        
        $stmtPago->execute([$estadoValidacion, $observaciones, $pagoId]);
        error_log("✓ Pago actualizado - Estado: $estadoValidacion");
        
        // Si aprueba
        if ($accion === 'aprobar') {
            // Marcar cuota como pagada
            $stmtCuota = $this->conn->prepare("
                UPDATE Cuotas_Mensuales 
                SET estado = 'pagada'
                WHERE id_cuota = ?
            ");
            $stmtCuota->execute([$infoPago['id_cuota']]);
            error_log("✓ Cuota marcada como pagada");
            
            // Actualizar usuario a aceptado
            $stmtUsuario = $this->conn->prepare("
                UPDATE Usuario 
                SET estado = 'aceptado'
                WHERE id_usuario = ?
                AND estado = 'enviado'
            ");
            $stmtUsuario->execute([$infoPago['id_usuario']]);
            
            // 🔥 NUEVO: Recalcular deuda acumulada
            $this->recalcularDeudaAcumulada($infoPago['id_usuario']);
            error_log("✓ Deuda acumulada recalculada");
        }
        
        $this->conn->commit();
        
        error_log("✅ Transacción completada exitosamente");
        error_log("═══════════════════════════════════════");
        
        return [
            'success' => true,
            'mensaje' => $accion === 'aprobar' 
                ? 'Pago aprobado. Cuota marcada como pagada y deuda recalculada.' 
                : 'Pago rechazado correctamente.'
        ];
        
    } catch (\Exception $e) {
        $this->conn->rollBack();
        error_log("💥 ERROR en validarPago: " . $e->getMessage());
        error_log("═══════════════════════════════════════");
        
        return [
            'success' => false,
            'message' => 'Error al validar pago: ' . $e->getMessage()
        ];
    }
}

    /**
     * Obtener precios actuales
     */
    public function getPreciosActuales()
    {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    cc.id_tipo,
                    tv.nombre as tipo_vivienda,
                    tv.habitaciones,
                    cc.monto_mensual,
                    cc.fecha_vigencia_desde
                FROM Config_Cuotas cc
                INNER JOIN Tipo_Vivienda tv ON cc.id_tipo = tv.id_tipo
                WHERE cc.activo = TRUE
                ORDER BY tv.habitaciones ASC
            ");
            
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (\PDOException $e) {
            error_log("Error en getPreciosActuales: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Actualizar precio
     */
    public function actualizarPrecio($idTipo, $montoMensual)
    {
        try {
            $this->conn->beginTransaction();
            
            $stmt = $this->conn->prepare("
                UPDATE Config_Cuotas 
                SET monto_mensual = ?
                WHERE id_tipo = ?
                AND activo = TRUE
            ");
            
            $stmt->execute([$montoMensual, $idTipo]);
            
            $mesActual = date('n');
            $anioActual = date('Y');
            
            $stmtUpdate = $this->conn->prepare("
                UPDATE Cuotas_Mensuales cm
                INNER JOIN Viviendas v ON cm.id_vivienda = v.id_vivienda
                SET cm.monto = ?
                WHERE v.id_tipo = ?
                AND cm.estado IN ('pendiente', 'vencida')
                AND cm.mes = ?
                AND cm.anio = ?
            ");
            
            $stmtUpdate->execute([$montoMensual, $idTipo, $mesActual, $anioActual]);
            
            $cuotasActualizadas = $stmtUpdate->rowCount();
            
            $this->conn->commit();
            
            return [
                'success' => true,
                'message' => "Precio actualizado. $cuotasActualizadas cuotas del mes actual fueron ajustadas.",
                'cuotas_actualizadas' => $cuotasActualizadas
            ];
            
        } catch (\PDOException $e) {
            $this->conn->rollBack();
            error_log("Error en actualizarPrecio: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al actualizar precio: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener estadisticas
     */
    public function getEstadisticasCuotas($mes = null, $anio = null)
    {
        try {
            $sql = "
                SELECT 
                    COUNT(*) as total_cuotas,
                    SUM(CASE WHEN estado = 'pagada' THEN 1 ELSE 0 END) as pagadas,
                    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                    SUM(CASE WHEN estado_actual = 'vencida' THEN 1 ELSE 0 END) as vencidas,
                    SUM(CASE WHEN pendiente_asignacion = 1 THEN 1 ELSE 0 END) as sin_vivienda,
                    SUM(CASE WHEN estado = 'pagada' THEN monto_total ELSE 0 END) as monto_cobrado
                FROM Vista_Cuotas_Con_Justificaciones
                WHERE 1=1
            ";
            
            $params = [];
            
            if ($mes) {
                $sql .= " AND mes = ?";
                $params[] = $mes;
            }
            
            if ($anio) {
                $sql .= " AND anio = ?";
                $params[] = $anio;
            }
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (\PDOException $e) {
            error_log("Error en getEstadisticasCuotas: " . $e->getMessage());
            return [];
        }
    }
}