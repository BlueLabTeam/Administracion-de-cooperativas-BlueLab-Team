<?php



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
	<title data-i18n="dashboardUser.title">Gestcoop — Panel de Usuario</title>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <link rel="stylesheet" href="/assets/css/dashboardVariables.css" />
	
	<link rel="stylesheet" href="/assets/css/dashboardBase.css" />
	<link rel="stylesheet" href="/assets/css/dashboardHeader.css" />
	<link rel="stylesheet" href="/assets/css/justificacion.css" />
	<link rel="stylesheet" href="/assets/css/dashboardTareas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardHoras.css" />
	<link rel="stylesheet" href="/assets/css/dashboardDeudaHoras.css" />
	<link rel="stylesheet" href="/assets/css/i18n.css" />
	<link rel="stylesheet" href="/assets/css/dashboardDeudaTotal.css" />
	<link rel="stylesheet" href="/assets/css/dashboardUtils.css" />
	<link rel="stylesheet" href="/assets/css/dashboardViviendas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardCuotas.css" />
	<link rel="stylesheet" href="/assets/css/dashboardPagos.css" />
	<link rel="stylesheet" href="/assets/css/dashboardSolicitudes.css" />
	
	 <script src="/assets/js/translationsdashboard.js"></script>
    <script src="/assets/js/i18n.js"></script>

</head>

<body>
	<?php include __DIR__ . '/includes/dashboardHeaderUsuario.html'; ?>

	<main class="content-area">
		<!-- INICIO -->
		<section id="inicio-section" class="section-content active">
			<h2 class="section-title" data-i18n="dashboardUser.home.title"> Inicio</h2>
			
			<div class="info-card">
				<h3><span data-i18n="dashboardUser.home.welcome">Bienvenido/a</span> <?php echo htmlspecialchars($_SESSION['nombre_completo'] ?? 'Usuario'); ?></h3>
				<p data-i18n="dashboardUser.home.description">Este es tu panel de usuario de la Cooperativa de Viviendas.</p>
			</div>

			<!-- Notificaciones -->
			<div class="notifications-container">
				<div class="notifications-header">
					<h3 data-i18n="dashboardUser.home.notifications"> Notificaciones</h3>
					<span class="notifications-badge" id="notificationsBadge" data-i18n="dashboardUser.home.notificationsBadge">0</span>
				</div>
				<div id="notificationsList" class="notifications-list">
					<div class="loading" data-i18n="dashboardUser.home.loadingNotifications">Cargando notificaciones...</div>
				</div>
			</div>

			
		</section>

		<!-- MI PERFIL -->
<section id="perfil-section" class="section-content">
	<h2 class="section-title" data-i18n="dashboardUser.profile.title"> Mi Perfil</h2>
	
	<div class="info-card">
		<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
			<h3 data-i18n="dashboardUser.profile.personalInfo">Información Personal</h3>
			<button class="btn btn-primary" onclick="toggleEditProfile()">
				<i class="fas fa-edit"></i> <span id="btn-edit-text" data-i18n="dashboardUser.profile.editProfile">Editar Perfil</span>
			</button>
		</div>

		<!-- Vista de solo lectura -->
