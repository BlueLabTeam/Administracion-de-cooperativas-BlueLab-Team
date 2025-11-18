// ==========================================
// 🧭 MÓDULO: NAVEGACIÓN DE USUARIO
// Sistema de navegación entre secciones del dashboard
// ==========================================

console.log('🟢 [NAV-USER] Sistema de navegación de usuario cargado');

document.addEventListener('DOMContentLoaded', function () {
    console.log(' [NAV-USER] Inicializando navegación');

    const menuItems = document.querySelectorAll('.menu li[data-section]');
    
    if (menuItems.length === 0) {
        console.warn('⚠️ [NAV-USER] No se encontraron items de menú');
        return;
    }

    console.log(` [NAV-USER] ${menuItems.length} items de menú encontrados`);

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            const section = this.getAttribute('data-section');
            console.log(`🎯 [NAV-USER] Navegando a sección: ${section}`);

            // Remover clase activa de todos los items del menú
            menuItems.forEach(mi => mi.classList.remove('activo'));
            
            // Agregar clase activa al item clickeado
            this.classList.add('activo');

            // Ocultar todas las secciones
            document.querySelectorAll('.section-content').forEach(s => {
                s.classList.remove('active');
            });

            // Mostrar la sección seleccionada
            const targetSection = document.getElementById(section + '-section');
            
            if (targetSection) {
                targetSection.classList.add('active');
                console.log(` [NAV-USER] Sección "${section}" activada`);

                // Cargar datos según la sección
                cargarDatosSeccionUsuario(section);
            } else {
                console.error(` [NAV-USER] Sección no encontrada: ${section}-section`);
            }
        });
    });

    // Activar sección inicial (inicio)
    const seccionInicial = document.querySelector('.menu li[data-section="inicio"]');
    if (seccionInicial) {
        console.log(' [NAV-USER] Activando sección inicial');
        seccionInicial.click();
    }
});

// ========== CARGAR DATOS POR SECCIÓN ==========
function cargarDatosSeccionUsuario(section) {
    console.log(`📂 [NAV-USER] Cargando datos para: ${section}`);

    switch(section) {
        case 'inicio':
            console.log(' [NAV-USER] Sección Inicio');
            // Cargar núcleo familiar
            if (typeof verificarEstadoNucleo === 'function') {
                verificarEstadoNucleo();
            } else {
                console.warn('⚠️ [NAV-USER] verificarEstadoNucleo no definida');
            }
            break;

        case 'perfil':
            console.log(' [NAV-USER] Sección Perfil');
            // Cargar datos del usuario
            if (typeof cargarDatosUsuario === 'function') {
                cargarDatosUsuario();
            } else {
                console.warn('⚠️ [NAV-USER] cargarDatosUsuario no definida');
            }
            break;

        case 'horas':
            console.log(' [NAV-USER] Sección Horas');
            // Inicializar sección de horas
            if (typeof inicializarSeccionHoras === 'function') {
                inicializarSeccionHoras();
            } else {
                console.error(' [NAV-USER] inicializarSeccionHoras no definida');
            }
            break;

        case 'tareas':
            console.log(' [NAV-USER] Sección Tareas');
            // Cargar tareas del usuario
            if (typeof loadUserTasks === 'function') {
                loadUserTasks();
            } else {
                console.error(' [NAV-USER] loadUserTasks no definida');
            }
            break;

        case 'vivienda':
            console.log(' [NAV-USER] Sección Vivienda');
            // Cargar información de vivienda
            if (typeof loadMyVivienda === 'function') {
                loadMyVivienda();
            } else {
                console.warn('⚠️ [NAV-USER] loadMyVivienda no definida');
            }
            break;

        case 'cuotas':
            console.log(' [NAV-USER] Sección Cuotas');
            // Inicializar sección de cuotas
            if (typeof inicializarSeccionCuotas === 'function') {
                inicializarSeccionCuotas();
            } else {
                console.error(' [NAV-USER] inicializarSeccionCuotas no definida');
            }
            break;

        case 'solicitudes':
            console.log('📨 [NAV-USER] Sección Solicitudes');
            // Cargar solicitudes del usuario
            if (typeof loadMisSolicitudes === 'function') {
                loadMisSolicitudes();
            } else {
                console.error(' [NAV-USER] loadMisSolicitudes no definida');
            }
            break;

        case 'notificaciones':
            console.log(' [NAV-USER] Sección Notificaciones');
            // Cargar notificaciones
            if (typeof loadNotifications === 'function') {
                loadNotifications();
            } else {
                console.warn('⚠️ [NAV-USER] loadNotifications no definida');
            }
            break;

        default:
            console.warn(`⚠️ [NAV-USER] Sección sin handler: ${section}`);
    }
}

