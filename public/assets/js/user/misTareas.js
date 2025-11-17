// ==========================================
//  MÓDULO: MIS TAREAS
// Sistema completo de gestión de tareas asignadas
// al usuario y su núcleo familiar
// ==========================================

console.log('🟢 Iniciando módulo de mis tareas');

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function () {
    console.log(' Configurando listeners de tareas');

    // Listener para Tareas - SOLO cuando se hace click
    const tareasMenuItem = document.querySelector('.menu li[data-section="tareas"]');
    if (tareasMenuItem) {
        tareasMenuItem.addEventListener('click', function () {
            console.log('>>> Click en sección tareas');
            
            // Solo cargar si aún no se han cargado
            const tareasUsuarioList = document.getElementById('tareasUsuarioList');
            if (tareasUsuarioList && tareasUsuarioList.innerHTML.includes('loading')) {
                loadUserTasks();
            } else {
                // Recargar siempre al hacer click
                loadUserTasks();
            }
        });
    }
});

// ========== CARGAR TAREAS DEL USUARIO ==========
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

// ========== RENDERIZAR TAREAS DEL USUARIO ==========
function renderUserTasks(tareas, containerId, esNucleo = false) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 [RENDER USER TASKS] Iniciando con detección de vencidas');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
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
            console.log(`🔴 TAREA VENCIDA (Usuario): ${tarea.titulo} - Fin: ${tarea.fecha_fin}`);
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
            estadoTexto = ' Vencida';
            estadoBadgeClass = 'vencida';
            tareaClass = 'tarea-vencida';
            console.log(` Badge VENCIDA aplicado: ${tarea.titulo}`);
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

    console.log(' [RENDER USER TASKS] Completado');
}

// ========== ACTUALIZAR RESUMEN DE TAREAS ==========
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

// ========== FORMATEAR ESTADOS ==========
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

// ========== ACTUALIZAR PROGRESO DE TAREA ==========
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

// ========== AGREGAR AVANCE A TAREA ==========
function addTaskAvance(tareaId) {
    console.log(' addTaskAvance llamado con tareaId:', tareaId);
    
    //  Validar que tareaId existe
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
    //  CAMBIO CRÍTICO: Usar 'id_tarea' en lugar de 'tarea_id'
    formData.append('id_tarea', tareaId);
    formData.append('comentario', comentario.trim());
    formData.append('progreso_reportado', progresoNum);

    //  DEBUG: Ver qué estamos enviando
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

// ========== VER MATERIALES DE TAREA ==========
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

// ========== MODAL DE MATERIALES ==========
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

// ========== MODAL DE DETALLES COMPLETOS ==========
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

// ========== FORMATEAR FECHA EN FORMATO UY ==========
function formatearFechaUY(fecha) {
    if (!fecha) return '-';
    const f = new Date(fecha + 'T00:00:00');
    return f.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Montevideo'
    });
}

// ========== EXPORTAR FUNCIONES GLOBALES ==========
window.loadUserTasks = loadUserTasks;
window.renderUserTasks = renderUserTasks;
window.updateTaskProgress = updateTaskProgress;
window.addTaskAvance = addTaskAvance;
window.viewUserTaskDetails = viewUserTaskDetails;
window.viewTaskMaterials = viewTaskMaterials;
window.updateTasksSummary = updateTasksSummary;
window.formatEstadoUsuario = formatEstadoUsuario;
window.formatPrioridad = formatPrioridad;

console.log(' Módulo de mis tareas cargado completamente');
console.log(' Funciones exportadas:', {
    loadUserTasks: typeof window.loadUserTasks,
    renderUserTasks: typeof window.renderUserTasks,
    updateTaskProgress: typeof window.updateTaskProgress,
    addTaskAvance: typeof window.addTaskAvance,
    viewUserTaskDetails: typeof window.viewUserTaskDetails,
    viewTaskMaterials: typeof window.viewTaskMaterials
});