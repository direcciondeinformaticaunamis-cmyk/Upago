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

    $stmt = $conn->prepare("SELECT * FROM postulantes WHERE nombre LIKE '%Mario%'");
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Postulantes in DB:\n";
    print_r($res);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
