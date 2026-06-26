# PANDUAN PRESENTASI & PITCH DECK: SISTEM MANAJEMEN APOTEK TERPADU
**Software House Pitch ke Pemilik Apotek (Simulasi Kelompok 2 Orang)**

---

## 👥 Identitas Pembicara & Pembagian Peran
*   **Presenter 1 (Business Lead / CEO)**: Berfokus pada latar belakang masalah apotek, nilai bisnis (ROI), alur transaksi POS, skema harga, dan negosiasi penjualan.
*   **Presenter 2 (Technical Lead / CTO)**: Berfokus pada demo teknis sistem (live workflow), arsitektur keamanan, pemisahan role (RBAC), pencegahan manipulasi stok, dan pembukuan kerugian otomatis.

---

## 📋 Struktur Slide & Naskah Presentasi (Script)

### Slide 1: Pembuka & Value Proposition (Presenter 1)
*   **Visual**: Logo Software House & Nama Produk: *PharmaTech Systems - Solusi Manajemen Apotek Berbasis Data & Integritas*.
*   **Naskah Presenter 1**:
    > "Selamat pagi/siang rekan-rekan dan Dosen pengampu, serta yang kami hormati Bapak/Ibu Pemilik Apotek selaku calon mitra kami. 
    > Kami dari [Nama Kelompok/Software House Anda], beranggotakan saya [Nama Anda] sebagai Business Lead, dan rekan saya [Nama Teman] sebagai Technical Lead. 
    > Hari ini kami ingin memperkenalkan solusi digital untuk mengatasi kebocoran keuntungan terbesar di apotek Anda: manajemen stok kedaluwarsa dan pengendalian akses kasir."

---

### Slide 2: Masalah Utama Apotek Tradisional (Presenter 1)
*   **Visual**: Poin-poin masalah (Stok Bocor, Kerugian Obat Expired, Manipulasi Akun Kasir).
*   **Naskah Presenter 1**:
    > "Sebagai pemilik apotek, Bapak/Ibu pasti sering menghadapi tiga masalah klasik:
    > 1. **Stok Bocor**: Obat hilang atau salah hitung tanpa jejak audit.
    > 2. **Kerugian Expired**: Obat kedaluwarsa menumpuk di gudang tanpa disadari hingga akhirnya terbuang menjadi kerugian bersih.
    > 3. **Risiko Keamanan**: Staf kasir atau apoteker melakukan perubahan stok secara sepihak untuk menutupi selisih uang.
    > Sistem kami hadir untuk menyelesaikan semua masalah ini dalam satu dashboard terintegrasi."

---

### Slide 3: Solusi & Fitur Unggulan (Presenter 1 & Presenter 2)
*   **Visual**: Tiga pilar utama (POS Cepat, Gudang Terkendali, Audit Penyesuaian & Kerugian Real-time).
*   **Naskah Presenter 1**:
    > "Solusi kami membagi operasi apotek menjadi alur yang aman dan terdokumentasi. Pembelian barang baru hanya bisa dilakukan melalui pengadaan resmi (Beli Putus atau Konsinyasi). Kasir hanya bertugas menjual via POS. Sementara manajemen stok di gudang dikendalikan secara ketat berdasarkan peran pengguna (RBAC)."
*   **Naskah Presenter 2**:
    > "Dari sisi teknologi, kami menggunakan arsitektur Role-Based Access Control (RBAC) yang sangat aman. Aktor **Kasir** hanya dapat melihat kasir POS. **Apoteker** bertugas memantau gudang dan mengajukan retur/pemusnahan obat expired. Sedangkan **Administrator** memegang kuasa penuh untuk menyetujui transaksi dan melakukan stock opname (koreksi stok)."

---

### Slide 4: Live Demo Alur Pengadaan & Penjualan (Presenter 2)
*   **Visual**: Tampilan Dashboard & Modul POS.
*   **Naskah Presenter 2**:
    > "Mari kita lihat langsung sistemnya. Di Dashboard Overview yang baru saja kami rapikan ini, Anda dapat melihat visualisasi grafik penjualan dan laba secara real-time. Di bagian bawah terdapat **Peringatan Stok & Expired** dengan badge merah kritis dan oranye kedaluwarsa untuk tindakan pencegahan cepat.
    > Alur masuk obat dimulai dari menu **Pengadaan Obat (Beli Putus)** atau **Konsinyasi**. Setelah transaksi pengadaan disimpan, stok obat di gudang dan kasir langsung bertambah secara otomatis tanpa perlu input manual di gudang. Ini mencegah duplikasi data."

---

