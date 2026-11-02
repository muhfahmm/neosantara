"use client"

import { useMemo } from "react";
import { AlertCircle, Home, Users, TrendingDown, MapPin, Building2, BookOpen, Coins, Scale } from "lucide-react";
import { calculateHomelessCount } from "@/app/logic/populations_logic/population_logic";
import { calculateTempatUmumScore } from "@/app/logic/kesejahteraanCalculator";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";

interface TunawismaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  selectedCountry: any;
  homelessCount?: number;
}

export default function TunawismaDetailModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
  homelessCount: providedHomelessCount,
}: TunawismaDetailModalProps) {
  const metrics = useMemo(() => {
    if (!countryDetail) return null;

    const populasi = Number(countryDetail?.jumlah_penduduk) || 10_000_000;
    
    const homelessCount = providedHomelessCount !== undefined
      ? providedHomelessCount
      : calculateHomelessCount(populasi, 50, countryDetail);

    const homelessPercentage = (homelessCount / populasi) * 100;

    const housingMetrics = calculateTempatUmumScore(countryDetail);
    
    return {
      populasi,
      homelessCount,
      homelessPercentage,
      housingMetrics,
    };
  }, [countryDetail, providedHomelessCount]);

  if (!isOpen || !metrics) return null;

  const { homelessCount, homelessPercentage } = metrics;

  const getSeverity = (percentage: number) => {
    if (percentage >= 5) return { level: 'KRITIS', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    if (percentage >= 3) return { level: 'SERIUS', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (percentage >= 1) return { level: 'PERHATIAN', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    return { level: 'TERKONTROL', color: 'text-[#E0E0E0]', bg: 'bg-[#00FFAA]/10', border: 'border-[#00FFAA]/30' };
  };

  const severity = getSeverity(homelessPercentage);

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="flex flex-col h-full overflow-hidden bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 ">

        {/* ============ HEADER ============ */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] shrink-0 ">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#E0E0E0]" />
            </div>
            <div>
              <h2 className={`${rootModalTypography.title} leading-none`}>
                Tunawisma & Hunian
              </h2>
            </div>
          </div>

          <RootModalCloseButton onClick={onClose} />
        </div>

        {/* ============ CONTENT AREA ============ */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#0A1A1A]/80 relative z-10
          [&::-webkit-scrollbar]:w-1.5 
          [&::-webkit-scrollbar-track]:bg-[#0A1A1A] 
          [&::-webkit-scrollbar-track]:rounded-full 
          [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-[#00FFAA]/20
          [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#00FFAA] [&::-webkit-scrollbar-thumb]:to-[#00B37A]
          [&::-webkit-scrollbar-thumb]:rounded-full 
          [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#0A1A1A]

          hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-[#00FFAA]
          [&::-webkit-scrollbar-button]:hidden
        ">
          <div className="space-y-3 animate-in fade-in duration-500">

            {/* ============ MAIN STATS CARD ============ */}
            <div className={`${rootBorderRadius.card} p-3 sm:p-4 border border-[#00FFAA]/30 bg-[#0F2424]`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                
                {/* Jumlah Tunawisma */}
                <div className="flex flex-col items-start justify-center border-b sm:border-b-0 sm:border-r border-[#00FFAA]/10 pb-2 sm:pb-0 sm:pr-2">
                  <p className="text-[10px] text-[#AAB6B6] font-bold uppercase tracking-wider mb-1">
                    Jumlah Tunawisma
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    {/* Angka lebih kecil dan warna netral */}
                    <span className="text-lg sm:text-xl font-bold text-[#E0E0E0] tracking-tight">
                      {homelessCount.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-bold text-[#AAB6B6]">JIWA</span>
                  </div>
                </div>

                {/* Persentase */}
                <div className="flex flex-col items-start justify-center border-b sm:border-b-0 sm:border-r border-[#00FFAA]/10 pb-2 sm:pb-0 sm:pr-2">
                  <p className="text-[10px] text-[#AAB6B6] font-bold uppercase tracking-wider mb-1">
                    Persentase Populasi
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    {/* Persentase dibuat netral (putih/silver) tanpa efek glow hijau */}
                    <span className="text-lg sm:text-xl font-bold text-[#E0E0E0] tracking-tight">
                      {homelessPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col items-start justify-center pt-1 sm:pt-0">
                  <p className="text-[10px] text-[#AAB6B6] font-bold uppercase tracking-wider mb-1">
                    Status Keparahan
                  </p>
                  <p className={`text-sm sm:text-base font-black uppercase tracking-wide ${severity.color}`}>
                    {severity.level}
                  </p>
                </div>

              </div>
            </div>

            {/* ============ FAKTOR PENYEBAB ============ */}
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-black text-[#E0E0E0] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-3 bg-[#00FFAA] rounded-full inline-block"></span>
                Faktor Penyebab Tunawisma
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {/* Faktor 1 */}
                <div className={`bg-[#0F2424] border border-[#00FFAA]/20 p-2.5 sm:p-3 ${rootBorderRadius.card} flex items-start gap-2 sm:gap-2.5 hover:border-[#00FFAA]/40 transition-colors`}>
                  <div className="p-1.5 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-md shrink-0">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#E0E0E0]" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0]">Pertumbuhan Populasi</p>
                    <p className="text-[9px] sm:text-[10px] text-[#AAB6B6] font-medium leading-tight mt-0.5">Laju populasi mendahului pasokan hunian</p>
                  </div>
                </div>

                {/* Faktor 2 */}
                <div className={`bg-[#0F2424] border border-[#00FFAA]/20 p-2.5 sm:p-3 ${rootBorderRadius.card} flex items-start gap-2 sm:gap-2.5 hover:border-[#00FFAA]/40 transition-colors`}>
                  <div className="p-1.5 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-md shrink-0">
                    <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#E0E0E0]" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0]">Keterbatasan Hunian</p>
                    <p className="text-[9px] sm:text-[10px] text-[#AAB6B6] font-medium leading-tight mt-0.5">Kurangnya unit rumah subsidi & apartemen</p>
                  </div>
                </div>

                {/* Faktor 3 */}
                <div className={`bg-[#0F2424] border border-[#00FFAA]/20 p-2.5 sm:p-3 ${rootBorderRadius.card} flex items-start gap-2 sm:gap-2.5 hover:border-[#00FFAA]/40 transition-colors`}>
                  <div className="p-1.5 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-md shrink-0">
                    <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#E0E0E0]" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0]">Tingkat Kemiskinan</p>
                    <p className="text-[9px] sm:text-[10px] text-[#AAB6B6] font-medium leading-tight mt-0.5">Daya beli perumahan warga rendah</p>
                  </div>
                </div>

                {/* Faktor 4 */}
                <div className={`bg-[#0F2424] border border-[#00FFAA]/20 p-2.5 sm:p-3 ${rootBorderRadius.card} flex items-start gap-2 sm:gap-2.5 hover:border-[#00FFAA]/40 transition-colors`}>
                  <div className="p-1.5 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-md shrink-0">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#E0E0E0]" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0]">Kesejahteraan Rendah</p>
                    <p className="text-[9px] sm:text-[10px] text-[#AAB6B6] font-medium leading-tight mt-0.5">Investasi fasilitas publik & bantuan minim</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ============ SOLUSI & REKOMENDASI ============ */}
            <div className={`bg-[#0F2424] border border-[#00FFAA]/30 p-3 sm:p-4 ${rootBorderRadius.card}`}>
              <h3 className="text-xs sm:text-sm font-black text-[#E0E0E0] uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                <span className="w-1 h-3 bg-[#00FFAA] rounded-full inline-block"></span>
                Solusi & Rekomendasi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                
                <div className={`flex items-start gap-2 p-2 sm:p-2.5 bg-[#0A1A1A] ${rootBorderRadius.card} border border-[#00FFAA]/15 hover:border-[#00FFAA]/40 transition-colors`}>
                  <div className="p-1 bg-[#00FFAA]/10 rounded shrink-0">
                    <Building2 className="h-3.5 w-3.5 text-[#E0E0E0]" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0]">Bangun Hunian Massal</p>
                    <p className="text-[9px] sm:text-[10px] text-[#AAB6B6] font-medium leading-tight mt-0.5">Perbanyak rumah subsidi dan apartemen rakyat</p>
                  </div>
                </div>

                <div className={`flex items-start gap-2 p-2 sm:p-2.5 bg-[#0A1A1A] ${rootBorderRadius.card} border border-[#00FFAA]/15 hover:border-[#00FFAA]/40 transition-colors`}>
                  <div className="p-1 bg-[#00FFAA]/10 rounded shrink-0">
                    <BookOpen className="h-3.5 w-3.5 text-[#E0E0E0]" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0]">Tingkatkan Kesejahteraan</p>
                    <p className="text-[9px] sm:text-[10px] text-[#AAB6B6] font-medium leading-tight mt-0.5">Perluas program lapangan kerja & layanan sosial</p>
                  </div>
                </div>

                <div className={`flex items-start gap-2 p-2 sm:p-2.5 bg-[#0A1A1A] ${rootBorderRadius.card} border border-[#00FFAA]/15 hover:border-[#00FFAA]/40 transition-colors`}>
                  <div className="p-1 bg-[#00FFAA]/10 rounded shrink-0">
                    <Coins className="h-3.5 w-3.5 text-[#E0E0E0]" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0]">Program Pembiayaan Ringan</p>
                    <p className="text-[9px] sm:text-[10px] text-[#AAB6B6] font-medium leading-tight mt-0.5">Subsidi bunga KPR & skema kepemilikan terjangkau</p>
                  </div>
                </div>

                <div className={`flex items-start gap-2 p-2 sm:p-2.5 bg-[#0A1A1A] ${rootBorderRadius.card} border border-[#00FFAA]/15 hover:border-[#00FFAA]/40 transition-colors`}>
                  <div className="p-1 bg-[#00FFAA]/10 rounded shrink-0">
                    <Scale className="h-3.5 w-3.5 text-[#E0E0E0]" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0]">Pemerataan Pembangunan</p>
                    <p className="text-[9px] sm:text-[10px] text-[#AAB6B6] font-medium leading-tight mt-0.5">Distribusi kawasan permukiman produktif</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}