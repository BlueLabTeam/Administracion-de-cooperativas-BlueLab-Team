// 🧪 MODO TEST: Simular último día de DICIEMBRE
(function () {
    const TEST_MODE = true; // Cambiar a false para volver a normal

    if (TEST_MODE) {
        // Sobrescribir Date para simular el 31 de diciembre
        const fechaOriginal = Date;
        // 🚨 CAMBIO: 11 es el índice de Diciembre, y 31 es el último día.
        const ultimoDiaDiciembre = new Date(new Date().getFullYear(), 11, 31);

        window.Date = function (...args) {
            if (args.length === 0) {
                return ultimoDiaDiciembre; // Devolvemos la fecha simulada
            }
            return new fechaOriginal(...args);
        };

        // Copiar métodos estáticos
        Object.setPrototypeOf(window.Date, fechaOriginal);
        window.Date.prototype = fechaOriginal.prototype;

        console.log('🧪 TEST MODE: Fecha simulada =', ultimoDiaDiciembre.toLocaleDateString());
    }
})();


document.addEventListener('DOMContentLoaded', function () {
    const menuItems = document.querySelectorAll('.menu li');

    document.addEventListener('DOMContentLoaded', function () {
        ('🔧 Inicializando listeners de solicitudes');

        // Listener para la sección de solicitudes
        const solicitudesMenuItem = document.querySelector('.menu li[data-section="solicitudes"]');

        if (solicitudesMenuItem) {
            (' Menu item de solicitudes encontrado');

            solicitudesMenuItem.addEventListener('click', function () {
                ('🎯 CLICK EN SOLICITUDES DETECTADO');

                // Esperar un momento para que la sección se active
                setTimeout(() => {
                    ('⏰ Ejecutando loadMisSolicitudes()');
                    loadMisSolicitudes();
                }, 100);
            });
        } else {
            console.error('❌ No se encontró el menu item de solicitudes');
        }
    });


    // ========== CARGAR MIS SOLICITUDES==========
    async function loadMisSolicitudes() {
        ('==========================================');
        ('📋 INICIANDO CARGA DE SOLICITUDES');
        ('==========================================');

        const container = document.getElementById('misSolicitudesContainer');

        if (!container) {
            console.error('❌ Container "misSolicitudesContainer" NO ENCONTRADO');
            ('Elementos disponibles con "solicitudes":',
                document.querySelectorAll('[id*="solicitud"]'));
            return;
        }

        (' Container encontrado:', container);
        container.innerHTML = '<p class="loading">Cargando solicitudes...</p>';

        try {
            const estado = document.getElementById('filtro-estado-solicitudes')?.value || '';
            const tipo = document.getElementById('filtro-tipo-solicitudes')?.value || '';

            let url = '/api/solicitudes/mis-solicitudes?';
            if (estado) url += `estado=${estado}&`;
            if (tipo) url += `tipo=${tipo}&`;

            ('🔗 URL de petición:', url);
            ('📤 Iniciando fetch...');

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            });

            ('📡 Response status:', response.status);
            ('📡 Response headers:', [...response.headers.entries()]);

            // Leer como texto primero para debug
            const responseText = await response.text();
            ('📥 Response text (primeros 500 chars):', responseText.substring(0, 500));

            // Intentar parsear
            let data;
            try {
                data = JSON.parse(responseText);
                (' JSON parseado correctamente');
            } catch (parseError) {
                console.error('❌ Error al parsear JSON:', parseError);
                console.error('📄 Respuesta completa:', responseText);
                container.innerHTML = `
                <div class="error">
                    <h3>❌ Error de Servidor</h3>
                    <p>El servidor devolvió HTML en lugar de JSON</p>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; max-height: 300px;">${responseText.substring(0, 1000)}</pre>
                    <button class="btn btn-primary" onclick="loadMisSolicitudes()">
                        <i class="fas fa-sync"></i> Reintentar
                    </button>
                </div>
            `;
                return;
            }

            ('📊 Data recibida:', data);
            ('   - success:', data.success);
            ('   - count:', data.count);
            ('   - solicitudes length:', data.solicitudes?.length);

            if (data.success) {
                (' Petición exitosa, renderizando...');

                if (data.solicitudes && data.solicitudes.length > 0) {
                    ('📋 Primera solicitud:', data.solicitudes[0]);
                }

                renderMisSolicitudes(data.solicitudes);
                updateSolicitudesStats(data.solicitudes);

                (' Renderizado completado');
            } else {
                console.error('❌ success = false');
                container.innerHTML = `
                <div class="error">
                    <h3>❌ Error</h3>
                    <p>${data.message || 'Error desconocido'}</p>
                    <button class="btn btn-primary" onclick="loadMisSolicitudes()">
                        <i class="fas fa-sync"></i> Reintentar
                    </button>
                </div>
            `;
            }

        } catch (error) {
            console.error('==========================================');
            console.error('❌ ERROR CAPTURADO:');
            console.error('   - Mensaje:', error.message);
            console.error('   - Stack:', error.stack);
            console.error('==========================================');

            container.innerHTML = `
            <div class="error">
                <h3>❌ Error de Conexión</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadMisSolicitudes()">
                    <i class="fas fa-sync"></i> Reintentar
                </button>
            </div>
        `;
        }

        ('==========================================');
        ('📋 FIN CARGA DE SOLICITUDES');
        ('==========================================');
    }

    // Exportar para uso global
    window.loadMisSolicitudes = loadMisSolicitudes;

    (' Fix de solicitudes cargado');

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            menuItems.forEach(mi => mi.classList.remove('activo'));
            this.classList.add('activo');
            const sectionId = this.getAttribute('data-section') + '-section';

            document.querySelectorAll('.section-content').forEach(s => {
                s.classList.remove('active');
            });

            const targetSection = document.getElementById(sectionId);
            if (targetSection) targetSection.classList.add('active');
        });
    });

    // Cargar notificaciones
    loadNotifications();
    setInterval(loadNotifications, 120000);

    // Listener para Mi Vivienda
    const viviendaMenuItem = document.querySelector('.menu li[data-section="vivienda"]');
    if (viviendaMenuItem) {
        viviendaMenuItem.addEventListener('click', function () {
            loadMyVivienda();
        });
    }

    // Listener para sección de horas
    const horasMenuItem = document.querySelector('.menu li[data-section="horas"]');
    if (horasMenuItem) {
        (' Listener de horas agregado');
        horasMenuItem.addEventListener('click', function () {
            ('>>> Click en sección horas');
            inicializarSeccionHoras();
        });
    }

    // Listener para Tareas - SOLO cuando se hace click
    const tareasMenuItem = document.querySelector('.menu li[data-section="tareas"]');
    if (tareasMenuItem) {
        tareasMenuItem.addEventListener('click', function () {
            // Solo cargar si aún no se han cargado
            const tareasUsuarioList = document.getElementById('tareasUsuarioList');
            if (tareasUsuarioList && tareasUsuarioList.innerHTML.includes('loading')) {
                loadUserTasks();
            }
        });
    }
});




// ========== NOTIFICACIONES ==========

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
            '<div class="no-notifications" data-i18n="dashboardUser.notifications.errorNotifications">No se pudieron cargar las notificaciones</div>';
        i18n.translatePage();
    }
}

function renderNotifications(notifications, unreadCount) {
    const badge = document.getElementById('notificationsBadge');
    const list = document.getElementById('notificationsList');

    badge.textContent = unreadCount;
    badge.className = 'notifications-badge' + (unreadCount === 0 ? ' zero' : '');

    if (notifications.length === 0) {
        list.innerHTML = '<div class="no-notifications" data-i18n="dashboardUser.home.notificationsContent.noNotifications">No tienes notificaciones</div>';
        i18n.translatePage();
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
                    <span class="notification-date">${fechaFormateada}</span>1049906394
                </div>
                <div class="notification-message">${notif.mensaje}</div>
            </div>
        `;
    }).join('');
    i18n.translatePage();
}

function getTipoIcon(tipo) {
    const icons = {
        'info': 'ℹ️',
        'importante': '⚠️',
        'urgente': '🚨',
        'exito': ''
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

// ========== TAREAS ==========

async function loadUserTasks() {
    const incluirFinalizadas = document.getElementById('mostrar-completadas')?.checked || false;

    try {
        const url = `/api/tasks/user?incluir_finalizadas=${incluirFinalizadas}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            renderUserTasks(data.tareas_usuario, 'tareasUsuarioList');
            renderUserTasks(data.tareas_nucleo, 'tareasNucleoList', true);
            updateTasksSummary(data.tareas_usuario, data.tareas_nucleo);
        } else {
            console.error('Error al cargar tareas:', data.message || data);
            document.getElementById('tareasUsuarioList').innerHTML =
                '<div class="no-tasks">Error al cargar tareas</div>';
            document.getElementById('tareasNucleoList').innerHTML =
                '<div class="no-tasks">Error al cargar tareas</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('tareasUsuarioList').innerHTML =
            '<div class="no-tasks">Error de conexión al cargar tareas</div>';
        document.getElementById('tareasNucleoList').innerHTML =
            '<div class="no-tasks">Error de conexión al cargar tareas</div>';
    }
}



function renderUserTasks(tareas, containerId, esNucleo = false) {
    ('🎨 [RENDER USER TASKS] Iniciando con detección de vencidas');

    const container = document.getElementById(containerId);

    if (!tareas || tareas.length === 0) {
        container.innerHTML = '<div class="no-tasks">No tienes tareas asignadas</div>';
        return;
    }

    //  PASO 1: Detectar tareas vencidas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const tareasConEstado = tareas.map(tarea => {
        const fechaFinObj = new Date(tarea.fecha_fin + 'T00:00:00');
        const esCompletada = tarea.estado_usuario === 'completada';
        const esVencida = !esCompletada && fechaFinObj < hoy;

        if (esVencida) {
            (`🔴 TAREA VENCIDA (Usuario): ${tarea.titulo} - Fin: ${tarea.fecha_fin}`);
        }

        return {
            ...tarea,
            esVencida,
            esCompletada
        };
    });

    //  PASO 2: Renderizar
    container.innerHTML = tareasConEstado.map(tarea => {
        const fechaInicio = formatearFechaUY(tarea.fecha_inicio);
        const fechaFin = formatearFechaUY(tarea.fecha_fin);
        const progreso = tarea.progreso || 0;

        //  DETERMINAR ESTADO VISUAL
        let estadoTexto, estadoBadgeClass, tareaClass;

        if (tarea.esVencida) {
            estadoTexto = '⏰ Vencida';
            estadoBadgeClass = 'vencida';
            tareaClass = 'tarea-vencida';
            (` Badge VENCIDA aplicado: ${tarea.titulo}`);
        } else if (tarea.esCompletada) {
            estadoTexto = formatEstadoUsuario(tarea.estado_usuario);
            estadoBadgeClass = 'completada';
            tareaClass = 'completada';
        } else {
            estadoTexto = formatEstadoUsuario(tarea.estado_usuario);
            estadoBadgeClass = '';
            tareaClass = '';
        }

        return `
            <div class="user-task-item prioridad-${tarea.prioridad} ${tareaClass}">
                <div class="user-task-header">
                    <h4 class="user-task-title">${tarea.titulo}</h4>
                    <div class="user-task-badges">
                        <span class="task-badge badge-estado ${estadoBadgeClass}">
                            ${estadoTexto}
                        </span>
                        <span class="task-badge badge-prioridad ${tarea.prioridad}">
                            ${formatPrioridad(tarea.prioridad)}
                        </span>
                        ${esNucleo ? '<span class="task-badge" style="background: #6f42c1; color: white;">Núcleo</span>' : ''}
                    </div>
                </div>
                
                <p class="user-task-description">${tarea.descripcion}</p>
                
                <div class="user-task-meta">
                    <div><strong>Inicio:</strong> ${fechaInicio}</div>
                    <div><strong>Fin:</strong> ${fechaFin}</div>
                    <div><strong>Creado por:</strong> ${tarea.creador}</div>
                </div>
                
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progreso}%; background: ${tarea.esVencida ? '#dc3545' : tarea.esCompletada ? '#28a745' : '#667eea'};">
                        ${progreso}%
                    </div>
                </div>
                
                ${tarea.esVencida ? `
                    <div class="alert-warning" style="margin-top: 15px;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Esta tarea está vencida.</strong> La fecha límite ya ha pasado.
                    </div>
                ` : ''}
                
                ${!tarea.esCompletada ? `
                    <div class="user-task-actions">
                        <button class="btn-small btn-update" onclick="updateTaskProgress(${tarea.id_asignacion}, '${esNucleo ? 'nucleo' : 'usuario'}', ${tarea.id_tarea})">
                            Actualizar Progreso
                        </button>
                        <button class="btn-small btn-avance" onclick="addTaskAvance(${tarea.id_tarea})">
                            Reportar Avance
                        </button>
                        <button class="btn-small btn-materiales" onclick="viewTaskMaterials(${tarea.id_tarea})" title="Ver materiales necesarios">
                            <i class="fas fa-boxes"></i> Materiales
                        </button>
                        <button class="btn-small btn-detalles" onclick="viewUserTaskDetails(${tarea.id_tarea})">
                            Ver Detalles Completos
                        </button>
                    </div>
                ` : '<p style="color: #28a745; margin-top: 10px;"><strong>✓ Tarea completada</strong></p>'}
            </div>
        `;
    }).join('');

    (' [RENDER USER TASKS] Completado');
}

function updateTasksSummary(tareasUsuario, tareasNucleo) {
    const todasTareas = [...tareasUsuario, ...tareasNucleo];

    const pendientes = todasTareas.filter(t => t.estado_usuario === 'pendiente').length;
    const enProgreso = todasTareas.filter(t => t.estado_usuario === 'en_progreso').length;
    const completadas = todasTareas.filter(t => t.estado_usuario === 'completada').length;

    // Verificar que los elementos existan antes de actualizarlos
    const pendingEl = document.getElementById('pending-count');
    const progressEl = document.getElementById('progress-count');
    const completedEl = document.getElementById('completed-count');

    if (pendingEl) pendingEl.textContent = pendientes;
    if (progressEl) progressEl.textContent = enProgreso;
    if (completedEl) completedEl.textContent = completadas;
}

function formatEstadoUsuario(estado) {
    const estados = {
        'pendiente': 'Pendiente',
        'en_progreso': 'En Progreso',
        'completada': 'Completada'
    };
    return estados[estado] || estado;
}

function formatPrioridad(prioridad) {
    const prioridades = {
        'baja': 'Baja',
        'media': 'Media',
        'alta': 'Alta'
    };
    return prioridades[prioridad] || prioridad;
}

function updateTaskProgress(asignacionId, tipoAsignacion, tareaId) {
    const progreso = prompt('Ingrese el porcentaje de progreso (0-100):');

    if (progreso === null) return;

    const progresoNum = parseInt(progreso);

    if (isNaN(progresoNum) || progresoNum < 0 || progresoNum > 100) {
        alert('Por favor ingrese un número válido entre 0 y 100');
        return;
    }

    const formData = new FormData();
    formData.append('asignacion_id', asignacionId);
    formData.append('tipo_asignacion', tipoAsignacion);
    formData.append('progreso', progresoNum);

    if (progresoNum === 100) {
        formData.append('estado', 'completada');
    } else if (progresoNum > 0) {
        formData.append('estado', 'en_progreso');
    }

    fetch('/api/tasks/update-progress', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                loadUserTasks();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al actualizar progreso');
        });
}

