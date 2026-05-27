<?php
require_once "config.php";

$host = DB_HOST;
$db_name = DB_NAME;
$username = DB_USER;
$password = DB_PASS;

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password, [
        PDO::ATTR_TIMEOUT => 5,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    $conn->exec("set names utf8mb4");

    $stmt = $conn->prepare("SELECT id, nombre, apellido, cedula, correo, carrera, sede, tipo_usuario, estado_revision FROM postulantes ORDER BY fecha_registro DESC");
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "COUNT: " . count($res) . "\n";
    foreach ($res as $i => $p) {
        echo ($i + 1) . ") " . $p['nombre'] . " " . $p['apellido'] . " (CI: " . $p['cedula'] . ") - Status: " . $p['estado_revision'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
