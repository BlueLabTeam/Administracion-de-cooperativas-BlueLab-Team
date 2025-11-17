

console.log('🟢 [NAV] Sistema de navegación cargado');

document.addEventListener('DOMContentLoaded', function () {
 

    const menuItems = document.querySelectorAll('.menu li[data-section]');
    
  

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            const section = this.getAttribute('data-section');
          

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
 

    switch(section) {
        case 'inicio':
        
            break;

        case 'usuarios':
     
            if (typeof loadUsersForTable === 'function') {
                loadUsersForTable();
            } else {
                console.error('❌ [NAV] loadUsersForTable no definida');
            }
            break;

        case 'notificaciones':
         
            if (typeof loadUsersForNotifications === 'function') {
                loadUsersForNotifications();
            } else {
                console.error('❌ [NAV] loadUsersForNotifications no definida');
            }
            break;

        case 'nucleo':
       
            if (typeof loadNucleosFamiliares === 'function') {
                loadNucleosFamiliares();
            } else {
                console.error('❌ [NAV] loadNucleosFamiliares no definida');
            }
            break;

        case 'viviendas':
     
            if (typeof loadViviendas === 'function') {
                loadViviendas();
            }
            if (typeof loadTiposVivienda === 'function') {
                loadTiposVivienda();
            }
            break;

        case 'materiales':
  
            if (typeof loadMateriales === 'function') {
                loadMateriales();
            } else {
                console.error('❌ [NAV] loadMateriales no definida');
            }
            break;

        case 'tareas':
        
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
        
            // VERIFICAR QUE LAS FUNCIONES EXISTAN ANTES DE LLAMARLAS
            if (typeof loadPreciosCuotas === 'function') {
             
                loadPreciosCuotas();
            } else {
                console.error('❌ [NAV] loadPreciosCuotas NO está definida');
            }
            
            if (typeof loadAllCuotasAdmin === 'function') {
    
                loadAllCuotasAdmin();
            } else {
                console.error('❌ [NAV] loadAllCuotasAdmin NO está definida');
            }
            
            if (typeof loadEstadisticasCuotas === 'function') {
             
                loadEstadisticasCuotas();
            } else {
                console.error('❌ [NAV] loadEstadisticasCuotas NO está definida');
            }
            break;

        case 'solicitudes':
         
            if (typeof loadAllSolicitudes === 'function') {
                loadAllSolicitudes();
            }
            if (typeof loadEstadisticasSolicitudes === 'function') {
                loadEstadisticasSolicitudes();
            }
            break;

        case 'reportes':
     
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

console.log(' [NAV] Sistema de navegación listo');

document.addEventListener('DOMContentLoaded', () => {
    const toggleMenuBtn = document.querySelector('.toggle-menu-btn');
    const menu = document.querySelector('nav.menu');
    const miniToggleBtn = document.querySelector('.mini-toggle-menu-btn');

    // Función al minimizar/expandir
    toggleMenuBtn.addEventListener('click', () => {
        menu.classList.toggle('menu-minimized');

        // Si el menú se minimiza, mostramos el botón mini
        if (menu.classList.contains('menu-minimized')) {
            miniToggleBtn.style.display = 'block';
            menu.style.display = 'none';
        } else {
            miniToggleBtn.style.display = 'none';
            menu.style.display = 'block';
        }
    });

    // Función del botón mini para mostrar el menú de nuevo
    miniToggleBtn.addEventListener('click', () => {
        menu.classList.remove('menu-minimized');
        menu.style.display = 'block';
        miniToggleBtn.style.display = 'none';
    });
});