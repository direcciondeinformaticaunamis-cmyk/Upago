<?php
header("Content-Type: text/plain; charset=UTF-8");
echo "=== DIAGNOSTICO DE SISTEMA UPAGO ===\n\n";

echo "1. Informacion del Servidor:\n";
echo "   PHP Version: " . phpversion() . "\n";
echo "   Software: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "   Raiz: " . $_SERVER['DOCUMENT_ROOT'] . "\n\n";

echo "2. Listado de Archivos (Raiz):\n";
try {
    $files = scandir('.');
    foreach ($files as $file) {
        $type = is_dir($file) ? "[DIR ]" : "[FILE]";
        echo "   $type $file\n";
    }
} catch (Exception $e) {
    echo "   [!] Error al listar archivos: " . $e->getMessage() . "\n";
}

echo "\n3. Contenido de assets/:\n";
if (is_dir('assets')) {
    try {
        $assets = scandir('assets');
        foreach ($assets as $asset) {
            echo "   assets/$asset\n";
        }
    } catch (Exception $e) {
        echo "   [!] Error al listar assets: " . $e->getMessage() . "\n";
    }
} else {
    echo "   [!] Directorio assets no encontrado\n";
}

echo "\n4. Prueba de Conexion a Base de Datos:\n";
if (file_exists('config.php')) {
    try {
        @include 'config.php';
        echo "   config.php: Encontrado [OK]\n";
        if (defined('DB_HOST')) {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            echo "   DB STATUS: CONECTADO [OK]\n";
        } else {
            echo "   DB STATUS: Constantes no definidas en config.php [!]\n";
        }
    } catch (Exception $e) {
        echo "   DB STATUS: ERROR [!] - " . $e->getMessage() . "\n";
    }
} else {
    echo "   config.php: NO ENCONTRADO [!]\n";
}
