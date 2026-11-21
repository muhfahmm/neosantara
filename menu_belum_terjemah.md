# Daftar Menu & Komponen yang Belum Diterjemahkan

Dokumen ini berisi rincian komponen `.tsx` pada `apps/src/app/page/` yang belum menggunakan hook `useLanguage` (masih hardcoded dalam bahasa Indonesia).

---

## Ringkasan Status

| Area / Menu | Menggunakan `useLanguage` | Belum Diterjemahkan | Status |
| :--- | :---: | :---: | :--- |
| **Side Menu** (`inbox`, `mission`, `news`, `penelitian`, `reward`, `shop`, `tracking-modals`) | 59 / 59 | 0 | Selesai 100% |
| **Navbar, Navigasi Atas, & Paused Menu** | 14 / 14 | 0 | Selesai 100% |
| **1. Kepuasan** (`1_kepuasan`) | 3 / 4 | 1 | Sebagian |
| **2. Populasi** (`2_populasi`) | 5 / 6 | 1 | Sebagian |
| **3. Produksi & Konsumsi** (`3_produksi_konsumsi`) | 5 / 7 | 2 | Sebagian |
| **4. Ekonomi** (`4_ekonomi`) | 39 / 50 | 11 | Sebagian |
| **5. Pembangunan** (`5_pembangunan`) | 12 / 19 | 7 | Sebagian |
| **6. Pertahanan** (`6_pertahanan`) | 9 / 34 | 25 | Sebagian (`4_armada` & `5_icbm` 0%) |
| **7. Geopolitik** (`7_geopolitik`) | 0 / 27 | 27 | Belum Sama Sekali (0%) |
| **8. Sosial & Budaya** (`8_sosial_budaya`) | 8 / 10 | 2 | Sebagian |
| **9. Kementerian** (`9_kementrian`) | 0 / 4 | 4 | Belum Sama Sekali (0%) |
| **Wrapper / Info Navigasi Bawah** | - | 4 | Belum |
| **Detail Negara** (`detail_negara`) | 13 / 59 | 46 | Sebagian |
| **Map System** (`map_system`) | 1 / 11 | 10 | Sebagian |

---

## Detail File yang Belum Diterjemahkan

### A. Navigasi Bawah (`apps/src/app/page/navigasi_menu/2_navigasi_bawah/`)

#### 1. Kepuasan (`1_kepuasan`) — 1 file
- [ ] `1_kepuasan/RingkasanPeringkatModal.tsx`

#### 2. Populasi (`2_populasi`) — 1 file
- [ ] `2_populasi/TabelPopulasiNegara.tsx`

#### 3. Produksi & Konsumsi (`3_produksi_konsumsi`) — 2 file
- [ ] `3_produksi_konsumsi/1_grid_nasional/CountryDetailKonsumsiModal.tsx`
- [ ] `3_produksi_konsumsi/fuelLogic/TravelFuelCostPanel.tsx`

#### 4. Ekonomi (`4_ekonomi`) — 11 file
- [ ] `4_ekonomi/1_perdagangan/mitra/tambahMitraBaru.tsx`
- [ ] `4_ekonomi/3_peminjaman_hutang/tab_menu/utils.tsx`
- [ ] `4_ekonomi/4_pendapatan/1_anggaran/finansial_global/finansialGlobal.tsx`
- [ ] `4_ekonomi/6_daya_beli/2_kebijakan_subsidi/DetailSubsidiItemModal.tsx`
- [ ] `4_ekonomi/6_daya_beli/2_kebijakan_subsidi/tab_menu/1_semua_sektor/SemuaSektorTab.tsx`
- [ ] `4_ekonomi/6_daya_beli/2_kebijakan_subsidi/tab_menu/2_energi/EnergiTab.tsx`
- [ ] `4_ekonomi/6_daya_beli/2_kebijakan_subsidi/tab_menu/3_pangan/PanganTab.tsx`
- [ ] `4_ekonomi/6_daya_beli/2_kebijakan_subsidi/tab_menu/4_pendidikan_kesehatan/PendidikanKesehatanTab.tsx`
- [ ] `4_ekonomi/6_daya_beli/2_kebijakan_subsidi/tab_menu/5_transportasi_perumahan/TransportasiPerumahanTab.tsx`
- [ ] `4_ekonomi/6_daya_beli/2_kebijakan_subsidi/tab_menu/6_umkm_ekonomi/UmkmEkonomiTab.tsx`
- [ ] `4_ekonomi/6_daya_beli/2_kebijakan_subsidi/tab_menu/7_perlindungan_sosial/PerlindunganSosialTab.tsx`

