
const ReportesMensuales = (function() {
    'use strict';

    // ==========================================
    // CONSTANTES DEL MÓDULO
    // ==========================================
    
    const ENDPOINTS = {
        MENSUAL: '/api/reporte/mensual',
        EXPORTAR: '/api/reporte/exportar'
    };

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

    const MESES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Variable para almacenar el reporte actual
    let reporteActual = null;

    // ==========================================
    // FUNCIONES PRIVADAS
    // ==========================================

    /**
     * Obtener nombre del mes
     */
    function obtenerNombreMes(mes) {
        const mesNum = parseInt(mes);
        return MESES[mesNum - 1] || `Mes ${mes}`;
    }

    /**
     * Inicializar selectores de año
     */
    function inicializarSelectores() {
     

        const anioMinimo = 2025;
        const aniosFuturos = 5;
        const selectAnio = document.getElementById('reporte-anio');
        
        if (selectAnio) {
            const anioActual = new Date().getFullYear();
            const anioMaximo = anioActual + aniosFuturos;
            selectAnio.innerHTML = '<option value="">Seleccione año...</option>';
            
            for (let anio = anioMaximo; anio >= anioMinimo; anio--) {
                const option = document.createElement('option');
                option.value = anio;
                option.textContent = anio;
                if (anio === anioActual) option.selected = true;
                selectAnio.appendChild(option);
            }
        }

        const selectMes = document.getElementById('reporte-mes');
        if (selectMes) {
            const mesActual = new Date().getMonth() + 1;
            selectMes.value = mesActual;
        }

   
    }

    /**
     * Renderizar tabla de reporte
     */
    function renderTablaReporte(usuarios) {
        const container = document.getElementById('reporteTableContainer');
        
        if (!usuarios || usuarios.length === 0) {
            container.innerHTML = `<p style="text-align: center; padding: 40px; color: ${COLORS.gray500};">No hay usuarios para este período</p>`;
            return;
        }
        
        let html = `
            <div style="overflow-x: auto; border-radius: 8px; box-shadow: ${COLORS.shadow};">
                <table style="width: 100%; border-collapse: collapse; background: ${COLORS.white}; min-width: 1000px;">
                    <thead>
                        <tr style="background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%); color: ${COLORS.white};">
                            <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;" data-i18n="dashboardAdmin.reports.table.columns.user">Usuario</th>
                            <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px;" data-i18n="dashboardAdmin.reports.table.columns.housing">Vivienda</th>
                            <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;" data-i18n="dashboardAdmin.reports.table.columns.hours">Horas</th>
                            <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;" data-i18n="dashboardAdmin.reports.table.columns.compliance">Cumplimiento</th>
                            <th style="padding: 15px 12px; text-align: right; font-weight: 600; font-size: 13px;" data-i18n="dashboardAdmin.reports.table.columns.debt">Deuda ($)</th>
                            <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;" data-i18n="dashboardAdmin.reports.table.columns.tasks">Tareas</th>
                            <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;" data-i18n="dashboardAdmin.reports.table.columns.fee">Cuota</th>
                            <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 13px;" data-i18n="dashboardAdmin.reports.table.columns.status">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        usuarios.forEach((usuario) => {
            const cumplimiento = usuario.porcentaje_cumplimiento || 0;
            
            let cumplimientoColor = COLORS.danger;
            if (cumplimiento >= 90) cumplimientoColor = COLORS.success;
            else if (cumplimiento >= 70) cumplimientoColor = COLORS.primary;
            else if (cumplimiento >= 50) cumplimientoColor = COLORS.warning;
            
            let estadoColor = COLORS.danger;
            let estadoText = '<span data-i18n="dashboardAdmin.reports.table.rows.statusLevel.critical">Crítico</span>';
            if (usuario.estado_general === 'excelente') {
                estadoColor = COLORS.success;
                estadoText = '<span data-i18n="dashboardAdmin.reports.table.rows.statusLevel.excellent">Excelente</span>';
            } else if (usuario.estado_general === 'bueno') {
                estadoColor = COLORS.primary;
                estadoText = '<span data-i18n="dashboardAdmin.reports.table.rows.statusLevel.good">Bueno</span>';
            } else if (usuario.estado_general === 'regular') {
                estadoColor = COLORS.warning;
                estadoText = '<span data-i18n="dashboardAdmin.reports.table.rows.statusLevel.regular">Regular</span>';
            }
            
            let cuotaColor = COLORS.gray500;
            let cuotaText = '<span data-i18n="dashboardAdmin.reports.table.rows.status.unassigned">Sin cuota</span>';
            if (usuario.estado_cuota === 'pagada') {
                cuotaColor = COLORS.success;
                cuotaText = '<span data-i18n="dashboardAdmin.reports.table.rows.status.paid">Pagada</span>';
            } else if (usuario.estado_cuota === 'pendiente') {
                cuotaColor = COLORS.warning;
                cuotaText = '<span data-i18n="dashboardAdmin.reports.table.rows.status.pending">Pendiente</span>';
            } else if (usuario.estado_cuota === 'vencida') {
                cuotaColor = COLORS.danger;
                cuotaText = '<span data-i18n="dashboardAdmin.reports.table.rows.status.overdue">Vencida</span>';
            }
            
            html += `
                <tr style="border-bottom: 1px solid ${COLORS.gray100}; transition: all 0.2s ease;" 
                    onmouseover="this.style.background='${COLORS.primaryLight}'" 
                    onmouseout="this.style.background='${COLORS.white}'">
                    
                    <td style="padding: 14px 12px; font-size: 13px;">
                        <div style="font-weight: 600; color: ${COLORS.primary};">${usuario.nombre_completo}</div>
                        <div style="font-size: 11px; color: ${COLORS.gray500}; margin-top: 3px;">${usuario.email}</div>
                    </td>
                    
                    <td style="padding: 14px 12px; font-size: 13px; color: ${COLORS.gray700};">
                        <div style="font-weight: 600;">${usuario.vivienda || '<span data-i18n="dashboardAdmin.reports.table.rows.unassigned">Sin asignar</span>'}</div>
                        ${usuario.tipo_vivienda ? `<div style="font-size: 11px; color: ${COLORS.gray500}; margin-top: 3px;">${usuario.tipo_vivienda}</div>` : ''}
                    </td>
                    
                    <td style="padding: 14px 12px; font-size: 13px; text-align: center; font-weight: 600; color: ${COLORS.gray700};">
                        <div>${usuario.horas_aprobadas || 0}h / ${usuario.horas_requeridas || 0}h</div>
                        ${(usuario.horas_pendientes || 0) > 0 ? 
                            `<div style="font-size: 11px; color: ${COLORS.warning}; margin-top: 3px;">⏳ ${usuario.horas_pendientes}h pend.</div>` : 
                            ''
                        }
                    </td>
                    
                    <td style="padding: 14px 12px; text-align: center;">
                        <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                            <div style="flex: 0 0 80px; height: 8px; background: ${COLORS.gray100}; border-radius: 10px; overflow: hidden;">
                                <div style="height: 100%; background: ${cumplimientoColor}; border-radius: 10px; width: ${cumplimiento}%; transition: width 0.5s ease;"></div>
                            </div>
                            <span style="font-weight: 600; font-size: 12px; color: ${COLORS.gray700};">${cumplimiento}%</span>
                        </div>
                    </td>
                    
                    <td style="padding: 14px 12px; text-align: right; font-weight: 600; font-size: 13px; color: ${(usuario.deuda_horas || 0) > 0 ? COLORS.danger : COLORS.primary};">
                        ${(usuario.deuda_horas || 0) > 0 ? 
                            `$${(usuario.deuda_horas || 0).toLocaleString('es-UY', {minimumFractionDigits: 2})}` : 
                            '✓ Sin deuda'
                        }
                    </td>
                    
                    <td style="padding: 14px 12px; text-align: center; font-weight: 600; color: ${COLORS.gray700};">
                        <div>${usuario.tareas_completadas || 0}/${usuario.tareas_asignadas || 0}</div>
                        ${(usuario.tareas_asignadas || 0) > 0 ? 
                            `<div style="font-size: 11px; color: ${COLORS.gray500}; margin-top: 3px;">${usuario.progreso_tareas || 0}% completado</div>` : 
                            `<div style="font-size: 11px; color: ${COLORS.gray500}; margin-top: 3px;" data-i18n="dashboardAdmin.reports.table.rows.withoutTasks">Sin tareas</div>`
                        }
                    </td>
                    
                    <td style="padding: 14px 12px; text-align: center;">
                        <div style="display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; background: ${cuotaColor}; color: ${cuotaColor === COLORS.warning ? COLORS.gray700 : COLORS.white};">
                            ${cuotaText}
                        </div>
                        ${(usuario.monto_cuota || 0) > 0 ? 
                            `<div style="font-size: 11px; color: ${COLORS.gray500}; margin-top: 5px;">$${(usuario.monto_cuota || 0).toLocaleString('es-UY', {minimumFractionDigits: 2})}</div>` : 
                            ''
                        }
                    </td>
                    
                    <td style="padding: 14px 12px; text-align: center;">
                        <div style="display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; background: ${estadoColor}; color: ${estadoColor === COLORS.warning ? COLORS.gray700 : COLORS.white};">
                            ${estadoText}
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
        i18n.translatePage();
    }

    /**
     * Actualizar estadísticas
     */
    function actualizarEstadisticas(resumen) {
        document.getElementById('reporte-total-usuarios').textContent = resumen.total_usuarios || 0;
        document.getElementById('reporte-total-horas').textContent = 
            Math.round(resumen.total_horas_trabajadas || 0) + 'h';
        document.getElementById('reporte-tareas-completadas').textContent = 
            (resumen.total_tareas_completadas || 0) + '/' + (resumen.total_tareas_asignadas || 0);
        document.getElementById('reporte-cumplimiento-promedio').textContent = 
            (resumen.promedio_cumplimiento || 0) + '%';
    }

    /**
     * Mostrar/ocultar contenedores
     */
    function mostrarContenedores(mostrar) {
        const display = mostrar ? 'block' : 'none';
        document.getElementById('reporte-resumen-container').style.display = display;
        document.getElementById('reporte-tabla-container').style.display = display;
        document.getElementById('btn-exportar').style.display = mostrar ? 'inline-block' : 'none';
    }

    // ==========================================
    // API PÚBLICA DEL MÓDULO
    // ==========================================

    return {
        /**
         * Generar reporte mensual
         */
        generarReporte: async function() {
            const mes = document.getElementById('reporte-mes').value;
            const anio = document.getElementById('reporte-anio').value;
            
          
            
            if (!mes || !anio) {
                alert('⚠️ Selecciona mes y año');
                return;
            }
            
            const container = document.getElementById('reporteTableContainer');
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: #005CB9;"><i class="fas fa-spinner fa-spin"></i> <span data-i18n="dashboardAdmin.reports.generating">Generando reporte...</span></p>';
            i18n.translatePage();
            mostrarContenedores(false);
            
            try {
                const url = `${ENDPOINTS.MENSUAL}?mes=${encodeURIComponent(mes)}&anio=${encodeURIComponent(anio)}`;
                
               
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'same-origin'
                });
                
           
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('✗ [REPORTE] Respuesta no es JSON:', text.substring(0, 500));
                    throw new Error('El servidor no devolvió JSON válido');
                }
                
                const data = await response.json();
           
                
                if (data.success) {
                    if (!data.reporte || !data.reporte.resumen) {
                        throw new Error('Estructura de datos inválida');
                    }
                    
                 
                    
                    reporteActual = data.reporte;
                    this.mostrarReporte(data.reporte);
                } else {
                    alert('✗ ' + (data.message || 'Error al generar reporte'));
                    container.innerHTML = `<p style="text-align: center; padding: 40px; color: #dc3545;">${data.message || '<span data-i18n="dashboardAdmin.reports.errorGeneratingReport">Error al generar reporte</span>'}</p>`;
                    i18n.translatePage();
                }
            } catch (error) {
                console.error('✗ [REPORTE] Error:', error);
                alert('✗ Error al generar reporte: ' + error.message);
                container.innerHTML = `<p style="text-align: center; padding: 40px; color: #dc3545;"><span data-i18n="dashboardAdmin.reports.error">Error:</span> ${error.message}</p>`;
                i18n.translatePage();
            }
        },

        /**
         * Mostrar reporte
         */
        mostrarReporte: function(reporte) {
        
            
            if (!reporte || !reporte.resumen) {
                alert('✗ Datos de reporte inválidos');
                return;
            }
            
            const mes = document.getElementById('reporte-mes').value;
            const anio = document.getElementById('reporte-anio').value;
            const nombreMes = obtenerNombreMes(mes);
            
        
            
            actualizarEstadisticas(reporte.resumen);
            mostrarContenedores(true);
            renderTablaReporte(reporte.usuarios);
            i18n.translatePage();
        
        },

        /**
         * Exportar reporte a CSV
         */
        exportarCSV: function() {
            if (!reporteActual) {
                alert('⚠️ Genera un reporte primero');
                return;
            }
            
            const mes = document.getElementById('reporte-mes').value;
            const anio = document.getElementById('reporte-anio').value;
            
           
            
            if (!mes || !anio) {
                alert('⚠️ Selecciona mes y año');
                return;
            }
            
            const url = `${ENDPOINTS.EXPORTAR}?mes=${encodeURIComponent(mes)}&anio=${encodeURIComponent(anio)}&formato=csv`;
           
            
            window.location.href = url;
        },

        /**
         * Obtener reporte actual
         */
        getReporteActual: function() {
            return reporteActual;
        },

        /**
         * Limpiar reporte
         */
        limpiar: function() {
            reporteActual = null;
            mostrarContenedores(false);
            document.getElementById('reporteTableContainer').innerHTML = '';
         
        },

        /**
         * Inicializar módulo
         */
        inicializar: function() {
           
            
            try {
                inicializarSelectores();
                
                // Listener para sección de reportes
                const reportesMenuItem = document.querySelector('.menu li[data-section="reportes"]');
                if (reportesMenuItem) {
                    reportesMenuItem.addEventListener('click', () => {
                       
                        inicializarSelectores();
                    });
                }
                
                // Listener para botón generar
                const btnGenerar = document.getElementById('btn-generar-reporte');
                if (btnGenerar) {
                    btnGenerar.addEventListener('click', () => this.generarReporte());
                }
                
                // Listener para botón exportar
                const btnExportar = document.getElementById('btn-exportar');
                if (btnExportar) {
                    btnExportar.addEventListener('click', () => this.exportarCSV());
                }
                
            } catch (error) {
                console.error('✗ [REPORTES] Error al inicializar:', error);
            }
        }
    };
})();

// ==========================================
// INICIALIZACIÓN AUTOMÁTICA
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    ReportesMensuales.inicializar();
});

// ==========================================
// EXPORTAR A WINDOW (RETROCOMPATIBILIDAD)
// ==========================================

window.ReportesMensuales = ReportesMensuales;
window.generarReporte = () => ReportesMensuales.generarReporte();
window.exportarReporteCSV = () => ReportesMensuales.exportarCSV();
window.mostrarReporte = (reporte) => ReportesMensuales.mostrarReporte(reporte);
window.inicializarReportes = () => ReportesMensuales.inicializar();

console.log('✓ Módulo de Reportes Mensuales cargado correctamente');