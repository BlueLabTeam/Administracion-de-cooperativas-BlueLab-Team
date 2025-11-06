<!DOCTYPE html>
<html lang="es">

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	

	<link rel="stylesheet" href="/assets/css/dashboardVariables.css" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
	<link rel="stylesheet" href="/assets/css/dashboardBase.css" />
	<link rel="stylesheet" href="/assets/css/dashboardHeader.css" />
	<link rel="stylesheet" href="/assets/css/dashboardTablasUnificadas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardCuotasAdmin.css" />
	<link rel="stylesheet" href="/assets/css/dashboardViviendas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardTareas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardPagos.css" />
	<link rel="stylesheet" href="/assets/css/dashboardUtils.css" />
	<link rel="stylesheet" href="/assets/css/dashboardUsuarios.css" />
	<link rel="stylesheet" href="/assets/css/dashboardNucleos.css" /> 
	<link rel="stylesheet" href="/assets/css/dashboardMateriales.css" /> 
	<link rel="stylesheet" href="/assets/css/dashboardCuotas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardSolicitudesAdmin.css" />
	<link rel="stylesheet" href="/assets/css/dashboardReportes.css" />
	<link rel="stylesheet" href="/assets/css/i18n.css" />


	<script src="/assets/js/translationsdashboard.js"></script>
	<script src="/assets/js/i18n.js"></script>
