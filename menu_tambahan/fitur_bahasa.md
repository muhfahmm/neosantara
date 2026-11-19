# Rancangan Menu Bahasa

## Tujuan

Menu Bahasa memungkinkan pemain memilih bahasa untuk antarmuka dan teks dalam game. Bahasa Indonesia menjadi bahasa utama dan pilihan bawaan.

## Bahasa yang Tersedia

| Bahasa | Nama dalam bahasa tersebut | Kode |
|---|---|---|
| Indonesia (utama) | Bahasa Indonesia | `id` |
| Inggris | English | `en` |
| Mandarin | 简体中文 | `zh-CN` |
| Spanyol | Español | `es` |
| Jerman | Deutsch | `de` |
| Jepang | 日本語 | `ja` |
| Korea Selatan | 한국어 | `ko` |
| Arab | العربية | `ar` |

## Perilaku Menu

- Tampilkan daftar bahasa dengan nama yang mudah dikenali; jangan hanya mengandalkan bendera negara.
- Terapkan bahasa pilihan ke antarmuka dan teks game yang telah diterjemahkan.
- Simpan pilihan bahasa pemain agar tetap digunakan setelah game ditutup dan dibuka kembali.
- Jika pilihan atau terjemahan tidak tersedia, gunakan Bahasa Indonesia sebagai bahasa utama/fallback.
- Untuk bahasa Arab, dukung arah baca kanan-ke-kiri (RTL) pada teks dan tata letak yang relevan.
- Perubahan bahasa sebaiknya langsung terlihat tanpa menghapus atau mengubah progres permainan.

## Catatan Lokalisasi

- Jaga agar istilah, nama menu, pesan, dan format angka/tanggal konsisten dalam setiap bahasa.
- Sediakan ruang yang cukup untuk teks terjemahan yang lebih panjang atau lebih pendek.
- Tinjau terjemahan untuk keterbacaan dan konteks, terutama istilah simulasi pemerintahan dan geopolitik.
- Bahasa yang belum memiliki terjemahan lengkap tetap dapat menampilkan teks Bahasa Indonesia untuk bagian yang belum diterjemahkan.