#### 5. Pembangunan (`5_pembangunan`) — 7 file
- [ ] `5_pembangunan/1_produksi/card_data/1_kelistrikan.tsx`
- [ ] `5_pembangunan/1_produksi/card_data/2_mineral_energi.tsx`
- [ ] `5_pembangunan/1_produksi/card_data/3_manufaktur.tsx`
- [ ] `5_pembangunan/1_produksi/card_data/4_peternakan.tsx`
- [ ] `5_pembangunan/1_produksi/card_data/5_agrikultur.tsx`
- [ ] `5_pembangunan/1_produksi/card_data/6_perikanan.tsx`
- [ ] `5_pembangunan/1_produksi/card_data/7_olahan_pangan.tsx`

#### 6. Pertahanan (`6_pertahanan`) — 25 file
*(Catatan: `1_serang_negara`, `2_intelijen`, dan `3_wilayah_direbut` sudah 100% menggunakan `useLanguage`)*

- **Armada (`4_armada`) — 10 file:**
  - [ ] `6_pertahanan/4_armada/ArmadaModal.tsx`
  - [ ] `6_pertahanan/4_armada/1_tab_menu/1_armada_aktif.tsx`
  - [ ] `6_pertahanan/4_armada/1_tab_menu/2_infrastruktur_militer.tsx`
  - [ ] `6_pertahanan/4_armada/2_modals_konfirmasi_pembangunan/1_konfirmasi_armada_aktif_modal.tsx`
  - [ ] `6_pertahanan/4_armada/2_modals_konfirmasi_pembangunan/2_konfirmasi_infrastruktur_modal.tsx`
  - [ ] `6_pertahanan/4_armada/construction_support/BuildingRequirementCard.tsx`
  - [ ] `6_pertahanan/4_armada/construction_support/MaterialRequirementsDisplay.tsx`
  - [ ] `6_pertahanan/4_armada/construction_support/MaterialRequirementsGrid.tsx`
  - [ ] `6_pertahanan/4_armada/modals_info/1_info_armada_aktif_modal.tsx`
  - [ ] `6_pertahanan/4_armada/modals_info/2_info_infrastruktur_modal.tsx`
- **ICBM (`5_icbm`) — 15 file:**
  - [ ] `6_pertahanan/5_icbm/IcbmModal.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/NeonAlertModal.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/1_program_nuklir/danaTidakCukupModals.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/1_program_nuklir/programNuklirModals.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/1_program_nuklir/ProgramNuklirTimeDetail.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/2_ICBM/ConfirmBuildIcbmModal.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/2_ICBM/IcbmBuildStatusModal.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/2_ICBM/IcbmDetailModal.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/2_ICBM/IcbmInsufficientFundsModal.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/2_ICBM/tab_menu/tabelDalamPembangunan.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/2_ICBM/tab_menu/tabelSelesai.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/2_ICBM/tab_menu/tabelStokIcbm.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/3_perang_nuklir/PerangNuklirDetailModal.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/4_status_nuklir_icbm_dunia/StatusNuklirIcbmDuniaModal.tsx`
  - [ ] `6_pertahanan/5_icbm/modals_menu/5_ujicoba_icbm/UjicobaIcbmModal.tsx`

#### 7. Geopolitik (`7_geopolitik`) — 27 file (0%)
- **Root Geopolitik — 3 file:**
  - [ ] `7_geopolitik/BantuanModal.tsx`
  - [ ] `7_geopolitik/KedutaanBesarModal.tsx`
  - [ ] `7_geopolitik/TingkatHubunganModal.tsx`
