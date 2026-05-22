<?php
/**
 * Herramienta de Verificación y Purga de Caché
 * Envía cabeceras LiteSpeed para limpiar el caché y analiza los archivos del servidor
 */

// Enviar cabecera especial para purgar TODO el caché de LiteSpeed en Hostinger inmediatamente!
header("X-LiteSpeed-Purge: *");
header("Content-Type: text/plain; charset=UTF-8");

echo "=== VERIFICACIÓN DE DEPLOY Y PURGA DE CACHÉ ===\n\n";

echo "1. Purgando Caché de LiteSpeed...\n";
echo "   [OK] Cabecera X-LiteSpeed-Purge enviada con éxito.\n\n";

echo "2. Contenido del Directorio Raíz:\n";
$root_files = scandir('.');
foreach ($root_files as $file) {
    if ($file != '.' && $file != '..') {
        $is_dir = is_dir($file) ? "[DIR] " : "      ";
        $size = is_dir($file) ? "" : " (" . number_format(filesize($file)) . " bytes)";
        $mtime = date("Y-m-d H:i:s", filemtime($file));
        echo "   $is_dir $file - Modificado: $mtime $size\n";
    }
}
echo "\n";

echo "3. Contenido de la carpeta assets/:\n";
if (is_dir('assets')) {
    $assets_files = scandir('assets');
    foreach ($assets_files as $file) {
        if ($file != '.' && $file != '..') {
            $size = number_format(filesize("assets/$file"));
            $mtime = date("Y-m-d H:i:s", filemtime("assets/$file"));
            echo "    - $file - Modificado: $mtime ($size bytes)\n";
        }
    }
} else {
    echo "   [!] La carpeta 'assets/' NO existe en el directorio raíz.\n";
}
echo "\n";

echo "4. Inspección de index.html:\n";
if (file_exists('index.html')) {
    $content = file_get_contents('index.html');
    echo "   Tamaño: " . number_format(filesize('index.html')) . " bytes\n";
    echo "   Fecha modificación: " . date("Y-m-d H:i:s", filemtime('index.html')) . "\n";
    echo "   Líneas de carga detectadas:\n";
    
    // Buscar etiquetas script y link en index.html
    if (preg_match_all('/<script[^>]*src=["\']([^"\']+)["\']/i', $content, $scripts)) {
        foreach ($scripts[1] as $src) {
            echo "    - Script detectado: $src\n";
        }
    } else {
        echo "    - No se detectaron etiquetas <script src=...>\n";
    }
    
    if (preg_match_all('/<link[^>]*href=["\']([^"\']+)["\']/i', $content, $links)) {
        foreach ($links[1] as $href) {
            if (strpos($href, '.css') !== false) {
                echo "    - CSS detectado: $href\n";
            }
        }
    }
} else {
    echo "   [!] El archivo 'index.html' NO existe en el directorio raíz.\n";
}

echo "\n=== FIN DE VERIFICACIÓN ===";
?>
