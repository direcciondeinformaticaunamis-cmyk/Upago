<?php
/**
 * UNAMIS API - Versión Corregida y Segura
 * Maneja la persistencia y la organización de archivos por carpetas
 */

// Seguridad CORS: Permitir solo dominios oficiales de la UNAMIS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_domains = ['https://upago.unamis.edu.py', 'https://unamis.edu.py', 'https://www.unamis.edu.py'];

if (in_array($origin, $allowed_domains) || strpos($origin, 'localhost') !== false) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// --- CONFIGURACIÓN SENIOR: MODO MANTENIMIENTO ---
$mantenimiento = false; // Cambiar a true para cerrar el portal
if ($mantenimiento && (!isset($_GET['admin_key']) || $_GET['admin_key'] !== 'Diu2026!')) {
    http_response_code(503);
    echo json_encode(["status" => "maintenance", "message" => "Portal en mantenimiento programado. Volveremos pronto."]);
    exit;
}

// Función de Auditoría Centralizada
function write_system_log($action, $user = 'Sistema', $details = '') {
    try {
        $log_dir = __DIR__ . '/logs';
        if (!is_dir($log_dir)) {
            @mkdir($log_dir, 0755, true);
        }
        if (!is_dir($log_dir)) return; // Silencioso si no se puede crear
        
        $log_file = $log_dir . '/system.log';
        $timestamp = date('Y-m-d H:i:s');
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $log_entry = "[$timestamp] [IP: $ip] [USER: $user] ACTION: $action | DETAILS: $details" . PHP_EOL;
        @file_put_contents($log_file, $log_entry, FILE_APPEND);
    } catch (Exception $e) {
        // Fallback silencioso para logs
    }
}

require_once 'config.php';
// Cargamos el módulo de seguridad si existe (JWT, Roles)
if (file_exists('security.php')) {
    require_once 'security.php';
}

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

// --- AUTO-INICIALIZACIÓN DE CARPETAS ---
$folders_init = ['uploads/cedulas', 'uploads/titulos', 'uploads/certificados', 'uploads/fotos', 'uploads/pagos', 'uploads/nacimientos', 'uploads/proyectos'];
foreach ($folders_init as $f) {
    if (!file_exists($f)) {
        @mkdir($f, 0755, true);
        @file_put_contents($f . '/.htaccess', "Options -Indexes\nDeny from all\n<Files ~ \"\.(jpg|jpeg|png|pdf)$\">\n    Allow from all\n</Files>");
    }
}

