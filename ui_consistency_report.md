# LAPORAN AUDIT KONSISTENSI UI/UX, TOKEN DESAIN & SISTEM BAHASA (NEOSANTARA)
**Dokumen:** `ui_consistency_report.md`  
**Status:** Tahap A (Inventaris & Analisis - BACA SAJA)  
**Tanggal:** 25 November 2026  
**Total Berkas Terperiksa:** 863 file (`apps/src`, `json/`, `data/`)

---

## RINGKASAN EKSEKUTIF

Audit menyeluruh telah dilakukan pada seluruh basis kode game **Neosantara**. Temuan utama terbagi dalam tiga pilar:
1. **UI/UX & Komponen:** Ditemukan fragmentasi komponen dasar (modal, dialog, tombol, tab, kartu) di mana sebagian besar modal telah mengadopsi `RootInfoModalHeader` (103 pemakaian), namun struktur pembungkus (frame/dialog), footer aksi, dan penataan tombol (Batal vs Konfirmasi) masih dibuat secara manual dan bervariasi antar layar.
2. **Border Radius & Token:** Nilai radius terpecah menjadi 30+ variasi acak (terbanyak `rounded-xl` [755], `rounded-lg` [412], `rounded-full` [358], `rounded` [179], `rounded-2xl` [164], serta nilai inline style seperti `style:8px`, `style:12px !important`, `style:9999px`). Lebih dari 30 palet warna hex (`#00ffaa`, `#051111`, `#fff`, `#ef4444`, dll.) di-hardcode langsung di file TSX/CSS tanpa merujuk ke token semantic CSS (`var(--root-color-*)`).
3. **Sistem Bahasa (i18n):** Arsitektur kamus memiliki 53 file JSON per bahasa untuk 8 bahasa (id, en, ar, de, es, ja, ko, zh-CN) dengan total 6.004 kunci. Namun, **cakupan `t()` rata-rata hanya berkisar antara 15% – 28%** di layar antarmuka pemain karena ribuan teks masih berupa hardcoded string di JSX. Selain itu, notifikasi, berita, dan misi dibuat menggunakan template literal dinamis berbahasa Indonesia (`${negaraNama} telah...`), fallback i18n masih mengunci ke Indonesia (`id`) tanpa fallback berantai, dan belum ada dukungan format angka/tanggal per locale (Intl) maupun perlakuan layout RTL untuk Bahasa Arab.

---

## A1. INVENTARIS KESERAGAMAN UI/UX

### 1. Inventaris Komponen Berulang & Variasinya

| Jenis Komponen | Jumlah Varian Ditemukan | Komponen Yang Ada Saat Ini | Pemakaian Terbanyak / File Terkait | Masalah Utama |
| :--- | :---: | :--- | :--- | :--- |
| **Modal / Dialog Frame** | 4 varian | `PausedMenuFrame`, wrapper modal manual `fixed inset-0 ... bg-black/60`, Tailwind inline dialog, HeadlessUI Transition | `RootInfoModalHeader.tsx` (103 file), `PausedMenuFrame.tsx` (5 file), `RootConfirmModal.tsx` (10 file) | Tidak ada wrapper tunggal baku; padding backdrop dan batas tinggi modal berbeda-beda. |
| **Header Modal** | 3 varian | `RootInfoModalHeader`, `PausedMenuHeader`, inline `<div>` manual | `root_modals_design_menu/` & 100+ modul di `navigasi_menu/` & `menus/` | Posisi ikon, subjudul, dan tinggi header kadang 48px, 56px, atau auto. |
| **Tombol Tutup** | 3 varian | `RootModalCloseButton`, `ModalCloseButton`, inline `<button onClick={onClose}><X /></button>` | Digunakan di 35 file komponen bersama dan puluhan modal mandiri | Sebagian menggunakan lingkaran dengan border, sebagian ikon polos `X`, ukuran tombol berkisar 32px – 40px. |
| **Tombol Aksi (Button)** | 5 varian gaya | Primer (accent/sky), Sekunder (slate/gray), Bahaya/Destruktif (red/rose), Sukses (emerald), Polos/Ghost | 500+ `<button>` di seluruh codebase (Primer: 93, Bahaya: 31, Sukses: 6, Sekunder: 8, Campuran inline: 41) | Tidak ada komponen `SharedButton`. Mengandalkan class Tailwind mentah yang berulang dengan padding dan font-size acak. |
| **Kartu (Card)** | 4 varian | `BuildingCardRoot`, kartu `bg-slate-800/60 rounded-xl`, kartu `border border-slate-700/50 rounded-lg`, inline styles | `BuildingCardRoot.tsx` (5 file), 400+ kartu konten di `navigasi_menu/` dan `detail_negara/` | Padding kartu bervariasi (`p-3`, `p-4`, `p-6`), ada yang memakai efek hover zoom `hover:scale-[1.02]`, ada yang statis. |
| **Tab / Segmented** | 3 varian | `RootModalTabs`, button switch manual `activeTab === id`, scrollable pills | `RootModalTabs.tsx` (12 file), sisanya inline tab buttons di 40+ file menu | Sebagian tab bergaya garis bawah (underline), sebagian pill kapsul, indikator aktif tidak seragam. |
| **Badge / Chip** | 3 varian | `rootBorderRadius.badge` (`rounded-md`), `rounded-full` pills, status dot badge | Puluhan file di `detail_negara/`, `inbox`, `news` | Ukuran teks bervariasi (`text-[10px]`, `text-xs`, `text-sm`), padding `px-2 py-0.5` vs `px-3 py-1`. |
| **Tabel / Daftar** | 2 varian | `RootTable` (bersama), table HTML standar dengan CSS Module | `RootTable.tsx` (19 file), tabel mentah di ekonomi & geopolitik | Sebagian tabel memakai sticky header, sebagian scroll lepas horizontal tanpa scrollbar khusus. |
| **Status Kosong / Loading** | 4 varian | Spinner Lucide `Loader2`, teks "Memuat...", skeleton anim-pulse, `null` kosong | Tersebar di sub-menu async & fetch | Belum ada komponen `SharedEmptyState` dengan ilustrasi dan tombol aksi ulang. |

