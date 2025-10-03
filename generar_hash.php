<?php
/**
 * Generador de Hash para contraseñas
 * Ejecutar: php generar_hash.php
 */

// Contraseña a hashear
$password = 'admin1234';

// Generar el hash
$hash = password_hash($password, PASSWORD_DEFAULT);

echo "=========================================\n";
echo "GENERADOR DE HASH DE CONTRASEÑAS\n";
echo "=========================================\n\n";
echo "Contraseña: " . $password . "\n";
echo "Hash generado:\n";
echo $hash . "\n\n";

// Verificar que el hash funciona
if (password_verify($password, $hash)) {
    echo "✓ Verificación exitosa: El hash es válido\n\n";
} else {
    echo "✗ Error: El hash no es válido\n\n";
}

// Información adicional
echo "Costo del algoritmo: " . password_get_info($hash)['algo'] . "\n";
echo "=========================================\n";
echo "\nCopia este hash en tu archivo SQL:\n";
echo "$hash\n";
echo "=========================================\n";
?>