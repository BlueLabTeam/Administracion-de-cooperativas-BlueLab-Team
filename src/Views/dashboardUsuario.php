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
	<link rel="stylesheet" href="/assets/css/dashboardHoras.css" />
	<link rel="stylesheet" href="/assets/css/dashboardDeudaHoras.css" />
	<link rel="stylesheet" href="/assets/css/dashboardDeudaTotal.css" />
	<link rel="stylesheet" href="/assets/css/dashboardUtils.css" />
	<link rel="stylesheet" href="/assets/css/dashboardViviendas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardCuotas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardPagos.css" />
	
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
		<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
			<h3>Información Personal</h3>
			<button class="btn btn-primary" onclick="toggleEditProfile()">
				<i class="fas fa-edit"></i> <span id="btn-edit-text">Editar Perfil</span>
			</button>
		</div>

		<!-- Vista de solo lectura -->
		<div id="profile-view">
    <div class="profile-info-grid">
        <div class="profile-info-item">
            <strong><i class="fas fa-user"></i> Nombre Completo:</strong>
            <p id="display-nombre"><?php echo htmlspecialchars($_SESSION['nombre_completo'] ?? 'Usuario'); ?></p>
        </div>
        <div class="profile-info-item">
            <strong><i class="fas fa-envelope"></i> Email:</strong>
            <p id="display-email"><?php echo htmlspecialchars($_SESSION['email'] ?? 'No disponible'); ?></p>
        </div>
        <div class="profile-info-item">
            <strong><i class="fas fa-map-marker-alt"></i> Dirección:</strong>
            <p id="display-direccion"><?php echo htmlspecialchars($_SESSION['direccion'] ?? 'No especificada'); ?></p>
        </div>
        <div class="profile-info-item">
            <strong><i class="fas fa-birthday-cake"></i> Fecha de Nacimiento:</strong>
            <p id="display-fecha-nacimiento"><?php echo htmlspecialchars($_SESSION['fecha_nacimiento'] ?? 'No disponible'); ?></p>
        </div>
        <div class="profile-info-item">
            <strong><i class="fas fa-info-circle"></i> Estado:</strong>
            <p><span class="badge badge-<?php echo htmlspecialchars($_SESSION['estado'] ?? 'pendiente'); ?>">
                <?php echo ucfirst(htmlspecialchars($_SESSION['estado'] ?? 'pendiente')); ?>
            </span></p>
        </div>
    </div>
</div>

		<!-- Formulario de edición -->
		<div id="profile-edit" style="display: none;">
			<form id="editProfileForm" onsubmit="submitProfileEdit(event)">
				<div class="form-row">
					<div class="form-group">
						<label for="edit-nombre">Nombre Completo *</label>
						<input type="text" id="edit-nombre" required>
					</div>
					<div class="form-group">
						<label for="edit-cedula">Cédula *</label>
						<input type="text" id="edit-cedula" required readonly title="La cédula no se puede modificar">
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="edit-email">Email *</label>
						<input type="email" id="edit-email" required>
					</div>
					<div class="form-group">
						<label for="edit-fecha-nacimiento">Fecha de Nacimiento</label>
						<input type="date" id="edit-fecha-nacimiento">
					</div>
				</div>

				<div class="form-group">
					<label for="edit-direccion">Dirección</label>
					<input type="text" id="edit-direccion">
				</div>

				<div class="form-group">
					<label for="edit-telefono">Teléfono</label>
					<input type="tel" id="edit-telefono" placeholder="Ej: 099123456">
					<small style="color: #666;">Opcional - Puedes agregar un número de contacto</small>
				</div>

				<hr style="margin: 20px 0;">

				<h4 style="margin-bottom: 15px;">Cambiar Contraseña (Opcional)</h4>
				<div class="form-group">
					<label for="edit-password-actual">Contraseña Actual</label>
					<input type="password" id="edit-password-actual" placeholder="Dejar en blanco si no deseas cambiarla">
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="edit-password-nueva">Nueva Contraseña</label>
						<input type="password" id="edit-password-nueva" minlength="6">
					</div>
					<div class="form-group">
						<label for="edit-password-confirmar">Confirmar Nueva Contraseña</label>
						<input type="password" id="edit-password-confirmar" minlength="6">
					</div>
				</div>

				<div class="form-actions">
					<button type="button" class="btn btn-secondary" onclick="toggleEditProfile()">
						<i class="fas fa-times"></i> Cancelar
					</button>
					<button type="submit" class="btn btn-primary">
						<i class="fas fa-save"></i> Guardar Cambios
					</button>
				</div>
			</form>
		</div>
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
		<div id="cuotas-section" class="section-content">
    <div class="section-header">
        <h2>💳 Mis Cuotas Mensuales</h2>
        <p>Gestiona tus pagos de vivienda y deuda de horas</p>
    </div>

    <!-- Estadísticas Rápidas -->
    <div class="stats-grid">
        <div class="stat-card pendiente">
            <div class="stat-icon">
                <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Pendientes</span>
                <span class="stat-value" id="cuotas-pendientes-count">0</span>
            </div>
        </div>

        <div class="stat-card success">
            <div class="stat-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Pagadas</span>
                <span class="stat-value" id="cuotas-pagadas-count">0</span>
            </div>
        </div>

        <div class="stat-card error">
            <div class="stat-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Vencidas</span>
                <span class="stat-value" id="cuotas-vencidas-count">0</span>
            </div>
        </div>
    </div>

    <!-- Información de Vivienda -->
    <div id="info-vivienda-cuota" class="info-section">
        <p class="loading">Cargando información...</p>
    </div>

    <!-- Filtros -->
    <div class="filters-container">
        <div class="filter-group">
            <label for="filtro-mes-cuotas">
                <i class="fas fa-calendar"></i> Mes:
            </label>
            <select id="filtro-mes-cuotas" onchange="loadMisCuotas()">
                <option value="">Todos los meses</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
            </select>
        </div>

        <div class="filter-group">
            <label for="filtro-anio-cuotas">
                <i class="fas fa-calendar-alt"></i> Año:
            </label>
            <select id="filtro-anio-cuotas" onchange="loadMisCuotas()">
                <option value="">Todos los años</option>
                <!-- Se llena dinámicamente con JS -->
            </select>
        </div>

        <div class="filter-group">
            <label for="filtro-estado-cuotas">
                <i class="fas fa-filter"></i> Estado:
            </label>
            <select id="filtro-estado-cuotas" onchange="loadMisCuotas()">
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagada">Pagada</option>
                <option value="vencida">Vencida</option>
            </select>
        </div>
    </div>

    <!-- Lista de Cuotas -->
    <div id="misCuotasContainer" class="cuotas-container">
        <p class="loading">Cargando cuotas...</p>
    </div>
