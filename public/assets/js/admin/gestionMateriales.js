
(function() {
    'use strict';
    

    // Evitar carga duplicada
    if (window.MaterialesModuleCargado) {
        console.warn('⚠️ [MATERIALES] Ya cargado');
        return;
    }
    window.MaterialesModuleCargado = true;

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

    // Variable para almacenar materiales asignados
    let materialesAsignados = [];

    // ========== INICIALIZACIÓN ==========
    function inicializarModuloMateriales() {
     
        
        const materialesMenuItem = document.querySelector('.menu li[data-section="materiales"]');
        if (materialesMenuItem) {
            materialesMenuItem.addEventListener('click', function() {
          
                window.loadMateriales();
            });
        }
        
   
    }

    // ========== CARGAR MATERIALES ==========
    window.loadMateriales = async function() {
   
        
        const container = document.getElementById('materialesTableContainer');

        if (!container) {
            console.error('❌ [MATERIALES] Container no encontrado');
            return;
        }

        container.innerHTML = '<p class="loading">Cargando materiales...</p>';

        try {
            const response = await fetch('/api/materiales/all', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (data.success) {
                renderMaterialesTable(data.materiales);
            } else {
                container.innerHTML = `<p class="error">Error: ${data.message}</p>`;
            }
        } catch (error) {
            console.error('❌ [MATERIALES] Error:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        }
    };

    // ========== RENDERIZAR TABLA ==========
    function renderMaterialesTable(materiales) {
        const container = document.getElementById('materialesTableContainer');

        if (!materiales || materiales.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-box-open" style="font-size: 48px; color: ${COLORS.gray100}; display: block; margin-bottom: 15px;"></i>
                    <p style="color: ${COLORS.gray500}; margin-bottom: 20px;">No hay materiales registrados</p>
                    <button class="btn btn-primary" onclick="MaterialesModule.showCreateModal()">
                        <i class="fas fa-plus"></i> Crear Primer Material
                    </button>
                </div>
            `;
            return;
        }

        let html = `
            <div style="overflow-x: auto; border-radius: 12px; box-shadow: ${COLORS.shadow};">
                <table style="width: 100%; border-collapse: collapse; background: ${COLORS.white}; min-width: 900px;">
                    <thead>
                        <tr style="background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%); color: ${COLORS.white};">
                            <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">ID</th>
                            <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Material</th>
                            <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Características</th>
                            <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Stock</th>
                            <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        materiales.forEach(material => {
            const stock = parseInt(material.stock) || 0;
            
            let stockColor = '';
            let stockText = '';
            let stockIcon = '';
            
            if (stock === 0) {
                stockColor = COLORS.danger;
                stockText = 'Agotado';
                stockIcon = 'fa-times-circle';
            } else if (stock < 10) {
                stockColor = COLORS.warning;
                stockText = 'Stock Bajo';
                stockIcon = 'fa-exclamation-triangle';
            } else {
                stockColor = COLORS.success;
                stockText = 'Disponible';
                stockIcon = 'fa-check-circle';
            }

            html += `
                <tr style="border-bottom: 1px solid ${COLORS.gray100}; transition: all 0.2s ease;" 
                    onmouseover="this.style.background='${COLORS.gray50}'" 
                    onmouseout="this.style.background='${COLORS.white}'">
                    
                    <td style="padding: 14px 12px; text-align: center;">
                        <div style="font-weight: 600; color: ${COLORS.primary}; font-size: 14px;">#${material.id_material}</div>
                    </td>
                    
                    <td style="padding: 14px 12px; font-size: 13px;">
                        <div style="font-weight: 600; color: ${COLORS.gray700}; font-size: 14px;">${material.nombre}</div>
                    </td>
                    
                    <td style="padding: 14px 12px; font-size: 13px; color: ${COLORS.gray700};">
                        ${material.caracteristicas || '<span style="color: ' + COLORS.gray500 + '; font-style: italic;">Sin características</span>'}
                    </td>
                    
                    <td style="padding: 14px 12px; text-align: center;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                            <span style="
                                display: inline-block;
                                padding: 6px 12px;
                                border-radius: 20px;
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                background: ${stockColor};
                                color: ${COLORS.white};
                            ">
                                <i class="fas ${stockIcon}"></i> ${stockText}
                            </span>
                            <span style="font-weight: 700; font-size: 18px; color: ${stockColor};">${stock}</span>
                        </div>
                    </td>
                    
                    <td style="padding: 14px 12px;">
                        <div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap;">
                            
                            <button class="btn-small btn-primary" 
                                    onclick="MaterialesModule.showStockModal(${material.id_material}, '${material.nombre.replace(/'/g, "\\'")}', ${stock})" 
                                    title="Actualizar Stock">
                                <i class="fas fa-boxes"></i>
                            </button>
                            
                            <button class="btn-small btn-primary" 
                                    onclick="MaterialesModule.edit(${material.id_material})" 
                                    title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            
                            <button class="btn-small btn-danger" 
                                    onclick="MaterialesModule.delete(${material.id_material}, '${material.nombre.replace(/'/g, "\\'")}')">
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

    // ========== BUSCAR MATERIALES ==========
    let searchMaterialesTimeout;
    window.searchMateriales = function() {
        clearTimeout(searchMaterialesTimeout);

        searchMaterialesTimeout = setTimeout(() => {
            const searchTerm = document.getElementById('search-materiales')?.value.trim() || '';

            if (searchTerm === '') {
                window.loadMateriales();
                return;
            }

            fetch(`/api/materiales/search?q=${encodeURIComponent(searchTerm)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        renderMaterialesTable(data.materiales);
                    }
                })
                .catch(error => console.error('❌ [MATERIALES] Error:', error));
        }, 300);
    };

    // ========== MOSTRAR MODAL CREAR ==========
    window.showCreateMaterialModal = function() {
   

        limpiarModalesAnteriores();

        const modal = document.getElementById('materialModal');

        if (!modal) {
            console.error('❌ [MATERIALES] Modal no encontrado');
            alert('ERROR: Modal no encontrado en el DOM');
            return;
        }

        document.getElementById('materialModalTitle').textContent = 'Nuevo Material';
        document.getElementById('material-id').value = '';
        document.getElementById('material-nombre').value = '';
        document.getElementById('material-caracteristicas').value = '';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    // ========== EDITAR MATERIAL ==========
    window.editMaterial = async function(id) {


        limpiarModalesAnteriores();

        try {
            const response = await fetch(`/api/materiales/details?id=${id}`);
            const data = await response.json();
            
            if (data.success && data.material) {
                document.getElementById('materialModalTitle').textContent = 'Editar Material';
                document.getElementById('material-id').value = data.material.id_material;
                document.getElementById('material-nombre').value = data.material.nombre;
                document.getElementById('material-caracteristicas').value = data.material.caracteristicas || '';
                document.getElementById('materialModal').style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } else {
                alert('❌ Error al cargar material');
            }
        } catch (error) {
            console.error('❌ [MATERIALES] Error:', error);
            alert('❌ Error al cargar material');
        }
    };

    // ========== CERRAR MODAL ==========
    window.closeMaterialModal = function() {
        const modal = document.getElementById('materialModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('materialForm').reset();
        }
        document.body.style.overflow = 'auto';
        limpiarModalesAnteriores();
    };

    // ========== GUARDAR MATERIAL ==========
    window.saveMaterial = async function(event) {
        event.preventDefault();
      

        const id = document.getElementById('material-id').value;
        const nombre = document.getElementById('material-nombre').value.trim();
        const caracteristicas = document.getElementById('material-caracteristicas').value.trim();

        if (!nombre) {
            alert('⚠️ El nombre es requerido');
            return;
        }

        const materialData = { nombre, caracteristicas };
        const url = id ? '/api/materiales/update' : '/api/materiales/create';

        if (id) {
            materialData.id = id;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(materialData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(' ' + data.message);
                window.closeMaterialModal();
                window.loadMateriales();
            } else {
                alert('❌ Error: ' + (data.message || 'Error al guardar material'));
            }
        } catch (error) {
            console.error('❌ [MATERIALES] Error:', error);
            alert('❌ Error de conexión');
        }
    };

    // ========== ELIMINAR MATERIAL ==========
    window.deleteMaterial = async function(id, nombre) {
        if (!confirm(`¿Eliminar el material "${nombre}"?\n\nNo se puede eliminar si está asignado a tareas.`)) {
            return;
        }

        try {
            const response = await fetch('/api/materiales/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(' Material eliminado');
                window.loadMateriales();
            } else {
                alert('❌ Error: ' + (data.message || 'Error al eliminar'));
            }
        } catch (error) {
            console.error('❌ [MATERIALES] Error:', error);
            alert('❌ Error de conexión');
        }
    };

    // ========== MOSTRAR MODAL STOCK ==========
    window.showStockModal = function(id, nombre, stockActual) {
       
        
        limpiarModalesAnteriores();
        
        document.getElementById('stock-material-id').value = id;
        document.getElementById('stock-material-name').textContent = 'Material: ' + nombre;
        document.getElementById('stock-cantidad').value = stockActual;
        document.getElementById('stockModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    // ========== CERRAR MODAL STOCK ==========
    window.closeStockModal = function() {
        const modal = document.getElementById('stockModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('stockForm').reset();
        }
        document.body.style.overflow = 'auto';
        limpiarModalesAnteriores();
    };

    // ========== ACTUALIZAR STOCK ==========
    window.updateStock = async function(event) {
        event.preventDefault();


        const id = document.getElementById('stock-material-id').value;
        const cantidad = parseInt(document.getElementById('stock-cantidad').value);

        if (cantidad < 0) {
            alert('⚠️ La cantidad no puede ser negativa');
            return;
        }

        try {
            const response = await fetch('/api/materiales/update-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, cantidad })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(' Stock actualizado');
                window.closeStockModal();
                window.loadMateriales();
            } else {
                alert('❌ Error: ' + (data.message || 'Error al actualizar stock'));
            }
        } catch (error) {
            console.error('❌ [MATERIALES] Error:', error);
            alert('❌ Error de conexión');
        }
    };

    // ========== CARGAR MATERIALES PARA TAREA ==========
    window.loadMaterialesParaTarea = async function() {


        const container = document.getElementById('materiales-tarea-list');

        if (!container) {
            console.error('❌ [MATERIALES] Container materiales-tarea-list no encontrado');
            return;
        }

        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando materiales disponibles...</p>
            </div>
        `;

        try {
            const response = await fetch('/api/materiales/all', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (data.success) {
                renderMaterialesSelectorTarea(data.materiales);
            } else {
                container.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Error al cargar materiales: ${data.message}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ [MATERIALES] Error:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-times-circle"></i>
                    <p>Error de conexión</p>
                </div>
            `;
        }
    };

    // ========== RENDERIZAR SELECTOR DE MATERIALES ==========
    function renderMaterialesSelectorTarea(materiales) {
        const container = document.getElementById('materiales-tarea-list');

        if (!materiales || materiales.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                    <p style="color: #666; margin-bottom: 12px; font-size: 16px;">No hay materiales en el inventario</p>
                    <a href="#" 
                       onclick="event.preventDefault(); document.querySelector('[data-section=\\'materiales\\']').click();" 
                       class="btn btn-primary btn-small">
                        <i class="fas fa-plus"></i> Crear Primer Material
                    </a>
                </div>
            `;
            return;
        }

        const materialesDisponibles = materiales.filter(m => (parseInt(m.stock) || 0) > 0);
        const materialesAgotados = materiales.filter(m => (parseInt(m.stock) || 0) === 0);

        let html = '';

        html += `
            <div class="materiales-summary">
                <div class="summary-item">
                    <i class="fas fa-boxes"></i>
                    <span><strong>${materiales.length}</strong> materiales totales</span>
                </div>
                <div class="summary-item success">
                    <i class="fas fa-check-circle"></i>
                    <span><strong>${materialesDisponibles.length}</strong> disponibles</span>
                </div>
                ${materialesAgotados.length > 0 ? `
                    <div class="summary-item error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span><strong>${materialesAgotados.length}</strong> agotados</span>
                    </div>
                ` : ''}
            </div>
        `;

        if (materialesDisponibles.length > 0) {
            html += '<div class="materiales-section">';
            html += '<h4 class="section-subtitle"><i class="fas fa-check-circle"></i> Materiales Disponibles</h4>';
            
            html += materialesDisponibles.map(material => {
                const stock = parseInt(material.stock) || 0;
                const stockClass = stock < 10 ? 'bajo' : 'disponible';

                return `
                    <div class="material-selector-item expanded" data-material-id="${material.id_material}">
                        <div class="material-selector-header">
                            <div class="material-icon">
                                <i class="fas fa-box"></i>
                            </div>
                            <div class="material-selector-info">
                                <div class="material-selector-name">
                                    <strong>${material.nombre}</strong>
                                    <span class="stock-badge-small ${stockClass}">
                                        <i class="fas fa-warehouse"></i> ${stock} unidades
                                    </span>
                                </div>
                                ${material.caracteristicas ? `
                                    <div class="material-description">
                                        <i class="fas fa-info-circle"></i> ${material.caracteristicas}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="material-selector-actions">
                            <div class="quantity-control">
                                <label for="cantidad-${material.id_material}">Cantidad:</label>
                                <input type="number" 
                                       class="material-cantidad-input" 
                                       id="cantidad-${material.id_material}"
                                       min="1" 
                                       max="${stock}"
                                       value="1"
                                       placeholder="Cant.">
                                <span class="max-available">máx: ${stock}</span>
                            </div>
                            <button type="button" 
                                    class="btn btn-primary btn-add-material" 
                                    onclick="MaterialesModule.addToTask(${material.id_material}, '${material.nombre.replace(/'/g, "\\'")}', ${stock})"
                                    title="Agregar a la tarea">
                                <i class="fas fa-plus"></i> Agregar
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            html += '</div>';
        }

        if (materialesAgotados.length > 0) {
            html += `
                <div class="materiales-section agotados">
                    <h4 class="section-subtitle collapsed" onclick="MaterialesModule.toggleAgotados()">
                        <i class="fas fa-chevron-right"></i> 
                        Materiales Agotados (${materialesAgotados.length})
                    </h4>
                    <div class="agotados-list" style="display: none;">
                        ${materialesAgotados.map(material => `
                            <div class="material-selector-item agotado">
                                <div class="material-selector-info">
                                    <div class="material-selector-name">
                                        <strong>${material.nombre}</strong>
                                        <span class="stock-badge-small agotado">
                                            <i class="fas fa-times-circle"></i> Sin stock
                                        </span>
                                    </div>
                                    ${material.caracteristicas ? `<small style="color: #999;">${material.caracteristicas}</small>` : ''}
                                </div>
                                <button type="button" class="btn btn-secondary btn-small" disabled>
                                    <i class="fas fa-ban"></i> No disponible
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    // ========== TOGGLE SECCIÓN AGOTADOS ==========
    window.toggleAgotadosSection = function() {
        const subtitle = document.querySelector('.section-subtitle.collapsed');
        const list = document.querySelector('.agotados-list');
        const icon = subtitle.querySelector('i');
        
        if (list.style.display === 'none') {
            list.style.display = 'block';
            icon.className = 'fas fa-chevron-down';
            subtitle.classList.remove('collapsed');
        } else {
            list.style.display = 'none';
            icon.className = 'fas fa-chevron-right';
            subtitle.classList.add('collapsed');
        }
    };

    // ========== AGREGAR MATERIAL A TAREA ==========
    window.addMaterialToTask = function(materialId, materialNombre, stockDisponible) {
      

        const cantidadInput = document.getElementById(`cantidad-${materialId}`);
        const cantidad = parseInt(cantidadInput.value);

        if (!cantidad || cantidad <= 0) {
            alert('⚠️ Ingresa una cantidad válida');
            return;
        }

        if (cantidad > stockDisponible) {
            alert(`⚠️ Solo hay ${stockDisponible} unidades disponibles`);
            return;
        }

        const existente = materialesAsignados.find(m => m.id === materialId);
        if (existente) {
            existente.cantidad = cantidad;
            alert(' Cantidad actualizada');
        } else {
            materialesAsignados.push({
                id: materialId,
                nombre: materialNombre,
                cantidad: cantidad,
                stock: stockDisponible
            });
        }

        cantidadInput.value = '';
        window.renderMaterialesAsignados();
    };

    // ========== RENDERIZAR MATERIALES ASIGNADOS ==========
    window.renderMaterialesAsignados = function() {
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
                            onclick="MaterialesModule.removeFromTask(${material.id})"
                            title="Quitar material">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('')}
        `;
    };

    // ========== QUITAR MATERIAL DE TAREA ==========
    window.removeMaterialFromTask = function(materialId) {
        materialesAsignados = materialesAsignados.filter(m => m.id !== materialId);
        window.renderMaterialesAsignados();
    };

    // ========== FILTRAR MATERIALES PARA TAREA ==========
    window.filterMaterialesTarea = function() {
        const searchTerm = document.getElementById('search-materiales-tarea')?.value.toLowerCase() || '';
        const items = document.querySelectorAll('.material-selector-item');

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    };

    // ========== LIMPIAR MATERIALES ASIGNADOS ==========
    window.clearMaterialesAsignados = function() {
        materialesAsignados = [];
        window.renderMaterialesAsignados();
    };

    // ========== FUNCIONES AUXILIARES ==========
    function limpiarModalesAnteriores() {
        const modalesPermanentes = [
            '#materialModal',
            '#stockModal'
        ];
        
        modalesPermanentes.forEach(selector => {
            const modal = document.querySelector(selector);
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    // ========== EXPORTAR API PÚBLICA ==========
    window.MaterialesModule = {
        version: '1.0.0',
        
        // Getter para materiales asignados
        get materialesAsignados() {
            return materialesAsignados;
        },
        
        // Funciones principales
        init: inicializarModuloMateriales,
        load: window.loadMateriales,
        search: window.searchMateriales,
        showCreateModal: window.showCreateMaterialModal,
        closeModal: window.closeMaterialModal,
        save: window.saveMaterial,
        edit: window.editMaterial,
        delete: window.deleteMaterial,
        showStockModal: window.showStockModal,
        closeStockModal: window.closeStockModal,
        updateStock: window.updateStock,
        
        // Para tareas
        loadForTask: window.loadMaterialesParaTarea,
        addToTask: window.addMaterialToTask,
        removeFromTask: window.removeMaterialFromTask,
        renderAsignados: window.renderMaterialesAsignados,
        clearAsignados: window.clearMaterialesAsignados,
        filterForTask: window.filterMaterialesTarea,
        toggleAgotados: window.toggleAgotadosSection
    };

    // ========== AUTO-INICIALIZACIÓN ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarModuloMateriales);
    } else {
        inicializarModuloMateriales();
    }


})();