// ==========================================
// DASHBOARD ADMIN - JAVASCRIPT DEBUG VERSION
// ==========================================

console.log('=== Iniciando carga de dashboardAdmin.js ===');

// Sistema SPA - Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ DOMContentLoaded ejecutado');
    
    const menuItems = document.querySelectorAll('.menu li');
    console.log('✓ Menu items encontrados:', menuItems.length);
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.getAttribute('data-section');
            console.log('>>> CLICK EN MENU:', section);
            
            menuItems.forEach(mi => mi.classList.remove('activo'));
            this.classList.add('activo');
            
            document.querySelectorAll('.section-content').forEach(s => {
                s.classList.remove('active');
            });
            
            const targetSection = document.getElementById(section + '-section');
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('✓ Sección mostrada:', section);
                
                // CARGAR DATOS SEGÚN LA SECCIÓN
                if (section === 'notificaciones') {
                    console.log('>>> Cargando usuarios para notificaciones');
                    loadUsersForNotifications();
                } else if (section === 'tareas') {
                    console.log('>>> Cargando datos para tareas');
                    loadTaskUsers();
                    loadNucleos();
                    loadAllTasks();
                } else if (section === 'usuarios') {
                    console.log('>>> Cargando tabla de usuarios');
                    loadUsersForTable();
                } else if (section === 'nucleo') {  // NUEVO
                    console.log('>>> Cargando núcleos familiares');
                    loadNucleosFamiliares();
                }
            } else {
                console.error('✗ Sección no encontrada:', section);
            }
        });
    });
});

console.log('=== Definiendo funciones globales ===');

// ========== NOTIFICACIONES ==========

function loadUsersForNotifications() {
    console.log('→ loadUsersForNotifications() ejecutada');
    const usersList = document.getElementById('usersList');
    
    console.log('DEBUG: Elemento usersList:', usersList);
    
    if (!usersList) {
        console.error('✗ NO SE ENCONTRÓ usersList');
        return;
    }
    
    usersList.innerHTML = '<p class="loading">Cargando usuarios...</p>';
    
    console.log('DEBUG: Haciendo fetch a /api/notifications/users');
    
    fetch('/api/notifications/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
    })
    .then(response => {
        console.log('DEBUG: Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('DEBUG: Data recibida:', data);
        if (data.success) {
            renderUsersList(data.users);
        } else {
            usersList.innerHTML = `<p class="error">Error: ${data.message}</p>`;
        }
    })
    .catch(error => {
        console.error('DEBUG: Error en fetch:', error);
        usersList.innerHTML = `<p class="error">Error de conexión</p>`;
    });
}

function renderUsersList(users) {
    const container = document.getElementById('usersList');
    if (!users || users.length === 0) {
        container.innerHTML = '<p>No hay usuarios disponibles</p>';
        return;
    }
    
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

function sendNotification(event) {
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
    
    fetch('/api/notifications/create', { method: 'POST', body: formData })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            form.reset();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al enviar notificación');
    });
}

// ========== PAGOS ==========

function openModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = src;
}

function closeModal() {
    document.getElementById('imageModal').style.disable = 'none';
}

function approvePayment(userId) {
    if (!confirm('¿Está seguro de aprobar este pago?')) return;
    
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Procesando...';
    
    fetch('/api/payment/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id_usuario=${userId}`
    })
    .then(response => response.json())
    .then(data => {
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
    })
    .catch(error => {
        console.error(error);
        alert('Error al conectar con el servidor');
        btn.disabled = false;
        btn.textContent = 'Aprobar Pago';
    });
}

function rejectPayment(userId) {
    const motivo = prompt('¿Por qué rechaza este pago? (opcional)');
    if (motivo === null) return;
    
    if (!confirm('¿Está seguro de rechazar este pago?')) return;
    
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Procesando...';
    
    fetch('/api/payment/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id_usuario=${userId}&motivo=${encodeURIComponent(motivo)}`
    })
    .then(response => response.json())
    .then(data => {
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
    })
    .catch(error => {
        console.error(error);
        alert('Error al conectar con el servidor');
        btn.disabled = false;
        btn.textContent = 'Rechazar Pago';
    });
}

// ========== TAREAS ==========

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

