<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago pendiente</title>
</head>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gestcoop – Panel de Usuario</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/assets/css/dashboardBase.css" />
    <link rel="stylesheet" href="/assets/css/dashboardHeader.css" />
    <link rel="stylesheet" href="/assets/css/dashboardNotificaciones.css" />
    <link rel="stylesheet" href="/assets/css/dashboardTareas.css" />
    <link rel="stylesheet" href="/assets/css/dashboardUtils.css" />
    <link rel="stylesheet" href="/assets/css/salaEspera.css" />
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
                <p><strong>Nombre:</strong> <?php echo htmlspecialchars($_SESSION['nombre_completo'] ?? 'Usuario'); ?>
                </p>
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

            <div class="tasks-summary">
                <div class="summary-card">
                    <div class="summary-icon">📋</div>
                    <div class="summary-content">
                        <h4>Tareas Pendientes</h4>
                        <p id="pending-count">0</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">⏳</div>
                    <div class="summary-content">
                        <h4>En Progreso</h4>
                        <p id="progress-count">0</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">✔️</div>
                    <div class="summary-content">
                        <h4>Completadas</h4>
                        <p id="completed-count">0</p>
                    </div>
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
                <h3>📌 Tareas Individuales</h3>
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
</body>
<div id="bloqueoPago" class="bloqueo-overlay">
    <div class="bloqueo-popup">
        <i class="fas fa-ban icono-alerta"></i>
        <h2>Pago pendiente de aprobación</h2>
        <p>Aún falta un último paso.</p>
        <p>Recibirás un correo electrónico cuando su cuenta sea aprobada</p>
        <p><strong>Si tiene alguna pregunta, no dude en contactar a traves de un mensaje <a
                    href="mailto:gestcoop@gmail.com">gestcoop@gmail.com</a></strong></p>
        <button class="btn-cerrar-sesion" onclick="window.location.href='/api/logout'">
            Cerrar sesión
        </button>
    </div>
</div>

</html>