### 2. Temuan Anomali Visual & Token Liar

* **Warna Hardcoded Hex:** Ditemukan lebih dari 30 kode hex yang diulang ratusan kali di dalam berkas JSX dan CSS alih-alih memakai token tema:
  * `#00ffaa` (80 kemunculan di 11 file) – warna aksen hijau neon custom.
  * `#051111` (65 kemunculan di 25 file) – background gelap custom.
  * `#ef4444` & `#ff2d55` (73 kemunculan di 22 file) – warna merah bahaya hardcoded.
  * `#0ea5e9` & `#38bdf8` (84 kemunculan di 12 file) – warna biru aksen hardcoded.
  * `#fbbf24`, `#ffe600`, `#f59e0b` (63 kemunculan di 17 file) – warna peringatan/emas.
* **Font-size & Spasi Acak:** Pemakaian ukuran font arbiter Tailwind seperti `text-[10px]`, `text-[11px]`, `text-[13px]`, `leading-3`, `gap-[6px]`, `p-[10px]`.
* **Z-Index Liar:** Nilai z-index bervariasi ekstrem: `z-1`, `z-2`, `z-10`, `z-20`, `z-50 !important` (8 tempat di CSS responsif), hingga `z-[100001]`.
* **Interaksi & Aksesibilitas:** 
  * Banyak tombol hanya memiliki transisi `:hover` tanpa `:active` (tidak ada umpan balik saat ditekan pada layar sentuh/mobile).
  * Outlines fokus (`focus-visible:ring-2`) sering dihapus (`focus:outline-none`) tanpa pengganti cincin fokus kontras tinggi.
  * Target sentuh pada mobile di beberapa tombol ikon berukuran 28x28px atau 32x32px (di bawah standar minimum 44x44px).

### 3. Pola Antarmuka per Layar (Header - Isi - Aksi)
* **Urutan Tombol Batal vs Konfirmasi:** Di beberapa dialog, tombol "Batal" berada di kiri dan "Konfirmasi" di kanan; sedangkan di modul lain urutannya terbalik, atau tombol konfirmasi berada di atas tombol batal pada layar sempit.
* **Variasi Wording Aksi Serupa:**
  * Menutup dialog: "Tutup", "Kembali", "Mengerti", "Batal", "X".
  * Menyetujui: "Konfirmasi", "Terapkan", "Simpan", "Luncurkan", "Ya", "Setuju".
  * Menolak: "Batal", "Tolak", "Abaikan".

---

## A2. BORDER RADIUS DAN TOKEN DESAIN

### 1. Inventaris Nilai Radius Saat Ini

