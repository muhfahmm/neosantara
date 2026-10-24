// detail path: c:\EM\apps\src\app\page\navigasi_menu\2_navigasi_bawah\ModalsManager.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { fetchBuildingMetadata } from '../../../../lib/buildingMetadata';
import { processDueLoans } from './4_ekonomi/3_peminjaman_hutang/tab_menu/logic/loanRepaymentLogic';
import { processActiveResearch } from '@/app/page/menus/penelitian/penelitianPageMenu';
import { isCountryUnderEconomicEmbargo } from './7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic';
import {
  applyNpcCountrySimulationStates,
  getNpcCountrySimulationSnapshot,
  NPC_COUNTRY_SIMULATION_UPDATED_EVENT,
} from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import type { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { processCorruptionMonth } from './9_kementrian/1_pemberantasan_korupsi/logic/scandalLogic';
import { calculateDailyPopulationChange, type CountryDetail } from '@/app/logic/populations_logic/population_logic';
import { generatePopulasiDefisitNotification } from '@/app/page/menus/inbox/logic/8_kebutuhan_pokok_warga/5_populasi/populasiDefisitLogic';

import dynamic from 'next/dynamic';

export { preloadModalForMenu } from './modalPreloaders';

const ModalLoadingFallback = () => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-8"
    role="status"
    aria-label="Memuat menu"
  >
    <div className="flex items-center gap-3 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] px-5 py-4 text-sm font-semibold text-[#E0E0E0] shadow-2xl">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#00FFAA]/30 border-t-[#00FFAA]" />
      Menyiapkan menu...
    </div>
  </div>
);

// 1. Kepuasan
const StatistikKepuasanModal = dynamic(() => import("./1_kepuasan/1_statistik/StatistikKepuasanModal"), { ssr: false, loading: ModalLoadingFallback });
const NaikkanKepuasanModal = dynamic(() => import("./1_kepuasan/2_naikkan_kepuasan/NaikkanKepuasanModal"), { ssr: false, loading: ModalLoadingFallback });

// 2. Populasi
const RingkasanPopulasiModal = dynamic(() => import("./2_populasi/RingkasanPopulasiModal"), { ssr: false, loading: ModalLoadingFallback });

// 3. Produksi & Konsumsi
const KelistrikanModal = dynamic(() => import("./3_produksi_konsumsi/1_grid_nasional/KelistrikanModal"), { ssr: false, loading: ModalLoadingFallback });
const IndustriPanganModal = dynamic(() => import("./3_produksi_konsumsi/2_industri_pangan/IndustriPanganModal"), { ssr: false, loading: ModalLoadingFallback });

// 4. Ekonomi
const PerdaganganModal = dynamic(() => import("./4_ekonomi/1_perdagangan/PerdaganganModal"), { ssr: false, loading: ModalLoadingFallback });
const PajakModal = dynamic(() => import("./4_ekonomi/2_manajemen_pajak/PajakModal"), { ssr: false, loading: ModalLoadingFallback });
const HutangModal = dynamic(() => import("./4_ekonomi/3_peminjaman_hutang/HutangModal"), { ssr: false, loading: ModalLoadingFallback });
const PemasukkanPengeluaranModal = dynamic(() => import("./4_ekonomi/4_pemasukan_pengeluaran/PemasukkanPengeluaranModal"), { ssr: false, loading: ModalLoadingFallback });
const PDBModal = dynamic(() => import("./4_ekonomi/5_pdb_nasional_dunia/PDBModal"), { ssr: false, loading: ModalLoadingFallback });
const HargaModal = dynamic(() => import("./4_ekonomi/6_harga/HargaModal"), { ssr: false, loading: ModalLoadingFallback });
const SistemEkonomiModal = dynamic(() => import("./4_ekonomi/7_sistem_ekonomi/SistemEkonomiModal"), { ssr: false, loading: ModalLoadingFallback });
const SubsidiModal = dynamic(() => import("./4_ekonomi/8_kebijakan_subsidi/SubsidiModal"), { ssr: false, loading: ModalLoadingFallback });

// 5. Pembangunan
const ProduksiModal = dynamic(() => import("./5_pembangunan/1_produksi/ProduksiModal"), { ssr: false, loading: ModalLoadingFallback });
const TempatUmumModal = dynamic(() => import("./5_pembangunan/2_tempat_umum/TempatUmumModal"), { ssr: false, loading: ModalLoadingFallback });
const HunianPermukimanModal = dynamic(() => import("./5_pembangunan/3_hunian/HunianPermukimanModal"), { ssr: false, loading: ModalLoadingFallback });

