<?php
/**
 * Banco de Proyectos API - Upago UNAMIS
 * Handles projects, evaluations, and versioning.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Global Error Handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error PHP: [$errno] $errstr",
        "file" => $errfile,
        "line" => $errline
    ]);
    exit;
});

require_once 'config.php';
// Módulo de seguridad para validar tokens JWT
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

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password, [
        PDO::ATTR_TIMEOUT => 5,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    $conn->exec("set names utf8mb4");

    // --- AUTO-INICIALIZACIÓN DE TABLAS SI NO EXISTEN ---
    $sql = file_get_contents('banco_proyectos_schema.sql');
    if ($sql) {
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        foreach ($statements as $stmt_sql) {
            if ($stmt_sql) $conn->exec($stmt_sql);
        }
    }

    // --- CARPETAS DE CARGA ---
    $upload_base = "uploads/proyectos/";
    if (!file_exists($upload_base)) {
        mkdir($upload_base, 0755, true);
    }

} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "FALLO DE CONEXIÓN: " . $exception->getMessage()
    ]);
    exit;
}

$action = $_GET['action'] ?? '';

// Seguridad: Requerir autenticación para acciones de escritura/modificación
$write_actions = ['save_project', 'upload_file', 'save_evaluation', 'add_comment', 'add_version'];
if (in_array($action, $write_actions) && function_exists('get_authorized_user')) {
    $user = get_authorized_user();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "No autorizado. Sesión inválida o expirada."]);
        exit;
    }
}

switch ($action) {
    case 'save_project':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') break;
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            echo json_encode(["status" => "error", "message" => "Datos inválidos"]);
            exit;
        }

        try {
            $stmt = $conn->prepare("INSERT INTO banco_proyectos (titulo, resumen, tipo_proyecto, sede, carrera, anio_academico, presupuesto_estimado, moneda, modalidad) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['titulo'], $data['resumen'], $data['tipo_proyecto'], $data['sede'], 
                $data['carrera'], $data['anio_academico'], $data['presupuesto_estimado'] ?? 0, 
                $data['moneda'] ?? 'PYG', $data['modalidad'] ?? 'presencial'
            ]);
            $project_id = $conn->lastInsertId();

            // Insert members if provided
            if (isset($data['miembros']) && is_array($data['miembros'])) {
                $m_stmt = $conn->prepare("INSERT INTO proyecto_miembros (proyecto_id, nombre_completo, rol_en_proyecto, correo, telefono) VALUES (?, ?, ?, ?, ?)");
                foreach ($data['miembros'] as $m) {
                    $m_stmt->execute([$project_id, $m['nombre'], $m['rol'], $m['correo'] ?? null, $m['telefono'] ?? null]);
                }
            }

            echo json_encode(["status" => "success", "id" => $project_id]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;

    case 'upload_file':
        if (!isset($_FILES['file']) || !isset($_GET['id'])) {
            echo json_encode(["status" => "error", "message" => "Datos de carga insuficientes"]);
            exit;
        }

        $id = $_GET['id'];
        $type = $_GET['type'] ?? 'documento';
        $target_dir = "uploads/proyectos/";
        $file_ext = strtolower(pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION));
        
        // Seguridad: Lista blanca de extensiones para evitar RCE
        $allowed_exts = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar'];
        if (!in_array($file_ext, $allowed_exts)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Tipo de archivo no permitido."]);
            exit;
        }
        $new_filename = "proj_" . $id . "_" . $type . "_" . time() . "." . $file_ext;
        $target_file = $target_dir . $new_filename;

        if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
            // Update project record
            if ($type === 'resolucion') {
                $stmt = $conn->prepare("UPDATE banco_proyectos SET archivo_resolucion_url = ?, resolucion_nro = ? WHERE id = ?");
                $stmt->execute([$target_file, $_GET['nro'] ?? '', $id]);
            }
            echo json_encode(["status" => "success", "url" => $target_file]);
        } else {
            echo json_encode(["status" => "error", "message" => "Error al subir archivo"]);
        }
        exit;

    case 'save_evaluation':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['proyecto_id'])) {
            echo json_encode(["status" => "error", "message" => "Datos inválidos"]);
            exit;
        }

        try {
            $stmt = $conn->prepare("INSERT INTO proyecto_evaluaciones (proyecto_id, evaluador_nombre, puntaje_total, comentarios, estado_evaluacion) VALUES (?, ?, ?, ?, 'completada')");
            $stmt->execute([
                $data['proyecto_id'],
                $data['evaluador_nombre'] ?? 'Director',
                $data['puntaje'],
                $data['observaciones']
            ]);
            
            // Auto-update project status if score is high
            if ($data['puntaje'] >= 7) {
                $conn->prepare("UPDATE banco_proyectos SET estado = 'aprobado' WHERE id = ?")->execute([$data['proyecto_id']]);
            }

            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;

    case 'add_comment':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['proyecto_id'])) {
            echo json_encode(["status" => "error", "message" => "Datos inválidos"]);
            exit;
        }

        try {
            $stmt = $conn->prepare("INSERT INTO proyecto_comentarios (proyecto_id, usuario_nombre, comentario) VALUES (?, ?, ?)");
            $stmt->execute([
                $data['proyecto_id'],
                $data['usuario_nombre'] ?? 'Usuario Actual',
                $data['comentario']
            ]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;

    case 'add_version':
        if (!isset($_FILES['file']) || !isset($_GET['proyecto_id'])) {
            echo json_encode(["status" => "error", "message" => "Faltan archivos o ID"]);
            exit;
        }

        $proj_id = $_GET['proyecto_id'];
        $version = $_GET['version'] ?? '1.0';
        $cambios = $_GET['cambios'] ?? '';
        
        $target_dir = "uploads/proyectos/versiones/";
        if (!file_exists($target_dir)) mkdir($target_dir, 0755, true);
        
        $file_ext = strtolower(pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION));
        
        // Seguridad: Lista blanca de extensiones para evitar RCE
        $allowed_exts = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar'];
        if (!in_array($file_ext, $allowed_exts)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Tipo de archivo no permitido para versiones."]);
            exit;
        }
        $new_filename = "v_" . $proj_id . "_" . str_replace('.', '_', $version) . "_" . time() . "." . $file_ext;
        $target_path = $target_dir . $new_filename;

        if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_path)) {
            $stmt = $conn->prepare("INSERT INTO proyecto_versiones (proyecto_id, version, cambios, archivo_url) VALUES (?, ?, ?, ?)");
            $stmt->execute([$proj_id, $version, $cambios, $target_path]);
            echo json_encode(["status" => "success", "url" => $target_path]);
        } else {
            echo json_encode(["status" => "error", "message" => "Error al guardar versión"]);
        }
        exit;

    case 'get_projects':
        try {
            $query = "SELECT * FROM banco_proyectos ORDER BY fecha_registro DESC";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;

    case 'get_project_detail':
        $id = $_GET['id'] ?? null;
        if (!$id) exit;
        try {
            $stmt = $conn->prepare("SELECT * FROM banco_proyectos WHERE id = ?");
            $stmt->execute([$id]);
            $project = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($project) {
                // Get members
                $m_stmt = $conn->prepare("SELECT * FROM proyecto_miembros WHERE proyecto_id = ?");
                $m_stmt->execute([$id]);
                $project['miembros'] = $m_stmt->fetchAll(PDO::FETCH_ASSOC);

                // Get versions
                $v_stmt = $conn->prepare("SELECT * FROM proyecto_versiones WHERE proyecto_id = ? ORDER BY fecha_subida DESC");
                $v_stmt->execute([$id]);
                $project['versiones'] = $v_stmt->fetchAll(PDO::FETCH_ASSOC);

                // Fetch Comments
                $c_stmt = $conn->prepare("SELECT id, proyecto_id, usuario_nombre, comentario, es_privado, fecha_comentario AS fecha FROM proyecto_comentarios WHERE proyecto_id = ? ORDER BY fecha_comentario DESC");
                $c_stmt->execute([$id]);
                $project['comentarios'] = $c_stmt->fetchAll(PDO::FETCH_ASSOC);

                // Fetch Evaluations
                $e_stmt = $conn->prepare("SELECT id, proyecto_id, evaluador_nombre, puntaje_total AS puntaje, comentarios AS observaciones, estado_evaluacion, fecha_evaluacion AS fecha FROM proyecto_evaluaciones WHERE proyecto_id = ? ORDER BY fecha_evaluacion DESC");
                $e_stmt->execute([$id]);
                $project['evaluaciones'] = $e_stmt->fetchAll(PDO::FETCH_ASSOC);

                // Generate DOI if missing and project is approved (Mock)
                if (empty($project['doi']) && $project['estado'] === 'aprobado') {
                    $doi = "10.UNAMIS/" . str_pad($project['id'], 6, '0', STR_PAD_LEFT);
                    $project['doi'] = $doi;
                    $conn->prepare("UPDATE banco_proyectos SET doi = ? WHERE id = ?")->execute([$doi, $id]);
                }

                // Generate Unique Code (Mock)
                if (empty($project['codigo_unico'])) {
                    $code = "UNAMIS-PROY-" . date('Y') . "-" . str_pad($project['id'], 4, '0', STR_PAD_LEFT);
                    $project['codigo_unico'] = $code;
                    $conn->prepare("UPDATE banco_proyectos SET codigo_unico = ? WHERE id = ?")->execute([$code, $id]);
                }

                // Generate APA Citation
                $authors = array_map(function($m) { return $m['nombre_completo']; }, $project['miembros']);
                $author_str = count($authors) > 0 ? implode(', ', $authors) : "Autor Anónimo";
                $project['cita_apa'] = "$author_str (" . $project['anio_academico'] . "). " . $project['titulo'] . ". Universidad Nacional de Misiones. " . ($project['doi'] ? "DOI: " . $project['doi'] : "");
                
                // BibTeX
                $bib_id = "unamis_" . $project['id'];
                $project['cita_bibtex'] = "@article{{$bib_id},\n  author = {{$author_str}},\n  title = {{$project['titulo']}},\n  year = {{$project['anio_academico']}},\n  publisher = {{Universidad Nacional de Misiones}},\n  doi = {{$project['doi']}}\n}";
            }

            echo json_encode($project);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;

    case 'stats':
        try {
            $stats = [];
            
            // Total by type
            $stmt = $conn->query("SELECT tipo_proyecto, COUNT(*) as total FROM banco_proyectos GROUP BY tipo_proyecto");
            $stats['by_type'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Total by campus
            $stmt = $conn->query("SELECT sede, COUNT(*) as total FROM banco_proyectos GROUP BY sede");
            $stats['by_campus'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Recent activity
            $stmt = $conn->query("SELECT titulo, tipo_proyecto, fecha_registro FROM banco_proyectos ORDER BY fecha_registro DESC LIMIT 5");
            $stats['recent'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($stats);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;

    default:
        echo json_encode(["status" => "error", "message" => "Acción no válida"]);
        break;
}
?>
