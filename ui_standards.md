# STANDAR DESAIN DAN ARSITEKTUR i18n (NEOSANTARA)
**Dokumen:** `ui_standards.md`  
**Status:** Tahap B (Standar & Rencana Arsitektur - Menunggu Persetujuan)  
**Target Rilis:** Tahap C (Perbaikan Bertahap)

---

## 1. SISTEM TOKEN DESAIN BAKU

Sistem token akan diperluas langsung pada file token eksisting (`apps/src/app/page/root_design/rootColors.css` dan `globals.css` `@theme inline`), **tanpa membuat pustaka styling terpisah**.

### 1.1 Skala Token Border Radius

```css
/* Ditambahkan pada globals.css / rootColors.css */
:root {
  --root-radius-xs: 4px;     /* Chip mikro, checkbox, bar progres tipis, tooltip */
  --root-radius-sm: 6px;     /* Badge status, chip filter, tombol kecil */
  --root-radius-md: 8px;     /* Input text, select, dropdown, button standar */
  --root-radius-lg: 12px;    /* Kartu konten kecil/sedang, panel menu sub-fitur */
  --root-radius-xl: 16px;    /* Frame modal dialog desktop & kartu utama */
  --root-radius-2xl: 20px;   /* Modal frame luar, bottom sheet mobile */
  --root-radius-full: 9999px;/* Avatar negara, pill tab, tombol bulat close */
}
```

Dalam Tailwind v4 `@theme inline`:
* `rounded-token-xs` -> `var(--root-radius-xs)`
* `rounded-token-sm` -> `var(--root-radius-sm)`
* `rounded-token-md` -> `var(--root-radius-md)`
* `rounded-token-lg` -> `var(--root-radius-lg)`
* `rounded-token-xl` -> `var(--root-radius-xl)`
* `rounded-token-2xl` -> `var(--root-radius-2xl)`
* `rounded-token-full` -> `var(--root-radius-full)`

### 1.2 Palet Token Warna & Kontras Aksesibilitas

Warna hex liar (`#00ffaa`, `#051111`, `#ef4444`, dll.) wajib dimigrasikan ke variabel semantik:

| Token Semantik | Nilai Dark (Default) | Nilai Light Mode | Penggunaan Baku |
| :--- | :---: | :---: | :--- |
| `var(--root-color-canvas)` | `#0F172A` | `#F5EFE4` | Latar belakang kanvas aplikasi / game |
| `var(--root-color-surface)` | `#1E293B` | `#FFF9EE` | Latar belakang kartu, panel, dan modal |
| `var(--root-color-surface-hover)`| `#334155` | `#F0E9DD` | Hover state pada baris list atau kartu |
| `var(--root-color-accent)` | `#0EA5E9` | `#8C5F2E` | Warna interaktif primer, toggle aktif, highlight |
| `var(--root-color-accent-ink)` | `#FFFFFF` | `#FFF8EC` | Warna teks di atas warna aksen |
| `var(--root-color-success)` | `#10B981` | `#2D6A4F` | Status surplus, aksi konfirmasi sukses, profit |
| `var(--root-color-warning)` | `#F59E0B` | `#B45309` | Status siaga, peringatan, deficit ringan |
| `var(--root-color-danger)` | `#EF4444` | `#A83A32` | Status bahaya, tombol destruktif, perang, defisit berat |
| `var(--root-color-text)` | `#F8FAFC` | `#201A12` | Teks judul utama & angka penekanan tinggi |
| `var(--root-color-body)` | `#CBD5E1` | `#3D3428` | Teks paragraf dan label standar |
| `var(--root-color-muted)` | `#94A3B8` | `#6F6353` | Teks sekunder, label unit, helper text |
| `var(--root-color-border)` | `rgb(255 255 255 / 10%)` | `rgb(0 0 0 / 10%)` | Border kartu, garis pemisah tabel |

### 1.3 Skala Spasi, Tipografi, & Z-Index

* **Spasi Baku:** Gunakan kelipatan 4px (`p-2` = 8px, `p-3` = 12px, `p-4` = 16px, `p-6` = 24px). Dilarang memakai nilai custom `p-[10px]` atau `gap-[6px]`.
* **Hierarki Tipografi:**
  * Judul Modal: `text-lg sm:text-xl font-bold tracking-wide`
  * Judul Sub-seksi / Kartu: `text-sm sm:text-base font-semibold`
  * Body / Isi Data: `text-xs sm:text-sm font-normal`
  * Label / Keterangan Unit / Badge: `text-[11px] sm:text-xs font-medium`
