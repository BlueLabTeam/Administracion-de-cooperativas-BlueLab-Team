(function() {
    'use strict';
    
    if (window.GestionCuotasCargado) {
        console.warn('⚠️ [CUOTAS] Ya cargado');
        return;
    }
    window.GestionCuotasCargado = true;

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
        info: '#2196F3',
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
        const container = document.getElementById('preciosCuotasContainer');
        if (!container) {
            console.error('❌ [CUOTAS] Container no encontrado');
            return;
        }
        
        container.innerHTML = '<p class="loading">Cargando precios...</p>';
        
        try {
            const response = await fetch('/api/cuotas/precios');
            const data = await response.json();
            
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
        const container = document.getElementById('preciosCuotasContainer');
        container.innerHTML = '';
        
        if (!precios || precios.length === 0) {
            container.innerHTML = '<p>No hay precios configurados</p>';
            return;
        }

        precios.sort(function(a, b) { return a.habitaciones - b.habitaciones; });
        
        let html = '<div class="precios-grid">';
        
        precios.forEach(function(precio) {
            const iconos = { 1: '🏠', 2: '🏡', 3: '🏘️' };
            const icono = iconos[precio.habitaciones] || '🏘️';
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
    }

    // ========== EDITAR PRECIO ==========

    window.editarPrecioCuota = function(idTipo, nombreTipo, montoActual) {
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
            }
        } catch (error) {
            console.error('❌ [CUOTAS] Error:', error);
        }
    };

    // ========== CARGAR CUOTAS CON HORAS ACTUALIZADAS ==========

    window.loadAllCuotasAdmin = async function() {
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
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                const cuotasConHoras = await enriquecerCuotasConHoras(data.cuotas);
                renderAllCuotasAdmin(cuotasConHoras);
                await window.loadEstadisticasCuotas();
            } else {
                container.innerHTML = '<p class="error">Error: ' + data.message + '</p>';
            }
        } catch (error) {
            console.error('❌ [CUOTAS] Error:', error);
            container.innerHTML = '<p class="error">Error de conexión</p>';
        }
    };

    // ========== ENRIQUECER CUOTAS CON HORAS ==========
    async function enriquecerCuotasConHoras(cuotas) {
        console.log(`🔍 Enriqueciendo ${cuotas.length} cuotas con datos de horas...`);
        
        const promises = cuotas.map(async (cuota) => {
            try {
                const usuarioId = cuota.usuario_id || cuota.id_usuario;
                
                if (!usuarioId) {
                    console.error('❌ No se encontró usuario_id en cuota:', cuota);
                    cuota.horas_trabajadas = 0;
                    cuota.horas_justificadas_registros = 0;
                    cuota.horas_justificadas_manuales = 0;
                    cuota.horas_netas = 0;
                    cuota.justificaciones = [];
                    return cuota;
                }
                
                const mes = String(cuota.mes).padStart(2, '0');
                const fechaInicio = `${cuota.anio}-${mes}-01`;
                const ultimoDia = new Date(cuota.anio, cuota.mes, 0).getDate();
                const fechaFin = `${cuota.anio}-${mes}-${String(ultimoDia).padStart(2, '0')}`;
                
                let horasTrabajadas = 0;
                let horasJustificadasRegistros = 0;
                
                try {
                    const url = `/api/horas/mis-registros?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
                    const response = await fetch(url);
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        if (data.success && data.registros && Array.isArray(data.registros)) {
                            const registrosUsuario = data.registros.filter(reg => {
                                const regUserId = reg.usuario_id || reg.id_usuario || reg.user_id;
                                return String(regUserId) === String(usuarioId);
                            });
                            
                            registrosUsuario.forEach(reg => {
                                if (reg.hora_entrada && reg.hora_salida) {
                                    const [hE, mE, sE] = reg.hora_entrada.split(':').map(Number);
                                    const [hS, mS, sS] = reg.hora_salida.split(':').map(Number);
                                    const entrada = hE + mE/60 + (sE || 0)/3600;
                                    const salida = hS + mS/60 + (sS || 0)/3600;
                                    const horasDelRegistro = Math.max(0, salida - entrada);
                                    
                                    horasTrabajadas += horasDelRegistro;
                                    horasJustificadasRegistros += parseFloat(reg.horas_justificadas || 0);
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error obteniendo registros:`, error);
                }
                
                cuota.horas_trabajadas = horasTrabajadas;
                cuota.horas_justificadas_registros = horasJustificadasRegistros;
                
                let horasJustificadasManuales = 0;
                cuota.justificaciones = [];
                
                try {
                    const urlJust = `/api/justificaciones/usuario?id_usuario=${usuarioId}&mes=${cuota.mes}&anio=${cuota.anio}`;
                    const responseJust = await fetch(urlJust);
                    
                    if (responseJust.ok) {
                        const dataJust = await responseJust.json();
                        
                        if (dataJust.success && dataJust.justificaciones && Array.isArray(dataJust.justificaciones)) {
                            cuota.justificaciones = dataJust.justificaciones;
                            horasJustificadasManuales = dataJust.justificaciones.reduce((sum, j) => {
                                return sum + parseFloat(j.horas_justificadas || 0);
                            }, 0);
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error obteniendo justificaciones:`, error);
                }
                
                cuota.horas_justificadas_manuales = horasJustificadasManuales;
                cuota.horas_netas = Math.max(0, horasTrabajadas - horasJustificadasRegistros - horasJustificadasManuales);
                
            } catch (error) {
                console.error('❌ Error general:', error);
                cuota.horas_trabajadas = 0;
                cuota.horas_justificadas_registros = 0;
                cuota.horas_justificadas_manuales = 0;
                cuota.horas_netas = 0;
                cuota.justificaciones = [];
            }
            
            return cuota;
        });
        
        return await Promise.all(promises);
    }

    function renderAllCuotasAdmin(cuotas) {
        const container = document.getElementById('allCuotasAdminContainer');

        if (!cuotas || cuotas.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:60px 20px;"><i class="fas fa-inbox" style="font-size:48px;color:' + COLORS.gray100 + ';"></i><p style="color:' + COLORS.gray500 + ';margin-top:15px;">No se encontraron cuotas</p></div>';
            return;
        }

        let html = '<div style="overflow-x:auto;border-radius:12px;box-shadow:' + COLORS.shadow + ';"><table style="width:100%;border-collapse:collapse;background:' + COLORS.white + ';min-width:1400px;"><thead><tr style="background:linear-gradient(135deg,' + COLORS.primary + ' 0%,' + COLORS.primaryDark + ' 100%);color:' + COLORS.white + ';">';
        html += '<th style="padding:15px 12px;text-align:left;">Usuario</th>';
        html += '<th style="padding:15px 12px;text-align:left;">Vivienda</th>';
        html += '<th style="padding:15px 12px;text-align:center;">Período</th>';
        html += '<th style="padding:15px 12px;text-align:right;">Monto</th>';
        html += '<th style="padding:15px 12px;text-align:center;">Estado</th>';
        html += '<th style="padding:15px 12px;text-align:center;">Horas Trabajadas</th>';
        html += '<th style="padding:15px 12px;text-align:center;">Horas Justificadas</th>';
        html += '<th style="padding:15px 12px;text-align:center;">Horas Netas</th>';
        html += '<th style="padding:15px 12px;text-align:center;">Vencimiento</th>';
        html += '<th style="padding:15px 12px;text-align:center;">Acciones</th>';
        html += '</tr></thead><tbody>';
        
        cuotas.forEach(function(cuota) {
            const usuarioId = cuota.usuario_id || cuota.id_usuario || cuota.user_id;
            const estadoFinal = cuota.estado_actual || cuota.estado;
            const mes = obtenerNombreMes(cuota.mes);
            
            let estadoColor = COLORS.gray500;
            if (estadoFinal === 'pagada') estadoColor = COLORS.success;
            else if (estadoFinal === 'pendiente') estadoColor = COLORS.warning;
            else if (estadoFinal === 'vencida') estadoColor = COLORS.danger;
            
            const monto = parseFloat(cuota.monto_total || cuota.monto || 0).toLocaleString('es-UY', {minimumFractionDigits: 2});
            const horasTrabajadas = parseFloat(cuota.horas_trabajadas || 0);
            const horasJustificadas = parseFloat(cuota.horas_justificadas || 0);
            const horasNetas = parseFloat(cuota.horas_netas || 0);
            const horasRequeridas = parseFloat(cuota.horas_requeridas || 0);
            const progresoHoras = horasRequeridas > 0 ? (horasNetas / horasRequeridas * 100) : 0;
            
            let colorProgreso = COLORS.danger;
            if (progresoHoras >= 100) colorProgreso = COLORS.success;
            else if (progresoHoras >= 50) colorProgreso = COLORS.warning;
            
            const nombreCompleto = cuota.nombre_completo || cuota.nombre || 'Usuario';
            const nombreEscaped = nombreCompleto.replace(/'/g, "\\'");
            
            html += '<tr style="border-bottom:1px solid ' + COLORS.gray100 + ';">';
            html += '<td style="padding:14px 12px;"><div style="font-weight:600;color:' + COLORS.primary + ';">' + nombreCompleto + '</div><small style="color:' + COLORS.gray500 + ';">' + (cuota.email || '') + '</small></td>';
            html += '<td style="padding:14px 12px;">' + (cuota.numero_vivienda || 'N/A') + '</td>';
            html += '<td style="padding:14px 12px;text-align:center;font-weight:600;">' + mes + ' ' + cuota.anio + '</td>';
            html += '<td style="padding:14px 12px;text-align:right;font-weight:600;color:' + COLORS.primary + ';">$' + monto + '</td>';
            html += '<td style="padding:14px 12px;text-align:center;"><span style="padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600;background:' + estadoColor + ';color:white;">' + estadoFinal.toUpperCase() + '</span></td>';
            
            html += '<td style="padding:14px 12px;text-align:center;">';
            html += '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;">';
            html += '<strong style="font-size:16px;color:' + colorProgreso + ';">' + horasTrabajadas.toFixed(2) + 'h</strong>';
            html += '<div style="width:80px;height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden;">';
            html += '<div style="width:' + Math.min(progresoHoras, 100) + '%;height:100%;background:' + colorProgreso + ';transition:width 0.3s;"></div>';
            html += '</div>';
            html += '<small style="color:' + COLORS.gray500 + ';">de ' + horasRequeridas + 'h</small>';
            html += '</div></td>';
            
            html += '<td style="padding:14px 12px;text-align:center;">';
            if (horasJustificadas > 0) {
                html += '<span style="background:#fff3cd;color:#856404;padding:4px 10px;border-radius:12px;font-weight:600;">' + horasJustificadas.toFixed(2) + 'h</span>';
            } else {
                html += '<span style="color:' + COLORS.gray500 + ';">0h</span>';
            }
            html += '</td>';
            
            html += '<td style="padding:14px 12px;text-align:center;">';
            html += '<strong style="font-size:15px;color:' + (horasNetas >= horasRequeridas ? COLORS.success : COLORS.danger) + ';">' + horasNetas.toFixed(2) + 'h</strong>';
            html += '</td>';
            
            html += '<td style="padding:14px 12px;text-align:center;">' + formatearFechaUY(cuota.fecha_vencimiento) + '</td>';
            html += '<td style="padding:14px 12px;"><div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap;">';
            
            // Botón ver comprobante
            if (cuota.comprobante_archivo) {
                html += '<button class="btn-small btn-secondary" onclick="window.open(\'/files/?path=' + cuota.comprobante_archivo + '\',\'_blank\')" title="Ver Comprobante"><i class="fas fa-image"></i></button>';
            }
            
            // Botón justificar horas
            if (usuarioId) {
                html += '<button class="btn-small btn-info" onclick="abrirModalJustificarHorasCuota(' + usuarioId + ', \'' + nombreEscaped + '\', ' + cuota.mes + ', ' + cuota.anio + ', ' + horasTrabajadas + ', ' + horasJustificadas + ', ' + horasRequeridas + ')" title="Justificar Horas"><i class="fas fa-clock"></i></button>';
            }
            
            // Botón validar pago
            if (cuota.id_pago && cuota.estado_pago === 'pendiente') {
                html += '<button class="btn-small btn-warning" onclick="abrirModalValidarPago(' + cuota.id_pago + ',' + cuota.id_cuota + ')" title="Validar Pago"><i class="fas fa-check-circle"></i></button>';
            }
            
            // Botón liquidar deuda
            if (estadoFinal !== 'pagada') {
                html += '<button class="btn-small btn-success" onclick="liquidarDeudaCuota(' + cuota.id_cuota + ')" title="Liquidar Deuda"><i class="fas fa-hand-holding-usd"></i></button>';
            }
            
            // ❌ BOTÓN ACTUALIZAR HORAS REMOVIDO
            
            html += '</div></td></tr>';
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    // ========== MODAL JUSTIFICAR HORAS ==========
    
    window.abrirModalJustificarHorasCuota = function(idUsuario, nombreUsuario, mes, anio, horasTrabajadas, horasJustificadas, horasRequeridas) {
        if (!idUsuario || idUsuario === 'undefined') {
            alert('❌ Error: No se pudo identificar al usuario');
            return;
        }
        
        const nombreMes = obtenerNombreMes(mes);
        const horasDisponibles = Math.max(0, horasTrabajadas - horasJustificadas);
        
        const modalHTML = `
            <div id="justificarHorasCuotaModal" class="modal-overlay" onclick="if(event.target===this) closeJustificarHorasCuotaModal()">
                <div class="modal-box" style="max-width: 600px;" onclick="event.stopPropagation()">
                    <button onclick="closeJustificarHorasCuotaModal()" class="modal-close-btn">×</button>
                    
                    <h2 style="color:${COLORS.primary};margin-bottom:20px;">
                        <i class="fas fa-clock"></i> Justificar Horas
                    </h2>
                    
                    <div style="background:${COLORS.gray50};padding:20px;border-radius:8px;margin-bottom:20px;">
                        <p><strong>Usuario:</strong> ${nombreUsuario}</p>
                        <p><strong>Período:</strong> ${nombreMes} ${anio}</p>
                        <hr style="margin:15px 0;border:none;border-top:1px solid ${COLORS.gray100};">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                            <div>
                                <small style="color:${COLORS.gray500};">Horas Trabajadas</small>
                                <p style="font-size:20px;font-weight:700;color:${COLORS.primary};margin:5px 0;">${horasTrabajadas.toFixed(1)}h</p>
                            </div>
                            <div>
                                <small style="color:${COLORS.gray500};">Ya Justificadas</small>
                                <p style="font-size:20px;font-weight:700;color:${COLORS.warning};margin:5px 0;">${horasJustificadas.toFixed(1)}h</p>
                            </div>
                            <div>
                                <small style="color:${COLORS.gray500};">Horas Requeridas</small>
                                <p style="font-size:20px;font-weight:700;color:${COLORS.gray700};margin:5px 0;">${horasRequeridas.toFixed(1)}h</p>
                            </div>
                            <div>
                                <small style="color:${COLORS.gray500};">Disponibles para Justificar</small>
                                <p style="font-size:20px;font-weight:700;color:${COLORS.success};margin:5px 0;">${horasDisponibles.toFixed(1)}h</p>
                            </div>
                        </div>
                    </div>
                    
                    <form id="justificarHorasForm" onsubmit="submitJustificarHorasCuota(event, ${idUsuario}, ${mes}, ${anio})">
                        
                        <div class="form-group">
                            <label>Horas a Justificar <span style="color:${COLORS.danger};">*</span></label>
                            <input type="number" 
                                   id="justificar-horas-cantidad" 
                                   step="0.1" 
                                   min="0.1" 
                                   max="${horasDisponibles}" 
                                   required 
                                   class="form-control"
                                   placeholder="Ej: 2.5">
                            <small style="color:${COLORS.gray500};">Máximo: ${horasDisponibles.toFixed(1)} horas</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Motivo de la Justificación <span style="color:${COLORS.danger};">*</span></label>
                            <textarea id="justificar-motivo" 
                                      required 
                                      rows="4" 
                                      class="form-control"
                                      placeholder="Ej: Licencia médica, trámites personales, etc."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Observaciones (opcional)</label>
                            <textarea id="justificar-observaciones" 
                                      rows="2" 
                                      class="form-control"
                                      placeholder="Información adicional..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Archivo Adjunto (opcional)</label>
                            <input type="file" 
                                   id="justificar-archivo" 
                                   class="form-control"
                                   accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
                            <small style="color:${COLORS.gray500};">Formatos: PDF, JPG, PNG, DOC, DOCX</small>
                        </div>
                        
                        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:25px;">
                            <button type="button" onclick="closeJustificarHorasCuotaModal()" class="btn btn-secondary">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Justificar Horas
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        const modalAnterior = document.getElementById('justificarHorasCuotaModal');
        if (modalAnterior) modalAnterior.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    };

    window.closeJustificarHorasCuotaModal = function() {
        const modal = document.getElementById('justificarHorasCuotaModal');
        if (modal) modal.remove();
    };

    window.submitJustificarHorasCuota = async function(event, idUsuario, mes, anio) {
        event.preventDefault();
        
        const horasCantidad = document.getElementById('justificar-horas-cantidad').value;
        const motivo = document.getElementById('justificar-motivo').value;
        const observaciones = document.getElementById('justificar-observaciones').value;
        const archivoInput = document.getElementById('justificar-archivo');
        
        if (!horasCantidad || parseFloat(horasCantidad) <= 0) {
            alert('⚠️ Ingresa una cantidad válida de horas');
            return;
        }
        
        if (!motivo.trim()) {
            alert('⚠️ Debes ingresar un motivo');
            return;
        }
        
        if (!confirm(`¿Confirmas justificar ${horasCantidad} horas?\n\nEsto reducirá las horas trabajadas efectivas del usuario.`)) {
            return;
        }
        
        mostrarCargando('Justificando horas...');
        
        try {
            const formData = new FormData();
            formData.append('id_usuario', idUsuario);
            formData.append('mes', mes);
            formData.append('anio', anio);
            formData.append('horas_justificadas', horasCantidad);
            formData.append('motivo', motivo.trim());
            
            if (observaciones.trim()) {
                formData.append('observaciones', observaciones.trim());
            }
            
            if (archivoInput.files.length > 0) {
                formData.append('archivo', archivoInput.files[0]);
            }
            
            const response = await fetch('/api/justificaciones/crear', {
                method: 'POST',
                body: formData
            });
            
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('El servidor devolvió una respuesta inválida');
            }
            
            if (data.success) {
                alert('✅ ' + data.message);
                window.closeJustificarHorasCuotaModal();
                await window.loadAllCuotasAdmin();
                await window.loadEstadisticasCuotas();
            } else {
                alert('❌ ' + (data.message || 'Error desconocido'));
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ Error al justificar horas: ' + error.message);
        } finally {
            ocultarCargando();
        }
    };

    // ========== MODAL VALIDAR PAGO ==========

    window.abrirModalValidarPago = async function(idPago, idCuota) {
        mostrarCargando('Cargando información del pago...');
        
        try {
            const response = await fetch('/api/cuotas/detalle?cuota_id=' + idCuota);
            const data = await response.json();
            
            if (!data.success) {
                alert('❌ Error al cargar información del pago');
                ocultarCargando();
                return;
            }
            
            const cuota = data.cuota;
            const nombreCompleto = cuota.nombre_completo || cuota.nombre || 'Usuario';
            const mes = cuota.mes || new Date().getMonth() + 1;
            const anio = cuota.anio || new Date().getFullYear();
            const montoTotal = parseFloat(cuota.monto_total || cuota.monto || 0);
            const metodoPago = cuota.metodo_pago || 'Transferencia';
            const numeroComprobante = cuota.numero_comprobante || 'Sin número';
            const fechaPago = cuota.fecha_pago || new Date().toISOString().split('T')[0];
            const comprobanteArchivo = cuota.comprobante_archivo || null;
            
            const modalHTML = `
                <div id="validarPagoModal" class="material-modal" style="display: flex;">
                    <div class="material-modal-content" onclick="event.stopPropagation()" style="max-width: 700px;">
                        <div class="material-modal-header">
                            <h3>
                                <i class="fas fa-check-circle"></i> Validar Pago
                            </h3>
                            <button class="close-material-modal" onclick="closeValidarPagoModal()">&times;</button>
                        </div>
                        
                        <input type="hidden" id="validar-id-pago" value="${idPago}">
                        
                        <div class="info-grid-box" style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #005CB9;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <small style="color: #6c757d; font-size: 12px; text-transform: uppercase; font-weight: 600;">Usuario</small>
                                    <p style="font-weight: 600; margin: 5px 0; font-size: 15px;">${nombreCompleto}</p>
                                </div>
                                <div>
                                    <small style="color: #6c757d; font-size: 12px; text-transform: uppercase; font-weight: 600;">Período</small>
                                    <p style="font-weight: 600; margin: 5px 0; font-size: 15px;">${obtenerNombreMes(mes)} ${anio}</p>
                                </div>
                                <div>
                                    <small style="color: #6c757d; font-size: 12px; text-transform: uppercase; font-weight: 600;">Monto</small>
                                    <p style="font-size: 22px; font-weight: 700; color: #005CB9; margin: 5px 0;">${montoTotal.toLocaleString('es-UY', {minimumFractionDigits: 2})}</p>
                                </div>
                                <div>
                                    <small style="color: #6c757d; font-size: 12px; text-transform: uppercase; font-weight: 600;">Método de Pago</small>
                                    <p style="font-weight: 600; margin: 5px 0; font-size: 15px;">${metodoPago}</p>
                                </div>
                                <div>
                                    <small style="color: #6c757d; font-size: 12px; text-transform: uppercase; font-weight: 600;">Número de Comprobante</small>
                                    <p style="font-weight: 600; margin: 5px 0; font-size: 15px;">${numeroComprobante}</p>
                                </div>
                                <div>
                                    <small style="color: #6c757d; font-size: 12px; text-transform: uppercase; font-weight: 600;">Fecha de Pago</small>
                                    <p style="font-weight: 600; margin: 5px 0; font-size: 15px;">${formatearFechaUY(fechaPago)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="font-weight: 600; margin-bottom: 10px; display: block;">
                                <i class="fas fa-file-image"></i> Comprobante:
                            </label>
                            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px; border: 2px dashed #dee2e6;">
                                ${comprobanteArchivo ? 
                                    `<img src="/files/?path=${comprobanteArchivo}" 
                                         style="max-width: 100%; max-height: 400px; height: auto; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" 
                                         onclick="window.open('/files/?path=${comprobanteArchivo}','_blank')"
                                         title="Click para ver en tamaño completo">
                                     <p style="margin-top: 10px; color: #6c757d; font-size: 13px;">
                                        <i class="fas fa-search-plus"></i> Click en la imagen para ampliar
                                     </p>` 
                                    : `<div style="padding: 40px;">
                                        <i class="fas fa-file-invoice" style="font-size: 48px; color: #dee2e6; margin-bottom: 10px;"></i>
                                        <p style="color: #6c757d; margin: 0;">Sin comprobante adjunto</p>
                                       </div>`}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="validar-observaciones">
                                <i class="fas fa-comment-alt"></i> Observaciones (opcional)
                            </label>
                            <textarea 
                                id="validar-observaciones" 
                                rows="3" 
                                class="form-control"
                                placeholder="Agrega comentarios sobre la validación..."
                                style="resize: vertical;"></textarea>
                            <small class="form-help">Estas observaciones serán visibles para el usuario</small>
                        </div>
                        
                        <div class="form-actions" style="justify-content: flex-end; gap: 10px;">
                            <button onclick="closeValidarPagoModal()" class="btn btn-secondary">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button onclick="submitValidarPago('rechazar')" class="btn btn-danger">
                                <i class="fas fa-times-circle"></i> Rechazar
                            </button>
                            <button onclick="submitValidarPago('aprobar')" class="btn btn-success">
                                <i class="fas fa-check-circle"></i> Aprobar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            const modalAnterior = document.getElementById('validarPagoModal');
            if (modalAnterior) modalAnterior.remove();
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            document.body.style.overflow = 'hidden';
            
            const modalOverlay = document.getElementById('validarPagoModal');
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === modalOverlay) {
                    closeValidarPagoModal();
                }
            });
            
            ocultarCargando();
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ Error al cargar información del pago');
            ocultarCargando();
        }
    };

    window.closeValidarPagoModal = function() {
        const modal = document.getElementById('validarPagoModal');
        if (modal) modal.remove();
        document.body.style.overflow = '';
    };

    window.submitValidarPago = async function(accion) {
        const idPago = document.getElementById('validar-id-pago')?.value;
        const observaciones = document.getElementById('validar-observaciones')?.value || '';
        
        if (!idPago) {
            alert('❌ Error: No se pudo identificar el ID del pago');
            return;
        }
        
        const textoAccion = accion === 'aprobar' ? 'aprobar' : 'rechazar';
        const emojiAccion = accion === 'aprobar' ? '✅' : '❌';
        
        if (!confirm(`${emojiAccion} ¿Confirmas que deseas ${textoAccion} este pago?`)) {
            return;
        }
        
        mostrarCargando('Procesando...');
        
        const btns = document.querySelectorAll('#validarPagoModal button');
        btns.forEach(btn => btn.disabled = true);
        
        try {
            const formData = new FormData();
            formData.append('pago_id', idPago);
            formData.append('accion', accion);
            formData.append('observaciones', observaciones);
            
            const response = await fetch('/api/cuotas/validar-pago', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (data.success) {
                const mensajeExito = data.message || `Pago ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} correctamente`;
                alert(`✅ ${mensajeExito}`);
                
                closeValidarPagoModal();
                
                if (typeof window.loadAllCuotasAdmin === 'function') {
                    await window.loadAllCuotasAdmin();
                }
                if (typeof window.loadEstadisticasCuotas === 'function') {
                    await window.loadEstadisticasCuotas();
                }
            } else {
                const mensajeError = data.message || 'Error al validar el pago';
                alert(`❌ ${mensajeError}`);
                btns.forEach(btn => btn.disabled = false);
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ Error al validar pago. Por favor, intenta nuevamente.');
            btns.forEach(btn => btn.disabled = false);
        } finally {
            ocultarCargando();
        }
    };

    // ========== LIQUIDAR DEUDA ==========

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

    // ========== ESTILOS CSS ==========

    function agregarEstilosCSS() {
        if (document.getElementById('cuotas-estilos')) return;
        
        const estilos = `
            <style id="cuotas-estilos">
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.2s ease;
                }
                
                .modal-box {
                    background: white;
                    border-radius: 16px;
                    padding: 30px;
                    max-width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease;
                    position: relative;
                }
                
                .modal-close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: ${COLORS.gray100};
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 24px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                
                .modal-close-btn:hover {
                    background: ${COLORS.danger};
                    color: white;
                    transform: rotate(90deg);
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: ${COLORS.gray700};
                }
                
                .form-control {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid ${COLORS.gray100};
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }
                
                .form-control:focus {
                    outline: none;
                    border-color: ${COLORS.primary};
                    box-shadow: 0 0 0 3px ${COLORS.primaryLight};
                }
                
                .btn-small {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                    background: ${COLORS.primary};
                    color: white;
                }
                
                .btn-small:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
                
                .btn-small.btn-secondary {
                    background: ${COLORS.gray500};
                }
                
                .btn-small.btn-warning {
                    background: ${COLORS.warning};
                }
                
                .btn-small.btn-success {
                    background: ${COLORS.success};
                }
                
                .btn-small.btn-info {
                    background: ${COLORS.info};
                }
                
                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                
                .btn-primary {
                    background: ${COLORS.primary};
                    color: white;
                }
                
                .btn-secondary {
                    background: ${COLORS.gray500};
                    color: white;
                }
                
                .btn-danger {
                    background: ${COLORS.danger};
                    color: white;
                }
                
                .btn-success {
                    background: ${COLORS.success};
                    color: white;
                }
                
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', estilos);
    }

    // ========== INICIALIZACIÓN ==========

    function inicializar() {
        poblarSelectorAnios();
        agregarEstilosCSS();
        
        console.log('✅ [CUOTAS] Módulo cargado completamente');
        console.log('✅ [CUOTAS] Funciones disponibles:', {
            loadPreciosCuotas: typeof window.loadPreciosCuotas,
            loadAllCuotasAdmin: typeof window.loadAllCuotasAdmin,
            loadEstadisticasCuotas: typeof window.loadEstadisticasCuotas,
            abrirModalValidarPago: typeof window.abrirModalValidarPago,
            abrirModalJustificarHorasCuota: typeof window.abrirModalJustificarHorasCuota,
            liquidarDeudaCuota: typeof window.liquidarDeudaCuota
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

})();