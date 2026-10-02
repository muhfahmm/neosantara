# 🛡️ Detail Fitur: Notifikasi Pertahanan (Versi Lebih Santai)

## 📋 Ringkasan Aturan Utama

Sistem pertahanan berjalan berdasarkan **hubungan diplomatik** antara negara pemain dengan negara lain. Semakin buruk hubungan, semakin besar kemungkinan muncul event militer.

**Ambang batas hubungan:**
Hubungan ≥ 20% → tidak ada event spionase, sabotase, atau serangan
Hubungan < 20% → spionase & sabotase mulai muncul (40% chance)
Hubungan < 15% → serangan militer mulai muncul (50% chance)

---

## ⚙️ Logika Trigger Sistem

Setiap hari (atau setiap tick), sistem mengecek **setiap negara asing** yang punya hubungan dengan pemain:

**Langkah 1 — Cek Spionase & Sabotase**
Jika hubungan dengan negara X < 20%, lakukan roll:
Peluang muncul = 40%
Jika lolos roll (60% tidak muncul), lanjut ke langkah 2.

**Langkah 2 — Cek Serangan**
Jika hubungan dengan negara X < 15%, lakukan roll terpisah:
Peluang muncul = 50%
Jika lolos roll, event serangan masuk ke inbox.

**Catatan penting:**
Kedua roll ini **independen** — artinya jika hubungan < 15%, bisa muncul:
Hanya spionase/sabotase saja
Hanya serangan saja
Spionase + Serangan sekaligus (jarang, tapi mungkin)
Tidak ada event sama sekali (jika kedua roll gagal)

---

## 🔍 Detail: Spionase (40% dari Event Intelijen)

**Syarat:** Hubungan < 20%

**Kombinasi trigger:** 40% total untuk spionase + sabotase

**Pembagian internal spionase (dari 40%):**

Spionase Ringan — 22% dari total
Mata-mata asing mencoba masuk perbatasan. Tidak berbahaya, hanya butuh penangkapan.

Spionase Sedang — 12% dari total
Agen asing menyusup ke instalasi militer. Data rahasia bisa bocor.

Spionase Berat — 6% dari total
Jaringan mata-mata besar terdeteksi. Bisa membocorkan rencana perang, riset nuklir, atau posisi armada.

**Dampak:**
Spionase Ringan → tidak ada dampak langsung, hanya notifikasi
Spionase Sedang → −5% efektivitas militer selama 7 hari
Spionase Berat → −15% efektivitas militer selama 14 hari + bocornya 1 riset

**Opsi aksi:**
Tangkap agen (biaya 50 EM) → +5% approval
Abaikan (biaya 0) → tidak ada dampak
Tingkatkan keamanan (biaya 100 EM) → +10% kontra-intelijen 30 hari

---

## 💣 Detail: Sabotase (40% dari Event Intelijen)

**Syarat:** Hubungan < 20%

**Pembagian internal sabotase (dari 40%):**

Sabotase Infrastruktur — 12% dari total
Pipa minyak, jembatan, atau jalan rusak akibat sabotase.

Sabotase Militer — 10% dari total
Gudang senjata, pangkalan militer, atau alutsista dirusak.

Sabotase Siber — 8% dari total
Serangan siber melumpuhkan sistem pertahanan atau komunikasi.

Sabotase Nuklir — 3% dari total
Sabotase fasilitas nuklir. Sangat berbahaya, bisa memicu bencana.

**Dampak:**
Sabotase Infrastruktur → −10% infrastruktur nasional, −3% PDB
Sabotase Militer → −15% kekuatan militer selama 14 hari
Sabotase Siber → sistem pertahanan lumpuh 3 hari, tidak bisa deteksi serangan
Sabotase Nuklir → risiko bencana nuklir, korban 500+, approval −20%

**Opsi aksi:**
Investigasi forensik (biaya 80 EM) → temukan pelaku
Perbaikan cepat (biaya 150 EM) → pulihkan dalam 3 hari
Biarkan (biaya 0) → pemulihan alami 14 hari

---

## ⚔️ Detail: Diserang (50% dari Event Militer)

**Syarat:** Hubungan < 15%

**Pembagian internal serangan (dari 50%):**

Ancaman Perbatasan — 22% dari total
Negara tetangga memobilisasi pasukan di perbatasan. Belum serangan, tapi provokasi.

Serangan Perbatasan — 15% dari total
Pasukan asing menyerang pos perbatasan. Perang skala kecil.

