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
    <input type="file" name="archivo" id="input-archivo" required />
    <br>
    <button type="submit">Enviar</button>
  </form>
  
  <div id="debug" style="margin-top: 20px; padding: 10px; background: #f0f0f0; display: none;">
    <h3>Debug Info:</h3>
    <pre id="debug-content"></pre>
  </div>
<script src="/assets/js/registrarPago.js"></script>

</body>

</html>