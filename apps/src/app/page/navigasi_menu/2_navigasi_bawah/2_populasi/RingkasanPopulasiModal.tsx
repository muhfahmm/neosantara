"use client"

import { useState, useMemo, useEffect } from "react";
import { X, Users, Info, TrendingUp, ShieldAlert, BadgeDollarSign, Users2 } from "lucide-react";
import {
  calculateSectoralSatisfaction,
  calculateGeneralSatisfaction,
  calculateLifeExpectancy,
  calculateSecurityLevel,
  calculateDailyBirths,
  calculateDailyDeaths,
  calculateHomelessCount,
  type PopulationDailyMetrics,
  type PopulationSectoral,
} from "@/app/logic/populations_logic/population_logic"; 

import DetailKelahiranModal from "./kelahiran_modals/DetailKelahiranModal";
import DetailKematianModal from "./kematian_modals/DetailKematianModal";
import TempatUmumModal from "../5_pembangunan/2_tempat_umum/TempatUmumModal";
import IndeksKesejahteraanModal from "./indeks_kesejahteraan_modals/IndeksKesejahteraanModal";
import TunawismaDetailModal from "./tunawisma_modals/TunawismaDetailModal";

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
  onOpenArmadaTab?: (tab: 'aktif' | 'infrastruktur' | 'polisi') => void;
  onOpenTempatUmum?: (tab: string) => void;
  initialOpenKesejahteraan?: boolean;
  initialKesejahteraanTab?: "statistik" | "naikkan";
  setCountryDetail?: (detail: any) => void;
  currentDate?: Date | string;
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
function hitungDemografi(detail: CountryDetail, countryName?: string) {
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

  const dailyDeaths = calculateDailyDeaths(populasi, lifeExpectancy, securityLevel, detailWithDefaults);

  const totalDailyDelta = dailyBirths - dailyDeaths;
  const totalMonthlyGrowthPercent = ((totalDailyDelta * 30) / populasi) * 100;

  const homelessCount = calculateHomelessCount(populasi, sektoral.hunian);

  return {
    populasi,
    dailyBirths,
    dailyDeaths,
    totalDailyDelta,
    totalMonthlyGrowthPercent,
    homelessCount,
    securityLevel,
    lifeExpectancy,
    kepuasanUmum,
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
    return hitungDemografi(countryDetail, selectedCountry?.country);
  }, [countryDetail, selectedCountry]);

  if (!isOpen || !metrics) return null;

  const {
    populasi,
    dailyBirths,
    dailyDeaths,
    totalDailyDelta,
    totalMonthlyGrowthPercent,
    homelessCount,
    kepuasanUmum,
  } = metrics;

  const countryName = selectedCountry?.country || "Indonesia";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[80px] sm:pt-[90px] pb-[90px] sm:pb-[100px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[850px] xl:max-w-4xl 2xl:max-w-5xl h-full max-h-[calc(100vh-180px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#C4B49C]/40 flex items-center justify-between bg-[#FAF6EE] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#5c3c10]/10 rounded-lg border border-[#5c3c10]/20 shrink-0">
              <Users2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#5c3c10]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Kependudukan</h2>
            </div>
          </div>

          <button onClick={onClose} className="p-1 sm:p-1.5 rounded-lg border border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1 hidden sm:inline">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 bg-[#e4dac3]/20 border-b border-[#C4B49C]/20 relative z-10 shrink-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
            <div className="bg-[#FAF6EE]/80 border-2 border-[#C4B49C]/30 p-2.5 sm:p-3 lg:p-4 rounded-xl flex items-center gap-2.5 lg:gap-3.5 transition-all shadow-sm">
              <div className="p-2 lg:p-2.5 bg-blue-500/10 rounded-lg lg:rounded-xl shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 text-blue-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] text-[#8b7e66] font-black uppercase tracking-wider whitespace-nowrap">Total Populasi</p>
                <p className="text-xs sm:text-sm lg:text-base font-black text-[#2e261a] leading-tight whitespace-nowrap">{populasi.toLocaleString('id-ID')} <span className="text-[8px] sm:text-[9px] text-[#8b7e66]">JIWA</span></p>
              </div>
            </div>

            <div
              className="bg-[#FAF6EE]/80 border-2 border-[#C4B49C]/30 p-2.5 sm:p-3 lg:p-4 rounded-xl flex items-center gap-2.5 lg:gap-3.5 transition-all shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50/70 active:scale-[0.98]"
              onClick={() => setIsDetailBirthOpen(true)}
            >
              <div className="p-2 lg:p-2.5 bg-emerald-500/10 rounded-lg lg:rounded-xl shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] text-[#8b7e66] font-black uppercase tracking-wider whitespace-nowrap">Laju Pertumbuhan</p>
                <p className={`text-xs sm:text-sm lg:text-base font-black leading-tight whitespace-nowrap ${totalDailyDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {totalDailyDelta >= 0 ? '+' : ''}{totalDailyDelta.toLocaleString('id-ID')} <span className="text-[8px] sm:text-[9px] text-[#8b7e66]">/hr</span>
                </p>
              </div>
            </div>

            <div
              className="bg-[#FAF6EE]/80 border-2 border-[#C4B49C]/30 p-2.5 sm:p-3 lg:p-4 rounded-xl flex items-center gap-2.5 lg:gap-3.5 transition-all shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50/70 active:scale-[0.98]"
              onClick={() => setIsTunawismaOpen(true)}
            >
              <div className="p-2 lg:p-2.5 bg-rose-500/10 rounded-lg lg:rounded-xl shrink-0">
                <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 text-rose-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] text-[#8b7e66] font-black uppercase tracking-wider whitespace-nowrap">Tunawisma</p>
                <p className="text-xs sm:text-sm lg:text-base font-black text-[#2e261a] leading-tight whitespace-nowrap">{homelessCount.toLocaleString('id-ID')} <span className="text-[8px] sm:text-[9px] text-[#8b7e66]">JIWA</span></p>
              </div>
            </div>

            <div
              className="bg-[#FAF6EE]/80 border-2 border-[#C4B49C]/30 p-2.5 sm:p-3 lg:p-4 rounded-xl flex items-center gap-2.5 lg:gap-3.5 transition-all shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50/70 active:scale-[0.98]"
              onClick={() => setIsKesejahteraanOpen(true)}
            >
              <div className="p-2 lg:p-2.5 bg-amber-500/10 rounded-lg lg:rounded-xl shrink-0">
                <BadgeDollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 text-amber-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] text-[#8b7e66] font-black uppercase tracking-wider whitespace-nowrap">Kesejahteraan</p>
                <p className="text-xs sm:text-sm lg:text-base font-black text-[#2e261a] leading-tight whitespace-nowrap">
                  {countryDetail?.kesejahteraan !== undefined ? Math.round(Number(countryDetail.kesejahteraan)) : 50}{" "}
                  <span className="text-[8px] sm:text-[9px] text-[#8b7e66]">INDX</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10">
          <div className="space-y-6 animate-in fade-in duration-500">

            {/* Informasi Demografi */}
            <div className="bg-[#e4dac3]/20 border-2 border-[#C4B49C]/30 p-6 rounded-2xl space-y-4">
              <h3 className="text-md font-black text-[#5c3c10] uppercase tracking-wider flex items-center gap-2">
                <Info className="h-5 w-5 text-[#8b7e66]" />
                Informasi Demografi
              </h3>
              <div className="space-y-4 font-sans text-sm text-[#5c3c10] font-medium leading-relaxed">
                <p>
                  Negara <span className="font-bold">{countryName}</span> memiliki total populasi terdaftar sebanyak <span className="font-bold">{populasi.toLocaleString('id-ID')} jiwa</span>.
                  Saat ini, laju pertumbuhan harian berada pada angka <span className={`font-bold ${totalDailyDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{totalDailyDelta >= 0 ? '+' : ''}{totalDailyDelta.toLocaleString('id-ID')} jiwa per hari</span>.
                </p>

                {/* ðŸ”¥ TOMBOL KELAHIRAN & KEMATIAN - Berwarna hijau/merah permanen */}
                <div className="pt-4 border-t border-[#C4B49C]/30 grid grid-cols-2 gap-4">
                  <div
                    className="cursor-pointer rounded-xl p-4 border-2 border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/70 hover:border-emerald-300 active:scale-[0.98] transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm"
                    onClick={() => setIsDetailBirthOpen(true)}
                  >
                    <p className="text-[10px] text-[#8b7e66] font-black uppercase">Angka Kelahiran Harian</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">+{dailyBirths.toLocaleString('id-ID')}</p>
                  </div>
                  <div
                    className="cursor-pointer rounded-xl p-4 border-2 border-rose-200 bg-rose-50/80 hover:bg-rose-100/70 hover:border-rose-300 active:scale-[0.98] transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm"
                    onClick={() => setIsDetailDeathOpen(true)}
                  >
                    <p className="text-[10px] text-[#8b7e66] font-black uppercase">Angka Kematian Harian</p>
                    <p className="text-2xl font-black text-rose-700 mt-1">-{dailyDeaths.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Laporan Analisis Demografi */}
            <div className="bg-[#e4dac3]/30 border-2 border-[#C4B49C]/40 p-5 rounded-2xl flex items-center gap-5 relative overflow-hidden group">
              <div className="p-3 bg-[#5c3c10]/5 rounded-xl border border-[#5c3c10]/15">
                <Info className="h-6 w-6 text-[#5c3c10]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-[#5c3c10] uppercase tracking-wide mb-1">Laporan Analisis Demografi Nasional</h4>
                <p className="text-xs text-[#8b7e66] font-bold leading-relaxed">
                  {totalDailyDelta >= 0 ? (
                    <span className="text-emerald-700">Status: Pertumbuhan Populasi Positif.</span>
                  ) : (
                    <span className="text-rose-700">Status: Pertumbuhan Populasi Negatif!</span>
                  )}{" "}
                  Demografi nasional saat ini menunjukkan tren {totalMonthlyGrowthPercent >= 0 ? 'ekspansi' : 'kontraksi'} sebesar <span className="text-[#2e261a]">{totalMonthlyGrowthPercent.toFixed(2)}% per bulan</span>.
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
          onOpenArmadaTab?.(tabId);
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