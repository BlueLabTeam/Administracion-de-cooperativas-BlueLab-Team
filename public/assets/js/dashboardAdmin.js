// ==========================================
// DASHBOARD ADMIN - JAVASCRIPT
// ==========================================

// Sistema SPA - Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard Admin cargado');
    
    const menuItems = document.querySelectorAll('.menu li');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            console.log('Navegando a:', this.getAttribute('data-section'));
            
            menuItems.forEach(mi => mi.classList.remove('activo'));
            this.classList.add('activo');
            
            const section = this.getAttribute('data-section');
            
            document.querySelectorAll('.section-content').forEach(s => {
                s.classList.remove('active');
            });
            
            const targetSection = document.getElementById(section + '-section');
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('Sección mostrada:', section);
            } else {
                console.error('Sección no encontrada:', section);
            }
        });
    });

    // Cargar usuarios cuando se abre la sección de notificaciones
    const notifMenuItem = document.querySelector('.menu li[data-section="notificaciones"]');
    if (notifMenuItem) {
        notifMenuItem.addEventListener('click', function() {
            loadUsers();
        });
    }
    
    // Cargar tareas cuando se abre esa sección
    const tareasMenuItem = document.querySelector('.menu li[data-section="tareas"]');
    if (tareasMenuItem) {
        tareasMenuItem.addEventListener('click', function() {
            loadTaskUsers();
            loadNucleos();
            loadAllTasks();
        });
    }
    
    // Cargar usuarios al inicio si la sección ya está abierta
    if (document.getElementById('notificaciones-section').classList.contains('active')) {
        loadUsers();
    }
});

// ========== GESTIÓN DE USUARIOS ==========

async function loadUsers() {
    console.log('Cargando usuarios...');
    const usersList = document.getElementById('usersList');
    
    try {
        const response = await fetch('/api/notifications/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (data.success) {
            renderUsersList(data.users);
        } else {
            usersList.innerHTML = `<p class="error">Error: ${data.message || 'No se pudieron cargar los usuarios'}</p>`;
        }
    } catch (error) {
        console.error('Error completo:', error);
        usersList.innerHTML = `<p class="error">Error de conexión: ${error.message}</p>`;
    }
}

function renderUsersList(users) {
    const container = document.getElementById('usersList');
    
    if (!users || users.length === 0) {
        container.innerHTML = '<p>No hay usuarios disponibles</p>';
        return;
    }

    console.log('Renderizando', users.length, 'usuarios');
    
    container.innerHTML = users.map(user => `
        <div class="user-checkbox">
            <label>
                <input type="checkbox" name="usuarios[]" value="${user.id_usuario}">
                ${user.nombre_completo} (${user.email})
            </label>
        </div>
    `).join('');
}

