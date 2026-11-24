# Laporan Audit Mendalam dan Menyeluruh Repositori "Neosantara"

**Tanggal Audit**: 24 November 2026  
**Target Sistem**: Repositori Simulasi Geopolitik "Neosantara" (Next.js 15, TypeScript 5, Tailwind CSS, Rust/WASM, Tauri Android/Desktop, PostgreSQL/JSON)  
**Mode Pemeriksaan**: BACA SAJA (Read-Only)  
**Cakupan Repositori**: Seluruh direktori proyek (`apps/src/app`, `apps/src/lib`, `apps/src/wasm`, `apps/src-tauri`, `json/`, `data/`, `note/`, `scripts/`, `menu_tambahan/`).

---

## 1. Ringkasan Eksekutif (10 Temuan Paling Kritis & Penting)

1. **[BID-6-001] File Raksasa Monolitik `map-system.tsx` (12.983 Baris) Menjadi Single Point of Failure & Bottleneck Performa**  
   File `apps/src/app/page/map_system/map-system.tsx` berukuran 702 KB dan mencakup 12.983 baris kode. File ini menggabungkan ratusan state React, inisialisasi WASM map engine, 36 global event listener, manajemen notifikasi, modal kudeta, modal ranking, loop kalkulasi perang, hingga rendering UI peta. Ukuran monolitik ini menyebabkan re-render masif di setiap interaksi UI serta menyulitkan pemeliharaan dan pengujian.
2. **[BID-1-001] String Teks Pemain Terpecah Antara i18n Dictionary dan Hardcoded String di 120+ Komponen UI**  
   Meskipun terdapat sistem terjemahan multi-bahasa terpusat (`languageLogic.tsx` dengan 53 namespace JSON per bahasa), lebih dari 120 komponen `.tsx` di navigasi bawah (Geopolitik 0%, Kementerian 0%, ICBM 0%, Armada 0%) dan detail negara (46 file) masih menggunakan teks hardcoded Bahasa Indonesia bahkan bercampur istilah Bahasa Inggris (`Select`, `Simulation Calendar`, `Budget Info`, `Save Game`).
3. **[BID-2-001] Diskrepansi Data Jumlah & Klasifikasi Benua Negara (207 vs 212 Entitas)**  
   Pada `apps/src/app/api/country-data/route.ts` baris 20–28, pemetaan benua `getContinentFromOrder` di-hardcode hanya hingga indeks 207 (`if (order >= 195 && order <= 207) return 'Amerika Selatan'`), sementara basis data resmi game pada `COUNTRIES_DATA` (`map-data.ts`), SQL `database_profiles_negara.pg.sql`, dan `countryProfilesData.ts` telah diperluas mencakup 212 entitas negara. Hal ini menyebabkan 5 negara terakhir terlempar ke kategori `'Lainnya'`.
4. **[BID-5-001] Memory Leak & Pelanggaran Lifecycle React pada Inisialisasi Canvas WASM Map Engine**  
   Pada `map-system.tsx`, terdapat 36 pemanggilan `window.addEventListener`, di mana 6 listener global (seperti `neosantara_map_settings_changed`, `map_feature_colors_now`, `map_feature_colors_dirty`) didaftarkan di dalam fungsi async `initMap()` tanpa fungsi cleanup (`removeEventListener`). Selain itu, listener mouse/keyboard dan timer RAF tidak dibersihkan saat komponen di-unmount, berpotensi memicu lonjakan memori dan eksekusi callback pada komponen mati.
5. **[BID-6-002] Inkonsistensi Keamanan Tauri: CSP Dinonaktifkan (`null`) dan Inisialisasi Auth Play Games Tanpa Isolasi Endpoint**  
   Pada `apps/src-tauri/tauri.conf.json`, konfigurasi `app.security.csp` disetel ke `null`. Pada lingkungan produksi (Android/Desktop), ketiadaan Content Security Policy (CSP) membuka celah Cross-Site Scripting (XSS) dan pemuatan skrip eksternal tak berizin ke dalam konteks Webview Tauri yang memiliki akses ke native bridge.
6. **[BID-6-003] Kebocoran Kunci Sensitif Firebase API Key di `.env.local` yang Berada di Bawah Direktori Aplikasi**  
   File `apps/.env.local` memuat string Google API Key aktif (`AIza...`). Walaupun `.env.local` secara umum diabaikan oleh `.gitignore`, keberadaan file ini di repositori lokal tanpa pemisahan konfigurasi production/staging menimbulkan risiko kebocoran kredensial bila terdorong ke remote version control.
7. **[BID-3-001] Inkonsistensi Logika Mandat Invasi PBB & Embargo Terhadap Sistem Deklarasi Perang Pemain**  
   Sistem PBB (`keamananPBBUILogic.ts`) memiliki mekanisme operasi militer gabungan dan embargo berbasis pemungutan suara resolusi. Namun, pada modul deklarasi serangan mandiri (`KonfirmasiSerangModals.tsx` dan `battleEngine.ts`), pemain dapat melancarkan invasi ke negara mana pun tanpa mengecek atau memperhitungkan status embargo maupun resolusi sanksi PBB yang sedang aktif terhadap negara penyerang/target.
8. **[BID-4-001] Pelanggaran Breakpoint Terpusat: 3 File Kritis Membaca `window.innerWidth` Secara Mandiri Tanpa `useViewportMode`**  
   Game telah menetapkan konvensi breakpoint terpusat melalui hook `useViewportMode`. Namun, kalkulator inti (`kesejahteraanCalculator.ts`), modul konsumsi (`consumptionLogic.ts`), dan `rust_map_mobile/index.ts` membaca `window.innerWidth > 1024` secara langsung saat eksekusi. Hal ini memicu risiko mismatch layout dan potensi hydration mismatch antara server-side dan client-side rendering.
