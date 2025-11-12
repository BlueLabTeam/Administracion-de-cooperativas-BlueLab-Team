// ==========================================
// SISTEMA DE NAVEGACIÓN - DASHBOARD ADMIN
// Maneja el cambio entre secciones
// ==========================================

console.log('🟢 [NAV] Sistema de navegación cargado');

document.addEventListener('DOMContentLoaded', function () {
    console.log('📋 [NAV] Inicializando navegación...');

    const menuItems = document.querySelectorAll('.menu li[data-section]');
    
    console.log(`📋 [NAV] ${menuItems.length} items de menú encontrados`);

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            const section = this.getAttribute('data-section');
            console.log(`📄 [NAV] Cambiando a sección: ${section}`);

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
                console.log(`✅ [NAV] Sección ${section} activada`);

                // Cargar datos según la sección
                cargarDatosSeccion(section);
            } else {
                console.error(`❌ [NAV] Sección no encontrada: ${section}`);
            }
        });
    });
});

// ========== CARGAR DATOS POR SECCIÓN ==========
function cargarDatosSeccion(section) {
    console.log(`📊 [NAV] Cargando datos para: ${section}`);

    switch(section) {
        case 'inicio':
            console.log('🏠 [NAV] Sección inicio (estática)');
            break;

        case 'usuarios':
            console.log('👥 [NAV] Cargando usuarios...');
            if (typeof loadUsersForTable === 'function') {
                loadUsersForTable();
            } else {
                console.error('❌ [NAV] loadUsersForTable no definida');
            }
            break;

        case 'notificaciones':
            console.log('🔔 [NAV] Cargando notificaciones...');
            if (typeof loadUsersForNotifications === 'function') {
                loadUsersForNotifications();
            } else {
                console.error('❌ [NAV] loadUsersForNotifications no definida');
            }
            break;

        case 'nucleo':
            console.log('👨‍👩‍👧‍👦 [NAV] Cargando núcleos...');
            if (typeof loadNucleosFamiliares === 'function') {
                loadNucleosFamiliares();
            } else {
                console.error('❌ [NAV] loadNucleosFamiliares no definida');
            }
            break;

        case 'viviendas':
            console.log('🏘️ [NAV] Cargando viviendas...');
            if (typeof loadViviendas === 'function') {
                loadViviendas();
            }
            if (typeof loadTiposVivienda === 'function') {
                loadTiposVivienda();
            }
            break;

        case 'materiales':
            console.log('📦 [NAV] Cargando materiales...');
            if (typeof loadMateriales === 'function') {
                loadMateriales();
            } else {
                console.error('❌ [NAV] loadMateriales no definida');
            }
            break;

        case 'tareas':
            console.log('✅ [NAV] Cargando tareas...');
            if (typeof loadTaskUsers === 'function') {
                loadTaskUsers();
            }
            if (typeof loadNucleos === 'function') {
                loadNucleos();
            }
            if (typeof loadAllTasks === 'function') {
                loadAllTasks();
            }
            if (typeof loadMaterialesParaTarea === 'function') {
                setTimeout(() => loadMaterialesParaTarea(), 300);
            }
            break;

        case 'cuotas':
            console.log('💰 [NAV] Cargando cuotas...');
            
            // VERIFICAR QUE LAS FUNCIONES EXISTAN ANTES DE LLAMARLAS
            if (typeof loadPreciosCuotas === 'function') {
                console.log('✅ [NAV] Llamando loadPreciosCuotas()');
                loadPreciosCuotas();
            } else {
                console.error('❌ [NAV] loadPreciosCuotas NO está definida');
            }
            
            if (typeof loadAllCuotasAdmin === 'function') {
                console.log('✅ [NAV] Llamando loadAllCuotasAdmin()');
                loadAllCuotasAdmin();
            } else {
                console.error('❌ [NAV] loadAllCuotasAdmin NO está definida');
            }
            
            if (typeof loadEstadisticasCuotas === 'function') {
                console.log('✅ [NAV] Llamando loadEstadisticasCuotas()');
                loadEstadisticasCuotas();
            } else {
                console.error('❌ [NAV] loadEstadisticasCuotas NO está definida');
            }
            break;

        case 'solicitudes':
            console.log('📝 [NAV] Cargando solicitudes...');
            if (typeof loadAllSolicitudes === 'function') {
                loadAllSolicitudes();
            }
            if (typeof loadEstadisticasSolicitudes === 'function') {
                loadEstadisticasSolicitudes();
            }
            break;

        case 'reportes':
            console.log('📊 [NAV] Cargando reportes...');
            if (typeof inicializarReportes === 'function') {
                inicializarReportes();
            } else {
                console.error('❌ [NAV] inicializarReportes no definida');
            }
            break;

        default:
            console.warn(`⚠️ [NAV] Sección sin handler: ${section}`);
    }
}

console.log('✅ [NAV] Sistema de navegación listo');