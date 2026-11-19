# Usulan Pemanfaatan Gems

## Percepatan Proses

Urutan menu yang direkomendasikan:

- **Pembangunan** — Produksi, fasilitas umum, dan hunian. Waktu pembangunan dihitung per bangunan dan antreannya berurutan, jadi manfaat percepatannya jelas. Contohnya ada di `ProduksiModal.tsx` dan `TempatUmumModal.tsx`.
- **Penelitian** — Percepat riset atau upgrade riset pada kategori ekonomi, militer, dan diplomasi. Tiap kategori punya antrean aktif sendiri, sehingga pemain bisa memilih riset yang ingin dipercepat di `penelitianPageMenu.tsx`.
- **Armada dan infrastruktur militer** — Percepat pembangunan kapal/pasukan dan fasilitas militer; keduanya memiliki tanggal mulai dan selesai.
- **Program nuklir dan ICBM** — Pilihan lanjutan karena prosesnya berjangka waktu dan spesifik, tetapi sebaiknya biayanya lebih tinggi atau dibatasi.

## Pencapaian dan Hadiah Gems

Pencapaian menjadi target permanen yang dapat dikejar pemain sepanjang permainan. Berbeda dari misi yang berganti dan hadiah harian/mingguan, pencapaian hanya dibuka satu kali untuk setiap save game. Gems dapat diberikan sebagai hadiah saat pencapaian terbuka.

## Usulan Pencapaian

### Kepuasan dan Populasi

- **Negara Sejahtera** — Pertahankan kepuasan rakyat di atas 80% selama beberapa bulan dalam game.
- **Rumah untuk Semua** — Atasi defisit hunian atau turunkan jumlah tunawisma hingga batas yang ditentukan.
- **Masyarakat Sehat** — Capai target indeks kesejahteraan rakyat.

### Produksi dan Pembangunan

- **Mandiri Energi** — Penuhi kebutuhan listrik nasional tanpa defisit selama beberapa bulan.
- **Lumbung Pangan** — Penuhi kebutuhan pangan warga dan capai surplus produksi.
- **Pembangun Bangsa** — Bangun fasilitas dari kategori produksi, hunian, dan layanan umum.
- **Kota Terhubung** — Bangun beberapa jenis infrastruktur publik yang berbeda.

### Ekonomi dan Perdagangan

- **Anggaran Sehat** — Catat surplus anggaran selama beberapa periode berturut-turut.
- **Bebas Utang** — Lunasi seluruh pinjaman negara.
- **Mitra Dagang Dunia** — Selesaikan perdagangan dengan beberapa negara atau ekspor beberapa komoditas berbeda.
- **Ekonomi Tangguh** — Pertahankan kondisi ekonomi nasional yang stabil selama beberapa periode.

### Penelitian dan Kementerian

- **Negeri Inovatif** — Selesaikan sejumlah penelitian.
- **Riset Unggulan** — Tingkatkan beberapa kartu penelitian ke level yang lebih tinggi.
- **Kabinet Andal** — Tingkatkan beberapa kementerian dan rekrut menteri di beberapa bidang.

### Geopolitik dan Diplomasi

- **Diplomat Ulung** — Bangun kedutaan dan tingkatkan hubungan dengan beberapa negara.
- **Penjaga Perdamaian** — Bentuk pakta non-agresi atau aliansi pertahanan.
- **Suara Dunia** — Bergabung dengan beberapa organisasi internasional atau berhasil dalam agenda PBB.
- **Sahabat Kemanusiaan** — Kirim bantuan kepada negara lain atau bantu penanganan krisis.

### Sosial, Budaya, dan Tanggap Darurat

- **Masyarakat Harmonis** — Capai tingkat toleransi atau kesejahteraan sosial tertentu.
- **Tanggap Darurat** — Tangani bencana atau wabah dan pulihkan kebutuhan dasar warga.

### Pertahanan

- **Penjaga Negeri** — Selesaikan peningkatan pertahanan nasional.
- **Komandan Berpengalaman** — Selesaikan operasi militer dan kelola dampaknya terhadap negara.

## Saran Implementasi

- Mulai dengan sekitar 20–30 pencapaian yang dikelompokkan mengikuti menu permainan.
- Buat beberapa pencapaian bertingkat, misalnya **Mandiri Energi I, II, dan III**, dengan durasi pemenuhan kebutuhan listrik yang semakin lama.
- Tampilkan nama, deskripsi, progres, status terkunci/terbuka, dan hadiah Gems pada halaman pencapaian.
- Simpan progres dan pencapaian yang sudah terbuka di data save game agar tidak hilang saat pemain memuat ulang permainan.
- Gunakan syarat yang mengukur hasil atau konsistensi bermain, bukan sekadar mengulang tugas yang sudah tersedia di misi.
- Sesuaikan angka ambang dan durasi setiap pencapaian dengan skala ekonomi serta kecepatan waktu dalam simulasi.