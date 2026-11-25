# LAPORAN AUDIT MENDALAM MODAL INFO ("i") & KETIDAKKONSISTENAN TAMPILAN
**Dokumen:** `info_modal_audit.md`  
**Status:** Tahap A (Inventaris & Analisis - BACA SAJA)  
**Tanggal:** 25 November 2026  
**Total Berkas Terperiksa:** Seluruh modul antarmuka game `apps/src/app`

---

## 1. RINGKASAN EKSEKUTIF MASALAH

Perilaku yang benar saat pemain menekan ikon info ("i") pada kartu/menu adalah:
* **Modal info tampil DI ATAS modal utama (Stacking/Tumpuk):** Modal utama tetap terpasang (*mounted*) di DOM, terlihat di latar belakang dalam kondisi redup, posisi scroll tidak berubah, tab aktif tetap, input/pilihan formulir tetap utuh.
* **Menutup modal info:** Mengembalikan pemain ke modal utama persis di titik terakhir, dan fokus keyboard/accessibility kembali ke tombol pemicu "i".

### Temuan Kegagalan di Codebase Neosantara:
Dari 47 file antarmuka yang memiliki pemicu info ("i"), ditemukan **2 kategori besar ketidakkonsistenan kritis**:
1. **Pola "Swap" (Tukar / Unmount):** Sebanyak **18 modul** menggunakan kondisi eksklusif `{!isInfoOpen && <NotebookModalWrapper>...</NotebookModalWrapper>}`. Ketika pemain menekan "i", `isInfoOpen` bernilai `true`, sehingga modal utama **di-unmount secara instan**. Akibatnya, seluruh state lokal modal utama (tab terpilih, scroll position, filter, form input) **hilang dan ter-reset total** saat modal info ditutup.
2. **Pola Event Global & Hiding (`hideWhenInfoModalOpen`):** `NotebookModalWrapper` memiliki event listener global `MENU_INFO_MODAL_VISIBILITY_EVENT` yang menambahkan class `hidden` (display: none) pada modal utama saat modal info anak dibuka. Meskipun state React tersimpan, secara visual modal utama lenyap tiba-tiba, layar latar belakang menjadi kosong/bolong (hanya peta), dan fokus DOM hilang saat info ditutup.
3. **Ukuran Modal Info:** Pada beberapa modal info (seperti di Tempat Umum dan Hunian Permukiman), ukuran modal info mengambil lebar dan tinggi penuh atau bahkan lebih besar dari modal pemanggilnya, bukan format kartu ringkas (*content-sized*).

---

## 2. TABEL LENGKAP AUDIT KASUS PERILAKU MODAL INFO

