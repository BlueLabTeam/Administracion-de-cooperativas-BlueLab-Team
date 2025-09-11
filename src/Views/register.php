<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Solicitud Registro</title>
  <link rel="stylesheet" href="assets/css/styles.css" />
</head>

<body>
  <?php include 'includes/header.html' ?>
  <main class="registro__main">
    <section class="main__encabezado">
      <h1 class="main__titulo">Solicitud de Registro</h1>
      <p class="main__subtitulo">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Et laboriosam
        doloribus magni dignissimos, cum quaerat fugit enim consequatur quia
        autem quo est amet. Delectus dignissimos voluptas numquam a ducimus
        beatae?
      </p>
    </section>
    <form method="post" class="registro__formulario" id="form-registro">
      <label for="nombre_completo" class="formulario__label label--nombre_completo">Nombre completo</label>
      <input type="text" name="nombre_completo" class="formulario__input input--nombre_completo" />
      <label for="CI" class="formulario__label label--CI">Carnet de identidad</label>
      <input type="text" name="CI" class="formulario__input input--CI" />
      <label for="telefono" class="formulario__label label--telefono">Teléfono</label>
      <input type="number" name="telefono" class="formulario__input input--telefono" />
      <label for="email" class="formulario__label label--email">Email</label>
      <input type="email" name="email" class="formulario__input input--email" />
      <label for="direccion" class="formulario__label label--direccion">Dirección</label>
      <input type="text" name="direccion" class="formulario__input input--direccion" />
      <label for="fecha_nacimiento" class="formulario__label label--fecha_nacimiento">Fecha de nacimiento</label>
      <input type="date" name="fecha_nacimiento" class="formulario__input input--fecha_nacimiento" placeholder="dd/mm/aaaa" />
      <label for="password" class="formulario__label label--contrasena">Contraseña</label>
      <input type="password" name="password" class="formulario__input input--contrasena" />
      <input type="submit" class="formulario__submit" value="Enviar Solicitud" />
    </form>
  </main>
  <?php include 'includes/footer.html'; ?>
  <script>
    document.querySelector("#form-registro").addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {


          const response = await fetch("/api/register", {
            method: "POST",
            body: formData
          })

          const data = await response.json();

          if (!data.success) {
            alert(data.message);
            window.location.href = data.redirect;

          } else {
            alert(data.message);
            window.location.href = data.redirect;
          }

        } catch (error) {
          console.error("error en la petición", error);
          alert("Hubo un problema con el servidor")
        }
      }

    )
  </script>
</body>

</html>