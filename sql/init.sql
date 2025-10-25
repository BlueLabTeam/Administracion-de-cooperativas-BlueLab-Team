CREATE DATABASE IF NOT EXISTS proyecto2025 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE proyecto2025;

-- USUARIOS Y ROLES
CREATE TABLE IF NOT EXISTS Rol (
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre_rol VARCHAR(50) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Nucleo_Familiar (
    id_nucleo INT PRIMARY KEY AUTO_INCREMENT,
    direccion VARCHAR(100),
    nombre_nucleo VARCHAR(50)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_completo VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    direccion VARCHAR(100),
    estado ENUM(
        'pendiente',
        'enviado',
        'aceptado',
        'rechazado'
    ) NOT NULL DEFAULT 'pendiente',
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_nacimiento DATE,
    email VARCHAR(100) UNIQUE,
    id_nucleo INT,
    id_rol INT,
    FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar (id_nucleo),
    FOREIGN KEY (id_rol) REFERENCES Rol (id_rol)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Usuario_Telefono (
    id_usuario INT,
    telefono VARCHAR(20),
    PRIMARY KEY (id_usuario, telefono),
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- PROVEEDORES Y MATERIALES
CREATE TABLE IF NOT EXISTS Proveedores (
    id_proveedor INT PRIMARY KEY AUTO_INCREMENT,
    nombre_proveedor VARCHAR(100),
    direccion VARCHAR(100),
    descripcion TEXT,
    email VARCHAR(100)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Proveedor_Telefono (
    id_proveedor INT,
    telefono VARCHAR(20),
    PRIMARY KEY (id_proveedor, telefono),
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores (id_proveedor)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Materiales (
    id_material INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    caracteristicas TEXT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Proveedor_Material (
    id_proveedor INT,
    id_material INT,
    PRIMARY KEY (id_proveedor, id_material),
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores (id_proveedor),
    FOREIGN KEY (id_material) REFERENCES Materiales (id_material)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Stock_Materiales (
    id_material INT PRIMARY KEY,
    cantidad_disponible INT NOT NULL,
    FOREIGN KEY (id_material) REFERENCES Materiales (id_material)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- HERRAMIENTAS
CREATE TABLE IF NOT EXISTS Herramientas (
    id_herramienta INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    estado VARCHAR(20)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Herramienta_Responsable (
    id_asignacion INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_herramienta INT,
    fecha DATE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario),
    FOREIGN KEY (id_herramienta) REFERENCES Herramientas (id_herramienta)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- UNIDADES HABITACIONALES
CREATE TABLE IF NOT EXISTS Unidades_Habitacionales (
    id_unidad INT PRIMARY KEY AUTO_INCREMENT,
    direccion VARCHAR(100),
    estado VARCHAR(20)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Unidad_Usuario (
    id_unidad INT,
    id_usuario INT,
    PRIMARY KEY (id_unidad, id_usuario),
    FOREIGN KEY (id_unidad) REFERENCES Unidades_Habitacionales (id_unidad),
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ETAPAS DE CONSTRUCCIÓN
CREATE TABLE IF NOT EXISTS Etapas (
    id_etapa INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    fechas VARCHAR(100),
    estado VARCHAR(20)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Unidad_Etapa (
    id_unidad INT,
    id_etapa INT,
    PRIMARY KEY (id_unidad, id_etapa),
    FOREIGN KEY (id_unidad) REFERENCES Unidades_Habitacionales (id_unidad),
    FOREIGN KEY (id_etapa) REFERENCES Etapas (id_etapa)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- GESTIÓN ECONÓMICA
CREATE TABLE IF NOT EXISTS Informes_Mensuales (
    id_informe INT PRIMARY KEY AUTO_INCREMENT,
    mes VARCHAR(20),
    descripcion TEXT,
    total_ingresado DECIMAL(10, 2),
    total_gastado DECIMAL(10, 2)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Horas_Trabajadas (
    id_hora INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE,
    horas DECIMAL(5, 2),
    id_informe INT,
    FOREIGN KEY (id_informe) REFERENCES Informes_Mensuales (id_informe)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Informe_Etapas (
    id_informe_etapa INT PRIMARY KEY AUTO_INCREMENT,
    id_etapa INT,
    id_informe INT,
    costo_total DECIMAL(10, 2),
    descripcion TEXT,
    FOREIGN KEY (id_etapa) REFERENCES Etapas (id_etapa),
    FOREIGN KEY (id_informe) REFERENCES Informes_Mensuales (id_informe)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- DOCUMENTOS
CREATE TABLE IF NOT EXISTS Justificativos (
    id_justificativo INT PRIMARY KEY AUTO_INCREMENT,
    descripcion TEXT,
    archivo VARCHAR(200)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- PAGOS Y DEUDAS
CREATE TABLE IF NOT EXISTS Comprobante_Pago (
    id_comprobante INT PRIMARY KEY AUTO_INCREMENT,
    fecha_pago DATE,
    archivo VARCHAR(200),
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Deudas (
    id_deuda INT PRIMARY KEY AUTO_INCREMENT,
    monto DECIMAL(10, 2),
    descripcion TEXT,
    id_nucleo INT,
    FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar (id_nucleo)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- NOTIFICACIONES
CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo ENUM('info', 'importante', 'urgente', 'exito') DEFAULT 'info',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fecha (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relación Usuario - Notificaciones
CREATE TABLE IF NOT EXISTS usuario_notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_notificacion INT NOT NULL,
    leida TINYINT(1) DEFAULT 0,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura DATETIME NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_notificacion) REFERENCES notificaciones(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_notification (id_usuario, id_notificacion),
    INDEX idx_usuario_leida (id_usuario, leida),
    INDEX idx_notificacion (id_notificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TAREAS
CREATE TABLE IF NOT EXISTS Tareas (
    id_tarea INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    estado ENUM('pendiente', 'en_progreso', 'completada', 'cancelada') DEFAULT 'pendiente',
    tipo_asignacion ENUM('usuario', 'nucleo') DEFAULT 'usuario',
    id_creador INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_creador) REFERENCES Usuario(id_usuario),
    INDEX idx_estado (estado),
    INDEX idx_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ASIGNACION DE TAREAS A USUARIOS
CREATE TABLE IF NOT EXISTS Tarea_Usuario (
    id_asignacion INT PRIMARY KEY AUTO_INCREMENT,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    progreso INT DEFAULT 0,
    estado_usuario ENUM('pendiente', 'en_progreso', 'completada') DEFAULT 'pendiente',
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_completada DATETIME NULL,
    FOREIGN KEY (id_tarea) REFERENCES Tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    UNIQUE KEY unique_tarea_usuario (id_tarea, id_usuario),
    INDEX idx_usuario (id_usuario),
    INDEX idx_estado (estado_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ASIGNACION DE TAREAS A NUCLEOS FAMILIARES
CREATE TABLE IF NOT EXISTS Tarea_Nucleo (
    id_asignacion INT PRIMARY KEY AUTO_INCREMENT,
    id_tarea INT NOT NULL,
    id_nucleo INT NOT NULL,
    progreso INT DEFAULT 0,
    estado_nucleo ENUM('pendiente', 'en_progreso', 'completada') DEFAULT 'pendiente',
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_completada DATETIME NULL,
    FOREIGN KEY (id_tarea) REFERENCES Tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar(id_nucleo) ON DELETE CASCADE,
    UNIQUE KEY unique_tarea_nucleo (id_tarea, id_nucleo),
    INDEX idx_nucleo (id_nucleo),
    INDEX idx_estado (estado_nucleo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AVANCES/COMENTARIOS DE TAREAS
CREATE TABLE IF NOT EXISTS Tarea_Avances (
    id_avance INT PRIMARY KEY AUTO_INCREMENT,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    comentario TEXT NOT NULL,
    progreso_reportado INT DEFAULT 0,
    archivo VARCHAR(200) NULL,
    fecha_avance DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarea) REFERENCES Tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    INDEX idx_tarea (id_tarea),
    INDEX idx_fecha (fecha_avance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Tarea_Material (
    id_tarea INT NOT NULL,
    id_material INT NOT NULL,
    cantidad_requerida INT NOT NULL DEFAULT 1,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_tarea, id_material),
    FOREIGN KEY (id_tarea) REFERENCES Tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_material) REFERENCES Materiales(id_material) ON DELETE CASCADE,
    INDEX idx_tarea (id_tarea),
    INDEX idx_material (id_material)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA DE SOLICITUDES DE MATERIALES
CREATE TABLE IF NOT EXISTS Solicitud_Material (
    id_solicitud INT PRIMARY KEY AUTO_INCREMENT,
    id_material INT NOT NULL,
    cantidad_solicitada INT NOT NULL,
    id_usuario INT NOT NULL,
    descripcion TEXT,
    estado ENUM('pendiente', 'aprobada', 'rechazada', 'entregada') DEFAULT 'pendiente',
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta DATETIME NULL,
    FOREIGN KEY (id_material) REFERENCES Materiales(id_material),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de tipos de vivienda
CREATE TABLE IF NOT EXISTS Tipo_Vivienda (
    id_tipo INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    habitaciones INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar tipos predeterminados
INSERT IGNORE INTO Tipo_Vivienda (nombre, descripcion, habitaciones) VALUES
('Mono-ambiente', 'Vivienda de 1 habitación con cocina y baño integrado', 1),
('2 Dormitorios', 'Vivienda de 2 dormitorios, sala, cocina y baño', 2),
('3 Dormitorios', 'Vivienda de 3 dormitorios, sala, cocina y 2 baños', 3);

-- Tabla de viviendas
CREATE TABLE IF NOT EXISTS Viviendas (
    id_vivienda INT PRIMARY KEY AUTO_INCREMENT,
    numero_vivienda VARCHAR(20) UNIQUE NOT NULL,
    direccion VARCHAR(200),
    id_tipo INT NOT NULL,
    estado ENUM('disponible', 'ocupada', 'mantenimiento') DEFAULT 'disponible',
    fecha_construccion DATE,
    metros_cuadrados DECIMAL(10,2),
    observaciones TEXT,
    FOREIGN KEY (id_tipo) REFERENCES Tipo_Vivienda(id_tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de asignaciones de vivienda
CREATE TABLE IF NOT EXISTS Asignacion_Vivienda (
    id_asignacion INT PRIMARY KEY AUTO_INCREMENT,
    id_vivienda INT NOT NULL,
    id_usuario INT,
    id_nucleo INT,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATETIME NULL,
    activa BOOLEAN DEFAULT TRUE,
    observaciones TEXT,
    FOREIGN KEY (id_vivienda) REFERENCES Viviendas(id_vivienda),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar(id_nucleo) ON DELETE CASCADE,
    CONSTRAINT chk_asignacion CHECK (
        (id_usuario IS NOT NULL AND id_nucleo IS NULL) OR 
        (id_usuario IS NULL AND id_nucleo IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA DE REGISTRO DE HORAS
CREATE TABLE IF NOT EXISTS Registro_Horas (
    id_registro INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NULL,
    total_horas DECIMAL(5,2) DEFAULT 0.00,
    descripcion TEXT,
    estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    observaciones TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario_fecha (id_usuario, fecha),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha),
    CONSTRAINT chk_entrada_salida CHECK (
        hora_salida IS NULL OR hora_salida > hora_entrada
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- SISTEMA DE CUOTAS MENSUALES (ACTUALIZADO)
-- 21 HORAS SEMANALES (84h MENSUALES) + SOLO TRANSFERENCIA
-- ==========================================

-- Tabla de configuración de precios
CREATE TABLE IF NOT EXISTS Config_Cuotas (
    id_config INT PRIMARY KEY AUTO_INCREMENT,
    id_tipo INT NOT NULL,
    monto_mensual DECIMAL(10,2) NOT NULL,
    fecha_vigencia_desde DATE NOT NULL,
    fecha_vigencia_hasta DATE NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_tipo) REFERENCES Tipo_Vivienda(id_tipo),
    INDEX idx_tipo_activo (id_tipo, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar precios iniciales
INSERT IGNORE INTO Config_Cuotas (id_tipo, monto_mensual, fecha_vigencia_desde, activo) VALUES
(1, 5000.00, '2025-01-01', TRUE),
(2, 7500.00, '2025-01-01', TRUE),
(3, 10000.00, '2025-01-01', TRUE);

-- Tabla de cuotas mensuales (SIN columna generada)
DROP TABLE IF EXISTS Cuotas_Mensuales;

CREATE TABLE Cuotas_Mensuales (
    id_cuota INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_vivienda INT NOT NULL,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INT NOT NULL,
    
    -- Montos separados (SIN monto_total)
    monto DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Cuota base de vivienda',
    monto_pendiente_anterior DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Deuda acumulada meses anteriores',
    
    estado ENUM('pendiente', 'pagada', 'vencida', 'exonerada') DEFAULT 'pendiente',
    fecha_vencimiento DATE NOT NULL,
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- ⭐ CAMBIO: Control de horas SEMANALES (21h × 4 semanas = 84h mensuales)
    horas_requeridas DECIMAL(5,2) DEFAULT 84.00 COMMENT '21 horas semanales × 4 semanas = 84 horas mensuales',
    horas_cumplidas DECIMAL(5,2) DEFAULT 0.00,
    horas_validadas BOOLEAN DEFAULT FALSE,
    
    observaciones TEXT,
    
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_vivienda) REFERENCES Viviendas(id_vivienda),
    
    UNIQUE KEY unique_usuario_mes_anio (id_usuario, mes, anio),
    INDEX idx_usuario_estado (id_usuario, estado),
    INDEX idx_fecha_vencimiento (fecha_vencimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista para cálculo automático de monto_total
DROP VIEW IF EXISTS Vista_Cuotas_Completa;

CREATE VIEW Vista_Cuotas_Completa AS
SELECT 
    cm.id_cuota,
    cm.id_usuario,
    u.nombre_completo,
    u.email,
    cm.id_vivienda,
    v.numero_vivienda,
    tv.nombre as tipo_vivienda,
    tv.habitaciones,
    cm.mes,
    cm.anio,
    cm.monto as monto_base,
    cm.monto_pendiente_anterior,
    (cm.monto + cm.monto_pendiente_anterior) as monto_total,
    cm.estado,
    cm.fecha_vencimiento,
    cm.horas_requeridas,
    cm.horas_cumplidas,
    cm.horas_validadas,
    cm.observaciones,
    pc.id_pago,
    pc.monto_pagado,
    pc.fecha_pago,
    pc.comprobante_archivo,
    pc.estado_validacion as estado_pago,
    pc.observaciones_validacion,
    CASE 
        WHEN cm.fecha_vencimiento < CURDATE() AND cm.estado = 'pendiente' THEN 'vencida'
        ELSE cm.estado
    END as estado_actual,
    CASE
        WHEN cm.horas_cumplidas >= cm.horas_requeridas THEN TRUE
        ELSE FALSE
    END as cumple_horas
FROM Cuotas_Mensuales cm
INNER JOIN Usuario u ON cm.id_usuario = u.id_usuario
INNER JOIN Viviendas v ON cm.id_vivienda = v.id_vivienda
INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
LEFT JOIN Pagos_Cuotas pc ON cm.id_cuota = pc.id_cuota AND pc.estado_validacion != 'rechazado';

-- ⭐ CAMBIO: Tabla de pagos de cuotas - SOLO TRANSFERENCIA
CREATE TABLE IF NOT EXISTS Pagos_Cuotas (
    id_pago INT PRIMARY KEY AUTO_INCREMENT,
    id_cuota INT NOT NULL,
    id_usuario INT NOT NULL,
    monto_pagado DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('transferencia') DEFAULT 'transferencia' COMMENT 'Solo se acepta transferencia bancaria',
    comprobante_archivo VARCHAR(200) NOT NULL COMMENT 'Comprobante de transferencia obligatorio',
    numero_comprobante VARCHAR(50) COMMENT 'Número de referencia de la transferencia',
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_validacion ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    observaciones_validacion TEXT,
    fecha_validacion DATETIME NULL,
    incluye_deuda_horas TINYINT(1) DEFAULT 0 COMMENT 'Indica si el pago incluye deuda de horas no trabajadas',
    monto_deuda_horas DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Monto específico de deuda por horas (84h mensuales requeridas)',
    FOREIGN KEY (id_cuota) REFERENCES Cuotas_Mensuales(id_cuota) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    INDEX idx_cuota (id_cuota),
    INDEX idx_estado (estado_validacion),
    INDEX idx_fecha_pago (fecha_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- PROCEDIMIENTO ALMACENADO (ACTUALIZADO)
-- ==========================================

DROP PROCEDURE IF EXISTS GenerarCuotasMensuales;

DELIMITER //

CREATE PROCEDURE GenerarCuotasMensuales(IN p_mes INT, IN p_anio INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_id_usuario INT;
    DECLARE v_id_vivienda INT;
    DECLARE v_id_tipo INT;
    DECLARE v_monto_base DECIMAL(10,2);
    DECLARE v_deuda_anterior DECIMAL(10,2);
    DECLARE v_fecha_vencimiento DATE;
    DECLARE v_count INT;
    
    DECLARE cur CURSOR FOR 
        SELECT DISTINCT 
            COALESCE(av.id_usuario, u.id_usuario) as id_usuario,
            av.id_vivienda,
            v.id_tipo
        FROM Asignacion_Vivienda av
        INNER JOIN Viviendas v ON av.id_vivienda = v.id_vivienda
        INNER JOIN Usuario u ON (av.id_usuario = u.id_usuario OR av.id_nucleo = u.id_nucleo)
        WHERE av.activa = TRUE
        AND u.estado = 'aceptado';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    SET v_fecha_vencimiento = LAST_DAY(CONCAT(p_anio, '-', LPAD(p_mes, 2, '0'), '-01'));
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_id_usuario, v_id_vivienda, v_id_tipo;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET v_count = 0;
        SELECT COUNT(*) INTO v_count
        FROM Cuotas_Mensuales
        WHERE id_usuario = v_id_usuario
        AND mes = p_mes
        AND anio = p_anio;
        
        IF v_count > 0 THEN
            ITERATE read_loop;
        END IF;
        
        SET v_monto_base = 0;
        SELECT monto_mensual INTO v_monto_base
        FROM Config_Cuotas
        WHERE id_tipo = v_id_tipo
        AND activo = TRUE
        AND fecha_vigencia_desde <= CURDATE()
        AND (fecha_vigencia_hasta IS NULL OR fecha_vigencia_hasta >= CURDATE())
        LIMIT 1;
        
        IF v_monto_base IS NULL OR v_monto_base = 0 THEN
            ITERATE read_loop;
        END IF;
        
        SET v_deuda_anterior = 0;
        SELECT COALESCE(SUM(monto + monto_pendiente_anterior), 0) INTO v_deuda_anterior
        FROM Cuotas_Mensuales
        WHERE id_usuario = v_id_usuario
        AND estado != 'pagada'
        AND (anio < p_anio OR (anio = p_anio AND mes < p_mes));
        
        -- ⭐ CAMBIO: Insertar con 84.00 horas requeridas (21h semanales × 4 semanas)
        INSERT INTO Cuotas_Mensuales 
            (id_usuario, id_vivienda, mes, anio, monto, monto_pendiente_anterior, 
             fecha_vencimiento, horas_requeridas, estado)
        VALUES 
            (v_id_usuario, v_id_vivienda, p_mes, p_anio, v_monto_base, v_deuda_anterior,
             v_fecha_vencimiento, 84.00, 'pendiente');
        
    END LOOP;
    
    CLOSE cur;
END//

DELIMITER ;

-- ==========================================
-- EVENTO AUTOMÁTICO
-- ==========================================

SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS GenerarCuotasAutomatico;

DELIMITER //

CREATE EVENT GenerarCuotasAutomatico
ON SCHEDULE EVERY 1 MONTH
STARTS CONCAT(DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-'), '01 00:01:00')
DO
BEGIN
    DECLARE v_mes INT;
    DECLARE v_anio INT;
    
    SET v_mes = MONTH(CURDATE());
    SET v_anio = YEAR(CURDATE());
    
    CALL GenerarCuotasMensuales(v_mes, v_anio);
END//

DELIMITER ;

-- ==========================================
-- TRIGGERS Y FUNCIONES
-- ==========================================

DROP TRIGGER IF EXISTS actualizar_horas_cuota;

DELIMITER //

CREATE TRIGGER actualizar_horas_cuota
AFTER UPDATE ON Registro_Horas
FOR EACH ROW
BEGIN
    IF NEW.estado = 'aprobado' AND OLD.estado != 'aprobado' THEN
        -- Actualizar horas cumplidas en la cuota correspondiente
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
END//

DELIMITER ;

DROP FUNCTION IF EXISTS CalcularDeudaUsuario;

DELIMITER //

CREATE FUNCTION CalcularDeudaUsuario(p_id_usuario INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_deuda DECIMAL(10,2);
    
    SELECT COALESCE(SUM(monto + monto_pendiente_anterior), 0) INTO v_deuda
    FROM Cuotas_Mensuales
    WHERE id_usuario = p_id_usuario
    AND estado != 'pagada';
    
    RETURN v_deuda;
END//

DELIMITER ;

-- ==========================================
-- ACTUALIZAR DATOS EXISTENTES (SI LOS HAY)
-- ==========================================

-- Actualizar cuotas existentes con horas_requeridas = 21 a 84
UPDATE Cuotas_Mensuales 
SET horas_requeridas = 84.00 
WHERE horas_requeridas = 21.00 
AND estado != 'pagada';

-- Actualizar pagos existentes a transferencia (si tienen otro método)
UPDATE Pagos_Cuotas 
SET metodo_pago = 'transferencia' 
WHERE metodo_pago != 'transferencia';

-- ==========================================
-- COMENTARIOS ADICIONALES
-- ==========================================

-- Agregar comentarios descriptivos
ALTER TABLE Cuotas_Mensuales 
MODIFY COLUMN horas_requeridas DECIMAL(5,2) DEFAULT 84.00 
COMMENT '21 horas semanales × 4 semanas = 84 horas mensuales requeridas';

ALTER TABLE Pagos_Cuotas
MODIFY COLUMN metodo_pago ENUM('transferencia') DEFAULT 'transferencia' 
COMMENT 'Solo se acepta transferencia bancaria como método de pago';

ALTER TABLE Pagos_Cuotas
MODIFY COLUMN monto_deuda_horas DECIMAL(10,2) DEFAULT 0.00 
COMMENT 'Deuda por horas no trabajadas: (84h - horas_cumplidas) × $160';

-- ==========================================
-- VERIFICACIONES
-- ==========================================

-- Verificar configuración de precios
SELECT 
    tv.nombre as 'Tipo Vivienda',
    tv.habitaciones as 'Habitaciones',
    cc.monto_mensual as 'Cuota Mensual',
    cc.activo as 'Activo'
FROM Config_Cuotas cc
INNER JOIN Tipo_Vivienda tv ON cc.id_tipo = tv.id_tipo
WHERE cc.activo = TRUE
ORDER BY tv.habitaciones;

-- Verificar horas requeridas en cuotas
SELECT 
    DISTINCT horas_requeridas as 'Horas Requeridas',
    COUNT(*) as 'Cantidad de Cuotas'
FROM Cuotas_Mensuales
GROUP BY horas_requeridas;

-- Verificar métodos de pago
SELECT 
    DISTINCT metodo_pago as 'Método de Pago',
    COUNT(*) as 'Cantidad de Pagos'
FROM Pagos_Cuotas
GROUP BY metodo_pago;

-- ==========================================
-- 1. TABLA DE SOLICITUDES
-- ==========================================

CREATE TABLE IF NOT EXISTS Solicitudes (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo_solicitud ENUM('horas', 'pago', 'vivienda', 'general', 'otro') DEFAULT 'general',
    asunto VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    archivo_adjunto VARCHAR(500) NULL COMMENT 'Ruta relativa del archivo (certificados, etc.)',
    estado ENUM('pendiente', 'en_revision', 'resuelta', 'rechazada') DEFAULT 'pendiente',
    prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_creacion DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. TABLA DE RESPUESTAS A SOLICITUDES
-- ==========================================

CREATE TABLE IF NOT EXISTS Respuestas_Solicitudes (
    id_respuesta INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT NOT NULL,
    id_usuario INT NOT NULL COMMENT 'Quien responde (admin o usuario original)',
    es_admin BOOLEAN DEFAULT FALSE COMMENT 'TRUE si es respuesta del admin',
    mensaje TEXT NOT NULL,
    archivo_adjunto VARCHAR(500) NULL,
    fecha_respuesta DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_solicitud) REFERENCES Solicitudes(id_solicitud) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    INDEX idx_solicitud (id_solicitud),
    INDEX idx_fecha (fecha_respuesta DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. VISTA COMPLETA DE SOLICITUDES
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
FROM Solicitudes s
INNER JOIN Usuario u ON s.id_usuario = u.id_usuario
LEFT JOIN Respuestas_Solicitudes rs ON s.id_solicitud = rs.id_solicitud
GROUP BY s.id_solicitud
ORDER BY s.fecha_creacion DESC;


-- ==========================================
-- TABLA DE JUSTIFICACIONES DE HORAS
-- ==========================================

CREATE TABLE IF NOT EXISTS Justificaciones_Horas (
    id_justificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INT NOT NULL,
    horas_justificadas DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    motivo TEXT NOT NULL,
    archivo_adjunto VARCHAR(500) NULL COMMENT 'Certificado médico, permiso, etc.',
    monto_descontado DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'horas_justificadas × $160',
    id_admin INT NOT NULL COMMENT 'Admin que aprobó la justificación',
    fecha_justificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('aprobada', 'rechazada') DEFAULT 'aprobada',
    observaciones TEXT NULL,
    
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_admin) REFERENCES Usuario(id_usuario),
    
    INDEX idx_usuario_periodo (id_usuario, mes, anio),
    INDEX idx_fecha (fecha_justificacion DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- VISTA COMPLETA CON JUSTIFICACIONES
-- ==========================================

CREATE OR REPLACE VIEW Vista_Cuotas_Con_Justificaciones AS
SELECT 
    cm.id_cuota,
    cm.id_usuario,
    u.nombre_completo,
    u.email,
    cm.id_vivienda,
    v.numero_vivienda,
    tv.nombre as tipo_vivienda,
    tv.habitaciones,
    cm.mes,
    cm.anio,
    cm.monto as monto_base,
    cm.monto_pendiente_anterior,
    
    -- Cálculo de deuda de horas
    cm.horas_requeridas,
    cm.horas_cumplidas,
    GREATEST(0, cm.horas_requeridas - cm.horas_cumplidas) as horas_faltantes_base,
    
    -- Horas justificadas del mes
    COALESCE(SUM(jh.horas_justificadas), 0) as horas_justificadas,
    COALESCE(SUM(jh.monto_descontado), 0) as monto_justificado,
    
    -- Horas faltantes DESPUÉS de justificaciones
    GREATEST(0, cm.horas_requeridas - cm.horas_cumplidas - COALESCE(SUM(jh.horas_justificadas), 0)) as horas_faltantes_real,
    
    -- Deuda en pesos DESPUÉS de justificaciones
    GREATEST(0, cm.horas_requeridas - cm.horas_cumplidas - COALESCE(SUM(jh.horas_justificadas), 0)) * 160 as deuda_horas_pesos,
    
    -- Monto total a pagar
    (cm.monto + cm.monto_pendiente_anterior + 
     (GREATEST(0, cm.horas_requeridas - cm.horas_cumplidas - COALESCE(SUM(jh.horas_justificadas), 0)) * 160)) as monto_total,
    
    cm.estado,
    cm.fecha_vencimiento,
    cm.horas_validadas,
    cm.observaciones,
    
    -- Info de pago
    pc.id_pago,
    pc.monto_pagado,
    pc.fecha_pago,
    pc.comprobante_archivo,
    pc.estado_validacion as estado_pago,
    pc.observaciones_validacion,
    
    -- Estado actual
    CASE 
        WHEN cm.fecha_vencimiento < CURDATE() AND cm.estado = 'pendiente' THEN 'vencida'
        ELSE cm.estado
    END as estado_actual
    
FROM Cuotas_Mensuales cm
INNER JOIN Usuario u ON cm.id_usuario = u.id_usuario
INNER JOIN Viviendas v ON cm.id_vivienda = v.id_vivienda
INNER JOIN Tipo_Vivienda tv ON v.id_tipo = tv.id_tipo
LEFT JOIN Justificaciones_Horas jh ON 
    cm.id_usuario = jh.id_usuario AND 
    cm.mes = jh.mes AND 
    cm.anio = jh.anio AND
    jh.estado = 'aprobada'
LEFT JOIN Pagos_Cuotas pc ON cm.id_cuota = pc.id_cuota AND pc.estado_validacion != 'rechazado'
GROUP BY cm.id_cuota;


-- ==========================================
-- TABLA DE SOLICITUDES PARA UNIRSE A NÚCLEOS
-- ==========================================

CREATE TABLE IF NOT EXISTS Solicitudes_Nucleo (
    id_solicitud_nucleo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_nucleo INT NOT NULL,
    mensaje TEXT NULL COMMENT 'Mensaje opcional del usuario',
    estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta DATETIME NULL,
    id_admin_respuesta INT NULL COMMENT 'Admin que procesó la solicitud',
    observaciones_admin TEXT NULL,
    
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar(id_nucleo) ON DELETE CASCADE,
    FOREIGN KEY (id_admin_respuesta) REFERENCES Usuario(id_usuario),
    
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_solicitud DESC),
    INDEX idx_nucleo (id_nucleo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- VISTA COMPLETA DE SOLICITUDES DE NÚCLEOS
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
FROM Solicitudes_Nucleo sn
INNER JOIN Usuario u ON sn.id_usuario = u.id_usuario
INNER JOIN Nucleo_Familiar nf ON sn.id_nucleo = nf.id_nucleo
LEFT JOIN Usuario u2 ON u2.id_nucleo = nf.id_nucleo
LEFT JOIN Usuario admin ON sn.id_admin_respuesta = admin.id_usuario
GROUP BY sn.id_solicitud_nucleo
ORDER BY sn.fecha_solicitud DESC;