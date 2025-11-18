
console.log('🟢 [MÓDULO NÚCLEOS] Cargando...');

// ========== NAMESPACE ==========
window.NucleosModule = {
    version: '1.0.0',
    loaded: false
};

// ========== INICIALIZACIÓN ==========
function inicializarModuloNucleos() {

    
    const nucleosMenuItem = document.querySelector('.menu li[data-section="nucleo"]');
    if (nucleosMenuItem) {
        nucleosMenuItem.addEventListener('click', function() {
     
            loadNucleosFamiliares();
        });
    }
    
    window.NucleosModule.loaded = true;

}

// ========== CARGAR NÚCLEOS ==========
async function loadNucleosFamiliares() {
   
    
    const container = document.getElementById('nucleosTableContainer');

    if (!container) {
        console.error('❌ [NÚCLEOS] Container no encontrado');
        return;
    }

    container.innerHTML = '<p class="loading">Cargando núcleos...</p>';

    try {
        const response = await fetch('/api/nucleos/all', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderNucleosTable(data.nucleos);
        } else {
            container.innerHTML = `<p class="error">Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('❌ [NÚCLEOS] Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== RENDERIZAR TABLA ==========
function renderNucleosTable(nucleos) {
    const container = document.getElementById('nucleosTableContainer');

    if (!nucleos || nucleos.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-users" style="font-size: 48px; color: #E8EBF0; display: block; margin-bottom: 15px;"></i>
                <p style="color: #6C757D; margin-bottom: 20px;">No hay núcleos familiares registrados</p>
                <button class="btn btn-primary" onclick="NucleosModule.showCreateModal()">
                    <i class="fas fa-plus"></i> Crear Nuevo Núcleo
                </button>
            </div>
        `;
        return;
    }

    let html = `
        <div style="overflow-x: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 92, 185, 0.12);">
            <table style="width: 100%; border-collapse: collapse; background: #FFFFFF; min-width: 1000px;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #005CB9 0%, #004494 100%); color: #FFFFFF;">
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">ID</th>
                        <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Nombre del Núcleo</th>
                        <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Dirección</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Miembros</th>
                        <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Integrantes</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

    nucleos.forEach(nucleo => {
        const integrantes = nucleo.miembros_nombres
            ? nucleo.miembros_nombres.split(', ').slice(0, 3).join(', ') +
              (nucleo.total_miembros > 3 ? ` y ${nucleo.total_miembros - 3} más...` : '')
            : 'Sin miembros';

        const totalMiembros = nucleo.total_miembros || 0;

        html += `
            <tr style="border-bottom: 1px solid #E8EBF0; transition: all 0.2s ease;" 
                onmouseover="this.style.background='#F5F7FA'" 
                onmouseout="this.style.background='#FFFFFF'">
                
                <td style="padding: 14px 12px; text-align: center;">
                    <div style="font-weight: 600; color: #005CB9; font-size: 14px;">#${nucleo.id_nucleo}</div>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px;">
                    <div style="font-weight: 600; color: #495057;">${nucleo.nombre_nucleo || 'Sin nombre'}</div>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px; color: #495057;">
                    ${nucleo.direccion || '-'}
                </td>
                
                <td style="padding: 14px 12px; text-align: center;">
                    <span style="
                        display: inline-block;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 600;
                        background: ${totalMiembros > 0 ? '#4CAF50' : '#E8EBF0'};
                        color: ${totalMiembros > 0 ? '#FFFFFF' : '#6C757D'};
                    ">${totalMiembros} ${totalMiembros === 1 ? 'miembro' : 'miembros'}</span>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px;">
                    ${integrantes !== 'Sin miembros' 
                        ? `<div style="color: #495057;">${integrantes}</div>` 
                        : '<span style="color: #6C757D; font-style: italic;">Sin miembros</span>'}
                </td>
                
                <td style="padding: 14px 12px;">
                    <div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn-small btn-primary"  
                                onclick="NucleosModule.viewDetails(${nucleo.id_nucleo})" 
                                title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-small btn-primary" 
                                onclick="NucleosModule.edit(${nucleo.id_nucleo})" 
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-small btn-danger" 
                                onclick="NucleosModule.delete(${nucleo.id_nucleo})" 
                                title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ========== MOSTRAR MODAL CREAR ==========
function showCreateNucleoModal() {

    
    loadUsersForNucleo().then(usuarios => {
        const modalHTML = `
            <div id="createNucleoModal" class="material-modal" style="display: flex;">
                <div class="material-modal-content">
                    <div class="material-modal-header">
                        <h3>Crear Nuevo Núcleo Familiar</h3>
                        <button class="close-material-modal" onclick="NucleosModule.closeCreateModal()">&times;</button>
                    </div>
                    
                    <form id="createNucleoForm" onsubmit="NucleosModule.submitCreate(event)">
                        <div class="material-form-group">
                            <label for="nombre_nucleo">Nombre del Núcleo *</label>
                            <input type="text" id="nombre_nucleo" name="nombre_nucleo" 
                                   class="material-input"
                                   placeholder="Ej: Familia García" required>
                        </div>

                        <div class="material-form-group">
                            <label for="direccion_nucleo">Dirección</label>
                            <input type="text" id="direccion_nucleo" name="direccion" 
                                   class="material-input"
                                   placeholder="Ej: Av. Italia 2345">
                        </div>

                        <div class="material-form-group">
                            <label>Seleccionar Miembros del Núcleo *</label>
                            <div class="user-selection-nucleo">
                                <input type="text" id="search-users-nucleo" 
                                       class="material-input"
                                       placeholder="Buscar usuario..." 
                                       onkeyup="NucleosModule.filterUsers()">
                                <div id="usersListNucleo" class="users-checkboxes-nucleo">
                                    ${renderUsersCheckboxes(usuarios)}
                                </div>
                                <small style="color: #6C757D; font-size: 12px;">
                                    Selecciona los miembros que formarán parte de este núcleo
                                </small>
                            </div>
                        </div>

                        <div class="material-form-actions">
                            <button type="button" class="btn btn-secondary" 
                                    onclick="NucleosModule.closeCreateModal()">
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

        const existing = document.getElementById('createNucleoModal');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }).catch(error => {
        console.error('❌ [NÚCLEOS] Error:', error);
        alert('Error al cargar usuarios');
    });
}

// ========== RENDERIZAR CHECKBOXES DE USUARIOS ==========
function renderUsersCheckboxes(usuarios) {
    if (!usuarios || usuarios.length === 0) {
        return '<p style="color: #6C757D; text-align: center; padding: 20px;">No hay usuarios disponibles</p>';
    }

    return usuarios.map(usuario => {
        const isInNucleo = usuario.id_nucleo !== null;
        const isDisabled = isInNucleo ? 'disabled' : '';
        const checkboxStyle = isInNucleo ? 'opacity: 0.5; cursor: not-allowed;' : 'cursor: pointer;';
        
        return `
            <label style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 12px;
                background: ${isInNucleo ? '#FFF3E0' : '#FFFFFF'};
                border: 1px solid ${isInNucleo ? '#FFB74D' : '#E0E0E0'};
                border-radius: 6px;
                ${checkboxStyle}
                transition: all 0.2s ease;
            ">
                <input type="checkbox" 
                       name="miembros[]" 
                       value="${usuario.id_usuario}" 
                       ${isDisabled}>
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: ${isInNucleo ? '#795548' : '#212529'};">
                        ${usuario.nombre} ${usuario.apellido}
                    </div>
                    <div style="font-size: 12px; color: ${isInNucleo ? '#8D6E63' : '#6C757D'};">
                        CI: ${usuario.cedula}
                    </div>
                </div>
                ${isInNucleo ? `
                    <span style="
                        font-size: 11px;
                        color: #E65100;
                        background: #FFE0B2;
                        padding: 4px 10px;
                        border-radius: 12px;
                        font-weight: 600;
                    ">Ya en núcleo</span>
                ` : ''}
            </label>
        `;
    }).join('');
}

// ========== CARGAR USUARIOS DISPONIBLES ==========
async function loadUsersForNucleo(nucleoId = null) {
    try {
        const response = await fetch('/api/nucleos/users-available', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.usuarios;
        }
        throw new Error('Error al cargar usuarios');
    } catch (error) {
        console.error('❌ [NÚCLEOS] Error al cargar usuarios:', error);
        throw error;
    }
}

// ========== FILTRAR USUARIOS ==========
function filterUsersNucleo() {
    const searchValue = document.getElementById('search-users-nucleo').value.toLowerCase();
    const labels = document.querySelectorAll('#usersListNucleo label');
    
    labels.forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(searchValue) ? 'flex' : 'none';
    });
}

// ========== CERRAR MODAL CREAR ==========
function closeCreateNucleoModal() {
    const modal = document.getElementById('createNucleoModal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = 'auto';
}

// ========== SUBMIT CREAR ==========
async function submitCreateNucleo(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const miembros = formData.getAll('miembros[]');
    
    if (miembros.length === 0) {
        alert('Debes seleccionar al menos un miembro');
        return;
    }
    
    try {
        const response = await fetch('/api/nucleos/create', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(' ' + data.message);
            closeCreateNucleoModal();
            loadNucleosFamiliares();
        } else {
            alert('❌ Error: ' + data.message);
        }
    } catch (error) {
        console.error('❌ [NÚCLEOS] Error:', error);
        alert('❌ Error de conexión');
    }
}

// ========== VER DETALLES ==========
async function viewNucleoDetails(nucleoId) {
   
    
    try {
        const response = await fetch(`/api/nucleos/details?nucleo_id=${nucleoId}`);
        const data = await response.json();
        
        if (data.success) {
            showNucleoDetailsModal(data.nucleo, data.miembros);
        } else {
            alert('❌ Error: ' + data.message);
        }
    } catch (error) {
        console.error('❌ [NÚCLEOS] Error:', error);
        alert('❌ Error de conexión');
    }
}

// ========== MODAL DE DETALLES ==========
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
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove(); NucleosModule.edit(${nucleo.id_nucleo})">
                        Editar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ========== EDITAR NÚCLEO ==========
async function editNucleo(nucleoId) {
   
    
    try {
        const [detailsData, usuarios] = await Promise.all([
            fetch(`/api/nucleos/details?nucleo_id=${nucleoId}`).then(r => r.json()),
            loadUsersForNucleo(nucleoId)
        ]);
        
        if (!detailsData.success) throw new Error('Error al cargar datos');

        const nucleo = detailsData.nucleo;
        const miembrosActuales = detailsData.miembros.map(m => m.id_usuario);

        const modalHTML = `
            <div id="nucleoModal" class="material-modal" style="display: flex;">
                <div class="material-modal-content">
                    <div class="material-modal-header">
                        <h3>Editar Núcleo Familiar</h3>
                        <button class="close-material-modal" onclick="NucleosModule.closeEditModal()">&times;</button>
                    </div>
                    
                    <form id="editNucleoForm" onsubmit="NucleosModule.submitEdit(event, ${nucleoId})">
                        <input type="hidden" value="${nucleoId}">

                        <div class="material-form-group">
                            <label for="edit_nombre_nucleo">Nombre del Núcleo *</label>
                            <input type="text" id="edit_nombre_nucleo" name="nombre_nucleo"
                                   value="${nucleo.nombre_nucleo || ''}" required>
                        </div>

                        <div class="material-form-group">
                            <label for="edit_direccion_nucleo">Dirección</label>
                            <input type="text" id="edit_direccion_nucleo" name="direccion"
                                   value="${nucleo.direccion || ''}">
                        </div>

                        <div class="material-form-group">
                            <label>Miembros del Núcleo *</label>
                            <div class="user-selection-nucleo">
                                <input type="text" id="search-users-nucleo-edit"
                                       class="material-input"
                                       placeholder="Buscar usuario..."
                                       onkeyup="NucleosModule.filterUsersEdit()">

                                <div id="usersListNucleoEdit" class="users-checkboxes-nucleo">
                                    ${renderUsersCheckboxesEdit(usuarios, miembrosActuales, nucleoId)}
                                </div>
                            </div>
                        </div>

                        <div class="material-form-actions">
                            <button type="button" class="btn btn-secondary" onclick="NucleosModule.closeEditModal()">
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

        const existing = document.getElementById("nucleoModal");
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        console.error('❌ [NÚCLEOS] Error:', error);
        alert('❌ Error al cargar datos del núcleo');
    }
}

// ========== RENDERIZAR USUARIOS PARA EDICIÓN ==========
function renderUsersCheckboxesEdit(usuarios, miembrosActuales, nucleoIdActual) {
    if (!usuarios || usuarios.length === 0) {
        return '<p>No hay usuarios disponibles</p>';
    }

    return usuarios.map(user => {
        const esMiembroActual = miembrosActuales.includes(user.id_usuario);
        const enOtroNucleo = user.id_nucleo && user.id_nucleo != nucleoIdActual;
        const disabled = enOtroNucleo;

        return `
            <label>
                <input type="checkbox" name="usuarios[]" value="${user.id_usuario}"
                       ${esMiembroActual ? 'checked' : ''}
                       ${disabled ? 'disabled' : ''}>
                <span>
                    <strong>${user.nombre_completo}</strong>
                    <small>${user.email}</small>
                    ${enOtroNucleo ? '<span class="badge-warning">En otro núcleo</span>' : ''}
                    ${esMiembroActual && !enOtroNucleo ? '<span class="badge-success">Miembro actual</span>' : ''}
                </span>
            </label>
        `;
    }).join('');
}

// ========== CERRAR MODAL EDITAR ==========
function closeEditNucleoModal() {
    const modal = document.getElementById("nucleoModal");
    if (modal) modal.remove();
}

// ========== FILTRAR USUARIOS EDIT ==========
function filterUsersNucleoEdit() {
    const searchText = document.getElementById('search-users-nucleo-edit').value.toLowerCase();
    const items = document.querySelectorAll('#usersListNucleoEdit .user-checkbox-item');

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchText) ? '' : 'none';
    });
}

