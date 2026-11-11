# Panduan Ukuran Tipografi Aplikasi Mobile Berdasarkan Lebar Layar

Dokumen ini berisi panduan ukuran font (*font size*) untuk pengembangan aplikasi mobile yang responsif, dikelompokkan berdasarkan hierarki tipografi (H1–H6, Body, dan elemen lainnya) serta kategori lebar layar HP.

---

## 1. Klasifikasi Ukuran Layar HP (Breakpoints)
* **Small Screen (< 360px):** Contoh: iPhone SE, HP entry-level lawas.
* **Standard Screen (360px – 400px):** Contoh: Sebagian besar Android standar, iPhone reguler.
* **Large Screen (> 400px):** Contoh: iPhone Pro Max, Samsung Galaxy Ultra.

---

## 2. Tabel Hierarki Tipografi Berdasarkan Lebar HP
*(Satuan ukuran menggunakan sp untuk Android dan pt untuk iOS)*

| Elemen Tipografi | Deskripsi & Fungsi | Small Screen (<360px) | Standard Screen (360-400px) | Large Screen (>400px) |
| :--- | :--- | :--- | :--- | :--- |
| **H1 (Display / Large Title)** | Judul utama layar (misal: header halaman profil atau keranjang belanja). | 24 – 28 pt | 28 – 32 pt | 32 – 34 pt |
| **H2 (Title 1 / Section)** | Judul sub-bagian utama di dalam halaman (misal: "Rekomendasi Untuk Anda"). | 20 – 22 pt | 22 – 24 pt | 24 – 26 pt |
| **H3 (Title 2 / Card Title)** | Judul komponen, kartu (*card*), atau modal dialog. | 18 – 19 pt | 18 – 20 pt | 20 – 22 pt |
| **H4 (Title 3 / Subheading)** | Sub-judul dari sebuah card atau bagian kecil. | 16 – 17 pt | 17 – 18 pt | 18 – 19 pt |
| **H5 (Subtitle / Overline)** | Teks penjelas kecil di atas judul (biasanya huruf kapital semua/uppercase). | 11 – 12 pt | 12 – 13 pt | 13 – 14 pt |
| **H6 / Caption Kecil** | Label penjelas paling kecil atau *badge* kategori. | 10 – 11 pt | 11 – 12 pt | 12 pt |
| **Body Large (p)** | Teks paragraf utama yang butuh penekanan atau kenyamanan baca tinggi. | 16 pt | 16 – 17 pt | 17 – 18 pt |
| **Body Medium (p)** | Teks paragraf standar yang paling sering dipakai di aplikasi. | 14 pt | 14 – 15 pt | 15 – 16 pt |
| **Body Small (p)** | Teks paragraf pendukung yang panjang (deskripsi sekunder). | 12 – 13 pt | 13 – 14 pt | 14 pt |
| **Button Text** | Teks di dalam tombol aksi utama (*CTA button*). | 14 pt | 14 – 16 pt | 16 pt |
| **Labels & Forms** | Teks *placeholder* atau label di atas kolom *input* (Form). | 12 – 13 pt | 13 – 14 pt | 14 pt |
| **Captions / Metadata** | Timestamp (waktu), catatan kaki, atau status kecil (*e.g., "5 mins ago"*). | 11 pt | 11 – 12 pt | 12 pt |
| **Overline / Kicker** | Kategori mini di atas judul artikel/produk (*e.g., "TEKNOLOGI"*). | 10 pt | 11 pt | 11 – 12 pt |

---

## 3. Catatan Penting untuk Implementasi
1. **Dukungan Skala Fleksibel:** Selalu gunakan satuan relatif seperti `sp` (Android) atau mendukung *Dynamic Type* (iOS) agar teks menyesuaikan pengaturan aksesibilitas pengguna.
2. **Line Height (Jarak Baris):** Untuk teks bodi (Body Medium), gunakan *line height* sekitar **1.4x hingga 1.6x** dari ukuran font agar nyaman dibaca.
3. **Batas Minimum:** Hindari penggunaan ukuran font di bawah **11pt / 12sp** untuk teks penting guna menjaga keterbacaan (*accessibility*).