<div id="profile-view">
    <div style="overflow-x: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 92, 185, 0.12);">
        <table style="width: 100%; border-collapse: collapse; background: #FFFFFF;">
            <thead>
                <tr style="background: linear-gradient(135deg, #005CB9 0%, #004494 100%); color: #FFFFFF;">
                    <th style="padding: 15px 20px; text-align: left; font-weight: 600; font-size: 14px; width: 30%;" data-i18n="dashboardUser.profile.table.field">
                        Campo
                    </th>
                    <th style="padding: 15px 20px; text-align: left; font-weight: 600; font-size: 14px; width: 70%;" data-i18n="dashboardUser.profile.table.information">
                        Información
                    </th>
                </tr>
            </thead>
            <tbody>
                <!-- Nombre Completo -->
                <tr style="border-bottom: 1px solid #E8EBF0; transition: all 0.2s ease;" 
                    onmouseover="this.style.background='#F5F7FA'" 
                    onmouseout="this.style.background='#FFFFFF'">
                    <td style="padding: 16px 20px; font-weight: 600; color: #495057; font-size: 13px;">
                        <i class="fas fa-user" style="color: #005CB9; margin-right: 8px;"></i>
                        <span data-i18n="dashboardUser.profile.fullName">Nombre Completo</span>
                    </td>
                    <td style="padding: 16px 20px; color: #495057; font-size: 14px;" id="display-nombre">
                        <?php echo htmlspecialchars($_SESSION['nombre_completo'] ?? 'Usuario'); ?>
                    </td>
                </tr>

                <!-- Email -->
                <tr style="border-bottom: 1px solid #E8EBF0; transition: all 0.2s ease;" 
                    onmouseover="this.style.background='#F5F7FA'" 
                    onmouseout="this.style.background='#FFFFFF'">
                    <td style="padding: 16px 20px; font-weight: 600; color: #495057; font-size: 13px;">
                        <i class="fas fa-envelope" style="color: #005CB9; margin-right: 8px;"></i>
                        <span data-i18n="dashboardUser.profile.email">Email</span>
                    </td>
                    <td style="padding: 16px 20px; color: #495057; font-size: 14px;" id="display-email">
                        <?php echo htmlspecialchars($_SESSION['email'] ?? 'No disponible'); ?>
                    </td>
                </tr>

                <!-- Dirección -->
                <tr style="border-bottom: 1px solid #E8EBF0; transition: all 0.2s ease;" 
                    onmouseover="this.style.background='#F5F7FA'" 
                    onmouseout="this.style.background='#FFFFFF'">
                    <td style="padding: 16px 20px; font-weight: 600; color: #495057; font-size: 13px;">
                        <i class="fas fa-map-marker-alt" style="color: #005CB9; margin-right: 8px;"></i>
                        <span data-i18n="dashboardUser.profile.address">Dirección</span>
                    </td>
                    <td style="padding: 16px 20px; color: #495057; font-size: 14px;" id="display-direccion">
                        <?php echo htmlspecialchars($_SESSION['direccion'] ?? 'No especificada'); ?>
                    </td>
                </tr>

                <!-- Fecha de Nacimiento -->
                <tr style="border-bottom: 1px solid #E8EBF0; transition: all 0.2s ease;" 
                    onmouseover="this.style.background='#F5F7FA'" 
                    onmouseout="this.style.background='#FFFFFF'">
                    <td style="padding: 16px 20px; font-weight: 600; color: #495057; font-size: 13px;">
                        <i class="fas fa-birthday-cake" style="color: #005CB9; margin-right: 8px;"></i>
                        <span data-i18n="dashboardUser.profile.birthDate">Fecha de Nacimiento</span>
                    </td>
                    <td style="padding: 16px 20px; color: #495057; font-size: 14px;" id="display-fecha-nacimiento">
                        <?php echo htmlspecialchars($_SESSION['fecha_nacimiento'] ?? 'No disponible'); ?>
                    </td>
                </tr>

                <!-- Estado -->
                <tr style="border-bottom: 1px solid #E8EBF0; transition: all 0.2s ease;" 
                    onmouseover="this.style.background='#F5F7FA'" 
                    onmouseout="this.style.background='#FFFFFF'">
                    <td style="padding: 16px 20px; font-weight: 600; color: #495057; font-size: 13px;">
                        <i class="fas fa-info-circle" style="color: #005CB9; margin-right: 8px;"></i>
                        <span data-i18n="dashboardUser.profile.status">Estado</span>
                    </td>
                    <td style="padding: 16px 20px;">
                        <?php 
                        $estado = $_SESSION['estado'] ?? 'pendiente';
                        $estadoColor = '';
                        $estadoText = ucfirst($estado);
                        
                        if ($estado === 'aprobado' || $estado === 'activo') {
                            $estadoColor = '#4CAF50';
                        } else if ($estado === 'pendiente' || $estado === 'enviado') {
                            $estadoColor = '#FF9800';
                        } else if ($estado === 'rechazado') {
                            $estadoColor = '#F44336';
                        } else {
                            $estadoColor = '#6C757D';
                        }
                        ?>
                        <span style="
                            display: inline-block;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 11px;
                            font-weight: 600;
                            text-transform: uppercase;
                            background: <?php echo $estadoColor; ?>;
                            color: #FFFFFF;
                        "><?php echo htmlspecialchars($estadoText); ?></span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

		<!-- Formulario de edición -->
