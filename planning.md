Rencana & ide Anda sangat bagus dan realistis untuk game militer/strategi geopolitik!

Mengubah nama menjadi Pabrik Semikonduktor, Pabrik Mesin Mobil, dan Pabrik Mesin Motor memberikan tujuan (purpose) yang sangat jelas dalam game loop, yaitu sebagai rantai pasok (supply chain) komponen industri pertahanan & otomotif militer.

🛡️ Rancangan Rantai Pasok Industri Pertahanan (Militer & Hankam)
🏭 Pabrik Semikonduktor (pabrik_semikonduktor)

Bahan Baku (Input): Logam Tanah Jarang + Litium/Bijih Besi
Fungsi Utama (Output): Komponen Elektronik Canggih & Sistem Kontrol
Digunakan Untuk:
Peralatan Militer: Sistem Radar, Drone Tempur, Rudal Kendali Presisi, Jet Tempur Modern, dan Sistem Pertahanan Udara.
🏭 Pabrik Mesin Mobil (pabrik_mesin_mobil)

Bahan Baku (Input): Bijih Besi + Semikonduktor
Fungsi Utama (Output): Mesin Heavy-Duty Roda 4
Digunakan Untuk:
Peralatan Militer: Tank Tempur Utama (Main Battle Tank / MBT), Panser / Kendaraan Lapis Baja (APC), Truk Transportasi Pasukan & Logistik, dan Kendaraan Peluncur Rudal.
🏭 Pabrik Mesin Motor (pabrik_mesin_motor)

Bahan Baku (Input): Bijih Besi + Minyak Bumi/Gas
Fungsi Utama (Output): Mesin Ringan Roda 2 / Mesin Taktis
Digunakan Untuk:
Peralatan Militer: Motor Taktis Militer Pasukan Khusus, Drone Rekognisi Ringan, dan Kendaraan Patroli Cepat.
🗄️ Rencana Perubahan Database & Codebase
Karena Anda memilih untuk mengubah key database & label UI secara penuh, berikut adalah langkah-langkah yang akan kita lakukan:

Di Database (SQL File & Schema):

Mengubah kolom semikonduktor ➔ pabrik_semikonduktor
Mengubah kolom mobil ➔ pabrik_mesin_mobil
Mengubah kolom sepeda_motor ➔ pabrik_mesin_motor
Menyediakan script migrasi SQL (ALTER TABLE / RENAME COLUMN).
Di Backend / API & Metadata:

Memperbarui 3_metadata_manufaktur.json dengan key baru & deskripsi fungsinya untuk alutsista militer.
Memperbarui endpoint API pendukung & logic ketersediaan SDA/bangunan.
Di Frontend Component & Modals:

Memperbarui 3_manufaktur.tsx, requirements.ts, PerdaganganModal, ArmadaAktif, InfrastrukturMiliter, dan modal terkait lainnya.
Apakah Anda ingin kita mulai melakukan update pada metadata JSON, script SQL, serta codebase React/TypeScript sekarang?