<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login</title>
  <link rel="stylesheet" href="/assets/css/login.css" />
  <link rel="stylesheet" href="/assets/css/i18n.css" />
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
        <h1 class="login__titulo" data-i18n="login.title">Cooperativa de Viviendas</h1>
        <p class="login__subtitulo" data-i18n="login.subtitle">Sistema Administrativo</p>
        <form class="login__formulario" id="form-login" method="post">
          <label for="email" class="formulario__label" data-i18n="login.email">Correo</label>
          <input type="text" class="login__input input--usuario" name="email" 
                 data-i18n-placeholder="login.emailPlaceholder" placeholder="Ingrese su correo" />
          
          <label for="password" class="formulario__label" data-i18n="login.password">Contraseña</label>
          <div class="password-container">
            <input type="password" class="login__input input--contrasenia" name="password"
              data-i18n-placeholder="login.passwordPlaceholder" placeholder="Ingrese su contraseña" id="password" />
            <i class="fa-solid fa-eye"></i>
            <i class="fa-solid fa-eye-slash"></i>
          </div>
          
          <input type="submit" class="login__submit" data-i18n-value="login.submit" value="Ingresar" />
          
          <p>
            <span data-i18n="login.noAccount">No tienes una cuenta?</span>
            <a class="register-link" href="/register" data-i18n="login.register">Regístrate aquí</a>
          </p>
        </form>
      </div>
    </div>
  </main>

  <?php include __DIR__ . '/includes/footer.html'; ?>

  <!-- Scripts i18n PRIMERO -->
  <script src="/assets/js/translations.js"></script>
  <script src="/assets/js/i18n.js"></script>
  
  <!-- Script de la página -->
  <script src="/assets/js/login.js"></script>
</body>

</html>