<?php
/**
 * Test Database Connection
 * Akses via: http(s)://domain/api/test_db.php
 */
header('Content-Type: text/plain; charset=utf-8');

echo "=== DIAGNOSIS KONEKSI DATABASE APOTEK ===\n\n";

echo "1. Memuat api/config.php...\n";
if (!file_exists(__DIR__ . '/config.php')) {
    die("ERROR: api/config.php tidak ditemukan!\n");
}
require_once __DIR__ . '/config.php';
echo "SUCCESS: api/config.php berhasil dimuat.\n\n";

echo "Detail Koneksi:\n";
echo "Host: " . (defined('DB_HOST') ? DB_HOST : 'Undefined') . "\n";
echo "User: " . (defined('DB_USER') ? DB_USER : 'Undefined') . "\n";
echo "Database: " . (defined('DB_NAME') ? DB_NAME : 'Undefined') . "\n\n";

echo "2. Mencoba koneksi MySQLi...\n";
if (isset($conn) && $conn) {
    echo "SUCCESS: Koneksi MySQLi Berhasil!\n\n";
} else {
    echo "ERROR: Koneksi MySQLi gagal!\n\n";
}

echo "3. Mencoba koneksi PDO...\n";
try {
    $db = getDB();
    echo "SUCCESS: Koneksi PDO Berhasil!\n\n";
} catch (Exception $e) {
    die("ERROR koneksi PDO: " . $e->getMessage() . "\n");
}

echo "4. Memeriksa isi tabel 'users'...\n";
try {
    $stmt = $db->query("SELECT id, name, username, role FROM users");
    $users = $stmt->fetchAll();
    echo "SUCCESS: Tabel 'users' ditemukan. Jumlah user terdaftar: " . count($users) . "\n\n";
    echo "Daftar User yang terdaftar di database:\n";
    foreach ($users as $u) {
        echo "- ID: {$u['id']} | Nama: {$u['name']} | Username: {$u['username']} | Role: {$u['role']}\n";
    }
} catch (Exception $e) {
    echo "ERROR Membaca tabel 'users': " . $e->getMessage() . "\n";
    echo "PETUNJUK: Jika muncul pesan 'Table doesn't exist', berarti Anda belum mengimpor file 'database/schema.sql' di phpMyAdmin hosting Anda.\n";
}

echo "\n=========================================\n";
echo "Diagnosis selesai.\n";
