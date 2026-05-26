<?php
require_once "api.php";
$stmt = $conn->prepare("SELECT id, cedula, LENGTH(cedula) as len FROM postulantes WHERE nombre LIKE '%Mario%'");
$stmt->execute();
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