<div id="profile-edit" style="display: none;">
	<form id="editProfileForm" onsubmit="submitProfileEdit(event)">
		<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; position: relative;">
			<!-- Línea divisoria vertical -->
			<div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, transparent, #005CB9 10%, #005CB9 90%, transparent); transform: translateX(-50%);"></div>
			
			<!-- COLUMNA IZQUIERDA: Datos personales -->
			<div style="padding-right: 15px;">
				<div class="form-group">
					<label for="edit-nombre" data-i18n="dashboardUser.profile.fullName">
						Nombre Completo *
					</label>
					<input type="text" id="edit-nombre" required>
				</div>

				<div class="form-group">
					<label for="edit-cedula" data-i18n="dashboardUser.profile.idCard">
						Cédula *
					</label>
					<input type="text" id="edit-cedula" required readonly data-i18n-title="dashboardUser.profile.idCardReadonly">
				</div>

				<div class="form-group">
					<label for="edit-email" data-i18n="dashboardUser.profile.email">
						Email *
					</label>
					<input type="email" id="edit-email" required autocomplete="username">
				</div>

				<div class="form-group">
					<label for="edit-fecha-nacimiento" data-i18n="dashboardUser.profile.birthDate">
						Fecha de Nacimiento
					</label>
					<input type="date" id="edit-fecha-nacimiento">
				</div>

				<div class="form-group">
					<label for="edit-direccion" data-i18n="dashboardUser.profile.address">
						Dirección
					</label>
					<input type="text" id="edit-direccion">
				</div>

				<div class="form-group">
					<label for="edit-telefono" data-i18n="dashboardUser.profile.phone">
						Teléfono
					</label>
					<input type="tel" id="edit-telefono" placeholder="Ej: 099123456">
				</div>
			</div>

			<!-- COLUMNA DERECHA: Contraseñas -->
			<div style="padding-left: 15px;">
				<h4 style="margin-bottom: 15px; margin-top: 0;" data-i18n="dashboardUser.profile.changePassword">Cambiar Contraseña (Opcional)</h4>
				
				<div class="form-group">
					<label for="edit-password-actual" data-i18n="dashboardUser.profile.currentPassword">
						Contraseña Actual
					</label>
					<input type="password" id="edit-password-actual" data-i18n-placeholder="dashboardUser.profile.currentPasswordPlaceholder" autocomplete="current-password">
				</div>

				<div class="form-group">
					<label for="edit-password-nueva" data-i18n="dashboardUser.profile.newPassword">
						Nueva Contraseña
					</label>
					<input type="password" id="edit-password-nueva" minlength="6" autocomplete="new-password">
				</div>

				<div class="form-group">
					<label for="edit-password-confirmar" data-i18n="dashboardUser.profile.confirmPassword">
						Confirmar Nueva Contraseña
					</label>
					<input type="password" id="edit-password-confirmar" minlength="6" autocomplete="new-password">
				</div>

				<div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #005CB9;">
					<small style="color: #004494; display: block; line-height: 1.5;">
						<i class="fas fa-info-circle"></i> 
						<strong>Nota:</strong> Solo completa estos campos si deseas cambiar tu contraseña. Si los dejas vacíos, tu contraseña actual se mantendrá.
					</small>
				</div>
			</div>
		</div>

		<div class="form-actions" style="margin-top: 30px;">
			<button type="button" class="btn btn-secondary" onclick="toggleEditProfile()">
				<i class="fas fa-times"></i> <span data-i18n="dashboardUser.profile.cancelEdit">Cancelar</span>
			</button>
			<button type="submit" class="btn btn-primary">
				<i class="fas fa-save"></i> <span data-i18n="dashboardUser.profile.saveChanges">Guardar Cambios</span>
			</button>
		</div>
	</form>
</div>
	</div>
</section>

		<!-- SOLICITUDES -->
