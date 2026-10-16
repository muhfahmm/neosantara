"use client"

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { X, Users, Info, TrendingUp, ShieldAlert, BadgeDollarSign, Users2, ChevronRight } from "lucide-react";
import NotebookModalWrapper from "../NotebookModalWrapper";
import {
  calculateSectoralSatisfaction,
  calculateGeneralSatisfaction,
  calculateLifeExpectancy,
  calculateSecurityLevel,
  calculateDailyBirths,
  calculateDailyDeaths,
  calculateHomelessCount,
  calculateDailyPopulationChange,
  getPopulationProjection,
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

// ==============================
// Tipe data yang diharapkan dari countryDetail
// ==============================
interface CountryDetail {
  jumlah_penduduk: number;
  rata_rata_pajak?: number;
  living_cost_index?: number;
  kesejahteraan_index?: number;  // Indeks kesejahteraan dari database
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
// Fungsi Penghitung Metrik Demografi Dinamis (diperbarui)
// ==============================
function hitungDemografi(
  detail: CountryDetail,
  countryName?: string,
  metadata: Record<string, any> = {},
  currentDate?: Date | string
) {
  const populasi = detail.jumlah_penduduk || 10_000_000;

  // ðŸ”¥ Ambil livingCostIndex dan kesejahteraanIndex dari data statis jika tidak ada di detail
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
    detailWithDefaults  // â† sama persis dengan calculateDailyPopulationChange agar konsisten dengan Navbar
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
  const [metricsResult, setMetricsResult] = useState<{
    countryDetail: CountryDetail;
    countryName?: string;
    metadata: Record<string, any>;
    currentDate?: Date | string;
    value: ReturnType<typeof hitungDemografi>;
  } | null>(null);
  const [projectionResult, setProjectionResult] = useState<{
    metrics: ReturnType<typeof hitungDemografi>;
    value: number;
  } | null>(null);

  // Buka otomatis modal Kesejahteraan jika dipanggil via Deep Link Kesejahteraan Navbar
  useEffect(() => {
    if (isOpen && initialOpenKesejahteraan) {
      setIsKesejahteraanOpen(true);
    }
  }, [isOpen, initialOpenKesejahteraan]);

  useEffect(() => {
    if (!isOpen || !countryDetail || (initialOpenKesejahteraan && isKesejahteraanOpen)) return;

    const countryName = selectedCountry?.country;
    const timeoutId = window.setTimeout(() => {
      setMetricsResult({
        countryDetail,
        countryName,
        metadata,
        currentDate,
        value: hitungDemografi(countryDetail, countryName, metadata, currentDate),
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, countryDetail, selectedCountry?.country, metadata, currentDate, initialOpenKesejahteraan, isKesejahteraanOpen]);

  const metrics =
    metricsResult && metricsResult.countryName === selectedCountry?.country
      ? metricsResult.value
      : null;

  useEffect(() => {
    if (!isOpen || !metrics || !countryDetail) return;

    const timeoutId = window.setTimeout(() => {
      const projection = getPopulationProjection(countryDetail, 30, metadata, currentDate);
      setProjectionResult({
        metrics,
        value: projection.at(-1) ?? metrics.populasi,
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, metrics, countryDetail, metadata, currentDate]);

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
        <div className="flex h-full max-h-[calc(100vh-125px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#00FFAA]/30 bg-[#0F2424] pointer-events-auto lg:max-h-[calc(100vh-145px)] lg:max-w-[920px]">
          <div className="flex shrink-0 items-center justify-between border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-2.5 sm:px-6 sm:py-3">
            <h2 className="text-base font-bold uppercase tracking-tight text-[#00FFAA] sm:text-xl">Kependudukan</h2>
            <button onClick={onClose} className="flex items-center gap-1 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] p-1.5 text-xs font-bold uppercase text-[#6B8A8A] transition-all hover:border-[#00FFAA] hover:text-[#00FFAA] lg:p-2">
              <span className="pl-1 text-[10px] font-semibold tracking-widest lg:text-xs">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center" role="status" aria-live="polite">
            <div className="flex items-center gap-3 text-sm font-semibold text-[#E0E0E0]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#00FFAA]/30 border-t-[#00FFAA]" />
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
  const projectedPopulation30Days =
    projectionResult?.metrics === metrics ? projectionResult.value : null;

  // Peta warna status (dipakai untuk label status demografi)
  const factorColors: Record<string, { text: string; bar: string }> = {
    emerald: { text: 'text-emerald-300', bar: 'bg-emerald-400' },
    green: { text: 'text-green-300', bar: 'bg-green-400' },
    yellow: { text: 'text-yellow-300', bar: 'bg-yellow-400' },
    amber: { text: 'text-amber-300', bar: 'bg-amber-400' },
    orange: { text: 'text-orange-300', bar: 'bg-orange-400' },
    red: { text: 'text-red-300', bar: 'bg-red-400' },
    rose: { text: 'text-rose-300', bar: 'bg-rose-400' },
  };

  const countryName = selectedCountry?.country || "Indonesia";

  return (
    <>
      <NotebookModalWrapper onClose={onClose}>
        <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
              <Users2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Kependudukan</h2>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="px-3 sm:px-5 lg:px-6 2xl:px-8 py-2 sm:py-2.5 2xl:py-3 bg-[#0A1A1A] border-b border-[#00FFAA]/20 relative z-10 shrink-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-2.5 2xl:gap-4">
            <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-2 lg:p-2.5 2xl:p-4 rounded-lg 2xl:rounded-xl flex items-center gap-2 lg:gap-2.5 2xl:gap-3.5 transition-all">
              <div className="p-1.5 lg:p-2 2xl:p-2.5 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-md lg:rounded-lg 2xl:rounded-xl shrink-0">
                <Users className="h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 text-[#00FFAA]" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] lg:text-[9px] 2xl:text-[10px] text-[#6B8A8A] font-black uppercase tracking-wider whitespace-nowrap">Total Populasi</p>
                <p className="text-[11px] lg:text-xs 2xl:text-base font-black text-[#E0E0E0] leading-tight whitespace-nowrap">{populasi.toLocaleString('id-ID', { maximumFractionDigits: 2 })} <span className="text-[7px] lg:text-[8px] 2xl:text-[9px] text-[#6B8A8A]">JIWA</span></p>
              </div>
            </div>

            <div
              className="group bg-[#0F2424] border border-[#00FFAA]/20 p-2 lg:p-2.5 2xl:p-4 rounded-lg 2xl:rounded-xl flex items-center justify-between gap-1.5 lg:gap-2 2xl:gap-3 transition-all cursor-pointer hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 active:scale-[0.98]"
              onClick={() => setIsDetailBirthOpen(true)}
            >
              <div className="flex items-center gap-2 lg:gap-2.5 2xl:gap-3.5 min-w-0">
                <div className="p-1.5 lg:p-2 2xl:p-2.5 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-md lg:rounded-lg 2xl:rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <TrendingUp className="h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 text-[#00FFAA]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] lg:text-[9px] 2xl:text-[10px] text-[#6B8A8A] font-black uppercase tracking-wider whitespace-nowrap">Laju Pertumbuhan</p>
                  <p className={`text-[11px] lg:text-xs 2xl:text-base font-black leading-tight whitespace-nowrap ${totalDailyDelta >= 0 ? 'text-[#00FFAA]' : 'text-rose-400'}`}>
                    {totalDailyDelta >= 0 ? '+' : ''}{totalDailyDelta.toLocaleString('id-ID', { maximumFractionDigits: 2 })} <span className="text-[7px] lg:text-[8px] 2xl:text-[9px] text-[#6B8A8A]">/hr</span>
                  </p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#6B8A8A] group-hover:text-[#00FFAA] group-hover:translate-x-0.5 transition-all shrink-0 ml-0.5" />
            </div>

            <div
              className="group bg-[#0F2424] border border-[#00FFAA]/20 p-2 lg:p-2.5 2xl:p-4 rounded-lg 2xl:rounded-xl flex items-center justify-between gap-1.5 lg:gap-2 2xl:gap-3 transition-all cursor-pointer hover:border-rose-400 hover:bg-rose-500/10 active:scale-[0.98]"
              onClick={() => setIsTunawismaOpen(true)}
            >
              <div className="flex items-center gap-2 lg:gap-2.5 2xl:gap-3.5 min-w-0">
                <div className="p-1.5 lg:p-2 2xl:p-2.5 bg-[#0A1A1A] border border-rose-500/30 rounded-md lg:rounded-lg 2xl:rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 text-rose-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] lg:text-[9px] 2xl:text-[10px] text-[#6B8A8A] font-black uppercase tracking-wider whitespace-nowrap">Tunawisma</p>
                  <p className="text-[11px] lg:text-xs 2xl:text-base font-black text-[#E0E0E0] leading-tight whitespace-nowrap">{homelessCount.toLocaleString('id-ID', { maximumFractionDigits: 2 })} <span className="text-[7px] lg:text-[8px] 2xl:text-[9px] text-[#6B8A8A]">JIWA</span></p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#6B8A8A] group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-0.5" />
            </div>

            <div
              className="group bg-[#0F2424] border border-[#00FFAA]/20 p-2 lg:p-2.5 2xl:p-4 rounded-lg 2xl:rounded-xl flex items-center justify-between gap-1.5 lg:gap-2 2xl:gap-3 transition-all cursor-pointer hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 active:scale-[0.98]"
              onClick={() => setIsKesejahteraanOpen(true)}
            >
              <div className="flex items-center gap-2 lg:gap-2.5 2xl:gap-3.5 min-w-0">
                <div className="p-1.5 lg:p-2 2xl:p-2.5 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-md lg:rounded-lg 2xl:rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <BadgeDollarSign className="h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5 text-[#00FFAA]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] lg:text-[9px] 2xl:text-[10px] text-[#6B8A8A] font-black uppercase tracking-wider whitespace-nowrap">Kesejahteraan</p>
                  <p className="text-[11px] lg:text-xs 2xl:text-base font-black text-[#E0E0E0] leading-tight whitespace-nowrap">
                    {countryDetail?.kesejahteraan !== undefined ? Math.round(Number(countryDetail.kesejahteraan)) : 50}{" "}
                    <span className="text-[7px] lg:text-[8px] 2xl:text-[9px] text-[#6B8A8A]">INDX</span>
                  </p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#6B8A8A] group-hover:text-[#00FFAA] group-hover:translate-x-0.5 transition-all shrink-0 ml-0.5" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-4.5 2xl:p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <div className="space-y-3.5 lg:space-y-4.5 2xl:space-y-6 animate-in fade-in duration-500">

            {/* Informasi Demografi */}
            <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-3.5 lg:p-4.5 2xl:p-6 rounded-xl 2xl:rounded-2xl space-y-2.5 lg:space-y-3 2xl:space-y-4">
              <h3 className="text-xs lg:text-sm 2xl:text-md font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-2">
                <Info className="h-4 w-4 lg:h-4.5 lg:w-4.5 2xl:h-5 2xl:w-5 text-[#00FFAA]" />
                Informasi Demografi
              </h3>
              <div className="space-y-2.5 lg:space-y-3 2xl:space-y-4 font-sans text-xs lg:text-xs 2xl:text-sm text-[#E0E0E0] font-medium leading-relaxed">
                {/* TOMBOL KELAHIRAN, KEMATIAN, & PERTUMBUHAN (3 CARD SEJAJAR) */}
                <div className="pt-2.5 lg:pt-3 2xl:pt-4 border-t border-[#00FFAA]/20 grid grid-cols-1 sm:grid-cols-3 gap-2.5 lg:gap-3 2xl:gap-4">
                  <div
                    className="group cursor-pointer rounded-lg lg:rounded-xl p-2.5 lg:p-3 2xl:p-4 border border-[#00FFAA]/30 bg-[#0A1A1A] hover:bg-[#00FFAA]/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-between"
                    onClick={() => setIsDetailBirthOpen(true)}
                  >
                    <div className="flex flex-col items-start">
                      <p className="text-[8px] lg:text-[9px] 2xl:text-[10px] text-[#6B8A8A] font-black uppercase">Angka Kelahiran Harian</p>
                      <p className="text-base lg:text-xl 2xl:text-2xl font-black text-[#00FFAA] mt-0.5 lg:mt-1">+{dailyBirths.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 lg:h-4.5 lg:w-4.5 2xl:h-5 2xl:w-5 text-[#00FFAA] group-hover:translate-x-1 transition-all shrink-0 ml-1.5" />
                  </div>
                  <div
                    className="group cursor-pointer rounded-lg lg:rounded-xl p-2.5 lg:p-3 2xl:p-4 border border-rose-500/30 bg-[#0A1A1A] hover:bg-rose-500/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-between"
                    onClick={() => setIsDetailDeathOpen(true)}
                  >
                    <div className="flex flex-col items-start">
                      <p className="text-[8px] lg:text-[9px] 2xl:text-[10px] text-[#6B8A8A] font-black uppercase">Angka Kematian Harian</p>
                      <p className="text-base lg:text-xl 2xl:text-2xl font-black text-rose-400 mt-0.5 lg:mt-1">-{dailyDeaths.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 lg:h-4.5 lg:w-4.5 2xl:h-5 2xl:w-5 text-rose-400 group-hover:translate-x-1 transition-all shrink-0 ml-1.5" />
                  </div>
                  <div
                    className={`rounded-lg lg:rounded-xl p-2.5 lg:p-3 2xl:p-4 border ${totalMonthlyGrowthPercent >= 0 ? 'border-[#00FFAA]/30' : 'border-rose-500/30'} bg-[#0A1A1A] flex items-center justify-between`}
                  >
                    <div className="flex flex-col items-start">
                      <p className="text-[8px] lg:text-[9px] 2xl:text-[10px] text-[#6B8A8A] font-black uppercase">Pertumbuhan Populasi</p>
                      <p className={`text-base lg:text-xl 2xl:text-2xl font-black mt-0.5 lg:mt-1 ${totalMonthlyGrowthPercent >= 0 ? 'text-[#00FFAA]' : 'text-rose-400'}`}>
                        {totalMonthlyGrowthPercent >= 0 ? '+' : ''}{totalMonthlyGrowthPercent.toFixed(2)}%<span className="text-[9px] text-[#6B8A8A] font-medium ml-1">/ bulan</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </NotebookModalWrapper>

      {/* Render modal detail */}
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
          // Atau gunakan hook context jika tersedia
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