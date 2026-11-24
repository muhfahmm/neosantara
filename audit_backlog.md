# Backlog Perbaikan & Remediasi Neosantara

**Tanggal Penyusunan**: 24 November 2026  
**Dokumen Induk**: [audit_report.md](file:///d:/project-sendiri/neosantara/audit_report.md)  
**Tujuan**: Menyediakan rencana kerja berurutan berdasarkan matriks prioritas (Dampak x Usaha) yang dirancang agar aman dikerjakan oleh beberapa agen/developer paralel tanpa konflik berkas (file clash).

---

## 1. Matriks Prioritas Kerja (Dampak x Usaha)

- **Sprint 1 (Quick Wins - Efek Cepat, Risiko Minimal)**: Usaha Rendah (S) / Sedang (M) dengan Dampak Tinggi / Kritis yang dapat diselesaikan segera.
- **Sprint 2 (Perbaikan Struktural & Konsistensi Data)**: Usaha Sedang (M) dengan Dampak Tinggi / Kritis, menyelesaikan akar masalah arsitektur data, keamanan, dan logika.
- **Sprint 3 (Refaktor Besar & Dekomposisi Sistem)**: Usaha Besar (L) dengan Dampak Kritis, mencakup modularisasi file monolitik dan lokalisasi menyeluruh.

---

## 2. Rencana Sprint dan Penugasan Paralel

### SPRINT 1: Quick Wins & Perbaikan Cepat (Aman Paralel)

Setiap tugas pada sprint ini menyentuh berkas yang berbeda sehingga dapat dikerjakan secara paralel oleh agen terpisah tanpa konflik merge:

| ID Tugas | Rujukan Audit | Judul & Deskripsi Tugas | Berkas Target | Usaha | Agen Pemilik |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **TSK-101** | `BID-2-001` | **Perbaiki Rentang Benua di API Country Data**<br>Hapus batasan angka `order <= 207` dan petakan seluruh 212 negara secara akurat. | `apps/src/app/api/country-data/route.ts` | **S** | Agen Data |
| **TSK-102** | `BID-6-001` | **Konfigurasi Keamanan CSP Tauri**<br>Ganti nilai `"csp": null` dengan konfigurasi Content Security Policy ketat. | `apps/src-tauri/tauri.conf.json` | **S** | Agen Keamanan |
| **TSK-103** | `BID-7-001` | **Perbaiki Mock Test Suite `apiResponseCache.test.mjs`**<br>Perbaiki kegagalan pengujian unit cache (tambahkan mock header dan byteLength). | `apps/tests/apiResponseCache.test.mjs` | **S** | Agen QA |
| **TSK-104** | `BID-1-002` | **Ganti Dialog `alert()` Native dengan Toast/Modal UI**<br>Hapus 2 panggilan alert liburan dan militer pada tombol kalender. | `apps/src/app/page/map_system/map-system.tsx:12691` | **S** | Agen UI |
| **TSK-105** | `BID-4-001` | **Hapus Pembacaan `window.innerWidth` Langsung**<br>Integrasikan hook `useViewportMode` pada modul kesejahteraan dan konsumsi. | `apps/src/app/logic/kesejahteraanCalculator.ts`<br>`apps/src/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/consumptionLogic.ts` | **S** | Agen Logic |
| **TSK-106** | `BID-1-003` | **Standarisasi Istilah "Aneksasi" vs "Pencaplokan"**<br>Seragamkan teks narasi berita agar konsisten menggunakan kata "Aneksasi". | `apps/src/app/page/menus/news/logic/2_berita_aneksasi/beritaAneksasiLogic.ts` | **S** | Agen Bahasa |

---

### SPRINT 2: Perbaikan Struktural & Konsistensi Data (Aman Paralel)

Pada tahap ini, integritas logika game dan validasi API diperkuat. Berkas yang dikerjakan telah dipisah per domain:

| ID Tugas | Rujukan Audit | Judul & Deskripsi Tugas | Berkas Target | Usaha | Agen Pemilik |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **TSK-201** | `BID-5-002` | **Pembersihan Event Listener Global di Map System**<br>Tambahkan fungsi cleanup `removeEventListener` pada callback async `initMap()`. | `apps/src/app/page/map_system/map-system.tsx` | **S** | Agen Performa |
| **TSK-202** | `BID-6-003` | **Pasang Validasi Skema Zod pada Mutasi Rute API**<br>Validasi payload POST pada rute subsidi, status ekonomi, dan simulasi perang. | `apps/src/app/api/alokasi-subsidi/route.ts`<br>`apps/src/app/api/sistem-ekonomi/route.ts`<br>`apps/src/app/api/war-simulation/route.ts` | **M** | Agen Keamanan |
| **TSK-203** | `BID-3-001` | **Sinkronisasi Resolusi/Embargo PBB dengan Modal Invasi**<br>Cek status sanksi dan embargo sebelum mengeksekusi serangan militer pemain. | `apps/src/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/1_serang_negara/modals_menu/KonfirmasiSerangModals.tsx` | **M** | Agen Logic |
| **TSK-204** | `BID-2-003` | **Generasi Data Seed SQL Metadata Bangunan**<br>Sinkronkan tabel `database_building_metadata.pg.sql` dengan registry TS agar database terisi lengkap. | `json/database_building_metadata/database_building_metadata.pg.sql`<br>`apps/src/app/api/building-metadata/route.ts` | **M** | Agen Data |
| **TSK-205** | `BID-4-002` | **Penyesuaian Touch Target Mobile Navigasi Bawah**<br>Tingkatkan ukuran sentuh tombol aksi minimal 44x44px untuk pengguna Android/mobile. | `apps/src/app/page/map_system/map-system.tsx:12695` | **S** | Agen UI |
| **TSK-206** | `BID-7-003` | **Buat Unit Test Suite untuk State Save/Load & Session**<br>Bangun pengujian otomatis untuk memverifikasi keutuhan save file dan mutasi tanggal. | `apps/tests/gameSessionState.test.mjs` (Baru) | **M** | Agen QA |

---

### SPRINT 3: Refaktor Besar & Lokalisasi Menyeluruh (Staged / Terkoordinasi)

Tugas-tugas pada sprint ini berukuran besar dan membutuhkan koordinasi agar tidak terjadi tabrakan kode:

| ID Tugas | Rujukan Audit | Judul & Deskripsi Tugas | Berkas Target | Usaha | Agen Pemilik |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **TSK-301** | `BID-5-001`<br>`BID-6-001` | **Dekomposisi Monolitik `map-system.tsx` (12.983 Baris)**<br>Pecah menjadi: `MapCanvasEngine.tsx`, `MapControlsOverlay.tsx`, `MapModalsHost.tsx`, `MapNotificationFeed.tsx`. | `apps/src/app/page/map_system/` | **L** | Tim Arsitektur Frontend |
| **TSK-302** | `BID-1-001` | **Migrasi String Hardcoded Geopolitik & Kementerian ke i18n**<br>Hubungkan 31 file komponen geopolitik dan kementerian dengan kamus JSON terjemahan. | `apps/src/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/`<br>`apps/src/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/` | **L** | Tim Bahasa / i18n |
| **TSK-303** | `BID-1-001` | **Migrasi String Hardcoded Armada Militer & ICBM ke i18n**<br>Hubungkan 25 file komponen armada dan ICBM ke kamus JSON terjemahan. | `apps/src/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/`<br>`apps/src/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/5_icbm/` | **L** | Tim Bahasa / i18n |
| **TSK-304** | `BID-1-001` | **Migrasi String Hardcoded Detail Negara ke i18n**<br>Hubungkan 46 file komponen pada detail negara ke kamus terjemahan. | `apps/src/app/page/detail_negara/` | **L** | Tim Bahasa / i18n |
| **TSK-305** | `BID-6-004` | **Eliminasi Tipe `any` dan Penanganan Blok `catch` Kosong**<br>Ganti 947 penggunaan `any` dengan typed interfaces dan tambahkan error logging terpusat. | Seluruh repositori (bertahap per domain) | **L** | Tim Code Quality |
| **TSK-306** | `BID-5-003` | **Optimasi Aset Geospasial Besar (GeoJSON 36MB)**<br>Konversi GeoJSON ke format biner terkompresi atau streaming chunks via Rust WASM. | `apps/public/world.geojson`<br>`apps/public/city_province_cells.json` | **L** | Tim Engine & WASM |

---

## 3. Matriks Pencegahan Bentrok Berkas (Conflict Matrix)

Untuk memastikan pekerjaan paralel berjalan mulus tanpa konflik merge git:
1. **Aturan Domain Independen**:
   - Agen Keamanan fokus pada `apps/src-tauri/` dan `apps/src/app/api/`.
   - Agen QA fokus pada `apps/tests/` dan `scripts/`.
   - Agen Bahasa (i18n) fokus pada penambahan key di `terjemahan_paused_menu/` dan komponen modal daun (leaf components).
   - Agen Data fokus pada `json/` dan query SQL.
2. **Karantina Berkas Raksasa (`map-system.tsx`)**:
   - Pada Sprint 1 dan 2, modifikasi pada `map-system.tsx` dibatasi hanya pada perbaikan listener dan penggantian tombol (TSK-104, TSK-201, TSK-205).
   - Dekomposisi besar (TSK-301) harus dilakukan secara terisolasi di branch khusus sebelum penggabungan fitur baru.