// ========== SUBMIT EDITAR ==========
async function submitEditNucleo(event, nucleoId) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    formData.append('nucleo_id', nucleoId);

    const selectedUsers = Array.from(document.querySelectorAll('#usersListNucleoEdit input[name="usuarios[]"]:checked'))
        .map(cb => cb.value);

    formData.delete('usuarios[]');
    selectedUsers.forEach(userId => formData.append('usuarios[]', userId));

    try {
        const response = await fetch('/api/nucleos/update', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(' ' + data.message);
            closeEditNucleoModal();
            loadNucleosFamiliares();
        } else {
            alert('❌ Error: ' + data.message);
        }
    } catch (error) {
        console.error('❌ [NÚCLEOS] Error:', error);
        alert('❌ Error de conexión');
    }
}

// ========== ELIMINAR NÚCLEO ==========
async function deleteNucleo(nucleoId) {
    if (!confirm('¿Está seguro de eliminar este núcleo familiar?\n\nLos usuarios serán desasignados pero NO serán eliminados.')) {
        return;
    }

    const formData = new FormData();
    formData.append('nucleo_id', nucleoId);

    try {
        const response = await fetch('/api/nucleos/delete', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(' ' + data.message);
            loadNucleosFamiliares();
        } else {
            alert('❌ Error: ' + data.message);
        }
    } catch (error) {
        console.error('❌ [NÚCLEOS] Error:', error);
        alert('❌ Error de conexión');
    }
}

// ========== EXPORTAR API PÚBLICA ==========
window.NucleosModule = {
    version: '1.0.0',
    loaded: false,
    
    // Funciones principales
    init: inicializarModuloNucleos,
    load: loadNucleosFamiliares,
    showCreateModal: showCreateNucleoModal,
    closeCreateModal: closeCreateNucleoModal,
    submitCreate: submitCreateNucleo,
    viewDetails: viewNucleoDetails,
    edit: editNucleo,
    closeEditModal: closeEditNucleoModal,
    submitEdit: submitEditNucleo,
    delete: deleteNucleo,
    filterUsers: filterUsersNucleo,
    filterUsersEdit: filterUsersNucleoEdit
};

// ========== AUTO-INICIALIZACIÓN ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarModuloNucleos);
} else {
    inicializarModuloNucleos();
}

console.log(' [MÓDULO NÚCLEOS] Cargado completamente');