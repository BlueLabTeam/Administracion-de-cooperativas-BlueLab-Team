USE proyecto2025;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE Respuestas_Solicitudes;
TRUNCATE TABLE Solicitudes;
TRUNCATE TABLE Solicitudes_Nucleo;

TRUNCATE TABLE Justificaciones_Horas;

TRUNCATE TABLE Pagos_Cuotas;
TRUNCATE TABLE Cuotas_Mensuales;
TRUNCATE TABLE Config_Cuotas;

TRUNCATE TABLE pagos;

TRUNCATE TABLE Registro_Horas;

TRUNCATE TABLE Solicitud_Material;

TRUNCATE TABLE Tarea_Avances;
TRUNCATE TABLE Tarea_Material;
TRUNCATE TABLE Tarea_Nucleo;
TRUNCATE TABLE Tarea_Usuario;
TRUNCATE TABLE Tareas;

TRUNCATE TABLE usuario_notificaciones;
TRUNCATE TABLE notificaciones;

TRUNCATE TABLE Asignacion_Vivienda;

TRUNCATE TABLE Viviendas;

TRUNCATE TABLE Herramienta_Responsable;
TRUNCATE TABLE Herramientas;

TRUNCATE TABLE Proveedor_Material;
TRUNCATE TABLE Materiales;
TRUNCATE TABLE Proveedores;

TRUNCATE TABLE Telefonos;

TRUNCATE TABLE Usuario;
TRUNCATE TABLE Nucleo_Familiar;
TRUNCATE TABLE Rol;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================
-- ROLES
-- ================================
INSERT INTO Rol (nombre_rol) VALUES
('admin'),
('usuario'),
('encargado');

-- ================================
-- NUCLEOS FAMILIARES
-- ================================
INSERT INTO Nucleo_Familiar (direccion, nombre_nucleo) VALUES
('Calle 123', 'Núcleo Pérez'),
('Av. Libertad 456', 'Núcleo González');

-- ================================
-- USUARIOS
-- ================================
INSERT INTO Usuario (
    nombre_completo, cedula, contrasena, direccion, estado,
    fecha_nacimiento, email, id_nucleo, id_rol
) VALUES
('Admin General', '1.111.111-1', '$2y$10$7cwquhOKyXPqWR4nqjwn..UrWgMSpeSRtUfWCf/20jBF9kj7IzAlC', 'Calle Admin 1', 'aceptado',
 '1980-05-20', 'admin@gestcoop.com', NULL, 1),

('Juan Pérez', '4.123.456-7', '$2y$10$igStP/DkBFwKw81zXEdyw.TvYtsSKzW9nG11Xuf7Kba0cJ1RVulmS', 'Calle 123', 'aceptado',
 '1990-02-10', 'juan@correo.com', 1, 2),

('Ana González', '5.987.654-3', '$2y$10$igStP/DkBFwKw81zXEdyw.TvYtsSKzW9nG11Xuf7Kba0cJ1RVulmS', 'Av. Libertad 456', 'aceptado',
 '1985-10-12', 'ana@correo.com', 2, 2),

('Encargado Obras', '3.555.555-5', '$2y$10$igStP/DkBFwKw81zXEdyw.TvYtsSKzW9nG11Xuf7Kba0cJ1RVulmS', 'Obras 99', 'aceptado',
 '1982-07-01', 'obras@gestcoop.com', NULL, 3);

-- ================================
-- TELEFONOS
-- ================================
INSERT INTO Telefonos (entidad_tipo, entidad_id, telefono, tipo) VALUES
('usuario', 1, '099111111', 'movil'),
('usuario', 2, '092222222', 'movil'),
('usuario', 3, '097333333', 'fijo');

-- ================================
-- PROVEEDORES
-- ================================
INSERT INTO Proveedores (nombre_proveedor, direccion, descripcion, email) VALUES
('Materiales SRL', 'Ruta 5 km 20', 'Proveedor general de materiales', 'contacto@materiales.com'),
('Ferretería López', 'Av. Central 223', 'Herramientas y accesorios', 'ventas@lopez.com');

-- ================================
-- MATERIALES
-- ================================
INSERT INTO Materiales (nombre, caracteristicas, cantidad_disponible) VALUES
('Cemento Portland', 'Bolsa 25kg', 200),
('Arena Fina', 'm3', 50),
('Ladrillo Común', 'Unidad 18x25', 5000),
('Martillo', 'Herramienta manual', 10);

-- Relación proveedor-material
INSERT INTO Proveedor_Material (id_proveedor, id_material) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 4);

-- ================================
-- HERRAMIENTAS
-- ================================
INSERT INTO Herramientas (nombre, estado) VALUES
('Taladro', 'operativo'),
('Sierra Circular', 'mantenimiento');

-- Asignación de herramienta
INSERT INTO Herramienta_Responsable (id_usuario, id_herramienta, fecha) VALUES
(4, 1, CURDATE());

-- ================================
-- TIPOS DE VIVIENDA
-- ================================
INSERT INTO Tipo_Vivienda (nombre, descripcion, habitaciones) VALUES
('Tipo A', 'Vivienda estándar', 2),
('Tipo B', 'Vivienda ampliada', 3);

