<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Solicitud de Registro</title>
  <style>
    :root {
      --color-primary: #1E7BFF;
      --color-secondary: #4A9EFF;
      --color-white: #ffffff;
      --color-dark: #333333;
      --color-gray: #666666;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .registro__main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      z-index: 1;
    }

    .registro__container {
      width: 100%;
      max-width: 700px;
      perspective: 1000px;
    }

    .registro__subcontainer {
      background: var(--color-white);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      transform: translateY(20px);
      opacity: 0;
      animation: slideInUp 0.8s ease-out forwards;
      position: relative;
      overflow: hidden;
      will-change: transform;
    }

    .registro__subcontainer::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
      animation: shine 2s infinite;
    }

    .main__titulo {
      color: var(--color-dark);
      font-size: 2rem;
      font-weight: 600;
      text-align: center;
      margin-bottom: 0.5rem;
      opacity: 0;
      transform: scale(0.95);
      animation: fadeInScale 1s ease-out 0.3s forwards;
    }

    .main__subtitulo {
      color: var(--color-gray);
      text-align: center;
      margin-bottom: 2rem;
      font-size: 1.1rem;
      opacity: 0;
      transform: scale(0.95);
      animation: fadeInScale 1s ease-out 0.5s forwards;
    }

    .registro__formulario {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem 2rem;
    }

    .formulario__group {
      display: flex;
      flex-direction: column;
    }

    .formulario__group--full {
      grid-column: 1 / -1;
    }

    .formulario__label {
      color: var(--color-dark);
      font-weight: 500;
      margin-bottom: 0.5rem;
      opacity: 0;
      animation: slideInLeft 0.6s ease-out forwards;
    }

    .formulario__input {
      padding: 0.9rem;
      border: 2px solid #e1e5e9;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
      outline: none;
      opacity: 0;
      transform: translateX(-20px);
      animation: slideInLeft 0.6s ease-out 0.2s forwards;
    }

    .formulario__input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(30, 123, 255, 0.1);
      transform: translateY(-2px) scale(1.02);
    }

    .formulario__submit {
      background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%);
      color: var(--color-white);
      padding: 1rem;
      border: none;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(20px);
      animation: slideInUp 0.6s ease-out 0.5s forwards;
      position: relative;
      overflow: hidden;
      grid-column: 1 / -1;
      margin-top: 1rem;
    }

    .formulario__submit:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2);
    }

    @keyframes slideInUp {
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes fadeInScale {
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes slideInLeft {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes shine {
      0% {
        left: -100%;
      }

      50%,
      100% {
        left: 100%;
      }
    }

    .background-animation {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%,
      100% {
        transform: translateY(0px) rotate(0deg);
      }

      50% {
        transform: translateY(-20px) rotate(180deg);
      }
    }

    @media (max-width: 768px) {
      .registro__formulario {
        grid-template-columns: 1fr;
        gap: 1.2rem;
      }
    }

    @media (max-width: 480px) {
      .registro__subcontainer {
        margin: 1rem;
        padding: 2rem 1.5rem;
      }

      .main__titulo {
        font-size: 1.5rem;
      }
    }
  </style>
</head>

<body>
  <?php include __DIR__ . '/includes/header.html'; ?>

  <main class="registro__main">
    <div class="background-animation" id="backgroundAnimation"></div>
    <div class="registro__container">
      <div class="registro__subcontainer" id="registerBox">
        <section class="main__encabezado">
          <h1 class="main__titulo">Solicitud de Registro</h1>
          <p class="main__subtitulo">
            Complete el formulario para enviar su solicitud de ingreso.
          </p>
        </section>

        <form method="post" class="registro__formulario" id="form-registro">
          <div class="formulario__group">
            <label for="nombre_completo" class="formulario__label">Nombre completo</label>
            <input type="text" name="nombre_completo" id="nombre_completo" class="formulario__input" />
          </div>

          <div class="formulario__group">
            <label for="CI" class="formulario__label">Carnet de identidad</label>
            <input type="text" name="CI" id="CI" class="formulario__input" />
          </div>

          <div class="formulario__group">
            <label for="telefono" class="formulario__label">Teléfono</label>
            <input type="number" name="telefono" id="telefono" class="formulario__input" />
          </div>

          <div class="formulario__group">
            <label for="fecha_nacimiento" class="formulario__label">Fecha de nacimiento</label>
            <input type="date" name="fecha_nacimiento" id="fecha_nacimiento" class="formulario__input"
              placeholder="dd/mm/aaaa" />
          </div>

          <div class="formulario__group formulario__group--full">
            <label for="email" class="formulario__label">Email</label>
            <input type="email" name="email" id="email" class="formulario__input" />
          </div>

          <div class="formulario__group formulario__group--full">
            <label for="direccion" class="formulario__label">Dirección</label>
            <input type="text" name="direccion" id="direccion" class="formulario__input" />
          </div>

          <div class="formulario__group formulario__group--full">
            <label for="password" class="formulario__label">Contraseña</label>
            <input type="password" name="password" id="password" class="formulario__input" />
          </div>

          <input type="submit" class="formulario__submit" value="Enviar Solicitud" />
        </form>
      </div>
    </div>
  </main>

  <?php include __DIR__ . '/includes/footer.html'; ?>

  <script>
    // efecto partículas
    function createParticles() {
      const container = document.getElementById('backgroundAnimation');
      const particleCount = 15;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        container.appendChild(particle);
      }
    }

    // efecto ripple en el botón
    function addButtonEffects() {
      const submitBtn = document.querySelector('.formulario__submit');
      submitBtn.addEventListener('click', function (e) {
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
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        `;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    }

    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.addEventListener('DOMContentLoaded', function () {
      createParticles();
      addButtonEffects();
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.5s ease';
      setTimeout(() => { document.body.style.opacity = '1'; }, 100);
    });

    // efecto parallax
    document.addEventListener('mousemove', function (e) {
      const container = document.getElementById('registerBox');
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      container.style.transform = `translateY(0) rotateY(${x * 1}deg) rotateX(${y * -1}deg)`;
    });

    // manejo fetch del form
    document.querySelector("#form-registro").addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          body: formData
        })
        const data = await response.json();
        alert(data.message);
        if (data.redirect) window.location.href = data.redirect;
      } catch (error) {
        console.error("error en la petición", error);
        alert("Hubo un problema con el servidor")
      }
    })
  </script>
</body>

</html>
