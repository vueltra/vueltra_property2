# 🚀 Vueltra - Fitur Aplikasi

Dokumen ini merangkum seluruh fitur fungsional yang tersedia di Frontend Vueltra Property Marketplace.

## 🌟 Fitur Utama (Marketplace & Public)

### 1. Pencarian & Filter Properti
*   **Search Bar Global**: Pencarian cerdas berdasarkan kata kunci (judul, area, jalan).
*   **Filter Kategori**: Rumah, Apartemen, Ruko, Kantor, Tanah, Lapak Usaha.
*   **Filter Tipe**: Dijual / Disewa.
*   **Filter Lokasi**: Dropdown dengan fitur pencarian nama kota (Searchable Dropdown).

### 2. City / Region Insights
*   **Data Dinamis**: Menampilkan data analitik wilayah secara otomatis saat lokasi dipilih.
*   **Metrik**: Harga rata-rata, tren kenaikan, cuaca, keamanan, kecepatan internet, dll.

### 3. Detail Properti (Listing Detail)
*   **Image Lightbox**: Tampilan foto layar penuh (Zoom) dengan dukungan keyboard.
*   **Kalkulator KPR**: Simulasi cicilan interaktif (Slider DP & Tenor).
*   **Rekomendasi Cerdas**: Menampilkan "Properti Sejenis Lainnya" berdasarkan kategori.
*   **Direct WhatsApp**: Tombol chat langsung mengarah ke nomor WA penjual dengan template pesan otomatis.
*   **Share Button**: Menggunakan Web Share API atau Copy Link.
*   **Report Listing**: Fitur pelaporan iklan bermasalah.

### 4. Profil Agen Publik
*   **Halaman Khusus**: Menampilkan biodata agen, foto, dan status verifikasi.
*   **Statistik**: Tanggal bergabung, jumlah properti aktif, dan jumlah properti terjual.
*   **Daftar Listing**: Grid semua properti milik agen tersebut.

---

## 👤 Fitur Pengguna (User & Seller)

### 1. Autentikasi & Akun
*   **Login & Register**: Mendukung input No WhatsApp.
*   **Lupa Password**: Simulasi flow reset password via email.
*   **Auto-Login (Dev Mode)**: Otomatis masuk sebagai Admin saat development.
*   **Edit Profil**: Ganti Foto Profil (Upload), Username, dan No HP.

### 2. Manajemen Iklan (Dashboard)
*   **CRUD Listing**: Buat, Baca, Update, Hapus iklan properti.
*   **Conditional Form**: Form input menyesuaikan kategori (misal: Tanah tidak butuh input Kamar Tidur).
*   **Status Toggle**: Menandai properti sebagai **ACTIVE** atau **SOLD** (Terjual/Tersewa).
*   **Promosi (Pin Listing)**: Menggunakan saldo kredit untuk menaikkan iklan ke "Top Listing".

### 3. Verifikasi Identitas (KYC)
*   **Upload Dokumen**: Foto KTP, Selfie dengan KTP, dan Kartu Agen (Opsional).
*   **Status Tracker**: Memantau status (Pending, Verified, Rejected).

### 4. Wishlist (Favorit)
*   **Simpan Properti**: Menandai properti yang disukai.
*   **Login Prompt**: Meminta login jika user tamu mencoba menyimpan.

### 5. Keuangan
*   **Sistem Kredit/Saldo**: Simulasi saldo untuk pembayaran fitur premium.
*   **Top Up**: Simulasi pengisian saldo.
*   **Riwayat Transaksi**: Log penggunaan saldo (Pengeluaran & Pemasukan).

---

## 🛡️ Fitur Admin (Backoffice)

### 1. Manajemen User (CRUD Lengkap)
*   **List User**: Melihat semua user terdaftar.
*   **Edit User**: Mengubah data user lain (Email, Username, HP, Foto).
*   **Kelola Saldo**: Menambah (Top Up manual) atau mengurangi (Penalty) saldo user.
*   **Act As User**: Membuat listing baru **atas nama user lain** (Bantuan posting).

### 2. Manajemen Listing
*   **Moderasi**: Menghapus listing yang melanggar.
*   **Pin/Unpin**: Memberikan status "Top Listing" tanpa memotong saldo (Hak Admin).
*   **Edit Listing**: Mengubah konten listing milik siapa saja.

### 3. Verifikasi (KYC Approval)
*   **Review Dokumen**: Melihat foto KTP & Selfie user.
*   **Decision**: Menyetujui (Approve) atau Menolak (Reject) pengajuan verifikasi.

### 4. Laporan (Reports)
*   **Tinjau Laporan**: Melihat aduan dari user terkait iklan penipuan.
*   **Tindakan**: Menghapus iklan yang dilaporkan atau mengabaikan laporan.

---

## ⚙️ Fitur Teknis & Infrastruktur

*   **Hybrid Backend**: Mendukung dua mode operasi:
    *   **Mock Mode**: Menggunakan `localStorage` browser (Tanpa server).
    *   **Real Backend Mode**: Terintegrasi dengan API (Golang/Node.js) melalui konfigurasi flag.
*   **Responsive Design**: Layout adaptif untuk Mobile, Tablet, dan Desktop.
*   **Theme**: **Modern Light Mode** (Dominan Putih dengan aksen Biru & Emerald).
*   **API Contract**: Dokumentasi lengkap untuk integrasi backend (`API_CONTRACT.md`).
*   **Legal Pages**: Halaman Syarat & Ketentuan, Privasi, dan Disclaimer.

---

## 🔧 Pengaturan & Pengembangan

Pastikan Anda telah menginstall dependencies:
```bash
npm install
```

Jalankan server development:
```bash
npm start
```