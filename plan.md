# 📋 PLANNING PROTOTYPE SISTEM INFORMASI
## POS · Konsinyasi · Gudang — Apotek Kimia Farma

---

## 1. Tujuan Prototype

Prototype ini mensimulasikan **Sistem Informasi Terintegrasi** untuk apotek (**Apotek Kimia Farma**) dalam mengelola:

- Transaksi penjualan kasir (POS)
- Penerimaan barang titipan dari supplier (Konsinyasi Inbound)
- Manajemen stok gudang & inventory
- Notifikasi & peringatan otomatis
- Laporan & histori transaksi

Tujuan utamanya:
- Menunjukkan **integrasi antar modul secara real-time**
- Menampilkan **alur kerja bisnis apotek yang nyata**
- Menonjolkan **keunggulan kompetitif sistem**

---

## 2. Sitemap & Modul

```
Dashboard
│
├── POS Transaksi
├── Gudang & Inventory
├── Konsinyasi (Barang Titipan)
├── Laporan
├── Notifikasi
└── Hak Akses User
```

---

## 3. Konsep Desain UI/UX

- **Warna utama:** Hijau tua & orange (brand Kimia Farma)
- **Style:** Clean, profesional, corporate
- **Layout:** Navbar (atas) + Sidebar (kiri) + Content Area (kanan)
- **Prinsip:** Button jelas, modal informatif, fokus ke fungsi, badge status berwarna

---

## 4. Alur Sistem Terintegrasi (User Journey)

1. **Inbound Konsinyasi:** User menerima barang titipan dari Supplier (PBF). Data tersimpan sebagai histori utang dan otomatis masuk ke inventaris Gudang, termasuk foto produk.
2. **Gudang:** User memantau seluruh stok (Beli Putus & Konsinyasi) dalam satu tabel dengan filter asal produk.
3. **POS Transaksi:** Pelanggan membeli barang. Sistem otomatis mengurangi stok di Gudang, menambah angka "Terjual" di Konsinyasi, dan merekam transaksi ke Laporan.
4. **Notifikasi Otomatis:** Sistem memantau stok kritis & produk mendekati kedaluwarsa, lalu menampilkan peringatan di badge & Pusat Pemberitahuan.
5. **Pelunasan / Retur:** Apotek melunasi utang ke supplier (Lunas) atau mengembalikan barang (Retur). Stok di Gudang & POS diperbarui otomatis.
6. **Laporan & Dashboard:** Seluruh performa, keuntungan, dan histori transaksi tercatat.

---

## 5. Status Fitur Sistem ✅

### 🏠 Dashboard
- [x] Kartu ringkasan: Total Produk, Produk Titipan, Nilai Inventory, Transaksi Hari Ini
- [x] Grafik penjualan (Chart.js)
- [x] Daftar transaksi terbaru

### 💳 POS Transaksi
- [x] Grid produk dengan foto, harga, stok, dan kategori
- [x] Tambah/kurangi qty produk di keranjang
- [x] Checkout dengan update stok real-time
- [x] Sinkronisasi otomatis ke kolom "Terjual" di Konsinyasi
- [x] Modal sukses pembayaran

### 📦 Gudang & Inventory
- [x] Tabel daftar stok obat (nama, kategori, stok, harga jual, expired, status)
- [x] **Filter asal produk: Semua / Konsinyasi / Beli Putus**
- [x] Badge status dinamis: Tersedia, Stok Rendah, Expired, **Stok Habis**
- [x] Tanggal expired otomatis tampil `-` jika stok = 0 (produk sudah habis/retur)
- [x] **Tambah Stok Baru** dengan form lengkap:
  - Nama Obat, Kategori, Stok Awal, Harga Jual, Tanggal Expired
  - **Upload Foto Produk (opsional)** — preview thumbnail langsung
- [x] **Anti-duplikasi:** Jika nama obat sudah ada, stok dijumlahkan (tidak buat baris baru)
- [x] Sinkronisasi highlight baris dari Notifikasi

### 🏷️ Konsinyasi (Barang Titipan)
- [x] Tabel daftar semua transaksi konsinyasi dengan filter: Semua / Aktif / Lunas / Diretur
- [x] **Inbound Baru** (multi-produk per transaksi):
  - Input Nama Supplier, Nama PIC/Penyalur, No. WhatsApp PIC
  - Tombol `+` untuk menambah baris obat baru dalam satu nota
  - Per obat: Nama Produk, Kategori, Qty, Harga Titip, Harga Jual, Tanggal Expired, **Upload Foto**
  - Validasi: Qty maks 99.999, Harga maks 99.999.999, expired tidak boleh mundur
  - Validasi WA: hanya angka, awalan 08, panjang 10–13 digit
  - Otomatis masuk ke Gudang & POS setelah disimpan (anti-duplikasi)
- [x] **Detail Nota Pelunasan:** Modal dengan rincian transaksi + nama PIC (UP) + tombol cetak
- [x] **Hubungi Supplier:** Tautan WhatsApp otomatis dengan pesan dinamis (stok tipis / retur)
- [x] **Edit Informasi Supplier:** Ubah Nama Supplier, PIC, dan No. WA — sinkronisasi ke semua transaksi supplier yang sama
- [x] **Lunas:** Tandai pembayaran dilunasi; produk tetap tampil di POS selama stok > 0
- [x] **Retur:** Tandai barang dikembalikan; stok otomatis di-reset ke 0 di Gudang & POS