// ========== FUNCIÓN AUXILIAR: VERIFICAR FUNCIÓN DISPONIBLE ==========
function verificarFuncionDisponible(nombreFuncion, seccion) {
    if (typeof window[nombreFuncion] === 'function') {
        console.log(` [NAV-USER] ${nombreFuncion} disponible para ${seccion}`);
        return true;
    } else {
        console.error(` [NAV-USER] ${nombreFuncion} NO está definida para ${seccion}`);
        return false;
    }
}

// ========== NAVEGACIÓN PROGRAMÁTICA ==========
/**
 * Navegar a una sección específica programáticamente
 * @param {string} seccionNombre - Nombre de la sección (sin -section)
 */
function navegarASeccion(seccionNombre) {
    console.log(`🎯 [NAV-USER] Navegación programática a: ${seccionNombre}`);
    
    const menuItem = document.querySelector(`.menu li[data-section="${seccionNombre}"]`);
    
    if (menuItem) {
        menuItem.click();
    } else {
        console.error(` [NAV-USER] No se encontró menu item para: ${seccionNombre}`);
    }
}

// ========== OBTENER SECCIÓN ACTUAL ==========
/**
 * Obtener el nombre de la sección actualmente activa
 * @returns {string|null} Nombre de la sección activa o null
 */
function obtenerSeccionActual() {
    const menuActivo = document.querySelector('.menu li.activo[data-section]');
    
    if (menuActivo) {
        const seccion = menuActivo.getAttribute('data-section');
        console.log(`📍 [NAV-USER] Sección actual: ${seccion}`);
        return seccion;
    }
    
    console.warn('⚠️ [NAV-USER] No hay sección activa');
    return null;
}

// ========== CALLBACKS DE NAVEGACIÓN ==========
/**
 * Registrar callback para cuando se cambia de sección
 * @param {Function} callback - Función a ejecutar (recibe nombre de sección)
 */
function onCambioSeccion(callback) {
    if (typeof callback !== 'function') {
        console.error(' [NAV-USER] onCambioSeccion requiere una función');
        return;
    }
    
    document.addEventListener('seccionCambiada', function(e) {
        console.log(`🔄 [NAV-USER] Callback ejecutado para: ${e.detail.seccion}`);
        callback(e.detail.seccion);
    });
}

// ========== EVENTO PERSONALIZADO AL CAMBIAR SECCIÓN ==========
function dispararEventoCambioSeccion(seccion) {
    const evento = new CustomEvent('seccionCambiada', {
        detail: { seccion: seccion }
    });
    document.dispatchEvent(evento);
}

// Modificar cargarDatosSeccionUsuario para disparar evento
const cargarDatosSeccionUsuarioOriginal = cargarDatosSeccionUsuario;
cargarDatosSeccionUsuario = function(section) {
    cargarDatosSeccionUsuarioOriginal(section);
    dispararEventoCambioSeccion(section);
};

// ========== EXPORTAR FUNCIONES GLOBALES ==========
window.cargarDatosSeccionUsuario = cargarDatosSeccionUsuario;
window.navegarASeccion = navegarASeccion;
window.obtenerSeccionActual = obtenerSeccionActual;
window.onCambioSeccion = onCambioSeccion;

console.log(' [NAV-USER] Sistema de navegación listo');
console.log(' [NAV-USER] Funciones exportadas:', {
    cargarDatosSeccionUsuario: typeof window.cargarDatosSeccionUsuario,
    navegarASeccion: typeof window.navegarASeccion,
    obtenerSeccionActual: typeof window.obtenerSeccionActual,
    onCambioSeccion: typeof window.onCambioSeccion
});