</head>
<body>
	<?php include __DIR__ . '/includes/dashboardHeaderAdmin.html'; ?>

	<main class="content-area">
		<!-- SECCIÓN INICIO -->
		<section id="inicio-section" class="section-content active">
			<h2 class="section-title" data-i18n="dashboardAdmin.home.title">Inicio - Panel Administrativo</h2>
			
			<div class="info-card">
				<h3 data-i18n="dashboardAdmin.home.welcome">Bienvenido al Panel de Administración</h3>
				<p data-i18n="dashboardAdmin.home.description">Desde aquí puedes gestionar todos los aspectos de la cooperativa.</p>
				<p><strong data-i18n="dashboardAdmin.home.sectionsTitle">Secciones disponibles:</strong></p>
				<ul>
					<li><strong data-i18n="dashboardAdmin.home.sectionsUsers">Usuarios:</strong> <span data-i18n="dashboardAdmin.home.sectionsUsersDesc">Gestionar pagos pendientes y usuarios</span></li>
					<li><strong data-i18n="dashboardAdmin.home.sectionsNotifications">Notificaciones:</strong> <span data-i18n="dashboardAdmin.home.sectionsNotificationsDesc">Enviar mensajes a los socios</span></li>
					<li><strong data-i18n="dashboardAdmin.home.sectionsFamily">Núcleos Familiares:</strong> <span data-i18n="dashboardAdmin.home.sectionsFamilyDesc">Gestionar grupos familiares</span></li>
					<li><strong data-i18n="dashboardAdmin.home.sectionsTasks">Tareas:</strong> <span data-i18n="dashboardAdmin.home.sectionsTasksDesc">Asignar y gestionar tareas</span></li>
					<li><strong data-i18n="dashboardAdmin.home.sectionsReports">Reportes:</strong> <span data-i18n="dashboardAdmin.home.sectionsReportsDesc">Visualizar estadísticas</span></li>
				</ul>
			</div>
		</section>

		<!-- SECCIÓN USUARIOS -->
		<section id="usuarios-section" class="section-content">
			<h2 class="section-title" data-i18n="dashboardAdmin.users.title">Gestión de Usuarios</h2>
			
			<div class="info-card">
				<div class="users-table-header">
					<h3 data-i18n="dashboardAdmin.users.allUsers">Todos los Usuarios</h3>
					<div class="filter-controls">
						<select id="filtro-estado-usuarios" onchange="filterUsers()">
							<option value="" data-i18n="dashboardAdmin.users.filterAllStates">Todos los estados</option>
							<option value="pendiente" data-i18n="dashboardAdmin.users.filterPending">Pendiente</option>
							<option value="enviado" data-i18n="dashboardAdmin.users.filterSent">Enviado (Pendiente Aprobación)</option>
							<option value="aceptado" data-i18n="dashboardAdmin.users.filterAccepted">Aceptado</option>
							<option value="rechazado" data-i18n="dashboardAdmin.users.filterRejected">Rechazado</option>
						</select>
						<input type="text" id="search-users" data-i18n-placeholder="dashboardAdmin.users.searchPlaceholder" placeholder="Buscar usuario..." onkeyup="filterUsers()">
					</div>
				</div>
				
				<div id="usersTableContainer">
					<p class="loading" data-i18n="common.loading">Cargando usuarios...</p>
				</div>
			</div>
		</section>

		<!-- SECCIÓN NOTIFICACIONES -->
		<section id="notificaciones-section" class="section-content">
			<h2 class="section-title" data-i18n="dashboardAdmin.notifications.title">Gestión de Notificaciones</h2>
			
			<div class="info-card">
				<h3 data-i18n="dashboardAdmin.notifications.sendNew">Enviar Nueva Notificación</h3>
				
				<form id="notificationForm" onsubmit="sendNotification(event)">
					<div class="form-group">
						<label for="titulo" data-i18n="dashboardAdmin.notifications.titleLabel">Título:</label>
						<input type="text" id="titulo" name="titulo" required>
					</div>

					<div class="form-group">
						<label for="mensaje" data-i18n="dashboardAdmin.notifications.messageLabel">Mensaje:</label>
						<textarea id="mensaje" name="mensaje" rows="4" required></textarea>
					</div>

					<div class="form-group">
						<label for="tipo" data-i18n="dashboardAdmin.notifications.typeLabel">Tipo:</label>
						<select id="tipo" name="tipo">
							<option value="info" data-i18n="dashboardAdmin.notifications.typeInfo">Información</option>
							<option value="importante" data-i18n="dashboardAdmin.notifications.typeImportant">Importante</option>
							<option value="urgente" data-i18n="dashboardAdmin.notifications.typeUrgent">Urgente</option>
							<option value="exito" data-i18n="dashboardAdmin.notifications.typeSuccess">Éxito</option>
						</select>
					</div>

					<div class="form-group">
						<label data-i18n="dashboardAdmin.notifications.recipientsLabel">Destinatarios:</label>
						<div class="user-selection">
							<button type="button" onclick="toggleAllUsers()" class="btn-secondary" data-i18n="dashboardAdmin.notifications.selectAll">
								Seleccionar Todos
							</button>
							<div id="usersList" class="users-checkboxes">
								<p class="loading" data-i18n="common.loading">Cargando usuarios...</p>
							</div>
						</div>
					</div>

					<button type="submit" class="btn btn-primary" data-i18n="dashboardAdmin.notifications.sendButton">Enviar Notificación</button>
				</form>
			</div>
		</section>

		<!-- SECCIÓN NÚCLEO FAMILIAR -->
		<section id="nucleo-section" class="section-content">
			<h2 class="section-title" data-i18n="dashboardAdmin.family.title">Gestión de Núcleos Familiares</h2>
			
			<div class="info-card">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
					<h3 data-i18n="dashboardAdmin.family.registered">Núcleos Familiares Registrados</h3>
					<button class="btn btn-primary" onclick="showCreateNucleoForm()" data-i18n="dashboardAdmin.family.createNew">
						Crear Nuevo Núcleo
					</button>
				</div>
				
				<div id="nucleosTableContainer">
					<p class="loading" data-i18n="common.loading">Cargando núcleos...</p>
				</div>
			</div>
			
			<div class="info-card">
				<h3 data-i18n="dashboardAdmin.family.infoTitle">Información sobre Núcleos Familiares</h3>
				<ul style="line-height: 1.8;">
					<li><strong data-i18n="dashboardAdmin.family.infoWhat">¿Qué es un núcleo familiar?</strong> <span data-i18n="dashboardAdmin.family.infoWhatDesc">Grupo de usuarios que comparten vivienda o están relacionados</span></li>
					<li><strong data-i18n="dashboardAdmin.family.infoTasks">Asignación de tareas:</strong> <span data-i18n="dashboardAdmin.family.infoTasksDesc">Las tareas pueden asignarse a núcleos completos</span></li>
					<li><strong data-i18n="dashboardAdmin.family.infoUsers">Gestión de usuarios:</strong> <span data-i18n="dashboardAdmin.family.infoUsersDesc">Un usuario puede pertenecer a un solo núcleo</span></li>
					<li><strong data-i18n="dashboardAdmin.family.infoDelete">Eliminación:</strong> <span data-i18n="dashboardAdmin.family.infoDeleteDesc">Al eliminar un núcleo, los usuarios NO se eliminan, solo se desvinculan</span></li>
				</ul>
			</div>
		</section>

		<!-- SECCIÓN REPORTES -->
		<section id="reportes-section" class="section-content">
			<h2 class="section-title" data-i18n="dashboardAdmin.reports.title">📊 Reportes Mensuales</h2>
			
			<div class="info-card">
				<h3 data-i18n="dashboardAdmin.reports.selectPeriod">⚙️ Seleccionar Período</h3>
				<div class="reportes-filters">
					<select id="reporte-mes">
						<option value="" data-i18n="dashboardAdmin.reports.selectMonth">Seleccione mes...</option>
						<option value="1" data-i18n="months.january">Enero</option>
						<option value="2" data-i18n="months.february">Febrero</option>
						<option value="3" data-i18n="months.march">Marzo</option>
						<option value="4" data-i18n="months.april">Abril</option>
						<option value="5" data-i18n="months.may">Mayo</option>
						<option value="6" data-i18n="months.june">Junio</option>
						<option value="7" data-i18n="months.july">Julio</option>
						<option value="8" data-i18n="months.august">Agosto</option>
						<option value="9" data-i18n="months.september">Septiembre</option>
						<option value="10" data-i18n="months.october">Octubre</option>
						<option value="11" data-i18n="months.november">Noviembre</option>
						<option value="12" data-i18n="months.december">Diciembre</option>
					</select>
					
					<select id="reporte-anio">
						<option value="" data-i18n="dashboardAdmin.reports.selectYear">Seleccione año...</option>
					</select>
					
					<button class="btn btn-primary" onclick="generarReporte()">
						<i class="fas fa-chart-bar"></i> <span data-i18n="dashboardAdmin.reports.generate">Generar Reporte</span>
					</button>
					
					<button class="btn btn-success" onclick="exportarReporteCSV()" id="btn-exportar" style="display: none;">
						<i class="fas fa-file-excel"></i> <span data-i18n="dashboardAdmin.reports.exportCSV">Exportar CSV</span>
					</button>
				</div>
			</div>
			
			<div id="reporte-resumen-container" style="display: none;">
				<div class="stats-grid">
					<div class="stat-card">
						<i class="fas fa-users"></i>
						<h4 data-i18n="dashboardAdmin.reports.totalUsers">Total Usuarios</h4>
						<p id="reporte-total-usuarios">0</p>
					</div>
					<div class="stat-card">
						<i class="fas fa-clock"></i>
						<h4 data-i18n="dashboardAdmin.reports.hoursWorked">Horas Trabajadas</h4>
						<p id="reporte-total-horas">0</p>
					</div>
					<div class="stat-card">
						<i class="fas fa-tasks"></i>
						<h4 data-i18n="dashboardAdmin.reports.completedTasks">Tareas Completadas</h4>
						<p id="reporte-tareas-completadas">0</p>
					</div>
					<div class="stat-card">
						<i class="fas fa-percentage"></i>
						<h4 data-i18n="dashboardAdmin.reports.avgCompliance">Cumplimiento Promedio</h4>
						<p id="reporte-cumplimiento-promedio">0%</p>
					</div>
				</div>
			</div>
			
			<div class="info-card" id="reporte-tabla-container" style="display: none;">
				<h3 data-i18n="dashboardAdmin.reports.detailByUser">📋 Detalle por Usuario</h3>
				<div class="table-responsive" id="reporteTableContainer">
					<p class="loading" data-i18n="common.loading">Cargando reporte...</p>
				</div>
			</div>
		</section>

		<!-- SECCIÓN VIVIENDAS -->
		<section id="viviendas-section" class="section-content">
			<h2 class="section-title" data-i18n="dashboardAdmin.housing.title">Gestión de Viviendas</h2>
			
			<div class="info-card">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
					<h3 data-i18n="dashboardAdmin.housing.registered">Viviendas Registradas</h3>
					<button class="btn btn-primary" onclick="showCreateViviendaModal()">
						<i class="fas fa-plus"></i> <span data-i18n="dashboardAdmin.housing.newHousing">Nueva Vivienda</span>
					</button>
				</div>
				
				<div class="filter-controls" style="margin-bottom: 20px;">
					<select id="filtro-estado-vivienda" onchange="filterViviendas()">
						<option value="" data-i18n="dashboardAdmin.housing.filterAllStates">Todos los estados</option>
						<option value="disponible" data-i18n="dashboardAdmin.housing.filterAvailable">Disponibles</option>
						<option value="ocupada" data-i18n="dashboardAdmin.housing.filterOccupied">Ocupadas</option>
						<option value="mantenimiento" data-i18n="dashboardAdmin.housing.filterMaintenance">En Mantenimiento</option>
					</select>
					<select id="filtro-habitaciones" onchange="filterViviendas()">
						<option value="" data-i18n="dashboardAdmin.housing.filterAllRooms">Todas las habitaciones</option>
						<option value="1" data-i18n="dashboardAdmin.housing.filter1Room">1 Habitación</option>
						<option value="2" data-i18n="dashboardAdmin.housing.filter2Rooms">2 Habitaciones</option>
						<option value="3" data-i18n="dashboardAdmin.housing.filter3Rooms">3 Habitaciones</option>
					</select>
					<input type="text" id="search-viviendas" data-i18n-placeholder="dashboardAdmin.housing.searchPlaceholder" placeholder="Buscar vivienda..." onkeyup="filterViviendas()">
				</div>
				
				<div id="viviendasTableContainer">
					<p class="loading" data-i18n="common.loading">Cargando viviendas...</p>
				</div>
			</div>
			
			<div class="info-card">
				<h3 data-i18n="dashboardAdmin.housing.infoTitle">Información sobre Viviendas</h3>
				<ul style="line-height: 1.8;">
					<li><strong data-i18n="dashboardAdmin.housing.infoStates">Estados:</strong> <span data-i18n="dashboardAdmin.housing.infoStatesDesc">Disponible, Ocupada, En Mantenimiento</span></li>
					<li><strong data-i18n="dashboardAdmin.housing.infoAssignment">Asignación:</strong> <span data-i18n="dashboardAdmin.housing.infoAssignmentDesc">Las viviendas se pueden asignar a usuarios individuales o núcleos familiares</span></li>
					<li><strong data-i18n="dashboardAdmin.housing.infoTypes">Tipos:</strong> <span data-i18n="dashboardAdmin.housing.infoTypesDesc">1, 2 o 3 habitaciones según las necesidades</span></li>
					<li><strong data-i18n="dashboardAdmin.housing.infoManagement">Gestión:</strong> <span data-i18n="dashboardAdmin.housing.infoManagementDesc">Puedes crear, editar, asignar y desasignar viviendas</span></li>
				</ul>
			</div>
		</section>

		<!-- Modal para crear/editar vivienda -->
		<div id="viviendaModal" class="material-modal" style="display: none;">
			<div class="material-modal-content">
				<div class="material-modal-header">
					<h3 id="viviendaModalTitle" data-i18n="dashboardAdmin.housing.modalNew">Nueva Vivienda</h3>
					<button class="close-material-modal" onclick="closeViviendaModal()">&times;</button>
				</div>
				
				<form id="viviendaForm" onsubmit="saveVivienda(event)">
					<input type="hidden" id="vivienda-id">
					
					<div class="material-form-group">
						<label for="vivienda-numero" data-i18n="dashboardAdmin.housing.housingNumber">Número de Vivienda *</label>
						<input type="text" id="vivienda-numero" required data-i18n-placeholder="dashboardAdmin.housing.housingNumberPlaceholder" placeholder="Ej: A-101">
					</div>
					
					<div class="material-form-group">
						<label for="vivienda-direccion" data-i18n="dashboardAdmin.housing.address">Dirección *</label>
						<input type="text" id="vivienda-direccion" required data-i18n-placeholder="dashboardAdmin.housing.addressPlaceholder" placeholder="Ej: Bloque A, Planta Baja">
					</div>
					
					<div class="material-form-group">
						<label for="vivienda-tipo" data-i18n="dashboardAdmin.housing.housingType">Tipo de Vivienda *</label>
						<select id="vivienda-tipo" required>
							<option value="" data-i18n="common.select">Seleccione...</option>
						</select>
					</div>
					
					<div class="material-form-group">
						<label for="vivienda-metros" data-i18n="dashboardAdmin.housing.squareMeters">Metros Cuadrados</label>
						<input type="number" id="vivienda-metros" step="0.01" data-i18n-placeholder="dashboardAdmin.housing.squareMetersPlaceholder" placeholder="Ej: 55.50">
					</div>
					
					<div class="material-form-group">
						<label for="vivienda-fecha" data-i18n="dashboardAdmin.housing.constructionDate">Fecha de Construcción</label>
						<input type="date" id="vivienda-fecha">
					</div>
					
					<div class="material-form-group">
						<label for="vivienda-estado" data-i18n="common.status">Estado</label>
						<select id="vivienda-estado">
							<option value="disponible" data-i18n="dashboardAdmin.housing.statusAvailable">Disponible</option>
							<option value="ocupada" data-i18n="dashboardAdmin.housing.statusOccupied">Ocupada</option>
							<option value="mantenimiento" data-i18n="dashboardAdmin.housing.statusMaintenance">Mantenimiento</option>
						</select>
					</div>
					
					<div class="material-form-group">
						<label for="vivienda-observaciones" data-i18n="common.observations">Observaciones</label>
						<textarea id="vivienda-observaciones" data-i18n-placeholder="dashboardAdmin.housing.observationsPlaceholder" placeholder="Notas adicionales..."></textarea>
					</div>
					
					<div class="material-form-actions">
						<button type="button" class="btn btn-secondary" onclick="closeViviendaModal()" data-i18n="common.cancel">Cancelar</button>
						<button type="submit" class="btn btn-primary" data-i18n="dashboardAdmin.housing.saveHousing">Guardar Vivienda</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Modal para asignar vivienda -->
		<div id="asignarViviendaModal" class="material-modal" style="display: none;">
			<div class="material-modal-content">
				<div class="material-modal-header">
					<h3 data-i18n="dashboardAdmin.housing.assignHousing">Asignar Vivienda</h3>
					<button class="close-material-modal" onclick="closeAsignarModal()">&times;</button>
				</div>
				
				<form id="asignarForm" onsubmit="submitAsignacion(event)">
					<input type="hidden" id="asignar-vivienda-id">
					
					<div class="form-group">
						<label data-i18n="dashboardAdmin.housing.housing">Vivienda</label>
						<p id="asignar-vivienda-info" style="font-weight: bold; color: #005CB9;"></p>
					</div>

					<div class="form-group">
						<label for="asignar-tipo" data-i18n="dashboardAdmin.housing.assignTo">Asignar a *</label>
						<select id="asignar-tipo" required onchange="toggleAsignarTipo()">
							<option value="" data-i18n="common.select">Seleccione...</option>
							<option value="usuario" data-i18n="dashboardAdmin.housing.individualUser">Usuario Individual</option>
							<option value="nucleo" data-i18n="dashboardAdmin.housing.familyNucleus">Núcleo Familiar</option>
						</select>
					</div>

					<div class="form-group" id="asignar-usuario-group" style="display: none;">
						<label for="asignar-usuario" data-i18n="common.user">Usuario *</label>
						<select id="asignar-usuario">
							<option value="" data-i18n="common.loading">Cargando...</option>
						</select>
					</div>

					<div class="form-group" id="asignar-nucleo-group" style="display: none;">
						<label for="asignar-nucleo" data-i18n="dashboardAdmin.housing.familyNucleus">Núcleo Familiar *</label>
						<select id="asignar-nucleo">
							<option value="" data-i18n="common.loading">Cargando...</option>
						</select>
					</div>

					<div class="form-group">
						<label for="asignar-observaciones" data-i18n="common.observations">Observaciones</label>
						<textarea id="asignar-observaciones" rows="3"></textarea>
					</div>

					<div class="form-actions">
						<button type="button" class="btn btn-secondary" onclick="closeAsignarModal()" data-i18n="common.cancel">Cancelar</button>
						<button type="submit" class="btn btn-primary" data-i18n="dashboardAdmin.housing.assignHousing">Asignar Vivienda</button>
					</div>
				</form>
			</div>
		</div>

		<!-- SECCIÓN FACTURACIÓN -->
		<section id="cuotas-section" class="section-content">
			<h2 class="section-title" data-i18n="dashboardAdmin.billing.title">💰 Gestión de Cuotas Mensuales</h2>
			
			<div class="stats-grid">
				<div class="stat-card">
					<i class="fas fa-file-invoice-dollar"></i>
					<h4 data-i18n="dashboardAdmin.billing.totalQuotas">Total Cuotas</h4>
					<p id="admin-total-cuotas">0</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-check-circle"></i>
					<h4 data-i18n="dashboardAdmin.billing.paid">Pagadas</h4>
					<p id="admin-cuotas-pagadas">0</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-clock"></i>
					<h4 data-i18n="dashboardAdmin.billing.pending">Pendientes</h4>
					<p id="admin-cuotas-pendientes">0</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-dollar-sign"></i>
					<h4 data-i18n="dashboardAdmin.billing.amountCollected">Monto Cobrado</h4>
					<p id="admin-monto-cobrado">$0</p>
				</div>
			</div>
			
			<div class="info-card">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
					<h3 data-i18n="dashboardAdmin.billing.priceConfig">⚙️ Configuración de Precios</h3>
					<button class="btn btn-secondary" onclick="loadPreciosCuotas()">
						<i class="fas fa-sync-alt"></i> <span data-i18n="common.update">Actualizar</span>
					</button>
				</div>
				
				<div id="preciosCuotasContainer">
					<p class="loading" data-i18n="common.loading">Cargando precios...</p>
				</div>
			</div>
			
			<div class="info-card">
				<h3 data-i18n="dashboardAdmin.billing.quickActions">🚀 Acciones Rápidas</h3>
				<div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px;">
					<button class="btn btn-primary" onclick="generarCuotasMesActual()">
						<i class="fas fa-calendar-plus"></i> <span data-i18n="dashboardAdmin.billing.generateCurrentMonth">Generar Cuotas del Mes Actual</span>
					</button>
				</div>
			</div>
			
			<div class="info-card">
				<div class="cuotas-admin-filters">
					<select id="admin-filtro-anio" onchange="loadAllCuotasAdmin()">
						<option value="" data-i18n="dashboardAdmin.billing.filterAllYears">Todos los años</option>
					</select>
					<select id="admin-filtro-mes" onchange="loadAllCuotasAdmin()">
						<option value="" data-i18n="dashboardAdmin.billing.filterAllMonths">Todos los meses</option>
						<option value="1" data-i18n="months.january">Enero</option>
						<option value="2" data-i18n="months.february">Febrero</option>
						<option value="3" data-i18n="months.march">Marzo</option>
						<option value="4" data-i18n="months.april">Abril</option>
						<option value="5" data-i18n="months.may">Mayo</option>
						<option value="6" data-i18n="months.june">Junio</option>
						<option value="7" data-i18n="months.july">Julio</option>
						<option value="8" data-i18n="months.august">Agosto</option>
						<option value="9" data-i18n="months.september">Septiembre</option>
						<option value="10" data-i18n="months.october">Octubre</option>
						<option value="11" data-i18n="months.november">Noviembre</option>
						<option value="12" data-i18n="months.december">Diciembre</option>
					</select>
					<select id="admin-filtro-estado" onchange="loadAllCuotasAdmin()">
						<option value="" data-i18n="dashboardAdmin.billing.filterAllStates">Todos los estados</option>
						<option value="pendiente" data-i18n="dashboardAdmin.billing.filterPending">Pendientes</option>
						<option value="pagada" data-i18n="dashboardAdmin.billing.filterPaid">Pagadas</option>
					</select>
					<button class="btn btn-secondary" onclick="loadAllCuotasAdmin()">
						<i class="fas fa-filter"></i> <span data-i18n="common.filter">Filtrar</span>
					</button>
				</div>
			</div>
			
			<div class="info-card">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
					<h3 data-i18n="dashboardAdmin.billing.allQuotas">📋 Todas las Cuotas</h3>
					<button class="btn btn-secondary" onclick="loadAllCuotasAdmin()">
						<i class="fas fa-sync-alt"></i> <span data-i18n="common.update">Actualizar</span>
					</button>
				</div>
				
				<div id="allCuotasAdminContainer">
					<p class="loading" data-i18n="common.loading">Cargando cuotas...</p>
				</div>
			</div>
		</section>

		<!-- Modal para editar precio -->
		<div id="editarPrecioModal" class="modal-overlay" style="display: none;">
			<div class="modal-content">
				<button class="modal-close-btn" onclick="closeEditarPrecioModal()">×</button>
				
				<h2 class="modal-title" data-i18n="dashboardAdmin.billing.updatePrice">💵 Actualizar Precio de Cuota</h2>
				
				<form id="editarPrecioForm" onsubmit="submitEditarPrecio(event)">
					<input type="hidden" id="precio-id-tipo">
					
					<div class="form-group">
						<label id="precio-tipo-nombre" data-i18n="dashboardAdmin.billing.housingType">Tipo de Vivienda</label>
					</div>
					
					<div class="form-group">
						<label for="precio-monto" data-i18n="dashboardAdmin.billing.newMonthlyAmount">Nuevo Monto Mensual *</label>
						<input type="number" 
							   id="precio-monto" 
							   step="0.01" 
							   min="0" 
							   required 
							   data-i18n-placeholder="dashboardAdmin.billing.amountPlaceholder"
							   placeholder="Ej: 7500.00">
					</div>
					
					<div class="alert-warning" style="margin: 15px 0;">
						<strong data-i18n="common.important">⚠ Importante:</strong>
						<p data-i18n="dashboardAdmin.billing.priceChangeWarning">Este cambio aplicará para las nuevas cuotas que se generen. Las cuotas ya existentes mantendrán su monto original.</p>
					</div>
					
					<div class="form-actions">
						<button type="button" class="btn btn-secondary" onclick="closeEditarPrecioModal()" data-i18n="common.cancel">
							Cancelar
						</button>
						<button type="submit" class="btn btn-primary">
							<i class="fas fa-save"></i> <span data-i18n="common.saveChanges">Guardar Cambios</span>
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Modal para validar pago -->
		<div id="validarPagoModal" class="modal-overlay" style="display: none;">
			<div class="modal-content-large">
				<button class="modal-close-btn" onclick="closeValidarPagoModal()">×</button>
				
				<h2 class="modal-title" data-i18n="dashboardAdmin.billing.validatePayment">✅ Validar Pago de Cuota</h2>
				
				<div id="pago-info-validar">
					<!-- Info se carga dinámicamente -->
				</div>
				
				<form id="validarPagoForm" onsubmit="submitValidarPago(event)">
					<input type="hidden" id="validar-pago-id">
					<input type="hidden" id="validar-accion">
					
					<div class="form-group">
						<label for="validar-observaciones" data-i18n="dashboardAdmin.billing.observationsOptional">Observaciones (opcional)</label>
						<textarea id="validar-observaciones" 
								  rows="3" 
								  data-i18n-placeholder="dashboardAdmin.billing.validationComments"
								  placeholder="Comentarios sobre la validación..."></textarea>
					</div>
					
					<div class="form-actions">
						<button type="button" class="btn btn-secondary" onclick="closeValidarPagoModal()" data-i18n="common.cancel">
							Cancelar
						</button>
						<button type="button" class="btn btn-danger" onclick="rechazarPagoAdmin()">
							<i class="fas fa-times"></i> <span data-i18n="common.reject">Rechazar</span>
						</button>
						<button type="button" class="btn btn-primary" onclick="aprobarPagoAdmin()">
							<i class="fas fa-check"></i> <span data-i18n="common.approve">Aprobar</span>
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- SECCIÓN MATERIALES -->
		<section id="materiales-section" class="section-content">
			<h2 class="section-title" data-i18n="dashboardAdmin.materials.title">Gestión de Materiales</h2>
			
			<div class="info-card">
				<div class="materiales-header">
					<div class="materiales-search">
						<input type="text" id="search-materiales" data-i18n-placeholder="dashboardAdmin.materials.searchPlaceholder" placeholder="Buscar material..." onkeyup="searchMateriales()">
					</div>
					<button class="btn btn-primary" onclick="showCreateMaterialModal()">
						<i class="fas fa-plus"></i> <span data-i18n="dashboardAdmin.materials.newMaterial">Nuevo Material</span>
					</button>
				</div>
				
				<div id="materialesTableContainer">
					<p class="loading" data-i18n="common.loading">Cargando materiales...</p>
				</div>
			</div>
			
			<div class="info-card">
				<h3 data-i18n="dashboardAdmin.materials.infoTitle">Información sobre Materiales</h3>
				<ul style="line-height: 1.8;">
					<li><strong data-i18n="dashboardAdmin.materials.infoWhat">¿Qué son los materiales?</strong> <span data-i18n="dashboardAdmin.materials.infoWhatDesc">Recursos necesarios para realizar las tareas de la cooperativa</span></li>
					<li><strong data-i18n="dashboardAdmin.materials.infoStock">Stock:</strong> <span data-i18n="dashboardAdmin.materials.infoStockDesc">Control de cantidades disponibles de cada material</span></li>
					<li><strong data-i18n="dashboardAdmin.materials.infoTaskAssignment">Asignación a tareas:</strong> <span data-i18n="dashboardAdmin.materials.infoTaskAssignmentDesc">Los materiales se pueden asignar a tareas específicas</span></li>
					<li><strong data-i18n="dashboardAdmin.materials.infoRequests">Solicitudes:</strong> <span data-i18n="dashboardAdmin.materials.infoRequestsDesc">Los usuarios pueden solicitar materiales cuando los necesitan</span></li>
				</ul>
			</div>
		</section>

		<!-- Modal para crear/editar material -->
		<div id="materialModal" class="material-modal" style="display: none;">
			<div class="material-modal-content">
				<div class="material-modal-header">
					<h3 id="materialModalTitle" data-i18n="dashboardAdmin.materials.newMaterial">Nuevo Material</h3>
					<button class="close-material-modal" onclick="closeMaterialModal()">&times;</button>
				</div>
				
				<form id="materialForm" onsubmit="saveMaterial(event)">
					<input type="hidden" id="material-id">
					
					<div class="material-form-group">
						<label for="material-nombre" data-i18n="dashboardAdmin.materials.materialName">Nombre del Material *</label>
						<input type="text" id="material-nombre" required data-i18n-placeholder="dashboardAdmin.materials.materialNamePlaceholder" placeholder="Ej: Cemento, Ladrillos, Arena">
					</div>
					
					<div class="material-form-group">
						<label for="material-caracteristicas" data-i18n="dashboardAdmin.materials.characteristics">Características / Descripción</label>
						<textarea id="material-caracteristicas" data-i18n-placeholder="dashboardAdmin.materials.characteristicsPlaceholder" placeholder="Describe el material, sus especificaciones, etc."></textarea>
					</div>
					
					<div class="material-form-actions">
						<button type="button" class="btn btn-secondary" onclick="closeMaterialModal()" data-i18n="common.cancel">Cancelar</button>
						<button type="submit" class="btn btn-primary" data-i18n="dashboardAdmin.materials.saveMaterial">Guardar Material</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Modal para actualizar stock -->
		<div id="stockModal" class="material-modal" style="display: none;">
			<div class="material-modal-content">
				<div class="material-modal-header">
					<h3 data-i18n="dashboardAdmin.materials.updateStock">Actualizar Stock</h3>
					<button class="close-material-modal" onclick="closeStockModal()">&times;</button>
				</div>
				
				<form id="stockForm" onsubmit="updateStock(event)">
					<input type="hidden" id="stock-material-id">
					
					<div class="material-form-group">
						<label id="stock-material-name" data-i18n="dashboardAdmin.materials.material">Material</label>
					</div>
					
					<div class="material-form-group">
						<label for="stock-cantidad" data-i18n="dashboardAdmin.materials.availableQuantity">Cantidad Disponible *</label>
						<input type="number" id="stock-cantidad" required min="0" placeholder="0">
					</div>
					
					<div class="material-form-actions">
						<button type="button" class="btn btn-secondary" onclick="closeStockModal()" data-i18n="common.cancel">Cancelar</button>
						<button type="submit" class="btn btn-primary" data-i18n="dashboardAdmin.materials.updateStock">Actualizar Stock</button>
					</div>
				</form>
			</div>
		</div>

		<!-- SECCIÓN TAREAS -->
		<section id="tareas-section" class="section-content">
			<h2 class="section-title" data-i18n="dashboardAdmin.tasks.title">Gestión de Tareas</h2>

			<div class="info-card">
				<h3 data-i18n="dashboardAdmin.tasks.createNew">Crear Nueva Tarea</h3>
				
				<form id="taskForm" onsubmit="createTask(event)">
					<div class="form-group">
						<label for="titulo_tarea" data-i18n="dashboardAdmin.tasks.titleLabel">Título:</label>
						<input type="text" id="titulo_tarea" name="titulo" required>
					</div>

					<div class="form-group">
						<label for="descripcion_tarea" data-i18n="dashboardAdmin.tasks.descriptionLabel">Descripción:</label>
						<textarea id="descripcion_tarea" name="descripcion" rows="4" required></textarea>
					</div>

					<div class="task-form-grid">
						<div class="form-group">
							<label for="fecha_inicio" data-i18n="dashboardAdmin.tasks.startDate">Fecha de Inicio:</label>
							<input type="date" id="fecha_inicio" name="fecha_inicio" required>
						</div>

						<div class="form-group">
							<label for="fecha_fin" data-i18n="dashboardAdmin.tasks.endDate">Fecha de Finalización:</label>
							<input type="date" id="fecha_fin" name="fecha_fin" required>
						</div>
					</div>

					<div class="task-form-grid">
						<div class="form-group">
							<label for="prioridad" data-i18n="common.priority">Prioridad:</label>
							<select id="prioridad" name="prioridad">
								<option value="baja" data-i18n="common.priorityLow">Baja</option>
								<option value="media" selected data-i18n="common.priorityMedium">Media</option>
								<option value="alta" data-i18n="common.priorityHigh">Alta</option>
							</select>
						</div>

						<div class="form-group">
							<label for="tipo_asignacion" data-i18n="dashboardAdmin.tasks.assignTo">Asignar a:</label>
							<select id="tipo_asignacion" name="tipo_asignacion" onchange="toggleAsignacion()">
								<option value="usuario" data-i18n="dashboardAdmin.tasks.individualUsers">Usuarios Individuales</option>
								<option value="nucleo" data-i18n="dashboardAdmin.tasks.familyNuclei">Núcleos Familiares</option>
							</select>
						</div>
					</div>

					<div class="form-group" id="usuarios-selector">
						<label data-i18n="dashboardAdmin.tasks.selectUsers">Seleccionar Usuarios:</label>
						<div class="user-selection">
							<button type="button" onclick="toggleAllTaskUsers()" class="btn-secondary" data-i18n="dashboardAdmin.tasks.selectAll">
								Seleccionar Todos
							</button>
							<div id="taskUsersList" class="users-checkboxes">
								<p class="loading" data-i18n="common.loading">Cargando usuarios...</p>
							</div>
						</div>
					</div>

					<div class="form-group" id="nucleos-selector" style="display: none;">
						<label data-i18n="dashboardAdmin.tasks.selectNuclei">Seleccionar Núcleos Familiares:</label>
						<div class="user-selection">
							<button type="button" onclick="toggleAllNucleos()" class="btn-secondary" data-i18n="dashboardAdmin.tasks.selectAll">
								Seleccionar Todos
							</button>
							<div id="taskNucleosList" class="users-checkboxes">
								<p class="loading" data-i18n="common.loading">Cargando núcleos...</p>
							</div>
						</div>
					</div>

					<div class="form-group">
						<label data-i18n="dashboardAdmin.tasks.materialsNeeded">📦 Materiales necesarios para esta tarea:</label>
						<div class="materiales-tarea-selector">
							<div class="materiales-search-box">
								<input type="text" 
									   id="search-materiales-tarea" 
									   data-i18n-placeholder="dashboardAdmin.tasks.searchMaterial"
									   placeholder="Buscar material..."
									   onkeyup="filterMaterialesTarea()">
							</div>
							
							<div id="materiales-tarea-list" class="materiales-selector-list">
								<p class="loading" data-i18n="common.loading">Cargando materiales...</p>
							</div>
							
							<div id="materiales-asignados-list" class="materiales-asignados-container">
								<p class="no-materials" data-i18n="dashboardAdmin.tasks.noMaterialsAssigned">No hay materiales asignados</p>
							</div>
						</div>
					</div>

					<button type="submit" class="btn btn-primary" data-i18n="dashboardAdmin.tasks.createTask">Crear Tarea</button>
				</form>
			</div>

			<div class="info-card">
				<div class="task-list-header">
					<h3 data-i18n="dashboardAdmin.tasks.createdTasks">Tareas Creadas</h3>
					<div>
						<select id="filtro-estado" onchange="loadAllTasks()">
							<option value="" data-i18n="common.all">Todas</option>
							<option value="pendiente" data-i18n="common.statusPending">Pendientes</option>
							<option value="completada" data-i18n="common.statusCompleted">Completadas</option>
							<option value="cancelada" data-i18n="common.statusCanceled">Canceladas</option>
							<option value="vencida" data-i18n="common.statusExpired">Vencidas</option>
						</select>
					</div>
				</div>
				
				<div id="tasksList">
					<p class="loading" data-i18n="common.loading">Cargando tareas...</p>
				</div>
			</div>
		</section>

		<!-- SECCIÓN SOLICITUDES ADMIN -->
		<section id="solicitudes-section" class="section-content">
			<h2 class="section-title" data-i18n="dashboardAdmin.requests.title">📩 Gestión de Solicitudes</h2>

			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-icon">
						<i class="fas fa-inbox"></i>
					</div>
					<div class="stat-info">
						<span class="stat-label" data-i18n="common.total">Total</span>
						<span class="stat-value" id="solicitudes-total-admin">0</span>
					</div>
				</div>

				<div class="stat-card pendiente">
					<div class="stat-icon">
						<i class="fas fa-clock"></i>
					</div>
					<div class="stat-info">
						<span class="stat-label" data-i18n="common.statusPending">Pendientes</span>
						<span class="stat-value" id="solicitudes-pendientes-admin">0</span>
					</div>
				</div>

				<div class="stat-card warning">
					<div class="stat-icon">
						<i class="fas fa-eye"></i>
					</div>
					<div class="stat-info">
						<span class="stat-label" data-i18n="dashboardAdmin.requests.inReview">En Revisión</span>
						<span class="stat-value" id="solicitudes-revision-admin">0</span>
					</div>
				</div>

				<div class="stat-card success">
					<div class="stat-icon">
						<i class="fas fa-check-circle"></i>
					</div>
					<div class="stat-info">
						<span class="stat-label" data-i18n="dashboardAdmin.requests.resolved">Resueltas</span>
						<span class="stat-value" id="solicitudes-resueltas-admin">0</span>
					</div>
				</div>

				<div class="stat-card error">
					<div class="stat-icon">
						<i class="fas fa-exclamation-triangle"></i>
					</div>
					<div class="stat-info">
						<span class="stat-label" data-i18n="dashboardAdmin.requests.highPriority">Prioridad Alta</span>
						<span class="stat-value" id="solicitudes-altas-admin">0</span>
					</div>
				</div>
			</div>

			<div class="filters-container-solicitudes-admin">
				<div class="filter-group-solicitudes-admin">
					<label for="filtro-estado-solicitudes-admin">
						<i class="fas fa-filter"></i> <span data-i18n="common.status">Estado:</span>
					</label>
					<select id="filtro-estado-solicitudes-admin" onchange="loadAllSolicitudes()">
						<option value="" data-i18n="dashboardAdmin.requests.filterAllStates">Todos los estados</option>
						<option value="pendiente" data-i18n="common.statusPending">Pendiente</option>
						<option value="en_revision" data-i18n="dashboardAdmin.requests.inReview">En Revisión</option>
						<option value="resuelta" data-i18n="dashboardAdmin.requests.resolved">Resuelta</option>
						<option value="rechazada" data-i18n="common.statusRejected">Rechazada</option>
					</select>
				</div>

				<div class="filter-group-solicitudes-admin">
					<label for="filtro-tipo-solicitudes-admin">
						<i class="fas fa-tag"></i> <span data-i18n="common.type">Tipo:</span>
					</label>
					<select id="filtro-tipo-solicitudes-admin" onchange="loadAllSolicitudes()">
						<option value="" data-i18n="dashboardAdmin.requests.filterAllTypes">Todos los tipos</option>
						<option value="horas" data-i18n="dashboardAdmin.requests.typeHours">Registro de Horas</option>
						<option value="pago" data-i18n="dashboardAdmin.requests.typePayment">Pagos/Cuotas</option>
						<option value="vivienda" data-i18n="dashboardAdmin.requests.typeHousing">Vivienda</option>
						<option value="general" data-i18n="dashboardAdmin.requests.typeGeneral">Consulta General</option>
						<option value="otro" data-i18n="dashboardAdmin.requests.typeOther">Otro</option>
					</select>
				</div>

				<div class="filter-group-solicitudes-admin">
					<label for="filtro-prioridad-solicitudes-admin">
						<i class="fas fa-exclamation-circle"></i> <span data-i18n="common.priority">Prioridad:</span>
					</label>
					<select id="filtro-prioridad-solicitudes-admin" onchange="loadAllSolicitudes()">
						<option value="" data-i18n="dashboardAdmin.requests.filterAllPriorities">Todas las prioridades</option>
						<option value="alta" data-i18n="common.priorityHigh">Alta</option>
						<option value="media" data-i18n="common.priorityMedium">Media</option>
						<option value="baja" data-i18n="common.priorityLow">Baja</option>
					</select>
				</div>
			</div>

			<div id="solicitudesAdminContainer" class="solicitudes-container">
				<p class="loading" data-i18n="common.loading">Cargando solicitudes...</p>
			</div>
		</section>
	</main>

	
	<script src="/assets/js/dashboardAdmin.js"></script>
</body>
</html>