Deklarasi Perang — 9% dari total
Negara lain resmi menyatakan perang. Konflik skala besar.

Invasi Skala Penuh — 4% dari total
Invasi besar-besaran dengan tujuan menganeksasi wilayah.

**Dampak:**
Ancaman Perbatasan → tidak ada dampak, hanya notifikasi
Serangan Perbatasan → −5% kekuatan militer, korban 50+
Deklarasi Perang → perang aktif, ekonomi −15%, approval −10%
Invasi Skala Penuh → kehilangan 1 provinsi jika tidak dipertahankan

**Opsi aksi:**
Mobilisasi militer (biaya 200 EM) → +20% kekuatan pertahanan 30 hari
Diplomasi darurat (biaya 100 EM) → +10% hubungan, mungkin batalkan serangan
Serangan balasan (biaya 300 EM) → +15% kekuatan serangan 14 hari
Bertahan pasif (biaya 0) → korban meningkat, tapi hemat biaya

---

## 🔗 Event Chain (Rantai Kejadian)

Jika dibiarkan, event pertahanan bisa berkembang:

**Chain 1 — Eskalasi Intelijen**
Spionase Ringan → Spionase Sedang → Spionase Berat → Sabotase

**Chain 2 — Eskalasi Militer**
Ancaman Perbatasan → Serangan Perbatasan → Deklarasi Perang → Invasi

**Chain 3 — Kombinasi (Paling Berbahaya)**
Spionase Berat (bocor data) → Sabotase Militer → Ancaman Perbatasan → Deklarasi Perang → ICBM

**Chain 4 — Pemberontakan (khusus negara dengan aneksasi)**
Aneksasi Provinsi → Demo Kemerdekaan → Pemberontakan Bersenjata → Deklarasi Kemerdekaan

---

## 📊 Frekuensi Nyata (Per Hari)

Asumsi game tick harian dan pemain punya **5 negara dengan hubungan buruk**:

**Jika rata-rata hubungan = 18% (di antara 15-20%):**
Spionase/sabotase: 5 negara × 40% = 2 event kandidat per hari
Event aktual: ~1 per hari
Frekuensi: setiap 1-2 hari ada event intelijen

**Jika rata-rata hubungan = 12% (di bawah 15%):**
Spionase/sabotase: 5 negara × 40% = 2 event kandidat
Serangan: 5 negara × 50% = 2,5 event kandidat
Event aktual: ~2-3 per hari
Frekuensi: cukup sering, tapi tidak overwhelming

**Jika rata-rata hubungan = 30% (aman):**
Tidak ada event pertahanan sama sekali. Game terasa damai.

---

## 🎯 Strategi Pemain

**Untuk menghindari event pertahanan:**
Jaga hubungan dengan semua negara minimal 30%
Jalin aliansi dengan negara kuat
Riset teknologi kontra-intelijen
Bangun kedutaan besar di negara strategis

**Untuk memancing event (jika ingin perang):**
Turunkan hubungan dengan provokasi diplomatik
Hentikan bantuan luar negeri
Tingkatkan agresi militer

**Untuk bertahan saat hubungan buruk:**
Mobilisasi militer permanen (biaya tinggi)
Riset pertahanan siber
Perkuat badan intelijen nasional
Bangun pos pertahanan di perbatasan

---

## 💡 Catatan Balancing

Persentase 40% dan 50% ini adalah **versi lebih santai** dibanding versi sebelumnya. Tujuannya adalah:

Memberi pemain **ruang bernapas** untuk fokus membangun ekonomi
Event pertahanan tetap terasa, tapi **tidak setiap hari**
Pemain bisa **merencanakan strategi** tanpa dikejar-kejar event terus
Game terasa lebih **seimbang** antara damai dan konflik

**Perbandingan versi:**
Versi santai: spionase 40%, serangan 50%
Versi sedang: spionase 65%, serangan 80%
Versi hard: spionase 80%, serangan 95%

---

## 🎁 Saran Tambahan

Sebaiknya event pertahanan punya **cooldown per negara**. Contoh:
Negara X baru saja melakukan spionase → tidak bisa spionase lagi selama 7 hari
Negara Y baru saja gagal serangan → tidak bisa serang lagi selama 14 hari

Ini mencegah satu negara spam event berturut-turut, dan membuat pemain bisa bernapas.

Dengan versi santai ini, pemain akan tetap merasakan tensi geopolitik, tapi tidak akan kewalahan. Cocok untuk pemain yang ingin fokus membangun negara dulu sebelum masuk ke fase konflik.