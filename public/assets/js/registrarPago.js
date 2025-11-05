 document
      .querySelector("#form-pago")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        
        ("=== INICIO SUBMIT ===");
        
        const formData = new FormData(e.target);
        
        // Verificar que el archivo esté en el FormData
        for (let [key, value] of formData.entries()) {
            (`${key}:`, value);
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

          ("Response status:", response.status);
          debugContent.textContent += `Status: ${response.status}\n`;

          const textResponse = await response.text();
          ("Response body:", textResponse);
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