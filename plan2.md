Modul Baru: Pengadaan Obat (Beli Putus)

Tambahkan menu baru:

📦 Pengadaan Obat

Menu ini digunakan Administrator untuk membeli obat dari supplier.

Data Pengadaan

Field:

Nomor Pengadaan (otomatis)
Tanggal Pembelian
Nama Supplier
Nama PIC Supplier
Nomor WhatsApp Supplier
Produk
Kategori
Qty
Harga Beli per Unit
Harga Jual per Unit
Tanggal Expired

Support multi-produk dalam satu transaksi pengadaan.

Saat Pengadaan Disimpan

Sistem harus:

Menambah stok ke Gudang.
Menambahkan produk ke POS jika belum ada.
Menyimpan histori pengadaan.
Mencatat nilai pembelian sebagai Pengeluaran.

Rumus:

Nilai Pembelian = Qty × Harga Beli

Contoh:

100 × Rp5.000 = Rp500.000

Nilai ini masuk ke laporan pengeluaran.

Gudang & Inventory

Tambahkan informasi:

Harga Beli
Harga Jual
Nilai Inventory

Rumus:

Nilai Inventory = Stok × Harga Beli

Contoh:

50 × Rp5.000 = Rp250.000

Integrasi dengan POS

Saat produk Beli Putus terjual:

Stok Gudang berkurang otomatis.

Sistem menyimpan:

Qty Terjual
Harga Jual
Harga Beli

Perhitungan Laba per Transaksi

Rumus:

Laba = (Harga Jual - Harga Beli) × Qty Terjual

Contoh:

Harga Beli = Rp5.000
Harga Jual = Rp8.000
Qty = 10

Laba:

(Rp8.000 - Rp5.000) × 10
= Rp30.000

Simpan ke histori transaksi.

Dashboard

Tambahkan kartu KPI baru:

Total Penjualan
Total Pembelian
Nilai Inventory
Kerugian Expired
Estimasi Laba

Rumus Dashboard
Total Penjualan

Total transaksi POS

Total Pembelian

Total transaksi Pengadaan Obat

Kerugian Expired

Total nilai stok obat expired

Estimasi Laba
Total Penjualan
Total Pembelian

Kerugian Expired

Modul Laporan Keuangan

Tambahkan submenu baru:

📊 Laporan Keuangan

Berisi:

Ringkasan Keuangan
Total Penjualan
Total Pembelian
Kerugian Expired
Estimasi Laba

Laporan Pemasukan

Kolom:

Tanggal
Nomor Transaksi
Produk
Qty
Nilai Penjualan

Laporan Pengeluaran

Kolom:

Tanggal
Nomor Pengadaan
Supplier
Produk
Qty
Harga Beli
Nilai Pembelian
Laporan Kerugian Expired

Kolom:

Tanggal Expired
Produk
Qty Tersisa
Harga Beli
Nilai Kerugian

Rumus:

Kerugian

Qty Tersisa × Harga Beli

Contoh:

20 × Rp5.000

Rp100.000

Integrasi dengan Fitur Expired

Jika produk berstatus Expired:

Tidak boleh dijual.
Tetap tersimpan di Gudang.
Tetap masuk laporan inventory.

Jika Administrator melakukan aksi "Dimusnahkan":

Stok menjadi 0.
Status menjadi Dimusnahkan.
Nilai stok tersisa dicatat ke Laporan Kerugian Expired.

Jangan menghapus data produk.

Gunakan pendekatan histori permanen.

Hak Akses

Administrator:

Kelola Pengadaan Obat
Lihat Laporan Keuangan
Lihat Kerugian Expired
Melakukan Pemusnahan

Apoteker:

Melihat Pengadaan
Melihat Kerugian Expired
Mengusulkan Pemusnahan

Kasir:

Hanya melihat transaksi POS

Ketentuan Teknis
Pertahankan arsitektur yang sudah ada.
Gunakan state.js dan saveState().
Simpan seluruh data pada database yang ada.
Jangan merusak alur Konsinyasi yang sudah berjalan.
Pengadaan Obat (Beli Putus) harus berjalan berdampingan dengan Konsinyasi.
Dashboard dan laporan harus menggabungkan data dari kedua model bisnis tersebut.
UI harus tetap konsisten dengan tema Kimia Farma yang sudah ada.