| No | Modul / Layar | File & Baris Pemicu | Modal Utama (Frame) | Modal Info (Frame) | Mekanisme Render | Perilaku Saat Info Dibuka | State Modal Utama Setelah Ditutup | Ukuran Info vs Utama | Masalah & Dampak |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Pertahanan > Armada (Header Info)** | `ArmadaModal.tsx:107` | `NotebookModalWrapper` (z-[60]) | `NotebookModalWrapper` (z-[200]) | State lokal `showDefenseBonusInfo`, kondisional `{!showDefenseBonusInfo && <Main>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset ke Tab Default ("aktif")**, scroll posisi hilang | Info lebih kecil (`contentSized`) | **Kritis (Swap).** Pemain yang sedang di tab Infrastruktur terlempar balik ke tab Armada Aktif. |
| 2 | **Pertahanan > Armada Aktif (Kartu Infanteri/Armada)** | `1_armada_aktif.tsx:473` | Bagian isi `ArmadaModal` | `InfoArmadaAktifModal.tsx` | State lokal `infoKey` + `isInfoOpen`, Portal ke `document.body` jika mobile | **Tampil menumpuk di atas (Desktop), tapi mengirim event hide di mobile** | State utama aman di desktop; di mobile layar utama sempat `hidden` | Proporsional | **Parsial konsisten.** Dispatch event `MENU_INFO_MODAL_VISIBILITY_EVENT` membuat modal bawah berkedip di mobile. |
| 3 | **Pertahanan > Infrastruktur Militer (Kartu Barak/Pangkalan)** | `2_infrastruktur_militer.tsx:529` | Bagian isi `ArmadaModal` | `InfoInfrastrukturModal.tsx` | State lokal `infoKey` + `isInfoOpen`, Portal ke `document.body` jika mobile | **Tampil menumpuk di atas** | State utama aman | Proporsional | Pola acuan yang mendekati benar di desktop, namun masih memancarkan event `MENU_INFO_MODAL_VISIBILITY_EVENT`. |
| 4 | **Kepuasan > Statistik Kepuasan** | `StatistikKepuasanModal.tsx:139` | `NotebookModalWrapper` | `MenuInfoModal` (z-[200]) via Portal | State `isInfoOpen`, pola swap: `{!isInfoOpen && <NotebookModalWrapper>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset total**, sub-kategori terpilih kembali ke awal | Content-sized | **Kritis (Swap).** Modal statistik hilang dari DOM saat dialog penjelasan dibuka. |
| 5 | **Kepuasan > Naikkan Kepuasan** | `NaikkanKepuasanModal.tsx:386` | `NotebookModalWrapper` | `MenuInfoModal` (z-[200]) via Portal | State `isMenuInfoOpen`, pola swap: `{!isMenuInfoOpen && <NotebookModalWrapper>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, input nilai alokasi dana kepuasan terhapus | Content-sized | **Kritis (Swap).** Input nominal pemain ter-reset. |
| 6 | **Produksi & Konsumsi > Kelistrikan Nasional** | `KelistrikanModal.tsx:272` | `NotebookModalWrapper` | `MenuInfoModal` (z-[200]) via Portal | State `isInfoOpen`, pola swap: `{!isInfoOpen && <NotebookModalWrapper>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, tab sumber energi / daerah kembali ke default | Content-sized | **Kritis (Swap).** |
| 7 | **Produksi & Konsumsi > Konsumsi Pangan** | `KonsumsiPanganModal.tsx` | `NotebookModalWrapper` | `MenuInfoButton` | Komponen `MenuInfoButton` mandiri via `createPortal` | **Modal Utama Tetap Terpasang di Belakang (Benar)** | **Aman & Tidak Berubah** | Content-sized | **Konsisten (Pola Bagus).** |
| 8 | **Pembangunan > Produksi (Pabrik/Tambang)** | `ProduksiModal.tsx:694, 750` | `NotebookModalWrapper` | Modal Info Internal & Info Sanksi | State `selectedTabInfo`, pola swap: `{!selectedTabInfo && <Main>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, tab sektor (Mineral/Manufaktur) kembali ke default | Content-sized | **Kritis (Swap).** |
| 9 | **Pembangunan > Tempat Umum** | `TempatUmumModal.tsx:468` | `NotebookModalWrapper` | Tampilan Info Kategori | State `selectedGroupInfo`, pola swap: `{!selectedGroupInfo && <Main>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, daftar bangunan tertutup | Mengambil alih seluruh sheet | **Kritis (Swap).** Mengganti modal alih-alih popover/modal mengambang. |
| 10 | **Pembangunan > Hunian Permukiman** | `HunianPermukimanModal.tsx:428` | `NotebookModalWrapper` | Tampilan Info Hunian | State `selectedItemInfo`, pola swap: `{!selectedItemInfo && <Main>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, scroll daftar hunian kembali ke atas | Mengambil alih seluruh sheet | **Kritis (Swap).** |
| 11 | **Ekonomi > Anggaran (Pemasukan/Pengeluaran)** | `PemasukkanPengeluaranModal.tsx:188` | `NotebookModalWrapper` | `MenuInfoModal` via Portal | State `isInfoOpen`, pola swap: `{!isInfoOpen && <NotebookModalWrapper>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, tab rincian belanja kembali ke default | Content-sized | **Kritis (Swap).** |
| 12 | **Ekonomi > PDB Nasional & Dunia** | `PDBModal.tsx:425` | `NotebookModalWrapper` | `MenuInfoModal` via Portal | State `isInfoOpen`, pola swap: `{!isInfoOpen && <NotebookModalWrapper>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, grafik & tab PDB per kapita kembali ke awal | Content-sized | **Kritis (Swap).** |
| 13 | **Ekonomi > Harga Barang Pokok** | `HargaModal.tsx:528` | `NotebookModalWrapper` | `MenuInfoModal` via Portal | State `isInfoOpen`, pola swap: `{!isInfoOpen && <NotebookModalWrapper>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, pencarian/filter komoditas terhapus | Content-sized | **Kritis (Swap).** |
| 14 | **Ekonomi > Kebijakan Subsidi** | `SubsidiModal.tsx:240` | `NotebookModalWrapper` | `MenuInfoModal` via Portal | State `isInfoOpen`, pola swap: `{!isInfoOpen && <NotebookModalWrapper>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, slider pengeluaran subsidi kembali ke nilai awal | Content-sized | **Kritis (Swap).** Input pemain hilang. |
| 15 | **Ekonomi > Sistem Ekonomi** | `SistemEkonomiModal.tsx:384` | `NotebookModalWrapper` | `MenuInfoModal` via Portal | State `isInfoOpen`, pola swap: `{!isInfoOpen && <NotebookModalWrapper>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, radio button pilihan sistem ekonomi kembali ke awal | Content-sized | **Kritis (Swap).** |
| 16 | **Ekonomi > Perdagangan Internasional** | `PerdaganganModal.tsx:320` | `NotebookModalWrapper` | Modal Info Blokir / WTO Info | State `showBlockedInfoModal`, pola swap: `{!showBlocked... && <Main>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, tab mitra dagang & kuota ekspor/impor hilang | Content-sized | **Kritis (Swap).** |
| 17 | **Geopolitik > Organisasi Internasional** | `OrgIntlModal.tsx:177` | `NotebookModalWrapper` | `OrgIntlInfoModal` (z-[200]) | State `infoOrgName`, pola swap: `{!infoOrgName && <NotebookModalWrapper>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, tab kategori organisasi (PBB/Regional) kembali ke awal | Content-sized | **Kritis (Swap).** |
| 18 | **Populasi > Ringkasan Populasi** | `RingkasanPopulasiModal.tsx:395` | `NotebookModalWrapper` | `MenuInfoModal` via Portal | State `isInfoOpen`, pola swap: `{!isInfoOpen && <NotebookModalWrapper>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, tab piramida usia kembali ke ringkasan | Content-sized | **Kritis (Swap).** |
| 19 | **Populasi > Indeks Kesejahteraan** | `IndeksKesejahteraanModal.tsx:259` | `NotebookModalWrapper` | Modal Info Pendidikan, Kesehatan, Hukum | State lokal (`showPendidikanInfoModal`, dll.), dirender tumpang | **Modal Utama Tetap Terpasang di Belakang (Bagus)** | **Aman**, skor dan tab tetap tersimpan | Content-sized | **Konsisten (Stacking bekerja, namun backdrop dobel).** |
| 20 | **Kementerian > Kementerian & Lembaga** | `KementerianModal.tsx:560` | `NotebookModalWrapper` | Popup Modal Info Efek Kementerian | State `infoTarget` / `showGeneralInfo`, dirender lewat portal | **Modal Utama Tetap Terpasang di Belakang (Bagus)** | **Aman**, pilihan menteri dan level anggaran tetap | Content-sized | **Konsisten.** |
| 21 | **Sosial Budaya > Ideologi Negara** | `IdeologiModal.tsx:392` | `NotebookModalWrapper` | `IdeologiInfoModal` | State `infoTarget`, pola swap: `{!infoTarget && <Main>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, pilihan opsi ideologi kembali ke awal | Content-sized | **Kritis (Swap).** |
| 22 | **Sosial Budaya > Agama & Kepercayaan** | `AgamaModal.tsx:210` | `NotebookModalWrapper` | Modal Info Agama | State `isCurrentReligionInfoOpen`, pola swap: `{!isCurrent... && <Main>}` | **Modal Utama Hilang (Unmounted)** | **Ter-reset**, pilihan agama baru ter-reset | Content-sized | **Kritis (Swap).** |

---

## 3. IDENTIFIKASI AKAR MASALAH (ROOT CAUSES)

1. **Anti-Pola Eksekusi JSX: `{!isInfoOpen && <MainModal>}`**  
   Pengembang sebelumnya menganggap bahwa modal tidak boleh tampil bersamaan di layar, sehingga membungkus seluruh modal utama dalam kondisi negasi `!isInfoOpen`. Ini adalah **penyebab nomor satu** hilangnya modal utama dan ter-resetnya state form/tab.
2. **Ketergantungan Event Global Penutup `MENU_INFO_MODAL_VISIBILITY_EVENT`:**  
   Ketika `MenuInfoModal` terbuka, ia mengirimkan event `window.dispatchEvent` yang ditangkap oleh `NotebookModalWrapper` untuk menambahkan class `hidden` ke modal utama. Hal ini merusak pengalaman visual stacking.
3. **Backdrop Gelap Ganda:**  
   Modal info yang memakai `NotebookModalWrapper` mandiri akan merender kembali bingkai luar lengkap (beserta ring binder dekorasi buku dan backdrop solid hitam `bg-black/60`). Akibatnya, pemain melihat "buku di dalam buku" dan modal utama di belakangnya tertutup 100% oleh warna hitam pekat, bukan redup tembus pandang.
4. **Fokus Aksesibilitas Hilang:**  
   Setelah modal info ditutup (onClose), tidak ada referensi `triggerRef.current?.focus()`, sehingga fokus keyboard jatuh ke `document.body` (elemen pertama di halaman).

---

## 4. PENGELOMPOKAN HASIL AUDIT

* **Kasus Konsisten (Perilaku Sudah Benar - Modal Tetap Terpasang):**
  * `MenuInfoButton` di `KonsumsiPanganModal.tsx`
  * `InfoArmadaAktifModal.tsx` & `InfoInfrastrukturModal.tsx` (di mode desktop)
  * `KementerianModal.tsx`
  * `IndeksKesejahteraanModal.tsx`
* **Kasus Tidak Konsisten (Harus Diperbaiki Segera):**
  * 18 modul dengan kondisi tukar (`ArmadaModal`, `StatistikKepuasanModal`, `NaikkanKepuasanModal`, `KelistrikanModal`, `ProduksiModal`, `TempatUmumModal`, `HunianPermukimanModal`, `PemasukkanPengeluaranModal`, `PDBModal`, `HargaModal`, `SubsidiModal`, `SistemEkonomiModal`, `PerdaganganModal`, `OrgIntlModal`, `RingkasanPopulasiModal`, `IdeologiModal`, `AgamaModal`).
