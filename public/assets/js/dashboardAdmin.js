
// Sistema SPA - Navegación entre secciones
document.addEventListener('DOMContentLoaded', function () {


    const menuItems = document.querySelectorAll('.menu li');


    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            const section = this.getAttribute('data-section');
        

            menuItems.forEach(mi => mi.classList.remove('activo'));
            this.classList.add('activo');

            document.querySelectorAll('.section-content').forEach(s => {
                s.classList.remove('active');
            });

            const targetSection = document.getElementById(section + '-section');
            if (targetSection) {
                targetSection.classList.add('active');
              

                // CARGAR DATOS SEGÚN LA SECCIÓN
                if (section === 'notificaciones') {
                 
                    loadUsersForNotifications();
                } else if (section === 'tareas') {
                
                    loadTaskUsers();
                    loadNucleos();
                    loadAllTasks();
                    setTimeout(() => loadMaterialesParaTarea(), 300);
                } else if (section === 'nucleo') {
                
                    loadNucleosFamiliares();
                } else if (section === 'materiales') {
                    
                    loadMateriales();
                } else if (section === 'viviendas') {
                 
                    loadViviendas();
                    loadTiposVivienda();
                } else if (section === 'usuarios') {
                   
                    loadUsersForTable();
                }
            } else {
                console.error('✗ Sección no encontrada:', section);
            }
        });
    });

});



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


/**
 *  Limpiar TODOS los modales anteriores antes de abrir uno nuevo
 */
function limpiarModalesAnteriores() {
  
    
    //  MODALES PERMANENTES DEL HTML 
    const modalesPermanentes = [
        '#viviendaModal',
        '#asignarViviendaModal',
        '#materialModal',
        '#stockModal',
        '#imageModal',
        '#editarPrecioModal',
        '#validarPagoModal',
        '#generarCuotasModal',
        '#pagarCuotaModal'
    ];
    
    modalesPermanentes.forEach(selector => {
        const modal = document.querySelector(selector);
        if (modal) {
            
            modal.style.display = 'none';
        }
    });
    
    //  MODALES DINÁMICOS
    const selectoresDinamicos = [
        '.modal-overlay:not(#editarPrecioModal):not(#validarPagoModal):not(#generarCuotasModal)',
        '.modal-detail',
        '.user-detail-modal',
        '#taskDetailModal',
        '#materialesModalAdmin',
        '#materialesModal',
        '#responderSolicitudAdminModal',
        '#justificarHorasModal',
        '#detallesNucleoModal',
        '#nucleosDisponiblesModal',
        '#misSolicitudesModal'
    ];
    
    selectoresDinamicos.forEach(selector => {
        const modales = document.querySelectorAll(selector);
        modales.forEach(modal => {
    
            modal.remove();
        });
    });
}

// ==========================================
//  Ver Detalles de Usuario
// ==========================================

function viewUserDetails(userId) {


    //  LIMPIAR MODALES ANTERIORES
    limpiarModalesAnteriores();

    fetch(`/api/users/details?id_usuario=${userId}`)
        .then(response => response.json())
        .then(data => {
 
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
 
    limpiarModalesAnteriores();

    const modalHTML = `
        <div class="user-detail-modal" 
             style="
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background: rgba(0, 68, 148, 0.5) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 10000 !important;
                padding: 20px !important;
                overflow-y: auto !important;
             "
             onclick="if(event.target.classList.contains('user-detail-modal')) { limpiarModalesAnteriores(); }">
            
            <div class="user-detail-content" 
                 style="
                    background: ${COLORS.white} !important;
                    border-radius: 12px !important;
                    box-shadow: ${COLORS.shadow} !important;
                    max-width: 600px !important;
                    width: 100% !important;
                    padding: 30px !important;
                    position: relative !important;
                    max-height: 90vh !important;
                    overflow-y: auto !important;
                 "
                 onclick="event.stopPropagation()">
                
                <button class="user-detail-close" 
                        onclick="limpiarModalesAnteriores()"
                        style="
                            position: absolute !important;
                            top: 15px !important;
                            right: 15px !important;
                            background: ${COLORS.gray100} !important;
                            border: none !important;
                            width: 35px !important;
                            height: 35px !important;
                            border-radius: 50% !important;
                            font-size: 20px !important;
                            color: ${COLORS.gray500} !important;
                            cursor: pointer !important;
                            transition: all 0.3s ease !important;
                        "
                        onmouseover="this.style.background='${COLORS.primary}'; this.style.color='${COLORS.white}'"
                        onmouseout="this.style.background='${COLORS.gray100}'; this.style.color='${COLORS.gray500}'">
                    &times;
                </button>
                
                <h2 style="
                    margin: 0 0 10px 0;
                    color: ${COLORS.primary};
                    font-size: 24px;
                    padding-right: 40px;
                ">
                    ${user.nombre_completo}
                </h2>
                
                <span class="estado-badge estado-${user.estado}" 
                      style="
                        display: inline-block;
                        padding: 5px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        margin-bottom: 20px;
                      ">
                    ${formatEstadoUsuario(user.estado)}
                </span>
                
                <div style="
                    margin-top: 20px;
                    padding: 20px;
                    background: ${COLORS.primaryLight};
                    border-radius: 8px;
                    border-left: 4px solid ${COLORS.primary};
                ">
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-id-card"></i> Cédula:
                        </strong>
                        <span>${user.cedula}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-envelope"></i> Email:
                        </strong>
                        <span>${user.email}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-map-marker-alt"></i> Dirección:
                        </strong>
                        <span>${user.direccion || '-'}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-birthday-cake"></i> Fecha Nacimiento:
                        </strong>
                        <span>${user.fecha_nacimiento || '-'}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-calendar-plus"></i> Fecha Ingreso:
                        </strong>
                        <span>${user.fecha_ingreso || '-'}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-user-tag"></i> Rol:
                        </strong>
                        <span>${user.rol || 'Sin rol'}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-users"></i> Núcleo:
                        </strong>
                        <span>${user.id_nucleo ? `#${user.id_nucleo}` : 'Sin núcleo'}</span>
                    </p>
                </div>
                
                <div style="margin-top: 20px; text-align: right;">
                    <button class="btn btn-secondary" 
                            onclick="limpiarModalesAnteriores()">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

// ==========================================
//  Crear/Editar Vivienda
// ==========================================

function showCreateViviendaModal() {


    //  LIMPIAR MODALES ANTERIORES
    limpiarModalesAnteriores();

    const modal = document.getElementById('viviendaModal');
    
    if (!modal) {
        console.error(' Modal viviendaModal NO encontrado en el DOM');
        alert('ERROR: Modal no encontrado. Recarga la página.');
        return;
    }

    loadTiposVivienda().then(() => {
        document.getElementById('viviendaModalTitle').textContent = 'Nueva Vivienda';
        document.getElementById('vivienda-id').value = '';
        document.getElementById('vivienda-numero').value = '';
        document.getElementById('vivienda-direccion').value = '';
        document.getElementById('vivienda-tipo').value = '';
        document.getElementById('vivienda-metros').value = '';
        document.getElementById('vivienda-fecha').value = '';
        document.getElementById('vivienda-estado').value = 'disponible';
        document.getElementById('vivienda-observaciones').value = '';
        
        //  MOSTRAR EL MODAL
        modal.style.display = 'flex';
   
    }).catch(error => {
        console.error(' Error al cargar tipos:', error);
        alert('Error al cargar tipos de vivienda');
    });
}

function editVivienda(id) {
 

    //  LIMPIAR MODALES ANTERIORES
    limpiarModalesAnteriores();

    const modal = document.getElementById('viviendaModal');
    
    if (!modal) {
        console.error(' Modal viviendaModal NO encontrado');
        alert('ERROR: Modal no encontrado. Recarga la página.');
        return;
    }

    Promise.all([
        fetch(`/api/viviendas/details?id=${id}`).then(r => r.json()),
        loadTiposVivienda()
    ]).then(([data]) => {
        if (data.success && data.vivienda) {
            const v = data.vivienda;
            document.getElementById('viviendaModalTitle').textContent = 'Editar Vivienda';
            document.getElementById('vivienda-id').value = v.id_vivienda;
            document.getElementById('vivienda-numero').value = v.numero_vivienda;
            document.getElementById('vivienda-direccion').value = v.direccion || '';
            document.getElementById('vivienda-tipo').value = v.id_tipo;
            document.getElementById('vivienda-metros').value = v.metros_cuadrados || '';
            document.getElementById('vivienda-fecha').value = v.fecha_construccion || '';
            document.getElementById('vivienda-estado').value = v.estado;
            document.getElementById('vivienda-observaciones').value = v.observaciones || '';

            //  MOSTRAR EL MODAL
            modal.style.display = 'flex';
         
        } else {
            alert('Error al cargar vivienda');
        }
    }).catch(error => {
        console.error('Error:', error);
        alert('Error al cargar vivienda');
    });
}

function closeViviendaModal() {
    const modal = document.getElementById('viviendaModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('viviendaForm').reset();
    }
   
    limpiarModalesAnteriores();
}

// ==========================================
//  Asignar Vivienda
// ==========================================

function showAsignarModal(viviendaId, numeroVivienda) {


    
    limpiarModalesAnteriores();

    Promise.all([
        fetch('/api/users/all').then(r => r.json()),
        fetch('/api/nucleos/all').then(r => r.json())
    ]).then(([usersData, nucleosData]) => {
        if (usersData.success && nucleosData.success) {
            const userSelect = document.getElementById('asignar-usuario');
            userSelect.innerHTML = '<option value="">Seleccione un usuario...</option>';
            usersData.users.forEach(user => {
                userSelect.innerHTML += `<option value="${user.id_usuario}">${user.nombre_completo} (${user.email})</option>`;
            });

            const nucleoSelect = document.getElementById('asignar-nucleo');
            nucleoSelect.innerHTML = '<option value="">Seleccione un núcleo...</option>';
            nucleosData.nucleos.forEach(nucleo => {
                nucleoSelect.innerHTML += `<option value="${nucleo.id_nucleo}">${nucleo.nombre_nucleo || 'Sin nombre'} (${nucleo.total_miembros} miembros)</option>`;
            });

            document.getElementById('asignar-vivienda-info').textContent = `Vivienda: ${numeroVivienda}`;
            document.getElementById('asignar-vivienda-id').value = viviendaId;
            document.getElementById('asignarViviendaModal').style.display = 'flex';
        }
    }).catch(error => {
        console.error('Error:', error);
        alert('Error al cargar datos');
    });
}

function closeAsignarModal() {
    const modal = document.getElementById('asignarViviendaModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('asignarForm').reset();
        document.getElementById('asignar-usuario-group').style.display = 'none';
        document.getElementById('asignar-nucleo-group').style.display = 'none';
    }
   
    limpiarModalesAnteriores();
}

// ==========================================
//  Materiales
// ==========================================

function showCreateMaterialModal() {
 


    limpiarModalesAnteriores();

    const modal = document.getElementById('materialModal');

    if (!modal) {
        console.error('✗ Modal no encontrado');
        alert('ERROR: Modal no encontrado en el DOM');
        return;
    }

    document.getElementById('materialModalTitle').textContent = 'Nuevo Material';
    document.getElementById('material-id').value = '';
    document.getElementById('material-nombre').value = '';
    document.getElementById('material-caracteristicas').value = '';
    modal.style.display = 'flex';

}

function closeMaterialModal() {
    const modal = document.getElementById('materialModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('materialForm').reset();
    }
   
    limpiarModalesAnteriores();
}

function showStockModal(id, nombre, stockActual) {
   
    
 
    limpiarModalesAnteriores();
    
    document.getElementById('stock-material-id').value = id;
    document.getElementById('stock-material-name').textContent = 'Material: ' + nombre;
    document.getElementById('stock-cantidad').value = stockActual;
    document.getElementById('stockModal').style.display = 'flex';
}

function closeStockModal() {
    const modal = document.getElementById('stockModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('stockForm').reset();
    }
   
    limpiarModalesAnteriores();
}

// ==========================================
// EVENT LISTENER GLOBAL
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    
    // Limpiar cuando se hace clic fuera de cualquier modal
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-overlay') || 
            event.target.classList.contains('modal-detail') ||
            event.target.classList.contains('material-modal') ||
            event.target.classList.contains('user-detail-modal')) {
            limpiarModalesAnteriores();
        }
    });
    
    // Limpiar con tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            limpiarModalesAnteriores();
        }
    });
});

// ==========================================
// EXPORTAR FUNCIONES GLOBALES
// ==========================================

window.limpiarModalesAnteriores = limpiarModalesAnteriores;
window.viewUserDetails = viewUserDetails;
window.showUserDetailModal = showUserDetailModal;
window.showCreateViviendaModal = showCreateViviendaModal;
window.closeViviendaModal = closeViviendaModal;
window.showAsignarModal = showAsignarModal;
window.closeAsignarModal = closeAsignarModal;
window.showCreateMaterialModal = showCreateMaterialModal;
window.closeMaterialModal = closeMaterialModal;
window.showStockModal = showStockModal;
window.closeStockModal = closeStockModal;


// ========== NOTIFICACIONES ==========

