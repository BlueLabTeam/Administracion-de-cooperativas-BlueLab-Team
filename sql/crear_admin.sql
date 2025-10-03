-- Crear usuario administrador
-- Contraseña: admin1234

-- Eliminar datos previos si existen
DELETE FROM Usuario WHERE cedula='12345678';
DELETE FROM Nucleo_Familiar WHERE id_nucleo=1;
DELETE FROM Rol WHERE id_rol=1;

-- Crear el rol de Administrador
INSERT INTO Rol (id_rol, nombre_rol) VALUES (1, 'Administrador');

-- Crear un núcleo familiar para el admin
INSERT INTO Nucleo_Familiar (id_nucleo, direccion, nombre_nucleo) 
VALUES (1, 'Administración Central', 'Núcleo Administrador');

-- Crear el usuario administrador
-- Hash generado con PASSWORD_DEFAULT de PHP para 'admin1234'
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
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Oficina Principal',
    'aceptado',
    '1990-01-01',
    'admin@gestcoop.com',
    1,
    1
);

-- Verificar la creación
SELECT 
    u.id_usuario,
    u.nombre_completo,
    u.cedula,
    u.email,
    u.estado,
    r.nombre_rol,
    nf.nombre_nucleo
FROM Usuario u
INNER JOIN Rol r ON u.id_rol = r.id_rol
INNER JOIN Nucleo_Familiar nf ON u.id_nucleo = nf.id_nucleo
WHERE u.cedula = '12345678';