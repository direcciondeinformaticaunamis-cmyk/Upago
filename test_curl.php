<?php
require 'config.php';
require 'security.php';

$payload = [
    'id' => 1,
    'correo' => 'admin@unamis.edu.py',
    'rol' => 'admin',
    'nombre' => 'Admin'
];
$token = generate_token($payload);

$ch = curl_init('https://upago.unamis.edu.py/api.php?registrar_pago=1');
curl_setopt($ch, CURLOPT_POST, 1);
$postData = [
    'postulante_cedula' => '1234567',
    'concepto' => 'Test',
    'monto' => '1000',
    'num_comprobante' => '9338535',
    'fecha_pago' => '2026-05-25',
    'token' => $token
];
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$res = curl_exec($ch);
echo 'STATUS: ' . curl_getinfo($ch, CURLINFO_HTTP_CODE) . "\n";
echo 'BODY: ' . $res . "\n";
curl_close($ch);