function loadUsersForNotifications() {
 
    const usersList = document.getElementById('usersList');



    if (!usersList) {
        console.error('✗ NO SE ENCONTRÓ usersList');
        return;
    }

    usersList.innerHTML = '<p class="loading">Cargando usuarios...</p>';

  

    fetch('/api/notifications/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
    })
        .then(response => {
       
            return response.json();
        })
        .then(data => {
   
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

    //  Agregar materiales ANTES del fetch
    if (materialesAsignados.length > 0) {
  
        formData.append('materiales_json', JSON.stringify(materialesAsignados));
    } else {
 
    }

    // Log para debug

    for (let pair of formData.entries()) {

    }

    fetch('/api/tasks/create', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
       
            if (data.success) {
                alert(data.message);
                form.reset();
                document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

                // Limpiar materiales
                materialesAsignados = [];
                renderMaterialesAsignados();

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
    
    //  Solo enviar al backend si NO es "vencida" (ese estado lo calculamos localmente)
    let url = '/api/tasks/all';
    if (filtro && filtro !== 'vencida') {
        url += `?estado=${filtro}`;
    }

    container.innerHTML = '<p class="loading">Cargando tareas...</p>';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderTasksList(data.tareas, filtro); //  Pasar filtro a renderizar
            } else {
                container.innerHTML = '<p class="error">Error al cargar tareas</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        });
}

function renderTasksList(tareas, filtroActivo = '') {

    
    const container = document.getElementById('tasksList');

    if (!tareas || tareas.length === 0) {
        container.innerHTML = '<p class="no-tasks">No hay tareas creadas</p>';
        return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
   

    //  PASO 1: Analizar cada tarea
    const tareasConEstado = tareas.map(tarea => {
        const fechaFinObj = new Date(tarea.fecha_fin + 'T00:00:00');
        const esCompletada = tarea.estado === 'completada';
        const esCancelada = tarea.estado === 'cancelada';
        const esVencida = !esCompletada && !esCancelada && fechaFinObj < hoy;

        if (esVencida) {
    
        }

        return { ...tarea, esVencida, esCompletada, esCancelada };
    });

    const vencidasCount = tareasConEstado.filter(t => t.esVencida).length;


    //  PASO 2: Filtrar
    const tareasFiltradas = tareasConEstado.filter(tarea => {
        if (filtroActivo === 'vencida') return tarea.esVencida;
        if (filtroActivo) return tarea.estado === filtroActivo;
        return true;
    });

    if (tareasFiltradas.length === 0) {
        container.innerHTML = '<p class="no-tasks">No hay tareas que coincidan con el filtro</p>';
        return;
    }

    //  PASO 3: Renderizar
    const htmlArray = tareasFiltradas.map(tarea => {
        const fechaInicio = formatearFechaUY(tarea.fecha_inicio);
        const fechaFin = formatearFechaUY(tarea.fecha_fin);
        const asignados = tarea.tipo_asignacion === 'usuario' ?
            `${tarea.total_usuarios} usuario(s)` :
            `${tarea.total_nucleos} núcleo(s)`;
        const progresoPromedio = Math.round(parseFloat(tarea.progreso_promedio || 0));
        const totalAsignados = tarea.tipo_asignacion === 'usuario' ?
            parseInt(tarea.total_usuarios) : parseInt(tarea.total_nucleos);
        const completados = parseInt(tarea.asignaciones_completadas || 0);

        //  LÓGICA DE BADGE - TRIPLE VERIFICACIÓN
        let estadoTexto = '';
        let estadoBadgeClass = '';
        let claseVencida = '';

        if (tarea.esVencida === true) {
            estadoTexto = '⏰ Vencida';
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

        const html = `
            <div class="task-item prioridad-${tarea.prioridad} ${tarea.esCompletada ? 'tarea-completada' : ''} ${claseVencida}">
                <div class="task-header">
                    <h4 class="task-title">${tarea.titulo}</h4>
                    <div class="task-badges">
                        <span class="task-badge badge-estado ${estadoBadgeClass}">
                            ${estadoTexto}
                        </span>
                        <span class="task-badge badge-prioridad ${tarea.prioridad}">
                            ${formatPrioridad(tarea.prioridad)}
                        </span>
                    </div>
                </div>
                
                <p class="task-description">${tarea.descripcion}</p>
                
                <div class="task-meta">
                    <div class="task-meta-item"><strong>Inicio:</strong> ${fechaInicio}</div>
                    <div class="task-meta-item"><strong>Fin:</strong> ${fechaFin}</div>
                    <div class="task-meta-item"><strong>Creado por:</strong> ${tarea.creador}</div>
                    <div class="task-meta-item"><strong>Asignado a:</strong> ${asignados}</div>
                </div>
                
                ${!tarea.esCancelada ? `
                    <div class="task-progress-section">
                        <div class="progress-info">
                            <span class="progress-label">Progreso general:</span>
                            <span class="progress-percentage">${progresoPromedio}%</span>
                            <span class="progress-completed">${completados}/${totalAsignados} completados</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${progresoPromedio}%; background: ${tarea.esVencida ? '#dc3545' : tarea.esCompletada ? '#28a745' : '#667eea'};">
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${tarea.esVencida ? `
                    <div class="alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Esta tarea está vencida.</strong> La fecha límite ya ha pasado.
                    </div>
                ` : ''}
                
                ${!tarea.esCancelada ? `
                    <div class="task-actions">
                        <button class="btn btn-small btn-view" onclick="viewTaskDetails(${tarea.id_tarea})">Ver Detalles</button>
                        <button class="btn btn-small btn-materiales" onclick="viewTaskMaterialsAdmin(${tarea.id_tarea})">
                            <i class="fas fa-boxes"></i> Materiales
                        </button>
                        ${!tarea.esCompletada ? `
                            <button class="btn btn-small btn-cancel" onclick="cancelTask(${tarea.id_tarea})">Cancelar Tarea</button>
                        ` : `
                            <span style="color: #28a745; font-weight: bold;">✓ Completada</span>
                        `}
                    </div>
                ` : '<p style="color: #dc3545; margin-top: 10px;"><strong>Tarea cancelada</strong></p>'}
            </div>
        `;

        return html;
    });

    container.innerHTML = htmlArray.join('');
  
}

// Afunción para ver materiales de tarea (Admin)
function viewTaskMaterialsAdmin(tareaId) {
  

    fetch(`/api/materiales/task-materials?id_tarea=${tareaId}`)
        .then(response => {
      
            return response.json();
        })
        .then(data => {


            if (data.success) {
                if (data.materiales && data.materiales.length > 0) {
                    showTaskMaterialsModalAdmin(data.materiales, tareaId);
                } else {
                    alert('Esta tarea no tiene materiales asignados');
                }
            } else {
                alert('Error: ' + (data.message || 'Error desconocido'));
            }
        })
        .catch(error => {
            console.error('>>> Error:', error);
            alert('Error de conexión: ' + error.message);
        });
}

function showTaskMaterialsModalAdmin(materiales, tareaId) {


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
                                    Requerido: <strong>${material.cantidad_requerida}</strong>
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
    `;

    const modal = `
        <div id="materialesModalAdmin" class="modal-detail" onclick="if(event.target.id==='materialesModalAdmin') this.remove()">
            <div class="modal-detail-content">
                <button onclick="document.getElementById('materialesModalAdmin').remove()" class="modal-close-button">&times;</button>
                
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

function showTaskMaterialsModal(materiales, tareaId) {
    const materialesHTML = materiales && materiales.length > 0 ? `
        <div class="materials-grid">
            ${materiales.map(m => `
                <div class="material-card disponible">
                    <h4>${m.nombre}</h4>
                    <p>Cantidad requerida: <strong>${m.cantidad_requerida}</strong></p>
                    <p>Stock actual: <strong>${m.stock_disponible}</strong></p>
                </div>
            `).join('')}
        </div>
    ` : '<p>No hay materiales asignados a esta tarea</p>';

    const modal = `
        <div id="materialesModalAdmin" class="modal-detail" onclick="if(event.target.id==='materialesModalAdmin') this.remove()">
            <div class="modal-detail-content">
                <button onclick="document.getElementById('materialesModalAdmin').remove()" class="modal-close-button">&times;</button>
                <h2 class="modal-detail-header">📦 Materiales de la Tarea</h2>
                ${materialesHTML}
                <div class="modal-detail-footer">
                    <button onclick="document.getElementById('materialesModalAdmin').remove()" class="btn btn-secondary">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
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
    formData.append('id_tarea', tareaId);  

    // Log para verificar FormData
    for (let [key, value] of formData.entries()) {
     
    }

    fetch('/api/tasks/cancel', {
        method: 'POST',
        body: formData
    })
        .then(response => {
      
            return response.json();
        })
        .then(data => {
       
            if (data.success) {
                alert(data.message);
                loadAllTasks();
            } else {
                alert('Error: ' + data.message);
                if (data.debug) {
                    console.error('Debug info:', data.debug);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cancelar tarea');
        });
}


function viewTaskDetails(tareaId) {


    const url = `=${tareaId}`; 
 

    fetch(url)
        .then(response => {
         
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
     
            if (data.success) {
                mostrarDetallesTarea(data.tarea, data.avances);
            } else {
                alert('Error al cargar detalles: ' + data.message);
                if (data.debug) {
                    console.error('Debug info:', data.debug);
                }
            }
        })
        .catch(error => {
            console.error('Error completo:', error);
            alert('Error de conexión: ' + error.message);
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
// SECCIÓN USUARIOS 
// ==========================================



// ====== CARGAR USUARIOS ==========
function loadUsersForTable() {


    // PASO 1: Buscar el contenedor
    
    const container = document.getElementById('usersTableContainer');


    if (!container) {
        console.error(' [ERROR] NO SE ENCONTRÓ #usersTableContainer');
        console.error(' [ERROR] Verifica que exista en dashboardBackoffice.php');
        alert('ERROR CRÍTICO: No se encuentra el contenedor de usuarios');
        return;
    }

 

    // PASO 2: Mostrar loading

    container.innerHTML = '<p class="loading">Cargando usuarios...</p>';


    // PASO 3: Hacer fetch

    const url = '/api/users/all';
 



    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    })
        .then(response => {
;

            if (!response.ok) {
                console.error(' [ERROR] Response no OK');
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

         
            return response.json();
        })
        .then(data => {


            if (data.users && data.users.length > 0) {
        
            }

            if (data.success) {
            
                renderUsersTable(data.users);
            } else {
                console.error(' [ERROR] Success = false');
                console.error(' [ERROR] Mensaje:', data.message);
                container.innerHTML = `<p class="error">Error: ${data.message}</p>`;
            }
        })
        .catch(error => {

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

        });
}

// ========== RENDERIZAR TABLA ==========
function renderUsersTable(users) {


    const container = document.getElementById('usersTableContainer');
 

    if (!users || users.length === 0) {
        console.warn('⚠️ [RENDER] No hay usuarios para mostrar');
        container.innerHTML = '<p class="no-users">No hay usuarios disponibles</p>';
        return;
    }



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
          
            return renderUserRow(user);
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

   

        container.innerHTML = tableHTML;

     

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

    const estadoFilter = document.getElementById('filtro-estado-usuarios').value.toLowerCase();
    const searchText = document.getElementById('search-users').value.toLowerCase();
    const rows = document.querySelectorAll('.user-row');

 

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

 
}

// ========== APROBAR PAGO ==========
function approvePaymentFromTable(userId) {
   

    if (!confirm('¿Está seguro de aprobar este pago?')) {
     
        return;
    }

    const approveBtn = document.getElementById(`approve-btn-${userId}`);
    const rejectBtn = document.getElementById(`reject-btn-${userId}`);

    if (approveBtn) {
        approveBtn.disabled = true;
        approveBtn.textContent = '...';
    }
    if (rejectBtn) rejectBtn.disabled = true;

  
    fetch('/api/payment/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id_usuario=${userId}`
    })
        .then(response => response.json())
        .then(data => {
       
            if (data.success) {
                alert(data.message);
       
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
            console.error(' [APPROVE ERROR]', error);
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
 
    const motivo = prompt('¿Por qué rechaza este pago? (opcional)');
    if (motivo === null) {
    
        return;
    }

    if (!confirm('¿Está seguro de rechazar este pago?')) {
   
        return;
    }

    const approveBtn = document.getElementById(`approve-btn-${userId}`);
    const rejectBtn = document.getElementById(`reject-btn-${userId}`);

    if (rejectBtn) {
        rejectBtn.disabled = true;
        rejectBtn.textContent = '...';
    }
    if (approveBtn) approveBtn.disabled = true;

   

    fetch('/api/payment/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id_usuario=${userId}&motivo=${encodeURIComponent(motivo)}`
    })
        .then(response => response.json())
        .then(data => {
        
            if (data.success) {
                alert(data.message);
          
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
            console.error(' [REJECT ERROR]', error);
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
   

    fetch(`/api/users/details?id_usuario=${userId}`)
        .then(response => response.json())
        .then(data => {
    
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
  
    limpiarModalesAnteriores();

    const modalHTML = `
        <div class="user-detail-modal" 
             style="
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background: rgba(0, 68, 148, 0.5) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 10000 !important;
                padding: 20px !important;
                overflow-y: auto !important;
             "
             onclick="if(event.target.classList.contains('user-detail-modal')) { limpiarModalesAnteriores(); }">
            
            <div class="user-detail-content" 
                 style="
                    background: ${COLORS.white} !important;
                    border-radius: 12px !important;
                    box-shadow: ${COLORS.shadow} !important;
                    max-width: 600px !important;
                    width: 100% !important;
                    padding: 30px !important;
                    position: relative !important;
                    max-height: 90vh !important;
                    overflow-y: auto !important;
                 "
                 onclick="event.stopPropagation()">
                
                <button class="user-detail-close" 
                        onclick="limpiarModalesAnteriores()"
                        style="
                            position: absolute !important;
                            top: 15px !important;
                            right: 15px !important;
                            background: ${COLORS.gray100} !important;
                            border: none !important;
                            width: 35px !important;
                            height: 35px !important;
                            border-radius: 50% !important;
                            font-size: 20px !important;
                            color: ${COLORS.gray500} !important;
                            cursor: pointer !important;
                            transition: all 0.3s ease !important;
                        "
                        onmouseover="this.style.background='${COLORS.primary}'; this.style.color='${COLORS.white}'"
                        onmouseout="this.style.background='${COLORS.gray100}'; this.style.color='${COLORS.gray500}'">
                    &times;
                </button>
                
                <h2 style="
                    margin: 0 0 10px 0;
                    color: ${COLORS.primary};
                    font-size: 24px;
                    padding-right: 40px;
                ">
                    ${user.nombre_completo}
                </h2>
                
                <span class="estado-badge estado-${user.estado}" 
                      style="
                        display: inline-block;
                        padding: 5px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        margin-bottom: 20px;
                      ">
                    ${formatEstadoUsuario(user.estado)}
                </span>
                
                <div style="
                    margin-top: 20px;
                    padding: 20px;
                    background: ${COLORS.primaryLight};
                    border-radius: 8px;
                    border-left: 4px solid ${COLORS.primary};
                ">
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-id-card"></i> Cédula:
                        </strong>
                        <span>${user.cedula}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-envelope"></i> Email:
                        </strong>
                        <span>${user.email}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-map-marker-alt"></i> Dirección:
                        </strong>
                        <span>${user.direccion || '-'}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-birthday-cake"></i> Fecha Nacimiento:
                        </strong>
                        <span>${user.fecha_nacimiento || '-'}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-calendar-plus"></i> Fecha Ingreso:
                        </strong>
                        <span>${user.fecha_ingreso || '-'}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-user-tag"></i> Rol:
                        </strong>
                        <span>${user.rol || 'Sin rol'}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                        <strong style="min-width: 150px; color: ${COLORS.primary};">
                            <i class="fas fa-users"></i> Núcleo:
                        </strong>
                        <span>${user.id_nucleo ? `#${user.id_nucleo}` : 'Sin núcleo'}</span>
                    </p>
                </div>
                
                <div style="margin-top: 20px; text-align: right;">
                    <button class="btn btn-secondary" 
                            onclick="limpiarModalesAnteriores()">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}



// ==========================================
// GESTIÓN DE NÚCLEOS FAMILIARES
// ==========================================


// Cargar núcleos al abrir la sección
function loadNucleosFamiliares() {
 
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

// ========== RENDERIZAR TABLA DE NÚCLEOS ==========
function renderNucleosTable(nucleos) {
    const container = document.getElementById('nucleosTableContainer');

    if (!nucleos || nucleos.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-users" style="font-size: 48px; color: #ddd; display: block; margin-bottom: 15px;"></i>
                <p style="color: #999; margin-bottom: 20px;">No hay núcleos familiares registrados</p>
                <button class="btn btn-primary" onclick="showCreateNucleoModal()">
                    <i class="fas fa-plus"></i> Crear Nuevo Núcleo
                </button>
            </div>
        `;
        return;
    }

    let tableHTML = `
        <div class="viviendas-table-container">
            <table class="viviendas-table">
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
    `;

    nucleos.forEach(nucleo => {
        const integrantes = nucleo.miembros_nombres
            ? nucleo.miembros_nombres.split(', ').slice(0, 3).join(', ') +
              (nucleo.total_miembros > 3 ? ` y ${nucleo.total_miembros - 3} más...` : '')
            : 'Sin miembros';

        tableHTML += `
            <tr>
                <td><strong>${nucleo.id_nucleo}</strong></td>
                <td>${nucleo.nombre_nucleo || 'Sin nombre'}</td>
                <td>${nucleo.direccion || '-'}</td>
                <td class="text-center">
                    <span class="badge-count">${nucleo.total_miembros || 0}</span>
                </td>
                <td>${integrantes}</td>
                <td>
                    <div class="vivienda-actions">
                        <button class="btn-view-vivienda" 
                                onclick="viewNucleoDetails(${nucleo.id_nucleo})" 
                                title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-edit-vivienda" 
                                onclick="editNucleo(${nucleo.id_nucleo})" 
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete-vivienda" 
                                onclick="deleteNucleo(${nucleo.id_nucleo})" 
                                title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
}

// ========== RENDERIZAR FILA DE NÚCLEO ==========
function renderNucleoRow(nucleo) {
    const integrantes = nucleo.miembros_nombres
        ? nucleo.miembros_nombres.split(', ').slice(0, 3).join(', ') +
          (nucleo.total_miembros > 3 ? ` y ${nucleo.total_miembros - 3} más...` : '')
        : 'Sin miembros';

    return `
        <tr class="nucleo-row" data-id="${nucleo.id_nucleo}">
            <td>${nucleo.id_nucleo}</td>
            <td><strong>${nucleo.nombre_nucleo || 'Sin nombre'}</strong></td>
            <td>${nucleo.direccion || '-'}</td>
            <td class="text-center">
                <span class="badge-count">${nucleo.total_miembros || 0}</span>
            </td>
            <td>${integrantes}</td>
            <td>
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button class="btn-small btn-view" 
                            onclick="viewNucleoDetails(${nucleo.id_nucleo})" 
                            title="Ver detalles">
                        Ver
                    </button>
                    <button class="btn-small btn-edit" 
                            onclick="editNucleo(${nucleo.id_nucleo})" 
                            title="Editar">
                        Editar
                    </button>
                    <button class="btn-small btn-delete" 
                            onclick="deleteNucleo(${nucleo.id_nucleo})" 
                            title="Eliminar">
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `;
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
        <div id="nucleoModal" class="material-modal" style="display: flex;">
            <div class="material-modal-content">
                <div class="material-modal-header">
                    <h3 id="nucleoModalTitle">Editar Núcleo Familiar</h3>
                    <button class="close-material-modal" onclick="closeNucleoModal()">&times;</button>
                </div>
                
                <form id="editNucleoForm" onsubmit="submitEditNucleo(event, ${nucleoId})">
                    <input type="hidden" id="edit_nucleo_id" value="${nucleoId}">

                    <!-- Nombre -->
                    <div class="material-form-group">
                        <label for="edit_nombre_nucleo">Nombre del Núcleo *</label>
                        <input type="text" id="edit_nombre_nucleo" name="nombre_nucleo"
                               value="${nucleo.nombre_nucleo || ''}" required
                               placeholder="Ej: Núcleo Pérez-García">
                    </div>

                    <!-- Dirección -->
                    <div class="material-form-group">
                        <label for="edit_direccion_nucleo">Dirección</label>
                        <input type="text" id="edit_direccion_nucleo" name="direccion"
                               value="${nucleo.direccion || ''}"
                               placeholder="Ej: Calle 123, Bloque A">
                    </div>

                    <!-- Miembros -->
                    <div class="material-form-group">
                        <label>Miembros del Núcleo *</label>
                        <div class="user-selection-nucleo" style="display: flex; flex-direction: column; gap: 10px;">
                            <input type="text" id="search-users-nucleo-edit"
                                   class="material-input"
                                   placeholder="Buscar usuario..."
                                   onkeyup="filterUsersNucleoEdit()">

                            <div id="usersListNucleoEdit" class="users-checkboxes-nucleo" 
                                 style="
                                     display: flex;
                                     flex-direction: column;
                                     gap: 6px;
                                     max-height: 180px;
                                     overflow-y: auto;
                                     border: 1px solid #ddd;
                                     border-radius: 8px;
                                     padding: 10px;
                                     background: #fafafa;
                                 ">
                                ${renderUsersCheckboxesEdit(usuarios, miembrosActuales, nucleoId)}
                            </div>
                        </div>
                    </div>

                    <!-- Botones -->
                    <div class="material-form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeNucleoModal()">
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

        // Eliminar modal previo si existía (para evitar duplicados)
        const existing = document.getElementById("nucleoModal");
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al cargar datos del núcleo');
    });
}

// Cerrar modal
function closeNucleoModal() {
    const modal = document.getElementById("nucleoModal");
    if (modal) modal.remove();
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




// ==========================================
// GESTIÓN DE MATERIALES - VERSIÓN FINAL
// ==========================================



// ========== CARGAR MATERIALES ==========
function loadMateriales() {
 
    const container = document.getElementById('materialesTableContainer');

    if (!container) {
        console.error('✗ NO SE ENCONTRÓ materialesTableContainer');
        return;
    }

    container.innerHTML = '<p class="loading">Cargando materiales...</p>';

    fetch('/api/materiales/all', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
        
            if (data.success) {
                renderMaterialesTable(data.materiales);
            } else {
                container.innerHTML = `<p class="error">Error: ${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Error al cargar materiales:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        });
}

// ========== RENDERIZAR TABLA MATERIAL ==========
function renderMaterialesTable(materiales) {
    const container = document.getElementById('materialesTableContainer');

    if (!materiales || materiales.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-box-open" style="font-size: 48px; color: #ddd; display: block; margin-bottom: 15px;"></i>
                <p style="color: #999; margin-bottom: 20px;">No hay materiales registrados</p>
                <button class="btn btn-primary" onclick="showCreateMaterialModal()">
                    <i class="fas fa-plus"></i> Crear Primer Material
                </button>
            </div>
        `;
        return;
    }

    let tableHTML = `
        <div class="viviendas-table-container">
            <table class="viviendas-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Material</th>
                        <th>Características</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

    materiales.forEach(material => {
        const stock = parseInt(material.stock) || 0;
        let stockClass = 'disponible';

        if (stock === 0) {
            stockClass = 'agotado';
        } else if (stock < 10) {
            stockClass = 'bajo';
        }

        tableHTML += `
            <tr>
                <td>${material.id_material}</td>
                <td><strong>${material.nombre}</strong></td>
                <td>${material.caracteristicas || '-'}</td>
                <td>
                    <span class="stock-badge ${stockClass}">${stock}</span>
                </td>
                <td>
                    <div class="vivienda-actions">
                        <button class="btn-view-vivienda" 
                                onclick="showStockModal(${material.id_material}, '${material.nombre.replace(/'/g, "\\'")}', ${stock})" 
                                title="Actualizar Stock">
                            <i class="fas fa-boxes"></i>
                        </button>
                        <button class="btn-edit-vivienda" 
                                onclick="editMaterial(${material.id_material})" 
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete-vivienda" 
                                onclick="deleteMaterial(${material.id_material}, '${material.nombre.replace(/'/g, "\\'")}')" 
                                title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
}


// ========== BUSCAR MATERIALES ==========
let searchMaterialesTimeout;
function searchMateriales() {
    clearTimeout(searchMaterialesTimeout);

    searchMaterialesTimeout = setTimeout(() => {
        const searchTerm = document.getElementById('search-materiales').value.trim();

        if (searchTerm === '') {
            loadMateriales();
            return;
        }

        fetch(`/api/materiales/search?q=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderMaterialesTable(data.materiales);
                }
            })
            .catch(error => console.error('Error:', error));
    }, 300);
}

// ========== MOSTRAR MODAL CREAR ==========
function showCreateMaterialModal() {
 

    const modal = document.getElementById('materialModal');

    if (!modal) {
        console.error('✗ Modal no encontrado');
        alert('ERROR: Modal no encontrado en el DOM');
        return;
    }

    // Resetear formulario
    document.getElementById('materialModalTitle').textContent = 'Nuevo Material';
    document.getElementById('material-id').value = '';
    document.getElementById('material-nombre').value = '';
    document.getElementById('material-caracteristicas').value = '';

    // Mostrar modal
    modal.style.display = 'flex';
   
}

// ========== EDITAR MATERIAL ==========
function editMaterial(id) {
   

    fetch(`/api/materiales/details?id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.material) {
                document.getElementById('materialModalTitle').textContent = 'Editar Material';
                document.getElementById('material-id').value = data.material.id_material;
                document.getElementById('material-nombre').value = data.material.nombre;
                document.getElementById('material-caracteristicas').value = data.material.caracteristicas || '';
                document.getElementById('materialModal').style.display = 'flex';
            } else {
                alert('Error al cargar material');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar material');
        });
}

// ========== GUARDAR MATERIAL ==========
function saveMaterial(event) {
    event.preventDefault();
    

    const id = document.getElementById('material-id').value;
    const nombre = document.getElementById('material-nombre').value.trim();
    const caracteristicas = document.getElementById('material-caracteristicas').value.trim();

    if (!nombre) {
        alert('El nombre es requerido');
        return;
    }

    const materialData = { nombre, caracteristicas };
    const url = id ? '/api/materiales/update' : '/api/materiales/create';

    if (id) {
        materialData.id = id;
    }

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                closeMaterialModal();
                loadMateriales();
            } else {
                alert('Error: ' + (data.message || 'Error al guardar material'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión');
        });
}

// ========== CERRAR MODAL MATERIAL ==========
function closeMaterialModal() {
    document.getElementById('materialModal').style.display = 'none';
    document.getElementById('materialForm').reset();
}

// ========== ELIMINAR MATERIAL ==========
function deleteMaterial(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el material "${nombre}"?\n\nNota: No se puede eliminar si está asignado a tareas.`)) {
        return;
    }

    fetch('/api/materiales/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Material eliminado exitosamente');
                loadMateriales();
            } else {
                alert('Error: ' + (data.message || 'Error al eliminar material'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión');
        });
}

// ========== MOSTRAR MODAL STOCK ==========
function showStockModal(id, nombre, stockActual) {
   
    document.getElementById('stock-material-id').value = id;
    document.getElementById('stock-material-name').textContent = 'Material: ' + nombre;
    document.getElementById('stock-cantidad').value = stockActual;
    document.getElementById('stockModal').style.display = 'flex';
}

// ========== CERRAR MODAL STOCK ==========
function closeStockModal() {
    document.getElementById('stockModal').style.display = 'none';
    document.getElementById('stockForm').reset();
}

// ========== ACTUALIZAR STOCK ==========
function updateStock(event) {
    event.preventDefault();
 

    const id = document.getElementById('stock-material-id').value;
    const cantidad = parseInt(document.getElementById('stock-cantidad').value);

    if (cantidad < 0) {
        alert('La cantidad no puede ser negativa');
        return;
    }

    fetch('/api/materiales/update-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, cantidad })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Stock actualizado exitosamente');
                closeStockModal();
                loadMateriales();
            } else {
                alert('Error: ' + (data.message || 'Error al actualizar stock'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión');
        });
}






// ==========================================
// INTEGRACIÓN DE MATERIALES EN TAREAS - 
// ==========================================



// Variable global para materiales asignados
let materialesAsignados = [];

// ========== CARGAR MATERIALES DISPONIBLES PARA ASIGNAR ==========
function loadMaterialesParaTarea() {

    const container = document.getElementById('materiales-tarea-list');

    if (!container) {
        console.error('✗ Container materiales-tarea-list NO encontrado');
        return;
    }

   
    container.innerHTML = '<p class="loading">Cargando materiales...</p>';

    fetch('/api/materiales/all', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
    })
        .then(response => {
          
            return response.json();
        })
        .then(data => {
         
            if (data.success) {
                renderMaterialesSelectorTarea(data.materiales);
            } else {
                container.innerHTML = `<p class="error">Error: ${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Error al cargar materiales:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        });
}

// ========== RENDERIZAR SELECTOR DE MATERIALES ==========
function renderMaterialesSelectorTarea(materiales) {

    const container = document.getElementById('materiales-tarea-list');

    if (!materiales || materiales.length === 0) {
        container.innerHTML = '<p style="color: #999; padding: 10px;">No hay materiales disponibles. <a href="#" onclick="event.preventDefault(); document.querySelector(\'[data-section=\\\'materiales\\\']\').click();">Crear materiales</a></p>';
        return;
    }

    container.innerHTML = materiales.map(material => {
        const stock = parseInt(material.stock) || 0;
        const stockClass = stock === 0 ? 'agotado' : (stock < 10 ? 'bajo' : 'disponible');

        return `
            <div class="material-selector-item" data-material-id="${material.id_material}">
                <div class="material-selector-info">
                    <div class="material-selector-name">
                        <strong>${material.nombre}</strong>
                        <span class="stock-badge-small ${stockClass}">${stock} disponible</span>
                    </div>
                    ${material.caracteristicas ? `<small style="color: #666;">${material.caracteristicas}</small>` : ''}
                </div>
                <div class="material-selector-actions">
                    <input type="number" 
                           class="material-cantidad-input" 
                           id="cantidad-${material.id_material}"
                           min="1" 
                           max="${stock > 0 ? stock : 999}"
                           placeholder="Cant." 
                           style="width: 70px;">
                    <button type="button" 
                            class="btn-small btn-add-material" 
                            onclick="addMaterialToTask(${material.id_material}, '${material.nombre.replace(/'/g, "\\'")}', ${stock})"
                            ${stock === 0 ? 'disabled title="Sin stock"' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');


}

// ========== AGREGAR MATERIAL A LA LISTA ==========
function addMaterialToTask(materialId, materialNombre, stockDisponible) {

    const cantidadInput = document.getElementById(`cantidad-${materialId}`);
    const cantidad = parseInt(cantidadInput.value);

    if (!cantidad || cantidad <= 0) {
        alert('Ingresa una cantidad válida');
        return;
    }

    if (cantidad > stockDisponible) {
        alert(`Solo hay ${stockDisponible} unidades disponibles`);
        return;
    }

    const existente = materialesAsignados.find(m => m.id === materialId);
    if (existente) {
        existente.cantidad = cantidad;
        alert('Cantidad actualizada');
    } else {
        materialesAsignados.push({
            id: materialId,
            nombre: materialNombre,
            cantidad: cantidad,
            stock: stockDisponible
        });
    }

    cantidadInput.value = '';
    renderMaterialesAsignados();
}

// ========== RENDERIZAR LISTA DE ASIGNADOS ==========
function renderMaterialesAsignados() {
    const container = document.getElementById('materiales-asignados-list');

    if (!container) return;

    if (materialesAsignados.length === 0) {
        container.innerHTML = '<p style="color: #999; padding: 10px;">No hay materiales asignados</p>';
        return;
    }

    container.innerHTML = `
        <div class="materiales-asignados-header">
            <strong>Materiales asignados (${materialesAsignados.length}):</strong>
        </div>
        ${materialesAsignados.map(material => `
            <div class="material-asignado-item">
                <div class="material-asignado-info">
                    <strong>${material.nombre}</strong>
                    <span class="cantidad-badge">Cantidad: ${material.cantidad}</span>
                </div>
                <button type="button" 
                        class="btn-small btn-remove" 
                        onclick="removeMaterialFromTask(${material.id})"
                        title="Quitar material">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('')}
    `;
}

// ========== QUITAR MATERIAL ==========
function removeMaterialFromTask(materialId) {
    materialesAsignados = materialesAsignados.filter(m => m.id !== materialId);
    renderMaterialesAsignados();
}

// ========== FILTRAR MATERIALES ==========
function filterMaterialesTarea() {
    const searchTerm = document.getElementById('search-materiales-tarea').value.toLowerCase();
    const items = document.querySelectorAll('.material-selector-item');

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// ========== MODIFICAR createTask EXISTENTE ==========


function createTask(event) {
    event.preventDefault();

   

    const form = event.target;
    const formData = new FormData(form);
    const tipoAsignacion = formData.get('tipo_asignacion');

    // Asignar usuarios o núcleos
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

    // AGREGAR MATERIALES
    if (materialesAsignados.length > 0) {
        const materialesJSON = JSON.stringify(materialesAsignados);
      
        formData.append('materiales_json', materialesJSON);
    } else {
        console.warn('No hay materiales asignados');
    }

    // DEBUG: Mostrar todo el FormData
  
    for (let [key, value] of formData.entries()) {
    
    }
   

    // Enviar
    fetch('/api/tasks/create', {
        method: 'POST',
        body: formData
    })
        .then(response => {
        
            return response.json();
        })
        .then(data => {
      
            if (data.success) {
                alert(data.message);
                form.reset();
                document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

                // Limpiar materiales
                materialesAsignados = [];
                renderMaterialesAsignados();

                loadAllTasks();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error en fetch:', error);
            alert('Error al crear tarea');
        });
}

// ========== CARGAR MATERIALES AL ABRIR SECCIÓN TAREAS ==========
document.addEventListener('DOMContentLoaded', function () {
   

    // Cargar materiales cuando se abre la sección de tareas
    const tareasMenuItem = document.querySelector('.menu li[data-section="tareas"]');
    if (tareasMenuItem) {
        tareasMenuItem.addEventListener('click', function () {
          
            loadTaskUsers();
            loadNucleos();
            loadAllTasks();
            // Cargar materiales inmediatamente
            setTimeout(() => {
                loadMaterialesParaTarea();
            }, 300);
        });
    }

    // Cargar materiales al abrir sección materiales
    const materialesMenuItem = document.querySelector('.menu li[data-section="materiales"]');
    if (materialesMenuItem) {
        materialesMenuItem.addEventListener('click', function () {
            loadMateriales();
        });
    }
});


// ==========================================
// GESTIÓN DE VIVIENDAS
// ==========================================



// ========== CARGAR VIVIENDAS ==========
function loadViviendas() {
  
    const container = document.getElementById('viviendasTableContainer');

    if (!container) {
        console.error('✗ Container viviendasTableContainer NO encontrado');
        return;
    }

    container.innerHTML = '<p class="loading">Cargando viviendas...</p>';

    fetch('/api/viviendas/all', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
     
            if (data.success) {
                renderViviendasTable(data.viviendas);
            } else {
                container.innerHTML = `<p class="error">Error: ${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Error al cargar viviendas:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        });
}

// ========== RENDERIZAR TABLA ==========
function renderViviendasTable(viviendas) {
    const container = document.getElementById('viviendasTableContainer');

    if (!viviendas || viviendas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-home" style="font-size: 48px; color: #ddd; display: block; margin-bottom: 15px;"></i>
                <p style="color: #999; margin-bottom: 20px;">No hay viviendas registradas</p>
                <button class="btn btn-primary" onclick="showCreateViviendaModal()">
                    <i class="fas fa-plus"></i> Crear Primera Vivienda
                </button>
            </div>
        `;
        return;
    }

    let tableHTML = `
        <div class="viviendas-table-container">
            <table class="viviendas-table">
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Dirección</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Metros²</th>
                        <th>Asignada a</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

    viviendas.forEach(vivienda => {
        const estadoClass = vivienda.estado === 'disponible' ? 'disponible' :
            vivienda.estado === 'ocupada' ? 'ocupada' : 'mantenimiento';

        const asignada = vivienda.usuario_asignado || vivienda.nucleo_asignado || '-';
        const tieneAsignacion = vivienda.id_asignacion && vivienda.activa == 1;

        tableHTML += `
            <tr data-estado="${vivienda.estado}" data-habitaciones="${vivienda.habitaciones}">
                <td><strong>${vivienda.numero_vivienda}</strong></td>
                <td>${vivienda.direccion || '-'}</td>
                <td>${vivienda.tipo_nombre} (${vivienda.habitaciones} hab.)</td>
                <td>
                    <span class="estado-badge-vivienda ${estadoClass}">
                        ${formatEstadoVivienda(vivienda.estado)}
                    </span>
                </td>
                <td>${vivienda.metros_cuadrados ? vivienda.metros_cuadrados + ' m²' : '-'}</td>
                <td>${asignada}</td>
                <td>
                    <div class="vivienda-actions">
                        <button class="btn-view-vivienda" onclick="viewViviendaDetails(${vivienda.id_vivienda})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-edit-vivienda" onclick="editVivienda(${vivienda.id_vivienda})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${!tieneAsignacion ? `
                            <button class="btn-assign-vivienda" onclick="showAsignarModal(${vivienda.id_vivienda}, '${vivienda.numero_vivienda.replace(/'/g, "\\'")}')">
                                <i class="fas fa-user-plus"></i>
                            </button>
                        ` : `
                            <button class="btn-unassign-vivienda" onclick="desasignarVivienda(${vivienda.id_asignacion})">
                                <i class="fas fa-user-minus"></i>
                            </button>
                        `}
                        <button class="btn-delete-vivienda" onclick="deleteVivienda(${vivienda.id_vivienda}, '${vivienda.numero_vivienda.replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
}

// ========== FORMATEAR ESTADO ==========
function formatEstadoVivienda(estado) {
    const estados = {
        'disponible': 'Disponible',
        'ocupada': 'Ocupada',
        'mantenimiento': 'Mantenimiento'
    };
    return estados[estado] || estado;
}

// ========== FILTRAR VIVIENDAS ==========
function filterViviendas() {
    const estadoFilter = document.getElementById('filtro-estado-vivienda').value;
    const habitacionesFilter = document.getElementById('filtro-habitaciones').value;
    const searchText = document.getElementById('search-viviendas').value.toLowerCase();
    const rows = document.querySelectorAll('.viviendas-table tbody tr');

    rows.forEach(row => {
        const estado = row.dataset.estado || '';
        const habitaciones = row.dataset.habitaciones || '';
        const text = row.textContent.toLowerCase();

        const matchEstado = !estadoFilter || estado === estadoFilter;
        const matchHabitaciones = !habitacionesFilter || habitaciones === habitacionesFilter;
        const matchSearch = !searchText || text.includes(searchText);

        row.style.display = (matchEstado && matchHabitaciones && matchSearch) ? '' : 'none';
    });
}

// ========== CARGAR TIPOS DE VIVIENDA ==========
function loadTiposVivienda() {
    return fetch('/api/viviendas/tipos')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('vivienda-tipo');
                select.innerHTML = '<option value="">Seleccione...</option>';
                data.tipos.forEach(tipo => {
                    select.innerHTML += `<option value="${tipo.id_tipo}">${tipo.nombre} (${tipo.habitaciones} hab.)</option>`;
                });
            }
        })
        .catch(error => console.error('Error al cargar tipos:', error));
}

// ========== MOSTRAR MODAL CREAR ==========
function showCreateViviendaModal() {
  

    loadTiposVivienda().then(() => {
        document.getElementById('viviendaModalTitle').textContent = 'Nueva Vivienda';
        document.getElementById('vivienda-id').value = '';
        document.getElementById('vivienda-numero').value = '';
        document.getElementById('vivienda-direccion').value = '';
        document.getElementById('vivienda-tipo').value = '';
        document.getElementById('vivienda-metros').value = '';
        document.getElementById('vivienda-fecha').value = '';
        document.getElementById('vivienda-estado').value = 'disponible';
        document.getElementById('vivienda-observaciones').value = '';
        document.getElementById('viviendaModal').style.display = 'flex';
    });
}

// ========== EDITAR VIVIENDA ==========
function editVivienda(id) {
    ('>>> Editando vivienda ID:', id);
    ('🧹 Limpiando modales anteriores...');

    // 🧹 LIMPIAR MODALES ANTERIORES
    limpiarModalesAnteriores();

    const modal = document.getElementById('viviendaModal');
    ('🔍 Modal encontrado:', modal);
    ('🔍 Modal display actual:', modal ? modal.style.display : 'NULL');
    
    if (!modal) {
        console.error(' Modal viviendaModal NO encontrado');
        alert('ERROR: Modal no encontrado. Recarga la página.');
        return;
    }

    ('🌐 Cargando datos de vivienda...');

    Promise.all([
        fetch(`/api/viviendas/details?id=${id}`).then(r => r.json()),
        loadTiposVivienda()
    ]).then(([data]) => {
        ('📦 Datos recibidos:', data);
        
        if (data.success && data.vivienda) {
            const v = data.vivienda;
            
            ('📝 Llenando formulario...');
            document.getElementById('viviendaModalTitle').textContent = 'Editar Vivienda';
            document.getElementById('vivienda-id').value = v.id_vivienda;
            document.getElementById('vivienda-numero').value = v.numero_vivienda;
            document.getElementById('vivienda-direccion').value = v.direccion || '';
            document.getElementById('vivienda-tipo').value = v.id_tipo;
            document.getElementById('vivienda-metros').value = v.metros_cuadrados || '';
            document.getElementById('vivienda-fecha').value = v.fecha_construccion || '';
            document.getElementById('vivienda-estado').value = v.estado;
            document.getElementById('vivienda-observaciones').value = v.observaciones || '';

            ('👁️ Mostrando modal...');
            modal.style.display = 'flex';
            (' Modal display después de mostrar:', modal.style.display);
            (' Modal de edición mostrado correctamente');
        } else {
            console.error(' Error en data.success o data.vivienda');
            alert('Error al cargar vivienda');
        }
    }).catch(error => {
        console.error(' Error completo:', error);
        console.error(' Error stack:', error.stack);
        alert('Error al cargar vivienda: ' + error.message);
    });
}

// ========== GUARDAR VIVIENDA ==========
function saveVivienda(event) {
    event.preventDefault();
    ('>>> Guardando vivienda');

    const id = document.getElementById('vivienda-id').value;
    const formData = new FormData();

    if (id) formData.append('id', id);
    formData.append('numero_vivienda', document.getElementById('vivienda-numero').value);
    formData.append('direccion', document.getElementById('vivienda-direccion').value);
    formData.append('id_tipo', document.getElementById('vivienda-tipo').value);
    formData.append('metros_cuadrados', document.getElementById('vivienda-metros').value || 0);
    formData.append('fecha_construccion', document.getElementById('vivienda-fecha').value || '');
    formData.append('estado', document.getElementById('vivienda-estado').value);
    formData.append('observaciones', document.getElementById('vivienda-observaciones').value);

    const url = id ? '/api/viviendas/update' : '/api/viviendas/create';

    fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                closeViviendaModal();
                loadViviendas();
            } else {
                alert('Error: ' + (data.message || 'Error al guardar vivienda'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión');
        });
}

// ========== CERRAR MODAL VIVIENDA ==========
function closeViviendaModal() {
    document.getElementById('viviendaModal').style.display = 'none';
    document.getElementById('viviendaForm').reset();
}

// ========== ELIMINAR VIVIENDA ==========
function deleteVivienda(id, numero) {
    if (!confirm(`¿Estás seguro de eliminar la vivienda "${numero}"?\n\nNota: No se puede eliminar si tiene asignaciones activas.`)) {
        return;
    }

    const formData = new FormData();
    formData.append('id', id);

    fetch('/api/viviendas/delete', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Vivienda eliminada exitosamente');
                loadViviendas();
            } else {
                alert('Error: ' + (data.message || 'Error al eliminar vivienda'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión');
        });
}

// ========== VER DETALLES ==========
function viewViviendaDetails(id) {
    fetch(`/api/viviendas/details?id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.vivienda) {
                showViviendaDetailsModal(data.vivienda);
            } else {
                alert('Error al cargar detalles');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión');
        });
}

function showViviendaDetailsModal(vivienda) {
    const modal = `
        <div class="modal-overlay" onclick="if(event.target.classList.contains('modal-overlay')) this.remove()">
            <div class="modal-content-large">
                <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
                
                <h2 class="modal-title">Vivienda ${vivienda.numero_vivienda}</h2>
                
                <div class="vivienda-details-grid">
                    <div class="detail-item"><strong>Dirección:</strong> ${vivienda.direccion || 'No especificada'}</div>
                    <div class="detail-item"><strong>Tipo:</strong> ${vivienda.tipo_nombre} (${vivienda.habitaciones} hab.)</div>
                    <div class="detail-item"><strong>Estado:</strong> ${formatEstadoVivienda(vivienda.estado)}</div>
                    <div class="detail-item"><strong>Metros²:</strong> ${vivienda.metros_cuadrados || '-'}</div>
                    <div class="detail-item"><strong>Construcción:</strong> ${vivienda.fecha_construccion || '-'}</div>
                </div>
                
                ${vivienda.observaciones ? `
                    <div style="margin-top: 20px;">
                        <strong>Observaciones:</strong>
                        <p>${vivienda.observaciones}</p>
                    </div>
                ` : ''}
                
                <div class="form-actions" style="margin-top: 30px;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove(); editVivienda(${vivienda.id_vivienda})">Editar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

// ========== ASIGNAR VIVIENDA ==========
function showAsignarModal(viviendaId, numeroVivienda) {
    ('>>> Abriendo modal asignar:', viviendaId);

    // Cargar usuarios y núcleos
    Promise.all([
        fetch('/api/users/all').then(r => r.json()),
        fetch('/api/nucleos/all').then(r => r.json())
    ]).then(([usersData, nucleosData]) => {
        if (usersData.success && nucleosData.success) {
            // Llenar select de usuarios
            const userSelect = document.getElementById('asignar-usuario');
            userSelect.innerHTML = '<option value="">Seleccione un usuario...</option>';
            usersData.users.forEach(user => {
                userSelect.innerHTML += `<option value="${user.id_usuario}">${user.nombre_completo} (${user.email})</option>`;
            });

            // Llenar select de núcleos
            const nucleoSelect = document.getElementById('asignar-nucleo');
            nucleoSelect.innerHTML = '<option value="">Seleccione un núcleo...</option>';
            nucleosData.nucleos.forEach(nucleo => {
                nucleoSelect.innerHTML += `<option value="${nucleo.id_nucleo}">${nucleo.nombre_nucleo || 'Sin nombre'} (${nucleo.total_miembros} miembros)</option>`;
            });

            // Mostrar info de vivienda
            document.getElementById('asignar-vivienda-info').textContent = `Vivienda: ${numeroVivienda}`;
            document.getElementById('asignar-vivienda-id').value = viviendaId;

            // Mostrar modal
            document.getElementById('asignarViviendaModal').style.display = 'flex';
        }
    }).catch(error => {
        console.error('Error:', error);
        alert('Error al cargar datos');
    });
}

function toggleAsignarTipo() {
    const tipo = document.getElementById('asignar-tipo').value;
    const usuarioGroup = document.getElementById('asignar-usuario-group');
    const nucleoGroup = document.getElementById('asignar-nucleo-group');

    if (tipo === 'usuario') {
        usuarioGroup.style.display = 'block';
        nucleoGroup.style.display = 'none';
        document.getElementById('asignar-nucleo').value = '';
    } else if (tipo === 'nucleo') {
        usuarioGroup.style.display = 'none';
        nucleoGroup.style.display = 'block';
        document.getElementById('asignar-usuario').value = '';
    } else {
        usuarioGroup.style.display = 'none';
        nucleoGroup.style.display = 'none';
    }
}

// ==========================================
//  submitAsignacion() - CON RECARGA AUTOMÁTICA
// ==========================================

function submitAsignacion(event) {
    event.preventDefault();
    ('📤 [ASIGNAR] Iniciando asignación de vivienda...');

    const viviendaId = document.getElementById('asignar-vivienda-id').value;
    const tipo = document.getElementById('asignar-tipo').value;
    const usuarioId = document.getElementById('asignar-usuario').value;
    const nucleoId = document.getElementById('asignar-nucleo').value;
    const observaciones = document.getElementById('asignar-observaciones').value;

    //  VALIDACIÓN
    if (!tipo || (tipo === 'usuario' && !usuarioId) || (tipo === 'nucleo' && !nucleoId)) {
        alert('⚠️ Debe seleccionar un usuario o núcleo');
        return;
    }

    const formData = new FormData();
    formData.append('vivienda_id', viviendaId);
    
    if (tipo === 'usuario') {
        formData.append('usuario_id', usuarioId);
    } else if (tipo === 'nucleo') {
        formData.append('nucleo_id', nucleoId);
    }
    
    formData.append('observaciones', observaciones);

    ('📤 [ASIGNAR] Enviando asignación...');

    fetch('/api/viviendas/asignar', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(' ' + data.message);
                
                //  CERRAR MODAL
                closeAsignarModal();
                
                //  RECARGAR PÁGINA COMPLETA
                ('🔄 [ASIGNAR] Recargando página...');
                window.location.reload();
                
            } else {
                alert(' Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error(' [ASIGNAR] Error:', error);
            alert(' Error de conexión');
        });
}

//  EXPORTAR
window.submitAsignacion = submitAsignacion;

(' submitAsignacion con recarga automática aplicado');

function closeAsignarModal() {
    document.getElementById('asignarViviendaModal').style.display = 'none';
    document.getElementById('asignarForm').reset();
    document.getElementById('asignar-usuario-group').style.display = 'none';
    document.getElementById('asignar-nucleo-group').style.display = 'none';
}

// ========== DESASIGNAR VIVIENDA ==========
function desasignarVivienda(asignacionId) {
    if (!confirm('¿Estás seguro de desasignar esta vivienda?')) {
        return;
    }

    const formData = new FormData();
    formData.append('asignacion_id', asignacionId);

    fetch('/api/viviendas/desasignar', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                loadViviendas();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión');
        });
}

(' Módulo de Viviendas cargado completamente');

// ==========================================
// SISTEMA DE CUOTAS MENSUALES - ADMIN (SOLO 3 PRECIOS FIJOS)
// ==========================================

('🟢 Cargando módulo de cuotas (Admin)');

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function () {
    ('✓ DOMContentLoaded ejecutado');

    // Listener para cuotas
    const cuotasMenuItem = document.querySelector('.menu li[data-section="cuotas"]');
    if (cuotasMenuItem) {
        ('✓ Listener de cuotas agregado');
        cuotasMenuItem.addEventListener('click', function () {
            ('>>> Sección cuotas admin abierta');
            inicializarSeccionCuotasAdmin();
        });
    }

    // Poblar selector de años
    const selectAnio = document.getElementById('admin-filtro-anio');
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

// ========== INICIALIZAR SECCIÓN ==========
async function inicializarSeccionCuotasAdmin() {
    ('📋 Inicializando sección de cuotas admin');
    
    try {
        await Promise.all([
            loadPreciosCuotas(),
            loadEstadisticasCuotas(),
            loadAllCuotasAdmin()
        ]);
        
        ('✓ Sección de cuotas admin inicializada');
    } catch (error) {
        console.error(' Error al inicializar cuotas admin:', error);
    }
}

// ========== CARGAR PRECIOS (SOLO 3 FIJOS) ==========
async function loadPreciosCuotas() {
    const container = document.getElementById('preciosCuotasContainer');
    if (!container) {
        console.error(' No se encontró preciosCuotasContainer');
        return;
    }
    
    container.innerHTML = '<p class="loading">Cargando precios...</p>';
    
    try {
        const response = await fetch('/api/cuotas/precios');
        const data = await response.json();
        
        ('📊 Precios recibidos:', data);
        
        if (data.success) {
            renderPreciosCuotas(data.precios);
        } else {
            container.innerHTML = '<p class="error">Error al cargar precios</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== RENDERIZAR 3 PRECIOS FIJOS ==========
function renderPreciosCuotas(precios) {
     ('🔍 [DEBUG] renderPreciosCuotas llamada');
    ('🔍 [DEBUG] Stack trace:', new Error().stack);
    ('🔍 [DEBUG] Precios recibidos:', precios.length);
    const container = document.getElementById('preciosCuotasContainer');
    
    //  LIMPIAR CONTENEDOR ANTES DE RENDERIZAR
    container.innerHTML = '';
    
    if (!precios || precios.length === 0) {
        container.innerHTML = '<p>No hay precios configurados</p>';
        return;
    }

    precios.sort((a, b) => a.habitaciones - b.habitaciones);
    
    let html = '<div class="precios-grid">';
    
    precios.forEach(precio => {
        const iconos = { 1: '🏠', 2: '🏡', 3: '👨‍👩‍👧‍👦' };

        html += `
            <div style="
                background: ${COLORS.white};
                border-radius: 12px;
                padding: 24px;
                box-shadow: ${COLORS.shadow};
                transition: all 0.3s ease;
                border-top: 4px solid ${COLORS.primary};
            " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 24px rgba(0, 92, 185, 0.16)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='${COLORS.shadow}'">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                    <div>
                        <span style="font-size: 40px; display: block; margin-bottom: 10px;">
                            ${iconos[precio.habitaciones] || '🏠'}
                        </span>
                        <h4 style="color: ${COLORS.primary}; font-size: 18px; margin: 0;">${precio.tipo_vivienda}</h4>
                    </div>
                    <span style="
                        background: ${COLORS.primaryLight};
                        color: ${COLORS.primary};
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                    ">${precio.habitaciones} hab.</span>
                </div>

                <div style="margin: 20px 0;">
                    <span style="color: ${COLORS.gray500}; font-size: 13px; display: block; margin-bottom: 5px;">Cuota Mensual:</span>
                    <span style="color: ${COLORS.primary}; font-size: 32px; font-weight: 700;">
                        $${parseFloat(precio.monto_mensual).toLocaleString('es-UY', {minimumFractionDigits: 2})}
                    </span>
                </div>

                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 15px;
                    border-top: 1px solid ${COLORS.gray100};
                ">
                    <small style="color: ${COLORS.gray500};">
                        Vigente desde: ${new Date(precio.fecha_vigencia_desde + 'T00:00:00').toLocaleDateString('es-UY')}
                    </small>
                    <button class="btn-small btn-edit" onclick="editarPrecioCuota(${precio.id_tipo}, '${precio.tipo_vivienda}', ${precio.monto_mensual})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// ========== EDITAR PRECIO INDIVIDUAL ==========
function editarPrecioCuota(idTipo, nombreTipo, montoActual) {
    document.getElementById('precio-id-tipo').value = idTipo;
    document.getElementById('precio-tipo-nombre').innerHTML = `
        <strong style="font-size: 18px; color: #0066cc;">
            ${nombreTipo}
        </strong>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">
            Monto actual: $${parseFloat(montoActual).toLocaleString('es-UY', {minimumFractionDigits: 2})}
        </p>
    `;
    document.getElementById('precio-monto').value = '';
    document.getElementById('editarPrecioModal').style.display = 'flex';
}

function closeEditarPrecioModal() {
    document.getElementById('editarPrecioModal').style.display = 'none';
    document.getElementById('editarPrecioForm').reset();
}

async function submitEditarPrecio(event) {
    event.preventDefault();
    
    const idTipo = document.getElementById('precio-id-tipo').value;
    const monto = document.getElementById('precio-monto').value;
    
    if (!monto || monto <= 0) {
        alert('⚠️ Ingresa un monto válido');
        return;
    }

    if (!confirm('¿Estás seguro de actualizar este precio?\n\nAfectará a todas las futuras cuotas de este tipo de vivienda.')) {
        return;
    }
    
    const formData = new FormData();
    formData.append('id_tipo', idTipo);
    formData.append('monto_mensual', monto);
    
    try {
        const response = await fetch('/api/cuotas/actualizar-precio', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(' ' + data.message);
            closeEditarPrecioModal();
            await loadPreciosCuotas();
        } else {
            alert(' ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(' Error al actualizar precio');
    }
}

// ========== GENERAR CUOTAS ==========
async function generarCuotasMesActual() {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();
    
    const nombreMes = obtenerNombreMes(mes);

    if (!confirm(`¿Generar cuotas para ${nombreMes} ${anio}?\n\nSe crearán cuotas para todos los usuarios con vivienda asignada.`)) {
        return;
    }
    
    await generarCuotasMasivas(mes, anio);
}







async function generarCuotasMasivas(mes, anio) {
    const formData = new FormData();
    formData.append('mes', mes);
    formData.append('anio', anio);
    
    try {
        const response = await fetch('/api/cuotas/generar-masivas', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(' ' + data.message);
            await loadAllCuotasAdmin();
            await loadEstadisticasCuotas();
        } else {
            alert(' ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(' Error al generar cuotas');
    }
}

// ========== CARGAR ESTADÍSTICAS ==========
async function loadEstadisticasCuotas() {
    try {
        const mes = document.getElementById('admin-filtro-mes')?.value || null;
        const anio = document.getElementById('admin-filtro-anio')?.value || null;
        
        let url = '/api/cuotas/estadisticas?';
        if (mes) url += `mes=${mes}&`;
        if (anio) url += `anio=${anio}&`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.estadisticas;
            
            document.getElementById('admin-total-cuotas').textContent = stats.total_cuotas || 0;
            document.getElementById('admin-cuotas-pagadas').textContent = stats.pagadas || 0;
            document.getElementById('admin-cuotas-pendientes').textContent = stats.pendientes || 0;
            document.getElementById('admin-monto-cobrado').textContent = 
                '$' + parseFloat(stats.monto_cobrado || 0).toLocaleString('es-UY', {minimumFractionDigits: 2});
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ========== CARGAR TODAS LAS CUOTAS ==========
async function loadAllCuotasAdmin() {
    const container = document.getElementById('allCuotasAdminContainer');
    if (!container) {
        console.error(' No se encontró allCuotasAdminContainer');
        return;
    }
    
    container.innerHTML = '<p class="loading">Cargando cuotas...</p>';
    
    try {
        const mes = document.getElementById('admin-filtro-mes')?.value || '';
        const anio = document.getElementById('admin-filtro-anio')?.value || '';
        const estado = document.getElementById('admin-filtro-estado')?.value || '';
        
        let url = '/api/cuotas/all?';
        if (mes) url += `mes=${mes}&`;
        if (anio) url += `anio=${anio}&`;
        if (estado) url += `estado=${estado}&`;
        
        ('🌐 Cargando cuotas desde:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        ('📊 Cuotas recibidas:', data);
        
        if (data.success) {
            renderAllCuotasAdmin(data.cuotas);
            await loadEstadisticasCuotas();
        } else {
            container.innerHTML = '<p class="error">Error al cargar cuotas</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}


async function forzarPagoCuota(idCuota) {
    if (!confirm(`¿Seguro que desea LIQUIDAR esta deuda? La cuota ${idCuota} se marcará como PAGADA.`)) {
        return;
    }

    try {
        mostrarCargando();
        
        // El nuevo estado es 'pagada', que es lo que pide el usuario
        const resultado = await procesarCambioEstadoCuota(idCuota, 'pagada');

        if (resultado.success) {
            alert(`Cuota ${idCuota} liquidada y marcada como PAGADA con éxito.`);
            // Recargar la tabla o la página para reflejar el cambio
            location.reload(); 
        } else {
            alert(`Error al liquidar la cuota ${idCuota}.`);
        }
    } catch (error) {
        console.error('Error al procesar la liquidación:', error);
        alert('Ocurrió un error en el servidor al intentar liquidar la deuda.');
    } finally {
        ocultarCargando();
    }
}

function mostrarCargando() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex'; // O 'block', si no es un flexbox
    }
    // Opcional: Desactivar el botón para evitar múltiples clics
    // document.getElementById('btnForzarPago').disabled = true; 
}

function ocultarCargando() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    // Opcional: Reactivar el botón
    // document.getElementById('btnForzarPago').disabled = false;
}

async function procesarCambioEstadoCuota(idCuota, nuevoEstado) {
    // 💡 Aquí está la LÓGICA REAL con un FETCH a tu API
    const url = '/api/cuotas/liquidar?'; // Endpoint asumido en tu servidor (ej: PHP, Node.js)
    
    console.log(`[API CALL] Cambiando estado de cuota ${idCuota} a ${nuevoEstado}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                id_cuota: idCuota, 
                estado: nuevoEstado // Debe ser 'pagada'
            })
        });

        if (!response.ok) {
            // Manejar errores HTTP (400, 500, etc.)
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido en el servidor.' }));
            throw new Error(`Error HTTP ${response.status}: ${errorData.message || 'Fallo en la liquidación.'}`);
        }

        // El backend es el responsable de ejecutar la lógica de liquidación, 
        // actualizar el estado en DB y "sumar lo que debería" (saldos, etc.).
        return await response.json(); 

    } catch (error) {
        console.error('Error durante la llamada a la API:', error);
        // Propagar el error para que forzarPagoCuota lo capture
        throw new Error('Fallo en la comunicación con el servidor.');
    }
}

// ========== RENDERIZAR TABLA DE CUOTAS ==========
// dashboardAdmin.js (Alrededor de la línea 3931)

async function forzarPagoCuota(idCuota) {
  
   mostrarCargando(); 

    try {
      
        const url = `/api/cuotas/recalcular-deuda/${idCuota}`; 
        
        const response = await fetch(url, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 2. Manejo de errores HTTP
        if (!response.ok) {
            // Captura errores como 404, 500, 401, etc.
            throw new Error(`El servidor respondió con un error ${response.status}.`);
        }

        const data = await response.json();

        // 3. Manejo de la lógica de negocio (lo que devuelve tu Controller)
        if (data.success) {
            // Éxito: Muestra alerta y recarga la interfaz
            Swal.fire('¡Pago Forzado!', data.message || 'La liquidación se procesó correctamente.', 'success');
            // Recargar datos (ej. tabla de liquidaciones)
            // cargarLiquidaciones(); 
        } else {
            // Error de negocio devuelto por el Controller
            throw new Error(data.message || 'Error desconocido al procesar la liquidación.');
        }

    } catch (error) {
        // 4. Captura y manejo de cualquier error
        console.error('Error al procesar la liquidación:', error);
        // Muestra el error al usuario
        Swal.fire('Error', `No se pudo procesar: ${error.message}`, 'error');
        // El error que veías en la consola: "Error al procesar la liquidación: ReferenceError..."
        // Ahora se mostrará como un error del proceso.

    } finally {
        // [Línea 3948] ⬅️ Aquí es donde tenías el segundo ReferenceError
        // ESTO ES CLAVE: se ejecuta SIEMPRE, haya éxito o error.
        ocultarCargando(); 
    }
}

// Funciones de acción existentes (placeholders para evitar ReferenceError)
function abrirValidarPagoModal(idPago, idCuota) { console.log(`[ADMIN] Abriendo modal para validar pago ID ${idPago} de cuota ${idCuota}`); }
function verComprobanteAdmin(archivo) { console.log(`[ADMIN] Abriendo comprobante: ${archivo}`); }
function abrirModalJustificarHoras(idCuota, idUsuario, nombre, mes, anio, horasFaltantes) { console.log(`[ADMIN] Abriendo modal para justificar ${horasFaltantes} horas para ${nombre}`); }
window.abrirValidarPagoModal = function(idPago, idCuota) { console.log(`[ADMIN] Abriendo modal para validar pago ID ${idPago} de cuota ${idCuota}`); };
window.verComprobanteAdmin = function(archivo) { console.log(`[ADMIN] Abriendo comprobante: ${archivo}`); };
window.abrirModalJustificarHoras = function(idCuota, idUsuario, nombre, mes, anio, horasFaltantes) { console.log(`[ADMIN] Abriendo modal para justificar ${horasFaltantes} horas para ${nombre}`); };
window.forzarPagoCuota = forzarPagoCuota; // Exportar para que el onclick lo encuentre


// ========== VER COMPROBANTE ==========
function verComprobanteAdmin(archivo) {
    ('🖼️ Abriendo comprobante:', archivo);
    window.open(`/files/?path=${archivo}`, '_blank');
}

// ========== VALIDAR PAGO ==========
async function abrirValidarPagoModal(pagoId, cuotaId) {
    try {
        const response = await fetch(`/api/cuotas/detalle?cuota_id=${cuotaId}`);
        const data = await response.json();
        
        if (!data.success) {
            alert('Error al cargar información');
            return;
        }
        
        const cuota = data.cuota;
        const mes = obtenerNombreMes(cuota.mes);
        const nombreUsuario = cuota.nombre_completo || 'Usuario';
        const emailUsuario = cuota.email || '';
        
        document.getElementById('pago-info-validar').innerHTML = `
            <div class="pago-info-box">
                <h4>Información del Pago</h4>
                <div class="detalle-grid">
                    <div><strong>Usuario:</strong> ${nombreUsuario}</div>
                    <div><strong>Email:</strong> ${emailUsuario}</div>
                    <div><strong>Período:</strong> ${mes} ${cuota.anio}</div>
                    <div><strong>Vivienda:</strong> ${cuota.numero_vivienda}</div>
                    <div><strong>Monto:</strong> $${parseFloat(cuota.monto).toLocaleString('es-UY', {minimumFractionDigits: 2})}</div>
                    <div><strong>Horas:</strong> ${cuota.horas_cumplidas}h / ${cuota.horas_requeridas}h</div>
                </div>
                ${cuota.comprobante_archivo ? `
                    <div style="margin-top: 15px; text-align: center;">
                        <button class="btn btn-secondary" onclick="verComprobanteAdmin('${cuota.comprobante_archivo}')">
                            <i class="fas fa-image"></i> Ver Comprobante
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('validar-pago-id').value = pagoId;
        document.getElementById('validarPagoModal').style.display = 'flex';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar información');
    }
}

function closeValidarPagoModal() {
    document.getElementById('validarPagoModal').style.display = 'none';
    document.getElementById('validarPagoForm').reset();
}

async function aprobarPagoAdmin() {
    if (!confirm('¿Aprobar este pago?')) return;
    
    const pagoId = document.getElementById('validar-pago-id').value;
    const observaciones = document.getElementById('validar-observaciones').value;
    
    await procesarValidacionPago(pagoId, 'aprobar', observaciones);
}

async function rechazarPagoAdmin() {
    const motivo = prompt('Motivo del rechazo (opcional):');
    if (motivo === null) return;
    
    if (!confirm('¿Rechazar este pago?')) return;
    
    const pagoId = document.getElementById('validar-pago-id').value;
    const observaciones = motivo || document.getElementById('validar-observaciones').value;
    
    await procesarValidacionPago(pagoId, 'rechazar', observaciones);
}

async function procesarValidacionPago(pagoId, accion, observaciones) {
    const formData = new FormData();
    formData.append('pago_id', pagoId);
    formData.append('accion', accion);
    formData.append('observaciones', observaciones);
    
    try {
        const response = await fetch('/api/cuotas/validar-pago', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(' ' + data.mensaje);
            closeValidarPagoModal();
            await loadAllCuotasAdmin();
            await loadEstadisticasCuotas();
        } else {
            alert(' ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(' Error al procesar validación');
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
window.loadPreciosCuotas = loadPreciosCuotas;
window.editarPrecioCuota = editarPrecioCuota;
window.closeEditarPrecioModal = closeEditarPrecioModal;
window.submitEditarPrecio = submitEditarPrecio;
window.generarCuotasMesActual = generarCuotasMesActual;

window.loadAllCuotasAdmin = loadAllCuotasAdmin;
window.abrirValidarPagoModal = abrirValidarPagoModal;
window.closeValidarPagoModal = closeValidarPagoModal;
window.aprobarPagoAdmin = aprobarPagoAdmin;
window.rechazarPagoAdmin = rechazarPagoAdmin;
window.verComprobanteAdmin = verComprobanteAdmin;
window.inicializarSeccionCuotasAdmin = inicializarSeccionCuotasAdmin;

(' Módulo de cuotas admin cargado completamente');

// ==========================================
// SISTEMA DE SOLICITUDES - ADMINISTRADOR
// ==========================================

('🟢 Cargando módulo de solicitudes ADMIN');

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    const solicitudesMenuItem = document.querySelector('.menu li[data-section="solicitudes"]');
    if (solicitudesMenuItem) {
        solicitudesMenuItem.addEventListener('click', function() {
            ('>>> Sección solicitudes ADMIN abierta');
            loadAllSolicitudes();
            loadEstadisticasSolicitudes();
        });
    }
});

// ========== CARGAR TODAS LAS SOLICITUDES ==========
async function loadAllSolicitudes() {
    const container = document.getElementById('solicitudesAdminContainer');
    if (!container) {
        console.warn('⚠️ Container no encontrado');
        return;
    }

    container.innerHTML = '<p class="loading">Cargando solicitudes...</p>';

    try {
        const estado = document.getElementById('filtro-estado-solicitudes-admin')?.value || '';
        const tipo = document.getElementById('filtro-tipo-solicitudes-admin')?.value || '';
        const prioridad = document.getElementById('filtro-prioridad-solicitudes-admin')?.value || '';

        let url = '/api/solicitudes/all?';
        if (estado) url += `estado=${estado}&`;
        if (tipo) url += `tipo=${tipo}&`;
        if (prioridad) url += `prioridad=${prioridad}&`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            renderSolicitudesAdmin(data.solicitudes);
        } else {
            container.innerHTML = '<p class="error">Error al cargar solicitudes</p>';
        }

    } catch (error) {
        console.error(' Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}



// ========== CARGAR ESTADÍSTICAS ==========
async function loadEstadisticasSolicitudes() {
    try {
        const response = await fetch('/api/solicitudes/estadisticas');
        const data = await response.json();

        if (data.success) {
            const stats = data.estadisticas;

            const totalEl = document.getElementById('solicitudes-total-admin');
            const pendientesEl = document.getElementById('solicitudes-pendientes-admin');
            const revisionEl = document.getElementById('solicitudes-revision-admin');
            const resueltasEl = document.getElementById('solicitudes-resueltas-admin');
            const altasEl = document.getElementById('solicitudes-altas-admin');

            if (totalEl) totalEl.textContent = stats.total || 0;
            if (pendientesEl) pendientesEl.textContent = stats.pendientes || 0;
            if (revisionEl) revisionEl.textContent = stats.en_revision || 0;
            if (resueltasEl) resueltasEl.textContent = stats.resueltas || 0;
            if (altasEl) altasEl.textContent = stats.prioridad_alta || 0;
        }

    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ========== VER DETALLE ADMIN ==========
async function verDetalleSolicitudAdmin(solicitudId) {
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
                <div class="modal-detail-content" style="max-width: 900px;">
                    <button onclick="this.closest('.modal-detail').remove()" class="modal-close-button">×</button>
                    
                    <h2 class="modal-detail-header">
                        <i class="fas fa-file-alt"></i> ${solicitud.asunto}
                    </h2>

                    <div class="modal-detail-section">
                        <h3>👤 Información del Usuario</h3>
                        <div class="detalle-grid">
                            <div><strong>Nombre:</strong> ${solicitud.nombre_completo}</div>
                            <div><strong>Email:</strong> ${solicitud.email}</div>
                            <div><strong>Cédula:</strong> ${solicitud.cedula}</div>
                            <div><strong>Fecha:</strong> ${fecha}</div>
                        </div>
                    </div>

                    <div class="modal-detail-section">
                        <h3>📋 Detalles de la Solicitud</h3>
                        <div class="detalle-grid">
                            <div><strong>Tipo:</strong> ${formatTipoSolicitud(solicitud.tipo_solicitud)}</div>
                            <div><strong>Estado:</strong> <span class="badge badge-${solicitud.estado}">${formatEstado(solicitud.estado)}</span></div>
                            <div><strong>Prioridad:</strong> <span class="badge badge-prioridad-${solicitud.prioridad}">${formatPrioridad(solicitud.prioridad)}</span></div>
                        </div>
                    </div>

                    <div class="modal-detail-section">
                        <h3>📝 Descripción</h3>
                        <p style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 8px;">${solicitud.descripcion}</p>
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

                    <div class="modal-detail-section">
                        <h3>⚙️ Acciones Rápidas</h3>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${solicitud.estado !== 'en_revision' ? `
                                <button onclick="cambiarEstadoSolicitud(${solicitudId}, 'en_revision'); this.closest('.modal-detail').remove();" class="btn btn-warning">
                                    <i class="fas fa-eye"></i> Marcar En Revisión
                                </button>
                            ` : ''}
                            ${solicitud.estado !== 'resuelta' ? `
                                <button onclick="cambiarEstadoSolicitud(${solicitudId}, 'resuelta'); this.closest('.modal-detail').remove();" class="btn btn-success">
                                    <i class="fas fa-check-circle"></i> Marcar como Resuelta
                                </button>
                            ` : ''}
                            ${solicitud.estado !== 'rechazada' ? `
                                <button onclick="cambiarEstadoSolicitud(${solicitudId}, 'rechazada'); this.closest('.modal-detail').remove();" class="btn btn-danger">
                                    <i class="fas fa-times-circle"></i> Rechazar
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <div class="modal-detail-footer">
                        <button onclick="this.closest('.modal-detail').remove()" class="btn btn-secondary">Cerrar</button>
                        <button onclick="this.closest('.modal-detail').remove(); responderSolicitudAdmin(${solicitudId})" class="btn btn-primary">
                            <i class="fas fa-reply"></i> Responder
                        </button>
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

// ========== RESPONDER SOLICITUD ADMIN ==========
function responderSolicitudAdmin(solicitudId) {
    const modal = `
        <div id="responderSolicitudAdminModal" class="modal-overlay">
            <div class="modal-content-large">
                <button class="modal-close-btn" onclick="cerrarModalResponderAdmin()">×</button>
                
                <h2 class="modal-title">
                    <i class="fas fa-reply"></i> Responder como Administrador
                </h2>

                <form id="responderSolicitudAdminForm" onsubmit="submitRespuestaAdmin(event, ${solicitudId})" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="mensaje-respuesta-admin">
                            <i class="fas fa-comment"></i> Mensaje *
                        </label>
                        <textarea 
                            id="mensaje-respuesta-admin" 
                            name="mensaje"
                            rows="6"
                            placeholder="Escribe tu respuesta al usuario..."
                            required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="archivo-respuesta-admin">
                            <i class="fas fa-paperclip"></i> Archivo Adjunto (Opcional)
                        </label>
                        <input 
                            type="file" 
                            id="archivo-respuesta-admin" 
                            name="archivo"
                            accept="image/*,.pdf">
                        <small class="form-help">Puedes adjuntar documentos de respaldo</small>
                    </div>

                    <div class="alert-info">
                        <strong>ℹ️ Nota:</strong>
                        <p>El usuario recibirá una notificación sobre tu respuesta.</p>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="cerrarModalResponderAdmin()">
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

function cerrarModalResponderAdmin() {
    const modal = document.getElementById('responderSolicitudAdminModal');
    if (modal) modal.remove();
}

async function submitRespuestaAdmin(event, solicitudId) {
    event.preventDefault();

    const form = document.getElementById('responderSolicitudAdminForm');
    const formData = new FormData(form);
    formData.append('id_solicitud', solicitudId);

    const submitBtn = form.querySelector('button[type="submit"]');
    const btnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
        const response = await fetch('/api/solicitudes/responder', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.message);
            cerrarModalResponderAdmin();
            loadAllSolicitudes();
            loadEstadisticasSolicitudes();
        } else {
            alert(' ' + data.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnHTML;
        }

    } catch (error) {
        console.error('Error:', error);
        alert(' Error de conexión');
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnHTML;
    }
}

// ========== CAMBIAR ESTADO ==========
async function cambiarEstadoSolicitud(solicitudId, nuevoEstado) {
    const estadoTexto = {
        'pendiente': 'Pendiente',
        'en_revision': 'En Revisión',
        'resuelta': 'Resuelta',
        'rechazada': 'Rechazada'
    };

    if (!confirm(`¿Cambiar estado a "${estadoTexto[nuevoEstado]}"?`)) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('id_solicitud', solicitudId);
        formData.append('estado', nuevoEstado);

        const response = await fetch('/api/solicitudes/update-estado', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.message);
            loadAllSolicitudes();
            loadEstadisticasSolicitudes();
        } else {
            alert(' ' + data.message);
        }

    } catch (error) {
        console.error('Error:', error);
        alert(' Error de conexión');
    }
}

// ========== FUNCIONES AUXILIARES ==========
function formatTipoSolicitud(tipo) {
    const tipos = {
        'horas': 'Registro de Horas',
        'pago': 'Pagos/Cuotas',
        'vivienda': 'Vivienda',
        'general': 'Consulta General',
        'otro': 'Otro'
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
window.loadAllSolicitudes = loadAllSolicitudes;
window.loadEstadisticasSolicitudes = loadEstadisticasSolicitudes;
window.verDetalleSolicitudAdmin = verDetalleSolicitudAdmin;
window.responderSolicitudAdmin = responderSolicitudAdmin;
window.cerrarModalResponderAdmin = cerrarModalResponderAdmin;
window.submitRespuestaAdmin = submitRespuestaAdmin;
window.cambiarEstadoSolicitud = cambiarEstadoSolicitud;

(' Módulo de solicitudes ADMIN cargado completamente');

// ==========================================
// SISTEMA DE JUSTIFICACIÓN DE HORAS - ADMIN
// ==========================================

('🟢 Cargando módulo de justificación de horas');

/**
 * Abrir modal para justificar horas
 * @param {number} cuotaId - ID de la cuota
 * @param {number} idUsuario - ID del usuario
 * @param {string} nombreUsuario - Nombre completo del usuario
 * @param {number} mes - Mes de la cuota
 * @param {number} anio - Año de la cuota
 * @param {number} horasFaltantes - Horas faltantes del usuario
 */
async function abrirModalJustificarHoras(cuotaId, idUsuario, nombreUsuario, mes, anio, horasFaltantes) {
    ('📝 Abriendo modal justificar horas');

    let justificacionesHTML = '';
    try {
        const response = await fetch(`/api/justificaciones/usuario?id_usuario=${idUsuario}&mes=${mes}&anio=${anio}`);
        const data = await response.json();
        
        if (data.success && data.justificaciones.length > 0) {
            const totalJustificado = data.justificaciones.reduce((sum, j) => sum + parseFloat(j.horas_justificadas), 0);
            
            justificacionesHTML = `
                <div style="
                    background: ${COLORS.primaryLight};
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border-left: 4px solid ${COLORS.primary};
                ">
                    <strong style="color: ${COLORS.primary};">ℹ️ Justificaciones Existentes:</strong>
                    <p style="color: ${COLORS.gray700}; margin: 10px 0;">Total ya justificado: <strong>${totalJustificado}h</strong></p>
                    <ul style="margin: 10px 0 0 20px; padding: 0;">
                        ${data.justificaciones.map(j => `
                            <li style="color: ${COLORS.gray700}; margin: 5px 0;">
                                ${j.horas_justificadas}h - ${j.motivo} 
                                <small style="color: ${COLORS.gray500};">(${new Date(j.fecha_justificacion).toLocaleDateString('es-UY')})</small>
                                <button class="btn-small btn-danger" onclick="eliminarJustificacion(${j.id_justificacion}, ${cuotaId}, ${idUsuario}, ${mes}, ${anio})" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar justificaciones:', error);
    }

    const modal = `
        <div id="justificarHorasModal" class="modal-overlay">
            <div class="modal-content-large">
                <button class="modal-close-btn" onclick="cerrarModalJustificarHoras()">×</button>
                
                <h2 class="modal-title" style="color: ${COLORS.primary};">
                    <i class="fas fa-check-circle"></i> Justificar Horas
                </h2>

                <div style="background: ${COLORS.gray50}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <strong style="color: ${COLORS.primary};">👤 Usuario:</strong> ${nombreUsuario}<br>
                    <strong style="color: ${COLORS.primary};">📅 Período:</strong> ${obtenerNombreMes(mes)} ${anio}<br>
                    <strong style="color: ${COLORS.primary};">⏰ Horas Faltantes:</strong> <span style="color: ${horasFaltantes > 0 ? COLORS.danger : COLORS.success}; font-weight: bold;">${horasFaltantes}h</span>
                </div>

                ${justificacionesHTML}

                <form id="justificarHorasForm" onsubmit="submitJustificarHoras(event, ${cuotaId}, ${idUsuario}, ${mes}, ${anio})" enctype="multipart/form-data">
                    <input type="hidden" name="id_usuario" value="${idUsuario}">
                    <input type="hidden" name="mes" value="${mes}">
                    <input type="hidden" name="anio" value="${anio}">

                    <div class="form-group">
                        <label for="horas-justificadas" style="color: ${COLORS.primary};">
                            <i class="fas fa-clock"></i> Horas a Justificar *
                        </label>
                        <input 
                            type="number" 
                            id="horas-justificadas" 
                            name="horas_justificadas"
                            min="0.5"
                            max="${horasFaltantes}"
                            step="0.5"
                            placeholder="Ej: 8"
                            required>
                        <small style="color: ${COLORS.gray500}; font-size: 12px;">Máximo: ${horasFaltantes}h (Descuento: $160 por hora)</small>
                    </div>

                    <div class="form-group">
                        <label for="motivo-justificacion" style="color: ${COLORS.primary};">
                            <i class="fas fa-file-alt"></i> Motivo de la Justificación *
                        </label>
                        <select id="motivo-justificacion" name="motivo" required onchange="toggleOtroMotivo(this)">
                            <option value="">Seleccione un motivo...</option>
                            <option value="Certificado médico">🏥 Certificado médico</option>
                            <option value="Licencia por maternidad/paternidad">👶 Licencia por maternidad/paternidad</option>
                            <option value="Duelo familiar">💔 Duelo familiar</option>
                            <option value="Emergencia familiar">🚨 Emergencia familiar</option>
                            <option value="Trámite legal obligatorio">⚖️ Trámite legal obligatorio</option>
                            <option value="Otro">✏️ Otro (especificar)</option>
                        </select>
                    </div>

                    <div class="form-group" id="otro-motivo-group" style="display: none;">
                        <label for="otro-motivo" style="color: ${COLORS.primary};">
                            <i class="fas fa-edit"></i> Especifique el motivo *
                        </label>
                        <input 
                            type="text" 
                            id="otro-motivo" 
                            name="otro_motivo"
                            placeholder="Describa brevemente el motivo">
                    </div>

                    <div class="form-group">
                        <label for="observaciones-justificacion" style="color: ${COLORS.primary};">
                            <i class="fas fa-comment"></i> Observaciones Adicionales
                        </label>
                        <textarea 
                            id="observaciones-justificacion" 
                            name="observaciones"
                            rows="3"
                            placeholder="Información adicional sobre la justificación..."></textarea>
                    </div>

                    <div class="form-group">
                        <label for="archivo-justificacion" style="color: ${COLORS.primary};">
                            <i class="fas fa-paperclip"></i> Archivo de Respaldo (Opcional)
                        </label>
                        <input 
                            type="file" 
                            id="archivo-justificacion" 
                            name="archivo"
                            accept="image/*,.pdf">
                        <small style="color: ${COLORS.gray500}; font-size: 12px;">Certificado médico, documentación legal, etc. (máx. 5MB)</small>
                    </div>

                    <div style="
                        background: #FFF3E0;
                        border-left: 4px solid ${COLORS.warning};
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    ">
                        <strong style="color: ${COLORS.warning};">⚠️ Confirmación:</strong>
                        <p style="color: ${COLORS.gray700}; margin: 5px 0;">Al justificar horas, se descontará $160 por cada hora de la deuda del usuario.</p>
                        <p style="color: ${COLORS.gray700}; margin: 5px 0;">Esta acción quedará registrada en el sistema.</p>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="cerrarModalJustificarHoras()">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-check"></i> Justificar Horas
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

/**
 * Mostrar campo "Otro motivo" si se selecciona
 */
function toggleOtroMotivo(select) {
    const otroGroup = document.getElementById('otro-motivo-group');
    const otroInput = document.getElementById('otro-motivo');
    
    if (select.value === 'Otro') {
        otroGroup.style.display = 'block';
        otroInput.required = true;
    } else {
        otroGroup.style.display = 'none';
        otroInput.required = false;
        otroInput.value = '';
    }
}


function cerrarModalJustificarHoras() {
    const modal = document.getElementById('justificarHorasModal');
    if (modal) modal.remove();
}


async function submitJustificarHoras(event, cuotaId, idUsuario, mes, anio) {
    event.preventDefault();
    ('📤 Enviando justificación');

    const form = document.getElementById('justificarHorasForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnHTML = submitBtn.innerHTML;

    // Validar motivo
    const motivoSelect = document.getElementById('motivo-justificacion');
    let motivo = motivoSelect.value;
    
    if (motivo === 'Otro') {
        const otroMotivo = document.getElementById('otro-motivo').value.trim();
        if (!otroMotivo) {
            alert('⚠️ Debes especificar el motivo');
            return;
        }
        motivo = 'Otro: ' + otroMotivo;
    }

    // Confirmar acción
    const horas = parseFloat(document.getElementById('horas-justificadas').value);
    const descuento = horas * 160;
    
    if (!confirm(`¿Estás seguro de justificar ${horas}h?\n\nDescuento: $${descuento.toLocaleString('es-UY', {minimumFractionDigits: 2})}\n\nMotivo: ${motivo}`)) {
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    try {
        const formData = new FormData(form);
        // Sobrescribir el motivo si es "Otro"
        formData.set('motivo', motivo);

        const response = await fetch('/api/justificaciones/crear', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.message);
            cerrarModalJustificarHoras();
            
            // Recargar cuotas
            await loadAllCuotasAdmin();
            await loadEstadisticasCuotas();
        } else {
            alert(' ' + data.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnHTML;
        }

    } catch (error) {
        console.error('Error:', error);
        alert(' Error de conexión');
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnHTML;
    }
}

/**
 * Eliminar justificación
 */
async function eliminarJustificacion(idJustificacion, cuotaId, idUsuario, mes, anio) {
    if (!confirm('¿Estás seguro de eliminar esta justificación?\n\nLa deuda de horas volverá a sumarse.')) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('id_justificacion', idJustificacion);

        const response = await fetch('/api/justificaciones/eliminar', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.message);
            cerrarModalJustificarHoras();
            
            // Reabrir modal actualizado
            setTimeout(() => {
                // Necesitarías pasar los datos necesarios, o recargar la página
                loadAllCuotasAdmin();
            }, 500);
        } else {
            alert(' ' + data.message);
        }

    } catch (error) {
        console.error('Error:', error);
        alert(' Error de conexión');
    }
}

// Exportar funciones
window.abrirModalJustificarHoras = abrirModalJustificarHoras;
window.cerrarModalJustificarHoras = cerrarModalJustificarHoras;
window.submitJustificarHoras = submitJustificarHoras;
window.eliminarJustificacion = eliminarJustificacion;
window.toggleOtroMotivo = toggleOtroMotivo;

(' Módulo de justificación de horas cargado completamente');

// ==========================================
// SISTEMA DE REPORTES MENSUALES 
// ==========================================

('🟢 Cargando módulo de Reportes (CSS INLINE)');

// Variables globales
let reporteActual = null;

// Inicializar selector de años
document.addEventListener('DOMContentLoaded', function() {
    const reportesMenuItem = document.querySelector('.menu li[data-section="reportes"]');
    if (reportesMenuItem) {
        reportesMenuItem.addEventListener('click', function() {
            ('>>> Sección reportes abierta');
            inicializarReportes();
        });
    }
});

async function inicializarReportes() {
  

    try {
    //  Año mínimo: 2025 (cuando inició el sistema)
    const anioMinimo = 2025;
    //  Permitir hasta 5 años en el futuro
    const aniosFuturos = 5;

    //  GENERAR SELECTOR DE AÑOS DINÁMICO
    const selectAnio = document.getElementById('reporte-anio');
    if (selectAnio) {
        const anioActual = new Date().getFullYear();
        const anioMaximo = anioActual + aniosFuturos;
        selectAnio.innerHTML = '<option value="">Seleccione año...</option>';
        
        // Desde el año máximo futuro hasta 2025 (hacia atrás)
        for (let anio = anioMaximo; anio >= anioMinimo; anio--) {
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            if (anio === anioActual) option.selected = true;
            selectAnio.appendChild(option);
        }
    }

    //  SELECCIONAR MES ACTUAL
    const selectMes = document.getElementById('reporte-mes');
    if (selectMes) {
        const mesActual = new Date().getMonth() + 1;
        selectMes.value = mesActual;
    }

} catch (error) {
    console.error(' [REPORTES] Error al inicializar:', error);
}
}


async function generarReporte() {
    const mes = document.getElementById('reporte-mes').value;
    const anio = document.getElementById('reporte-anio').value;
    
    ('📊 [REPORTE] Generando reporte para:', { mes, anio });
    
    if (!mes || !anio) {
        alert('⚠️ Selecciona mes y año');
        return;
    }
    
    const container = document.getElementById('reporteTableContainer');
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #005CB9;">Generando reporte...</p>';
    
    document.getElementById('reporte-resumen-container').style.display = 'none';
    document.getElementById('reporte-tabla-container').style.display = 'none';
    document.getElementById('btn-exportar').style.display = 'none';
    
    try {
      
        const url = `/api/reporte/mensual?mes=${encodeURIComponent(mes)}&anio=${encodeURIComponent(anio)}`;
        
        ('🌐 [REPORTE] URL completa:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        });
        
        ('📡 [REPORTE] Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error(' [REPORTE] Respuesta no es JSON:', text.substring(0, 500));
            throw new Error('El servidor no devolvió JSON válido');
        }
        
        const data = await response.json();
        ('📊 [REPORTE] Data recibida:', data);
        
        if (data.success) {
            //  Validar que los datos sean del período correcto
            if (!data.reporte || !data.reporte.resumen) {
                throw new Error('Estructura de datos inválida');
            }
            
            (' [REPORTE] Reporte válido para:', {
                mes: data.reporte.periodo?.mes || mes,
                anio: data.reporte.periodo?.anio || anio,
                total_usuarios: data.reporte.resumen.total_usuarios
            });
            
            reporteActual = data.reporte;
            mostrarReporte(data.reporte);
        } else {
            alert(' ' + (data.message || 'Error al generar reporte'));
            container.innerHTML = `<p style="text-align: center; padding: 40px; color: #dc3545;">${data.message || 'Error al generar reporte'}</p>`;
        }
    } catch (error) {
        console.error(' [REPORTE] Error:', error);
        alert(' Error al generar reporte: ' + error.message);
        container.innerHTML = `<p style="text-align: center; padding: 40px; color: #dc3545;">Error: ${error.message}</p>`;
    }
}

function mostrarReporte(reporte) {
    ('📊 [MOSTRAR] Renderizando reporte...');
    
    // Validar que tengamos datos
    if (!reporte || !reporte.resumen) {
        alert(' Datos de reporte inválidos');
        return;
    }
    
    // Mostrar información del período
    const mes = document.getElementById('reporte-mes').value;
    const anio = document.getElementById('reporte-anio').value;
    const nombreMes = obtenerNombreMes(mes);
    
    ('📅 [MOSTRAR] Período:', `${nombreMes} ${anio}`);
    ('👥 [MOSTRAR] Total usuarios:', reporte.resumen.total_usuarios);
    
    //  Actualizar estadísticas
    document.getElementById('reporte-total-usuarios').textContent = reporte.resumen.total_usuarios || 0;
    document.getElementById('reporte-total-horas').textContent = 
        Math.round(reporte.resumen.total_horas_trabajadas || 0) + 'h';
    document.getElementById('reporte-tareas-completadas').textContent = 
        (reporte.resumen.total_tareas_completadas || 0) + '/' + (reporte.resumen.total_tareas_asignadas || 0);
    document.getElementById('reporte-cumplimiento-promedio').textContent = 
        (reporte.resumen.promedio_cumplimiento || 0) + '%';
    
    //  Mostrar contenedores
    document.getElementById('reporte-resumen-container').style.display = 'block';
    document.getElementById('reporte-tabla-container').style.display = 'block';
    document.getElementById('btn-exportar').style.display = 'inline-block';
    
    //  Renderizar tabla
    renderTablaReporte(reporte.usuarios);
    
    (' [MOSTRAR] Reporte renderizado correctamente');
}

window.generarReporte = generarReporte;
window.exportarReporteCSV = exportarReporteCSV;
window.mostrarReporte = mostrarReporte;

(' [FIX REPORTES] Corrección aplicada');
(' [FIX REPORTES] Ahora los filtros de mes/año se aplican correctamente');

function renderTablaReporte(usuarios) {
    const container = document.getElementById('reporteTableContainer');
    
    if (!usuarios || usuarios.length === 0) {
        container.innerHTML = `<p style="text-align: center; padding: 40px; color: ${COLORS.gray500};">No hay usuarios para este período</p>`;
        return;
    }
    
    let html = `
        <div style="overflow-x: auto; border-radius: 8px; box-shadow: ${COLORS.shadow};">
            <table style="width: 100%; border-collapse: collapse; background: ${COLORS.white}; min-width: 1000px;">
                <thead>
                    <tr style="background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%); color: ${COLORS.white};">
                        <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Usuario</th>
                        <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Vivienda</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Horas</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Cumplimiento</th>
                        <th style="padding: 15px 12px; text-align: right; font-weight: 600; font-size: 13px;">Deuda ($)</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Tareas</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Cuota</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Estado</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    usuarios.forEach((usuario) => {
        const cumplimiento = usuario.porcentaje_cumplimiento || 0;
        
        let cumplimientoColor = COLORS.danger;
        if (cumplimiento >= 90) cumplimientoColor = COLORS.success;
        else if (cumplimiento >= 70) cumplimientoColor = COLORS.primary;
        else if (cumplimiento >= 50) cumplimientoColor = COLORS.warning;
        
        let estadoColor = COLORS.danger;
        let estadoText = 'Crítico';
        if (usuario.estado_general === 'excelente') {
            estadoColor = COLORS.success;
            estadoText = 'Excelente';
        } else if (usuario.estado_general === 'bueno') {
            estadoColor = COLORS.primary;
            estadoText = 'Bueno';
        } else if (usuario.estado_general === 'regular') {
            estadoColor = COLORS.warning;
            estadoText = 'Regular';
        }
        
        let cuotaColor = COLORS.gray500;
        let cuotaText = 'Sin cuota';
        if (usuario.estado_cuota === 'pagada') {
            cuotaColor = COLORS.success;
            cuotaText = 'Pagada';
        } else if (usuario.estado_cuota === 'pendiente') {
            cuotaColor = COLORS.warning;
            cuotaText = 'Pendiente';
        } else if (usuario.estado_cuota === 'vencida') {
            cuotaColor = COLORS.danger;
            cuotaText = 'Vencida';
        }
        
        html += `
            <tr style="border-bottom: 1px solid ${COLORS.gray100}; transition: all 0.2s ease;" 
                onmouseover="this.style.background='${COLORS.primaryLight}'" 
                onmouseout="this.style.background='${COLORS.white}'">
                
                <td style="padding: 14px 12px; font-size: 13px;">
                    <div style="font-weight: 600; color: ${COLORS.primary};">${usuario.nombre_completo}</div>
                    <div style="font-size: 11px; color: ${COLORS.gray500}; margin-top: 3px;">${usuario.email}</div>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px; color: ${COLORS.gray700};">
                    <div style="font-weight: 600;">${usuario.vivienda || 'Sin asignar'}</div>
                    ${usuario.tipo_vivienda ? `<div style="font-size: 11px; color: ${COLORS.gray500}; margin-top: 3px;">${usuario.tipo_vivienda}</div>` : ''}
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px; text-align: center; font-weight: 600; color: ${COLORS.gray700};">
                    <div>${usuario.horas_aprobadas || 0}h / ${usuario.horas_requeridas || 0}h</div>
                    ${(usuario.horas_pendientes || 0) > 0 ? 
                        `<div style="font-size: 11px; color: ${COLORS.warning}; margin-top: 3px;">⏳ ${usuario.horas_pendientes}h pend.</div>` : 
                        ''
                    }
                </td>
                
                <td style="padding: 14px 12px; text-align: center;">
                    <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                        <div style="flex: 0 0 80px; height: 8px; background: ${COLORS.gray100}; border-radius: 10px; overflow: hidden;">
                            <div style="height: 100%; background: ${cumplimientoColor}; border-radius: 10px; width: ${cumplimiento}%; transition: width 0.5s ease;"></div>
                        </div>
                        <span style="font-weight: 600; font-size: 12px; color: ${COLORS.gray700};">${cumplimiento}%</span>
                    </div>
                </td>
                
                <td style="padding: 14px 12px; text-align: right; font-weight: 600; font-size: 13px; color: ${(usuario.deuda_horas || 0) > 0 ? COLORS.danger : COLORS.primary};">
                    ${(usuario.deuda_horas || 0) > 0 ? 
                        `$${(usuario.deuda_horas || 0).toLocaleString('es-UY', {minimumFractionDigits: 2})}` : 
                        '✓ Sin deuda'
                    }
                </td>
                
                <td style="padding: 14px 12px; text-align: center; font-weight: 600; color: ${COLORS.gray700};">
                    <div>${usuario.tareas_completadas || 0}/${usuario.tareas_asignadas || 0}</div>
                    ${(usuario.tareas_asignadas || 0) > 0 ? 
                        `<div style="font-size: 11px; color: ${COLORS.gray500}; margin-top: 3px;">${usuario.progreso_tareas || 0}% completado</div>` : 
                        `<div style="font-size: 11px; color: ${COLORS.gray500}; margin-top: 3px;">Sin tareas</div>`
                    }
                </td>
                
                <td style="padding: 14px 12px; text-align: center;">
                    <div style="display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; background: ${cuotaColor}; color: ${cuotaColor === COLORS.warning ? COLORS.gray700 : COLORS.white};">
                        ${cuotaText}
                    </div>
                    ${(usuario.monto_cuota || 0) > 0 ? 
                        `<div style="font-size: 11px; color: ${COLORS.gray500}; margin-top: 5px;">$${(usuario.monto_cuota || 0).toLocaleString('es-UY', {minimumFractionDigits: 2})}</div>` : 
                        ''
                    }
                </td>
                
                <td style="padding: 14px 12px; text-align: center;">
                    <div style="display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; background: ${estadoColor}; color: ${estadoColor === COLORS.warning ? COLORS.gray700 : COLORS.white};">
                        ${estadoText}
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

async function exportarReporteCSV() {
    if (!reporteActual) {
        alert('⚠️ Genera un reporte primero');
        return;
    }
    
    const mes = document.getElementById('reporte-mes').value;
    const anio = document.getElementById('reporte-anio').value;
    
    ('📥 [EXPORTAR] Exportando para:', { mes, anio });
    
    if (!mes || !anio) {
        alert('⚠️ Selecciona mes y año');
        return;
    }
    
    //  Construir URL con parámetros correctos
    const url = `/api/reporte/exportar?mes=${encodeURIComponent(mes)}&anio=${encodeURIComponent(anio)}&formato=csv`;
    ('🌐 [EXPORTAR] URL:', url);
    
    window.location.href = url;
}

// Exportar funciones globales
window.inicializarReportes = inicializarReportes;
window.generarReporte = generarReporte;
window.exportarReporteCSV = exportarReporteCSV;


// ==========================================
// 🔧 FIX COMPLETO: LIQUIDACIÓN DE DEUDAS
// Reemplaza la función liquidarDeudaCuota en dashboardAdmin.js
// ==========================================

console.log('🟢 [LIQUIDACIÓN FIX] Cargando versión corregida...');

/**
 * 🎯 FUNCIÓN CORREGIDA: Liquidar deuda de una cuota
 * 
 * CAMBIOS:
 * - Envía datos como application/x-www-form-urlencoded
 * - Envía id_cuota en el body (no en la URL)
 * - Maneja correctamente la respuesta del backend
 */
window.liquidarDeudaCuota = async function(idCuota) {
    console.log('💰 [LIQUIDAR] Iniciando liquidación de cuota:', idCuota);
    
    // ✅ PASO 1: VALIDACIÓN INICIAL
    if (!idCuota || isNaN(idCuota)) {
        console.error('❌ [LIQUIDAR] ID de cuota inválido:', idCuota);
        alert('⚠️ Error: ID de cuota inválido');
        return;
    }
    
    // ✅ PASO 2: OBTENER DETALLES DE LA CUOTA
    try {
        console.log('🔍 [LIQUIDAR] Obteniendo detalles de la cuota...');
        
        const response = await fetch(`/api/cuotas/detalle?cuota_id=${idCuota}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 [LIQUIDAR] Datos recibidos:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Error al obtener detalles');
        }
        
        const cuota = data.cuota;
        
        // ✅ PASO 3: VALIDAR ESTADO DE LA CUOTA
        const estadoFinal = cuota.estado_actual || cuota.estado;
        
        if (estadoFinal === 'pagada') {
            alert('ℹ️ Esta cuota ya está pagada');
            console.warn('⚠️ [LIQUIDAR] La cuota ya está pagada');
            return;
        }
        
        if (estadoFinal === 'exonerada') {
            alert('ℹ️ Esta cuota está exonerada, no puede ser liquidada');
            console.warn('⚠️ [LIQUIDAR] La cuota está exonerada');
            return;
        }
        
        // ✅ PASO 4: CALCULAR DEUDA TOTAL
        const horasFaltantes = Math.max(0, (cuota.horas_requeridas || 0) - (cuota.horas_cumplidas || 0));
        const deudaHoras = horasFaltantes * 160; // $160 por hora
        const montoCuota = parseFloat(cuota.monto_total || cuota.monto_base || cuota.monto || 0);
        const deudaTotal = montoCuota + deudaHoras;
        
        console.log('💵 [LIQUIDAR] Cálculos:', {
            horasFaltantes,
            deudaHoras,
            montoCuota,
            deudaTotal
        });
        
        // ✅ PASO 5: CONFIRMACIÓN DEL ADMIN
        const nombreMes = obtenerNombreMes(cuota.mes);
        const nombreUsuario = cuota.nombre_completo || 'Usuario';
        
        const mensaje = `
🔸 LIQUIDAR DEUDA 🔸

Usuario: ${nombreUsuario}
Período: ${nombreMes} ${cuota.anio}
Vivienda: ${cuota.numero_vivienda || 'N/A'}

📊 DETALLE DE LA DEUDA:
• Cuota base: $${montoCuota.toLocaleString('es-UY', {minimumFractionDigits: 2})}
• Horas faltantes: ${horasFaltantes}h × $160 = $${deudaHoras.toLocaleString('es-UY', {minimumFractionDigits: 2})}
━━━━━━━━━━━━━━━━━━━━━━━
TOTAL A LIQUIDAR: $${deudaTotal.toLocaleString('es-UY', {minimumFractionDigits: 2})}

⚠️ IMPORTANTE:
Al liquidar, esta cuota se marcará como PAGADA.
Esto significa que el usuario cubrió esta deuda con un pago actual.

¿Confirmas la liquidación?
        `.trim();
        
        if (!confirm(mensaje)) {
            console.log('❌ [LIQUIDAR] Operación cancelada por el admin');
            return;
        }
        
        // ✅ PASO 6: EJECUTAR LIQUIDACIÓN
        console.log('📤 [LIQUIDAR] Enviando solicitud de liquidación...');
        
        // Mostrar indicador de carga
        mostrarCargando('Procesando liquidación...');
        
        // 🔧 FIX CRÍTICO: Enviar como application/x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append('id_cuota', idCuota);
        
        console.log('📦 [LIQUIDAR] FormData a enviar:', {
            id_cuota: idCuota,
            url: '/api/cuotas/liquidar',
            method: 'POST',
            contentType: 'application/x-www-form-urlencoded'
        });
        
        const liquidarResponse = await fetch('/api/cuotas/liquidar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        console.log('📡 [LIQUIDAR] Response status:', liquidarResponse.status);
        console.log('📡 [LIQUIDAR] Response headers:', Object.fromEntries(liquidarResponse.headers.entries()));
        
        ocultarCargando();
        
        // 🔧 OBTENER EL TEXTO DE LA RESPUESTA PRIMERO
        const responseText = await liquidarResponse.text();
        console.log('📄 [LIQUIDAR] Response text (primeros 500 chars):', responseText.substring(0, 500));
        
        // 🔧 VERIFICAR SI ES HTML (ERROR DE PHP)
        if (responseText.trim().startsWith('<')) {
            console.error('❌ [LIQUIDAR] El servidor devolvió HTML en lugar de JSON');
            console.error('📄 [LIQUIDAR] HTML completo:', responseText);
            
            // Intentar extraer el error de PHP
            const errorMatch = responseText.match(/<b>(.*?)<\/b>/);
            const errorMsg = errorMatch ? errorMatch[1] : 'Error desconocido del servidor';
            
            throw new Error(`El servidor devolvió un error PHP: ${errorMsg}\n\nRevisa los logs del servidor PHP.`);
        }
        
        // 🔧 INTENTAR PARSEAR JSON
        let liquidarData;
        try {
            liquidarData = JSON.parse(responseText);
            console.log('✅ [LIQUIDAR] JSON parseado correctamente:', liquidarData);
        } catch (parseError) {
            console.error('❌ [LIQUIDAR] Error al parsear JSON:', parseError);
            console.error('📄 [LIQUIDAR] Texto recibido:', responseText);
            throw new Error(`Respuesta inválida del servidor. No es JSON válido.\n\nTexto: ${responseText.substring(0, 200)}...`);
        }
        
        // 🔧 VERIFICAR QUE LA RESPUESTA SEA 200 OK
        if (!liquidarResponse.ok) {
            console.error('❌ [LIQUIDAR] Response no OK:', liquidarResponse.status);
            throw new Error(`HTTP ${liquidarResponse.status}: ${liquidarData.message || responseText}`);
        }
        
        if (liquidarData.success) {
            // ✅ ÉXITO
            alert(`✅ ${liquidarData.message || 'Deuda liquidada correctamente'}\n\nLa cuota ha sido marcada como PAGADA.`);
            
            // Recargar tabla de cuotas
            if (typeof loadAllCuotasAdmin === 'function') {
                console.log('🔄 [LIQUIDAR] Recargando tabla de cuotas...');
                await loadAllCuotasAdmin();
            }
            
            // Recargar estadísticas
            if (typeof loadEstadisticasCuotas === 'function') {
                console.log('📊 [LIQUIDAR] Recargando estadísticas...');
                await loadEstadisticasCuotas();
            }
            
            console.log('✅ [LIQUIDAR] Liquidación completada exitosamente');
        } else {
            throw new Error(liquidarData.message || 'Error desconocido al liquidar');
        }
        
    } catch (error) {
        console.error('❌ [LIQUIDAR] Error completo:', error);
        console.error('❌ [LIQUIDAR] Stack:', error.stack);
        ocultarCargando();
        
        alert(`❌ Error al liquidar deuda:\n\n${error.message}\n\nRevisa la consola para más detalles.`);
    }
};

/**
 * 🔄 Mostrar indicador de carga
 */
function mostrarCargando(mensaje = 'Cargando...') {
    let overlay = document.getElementById('loading-overlay-liquidacion');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay-liquidacion';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 30px 50px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            ">
                <i class="fas fa-spinner fa-spin" style="font-size: 40px; color: #005CB9; margin-bottom: 15px;"></i>
                <p id="loading-message" style="margin: 0; font-size: 16px; color: #333; font-weight: 600;">${mensaje}</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = 'flex';
        const messageEl = document.getElementById('loading-message');
        if (messageEl) messageEl.textContent = mensaje;
    }
}

/**
 * ❌ Ocultar indicador de carga
 */
function ocultarCargando() {
    const overlay = document.getElementById('loading-overlay-liquidacion');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * 📅 Obtener nombre del mes
 */
function obtenerNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[parseInt(mes) - 1] || `Mes ${mes}`;
}

// ==========================================
// 🎯 RENDERIZAR TABLA CON BOTÓN (Misma versión anterior)
// ==========================================

console.log('🔧 [LIQUIDACIÓN] Sobrescribiendo renderAllCuotasAdmin...');

window.renderAllCuotasAdmin = function(cuotas) {
    const container = document.getElementById('allCuotasAdminContainer');
    
    if (!cuotas || cuotas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-inbox" style="font-size: 48px; color: #E8EBF0; display: block; margin-bottom: 15px;"></i>
                <p style="color: #6C757D;">No se encontraron cuotas</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div style="overflow-x: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 92, 185, 0.12);">
            <table style="width: 100%; border-collapse: collapse; background: #FFFFFF; min-width: 1200px;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #005CB9 0%, #004494 100%); color: #FFFFFF;">
                        <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Usuario</th>
                        <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Vivienda</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Período</th>
                        <th style="padding: 15px 12px; text-align: right; font-weight: 600; font-size: 13px;">Monto</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Estado</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Horas</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Vencimiento</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    cuotas.forEach(cuota => {
        const estadoFinal = cuota.estado_actual || cuota.estado;
        const mes = obtenerNombreMes(cuota.mes);
        const tienePagoPendiente = cuota.id_pago && cuota.estado_pago === 'pendiente';
        
        const puedeAdministrar = estadoFinal !== 'pagada' && estadoFinal !== 'exonerada' && !tienePagoPendiente;
        
        const nombreUsuario = cuota.nombre_completo || 'Usuario';
        const emailUsuario = cuota.email || '';
        
        let estadoColor = '';
        let estadoText = '';
        if (estadoFinal === 'pagada') {
            estadoColor = '#4CAF50';
            estadoText = 'Pagada';
        } else if (estadoFinal === 'pendiente') {
            estadoColor = '#FF9800';
            estadoText = 'Pendiente';
        } else if (estadoFinal === 'vencida') {
            estadoColor = '#F44336';
            estadoText = 'Vencida';
        } else if (estadoFinal === 'exonerada') {
            estadoColor = '#005CB9';
            estadoText = 'Exonerada';
        }
        
        html += `
            <tr style="border-bottom: 1px solid #E8EBF0; transition: all 0.2s ease;" 
                onmouseover="this.style.background='#F5F7FA'" 
                onmouseout="this.style.background='#FFFFFF'">
                
                <td style="padding: 14px 12px; font-size: 13px;">
                    <div style="font-weight: 600; color: #005CB9;">${nombreUsuario}</div>
                    <div style="font-size: 11px; color: #6C757D; margin-top: 3px;">${emailUsuario}</div>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px; color: #495057;">
                    ${cuota.numero_vivienda || 'N/A'}<br>
                    <small style="color: #6C757D;">${cuota.tipo_vivienda || 'N/A'}</small>
                </td>
                
                <td style="padding: 14px 12px; text-align: center; font-weight: 600; color: #495057;">
                    ${mes} ${cuota.anio}
                </td>
                
                <td style="padding: 14px 12px; text-align: right; font-weight: 600; font-size: 14px; color: #005CB9;">
                    $${parseFloat(cuota.monto_total || cuota.monto_base || cuota.monto || 0).toLocaleString('es-UY', {minimumFractionDigits: 2})}
                </td>
                
                <td style="padding: 14px 12px; text-align: center;">
                    <span style="
                        display: inline-block;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 600;
                        text-transform: uppercase;
                        background: ${estadoColor};
                        color: #FFFFFF;
                    ">${estadoText}</span>
                </td>
                
                <td style="padding: 14px 12px; text-align: center; font-size: 13px; color: #495057;">
                    <div style="font-weight: 600;">${cuota.horas_cumplidas || 0}h / ${cuota.horas_requeridas}h</div>
                    ${cuota.horas_validadas ? `<small style="color: #4CAF50;">✓ Validadas</small>` : ''}
                </td>
                
                <td style="padding: 14px 12px; text-align: center; font-size: 13px; color: #495057;">
                    ${new Date(cuota.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-UY')}
                </td>
                
                <td style="padding: 14px 12px;">
                    <div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap;">
                        
                        ${tienePagoPendiente ? `
                            <button class="btn-small btn-primary" 
                                    onclick="abrirValidarPagoModal(${cuota.id_pago}, ${cuota.id_cuota})" 
                                    title="Validar pago">
                                <i class="fas fa-check-circle"></i>
                            </button>
                        ` : ''}
                        
                        ${cuota.comprobante_archivo ? `
                            <button class="btn-small btn-secondary" 
                                    onclick="verComprobanteAdmin('${cuota.comprobante_archivo}')" 
                                    title="Ver comprobante">
                                <i class="fas fa-image"></i>
                            </button>
                        ` : ''}
                        
                        ${(cuota.horas_cumplidas || 0) < cuota.horas_requeridas ? `
                            <button class="btn-small btn-success" 
                                    onclick="abrirModalJustificarHoras(
                                        ${cuota.id_cuota}, 
                                        ${cuota.id_usuario}, 
                                        '${(cuota.nombre_completo || 'Usuario').replace(/'/g, "\\'")}',
                                        ${cuota.mes},
                                        ${cuota.anio},
                                        ${cuota.horas_requeridas - (cuota.horas_cumplidas || 0)}
                                    )" 
                                    title="Justificar horas faltantes">
                                <i class="fas fa-check-circle"></i> Justificar
                            </button>
                        ` : ''}
                        
                        ${puedeAdministrar ? `
                            <button class="btn-small" 
                                    style="
                                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                        color: white;
                                        border: none;
                                        padding: 6px 12px;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        font-weight: 600;
                                        transition: all 0.3s ease;
                                    "
                                    onclick="liquidarDeudaCuota(${cuota.id_cuota})" 
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                                    title="Marca esta deuda como pagada si el usuario la cubrió con un pago actual">
                                <i class="fas fa-hand-holding-usd"></i> Liquidar Deuda
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
};

console.log('✅ [LIQUIDACIÓN FIX] Sistema corregido completamente');
console.log('📦 [LIQUIDACIÓN FIX] Datos se envían como application/x-www-form-urlencoded');
console.log('🎯 [LIQUIDACIÓN FIX] Listo para usar');

(' Módulo de Reportes con CSS INLINE cargado');

// ==========================================
// SISTEMA DE SOLICITUDES - ADMINISTRADOR
// ==========================================

('🟢 Cargando módulo de solicitudes ADMIN');

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    const solicitudesMenuItem = document.querySelector('.menu li[data-section="solicitudes"]');
    if (solicitudesMenuItem) {
        solicitudesMenuItem.addEventListener('click', function() {
            ('>>> Sección solicitudes ADMIN abierta');
            loadAllSolicitudes();
            loadEstadisticasSolicitudes();
        });
    }
});

// ========== CARGAR TODAS LAS SOLICITUDES ==========
async function loadAllSolicitudes() {
    const container = document.getElementById('solicitudesAdminContainer');
    if (!container) {
        console.warn('⚠️ Container no encontrado');
        return;
    }

    container.innerHTML = '<p class="loading">Cargando solicitudes...</p>';

    try {
        const estado = document.getElementById('filtro-estado-solicitudes-admin')?.value || '';
        const tipo = document.getElementById('filtro-tipo-solicitudes-admin')?.value || '';
        const prioridad = document.getElementById('filtro-prioridad-solicitudes-admin')?.value || '';

        let url = '/api/solicitudes/all?';
        if (estado) url += `estado=${estado}&`;
        if (tipo) url += `tipo=${tipo}&`;
        if (prioridad) url += `prioridad=${prioridad}&`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            renderSolicitudesAdmin(data.solicitudes);
        } else {
            container.innerHTML = '<p class="error">Error al cargar solicitudes</p>';
        }

    } catch (error) {
        console.error('✗ Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}


// ========== RENDERIZAR SOLICITUDES ADMIN (TABLA) ==========
function renderSolicitudesAdmin(solicitudes) {
    const container = document.getElementById('solicitudesAdminContainer');

    if (!solicitudes || solicitudes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; display: block; margin-bottom: 15px;"></i>
                <p style="color: #999; margin-bottom: 20px;">No hay solicitudes con los filtros seleccionados</p>
            </div>
        `;
        return;
    }

    let tableHTML = `
        <div class="viviendas-table-container">
            <table class="viviendas-table">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Asunto</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Prioridad</th>
                        <th>Fecha</th>
                        <th>Respuestas</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

    solicitudes.forEach(sol => {
        const fecha = new Date(sol.fecha_creacion).toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const estadoBadge = `<span class="estado-badge-vivienda ${sol.estado}">
                                ${formatEstado(sol.estado)}
                             </span>`;

        const prioridadBadge = `<span class="estado-badge-vivienda prioridad-${sol.prioridad}">
                                    ${formatPrioridad(sol.prioridad)}
                                </span>`;

        tableHTML += `
            <tr>
                <td>
                    <strong>${sol.nombre_completo}</strong><br>
                    <small style="color: #777;">${sol.email}</small>
                </td>
                <td>${sol.asunto}</td>
                <td>${formatTipoSolicitud(sol.tipo_solicitud)}</td>
                <td>${estadoBadge}</td>
                <td>${prioridadBadge}</td>
                <td>${fecha}</td>
                <td style="text-align: center;">
                    <span class="badge-count">${sol.total_respuestas || 0}</span>
                </td>
                <td>
                    <div class="vivienda-actions">
                        <button class="btn-view-vivienda" 
                                onclick="verDetalleSolicitudAdmin(${sol.id_solicitud})" 
                                title="Ver detalle">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-edit-vivienda" 
                                onclick="responderSolicitudAdmin(${sol.id_solicitud})" 
                                title="Responder">
                            <i class="fas fa-reply"></i>
                        </button>
                        ${sol.estado !== 'resuelta' && sol.estado !== 'rechazada' ? `
                            <button class="btn-delete-vivienda"
                                    onclick="cambiarEstadoSolicitud(${sol.id_solicitud}, 'resuelta')" 
                                    title="Marcar como resuelta">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
}





// ========== CARGAR ESTADÍSTICAS ==========
async function loadEstadisticasSolicitudes() {
    try {
        const response = await fetch('/api/solicitudes/estadisticas');
        const data = await response.json();

        if (data.success) {
            const stats = data.estadisticas;

            document.getElementById('solicitudes-total-admin').textContent = stats.total || 0;
            document.getElementById('solicitudes-pendientes-admin').textContent = stats.pendientes || 0;
            document.getElementById('solicitudes-revision-admin').textContent = stats.en_revision || 0;
            document.getElementById('solicitudes-resueltas-admin').textContent = stats.resueltas || 0;
            document.getElementById('solicitudes-altas-admin').textContent = stats.prioridad_alta || 0;
        }

    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ========== VER DETALLE ADMIN ==========

async function verDetalleSolicitudAdmin(solicitudId) {
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
            <div class="modal-detail-admin" 
                 style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 68, 148, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 20px;
                 "
                 onclick="if(event.target.classList.contains('modal-detail-admin')) this.remove()">
                <div class="modal-detail-content-admin" 
                     style="
                        background: ${COLORS.white};
                        border-radius: 12px;
                        box-shadow: ${COLORS.shadow};
                        max-width: 900px;
                        width: 100%;
                        max-height: 90vh;
                        overflow-y: auto;
                        padding: 30px;
                        position: relative;
                     ">
                    <button onclick="this.closest('.modal-detail-admin').remove()" 
                            style="
                                position: absolute;
                                top: 20px;
                                right: 20px;
                                background: ${COLORS.gray100};
                                border: none;
                                width: 36px;
                                height: 36px;
                                border-radius: 50%;
                                cursor: pointer;
                                font-size: 20px;
                                color: ${COLORS.gray500};
                                transition: all 0.3s ease;
                            "
                            onmouseover="this.style.background='${COLORS.primary}'; this.style.color='${COLORS.white}'"
                            onmouseout="this.style.background='${COLORS.gray100}'; this.style.color='${COLORS.gray500}'">×</button>
                    
                    <h2 style="color: ${COLORS.primary}; font-size: 24px; margin-bottom: 20px; padding-right: 40px;">
                        <i class="fas fa-file-alt"></i> ${solicitud.asunto}
                    </h2>

                    <div style="background: ${COLORS.primaryLight}; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${COLORS.primary};">
                        <h3 style="color: ${COLORS.primary}; margin-bottom: 15px; font-size: 16px;">👤 Información del Usuario</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                            <div style="color: ${COLORS.gray700};"><strong style="color: ${COLORS.primary};">Nombre:</strong> ${solicitud.nombre_completo}</div>
                            <div style="color: ${COLORS.gray700};"><strong style="color: ${COLORS.primary};">Email:</strong> ${solicitud.email}</div>
                            <div style="color: ${COLORS.gray700};"><strong style="color: ${COLORS.primary};">Cédula:</strong> ${solicitud.cedula}</div>
                            <div style="color: ${COLORS.gray700};"><strong style="color: ${COLORS.primary};">Fecha:</strong> ${fecha}</div>
                        </div>
                    </div>

                    <div style="background: ${COLORS.gray50}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: ${COLORS.primary}; margin-bottom: 15px; font-size: 16px;">📋 Detalles de la Solicitud</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                            <div style="color: ${COLORS.gray700};"><strong style="color: ${COLORS.primary};">Tipo:</strong> ${formatTipoSolicitud(solicitud.tipo_solicitud)}</div>
                            <div><strong style="color: ${COLORS.primary};">Estado:</strong> <span class="badge badge-${solicitud.estado}">${formatEstado(solicitud.estado)}</span></div>
                            <div><strong style="color: ${COLORS.primary};">Prioridad:</strong> <span class="badge badge-prioridad-${solicitud.prioridad}">${formatPrioridad(solicitud.prioridad)}</span></div>
                        </div>
                    </div>

                    <div style="background: ${COLORS.white}; padding: 20px; border-radius: 8px; border: 2px solid ${COLORS.gray100}; margin-bottom: 20px;">
                        <h3 style="color: ${COLORS.primary}; margin-bottom: 10px; font-size: 16px;">📝 Descripción</h3>
                        <p style="white-space: pre-wrap; color: ${COLORS.gray700}; line-height: 1.6;">${solicitud.descripcion}</p>
                        ${solicitud.archivo_adjunto ? `
                            <a href="/files/?path=${solicitud.archivo_adjunto}" target="_blank" class="btn-small btn-secondary" style="margin-top: 15px; display: inline-block;">
                                <i class="fas fa-paperclip"></i> Ver Archivo Adjunto
                            </a>
                        ` : ''}
                    </div>

                    ${respuestas.length > 0 ? `
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: ${COLORS.primary}; margin-bottom: 15px; font-size: 16px;"><i class="fas fa-comments"></i> Conversación (${respuestas.length})</h3>
                            <div style="max-height: 400px; overflow-y: auto;">
                                ${respuestas.map(resp => {
                                    const fechaResp = new Date(resp.fecha_respuesta).toLocaleString('es-UY');
                                    return `
                                        <div style="
                                            background: ${resp.es_admin ? COLORS.primaryLight : COLORS.gray50};
                                            padding: 15px;
                                            border-radius: 8px;
                                            margin-bottom: 10px;
                                            border-left: 4px solid ${resp.es_admin ? COLORS.primary : COLORS.gray500};
                                        ">
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                                <strong style="color: ${COLORS.primary}; font-size: 14px;">
                                                    ${resp.es_admin ? '👨‍💼 Administrador' : '👤 ' + resp.nombre_completo}
                                                </strong>
                                                <span style="color: ${COLORS.gray500}; font-size: 12px;">${fechaResp}</span>
                                            </div>
                                            <p style="white-space: pre-wrap; color: ${COLORS.gray700}; line-height: 1.5; margin: 0;">${resp.mensaje}</p>
                                            ${resp.archivo_adjunto ? `
                                                <a href="/files/?path=${resp.archivo_adjunto}" target="_blank" style="color: ${COLORS.primary}; text-decoration: none; font-size: 13px; display: inline-block; margin-top: 10px;">
                                                    <i class="fas fa-paperclip"></i> Ver Archivo
                                                </a>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : `<p style="text-align: center; color: ${COLORS.gray500}; padding: 20px; background: ${COLORS.gray50}; border-radius: 8px;">Sin respuestas aún</p>`}

                    <div style="background: ${COLORS.gray50}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: ${COLORS.primary}; margin-bottom: 15px; font-size: 16px;">⚙️ Acciones Rápidas</h3>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${solicitud.estado !== 'en_revision' ? `
                                <button onclick="cambiarEstadoSolicitud(${solicitudId}, 'en_revision'); this.closest('.modal-detail-admin').remove();" class="btn-small btn-warning">
                                    <i class="fas fa-eye"></i> Marcar En Revisión
                                </button>
                            ` : ''}
                            ${solicitud.estado !== 'resuelta' ? `
                                <button onclick="cambiarEstadoSolicitud(${solicitudId}, 'resuelta'); this.closest('.modal-detail-admin').remove();" class="btn-small btn-success">
                                    <i class="fas fa-check-circle"></i> Marcar como Resuelta
                                </button>
                            ` : ''}
                            ${solicitud.estado !== 'rechazada' ? `
                                <button onclick="cambiarEstadoSolicitud(${solicitudId}, 'rechazada'); this.closest('.modal-detail-admin').remove();" class="btn-small btn-danger">
                                    <i class="fas fa-times-circle"></i> Rechazar
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                        <button onclick="this.closest('.modal-detail-admin').remove()" class="btn btn-secondary">Cerrar</button>
                        <button onclick="this.closest('.modal-detail-admin').remove(); responderSolicitudAdmin(${solicitudId})" class="btn btn-primary">
                            <i class="fas fa-reply"></i> Responder
                        </button>
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

// ========== RESPONDER SOLICITUD ADMIN ==========
function responderSolicitudAdmin(solicitudId) {
    const modal = `
        <div id="responderSolicitudAdminModal" class="modal-overlay-admin">
            <div class="modal-content-admin">
                <button class="modal-close-btn-admin" onclick="cerrarModalResponderAdmin()">×</button>
                
                <h2 class="modal-title-admin">
                    <i class="fas fa-reply"></i> Responder como Administrador
                </h2>

                <form id="responderSolicitudAdminForm" onsubmit="submitRespuestaAdmin(event, ${solicitudId})" enctype="multipart/form-data">
                    <div class="form-group-admin">
                        <label for="mensaje-respuesta-admin">
                            <i class="fas fa-comment"></i> Mensaje *
                        </label>
                        <textarea 
                            id="mensaje-respuesta-admin" 
                            name="mensaje"
                            rows="6"
                            placeholder="Escribe tu respuesta al usuario..."
                            required></textarea>
                    </div>

                    <div class="form-group-admin">
                        <label for="archivo-respuesta-admin">
                            <i class="fas fa-paperclip"></i> Archivo Adjunto (Opcional)
                        </label>
                        <input 
                            type="file" 
                            id="archivo-respuesta-admin" 
                            name="archivo"
                            accept="image/*,.pdf">
                        <small class="form-help-admin">Puedes adjuntar documentos de respaldo</small>
                    </div>

                    <div class="alert-info-admin">
                        <strong>ℹ️ Nota:</strong>
                        <p>El usuario recibirá una notificación sobre tu respuesta.</p>
                    </div>

                    <div class="form-actions-admin">
                        <button type="button" class="btn-small btn-secondary" onclick="cerrarModalResponderAdmin()">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button type="submit" class="btn-small btn-primary">
                            <i class="fas fa-paper-plane"></i> Enviar Respuesta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

function cerrarModalResponderAdmin() {
    const modal = document.getElementById('responderSolicitudAdminModal');
    if (modal) modal.remove();
}

async function submitRespuestaAdmin(event, solicitudId) {
    event.preventDefault();

    const form = document.getElementById('responderSolicitudAdminForm');
    const formData = new FormData(form);
    formData.append('id_solicitud', solicitudId);

    const submitBtn = form.querySelector('button[type="submit"]');
    const btnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
        const response = await fetch('/api/solicitudes/responder', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.message);
            cerrarModalResponderAdmin();
            loadAllSolicitudes();
            loadEstadisticasSolicitudes();
        } else {
            alert('✗ ' + data.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnHTML;
        }

    } catch (error) {
        console.error('Error:', error);
        alert('✗ Error de conexión');
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnHTML;
    }
}

// ========== CAMBIAR ESTADO ==========
async function cambiarEstadoSolicitud(solicitudId, nuevoEstado) {
    const estadoTexto = {
        'pendiente': 'Pendiente',
        'en_revision': 'En Revisión',
        'resuelta': 'Resuelta',
        'rechazada': 'Rechazada'
    };

    if (!confirm(`¿Cambiar estado a "${estadoTexto[nuevoEstado]}"?`)) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('id_solicitud', solicitudId);
        formData.append('estado', nuevoEstado);

        const response = await fetch('/api/solicitudes/update-estado', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.message);
            loadAllSolicitudes();
            loadEstadisticasSolicitudes();
        } else {
            alert('✗ ' + data.message);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('✗ Error de conexión');
    }
}

// ========== FUNCIONES AUXILIARES ==========
function formatTipoSolicitud(tipo) {
    const tipos = {
        'horas': 'Registro de Horas',
        'pago': 'Pagos/Cuotas',
        'vivienda': 'Vivienda',
        'general': 'Consulta General',
        'otro': 'Otro'
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

// ========== EXPORTAR FUNCIONES GLOBALES ==========
window.loadAllSolicitudes = loadAllSolicitudes;
window.loadEstadisticasSolicitudes = loadEstadisticasSolicitudes;
window.verDetalleSolicitudAdmin = verDetalleSolicitudAdmin;
window.responderSolicitudAdmin = responderSolicitudAdmin;
window.cerrarModalResponderAdmin = cerrarModalResponderAdmin;
window.submitRespuestaAdmin = submitRespuestaAdmin;
window.cambiarEstadoSolicitud = cambiarEstadoSolicitud;

(' Módulo de solicitudes ADMIN cargado completamente');



('🌍 [FIX FECHAS] Iniciando configuración para Uruguay...');


function parseFechaLocal(fechaSQL) {
    if (!fechaSQL) return null;
    
    
    return new Date(fechaSQL + 'T00:00:00');
}

/**
 * Formatear fecha en formato DD/MM/YYYY (Uruguay)
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
 * Obtener fecha actual en formato SQL 
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
 * Obtener hora actual en formato HH:MM:SS 
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
    
    // Reemplazar en renderUserTasks
    window.renderUserTasks_ORIGINAL = window.renderUserTasks;
    
    window.renderUserTasks = function(tareas, containerId, esNucleo = false) {
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
                            <span class="task-badge badge-prioridad ${tarea.prioridad}">${formatPrioridad(tarea.prioridad)}</span>
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
 * Tareas Admin
 */
function fixFechasTareasAdmin() {
    ('🔧 Aplicando fix de fechas en tareas admin...');
    
    // Reemplazar en renderTasksList
    window.renderTasksList_ORIGINAL = window.renderTasksList;
    
    window.renderTasksList = function(tareas) {
        const container = document.getElementById('tasksList');

        if (!tareas || tareas.length === 0) {
            container.innerHTML = '<p class="no-tasks">No hay tareas creadas</p>';
            return;
        }

        container.innerHTML = tareas.map(tarea => {
          
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
 *  Registro de Horas
 */
function fixFechasRegistroHoras() {
    ('🔧 Aplicando fix de fechas en registro de horas...');
    
   
    window.formatearFechaSimple = formatearFechaUY;
    
    (' Fix de fechas en registro de horas aplicado');
}

/**
 * Solicitudes
 */
function fixFechasSolicitudes() {
    ('🔧 Aplicando fix de fechas en solicitudes...');
 
    
    (' Fix de fechas en solicitudes aplicado');
}

// ========== INICIALIZACIÓN AUTOMÁTICA ==========


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




setTimeout(function() {
    ('🔧 [FIX FECHAS] Aplicando fixes automáticos...');
    
    try {
        fixFechasTareas();
        fixFechasTareasAdmin();
        fixFechasRegistroHoras();
        (' [FIX FECHAS] Sistema de fechas configurado correctamente');
        ('📅 [FIX FECHAS] Zona horaria:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        ('📅 [FIX FECHAS] Fecha actual SQL:', getFechaActualSQL());
        ('⏰ [FIX FECHAS] Hora actual SQL:', getHoraActualSQL());
        
        
        (' [FIX FECHAS] Prueba: formatearFechaUY("2025-01-15") =', formatearFechaUY('2025-01-15'));
    } catch (error) {
        console.warn('⚠️ [FIX FECHAS] Error al aplicar fixes:', error);
    }
}, 1000);

// ========== HELPER: REEMPLAZAR FUNCIONES EXISTENTES ==========


(' [FIX FECHAS] Módulo cargado - Zona horaria: America/Montevideo');

// ==========================================
//  OVERRIDE PERMANENTE 
// ==========================================

(function() {
    ('🔄 [OVERRIDE] Forzando renderTasksList correcto...');

    // Guardar referencia a loadAllTasks original
    const loadAllTasks_ORIGINAL = window.loadAllTasks;

    // Sobrescribir loadAllTasks para usar SIEMPRE la versión correcta
    window.loadAllTasks = function() {
        ('🔄 [OVERRIDE] loadAllTasks interceptado');
        
        const container = document.getElementById('tasksList');
        const filtro = document.getElementById('filtro-estado')?.value || '';
        
        let url = '/api/tasks/all';
        if (filtro && filtro !== 'vencida') {
            url += `?estado=${filtro}`;
        }

        container.innerHTML = '<p class="loading">Cargando tareas...</p>';

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                  
                    renderTasksListCorrecto(data.tareas, filtro);
                } else {
                    container.innerHTML = '<p class="error">Error al cargar tareas</p>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                container.innerHTML = '<p class="error">Error de conexión</p>';
            });
    };

   
    function renderTasksListCorrecto(tareas, filtroActivo = '') {
        ('═══════════════════════════════════════');
        (' [RENDER CORRECTO] Iniciando');
        ('═══════════════════════════════════════');
        
        const container = document.getElementById('tasksList');

        if (!tareas || tareas.length === 0) {
            container.innerHTML = '<p class="no-tasks">No hay tareas creadas</p>';
            return;
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        //  Analizar tareas
        const tareasConEstado = tareas.map(tarea => {
            const fechaFinObj = new Date(tarea.fecha_fin + 'T00:00:00');
            const esCompletada = tarea.estado === 'completada';
            const esCancelada = tarea.estado === 'cancelada';
            const esVencida = !esCompletada && !esCancelada && fechaFinObj < hoy;

            if (esVencida) {
                (`🔴 VENCIDA: ${tarea.titulo}`);
            }

            return { ...tarea, esVencida, esCompletada, esCancelada };
        });

        //  Filtrar
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

        //  Renderizar
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
                estadoTexto = '⏰ Vencida';
                estadoBadgeClass = 'vencida';
                claseVencida = 'tarea-vencida';
                (` Badge VENCIDA: ${tarea.titulo}`);
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
                        <div class="task-meta-item"><strong>Inicio:</strong> ${fechaInicio}</div>
                        <div class="task-meta-item"><strong>Fin:</strong> ${fechaFin}</div>
                        <div class="task-meta-item"><strong>Creado por:</strong> ${tarea.creador}</div>
                        <div class="task-meta-item"><strong>Asignado a:</strong> ${asignados}</div>
                    </div>
                    ${!tarea.esCancelada ? `
                        <div class="task-progress-section">
                            <div class="progress-info">
                                <span class="progress-label">Progreso general:</span>
                                <span class="progress-percentage">${progresoPromedio}%</span>
                                <span class="progress-completed">${completados}/${totalAsignados} completados</span>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width:${progresoPromedio}%;background:${tarea.esVencida?'#dc3545':tarea.esCompletada?'#28a745':'#667eea'}"></div>
                            </div>
                        </div>
                    ` : ''}
                    ${tarea.esVencida ? `
                        <div class="alert-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Esta tarea está vencida.</strong> La fecha límite ya ha pasado.
                        </div>
                    ` : ''}
                    ${!tarea.esCancelada ? `
                        <div class="task-actions">
                            <button class="btn btn-small btn-view" onclick="viewTaskDetails(${tarea.id_tarea})">Ver Detalles</button>
                            <button class="btn btn-small btn-materiales" onclick="viewTaskMaterialsAdmin(${tarea.id_tarea})">
                                <i class="fas fa-boxes"></i> Materiales
                            </button>
                            ${!tarea.esCompletada ? `
                                <button class="btn btn-small btn-cancel" onclick="cancelTask(${tarea.id_tarea})">Cancelar Tarea</button>
                            ` : `
                                <span style="color:#28a745;font-weight:bold;padding:5px 10px">✓ Tarea Completada</span>
                            `}
                        </div>
                    ` : '<p style="color:#dc3545;margin-top:10px"><strong>Esta tarea ha sido cancelada</strong></p>'}
                </div>
            `;
        }).join('');

        (' [RENDER CORRECTO] Completado\n');
    }

    (' [OVERRIDE] loadAllTasks sobrescrito permanentemente');
})();


// ==========================================
//  FIX: MODAL DE USUARIOS SE ABRE ABAJO DE LA TABLA
//
// ==========================================

(' [FIX MODAL] Aplicando corrección de modal de usuarios...');




(function() {
    ('🔄 [OVERRIDE] Sobrescribiendo viewUserDetails...');

    window.viewUserDetails = function(userId) {
        ('👁️ [DETAILS] Cargando detalles de usuario:', userId);

        // 🧹 PASO 1: LIMPIAR TODOS LOS MODALES ANTERIORES
        limpiarModalesUsuarios();

        fetch(`/api/users/details?id_usuario=${userId}`)
            .then(response => response.json())
            .then(data => {
                ('👁️ [DETAILS] Response:', data);
                if (data.success) {
                    mostrarModalUsuarioCorrecto(data.user);
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('👁️ [DETAILS ERROR]', error);
                alert('Error de conexión');
            });
    };

    (' [OVERRIDE] viewUserDetails reemplazado correctamente');
})();

// ========== FUNCIÓN PARA LIMPIAR MODALES ==========
function limpiarModalesUsuarios() {
    ('🧹 [LIMPIEZA] Limpiando modales de usuarios...');
    
    // Eliminar modales específicos de usuarios
    const selectores = [
        '.user-detail-modal',
        '#userDetailModal',
        '.modal-detail',
        '.modal-overlay'
    ];
    
    selectores.forEach(selector => {
        const modales = document.querySelectorAll(selector);
        modales.forEach(modal => {
            ('🗑️ Eliminando modal:', selector);
            modal.remove();
        });
    });
}

// ========== FUNCIÓN MEJORADA PARA MOSTRAR MODAL ==========
function mostrarModalUsuarioCorrecto(user) {
    (' [MODAL] Mostrando modal para:', user.nombre_completo);

    //  Limpiar por si acaso
    limpiarModalesUsuarios();

    //  CREAR MODAL CON Z-INDEX ALTO Y POSITION FIXED
    const modalHTML = `
        <div class="user-detail-modal" 
             style="
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background: rgba(0, 0, 0, 0.5) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 10000 !important;
                padding: 20px !important;
                overflow-y: auto !important;
             "
             onclick="if(event.target.classList.contains('user-detail-modal')) { limpiarModalesUsuarios(); }">
            
            <div class="user-detail-content" 
                 style="
                    background: white !important;
                    border-radius: 12px !important;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
                    max-width: 600px !important;
                    width: 100% !important;
                    padding: 30px !important;
                    position: relative !important;
                    max-height: 90vh !important;
                    overflow-y: auto !important;
                 "
                 onclick="event.stopPropagation()">
                
                <button class="user-detail-close" 
                        onclick="limpiarModalesUsuarios()"
                        style="
                            position: absolute !important;
                            top: 15px !important;
                            right: 15px !important;
                            background: #f5f5f5 !important;
                            border: none !important;
                            width: 35px !important;
                            height: 35px !important;
                            border-radius: 50% !important;
                            font-size: 20px !important;
                            cursor: pointer !important;
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                            transition: all 0.3s ease !important;
                        "
                        onmouseover="this.style.background='#e0e0e0'"
                        onmouseout="this.style.background='#f5f5f5'">
                    &times;
                </button>
                
                <h2 style="
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 24px;
                    padding-right: 40px;
                ">
                    ${user.nombre_completo}
                </h2>
                
                <span class="estado-badge estado-${user.estado}" 
                      style="
                        display: inline-block;
                        padding: 5px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        margin-bottom: 20px;
                      ">
                    ${formatEstadoUsuario(user.estado)}
                </span>
                
                <div style="
                    margin-top: 20px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                ">
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px;">
                        <strong style="min-width: 150px; color: #005CB9;">
                            <i class="fas fa-id-card"></i> Cédula:
                        </strong>
                        <span>${user.cedula}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px;">
                        <strong style="min-width: 150px; color: #005CB9;">
                            <i class="fas fa-envelope"></i> Email:
                        </strong>
                        <span>${user.email}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px;">
                        <strong style="min-width: 150px; color: #005CB9;">
                            <i class="fas fa-map-marker-alt"></i> Dirección:
                        </strong>
                        <span>${user.direccion || '-'}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px;">
                        <strong style="min-width: 150px; color: #005CB9;">
                            <i class="fas fa-birthday-cake"></i> Fecha Nacimiento:
                        </strong>
                        <span>${user.fecha_nacimiento || '-'}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px;">
                        <strong style="min-width: 150px; color: #005CB9;">
                            <i class="fas fa-calendar-plus"></i> Fecha Ingreso:
                        </strong>
                        <span>${user.fecha_ingreso || '-'}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px;">
                        <strong style="min-width: 150px; color: #005CB9;">
                            <i class="fas fa-user-tag"></i> Rol:
                        </strong>
                        <span>${user.rol || 'Sin rol'}</span>
                    </p>
                    <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px;">
                        <strong style="min-width: 150px; color: #005CB9;">
                            <i class="fas fa-users"></i> Núcleo:
                        </strong>
                        <span>${user.id_nucleo ? `#${user.id_nucleo}` : 'Sin núcleo'}</span>
                    </p>
                </div>
                
                <div style="
                    margin-top: 20px;
                    text-align: right;
                ">
                    <button class="btn btn-secondary" 
                            onclick="limpiarModalesUsuarios()"
                            style="
                                padding: 10px 20px;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: 600;
                                transition: all 0.3s ease;
                            ">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;

    //  INSERTAR DIRECTAMENTE EN BODY 
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // PREVENIR SCROLL DEL BODY
    document.body.style.overflow = 'hidden';
    
    (' [MODAL] Modal insertado correctamente en body');
}

// ========== FUNCIÓN AUXILIAR ==========
function formatEstadoUsuario(estado) {
    const estados = {
        'pendiente': 'Pendiente',
        'enviado': 'Enviado',
        'aceptado': 'Aceptado',
        'rechazado': 'Rechazado'
    };
    return estados[estado] || estado;
}

// ========== LISTENER PARA CERRAR CON ESC ==========
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.querySelector('.user-detail-modal');
        if (modal) {
            limpiarModalesUsuarios();
        }
    }
});

// ========== RESTAURAR SCROLL AL CERRAR ==========
const limpiarModalesUsuarios_ORIGINAL = limpiarModalesUsuarios;
limpiarModalesUsuarios = function() {
    limpiarModalesUsuarios_ORIGINAL();
    // Restaurar scroll del body
    document.body.style.overflow = '';
};

// ========== SOBRESCRIBIR renderUserRow PARA QUITAR COLUMNA DE PAGO ==========
(function() {
    ('🔄 [OVERRIDE] Sobrescribiendo renderUserRow para quitar columna Pago...');

    window.renderUserRow = function(user) {
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
                    <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                        <button class="btn-small btn-view" 
                                onclick="viewUserDetails(${user.id_usuario})"
                                title="Ver detalles">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        ${hasPayment ? `
                            <button class="btn-small btn-approve-small" 
                                    onclick="approvePaymentFromTable(${user.id_usuario})"
                                    id="approve-btn-${user.id_usuario}"
                                    title="Aprobar pago">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-small btn-reject-small" 
                                    onclick="rejectPaymentFromTable(${user.id_usuario})"
                                    id="reject-btn-${user.id_usuario}"
                                    title="Rechazar pago">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    };

    (' [OVERRIDE] renderUserRow actualizado sin columna Pago');
})();

// ========== SOBRESCRIBIR renderUsersTable PARA QUITAR HEADER DE PAGO ==========
(function() {
    ('🔄 [OVERRIDE] Sobrescribiendo renderUsersTable para quitar header Pago...');

    window.renderUsersTable = function(users) {
        ('🎨 [RENDER] renderUsersTable INICIADA (sin columna Pago)');
        
        const container = document.getElementById('usersTableContainer');

        if (!users || users.length === 0) {
            container.innerHTML = '<p class="no-users">No hay usuarios disponibles</p>';
            return;
        }

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
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map((user) => renderUserRow(user)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
        (' [RENDER] Tabla renderizada sin columna Pago');
    };

    (' [OVERRIDE] renderUsersTable actualizado');
})();

// ========== EXPORTAR FUNCIONES GLOBALES ==========
window.limpiarModalesUsuarios = limpiarModalesUsuarios;
window.mostrarModalUsuarioCorrecto = mostrarModalUsuarioCorrecto;

(' [FIX MODAL] Fix aplicado completamente');
(' [FIX MODAL] Ahora el modal se abre sobre la tabla correctamente');
(' [FIX TABLA] Columna "Pago" eliminada de la tabla de usuarios');

// ==========================================
// TABLA DE USUARIOS CON TODOS LOS BOTONES
// 
// ==========================================

(' [PARCHE] Aplicando corrección completa de tabla de usuarios...');

// ========== 1. DEFINIR FUNCIONES FALTANTES ==========

/**
 *  Aprobar usuario (cambiar estado de pendiente a aceptado)
 */
window.aprobarUsuario = async function(userId, nombreUsuario) {
    (' [APROBAR] Aprobando usuario:', userId);
    
    if (!confirm(`¿Aprobar el registro de ${nombreUsuario}?\n\nEl usuario podrá acceder al sistema.`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('id_usuario', userId);
        formData.append('estado', 'aceptado');
        
        const response = await fetch('/api/users/update-estado', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(' Usuario aprobado correctamente');
            loadUsersForTable();
        } else {
            alert(' Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(' Error de conexión');
    }
};

/**
 *  Rechazar usuario
 */
window.rechazarUsuario = async function(userId, nombreUsuario) {
    (' [RECHAZAR] Rechazando usuario:', userId);
    
    const motivo = prompt(`¿Por qué rechazas el registro de ${nombreUsuario}?\n\nMotivo (opcional):`);
    
    if (motivo === null) return; // Canceló
    
    if (!confirm(`¿Confirmas el rechazo de ${nombreUsuario}?`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('id_usuario', userId);
        formData.append('estado', 'rechazado');
        formData.append('motivo', motivo || 'Sin motivo especificado');
        
        const response = await fetch('/api/users/update-estado', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(' Usuario rechazado');
            loadUsersForTable();
        } else {
            alert(' Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(' Error de conexión');
    }
};

/**
 *  Ver detalles de pago (modal con información completa)
 */
window.verDetallesPago = async function(userId) {
    ('💵 [PAGO] Cargando detalles de pago:', userId);
    
    try {
        const response = await fetch(`/api/users/payment-details?id_usuario=${userId}`);
        const data = await response.json();
        
        if (data.success) {
            mostrarModalDetallesPago(data.pago, data.usuario);
        } else {
            alert(' Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(' Error de conexión');
    }
};

/**
 *  Mostrar modal con detalles de pago
 */
function mostrarModalDetallesPago(pago, usuario) {
    const modal = `
        <div id="detallesPagoModal" 
             class="modal-overlay"
             onclick="if(event.target.id === 'detallesPagoModal') this.remove()">
            
            <div class="modal-content-large" onclick="event.stopPropagation()">
                <button class="modal-close-btn" onclick="document.getElementById('detallesPagoModal').remove()">×</button>
                
                <h2 class="modal-title">
                    <i class="fas fa-file-invoice-dollar"></i> Detalles de Pago
                </h2>
                
                <div style="background: ${COLORS.primaryLight}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: ${COLORS.primary}; margin-bottom: 15px;">👤 Información del Usuario</h3>
                    <div class="detalle-grid">
                        <div><strong>Nombre:</strong> ${usuario.nombre_completo}</div>
                        <div><strong>Cédula:</strong> ${usuario.cedula}</div>
                        <div><strong>Email:</strong> ${usuario.email}</div>
                        <div><strong>Estado:</strong> <span class="estado-badge estado-${usuario.estado}">${formatEstadoUsuario(usuario.estado)}</span></div>
                    </div>
                </div>
                
                ${pago ? `
                    <div style="background: ${COLORS.gray50}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: ${COLORS.primary}; margin-bottom: 15px;">💰 Información del Pago</h3>
                        <div class="detalle-grid">
                            <div><strong>Fecha:</strong> ${formatearFechaUY(pago.fecha_pago)}</div>
                            <div><strong>Monto:</strong> $${parseFloat(pago.monto).toLocaleString('es-UY', {minimumFractionDigits: 2})}</div>
                            <div><strong>Estado:</strong> <span class="badge badge-${pago.estado_validacion}">${pago.estado_validacion}</span></div>
                        </div>
                        
                        ${pago.comprobante_archivo ? `
                            <div style="margin-top: 20px; text-align: center;">
                                <img src="/files/?path=${pago.comprobante_archivo}" 
                                     style="max-width: 100%; max-height: 400px; border-radius: 8px; box-shadow: ${COLORS.shadow};"
                                     onclick="window.open('/files/?path=${pago.comprobante_archivo}', '_blank')">
                                <p style="margin-top: 10px; color: ${COLORS.gray500}; font-size: 12px;">
                                    <i class="fas fa-info-circle"></i> Haz clic en la imagen para ampliar
                                </p>
                            </div>
                        ` : '<p style="color: #999;">Sin comprobante adjunto</p>'}
                    </div>
                    
                    ${pago.estado_validacion === 'pendiente' ? `
                        <div class="form-actions">
                            <button class="btn btn-success" onclick="aprobarPagoDesdeModal(${pago.id_pago}, ${usuario.id_usuario})">
                                <i class="fas fa-check"></i> Aprobar Pago
                            </button>
                            <button class="btn btn-danger" onclick="rechazarPagoDesdeModal(${pago.id_pago}, ${usuario.id_usuario})">
                                <i class="fas fa-times"></i> Rechazar Pago
                            </button>
                        </div>
                    ` : ''}
                ` : `
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-inbox" style="font-size: 48px; color: ${COLORS.gray100}; display: block; margin-bottom: 15px;"></i>
                        <p style="color: ${COLORS.gray500};">No hay información de pago disponible</p>
                    </div>
                `}
                
                <div class="form-actions" style="margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="document.getElementById('detallesPagoModal').remove()">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

/**
 *  Aprobar pago desde el modal
 */
window.aprobarPagoDesdeModal = async function(pagoId, userId) {
    document.getElementById('detallesPagoModal').remove();
    await approvePaymentFromTable(userId);
};

/**
 *  Rechazar pago desde el modal
 */
window.rechazarPagoDesdeModal = async function(pagoId, userId) {
    document.getElementById('detallesPagoModal').remove();
    await rejectPaymentFromTable(userId);
};

// ========== 2. SOBRESCRIBIR renderUserRow CON TODOS LOS BOTONES ==========

window.renderUserRow = function(user) {
    const hasPayment = user.comprobante_archivo && user.comprobante_archivo !== '';
    const isPending = user.estado === 'pendiente';
    const hasPaymentPending = hasPayment && user.estado_validacion === 'pendiente';
    
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
                <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center;">
                    
                    ${/*  BOTÓN VER DETALLES DE USUARIO */ ''}
                    <button class="btn-icon btn-primary" 
                            onclick="viewUserDetails(${user.id_usuario})"
                            title="Ver detalles del usuario">
                        <i class="fas fa-eye"></i>
                    </button>
                    
                    ${/*  BOTÓN VER PAGO (siempre visible si hay comprobante) */ ''}
                    ${hasPayment ? `
                        <button class="btn-icon btn-info" 
                                onclick="verDetallesPago(${user.id_usuario})"
                                title="Ver detalles de pago"
                                style="background: #17a2b8;">
                            <i class="fas fa-file-invoice-dollar"></i>
                        </button>
                    ` : ''}
                    
                    ${/*  BOTONES DE APROBACIÓN/RECHAZO DE USUARIO */ ''}
                    ${isPending ? `
                        <button class="btn-icon btn-success" 
                                onclick="aprobarUsuario(${user.id_usuario}, '${user.nombre_completo.replace(/'/g, "\\'")}')"
                                id="aprobar-btn-${user.id_usuario}"
                                title="Aprobar registro de usuario">
                            <i class="fas fa-user-check"></i>
                        </button>
                        <button class="btn-icon btn-danger" 
                                onclick="rechazarUsuario(${user.id_usuario}, '${user.nombre_completo.replace(/'/g, "\\'")}')"
                                id="rechazar-btn-${user.id_usuario}"
                                title="Rechazar registro">
                            <i class="fas fa-user-times"></i>
                        </button>
                    ` : ''}
                    
                    ${/*  BOTONES DE APROBACIÓN/RECHAZO DE PAGO */ ''}
                    ${hasPaymentPending ? `
                        <button class="btn-icon btn-success" 
                                onclick="approvePaymentFromTable(${user.id_usuario})"
                                id="approve-payment-btn-${user.id_usuario}"
                                title="Aprobar pago">
                            <i class="fas fa-check-circle"></i>
                        </button>
                        <button class="btn-icon btn-warning" 
                                onclick="rejectPaymentFromTable(${user.id_usuario})"
                                id="reject-payment-btn-${user.id_usuario}"
                                title="Rechazar pago">
                            <i class="fas fa-times-circle"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
};

// ========== 3. EXPORTAR FUNCIONES ==========

(' [PARCHE] Todas las funciones definidas:');
('  - aprobarUsuario:', typeof window.aprobarUsuario);
('  - rechazarUsuario:', typeof window.rechazarUsuario);
('  - verDetallesPago:', typeof window.verDetallesPago);
('  - approvePaymentFromTable:', typeof window.approvePaymentFromTable);
('  - rejectPaymentFromTable:', typeof window.rejectPaymentFromTable);
(' [PARCHE] Tabla de usuarios completamente funcional');

// ==========================================
// GESTIÓN DE USUARIOS ADMIN
// 
// ==========================================

(' [FIX USUARIOS] Aplicando corrección final...');

// ========== 1. LIMPIAR FUNCIONES ANTERIORES ==========
(function() {
    // Guardar referencias necesarias
    const COLORS_BACKUP = window.COLORS || {
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

    // ========== 2. DEFINIR FUNCIONES PRINCIPALES ==========

    /**
     *  Ver detalles de pago
     */
    window.verDetallesPago = async function(userId) {
        ('💵 [PAGO] Cargando detalles de pago:', userId);
        
        try {
            const response = await fetch(`/api/users/payment-details?id_usuario=${userId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                mostrarModalDetallesPago(data.pago, data.usuario);
            } else {
                alert(' Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(' Error al cargar detalles de pago: ' + error.message);
        }
    };

    /**
     *  Mostrar modal con detalles de pago
     */
    function mostrarModalDetallesPago(pago, usuario) {
       
        const modalAnterior = document.getElementById('detallesPagoModal');
        if (modalAnterior) modalAnterior.remove();

        const modal = `
            <div id="detallesPagoModal" 
                 class="modal-overlay"
                 style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 20px;
                 "
                 onclick="if(event.target.id === 'detallesPagoModal') this.remove()">
                
                <div class="modal-content-large" 
                     style="
                        background: white;
                        border-radius: 12px;
                        max-width: 800px;
                        width: 100%;
                        max-height: 90vh;
                        overflow-y: auto;
                        padding: 30px;
                        position: relative;
                     "
                     onclick="event.stopPropagation()">
                    
                    <button class="modal-close-btn" 
                            style="
                                position: absolute;
                                top: 15px;
                                right: 15px;
                                background: #f5f5f5;
                                border: none;
                                width: 35px;
                                height: 35px;
                                border-radius: 50%;
                                cursor: pointer;
                                font-size: 20px;
                            "
                            onclick="document.getElementById('detallesPagoModal').remove()">×</button>
                    
                    <h2 style="color: ${COLORS_BACKUP.primary}; margin-bottom: 20px;">
                        <i class="fas fa-file-invoice-dollar"></i> Detalles de Pago
                    </h2>
                    
                    <div style="background: ${COLORS_BACKUP.primaryLight}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: ${COLORS_BACKUP.primary}; margin-bottom: 15px;">👤 Información del Usuario</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                            <div><strong>Nombre:</strong> ${usuario.nombre_completo}</div>
                            <div><strong>Cédula:</strong> ${usuario.cedula}</div>
                            <div><strong>Email:</strong> ${usuario.email}</div>
                            <div><strong>Estado:</strong> <span class="estado-badge estado-${usuario.estado}">${formatEstadoUsuario(usuario.estado)}</span></div>
                        </div>
                    </div>
                    
                    ${pago ? `
                        <div style="background: ${COLORS_BACKUP.gray50}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="color: ${COLORS_BACKUP.primary}; margin-bottom: 15px;">💰 Información del Pago</h3>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                                <div><strong>Fecha:</strong> ${formatearFechaUY(pago.fecha_pago)}</div>
                                <div><strong>Monto:</strong> $${parseFloat(pago.monto).toLocaleString('es-UY', {minimumFractionDigits: 2})}</div>
                                <div><strong>Estado:</strong> <span class="badge badge-${pago.estado_validacion}">${pago.estado_validacion}</span></div>
                                <div><strong>Tipo:</strong> ${pago.tipo_pago}</div>
                            </div>
                            
                            ${pago.comprobante_archivo ? `
                                <div style="text-align: center;">
                                    <img src="/files/?path=${pago.comprobante_archivo}" 
                                         style="max-width: 100%; max-height: 400px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); cursor: pointer;"
                                         onclick="window.open('/files/?path=${pago.comprobante_archivo}', '_blank')">
                                    <p style="margin-top: 10px; color: ${COLORS_BACKUP.gray500}; font-size: 12px;">
                                        <i class="fas fa-info-circle"></i> Haz clic en la imagen para ampliar
                                    </p>
                                </div>
                            ` : '<p style="color: #999; text-align: center; padding: 20px;">Sin comprobante adjunto</p>'}
                        </div>
                        
                        ${pago.estado_validacion === 'pendiente' ? `
                            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                                <button class="btn btn-danger" onclick="rechazarPagoDesdeModal(${pago.id_pago}, ${usuario.id_usuario})">
                                    <i class="fas fa-times"></i> Rechazar Pago
                                </button>
                                <button class="btn btn-success" onclick="aprobarPagoDesdeModal(${pago.id_pago}, ${usuario.id_usuario})">
                                    <i class="fas fa-check"></i> Aprobar Pago
                                </button>
                            </div>
                        ` : ''}
                    ` : `
                        <div style="text-align: center; padding: 40px;">
                            <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; display: block; margin-bottom: 15px;"></i>
                            <p style="color: ${COLORS_BACKUP.gray500};">No hay información de pago disponible</p>
                        </div>
                    `}
                    
                    <div style="text-align: right; margin-top: 20px;">
                        <button class="btn btn-secondary" onclick="document.getElementById('detallesPagoModal').remove()">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    }

    /**
     *  Aprobar pago desde modal
     */
    window.aprobarPagoDesdeModal = async function(pagoId, userId) {
        document.getElementById('detallesPagoModal').remove();
        
        if (!confirm('¿Aprobar este pago?\n\nEl usuario será notificado.')) {
            return;
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
                alert(' Pago aprobado correctamente');
                if (typeof loadUsersForTable === 'function') {
                    loadUsersForTable();
                }
            } else {
                alert(' Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(' Error de conexión');
        }
    };

    /**
     *  Rechazar pago desde modal
     */
    window.rechazarPagoDesdeModal = async function(pagoId, userId) {
        document.getElementById('detallesPagoModal').remove();

        const motivo = prompt('¿Por qué rechazas este pago? (opcional)');
        if (motivo === null) return;

        if (!confirm('¿Confirmas el rechazo del pago?')) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('id_usuario', userId);
            formData.append('motivo', motivo || 'Sin motivo especificado');

            const response = await fetch('/api/payment/reject', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert(' Pago rechazado');
                if (typeof loadUsersForTable === 'function') {
                    loadUsersForTable();
                }
            } else {
                alert(' Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(' Error de conexión');
        }
    };

    /**
     *  Sobrescribir renderUserRow para manejar estados correctamente
     */
    window.renderUserRow = function(user) {
        const hasPayment = user.comprobante_archivo && user.comprobante_archivo !== '';
        const isPending = user.estado === 'pendiente' || user.estado === 'enviado';
        const isApproved = user.estado === 'aceptado';
        const isRejected = user.estado === 'rechazado';
        const hasPaymentPending = hasPayment && user.estado_pago === 'pendiente';
        
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
                    <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center;">
                        
                        ${/*  BOTÓN VER DETALLES DE USUARIO */ ''}
                        <button class="btn-icon btn-primary" 
                                onclick="viewUserDetails(${user.id_usuario})"
                                title="Ver detalles del usuario">
                            <i class="fas fa-eye"></i>
                        </button>
                        
                        ${/*  BOTÓN VER PAGO - Solo visible si está pendiente */ ''}
                        ${hasPayment && isPending ? `
                            <button class="btn-icon btn-info" 
                                    onclick="verDetallesPago(${user.id_usuario})"
                                    title="Ver detalles de pago"
                                    style="background: #17a2b8;">
                                <i class="fas fa-file-invoice-dollar"></i>
                            </button>
                        ` : ''}
                        
                        ${/*  BOTONES DE APROBACIÓN/RECHAZO DE USUARIO */ ''}
                        ${isPending ? `
                            <button class="btn-icon btn-success" 
                                    onclick="aprobarUsuario(${user.id_usuario}, '${user.nombre_completo.replace(/'/g, "\\'")}')"
                                    id="aprobar-btn-${user.id_usuario}"
                                    title="Aprobar registro de usuario"
                                    ${!hasPayment ? 'disabled' : ''}>
                                <i class="fas fa-user-check"></i>
                            </button>
                            <button class="btn-icon btn-danger" 
                                    onclick="rechazarUsuario(${user.id_usuario}, '${user.nombre_completo.replace(/'/g, "\\'")}')"
                                    id="rechazar-btn-${user.id_usuario}"
                                    title="Rechazar registro">
                                <i class="fas fa-user-times"></i>
                            </button>
                        ` : ''}
                        
                        ${/*  BADGE DE APROBADO */ ''}
                        ${isApproved ? `
                            <span class="badge badge-success" style="padding: 6px 12px;">
                                <i class="fas fa-check-circle"></i> Aprobado
                            </span>
                        ` : ''}
                        
                        ${/*  BADGE DE RECHAZADO */ ''}
                        ${isRejected ? `
                            <span class="badge badge-danger" style="padding: 6px 12px;">
                                <i class="fas fa-times-circle"></i> Rechazado
                            </span>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    };

    /**
     *  Aprobar usuario
     */
    window.aprobarUsuario = async function(userId, nombreUsuario) {
        (' [APROBAR] Aprobando usuario:', userId);
        
        if (!confirm(`¿Aprobar el registro de ${nombreUsuario}?\n\nEl usuario podrá acceder al sistema y su pago será validado automáticamente.`)) {
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('id_usuario', userId);
            formData.append('accion', 'aprobar');
            
            const response = await fetch('/api/users/aprobar-rechazar', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(' Usuario aprobado correctamente');
                if (typeof loadUsersForTable === 'function') {
                    loadUsersForTable();
                }
            } else {
                alert(' Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(' Error de conexión');
        }
    };

    /**
     *  Rechazar usuario
     */
    window.rechazarUsuario = async function(userId, nombreUsuario) {
        (' [RECHAZAR] Rechazando usuario:', userId);
        
        const motivo = prompt(`¿Por qué rechazas el registro de ${nombreUsuario}?\n\nMotivo (opcional):`);
        
        if (motivo === null) return;
        
        if (!confirm(`¿Confirmas el rechazo de ${nombreUsuario}?`)) {
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('id_usuario', userId);
            formData.append('accion', 'rechazar');
            formData.append('motivo', motivo || 'Sin motivo especificado');
            
            const response = await fetch('/api/users/aprobar-rechazar', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(' Usuario rechazado');
                if (typeof loadUsersForTable === 'function') {
                    loadUsersForTable();
                }
            } else {
                alert(' Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(' Error de conexión');
        }
    };

    // ========== FUNCIÓN AUXILIAR ==========
    function formatEstadoUsuario(estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'enviado': 'Enviado',
            'aceptado': 'Aceptado',
            'rechazado': 'Rechazado'
        };
        return estados[estado] || estado;
    }

    (' [FIX USUARIOS] Todas las funciones definidas correctamente');
    ('  - verDetallesPago:', typeof window.verDetallesPago);
    ('  - aprobarUsuario:', typeof window.aprobarUsuario);
    ('  - rechazarUsuario:', typeof window.rechazarUsuario);
})();

(' [FIX USUARIOS] Módulo cargado completamente');


// ==========================================
// FIX: ASIGNACIÓN DE VIVIENDA A NÚCLEO
// 
// ==========================================

// ==========================================
//  FIX FINAL: submitAsignacion() - CON RECARGA AUTOMÁTICA
// ==========================================

function submitAsignacion(event) {
    event.preventDefault();
    ('📤 [ASIGNAR] Iniciando asignación de vivienda...');

    const viviendaId = document.getElementById('asignar-vivienda-id').value;
    const tipo = document.getElementById('asignar-tipo').value;
    const usuarioId = document.getElementById('asignar-usuario').value;
    const nucleoId = document.getElementById('asignar-nucleo').value;
    const observaciones = document.getElementById('asignar-observaciones').value;

    //  VALIDACIÓN
    if (!tipo || (tipo === 'usuario' && !usuarioId) || (tipo === 'nucleo' && !nucleoId)) {
        alert('⚠️ Debe seleccionar un usuario o núcleo');
        return;
    }

    const formData = new FormData();
    formData.append('vivienda_id', viviendaId);
    
    if (tipo === 'usuario') {
        formData.append('usuario_id', usuarioId);
    } else if (tipo === 'nucleo') {
        formData.append('nucleo_id', nucleoId);
    }
    
    formData.append('observaciones', observaciones);

    ('📤 [ASIGNAR] Enviando asignación...');

    fetch('/api/viviendas/asignar', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(' ' + data.message);
                
                //  CERRAR MODAL
                closeAsignarModal();
                
                //  RECARGAR PÁGINA COMPLETA
                ('🔄 [ASIGNAR] Recargando página...');
                window.location.reload();
                
            } else {
                alert(' Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error(' [ASIGNAR] Error:', error);
            alert(' Error de conexión');
        });
}

//  EXPORTAR
window.submitAsignacion = submitAsignacion;

(' submitAsignacion con recarga automática aplicado');

// ==========================================
// FIX: FUNCIÓN MEJORADA PARA MOSTRAR MODAL
// 
// ==========================================

function showAsignarModal(viviendaId, numeroVivienda) {
    ('>>> Abriendo modal asignar:', viviendaId);

    // 🧹 LIMPIAR MODALES ANTERIORES
    limpiarModalesAnteriores();

    Promise.all([
        fetch('/api/users/all').then(r => r.json()),
        fetch('/api/nucleos/all').then(r => r.json())
    ]).then(([usersData, nucleosData]) => {
        if (usersData.success && nucleosData.success) {
            // Filtrar solo usuarios sin núcleo asignado (opcional)
            const usuariosDisponibles = usersData.users.filter(u => u.estado === 'aceptado');
            
            const userSelect = document.getElementById('asignar-usuario');
            userSelect.innerHTML = '<option value="">Seleccione un usuario...</option>';
            usuariosDisponibles.forEach(user => {
                userSelect.innerHTML += `<option value="${user.id_usuario}">${user.nombre_completo} (${user.email})</option>`;
            });

            const nucleoSelect = document.getElementById('asignar-nucleo');
            nucleoSelect.innerHTML = '<option value="">Seleccione un núcleo...</option>';
            nucleosData.nucleos.forEach(nucleo => {
                nucleoSelect.innerHTML += `<option value="${nucleo.id_nucleo}">${nucleo.nombre_nucleo || 'Sin nombre'} (${nucleo.total_miembros} miembros)</option>`;
            });

            document.getElementById('asignar-vivienda-info').textContent = `Vivienda: ${numeroVivienda}`;
            document.getElementById('asignar-vivienda-id').value = viviendaId;
            
            //  Resetear selects
            document.getElementById('asignar-tipo').value = '';
            document.getElementById('asignar-usuario').value = '';
            document.getElementById('asignar-nucleo').value = '';
            document.getElementById('asignar-observaciones').value = '';
            
            // Ocultar grupos
            document.getElementById('asignar-usuario-group').style.display = 'none';
            document.getElementById('asignar-nucleo-group').style.display = 'none';
            
            document.getElementById('asignarViviendaModal').style.display = 'flex';
            
            (' Modal abierto correctamente');
        }
    }).catch(error => {
        console.error('Error:', error);
        alert('Error al cargar datos');
    });
}

// ==========================================
//  toggleAsignarTipo
// ==========================================

function toggleAsignarTipo() {
    const tipo = document.getElementById('asignar-tipo').value;
    const usuarioGroup = document.getElementById('asignar-usuario-group');
    const nucleoGroup = document.getElementById('asignar-nucleo-group');

    ('🔄 [TOGGLE] Tipo seleccionado:', tipo);

    if (tipo === 'usuario') {
        usuarioGroup.style.display = 'block';
        nucleoGroup.style.display = 'none';
        document.getElementById('asignar-nucleo').value = ''; // Limpiar núcleo
        (' [TOGGLE] Mostrando selector de usuario');
    } else if (tipo === 'nucleo') {
        usuarioGroup.style.display = 'none';
        nucleoGroup.style.display = 'block';
        document.getElementById('asignar-usuario').value = ''; // Limpiar usuario
        (' [TOGGLE] Mostrando selector de núcleo');
    } else {
        usuarioGroup.style.display = 'none';
        nucleoGroup.style.display = 'none';
    }
}

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

window.submitAsignacion = submitAsignacion;
window.showAsignarModal = showAsignarModal;
window.toggleAsignarTipo = toggleAsignarTipo;

(' Fix de asignación de vivienda aplicado correctamente');


// ==========================================
//  ASIGNACIÓN DIRECTA DE VIVIENDA (SIN MODAL)
// ==========================================

('[VIVIENDA] Cargando sistema de asignación directa...');

/**
 *  Asignar vivienda directamente con prompts
 */
window.asignarViviendaDirecta = async function(viviendaId, numeroVivienda) {
    ('🏠 [ASIGNAR] Iniciando asignación para vivienda:', numeroVivienda);
    
    // PASO 1: Preguntar qué tipo de asignación
    const tipo = prompt(
        `🏠 Asignar Vivienda: ${numeroVivienda}\n\n` +
        `Selecciona el tipo de asignación:\n` +
        `1 = Usuario Individual\n` +
        `2 = Núcleo Familiar\n\n` +
        `Escribe 1 o 2:`
    );
    
    if (!tipo || (tipo !== '1' && tipo !== '2')) {
        (' [ASIGNAR] Cancelado por usuario');
        return;
    }
    
    const esUsuario = tipo === '1';
    
    try {
        // PASO 2: Obtener lista de usuarios o núcleos
        let opciones = [];
        let titulo = '';
        
        if (esUsuario) {
            const response = await fetch('/api/users/all');
            const data = await response.json();
            
            if (!data.success) throw new Error('Error al cargar usuarios');
            
            opciones = data.users.filter(u => u.estado === 'aceptado');
            titulo = '👤 USUARIOS DISPONIBLES';
            
        } else {
            const response = await fetch('/api/nucleos/all');
            const data = await response.json();
            
            if (!data.success) throw new Error('Error al cargar núcleos');
            
            opciones = data.nucleos;
            titulo = '👨‍👩‍👧‍👦 NÚCLEOS FAMILIARES';
        }
        
        if (opciones.length === 0) {
            alert(' No hay ' + (esUsuario ? 'usuarios' : 'núcleos') + ' disponibles');
            return;
        }
        
        // PASO 3: Mostrar lista y pedir selección
        let mensaje = `${titulo}\n\n`;
        
        if (esUsuario) {
            opciones.forEach((u, idx) => {
                mensaje += `${idx + 1}. ${u.nombre_completo} (${u.email})\n`;
            });
            mensaje += `\n📝 Ingresa el número del usuario:`;
        } else {
            opciones.forEach((n, idx) => {
                mensaje += `${idx + 1}. ${n.nombre_nucleo || 'Sin nombre'} (${n.total_miembros} miembros)\n`;
            });
            mensaje += `\n📝 Ingresa el número del núcleo:`;
        }
        
        const seleccion = prompt(mensaje);
        
        if (!seleccion) {
            (' [ASIGNAR] Cancelado por usuario');
            return;
        }
        
        const index = parseInt(seleccion) - 1;
        
        if (index < 0 || index >= opciones.length) {
            alert(' Selección inválida');
            return;
        }
        
        const opcionSeleccionada = opciones[index];
        
        // PASO 4: Confirmar
        const nombreMostrar = esUsuario ? 
            opcionSeleccionada.nombre_completo : 
            opcionSeleccionada.nombre_nucleo || 'Núcleo sin nombre';
        
        if (!confirm(`¿Asignar vivienda ${numeroVivienda} a ${nombreMostrar}?`)) {
            return;
        }
        
        // PASO 5: Enviar asignación
        const formData = new FormData();
        formData.append('vivienda_id', viviendaId);
        
        if (esUsuario) {
            formData.append('usuario_id', opcionSeleccionada.id_usuario);
        } else {
            formData.append('nucleo_id', opcionSeleccionada.id_nucleo);
        }
        
        ('📤 [ASIGNAR] Enviando asignación...');
        
        const response = await fetch('/api/viviendas/asignar', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(' ' + data.message);
            
            // Recargar tabla
            if (typeof loadViviendas === 'function') {
                loadViviendas();
            }
        } else {
            alert(' Error: ' + data.message);
        }
        
    } catch (error) {
        console.error(' [ASIGNAR] Error:', error);
        alert(' Error: ' + error.message);
    }
};

/**
 *  Desasignar vivienda
 */
window.desasignarVivienda = async function(asignacionId, numeroVivienda) {
    ('🏠 [DESASIGNAR] Iniciando desasignación:', asignacionId);
    
    if (!confirm(`¿Desasignar la vivienda ${numeroVivienda}?\n\nLos usuarios/núcleo quedarán sin vivienda asignada.`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('asignacion_id', asignacionId);
        
        const response = await fetch('/api/viviendas/desasignar', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(' ' + data.message);
            
            if (typeof loadViviendas === 'function') {
                loadViviendas();
            }
        } else {
            alert(' Error: ' + data.message);
        }
        
    } catch (error) {
        console.error(' [DESASIGNAR] Error:', error);
        alert(' Error de conexión');
    }
};

(' Sistema de asignación directa cargado');
(' Funciones disponibles:');
('  - asignarViviendaDirecta()');
('  - desasignarVivienda()');