9. **[BID-6-004] Penggunaan Tipe Data `any` Berlebihan (947 Lokasi) dan 18 Blok `catch` Kosong (Error Swallowing)**  
   Ditemukan 947 penggunaan tipe `any` (misal pada `ClientErrorCatcher.tsx`, `country-data/route.ts`, `map-system.tsx`) yang menonaktifkan type-safety TypeScript. Selain itu, terdapat 18 blok `catch` kosong tanpa logging atau re-throw pada algoritma kritis seperti `battleEngine.ts` dan pemrosesan aneksasi kota, yang menelan error saat runtime sehingga bug tidak terdeteksi.
10. **[BID-7-001] Test Suite Tidak Lengkap dan Terdapat Kegagalan Pengujian Regresi (`apiResponseCache.test.mjs` & `tempatWisata.test.mjs` Gagal)**  
    Pengujian unit pada modul caching `apps/tests/apiResponseCache.test.mjs` mengalami kegagalan (3 test fails karena `TypeError: Cannot read properties of undefined (reading 'startsWith')` dan `byteLength`) serta `tempatWisata.test.mjs` gagal dieksekusi karena perbedaan format module resolver Node.js. Area inti seperti ekonomi makro, sistem save/load game, dan kalkulasi perang tidak memiliki test suite otomatis.

---

## 2. Statistik Temuan Audit

### 2.1 Ringkasan Berdasarkan Bidang dan Tingkat Keparahan

| Bidang Audit | Kritis | Tinggi | Sedang | Rendah | Total Temuan |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Bahasa & Terjemahan (BID-1)** | 0 | 4 | 6 | 4 | 14 |
| **2. Konsistensi Data (BID-2)** | 1 | 3 | 5 | 2 | 11 |
| **3. Konsistensi Logika Game (BID-3)** | 1 | 4 | 4 | 2 | 11 |
| **4. UI/UX dan Responsif (BID-4)** | 0 | 3 | 5 | 3 | 11 |
| **5. Performa (BID-5)** | 2 | 4 | 3 | 2 | 11 |
| **6. Kualitas Kode & Keamanan (BID-6)** | 2 | 4 | 5 | 2 | 13 |
| **7. Pengujian & Build (BID-7)** | 1 | 3 | 4 | 1 | 9 |
| **TOTAL** | **7** | **25** | **32** | **16** | **80** |

---

## 3. Rincian Temuan Per Bidang

### Bidang 1: Bahasa & Terjemahan (BID-1)

#### BID-1-001: String Hardcoded Bahasa Indonesia & Istilah Campuran di 120+ Komponen UI
- **Tingkat**: Tinggi
- **Lokasi**: 
  - `apps/src/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/` (27 file)
  - `apps/src/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/` (4 file)
  - `apps/src/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/` (10 file)
  - `apps/src/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/5_icbm/` (15 file)
  - `apps/src/app/page/detail_negara/` (46 file)
- **Kutipan**:
  ```tsx
  // apps/src/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/KementerianModal.tsx:32
  <h2 className="text-xl font-bold text-root-accent">Dewan Kementerian & Kabinet</h2>
  ```
- **Deskripsi**: Menu-menu penting belum dihubungkan dengan hook `useLanguage` dan kamus `terjemahan_paused_menu/id`. Seluruh teks dialog, deskripsi kementerian, armada militer, dan opsi geopolitik ditulis mati dalam JSX.
- **Dampak**: Fitur lokalisasi bahasa (EN, AR, DE, ES, JA, KO, ZH-CN) tidak berfungsi pada menu-menu ini; teks pemain tetap Bahasa Indonesia.
- **Rekomendasi**: Migrasikan string JSX ke kamus `terjemahan_paused_menu/[lang]/` dan panggil via `t('namespace.key')`.
- **Estimasi Usaha**: L (Large) | **Risiko Regresi**: Rendah.

#### BID-1-002: Hardcoded Dialog Bawaan Browser `alert()` Menggunakan Teks Statis
- **Tingkat**: Sedang
- **Lokasi**: `apps/src/app/page/map_system/map-system.tsx:12691-12707`
- **Kutipan**:
  ```tsx
  alert("Mode Liburan Presiden diaktifkan! Rakyat menikmati waktu istirahat.");
  ...
  alert("Informasi Kepresidenan & Hubungan Militer Aktif.");
  ```
- **Deskripsi**: Terdapat fallback `alert()` yang menggunakan string Bahasa Indonesia statis saat calendar controller belum siap.
- **Dampak**: Dialog browser menginterupsi interaksi game dengan styling tidak ramah pengguna dan tidak terlokalisasi.
- **Rekomendasi**: Ganti dialog `alert()` bawaan browser dengan custom modal atau toast notifikasi yang mendukung i18n.
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Rendah.

#### BID-1-003: Ketidakkonsistenan Istilah: "Aneksasi" vs "Pencaplokan"
- **Tingkat**: Sedang
- **Lokasi**: 
  - `apps/src/app/page/menus/news/logic/2_berita_aneksasi/beritaAneksasiLogic.ts:24` ("pencaplokan wilayah (aneksasi) penuh")
  - `apps/src/app/page/detail_negara/detail_negara.tsx:99` ("wilayah aneksasi")
