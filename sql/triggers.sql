-- ==========================================
-- TRIGGERS - Sistema de Gestión Cooperativa
-- ==========================================

USE proyecto2025;

-- ==========================================
-- TRIGGER 1: Actualizar horas de cuota al aprobar horas de trabajo
-- ==========================================
DROP TRIGGER IF EXISTS actualizar_horas_cuota;

DELIMITER $$

CREATE TRIGGER actualizar_horas_cuota
AFTER UPDATE ON Registro_Horas
FOR EACH ROW
BEGIN
    IF NEW.estado = 'aprobado' AND OLD.estado != 'aprobado' THEN
        UPDATE Cuotas_Mensuales
        SET horas_cumplidas = (
            SELECT COALESCE(SUM(total_horas), 0)
            FROM Registro_Horas
            WHERE id_usuario = NEW.id_usuario
            AND MONTH(fecha) = MONTH(NEW.fecha)
            AND YEAR(fecha) = YEAR(NEW.fecha)
            AND estado = 'aprobado'
        )
        WHERE id_usuario = NEW.id_usuario
        AND mes = MONTH(NEW.fecha)
        AND anio = YEAR(NEW.fecha);
    END IF;
END $$

DELIMITER ;

-- ==========================================
-- TRIGGER 2: Actualizar cuota al asignar vivienda (Usuario o Núcleo)
-- ==========================================
DROP TRIGGER IF EXISTS actualizar_cuota_al_asignar_vivienda;

DELIMITER $$

CREATE TRIGGER actualizar_cuota_al_asignar_vivienda
AFTER INSERT ON Asignacion_Vivienda
FOR EACH ROW
BEGIN
    DECLARE v_id_tipo INT;
    DECLARE v_monto_vivienda DECIMAL(10, 2);

    IF NEW.activa = 1 THEN
        SELECT v.id_tipo, cc.monto_mensual
        INTO v_id_tipo, v_monto_vivienda
        FROM Viviendas v
        LEFT JOIN Config_Cuotas cc
            ON cc.id_tipo = v.id_tipo AND cc.activo = 1
        WHERE v.id_vivienda = NEW.id_vivienda
        LIMIT 1;

        -- Asignación a USUARIO
        IF NEW.id_usuario IS NOT NULL THEN
            UPDATE Cuotas_Mensuales
            SET id_vivienda = NEW.id_vivienda,
                monto = COALESCE(v_monto_vivienda, 0),
                pendiente_asignacion = 0,
                observaciones = CONCAT(
                    COALESCE(observaciones, ''),
                    IF(observaciones IS NOT NULL AND observaciones != '', '\n', ''),
                    'Vivienda asignada el ', DATE_FORMAT(NOW(), '%d/%m/%Y %H:%i')
                )
            WHERE id_usuario = NEW.id_usuario
                AND pendiente_asignacion = 1
                AND (
                    (anio = YEAR(CURDATE()) AND mes >= MONTH(CURDATE()))
                    OR anio > YEAR(CURDATE())
                );

            INSERT INTO notificaciones (titulo, mensaje, tipo)
            VALUES (
                'Vivienda Asignada',
                'Se te ha asignado una vivienda. Tus cuotas han sido actualizadas con el monto correspondiente.',
                'exito'
            );
            INSERT INTO usuario_notificaciones (id_usuario, id_notificacion)
            VALUES (NEW.id_usuario, LAST_INSERT_ID());
        END IF;

        -- Asignación a NUCLEO
        IF NEW.id_nucleo IS NOT NULL THEN
            UPDATE Cuotas_Mensuales cm
            INNER JOIN Usuario u ON cm.id_usuario = u.id_usuario
            SET cm.id_vivienda = NEW.id_vivienda,
                cm.monto = COALESCE(v_monto_vivienda, 0),
                cm.pendiente_asignacion = 0,
                cm.observaciones = CONCAT(
                    COALESCE(cm.observaciones, ''),
                    IF(cm.observaciones IS NOT NULL AND cm.observaciones != '', '\n', ''),
                    'Vivienda asignada a núcleo el ', DATE_FORMAT(NOW(), '%d/%m/%Y %H:%i')
                )
            WHERE u.id_nucleo = NEW.id_nucleo
                AND cm.pendiente_asignacion = 1
                AND (
                    (cm.anio = YEAR(CURDATE()) AND cm.mes >= MONTH(CURDATE()))
                    OR cm.anio > YEAR(CURDATE())
                );

            INSERT INTO notificaciones (titulo, mensaje, tipo)
            VALUES (
                'Vivienda Asignada a tu Núcleo',
                'Se ha asignado una vivienda a tu núcleo familiar. Tus cuotas han sido actualizadas.',
                'exito'
            );

            INSERT INTO usuario_notificaciones (id_usuario, id_notificacion)
            SELECT u.id_usuario, LAST_INSERT_ID()
            FROM Usuario u
            WHERE u.id_nucleo = NEW.id_nucleo;
        END IF;
    END IF;
