// 🧪 MODO TEST: Simular último día del mes
(function() {
    const TEST_MODE = true; // Cambiar a false para volver a normal
    
    if (TEST_MODE) {
        // Sobrescribir Date para simular último día del mes
        const fechaOriginal = Date;
        const ultimoDiaMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        
        window.Date = function(...args) {
            if (args.length === 0) {
                return ultimoDiaMes;
            }
            return new fechaOriginal(...args);
        };
        
        // Copiar métodos estáticos
        Object.setPrototypeOf(window.Date, fechaOriginal);
        window.Date.prototype = fechaOriginal.prototype;
        
        console.log('🧪 TEST MODE: Fecha simulada =', ultimoDiaMes.toLocaleDateString());
    }
})();

// ==========================================
//  MÓDULO: MIS CUOTAS
// Gestiona el sistema completo de cuotas mensuales
// Incluye: pagos, deuda acumulada, deuda de horas, polling, transferencias
// ==========================================

console.log('🟢 Cargando módulo de cuotas de usuario');

// ========== VARIABLES GLOBALES ==========
let pollingCuotasActivo = false;
let pollingInterval = null;
let ultimoCheckCuotas = null;

// Variable global para deuda de horas
window.deudaHorasActual = 0;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log(' Inicializando módulo de cuotas');
    
    // Listener para la sección de cuotas
    const cuotasMenuItem = document.querySelector('.menu li[data-section="cuotas"]');
    if (cuotasMenuItem) {
        cuotasMenuItem.addEventListener('click', async function() {
            console.log('>>> Sección cuotas abierta');
            
            // Limpiar cache
            ultimoCheckCuotas = null;
            
            // Recargar todo
            await inicializarSeccionCuotas();
        });
    }
    
    // Poblar selector de años
    const selectAnio = document.getElementById('filtro-anio-cuotas');
    if (selectAnio) {
        const anioActual = new Date().getFullYear();
        for (let i = 0; i < 3; i++) {
            const anio = anioActual - i;
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            selectAnio.appendChild(option);
        }
    }
    
    // Listeners para filtros
    const filtroMes = document.getElementById('filtro-mes-cuotas');
    const filtroAnio = document.getElementById('filtro-anio-cuotas');
    const filtroEstado = document.getElementById('filtro-estado-cuotas');
    
    if (filtroMes) filtroMes.addEventListener('change', loadMisCuotas);
    if (filtroAnio) filtroAnio.addEventListener('change', loadMisCuotas);
    if (filtroEstado) filtroEstado.addEventListener('change', loadMisCuotas);
});

// ==========================================
// 🔄 INICIALIZAR SECCIÓN COMPLETA
// ==========================================

/**
 * Inicializar sección de cuotas (orden correcto)
 */
async function inicializarSeccionCuotas() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(' [INIT CUOTAS] Inicializando sección de cuotas');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        // ⏳ PASO 1: Generar cuota del mes actual
        console.log('⏳ [PASO 1/4] Verificando/generando cuota...');
        await generarCuotaMesActualSiNoExiste();
        console.log(' [PASO 1/4] Cuota verificada/generada');
        
        // 🔥 PASO 2: CARGAR DEUDA DE HORAS (CRÍTICO - DEBE COMPLETARSE)
        console.log('⏳ [PASO 2/4] Cargando deuda de horas...');
        const deudaCargada = await loadDeudaHorasParaCuotas();
        console.log(' [PASO 2/4] Deuda de horas cargada:', deudaCargada);
        
        //  VERIFICACIÓN CRÍTICA
        if (typeof window.deudaHorasActual === 'undefined' || window.deudaHorasActual === null) {
            console.error('❌ [ERROR CRÍTICO] deudaHorasActual NO está definida!');
            console.error('   Forzando a 0 para evitar errores...');
            window.deudaHorasActual = 0;
        } else {
            console.log(' [VERIFICACIÓN] window.deudaHorasActual =', window.deudaHorasActual);
        }
        
        //  PASO 3: Cargar info de vivienda
        console.log('⏳ [PASO 3/4] Cargando info de vivienda...');
        await loadInfoViviendaCuota();
        console.log(' [PASO 3/4] Info vivienda cargada');
        
        //  PASO 4: Cargar cuotas (AHORA sí tiene la deuda disponible)
        console.log('⏳ [PASO 4/4] Cargando cuotas...');
        console.log('    Deuda disponible para renderizado:', window.deudaHorasActual);
        await loadMisCuotas();
        console.log(' [PASO 4/4] Cuotas cargadas');
        
        // Iniciar polling
        iniciarPollingCuotas();
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(' [INIT CUOTAS] Sección inicializada correctamente');
        console.log('    Deuda final disponible:', window.deudaHorasActual);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
    } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ [INIT CUOTAS] Error al inicializar:', error);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        alert('Error al cargar la información de cuotas');
    }
}

/**
 * Generar cuota del mes actual si no existe
 */
async function generarCuotaMesActualSiNoExiste() {
    console.log('🔄 Verificando cuota del mes actual...');
    
    try {
        const hoy = new Date();
        const mesActual = hoy.getMonth() + 1;
        const anioActual = hoy.getFullYear();
        
        // Verificar si ya existe la cuota
        const response = await fetch(`/api/cuotas/verificar-cuota-mes?mes=${mesActual}&anio=${anioActual}`);
        const data = await response.json();
        
        console.log(' Verificación de cuota:', data);
        
        if (data.success && !data.existe) {
            console.log('⚠️ No existe cuota del mes actual, generando...');
            
            // Generar cuota del mes actual
            const formData = new FormData();
            formData.append('mes', mesActual);
            formData.append('anio', anioActual);
            
            const responseGenerar = await fetch('/api/cuotas/generar-mi-cuota', {
                method: 'POST',
                body: formData
            });
            
            const dataGenerar = await responseGenerar.json();
            console.log('🔍 RESPUESTA COMPLETA DE GENERAR:', dataGenerar);
            
            if (dataGenerar.success) {
                console.log(' Cuota generada:', dataGenerar.message);
                if (dataGenerar.debug) {
                    console.log('🐛 DEBUG INFO:', dataGenerar.debug);
                }
            } else {
                console.warn('⚠️ No se pudo generar cuota:', dataGenerar.message);
                if (dataGenerar.debug) {
                    console.error('🐛 DEBUG ERROR:', dataGenerar.debug);
                }
            }
        } else if (data.existe) {
            console.log(' Cuota del mes ya existe');
        }
    } catch (error) {
        console.error('❌ Error al verificar/generar cuota:', error);
    }
}

