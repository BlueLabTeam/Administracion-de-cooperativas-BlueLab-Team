// ==========================================
// MÓDULO: GESTIÓN DE VIVIENDAS
// Archivo: gestionViviendas.js
// ==========================================

console.log('🟢 [MÓDULO VIVIENDAS] Cargando...');

// ========== NAMESPACE ==========
window.ViviendasModule = {
    version: '1.0.0',
    loaded: false
};

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
function inicializarModuloViviendas() {
    console.log('🏠 [VIVIENDAS] Inicializando módulo...');
    
    const viviendasMenuItem = document.querySelector('.menu li[data-section="viviendas"]');
    if (viviendasMenuItem) {
        viviendasMenuItem.addEventListener('click', function() {
            console.log('>>> [VIVIENDAS] Sección abierta');
            loadViviendas();
            loadTiposVivienda();
        });
    }
    
    window.ViviendasModule.loaded = true;
    console.log('✅ [VIVIENDAS] Módulo inicializado');
}

// ========== CARGAR VIVIENDAS ==========
async function loadViviendas() {
    console.log('📋 [VIVIENDAS] Cargando lista...');
    
    const container = document.getElementById('viviendasTableContainer');

    if (!container) {
        console.error('❌ [VIVIENDAS] Container no encontrado');
        return;
    }

    container.innerHTML = '<p class="loading">Cargando viviendas...</p>';

    try {
        const response = await fetch('/api/viviendas/all', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderViviendasTable(data.viviendas);
        } else {
            container.innerHTML = `<p class="error">Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('❌ [VIVIENDAS] Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== RENDERIZAR TABLA ==========
function renderViviendasTable(viviendas) {
    const container = document.getElementById('viviendasTableContainer');

    if (!viviendas || viviendas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-home" style="font-size: 48px; color: #E8EBF0; display: block; margin-bottom: 15px;"></i>
                <p style="color: #6C757D; margin-bottom: 20px;">No hay viviendas registradas</p>
                <button class="btn btn-primary" onclick="ViviendasModule.showCreateModal()">
                    <i class="fas fa-plus"></i> Crear Primera Vivienda
                </button>
            </div>
        `;
        return;
    }

    let html = `
        <div style="overflow-x: auto; border-radius: 12px; box-shadow: ${COLORS.shadow};">
            <table style="width: 100%; border-collapse: collapse; background: ${COLORS.white}; min-width: 1200px;">
                <thead>
                    <tr style="background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%); color: ${COLORS.white};">
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">ID</th>
                        <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Número</th>
                        <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Dirección</th>
                        <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Tipo</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Estado</th>
                        <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Asignada a</th>
                        <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

    viviendas.forEach(vivienda => {
        const asignada = vivienda.usuario_asignado || vivienda.nucleo_asignado || '-';
        const tieneAsignacion = vivienda.id_asignacion && vivienda.activa == 1;
        
        let estadoColor = '';
        let estadoText = '';
        if (vivienda.estado === 'disponible') {
            estadoColor = COLORS.success;
            estadoText = 'Disponible';
        } else if (vivienda.estado === 'ocupada') {
            estadoColor = COLORS.primary;
            estadoText = 'Ocupada';
        } else if (vivienda.estado === 'mantenimiento') {
            estadoColor = COLORS.warning;
            estadoText = 'Mantenimiento';
        }

        html += `
            <tr style="border-bottom: 1px solid ${COLORS.gray100}; transition: all 0.2s ease;" 
                onmouseover="this.style.background='${COLORS.gray50}'" 
                onmouseout="this.style.background='${COLORS.white}'">
                
                <td style="padding: 14px 12px; text-align: center;">
                    <div style="font-weight: 600; color: ${COLORS.primary}; font-size: 14px;">#${vivienda.id_vivienda}</div>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px;">
                    <div style="font-weight: 600; color: ${COLORS.gray700};">${vivienda.numero_vivienda}</div>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px; color: ${COLORS.gray700};">
                    ${vivienda.direccion || '-'}
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px;">
                    <div style="font-weight: 600; color: ${COLORS.gray700};">${vivienda.tipo_nombre}</div>
                    <div style="font-size: 11px; color: ${COLORS.gray500}; margin-top: 3px;">${vivienda.habitaciones} hab. • ${vivienda.metros_cuadrados ? vivienda.metros_cuadrados + ' m²' : '-'}</div>
                </td>
                
                <td style="padding: 14px 12px; text-align: center;">
                    <span style="
                        display: inline-block;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 600;
                        background: ${estadoColor};
                        color: ${COLORS.white};
                    ">${estadoText}</span>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px;">
                    ${asignada !== '-' 
                        ? `<div style="color: ${COLORS.gray700};">${asignada}</div>` 
                        : `<span style="color: ${COLORS.gray500}; font-style: italic;">Sin asignar</span>`}
                </td>
                
                <td style="padding: 14px 12px;">
                    <div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap;">
                        
                        <button class="btn-small btn-secondary" 
                                onclick="ViviendasModule.viewDetails(${vivienda.id_vivienda})" 
                                title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        
                        <button class="btn-small btn-primary" 
                                onclick="ViviendasModule.edit(${vivienda.id_vivienda})" 
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        
                        ${!tieneAsignacion ? `
                            <button class="btn-small btn-success" 
                                    onclick="ViviendasModule.asignar(${vivienda.id_vivienda}, '${vivienda.numero_vivienda.replace(/'/g, "\\'")}')">
                                <i class="fas fa-user-plus"></i>
                            </button>
                        ` : `
                            <button class="btn-small btn-warning" 
                                    onclick="ViviendasModule.desasignar(${vivienda.id_asignacion})">
                                <i class="fas fa-user-minus"></i>
                            </button>
                        `}
                        
                        <button class="btn-small btn-danger" 
                                onclick="ViviendasModule.delete(${vivienda.id_vivienda}, '${vivienda.numero_vivienda.replace(/'/g, "\\'")}')">
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

// ========== CARGAR TIPOS DE VIVIENDA ==========
async function loadTiposVivienda() {
    try {
        const response = await fetch('/api/viviendas/tipos');
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('vivienda-tipo');
            if (select) {
                select.innerHTML = '<option value="">Seleccione...</option>';
                data.tipos.forEach(tipo => {
                    select.innerHTML += `<option value="${tipo.id_tipo}">${tipo.nombre} (${tipo.habitaciones} hab.)</option>`;
                });
            }
        }
    } catch (error) {
        console.error('❌ [VIVIENDAS] Error al cargar tipos:', error);
    }
}

