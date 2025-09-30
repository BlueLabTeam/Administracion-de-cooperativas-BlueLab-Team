<?php
// Verificar que el usuario esté autenticado y sea admin
if (!isset($_SESSION['user_id'])) {
    header('Location: /login');
    exit();
}

if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    header('Location: /dashboard');
    exit();
}

// Obtener pagos pendientes
$userModel = new \App\Models\User();
$pagosPendientes = $userModel->getPendingPayments();
?>
<!DOCTYPE html>
<html lang="es">

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Gestcoop – Panel de Administrador</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			font-family: Arial, sans-serif;
			background-color: #f5f5f5;
		}

		.payments-container {
			max-width: 1200px;
			margin: 20px auto;
			padding: 20px;
		}

		.payment-card {
			background: white;
			border: 1px solid #ddd;
			border-radius: 8px;
			padding: 20px;
			margin-bottom: 20px;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		}

		.payment-header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 15px;
			padding-bottom: 15px;
			border-bottom: 2px solid #f0f0f0;
		}

		.payment-info {
			flex: 1;
		}

		.payment-info h3 {
			color: #333;
			margin-bottom: 10px;
		}

		.payment-info p {
			margin: 5px 0;
			color: #666;
		}

		.payment-image {
			margin: 20px 0;
		}

		.payment-image > p {
			font-weight: bold;
			margin-bottom: 10px;
			color: #333;
		}

		.image-preview {
			max-width: 100%;
			max-height: 500px;
			border: 2px solid #ddd;
			border-radius: 8px;
			cursor: pointer;
			transition: transform 0.2s;
		}

		.image-preview:hover {
			transform: scale(1.02);
			border-color: #007bff;
		}

		.image-link {
			display: inline-block;
			margin-top: 10px;
			color: #007bff;
			text-decoration: none;
		}

		.image-link:hover {
			text-decoration: underline;
		}

		.payment-actions {
			display: flex;
			gap: 10px;
			margin-top: 15px;
		}

		.btn {
			padding: 12px 24px;
			border: none;
			border-radius: 5px;
			cursor: pointer;
			font-weight: bold;
			font-size: 14px;
			transition: all 0.3s;
		}

		.btn-approve {
			background-color: #28a745;
			color: white;
		}

		.btn-approve:hover {
			background-color: #218838;
		}

		.btn-reject {
			background-color: #dc3545;
			color: white;
		}

		.btn-reject:hover {
			background-color: #c82333;
		}

		.btn:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		.no-payments {
			text-align: center;
			padding: 60px 20px;
			background: white;
			border-radius: 8px;
			color: #666;
		}

		.no-payments p {
			font-size: 18px;
		}

		.admin-banner {
			margin: 20px auto;
			max-width: 1200px;
			padding: 15px 20px;
			background-color: #fff3cd;
			border-radius: 5px;
			border: 2px solid #ffc107;
		}

		.admin-banner p {
			margin: 0;
			font-weight: bold;
			color: #856404;
		}

		/* Modal para ver imagen en grande */
		.modal {
			display: none;
			position: fixed;
			z-index: 1000;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0,0,0,0.9);
		}

		.modal-content {
			margin: auto;
			display: block;
			max-width: 90%;
			max-height: 90%;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		.close-modal {
			position: absolute;
			top: 15px;
			right: 35px;
			color: #f1f1f1;
			font-size: 40px;
			font-weight: bold;
			cursor: pointer;
		}

		.close-modal:hover {
			color: #bbb;
		}
	</style>
</head>

<body>
	<?php include __DIR__ . '/includes/dashboardHeader.html'; ?>

	<main class="container">
		<div class="admin-banner">
			<p>
				🔧 PANEL DE ADMINISTRADOR - Gestión de Pagos
			</p>
		</div>

		<div class="payments-container">
			<h2>Pagos Pendientes de Aprobación</h2>
			
			<?php if (empty($pagosPendientes)): ?>
				<div class="no-payments">
					<p>✅ No hay pagos pendientes de revisión</p>
				</div>
			<?php else: ?>
				<?php foreach ($pagosPendientes as $pago): ?>
					<div class="payment-card" id="payment-<?php echo $pago['id_usuario']; ?>">
						<div class="payment-header">
							<div class="payment-info">
								<h3><?php echo htmlspecialchars($pago['nombre_completo']); ?></h3>
								<p><strong>Email:</strong> <?php echo htmlspecialchars($pago['email']); ?></p>
								<p><strong>Cédula:</strong> <?php echo htmlspecialchars($pago['cedula']); ?></p>
								<p><strong>Fecha de envío:</strong> <?php echo date('d/m/Y H:i', strtotime($pago['fecha_pago'])); ?></p>
							</div>
						</div>
						
						<div class="payment-image">
							<p>📄 Comprobante de pago:</p>
							<?php 
							// Construir la URL usando file.php
							$rutaImagen = '/file.php?path=' . urlencode($pago['archivo']); 
							?>
							<img 
								src="<?php echo htmlspecialchars($rutaImagen); ?>" 
								alt="Comprobante de pago" 
								class="image-preview"
								onclick="openModal(this.src)"
								onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3EImagen no disponible%3C/text%3E%3C/svg%3E'; console.error('Error cargando imagen:', this.src);"
							>
							<br>
							<a href="<?php echo htmlspecialchars($rutaImagen); ?>" 
							   target="_blank" 
							   class="image-link">
								🔗 Abrir imagen en nueva pestaña
							</a>
							<!-- Debug oculto: <?php echo htmlspecialchars($pago['archivo']); ?> -->
							<script>console.log('Ruta archivo:', <?php echo json_encode($pago['archivo']); ?>);</script>
						</div>
						
						<div class="payment-actions">
							<button class="btn btn-approve" onclick="approvePayment(<?php echo $pago['id_usuario']; ?>)">
								✓ Aprobar Pago
							</button>
							<button class="btn btn-reject" onclick="rejectPayment(<?php echo $pago['id_usuario']; ?>)">
								✗ Rechazar Pago
							</button>
						</div>
					</div>
				<?php endforeach; ?>
			<?php endif; ?>
		</div>
	</main>

	<!-- Modal para ver imagen en grande -->
	<div id="imageModal" class="modal" onclick="closeModal()">
		<span class="close-modal">&times;</span>
		<img class="modal-content" id="modalImage">
	</div>

	<script>
		function openModal(src) {
			const modal = document.getElementById('imageModal');
			const modalImg = document.getElementById('modalImage');
			modal.style.display = 'block';
			modalImg.src = src;
		}

		function closeModal() {
			document.getElementById('imageModal').style.display = 'none';
		}

		async function approvePayment(userId) {
			if (!confirm('¿Está seguro de aprobar este pago?')) return;
			
			const btn = event.target;
			btn.disabled = true;
			btn.textContent = 'Procesando...';
			
			try {
				const response = await fetch('/api/payment/approve', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: `id_usuario=${userId}`
				});
				
				const data = await response.json();
				
				if (data.success) {
					alert(data.message);
					document.getElementById(`payment-${userId}`).remove();
					
					// Si no quedan más pagos, recargar la página
					if (document.querySelectorAll('.payment-card').length === 0) {
						location.reload();
					}
				} else {
					alert('Error: ' + data.message);
					btn.disabled = false;
					btn.textContent = '✓ Aprobar Pago';
				}
			} catch (error) {
				console.error(error);
				alert('Error al conectar con el servidor');
				btn.disabled = false;
				btn.textContent = '✓ Aprobar Pago';
			}
		}
		
		async function rejectPayment(userId) {
			const motivo = prompt('¿Por qué rechaza este pago? (opcional)');
			if (motivo === null) return; // Usuario canceló
			
			if (!confirm('¿Está seguro de rechazar este pago? El usuario podrá volver a intentarlo.')) return;
			
			const btn = event.target;
			btn.disabled = true;
			btn.textContent = 'Procesando...';
			
			try {
				const response = await fetch('/api/payment/reject', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: `id_usuario=${userId}&motivo=${encodeURIComponent(motivo)}`
				});
				
				const data = await response.json();
				
				if (data.success) {
					alert(data.message);
					document.getElementById(`payment-${userId}`).remove();
					
					// Si no quedan más pagos, recargar la página
					if (document.querySelectorAll('.payment-card').length === 0) {
						location.reload();
					}
				} else {
					alert('Error: ' + data.message);
					btn.disabled = false;
					btn.textContent = '✗ Rechazar Pago';
				}
			} catch (error) {
				console.error(error);
				alert('Error al conectar con el servidor');
				btn.disabled = false;
				btn.textContent = '✗ Rechazar Pago';
			}
		}
	</script>
</body>
</html>