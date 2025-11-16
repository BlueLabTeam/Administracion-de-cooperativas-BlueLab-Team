// ==========================================
// 👤 MÓDULO: MI PERFIL
// Gestiona la edición y visualización del perfil de usuario
// Incluye: datos personales, cambio de contraseña, validaciones
// ==========================================

console.log('🟢 Cargando módulo de perfil de usuario');

// ========== VARIABLES GLOBALES ==========
let profileData = {};

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Inicializando módulo de perfil');
    
    // Cargar datos del perfil al inicio
    cargarDatosUsuario();
    
    // Listener para el botón de editar perfil
    const btnEditProfile = document.getElementById('btn-edit-profile');
    if (btnEditProfile) {
        btnEditProfile.addEventListener('click', toggleEditProfile);
    }
    
    // Listener para el formulario de edición
    const formEditProfile = document.getElementById('profile-edit-form');
    if (formEditProfile) {
        formEditProfile.addEventListener('submit', submitProfileEdit);
    }
});

// ==========================================
// 🔄 ALTERNAR ENTRE VISTA Y EDICIÓN
// ==========================================

/**
 * Alternar entre modo vista y modo edición
 */
function toggleEditProfile() {
    const viewDiv = document.getElementById('profile-view');
    const editDiv = document.getElementById('profile-edit');
    const btnText = document.getElementById('btn-edit-text');
    
    // Debug: verificar que los elementos existen
    if (!viewDiv || !editDiv) {
        console.error('Error: No se encontraron los divs de perfil');
        console.log('viewDiv:', viewDiv);
        console.log('editDiv:', editDiv);
        return;
    }
    
    // Mostrar formulario de edición
    if (editDiv.style.display === 'none' || editDiv.style.display === '') {
        console.log('✏️ Abriendo modo edición');
        loadProfileData();
        viewDiv.style.display = 'none';
        editDiv.style.display = 'block';
        if (btnText) btnText.textContent = 'Cancelar';
    } else {
        // Mostrar vista de solo lectura
        console.log('👁️ Volviendo a modo vista');
        viewDiv.style.display = 'block';
        editDiv.style.display = 'none';
        if (btnText) btnText.textContent = 'Editar Perfil';
        
        // Limpiar campos de contraseña
        const passActual = document.getElementById('edit-password-actual');
        const passNueva = document.getElementById('edit-password-nueva');
        const passConfirmar = document.getElementById('edit-password-confirmar');
        
        if (passActual) passActual.value = '';
        if (passNueva) passNueva.value = '';
        if (passConfirmar) passConfirmar.value = '';
    }
}

// ==========================================
// 📥 CARGAR DATOS DEL PERFIL
// ==========================================

/**
 * Cargar datos del perfil para edición
 */
async function loadProfileData() {
    try {
        console.log('📡 Cargando datos del perfil...');
        
        const response = await fetch('/api/users/my-profile');
        const data = await response.json();
        
        if (data.success) {
            profileData = data.user;
            console.log('✅ Datos del perfil cargados:', profileData);
            
            // Llenar formulario de edición
            document.getElementById('edit-nombre').value = profileData.nombre_completo || '';
            document.getElementById('edit-cedula').value = profileData.cedula || '';
            document.getElementById('edit-email').value = profileData.email || '';
            document.getElementById('edit-direccion').value = profileData.direccion || '';
            document.getElementById('edit-fecha-nacimiento').value = profileData.fecha_nacimiento || '';
            document.getElementById('edit-telefono').value = profileData.telefono || '';
            
            // Actualizar vista de solo lectura también
            updateProfileView(profileData);
        } else {
            alert('Error al cargar datos del perfil');
        }
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        alert('Error de conexión al cargar perfil');
    }
}

/**
 * Actualizar la vista de solo lectura
 */
