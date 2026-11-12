"use client"

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import { Users, Info, ShieldAlert, BadgeDollarSign, Users2, ChevronRight, Clock } from "lucide-react";
import NotebookModalWrapper from "../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import {
  calculateSectoralSatisfaction,
  calculateGeneralSatisfaction,
  calculateLifeExpectancy,
  calculateSecurityLevel,
  calculateDailyBirths,
  calculateDailyDeaths,
  calculateHomelessCount,
  calculateDailyPopulationChange,
  type PopulationSectoral,
} from "@/app/logic/populations_logic/population_logic";

const DetailKelahiranModal = dynamic(() => import("./kelahiran_modals/DetailKelahiranModal"), { ssr: false });
const DetailKematianModal = dynamic(() => import("./kematian_modals/DetailKematianModal"), { ssr: false });
const TempatUmumModal = dynamic(() => import("../5_pembangunan/2_tempat_umum/TempatUmumModal"), { ssr: false });
const IndeksKesejahteraanModal = dynamic(() => import("./indeks_kesejahteraan_modals/IndeksKesejahteraanModal"), { ssr: false });
const TunawismaDetailModal = dynamic(() => import("./tunawisma_modals/TunawismaDetailModal"), { ssr: false });
import {
  HINDU_POPULATION_GROWTH_BONUS,
} from "@/app/page/bonus_logic/agama_bonus_logic/hindu";
import { SOCIALISM_BIRTH_RATE_BONUS } from "@/app/page/bonus_logic/ideologi_bonus_logic/sosialisme";
import { calculateTaxPopulationImpact } from "@/app/logic/economic_logic/2_tax_logic/taxPopulationImpact";
import { calculateEconomicPopulationImpact } from "@/app/logic/economic_logic/economicPopulationImpact";
import { calculatePopulationPolicyImpact } from "@/app/logic/populations_logic/populationPolicyImpact";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
import { parseActiveEspionageEffects } from "@/app/page/detail_negara/3_operasi_militer/covertEffectsLogic";

// ==============================
// Tipe data yang diharapkan dari countryDetail
// ==============================
interface CountryDetail {
  jumlah_penduduk: number;
  rata_rata_pajak?: number;
  living_cost_index?: number;
  kesejahteraan_index?: number;
  indeks_ketahanan_pangan?: number;
  surplus_listrik?: number;
  tingkat_hunian_layak?: number;
  harapan_hidup?: number;
  tingkat_keamanan?: number;
  inisiatif_aktif?: { nama: string; boost: number }[];
  jumlah_rumah_sakit?: number;
  jumlah_klinik?: number;
  program_insentif_anak?: boolean;
  angka_pernikahan?: number;
  tingkat_pendidikan?: number;
}

interface RingkasanPopulasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  selectedCountry: any;
  setActiveMenu?: (menu: string) => void;
  onOpenArmadaTab?: (tab: 'aktif' | 'infrastruktur') => void;
  onOpenTempatUmum?: (tab: string) => void;
  initialOpenKesejahteraan?: boolean;
  initialKesejahteraanTab?: "statistik" | "naikkan";
  setCountryDetail?: (detail: any) => void;
  currentDate?: Date | string;
  metadata?: Record<string, any>;
}

// ==============================
// Fungsi Penghitung Kepuasan Sektoral
// ==============================
function hitungKepuasanSektoral(detail: CountryDetail): PopulationSectoral {
  return calculateSectoralSatisfaction(detail);
}

// ==============================
// Fungsi Penghitung Metrik Demografi Dinamis
// ==============================
export function hitungDemografi(
  detail: CountryDetail,
  countryName?: string,
  metadata: Record<string, any> = {},
  currentDate?: Date | string
) {
  const populasi = detail.jumlah_penduduk || 10_000_000;

  const detailWithDefaults = {
    ...detail,
  };

  const sektoral = hitungKepuasanSektoral(detailWithDefaults);
  const kepuasanUmum = calculateGeneralSatisfaction(detailWithDefaults);
  const lifeExpectancy = calculateLifeExpectancy(detailWithDefaults, kepuasanUmum);
  const securityLevel = calculateSecurityLevel(detailWithDefaults, kepuasanUmum);

  const dailyBirths = calculateDailyBirths(
    populasi,
    kepuasanUmum, 0,
    detail.jumlah_rumah_sakit ?? 0,
    detail.jumlah_klinik ?? 0,
    detail.program_insentif_anak ?? false,
    detail.angka_pernikahan ?? 0.05,
    detail.tingkat_pendidikan ?? 0.5,
    detailWithDefaults
  );

  const metrics = calculateDailyPopulationChange(detailWithDefaults, countryName, metadata, currentDate);
  const totalDailyDelta = metrics.netDailyChange;
  const totalMonthlyGrowthPercent = ((totalDailyDelta * 30) / populasi) * 100;
  const homelessCount = calculateHomelessCount(populasi, sektoral.hunian, detailWithDefaults);

  return {
    ...metrics,
    populasi,
    totalDailyDelta,
    totalMonthlyGrowthPercent,
    sektoral,
  };
}

