
# Vueltra - Property Marketplace

Ini adalah panduan konfigurasi cepat untuk pengembang.

## ⚙️ Versi Aplikasi & Konfigurasi

Anda dapat beralih antara dua versi mode aplikasi melalui file **`services/store.ts`**.

### 🛠️ Versi 1: Mock Mode (Tanpa Backend)
Ini adalah **Default**. Cocok untuk demo frontend, testing UI, atau pengembangan tanpa server.
*   **Data**: Tersimpan di `localStorage` browser.
*   **Fitur**: Semua fitur berjalan simulasi (Upload foto simulasi, login simulasi).
*   **Cara Aktifkan**: 
    Set `USE_REAL_BACKEND: false` di `APP_CONFIG`.

### 🔗 Versi 2: Real Backend (Integrasi API)
Gunakan mode ini saat ingin menghubungkan aplikasi dengan server database (Golang/Node.js).
*   **Data**: Diambil langsung dari Server via API.
*   **Fitur**: Upload foto, Auth, dan CRUD listing bersifat Real-time dan persisten di database.
*   **Cara Aktifkan**: 
    Set `USE_REAL_BACKEND: true` di `APP_CONFIG`.

---

## 🔧 Pengaturan Fitur (Feature Flags)

Beberapa fitur dapat dinonaktifkan secara default melalui `services/store.ts` pada bagian `DEFAULT_SETTINGS`.

*   **Market Insight**: Set `showMarketInsights: false` untuk menyembunyikan widget data wilayah di halaman Home secara default. Admin dapat menyalakannya kembali lewat Dashboard.

---

## 🚀 Integrasi Backend

Jika menggunakan Versi 2, pastikan `BASE_URL` mengarah ke server Anda.

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api/v1', 
  // ...
};
```

Spesifikasi Endpoint API lengkap dapat dilihat di file: **`API_CONTRACT.md`**.

---

## ⚡ Menjalankan Aplikasi

Pastikan Anda telah menginstall dependencies:
```bash
npm install
```

Jalankan server development:
```bash
npm start
```
