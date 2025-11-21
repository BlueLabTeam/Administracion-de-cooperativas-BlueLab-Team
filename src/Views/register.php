<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Solicitud de Registro</title>
  <link rel="stylesheet" href="/assets/css/register.css" />
  <link rel="stylesheet" href="/assets/css/i18n.css" />
</head>

<body>
  <?php include __DIR__ . '/includes/header.html'; ?>

  <main class="registro__main">
    <div class="background-animation" id="backgroundAnimation"></div>
    <div class="registro__container">
      <div class="registro__subcontainer" id="registerBox">
        <section class="main__encabezado">
          <h1 class="main__titulo" data-i18n="register.title">Solicitud de Registro</h1>
          <p class="main__subtitulo" data-i18n="register.subtitle">
            Complete el formulario para enviar su solicitud de ingreso.
          </p>
        </section>

        <form method="post" class="registro__formulario" id="form-registro">
          <div class="formulario__group">
            <label for="nombre_completo" class="formulario__label" data-i18n="register.fullName">Nombre completo</label>
            <input type="text" name="nombre_completo" id="nombre_completo" class="formulario__input" 
                   data-i18n-placeholder="" />
          </div>

          <div class="formulario__group">
            <label for="CI" class="formulario__label" data-i18n="register.id">Carnet de identidad</label>
            <input type="text" name="CI" id="CI" class="formulario__input" 
                   data-i18n-placeholder="" />
          </div>

          <div class="formulario__group">
            <label for="telefono" class="formulario__label" data-i18n="register.phone">Teléfono</label>
            <input type="number" name="telefono" id="telefono" class="formulario__input" 
                   data-i18n-placeholder="" />
          </div>

          <div class="formulario__group">
            <label for="fecha_nacimiento" class="formulario__label" data-i18n="register.birthDate">Fecha de nacimiento</label>
            <input type="date" name="fecha_nacimiento" id="fecha_nacimiento" class="formulario__input"
              placeholder="dd/mm/aaaa" />
          </div>

          <div class="formulario__group formulario__group--full">
            <label for="email" class="formulario__label" data-i18n="register.email">Email</label>
            <input type="email" name="email" id="email" class="formulario__input" 
                   data-i18n-placeholder="" />
          </div>

          <div class="formulario__group formulario__group--full">
            <label for="direccion" class="formulario__label" data-i18n="register.address">Dirección</label>
            <input type="text" name="direccion" id="direccion" class="formulario__input" 
                   data-i18n-placeholder="" />
          </div>

          <div class="formulario__group formulario__group--full">
            <label for="password" class="formulario__label" data-i18n="register.password">Contraseña</label>
            <input type="password" name="password" id="password" class="formulario__input" 
                   data-i18n-placeholder="" />
          </div>

          <input type="submit" class="formulario__submit" data-i18n-value="register.submit" value="Enviar Solicitud" />
          <p>
            <span data-i18n="register.hasAccount">¿Ya tienes una cuenta?</span>
            <a class="login-link" href="/login" data-i18n="register.login">Inicia sesión aquí</a>
          </p>
        </form>
      </div>
    </div>
  </main>

  <?php include __DIR__ . '/includes/footer.html'; ?>

  <!-- Scripts i18n PRIMERO -->
  <script src="/assets/js/translationslandinpage.js"></script>
  <script src="/assets/js/i18n.js"></script>
  
  <!-- Script de la página -->
  <script src="/assets/js/register.js"></script>
</body>

</html>