// detail path: c:\EM\apps\src\app\page\navigasi_menu\2_navigasi_bawah\ModalsManager.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { fetchBuildingMetadata } from '../../../../lib/buildingMetadata';
import { processDueLoans } from './4_ekonomi/3_peminjaman_hutang/tab_menu/logic/loanRepaymentLogic';

import dynamic from 'next/dynamic';

// 1. Kepuasan
const StatistikKepuasanModal = dynamic(() => import("./1_kepuasan/1_statistik/StatistikKepuasanModal"), { ssr: false });
const NaikkanKepuasanModal = dynamic(() => import("./1_kepuasan/2_naikkan_kepuasan/NaikkanKepuasanModal"), { ssr: false });

// 2. Populasi
const RingkasanPopulasiModal = dynamic(() => import("./2_populasi/RingkasanPopulasiModal"), { ssr: false });

// 3. Produksi & Konsumsi
const KelistrikanModal = dynamic(() => import("./3_produksi_konsumsi/1_grid_nasional/KelistrikanModal"), { ssr: false });
const IndustriPanganModal = dynamic(() => import("./3_produksi_konsumsi/2_industri_pangan/IndustriPanganModal"), { ssr: false });

// 4. Ekonomi
const PerdaganganModal = dynamic(() => import("./4_ekonomi/1_perdagangan/PerdaganganModal"), { ssr: false });
const PajakModal = dynamic(() => import("./4_ekonomi/2_manajemen_pajak/PajakModal"), { ssr: false });
const HutangModal = dynamic(() => import("./4_ekonomi/3_peminjaman_hutang/HutangModal"), { ssr: false });
const PemasukkanPengeluaranModal = dynamic(() => import("./4_ekonomi/4_pemasukan_pengeluaran/PemasukkanPengeluaranModal"), { ssr: false });
const PDBModal = dynamic(() => import("./4_ekonomi/5_pdb_nasional_dunia/PDBModal"), { ssr: false });
const HargaModal = dynamic(() => import("./4_ekonomi/6_harga/HargaModal"), { ssr: false });
const SistemEkonomiModal = dynamic(() => import("./4_ekonomi/7_sistem_ekonomi/SistemEkonomiModal"), { ssr: false });
const SubsidiModal = dynamic(() => import("./4_ekonomi/8_kebijakan_subsidi/SubsidiModal"), { ssr: false });

// 5. Pembangunan
const ProduksiModal = dynamic(() => import("./5_pembangunan/1_produksi/ProduksiModal"), { ssr: false });
const TempatUmumModal = dynamic(() => import("./5_pembangunan/2_tempat_umum/TempatUmumModal"), { ssr: false });
const HunianPermukimanModal = dynamic(() => import("./5_pembangunan/3_hunian/HunianPermukimanModal"), { ssr: false });

// 6. Pertahanan
const SerangNegaraModal = dynamic(() => import("./6_pertahanan/1_serang_negara/SerangNegaraModal"), { ssr: false });
const IntelijenModal = dynamic(() => import("./6_pertahanan/2_intelijen/IntelijenModal"), { ssr: false });
const WilayahDirebutModal = dynamic(() => import("./6_pertahanan/3_wilayah_direbut/WilayahDirebutModal"), { ssr: false });
const ArmadaModal = dynamic(() => import("./6_pertahanan/4_armada/ArmadaModal"), { ssr: false });
const IcbmModal = dynamic(() => import("./6_pertahanan/5_icbm/IcbmModal"), { ssr: false });

// 7. Geopolitik
const PBBModal = dynamic(() => import("./7_geopolitik/1_PBB/PBBModal"), { ssr: false });
const KedutaanBesarModal = dynamic(() => import("./7_geopolitik/KedutaanBesarModal"), { ssr: false });
const OrgIntlModal = dynamic(() => import("./7_geopolitik/3_organisasi_internasional/OrgIntlModal"), { ssr: false });
const TingkatHubunganModal = dynamic(() => import("./7_geopolitik/TingkatHubunganModal"), { ssr: false });

