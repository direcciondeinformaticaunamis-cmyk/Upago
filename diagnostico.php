<?php/** * Herramienta de Diagnóstico - Upago UNAMIS */header("Content-Type: text/plain; charset=UTF-8");echo "=== DIAGNÓSTICO DE SISTEMA UPAGO ===\n\n";echo "1. Información del Servidor:\n";echo "   PHP Versión: " . phpversion() . "\n";echo "   Software: " . $_SERVER['SERVER_SOFTWARE'] . "\n";echo "   Raíz: " . $_SERVER['DOCUMENT_ROOT'] . "\n\n";echo "2. Extensiones Requeridas:\n";$extensions = ["pdo", "pdo_mysql", "json", "fileinfo"];foreach ($extensions as $ext) {    echo "   $ext: " . (extension_loaded($ext) ? "Habilitada [OK]" : "NO ENCONTRADA [!] ") . "\n";}echo "\n";echo "3. Prueba de Conexión a Base de Datos:\n";$config_ready = true;require_once 'config.php';$host = DB_HOST;$db_name = DB_NAME;$username = DB_USER;$password = DB_PASS;if (!$db_name || !$username || !$password) {    $config_ready = false;    echo "   STATUS: CONFIGURACION INCOMPLETA [!]\n";    echo "   AYUDA: Verifique el archivo config.php en el servidor.\n";}if ($config_ready) {
echo "\n4. Listado de Archivos (Raiz):\n";
$files = scandir('.');
foreach ($files as $file) {
    echo "   $file\n";
}

echo "\n5. Contenido de assets/:\n";
if (is_dir('assets')) {
    $assets = scandir('assets');
    foreach ($assets as $asset) {
        echo "   assets/$asset\n";
    }
} else {
    echo "   [!] Directorio assets no encontrado\n";
}
