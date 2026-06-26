# 🏥 Sistem Manajemen Apotek — Kimia Farma

Aplikasi berbasis web **Single Page Application (SPA)** yang dirancang untuk mengelola operasional apotek secara digital, transparan, dan efisien. Sistem ini mencakup modul Point of Sales (POS), pelacakan stok & kedaluwarsa obat, pengadaan barang, manajemen konsinyasi, serta laporan keuangan otomatis.

---

## 🚀 Fitur Utama

1. **Dashboard Analytics (Overview)**
   * Widget ringkasan keuangan dan operasional (*Total Penjualan*, *Total Pembelian*, *Nilai Inventory*, *Kerugian Expired*, *Estimasi Laba*).
   * Grafik tren penjualan dan estimasi laba interaktif (7 hari terakhir).
   
2. **Manajemen Pengguna & Hak Akses (RBAC)**
   * **Administrator:** Akses penuh ke seluruh fitur dan pengaturan sistem.
   * **Apoteker:** Berfokus pada manajemen gudang, penerimaan barang, pengingat kedaluwarsa, dan pemusnahan obat.
   * **Kasir:** Akses terbatas hanya untuk modul transaksi POS penjualan.

3. **Gudang (Warehouse Management)**
   * Pemantauan stok obat real-time.
   * **Stock & Expiry Alert:** Status indikator otomatis untuk obat dengan stok kritis (< 10 unit) atau mendekati masa kedaluwarsa (< 30 hari).
   * Fitur retur obat ke supplier atau pemusnahan obat rusak/expired (*Soft delete* dengan riwayat pencatatan lengkap).

4. **Pengadaan Barang (Beli Putus & Titip/PO)**
   * Pembuatan Purchase Order (PO) ke supplier dengan status *Draft*, *Sent*, dan *Received*.
   * Modul Pengadaan Obat (Beli Putus) dengan pembayaran tunai di awal.
   * Integrasi **WhatsApp Direct Link** untuk mengirim PO langsung ke nomor narahubung (*PIC*) supplier.

5. **Laporan Keuangan & Konsinyasi**
   * Laporan transaksi kasir (POS) harian/periodik.
   * Laporan transaksi supplier (konsinyasi) beserta perhitungan utang dagang yang harus dibayarkan.
   * Cetak dokumen laporan secara profesional (dioptimalkan untuk format cetak printer/PDF).

---

## 🛠️ Tech Stack

* **Frontend:** Vanilla HTML5, CSS3, JavaScript ES6 (Modular Component & State Architecture), Lucide Icons, Chart.js.
* **Backend:** PHP 8.x (REST API).
* **Database:** MySQL (PDO Connection).

---

## ⚙️ Panduan Instalasi Lokal (XAMPP)

### 1. Kloning Proyek
Unduh kode sumber atau kloning repositori ini ke dalam direktori server lokal Anda (misal `htdocs` pada XAMPP):
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/ # (macOS)
# atau
cd C:\xampp\htdocs\ # (Windows)

git clone https://github.com/LetsyiaAgatha/apotek-kimia-farma.git apotek
```

### 2. Import Database
1. Buka browser dan buka **`http://localhost/phpmyadmin/`**.
2. Buat database baru bernama **`apotek_kimia_farma`**.
3. Pilih database tersebut, masuk ke tab **Import / Impor**, lalu pilih berkas **`database/schema.sql`** yang ada di dalam proyek.
4. Klik **Go / Kirim**.

### 3. Konfigurasi Koneksi (`api/config.php`)
Sesuaikan kredensial koneksi database jika Anda mengubah password atau host MySQL bawaan:
```php
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASS', ''); // default XAMPP kosong
define('DB_NAME', 'apotek_kimia_farma');
```

### 4. Jalankan Aplikasi
Buka browser Anda dan akses:
```
http://localhost/apotek/
```

### 🔑 Akun Uji Coba:
| Peran (Role) | Username | Password |
|---|---|---|
| **Administrator** | `admin` | `admin123` |
| **Kasir** | `kasir1` | `kasir123` |
| **Apoteker** | `apoteker1` | `apoteker123` |

---
*Dikembangkan untuk Tugas Mata Kuliah Komunikasi & Negosiasi — Proposal Digitalisasi Apotek.*
