// ==========================================
// PANEL DE INICIO - ADMINISTRADOR
// Solo la sección de inicio del dashboard
// ==========================================

console.log('🟢 [INICIO] Módulo de inicio administrativo cargado');

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    const inicioMenuItem = document.querySelector('.menu li[data-section="inicio"]');
    if (inicioMenuItem) {
        inicioMenuItem.addEventListener('click', function() {
            console.log('>>> Sección inicio abierta');
            // La sección de inicio ya está visible por defecto
            // Aquí puedes agregar lógica adicional si es necesaria
        });
    }
});

// El contenido de la sección de inicio está directamente en el HTML
// No requiere JavaScript adicional para funcionar

console.log('✅ [INICIO] Sección de inicio lista')