### Slide 5: Live Demo Alur Keamanan & Pemusnahan Obat Expired (Presenter 2)
*   **Visual**: Perbandingan Tampilan Apoteker vs Administrator saat mengelola obat expired.
*   **Naskah Presenter 2**:
    > "Sekarang, mari kita simulasikan fitur keamanan paling penting: **Pencegahan manipulasi stok obat expired**.
    > 
    > Jika saya login sebagai **Apoteker**:
    > * Saya melihat obat yang kedaluwarsa. Sistem mendeteksi tanggal kedaluwarsanya telah lewat atau stoknya 0, sehingga memunculkan tombol **'Ajukan Pemusnahan'** (untuk beli putus) atau **'Ajukan Retur'** (untuk konsinyasi).
    > * Apabila obat masih segar dan stoknya banyak, tombol ini **disembunyikan otomatis** oleh sistem untuk mencegah kesalahan klik. Apoteker juga dilarang keras mengubah angka stok fisik (tombol Penyesuaian disembunyikan).
    > 
    > Jika saya login sebagai **Administrator**:
    > * Administrator akan menerima ajuan pemusnahan tersebut. Admin dapat mengeklik **'Dimusnahkan'** untuk menyetujui.
    > * Begitu dieksekusi, stok obat tersebut langsung menjadi 0, tercatat di **Histori Pemusnahan**, dan sistem otomatis menghitung kerugian finansialnya lalu menampilkannya di Dashboard."

---

### Slide 6: Analisis Laba Rugi & Sinkronisasi Dashboard (Presenter 1)
*   **Visual**: Grafik Tren Penjualan & Kartu Statistik Kerugian Expired di Dashboard.
*   **Naskah Presenter 1**:
    > "Setiap obat beli putus yang dimusnahkan akan langsung mengurangi estimasi laba bersih apotek Anda, dan nilainya diakumulasikan ke dalam indikator **'Kerugian Expired'** secara otomatis di dashboard utama.
    > Sebaliknya, obat konsinyasi yang kedaluwarsa akan diretur ke supplier tanpa dihitung sebagai kerugian apotek Anda. Pembukuan otomatis ini memastikan Anda sebagai pemilik apotek selalu mendapatkan laporan laba-rugi yang 100% akurat untuk pengambilan keputusan."

---

### Slide 7: Model Bisnis, Harga, & ROI (Presenter 1)
*   **Visual**: Rincian Paket Harga (Lisensi Sekali Bayar atau Paket Berlangganan bulanan) & Estimasi ROI.
*   **Naskah Presenter 1**:
    > "Dengan mencegah kehilangan stok (stock leakage) dan mendeteksi obat kedaluwarsa lebih cepat, apotek rata-rata dapat menghemat biaya kerugian hingga 15-20% per tahun. 
    > Kami menawarkan software ini dengan model **Lisensi Mandiri (One-time Purchase)** seharga Rp XX.XXX.XXX termasuk instalasi lokal dan garansi maintenance selama 6 bulan, atau paket **SaaS (Software as a Service)** bulanan seharga Rp XXX.XXX/bulan. Investasi ini akan kembali modal (ROI) hanya dalam waktu kurang dari 3 bulan."

---

### Slide 8: Penutup & Tanya Jawab (Presenter 1 & 2)
*   **Visual**: Kontak Software House (Email, WhatsApp) & Sesi Tanya Jawab.
*   **Naskah Presenter 1**:
    > "Demikian presentasi dari software house kami. Sistem ini siap diimplementasikan dan disesuaikan dengan kebutuhan alur kerja apotek Anda. Kami membuka sesi tanya jawab untuk Bapak/Ibu sekalian. Terima kasih banyak atas perhatiannya."

---

## 💡 Tips Sukses Saat Presentasi Di Depan Kelas
1.  **Lakukan Role-play**: Tunjukkan transisi peran secara nyata. Misalnya, Presenter 2 bertindak sebagai Apoteker Siti Aminah yang mengajukan pemusnahan di layar laptop, lalu beralih login sebagai Admin Letysia untuk menyetujuinya. Ini akan membuat dosen/audiens kagum dengan fitur RBAC Anda.
2.  **Highlight Perubahan Desain**: Sampaikan bahwa dashboard didesain dengan estetika modern menggunakan kombinasi font *Outfit* dan *Inter*, warna hijau khas Kimia Farma yang dipadukan dengan aksen modern, serta status badge interaktif untuk kegunaan tingkat tinggi (UX).
3.  **Fokus pada Nilai Jual**: Jangan hanya menjelaskan coding-nya, tapi jelaskan *mengapa* fitur tersebut menguntungkan bagi pemilik apotek (misalnya: 'mencegah kecurangan kasir', 'otomatisasi laporan kerugian').