function loadTaskUsers() {
    const container = document.getElementById('taskUsersList');
    
    fetch('/api/tasks/users')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderTaskUsers(data.usuarios);
        } else {
            container.innerHTML = '<p class="error">Error al cargar usuarios</p>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    });
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

function loadNucleos() {
    const container = document.getElementById('taskNucleosList');
    
    fetch('/api/tasks/nucleos')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderNucleos(data.nucleos);
        } else {
            container.innerHTML = '<p class="error">Error al cargar núcleos</p>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    });
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

function createTask(event) {
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
    
    fetch('/api/tasks/create', { method: 'POST', body: formData })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            form.reset();
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            loadAllTasks();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al crear tarea');
    });
}

function loadAllTasks() {
    const container = document.getElementById('tasksList');
    const filtro = document.getElementById('filtro-estado')?.value || '';
    const url = filtro ? `/api/tasks/all?estado=${filtro}` : '/api/tasks/all';
    
    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderTasksList(data.tareas);
        } else {
            container.innerHTML = '<p class="error">Error al cargar tareas</p>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    });
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
                    <div class="task-meta-item"><strong>Inicio:</strong> ${fechaInicio}</div>
                    <div class="task-meta-item"><strong>Fin:</strong> ${fechaFin}</div>
                    <div class="task-meta-item"><strong>Creado por:</strong> ${tarea.creador}</div>
                    <div class="task-meta-item"><strong>Asignado a:</strong> ${asignados}</div>
                </div>
                ${tarea.estado !== 'cancelada' ? `
                    <div class="task-actions">
                        <button class="btn btn-small btn-view" onclick="viewTaskDetails(${tarea.id_tarea})">Ver Detalles</button>
                        <button class="btn btn-small btn-cancel" onclick="cancelTask(${tarea.id_tarea})">Cancelar Tarea</button>
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

function cancelTask(tareaId) {
    if (!confirm('¿Estás seguro de cancelar esta tarea?')) return;
    
    const formData = new FormData();
    formData.append('tarea_id', tareaId);
    
    fetch('/api/tasks/cancel', { method: 'POST', body: formData })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            loadAllTasks();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al cancelar tarea');
    });
}

function viewTaskDetails(tareaId) {
    fetch(`/api/tasks/details?tarea_id=${tareaId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarDetallesTarea(data.tarea, data.avances);
        } else {
            alert('Error al cargar detalles');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión');
    });
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
// ==========================================
// SECCIÓN USUARIOS CON DEBUG COMPLETO
// ==========================================

console.log('🔵 [INIT] Script cargado');

// ========== FUNCIÓN PRINCIPAL: CARGAR USUARIOS ==========
function loadUsersForTable() {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🟢 [START] loadUsersForTable() INICIADA');
    console.log('═══════════════════════════════════════');
    
    // PASO 1: Buscar el contenedor
    console.log('🔍 [PASO 1] Buscando elemento #usersTableContainer');
    const container = document.getElementById('usersTableContainer');
    
    console.log('📦 [PASO 1] Resultado:', container);
    console.log('📦 [PASO 1] ¿Existe?', container !== null);
    
    if (!container) {
        console.error('❌ [ERROR] NO SE ENCONTRÓ #usersTableContainer');
        console.error('❌ [ERROR] Verifica que exista en dashboardBackoffice.php');
        alert('ERROR CRÍTICO: No se encuentra el contenedor de usuarios');
        return;
    }
    
    console.log('✅ [PASO 1] Contenedor encontrado correctamente');
    
    // PASO 2: Mostrar loading
    console.log('⏳ [PASO 2] Mostrando loading...');
    container.innerHTML = '<p class="loading">Cargando usuarios...</p>';
    console.log('✅ [PASO 2] Loading mostrado');
    
    // PASO 3: Hacer fetch
    console.log('');
    console.log('🌐 [PASO 3] Preparando fetch...');
    const url = '/api/users/all';
    console.log('🌐 [PASO 3] URL:', url);
    console.log('🌐 [PASO 3] Método: GET');
    console.log('🌐 [PASO 3] Headers: Content-Type: application/json');
    console.log('🌐 [PASO 3] Credentials: same-origin');
    
    console.log('🚀 [PASO 3] Ejecutando fetch...');
    
    fetch(url, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    })
    .then(response => {
        console.log('');
        console.log('📨 [PASO 4] Response recibido');
        console.log('📨 [PASO 4] Status:', response.status);
        console.log('📨 [PASO 4] StatusText:', response.statusText);
        console.log('📨 [PASO 4] OK:', response.ok);
        console.log('📨 [PASO 4] Headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            console.error('❌ [ERROR] Response no OK');
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('✅ [PASO 4] Response OK, parseando JSON...');
        return response.json();
    })
    .then(data => {
        console.log('');
        console.log('📦 [PASO 5] JSON parseado');
        console.log('📦 [PASO 5] Data completa:', data);
        console.log('📦 [PASO 5] data.success:', data.success);
        console.log('📦 [PASO 5] data.users:', data.users);
        console.log('📦 [PASO 5] Tipo de data.users:', typeof data.users);
        console.log('📦 [PASO 5] ¿Es array?:', Array.isArray(data.users));
        console.log('📦 [PASO 5] Cantidad usuarios:', data.users ? data.users.length : 'NULL/UNDEFINED');
        
        if (data.users && data.users.length > 0) {
            console.log('📦 [PASO 5] Primer usuario:', data.users[0]);
        }
        
        if (data.success) {
            console.log('✅ [PASO 5] Success = true, llamando renderUsersTable()');
            renderUsersTable(data.users);
        } else {
            console.error('❌ [ERROR] Success = false');
            console.error('❌ [ERROR] Mensaje:', data.message);
            container.innerHTML = `<p class="error">Error: ${data.message}</p>`;
        }
    })
    .catch(error => {
        console.log('');
        console.error('═══════════════════════════════════════');
        console.error('💥 [CATCH] Error capturado');
        console.error('═══════════════════════════════════════');
        console.error('💥 [CATCH] Error object:', error);
        console.error('💥 [CATCH] Error.name:', error.name);
        console.error('💥 [CATCH] Error.message:', error.message);
        console.error('💥 [CATCH] Error.stack:', error.stack);
        
        container.innerHTML = `
            <div class="error">
                <h3>Error de conexión</h3>
                <p>${error.message}</p>
                <button class="btn btn-secondary" onclick="loadUsersForTable()">Reintentar</button>
            </div>
        `;
    })
    .finally(() => {
        console.log('');
        console.log('🏁 [FINALLY] Fetch completado (éxito o error)');
        console.log('═══════════════════════════════════════');
    });
}

// ========== RENDERIZAR TABLA ==========
function renderUsersTable(users) {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🎨 [RENDER] renderUsersTable() INICIADA');
    console.log('═══════════════════════════════════════');
    
    console.log('🎨 [RENDER] Parámetro users:', users);
    console.log('🎨 [RENDER] Tipo:', typeof users);
    console.log('🎨 [RENDER] ¿Es array?:', Array.isArray(users));
    
    const container = document.getElementById('usersTableContainer');
    console.log('🎨 [RENDER] Container encontrado:', container !== null);
    
    if (!users || users.length === 0) {
        console.warn('⚠️ [RENDER] No hay usuarios para mostrar');
        container.innerHTML = '<p class="no-users">No hay usuarios disponibles</p>';
        return;
    }
    
    console.log('🎨 [RENDER] Cantidad de usuarios:', users.length);
    console.log('🎨 [RENDER] Generando HTML...');
    
    try {
        const tableHTML = `
            <div class="users-table-wrapper">
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Cédula</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Rol</th>
                            <th>Núcleo</th>
                            <th>Pago</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map((user, index) => {
                            console.log(`🎨 [RENDER] Procesando usuario ${index + 1}:`, user.nombre_completo);
                            return renderUserRow(user);
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        console.log('🎨 [RENDER] HTML generado, longitud:', tableHTML.length);
        console.log('🎨 [RENDER] Insertando en DOM...');
        
        container.innerHTML = tableHTML;
        
        console.log('✅ [RENDER] Tabla insertada exitosamente');
        console.log('✅ [RENDER] Filas en DOM:', document.querySelectorAll('.user-row').length);
        console.log('═══════════════════════════════════════');
        
    } catch (error) {
        console.error('💥 [RENDER ERROR]', error);
        console.error('💥 [RENDER ERROR] Stack:', error.stack);
        container.innerHTML = `<p class="error">Error al renderizar tabla: ${error.message}</p>`;
    }
}

// ========== RENDERIZAR FILA DE USUARIO ==========
function renderUserRow(user) {
    const hasPayment = user.comprobante_archivo && user.estado === 'enviado';
    
    return `
        <tr class="user-row estado-${user.estado}" data-estado="${user.estado}">
            <td>${user.id_usuario}</td>
            <td>${user.nombre_completo}</td>
            <td>${user.cedula}</td>
            <td>${user.email}</td>
            <td>
                <span class="estado-badge estado-${user.estado}">
                    ${formatEstadoUsuario(user.estado)}
                </span>
            </td>
            <td>${user.nombre_rol || 'Sin rol'}</td>
            <td>${user.nombre_nucleo || 'Sin núcleo'}</td>
            <td>
                ${hasPayment ? `
                    <div style="font-size: 12px;">
                        <div>${formatFecha(user.fecha_pago)}</div>
                        <a href="/files/?path=${user.comprobante_archivo}" 
                           target="_blank" 
                           style="color: #0066cc;">
                            📄 Ver comprobante
                        </a>
                    </div>
                ` : `
                    <span style="color: #999; font-size: 12px;">Sin pago pendiente</span>
                `}
            </td>
            <td>
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button class="btn-small btn-view" 
                            onclick="viewUserDetails(${user.id_usuario})">
                        Ver
                    </button>
                    ${hasPayment ? `
                        <button class="btn-small btn-approve-small" 
                                onclick="approvePaymentFromTable(${user.id_usuario})"
                                id="approve-btn-${user.id_usuario}">
                            ✓
                        </button>
                        <button class="btn-small btn-reject-small" 
                                onclick="rejectPaymentFromTable(${user.id_usuario})"
                                id="reject-btn-${user.id_usuario}">
                            ✗
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
}

// ========== FUNCIONES AUXILIARES ==========
function formatEstadoUsuario(estado) {
    const estados = {
        'pendiente': 'Pendiente',
        'enviado': 'Enviado',
        'aceptado': 'Aceptado',
        'rechazado': 'Rechazado'
    };
    return estados[estado] || estado;
}

function formatFecha(fecha) {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function filterUsers() {
    console.log('🔍 [FILTER] Filtrando usuarios');
    const estadoFilter = document.getElementById('filtro-estado-usuarios').value.toLowerCase();
    const searchText = document.getElementById('search-users').value.toLowerCase();
    const rows = document.querySelectorAll('.user-row');
    
    console.log('🔍 [FILTER] Estado:', estadoFilter);
    console.log('🔍 [FILTER] Búsqueda:', searchText);
    console.log('🔍 [FILTER] Total filas:', rows.length);
    
    let visibleCount = 0;
    
    rows.forEach(row => {
        const estado = row.dataset.estado || '';
        const text = row.textContent.toLowerCase();
        
        const matchEstado = !estadoFilter || estado === estadoFilter;
        const matchSearch = !searchText || text.includes(searchText);
        
        if (matchEstado && matchSearch) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    console.log('🔍 [FILTER] Visibles:', visibleCount);
}

// ========== APROBAR PAGO ==========
function approvePaymentFromTable(userId) {
    console.log('✅ [APPROVE] Iniciando aprobación para usuario:', userId);
    
    if (!confirm('¿Está seguro de aprobar este pago?')) {
        console.log('✅ [APPROVE] Cancelado por usuario');
        return;
    }
    
    const approveBtn = document.getElementById(`approve-btn-${userId}`);
    const rejectBtn = document.getElementById(`reject-btn-${userId}`);
    
    if (approveBtn) {
        approveBtn.disabled = true;
        approveBtn.textContent = '...';
    }
    if (rejectBtn) rejectBtn.disabled = true;
    
    console.log('✅ [APPROVE] Enviando request...');
    
    fetch('/api/payment/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id_usuario=${userId}`
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ [APPROVE] Response:', data);
        if (data.success) {
            alert(data.message);
            console.log('✅ [APPROVE] Recargando tabla...');
            loadUsersForTable();
        } else {
            alert('Error: ' + data.message);
            if (approveBtn) {
                approveBtn.disabled = false;
                approveBtn.textContent = '✓';
            }
            if (rejectBtn) rejectBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('✅ [APPROVE ERROR]', error);
        alert('Error al conectar con el servidor');
        if (approveBtn) {
            approveBtn.disabled = false;
            approveBtn.textContent = '✓';
        }
        if (rejectBtn) rejectBtn.disabled = false;
    });
}

// ========== RECHAZAR PAGO ==========
function rejectPaymentFromTable(userId) {
    console.log('❌ [REJECT] Iniciando rechazo para usuario:', userId);
    
    const motivo = prompt('¿Por qué rechaza este pago? (opcional)');
    if (motivo === null) {
        console.log('❌ [REJECT] Cancelado por usuario');
        return;
    }
    
    if (!confirm('¿Está seguro de rechazar este pago?')) {
        console.log('❌ [REJECT] Confirmación cancelada');
        return;
    }
    
    const approveBtn = document.getElementById(`approve-btn-${userId}`);
    const rejectBtn = document.getElementById(`reject-btn-${userId}`);
    
    if (rejectBtn) {
        rejectBtn.disabled = true;
        rejectBtn.textContent = '...';
    }
    if (approveBtn) approveBtn.disabled = true;
    
    console.log('❌ [REJECT] Enviando request...');
    
    fetch('/api/payment/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id_usuario=${userId}&motivo=${encodeURIComponent(motivo)}`
    })
    .then(response => response.json())
    .then(data => {
        console.log('❌ [REJECT] Response:', data);
        if (data.success) {
            alert(data.message);
            console.log('❌ [REJECT] Recargando tabla...');
            loadUsersForTable();
        } else {
            alert('Error: ' + data.message);
            if (rejectBtn) {
                rejectBtn.disabled = false;
                rejectBtn.textContent = '✗';
            }
            if (approveBtn) approveBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('❌ [REJECT ERROR]', error);
        alert('Error al conectar con el servidor');
        if (rejectBtn) {
            rejectBtn.disabled = false;
            rejectBtn.textContent = '✗';
        }
        if (approveBtn) approveBtn.disabled = false;
    });
}

// ========== VER DETALLES ==========
function viewUserDetails(userId) {
    console.log('👁️ [DETAILS] Cargando detalles de usuario:', userId);
    
    fetch(`/api/users/details?user_id=${userId}`)
    .then(response => response.json())
    .then(data => {
        console.log('👁️ [DETAILS] Response:', data);
        if (data.success) {
            showUserDetailModal(data.user);
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('👁️ [DETAILS ERROR]', error);
        alert('Error de conexión');
    });
}

function showUserDetailModal(user) {
    console.log('👁️ [MODAL] Mostrando modal para:', user.nombre_completo);
    
    const modalHTML = `
        <div class="user-detail-modal" onclick="if(event.target.classList.contains('user-detail-modal')) this.remove()">
            <div class="user-detail-content">
                <button class="user-detail-close" onclick="this.closest('.user-detail-modal').remove()">
                    &times;
                </button>
                
                <h2>${user.nombre_completo}</h2>
                <span class="estado-badge estado-${user.estado}">
                    ${formatEstadoUsuario(user.estado)}
                </span>
                
                <div style="margin-top: 20px;">
                    <p><strong>Cédula:</strong> ${user.cedula}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Dirección:</strong> ${user.direccion || '-'}</p>
                    <p><strong>Fecha Nacimiento:</strong> ${user.fecha_nacimiento || '-'}</p>
                    <p><strong>Fecha Ingreso:</strong> ${user.fecha_ingreso || '-'}</p>
                    <p><strong>Rol:</strong> ${user.rol || 'Sin rol'}</p>
                    <p><strong>Núcleo:</strong> ${user.id_nucleo ? `#${user.id_nucleo}` : 'Sin núcleo'}</p>
                </div>
                
                <div style="margin-top: 20px; text-align: right;">
                    <button class="btn btn-secondary" onclick="this.closest('.user-detail-modal').remove()">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

console.log('🔵 [INIT] Todas las funciones de usuarios cargadas');
console.log('🔵 [INIT] loadUsersForTable disponible:', typeof loadUsersForTable === 'function');


// ==========================================
// GESTIÓN DE NÚCLEOS FAMILIARES
// Agregar este código al final de dashboardAdmin.js
// ==========================================

console.log('🟢 Cargando módulo de Núcleos Familiares');

// Cargar núcleos al abrir la sección
function loadNucleosFamiliares() {
    console.log('>>> Cargando núcleos familiares');
    const container = document.getElementById('nucleosTableContainer');
    
    if (!container) {
        console.error('✗ NO SE ENCONTRÓ nucleosTableContainer');
        return;
    }
    
    container.innerHTML = '<p class="loading">Cargando núcleos...</p>';
    
    fetch('/api/nucleos/all', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        console.log('DEBUG: Núcleos recibidos:', data);
        if (data.success) {
            renderNucleosTable(data.nucleos);
        } else {
            container.innerHTML = `<p class="error">Error: ${data.message}</p>`;
        }
    })
    .catch(error => {
        console.error('Error al cargar núcleos:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    });
}

// Renderizar tabla de núcleos
function renderNucleosTable(nucleos) {
    const container = document.getElementById('nucleosTableContainer');
    
    if (!nucleos || nucleos.length === 0) {
        container.innerHTML = '<div class="no-data">No hay núcleos familiares creados. Haz clic en "Crear Nuevo Núcleo" para empezar.</div>';
        return;
    }
    
    const tableHTML = `
        <div class="nucleos-table-wrapper">
            <table class="nucleos-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre del Núcleo</th>
                        <th>Dirección</th>
                        <th>Miembros</th>
                        <th>Integrantes</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${nucleos.map(nucleo => `
                        <tr class="nucleo-row">
                            <td>${nucleo.id_nucleo}</td>
                            <td><strong>${nucleo.nombre_nucleo || 'Sin nombre'}</strong></td>
                            <td>${nucleo.direccion || '-'}</td>
                            <td class="text-center">
                                <span class="badge-count">${nucleo.total_miembros}</span>
                            </td>
                            <td>
                                <div class="miembros-list">
                                    ${nucleo.miembros_nombres ? 
                                        nucleo.miembros_nombres.split(', ').slice(0, 3).join(', ') + 
                                        (nucleo.total_miembros > 3 ? ` y ${nucleo.total_miembros - 3} más...` : '') 
                                        : 'Sin miembros'}
                                </div>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-small btn-view" onclick="viewNucleoDetails(${nucleo.id_nucleo})" title="Ver detalles">
                                        Ver
                                    </button>
                                    <button class="btn-small btn-edit" onclick="editNucleo(${nucleo.id_nucleo})" title="Editar">
                                        Editar
                                    </button>
                                    <button class="btn-small btn-delete" onclick="deleteNucleo(${nucleo.id_nucleo})" title="Eliminar">
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

// Cargar usuarios disponibles para formulario
function loadUsersForNucleo(nucleoId = null) {
    return fetch('/api/nucleos/users-available', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return data.usuarios;
        }
        throw new Error('Error al cargar usuarios');
    });
}

// Crear nuevo núcleo
function showCreateNucleoForm() {
    loadUsersForNucleo().then(usuarios => {
        const modalHTML = `
            <div class="modal-overlay" onclick="if(event.target.classList.contains('modal-overlay')) this.remove()">
                <div class="modal-content-large">
                    <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
                    
                    <h2 class="modal-title">Crear Nuevo Núcleo Familiar</h2>
                    
                    <form id="createNucleoForm" onsubmit="submitCreateNucleo(event)">
                        <div class="form-group">
                            <label for="nombre_nucleo">Nombre del Núcleo *</label>
                            <input type="text" id="nombre_nucleo" name="nombre_nucleo" 
                                   placeholder="Ej: Familia García" required>
                        </div>

                        <div class="form-group">
                            <label for="direccion_nucleo">Dirección</label>
                            <input type="text" id="direccion_nucleo" name="direccion" 
                                   placeholder="Ej: Av. Italia 2345">
                        </div>

                        <div class="form-group">
                            <label>Seleccionar Miembros del Núcleo *</label>
                            <div class="user-selection-nucleo">
                                <input type="text" id="search-users-nucleo" 
                                       placeholder="Buscar usuario..." 
                                       onkeyup="filterUsersNucleo()">
                                <div id="usersListNucleo" class="users-checkboxes-nucleo">
                                    ${renderUsersCheckboxes(usuarios)}
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" 
                                    onclick="this.closest('.modal-overlay').remove()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                Crear Núcleo
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }).catch(error => {
        console.error('Error:', error);
        alert('Error al cargar usuarios');
    });
}

// Renderizar checkboxes de usuarios
function renderUsersCheckboxes(usuarios) {
    if (!usuarios || usuarios.length === 0) {
        return '<p>No hay usuarios disponibles</p>';
    }
    
    return usuarios.map(user => `
        <div class="user-checkbox-item ${user.id_nucleo ? 'in-nucleo' : ''}">
            <label>
                <input type="checkbox" name="usuarios[]" value="${user.id_usuario}"
                       ${user.id_nucleo ? 'disabled' : ''}>
                <span class="user-info">
                    <strong>${user.nombre_completo}</strong>
                    <small>${user.email}</small>
                    ${user.id_nucleo ? '<span class="badge-warning">Ya en núcleo</span>' : ''}
                </span>
            </label>
        </div>
    `).join('');
}

// Filtrar usuarios en el modal
function filterUsersNucleo() {
    const searchText = document.getElementById('search-users-nucleo').value.toLowerCase();
    const items = document.querySelectorAll('.user-checkbox-item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchText) ? '' : 'none';
    });
}

// Enviar formulario de creación
function submitCreateNucleo(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const selectedUsers = Array.from(document.querySelectorAll('input[name="usuarios[]"]:checked'))
        .map(cb => cb.value);
    
    if (selectedUsers.length === 0) {
        alert('Debe seleccionar al menos un miembro');
        return;
    }
    
    formData.delete('usuarios[]');
    selectedUsers.forEach(userId => formData.append('usuarios[]', userId));
    
    fetch('/api/nucleos/create', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            document.querySelector('.modal-overlay').remove();
            loadNucleosFamiliares();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión');
    });
}

// Ver detalles del núcleo
function viewNucleoDetails(nucleoId) {
    fetch(`/api/nucleos/details?nucleo_id=${nucleoId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNucleoDetailsModal(data.nucleo, data.miembros);
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión');
    });
}

// Modal de detalles
function showNucleoDetailsModal(nucleo, miembros) {
    const modalHTML = `
        <div class="modal-overlay" onclick="if(event.target.classList.contains('modal-overlay')) this.remove()">
            <div class="modal-content-large">
                <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
                
                <h2 class="modal-title">${nucleo.nombre_nucleo}</h2>
                
                <div class="nucleo-details-grid">
                    <div class="detail-item">
                        <strong>ID:</strong> ${nucleo.id_nucleo}
                    </div>
                    <div class="detail-item">
                        <strong>Dirección:</strong> ${nucleo.direccion || 'No especificada'}
                    </div>
                    <div class="detail-item">
                        <strong>Total Miembros:</strong> ${miembros.length}
                    </div>
                </div>
                
                <h3 style="margin-top: 30px; margin-bottom: 15px;">Miembros del Núcleo</h3>
                
                ${miembros.length > 0 ? `
                    <div class="miembros-grid">
                        ${miembros.map(miembro => `
                            <div class="miembro-card">
                                <div class="miembro-header">
                                    <strong>${miembro.nombre_completo}</strong>
                                    <span class="estado-badge estado-${miembro.estado}">
                                        ${miembro.estado}
                                    </span>
                                </div>
                                <div class="miembro-info">
                                    <div>${miembro.email}</div>
                                    <div>${miembro.cedula}</div>
                                    ${miembro.nombre_rol ? `<div>${miembro.nombre_rol}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-data">No hay miembros asignados</p>'}
                
                <div class="form-actions" style="margin-top: 30px;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cerrar
                    </button>
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove(); editNucleo(${nucleo.id_nucleo})">
                        Editar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Editar núcleo
function editNucleo(nucleoId) {
    Promise.all([
        fetch(`/api/nucleos/details?nucleo_id=${nucleoId}`).then(r => r.json()),
        loadUsersForNucleo(nucleoId)
    ])
    .then(([detailsData, usuarios]) => {
        if (!detailsData.success) throw new Error('Error al cargar datos');
        
        const nucleo = detailsData.nucleo;
        const miembrosActuales = detailsData.miembros.map(m => m.id_usuario);
        
        const modalHTML = `
            <div class="modal-overlay" onclick="if(event.target.classList.contains('modal-overlay')) this.remove()">
                <div class="modal-content-large">
                    <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
                    
                    <h2 class="modal-title">Editar Núcleo Familiar</h2>
                    
                    <form id="editNucleoForm" onsubmit="submitEditNucleo(event, ${nucleoId})">
                        <div class="form-group">
                            <label for="edit_nombre_nucleo">Nombre del Núcleo *</label>
                            <input type="text" id="edit_nombre_nucleo" name="nombre_nucleo" 
                                   value="${nucleo.nombre_nucleo || ''}" required>
                        </div>

                        <div class="form-group">
                            <label for="edit_direccion_nucleo">Dirección</label>
                            <input type="text" id="edit_direccion_nucleo" name="direccion" 
                                   value="${nucleo.direccion || ''}">
                        </div>

                        <div class="form-group">
                            <label>Miembros del Núcleo *</label>
                            <div class="user-selection-nucleo">
                                <input type="text" id="search-users-nucleo-edit" 
                                       placeholder="Buscar usuario..." 
                                       onkeyup="filterUsersNucleoEdit()">
                                <div id="usersListNucleoEdit" class="users-checkboxes-nucleo">
                                    ${renderUsersCheckboxesEdit(usuarios, miembrosActuales, nucleoId)}
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" 
                                    onclick="this.closest('.modal-overlay').remove()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al cargar datos del núcleo');
    });
}

// Renderizar usuarios para edición
function renderUsersCheckboxesEdit(usuarios, miembrosActuales, nucleoIdActual) {
    if (!usuarios || usuarios.length === 0) {
        return '<p>No hay usuarios disponibles</p>';
    }
    
    return usuarios.map(user => {
        const esMiembroActual = miembrosActuales.includes(user.id_usuario);
        const enOtroNucleo = user.id_nucleo && user.id_nucleo != nucleoIdActual;
        const disabled = enOtroNucleo;
        
        return `
            <div class="user-checkbox-item ${disabled ? 'in-nucleo' : ''}">
                <label>
                    <input type="checkbox" name="usuarios[]" value="${user.id_usuario}"
                           ${esMiembroActual ? 'checked' : ''}
                           ${disabled ? 'disabled' : ''}>
                    <span class="user-info">
                        <strong>${user.nombre_completo}</strong>
                        <small>${user.email}</small>
                        ${enOtroNucleo ? '<span class="badge-warning">En otro núcleo</span>' : ''}
                        ${esMiembroActual && !enOtroNucleo ? '<span class="badge-success">Miembro actual</span>' : ''}
                    </span>
                </label>
            </div>
        `;
    }).join('');
}

// Filtrar usuarios en modal de edición
function filterUsersNucleoEdit() {
    const searchText = document.getElementById('search-users-nucleo-edit').value.toLowerCase();
    const items = document.querySelectorAll('#usersListNucleoEdit .user-checkbox-item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchText) ? '' : 'none';
    });
}

// Enviar formulario de edición
function submitEditNucleo(event, nucleoId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    formData.append('nucleo_id', nucleoId);
    
    const selectedUsers = Array.from(document.querySelectorAll('#usersListNucleoEdit input[name="usuarios[]"]:checked'))
        .map(cb => cb.value);
    
    formData.delete('usuarios[]');
    selectedUsers.forEach(userId => formData.append('usuarios[]', userId));
    
    fetch('/api/nucleos/update', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            document.querySelector('.modal-overlay').remove();
            loadNucleosFamiliares();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión');
    });
}

// Eliminar núcleo
function deleteNucleo(nucleoId) {
    if (!confirm('¿Está seguro de eliminar este núcleo familiar?\n\nLos usuarios serán desasignados pero NO serán eliminados.')) {
        return;
    }
    
    const formData = new FormData();
    formData.append('nucleo_id', nucleoId);
    
    fetch('/api/nucleos/delete', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            loadNucleosFamiliares();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de conexión');
    });
}

console.log('✓ Módulo de Núcleos Familiares cargado completamente');