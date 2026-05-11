<?php
/**
 * UNAMIS API - Versión Corregida y Segura
 * Maneja la persistencia y la organización de archivos por carpetas
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'config.php';

$host = DB_HOST;
$db_name = DB_NAME;
$username = DB_USER;
$password = DB_PASS;

if (!$db_name || !$username || !$password) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Configuracion incompleta del servidor Upago. Verifique el archivo config.php."
    ]);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password, [
        PDO::ATTR_TIMEOUT => 5,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    $conn->exec("set names utf8mb4");

    // --- AUTO-INICIALIZACIÓN DE TABLAS ---
    // Tabla Postulantes
    $conn->exec("CREATE TABLE IF NOT EXISTS `postulantes` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `nombre` varchar(100) NOT NULL,
      `apellido` varchar(100) NOT NULL,
      `cedula` varchar(20) NOT NULL,
      `correo` varchar(150) NOT NULL,
      `telefono` varchar(50) DEFAULT NULL,
      `fecha_nacimiento` date DEFAULT NULL,
      `genero` varchar(20) DEFAULT NULL,
      `direccion` text DEFAULT NULL,
      `carrera` varchar(255) DEFAULT NULL,
      `sede` varchar(100) DEFAULT 'Santa Rosa de Lima',
      `tipo_usuario` enum('postulante', 'concursante_docente') DEFAULT 'postulante',
      `foto_url` text DEFAULT NULL,
      `estado_revision` enum('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
      `observaciones` text DEFAULT NULL,
      `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `cedula_unique` (`cedula`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Tabla Expedientes
    $conn->exec("CREATE TABLE IF NOT EXISTS `expedientes` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `postulante_id` varchar(20) NOT NULL,
      `tipo_documento` varchar(100) NOT NULL,
      `archivo_nombre` varchar(255) NOT NULL,
      `archivo_url` text NOT NULL,
      `estado` enum('pendiente', 'subido', 'validado', 'error') DEFAULT 'subido',
      `fecha_carga` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      CONSTRAINT `fk_postulante` FOREIGN KEY (`postulante_id`) REFERENCES `postulantes` (`cedula`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $conn->exec("CREATE TABLE IF NOT EXISTS `pagos` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `postulante_cedula` varchar(20) NOT NULL,
      `concepto` varchar(100) NOT NULL,
      `monto` decimal(12,0) NOT NULL,
      `comprobante_url` text DEFAULT NULL,
      `comprobante_nombre` varchar(255) DEFAULT NULL,
      `num_comprobante` varchar(50) DEFAULT NULL,
      `estado` enum('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
      `observaciones` text DEFAULT NULL,
      `fecha_pago` date DEFAULT NULL,
      `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      CONSTRAINT `fk_pago_postulante` FOREIGN KEY (`postulante_cedula`) REFERENCES `postulantes` (`cedula`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $conn->exec("CREATE TABLE IF NOT EXISTS `aranceles` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `categoria` varchar(100) NOT NULL,
      `concepto` varchar(150) NOT NULL,
      `monto` decimal(12,0) NOT NULL,
      `descripcion` text DEFAULT NULL,
      `activo` tinyint(1) DEFAULT 1,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Limpiar e insertar aranceles por resolución oficial N° 211/2025
    $stmtAranceles = $conn->query("SELECT COUNT(*) FROM `aranceles`");
    if ($stmtAranceles->fetchColumn() == 0) {
        $conn->exec("TRUNCATE TABLE `aranceles`");
        $conn->exec("INSERT INTO `aranceles` (`categoria`, `concepto`, `monto`) VALUES
            ('ACADÉMICOS', 'CERTIFICADO DE ESTUDIOS', 53000),
            ('ACADÉMICOS', 'DIPLOMA DE GRADO Y POSTGRADO', 107000),
            ('ACADÉMICOS', 'PROGRAMAS DE ESTUDIOS POR ASIGNATURA', 35000),
            ('ACADÉMICOS', 'REGISTRO DE DIPLOMA DE GRADO EN EL MEC', 100000),
            ('ACADÉMICOS', 'REGISTRO DE DIPLOMA DE POSTGRADO EN EL MEC', 150000),
            ('ACADÉMICOS', 'ACTIVIDADES ACADÉMICAS (Seminarios, Congresos, Talleres, Charlas y otros)', 0),
            ('ACADÉMICOS', 'TRASLADOS DE ESTUDIANTES ENTRE CARRERAS DE LA UNAMIS', 200000),
            ('ACADÉMICOS', 'TRASLADOS DE ESTUDIANTES DE OTRAS UNIVERSIDADES A LA UNAMIS', 300000),
            ('ACADÉMICOS', 'CONVALIDACIONES DE ASIGNATURA', 150000),
            ('ACADÉMICOS', 'INSCRIPCIÓN DE TÍTULO OBTENIDO EN OTRA UNIVERSIDAD PARAGUAYA O EXTRANJERA EN LA UNAMIS', 300000),
            ('ACADÉMICOS', 'INSCRIPCIÓN A CONCURSO PARA ENCARGADO DE CÁTEDRA (POR ASIGNATURA)', 300000),
            ('ACADÉMICOS', 'EXAMEN DE ADMISIÓN - CARRERA DE MEDICINA (SEDE SAN IGNACIO)', 1000000),
            ('SERVICIOS', 'AUTENTICACIÓN DE DOCUMENTOS', 40000),
            ('SERVICIOS', 'CONSTANCIAS', 30000),
            ('SERVICIOS', 'FOTOCOPIAS DE EXPEDIENTE POR HOJA', 1000)
        ");
    }

    $conn->exec("CREATE TABLE IF NOT EXISTS `transacciones_bancarias` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `banco` varchar(100) NOT NULL,
      `referencia` varchar(100) NOT NULL,
      `monto` decimal(12,0) NOT NULL,
      `fecha_transaccion` date NOT NULL,
      `descripcion` text DEFAULT NULL,
      `estado` enum('pendiente', 'conciliado', 'discrepancia') DEFAULT 'pendiente',
      `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `referencia_unique` (`referencia`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $conn->exec("CREATE TABLE IF NOT EXISTS `conciliaciones` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `pago_id` int(11) NOT NULL,
      `transaccion_bancaria_id` int(11) NOT NULL,
      `usuario_admin` varchar(100) DEFAULT NULL,
      `metodo` enum('automatico', 'manual') DEFAULT 'manual',
      `fecha_conciliacion` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      FOREIGN KEY (`pago_id`) REFERENCES `pagos` (`id`) ON DELETE CASCADE,
      FOREIGN KEY (`transaccion_bancaria_id`) REFERENCES `transacciones_bancarias` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // ------------------------------------

} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "error" => "FALLO DE CONEXIÓN",
        "message" => $exception->getMessage(),
        "db_name" => $db_name,
        "hint" => "Verifique usuario, contraseña y base de datos en api.php"
    ]);
    exit;
}

// Estructura de carpetas para organización de carga
$upload_base = "uploads/";
$folders = [
    "cedula" => "cedulas/",
    "nacimiento" => "nacimientos/",
    "titulo" => "titulos/",
    "estudio" => "certificados/",
    "foto" => "fotos/",
    "otro" => "otros/"
];

// Crear carpetas si no existen (necesita permisos de escritura en Hostinger)
foreach ($folders as $dir) {
    if (!file_exists($upload_base . $dir)) {
        mkdir($upload_base . $dir, 0755, true);
    }
}

$request_uri = $_SERVER['REQUEST_URI'];
$base_path = basename(__FILE__);
$method = $_SERVER['REQUEST_METHOD'];

// Lógica de carga de archivos (Dinamismo por carpeta) CON VALIDACIÓN
if (isset($_FILES['file']) && isset($_POST['type'])) {
    $type = $_POST['type'];
    $postulante_id = $_POST['postulante_id'];
    $target_dir = $upload_base . ($folders[$type] ?? "otros/");
    
    if (!isset($_FILES["file"]) || $_FILES["file"]["error"] !== UPLOAD_ERR_OK) {
        echo json_encode(["status" => "error", "message" => "Error al subir archivo"]);
        exit;
    }
    
    $file_ext = strtolower(pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION));
    $allowed_exts = ['jpg', 'jpeg', 'png', 'pdf'];
    
    if ($_FILES["file"]["size"] > 5 * 1024 * 1024) {
        echo json_encode(["status" => "error", "message" => "Archivo muy grande (máx 5MB)"]);
        exit;
    }
    
    if (!in_array($file_ext, $allowed_exts)) {
        echo json_encode(["status" => "error", "message" => "Tipo de archivo no permitido. Solo: jpg, jpeg, png, pdf"]);
        exit;
    }
    
    $new_filename = $type . "_" . preg_replace('/[^a-zA-Z0-9]/', '', $postulante_id) . "_" . time() . "." . $file_ext;
    $target_file = $target_dir . $new_filename;

    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        $stmt = $conn->prepare("INSERT INTO expedientes (postulante_id, tipo_documento, archivo_nombre, archivo_url) VALUES (?, ?, ?, ?)");
        $stmt->execute([$postulante_id, $type, $new_filename, $target_file]);
        
        echo json_encode(["status" => "success", "path" => $target_file]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al mover el archivo"]);
    }
    exit;
}

// Login de Administrador
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['admin_login'])) {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    
    $user = $data['username'] ?? '';
    $pass = $data['password'] ?? '';
    
    if ($user === ADMIN_USER && $pass === ADMIN_PASS) {
        echo json_encode(["status" => "success", "token" => bin2hex(random_bytes(16)), "nombre" => "Director"]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Credenciales incorrectas"]);
    }
    exit;
}

// --- ACCIONES DE ADMINISTRADOR ---

// Actualizar estado y observaciones
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['update_status'])) {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    
    if (!$data || !isset($data['cedula']) || !isset($data['estado'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Datos incompletos o JSON inválido", "debug" => $raw]);
        exit;
    }

    try {
        $estado = strtolower($data['estado']);
        $observaciones = $data['observaciones'] ?? '';
        $cedula = $data['cedula'];

        $stmt = $conn->prepare("UPDATE postulantes SET estado_revision = ?, observaciones = ? WHERE cedula = ?");
        $stmt->execute([$estado, $observaciones, $cedula]);
        
        echo json_encode([
            "status" => "success", 
            "affected" => $stmt->rowCount(),
            "message" => "Registro actualizado correctamente"
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error DB: " . $e->getMessage()]);
    }
    exit;
}

// ... Rest of api.php content ...
// Traer documentos de un postulante específico
if (isset($_GET['docs'])) {
    $cedula = $_GET['docs'];
    try {
        $stmt = $conn->prepare("SELECT * FROM expedientes WHERE postulante_id = ? ORDER BY fecha_carga DESC");
        $stmt->execute([$cedula]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

// Listado general de postulantes
try {
    $stmt = $conn->prepare("SELECT * FROM postulantes ORDER BY fecha_registro DESC");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
exit;
?>
