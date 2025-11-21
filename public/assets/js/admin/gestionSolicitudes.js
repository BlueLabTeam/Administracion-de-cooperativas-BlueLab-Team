
console.log('🟢 [SOLICITUDES] Cargando módulo de solicitudes ADMIN');

// ========== UTILIDADES ==========
const Utils = {
    formatTipoSolicitud: function(tipo) {
        const tipos = {
            'horas': '<span data-i18n="dashboardAdmin.requests.typeHours">Registro de Horas</span>',
            'pago': '<span data-i18n="dashboardAdmin.requests.typePayment">Pagos/Cuotas</span>',
            'vivienda': '<span data-i18n="dashboardAdmin.requests.typeHousing">Vivienda</span>',
            'general': '<span data-i18n="dashboardAdmin.requests.typeGeneral">Consulta General</span>',
            'otro': '<span data-i18n="dashboardAdmin.requests.typeOther">Otro</span>'
        };
        return tipos[tipo] || tipo;
    },



    formatEstado: function(estado) {
    const estados = {
        'pendiente': '<span data-i18n="common.statusPending">Pendiente</span>',
        'en_revision': '<span data-i18n="dashboardAdmin.requests.inReview">En Revisión</span>',
        'resuelta': '<span data-i18n="dashboardAdmin.requests.resolved">Resuelta</span>',
        'rechazada': '<span data-i18n="common.statusRejected">Rechazada</span>'
    };
    return estados[estado] || estado;
},


    formatPrioridad: function(prioridad) {
    const prioridades = {
        'baja': '<span data-i18n="common.priorityLow">Baja</span>',
        'media': '<span data-i18n="common.priorityMedium">Media</span>',
        'alta': '<span data-i18n="common.priorityHigh">Alta</span>'
    };
    return prioridades[prioridad] || prioridad;
}
};