function updateProfileView(user) {
    console.log('🔄 Actualizando vista de perfil');
    
    // Actualizar nombre
    const nombreEl = document.getElementById('display-nombre');
    if (nombreEl) {
        nombreEl.textContent = user.nombre_completo || 'No disponible';
    }
    
    // Actualizar cédula
    const cedulaEl = document.getElementById('display-cedula');
    if (cedulaEl) {
        cedulaEl.textContent = user.cedula || 'No disponible';
    }
    
    // Actualizar email
    const emailEl = document.getElementById('display-email');
    if (emailEl) {
        emailEl.textContent = user.email || 'No disponible';
    }
    
    // Actualizar dirección
    const direccionEl = document.getElementById('display-direccion');
    if (direccionEl) {
        direccionEl.textContent = user.direccion || 'No especificada';
    }
    
    // Actualizar fecha de nacimiento
    const fechaNacEl = document.getElementById('display-fecha-nacimiento');
    if (fechaNacEl && user.fecha_nacimiento) {
        const fecha = new Date(user.fecha_nacimiento + 'T00:00:00');
        fechaNacEl.textContent = fecha.toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } else if (fechaNacEl) {
        fechaNacEl.textContent = 'No especificada';
    }
    
    // Actualizar teléfono
    const telefonoEl = document.getElementById('display-telefono');
    if (telefonoEl) {
        telefonoEl.textContent = user.telefono || 'No especificado';
    }
    
    console.log('✅ Vista de perfil actualizada');
}

/**
 * Cargar datos del usuario al iniciar (para el header)
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
            
            // Actualizar vista del perfil
            updateProfileView(data.user);
            
            // Guardar datos globalmente
            profileData = data.user;
            
            console.log('✅ Datos de usuario cargados correctamente');
        } else {
            console.error('Error en respuesta:', data);
        }
    } catch (error) {
        console.error('Error al cargar datos de usuario:', error);
    }
}

// ==========================================
// 💾 GUARDAR CAMBIOS DEL PERFIL
// ==========================================

/**
 * Enviar formulario de edición
 */
