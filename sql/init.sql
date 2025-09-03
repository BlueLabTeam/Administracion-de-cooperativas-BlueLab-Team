CREATE DATABASE IF NOT EXISTS proyecto2025;
USE proyecto2025;

-- USUARIOS Y ROLES
CREATE TABLE Rol (
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre_rol VARCHAR(50) NOT NULL
);

CREATE TABLE Nucleo_Familiar (
    id_nucleo INT PRIMARY KEY AUTO_INCREMENT,
    direccion VARCHAR(100),
    nombre_nucleo VARCHAR(50)
);

CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_completo VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    direccion VARCHAR(100),
    estado VARCHAR(20),
    fecha_ingreso DATE,
    fecha_nacimiento DATE,
    email VARCHAR(100) UNIQUE,
    id_nucleo INT,
    id_rol INT,
    FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar(id_nucleo),
    FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
);

CREATE TABLE Usuario_Telefono (
    id_usuario INT,
    telefono VARCHAR(20),
    PRIMARY KEY (id_usuario, telefono),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- PROVEEDORES Y MATERIALES
CREATE TABLE Proveedores (
    id_proveedor INT PRIMARY KEY AUTO_INCREMENT,
    nombre_proveedor VARCHAR(100),
    direccion VARCHAR(100),
    descripcion TEXT,
    email VARCHAR(100)
);

CREATE TABLE Proveedor_Telefono (
    id_proveedor INT,
    telefono VARCHAR(20),
    PRIMARY KEY (id_proveedor, telefono),
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor)
);

CREATE TABLE Materiales (
    id_material INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    caracteristicas TEXT
);

CREATE TABLE Proveedor_Material (
    id_proveedor INT,
    id_material INT,
    PRIMARY KEY (id_proveedor, id_material),
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor),
    FOREIGN KEY (id_material) REFERENCES Materiales(id_material)
);

CREATE TABLE Stock_Materiales (
    id_material INT PRIMARY KEY,
    cantidad_disponible INT NOT NULL,
    FOREIGN KEY (id_material) REFERENCES Materiales(id_material)
);

-- HERRAMIENTAS
CREATE TABLE Herramientas (
    id_herramienta INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    estado VARCHAR(20)
);

CREATE TABLE Herramienta_Responsable (
    id_asignacion INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_herramienta INT,
    fecha DATE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_herramienta) REFERENCES Herramientas(id_herramienta)
);

-- UNIDADES HABITACIONALES
CREATE TABLE Unidades_Habitacionales (
    id_unidad INT PRIMARY KEY AUTO_INCREMENT,
    direccion VARCHAR(100),
    estado VARCHAR(20)
);

CREATE TABLE Unidad_Usuario (
    id_unidad INT,
    id_usuario INT,
    PRIMARY KEY (id_unidad, id_usuario),
    FOREIGN KEY (id_unidad) REFERENCES Unidades_Habitacionales(id_unidad),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- ETAPAS DE CONSTRUCCIÓN
CREATE TABLE Etapas (
    id_etapa INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    fechas VARCHAR(100),
    estado VARCHAR(20)
);

CREATE TABLE Unidad_Etapa (
    id_unidad INT,
    id_etapa INT,
    PRIMARY KEY (id_unidad, id_etapa),
    FOREIGN KEY (id_unidad) REFERENCES Unidades_Habitacionales(id_unidad),
    FOREIGN KEY (id_etapa) REFERENCES Etapas(id_etapa)
);

-- GESTIÓN ECONÓMICA
CREATE TABLE Informes_Mensuales (
    id_informe INT PRIMARY KEY AUTO_INCREMENT,
    mes VARCHAR(20),
    descripcion TEXT,
    total_ingresado DECIMAL(10,2),
    total_gastado DECIMAL(10,2)
);

CREATE TABLE Horas_Trabajadas (
    id_hora INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE,
    horas DECIMAL(5,2),
    id_informe INT,
    FOREIGN KEY (id_informe) REFERENCES Informes_Mensuales(id_informe)
);

CREATE TABLE Informe_Etapas (
    id_informe_etapa INT PRIMARY KEY AUTO_INCREMENT,
    id_etapa INT,
    id_informe INT,
    costo_total DECIMAL(10,2),
    descripcion TEXT,
    FOREIGN KEY (id_etapa) REFERENCES Etapas(id_etapa),
    FOREIGN KEY (id_informe) REFERENCES Informes_Mensuales(id_informe)
);

-- DOCUMENTOS
CREATE TABLE Justificativos (
    id_justificativo INT PRIMARY KEY AUTO_INCREMENT,
    descripcion TEXT,
    archivo VARCHAR(200)
);

-- PAGOS Y DEUDAS
CREATE TABLE Comprobante_Pago (
    id_comprobante INT PRIMARY KEY AUTO_INCREMENT,
    fecha_pago DATE,
    archivo VARCHAR(200),
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Deudas (
    id_deuda INT PRIMARY KEY AUTO_INCREMENT,
    monto DECIMAL(10,2),
    descripcion TEXT,
    id_nucleo INT,
    FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar(id_nucleo)
);
