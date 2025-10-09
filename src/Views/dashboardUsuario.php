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
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

	<link rel="stylesheet" href="/assets/css/dashboardBase.css" />
	<link rel="stylesheet" href="/assets/css/dashboardHeader.css" />
	<link rel="stylesheet" href="/assets/css/dashboardNotificaciones.css" />
	<link rel="stylesheet" href="/assets/css/dashboardTareas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardUtils.css" />
	<link rel="stylesheet" href="/assets/css/dashboardViviendas.css" />
</head>

<body>
	<?php include __DIR__ . '/includes/dashboardHeaderUsuario.html'; ?>

	<main class="content-area">
		<!-- INICIO -->
		<section id="inicio-section" class="section-content active">
			<h2 class="section-title">🏠 Inicio</h2>
			
			<div class="info-card">
				<h3>Bienvenido/a <?php echo htmlspecialchars($_SESSION['nombre_completo'] ?? 'Usuario'); ?></h3>
				<p>Este es tu panel de usuario de la Cooperativa de Viviendas.</p>
			</div>

			<!-- Notificaciones -->
			<div class="notifications-container">
				<div class="notifications-header">
					<h3>🔔 Notificaciones</h3>
					<span class="notifications-badge" id="notificationsBadge">0</span>
				</div>
				<div id="notificationsList" class="notifications-list">
					<div class="loading">Cargando notificaciones...</div>
				</div>
			</div>

			<div class="stats-grid">
				<div class="stat-card">
					<i class="fas fa-hand-holding-usd"></i>
					<h4>Aportes al Día</h4>
					<p>$0</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-clock"></i>
					<h4>Horas Trabajadas</h4>
					<p>0h</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-tasks"></i>
					<h4>Tareas Pendientes</h4>
					<p>0</p>
				</div>
			</div>
		</section>

		<!-- MI PERFIL -->
		<section id="perfil-section" class="section-content">
			<h2 class="section-title">👤 Mi Perfil</h2>
			<div class="info-card">
				<h3>Información Personal</h3>
				<p><strong>Nombre:</strong> <?php echo htmlspecialchars($_SESSION['nombre_completo'] ?? 'Usuario'); ?></p>
				<p><strong>Email:</strong> <?php echo htmlspecialchars($_SESSION['email'] ?? 'No disponible'); ?></p>
				<p><strong>Estado:</strong> <?php echo htmlspecialchars($_SESSION['estado'] ?? 'pendiente'); ?></p>
			</div>
		</section>

		<!-- SOLICITUDES -->
		<section id="solicitudes-section" class="section-content">
			<h2 class="section-title">📝 Mis Solicitudes</h2>
			<div class="info-card">
				<h3>Solicitudes Realizadas</h3>
				<p>Aquí podrás ver el estado de tus solicitudes a la cooperativa.</p>
				<p><em>No tienes solicitudes pendientes.</em></p>
			</div>
		</section>

		<!-- MI VIVIENDA -->
		<section id="vivienda-section" class="section-content">
			<h2 class="section-title">🏡 Mi Vivienda</h2>
			<div class="info-card">
				<h3>Información de tu Vivienda</h3>
				<div id="myViviendaContainer">
					<p class="loading">Cargando...</p>
				</div>
			</div>
		</section>

		<!-- APORTES -->
		<section id="aportes-section" class="section-content">
			<h2 class="section-title">💰 Mis Aportes</h2>
			<div class="info-card">
				<h3>Historial de Aportes</h3>
				<p>Registro de todos tus aportes económicos a la cooperativa.</p>
			</div>
			<div class="stats-grid">
				<div class="stat-card">
					<i class="fas fa-calendar-check"></i>
					<h4>Aportes Realizados</h4>
					<p>0</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-dollar-sign"></i>
					<h4>Total Aportado</h4>
					<p>$0</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-calendar-times"></i>
					<h4>Aportes Pendientes</h4>
					<p>0</p>
				</div>
			</div>
		</section>

		<!-- HORAS -->
		<!-- SECCIÓN HORAS - REEMPLAZAR LA SECCIÓN EXISTENTE EN dashboardUsuario.php -->
