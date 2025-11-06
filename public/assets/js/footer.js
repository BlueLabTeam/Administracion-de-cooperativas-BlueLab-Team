
(function () {
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
    setTimeout(function () {
      footer.classList.add('footer-loaded');
    }, 100);

    // Event listeners
    setupMobileEvents();
    setupSocialEvents();

    // Detectar cambio de orientación y resize
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);
  }

  
  function setupMobileEvents() {
    // Toggle con botón
    footerToggle.addEventListener('click', toggleFooter);

    // Gestos táctiles
    footer.addEventListener('touchstart', handleTouchStart, { passive: false });
    footer.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Tap largo para expandir
    let tapTimer = null;
    footer.addEventListener('touchstart', function (e) {
      tapTimer = setTimeout(function () {
        if (!isExpanded && window.innerWidth <= 768) {
          expandFooter();
          if (navigator.vibrate) navigator.vibrate(50);
        }
      }, 500);
    });

    footer.addEventListener('touchend', function () {
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

    socialLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.stopPropagation();

        const social = this.getAttribute('data-social');
        animateClick(this);

        setTimeout(function () {
          ('Abriendo ' + social + '...');
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

    setTimeout(function () {
      element.style.transform = 'scale(1)';
      element.style.backgroundColor = '';
      element.style.color = '';
    }, 150);
  }

  // Manejar cambios de orientación y resize
  function handleOrientationChange() {
    setTimeout(function () {
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

})(); 
