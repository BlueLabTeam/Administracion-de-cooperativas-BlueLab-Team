// ==========================================
// 📝 MÓDULO: MIS SOLICITUDES
// Gestiona el sistema de solicitudes del usuario
// Incluye: crear, ver, responder, filtrar solicitudes
// ==========================================

console.log('🟢 Cargando módulo de solicitudes de usuario');

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log(' Inicializando módulo de solicitudes');
    
    // Listener para la sección de solicitudes
    const solicitudesMenuItem = document.querySelector('.menu li[data-section="solicitudes"]');
    if (solicitudesMenuItem) {
        solicitudesMenuItem.addEventListener('click', function() {
            console.log('>>> Sección solicitudes abierta');
            loadMisSolicitudes();
        });
    }
    
    // Listener para botón de nueva solicitud
    const btnNuevaSolicitud = document.getElementById('btn-nueva-solicitud');
    if (btnNuevaSolicitud) {
        btnNuevaSolicitud.addEventListener('click', abrirModalNuevaSolicitud);
    }
    
    // Listener para filtros
    const filtroEstado = document.getElementById('filtro-estado-solicitudes');
    const filtroTipo = document.getElementById('filtro-tipo-solicitudes');
    
    if (filtroEstado) {
        filtroEstado.addEventListener('change', loadMisSolicitudes);
    }
    if (filtroTipo) {
        filtroTipo.addEventListener('change', loadMisSolicitudes);
    }
});

// ==========================================
// 📥 CARGAR MIS SOLICITUDES
// ==========================================

/**
 * Cargar solicitudes del usuario con filtros
 */
async function loadMisSolicitudes() {
    console.log('==========================================');
    console.log(' INICIANDO CARGA DE SOLICITUDES');
    console.log('==========================================');
    
    const container = document.getElementById('misSolicitudesContainer');
    
    if (!container) {
        console.error(' Container "misSolicitudesContainer" NO ENCONTRADO');
        console.log('Elementos disponibles con "solicitudes":', 
            document.querySelectorAll('[id*="solicitud"]'));
        return;
    }

    console.log(' Container encontrado:', container);
    container.innerHTML = '<p class="loading" data-i18n="dashboardUser.requests.loading">Cargando solicitudes...</p>';
    i18n.translatePage(); // Actualizar traducciones
    try {
        const estado = document.getElementById('filtro-estado-solicitudes')?.value || '';
        const tipo = document.getElementById('filtro-tipo-solicitudes')?.value || '';

        let url = '/api/solicitudes/mis-solicitudes?';
        if (estado) url += `estado=${estado}&`;
        if (tipo) url += `tipo=${tipo}&`;

        console.log('🔗 URL de petición:', url);
        console.log('📤 Iniciando fetch...');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });

        console.log('📡 Response status:', response.status);

        // Leer como texto primero para debug
        const responseText = await response.text();
        console.log('📥 Response text (primeros 500 chars):', responseText.substring(0, 500));

        // Intentar parsear
        let data;
        try {
            data = JSON.parse(responseText);
            console.log(' JSON parseado correctamente');
        } catch (parseError) {
            console.error(' Error al parsear JSON:', parseError);
            console.error('📄 Respuesta completa:', responseText);
            container.innerHTML = `
                <div class="error">
                    <h3 data-i18n="dashboardUser.requests.error.titleParsingJson"> Error de Servidor</h3>
                    <p data-i18n="dashboardUser.requests.error.messageParsingJson">El servidor devolvió HTML en lugar de JSON</p>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; max-height: 300px;">${responseText.substring(0, 1000)}</pre>
                    <button class="btn btn-primary" onclick="loadMisSolicitudes()">
                        <i class="fas fa-sync"></i> <span data-i18n="dashboardUser.requests.error.button">Reintentar</span>
                    </button>
                </div>
            `;
            i18n.translatePage(); // Actualizar traducciones
            return;
        }

        console.log(' Data recibida:', data);
        console.log('   - success:', data.success);
        console.log('   - count:', data.count);
        console.log('   - solicitudes length:', data.solicitudes?.length);

        if (data.success) {
            console.log(' Petición exitosa, renderizando...');
            
            if (data.solicitudes && data.solicitudes.length > 0) {
                console.log(' Primera solicitud:', data.solicitudes[0]);
            }
            
            renderMisSolicitudes(data.solicitudes);
            updateSolicitudesStats(data.solicitudes);
            
            console.log(' Renderizado completado');
        } else {
            console.error(' success = false');
            container.innerHTML = `
                <div class="error">
                    <h3 data-i18n="dashboardUser.requests.error.title"> Error</h3>
                    <p>${data.message || 'Error desconocido'}</p>
                    <button class="btn btn-primary" onclick="loadMisSolicitudes()">
                        <i class="fas fa-sync"></i> <span data-i18n="dashboardUser.requests.error.button">Reintentar</span>
                    </button>
                </div>
            `;
            i18n.translatePage(); // Actualizar traducciones
        }

    } catch (error) {
        console.error('==========================================');
        console.error(' ERROR CAPTURADO:');
        console.error('   - Mensaje:', error.message);
        console.error('   - Stack:', error.stack);
        console.error('==========================================');
        
        container.innerHTML = `
            <div class="error">
                <h3 data-i18n="dashboardUser.requests.error.titleConnection"> Error de Conexión</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadMisSolicitudes()">
                    <i class="fas fa-sync"></i> <span data-i18n="dashboardUser.requests.error.button">Reintentar</span>
                </button>
            </div>
        `;
        i18n.translatePage(); // Actualizar traducciones
    }
    
    console.log('==========================================');
    console.log(' FIN CARGA DE SOLICITUDES');
    console.log('==========================================');
}

