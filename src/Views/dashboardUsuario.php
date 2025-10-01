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

		.section-title {
			font-size: 28px;
			margin-bottom: 20px;
			color: #333;
			border-bottom: 3px solid #007bff;
			padding-bottom: 10px;
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

		.info-card p {
			color: #666;
			line-height: 1.6;
			margin-bottom: 10px;
		}

		.stats-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 20px;
			margin-top: 20px;
		}

		.stat-card {
			background: white;
			padding: 20px;
			border-radius: 8px;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
			text-align: center;
		}

		.stat-card i {
			font-size: 40px;
			color: #007bff;
			margin-bottom: 10px;
		}

		.stat-card h4 {
			margin: 10px 0;
			color: #333;
		}

		.stat-card p {
			font-size: 24px;
			font-weight: bold;
			color: #007bff;
		}
	</style>
</head>

<body>
	<?php include __DIR__ . '/includes/dashboardHeaderUsuario.html'; ?>

	<main class="content-area">
		<!-- INICIO -->
		<!-- INICIO - Reemplazar la sección existente en dashboardUsuario.php -->
<section id="inicio-section" class="section-content active">
	<h2 class="section-title">🏠 Inicio</h2>
	
	<div class="info-card">
		<h3>Bienvenido/a <?php echo htmlspecialchars($_SESSION['nombre_completo'] ?? 'Usuario'); ?></h3>
		<p>Este es tu panel de usuario de la Cooperativa de Viviendas.</p>
	</div>

	<!-- Notificaciones -->
	<div class="notifications-container">
		<div class="notifications-header">
			<h3> Notificaciones</h3>
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

<style>
.notifications-container {
	background: white;
	border-radius: 8px;
	padding: 25px;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	margin: 20px 0;
}

.notifications-header {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 20px;
	padding-bottom: 15px;
	border-bottom: 2px solid #f0f0f0;
}

.notifications-header h3 {
	margin: 0;
	color: #333;
	font-size: 20px;
}

.notifications-badge {
	background: #dc3545;
	color: white;
	padding: 4px 10px;
	border-radius: 12px;
	font-size: 13px;
	font-weight: bold;
}

.notifications-badge.zero {
	background: #6c757d;
}

.notifications-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
	max-height: 500px;
	overflow-y: auto;
}

.notification-item {
	padding: 16px;
	border-left: 4px solid #007bff;
	background: #f8f9fa;
	border-radius: 6px;
	transition: all 0.3s;
	cursor: pointer;
}

.notification-item:hover {
	background: #e9ecef;
	transform: translateX(5px);
}

.notification-item.unread {
	background: #e7f3ff;
	font-weight: bold;
	box-shadow: 0 2px 4px rgba(0,123,255,0.1);
}

.notification-item.tipo-info {
	border-left-color: #17a2b8;
}

.notification-item.tipo-importante {
	border-left-color: #ffc107;
}

.notification-item.tipo-urgente {
	border-left-color: #dc3545;
}

.notification-item.tipo-exito {
	border-left-color: #28a745;
}

.notification-header-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.notification-title {
	color: #333;
	font-size: 16px;
	display: flex;
	align-items: center;
	gap: 8px;
}

.notification-type-badge {
	padding: 3px 8px;
	border-radius: 4px;
	font-size: 11px;
	font-weight: bold;
	text-transform: uppercase;
}

.tipo-info-badge {
	background: #d1ecf1;
	color: #0c5460;
}

.tipo-importante-badge {
	background: #fff3cd;
	color: #856404;
}

.tipo-urgente-badge {
	background: #f8d7da;
	color: #721c24;
}

.tipo-exito-badge {
	background: #d4edda;
	color: #155724;
}

.notification-date {
	font-size: 12px;
	color: #6c757d;
}

.notification-message {
	color: #495057;
	line-height: 1.5;
	margin-top: 8px;
}

.notification-item.unread .notification-message {
	color: #212529;
}

.no-notifications {
	text-align: center;
	padding: 40px 20px;
	color: #6c757d;
}

.loading {
	text-align: center;
	padding: 30px;
	color: #6c757d;
}
</style>

<script>
// Cargar notificaciones al cargar la página
document.addEventListener('DOMContentLoaded', function() {
	loadNotifications();
	// Actualizar cada 2 minutos
	setInterval(loadNotifications, 120000);
});

async function loadNotifications() {
	try {
		const response = await fetch('/api/notifications/user');
		const data = await response.json();
		
		if (data.success) {
			renderNotifications(data.notifications, data.unread_count);
		}
	} catch (error) {
		console.error('Error al cargar notificaciones:', error);
		document.getElementById('notificationsList').innerHTML = 
			'<div class="loading">Error al cargar notificaciones</div>';
	}
}

