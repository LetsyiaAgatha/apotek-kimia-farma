Berikut prompt yang bisa langsung kamu kirim ke Antigravity:

---

# REFACTOR MODUL GUDANG AGAR TIDAK DUPLIKAT DENGAN PENGADAAN

Saat ini sistem sudah memiliki dua sumber stok yang sah:

1. **Pengadaan Obat (Beli Putus)** → pembelian obat menggunakan modal apotek.
2. **Konsinyasi (Barang Titipan)** → obat dititipkan supplier dan dibayar setelah terjual.

Karena kedua modul tersebut sudah otomatis menambahkan stok ke Gudang dan POS, maka fitur **"Tambah Stok Baru" pada menu Gudang dianggap redundan dan menimbulkan alur bisnis yang membingungkan.**

---

## Tujuan Refactor

Hilangkan konsep bahwa Gudang dapat digunakan untuk membeli atau memasukkan stok baru.

Gudang harus berfungsi sebagai:

* Monitoring Inventory
* Monitoring Expired
* Monitoring Stok
* Koreksi Stok
* Penyesuaian Stok (Stock Adjustment)
* Pemusnahan Barang Expired

Bukan sebagai tempat melakukan pengadaan barang.

---

# Perubahan Menu Gudang

## Hapus

Tombol:

```text
Tambah Stok Baru
```

Beserta seluruh form:

* Nama Obat
* Kategori
* Stok Awal
* Harga Beli
* Harga Jual
* Expired
* Upload Foto

karena fungsi tersebut sudah tersedia pada:

* Pengadaan Obat (Beli Putus)
* Konsinyasi (Barang Titipan)

---

# Ganti Menjadi

## Penyesuaian Stok

Tambahkan tombol baru:

```text
Penyesuaian Stok
```

pada setiap produk.

---

## Fungsi Penyesuaian Stok

Digunakan ketika terjadi:

* Selisih stock opname
* Barang rusak
* Barang hilang
* Kesalahan input sebelumnya
* Koreksi data

---

## Form Penyesuaian Stok

Field:

### Produk

readonly

### Stok Sistem Saat Ini

readonly

### Stok Fisik Aktual

input angka

### Selisih

otomatis dihitung

Rumus:

```text
Selisih = Stok Fisik - Stok Sistem
```

---

### Alasan Penyesuaian

dropdown:

* Stock Opname
* Barang Rusak
* Barang Hilang
* Koreksi Input
* Lainnya

---

### Catatan

textarea opsional

---

# Saat Disimpan

Sistem harus:

1. Memperbarui stok produk.
2. Menyimpan histori penyesuaian.
3. Menampilkan perubahan pada dashboard.
4. Mengupdate notifikasi stok jika diperlukan.

---

# Tambahkan Histori Penyesuaian Stok

Menu:

```text
Gudang → Histori Penyesuaian
```

Kolom:

* Tanggal
* Produk
* User
* Stok Lama
* Stok Baru
* Selisih
* Alasan
* Catatan

---

# Penanganan Barang Expired

Saat produk expired:

Produk TIDAK BOLEH:

* dijual di POS

Namun produk tetap:

* tampil di Gudang
* tampil di laporan
* memiliki histori

Jangan menghapus data produk.

---

# Tambahkan Aksi Pemusnahan

Pada produk expired tambahkan:

```text
Musnahkan
```

---

## Saat Pemusnahan Dilakukan

Sistem:

1. Mengubah stok menjadi 0.
2. Mengubah status menjadi:

```text
Dimusnahkan
```

3. Menghapus produk dari POS.
4. Mencatat nilai kerugian.

---

## Perhitungan Kerugian

Rumus:

```text
Kerugian = Stok Tersisa × Harga Beli
```

Contoh:

```text
20 unit × Rp5.000
=
Rp100.000
```

---

# Integrasi Dashboard

Kerugian akibat pemusnahan harus otomatis masuk ke:

```text
Kerugian Expired
```

pada Dashboard.

---

# Integrasi Hak Akses

Administrator:

* Penyesuaian Stok
* Pemusnahan
* Melihat Histori

Apoteker:

* Mengusulkan Pemusnahan
* Melihat Histori

Kasir:

* Tidak memiliki akses

---

# Aturan Bisnis Baru

Stok hanya boleh bertambah melalui:

1. Pengadaan Obat (Beli Putus)
2. Konsinyasi (Barang Titipan)

Gudang tidak boleh lagi digunakan untuk membuat stok baru secara manual.

Dengan perubahan ini, seluruh stok yang masuk ke sistem memiliki asal transaksi yang jelas sehingga laporan inventory, pengeluaran, laba, dan kerugian menjadi konsisten dan dapat diaudit.

---

Menurutku refactor ini akan membuat sistemmu jauh lebih profesional karena alurnya menjadi:

```text
Pengadaan Beli Putus
        ↓
      Gudang
        ↓
        POS

Konsinyasi
        ↓
      Gudang
        ↓
        POS
```

dan tidak ada lagi stok yang "muncul tiba-tiba" dari menu Gudang tanpa asal transaksi yang jelas.
