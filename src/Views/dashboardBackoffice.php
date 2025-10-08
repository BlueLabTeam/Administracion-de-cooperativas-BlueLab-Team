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
	<link rel="stylesheet" href="/assets/css/dashboardViviendas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardTareas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardPagos.css" />
	<link rel="stylesheet" href="/assets/css/dashboardUtils.css" />
	<link rel="stylesheet" href="/assets/css/dashboardUsuarios.css" />
	<link rel="stylesheet" href="/assets/css/dashboardNucleos.css" /> 
	<link rel="stylesheet" href="/assets/css/dashboardMateriales.css" /> 
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
					<li><strong>Núcleos Familiares:</strong> Gestionar grupos familiares</li>
					<li><strong>Tareas:</strong> Asignar y gestionar tareas</li>
					<li><strong>Reportes:</strong> Visualizar estadísticas</li>
				</ul>
			</div>
		</section>

		<!-- SECCIÓN USUARIOS -->
		<section id="usuarios-section" class="section-content">
			<h2 class="section-title">Gestión de Usuarios</h2>
			
			<div class="info-card">
				<div class="users-table-header">
					<h3>Todos los Usuarios</h3>
					<div class="filter-controls">
						<select id="filtro-estado-usuarios" onchange="filterUsers()">
							<option value="">Todos los estados</option>
							<option value="pendiente">Pendiente</option>
							<option value="enviado">Enviado (Pendiente Aprobación)</option>
							<option value="aceptado">Aceptado</option>
							<option value="rechazado">Rechazado</option>
						</select>
						<input type="text" id="search-users" placeholder="Buscar usuario..." onkeyup="filterUsers()">
					</div>
				</div>
				
				<div id="usersTableContainer">
					<p class="loading">Cargando usuarios...</p>
				</div>
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

		<!-- SECCIÓN NÚCLEO FAMILIAR - NUEVA Y COMPLETA -->
		<section id="nucleo-section" class="section-content">
			<h2 class="section-title">Gestión de Núcleos Familiares</h2>
			
			<!-- Botón para crear nuevo núcleo -->
			<div class="info-card">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
					<h3>Núcleos Familiares Registrados</h3>
					<button class="btn btn-primary" onclick="showCreateNucleoForm()">
						Crear Nuevo Núcleo
					</button>
				</div>
				
				<div id="nucleosTableContainer">
					<p class="loading">Cargando núcleos...</p>
				</div>
			</div>
			
			<!-- Información adicional -->
			<div class="info-card">
				<h3>Información sobre Núcleos Familiares</h3>
				<ul style="line-height: 1.8;">
					<li><strong>¿Qué es un núcleo familiar?</strong> Grupo de usuarios que comparten vivienda o están relacionados</li>
					<li><strong>Asignación de tareas:</strong> Las tareas pueden asignarse a núcleos completos</li>
					<li><strong>Gestión de usuarios:</strong> Un usuario puede pertenecer a un solo núcleo</li>
					<li><strong>Eliminación:</strong> Al eliminar un núcleo, los usuarios NO se eliminan, solo se desvinculan</li>
				</ul>
			</div>
		</section>

		<!-- SECCIÓN REPORTES -->
		<section id="reportes-section" class="section-content">
			<h2 class="section-title">Reportes</h2>
			<div class="info-card">
				<p>Sección de reportes en desarrollo...</p>
			</div>
		</section>

		<!-- REEMPLAZAR LA SECCIÓN VIVIENDAS EN dashboardBackoffice.php CON ESTE CÓDIGO -->

<!-- SECCIÓN VIVIENDAS -->
<section id="viviendas-section" class="section-content">
	<h2 class="section-title">Gestión de Viviendas</h2>
	
	<!-- Botón para crear nueva vivienda -->
	<div class="info-card">
		<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
			<h3>Viviendas Registradas</h3>
			<button class="btn btn-primary" onclick="showCreateViviendaModal()">
				<i class="fas fa-plus"></i> Nueva Vivienda
			</button>
		</div>
		
		<!-- Filtros -->
		<div class="filter-controls" style="margin-bottom: 20px;">
			<select id="filtro-estado-vivienda" onchange="filterViviendas()">
				<option value="">Todos los estados</option>
				<option value="disponible">Disponibles</option>
				<option value="ocupada">Ocupadas</option>
				<option value="mantenimiento">En Mantenimiento</option>
			</select>
			<select id="filtro-habitaciones" onchange="filterViviendas()">
				<option value="">Todas las habitaciones</option>
				<option value="1">1 Habitación</option>
				<option value="2">2 Habitaciones</option>
				<option value="3">3 Habitaciones</option>
			</select>
			<input type="text" id="search-viviendas" placeholder="Buscar vivienda..." onkeyup="filterViviendas()">
		</div>
		
		<div id="viviendasTableContainer">
			<p class="loading">Cargando viviendas...</p>
		</div>
	</div>
	
	<!-- Información adicional -->
	<div class="info-card">
		<h3>Información sobre Viviendas</h3>
		<ul style="line-height: 1.8;">
			<li><strong>Estados:</strong> Disponible, Ocupada, En Mantenimiento</li>
			<li><strong>Asignación:</strong> Las viviendas se pueden asignar a usuarios individuales o núcleos familiares</li>
			<li><strong>Tipos:</strong> 1, 2 o 3 habitaciones según las necesidades</li>
			<li><strong>Gestión:</strong> Puedes crear, editar, asignar y desasignar viviendas</li>
		</ul>
	</div>