// ========== MOSTRAR MODAL CREAR ==========
function showCreateViviendaModal() {
    console.log('➕ [VIVIENDAS] Abriendo modal crear...');
    
    limpiarModalesAnteriores();

    const modal = document.getElementById('viviendaModal');
    
    if (!modal) {
        console.error('❌ [VIVIENDAS] Modal no encontrado');
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
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        setupModalNoCloseOutside(modal);
    }).catch(error => {
        console.error('❌ [VIVIENDAS] Error:', error);
        alert('Error al cargar tipos de vivienda');
    });
}

// ========== EDITAR VIVIENDA ==========
function editVivienda(id) {
    console.log('✏️ [VIVIENDAS] Editando:', id);
    
    limpiarModalesAnteriores();

    const modal = document.getElementById('viviendaModal');
    
    if (!modal) {
        console.error('❌ [VIVIENDAS] Modal no encontrado');
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

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            setupModalNoCloseOutside(modal);
        } else {
            alert('Error al cargar vivienda');
        }
    }).catch(error => {
        console.error('❌ [VIVIENDAS] Error:', error);
        alert('Error al cargar vivienda');
    });
}

// ========== CERRAR MODAL ==========
function closeViviendaModal() {
    const modal = document.getElementById('viviendaModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('viviendaForm').reset();
    }
    document.body.style.overflow = 'auto';
    limpiarModalesAnteriores();
}

// ========== GUARDAR VIVIENDA ==========
async function saveVivienda(event) {
    event.preventDefault();
    console.log('💾 [VIVIENDAS] Guardando...');

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

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ ' + data.message);
            closeViviendaModal();
            loadViviendas();
        } else {
            alert('❌ Error: ' + (data.message || 'Error al guardar vivienda'));
        }
    } catch (error) {
        console.error('❌ [VIVIENDAS] Error:', error);
        alert('❌ Error de conexión');
    }
}

// ========== VER DETALLES ==========
async function viewViviendaDetails(id) {
    console.log('👁️ [VIVIENDAS] Cargando detalles:', id);
    
    try {
        const response = await fetch(`/api/viviendas/details?id=${id}`);
        const data = await response.json();
        
        if (data.success && data.vivienda) {
            showViviendaDetailsModal(data.vivienda);
        } else {
            alert('❌ Error al cargar detalles');
        }
    } catch (error) {
        console.error('❌ [VIVIENDAS] Error:', error);
        alert('❌ Error de conexión');
    }
}

// ========== MODAL DE DETALLES ==========
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
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove(); ViviendasModule.edit(${vivienda.id_vivienda})">Editar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