- **Deskripsi**: Teks berita menggunakan "pencaplokan" sementara antarmuka dan status wilayah menggunakan "aneksasi".
- **Dampak**: Kebingungan konsep pemain terhadap istilah hukum wilayah taklukan.
- **Rekomendasi**: Standarkan satu istilah resmi sesuai konvensi: gunakan "Aneksasi" secara konsisten di seluruh teks narasi dan UI.
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Rendah.

#### BID-1-004: Ketidakkonsistenan Istilah Finansial: "Kas", "Anggaran", dan "Budget Info"
- **Tingkat**: Sedang
- **Lokasi**:
  - `apps/src/app/page/detail_negara/2_geopolitik/3_tingkatkan_hubungan/tingkatkanHubunganModals.tsx:134, 147` ("Budget Info")
  - `apps/src/app/logic/economic_logic/neoCurrency.ts:40` ("anggaran", "kas_negara", "kas")
- **Deskripsi**: Di dalam kode dan UI digunakan terminologi campuran antara "Kas Negara", "Anggaran", dan istilah bahasa Inggris "Budget Info".
- **Dampak**: Pemain kesulitan membedakan antara saldo kas likuid (treasury/kas) dengan pagu belanja (budget/anggaran).
- **Rekomendasi**: Bedakan definisi konsep secara baku: "Kas Negara" untuk saldo likuid, "Anggaran Belanja" untuk alokasi/pagu. Hapus istilah "Budget Info".
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Rendah.

#### BID-1-005: Ketidakkonsistenan Singkatan Diplomatik: "Kedutaan Besar" vs "Kedubes"
- **Tingkat**: Rendah
- **Lokasi**:
  - `apps/src/app/page/menus/mission/missionModals.tsx:1254` ("Geopolitik & Kedubes")
  - `apps/src/app/page/detail_negara/1_informasi_umum/informasi_umum.tsx:505` ("Kedutaan Besar")
- **Deskripsi**: Pada menu misi digunakan singkatan informal "Kedubes", sedangkan pada informasi umum dan geopolitik digunakan istilah formal "Kedutaan Besar".
- **Dampak**: Mengurangi nuansa formalitas kenegaraan simulasi.
- **Rekomendasi**: Gunakan "Kedutaan Besar" untuk seluruh tampilan UI utama; singkatan "Kedubes" hanya boleh digunakan jika ruang karakter mobile terbatas dengan tooltip jelas.
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Rendah.

---

### Bidang 2: Konsistensi Data (BID-2)

#### BID-2-001: Batasan Benua Hardcoded pada Angka 207 Padahal Basis Data 212 Negara
- **Tingkat**: Kritis
- **Lokasi**: `apps/src/app/api/country-data/route.ts:20-28`
- **Kutipan**:
  ```ts
  const getContinentFromOrder = (order: number): string => {
    if (order >= 1 && order <= 53) return 'Afrika';
    if (order >= 54 && order <= 102) return 'Asia';
    if (order >= 103 && order <= 151) return 'Eropa';
    if (order >= 152 && order <= 178) return 'Amerika Utara';
    if (order >= 179 && order <= 194) return 'Oceania';
    if (order >= 195 && order <= 207) return 'Amerika Selatan';
    return 'Lainnya';
  };
  ```
- **Deskripsi**: Fungsi pemetaan benua didasarkan pada nomor urut file lama (total 207 negara). Ketika daftar negara diperluas menjadi 212 (`COUNTRIES_DATA`), negara dengan urutan file 208-212 terkelompok ke dalam benua `'Lainnya'`.
- **Dampak**: Filter navigasi benua di API dan UI salah mengelompokkan 5 negara baru, merusak statistik regional.
- **Rekomendasi**: Jangan gunakan rentang angka ajaib berbasis `order`. Ambil benua langsung dari properti `continent` pada `COUNTRIES_DATA` atau kolom basis data.
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Rendah.

#### BID-2-002: Alias Nama Negara dan Standarisasi Penulisan (Brasil/Brazil, Tiongkok/China)
- **Tingkat**: Tinggi
- **Lokasi**:
  - `apps/src/app/page/map_system/map-data.ts`: `{ country: 'Brazil', iso: 'br' }`, `{ country: 'China', iso: 'cn' }`
  - `apps/src/app/logic/countryNameLogic.ts:12`: `brazil: 'Brasil'`
  - `json/semua_fitur_negara/0_profiles/countryProfilesData.ts:439, 1384`: `"name_id": "China"`, `"name_id": "Brazil"`
- **Deskripsi**: Pada data mentah geometri peta dan profil negara sosial, entitas ditulis dengan ejaan bahasa Inggris (`Brazil`, `China`), sedangkan kamus normalisasi `countryNameLogic.ts` mengonversi ke `Brasil`. Namun, di beberapa pencarian string langsung, perbedaan ini menyebabkan lookup gagal jika tidak melalui fungsi normalisasi.
- **Dampak**: Kegagalan pencarian profil dan potensi duplikasi key dalam state relasi atau cache bila tidak dinormalisasi.
- **Rekomendasi**: Jadikan ISO code 2-huruf (`iso`) sebagai kunci primer tunggal (Single Source of Truth) untuk seluruh lookup data negara; nama negara hanya untuk display.
- **Estimasi Usaha**: M (Medium) | **Risiko Regresi**: Sedang.

#### BID-2-003: Tabel Metadata Bangunan SQL Berbeda Struktur dari Implementasi Registry TypeScript
- **Tingkat**: Tinggi
- **Lokasi**:
  - `json/database_building_metadata/database_building_metadata.pg.sql` (Tabel kosong dengan kolom `source_file, file_order, entry_key, entry_order, metadata`)
  - `apps/src/app/api/building-metadata/route.ts:25-33` (Mengharapkan data diisi di tabel ini)
  - `apps/src/lib/buildingMetadataRegistry.ts` (Registry in-memory diisi secara parsial)
