<?php
require 'config.php';

try {
    $conn = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME, DB_USER, DB_PASS);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // TAREA 1: Eliminar usuarios
    $cedulas = ['9988776', '7890123', '4455667'];

    foreach ($cedulas as $cedula) {
        echo "Eliminando CI: $cedula<br>\n";
        $conn->exec("DELETE FROM expedientes WHERE postulante_id = '$cedula'");
        
        $res = $conn->query("SELECT id FROM usuarios WHERE cedula = '$cedula'");
        if ($res && $row = $res->fetch(PDO::FETCH_ASSOC)) {
            $usr_id = $row['id'];
            $conn->exec("DELETE FROM pagos_examen WHERE usuario_id = $usr_id");
            $conn->exec("DELETE FROM datos_academicos WHERE usuario_id = $usr_id");
            $conn->exec("DELETE FROM documentos WHERE usuario_id = $usr_id");
            $conn->exec("DELETE FROM usuarios WHERE id = $usr_id");
        }
        
        $conn->exec("DELETE FROM pagos WHERE postulante_cedula = '$cedula'");
        $conn->exec("DELETE FROM postulantes WHERE cedula = '$cedula'");
    }

    // TAREA 2: Crear nueva inscripción de ejemplo
    echo "Creando nueva inscripción para María González López<br>\n";

    $sql = "INSERT INTO postulantes (nombre, apellido, cedula, correo, telefono, fecha_nacimiento, genero, carrera, sede, direccion) 
            VALUES ('María', 'González López', '3456789', 'maria.gonzalez@gmail.com', '0971-234-567', '1998-03-15', 'Femenino', 'Medicina', 'San Ignacio', 'Ruta 1 km 5, San Ignacio')";
    
    $conn->exec($sql);
    $insert_id = $conn->lastInsertId();
    
    $exp_num = "UNAMIS-2026-REG" . str_pad($insert_id, 4, '0', STR_PAD_LEFT);
    $conn->exec("UPDATE postulantes SET numero_expediente = '$exp_num' WHERE id = $insert_id");
    
    echo "Inscripción creada con éxito. Expediente: $exp_num<br>\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
