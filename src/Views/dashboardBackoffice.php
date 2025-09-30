<?php include __DIR__ . '/includes/dashboardAdminHeader.html'; ?>
<div id="main-content">
    <?php
    require __DIR__ . '/Views/pageAdmin/inicio.php';
    ?>
</div>
<!-- Contenedor principal con todas las secciones -->
<div id="main-content">
    <div id="inicio" class="page active"><?php include __DIR__ . '/Views/pageAdmin/inicio.php'; ?></div>
    <div id="facturacion" class="page"><?php include __DIR__ . '/Views/pageAdmin/facturacion.php'; ?></div>
    <div id="inventario" class="page"><?php include __DIR__ . '/Views/pageAdmin/inventario.php'; ?></div>
    <div id="notificaciones" class="page"><?php include __DIR__ . '/Views/pageAdmin/notificaciones.php'; ?></div>
    <div id="nucleo" class="page"><?php include __DIR__ . '/Views/pageAdmin/nucleo.php'; ?></div>
    <div id="reportes" class="page"><?php include __DIR__ . '/Views/pageAdmin/reportes.php'; ?></div>
    <div id="tareas" class="page"><?php include __DIR__ . '/Views/pageAdmin/tareas.php'; ?></div>
    <div id="usuarios" class="page"><?php include __DIR__ . '/Views/pageAdmin/usuarios.php'; ?></div>
    <div id="viviendas" class="page"><?php include __DIR__ . '/Views/pageAdmin/viviendas.php'; ?></div>
</div>
<script src="js/dashboardAdmin.js"></script>
</body>

</html>