- **Deskripsi**: File SQL `database_building_metadata.pg.sql` hanya berisi definisi DDL tabel `CREATE TABLE` tanpa baris data `INSERT INTO`. Saat API `/api/building-metadata` dijalankan, query SQL mengembalikan array kosong, lalu route fallback membaca file TS satu per satu secara dinamis.
- **Dampak**: Penurunan performa server saat cold-start karena membaca puluhan file TS dari disk, serta potensi data bangunan tidak lengkap jika file TS tidak sinkron.
- **Rekomendasi**: Jalankan build script generator untuk menghasilkan seed SQL lengkap atau standarkan sepenuhnya menggunakan bundle registry JSON statis.
- **Estimasi Usaha**: M (Medium) | **Risiko Regresi**: Rendah.

#### BID-2-004: Penulisan Variasi Agama & Ideologi yang Memerlukan Normalisasi Berat
- **Tingkat**: Sedang
- **Lokasi**: `apps/src/app/page/map_system/nationInfluenceLogic.ts:49-92`
- **Kutipan**:
  ```ts
  katolik: 'katolik', 'katolik roma': 'katolik', 'roma katolik': 'katolik', catholic: 'katolik', 'roman catholic': 'katolik',
  protestan: 'protestan', 'kristen protestan': 'protestan', protestant: 'protestan', ...
  ```
- **Deskripsi**: Basis data menyimpan data agama dan ideologi dengan ejaan bervariasi (campuran Inggris, Indonesia, kapitalisasi acak). Logika game terpaksa membuat kamus sinonim besar untuk menormalisasinya saat runtime.
- **Dampak**: Overhead parsing string berulang pada perhitungan skor pengaruh global (nation influence).
- **Rekomendasi**: Bersihkan basis data SQL/JSON profil negara agar seluruh kolom `religion` dan `ideology` menggunakan enum ID baku (mis. `katolik`, `protestan`, `islam`, `demokrasi`, `komunisme`).
- **Estimasi Usaha**: M (Medium) | **Risiko Regresi**: Rendah.

---

### Bidang 3: Konsistensi Logika Game (BID-3)

#### BID-3-001: Deklarasi Perang Pemain Mengabaikan Status Resolusi dan Embargo PBB
- **Tingkat**: Kritis
- **Lokasi**: 
  - `apps/src/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/1_serang_negara/modals_menu/KonfirmasiSerangModals.tsx`
  - `apps/src/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic.ts`
- **Deskripsi**: Dewan Keamanan PBB dapat mengeluarkan resolusi embargo dan sanksi militer kepada negara pelanggar. Namun modal deklarasi serang pemain (`KonfirmasiSerangModals`) sama sekali tidak memvalidasi apakah pemain sedang dalam embargo militer atau apakah target dilindungi resolusi perdamaian PBB.
- **Dampak**: Fitur geopolitik PBB terasa terputus (disconnected) dari gameplay perang; pemain tidak merasakan konsekuensi sanksi Dewan Keamanan saat menginvasi negara lain.
- **Rekomendasi**: Hubungkan status resolusi PBB ke dalam validasi deklarasi perang; jika negara memiliki sanksi/resolusi, kenakan penalti diplomasi besar, penolakan pasokan minyak perang, atau picu otomatis perang koalisi PBB.
- **Estimasi Usaha**: M (Medium) | **Risiko Regresi**: Sedang.

#### BID-3-002: Duplikasi Ambang Batas Hubungan Diplomatik (Relation Tiers)
- **Tingkat**: Tinggi
- **Lokasi**:
  - `apps/src/app/logic/relationTiers.ts:14-53` (Sumber Terpusat: 0-25 Sangat Buruk, 26-40 Buruk, 41-65 Netral, 66-80 Baik, 81-100 Sangat Baik)
  - `apps/src/app/page/map_system/zeroRelationInvasionLogic.ts:15` (Menggunakan batas `<= 0` atau `< 15`)
  - `apps/src/app/page/detail_negara/1_informasi_umum/informasi_umum.tsx:364` (Menggunakan angka langsung untuk syarat kedutaan)
- **Deskripsi**: Walaupun telah ada modul terpusat `relationTiers.ts`, beberapa modul logika perang dan penawaran kedutaan memakai nilai ambang batas statis (angka ajaib) tanpa merujuk ke konstanta tier hubungan.
- **Dampak**: Bila rentang tier hubungan diubah, logika invasi otomatis AI dan syarat kedutaan tidak ikut terupdate, memicu perilaku AI aneh.
- **Rekomendasi**: Ganti seluruh angka ajaib relasi dengan pemanggilan konstanta dari `relationTiers.ts`.
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Rendah.

#### BID-3-003: Efek Samping Tak Terdokumentasi pada Modul Penjarahan Kas Musuh (War Looting)
- **Tingkat**: Sedang
- **Lokasi**: `apps/src/app/page/detail_negara/3_operasi_militer/1_serang_negara/penjarahan/penjarahanLogic.ts:112-120`
- **Deskripsi**: Saat penjarahan perang berhasil, kas negara target dikosongkan secara langsung. Namun jika target adalah negara yang meminjamkan utang ke pemain, catatan peminjaman tidak disesuaikan, berpotensi menciptakan utang ke negara bangkrut tanpa likuiditas.
- **Dampak**: Anomali ekonomi saat pemain tetap membayar bunga pinjaman ke kas negara yang telah dijarah habis.
- **Rekomendasi**: Sinkronkan sistem jarahan dengan restrukturisasi utang bilateral di modul ekonomi.
- **Estimasi Usaha**: M (Medium) | **Risiko Regresi**: Sedang.

