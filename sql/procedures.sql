-- ==========================================
-- PROCEDIMIENTOS Y FUNCIONES - Sistema de Gestión Cooperativa
-- ==========================================

USE proyecto2025;

-- ==========================================
-- PROCEDIMIENTO: Generar Cuotas Mensuales
-- ==========================================
DROP PROCEDURE IF EXISTS GenerarCuotasMensuales;

DELIMITER $$

CREATE PROCEDURE GenerarCuotasMensuales(IN p_mes INT, IN p_anio INT) 
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_id_usuario INT;
    DECLARE v_id_vivienda INT;
    DECLARE v_id_tipo INT;
    DECLARE v_monto_base DECIMAL(10, 2);
    DECLARE v_deuda_anterior DECIMAL(10, 2);
    DECLARE v_fecha_vencimiento DATE;
    DECLARE v_pendiente_asignacion TINYINT(1);
    DECLARE v_cuotas_generadas INT DEFAULT 0;
    DECLARE v_cuotas_sin_vivienda INT DEFAULT 0;
    DECLARE v_cuotas_existentes INT DEFAULT 0;
    
    DECLARE cur_usuarios CURSOR FOR
        SELECT DISTINCT u.id_usuario
        FROM Usuario u
        WHERE u.estado = 'aceptado'
        ORDER BY u.id_usuario;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    SET v_fecha_vencimiento = LAST_DAY(CONCAT(p_anio, '-', LPAD(p_mes, 2, '0'), '-01'));
    
    OPEN cur_usuarios;
    
    read_loop: LOOP 
        FETCH cur_usuarios INTO v_id_usuario;
        
        IF done THEN 
            LEAVE read_loop;
        END IF;
        
        -- Verificar si ya existe una cuota para este periodo
        IF EXISTS (
            SELECT 1
            FROM Cuotas_Mensuales
            WHERE id_usuario = v_id_usuario
                AND mes = p_mes
                AND anio = p_anio
        ) THEN
            SET v_cuotas_existentes = v_cuotas_existentes + 1;
            ITERATE read_loop;
        END IF;
        
        -- Inicializar variables
        SET v_id_vivienda = NULL;
        SET v_id_tipo = NULL;
        SET v_monto_base = 0;
        SET v_pendiente_asignacion = 0;
        
        -- Buscar vivienda asignada
        SELECT av.id_vivienda, v.id_tipo 
        INTO v_id_vivienda, v_id_tipo
        FROM Asignacion_Vivienda av
            INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
            INNER JOIN Usuario u ON (
                av.id_usuario = u.id_usuario
                OR av.id_nucleo = u.id_nucleo
            )
        WHERE u.id_usuario = v_id_usuario
            AND av.activa = 1
        LIMIT 1;
        
        -- Calcular monto según vivienda
        IF v_id_vivienda IS NOT NULL THEN
            SELECT monto_mensual INTO v_monto_base
            FROM Config_Cuotas
            WHERE id_tipo = v_id_tipo
                AND activo = 1
            LIMIT 1;
            
            SET v_monto_base = COALESCE(v_monto_base, 0);
        ELSE
            SET v_monto_base = 0;
            SET v_pendiente_asignacion = 1;
            SET v_cuotas_sin_vivienda = v_cuotas_sin_vivienda + 1;
        END IF;
        
        -- Calcular deuda anterior
        SELECT COALESCE(SUM(monto + monto_pendiente_anterior), 0) 
        INTO v_deuda_anterior
        FROM Cuotas_Mensuales
        WHERE id_usuario = v_id_usuario
            AND estado != 'pagada'
            AND (
                anio < p_anio
                OR (anio = p_anio AND mes < p_mes)
            );
        
        -- Insertar nueva cuota
        INSERT INTO Cuotas_Mensuales (
            id_usuario,
            id_vivienda,
            mes,
            anio,
            monto,
            monto_pendiente_anterior,
            fecha_vencimiento,
            horas_requeridas,
            estado,
            pendiente_asignacion,
            observaciones
        ) VALUES (
            v_id_usuario,
            v_id_vivienda,
            p_mes,
            p_anio,
            v_monto_base,
            v_deuda_anterior,
            v_fecha_vencimiento,
            84.00,
            'pendiente',
            v_pendiente_asignacion,
            IF(
                v_pendiente_asignacion = 1,
                'Pendiente: Asignar vivienda',
                NULL
            )
        );
        
        SET v_cuotas_generadas = v_cuotas_generadas + 1;
        
    END LOOP;
    
    CLOSE cur_usuarios;
    
    -- Notificar usuarios sin vivienda
    IF v_cuotas_sin_vivienda > 0 THEN
        INSERT INTO notificaciones (titulo, mensaje, tipo)
        VALUES (
            'Usuarios sin Vivienda',
            CONCAT(
                'Hay ', v_cuotas_sin_vivienda,
                ' usuario(s) sin vivienda. Cuotas pendientes de asignacion.'
            ),
            'urgente'
        );
        
        INSERT INTO usuario_notificaciones (id_usuario, id_notificacion)
        SELECT u.id_usuario, LAST_INSERT_ID()
        FROM Usuario u
        WHERE u.id_rol = 1;
    END IF;
    
    -- Notificación de resumen
    INSERT INTO notificaciones (titulo, mensaje, tipo)
    VALUES (
        'Cuotas Generadas',
        CONCAT(
            'Mes ', p_mes, '/', p_anio, ': ',
            v_cuotas_generadas, ' nuevas | ',
            v_cuotas_existentes, ' existian | ',
            v_cuotas_sin_vivienda, ' sin vivienda'
        ),
        'exito'
    );
    
    INSERT INTO usuario_notificaciones (id_usuario, id_notificacion)
    SELECT u.id_usuario, LAST_INSERT_ID()
    FROM Usuario u
    WHERE u.id_rol = 1;
    
END $$

DELIMITER ;

-- ==========================================
-- FUNCIÓN: Calcular Deuda Total de Usuario
-- ==========================================
DROP FUNCTION IF EXISTS CalcularDeudaUsuario;

DELIMITER $$

CREATE FUNCTION CalcularDeudaUsuario(p_id_usuario INT) 
RETURNS DECIMAL(10, 2) 
DETERMINISTIC 
READS SQL DATA 
BEGIN
    DECLARE v_deuda DECIMAL(10, 2);
    
    SELECT COALESCE(SUM(monto + monto_pendiente_anterior), 0) 
    INTO v_deuda
    FROM Cuotas_Mensuales
    WHERE id_usuario = p_id_usuario
        AND estado != 'pagada';
    
    RETURN v_deuda;
END $$

DELIMITER ;

-- ==========================================
-- EVENTO AUTOMÁTICO: Generar Cuotas Mensuales
-- ==========================================
SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS GenerarCuotasAutomatico;

DELIMITER $$

CREATE EVENT GenerarCuotasAutomatico 
ON SCHEDULE EVERY 1 MONTH 
STARTS CASE
    WHEN DAY(CURDATE()) = 1 THEN 
        CONCAT(
            DATE_FORMAT(DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY), '%Y-%m-01'),
            ' 00:01:00'
        )
    ELSE 
        CONCAT(
            DATE_FORMAT(DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY), '%Y-%m-01'),
            ' 00:01:00'
        )
END
DO BEGIN
    DECLARE v_mes INT;
    DECLARE v_anio INT;
    
    SET v_mes = MONTH(CURDATE());
    SET v_anio = YEAR(CURDATE());
    
    CALL GenerarCuotasMensuales(v_mes, v_anio);
END $$

DELIMITER ;

SELECT 'Procedimientos, funciones y eventos creados exitosamente' AS status;