# Laporan Audit Lokalisasi Menu TS/TSX

**Tanggal:** 26 November 2026  
**Cakupan:** Teks UI berbahasa Indonesia yang ditulis langsung di file TS/TSX dan belum mengikuti bahasa aktif melalui kamus JSON.

## Ringkasan

Audit menemukan sejumlah teks Indonesia yang masih tampil statis di menu, modal, kartu notifikasi, kontrol waktu, dan hasil simulasi. Temuan paling luas berada pada data pencapaian misi: deskripsi, target, status, dan badge disusun sebagai string Indonesia di file TSX, bukan melalui kamus. Ada juga beberapa temuan terpisah pada modal riset, pemungutan suara PBB, notifikasi ekonomi, dan detail negara.

Tidak ada file sumber aplikasi yang diubah dalam audit ini. Laporan ini menginventarisasi temuan agar perbaikannya dapat ditinjau sebagai pekerjaan lanjutan.

## Status tindak lanjut

Temuan prioritas tinggi pada laporan ini telah dialihkan ke kamus terjemahan untuk seluruh delapan locale. Perbaikan mencakup label badge pencapaian, bonus riset, banner serangan, label pemungutan suara PBB, notifikasi ekonomi, hubungan global, detail negara, hasil perang, serta label aksesibilitas. Nama jenis pajak pada notifikasi kini disimpan sebagai ID stabil dan diterjemahkan saat dirender, agar bahasa labelnya mengikuti bahasa aktif.

Tooltip hover pada kontrol waktu dihapus sesuai permintaan; nama aksesibilitas tombol tetap tersedia melalui `aria-label`. Validasi JSON/kunci terjemahan, `npx tsc --noEmit`, dan `npm run build` berhasil. ESLint pada file TypeScript yang berubah masih melaporkan error dan warning yang perlu ditangani terpisah.

## Metode dan batasan

- Memindai 359 file TSX di `apps/src/app/page` menggunakan ekstraksi AST untuk mencari teks JSX dan atribut string, lalu meninjau konteks pemakaian dan pemanggilnya.
- Menelusuri file TS yang membentuk teks tooltip serta string UI dari data simulasi.
- Memverifikasi apakah kandidat benar-benar dirender dan apakah kamus atau pemetaan terjemahan sudah digunakan.
- Enam subagent dicoba untuk area folder terpisah sesuai permintaan, tetapi semuanya gagal sebelum mulai bekerja dengan error runtime `400 The requested model is not supported`. Audit dilanjutkan secara langsung; laporan ini bukan hasil dari subagent.
- Verifikasi dokumentasi saja tidak memerlukan build. Sebagai pengecekan lokalisasi, kunci judul dan isi tutorial ditemukan di seluruh delapan locale (`id`, `en`, `es`, `de`, `ar`, `ja`, `ko`, `zh-CN`).

## Temuan terverifikasi

### Prioritas tinggi — teks menu dan modal yang terlihat