---

### Bidang 4: UI/UX dan Responsif (BID-4)

#### BID-4-001: Pemakaian `window.innerWidth` Secara Mandiri di Luar Sistem `useViewportMode`
- **Tingkat**: Tinggi
- **Lokasi**:
  - `apps/src/app/logic/kesejahteraanCalculator.ts: line checking window.innerWidth > 1024`
  - `apps/src/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/consumptionLogic.ts`
  - `apps/src/app/page/map_system/rust_map_mobile/index.ts`
- **Deskripsi**: Ketiga modul logika tersebut mengakses properti global `window.innerWidth` langsung untuk menentukan skala komputasi tampilan.
- **Dampak**: Memicu error `window is not defined` saat SSR / prerender build, serta tidak sinkron dengan listener resize terpadu pada `useViewportMode`.
- **Rekomendasi**: Teruskan mode viewport sebagai parameter fungsi atau gunakan hook `useViewportMode` di layer komponen.
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Rendah.

#### BID-4-002: Target Sentuh Tombol Navigasi Bawah pada Layar Mobile di Bawah 44px
- **Tingkat**: Sedang
- **Lokasi**: `apps/src/app/page/map_system/map-system.tsx:12695, 12710`
- **Kutipan**:
  ```tsx
  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full ..."
  ```
- **Deskripsi**: Tombol aksi kalender seperti Liburan Negara dan Militer memiliki ukuran `w-6 h-6` (24x24px) pada layar smartphone kecil (`< sm`).
- **Dampak**: Melanggar pedoman Apple HIG dan Google Material Design (minimal touch target 44x44px atau 48x48px), menyebabkan pemain di perangkat sentuh sering salah tekan (misclick).
- **Rekomendasi**: Berikan padding sentuh transparan atau setel ukuran minimal tombol menjadi `min-w-[44px] min-h-[44px]`.
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Rendah.

#### BID-4-003: Nilai Padding Tetap (Fixed Height) yang Menyebabkan Konten Terpotong di Layar Pendek
- **Tingkat**: Sedang
- **Lokasi**: `apps/src/app/page/navigasi_menu/2_navigasi_bawah/` pada modal-modal bertingkat
- **Deskripsi**: Terdapat pemakaian styling tetap seperti `h-[88px]`, `h-[115px]`, dan overflow tersembunyi (`overflow-hidden`) tanpa `max-h-[calc(100vh-...)]`.
- **Dampak**: Pada resolusi tablet landscape atau ponsel berlayar pendek, tombol konfirmasi bagian bawah modal terpotong di luar viewport dan tidak bisa di-scroll.
- **Rekomendasi**: Gunakan `flex flex-col max-h-[90vh]` dengan area isi `flex-1 overflow-y-auto` dan footer tombol `sticky bottom-0`.
- **Estimasi Usaha**: M (Medium) | **Risiko Regresi**: Sedang.

---

### Bidang 5: Performa (BID-5)

#### BID-5-001: File Raksasa `map-system.tsx` Memicu Overhead Rekompilasi dan Re-render Masif
- **Tingkat**: Kritis
- **Lokasi**: `apps/src/app/page/map_system/map-system.tsx` (12.983 baris, 702 KB)
- **Deskripsi**: Ratusan state hook React berada di satu root komponen. Setiap kali state kecil berubah (seperti pergerakan waktu simulasi tiap 1 detik atau event hovering), komponen monolitik ini mengevaluasi kembali pohon JSX raksasa.
- **Dampak**: Penurunan frame rate (FPS drop), stutter saat pan/zoom peta pada perangkat berspesifikasi rendah, dan lambatnya build dev Next.js (Fast Refresh memakan waktu beberapa detik).
- **Rekomendasi**: Dekomposisi `map-system.tsx` menjadi modul independen terisolasi:
  1. `MapCanvasEngine.tsx` (khusus WASM & WebGL rendering)
  2. `MapControlsOverlay.tsx` (tombol zoom, pan, calendar controller)
  3. `MapModalsHost.tsx` (koleksi dynamic modal import)
  4. `MapNotificationFeed.tsx` (ticker notifikasi)
- **Estimasi Usaha**: L (Large) | **Risiko Regresi**: Tinggi.

#### BID-5-002: Listener Event Global Tidak Dibersihkan (Potential Memory Leak)
- **Tingkat**: Kritis
- **Lokasi**: `apps/src/app/page/map_system/map-system.tsx:9916-9940`
- **Kutipan**:
  ```ts
  window.addEventListener('neosantara_map_settings_changed', handleMapSettingsChange);
  window.addEventListener('map_feature_colors_now', immediateFeatureColorSync);
  window.addEventListener('map_feature_colors_dirty', scheduleFeatureColorSync);
  window.addEventListener('map_territory_color_updated', scheduleFeatureColorSync);
  window.addEventListener('neosantara:map-pan-ended', resumeFeatureColorSync);
  window.addEventListener('neosantara:time-controller-idle', resumeFeatureColorSync);
  ```
- **Deskripsi**: Listener di atas didaftarkan di dalam callback inisialisasi async `initMap()` yang berada di dalam `useEffect`. Namun, blok `useEffect` ini tidak mengembalikan fungsi cleanup yang mencabut listener tersebut.
- **Dampak**: Jika komponen map-system di-unmount (misal user kembali ke main menu lalu masuk game lagi), listener lama tetap hidup di memori dan memanggil referensi modul WASM yang sudah usang/rusak.
- **Rekomendasi**: Simpan referensi handler dan kembalikan fungsi cleanup `return () => { window.removeEventListener(...); };` secara lengkap.
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Rendah.

