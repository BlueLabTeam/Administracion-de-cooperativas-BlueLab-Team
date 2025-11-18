
(function () {
    'use strict';



    // Evitar carga duplicada
    if (window.TareasModuleCargado) {
        console.warn('⚠️ [TAREAS] Ya cargado');
        return;
    }
    window.TareasModuleCargado = true;

    // ========== COLORES ==========
    const COLORS = {
        primary: '#005CB9',
        primaryDark: '#004494',
        primaryLight: '#E3F2FD',
        white: '#FFFFFF',
        gray50: '#F5F7FA',
        gray100: '#E8EBF0',
        gray500: '#6C757D',
        gray700: '#495057',
        success: '#4CAF50',
        warning: '#FF9800',
        danger: '#F44336',
        shadow: '0 4px 12px rgba(0, 92, 185, 0.12)'
    };

    // ========== INICIALIZACIÓN ==========
    function inicializarModuloTareas() {
        (' [TAREAS] Inicializando módulo...');

        const tareasMenuItem = document.querySelector('.menu li[data-section="tareas"]');
        if (tareasMenuItem) {
            tareasMenuItem.addEventListener('click', function () {

                window.inicializarSeccionTareas();
            });
        }


    }

    // ========== INICIALIZAR SECCIÓN ==========
    window.inicializarSeccionTareas = async function () {


        try {
            await Promise.all([
                window.loadTaskUsers(),
                window.loadNucleos(),
                window.loadAllTasks()
            ]);

            // Cargar materiales después de un breve delay
            setTimeout(() => {
                if (typeof MaterialesModule !== 'undefined' && MaterialesModule.loadForTask) {
                    MaterialesModule.loadForTask();
                }
            }, 300);


        } catch (error) {
            console.error(' [TAREAS] Error al inicializar:', error);
        }
    };

    // ========== TOGGLE TIPO DE ASIGNACIÓN ==========
    window.toggleAsignacion = function () {
        const tipo = document.getElementById('tipo_asignacion').value;
        const usuariosSelector = document.getElementById('usuarios-selector');
        const nucleosSelector = document.getElementById('nucleos-selector');

        if (tipo === 'usuario') {
            usuariosSelector.style.display = 'block';
            nucleosSelector.style.display = 'none';
        } else {
            usuariosSelector.style.display = 'none';
            nucleosSelector.style.display = 'block';
        }
    };

    // ========== CARGAR USUARIOS PARA TAREAS ==========
    window.loadTaskUsers = async function () {


        const container = document.getElementById('taskUsersList');

        if (!container) {
            console.error(' [TAREAS] Container taskUsersList no encontrado');
            return;
        }

        try {
            const response = await fetch('/api/tasks/users');
            const data = await response.json();

            if (data.success) {
                renderTaskUsers(data.usuarios);
            } else {
                container.innerHTML = '<p class="error">Error al cargar usuarios</p>';
            }
        } catch (error) {
            console.error(' [TAREAS] Error:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        }
    };

    // ========== RENDERIZAR USUARIOS ==========
    function renderTaskUsers(usuarios) {
        const container = document.getElementById('taskUsersList');

        if (!usuarios || usuarios.length === 0) {
            container.innerHTML = '<p>No hay usuarios disponibles</p>';
            return;
        }

        container.innerHTML = usuarios.map(user => `
            <div class="user-checkbox">
                <label>
                    <input type="checkbox" name="usuarios[]" value="${user.id_usuario}">
                    ${user.nombre_completo} (${user.email})
                </label>
            </div>
        `).join('');
    }

    // ========== CARGAR NÚCLEOS ==========
    window.loadNucleos = async function () {


        const container = document.getElementById('taskNucleosList');

        if (!container) {
            console.error(' [TAREAS] Container taskNucleosList no encontrado');
            return;
        }

        try {
            const response = await fetch('/api/tasks/nucleos');
            const data = await response.json();

            if (data.success) {
                renderNucleos(data.nucleos);
            } else {
                container.innerHTML = '<p class="error">Error al cargar núcleos</p>';
            }
        } catch (error) {
            console.error(' [TAREAS] Error:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        }
    };

    // ========== RENDERIZAR NÚCLEOS ==========
    function renderNucleos(nucleos) {
        const container = document.getElementById('taskNucleosList');

        if (!nucleos || nucleos.length === 0) {
            container.innerHTML = '<p>No hay núcleos familiares disponibles</p>';
            return;
        }

        container.innerHTML = nucleos.map(nucleo => `
            <div class="user-checkbox">
                <label>
                    <input type="checkbox" name="nucleos[]" value="${nucleo.id_nucleo}">
                    ${nucleo.nombre_nucleo || 'Núcleo sin nombre'} 
                    (${nucleo.total_miembros} miembro${nucleo.total_miembros != 1 ? 's' : ''})
                </label>
            </div>
        `).join('');
    }

    // ========== TOGGLE SELECCIÓN ==========
    window.toggleAllTaskUsers = function () {
        const checkboxes = document.querySelectorAll('input[name="usuarios[]"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => cb.checked = !allChecked);
    };

    window.toggleAllNucleos = function () {
        const checkboxes = document.querySelectorAll('input[name="nucleos[]"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => cb.checked = !allChecked);
    };

    // ========== CREAR TAREA ==========
    window.createTask = async function (event) {
        event.preventDefault();


        const form = event.target;
        const formData = new FormData(form);
        const tipoAsignacion = formData.get('tipo_asignacion');

        let seleccionados;
        if (tipoAsignacion === 'usuario') {
            seleccionados = Array.from(document.querySelectorAll('input[name="usuarios[]"]:checked'))
                .map(cb => cb.value);
            formData.delete('usuarios[]');
            seleccionados.forEach(id => formData.append('usuarios[]', id));
        } else {
            seleccionados = Array.from(document.querySelectorAll('input[name="nucleos[]"]:checked'))
                .map(cb => cb.value);
            formData.delete('nucleos[]');
            seleccionados.forEach(id => formData.append('nucleos[]', id));
        }

        if (seleccionados.length === 0) {
            alert('⚠️ Debes seleccionar al menos un ' + (tipoAsignacion === 'usuario' ? 'usuario' : 'núcleo familiar'));
            return;
        }

        // Agregar materiales si están disponibles
        if (typeof MaterialesModule !== 'undefined' && MaterialesModule.materialesAsignados.length > 0) {
            formData.append('materiales_json', JSON.stringify(MaterialesModule.materialesAsignados));
        }

        try {
            const response = await fetch('/api/tasks/create', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert(' ' + data.message);
                form.reset();
                document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

                // Limpiar materiales
                if (typeof MaterialesModule !== 'undefined') {
                    MaterialesModule.clearAsignados();
                }

                window.loadAllTasks();
            } else {
                alert(' Error: ' + data.message);
            }
        } catch (error) {
            console.error(' [TAREAS] Error:', error);
            alert(' Error al crear tarea');
        }
    };

    // ========== CARGAR TODAS LAS TAREAS ==========
    window.loadAllTasks = async function () {


        const container = document.getElementById('tasksList');
        const filtro = document.getElementById('filtro-estado')?.value || '';

        let url = '/api/tasks/all';
        if (filtro && filtro !== 'vencida') {
            url += `?estado=${filtro}`;
        }

        container.innerHTML = '<p class="loading">Cargando tareas...</p>';

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                renderTasksList(data.tareas, filtro);
            } else {
                container.innerHTML = '<p class="error">Error al cargar tareas</p>';
            }
        } catch (error) {
            console.error(' [TAREAS] Error:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        }
    };

    // ========== RENDERIZAR LISTA DE TAREAS ==========
    function renderTasksList(tareas, filtroActivo = '') {


        const container = document.getElementById('tasksList');

        if (!tareas || tareas.length === 0) {
            container.innerHTML = '<p class="no-tasks">No hay tareas creadas</p>';
            return;
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Analizar tareas
        const tareasConEstado = tareas.map(tarea => {
            const fechaFinObj = new Date(tarea.fecha_fin + 'T00:00:00');
            const esCompletada = tarea.estado === 'completada';
            const esCancelada = tarea.estado === 'cancelada';
            const esVencida = !esCompletada && !esCancelada && fechaFinObj < hoy;

            return { ...tarea, esVencida, esCompletada, esCancelada };
        });

        // Filtrar
        const tareasFiltradas = tareasConEstado.filter(tarea => {
            if (filtroActivo === 'vencida') return tarea.esVencida;
            if (filtroActivo && filtroActivo !== '') return tarea.estado === filtroActivo;
            return true;
        });

        if (tareasFiltradas.length === 0) {
            const mensajes = {
                'vencida': 'No hay tareas vencidas 🎉',
                'pendiente': 'No hay tareas pendientes',
                'completada': 'No hay tareas completadas',
                'cancelada': 'No hay tareas canceladas'
            };
            container.innerHTML = `<p class="no-tasks">${mensajes[filtroActivo] || 'No hay tareas'}</p>`;
            return;
        }

        // Renderizar
        container.innerHTML = tareasFiltradas.map(tarea => {
            const fechaInicio = formatearFechaUY(tarea.fecha_inicio);
            const fechaFin = formatearFechaUY(tarea.fecha_fin);
            const asignados = tarea.tipo_asignacion === 'usuario' ?
                `${tarea.total_usuarios} usuario(s)` : `${tarea.total_nucleos} núcleo(s)`;
            const progresoPromedio = Math.round(parseFloat(tarea.progreso_promedio || 0));
            const totalAsignados = tarea.tipo_asignacion === 'usuario' ?
                parseInt(tarea.total_usuarios) : parseInt(tarea.total_nucleos);
            const completados = parseInt(tarea.asignaciones_completadas || 0);

            let estadoTexto = '', estadoBadgeClass = '', claseVencida = '';

            if (tarea.esVencida === true) {
                estadoTexto = ' Vencida';
                estadoBadgeClass = 'vencida';
                claseVencida = 'tarea-vencida';
            } else if (tarea.esCompletada) {
                estadoTexto = 'Completada';
                estadoBadgeClass = 'completada';
            } else if (tarea.esCancelada) {
                estadoTexto = 'Cancelada';
                estadoBadgeClass = 'cancelada';
            } else {
                estadoTexto = formatEstado(tarea.estado);
            }

            return `
                <div class="task-item prioridad-${tarea.prioridad} ${claseVencida}">
                    <div class="task-header">
                        <h4 class="task-title">${tarea.titulo}</h4>
                        <div class="task-badges">
                            <span class="task-badge badge-estado ${estadoBadgeClass}">${estadoTexto}</span>
                            <span class="task-badge badge-prioridad ${tarea.prioridad}">${formatPrioridad(tarea.prioridad)}</span>
                        </div>
                    </div>
                    <p class="task-description">${tarea.descripcion}</p>
                    <div class="task-meta">
                       <div class="task-meta-item">
    <strong>
        <span data-i18n="dashboardAdmin.tasks.start">Inicio:</span>
    </strong> 
    ${fechaInicio}
</div>

<div class="task-meta-item">
    <strong>
        <span data-i18n="dashboardAdmin.tasks.end">Fin:</span>
    </strong> 
    ${fechaFin}
</div>

<div class="task-meta-item">
    <strong>
        <span data-i18n="dashboardAdmin.tasks.createdBy">Creado por:</span>
    </strong> 
    ${tarea.creador}
</div>

<div class="task-meta-item">
    <strong>
        <span data-i18n="dashboardAdmin.tasks.assignedTo">Asignado a:</span>
    </strong> 
    ${asignados}
</div>

                    </div>
                    ${!tarea.esCancelada ? `
                        <div class="task-progress-section">
                            <div class="progress-info">
                                <span class="progress-label">Progreso general:</span>
                                <span class="progress-percentage">${progresoPromedio}%</span>
                                <span class="progress-completed">${completados}/${totalAsignados} completados</span>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width:${progresoPromedio}%;background:${tarea.esVencida ? COLORS.danger : tarea.esCompletada ? COLORS.success : COLORS.primary}"></div>
                            </div>
                        </div>
                    ` : ''}
                    ${tarea.esVencida ? `
          
                    ` : ''}
                    ${!tarea.esCancelada ? `
                        <div class="task-actions">
                            
                            <button class="btn btn-small btn-materiales" onclick="TareasModule.viewMaterials(${tarea.id_tarea})">
                                <i class="fas fa-boxes"></i> Material
                            </button>
                            ${!tarea.esCompletada ? `
                               <button class="btn btn-small btn-cancel" onclick="TareasModule.cancel(${tarea.id_tarea})">
    <span data-i18n="dashboardAdmin.tasks.cancelTask">Cancelar Tarea</span>
</button>

                            ` : `
                                <span style="color:${COLORS.success};font-weight:bold;padding:5px 10px">✓ Completada</span>
                            `}
                        </div>
                    ` : '<p style="color:' + COLORS.danger + ';margin-top:10px"><strong>Tarea cancelada</strong></p>'}
                </div>
            `;
        }).join('');
    }

    // ========== VER DETALLES ==========
    window.viewTaskDetails = async function (tareaId) {


        try {
            const response = await fetch(`/api/tasks/details?id=${tareaId}`);
            const data = await response.json();

            if (data.success) {
                mostrarDetallesTarea(data.tarea, data.avances);
            } else {
                alert(' Error: ' + data.message);
            }
        } catch (error) {
            console.error(' [TAREAS] Error:', error);
            alert(' Error de conexión');
        }
    };

    // ========== MODAL DETALLES ==========
    function mostrarDetallesTarea(tarea, avances) {
        const modal = `
            <div id="taskDetailModal" class="modal-detail" onclick="if(event.target.id==='taskDetailModal') this.remove()">
                <div class="modal-detail-content">
                    <button onclick="document.getElementById('taskDetailModal').remove()" class="modal-close-button">×</button>
                    <h2 class="modal-detail-header">${tarea.titulo}</h2>
                    <div class="modal-detail-section">
                        <p><strong>Descripción:</strong></p>
                        <p>${tarea.descripcion}</p>
                    </div>
                    <div class="modal-detail-grid">
                        <div class="modal-detail-item"><strong>Fecha Inicio:</strong> ${formatearFechaUY(tarea.fecha_inicio)}</div>
                        <div class="modal-detail-item"><strong>Fecha Fin:</strong> ${formatearFechaUY(tarea.fecha_fin)}</div>
                        <div class="modal-detail-item"><strong>Prioridad:</strong> ${formatPrioridad(tarea.prioridad)}</div>
                        <div class="modal-detail-item"><strong>Estado:</strong> ${formatEstado(tarea.estado)}</div>
                        <div class="modal-detail-item"><strong>Creado por:</strong> ${tarea.creador}</div>
                        <div class="modal-detail-item"><strong>Asignación:</strong> ${tarea.tipo_asignacion === 'usuario' ? 'Usuarios' : 'Núcleos'}</div>
                    </div>
                    ${avances && avances.length > 0 ? `
                        <h3 style="margin-top: 30px; margin-bottom: 15px;">Avances Reportados</h3>
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
                                ${avance.archivo ? `<a href="/files/?path=${avance.archivo}" target="_blank" class="file-link">Ver archivo adjunto</a>` : ''}
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

    // ========== VER MATERIALES ==========
    window.viewTaskMaterials = async function (tareaId) {


        try {
            const response = await fetch(`/api/materiales/task-materials?id_tarea=${tareaId}`);
            const data = await response.json();

            if (data.success) {
                if (data.materiales && data.materiales.length > 0) {
                    showTaskMaterialsModal(data.materiales, tareaId);
                } else {
                    alert(' Esta tarea no tiene materiales asignados');
                }
            } else {
                alert(' Error: ' + (data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error(' [TAREAS] Error:', error);
            alert(' Error de conexión');
        }
    };

    // ========== MODAL MATERIALES ==========
    function showTaskMaterialsModal(materiales, tareaId) {
        const materialesHTML = `
            <div class="materials-grid">
                ${materiales.map(material => {
            const suficiente = parseInt(material.stock_disponible) >= parseInt(material.cantidad_requerida);
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
    <span data-i18n="dashboardAdmin.tasks.required">Requerido:</span> 
    <strong>${material.cantidad_requerida}</strong>
</span>
                                    <span class="quantity-item ${suficiente ? 'available' : 'unavailable'}">
                                        <i class="fas fa-warehouse"></i>
                                        Stock: <strong>${material.stock_disponible}</strong>
                                    </span>
                                </div>
                            </div>
                            <div class="material-status-badge">
                                ${suficiente ?
                    '<span class="badge-success"><i class="fas fa-check-circle"></i> Disponible</span>' :
                    '<span class="badge-warning"><i class="fas fa-exclamation-triangle"></i> Stock Bajo</span>'
                }
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `; i18n.translatePage();

        const modal = `
            <div id="materialesModalAdmin" class="modal-detail" onclick="if(event.target.id==='materialesModalAdmin') this.remove()">
                <div class="modal-detail-content">
                    <button onclick="document.getElementById('materialesModalAdmin').remove()" class="modal-close-button">×</button>
                    
                    <h2 class="modal-detail-header">
                        <i class="fas fa-boxes" style="color: #667eea; margin-right: 10px;"></i>
                        Materiales de la Tarea
                    </h2>
                    
                    <p style="color: #666; margin-bottom: 20px;">
                        Total de materiales asignados: <strong>${materiales.length}</strong>
                    </p>
                    
                    ${materialesHTML}
                    
                    <div class="modal-detail-footer" style="margin-top: 30px;">
                        <button onclick="document.getElementById('materialesModalAdmin').remove()" class="btn btn-secondary">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
    }

    // ========== CANCELAR TAREA ==========
    window.cancelTask = async function (tareaId) {
        if (!confirm('¿Estás seguro de cancelar esta tarea?')) return;

        const formData = new FormData();
        formData.append('id_tarea', tareaId);

        try {
            const response = await fetch('/api/tasks/cancel', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert(' ' + data.message);
                window.loadAllTasks();
            } else {
                alert(' Error: ' + data.message);
            }
        } catch (error) {
            console.error(' [TAREAS] Error:', error);
            alert(' Error al cancelar tarea');
        }
    };

    // ========== FUNCIONES AUXILIARES ==========

    function formatEstado(estado) {
        const map = {
            'pendiente': {
                key: 'dashboardAdmin.tasks.statePending',
                defaultText: 'Pendiente'
            },
            'en_progreso': {
                key: 'dashboardAdmin.tasks.stateInProgress',
                defaultText: 'En Progreso'
            },
            'completada': {
                key: 'dashboardAdmin.tasks.stateCompleted',
                defaultText: 'Completada'
            },
            'cancelada': {
                key: 'dashboardAdmin.tasks.stateCanceled',
                defaultText: 'Cancelada'
            }
        };

        const item = map[estado];
        if (!item) return estado;

        // Devuelve un span compatible con i18n
        return `<span data-i18n="${item.key}">${item.defaultText}</span>`;
    }


    function formatPrioridad(prioridad) {
        const map = {
            'baja': {
                key: 'dashboardAdmin.requests.priorityLow',
                defaultText: 'Baja'
            },
            'media': {
                key: 'dashboardAdmin.requests.priorityMedium',
                defaultText: 'Media'
            },
            'alta': {
                key: 'dashboardAdmin.requests.priorityHigh',
                defaultText: 'Alta'
            }
        };

        const item = map[prioridad];

        if (!item) return prioridad;

        // Crear el span para permitir correcta traducción de i18n
        return `<span data-i18n="${item.key}">${item.defaultText}</span>`;
    }



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

    // ========== EXPORTAR API PÚBLICA ==========
    window.TareasModule = {
        version: '1.0.0',

        // Funciones principales
        init: inicializarModuloTareas,
        loadUsers: window.loadTaskUsers,
        loadNucleos: window.loadNucleos,
        loadAll: window.loadAllTasks,
        toggleAsignacion: window.toggleAsignacion,
        toggleAllUsers: window.toggleAllTaskUsers,
        toggleAllNucleos: window.toggleAllNucleos,
        create: window.createTask,
        viewDetails: window.viewTaskDetails,
        viewMaterials: window.viewTaskMaterials,
        cancel: window.cancelTask
    };

    // ========== AUTO-INICIALIZACIÓN ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarModuloTareas);
    } else {
        inicializarModuloTareas();
    }


})();