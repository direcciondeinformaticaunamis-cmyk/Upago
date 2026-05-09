<?php
/**
 * Herramienta de Diagnóstico MiUNAMIS
 */
header("Content-Type: text/plain; charset=UTF-8");

echo "=== DIAGNÓSTICO DE SISTEMA MIUNAMIS ===\n\n";

echo "1. Información del Servidor:\n";
echo "   PHP Versión: " . phpversion() . "\n";
echo "   Software: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "   Raíz: " . $_SERVER['DOCUMENT_ROOT'] . "\n\n";

echo "2. Extensiones Requeridas:\n";
$extensions = ["pdo", "pdo_mysql", "json", "fileinfo"];
foreach ($extensions as $ext) {
    echo "   $ext: " . (extension_loaded($ext) ? "Habilitada [OK]" : "NO ENCONTRADA [!] ") . "\n";
}
echo "\n";

echo "3. Prueba de Conexión a Base de Datos:\n";
$config_ready = true;
require_once 'config.php';

$host = DB_HOST;
$db_name = DB_NAME;
$username = DB_USER;
$password = DB_PASS;

if (!$db_name || !$username || !$password) {
    $config_ready = false;
    echo "   STATUS: CONFIGURACION INCOMPLETA [!]\n";
    echo "   AYUDA: Defina MIUNAMIS_DB_NAME, MIUNAMIS_DB_USER y MIUNAMIS_DB_PASS.\n";
}

if ($config_ready) {
try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ATTR_ERRMODE_EXCEPTION);
    echo "   Status: CONEXIÓN EXITOSA [OK]\n";
    echo "   Base de Datos: $db_name\n";
    
    // Probar si las tablas existen
    $query = $conn->query("SHOW TABLES LIKE 'postulantes'");
    if ($query->rowCount() > 0) {
        echo "   Tabla 'postulantes': Existe [OK]\n";
        
        // Verificar columnas específicas
        $cols_to_check = ['estado_revision', 'observaciones'];
        foreach ($cols_to_check as $col) {
            $check_col = $conn->query("SHOW COLUMNS FROM `postulantes` LIKE '$col'");
            if ($check_col->rowCount() > 0) {
                echo "     Columna '$col': Existe [OK]\n";
            } else {
                echo "     Columna '$col': NO ENCONTRADA [!] - Ejecute database_schema.sql\n";
            }
        }
    } else {
        echo "   Tabla 'postulantes': NO ENCONTRADA. Asegúrese de importar database_schema.sql [!]\n";
    }
} catch(PDOException $e) {
    echo "   STATUS: FALLO DE CONEXIÓN [!]\n";
    echo "   MENSAJE: " . $e->getMessage() . "\n";
    echo "   AYUDA: Verifique que en Hostinger haya creado la BD y el Usuario, y que la contraseña sea correcta.\n";
}

}

echo "\n4. Permisos de Archivos:\n";
if (is_writable('.')) {
    echo "   Directorio Raíz: Escritura permitida [OK]\n";
} else {
    echo "   Directorio Raíz: NO TIENE PERMISOS DE ESCRITURA [!]\n";
}

if (!is_dir('uploads')) {
    echo "   Carpeta 'uploads': No existe. Se creará al primer intento de carga.\n";
} else if (is_writable('uploads')) {
    echo "   Carpeta 'uploads': Escritura permitida [OK]\n";
} else {
    echo "   Carpeta 'uploads': NO TIENE PERMISOS DE ESCRITURA [!]\n";
}

echo "\n=== FIN DEL DIAGNÓSTICO ===";
?>
