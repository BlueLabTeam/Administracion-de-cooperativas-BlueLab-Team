// Cargar datos del usuario al iniciar
document.addEventListener('DOMContentLoaded', async function() {
    
    // Cargar datos del usuario desde el servidor
    await cargarDatosUsuario();
    
    // Inicializar navegación del menú
    inicializarNavegacion();
});

// Función para cargar datos del usuario
async function cargarDatosUsuario() {
    try {
        const response = await fetch('/src/Controllers/get_user_data.php');
        
        if (!response.ok) {
            throw new Error('Error al cargar datos del usuario');
        }
        
        const userData = await response.json();
        
        // Actualizar el nombre del usuario
        const nombreElement = document.querySelector('.nombre');
        if (nombreElement) {
            nombreElement.textContent = userData.nombre_completo;
        }
        
        // Mostrar botón de admin si es administrador
        if (userData.is_admin) {
            mostrarBotonAdmin();
        }
        
    } catch (error) {
        console.error('Error:', error);
        // En caso de error, mostrar "Usuario" por defecto
        const nombreElement = document.querySelector('.nombre');
        if (nombreElement) {
            nombreElement.textContent = 'Usuario';
        }
    }
}

// Función para mostrar el botón de admin
function mostrarBotonAdmin() {
    const adminContainer = document.getElementById('admin-button-container');
    if (adminContainer) {
        adminContainer.innerHTML = `
            <a href="/dashboard-admin" style="text-decoration: none;">
                <button class="btn-admin" type="button">
                    <i class="fas fa-user-shield"></i> Admin
                </button>
            </a>
        `;
    }
}

// Función para inicializar la navegación entre secciones
function inicializarNavegacion() {
    const menuItems = document.querySelectorAll('.menu li');
    const secciones = document.querySelectorAll('.seccion');
    
    // Por defecto, mostrar "Inicio"
    const defaultSection = 'inicio';
    
    menuItems.forEach(li => {
        li.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section');
            
            // Remover clase activa de todos
            menuItems.forEach(item => item.classList.remove('activo'));
            secciones.forEach(sec => sec.classList.remove('activa'));
            
            // Activar el seleccionado
            this.classList.add('activo');
            
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('activa');
            }
        });
    });
}