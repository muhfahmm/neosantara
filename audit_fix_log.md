# Catatan Perbaikan Audit Neosantara (audit_fix_log.md)

Laporan berkala hasil perbaikan bertahap berdasarkan temuan [audit_report.md](file:///d:/project-sendiri/neosantara/audit_report.md) dan prioritas [audit_backlog.md](file:///d:/project-sendiri/neosantara/audit_backlog.md).

---

## TAHAP 0: KEPUTUSAN DATA & LAPORAN VERIFIKASI

- **COUNTRIES_DATA (`apps/src/app/page/map_system/map-data.ts`)**: 212 negara
- **SQL Profil (`json/semua_fitur_negara/0_profiles/database_profiles_negara.pg.sql`)**: 212 negara
- **Profil Sosial (`json/semua_fitur_negara/0_profiles/countryProfilesData.ts`)**: 212 negara
- **Angka 207 di UI**:
  - Ditemukan pada `apps/src/app/page/map_system/pilih-negara/pilih-negara.tsx:450`:
    `<StatusItem ... label={t('pilih_negara.total_countries')} value="207" />`
  - Angka "207" tersebut adalah teks statis lama sebelum penambahan 5 entitas baru ke basis data resmi (212 negara).
  - Pada `apps/src/app/api/country-data/route.ts:26`, rentang benua sebelumnya juga di-hardcode `order <= 207`.
- **Status Data**: Tidak ada data yang dihapus. Seluruh 212 negara lengkap dan konsisten pada sumber data utama.

---

## TAHAP 1: QUICK WINS

**Cabang Git**: `fix/tahap-1-quick-wins`  
**Status Build**: LULUS (`next build --webpack` sukses dalam 77 detik, tanpa error TypeScript).  
**Status Test**: LULUS (Semua 7 suite pengujian unit hijau 100%).

### 1. Item yang Diselesaikan

| ID Temuan / Tugas | Berkas Diubah | Ringkasan Perubahan | Bukti Sebelum / Sesudah |
| :--- | :--- | :--- | :--- |
| **BID-2-001** | `apps/src/app/api/country-data/route.ts` | Menghapus rentang `order <= 207`; membaca benua dari properti `continent` pada `COUNTRIES_DATA` dengan pemetaan ID Bahasa Indonesia. | **Sebelum**: order 208-212 mengembalikan `'Lainnya'`.<br>**Sesudah**: 212/212 negara memiliki benua resmi; tes assert `invalid.length === 0` lulus. |
| **BID-7-001** | `apps/tests/apiResponseCache.test.mjs`<br>`apps/tests/tempatWisata.test.mjs` | 1. Memperbaiki pemanggilan async `await setCachedResponse` pada test suite cache.<br>2. Menyelaraskan path seed SQL pada `tempatWisata.test.mjs` agar lulus baik saat dijalankan dari root maupun folder `apps/`. | **Sebelum**: 3 tes `apiResponseCache` fail karena `startsWith` & `byteLength` undefined; `tempatWisata` fail saat dijalankan dari root.<br>**Sesudah**: Seluruh tes unit pass 100%. |
| **BID-7-002** | `apps/package.json` | Dilewati penambahan `"type": "module"` karena berisiko merusak integrasi module resolver Next.js & Electron/Tauri; diganti dengan menyeragamkan runner dan path test. | Terverifikasi aman; seluruh file `.mjs` berjalan lancar di Node.js native test runner. |
| **BID-1-002 / TSK-104** | `apps/src/app/page/map_system/map-system.tsx`<br>`terjemahan_paused_menu/*/game.json` | Mengganti 2 pemanggilan `alert()` fallback pada tombol kalender (Liburan & Militer) dengan notifikasi inbox game yang terintegrasi i18n di 8 bahasa. | **Sebelum**: Dialog alert browser native `alert("Mode Liburan...")`.<br>**Sesudah**: Notifikasi game via `setNotifications` dengan key `t('game.calendar.*')`. |
| **BID-1-003, 1-004, 1-005** | `beritaAneksasiLogic.ts`<br>`tingkatkanHubunganModals.tsx`<br>`missionModals.tsx` | 1. Mengganti kata "pencaplokan" menjadi "aneksasi".<br>2. Mengganti komentar & label "Budget Info" menjadi "Informasi Kas & Anggaran".<br>3. Mengganti "Kedubes" pada navigasi misi menjadi "Kedutaan Besar". | Istilah baku dan konsisten diterapkan pada seluruh layer narasi dan modal. |
| **BID-1 Tabel Teks (no 1-5, 13-15)** | `map-system.tsx`<br>`terjemahan_paused_menu/*/game.json` | 1. Label header kalender diganti dari teks statis "SIMULATION CALENDAR" ke `{t('game.calendar.simulationCalendar')}`.<br>2. Verifikasi modal no 13-15 (`KementerianModal`, `NeonAlertModal`, `RequireEmbassyModal`) sudah terhubung dengan hook translasi. | Teks kalender kini terlokalisasi di semua 8 bahasa resmi game. |
| **BID-4-002 / TSK-205** | `apps/src/app/page/map_system/map-system.tsx` | Menambahkan kelas utilitas touch target minimal 44x44px (`min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0`) pada tombol aksi kalender mobile tanpa mengubah ukuran visual desktop. | Memenuhi standar Apple HIG / Android touch target untuk perangkat layar sentuh. |
| **BID-3-002** | `apps/src/app/logic/relationTiers.ts`<br>`diplomaticOfferLogic.ts` | Mengekspor konstanta `RELATION_THRESHOLDS` terpusat dari `relationTiers.ts` dan menggunakannya di `DIPLOMATIC_OFFER_CONFIG` tanpa mengubah ambang numerik eksisting. | Single Source of Truth untuk ambang batas relasi diplomatik dan kedutaan. |
| **BID-4-001** | `kesejahteraanCalculator.ts`<br>`consumptionLogic.ts`<br>`rust_map_mobile/index.ts` | Memverifikasi penggunaan `window.innerWidth`. Terbukti bahwa di `kesejahteraanCalculator.ts` dan `consumptionLogic.ts` hanya digunakan di dalam guard `if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' && ...) console.debug(...)`, dan di `rust_map_mobile` sudah memiliki guard `typeof window === 'undefined'`. | Tidak berdampak pada komputasi SSR atau nilai logika game. Status aman terdokumentasi. |

### 2. Item yang Dilewati / Ditunda

- **BID-7-002 ("type": "module" di package.json)**: Dilewati karena repositori menggunakan build Next.js Webpack dan skrip Node hybrid CommonJS/ESM. Mengubah package root menjadi type module berisiko merusak build runtime. Diganti dengan perbaikan runner tes.