// ========== ASIGNAR VIVIENDA ==========
async function asignarVivienda(viviendaId, numeroVivienda) {
    console.log('👥 [VIVIENDAS] Asignando:', numeroVivienda);
    
    const tipo = prompt(
        `🏠 Asignar Vivienda: ${numeroVivienda}\n\n` +
        `Selecciona el tipo de asignación:\n` +
        `1 = Usuario Individual\n` +
        `2 = Núcleo Familiar\n\n` +
        `Escribe 1 o 2:`
    );
    
    if (!tipo || (tipo !== '1' && tipo !== '2')) {
        return;
    }
    
    const esUsuario = tipo === '1';
    
    try {
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
            alert('❌ No hay ' + (esUsuario ? 'usuarios' : 'núcleos') + ' disponibles');
            return;
        }
        
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
        
        if (!seleccion) return;
        
        const index = parseInt(seleccion) - 1;
        
        if (index < 0 || index >= opciones.length) {
            alert('❌ Selección inválida');
            return;
        }
        
        const opcionSeleccionada = opciones[index];
        
        const nombreMostrar = esUsuario ? 
            opcionSeleccionada.nombre_completo : 
            opcionSeleccionada.nombre_nucleo || 'Núcleo sin nombre';
        
        if (!confirm(`¿Asignar vivienda ${numeroVivienda} a ${nombreMostrar}?`)) {
            return;
        }
        
        const formData = new FormData();
        formData.append('vivienda_id', viviendaId);
        
        if (esUsuario) {
            formData.append('usuario_id', opcionSeleccionada.id_usuario);
        } else {
            formData.append('nucleo_id', opcionSeleccionada.id_nucleo);
        }
        
        const response = await fetch('/api/viviendas/asignar', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ ' + data.message);
            loadViviendas();
        } else {
            alert('❌ Error: ' + data.message);
        }
        
    } catch (error) {
        console.error('❌ [VIVIENDAS] Error:', error);
        alert('❌ Error: ' + error.message);
    }
}

// ========== DESASIGNAR VIVIENDA ==========
async function desasignarVivienda(asignacionId) {
    console.log('🚫 [VIVIENDAS] Desasignando:', asignacionId);
    
    if (!confirm('¿Desasignar esta vivienda?\n\nLos usuarios/núcleo quedarán sin vivienda asignada.')) {
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
            alert('✅ ' + data.message);
            loadViviendas();
        } else {
            alert('❌ Error: ' + data.message);
        }
        
    } catch (error) {
        console.error('❌ [VIVIENDAS] Error:', error);
        alert('❌ Error de conexión');
    }
}

// ========== ELIMINAR VIVIENDA ==========
async function deleteVivienda(id, numero) {
    if (!confirm(`¿Eliminar la vivienda "${numero}"?\n\nNo se puede eliminar si tiene asignaciones activas.`)) {
        return;
    }

    const formData = new FormData();
    formData.append('id', id);

    try {
        const response = await fetch('/api/viviendas/delete', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Vivienda eliminada');
            loadViviendas();
        } else {
            alert('❌ Error: ' + (data.message || 'Error al eliminar'));
        }
    } catch (error) {
        console.error('❌ [VIVIENDAS] Error:', error);
        alert('❌ Error de conexión');
    }
}

// ========== FUNCIONES AUXILIARES ==========

function limpiarModalesAnteriores() {
    const modalesPermanentes = [
        '#viviendaModal',
        '#asignarViviendaModal',
        '#materialModal',
        '#stockModal',
        '#imageModal'
    ];
    
    modalesPermanentes.forEach(selector => {
        const modal = document.querySelector(selector);
        if (modal) {
            modal.style.display = 'none';
        }
    });
    
    const selectoresDinamicos = [
        '.modal-overlay',
        '.modal-detail'
    ];
    
    selectoresDinamicos.forEach(selector => {
        const modales = document.querySelectorAll(selector);
        modales.forEach(modal => modal.remove());
    });
}

function setupModalNoCloseOutside(modal) {
    const newModal = modal.cloneNode(true);
    modal.parentNode.replaceChild(newModal, modal);
    
    const modalContent = newModal.querySelector('.material-modal-content');
    
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

function formatEstadoVivienda(estado) {
    const estados = {
        'disponible': 'Disponible',
        'ocupada': 'Ocupada',
        'mantenimiento': 'Mantenimiento'
    };
    return estados[estado] || estado;
}

// ========== EXPORTAR API PÚBLICA ==========
window.ViviendasModule = {
    version: '1.0.0',
    loaded: false,
    
    // Funciones principales
    init: inicializarModuloViviendas,
    load: loadViviendas,
    loadTipos: loadTiposVivienda,
    showCreateModal: showCreateViviendaModal,
    closeModal: closeViviendaModal,
    save: saveVivienda,
    viewDetails: viewViviendaDetails,
    edit: editVivienda,
    asignar: asignarVivienda,
    desasignar: desasignarVivienda,
    delete: deleteVivienda
};

// ========== AUTO-INICIALIZACIÓN ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarModuloViviendas);
} else {
    inicializarModuloViviendas();
}

console.log('✅ [MÓDULO VIVIENDAS] Cargado completamente');