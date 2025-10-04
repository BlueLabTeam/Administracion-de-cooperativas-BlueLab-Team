<?php
// Verificar que el usuario esté autenticado y sea admin
if (!isset($_SESSION['user_id'])) {
    header('Location: /login');
    exit();
}

if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    header('Location: /dashboard');
    exit();
}

// Obtener pagos pendientes
$userModel = new \App\Models\User();
$pagosPendientes = $userModel->getPendingPayments();
?>
<!DOCTYPE html>
<html lang="es">

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Gestcoop – Panel de Administrador</title>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
	<link rel="stylesheet" href="/assets/css/dashboardBase.css" />
	<link rel="stylesheet" href="/assets/css/dashboardHeader.css" />
	<link rel="stylesheet" href="/assets/css/dashboardNotificaciones.css" />
	<link rel="stylesheet" href="/assets/css/dashboardTareas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardPagos.css" />
	<link rel="stylesheet" href="/assets/css/dashboardUtils.css" />
</head>

<body>
	<?php include __DIR__ . '/includes/dashboardHeaderAdmin.html'; ?>

	<main class="content-area">
		<!-- SECCIÓN INICIO -->
		<section id="inicio-section" class="section-content active">
			<h2 class="section-title">Inicio - Panel Administrativo</h2>
			
			<div class="info-card">
				<h3>Bienvenido al Panel de Administración</h3>
				<p>Desde aquí puedes gestionar todos los aspectos de la cooperativa.</p>
				<p><strong>Secciones disponibles:</strong></p>
				<ul>
					<li><strong>Usuarios:</strong> Gestionar pagos pendientes y usuarios</li>
					<li><strong>Notificaciones:</strong> Enviar mensajes a los socios</li>
					<li><strong>Reportes:</strong> Visualizar estadísticas</li>
					<li><strong>Y más...</strong></li>
				</ul>
			</div>
		</section>

		<!-- SECCIÓN USUARIOS (con pagos pendientes) -->
		<section id="usuarios-section" class="section-content">
			<div class="admin-banner">
				<p>Gestión de Pagos Pendientes</p>
			</div>

			<div class="payments-container">
				<h2 class="section-title">Pagos Pendientes de Aprobación</h2>
				
				<?php if (empty($pagosPendientes)): ?>
					<div class="no-payments">
						<p>No hay pagos pendientes de revisión</p>
					</div>
				<?php else: ?>
					<?php foreach ($pagosPendientes as $pago): ?>
						<div class="payment-card" id="payment-<?php echo $pago['id_usuario']; ?>">
							<div class="payment-header">
								<div class="payment-info">
									<h3><?php echo htmlspecialchars($pago['nombre_completo']); ?></h3>
									<p><strong>Email:</strong> <?php echo htmlspecialchars($pago['email']); ?></p>
									<p><strong>Cédula:</strong> <?php echo htmlspecialchars($pago['cedula']); ?></p>
									<p><strong>Fecha de envío:</strong> <?php echo date('d/m/Y H:i', strtotime($pago['fecha_pago'])); ?></p>
								</div>
							</div>
							
							<div class="payment-image">
								<p>Comprobante de pago:</p>
								<?php 
								$rutaImagen = '/files/?path=' . urlencode($pago['archivo']); 
								?>
								<img 
									src="<?php echo htmlspecialchars($rutaImagen); ?>" 
									alt="Comprobante de pago" 
									class="image-preview"
									onclick="openModal(this.src)"
									onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3EImagen no disponible%3C/text%3E%3C/svg%3E';"
								>
								<br>
								<a href="<?php echo htmlspecialchars($rutaImagen); ?>" 
								   target="_blank" 
								   class="image-link">
									Abrir imagen en nueva pestaña
								</a>
							</div>
							
							<div class="payment-actions">
								<button class="btn btn-approve" onclick="approvePayment(<?php echo $pago['id_usuario']; ?>)">
									Aprobar Pago
								</button>
								<button class="btn btn-reject" onclick="rejectPayment(<?php echo $pago['id_usuario']; ?>)">
									Rechazar Pago
								</button>
							</div>
						</div>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
		</section>

		<!-- SECCIÓN NOTIFICACIONES -->
		<section id="notificaciones-section" class="section-content">
			<h2 class="section-title">Gestión de Notificaciones</h2>
			
			<div class="info-card">
				<h3>Enviar Nueva Notificación</h3>
				
				<form id="notificationForm" onsubmit="sendNotification(event)">
					<div class="form-group">
						<label for="titulo">Título:</label>
						<input type="text" id="titulo" name="titulo" required>
					</div>

					<div class="form-group">
						<label for="mensaje">Mensaje:</label>
						<textarea id="mensaje" name="mensaje" rows="4" required></textarea>
					</div>

					<div class="form-group">
						<label for="tipo">Tipo:</label>
						<select id="tipo" name="tipo">
							<option value="info">Información</option>
							<option value="importante">Importante</option>
							<option value="urgente">Urgente</option>
							<option value="exito">Éxito</option>
						</select>
					</div>

					<div class="form-group">
						<label>Destinatarios:</label>
						<div class="user-selection">
							<button type="button" onclick="toggleAllUsers()" class="btn-secondary">
								Seleccionar Todos
							</button>
							<div id="usersList" class="users-checkboxes">
								<p class="loading">Cargando usuarios...</p>
							</div>
						</div>
					</div>

					<button type="submit" class="btn btn-primary">Enviar Notificación</button>
				</form>
			</div>
		</section>

		<!-- OTRAS SECCIONES (Placeholder) -->
		<section id="reportes-section" class="section-content">
			<h2 class="section-title">Reportes</h2>
			<div class="info-card">
				<p>Sección de reportes en desarrollo...</p>
			</div>
		</section>

		<section id="nucleo-section" class="section-content">
			<h2 class="section-title">Núcleo Familiar</h2>
			<div class="info-card">
				<p>Gestión de núcleos familiares en desarrollo...</p>
			</div>
		</section>

		<section id="viviendas-section" class="section-content">
			<h2 class="section-title">Viviendas</h2>
			<div class="info-card">
				<p>Gestión de viviendas en desarrollo...</p>
			</div>
		</section>

		<section id="facturacion-section" class="section-content">
			<h2 class="section-title">Facturación</h2>
			<div class="info-card">
				<p>Sistema de facturación en desarrollo...</p>
			</div>
		</section>

		<section id="inventario-section" class="section-content">
			<h2 class="section-title">Inventario</h2>
			<div class="info-card">
				<p>Control de inventario en desarrollo...</p>
			</div>
		</section>

		<!-- SECCIÓN TAREAS -->
		<section id="tareas-section" class="section-content">
			<h2 class="section-title">📋 Gestión de Tareas</h2>

			<!-- Formulario para crear nueva tarea -->
			<div class="info-card">
				<h3>Crear Nueva Tarea</h3>
				
				<form id="taskForm" onsubmit="createTask(event)">
					<div class="form-group">
						<label for="titulo_tarea">Título:</label>
						<input type="text" id="titulo_tarea" name="titulo" required>
					</div>

					<div class="form-group">
						<label for="descripcion_tarea">Descripción:</label>
						<textarea id="descripcion_tarea" name="descripcion" rows="4" required></textarea>
					</div>

					<div class="task-form-grid">
						<div class="form-group">
							<label for="fecha_inicio">Fecha de Inicio:</label>
							<input type="date" id="fecha_inicio" name="fecha_inicio" required>
						</div>

						<div class="form-group">
							<label for="fecha_fin">Fecha de Finalización:</label>
							<input type="date" id="fecha_fin" name="fecha_fin" required>
						</div>
					</div>

					<div class="task-form-grid">
						<div class="form-group">
							<label for="prioridad">Prioridad:</label>
							<select id="prioridad" name="prioridad">
								<option value="baja">Baja</option>
								<option value="media" selected>Media</option>
								<option value="alta">Alta</option>
							</select>
						</div>

						<div class="form-group">
							<label for="tipo_asignacion">Asignar a:</label>
							<select id="tipo_asignacion" name="tipo_asignacion" onchange="toggleAsignacion()">
								<option value="usuario">Usuarios Individuales</option>
								<option value="nucleo">Núcleos Familiares</option>
							</select>
						</div>
					</div>

					<!-- Selector de usuarios -->
					<div class="form-group" id="usuarios-selector">
						<label>Seleccionar Usuarios:</label>
						<div class="user-selection">
							<button type="button" onclick="toggleAllTaskUsers()" class="btn-secondary">
								Seleccionar Todos
							</button>
							<div id="taskUsersList" class="users-checkboxes">
								<p class="loading">Cargando usuarios...</p>
							</div>
						</div>
					</div>

					<!-- Selector de núcleos -->
					<div class="form-group" id="nucleos-selector" style="display: none;">
						<label>Seleccionar Núcleos Familiares:</label>
						<div class="user-selection">
							<button type="button" onclick="toggleAllNucleos()" class="btn-secondary">
								Seleccionar Todos
							</button>
							<div id="taskNucleosList" class="users-checkboxes">
								<p class="loading">Cargando núcleos...</p>
							</div>
						</div>
					</div>

					<button type="submit" class="btn btn-primary">Crear Tarea</button>
				</form>
			</div>

			<!-- Lista de tareas existentes -->
			<div class="info-card">
				<div class="task-list-header">
					<h3>Tareas Creadas</h3>
					<div>
						<select id="filtro-estado" onchange="loadAllTasks()">
							<option value="">Todas</option>
							<option value="pendiente">Pendientes</option>
							<option value="en_progreso">En Progreso</option>
							<option value="completada">Completadas</option>
							<option value="cancelada">Canceladas</option>
						</select>
					</div>
				</div>
				
				<div id="tasksList">
					<p class="loading">Cargando tareas...</p>
				</div>
			</div>
		</section>
	</main>

	<!-- Modal para ver imagen en grande -->
	<div id="imageModal" class="modal" onclick="closeModal()">
		<span class="close-modal">&times;</span>
		<img class="modal-content" id="modalImage">
	</div>

	<script src="/assets/js/dashboardAdmin.js"></script>
</body>
</html>