| Area | Lokasi | Temuan |
|---|---|---|
| Pencapaian/misi | [pencapaianModals.tsx](apps/src/app/page/menus/mission/pencapaianModals.tsx#L810) | Label `extraBadges` untuk banyak misi disusun dalam bahasa Indonesia dan dirender langsung. Contohnya badge status/target/progres untuk pembangunan, riset, kementerian, hubungan geopolitik, transfer wilayah, serta penanganan bencana/pandemi. Judul dan deskripsi utama kartu sudah mengambil teks dari kamus; masalah yang terverifikasi di sini adalah label badge tambahan yang tidak diterjemahkan. |
| Modal pilihan riset | [penelitianSelectionModal.tsx](apps/src/app/page/menus/penelitian/penelitianSelectionModal.tsx#L121) | Status bonus `Aktif`/`Tidak Aktif`, tombol `Mengerti`, label `Selesai`, dan formatter bulan Indonesia ditulis langsung di komponen. Format bulan diulang pada tiga bagian modal (sekitar baris 197, 239, dan 281), sehingga tanggal selesai juga tetap memakai nama bulan Indonesia. |
| Konfirmasi serangan | [KonfirmasiSerangModals.tsx](apps/src/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/1_serang_negara/modals_menu/KonfirmasiSerangModals.tsx#L378) | Banner mandat militer, peringatan serangan tanpa mandat, dan embargo menggunakan teks statis Indonesia (baris 378–397). Banner ini hanya berlaku untuk modal serangan biasa, bukan mode bantuan militer/pengiriman pasukan sekutu. |
| Pemungutan suara Dewan Keamanan PBB | [4_modal_setuju.tsx](apps/src/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/menus/4_modal_setuju.tsx#L129), [5_modal_menolak.tsx](apps/src/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/menus/5_modal_menolak.tsx#L129), [6_modal_abstain.tsx](apps/src/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/menus/6_modal_abstain.tsx#L129), [7_modal_veto.tsx](apps/src/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/menus/7_modal_veto.tsx#L141) | Keempat modal menampilkan label `Pengusul`, `Target`, dan `Suara Anda` tanpa lookup kamus. |
| Notifikasi pajak dan harga | [pajakChangeNotification.tsx](apps/src/app/page/menus/inbox/logic/7_notifikasi_ekonomi/1_perubahan_pajak/pajakChangeNotification.tsx#L29), [hargaChangeNotification.tsx](apps/src/app/page/menus/inbox/logic/7_notifikasi_ekonomi/2_harga_barang_pokok/hargaChangeNotification.tsx#L29) | Badge naik/turun dan label `Komoditas`/`Perubahan` masih ditulis langsung. Teks tersebut tampil pada kartu inbox, termasuk nilai pajak atau harga yang berubah. |
| Hubungan global | [tingkatkanHubunganModals.tsx](apps/src/app/page/detail_negara/2_geopolitik/3_tingkatkan_hubungan/tingkatkanHubunganModals.tsx#L257) | Ringkasan dampak global masih berisi teks Indonesia statis, termasuk penjelasan nominal NEO dan ringkasan global. |
| Label “Semua Negara” | [TingkatHubunganModal.tsx](apps/src/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/TingkatHubunganModal.tsx#L427), [tingkatkanHubunganModals.tsx](apps/src/app/page/detail_negara/2_geopolitik/3_tingkatkan_hubungan/tingkatkanHubunganModals.tsx#L44), [beriHadiahModals.tsx](apps/src/app/page/detail_negara/2_geopolitik/2_beri_hadiah/beriHadiahModals.tsx#L86) | Literal `Semua Negara` dipakai sebagai nilai semantik sekaligus nama target yang dirender. Karena bukan kunci terjemahan, label target global dapat tetap Indonesia. Sebaiknya ID/status internal dipisah dari label tampilannya. |
| Bagian kelistrikan | [KelistrikanSection.tsx](apps/src/app/page/detail_negara/4_developing_ai_building/sections/KelistrikanSection.tsx#L229) | Judul `Indeks Kepuasan Rakyat (Sektor Listrik)` dan deskripsi ketersediaan pasokan listrik (baris 229 dan 232) masih statis, sementara banyak label lain pada komponen yang sama memakai `t()`. |
| Bagian pajak | [PajakSection.tsx](apps/src/app/page/detail_negara/4_developing_ai_building/sections/PajakSection.tsx#L217) | Judul `Sistem & Manajemen Pajak Negara` dan deskripsi tarif/estimasi kas (baris 217 dan 220) tidak memakai kamus, meskipun komponen sudah memakai `useLanguage()`. |
| Pembangunan sipil/militer | [PembangunanSipilMiliterSection.tsx](apps/src/app/page/detail_negara/4_developing_ai_building/sections/PembangunanSipilMiliterSection.tsx#L612) | Label `Kategori Sektor` masih statis. |
| Hasil perang | [warResultModal.tsx](apps/src/app/page/map_system/warResultModal.tsx#L114) | Empty state `Tidak Ada Kerugian Alutsista Tercatat` tetap Indonesia. |

### Prioritas menengah — kontrol dan aksesibilitas

| Area | Lokasi | Temuan |
|---|---|---|
| Tooltip kontrol waktu | [simulationCalendar.ts](apps/src/app/page/time_controllers/simulationCalendar.ts#L112) | Tooltip mengembalikan `Mulai Waktu`, `Jeda Waktu`, dan `Ubah Kecepatan: ...` secara statis. Karena string dibentuk di TS, bahasa kontrol mengikuti teks Indonesia meskipun komponen pemanggil berada di UI yang dilokalkan. |
| Label aksesibilitas modal | [RootInfoModalHeader.tsx](apps/src/app/page/root_modals_design_menu/RootInfoModalHeader.tsx#L30) | Nilai default `closeAriaLabel` adalah `Tutup modal`. Pemanggil yang tidak memberikan label khusus akan mengekspos nama tombol tutup berbahasa Indonesia kepada teknologi bantu. |
| Label aksesibilitas menu | [penelitianSelectionModal.tsx](apps/src/app/page/menus/penelitian/penelitianSelectionModal.tsx#L86), [newsModals.tsx](apps/src/app/page/menus/news/newsModals.tsx#L312), [missionModals.tsx](apps/src/app/page/menus/mission/missionModals.tsx#L1774), [index.tsx](apps/src/app/page/detail_negara/4_developing_ai_building/index.tsx#L196) | `aria-label` untuk informasi bonus riset, berita, misi, dan kategori detail negara ditulis langsung dalam bahasa Indonesia. Teks ini tidak selalu terlihat, tetapi tetap memengaruhi aksesibilitas dan pembaca layar. |

### Temuan tambahan di notifikasi simulasi

Di luar menu, `map-system.tsx` juga membentuk beberapa pesan notifikasi/hasil simulasi langsung dalam bahasa Indonesia. Contohnya pesan kerugian armada dan mundurnya pasukan ([baris 3327](apps/src/app/page/map_system/map-system.tsx#L3327), [baris 3492](apps/src/app/page/map_system/map-system.tsx#L3492)), serta ringkasan hasil bantuan militer dan dampak perang ([baris 13084](apps/src/app/page/map_system/map-system.tsx#L13084), [baris 13163](apps/src/app/page/map_system/map-system.tsx#L13163)). Ini bukan label menu, tetapi masih merupakan keluaran UI yang tidak dinamis bahasanya.

## Kandidat yang diperiksa tetapi tidak dihitung sebagai temuan

- Judul literal pada `PilihItemModal` dipetakan ke `navigation_economy_trade.transaction.*` sebelum dirender; judul yang terlihat sudah menggunakan terjemahan.
- Tutorial memakai `t()` dan semua locale yang diperiksa memiliki judul serta isi untuk langkah-langkahnya. String fallback Indonesia pada data tutorial bukan bukti bahwa UI selalu menampilkan bahasa Indonesia.
- Sejumlah string Indonesia dipakai sebagai nilai internal untuk mencocokkan status/data, sementara komponen tampilannya menggunakan kunci terjemahan. String semacam ini tidak dihitung sebagai teks UI yang gagal dilokalkan.
- Label durasi resolusi PBB dan alasan eligibility yang sempat muncul sebagai kandidat ternyata dipetakan melalui kamus.

## Rekomendasi tindak lanjut

1. Prioritaskan migrasi label `extraBadges` pencapaian misi ke kunci terjemahan beserta parameter dinamisnya, karena label tersebut tersebar pada banyak misi.
2. Tambahkan kunci pada namespace kamus yang sudah digunakan oleh setiap fitur, lalu lengkapi semua locale yang didukung.
3. Pisahkan sentinel `Semua Negara` dari label yang ditampilkan; gunakan identifier atau boolean internal dan terjemahkan label saat render.
4. Gunakan formatter tanggal berbasis locale untuk tanggal penyelesaian riset, dan pastikan tooltip serta pesan simulasi juga menggunakan mekanisme lokalisasi yang sama.
5. Tinjau pemanggil `RootInfoModalHeader` dan berikan label tombol tutup yang sesuai bahasa, atau ubah default ke helper lokalisasi yang tersedia.
