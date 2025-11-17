console.log('🟢 Cargando módulo de vivienda de usuario (Premium Design)');

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log(' Inicializando módulo de vivienda');
    
    // Listener para la sección de vivienda
    const viviendaMenuItem = document.querySelector('.menu li[data-section="vivienda"]');
    if (viviendaMenuItem) {
        viviendaMenuItem.addEventListener('click', function() {
            console.log('>>> Sección vivienda abierta');
            loadMyVivienda();
        });
    }
});

// ==========================================
// 📥 CARGAR MI VIVIENDA
// ==========================================

/**
 * Cargar información de la vivienda del usuario
 */
function loadMyVivienda() {
    console.log('==========================================');
    console.log(' INICIANDO CARGA DE VIVIENDA');
    console.log('==========================================');
    
    const container = document.getElementById('myViviendaContainer');

    if (!container) {
        console.error('❌ Container myViviendaContainer NO encontrado');
        return;
    }

    console.log(' Container encontrado');
    container.innerHTML = `
        <div class="loading-vivienda">
            <div class="loading-spinner">
                <i class="fas fa-home fa-spin"></i>
            </div>
            <p data-i18n="dashboardUser.housing.loading">Cargando tu vivienda...</p>
        </div>
    `;
    i18n.translatePage(); // Actualizar traducciones

    fetch('/api/viviendas/my-vivienda', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
    })
        .then(response => {
            console.log('📡 Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log(' Data recibida:', data);
            
            if (data.success) {
                if (data.vivienda) {
                    console.log(' Vivienda encontrada:', data.vivienda);
                    renderMyVivienda(data.vivienda);
                } else {
                    console.log('⚠️ Usuario sin vivienda asignada');
                    renderSinVivienda(container);
                }
            } else {
                console.error('❌ Error en respuesta:', data.message);
                renderError(container, data.message);
            }
        })
        .catch(error => {
            console.error('==========================================');
            console.error('❌ ERROR CAPTURADO:');
            console.error('   - Mensaje:', error.message);
            console.error('   - Stack:', error.stack);
            console.error('==========================================');
            
            renderError(container, 'Error de conexión al cargar tu vivienda');
        });
        
    console.log('==========================================');
    console.log(' FIN SOLICITUD DE VIVIENDA');
    console.log('==========================================');
}

// ==========================================
// 🎨 RENDERIZAR VIVIENDA (DISEÑO PREMIUM)
// ==========================================

/**
 * Renderizar información de la vivienda con diseño moderno
 */