</section>

<!-- Modal para crear/editar vivienda -->
<div id="viviendaModal" class="material-modal">
	<div class="material-modal-content">
		<div class="material-modal-header">
			<h3 id="viviendaModalTitle">Nueva Vivienda</h3>
			<button class="close-material-modal" onclick="closeViviendaModal()">&times;</button>
		</div>
		
		<form id="viviendaForm" onsubmit="saveVivienda(event)">
			<input type="hidden" id="vivienda-id">
			
			<div class="material-form-group">
				<label for="vivienda-numero">Número de Vivienda *</label>
				<input type="text" id="vivienda-numero" required placeholder="Ej: A-101">
			</div>
			
			<div class="material-form-group">
				<label for="vivienda-direccion">Dirección *</label>
				<input type="text" id="vivienda-direccion" required placeholder="Ej: Bloque A, Planta Baja">
			</div>
			
			<div class="material-form-group">
				<label for="vivienda-tipo">Tipo de Vivienda *</label>
				<select id="vivienda-tipo" required>
					<option value="">Seleccione...</option>
				</select>
			</div>
			
			<div class="material-form-group">
				<label for="vivienda-metros">Metros Cuadrados</label>
				<input type="number" id="vivienda-metros" step="0.01" placeholder="Ej: 55.50">
			</div>
			
			<div class="material-form-group">
				<label for="vivienda-fecha">Fecha de Construcción</label>
				<input type="date" id="vivienda-fecha">
			</div>
			
			<div class="material-form-group">
				<label for="vivienda-estado">Estado</label>
				<select id="vivienda-estado">
					<option value="disponible">Disponible</option>
					<option value="ocupada">Ocupada</option>
					<option value="mantenimiento">Mantenimiento</option>
				</select>
			</div>
			
			<div class="material-form-group">
				<label for="vivienda-observaciones">Observaciones</label>
				<textarea id="vivienda-observaciones" placeholder="Notas adicionales..."></textarea>
			</div>
			
			<div class="material-form-actions">
				<button type="button" class="btn btn-secondary" onclick="closeViviendaModal()">Cancelar</button>
				<button type="submit" class="btn btn-primary">Guardar Vivienda</button>
			</div>
		</form>
	</div>
</div>

<!-- Modal para asignar vivienda -->
<div id="asignarViviendaModal" class="material-modal">
	<div class="material-modal-content">
		<div class="material-modal-header">
			<h3>Asignar Vivienda</h3>
			<button class="close-material-modal" onclick="closeAsignarModal()">&times;</button>
		</div>
		
		<form id="asignarForm" onsubmit="submitAsignacion(event)">
			<input type="hidden" id="asignar-vivienda-id">
			
			<div class="material-form-group">
				<label id="asignar-vivienda-info" style="font-weight: bold; color: #667eea;"></label>
			</div>
			
			<div class="material-form-group">
				<label for="asignar-tipo">Asignar a:</label>
				<select id="asignar-tipo" onchange="toggleAsignarTipo()" required>
					<option value="">Seleccione...</option>
					<option value="usuario">Usuario Individual</option>
					<option value="nucleo">Núcleo Familiar</option>
				</select>
			</div>
			
			<div class="material-form-group" id="asignar-usuario-group" style="display: none;">
				<label for="asignar-usuario">Seleccionar Usuario:</label>
				<select id="asignar-usuario">
					<option value="">Seleccione un usuario...</option>
				</select>
			</div>
			
			<div class="material-form-group" id="asignar-nucleo-group" style="display: none;">
				<label for="asignar-nucleo">Seleccionar Núcleo:</label>
				<select id="asignar-nucleo">
					<option value="">Seleccione un núcleo...</option>
				</select>
			</div>
			
			<div class="material-form-group">
				<label for="asignar-observaciones">Observaciones:</label>
				<textarea id="asignar-observaciones" placeholder="Notas sobre la asignación..."></textarea>
			</div>
			
			<div class="material-form-actions">
				<button type="button" class="btn btn-secondary" onclick="closeAsignarModal()">Cancelar</button>
				<button type="submit" class="btn btn-primary">Confirmar Asignación</button>
			</div>
		</form>
	</div>
