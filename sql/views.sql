-- ==========================================
-- VISTAS - Sistema de Gestión Cooperativa
-- ==========================================

USE proyecto2025;

-- ==========================================
-- VISTA: Cuotas con Justificaciones
-- ==========================================
CREATE OR REPLACE VIEW Vista_Cuotas_Con_Justificaciones AS
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
    cm.monto_pendiente_anterior,
    cm.horas_requeridas,
    cm.horas_cumplidas,
    cm.pendiente_asignacion,
    GREATEST(
        0,
        cm.horas_requeridas - cm.horas_cumplidas
    ) as horas_faltantes_base,
    COALESCE(SUM(jh.horas_justificadas), 0) as horas_justificadas,
    COALESCE(SUM(jh.monto_descontado), 0) as monto_justificado,
    GREATEST(
        0,
        cm.horas_requeridas - cm.horas_cumplidas - COALESCE(SUM(jh.horas_justificadas), 0)
    ) as horas_faltantes_real,
    GREATEST(
        0,
        cm.horas_requeridas - cm.horas_cumplidas - COALESCE(SUM(jh.horas_justificadas), 0)
    ) * 160 as deuda_horas_pesos,
    (
        cm.monto + cm.monto_pendiente_anterior + (
            GREATEST(
                0,
                cm.horas_requeridas - cm.horas_cumplidas - COALESCE(SUM(jh.horas_justificadas), 0)
            ) * 160
        )
    ) as monto_total,
    cm.estado,
    cm.fecha_vencimiento,
    cm.horas_validadas,
    cm.observaciones,
    pc.id_pago,
    pc.monto_pagado,
    pc.fecha_pago,
    pc.comprobante_archivo,
    pc.estado_validacion as estado_pago,
    pc.observaciones_validacion,
    CASE
        WHEN cm.pendiente_asignacion = 1 THEN 'sin_vivienda'
        WHEN cm.fecha_vencimiento < CURDATE()
        AND cm.estado = 'pendiente' THEN 'vencida'
        ELSE cm.estado
    END as estado_actual
FROM
    Cuotas_Mensuales cm
    INNER JOIN Usuario u ON cm.id_usuario = u.id_usuario
    LEFT JOIN Viviendas v ON cm.id_vivienda = v.id_vivienda
    LEFT JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
    LEFT JOIN Justificaciones_Horas jh ON cm.id_usuario = jh.id_usuario
    AND cm.mes = jh.mes
    AND cm.anio = jh.anio
    AND jh.estado = 'aprobada'
    LEFT JOIN Pagos_Cuotas pc ON cm.id_cuota = pc.id_cuota
    AND pc.estado_validacion != 'rechazado'
GROUP BY
    cm.id_cuota;

-- ==========================================
-- VISTA: Solicitudes Completas
-- ==========================================
CREATE OR REPLACE VIEW Vista_Solicitudes_Completa AS
SELECT
    s.id_solicitud,
    s.id_usuario,
    u.nombre_completo,
    u.email,
    u.cedula,
    s.tipo_solicitud,
    s.asunto,
    s.descripcion,
    s.archivo_adjunto,
    s.estado,
    s.prioridad,
    s.fecha_creacion,
    s.fecha_actualizacion,
    COUNT(rs.id_respuesta) as total_respuestas,
    MAX(rs.fecha_respuesta) as ultima_respuesta
FROM
    Solicitudes s
    INNER JOIN Usuario u ON s.id_usuario = u.id_usuario
    LEFT JOIN Respuestas_Solicitudes rs ON s.id_solicitud = rs.id_solicitud
GROUP BY
    s.id_solicitud
ORDER BY s.fecha_creacion DESC;

-- ==========================================
-- VISTA: Solicitudes de Núcleo
-- ==========================================
CREATE OR REPLACE VIEW Vista_Solicitudes_Nucleo AS
SELECT
    sn.id_solicitud_nucleo,
    sn.id_usuario,
    u.nombre_completo,
    u.email,
    u.cedula,
    sn.id_nucleo,
    nf.nombre_nucleo,
    nf.direccion as direccion_nucleo,
    COUNT(DISTINCT u2.id_usuario) as miembros_actuales,
    sn.mensaje,
    sn.estado,
    sn.fecha_solicitud,
    sn.fecha_respuesta,
    sn.observaciones_admin,
    admin.nombre_completo as admin_respuesta
FROM
    Solicitudes_Nucleo sn
    INNER JOIN Usuario u ON sn.id_usuario = u.id_usuario
    INNER JOIN Nucleo_Familiar nf ON sn.id_nucleo = nf.id_nucleo
    LEFT JOIN Usuario u2 ON u2.id_nucleo = nf.id_nucleo
    LEFT JOIN Usuario admin ON sn.id_admin_respuesta = admin.id_usuario
GROUP BY
    sn.id_solicitud_nucleo
ORDER BY sn.fecha_solicitud DESC;

-- ==========================================
-- VISTA: Informe Mensual
-- ==========================================
CREATE OR REPLACE VIEW Vista_Informe_Mensual AS
SELECT
    YEAR(rh.fecha) as anio,
    MONTH(rh.fecha) as mes,
    SUM(rh.total_horas) as total_horas_trabajadas,
    COUNT(DISTINCT rh.id_usuario) as total_trabajadores,
    COALESCE(SUM(pc.monto_pagado), 0) as total_ingresado,
    COUNT(DISTINCT pc.id_pago) as total_pagos
FROM
    Registro_Horas rh
    LEFT JOIN Cuotas_Mensuales cm ON YEAR(rh.fecha) = cm.anio
    AND MONTH(rh.fecha) = cm.mes
    AND rh.id_usuario = cm.id_usuario
    LEFT JOIN Pagos_Cuotas pc ON cm.id_cuota = pc.id_cuota
    AND pc.estado_validacion = 'aprobado'
WHERE
    rh.estado = 'aprobado'
GROUP BY
    anio,
    mes
ORDER BY anio DESC, mes DESC;

SELECT 'Vistas creadas exitosamente' AS status;