// 6. Pertahanan
const SerangNegaraModal = dynamic(() => import("./6_pertahanan/1_serang_negara/SerangNegaraModal"), { ssr: false, loading: ModalLoadingFallback });
const IntelijenModal = dynamic(() => import("./6_pertahanan/2_intelijen/IntelijenModal"), { ssr: false, loading: ModalLoadingFallback });
const WilayahDirebutModal = dynamic(() => import("./6_pertahanan/3_wilayah_direbut/WilayahDirebutModal"), { ssr: false, loading: ModalLoadingFallback });
const ArmadaModal = dynamic(() => import("./6_pertahanan/4_armada/ArmadaModal"), { ssr: false, loading: ModalLoadingFallback });
const IcbmModal = dynamic(() => import("./6_pertahanan/5_icbm/IcbmModal"), { ssr: false, loading: ModalLoadingFallback });

// 7. Geopolitik
const PBBModal = dynamic(() => import("./7_geopolitik/1_PBB/PBBModal"), { ssr: false, loading: ModalLoadingFallback });
const KedutaanBesarModal = dynamic(() => import("./7_geopolitik/KedutaanBesarModal"), { ssr: false, loading: ModalLoadingFallback });
const OrgIntlModal = dynamic(() => import("./7_geopolitik/3_organisasi_internasional/OrgIntlModal"), { ssr: false, loading: ModalLoadingFallback });
const TingkatHubunganModal = dynamic(() => import("./7_geopolitik/TingkatHubunganModal"), { ssr: false, loading: ModalLoadingFallback });

// 8. Sosial & Budaya
const AgamaModal = dynamic(() => import("./8_sosial_budaya/agama/AgamaModal"), { ssr: false, loading: ModalLoadingFallback });
const IdeologiModal = dynamic(() => import("./8_sosial_budaya/ideologi/IdeologiModal"), { ssr: false, loading: ModalLoadingFallback });
const DoktrinKeterbukaanModal = dynamic(() => import("./8_sosial_budaya/keterbukaan/DoktrinKeterbukaanModal"), { ssr: false, loading: ModalLoadingFallback });

