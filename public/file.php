<?php
/**
 * Archivo para servir imágenes desde storage
 * Colocar en la carpeta pública (donde está index.php)
 * 
 * Uso: /file.php?path=uploads/pagos/imagen.jpg
 */

// Obtener la ruta del archivo
$path = $_GET['path'] ?? '';

if (empty($path)) {
    http_response_code(400);
    die('Ruta no especificada');
}

// Construir la ruta completa
// Ajusta '../storage/' según tu estructura de carpetas
$fullPath = __DIR__ . '/../storage/' . $path;

// Normalizar la ruta para evitar ataques
$realPath = realpath($fullPath);
$storageDir = realpath(__DIR__ . '/../storage');

// Verificar que el archivo existe
if (!$realPath || !file_exists($realPath) || !is_file($realPath)) {
    http_response_code(404);
    die('Archivo no encontrado');
}

// Verificar que está dentro de storage (seguridad)
if (strpos($realPath, $storageDir) !== 0) {
    http_response_code(403);
    die('Acceso denegado');
}

// Solo permitir imágenes y PDFs
$extension = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'webp'];

if (!in_array($extension, $allowedExtensions)) {
    http_response_code(403);
    die('Tipo de archivo no permitido');
}

// Tipos MIME
$mimeTypes = [
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'gif'  => 'image/gif',
    'pdf'  => 'application/pdf',
    'webp' => 'image/webp'
];

$mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

// Headers
header('Content-Type: ' . $mimeType);
header('Content-Length: ' . filesize($realPath));
header('Cache-Control: public, max-age=86400');
header('Content-Disposition: inline; filename="' . basename($realPath) . '"');

// Limpiar buffer
if (ob_get_level()) {
    ob_clean();
    flush();
}

// Enviar archivo
readfile($realPath);
exit;