// ========== OBJETO PRINCIPAL ==========
const SolicitudesAdmin = {
    
    // ========== INICIALIZACIÓN ==========
    init: async function() {

        await this.loadAllSolicitudes();
        await this.loadEstadisticas();
    },

    // ========== CARGAR TODAS LAS SOLICITUDES ==========
    loadAllSolicitudes: async function() {
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
                this.renderSolicitudes(data.solicitudes);
            } else {
                container.innerHTML = '<p class="error">Error al cargar solicitudes</p>';
            }

        } catch (error) {
            console.error(' Error:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        }
    },

    // ========== RENDERIZAR SOLICITUDES ==========
    renderSolicitudes: function(solicitudes) {
        const container = document.getElementById('solicitudesAdminContainer');

        if (!solicitudes || solicitudes.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-inbox" style="font-size: 48px; color: #E8EBF0; display: block; margin-bottom: 15px;"></i>
                    <p style="color: #6C757D;">No hay solicitudes con los filtros seleccionados</p>
                </div>
            `;
            return;
        }

        let html = `
            <div style="overflow-x: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 92, 185, 0.12);">
                <table style="width: 100%; border-collapse: collapse; background: #FFFFFF; min-width: 1200px;">
                    <thead>
                    <tr style="background: linear-gradient(135deg, #005CB9 0%, #004494 100%); color: #FFFFFF;">
   <tr style="background: linear-gradient(135deg, #005CB9 0%, #004494 100%); color: #FFFFFF;">

    <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;"
        data-i18n="dashboardAdmin.requests.columnUser">Usuario</th>

    <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;"
        data-i18n="dashboardAdmin.requests.columnSubject">Asunto</th>

    <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;"
        data-i18n="dashboardAdmin.requests.columnType">Tipo</th>

    <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;"
        data-i18n="dashboardAdmin.requests.columnStatus">Estado</th>

    <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;"
        data-i18n="dashboardAdmin.requests.columnPriority">Prioridad</th>

    <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;"
        data-i18n="dashboardAdmin.requests.columnDate">Fecha</th>

    <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;"
        data-i18n="dashboardAdmin.requests.columnReplies">Respuestas</th>

    <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;"
        data-i18n="dashboardAdmin.requests.columnActions">Acciones</th>



</tr>

                        </tr>
                    </thead>
                    <tbody>
        `;

        solicitudes.forEach(sol => {
            html += this.renderSolicitudRow(sol);
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
        i18n.translatePage();
    },

    // ========== RENDERIZAR FILA DE SOLICITUD ==========
    renderSolicitudRow: function(sol) {
        const fecha = new Date(sol.fecha_creacion).toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const estadoColores = {
            'pendiente': '#FF9800',
            'en_revision': '#005CB9',
            'resuelta': '#4CAF50',
            'rechazada': '#F44336'
        };

        const prioridadColores = {
            'baja': '#6C757D',
            'media': '#FF9800',
            'alta': '#F44336'
        };

        const estadoColor = estadoColores[sol.estado] || '#6C757D';
        const prioridadColor = prioridadColores[sol.prioridad] || '#6C757D';

        return `
            <tr style="border-bottom: 1px solid #E8EBF0; transition: all 0.2s ease;" 
                onmouseover="this.style.background='#F5F7FA'" 
                onmouseout="this.style.background='#FFFFFF'">
                
                <td style="padding: 14px 12px; font-size: 13px;">
                    <div style="font-weight: 600; color: #005CB9;">${sol.nombre_completo}</div>
                    <div style="font-size: 11px; color: #6C757D; margin-top: 3px;">${sol.email}</div>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px; color: #495057; max-width: 300px;">
                    <div style="font-weight: 600; margin-bottom: 5px;">${sol.asunto}</div>
                    <div style="font-size: 11px; color: #6C757D; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${sol.descripcion.substring(0, 100)}...
                    </div>
                </td>
                
                <td style="padding: 14px 12px; font-size: 13px; color: #495057;">
                    ${Utils.formatTipoSolicitud(sol.tipo_solicitud)}
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
                    ">${Utils.formatEstado(sol.estado)}</span>
                </td>
                
                <td style="padding: 14px 12px; text-align: center;">
                    <span style="
                        display: inline-block;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 600;
                        text-transform: uppercase;
                        background: ${prioridadColor};
                        color: #FFFFFF;
                    ">${Utils.formatPrioridad(sol.prioridad)}</span>
                </td>
                
                <td style="padding: 14px 12px; text-align: center; font-size: 13px; color: #495057;">
                    ${fecha}
                </td>
                
                <td style="padding: 14px 12px; text-align: center;">
                    <span style="
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        background: ${(sol.total_respuestas || 0) > 0 ? '#4CAF50' : '#E8EBF0'};
                        color: ${(sol.total_respuestas || 0) > 0 ? '#FFFFFF' : '#6C757D'};
                        font-weight: 600;
                        font-size: 12px;
                    ">${sol.total_respuestas || 0}</span>
                </td>
                
                <td style="padding: 14px 12px;">
                    <div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn-small btn-primary" 
                                onclick="SolicitudesAdmin.verDetalle(${sol.id_solicitud})" 
                                title="Ver detalle">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-small btn-primary" 
                                onclick="SolicitudesAdmin.responder(${sol.id_solicitud})" 
                                title="Responder">
                            <i class="fas fa-reply"></i>
                        </button>
                        ${sol.estado !== 'resuelta' && sol.estado !== 'rechazada' ? `
                            <button class="btn-small btn-success"
                                    onclick="SolicitudesAdmin.cambiarEstado(${sol.id_solicitud}, 'resuelta')" 
                                    title="Marcar como resuelta">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    },

    // ========== CARGAR ESTADÍSTICAS ==========
    loadEstadisticas: async function() {
        try {
            const response = await fetch('/api/solicitudes/estadisticas');
            const data = await response.json();

            if (data.success) {
                const stats = data.estadisticas;

                const elementos = {
                    'solicitudes-total-admin': stats.total || 0,
                    'solicitudes-pendientes-admin': stats.pendientes || 0,
                    'solicitudes-revision-admin': stats.en_revision || 0,
                    'solicitudes-resueltas-admin': stats.resueltas || 0,
                    'solicitudes-altas-admin': stats.prioridad_alta || 0
                };

                Object.entries(elementos).forEach(([id, valor]) => {
                    const elemento = document.getElementById(id);
                    if (elemento) elemento.textContent = valor;
                });
            }

        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    },

    // ========== VER DETALLE ==========
    verDetalle: async function(solicitudId) {
        try {
            const response = await fetch(`/api/solicitudes/detalle?id_solicitud=${solicitudId}`);
            const data = await response.json();

            if (!data.success) {
                alert('Error al cargar detalle');
                return;
            }

            this.mostrarModalDetalle(data.solicitud, data.respuestas || []);

        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar detalle');
        }
    },

    // ========== MOSTRAR MODAL DETALLE ==========
    mostrarModalDetalle: function(solicitud, respuestas) {
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
                        background: #FFFFFF;
                        border-radius: 12px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
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
                                background: #E8EBF0;
                                border: none;
                                width: 36px;
                                height: 36px;
                                border-radius: 50%;
                                cursor: pointer;
                                font-size: 20px;
                                color: #6C757D;
                                transition: all 0.3s ease;
                            "
                            onmouseover="this.style.background='#005CB9'; this.style.color='#FFFFFF'"
                            onmouseout="this.style.background='#E8EBF0'; this.style.color='#6C757D'">×</button>
                    
                    ${this.renderDetalleCompleto(solicitud, respuestas, fecha)}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
        i18n.translatePage();
    },

   
   // ========== RENDER DETALLE  ==========
renderDetalleCompleto: function(solicitud, respuestas, fecha) {
    return `
       

        <div style="background: #E3F2FD; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #005CB9;">
            <h3 style="color: #005CB9; margin-bottom: 15px; font-size: 16px;">
                <span data-i18n="dashboardAdmin.requests.userInfo">Información del Usuario</span>
            </h3>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div style="color: #495057;">
                    <strong style="color: #005CB9;"><span data-i18n="dashboardAdmin.requests.name">Nombre:</span></strong> ${solicitud.nombre_completo}
                </div>
                <div style="color: #495057;">
                    <strong style="color: #005CB9;"><span data-i18n="dashboardAdmin.requests.email">Email:</span></strong> ${solicitud.email}
                </div>
                <div style="color: #495057;">
                    <strong style="color: #005CB9;"><span data-i18n="dashboardAdmin.requests.document">Cédula:</span></strong> ${solicitud.cedula}
                </div>
                <div style="color: #495057;">
                    <strong style="color: #005CB9;"><span data-i18n="dashboardAdmin.requests.date">Fecha:</span></strong> ${fecha}
                </div>
            </div>
        </div>

        <div style="background: #F5F7FA; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #005CB9; margin-bottom: 15px; font-size: 16px;">
                <span data-i18n="dashboardAdmin.requests.detailsTitle">Detalles de la Solicitud</span>
            </h3>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="color: #495057;">
                    <strong style="color: #005CB9;"><span data-i18n="dashboardAdmin.requests.type">Tipo:</span></strong> 
                    ${Utils.formatTipoSolicitud(solicitud.tipo_solicitud)}
                </div>

                <div>
                    <strong style="color: #005CB9;"><span data-i18n="dashboardAdmin.requests.status">Estado:</span></strong> 
                    <span class="badge badge-${solicitud.estado}">${Utils.formatEstado(solicitud.estado)}</span>
                </div>

                <div>
                    <strong style="color: #005CB9;"><span data-i18n="dashboardAdmin.requests.priority">Prioridad:</span></strong> 
                    <span class="badge badge-prioridad-${solicitud.prioridad}">
                        ${Utils.formatPrioridad(solicitud.prioridad)}
                    </span>
                </div>
            </div>
        </div>

        <div style="background: #FFFFFF; padding: 20px; border-radius: 8px; border: 2px solid #E8EBF0; margin-bottom: 20px;">
            <h3 style="color: #005CB9; margin-bottom: 10px; font-size: 16px;">
                <span data-i18n="dashboardAdmin.requests.descriptionTitle">📝 Descripción</span>
            </h3>

            <p style="white-space: pre-wrap; color: #495057; line-height: 1.6;">
                ${solicitud.descripcion}
            </p>

            ${solicitud.archivo_adjunto ? `
                <a href="/files/?path=${solicitud.archivo_adjunto}" target="_blank" 
                    class="btn-small btn-secondary" 
                    style="margin-top: 15px; display: inline-block;">
                    <i class="fas fa-paperclip"></i> 
                    <span data-i18n="dashboardAdmin.requests.viewAttachment">Ver Archivo Adjunto</span>
                </a>
            ` : ''}
        </div>

        ${this.renderRespuestas(respuestas)}

        ${this.renderAccionesRapidas(solicitud)}

        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button onclick="this.closest('.modal-detail-admin').remove()" class="btn btn-secondary">
                <span data-i18n="dashboardAdmin.requests.close">Cerrar</span>
            </button>

            <button onclick="this.closest('.modal-detail-admin').remove(); SolicitudesAdmin.responder(${solicitud.id_solicitud})" class="btn btn-primary">
                <i class="fas fa-reply"></i> 
                <span data-i18n="dashboardAdmin.requests.reply">Responder</span>
            </button>
        </div>
    `;
},



    // ========== RENDER RESPUESTAS ==========
    renderRespuestas: function(respuestas) {
        if (!respuestas || respuestas.length === 0) {
            return `<p style="text-align: center; color: #6C757D; padding: 20px; background: #F5F7FA; border-radius: 8px;">Sin respuestas aún</p>`;
        }

        return `
            <div style="margin-bottom: 20px;">
               <h3 
    style="color: #005CB9; margin-bottom: 15px; font-size: 16px;" 
    data-i18n="dashboardAdmin.requests.conversation"
>
    <i class="fas fa-comments"></i> Conversación (${respuestas.length})
</h3>

                <div style="max-height: 400px; overflow-y: auto;">
                    ${respuestas.map(resp => {
                        const fechaResp = new Date(resp.fecha_respuesta).toLocaleString('es-UY');
                        return `
                            <div style="
                                background: ${resp.es_admin ? '#E3F2FD' : '#F5F7FA'};
                                padding: 15px;
                                border-radius: 8px;
                                margin-bottom: 10px;
                                border-left: 4px solid ${resp.es_admin ? '#005CB9' : '#6C757D'};
                            ">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                    <strong style="color: #005CB9; font-size: 14px;">
                                        ${resp.es_admin ? '👨‍💼 Administrador' : ' ' + resp.nombre_completo}
                                    </strong>
                                    <span style="color: #6C757D; font-size: 12px;">${fechaResp}</span>
                                </div>
                                <p style="white-space: pre-wrap; color: #495057; line-height: 1.5; margin: 0;">${resp.mensaje}</p>
                                ${resp.archivo_adjunto ? `
                                    <a href="/files/?path=${resp.archivo_adjunto}" target="_blank" style="color: #005CB9; text-decoration: none; font-size: 13px; display: inline-block; margin-top: 10px;">
                                        <i class="fas fa-paperclip"></i> Ver Archivo
                                    </a>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    // ========== RENDER ACCIONES RÁPIDAS ==========
    renderAccionesRapidas: function(solicitud) {
        return `
            <div style="background: #F5F7FA; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
               <h3 
        style="color: #005CB9; margin-bottom: 15px; font-size: 16px;"
        data-i18n="dashboardAdmin.requests.quickActions"
    >
        ⚡ Acciones Rápidas
    </h3>

                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${solicitud.estado !== 'en_revision' ? `
                        <button 
                onclick="SolicitudesAdmin.cambiarEstado(${solicitud.id_solicitud}, 'en_revision'); this.closest('.modal-detail-admin').remove();" 
                class="btn-small btn-warning"
                data-i18n="dashboardAdmin.requests.markInReview"
            >
                <i class="fas fa-eye"></i> Marcar En Revisión
            </button>
                    ` : ''}
                    ${solicitud.estado !== 'resuelta' ? `
                       <button 
                onclick="SolicitudesAdmin.cambiarEstado(${solicitud.id_solicitud}, 'resuelta'); this.closest('.modal-detail-admin').remove();" 
                class="btn-small btn-success"
                data-i18n="dashboardAdmin.requests.markResolved"
            >
                <i class="fas fa-check-circle"></i> Marcar como Resuelta
            </button>
                    ` : ''}
                    ${solicitud.estado !== 'rechazada' ? `
                        <button 
                onclick="SolicitudesAdmin.cambiarEstado(${solicitud.id_solicitud}, 'rechazada'); this.closest('.modal-detail-admin').remove();" 
                class="btn-small btn-danger"
                data-i18n="dashboardAdmin.requests.reject"
            >
                <i class="fas fa-times-circle"></i> Rechazar
            </button>
                    ` : ''}
                </div>
            </div>
        `;
    },

   // ========== RESPONDER SOLICITUD ==========
responder: function(solicitudId) {
    const modal = `
        <div id="responderSolicitudAdminModal" class="modal-overlay-admin">
            <div class="modal-content-admin">
                <button class="modal-close-btn-admin" onclick="SolicitudesAdmin.cerrarModalResponder()">×</button>
                
                <h2 class="modal-title-admin">
                    <i class="fas fa-reply"></i> 
                    <span data-i18n="dashboardAdmin.requests.respondAsAdmin">Responder como Administrador</span>
                </h2>

                <form id="responderSolicitudAdminForm" 
                      onsubmit="SolicitudesAdmin.submitRespuesta(event, ${solicitudId})" 
                      enctype="multipart/form-data">

                    <div class="form-group-admin">
                        <label for="mensaje-respuesta-admin">
                            <i class="fas fa-comment"></i> 
                            <span data-i18n="dashboardAdmin.requests.messageLabel">Mensaje *</span>
                        </label>

                        <textarea 
                            id="mensaje-respuesta-admin" 
                            name="mensaje"
                            rows="6"
                            placeholder=""
                            required
                            style="resize: none;"
                            data-i18n-placeholder="dashboardAdmin.requests.messagePlaceholder">
                        </textarea>
                    </div>

                    <div class="form-group-admin">
                        <label for="archivo-respuesta-admin">
                            <i class="fas fa-paperclip"></i>
                            <span data-i18n="dashboardAdmin.requests.attachmentLabel">Archivo Adjunto (Opcional)</span>
                        </label>

                        <input 
                            type="file" 
                            id="archivo-respuesta-admin" 
                            name="archivo"
                            accept="image/*,.pdf">

                        <small class="form-help-admin" 
                               data-i18n="dashboardAdmin.requests.attachmentHelp">
                               Puedes adjuntar documentos de respaldo
                        </small>
                    </div>

                    <div class="alert-info-admin">
                        <strong data-i18n="dashboardAdmin.requests.notificationNoteTitle">Nota:</strong>
                        <p data-i18n="dashboardAdmin.requests.notificationNote">
                            El usuario recibirá una notificación sobre tu respuesta.
                        </p>
                    </div>

                    <div class="form-actions-admin">
                        <button type="button" 
                                class="btn-small btn-primary" 
                                onclick="SolicitudesAdmin.cerrarModalResponder()">
                            <i class="fas fa-times"></i> 
                            <span data-i18n="dashboardAdmin.requests.cancel">Cancelar</span>
                        </button>

                        <button type="submit" class="btn-small btn-primary">
                            <i class="fas fa-paper-plane"></i> 
                            <span data-i18n="dashboardAdmin.requests.sendResponse">
                                Enviar Respuesta
                            </span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    i18n.translatePage();
},


    // ========== CERRAR MODAL RESPONDER ==========
    cerrarModalResponder: function() {
        const modal = document.getElementById('responderSolicitudAdminModal');
        if (modal) modal.remove();
    },

    // ========== SUBMIT RESPUESTA ==========
    submitRespuesta: async function(event, solicitudId) {
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
                this.cerrarModalResponder();
                this.loadAllSolicitudes();
                this.loadEstadisticas();
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
    },

    // ========== CAMBIAR ESTADO ==========
   cambiarEstado: async function(solicitudId, nuevoEstado) {
    const estadoTexto = {
        'pendiente': i18n.t("requests.statusPending"),
        'en_revision': i18n.t("requests.statusInReview"),
        'resuelta': i18n.t("requests.statusResolved"),
        'rechazada': i18n.t("requests.statusRejected")
    };

   ;
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
                this.loadAllSolicitudes();
                this.loadEstadisticas();
            } else {
                alert(' ' + data.message);
            }

        } catch (error) {
            console.error('Error:', error);
            alert(' Error de conexión');
        }
    }
};

// ========== EXPORTAR ==========
window.SolicitudesAdmin = SolicitudesAdmin;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    const solicitudesMenuItem = document.querySelector('.menu li[data-section="solicitudes"]');
    if (solicitudesMenuItem) {
        solicitudesMenuItem.addEventListener('click', function() {
          
            SolicitudesAdmin.init();
        });
    }
});

console.log(' [SOLICITUDES] Módulo cargado completamente');