<section id="solicitudes-section" class="section-content">
    <h2 class="section-title" data-i18n="dashboardUser.requests.title"> Mis Solicitudes</h2>

    <!-- Botón Nueva Solicitud -->
    <div class="info-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h3 data-i18n="dashboardUser.requests.manage">Gestiona tus Solicitudes</h3>
                <p data-i18n="dashboardUser.requests.description">Envía consultas, justificaciones o reporta problemas al administrador</p>
            </div>
            <button class="btn btn-primary" onclick="abrirModalNuevaSolicitud()">
                <i class="fas fa-plus"></i> <span data-i18n="dashboardUser.requests.newRequest">Nueva Solicitud</span>
            </button>
        </div>
    </div>


    <!-- Filtros -->
    <div class="filters-container">
        <div class="filter-group">
            <label for="filtro-estado-solicitudes">
                <i class="fas fa-filter"></i> <span data-i18n="dashboardUser.requests.filters.status">Estado:</span>
            </label>
            <select id="filtro-estado-solicitudes" onchange="loadMisSolicitudes()">
                <option value="" data-i18n="dashboardUser.requests.filters.allStates">Todos los estados</option>
                <option value="pendiente" data-i18n="dashboardUser.requests.filters.pending">Pendiente</option>
                <option value="en_revision" data-i18n="dashboardUser.requests.filters.inReview">En Revisión</option>
                <option value="resuelta" data-i18n="dashboardUser.requests.filters.resolved">Resuelta</option>
                <option value="rechazada" data-i18n="dashboardUser.requests.filters.rejected">Rechazada</option>
            </select>
        </div>

        <div class="filter-group">
            <label for="filtro-tipo-solicitudes">
                <i class="fas fa-tag"></i> <span data-i18n="dashboardUser.requests.filters.type">Tipo:</span>
            </label>
            <select id="filtro-tipo-solicitudes" onchange="loadMisSolicitudes()">
                <option value="" data-i18n="dashboardUser.requests.filters.allTypes">Todos los tipos</option>
                <option value="horas" data-i18n="dashboardUser.requests.types.hours">Registro de Horas</option>
                <option value="pago" data-i18n="dashboardUser.requests.types.payment">Pagos/Cuotas</option>
                <option value="vivienda" data-i18n="dashboardUser.requests.types.housing">Vivienda</option>
                <option value="general" data-i18n="dashboardUser.requests.types.general">Consulta General</option>
                <option value="otro" data-i18n="dashboardUser.requests.types.other">Otro</option>
            </select>
        </div>
    </div>

    <!-- Lista de Solicitudes -->
    <div id="misSolicitudesContainer" class="solicitudes-container">
        <p class="loading" data-i18n="dashboardUser.requests.loading">Cargando solicitudes...</p>
    </div>
</section>

		<!-- MI VIVIENDA -->
		<section id="vivienda-section" class="section-content">
			<h2 class="section-title" data-i18n="dashboardUser.housing.title"> Mi Vivienda</h2>
			<div class="info-card">
				<h3 data-i18n="dashboardUser.housing.subtitle">Información de tu Vivienda</h3>
				<div id="myViviendaContainer">
					<p class="loading" data-i18n="dashboardUser.housing.loading">Cargando...</p>
				</div>
			</div>
		</section>

	<!-- APORTES / CUOTAS -->
<section id="cuotas-section" class="section-content">
    <h2 class="section-title" data-i18n="dashboardUser.billing.title"> Mis Cuotas Mensuales</h2>
    
    

   <!-- Estadísticas Rápidas -->
<div class="stats-grid-wide">
    <div class="stat-card pendiente">
        <div class="stat-icon">
            <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
            <span class="stat-label" data-i18n="dashboardUser.billing.stats.pending">Pendientes</span>
            <span class="stat-value" id="admin-cuotas-pendientes">0</span>
        </div>
    </div>

    <div class="stat-card success">
        <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
            <span class="stat-label" data-i18n="dashboardUser.billing.stats.paid">Pagadas</span>
            <span class="stat-value" id="cuotas-pagadas-count">0</span>
        </div>
    </div>

    <div class="stat-card error">
        <div class="stat-icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-info">
            <span class="stat-label" data-i18n="dashboardUser.billing.stats.overdue">Vencidas</span>
            <span class="stat-value" id="cuotas-vencidas-count">0</span>
        </div>
    </div>
