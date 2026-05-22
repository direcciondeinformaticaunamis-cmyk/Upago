<?php
header("Content-Type: text/plain; charset=UTF-8");
echo "=== UPAGO DATABASE DIAGNOSTIC ===\n\n";

if (!file_exists('config.php')) {
    die("Error: config.php no encontrado.\n");
}

require_once 'config.php';

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $conn = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo "Conexión a BD: OK\n\n";

    echo "1. Columnas de la tabla `postulantes`:\n";
    $q = $conn->query("DESCRIBE `postulantes`");
    $cols = $q->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $col) {
        echo "   - Field: {$col['Field']} | Type: {$col['Type']} | Null: {$col['Null']} | Default: {$col['Default']}\n";
    }
    echo "\n";

    echo "2. Claves foráneas y constraints activos en la BD:\n";
    $qFK = $conn->query("
        SELECT 
            TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM
            INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE
            REFERENCED_TABLE_SCHEMA = '" . DB_NAME . "' AND
            (REFERENCED_TABLE_NAME = 'postulantes' OR TABLE_NAME = 'postulantes')
    ");
    $fks = $qFK->fetchAll(PDO::FETCH_ASSOC);
    if (empty($fks)) {
        echo "   Ninguna clave foránea detectada.\n";
    } else {
        foreach ($fks as $fk) {
            echo "   - Tabla: {$fk['TABLE_NAME']}.{$fk['COLUMN_NAME']} -> Ref: {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']} (Constraint: {$fk['CONSTRAINT_NAME']})\n";
        }
    }
    echo "\n";

    echo "3. Intentando ejecutar migración manual de `tipo_usuario` por si acaso:\n";
    try {
        $conn->exec("ALTER TABLE `postulantes` ADD COLUMN `tipo_usuario` enum('postulante', 'concursante_docente', 'auxiliar_docente') DEFAULT 'postulante'");
        echo "   ALTER TABLE ejecutado con éxito. Columna agregada.\n";
    } catch (Exception $e) {
        echo "   Info/Error al agregar: " . $e->getMessage() . "\n";
    }

} catch (Exception $e) {
    echo "Error de base de datos: " . $e->getMessage() . "\n";
}
?>
