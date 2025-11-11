-- ==========================================
-- DATOS INICIALES (SEEDS) - Sistema de Gestión Cooperativa
-- ==========================================

USE proyecto2025;

-- ==========================================
-- LIMPIAR DATOS EXISTENTES
-- ==========================================
DELETE FROM Usuario WHERE cedula='12345678';
DELETE FROM Nucleo_Familiar WHERE id_nucleo=1;
DELETE FROM Rol WHERE id_rol=1;

-- ==========================================
-- INSERTAR ROLES
-- ==========================================
INSERT INTO Rol (id_rol, nombre_rol) VALUES (1, 'Administrador');

-- ==========================================
-- INSERTAR NÚCLEO ADMINISTRADOR
-- ==========================================
INSERT INTO Nucleo_Familiar (id_nucleo, direccion, nombre_nucleo) 
VALUES (1, 'Administración Central', 'Núcleo Administrador');

-- ==========================================
-- CREAR USUARIO ADMINISTRADOR
-- Contraseña: adminadmin
-- ==========================================
INSERT INTO Usuario (
    nombre_completo, 
    cedula, 
    contrasena, 
    direccion, 
    estado, 
    fecha_nacimiento, 
    email, 
    id_nucleo, 
    id_rol
) VALUES (
    'Administrador del Sistema', 
    '12345678',
    '$2y$10$SvXY9vqFav9wCncj9qh05.Qn247a/XqVpxbwUaCQWND//wSwdV07q',
    'Oficina Principal', 
    'aceptado', 
    '1990-01-01',
    'admin@gestcoop.com', 
    1, 
    1
);

-- ==========================================
-- INSERTAR TIPOS DE VIVIENDA
-- ==========================================
INSERT IGNORE INTO Tipo_Vivienda (nombre, descripcion, habitaciones) VALUES
('Mono-ambiente', 'Vivienda de 1 habitacion con cocina y banio integrado', 1),
('2 Dormitorios', 'Vivienda de 2 dormitorios, sala, cocina y banio', 2),
('3 Dormitorios', 'Vivienda de 3 dormitorios, sala, cocina y 2 banios', 3);

-- ==========================================
-- INSERTAR CONFIGURACIÓN DE CUOTAS
-- ==========================================
INSERT INTO Config_Cuotas (id_tipo, monto_mensual, fecha_vigencia_desde, activo) VALUES
(1, 5000.00, '2025-01-01', TRUE),
(2, 7500.00, '2025-01-01', TRUE),
(3, 10000.00, '2025-01-01', TRUE);

-- ==========================================
-- INSERTAR VIVIENDAS DE EJEMPLO
-- ==========================================
INSERT INTO Viviendas (numero_vivienda, direccion, id_tipo, estado, metros_cuadrados) VALUES
('A-101', 'Bloque A, Planta Baja', 1, 'disponible', 35.50),
('A-102', 'Bloque A, Planta Baja', 2, 'disponible', 55.00),
('A-201', 'Bloque A, Primer Piso', 2, 'disponible', 55.00),
('A-202', 'Bloque A, Primer Piso', 3, 'disponible', 75.00),
('B-101', 'Bloque B, Planta Baja', 2, 'disponible', 58.00),
('B-102', 'Bloque B, Planta Baja', 3, 'disponible', 78.00),
('B-201', 'Bloque B, Primer Piso', 1, 'disponible', 38.00),
('B-202', 'Bloque B, Primer Piso', 2, 'disponible', 56.00);

-- ==========================================
-- GENERAR CUOTAS DEL MES ACTUAL
-- ==========================================
CALL GenerarCuotasMensuales(MONTH(CURDATE()), YEAR(CURDATE()));

-- ==========================================
-- MENSAJE FINAL
-- ==========================================
SELECT 'Datos iniciales insertados correctamente' AS status;
SELECT 'Usuario admin creado - Cedula: 12345678 | Password: adminadmin' AS credenciales;