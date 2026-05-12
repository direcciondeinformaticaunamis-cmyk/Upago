<?php
/**
 * Herramienta de Diagnóstico - Upago UNAMIS
 */
header("Content-Type: text/plain; charset=UTF-8");
echo "=== DIAGNOSTICO DE SISTEMA UPAGO ===\n\n";

echo "1. Informacion del Servidor:\n";
echo "   PHP Version: " . phpversion() . "\n";
echo "   Software: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "   Raiz: " . $_SERVER['DOCUMENT_ROOT'] . "\n\n";

echo "2. Extensiones Requeridas:\n";
$extensions = ["pdo", "pdo_mysql", "json", "fileinfo"];
foreach ($extensions as $ext) {
    echo "   $ext: " . (extension_loaded($ext) ? "Habilitada [OK]" : "NO ENCONTRADA [!] ") . "\n";
}

echo "\n3. Listado de Archivos (Raiz):\n";
$files = scandir('.');
foreach ($files as $file) {
    $type = is_dir($file) ? "[DIR ]" : "[FILE]";
    echo "   $type $file\n";
}

echo "\n4. Contenido de assets/:\n";
if (is_dir('assets')) {
    $assets = scandir('assets');
    foreach ($assets as $asset) {
        echo "   assets/$asset\n";
    }
} else {
    echo "   [!] Directorio assets no encontrado\n";
}

echo "\n5. Prueba de Conexion a Base de Datos:\n";
if (file_exists('config.php')) {
    require_once 'config.php';
    echo "   config.php: Encontrado [OK]\n";
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        echo "   DB STATUS: CONECTADO [OK]\n";
    } catch (Exception $e) {
        echo "   DB STATUS: ERROR DE CONEXION [!] - " . $e->getMessage() . "\n";
    }
} else {
    echo "   config.php: NO ENCONTRADO [!]\n";
}