- **PBB (`1_PBB`) — 17 file:**
  - [ ] `7_geopolitik/1_PBB/PBBModal.tsx`
  - [ ] `7_geopolitik/1_PBB/1_resolusi_PBB/1_pilihProdukLarangan.tsx`
  - [ ] `7_geopolitik/1_PBB/1_resolusi_PBB/menus/1_resolusiPBB.tsx`
  - [ ] `7_geopolitik/1_PBB/1_resolusi_PBB/menus/2_negara_target.tsx`
  - [ ] `7_geopolitik/1_PBB/1_resolusi_PBB/menus/3_jumlah_suara.tsx`
  - [ ] `7_geopolitik/1_PBB/1_resolusi_PBB/menus/4_modal_setuju.tsx`
  - [ ] `7_geopolitik/1_PBB/1_resolusi_PBB/menus/5_modal_menolak.tsx`
  - [ ] `7_geopolitik/1_PBB/1_resolusi_PBB/menus/6_modal_abstain.tsx`
  - [ ] `7_geopolitik/1_PBB/2_keamanan_PBB/logika_anggota_tidak_tetap/SecurityCouncilElectionPanel.tsx`
  - [ ] `7_geopolitik/1_PBB/2_keamanan_PBB/menus/1_keamananPBB.tsx`
  - [ ] `7_geopolitik/1_PBB/2_keamanan_PBB/menus/2_negara_target.tsx`
  - [ ] `7_geopolitik/1_PBB/2_keamanan_PBB/menus/3_jumlah_suara.tsx`
  - [ ] `7_geopolitik/1_PBB/2_keamanan_PBB/menus/4_modal_setuju.tsx`
  - [ ] `7_geopolitik/1_PBB/2_keamanan_PBB/menus/5_modal_menolak.tsx`
  - [ ] `7_geopolitik/1_PBB/2_keamanan_PBB/menus/6_modal_abstain.tsx`
  - [ ] `7_geopolitik/1_PBB/2_keamanan_PBB/menus/7_modal_veto.tsx`
  - [ ] `7_geopolitik/1_PBB/3_suara_negara_PBB/suaraPBB.tsx`
- **Organisasi Internasional (`3_organisasi_internasional`) — 7 file:**
  - [ ] `7_geopolitik/3_organisasi_internasional/DanaTidakCukupOrganisasiModal.tsx`
  - [ ] `7_geopolitik/3_organisasi_internasional/OrgIntlInfoModal.tsx`
  - [ ] `7_geopolitik/3_organisasi_internasional/OrgIntlModal.tsx`
  - [ ] `7_geopolitik/3_organisasi_internasional/PermohonanKeanggotaanModal.tsx`
  - [ ] `7_geopolitik/3_organisasi_internasional/1_organisasi_PBB/organisasiPBBmodal.tsx`
  - [ ] `7_geopolitik/3_organisasi_internasional/2_organisasi_regional/organisasiRegional.tsx`
  - [ ] `7_geopolitik/3_organisasi_internasional/2_organisasi_regional/requirementsLogic/MembershipEligibilityPanel.tsx`

#### 8. Sosial & Budaya (`8_sosial_budaya`) — 2 file
- [ ] `8_sosial_budaya/agama/EfektivitasAgamaModal.tsx`
- [ ] `8_sosial_budaya/ideologi/EfektivitasIdeologiModal.tsx`

#### 9. Kementerian (`9_kementrian`) — 4 file (0%)
- [ ] `9_kementrian/KementerianModal.tsx`
- [ ] `9_kementrian/PilihMenteriModal.tsx`
- [ ] `9_kementrian/2_ganti_ibukota/GantiIbukotaModal.tsx`
- [ ] `9_kementrian/2_ganti_ibukota/KonfirmasiGantiIbukotaModal.tsx`

#### Wrapper / Info Navigasi Bawah — 4 file
- [ ] `MenuInfoButton.tsx`
- [ ] `MenuInfoModal.tsx`
- [ ] `ModalsManager.tsx`
- [ ] `NotebookModalWrapper.tsx`

---

### B. Detail Negara (`apps/src/app/page/detail_negara/`) — 46 file