</div>

<!-- ==========================================
     MODAL: PAGAR CUOTA
     ========================================== -->

<div id="pagarCuotaModal" class="modal-overlay" style="display: none;">
    <div class="modal-content-large">
        <button class="modal-close-btn" onclick="closePagarCuotaModal()">×</button>
        
        <h2 class="modal-title">
            <i class="fas fa-credit-card"></i> Realizar Pago
        </h2>

        <!-- Información de la cuota -->
        <div id="cuota-info-modal" class="cuota-info-modal">
            <!-- Se llena dinámicamente -->
        </div>

        <!-- Formulario de Pago -->
        <form id="pagarCuotaForm" onsubmit="submitPagarCuota(event)" enctype="multipart/form-data">
            <input type="hidden" id="pagar-cuota-id" name="cuota_id">
            <input type="hidden" id="pagar-monto" name="monto_pagado">

            <div class="form-group">
                <label for="pagar-metodo">
                    <i class="fas fa-money-check-alt"></i> Método de Pago *
                </label>
                <select id="pagar-metodo" name="metodo_pago" required>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="deposito">Depósito en Efectivo</option>
                    <option value="cheque">Cheque</option>
                    <option value="efectivo">Efectivo</option>
                </select>
            </div>

            <div class="form-group">
                <label for="pagar-numero-comprobante">
                    <i class="fas fa-hashtag"></i> Número de Comprobante
                </label>
                <input 
                    type="text" 
                    id="pagar-numero-comprobante" 
                    name="numero_comprobante"
                    placeholder="Ej: 123456789"
                    maxlength="50">
                <small class="form-help">Opcional: Número de referencia o transacción</small>
            </div>

            <div class="form-group">
                <label for="pagar-comprobante">
                    <i class="fas fa-file-upload"></i> Comprobante de Pago *
                </label>
                <input 
                    type="file" 
                    id="pagar-comprobante" 
                    name="comprobante"
                    accept="image/*,.pdf"
                    required>
                <small class="form-help">Sube una foto o PDF del comprobante (máx. 5MB)</small>
            </div>

            <div class="alert-warning" style="margin: 20px 0;">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 10px 0 0 20px; padding-left: 0;">
                    <li>Asegúrate de que el comprobante sea legible</li>
                    <li>El pago será revisado por un administrador</li>
                    <li>Recibirás una notificación cuando sea validado</li>
                </ul>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closePagarCuotaModal()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-paper-plane"></i> Enviar Pago
                </button>
            </div>
        </form>
    </div>
</div>



		<!-- HORAS -->
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

<!-- DEUDA DE HORAS - WIDGET PRINCIPAL -->
<div class="info-card">
    <h3>💳 Estado de Deuda de Horas</h3>
    <div id="deuda-actual-container">
        <p class="loading">Calculando deuda...</p>
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