
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
      submitBtn.addEventListener('click', function(e) {
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
    document.addEventListener('DOMContentLoaded', function() {
      createParticles();
      addButtonEffects();
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
    });

    // paralaje
    document.addEventListener('mousemove', function(e) {
      const container = document.getElementById('loginBox');
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      container.style.transform = `translateY(0) rotateY(${x * 1}deg) rotateX(${y * -1}deg)`;
    });

    // Ver password
    let inputElement = document.getElementById("password");
    let showElement = document.querySelector(".fa-eye");
    let hideElement = document.querySelector(".fa-eye-slash");

    showElement.addEventListener("click", function() {
      inputElement.type = "text";
      showElement.style.display = "none";
      hideElement.style.display = "block";
    });
    hideElement.addEventListener("click", function() {
      inputElement.type = "password";
      hideElement.style.display = "none";
      showElement.style.display = "block";
    });
