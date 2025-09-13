<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registrar Pago</title>
</head>

<body>
  <h1>Registre su Pago inicial</h1>
  <h2>Para poder continuar en la plataforma</h2>
  <form id="form-pago" method="post">
    <label for="archivo">Suba aqui la captura o foto del comprobante de pago, Por favor</label>
    <br>
    <input type="file" name="archivo" id="input-archivo" />
    <br>
    <button type="submit">Enviar</button>
  </form>
  <script>
    document
      .querySelector("#form-pago")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
          const response = await fetch("/api/pay/firstPay", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (data.success) {
            alert(data.message);
            window.location.href = data.redirect;
          } else {
            alert("Error:" + data.message);
          }
        } catch (error) {
          console.error(error);
          alert("Error al conectarse con el servidor");
        }
      });
  </script>
</body>

</html>