function renderNotifications(notifications, unreadCount) {
	const badge = document.getElementById('notificationsBadge');
	const list = document.getElementById('notificationsList');
	
	// Actualizar badge
	badge.textContent = unreadCount;
	badge.className = 'notifications-badge' + (unreadCount === 0 ? ' zero' : '');
	
	// Renderizar lista
	if (notifications.length === 0) {
		list.innerHTML = '<div class="no-notifications">No tienes notificaciones</div>';
		return;
	}
	
	list.innerHTML = notifications.map(notif => {
		const fecha = new Date(notif.fecha_creacion);
		const fechaFormateada = formatearFecha(fecha);
		const isUnread = notif.leida == 0;
		
		return `
			<div class="notification-item ${isUnread ? 'unread' : ''} tipo-${notif.tipo}" 
				 onclick="markAsRead(${notif.id}, this)">
				<div class="notification-header-info">
					<div class="notification-title">
						${getTipoIcon(notif.tipo)}
						${notif.titulo}
						${isUnread ? '<span class="notification-type-badge tipo-' + notif.tipo + '-badge">NUEVO</span>' : ''}
					</div>
					<span class="notification-date">${fechaFormateada}</span>
				</div>
				<div class="notification-message">${notif.mensaje}</div>
			</div>
		`;
	}).join('');
}

function getTipoIcon(tipo) {
	const icons = {
		'info': 'ℹ️',
		'importante': '⚠️',
		'urgente': '🚨',
		'exito': '✅'
	};
	return icons[tipo] || 'ℹ️';
}

function formatearFecha(fecha) {
	const ahora = new Date();
	const diff = ahora - fecha;
	const minutos = Math.floor(diff / 60000);
	const horas = Math.floor(diff / 3600000);
	const dias = Math.floor(diff / 86400000);
	
	if (minutos < 1) return 'Ahora';
	if (minutos < 60) return `Hace ${minutos} min`;
	if (horas < 24) return `Hace ${horas}h`;
	if (dias < 7) return `Hace ${dias}d`;
	
	return fecha.toLocaleDateString('es-UY', { 
		day: '2-digit', 
		month: '2-digit', 
		year: 'numeric' 
	});
}

async function markAsRead(notifId, element) {
	if (!element.classList.contains('unread')) return;
	
	try {
		const formData = new FormData();
		formData.append('notificacion_id', notifId);
		
		const response = await fetch('/api/notifications/mark-read', {
			method: 'POST',
			body: formData
		});
		
		const data = await response.json();
		
		if (data.success) {
			element.classList.remove('unread');
			const badge = document.getElementById('notificationsBadge');
			const currentCount = parseInt(badge.textContent);
			const newCount = Math.max(0, currentCount - 1);
			badge.textContent = newCount;
			badge.className = 'notifications-badge' + (newCount === 0 ? ' zero' : '');
		}
	} catch (error) {
		console.error('Error al marcar como leída:', error);
	}
}
</script>

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
        <p>Aquí encontrarás toda la información relacionada con tu vivienda asignada.</p>
        <p><em>Aún no tienes una vivienda asignada.</em></p>
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
<section id="horas-section" class="section-content">
    <h2 class="section-title">⏰ Registro de Horas</h2>
    <div class="info-card">
        <h3>Horas de Trabajo Cooperativo</h3>
        <p>Registro de las horas trabajadas en actividades de la cooperativa.</p>
    </div>
    <div class="stats-grid">
        <div class="stat-card">
            <i class="fas fa-clock"></i>
            <h4>Horas Totales</h4>
            <p>0h</p>
        </div>
        <div class="stat-card">
            <i class="fas fa-calendar-week"></i>
            <h4>Este Mes</h4>
            <p>0h</p>
        </div>
        <div class="stat-card">
            <i class="fas fa-hourglass-half"></i>
            <h4>Horas Requeridas</h4>
            <p>0h</p>
        </div>
    </div>
</section>

<!-- TAREAS -->
<section id="tareas-section" class="section-content">
    <h2 class="section-title">✅ Mis Tareas</h2>
    <div class="info-card">
        <h3>Tareas Asignadas</h3>
        <p>Lista de tareas que tienes asignadas en la cooperativa.</p>
        <p><em>No tienes tareas asignadas en este momento.</em></p>
    </div>
</section>

<!-- DOCUMENTOS -->
<section id="documentos-section" class="section-content">
    <h2 class="section-title">📁 Mis Documentos</h2>
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


	<script>
		// Sistema SPA - Navegación entre secciones
		document.addEventListener('DOMContentLoaded', function() {
			const menuItems = document.querySelectorAll('.menu li');
			
			menuItems.forEach(item => {
				item.addEventListener('click', function(e) {
					e.preventDefault();
					
					// Remover clase activo de todos
					menuItems.forEach(mi => mi.classList.remove('activo'));
					
					// Agregar clase activo al seleccionado
					this.classList.add('activo');
					
					// Obtener la sección
					const section = this.getAttribute('data-section');
					
					// Ocultar todas las secciones
					document.querySelectorAll('.section-content').forEach(s => {
						s.classList.remove('active');
					});
					
					// Mostrar la sección seleccionada
					const targetSection = document.getElementById(section + '-section');
					if (targetSection) {
						targetSection.classList.add('active');
					}
				});
			});

			// Debug en consola
			console.log('DEBUG INFO:', {
				user_id: <?php echo json_encode($_SESSION['user_id'] ?? null); ?>,
				is_admin: <?php echo json_encode($_SESSION['is_admin'] ?? null); ?>,
				id_rol: <?php echo json_encode($_SESSION['id_rol'] ?? null); ?>,
				nombre: <?php echo json_encode($_SESSION['nombre_completo'] ?? null); ?>
			});
		});
	</script>
</body>
</html>