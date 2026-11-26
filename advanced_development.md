Analisis kritis untuk Neosantara

Aku belum mengecek harga dan ketersediaan terbaru tiap penyedia pembayaran. Verifikasi dulu ke dokumentasi resmi masing-masing, terutama soal negara payout dan fee.

1. Hal yang perlu dikritisi dulu

Tech stack terlalu banyak. Next.js, Rust, Python, Kotlin, Electron, dan Tauri untuk satu developer (atau tim kecil) berarti banyak codebase yang harus dirawat. Ada juga yang janggal: kamu menyebut Kotlin dan Tauri untuk mobile sekaligus. Itu dua pendekatan yang berbeda. Pilih satu.

Cara paling hemat: satu basis kode Next.js/TypeScript, dibungkus Electron untuk desktop, dan Tauri Mobile atau PWA untuk Android.
Tauri Mobile masih relatif muda, dan performa WebView di Android kelas bawah (yang banyak dipakai di Indonesia) sering jadi masalah untuk game dengan UI berat.
Tentukan peran Rust dan Python dengan jelas. Misalnya Rust untuk simulasi inti dan Python untuk analitik atau AI. Kalau tidak, ini jadi beban maintenance.

Dana bukan lagi alasan kuat menghindari Steam dan Play. Biaya Steam Direct sekitar $100 per game dan Google Play sekitar $25 sekali bayar (cek ulang). Distribusi lewat website tetap valid untuk tahap awal, tapi ada konsekuensinya:

File .exe tanpa code signing akan memicu peringatan Windows SmartScreen, dan banyak pemain menutup installer-nya.
APK di luar Play memicu peringatan Play Protect dan butuh "install dari sumber tidak dikenal", yang menurunkan konversi.
Kamu harus membangun auto-update sendiri (electron-updater, dengan hosting di Cloudflare R2 atau S3).

Alternatif gratis dan murah: itch.io, serta versi web/PWA yang tidak butuh instalasi sama sekali. Untuk game strategi, versi web sering jadi pintu masuk terbaik.

2. Rekomendasi payment gateway

Karena target pasarmu global dan UI harus bebas dikustomisasi, pertimbangkan dua jalur.

Jalur A: gateway lokal untuk pemain Indonesia

Xendit atau Midtrans, dengan alternatif DOKU, Duitku, dan iPaymu.
Mendukung QRIS, e-wallet (GoPay, OVO, DANA, ShopeePay), virtual account, dan minimarket. Ini metode yang benar-benar dipakai pemain Indonesia.
Keduanya punya API (Core API / Payment Request) sehingga kamu bisa membuat UI checkout sendiri. Hindari halaman hosted atau Snap popup kalau ingin kontrol penuh.

Jalur B: Merchant of Record (MoR) untuk pemain global

Paddle, Lemon Squeezy, Creem, atau Polar. MoR menjadi penjual resmi, jadi mereka yang mengurus PPN/VAT/sales tax di puluhan negara, refund, dan chargeback. Untuk developer solo dengan pasar dunia, ini mengurangi beban hukum dan pajak secara besar.
Kekurangannya, kustomisasi UI terbatas (overlay atau inline checkout, bukan UI sepenuhnya milikmu), dan fee lebih tinggi (umumnya sekitar 5% + biaya tetap).
Cek dulu apakah pemilik usaha dari Indonesia didukung untuk payout di tiap penyedia.

Soal Stripe: Stripe menawarkan kustomisasi UI terbaik (Payment Element), tapi ketersediaan akun untuk bisnis berbasis Indonesia terbatas. Cek status terbarunya di dokumentasi mereka.

Saran saya: pakai pendekatan hibrida. Xendit/Midtrans untuk Indonesia dan satu MoR untuk luar negeri, dengan satu lapisan abstraksi pembayaran di backend-mu. Dengan begitu, mengganti atau menambah provider tidak mengubah logika game.

Soal kustomisasi UI: UI buatan sendiri aman selama data kartu tidak pernah menyentuh servermu. Gunakan hosted fields atau tokenisasi dari provider (untuk kartu) dan jangan simpan nomor kartu sendiri. Itu menghindari beban PCI-DSS.

3. Arsitektur agar pembelian tersimpan di akun

Prinsip utamanya: server adalah satu-satunya sumber kebenaran, klien tidak pernah dipercaya.

