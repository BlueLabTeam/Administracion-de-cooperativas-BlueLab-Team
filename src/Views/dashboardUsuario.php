<?php
// Verificar que el usuario esté autenticado
if (!isset($_SESSION['user_id'])) {
    header('Location: /login');
    exit();
}

// Debug en consola del navegador (invisible en la página)
echo "<script>
console.log('DEBUG INFO:', {
    user_id: " . json_encode($_SESSION['user_id'] ?? null) . ",
    is_admin: " . json_encode($_SESSION['is_admin'] ?? null) . ",
    id_rol: " . json_encode($_SESSION['id_rol'] ?? null) . ",
    nombre: " . json_encode($_SESSION['nombre_completo'] ?? null) . "
});
</script>";
?>
<!DOCTYPE html>
<html lang="es">

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Gestcoop – Panel de Usuario</title>
</head>

<body>
	<?php include __DIR__ . '/includes/dashboardHeader.html'; ?>

	<main class="container">
		<!-- Aquí va el resto del contenido del dashboard de usuario -->
	</main>

</body>

</html>