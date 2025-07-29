CREATE DATABASE IF NOT EXISTS cooperativa;
USE cooperativa;

-- Tabla de roles de usuario (ej: administrador, socio, etc.)
CREATE TABLE Rol (
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre_rol VARCHAR(50) NOT NULL
);

-- Tabla de usuarios del sistema
CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_completo VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    direccion VARCHAR(150),
    estado VARCHAR(20),
    fecha_ingreso DATE,
    fecha_nacimiento DATE,
    email VARCHAR(100) NOT NULL UNIQUE,
    id_nucleo INT,  -- FK a Nucleo_Familiar (se define más adelante)
    id_rol INT,
    -- FOREIGN KEY (id_nucleo) REFERENCES Nucleo_Familiar(id_nucleo),
    FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
);

-- Tabla de teléfonos asociados a un usuario// se usara despues
CREATE TABLE Usuario_Telefono (
    id_usuario INT,
    telefono VARCHAR(20),
    PRIMARY KEY (id_usuario, telefono),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);
