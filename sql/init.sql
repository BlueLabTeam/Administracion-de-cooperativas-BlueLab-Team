CREATE DATABASE IF NOT EXISTS proyecto2025 CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'replicador'@'%' IDENTIFIED WITH mysql_native_password BY 'replicapass';
GRANT REPLICATION SLAVE ON *.* TO 'replicador'@'%';
FLUSH PRIVILEGES;

USE proyecto2025;

-- USUARIOS Y ROLES
CREATE TABLE
    Rol (
        id_rol INT PRIMARY KEY AUTO_INCREMENT,
        nombre_rol VARCHAR(50) NOT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Nucleo_Familiar (
        id_nucleo INT PRIMARY KEY AUTO_INCREMENT,
        direccion VARCHAR(100),
        nombre_nucleo VARCHAR(50)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Usuario (
        id_usuario INT PRIMARY KEY AUTO_INCREMENT,
        nombre_completo VARCHAR(100) NOT NULL,
        cedula VARCHAR(20) UNIQUE NOT NULL,
        contrasena VARCHAR(255) NOT NULL,
        direccion VARCHAR(100),
        estado ENUM ('pendiente', 'enviado', 'aceptado', 'rechazado') NOT NULL DEFAULT 'pendiente',
        fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_nacimiento DATE,
        email VARCHAR(100) UNIQUE,
        id_nucleo INT,
        id_rol INT,
        FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar (id_nucleo),
        FOREIGN KEY (id_rol) REFERENCES Rol (id_rol)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Usuario_Telefono (
        id_usuario INT,
        telefono VARCHAR(20),
        PRIMARY KEY (id_usuario, telefono),
        FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- PROVEEDORES Y MATERIALES
CREATE TABLE
    Proveedores (
        id_proveedor INT PRIMARY KEY AUTO_INCREMENT,
        nombre_proveedor VARCHAR(100),
        direccion VARCHAR(100),
        descripcion TEXT,
        email VARCHAR(100)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Proveedor_Telefono (
        id_proveedor INT,
        telefono VARCHAR(20),
        PRIMARY KEY (id_proveedor, telefono),
        FOREIGN KEY (id_proveedor) REFERENCES Proveedores (id_proveedor)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Materiales (
        id_material INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100),
        caracteristicas TEXT
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Proveedor_Material (
        id_proveedor INT,
        id_material INT,
        PRIMARY KEY (id_proveedor, id_material),
        FOREIGN KEY (id_proveedor) REFERENCES Proveedores (id_proveedor),
        FOREIGN KEY (id_material) REFERENCES Materiales (id_material)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Stock_Materiales (
        id_material INT PRIMARY KEY,
        cantidad_disponible INT NOT NULL,
        FOREIGN KEY (id_material) REFERENCES Materiales (id_material)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- HERRAMIENTAS
CREATE TABLE
    Herramientas (
        id_herramienta INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100),
        estado VARCHAR(20)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Herramienta_Responsable (
        id_asignacion INT PRIMARY KEY AUTO_INCREMENT,
        id_usuario INT,
        id_herramienta INT,
        fecha DATE,
        FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario),
        FOREIGN KEY (id_herramienta) REFERENCES Herramientas (id_herramienta)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- UNIDADES HABITACIONALES
CREATE TABLE
    Unidades_Habitacionales (
        id_unidad INT PRIMARY KEY AUTO_INCREMENT,
        direccion VARCHAR(100),
        estado VARCHAR(20)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Unidad_Usuario (
        id_unidad INT,
        id_usuario INT,
        PRIMARY KEY (id_unidad, id_usuario),
        FOREIGN KEY (id_unidad) REFERENCES Unidades_Habitacionales (id_unidad),
        FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ETAPAS DE CONSTRUCCIÓN
CREATE TABLE
    Etapas (
        id_etapa INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100),
        fechas VARCHAR(100),
        estado VARCHAR(20)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Unidad_Etapa (
        id_unidad INT,
        id_etapa INT,
        PRIMARY KEY (id_unidad, id_etapa),
        FOREIGN KEY (id_unidad) REFERENCES Unidades_Habitacionales (id_unidad),
        FOREIGN KEY (id_etapa) REFERENCES Etapas (id_etapa)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- GESTIÓN ECONÓMICA
CREATE TABLE
    Informes_Mensuales (
        id_informe INT PRIMARY KEY AUTO_INCREMENT,
        mes VARCHAR(20),
        descripcion TEXT,
        total_ingresado DECIMAL(10, 2),
        total_gastado DECIMAL(10, 2)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Horas_Trabajadas (
        id_hora INT PRIMARY KEY AUTO_INCREMENT,
        fecha DATE,
        horas DECIMAL(5, 2),
        id_informe INT,
        FOREIGN KEY (id_informe) REFERENCES Informes_Mensuales (id_informe)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Informe_Etapas (
        id_informe_etapa INT PRIMARY KEY AUTO_INCREMENT,
        id_etapa INT,
        id_informe INT,
        costo_total DECIMAL(10, 2),
        descripcion TEXT,
        FOREIGN KEY (id_etapa) REFERENCES Etapas (id_etapa),
        FOREIGN KEY (id_informe) REFERENCES Informes_Mensuales (id_informe)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- DOCUMENTOS
CREATE TABLE
    Justificativos (
        id_justificativo INT PRIMARY KEY AUTO_INCREMENT,
        descripcion TEXT,
        archivo VARCHAR(200)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- PAGOS Y DEUDAS
CREATE TABLE
    Comprobante_Pago (
        id_comprobante INT PRIMARY KEY AUTO_INCREMENT,
        fecha_pago DATE,
        archivo VARCHAR(200),
        id_usuario INT,
        FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    Deudas (
        id_deuda INT PRIMARY KEY AUTO_INCREMENT,
        monto DECIMAL(10, 2),
        descripcion TEXT,
        id_nucleo INT,
        FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar (id_nucleo)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;