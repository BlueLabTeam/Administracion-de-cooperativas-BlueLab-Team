<?php
// Verificar que el usuario esté autenticado
if (!isset($_SESSION['user_id'])) {
    header('Location: /login');
    exit();
}

// DEBUG - ELIMINAR DESPUÉS
echo "<pre style='background: yellow; padding: 10px; margin: 10px;'>";
echo "DEBUG INFO:\n";
echo "user_id: " . ($_SESSION['user_id'] ?? 'NO DEFINIDO') . "\n";
echo "is_admin: " . (isset($_SESSION['is_admin']) ? ($_SESSION['is_admin'] ? 'TRUE' : 'FALSE') : 'NO DEFINIDO') . "\n";
echo "id_rol: " . ($_SESSION['id_rol'] ?? 'NO DEFINIDO') . "\n";
echo "</pre>";
// FIN DEBUG
?>


<?php
// Verificar que el usuario esté autenticado
if (!isset($_SESSION['user_id'])) {
    header('Location: /login');
    exit();
}
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