function renderMyVivienda(vivienda) {
    console.log('🎨 Renderizando vivienda con diseño premium:', vivienda);
    
    const container = document.getElementById('myViviendaContainer');

    // Formatear fecha de asignación
    const fechaAsignacion = vivienda.fecha_asignacion 
        ? new Date(vivienda.fecha_asignacion).toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
        : 'No disponible';

    const tiempoAsignacion = calcularTiempoAsignacion(vivienda.fecha_asignacion);
    const colorTipo = getColorTipoVivienda(vivienda.tipo_nombre);

    container.innerHTML = `
        <!-- ========== HERO CARD ========== -->
        <div class="vivienda-hero-card" style="
            background: linear-gradient(135deg, ${colorTipo}15 0%, ${colorTipo}05 100%);
            border: 2px solid ${colorTipo}30;
            border-radius: 20px;
            overflow: hidden;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            animation: slideInDown 0.5s ease-out;
        ">
            <!-- Header con gradiente -->
            <div class="vivienda-hero-header" style="
                background: linear-gradient(135deg, ${colorTipo} 0%, ${colorTipo}dd 100%);
                padding: 40px 30px;
                color: white;
                position: relative;
                overflow: hidden;
            ">
                <!-- Pattern de fondo -->
                <div style="
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 200px;
                    height: 200px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 50%;
                    transform: translate(30%, -30%);
                "></div>
                
                <div style="position: relative; z-index: 1; display: flex; align-items: center; gap: 25px;">
                    <div class="vivienda-hero-icon" style="
                        width: 90px;
                        height: 90px;
                        background: rgba(255,255,255,0.2);
                        backdrop-filter: blur(10px);
                        border-radius: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 45px;
                        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    ">
                        <i class="fas fa-home"></i>
                    </div>
                    
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                            <h2 style="margin: 0; font-size: 36px; font-weight: 700;">
                                Vivienda ${vivienda.numero_vivienda}
                            </h2>
                            <span class="vivienda-tipo-badge-premium" style="
                                background: rgba(255,255,255,0.25);
                                backdrop-filter: blur(10px);
                                padding: 8px 16px;
                                border-radius: 20px;
                                font-size: 14px;
                                font-weight: 600;
                                border: 1px solid rgba(255,255,255,0.3);
                            ">
                                ${vivienda.tipo_nombre}
                            </span>
                        </div>
                        <p style="margin: 0; font-size: 16px; opacity: 0.95;">
                            <i class="fas fa-map-marker-alt" style="margin-right: 8px;"></i>
                            ${vivienda.direccion || 'Dirección no especificada'}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Quick Stats Bar -->
            <div class="vivienda-quick-stats" style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 0;
                background: white;
                border-top: 1px solid ${colorTipo}15;
            ">
                <div class="quick-stat-item" style="
                    padding: 20px;
                    text-align: center;
                    border-right: 1px solid #f0f0f0;
                ">
                    <div style="font-size: 28px; color: ${colorTipo}; margin-bottom: 5px;">
                        <i class="fas fa-bed"></i>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: #333; margin-bottom: 3px;">
                        ${vivienda.habitaciones}
                    </div>
                    <div style="font-size: 12px; color: #999; text-transform: uppercase;">
                        Habitación${vivienda.habitaciones != 1 ? 'es' : ''}
                    </div>
                </div>

                <div class="quick-stat-item" style="
                    padding: 20px;
                    text-align: center;
                    border-right: 1px solid #f0f0f0;
                ">
                    <div style="font-size: 28px; color: ${colorTipo}; margin-bottom: 5px;">
                        <i class="fas fa-ruler-combined"></i>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: #333; margin-bottom: 3px;">
                        ${vivienda.metros_cuadrados || '--'}
                    </div>
                    <div style="font-size: 12px; color: #999; text-transform: uppercase;">
                        Metros²
                    </div>
                </div>

                <div class="quick-stat-item" style="
                    padding: 20px;
                    text-align: center;
                    border-right: 1px solid #f0f0f0;
                ">
                    <div style="font-size: 28px; color: ${colorTipo}; margin-bottom: 5px;">
                        <i class="fas fa-users"></i>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: #333; margin-bottom: 3px;">
                        ${vivienda.habitaciones * 2}
                    </div>
                    <div style="font-size: 12px; color: #999; text-transform: uppercase;">
                        Capacidad
                    </div>
                </div>

                <div class="quick-stat-item" style="
                    padding: 20px;
                    text-align: center;
                ">
                    <div style="font-size: 28px; color: ${colorTipo}; margin-bottom: 5px;">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: #333; margin-bottom: 3px;">
                        ${tiempoAsignacion.split(' ')[0]}
                    </div>
                    <div style="font-size: 12px; color: #999; text-transform: uppercase;">
                        ${tiempoAsignacion.split(' ').slice(1).join(' ')}
                    </div>
                </div>
            </div>
        </div>

        <!-- ========== GRID DE INFORMACIÓN DETALLADA ========== -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
            
            <!-- Card 1: Información General -->
            <div class="info-card-premium" style="
                background: white;
                border-radius: 16px;
                padding: 25px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                border: 1px solid #f0f0f0;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.06)'">
                
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div style="
                        width: 50px;
                        height: 50px;
                        background: linear-gradient(135deg, #0064ff 0%, #21bdeb 100%);
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 24px;
                    ">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <h3 style="margin: 0; font-size: 18px; color: #333;">Información General</h3>
                </div>

                <div class="info-list" style="display: flex; flex-direction: column; gap: 15px;">
                    <div class="info-list-item" style="display: flex; align-items: start; gap: 12px;">
                        <i class="fas fa-hashtag" style="color: #0064ff; margin-top: 3px;"></i>
                        <div style="flex: 1;">
                            <div style="font-size: 12px; color: #999; margin-bottom: 3px;">Número de Vivienda</div>
                            <div style="font-weight: 600; color: #333;">${vivienda.numero_vivienda}</div>
                        </div>
                    </div>

                    <div class="info-list-item" style="display: flex; align-items: start; gap: 12px;">
                        <i class="fas fa-home" style="color: #0064ff; margin-top: 3px;"></i>
                        <div style="flex: 1;">
                            <div style="font-size: 12px; color: #999; margin-bottom: 3px;">Tipo de Vivienda</div>
                            <div style="font-weight: 600; color: #333;">${vivienda.tipo_nombre}</div>
                        </div>
                    </div>

                    <div class="info-list-item" style="display: flex; align-items: start; gap: 12px;">
                        <i class="fas fa-map-marker-alt" style="color: #0064ff; margin-top: 3px;"></i>
                        <div style="flex: 1;">
                            <div style="font-size: 12px; color: #999; margin-bottom: 3px;">Dirección</div>
                            <div style="font-weight: 600; color: #333;">${vivienda.direccion || 'No especificada'}</div>
                        </div>
                    </div>

                    <div class="info-list-item" style="display: flex; align-items: start; gap: 12px;">
                        <i class="fas fa-calendar-alt" style="color: #0064ff; margin-top: 3px;"></i>
                        <div style="flex: 1;">
                            <div style="font-size: 12px; color: #999; margin-bottom: 3px;">Fecha de Asignación</div>
                            <div style="font-weight: 600; color: #333;">${fechaAsignacion}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 2: Características -->
            <div class="info-card-premium" style="
                background: white;
                border-radius: 16px;
                padding: 25px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                border: 1px solid #f0f0f0;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.06)'">
                
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div style="
                        width: 50px;
                        height: 50px;
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 24px;
                    ">
                        <i class="fas fa-star"></i>
                    </div>
                    <h3 style="margin: 0; font-size: 18px; color: #333;">Características</h3>
                </div>

                <div class="caracteristicas-grid" style="display: grid; gap: 12px;">
                    <div class="caracteristica-item" style="
                        background: linear-gradient(135deg, #0064ff15 0%, #0064ff05 100%);
                        border: 1px solid #0064ff20;
                        border-radius: 10px;
                        padding: 15px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    ">
                        <div style="
                            width: 40px;
                            height: 40px;
                            background: white;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #0064ff;
                            font-size: 20px;
                        ">
                            <i class="fas fa-bed"></i>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: #999;" data-i18n="dashboardUser.housing.roomsTitle">Habitaciones</div>
                            <div style="font-weight: 700; color: #333; font-size: 16px;">${vivienda.habitaciones} <span data-i18n="dashboardUser.housing.roomMultiple"> Habitacion/es </span></div>
                        </div>
                    </div>

                    <div class="caracteristica-item" style="
                        background: linear-gradient(135deg, #f093fb15 0%, #f093fb05 100%);
                        border: 1px solid #f093fb20;
                        border-radius: 10px;
                        padding: 15px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    ">
                        <div style="
                            width: 40px;
                            height: 40px;
                            background: white;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #f093fb;
                            font-size: 20px;
                        ">
                            <i class="fas fa-ruler-combined"></i>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: #999;">Superficie</div>
                            <div style="font-weight: 700; color: #333; font-size: 16px;">${vivienda.metros_cuadrados || '--'} m²</div>
                        </div>
                    </div>

                    <div class="caracteristica-item" style="
                        background: linear-gradient(135deg, #4facfe15 0%, #4facfe05 100%);
                        border: 1px solid #4facfe20;
                        border-radius: 10px;
                        padding: 15px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    ">
                        <div style="
                            width: 40px;
                            height: 40px;
                            background: white;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #4facfe;
                            font-size: 20px;
                        ">
                            <i class="fas fa-users"></i>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: #999;" data-i18n="dashboardUser.housing.estimatedCapacity">Capacidad Estimada</div>
                            <div style="font-weight: 700; color: #333; font-size: 16px;">${vivienda.habitaciones * 2} <span data-i18n="dashboardUser.housing.persons">personas</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 3: Estado y Tiempo -->
            <div class="info-card-premium" style="
                background: white;
                border-radius: 16px;
                padding: 25px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                border: 1px solid #f0f0f0;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.06)'">
                
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div style="
                        width: 50px;
                        height: 50px;
                        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 24px;
                    ">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3 style="margin: 0; font-size: 18px; color: #333;" data-i18n="dashboardUser.housing.residenceTime">Tiempo de Residencia</h3>
                </div>

                <div style="text-align: center; padding: 20px 0;">
                    <div style="
                        font-size: 48px;
                        font-weight: 700;
                        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        margin-bottom: 10px;
                    ">
                        ${tiempoAsignacion}
                    </div>
                    <div style="font-size: 14px; color: #999; margin-bottom: 20px;" data-i18n="dashboardUser.housing.residenceSubtitle">
                        viviendo en esta vivienda
                    </div>
                    
                    <div style="
                        background: linear-gradient(135deg, #4facfe15 0%, #4facfe05 100%);
                        border: 1px solid #4facfe20;
                        border-radius: 10px;
                        padding: 15px;
                        margin-top: 20px;
                    ">
                        <div style="font-size: 12px; color: #999; margin-bottom: 5px;" data-i18n="dashboardUser.housing.assignmentDate">Fecha de asignación</div>
                        <div style="font-weight: 600; color: #333; font-size: 16px;">
                            <i class="fas fa-calendar-check" style="color: #4facfe; margin-right: 8px;"></i>
                            ${fechaAsignacion}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        ${vivienda.descripcion ? `
            <!-- ========== SECCIÓN DE DESCRIPCIÓN ========== -->
            <div class="descripcion-card" style="
                background: white;
                border-radius: 16px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                border: 1px solid #f0f0f0;
            ">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div style="
                        width: 50px;
                        height: 50px;
                        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 24px;
                    ">
                        <i class="fas fa-align-left"></i>
                    </div>
                    <h3 style="margin: 0; font-size: 18px; color: #333;" data-i18n="dashboardUser.housing.houseDescription">Descripción de la Vivienda</h3>
                </div>
                
                <p style="
                    color: #666;
                    line-height: 1.8;
                    font-size: 15px;
                    margin: 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border-left: 4px solid #43e97b;
                ">
                    ${vivienda.descripcion}
                </p>
            </div>
        ` : ''}

       
        <!-- ========== ESTILOS ADICIONALES ========== -->
        <style>
            @keyframes slideInDown {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .loading-vivienda {
                text-align: center;
                padding: 60px 20px;
            }

            .loading-spinner {
                font-size: 48px;
                color: #0064ff;
                margin-bottom: 20px;
            }

            .loading-spinner i {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .quick-stat-item:hover {
                background: linear-gradient(135deg, #0064ff05 0%, #21bdeb05 100%);
            }

            .info-card-premium {
                position: relative;
            }

            .info-card-premium::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #0064ff 0%, #21bdeb 100%);
                border-radius: 16px 16px 0 0;
            }
        </style>
    `;
    
    console.log(' Vivienda renderizada con diseño premium');
}