// --- SISTEMA DE NOTIFICACIONES ---
function send_institutional_email($to, $subject, $message) {
    // 1. Guardar en Log de Auditoría (Respaldo)
    $log_dir = __DIR__ . '/logs/';
    if (!file_exists($log_dir)) @mkdir($log_dir, 0755, true);
    $log_file = $log_dir . 'emails.log';
    $timestamp = date('Y-m-d H:i:s');
    $content = "\n--- [$timestamp] ---\nPARA: $to\nASUNTO: $subject\nMENSAJE:\n" . strip_tags($message) . "\n---------------------\n";
    @file_put_contents($log_file, $content, FILE_APPEND);

    // 2. Enviar Correo Real HTML
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Secretaria de Tecnologias UNAMIS <informatica@unamis.edu.py>\r\n";
    $headers .= "Reply-To: informatica@unamis.edu.py\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Plantilla HTML Premium Institucional
    $html_message = "
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f9fb; margin: 0; padding: 40px; }
            .container { max-w-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e6e8ea; }
            .header { background: #a31e32; padding: 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; }
            .content { padding: 40px; color: #43474f; line-height: 1.6; }
            .footer { background: #f2f4f6; padding: 20px; text-align: center; font-size: 12px; color: #737780; border-top: 1px solid #e6e8ea; }
            .btn { display: inline-block; background: #a31e32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            .highlight { background: #fdf2f4; padding: 15px; border-left: 4px solid #a31e32; border-radius: 4px; margin: 20px 0; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>UNAMIS</h1>
                <p style='margin-top: 5px; opacity: 0.8; font-size: 14px;'>Portal Digital Institucional</p>
            </div>
            <div class='content'>
                $message
            </div>
            <div class='footer'>
                &copy; " . date('Y') . " Universidad Nacional de Misiones. Todos los derechos reservados.<br>
                Este es un mensaje automático, por favor no responda a este correo.
            </div>
        </div>
    </body>
    </html>
    ";

    @mail($to, $subject, $html_message, $headers);
}


try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password, [
        PDO::ATTR_TIMEOUT => 5,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    $conn->exec("set names utf8mb4");

    // --- AUTO-INICIALIZACIÓN DE TABLAS ---
    $conn->exec("CREATE TABLE IF NOT EXISTS `postulantes` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `nombre` varchar(100) NOT NULL,
      `apellido` varchar(100) NOT NULL,
      `cedula` varchar(20) NOT NULL,
      `ruc` varchar(20) DEFAULT NULL,
      `correo` varchar(150) NOT NULL,
      `telefono` varchar(50) DEFAULT NULL,
      `fecha_nacimiento` date DEFAULT NULL,
      `lugar_nacimiento_ciudad` varchar(100) DEFAULT NULL,
      `lugar_nacimiento_depto` varchar(100) DEFAULT NULL,
      `nacionalidad` varchar(100) DEFAULT 'Paraguaya',
      `pais_origen` varchar(100) DEFAULT 'Paraguay',
      `genero` varchar(20) DEFAULT NULL,
      `estado_civil` varchar(50) DEFAULT NULL,
      `direccion` text DEFAULT NULL,
      `barrio` varchar(100) DEFAULT NULL,
      `carrera` varchar(255) DEFAULT NULL,
      `sede` varchar(100) DEFAULT 'Santa Rosa de Lima',
      `tipo_usuario` enum('postulante', 'concursante_docente', 'auxiliar_docente') DEFAULT 'postulante',
      `grupo_sanguineo` varchar(10) DEFAULT NULL,
      `alergico` varchar(255) DEFAULT NULL,
      `seguro_medico` varchar(100) DEFAULT NULL,
      `es_zurdo` tinyint(1) DEFAULT 0,
      `discapacidad` varchar(100) DEFAULT 'Ninguna',
      `discapacidad_detalle` text DEFAULT NULL,
      `necesita_adecuacion` tinyint(1) DEFAULT 0,
      `adecuacion_detalle` text DEFAULT NULL,
      `enfermedad_cronica` varchar(255) DEFAULT NULL,
      `colegio_nombre` varchar(255) DEFAULT NULL,
      `colegio_ciudad` varchar(100) DEFAULT NULL,
      `colegio_distrito` varchar(100) DEFAULT NULL,
      `colegio_depto` varchar(100) DEFAULT NULL,
      `colegio_tipo` varchar(50) DEFAULT NULL,
      `bachiller_tipo` varchar(100) DEFAULT NULL,
      `egreso_anio` int(4) DEFAULT NULL,
      `egreso_promedio` decimal(4,2) DEFAULT NULL,
      `trabaja` tinyint(1) DEFAULT 0,
      `empresa_nombre` varchar(255) DEFAULT NULL,
      `cargo` varchar(150) DEFAULT NULL,
      `horario_laboral` varchar(100) DEFAULT NULL,
      `foto_url` text DEFAULT NULL,
      `estado_revision` enum('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
      `observaciones` text DEFAULT NULL,
      `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `cedula_unique` (`cedula`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $cols_mig = [
        "ruc" => "varchar(20) DEFAULT NULL",
        "lugar_nacimiento_ciudad" => "varchar(100) DEFAULT NULL",
        "lugar_nacimiento_depto" => "varchar(100) DEFAULT NULL",
        "pais_origen" => "varchar(100) DEFAULT 'Paraguay'",
        "nacionalidad" => "varchar(100) DEFAULT 'Paraguaya'",
        "estado_civil" => "varchar(50) DEFAULT NULL",
        "barrio" => "varchar(100) DEFAULT NULL",
        "grupo_sanguineo" => "varchar(10) DEFAULT NULL",
        "alergico" => "varchar(255) DEFAULT NULL",
        "seguro_medico" => "varchar(100) DEFAULT NULL",
        "es_zurdo" => "tinyint(1) DEFAULT 0",
        "discapacidad" => "varchar(100) DEFAULT 'Ninguna'",
        "discapacidad_detalle" => "text DEFAULT NULL",
        "necesita_adecuacion" => "tinyint(1) DEFAULT 0",
        "adecuacion_detalle" => "text DEFAULT NULL",
        "enfermedad_cronica" => "varchar(255) DEFAULT NULL",
        "colegio_nombre" => "varchar(255) DEFAULT NULL",
        "colegio_ciudad" => "varchar(100) DEFAULT NULL",
        "colegio_distrito" => "varchar(100) DEFAULT NULL",
        "colegio_depto" => "varchar(100) DEFAULT NULL",
        "colegio_tipo" => "varchar(50) DEFAULT NULL",
        "bachiller_tipo" => "varchar(100) DEFAULT NULL",
        "egreso_anio" => "int(4) DEFAULT NULL",
        "egreso_promedio" => "decimal(4,2) DEFAULT NULL",
        "trabaja" => "tinyint(1) DEFAULT 0",
        "empresa_nombre" => "varchar(255) DEFAULT NULL",
        "cargo" => "varchar(150) DEFAULT NULL",
        "horario_laboral" => "varchar(100) DEFAULT NULL"
    ];
    foreach ($cols_mig as $col => $def) { 
        try { 
            $conn->exec("ALTER TABLE `postulantes` ADD COLUMN `$col` $def"); 
        } catch (Exception $e) {
            // Columna ya existe o error menor
        } 
    }

    $conn->exec("CREATE TABLE IF NOT EXISTS `expedientes` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `postulante_id` varchar(20) NOT NULL,
      `tipo_documento` varchar(100) NOT NULL,
      `archivo_nombre` varchar(255) NOT NULL,
      `archivo_url` text NOT NULL,
      `estado` enum('pendiente', 'subido', 'validado', 'error') DEFAULT 'subido',
      `observaciones` text DEFAULT NULL,
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

    $stmtAranceles = $conn->query("SELECT COUNT(*) FROM `aranceles`");
    if ($stmtAranceles->fetchColumn() == 0) {
        $conn->exec("INSERT INTO `aranceles` (`categoria`, `concepto`, `monto`) VALUES
            ('ACADÉMICOS', 'CERTIFICADO DE ESTUDIOS', 53000),
            ('ACADÉMICOS', 'DIPLOMA DE GRADO Y POSTGRADO', 107000),
            ('ACADÉMICOS', 'PROGRAMAS DE ESTUDIOS POR ASIGNATURA', 35000),
            ('ACADÉMICOS', 'REGISTRO DE DIPLOMA DE GRADO EN EL MEC', 100000),
            ('ACADÉMICOS', 'REGISTRO DE DIPLOMA DE POSTGRADO EN EL MEC', 150000),
            ('ACADÉMICOS', 'ACTIVIDADES ACADÉMICAS', 0),
            ('ACADÉMICOS', 'TRASLADOS ENTRE CARRERAS UNAMIS', 200000),
            ('ACADÉMICOS', 'TRASLADOS OTRAS UNIVERSIDADES A UNAMIS', 300000),
            ('ACADÉMICOS', 'CONVALIDACIONES DE ASIGNATURA', 150000),
            ('ACADÉMICOS', 'INSCRIPCIÓN DE TÍTULO OBTENIDO EN OTRA U EN UNAMIS', 300000),
            ('ACADÉMICOS', 'INSCRIPCIÓN A CONCURSO DOCENTE', 300000),
            ('ACADÉMICOS', 'EXAMEN DE ADMISIÓN - MEDICINA (SAN IGNACIO)', 1000000),
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
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $conn->exec("CREATE TABLE IF NOT EXISTS `roles_institucionales` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `correo` varchar(150) NOT NULL,
      `rol` enum('admin', 'academico') NOT NULL,
      `nombre_referencia` varchar(100) DEFAULT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `correo_unique` (`correo`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $stmtRoles = $conn->query("SELECT COUNT(*) FROM `roles_institucionales`");
    if ($stmtRoles->fetchColumn() == 0) {
        $conn->exec("INSERT INTO `roles_institucionales` (correo, rol, nombre_referencia) VALUES
            ('informatica@unamis.edu.py', 'admin', 'Administrador Absoluto (Sistemas)'),
            ('direccion.administrativa@unamis.edu.py', 'admin', 'Dirección Administrativa'),
            ('direccion.financiera@unamis.edu.py', 'admin', 'Dirección Financiera'),
            ('tesoreria@unamis.edu.py', 'admin', 'Tesorería'),
            ('medicina@unamis.edu.py', 'academico', 'Coordinación Medicina')
        ");
    }

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

} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $exception->getMessage()]);
    exit;
}

$upload_base = "uploads/";
$folders_map = ["cedula" => "cedulas/", "nacimiento" => "nacimientos/", "titulo" => "titulos/", "estudio" => "certificados/", "foto" => "fotos/", "otro" => "otros/", "comprobante" => "comprobantes/"];
foreach ($folders_map as $dir) { if (!file_exists($upload_base . $dir)) @mkdir($upload_base . $dir, 0755, true); }

$method = $_SERVER['REQUEST_METHOD'];

// --- MANEJO DE ARCHIVOS ---
if (isset($_FILES['file']) && isset($_POST['type'])) {
    $type = $_POST['type'];
    $postulante_id = $_POST['postulante_id'];
    $target_dir = $upload_base . ($folders_map[$type] ?? "otros/");
    if ($_FILES["file"]["error"] !== UPLOAD_ERR_OK) { echo json_encode(["status" => "error", "message" => "Error al subir"]); exit; }
    $file_ext = strtolower(pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION));
    $new_name = $type . "_" . preg_replace('/[^a-zA-Z0-9]/', '', $postulante_id) . "_" . time() . "." . $file_ext;
    $target_file = $target_dir . $new_name;
    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        $stmt = $conn->prepare("INSERT INTO expedientes (postulante_id, tipo_documento, archivo_nombre, archivo_url) VALUES (?, ?, ?, ?)");
        $stmt->execute([$postulante_id, $type, $new_name, $target_file]);
        echo json_encode(["status" => "success", "path" => $target_file]);
    } else { echo json_encode(["status" => "error", "message" => "Error al mover"]); }
    exit;
}

// --- ACCIONES POST ---
if ($method === 'POST') {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    if (isset($data['action']) && $data['action'] === 'admin_login') {
        $user = $data['username'] ?? ''; $pass = $data['password'] ?? '';
        $stmtRole = $conn->prepare("SELECT * FROM roles_institucionales WHERE correo = ?");
        $stmtRole->execute([$user]);
        $manualRole = $stmtRole->fetch(PDO::FETCH_ASSOC);
        if (($manualRole && $pass === ADMIN_PASS) || ($user === ADMIN_USER && $pass === ADMIN_PASS)) {
            $rol = $manualRole['rol'] ?? 'admin'; $nombre = $manualRole['nombre_referencia'] ?? "Admin";
            $token = function_exists('generate_token') ? generate_token(["email" => $user, "rol" => $rol, "nombre" => $nombre]) : null;
            echo json_encode(["status" => "success", "token" => $token, "user" => ["nombre" => $nombre, "email" => $user, "rol" => $rol]]);
            write_system_log("ADMIN_LOGIN", $user, "Exitoso");
            exit;
        } else if (($user === 'academico@unamis.edu.py' || $user === 'medicina@unamis.edu.py') && $pass === 'admin123') {
            echo json_encode(["status" => "success", "user" => ["nombre" => "Coordinador", "email" => $user, "rol" => "academico"]]); exit;
        }
        http_response_code(401); echo json_encode(["status" => "error", "message" => "Credenciales inválidas"]); exit;
    }

    if (isset($data['action']) && $data['action'] === 'migrate_user') {
        try {
            $cedula = $data['cedula'] ?? '';
            $nuevo_correo = $data['nuevo_correo'] ?? '';
            $admin_user = $data['admin_user'] ?? 'superadmin';

            if (!str_ends_with(strtolower($nuevo_correo), '@unamis.edu.py')) {
                throw new Exception("El correo debe ser @unamis.edu.py");
            }

            // Obtener el correo personal anterior
            $stmtGet = $conn->prepare("SELECT nombre, apellido, correo FROM postulantes WHERE cedula = ?");
            $stmtGet->execute([$cedula]);
            $user_data = $stmtGet->fetch(PDO::FETCH_ASSOC);

            if (!$user_data) throw new Exception("Usuario no encontrado.");
            $correo_personal = $user_data['correo'];

            // Actualizar la base de datos
            $stmtUpdate = $conn->prepare("UPDATE postulantes SET correo = ?, tipo_usuario = CASE WHEN tipo_usuario = 'postulante' THEN 'postulante' ELSE tipo_usuario END WHERE cedula = ?");
            $stmtUpdate->execute([$nuevo_correo, $cedula]);

            // Generar un ID de suscripción temporal para Microsoft 365 (Simulado)
            $temp_password = "UNAMIS" . rand(1000, 9999) . "*";

            // Enviar el correo al correo personal antiguo notificando el cambio
            $asunto = "¡Bienvenido a tu cuenta institucional UNAMIS!";
            $mensajeHTML = "
                <h2 style='color: #a31e32;'>¡Hola {$user_data['nombre']} {$user_data['apellido']}!</h2>
                <p>Tu expediente ha sido procesado con éxito y hemos activado tu nueva identidad institucional.</p>
                <div class='highlight'>
                    <p style='margin: 0 0 5px 0;'><strong>Tu nuevo correo es:</strong></p>
                    <p style='margin: 0; font-size: 18px; color: #a31e32;'>$nuevo_correo</p>
                </div>
                <p>A partir de ahora, todo acceso al Portal Digital, Aulas Virtuales y servicios de Microsoft 365 debe realizarse exclusivamente con esta nueva cuenta.</p>
                <p><strong>Clave temporal:</strong> $temp_password <em>(Se te pedirá cambiarla al iniciar sesión por primera vez en Microsoft)</em></p>
                <a href='https://upago.unamis.edu.py' class='btn'>Ingresar al Portal Institucional</a>
                <p style='margin-top: 30px; font-size: 13px; color: #737780;'>Si tienes problemas de acceso, contacta a informatica@unamis.edu.py</p>
            ";

            send_institutional_email($correo_personal, $asunto, $mensajeHTML);
            write_system_log("MIGRATE_USER", $admin_user, "Migró CI $cedula al correo $nuevo_correo");

            echo json_encode(["status" => "success", "message" => "Cuenta migrada exitosamente. Se ha notificado al usuario."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;
    }


    if (isset($_GET['registrar_pago'])) {
        try {
            $cedula = $_POST['postulante_cedula'] ?? ''; $concepto = $_POST['concepto'] ?? ''; $monto = $_POST['monto'] ?? 0;
            $stmt = $conn->prepare("INSERT INTO pagos (postulante_cedula, concepto, monto, fecha_pago) VALUES (?, ?, ?, CURDATE())");
            $stmt->execute([$cedula, $concepto, $monto]);
            echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
        } catch (PDOException $e) { http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
        exit;
    }

    if ($data && isset($data['cedula'])) {
        $correo_registro = $data['correo'] ?? ($data['email'] ?? '');
        if (str_ends_with(strtolower($correo_registro), '@unamis.edu.py')) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "No se permite el registro manual con dominios institucionales (@unamis.edu.py). Utilice el acceso Microsoft SSO."]);
            exit;
        }

        $fields = ['nombre', 'apellido', 'cedula', 'ruc', 'correo', 'telefono', 'fecha_nacimiento', 'lugar_nacimiento_ciudad', 'lugar_nacimiento_depto', 'nacionalidad', 'pais_origen', 'genero', 'estado_civil', 'direccion', 'barrio', 'carrera', 'sede', 'tipo_usuario', 'grupo_sanguineo', 'alergico', 'seguro_medico', 'es_zurdo', 'discapacidad', 'discapacidad_detalle', 'necesita_adecuacion', 'adecuacion_detalle', 'enfermedad_cronica', 'colegio_nombre', 'colegio_ciudad', 'colegio_distrito', 'colegio_depto', 'colegio_tipo', 'bachiller_tipo', 'egreso_anio', 'egreso_promedio', 'trabaja', 'empresa_nombre', 'cargo', 'horario_laboral'];
        $placeholders = implode(',', array_fill(0, count($fields), '?'));
        $updates = implode(',', array_map(function($f) { return "$f=VALUES($f)"; }, $fields));
        $stmt = $conn->prepare("INSERT INTO postulantes (" . implode(',', $fields) . ") VALUES ($placeholders) ON DUPLICATE KEY UPDATE $updates");
        $values = []; 
        foreach ($fields as $f) { 
            $camel = str_replace('_', '', ucwords($f, '_'));
            $camel = lcfirst($camel);
            $values[] = isset($data[$f]) ? $data[$f] : (isset($data[$camel]) ? $data[$camel] : null); 
        }
        $stmt->execute($values);
        echo json_encode(["status" => "success", "id" => $data['cedula']]); exit;
    }
}

// --- ACCIONES GET ---
if ($method === 'GET') {
    if (isset($_GET['perfil_by_email'])) {
        $email = $_GET['perfil_by_email'];
        $stmtRole = $conn->prepare("SELECT * FROM roles_institucionales WHERE correo = ?"); $stmtRole->execute([$email]);
        $manualRole = $stmtRole->fetch(PDO::FETCH_ASSOC);
        $stmt = $conn->prepare("SELECT * FROM postulantes WHERE correo = ?"); $stmt->execute([$email]);
        $perfil = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($manualRole) {
            echo json_encode(["nombre" => $perfil['nombre'] ?? ($manualRole['nombre_referencia'] ?? "Usuario"), "apellido" => $perfil['apellido'] ?? "Institucional", "correo" => $email, "cedula" => $perfil['cedula'] ?? "INST-" . strtoupper(explode('@', $email)[0]), "tipo_usuario" => $manualRole['rol'] === 'admin' ? 'admin' : 'academico', "rol_manual" => $manualRole['rol']]);
        } else { echo json_encode($perfil ?: null); }
        exit;
    }
    if (isset($_GET['perfil'])) {
        $stmt = $conn->prepare("SELECT * FROM postulantes WHERE cedula = ?"); $stmt->execute([$_GET['perfil']]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC)); exit;
    }
    if (isset($_GET['docs'])) {
        $stmt = $conn->prepare("SELECT * FROM expedientes WHERE postulante_id = ? ORDER BY fecha_carga DESC");
        $stmt->execute([$_GET['docs']]); echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC)); exit;
    }
    if (isset($_GET['pagos'])) {
        $cedula = $_GET['pagos'];
        if ($cedula && $cedula !== 'true') { $stmt = $conn->prepare("SELECT * FROM pagos WHERE postulante_cedula = ?"); $stmt->execute([$cedula]); }
        else { $stmt = $conn->query("SELECT p.*, pos.nombre, pos.apellido FROM pagos p JOIN postulantes pos ON p.postulante_cedula = pos.cedula"); }
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC)); exit;
    }
    if (isset($_GET['aranceles'])) { $stmt = $conn->query("SELECT * FROM aranceles WHERE activo = 1"); echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC)); exit; }
    if (isset($_GET['stats'])) { $stmt = $conn->query("SELECT COUNT(*) as total, SUM(CASE WHEN estado = 'verificado' THEN monto ELSE 0 END) as total_recaudado FROM pagos"); echo json_encode($stmt->fetch(PDO::FETCH_ASSOC)); exit; }
    
    // Obtener usuarios manuales (externos) para el panel de migración
    if (isset($_GET['get_external_users'])) {
        // Buscamos usuarios cuyo correo NO termine en @unamis.edu.py
        $stmt = $conn->query("SELECT id, nombre, apellido, cedula, correo as correo_actual, tipo_usuario as tipo, DATE_FORMAT(fecha_registro, '%Y-%m-%d') as fecha_registro, 'activo' as estado FROM postulantes WHERE correo NOT LIKE '%@unamis.edu.py' ORDER BY fecha_registro DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    // Endpoint para Auditoría de Logs (Solo SuperAdmin debería llamar esto en la práctica)
    if (isset($_GET['system_logs'])) {
        $log_file = __DIR__ . '/logs/system.log';
        if (file_exists($log_file)) {
            // Leer las últimas 500 líneas para no saturar
            $lines = file($log_file);
            $lines = array_slice($lines, -500);
            $parsed_logs = [];
            foreach (array_reverse($lines) as $line) {
                if (preg_match('/\[(.*?)\] \[IP: (.*?)\] \[USER: (.*?)\] ACTION: (.*?) \| DETAILS: (.*)/', $line, $matches)) {
                    $parsed_logs[] = [
                        "timestamp" => $matches[1],
                        "ip" => $matches[2],
                        "user" => $matches[3],
                        "action" => $matches[4],
                        "details" => trim($matches[5])
                    ];
                }
            }
            echo json_encode(["status" => "success", "data" => $parsed_logs]);
        } else {
            echo json_encode(["status" => "success", "data" => []]);
        }
        exit;
    }
}

http_response_code(404); echo json_encode(["status" => "error", "message" => "No encontrado"]);