Wajibkan login (Firebase) sebelum membeli. Jangan izinkan pembelian anonim.
Klien memanggil backend-mu dengan Firebase ID Token. Backend memverifikasinya lewat Firebase Admin SDK, lalu membuat order di PostgreSQL dengan status pending.
Backend membuat sesi pembayaran di provider dan menyertakan order_id dan uid di metadata.
Provider mengirim webhook ke backend. Verifikasi tanda tangan webhook, pastikan idempotent (event yang sama tidak diproses dua kali), lalu ubah order jadi paid dan beri entitlement.
Klien hanya membaca status entitlement dari server (polling atau realtime). Jangan percaya redirect "sukses" dari browser.

Tabel minimal di PostgreSQL:

orders (id, uid, produk, harga, mata uang, provider, status, provider_ref)
entitlements (uid, item/fitur, sumber_order, berlaku_sampai, status)
payment_events (id event unik dari provider, payload, waktu proses). Ini untuk idempotensi dan audit.

Tangani juga refund dan chargeback (cabut entitlement), rekonsiliasi harian dengan laporan provider, dan akun Google yang dihapus atau digabung. Karena premium terikat ke Firebase UID, user yang ganti akun bisa kehilangan pembelian, jadi sediakan alur dukungan untuk itu.

4. Hal lain yang perlu dikembangkan

Desain bisnis

Untuk game geopolitik kompetitif, item premium yang memberi keunggulan (pay-to-win) cepat merusak komunitas. Lebih aman jual kosmetik, kenyamanan (slot, mempercepat antrean), atau konten tambahan.
Pertimbangkan harga regional (PPP). Harga yang sama tidak cocok di Indonesia dan Eropa.

Hukum dan kepatuhan

Sebagai penyelenggara sistem elektronik di Indonesia, cek kewajiban pendaftaran PSE (Komdigi) dan UU PDP. Untuk pemain Eropa, GDPR berlaku.
Siapkan Terms of Service, Privacy Policy, dan kebijakan refund sebelum menerima uang.
Konten geopolitik sensitif: peta, wilayah sengketa, dan tokoh nyata bisa membuatmu diblokir di negara tertentu atau menimbulkan masalah hukum. Putuskan kebijakan editorialnya sejak awal.

Teknis dan keamanan

Electron: aktifkan contextIsolation, matikan nodeIntegration, dan batasi IPC. Aplikasi Electron mudah diinspeksi, jadi logika game penting dan pengecekan premium harus ada di server.
Antisipasi kecurangan (cheating), karena game kompetitif pasti jadi target. Validasi aksi di server.
Observabilitas: Sentry untuk crash report, log terstruktur, dan backup PostgreSQL otomatis yang dites restore-nya.
CI/CD untuk build dan rilis otomatis, serta code signing. Untuk Windows, cek opsi seperti Azure Trusted Signing atau sertifikat OV/EV.
Rate limiting dan proteksi dasar di backend (Cloudflare di depan server).
Performa UI di perangkat Android menengah ke bawah: uji di perangkat nyata, bukan hanya emulator.

Produk

Lokalisasi (i18n) sejak awal. Minimal Inggris dan Indonesia.
Onboarding dan tutorial untuk game geopolitik yang kompleks. Ini sering jadi penentu retensi.
Analitik retensi (D1/D7/D30) sebelum membangun lebih banyak fitur premium.
Pertimbangkan alpha/beta tertutup lewat website, dengan komunitas Discord, sebelum membuka pembayaran.
5. Urutan prioritas yang saya sarankan
Putuskan stack mobile (satu saja) dan pangkas kompleksitas.
Bangun backend entitlement + webhook dengan satu provider dulu (Xendit atau Midtrans).
Rapikan UI dan lakukan playtest kecil.
Siapkan code signing, auto-update, dan halaman unduhan di website.
Dokumen legal dan pendaftaran PSE.
Tambahkan MoR untuk pasar global setelah ada pemain di luar Indonesia.
Setelah ada pendapatan, rilis di Steam dan Play.

6. Rencana cloud-save game tanpa PostgreSQL

Rekomendasi: gunakan Cloud Firestore di Firebase, bukan Google Drive. Google login hanya mengautentikasi pemain; Firestore adalah database aplikasi di proyek Firebase milik game, bukan database privat di akun Google pemain. Di proyek ini Firebase Google Auth sudah tersedia, tetapi endpoint `/api/game-save` saat ini masih membaca dan menulis PostgreSQL.

Alur yang dituju