// ==========================================
// 🚫 RENDERIZAR SIN VIVIENDA (MEJORADO)
// ==========================================

/**
 * Renderizar mensaje cuando no hay vivienda asignada
 */
function renderSinVivienda(container) {
    console.log('⚠️ Renderizando mensaje de sin vivienda (diseño premium)');
    
    container.innerHTML = `
        <div class="sin-vivienda-container"
        <div class="sin-vivienda-container" style="
            max-width: 700px;
            margin: 60px auto;
            text-align: center;
            animation: fadeIn 0.5s ease-out;
        ">
            <!-- Ilustración -->
            <div style="
                width: 180px;
                height: 180px;
                margin: 0 auto 30px;
                background: linear-gradient(135deg, #0064ff15 0%, #21bdeb15 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px dashed #0064ff40;
                animation: pulse 2s ease-in-out infinite;
            ">
                <i class="fas fa-home" style="
                    font-size: 80px;
                    color: #0064ff;
                    opacity: 0.6;
                "></i>
            </div>

            <!-- Título -->
            <h2 style="
                font-size: 32px;
                color: #333;
                margin: 0 0 15px 0;
                font-weight: 700;
            " data-i18n="dashboardUser.housing.withoutHouse.title">
                Sin Vivienda Asignada
            </h2>

            <p style="
                font-size: 16px;
                color: #666;
                line-height: 1.6;
                margin: 0 0 40px 0;
            ">
                <span data-i18n="dashboardUser.housing.withoutHouse.description1">Actualmente no tienes una vivienda asignada en el sistema.</span><br>
                <span data-i18n="dashboardUser.housing.withoutHouse.description2">No te preocupes, puedes solicitar una siguiendo los pasos a continuación.</span>
            </p>

            <!-- Opciones de acción -->
            <div style="
                display: grid;
                gap: 20px;
                margin-bottom: 40px;
            ">
                <!-- Opción 1 -->
                <div class="opcion-card" style="
                    background: white;
                    border: 2px solid #e0e0e0;
                    border-radius: 16px;
                    padding: 30px;
                    text-align: left;
                    transition: all 0.3s ease;
                    cursor: pointer;
                " onclick="crearSolicitudVivienda()"
                   onmouseover="this.style.borderColor='#0064ff'; this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 24px rgba(102, 126, 234, 0.15)'"
                   onmouseout="this.style.borderColor='#e0e0e0'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    
                    <div style="display: flex; align-items: start; gap: 20px;">
                        <div style="
                            width: 60px;
                            height: 60px;
                            background: linear-gradient(135deg, #0064ff 0%, #21bdeb 100%);
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 28px;
                            flex-shrink: 0;
                        ">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 20px;" data-i18n="dashboardUser.housing.withoutHouse.request.title">
                                Solicitud Formal
                            </h3>
                            <p style="margin: 0 0 15px 0; color: #666; font-size: 14px; line-height: 1.6;" data-i18n="dashboardUser.housing.withoutHouse.request.description">
                                Envía una solicitud oficial desde el sistema. Será revisada por el equipo administrativo 
                                y recibirás una respuesta en los próximos días.
                            </p>
                            <div style="
                                display: inline-flex;
                                align-items: center;
                                gap: 8px;
                                color: #0064ff;
                                font-weight: 600;
                                font-size: 14px;
                            ">
                                <span data-i18n="dashboardUser.housing.withoutHouse.request.button">Crear Solicitud</span>
                                <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </div>
                </div>

                

            <!-- Información adicional -->
            <div style="
                background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%);
                border: 2px solid #ffc107;
                border-radius: 12px;
                padding: 20px;
                text-align: left;
            ">
                <div style="display: flex; align-items: start; gap: 15px;">
                    <i class="fas fa-lightbulb" style="
                        font-size: 24px;
                        color: #ff9800;
                        flex-shrink: 0;
                        margin-top: 2px;
                    "></i>
                    <div>
                        <strong style="color: #856404; font-size: 15px; display: block; margin-bottom: 8px;" data-i18n="dashboardUser.housing.withoutHouse.advice.title">
                            💡 Consejo
                        </strong>
                        <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;" data-i18n="dashboardUser.housing.withoutHouse.advice.description">
                            Al solicitar una vivienda, asegúrate de incluir información relevante como el número de integrantes 
                            de tu núcleo familiar y cualquier necesidad especial. Esto ayudará a asignarte la vivienda más adecuada.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <style>
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }
        </style>
    `;
    i18n.translatePage();
}

