document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu li');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
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
        viviendaMenuItem.addEventListener('click', function() {
            loadMyVivienda();
        });
    }
    
    // Listener para Tareas - SOLO cuando se hace click
    const tareasMenuItem = document.querySelector('.menu li[data-section="tareas"]');
    if (tareasMenuItem) {
        tareasMenuItem.addEventListener('click', function() {
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
            '<div class="no-notifications">No se pudieron cargar las notificaciones</div>';
    }
}

function renderNotifications(notifications, unreadCount) {
    const badge = document.getElementById('notificationsBadge');
    const list = document.getElementById('notificationsList');
    
    badge.textContent = unreadCount;
    badge.className = 'notifications-badge' + (unreadCount === 0 ? ' zero' : '');
    
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

// ========== VER DETALLES CON MATERIALES ==========

async function viewUserTaskDetails(tareaId) {
    try {
        const responseTask = await fetch(`/api/tasks/details?tarea_id=${tareaId}`);
        const dataTask = await responseTask.json();
        
        const responseMaterials = await fetch(`/api/materiales/task-materials?tarea_id=${tareaId}`);
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
        const response = await fetch(`/api/materiales/task-materials?tarea_id=${tareaId}`);
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

// ==========================================
// MI VIVIENDA (USUARIO)
// ==========================================

function loadMyVivienda() {
    const container = document.getElementById('myViviendaContainer');
    
    if (!container) {
        console.error('Container myViviendaContainer NO encontrado');
        return;
    }
    
    container.innerHTML = '<p class="loading">Cargando información de vivienda...</p>';
    
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
                container.innerHTML = '<p>Aún no tienes una vivienda asignada.</p>';
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
                    <strong>📏 Superficie:</strong>
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
// REGISTRO DE HORAS - USUARIO
// Agregar AL FINAL de dashboardUsuario.js
// ==========================================

console.log('🟢 Cargando módulo de Registro de Horas');

// Variables globales
let relojInterval;
let registroAbiertoId = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    // Iniciar reloj
    updateClock();
    relojInterval = setInterval(updateClock, 1000);
    
    // Listener para sección horas
    const horasMenuItem = document.querySelector('.menu li[data-section="horas"]');
    if (horasMenuItem) {
        horasMenuItem.addEventListener('click', function() {
            console.log('>>> Sección horas abierta');
            inicializarSeccionHoras();
        });
    }
});

// ========== RELOJ EN TIEMPO REAL ==========
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const clockElement = document.getElementById('current-time-display');
    if (clockElement) {
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// ========== INICIALIZAR SECCIÓN ==========
function inicializarSeccionHoras() {
    console.log('>>> Inicializando sección de horas');
    verificarRegistroAbierto();
    loadResumenSemanal();
    loadMisRegistros();
}

// ========== VERIFICAR SI HAY REGISTRO ABIERTO HOY ==========
async function verificarRegistroAbierto() {
    try {
        const response = await fetch('/api/horas/registro-abierto');
        const data = await response.json();
        
        console.log('Registro abierto:', data);
        
        if (data.success && data.registro) {
            // Hay registro abierto
            registroAbiertoId = data.registro.id_registro;
            mostrarBotonSalida(data.registro.hora_entrada);
        } else {
            // No hay registro abierto
            registroAbiertoId = null;
            mostrarBotonEntrada();
        }
        
        // Actualizar estadísticas
        cargarEstadisticas();
        
    } catch (error) {
        console.error('Error al verificar registro:', error);
        mostrarBotonEntrada();
    }
}

// ========== MOSTRAR BOTONES ==========
function mostrarBotonEntrada() {
    document.getElementById('btn-entrada').style.display = 'inline-block';
    document.getElementById('btn-salida').style.display = 'none';
    document.getElementById('registro-activo-info').style.display = 'none';
}

function mostrarBotonSalida(horaEntrada) {
    document.getElementById('btn-entrada').style.display = 'none';
    document.getElementById('btn-salida').style.display = 'inline-block';
    
    const infoDiv = document.getElementById('registro-activo-info');
    infoDiv.style.display = 'block';
    
    const horaEntradaSpan = document.getElementById('hora-entrada-activa');
    horaEntradaSpan.textContent = horaEntrada.substring(0, 5); // HH:MM
}

// ========== MARCAR ENTRADA ==========
async function marcarEntrada() {
    const descripcion = prompt('Describe brevemente tu trabajo de hoy (opcional):');
    if (descripcion === null) return; // Usuario canceló
    
    const btnEntrada = document.getElementById('btn-entrada');
    btnEntrada.disabled = true;
    btnEntrada.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
    
    try {
        const formData = new FormData();
        formData.append('fecha', new Date().toISOString().split('T')[0]);
        formData.append('hora_entrada', new Date().toTimeString().split(' ')[0]);
        formData.append('descripcion', descripcion || '');
        
        const response = await fetch('/api/horas/iniciar', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ ' + data.message);
            registroAbiertoId = data.id_registro;
            verificarRegistroAbierto();
            loadMisRegistros();
        } else {
            alert('❌ ' + data.message);
            btnEntrada.disabled = false;
            btnEntrada.innerHTML = '<i class="fas fa-sign-in-alt"></i> Marcar Entrada';
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
        btnEntrada.disabled = false;
        btnEntrada.innerHTML = '<i class="fas fa-sign-in-alt"></i> Marcar Entrada';
    }
}

// ========== MARCAR SALIDA ==========
async function marcarSalida() {
    if (!registroAbiertoId) {
        alert('No hay registro activo');
        return;
    }
    
    if (!confirm('¿Deseas registrar tu salida?')) return;
    
    const btnSalida = document.getElementById('btn-salida');
    btnSalida.disabled = true;
    btnSalida.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
    
    try {
        const formData = new FormData();
        formData.append('id_registro', registroAbiertoId);
        formData.append('hora_salida', new Date().toTimeString().split(' ')[0]);
        
        const response = await fetch('/api/horas/cerrar', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`✅ ${data.message}\n\nTotal trabajado: ${data.total_horas} horas`);
            registroAbiertoId = null;
            verificarRegistroAbierto();
            loadMisRegistros();
            loadResumenSemanal();
        } else {
            alert('❌ ' + data.message);
            btnSalida.disabled = false;
            btnSalida.innerHTML = '<i class="fas fa-sign-out-alt"></i> Marcar Salida';
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
        btnSalida.disabled = false;
        btnSalida.innerHTML = '<i class="fas fa-sign-out-alt"></i> Marcar Salida';
    }
}

// ========== CARGAR ESTADÍSTICAS ==========
async function cargarEstadisticas() {
    try {
        const responseResumen = await fetch('/api/horas/resumen-semanal');
        const dataResumen = await responseResumen.json();
        
        const responseStats = await fetch('/api/horas/estadisticas');
        const dataStats = await responseStats.json();
        
        if (dataResumen.success) {
            document.getElementById('horas-semana').textContent = 
                (dataResumen.resumen.total_horas || 0) + 'h';
            document.getElementById('dias-semana').textContent = 
                dataResumen.resumen.dias_trabajados || 0;
        }
        
        if (dataStats.success) {
            document.getElementById('horas-mes').textContent = 
                (dataStats.estadisticas.total_horas || 0) + 'h';
        }
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ========== RESUMEN SEMANAL ==========
async function loadResumenSemanal() {
    const container = document.getElementById('resumen-semanal-container');
    container.innerHTML = '<p class="loading">Cargando...</p>';
    
    try {
        const response = await fetch('/api/horas/resumen-semanal');
        const data = await response.json();
        
        if (data.success) {
            renderResumenSemanal(data.resumen);
        } else {
            container.innerHTML = '<p class="error">Error al cargar resumen</p>';
        }
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

function renderResumenSemanal(resumen) {
    const container = document.getElementById('resumen-semanal-container');
    
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const registrosPorDia = {};
    
    // Organizar registros por día
    resumen.registros.forEach(reg => {
        registrosPorDia[reg.fecha] = reg;
    });
    
    // Generar fechas de la semana
    const fechaInicio = new Date(resumen.semana.inicio);
    const fechas = [];
    for (let i = 0; i < 5; i++) {
        const fecha = new Date(fechaInicio);
        fecha.setDate(fecha.getDate() + i);
        fechas.push(fecha.toISOString().split('T')[0]);
    }
    
    let html = `
        <div class="resumen-semana-header">
            <p><strong>Semana del ${formatearFecha(resumen.semana.inicio)} al ${formatearFecha(resumen.semana.fin)}</strong></p>
            <p>Total: <strong>${resumen.total_horas}h</strong> | Días trabajados: <strong>${resumen.dias_trabajados}</strong></p>
        </div>
        <div class="resumen-dias-grid">
    `;
    
    fechas.forEach((fecha, index) => {
        const registro = registrosPorDia[fecha];
        const dia = diasSemana[index];
        const fechaFormateada = formatearFecha(fecha);
        
        html += `
            <div class="dia-card ${registro ? 'con-registro' : 'sin-registro'}">
                <div class="dia-header">
                    <strong>${dia}</strong>
                    <span class="dia-fecha">${fechaFormateada}</span>
                </div>
                <div class="dia-content">
        `;
        
        if (registro) {
            const entrada = registro.hora_entrada ? registro.hora_entrada.substring(0, 5) : '--:--';
            const salida = registro.hora_salida ? registro.hora_salida.substring(0, 5) : '--:--';
            const horas = registro.total_horas || 0;
            const estadoBadge = getEstadoBadge(registro.estado);
            
            html += `
                <p><i class="fas fa-sign-in-alt"></i> Entrada: <strong>${entrada}</strong></p>
                <p><i class="fas fa-sign-out-alt"></i> Salida: <strong>${salida}</strong></p>
                <p><i class="fas fa-clock"></i> Total: <strong>${horas}h</strong></p>
                ${estadoBadge}
            `;
        } else {
            html += '<p class="no-registro">Sin registro</p>';
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
        'pendiente': '<span class="badge-estado pendiente">Pendiente</span>',
        'aprobado': '<span class="badge-estado aprobado">✓ Aprobado</span>',
        'rechazado': '<span class="badge-estado rechazado">✗ Rechazado</span>'
    };
    return badges[estado] || '';
}

// ========== HISTORIAL DE REGISTROS ==========
async function loadMisRegistros() {
    const container = document.getElementById('historial-registros-container');
    container.innerHTML = '<p class="loading">Cargando registros...</p>';
    
    try {
        const response = await fetch('/api/horas/mis-registros');
        const data = await response.json();
        
        if (data.success) {
            renderHistorialRegistros(data.registros);
        } else {
            container.innerHTML = '<p class="error">Error al cargar registros</p>';
        }
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

function renderHistorialRegistros(registros) {
    const container = document.getElementById('historial-registros-container');
    
    if (!registros || registros.length === 0) {
        container.innerHTML = '<p class="no-data">No hay registros</p>';
        return;
    }
    
    let html = `
        <div class="registros-table-wrapper">
            <table class="registros-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Entrada</th>
                        <th>Salida</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    registros.forEach(reg => {
        const fecha = formatearFecha(reg.fecha);
        const entrada = reg.hora_entrada ? reg.hora_entrada.substring(0, 5) : '--:--';
        const salida = reg.hora_salida ? reg.hora_salida.substring(0, 5) : 'En curso';
        const horas = reg.total_horas || '0';
        const estado = reg.estado || 'pendiente';
        const descripcion = reg.descripcion || '-';
        
        const puedeEditar = estado === 'pendiente' && reg.hora_salida !== null;
        
        html += `
            <tr class="registro-row estado-${estado}">
                <td>${fecha}</td>
                <td>${entrada}</td>
                <td>${salida}</td>
                <td><strong>${horas}h</strong></td>
                <td>
                    <span class="badge-estado ${estado}">
                        ${formatearEstado(estado)}
                    </span>
                </td>
                <td class="descripcion-cell">${descripcion}</td>
                <td>
                    ${puedeEditar ? `
                        <button class="btn-small btn-edit" onclick="editarRegistro(${reg.id_registro})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}
                    ${reg.observaciones ? `
                        <button class="btn-small btn-info" onclick="verObservaciones('${reg.observaciones.replace(/'/g, "\\'")}')">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    ` : ''}
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

function formatearEstado(estado) {
    const estados = {
        'pendiente': 'Pendiente',
        'aprobado': 'Aprobado',
        'rechazado': 'Rechazado'
    };
    return estados[estado] || estado;
}

function formatearFecha(fecha) {
    const f = new Date(fecha + 'T00:00:00');
    return f.toLocaleDateString('es-UY', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
}

// ========== FILTRAR REGISTROS ==========
async function filtrarRegistros() {
    const fechaInicio = document.getElementById('filtro-fecha-inicio').value;
    const fechaFin = document.getElementById('filtro-fecha-fin').value;
    
    if (!fechaInicio || !fechaFin) {
        alert('Selecciona ambas fechas');
        return;
    }
    
    if (fechaInicio > fechaFin) {
        alert('La fecha de inicio debe ser anterior a la fecha de fin');
        return;
    }
    
    const container = document.getElementById('historial-registros-container');
    container.innerHTML = '<p class="loading">Filtrando...</p>';
    
    try {
        const url = `/api/horas/mis-registros?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            renderHistorialRegistros(data.registros);
        } else {
            container.innerHTML = '<p class="error">Error al filtrar</p>';
        }
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== EDITAR REGISTRO ==========
async function editarRegistro(idRegistro) {
    try {
        // Obtener datos del registro
        const response = await fetch(`/api/horas/mis-registros`);
        const data = await response.json();
        
        if (!data.success) {
            alert('Error al cargar datos');
            return;
        }
        
        const registro = data.registros.find(r => r.id_registro == idRegistro);
        
        if (!registro) {
            alert('Registro no encontrado');
            return;
        }
        
        // Llenar formulario
        document.getElementById('edit-id-registro').value = registro.id_registro;
        document.getElementById('edit-hora-entrada').value = registro.hora_entrada.substring(0, 5);
        document.getElementById('edit-hora-salida').value = registro.hora_salida ? registro.hora_salida.substring(0, 5) : '';
        document.getElementById('edit-descripcion').value = registro.descripcion || '';
        
        // Mostrar modal
        document.getElementById('editarRegistroModal').style.display = 'flex';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar registro');
    }
}

function closeEditarRegistroModal() {
    document.getElementById('editarRegistroModal').style.display = 'none';
    document.getElementById('editarRegistroForm').reset();
}

async function submitEditarRegistro(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('id_registro', document.getElementById('edit-id-registro').value);
    formData.append('hora_entrada', document.getElementById('edit-hora-entrada').value + ':00');
    
    const horaSalida = document.getElementById('edit-hora-salida').value;
    if (horaSalida) {
        formData.append('hora_salida', horaSalida + ':00');
    }
    
    formData.append('descripcion', document.getElementById('edit-descripcion').value);
    
    try {
        const response = await fetch('/api/horas/editar', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ ' + data.message);
            closeEditarRegistroModal();
            loadMisRegistros();
            loadResumenSemanal();
        } else {
            alert('❌ ' + data.message);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// ========== VER OBSERVACIONES ==========
function verObservaciones(observaciones) {
    alert('Observaciones del administrador:\n\n' + observaciones);
}

// ========== CERRAR MODAL AL HACER CLICK FUERA ==========
window.addEventListener('click', function(event) {
    const modal = document.getElementById('editarRegistroModal');
    if (event.target === modal) {
        closeEditarRegistroModal();
    }
});

console.log('✅ Módulo de Registro de Horas cargado completamente');
