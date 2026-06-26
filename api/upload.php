<?php
/**
 * Upload API — Upload foto produk ke server
 * POST /api/upload.php
 * Menerima file upload dengan field name "photo"
 * Mengembalikan { success: true, url: "/apotek/uploads/xxx.jpg" }
 */
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['photo']['error'] ?? -1;
    jsonResponse(['error' => 'Upload gagal. Kode error: ' . $errCode], 400);
}

$file     = $_FILES['photo'];
$mimeType = mime_content_type($file['tmp_name']);
$allowed  = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

if (!in_array($mimeType, $allowed, true)) {
    jsonResponse(['error' => 'Tipe file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP.'], 400);
}

// Batasi ukuran file 5MB
if ($file['size'] > 5 * 1024 * 1024) {
    jsonResponse(['error' => 'Ukuran file terlalu besar. Maksimal 5MB.'], 400);
}

// Generate nama file unik
$extMap = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif',
    'image/webp' => 'webp',
];
$ext = $extMap[$mimeType] ?? 'jpg';
$filename = 'prod_' . uniqid('', true) . '.' . $ext;
$destPath = UPLOAD_DIR . $filename;

if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    jsonResponse(['error' => 'Gagal menyimpan file ke server.'], 500);
}

jsonResponse([
    'success'  => true,
    'url'      => UPLOAD_URL . $filename,
    'filename' => $filename,
]);