</div>

    <!-- Filtros -->
    <div class="filters-container">
        <div class="filter-group">
            <label for="filtro-mes-cuotas">
                <i class="fas fa-calendar"></i> <span data-i18n="dashboardUser.billing.filters.month">Mes:</span>
            </label>
            <select id="filtro-mes-cuotas" onchange="loadMisCuotas()">
                <option value="" data-i18n="dashboardUser.billing.filters.allMonths">Todos los meses</option>
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
        </div>

        <div class="filter-group">
            <label for="filtro-anio-cuotas">
                <i class="fas fa-calendar-alt"></i> <span data-i18n="dashboardUser.billing.filters.year">Año:</span>
            </label>
            <select id="filtro-anio-cuotas" onchange="loadMisCuotas()">
                <option value="" data-i18n="dashboardUser.billing.filters.allYears">Todos los años</option>
            </select>
        </div>

        <div class="filter-group">
            <label for="filtro-estado-cuotas">
                <i class="fas fa-filter"></i> <span data-i18n="dashboardUser.billing.filters.status">Estado:</span>
            </label>
            <select id="filtro-estado-cuotas" onchange="loadMisCuotas()">
                <option value="" data-i18n="dashboardUser.billing.filters.allStates">Todos los estados</option>
                <option value="pendiente" data-i18n="dashboardUser.billing.filters.pending">Pendiente</option>
                <option value="pagada" data-i18n="dashboardUser.billing.filters.paid">Pagada</option>
                <option value="vencida" data-i18n="dashboardUser.billing.filters.overdue">Vencida</option>
            </select>
        </div>
    </div>

    <!-- Lista de Cuotas -->
    <div id="misCuotasContainer" class="cuotas-container">
        <p class="loading" data-i18n="dashboardUser.billing.loading">Cargando cuotas...</p>
    </div>
</section>

<!-- MODAL: PAGAR CUOTA -->
<div id="pagarCuotaModal" class="modal-overlay" style="display: none;">
    <div class="material-modal-content">
        <button class="modal-close-btn" onclick="closePagarCuotaModal()">×</button>
        
        <h2 class="modal-title">
            <i class="fas fa-credit-card"></i> <span data-i18n="dashboardUser.billing.paymentModal.title">Realizar Pago</span>
        </h2>

        <!-- Formulario de Pago -->
        <form id="pagarCuotaForm" onsubmit="submitPagarCuota(event)" enctype="multipart/form-data">
            <input type="hidden" id="pagar-cuota-id" name="cuota_id">
            <input type="hidden" id="pagar-monto" name="monto_pagado">

            <div class="form-group">
                <label for="pagar-metodo">
                    <i class="fas fa-money-check-alt"></i> <span data-i18n="dashboardUser.billing.paymentModal.paymentMethod">Método de Pago</span> *
                </label>
                <select id="pagar-metodo" name="metodo_pago" required>
                    <option value="transferencia" data-i18n="dashboardUser.billing.paymentModal.methods.transfer">Transferencia Bancaria</option>
                    <option value="deposito" data-i18n="dashboardUser.billing.paymentModal.methods.deposit">Depósito en Efectivo</option>
                    <option value="cheque" data-i18n="dashboardUser.billing.paymentModal.methods.check">Cheque</option>
                    <option value="efectivo" data-i18n="dashboardUser.billing.paymentModal.methods.cash">Efectivo</option>
                </select>
            </div>

            <div class="form-group">
                <label for="pagar-numero-comprobante">
                    <i class="fas fa-hashtag"></i> <span data-i18n="dashboardUser.billing.paymentModal.voucherNumber">Número de Comprobante</span>
                </label>
                <input 
                    type="text" 
                    id="pagar-numero-comprobante" 
                    name="numero_comprobante"
                    data-i18n-placeholder="dashboardUser.billing.paymentModal.voucherNumberPlaceholder"
                    maxlength="50">
                <small class="form-help" data-i18n="dashboardUser.billing.paymentModal.voucherNumberHelp">Opcional: Número de referencia o transacción</small>
            </div>

            <div class="form-group">
                <label for="pagar-comprobante">
                    <i class="fas fa-file-upload"></i> <span data-i18n="dashboardUser.billing.paymentModal.uploadVoucher">Comprobante de Pago</span> *
                </label>
                <input 
                    type="file" 
                    id="pagar-comprobante" 
                    name="comprobante"
                    accept="image/*,.pdf"
                    required>
                <small class="form-help" data-i18n="dashboardUser.billing.paymentModal.uploadHelp">Sube una foto o PDF del comprobante (máx. 5MB)</small>
            </div>

            <div class="alert-warning" style="margin: 20px 0;">
                <strong data-i18n="dashboardUser.billing.paymentModal.importantTitle">⚠️ Importante:</strong>
                <ul style="margin: 10px 0 0 20px; padding-left: 0;">
                    <li data-i18n="dashboardUser.billing.paymentModal.important1">Asegúrate de que el comprobante sea legible</li>
                    <li data-i18n="dashboardUser.billing.paymentModal.important2">El pago será revisado por un administrador</li>
                    <li data-i18n="dashboardUser.billing.paymentModal.important3">Recibirás una notificación cuando sea validado</li>
                </ul>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closePagarCuotaModal()">
                    <i class="fas fa-times"></i> <span data-i18n="dashboardUser.billing.paymentModal.cancel">Cancelar</span>
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-paper-plane"></i> <span data-i18n="dashboardUser.billing.paymentModal.submit">Enviar Pago</span>
                </button>
            </div>
        </form>
    </div>
