<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registrar Pago</title>
  <link rel="stylesheet" href="/assets/css/i18n.css" />
</head>

<body>
  <h1 data-i18n="payment.title">Registre su Pago inicial</h1>
  <h2 data-i18n="payment.subtitle">Para poder continuar en la plataforma</h2>
  <form id="form-pago" method="post">
    <label for="archivo" data-i18n="payment.uploadLabel">Suba aqui la captura o foto del comprobante de pago, Por favor</label>
    <br>
    <input type="file" name="archivo" id="input-archivo" required />
    <br>
    <button type="submit" data-i18n="payment.submit">Enviar</button>
  </form>
  
  <div id="debug" style="margin-top: 20px; padding: 10px; background: #f0f0f0; display: none;">
    <h3>Debug Info:</h3>
    <pre id="debug-content"></pre>
  </div>

<!-- Scripts i18n PRIMERO -->
<script src="/assets/js/translations.js"></script>
<script src="/assets/js/i18n.js"></script>

<!-- Script de la página -->
<script src="/assets/js/registrarPago.js"></script>

</body>

</html>