// ==============================
// Komponen Modal
// ==============================
export default function RingkasanPopulasiModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
  setActiveMenu,
  onOpenArmadaTab,
  onOpenTempatUmum,
  initialOpenKesejahteraan,
  initialKesejahteraanTab,
  setCountryDetail,
  currentDate,
  metadata = {},
}: RingkasanPopulasiModalProps) {

  const [isDetailBirthOpen, setIsDetailBirthOpen] = useState(false);
  const [isDetailDeathOpen, setIsDetailDeathOpen] = useState(false);
  const [isTempatUmumOpen, setIsTempatUmumOpen] = useState(false);
  const [tempatUmumActiveTab, setTempatUmumActiveTab] = useState<string>("infrastruktur");
  const [isKesejahteraanOpen, setIsKesejahteraanOpen] = useState(Boolean(initialOpenKesejahteraan));
  const [isTunawismaOpen, setIsTunawismaOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Hitung metrik demografi secara sinkron
  const countryName = selectedCountry?.country;
  const metrics = useMemo(() => {
    if (!countryDetail) return null;
    return hitungDemografi(countryDetail, countryName, metadata, currentDate);
  }, [countryDetail, countryName, metadata, currentDate]);

  if (!isOpen) return null;

  const kesejahteraanModal = isKesejahteraanOpen ? (
    <IndeksKesejahteraanModal
      isOpen={isKesejahteraanOpen}
      onClose={() => {
        if (initialOpenKesejahteraan) {
          onClose();
          return;
        }
        setIsKesejahteraanOpen(false);
      }}
      countryDetail={countryDetail}
      setCountryDetail={setCountryDetail}
      selectedCountry={selectedCountry}
      metrics={metrics}
      setActiveMenu={setActiveMenu}
      currentDate={currentDate}
      initialTab={initialKesejahteraanTab}
      onOpenTempatUmum={(tabId: string) => {
        if (onOpenTempatUmum) {
          onOpenTempatUmum(tabId);
        } else {
          setTempatUmumActiveTab(tabId);
          setIsTempatUmumOpen(true);
        }
        setIsKesejahteraanOpen(false);
      }}
      onOpenIndustriPangan={() => {
        setActiveMenu?.("Menu:IndustriPangan");
        setIsKesejahteraanOpen(false);
      }}
    />
  ) : null;

  if (isKesejahteraanOpen && initialOpenKesejahteraan) {
    return kesejahteraanModal;
  }

  if (!metrics) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="modal-responsive-shell flex flex-col overflow-hidden rounded-2xl border border-root-accent/30 bg-root-surface pointer-events-auto">
          <div className="flex shrink-0 items-center justify-between border-b border-root-accent/20 bg-root-canvas px-4 py-2.5 sm:px-6 sm:py-3">
            <h2 className={rootModalTypography.title}>Kependudukan</h2>
            <RootModalCloseButton onClick={onClose} />
          </div>
          <div className="flex flex-1 items-center justify-center" role="status" aria-live="polite">
            <div className="flex items-center gap-3 text-sm font-semibold text-root-text">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-root-accent/30 border-t-root-accent" />
              Menyiapkan ringkasan populasi...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    populasi,
    dailyBirths,
    dailyDeaths,
    totalDailyDelta,
    totalMonthlyGrowthPercent,
    homelessCount,
    populationStatus,
  } = metrics;
  const totalBirthsAndDeaths = dailyBirths + dailyDeaths;
  const birthShare = totalBirthsAndDeaths > 0 ? (dailyBirths / totalBirthsAndDeaths) * 100 : 0;
  const deathShare = totalBirthsAndDeaths > 0 ? (dailyDeaths / totalBirthsAndDeaths) * 100 : 0;
  const taxImpact = calculateTaxPopulationImpact(countryDetail);
  const economicImpact = calculateEconomicPopulationImpact(countryDetail);
  const populationPolicyImpact = calculatePopulationPolicyImpact(
    taxImpact.monthlyModifierPercent,
    economicImpact.totalMonthlyModifierPercent,
  );
  const totalPolicyMonthlyModifier =
    populationPolicyImpact.totalMonthlyModifierPercent;
  const estimatedPolicyDailyChange = Math.round(
    populasi * (totalPolicyMonthlyModifier / 100) / 30,
  );
  const estimatedPolicyMonthlyChange = Math.round(
    populasi * totalPolicyMonthlyModifier / 100,
  );
  const policyImpactColor = rootModalTypography.value;
  const formatModifier = (value: number) =>
    `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  const formatPeople = (value: number) =>
    `${value > 0 ? "+" : ""}${value.toLocaleString("id-ID")} jiwa`;
    
  const activePandemic = Array.isArray(countryDetail?.active_outbreaks)
    ? countryDetail.active_outbreaks.find((outbreak: any) =>
        !outbreak.isHandled && String(outbreak.category || "").toLowerCase().includes("pandemi")
      )
    : null;
  const activeEspionageEffect = parseActiveEspionageEffects(countryDetail?.active_disaster_effects)
    .sort((first, second) => second.remainingDays - first.remainingDays)[0];
  const pandemicCost = Math.max(0, Number(activePandemic?.korban) || 0);
  const pandemicDeaths = Math.max(0, Number(activePandemic?.perkiraanKematian) || 0);
  const canTreatPandemic = Number(countryDetail?.anggaran || 0) >= pandemicCost;
  
  // Perhitungan sisa hari pandemi
  const getRemainingDays = () => {
    if (!activePandemic || !activePandemic.startDate || !activePandemic.durationDays) return null;
    
    let current: Date;
    if (!currentDate) {
      current = new Date();
    } else if (typeof currentDate === 'string') {
      current = new Date(currentDate);
    } else {
      current = currentDate;
    }
    
    const start = new Date(activePandemic.startDate);
    
    if (isNaN(start.getTime()) || isNaN(current.getTime())) return null;

    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const currentMidnight = new Date(current.getFullYear(), current.getMonth(), current.getDate());

    const diffTime = currentMidnight.getTime() - startMidnight.getTime();
    const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const duration = Number(activePandemic.durationDays) || 0;
    const remaining = duration - elapsedDays;
    
    return Math.max(0, remaining);
  };

  const remainingPandemicDays = getRemainingDays();

  const treatPandemic = () => {
    if (!activePandemic || !canTreatPandemic || !setCountryDetail) return;
    setCountryDetail((prev: any) => ({
      ...prev,
      anggaran: Math.max(0, Number(prev?.anggaran || 0) - pandemicCost),
      jumlah_penduduk: Math.max(0, Number(prev?.jumlah_penduduk || 0) + pandemicDeaths),
      active_outbreaks: Array.isArray(prev?.active_outbreaks)
        ? prev.active_outbreaks.map((outbreak: any) =>
            outbreak.id === activePandemic.id ? { ...outbreak, isHandled: true } : outbreak
          )
        : prev?.active_outbreaks,
    }));
  };

  const activeCountryName = countryName || "Indonesia";
  const populationPolicyImpactContent = (
    <section
      aria-label="Perhitungan dampak kebijakan ekonomi terhadap populasi"
      className={`${rootBorderRadius.card} border border-root-accent/30 bg-root-surface p-3.5 lg:p-4.5 2xl:p-6`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-root-accent/15 pb-3">
        <h3 className={rootModalTypography.sectionTitle}>
          Perhitungan Dampak Kebijakan ke Populasi
        </h3>
        <div className="text-right">
          <p className={`${policyImpactColor} text-lg lg:text-xl`}>
            {formatModifier(totalPolicyMonthlyModifier)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { label: "Pajak", detail: `Beban ${taxImpact.burden.toFixed(1)}%`, modifier: populationPolicyImpact.taxMonthlyModifierPercent },
          { label: "Harga pokok", detail: `Kepuasan ${economicImpact.priceScore.toFixed(0)}/100`, modifier: economicImpact.priceMonthlyModifierPercent * populationPolicyImpact.scaleFactor },
          { label: "Sistem ekonomi", detail: `Skor ${economicImpact.policyScore.toFixed(0)}/100`, modifier: economicImpact.systemMonthlyModifierPercent * populationPolicyImpact.scaleFactor },
          { label: "Subsidi", detail: `Dukungan ${economicImpact.subsidyScore.toFixed(0)}/100`, modifier: economicImpact.subsidyMonthlyModifierPercent * populationPolicyImpact.scaleFactor },
        ].map((item) => (
          <div
            key={item.label}
            className={`${rootBorderRadius.card} border border-root-accent/15 bg-root-canvas p-2.5`}
          >
            <p className={rootModalTypography.label}>{item.label}</p>
            <p className={`${rootModalTypography.value} mt-1 text-[10px]`}>{item.detail}</p>
            <p className={`${rootModalTypography.value} mt-1 text-xs lg:text-sm`}>
              {formatModifier(item.modifier)} / bln
            </p>
          </div>
        ))}
      </div>

      {populationPolicyImpact.wasCapped && (
        <p className="mt-2 text-[9px] font-semibold text-root-body">
          Modifier gabungan dibatasi maksimal ±0,75% per bulan.
        </p>
      )}

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className={`${rootBorderRadius.card} border border-root-accent/15 bg-root-canvas p-2.5`}>
          <p className={rootModalTypography.label}>Estimasi dampak harian</p>
          <p className={`${policyImpactColor} mt-1 text-sm`}>
            {formatPeople(estimatedPolicyDailyChange)}
          </p>
        </div>
        <div className={`${rootBorderRadius.card} border border-root-accent/15 bg-root-canvas p-2.5`}>
          <p className={rootModalTypography.label}>Estimasi dampak bulanan</p>
          <p className={`${policyImpactColor} mt-1 text-sm`}>
            {formatPeople(estimatedPolicyMonthlyChange)}
          </p>
        </div>
      </div>
    </section>
  );

  return (
    <>
      {!isInfoOpen && <NotebookModalWrapper onClose={onClose} isHidden={isKesejahteraanOpen}>
        <div className="flex flex-col h-full overflow-hidden bg-root-canvas rounded-xl border border-root-accent/20 relative">
        {/* ============ HEADER ============ */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
              <Users2 className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
            </div>
            <div>
              <h2 className={rootModalTypography.title}>Kependudukan</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsInfoOpen(true)} title="Informasi kependudukan" aria-label="Informasi kependudukan" className="flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-root-accent/50 bg-root-canvas p-1 text-root-accent transition-all hover:bg-root-accent hover:text-root-canvas">
              <Info className="h-3.5 w-3.5" />
            </button>
            <RootModalCloseButton onClick={onClose} />
          </div>
        </div>

        {/* ============ SUMMARY CARDS ============ */}
        <div className="px-3 sm:px-5 lg:px-6 2xl:px-8 py-2 sm:py-2.5 2xl:py-3 bg-root-canvas border-b border-root-accent/20 relative z-10 shrink-0">
          <div className="population-summary-grid grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-2.5 2xl:gap-4">
            {/* Total Populasi */}
            <div className={`population-summary-card bg-root-surface border border-root-accent/20 p-2 lg:p-2.5 2xl:p-4 ${rootBorderRadius.card} flex items-center gap-2 lg:gap-2.5 2xl:gap-3.5 transition-all hover:border-root-accent/40`}>
              <div className="p-1.5 lg:p-2 2xl:p-2.5 bg-root-canvas border border-root-accent/30 rounded-md lg:rounded-lg 2xl:rounded-xl shrink-0">
                <Users className="h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 text-root-accent" />
              </div>
              <div className="population-summary-text min-w-0 flex-1">
                <p className={`${rootModalTypography.label} whitespace-nowrap`}>Total Populasi</p>
                <p className={`population-summary-value ${rootModalTypography.value} min-w-0 leading-tight`}>
                  <span className="population-summary-number">{populasi.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
                  <span className="shrink-0 whitespace-nowrap text-[7px] text-root-muted lg:text-[8px] 2xl:text-[9px]">JIWA</span>
                </p>
              </div>
            </div>

            {/* Tunawisma */}
            <div
              className={`population-summary-card group bg-root-surface border border-root-accent/20 p-2 lg:p-2.5 2xl:p-4 ${rootBorderRadius.card} flex items-center justify-between gap-1.5 lg:gap-2 2xl:gap-3 transition-all cursor-pointer hover:border-rose-400 hover:bg-rose-500/10 active:scale-[0.98]`}
              onClick={() => setIsTunawismaOpen(true)}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-2.5 2xl:gap-3.5">
                <div className="p-1.5 lg:p-2 2xl:p-2.5 bg-root-canvas border border-rose-500/30 rounded-md lg:rounded-lg 2xl:rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 text-rose-400" />
                </div>
                <div className="population-summary-text min-w-0 flex-1">
                  <p className={`${rootModalTypography.label} whitespace-nowrap`}>Tunawisma</p>
                  <p className={`population-summary-value ${rootModalTypography.value} min-w-0 leading-tight`}>
                    <span className="population-summary-number">{homelessCount.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
                    <span className="shrink-0 whitespace-nowrap text-[7px] text-root-muted lg:text-[8px] 2xl:text-[9px]">JIWA</span>
                  </p>
                </div>
              </div>
              <ChevronRight className="population-summary-chevron h-3.5 w-3.5 lg:h-4 lg:w-4 text-root-subtle group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-0.5" />
            </div>

            {/* Kesejahteraan */}
            <div
              className={`population-summary-card group bg-root-surface border border-root-accent/20 p-2 lg:p-2.5 2xl:p-4 ${rootBorderRadius.card} flex items-center justify-between gap-1.5 lg:gap-2 2xl:gap-3 transition-all cursor-pointer hover:border-root-accent hover:bg-root-accent/10 active:scale-[0.98]`}
              onClick={() => {
                setIsKesejahteraanOpen(true);
              }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-2.5 2xl:gap-3.5">
                <div className="p-1.5 lg:p-2 2xl:p-2.5 bg-root-canvas border border-root-accent/30 rounded-md lg:rounded-lg 2xl:rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                  <BadgeDollarSign className="h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 text-root-accent" />
                </div>
                <div className="population-summary-text min-w-0 flex-1">
                  <p className={`${rootModalTypography.label} whitespace-nowrap`}>Kesejahteraan</p>
                  <p className={`population-summary-value ${rootModalTypography.value} min-w-0 leading-tight`}>
                    <span className="population-summary-number">{countryDetail?.kesejahteraan !== undefined ? Math.round(Number(countryDetail.kesejahteraan)) : 50}</span>
                    <span className="whitespace-nowrap text-[7px] text-root-muted lg:text-[8px] 2xl:text-[9px]">INDX</span>
                  </p>
                </div>
              </div>
              <ChevronRight className="population-summary-chevron h-3.5 w-3.5 lg:h-4 lg:w-4 text-root-subtle group-hover:text-root-accent group-hover:translate-x-0.5 transition-all shrink-0 ml-0.5" />
            </div>
          </div>
        </div>

        {/* ============ CONTENT AREA dengan Modern Tailwind Scrollbar ============ */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-4.5 2xl:p-8 bg-root-canvas/80 relative z-10
          [&::-webkit-scrollbar]:w-2 
          [&::-webkit-scrollbar-track]:bg-root-canvas
          [&::-webkit-scrollbar-track]:rounded-full 
          [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-root-accent/20
          [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-root-accent [&::-webkit-scrollbar-thumb]:to-[#00B37A]
          [&::-webkit-scrollbar-thumb]:rounded-full 
          [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-root-canvas
          hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-root-accent
          [&::-webkit-scrollbar-button]:hidden
        ">
          <div className="space-y-3.5 lg:space-y-4.5 2xl:space-y-6 animate-in fade-in duration-500">

            {/* Informasi Demografi */}
            <div className={`bg-root-surface border border-root-accent/20 p-3.5 lg:p-4.5 2xl:p-6 ${rootBorderRadius.card} space-y-2.5 lg:space-y-3 2xl:space-y-4`}>
              <h3 className={`${rootModalTypography.sectionTitle} flex items-center gap-2`}>
                <Info className="h-4 w-4 lg:h-4.5 lg:w-4.5 2xl:h-5 2xl:w-5 text-root-accent" />
                Informasi Demografi
              </h3>
              <div className={`${rootModalTypography.body} space-y-2.5 font-sans lg:space-y-3 2xl:space-y-4`}>
                {/* 3 Card Sejajar: Kelahiran, Kematian, Pertumbuhan */}
                <div className="pt-2.5 lg:pt-3 2xl:pt-4 border-t border-root-accent/20 grid grid-cols-1 sm:grid-cols-3 gap-2.5 lg:gap-3 2xl:gap-4">
                  <div
                    className={`group cursor-pointer ${rootBorderRadius.card} p-2.5 lg:p-3 2xl:p-4 border border-root-accent/30 bg-root-canvas hover:bg-root-accent/10 hover:border-root-accent active:scale-[0.98] transition-all duration-200 flex items-center justify-between`}
                    onClick={() => setIsDetailBirthOpen(true)}
                  >
                    <div className="flex flex-col items-start">
                      <p className={rootModalTypography.label}>Angka Kelahiran Harian</p>
                      <p className="mt-0.5 text-base font-semibold text-emerald-400 lg:mt-1 lg:text-xl 2xl:text-2xl">+{dailyBirths.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 lg:h-4.5 lg:w-4.5 2xl:h-5 2xl:w-5 text-root-accent group-hover:translate-x-1 transition-all shrink-0 ml-1.5" />
                  </div>
                  <div
                    className={`group cursor-pointer ${rootBorderRadius.card} p-2.5 lg:p-3 2xl:p-4 border border-rose-500/30 bg-root-canvas hover:bg-rose-500/10 hover:border-rose-400 active:scale-[0.98] transition-all duration-200 flex items-center justify-between`}
                    onClick={() => setIsDetailDeathOpen(true)}
                  >
                    <div className="flex flex-col items-start">
                      <p className={rootModalTypography.label}>Angka Kematian Harian</p>
                      <p className="mt-0.5 text-base font-semibold text-rose-400 lg:mt-1 lg:text-xl 2xl:text-2xl">-{dailyDeaths.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 lg:h-4.5 lg:w-4.5 2xl:h-5 2xl:w-5 text-rose-400 group-hover:translate-x-1 transition-all shrink-0 ml-1.5" />
                  </div>
                  <div
                    className={`${rootBorderRadius.card} p-2.5 lg:p-3 2xl:p-4 border ${totalMonthlyGrowthPercent >= 0 ? 'border-root-accent/30' : 'border-rose-500/30'} bg-root-canvas flex items-center justify-between`}
                  >
                    <div className="flex flex-col items-start">
                      <p className={rootModalTypography.label}>Pertumbuhan Populasi</p>
                      <p className={`${rootModalTypography.value} mt-0.5 text-base lg:mt-1 lg:text-xl 2xl:text-2xl`}>
                        {totalMonthlyGrowthPercent >= 0 ? '+' : ''}{totalMonthlyGrowthPercent.toFixed(2)}%<span className="ml-1 text-[9px] font-medium text-root-muted">/ bulan</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Perbandingan Kelahiran vs Kematian */}
                <div className="mt-3 space-y-2">
                  <div className={`${rootModalTypography.label} flex items-center justify-between gap-3`}>
                    <span>Perbandingan kelahiran &amp; kematian</span>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-emerald-400">Kelahiran {birthShare.toFixed(1)}%</span>
                      <span className="text-rose-400">Kematian {deathShare.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div
                    role="img"
                    aria-label={`Perbandingan harian: kelahiran ${birthShare.toFixed(1)}%, kematian ${deathShare.toFixed(1)}%`}
                    className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#152626] border border-root-accent/10"
                  >
                    <div
                      className="h-full bg-emerald-500 transition-[width] duration-500"
                      style={{ width: `${birthShare}%` }}
                    />
                    <div
                      className="h-full bg-rose-500 transition-[width] duration-500"
                      style={{ width: `${deathShare}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pandemic Section */}
            {activeEspionageEffect && (
              <section className={`${rootBorderRadius.card} border border-purple-500/50 bg-purple-500/10 p-3.5 lg:p-4.5`} aria-label="Efek spionase aktif">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border border-purple-400/40 bg-root-canvas p-2 text-purple-300">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={rootModalTypography.label}>Efek Spionase Aktif</p>
                      <span className="flex items-center gap-1 rounded border border-purple-500/30 bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-100">
                        <Clock className="w-2.5 h-2.5" />
                        Sisa {activeEspionageEffect.remainingDays} hari game
                      </span>
                    </div>
                    <h3 className={`${rootModalTypography.value} mt-0.5 text-sm`}>Kekuatan & HP militer ×{activeEspionageEffect.multiplier.toFixed(2)}</h3>
                    <p className="mt-1 text-[11px] text-root-muted">Jumlah pasukan dan alutsista tidak berubah. Efek pulih otomatis saat durasi habis.</p>
                  </div>
                </div>
              </section>
            )}

            {activePandemic && (
              <section className={`${rootBorderRadius.card} border border-rose-500/50 bg-rose-500/10 p-3.5 lg:p-4.5`} aria-label="Pandemi aktif">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg border border-rose-400/40 bg-root-canvas p-2 text-rose-400">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={rootModalTypography.label}>Pandemi Aktif</p>
                        {remainingPandemicDays !== null && (
                          <span className="flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-root-text">
                            <Clock className="w-2.5 h-2.5" />
                            Sisa {remainingPandemicDays} Hari
                          </span>
                        )}
                      </div>
                      <h3 className={`${rootModalTypography.value} mt-0.5 text-sm`}>{activePandemic.eventName || "Pandemi global"}</h3>
                      <p className="mt-1 text-[11px] text-root-muted">Tangani sekarang: pulihkan {pandemicDeaths.toLocaleString("id-ID")} jiwa.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!canTreatPandemic || !setCountryDetail}
                    onClick={treatPandemic}
                    className="rounded-lg border border-rose-400 bg-rose-500/20 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-root-text transition-all hover:bg-rose-500 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:border-root-subtle/40 disabled:bg-transparent disabled:text-root-muted"
                  >
                    Tangani · {pandemicCost.toLocaleString("id-ID")} NEO
                  </button>
                </div>
                {!canTreatPandemic && <p className="mt-2 text-[10px] font-bold text-root-text">Kas negara tidak mencukupi.</p>}
              </section>
            )}

          </div>
        </div>
      </div>
    </NotebookModalWrapper>}

    <MenuInfoModal
      isOpen={isInfoOpen}
      onClose={() => setIsInfoOpen(false)}
      title="Informasi Kependudukan"
    >
      {populationPolicyImpactContent}
    </MenuInfoModal>

      {/* ============ RENDER MODAL DETAIL ============ */}
      {isDetailBirthOpen && <DetailKelahiranModal
        isOpen={isDetailBirthOpen}
        onClose={() => setIsDetailBirthOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
        dailyBirths={dailyBirths}
        dailyDeaths={dailyDeaths}
        netDailyChange={totalDailyDelta}
        onOpenTempatUmum={(tabId: string) => {
          setTempatUmumActiveTab(tabId);
          setIsTempatUmumOpen(true);
          setIsDetailBirthOpen(false);
        }}
      />}

      {isDetailDeathOpen && <DetailKematianModal
        isOpen={isDetailDeathOpen}
        onClose={() => setIsDetailDeathOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
        dailyDeaths={dailyDeaths}
        homelessCount={homelessCount}
        onOpenTempatUmum={(tabId: string) => {
          setTempatUmumActiveTab(tabId);
          setIsTempatUmumOpen(true);
          setIsDetailDeathOpen(false);
        }}
        onOpenIndustriPangan={() => {
          setActiveMenu?.("Menu:IndustriPangan");
        }}
        onOpenArmada={(tabId) => {
          if (tabId === 'aktif' || tabId === 'infrastruktur') {
            onOpenArmadaTab?.(tabId);
          } else {
            onOpenArmadaTab?.('aktif');
          }
        }}
      />}

      {isTempatUmumOpen && <TempatUmumModal
        isOpen={true}
        onClose={() => setIsTempatUmumOpen(false)}
        countryDetail={countryDetail}
        setCountryDetail={(updated) => {
          // Update countryDetail melalui parent jika diperlukan
        }}
        initialTab={tempatUmumActiveTab}
      />}

      {kesejahteraanModal}

      {isTunawismaOpen && <TunawismaDetailModal
        isOpen={isTunawismaOpen}
        onClose={() => setIsTunawismaOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
        homelessCount={homelessCount}
      />}
    </>
  );
}