<?php
$url = 'https://upago.unamis.edu.py/api.php?registrar_pago';
$data = [
    'postulante_cedula' => '1234567',
    'concepto' => 'Test',
    'monto' => '1000',
    'num_comprobante' => '12345',
    'estado' => 'pendiente',
    'observaciones' => 'Test observation'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));

// We don't have a valid token, but maybe we can see if it fails auth or something else.
// Actually, require_admin() requires a valid JWT token.

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $http_code\n";
echo "Response: $response\n";
