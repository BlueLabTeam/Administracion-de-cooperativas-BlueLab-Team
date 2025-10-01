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
	<link rel="stylesheet" href="/assets/css/dashboardHeader.css" />
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			font-family: Arial, sans-serif;
			background-color: #f5f5f5;
		}

		.content-area {
			max-width: 1200px;
			margin: 20px auto;
			padding: 20px;
		}

		.section-content {
			display: none;
		}

		.section-content.active {
			display: block;
		}

		.payments-container {
			width: 100%;
		}

		.payment-card {
			background: white;
			border: 1px solid #ddd;
			border-radius: 8px;
			padding: 20px;
			margin-bottom: 20px;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		}

		.payment-header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 15px;
			padding-bottom: 15px;
			border-bottom: 2px solid #f0f0f0;
		}

		.payment-info {
			flex: 1;
		}

		.payment-info h3 {
			color: #333;
			margin-bottom: 10px;
		}

		.payment-info p {
			margin: 5px 0;
			color: #666;
		}

		.payment-image {
			margin: 20px 0;
		}

		.payment-image > p {
			font-weight: bold;
			margin-bottom: 10px;
			color: #333;
		}

		.image-preview {
			max-width: 100%;
			max-height: 500px;
			border: 2px solid #ddd;
			border-radius: 8px;
			cursor: pointer;
			transition: transform 0.2s;
		}

		.image-preview:hover {
			transform: scale(1.02);
			border-color: #007bff;
		}

		.image-link {
			display: inline-block;
			margin-top: 10px;
			color: #007bff;
			text-decoration: none;
		}

		.image-link:hover {
			text-decoration: underline;
		}

		.payment-actions {
			display: flex;
			gap: 10px;
			margin-top: 15px;
		}

		.btn {
			padding: 12px 24px;
			border: none;
			border-radius: 5px;
			cursor: pointer;
			font-weight: bold;
			font-size: 14px;
			transition: all 0.3s;
		}

		.btn-approve {
			background-color: #28a745;
			color: white;
		}

		.btn-approve:hover {
			background-color: #218838;
		}

		.btn-reject {
			background-color: #dc3545;
			color: white;
		}

		.btn-reject:hover {
			background-color: #c82333;
		}

		.btn:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		.no-payments {
			text-align: center;
			padding: 60px 20px;
			background: white;
			border-radius: 8px;
			color: #666;
		}

		.no-payments p {
			font-size: 18px;
		}

		.admin-banner {
			padding: 15px 20px;
			background-color: #fff3cd;
			border-radius: 5px;
			border: 2px solid #ffc107;
			margin-bottom: 20px;
		}

		.admin-banner p {
			margin: 0;
			font-weight: bold;
			color: #856404;
		}

		.modal {
			display: none;
			position: fixed;
			z-index: 1000;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0,0,0,0.9);
		}

		.modal-content {
			margin: auto;
			display: block;
			max-width: 90%;
			max-height: 90%;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		.close-modal {
			position: absolute;
			top: 15px;
			right: 35px;
			color: #f1f1f1;
			font-size: 40px;
			font-weight: bold;
			cursor: pointer;
		}

		.close-modal:hover {
			color: #bbb;
		}

		.info-card {
			background: white;
			border-radius: 8px;
			padding: 30px;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
			margin-bottom: 20px;
		}

		.info-card h3 {
			margin-bottom: 15px;
			color: #333;
		}

		.section-title {
			font-size: 28px;
			margin-bottom: 20px;
			color: #333;
			border-bottom: 3px solid #007bff;
			padding-bottom: 10px;
		}

		.form-group {
			margin-bottom: 20px;
		}

		.form-group label {
			display: block;
			margin-bottom: 5px;
			font-weight: bold;
			color: #333;
		}

		.form-group input,
		.form-group textarea,
		.form-group select {
			width: 100%;
			padding: 10px;
			border: 1px solid #ddd;
			border-radius: 5px;
			font-size: 14px;
		}

		.user-selection {
			border: 1px solid #ddd;
			border-radius: 5px;
			padding: 15px;
			background: #f9f9f9;
		}

		.users-checkboxes {
			max-height: 300px;
			overflow-y: auto;
			margin-top: 15px;
		}

		.user-checkbox {
			padding: 8px;
			margin: 5px 0;
			background: white;
			border-radius: 4px;
			border: 1px solid #eee;
		}

		.user-checkbox label {
			display: flex;
			align-items: center;
			cursor: pointer;
			font-weight: normal !important;
		}

		.user-checkbox input[type="checkbox"] {
			width: auto;
			margin-right: 10px;
		}

		.btn-secondary {
			padding: 8px 16px;
			background: #6c757d;
			color: white;
			border: none;
			border-radius: 5px;
			cursor: pointer;
		}

		.btn-secondary:hover {
			background: #5a6268;
		}

		.btn-primary {
			padding: 12px 30px;
			background: #007bff;
			color: white;
			border: none;
			border-radius: 5px;
			cursor: pointer;
			font-size: 16px;
			font-weight: bold;
		}

		.btn-primary:hover {
			background: #0056b3;
		}

		.loading {
			text-align: center;
			padding: 20px;
			color: #666;
		}

		.error {
			color: #dc3545;
			padding: 20px;
			text-align: center;
		}

		.debug-info {
			background: #f8f9fa;
			border: 1px solid #dee2e6;
			border-radius: 5px;
			padding: 15px;
			margin: 20px 0;
			font-family: monospace;
			font-size: 12px;
			max-height: 300px;
			overflow: auto;
		}

		.debug-info pre {
			margin: 0;
			white-space: pre-wrap;
			word-wrap: break-word;
		}
	</style>
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
				<ul style="margin-top: 10px; margin-left: 20px; line-height: 1.8;">
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
			
			<!-- DEBUG INFO -->
			<div class="debug-info" id="debugInfo" style="display: none;">
				<h4>Información de Debug:</h4>
				<pre id="debugContent"></pre>
			</div>
			
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

		<section id="tareas-section" class="section-content">
			<h2 class="section-title">Tareas</h2>
			<div class="info-card">
				<p>Gestión de tareas en desarrollo...</p>
			</div>
		</section>
	</main>

	<!-- Modal para ver imagen en grande -->
	<div id="imageModal" class="modal" onclick="closeModal()">
		<span class="close-modal">&times;</span>
		<img class="modal-content" id="modalImage">
	</div>

	<script>
		// Función de debug mejorada
		function addDebugInfo(title, content) {
			const debugDiv = document.getElementById('debugInfo');
			const debugContent = document.getElementById('debugContent');
			debugDiv.style.display = 'block';
			debugContent.innerHTML += `\n=== ${title} ===\n${JSON.stringify(content, null, 2)}\n`;
		}

		// Sistema SPA - Navegación entre secciones
		document.addEventListener('DOMContentLoaded', function() {
			console.log('Dashboard Admin cargado');
			
			const menuItems = document.querySelectorAll('.menu li');
			
			menuItems.forEach(item => {
				item.addEventListener('click', function(e) {
					e.preventDefault();
					
					console.log('Navegando a:', this.getAttribute('data-section'));
					
					menuItems.forEach(mi => mi.classList.remove('activo'));
					this.classList.add('activo');
					
					const section = this.getAttribute('data-section');
					
					document.querySelectorAll('.section-content').forEach(s => {
						s.classList.remove('active');
					});
					
					const targetSection = document.getElementById(section + '-section');
					if (targetSection) {
						targetSection.classList.add('active');
						console.log('Sección mostrada:', section);
					} else {
						console.error('Sección no encontrada:', section);
					}
				});
			});

			// Cargar usuarios cuando se abre la sección de notificaciones
			const notifMenuItem = document.querySelector('.menu li[data-section="notificaciones"]');
			if (notifMenuItem) {
				notifMenuItem.addEventListener('click', function() {
					loadUsers();
				});
			}
			
			// Cargar usuarios al inicio por si la sección ya está abierta
			if (document.getElementById('notificaciones-section').classList.contains('active')) {
				loadUsers();
			}
		});

		// Cargar usuarios para el selector - CON DEBUG COMPLETO
		async function loadUsers() {
			console.log('=== INICIANDO loadUsers() ===');
			const usersList = document.getElementById('usersList');
			
			// Limpiar debug anterior
			document.getElementById('debugContent').innerHTML = '';
			
			try {
				console.log('Haciendo fetch a: /api/notifications/users');
				addDebugInfo('URL Solicitada', '/api/notifications/users');
				
				const response = await fetch('/api/notifications/users', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: 'same-origin'
				});
				
				console.log('Response recibido:', {
					status: response.status,
					statusText: response.statusText,
					ok: response.ok,
					contentType: response.headers.get('content-type'),
					url: response.url
				});
				
				addDebugInfo('Response Status', {
					status: response.status,
					statusText: response.statusText,
					ok: response.ok,
					contentType: response.headers.get('content-type'),
					url: response.url
				});
				
				// Obtener respuesta como texto primero
				const textResponse = await response.text();
				console.log('RAW Response (primeros 500 chars):', textResponse.substring(0, 500));
				addDebugInfo('RAW Response', textResponse.substring(0, 1000));
				
				// Intentar parsear JSON
				let data;
				try {
					data = JSON.parse(textResponse);
					console.log('JSON parseado correctamente:', data);
					addDebugInfo('Datos Parseados', data);
				} catch (parseError) {
					console.error('Error al parsear JSON:', parseError);
					addDebugInfo('Error de Parseo', {
						error: parseError.message,
						response: textResponse
					});
					throw new Error('La respuesta no es JSON válido. Revisa el debug info arriba.');
				}
				
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				
				if (data.success) {
					console.log('Usuarios cargados:', data.users.length);
					renderUsersList(data.users);
				} else {
					usersList.innerHTML = `<p class="error">Error: ${data.message || 'No se pudieron cargar los usuarios'}</p>`;
				}
			} catch (error) {
				console.error('=== ERROR EN loadUsers() ===');
				console.error('Tipo de error:', error.constructor.name);
				console.error('Mensaje:', error.message);
				console.error('Stack:', error.stack);
				
				addDebugInfo('Error Capturado', {
					tipo: error.constructor.name,
					mensaje: error.message,
					stack: error.stack
				});
				
				usersList.innerHTML = `
					<p class="error">Error de conexión: ${error.message}</p>
					<p style="font-size: 12px; margin-top: 10px;">
						Revisa la información de debug arriba para más detalles.
					</p>
				`;
			}
		}

		function renderUsersList(users) {
			const container = document.getElementById('usersList');
			
			if (!users || users.length === 0) {
				container.innerHTML = '<p>No hay usuarios disponibles</p>';
				return;
			}

			console.log('Renderizando', users.length, 'usuarios');
			
			container.innerHTML = users.map(user => `
				<div class="user-checkbox">
					<label>
						<input type="checkbox" name="usuarios[]" value="${user.id_usuario}">
						${user.nombre_completo} (${user.email})
					</label>
				</div>
			`).join('');
		}

		function toggleAllUsers() {
			const checkboxes = document.querySelectorAll('input[name="usuarios[]"]');
			const allChecked = Array.from(checkboxes).every(cb => cb.checked);
			
			checkboxes.forEach(cb => cb.checked = !allChecked);
		}

		async function sendNotification(event) {
			event.preventDefault();
			
			const form = event.target;
			const formData = new FormData(form);
			
			const selectedUsers = Array.from(document.querySelectorAll('input[name="usuarios[]"]:checked'))
				.map(cb => cb.value);
			
			if (selectedUsers.length === 0) {
				alert('Debes seleccionar al menos un usuario');
				return;
			}

			formData.delete('usuarios[]');
			selectedUsers.forEach(userId => formData.append('usuarios[]', userId));
			
			console.log('Enviando notificación a:', selectedUsers);
			
			try {
				const response = await fetch('/api/notifications/create', {
					method: 'POST',
					body: formData
				});
				
				const data = await response.json();
				console.log('Respuesta:', data);
				
				if (data.success) {
					alert(data.message);
					form.reset();
					document.querySelectorAll('input[name="usuarios[]"]').forEach(cb => cb.checked = false);
				} else {
					alert('Error: ' + data.message);
				}
			} catch (error) {
				console.error('Error:', error);
				alert('Error al enviar notificación');
			}
		}

		function openModal(src) {
			const modal = document.getElementById('imageModal');
			const modalImg = document.getElementById('modalImage');
			modal.style.display = 'block';
			modalImg.src = src;
		}

		function closeModal() {
			document.getElementById('imageModal').style.display = 'none';
		}

		async function approvePayment(userId) {
			if (!confirm('¿Está seguro de aprobar este pago?')) return;
			
			const btn = event.target;
			btn.disabled = true;
			btn.textContent = 'Procesando...';
			
			try {
				const response = await fetch('/api/payment/approve', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: `id_usuario=${userId}`
				});
				
				const data = await response.json();
				
				if (data.success) {
					alert(data.message);
					document.getElementById(`payment-${userId}`).remove();
					
					if (document.querySelectorAll('.payment-card').length === 0) {
						location.reload();
					}
				} else {
					alert('Error: ' + data.message);
					btn.disabled = false;
					btn.textContent = 'Aprobar Pago';
				}
			} catch (error) {
				console.error(error);
				alert('Error al conectar con el servidor');
				btn.disabled = false;
				btn.textContent = 'Aprobar Pago';
			}
		}
		
		async function rejectPayment(userId) {
			const motivo = prompt('¿Por qué rechaza este pago? (opcional)');
			if (motivo === null) return;
			
			if (!confirm('¿Está seguro de rechazar este pago? El usuario podrá volver a intentarlo.')) return;
			
			const btn = event.target;
			btn.disabled = true;
			btn.textContent = 'Procesando...';
			
			try {
				const response = await fetch('/api/payment/reject', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: `id_usuario=${userId}&motivo=${encodeURIComponent(motivo)}`
				});
				
				const data = await response.json();
				
				if (data.success) {
					alert(data.message);
					document.getElementById(`payment-${userId}`).remove();
					
					if (document.querySelectorAll('.payment-card').length === 0) {
						location.reload();
					}
				} else {
					alert('Error: ' + data.message);
					btn.disabled = false;
					btn.textContent = 'Rechazar Pago';
				}
			} catch (error) {
				console.error(error);
				alert('Error al conectar con el servidor');
				btn.disabled = false;
				btn.textContent = 'Rechazar Pago';
			}
		}
	</script>
</body>
</html>