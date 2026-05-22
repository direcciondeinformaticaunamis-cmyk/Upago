<?php
header("Content-Type: text/plain; charset=UTF-8");
echo "=== PRUEBA DE CONEXIÓN A BASE DE DATOS ===\n\n";

if (file_exists('config.php')) {
    require_once 'config.php';
    echo "config.php: Encontrado [OK]\n";
    
    echo "Host: " . DB_HOST . "\n";
    echo "Base de datos: " . DB_NAME . "\n";
    echo "Usuario: " . DB_USER . "\n\n";
    
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5
        ]);
        echo "RESULTADO: ¡CONEXIÓN EXITOSA! [OK]\n\n";
        
        // Consultar tablas existentes
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "Tablas encontradas en la base de datos (" . count($tables) . "):\n";
        foreach ($tables as $table) {
            // Contar registros
            $countStmt = $pdo->query("SELECT COUNT(*) FROM `$table`");
            $count = $countStmt->fetchColumn();
            echo " - $table ($count registros)\n";
        }
    } catch (Exception $e) {
        echo "RESULTADO: ERROR DE CONEXIÓN [!] - " . $e->getMessage() . "\n";
    }
} else {
    echo "ERROR: No se encontró el archivo config.php en la raíz [!]\n";
}
?>