// ==========================================
// ⚠️ RENDERIZAR ERROR
// ==========================================

/**
 * Renderizar mensaje de error
 */
function renderError(container, mensaje) {
    console.error('❌ Renderizando error:', mensaje);
    
    container.innerHTML = `
        <div style="
            max-width: 600px;
            margin: 60px auto;
            text-align: center;
            animation: fadeIn 0.5s ease-out;
        ">
            <!-- Ícono de error -->
            <div style="
                width: 120px;
                height: 120px;
                margin: 0 auto 30px;
                background: linear-gradient(135deg, #f4433615 0%, #dc354515 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <i class="fas fa-exclamation-triangle" style="
                    font-size: 60px;
                    color: #f44336;
                "></i>
            </div>

            <!-- Mensaje -->
            <h3 style="
                font-size: 24px;
                color: #333;
                margin: 0 0 15px 0;
                font-weight: 600;
            ">
                Error al Cargar la Información
            </h3>

            <p style="
                font-size: 15px;
                color: #666;
                line-height: 1.6;
                margin: 0 0 30px 0;
            ">
                ${mensaje}
            </p>

            <!-- Botón de reintento -->
            <button class="btn btn-primary" onclick="loadMyVivienda()" style="
                background: linear-gradient(135deg, #0064ff 0%, #21bdeb 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                font-size: 15px;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.3)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                <i class="fas fa-sync-alt"></i> <span data-i18n="dashboardUser.housing.error.button">Reintentar</span>
            </button>
        </div>
    `;
}

