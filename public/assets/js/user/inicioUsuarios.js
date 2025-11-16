// ==========================================
// 📋 MÓDULO: INICIO USUARIO
// Gestiona la sección de inicio del dashboard de usuario
// Incluye: notificaciones, núcleo familiar, datos de perfil
// ==========================================

console.log('🟢 Cargando módulo de inicio de usuario');

// ========== VARIABLES GLOBALES ==========
let nucleoYaCargado = false;
let verificacionEnCurso = false;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Inicializando módulo de inicio');
    
    // Cargar datos del usuario
    cargarDatosUsuario();
    
    // Cargar notificaciones
    loadNotifications();
    setInterval(loadNotifications, 120000); // Cada 2 minutos
    
    // Verificar estado de núcleo (después de un momento)
    setTimeout(() => {
        if (!nucleoYaCargado && !verificacionEnCurso) {
            verificarEstadoNucleo();
        }
    }, 500);
    
    // Listener para cuando se hace click en "Inicio"
    const inicioMenuItem = document.querySelector('.menu li[data-section="inicio"]');
    if (inicioMenuItem) {
        inicioMenuItem.addEventListener('click', function() {
            console.log('🏠 Click en sección Inicio');
            
            // Solo recargar núcleo si no se ha mostrado aún
            if (!nucleoYaCargado) {
                setTimeout(() => {
                    verificarEstadoNucleo();
                }, 100);
            }
        });
    }
});

// ==========================================
// 🔔 SISTEMA DE NOTIFICACIONES
// ==========================================

/**
 * Cargar notificaciones del usuario
 */
async function loadNotifications() {
    try {
        const response = await fetch('/api/notifications/user');
        const data = await response.json();

        if (data.success) {
            renderNotifications(data.notifications, data.unread_count);
        }
    } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        const list = document.getElementById('notificationsList');
        if (list) {
            list.innerHTML = '<div class="no-notifications">No se pudieron cargar las notificaciones</div>';
        }
    }
}

/**
 * Renderizar lista de notificaciones
 */
function renderNotifications(notifications, unreadCount) {
    const badge = document.getElementById('notificationsBadge');
    const list = document.getElementById('notificationsList');

    if (!badge || !list) return;

    // Actualizar badge
    badge.textContent = unreadCount;
    badge.className = 'notifications-badge' + (unreadCount === 0 ? ' zero' : '');

    // Renderizar lista
    if (notifications.length === 0) {
        list.innerHTML = '<div class="no-notifications">No tienes notificaciones</div>';
        return;
    }

    list.innerHTML = notifications.map(notif => {
        const fecha = new Date(notif.fecha_creacion);
        const fechaFormateada = formatearFecha(fecha);
        const isUnread = notif.leida == 0;

        return `
            <div class="notification-item ${isUnread ? 'unread' : ''} tipo-${notif.tipo}" 
                 onclick="markAsRead(${notif.id}, this)">
                <div class="notification-header-info">
                    <div class="notification-title">
                        ${getTipoIcon(notif.tipo)}
                        ${notif.titulo}
                        ${isUnread ? '<span class="notification-type-badge tipo-' + notif.tipo + '-badge">NUEVO</span>' : ''}
                    </div>
                    <span class="notification-date">${fechaFormateada}</span>
                </div>
                <div class="notification-message">${notif.mensaje}</div>
            </div>
        `;
    }).join('');
}

/**
 * Obtener icono según tipo de notificación
 */
function getTipoIcon(tipo) {
    const icons = {
        'info': 'ℹ️',
        'importante': '⚠️',
        'urgente': '🚨',
        'exito': '✅'
    };
    return icons[tipo] || 'ℹ️';
}

/**
 * Formatear fecha relativa
 */