// ==========================================
// 🎨 RENDERIZAR SOLICITUDES
// ==========================================

/**
 * Renderizar lista de solicitudes
 */
function renderMisSolicitudes(solicitudes) {
    const container = document.getElementById('misSolicitudesContainer');

    if (!solicitudes || solicitudes.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; margin-bottom: 10px;"></i>
                <p data-i18n="dashboardUser.requests.noRequests">No tienes solicitudes registradas</p>
                <button class="btn btn-primary" onclick="abrirModalNuevaSolicitud()">
                    <i class="fas fa-plus"></i> <span data-i18n="dashboardUser.requests.newRequest">Nueva Solicitud</span>
                </button>
            </div>
        `;
        i18n.translatePage(); // Actualizar traducciones
        return;
    }

    let html = '<div class="solicitudes-grid">';

    solicitudes.forEach(sol => {
        const fecha = new Date(sol.fecha_creacion).toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        html += `
            <div class="solicitud-card estado-${sol.estado} prioridad-${sol.prioridad}">
                <div class="solicitud-header">
                    <div>
                        <h4>${sol.asunto}</h4>
                        <span class="solicitud-tipo">${formatTipoSolicitud(sol.tipo_solicitud)}</span>
                    </div>
                    <div class="solicitud-badges">
                        <span class="badge badge-${sol.estado}">${formatEstado(sol.estado)}</span>
                        <span class="badge badge-prioridad-${sol.prioridad}">${formatPrioridad(sol.prioridad)}</span>
                    </div>
                </div>

                <div class="solicitud-body">
                    <p class="solicitud-descripcion">${truncarTexto(sol.descripcion, 150)}</p>
                    
                    <div class="solicitud-meta">
                        <span><i class="fas fa-calendar"></i> ${fecha}</span>
                        <span><i class="fas fa-comments"></i> ${sol.total_respuestas || 0} <span data-i18n="dashboardUser.requests.responses">respuesta(s)</span></span>
                    </div>
                </div>

                <div class="solicitud-footer">
                    <button class="btn btn-secondary btn-small" onclick="verDetalleSolicitud(${sol.id_solicitud})">
                        <i class="fas fa-eye"></i> <span data-i18n="dashboardUser.requests.viewDetail">Ver Detalle</span>
                    </button>
                    ${sol.estado !== 'resuelta' && sol.estado !== 'rechazada' ? `
                        <button class="btn btn-primary btn-small" onclick="responderSolicitud(${sol.id_solicitud})">
                            <i class="fas fa-reply"></i> <span data-i18n="dashboardUser.requests.reply">Responder</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
    i18n.translatePage(); // Actualizar traducciones
}

/**
 * Actualizar estadísticas de solicitudes
 */
function updateSolicitudesStats(solicitudes) {
    const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
    const enRevision = solicitudes.filter(s => s.estado === 'en_revision').length;
    const resueltas = solicitudes.filter(s => s.estado === 'resuelta').length;

    const pendientesEl = document.getElementById('solicitudes-pendientes-count');
    const revisionEl = document.getElementById('solicitudes-revision-count');
    const resueltasEl = document.getElementById('solicitudes-resueltas-count');

    if (pendientesEl) pendientesEl.textContent = pendientes;
    if (revisionEl) revisionEl.textContent = enRevision;
    if (resueltasEl) resueltasEl.textContent = resueltas;
}

// ==========================================
// ➕ CREAR NUEVA SOLICITUD
// ==========================================

/**
 * Abrir modal para crear nueva solicitud
 */
function abrirModalNuevaSolicitud() {
    // Eliminar modal existente si hay uno
    const modalExistente = document.getElementById('nuevaSolicitudModal');
    if (modalExistente) {
        modalExistente.remove();
    }

    const modal = `
        <div id="nuevaSolicitudModal" class="material-modal" style="display: flex;">
            <div class="material-modal-content" onclick="event.stopPropagation()">
                <div class="material-modal-header">
                    <h3 id="solicitudModalTitle" data-i18n="dashboardUser.requests.newRequest">Nueva Solicitud</h3>
                    <button class="close-material-modal" onclick="cerrarModalNuevaSolicitud()">&times;</button>
                </div>
                
                <form id="nuevaSolicitudForm" onsubmit="submitNuevaSolicitud(event)" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="tipo-solicitud">
                            <i class="fas fa-tag"></i> <span data-i18n="dashboardUser.requests.form.typeLabel">Tipo de Solicitud *</span>
                        </label>
                        <select id="tipo-solicitud" name="tipo_solicitud" required>
                            <option value="horas" data-i18n="dashboardUser.requests.form.types.hours"> Registro de Horas</option>
                            <option value="pago" data-i18n="dashboardUser.requests.form.types.payment"> Pagos/Cuotas</option>
                            <option value="vivienda" data-i18n="dashboardUser.requests.form.types.housing"> Vivienda</option>
                            <option value="general" data-i18n="dashboardUser.requests.form.types.general"> Consulta General</option>
                            <option value="otro" data-i18n="dashboardUser.requests.form.types.other">❓ Otro</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="asunto-solicitud">
                            <i class="fas fa-heading"></i> <span data-i18n="dashboardUser.requests.form.subjectLabel">Asunto *</span>
                        </label>
                        <input 
                            type="text" 
                            id="asunto-solicitud" 
                            name="asunto"
                            placeholder="Ej: Justificación de horas - Certificado médico"
                            maxlength="255"
                            required 
                            data-i18n-placeholder="dashboardUser.requests.form.subjectPlaceholder">
                    </div>

                    <div class="form-group">
                        <label for="descripcion-solicitud">
                            <i class="fas fa-align-left"></i> <span data-i18n="dashboardUser.requests.form.descriptionLabel">Descripción *</span>
                        </label>
                        <textarea 
    id="descripcion-solicitud" 
    name="descripcion"
    rows="6"
    maxlength="250"
    placeholder="Describe detalladamente tu solicitud..."
    required
    style="resize: none; width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-size: 14px;"
    oninput="actualizarContadorCaracteres(this)"
    data-i18n-placeholder="dashboardUser.requests.form.descriptionPlaceholder"
></textarea>

<small id="charCount" style="color: #666; display: block; text-align: right; margin-top: 4px;">
    0 / 250 caracteres
</small>

                    </div>

                    <div class="form-group">
                        <label for="prioridad-solicitud">
                            <i class="fas fa-exclamation-circle"></i> <span data-i18n="dashboardUser.requests.form.priorityLabel">Prioridad *</span>
                        </label>
                        <select id="prioridad-solicitud" name="prioridad">
                            <option value="baja" data-i18n="dashboardUser.requests.form.priority.Low">Baja</option>
                            <option value="media" data-i18n="dashboardUser.requests.form.priority.Medium" selected>Media</option>
                            <option value="alta" data-i18n="dashboardUser.requests.form.priority.High">Alta</option>
                        </select>
                        <small class="form-help" data-i18n="dashboardUser.requests.form.priorityUrgentHelp">Selecciona "Alta" solo si es urgente</small>
                    </div>

                    <div class="form-group">
                        <label for="archivo-solicitud">
                            <i class="fas fa-paperclip"></i> <span data-i18n="dashboardUser.requests.form.attachmentLabel">Archivo Adjunto (Opcional)</span>
                        </label>
                        <input 
                            type="file" 
                            id="archivo-solicitud" 
                            name="archivo"
                            accept="image/*,.pdf">
                        <small class="form-help" data-i18n="dashboardUser.requests.form.attachmentHelp">Puedes adjuntar certificados, comprobantes, etc. (máx. 5MB)</small>
                    </div>

                    <div class="alert-info">
                        <strong data-i18n="dashboardUser.requests.form.infoTitle"> Información:</strong>
                        <p data-i18n="dashboardUser.requests.form.infoDescription">Tu solicitud será revisada por un administrador. Recibirás una notificación cuando haya novedades.</p>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="cerrarModalNuevaSolicitud()">
                            <i class="fas fa-times"></i> <span data-i18n="dashboardUser.requests.form.cancelButton">Cancelar</span>
                        </button>
                        <button type="submit" class="btn btn-primary" id="btn-submit-solicitud">
                            <i class="fas fa-paper-plane"></i> <span data-i18n="dashboardUser.requests.form.submitButton">Enviar Solicitud</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    i18n.translatePage(); // Actualizar traducciones
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

/**
 * Cerrar modal de nueva solicitud
 */
function cerrarModalNuevaSolicitud() {
    const modal = document.getElementById('nuevaSolicitudModal');
    if (modal) {
        modal.remove();
    }
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
}

/**
 * Actualizar contador de caracteres
 */
function actualizarContadorCaracteres(textarea) {
    const contador = document.getElementById('charCount');
    const actual = textarea.value.length;
    const maximo = 250;
    
    if (!contador) return;
    
    contador.textContent = `${actual} / ${maximo} caracteres`;
    
    // Cambiar color si se acerca al límite
    if (actual > maximo * 0.9) {
        contador.style.color = '#F44336';
    } else if (actual > maximo * 0.7) {
        contador.style.color = '#FF9800';
    } else {
        contador.style.color = '#666';
    }
}

/**
 * Enviar nueva solicitud
 */
async function submitNuevaSolicitud(event) {
    event.preventDefault();
    console.log('📤 Iniciando envío de solicitud');

    const form = document.getElementById('nuevaSolicitudForm');
    const submitBtn = document.getElementById('btn-submit-solicitud');
    const btnHTML = submitBtn.innerHTML;
    
    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span data-i18n="dashboardUser.requests.form.sending">Enviando...</span>';

    try {
        // 🔥 CREAR FormData CORRECTAMENTE
        const formData = new FormData(form);
        
        //  DEBUG: Verificar contenido
        console.log(' FormData contenido:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
            } else {
                console.log(`  ${key}: ${value}`);
            }
        }

        const response = await fetch('/api/solicitudes/create', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        console.log('📡 Response status:', response.status);
        
        // Leer respuesta como texto primero
        const responseText = await response.text();
        console.log('📥 Response text:', responseText.substring(0, 500));

        // Intentar parsear JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error(' Error parsing JSON:', parseError);
            console.error(' Response completo:', responseText);
            throw new Error('El servidor devolvió HTML en lugar de JSON. Revisa los logs de PHP.');
        }

        console.log(' Data parseada:', data);

        if (data.success) {
            alert(' ' + data.message);
            cerrarModalNuevaSolicitud();
            loadMisSolicitudes();
        } else {
            alert(' ' + data.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnHTML;
        }

    } catch (error) {
        console.error(' Error completo:', error);
        console.error(' Stack:', error.stack);
        alert(' Error de conexión: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnHTML;
    }
}

// ==========================================
// 👁️ VER DETALLE DE SOLICITUD
// ==========================================

/**
 * Ver detalle completo de una solicitud
 */
async function verDetalleSolicitud(solicitudId) {
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
                <div class="modal-detail-content" style="max-width: 800px;">
                    <button onclick="this.closest('.modal-detail').remove()" class="modal-close-button">×</button>
                    
                    <h2 class="modal-detail-header">
                        <i class="fas fa-file-alt"></i> ${solicitud.asunto}
                    </h2>

                    <div class="modal-detail-section">
                        <div class="detalle-grid">
                            <div><strong>Tipo:</strong> ${formatTipoSolicitud(solicitud.tipo_solicitud)}</div>
                            <div><strong>Estado:</strong> <span class="badge badge-${solicitud.estado}">${formatEstado(solicitud.estado)}</span></div>
                            <div><strong>Prioridad:</strong> <span class="badge badge-prioridad-${solicitud.prioridad}">${formatPrioridad(solicitud.prioridad)}</span></div>
                            <div><strong>Fecha:</strong> ${fecha}</div>
                        </div>
                    </div>

                    <div class="modal-detail-section">
                        <h3>Descripción</h3>
                        <p style="white-space: pre-wrap;">${solicitud.descripcion}</p>
                        ${solicitud.archivo_adjunto ? `
                            <a href="/files/?path=${solicitud.archivo_adjunto}" target="_blank" class="btn btn-secondary btn-small">
                                <i class="fas fa-paperclip"></i> <span data-i18n="dashboardUser.requests.detail.viewAttachment">Ver Archivo Adjunto</span>
                            </a>
                        ` : ''}
                    </div>

                    ${respuestas.length > 0 ? `
                        <div class="modal-detail-section">
                            <h3><i class="fas fa-comments"></i> <span data-i18n="dashboardUser.requests.detail.conversation">Conversación</span>(${respuestas.length})</h3>
                            <div class="respuestas-thread">
                                ${respuestas.map(resp => {
                                    const fechaResp = new Date(resp.fecha_respuesta).toLocaleString('es-UY');
                                    return `
                                        <div class="respuesta-item ${resp.es_admin ? 'respuesta-admin' : 'respuesta-usuario'}">
                                            <div class="respuesta-header">
                                                <strong>
                                                    ${resp.es_admin ? '👨‍💼 Administrador' : ' ' + resp.nombre_completo}
                                                </strong>
                                                <span class="respuesta-fecha">${fechaResp}</span>
                                            </div>
                                            <div class="respuesta-body">
                                                <p style="white-space: pre-wrap;">${resp.mensaje}</p>
                                                ${resp.archivo_adjunto ? `
                                                    <a href="/files/?path=${resp.archivo_adjunto}" target="_blank" class="file-link">
                                                        <i class="fas fa-paperclip"></i> <span data-i18n="dashboardUser.requests.detail.viewAttachment">Ver Archivo Adjunto</span>
                                                    </a>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : `<p style="text-align: center; color: #999;" data-i18n="dashboardUser.requests.detail.noResponses">Sin respuestas aún</p>`}

                    <div class="modal-detail-footer">
                        <button onclick="this.closest('.modal-detail').remove()" class="btn btn-secondary" data-i18n="dashboardUser.requests.detail.close">Cerrar</button>
                        ${solicitud.estado !== 'resuelta' && solicitud.estado !== 'rechazada' ? `
                            <button onclick="this.closest('.modal-detail').remove(); responderSolicitud(${solicitudId})" class="btn btn-primary">
                                <i class="fas fa-reply"></i> <span data-i18n="dashboardUser.requests.detail.reply">Responder</span>
                            </button>
                        ` : ''}
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

// ==========================================
// 💬 RESPONDER SOLICITUD
// ==========================================

/**
 * Abrir modal para responder solicitud
 */
function responderSolicitud(solicitudId) {
    const modal = `
        <div id="responderSolicitudModal" class="modal-overlay">
            <div class="modal-content-large">
                <button class="modal-close-btn" onclick="cerrarModalResponder()">×</button>
                
                <h2 class="modal-title">
                    <i class="fas fa-reply"></i> <span data-i18n="dashboardUser.requests.answerForm.title">Responder Solicitud</span>
                </h2>

                <form id="responderSolicitudForm" onsubmit="submitRespuesta(event, ${solicitudId})" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="mensaje-respuesta">
                            <i class="fas fa-comment"></i> <span data-i18n="dashboardUser.requests.answerForm.responseLabel">Mensaje *</span>
                        </label>
                        <textarea 
                            id="mensaje-respuesta" 
                            name="mensaje"
                            rows="6"
                            placeholder="Escribe tu respuesta o información adicional..."
                            data-i18n-placeholder="dashboardUser.requests.answerForm.responsePlaceholder"
                            required required style="resize: none;"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="archivo-respuesta">
                            <i class="fas fa-paperclip"></i> <span data-i18n="dashboardUser.requests.answerForm.attachmentLabel">Archivo Adjunto (Opcional)</span>
                        </label>
                        <input 
                            type="file" 
                            id="archivo-respuesta" 
                            name="archivo"
                            accept="image/*,.pdf">
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="cerrarModalResponder()">
                            <i class="fas fa-times"></i> <span data-i18n="dashboardUser.requests.answerForm.cancelButton">Cancelar</span>
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> <span data-i18n="dashboardUser.requests.answerForm.submitButton">Enviar Respuesta</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    i18n.translatePage(); // Actualizar traducciones
}

/**
 * Cerrar modal de responder
 */
function cerrarModalResponder() {
    const modal = document.getElementById('responderSolicitudModal');
    if (modal) modal.remove();
}

/**
 * Enviar respuesta a solicitud
 */
async function submitRespuesta(event, solicitudId) {
    event.preventDefault();

    const form = document.getElementById('responderSolicitudForm');
    const formData = new FormData(form);
    formData.append('id_solicitud', solicitudId);

    const submitBtn = form.querySelector('button[type="submit"]');
    const btnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span data-i18n="dashboardUser.requests.answerForm.sending">Enviando...</span>';
    i18n.translatePage(); // Actualizar traducciones

    try {
        const response = await fetch('/api/solicitudes/responder', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (data.success) {
            alert(' ' + data.message);
            cerrarModalResponder();
            loadMisSolicitudes();
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

// ==========================================
// 🔧 FUNCIONES AUXILIARES
// ==========================================

/**
 * Formatear tipo de solicitud
 */
function formatTipoSolicitud(tipo) {
    const tipos = {
        'horas': ' Registro de Horas',
        'pago': ' Pagos/Cuotas',
        'vivienda': ' Vivienda',
        'general': ' Consulta General',
        'otro': '❓ Otro'
    };
    return tipos[tipo] || tipo;
}

/**
 * Formatear estado
 */
function formatEstado(estado) {
    const estados = {
        'pendiente': 'Pendiente',
        'en_revision': 'En Revisión',
        'resuelta': 'Resuelta',
        'rechazada': 'Rechazada'
    };
    return estados[estado] || estado;
}

/**
 * Formatear prioridad
 */
function formatPrioridad(prioridad) {
    const prioridades = {
        'baja': 'Baja',
        'media': 'Media',
        'alta': 'Alta'
    };
    return prioridades[prioridad] || prioridad;
}

/**
 * Truncar texto
 */
function truncarTexto(texto, maxLength) {
    if (!texto || texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
}

// ==========================================
// 🔄 EXPORTAR FUNCIONES GLOBALES
// ==========================================

window.loadMisSolicitudes = loadMisSolicitudes;
window.abrirModalNuevaSolicitud = abrirModalNuevaSolicitud;
window.cerrarModalNuevaSolicitud = cerrarModalNuevaSolicitud;
window.actualizarContadorCaracteres = actualizarContadorCaracteres;
window.submitNuevaSolicitud = submitNuevaSolicitud;
window.verDetalleSolicitud = verDetalleSolicitud;
window.responderSolicitud = responderSolicitud;
window.cerrarModalResponder = cerrarModalResponder;
window.submitRespuesta = submitRespuesta;

// Exportar funciones auxiliares
window.formatTipoSolicitud = formatTipoSolicitud;
window.formatEstado = formatEstado;
window.formatPrioridad = formatPrioridad;
window.truncarTexto = truncarTexto;

console.log(' Módulo de solicitudes cargado completamente');
console.log(' Funciones exportadas:', {
    loadMisSolicitudes: typeof window.loadMisSolicitudes,
    abrirModalNuevaSolicitud: typeof window.abrirModalNuevaSolicitud,
    verDetalleSolicitud: typeof window.verDetalleSolicitud,
    responderSolicitud: typeof window.responderSolicitud
});