<?php
$host = 'localhost';
$db   = 'u876493207_upagobd';
$user = 'u876493207_userupago';
$pass = '17080602Diu26*';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "1. Conexión exitosa a la BD.\n";

    // 1. Verificar si hay pagos
    $stmt = $conn->query("SELECT count(*) FROM pagos");
    $count = $stmt->fetchColumn();
    echo "Total de pagos actuales en BD: $count\n";

    // 2. Verificar transacciones bancarias
    $stmt = $conn->query("SELECT count(*) FROM transacciones_bancarias");
    $countT = $stmt->fetchColumn();
    echo "Total de transacciones bancarias en BD: $countT\n";

    // 3. Ejecutar el bot de conciliación
    echo "\nEjecutando proceso de cruce inteligente automático...\n";
    $stmtTx = $conn->query("SELECT * FROM transacciones_bancarias WHERE estado = 'pendiente'");
    $transacciones = $stmtTx->fetchAll(PDO::FETCH_ASSOC);

    $conciliated_count = 0;
    
    foreach ($transacciones as $tx) {
        $stmtPay = $conn->prepare("
            SELECT p.id as pago_id, p.concepto, p.num_comprobante, pos.nombre, pos.apellido, pos.cedula, pos.correo 
            FROM pagos p 
            JOIN postulantes pos ON p.postulante_cedula = pos.cedula 
            WHERE p.estado = 'pendiente' AND p.monto = ?
        ");
        $stmtPay->execute([$tx['monto']]);
        $potential_matches = $stmtPay->fetchAll(PDO::FETCH_ASSOC);

        $best_match = null;
        $best_score = 0;

        foreach ($potential_matches as $pm) {
            $score = 50; // Base
            $tx_desc = strtolower($tx['descripcion'] ?? '');
            $tx_ref = strtolower($tx['referencia'] ?? '');
            $num_comp = strtolower($pm['num_comprobante'] ?? '');
            $cedula = strtolower($pm['cedula'] ?? '');

            if (!empty($num_comp)) {
                if (strpos($tx_desc, $num_comp) !== false || strpos($tx_ref, $num_comp) !== false) {
                    $score += 40;
                }
            }
            if (!empty($cedula)) {
                if (strpos($tx_desc, $cedula) !== false || strpos($tx_ref, $cedula) !== false) {
                    $score += 10;
                }
            }

            if ($score > $best_score) {
                $best_score = $score;
                $best_match = $pm;
            }
        }

        if ($best_match && $best_score >= 80) {
            echo "   -> MATCH PERFECTO (Score: $best_score) -> Pago ID {$best_match['pago_id']} + Transacción {$tx['id']}\n";
            $conciliated_count++;
        } else {
            echo "   -> MATCH INSUFICIENTE para Transacción {$tx['id']} (Mejor Score: $best_score)\n";
        }
    }
    
    echo "\nResumen Final: $conciliated_count pagos conciliados automáticamente.\n";

} catch (PDOException $e) {
    echo "Error de base de datos: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
