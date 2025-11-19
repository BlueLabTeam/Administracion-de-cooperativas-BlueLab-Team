
(function() {
  'use strict';

  // Estado del idioma actual
  let currentLang = 'es';
  let isInitialized = false;
  
  // Detectar idioma del navegador
  function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0]; // 'es-UY' -> 'es'
    
    // Verificar idiomas disponibles
    if (langCode === 'en' || langCode === 'pt') {
      return langCode;
    }
    return 'es'; // Por defecto español
  }

  // Inicializar idioma
  function initLanguage() {
    // Intentar obtener idioma guardado
    const savedLang = localStorage.getItem('selectedLanguage');
    
    if (savedLang && (savedLang === 'es' || savedLang === 'en' || savedLang === 'pt')) {
      currentLang = savedLang;
    } else {
      // Detectar idioma del navegador
      currentLang = detectBrowserLanguage();
      localStorage.setItem('selectedLanguage', currentLang);
    }
    
    return currentLang;
  }

  // Obtener texto traducido usando notación de punto
  function t(key) {
    if (typeof translations === 'undefined') {
      console.error('Translations object not found. Make sure translations.js is loaded first.');
      return key;
    }

    const keys = key.split('.');
    let value = translations[currentLang];
    
    for (let i = 0; i < keys.length; i++) {
      if (value && typeof value === 'object') {
        value = value[keys[i]];
      } else {
        console.warn('Translation key not found:', key);
        return key;
      }
    }
    
    return value || key;
  }

  // Cambiar idioma
  function setLanguage(lang) {
    if (lang !== 'es' && lang !== 'en' && lang !== 'pt') {
      console.error('Invalid language:', lang);
      return;
    }
    
    currentLang = lang;
    localStorage.setItem('selectedLanguage', lang);
    
    // Actualizar elementos con data-i18n
    translatePage();
    
    // Actualizar botón de idioma
    updateLanguageButton();
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  }

  // Obtener idioma actual
  function getLanguage() {
    return currentLang;
  }

  // Traducir toda la página
  function translatePage() {
    // Traducir elementos con atributo data-i18n (texto normal)
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = t(key);
      
      if (Array.isArray(translation)) {
        // Si es un array (para listas), no aplicar directamente
        console.warn('Array translation for:', key);
      } else if (translation && translation !== key) {
       
       
        if (!element.hasAttribute('data-i18n-placeholder')) {
          element.textContent = translation;
        }
      }
    });

    // Traducir placeholders 
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = t(key);
      if (translation && translation !== key) {
        element.placeholder = translation;
      }
    });

    // Traducir valores de inputs (como botones submit)
    document.querySelectorAll('[data-i18n-value]').forEach(element => {
      const key = element.getAttribute('data-i18n-value');
      const translation = t(key);
      if (translation && translation !== key) {
        element.value = translation;
      }
    });

    // Traducir títulos (title attribute)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = t(key);
      if (translation && translation !== key) {
        element.title = translation;
      }
    });
    
    console.log(' Página traducida a:', currentLang);
  }

  // Actualizar el botón de idioma
  function updateLanguageButton() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Crear botón de cambio de idioma
  function createLanguageToggle() {
    const existingToggle = document.getElementById('language-toggle');
    if (existingToggle) {
      // Si ya existe, solo actualizar
      updateLanguageButton();
      return;
    }

    const toggle = document.createElement('div');
    toggle.id = 'language-toggle';
    toggle.className = 'language-toggle';
    toggle.innerHTML = `
      <button class="lang-btn" data-lang="es">ES</button>
      <span class="lang-separator">|</span>
      <button class="lang-btn" data-lang="en">EN</button>
    `;

   
    const userControls = document.querySelector('.user-controls');
    if (userControls) {
     
      userControls.insertBefore(toggle, userControls.firstChild);
    } 

    else {
      const header = document.querySelector('header');
      if (header) {
        header.appendChild(toggle);
      }
    }

    // Event listeners para los botones
    toggle.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const lang = this.getAttribute('data-lang');
        console.log('🌐 Cambiando idioma a:', lang);
        setLanguage(lang);
      });
    });

    // Marcar idioma activo
    updateLanguageButton();
  }

  // Traducir listas dinámicamente (para servicios, FAQ, etc.)
  function translateList(containerSelector, translationKey) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const items = t(translationKey);
    if (!Array.isArray(items)) return;

    const listItems = container.querySelectorAll('li');
    items.forEach((item, index) => {
      if (listItems[index]) {
        // Para FAQ
        if (item.question && item.answer) {
          const questionElement = listItems[index].querySelector('h3, .question');
          const answerElement = listItems[index].querySelector('.pregunta-respuesta, .answer');
          
          if (questionElement) questionElement.textContent = item.question;
          if (answerElement) answerElement.textContent = item.answer;
        }
        // Para servicios con detalles
        else if (item.title && item.description) {
          const titleElement = listItems[index].querySelector('h3');
          const descElement = listItems[index].querySelector('p:first-of-type');
          
          if (titleElement) titleElement.textContent = item.title;
          if (descElement) descElement.textContent = item.description;
          
          // Traducir detalles si existen
          if (item.details && Array.isArray(item.details)) {
            const detailsList = listItems[index].querySelectorAll('.servicio-detalle ul li');
            item.details.forEach((detail, i) => {
              if (detailsList[i]) detailsList[i].textContent = detail;
            });
          }
        }
        // Para pasos simples
        else if (typeof item === 'string') {
          listItems[index].textContent = item;
        }
      }
    });
  }

  // Inicializar cuando el DOM esté listo
  function init() {
    if (isInitialized) {
      console.log('⚠️  i18n ya está inicializado');
      return;
    }
    
    console.log(' Inicializando i18n...');
    
    // Verificar que translations esté disponible
    if (typeof translations === 'undefined') {
      console.error(' translations.js no está cargado. Reintentando en 100ms...');
      setTimeout(init, 100);
      return;
    }
    
    // Inicializar idioma
    initLanguage();
    
    // Crear botón de idioma
    createLanguageToggle();
    
    // Traducir página inicial
    translatePage();
    
    isInitialized = true;
    console.log(' i18n inicializado correctamente en idioma:', currentLang);
    
    // Disparar evento de inicialización
    window.dispatchEvent(new CustomEvent('i18nReady', { detail: { language: currentLang } }));
  }

  // Exportar funciones globalmente
  window.i18n = {
    t: t,
    setLanguage: setLanguage,
    getLanguage: getLanguage,
    translatePage: translatePage,
    translateList: translateList,
    init: init,
    isInitialized: function() { return isInitialized; }
  };

  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM ya está listo, inicializar inmediatamente
    init();
  }

})();