| Nilai Radius Lama | Frekuensi | Konteks Pemakaian Utama |
| :--- | :---: | :--- |
| `rounded-xl` (12px) | 755 | Kartu konten, kontainer list, panel sub-menu, popover |
| `rounded-lg` (8px) | 412 | Tombol utama, input field, baris tabel, filter box |
| `rounded-full` (9999px) | 358 | Avatar bendera, status badge bulat, tombol icon close bulat, toggle pill |
| `rounded` (4px) | 179 | Badge kecil, indikator progres tipis, checkbox, tag |
| `rounded-2xl` (16px) | 164 | Modal frame luar, popup besar desktop, sheet menu utama |
| `rounded-md` (6px) | 112 | Chip kategori, tombol kecil, dropdown item |
| `rounded-sm` (2px) | 67 | Tooltip, scrollbar thumb, divider dot |
| `rounded-r-2xl` / `rounded-r-xl` | 42 | Sidebar dock tab, tab samping peta navigasi |
| `style: 8px / 12px / 14px / 9999px` | 40+ | Inline style di komponen lama atau SVG wrapper |
| `rounded-3xl` (24px) | 4 | Dialog promosi khusus / tutorial spotlight |

### 2. Pemetaan ke Skala Token Tunggal yang Diusulkan

Kami merekomendasikan standardisasi pada skala 6 tingkatan radius semantik:

| Token Semantik | Nilai CSS / Tailwind | Konteks Standar | Pemetaan dari Nilai Lama | Estimasi Migrasi |
| :--- | :---: | :--- | :--- | :---: |
| **`var(--radius-xs)`** | `4px` (`rounded-xs` / `rounded-sm`) | Badge mikro, checkbox, bar progres tipis, tooltip | `rounded-sm` (2px), `rounded` (4px) | ~246 elemen |
| **`var(--radius-sm)`** | `6px` (`rounded-md`) | Chip filter, badge kategori, tombol dropdown | `rounded-md` (6px), style `6px` | ~118 elemen |
| **`var(--radius-md)`** | `8px` (`rounded-lg`) | Input field, textarea, select, tombol ukuran standar/kecil | `rounded-lg` (8px), style `8px`, style `0.5rem` | ~425 elemen |
| **`var(--radius-lg)`** | `12px` (`rounded-xl`) | Tombol aksi primer, kartu informasi, panel list | `rounded-xl` (12px), style `12px`, style `14px` | ~765 elemen |
| **`var(--radius-xl)`** | `16px` – `20px` (`rounded-2xl`) | Kontainer modal frame dialog, bottom sheet mobile | `rounded-2xl` (16px), `rounded-3xl` (24px) | ~170 elemen |
| **`var(--radius-full)`** | `9999px` (`rounded-full`) | Avatar negara/pemimpin, pill tab, tombol bulat bulat tutup | `rounded-full`, style `9999px`, style `999px` | ~370 elemen |

### 3. Pemeriksaan Token yang Ada (`rootColors.css` & `globals.css`)
* Di `apps/src/app/page/root_design/rootColors.css` sudah ada token warna semantik:
  `--root-color-canvas`, `--root-color-surface`, `--root-color-accent`, `--root-color-accent-ink`, `--root-color-text`, `--root-color-body`, `--root-color-muted`, `--root-color-danger`.
* Di `rootBorderRadius.ts` sudah ada objek token:
  ```ts
  export const rootBorderRadius = {
    frame: "rounded-2xl",
    card: "rounded-xl",
    button: "rounded-lg",
    badge: "rounded-md",
  } as const;
  ```
* **Kelemahan sistem sekarang:** Token di `rootBorderRadius.ts` jarang diimpor oleh modul-modul menu (hanya dipakai di 6 file); pengembang menuliskan string class Tailwind langsung secara ad-hoc.
* **Solusi Target:** Memperluas token CSS di `globals.css` / Tailwind v4 `@theme inline` sehingga class standar seperti `rounded-token-card`, `bg-root-surface`, `text-root-muted` terdaftar langsung di Tailwind dan tidak perlu membuat pustaka CSS terpisah.

---

## A3. SISTEM BAHASA (i18n)