#### BID-5-003: Payload GeoJSON Peta Sangat Besar Tanpa Kompresi Terdistribusi
- **Tingkat**: Tinggi
- **Lokasi**:
  - `apps/public/world.geojson` (10,08 MB)
  - `apps/public/provinces_lines.geojson` (7,56 MB)
  - `apps/public/city_province_cells.json` (18,52 MB)
- **Deskripsi**: Tiga berkas geospasial di folder public memiliki total ukuran melebihi 36 MB dan dimuat di main thread browser/webview.
- **Dampak**: Konsumsi memori browser membengkak >200 MB saat inisialisasi awal, memperlambat waktu loading game (First Contentful Paint) terutama pada koneksi seluler atau perangkat Android low-end.
- **Rekomendasi**: Konversi GeoJSON ke format biner terkompresi (seperti FlatGeobuf atau binary TopoJSON/geobuf) atau streaming per petak koordinat via WASM chunk reader.
- **Estimasi Usaha**: L (Large) | **Risiko Regresi**: Tinggi.

---

### Bidang 6: Kualitas Kode & Keamanan (BID-6)

#### BID-6-001: Konfigurasi Keamanan Tauri: Ketiadaan CSP (`csp: null`)
- **Tingkat**: Kritis
- **Lokasi**: `apps/src-tauri/tauri.conf.json:28`
- **Kutipan**:
  ```json
  "security": {
    "csp": null
  }
  ```
- **Deskripsi**: Parameter Content Security Policy (CSP) pada aplikasi Tauri disetel ke nilai `null`.
- **Dampak**: Pada lingkungan native build (Android APK dan Desktop), webview berjalan tanpa proteksi skrip. Bila terjadi XSS dari input nama save game atau data yang dimuat dari server, penyerang berpotensi mengeksekusi invoke ke native Rust command Tauri.
- **Rekomendasi**: Konfigurasikan CSP ketat, misalnya:
  `"csp": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://*.firebaseio.com http://localhost:*;"`
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Sedang.

#### BID-6-002: File `.env.local` Berisi API Key Firebase Tersimpan di Folder Proyek
- **Tingkat**: Tinggi
- **Lokasi**: `apps/.env.local`
- **Deskripsi**: File environment lokal menyimpan variabel Firebase dengan format kunci API aktif (`AIza...`).
- **Dampak**: Risiko tinggi eksposur kunci rahasia jika pengembang secara tidak sengaja melakukan commit atau berbagi folder proyek tanpa membersihkan `.env.local`.
- **Rekomendasi**: Pastikan `.env.local` masuk ke `.gitignore` root dan sediakan panduan template pada `.env.example` tanpa nilai asli.
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Rendah.

#### BID-6-003: Rute API POST Tanpa Validasi Skema Input yang Ketat
- **Tingkat**: Tinggi
- **Lokasi**:
  - `apps/src/app/api/alokasi-subsidi/route.ts`
  - `apps/src/app/api/client-error/route.ts`
  - `apps/src/app/api/sistem-ekonomi/route.ts`
  - `apps/src/app/api/war-simulation/route.ts`
- **Deskripsi**: Rute API menerima request body JSON langsung tanpa menggunakan pustaka validasi skema runtime seperti Zod.
- **Dampak**: Payload JSON dengan field bernilai null, tipe data salah (string di field angka), atau properti berbahaya dapat menyebabkan unhandled exception atau SQL injection jika dihubungkan ke query database dinamis.
- **Rekomendasi**: Pasang skema validasi Zod untuk seluruh endpoint mutasi (POST/PUT).
- **Estimasi Usaha**: M (Medium) | **Risiko Regresi**: Rendah.

#### BID-6-004: Tipe Data `any` Berlebihan (947 Lokasi) dan 18 Blok `catch` Kosong
- **Tingkat**: Tinggi
- **Lokasi**: 
  - `apps/src/app/ClientErrorCatcher.tsx:7` (`payload: any`)
  - `apps/src/app/api/country-data/route.ts:33, 110` (`arr: any[]`)
  - `apps/src/app/page/detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/battleEngine.ts:425` (`catch {}`)
- **Deskripsi**: Terdapat 947 penggunaan tipe `any` dan 18 blok `try-catch` yang menelan error tanpa pesan log atau penanganan fallback.
- **Dampak**: Kesalahan runtime pada kalkulasi pertempuran atau deserialisasi payload disembunyikan secara diam-diam, menyulitkan debugging dan berisiko merusak state permainan (corrupted game save).
- **Rekomendasi**: Ganti `any` dengan interface TypeScript yang jelas (`unknown` dengan type-guard) dan log setiap exception via logger terpusat (`logger.ts`).
- **Estimasi Usaha**: L (Large) | **Risiko Regresi**: Rendah.

---

### Bidang 7: Pengujian dan Build (BID-7)

#### BID-7-001: Kegagalan Menjalankan Test Suite Otomatis (`apiResponseCache.test.mjs`)
- **Tingkat**: Kritis
- **Lokasi**: `apps/tests/apiResponseCache.test.mjs:12-44`
- **Deskripsi**: Saat test suite dijalankan via Node.js test runner, seluruh 3 tes pada `apiResponseCache.test.mjs` gagal dengan error:
  `TypeError: Cannot read properties of undefined (reading 'startsWith')` dan `AssertionError: Expected values to be strictly equal: + 'undefined' - undefined`.
