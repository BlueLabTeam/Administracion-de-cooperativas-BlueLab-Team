@"
-- Crear usuario administrador (Contraseña: admin1234)
DELETE FROM Usuario WHERE cedula='12345678';
DELETE FROM Nucleo_Familiar WHERE id_nucleo=1;
DELETE FROM Rol WHERE id_rol=1;

INSERT INTO Rol (id_rol, nombre_rol) VALUES (1, 'Administrador');
INSERT INTO Nucleo_Familiar (id_nucleo, direccion, nombre_nucleo) 
VALUES (1, 'Administración Central', 'Núcleo Administrador');

INSERT INTO Usuario (
    nombre_completo, cedula, contrasena, direccion, estado, 
    fecha_nacimiento, email, id_nucleo, id_rol
) VALUES (
    'Administrador del Sistema', '12345678',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Oficina Principal', 'aceptado', '1990-01-01',
    'admin@gestcoop.com', 1, 1
);
"@ | Out-File -FilePath "sql\seeds.sql" -Encoding utf8