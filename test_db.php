<?php
require 'config.php';
try {
    $conn = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME, DB_USER, DB_PASS);
    $stmt = $conn->query('SELECT id, nombre, correo FROM postulantes WHERE correo=\"arecodahiana44@gmail.com\"');
    print_r($stmt->fetchAll());
} catch(Exception $e) { echo $e->getMessage(); }
