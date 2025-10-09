-- ==========================================
-- Crear usuario administrador
-- Contraseña: admin1234
-- ==========================================

-- Eliminar datos previos si existen
DELETE FROM Usuario WHERE cedula='12345678';
DELETE FROM Rol WHERE id_rol=1;

-- Crear el rol de Administrador
INSERT INTO Rol (id_rol, nombre_rol) 
VALUES (1, 'Administrador');


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
    NULL, 
    1
);

-- Verificar la creación
SELECT 
    u.id_usuario,
    u.nombre_completo,
    u.cedula,
    u.email,
    u.estado,
    u.id_nucleo,
    r.nombre_rol,
    CASE 
        WHEN u.id_nucleo IS NULL THEN 'Sin núcleo asignado'
        ELSE nf.nombre_nucleo
    END as nucleo_info
FROM Usuario u
INNER JOIN Rol r ON u.id_rol = r.id_rol
LEFT JOIN Nucleo_Familiar nf ON u.id_nucleo = nf.id_nucleo
WHERE u.cedula = '12345678';


