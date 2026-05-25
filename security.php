<?php
/**
 * UNAMIS Security Module - Upago
 * Centralized Token Validation
 */

require_once 'config.php';

if (!defined('JWT_SECRET')) {
    define('JWT_SECRET', 'Fallback_Secret_Please_Set_In_Config_PHP_854fd509c152425c1b9f9eab4d8bc1c5645d48a8ed19385a0c55d28afc05147c0b03a50352f3658c3f2dd4f370046');
}

function get_jwt_secret() {
    $secret = defined('JWT_SECRET') ? JWT_SECRET : '';
    if ($secret === '') {
        return 'Fallback_Secret_Please_Set_In_Config_PHP_854fd509c152425c1b9f9eab4d8bc1c5645d48a8ed19385a0c55d28afc05147c0b03a50352f3658c3f2dd4f370046';
    }
    return $secret;
}

function generate_token($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (60 * 60 * 24); // 24 horas
    $payload_json = json_encode($payload);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload_json));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, get_jwt_secret(), true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function get_authorized_user() {
    $headers = getallheaders();
    $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (empty($auth_header)) {
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
    }
    
    // ALTERNATIVA: Buscar el token en el cuerpo de la petición (POST)
    if (empty($auth_header)) {
        global $data;
        if (isset($data['token'])) {
            $auth_header = 'Bearer ' . $data['token'];
        } else {
            $raw_input = file_get_contents('php://input');
            $decoded = json_decode($raw_input, true);
            if (isset($decoded['token'])) {
                $auth_header = 'Bearer ' . $decoded['token'];
            }
        }
    }
    
    // ALTERNATIVA: Buscar el token en la query string (GET) para descargas de archivos
    if (empty($auth_header) && isset($_GET['token'])) {
        $auth_header = 'Bearer ' . $_GET['token'];
    }
    
    if (strpos($auth_header, 'Bearer ') !== 0) return null;
    
    $token = substr($auth_header, 7);
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    list($header, $payload, $signature) = $parts;
    
    $valid_signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', "$header.$payload", get_jwt_secret(), true)));
    
    if ($signature !== $valid_signature) return null;
    
    $data = json_decode(base64_decode($payload), true);
    if (!$data || (isset($data['exp']) && time() > $data['exp'])) return null;
    
    return $data;
}

function require_admin($required_role = null) {
    $user = get_authorized_user();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Sesión inválida o expirada. Por favor inicie sesión nuevamente."]);
        exit;
    }
    
    if ($required_role && $user['rol'] !== $required_role && $user['rol'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "No tiene permisos para realizar esta acción."]);
        exit;
    }
    
    return $user;
}