</div>


		<!-- HORAS -->
<section id="horas-section" class="section-content">
	<h2 class="section-title" data-i18n="dashboardUser.hours.title"> Registro de Horas</h2>
	
	<!-- Botones de Entrada/Salida -->
	<div class="info-card">
		<div class="clock-controls">
			<div class="current-time">
				<i class="fas fa-clock"></i>
				<span id="current-time-display">--:--:--</span>
			</div>
			
			<div id="clock-buttons" class="clock-buttons">
				<button class="btn btn-primary btn-clock" id="btn-entrada" onclick="marcarEntrada()">
					<i class="fas fa-sign-in-alt"></i> <span data-i18n="dashboardUser.hours.clockIn">Marcar Entrada</span>
				</button>
				<button class="btn btn-danger btn-clock" id="btn-salida" onclick="marcarSalida()" style="display: none;">
					<i class="fas fa-sign-out-alt"></i> <span data-i18n="dashboardUser.hours.clockOut">Marcar Salida</span>
				</button>
			</div>
			
			<div id="registro-activo-info" style="display: none; margin-top: 15px; padding: 15px; background: #e3f2fd; border-radius: 8px; text-align: center;">
				<p style="margin: 0; font-weight: bold; color: #1976d2;">
					<i class="fas fa-briefcase"></i> <span data-i18n="dashboardUser.hours.activeSession">Jornada en curso</span>
				</p>
				<p style="margin: 5px 0 0 0; color: #666;">
					<span data-i18n="dashboardUser.hours.entryTime">Entrada:</span> <strong id="hora-entrada-activa">--:--</strong>
				</p>
			</div>
		</div>
	</div>

	<!-- Estadísticas Rápidas -->
<div class="stats-grid-wide">
    <div class="stat-card">
        <div class="stat-icon">
            <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
            <span class="stat-label" data-i18n="dashboardUser.hours.stats.weekHours">Horas esta Semana</span>
            <span class="stat-value" id="horas-semana">0h</span>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="stat-icon">
            <i class="fas fa-calendar-week"></i>
        </div>
        <div class="stat-info">
            <span class="stat-label" data-i18n="dashboardUser.hours.stats.daysWorked">Días Trabajados</span>
            <span class="stat-value" id="dias-semana">0</span>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="stat-icon">
            <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-info">
            <span class="stat-label" data-i18n="dashboardUser.hours.stats.monthHours">Horas Este Mes</span>
            <span class="stat-value" id="horas-mes">0h</span>
        </div>
    </div>
</div>

	<!-- Resumen Semanal -->
	<div class="info-card">
		<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
			<h3><i class="fas fa-calendar-week"></i> <span data-i18n="dashboardUser.hours.weeklySummary.title">Resumen de la Semana</span></h3>
			<button class="btn btn-secondary" onclick="loadResumenSemanal()">
				<i class="fas fa-sync-alt"></i> <span data-i18n="dashboardUser.hours.weeklySummary.refresh">Actualizar</span>
			</button>
		</div>
		
		<div id="resumen-semanal-container">
			<p class="loading" data-i18n="dashboardUser.hours.weeklySummary.loading">Cargando resumen...</p>
		</div>
	</div>

<!-- DEUDA DE HORAS - WIDGET PRINCIPAL -->
<div class="info-card">
    <h3 data-i18n="dashboardUser.billing.debtStatus.title"> Estado de Deuda de Horas</h3>
    <div id="deuda-actual-container">
        <p class="loading" data-i18n="dashboardUser.billing.debtStatus.calculating">Calculando deuda...</p>
    </div>
