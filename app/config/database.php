<!-- variables de conexión -->
<?php
$host = 'localhost';
$dbname = 'cooperativa';
$username = 'root';
$password = '';


try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Conexión exitosa a la base de datos.";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}