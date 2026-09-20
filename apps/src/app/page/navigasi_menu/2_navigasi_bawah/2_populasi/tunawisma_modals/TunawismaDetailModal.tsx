"use client"

import { useState, useMemo } from "react";
import { X, Info, AlertCircle, Home, Users, TrendingDown, MapPin } from "lucide-react";
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
      : calculateHomelessCount(populasi, 50); // Default jika tidak ada

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
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        {/* Header */}
        <div className="px-8 py-6 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424]">
              <AlertCircle className="h-6 w-6 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#00FFAA] tracking-tight leading-none uppercase">Tunawisma & Hunian</h2>
              <p className="text-xs text-[#6B8A8A] font-bold mt-1">Analisis Masalah Perumahan Penduduk</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
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

            {/* Interpretasi */}
            <div className="bg-[#0F2424] border border-[#00FFAA]/30 p-6 rounded-2xl">
              <h3 className="text-md font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-[#00FFAA]" />
                Analisis Situasi
              </h3>
              <p className="text-sm text-[#E0E0E0] font-medium leading-relaxed">
                {homelessPercentage >= 5 && (
                  <>
                    Negara <span className="font-bold text-[#00FFAA]">{countryName}</span> menghadapi <span className="text-rose-400 font-bold">krisis hunian yang serius</span>. Dengan <span className="font-bold text-[#00FFAA]">{homelessPercentage.toFixed(2)}%</span> populasi tidak memiliki tempat tinggal yang layak, ini menunjukkan <span className="font-bold text-rose-400">urgensi tinggi</span> untuk pembangunan hunian massal. Kondisi ini dapat memicu masalah kesehatan, keamanan, dan sosial yang lebih luas.
                  </>
                )}
                {homelessPercentage >= 3 && homelessPercentage < 5 && (
                  <>
                    Negara <span className="font-bold text-[#00FFAA]">{countryName}</span> menghadapi <span className="text-amber-400 font-bold">masalah tunawisma yang serius</span>. Dengan <span className="font-bold text-[#00FFAA]">{homelessPercentage.toFixed(2)}%</span> populasi hidup tanpa tempat tinggal yang layak, perlu <span className="font-bold text-amber-400">intervensi segera</span> untuk meningkatkan pembangunan hunian dan layanan sosial.
                  </>
                )}
                {homelessPercentage >= 1 && homelessPercentage < 3 && (
                  <>
                    Negara <span className="font-bold text-[#00FFAA]">{countryName}</span> memiliki <span className="text-yellow-400 font-bold">masalah tunawisma yang perlu perhatian</span>. Dengan <span className="font-bold text-[#00FFAA]">{homelessPercentage.toFixed(2)}%</span> populasi mengalami kesulitan hunian, diperlukan <span className="font-bold text-yellow-400">peningkatan pembangunan perumahan</span> dan program subsidi hunian.
                  </>
                )}
                {homelessPercentage < 1 && (
                  <>
                    Negara <span className="font-bold text-[#00FFAA]">{countryName}</span> memiliki <span className="text-emerald-400 font-bold">masalah tunawisma yang terkontrol</span>. Dengan hanya <span className="font-bold text-[#00FFAA]">{homelessPercentage.toFixed(2)}%</span> populasi tanpa hunian layak, situasi relatif stabil. Pertahankan dan tingkatkan kualitas perumahan untuk pertumbuhan berkelanjutan.
                  </>
                )}
              </p>
            </div>

            {/* Faktor Penyebab */}
            <div className="space-y-4">
              <h3 className="text-md font-black text-[#00FFAA] uppercase tracking-wider">Faktor Penyebab Tunawisma</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Faktor 1: Pertumbuhan Populasi */}
                <div className="bg-[#0F2424] border border-cyan-500/30 p-5 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-black text-cyan-400 mb-1">Pertumbuhan Populasi</p>
                      <p className="text-xs text-[#E0E0E0]/80 font-semibold">
                        Populasi meningkat pesat tetapi pembangunan hunian tidak mengikuti. Setiap tahun populasi bertambah, permintaan hunian meningkat.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Faktor 2: Kurang Hunian Layak */}
                <div className="bg-[#0F2424] border border-amber-500/30 p-5 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-black text-amber-400 mb-1">Kurangnya Hunian Layak</p>
                      <p className="text-xs text-[#E0E0E0]/80 font-semibold">
                        Keterbatasan dana untuk pembangunan rumah subsidi, apartemen, dan mansion. Setiap unit hunian membutuhkan investasi besar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Faktor 3: Kemiskinan */}
                <div className="bg-[#0F2424] border border-rose-500/30 p-5 rounded-xl">
                  <div className="flex items-start gap-3">
                    <TrendingDown className="h-5 w-5 text-rose-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-black text-rose-400 mb-1">Tingkat Kemiskinan</p>
                      <p className="text-xs text-[#E0E0E0]/80 font-semibold">
                        Masyarakat berpenghasilan rendah tidak mampu membeli hunian. Program subsidi dan pembiayaan belum menjangkau semua.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Faktor 4: Kesejahteraan Rendah */}
                <div className="bg-[#0F2424] border border-purple-500/30 p-5 rounded-xl">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-black text-purple-400 mb-1">Kesejahteraan Rendah</p>
                      <p className="text-xs text-[#E0E0E0]/80 font-semibold">
                        Investasi minim di bidang pendidikan, kesehatan, dan fasilitas publik menyulitkan masyarakat keluar dari kemiskinan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Solusi & Rekomendasi */}
            <div className="bg-[#0F2424] border border-[#00FFAA]/30 p-6 rounded-2xl">
              <h3 className="text-md font-black text-[#00FFAA] uppercase tracking-wider mb-4">Solusi & Rekomendasi</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-[#0A1A1A] rounded-lg border border-emerald-500/30">
                  <span className="text-lg font-black">🏠</span>
                  <div>
                    <p className="text-sm font-black text-emerald-400">Bangun Hunian Massal</p>
                    <p className="text-xs text-[#E0E0E0]/80 font-semibold">Tingkatkan pembangunan rumah subsidi dan apartemen untuk menjangkau semua lapisan masyarakat</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#0A1A1A] rounded-lg border border-cyan-500/30">
                  <span className="text-lg font-black">📚</span>
                  <div>
                    <p className="text-sm font-black text-cyan-400">Tingkatkan Kesejahteraan</p>
                    <p className="text-xs text-[#E0E0E0]/80 font-semibold">Investasi lebih dalam pendidikan, kesehatan, dan fasilitas publik agar masyarakat mampu meningkatkan penghasilan</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#0A1A1A] rounded-lg border border-amber-500/30">
                  <span className="text-lg font-black">💰</span>
                  <div>
                    <p className="text-sm font-black text-amber-400">Program Pembiayaan</p>
                    <p className="text-xs text-[#E0E0E0]/80 font-semibold">Buat skema pembiayaan yang mudah diakses untuk pembelian hunian dengan bunga ringan dan cicilan terjangkau</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#0A1A1A] rounded-lg border border-purple-500/30">
                  <span className="text-lg font-black">⚖️</span>
                  <div>
                    <p className="text-sm font-black text-purple-400">Kontrol Pertumbuhan Populasi</p>
                    <p className="text-xs text-[#E0E0E0]/80 font-semibold">Implementasikan program keluarga berencana dan edukasi keluarga untuk menyeimbangkan pertumbuhan populasi dengan pembangunan hunian</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Tunawisma */}
            <div className="bg-[#0F2424] border border-[#00FFAA]/30 p-6 rounded-2xl">
              <h3 className="text-md font-black text-[#00FFAA] uppercase tracking-wider mb-4">Dampak Tunawisma Terhadap Negara</h3>
              <div className="space-y-2 text-xs text-[#E0E0E0] font-semibold leading-relaxed">
                <p>
                  🔴 <span className="font-black text-rose-400">Kesehatan:</span> Tunawisma berisiko tinggi terhadap penyakit karena kondisi hidup tidak layak
                </p>
                <p>
                  🔴 <span className="font-black text-rose-400">Keamanan:</span> Meningkatkan angka kejahatan, kriminalitas, dan gangguan keamanan publik
                </p>
                <p>
                  🔴 <span className="font-black text-rose-400">Pendidikan:</span> Anak-anak tunawisma putus sekolah, berdampak pada SDM masa depan
                </p>
                <p>
                  🔴 <span className="font-black text-rose-400">Ekonomi:</span> Menurunkan produktivitas kerja dan produktivitas ekonomi keseluruhan
                </p>
                <p>
                  🔴 <span className="font-black text-rose-400">Sosial:</span> Meningkatkan ketidakstabilan sosial dan ketidakpuasan masyarakat terhadap pemerintah
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