// ==========================================
// 💸 CARGAR DEUDA DE HORAS
// ==========================================

/**
 * Cargar deuda de horas para cuotas
 */
async function loadDeudaHorasParaCuotas() {
    console.log(' [DEUDA HORAS] Cargando deuda de horas para cuotas...');
    
    try {
        const response = await fetch('/api/horas/deuda-actual');
        const data = await response.json();
        
        console.log('📥 [DEUDA HORAS] Respuesta recibida:', data);
        
        if (data.success && data.deuda) {
            // 🔥 CRÍTICO: Calcular deuda correctamente
            const deudaEnPesos = parseFloat(data.deuda.deuda_en_pesos || 0);
            const deudaMesActual = parseFloat(data.deuda.deuda_mes_actual || 0);
            const deudaAcumulada = parseFloat(data.deuda.deuda_acumulada || 0);
            
            // Usar el campo correcto del backend
            window.deudaHorasActual = deudaEnPesos;
            
            console.log('💵 [DEUDA HORAS] Deuda calculada:');
            console.log('   - deuda_en_pesos (PRINCIPAL):', deudaEnPesos);
            console.log('   - deuda_mes_actual:', deudaMesActual);
            console.log('   - deuda_acumulada:', deudaAcumulada);
            console.log('    DEUDA FINAL ASIGNADA:', window.deudaHorasActual);
            
            //  VERIFICAR que se asignó correctamente
            if (window.deudaHorasActual === 0 && deudaEnPesos > 0) {
                console.error('❌ [DEUDA HORAS] ERROR: Deuda no se asignó correctamente!');
                window.deudaHorasActual = deudaEnPesos; // Forzar asignación
            }
            
        } else {
            console.warn('⚠️ [DEUDA HORAS] No se recibió deuda válida del backend');
            window.deudaHorasActual = 0;
        }
        
    } catch (error) {
        console.error('❌ [DEUDA HORAS] Error al cargar:', error);
        window.deudaHorasActual = 0;
    }
    
    console.log('📚 [DEUDA HORAS] Proceso finalizado. Valor final:', window.deudaHorasActual);
    return window.deudaHorasActual;
}

// ==========================================
//  CARGAR INFO DE VIVIENDA
// ==========================================

/**
 * Cargar información de vivienda para contexto de cuota
 */
