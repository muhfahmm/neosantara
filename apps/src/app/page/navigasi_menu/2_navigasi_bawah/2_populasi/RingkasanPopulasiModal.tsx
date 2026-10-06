"use client"

import { useState, useMemo, useEffect } from "react";
import { X, Users, Info, TrendingUp, ShieldAlert, BadgeDollarSign, Users2, ChevronRight } from "lucide-react";
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
  getPanganMultiplier,
  getHunianMultiplier,
  getOverpopMultiplier,
  getKesehatanMultiplier,
  type PopulationDailyMetrics,
  type PopulationSectoral,
} from "@/app/logic/populations_logic/population_logic"; 

import DetailKelahiranModal from "./kelahiran_modals/DetailKelahiranModal";
import DetailKematianModal from "./kematian_modals/DetailKematianModal";
import TempatUmumModal from "../5_pembangunan/2_tempat_umum/TempatUmumModal";
import IndeksKesejahteraanModal from "./indeks_kesejahteraan_modals/IndeksKesejahteraanModal";
import TunawismaDetailModal from "./tunawisma_modals/TunawismaDetailModal";
import {
  HINDU_POPULATION_GROWTH_BONUS,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/bonus_logic/agama_bonus_logic/hindu";

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
  const projectedPopulation30Days = getPopulationProjection(detailWithDefaults, 30, metadata, currentDate).at(-1) ?? populasi;

  const homelessCount = calculateHomelessCount(populasi, sektoral.hunian, detailWithDefaults);

  return {
    ...metrics,
    populasi,
    totalDailyDelta,
    totalMonthlyGrowthPercent,
    sektoral,
    projectedPopulation30Days,
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
  const [isKesejahteraanOpen, setIsKesejahteraanOpen] = useState(false);
  const [isTunawismaOpen, setIsTunawismaOpen] = useState(false);

  // Buka otomatis modal Kesejahteraan jika dipanggil via Deep Link Kesejahteraan Navbar
  useEffect(() => {
    if (isOpen && initialOpenKesejahteraan) {
      setIsKesejahteraanOpen(true);
    }
  }, [isOpen, initialOpenKesejahteraan]);

  const metrics = useMemo(() => {
    if (!countryDetail) return null;
    // ðŸ”¥ Kirim countryName ke fungsi hitungDemografi
    return hitungDemografi(countryDetail, selectedCountry?.country, metadata, currentDate);
  }, [countryDetail, selectedCountry, metadata, currentDate]);

  if (!isOpen || !metrics) return null;

  const {
    populasi,
    dailyBirths,
    dailyDeaths,
    totalDailyDelta,
    totalMonthlyGrowthPercent,
    homelessCount,
    kepuasanUmum,
    foodRatio,
    housingFulfillment,
    overpopulationTier,
    healthIndex,
    populationStatus,
    projectedPopulation30Days,
  } = metrics;

  const factorCards = [
    {
      label: 'Pangan / Food',
      value: `${(foodRatio * 100).toFixed(1)}%`,
      status: getPanganMultiplier(foodRatio),
      progress: Math.min(100, foodRatio * 100),
    },
    {
      label: 'Hunian / Housing',
      value: `${(housingFulfillment * 100).toFixed(1)}%`,
      status: getHunianMultiplier(housingFulfillment),
      progress: Math.min(100, housingFulfillment * 100),
    },
    {
      label: 'Overpopulasi / Overpopulation',
      value: getOverpopMultiplier(populasi).label,
      status: getOverpopMultiplier(populasi),
      progress: (overpopulationTier / 5) * 100,
    },
    {
      label: 'Kesehatan / Health',
      value: `${Math.round(healthIndex)}/100`,
      status: getKesehatanMultiplier(healthIndex),
      progress: healthIndex,
    },
  ];
  const factorColors: Record<string, { text: string; bar: string }> = {
    emerald: { text: 'text-emerald-300', bar: 'bg-emerald-400' },
    green: { text: 'text-green-300', bar: 'bg-green-400' },
    yellow: { text: 'text-yellow-300', bar: 'bg-yellow-400' },
    amber: { text: 'text-amber-300', bar: 'bg-amber-400' },
    orange: { text: 'text-orange-300', bar: 'bg-orange-400' },
    red: { text: 'text-red-300', bar: 'bg-red-400' },
    rose: { text: 'text-rose-300', bar: 'bg-rose-400' },
  };
  const activePopulationEvents = [
    ...(Array.isArray(countryDetail?.active_outbreaks) ? countryDetail.active_outbreaks : []).map((event: any) => ({
      id: event.id,
      label: `Wabah / Outbreak: ${event.eventName || event.category}`,
      korban: Number(event.korban) || 0,
      days: Number(event.durationDays) || 0,
    })),
    ...(Array.isArray(countryDetail?.active_disaster_effects) ? countryDetail.active_disaster_effects : []).map((event: any) => ({
      id: event.id,
      label: `Bencana / Disaster: ${event.eventName || event.category}`,
      korban: Number(event.korban) || 0,
      days: Number(event.durationDays) || 0,
    })),
  ];

  const countryName = selectedCountry?.country || "Indonesia";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
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
                <p className="text-[11px] lg:text-xs 2xl:text-base font-black text-[#E0E0E0] leading-tight whitespace-nowrap">{populasi.toLocaleString('id-ID')} <span className="text-[7px] lg:text-[8px] 2xl:text-[9px] text-[#6B8A8A]">JIWA</span></p>
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
                    {totalDailyDelta >= 0 ? '+' : ''}{totalDailyDelta.toLocaleString('id-ID')} <span className="text-[7px] lg:text-[8px] 2xl:text-[9px] text-[#6B8A8A]">/hr</span>
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
                  <p className="text-[11px] lg:text-xs 2xl:text-base font-black text-[#E0E0E0] leading-tight whitespace-nowrap">{homelessCount.toLocaleString('id-ID')} <span className="text-[7px] lg:text-[8px] 2xl:text-[9px] text-[#6B8A8A]">JIWA</span></p>
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

            <section className="bg-[#0F2424] border border-[#00FFAA]/20 p-3.5 lg:p-4.5 2xl:p-6 rounded-xl space-y-3" aria-label="Status demografi / Demographic status">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs lg:text-sm font-black text-[#00FFAA] uppercase">Status Demografi / Demographic Status</h3>
                  <p className={`text-[10px] lg:text-xs font-bold mt-1 ${factorColors[populationStatus.color]?.text || 'text-[#E0E0E0]'}`}>
                    {populationStatus.label} / {populationStatus.labelEn}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] lg:text-[10px] text-[#6B8A8A] font-bold uppercase">Proyeksi 30 hari / 30-day projection</p>
                  <p className="text-xs lg:text-sm text-[#E0E0E0] font-black">{projectedPopulation30Days.toLocaleString('id-ID')} jiwa</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:gap-3">
                {factorCards.map((factor) => {
                  const colors = factorColors[factor.status.color] || factorColors.green;
                  return (
                    <div key={factor.label} className="bg-[#0A1A1A] border border-[#00FFAA]/15 rounded-lg p-2.5 lg:p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[9px] lg:text-[10px] text-[#8BA5A5] font-black uppercase">{factor.label}</span>
                        <span className={`text-[10px] lg:text-xs font-black ${colors.text}`}>{factor.value}</span>
                      </div>
                      <p className="text-[9px] text-[#6B8A8A] mt-1">{factor.status.label} / {factor.status.labelEn}</p>
                      <div
                        className="h-1.5 mt-2 rounded-full bg-[#173131] overflow-hidden"
                        role="progressbar"
                        aria-label={factor.label}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(factor.progress)}
                      >
                        <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${Math.max(0, Math.min(100, factor.progress))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-[#6B8A8A]">
                Kelahiran +{dailyBirths.toLocaleString('id-ID')} / kematian −{dailyDeaths.toLocaleString('id-ID')} jiwa per hari
                {' / '}Births +{dailyBirths.toLocaleString('en-US')} / deaths −{dailyDeaths.toLocaleString('en-US')} people per day
              </p>
              {String(countryDetail?.religion || "").trim().toLowerCase() === "hindu" && (
                <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                  Bonus Hindu: Pertumbuhan populasi +{HINDU_POPULATION_GROWTH_BONUS * 100}%
                </span>
              )}
              <div className="border-t border-[#00FFAA]/15 pt-2">
                <p className="text-[9px] text-[#8BA5A5] font-black uppercase">Wabah & bencana aktif / Active outbreaks & disasters</p>
                {activePopulationEvents.length === 0 ? (
                  <p className="text-[9px] text-[#6B8A8A] mt-1">Tidak ada event aktif / No active events</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {activePopulationEvents.map((event) => (
                      <li key={event.id} className="flex flex-wrap justify-between gap-x-3 text-[9px] text-[#B6CACA]">
                        <span>{event.label}</span>
                        <span>{event.korban.toLocaleString('id-ID')} korban · {event.days} hari / days</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Informasi Demografi */}
            <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-3.5 lg:p-4.5 2xl:p-6 rounded-xl 2xl:rounded-2xl space-y-2.5 lg:space-y-3 2xl:space-y-4">
              <h3 className="text-xs lg:text-sm 2xl:text-md font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-2">
                <Info className="h-4 w-4 lg:h-4.5 lg:w-4.5 2xl:h-5 2xl:w-5 text-[#00FFAA]" />
                Informasi Demografi
              </h3>
              <div className="space-y-2.5 lg:space-y-3 2xl:space-y-4 font-sans text-xs lg:text-xs 2xl:text-sm text-[#E0E0E0] font-medium leading-relaxed">
                <p>
                  Negara <span className="font-bold text-[#00FFAA]">{countryName}</span> memiliki total populasi terdaftar sebanyak <span className="font-bold text-[#00FFAA]">{populasi.toLocaleString('id-ID')} jiwa</span>.
                  Saat ini, laju pertumbuhan harian berada pada angka <span className={`font-bold ${totalDailyDelta >= 0 ? 'text-[#00FFAA]' : 'text-rose-400'}`}>{totalDailyDelta >= 0 ? '+' : ''}{totalDailyDelta.toLocaleString('id-ID')} jiwa per hari</span>.
                </p>
                <p className="border-l-2 border-[#00FFAA]/40 pl-3 text-[10px] lg:text-xs text-[#9BB2B2]">
                  Laju harian adalah kelahiran dikurangi kematian. Pertumbuhan dimoderasi oleh coverage pangan per kategori, kapasitas hunian terhadap populasi, kepadatan, dan kesehatan. Wabah dapat mengurangi kelahiran atau menambah kematian; bencana mengurangi korban saat kejadian dan menurunkan kesehatan sementara. Defisit satu komoditas tidak langsung dikonversi menjadi jiwa. Pertumbuhan dibatasi maksimal 3% per tahun; penurunan hingga 5% hanya saat krisis.
                </p>

                {/* TOMBOL KELAHIRAN & KEMATIAN */}
                <div className="pt-2.5 lg:pt-3 2xl:pt-4 border-t border-[#00FFAA]/20 grid grid-cols-2 gap-2.5 lg:gap-3 2xl:gap-4">
                  <div
                    className="group cursor-pointer rounded-lg lg:rounded-xl p-2.5 lg:p-3 2xl:p-4 border border-[#00FFAA]/30 bg-[#0A1A1A] hover:bg-[#00FFAA]/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-between"
                    onClick={() => setIsDetailBirthOpen(true)}
                  >
                    <div className="flex flex-col items-start">
                      <p className="text-[8px] lg:text-[9px] 2xl:text-[10px] text-[#6B8A8A] font-black uppercase">Angka Kelahiran Harian</p>
                      <p className="text-base lg:text-xl 2xl:text-2xl font-black text-[#00FFAA] mt-0.5 lg:mt-1">+{dailyBirths.toLocaleString('id-ID')}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 lg:h-4.5 lg:w-4.5 2xl:h-5 2xl:w-5 text-[#00FFAA] group-hover:translate-x-1 transition-all shrink-0 ml-1.5" />
                  </div>
                  <div
                    className="group cursor-pointer rounded-lg lg:rounded-xl p-2.5 lg:p-3 2xl:p-4 border border-rose-500/30 bg-[#0A1A1A] hover:bg-rose-500/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-between"
                    onClick={() => setIsDetailDeathOpen(true)}
                  >
                    <div className="flex flex-col items-start">
                      <p className="text-[8px] lg:text-[9px] 2xl:text-[10px] text-[#6B8A8A] font-black uppercase">Angka Kematian Harian</p>
                      <p className="text-base lg:text-xl 2xl:text-2xl font-black text-rose-400 mt-0.5 lg:mt-1">-{dailyDeaths.toLocaleString('id-ID')}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 lg:h-4.5 lg:w-4.5 2xl:h-5 2xl:w-5 text-rose-400 group-hover:translate-x-1 transition-all shrink-0 ml-1.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Laporan Analisis Demografi */}
            <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-3 lg:p-4 2xl:p-5 rounded-xl 2xl:rounded-2xl flex items-center gap-3 lg:gap-4 2xl:gap-5 relative overflow-hidden group">
              <div className="p-2 lg:p-2.5 2xl:p-3 bg-[#0A1A1A] rounded-lg 2xl:rounded-xl border border-[#00FFAA]/30 shrink-0">
                <Info className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6 text-[#00FFAA]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs lg:text-xs 2xl:text-sm font-black text-[#00FFAA] uppercase tracking-wide mb-0.5 lg:mb-1">Laporan Analisis Demografi Nasional</h4>
                <p className="text-[10px] lg:text-xs 2xl:text-xs text-[#E0E0E0] font-semibold leading-relaxed">
                  {totalDailyDelta >= 0 ? (
                    <span className="text-emerald-400 font-bold">Status: Pertumbuhan Populasi Positif.</span>
                  ) : (
                    <span className="text-rose-400 font-bold">Status: Pertumbuhan Populasi Negatif!</span>
                  )}{" "}
                  Demografi nasional saat ini menunjukkan tren {totalMonthlyGrowthPercent >= 0 ? 'ekspansi' : 'kontraksi'} sebesar <span className="text-[#00FFAA] font-bold">{totalMonthlyGrowthPercent.toFixed(2)}% per bulan</span>.
                  {kepuasanUmum >= 70
                    ? " Layanan publik berjalan stabil dan kepuasan tinggi mendorong pertumbuhan."
                    : kepuasanUmum < 40
                      ? " Rendahnya kepuasan rakyat mengancam stabilitas demografi."
                      : " Kepuasan rakyat cukup moderat, perlu peningkatan di beberapa sektor."}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Render modal detail */}
      <DetailKelahiranModal
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
      />

      <DetailKematianModal
        isOpen={isDetailDeathOpen}
        onClose={() => setIsDetailDeathOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
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
      />

      <TempatUmumModal
        isOpen={isTempatUmumOpen}
        onClose={() => setIsTempatUmumOpen(false)}
        countryDetail={countryDetail}
        setCountryDetail={(updated) => {
          // Update countryDetail melalui parent jika diperlukan
          // Atau gunakan hook context jika tersedia
        }}
        initialTab={tempatUmumActiveTab}
      />

      <IndeksKesejahteraanModal
        isOpen={isKesejahteraanOpen}
        onClose={() => setIsKesejahteraanOpen(false)}
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

      <TunawismaDetailModal
        isOpen={isTunawismaOpen}
        onClose={() => setIsTunawismaOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
        homelessCount={homelessCount}
      />
    </div>
  );
}