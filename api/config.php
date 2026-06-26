<?php
/**
 * Database Configuration
 * Apotek Kimia Farma — Backend API
 */

// Auto-detect local vs hosting environment
$isLocal = in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1']) 
    || (isset($_SERVER['SERVER_ADDR']) && in_array($_SERVER['SERVER_ADDR'], ['127.0.0.1', '::1']));

if ($isLocal) {
    define('DB_HOST', '127.0.0.1');
    define('DB_USER', 'root');
    define('DB_PASS', '');               // Kosong = default XAMPP
    define('DB_NAME', 'apotek_kimia_farma');
    define('DB_PORT', 3306);
    define('UPLOAD_URL', '/apotek/uploads/');
} else {
    // Database credentials for hosting
    define('DB_HOST', 'localhost');      // Hosting database host (usually localhost)
    define('DB_USER', 'mypq3134_admin'); // Hosting database user
    define('DB_PASS', 'Agatha123456');    // Hosting database password
    define('DB_NAME', 'mypq3134_apotek');  // Hosting database name
    define('DB_PORT', 3306);
    
    // Auto-detect root vs subfolder for hosting upload URL
    $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
    $baseDir = preg_replace('/\/api$/', '', $scriptDir);
    $baseDir = rtrim($baseDir, '/');
    define('UPLOAD_URL', $baseDir . '/uploads/');
}

define('UPLOAD_DIR', __DIR__ . '/../uploads/');


// Connect to MySQL
function getDB(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}

// JSON response helper
function jsonResponse(mixed $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

// Get request body as JSON
function getBody(): array
{
    $raw = file_get_contents('php://input');
    return $raw ? (json_decode($raw, true) ?? []) : [];
}
