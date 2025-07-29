<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre_completo = $_POST['nombre_completo'];
    $CI = $_POST['CI'];
    $telefono = $_POST['telefono'];
    $email = $_POST['email'];
    $direccion = $_POST['direccion'];
    $fecha_nacimiento = $_POST['fecha_nacimiento'];

    // Login
    $usuario = $_POST['usuario'];
    $contrasena = $_POST['contrasena'];
    // Aquí puedes agregar la lógica para procesar los datos del formulario

    // Validar que los campos requeridos no estén vacíos
    if (
        !empty($nombre_completo) && !empty($CI) && !empty($telefono) &&
        !empty($email) && !empty($direccion) && !empty($fecha_nacimiento) &&
        !empty($usuario) && !empty($contrasena)
    ) {
        // Preparar la consulta SQL para insertar el usuario
        $sql = "INSERT INTO usuarios (nombre_completo, CI, telefono, email, direccion, fecha_nacimiento, usuario, contrasena)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);

        // Encriptar la contraseña antes de guardarla
        $hashed_password = password_hash($contrasena, PASSWORD_DEFAULT);

        if ($stmt) {
            $stmt->bind_param(
                "ssssssss",
                $nombre_completo,
                $CI,
                $telefono,
                $email,
                $direccion,
                $fecha_nacimiento,
                $usuario,
                $hashed_password
            );
            if ($stmt->execute()) {
                echo "Usuario registrado exitosamente.";
            } else {
                echo "Error al registrar el usuario: " . $stmt->error;
            }
            $stmt->close();
        } else {
            echo "Error en la preparación de la consulta: " . $conn->error;
        }
    } else {
        echo "Por favor, complete todos los campos requeridos.";
    }

}