// ==========================================
// 🔧 FUNCIONES AUXILIARES
// ==========================================

/**
 * Calcular tiempo desde la asignación
 */
function calcularTiempoAsignacion(fechaAsignacion) {
    if (!fechaAsignacion) return 'Fecha no disponible';
    
    const fecha = new Date(fechaAsignacion);
    const ahora = new Date();
    const diff = ahora - fecha;
    
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const meses = Math.floor(dias / 30);
    const años = Math.floor(meses / 12);
    
    if (años > 0) {
        return `${años} año${años !== 1 ? 's' : ''}`;
    } else if (meses > 0) {
        return `${meses} mes${meses !== 1 ? 'es' : ''}`;
    } else if (dias > 0) {
        return `${dias} día${dias !== 1 ? 's' : ''}`;
    } else {
        return 'Hoy';
    }
}

/**
 * Formatear fecha en formato uruguayo
 */
function formatearFechaUY(fecha) {
    if (!fecha) return 'No disponible';
    const f = new Date(fecha);
    return f.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Obtener color según tipo de vivienda
 */
function getColorTipoVivienda(tipo) {
    if (!tipo) return '#0064ff';
    
    const colores = {
        'casa': '#4caf50',
        'apartamento': '#2196f3',
        'duplex': '#ff9800',
        'dúplex': '#ff9800',
        'estudio': '#9c27b0',
        'monoambiente': '#e91e63',
        'ph': '#00bcd4',
        'loft': '#795548'
    };
    
    return colores[tipo.toLowerCase()] || '#0064ff';
}

// ==========================================
// 🎯 ACCIONES RÁPIDAS
// ==========================================

/**
 * Crear solicitud de vivienda
 */
function crearSolicitudVivienda() {
    console.log('📝 Abriendo modal para solicitar vivienda');
    
    // Verificar si existe la función del módulo de solicitudes
    if (typeof abrirModalNuevaSolicitud === 'function') {
        abrirModalNuevaSolicitud();
        
        // Pre-seleccionar tipo vivienda
        setTimeout(() => {
            const tipoSelect = document.getElementById('tipo-solicitud');
            const asuntoInput = document.getElementById('asunto-solicitud');
            const descripcionTextarea = document.getElementById('descripcion-solicitud');
            
            if (tipoSelect) {
                tipoSelect.value = 'vivienda';
            }
            if (asuntoInput) {
                asuntoInput.value = 'Solicitud de asignación de vivienda';
            }
            if (descripcionTextarea) {
                descripcionTextarea.value = 'Solicito la asignación de una vivienda. ';
                descripcionTextarea.focus();
                descripcionTextarea.setSelectionRange(descripcionTextarea.value.length, descripcionTextarea.value.length);
            }
        }, 100);
    } else {
        // Fallback: Navegar a solicitudes
        console.warn('⚠️ Módulo de solicitudes no cargado, navegando a sección');
        
        if (typeof navegarASeccion === 'function') {
            navegarASeccion('solicitudes');
            
            // Mostrar notificación
            setTimeout(() => {
                const notif = document.createElement('div');
                notif.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: linear-gradient(135deg, #0064ff 0%, #21bdeb 100%);
                        color: white;
                        padding: 15px 20px;
                        border-radius: 10px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                        z-index: 10000;
                        animation: slideIn 0.3s ease-out;
                    ">
                        <i class="fas fa-info-circle"></i> 
                        Haz clic en "Nueva Solicitud" para solicitar tu vivienda
                    </div>
                `;
                document.body.appendChild(notif);
                setTimeout(() => notif.remove(), 5000);
            }, 500);
        } else {
            alert(' Por favor, ve a la sección de "Solicitudes" para enviar tu solicitud de vivienda.');
        }
    }
}

/**
 * Contactar con el administrador
 */
function contactarAdministrador() {
    console.log('📧 Contactando con administrador');
    
    const modal = `
        <div class="modal-detail" onclick="if(event.target.classList.contains('modal-detail')) this.remove()">
            <div class="modal-detail-content" style="max-width: 650px; animation: slideInUp 0.3s ease-out;">
                <button onclick="this.closest('.modal-detail').remove()" class="modal-close-button">×</button>
                
                <h2 class="modal-detail-header" style="
                    background: linear-gradient(135deg, #0064ff 0%, #21bdeb 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                ">
                    <i class="fas fa-envelope"></i> <span data-i18n="dashboardUser.housing.contactAdmin.title">Contactar Administrador</span>
                </h2>

                <div class="modal-detail-section">
                    <p style="color: #666; line-height: 1.6;" data-i18n="dashboardUser.housing.contactAdmin.description">
                        Para solicitar una vivienda o consultar sobre el proceso de asignación, puedes utilizar cualquiera de estas opciones:
                    </p>
                </div>

                <!-- Opción 1: Solicitud Formal -->
                <div style="
                    background: linear-gradient(135deg, #0064ff10 0%, #21bdeb10 100%);
                    border: 2px solid #0064ff30;
                    border-radius: 12px;
                    padding: 25px;
                    margin-bottom: 20px;
                ">
                    <div style="display: flex; align-items: start; gap: 15px;">
                        <div style="
                            width: 50px;
                            height: 50px;
                            background: linear-gradient(135deg, #0064ff 0%, #21bdeb 100%);
                            border-radius: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 24px;
                            flex-shrink: 0;
                        ">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;" data-i18n="dashboardUser.housing.contactAdmin.option1.title">
                                 Opción 1: Solicitud Formal
                            </h4>
                            <p style="margin: 0 0 15px 0; color: #666; font-size: 14px; line-height: 1.6;" dashboardUser.housing.contactAdmin.option1.description>
                                Envía una solicitud desde la sección de "Solicitudes" del sistema. 
                                Será revisada y procesada por el equipo administrativo.
                            </p>
                            <button class="btn btn-primary" onclick="crearSolicitudVivienda()" style="
                                background: linear-gradient(135deg, #0064ff 0%, #21bdeb 100%);
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 8px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s;
                            " onmouseover="this.style.transform='translateY(-2px)'"
                                onmouseout="this.style.transform='translateY(0)'">
                                <i class="fas fa-paper-plane"></i> <span data-i18n="dashboardUser.housing.contactAdmin.option1.button">Crear Solicitud</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Opción 2: Contacto Directo -->
                <div style="
                    background: linear-gradient(135deg, #4facfe10 0%, #00f2fe10 100%);
                    border: 2px solid #4facfe30;
                    border-radius: 12px;
                    padding: 25px;
                ">
                    <div style="display: flex; align-items: start; gap: 15px;">
                        <div style="
                            width: 50px;
                            height: 50px;
                            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                            border-radius: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 24px;
                            flex-shrink: 0;
                        ">
                            <i class="fas fa-phone"></i>
                        </div>
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;" data-i18n="dashboardUser.housing.contactAdmin.option2.title">
                                📞 Opción 2: Contacto Directo
                            </h4>
                            <p style="margin: 0 0 15px 0; color: #666; font-size: 14px; line-height: 1.6;" data-i18n="dashboardUser.housing.contactAdmin.option2.description">
                                También puedes contactar directamente con la administración:
                            </p>
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                <div style="
                                    background: white;
                                    padding: 12px 15px;
                                    border-radius: 8px;
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                ">
                                    <i class="fas fa-envelope" style="color: #4facfe; font-size: 18px;"></i>
                                    <div>
                                        <div style="font-size: 11px; color: #999; margin-bottom: 2px;">Email</div>
                                        <strong style="color: #333; font-size: 14px;">administracion@cooperativa.com</strong>
                                    </div>
                                </div>
                                
                                <div style="
                                    background: white;
                                    padding: 12px 15px;
                                    border-radius: 8px;
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                ">
                                    <i class="fas fa-phone" style="color: #4facfe; font-size: 18px;"></i>
                                    <div>
                                        <div style="font-size: 11px; color: #999; margin-bottom: 2px;" data-i18n="dashboardUser.housing.contactAdmin.option2.phone">Teléfono</div>
                                        <strong style="color: #333; font-size: 14px;">(598) 2XXX-XXXX</strong>
                                    </div>
                                </div>
                                
                                <div style="
                                    background: white;
                                    padding: 12px 15px;
                                    border-radius: 8px;
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                ">
                                    <i class="fas fa-clock" style="color: #4facfe; font-size: 18px;"></i>
                                    <div>
                                        <div style="font-size: 11px; color: #999; margin-bottom: 2px;" data-i18n="dashboardUser.housing.contactAdmin.option2.schedule">Horario</div>
                                        <strong style="color: #333; font-size: 14px;">Lunes a Viernes, 9:00 - 17:00</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-detail-footer" style="margin-top: 30px;">
                    <button onclick="this.closest('.modal-detail').remove()" class="btn btn-secondary" data-i18n="dashboardUser.housing.contactAdmin.close">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>

        <style>
            @keyframes slideInUp {
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
    
    document.body.insertAdjacentHTML('beforeend', modal);
    i18n.translatePage(); 
}

// ==========================================
// 🔄 EXPORTAR FUNCIONES GLOBALES
// ==========================================

window.loadMyVivienda = loadMyVivienda;
window.renderMyVivienda = renderMyVivienda;
window.renderSinVivienda = renderSinVivienda;
window.renderError = renderError;
window.crearSolicitudVivienda = crearSolicitudVivienda;
window.contactarAdministrador = contactarAdministrador;

// Exportar funciones auxiliares
window.calcularTiempoAsignacion = calcularTiempoAsignacion;
window.formatearFechaUY = formatearFechaUY;
window.getColorTipoVivienda = getColorTipoVivienda;

console.log(' Módulo de vivienda cargado completamente (Diseño Premium)');
console.log(' Funciones exportadas:', {
    loadMyVivienda: typeof window.loadMyVivienda,
    renderMyVivienda: typeof window.renderMyVivienda,
    crearSolicitudVivienda: typeof window.crearSolicitudVivienda,
    contactarAdministrador: typeof window.contactarAdministrador
});