1. Pemain login dengan Google melalui Firebase Auth. Untuk web gunakan alur Google yang sudah ada; untuk Android/Tauri gunakan alur native yang sesuai. Pastikan keduanya menghasilkan Firebase UID yang sama untuk akun yang sama.
2. Saat status auth berubah menjadi login, gunakan UID Firebase untuk mengambil daftar save milik pemain dari Firestore. Tampilkan indikator memuat dan tangani kegagalan jaringan; jangan anggap save berhasil sebelum Firestore mengonfirmasi.
3. Jika belum ada cloud-save, simpan state lokal sebagai save pertama. Jika sudah ada, pulihkan save cloud terbaru. Bila state lokal dan cloud sama-sama berubah, bandingkan versi/waktu dan minta pemain memilih atau buat salinan—jangan menimpa data diam-diam.
4. Selama bermain, autosave setelah perubahan state yang bermakna dengan debounce (misalnya beberapa detik), bukan setiap frame. Simpan juga pada aksi simpan manual/pergantian menu. Simpan lokal lebih dulu agar bisa dimainkan offline, lalu antrekan sinkronisasi Firestore saat online.
5. Setelah sign-out, hentikan listener dan sinkronisasi agar state akun berikutnya tidak tercampur.

Model data awal

Simpan di jalur yang dibatasi per pemilik, misalnya `users/{uid}/saves/{saveId}`. Isi dokumen minimal: `saveName`, `countryIso`, `gameDate`, `state`, `schemaVersion`, `updatedAt`, dan `revision`. `state` berisi data yang saat ini dibutuhkan untuk memulihkan permainan, termasuk detail negara. Pakai beberapa dokumen/pecahan bila state mendekati batas ukuran dokumen Firestore; ukur save terbesar sebelum menentukan bentuk final. Jangan menyimpan token autentikasi atau rahasia di dokumen save.

Tahapan implementasi

1. Inventarisasi seluruh state permainan yang harus dipulihkan dan uji ekspor/impor state lokal ke satu objek save versi awal. Sertakan validasi dan migrasi `schemaVersion` agar perubahan format tidak merusak save lama.
2. Buat/konfigurasi Firestore di Firebase Console, aktifkan Google provider dan Firestore Rules. Aturan wajib memastikan pengguna hanya dapat membaca, membuat, memperbarui, dan menghapus dokumen di bawah UID-nya sendiri (`request.auth.uid == uid`); validasi bentuk/ukuran data juga harus dilakukan.
3. Tambahkan lapisan repository Firestore untuk daftar, muat, simpan, dan hapus save. Hubungkan ke Firebase Auth observer; UI menampilkan status sinkronisasi dan kesalahan, sementara local save tetap menjadi fallback offline.
4. Pindahkan alur UI save/load dari `/api/game-save` PostgreSQL ke repository Firestore. Endpoint sekarang tidak memiliki pembatasan kepemilikan akun yang memadai; jangan sekadar mengganti tabel tanpa menambahkan otorisasi. Setelah data lama diekspor dan diuji, matikan endpoint lama agar tidak ada dua sumber kebenaran.
5. Migrasikan save lama PostgreSQL dengan skrip sekali jalan yang memetakan setiap save ke pemilik yang benar. Jika save lama tidak memiliki UID pemilik, jangan menebak pemiliknya; sediakan impor manual atau biarkan pemain memulai save baru. Uji jumlah record dan hasil restore sebelum menghapus database lama.
6. Uji akun berbeda, login ulang di perangkat lain, offline lalu online, konflik dua perangkat, save besar, penghapusan akun/save, serta aturan akses yang menolak UID lain. Pantau biaya/kuota Firestore dan siapkan ekspor/backup berkala.

Keputusan dan batasan

- Firestore cocok untuk cloud-save dan sinkronisasi lintas perangkat tanpa server PostgreSQL khusus. Tetap ada biaya, batas kuota/ukuran, dan kebutuhan backup; cek harga serta batas terbaru Firebase sebelum rilis.
- Untuk save single-player, akses langsung dari klien dengan Firebase Auth dan Rules dapat digunakan. Untuk mode kompetitif atau nilai yang tidak boleh dimanipulasi (misalnya mata uang premium), validasi dan penulisan harus melalui backend tepercaya; jangan mempercayai state dari klien.
- Mengganti `/api/game-save` belum otomatis menghapus semua PostgreSQL dari proyek. Audit route lain dan fitur pembayaran yang masih memakai `getDbPool()` secara terpisah. Jika targetnya menghapus PostgreSQL sepenuhnya, setiap pemakaian tersebut perlu dipindahkan dan diuji; jangan menghapus koneksi sebelum migrasi serta rekonsiliasi datanya selesai.