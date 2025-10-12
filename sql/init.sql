CREATE DATABASE IF NOT EXISTS proyecto2025 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE proyecto2025;

-- USUARIOS Y ROLES
CREATE TABLE Rol (
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre_rol VARCHAR(50) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE Nucleo_Familiar (
    id_nucleo INT PRIMARY KEY AUTO_INCREMENT,
    direccion VARCHAR(100),
    nombre_nucleo VARCHAR(50)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE Usuario (
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

CREATE TABLE Usuario_Telefono (
    id_usuario INT,
    telefono VARCHAR(20),
    PRIMARY KEY (id_usuario, telefono),
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- PROVEEDORES Y MATERIALES
CREATE TABLE Proveedores (
    id_proveedor INT PRIMARY KEY AUTO_INCREMENT,
    nombre_proveedor VARCHAR(100),
    direccion VARCHAR(100),
    descripcion TEXT,
    email VARCHAR(100)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE Proveedor_Telefono (
    id_proveedor INT,
    telefono VARCHAR(20),
    PRIMARY KEY (id_proveedor, telefono),
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores (id_proveedor)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE Materiales (
    id_material INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    caracteristicas TEXT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE Proveedor_Material (
    id_proveedor INT,
    id_material INT,
    PRIMARY KEY (id_proveedor, id_material),
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores (id_proveedor),
    FOREIGN KEY (id_material) REFERENCES Materiales (id_material)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE Stock_Materiales (
    id_material INT PRIMARY KEY,
    cantidad_disponible INT NOT NULL,
    FOREIGN KEY (id_material) REFERENCES Materiales (id_material)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- HERRAMIENTAS
CREATE TABLE Herramientas (
    id_herramienta INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    estado VARCHAR(20)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE Herramienta_Responsable (
    id_asignacion INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_herramienta INT,
    fecha DATE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario),
    FOREIGN KEY (id_herramienta) REFERENCES Herramientas (id_herramienta)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- UNIDADES HABITACIONALES
CREATE TABLE Unidades_Habitacionales (
    id_unidad INT PRIMARY KEY AUTO_INCREMENT,
    direccion VARCHAR(100),
    estado VARCHAR(20)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE Unidad_Usuario (
    id_unidad INT,
    id_usuario INT,
    PRIMARY KEY (id_unidad, id_usuario),
    FOREIGN KEY (id_unidad) REFERENCES Unidades_Habitacionales (id_unidad),
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ETAPAS DE CONSTRUCCIÓN
CREATE TABLE Etapas (
    id_etapa INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    fechas VARCHAR(100),
    estado VARCHAR(20)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE Unidad_Etapa (
    id_unidad INT,
    id_etapa INT,
    PRIMARY KEY (id_unidad, id_etapa),
    FOREIGN KEY (id_unidad) REFERENCES Unidades_Habitacionales (id_unidad),
    FOREIGN KEY (id_etapa) REFERENCES Etapas (id_etapa)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- GESTIÓN ECONÓMICA
CREATE TABLE Informes_Mensuales (
    id_informe INT PRIMARY KEY AUTO_INCREMENT,
    mes VARCHAR(20),
    descripcion TEXT,
    total_ingresado DECIMAL(10, 2),
    total_gastado DECIMAL(10, 2)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE Horas_Trabajadas (
    id_hora INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE,
    horas DECIMAL(5, 2),
    id_informe INT,
    FOREIGN KEY (id_informe) REFERENCES Informes_Mensuales (id_informe)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE Informe_Etapas (
    id_informe_etapa INT PRIMARY KEY AUTO_INCREMENT,
    id_etapa INT,
    id_informe INT,
    costo_total DECIMAL(10, 2),
    descripcion TEXT,
    FOREIGN KEY (id_etapa) REFERENCES Etapas (id_etapa),
    FOREIGN KEY (id_informe) REFERENCES Informes_Mensuales (id_informe)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- DOCUMENTOS
CREATE TABLE Justificativos (
    id_justificativo INT PRIMARY KEY AUTO_INCREMENT,
    descripcion TEXT,
    archivo VARCHAR(200)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- PAGOS Y DEUDAS
CREATE TABLE Comprobante_Pago (
    id_comprobante INT PRIMARY KEY AUTO_INCREMENT,
    fecha_pago DATE,
    archivo VARCHAR(200),
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE Deudas (
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
INSERT INTO Tipo_Vivienda (nombre, descripcion, habitaciones) VALUES
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
    ),
    CONSTRAINT chk_no_fin_semana CHECK (
        DAYOFWEEK(fecha) NOT IN (1, 7)  -- 1=Domingo, 7=Sábado
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
