<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login</title>
  <link rel="stylesheet" href="/assets/css/login.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"
    integrity="sha512-2SwdPD6INVrV/lHTZbO2nodKhrnDdJK9/kg2XD1r9uGqPo1cUbujc+IYdlYdEErWNu69gVcYgdxlmVmzTWnetw=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />

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
          <div class="password-container">
            <input type="password" class="login__input input--contrasenia" name="password"
              placeholder="Ingrese su contraseña" id="password" />
            <i class="fa-solid fa-eye"></i>
            <i class="fa-solid fa-eye-slash"></i>
          </div>
          <input type="submit" class="login__submit" value="Ingresar" />
          <p> No tienes una cuenta?<a class="register-link" href="/register">Regístrate aquí</a></p>
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
    let inputElement = document.getElementById("password");
    let showElement = document.querySelector(".fa-eye");
    let hideElement = document.querySelector(".fa-eye-slash");

    showElement.addEventListener("click", function () {
      inputElement.type = "text";
      showElement.style.display = "none";
      hideElement.style.display = "block";
    });
    hideElement.addEventListener("click", function () {
      inputElement.type = "password";
      hideElement.style.display = "none";
      showElement.style.display = "block";
    });
  </script>
</body>

</html>