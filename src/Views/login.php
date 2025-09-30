<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login</title>
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

    .login__main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      z-index: 1;
    }

    .login__container {
      width: 100%;
      max-width: 400px;
      perspective: 1000px;
    }

    .login__subcontainer {
      background: var(--color-white);
      border-radius: 20px;
      padding: 3rem 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      transform: translateY(20px);
      opacity: 0;
      animation: slideInUp 0.8s ease-out forwards;
      position: relative;
      overflow: hidden;
      will-change: transform;
    }

    .login__subcontainer::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
      animation: shine 2s infinite;
    }

    .login__titulo {
      color: var(--color-dark);
      font-size: 2rem;
      font-weight: 600;
      text-align: center;
      margin-bottom: 0.5rem;
      opacity: 0;
      transform: scale(0.95);
      animation: fadeInScale 1s ease-out 0.3s forwards;
    }

    .login__subtitulo {
      color: var(--color-gray);
      text-align: center;
      margin-bottom: 2rem;
      font-size: 1.1rem;
      opacity: 0;
      transform: scale(0.95);
      animation: fadeInScale 1s ease-out 0.5s forwards;
    }

    .login__formulario {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .formulario__label {
      color: var(--color-dark);
      font-weight: 500;
      margin-bottom: 0.5rem;
      opacity: 0;
      animation: slideInLeft 0.6s ease-out 0.7s forwards;
    }

    .login__input {
      padding: 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
      outline: none;
      opacity: 0;
      transform: translateX(-20px);
      animation: slideInLeft 0.6s ease-out 0.8s forwards;
    }

    .login__input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(30, 123, 255, 0.1);
      transform: translateX(0) translateY(-2px) scale(1.02);
    }

    .login__input:hover {
      border-color: var(--color-primary);
      transform: translateY(-1px);
    }

    .login__submit {
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
      animation: slideInUp 0.6s ease-out 1s forwards;
      position: relative;
      overflow: hidden;
    }

    .login__submit::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .login__submit:hover::before {
      left: 100%;
    }

    .login__submit:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2);
    }

    .login__submit:active {
      transform: translateY(-1px);
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

    @media (max-width: 480px) {
      .login__subcontainer {
        margin: 1rem;
        padding: 2rem 1.5rem;
      }

      .login__titulo {
        font-size: 1.5rem;
      }
    }
  </style>
</head>

<body>
  <?php include __DIR__ . '/includes/header.html'; ?>

  <main class="login__main">
    <div class="background-animation" id="backgroundAnimation"></div>
    <div class="login__container">
      <div class="login__subcontainer" id="loginBox">
        <h1 class="login__titulo">Cooperativa de Viviendas</h1>
        <p class="login__subtitulo">Sistema Administrativo</p>
        <form class="login__formulario" id="form-login" method="post">
          <label for="email" class="formulario__label">Correo</label>
          <input type="text" class="login__input input--usuario" name="email" placeholder="Ingrese su correo" />

          <label for="password" class="formulario__label">Contraseña</label>
          <input type="password" class="login__input input--contrasenia" name="password"
            placeholder="Ingrese su contraseña" />

          <input type="submit" class="login__submit" value="Ingresar" />
          
        </form>
      </div>
    </div>
  </main>

   <?php include __DIR__ . '/includes/footer.html'; ?>

  <script>
    // lógica fetch original
   document.querySelector("#form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      body: formData
    });
    
    // DEBUG: Ver qué responde el servidor
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Respuesta del servidor:", text);
    
    const data = JSON.parse(text);

    if (!data.success) {
      alert(data.message);
      if (data.redirect) window.location.href = data.redirect;
    } else {
      alert(data.message);
      window.location.href = data.redirect;
    }
  } catch (error) {
    console.error("error en la petición", error);
    alert("Hubo un problema con el servidor: " + error.message)
  }
    });

    // partículas
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

    // ripple efecto botón
    function addButtonEffects() {
      const submitBtn = document.querySelector('.login__submit');
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

    // inicializar animaciones
    document.addEventListener('DOMContentLoaded', function () {
      createParticles();
      addButtonEffects();
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.5s ease';
      setTimeout(() => { document.body.style.opacity = '1'; }, 100);
    });

    // paralaje
    document.addEventListener('mousemove', function (e) {
      const container = document.getElementById('loginBox');
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      container.style.transform = `translateY(0) rotateY(${x * 1}deg) rotateX(${y * -1}deg)`;
    });
  </script>
</body>

</html>