END $$

DELIMITER ;

-- ==========================================
-- TRIGGER 3: Generar cuota automáticamente cuando un usuario es aceptado
-- ==========================================
DROP TRIGGER IF EXISTS generar_cuota_usuario_nuevo;

DELIMITER $$

CREATE TRIGGER generar_cuota_usuario_nuevo
AFTER UPDATE ON Usuario
FOR EACH ROW
BEGIN
    DECLARE v_mes_actual INT;
    DECLARE v_anio_actual INT;
    DECLARE v_id_vivienda INT;
    DECLARE v_id_tipo INT;
    DECLARE v_monto_base DECIMAL(10, 2);
    DECLARE v_fecha_vencimiento DATE;
    DECLARE v_pendiente_asignacion TINYINT(1);

    IF NEW.estado = 'aceptado' AND OLD.estado != 'aceptado' THEN
        SET v_mes_actual = MONTH(CURDATE());
        SET v_anio_actual = YEAR(CURDATE());
        SET v_fecha_vencimiento = LAST_DAY(CURDATE());

        IF NOT EXISTS (
            SELECT 1
            FROM Cuotas_Mensuales
            WHERE id_usuario = NEW.id_usuario
                AND mes = v_mes_actual
                AND anio = v_anio_actual
        ) THEN
            SELECT av.id_vivienda, v.id_tipo
            INTO v_id_vivienda, v_id_tipo
            FROM Asignacion_Vivienda av
                INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
            WHERE (
                av.id_usuario = NEW.id_usuario
                OR av.id_nucleo = NEW.id_nucleo
            )
                AND av.activa = 1
            LIMIT 1;

            IF v_id_vivienda IS NOT NULL THEN
                SELECT monto_mensual
                INTO v_monto_base
                FROM Config_Cuotas
                WHERE id_tipo = v_id_tipo AND activo = 1
                LIMIT 1;
                SET v_monto_base = COALESCE(v_monto_base, 0);
                SET v_pendiente_asignacion = 0;
            ELSE
                SET v_monto_base = 0;
                SET v_pendiente_asignacion = 1;
            END IF;

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
                NEW.id_usuario,
                v_id_vivienda,
                v_mes_actual,
                v_anio_actual,
                v_monto_base,
                0,
                v_fecha_vencimiento,
                84.00,
                'pendiente',
                v_pendiente_asignacion,
                IF(
                    v_pendiente_asignacion = 1,
                    CONCAT(
                        'Usuario aceptado el ', DATE_FORMAT(NOW(), '%d/%m/%Y'),
                        '. Pendiente asignación de vivienda.'
                    ),
                    CONCAT(
                        'Usuario aceptado el ', DATE_FORMAT(NOW(), '%d/%m/%Y')
                    )
                )
            );

            INSERT INTO notificaciones (titulo, mensaje, tipo)
            VALUES (
                'Bienvenido al Sistema de Cuotas',
                CONCAT(
                    'Tu cuota de ', MONTHNAME(CURDATE()),
                    ' ha sido generada. ',
                    IF(
                        v_pendiente_asignacion = 1,
                        'Estás en espera de asignación de vivienda.',
                        CONCAT(
                            'Monto: ', CAST(v_monto_base AS CHAR),
                            '. Horas requeridas: 84'
                        )
                    )
                ),
                'info'
            );

            INSERT INTO usuario_notificaciones (id_usuario, id_notificacion)
            VALUES (NEW.id_usuario, LAST_INSERT_ID());
        END IF;
    END IF;
END $$

DELIMITER ;

SELECT 'Triggers creados exitosamente' AS status;