-- ================================
-- ETAPAS
-- ================================
INSERT INTO Etapas (nombre, fechas, estado) VALUES
('Cimientos', '2025-01 a 2025-03', 'finalizado'),
('Paredes', '2025-03 a 2025-06', 'en progreso');

-- ================================
-- VIVIENDAS
-- ================================
INSERT INTO Viviendas (numero_vivienda, direccion, id_tipo, id_etapa, estado, fecha_construccion, metros_cuadrados)
VALUES
('A01', 'Manzana 1 Solar 1', 1, 2, 'disponible', '2025-02-01', 55.5),
('A02', 'Manzana 1 Solar 2', 1, 1, 'ocupada', '2025-01-10', 55.5),
('B01', 'Manzana 2 Solar 1', 2, 1, 'mantenimiento', '2025-01-15', 75.0);

-- ================================
-- ASIGNACION VIVIENDA
-- ================================
INSERT INTO Asignacion_Vivienda (id_vivienda, id_usuario, fecha_asignacion, activa)
VALUES
(2, 2, NOW(), TRUE);

-- ================================
-- NOTIFICACIONES
-- ================================
INSERT INTO notificaciones (titulo, mensaje, tipo) VALUES
('Bienvenido', 'Tu usuario fue creado correctamente.', 'exito'),
('Aviso Importante', 'Reunión del domingo a las 10 AM.', 'importante');

INSERT INTO usuario_notificaciones (id_usuario, id_notificacion, leida) VALUES
(2, 1, 0),
(3, 2, 1);

-- ================================
-- TAREAS
-- ================================
INSERT INTO Tareas (
    titulo, descripcion, fecha_inicio, fecha_fin, prioridad,
    estado, tipo_asignacion, id_creador
) VALUES
('Nivelar terreno', 'Preparar la base para nuevas viviendas', '2025-01-10', '2025-01-20', 'alta', 'pendiente', 'usuario', 4),

('Clasificar materiales', 'Organizar materiales en depósito', '2025-02-01', '2025-02-05', 'media', 'en_progreso', 'nucleo', 4);

INSERT INTO Tarea_Usuario (id_tarea, id_usuario, progreso) VALUES
(1, 2, 10);

INSERT INTO Tarea_Nucleo (id_tarea, id_nucleo, progreso) VALUES
(2, 1, 25);

INSERT INTO Tarea_Avances (id_tarea, id_usuario, comentario, progreso_reportado)
VALUES
(1, 2, 'Se comenzó la nivelación', 10);

INSERT INTO Tarea_Material (id_tarea, id_material, cantidad_requerida) VALUES
(1, 2, 3);

-- ================================
-- SOLICITUDES DE MATERIALES
-- ================================
INSERT INTO Solicitud_Material (id_material, cantidad_solicitada, id_usuario, descripcion)
VALUES
(1, 5, 2, 'Cemento para la etapa inicial');

-- ================================
-- REGISTRO DE HORAS
-- ================================
INSERT INTO Registro_Horas (id_usuario, fecha, hora_entrada, hora_salida, total_horas, descripcion, estado)
VALUES
(2, '2025-02-10', '08:00', '12:00', 4.0, 'Trabajo en obra', 'aprobado');

-- ================================
-- PRIMER PAGO
-- ================================
INSERT INTO pagos (id_usuario, comprobante_archivo, monto, estado_validacion)
VALUES
(2, 'comprobante1.pdf', 5000.00, 'aprobado');

-- ================================
-- CONFIGURACION DE CUOTAS
-- ================================
INSERT INTO Config_Cuotas (id_tipo, monto_mensual, fecha_vigencia_desde, activo)
VALUES
(1, 2500.00, '2025-01-01', TRUE),
(2, 3500.00, '2025-01-01', TRUE);

-- ================================
-- CUOTAS MENSUALES
-- ================================
INSERT INTO Cuotas_Mensuales (
    id_usuario, id_vivienda, mes, anio, monto, fecha_vencimiento
) VALUES
(2, 2, 1, 2025, 2500.00, '2025-02-10');

-- ================================
-- PAGOS DE CUOTAS
-- ================================
INSERT INTO Pagos_Cuotas (id_cuota, id_usuario, monto_pagado, comprobante_archivo)
VALUES
(1, 2, 2500.00, 'pago1.pdf');

-- ================================
-- JUSTIFICACIONES
-- ================================
INSERT INTO Justificaciones_Horas (id_usuario, mes, anio, horas_justificadas, motivo, id_admin)
VALUES
(2, 1, 2025, 5.0, 'Motivos personales', 1);

-- ================================
-- SOLICITUDES GENERALES
-- ================================
INSERT INTO Solicitudes (id_usuario, tipo_solicitud, asunto, descripcion)
VALUES
(2, 'vivienda', 'Cambio de vivienda', 'Solicito consideración para otra vivienda');

INSERT INTO Respuestas_Solicitudes (id_solicitud, id_usuario, es_admin, mensaje)
VALUES
(1, 1, TRUE, 'Su solicitud está siendo evaluada');

-- ================================
-- SOLICITUDES NUCLEO
-- ================================
INSERT INTO Solicitudes_Nucleo (id_usuario, id_nucleo, mensaje)
VALUES
(3, 1, 'Quiero integrarme al núcleo familiar');