async function submitProfileEdit(event) {
    event.preventDefault();
    
    console.log('💾 Enviando formulario de perfil...');
    
    // Obtener valores del formulario
    const nombre = document.getElementById('edit-nombre').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const direccion = document.getElementById('edit-direccion').value.trim();
    const fechaNacimiento = document.getElementById('edit-fecha-nacimiento').value;
    const telefono = document.getElementById('edit-telefono').value.trim();
    
    const passwordActual = document.getElementById('edit-password-actual').value;
    const passwordNueva = document.getElementById('edit-password-nueva').value;
    const passwordConfirmar = document.getElementById('edit-password-confirmar').value;
    
    // ========== VALIDACIONES ==========
    
    // Validar campos obligatorios
    if (!nombre || !email) {
        alert('⚠️ El nombre y email son obligatorios');
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('⚠️ Por favor ingresa un email válido');
        return;
    }
    
    // Validar cambio de contraseña
    if (passwordNueva || passwordConfirmar) {
        if (!passwordActual) {
            alert('⚠️ Debes ingresar tu contraseña actual para cambiarla');
            return;
        }
        
        if (passwordNueva.length < 6) {
            alert('⚠️ La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        if (passwordNueva !== passwordConfirmar) {
            alert('⚠️ Las contraseñas nuevas no coinciden');
            return;
        }
    }
    
    // Confirmar cambios
    if (!confirm('¿Estás seguro de guardar los cambios?')) {
        console.log('❌ Usuario canceló la actualización');
        return;
    }
    
    // ========== PREPARAR Y ENVIAR DATOS ==========
    
    const formData = new FormData();
    formData.append('nombre_completo', nombre);
    formData.append('email', email);
    formData.append('direccion', direccion);
    formData.append('fecha_nacimiento', fechaNacimiento);
    formData.append('telefono', telefono);
    
    if (passwordActual && passwordNueva) {
        formData.append('password_actual', passwordActual);
        formData.append('password_nueva', passwordNueva);
    }
    
    // Mostrar indicador de carga
    const submitBtn = document.querySelector('#profile-edit-form button[type="submit"]');
    const btnOriginalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }
    
    try {
        const response = await fetch('/api/users/update-profile', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Perfil actualizado exitosamente');
            alert('✅ ' + data.message);
            
            // Recargar los datos del usuario para actualizar la vista
            await cargarDatosUsuario();
            
            // Volver a vista de solo lectura
            toggleEditProfile();
            
            // Actualizar sesión si es necesario
            if (data.reload) {
                console.log('🔄 Recargando página...');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } else {
            console.error('❌ Error en respuesta:', data);
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('❌ Error al actualizar perfil:', error);
        alert('❌ Error de conexión al guardar cambios');
    } finally {
        // Restaurar botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnOriginalText;
        }
    }
}

// ==========================================
// 🔧 FUNCIONES AUXILIARES
// ==========================================

/**
 * Validar formato de email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validar longitud de contraseña
 */
function validarPassword(password, minLength = 6) {
    return password && password.length >= minLength;
}

/**
 * Formatear fecha para input date
 */
function formatearFechaParaInput(fecha) {
    if (!fecha) return '';
    const d = new Date(fecha + 'T00:00:00');
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Formatear fecha para mostrar (formato UY)
 */
function formatearFechaUY(fecha) {
    if (!fecha) return 'No especificada';
    const f = new Date(fecha + 'T00:00:00');
    return f.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// ==========================================
// 🎨 MEJORAS DE UX
// ==========================================

/**
 * Mostrar indicador de contraseña fuerte
 */
function mostrarIndicadorPassword() {
    const passwordInput = document.getElementById('edit-password-nueva');
    
    if (!passwordInput) return;
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const indicator = document.getElementById('password-strength-indicator');
        
        if (!indicator) return;
        
        let strength = 0;
        let message = '';
        let color = '';
        
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        if (strength === 0) {
            message = '';
            color = '';
        } else if (strength <= 2) {
            message = 'Débil';
            color = '#f44336';
        } else if (strength <= 3) {
            message = 'Media';
            color = '#ff9800';
        } else {
            message = 'Fuerte';
            color = '#4caf50';
        }
        
        indicator.textContent = message;
        indicator.style.color = color;
    });
}

/**
 * Validación en tiempo real
 */
function inicializarValidacionTiempoReal() {
    // Validar email
    const emailInput = document.getElementById('edit-email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !validarEmail(email)) {
                this.style.borderColor = '#f44336';
                mostrarMensajeError(this, 'Email inválido');
            } else {
                this.style.borderColor = '';
                ocultarMensajeError(this);
            }
        });
    }
    
    // Validar confirmación de contraseña
    const passNueva = document.getElementById('edit-password-nueva');
    const passConfirmar = document.getElementById('edit-password-confirmar');
    
    if (passNueva && passConfirmar) {
        passConfirmar.addEventListener('input', function() {
            if (this.value && this.value !== passNueva.value) {
                this.style.borderColor = '#f44336';
                mostrarMensajeError(this, 'Las contraseñas no coinciden');
            } else {
                this.style.borderColor = '';
                ocultarMensajeError(this);
            }
        });
    }
}

function mostrarMensajeError(input, mensaje) {
    let errorDiv = input.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('error-message')) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #f44336; font-size: 12px; margin-top: 5px;';
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
    errorDiv.textContent = mensaje;
}

function ocultarMensajeError(input) {
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
        errorDiv.remove();
    }
}

// Inicializar mejoras de UX cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        mostrarIndicadorPassword();
        inicializarValidacionTiempoReal();
    }, 500);
});

// ==========================================
// 🔄 EXPORTAR FUNCIONES GLOBALES
// ==========================================

window.toggleEditProfile = toggleEditProfile;
window.submitProfileEdit = submitProfileEdit;
window.loadProfileData = loadProfileData;
window.updateProfileView = updateProfileView;
window.cargarDatosUsuario = cargarDatosUsuario;

// Exportar funciones auxiliares
window.validarEmail = validarEmail;
window.validarPassword = validarPassword;
window.formatearFechaUY = formatearFechaUY;

console.log('✅ Módulo de perfil de usuario cargado completamente');
console.log('📦 Funciones exportadas:', {
    toggleEditProfile: typeof window.toggleEditProfile,
    submitProfileEdit: typeof window.submitProfileEdit,
    loadProfileData: typeof window.loadProfileData,
    cargarDatosUsuario: typeof window.cargarDatosUsuario
});