function formatearFecha(fecha) {
    const ahora = new Date();
    const diff = ahora - fecha;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;

    return fecha.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Marcar notificación como leída
 */
async function markAsRead(notifId, element) {
    if (!element.classList.contains('unread')) return;

    try {
        const formData = new FormData();
        formData.append('notificacion_id', notifId);

        const response = await fetch('/api/notifications/mark-read', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            element.classList.remove('unread');
            const badge = document.getElementById('notificationsBadge');
            if (badge) {
                const currentCount = parseInt(badge.textContent);
                const newCount = Math.max(0, currentCount - 1);
                badge.textContent = newCount;
                badge.className = 'notifications-badge' + (newCount === 0 ? ' zero' : '');
            }
        }
    } catch (error) {
        console.error('Error al marcar como leída:', error);
    }
}

// ==========================================
// 👨‍👩‍👧 SISTEMA DE NÚCLEO FAMILIAR
// ==========================================

/**
 * Verificar si el usuario tiene núcleo o debe solicitar uno
 * ✅ CON PROTECCIÓN CONTRA DUPLICADOS
 */
async function verificarEstadoNucleo() {
    // PROTECCIÓN: Evitar múltiples ejecuciones simultáneas
    if (verificacionEnCurso) {
        console.log('⏳ Verificación ya en curso, saltando...');
        return;
    }
    
    if (nucleoYaCargado) {
        console.log('✅ Núcleo ya cargado previamente, saltando...');
        return;
    }
    
    verificacionEnCurso = true;
    console.log('🔍 Verificando estado de núcleo...');
    
    try {
        const response = await fetch('/api/users/my-profile');
        const data = await response.json();
        
        console.log('📊 Datos de perfil:', data);
        
        if (data.success && data.user) {
            // 🎯 BUSCAR SECCIÓN DE INICIO
            const inicioSection = document.getElementById('inicio-section');
            
            if (!inicioSection) {
                console.error('❌ No se encontró la sección de inicio');
                verificacionEnCurso = false;
                return;
            }
            
            // LIMPIAR CUALQUIER CARD/BANNER ANTERIOR
            const elementosAnteriores = inicioSection.querySelectorAll('.nucleo-info-card, .banner-nucleo-invitation');
            
            if (elementosAnteriores.length > 0) {
                console.log('🗑️ Removiendo', elementosAnteriores.length, 'elementos anteriores');
                elementosAnteriores.forEach(el => el.remove());
            }
            
            const idNucleo = data.user.id_nucleo;
            console.log('🔍 id_nucleo del usuario:', idNucleo);
            
            if (idNucleo) {
                // ✅ TIENE NÚCLEO - Mostrar info
                console.log('✅ Usuario tiene núcleo:', idNucleo);
                await mostrarInfoNucleoEnInicio(idNucleo, inicioSection);
            } else {
                // ❌ NO TIENE NÚCLEO - Mostrar banner
                console.log('⚠️ Usuario sin núcleo, mostrando banner');
                mostrarBannerNucleoEnInicio(inicioSection);
            }
            
            // ✅ Marcar como cargado
            nucleoYaCargado = true;
            console.log('✅ Núcleo cargado correctamente');
        }
    } catch (error) {
        console.error('❌ Error al verificar núcleo:', error);
    } finally {
        verificacionEnCurso = false;
    }
}

/**
 * Mostrar información del núcleo en la sección de inicio
 */
async function mostrarInfoNucleoEnInicio(idNucleo, inicioSection) {
    try {
        console.log('📡 Cargando info del núcleo para inicio...');
        
        const response = await fetch('/api/nucleos/mi-nucleo-info');
        const data = await response.json();
        
        if (!data.success || !data.nucleo) {
            console.error('❌ Error al cargar núcleo');
            return;
        }
        
        const nucleo = data.nucleo;
        const miembros = data.miembros || [];
        const miId = data.mi_id;
        
        console.log('📋 Núcleo:', nucleo.nombre_nucleo, '- Miembros:', miembros.length);
        
        let miembrosHTML = '';
        
        if (miembros.length > 0) {
            // Mostrar hasta 4 miembros
            const miembrosMostrar = miembros.slice(0, 4);
            const miembrosRestantes = miembros.length - 4;
            
            miembrosHTML = `
                <div class="miembros-grid-compact" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-top: 15px;">
                    ${miembrosMostrar.map(miembro => `
                        <div style="
                            background: rgba(255,255,255,0.1);
                            padding: 12px;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            border-left: 3px solid ${miembro.id_usuario == miId ? '#fff' : 'transparent'};
                        ">
                            <i class="fas fa-user-circle" style="font-size: 20px; color: rgba(255,255,255,0.8);"></i>
                            <div style="flex: 1; min-width: 0;">
                                <strong style="color: white; display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${miembro.nombre_completo}
                                    ${miembro.id_usuario == miId ? '<span style="font-size: 11px; opacity: 0.8;"> (Tú)</span>' : ''}
                                </strong>
                                ${miembro.nombre_rol ? `
                                    <small style="color: rgba(255,255,255,0.7); font-size: 11px;">${miembro.nombre_rol}</small>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                    ${miembrosRestantes > 0 ? `
                        <div style="
                            background: rgba(255,255,255,0.1);
                            padding: 12px;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: 600;
                        ">
                            +${miembrosRestantes} más
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        const infoHTML = `
            <div class="nucleo-info-card" style="
                background: linear-gradient(135deg, #69b2d5 0%, #1b1397 100%); 
                color: white;
                padding: 25px;
                border-radius: 12px;
                margin-bottom: 30px;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                animation: slideInDown 0.5s ease-out;
            ">
                <div style="display: flex; align-items: start; gap: 20px; margin-bottom: 20px;">
                    <div style="
                        background: rgba(255,255,255,0.2);
                        width: 70px;
                        height: 70px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 35px;
                        backdrop-filter: blur(10px);
                        flex-shrink: 0;
                    ">
                        👨‍👩‍👧
                    </div>
                    <div style="flex: 1;">
                        <p style="margin: 0 0 5px 0; opacity: 0.9; font-size: 13px; font-weight: 500;">
                            Tu Núcleo Familiar
                        </p>
                        <h3 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 700;">
                            ${nucleo.nombre_nucleo || 'Sin nombre'}
                        </h3>
                        <div style="display: flex; gap: 15px; font-size: 13px; opacity: 0.95; flex-wrap: wrap;">
                            ${nucleo.direccion ? `
                                <span style="display: flex; align-items: center; gap: 5px;">
                                    <i class="fas fa-map-marker-alt"></i> ${nucleo.direccion}
                                </span>
                            ` : ''}
                            <span style="display: flex; align-items: center; gap: 5px;">
                                <i class="fas fa-users"></i> ${nucleo.total_miembros} miembro${nucleo.total_miembros != 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <strong style="font-size: 14px;">Miembros del Núcleo</strong>
                        <button 
                            onclick="verDetallesNucleoDesdeInicio(${idNucleo})" 
                            style="
                                background: rgba(255,255,255,0.2);
                                border: none;
                                color: white;
                                padding: 6px 12px;
                                border-radius: 6px;
                                font-size: 12px;
                                cursor: pointer;
                                transition: all 0.3s;
                            "
                            onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                            <i class="fas fa-info-circle"></i> Ver Todo
                        </button>
                    </div>
                    ${miembrosHTML}
                </div>
            </div>
        `;
        
        // Insertar después del título
        const tituloInicio = inicioSection.querySelector('.section-title, h2');
        if (tituloInicio) {
            tituloInicio.insertAdjacentHTML('afterend', infoHTML);
        } else {
            inicioSection.insertAdjacentHTML('afterbegin', infoHTML);
        }
        
        console.log('✅ Card de núcleo insertado en inicio');
        
    } catch (error) {
        console.error('❌ Error al mostrar núcleo en inicio:', error);
    }
}

/**
 * Mostrar banner para unirse a un núcleo
 */
function mostrarBannerNucleoEnInicio(inicioSection) {
    const banner = `
        <div class="banner-nucleo-invitation" style="
            background: linear-gradient(135deg, #69b2d5 0%, #1b1397 100%); 
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInDown 0.5s ease-out;
        ">
            <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                <div style="font-size: 48px;">👨‍👩‍👧‍👦</div>
                <div style="flex: 1; min-width: 250px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 20px;">¿Quieres unirte a un Núcleo Familiar?</h3>
                    <p style="margin: 0; opacity: 0.9;">
                        Los núcleos familiares permiten compartir viviendas y tareas. 
                        Explora los núcleos disponibles y envía una solicitud.
                    </p>
                </div>
                <button 
                    onclick="abrirModalNucleosDisponibles()" 
                    class="btn btn-light"
                    style="
                        padding: 12px 24px; 
                        font-weight: 600; 
                        background: white; 
                        color: #667eea; 
                        border: none; 
                        border-radius: 8px; 
                        cursor: pointer;
                        transition: all 0.3s ease;
                        white-space: nowrap;
                    "
                    onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                    <i class="fas fa-users"></i> Ver Núcleos
                </button>
            </div>
        </div>
    `;
    
    // Insertar al principio (después del título)
    const tituloInicio = inicioSection.querySelector('.section-title, h2');
    if (tituloInicio) {
        tituloInicio.insertAdjacentHTML('afterend', banner);
    } else {
        inicioSection.insertAdjacentHTML('afterbegin', banner);
    }
    
    console.log('✅ Banner de núcleo insertado en inicio');
}

/**
 * Ver detalles del núcleo desde el inicio
 */
async function verDetallesNucleoDesdeInicio(idNucleo) {
    try {
        const response = await fetch(`/api/nucleos/mi-nucleo-info`);
        const data = await response.json();
        
        if (!data.success) {
            alert('❌ Error al cargar detalles del núcleo');
            return;
        }
        
        const nucleo = data.nucleo;
        const miembros = data.miembros || [];
        const miId = data.mi_id;
        
        let miembrosHTML = '';
        
        if (miembros.length > 0) {
            miembrosHTML = `
                <div class="miembros-grid" style="display: grid; gap: 15px; margin-top: 20px;">
                    ${miembros.map(miembro => `
                        <div style="
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 8px;
                            border-left: 4px solid ${miembro.id_usuario == miId ? '#667eea' : '#e0e0e0'};
                        ">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-user-circle" style="font-size: 24px; color: #667eea;"></i>
                                <div style="flex: 1;">
                                    <strong style="color: #333; display: block;">
                                        ${miembro.nombre_completo}
                                        ${miembro.id_usuario == miId ? '<span style="color: #667eea; font-size: 12px;">(Tú)</span>' : ''}
                                    </strong>
                                    <small style="color: #666;">${miembro.email}</small>
                                </div>
                                ${miembro.nombre_rol ? `
                                    <span style="
                                        background: #e3f2fd;
                                        color: #1976d2;
                                        padding: 4px 10px;
                                        border-radius: 12px;
                                        font-size: 11px;
                                        font-weight: 600;
                                    ">
                                        ${miembro.nombre_rol}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            miembrosHTML = '<p style="color: #999; text-align: center; margin-top: 20px;">No hay miembros en este núcleo</p>';
        }
        
        const modal = `
            <div id="detallesNucleoModal" class="material-modal" style="display: flex;">
                <div class="material-modal-content" onclick="event.stopPropagation()">
                    <div class="material-modal-header">
                        <h3>
                            <i class="fas fa-users" style="margin-right: 8px;"></i>
                            ${nucleo.nombre_nucleo || 'Núcleo Familiar'}
                        </h3>
                        <button class="close-material-modal" onclick="cerrarModalDetallesNucleo()">&times;</button>
                    </div>
                    
                    <div style="padding: 0 24px 24px 24px;">
                        ${nucleo.direccion ? `
                            <div style="margin-bottom: 20px; color: #666; font-size: 14px;">
                                <i class="fas fa-map-marker-alt" style="margin-right: 6px;"></i> ${nucleo.direccion}
                            </div>
                        ` : ''}
                        
                        <div style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white;
                            padding: 20px;
                            border-radius: 12px;
                            margin-bottom: 25px;
                        ">
                            <h4 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                                Información del Núcleo
                            </h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                                <div>
                                    <div style="opacity: 0.9; font-size: 13px;">Total de Miembros</div>
                                    <div style="font-size: 28px; font-weight: 700;">${nucleo.total_miembros}</div>
                                </div>
                            </div>
                        </div>
                        
                        <h4 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">
                            <i class="fas fa-users" style="margin-right: 6px;"></i> Miembros del Núcleo
                        </h4>
                        
                        ${miembrosHTML}
                        
                        <div class="form-actions" style="margin-top: 30px;">
                            <button type="button" class="btn btn-secondary" onclick="cerrarModalDetallesNucleo()">
                                <i class="fas fa-times"></i> Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error al cargar detalles del núcleo:', error);
        alert('❌ Error al cargar los detalles del núcleo');
    }
}

/**
 * Cerrar modal de detalles de núcleo
 */
function cerrarModalDetallesNucleo() {
    const modal = document.getElementById('detallesNucleoModal');
    if (modal) {
        modal.remove();
    }
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
}
// ==========================================
// 👤 DATOS DEL USUARIO
// ==========================================

/**
 * Cargar datos del usuario al iniciar
 */
async function cargarDatosUsuario() {
    try {
        const response = await fetch('/api/users/my-profile');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.user) {
            // Actualizar header
            const nombreElement = document.getElementById('user-name-header');
            if (nombreElement) {
                nombreElement.textContent = data.user.nombre_completo || 'Usuario';
            }
            
            const emailElement = document.getElementById('user-email-header');
            if (emailElement) {
                emailElement.textContent = data.user.email || '';
            }
            
            console.log('✅ Datos de usuario cargados correctamente');
        } else {
            console.error('Error en respuesta:', data);
        }
    } catch (error) {
        console.error('Error al cargar datos de usuario:', error);
    }
}

// ==========================================
// 🔄 EXPORTAR FUNCIONES GLOBALES
// ==========================================

window.loadNotifications = loadNotifications;
window.markAsRead = markAsRead;
window.verificarEstadoNucleo = verificarEstadoNucleo;
window.verDetallesNucleoDesdeInicio = verDetallesNucleoDesdeInicio;
window.cargarDatosUsuario = cargarDatosUsuario;

console.log('✅ Módulo de inicio de usuario cargado completamente');
console.log('📦 Funciones exportadas:', {
    loadNotifications: typeof window.loadNotifications,
    verificarEstadoNucleo: typeof window.verificarEstadoNucleo,
    cargarDatosUsuario: typeof window.cargarDatosUsuario
});