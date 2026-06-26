<?php
/**
 * Database Configuration (Production Hosting only)
 * Apotek Kimia Farma — Backend API
 */

$host = "localhost";
$user = "mypq3134_admin";
$pass = "Agatha123456";
$db   = "mypq3134_apotek";

// Koneksi MySQLi
$conn = mysqli_connect($host, $user, $pass, $db);
if (!$conn) {
    die("Koneksi database gagal: " . mysqli_connect_error());
}

// Koneksi PDO (untuk mendukung api/state.php)
define('DB_HOST', $host);
define('DB_USER', $user);
define('DB_PASS', $pass);
define('DB_NAME', $db);
define('DB_PORT', 3306);
define('UPLOAD_DIR', __DIR__ . '/../uploads/');

// Auto-detect root vs subfolder for hosting upload URL
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
$baseDir = preg_replace('/\/api$/', '', $scriptDir);
$baseDir = rtrim($baseDir, '/');
define('UPLOAD_URL', $baseDir . '/uploads/');

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
function jsonResponse($data, int $code = 200): void
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