* **Skala Z-Index Terpadu:**
  * Kanvas Peta: `z-0`
  * Elemen Kontrol Peta: `z-10`
  * Navbar & Bottom Dock: `z-20`
  * Dropdown & Tooltip: `z-30`
  * Dialog / Modal Biasa: `z-40`
  * Confirm Dialog / Alert Kritis: `z-50`
  *(Menghilangkan nilai `z-[100001]` dan `!important`)*

---

## 2. STANDAR KOMPONEN BERSAMA (SHARED COMPONENTS)

Komponen akan ditempatkan di `apps/src/app/page/root_modals_design_menu/shared/` untuk memusatkan UI:

### 2.1 Pola Modal Baku (`SharedModal`)
1. **Header:** Memakai judul, subjudul (opsional), ikon konteks, dan tombol close di sudut kanan atas (atau sudut kiri saat mode RTL).
2. **Body:** Kontainer dengan `overflow-y-auto`, memiliki padding konsisten (`p-4 sm:p-6`), dan scrollbar tema.
3. **Footer Aksi (Sticky):** 
   * Tombol sekunder / "Batal" / "Kembali" selalu berada di sisi awal (kiri pada LTR, kanan pada RTL).
   * Tombol primer / "Konfirmasi" / "Simpan" selalu berada di sisi akhir (kanan pada LTR, kiri pada RTL).
   * Pada layar sempit/mobile (`< 640px`), tombol primer di atas, tombol sekunder di bawah, masing-masing lebar penuh (`w-full`) dengan tinggi minimal 44px.

### 2.2 Pola Tombol Baku (`SharedButton`)
* **Varian Baku:**
  * `primary`: Background aksen, teks putih/kontras tinggi, hover brightness up, active scale 0.98.
  * `secondary`: Background `var(--root-color-surface)`, border `var(--root-color-border)`, teks body.
  * `danger`: Background `var(--root-color-danger)`, teks putih, untuk aksi destruktif (hapus save, deklarasi perang, serang).
  * `ghost`: Tanpa border/background, hanya hover surface lembut.
* **Ukuran Baku:**
  * `sm`: Tinggi 32px, teks 12px, padding `px-3` (untuk filter / chip).
  * `md`: Tinggi 40px, teks 13px/14px, padding `px-4` (tombol standar formulir/tabel).
  * `lg`: Tinggi 48px, teks 15px, padding `px-6` (tombol konfirmasi utama modal & aksi mobile).
* **Interaksi Wajib:** Memiliki efek umpan balik visual saat ditekan (`active:scale-[0.98] transition-all duration-150`), ring fokus aksesibilitas (`focus-visible:ring-2 focus-visible:ring-offset-2`), dan target sentuh mobile minimal 44x44px.

### 2.3 Wording Baku Tombol (Standarisasi Aksi)

| Aksi | Wording Baku (ID) | Wording Baku (EN) | Kunci Kamus i18n |
| :--- | :--- | :--- | :--- |
| Membatalkan dialog aksi | **Batal** | **Cancel** | `common.cancel` |
| Menutup modal informasi | **Tutup** | **Close** | `common.close` |
| Kembali ke layar sebelumnya | **Kembali** | **Back** | `common.back` |
| Menyetujui dialog konfirmasi | **Konfirmasi** | **Confirm** | `common.confirm` |
| Menyimpan formulir/pengaturan | **Simpan** | **Save** | `common.save` |
| Menghapus / Serang / Pecat | **Hapus** / **Serang** | **Delete** / **Attack** | Sesuai konteks modul |
| Mengakui notifikasi / pesan | **Mengerti** | **Understood** | `common.understood` |

*(Menghilangkan variasi ambigu seperti "Tutup" vs "Batal" vs "Keluar" untuk aksi yang sama).*

---

## 3. ARSITEKTUR SISTEM BAHASA (i18n) TARGET

### 3.1 Fallback Berantai & Pengaturan Default Bahasa
* **Pengaturan Default Bahasa:** Disimpan di `localStorage` atau preferensi game, dapat dikonfigurasi melalui setting aplikasi (tidak terkunci statis ke `"id"`).
* **Mekanisme Fallback Berantai:**
  $$\text{Bahasa Aktif} \longrightarrow \text{Bahasa Inggris (`en`)} \longrightarrow \text{Bahasa Indonesia (`id`)} \longrightarrow \text{String Kunci}$$
  Jika kunci terjemahan tidak ditemukan di bahasa aktif, sistem akan mencari di kamus `en` sebelum jatuh ke `id`. Hal ini menjamin pengguna internasional mendapatkan bahasa Inggris jika translasi lokal belum selesai.

