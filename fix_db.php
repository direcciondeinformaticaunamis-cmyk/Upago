<?php
require 'config.php';

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($mysqli->connect_error) {
    die('Connection Error: ' . $mysqli->connect_error);
}
$mysqli->set_charset('utf8mb4');

// Add missing columns to pagos
$queries = [
    "ALTER TABLE pagos ADD COLUMN IF NOT EXISTS num_comprobante VARCHAR(255) DEFAULT NULL",
    "ALTER TABLE pagos ADD COLUMN IF NOT EXISTS asignatura VARCHAR(255) DEFAULT NULL"
];
foreach ($queries as $q) {
    if ($mysqli->query($q) === TRUE) {
        echo "Success: $q\n";
    } else {
        // If column already exists, MySQL will error; we can ignore duplicate column errors
        if (strpos($mysqli->error, 'Duplicate column name') !== false) {
            echo "Column already exists: $q\n";
        } else {
            echo "Error executing $q: " . $mysqli->error . "\n";
        }
    }
}
$mysqli->close();
?>
