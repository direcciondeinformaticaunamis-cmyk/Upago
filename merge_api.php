<?php
$publicApi = file_get_contents('public/api.php');
$rootApi = file_get_contents('api.php');

if (strpos($rootApi, 'stats_finance') !== false) {
    echo "Finance endpoints already exist in root api.php.\n";
    exit(0);
}

// Extraer el bloque financiero desde public/api.php
// Empieza en import_demo_transactions
$startStr = "if (isset(\$_GET['import_demo_transactions'])) {";
$start = strpos($publicApi, $startStr);

if ($start === false) {
    echo "Start marker not found.\n";
    exit(1);
}

// Termina en reconciliation_queue bloque
$endStr = "if (isset(\$_GET['reconciliation_queue'])) {";
$endTemp = strpos($publicApi, $endStr, $start);

if ($endTemp === false) {
    echo "End marker not found.\n";
    exit(1);
}

// Encontrar el final del bloque reconciliation_queue (el exit;)
$exitPos = strpos($publicApi, "exit;", $endTemp);
$end = strpos($publicApi, "}", $exitPos) + 1;

$financeCode = substr($publicApi, $start, $end - $start);

// Insertarlo en api.php antes del bloque de logs o al final del bloque GET
$injectMarker = "if (isset(\$_GET['system_logs'])) {";
$injectPos = strpos($rootApi, $injectMarker);

if ($injectPos === false) {
    // Fallback: insert before the final 404
    $injectMarker = "http_response_code(404);";
    $injectPos = strpos($rootApi, $injectMarker);
    // Find the closing brace of the GET block before the 404
    $injectPos = strrpos(substr($rootApi, 0, $injectPos), "}");
}

$newRootApi = substr($rootApi, 0, $injectPos) . "\n\n    // --- MODULO FINANZAS INYECTADO ---\n    " . $financeCode . "\n\n" . substr($rootApi, $injectPos);

file_put_contents('api.php', $newRootApi);
echo "Finance endpoints injected successfully.\n";
