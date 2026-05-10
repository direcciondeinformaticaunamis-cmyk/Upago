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
        "message" => "Configuracion incompleta. Defina MIUNAMIS_DB_NAME, MIUNAMIS_DB_USER y MIUNAMIS_DB_PASS."
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

// --- ACCIONES DE ADMINISTRADOR (Mover antes del registro para evitar colisiones) ---

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
        // Normalizar estado a minúsculas para coincidir con el ENUM
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

// Eliminar Documento (y archivo físico)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['delete_doc'])) {
    $doc_id = $_GET['delete_doc'];
    try {
        $stmt = $conn->prepare("SELECT archivo_url FROM expedientes WHERE id = ?");
        $stmt->execute([$doc_id]);
        $doc = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($doc && file_exists($doc['archivo_url'])) {
            unlink($doc['archivo_url']);
        }
        $stmt = $conn->prepare("DELETE FROM expedientes WHERE id = ?");
        $stmt->execute([$doc_id]);
        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

// Eliminar Postulante (Completo)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['delete_postulante'])) {
    $cedula = $_GET['delete_postulante'];
    try {
        $stmt = $conn->prepare("SELECT archivo_url FROM expedientes WHERE postulante_id = ?");
        $stmt->execute([$cedula]);
        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($files as $f) {
            if (file_exists($f['archivo_url'])) unlink($f['archivo_url']);
        }
        $stmt = $conn->prepare("DELETE FROM postulantes WHERE cedula = ?");
        $stmt->execute([$cedula]);
        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

// ==================== ENDPOINTS DE PAGOS ====================

if ($method === 'GET' && isset($_GET['pagos'])) {
    try {
        $stmt = $conn->prepare("SELECT p.*, pos.nombre, pos.apellido 
                               FROM pagos p 
                               LEFT JOIN postulantes pos ON p.postulante_cedula = pos.cedula 
                               ORDER BY p.fecha_registro DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'GET' && isset($_GET['mis-pagos'])) {
    try {
        $cedula = $_GET['mis-pagos'];
        $stmt = $conn->prepare("SELECT * FROM pagos WHERE postulante_cedula = ? ORDER BY fecha_registro DESC");
        $stmt->execute([$cedula]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'GET' && isset($_GET['aranceles'])) {
    try {
        $stmt = $conn->prepare("SELECT * FROM aranceles WHERE activo = 1 ORDER BY categoria, concepto");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'GET' && isset($_GET['stats'])) {
    try {
        $stmt = $conn->prepare("SELECT 
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END), 0) as pendientes,
            COALESCE(SUM(CASE WHEN estado = 'verificado' THEN 1 ELSE 0 END), 0) as verificados,
            COALESCE(SUM(CASE WHEN estado = 'rechazado' THEN 1 ELSE 0 END), 0) as rechazados,
            COALESCE(SUM(CASE WHEN estado = 'verificado' THEN monto ELSE 0 END), 0) as total_recaudado
        FROM pagos");
        $stmt->execute();
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST' && isset($_GET['save_arancel'])) {
    try {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);
        
        if (!$data || !isset($data['categoria']) || !isset($data['concepto']) || !isset($data['monto'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
            exit;
        }

        if (isset($data['id']) && $data['id'] > 0) {
            // Update
            $stmt = $conn->prepare("UPDATE aranceles SET categoria = ?, concepto = ?, monto = ?, descripcion = ?, activo = ? WHERE id = ?");
            $stmt->execute([
                $data['categoria'],
                $data['concepto'],
                $data['monto'],
                $data['descripcion'] ?? '',
                $data['activo'] ?? 1,
                $data['id']
            ]);
            echo json_encode(["status" => "success", "message" => "Arancel actualizado"]);
        } else {
            // Insert
            $stmt = $conn->prepare("INSERT INTO aranceles (categoria, concepto, monto, descripcion, activo) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['categoria'],
                $data['concepto'],
                $data['monto'],
                $data['descripcion'] ?? '',
                $data['activo'] ?? 1
            ]);
            echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST' && isset($_GET['registrar_pago'])) {
    try {
        $cedula = $_POST['postulante_cedula'] ?? '';
        $concepto = $_POST['concepto'] ?? '';
        $monto = $_POST['monto'] ?? 0;
        $num_comprobante = $_POST['num_comprobante'] ?? '';

        if (!$cedula || !$concepto || !is_numeric($monto)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Datos de pago incompletos"]);
            exit;
        }
        
        $target_dir = UPLOAD_BASE . "comprobantes/";
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0755, true);
        }
        
        $comprobante_url = null;
        $comprobante_nombre = null;
        
        if (isset($_FILES['comprobante']) && $_FILES['comprobante']['error'] === UPLOAD_ERR_OK) {
            $file_ext = strtolower(pathinfo($_FILES["comprobante"]["name"], PATHINFO_EXTENSION));
            if ($_FILES["comprobante"]["size"] > MAX_FILE_SIZE || !in_array($file_ext, ALLOWED_EXTENSIONS)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Comprobante no permitido"]);
                exit;
            }

            $comprobante_nombre = $_FILES["comprobante"]["name"];
            $safe_cedula = preg_replace('/[^a-zA-Z0-9]/', '', $cedula);
            $new_filename = "pago_" . $safe_cedula . "_" . time() . "." . $file_ext;
            $target_file = $target_dir . $new_filename;

            if (!move_uploaded_file($_FILES["comprobante"]["tmp_name"], $target_file)) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "No se pudo guardar el comprobante"]);
                exit;
            }

            $comprobante_url = $target_file;
        }
        
        $stmt = $conn->prepare("INSERT INTO pagos (postulante_cedula, concepto, monto, comprobante_url, comprobante_nombre, num_comprobante, fecha_pago) 
                               VALUES (?, ?, ?, ?, ?, ?, CURDATE())");
        $stmt->execute([$cedula, $concepto, $monto, $comprobante_url, $comprobante_nombre, $num_comprobante]);
        
        echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents("php://input");
    $GLOBALS['REQUEST_BODY_CACHE'] = $raw;
    $json = json_decode($raw, true);
    $is_payment_update = isset($_POST['update_pago']) || ($json && isset($json['id'], $json['estado']) && !isset($json['cedula']));

    if ($is_payment_update) {
        try {
            $data = $json ?: $_POST;
            $estado = strtolower($data['estado'] ?? '');
            if (!in_array($estado, ['pendiente', 'verificado', 'rechazado'], true)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Estado de pago invalido"]);
                exit;
            }

            $stmt = $conn->prepare("UPDATE pagos SET estado = ?, observaciones = ? WHERE id = ?");
            $stmt->execute([$estado, $data['observaciones'] ?? '', $data['id']]);

            // Si se verifica, podríamos disparar el envío de correo aquí
            if ($estado === 'verificado') {
                // Mock: send_receipt_notification($data['id']);
            }

            echo json_encode(["status" => "success", "affected" => $stmt->rowCount()]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;
    }

    if (isset($_POST['delete_pago'])) {
        try {
            $id = $_POST['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "ID de pago requerido"]);
                exit;
            }
            
            $stmt = $conn->prepare("SELECT comprobante_url FROM pagos WHERE id = ?");
            $stmt->execute([$id]);
            $pago = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($pago && $pago['comprobante_url'] && file_exists($pago['comprobante_url'])) {
                unlink($pago['comprobante_url']);
            }
            
            $stmt = $conn->prepare("DELETE FROM pagos WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;
    }
}

// --- FIN ACCIONES DE ADMINISTRADOR ---

// Registro de Postulante (Datos Personales)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_FILES['file'])) {
    $raw_body = $GLOBALS['REQUEST_BODY_CACHE'] ?? file_get_contents("php://input");
    $data = json_decode($raw_body, true);
    if (!$data) {
        echo json_encode(["status" => "error", "message" => "Datos inválidos"]);
        exit;
    }

    // Acción para aprobar expediente
    if (isset($data['action']) && $data['action'] === 'approve_expediente') {
        try {
            $stmt = $conn->prepare("UPDATE postulantes SET estado_revision = 'verificado' WHERE cedula = ?");
            $stmt->execute([$data['cedula']]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;
    }
    
    // Normalizar tipo de usuario y campos de correo
    $tipo_usuario = $data['tipoUsuario'] ?? 'postulante';
    $correo = $data['correo'] ?? $data['email'] ?? '';
    $carrera = $data['carrera'] ?? '';
    $sede = $data['sede'] ?? 'Santa Rosa de Lima';
    $telefono = $data['telefono'] ?? null;
    $fecha_nacimiento = $data['fechaNacimiento'] ?? null;
    $genero = $data['genero'] ?? null;
    $direccion = $data['direccion'] ?? null;
    
    $stmt = $conn->prepare("INSERT INTO postulantes (nombre, apellido, cedula, correo, telefono, fecha_nacimiento, genero, direccion, carrera, sede, tipo_usuario) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                            ON DUPLICATE KEY UPDATE nombre=?, apellido=?, correo=?, telefono=?, fecha_nacimiento=?, genero=?, direccion=?, carrera=?, sede=?, tipo_usuario=?");
    $stmt->execute([
        $data['nombre'], $data['apellido'], $data['cedula'], $correo, $telefono, 
        $fecha_nacimiento, $genero, $direccion, $carrera, $sede, $tipo_usuario,
        $data['nombre'], $data['apellido'], $correo, $telefono, 
        $fecha_nacimiento, $genero, $direccion, $carrera, $sede, $tipo_usuario
    ]);
    echo json_encode(["status" => "success", "id" => $data['cedula']]);
    exit;
}

// Consulta de datos (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['test'])) {
        echo json_encode([
            "status" => "connected", 
            "database" => $db_name,
            "php_version" => phpversion(),
            "server" => $_SERVER['SERVER_SOFTWARE']
        ]);
        exit;
    }
    
    // Traer datos de un postulante específico por correo (Login)
    if (isset($_GET['perfil_by_email'])) {
        $email = $_GET['perfil_by_email'];
        try {
            $stmt = $conn->prepare("SELECT * FROM postulantes WHERE correo = ?");
            $stmt->execute([$email]);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;
    }

    // Traer datos de un postulante específico
    if (isset($_GET['perfil'])) {
        $cedula = $_GET['perfil'];
        try {
            $stmt = $conn->prepare("SELECT * FROM postulantes WHERE cedula = ?");
            $stmt->execute([$cedula]);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;
    }

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
    // Traer pagos (puede filtrarse por cédula para el estudiante)
    if (isset($_GET['pagos'])) {
        $cedula = $_GET['pagos'];
        try {
            if ($cedula && $cedula !== 'true') {
                $stmt = $conn->prepare("SELECT * FROM pagos WHERE postulante_cedula = ? ORDER BY fecha_registro DESC");
                $stmt->execute([$cedula]);
            } else {
                // Si es admin, trae todos con datos del postulante
                $stmt = $conn->prepare("SELECT p.*, pos.nombre, pos.apellido 
                                     FROM pagos p 
                                     JOIN postulantes pos ON p.postulante_cedula = pos.cedula 
                                     ORDER BY p.fecha_registro DESC");
                $stmt->execute();
            }
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
}

// ==================== ESTADÍSTICAS FINANCIERAS ====================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['stats_finance'])) {
    try {
        $stats = [];
        
        // Recaudación Hoy
        $stmt = $conn->query("SELECT SUM(monto) as total FROM pagos WHERE DATE(fecha_registro) = CURDATE() AND estado = 'verificado'");
        $stats['recaudacion_hoy'] = (float)($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        // Pagos por Conciliar
        $stmt = $conn->query("SELECT COUNT(*) as total FROM pagos WHERE estado = 'pendiente'");
        $stats['pendientes_conciliar'] = (int)($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        // Estudiantes Registrados Hoy
        $stmt = $conn->query("SELECT COUNT(*) as total FROM postulantes WHERE DATE(fecha_registro) = CURDATE()");
        $stats['registrados_hoy'] = (int)($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        // Tendencia Mensual (Últimos 6 meses)
        $stmt = $conn->query("SELECT DATE_FORMAT(fecha_registro, '%b') as mes, SUM(monto) as total 
                             FROM pagos WHERE estado = 'verificado' 
                             GROUP BY mes ORDER BY MIN(fecha_registro)");
        $stats['tendencia'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($stats);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

// ==================== COLA DE CONCILIACIÓN ====================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['reconciliation_queue'])) {
    try {
        // Traer transacciones bancarias pendientes
        $stmt = $conn->query("SELECT * FROM transacciones_bancarias WHERE estado = 'pendiente' ORDER BY fecha_transaccion DESC");
        $transacciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Traer pagos pendientes del sistema
        $stmt = $conn->query("SELECT p.*, pos.nombre, pos.apellido 
                             FROM pagos p 
                             JOIN postulantes pos ON p.postulante_cedula = pos.cedula 
                             WHERE p.estado = 'pendiente'");
        $pagos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $queue = [];

        foreach ($transacciones as $tx) {
            $best_match = null;
            $max_score = 0;

            foreach ($pagos as $p) {
                $score = 0;
                
                // 1. Monto exacto (50 pts)
                if ((float)$tx['monto'] == (float)$p['monto']) $score += 50;

                // 2. Referencia bancaria en descripción (40 pts)
                // Buscamos el num_comprobante (que el alumno puso en su declaración) 
                // dentro de la descripción del banco.
                if ($p['num_comprobante'] && stripos($tx['descripcion'], $p['num_comprobante']) !== false) {
                    $score += 40;
                }

                // 3. Referencia del banco (Movimiento ID) (30 pts)
                // A veces el alumno pone el ID de movimiento del extracto.
                if ($p['num_comprobante'] && stripos($tx['referencia'], $p['num_comprobante']) !== false) {
                    $score += 30;
                }

                // 4. Nombre/Apellido en descripción (20 pts)
                $fullName = $p['nombre'] . ' ' . $p['apellido'];
                if (stripos($tx['descripcion'], $p['nombre']) !== false || stripos($tx['descripcion'], $p['apellido']) !== false) {
                    $score += 20;
                }
                
                // 5. Cédula en descripción (Pattern Banco Continental) (30 pts)
                if (stripos($tx['descripcion'], $p['postulante_cedula']) !== false) {
                    $score += 30;
                }

                if ($score > $max_score) {
                    $max_score = min(100, $score); // Cap at 100
                    $best_match = [
                        "estudiante" => $fullName,
                        "concepto" => $p['concepto'],
                        "pago_id" => $p['id'],
                        "puntaje" => $max_score
                    ];
                }
            }

            $queue[] = [
                "id" => $tx['id'],
                "monto" => (float)$tx['monto'],
                "fecha" => $tx['fecha_transaccion'],
                "detalle" => $tx['descripcion'],
                "banco" => $tx['banco'],
                "match" => $best_match,
                "estado" => $max_score > 0 ? 'pendiente' : 'discrepancia'
            ];
        }

        echo json_encode($queue);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

// ==================== PROCESAR CONCILIACIÓN ====================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['reconcile'])) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['pago_id'], $data['transaccion_id'])) {
        echo json_encode(["status" => "error", "message" => "Datos de conciliación incompletos"]);
        exit;
    }

    try {
        $conn->beginTransaction();

        // 1. Marcar pago como verificado
        $stmt = $conn->prepare("UPDATE pagos SET estado = 'verificado', observaciones = CONCAT(IFNULL(observaciones,''), ' | Conciliado con TX ID: ', ?) WHERE id = ?");
        $stmt->execute([$data['transaccion_id'], $data['pago_id']]);

        // 2. Marcar transacción como conciliada
        $stmt = $conn->prepare("UPDATE transacciones_bancarias SET estado = 'conciliado' WHERE id = ?");
        $stmt->execute([$data['transaccion_id']]);

        // 3. Registrar en tabla de conciliaciones
        $stmt = $conn->prepare("INSERT INTO conciliaciones (pago_id, transaccion_bancaria_id, metodo) VALUES (?, ?, 'manual')");
        $stmt->execute([$data['pago_id'], $data['transaccion_id']]);

        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Conciliación exitosa"]);
    } catch (Exception $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}
// ==================== BOT AUTO-CONCILIACIÓN ====================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['bot_auto_reconcile'])) {
    try {
        // Ejecutamos la lógica de búsqueda de matches
        // (Reutilizamos la lógica de reconciliation_queue pero para ejecutar)
        $stmt = $conn->query("SELECT * FROM transacciones_bancarias WHERE estado = 'pendiente'");
        $transacciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmt = $conn->query("SELECT p.*, pos.nombre, pos.apellido 
                             FROM pagos p 
                             JOIN postulantes pos ON p.postulante_cedula = pos.cedula 
                             WHERE p.estado = 'pendiente'");
        $pagos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $count = 0;
        foreach ($transacciones as $tx) {
            foreach ($pagos as $p) {
                $score = 0;
                if ((float)$tx['monto'] == (float)$p['monto']) $score += 50;
                if ($p['num_comprobante'] && stripos($tx['descripcion'], $p['num_comprobante']) !== false) $score += 40;
                if ($p['num_comprobante'] && stripos($tx['referencia'], $p['num_comprobante']) !== false) $score += 30;
                if (stripos($tx['descripcion'], $p['nombre']) !== false || stripos($tx['descripcion'], $p['apellido']) !== false) $score += 20;
                if (stripos($tx['descripcion'], $p['postulante_cedula']) !== false) $score += 30;

                if ($score >= 90) { // Umbral de confianza del Bot
                    $conn->beginTransaction();
                    $stmt = $conn->prepare("UPDATE pagos SET estado = 'verificado', observaciones = CONCAT(IFNULL(observaciones,''), ' | Auto-Conciliado por Bot IA') WHERE id = ?");
                    $stmt->execute([$p['id']]);
                    $stmt = $conn->prepare("UPDATE transacciones_bancarias SET estado = 'conciliado' WHERE id = ?");
                    $stmt->execute([$tx['id']]);
                    $stmt = $conn->prepare("INSERT INTO conciliaciones (pago_id, transaccion_bancaria_id, metodo) VALUES (?, ?, 'automatico')");
                    $stmt->execute([$p['id'], $tx['id']]);
                    $conn->commit();
                    $count++;
                    break; // Siguiente transacción
                }
            }
        }
        echo json_encode(["status" => "success", "conciliated_count" => $count]);
    } catch (Exception $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}
?>
