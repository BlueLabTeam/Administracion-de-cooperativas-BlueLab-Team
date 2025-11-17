const GestionUsuarios = (function() {
    'use strict';

    // ==========================================
    // CONSTANTES DEL MÓDULO
    // ==========================================
    
    const ENDPOINTS = {
        ALL: '/api/users/all',
        DETAILS: '/api/users/details',
        PAYMENT_DETAILS: '/api/users/payment-details',
        APROBAR_RECHAZAR: '/api/users/aprobar-rechazar',
        APPROVE_PAYMENT: '/api/payment/approve',
        REJECT_PAYMENT: '/api/payment/reject'
    };

    const ESTADOS = {
        'pendiente': 'Pendiente',
        'enviado': 'Enviado',
        'aceptado': 'Aceptado',
        'rechazado': 'Rechazado',
        'activo': 'Activo',
        'inactivo': 'Inactivo'
    };

    const COLORS = {
        primary: '#005CB9',
        primaryLight: '#E3F2FD',
        white: '#FFFFFF',
        gray100: '#F5F7FA',
        gray500: '#6C757D',
        gray700: '#495057',
        shadow: '0 4px 12px rgba(0, 92, 185, 0.12)'
    };

    // ==========================================
    // FUNCIONES PRIVADAS
    // ==========================================

    /**
     * Formatear estado de usuario
     */
    function formatEstadoUsuario(estado) {
        return ESTADOS[estado] || estado;
    }

    /**
     * Formatear fecha
     */
    function formatFecha(fecha) {
        if (!fecha) return '-';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-UY', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    }

    /**
     * Limpiar modales anteriores
     */
    function limpiarModalesAnteriores() {
        const modales = document.querySelectorAll('.user-detail-modal, #detallesPagoModal');
        modales.forEach(modal => modal.remove());
        document.body.style.overflow = '';
    }

    /**
     * Mostrar modal con detalles de usuario
     */
    function mostrarModalDetallesUsuario(user) {
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
                 onclick="if(event.target.classList.contains('user-detail-modal')) { GestionUsuarios.cerrarModales(); }">
                
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
                            onclick="GestionUsuarios.cerrarModales()"
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
                            background: ${user.estado === 'aceptado' ? '#4CAF50' : user.estado === 'rechazado' ? '#F44336' : '#FF9800'};
                            color: white;
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
                            <span>${formatFecha(user.fecha_nacimiento)}</span>
                        </p>
                        <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                            <strong style="min-width: 150px; color: ${COLORS.primary};">
                                <i class="fas fa-calendar-plus"></i> Fecha Ingreso:
                            </strong>
                            <span>${formatFecha(user.fecha_ingreso)}</span>
                        </p>
                        <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                            <strong style="min-width: 150px; color: ${COLORS.primary};">
                                <i class="fas fa-user-tag"></i> Rol:
                            </strong>
                            <span>${user.nombre_rol || 'Sin rol'}</span>
                        </p>
                        <p style="margin: 10px 0; display: flex; align-items: center; gap: 10px; color: ${COLORS.gray700};">
                            <strong style="min-width: 150px; color: ${COLORS.primary};">
                                <i class="fas fa-users"></i> Núcleo:
                            </strong>
                            <span>${user.nombre_nucleo || 'Sin núcleo'}</span>
                        </p>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: right;">
                        <button class="btn btn-secondary" 
                                onclick="GestionUsuarios.cerrarModales()"
                                style="
                                    padding: 10px 20px;
                                    background: #6C757D;
                                    color: white;
                                    border: none;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    font-size: 14px;
                                ">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    /**
     * Renderizar fila de usuario
     */
    function renderUserRow(user) {
        const hasPayment = user.comprobante_archivo && user.comprobante_archivo !== '';
        const isPending = user.estado === 'pendiente' || user.estado === 'enviado';
        const isApproved = user.estado === 'aceptado';
        const isRejected = user.estado === 'rechazado';
        
        // Colores según estado
        let estadoColor = '';
        let estadoText = '';
        if (user.estado === 'enviado') {
            estadoColor = '#FF9800';
            estadoText = 'Pendiente';
        } else if (user.estado === 'aceptado') {
            estadoColor = '#4CAF50';
            estadoText = 'Aprobado';
        } else if (user.estado === 'rechazado') {
            estadoColor = '#F44336';
            estadoText = 'Rechazado';
        } else if (user.estado === 'activo') {
            estadoColor = '#4CAF50';
            estadoText = 'Activo';
        } else if (user.estado === 'inactivo') {
            estadoColor = '#9E9E9E';
            estadoText = 'Inactivo';
        } else {
            estadoColor = '#6C757D';
            estadoText = formatEstadoUsuario(user.estado);
        }

        const esAdmin = user.nombre_rol === 'Administrador' || user.nombre_rol === 'Admin';
        const rolColor = esAdmin ? '#005CB9' : '#6C757D';

        return `
            <tr style="border-bottom: 1px solid #E8EBF0; transition: all 0.2s ease;" 
                onmouseover="this.style.background='#F5F7FA'" 
                onmouseout="this.style.background='#FFFFFF'"
                data-estado="${user.estado}">
                
                <td style="padding: 14px 12px; text-align: center;">
                    <div style="font-weight: 600; color: #005CB9; font-size: 14px;">#${user.id_usuario}</div>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px;">
                    <div style="font-weight: 600; color: #495057;">${user.nombre_completo}</div>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px; color: #495057;">
                    ${user.cedula}
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px;">
                    <div style="color: #6C757D;">${user.email}</div>
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
                
                <td style="padding: 14px 12px; text-align: center;">
                    <span style="
                        font-weight: 600;
                        color: ${rolColor};
                        font-size: 13px;
                    ">${user.nombre_rol || 'Sin rol'}</span>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px; color: #495057;">
                    ${user.nombre_nucleo || '<span style="color: #6C757D; font-style: italic;">Sin núcleo</span>'}
                </td>
                
                <td style="padding: 14px 12px;">
                    <div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap;">
                        
                        <button class="btn-small btn-secondary" 
                                onclick="GestionUsuarios.verDetalles(${user.id_usuario})"
                                title="Ver detalles"
                                style="
                                    padding: 5px 10px;
                                    background: #6C757D;
                                    color: white;
                                    border: none;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    font-size: 12px;
                                ">
                            <i class="fas fa-eye"></i>
                        </button>
                        
                        ${hasPayment && isPending ? `
                            <button class="btn-small btn-info" 
                                    onclick="GestionUsuarios.verDetallesPago(${user.id_usuario})"
                                    title="Ver detalles de pago"
                                    style="
                                        padding: 5px 10px;
                                        background: #17a2b8;
                                        color: white;
                                        border: none;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-size: 12px;
                                    ">
                                <i class="fas fa-file-invoice-dollar"></i>
                            </button>
                        ` : ''}
                        
                        ${isPending ? `
                            <button class="btn-small btn-success" 
                                    onclick="GestionUsuarios.aprobarUsuario(${user.id_usuario}, '${user.nombre_completo.replace(/'/g, "\\'")}')"
                                    id="aprobar-btn-${user.id_usuario}"
                                    title="Aprobar registro"
                                    style="
                                        padding: 5px 10px;
                                        background: ${!hasPayment ? '#ccc' : '#28a745'};
                                        color: white;
                                        border: none;
                                        border-radius: 4px;
                                        cursor: ${!hasPayment ? 'not-allowed' : 'pointer'};
                                        font-size: 12px;
                                    "
                                    ${!hasPayment ? 'disabled' : ''}>
                                <i class="fas fa-user-check"></i>
                            </button>
                            <button class="btn-small btn-danger" 
                                    onclick="GestionUsuarios.rechazarUsuario(${user.id_usuario}, '${user.nombre_completo.replace(/'/g, "\\'")}')"
                                    id="rechazar-btn-${user.id_usuario}"
                                    title="Rechazar registro"
                                    style="
                                        padding: 5px 10px;
                                        background: #dc3545;
                                        color: white;
                                        border: none;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-size: 12px;
                                    ">
                                <i class="fas fa-user-times"></i>
                            </button>
                        ` : ''}
                        
                        ${isApproved ? `
                            <span style="color: #4CAF50; font-weight: 600; padding: 5px;">
                                <i class="fas fa-check-circle"></i> Aprobado
                            </span>
                        ` : ''}
                        
                        ${isRejected ? `
                            <span style="color: #F44336; font-weight: 600; padding: 5px;">
                                <i class="fas fa-times-circle"></i> Rechazado
                            </span>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Mostrar modal con detalles de pago
     */
    function mostrarModalDetallesPago(pago, usuario) {
        limpiarModalesAnteriores();

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
                 onclick="if(event.target.id === 'detallesPagoModal') GestionUsuarios.cerrarModales()">
                
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
                            onclick="GestionUsuarios.cerrarModales()">&times;</button>
                    
                    <h2 style="color: #005CB9; margin-bottom: 20px;">
                        <i class="fas fa-file-invoice-dollar"></i> Detalles de Pago
                    </h2>
                    
                    <div style="background: #E3F2FD; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #005CB9; margin-bottom: 15px;"> Información del Usuario</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                            <div><strong>Nombre:</strong> ${usuario.nombre_completo}</div>
                            <div><strong>Cédula:</strong> ${usuario.cedula}</div>
                            <div><strong>Email:</strong> ${usuario.email}</div>
                            <div><strong>Estado:</strong> <span class="estado-badge estado-${usuario.estado}">${formatEstadoUsuario(usuario.estado)}</span></div>
                        </div>
                    </div>
                    
                    ${pago ? `
                        <div style="background: #F5F7FA; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="color: #005CB9; margin-bottom: 15px;"> Información del Pago</h3>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                                <div><strong>Fecha:</strong> ${formatFecha(pago.fecha_pago)}</div>
                                <div><strong>Monto:</strong> $${parseFloat(pago.monto).toLocaleString('es-UY', {minimumFractionDigits: 2})}</div>
                                <div><strong>Estado:</strong> <span class="badge badge-${pago.estado_validacion}">${pago.estado_validacion}</span></div>
                                <div><strong>Tipo:</strong> ${pago.tipo_pago}</div>
                            </div>
                            
                            ${pago.comprobante_archivo ? `
                                <div style="text-align: center;">
                                    <img src="/files/?path=${pago.comprobante_archivo}" 
                                         style="max-width: 100%; max-height: 400px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); cursor: pointer;"
                                         onclick="window.open('/files/?path=${pago.comprobante_archivo}', '_blank')">
                                    <p style="margin-top: 10px; color: #6C757D; font-size: 12px;">
                                        <i class="fas fa-info-circle"></i> Haz clic en la imagen para ampliar
                                    </p>
                                </div>
                            ` : '<p style="color: #999; text-align: center; padding: 20px;">Sin comprobante adjunto</p>'}
                        </div>
                        
                        ${pago.estado_validacion === 'pendiente' ? `
                            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                                <button class="btn btn-danger" 
                                        onclick="GestionUsuarios.rechazarPagoDesdeModal(${pago.id_pago}, ${usuario.id_usuario})"
                                        style="
                                            padding: 10px 20px;
                                            background: #dc3545;
                                            color: white;
                                            border: none;
                                            border-radius: 5px;
                                            cursor: pointer;
                                        ">
                                    <i class="fas fa-times"></i> Rechazar Pago
                                </button>
                                <button class="btn btn-success" 
                                        onclick="GestionUsuarios.aprobarPagoDesdeModal(${pago.id_pago}, ${usuario.id_usuario})"
                                        style="
                                            padding: 10px 20px;
                                            background: #28a745;
                                            color: white;
                                            border: none;
                                            border-radius: 5px;
                                            cursor: pointer;
                                        ">
                                    <i class="fas fa-check"></i> Aprobar Pago
                                </button>
                            </div>
                        ` : ''}
                    ` : `
                        <div style="text-align: center; padding: 40px;">
                            <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; display: block; margin-bottom: 15px;"></i>
                            <p style="color: #6C757D;">No hay información de pago disponible</p>
                        </div>
                    `}
                    
                    <div style="text-align: right; margin-top: 20px;">
                        <button class="btn btn-secondary" 
                                onclick="GestionUsuarios.cerrarModales()"
                                style="
                                    padding: 10px 20px;
                                    background: #6C757D;
                                    color: white;
                                    border: none;
                                    border-radius: 5px;
                                    cursor: pointer;
                                ">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
        document.body.style.overflow = 'hidden';
    }

    // ==========================================
    // API PÚBLICA DEL MÓDULO
    // ==========================================

    return {
        /**
         * Cerrar todos los modales
         */
        cerrarModales: function() {
            limpiarModalesAnteriores();
        },

        /**
         * Cargar todos los usuarios
         */
        cargarUsuarios: async function() {
            const container = document.getElementById('usersTableContainer');

            if (!container) {
                console.error('✗ [USUARIOS] Container no encontrado');
                return;
            }

            container.innerHTML = '<p class="loading">Cargando usuarios...</p>';

            try {
                const response = await fetch(ENDPOINTS.ALL, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin'
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.success) {
                    this.renderizarTabla(data.users);
                } else {
                    container.innerHTML = `<p class="error">Error: ${data.message}</p>`;
                }

            } catch (error) {
                console.error('✗ [USUARIOS] Error:', error);
                container.innerHTML = `
                    <div class="error">
                        <h3>Error de conexión</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-secondary" onclick="GestionUsuarios.cargarUsuarios()">Reintentar</button>
                    </div>
                `;
            }
        },

        /**
         * Renderizar tabla de usuarios
         */
        renderizarTabla: function(users) {
            const container = document.getElementById('usersTableContainer');

            if (!users || users.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px;">
                        <i class="fas fa-user-friends" style="font-size: 48px; color: #E8EBF0; display: block; margin-bottom: 15px;"></i>
                        <p style="color: #6C757D;">No hay usuarios disponibles</p>
                    </div>
                `;
                return;
            }

            let html = `
                <div style="overflow-x: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 92, 185, 0.12);">
                    <table style="width: 100%; border-collapse: collapse; background: #FFFFFF; min-width: 1400px;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #005CB9 0%, #004494 100%); color: #FFFFFF;">
                                <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">ID</th>
                                <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Nombre</th>
                                <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Cédula</th>
                                <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Email</th>
                                <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Estado</th>
                                <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Rol</th>
                                <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;">Núcleo</th>
                                <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            users.forEach(user => {
                html += renderUserRow(user);
            });

            html += '</tbody></table></div>';
            container.innerHTML = html;
        },

        /**
         * Ver detalles de usuario
         */
        verDetalles: async function(userId) {
            console.log('🔍 [USUARIOS] Cargando detalles del usuario:', userId);

            try {
                const response = await fetch(`${ENDPOINTS.DETAILS}?id_usuario=${userId}`);
                
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                
                const data = await response.json();

                if (data.success && data.user) {
                    mostrarModalDetallesUsuario(data.user);
                } else {
                    alert('❌ Error: ' + (data.message || 'No se pudieron cargar los detalles'));
                }
            } catch (error) {
                console.error('✗ [USUARIOS] Error:', error);
                alert('❌ Error de conexión: ' + error.message);
            }
        },

        /**
         * Ver detalles de pago
         */
        verDetallesPago: async function(userId) {
            try {
                const response = await fetch(`${ENDPOINTS.PAYMENT_DETAILS}?id_usuario=${userId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    mostrarModalDetallesPago(data.pago, data.usuario);
                } else {
                    alert('✗ Error: ' + data.message);
                }
            } catch (error) {
                console.error('✗ [USUARIOS] Error:', error);
                alert('✗ Error al cargar detalles de pago: ' + error.message);
            }
        },

        /**
         * Aprobar usuario
         */
        aprobarUsuario: async function(userId, nombreUsuario) {
            if (!confirm(`¿Aprobar el registro de ${nombreUsuario}?\n\nEl usuario podrá acceder al sistema.`)) {
                return;
            }
            
            try {
                const formData = new FormData();
                formData.append('id_usuario', userId);
                formData.append('accion', 'aprobar');
                
                const response = await fetch(ENDPOINTS.APROBAR_RECHAZAR, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('✓ Usuario aprobado correctamente');
                    this.cargarUsuarios();
                } else {
                    alert('✗ Error: ' + data.message);
                }
            } catch (error) {
                console.error('✗ [USUARIOS] Error:', error);
                alert('✗ Error de conexión');
            }
        },

        /**
         * Rechazar usuario
         */
        rechazarUsuario: async function(userId, nombreUsuario) {
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
                
                const response = await fetch(ENDPOINTS.APROBAR_RECHAZAR, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('✓ Usuario rechazado');
                    this.cargarUsuarios();
                } else {
                    alert('✗ Error: ' + data.message);
                }
            } catch (error) {
                console.error('✗ [USUARIOS] Error:', error);
                alert('✗ Error de conexión');
            }
        },

        /**
         * Aprobar pago desde modal
         */
        aprobarPagoDesdeModal: async function(pagoId, userId) {
            this.cerrarModales();
            
            if (!confirm('¿Aprobar este pago?\n\nEl usuario será notificado.')) {
                return;
            }

            try {
                const formData = new FormData();
                formData.append('id_usuario', userId);

                const response = await fetch(ENDPOINTS.APPROVE_PAYMENT, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    alert('✓ Pago aprobado correctamente');
                    this.cargarUsuarios();
                } else {
                    alert('✗ Error: ' + data.message);
                }
            } catch (error) {
                console.error('✗ [USUARIOS] Error:', error);
                alert('✗ Error de conexión');
            }
        },

        /**
         * Rechazar pago desde modal
         */
        rechazarPagoDesdeModal: async function(pagoId, userId) {
            this.cerrarModales();

            const motivo = prompt('¿Por qué rechazas este pago? (opcional)');
            if (motivo === null) return;

            if (!confirm('¿Confirmas el rechazo del pago?')) {
                return;
            }

            try {
                const formData = new FormData();
                formData.append('id_usuario', userId);
                formData.append('motivo', motivo || 'Sin motivo especificado');

                const response = await fetch(ENDPOINTS.REJECT_PAYMENT, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    alert('✓ Pago rechazado');
                    this.cargarUsuarios();
                } else {
                    alert('✗ Error: ' + data.message);
                }
            } catch (error) {
                console.error('✗ [USUARIOS] Error:', error);
                alert('✗ Error de conexión');
            }
        },

        /**
         * Filtrar usuarios
         */
        filtrarUsuarios: function() {
            const estadoFilter = document.getElementById('filtro-estado-usuarios')?.value.toLowerCase() || '';
            const searchText = document.getElementById('search-users')?.value.toLowerCase() || '';
            const rows = document.querySelectorAll('#usersTableContainer tbody tr');

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
        },

        /**
         * Inicializar módulo
         */
        inicializar: function() {
            // Listener para sección de usuarios
            const usuariosMenuItem = document.querySelector('.menu li[data-section="usuarios"]');
            if (usuariosMenuItem) {
                usuariosMenuItem.addEventListener('click', () => {
                    this.cargarUsuarios();
                });
            }

            // Listeners para filtros
            const filtroEstado = document.getElementById('filtro-estado-usuarios');
            if (filtroEstado) {
                filtroEstado.addEventListener('change', () => this.filtrarUsuarios());
            }

            const searchInput = document.getElementById('search-users');
            if (searchInput) {
                searchInput.addEventListener('input', () => this.filtrarUsuarios());
            }
        }
    };
})();

// ==========================================
// INICIALIZACIÓN AUTOMÁTICA
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    GestionUsuarios.inicializar();
});

// ==========================================
// EXPORTAR A WINDOW (RETROCOMPATIBILIDAD)
// ==========================================

window.GestionUsuarios = GestionUsuarios;
window.loadUsersForTable = () => GestionUsuarios.cargarUsuarios();
window.viewUserDetails = (userId) => GestionUsuarios.verDetalles(userId);
window.aprobarUsuario = (userId, nombre) => GestionUsuarios.aprobarUsuario(userId, nombre);
window.rechazarUsuario = (userId, nombre) => GestionUsuarios.rechazarUsuario(userId, nombre);
window.verDetallesPago = (userId) => GestionUsuarios.verDetallesPago(userId);
window.filterUsers = () => GestionUsuarios.filtrarUsuarios();
window.limpiarModalesAnteriores = () => GestionUsuarios.cerrarModales();
window.showUserDetailModal = (user) => {
    // Función de compatibilidad que usa la función interna
    const mostrarModalDetallesUsuario = function(user) {
        GestionUsuarios.verDetalles(user.id_usuario);
    };
    mostrarModalDetallesUsuario(user);
};

console.log('✓ Módulo de Gestión de Usuarios cargado correctamente');