<section id="horas-section" class="section-content">
	<h2 class="section-title">⏰ Registro de Horas</h2>
	
	<!-- Botones de Entrada/Salida -->
	<div class="info-card">
		<div class="clock-controls">
			<div class="current-time">
				<i class="fas fa-clock"></i>
				<span id="current-time-display">--:--:--</span>
			</div>
			
			<div id="clock-buttons" class="clock-buttons">
				<button class="btn btn-primary btn-clock" id="btn-entrada" onclick="marcarEntrada()">
					<i class="fas fa-sign-in-alt"></i> Marcar Entrada
				</button>
				<button class="btn btn-danger btn-clock" id="btn-salida" onclick="marcarSalida()" style="display: none;">
					<i class="fas fa-sign-out-alt"></i> Marcar Salida
				</button>
			</div>
			
			<div id="registro-activo-info" style="display: none; margin-top: 15px; padding: 15px; background: #e3f2fd; border-radius: 8px; text-align: center;">
				<p style="margin: 0; font-weight: bold; color: #1976d2;">
					<i class="fas fa-briefcase"></i> Jornada en curso
				</p>
				<p style="margin: 5px 0 0 0; color: #666;">
					Entrada: <strong id="hora-entrada-activa">--:--</strong>
				</p>
			</div>
		</div>
	</div>

	<!-- Estadísticas Rápidas -->
	<div class="stats-grid">
		<div class="stat-card">
			<i class="fas fa-clock"></i>
			<h4>Horas esta Semana</h4>
			<p id="horas-semana">0h</p>
		</div>
		<div class="stat-card">
			<i class="fas fa-calendar-week"></i>
			<h4>Días Trabajados</h4>
			<p id="dias-semana">0</p>
		</div>
		<div class="stat-card">
			<i class="fas fa-calendar-alt"></i>
			<h4>Horas Este Mes</h4>
			<p id="horas-mes">0h</p>
		</div>
	</div>

	<!-- Resumen Semanal -->
	<div class="info-card">
		<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
			<h3><i class="fas fa-calendar-week"></i> Resumen de la Semana</h3>
			<button class="btn btn-secondary" onclick="loadResumenSemanal()">
				<i class="fas fa-sync-alt"></i> Actualizar
			</button>
		</div>
		
		<div id="resumen-semanal-container">
			<p class="loading">Cargando resumen...</p>
		</div>
	</div>

	<!-- Historial de Registros -->
	<div class="info-card">
		<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
			<h3><i class="fas fa-history"></i> Historial de Registros</h3>
			<div style="display: flex; gap: 10px;">
				<input type="date" id="filtro-fecha-inicio" class="date-input">
				<input type="date" id="filtro-fecha-fin" class="date-input">
				<button class="btn btn-secondary" onclick="filtrarRegistros()">
					<i class="fas fa-filter"></i> Filtrar
				</button>
			</div>
		</div>
		
		<div id="historial-registros-container">
			<p class="loading">Cargando registros...</p>
		</div>
	</div>
</section>

<!-- Modal para editar registro -->
<div id="editarRegistroModal" class="modal-overlay" style="display: none;">
	<div class="modal-content">
		<button class="modal-close-btn" onclick="closeEditarRegistroModal()">×</button>
		<h2 class="modal-title">Editar Registro</h2>
		
		<form id="editarRegistroForm" onsubmit="submitEditarRegistro(event)">
			<input type="hidden" id="edit-id-registro">
			
			<div class="form-group">
				<label for="edit-hora-entrada">Hora de Entrada *</label>
				<input type="time" id="edit-hora-entrada" required>
			</div>
			
			<div class="form-group">
				<label for="edit-hora-salida">Hora de Salida</label>
				<input type="time" id="edit-hora-salida">
			</div>
			
			<div class="form-group">
				<label for="edit-descripcion">Descripción del Trabajo</label>
				<textarea id="edit-descripcion" rows="3"></textarea>
			</div>
			
			<div class="form-actions">
				<button type="button" class="btn btn-secondary" onclick="closeEditarRegistroModal()">
					Cancelar
				</button>
				<button type="submit" class="btn btn-primary">
					Guardar Cambios
				</button>
			</div>
		</form>
	</div>
</div>

		<!-- TAREAS -->
		<section id="tareas-section" class="section-content">
			<h2 class="section-title">✅ Mis Tareas</h2>
			
			<!-- Resumen de Tareas -->
			<div class="stats-grid" style="margin-bottom: 20px;">
				<div class="stat-card">
					<i class="fas fa-clock"></i>
					<h4>Pendientes</h4>
					<p id="pending-count">0</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-spinner"></i>
					<h4>En Progreso</h4>
					<p id="progress-count">0</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-check-circle"></i>
					<h4>Completadas</h4>
					<p id="completed-count">0</p>
				</div>
			</div>
			
			<!-- Filtros -->
			<div class="info-card">
				<div class="task-filter-header">
					<h3>Mis Tareas Asignadas</h3>
					<label class="filter-checkbox-label">
						<input type="checkbox" id="mostrar-completadas" onchange="loadUserTasks()">
						Mostrar completadas
					</label>
				</div>
			</div>

			<!-- Tareas personales -->
			<div class="info-card">
				<h3>📋 Tareas Individuales</h3>
				<div id="tareasUsuarioList">
					<p class="loading">Cargando tareas...</p>
				</div>
			</div>

			<!-- Tareas del núcleo familiar -->
			<div class="info-card">
				<h3>👨‍👩‍👧‍👦 Tareas del Núcleo Familiar</h3>
				<div id="tareasNucleoList">
					<p class="loading">Cargando tareas...</p>
				</div>
			</div>
		</section>

		<!-- DOCUMENTOS -->
		<section id="documentos-section" class="section-content">
			<h2 class="section-title">📄 Mis Documentos</h2>
			<div class="info-card">
				<h3>Documentación</h3>
				<p>Accede a todos tus documentos relacionados con la cooperativa.</p>
			</div>
			<div class="stats-grid">
				<div class="stat-card">
					<i class="fas fa-file-alt"></i>
					<h4>Documentos</h4>
					<p>0</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-file-contract"></i>
					<h4>Contratos</h4>
					<p>0</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-file-invoice"></i>
					<h4>Facturas</h4>
					<p>0</p>
				</div>
			</div>
		</section>
	</main>

	<script src="/assets/js/dashboardUsuario.js"></script>
</body>
</html>