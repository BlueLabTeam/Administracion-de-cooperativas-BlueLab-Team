-- ==========================================
-- ESTRUCTURA DE BASE DE DATOS - Sistema de Gestión Cooperativa
-- ==========================================

CREATE DATABASE IF NOT EXISTS proyecto2025 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE proyecto2025;

-- ==========================================
-- USUARIOS Y ROLES
-- ==========================================
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

CREATE TABLE IF NOT EXISTS Telefonos (
    id_telefono INT PRIMARY KEY AUTO_INCREMENT,
    entidad_tipo ENUM('usuario', 'proveedor') NOT NULL,
    entidad_id INT NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    tipo ENUM('movil', 'fijo', 'trabajo') DEFAULT 'movil',
    INDEX idx_entidad (entidad_tipo, entidad_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- PROVEEDORES Y MATERIALES
-- ==========================================
CREATE TABLE IF NOT EXISTS Proveedores (
    id_proveedor INT PRIMARY KEY AUTO_INCREMENT,
    nombre_proveedor VARCHAR(100),
    direccion VARCHAR(100),
    descripcion TEXT,
    email VARCHAR(100)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Materiales (
    id_material INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    caracteristicas TEXT,
    cantidad_disponible INT NOT NULL DEFAULT 0
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Proveedor_Material (
    id_proveedor INT,
    id_material INT,
    PRIMARY KEY (id_proveedor, id_material),
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores (id_proveedor),
    FOREIGN KEY (id_material) REFERENCES Materiales (id_material)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- HERRAMIENTAS
-- ==========================================
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

-- ==========================================
-- TIPOS DE VIVIENDA
-- ==========================================
CREATE TABLE IF NOT EXISTS Tipo_Vivienda (
    id_tipo INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    habitaciones INT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- ETAPAS DE CONSTRUCCION
-- ==========================================
CREATE TABLE IF NOT EXISTS Etapas (
    id_etapa INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    fechas VARCHAR(100),
    estado VARCHAR(20)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- VIVIENDAS
-- ==========================================
CREATE TABLE IF NOT EXISTS Viviendas (
    id_vivienda INT PRIMARY KEY AUTO_INCREMENT,
    numero_vivienda VARCHAR(20) UNIQUE NOT NULL,
    direccion VARCHAR(200),
    id_tipo INT NOT NULL,
    id_etapa INT,
    estado ENUM(
        'disponible',
        'ocupada',
        'mantenimiento'
    ) DEFAULT 'disponible',
    fecha_construccion DATE,
    metros_cuadrados DECIMAL(10, 2),
    observaciones TEXT,
    FOREIGN KEY (id_tipo) REFERENCES Tipo_Vivienda (id_tipo),
    FOREIGN KEY (id_etapa) REFERENCES Etapas (id_etapa)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- ASIGNACIONES DE VIVIENDA
-- ==========================================
CREATE TABLE IF NOT EXISTS Asignacion_Vivienda (
    id_asignacion INT PRIMARY KEY AUTO_INCREMENT,
    id_vivienda INT NOT NULL,
    id_usuario INT,
    id_nucleo INT,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATETIME NULL,
    activa BOOLEAN DEFAULT TRUE,
    observaciones TEXT,
    FOREIGN KEY (id_vivienda) REFERENCES Viviendas (id_vivienda),
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar (id_nucleo) ON DELETE CASCADE,
    CONSTRAINT chk_asignacion CHECK (
        (
            id_usuario IS NOT NULL
            AND id_nucleo IS NULL
        )
        OR (
            id_usuario IS NULL
            AND id_nucleo IS NOT NULL
        )
    )
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- NOTIFICACIONES
-- ==========================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo ENUM(
        'info',
        'importante',
        'urgente',
        'exito'
    ) DEFAULT 'info',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fecha (fecha_creacion)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuario_notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_notificacion INT NOT NULL,
    leida TINYINT(1) DEFAULT 0,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura DATETIME NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_notificacion) REFERENCES notificaciones (id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_notification (id_usuario, id_notificacion),
    INDEX idx_usuario_leida (id_usuario, leida),
    INDEX idx_notificacion (id_notificacion)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- TAREAS
-- ==========================================
CREATE TABLE IF NOT EXISTS Tareas (
    id_tarea INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    estado ENUM(
        'pendiente',
        'en_progreso',
        'completada',
        'cancelada'
    ) DEFAULT 'pendiente',
    tipo_asignacion ENUM('usuario', 'nucleo') DEFAULT 'usuario',
    id_creador INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_creador) REFERENCES Usuario (id_usuario),
    INDEX idx_estado (estado),
    INDEX idx_fechas (fecha_inicio, fecha_fin)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Tarea_Usuario (
    id_asignacion INT PRIMARY KEY AUTO_INCREMENT,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    progreso INT DEFAULT 0,
    estado_usuario ENUM(
        'pendiente',
        'en_progreso',
        'completada'
    ) DEFAULT 'pendiente',
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_completada DATETIME NULL,
    FOREIGN KEY (id_tarea) REFERENCES Tareas (id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    UNIQUE KEY unique_tarea_usuario (id_tarea, id_usuario),
    INDEX idx_usuario (id_usuario),
    INDEX idx_estado (estado_usuario)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Tarea_Nucleo (
    id_asignacion INT PRIMARY KEY AUTO_INCREMENT,
    id_tarea INT NOT NULL,
    id_nucleo INT NOT NULL,
    progreso INT DEFAULT 0,
    estado_nucleo ENUM(
        'pendiente',
        'en_progreso',
        'completada'
    ) DEFAULT 'pendiente',
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_completada DATETIME NULL,
    FOREIGN KEY (id_tarea) REFERENCES Tareas (id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar (id_nucleo) ON DELETE CASCADE,
    UNIQUE KEY unique_tarea_nucleo (id_tarea, id_nucleo),
    INDEX idx_nucleo (id_nucleo),
    INDEX idx_estado (estado_nucleo)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Tarea_Avances (
    id_avance INT PRIMARY KEY AUTO_INCREMENT,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    comentario TEXT NOT NULL,
    progreso_reportado INT DEFAULT 0,
    archivo VARCHAR(200) NULL,
    fecha_avance DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarea) REFERENCES Tareas (id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario),
    INDEX idx_tarea (id_tarea),
    INDEX idx_fecha (fecha_avance)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Tarea_Material (
    id_tarea INT NOT NULL,
    id_material INT NOT NULL,
    cantidad_requerida INT NOT NULL DEFAULT 1,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_tarea, id_material),
    FOREIGN KEY (id_tarea) REFERENCES Tareas (id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_material) REFERENCES Materiales (id_material) ON DELETE CASCADE,
    INDEX idx_tarea (id_tarea),
    INDEX idx_material (id_material)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- SOLICITUDES DE MATERIALES
-- ==========================================
CREATE TABLE IF NOT EXISTS Solicitud_Material (
    id_solicitud INT PRIMARY KEY AUTO_INCREMENT,
    id_material INT NOT NULL,
    cantidad_solicitada INT NOT NULL,
    id_usuario INT NOT NULL,
    descripcion TEXT,
    estado ENUM(
        'pendiente',
        'aprobada',
        'rechazada',
        'entregada'
    ) DEFAULT 'pendiente',
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta DATETIME NULL,
    FOREIGN KEY (id_material) REFERENCES Materiales (id_material),
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_solicitud)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- REGISTRO DE HORAS
-- ==========================================
CREATE TABLE IF NOT EXISTS Registro_Horas (
    id_registro INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NULL,
    total_horas DECIMAL(5, 2) DEFAULT 0.00,
    descripcion TEXT,
    estado ENUM(
        'pendiente',
        'aprobado',
        'rechazado'
    ) DEFAULT 'pendiente',
    observaciones TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario_fecha (id_usuario, fecha),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha),
    CONSTRAINT chk_entrada_salida CHECK (
        hora_salida IS NULL
        OR hora_salida > hora_entrada
    )
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- TABLA PARA PRIMER PAGO DE REGISTRO
-- ==========================================
CREATE TABLE IF NOT EXISTS pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    comprobante_archivo VARCHAR(255) NOT NULL,
    monto DECIMAL(10, 2) DEFAULT 5000.00 COMMENT 'Monto del primer pago',
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_validacion ENUM(
        'pendiente',
        'aprobado',
        'rechazado'
    ) DEFAULT 'pendiente',
    fecha_validacion TIMESTAMP NULL,
    observaciones TEXT,
    tipo_pago ENUM(
        'primer_pago',
        'cuota_mensual'
    ) DEFAULT 'primer_pago',
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_estado (estado_validacion),
    INDEX idx_fecha (fecha_pago)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- SISTEMA DE CUOTAS MENSUALES
-- ==========================================
CREATE TABLE IF NOT EXISTS Config_Cuotas (
    id_config INT PRIMARY KEY AUTO_INCREMENT,
    id_tipo INT NOT NULL,
    monto_mensual DECIMAL(10, 2) NOT NULL,
    fecha_vigencia_desde DATE NOT NULL,
    fecha_vigencia_hasta DATE NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_tipo) REFERENCES Tipo_Vivienda (id_tipo),
    INDEX idx_tipo_activo (id_tipo, activo)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Cuotas_Mensuales (
    id_cuota INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_vivienda INT NULL COMMENT 'NULL = Usuario sin vivienda asignada',
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    monto_pendiente_anterior DECIMAL(10, 2) DEFAULT 0.00,
    estado ENUM(
        'pendiente',
        'pagada',
        'vencida',
        'exonerada'
    ) DEFAULT 'pendiente',
    fecha_vencimiento DATE NOT NULL,
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    horas_requeridas DECIMAL(5, 2) DEFAULT 84.00,
    horas_cumplidas DECIMAL(5, 2) DEFAULT 0.00,
    horas_validadas BOOLEAN DEFAULT FALSE,
    pendiente_asignacion TINYINT(1) DEFAULT 0 COMMENT 'Indica si esta esperando asignacion de vivienda',
    observaciones TEXT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_vivienda) REFERENCES Viviendas (id_vivienda),
    UNIQUE KEY unique_usuario_mes_anio (id_usuario, mes, anio),
    INDEX idx_usuario_estado (id_usuario, estado),
    INDEX idx_fecha_vencimiento (fecha_vencimiento),
    INDEX idx_pendiente_asignacion (pendiente_asignacion)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Pagos_Cuotas (
    id_pago INT PRIMARY KEY AUTO_INCREMENT,
    id_cuota INT NOT NULL,
    id_usuario INT NOT NULL,
    monto_pagado DECIMAL(10, 2) NOT NULL,
    metodo_pago ENUM('transferencia') DEFAULT 'transferencia',
    comprobante_archivo VARCHAR(200) NOT NULL,
    numero_comprobante VARCHAR(50),
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_validacion ENUM(
        'pendiente',
        'aprobado',
        'rechazado'
    ) DEFAULT 'pendiente',
    observaciones_validacion TEXT,
    fecha_validacion DATETIME NULL,
    incluye_deuda_horas TINYINT(1) DEFAULT 0,
    monto_deuda_horas DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (id_cuota) REFERENCES Cuotas_Mensuales (id_cuota) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario),
    INDEX idx_cuota (id_cuota),
    INDEX idx_estado (estado_validacion),
    INDEX idx_fecha_pago (fecha_pago)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- JUSTIFICACIONES DE HORAS
-- ==========================================
CREATE TABLE IF NOT EXISTS Justificaciones_Horas (
    id_justificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INT NOT NULL,
    horas_justificadas DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    motivo TEXT NOT NULL,
    archivo_adjunto VARCHAR(500) NULL,
    monto_descontado DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    id_admin INT NOT NULL,
    fecha_justificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('aprobada', 'rechazada') DEFAULT 'aprobada',
    observaciones TEXT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_admin) REFERENCES Usuario (id_usuario),
    INDEX idx_usuario_periodo (id_usuario, mes, anio),
    INDEX idx_fecha (fecha_justificacion DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- SOLICITUDES GENERALES
-- ==========================================
CREATE TABLE IF NOT EXISTS Solicitudes (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo_solicitud ENUM(
        'horas',
        'pago',
        'vivienda',
        'general',
        'otro'
    ) DEFAULT 'general',
    asunto VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    archivo_adjunto VARCHAR(500) NULL,
    estado ENUM(
        'pendiente',
        'en_revision',
        'resuelta',
        'rechazada'
    ) DEFAULT 'pendiente',
    prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_creacion DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Respuestas_Solicitudes (
    id_respuesta INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT NOT NULL,
    id_usuario INT NOT NULL,
    es_admin BOOLEAN DEFAULT FALSE,
    mensaje TEXT NOT NULL,
    archivo_adjunto VARCHAR(500) NULL,
    fecha_respuesta DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_solicitud) REFERENCES Solicitudes (id_solicitud) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    INDEX idx_solicitud (id_solicitud),
    INDEX idx_fecha (fecha_respuesta DESC)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- SOLICITUDES PARA UNIRSE A NUCLEOS
-- ==========================================
CREATE TABLE IF NOT EXISTS Solicitudes_Nucleo (
    id_solicitud_nucleo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_nucleo INT NOT NULL,
    mensaje TEXT NULL,
    estado ENUM(
        'pendiente',
        'aprobada',
        'rechazada'
    ) DEFAULT 'pendiente',
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta DATETIME NULL,
    id_admin_respuesta INT NULL,
    observaciones_admin TEXT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar (id_nucleo) ON DELETE CASCADE,
    FOREIGN KEY (id_admin_respuesta) REFERENCES Usuario (id_usuario),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_solicitud DESC),
    INDEX idx_nucleo (id_nucleo)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ==========================================
-- INDICES ADICIONALES
-- ==========================================
CREATE INDEX idx_vivienda_tipo ON Viviendas (id_tipo);
CREATE INDEX idx_vivienda_estado ON Viviendas (estado);
CREATE INDEX idx_asignacion_activa ON Asignacion_Vivienda (activa);
CREATE INDEX idx_cuota_mes_anio ON Cuotas_Mensuales (mes, anio);
CREATE INDEX idx_pago_fecha ON Pagos_Cuotas (fecha_pago);
CREATE INDEX idx_telefono_busqueda ON Telefonos (telefono);

-- ==========================================
-- MENSAJE FINAL
-- ==========================================
SELECT 'Estructura de base de datos proyecto2025 creada correctamente' as status;