### 1. Arsitektur Saat Ini
* **File Inti:** `apps/src/app/page/paused_menu/terjemahan_paused_menu/languageLogic.tsx`.
* **Kamus Terjemahan:** 53 file JSON per bahasa di 8 direktori bahasa (`id`, `en`, `ar`, `de`, `es`, `ja`, `ko`, `zh-CN`).
* **Penyimpanan Status:** `localStorage.getItem('game_language')` dengan event kustom `NEOSANTARA_LANGUAGE_CHANGE`. Bersifat reaktif di dalam komponen yang memakai hook `useLanguage()`.
* **Kelemahan Arsitektur:**
  1. Default bahasa di-hardcode ke `id` (Indonesia).
  2. Fallback hierarki langsung jatuh ke `idCommon`/`ID_DICTIONARY` tanpa opsi fallback menengah (misalnya: `bahasa aktif -> en -> id`).
  3. Modul di luar `paused_menu` (misalnya di logika simulasi AI, event, dan notifikasi) tidak memiliki akses langsung ke `t()` konteks React.

### 2. Status i18n Berdasarkan Modul (Persentase `t()` vs Hardcoded JSX)

| Modul / Folder | Jumlah Berkas | Panggilan `t()` | String JSX Hardcoded | % Cakupan `t()` | Tingkat Prioritas |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **navigasi_menu** (Ekonomi, Militer, Pembangunan, Kepuasan, Pertahanan, dll.) | 261 | 1.310 | 7.284 | **15.2%** | **P0 (Kritis)** |
| **detail_negara** (Profil AI, User, Kebijakan, Indikator) | 94 | 566 | 1.915 | **22.8%** | **P0 (Kritis)** |
| **menus** (Side menu: Inbox, News, Misi, Penelitian, Shop) | 127 | 662 | 1.803 | **26.9%** | **P0 (Kritis)** |
| **map_system** (Tooltip peta, panel provinsi, kontrol peta) | 24 | 119 | 398 | **23.0%** | **P1 (Tinggi)** |
| **paused_menu** (Pengaturan, Audio, Grafis, Bahasa) | 16 | 102 | 331 | **23.6%** | **P1 (Tinggi)** |
| **navbar** (Top Bar, Status Kas, Tanggal, Tombol Navigasi) | 1 | 42 | 139 | **23.2%** | **P1 (Tinggi)** |
| **root_modals_design_menu** (Dialog konfirmasi, modal AI) | 16 | 26 | 152 | **14.6%** | **P1 (Tinggi)** |
| **main_menu** (Menu Awal, Pilih Negara) | 2 | 13 | 91 | **12.5%** | **P1 (Tinggi)** |
| **tutorials_menu** & **credits_menu** | 11 | 31 | 55 | **36.0%** | **P2 (Sedang)** |
| **logic** (NPC Brain, AI News Bridge, Notifikasi Generator) | 82 | 0 | 57+ template | **0.0%** | **P0 (Kritis)** |

### 3. Kelengkapan Kamus Antar Bahasa (6.004 Kunci per Kamus)

| Bahasa | Total Kunci | Kunci Hilang vs ID | File Hilang | Kunci Nilai Sama Persis dgn ID (Potensi Belum Diterjemahkan) |
| :---: | :---: | :---: | :---: | :---: |
| **id** (Indonesia) | 6.004 | 0 (Acuan) | 0 | 0 |
| **en** (Inggris) | 6.004 | 0 | 0 | 106 |
| **es** (Spanyol) | 6.004 | 0 | 0 | 41 |
| **ja** (Jepang) | 6.004 | 0 | 0 | 23 |
| **de** (Jerman) | 6.002 | 2 | 0 | 65 |
| **ko** (Korea) | 6.002 | 2 | 0 | 26 |
| **zh-CN** (Mandarin) | 6.002 | 2 | 0 | 18 |
| **ar** (Arab) | 5.997 | 7 | 0 | 19 |

> **Catatan Analisis Kamus:**  
> Secara umum 53 file kamus terjemahan sudah terstruktur sangat baik di 8 bahasa. Kunci yang hilang hanya berjumlah 2 hingga 7 kunci pada bahasa Jerman, Korea, Mandarin, dan Arab (terutama pada sub-fitur resolusi PBB dan spionase). Terdapat sekitar 18–106 kunci yang nilainya identik dengan bahasa Indonesia (umumnya singkatan teknis seperti *PBB*, *ICBM*, atau nama properti yang tertinggal saat lokalisasi).

