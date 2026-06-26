5. Gudang & Inventory

Pada tabel gudang:

Tambahkan badge status:

Tersedia
Stok Rendah
Stok Habis
Expired
Dimusnahkan

Urutan prioritas status:

Dimusnahkan
Expired
Stok Habis
Stok Rendah
Tersedia

6. Tombol Pemusnahan

Untuk produk berstatus Expired:

Tambahkan tombol:

"Dimusnahkan"

Ketika diklik:

tampil konfirmasi
simpan histori pemusnahan
ubah status menjadi Dimusnahkan
stok menjadi 0

Data produk tidak boleh dihapus dari sistem.

7. Histori Tetap Dipertahankan

Jangan pernah menghapus record produk dari inventory.

Contoh setelah dimusnahkan:

Nama Produk : Paracetamol
Stok : 0
Status : Dimusnahkan
Tanggal Expired : 20-06-2026

Tujuannya agar laporan dan histori transaksi tetap valid.

8. Dashboard

Tambahkan indikator baru:

Total Produk Expired
Total Produk Dimusnahkan

9. Laporan

Tambahkan laporan histori pemusnahan:

Kolom:

Tanggal Pemusnahan
Nama Produk
Qty Dimusnahkan
Alasan
User

10. Hak Akses

Kasir:

hanya melihat status produk di POS

Apoteker:

dapat melihat produk expired
dapat mengajukan pemusnahan

Administrator:

dapat melakukan pemusnahan
dapat melihat laporan pemusnahan

Catatan Penting

Jangan menggunakan DELETE terhadap data produk expired.

Gunakan pendekatan perubahan status (soft lifecycle management) agar histori inventaris tetap tersimpan dan laporan tetap konsisten.

Pastikan seluruh perubahan tetap sinkron dengan state management yang sudah ada serta tidak merusak alur Konsinyasi → Gudang → POS → Laporan yang saat ini sudah berjalan.