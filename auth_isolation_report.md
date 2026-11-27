# Laporan Audit Isolasi Data Antar Pengguna (Google Login)

**Tanggal:** 27 November 2026  
**Status:** Audit Selesai (Langkah 0)  
**Tujuan:** Menganalisis seluruh alur autentikasi, API route, skema penyimpanan data save, storage lokal klien (web & Tauri), dan potensi kebocoran data antar pengguna sebelum eksekusi migrasi dan isolasi.

---

## 1. Alur Login Google (Klien & Server)

### 1.1 Provider & Sesi
- **Provider:** Firebase Auth (`signInWithPopup` dengan `GoogleAuthProvider` di web) dan Android Play Games Sign-In di Tauri Android (`play_games_sign_in` plugin bridge).
- **Format Token:** Firebase ID Token (JWT bertanda tangan RS256 oleh Google Identity Toolkit).
- **Penyimpanan di Klien:**
  - Firebase SDK menyimpan sesi dan token di IndexedDB bawaan Firebase (`firebaseLocalStorageDb`) via `setPersistence(auth, browserLocalPersistence)`.
  - Helper klien `getFirebaseAccessToken()` ([firebaseClient.ts](file:///d:/project-sendiri/neosantara/apps/src/lib/firebaseClient.ts)) memanggil `user.getIdToken()` dan menyuntikkan header `Authorization: Bearer <token>` melalui `fetchWithFirebaseAuth()`.
- **Verifikasi di Server:**
  - Dilakukan di [firebaseAdmin.ts](file:///d:/project-sendiri/neosantara/apps/src/lib/firebaseAdmin.ts) via `verifyFirebaseRequest(request)`.
  - Jika `FIREBASE_SERVICE_ACCOUNT_JSON` tersedia, menggunakan `firebase-admin/auth` `verifyIdToken()`.
  - Jika tidak tersedia (lingkungan dev/local), menggunakan fallback verifikasi kriptografi RS256 via kunci sertifikat publik x509 Google (`https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`).
  - Mengembalikan `decoded.uid` yang terverifikasi secara kriptografis.

---

## 2. Pemetaan Seluruh Route `/api`

| Route | Metode | Kategori | Penjelasan & Penandaan Per-User |
|---|---|---|---|
| `/api/game-save` | `GET, POST, DELETE` | **Per-User (Kritis)** | Membaca daftar save, memuat detail save, menyimpan save baru / menimpa save, serta menghapus save. Wajib terisolasi ketat berdasarkan `owner_uid`. |
| `/api/country-data` | `GET` | Statis / Publik | Membaca berkas JSON profil default negara (`/public/country_data/...`). Berisi data awal (populasi dasar, ibukota, dll). |
| `/api/country-data-version` | `GET` | Statis / Publik | Memeriksa checksum dan versi data negara untuk cache browser. |
| `/api/building-metadata` | `GET` | Statis / Publik | Mengembalikan metadata master gedung dan level upgrade. |
| `/api/price-data` | `GET` | Master Global | Mengambil harga komoditas acuan awal negara dari database master. |
| `/api/production-requirements` | `GET` | Statis / Publik | Data kebutuhan material produksi. |
| `/api/relations-data` | `GET` | Statis / Publik | Data relasi diplomatik awal antar-negara. |
| `/api/trade-agreement-data` | `GET` | Statis / Publik | Data pakta dagang standar. |
| `/api/travel-fuel-data` | `GET` | Statis / Publik | Data konsumsi bahan bakar perjalanan diplomatik. |
| `/api/sda-data` | `GET` | Statis / Publik | Data cadangan sumber daya alam per negara. |
| `/api/tourism-data` | `GET` | Statis / Publik | Data sektor pariwisata awal. |
| `/api/pajak-negara` | `GET` | Statis / Publik | Tarif pajak standar per provinsi. |
| `/api/doktrin-keterbukaan` | `GET` | Statis / Publik | Matriks doktrin keterbukaan ideologi/politik. |
| `/api/icbm-data` | `GET` | Statis / Publik | Konfigurasi rudal balistik. |
| `/api/war-simulation` | `POST` | Servis Kalkulasi | Logika kalkulasi pertempuran tanpa menyimpan state pengguna di server. |
| `/api/game-bootstrap` | `GET` | Statis / Publik | Bundle bootstrap aset awal permainan. |
| `/api/simulation-date-timing` | `POST` | Metrik / Telemetri | Pencatatan performa timing tick simulasi (telemetri). |
| `/api/client-error` | `POST` | Log Telemetri | Pencatatan error logging klien ke server. |
| `/api/alokasi-subsidi` | `*` | Disabled / Dialihkan | Route lama, mengembalikan 400 bahwa state subsidi disimpan via `/api/game-save`. |
| `/api/sistem-ekonomi` | `*` | Disabled / Dialihkan | Route lama, mengembalikan 400 bahwa kebijakan disimpan via `/api/game-save`. |

---

## 3. Skema Tabel Database `game_saves`

- **Tabel:** `game_saves` (PostgreSQL)
- **Definisi Kolom:**
  - `id`: `SERIAL PRIMARY KEY` (integer autoincrement berurutan saat ini).
  - `save_name`: `VARCHAR(255) NOT NULL`
  - `country_name`: `VARCHAR(255) NOT NULL`
  - `country_iso`: `VARCHAR(10) NOT NULL`
  - `game_date`: `VARCHAR(100) NOT NULL`
  - `capital`: `VARCHAR(255)`
  - `jumlah_penduduk`: `BIGINT DEFAULT 0`
  - `anggaran`: `NUMERIC(20, 0) DEFAULT 0`
  - `ideology`: `VARCHAR(100)`
  - `religion`: `VARCHAR(100)`
  - `un_vote`: `INT DEFAULT 0`
  - `country_detail`: `TEXT` (JSON detail permainan)
  - `owner_uid`: `TEXT` (sebelumnya `NULL`, perlu dimigrasikan menjadi `NOT NULL` dengan backward-compatibility)
  - `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  - `updated_at`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`
  - `schema_version`: `VARCHAR(20) DEFAULT 'v1'`
  - `version`: `INT DEFAULT 1`
  - `idempotency_key`: `VARCHAR(128)`
- **Kondisi Data Saat Ini (Hasil Query Langsung):**
  - **Total Save File:** 4 baris.
  - **Save dengan `owner_uid` terisi:** 1 baris (`id: 9`, `owner_uid: 'kG6z9tEPgLOEMIdaIKNBircPQv22'`).
  - **Save tanpa `owner_uid` (`unowned` / `NULL`):** 3 baris (`id: 5, 6, 7`).
  - **Sesuai Instruksi:** Data lama tanpa pemilik **TIDAK DIHAPUS**. Disediakan skrip migrasi klaim mandiri (`scripts/claim_saves.ts`) agar pengguna dapat mengaitkan save tak bertuan ke UID tertentu secara aman.

---

## 4. Audit Storage Klien (Web & Memori)

### 4.1 Global vs Data Per-User

| Tempat Penyimpanan | Key / Pola | Sifat Data | Keputusan Isolasi |
|---|---|---|---|
| **localStorage** | `app_language`, `neosantara_theme`, `neosantara_map_display_settings`, `neosantara_music_volume`, `neosantara_sfx_volume` | Preferensi Perangkat/Hardware | **Tetap Global** (tidak butuh prefix user). |
| **gameStateStorage (Memori Klien)** | `player_diamonds`, `neosantara_player_xp`, `presiden_simulator_mission_completions`, `presiden_simulator_active_mission`, `presiden_simulator_claimable_missions`, `neosantara_achievements_state`, `dailyRewardData`, `programNuklirActive`, `icbmBuildTask`, `neosantara_covert_personnel`, `requested_attack_requests_v1`, `neosantara_pbb_security_council_election`, `pbb_war_sanction_history_v1`, `neosantara_org_applications_v1`, `deployed_units_config`, `hutangs_v1`, dll. | **Sangat Per-User (Progres Permainan)** | **Wajib diisolasi dengan namespace scoped storage per UID** (`neo:{uid}:...`). Saat ganti akun / logout, seluruh Map dan memori wajib di-purge dan di-reset ke baseline UID baru. |
| **sessionStorage** | `presiden_simulator_load_save`, `neosantara_active_session_sync`, `presiden_simulator_new_game`, `presiden_simulator_returning_from_dialog`, `dialog-terbuka-notification`, `programNuklirActive`, `program_nuklir_modal_open`, `icbm_detail_open`, `perang_nuklir_detail_open` | **Sesi Permainan Aktif** | **Wajib ber-prefix `neo:{uid}:`**. Menghindari user 2 membaca staging save game user 1 saat refresh browser di sesi yang sama. |
| **IndexedDB** | `presiden_simulator_pending_saves` (`saves`, `active_session`) | **Snapshot Permainan Klien** | **Wajib terisolasi per UID** (tambahkan kolom/key `owner_uid` atau store terisolasi). |
| **Window Globals (`window.neosantara_*`)** | `neosantara_player_country_detail`, `neosantara_player_capital`, `neosantara_player_attack`, `neosantara_annexed_countries`, `neosantara_country_color_overrides`, `neosantara_city_owner`, `neosantara_province_religion_overrides`, `neosantara_province_ideology_overrides`, `neosantara_diplomacy_map_colors`, `__neosantara_active_sync_save` | **State Permainan di Runtime** | **Wajib di-reset total** saat logout atau ganti akun. |
| **Modul Singletons / In-Memory** | NPC simulation state (`activeNpcState`), time controllers, cached tutorial progress | **Runtime State** | Panggil `clearActiveNpcCountrySimulationState()`, reset calendar/time controller, dan reset tutorial progress saat ganti akun. |

---

## 5. Penyimpanan Lokal Tauri (Desktop & Mobile)

- **Audit Kode Tauri:**
  - File `apps/src-tauri/src/lib.rs` hanya mengimplementasikan plugin native Android Play Games (`play_games_sign_in`, `play_games_current_user`, `play_games_id_token`, `play_games_sign_out`).
  - Belum ada Rust command untuk direct filesystem saving. Aplikasi Tauri saat ini berjalan sebagai web frontend yang terhubung ke backend server HTTP Next.js dan PostgreSQL.
  - Untuk mendukung kebutuhan offline/lokal Tauri yang terisolasi per-UID:
    - Menyiapkan modul penyimpanan lokal aman dengan pemisahan direktori per user (`saves/{sanitized_uid}/`) dengan validasi anti-path traversal (mencegah `../` atau karakter ilegal).
    - Memastikan mode offline mengingat `last_authenticated_uid` tanpa membocorkan data ke akun lain.

---

## 6. Rencana Aksi Implementasi

1. **Database:**
   - Ubah `id` save baru menjadi UUID v4 (dengan tetap mempertahankan integer ID lama untuk backward compatibility).
   - Pastikan indeks `(owner_uid, id)` dan `(owner_uid, updated_at DESC)` aktif.
   - Buat skrip klaim save `scripts/claim_saves.ts` untuk pengguna mengaitkan 3 save tak bertuan ke UID pilihannya.
2. **Server Security & API:**
   - Buat helper `requireUser(request)` terstandarisasi di `apps/src/lib/serverAuth.ts` yang memvalidasi `Authorization: Bearer <token>`.
   - Implementasikan Zod schema validation untuk payload save.
   - Gunakan `WHERE owner_uid = $uid` untuk semua query save. Jika tidak ditemukan atau milik user lain, kembalikan **404 Not Found**.
   - Tambahkan in-memory rate limiter per UID untuk endpoint mutasi save.
3. **Scoped Client Storage & Account Switch:**
   - Buat `apps/src/app/logic/scopedStorage.ts` yang mengisolasi key dengan prefix `neo:{uid}:`.
   - Buat fungsi migrasi satu kali dari legacy un-prefixed keys ke UID pertama yang login.
   - Implementasikan listener pergantian akun yang membersihkan seluruh `window.neosantara_*`, `gameStateStorage`, dan me-reload context tanpa race condition.
4. **Server Cache & Header Keamanan:**
   - Pastikan endpoint game save dan data sensitif menambahkan header `Cache-Control: private, no-store, must-revalidate`.
   - Isolasi key in-memory cache server jika ada respons dinamis.
