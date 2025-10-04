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

  <script>
    document
      .querySelector("#form-pago")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        
        console.log("=== INICIO SUBMIT ===");
        
        const formData = new FormData(e.target);
        
        // Verificar que el archivo esté en el FormData
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        
        const debugDiv = document.getElementById('debug');
        const debugContent = document.getElementById('debug-content');
        debugDiv.style.display = 'block';
        debugContent.textContent = 'Enviando petición a /api/pay/firstPay...\n';
        
        try {
          const response = await fetch("/api/pay/firstPay", {
            method: "POST",
            body: formData,
          });

          console.log("Response status:", response.status);
          debugContent.textContent += `Status: ${response.status}\n`;

          const textResponse = await response.text();
          console.log("Response body:", textResponse);
          debugContent.textContent += `Response:\n${textResponse}`;

          try {
            const data = JSON.parse(textResponse);

            if (data.success) {
              alert(data.message);
              window.location.href = data.redirect;
            } else {
              alert("Error: " + data.message);
            }
          } catch (parseError) {
            console.error('Error parseando JSON:', parseError);
            debugContent.textContent += `\n\nNO ES JSON VÁLIDO`;
            alert("Error: La respuesta no es JSON válido. Ver consola.");
          }

        } catch (error) {
          console.error('Error en fetch:', error);
          debugContent.textContent += `\nError: ${error.message}`;
          alert("Error al conectarse con el servidor: " + error.message);
        }
      });
  </script>
</body>

</html>