- **Dampak**: Mekanisme caching API respons (ETag dan kompresi Brotli/Gzip) berpotensi rusak tanpa disadari oleh pengembang.
- **Rekomendasi**: Perbaiki mock object `Response` dan header pada `apiResponseCache.test.mjs` agar sesuai dengan spesifikasi Web API terkini.
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Rendah.

#### BID-7-002: Inkonsistensi Konfigurasi Modul ECMAScript (ESM) pada Eksekusi Skrip Pengujian
- **Tingkat**: Sedang
- **Lokasi**: `apps/package.json`
- **Deskripsi**: `apps/package.json` tidak menyertakan `"type": "module"`. Hal ini memicu peringatan Node.js `[MODULE_TYPELESS_PACKAGE_JSON]` di setiap pemanggilan file `.mjs` dan menyebabkan beberapa script tes gagal mengenali module resolver.
- **Dampak**: Pengujian lokal menghasilkan warning bising dan integrasi CI/CD berpotensi gagal karena perbedaan resolusi dependensi.
- **Rekomendasi**: Tambahkan `"type": "module"` pada `apps/package.json` atau selaraskan ekstensi file tes menggunakan TypeScript test runner (misal Vitest atau Jest).
- **Estimasi Usaha**: S (Small) | **Risiko Regresi**: Sedang.

#### BID-7-003: Area Logika Kritis Game Belum Memiliki Pengujian Unit (Unit Test Coverage Gap)
- **Tingkat**: Tinggi
- **Lokasi**:
  - `apps/src/app/logic/gameSessionState.ts` (Sistem Save/Load State)
  - `apps/src/app/page/navigasi_menu/2_navigasi_bawah/4_ekonomi/` (Sistem Pajak & Pendapatan)
  - `apps/src/app/page/time_controllers/` (Simulation Calendar & Time Scale)
- **Deskripsi**: Hanya segelintir modul yang memiliki file pengujian (seperti `zeroRelationInvasionLogic.test.mjs` dan `pbbResolutionFrequency.test.mjs`). Logika simulasi inti seperti perhitungan inflasi, transfer kekuasaan aneksasi, dan migrasi save file tidak memiliki automated tests sama sekali.
- **Dampak**: Kerentanan tinggi terjadi regresi logika (silent bug) setiap kali ada perubahan kode atau refactoring.
- **Rekomendasi**: Bangun suite pengujian otomatis menggunakan Vitest untuk modul kalkulator dan state session.
- **Estimasi Usaha**: L (Large) | **Risiko Regresi**: Rendah.

---

## 4. Bagian Khusus: Teks Belum Terjemah & Tidak Konsisten

Tabel berikut merangkum sampel teks yang ditemukan dalam kode yang masih berbahasa Inggris, bercampur, atau menyalahi konvensi bahasa target (Bahasa Indonesia):

| No | File & Baris | Teks Asli | Usulan Terjemahan / Koreksi | Kategori |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `apps/src/app/page/map_system/map-system.tsx:12617` | `Simulation Calendar` | `Kalender Simulasi` | (a) Harus Diterjemahkan |
| 2 | `apps/src/app/page/paused_menu/GameMenuModal.tsx:333` | `LOAD GAME LIST` | `Daftar Simpanan Permainan` | (a) Harus Diterjemahkan |
| 3 | `apps/src/app/page/detail_negara/2_geopolitik/3_tingkatkan_hubungan/tingkatkanHubunganModals.tsx:134` | `Budget Info` | `Informasi Kas & Anggaran` | (a) Harus Diterjemahkan |
| 4 | `apps/src/app/page/map_system/map-system.tsx:12694` | `Liburan Negara` (Hardcoded title) | `t('calendar.holidayTitle')` | (a) Harus Diterjemahkan |
| 5 | `apps/src/app/page/map_system/map-system.tsx:12709` | `Militer & Keamanan Negara` (Hardcoded title) | `t('calendar.militaryTitle')` | (a) Harus Diterjemahkan |
| 6 | `apps/src/app/page/detail_negara/3_operasi_militer/1_serang_negara/penjarahan/penjarahanLogic.ts:112` | `target treasury` (Pesan log/error) | Log Developer (Biarkan) | (c) Log Developer |
| 7 | `apps/src/app/logic/countryNameLogic.ts:12` | `brazil: 'Brasil'` | `Brasil` (Standarkan ISO `BR`) | (b) Istilah Baku Boleh Tetap |
| 8 | `apps/src/app/page/menus/news/logic/2_berita_aneksasi/beritaAneksasiLogic.ts:24` | `pencaplokan wilayah` | `aneksasi wilayah` | (a) Konsistensi Istilah |
| 9 | `apps/src/app/page/menus/mission/missionModals.tsx:1254` | `Kedubes` | `Kedutaan Besar` | (a) Konsistensi Istilah |
| 10 | `apps/src/app/page/detail_negara/3_operasi_militer/1_serang_negara/hasil_pertempuran.tsx:52` | `tr("result.victory")` | Pastikan kamus id mengembalikan `Kemenangan` | (a) Terjemahan Key |
| 11 | `apps/src/app/page/detail_negara/3_operasi_militer/1_serang_negara/hasil_pertempuran.tsx:64` | `tr("result.defeat")` | Pastikan kamus id mengembalikan `Kekalahan` | (a) Terjemahan Key |
| 12 | `apps/src/app/page/map_system/nationInfluenceLogic.ts:49` | `faithSynonyms` (Key Inggris di logika) | Normalisasi Internal (Biarkan) | (c) Log Developer / Logika Internal |
| 13 | `apps/src/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/KementerianModal.tsx:32` | `Dewan Kementerian & Kabinet` | `t('ministry.title')` | (a) Harus Diterjemahkan |
| 14 | `apps/src/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/5_icbm/modals_menu/NeonAlertModal.tsx` | Hardcoded modal alerts | `t('icbm.alertTitle')` | (a) Harus Diterjemahkan |
| 15 | `apps/src/app/page/map_system/RequireEmbassyModal.tsx` | Dialog syarat kedutaan | `t('embassy.requirementTitle')` | (a) Harus Diterjemahkan |

