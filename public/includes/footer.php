<footer class="footer-cooperativa" id="footer">
  <ul class="footer-list">
    <li class="footer-section">
      <h2 class="footer-title">Contacto</h2>
      <p class="footer-text">📍 Av. Principal 1234, Montevideo</p>
      <p class="footer-text">📞 094654987</p>
      <p class="footer-text">✉️ cooperativa@gmail.com</p>
    </li>
    <li class="footer-section">
      <h2 class="footer-title">Horarios</h2>
      <p class="footer-text">Lunes a Viernes: 9:00 - 18:00</p>
      <p class="footer-text">Sábados: 9:00 - 13:00</p>
      <p class="footer-text">Domingos: Cerrados</p>
    </li>
    <li class="footer-section">
      <h2 class="footer-title">Síguenos</h2>
      <p class="footer-social" data-social="instagram">📱 Instagram</p>
      <p class="footer-social" data-social="facebook">📘 Facebook</p>
      <p class="footer-social" data-social="whatsapp">💬 Whatsapp</p>
    </li>
  </ul>
  
  <!-- Botón para toggle en móvil -->
  <div class="footer-mobile-toggle" id="footerToggle">
    <span>ⓘ</span>
  </div>
</footer>

<style>
  /* Estilos específicos del footer para evitar conflictos */
  .footer-cooperativa {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    font-size: 0.9rem !important;
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    margin-top: auto !important;
    padding: 20px 0 !important;
    position: relative !important;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.1) !important;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-sizing: border-box !important;
  }

  .footer-list {
    list-style: none !important;
    display: flex !important;
    justify-content: space-between !important;
    width: 80% !important;
    max-width: 1000px !important;
    padding: 0 !important;
    margin: 0 !important;
    transition: all 0.4s ease !important;
    box-sizing: border-box !important;
  }

  .footer-section {
    text-align: center !important;
    flex: 1 !important;
    padding: 15px !important;
    border-radius: 8px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-sizing: border-box !important;
  }

  .footer-section:hover {
    background-color: rgba(52, 152, 219, 0.05) !important;
    transform: translateY(-3px) !important;
  }

  .footer-title {
    font-size: 1.2rem !important;
    margin-bottom: 10px !important;
    font-weight: bold !important;
    color: #3498db !important;
    margin-top: 0 !important;
  }

  .footer-text {
    margin: 5px 0 !important;
    transition: all 0.2s ease !important;
    color: #2c3e50 !important;
  }

  .footer-social {
    cursor: pointer !important;
    padding: 5px 10px !important;
    border-radius: 15px !important;
    transition: all 0.2s ease !important;
    margin: 5px 0 !important;
    color: #2c3e50 !important;
    display: inline-block !important;
  }

  .footer-social:hover {
    background-color: #3498db !important;
    color: white !important;
    transform: scale(1.05) !important;
  }

  .footer-mobile-toggle {
    display: none !important;
    position: absolute !important;
    top: -15px !important;
    right: 20px !important;
    width: 30px !important;
    height: 30px !important;
    background-color: #3498db !important;
    border-radius: 50% !important;
    color: white !important;
    justify-content: center !important;
    align-items: center !important;
    cursor: pointer !important;
    font-size: 16px !important;
    z-index: 10 !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
    box-sizing: border-box !important;
  }

  .footer-mobile-toggle:hover {
    background-color: #2980b9 !important;
    transform: scale(1.1) !important;
  }

  /* Animaciones móviles */
  @media (max-width: 768px) {
    .footer-mobile-toggle {
      display: flex !important;
    }

    .footer-cooperativa {
      overflow: hidden !important;
      transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
      max-height: 60px !important;
    }

    .footer-cooperativa.footer-expanded {
      max-height: 400px !important;
      padding: 30px 0 !important;
    }

    .footer-list {
      flex-direction: column !important;
      opacity: 0 !important;
      transform: translateY(20px) !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      gap: 15px !important;
    }

    .footer-cooperativa.footer-expanded .footer-list {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }

    .footer-section {
      margin-bottom: 15px !important;
      transform: translateX(-20px) !important;
      opacity: 0 !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .footer-cooperativa.footer-expanded .footer-section {
      transform: translateX(0) !important;
      opacity: 1 !important;
    }

    /* Retraso escalonado para animación */
    .footer-cooperativa.footer-expanded .footer-section:nth-child(1) {
      transition-delay: 0.1s !important;
    }

    .footer-cooperativa.footer-expanded .footer-section:nth-child(2) {
      transition-delay: 0.2s !important;
    }

    .footer-cooperativa.footer-expanded .footer-section:nth-child(3) {
      transition-delay: 0.3s !important;
    }

    .footer-mobile-toggle span {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .footer-cooperativa.footer-expanded .footer-mobile-toggle span {
      transform: rotate(180deg) !important;
    }
  }

  /* Animación de entrada inicial */
  @keyframes footer-slideInUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .footer-cooperativa.footer-loaded {
    animation: footer-slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  /* Efecto de ondas en mobile */
  @media (max-width: 768px) {
    .footer-cooperativa.footer-expanded::before {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 0 !important;
      height: 2px !important;
      background: linear-gradient(90deg, transparent, #3498db, transparent) !important;
      animation: footer-expandWave 0.5s ease-out forwards !important;
    }
  }

  @keyframes footer-expandWave {
    to {
      width: 100%;
    }
  }
</style>

<script>
// Footer JavaScript - Namespace para evitar conflictos
(function() {
  'use strict';
  
  // Variables locales
  let footer = null;
  let footerToggle = null;
  let isExpanded = false;
  let touchStartY = 0;
  let touchEndY = 0;

  // Inicialización cuando el DOM esté listo
  function initFooter() {
    footer = document.getElementById('footer');
    footerToggle = document.getElementById('footerToggle');
    
    if (!footer || !footerToggle) return;
    
    // Animación de entrada inicial
    setTimeout(function() {
      footer.classList.add('footer-loaded');
    }, 100);
    
    // Event listeners
    setupMobileEvents();
    setupSocialEvents();
    
    // Detectar cambio de orientación y resize
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);
  }

  // Configurar eventos para móvil
  function setupMobileEvents() {
    // Toggle con botón
    footerToggle.addEventListener('click', toggleFooter);
    
    // Gestos táctiles
    footer.addEventListener('touchstart', handleTouchStart, { passive: false });
    footer.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Tap largo para expandir
    let tapTimer = null;
    footer.addEventListener('touchstart', function(e) {
      tapTimer = setTimeout(function() {
        if (!isExpanded && window.innerWidth <= 768) {
          expandFooter();
          if (navigator.vibrate) navigator.vibrate(50);
        }
      }, 500);
    });
    
    footer.addEventListener('touchend', function() {
      if (tapTimer) clearTimeout(tapTimer);
    });
  }

  // Manejar touch events
  function handleTouchStart(e) {
    if (window.innerWidth > 768) return;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
  }

  function handleTouchEnd(e) {
    if (window.innerWidth > 768) return;
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
    e.preventDefault();
  }

  // Detectar deslizamiento
  function handleSwipe() {
    const swipeThreshold = 30;
    const swipeDistance = touchStartY - touchEndY;
    
    if (swipeDistance > swipeThreshold && !isExpanded) {
      expandFooter();
    } else if (swipeDistance < -swipeThreshold && isExpanded) {
      collapseFooter();
    }
  }

  // Toggle del footer
  function toggleFooter() {
    if (isExpanded) {
      collapseFooter();
    } else {
      expandFooter();
    }
  }

  // Expandir footer
  function expandFooter() {
    footer.classList.add('footer-expanded');
    isExpanded = true;
    footerToggle.style.transform = 'rotate(180deg)';
  }

  // Colapsar footer
  function collapseFooter() {
    footer.classList.remove('footer-expanded');
    isExpanded = false;
    footerToggle.style.transform = 'rotate(0deg)';
  }

  // Configurar eventos de redes sociales
  function setupSocialEvents() {
    const socialLinks = document.querySelectorAll('.footer-social');
    
    socialLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const social = this.getAttribute('data-social');
        animateClick(this);
        
        setTimeout(function() {
          console.log('Abriendo ' + social + '...');
          // Aquí van los enlaces reales
        }, 200);
      });
    });
  }

  // Animación de clic
  function animateClick(element) {
    element.style.transform = 'scale(0.95)';
    element.style.backgroundColor = '#3498db';
    element.style.color = 'white';
    
    setTimeout(function() {
      element.style.transform = 'scale(1)';
      element.style.backgroundColor = '';
      element.style.color = '';
    }, 150);
  }

  // Manejar cambios de orientación y resize
  function handleOrientationChange() {
    setTimeout(function() {
      if (window.innerWidth > 768 && isExpanded) {
        collapseFooter();
      }
    }, 100);
  }

  function handleResize() {
    if (window.innerWidth > 768 && isExpanded) {
      collapseFooter();
    }
  }

  // Cerrar footer al tocar fuera (solo móvil)
  function handleOutsideTouch(e) {
    if (window.innerWidth <= 768 && isExpanded && !footer.contains(e.target)) {
      collapseFooter();
    }
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    initFooter();
  }
  
  // Event listener para tocar fuera
  document.addEventListener('touchstart', handleOutsideTouch);

})(); // IIFE para evitar variables globales
</script>