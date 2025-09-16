<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gestcoop</title>
  <link rel="stylesheet" href="/assets/css/styles.css" />
  <link rel="stylesheet" href="/assets/css/home.css" />
</head>

<body>
  <?php include __DIR__ . '/includes/header.html'; ?>
  <main>
    <div class="bienvenida fade-in">
      <h1>Bienvenido a Conviconsu</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Odit aliquid
        eum possimus saepe, soluta eos ea officia consequuntur deserunt
        corrupti vitae reprehenderit veniam dolor quas dolores, sit vero
        voluptatum cum.
      </p>
      <a href="/register">
        <button class="bienvenida__button button--primary" id="solicitar-btn">
          Solicitar ingreso
        </button>
      </a>
      <button class="bienvenida__button button--secondary" id="info-btn">
        Más información
      </button>
    </div>
    
    <div class="servicios fade-in">
      <h2>Nuestros Servicios</h2>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
        voluptatum.
      </p>
      <ul>
        <li onclick="toggleServicio(0)">
          <h3>Consultoría Especializada</h3>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            Perspiciatis aliquid, non consequatur fugiat nisi odit excepturi
            dolor necessitatibus odio, ab, porro numquam.
          </p>
          <div class="servicio-detalle">
            <h4>Detalles del servicio:</h4>
            <ul>
              <li>Asesoramiento personalizado</li>
              <li>Análisis de viabilidad</li>
              <li>Documentación completa</li>
              <li>Seguimiento post-consulta</li>
            </ul>
          </div>
        </li>
        <li onclick="toggleServicio(1)">
          <h3>Gestión de Trámites</h3>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            Perspiciatis aliquid, non consequatur fugiat nisi odit excepturi
            dolor necessitatibus odio, ab, porro numquam.
          </p>
          <div class="servicio-detalle">
            <h4>Incluye:</h4>
            <ul>
              <li>Tramitación de permisos</li>
              <li>Gestión documental</li>
              <li>Coordinación con entidades</li>
              <li>Seguimiento en tiempo real</li>
            </ul>
          </div>
        </li>
        <li onclick="toggleServicio(2)">
          <h3>Asesoría Financiera</h3>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            Perspiciatis aliquid, non consequatur fugiat nisi odit excepturi
            dolor necessitatibus odio, ab, porro numquam.
          </p>
          <div class="servicio-detalle">
            <h4>Servicios financieros:</h4>
            <ul>
              <li>Evaluación de créditos</li>
              <li>Planificación financiera</li>
              <li>Opciones de financiamiento</li>
              <li>Negociación con bancos</li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
    
    <div class="incorporacion fade-in">
      <h2>Proceso de incorporación</h2>
      <p>Para unirte a nuestro equipo, sigue estos pasos:</p>
      <ol>
        <li onclick="togglePaso(0)">
          <div class="numero">1</div>
          <h3>Solicitud inicial</h3>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic
            veritatis, repellendus possimus delectus accusamus ad nam eius id
            aliquam eos, quam itaque explicabo, voluptatibus pariatur iusto
            voluptatum animi deleniti quis.
          </p>
        </li>
        <li onclick="togglePaso(1)">
          <div class="numero">2</div>
          <h3>Evaluación de documentos</h3>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic
            veritatis, repellendus possimus delectus accusamus ad nam eius id
            aliquam eos, quam itaque explicabo, voluptatibus pariatur iusto
            voluptatum animi deleniti quis.
          </p>
        </li>
        <li onclick="togglePaso(2)">
          <div class="numero">3</div>
          <h3>Entrevista personal</h3>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic
            veritatis, repellendus possimus delectus accusamus ad nam eius id
            aliquam eos, quam itaque explicabo, voluptatibus pariatur iusto
            voluptatum animi deleniti quis.
          </p>
        </li>
        <li onclick="togglePaso(3)">
          <div class="numero">4</div>
          <h3>Aprobación final</h3>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic
            veritatis, repellendus possimus delectus accusamus ad nam eius id
            aliquam eos, quam itaque explicabo, voluptatibus pariatur iusto
            voluptatum animi deleniti quis.
          </p>
        </li>
      </ol>
    </div>
    
    <div class="preguntas fade-in">
      <h2>Preguntas Frecuentes</h2>
      <ul>
        <li onclick="togglePregunta(0)">
          ¿Cómo puedo solicitar un servicio?
          <div class="pregunta-respuesta">
            Puedes solicitar nuestros servicios a través del botón "Solicitar ingreso" o contactándonos directamente por teléfono. Nuestro equipo te guiará en todo el proceso.
          </div>
        </li>
        <li onclick="togglePregunta(1)">
          ¿Cuáles son los métodos de pago aceptados?
          <div class="pregunta-respuesta">
            Aceptamos transferencias bancarias, pagos en efectivo, tarjetas de crédito y débito. También ofrecemos planes de pago flexibles según tus necesidades.
          </div>
        </li>
        <li onclick="togglePregunta(2)">
          ¿Ofrecen soporte después de la consultoría?
          <div class="pregunta-respuesta">
            Sí, brindamos soporte continuo durante 6 meses después de completar la consultoría. Esto incluye consultas telefónicas y seguimiento de tu progreso.
          </div>
        </li>
        <li onclick="togglePregunta(3)">
          ¿Puedo cancelar mi solicitud?
          <div class="pregunta-respuesta">
            Puedes cancelar tu solicitud en cualquier momento antes de la firma del contrato. Si ya iniciamos el trabajo, aplicarán las condiciones establecidas en el contrato.
          </div>
        </li>
      </ul>
    </div>
    
    <div class="motivacion fade-in">
      <h2 class="motivacion__titulo">
        ¡Comienza tu camino hacia la vivienda propia!
      </h2>
      <p>
        Contáctanos para más información sobre nuestros servicios de
        consultoría.
      </p>
      <a href="/register">
        <button class="motivacion__button" id="final-solicitar-btn">
          Solicitar ingreso
        </button>
      </a>
    </div>
  </main>
  <?php include __DIR__ . '/includes/footer.html'; ?>

  <script>
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

    // Función para alternar pasos de incorporación
    function togglePaso(index) {
      const pasos = document.querySelectorAll('.incorporacion ol li');
      
      // Marcar el paso como completado
      pasos[index].classList.toggle('completed');
      
      // Efecto de celebración si se completa un paso
      if (pasos[index].classList.contains('completed')) {
        confetti(pasos[index]);
      }
    }

    // Función para crear efecto confetti simple
    function confetti(element) {
      for (let i = 0; i < 10; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.style.cssText = `
          position: absolute;
          width: 6px;
          height: 6px;
          background: ${['#007bff', '#28a745', '#ffc107', '#dc3545'][Math.floor(Math.random() * 4)]};
          top: ${element.offsetTop + 20}px;
          left: ${element.offsetLeft + Math.random() * element.offsetWidth}px;
          pointer-events: none;
          animation: confettiFall 1s ease-out forwards;
          z-index: 1000;
        `;
        
        element.parentElement.appendChild(confettiPiece);
        
        setTimeout(() => {
          confettiPiece.remove();
        }, 1000);
      }
    }

    // Agregar animación CSS para el confetti
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

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
        button.addEventListener('click', function(e) {
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

    // Contador de progreso para incorporación
    let pasosCompletados = 0;
    const totalPasos = 4;

    const actualizarProgreso = () => {
      pasosCompletados = document.querySelectorAll('.incorporacion ol li.completed').length;
      
      if (pasosCompletados === totalPasos) {
        const incorporacionSection = document.querySelector('.incorporacion');
        incorporacionSection.style.background = 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)';
        incorporacionSection.style.border = '2px solid #28a745';
        incorporacionSection.style.borderRadius = '15px';
        incorporacionSection.style.padding = '20px';
      }
    };

    // Modificar la función togglePaso para actualizar progreso
    const originalTogglePaso = togglePaso;
    togglePaso = function(index) {
      originalTogglePaso(index);
      setTimeout(actualizarProgreso, 100);
    };
  </script>
</body>

</html>