### 4. Temuan String Terpaku (Hardcoded) di Logika & Data Entitas
* **Generator Notifikasi & Berita (`logic/npc_ai_brain/core/aiNewsBridge.ts`, `orchestrator.ts`):**  
  Template string langsung dibuat dalam bahasa Indonesia, misalnya:  
  `Pembangunan Fasilitas Baru di ${negaraNama}`  
  `Penguatan Pertahanan Nasional ${negaraNama}`  
  `Menanggapi kondisi pada menu ${formatIndikator}, otoritas ${negaraNama} menetapkan langkah penyesuaian: ${deskripsi}.`  
  *Dampak:* Ketika pemain mengganti bahasa ke Bahasa Inggris atau Jepang, notifikasi dan feed berita yang di-generate oleh AI tetap muncul dalam bahasa Indonesia karena disimpan sebagai teks matang (bukan kunci + parameter).
* **Database Entitas Game (`json/` dan `data/`):**  
  Nama-nama organisasi internasional, komoditas, tipe bangunan (`semua_fitur_negara/`), nama tempat wisata, dan doktrin tertulis dalam bahasa Indonesia di skrip database (`.pg.sql` dan `.ts`). Belum ada tabel pemetaan alias bahasa untuk entitas ini.
* **Format Nilai (Intl), Plural, & RTL:**
  * **Angka & Mata Uang:** Format angka masih menggunakan `.toLocaleString('id-ID')` atau format manual `Rp ${val}` di puluhan modul, sehingga tidak menyesuaikan format lokal pemain (misal: titik vs koma pemisah ribuan, simbol mata uang).
  * **Dukungan RTL (Arab):** `document.documentElement.dir = 'rtl'` telah diset di `languageLogic.tsx`, namun komponen CSS belum menggunakan CSS logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`). Akibatnya, ikon panah navigasi, alignment teks tabel, dan posisi tombol tutup modal terbalik atau terpotong pada mode bahasa Arab.
  * **Panjang Teks & Overflow:** Bahasa Jerman (`de`) memiliki kata rata-rata 30-40% lebih panjang, menyebabkan teks pada beberapa tombol aksi (`min-w-[80px]`) terpotong atau wrap secara tidak wajar.

---

## 10 PRIORITAS TERATAS HASIL AUDIT

1. **[P0] Buat Komponen Bersama Modal & Dialog Baku (`SharedModal`, `SharedConfirmDialog`):** Menggantikan puluhan modal wrapper inline dan menyatukan urutan aksi Batal di kiri, Konfirmasi di kanan.
2. **[P0] Buat Komponen Tombol Baku (`SharedButton`):** Menghentikan class Tailwind manual pada 500+ tombol dan menerapkan standar varian (primary, secondary, danger, ghost), state `:hover`, `:active`, ring fokus, dan target sentuh mobile 44px.
3. **[P0] Standarisasi Token Border Radius & Warna di CSS/Tailwind:** Deklarasikan skala token radius di `globals.css` dan tailwind `@theme inline`, ganti inline styles (`style: 8px !important`, dll.) ke token.
4. **[P0] Ubah Sistem Berita & Notifikasi AI ke Pola `{ key, params }`:** Pastikan notifikasi AI tidak di-generate sebagai string Indonesia mentah, melainkan sebagai objek terjemahan dinamis yang dirender menggunakan `t()`.
5. **[P1] Tambahkan Standar Fallback Berantai (Active Locale -> EN -> ID) pada `languageLogic`:** Menghindari kegagalan terjemahan dan memungkinkan bahasa default diatur di level konfigurasi.
6. **[P1] Dukungan RTL Otomatis untuk Bahasa Arab:** Migrasi padding dan margin horizontal di komponen bersama ke logical properties Tailwind v4 (`ps-`, `pe-`, `start-`, `end-`).
7. **[P1] Integrasi Helper Format Angka & Tanggal Menggunakan `Intl`:** Ganti format hardcode 'id-ID' dengan `Intl.NumberFormat` dan `Intl.DateTimeFormat` yang merujuk pada `language` aktif.
8. **[P1] Lengkapi 7 Kunci Kamus yang Hilang di Bahasa Arab, Jerman, Korea, dan Mandarin:** Sinkronkan seluruh 6.004 kunci agar konsisten 100%.
9. **[P2] Migrasi Bertahap Hardcoded JSX di Modul Navigasi & Detail Negara:** Ekstraksi ribuan label statis JSX ke file namespace JSON yang sesuai.
10. **[P2] Skrip Linter / CI Pengaman Kualitas:** Buat skrip audit otomatis yang mendeteksi warna hex hardcoded baru, radius di luar token, dan string JSX tanpa `t()`.