</div>

	<!-- Historial de Registros -->
	<div class="info-card">
		<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
			<h3><i class="fas fa-history"></i> <span data-i18n="dashboardUser.hours.history.title">Historial de Registros</span></h3>
			<div style="display: flex; gap: 10px;">
				<input type="date" id="filtro-fecha-inicio" class="date-input">
				<input type="date" id="filtro-fecha-fin" class="date-input">
				<button class="btn btn-secondary" onclick="filtrarRegistros()">
					<i class="fas fa-filter"></i> <span data-i18n="dashboardUser.hours.history.filter">Filtrar</span>
				</button>
			</div>
		</div>
		
		<div id="historial-registros-container">
			<p class="loading" data-i18n="dashboardUser.hours.history.loading">Cargando registros...</p>
		</div>
	</div>
</section>

		<!-- TAREAS -->
		<section id="tareas-section" class="section-content">
			<h2 class="section-title" data-i18n="dashboardUser.tasks.title"> Mis Tareas</h2>
			
		<!-- Resumen de Tareas -->
<div class="stats-grid-wide" style="margin-bottom: 20px;">
    <div class="stat-card pendiente">
        <div class="stat-icon">
            <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
            <span class="stat-label" data-i18n="dashboardUser.tasks.stats.pending">Pendientes</span>
            <span class="stat-value" id="pending-count">0</span>
        </div>
    </div>
    
    <div class="stat-card warning">
        <div class="stat-icon">
            <i class="fas fa-spinner"></i>
        </div>
        <div class="stat-info">
            <span class="stat-label" data-i18n="dashboardUser.tasks.stats.inProgress">En Progreso</span>
            <span class="stat-value" id="progress-count">0</span>
        </div>
    </div>
    
    <div class="stat-card success">
        <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
            <span class="stat-label" data-i18n="dashboardUser.tasks.stats.completed">Completadas</span>
            <span class="stat-value" id="completed-count">0</span>
        </div>
    </div>
</div>
			
			<!-- Tareas personales -->
			<div class="info-card">
				<h3 data-i18n="dashboardUser.tasks.individual"> Tareas Individuales</h3>
				<div id="tareasUsuarioList">
					<p class="loading" data-i18n="dashboardUser.tasks.loading">Cargando tareas...</p>
				</div>
			</div>

			<!-- Tareas del núcleo familiar -->
			<div class="info-card">
				<h3 data-i18n="dashboardUser.tasks.family"> Tareas del Núcleo Familiar</h3>
				<div id="tareasNucleoList">
					<p class="loading" data-i18n="dashboardUser.tasks.loading">Cargando tareas...</p>
				</div>
			</div>
		</section>

		<!-- DOCUMENTOS -->
		<section id="documentos-section" class="section-content">
			<h2 class="section-title" data-i18n="dashboardUser.documents.title">📄 Mis Documentos</h2>
			<div class="info-card">
				<h3 data-i18n="dashboardUser.documents.subtitle">Documentación</h3>
				<p data-i18n="dashboardUser.documents.description">Accede a todos tus documentos relacionados con la cooperativa.</p>
			</div>
			<div class="stats-grid">
				<div class="stat-card">
					<i class="fas fa-file-alt"></i>
					<h4 data-i18n="dashboardUser.documents.stats.documents">Documentos</h4>
					<p>0</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-file-contract"></i>
					<h4 data-i18n="dashboardUser.documents.stats.contracts">Contratos</h4>
					<p>0</p>
				</div>
				<div class="stat-card">
					<i class="fas fa-file-invoice"></i>
					<h4 data-i18n="dashboardUser.documents.stats.invoices">Facturas</h4>
					<p>0</p>
				</div>
			</div>
		</section>
	</main>


	<script src="/assets/js/user/navigationUsuario.js"></script>
    <script src="/assets/js/user/inicioUsuarios.js"></script>
    <script src="/assets/js/user/miPerfil.js"></script>
    <script src="/assets/js/user/miVivienda.js"></script>
    <script src="/assets/js/user/misCuotas.js"></script>
    <script src="/assets/js/user/registroHoras.js"></script>
    <script src="/assets/js/user/misTareas.js"></script>
    <script src="/assets/js/user/misSolicitudes.js"></script>

   
	
</body>
</html>