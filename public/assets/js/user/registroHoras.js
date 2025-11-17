// ==========================================
//  MÓDULO: REGISTRO DE HORAS
// Sistema completo de control de entrada/salida
// y gestión de horas trabajadas
// ==========================================

console.log('🟢 Iniciando módulo de registro de horas');

// ========== VARIABLES GLOBALES ==========
let relojInterval;
let registroAbiertoId = null;
let registroAbiertoData = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function () {
    console.log(' Inicializando módulo de horas');

    // Iniciar reloj en tiempo real
    updateClock();
    relojInterval = setInterval(updateClock, 1000);

    // Listener para la sección de horas
    const horasMenuItem = document.querySelector('.menu li[data-section="horas"]');
    if (horasMenuItem) {
        horasMenuItem.addEventListener('click', function () {
            console.log('>>> Sección horas abierta');
            inicializarSeccionHoras();
        });
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('editarRegistroModal');
        if (event.target === modal) {
            closeEditarRegistroModal();
        }
    });
});

// ========== RELOJ EN TIEMPO REAL ==========

function updateClock() {
    // Obtener hora actual del navegador
    const now = new Date();
    
    // Crear opciones para formato Uruguay
    const options = {
        timeZone: 'America/Montevideo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    // Formatear hora en zona horaria de Uruguay
    const timeString = now.toLocaleTimeString('es-UY', options);
    
    const clockElement = document.getElementById('current-time-display');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
}

function updateClockWithDate() {
    const now = new Date();
    
    const dateOptions = {
        timeZone: 'America/Montevideo',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const timeOptions = {
        timeZone: 'America/Montevideo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const dateString = now.toLocaleDateString('es-UY', dateOptions);
    const timeString = now.toLocaleTimeString('es-UY', timeOptions);
    
    // Capitalizar primera letra del día
    const dateCapitalized = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    
    // Actualizar elementos si existen
    const clockElement = document.getElementById('current-time-display');
    const dateElement = document.getElementById('current-date-display');
    
    if (clockElement) {
        clockElement.textContent = timeString;
    }
    
    if (dateElement) {
        dateElement.textContent = dateCapitalized;
    }
}

// ========== CARGAR DEUDA DE HORAS WIDGET ==========
async function cargarDeudaHorasWidget() {
    const container = document.getElementById('deuda-actual-container');
    if (!container) {
        console.log('⚠️ Container deuda-actual-container no encontrado');
        return;
    }
    
    container.innerHTML = '<p class="loading">Calculando deuda...</p>';
    
    try {
        const response = await fetch('/api/horas/deuda-actual');
        const data = await response.json();
        
        console.log(' Deuda de horas recibida:', data);
        
        if (data.success && data.deuda) {
            renderDeudaHorasWidget(data.deuda);
        } else {
            container.innerHTML = '<p class="error">No se pudo cargar la deuda de horas</p>';
        }
        
    } catch (error) {
        console.error('❌ Error al cargar deuda:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

function renderDeudaHorasWidget(deuda) {
    const container = document.getElementById('deuda-actual-container');
    
    const deudaMesActual = parseFloat(deuda.deuda_en_pesos || 0);
    const deudaAcumulada = parseFloat(deuda.deuda_acumulada || 0);
    const totalAPagar = deudaMesActual + deudaAcumulada;
    const tieneDeuda = totalAPagar > 0;
    
    container.innerHTML = `
        <div class="deuda-widget-compacto ${tieneDeuda ? 'con-deuda' : 'sin-deuda'}">
            <!-- VISTA COMPACTA (SIEMPRE VISIBLE) -->
            <div class="deuda-resumen" onclick="toggleDeudaDetalle()">
                <div class="deuda-resumen-left">
                    <i class="fas ${tieneDeuda ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                    <div>
                        <h4>${tieneDeuda ? 'Deuda de Horas' : 'Sin Deuda de Horas'}</h4>
                        <p>${getNombreMes(deuda.mes)} ${deuda.anio}</p>
                    </div>
                </div>
                <div class="deuda-resumen-right">
                    <div class="deuda-monto-compacto">
                        $${totalAPagar.toLocaleString('es-UY', {minimumFractionDigits: 2})}
                    </div>
                    <i class="fas fa-chevron-down toggle-icon" id="toggle-deuda-icon"></i>
                </div>
            </div>
            
            <!-- DETALLE EXPANDIBLE -->
            <div class="deuda-detalle" id="deuda-detalle-content" style="display: none;">
                <div class="deuda-stats-row">
                    <div class="stat-box">
                        <small>Trabajadas</small>
                        <strong>${deuda.horas_trabajadas}h</strong>
                    </div>
                    <div class="stat-box">
                        <small>Requeridas</small>
                        <strong>${deuda.horas_requeridas_mensuales}h</strong>
                    </div>
                    <div class="stat-box ${tieneDeuda ? 'error' : 'success'}">
                        <small>Faltantes</small>
                        <strong>${deuda.horas_faltantes}h</strong>
                    </div>
                </div>
                
                ${totalAPagar > 0 && deudaAcumulada > 0 ? `
                    <div class="deuda-breakdown-box">
                        <div class="breakdown-item">
                            <span>Mes actual:</span>
                            <strong>$${deudaMesActual.toLocaleString('es-UY', {minimumFractionDigits: 2})}</strong>
                        </div>
                        <div class="breakdown-item error">
                            <span>Acumulada:</span>
                            <strong>$${deudaAcumulada.toLocaleString('es-UY', {minimumFractionDigits: 2})}</strong>
                        </div>
                    </div>
                ` : ''}
                
                <div class="progreso-bar-container">
                    <div class="progreso-bar-header">
                        <span>Progreso Mensual</span>
                        <span>${deuda.porcentaje_cumplido}%</span>
                    </div>
                    <div class="progreso-bar">
                        <div class="progreso-fill" style="width: ${Math.min(deuda.porcentaje_cumplido, 100)}%; 
                             background: ${deuda.porcentaje_cumplido >= 100 ? '#4caf50' : 
                                          deuda.porcentaje_cumplido >= 50 ? '#ff9800' : '#f44336'}">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Función para expandir/colapsar
function toggleDeudaDetalle() {
    const detalle = document.getElementById('deuda-detalle-content');
    const icon = document.getElementById('toggle-deuda-icon');
    
    if (detalle.style.display === 'none') {
        detalle.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        detalle.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

function getNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[parseInt(mes) - 1] || mes;
}

// ========== INICIALIZAR SECCIÓN ==========
async function inicializarSeccionHoras() {
    console.log('🔄 Inicializando sección de horas');

    try {
        // Verificar si hay registro abierto
        await verificarRegistroAbierto();

        // Cargar datos
        await Promise.all([
            loadResumenSemanal(),
            loadMisRegistros(),
            cargarEstadisticas(),
            cargarDeudaHorasWidget()
        ]);

        console.log(' Sección inicializada correctamente');

    } catch (error) {
        console.error('❌ Error al inicializar:', error);
        alert('Error al cargar la información. Por favor, recarga la página.');
    }
}

// ========== VERIFICAR REGISTRO ABIERTO ==========
async function verificarRegistroAbierto() {
    try {
        const response = await fetch('/api/horas/registro-abierto', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        });

        // DEBUG: Ver respuesta cruda
        const responseText = await response.text();
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response text:', responseText.substring(0, 500));

        // Intentar parsear JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ Error parsing JSON:', parseError);
            console.error('❌ Response completo:', responseText);
            throw new Error('El servidor devolvió HTML en lugar de JSON. Revisa los logs de PHP.');
        }

        console.log(' Verificación de registro:', data);

        if (data.success && data.registro) {
            // Hay un registro abierto
            registroAbiertoId = data.registro.id_registro;
            registroAbiertoData = data.registro;
            mostrarBotonSalida(data.registro.hora_entrada);
            console.log(' Registro abierto encontrado:', registroAbiertoId);
        } else {
            // No hay registro abierto
            registroAbiertoId = null;
            registroAbiertoData = null;
            mostrarBotonEntrada();
            console.log(' No hay registro abierto');
        }

    } catch (error) {
        console.error('❌ Error en verificarRegistroAbierto:', error);
        mostrarBotonEntrada();
    }
}

// ========== MOSTRAR BOTONES ==========
function mostrarBotonEntrada() {
    const btnEntrada = document.getElementById('btn-entrada');
    const btnSalida = document.getElementById('btn-salida');
    const infoDiv = document.getElementById('registro-activo-info');

    if (btnEntrada) btnEntrada.style.display = 'inline-block';
    if (btnSalida) btnSalida.style.display = 'none';
    if (infoDiv) infoDiv.style.display = 'none';
}

function mostrarBotonSalida(horaEntrada) {
    const btnEntrada = document.getElementById('btn-entrada');
    const btnSalida = document.getElementById('btn-salida');
    const infoDiv = document.getElementById('registro-activo-info');
    const horaEntradaSpan = document.getElementById('hora-entrada-activa');

    if (btnEntrada) btnEntrada.style.display = 'none';
    if (btnSalida) btnSalida.style.display = 'inline-block';
    if (infoDiv) infoDiv.style.display = 'block';

    if (horaEntradaSpan && horaEntrada) {
        const horaFormateada = horaEntrada.substring(0, 5); // HH:MM
        horaEntradaSpan.textContent = horaFormateada;
    }
}

// ========== MARCAR ENTRADA ==========
async function marcarEntrada() {
    console.log(' Iniciando marcación de entrada');

    const descripcion = prompt('Describe brevemente tu trabajo de hoy (opcional):');
    if (descripcion === null) {
        console.log(' Usuario canceló la entrada');
        return;
    }

    const btnEntrada = document.getElementById('btn-entrada');
    btnEntrada.disabled = true;
    btnEntrada.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

    try {
        const hoy = new Date();
        const formData = new FormData();
        formData.append('fecha', hoy.toISOString().split('T')[0]);
        formData.append('hora_entrada', hoy.toTimeString().split(' ')[0]);
        formData.append('descripcion', descripcion || '');

        console.log('📤 Enviando datos de entrada');

        const response = await fetch('/api/horas/iniciar', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        const data = await response.json();
        console.log('📥 Respuesta del servidor:', data);

        if (data.success) {
            alert(` ${data.message}\nHora registrada: ${data.hora_entrada}`);
            registroAbiertoId = data.id_registro;
            
            // Restablecer botón antes de recargar
            btnEntrada.disabled = false;
            btnEntrada.innerHTML = '<i class="fas fa-sign-in-alt"></i> Marcar Entrada';
            
            await inicializarSeccionHoras();
        } else {
            alert(`❌ ${data.message}`);
            btnEntrada.disabled = false;
            btnEntrada.innerHTML = '<i class="fas fa-sign-in-alt"></i> Marcar Entrada';
        }

    } catch (error) {
        console.error('❌ Error al marcar entrada:', error);
        alert('❌ Error de conexión. Por favor, intenta nuevamente.');
        btnEntrada.disabled = false;
        btnEntrada.innerHTML = '<i class="fas fa-sign-in-alt"></i> Marcar Entrada';
    }
}

// ========== MARCAR SALIDA ==========
async function marcarSalida() {
    console.log(' Iniciando marcación de salida');

    if (!registroAbiertoId) {
        alert('❌ No hay registro activo para cerrar');
        return;
    }

    if (!confirm('¿Deseas registrar tu salida ahora?')) {
        console.log(' Usuario canceló la salida');
        return;
    }

    const btnSalida = document.getElementById('btn-salida');
    const btnHTML = btnSalida.innerHTML;
    btnSalida.disabled = true;
    btnSalida.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

    try {
        const ahora = new Date();
        const formData = new FormData();
        formData.append('id_registro', registroAbiertoId);
        formData.append('hora_salida', ahora.toTimeString().split(' ')[0]);

        console.log('📤 Enviando datos de salida');

        const response = await fetch('/api/horas/cerrar', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        const data = await response.json();
        console.log('📥 Respuesta del servidor:', data);

        if (data.success) {
            alert(` ${data.message}\n\n⏱️ Total trabajado: ${data.total_horas} horas`);
            registroAbiertoId = null;
            registroAbiertoData = null;
            
            // Restablecer botón antes de recargar
            btnSalida.disabled = false;
            btnSalida.innerHTML = btnHTML;
            
            await inicializarSeccionHoras();
        } else {
            alert(`❌ ${data.message}`);
            btnSalida.disabled = false;
            btnSalida.innerHTML = btnHTML;
        }

    } catch (error) {
        console.error('❌ Error al marcar salida:', error);
        alert('❌ Error de conexión. Por favor, intenta nuevamente.');
        btnSalida.disabled = false;
        btnSalida.innerHTML = btnHTML;
    }
}

// ========== CARGAR ESTADÍSTICAS ==========
async function cargarEstadisticas() {
    try {
        const [resumenResponse, statsResponse] = await Promise.all([
            fetch('/api/horas/resumen-semanal'),
            fetch('/api/horas/estadisticas')
        ]);

        const resumenData = await resumenResponse.json();
        const statsData = await statsResponse.json();

        // Actualizar horas de la semana
        if (resumenData.success && resumenData.resumen) {
            const horasSemana = document.getElementById('horas-semana');
            const diasSemana = document.getElementById('dias-semana');

            if (horasSemana) {
                horasSemana.textContent = (resumenData.resumen.total_horas || 0) + 'h';
            }
            if (diasSemana) {
                diasSemana.textContent = resumenData.resumen.dias_trabajados || 0;
            }
        }

        // Actualizar horas del mes
        if (statsData.success && statsData.estadisticas) {
            const horasMes = document.getElementById('horas-mes');
            if (horasMes) {
                horasMes.textContent = (statsData.estadisticas.total_horas || 0) + 'h';
            }
        }

        console.log(' Estadísticas actualizadas');

    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
    }
}

// ========== RESUMEN SEMANAL ==========
async function loadResumenSemanal() {
    const container = document.getElementById('resumen-semanal-container');
    if (!container) return;

    container.innerHTML = '<p class="loading">Cargando resumen semanal...</p>';

    try {
        const response = await fetch('/api/horas/resumen-semanal');
        const data = await response.json();

        if (data.success && data.resumen) {
            renderResumenSemanal(data.resumen);
            console.log(' Resumen semanal cargado');
        } else {
            container.innerHTML = '<p class="error">Error al cargar resumen semanal</p>';
        }

    } catch (error) {
        console.error('❌ Error al cargar resumen semanal:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

function renderResumenSemanal(resumen) {
    const container = document.getElementById('resumen-semanal-container');

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const registrosPorDia = {};

    // Organizar registros por día
    if (resumen.registros) {
        resumen.registros.forEach(reg => {
            registrosPorDia[reg.fecha] = reg;
        });
    }

    // Generar fechas de la semana 
    const fechaInicio = new Date(resumen.semana.inicio + 'T00:00:00');
    const fechas = [];
    for (let i = 0; i < 7; i++) {
        const fecha = new Date(fechaInicio);
        fecha.setDate(fecha.getDate() + i);
        fechas.push(fecha.toISOString().split('T')[0]);
    }

    let html = `
        <div class="resumen-semana-header">
            <p><strong>Semana del ${formatearFechaSimple(resumen.semana.inicio)} al ${formatearFechaSimple(resumen.semana.fin)}</strong></p>
            <p>
                 Total: <strong>${resumen.total_horas}h</strong> | 
                📅 Días trabajados: <strong>${resumen.dias_trabajados}</strong>
            </p>
        </div>
        <div class="resumen-dias-grid">
    `;

    fechas.forEach((fecha, index) => {
        const registro = registrosPorDia[fecha];
        const dia = diasSemana[index];
        const fechaFormateada = formatearFechaSimple(fecha);
        const esHoy = fecha === new Date().toISOString().split('T')[0];
        const esFinDeSemana = index === 5 || index === 6; 

       html += `
    <div class="dia-card ${registro ? 'con-registro' : 'sin-registro'} ${esHoy ? 'dia-hoy' : ''} ${esFinDeSemana ? 'fin-de-semana' : ''}">
        <div class="dia-header">
            <div class="dia-info">
                <strong>${dia}</strong>
                <span class="dia-fecha">${fechaFormateada}</span>
            </div>
            <div class="dia-badges">
                ${esHoy ? '<span class="badge-hoy">HOY</span>' : ''}
                ${esFinDeSemana ? '<span class="badge-finde">🖐️</span>' : ''}
            </div>
        </div>
        <div class="dia-content">
`;

        if (registro) {
            const entrada = registro.hora_entrada ? registro.hora_entrada.substring(0, 5) : '--:--';
            const salida = registro.hora_salida ? registro.hora_salida.substring(0, 5) : 'En curso';
            const horas = registro.total_horas || 0;
            const estadoBadge = getEstadoBadge(registro.estado);

            html += `
                <div class="registro-info">
                    <p><i class="fas fa-sign-in-alt"></i> Entrada: <strong>${entrada}</strong></p>
                    <p><i class="fas fa-sign-out-alt"></i> Salida: <strong>${salida}</strong></p>
                    <p><i class="fas fa-clock"></i> Total: <strong>${horas}h</strong></p>
                    ${estadoBadge}
                </div>
            `;
        } else {
            html += '<p class="no-registro"><i class="fas fa-calendar-times"></i> Sin registro</p>';
        }

        html += `
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function getEstadoBadge(estado) {
    const badges = {
        'pendiente': '<span class="badge-estado pendiente"><i class="fas fa-clock"></i> Pendiente</span>',
        'aprobado': '<span class="badge-estado aprobado"><i class="fas fa-check-circle"></i> Aprobado</span>',
        'rechazado': '<span class="badge-estado rechazado"><i class="fas fa-times-circle"></i> Rechazado</span>'
    };
    return badges[estado] || '';
}

// ========== HISTORIAL DE REGISTROS ==========
async function loadMisRegistros() {
    const container = document.getElementById('historial-registros-container');
    if (!container) return;

    container.innerHTML = '<p class="loading">Cargando historial...</p>';

    try {
        const fechaInicio = document.getElementById('filtro-fecha-inicio')?.value || '';
        const fechaFin = document.getElementById('filtro-fecha-fin')?.value || '';

        let url = '/api/horas/mis-registros';
        if (fechaInicio && fechaFin) {
            url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.registros) {
            renderHistorialRegistros(data.registros);
            console.log(` ${data.registros.length} registros cargados`);
        } else {
            container.innerHTML = '<p class="error">Error al cargar registros</p>';
        }

    } catch (error) {
        console.error('❌ Error al cargar registros:', error);
        container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

function renderHistorialRegistros(registros) {
    const container = document.getElementById('historial-registros-container');

    if (!registros || registros.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 12px;">
                <i class="fas fa-inbox" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
                <p style="color: #6c757d; margin: 0;">No hay registros para mostrar</p>
            </div>
        `;
        return;
    }

    // Ordenar por fecha descendente (más reciente primero)
    registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    let html = `
        <div class="tabla-registros-wrapper">
            <table class="tabla-registros">
                <thead>
                    <tr>
                        <th><i class="fas fa-calendar"></i> Fecha</th>
                        <th><i class="fas fa-clock"></i> Entrada</th>
                        <th><i class="fas fa-clock"></i> Salida</th>
                        <th><i class="fas fa-hourglass-half"></i> Horas Trabajadas</th>
                        <th><i class="fas fa-minus-circle"></i> Horas Justificadas</th>
                        <th><i class="fas fa-calculator"></i> Horas Netas</th>
                        <th><i class="fas fa-info-circle"></i> Estado</th>
                        <th><i class="fas fa-tools"></i> Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

    registros.forEach(reg => {
        const fecha = new Date(reg.fecha + 'T00:00:00');
        const fechaFormateada = formatearFecha(fecha);
        const diaSemana = obtenerDiaSemana(fecha);
        
        // Calcular horas trabajadas correctamente
        let horasTrabajadas = 0;
        if (reg.hora_entrada && reg.hora_salida) {
            const [hE, mE, sE] = reg.hora_entrada.split(':').map(Number);
            const [hS, mS, sS] = reg.hora_salida.split(':').map(Number);
            const entrada = hE + mE/60 + sE/3600;
            const salida = hS + mS/60 + sS/3600;
            horasTrabajadas = Math.max(0, salida - entrada);
        }
        
        const horasJustificadas = parseFloat(reg.horas_justificadas || 0);
        const horasNetas = Math.max(0, horasTrabajadas - horasJustificadas);
        
        const entrada = reg.hora_entrada ? reg.hora_entrada.substring(0, 5) : '--:--';
        const salida = reg.hora_salida ? reg.hora_salida.substring(0, 5) : '--:--';
        
        // Determinar estado
        let estadoBadge = '';
        let estadoClase = '';
        
        if (reg.hora_salida) {
            estadoBadge = '<span class="badge-completo">✓ Completo</span>';
            estadoClase = 'registro-completo';
        } else {
            estadoBadge = '<span class="badge-pendiente">⏳ En curso</span>';
            estadoClase = 'registro-pendiente';
        }

        html += `
            <tr class="registro-row ${estadoClase}">
                <td class="fecha-cell">
                    <div class="fecha-info">
                        <span class="fecha-dia">${diaSemana}</span>
                        <span class="fecha-numero">${fechaFormateada}</span>
                    </div>
                </td>
                <td class="hora-cell">
                    <span class="hora-valor">${entrada}</span>
                </td>
                <td class="hora-cell">
                    <span class="hora-valor">${salida}</span>
                </td>
                <td class="horas-cell">
                    <span class="horas-total">${horasTrabajadas.toFixed(2)}h</span>
                </td>
                <td class="horas-cell">
                    <span class="horas-justificadas ${horasJustificadas > 0 ? 'con-justificacion' : ''}">${horasJustificadas.toFixed(2)}h</span>
                    ${horasJustificadas > 0 && reg.motivo_justificacion ? 
                        `<button class="btn-mini" onclick="verMotivoJustificacion('${reg.motivo_justificacion}', '${fechaFormateada}')" title="Ver motivo"><i class="fas fa-comment"></i></button>` 
                        : ''}
                </td>
                <td class="horas-cell">
                    <span class="horas-netas">${horasNetas.toFixed(2)}h</span>
                </td>
                <td class="estado-cell">
                    ${estadoBadge}
                </td>
                <td class="acciones-cell">
                    ${reg.hora_salida ? 
                        `<button class="btn-small btn-warning" onclick="abrirModalJustificar(${reg.id_registro}, '${fechaFormateada}', ${horasTrabajadas.toFixed(2)}, ${horasJustificadas.toFixed(2)})" title="Justificar horas">
                            <i class="fas fa-file-medical"></i> Justificar
                        </button>` 
                        : '<span style="color: #999; font-size: 12px;">Registro abierto</span>'}
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    html += getEstilosTablaRegistros();
    
    container.innerHTML = html;
}

function formatearFecha(fecha) {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function obtenerDiaSemana(fecha) {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[fecha.getDay()];
}

function getEstilosTablaRegistros() {
    return `
        <style>
            .tabla-registros-wrapper {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                overflow: hidden;
            }

            .tabla-registros {
                width: 100%;
                border-collapse: collapse;
            }

            .tabla-registros thead {
                background: linear-gradient(135deg, #005CB9 0%, #004494 100%);
                color: white;
            }

            .tabla-registros thead th {
                padding: 16px;
                text-align: left;
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .tabla-registros thead th i {
                margin-right: 8px;
                opacity: 0.9;
            }

            .tabla-registros tbody tr {
                border-bottom: 1px solid #e9ecef;
                transition: all 0.2s ease;
            }

            .tabla-registros tbody tr:hover {
                background: #f8f9fa;
                transform: scale(1.01);
            }

            .tabla-registros tbody tr:last-child {
                border-bottom: none;
            }

            .tabla-registros tbody td {
                padding: 16px;
                vertical-align: middle;
            }

            /* Celda de fecha */
            .fecha-cell {
                min-width: 150px;
            }

            .fecha-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .fecha-dia {
                font-size: 12px;
                color: #6c757d;
                font-weight: 500;
                text-transform: uppercase;
            }

            .fecha-numero {
                font-size: 14px;
                color: #212529;
                font-weight: 600;
            }

            /* Celda de hora */
            .hora-cell {
                min-width: 100px;
            }

            .hora-valor {
                font-family: 'Courier New', monospace;
                font-size: 15px;
                font-weight: 600;
                color: #495057;
            }

            /* Celda de horas totales */
            .horas-cell {
                min-width: 100px;
            }

            .horas-total {
                display: inline-block;
                padding: 6px 12px;
                background: #e3f2fd;
                color: #1976d2;
                border-radius: 20px;
                font-weight: 700;
                font-size: 14px;
            }

            /* Badges de estado */
            .estado-cell {
                min-width: 120px;
            }

            .badge-completo {
                display: inline-block;
                padding: 6px 14px;
                background: #d4edda;
                color: #155724;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                border: 1px solid #c3e6cb;
            }

            .badge-pendiente {
                display: inline-block;
                padding: 6px 14px;
                background: #fff3cd;
                color: #856404;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                border: 1px solid #ffeaa7;
            }

            /* Estados de registro */
            .registro-row.registro-completo {
                background: #f8fff9;
            }

            .registro-row.registro-pendiente {
                background: #fffef8;
            }

            /* Loading y error */
            .loading, .error {
                text-align: center;
                padding: 40px;
                color: #6c757d;
                font-size: 16px;
            }

            .error {
                color: #dc3545;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .tabla-registros-wrapper {
                    overflow-x: auto;
                }

                .tabla-registros {
                    min-width: 700px;
                }

                .tabla-registros thead th,
                .tabla-registros tbody td {
                    padding: 12px 8px;
                    font-size: 13px;
                }
            }
        </style>
    `;
}

// Función para ver la descripción en un modal
function verDescripcionRegistro(descripcion, fecha) {
    const modal = `
        <div class="modal-detail" onclick="if(event.target.classList.contains('modal-detail')) this.remove()">
            <div class="modal-detail-content" style="max-width: 600px;">
                <button onclick="this.closest('.modal-detail').remove()" class="modal-close-button">×</button>
                
                <h2 class="modal-detail-header">
                    <i class="fas fa-file-alt"></i> Descripción del Registro
                </h2>
                
                <div class="modal-detail-section">
                    <p><strong>Fecha:</strong> ${fecha}</p>
                </div>
                
                <div class="modal-detail-section" style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <p style="margin: 0; white-space: pre-wrap;">${descripcion}</p>
                </div>
                
                <div class="modal-detail-footer">
                    <button onclick="this.closest('.modal-detail').remove()" class="btn btn-secondary">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

function formatearFechaSimple(fecha) {
    const f = new Date(fecha + 'T00:00:00');
    return f.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// ========== FILTRAR REGISTROS ==========
async function filtrarRegistros() {
    const fechaInicio = document.getElementById('filtro-fecha-inicio')?.value;
    const fechaFin = document.getElementById('filtro-fecha-fin')?.value;

    if (!fechaInicio || !fechaFin) {
        alert('⚠️ Selecciona ambas fechas para filtrar');
        return;
    }

    if (fechaInicio > fechaFin) {
        alert('⚠️ La fecha de inicio debe ser anterior a la fecha de fin');
        return;
    }

    console.log(`🔍 Filtrando registros: ${fechaInicio} a ${fechaFin}`);
    await loadMisRegistros();
}

// ========== EXPORTAR FUNCIONES GLOBALES ==========
window.inicializarSeccionHoras = inicializarSeccionHoras;
window.marcarEntrada = marcarEntrada;
window.marcarSalida = marcarSalida;
window.loadResumenSemanal = loadResumenSemanal;
window.loadMisRegistros = loadMisRegistros;
window.filtrarRegistros = filtrarRegistros;
window.toggleDeudaDetalle = toggleDeudaDetalle;
window.cargarDeudaHorasWidget = cargarDeudaHorasWidget;
window.verDescripcionRegistro = verDescripcionRegistro;
window.toggleSemana = toggleSemana;

console.log(' Módulo de registro de horas cargado completamente');
console.log(' Funciones exportadas:', {
    inicializarSeccionHoras: typeof window.inicializarSeccionHoras,
    marcarEntrada: typeof window.marcarEntrada,
    marcarSalida: typeof window.marcarSalida,
    loadResumenSemanal: typeof window.loadResumenSemanal,
    loadMisRegistros: typeof window.loadMisRegistros,
    filtrarRegistros: typeof window.filtrarRegistros
});