<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login</title>
    <link rel="stylesheet" href="assets/css/styles.css" />
  </head>

  <body>
    <?php include 'includes/header.html'; ?>
    <main class="login__main">
      <div class="login__container">
        <div class="login__subcontainer">
          <h1 class="login__titulo">Cooperativa de Viviendas</h1>
          <p class="login__subtitulo">Sistema Administrativo</p>
          <form
            action="/pruebas/app/controllers/usuarioController.php?action=login"
            class="login__formulario"
            method="post"
          >
            <label for="usuario" class="formulario__label">Usuario</label>
            <input
              type="text"
              class="login__input input--usuario"
              name="usuario"
              placeholder="Ingrese su usuario"
            />
            <label for="contrasenia" class="formulario__label"
              >Contraseña</label
            >
            <input
              type="password"
              class="login__input input--contrasenia"
              name="contrasenia"
              placeholder="Ingrese su contraseña"
            />
            <input type="submit" class="login__submit" value="Ingresar" />
          </form>
        </div>
      </div>
    </main>
    <?php include 'includes/footer.html'; ?>
  </body>
</html>
