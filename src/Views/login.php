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
          class="login__formulario"
          id="form-login"
          method="post">
          <label for="email" class="formulario__label">correo</label>
          <input
            type="text"
            class="login__input input--usuario"
            name="email"
            placeholder="Ingrese su correo" />
          <label for="password" class="formulario__label">Contraseña</label>
          <input
            type="password"
            class="login__input input--contrasenia"
            name="password"
            placeholder="Ingrese su contraseña" />
          <input type="submit" class="login__submit" value="Ingresar" />
        </form>
      </div>
    </div>
  </main>
  <?php include 'includes/footer.html'; ?>
  <script>
    document.querySelector("#form-login").addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          body: formData
        })

        const data = await response.json();

        if (!data.success) {
          alert(data.message);
          if (data.redirect) window.location.href = data.redirect;

        } else {
          alert(data.message);
          window.location.href = data.redirect;
        }

      } catch (error) {
        console.error("error en la petición", error);
        alert("Hubo un problema con el servidor")
      }
    });
  </script>
</body>

</html>