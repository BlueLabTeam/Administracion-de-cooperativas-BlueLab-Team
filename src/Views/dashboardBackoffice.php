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
?>
<!DOCTYPE html>
<html lang="es">

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Gestcoop – Panel de Administrador</title>
</head>

<body>
	<?php include __DIR__ . '/includes/dashboardHeader.html'; ?>

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
			align-items: center;
			margin-bottom: 15px;
		}
		.payment-info {
			flex: 1;
		}
		.payment-image {
			max-width: 300px;
			margin: 15px 0;
		}
		.payment-image img {
			max-width: 100%;
			border: 1px solid #ddd;
			border-radius: 4px;
		}
		.payment-actions {
			display: flex;
			gap: 10px;
			margin-top: 15px;
		}
		.btn {
			padding: 10px 20px;
			border: none;
			border-radius: 5px;
			cursor: pointer;
			font-weight: bold;
		}
		.btn-approve {
			background-color: #28a745;
			color: white;
		}
		.btn-reject {
			background-color: #dc3545;
			color: white;
		}
		.btn:hover {
			opacity: 0.8;
		}
		.no-payments {
			text-align: center;
			padding: 40px;
			color: #666;
		}
	</style>
</head>

<body>
	<?php include __DIR__ . '/includes/dashboardHeader.html'; ?>

	<main class="container">
		<div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-radius: 5px; border: 2px solid #ffc107;">
			<p style="margin: 0; font-weight: bold; color: #856404;">
				🔧 PANEL DE ADMINISTRADOR - Gestión de Pagos
			</p>
		</div>

		<div class="payments-container">
			<h2>Pagos Pendientes de Aprobación</h2>
			
			<?php if (empty($pagosPendientes)): ?>
				<div class="no-payments">
					<p>No hay pagos pendientes de revisión</p>
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
							<p><strong>Comprobante de pago:</strong></p>
							<a href="/storage/<?php echo htmlspecialchars($pago['archivo']); ?>" target="_blank">
								<img src="/storage/<?php echo htmlspecialchars($pago['archivo']); ?>" alt="Comprobante">
							</a>
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

	<script>
		async function approvePayment(userId) {
			if (!confirm('¿Está seguro de aprobar este pago?')) return;
			
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
				}
			} catch (error) {
				console.error(error);
				alert('Error al conectar con el servidor');
			}
		}
		
		async function rejectPayment(userId) {
			if (!confirm('¿Está seguro de rechazar este pago?')) return;
			
			try {
				const response = await fetch('/api/payment/reject', {
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
				}
			} catch (error) {
				console.error(error);
				alert('Error al conectar con el servidor');
			}
		}
	</script>
</body>

</html>

</body>

</html>