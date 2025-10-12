<?php

session_start();


header('Content-Type: application/json');


$userData = [
    'nombre_completo' => htmlspecialchars($_SESSION['nombre_completo'] ?? 'Usuario'),
    'is_admin' => isset($_SESSION['is_admin']) && $_SESSION['is_admin']
];

echo json_encode($userData);
?>