// 9. Kementerian
const KementerianModal = dynamic(() => import("./9_kementrian/KementerianModal"), { ssr: false, loading: ModalLoadingFallback });
const CorruptionMenu = dynamic(() => import("./9_kementrian/1_pemberantasan_korupsi/KorupsiMenu"), { ssr: false, loading: ModalLoadingFallback });

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
  notifications?: NotificationMessage[];
  metadata?: Record<string, any>;
  onRemoveNotification?: (notificationId: string) => void;
  onOpenInbox?: () => void;
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
  notifications = [],
  metadata: initialMetadata,
  onRemoveNotification,
  onOpenInbox,
}: ModalsManagerProps) {
  const [metadata, setMetadata] = useState<Record<string, any>>(() => initialMetadata || {});

  useEffect(() => {
    if (initialMetadata && Object.keys(initialMetadata).length > 0) {
      setMetadata(initialMetadata);
    }
  }, [initialMetadata]);
  const [prefetchedAllCountries, setPrefetchedAllCountries] = useState<any[] | null>(null);
  const [armadaInitialTab, setArmadaInitialTab] = useState<'aktif' | 'infrastruktur'>('aktif');
  const [tempatUmumInitialTab, setTempatUmumInitialTab] = useState<string>('infrastruktur');
  const [hunianInitialTab, setHunianInitialTab] = useState<string>('rumah_subsidi');

  useEffect(() => {
    fetchBuildingMetadata()
      .then((data) => setMetadata(data || {}))
      .catch((err) => console.error('ModalsManager: failed to load building metadata', err));
  }, []);

  useEffect(() => {
    if (activeMenu !== 'Menu:Kelistrikan' && activeMenu !== 'Menu:Produksi') return;

    fetchBuildingMetadata()
      .then((data) => setMetadata(data || {}))
      .catch((err) => console.error('ModalsManager: failed to refresh building metadata', err));
  }, [activeMenu]);

  useEffect(() => {
    const refreshNpcCountries = () => {
      const snapshot = getNpcCountrySimulationSnapshot();
      if (!snapshot) {
        setPrefetchedAllCountries(null);
        return;
      }
      setPrefetchedAllCountries(current =>
        current ? applyNpcCountrySimulationStates(current) : current
      );
    };
    window.addEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshNpcCountries);
    return () => window.removeEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshNpcCountries);
  }, []);

  // Tanggapi resetTrigger dari restart simulasi: bersihkan data negara dan re-fetch baseline
  useEffect(() => {
    if (resetTrigger !== undefined) {
      setPrefetchedAllCountries(null);
    }
  }, [resetTrigger]);

  // Fetch full country dataset lazily when a menu that requires global country comparison is opened
  useEffect(() => {
    const menusNeedingAllCountries = [
      'Menu:Kelistrikan', 'Menu:IndustriPangan', 'Menu:PDB', 'Menu:Budget', 'Menu:Perdagangan',
      'Menu:SistemEkonomi', 'Menu:KebijakanSubsidi', 'Menu:SerangNegara', 'Menu:Intelijen', 'Menu:ICBM',
      'Kelistrikan', 'Industri Pangan', 'PDB', 'Finansial Global'
    ];
    if (prefetchedAllCountries === null && (menusNeedingAllCountries.includes(activeMenu) || activeMenu?.includes('Serang') || activeMenu?.includes('Intelijen'))) {
      (async () => {
        try {
          const res = await fetch('/api/country-data?all=true');
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPrefetchedAllCountries(applyNpcCountrySimulationStates(data));
          }
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

  const lastEvaluatedDeficitMonthRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentDate || !countryDetail) return;
    // Pastikan metadata sudah selesai dimuat agar rasio pangan & hunian tidak default ke 0 / defisit palsu
    if (!metadata || Object.keys(metadata).length === 0) return;

    const date = currentDate instanceof Date
      ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
      : String(currentDate).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

    const population = Number(countryDetail.jumlah_penduduk);
    if (!Number.isFinite(population) || population <= 0) return;

    const countryName = String(
      countryDetail.country ||
      countryDetail.nama_negara ||
      countryDetail.nama ||
      selectedCountry?.country ||
      'Negara',
    );
    const monthlyKey = date.slice(0, 7);
    const deficitNotifPrefix = `population-deficit-${countryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-`;

    try {
      const metrics = calculateDailyPopulationChange(
        { ...countryDetail, jumlah_penduduk: population } as CountryDetail,
        countryName,
        metadata,
        date,
      );

      // Jika pertumbuhan populasi positif (surplus / aman), bersihkan notifikasi defisit lama yang sempat masuk inbox
      if (metrics.netDailyChange >= 0) {
        lastEvaluatedDeficitMonthRef.current = null;
        if (onRemoveNotification && Array.isArray(notifications) && notifications.some(n => n.id?.startsWith(deficitNotifPrefix))) {
          notifications
            .filter(n => n.id?.startsWith(deficitNotifPrefix))
            .forEach(n => onRemoveNotification(n.id));
        }
        if (countryDetail.population_deficit_notification_month) {
          setCountryDetail(prev => prev && prev.population_deficit_notification_month ? { ...prev, population_deficit_notification_month: undefined } : prev);
        }
        return;
      }

      // Jika defisit dan sudah diproses untuk bulan ini, jangan panggil setCountryDetail lagi
      if (lastEvaluatedDeficitMonthRef.current === monthlyKey || countryDetail.population_deficit_notification_month === monthlyKey) {
        return;
      }

      lastEvaluatedDeficitMonthRef.current = monthlyKey;

      setCountryDetail((previous) => {
        if (!previous || previous.population_deficit_notification_month === monthlyKey) {
          return previous;
        }
        const pendingNotifications = Array.isArray(previous.pending_notifications)
          ? previous.pending_notifications
          : [];
        const notification = generatePopulasiDefisitNotification(
          metrics.netDailyChange,
          population,
          date,
          countryName,
        );

        return {
          ...previous,
          population_deficit_notification_month: monthlyKey,
          pending_notifications: [notification, ...pendingNotifications],
        };
      });
    } catch (error) {
      console.error('Gagal memeriksa defisit populasi untuk notifikasi inbox:', error);
    }
  }, [currentDate, countryDetail?.jumlah_penduduk, countryDetail?.population_deficit_notification_month, metadata, selectedCountry?.country, setCountryDetail, notifications, onRemoveNotification]);

  // Ensure active research progress and level completion are processed whenever global date advances
  useEffect(() => {
    if (!currentDate || !countryDetail) return;
    try {
      const { updatedDetail, hasChanged } = processActiveResearch(countryDetail, currentDate);
      if (hasChanged && setCountryDetail) {
        setCountryDetail(updatedDetail);
      }
    } catch (e) {
      console.warn('ModalsManager: failed to process active research on date change', e);
    }
  }, [currentDate, countryDetail, setCountryDetail]);

  useEffect(() => {
    if (!currentDate || !countryDetail) return;
    const date = new Date(currentDate);
    if (Number.isNaN(date.getTime())) {
      console.warn('ModalsManager: skipped corruption processing for an invalid simulation date');
      return;
    }

    const updatedDetail = processCorruptionMonth(countryDetail, date);
    if (updatedDetail !== countryDetail) {
      setCountryDetail(updatedDetail);
      if (
        typeof updatedDetail.presidentRating === 'number' &&
        updatedDetail.presidentRating !== countryDetail.presidentRating
      ) {
        setPresidentRating?.(updatedDetail.presidentRating);
      }
    }
  }, [currentDate, countryDetail, setCountryDetail, setPresidentRating]);

  // Jika tidak ada negara yang dipilih, jangan render apapun
  if (!selectedCountry) return null;

  // Fungsi penutup modal yang seragam
  const onClose = () => setActiveMenu("Peta Taktis");

  const restrictedEconomicMenus = ["Menu:Perdagangan", "Menu:Hutang"];
  if (
    restrictedEconomicMenus.includes(activeMenu) &&
    isCountryUnderEconomicEmbargo(selectedCountry.country || "")
  ) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-8">
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="economic-embargo-access-title"
          className="w-full max-w-lg overflow-hidden rounded-2xl border border-rose-500/40 bg-[#0F2424] font-sans shadow-2xl"
        >
          <div className="border-b border-rose-500/20 bg-[#0A1A1A] px-6 py-4">
            <h2 id="economic-embargo-access-title" className="text-base font-black uppercase tracking-wide text-rose-400">
              Akses dibatasi oleh embargo ekonomi
            </h2>
          </div>
          <div className="space-y-4 px-6 py-5 text-sm leading-relaxed text-slate-300">
            <p>
              Negara {selectedCountry.country} tidak dapat mengakses Pasar Perdagangan Global atau Pinjaman & Hutang selama embargo ekonomi aktif.
            </p>
            <p className="text-xs text-[#6B8A8A]">
              Pembatasan berakhir ketika resolusi embargo tidak lagi aktif. Embargo dan sanksi yang berlaku saat ini akan hilang setelah halaman dimuat ulang.
            </p>
          </div>
          <div className="flex justify-end border-t border-[#00FFAA]/15 bg-[#0A1A1A] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#00FFAA] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#0A1A1A] transition-colors hover:bg-[#00FFAA]/80 cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render modal yang sesuai berdasarkan activeMenu
  switch (activeMenu) {
    // 1. Kepuasan
    case "Dashboard:Kepuasan":
      return (
        <StatistikKepuasanModal
          isOpen={true}
          onClose={onClose}
          setActiveMenu={setActiveMenu}
          onOpenTempatUmum={(tabId) => {
            setTempatUmumInitialTab(tabId);
            setTempatUmumDeepLink?.(tabId);
            setActiveMenu("Menu:TempatUmum");
          }}
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
          metadata={metadata}
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
          onNavigateToMenu={(category, itemKey) => {
            if (category === "produksi") {
              const findCategoryTab = () => {
                const PRODUKSI_TABS: Record<string, string[]> = {
                  kelistrikan: [
                    "pembangkit_listrik_tenaga_nuklir",
                    "pembangkit_listrik_tenaga_air",
                    "pembangkit_listrik_tenaga_surya",
                    "pembangkit_listrik_tenaga_uap",
                    "pembangkit_listrik_tenaga_gas",
                    "pembangkit_listrik_tenaga_angin",
                  ],
                  mineral: [
                    "emas", "uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam",
                    "litium", "logam_tanah_jarang", "bijih_besi"
                  ],
                  manufaktur: [
                    "pabrik_semikonduktor", "pabrik_mesin", "pabrik_besi", "semen_beton", "kayu"
                  ],
                  peternakan: [
                    "ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing"
                  ],
                  agrikultur: [
                    "padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", 
                    "kopi", "teh", "kakao", "tebu", "karet"
                  ],
                  perikanan: [
                    "udang", "mutiara", "ikan"
                  ],
                  "olahan pangan": [
                    "air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu", "beras"
                  ]
                };

                for (const [tabId, keys] of Object.entries(PRODUKSI_TABS)) {
                  if (keys.includes(itemKey)) return tabId;
                }

                for (const mKey of Object.keys(metadata)) {
                  const bMeta = metadata[mKey];
                  const dataKey = bMeta?.dataKey || mKey.replace(/^\d+_/, "");
                  if (dataKey === itemKey) {
                    if (mKey.includes("1_kelistrikan") || mKey.includes("1_sektor_listrik")) return "kelistrikan";
                    if (mKey.includes("2_sektor_mineral") || mKey.includes("2_mineral")) return "mineral";
                    if (mKey.includes("3_sektor_manufaktur") || mKey.includes("3_manufaktur")) return "manufaktur";
                    if (mKey.includes("4_sektor_peternakan") || mKey.includes("4_peternakan")) return "peternakan";
                    if (mKey.includes("5_sektor_agrikultur") || mKey.includes("5_agrikultur")) return "agrikultur";
                    if (mKey.includes("6_sektor_perikanan") || mKey.includes("6_perikanan")) return "perikanan";
                    if (mKey.includes("7_sektor_olahan_pangan") || mKey.includes("7_olahan_pangan")) return "olahan pangan";
                  }
                }
                return "kelistrikan";
              };
              const tab = findCategoryTab();
              setActiveMenu("Menu:Produksi");
              setProductionDeepLink?.({ tab, key: itemKey });
            } else if (category === "tempat_umum") {
              const findTempatUmumTab = () => {
                const groups = [
                  { id: "infrastruktur", keys: ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "stasiun_kereta", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad", "jembatan_nasional", "pembangkit_listrik"] },
                  { id: "pendidikan", keys: ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan"] },
                  { id: "kesehatan", keys: ["rumah_sakit_besar", "rumah_sakit_kecil", "rumah_sakit", "pusat_diagnostik", "puskesmas", "klinik", "harapan_hidup", "indeks_kesehatan"] },
                  { id: "penegakan_hukum", keys: ["pusat_bantuan_hukum", "pengadilan", "kejaksaan", "pos_polisi", "kantor_polisi", "armada_mobil_polisi", "akademi_polisi", "lapas", "indeks_korupsi", "indeks_keamanan"] },
                  { id: "olahraga_hiburan", keys: ["kolam_renang", "sirkuit_balap", "stadion", "stadion_internasional", "gym", "golf", "esports", "gokart", "bioskop", "teater", "taman_kota"] },
                  { id: "komersial", keys: ["mall", "pusat_perbelanjaan", "hotel", "pasar_tradisional", "pusat_grosir_tekstil"] },
                ];
                const matched = groups.find((g) => g.keys.includes(itemKey));
                return matched ? matched.id : "infrastruktur";
              };
              const tabId = findTempatUmumTab();
              setTempatUmumInitialTab(tabId);
              setTempatUmumDeepLink?.(tabId);
              setActiveMenu("Menu:TempatUmum");
            } else if (category === "hunian") {
              setHunianInitialTab(itemKey || "rumah_subsidi");
              setActiveMenu("Menu:HunianPermukiman");
            } else if (category === "pertahanan") {
              setArmadaInitialTab("infrastruktur");
              setActiveMenu("Menu:Armada");
            }
          }}
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
          inboxNotifications={notifications}
          onRemoveInboxNotification={onRemoveNotification}
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
          prefetchedAllCountries={prefetchedAllCountries || undefined}
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
          initialTab={hunianInitialTab}
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
          playerCountryName={selectedCountry.country || ""}
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
          countryDetail={countryDetail}
          setCountryDetail={update => setCountryDetail(previous => update(previous) || previous)}
          currentDate={currentDate}
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
    case "Menu:OrganisasiInternasional:organisasi_regional":
      return (
        <OrgIntlModal
          isOpen={true}
          onClose={onClose}
          selectedCountry={selectedCountry}
          countryDetail={countryDetail}
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
          setCountryDetail={setCountryDetail}
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
    case "Menu:AntiKorupsi":
      return (
        <CorruptionMenu
          isOpen={true}
          onClose={onClose}
          countryDetail={countryDetail}
          setCountryDetail={update => setCountryDetail(previous =>
            typeof update === 'function' ? update(previous) : update
          )}
          currentDate={currentDate}
          setPresidentRating={setPresidentRating}
        />
      );

    default:
      // Jika tidak ada menu yang cocok, tidak render apapun
      return null;
  }
}

// Membungkus dengan React.memo untuk menghindari render ulang yang tidak perlu
export default React.memo(ModalsManager);