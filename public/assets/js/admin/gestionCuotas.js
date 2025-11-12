// ==========================================
// MÓDULO: GESTIÓN DE CUOTAS MENSUALES
// Archivo: gestionCuotas.js
// ==========================================

(function() {
    'use strict';
    
    console.log('🟢 [CUOTAS] Iniciando carga del módulo...');

    // Evitar carga duplicada
    if (window.GestionCuotasCargado) {
        console.warn('⚠️ [CUOTAS] Ya cargado');
        return;
    }
    window.GestionCuotasCargado = true;

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

    // ========== FUNCIONES AUXILIARES ==========

    function obtenerNombreMes(mes) {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[parseInt(mes) - 1] || mes;
    }

    function formatearFechaUY(fecha) {
        if (!fecha) return '-';
        const f = new Date(fecha + 'T00:00:00');
        return f.toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Montevideo'
        });
    }

    function mostrarCargando(mensaje) {
        mensaje = mensaje || 'Cargando...';
        let overlay = document.getElementById('loading-overlay-cuotas');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay-cuotas';
            overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:99999;';
            overlay.innerHTML = '<div style="background:white;padding:30px 50px;border-radius:12px;text-align:center;"><i class="fas fa-spinner fa-spin" style="font-size:40px;color:' + COLORS.primary + ';margin-bottom:15px;"></i><p id="loading-message-cuotas" style="margin:0;font-size:16px;color:#333;font-weight:600;">' + mensaje + '</p></div>';
            document.body.appendChild(overlay);
        } else {
            overlay.style.display = 'flex';
            const msg = document.getElementById('loading-message-cuotas');
            if (msg) msg.textContent = mensaje;
        }
    }

    function ocultarCargando() {
        const overlay = document.getElementById('loading-overlay-cuotas');
        if (overlay) overlay.style.display = 'none';
    }

    function poblarSelectorAnios() {
        const selectAnio = document.getElementById('admin-filtro-anio');
        if (!selectAnio) return;
        if (selectAnio.options.length > 1) return;
        
        const anioActual = new Date().getFullYear();
        for (let i = 0; i < 3; i++) {
            const anio = anioActual - i;
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            selectAnio.appendChild(option);
        }
    }

    // ========== CARGAR PRECIOS ==========

    window.loadPreciosCuotas = async function() {
        console.log('💵 [CUOTAS] Cargando precios...');
        
        const container = document.getElementById('preciosCuotasContainer');
        if (!container) {
            console.error('❌ [CUOTAS] Container no encontrado');
            return;
        }
        
        container.innerHTML = '<p class="loading">Cargando precios...</p>';
        
        try {
            const response = await fetch('/api/cuotas/precios');
            const data = await response.json();
            
            console.log('📊 [CUOTAS] Precios recibidos:', data);
            
            if (data.success) {
                renderPreciosCuotas(data.precios);
            } else {
                container.innerHTML = '<p class="error">Error: ' + data.message + '</p>';
            }
        } catch (error) {
            console.error('❌ [CUOTAS] Error:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        }
    };

    function renderPreciosCuotas(precios) {
    console.log('🎨 [CUOTAS] Renderizando', precios.length, 'precios');
    
    const container = document.getElementById('preciosCuotasContainer');
    container.innerHTML = '';
    
    if (!precios || precios.length === 0) {
        container.innerHTML = '<p>No hay precios configurados</p>';
        return;
    }

    precios.sort(function(a, b) { return a.habitaciones - b.habitaciones; });
    
    let html = '<div class="precios-grid">';
    
    precios.forEach(function(precio) {
        const iconos = { 1: '🏠', 2: '🏡', 3: '👨‍👩‍👧‍👦' };
        const icono = iconos[precio.habitaciones] || '🏠';
        const monto = parseFloat(precio.monto_mensual).toLocaleString('es-UY', {minimumFractionDigits: 2});
        const fecha = formatearFechaUY(precio.fecha_vigencia_desde);

        html += '<div style="background:' + COLORS.white + ';border-radius:12px;padding:24px;box-shadow:' + COLORS.shadow + ';border-top:4px solid ' + COLORS.primary + ';">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">';
        html += '<div><span style="font-size:40px;">' + icono + '</span><h4 style="color:' + COLORS.primary + ';margin:10px 0 0 0;">' + precio.tipo_vivienda + '</h4></div>';
        
       
        
        html += '</div>';
        html += '<div style="margin:20px 0;"><span style="color:' + COLORS.gray500 + ';font-size:13px;">Cuota Mensual:</span><br><span style="color:' + COLORS.primary + ';font-size:32px;font-weight:700;">$' + monto + '</span></div>';
        html += '<div style="display:flex;justify-content:space-between;padding-top:15px;border-top:1px solid ' + COLORS.gray100 + ';">';
        html += '<small style="color:' + COLORS.gray500 + ';">Vigente desde: ' + fecha + '</small>';
        html += '<button class="btn-small btn-edit" onclick="editarPrecioCuota(' + precio.id_tipo + ',\'' + precio.tipo_vivienda + '\',' + precio.monto_mensual + ')"><i class="fas fa-edit"></i> Editar</button>';
        html += '</div></div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
    console.log('✅ [CUOTAS] Precios renderizados');
}

    // ========== EDITAR PRECIO ==========

    window.editarPrecioCuota = function(idTipo, nombreTipo, montoActual) {
        console.log('✏️ [CUOTAS] Editando:', nombreTipo);
        
        document.getElementById('precio-id-tipo').value = idTipo;
        document.getElementById('precio-tipo-nombre').innerHTML = '<strong style="font-size:18px;color:' + COLORS.primary + ';">' + nombreTipo + '</strong><p style="margin:10px 0 0 0;font-size:13px;color:' + COLORS.gray500 + ';">Monto actual: $' + parseFloat(montoActual).toLocaleString('es-UY', {minimumFractionDigits: 2}) + '</p>';
        document.getElementById('precio-monto').value = '';
        document.getElementById('editarPrecioModal').style.display = 'flex';
    };

    window.closeEditarPrecioModal = function() {
        document.getElementById('editarPrecioModal').style.display = 'none';
        document.getElementById('editarPrecioForm').reset();
    };

    window.submitEditarPrecio = async function(event) {
        event.preventDefault();
        
        const idTipo = document.getElementById('precio-id-tipo').value;
        const monto = document.getElementById('precio-monto').value;
        
        if (!monto || monto <= 0) {
            alert('⚠️ Ingresa un monto válido');
            return;
        }

        if (!confirm('¿Actualizar este precio?')) return;
        
        const formData = new FormData();
        formData.append('id_tipo', idTipo);
        formData.append('monto_mensual', monto);
        
        try {
            const response = await fetch('/api/cuotas/actualizar-precio', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ ' + data.message);
                window.closeEditarPrecioModal();
                await window.loadPreciosCuotas();
            } else {
                alert('❌ ' + data.message);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ Error al actualizar');
        }
    };

    // ========== GENERAR CUOTAS ==========

    window.generarCuotasMesActual = async function() {
        const hoy = new Date();
        const mes = hoy.getMonth() + 1;
        const anio = hoy.getFullYear();
        const nombreMes = obtenerNombreMes(mes);

        if (!confirm('¿Generar cuotas para ' + nombreMes + ' ' + anio + '?')) return;
        
        const formData = new FormData();
        formData.append('mes', mes);
        formData.append('anio', anio);
        
        try {
            const response = await fetch('/api/cuotas/generar-masivas', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ ' + data.message);
                await window.loadAllCuotasAdmin();
                await window.loadEstadisticasCuotas();
            } else {
                alert('❌ ' + data.message);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ Error al generar cuotas');
        }
    };

    // ========== ESTADÍSTICAS ==========

    window.loadEstadisticasCuotas = async function() {
        console.log('📊 [CUOTAS] Cargando estadísticas...');
        
        try {
            const mes = document.getElementById('admin-filtro-mes') ? document.getElementById('admin-filtro-mes').value : '';
            const anio = document.getElementById('admin-filtro-anio') ? document.getElementById('admin-filtro-anio').value : '';
            
            let url = '/api/cuotas/estadisticas?';
            if (mes) url += 'mes=' + mes + '&';
            if (anio) url += 'anio=' + anio + '&';
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                const stats = data.estadisticas;
                
                const totalEl = document.getElementById('admin-total-cuotas');
                const pagadasEl = document.getElementById('admin-cuotas-pagadas');
                const pendientesEl = document.getElementById('admin-cuotas-pendientes');
                const montoEl = document.getElementById('admin-monto-cobrado');
                
                if (totalEl) totalEl.textContent = stats.total_cuotas || 0;
                if (pagadasEl) pagadasEl.textContent = stats.pagadas || 0;
                if (pendientesEl) pendientesEl.textContent = stats.pendientes || 0;
                if (montoEl) montoEl.textContent = '$' + parseFloat(stats.monto_cobrado || 0).toLocaleString('es-UY', {minimumFractionDigits: 2});
                
                console.log('✅ [CUOTAS] Estadísticas actualizadas');
            }
        } catch (error) {
            console.error('❌ [CUOTAS] Error:', error);
        }
    };

    // ========== CARGAR CUOTAS ==========

    window.loadAllCuotasAdmin = async function() {
        console.log('📋 [CUOTAS] Cargando cuotas...');
        
        const container = document.getElementById('allCuotasAdminContainer');
        if (!container) {
            console.error('❌ [CUOTAS] Container no encontrado');
            return;
        }
        
        container.innerHTML = '<p class="loading">Cargando cuotas...</p>';
        
        try {
            const mes = document.getElementById('admin-filtro-mes') ? document.getElementById('admin-filtro-mes').value : '';
            const anio = document.getElementById('admin-filtro-anio') ? document.getElementById('admin-filtro-anio').value : '';
            const estado = document.getElementById('admin-filtro-estado') ? document.getElementById('admin-filtro-estado').value : '';
            
            let url = '/api/cuotas/all?';
            if (mes) url += 'mes=' + mes + '&';
            if (anio) url += 'anio=' + anio + '&';
            if (estado) url += 'estado=' + estado + '&';
            
            console.log('🌐 [CUOTAS] URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('📊 [CUOTAS] Datos:', data);
            
            if (data.success) {
                renderAllCuotasAdmin(data.cuotas);
                await window.loadEstadisticasCuotas();
            } else {
                container.innerHTML = '<p class="error">Error: ' + data.message + '</p>';
            }
        } catch (error) {
            console.error('❌ [CUOTAS] Error:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        }
    };

    function renderAllCuotasAdmin(cuotas) {
        console.log('🎨 [CUOTAS] Renderizando', cuotas.length, 'cuotas');
        
        const container = document.getElementById('allCuotasAdminContainer');

        if (!cuotas || cuotas.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:60px 20px;"><i class="fas fa-inbox" style="font-size:48px;color:' + COLORS.gray100 + ';"></i><p style="color:' + COLORS.gray500 + ';margin-top:15px;">No se encontraron cuotas</p></div>';
            return;
        }

        let html = '<div style="overflow-x:auto;border-radius:12px;box-shadow:' + COLORS.shadow + ';"><table style="width:100%;border-collapse:collapse;background:' + COLORS.white + ';min-width:1200px;"><thead><tr style="background:linear-gradient(135deg,' + COLORS.primary + ' 0%,' + COLORS.primaryDark + ' 100%);color:' + COLORS.white + ';">';
        html += '<th style="padding:15px 12px;text-align:left;">Usuario</th>';
        html += '<th style="padding:15px 12px;text-align:left;">Vivienda</th>';
        html += '<th style="padding:15px 12px;text-align:center;">Período</th>';
        html += '<th style="padding:15px 12px;text-align:right;">Monto</th>';
        html += '<th style="padding:15px 12px;text-align:center;">Estado</th>';
        html += '<th style="padding:15px 12px;text-align:center;">Horas</th>';
        html += '<th style="padding:15px 12px;text-align:center;">Vencimiento</th>';
        html += '<th style="padding:15px 12px;text-align:center;">Acciones</th>';
        html += '</tr></thead><tbody>';
        
        cuotas.forEach(function(cuota) {
            const estadoFinal = cuota.estado_actual || cuota.estado;
            const mes = obtenerNombreMes(cuota.mes);
            
            let estadoColor = COLORS.gray500;
            if (estadoFinal === 'pagada') estadoColor = COLORS.success;
            else if (estadoFinal === 'pendiente') estadoColor = COLORS.warning;
            else if (estadoFinal === 'vencida') estadoColor = COLORS.danger;
            
            const monto = parseFloat(cuota.monto_total || cuota.monto || 0).toLocaleString('es-UY', {minimumFractionDigits: 2});
            
            html += '<tr style="border-bottom:1px solid ' + COLORS.gray100 + ';">';
            html += '<td style="padding:14px 12px;"><div style="font-weight:600;color:' + COLORS.primary + ';">' + (cuota.nombre_completo || 'Usuario') + '</div><small style="color:' + COLORS.gray500 + ';">' + (cuota.email || '') + '</small></td>';
            html += '<td style="padding:14px 12px;">' + (cuota.numero_vivienda || 'N/A') + '</td>';
            html += '<td style="padding:14px 12px;text-align:center;font-weight:600;">' + mes + ' ' + cuota.anio + '</td>';
            html += '<td style="padding:14px 12px;text-align:right;font-weight:600;color:' + COLORS.primary + ';">$' + monto + '</td>';
            html += '<td style="padding:14px 12px;text-align:center;"><span style="padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600;background:' + estadoColor + ';color:white;">' + estadoFinal.toUpperCase() + '</span></td>';
            html += '<td style="padding:14px 12px;text-align:center;">' + (cuota.horas_cumplidas || 0) + 'h / ' + cuota.horas_requeridas + 'h</td>';
            html += '<td style="padding:14px 12px;text-align:center;">' + formatearFechaUY(cuota.fecha_vencimiento) + '</td>';
            html += '<td style="padding:14px 12px;"><div style="display:flex;gap:5px;justify-content:center;">';
            
            if (cuota.comprobante_archivo) {
                html += '<button class="btn-small btn-secondary" onclick="window.open(\'/files/?path=' + cuota.comprobante_archivo + '\',\'_blank\')"><i class="fas fa-image"></i></button>';
            }
            
            if (estadoFinal !== 'pagada') {
                html += '<button class="btn-small btn-success" onclick="liquidarDeudaCuota(' + cuota.id_cuota + ')"><i class="fas fa-hand-holding-usd"></i></button>';
            }
            
            html += '</div></td></tr>';
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
        
        console.log('✅ [CUOTAS] Renderizado completo');
    }

    // ========== LIQUIDAR ==========

    window.liquidarDeudaCuota = async function(idCuota) {
        if (!confirm('¿Liquidar esta deuda?\n\nLa cuota se marcará como pagada.')) return;
        
        mostrarCargando('Procesando...');
        
        try {
            const formData = new URLSearchParams();
            formData.append('id_cuota', idCuota);
            
            const response = await fetch('/api/cuotas/liquidar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ ' + data.message);
                await window.loadAllCuotasAdmin();
                await window.loadEstadisticasCuotas();
            } else {
                alert('❌ ' + data.message);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ Error al liquidar');
        } finally {
            ocultarCargando();
        }
    };

    // ========== INICIALIZACIÓN ==========

    function inicializar() {
        console.log('🎯 [CUOTAS] Inicializando...');
        poblarSelectorAnios();
        console.log('✅ [CUOTAS] Módulo cargado completamente');
        console.log('✅ [CUOTAS] Funciones disponibles:', {
            loadPreciosCuotas: typeof window.loadPreciosCuotas,
            loadAllCuotasAdmin: typeof window.loadAllCuotasAdmin,
            loadEstadisticasCuotas: typeof window.loadEstadisticasCuotas
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

})();