function toggleAllUsers() {
    const checkboxes = document.querySelectorAll('input[name="usuarios[]"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => cb.checked = !allChecked);
}

async function sendNotification(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const selectedUsers = Array.from(document.querySelectorAll('input[name="usuarios[]"]:checked'))
        .map(cb => cb.value);
    
    if (selectedUsers.length === 0) {
        alert('Debes seleccionar al menos un usuario');
        return;
    }

    formData.delete('usuarios[]');
    selectedUsers.forEach(userId => formData.append('usuarios[]', userId));
    
    console.log('Enviando notificación a:', selectedUsers);
    
    try {
        const response = await fetch('/api/notifications/create', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log('Respuesta:', data);
        
        if (data.success) {
            alert(data.message);
            form.reset();
            document.querySelectorAll('input[name="usuarios[]"]').forEach(cb => cb.checked = false);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar notificación');
    }
}

// ========== GESTIÓN DE PAGOS ==========

function openModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = src;
}

function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}

async function approvePayment(userId) {
    if (!confirm('¿Está seguro de aprobar este pago?')) return;
    
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Procesando...';
    
    try {
        const response = await fetch('/api/payment/approve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id_usuario=${userId}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            document.getElementById(`payment-${userId}`).remove();
            
            if (document.querySelectorAll('.payment-card').length === 0) {
                location.reload();
            }
        } else {
            alert('Error: ' + data.message);
            btn.disabled = false;
            btn.textContent = 'Aprobar Pago';
        }
    } catch (error) {
        console.error(error);
        alert('Error al conectar con el servidor');
        btn.disabled = false;
        btn.textContent = 'Aprobar Pago';
    }
}

async function rejectPayment(userId) {
    const motivo = prompt('¿Por qué rechaza este pago? (opcional)');
    if (motivo === null) return;
    
    if (!confirm('¿Está seguro de rechazar este pago? El usuario podrá volver a intentarlo.')) return;
    
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Procesando...';
    
    try {
        const response = await fetch('/api/payment/reject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id_usuario=${userId}&motivo=${encodeURIComponent(motivo)}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            document.getElementById(`payment-${userId}`).remove();
            
            if (document.querySelectorAll('.payment-card').length === 0) {
                location.reload();
            }
        } else {
            alert('Error: ' + data.message);
            btn.disabled = false;
            btn.textContent = 'Rechazar Pago';
        }
    } catch (error) {
        console.error(error);
        alert('Error al conectar con el servidor');
        btn.disabled = false;
        btn.textContent = 'Rechazar Pago';
    }
}

// ========== GESTIÓN DE TAREAS ==========

function toggleAsignacion() {
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
}

async function loadTaskUsers() {
    const container = document.getElementById('taskUsersList');
    
    try {
        const response = await fetch('/api/tasks/users');
        const data = await response.json();
        
        if (data.success) {
            renderTaskUsers(data.usuarios);
        } else {
            container.innerHTML = '<p class="error">Error al cargar usuarios</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

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

async function loadNucleos() {
    const container = document.getElementById('taskNucleosList');
    
    try {
        const response = await fetch('/api/tasks/nucleos');
        const data = await response.json();
        
        if (data.success) {
            renderNucleos(data.nucleos);
        } else {
            container.innerHTML = '<p class="error">Error al cargar núcleos</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

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

function toggleAllTaskUsers() {
    const checkboxes = document.querySelectorAll('input[name="usuarios[]"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);
}

function toggleAllNucleos() {
    const checkboxes = document.querySelectorAll('input[name="nucleos[]"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);
}

async function createTask(event) {
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
        alert('Debes seleccionar al menos un ' + (tipoAsignacion === 'usuario' ? 'usuario' : 'núcleo familiar'));
        return;
    }
    
    try {
        const response = await fetch('/api/tasks/create', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            form.reset();
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            loadAllTasks();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear tarea');
    }
}

async function loadAllTasks() {
    const container = document.getElementById('tasksList');
    const filtro = document.getElementById('filtro-estado')?.value || '';
    
    try {
        const url = filtro ? `/api/tasks/all?estado=${filtro}` : '/api/tasks/all';
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            renderTasksList(data.tareas);
        } else {
            container.innerHTML = '<p class="error">Error al cargar tareas</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

function renderTasksList(tareas) {
    const container = document.getElementById('tasksList');
    
    if (!tareas || tareas.length === 0) {
        container.innerHTML = '<p class="no-tasks">No hay tareas creadas</p>';
        return;
    }
    
    container.innerHTML = tareas.map(tarea => {
        const fechaInicio = new Date(tarea.fecha_inicio).toLocaleDateString('es-UY');
        const fechaFin = new Date(tarea.fecha_fin).toLocaleDateString('es-UY');
        const asignados = tarea.tipo_asignacion === 'usuario' ? 
            `${tarea.total_usuarios} usuario(s)` : 
            `${tarea.total_nucleos} núcleo(s)`;
        
        return `
            <div class="task-item prioridad-${tarea.prioridad}">
                <div class="task-header">
                    <h4 class="task-title">${tarea.titulo}</h4>
                    <div class="task-badges">
                        <span class="task-badge badge-estado">${formatEstado(tarea.estado)}</span>
                        <span class="task-badge badge-prioridad ${tarea.prioridad}">${formatPrioridad(tarea.prioridad)}</span>
                    </div>
                </div>
                
                <p class="task-description">${tarea.descripcion}</p>
                
                <div class="task-meta">
                    <div class="task-meta-item">
                        <strong>📅 Inicio:</strong> ${fechaInicio}
                    </div>
                    <div class="task-meta-item">
                        <strong>⏰ Fin:</strong> ${fechaFin}
                    </div>
                    <div class="task-meta-item">
                        <strong>👤 Creado por:</strong> ${tarea.creador}
                    </div>
                    <div class="task-meta-item">
                        <strong>👥 Asignado a:</strong> ${asignados}
                    </div>
                </div>
                
                ${tarea.estado !== 'cancelada' ? `
                    <div class="task-actions">
                        <button class="btn btn-small btn-view" onclick="viewTaskDetails(${tarea.id_tarea})">
                            Ver Detalles
                        </button>
                        <button class="btn btn-small btn-cancel" onclick="cancelTask(${tarea.id_tarea})">
                            Cancelar Tarea
                        </button>
                    </div>
                ` : '<p style="color: #dc3545; margin-top: 10px;"><strong>Esta tarea ha sido cancelada</strong></p>'}
            </div>
        `;
    }).join('');
}

function formatEstado(estado) {
    const estados = {
        'pendiente': 'Pendiente',
        'en_progreso': 'En Progreso',
        'completada': 'Completada',
        'cancelada': 'Cancelada'
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

async function cancelTask(tareaId) {
    if (!confirm('¿Estás seguro de cancelar esta tarea? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('tarea_id', tareaId);
        
        const response = await fetch('/api/tasks/cancel', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            loadAllTasks();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cancelar tarea');
    }
}

async function viewTaskDetails(tareaId) {
    try {
        const response = await fetch(`/api/tasks/details?tarea_id=${tareaId}`);
        const data = await response.json();
        
        if (data.success) {
            mostrarDetallesTarea(data.tarea, data.avances);
        } else {
            alert('Error al cargar detalles');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

function mostrarDetallesTarea(tarea, avances) {
    const modal = `
        <div id="taskDetailModal" class="modal-detail" onclick="if(event.target.id==='taskDetailModal') this.remove()">
            <div class="modal-detail-content">
                <button onclick="document.getElementById('taskDetailModal').remove()" class="modal-close-button">&times;</button>
                
                <h2 class="modal-detail-header">${tarea.titulo}</h2>
                
                <div class="modal-detail-section">
                    <p><strong>Descripción:</strong></p>
                    <p>${tarea.descripcion}</p>
                </div>
                
                <div class="modal-detail-grid">
                    <div class="modal-detail-item"><strong>Fecha Inicio:</strong> ${new Date(tarea.fecha_inicio).toLocaleDateString('es-UY')}</div>
                    <div class="modal-detail-item"><strong>Fecha Fin:</strong> ${new Date(tarea.fecha_fin).toLocaleDateString('es-UY')}</div>
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