function addTaskAvance(tareaId) {
    console.log('🚀 addTaskAvance llamado con tareaId:', tareaId);

    // ✅ Validar que tareaId existe
    if (!tareaId || tareaId === 'undefined') {
        alert('❌ Error: ID de tarea inválido');
        console.error('tareaId recibido:', tareaId);
        return;
    }

    const comentario = prompt('Describa el avance realizado:');

    if (!comentario || comentario.trim() === '') {
        alert('Debe ingresar un comentario');
        return;
    }

    const progresoReportado = prompt('¿Qué porcentaje de progreso representa este avance? (0-100):');

    if (progresoReportado === null) return;

    const progresoNum = parseInt(progresoReportado);

    if (isNaN(progresoNum) || progresoNum < 0 || progresoNum > 100) {
        alert('Por favor ingrese un número válido entre 0 y 100');
        return;
    }

    const formData = new FormData();
    // ✅ CAMBIO CRÍTICO: Usar 'id_tarea' en lugar de 'tarea_id'
    formData.append('id_tarea', tareaId);
    formData.append('comentario', comentario.trim());
    formData.append('progreso_reportado', progresoNum);

    // ✅ DEBUG: Ver qué estamos enviando
    console.log('📤 Enviando a /api/tasks/add-avance:');
    console.log('   id_tarea:', tareaId);
    console.log('   comentario:', comentario.trim());
    console.log('   progreso_reportado:', progresoNum);

    fetch('/api/tasks/add-avance', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
        .then(response => {
            console.log('📡 Response status:', response.status);
            return response.text();
        })
        .then(text => {
            console.log('📥 Response raw:', text);

            try {
                const data = JSON.parse(text);

                if (data.success) {
                    alert(data.message);
                    loadUserTasks();
                } else {
                    alert('Error: ' + (data.message || data.error));
                    console.error('Detalles del error:', data);
                }
            } catch (parseError) {
                console.error('❌ Error parsing JSON:', parseError);
                alert('Error del servidor: ' + text);
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            alert('Error al reportar avance');
        });
}

// ========== VER DETALLES CON MATERIALES ==========

async function viewUserTaskDetails(tareaId) {
    try {
        const responseTask = await fetch(`/api/tasks/details?id_tarea=${tareaId}`);
        const dataTask = await responseTask.json();

        const responseMaterials = await fetch(`/api/materiales/task-materials?id_tarea=${tareaId}`);
        const dataMaterials = await responseMaterials.json();

        if (dataTask.success) {
            const materiales = dataMaterials.success ? dataMaterials.materiales : [];
            mostrarDetallesTareaUsuario(dataTask.tarea, dataTask.avances, materiales);
        } else {
            alert('Error al cargar detalles');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

async function viewTaskMaterials(tareaId) {
    try {
        const response = await fetch(`/api/materiales/task-materials?id_tarea=${tareaId}`);
        const data = await response.json();

        if (data.success) {
            showMaterialesModal(tareaId, data.materiales);
        } else {
            alert('Error al cargar materiales');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

function showMaterialesModal(tareaId, materiales) {
    const materialesHTML = materiales && materiales.length > 0 ? `
        <div class="materials-grid">
            ${materiales.map(material => {
        const suficiente = material.stock_disponible >= material.cantidad_requerida;
        return `
                    <div class="material-card ${suficiente ? 'disponible' : 'insuficiente'}">
                        <div class="material-icon-box">
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="material-info-box">
                            <h4>${material.nombre}</h4>
                            ${material.caracteristicas ? `<p class="material-desc">${material.caracteristicas}</p>` : ''}
                            <div class="material-quantities">
                                <span class="quantity-item">
                                    <i class="fas fa-clipboard-list"></i>
                                    Necesario: <strong>${material.cantidad_requerida}</strong>
                                </span>
                                <span class="quantity-item ${suficiente ? 'available' : 'unavailable'}">
                                    <i class="fas fa-warehouse"></i>
                                    Disponible: <strong>${material.stock_disponible}</strong>
                                </span>
                            </div>
                        </div>
                        <div class="material-status-badge">
                            ${suficiente ?
                '<span class="badge-success"><i class="fas fa-check-circle"></i> Disponible</span>' :
                '<span class="badge-warning"><i class="fas fa-exclamation-triangle"></i> Insuficiente</span>'
            }
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    ` : `
        <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px;">
            <i class="fas fa-info-circle" style="font-size: 48px; color: #999; margin-bottom: 15px;"></i>
            <p style="color: #666; margin: 0; font-size: 16px;">Esta tarea no requiere materiales específicos</p>
        </div>
    `;

    const modal = `
        <div id="materialesModal" class="modal-detail" onclick="if(event.target.id==='materialesModal') this.remove()">
            <div class="modal-detail-content">
                <button onclick="document.getElementById('materialesModal').remove()" class="modal-close-button">&times;</button>
                
                <h2 class="modal-detail-header">
                    <i class="fas fa-boxes" style="color: #667eea; margin-right: 10px;"></i>
                    Materiales Necesarios
                </h2>
                
                ${materialesHTML}
                
                <div class="modal-detail-footer" style="margin-top: 30px;">
                    <button onclick="document.getElementById('materialesModal').remove()" class="btn btn-secondary">
                        Cerrar
                    </button>
                    <button onclick="document.getElementById('materialesModal').remove(); viewUserTaskDetails(${tareaId})" class="btn btn-primary">
                        Ver Detalles Completos
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

function mostrarDetallesTareaUsuario(tarea, avances, materiales = []) {
    const materialesHTML = materiales && materiales.length > 0 ? `
        <div class="task-materials-section">
            <h3><i class="fas fa-boxes"></i> Materiales Necesarios</h3>
            <div class="materials-grid">
                ${materiales.map(material => {
        const suficiente = material.stock_disponible >= material.cantidad_requerida;
        return `
                        <div class="material-card ${suficiente ? 'disponible' : 'insuficiente'}">
                            <div class="material-icon-box">
                                <i class="fas fa-box"></i>
                            </div>
                            <div class="material-info-box">
                                <h4>${material.nombre}</h4>
                                ${material.caracteristicas ? `<p class="material-desc">${material.caracteristicas}</p>` : ''}
                                <div class="material-quantities">
                                    <span class="quantity-item">
                                        <i class="fas fa-clipboard-list"></i>
                                        Necesario: <strong>${material.cantidad_requerida}</strong>
                                    </span>
                                    <span class="quantity-item ${suficiente ? 'available' : 'unavailable'}">
                                        <i class="fas fa-warehouse"></i>
                                        Disponible: <strong>${material.stock_disponible}</strong>
                                    </span>
                                </div>
                            </div>
                            <div class="material-status-badge">
                                ${suficiente ?
                '<span class="badge-success"><i class="fas fa-check-circle"></i> Disponible</span>' :
                '<span class="badge-warning"><i class="fas fa-exclamation-triangle"></i> Insuficiente</span>'
            }
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    ` : `
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
            <i class="fas fa-info-circle" style="font-size: 32px; color: #999; margin-bottom: 10px;"></i>
            <p style="color: #666; margin: 0;">Esta tarea no requiere materiales específicos</p>
        </div>
    `;

    const modal = `
        <div id="taskDetailModal" class="modal-detail" onclick="if(event.target.id==='taskDetailModal') this.remove()">
            <div class="modal-detail-content">
                <button onclick="document.getElementById('taskDetailModal').remove()" class="modal-close-button">&times;</button>
                
                <h2 class="modal-detail-header">${tarea.titulo}</h2>
                
                <div class="modal-detail-section">
                    <p style="margin: 0; color: #666; line-height: 1.6;">${tarea.descripcion}</p>
                </div>
                
                <div class="modal-detail-grid">
                    <div class="modal-detail-item">
                        <strong>Fecha Inicio:</strong><br>
                        ${new Date(tarea.fecha_inicio).toLocaleDateString('es-UY')}
                    </div>
                    <div class="modal-detail-item">
                        <strong>Fecha Fin:</strong><br>
                        ${new Date(tarea.fecha_fin).toLocaleDateString('es-UY')}
                    </div>
                    <div class="modal-detail-item">
                        <strong>Prioridad:</strong><br>
                        ${formatPrioridad(tarea.prioridad)}
                    </div>
                    <div class="modal-detail-item">
                        <strong>Estado:</strong><br>
                        ${formatEstadoUsuario(tarea.estado_usuario || tarea.estado)}
                    </div>
                </div>
                
                <div style="padding: 10px; background: #d1ecf1; border-radius: 5px; margin-bottom: 20px;">
                    <strong>Creado por:</strong> ${tarea.creador}
                </div>
                
                ${materialesHTML}
                
                ${avances && avances.length > 0 ? `
                    <h3 style="margin-top: 30px; margin-bottom: 15px; color: #333;">Avances Reportados</h3>
                    ${avances.map(avance => `
                        <div class="modal-detail-avance">
                            <div class="modal-detail-avance-header">
                                <strong class="modal-detail-avance-name">${avance.nombre_completo}</strong>
                                <span class="modal-detail-avance-date">${new Date(avance.fecha_avance).toLocaleString('es-UY')}</span>
                            </div>
                            <p class="modal-detail-avance-text">${avance.comentario}</p>
                            ${avance.progreso_reportado > 0 ? `
                                <div class="avance-progress-bar">
                                    <div class="avance-progress-fill" style="width: ${avance.progreso_reportado}%">
                                        ${avance.progreso_reportado}%
                                    </div>
                                </div>
                            ` : ''}
                            ${avance.archivo ? `<a href="/files/?path=${avance.archivo}" target="_blank" class="file-link">🔎 Ver archivo adjunto</a>` : ''}
                        </div>
                    `).join('')}
                ` : '<p class="no-tasks">No hay avances reportados aún</p>'}
                
                <div class="modal-detail-footer">
                    <button onclick="document.getElementById('taskDetailModal').remove()" class="btn btn-secondary">Cerrar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

// ==========================================
// MI VIVIENDA 
// ==========================================

function loadMyVivienda() {
    const container = document.getElementById('myViviendaContainer');

    if (!container) {
        console.error('Container myViviendaContainer NO encontrado');
        return;
    }

    container.innerHTML = '<p class="loading" data-i18n="dashboardUser.housing.loading">Cargando información de vivienda...</p>';
    i18n.translatePage();

    fetch('/api/viviendas/my-vivienda', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.vivienda) {
                    renderMyVivienda(data.vivienda);
                } else {
                    container.innerHTML = '<p data-i18n="dashboardUser.housing.noAssigned">Aún no tienes una vivienda asignada.</p>';
                    i18n.translatePage();
                }
            } else {
                container.innerHTML = `<p class="error">Error: ${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        });
}

function renderMyVivienda(vivienda) {
    const container = document.getElementById('myViviendaContainer');

    container.innerHTML = `
        <div class="my-vivienda-card">
            <h3>🏡 Vivienda ${vivienda.numero_vivienda}</h3>
            <div class="vivienda-info-grid">
                <div class="info-item">
                    <strong>📍 Dirección:</strong>
                    <p>${vivienda.direccion || 'No especificada'}</p>
                </div>
                <div class="info-item">
                    <strong>🏠 Tipo:</strong>
                    <p>${vivienda.tipo_nombre} (${vivienda.habitaciones} habitaciones)</p>
                </div>
                <div class="info-item">
                    <strong>📐 Superficie:</strong>
                    <p>${vivienda.metros_cuadrados ? vivienda.metros_cuadrados + ' m²' : 'No especificada'}</p>
                </div>
                <div class="info-item">
                    <strong>📅 Fecha de asignación:</strong>
                    <p>${new Date(vivienda.fecha_asignacion).toLocaleDateString('es-UY')}</p>
                </div>
            </div>
        </div>
    `;
}
// ==========================================
// SISTEMA DE REGISTRO DE HORAS 
// ==========================================

('🟢 Iniciando sistema de registro de horas');

// Variables globales
let relojInterval;
let registroAbiertoId = null;
let registroAbiertoData = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function () {
    ('📋 Inicializando módulo de horas');

    // Iniciar reloj en tiempo real
    updateClock();
    relojInterval = setInterval(updateClock, 1000);

    // Listener para la sección de horas
    const horasMenuItem = document.querySelector('.menu li[data-section="horas"]');
    if (horasMenuItem) {
        horasMenuItem.addEventListener('click', function () {
            ('>>> Sección horas abierta');
            inicializarSeccionHoras();
        });
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('editarRegistroModal');
        if (event.target === modal) {
            closeEditarRegistroModal();
        }
    });
});

// ========== RELOJ EN TIEMPO REAL ==========

function updateClock() {
    // Obtener hora actual del navegador
    const now = new Date();

    // Crear opciones para formato Uruguay
    const options = {
        timeZone: 'America/Montevideo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    // Formatear hora en zona horaria de Uruguay
    const timeString = now.toLocaleTimeString('es-UY', options);

    const clockElement = document.getElementById('current-time-display');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
}


function updateClockWithDate() {
    const now = new Date();


    const dateOptions = {
        timeZone: 'America/Montevideo',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const timeOptions = {
        timeZone: 'America/Montevideo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    const dateString = now.toLocaleDateString('es-UY', dateOptions);
    const timeString = now.toLocaleTimeString('es-UY', timeOptions);

    // Capitalizar primera letra del día
    const dateCapitalized = dateString.charAt(0).toUpperCase() + dateString.slice(1);

    // Actualizar elementos si existen
    const clockElement = document.getElementById('current-time-display');
    const dateElement = document.getElementById('current-date-display');

    if (clockElement) {
        clockElement.textContent = timeString;
    }

    if (dateElement) {
        dateElement.textContent = dateCapitalized;
    }
}

// ========== CARGAR DEUDA DE HORAS WIDGET ==========
async function cargarDeudaHorasWidget() {
    const container = document.getElementById('deuda-actual-container');
    if (!container) {
        ('⚠️ Container deuda-actual-container no encontrado');
        return;
    }

    container.innerHTML = '<p class="loading">Calculando deuda...</p>';

    try {
        const response = await fetch('/api/horas/deuda-actual');
        const data = await response.json();

        ('💰 Deuda de horas recibida:', data);

        if (data.success && data.deuda) {
            renderDeudaHorasWidget(data.deuda);
        } else {
            container.innerHTML = '<p class="error">No se pudo cargar la deuda de horas</p>';
        }

    } catch (error) {
        console.error('❌ Error al cargar deuda:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

function renderDeudaHorasWidget(deuda) {
    const container = document.getElementById('deuda-actual-container');

    const estado = deuda.estado || 'pendiente';
    const colorEstado = estado === 'cumplido' ? 'success' :
        estado === 'progreso' ? 'warning' : 'error';

    const deudaMesActual = parseFloat(deuda.deuda_en_pesos || 0);
    const deudaAcumulada = parseFloat(deuda.deuda_acumulada || 0);
    const totalAPagar = deudaMesActual + deudaAcumulada;  // ✅ SUMA CORRECTA
    const tieneDeuda = totalAPagar > 0;

    container.innerHTML = `
        <div class="deuda-widget ${colorEstado}">
            <div class="deuda-header">
                <div class="deuda-icono">
                    <i class="fas ${tieneDeuda ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                </div>
                <div class="deuda-titulo">
                    <h4>${tieneDeuda ? 'Tienes Deuda de Horas' : 'Sin Deuda de Horas'}</h4>
                    <p>Período: ${getNombreMes(deuda.mes)} ${deuda.anio}</p>
                </div>
            </div>
            
            <div class="deuda-body">
                <!-- ✅ MOSTRAR TOTAL A PAGAR (MES ACTUAL + ACUMULADA) -->
                <div class="deuda-monto-principal ${tieneDeuda ? 'error' : 'success'}">
                    $${totalAPagar.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
                </div>
                
                <!-- ✅ AGREGAR DESGLOSE DE LA DEUDA TOTAL -->
                ${totalAPagar > 0 ? `
                    <div class="deuda-desglose-resumen" style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ff9800;">
                        <div style="display: grid; gap: 8px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>💰 Deuda mes actual:</span>
                                <strong>$${deudaMesActual.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                            </div>
                            ${deudaAcumulada > 0 ? `
                                <div style="display: flex; justify-content: space-between; color: #d32f2f;">
                                    <span>⚠ Deuda acumulada:</span>
                                    <strong>$${deudaAcumulada.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                                </div>
                                <hr style="margin: 8px 0; border: none; border-top: 1px dashed #ccc;">
                                <div style="display: flex; justify-content: space-between; font-size: 1.1em;">
                                    <span><strong>Total a pagar:</strong></span>
                                    <strong style="color: #d32f2f;">$${totalAPagar.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div class="deuda-desglose">
                    <div class="desglose-item">
                        <span class="label">Horas Requeridas:</span>
                        <span class="valor">${deuda.horas_requeridas_mensuales}h/mes</span>
                    </div>
                    <div class="desglose-item">
                        <span class="label">Sistema Semanal:</span>
                        <span class="valor">${deuda.horas_requeridas_semanales}h/semana</span>
                    </div>
                    <div class="desglose-item">
                        <span class="label">Horas Trabajadas:</span>
                        <span class="valor">${deuda.horas_trabajadas}h</span>
                    </div>
                    <div class="desglose-item">
                        <span class="label">Promedio Semanal:</span>
                        <span class="valor">${deuda.promedio_semanal}h/sem</span>
                    </div>
                    <div class="desglose-item ${tieneDeuda ? 'error' : 'success'}">
                        <span class="label">Horas Faltantes:</span>
                        <span class="valor">${deuda.horas_faltantes}h</span>
                    </div>
                    <div class="desglose-item">
                        <span class="label">Costo por Hora:</span>
                        <span class="valor">$${deuda.costo_por_hora}</span>
                    </div>
                </div>
                
                <div class="deuda-progreso">
                    <div class="progreso-header">
                        <span>Progreso Mensual</span>
                        <span class="porcentaje">${deuda.porcentaje_cumplido}%</span>
                    </div>
                    <div class="barra-progreso">
                        <div class="barra-fill" style="width: ${Math.min(deuda.porcentaje_cumplido, 100)}%; 
                             background: ${deuda.porcentaje_cumplido >= 100 ? '#4caf50' :
            deuda.porcentaje_cumplido >= 50 ? '#ff9800' : '#f44336'}">
                        </div>
                    </div>
                </div>
                
                ${tieneDeuda ? `
                    <div class="alert-warning" style="margin-top: 15px;">
                        <strong>⚠ Información Importante:</strong>
                        <p>Esta deuda ${deudaAcumulada > 0 ? '(incluye $' + deudaAcumulada.toLocaleString('es-UY', { minimumFractionDigits: 2 }) + ' de meses anteriores) ' : ''}se sumará automáticamente a tu próxima cuota mensual de vivienda.</p>
                        <p>Sistema: <strong>21 horas semanales</strong> (84h mensuales).</p>
                    </div>
                ` : `
                    <div class="alert-success" style="margin-top: 15px;">
                        <strong>🎉 ¡Excelente!</strong>
                        <p>Has cumplido con tus horas requeridas. No tendrás cargos adicionales en tu cuota.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}


function getNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[parseInt(mes) - 1] || mes;
}

// ========== INICIALIZAR SECCIÓN ==========
async function inicializarSeccionHoras() {
    ('🔄 Inicializando sección de horas');

    try {
        // Verificar si hay registro abierto
        await verificarRegistroAbierto();

        // Cargar datos
        await Promise.all([
            loadResumenSemanal(),
            loadMisRegistros(),
            cargarEstadisticas(),
            cargarDeudaHorasWidget() //  AGREGAR ESTA LÍNEA
        ]);

        (' Sección inicializada correctamente');

    } catch (error) {
        console.error('❌ Error al inicializar:', error);
        alert('Error al cargar la información. Por favor, recarga la página.');
    }
}

// ========== VERIFICAR REGISTRO ABIERTO ==========
async function verificarRegistroAbierto() {
    try {
        const response = await fetch('/api/horas/registro-abierto', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        });

        // DEBUG: Ver respuesta cruda
        const responseText = await response.text();
        ('🔍 Response status:', response.status);
        ('🔍 Response text:', responseText.substring(0, 500));

        // Intentar parsear JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ Error parsing JSON:', parseError);
            console.error('❌ Response completo:', responseText);
            throw new Error('El servidor devolvió HTML en lugar de JSON. Revisa los logs de PHP.');
        }

        ('📊 Verificación de registro:', data);

        if (data.success && data.registro) {
            // Hay un registro abierto
            registroAbiertoId = data.registro.id_registro;
            registroAbiertoData = data.registro;
            mostrarBotonSalida(data.registro.hora_entrada);
            (' Registro abierto encontrado:', registroAbiertoId);
        } else {
            // No hay registro abierto
            registroAbiertoId = null;
            registroAbiertoData = null;
            mostrarBotonEntrada();
            ('ℹ️ No hay registro abierto');
        }

    } catch (error) {
        console.error('❌ Error en verificarRegistroAbierto:', error);

        mostrarBotonEntrada();
    }
}

// ========== MOSTRAR BOTONES ==========
function mostrarBotonEntrada() {
    const btnEntrada = document.getElementById('btn-entrada');
    const btnSalida = document.getElementById('btn-salida');
    const infoDiv = document.getElementById('registro-activo-info');

    if (btnEntrada) btnEntrada.style.display = 'inline-block';
    if (btnSalida) btnSalida.style.display = 'none';
    if (infoDiv) infoDiv.style.display = 'none';
}

function mostrarBotonSalida(horaEntrada) {
    const btnEntrada = document.getElementById('btn-entrada');
    const btnSalida = document.getElementById('btn-salida');
    const infoDiv = document.getElementById('registro-activo-info');
    const horaEntradaSpan = document.getElementById('hora-entrada-activa');

    if (btnEntrada) btnEntrada.style.display = 'none';
    if (btnSalida) btnSalida.style.display = 'inline-block';
    if (infoDiv) infoDiv.style.display = 'block';

    if (horaEntradaSpan && horaEntrada) {
        const horaFormateada = horaEntrada.substring(0, 5); // HH:MM
        horaEntradaSpan.textContent = horaFormateada;
    }
}

// ========== MARCAR ENTRADA ==========
async function marcarEntrada() {
    ('🚀 Iniciando marcación de entrada');

    const descripcion = prompt('Describe brevemente tu trabajo de hoy (opcional):');
    if (descripcion === null) {
        ('ℹ️ Usuario canceló la entrada');
        return;
    }

    const btnEntrada = document.getElementById('btn-entrada');
    btnEntrada.disabled = true;
    btnEntrada.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

    try {
        const hoy = new Date();
        const formData = new FormData();
        formData.append('fecha', hoy.toISOString().split('T')[0]);
        formData.append('hora_entrada', hoy.toTimeString().split(' ')[0]);
        formData.append('descripcion', descripcion || '');

        ('📤 Enviando datos de entrada');

        const response = await fetch('/api/horas/iniciar', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        const data = await response.json();
        ('📥 Respuesta del servidor:', data);

        if (data.success) {
            alert(` ${data.message}\nHora registrada: ${data.hora_entrada}`);
            registroAbiertoId = data.id_registro;

            // Restablecer botón antes de recargar
            btnEntrada.disabled = false;
            btnEntrada.innerHTML = '<i class="fas fa-sign-in-alt"></i> Marcar Entrada';

            await inicializarSeccionHoras();
        } else {
            alert(`❌ ${data.message}`);
            btnEntrada.disabled = false;
            btnEntrada.innerHTML = '<i class="fas fa-sign-in-alt"></i> Marcar Entrada';
        }

    } catch (error) {
        console.error('❌ Error al marcar entrada:', error);
        alert('❌ Error de conexión. Por favor, intenta nuevamente.');
        btnEntrada.disabled = false;
        btnEntrada.innerHTML = '<i class="fas fa-sign-in-alt"></i> Marcar Entrada';
    }
}

// ========== MARCAR SALIDA ==========
async function marcarSalida() {
    ('🚀 Iniciando marcación de salida');

    if (!registroAbiertoId) {
        alert('❌ No hay registro activo para cerrar');
        return;
    }

    if (!confirm('¿Deseas registrar tu salida ahora?')) {
        ('ℹ️ Usuario canceló la salida');
        return;
    }

    const btnSalida = document.getElementById('btn-salida');
    const btnHTML = btnSalida.innerHTML;
    btnSalida.disabled = true;
    btnSalida.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

    try {
        const ahora = new Date();
        const formData = new FormData();
        formData.append('id_registro', registroAbiertoId);
        formData.append('hora_salida', ahora.toTimeString().split(' ')[0]);

        ('📤 Enviando datos de salida');

        const response = await fetch('/api/horas/cerrar', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        const data = await response.json();
        ('📥 Respuesta del servidor:', data);

        if (data.success) {
            alert(` ${data.message}\n\n⏱️ Total trabajado: ${data.total_horas} horas`);
            registroAbiertoId = null;
            registroAbiertoData = null;

            // Restablecer botón antes de recargar
            btnSalida.disabled = false;
            btnSalida.innerHTML = btnHTML;

            await inicializarSeccionHoras();
        } else {
            alert(`❌ ${data.message}`);
            btnSalida.disabled = false;
            btnSalida.innerHTML = btnHTML;
        }

    } catch (error) {
        console.error('❌ Error al marcar salida:', error);
        alert('❌ Error de conexión. Por favor, intenta nuevamente.');
        btnSalida.disabled = false;
        btnSalida.innerHTML = btnHTML;
    }
}

// ========== CARGAR ESTADÍSTICAS ==========
async function cargarEstadisticas() {
    try {
        const [resumenResponse, statsResponse] = await Promise.all([
            fetch('/api/horas/resumen-semanal'),
            fetch('/api/horas/estadisticas')
        ]);

        const resumenData = await resumenResponse.json();
        const statsData = await statsResponse.json();

        // Actualizar horas de la semana
        if (resumenData.success && resumenData.resumen) {
            const horasSemana = document.getElementById('horas-semana');
            const diasSemana = document.getElementById('dias-semana');

            if (horasSemana) {
                horasSemana.textContent = (resumenData.resumen.total_horas || 0) + 'h';
            }
            if (diasSemana) {
                diasSemana.textContent = resumenData.resumen.dias_trabajados || 0;
            }
        }

        // Actualizar horas del mes
        if (statsData.success && statsData.estadisticas) {
            const horasMes = document.getElementById('horas-mes');
            if (horasMes) {
                horasMes.textContent = (statsData.estadisticas.total_horas || 0) + 'h';
            }
        }

        (' Estadísticas actualizadas');

    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
    }
}

// ========== RESUMEN SEMANAL ==========
async function loadResumenSemanal() {
    const container = document.getElementById('resumen-semanal-container');
    if (!container) return;

    container.innerHTML = '<p class="loading">Cargando resumen semanal...</p>';

    try {
        const response = await fetch('/api/horas/resumen-semanal');
        const data = await response.json();

        if (data.success && data.resumen) {
            renderResumenSemanal(data.resumen);
            (' Resumen semanal cargado');
        } else {
            container.innerHTML = '<p class="error">Error al cargar resumen semanal</p>';
        }

    } catch (error) {
        console.error('❌ Error al cargar resumen semanal:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

function renderResumenSemanal(resumen) {
    const container = document.getElementById('resumen-semanal-container');

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const registrosPorDia = {};

    // Organizar registros por día
    if (resumen.registros) {
        resumen.registros.forEach(reg => {
            registrosPorDia[reg.fecha] = reg;
        });
    }

    // Generar fechas de la semana 
    const fechaInicio = new Date(resumen.semana.inicio + 'T00:00:00');
    const fechas = [];
    for (let i = 0; i < 7; i++) {
        const fecha = new Date(fechaInicio);
        fecha.setDate(fecha.getDate() + i);
        fechas.push(fecha.toISOString().split('T')[0]);
    }

    let html = `
        <div class="resumen-semana-header">
            <p><strong>Semana del ${formatearFechaSimple(resumen.semana.inicio)} al ${formatearFechaSimple(resumen.semana.fin)}</strong></p>
            <p>
                📊 Total: <strong>${resumen.total_horas}h</strong> | 
                📅 Días trabajados: <strong>${resumen.dias_trabajados}</strong>
            </p>
        </div>
        <div class="resumen-dias-grid">
    `;

    fechas.forEach((fecha, index) => {
        const registro = registrosPorDia[fecha];
        const dia = diasSemana[index];
        const fechaFormateada = formatearFechaSimple(fecha);
        const esHoy = fecha === new Date().toISOString().split('T')[0];
        const esFinDeSemana = index === 5 || index === 6;

        html += `
            <div class="dia-card ${registro ? 'con-registro' : 'sin-registro'} ${esHoy ? 'dia-hoy' : ''} ${esFinDeSemana ? 'fin-de-semana' : ''}">
                <div class="dia-header">
                    <strong>${dia}</strong>
                    <span class="dia-fecha">${fechaFormateada}</span>
                    ${esHoy ? '<span class="badge-hoy">HOY</span>' : ''}
                    ${esFinDeSemana ? '<span class="badge-finde">🏖️</span>' : ''}
                </div>
                <div class="dia-content">
        `;

        if (registro) {
            const entrada = registro.hora_entrada ? registro.hora_entrada.substring(0, 5) : '--:--';
            const salida = registro.hora_salida ? registro.hora_salida.substring(0, 5) : 'En curso';
            const horas = registro.total_horas || 0;
            const estadoBadge = getEstadoBadge(registro.estado);

            html += `
                <div class="registro-info">
                    <p><i class="fas fa-sign-in-alt"></i> Entrada: <strong>${entrada}</strong></p>
                    <p><i class="fas fa-sign-out-alt"></i> Salida: <strong>${salida}</strong></p>
                    <p><i class="fas fa-clock"></i> Total: <strong>${horas}h</strong></p>
                    ${estadoBadge}
                </div>
            `;
        } else {
            html += '<p class="no-registro"><i class="fas fa-calendar-times"></i> Sin registro</p>';
        }

        html += `
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function getEstadoBadge(estado) {
    const badges = {
        'pendiente': '<span class="badge-estado pendiente"><i class="fas fa-clock"></i> Pendiente</span>',
        'aprobado': '<span class="badge-estado aprobado"><i class="fas fa-check-circle"></i> Aprobado</span>',
        'rechazado': '<span class="badge-estado rechazado"><i class="fas fa-times-circle"></i> Rechazado</span>'
    };
    return badges[estado] || '';
}

// ========== HISTORIAL DE REGISTROS ==========
async function loadMisRegistros() {
    const container = document.getElementById('historial-registros-container');
    if (!container) return;

    container.innerHTML = '<p class="loading">Cargando historial...</p>';

    try {
        const fechaInicio = document.getElementById('filtro-fecha-inicio')?.value || '';
        const fechaFin = document.getElementById('filtro-fecha-fin')?.value || '';

        let url = '/api/horas/mis-registros';
        if (fechaInicio && fechaFin) {
            url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.registros) {
            renderHistorialRegistros(data.registros);
            (` ${data.registros.length} registros cargados`);
        } else {
            container.innerHTML = '<p class="error">Error al cargar registros</p>';
        }

    } catch (error) {
        console.error('❌ Error al cargar registros:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

function renderHistorialRegistros(registros) {
    const container = document.getElementById('historial-registros-container');

    if (!registros || registros.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; margin-bottom: 10px;"></i>
                <p>No hay registros para mostrar</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="registros-table-wrapper">
            <table class="registros-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Día</th>
                        <th>Entrada</th>
                        <th>Salida</th>
                        <th>Total</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

    registros.forEach(reg => {
        const fecha = new Date(reg.fecha + 'T00:00:00');
        const fechaFormateada = formatearFechaSimple(reg.fecha);
        const diaSemana = obtenerDiaSemana(fecha);
        const entrada = reg.hora_entrada ? reg.hora_entrada.substring(0, 5) : '--:--';
        const salida = reg.hora_salida ? reg.hora_salida.substring(0, 5) : '<span class="en-curso">En curso</span>';
        const horas = reg.total_horas || '0.00';

        html += `
            <tr class="registro-row">
                <td><strong>${fechaFormateada}</strong></td>
                <td>${diaSemana}</td>
                <td><i class="fas fa-sign-in-alt"></i> ${entrada}</td>
                <td><i class="fas fa-sign-out-alt"></i> ${salida}</td>
                <td><strong>${horas}h</strong></td>
                <td>
                    ${reg.descripcion ? `
                        <button class="btn-small btn-secondary" onclick="verDescripcionRegistro('${reg.descripcion.replace(/'/g, "\\'")}', '${fechaFormateada}')" title="Ver descripción">
                            <i class="fas fa-eye"></i>
                        </button>
                    ` : '-'}
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// Función para ver la descripción en un modal
function verDescripcionRegistro(descripcion, fecha) {
    const modal = `
        <div class="modal-detail" onclick="if(event.target.classList.contains('modal-detail')) this.remove()">
            <div class="modal-detail-content" style="max-width: 600px;">
                <button onclick="this.closest('.modal-detail').remove()" class="modal-close-button">×</button>
                
                <h2 class="modal-detail-header">
                    <i class="fas fa-file-alt"></i> Descripción del Registro
                </h2>
                
                <div class="modal-detail-section">
                    <p><strong>Fecha:</strong> ${fecha}</p>
                </div>
                
                <div class="modal-detail-section" style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <p style="margin: 0; white-space: pre-wrap;">${descripcion}</p>
                </div>
                
                <div class="modal-detail-footer">
                    <button onclick="this.closest('.modal-detail').remove()" class="btn btn-secondary">Cerrar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

function formatearFechaSimple(fecha) {
    const f = new Date(fecha + 'T00:00:00');
    return f.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function obtenerDiaSemana(fecha) {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[fecha.getDay()];
}

// Exportar funciones
window.loadMisRegistros = loadMisRegistros;
window.verDescripcionRegistro = verDescripcionRegistro;


// ========== FILTRAR REGISTROS ==========
async function filtrarRegistros() {
    const fechaInicio = document.getElementById('filtro-fecha-inicio')?.value;
    const fechaFin = document.getElementById('filtro-fecha-fin')?.value;

    if (!fechaInicio || !fechaFin) {
        alert('⚠️ Selecciona ambas fechas para filtrar');
        return;
    }

    if (fechaInicio > fechaFin) {
        alert('⚠️ La fecha de inicio debe ser anterior a la fecha de fin');
        return;
    }

    (`🔍 Filtrando registros: ${fechaInicio} a ${fechaFin}`);
    await loadMisRegistros();
}


(' Sistema de registro de horas cargado completamente');


window.marcarEntrada = marcarEntrada;
window.marcarSalida = marcarSalida;
window.loadResumenSemanal = loadResumenSemanal;
window.filtrarRegistros = filtrarRegistros;



// ==========================================
// EDICIÓN DE PERFIL
// ==========================================

let profileData = {};

// Alternar entre vista y edición
function toggleEditProfile() {
    const viewDiv = document.getElementById('profile-view');
    const editDiv = document.getElementById('profile-edit');
    const btnText = document.getElementById('btn-edit-text');

    // Debug: verificar que los elementos existen
    if (!viewDiv || !editDiv) {
        console.error('Error: No se encontraron los divs de perfil');
        ('viewDiv:', viewDiv);
        ('editDiv:', editDiv);
        return;
    }

    if (editDiv.style.display === 'none' || editDiv.style.display === '') {

        loadProfileData();
        viewDiv.style.display = 'none';
        editDiv.style.display = 'block';
        if (btnText) btnText.textContent = 'Cancelar';
    } else {
        // Mostrar vista de solo lectura
        viewDiv.style.display = 'block';
        editDiv.style.display = 'none';
        if (btnText) btnText.textContent = 'Editar Perfil';

        // Limpiar campos de contraseÃ±a
        const passActual = document.getElementById('edit-password-actual');
        const passNueva = document.getElementById('edit-password-nueva');
        const passConfirmar = document.getElementById('edit-password-confirmar');

        if (passActual) passActual.value = '';
        if (passNueva) passNueva.value = '';
        if (passConfirmar) passConfirmar.value = '';
    }
}

// Cargar datos del perfil
async function loadProfileData() {
    try {
        const response = await fetch('/api/users/my-profile');
        const data = await response.json();

        if (data.success) {
            profileData = data.user;

            // Llenar formulario de edición
            document.getElementById('edit-nombre').value = profileData.nombre_completo || '';
            document.getElementById('edit-cedula').value = profileData.cedula || '';
            document.getElementById('edit-email').value = profileData.email || '';
            document.getElementById('edit-direccion').value = profileData.direccion || '';
            document.getElementById('edit-fecha-nacimiento').value = profileData.fecha_nacimiento || '';
            document.getElementById('edit-telefono').value = profileData.telefono || '';

            // Actualizar vista de solo lectura también
            updateProfileView(profileData);
        } else {
            alert('Error al cargar datos del perfil');
        }
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        alert('Error de conexión al cargar perfil');
    }
}

// actualizar la vista de solo lectura
function updateProfileView(user) {
    // Actualizar nombre
    const nombreEl = document.getElementById('display-nombre');
    if (nombreEl) {
        nombreEl.textContent = user.nombre_completo || 'No disponible';
    }


    // Actualizar email
    const emailEl = document.getElementById('display-email');
    if (emailEl) {
        emailEl.textContent = user.email || 'No disponible';
    }

    // Actualizar dirección
    const direccionEl = document.getElementById('display-direccion');
    if (direccionEl) {
        direccionEl.textContent = user.direccion || 'No especificada';
    }

    // Actualizar fecha de nacimiento
    const fechaNacEl = document.getElementById('display-fecha-nacimiento');
    if (fechaNacEl && user.fecha_nacimiento) {
        const fecha = new Date(user.fecha_nacimiento + 'T00:00:00');
        fechaNacEl.textContent = fecha.toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } else if (fechaNacEl) {
        fechaNacEl.textContent = 'No especificada';
    }

    // Actualizar teléfono
    const telefonoEl = document.getElementById('display-telefono');
    if (telefonoEl) {
        telefonoEl.textContent = user.telefono || 'No especificado';
    }


}

// Cargar datos del usuario al iniciar
async function cargarDatosUsuario() {
    try {
        const response = await fetch('/api/users/my-profile');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.user) {
            // Actualizar header
            const nombreElement = document.getElementById('user-name-header');
            if (nombreElement) {
                nombreElement.textContent = data.user.nombre_completo || 'Usuario';
            }

            const emailElement = document.getElementById('user-email-header');
            if (emailElement) {
                emailElement.textContent = data.user.email || '';
            }

            // Actualizar vista del perfil
            updateProfileView(data.user);

            // Guardar datos globalmente
            profileData = data.user;

            (' Datos de usuario cargados correctamente');
        } else {
            console.error('Error en respuesta:', data);
        }
    } catch (error) {
        console.error('Error al cargar datos de usuario:', error);
    }
}

// Enviar formulario de edición
async function submitProfileEdit(event) {
    event.preventDefault();

    const nombre = document.getElementById('edit-nombre').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const direccion = document.getElementById('edit-direccion').value.trim();
    const fechaNacimiento = document.getElementById('edit-fecha-nacimiento').value;
    const telefono = document.getElementById('edit-telefono').value.trim();

    const passwordActual = document.getElementById('edit-password-actual').value;
    const passwordNueva = document.getElementById('edit-password-nueva').value;
    const passwordConfirmar = document.getElementById('edit-password-confirmar').value;

    // Validaciones
    if (!nombre || !email) {
        alert('⚠️ El nombre y email son obligatorios');
        return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('⚠️ Por favor ingresa un email válido');
        return;
    }

    // Validar cambio de contraseña
    if (passwordNueva || passwordConfirmar) {
        if (!passwordActual) {
            alert('⚠️ Debes ingresar tu contraseña actual para cambiarla');
            return;
        }

        if (passwordNueva.length < 6) {
            alert('⚠️ La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (passwordNueva !== passwordConfirmar) {
            alert('⚠️ Las contraseñas nuevas no coinciden');
            return;
        }
    }

    // Confirmar cambios
    if (!confirm('¿Estás seguro de guardar los cambios?')) {
        return;
    }

    // Preparar datos
    const formData = new FormData();
    formData.append('nombre_completo', nombre);
    formData.append('email', email);
    formData.append('direccion', direccion);
    formData.append('fecha_nacimiento', fechaNacimiento);
    formData.append('telefono', telefono);

    if (passwordActual && passwordNueva) {
        formData.append('password_actual', passwordActual);
        formData.append('password_nueva', passwordNueva);
    }

    try {
        const response = await fetch('/api/users/update-profile', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.message);

            // Recargar los datos del usuario para actualizar la vista
            await cargarDatosUsuario();

            // Volver a vista de solo lectura
            toggleEditProfile();

            // Actualizar sesión si es necesario
            if (data.reload) {
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        alert('❌ Error de conexión al guardar cambios');
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    ('🔄 Cargando datos del usuario...');
    cargarDatosUsuario();
});

// Exportar funciones globales
window.toggleEditProfile = toggleEditProfile;
window.submitProfileEdit = submitProfileEdit;
window.cargarDatosUsuario = cargarDatosUsuario;


// ==========================================
// SISTEMA DE CUOTAS MENSUALES CON DEUDA DE HORAS 
// ==========================================

(' Cargando módulo de cuotas con deuda de horas');

// Variable global para almacenar deuda de horas
window.deudaHorasActual = 0;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function () {
    const cuotasMenuItem = document.querySelector('.menu li[data-section="cuotas"]');
    if (cuotasMenuItem) {
        cuotasMenuItem.addEventListener('click', async function () {
            ('>>> Sección cuotas abierta');

            // Limpiar cache
            ultimoCheckCuotas = null;

            // Recargar todo
            await inicializarSeccionCuotas();
        });
    }

    // Poblar selector de años
    const selectAnio = document.getElementById('filtro-anio-cuotas');
    if (selectAnio) {
        const anioActual = new Date().getFullYear();
        for (let i = 0; i < 3; i++) {
            const anio = anioActual - i;
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            selectAnio.appendChild(option);
        }
    }
});

async function generarCuotaMesActualSiNoExiste() {
    ('🔄 Verificando cuota del mes actual...');

    try {
        const hoy = new Date();
        const mesActual = hoy.getMonth() + 1;
        const anioActual = hoy.getFullYear();

        // Verificar si ya existe la cuota
        const response = await fetch(`/api/cuotas/verificar-cuota-mes?mes=${mesActual}&anio=${anioActual}`);
        const data = await response.json();

        ('📊 Verificación de cuota:', data);

        if (data.success && !data.existe) {
            ('⚠️ No existe cuota del mes actual, generando...');

            // Generar cuota del mes actual
            const formData = new FormData();
            formData.append('mes', mesActual);
            formData.append('anio', anioActual);

            const responseGenerar = await fetch('/api/cuotas/generar-mi-cuota', {
                method: 'POST',
                body: formData
            });

            // 🔥 DEBUG: Ver respuesta completa
            const dataGenerar = await responseGenerar.json();
            ('🔍 RESPUESTA COMPLETA DE GENERAR:', dataGenerar);

            if (dataGenerar.success) {
                (' Cuota generada:', dataGenerar.message);
                if (dataGenerar.debug) {
                    ('🐛 DEBUG INFO:', dataGenerar.debug);
                }
            } else {
                console.warn('⚠️ No se pudo generar cuota:', dataGenerar.message);
                if (dataGenerar.debug) {
                    console.error('🐛 DEBUG ERROR:', dataGenerar.debug);
                }
            }
        } else if (data.existe) {
            (' Cuota del mes ya existe');
        }
    } catch (error) {
        console.error('❌ Error al verificar/generar cuota:', error);
    }
}

// ========== INICIALIZAR SECCIÓN ==========
// ========== INICIALIZAR SECCIÓN ==========
async function inicializarSeccionCuotas() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 [INIT CUOTAS] Inicializando sección de cuotas');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        // ✅ PASO 1: Generar cuota del mes actual
        console.log('⏳ [PASO 1/4] Verificando/generando cuota...');
        await generarCuotaMesActualSiNoExiste();
        console.log('✅ [PASO 1/4] Cuota verificada/generada');

        // 🔥 PASO 2: CARGAR DEUDA DE HORAS (CRÍTICO - DEBE COMPLETARSE)
        console.log('⏳ [PASO 2/4] Cargando deuda de horas...');
        const deudaCargada = await loadDeudaHorasParaCuotas();
        console.log('✅ [PASO 2/4] Deuda de horas cargada:', deudaCargada);

        // ✅ VERIFICACIÓN CRÍTICA
        if (typeof window.deudaHorasActual === 'undefined' || window.deudaHorasActual === null) {
            console.error('❌ [ERROR CRÍTICO] deudaHorasActual NO está definida!');
            console.error('   Forzando a 0 para evitar errores...');
            window.deudaHorasActual = 0;
        } else {
            console.log('✅ [VERIFICACIÓN] window.deudaHorasActual =', window.deudaHorasActual);
        }

        // ✅ PASO 3: Cargar info de vivienda
        console.log('⏳ [PASO 3/4] Cargando info de vivienda...');
        await loadInfoViviendaCuota();
        console.log('✅ [PASO 3/4] Info vivienda cargada');

        // ✅ PASO 4: Cargar cuotas (AHORA sí tiene la deuda disponible)
        console.log('⏳ [PASO 4/4] Cargando cuotas...');
        console.log('   💰 Deuda disponible para renderizado:', window.deudaHorasActual);
        await loadMisCuotas();
        console.log('✅ [PASO 4/4] Cuotas cargadas');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ [INIT CUOTAS] Sección inicializada correctamente');
        console.log('   💰 Deuda final disponible:', window.deudaHorasActual);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ [INIT CUOTAS] Error al inicializar:', error);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        alert('Error al cargar la información de cuotas');
    }
};




// ========== CARGAR DEUDA DE HORAS ==========
async function loadDeudaHorasParaCuotas() {
    console.log('💰 [DEUDA HORAS] Cargando deuda de horas para cuotas...');

    try {
        const response = await fetch('/api/horas/deuda-actual');
        const data = await response.json();

        console.log('📥 [DEUDA HORAS] Respuesta recibida:', data);

        if (data.success && data.deuda) {
            // 🔥 CRÍTICO: Calcular deuda correctamente
            const deudaEnPesos = parseFloat(data.deuda.deuda_en_pesos || 0);
            const deudaMesActual = parseFloat(data.deuda.deuda_mes_actual || 0);
            const deudaAcumulada = parseFloat(data.deuda.deuda_acumulada || 0);

            // Usar el campo correcto del backend
            // Usar el campo correcto del backend
            window.deudaHorasActual = deudaEnPesos;

            console.log('💵 [DEUDA HORAS] Deuda calculada:');
            console.log('   - deuda_en_pesos (PRINCIPAL):', deudaEnPesos);
            console.log('   - deuda_mes_actual:', deudaMesActual);
            console.log('   - deuda_acumulada:', deudaAcumulada);
            console.log('   ✅ DEUDA FINAL ASIGNADA:', deudaHorasActual);

            // ✅ VERIFICAR que se asignó correctamente
            if (deudaHorasActual === 0 && deudaEnPesos > 0) {
                console.error('❌ [DEUDA HORAS] ERROR: Deuda no se asignó correctamente!');
                deudaHorasActual = deudaEnPesos; // Forzar asignación
            }

        } else {
            console.warn('⚠️ [DEUDA HORAS] No se recibió deuda válida del backend');
            window.deudaHorasActual = 0;
        }

    } catch (error) {
        console.error('❌ [DEUDA HORAS] Error al cargar:', error);
        window.deudaHorasActual = 0;
    }

    console.log('🔚 [DEUDA HORAS] Proceso finalizado. Valor final:', deudaHorasActual);
    return deudaHorasActual; // ✅ IMPORTANTE: Retornar el valor
}

// ========== CARGAR INFO DE VIVIENDA ==========
async function loadInfoViviendaCuota() {
    const container = document.getElementById('info-vivienda-cuota');
    if (!container) return;

    container.innerHTML = '<p class="loading">Cargando información de vivienda...</p>';

    try {
        const response = await fetch('/api/viviendas/my-vivienda');
        const data = await response.json();

        if (data.success && data.vivienda) {
            const v = data.vivienda;
            container.innerHTML = `
                <h3>🏠 Tu Vivienda Asignada</h3>
                <div class="vivienda-cuota-grid">
                    <div class="info-item">
                        <strong>Número:</strong> ${v.numero_vivienda}
                    </div>
                    <div class="info-item">
                        <strong>Tipo:</strong> ${v.tipo_nombre} (${v.habitaciones} hab.)
                    </div>
                    <div class="info-item">
                        <strong>Dirección:</strong> ${v.direccion || 'No especificada'}
                    </div>
                </div>
                <div class="alert-info" style="margin-top: 15px;">
                    <strong>ℹ️ Importante:</strong> El monto total a pagar incluye la cuota de vivienda más la deuda por horas no trabajadas ($160 por hora faltante).
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="alert-warning">
                    <strong>⚠️ Sin Vivienda Asignada</strong>
                    <p>No tienes una vivienda asignada actualmente. Contacta con el administrador para más información.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error al cargar información</p>';
    }
}

// ========== CARGAR CUOTAS DEL USUARIO ==========
// ========== CARGAR CUOTAS DEL USUARIO ==========
async function loadMisCuotas() {
    const container = document.getElementById('misCuotasContainer');
    if (!container) return;

    container.innerHTML = '<p class="loading">Cargando cuotas...</p>';

    try {
        const mes = document.getElementById('filtro-mes-cuotas')?.value || '';
        const anio = document.getElementById('filtro-anio-cuotas')?.value || '';
        const estado = document.getElementById('filtro-estado-cuotas')?.value || '';

        let url = '/api/cuotas/mis-cuotas?';
        if (mes) url += `mes=${mes}&`;
        if (anio) url += `anio=${anio}&`;
        if (estado) url += `estado=${estado}&`;

        const response = await fetch(url);
        const data = await response.json();

        ('📊 Cuotas recibidas:', data);

        if (data.success) {
            let cuotas = data.cuotas || [];

            // 1. ORDENAR POR FECHA DESCENDENTE (Prepara el array)
            cuotas.sort((a, b) => {
                const anioA = parseInt(a.anio, 10) || 0;
                const anioB = parseInt(b.anio, 10) || 0;
                const mesA = parseInt(a.mes, 10) || 0;
                const mesB = parseInt(b.mes, 10) || 0;

                if (anioA !== anioB) {
                    return anioB - anioA;
                }
                return mesB - mesA;
            });

            // 2. BUSCAR Y MOVER LA CUOTA PENDIENTE MÁS RECIENTE AL INICIO
            // Esto garantiza que la cuota destacada (la que no está 'pagada') sea la primera.
            const cuotaDestacada = cuotas.find(c => {
                const isPaid = (c.estado === 'pagada' || c.estado_pago === 'pagado');
                return !isPaid;
            });

            if (cuotaDestacada) {
                const index = cuotas.findIndex(c => c.id_cuota === cuotaDestacada.id_cuota);

                if (index > 0) {
                    // Mueve la cuota pendiente al inicio (posición [0])
                    const [featuredCuota] = cuotas.splice(index, 1);
                    cuotas.unshift(featuredCuota);
                    console.log('🔄 CUOTA PENDIENTE FORZADA AL INICIO:', cuotas[0]);
                } else if (index === 0) {
                    console.log('✅ CUOTA PENDIENTE YA ES EL PRIMER ELEMENTO:', cuotas[0]);
                }
            } else {
                console.log('ℹ️ No se encontraron cuotas pendientes para destacar. Se mostrará la más reciente.');
            }
            // FIN DE LA LÓGICA DE SELECCIÓN

            // DEBUG: Verificación final
            if (cuotas.length > 0) {
                console.log('✅ CUOTA DESTACADA FINAL (Pendiente primero):', cuotas[0]);
            }

            renderMisCuotasOrganizadas(cuotas);
            updateCuotasStats(cuotas);
            i18n.translatePage();
        } else {
            container.innerHTML = '<p class="error">Error al cargar cuotas</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}


// ========== RENDERIZAR CUOTAS CON DEUDA TOTAL ==========
function renderMisCuotasOrganizadas(cuotas) {
    const container = document.getElementById('misCuotasContainer');

    if (!cuotas || cuotas.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; margin-bottom: 10px;"></i>
                <p data-i18n="dashboardUser.billing.history.empty">No se encontraron cuotas con los filtros seleccionados</p>
            </div>
        `;
        return;
    }

    let html = '';
    //DEUDA TOTAL DEL MES (CON CONTROL DE PERÍODO)
    const cuotaMasReciente = cuotas[0];

    // Calcular deuda total
    const montoCuota = parseFloat(cuotaMasReciente.monto_base || cuotaMasReciente.monto_actual || cuotaMasReciente.monto || 0);
    const deudaAcumuladaAnterior = parseFloat(cuotaMasReciente.monto_pendiente_anterior || 0);
    const montoTotal = montoCuota + deudaHorasActual + deudaAcumuladaAnterior;

    console.log('💰 Deuda total calculada:', {
        montoCuota,
        deudaAcumuladaAnterior,
        deudaHorasActual,
        montoTotal
    });

    ('💵 Cálculo de montos:', {
        monto_base: cuotaMasReciente.monto_base,
        monto_actual: cuotaMasReciente.monto_actual,
        monto: cuotaMasReciente.monto,
        montoCuota,
        deudaHorasActual,
        deudaAcumuladaAnterior,
        montoTotal
    });

    let ultimoCheckCuotas = null;

    async function verificarCambiosCuotas() {
        try {
            const mesActual = new Date().getMonth() + 1;
            const anioActual = new Date().getFullYear();

            const response = await fetch(`/api/cuotas/mis-cuotas?mes=${mesActual}&anio=${anioActual}`);
            const data = await response.json();

            if (data.success && data.cuotas.length > 0) {
                const cuotaActual = data.cuotas[0];
                const checksum = `${cuotaActual.id_cuota}-${cuotaActual.monto}-${cuotaActual.monto_base}`;

                if (ultimoCheckCuotas === null) {
                    ultimoCheckCuotas = checksum;
                } else if (ultimoCheckCuotas !== checksum) {
                    ('🔄 Detectado cambio en cuota, recargando...');
                    ultimoCheckCuotas = checksum;

                    // Recargar solo si estamos en la sección de cuotas
                    const cuotasSection = document.getElementById('cuotas-section');
                    if (cuotasSection && cuotasSection.classList.contains('active')) {
                        await inicializarSeccionCuotas();

                        // Mostrar notificación
                        mostrarNotificacionCambio();
                    }
                }
            }
        } catch (error) {
            console.error('Error verificando cambios:', error);
        }
    }

    function mostrarNotificacionCambio() {
        const notif = document.createElement('div');
        notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #69b2d5 0%, #1b1397 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
        notif.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-sync-alt fa-spin"></i>
            <div>
                <strong>Actualización Detectada</strong>
                <p style="margin: 5px 0 0 0; font-size: 13px;">Los precios de tu cuota han sido actualizados</p>
            </div>
        </div>
    `;

        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notif.remove(), 300);
        }, 5000);
    }

    // Iniciar polling cada 30 segundos (solo en sección cuotas)
    setInterval(() => {
        const cuotasSection = document.getElementById('cuotas-section');
        if (cuotasSection && cuotasSection.classList.contains('active')) {
            verificarCambiosCuotas();
        }
    }, 30000);

    // Verificar al cargar la sección
    const originalInicializarSeccionCuotas = window.inicializarSeccionCuotas;
    window.inicializarSeccionCuotas = async function () {
        await originalInicializarSeccionCuotas();
        await verificarCambiosCuotas();
    };

    function obtenerPrecioActualizado(cuota) {
        const precio = parseFloat(
            cuota.monto_base ||
            cuota.monto_actual ||
            cuota.monto ||
            0
        );

        (`💰 Precio para cuota ${cuota.id_cuota}:`, {
            monto_base: cuota.monto_base,
            monto_actual: cuota.monto_actual,
            monto: cuota.monto,
            precio_final: precio
        });

        return precio;
    }

    window.obtenerPrecioActualizado = obtenerPrecioActualizado;


    // Verificar estado de pago
    const estadoFinal = cuotaMasReciente.estado_actual || cuotaMasReciente.estado;
    const tienePagoPendiente = cuotaMasReciente.id_pago && cuotaMasReciente.estado_pago === 'pendiente';
    const estaPagada = estadoFinal === 'pagada';

    //  VERIFICAR SI ESTÁ EN PERÍODO DE PAGO
    const hoy = new Date();
    const diaActual = hoy.getDate();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    const esMesCuota = cuotaMasReciente.mes == mesActual && cuotaMasReciente.anio == anioActual;
    const estaDentroPeriodoPago = diaActual >= 25; // Del 25 al último día del mes

    const puedePagar = esMesCuota && estaDentroPeriodoPago && !estaPagada && !tienePagoPendiente;

    // Calcular días restantes para poder pagar
    let diasParaPagar = 0;
    if (esMesCuota && !estaDentroPeriodoPago) {
        diasParaPagar = 25 - diaActual;
    }

    ('📅 Control de período:', {
        diaActual,
        mesActual,
        esMesCuota,
        estaDentroPeriodoPago,
        puedePagar,
        diasParaPagar
    });

    html += `
    <div class="deuda-total-destacada ${estaPagada ? 'pagada-mes' : puedePagar ? '' : 'periodo-bloqueado'}">
        <div class="deuda-total-header">
            <h2 style="margin: 0; color: #fff;">
                <i class="fas ${estaPagada ? 'fa-check-circle' : puedePagar ? 'fa-exclamation-triangle' : 'fa-clock'}"></i>
                <span data-i18n="dashboardUser.billing.summary.currentMonth">Resumen del Mes Actual</span>
            </h2>
            <span class="deuda-total-badge ${estaPagada ? 'badge-pagada' : tienePagoPendiente ? 'badge-pendiente' : puedePagar ? 'badge-requerida' : 'badge-bloqueado'}">
                ${estaPagada ? ' PAGADA' :
            tienePagoPendiente ? '⏳ EN VALIDACIÓN' :
                puedePagar ? '⚠️ PERÍODO DE PAGO ABIERTO' :
                    '🔒 PERÍODO DE TRABAJO'}
            </span>
        </div>
        
       <div class="deuda-breakdown">
    <div class="deuda-breakdown-item">
        <i class="fas fa-home"></i>
        <div>
            <span class="deuda-label" data-i18n="dashboardUser.billing.summary.houseFee">Cuota de Vivienda</span>
            <span class="deuda-monto">$${montoCuota.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
        </div>
    </div>
    
   ${deudaAcumuladaAnterior > 0 ? `
    
        
        <div class="deuda-breakdown-item deuda-acumulada">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <span class="deuda-label" data-i18n="dashboardUser.billing.summary.previousMonthsDebt">Deuda de Meses Anteriores</span>
                <span class="deuda-monto error">
                    $${deudaAcumuladaAnterior.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
                </span>
                <small style="color: #ff8a80; display: block; margin-top: 5px;" data-i18n="dashboardUser.billing.summary.previousMonthsDebtNote">
                    (Cuotas vencidas no pagadas)
                </small>
            </div>
        </div>
    ` : ''}
    
    
    
    ${deudaHoras > 0 ? `
    <div class="deuda-breakdown-item deuda-horas">
        <i class="fas fa-clock"></i>
        <div>
            <span class="deuda-label" data-i18n="dashboardUser.billing.summary.hoursNotWorkedDebt">Deuda por Horas No Trabajadas</span>
            <span class="deuda-monto ${deudaHoras > 0 ? 'error' : 'success'}">$${deudaHoras.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
            <small style="color: ${deudaHoras > 0 ? '#ff8a80' : '#81c784'}; display: block; margin-top: 5px;">
                ${deudaHoras > 0 ? '($160 por hora × horas faltantes)' : '¡Sin deuda de horas!'}
            </small>
        </div>
    </div>
` : ''}


    
    <div class="deuda-breakdown-divider">=</div>
    
    <div class="deuda-breakdown-item deuda-total">
        <i class="fas fa-calculator"></i>
        <div>
            <span class="deuda-label">TOTAL ${estaPagada ? 'PAGADO' : 'A PAGAR'}</span>
            <span class="deuda-monto-total" style="color: ${estaPagada ? '#4caf50' : '#fff'};">
                $${montoTotal.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
            </span>
        </div>
    </div>
</div>
            
         ${estaPagada ? `
    <div class="alert-success" style="margin-top: 20px;">
        <strong style="color: #4caf50;" data-i18n="dashboardUser.billing.summary.paymentCompleted">🎉 ¡Pago Completado!</strong>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
            <span data-i18n="dashboardUser.billing.summary.paymentSuccess">Has pagado exitosamente tu cuota de </span>${obtenerNombreMes(cuotaMasReciente.mes)} ${cuotaMasReciente.anio}.
            ${cuotaMasReciente.fecha_pago ? `<br>Fecha de pago: ${new Date(cuotaMasReciente.fecha_pago).toLocaleDateString('es-UY')}` : ''}
            
            <!-- ✅ MOSTRAR DESGLOSE DEL PAGO -->
            <br><br>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 10px;">
                <strong style="display: block; margin-bottom: 10px;" data-i18n="dashboardUser.billing.summary.paymentBreakdown">📋 Desglose del Pago:</strong>
                <div style="display: grid; gap: 8px; font-size: 13px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span data-i18n="dashboardUser.billing.summary.housingFee">🏠 Cuota de vivienda:</span>
                        <strong>$${montoCuota.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    ${deudaAcumuladaAnterior > 0 ? `
                        <div style="display: flex; justify-content: space-between; color: #ffeb3b;">
                            <span data-i18n="dashboardUser.billing.summary.accumulatedDebt">⚠️ Deuda acumulada:</span>
                            <strong>$${deudaAcumuladaAnterior.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                        </div>
                    ` : ''}
                    ${deudaHorasActual > 0 ? `
                        <div style="display: flex; justify-content: space-between; color: #ff9800;">
                            <span data-i18n="dashboardUser.billing.summary.unworkedHoursDebt">⏰ Deuda por horas no trabajadas:</span>
                            <strong>$${deudaHorasActual.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                        </div>
                    ` : ''}
                    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 5px 0;">
                    <div style="display: flex; justify-content: space-between; font-size: 16px;">
                        <span><strong data-i18n="dashboardUser.billing.summary.totalPaid">💰 TOTAL PAGADO:</strong></span>
                        <strong style="color: #4caf50;">$${montoTotal.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                    </div>
                </div>
            </div>
        </p>
    </div>
            ${cuotaMasReciente.fecha_pago ? `<br>Fecha de pago: ${new Date(cuotaMasReciente.fecha_pago).toLocaleDateString('es-UY')}` : ''}
            
            <!-- ✅ AGREGAR ESTO -->
            ${deudaAcumuladaAnterior > 0 ? `
                <br><br><strong>Nota:</strong> El pago incluyó $${deudaAcumuladaAnterior.toLocaleString('es-UY', { minimumFractionDigits: 2 })} de deuda acumulada de meses anteriores.
            ` : ''}
        </p>
    </div>
            ` : tienePagoPendiente ? `
                <!-- ⏳ PAGO PENDIENTE DE VALIDACIÓN -->
                <div class="alert-info" style="margin-top: 20px; background: rgba(33, 150, 243, 0.2); border-color: rgba(33, 150, 243, 0.4);">
                    <strong style="color: #2196F3;" data-i18n="dashboardUser.billing.pendingPayment">⏳ Pago en Revisión</strong>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                        Tu pago de $${parseFloat(cuotaMasReciente.monto_pagado || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 })} 
                        está siendo validado por un administrador.
                        ${cuotaMasReciente.fecha_pago ? `<br>Enviado el: ${new Date(cuotaMasReciente.fecha_pago).toLocaleDateString('es-UY')}` : ''}
                    </p>
                </div>
            ` : puedePagar ? `
                <!-- ⚠️ PERÍODO DE PAGO ABIERTO -->
                <div class="deuda-total-actions">
                    <button class="btn-pagar-deuda-total" onclick="abrirPagarDeudaTotal(${cuotaMasReciente.id_cuota}, ${montoTotal})">
                        <i class="fas fa-credit-card"></i>
                        <span data-i18n="dashboardUser.billing.payNow">Pagar Ahora</span>
                    </button>
                </div>
                
                <div class="alert-success" style="margin-top: 20px; background: rgba(76, 175, 80, 0.15); border-color: rgba(76, 175, 80, 0.3);">
                    <strong style="color: #4caf50;" data-i18n="dashboardUser.billing.enabledPaymentPeriod"> Período de Pago Habilitado</strong>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;" data-i18n="dashboardUser.billing.enabledPaymentPeriodMessage">
                        Ya puedes realizar el pago de tu cuota. El período de pago está activo hasta fin de mes.
                    </p>
                </div>
            ` : `
                <!-- 🔒 PERÍODO DE TRABAJO (NO SE PUEDE PAGAR AÚN) -->
                <div class="deuda-total-actions">
                    <button class="btn-pagar-deuda-total" disabled style="opacity: 0.5; cursor: not-allowed;">
                        <i class="fas fa-lock"></i>
                        <span data-i18n="dashboardUser.billing.blockedPayment">Pago Bloqueado</span>
                    </button>
                </div>
                
                <div class="alert-warning" style="margin-top: 20px; background: rgba(255, 152, 0, 0.15); border-color: rgba(255, 152, 0, 0.3);">
                    <strong style="color: #ff9800;" data-i18n="dashboardUser.billing.workingPeriod">🔒 Período de Trabajo en Curso</strong>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                        ${diasParaPagar > 0 ? `
                            El período de pago se habilitará en <strong>${diasParaPagar} día${diasParaPagar !== 1 ? 's' : ''}</strong> (desde el 25 del mes).
                            <br>Por ahora, enfócate en cumplir tus <strong>21 horas mensuales</strong> para evitar cargos adicionales.
                        ` : `
                            El período de pago para este mes aún no está disponible.
                        `}
                    </p>
                    
                            </div>
                        </div>
                    </div>
                </div>
            `}
        </div>
    </div>
    
    <hr style="margin: 40px 0; border: none; border-top: 2px solid #e0e0e0;">
`;


    // Separar cuotas para las secciones restantes
    const cuotasPagables = cuotas.filter(c => {
        const estadoFinal = c.estado_actual || c.estado;
        return estadoFinal !== 'pagada';
    });

    const cuotasHistorial = cuotas.filter(c => {
        const estadoFinal = c.estado_actual || c.estado;
        return estadoFinal === 'pagada';
    });

    // SECCIÓN: CUOTAS PENDIENTES (SI HAY MÁS DE UNA)
    if (cuotasPagables.length > 1) { // Más de una pendiente
        html += `
            <div class="cuotas-section">
                <h3 style="color: #f44336; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-circle"></i> <span data-i18n="dashboardUser.billing.pending.title">Otras Cuotas Pendientes</span> (${cuotasPagables.length - 1})
                </h3>
                <div class="cuotas-grid">
        `;

        // Mostrar desde la segunda en adelante (la primera ya está en destacada)
        cuotasPagables.slice(1).forEach(cuota => {
            html += renderCuotaCard(cuota);
        });

        html += `
                </div>
            </div>
            <hr style="margin: 40px 0; border: none; border-top: 2px solid #e0e0e0;">
        `;
    }

    // SECCIÓN: HISTORIAL
    html += `
        <div class="cuotas-section">
            <h3 style="color: #666; margin-bottom: 20px;">
                <i class="fas fa-history"></i> <span data-i18n="dashboardUser.billing.history.title">Historial de Cuotas</span>
            </h3>
    `;

    if (cuotasHistorial.length > 0) {
        html += '<div class="cuotas-grid">';
        cuotasHistorial.forEach(cuota => {
            html += renderCuotaCard(cuota);
        });
        html += '</div>';
    } else {
        html += '<p style="color: #999; text-align: center;" data-i18n="dashboardUser.billing.history.empty">No hay cuotas en el historial</p>';
    }

    html += '</div>';

    container.innerHTML = html;
// AL PARECER INUTIL, NO MUESTRA LOS LOGS EXISTENTES DESPUES DE ESTA LINEA, NO SE COMPROBO ANTES DE ESTA LINEA
}



// ========== RENDERIZAR TARJETA DE CUOTA ==========
function renderCuotaCard(cuota) {
    const estadoFinal = cuota.estado_actual || cuota.estado;
    const mes = obtenerNombreMes(cuota.mes);
    const fechaVenc = new Date(cuota.fecha_vencimiento + 'T00:00:00');
    const fechaVencFormatted = fechaVenc.toLocaleDateString('es-UY');

    const esVencida = estadoFinal === 'vencida';
    const esPagada = cuota.estado === 'pagada';
    const tienePagoPendiente = cuota.id_pago && cuota.estado_pago === 'pendiente';

    // Calcular montos
    const montoCuota = obtenerPrecioActualizado(cuota);
    const deudaAcumuladaAnterior = parseFloat(cuota.monto_pendiente_anterior || 0);
    const deudaHorasMostrar = (estadoFinal !== 'pagada' && !tienePagoPendiente) ? deudaHorasActual : 0;

    // Monto total a mostrar
    const montoMostrar = montoCuota + deudaAcumuladaAnterior + deudaHorasMostrar;

    // Si está pagada, obtener el monto realmente pagado
    const montoPagado = esPagada && cuota.monto_pagado ? parseFloat(cuota.monto_pagado) : montoMostrar;

    return `
        <div class="cuota-card estado-${estadoFinal}">
            <div class="cuota-card-header">
                <div>
                    <h4>${mes} ${cuota.anio}</h4>
                    <span class="cuota-vivienda">${cuota.numero_vivienda} - ${cuota.tipo_vivienda}</span>
                </div>
                <span class="cuota-badge badge-${estadoFinal}">
                    ${formatEstadoCuota(estadoFinal)}
                </span>
            </div>
            
            <div class="cuota-card-body">
                <div class="cuota-monto">
                    <span class="cuota-monto-label">${esPagada ? 'Monto Pagado:' : 'Monto Total:'}</span>
                    <span class="cuota-monto-valor">$${(esPagada ? montoPagado : montoMostrar).toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
                </div>
                
                ${esPagada && (deudaAcumuladaAnterior > 0 || deudaHorasActual > 0) ? `
                    <div class="cuota-desglose" style="background: rgba(76, 175, 80, 0.1); padding: 12px; border-radius: 8px; margin-top: 10px;">
                        <strong style="display: block; margin-bottom: 8px; color: #333; font-size: 13px;">📋 Desglose del pago:</strong>
                        <div style="display: grid; gap: 6px; font-size: 12px; color: #555;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Cuota vivienda:</span>
                                <strong>$${montoCuota.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                            </div>
                            ${deudaAcumuladaAnterior > 0 ? `
                                <div style="display: flex; justify-content: space-between; color: #ff9800;">
                                    <span>+ Deuda acumulada:</span>
                                    <strong>$${deudaAcumuladaAnterior.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                                </div>
                            ` : ''}
                            ${deudaHorasMostrar > 0 ? `
                                <div style="display: flex; justify-content: space-between; color: #f44336;">
                                    <span>+ Deuda horas:</span>
                                    <strong>$${deudaHorasMostrar.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : !esPagada && !tienePagoPendiente && (deudaAcumuladaAnterior > 0 || deudaHorasMostrar > 0) ? `
                    <div class="cuota-desglose">
                        <small style="color: #666;">
                            Cuota: $${montoCuota.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
                            ${deudaAcumuladaAnterior > 0 ? ` + Deuda anterior: $${deudaAcumuladaAnterior.toLocaleString('es-UY', { minimumFractionDigits: 2 })}` : ''}
                            ${deudaHorasMostrar > 0 ? ` + Deuda horas: $${deudaHorasMostrar.toLocaleString('es-UY', { minimumFractionDigits: 2 })}` : ''}
                        </small>
                    </div>
                ` : ''}
                
                <div class="cuota-info-grid">
                    <div class="cuota-info-item">
                        <i class="fas fa-calendar"></i>
                        <span>Vencimiento: ${fechaVencFormatted}</span>
                    </div>
                    <div class="cuota-info-item">
                        <i class="fas fa-clock"></i>
                        <span>Horas: ${cuota.horas_cumplidas || 0}h / ${cuota.horas_requeridas}h</span>
                    </div>
                </div>
                
                ${tienePagoPendiente ? `
                    <div class="alert-info" style="margin-top: 10px;">
                        <i class="fas fa-hourglass-half"></i>
                        <strong>Pago pendiente de validación</strong>
                        <p style="margin: 5px 0 0 0; font-size: 12px;">
                            Enviado el ${new Date(cuota.fecha_pago).toLocaleDateString('es-UY')}
                        </p>
                    </div>
                ` : ''}
                
                ${cuota.estado_pago === 'rechazado' ? `
                    <div class="alert-warning" style="margin-top: 10px;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Pago rechazado</strong>
                        <p style="margin: 5px 0 0 0; font-size: 12px;">Debes volver a realizar el pago</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="cuota-card-footer">
                ${cuota.comprobante_archivo ? `
                    <button class="btn btn-secondary btn-small" onclick="verComprobante('${cuota.comprobante_archivo}')">
                        <i class="fas fa-image"></i> Ver Comprobante
                    </button>
                ` : ''}
                
                ${estadoFinal !== 'pagada' && !tienePagoPendiente ? `
                    <button class="btn btn-primary btn-small" onclick="abrirPagarDeudaTotal(${cuota.id_cuota}, ${montoMostrar})">
                        <i class="fas fa-credit-card"></i> Pagar Ahora
                    </button>
                ` : ''}
                
                ${tienePagoPendiente ? `
                    <button class="btn btn-secondary btn-small" disabled title="Pago en revisión">
                        <i class="fas fa-hourglass-half"></i> En Validación
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// ========== PAGAR DEUDA TOTAL ==========
async function abrirPagarDeudaTotal(cuotaId, montoTotal) {
    ('💳 Abriendo modal para pagar deuda total');
    ('   Cuota ID:', cuotaId);
    ('   Monto total:', montoTotal);

    try {
        const response = await fetch(`/api/cuotas/detalle?cuota_id=${cuotaId}`);
        const data = await response.json();

        if (!data.success) {
            alert('❌ Error al cargar información de la cuota');
            return;
        }

        const cuota = data.cuota;
        const mes = obtenerNombreMes(cuota.mes);
        const montoCuota = parseFloat(cuota.monto);



        document.getElementById('pagar-cuota-id').value = cuotaId;
        document.getElementById('pagar-monto').value = montoTotal;
        document.getElementById('pagarCuotaForm').reset();
        document.getElementById('pagar-cuota-id').value = cuotaId;
        document.getElementById('pagar-monto').value = montoTotal;

        document.getElementById('pagarCuotaModal').style.display = 'flex';

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al cargar información');
    }
}



// ========== CERRAR MODAL PAGO ==========
function closePagarCuotaModal() {
    document.getElementById('pagarCuotaModal').style.display = 'none';
    document.getElementById('pagarCuotaForm').reset();
}

// ========== ENVIAR PAGO ==========
async function submitPagarCuota(event) {
    event.preventDefault();
    ('💾 Enviando pago de cuota con deuda');

    const cuotaId = document.getElementById('pagar-cuota-id').value;
    const monto = document.getElementById('pagar-monto').value;
    const metodo = document.getElementById('pagar-metodo').value;
    const numeroComprobante = document.getElementById('pagar-numero-comprobante').value;
    const archivo = document.getElementById('pagar-comprobante').files[0];

    if (!archivo) {
        alert('⚠️ Debes adjuntar el comprobante de pago');
        return;
    }

    const montoNum = parseFloat(monto);
    const mensaje = deudaHorasActual > 0
        ? `¿Estás seguro de enviar este pago?\n\nMonto total: ${montoNum.toLocaleString('es-UY', { minimumFractionDigits: 2 })}\n\nEsto incluye:\n- Cuota de vivienda\n- Deuda por horas no trabajadas`
        : '¿Estás seguro de enviar este pago?';

    if (!confirm(mensaje)) {
        return;
    }

    const formData = new FormData();
    formData.append('cuota_id', cuotaId);
    formData.append('monto_pagado', monto);
    formData.append('metodo_pago', metodo);
    formData.append('numero_comprobante', numeroComprobante);
    formData.append('comprobante', archivo);


    if (deudaHorasActual > 0) {
        formData.append('incluye_deuda_horas', 'true');
        formData.append('monto_deuda_horas', deudaHorasActual);
    }

    try {
        const response = await fetch('/api/cuotas/pagar', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.mensaje + '\n\nTu pago será revisado por un administrador.');
            closePagarCuotaModal();
            await inicializarSeccionCuotas();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al enviar el pago');
    }
}

// ========== ACTUALIZAR ESTADÍSTICAS ==========
function updateCuotasStats(cuotas) {
    const pendientes = cuotas.filter(c => c.estado === 'pendiente' && c.estado_actual !== 'vencida').length;
    const pagadas = cuotas.filter(c => c.estado === 'pagada').length;
    const vencidas = cuotas.filter(c => c.estado_actual === 'vencida').length;

    const pendientesEl = document.getElementById('cuotas-pendientes-count');
    const pagadasEl = document.getElementById('cuotas-pagadas-count');
    const vencidasEl = document.getElementById('cuotas-vencidas-count');

    if (pendientesEl) pendientesEl.textContent = pendientes;
    if (pagadasEl) pagadasEl.textContent = pagadas;
    if (vencidasEl) vencidasEl.textContent = vencidas;
}

// ========== VER COMPROBANTE ==========
function verComprobante(archivo) {
    window.open(`/files/?path=${archivo}`, '_blank');
}

// ========== VER DETALLE CUOTA INDIVIDUAL ==========
async function verDetalleCuota(cuotaId) {
    try {
        const response = await fetch(`/api/cuotas/detalle?cuota_id=${cuotaId}`);
        const data = await response.json();

        if (!data.success) {
            alert('Error al cargar detalles');
            return;
        }

        const cuota = data.cuota;
        const validacion = data.validacion;
        const mes = obtenerNombreMes(cuota.mes);

        const modal = `
            <div class="modal-detail" onclick="if(event.target.classList.contains('modal-detail')) this.remove()">
                <div class="modal-detail-content">
                    <button onclick="this.closest('.modal-detail').remove()" class="modal-close-button">×</button>
                    
                    <h2 class="modal-detail-header">📋 Detalle de Cuota</h2>
                    
                    <div class="cuota-detalle-completo">
                        <div class="detalle-section">
                            <h3>Información General</h3>
                            <div class="detalle-grid">
                                <div><strong>Período:</strong> ${mes} ${cuota.anio}</div>
                                <div><strong>Estado:</strong> <span class="badge-${cuota.estado}">${formatEstadoCuota(cuota.estado)}</span></div>
                                <div><strong>Monto:</strong> ${parseFloat(cuota.monto).toLocaleString('es-UY', { minimumFractionDigits: 2 })}</div>
                                <div><strong>Vencimiento:</strong> ${new Date(cuota.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-UY')}</div>
                            </div>
                        </div>
                        
                        <div class="detalle-section">
                            <h3>Vivienda</h3>
                            <div class="detalle-grid">
                                <div><strong>Número:</strong> ${cuota.numero_vivienda}</div>
                                <div><strong>Tipo:</strong> ${cuota.tipo_vivienda}</div>
                            </div>
                        </div>
                        
                        <div class="detalle-section">
                            <h3>Horas de Trabajo</h3>
                            <div class="detalle-grid">
                                <div><strong>Requeridas:</strong> ${cuota.horas_requeridas}h</div>
                                <div><strong>Cumplidas:</strong> ${cuota.horas_cumplidas || 0}h</div>
                            </div>
                        </div>
                        
                        ${cuota.observaciones ? `
                            <div class="detalle-section">
                                <h3>Observaciones</h3>
                                <p>${cuota.observaciones}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="modal-detail-footer">
                        <button onclick="this.closest('.modal-detail').remove()" class="btn btn-secondary">Cerrar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);

    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar detalles');
    }
}

// ========== FUNCIONES AUXILIARES ==========
function formatEstadoCuota(estado) {
    const estados = {
        'pendiente': 'Pendiente',
        'pagada': 'Pagada',
        'vencida': 'Vencida',
        'exonerada': 'Exonerada'
    };
    return estados[estado] || estado;
}

function obtenerNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[parseInt(mes) - 1] || mes;
}

// Exportar funciones globales
window.inicializarSeccionCuotas = inicializarSeccionCuotas;
window.loadMisCuotas = loadMisCuotas;
window.abrirPagarDeudaTotal = abrirPagarDeudaTotal;
window.closePagarCuotaModal = closePagarCuotaModal;
window.submitPagarCuota = submitPagarCuota;
window.verDetalleCuota = verDetalleCuota;
window.verComprobante = verComprobante;

(' Módulo de cuotas con deuda de horas cargado completamente');

// ==========================================
// SISTEMA DE PAGO: SOLO ÚLTIMO DÍA DEL MES
// ==========================================

// Función auxiliar: Obtener último día del mes actual
function obtenerUltimoDiaMes() {
    const hoy = new Date();
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    return ultimoDia.getDate();
}

// Función auxiliar: Verificar si es el último día del mes
function esUltimoDiaMes() {
    const hoy = new Date();
    const diaActual = hoy.getDate();
    const ultimoDia = obtenerUltimoDiaMes();

    return diaActual === ultimoDia;
}

// Función auxiliar: Días restantes hasta poder pagar
function diasHastaPago() {
    const hoy = new Date();
    const diaActual = hoy.getDate();
    const ultimoDia = obtenerUltimoDiaMes();

    return ultimoDia - diaActual;
}


window.renderMisCuotasOrganizadas = function (cuotas) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 [RENDER] Iniciando renderizado de cuotas');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const container = document.getElementById('misCuotasContainer');

    if (!cuotas || cuotas.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; margin-bottom: 10px;"></i>
                <p>No se encontraron cuotas con los filtros seleccionados</p>
            </div>
        `;
        return;
    }

    let html = '';

    // ✅ CUOTA DEL MES ACTUAL
    const cuotaMasReciente = cuotas[0];
    console.log('📋 [RENDER] Cuota más reciente:', cuotaMasReciente);

    // 🔥 CRÍTICO: Obtener deuda de horas de la variable global
    const deudaHoras = parseFloat(window.deudaHorasActual || 0);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 [RENDER] DEUDA DE HORAS:');
    console.log('   window.deudaHorasActual:', window.deudaHorasActual);
    console.log('   deudaHoras (parseado):', deudaHoras);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // ✅ CALCULAR MONTO DE CUOTA
    const montoCuota = parseFloat(
        cuotaMasReciente.monto_base ||
        cuotaMasReciente.monto_actual ||
        cuotaMasReciente.monto ||
        0
    );

    // 🔥 DEUDA ACUMULADA DE MESES ANTERIORES
    const deudaAcumuladaAnterior = parseFloat(cuotaMasReciente.monto_pendiente_anterior || 0);

    // ✅ AÑADIR: Monto Base Pendiente (Cuota de vivienda + deuda anterior)
    const montoPendienteBase = montoCuota + deudaAcumuladaAnterior;

    // 🔥 MONTO TOTAL
    const montoTotal = montoPendienteBase + deudaHoras;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 [RENDER] CÁLCULO COMPLETO:');
    console.log('   monto_cuota:', montoCuota);
    console.log('   deuda_meses_anteriores:', deudaAcumuladaAnterior);
    console.log('   deuda_horas_actual:', deudaHoras);
    console.log('   ✅ TOTAL A PAGAR:', montoTotal);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // ⚠️ VALIDACIÓN CRÍTICA
    if (deudaHoras === 0 && window.deudaHorasActual > 0) {
        console.error('❌ [ERROR] deudaHoras es 0 pero window.deudaHorasActual es:', window.deudaHorasActual);
        console.error('   Esto indica un problema en el parseo. Forzando valor...');
        // NO hacer nada aquí, el parseFloat ya debería funcionar
    }

    // ✅ VERIFICAR ESTADOS
    const estadoFinal = cuotaMasReciente.estado_actual || cuotaMasReciente.estado;
    const estadoPago = cuotaMasReciente.estado_pago || '';
    const estadoUsuario = cuotaMasReciente.estado_usuario || '';

    const tienePagoPendiente = cuotaMasReciente.id_pago && estadoPago === 'pendiente';
    const pagoAprobado = estadoUsuario === 'aceptado' || (estadoPago === 'aprobado' && estadoFinal === 'pagada');
    const estaPagada = estadoFinal === 'pagada' || pagoAprobado;

    console.log('🔍 Estados:', {
        estado_final: estadoFinal,
        esta_pagada: estaPagada,
        pago_pendiente: tienePagoPendiente
    });

    // ✅ VERIFICAR PERIODO DE PAGO
    const hoy = new Date();
    const diaActual = hoy.getDate();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    const esMesCuota = cuotaMasReciente.mes == mesActual && cuotaMasReciente.anio == anioActual;
    const estaDentroPeriodoPago = diaActual >= 25;
    const puedePagar = esMesCuota && estaDentroPeriodoPago && !estaPagada && !tienePagoPendiente;

    const diasParaPagar = estaDentroPeriodoPago ? 0 : Math.max(0, 25 - diaActual);

    console.log('📅 Periodo:', {
        dia_actual: diaActual,
        mes_cuota: `${cuotaMasReciente.mes}/${cuotaMasReciente.anio}`,
        mes_actual: `${mesActual}/${anioActual}`,
        es_mes_cuota: esMesCuota,
        puede_pagar: puedePagar,
        dias_para_pagar: diasParaPagar
    });

    // ✅ RENDERIZAR HTML CON DEUDA COMPLETA
    html += `
        <div class="deuda-total-destacada ${estaPagada ? 'pagada-mes' : puedePagar ? '' : 'periodo-bloqueado'}">
            <div class="deuda-total-header">
                <h2 style="margin: 0; color: #fff;">
                    <i class="fas ${estaPagada ? 'fa-check-circle' : puedePagar ? 'fa-exclamation-triangle' : 'fa-calendar-alt'}"></i>
                    Resumen del Mes Actual
                </h2>
                <span class="deuda-total-badge ${estaPagada ? 'badge-pagada' : tienePagoPendiente ? 'badge-pendiente' : puedePagar ? 'badge-requerida' : 'badge-bloqueado'}">
                    ${estaPagada ? '✅ PAGADA' :
            tienePagoPendiente ? '⏳ EN VALIDACIÓN' :
                puedePagar ? '⚠️ PERIODO DE PAGO ABIERTO' :
                    diasParaPagar > 0 ? `🔒 ${diasParaPagar} DÍA${diasParaPagar !== 1 ? 'S' : ''} PARA PAGAR` :
                        '❌ VENCIDA'}
                </span>
            </div>
            
            <div class="deuda-total-body">
                <div class="deuda-breakdown">
                    <!-- 🏠 CUOTA DE VIVIENDA -->
                    <div class="deuda-breakdown-item">
                        <i class="fas fa-home"></i>
                        <div>
                            <span class="deuda-label">Cuota de Vivienda</span>
                            <span class="deuda-monto">$${montoCuota.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    
                  ${deudaAcumuladaAnterior > 0 ? `

        
        <div class="deuda-breakdown-item deuda-acumulada">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <span class="deuda-label">Deuda de Meses Anteriores</span>
                <span class="deuda-monto error">
                    $${deudaAcumuladaAnterior.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
                </span>
                <small style="color: #ff8a80; display: block; margin-top: 5px;">
                    (Cuotas vencidas no pagadas)
                </small>
            </div>
        </div>
    ` : ''}

                    
                    ${deudaHoras > 0 ? `
    <div class="deuda-breakdown-item deuda-horas">
        <i class="fas fa-clock"></i>
        <div>
            <span class="deuda-label">Deuda por Horas No Trabajadas</span>
            <span class="deuda-monto ${deudaHoras > 0 ? 'error' : 'success'}">$${deudaHoras.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
            <small style="color: ${deudaHoras > 0 ? '#ff8a80' : '#81c784'}; display: block; margin-top: 5px;">
                ${deudaHoras > 0 ? '($160 por hora × horas faltantes)' : '¡Sin deuda de horas!'}
            </small>
        </div>
    </div>
` : ''}


                    
                    <div class="deuda-breakdown-divider">=</div>
                    
                    <!-- 💰 TOTAL -->
                    <div class="deuda-breakdown-item deuda-total">
                        <i class="fas fa-calculator"></i>
                        <div>
                            <span class="deuda-label">TOTAL ${estaPagada ? 'PAGADO' : 'A PAGAR'}</span>
                            <span class="deuda-monto-total" style="color: ${estaPagada ? '#4caf50' : '#fff'};">
                                $${montoTotal.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- 📊 ALERTAS Y ACCIONES -->
                ${estaPagada ? `
                    <div class="alert-success" style="margin-top: 20px;">
                        <strong style="color: #4caf50;">🎉 ¡Pago Completado!</strong>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                            Has pagado exitosamente tu cuota de ${obtenerNombreMes(cuotaMasReciente.mes)} ${cuotaMasReciente.anio}.
                            ${cuotaMasReciente.fecha_pago ? `<br>Fecha de pago: ${new Date(cuotaMasReciente.fecha_pago).toLocaleDateString('es-UY')}` : ''}
                            
                            <!-- 📋 DESGLOSE DEL PAGO -->
                            <br><br>
                            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 10px;">
                                <strong style="display: block; margin-bottom: 10px;">📋 Desglose del Pago:</strong>
                                <div style="display: grid; gap: 8px; font-size: 13px;">
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>🏠 Cuota de vivienda:</span>
                                        <strong>$${montoCuota.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                                    </div>
                                    ${deudaAcumuladaAnterior > 0 ? `
                                        <div style="display: flex; justify-content: space-between; color: #ffeb3b;">
                                            <span>⚠️ Deuda de meses anteriores:</span>
                                            <strong>$${deudaAcumuladaAnterior.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                                        </div>
                                    ` : ''}
                                    ${deudaHoras > 0 ? `
                                        <div style="display: flex; justify-content: space-between; color: #ff9800;">
                                            <span>⏰ Deuda por horas del mes:</span>
                                            <strong>$${deudaHoras.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                                        </div>
                                    ` : ''}
                                    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 5px 0;">
                                    <div style="display: flex; justify-content: space-between; font-size: 16px;">
                                        <span><strong>💰 TOTAL PAGADO:</strong></span>
                                        <strong style="color: #4caf50;">$${montoTotal.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                                    </div>
                                </div>
                            </div>
                        </p>
                    </div>
                ` : tienePagoPendiente ? `
                    <div class="alert-info" style="margin-top: 20px; background: rgba(33, 150, 243, 0.2); border-color: rgba(33, 150, 243, 0.4);">
                        <strong style="color: #2196F3;">⏳ Pago en Revisión</strong>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                            Tu pago de $${parseFloat(cuotaMasReciente.monto_pagado || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 })} 
                            está siendo validado por un administrador.
                            ${cuotaMasReciente.fecha_pago ? `<br>Enviado el: ${new Date(cuotaMasReciente.fecha_pago).toLocaleDateString('es-UY')}` : ''}
                        </p>
                    </div>
                ` : puedePagar ? `
                    <div class="deuda-total-actions">
                        <button class="btn-pagar-deuda-total" onclick="abrirPagarDeudaTotal(${cuotaMasReciente.id_cuota}, ${montoTotal})">
                            <i class="fas fa-credit-card"></i>
                            Pagar Ahora
                        </button>
                    </div>
                    
                    <div class="alert-success" style="margin-top: 20px; background: rgba(76, 175, 80, 0.15); border-color: rgba(76, 175, 80, 0.3);">
                        <strong style="color: #4caf50;">✓ Periodo de Pago Habilitado</strong>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                            Ya puedes realizar el pago de tu cuota. El periodo de pago está activo hasta fin de mes.
                            ${deudaAcumuladaAnterior > 0 ? `<br><br><strong>⚠️ Importante:</strong> Tienes $${deudaAcumuladaAnterior.toLocaleString('es-UY', { minimumFractionDigits: 2 })} de deuda acumulada de meses anteriores que se incluye en el pago.` : ''}
                        </p>
                    </div>
                ` : diasParaPagar > 0 ? `
                    <div class="deuda-total-actions">
                        <button class="btn-pagar-deuda-total" disabled style="opacity: 0.5; cursor: not-allowed;">
                            <i class="fas fa-lock"></i>
                            Pago Bloqueado
                        </button>
                    </div>
                    
                    <div class="alert-warning" style="margin-top: 20px; background: rgba(255, 152, 0, 0.15); border-color: rgba(255, 152, 0, 0.3);">
                        <strong style="color: #ff9800;">🔒 Periodo de Trabajo en Curso</strong>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                            El periodo de pago se habilitará en <strong>${diasParaPagar} día${diasParaPagar !== 1 ? 's' : ''}</strong> (desde el 25 del mes).
                            <br>Por ahora, enfócate en cumplir tus <strong>84 horas mensuales</strong> (21h/semana) para evitar cargos adicionales.
                            ${deudaAcumuladaAnterior > 0 ? `<br><br><strong>⚠️ Atención:</strong> Tienes $${deudaAcumuladaAnterior.toLocaleString('es-UY', { minimumFractionDigits: 2 })} de deuda acumulada que se sumará al pago.` : ''}
                        </p>
                    </div>
                ` : `
                    <div class="alert-error" style="margin-top: 20px;">
                        <strong style="color: #f44336;">❌ Cuota Vencida</strong>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                            Esta cuota no fue pagada a tiempo. La deuda se acumulará al siguiente mes.
                        </p>
                    </div>
                `}
            </div>
        </div>
        
        <hr style="margin: 40px 0; border: none; border-top: 2px solid #e0e0e0;">
    `;

    // Separar cuotas para las secciones restantes
    const cuotasPagables = cuotas.filter(c => {
        const estadoFinal = c.estado_actual || c.estado;
        return estadoFinal !== 'pagada';
    });

    const cuotasHistorial = cuotas.filter(c => {
        const estadoFinal = c.estado_actual || c.estado;
        return estadoFinal === 'pagada';
    });

    // SECCIÓN: CUOTAS PENDIENTES (SI HAY MÁS DE UNA)
    if (cuotasPagables.length > 1) {
        html += `
            <div class="cuotas-section">
                <h3 style="color: #f44336; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-circle"></i> <span data-i18n="dashboardUser.billing.pending.title">Otras Cuotas Pendientes</span> (${cuotasPagables.length - 1})
                </h3>
                <div class="cuotas-grid">
        `;

        cuotasPagables.slice(1).forEach(cuota => {
            html += renderCuotaCard(cuota);
        });

        html += `
                </div>
            </div>
            <hr style="margin: 40px 0; border: none; border-top: 2px solid #e0e0e0;">
        `;
    }

    // SECCIÓN: HISTORIAL
    html += `
        <div class="cuotas-section">
            <h3 style="color: #666; margin-bottom: 20px;">
                <i class="fas fa-history"></i> <span data-i18n="dashboardUser.billing.history.title">Historial de Cuotas</span>
            </h3>
    `;

    if (cuotasHistorial.length > 0) {
        html += '<div class="cuotas-grid">';
        cuotasHistorial.forEach(cuota => {
            html += renderCuotaCard(cuota);
        });
        html += '</div>';
    } else {
        html += '<p style="color: #999; text-align: center;">No hay cuotas en el historial</p>';
    }

    html += '</div>';


    container.innerHTML = html;
};

/**
 * ✅ Función auxiliar: Obtener nombre del mes
 */
if (typeof obtenerNombreMes !== 'function') {
    window.obtenerNombreMes = function (mes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[parseInt(mes) - 1] || mes;
    };
}

console.log('✅ Fix de renderizado completo aplicado');
console.log('📊 Ahora se muestra:');
console.log('   ✓ Cuota de vivienda');
console.log('   ✓ Deuda de meses anteriores (si existe)');
console.log('   ✓ Deuda por horas del mes actual');
console.log('   ✓ Total correcto');


// Exportar funciones
window.esUltimoDiaMes = esUltimoDiaMes;
window.diasHastaPago = diasHastaPago;
window.obtenerUltimoDiaMes = obtenerUltimoDiaMes;

(' Sistema actualizado: Pago solo último día del mes');

// ========== MODAL DE PAGO  ==========

async function abrirPagarDeudaTotal(cuotaId, montoTotal) {
    ('💳 Abriendo modal para pagar deuda total');
    ('   Cuota ID:', cuotaId);
    ('   Monto total:', montoTotal);

    try {
        const response = await fetch(`/api/cuotas/detalle?cuota_id=${cuotaId}`);
        const data = await response.json();

        if (!data.success) {
            alert('❌ Error al cargar información de la cuota');
            return;
        }

        const cuota = data.cuota;
        const mes = obtenerNombreMes(cuota.mes);
        const montoCuota = parseFloat(cuota.monto);



        document.getElementById('pagar-cuota-id').value = cuotaId;
        document.getElementById('pagar-monto').value = montoTotal;
        document.getElementById('pagarCuotaForm').reset();
        document.getElementById('pagar-cuota-id').value = cuotaId;
        document.getElementById('pagar-monto').value = montoTotal;

        //  OCULTAR selector de método 
        const metodoSelect = document.getElementById('pagar-metodo');
        if (metodoSelect) {
            metodoSelect.value = 'transferencia';
            metodoSelect.disabled = true;
            metodoSelect.style.display = 'none';

            // Agregar texto informativo
            const metodoLabel = metodoSelect.previousElementSibling;
            if (metodoLabel) {
                metodoLabel.innerHTML = `
                    <i class="fas fa-university"></i> Método de Pago: <strong>Transferencia Bancaria</strong>
                `;
            }
        }

        document.getElementById('pagarCuotaModal').style.display = 'flex';

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al cargar información');
    }
}

// ========== ENVIAR PAGO ==========

async function submitPagarCuota(event) {
    event.preventDefault();
    ('💾 Enviando pago de cuota (SOLO TRANSFERENCIA)');

    const cuotaId = document.getElementById('pagar-cuota-id').value;
    const monto = document.getElementById('pagar-monto').value;
    const numeroComprobante = document.getElementById('pagar-numero-comprobante').value;
    const archivo = document.getElementById('pagar-comprobante').files[0];

    if (!archivo) {
        alert('⚠️ Debes adjuntar el comprobante de pago');
        return;
    }

    const montoNum = parseFloat(monto);
    const mensaje = deudaHorasActual > 0
        ? `¿Estás seguro de enviar este pago?\n\nMonto total: ${montoNum.toLocaleString('es-UY', { minimumFractionDigits: 2 })}\n\nEsto incluye:\n- Cuota de vivienda\n- Deuda por horas no trabajadas\n\nMétodo: Transferencia Bancaria`
        : `¿Estás seguro de enviar este pago?\n\nMonto: ${montoNum.toLocaleString('es-UY', { minimumFractionDigits: 2 })}\n\nMétodo: Transferencia Bancaria`;

    if (!confirm(mensaje)) {
        return;
    }

    const formData = new FormData();
    formData.append('cuota_id', cuotaId);
    formData.append('monto_pagado', monto);
    formData.append('metodo_pago', 'transferencia'); // ⭐ FORZAR transferencia
    formData.append('numero_comprobante', numeroComprobante);
    formData.append('comprobante', archivo);

    // Agregar flag si incluye deuda de horas
    if (deudaHorasActual > 0) {
        formData.append('incluye_deuda_horas', 'true');
        formData.append('monto_deuda_horas', deudaHorasActual);
    }

    try {
        const response = await fetch('/api/cuotas/pagar', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.mensaje + '\n\nTu pago por transferencia será revisado por un administrador.');
            closePagarCuotaModal();
            await inicializarSeccionCuotas();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al enviar el pago');
    }
}


// ========== FUNCIÓN AUXILIAR: OBTENER NOMBRE DEL MES ==========

function obtenerNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[parseInt(mes) - 1] || mes;
}


// Mostrar nombre del archivo seleccionado
document.getElementById('pagar-comprobante')?.addEventListener('change', function (e) {
    const fileName = e.target.files[0]?.name || '';
    const fileNameDisplay = document.getElementById('file-name');
    if (fileNameDisplay) {
        if (fileName) {
            fileNameDisplay.textContent = '📎 Archivo seleccionado: ' + fileName;
            fileNameDisplay.style.color = '#4caf50';
        } else {
            fileNameDisplay.textContent = '';
        }
    }
});

// Exportar funciones
window.cargarDeudaHorasWidget = cargarDeudaHorasWidget;
window.abrirPagarDeudaTotal = abrirPagarDeudaTotal;
window.submitPagarCuota = submitPagarCuota;

(' Sistema actualizado: 21h semanales (84h mensuales) + Solo Transferencia');

// ==========================================
// SISTEMA DE SOLICITUDES 
// ==========================================

('🟢 Cargando módulo de solicitudes');

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function () {
    const solicitudesMenuItem = document.querySelector('.menu li[data-section="solicitudes"]');
    if (solicitudesMenuItem) {
        solicitudesMenuItem.addEventListener('click', function () {
            ('>>> Sección solicitudes abierta');
            loadMisSolicitudes();
        });
    }
});

// ========== CARGAR MIS SOLICITUDES ==========
async function loadMisSolicitudes() {
    const container = document.getElementById('misSolicitudesContainer');
    if (!container) {
        console.warn('⚠️ Container no encontrado');
        return;
    }

    container.innerHTML = '<p class="loading">Cargando solicitudes...</p>';

    try {
        const estado = document.getElementById('filtro-estado-solicitudes')?.value || '';
        const tipo = document.getElementById('filtro-tipo-solicitudes')?.value || '';

        let url = '/api/solicitudes/mis-solicitudes?';
        if (estado) url += `estado=${estado}&`;
        if (tipo) url += `tipo=${tipo}&`;

        ('📡 Fetching:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });

        const data = await response.json();
        ('📥 Solicitudes recibidas:', data);

        if (data.success) {
            renderMisSolicitudes(data.solicitudes);
            updateSolicitudesStats(data.solicitudes);
        } else {
            container.innerHTML = '<p class="error">Error al cargar solicitudes</p>';
        }

    } catch (error) {
        console.error('❌ Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== RENDERIZAR SOLICITUDES ==========
function renderMisSolicitudes(solicitudes) {
    const container = document.getElementById('misSolicitudesContainer');

    if (!solicitudes || solicitudes.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; margin-bottom: 10px;"></i>
                <p data-i18n="dashboardUser.requests.noRequests">No tienes solicitudes registradas</p>
                <button class="btn btn-primary" onclick="abrirModalNuevaSolicitud()">
                    <i class="fas fa-plus"></i> <span data-i18n="dashboardUser.requests.newRequest">Nueva Solicitud</span>
                </button>
            </div>
        `;
        i18n.translatePage();
        return;
    }

    let html = '<div class="solicitudes-grid">';

    solicitudes.forEach(sol => {
        const fecha = new Date(sol.fecha_creacion).toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        html += `
            <div class="solicitud-card estado-${sol.estado} prioridad-${sol.prioridad}">
                <div class="solicitud-header">
                    <div>
                        <h4>${sol.asunto}</h4>
                        <span class="solicitud-tipo">${formatTipoSolicitud(sol.tipo_solicitud)}</span>
                    </div>
                    <div class="solicitud-badges">
                        <span class="badge badge-${sol.estado}">${formatEstado(sol.estado)}</span>
                        <span class="badge badge-prioridad-${sol.prioridad}">${formatPrioridad(sol.prioridad)}</span>
                    </div>
                </div>

                <div class="solicitud-body">
                    <p class="solicitud-descripcion">${truncarTexto(sol.descripcion, 150)}</p>
                    
                    <div class="solicitud-meta">
                        <span><i class="fas fa-calendar"></i> ${fecha}</span>
                        <span><i class="fas fa-comments"></i> ${sol.total_respuestas || 0} respuesta(s)</span>
                    </div>
                </div>

                <div class="solicitud-footer">
                    <button class="btn btn-secondary btn-small" onclick="verDetalleSolicitud(${sol.id_solicitud})">
                        <i class="fas fa-eye"></i> Ver Detalle
                    </button>
                    ${sol.estado !== 'resuelta' && sol.estado !== 'rechazada' ? `
                        <button class="btn btn-primary btn-small" onclick="responderSolicitud(${sol.id_solicitud})">
                            <i class="fas fa-reply"></i> Responder
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// ========== ACTUALIZAR ESTADÍSTICAS ==========
function updateSolicitudesStats(solicitudes) {
    const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
    const enRevision = solicitudes.filter(s => s.estado === 'en_revision').length;
    const resueltas = solicitudes.filter(s => s.estado === 'resuelta').length;

    const pendientesEl = document.getElementById('solicitudes-pendientes-count');
    const revisionEl = document.getElementById('solicitudes-revision-count');
    const resueltasEl = document.getElementById('solicitudes-resueltas-count');

    if (pendientesEl) pendientesEl.textContent = pendientes;
    if (revisionEl) revisionEl.textContent = enRevision;
    if (resueltasEl) resueltasEl.textContent = resueltas;
}

// ========== ABRIR MODAL NUEVA SOLICITUD ==========
function abrirModalNuevaSolicitud() {
    const modal = `
        <div id="nuevaSolicitudModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modalNuevaSolicitudTitulo">
  <div class="modal-content-large">
    
    <!-- Botón de cierre -->
    <button type="button" class="modal-close-btn" aria-label="Cerrar modal" onclick="cerrarModalNuevaSolicitud()">×</button>

    <!-- Título -->
    <h2 id="modalNuevaSolicitudTitulo" class="modal-title">
      <i class="fas fa-paper-plane"></i>
      <span data-i18n="dashboardUser.requests.newRequest">Nueva Solicitud</span>
    </h2>

    <!-- Formulario -->
    <form id="nuevaSolicitudForm" onsubmit="submitNuevaSolicitud(event)" enctype="multipart/form-data">

      <!-- Tipo de Solicitud -->
      <div class="form-group">
        <label for="tipo-solicitud">
          <i class="fas fa-tag"></i>
          <span data-i18n="dashboardUser.requests.form.typeLabel">Tipo de Solicitud</span> *
        </label>
        <select id="tipo-solicitud" name="tipo_solicitud" required>
          <option value="horas" data-i18n="dashboardUser.requests.form.types.hours">📊 Registro de Horas</option>
          <option value="pago" data-i18n="dashboardUser.requests.form.types.payment">💳 Pagos/Cuotas</option>
          <option value="vivienda" data-i18n="dashboardUser.requests.form.types.housing">🏡 Vivienda</option>
          <option value="general" data-i18n="dashboardUser.requests.form.types.general">📝 Consulta General</option>
          <option value="otro" data-i18n="dashboardUser.requests.form.types.other">❓ Otro</option>
        </select>
      </div>

      <!-- Asunto -->
      <div class="form-group">
        <label for="asunto-solicitud">
          <i class="fas fa-heading"></i>
          <span data-i18n="dashboardUser.requests.form.subjectLabel">Asunto</span> *
        </label>
        <input
          type="text"
          id="asunto-solicitud"
          name="asunto"
          placeholder="Ej: Justificación de horas - Certificado médico"
          maxlength="255"
          data-i18n-placeholder="dashboardUser.requests.form.subjectPlaceholder"
          required>
      </div>

      <!-- Descripción -->
      <div class="form-group">
        <label for="descripcion-solicitud">
          <i class="fas fa-align-left"></i>
          <span data-i18n="dashboardUser.requests.form.descriptionLabel">Descripción</span> *
        </label>
        <textarea
          id="descripcion-solicitud"
          name="descripcion"
          rows="6"
          data-i18n-placeholder="dashboardUser.requests.form.descriptionPlaceholder"
          required></textarea>
      </div>

      <!-- Prioridad -->
      <div class="form-group">
        <label for="prioridad-solicitud">
          <i class="fas fa-exclamation-circle"></i>
          <span data-i18n="dashboardUser.requests.form.priorityLabel">Prioridad</span> *
        </label>
        <select id="prioridad-solicitud" name="prioridad" required>
          <option value="baja" data-i18n="dashboardUser.requests.form.priority.low">Baja</option>
          <option value="media" selected data-i18n="dashboardUser.requests.form.priority.medium">Media</option>
          <option value="alta" data-i18n="dashboardUser.requests.form.priority.high">Alta</option>
        </select>
        <small class="form-help" data-i18n="dashboardUser.requests.form.priorityUrgentHelp">
          Selecciona "Alta" solo si es urgente
        </small>
      </div>

      <!-- Archivo adjunto -->
      <div class="form-group">
        <label for="archivo-solicitud">
          <i class="fas fa-paperclip"></i>
          <span data-i18n="dashboardUser.requests.form.attachmentLabel">Archivo Adjunto (Opcional)</span>
        </label>
        <input
          type="file"
          id="archivo-solicitud"
          name="archivo"
          accept="image/*,.pdf"
        <small class="form-help" data-i18n="dashboardUser.requests.form.attachmentHelp">
          Puedes adjuntar certificados, comprobantes, etc. (máx. 5MB)
        </small>
      </div>

      <!-- Información -->
      <div class="alert-info">
        <strong>ℹ️ <span data-i18n="dashboardUser.requests.form.infoTitle">Información:</span></strong>
        <p data-i18n="dashboardUser.requests.form.infoText">
          Tu solicitud será revisada por un administrador. Recibirás una notificación cuando haya novedades.
        </p>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="cerrarModalNuevaSolicitud()">
          <i class="fas fa-times"></i>
          <span data-i18n="common.cancel">Cancelar</span>
        </button>
        <button type="submit" class="btn btn-primary" id="btn-submit-solicitud">
          <i class="fas fa-paper-plane"></i>
          <span data-i18n="dashboardUser.requests.form.submitButton">Enviar Solicitud</span>
        </button>
      </div>

    </form>
  </div>
</div>

    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    i18n.translatePage();
}

function cerrarModalNuevaSolicitud() {
    const modal = document.getElementById('nuevaSolicitudModal');
    if (modal) modal.remove();
}

// ========== ENVIAR NUEVA SOLICITUD ==========
async function submitNuevaSolicitud(event) {
    event.preventDefault();
    ('📤 Iniciando envío de solicitud');

    const form = document.getElementById('nuevaSolicitudForm');
    const submitBtn = document.getElementById('btn-submit-solicitud');
    const btnHTML = submitBtn.innerHTML;

    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
        //  CREAR FormData CORRECTAMENTE
        const formData = new FormData(form);

        // 📋 DEBUG: Verificar contenido
        ('📋 FormData contenido:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                (`  ${key}: [File] ${value.name} (${value.size} bytes)`);
            } else {
                (`  ${key}: ${value}`);
            }
        }


        const response = await fetch('/api/solicitudes/create', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        ('📡 Response status:', response.status);

        // Leer respuesta como texto primero
        const responseText = await response.text();
        ('📥 Response text:', responseText.substring(0, 500));

        // Intentar parsear JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ Error parsing JSON:', parseError);
            console.error('❌ Response completo:', responseText);
            throw new Error('El servidor devolvió HTML en lugar de JSON. Revisa los logs de PHP.');
        }

        (' Data parseada:', data);

        if (data.success) {
            alert(' ' + data.message);
            cerrarModalNuevaSolicitud();
            loadMisSolicitudes();
        } else {
            alert('❌ ' + data.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnHTML;
        }

    } catch (error) {
        console.error('❌ Error completo:', error);
        console.error('❌ Stack:', error.stack);
        alert('❌ Error de conexión: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnHTML;
    }
}

// ========== VER DETALLE ==========
async function verDetalleSolicitud(solicitudId) {
    try {
        const response = await fetch(`/api/solicitudes/detalle?id_solicitud=${solicitudId}`);
        const data = await response.json();

        if (!data.success) {
            alert('Error al cargar detalle');
            return;
        }

        const solicitud = data.solicitud;
        const respuestas = data.respuestas || [];

        const fecha = new Date(solicitud.fecha_creacion).toLocaleString('es-UY');

        const modal = `
            <div class="modal-detail" onclick="if(event.target.classList.contains('modal-detail')) this.remove()">
                <div class="modal-detail-content" style="max-width: 800px;">
                    <button onclick="this.closest('.modal-detail').remove()" class="modal-close-button">×</button>
                    
                    <h2 class="modal-detail-header">
                        <i class="fas fa-file-alt"></i> ${solicitud.asunto}
                    </h2>

                    <div class="modal-detail-section">
                        <div class="detalle-grid">
                            <div><strong>Tipo:</strong> ${formatTipoSolicitud(solicitud.tipo_solicitud)}</div>
                            <div><strong>Estado:</strong> <span class="badge badge-${solicitud.estado}">${formatEstado(solicitud.estado)}</span></div>
                            <div><strong>Prioridad:</strong> <span class="badge badge-prioridad-${solicitud.prioridad}">${formatPrioridad(solicitud.prioridad)}</span></div>
                            <div><strong>Fecha:</strong> ${fecha}</div>
                        </div>
                    </div>

                    <div class="modal-detail-section">
                        <h3>Descripción</h3>
                        <p style="white-space: pre-wrap;">${solicitud.descripcion}</p>
                        ${solicitud.archivo_adjunto ? `
                            <a href="/files/?path=${solicitud.archivo_adjunto}" target="_blank" class="btn btn-secondary btn-small">
                                <i class="fas fa-paperclip"></i> Ver Archivo Adjunto
                            </a>
                        ` : ''}
                    </div>

                    ${respuestas.length > 0 ? `
                        <div class="modal-detail-section">
                            <h3><i class="fas fa-comments"></i> Conversación (${respuestas.length})</h3>
                            <div class="respuestas-thread">
                                ${respuestas.map(resp => {
            const fechaResp = new Date(resp.fecha_respuesta).toLocaleString('es-UY');
            return `
                                        <div class="respuesta-item ${resp.es_admin ? 'respuesta-admin' : 'respuesta-usuario'}">
                                            <div class="respuesta-header">
                                                <strong>
                                                    ${resp.es_admin ? '👨‍💼 Administrador' : '👤 ' + resp.nombre_completo}
                                                </strong>
                                                <span class="respuesta-fecha">${fechaResp}</span>
                                            </div>
                                            <div class="respuesta-body">
                                                <p style="white-space: pre-wrap;">${resp.mensaje}</p>
                                                ${resp.archivo_adjunto ? `
                                                    <a href="/files/?path=${resp.archivo_adjunto}" target="_blank" class="file-link">
                                                        <i class="fas fa-paperclip"></i> Ver Archivo
                                                    </a>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
        }).join('')}
                            </div>
                        </div>
                    ` : '<p style="text-align: center; color: #999;">Sin respuestas aún</p>'}

                    <div class="modal-detail-footer">
                        <button onclick="this.closest('.modal-detail').remove()" class="btn btn-secondary">Cerrar</button>
                        ${solicitud.estado !== 'resuelta' && solicitud.estado !== 'rechazada' ? `
                            <button onclick="this.closest('.modal-detail').remove(); responderSolicitud(${solicitudId})" class="btn btn-primary">
                                <i class="fas fa-reply"></i> Responder
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);

    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar detalle');
    }
}

// ========== RESPONDER SOLICITUD ==========
function responderSolicitud(solicitudId) {
    const modal = `
        <div id="responderSolicitudModal" class="modal-overlay">
            <div class="modal-content-large">
                <button class="modal-close-btn" onclick="cerrarModalResponder()">×</button>
                
                <h2 class="modal-title">
                    <i class="fas fa-reply"></i> Responder Solicitud
                </h2>

                <form id="responderSolicitudForm" onsubmit="submitRespuesta(event, ${solicitudId})" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="mensaje-respuesta">
                            <i class="fas fa-comment"></i> Mensaje *
                        </label>
                        <textarea 
                            id="mensaje-respuesta" 
                            name="mensaje"
                            rows="6"
                            placeholder="Escribe tu respuesta o información adicional..."
                            required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="archivo-respuesta">
                            <i class="fas fa-paperclip"></i> Archivo Adjunto (Opcional)
                        </label>
                        <input 
                            type="file" 
                            id="archivo-respuesta" 
                            name="archivo"
                            accept="image/*,.pdf">
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="cerrarModalResponder()">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Enviar Respuesta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

function cerrarModalResponder() {
    const modal = document.getElementById('responderSolicitudModal');
    if (modal) modal.remove();
}

async function submitRespuesta(event, solicitudId) {
    event.preventDefault();

    const form = document.getElementById('responderSolicitudForm');
    const formData = new FormData(form);
    formData.append('id_solicitud', solicitudId);

    const submitBtn = form.querySelector('button[type="submit"]');
    const btnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
        const response = await fetch('/api/solicitudes/responder', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.message);
            cerrarModalResponder();
            loadMisSolicitudes();
        } else {
            alert('❌ ' + data.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnHTML;
        }

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnHTML;
    }
}

// ========== FUNCIONES AUXILIARES ==========
function formatTipoSolicitud(tipo) {
    const tipos = {
        'horas': '📊 Registro de Horas',
        'pago': '💳 Pagos/Cuotas',
        'vivienda': '🏡 Vivienda',
        'general': '📝 Consulta General',
        'otro': '❓ Otro'
    };
    return tipos[tipo] || tipo;
}

function formatEstado(estado) {
    const estados = {
        'pendiente': 'Pendiente',
        'en_revision': 'En Revisión',
        'resuelta': 'Resuelta',
        'rechazada': 'Rechazada'
    };
    return estados[estado] || estado;
}

function formatPrioridad(prioridad) {
    const prioridades = {
        'baja': 'Baja',
        'media': 'Media',
        'alta': 'Alta'
    };
    return prioridades[prioridad] || prioridad;
}

function truncarTexto(texto, maxLength) {
    if (!texto || texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
}

// Exportar funciones globales
window.loadMisSolicitudes = loadMisSolicitudes;
window.abrirModalNuevaSolicitud = abrirModalNuevaSolicitud;
window.cerrarModalNuevaSolicitud = cerrarModalNuevaSolicitud;
window.submitNuevaSolicitud = submitNuevaSolicitud;
window.verDetalleSolicitud = verDetalleSolicitud;
window.responderSolicitud = responderSolicitud;
window.cerrarModalResponder = cerrarModalResponder;
window.submitRespuesta = submitRespuesta;

(' Módulo de solicitudes cargado completamente');

// ==========================================
// JUSTIFICACIONES DE HORAS - VISTA USUARIO
// ==========================================

/**
 * Cargar justificaciones del usuario en el widget de deuda
 */
async function cargarJustificacionesUsuario() {
    const container = document.getElementById('justificaciones-usuario-container');
    if (!container) {
        ('⚠️ Container de justificaciones no encontrado');
        return;
    }

    container.innerHTML = '<p class="loading">Cargando justificaciones...</p>';

    try {
        const hoy = new Date();
        const mes = hoy.getMonth() + 1;
        const anio = hoy.getFullYear();

        // Obtener ID del usuario desde sesión
        const profileResponse = await fetch('/api/users/my-profile');
        const profileData = await profileResponse.json();

        if (!profileData.success) {
            throw new Error('No se pudo obtener el perfil del usuario');
        }

        const userId = profileData.user.id_usuario;

        // Obtener justificaciones del mes actual
        const response = await fetch(`/api/justificaciones/usuario?id_usuario=${userId}&mes=${mes}&anio=${anio}`);
        const data = await response.json();

        ('📋 Justificaciones recibidas:', data);

        if (data.success && data.justificaciones) {
            renderJustificacionesUsuario(data.justificaciones);
        } else {
            container.innerHTML = '<p style="color: #999; font-size: 12px;">No hay justificaciones este mes</p>';
        }

    } catch (error) {
        console.error('❌ Error al cargar justificaciones:', error);
        container.innerHTML = '<p style="color: #f44336; font-size: 12px;">Error al cargar justificaciones</p>';
    }
}

/**
 * Renderizar justificaciones en formato compacto
 */
function renderJustificacionesUsuario(justificaciones) {
    const container = document.getElementById('justificaciones-usuario-container');

    if (!justificaciones || justificaciones.length === 0) {
        container.innerHTML = '<p style="color: #999; font-size: 12px; text-align: center;">No tienes justificaciones este mes</p>';
        return;
    }

    const totalJustificado = justificaciones.reduce((sum, j) => sum + parseFloat(j.horas_justificadas), 0);
    const totalDescontado = justificaciones.reduce((sum, j) => sum + parseFloat(j.monto_descontado), 0);

    let html = `
        <div class="justificaciones-widget">
            <div class="justificaciones-header">
                <h4 style="margin: 0; color: #4caf50; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-check-circle"></i>
                    Horas Justificadas
                </h4>
                <div class="justificaciones-totales">
                    <span class="total-horas">${totalJustificado.toFixed(1)}h</span>
                    <span class="total-descuento">-$${totalDescontado.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="justificaciones-lista">
    `;

    justificaciones.forEach((just, index) => {
        const fecha = new Date(just.fecha_justificacion).toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit'
        });

        html += `
            <div class="justificacion-item">
                <div class="justificacion-info">
                    <div class="justificacion-icon">
                        <i class="fas fa-clipboard-check"></i>
                    </div>
                    <div class="justificacion-detalles">
                        <strong style="color: #333; font-size: 13px;">
                            ${just.horas_justificadas}h × $160 = $${parseFloat(just.monto_descontado).toFixed(2)}
                        </strong>
                        <p style="margin: 3px 0 0 0; font-size: 11px; color: #666;">
                            ${truncarTexto(just.motivo, 50)}
                        </p>
                        <small style="color: #999; font-size: 10px;">
                            <i class="fas fa-calendar"></i> ${fecha}
                            ${just.admin_nombre ? `· Por ${just.admin_nombre}` : ''}
                        </small>
                    </div>
                </div>
                ${just.archivo_adjunto ? `
                    <button class="btn-ver-archivo" onclick="verArchivoJustificacion('${just.archivo_adjunto}')" title="Ver archivo">
                        <i class="fas fa-paperclip"></i>
                    </button>
                ` : ''}
            </div>
        `;
    });

    html += `
            </div>
            
            <button class="btn-ver-todas-justificaciones" onclick="verTodasJustificaciones()">
                <i class="fas fa-list"></i> Ver Historial Completo
            </button>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Ver archivo adjunto de justificación
 */
function verArchivoJustificacion(archivo) {
    window.open(`/files/?path=${archivo}`, '_blank');
}

/**
 * Ver todas las justificaciones (historial completo)
 */
async function verTodasJustificaciones() {
    try {
        const profileResponse = await fetch('/api/users/my-profile');
        const profileData = await profileResponse.json();

        if (!profileData.success) {
            throw new Error('No se pudo obtener el perfil');
        }

        const userId = profileData.user.id_usuario;

        // Obtener TODAS las justificaciones (sin filtrar por mes)
        const response = await fetch(`/api/justificaciones/usuario?id_usuario=${userId}`);
        const data = await response.json();

        if (!data.success) {
            alert('❌ Error al cargar historial');
            return;
        }

        mostrarModalHistorialJustificaciones(data.justificaciones || []);

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
    }
}

/**
 * Modal con historial completo de justificaciones
 */
function mostrarModalHistorialJustificaciones(justificaciones) {
    if (!justificaciones || justificaciones.length === 0) {
        alert('ℹ️ No tienes justificaciones registradas');
        return;
    }

    // Agrupar por mes/año
    const porPeriodo = {};
    justificaciones.forEach(j => {
        const key = `${j.anio}-${String(j.mes).padStart(2, '0')}`;
        if (!porPeriodo[key]) {
            porPeriodo[key] = {
                mes: j.mes,
                anio: j.anio,
                justificaciones: [],
                totalHoras: 0,
                totalDescuento: 0
            };
        }
        porPeriodo[key].justificaciones.push(j);
        porPeriodo[key].totalHoras += parseFloat(j.horas_justificadas);
        porPeriodo[key].totalDescuento += parseFloat(j.monto_descontado);
    });

    // Ordenar por período (más reciente primero)
    const periodos = Object.values(porPeriodo).sort((a, b) => {
        if (a.anio !== b.anio) return b.anio - a.anio;
        return b.mes - a.mes;
    });

    let html = '';

    periodos.forEach(periodo => {
        const nombreMes = obtenerNombreMes(periodo.mes);

        html += `
            <div class="periodo-justificaciones">
                <div class="periodo-header">
                    <h4>${nombreMes} ${periodo.anio}</h4>
                    <div class="periodo-totales">
                        <span class="total-horas-periodo">${periodo.totalHoras.toFixed(1)}h</span>
                        <span class="total-descuento-periodo">-$${periodo.totalDescuento.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="justificaciones-del-periodo">
        `;

        periodo.justificaciones.forEach(just => {
            const fecha = new Date(just.fecha_justificacion).toLocaleDateString('es-UY', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            html += `
                <div class="justificacion-detalle-item">
                    <div class="justificacion-encabezado">
                        <i class="fas fa-check-circle" style="color: #4caf50;"></i>
                        <strong>${just.horas_justificadas}h justificadas</strong>
                        <span class="descuento-tag">-$${parseFloat(just.monto_descontado).toFixed(2)}</span>
                    </div>
                    
                    <div class="justificacion-cuerpo">
                        <p><strong>Motivo:</strong> ${just.motivo}</p>
                        ${just.observaciones ? `<p><strong>Observaciones:</strong> ${just.observaciones}</p>` : ''}
                        <p style="font-size: 12px; color: #666;">
                            <i class="fas fa-calendar"></i> ${fecha}
                            ${just.admin_nombre ? `· Aprobado por: ${just.admin_nombre}` : ''}
                        </p>
                        ${just.archivo_adjunto ? `
                            <a href="/files/?path=${just.archivo_adjunto}" target="_blank" class="btn btn-secondary btn-small">
                                <i class="fas fa-paperclip"></i> Ver Archivo
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    const modal = `
        <div class="modal-detail" onclick="if(event.target.classList.contains('modal-detail')) this.remove()">
            <div class="modal-detail-content" style="max-width: 900px;">
                <button onclick="this.closest('.modal-detail').remove()" class="modal-close-button">×</button>
                
                <h2 class="modal-detail-header">
                    <i class="fas fa-history"></i> Historial de Justificaciones
                </h2>
                
                <div class="modal-detail-section">
                    <div class="alert-info">
                        <strong>ℹ️ Información:</strong>
                        <p>Aquí puedes ver todas las horas que han sido justificadas y descontadas de tu deuda mensual.</p>
                        <p>Tarifa: <strong>$160 por hora</strong> · Sistema: <strong>21h semanales (84h mensuales)</strong></p>
                    </div>
                </div>
                
                ${html}
                
                <div class="modal-detail-footer">
                    <button onclick="this.closest('.modal-detail').remove()" class="btn btn-secondary">Cerrar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

function renderDeudaHorasWidget(deuda) {
    const container = document.getElementById('deuda-actual-container');

    const estado = deuda.estado || 'pendiente';
    const colorEstado = estado === 'cumplido' ? 'success' :
        estado === 'progreso' ? 'warning' : 'error';

    const deudaMesActual = parseFloat(deuda.deuda_en_pesos || 0);
    const deudaAcumulada = parseFloat(deuda.deuda_acumulada || 0);
    const totalAPagar = deudaMesActual + deudaAcumulada;  // ✅ SUMA CORRECTA
    const tieneDeuda = totalAPagar > 0;

    container.innerHTML = `
        <div class="deuda-widget ${colorEstado}">
            <div class="deuda-header">
                <div class="deuda-icono">
                    <i class="fas ${tieneDeuda ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                </div>
                <div class="deuda-titulo">
                    <h4>${tieneDeuda ? 'Tienes Deuda de Horas' : 'Sin Deuda de Horas'}</h4>
                    <p>Período: ${getNombreMes(deuda.mes)} ${deuda.anio}</p>
                </div>
            </div>
            
            <div class="deuda-body">
                <!-- ✅ MOSTRAR TOTAL A PAGAR (MES ACTUAL + ACUMULADA) -->
                <div class="deuda-monto-principal ${tieneDeuda ? 'error' : 'success'}">
                    $${totalAPagar.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
                </div>
                
                <!-- ✅ AGREGAR DESGLOSE DE LA DEUDA TOTAL -->
                ${totalAPagar > 0 ? `
                    <div class="deuda-desglose-resumen" style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ff9800;">
                        <div style="display: grid; gap: 8px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>💰 Deuda mes actual:</span>
                                <strong>$${deudaMesActual.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                            </div>
                            ${deudaAcumulada > 0 ? `
                                <div style="display: flex; justify-content: space-between; color: #d32f2f;">
                                    <span>⚠ Deuda acumulada:</span>
                                    <strong>$${deudaAcumulada.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                                </div>
                                <hr style="margin: 8px 0; border: none; border-top: 1px dashed #ccc;">
                                <div style="display: flex; justify-content: space-between; font-size: 1.1em;">
                                    <span><strong>Total a pagar:</strong></span>
                                    <strong style="color: #d32f2f;">$${totalAPagar.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div class="deuda-desglose">
                    <div class="desglose-item">
                        <span class="label">Horas Requeridas:</span>
                        <span class="valor">${deuda.horas_requeridas_mensuales}h/mes</span>
                    </div>
                    <div class="desglose-item">
                        <span class="label">Sistema Semanal:</span>
                        <span class="valor">${deuda.horas_requeridas_semanales}h/semana</span>
                    </div>
                    <div class="desglose-item">
                        <span class="label">Horas Trabajadas:</span>
                        <span class="valor">${deuda.horas_trabajadas}h</span>
                    </div>
                    <div class="desglose-item">
                        <span class="label">Promedio Semanal:</span>
                        <span class="valor">${deuda.promedio_semanal}h/sem</span>
                    </div>
                    <div class="desglose-item ${tieneDeuda ? 'error' : 'success'}">
                        <span class="label">Horas Faltantes:</span>
                        <span class="valor">${deuda.horas_faltantes}h</span>
                    </div>
                    <div class="desglose-item">
                        <span class="label">Costo por Hora:</span>
                        <span class="valor">$${deuda.costo_por_hora}</span>
                    </div>
                </div>
                
                <div class="deuda-progreso">
                    <div class="progreso-header">
                        <span>Progreso Mensual</span>
                        <span class="porcentaje">${deuda.porcentaje_cumplido}%</span>
                    </div>
                    <div class="barra-progreso">
                        <div class="barra-fill" style="width: ${Math.min(deuda.porcentaje_cumplido, 100)}%; 
                             background: ${deuda.porcentaje_cumplido >= 100 ? '#4caf50' :
            deuda.porcentaje_cumplido >= 50 ? '#ff9800' : '#f44336'}">
                        </div>
                    </div>
                </div>
                
                ${tieneDeuda ? `
                    <div class="alert-warning" style="margin-top: 15px;">
                        <strong>⚠ Información Importante:</strong>
                        <p>Esta deuda ${deudaAcumulada > 0 ? '(incluye $' + deudaAcumulada.toLocaleString('es-UY', { minimumFractionDigits: 2 }) + ' de meses anteriores) ' : ''}se sumará automáticamente a tu próxima cuota mensual de vivienda.</p>
                        <p>Sistema: <strong>21 horas semanales</strong> (84h mensuales).</p>
                    </div>
                ` : `
                    <div class="alert-success" style="margin-top: 15px;">
                        <strong>🎉 ¡Excelente!</strong>
                        <p>Has cumplido con tus horas requeridas. No tendrás cargos adicionales en tu cuota.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Exportar funciones
window.cargarJustificacionesUsuario = cargarJustificacionesUsuario;
window.verTodasJustificaciones = verTodasJustificaciones;
window.verArchivoJustificacion = verArchivoJustificacion;

(' Módulo de justificaciones para usuario cargado');

// ==========================================
//  FIX: NÚCLEO FAMILIAR SIN DUPLICADOS
// ==========================================


('🟢 Cargando módulo de núcleos para usuario (FIXED)');

// ========== VARIABLE GLOBAL PARA EVITAR MÚLTIPLES CARGAS ==========
let nucleoYaCargado = false;
let verificacionEnCurso = false;

// ========== INICIALIZACIÓN OPTIMIZADA (SIN DUPLICADOS) ==========
document.addEventListener('DOMContentLoaded', function () {
    ('📋 DOM Ready - Preparando verificación de núcleo');

    //  SOLO ejecutar UNA VEZ cuando la página carga
    setTimeout(() => {
        if (!nucleoYaCargado && !verificacionEnCurso) {
            verificarEstadoNucleo();
        }
    }, 500);

    //  Listener para cuando se hace click en "Inicio"
    const inicioMenuItem = document.querySelector('.menu li[data-section="inicio"]');
    if (inicioMenuItem) {
        inicioMenuItem.addEventListener('click', function () {
            ('🏠 Click en sección Inicio');

            // Solo recargar si no se ha mostrado aún
            if (!nucleoYaCargado) {
                setTimeout(() => {
                    verificarEstadoNucleo();
                }, 100);
            }
        });
    }
});

/**
 * Verificar si el usuario tiene núcleo o debe solicitar uno
 *  CON PROTECCIÓN CONTRA DUPLICADOS
 */
async function verificarEstadoNucleo() {
    // PROTECCIÓN: Evitar múltiples ejecuciones simultáneas
    if (verificacionEnCurso) {
        ('⏳ Verificación ya en curso, saltando...');
        return;
    }

    if (nucleoYaCargado) {
        (' Núcleo ya cargado previamente, saltando...');
        return;
    }

    verificacionEnCurso = true;
    ('🔍 Verificando estado de núcleo...');

    try {
        const response = await fetch('/api/users/my-profile');
        const data = await response.json();

        ('📊 Datos de perfil:', data);

        if (data.success && data.user) {
            //  BUSCAR SECCIÓN DE INICIO
            const inicioSection = document.getElementById('inicio-section');

            if (!inicioSection) {
                console.error('❌ No se encontró la sección de inicio');
                verificacionEnCurso = false;
                return;
            }

            // LIMPIAR CUALQUIER CARD/BANNER ANTERIOR
            const elementosAnteriores = inicioSection.querySelectorAll('.nucleo-info-card, .banner-nucleo-invitation');

            if (elementosAnteriores.length > 0) {
                ('🗑️ Removiendo', elementosAnteriores.length, 'elementos anteriores');
                elementosAnteriores.forEach(el => el.remove());
            }

            const idNucleo = data.user.id_nucleo;
            ('🔍 id_nucleo del usuario:', idNucleo);

            if (idNucleo) {
                //  TIENE NÚCLEO - Mostrar info
                (' Usuario tiene núcleo:', idNucleo);
                await mostrarInfoNucleoEnInicio(idNucleo, inicioSection);
            } else {
                // ❌ NO TIENE NÚCLEO - Mostrar banner
                ('⚠️ Usuario sin núcleo, mostrando banner');
                mostrarBannerNucleoEnInicio(inicioSection);
            }

            //  Marcar como cargado
            nucleoYaCargado = true;
            (' Núcleo cargado correctamente');
        }
    } catch (error) {
        console.error('❌ Error al verificar núcleo:', error);
    } finally {
        verificacionEnCurso = false;
    }
}

/**
 * Mostrar información del núcleo en la sección de inicio
 *  
 */
async function mostrarInfoNucleoEnInicio(idNucleo, inicioSection) {
    try {
        ('📡 Cargando info del núcleo para inicio...');

        const response = await fetch('/api/nucleos/mi-nucleo-info');
        const data = await response.json();

        if (!data.success || !data.nucleo) {
            console.error('❌ Error al cargar núcleo');
            return;
        }

        const nucleo = data.nucleo;
        const miembros = data.miembros || [];
        const miId = data.mi_id;

        ('📋 Núcleo:', nucleo.nombre_nucleo, '- Miembros:', miembros.length);

        let miembrosHTML = '';

        if (miembros.length > 0) {
            // Mostrar hasta 4 miembros
            const miembrosMostrar = miembros.slice(0, 4);
            const miembrosRestantes = miembros.length - 4;

            miembrosHTML = `
                <div class="miembros-grid-compact" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-top: 15px;">
                    ${miembrosMostrar.map(miembro => `
                        <div style="
                            background: rgba(255,255,255,0.1);
                            padding: 12px;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            border-left: 3px solid ${miembro.id_usuario == miId ? '#fff' : 'transparent'};
                        ">
                            <i class="fas fa-user-circle" style="font-size: 20px; color: rgba(255,255,255,0.8);"></i>
                            <div style="flex: 1; min-width: 0;">
                                <strong style="color: white; display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${miembro.nombre_completo}
                                    ${miembro.id_usuario == miId ? '<span style="font-size: 11px; opacity: 0.8;"> (Tú)</span>' : ''}
                                </strong>
                                ${miembro.nombre_rol ? `
                                    <small style="color: rgba(255,255,255,0.7); font-size: 11px;">${miembro.nombre_rol}</small>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                    ${miembrosRestantes > 0 ? `
                        <div style="
                            background: rgba(255,255,255,0.1);
                            padding: 12px;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: 600;
                        ">
                            +${miembrosRestantes} más
                        </div>
                    ` : ''}
                </div>
            `;
        }

        const infoHTML = `
            <div class="nucleo-info-card" style="
                background: linear-gradient(135deg, #69b2d5 0%, #1b1397 100%); 
                color: white;
                padding: 25px;
                border-radius: 12px;
                margin-bottom: 30px;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                animation: slideInDown 0.5s ease-out;
            ">
                <div style="display: flex; align-items: start; gap: 20px; margin-bottom: 20px;">
                    <div style="
                        background: rgba(255,255,255,0.2);
                        width: 70px;
                        height: 70px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 35px;
                        backdrop-filter: blur(10px);
                        flex-shrink: 0;
                    ">
                        👨‍👩‍👧
                    </div>
                    <div style="flex: 1;">
                        <p style="margin: 0 0 5px 0; opacity: 0.9; font-size: 13px; font-weight: 500;" data-i18n="dashboardUser.home.nucleoInfoCard.title">
                            Tu Núcleo Familiar
                        </p>
                        <h3 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 700;">
                            ${nucleo.nombre_nucleo || 'Sin nombre'}
                        </h3>
                        <div style="display: flex; gap: 15px; font-size: 13px; opacity: 0.95; flex-wrap: wrap;">
                            ${nucleo.direccion ? `
                                <span style="display: flex; align-items: center; gap: 5px;">
                                    <i class="fas fa-map-marker-alt"></i> ${nucleo.direccion}
                                </span>
                            ` : ''}
                            <span style="display: flex; align-items: center; gap: 5px;">
                                <i class="fas fa-users"></i> ${nucleo.total_miembros} <span data-i18n="dashboardUser.home.nucleoInfoCard.membersCount">miembro</span>${nucleo.total_miembros != 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <strong style="font-size: 14px;" data-i18n="dashboardUser.home.nucleoInfoCard.members">Miembros del núcleo</strong>
                        <button 
                            onclick="verDetallesNucleoDesdeInicio(${idNucleo})" 
                            style="
                                background: rgba(255,255,255,0.2);
                                border: none;
                                color: white;
                                padding: 6px 12px;
                                border-radius: 6px;
                                font-size: 12px;
                                cursor: pointer;
                                transition: all 0.3s;
                            "
                            onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.2)'"
                            >
                            <i class="fas fa-info-circle"></i> <span data-i18n="dashboardUser.home.nucleoInfoCard.viewAllButton">Ver Todo</span>
                        </button>
                    </div>
                    ${miembrosHTML}
                </div>
            </div>
        `;

        // Traducir los elementos data-i18n que acabamos de insertar
        if (window.i18n && typeof window.i18n.translatePage === 'function') {
            window.i18n.translatePage();
        }
        const tituloInicio = inicioSection.querySelector('.section-title, h2');
        if (tituloInicio) {
            tituloInicio.insertAdjacentHTML('afterend', infoHTML);
        } else {
            inicioSection.insertAdjacentHTML('afterbegin', infoHTML);
        }

        (' Card de núcleo insertado en inicio');

    } catch (error) {
        console.error('❌ Error al mostrar núcleo en inicio:', error);
    }
}

/**
 * Mostrar banner para unirse a un núcleo en la sección de inicio
 *  
 */
function mostrarBannerNucleoEnInicio(inicioSection) {
    const banner = `
        <div class="banner-nucleo-invitation" style="
            background: linear-gradient(135deg, #69b2d5 0%, #1b1397 100%); 
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInDown 0.5s ease-out;
        ">
            <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                <div style="font-size: 48px;">👨‍👩‍👧‍👦</div>
                <div style="flex: 1; min-width: 250px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 20px;">¿Quieres unirte a un Núcleo Familiar?</h3>
                    <p style="margin: 0; opacity: 0.9;">
                        Los núcleos familiares permiten compartir viviendas y tareas. 
                        Explora los núcleos disponibles y envía una solicitud.
                    </p>
                </div>
                <button 
                    onclick="abrirModalNucleosDisponibles()" 
                    class="btn btn-light"
                    style="
                        padding: 12px 24px; 
                        font-weight: 600; 
                        background: white; 
                        color: #667eea; 
                        border: none; 
                        border-radius: 8px; 
                        cursor: pointer;
                        transition: all 0.3s ease;
                        white-space: nowrap;
                    "
                    onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                    <i class="fas fa-users"></i> Ver Núcleos
                </button>
            </div>
        </div>
    `;

    // Insertar al principio (después del título)
    const tituloInicio = inicioSection.querySelector('.section-title, h2');
    if (tituloInicio) {
        tituloInicio.insertAdjacentHTML('afterend', banner);
    } else {
        inicioSection.insertAdjacentHTML('afterbegin', banner);
    }

    (' Banner de núcleo insertado en inicio');
}

/**
 * Ver detalles del núcleo desde el inicio
 */
async function verDetallesNucleoDesdeInicio(idNucleo) {
    try {
        console.log("🔍 Idioma actual en i18n:", i18n.getLanguage());

        const response = await fetch(`/api/nucleos/mi-nucleo-info`);
        const data = await response.json();

        if (!data.success) {
            alert('❌ Error al cargar detalles del núcleo');
            return;
        }

        const nucleo = data.nucleo;
        const miembros = data.miembros || [];
        const miId = data.mi_id;

        let miembrosHTML = '';

        if (miembros.length > 0) {
            miembrosHTML = `
                <div class="miembros-grid" style="display: grid; gap: 15px; margin-top: 20px;">
                    ${miembros.map(miembro => `
                        <div style="
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 8px;
                            border-left: 4px solid ${miembro.id_usuario == miId ? '#667eea' : '#e0e0e0'};
                        ">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-user-circle" style="font-size: 24px; color: #667eea;"></i>
                                <div style="flex: 1;">
                                    <strong style="color: #333; display: block;">
                                        ${miembro.nombre_completo}
                                        ${miembro.id_usuario == miId ? '<span style="color: #667eea; font-size: 12px;">(Tú)</span>' : ''}
                                    </strong>
                                    <small style="color: #666;">${miembro.email}</small>
                                </div>
                                ${miembro.nombre_rol ? `
                                    <span style="
                                        background: #e3f2fd;
                                        color: #1976d2;
                                        padding: 4px 10px;
                                        border-radius: 12px;
                                        font-size: 11px;
                                        font-weight: 600;
                                    ">
                                        ${miembro.nombre_rol}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            miembrosHTML = '<p style="color: #999; text-align: center; margin-top: 20px;">No hay miembros en este núcleo</p>';
        }

        const modal = `
            <div id="detallesNucleoModal" class="modal-overlay" onclick="if(event.target.classList.contains('modal-overlay')) this.remove()">
                <div class="modal-content-large" style="max-width: 700px;">
                    <button class="modal-close-btn" onclick="document.getElementById('detallesNucleoModal').remove()">×</button>
                    
                    <div style="padding: 30px;">
                        <h2 style="margin: 0 0 10px 0; color: #333; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-users" style="color: #667eea;"></i>
                            ${nucleo.nombre_nucleo || 'Núcleo Familiar'}
                        </h2>
                        
                        ${nucleo.direccion ? `
                            <p style="margin: 0 0 20px 0; color: #666;">
                                <i class="fas fa-map-marker-alt"></i> ${nucleo.direccion}
                            </p>
                        ` : ''}
                        
                        <div style="
                            background: linear-gradient(135deg, #69b2d5 0%, #1b1397 100%); 
                            color: white;
                            padding: 20px;
                            border-radius: 12px;
                            margin-bottom: 25px;
                        ">
                            <h3 style="margin: 0 0 10px 0; font-size: 18px;" data-i18n="dashboardUser.home.coreDetails.coreInfoTitle">
                                Información del Núcleo
                            </h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                                <div>
                                    <div style="opacity: 0.9; font-size: 13px;" data-i18n="dashboardUser.home.coreDetails.totalMembers">Total de Miembros</div>
                                    <div style="font-size: 28px; font-weight: 700;">${nucleo.total_miembros}</div>
                                </div>
                            </div>
                        </div>
                        
                        <h3 style="margin: 0 0 15px 0; color: #333;" data-i18n="dashboardUser.home.coreDetails.membersTitle">
                            <i class="fas fa-users"></i> Miembros del Núcleo
                        </h3>
                        
                        ${miembrosHTML}
                        
                        <div style="margin-top: 30px; text-align: right;">
                            <button class="btn btn-secondary" onclick="document.getElementById('detallesNucleoModal').remove()" data-i18n="common.close">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modal);
        i18n.translatePage(); // Traducir los elementos data-i18n

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
    }
}



// ========== RESTO DE FUNCIONES ==========

async function abrirModalNucleosDisponibles() {
    try {
        const response = await fetch('/api/nucleos/disponibles');
        const data = await response.json();

        if (!data.success) {
            alert('❌ Error al cargar núcleos');
            return;
        }
        mostrarModalNucleosDisponibles(data.nucleos);
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
    }
}

function mostrarModalNucleosDisponibles(nucleos) {
    if (!nucleos || nucleos.length === 0) {
        alert('ℹ️ No hay núcleos disponibles en este momento');
        return;
    }

    let nucleosHTML = '';

    nucleos.forEach(nucleo => {
        nucleosHTML += `
            <div class="nucleo-card-disponible" style="
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                transition: all 0.3s ease;
            ">
                <div class="nucleo-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0; color: #333;">
                        👨‍👩‍👧‍👦 ${nucleo.nombre_nucleo || 'Sin nombre'}
                    </h4>
                    <span style="
                        background: #667eea; 
                        color: white; 
                        padding: 5px 12px; 
                        border-radius: 20px; 
                        font-size: 12px; 
                        font-weight: 600;">
                        ${nucleo.total_miembros} miembro${nucleo.total_miembros != 1 ? 's' : ''}
                    </span>
                </div>
                
                <div class="nucleo-body">
                    ${nucleo.direccion ? `
                        <p style="margin: 10px 0; color: #666;">
                            <i class="fas fa-map-marker-alt" style="color: #667eea; margin-right: 8px;"></i>
                            <strong>Dirección:</strong> ${nucleo.direccion}
                        </p>
                    ` : ''}
                    
                    ${nucleo.miembros_nombres ? `
                        <div class="miembros-preview" style="margin-top: 10px;">
                            <strong style="color: #333;">Miembros:</strong>
                            <p style="color: #666; font-size: 13px; margin: 5px 0 0 0;">
                                ${truncarTexto(nucleo.miembros_nombres, 100)}
                            </p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="nucleo-footer" style="margin-top: 15px; text-align: right;">
                    <button 
                        class="btn btn-primary btn-small" 
                        onclick="solicitarUnirseNucleo(${nucleo.id_nucleo}, '${nucleo.nombre_nucleo.replace(/'/g, "\\'")}')"
                        style="padding: 8px 16px;">
                        <i class="fas fa-paper-plane"></i> Enviar Solicitud
                    </button>
                </div>
            </div>
        `;
    });

    const modal = `
        <div id="nucleosDisponiblesModal" class="modal-overlay" onclick="if(event.target.classList.contains('modal-overlay')) this.remove()">
            <div class="modal-content-large" style="max-width: 700px;">
                <button class="modal-close-btn" onclick="document.getElementById('nucleosDisponiblesModal').remove()">×</button>
                
                <div style="padding: 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-users" style="color: #667eea;"></i> 
                        Núcleos Familiares Disponibles
                    </h2>
                    
                    <div class="alert-info" style="
                        background: #e3f2fd;
                        border-left: 4px solid #2196F3;
                        padding: 15px;
                        margin-bottom: 20px;
                        border-radius: 4px;
                    ">
                        <strong style="color: #1976d2;">ℹ️ Información:</strong>
                        <p style="margin: 5px 0 0 0; color: #333;">
                            Selecciona un núcleo familiar y envía una solicitud. Un administrador revisará y aprobará tu solicitud.
                        </p>
                    </div>
                    
                    <div class="nucleos-grid">
                        ${nucleosHTML}
                    </div>
                    
                    <div style="margin-top: 30px; text-align: right;">
                        <button class="btn btn-secondary" onclick="document.getElementById('nucleosDisponiblesModal').remove()">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    i18n.translatePage(); // Traducir los elementos data-i18n
}

async function solicitarUnirseNucleo(idNucleo, nombreNucleo) {
    const mensaje = prompt(`Mensaje opcional para el administrador del núcleo "${nombreNucleo}":`);

    if (mensaje === null) return;

    if (!confirm(`¿Enviar solicitud para unirte al núcleo "${nombreNucleo}"?`)) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('id_nucleo', idNucleo);
        formData.append('mensaje', mensaje || '');

        const response = await fetch('/api/nucleos/solicitar-unirse', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.message);
            document.getElementById('nucleosDisponiblesModal').remove();

            // Recargar
            nucleoYaCargado = false;
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
    }
}

function truncarTexto(texto, maxLength) {
    if (!texto || texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
}

// Exportar funciones
window.verificarEstadoNucleo = verificarEstadoNucleo;
window.abrirModalNucleosDisponibles = abrirModalNucleosDisponibles;
window.solicitarUnirseNucleo = solicitarUnirseNucleo;
window.verDetallesNucleoDesdeInicio = verDetallesNucleoDesdeInicio;

(' Módulo de núcleos para usuario cargado (FIXED - Sin duplicados)');

/**
 * Enviar solicitud para unirse a un núcleo
 */
async function solicitarUnirseNucleo(idNucleo, nombreNucleo) {
    const mensaje = prompt(`Mensaje opcional para el administrador del núcleo "${nombreNucleo}":`);

    if (mensaje === null) {
        // Usuario canceló
        return;
    }

    if (!confirm(`¿Enviar solicitud para unirte al núcleo "${nombreNucleo}"?`)) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('id_nucleo', idNucleo);
        formData.append('mensaje', mensaje || '');

        const response = await fetch('/api/nucleos/solicitar-unirse', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.message);
            cerrarModalNucleosDisponibles();

            // Recargar para ocultar el banner si es necesario
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
    }
}

/**
 * Ver mis solicitudes enviadas
 */
async function verMisSolicitudesNucleo() {
    try {
        const response = await fetch('/api/nucleos/mis-solicitudes');
        const data = await response.json();

        if (!data.success) {
            alert('❌ Error al cargar solicitudes');
            return;
        }

        cerrarModalNucleosDisponibles();
        mostrarModalMisSolicitudes(data.solicitudes);
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
    }
}

/**
 * Modal con mis solicitudes
 */
function mostrarModalMisSolicitudes(solicitudes) {
    if (!solicitudes || solicitudes.length === 0) {
        alert('ℹ️ No tienes solicitudes enviadas');
        return;
    }

    let solicitudesHTML = '';

    solicitudes.forEach(sol => {
        const fecha = new Date(sol.fecha_solicitud).toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let estadoHTML = '';
        let accionesHTML = '';

        if (sol.estado === 'pendiente') {
            estadoHTML = '<span style="background: #ff9800; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px;">⏳ Pendiente</span>';
            accionesHTML = `
                <button class="btn btn-danger btn-small" onclick="cancelarMiSolicitud(${sol.id_solicitud_nucleo})">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            `;
        } else if (sol.estado === 'aprobada') {
            estadoHTML = '<span style="background: #4caf50; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px;"> Aprobada</span>';
        } else {
            estadoHTML = '<span style="background: #f44336; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px;">❌ Rechazada</span>';
        }

        solicitudesHTML += `
            <div style="
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
            ">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: #333;">
                            👨‍👩‍👧‍👦 ${sol.nombre_nucleo}
                        </h4>
                        <p style="margin: 0; color: #999; font-size: 13px;">
                            <i class="fas fa-calendar"></i> ${fecha}
                        </p>
                    </div>
                    ${estadoHTML}
                </div>
                
                ${sol.direccion_nucleo ? `
                    <p style="margin: 10px 0; color: #666;">
                        <i class="fas fa-map-marker-alt"></i> ${sol.direccion_nucleo}
                    </p>
                ` : ''}
                
                ${sol.mensaje ? `
                    <div style="background: #f5f5f5; padding: 10px; border-radius: 8px; margin: 10px 0;">
                        <strong style="color: #333;">Tu mensaje:</strong>
                        <p style="margin: 5px 0 0 0; color: #666;">${sol.mensaje}</p>
                    </div>
                ` : ''}
                
                ${sol.observaciones_admin ? `
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0;">
                        <strong style="color: #333;">Respuesta del administrador:</strong>
                        <p style="margin: 5px 0 0 0; color: #666;">${sol.observaciones_admin}</p>
                    </div>
                ` : ''}
                
                <div style="margin-top: 15px; text-align: right;">
                    ${accionesHTML}
                </div>
            </div>
        `;
    });

    const modal = `
        <div id="misSolicitudesModal" class="modal-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        ">
            <div class="modal-content-large" style="
                background: white;
                border-radius: 16px;
                max-width: 700px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            ">
                <button class="modal-close-btn" onclick="cerrarModalMisSolicitudes()" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: #f5f5f5;
                    border: none;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    font-size: 20px;
                    cursor: pointer;
                ">×</button>
                
                <div style="padding: 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333;">
                        <i class="fas fa-list"></i> Mis Solicitudes de Núcleo
                    </h2>
                    
                    ${solicitudesHTML}
                    
                    <div style="margin-top: 30px; text-align: right;">
                        <button class="btn btn-secondary" onclick="cerrarModalMisSolicitudes()">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

function cerrarModalMisSolicitudes() {
    const modal = document.getElementById('misSolicitudesModal');
    if (modal) modal.remove();
}

/**
 * Cancelar solicitud
 */
async function cancelarMiSolicitud(idSolicitud) {
    if (!confirm('¿Cancelar esta solicitud?')) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('id_solicitud', idSolicitud);

        const response = await fetch('/api/nucleos/cancelar-solicitud', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert(' Solicitud cancelada');
            cerrarModalMisSolicitudes();
            verMisSolicitudesNucleo();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
    }
}

// Función auxiliar (si no existe)
function truncarTexto(texto, maxLength) {
    if (!texto || texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
}

// Exportar funciones globales
window.verificarEstadoNucleo = verificarEstadoNucleo;
window.abrirModalNucleosDisponibles = abrirModalNucleosDisponibles;
window.solicitarUnirseNucleo = solicitarUnirseNucleo;
window.verMisSolicitudesNucleo = verMisSolicitudesNucleo;
window.cancelarMiSolicitud = cancelarMiSolicitud;
window.verDetallesNucleoDesdeInicio = verDetallesNucleoDesdeInicio;


(' Módulo de núcleos para usuario cargado completamente');

// ==========================================
// FIX GLOBAL DE FECHAS 
// ==========================================


('🌍 [FIX FECHAS] Iniciando configuración para Uruguay...');


function parseFechaLocal(fechaSQL) {
    if (!fechaSQL) return null;


    return new Date(fechaSQL + 'T00:00:00');
}

/**
 * Formatear fecha en formato
 */
function formatearFechaUY(fecha) {
    if (!fecha) return '-';

    const f = parseFechaLocal(fecha);

    return f.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Montevideo'
    });
}

/**
 * Formatear fecha y hora completa
 */
function formatearFechaHoraUY(fechaHora) {
    if (!fechaHora) return '-';

    const f = new Date(fechaHora);

    return f.toLocaleString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Montevideo'
    });
}

/**
 * Formatear fecha en formato largo 
 */
function formatearFechaLargaUY(fecha) {
    if (!fecha) return '-';

    const f = parseFechaLocal(fecha);

    return f.toLocaleDateString('es-UY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Montevideo'
    });
}

/**
 * Obtener fecha actual en formato SQL (YYYY-MM-DD) - Uruguay
 */
function getFechaActualSQL() {
    const ahora = new Date();

    // Formatear en zona horaria de Uruguay
    const opciones = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/Montevideo'
    };

    const partes = ahora.toLocaleDateString('es-UY', opciones).split('/');
    return `${partes[2]}-${partes[1]}-${partes[0]}`; // YYYY-MM-DD
}

/**
 * Obtener hora actual en formato HH:MM:SS - Uruguay
 */
function getHoraActualSQL() {
    const ahora = new Date();

    return ahora.toLocaleTimeString('es-UY', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Montevideo'
    });
}



function fixFechasTareas() {
    ('🔧 Aplicando fix de fechas en tareas...');


    window.renderUserTasks_ORIGINAL = window.renderUserTasks;

    window.renderUserTasks = function (tareas, containerId, esNucleo = false) {
        const container = document.getElementById(containerId);

        if (!tareas || tareas.length === 0) {
            container.innerHTML = '<div class="no-tasks">No tienes tareas asignadas</div>';
            return;
        }

        container.innerHTML = tareas.map(tarea => {
            //  FIX: Usar parseFechaLocal
            const fechaInicio = formatearFechaUY(tarea.fecha_inicio);
            const fechaFin = formatearFechaUY(tarea.fecha_fin);

            const progreso = tarea.progreso || 0;
            const esCompletada = tarea.estado_usuario === 'completada';

            return `
                <div class="user-task-item prioridad-${tarea.prioridad} ${esCompletada ? 'completada' : ''}">
                    <div class="user-task-header">
                        <h4 class="user-task-title">${tarea.titulo}</h4>
                        <div class="user-task-badges">
                            <span class="task-badge badge-estado">${formatEstadoUsuario(tarea.estado_usuario)}</span>
                    
                            ${esNucleo ? '<span class="task-badge" style="background: #6f42c1; color: white;">Núcleo</span>' : ''}
                        </div>
                    </div>
                    
                    <p class="user-task-description">${tarea.descripcion}</p>
                    
                    <div class="user-task-meta">
                        <div><strong>Inicio:</strong> ${fechaInicio}</div>
                        <div><strong>Fin:</strong> ${fechaFin}</div>
                        <div><strong>Creado por:</strong> ${tarea.creador}</div>
                    </div>
                    
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progreso}%">
                            ${progreso}%
                        </div>
                    </div>
                    
                    ${!esCompletada ? `
                        <div class="user-task-actions">
                            <button class="btn-small btn-update" onclick="updateTaskProgress(${tarea.id_asignacion}, '${esNucleo ? 'nucleo' : 'usuario'}', ${tarea.id_tarea})">
                                Actualizar Progreso
                            </button>
                            <button class="btn-small btn-avance" onclick="addTaskAvance(${tarea.id_tarea})">
    Reportar Avance
</button>
                            <button class="btn-small btn-materiales" onclick="viewTaskMaterials(${tarea.id_tarea})" title="Ver materiales necesarios">
                                <i class="fas fa-boxes"></i> Materiales
                            </button>
                            <button class="btn-small btn-detalles" onclick="viewUserTaskDetails(${tarea.id_tarea})">
                                Ver Detalles Completos
                            </button>
                        </div>
                    ` : '<p style="color: #28a745; margin-top: 10px;"><strong>✓ Tarea completada</strong></p>'}
                </div>
            `;
        }).join('');
    };

    (' Fix de fechas en tareas aplicado');
}

/**
 * Fix para dashboardAdmin.js - Tareas Admin
 */
function fixFechasTareasAdmin() {
    ('🔧 Aplicando fix de fechas en tareas admin...');

    // Reemplazar en renderTasksList
    window.renderTasksList_ORIGINAL = window.renderTasksList;

    window.renderTasksList = function (tareas) {
        const container = document.getElementById('tasksList');

        if (!tareas || tareas.length === 0) {
            container.innerHTML = '<p class="no-tasks">No hay tareas creadas</p>';
            return;
        }

        container.innerHTML = tareas.map(tarea => {
            //  FIX: Usar formatearFechaUY
            const fechaInicio = formatearFechaUY(tarea.fecha_inicio);
            const fechaFin = formatearFechaUY(tarea.fecha_fin);

            const asignados = tarea.tipo_asignacion === 'usuario' ?
                `${tarea.total_usuarios} usuario(s)` :
                `${tarea.total_nucleos} núcleo(s)`;

            const progresoPromedio = Math.round(parseFloat(tarea.progreso_promedio || 0));
            const totalAsignados = tarea.tipo_asignacion === 'usuario' ?
                parseInt(tarea.total_usuarios) :
                parseInt(tarea.total_nucleos);
            const completados = parseInt(tarea.asignaciones_completadas || 0);

            const estadoFinal = tarea.estado;
            const esCompletada = estadoFinal === 'completada';
            const esCancelada = estadoFinal === 'cancelada';

            return `
                <div class="task-item prioridad-${tarea.prioridad} ${esCompletada ? 'tarea-completada' : ''}">
                    <div class="task-header">
                        <h4 class="task-title">${tarea.titulo}</h4>
                        <div class="task-badges">
                            <span class="task-badge badge-estado ${esCompletada ? 'completada' : ''} ${esCancelada ? 'cancelada' : ''}">
                                ${formatEstado(tarea.estado)}
                            </span>
                            <span class="task-badge badge-prioridad ${tarea.prioridad}">${formatPrioridad(tarea.prioridad)}</span>
                        </div>
                    </div>
                    <p class="task-description">${tarea.descripcion}</p>
                    
                    <div class="task-meta">
                        <div class="task-meta-item"><strong>Inicio:</strong> ${fechaInicio}</div>
                        <div class="task-meta-item"><strong>Fin:</strong> ${fechaFin}</div>
                        <div class="task-meta-item"><strong>Creado por:</strong> ${tarea.creador}</div>
                        <div class="task-meta-item"><strong>Asignado a:</strong> ${asignados}</div>
                    </div>
                    
                    ${!esCancelada ? `
                        <div class="task-progress-section">
                            <div class="progress-info">
                                <span class="progress-label">Progreso general:</span>
                                <span class="progress-percentage">${progresoPromedio}%</span>
                                <span class="progress-completed">${completados}/${totalAsignados} completados</span>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width: ${progresoPromedio}%; background: ${esCompletada ? '#28a745' : '#667eea'};">
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${!esCancelada ? `
                        <div class="task-actions">
                            <button class="btn btn-small btn-view" onclick="viewTaskDetails(${tarea.id_tarea})">Ver Detalles</button>
                            <button class="btn btn-small btn-materiales" onclick="viewTaskMaterialsAdmin(${tarea.id_tarea})">
                                <i class="fas fa-boxes"></i> Materiales
                            </button>
                            ${!esCompletada ? `
                                <button class="btn btn-small btn-cancel" onclick="cancelTask(${tarea.id_tarea})">Cancelar Tarea</button>
                            ` : `
                                <span style="color: #28a745; font-weight: bold; padding: 5px 10px;">
                                    ✓ Tarea Completada
                                </span>
                            `}
                        </div>
                    ` : '<p style="color: #dc3545; margin-top: 10px;"><strong>Esta tarea ha sido cancelada</strong></p>'}
                </div>
            `;
        }).join('');
    };

    (' Fix de fechas en tareas admin aplicado');
}

/**
 * Fix para Registro de Horas
 */
function fixFechasRegistroHoras() {
    ('🔧 Aplicando fix de fechas en registro de horas...');


    window.formatearFechaSimple = formatearFechaUY;

    (' Fix de fechas en registro de horas aplicado');
}

/**
 * Fix para Solicitudes
 */
function fixFechasSolicitudes() {
    ('🔧 Aplicando fix de fechas en solicitudes...');

    // La función de renderizado de solicitudes ya usa toLocaleDateString
    // pero podemos asegurarnos que use la zona horaria correcta

    (' Fix de fechas en solicitudes aplicado');
}

// ========== INICIALIZACIÓN AUTOMÁTICA ==========

// Ejecutar inmediatamente
('🌍 [FIX FECHAS] Inicializando sistema de fechas para Uruguay...');
('📅 [FIX FECHAS] Zona horaria detectada:', Intl.DateTimeFormat().resolvedOptions().timeZone);

try {
    ('📅 [FIX FECHAS] Fecha actual SQL:', getFechaActualSQL());
    ('⏰ [FIX FECHAS] Hora actual SQL:', getHoraActualSQL());
} catch (e) {
    console.warn('⚠️ [FIX FECHAS] Funciones aún no definidas, se definirán a continuación');
}

// ========== EXPORTAR FUNCIONES GLOBALES ==========

window.parseFechaLocal = parseFechaLocal;
window.formatearFechaUY = formatearFechaUY;
window.formatearFechaHoraUY = formatearFechaHoraUY;
window.formatearFechaLargaUY = formatearFechaLargaUY;
window.getFechaActualSQL = getFechaActualSQL;
window.getHoraActualSQL = getHoraActualSQL;

(' [FIX FECHAS] Funciones exportadas:', {
    parseFechaLocal: typeof window.parseFechaLocal,
    formatearFechaUY: typeof window.formatearFechaUY,
    getFechaActualSQL: typeof window.getFechaActualSQL
});

// ========== APLICAR FIXES AUTOMÁTICAMENTE ==========

// Esperar un momento para que otras funciones se carguen
setTimeout(function () {
    ('🔧 [FIX FECHAS] Aplicando fixes automáticos...');

    try {
        fixFechasTareas();
        fixFechasTareasAdmin();
        fixFechasRegistroHoras();
        (' [FIX FECHAS] Sistema de fechas configurado correctamente');
        ('📅 [FIX FECHAS] Zona horaria:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        ('📅 [FIX FECHAS] Fecha actual SQL:', getFechaActualSQL());
        ('⏰ [FIX FECHAS] Hora actual SQL:', getHoraActualSQL());

        // Prueba
        ('🧪 [FIX FECHAS] Prueba: formatearFechaUY("2025-01-15") =', formatearFechaUY('2025-01-15'));
    } catch (error) {
        console.warn('⚠️ [FIX FECHAS] Error al aplicar fixes:', error);
    }
}, 1000);



(' [FIX FECHAS] Módulo cargado - Zona horaria: America/Montevideo');

// ==========================================
// FIX: TAREAS VENCIDAS 
// 
// ==========================================

('🟢 [VENCIDAS] Aplicando fix de tareas vencidas en usuario...');

/**
 * OVERRIDE: renderUserTasks con detección de VENCIDAS
 */
(function () {
    ('🔄 [OVERRIDE USER] Sobrescribiendo renderUserTasks...');

    // Guardar versión original si existe
    if (window.renderUserTasks) {
        window.renderUserTasks_BACKUP = window.renderUserTasks;
    }

    /**
     *  VERSIÓN con detección de VENCIDAS
     */
    window.renderUserTasks = function (tareas, containerId, esNucleo = false) {
        ('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        ('🎨 [RENDER USER TASKS] Iniciando con detección de vencidas');
        ('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const container = document.getElementById(containerId);

        if (!tareas || tareas.length === 0) {
            container.innerHTML = '<div class="no-tasks">No tienes tareas asignadas</div>';
            return;
        }

        //  PASO 1: Detectar tareas vencidas
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        ('📅 Fecha HOY:', hoy.toISOString().split('T')[0]);

        const tareasConEstado = tareas.map(tarea => {
            const fechaFinObj = new Date(tarea.fecha_fin + 'T00:00:00');
            const esCompletada = tarea.estado_usuario === 'completada';
            const esVencida = !esCompletada && fechaFinObj < hoy;

            if (esVencida) {
                (`🔴 TAREA VENCIDA (Usuario): ${tarea.titulo}`);
                (`   - Fecha fin: ${tarea.fecha_fin}`);
                (`   - Estado: ${tarea.estado_usuario}`);
            }

            return {
                ...tarea,
                esVencida,
                esCompletada
            };
        });

        //  PASO 2: Renderizar
        container.innerHTML = tareasConEstado.map(tarea => {
            const fechaInicio = formatearFechaUY(tarea.fecha_inicio);
            const fechaFin = formatearFechaUY(tarea.fecha_fin);
            const progreso = tarea.progreso || 0;

            //  DETERMINAR ESTADO VISUAL
            let estadoTexto, estadoBadgeClass, tareaClass;

            if (tarea.esVencida) {
                estadoTexto = '⏰ Vencida';
                estadoBadgeClass = 'vencida';
                tareaClass = 'tarea-vencida';
                (` Badge VENCIDA aplicado: ${tarea.titulo}`);
            } else if (tarea.esCompletada) {
                estadoTexto = formatEstadoUsuario(tarea.estado_usuario);
                estadoBadgeClass = 'completada';
                tareaClass = 'completada';
            } else {
                estadoTexto = formatEstadoUsuario(tarea.estado_usuario);
                estadoBadgeClass = '';
                tareaClass = '';
            }

            return `
                <div class="user-task-item prioridad-${tarea.prioridad} ${tareaClass}">
                    <div class="user-task-header">
                        <h4 class="user-task-title">${tarea.titulo}</h4>
                        <div class="user-task-badges">
                            <span class="task-badge badge-estado ${estadoBadgeClass}">
                                ${estadoTexto}
                            </span>
                            ${esNucleo ? '<span class="task-badge" style="background: #6f42c1; color: white;">Núcleo</span>' : ''}
                        </div>
                    </div>
                    
                    <p class="user-task-description">${tarea.descripcion}</p>
                    
                    <div class="user-task-meta">
                        <div><strong>Inicio:</strong> ${fechaInicio}</div>
                        <div><strong>Fin:</strong> ${fechaFin}</div>
                        <div><strong>Creado por:</strong> ${tarea.creador}</div>
                    </div>
                    
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progreso}%; background: ${tarea.esVencida ? '#dc3545' : tarea.esCompletada ? '#28a745' : '#667eea'};">
                            ${progreso}%
                        </div>
                    </div>
                    
                    ${tarea.esVencida ? `
                        <div class="alert-warning" style="margin-top: 15px;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Esta tarea está vencida.</strong> La fecha límite ya ha pasado.
                        </div>
                    ` : ''}
                    
                    ${!tarea.esCompletada ? `
                        <div class="user-task-actions">
                            <button class="btn-small btn-update" onclick="updateTaskProgress(${tarea.id_asignacion}, '${esNucleo ? 'nucleo' : 'usuario'}', ${tarea.id_tarea})">
                                Actualizar Progreso
                            </button>
                            <button class="btn-small btn-avance" onclick="addTaskAvance(${tarea.id_tarea})">
                                Reportar Avance
                            </button>
                            <button class="btn-small btn-materiales" onclick="viewTaskMaterials(${tarea.id_tarea})" title="Ver materiales necesarios">
                                <i class="fas fa-boxes"></i> Materiales
                            </button>
                            <button class="btn-small btn-detalles" onclick="viewUserTaskDetails(${tarea.id_tarea})">
                                Ver Detalles Completos
                            </button>
                        </div>
                    ` : '<p style="color: #28a745; margin-top: 10px;"><strong>✓ Tarea completada</strong></p>'}
                </div>
            `;
        }).join('');

        (' [RENDER USER TASKS] Completado');
        ('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    };

    (' [OVERRIDE USER] renderUserTasks sobrescrito correctamente');
})();

/**
 * FUNCIONES AUXILIARES (si no existen)
 */
if (typeof formatEstadoUsuario !== 'function') {
    window.formatEstadoUsuario = function (estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'en_progreso': 'En Progreso',
            'completada': 'Completada'
        };
        return estados[estado] || estado;
    };
}

if (typeof formatPrioridad !== 'function') {
    window.formatPrioridad = function (prioridad) {
        const prioridades = {
            'baja': 'Baja',
            'media': 'Media',
            'alta': 'Alta'
        };
        return prioridades[prioridad] || prioridad;
    };
}

/**
 *  ASEGURAR formatearFechaUY existe
 */
if (typeof formatearFechaUY !== 'function') {
    window.formatearFechaUY = function (fecha) {
        if (!fecha) return '-';
        const f = new Date(fecha + 'T00:00:00');
        return f.toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Montevideo'
        });
    };
}

/**
 *  FORZAR RECARGA AL ENTRAR A SECCIÓN TAREAS
 */
document.addEventListener('DOMContentLoaded', function () {
    const tareasMenuItem = document.querySelector('.menu li[data-section="tareas"]');
    if (tareasMenuItem) {
        (' Listener de tareas usuario agregado');
        tareasMenuItem.addEventListener('click', function () {
            ('>>> Click en sección tareas USUARIO');

            // Esperar un momento para que la sección se active
            setTimeout(() => {
                ('🔄 Cargando tareas de usuario...');

                // Verificar si los contenedores existen
                const tareasUsuarioList = document.getElementById('tareasUsuarioList');
                const tareasNucleoList = document.getElementById('tareasNucleoList');

                if (tareasUsuarioList) {
                    (' Container tareasUsuarioList encontrado');
                }
                if (tareasNucleoList) {
                    (' Container tareasNucleoList encontrado');
                }

                // Cargar tareas
                if (typeof loadUserTasks === 'function') {
                    loadUserTasks();
                } else {
                    console.error('❌ loadUserTasks no está definida');
                }
            }, 100);
        });
    } else {
        console.warn('⚠️ No se encontró el menu item de tareas');
    }
});

/**
 *  CSS PARA TAREAS VENCIDAS (Usuario)
 */
const cssVencidas = `
<style>
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 🔴 TAREAS VENCIDAS - USUARIO */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* Contenedor de tarea vencida */
.user-task-item.tarea-vencida {
    border-left: 4px solid #dc3545 !important;
    background: linear-gradient(to right, rgba(220, 53, 69, 0.05), transparent) !important;
}

/* Badge de estado VENCIDA */
.task-badge.badge-estado.vencida {
    background: linear-gradient(135deg, #dc3545, #c82333) !important;
    color: white !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    padding: 6px 12px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    letter-spacing: 0.5px !important;
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3) !important;
}

/* Animación pulsante para vencidas */
@keyframes pulse-vencida {
    0%, 100% { 
        box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
    }
    50% { 
        box-shadow: 0 0 0 8px rgba(220, 53, 69, 0);
    }
}

.user-task-item.tarea-vencida {
    animation: pulse-vencida 2s infinite;
}

/* Barra de progreso vencida */
.user-task-item.tarea-vencida .progress-bar {
    background: linear-gradient(90deg, #dc3545, #c82333) !important;
}

/* Alert warning para vencidas */
.alert-warning {
    background: linear-gradient(135deg, #fff3cd, #ffe8a1);
    border-left: 4px solid #ffc107;
    padding: 15px;
    border-radius: 8px;
    display: flex;
    align-items: start;
    gap: 12px;
}

.alert-warning i {
    color: #ff9800;
    font-size: 20px;
    margin-top: 2px;
}

.alert-warning strong {
    color: #856404;
    display: block;
    margin-bottom: 5px;
}

.alert-warning p {
    margin: 0;
    color: #856404;
    font-size: 13px;
}

/* Hover effect */
.user-task-item.tarea-vencida:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
    .user-task-item.tarea-vencida {
        border-left-width: 3px !important;
    }
    
    .alert-warning {
        flex-direction: column;
        gap: 8px;
    }
}
</style>
`;

// Inyectar CSS
if (!document.getElementById('css-vencidas-usuario')) {
    const style = document.createElement('div');
    style.id = 'css-vencidas-usuario';
    style.innerHTML = cssVencidas;
    document.head.appendChild(style);
    (' CSS de tareas vencidas inyectado');
}

(' [VENCIDAS] Fix de tareas vencidas aplicado completamente en usuario');
(' [VENCIDAS] Sistema listo para detectar tareas vencidas');


// ==========================================
// 🔄 FIX: ACTUALIZACIÓN AUTOMÁTICA DE CUOTAS
// Detecta cuando el admin aprueba un pago
// ==========================================

console.log('🔄 Iniciando sistema de actualización automática de cuotas');

// Variable global para controlar el polling
let pollingCuotasActivo = false;
let pollingInterval = null;
let ultimoCheckCuotas = null;

/**
 * Verificar cambios en el estado de las cuotas
 */
async function verificarCambiosCuotas() {
    try {
        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();

        const response = await fetch(`/api/cuotas/mis-cuotas?mes=${mesActual}&anio=${anioActual}`);
        const data = await response.json();

        if (data.success && data.cuotas.length > 0) {
            const cuotaActual = data.cuotas[0];

            // Crear checksum para detectar cambios
            const checksum = `${cuotaActual.id_cuota}-${cuotaActual.estado}-${cuotaActual.estado_pago || 'none'}-${cuotaActual.estado_usuario || 'none'}`;

            console.log('🔍 [POLLING] Verificando cuota:', {
                id: cuotaActual.id_cuota,
                estado: cuotaActual.estado,
                estado_pago: cuotaActual.estado_pago,
                estado_usuario: cuotaActual.estado_usuario,
                checksum_actual: checksum,
                checksum_anterior: ultimoCheckCuotas
            });

            // Primera vez
            if (ultimoCheckCuotas === null) {
                ultimoCheckCuotas = checksum;
                console.log('✅ [POLLING] Checksum inicial guardado');
                return;
            }

            // Detectar cambio
            if (ultimoCheckCuotas !== checksum) {
                console.log('🔔 [POLLING] ¡CAMBIO DETECTADO EN CUOTA!');
                console.log('   Checksum anterior:', ultimoCheckCuotas);
                console.log('   Checksum nuevo:', checksum);

                // Actualizar checksum
                ultimoCheckCuotas = checksum;

                // Verificar si estamos en la sección de cuotas
                const cuotasSection = document.getElementById('cuotas-section');
                if (cuotasSection && cuotasSection.classList.contains('active')) {
                    console.log('✅ [POLLING] Usuario en sección cuotas, recargando...');
                    await recargarSeccionCuotas();
                    mostrarNotificacionActualizacion(cuotaActual);
                } else {
                    console.log('ℹ️ [POLLING] Usuario fuera de sección cuotas, no se recarga');
                }
            }
        }
    } catch (error) {
        console.error('❌ [POLLING] Error verificando cambios:', error);
    }
}

/**
 * Recargar sección de cuotas completamente
 */
async function recargarSeccionCuotas() {
    console.log('🔄 [RELOAD] Iniciando recarga completa de cuotas...');

    try {
        // 1. Limpiar cache
        ultimoCheckCuotas = null;

        // 2. Recargar deuda de horas
        await loadDeudaHorasParaCuotas();
        console.log('✅ [RELOAD] Deuda de horas recargada');

        // 3. Recargar cuotas
        await loadMisCuotas();
        console.log('✅ [RELOAD] Cuotas recargadas');

        // 4. Recargar info de vivienda
        await loadInfoViviendaCuota();
        console.log('✅ [RELOAD] Info vivienda recargada');

        console.log('✅ [RELOAD] Recarga completada exitosamente');

    } catch (error) {
        console.error('❌ [RELOAD] Error en recarga:', error);
    }
}

/**
 * Mostrar notificación de actualización
 */
function mostrarNotificacionActualizacion(cuota) {
    // Remover notificaciones anteriores
    const notifAnterior = document.getElementById('notif-actualizacion-cuota');
    if (notifAnterior) {
        notifAnterior.remove();
    }

    const estadoPago = cuota.estado_pago || cuota.estado;
    const estadoUsuario = cuota.estado_usuario || '';

    let mensaje = '';
    let icono = '';
    let color = '';

    if (estadoUsuario === 'aceptado' || estadoPago === 'aprobado') {
        mensaje = '¡Tu pago ha sido aprobado!';
        icono = 'fa-check-circle';
        color = '#4caf50';
    } else if (estadoPago === 'rechazado') {
        mensaje = 'Tu pago fue rechazado. Revisa las observaciones.';
        icono = 'fa-times-circle';
        color = '#f44336';
    } else {
        mensaje = 'Tu cuota ha sido actualizada';
        icono = 'fa-sync-alt';
        color = '#2196F3';
    }

    const notif = document.createElement('div');
    notif.id = 'notif-actualizacion-cuota';
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
        min-width: 300px;
        max-width: 400px;
    `;

    notif.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <i class="fas ${icono}" style="font-size: 32px;"></i>
            <div style="flex: 1;">
                <strong style="display: block; font-size: 16px; margin-bottom: 5px;">
                    ${mensaje}
                </strong>
                <p style="margin: 0; font-size: 13px; opacity: 0.9;">
                    La información ha sido actualizada automáticamente
                </p>
            </div>
            <button onclick="this.closest('#notif-actualizacion-cuota').remove()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; 
                           width: 30px; height: 30px; border-radius: 50%; cursor: pointer; 
                           font-size: 18px; line-height: 1;">
                ×
            </button>
        </div>
    `;

    // Agregar animación CSS
    if (!document.getElementById('notif-animation-style')) {
        const style = document.createElement('style');
        style.id = 'notif-animation-style';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notif);

    // Auto-remover después de 8 segundos
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.5s ease-in';
        setTimeout(() => notif.remove(), 500);
    }, 8000);

    console.log('🔔 [NOTIF] Notificación mostrada:', mensaje);
}

/**
 * Iniciar polling cuando se entra a sección cuotas
 */
function iniciarPollingCuotas() {
    if (pollingCuotasActivo) {
        console.log('ℹ️ [POLLING] Ya está activo, ignorando...');
        return;
    }

    console.log('▶️ [POLLING] Iniciando polling de cuotas (cada 15 segundos)');
    pollingCuotasActivo = true;

    // Verificar inmediatamente
    verificarCambiosCuotas();

    // Luego cada 15 segundos
    pollingInterval = setInterval(verificarCambiosCuotas, 15000);
}

/**
 * Detener polling cuando se sale de la sección
 */
function detenerPollingCuotas() {
    if (!pollingCuotasActivo) {
        return;
    }

    console.log('⏸️ [POLLING] Deteniendo polling de cuotas');
    pollingCuotasActivo = false;

    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }

    // Resetear checksum
    ultimoCheckCuotas = null;
}

/**
 * Override de inicializarSeccionCuotas para incluir polling
 */
const originalInicializarSeccionCuotas = window.inicializarSeccionCuotas;

window.inicializarSeccionCuotas = async function () {
    console.log('🔄 [OVERRIDE] inicializarSeccionCuotas con polling');

    try {
        // Ejecutar función original
        await originalInicializarSeccionCuotas();

        // Iniciar polling
        iniciarPollingCuotas();

        console.log('✅ [OVERRIDE] Sección cuotas inicializada con polling activo');

    } catch (error) {
        console.error('❌ [OVERRIDE] Error en inicialización:', error);
    }
};

/**
 * Listener para detectar cambio de sección
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('📋 [SETUP] Configurando listeners de sección cuotas');

    const menuItems = document.querySelectorAll('.menu li[data-section]');

    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const section = this.getAttribute('data-section');

            if (section === 'cuotas') {
                console.log('➡️ [SECTION] Usuario entró a cuotas');
                // Esperar un momento para que la sección se cargue
                setTimeout(() => {
                    iniciarPollingCuotas();
                }, 500);
            } else {
                console.log('⬅️ [SECTION] Usuario salió de cuotas');
                detenerPollingCuotas();
            }
        });
    });

    console.log('✅ [SETUP] Listeners configurados correctamente');
});

/**
 * Detener polling al salir de la página
 */
window.addEventListener('beforeunload', function () {
    detenerPollingCuotas();
});

/**
 * 🔒 Override renderCuotaCard para asegurar que se deshabilite correctamente
 */
const originalRenderCuotaCard = window.renderCuotaCard;

window.renderCuotaCard = function (cuota) {
    // Validación extra de estados
    const estadoFinal = cuota.estado_actual || cuota.estado;
    const estadoPago = cuota.estado_pago || '';
    const estadoUsuario = cuota.estado_usuario || '';
    const tienePagoPendiente = cuota.id_pago && estadoPago === 'pendiente';
    const pagoAprobado = estadoPago === 'aprobado' || estadoUsuario === 'aceptado';
    const esPagada = estadoFinal === 'pagada' || pagoAprobado;

    console.log('🎨 [RENDER CARD] Renderizando cuota:', {
        id: cuota.id_cuota,
        estado: estadoFinal,
        estado_pago: estadoPago,
        estado_usuario: estadoUsuario,
        tiene_pago_pendiente: tienePagoPendiente,
        pago_aprobado: pagoAprobado,
        es_pagada: esPagada
    });

    // Si está pagada o aprobada, asegurar que no se pueda pagar
    if (esPagada || pagoAprobado) {
        cuota.estado = 'pagada';
        cuota.estado_actual = 'pagada';
    }

    // Llamar a la función original
    return originalRenderCuotaCard(cuota);
};

// Exportar funciones
window.verificarCambiosCuotas = verificarCambiosCuotas;
window.recargarSeccionCuotas = recargarSeccionCuotas;
window.iniciarPollingCuotas = iniciarPollingCuotas;
window.detenerPollingCuotas = detenerPollingCuotas;

console.log('✅ Sistema de actualización automática de cuotas cargado completamente');

async function mostrarResumenDeuda() {
    const response = await fetch('/api/cuotas/resumen-deuda');
    const data = await response.json();

    if (data.success) {
        const resumen = data.resumen;

        const html = `
            <div class="resumen-deuda-widget">
                <h3>💰 Resumen de Deuda</h3>
                <div class="deuda-item">
                    <span>Cuotas pendientes:</span>
                    <strong>${resumen.cuotas_pendientes}</strong>
                </div>
                <div class="deuda-item">
                    <span>Mensualidades actuales:</span>
                    <strong>$${resumen.deuda_mensualidades.toLocaleString('es-UY')}</strong>
                </div>
                <div class="deuda-item">
                    <span>Deuda acumulada:</span>
                    <strong>$${resumen.deuda_acumulada.toLocaleString('es-UY')}</strong>
                </div>
                <div class="deuda-total">
                    <span>TOTAL A PAGAR:</span>
                    <strong>$${resumen.total_a_pagar.toLocaleString('es-UY')}</strong>
                </div>
            </div>
        `;

        document.getElementById('resumen-deuda-container').innerHTML = html;
    }
}

// Exportar funciones globales

window.closeEdit    /**
     *  Aprobar pago desde modal - OPTIMIZADO
     */
window.aprobarPagoDesdeModal = async function (pagoId, userId) {
    const modal = document.getElementById('detallesPagoModal');

    if (!confirm('¿Aprobar este pago?\n\nEl usuario será notificado.')) {
        return;
    }

    // Cerrar modal inmediatamente
    if (modal) modal.remove();

    // Mostrar indicador en la tabla
    const row = document.querySelector(`tr.user-row[data-estado="enviado"]`);
    if (row) {
        const actionsCell = row.querySelector('td:last-child');
        if (actionsCell) {
            actionsCell.innerHTML = '<span style="color: #17a2b8;"><i class="fas fa-spinner fa-spin"></i> Procesando...</span>';
        }
    }

    try {
        const formData = new FormData();
        formData.append('id_usuario', userId);

        const response = await fetch('/api/payment/approve', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Actualizar solo la fila afectada
            if (row) {
                row.querySelector('.estado-badge').textContent = 'Aceptado';
                row.querySelector('.estado-badge').className = 'estado-badge estado-aceptado';
                row.querySelector('td:last-child').innerHTML = `
                        <button class="btn-icon btn-primary" onclick="viewUserDetails(${userId})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <span class="badge badge-success" style="padding: 6px 12px;">
                            <i class="fas fa-check-circle"></i> Aprobado
                        </span>
                    `;
            }

            // Mostrar notificación sin bloquear
            const notification = document.createElement('div');
            notification.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #4CAF50;
                        color: white;
                        padding: 15px 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        z-index: 10000;
                        animation: slideIn 0.3s ease;
                    ">
                        <i class="fas fa-check-circle"></i> Pago aprobado correctamente
                    </div>
                `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);

        } else {
            alert('❌ Error: ' + data.message);
            // Recargar solo si hay error
            if (typeof loadUsersForTable === 'function') {
                loadUsersForTable();
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
        if (typeof loadUsersForTable === 'function') {
            loadUsersForTable();
        }
    }
};

// ==========================================
// FIN DEL ARCHIVO - VERIFICACIONES FINALES
// ==========================================

console.log('✅ dashboardUser.js cargado completamente');
console.log('📦 Funciones exportadas:', {
    inicializarSeccionCuotas: typeof window.inicializarSeccionCuotas,
    verificarCambiosCuotas: typeof window.verificarCambiosCuotas,
    abrirPagarDeudaTotal: typeof window.abrirPagarDeudaTotal,
    loadMisCuotas: typeof window.loadMisCuotas,
    marcarEntrada: typeof window.marcarEntrada,
    marcarSalida: typeof window.marcarSalida,
    loadUserTasks: typeof window.loadUserTasks,
    loadMisSolicitudes: typeof window.loadMisSolicitudes,
    verDetalleSolicitud: typeof window.verDetalleSolicitud,
    verificarEstadoNucleo: typeof window.verificarEstadoNucleo
});

// ==========================================
// 🔧 FIX COMPLETO: DEUDA ACUMULADA + FUNCIONES AUXILIARES
// Incluye todas las funciones necesarias para renderizar cuotas
// ==========================================

console.log('🔧 Aplicando fix completo con funciones auxiliares...');

// ========== 1. FUNCIONES AUXILIARES ==========

/**
 * ✅ Obtener precio actualizado de la cuota
 */
window.obtenerPrecioActualizado = function (cuota) {
    const precio = parseFloat(
        cuota.monto_base ||
        cuota.monto_actual ||
        cuota.monto ||
        0
    );

    console.log(`💰 Precio para cuota ${cuota.id_cuota}:`, {
        monto_base: cuota.monto_base,
        monto_actual: cuota.monto_actual,
        monto: cuota.monto,
        precio_final: precio
    });

    return precio;
};

/**
 * ✅ Obtener nombre del mes
 */
if (typeof obtenerNombreMes !== 'function') {
    window.obtenerNombreMes = function (mes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[parseInt(mes) - 1] || mes;
    };
}

/**
 * ✅ Formatear estado de cuota
 */
if (typeof formatEstadoCuota !== 'function') {
    window.formatEstadoCuota = function (estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'pagada': 'Pagada',
            'vencida': 'Vencida',
            'exonerada': 'Exonerada'
        };
        return estados[estado] || estado;
    };
}

/**
 * ✅ Truncar texto
 */
if (typeof truncarTexto !== 'function') {
    window.truncarTexto = function (texto, maxLength) {
        if (!texto || texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength) + '...';
    };
}

// ========== 2. RENDERIZAR TARJETA DE CUOTA INDIVIDUAL ==========

/**
 * ✅ Renderizar tarjeta de cuota (para historial y pendientes)
 */
window.renderCuotaCard = function (cuota) {
    const estadoFinal = cuota.estado_actual || cuota.estado;
    const mes = obtenerNombreMes(cuota.mes);
    const fechaVenc = new Date(cuota.fecha_vencimiento + 'T00:00:00');
    const fechaVencFormatted = fechaVenc.toLocaleDateString('es-UY');

    const esVencida = estadoFinal === 'vencida';
    const esPagada = cuota.estado === 'pagada';
    const tienePagoPendiente = cuota.id_pago && cuota.estado_pago === 'pendiente';

    // Calcular montos
    const montoCuota = obtenerPrecioActualizado(cuota);
    const deudaAcumuladaAnterior = parseFloat(cuota.monto_pendiente_anterior || 0);
    const deudaHorasMostrar = (estadoFinal !== 'pagada' && !tienePagoPendiente) ? (window.deudaHorasActual || 0) : 0;

    // Monto total a mostrar
    const montoMostrar = montoCuota + deudaAcumuladaAnterior + deudaHorasMostrar;

    // Si está pagada, obtener el monto realmente pagado
    const montoPagado = esPagada && cuota.monto_pagado ? parseFloat(cuota.monto_pagado) : montoMostrar;

    return `
        <div class="cuota-card estado-${estadoFinal}">
            <div class="cuota-card-header">
                <div>
                    <h4>${mes} ${cuota.anio}</h4>
                    <span class="cuota-vivienda">${cuota.numero_vivienda} - ${cuota.tipo_vivienda}</span>
                </div>
                <span class="cuota-badge badge-${estadoFinal}">
                    ${formatEstadoCuota(estadoFinal)}
                </span>
            </div>
            
            <div class="cuota-card-body">
                <div class="cuota-monto">
                    <span class="cuota-monto-label">${esPagada ? 'Monto Pagado:' : 'Monto Total:'}</span>
                    <span class="cuota-monto-valor">$${(esPagada ? montoPagado : montoMostrar).toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
                </div>
                
                ${esPagada && (deudaAcumuladaAnterior > 0 || deudaHorasMostrar > 0) ? `
                    <div class="cuota-desglose" style="background: rgba(76, 175, 80, 0.1); padding: 12px; border-radius: 8px; margin-top: 10px;">
                        <strong style="display: block; margin-bottom: 8px; color: #333; font-size: 13px;">📋 Desglose del pago:</strong>
                        <div style="display: grid; gap: 6px; font-size: 12px; color: #555;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Cuota vivienda:</span>
                                <strong>$${montoCuota.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                            </div>
                            ${deudaAcumuladaAnterior > 0 ? `
                                <div style="display: flex; justify-content: space-between; color: #ff9800;">
                                    <span>+ Deuda acumulada:</span>
                                    <strong>$${deudaAcumuladaAnterior.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                                </div>
                            ` : ''}
                            ${deudaHorasMostrar > 0 ? `
                                <div style="display: flex; justify-content: space-between; color: #f44336;">
                                    <span>+ Deuda horas:</span>
                                    <strong>$${deudaHorasMostrar.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</strong>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : !esPagada && !tienePagoPendiente && (deudaAcumuladaAnterior > 0 || deudaHorasMostrar > 0) ? `
                    <div class="cuota-desglose">
                        <small style="color: #666;">
                            Cuota: $${montoCuota.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
                            ${deudaAcumuladaAnterior > 0 ? ` + Deuda anterior: $${deudaAcumuladaAnterior.toLocaleString('es-UY', { minimumFractionDigits: 2 })}` : ''}
                            ${deudaHorasMostrar > 0 ? ` + Deuda horas: $${deudaHorasMostrar.toLocaleString('es-UY', { minimumFractionDigits: 2 })}` : ''}
                        </small>
                    </div>
                ` : ''}
                
                <div class="cuota-info-grid">
                    <div class="cuota-info-item">
                        <i class="fas fa-calendar"></i>
                        <span>Vencimiento: ${fechaVencFormatted}</span>
                    </div>
                    <div class="cuota-info-item">
                        <i class="fas fa-clock"></i>
                        <span>Horas: ${cuota.horas_cumplidas || 0}h / ${cuota.horas_requeridas}h</span>
                    </div>
                </div>
                
                ${tienePagoPendiente ? `
                    <div class="alert-info" style="margin-top: 10px;">
                        <i class="fas fa-hourglass-half"></i>
                        <strong>Pago pendiente de validación</strong>
                        <p style="margin: 5px 0 0 0; font-size: 12px;">
                            Enviado el ${new Date(cuota.fecha_pago).toLocaleDateString('es-UY')}
                        </p>
                    </div>
                ` : ''}
                
                ${cuota.estado_pago === 'rechazado' ? `
                    <div class="alert-warning" style="margin-top: 10px;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Pago rechazado</strong>
                        <p style="margin: 5px 0 0 0; font-size: 12px;">Debes volver a realizar el pago</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="cuota-card-footer">
                ${cuota.comprobante_archivo ? `
                    <button class="btn btn-secondary btn-small" onclick="verComprobante('${cuota.comprobante_archivo}')">
                        <i class="fas fa-image"></i> Ver Comprobante
                    </button>
                ` : ''}
                
                ${estadoFinal !== 'pagada' && !tienePagoPendiente ? `
                    <button class="btn btn-primary btn-small" onclick="abrirPagarDeudaTotal(${cuota.id_cuota}, ${montoMostrar})">
                        <i class="fas fa-credit-card"></i> Pagar Ahora
                    </button>
                ` : ''}
                
                ${tienePagoPendiente ? `
                    <button class="btn btn-secondary btn-small" disabled title="Pago en revisión">
                        <i class="fas fa-hourglass-half"></i> En Validación
                    </button>
                ` : ''}
            </div>
        </div>
    `;
};

// ========== 3. RENDERIZAR CUOTAS ORGANIZADAS (PRINCIPAL) ==========

/**
 * ✅ OVERRIDE: renderMisCuotasOrganizadas - VERSION COMPLETA
 */
window.renderMisCuotasOrganizadas = function (cuotas) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 [RENDER] Iniciando renderizado de cuotas');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');


    const container = document.getElementById('misCuotasContainer');

    if (!cuotas || cuotas.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; margin-bottom: 10px;"></i>
                <p data-i18n="dashboardUser.billing.notFoundFilters">No se encontraron cuotas con los filtros seleccionados</p>
            </div>
        `;
        return;
    }

    let html = '';

    // ✅ CUOTA DEL MES ACTUAL
    const cuotaMasReciente = cuotas[0];
    console.log('📋 [RENDER] Cuota más reciente:', cuotaMasReciente);

    // 🔥 CRÍTICO: Obtener deuda de horas de la variable global
    const deudaHoras = parseFloat(window.deudaHorasActual || 0);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 [RENDER] DEUDA DE HORAS:');
    console.log('   window.deudaHorasActual:', window.deudaHorasActual);
    console.log('   deudaHoras (parseado):', deudaHoras);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');



    const montoCuota = parseFloat(cuotaMasReciente.monto_base || cuotaMasReciente.monto_actual || cuotaMasReciente.monto || 0);


    // 🔥 DEUDA ACUMULADA DE MESES ANTERIORES
    const deudaAcumuladaAnterior = parseFloat(cuotaMasReciente.monto_pendiente_anterior || 0);


    const montoPendienteBase = montoCuota + deudaAcumuladaAnterior;

    // 🔥 MONTO TOTAL
    const montoTotal = montoCuota + deudaAcumuladaAnterior + deudaHoras;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 [RENDER] CÁLCULO COMPLETO:');
    console.log('   monto_cuota:', montoCuota);
    console.log('   deuda_meses_anteriores:', deudaAcumuladaAnterior);
    console.log('   deuda_horas_actual:', deudaHoras);
    console.log('   ✅ TOTAL A PAGAR:', montoTotal);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // ⚠️ VALIDACIÓN CRÍTICA
    if (deudaHoras === 0 && window.deudaHorasActual > 0) {
        console.error('❌ [ERROR] deudaHoras es 0 pero window.deudaHorasActual es:', window.deudaHorasActual);
        console.error('   Esto indica un problema en el parseo. Forzando valor...');
        // NO hacer nada aquí, el parseFloat ya debería funcionar
    }

    // ✅ VERIFICAR ESTADOS
    const estadoFinal = cuotaMasReciente.estado_actual || cuotaMasReciente.estado;
    const estadoPago = cuotaMasReciente.estado_pago || '';
    const estadoUsuario = cuotaMasReciente.estado_usuario || '';
    const tienePagoPendiente = cuotaMasReciente.id_pago && estadoPago === 'pendiente';
    const pagoAprobado = estadoUsuario === 'aceptado' || (estadoPago === 'aprobado' && estadoFinal === 'pagada');
    const estaPagada = estadoFinal === 'pagada' || pagoAprobado;

    // ✅ VERIFICAR PERIODO DE PAGO
    const hoy = new Date();
    const diaActual = hoy.getDate();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    const esMesCuota = cuotaMasReciente.mes == mesActual && cuotaMasReciente.anio == anioActual;
    const estaDentroPeriodoPago = diaActual >= 25;
    const puedePagar = esMesCuota && estaDentroPeriodoPago && !estaPagada && !tienePagoPendiente;
    const diasParaPagar = estaDentroPeriodoPago ? 0 : Math.max(0, 25 - diaActual);

    // ✅ RENDERIZAR HTML
    html += `
        <div class="deuda-total-destacada ${estaPagada ? 'pagada-mes' : puedePagar ? '' : 'periodo-bloqueado'}">
            <div class="deuda-total-header">
                <h2 style="margin: 0; color: #fff;">
                    <i class="fas ${estaPagada ? 'fa-check-circle' : puedePagar ? 'fa-exclamation-triangle' : 'fa-calendar-alt'}"></i>
                    <span data-i18n="dashboardUser.billing.summary.currentMonth">Resumen del Mes Actual</span>
                </h2>
                <span class="deuda-total-badge ${estaPagada ? 'badge-pagada' : tienePagoPendiente ? 'badge-pendiente' : puedePagar ? 'badge-requerida' : 'badge-bloqueado'}">
                    ${estaPagada ? ' <span data-i18n="dashboardUser.billing.summary.paid">✅ PAGADA</span>' :
            tienePagoPendiente ? '<span data-i18n="dashboardUser.billing.summary.inReview">⏳ EN VALIDACIÓN</span>' :
                puedePagar ? '<span data-i18n="dashboardUser.billing.summary.openPaymentPeriod">⚠️ PERIODO DE PAGO ABIERTO</span>' :
                    diasParaPagar > 0 ? `🔒 ${diasParaPagar} <span data-i18n="dashboardUser.billing.summary.day">DÍA</span>${diasParaPagar !== 1 ? 'S' : ''} <span data-i18n="dashboardUser.billing.summary.toPay">PARA PAGAR</span>` :
                        '<span data-i18n="dashboardUser.billing.summary.overdue">❌ VENCIDA</span>'}
                </span>
            </div>
            
            <div class="deuda-total-body">
                <div class="deuda-breakdown">
                    <div class="deuda-breakdown-item">
                        <i class="fas fa-home"></i>
                        <div>
                            <span class="deuda-label" data-i18n="dashboardUser.billing.summary.houseFee">Cuota de Vivienda</span>
                            <span class="deuda-monto">$${montoCuota.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    
                   ${deudaAcumuladaAnterior > 0 ? `


 <div class="deuda-breakdown-item deuda-acumulada">
 <i class="fas fa-exclamation-triangle"></i>
 <div>
 <span class="deuda-label" data-i18n="dashboardUser.billing.summary.previousMonthsDebt">Deuda de Meses Anteriores</span>
<span class="deuda-monto error">
$${deudaAcumuladaAnterior.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
</span>
<small style="color: #ff8a80; display: block; margin-top: 5px;" data-i18n="dashboardUser.billing.summary.previousMonthsDebtNote">
(Cuotas vencidas no pagadas)
</small>
</div>
</div>
` : ''}
                    
   
                    
                   ${deudaHoras > 0 ? `
    <div class="deuda-breakdown-item deuda-horas">
        <i class="fas fa-clock"></i>
        <div>
            <span class="deuda-label" data-i18n="dashboardUser.billing.summary.hoursNotWorkedDebt">Deuda por Horas No Trabajadas</span>
            <span class="deuda-monto ${deudaHoras > 0 ? 'error' : 'success'}">$${deudaHoras.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
            <small style="color: ${deudaHoras > 0 ? '#ff8a80' : '#81c784'}; display: block; margin-top: 5px;">
                ${deudaHoras > 0 ? '<span data-i18n="dashboardUser.billing.summary.hoursNotWorkedDebtNote">($160 por hora × horas faltantes)</span>' : '<span data-i18n="dashboardUser.billing.summary.noHoursNotWorkedDebt">¡Sin deuda de horas!</span>'}
            </small>
        </div>
    </div>
` : ''}


                    
                    <div class="deuda-breakdown-divider">=</div>
                    
                    <div class="deuda-breakdown-item deuda-total">
                        <i class="fas fa-calculator"></i>
                        <div>
                            <span class="deuda-label"> <span data-i18n="dashboardUser.billing.summary.total">TOTAL</span> ${estaPagada ? '<span data-i18n="dashboardUser.billing.summary.totalPaid">PAGADO</span>' : '<span data-i18n="dashboardUser.billing.summary.toPay">A PAGAR</span>'}</span>
                            <span class="deuda-monto-total" style="color: ${estaPagada ? '#4caf50' : '#fff'};">$${montoTotal.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
                
                ${estaPagada ? `
                    <div class="alert-success" style="margin-top: 20px;">
                        <strong style="color: #4caf50;" data-i18n="dashboardUser.billing.summary.paymentCompleted">🎉 ¡Pago Completado!</strong>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                            <span data-i18n="dashboardUser.billing.summary.paymentSuccess">Has pagado exitosamente tu cuota de</span>${obtenerNombreMes(cuotaMasReciente.mes)} ${cuotaMasReciente.anio}.
                        </p>
                    </div>
                ` : tienePagoPendiente ? `
                    <div class="alert-info" style="margin-top: 20px;">
                        <strong style="color: #2196F3;" data-i18n="dashboardUser.billing.paymentReview">⏳ Pago en Revisión</strong>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;" data-i18n="dashboardUser.billing.summary.paymentInReviewNote">Tu pago está siendo validado.</p>
                    </div>
                ` : puedePagar ? `
                    <div class="deuda-total-actions">
                        <button class="btn-pagar-deuda-total" onclick="abrirPagarDeudaTotal(${cuotaMasReciente.id_cuota}, ${montoTotal})">
                            <i class="fas fa-credit-card"></i> <span data-i18n="dashboardUser.billing.payNow">Pagar Ahora</span>
                        </button>
                    </div>
                    <div class="alert-success" style="margin-top: 20px;">
                        <strong style="color: #4caf50;" data-i18n="dashboardUser.billing.summary.paymentEnabled">✓ Periodo de Pago Habilitado</strong>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;" data-i18n="dashboardUser.billing.summary.paymentEnabledNote">Ya puedes realizar el pago.</p>
                    </div>
                ` : diasParaPagar > 0 ? `
                    <div class="deuda-total-actions">
                        <button class="btn-pagar-deuda-total" disabled style="opacity: 0.5; cursor: not-allowed;">
                            <i class="fas fa-lock"></i> <span data-i18n="dashboardUser.billing.paymentBlocked">Pago Bloqueado</span>
                        </button>
                    </div>
                    <div class="alert-warning" style="margin-top: 20px;">
                        <strong style="color: #ff9800;" data-i18n="dashboardUser.billing.workingPeriod">🔒 Periodo de Trabajo en Curso</strong>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                            <span data-i18n="dashboardUser.billing.workingPeriodNote">Podrás pagar en</span> ${diasParaPagar} <span data-i18n="dashboardUser.billing.workingPeriodDays">día</span>${diasParaPagar !== 1 ? 's' : ''}.
                        </p>
                    </div>
                ` : `
                    <div class="alert-error" style="margin-top: 20px;">
                        <strong style="color: #f44336;" data-i18n="dashboardUser.billing.dueFeeExpired">❌ Cuota Vencida</strong>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;" data-i18n="dashboardUser.billing.dueFeeExpiredNote">La deuda se acumulará.</p>
                    </div>
                `}
            </div>
        </div>
        <hr style="margin: 40px 0; border: none; border-top: 2px solid #e0e0e0;">
    `;

    // Historial y otras cuotas
    const cuotasPagables = cuotas.filter(c => (c.estado_actual || c.estado) !== 'pagada');
    const cuotasHistorial = cuotas.filter(c => (c.estado_actual || c.estado) === 'pagada');

    if (cuotasPagables.length > 1) {
        html += `<div class="cuotas-section"><h3 data-i18n="dashboardUser.billing.pending.title">Otras Pendientes</h3><div class="cuotas-grid">`;
        cuotasPagables.slice(1).forEach(c => html += renderCuotaCard(c));
        html += `</div></div><hr style="margin: 40px 0;">`;
    }

    html += `<div class="cuotas-section"><h3 data-i18n="dashboardUser.billing.history.title">Historial</h3>`;
    if (cuotasHistorial.length > 0) {
        html += '<div class="cuotas-grid">';
        cuotasHistorial.forEach(c => html += renderCuotaCard(c));
        html += '</div>';
    } else {
        html += '<p style="color: #999; text-align: center;" data-i18n="dashboardUser.billing.history.empty">No hay cuotas en historial</p>';
    }
    html += '</div>';
    console.log("🚀 Archivo de cuotas cargado correctamente");

    container.innerHTML = html;
    console.log("¿Existe window.i18n?:", !!window.i18n);
    console.log("¿Está inicializado?:", window.i18n?.isInitialized());
    i18n.translatePage();
    // AL PARECER ESTE ES EL BLOQUE CORRECTO, ESTE ES EL QUE EJECUTA AL PARECER

};

console.log('✅ Fix completo aplicado con todas las funciones auxiliares');
