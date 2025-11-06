<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gestcoop</title>
  <link rel="stylesheet" href="/assets/css/styles.css" />
  <link rel="stylesheet" href="/assets/css/home.css" />
  <link rel="stylesheet" href="/assets/css/i18n.css" />
</head>

<body>
  <?php include __DIR__ . '/includes/header.html'; ?>
  <main>
    <div class="bienvenida fade-in">
      <h1 data-i18n="home.welcome.title">Bienvenido a Conviconsu</h1>
      <p data-i18n="home.welcome.description">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Odit aliquid
        eum possimus saepe, soluta eos ea officia consequuntur deserunt
        corrupti vitae reprehenderit veniam dolor quas dolores, sit vero
        voluptatum cum.
      </p>
      <a href="/register">
        <button class="bienvenida__button button--primary" id="solicitar-btn" data-i18n="home.welcome.requestButton">
          Solicitar ingreso
        </button>
      </a>
      <button class="bienvenida__button button--secondary" id="info-btn" data-i18n="home.welcome.infoButton">
        Más información
      </button>
    </div>

    <div class="servicios fade-in">
      <h2 data-i18n="home.services.title">Nuestros Servicios</h2>
      <p data-i18n="home.services.subtitle">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
        voluptatum.
      </p>
      <ul>
        <li onclick="toggleServicio(0)">
          <h3 data-i18n="home.services.consulting.title">Consultoría Especializada</h3>
          <p data-i18n="home.services.consulting.description">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            Perspiciatis aliquid, non consequatur fugiat nisi odit excepturi
            dolor necessitatibus odio, ab, porro numquam.
          </p>
          <div class="servicio-detalle">
            <h4 data-i18n="home.services.consulting.detailsTitle">Detalles del servicio:</h4>
            <ul>
              <li>Asesoramiento personalizado</li>
              <li>Análisis de viabilidad</li>
              <li>Documentación completa</li>
              <li>Seguimiento post-consulta</li>
            </ul>
          </div>
        </li>
        <li onclick="toggleServicio(1)">
          <h3 data-i18n="home.services.procedures.title">Gestión de Trámites</h3>
          <p data-i18n="home.services.procedures.description">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            Perspiciatis aliquid, non consequatur fugiat nisi odit excepturi
            dolor necessitatibus odio, ab, porro numquam.
          </p>
          <div class="servicio-detalle">
            <h4 data-i18n="home.services.procedures.detailsTitle">Incluye:</h4>
            <ul>
              <li>Tramitación de permisos</li>
              <li>Gestión documental</li>
              <li>Coordinación con entidades</li>
              <li>Seguimiento en tiempo real</li>
            </ul>
          </div>
        </li>
        <li onclick="toggleServicio(2)">
          <h3 data-i18n="home.services.financial.title">Asesoría Financiera</h3>
          <p data-i18n="home.services.financial.description">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            Perspiciatis aliquid, non consequatur fugiat nisi odit excepturi
            dolor necessitatibus odio, ab, porro numquam.
          </p>
          <div class="servicio-detalle">
            <h4 data-i18n="home.services.financial.detailsTitle">Servicios financieros:</h4>
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
      <h2 data-i18n="home.incorporation.title">Proceso de incorporación</h2>
      <p data-i18n="home.incorporation.subtitle">Para unirte a nuestro equipo, sigue estos pasos:</p>
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
      <h2 data-i18n="home.faq.title">Preguntas Frecuentes</h2>
      <ul id="faq-list">
        <li onclick="togglePregunta(0)">
          <span class="faq-question">¿Cómo puedo solicitar un servicio?</span>
          <div class="pregunta-respuesta">
            Puedes solicitar nuestros servicios a través del botón "Solicitar ingreso" o contactándonos directamente por
            teléfono. Nuestro equipo te guiará en todo el proceso.
          </div>
        </li>
        <li onclick="togglePregunta(1)">
          <span class="faq-question">¿Cuáles son los métodos de pago aceptados?</span>
          <div class="pregunta-respuesta">
            Aceptamos transferencias bancarias, pagos en efectivo, tarjetas de crédito y débito. También ofrecemos
            planes de pago flexibles según tus necesidades.
          </div>
        </li>
        <li onclick="togglePregunta(2)">
          <span class="faq-question">¿Ofrecen soporte después de la consultoría?</span>
          <div class="pregunta-respuesta">
            Sí, brindamos soporte continuo durante 6 meses después de completar la consultoría. Esto incluye consultas
            telefónicas y seguimiento de tu progreso.
          </div>
        </li>
        <li onclick="togglePregunta(3)">
          <span class="faq-question">¿Puedo cancelar mi solicitud?</span>
          <div class="pregunta-respuesta">
            Puedes cancelar tu solicitud en cualquier momento antes de la firma del contrato. Si ya iniciamos el
            trabajo, aplicarán las condiciones establecidas en el contrato.
          </div>
        </li>
      </ul>
    </div>

    <div class="motivacion fade-in">
      <h2 class="motivacion__titulo" data-i18n="home.cta.title">
        ¡Comienza tu camino hacia la vivienda propia!
      </h2>
      <p data-i18n="home.cta.description">
        Contáctanos para más información sobre nuestros servicios de
        consultoría.
      </p>
      <a href="/register">
        <button class="motivacion__button" id="final-solicitar-btn" data-i18n="home.cta.button">
          Solicitar ingreso
        </button>
      </a>
    </div>
  </main>
  <?php include __DIR__ . '/includes/footer.html'; ?>

  <!-- Scripts i18n PRIMERO -->
  <script src="/assets/js/translations.js"></script>
  <script src="/assets/js/i18n.js"></script>
  
  <!-- Luego los scripts específicos de la página -->
  <script src="/assets/js/home.js"></script>

  <!-- Script personalizado para traducir listas dinámicas -->
  <script>
    // Traducir detalles de servicios cuando cambia el idioma
    window.addEventListener('languageChanged', function() {
      // Traducir detalles de servicios
      const consultingDetails = document.querySelectorAll('.servicios ul > li:nth-child(1) .servicio-detalle ul li');
      const proceduresDetails = document.querySelectorAll('.servicios ul > li:nth-child(2) .servicio-detalle ul li');
      const financialDetails = document.querySelectorAll('.servicios ul > li:nth-child(3) .servicio-detalle ul li');
      
      const lang = window.i18n.getLanguage();
      const t = translations[lang].home.services;
      
      consultingDetails.forEach((li, i) => {
        if (t.consulting.details[i]) li.textContent = t.consulting.details[i];
      });
      
      proceduresDetails.forEach((li, i) => {
        if (t.procedures.details[i]) li.textContent = t.procedures.details[i];
      });
      
      financialDetails.forEach((li, i) => {
        if (t.financial.details[i]) li.textContent = t.financial.details[i];
      });

      // Traducir pasos de incorporación
      const steps = document.querySelectorAll('.incorporacion ol li');
      steps.forEach((step, i) => {
        const stepData = translations[lang].home.incorporation.steps[i];
        if (stepData) {
          const title = step.querySelector('h3');
          const desc = step.querySelector('p');
          if (title) title.textContent = stepData.title;
          if (desc) desc.textContent = stepData.description;
        }
      });

      // Traducir FAQ
      const faqItems = document.querySelectorAll('#faq-list li');
      faqItems.forEach((item, i) => {
        const faqData = translations[lang].home.faq.questions[i];
        if (faqData) {
          const question = item.querySelector('.faq-question');
          const answer = item.querySelector('.pregunta-respuesta');
          if (question) question.textContent = faqData.question;
          if (answer) answer.textContent = faqData.answer;
        }
      });
    });

    // Ejecutar traducción inicial para las listas
    window.addEventListener('DOMContentLoaded', function() {
      window.dispatchEvent(new CustomEvent('languageChanged'));
    });
  </script>

</body>

</html>