// 8. Sosial & Budaya
const AgamaModal = dynamic(() => import("./8_sosial_budaya/agama/AgamaModal"), { ssr: false });
const IdeologiModal = dynamic(() => import("./8_sosial_budaya/ideologi/IdeologiModal"), { ssr: false });
const DoktrinKeterbukaanModal = dynamic(() => import("./8_sosial_budaya/keterbukaan/DoktrinKeterbukaanModal"), { ssr: false });

// 9. Kementerian
const KementerianModal = dynamic(() => import("./9_kementrian/KementerianModal"), { ssr: false });

interface ModalCountryDetail {
  [key: string]: unknown;
}

interface ModalsManagerProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  countryDetail: ModalCountryDetail | null;
  setCountryDetail: (detail: ModalCountryDetail | ((prev: ModalCountryDetail) => ModalCountryDetail)) => void;
  selectedCountry: {
    country?: string;
    capital?: string;
    iso?: string;
  } | null;
  currentDate?: Date;
  resetTrigger?: boolean;
  productionDeepLink?: { tab: string; key: string } | null;
  setProductionDeepLink?: (value: { tab: string; key: string } | null) => void;
  tempatUmumDeepLink?: string | null;
  setTempatUmumDeepLink?: (value: string | null) => void;
  tempatUmumInitialTab?: string;
  setTempatUmumInitialTab?: (value: string) => void;
  kesejahteraanDeepLink?: boolean;
  setKesejahteraanDeepLink?: (value: boolean) => void;
  kesejahteraanInitialTab?: "statistik" | "naikkan";
  setKesejahteraanInitialTab?: (value: "statistik" | "naikkan") => void;
  onOpenCountryDetail?: (countryName: string) => void;
  onOpenPlayerDetail?: () => void;
  presidentRating?: number;
  setPresidentRating?: (rating: number) => void;
}