#### 1. Informasi Umum (`1_informasi_umum`)
- [ ] `1_kedutaan_besar/BuildEmbassyModal.tsx`
- [ ] `1_kedutaan_besar/DestroyEmbassyModal.tsx`
- [ ] `1_kedutaan_besar/EmbassyRelationRequirementModal.tsx`
- [ ] `1_kedutaan_besar/kedutaanBesarModals.tsx`
- [ ] `2_pakta_non_agresi/DestroyPaktaModal.tsx`
- [ ] `2_pakta_non_agresi/paktaNonAgresiModals.tsx`
- [ ] `3_aliansi_pertahanan/aliansiPertahananModals.tsx`
- [ ] `3_aliansi_pertahanan/DestroyAliansiModal.tsx`
- [ ] `4_perjanjian_dagang/BuildTradeModal.tsx`
- [ ] `4_perjanjian_dagang/DestroyTradeModal.tsx`
- [ ] `4_perjanjian_dagang/perjanjianDagangModals.tsx`
- [ ] `5_kontrak_penelitian/DestroyKontrakModal.tsx`
- [ ] `5_kontrak_penelitian/kontrakPenelitianModals.tsx`
- [ ] `6_kirim_pasukan/kirimPasukanModals.tsx`
- [ ] `7_panggil_sekutu/panggilSekutuModals.tsx`
- [ ] `8_berikan_sanksi/berikanSanksiModals.tsx`
- [ ] `provinsi_logic/ProvinsiActionGrid.tsx`
- [ ] `provinsi_logic/ProvinsiInformasiUmum.tsx`
- [ ] `provinsi_logic/ProvinsiOperasiMiliter.tsx`
- [ ] `provinsi_logic/1_informasi_umum/2_tugaskan_misionaris/MissionaryResultModal.tsx`
- [ ] `provinsi_logic/1_informasi_umum/4_kirim_bantuan/ProvinceAidModal.tsx`
- [ ] `provinsi_logic/1_informasi_umum/5_tanamkan_ideologi/IdeologyResultModal.tsx`

#### 2. Geopolitik (`2_geopolitik`)
- [ ] `2_geopolitik/1_beri_tentara/beriTentaraModals.tsx`
- [ ] `2_geopolitik/2_beri_hadiah/beriHadiahModals.tsx`
- [ ] `2_geopolitik/3_tingkatkan_hubungan/tingkatkanHubunganModals.tsx`
- [ ] `2_geopolitik/5_minta_bantuan/mintaBantuanModals.tsx`
- [ ] `2_geopolitik/6_berikan_wilayah/berikanWilayahModals.tsx`

#### 3. Operasi Militer (`3_operasi_militer`)
- [ ] `3_operasi_militer/1_serang_negara/SeranganMasihBerlangsungModal.tsx`
- [ ] `3_operasi_militer/1_serang_negara/serangNegaraModals.tsx`
- [ ] `3_operasi_militer/4_perang_nuklir/IcbmTidakTersediaModal.tsx`
- [ ] `3_operasi_militer/4_perang_nuklir/perangNuklirModals.tsx`
- [ ] `3_operasi_militer/5_lakukan_kudeta/kudetaModals.tsx`
- [ ] `3_operasi_militer/6_minta_serang_negara/mintaSerangNegaraModals.tsx`
- [ ] `3_operasi_militer/6_minta_serang_negara/statusMintaSerangModal.tsx`
- [ ] `3_operasi_militer/7_hina/hinaModals.tsx`

#### 4. Developing AI Building (`4_developing_ai_building`)
- [ ] `4_developing_ai_building/index.tsx`
- [ ] `4_developing_ai_building/sections/DoktrinKeterbukaanSection.tsx`
- [ ] `4_developing_ai_building/sections/HargaBarangPokokSection.tsx`
- [ ] `4_developing_ai_building/sections/HunianPermukimanSection.tsx`
- [ ] `4_developing_ai_building/sections/KelistrikanSection.tsx`
- [ ] `4_developing_ai_building/sections/PajakSection.tsx`
- [ ] `4_developing_ai_building/sections/PembangunanSipilMiliterSection.tsx`
- [ ] `4_developing_ai_building/sections/ProduksiPanganSection.tsx`
- [ ] `4_developing_ai_building/sections/SistemEkonomiSection.tsx`
- [ ] `4_developing_ai_building/sections/SpektrumKepuasanSection.tsx`
- [ ] `4_developing_ai_building/sections/SubsidiSection.tsx`

---

### C. Map System & Notifikasi (`apps/src/app/page/map_system/`) — 10 file

- [ ] `map-system.tsx`
- [ ] `page.tsx`
- [ ] `RequireEmbassyModal.tsx`
- [ ] `warResultModal.tsx`
- [ ] `forum-dialog-terbuka/page.tsx`
- [ ] `pilih-negara/page.tsx`
- [ ] `pilih-negara/pilih-negara.tsx`
- [ ] `menu_notifikasi/notifikasi_peringatan/modalsAnnexedGameOver.tsx`
- [ ] `menu_notifikasi/notifikasi_peringatan/modalsKudeta.tsx`
- [ ] `menu_notifikasi/notifikasi_peringatan/modalsPeringatanPeringkat.tsx`
