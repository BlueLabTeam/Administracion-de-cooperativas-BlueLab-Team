<?php
include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre_completo = $_POST['nombre_completo'];
    $CI = $_POST['CI'];
    // $telefono = $_POST['telefono']; Para más adelante, si se requiere
    $email = $_POST['email'];
    $direccion = $_POST['direccion'];
    $fecha_nacimiento = $_POST['fecha_nacimiento'];

    // Login // Sección comentada para futura implementación
    // $usuario = $_POST['usuario'];
    $contrasena = $_POST['contrasena'];
    // Validar que los campos requeridos no estén vacíos
    if (
        !empty($nombre_completo) &&
        !empty($CI) &&
        !empty($email) &&
        !empty($direccion) &&
        !empty($fecha_nacimiento) &&
        !empty($contrasena)
    ) {
        // Preparar la consulta SQL para insertar el usuario
        $sql = "INSERT INTO usuario (nombre_completo, cedula, contrasena, direccion, estado, fecha_ingreso, fecha_nacimiento, email) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)";
        $stmt = $pdo->prepare($sql);

        // Encriptar la contraseña antes de guardarla
        $hashed_password = password_hash($contrasena, PASSWORD_DEFAULT);

        if ($stmt) {
            $estado = 'pendiente'; // esto lo necesitás para enlazar el valor
            $fecha_ingreso = date('Y-m-d H:i:s'); // aunque usamos NOW(), te muestro cómo se hace

            $stmt->bindParam(1, $nombre_completo);
            $stmt->bindParam(2, $CI);
            $stmt->bindParam(3, $hashed_password);
            $stmt->bindParam(4, $direccion);
            $stmt->bindParam(5, $estado);
            $stmt->bindParam(6, $fecha_nacimiento);
            $stmt->bindParam(7, $email);

            if ($stmt->execute()) {
                echo "Usuario registrado exitosamente.";
            } else {
                echo "Error al registrar el usuario: " . implode(" ", $stmt->errorInfo());
            }
        } else {
            echo "Error en la preparación de la consulta: " . implode(" ", $pdo->errorInfo());
        }
    } else {
        echo "Por favor, complete todos los campos requeridos.";
    }
}
