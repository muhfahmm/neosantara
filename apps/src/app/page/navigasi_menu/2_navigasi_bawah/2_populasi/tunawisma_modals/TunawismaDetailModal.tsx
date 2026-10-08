"use client"

import { useState, useMemo } from "react";
import { X, Info, AlertCircle, Home, Users, TrendingDown, MapPin, Building2, BookOpen, Coins, Scale } from "lucide-react";
import { calculateHomelessCount } from "@/app/logic/populations_logic/population_logic";
import { calculatePendidikanScore, calculateKesehatanScore, calculateTempatUmumScore } from "@/app/logic/kesejahteraanCalculator";

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
    const hunianScore = calculateTempatUmumScore(countryDetail).detail.transportasi;
    
    // Hitung jumlah tunawisma
    const homelessCount = providedHomelessCount !== undefined
      ? providedHomelessCount
      : calculateHomelessCount(populasi, 50, countryDetail); // Default jika tidak ada

    // Persentase tunawisma
    const homelessPercentage = (homelessCount / populasi) * 100;

    // Hitung kualitas hunian (dari kesejahteraan)
    const housingMetrics = calculateTempatUmumScore(countryDetail);
    
    return {
      populasi,
      homelessCount,
      homelessPercentage,
      housingMetrics,
    };
  }, [countryDetail, providedHomelessCount]);

  if (!isOpen || !metrics) return null;

  const countryName = selectedCountry?.country || "Indonesia";
  const { populasi, homelessCount, homelessPercentage } = metrics;

  // Kategori keparahan
  const getSeverity = (percentage: number) => {
    if (percentage >= 5) return { level: 'KRITIS', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: 'text-rose-400' };
    if (percentage >= 3) return { level: 'SERIUS', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-400' };
    if (percentage >= 1) return { level: 'PERHATIAN', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'text-yellow-400' };
    return { level: 'TERKONTROL', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-400' };
  };

  const severity = getSeverity(homelessPercentage);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] shrink-0">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Tunawisma & Hunian</h2>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <div className="space-y-6 animate-in fade-in duration-500">

            {/* Main Stats Card */}
            <div className="rounded-2xl p-8 border border-[#00FFAA]/30 bg-[#0F2424]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Jumlah Tunawisma */}
                <div>
                  <p className="text-xs text-[#6B8A8A] font-black uppercase tracking-wider mb-2">Jumlah Tunawisma</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#00FFAA]">{homelessCount.toLocaleString('id-ID')}</span>
                    <span className="text-sm font-bold text-[#6B8A8A]">JIWA</span>
                  </div>
                </div>

                {/* Persentase */}
                <div>
                  <p className="text-xs text-[#6B8A8A] font-black uppercase tracking-wider mb-2">Persentase Populasi</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black ${severity.color}`}>{homelessPercentage.toFixed(2)}%</span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-[#6B8A8A] font-black uppercase tracking-wider mb-2">Status Keparahan</p>
                  <p className={`text-2xl font-black ${severity.color}`}>{severity.level}</p>
                </div>
              </div>
            </div>

            {/* Faktor Penyebab Tunawisma */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#00FFAA] uppercase tracking-wider">Faktor Penyebab Tunawisma</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Faktor 1 */}
                <div className="bg-[#0F2424] border border-cyan-500/30 p-3.5 rounded-xl flex items-center gap-3">
                  <Users className="h-5 w-5 text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-cyan-400">Pertumbuhan Populasi</p>
                    <p className="text-[10px] text-[#6B8A8A] font-bold">Laju populasi mendahului pasokan hunian</p>
                  </div>
                </div>

                {/* Faktor 2 */}
                <div className="bg-[#0F2424] border border-amber-500/30 p-3.5 rounded-xl flex items-center gap-3">
                  <Home className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-amber-400">Keterbatasan Hunian</p>
                    <p className="text-[10px] text-[#6B8A8A] font-bold">Kurangnya unit rumah subsidi & apartemen</p>
                  </div>
                </div>

                {/* Faktor 3 */}
                <div className="bg-[#0F2424] border border-rose-500/30 p-3.5 rounded-xl flex items-center gap-3">
                  <TrendingDown className="h-5 w-5 text-rose-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-rose-400">Tingkat Kemiskinan</p>
                    <p className="text-[10px] text-[#6B8A8A] font-bold">Daya beli perumahan warga rendah</p>
                  </div>
                </div>

                {/* Faktor 4 */}
                <div className="bg-[#0F2424] border border-purple-500/30 p-3.5 rounded-xl flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-purple-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-purple-400">Kesejahteraan Rendah</p>
                    <p className="text-[10px] text-[#6B8A8A] font-bold">Investasi fasilitas publik & bantuan minim</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solusi & Rekomendasi */}
            <div className="bg-[#0F2424] border border-[#00FFAA]/30 p-5 rounded-2xl">
              <h3 className="text-sm font-black text-[#00FFAA] uppercase tracking-wider mb-3">Solusi & Rekomendasi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2.5 p-2.5 bg-[#0A1A1A] rounded-lg border border-emerald-500/30">
                  <Building2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-emerald-400">Bangun Hunian Massal</p>
                    <p className="text-[10px] text-[#6B8A8A] font-medium">Perbanyak rumah subsidi dan apartemen rakyat</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 bg-[#0A1A1A] rounded-lg border border-cyan-500/30">
                  <BookOpen className="h-4 w-4 text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-cyan-400">Tingkatkan Kesejahteraan</p>
                    <p className="text-[10px] text-[#6B8A8A] font-medium">Perluas program lapangan kerja & layanan sosial</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 bg-[#0A1A1A] rounded-lg border border-amber-500/30">
                  <Coins className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-amber-400">Program Pembiayaan Ringan</p>
                    <p className="text-[10px] text-[#6B8A8A] font-medium">Subsidi bunga KPR & skema kepemilikan terjangkau</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 bg-[#0A1A1A] rounded-lg border border-purple-500/30">
                  <Scale className="h-4 w-4 text-purple-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-purple-400">Pemerataan Pembangunan</p>
                    <p className="text-[10px] text-[#6B8A8A] font-medium">Distribusi kawasan permukiman produktif</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}