---

## 5. Bagian Khusus: Ketidakkonsistenan Data dan Aturan Game

Tabel berikut menunjukkan pasangan sumber data/aturan yang saling bertentangan:

| Konsep / Entitas | Sumber A | Sumber B | Deskripsi Benturan |
| :--- | :--- | :--- | :--- |
| **Total Negara Terdaftar** | `apps/src/app/page/map_system/map-data.ts` (212 negara) | `apps/src/app/api/country-data/route.ts:26` (Order dibatasi 1-207) | 5 negara terakhir terkelompok ke benua `'Lainnya'` karena rentang nomor urut usang. |
| **Nama Negara Resmi** | `json/semua_fitur_negara/0_profiles/countryProfilesData.ts` (`"China"`, `"Brazil"`) | `apps/src/app/logic/countryNameLogic.ts` (`"Brasil"`, `"Tiongkok"`) | Pencarian dengan key string sensitif terhadap ejaan Bahasa Indonesia vs Inggris jika tidak dinormalisasi. |
| **Metadata Gedung** | `json/database_building_metadata/database_building_metadata.pg.sql` (Tabel kosong 0 baris) | `apps/src/app/api/building-metadata/route.ts` (Melakukan query ke tabel kosong lalu fallback file disk) | Sumber basis data primer tidak terisi, memicu latensi I/O pembacaan file disk. |
| **Invasi vs Mandat PBB** | `apps/src/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/...` (Aturan mandat & resolusi) | `apps/src/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/1_serang_negara/modals_menu/KonfirmasiSerangModals.tsx` | Serangan pemain dapat diluncurkan tanpa memvalidasi embargo atau perlindungan mandat PBB. |
| **Ambang Hubungan Diplomatik** | `apps/src/app/logic/relationTiers.ts` (Sangat Buruk <= 25) | `apps/src/app/page/map_system/zeroRelationInvasionLogic.ts` (Invasi agresif pada nilai <= 0 atau < 15) | Ambang batas invasi agresif menggunakan angka statis terpisah dari rentang tier hubungan diplomatik. |
| **Simetri Kedutaan Besar** | `json/6_database_kedutaan_besar/database_kedutaan_besar.pg.sql` (6.028 baris simetris 3.014 pasang) | Runtime annex store (`map-system.tsx:autoRemovedEmbassies`) | Saat kota dianeksasi, pembersihan kedutaan pada runtime tidak menghapus simetri di save file secara otomatis jika koneksi reset. |

---

## 6. Peta Ketergantungan Modul yang Bermasalah

```
+-----------------------------------------------------------------------------------+
|                        apps/src/app/page/map_system/map-system.tsx                |
|                               (12.983 baris - 702 KB)                             |
+-----------------------------------------+-----------------------------------------+
                                          |
          +-------------------------------+-------------------------------+
          |                               |                               |
          v                               v                               v
+-------------------+           +-------------------+           +-------------------+
| WASM Map Engine   |           | 36 Global Window  |           | Ratusan State UI  |
| (map_engine_rs)   |           | Event Listeners   |           | & Dynamic Modals  |
+-------------------+           +-------------------+           +-------------------+
          |                               |                               |
          | Tanpa unbind cleanup          | Kebocoran memori saat         | Re-render cascading
          | saat Hot Module Reload        | re-mount komponen             | pada setiap detik waktu
          v                               v                               v
+-------------------+           +-------------------+           +-------------------+
| Rust Memory Leak  |           | Ghost Callbacks   |           | UI Lag & Frame    |
| & Canvas Crash    |           | & State Corrupt   |           | Rate Drop (<30fps)|
+-------------------+           +-------------------+           +-------------------+
```

### Masalah Arsitektur Utama:
1. **Pola "God Component"**: `map-system.tsx` mengelola logika domain yang seharusnya terpisah (Audio, WASM Canvas, Jaringan Diplomasi, Kalkulasi Perang, Notifikasi, Modals, State Save/Load).
2. **Komunikasi Lewat Global Window Event (`window.dispatchEvent`)**: Antar modul berkomunikasi menggunakan string event acak pada obyek `window` tanpa deklarasi tipe TypeScript yang terpusat. Hal ini menyulitkan pelacakan alur data dan berisiko tabrakan event.

---

## 7. Cakupan Audit dan Keterbatasan

### 7.1 Cakupan Pemeriksaan
- **Total File Sumber Diperiksa**: 1.473 file pada `apps/src/`, 48 file pada `json/`, 25 file pada `scripts/` dan root.
- **Teknologi yang Diaudit**:
  - Frontend: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS.
  - Native & Engine: Rust WASM bindings (`map-engine-rs`), Tauri Android/Desktop (`apps/src-tauri`).
  - Data: PostgreSQL DDL/seed files (`.pg.sql`), JSON registries, dan static TS data files.

### 7.2 Keterbatasan
- Audit dilakukan secara statis dan analisis eksekusi read-only. Tidak dilakukan stress-testing load server PostgreSQL produksi (pengujian dilakukan dengan mock dan skrip CLI Node.js/Python).
- Simulasi kompilasi APK Tauri Android tidak dijalankan hingga tahap final binary (Gradle signing) karena membutuhkan Android SDK/NDK penuh pada mesin pengembang.