### 🔔 Notifikasi & Peringatan
- [x] Badge merah di header & sidebar — update otomatis berbasis kondisi data
- [x] Pusat Pemberitahuan (modal & halaman penuh) dengan 3 tipe alert:
  - ⚠️ **Stok Kritis** (stok < 20 unit) — dikecualikan untuk produk Diretur
  - 🔴 **Mendekati Expired** (≤ 30 hari) — hanya jika stok > 0
  - 📦 **Barang Diretur** (menunggu pengambilan supplier)
- [x] Klik notifikasi → navigasi ke halaman terkait + highlight baris produk (animasi flash)
- [x] Status "Sudah Dilihat" — notifikasi hilang hanya jika masalah benar-benar diselesaikan

### 🛒 Pengadaan Barang (Purchase Order / PO)
- [x] Nomor PO terstruktur otomatis (`PO-KF-YYYYMMDD-XXXX`)
- [x] Manajemen status PO (Draft, Sent, Received)
- [x] Pemilihan supplier terdaftar (dari Konsinyasi) maupun tambah supplier baru
- [x] Tombol "WA PO" untuk menghasilkan draf pesanan resmi WhatsApp secara formal
- [x] Integrasi Notifikasi ➔ PO: Tombol pintas "Buat PO Restock" pada notifikasi stok kritis obat konsinyasi untuk prefill data pemesanan secara instan
- [x] Integrasi PO ➔ Inbound: Dropdown "Tarik Data dari PO" pada form Inbound Konsinyasi untuk menarik data pemesanan secara otomatis, mempercepat proses penerimaan, dan mengubah status PO menjadi Diterima (Received) saat Inbound dikonfirmasi

### 📊 Laporan
- [x] Laporan transaksi POS (histori pembelian)
- [x] Laporan konsinyasi supplier (ringkasan per supplier)

### 👤 Hak Akses User
- [x] Manajemen akun pengguna (nama, role, status)

---

## 6. Teknologi & Arsitektur (Migrasi Backend PHP + MySQL)

| Komponen | Detail |
|---|---|
| **Frontend** | HTML + Vanilla CSS + ES Modules (JavaScript) |
| **Backend API** | PHP 8.x (REST API terpadu via `api/state.php`) |
| **Database** | MySQL (PDO) via XAMPP |
| **State Management** | Database MySQL via `fetch()` API secara asynchronous |
| **Grafik** | Chart.js |
| **Ikon** | Lucide Icons |
| **Font** | Inter (Google Fonts) |
| **Server lokal** | Apache & MySQL (XAMPP di `localhost/apotek`) |
| **Foto Produk** | Upload file ke server (`uploads/`) via `api/upload.php`, menyimpan path URL di DB |

---

## 7. Aturan Validasi Input

| Field | Aturan |
|---|---|
| Qty / Stok | Min 1, Maks 99.999 (5 digit), tidak boleh minus |
| Harga Titip / Jual | Min 0, Maks 99.999.999 (8 digit), tidak boleh minus |
| No. WhatsApp PIC | Hanya angka, wajib awalan `08`, panjang 10–13 digit |
| Tanggal Expired | Tidak boleh lebih awal dari hari ini |
| Nama Obat | Case-insensitive, trim spasi — digunakan untuk deteksi duplikasi |

---

## 8. Aturan Bisnis Utama

| Kondisi | Perlakuan Sistem |
|---|---|
| Produk konsinyasi masuk & nama sudah ada di Gudang | Stok dijumlahkan, data produk (harga, expired) diperbarui — tidak double |
| Status Konsinyasi = **Lunas** | Produk tetap tampil di POS & Gudang selama stok > 0 |
| Status Konsinyasi = **Diretur** | Stok produk di-reset ke 0 di Gudang & POS; expired tersembunyi |
| Stok produk = 0 | Kolom expired tampil `-`, status badge = **Stok Habis** (abu-abu) |
| Stok < 20 unit (bukan produk Diretur) | Notifikasi Stok Kritis aktif, angka stok berwarna merah |
| Produk expired ≤ 30 hari & stok > 0 | Notifikasi Mendekati Expired aktif |
| Edit supplier (nama/PIC/WA) | Perubahan diterapkan ke seluruh transaksi konsinyasi dari supplier yang sama |

---

## 9. Strategi Presentasi (Demo Penilaian)

**Urutan Demo yang Direkomendasikan:**

1. **Konsinyasi → Inbound Baru:** Input obat baru dari supplier (multi-produk, lengkap dengan foto). Tunjukkan validasi WA dan tanggal.
2. **Gudang → Filter "Konsinyasi":** Tunjukkan bahwa obat baru otomatis masuk dengan label "Konsinyasi" dan foto produk terpasang.
3. **POS Transaksi:** Tambahkan obat titipan ke keranjang → Bayar Sekarang → modal sukses. Tunjukkan foto produk tampil di kartu POS.
4. **Konsinyasi → Cek Terjual:** Tunjukkan kolom "Terjual di POS" & "Utang Pembayaran" berubah real-time.
5. **Notifikasi:** Tunjukkan badge merah muncul untuk stok kritis / mendekati expired, klik → langsung navigasi ke baris yang bermasalah.
6. **Dashboard / Laporan:** Tunjukkan rekapitulasi keuntungan dan histori transaksi.

---

## 10. Indikator Keberhasilan

- [x] Semua halaman dapat diakses dan responsif
- [x] Minimal 1 flow end-to-end dari Inbound → Gudang → POS → Laporan berfungsi penuh
- [x] Semua tombol memiliki aksi nyata
- [x] Data tersinkronisasi antar modul secara real-time
- [x] Validasi input berjalan di semua form
- [x] Notifikasi aktif dan responsif terhadap kondisi data
- [x] UI konsisten, foto produk tampil di Gudang & POS