function ModalsManager({
  activeMenu,
  setActiveMenu,
  countryDetail,
  setCountryDetail,
  selectedCountry,
  currentDate,
  resetTrigger,
  productionDeepLink,
  setProductionDeepLink,
  tempatUmumDeepLink,
  setTempatUmumDeepLink,
  kesejahteraanDeepLink,
  setKesejahteraanDeepLink,
  kesejahteraanInitialTab,
  setKesejahteraanInitialTab,
  onOpenCountryDetail,
  onOpenPlayerDetail,
  presidentRating = 50,
  setPresidentRating,
}: ModalsManagerProps) {
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [prefetchedAllCountries, setPrefetchedAllCountries] = useState<any[] | null>(null);
  const [armadaInitialTab, setArmadaInitialTab] = useState<'aktif' | 'infrastruktur' | 'polisi'>('aktif');
  const [tempatUmumInitialTab, setTempatUmumInitialTab] = useState<string>('infrastruktur');

  useEffect(() => {
    fetchBuildingMetadata()
      .then((data) => setMetadata(data || {}))
      .catch((err) => console.error('ModalsManager: failed to load building metadata', err));
  }, []);

  // Fetch full country dataset lazily when a menu that requires global country comparison is opened
  useEffect(() => {
    const menusNeedingAllCountries = [
      'Kelistrikan', 'Industri Pangan', 'PDB', 'Finansial Global',
      'Menu:SerangNegara', 'Menu:Intelijen', 'Menu:ICBM', 'Menu:Perdagangan'
    ];
    if (prefetchedAllCountries === null && (menusNeedingAllCountries.includes(activeMenu) || activeMenu?.includes('Serang') || activeMenu?.includes('Intelijen'))) {
      (async () => {
        try {
          const res = await fetch('/api/country-data?all=true');
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setPrefetchedAllCountries(data);
        } catch (e) {
          console.warn('ModalsManager: failed to fetch all countries', e);
        }
      })();
    }
  }, [activeMenu, prefetchedAllCountries]);

  // Ensure due loans are processed whenever the global date advances so repayments don't require opening the Hutang modal
  useEffect(() => {
    if (!currentDate || !countryDetail) return;
    try {
      const riwayatPinjaman = Array.isArray(countryDetail?.pinjamanList) ? countryDetail.pinjamanList : [];
      if (riwayatPinjaman.length === 0) return;

      const initialCash = Number(countryDetail.anggaran) || 0;
      const { nextLoanList, availableCash, updatedTotalHutang, updated } = processDueLoans(
        riwayatPinjaman,
        currentDate instanceof Date ? new Date(currentDate) : new Date(currentDate),
        initialCash
      );

      if (!updated) return;

      setCountryDetail({
        ...(countryDetail || {}),
        anggaran: Math.max(0, availableCash),
        totalHutang: Math.max(0, updatedTotalHutang),
        pinjamanList: nextLoanList,
      });
    } catch (e) {
      // don't block UI on failure
      console.warn('ModalsManager: failed to process due loans on date change', e);
    }
  }, [currentDate, countryDetail, setCountryDetail]);

  // Jika tidak ada negara yang dipilih, jangan render apapun
  if (!selectedCountry) return null;

  // Fungsi penutup modal yang seragam
  const onClose = () => setActiveMenu("Peta Taktis");

  // Render modal yang sesuai berdasarkan activeMenu
  switch (activeMenu) {
    // 1. Kepuasan
    case "Dashboard:Kepuasan":
      return (
        <StatistikKepuasanModal
          isOpen={true}
          onClose={onClose}
          setActiveMenu={setActiveMenu}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          selectedCountry={selectedCountry}
          metadata={metadata}
        />
      );
    case "Action:NaikkanKepuasan":
      return (
        <NaikkanKepuasanModal
          isOpen={true}
          onClose={onClose}
          setActiveMenu={setActiveMenu}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          selectedCountry={selectedCountry}
          presidentRating={presidentRating}
          setPresidentRating={setPresidentRating}
          currentDate={currentDate}
        />
      );
    case "Dashboard:Populasi:Overview":
      return (
        <RingkasanPopulasiModal
          isOpen={true}
          onClose={() => {
            setKesejahteraanDeepLink?.(false);
            setKesejahteraanInitialTab?.("statistik"); // Reset tab setelah ditutup
            onClose();
          }}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          currentDate={currentDate}
          selectedCountry={selectedCountry}
          setActiveMenu={setActiveMenu}
          initialOpenKesejahteraan={kesejahteraanDeepLink}
          initialKesejahteraanTab={kesejahteraanInitialTab}
          onOpenArmadaTab={(tab) => {
            setArmadaInitialTab(tab);
            setActiveMenu("Menu:Armada");
          }}
          onOpenTempatUmum={(tabId) => {
            setTempatUmumInitialTab(tabId);
            setTempatUmumDeepLink?.(tabId);
            setActiveMenu("Menu:TempatUmum");
          }}
        />
      );

    // 3. Produksi & Konsumsi
    case "Menu:Kelistrikan":
      return (
        <KelistrikanModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          metadata={metadata}
          prefetchedAllCountries={prefetchedAllCountries || undefined}
        />
      );
    case "Menu:IndustriPangan":
      return (
        <IndustriPanganModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          metadata={metadata}
          onGotoProduction={(tab, key) => {
            setActiveMenu("Menu:Produksi");
            setProductionDeepLink?.({ tab, key });
          }}
          prefetchedAllCountries={prefetchedAllCountries || undefined}
        />
      );

    // 4. Ekonomi
    case "Menu:Perdagangan":
      return (
        <PerdaganganModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          currentDate={currentDate}
          resetTrigger={resetTrigger}
          prefetchedAllCountries={prefetchedAllCountries || undefined}
        />
      );
    case "Menu:Pajak":
      return (
        <PajakModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
        />
      );
    case "Menu:Hutang":
      return (
        <HutangModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          currentDate={currentDate}
          resetTrigger={resetTrigger}
        />
      );
    case "Menu:Budget":
      return (
        <PemasukkanPengeluaranModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          selectedCountry={selectedCountry}
          onGotoPajak={() => setActiveMenu("Menu:Pajak")}
          onGotoProduction={(tab, key) => {
            setActiveMenu("Menu:Produksi");
            setProductionDeepLink?.({ tab, key });
          }}
        />
      );
    case "Menu:PDB":
      return (
        <PDBModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          selectedCountry={selectedCountry}
        />
      );
    case "Menu:Harga":
      return (
        <HargaModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
        />
      );
    case "Menu:SistemEkonomi":
      return (
        <SistemEkonomiModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
        />
      );
    case "Menu:KebijakanSubsidi":
      return (
        <SubsidiModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
        />
      );

    // 5. Pembangunan
    case "Menu:Produksi":
      return (
        <ProduksiModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          currentDate={currentDate}
          targetTab={productionDeepLink?.tab}
          targetHighlightedKey={productionDeepLink?.key}
          onProductionDeepLinkHandled={() => setProductionDeepLink?.(null)}
        />
      );
    case "Menu:TempatUmum":
      return (
        <TempatUmumModal
          isOpen={true}
          onClose={() => {
            setTempatUmumDeepLink?.(null);
            onClose();
          }}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          currentDate={currentDate}
          initialTab={tempatUmumDeepLink || tempatUmumInitialTab || 'infrastruktur'}
          onGotoProduction={(tab, key) => {
            setTempatUmumDeepLink?.(null);
            setActiveMenu("Menu:Produksi");
            setProductionDeepLink?.({ tab, key });
          }}
        />
      );
    case "Menu:HunianPermukiman":
      return (
        <HunianPermukimanModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          currentDate={currentDate}
          onGotoProduction={(tab, key) => {
            setActiveMenu("Menu:Produksi");
            setProductionDeepLink?.({ tab, key });
          }}
        />
      );

    // 6. Pertahanan
    case "Menu:SerangNegara":
      return (
        <SerangNegaraModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          prefetchedAllCountries={prefetchedAllCountries ?? undefined}
        />
      );
    case "Menu:Intelijen":
      return (
        <IntelijenModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          prefetchedAllCountries={prefetchedAllCountries ?? undefined}
        />
      );
    case "Menu:WilayahDirebut":
      return (
        <WilayahDirebutModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
        />
      );
    case "Menu:Armada":
      return (
        <ArmadaModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          currentDate={currentDate}
          initialTab={armadaInitialTab}
          onGotoProduction={(tab, key) => {
            setActiveMenu("Menu:Produksi");
            setProductionDeepLink?.({ tab, key });
          }}
        />
      );
    case "Menu:ICBM":
      return (
        <IcbmModal
          isOpen={true}
          onClose={onClose}
          currentDate={currentDate}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          onOpenDebt={() => setActiveMenu("Menu:Hutang")}
          onGotoProduction={(tab: string, key: string) => {
            setActiveMenu("Menu:Produksi");
            setProductionDeepLink?.({ tab, key });
          }}
          prefetchedAllCountries={prefetchedAllCountries || undefined}
        />
      );

    // 7. Geopolitik
    case "Menu:PBB":
      return (
        <PBBModal
          isOpen={true}
          onClose={onClose}
          selectedCountry={selectedCountry}
        />
      );
    case "Menu:KedutaanBesar":
      return (
        <KedutaanBesarModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          onOpenCountryDetail={onOpenCountryDetail}
        />
      );
    case "Menu:OrganisasiInternasional:organisasi_pbb":
      return (
        <OrgIntlModal
          isOpen={true}
          onClose={onClose}
          selectedCountry={selectedCountry}
          onOpenCountryDetail={onOpenCountryDetail}
          onOpenPlayerDetail={onOpenPlayerDetail}
        />
      );
    case "Menu:TingkatHubungan":
      return (
        <TingkatHubunganModal
          isOpen={true}
          onClose={onClose}
          selectedCountry={selectedCountry}
          countryDetail={countryDetail}
        />
      );

    // 8. Sosial & Budaya
    case "Menu:Agama":
      return (
        <AgamaModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          onOpenDebt={() => setActiveMenu("Menu:Hutang")}
        />
      );
    case "Menu:Ideologi":
      return (
        <IdeologiModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          onOpenDebt={() => setActiveMenu("Menu:Hutang")}
        />
      );
    case "Menu:DoktrinKeterbukaan":
      return (
        <DoktrinKeterbukaanModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          selectedCountry={selectedCountry}
        />
      );

    // 9. Kementerian
    case "Dashboard:Kementerian":
      return (
        <KementerianModal
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          resetTrigger={resetTrigger}
        />
      );

    default:
      // Jika tidak ada menu yang cocok, tidak render apapun
      return null;
  }
}

// Membungkus dengan React.memo untuk menghindari render ulang yang tidak perlu
export default React.memo(ModalsManager);