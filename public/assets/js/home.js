
    // Función para alternar preguntas
    function togglePregunta(index) {
      const preguntas = document.querySelectorAll('.preguntas ul li');
      const respuestas = document.querySelectorAll('.pregunta-respuesta');

      // Cerrar todas las otras respuestas
      respuestas.forEach((respuesta, i) => {
        if (i !== index) {
          respuesta.classList.remove('active');
          preguntas[i].classList.remove('active');
        }
      });

      // Alternar la respuesta actual
      respuestas[index].classList.toggle('active');
      preguntas[index].classList.toggle('active');
    }

    // Animaciones de scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = Math.random() * 0.3 + 's';
          entry.target.classList.add('fade-in');
        }
      });
    }, observerOptions);

    // Observar elementos para animación
    document.addEventListener('DOMContentLoaded', () => {
      const elements = document.querySelectorAll('.bienvenida, .servicios, .incorporacion, .preguntas, .motivacion');
      elements.forEach(el => {
        observer.observe(el);
      });
    });

    // Efectos de botones
    document.addEventListener('DOMContentLoaded', () => {
      const buttons = document.querySelectorAll('button');

      buttons.forEach(button => {
        button.addEventListener('click', function (e) {
          // Efecto ripple
          const ripple = document.createElement('span');
          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
          `;

          this.style.position = 'relative';
          this.style.overflow = 'hidden';
          this.appendChild(ripple);

          setTimeout(() => {
            ripple.remove();
          }, 600);
        });
      });

      // Añadir animación ripple
      const rippleStyle = document.createElement('style');
      rippleStyle.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(rippleStyle);
    });

    // Efecto de typing para el título principal
    document.addEventListener('DOMContentLoaded', () => {
      const titulo = document.querySelector('.bienvenida h1');
      const textoOriginal = titulo.textContent;
      titulo.textContent = '';

      let i = 0;
      const typeWriter = () => {
        if (i < textoOriginal.length) {
          titulo.textContent += textoOriginal.charAt(i);
          i++;
          setTimeout(typeWriter, 100);
        }
      };

      setTimeout(typeWriter, 500);
    });