</div>

		<!-- SECCIÓN FACTURACIÓN -->
		<section id="facturacion-section" class="section-content">
			<h2 class="section-title">Facturación</h2>
			<div class="info-card">
				<p>Sistema de facturación en desarrollo...</p>
			</div>
		</section>

		<!-- SECCIÓN INVENTARIO -->


<!-- SECCIÓN MATERIALES -->
<section id="materiales-section" class="section-content">
	<h2 class="section-title">Gestión de Materiales</h2>
	
	<!-- Cabecera con búsqueda y botón crear -->
	<div class="info-card">
		<div class="materiales-header">
			<div class="materiales-search">
				<input type="text" id="search-materiales" placeholder="Buscar material..." onkeyup="searchMateriales()">
			</div>
			<button class="btn btn-primary" onclick="showCreateMaterialModal()">
				<i class="fas fa-plus"></i> Nuevo Material
			</button>
		</div>
		
		<div id="materialesTableContainer">
			<p class="loading">Cargando materiales...</p>
		</div>
	</div>
	
	<!-- Información adicional -->
	<div class="info-card">
		<h3>Información sobre Materiales</h3>
		<ul style="line-height: 1.8;">
			<li><strong>¿Qué son los materiales?</strong> Recursos necesarios para realizar las tareas de la cooperativa</li>
			<li><strong>Stock:</strong> Control de cantidades disponibles de cada material</li>
			<li><strong>Asignación a tareas:</strong> Los materiales se pueden asignar a tareas específicas</li>
			<li><strong>Solicitudes:</strong> Los usuarios pueden solicitar materiales cuando los necesitan</li>
		</ul>
	</div>
</section>

<!-- Modal para crear/editar material -->
<div id="materialModal" class="material-modal">
	<div class="material-modal-content">
		<div class="material-modal-header">
			<h3 id="materialModalTitle">Nuevo Material</h3>
			<button class="close-material-modal" onclick="closeMaterialModal()">&times;</button>
		</div>
		
		<form id="materialForm" onsubmit="saveMaterial(event)">
			<input type="hidden" id="material-id">
			
			<div class="material-form-group">
				<label for="material-nombre">Nombre del Material *</label>
				<input type="text" id="material-nombre" required placeholder="Ej: Cemento, Ladrillos, Arena">
			</div>
			
			<div class="material-form-group">
				<label for="material-caracteristicas">Características / Descripción</label>
				<textarea id="material-caracteristicas" placeholder="Describe el material, sus especificaciones, etc."></textarea>
			</div>
			
			<div class="material-form-actions">
				<button type="button" class="btn btn-secondary" onclick="closeMaterialModal()">Cancelar</button>
				<button type="submit" class="btn btn-primary">Guardar Material</button>
			</div>
		</form>
	</div>
</div>

<!-- Modal para actualizar stock -->
<div id="stockModal" class="material-modal">
	<div class="material-modal-content">
		<div class="material-modal-header">
			<h3>Actualizar Stock</h3>
			<button class="close-material-modal" onclick="closeStockModal()">&times;</button>
		</div>
		
		<form id="stockForm" onsubmit="updateStock(event)">
			<input type="hidden" id="stock-material-id">
			
			<div class="material-form-group">
				<label id="stock-material-name">Material</label>
			</div>
			
			<div class="material-form-group">
				<label for="stock-cantidad">Cantidad Disponible *</label>
				<input type="number" id="stock-cantidad" required min="0" placeholder="0">
			</div>
			
			<div class="material-form-actions">
				<button type="button" class="btn btn-secondary" onclick="closeStockModal()">Cancelar</button>
				<button type="submit" class="btn btn-primary">Actualizar Stock</button>
			</div>
		</form>
	</div>
</div>

		<!-- SECCIÓN TAREAS -->
		<section id="tareas-section" class="section-content">
			<h2 class="section-title">Gestión de Tareas</h2>

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

				<!-- Selector de materiales -->
<div class="form-group">
    <label>📦 Materiales necesarios para esta tarea:</label>
    <div class="materiales-tarea-selector">
        <div class="materiales-search-box">
            <input type="text" 
                   id="search-materiales-tarea" 
                   placeholder="Buscar material..."
                   onkeyup="filterMaterialesTarea()">
        </div>
        
        <div id="materiales-tarea-list" class="materiales-selector-list">
            <p class="loading">Cargando materiales...</p>
        </div>
        
        <!-- Lista de materiales ya asignados -->
        <div id="materiales-asignados-list" class="materiales-asignados-container">
            <p style="color: #999; padding: 10px;">No hay materiales asignados</p>
        </div>
    </div>
</div>

<!-- BOTÓN CREAR TAREA - AQUÍ DEBE ESTAR -->
<button type="submit" class="btn btn-primary">Crear Tarea</button>

</form> <!-- Cierre del formulario -->
</div> <!-- Cierre de info-card -->

<!-- LISTA DE TAREAS EXISTENTES - FUERA DEL FORMULARIO -->
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