### 3.2 Penanganan Template Dinamis & Logika Notifikasi/Berita
Alih-alih membuat string template mentah di kode logika:
```ts
// POLA LAMA (BERMASALAH - TERKUNCI BAHASA INDONESIA):
const notifText = `${negaraNama} telah meningkatkan anggaran pertahanan sebesar ${formatNominal(jumlah)}`;
```
Akan dimigrasikan ke pola objek berbasis kunci + parameter:
```ts
// POLA BARU TARGET:
export interface TranslatableMessage {
  key: TranslationKey;
  params?: Record<string, string | number>;
}

// Disimpan di state / save game:
const notifData: TranslatableMessage = {
  key: "notifications.defense_budget_increased",
  params: { country: negaraNama, amount: jumlah }
};

// Dirender saat ditampilkan ke UI pemain:
<span>{t(notifData.key, notifData.params)}</span>
```
Dengan pola ini:
1. Ketika pemain mengganti bahasa dari Indonesia ke Jepang atau Jerman di menu pengaturan, **seluruh riwayat notifikasi dan berita seketika berganti bahasa secara reaktif tanpa perlu me-reload aplikasi**.
2. Save game lama tetap aman karena data save hanya perlu menyimpan ID atau format terjemahan baru dengan fallback ke teks mentah jika ditemukan data save format lama.

### 3.3 Format Angka, Mata Uang, & Tanggal Menggunakan `Intl`
Membuat helper terpusat `formatLocaleNumber`, `formatLocaleCurrency`, dan `formatLocaleDate`:
```ts
export function formatLocaleNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatLocaleCurrency(value: number, locale: string, currencyCode = 'IDR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(value);
}
```

### 3.4 Dukungan Arah Teks Kanan-ke-Kiri (RTL) untuk Bahasa Arab
* `document.documentElement.dir = 'rtl'` diterapkan saat bahasa Arab aktif.
* Semua styling margin dan padding horizontal pada komponen bersama wajib beralih ke CSS Logical Properties Tailwind v4:
  * `ml-4` / `mr-4` $\rightarrow$ `ms-4` (margin-inline-start) / `me-4` (margin-inline-end)
  * `pl-4` / `pr-4` $\rightarrow$ `ps-4` (padding-inline-start) / `pe-4` (padding-inline-end)
  * `left-4` / `right-4` $\rightarrow$ `start-4` / `end-4`
* Ikon yang memiliki arah panah navigasi (seperti `ChevronRight`, `ArrowLeft`) otomatis dicerminkan menggunakan selektor `[dir="rtl"] .rtl-flip { transform: scaleX(-1); }`.

---

## 4. TAHAP C: RENCANA IMPLEMENTASI PERBAIKAN BERTAHAP (ROADMAP)

Implementasi perbaikan akan dijalankan setelah mendapatkan persetujuan tertulis dari pengguna:

* **Langkah C1: Standardisasi Token Desain & Skala Radius**
  * Memperluas token `--root-radius-*` dan `--root-color-*` pada `rootColors.css` dan `globals.css`.
  * Menghapus inline style radius acak (`style: 8px !important`, dll.) pada komponen modal dan frame dasar.
* **Langkah C2: Pembuatan & Refaktor Komponen Bersama (`Shared*`)**
  * Membuat komponen `SharedModal`, `SharedConfirmDialog`, `SharedButton`, dan `SharedBadge`.
  * Memastikan state `:hover`, `:active`, target sentuh 44px, dan urutan tombol Batal di awal, Konfirmasi di akhir.
* **Langkah C3: Modernisasi Arsitektur i18n & Notifikasi Dinamis**
  * Memperbarui `languageLogic.tsx` dengan dukungan fallback berantai (`locale -> en -> id`) dan helper `Intl`.
  * Melengkapi 7 kunci yang hilang pada kamus Bahasa Arab, Jerman, Korea, dan Mandarin.
  * Menyesuaikan generator event/berita AI (`aiNewsBridge.ts`) agar menghasilkan objek pesan `{ key, params }`.
  * Menerapkan logical properties RTL (`ps-`, `pe-`, `ms-`, `me-`) pada komponen modal dan navigasi.
* **Langkah C4: Pengaman Kualitas & Validasi Visual**
  * Uji build aplikasi Next.js (`npm run build`) untuk memastikan integritas kode dan nol error TypeScript.
  * Menjalankan skrip validasi kelengkapan kamus agar tidak ada missing keys pada seluruh 8 bahasa.
