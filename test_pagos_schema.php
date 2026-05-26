<?php
require 'config.php';
$conn = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME, DB_USER, DB_PASS);
$stmt = $conn->query('DESCRIBE pagos');
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    echo $row['Field'] . "\n";
}
