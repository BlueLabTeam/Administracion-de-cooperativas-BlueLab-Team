
(function() {
    'use strict';
    
    

    // Evitar carga duplicada
    if (window.GestionNotificacionesCargado) {
        console.warn('⚠️ [NOTIFICACIONES] Ya cargado');
        return;
    }
    window.GestionNotificacionesCargado = true;

    // ========== COLORES ==========
    const COLORS = {
        primary: '#005CB9',
        primaryDark: '#004494',
        primaryLight: '#E3F2FD',
        white: '#FFFFFF',
        gray50: '#F5F7FA',
        gray100: '#E8EBF0',
        gray500: '#6C757D',
        gray700: '#495057',
        success: '#4CAF50',
        warning: '#FF9800',
        danger: '#F44336',
        shadow: '0 4px 12px rgba(0, 92, 185, 0.12)'
    };

    // ========== CARGAR USUARIOS ==========

    window.loadUsersForNotifications = async function() {
       
        
        const usersList = document.getElementById('usersList');

        if (!usersList) {
            console.error('❌ [NOTIFICACIONES] Container usersList no encontrado');
            return;
        }

        usersList.innerHTML = '<p class="loading">Cargando usuarios...</p>';

        try {
            const response = await fetch('/api/notifications/users', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (data.success) {
                renderUsersList(data.users);
            } else {
                usersList.innerHTML = '<p class="error">Error: ' + data.message + '</p>';
            }
        } catch (error) {
            console.error('❌ [NOTIFICACIONES] Error:', error);
            usersList.innerHTML = '<p class="error">Error de conexión</p>';
        }
    };

    function renderUsersList(users) {
        const container = document.getElementById('usersList');
        
        if (!users || users.length === 0) {
            container.innerHTML = '<p>No hay usuarios disponibles</p>';
            return;
        }

        let html = '<div style="display:flex;flex-direction:column;gap:10px;max-height:400px;overflow-y:auto;border:1px solid ' + COLORS.gray100 + ';border-radius:8px;padding:15px;background:' + COLORS.gray50 + ';">';
        
        users.forEach(function(user) {
            html += '<label style="display:flex;align-items:center;gap:12px;padding:12px;background:' + COLORS.white + ';border:1px solid ' + COLORS.gray100 + ';border-radius:6px;cursor:pointer;">';
            html += '<input type="checkbox" name="usuarios[]" value="' + user.id_usuario + '" style="width:18px;height:18px;cursor:pointer;accent-color:' + COLORS.primary + ';">';
            html += '<div style="flex:1;"><div style="font-weight:600;color:' + COLORS.gray700 + ';font-size:14px;">' + user.nombre_completo + '</div>';
            html += '<div style="font-size:12px;color:' + COLORS.gray500 + ';margin-top:2px;">' + user.email + '</div></div>';
            html += '<div style="font-size:11px;color:' + COLORS.gray500 + ';background:' + COLORS.gray100 + ';padding:4px 8px;border-radius:12px;">CI: ' + user.cedula + '</div>';
            html += '</label>';
        });
        
        html += '</div>';
        container.innerHTML = html;
        
     
    }

    // ========== SELECCIONAR TODOS ==========

    window.toggleAllUsers = function() {
    
        
        const checkboxes = document.querySelectorAll('input[name="usuarios[]"]');
        const allChecked = Array.from(checkboxes).every(function(cb) { return cb.checked; });
        
        checkboxes.forEach(function(cb) {
            cb.checked = !allChecked;
        });
        
        const selectedCount = Array.from(checkboxes).filter(function(cb) { return cb.checked; }).length;
      
    };

    // ========== ENVIAR NOTIFICACIÓN ==========

    window.sendNotification = async function(event) {
        event.preventDefault();
        

        const form = event.target;
        const formData = new FormData(form);
        
        const selectedUsers = Array.from(document.querySelectorAll('input[name="usuarios[]"]:checked'))
            .map(function(cb) { return cb.value; });

        if (selectedUsers.length === 0) {
            alert('⚠️ Debes seleccionar al menos un usuario');
            return;
        }

        const titulo = formData.get('titulo');
        const mensaje = formData.get('mensaje');
        const prioridad = formData.get('prioridad');
        
        if (!titulo || !mensaje) {
            alert('⚠️ Título y mensaje son requeridos');
            return;
        }

        if (!confirm('¿Enviar notificación a ' + selectedUsers.length + ' usuario(s)?')) {
            return;
        }

        formData.delete('usuarios[]');
        selectedUsers.forEach(function(userId) {
            formData.append('usuarios[]', userId);
        });

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            const response = await fetch('/api/notifications/create', { 
                method: 'POST', 
                body: formData 
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(' ' + data.message);
                form.reset();
                document.querySelectorAll('input[name="usuarios[]"]').forEach(function(cb) {
                    cb.checked = false;
                });
            } else {
                alert('❌ Error: ' + data.message);
            }
        } catch (error) {
            console.error('❌ [NOTIFICACIONES] Error:', error);
            alert('❌ Error al enviar notificación');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    };

    // ========== VISTA PREVIA ==========

    window.previewNotification = function() {
     
        
        const tituloEl = document.getElementById('notif-titulo');
        const mensajeEl = document.getElementById('notif-mensaje');
        const prioridadEl = document.getElementById('notif-prioridad');
        
        if (!tituloEl || !mensajeEl) {
            alert('⚠️ Elementos del formulario no encontrados');
            return;
        }
        
        const titulo = tituloEl.value || '';
        const mensaje = mensajeEl.value || '';
        const prioridad = prioridadEl ? prioridadEl.value : 'normal';
        
        if (!titulo || !mensaje) {
            alert('⚠️ Completa título y mensaje');
            return;
        }

        const selectedUsers = Array.from(document.querySelectorAll('input[name="usuarios[]"]:checked')).length;
        
        let prioridadColor = COLORS.primary;
        let prioridadIcon = 'fa-info-circle';
        
        if (prioridad === 'alta') {
            prioridadColor = COLORS.danger;
            prioridadIcon = 'fa-exclamation-triangle';
        } else if (prioridad === 'urgente') {
            prioridadColor = '#D32F2F';
            prioridadIcon = 'fa-exclamation-circle';
        }

        const previewHTML = '<div class="modal-overlay" onclick="if(event.target.classList.contains(\'modal-overlay\')) this.remove()">' +
            '<div class="modal-content-large" style="max-width:600px;">' +
            '<button class="modal-close-btn" onclick="this.closest(\'.modal-overlay\').remove()">×</button>' +
            '<h2 class="modal-title"><i class="fas fa-eye"></i> Vista Previa</h2>' +
            '<div style="background:' + COLORS.gray50 + ';padding:15px;border-radius:8px;margin-bottom:20px;">' +
            '<strong style="color:' + COLORS.primary + ';"> Resumen:</strong>' +
            '<p style="margin:10px 0 0 0;color:' + COLORS.gray700 + ';">Se enviará a <strong>' + selectedUsers + '</strong> usuario(s)</p>' +
            '</div>' +
            '<div style="border:2px solid ' + prioridadColor + ';border-radius:12px;padding:20px;background:' + COLORS.white + ';box-shadow:' + COLORS.shadow + ';">' +
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">' +
            '<i class="fas ' + prioridadIcon + '" style="font-size:24px;color:' + prioridadColor + ';"></i>' +
            '<div style="flex:1;"><h3 style="margin:0;color:' + COLORS.gray700 + ';font-size:18px;">' + titulo + '</h3>' +
            '<small style="color:' + COLORS.gray500 + ';">Prioridad: <strong style="color:' + prioridadColor + ';text-transform:uppercase;">' + prioridad + '</strong></small></div></div>' +
            '<div style="padding:15px;background:' + COLORS.gray50 + ';border-radius:8px;color:' + COLORS.gray700 + ';line-height:1.6;white-space:pre-wrap;">' + mensaje + '</div>' +
            '<div style="margin-top:15px;padding-top:15px;border-top:1px solid ' + COLORS.gray100 + ';font-size:12px;color:' + COLORS.gray500 + ';">' +
            '<i class="fas fa-clock"></i> Enviado: ' + new Date().toLocaleString('es-UY') + '</div></div>' +
            '<div class="form-actions" style="margin-top:20px;">' +
            '<button class="btn btn-secondary" onclick="this.closest(\'.modal-overlay\').remove()">Cerrar</button></div></div></div>';

        document.body.insertAdjacentHTML('beforeend', previewHTML);
    };

    // ========== FILTRAR ==========

    window.filterUsersNotifications = function() {
        const searchInput = document.getElementById('search-users-notif');
        const searchText = searchInput ? searchInput.value.toLowerCase() : '';
        const labels = document.querySelectorAll('#usersList label');
        
        let visibleCount = 0;
        
        labels.forEach(function(label) {
            const text = label.textContent.toLowerCase();
            if (text.includes(searchText)) {
                label.style.display = 'flex';
                visibleCount++;
            } else {
                label.style.display = 'none';
            }
        });
        
     
    };

    // ========== TEMPLATES ==========

    window.applyNotificationTemplate = function() {
        const templates = {
            '1': {
                titulo: 'Recordatorio de Cuota Mensual',
                mensaje: 'Estimado/a,\n\nLe recordamos que tiene una cuota pendiente de pago.\n\nGracias.',
                prioridad: 'normal'
            },
            '2': {
                titulo: 'Nueva Tarea Asignada',
                mensaje: 'Se le ha asignado una nueva tarea.\n\nRevise los detalles en su panel.\n\nGracias.',
                prioridad: 'normal'
            },
            '3': {
                titulo: '⚠️ URGENTE: Acción Requerida',
                mensaje: 'Se requiere su atención inmediata.\n\nRevise su panel lo antes posible.',
                prioridad: 'urgente'
            }
        };
        
        const opcion = prompt(' PLANTILLAS\n\n1 = Cuota\n2 = Tarea\n3 = Urgente\n\nEscribe el número:');
        
        if (!opcion || !templates[opcion]) return;
        
        const template = templates[opcion];
        
        const tituloEl = document.getElementById('notif-titulo');
        const mensajeEl = document.getElementById('notif-mensaje');
        const prioridadEl = document.getElementById('notif-prioridad');
        
        if (tituloEl) tituloEl.value = template.titulo;
        if (mensajeEl) mensajeEl.value = template.mensaje;
        if (prioridadEl) prioridadEl.value = template.prioridad;
        
    
    };

    // ========== INICIALIZACIÓN ==========

    function inicializar() {
        console.log('🎯 [NOTIFICACIONES] Inicializando...');
        console.log(' [NOTIFICACIONES] Módulo cargado completamente');
        console.log(' [NOTIFICACIONES] Funciones disponibles:', {
            loadUsersForNotifications: typeof window.loadUsersForNotifications,
            toggleAllUsers: typeof window.toggleAllUsers,
            sendNotification: typeof window.sendNotification
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

})();