async function loadInfoViviendaCuota() {
    const container = document.getElementById('info-vivienda-cuota');
    if (!container) return;
    
    container.innerHTML = '<p class="loading">Cargando información de vivienda...</p>';
    
    try {
        const response = await fetch('/api/viviendas/my-vivienda');
        const data = await response.json();
        
        if (data.success && data.vivienda) {
            const v = data.vivienda;
            container.innerHTML = `
                <h3> Tu Vivienda Asignada</h3>
                <div class="vivienda-cuota-grid">
                    <div class="info-item">
                        <strong>Número:</strong> ${v.numero_vivienda}
                    </div>
                    <div class="info-item">
                        <strong>Tipo:</strong> ${v.tipo_nombre} (${v.habitaciones} hab.)
                    </div>
                    <div class="info-item">
                        <strong>Dirección:</strong> ${v.direccion || 'No especificada'}
                    </div>
                </div>
                <div class="alert-info" style="margin-top: 15px;">
                    <strong> Importante:</strong> El monto total a pagar incluye la cuota de vivienda más la deuda por horas no trabajadas ($160 por hora faltante).
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="alert-warning">
                    <strong>⚠️ Sin Vivienda Asignada</strong>
                    <p>No tienes una vivienda asignada actualmente. Contacta con el administrador para más información.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error al cargar información</p>';
    }
}

// ==========================================
// 📥 CARGAR MIS CUOTAS
// ==========================================

/**
 * Cargar cuotas del usuario con filtros
 */
async function loadMisCuotas() {
    const container = document.getElementById('misCuotasContainer');
    if (!container) return;
    
    container.innerHTML = '<p class="loading">Cargando cuotas...</p>';
    
    try {
        const mes = document.getElementById('filtro-mes-cuotas')?.value || '';
        const anio = document.getElementById('filtro-anio-cuotas')?.value || '';
        const estado = document.getElementById('filtro-estado-cuotas')?.value || '';
        
        let url = '/api/cuotas/mis-cuotas?';
        if (mes) url += `mes=${mes}&`;
        if (anio) url += `anio=${anio}&`;
        if (estado) url += `estado=${estado}&`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log(' Cuotas recibidas:', data);
        
        if (data.success) {
            let cuotas = data.cuotas || [];
            
            // 1. ORDENAR POR FECHA DESCENDENTE
            cuotas.sort((a, b) => {
                const anioA = parseInt(a.anio, 10) || 0;
                const anioB = parseInt(b.anio, 10) || 0;
                const mesA = parseInt(a.mes, 10) || 0;
                const mesB = parseInt(b.mes, 10) || 0;

                if (anioA !== anioB) {
                    return anioB - anioA;
                }
                return mesB - mesA;
            });

            // 2. BUSCAR Y MOVER LA CUOTA PENDIENTE MÁS RECIENTE AL INICIO
            const cuotaDestacada = cuotas.find(c => {
                const isPaid = (c.estado === 'pagada' || c.estado_pago === 'pagado');
                return !isPaid;
            });
            
            if (cuotaDestacada) {
                const index = cuotas.findIndex(c => c.id_cuota === cuotaDestacada.id_cuota);
                
                if (index > 0) {
                    const [featuredCuota] = cuotas.splice(index, 1);
                    cuotas.unshift(featuredCuota);
                    console.log('🔄 CUOTA PENDIENTE FORZADA AL INICIO:', cuotas[0]);
                } else if (index === 0) {
                    console.log(' CUOTA PENDIENTE YA ES EL PRIMER ELEMENTO:', cuotas[0]);
                }
            } else {
                console.log(' No se encontraron cuotas pendientes para destacar.');
            }
            
            renderMisCuotasOrganizadas(cuotas);
            updateCuotasStats(cuotas);
        } else {
            container.innerHTML = '<p class="error">Error al cargar cuotas</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ==========================================
// 🎨 RENDERIZAR CUOTAS ORGANIZADAS
// ==========================================

/**
 * Renderizar cuotas con sección destacada + historial
 */
function renderMisCuotasOrganizadas(cuotas) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 [RENDER] Iniciando renderizado de cuotas');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const container = document.getElementById('misCuotasContainer');
    
    if (!cuotas || cuotas.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; margin-bottom: 10px;"></i>
                <p>No se encontraron cuotas con los filtros seleccionados</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    //  CUOTA DEL MES ACTUAL (DESTACADA)
    const cuotaMasReciente = cuotas[0];
    console.log(' [RENDER] Cuota más reciente:', cuotaMasReciente);
    
    // 🔥 OBTENER DEUDA DE HORAS
    const deudaHoras = parseFloat(window.deudaHorasActual || 0);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(' [RENDER] DEUDA DE HORAS:');
    console.log('   window.deudaHorasActual:', window.deudaHorasActual);
    console.log('   deudaHoras (parseado):', deudaHoras);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 🔥 CALCULAR MONTOS
    const montoCuota = parseFloat(
        cuotaMasReciente.monto_base || 
        cuotaMasReciente.monto_actual || 
        cuotaMasReciente.monto || 
        0
    );
    
    const deudaAcumuladaAnterior = parseFloat(cuotaMasReciente.monto_pendiente_anterior || 0);
    const montoTotal = montoCuota + deudaAcumuladaAnterior + deudaHoras;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(' [RENDER] CÁLCULO COMPLETO:');
    console.log('   monto_cuota:', montoCuota);
    console.log('   deuda_meses_anteriores:', deudaAcumuladaAnterior);
    console.log('   deuda_horas_actual:', deudaHoras);
    console.log('    TOTAL A PAGAR:', montoTotal);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 🔍 VERIFICAR ESTADOS
    const estadoFinal = cuotaMasReciente.estado_actual || cuotaMasReciente.estado;
    const estadoPago = cuotaMasReciente.estado_pago || '';
    const estadoUsuario = cuotaMasReciente.estado_usuario || '';
    
    const pagoAprobado = estadoUsuario === 'aceptado' || estadoPago === 'aprobado';
    const tienePagoPendiente = cuotaMasReciente.id_pago && estadoPago === 'pendiente' && !pagoAprobado;
    const estaPagada = estadoFinal === 'pagada' || pagoAprobado;
    
    console.log('🔍 [ESTADOS] Verificación completa:', {
        estado_final: estadoFinal,
        estado_pago: estadoPago,
        estado_usuario: estadoUsuario,
        pago_aprobado: pagoAprobado,
        tiene_pago_pendiente: tienePagoPendiente,
        esta_pagada: estaPagada
    });
    
    // 🔍 VERIFICAR PERIODO DE PAGO
    const hoy = new Date();
    const diaActual = hoy.getDate();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();
    
    const esMesCuota = cuotaMasReciente.mes == mesActual && cuotaMasReciente.anio == anioActual;
    const estaDentroPeriodoPago = diaActual >= 25;
    const puedePagar = esMesCuota && estaDentroPeriodoPago && !estaPagada && !tienePagoPendiente;
    const diasParaPagar = estaDentroPeriodoPago ? 0 : Math.max(0, 25 - diaActual);
    
    //  RENDERIZAR SECCIÓN DESTACADA
    html += renderSeccionDestacada(
        cuotaMasReciente,
        montoCuota,
        deudaAcumuladaAnterior,
        deudaHoras,
        montoTotal,
        estaPagada,
        tienePagoPendiente,
        puedePagar,
        diasParaPagar,
        esMesCuota
    );
    
    // Separar cuotas para historial
    const cuotasPagables = cuotas.filter(c => {
        const estadoFinal = c.estado_actual || c.estado;
        return estadoFinal !== 'pagada';
    });
    
    const cuotasHistorial = cuotas.filter(c => {
        const estadoFinal = c.estado_actual || c.estado;
        return estadoFinal === 'pagada';
    });
    
    // SECCIÓN: CUOTAS PENDIENTES (SI HAY MÁS DE UNA)
    if (cuotasPagables.length > 1) {
        html += `
            <div class="cuotas-section">
                <h3 style="color: #f44336; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-circle"></i> Otras Cuotas Pendientes (${cuotasPagables.length - 1})
                </h3>
                <div class="cuotas-grid">
        `;
        
        cuotasPagables.slice(1).forEach(cuota => {
            html += renderCuotaCard(cuota);
        });
        
        html += `
                </div>
            </div>
            <hr style="margin: 40px 0; border: none; border-top: 2px solid #e0e0e0;">
        `;
    }
    
    // SECCIÓN: HISTORIAL
    html += `
        <div class="cuotas-section">
            <h3 style="color: #666; margin-bottom: 20px;">
                <i class="fas fa-history"></i> Historial de Cuotas
            </h3>
    `;
    
    if (cuotasHistorial.length > 0) {
        html += '<div class="cuotas-grid">';
        cuotasHistorial.forEach(cuota => {
            html += renderCuotaCard(cuota);
        });
        html += '</div>';
    } else {
        html += '<p style="color: #999; text-align: center;">No hay cuotas en el historial</p>';
    }
    
    html += '</div>';
    
    container.innerHTML = html;
    
    console.log(' [RENDER] Completado\n');
}

/**
 * Renderizar sección destacada (cuota del mes)
 */
function renderSeccionDestacada(
    cuota, montoCuota, deudaAcumulada, deudaHoras, montoTotal,
    estaPagada, tienePagoPendiente, puedePagar, diasParaPagar, esMesCuota
) {
    return `
        <div class="deuda-total-destacada ${estaPagada ? 'pagada-mes' : puedePagar ? '' : 'periodo-bloqueado'}">
            <div class="deuda-total-header">
                <h2 style="margin: 0; color: #fff;">
                    <i class="fas ${estaPagada ? 'fa-check-circle' : puedePagar ? 'fa-exclamation-triangle' : 'fa-calendar-alt'}"></i>
                    Resumen del Mes Actual
                </h2>
                <span class="deuda-total-badge ${estaPagada ? 'badge-pagada' : tienePagoPendiente ? 'badge-pendiente' : puedePagar ? 'badge-requerida' : 'badge-bloqueado'}">
                    ${estaPagada ? ' PAGADA' : 
                      tienePagoPendiente ? '⏳ EN VALIDACIÓN' : 
                      puedePagar ? '⚠️ PERIODO DE PAGO ABIERTO' : 
                      esMesCuota && diasParaPagar > 0 ? `🔒 ${diasParaPagar} DÍA${diasParaPagar !== 1 ? 'S' : ''} PARA PAGAR` :
                      !esMesCuota ? ' Mes cerrado' :
                      '❌ VENCIDA'}
                </span>
            </div>
            
            <div class="deuda-total-body">
                <div class="deuda-breakdown">
                    <div class="deuda-breakdown-item">
                        <i class="fas fa-home"></i>
                        <div>
                            <span class="deuda-label">Cuota de Vivienda</span>
                            <span class="deuda-monto">$${montoCuota.toLocaleString('es-UY', {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                    
                    ${deudaAcumulada > 0 ? `
                        <div class="deuda-breakdown-divider">+</div>
                        <div class="deuda-breakdown-item deuda-acumulada">
                            <i class="fas fa-exclamation-triangle"></i>
                            <div>
                                <span class="deuda-label">Deuda de Meses Anteriores</span>
                                <span class="deuda-monto error">
                                    $${deudaAcumulada.toLocaleString('es-UY', {minimumFractionDigits: 2})}
                                </span>
                                <small style="color: #ff8a80; display: block; margin-top: 5px;">
                                    (Cuotas vencidas no pagadas)
                                </small>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${deudaHoras > 0 ? `
                        <div class="deuda-breakdown-divider">+</div>
                        <div class="deuda-breakdown-item deuda-horas">
                            <i class="fas fa-clock"></i>
                            <div>
                                <span class="deuda-label">Deuda por Horas No Trabajadas</span>
                                <small style="color: #ff8a80; display: block; margin-top: 3px; margin-bottom: 5px;">
                                    ($160 por hora × horas faltantes)
                                </small>
                                <span class="deuda-monto error">$${deudaHoras.toLocaleString('es-UY', {minimumFractionDigits: 2})}</span>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="deuda-breakdown-divider">=</div>
                    
                    <div class="deuda-breakdown-item deuda-total">
                        <i class="fas fa-calculator"></i>
                        <div>
                            <span class="deuda-label">TOTAL ${estaPagada ? 'PAGADO' : 'A PAGAR'}</span>
                            <span class="deuda-monto-total" style="color: ${estaPagada ? '#4caf50' : '#fff'};">
                                $${montoTotal.toLocaleString('es-UY', {minimumFractionDigits: 2})}
                            </span>
                        </div>
                    </div>
                </div>
                
                ${renderEstadoPago(estaPagada, tienePagoPendiente, puedePagar, diasParaPagar, cuota, montoTotal)}
            </div>
        </div>
        
        <hr style="margin: 40px 0; border: none; border-top: 2px solid #e0e0e0;">
    `;
}

/**
 * Renderizar estado de pago (botones y mensajes)
 */
function renderEstadoPago(estaPagada, tienePagoPendiente, puedePagar, diasParaPagar, cuota, montoTotal) {
    const mes = obtenerNombreMes(cuota.mes);
    
    if (estaPagada) {
        return `
            <div class="alert-success" style="margin-top: 20px;">
                <strong style="color: #4caf50;">🎉 ¡Pago Completado!</strong>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                    Has pagado exitosamente tu cuota de ${mes} ${cuota.anio}.
                    ${cuota.fecha_pago ? `<br>Fecha de pago: ${new Date(cuota.fecha_pago).toLocaleDateString('es-UY')}` : ''}
                </p>
            </div>
        `;
    }
    
    if (tienePagoPendiente) {
        return `
            <div class="alert-info" style="margin-top: 20px; background: rgba(33, 150, 243, 0.2); border-color: rgba(33, 150, 243, 0.4);">
                <strong style="color: #2196F3;">⏳ Pago en Revisión</strong>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                    Tu pago de ${parseFloat(cuota.monto_pagado || 0).toLocaleString('es-UY', {minimumFractionDigits: 2})} 
                    está siendo validado por un administrador.
                    ${cuota.fecha_pago ? `<br>Enviado el: ${new Date(cuota.fecha_pago).toLocaleDateString('es-UY')}` : ''}
                </p>
            </div>
        `;
    }
    
    if (puedePagar) {
        return `
            <div class="deuda-total-actions">
                <button class="btn-pagar-deuda-total" 
                        onclick="abrirPagarDeudaTotal(${cuota.id_cuota}, ${montoTotal})"
                        style="
                            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                            color: #FFFFFF;
                            border: none;
                            padding: 14px 28px;
                            border-radius: 8px;
                            font-size: 15px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                            display: inline-flex;
                            align-items: center;
                            gap: 10px;
                        "
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(76, 175, 80, 0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(76, 175, 80, 0.3)'"
                        onmousedown="this.style.transform='translateY(0px)'"
                        onmouseup="this.style.transform='translateY(-2px)'">
                    <i class="fas fa-credit-card"></i>
                    Pagar Ahora
                </button>
            </div>
            
            <div class="alert-success" style="margin-top: 20px; background: rgba(76, 175, 80, 0.15); border-color: rgba(76, 175, 80, 0.3);">
                <strong style="color: #4caf50;"> Período de Pago Habilitado</strong>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                    Ya puedes realizar el pago de tu cuota. El período de pago está activo hasta fin de mes.
                </p>
            </div>
        `;
    }
    
    if (diasParaPagar > 0) {
        return `
            <div class="deuda-total-actions">
                <button class="btn-pagar-deuda-total" 
                        disabled
                        title="El período de pago se habilitará el día 25 del mes"
                        style="
                            background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
                            color: #FFFFFF;
                            border: none;
                            padding: 14px 28px;
                            border-radius: 8px;
                            font-size: 15px;
                            font-weight: 600;
                            cursor: not-allowed;
                            opacity: 0.6;
                            box-shadow: none;
                            display: inline-flex;
                            align-items: center;
                            gap: 10px;
                        ">
                    <i class="fas fa-lock"></i>
                    Pago Bloqueado
                </button>
            </div>
            
            <div class="alert-warning" style="margin-top: 20px;">
                <strong style="color: #ff9800;">🔒 Periodo de Trabajo en Curso</strong>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                    El período de pago se habilitará en <strong>${diasParaPagar} día${diasParaPagar !== 1 ? 's' : ''}</strong> (desde el 25 del mes).
                    <br>Por ahora, enfócate en cumplir tus <strong>21 horas semanales</strong> para evitar cargos adicionales.
                </p>
            </div>
        `;
    }
    
    return `
        <div class="alert-error" style="margin-top: 20px;">
            <strong style="color: #f44336;">❌ Cuota Vencida</strong>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
                Esta cuota no fue pagada a tiempo. La deuda se acumulará al siguiente mes.
            </p>
        </div>
    `;
}

/**
 * Renderizar tarjeta de cuota individual
 */
function renderCuotaCard(cuota) {
    const estadoFinal = cuota.estado_actual || cuota.estado;
    const mes = obtenerNombreMes(cuota.mes);
    const fechaVenc = new Date(cuota.fecha_vencimiento + 'T00:00:00');
    const fechaVencFormatted = fechaVenc.toLocaleDateString('es-UY');
    
    const esVencida = estadoFinal === 'vencida';
    const esPagada = cuota.estado === 'pagada';
    const tienePagoPendiente = cuota.id_pago && cuota.estado_pago === 'pendiente';
    
    // Calcular montos
    const montoCuota = obtenerPrecioActualizado(cuota);
    const deudaAcumuladaAnterior = parseFloat(cuota.monto_pendiente_anterior || 0);
    const deudaHorasMostrar = (estadoFinal !== 'pagada' && !tienePagoPendiente) ? (window.deudaHorasActual || 0) : 0;
    
    // Monto total a mostrar
    const montoMostrar = montoCuota + deudaAcumuladaAnterior + deudaHorasMostrar;
    
    // Si está pagada, obtener el monto realmente pagado
    const montoPagado = esPagada && cuota.monto_pagado ? parseFloat(cuota.monto_pagado) : montoMostrar;
    
    return `
        <div class="cuota-card estado-${estadoFinal}">
            <div class="cuota-card-header">
                <div>
                    <h4>${mes} ${cuota.anio}</h4>
                    <span class="cuota-vivienda">${cuota.numero_vivienda} - ${cuota.tipo_vivienda}</span>
                </div>
                <span class="cuota-badge badge-${estadoFinal}">
                    ${formatEstadoCuota(estadoFinal)}
                </span>
            </div>
            
            <div class="cuota-card-body">
                <div class="cuota-monto">
                    <span class="cuota-monto-label">${esPagada ? 'Monto Pagado:' : 'Monto Total:'}</span>
                    <span class="cuota-monto-valor">${(esPagada ? montoPagado : montoMostrar).toLocaleString('es-UY', {minimumFractionDigits: 2})}</span>
                </div>
                
                ${esPagada && (deudaAcumuladaAnterior > 0 || deudaHorasMostrar > 0) ? `
                    <div class="cuota-desglose" style="background: rgba(76, 175, 80, 0.1); padding: 12px; border-radius: 8px; margin-top: 10px;">
                        <strong style="display: block; margin-bottom: 8px; color: #333; font-size: 13px;"> Desglose del pago:</strong>
                        <div style="display: grid; gap: 6px; font-size: 12px; color: #555;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Cuota vivienda:</span>
                                <strong>${montoCuota.toLocaleString('es-UY', {minimumFractionDigits: 2})}</strong>
                            </div>
                            ${deudaAcumuladaAnterior > 0 ? `
                                <div style="display: flex; justify-content: space-between; color: #ff9800;">
                                    <span>+ Deuda acumulada:</span>
                                    <strong>${deudaAcumuladaAnterior.toLocaleString('es-UY', {minimumFractionDigits: 2})}</strong>
                                </div>
                            ` : ''}
                            ${deudaHorasMostrar > 0 ? `
                                <div style="display: flex; justify-content: space-between; color: #f44336;">
                                    <span>+ Deuda horas:</span>
                                    <strong>${deudaHorasMostrar.toLocaleString('es-UY', {minimumFractionDigits: 2})}</strong>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : !esPagada && !tienePagoPendiente && (deudaAcumuladaAnterior > 0 || deudaHorasMostrar > 0) ? `
                    <div class="cuota-desglose">
                        <small style="color: #666;">
                            Cuota: ${montoCuota.toLocaleString('es-UY', {minimumFractionDigits: 2})}
                            ${deudaAcumuladaAnterior > 0 ? ` + Deuda anterior: ${deudaAcumuladaAnterior.toLocaleString('es-UY', {minimumFractionDigits: 2})}` : ''}
                            ${deudaHorasMostrar > 0 ? ` + Deuda horas: ${deudaHorasMostrar.toLocaleString('es-UY', {minimumFractionDigits: 2})}` : ''}
                        </small>
                    </div>
                ` : ''}
                
                <div class="cuota-info-grid">
                    <div class="cuota-info-item">
                        <i class="fas fa-calendar"></i>
                        <span>Vencimiento: ${fechaVencFormatted}</span>
                    </div>
                    <div class="cuota-info-item">
                        <i class="fas fa-clock"></i>
                        <span>Horas: ${cuota.horas_cumplidas || 0}h / ${cuota.horas_requeridas}h</span>
                    </div>
                </div>
                
                ${tienePagoPendiente ? `
                    <div class="alert-info" style="margin-top: 10px;">
                        <i class="fas fa-hourglass-half"></i>
                        <strong>Pago pendiente de validación</strong>
                        <p style="margin: 5px 0 0 0; font-size: 12px;">
                            Enviado el ${new Date(cuota.fecha_pago).toLocaleDateString('es-UY')}
                        </p>
                    </div>
                ` : ''}
                
                ${cuota.estado_pago === 'rechazado' ? `
                    <div class="alert-warning" style="margin-top: 10px;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Pago rechazado</strong>
                        <p style="margin: 5px 0 0 0; font-size: 12px;">Debes volver a realizar el pago</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="cuota-card-footer">
                ${estadoFinal !== 'pagada' && !tienePagoPendiente ? `
                    <button class="btn btn-primary btn-small" onclick="abrirPagarDeudaTotal(${cuota.id_cuota}, ${montoMostrar})">
                        <i class="fas fa-credit-card"></i> Pagar Ahora
                    </button>
                ` : ''}
                
                ${tienePagoPendiente ? `
                    <button class="btn btn-secondary btn-small" disabled title="Pago en revisión">
                        <i class="fas fa-hourglass-half"></i> En Validación
                    </button>
                ` : ''}
                
                <button class="btn btn-secondary btn-small" onclick="verDetalleCuota(${cuota.id_cuota})">
                    <i class="fas fa-info-circle"></i> Detalles
                </button>
            </div>
        </div>
    `;
}

// ==========================================
//  MODAL DE PAGO (SOLO TRANSFERENCIA)
// ==========================================

/**
 * Abrir modal para pagar deuda total
 */
async function abrirPagarDeudaTotal(cuotaId, montoTotal) {
    console.log(' Abriendo modal para pagar deuda total');
    console.log('   Cuota ID:', cuotaId);
    console.log('   Monto total:', montoTotal);
    
    try {
        // 1. Obtener información de la cuota
        const response = await fetch(`/api/cuotas/detalle?cuota_id=${cuotaId}`);
        const data = await response.json();
        
        if (!data.success) {
            alert('❌ Error al cargar información de la cuota');
            return;
        }
        
        const cuota = data.cuota;
        // Asumiendo que 'obtenerNombreMes' es una función existente
        const mes = obtenerNombreMes(cuota.mes); 
        
        // 2. Limpiar modal anterior si existe
        const modalExistente = document.getElementById('pagarCuotaModal');
        if (modalExistente) {
            modalExistente.remove();
        }
        
        // 3. Crear el nuevo modal con el estilo 'material-modal'
        const modal = `
            <div id="pagarCuotaModal" class="material-modal" style="display: flex;">
                <div class="material-modal-content" onclick="event.stopPropagation()">
                    <div class="material-modal-header">
                        <h3 id="pagarModalTitle">
                            <i class="fas fa-credit-card"></i> Pagar Cuota - ${mes} ${cuota.anio}
                        </h3>
                        <button class="close-material-modal" onclick="closePagarCuotaModal()">&times;</button>
                    </div>
                    
                    <form id="pagarCuotaForm" onsubmit="submitPagarCuota(event)" enctype="multipart/form-data">
                        <input type="hidden" id="pagar-cuota-id" name="cuota_id" value="${cuotaId}">
                        <input type="hidden" id="pagar-monto" name="monto_pagado" value="${montoTotal}">
                        
                        <div class="alert-info" style="margin-bottom: 20px;">
                            <strong> Monto Total a Pagar:</strong>
                            <div style="font-size: 24px; font-weight: 700; margin-top: 10px;">
                                ${montoTotal.toLocaleString('es-UY', {minimumFractionDigits: 2})}
                            </div>
                        </div>

                        <div class="form-group">
                            <label>
                                <i class="fas fa-university"></i> Método de Pago
                            </label>
                            <div class="alert-info" style="padding: 10px; background: #e3f2fd;">
                                <strong>🏦 Solo Transferencia Bancaria</strong>
                                <p style="margin: 5px 0 0 0; font-size: 13px;">
                                    Los pagos deben realizarse mediante transferencia a la cuenta de la cooperativa.
                                </p>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="pagar-numero-comprobante">
                                <i class="fas fa-hashtag"></i> Número de Comprobante *
                            </label>
                            <input 
                                type="text" 
                                id="pagar-numero-comprobante" 
                                name="numero_comprobante"
                                placeholder="Ej: 123456789"
                                required>
                            <small class="form-help">Ingresa el número de la transferencia</small>
                        </div>

                        <div class="form-group">
                            <label for="pagar-comprobante">
                                <i class="fas fa-file-upload"></i> Comprobante de Pago *
                            </label>
                            <input 
                                type="file" 
                                id="pagar-comprobante" 
                                name="comprobante"
                                accept="image/*,.pdf"
                                required>
                            <small class="form-help">Adjunta captura o PDF del comprobante (máx. 5MB)</small>
                            <div id="file-name" style="margin-top: 5px; color: #666; font-size: 13px;"></div>
                        </div>

                        <div class="alert-warning">
                            <strong>⚠️ Importante:</strong>
                            <p style="margin: 5px 0 0 0;">
                                Tu pago será revisado y validado por un administrador. 
                                Recibirás una notificación cuando sea aprobado.
                            </p>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="closePagarCuotaModal()">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i> Enviar Comprobante
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // 4. Insertar el modal y configurar el comportamiento
        document.body.insertAdjacentHTML('beforeend', modal);
        
        // Mostrar nombre del archivo seleccionado
        document.getElementById('pagar-comprobante').addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name || '';
            const fileNameDisplay = document.getElementById('file-name');
            if (fileNameDisplay) {
                if (fileName) {
                    fileNameDisplay.textContent = '📎 Archivo seleccionado: ' + fileName;
                    fileNameDisplay.style.color = '#4caf50';
                } else {
                    fileNameDisplay.textContent = '';
                }
            }
        });

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al cargar información');
    }
}

/**
 * Cerrar modal de pago
 */
function closePagarCuotaModal() {
    const modal = document.getElementById('pagarCuotaModal');
    if (modal) {
        modal.remove();
    }
    // Restaurar scroll del body
    document.body.style.overflow = '';
}

/**
 * Enviar pago de cuota
 */
async function submitPagarCuota(event) {
    event.preventDefault();
    console.log('💾 Enviando pago de cuota (SOLO TRANSFERENCIA)');
    
    const cuotaId = document.getElementById('pagar-cuota-id').value;
    const monto = document.getElementById('pagar-monto').value;
    const numeroComprobante = document.getElementById('pagar-numero-comprobante').value;
    const archivo = document.getElementById('pagar-comprobante').files[0];
    
    if (!archivo) {
        alert('⚠️ Debes adjuntar el comprobante de pago');
        return;
    }
    
    const montoNum = parseFloat(monto);
    const deudaHoras = window.deudaHorasActual || 0;
    
    const mensaje = deudaHoras > 0 
        ? `¿Estás seguro de enviar este pago?\n\nMonto total: ${montoNum.toLocaleString('es-UY', {minimumFractionDigits: 2})}\n\nEsto incluye:\n- Cuota de vivienda\n- Deuda por horas no trabajadas\n\nMétodo: Transferencia Bancaria`
        : `¿Estás seguro de enviar este pago?\n\nMonto: ${montoNum.toLocaleString('es-UY', {minimumFractionDigits: 2})}\n\nMétodo: Transferencia Bancaria`;
    
    if (!confirm(mensaje)) {
        return;
    }
    
    const formData = new FormData();
    formData.append('cuota_id', cuotaId);
    formData.append('monto_pagado', monto);
    formData.append('metodo_pago', 'transferencia');
    formData.append('numero_comprobante', numeroComprobante);
    formData.append('comprobante', archivo);
    
    // Agregar flag si incluye deuda de horas
    if (deudaHoras > 0) {
        formData.append('incluye_deuda_horas', 'true');
        formData.append('monto_deuda_horas', deudaHoras);
    }
    
    const submitBtn = document.querySelector('#pagarCuotaForm button[type="submit"]');
    const btnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    
    try {
        const response = await fetch('/api/cuotas/pagar', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(' ' + data.mensaje + '\n\nTu pago por transferencia será revisado por un administrador.');
            closePagarCuotaModal();
            await inicializarSeccionCuotas();
        } else {
            alert('❌ ' + data.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnHTML;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al enviar el pago');
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnHTML;
    }
}

// ==========================================
// 👁️ VER DETALLE DE CUOTA
// ==========================================

/**
 * Ver detalles completos de una cuota
 */
async function verDetalleCuota(cuotaId) {
    try {
        const response = await fetch(`/api/cuotas/detalle?cuota_id=${cuotaId}`);
        const data = await response.json();
        
        if (!data.success) {
            alert('Error al cargar detalles');
            return;
        }
        
        const cuota = data.cuota;
        const validacion = data.validacion;
        const mes = obtenerNombreMes(cuota.mes);
        
        const modal = `
            <div class="modal-detail" onclick="if(event.target.classList.contains('modal-detail')) this.remove()">
                <div class="modal-detail-content">
                    <button onclick="this.closest('.modal-detail').remove()" class="modal-close-button">×</button>
                    
                    <h2 class="modal-detail-header"> Detalle de Cuota</h2>
                    
                    <div class="cuota-detalle-completo">
                        <div class="detalle-section">
                            <h3>Información General</h3>
                            <div class="detalle-grid">
                                <div><strong>Período:</strong> ${mes} ${cuota.anio}</div>
                                <div><strong>Estado:</strong> <span class="badge-${cuota.estado}">${formatEstadoCuota(cuota.estado)}</span></div>
                                <div><strong>Monto:</strong> ${parseFloat(cuota.monto).toLocaleString('es-UY', {minimumFractionDigits: 2})}</div>
                                <div><strong>Vencimiento:</strong> ${new Date(cuota.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-UY')}</div>
                            </div>
                        </div>
                        
                        <div class="detalle-section">
                            <h3>Vivienda</h3>
                            <div class="detalle-grid">
                                <div><strong>Número:</strong> ${cuota.numero_vivienda}</div>
                                <div><strong>Tipo:</strong> ${cuota.tipo_vivienda}</div>
                            </div>
                        </div>
                        
                        <div class="detalle-section">
                            <h3>Horas de Trabajo</h3>
                            <div class="detalle-grid">
                                <div><strong>Requeridas:</strong> ${cuota.horas_requeridas}h</div>
                                <div><strong>Cumplidas:</strong> ${cuota.horas_cumplidas || 0}h</div>
                            </div>
                        </div>
                        
                        ${cuota.observaciones ? `
                            <div class="detalle-section">
                                <h3>Observaciones</h3>
                                <p>${cuota.observaciones}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="modal-detail-footer">
                        <button onclick="this.closest('.modal-detail').remove()" class="btn btn-secondary">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar detalles');
    }
}

// ==========================================
//  ACTUALIZAR ESTADÍSTICAS
// ==========================================

/**
 * Actualizar contadores de estadísticas
 */
function updateCuotasStats(cuotas) {
    const pendientes = cuotas.filter(c => c.estado === 'pendiente' && c.estado_actual !== 'vencida').length;
    const pagadas = cuotas.filter(c => c.estado === 'pagada').length;
    const vencidas = cuotas.filter(c => c.estado_actual === 'vencida').length;
    
    const pendientesEl = document.getElementById('cuotas-pendientes-count');
    const pagadasEl = document.getElementById('cuotas-pagadas-count');
    const vencidasEl = document.getElementById('cuotas-vencidas-count');
    
    if (pendientesEl) pendientesEl.textContent = pendientes;
    if (pagadasEl) pagadasEl.textContent = pagadas;
    if (vencidasEl) vencidasEl.textContent = vencidas;
}

// ==========================================
// 🔄 POLLING AUTOMÁTICO (DETECCIÓN DE CAMBIOS)
// ==========================================

/**
 * Verificar cambios en las cuotas (polling cada 30s)
 */
async function verificarCambiosCuotas() {
    try {
        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();
        
        const response = await fetch(`/api/cuotas/mis-cuotas?mes=${mesActual}&anio=${anioActual}`);
        const data = await response.json();
        
        if (data.success && data.cuotas.length > 0) {
            const cuotaActual = data.cuotas[0];
            
            // Crear checksum para detectar cambios
            const checksum = `${cuotaActual.id_cuota}-${cuotaActual.estado}-${cuotaActual.estado_pago || 'none'}-${cuotaActual.estado_usuario || 'none'}`;
            
            console.log('🔍 [POLLING] Verificando cuota:', {
                id: cuotaActual.id_cuota,
                estado: cuotaActual.estado,
                estado_pago: cuotaActual.estado_pago,
                estado_usuario: cuotaActual.estado_usuario,
                checksum_actual: checksum,
                checksum_anterior: ultimoCheckCuotas
            });
            
            // Primera vez
            if (ultimoCheckCuotas === null) {
                ultimoCheckCuotas = checksum;
                console.log(' [POLLING] Checksum inicial guardado');
                return;
            }
            
            // Detectar cambio
            if (ultimoCheckCuotas !== checksum) {
                console.log(' [POLLING] ¡CAMBIO DETECTADO EN CUOTA!');
                console.log('   Checksum anterior:', ultimoCheckCuotas);
                console.log('   Checksum nuevo:', checksum);
                
                // Actualizar checksum
                ultimoCheckCuotas = checksum;
                
                // Verificar si estamos en la sección de cuotas
                const cuotasSection = document.getElementById('cuotas-section');
                if (cuotasSection && cuotasSection.classList.contains('active')) {
                    console.log(' [POLLING] Usuario en sección cuotas, recargando...');
                    await recargarSeccionCuotas();
                    mostrarNotificacionActualizacion(cuotaActual);
                } else {
                    console.log(' [POLLING] Usuario fuera de sección cuotas, no se recarga');
                }
            }
        }
    } catch (error) {
        console.error('❌ [POLLING] Error verificando cambios:', error);
    }
}

/**
 * Recargar sección de cuotas completamente
 */
async function recargarSeccionCuotas() {
    console.log('🔄 [RELOAD] Iniciando recarga completa de cuotas...');
    
    try {
        // 1. Limpiar cache
        ultimoCheckCuotas = null;
        
        // 2. Recargar deuda de horas
        await loadDeudaHorasParaCuotas();
        console.log(' [RELOAD] Deuda de horas recargada');
        
        // 3. Recargar cuotas
        await loadMisCuotas();
        console.log(' [RELOAD] Cuotas recargadas');
        
        // 4. Recargar info de vivienda
        await loadInfoViviendaCuota();
        console.log(' [RELOAD] Info vivienda recargada');
        
        console.log(' [RELOAD] Recarga completada exitosamente');
        
    } catch (error) {
        console.error('❌ [RELOAD] Error en recarga:', error);
    }
}

/**
 * Mostrar notificación de actualización
 */
function mostrarNotificacionActualizacion(cuota) {
    // Remover notificaciones anteriores
    const notifAnterior = document.getElementById('notif-actualizacion-cuota');
    if (notifAnterior) {
        notifAnterior.remove();
    }
    
    const estadoPago = cuota.estado_pago || cuota.estado;
    const estadoUsuario = cuota.estado_usuario || '';
    
    let mensaje = '';
    let icono = '';
    let color = '';
    
    if (estadoUsuario === 'aceptado' || estadoPago === 'aprobado') {
        mensaje = '¡Tu pago ha sido aprobado!';
        icono = 'fa-check-circle';
        color = '#4caf50';
    } else if (estadoPago === 'rechazado') {
        mensaje = 'Tu pago fue rechazado. Revisa las observaciones.';
        icono = 'fa-times-circle';
        color = '#f44336';
    } else {
        mensaje = 'Tu cuota ha sido actualizada';
        icono = 'fa-sync-alt';
        color = '#2196F3';
    }
    
    const notif = document.createElement('div');
    notif.id = 'notif-actualizacion-cuota';
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
        min-width: 300px;
        max-width: 400px;
    `;
    
    notif.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <i class="fas ${icono}" style="font-size: 32px;"></i>
            <div style="flex: 1;">
                <strong style="display: block; font-size: 16px; margin-bottom: 5px;">
                    ${mensaje}
                </strong>
                <p style="margin: 0; font-size: 13px; opacity: 0.9;">
                    La información ha sido actualizada automáticamente
                </p>
            </div>
            <button onclick="this.closest('#notif-actualizacion-cuota').remove()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; 
                           width: 30px; height: 30px; border-radius: 50%; cursor: pointer; 
                           font-size: 18px; line-height: 1;">
                ×
            </button>
        </div>
    `;
    
    // Agregar animación CSS si no existe
    if (!document.getElementById('notif-animation-style')) {
        const style = document.createElement('style');
        style.id = 'notif-animation-style';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notif);
    
    // Auto-remover después de 8 segundos
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.5s ease-in';
        setTimeout(() => notif.remove(), 500);
    }, 8000);
    
    console.log(' [NOTIF] Notificación mostrada:', mensaje);
}

/**
 * Iniciar polling cuando se entra a sección cuotas
 */
function iniciarPollingCuotas() {
    if (pollingCuotasActivo) {
        console.log(' [POLLING] Ya está activo, ignorando...');
        return;
    }
    
    console.log('▶️ [POLLING] Iniciando polling de cuotas (cada 30 segundos)');
    pollingCuotasActivo = true;
    
    // Verificar inmediatamente
    verificarCambiosCuotas();
    
    // Luego cada 30 segundos
    pollingInterval = setInterval(verificarCambiosCuotas, 30000);
}

/**
 * Detener polling cuando se sale de la sección
 */
function detenerPollingCuotas() {
    if (!pollingCuotasActivo) {
        return;
    }
    
    console.log('⏸️ [POLLING] Deteniendo polling de cuotas');
    pollingCuotasActivo = false;
    
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    
    // Resetear checksum
    ultimoCheckCuotas = null;
}

// Detener polling al salir de la página
window.addEventListener('beforeunload', function() {
    detenerPollingCuotas();
});

// ==========================================
// 🔧 FUNCIONES AUXILIARES
// ==========================================

/**
 * Obtener nombre del mes
 */
function obtenerNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[parseInt(mes) - 1] || mes;
}

/**
 * Formatear estado de cuota
 */
function formatEstadoCuota(estado) {
    const estados = {
        'pendiente': 'Pendiente',
        'pagada': 'Pagada',
        'vencida': 'Vencida',
        'exonerada': 'Exonerada'
    };
    return estados[estado] || estado;
}

/**
 * Obtener precio actualizado de la cuota
 */
function obtenerPrecioActualizado(cuota) {
    const precio = parseFloat(
        cuota.monto_base || 
        cuota.monto_actual || 
        cuota.monto || 
        0
    );
    
    console.log(` Precio para cuota ${cuota.id_cuota}:`, {
        monto_base: cuota.monto_base,
        monto_actual: cuota.monto_actual,
        monto: cuota.monto,
        precio_final: precio
    });
    
    return precio;
}

/**
 * Ver comprobante de pago
 */
function verComprobante(archivo) {
    window.open(`/files/?path=${archivo}`, '_blank');
}

// ==========================================
// 🔄 EXPORTAR FUNCIONES GLOBALES
// ==========================================

window.inicializarSeccionCuotas = inicializarSeccionCuotas;
window.loadMisCuotas = loadMisCuotas;
window.loadDeudaHorasParaCuotas = loadDeudaHorasParaCuotas;
window.loadInfoViviendaCuota = loadInfoViviendaCuota;
window.renderMisCuotasOrganizadas = renderMisCuotasOrganizadas;
window.renderCuotaCard = renderCuotaCard;
window.abrirPagarDeudaTotal = abrirPagarDeudaTotal;
window.closePagarCuotaModal = closePagarCuotaModal;
window.submitPagarCuota = submitPagarCuota;
window.verDetalleCuota = verDetalleCuota;
window.updateCuotasStats = updateCuotasStats;
window.verificarCambiosCuotas = verificarCambiosCuotas;
window.recargarSeccionCuotas = recargarSeccionCuotas;
window.iniciarPollingCuotas = iniciarPollingCuotas;
window.detenerPollingCuotas = detenerPollingCuotas;

// Exportar funciones auxiliares
window.obtenerNombreMes = obtenerNombreMes;
window.formatEstadoCuota = formatEstadoCuota;
window.obtenerPrecioActualizado = obtenerPrecioActualizado;
window.verComprobante = verComprobante;

console.log(' Módulo de cuotas cargado completamente');
console.log(' Funciones exportadas:', {
    inicializarSeccionCuotas: typeof window.inicializarSeccionCuotas,
    loadMisCuotas: typeof window.loadMisCuotas,
    abrirPagarDeudaTotal: typeof window.abrirPagarDeudaTotal,
    verificarCambiosCuotas: typeof window.verificarCambiosCuotas
});