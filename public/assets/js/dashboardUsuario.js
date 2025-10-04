// ==========================================
// DASHBOARD USUARIO - JAVASCRIPT
// ==========================================

// Sistema SPA - Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu li');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Limpiar activo
            menuItems.forEach(mi => mi.classList.remove('activo'));
            
            // Activar seleccionado
            this.classList.add('activo');
            const sectionId = this.getAttribute('data-section') + '-section';
            
            // Ocultar todas las secciones
            document.querySelectorAll('.section-content').forEach(s => {
                s.classList.remove('active');
            });
            
            // Mostrar la seleccionada
            const targetSection = document.getElementById(sectionId);
            if (targetSection) targetSection.classList.add('active');
        });
    });

    // Cargar notificaciones al inicio
    loadNotifications();
    setInterval(loadNotifications, 120000); // Actualizar cada 2 minutos
    
    // Cargar tareas cuando se abre esa sección
    const tareasMenuItem = document.querySelector('.menu li[data-section="tareas"]');
    if (tareasMenuItem) {
        tareasMenuItem.addEventListener('click', function() {
            loadUserTasks();
        });
    }
});

// ========== GESTIÓN DE NOTIFICACIONES ==========

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

// ========== GESTIÓN DE TAREAS ==========

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
            console.error('Error al cargar tareas');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

function renderUserTasks(tareas, containerId, esNucleo = false) {
    const container = document.getElementById(containerId);
    
    if (!tareas || tareas.length === 0) {
        container.innerHTML = '<div class="no-tasks">No tienes tareas asignadas</div>';
        return;
    }
    
    container.innerHTML = tareas.map(tarea => {
        const fechaInicio = new Date(tarea.fecha_inicio).toLocaleDateString('es-UY');
        const fechaFin = new Date(tarea.fecha_fin).toLocaleDateString('es-UY');
        const progreso = tarea.progreso || 0;
        const esCompletada = tarea.estado_usuario === 'completada';
        
        return `
            <div class="user-task-item prioridad-${tarea.prioridad} ${esCompletada ? 'completada' : ''}">
                <div class="user-task-header">
                    <h4 class="user-task-title">${tarea.titulo}</h4>
                    <div class="user-task-badges">
                        <span class="task-badge badge-estado">${formatEstadoUsuario(tarea.estado_usuario)}</span>
                        <span class="task-badge badge-prioridad ${tarea.prioridad}">${formatPrioridad(tarea.prioridad)}</span>
                        ${esNucleo ? '<span class="task-badge" style="background: #6f42c1; color: white;">Núcleo</span>' : ''}
                    </div>
                </div>
                
                <p class="user-task-description">${tarea.descripcion}</p>
                
                <div class="user-task-meta">
                    <div>📅 <strong>Inicio:</strong> ${fechaInicio}</div>
                    <div>⏰ <strong>Fin:</strong> ${fechaFin}</div>
                    <div>👤 <strong>Creado por:</strong> ${tarea.creador}</div>
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
                        <button class="btn-small btn-detalles" onclick="viewUserTaskDetails(${tarea.id_tarea})">
                            Ver Detalles
                        </button>
                    </div>
                ` : '<p style="color: #28a745; margin-top: 10px;"><strong>✓ Tarea completada</strong></p>'}
            </div>
        `;
    }).join('');
}

function updateTasksSummary(tareasUsuario, tareasNucleo) {
    const todasTareas = [...tareasUsuario, ...tareasNucleo];
    
    const pendientes = todasTareas.filter(t => t.estado_usuario === 'pendiente').length;
    const enProgreso = todasTareas.filter(t => t.estado_usuario === 'en_progreso').length;
    const completadas = todasTareas.filter(t => t.estado_usuario === 'completada').length;
    
    document.getElementById('pending-count').textContent = pendientes;
    document.getElementById('progress-count').textContent = enProgreso;
    document.getElementById('completed-count').textContent = completadas;
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
    
    if (progresoNum < 100) {
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
    formData.append('tarea_id', tareaId);
    formData.append('comentario', comentario);
    formData.append('progreso_reportado', progresoNum);
    
    fetch('/api/tasks/add-avance', {
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
        alert('Error al reportar avance');
    });
}

async function viewUserTaskDetails(tareaId) {
    try {
        const response = await fetch(`/api/tasks/details?tarea_id=${tareaId}`);
        const data = await response.json();
        
        if (data.success) {
            mostrarDetallesTareaUsuario(data.tarea, data.avances);
        } else {
            alert('Error al cargar detalles');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

function mostrarDetallesTareaUsuario(tarea, avances) {
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
                            ${avance.archivo ? `<a href="/files/?path=${avance.archivo}" target="_blank" class="file-link">📎 Ver archivo adjunto</a>` : ''}
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