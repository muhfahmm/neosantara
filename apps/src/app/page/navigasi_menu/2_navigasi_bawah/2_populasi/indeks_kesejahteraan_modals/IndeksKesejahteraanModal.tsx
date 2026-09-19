"use client"

import { useState, useMemo, useEffect } from "react";
import {
  X, Info, TrendingUp, TrendingDown, BookOpen, Heart, MapPin,
  Wheat, Home, Library, Hospital, Landmark, CheckCircle, Sprout
} from "lucide-react";
import {
  calculateKesejahteraan,
  getKesejahteraanStatus,
  getKesejahteraanBreakdown,
  type KesejahteraanIndex,
} from "@/app/logic/kesejahteraanCalculator";
import { FOOD_CONSUMPTION_PER_CAPITA, calculateProduction } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";
import { fetchBuildingMetadata } from "@/lib/buildingMetadata";
import NaikkanKesejahteraanTab from "./NaikkanKesejahteraanTab";

interface IndeksKesejahteraanModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail?: (detail: any) => void;
  selectedCountry: any;
  metrics?: any;
  setActiveMenu?: (menu: string) => void;
  onOpenTempatUmum?: (tab: string) => void;
  onOpenIndustriPangan?: () => void;
  currentDate?: Date | string;
  initialTab?: "statistik" | "naikkan";
}

export default function IndeksKesejahteraanModal({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
  selectedCountry,
  metrics,
  setActiveMenu,
  onOpenTempatUmum,
  onOpenIndustriPangan,
  currentDate,
  initialTab,
}: IndeksKesejahteraanModalProps) {
  // 🔥 State Tab Menu Aktif
  const [activeTab, setActiveTab] = useState<"statistik" | "naikkan">("statistik");

  // ── Fetch metadata bangunan (ada cache, tidak akan refetch) ────────────────
  const [metadata, setMetadata] = useState<any>(null);
  useEffect(() => {
    if (!isOpen) return;
    fetchBuildingMetadata().then((data) => setMetadata(data || {}));
  }, [isOpen]);

  // Reset tab saat modal ditutup/dibuka kembali; atau langsung ke initialTab saat dibuka
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab ?? "statistik");
    } else {
      setActiveTab("statistik");
    }
  }, [isOpen, initialTab]);

  // 🔥 Hitung kesejahteraan dari countryDetail (untuk detail & trend)
  const kesejahteraan = useMemo(() => {
    if (!countryDetail) return null;
    return calculateKesejahteraan(
      countryDetail,
      metadata,
      FOOD_CONSUMPTION_PER_CAPITA,
      calculateProduction
    );
  }, [countryDetail, metadata]);

  // ─── Skor aktual dari setiap menu (formula identik dengan modal asal) ────────

  /**
   * Skor PENDIDIKAN — formula identik dengan TempatUmumModal
   * target ratio pendidikan = 0.0001 per kapita
   */
  const pendidikanActualScore = useMemo(() => {
    if (!countryDetail) return 0;
    const pop = Number(countryDetail.jumlah_penduduk) || 1;
    const keys = ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan", "literasi"];
    const total = keys.reduce((s, k) => s + (Number(countryDetail[k]) || 0), 0);
    const index = total / pop;
    return Math.min(100, Math.round((index / 0.0001) * 100));
  }, [countryDetail]);

  /**
   * Skor KESEHATAN — formula identik dengan TempatUmumModal
   * target ratio kesehatan = 0.00004 per kapita
   */
  const kesehatanActualScore = useMemo(() => {
    if (!countryDetail) return 0;
    const pop = Number(countryDetail.jumlah_penduduk) || 1;
    const keys = ["rumah_sakit_besar", "rumah_sakit_kecil", "pusat_diagnostik", "harapan_hidup", "indeks_kesehatan"];
    const total = keys.reduce((s, k) => s + (Number(countryDetail[k]) || 0), 0);
    const index = total / pop;
    return Math.min(100, Math.round((index / 0.00004) * 100));
  }, [countryDetail]);

  /**
   * Skor INFRASTRUKTUR (Tempat Umum) — formula identik dengan TempatUmumModal
   * target ratio infrastruktur = 0.00005 per kapita
   */
  const infrastrukturActualScore = useMemo(() => {
    if (!countryDetail) return 0;
    const pop = Number(countryDetail.jumlah_penduduk) || 1;
    const keys = ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"];
    const total = keys.reduce((s, k) => s + (Number(countryDetail[k]) || 0), 0);
    const index = total / pop;
    return Math.min(100, Math.round((index / 0.00005) * 100));
  }, [countryDetail]);

  /**
   * Skor PANGAN — identik 100% dengan IndustriPanganModal
   * Menggunakan calculateProduction (butuh metadata) + FOOD_CONSUMPTION_PER_CAPITA
   * Prioritaskan satisfaction.food jika metadata belum tersedia
   */
  const panganActualScore = useMemo(() => {
    if (!countryDetail) return 1;
    const stored = countryDetail?.satisfaction?.food;
    // Jika metadata belum siap, pakai nilai tersimpan atau 0
    if (!metadata) return stored !== undefined && stored !== null ? Math.round(Number(stored)) : 0;
    const pop = Number(countryDetail.jumlah_penduduk) || 0;
    if (pop <= 0) return 1;
    const allKeys = Object.keys(FOOD_CONSUMPTION_PER_CAPITA);
    let totalRatio = 0;
    let count = 0;
    for (const key of allKeys) {
      const prod = calculateProduction(key, countryDetail, metadata);
      const cons = (pop / 1000) * FOOD_CONSUMPTION_PER_CAPITA[key];
      if (cons > 0) {
        totalRatio += Math.min(prod / cons, 2);
        count++;
      }
    }
    if (count === 0) return Math.round(Number(countryDetail.indeks_ketahanan_pangan) || 1);
    const avgRatio = totalRatio / count;
    return Math.min(100, Math.max(1, Math.round((avgRatio / 2) * 100)));
  }, [countryDetail, metadata]);

  /**
   * Skor HUNIAN — identik 100% dengan HunianPermukimanModal
   * Menggunakan metadata.kapasitas per jenis unit hunian
   * Prioritaskan satisfaction.housing jika metadata belum tersedia
   */
  const hunianActualScore = useMemo(() => {
    if (!countryDetail) return 1;
    const stored = countryDetail?.satisfaction?.housing;
    // Jika metadata belum siap, pakai nilai tersimpan or 0
    if (!metadata) return stored !== undefined && stored !== null ? Math.round(Number(stored)) : 0;
    const pop = Number(countryDetail.jumlah_penduduk) || 0;
    if (pop <= 0) return 1;
    const HUNIAN_KEYS = ["rumah_subsidi", "apartemen", "mansion"];
    // Helper findMeta identik dengan HunianPermukimanModal
    const findMeta = (key: string) => {
      if (!metadata) return undefined;
      if (metadata[key]) return metadata[key];
      for (const k of Object.keys(metadata)) {
        const entry = metadata[k];
        if (!entry) continue;
        if (entry.dataKey === key) return entry;
        if (k.endsWith(`_${key}`) || k === `1_${key}`) return entry;
      }
      return undefined;
    };
    let totalCapacity = 0;
    for (const key of HUNIAN_KEYS) {
      const count = Number(countryDetail[key]) || 0;
      const meta = findMeta(key);
      const kapasitas = Number(meta?.kapasitas) || 0;
      totalCapacity += count * kapasitas;
    }
    if (totalCapacity <= 0) return 1;
    const ratio = Math.min(totalCapacity / pop, 2);
    return Math.min(100, Math.max(1, Math.round((ratio / 2) * 100)));
  }, [countryDetail, metadata]);

  const overallScore = kesejahteraan?.overallScore ?? 50;

  if (!isOpen || !kesejahteraan) return null;

  const countryName = selectedCountry?.country || "Indonesia";
  const status = getKesejahteraanStatus(overallScore);

  // Warna berdasarkan score
  const getScoreColor = (score: number) => {
    if (score >= 81) return { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', icon: 'text-emerald-700' };
    if (score >= 61) return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', icon: 'text-green-700' };
    if (score >= 41) return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', icon: 'text-yellow-700' };
    if (score >= 21) return { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', icon: 'text-orange-700' };
    return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', icon: 'text-red-700' };
  };

  const scoreColor = getScoreColor(overallScore);
  const pendidikanColor = getScoreColor(pendidikanActualScore);
  const kesehatanColor = getScoreColor(kesehatanActualScore);
  const tempatUmumColor = getScoreColor(infrastrukturActualScore);
  const panganColor = getScoreColor(panganActualScore);
  const hunianColor = getScoreColor(hunianActualScore);

  const getTrendIcon = (trend: 'naik' | 'turun' | 'stabil') => {
    switch (trend) {
      case 'naik':
        return <TrendingUp className="h-5 w-5 text-emerald-600" />;
      case 'turun':
        return <TrendingDown className="h-5 w-5 text-rose-600" />;
      default:
        return <div className="h-5 w-5 text-gray-600 flex items-center justify-center">➡️</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#C4B49C]/40 flex items-center justify-between bg-[#FAF6EE] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className={`p-1 sm:p-1.5 rounded-lg border ${scoreColor.border} ${scoreColor.bg} shrink-0`}>
                <MapPin className={`h-4 w-4 sm:h-5 sm:w-5 ${scoreColor.icon}`} />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Indeks Kesejahteraan</h2>
              </div>
            </div>

            {/* 🔥 Tab Navigation (Identik dengan Kepuasan Rakyat) */}
            <div className="flex items-center bg-[#e4dac3]/40 p-0.5 sm:p-1 rounded-lg border border-[#bfae93]/50 backdrop-blur-md">
              <button
                onClick={() => setActiveTab("statistik")}
                className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "statistik"
                    ? "bg-[#5c3c10] text-[#FAF6EE] shadow-sm"
                    : "text-[#8b7e66] hover:text-[#5c3c10]"
                }`}
              >
                Statistik
              </button>
              <button
                onClick={() => setActiveTab("naikkan")}
                className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "naikkan"
                    ? "bg-[#5c3c10] text-[#FAF6EE] shadow-sm"
                    : "text-[#8b7e66] hover:text-[#5c3c10]"
                }`}
              >
                Naikkan Kesejahteraan
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-lg border border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1 shadow-xs"
          >
            <span className="text-[10px] font-black uppercase tracking-widest pl-1 hidden sm:inline">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#FAF6EE]/40 relative z-10 custom-scrollbar">
          <div className="animate-in fade-in duration-500">
            {activeTab === "statistik" ? (
              <div className="space-y-6">
                {/* Main Score Card */}
                <div className={`rounded-2xl p-8 border-2 ${scoreColor.border} ${scoreColor.bg} shadow-md`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#8b7e66] font-black uppercase tracking-wider mb-2">Indeks Kesejahteraan Keseluruhan</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-black ${scoreColor.text}`}>{overallScore}</span>
                        <span className="text-lg font-bold text-[#8b7e66]">/100</span>
                      </div>
                      <p className={`text-sm font-black mt-2 ${scoreColor.text}`}>{status}</p>
                      <p className="text-[10px] text-[#8b7e66] font-medium mt-1">Rata‑rata dari 5 sektor utama</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(kesejahteraan.trend)}
                      <span className="text-xs font-bold text-[#8b7e66] uppercase">{kesejahteraan.trend}</span>
                    </div>
                  </div>
                </div>

                {/* Interpretasi */}
                <div className="bg-[#e4dac3]/20 border-2 border-[#C4B49C]/30 p-6 rounded-2xl">
                  <h3 className="text-md font-black text-[#5c3c10] uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5" />
                    Interpretasi
                  </h3>
                  <p className="text-sm text-[#5c3c10] font-medium leading-relaxed">
                    {overallScore >= 81 && (
                      <>Negara <span className="font-bold">{countryName}</span> memiliki indeks kesejahteraan yang <span className="text-emerald-700 font-bold">luar biasa baik</span>. Investasi dalam pendidikan, kesehatan, fasilitas publik, pangan, dan hunian telah menciptakan lingkungan yang sangat kondusif.</>
                    )}
                    {overallScore >= 61 && overallScore < 81 && (
                      <>Negara <span className="font-bold">{countryName}</span> memiliki indeks kesejahteraan yang <span className="text-green-700 font-bold">baik</span>. Infrastruktur dasar sudah memadai, namun masih ada ruang untuk peningkatan di beberapa sektor.</>
                    )}
                    {overallScore >= 41 && overallScore < 61 && (
                      <>Negara <span className="font-bold">{countryName}</span> memiliki indeks kesejahteraan yang <span className="text-yellow-700 font-bold">sedang</span>. Perlu perhatian lebih pada sektor‑sektor yang masih lemah untuk mencapai kualitas hidup yang lebih baik.</>
                    )}
                    {overallScore >= 21 && overallScore < 41 && (
                      <>Negara <span className="font-bold">{countryName}</span> memiliki indeks kesejahteraan yang <span className="text-orange-700 font-bold">buruk</span>. Investasi signifikan diperlukan di semua sektor untuk mengangkat kualitas hidup masyarakat.</>
                    )}
                    {overallScore < 21 && (
                      <>Negara <span className="font-bold">{countryName}</span> menghadapi <span className="text-red-700 font-bold">krisis kesejahteraan</span>. Urgensi tinggi untuk membangun infrastruktur dasar di bidang pendidikan, kesehatan, fasilitas publik, pangan, dan perumahan.</>
                    )}
                  </p>
                </div>

                {/* Breakdown 5 Sektor */}
                <div className="space-y-4">
                  <h3 className="text-md font-black text-[#5c3c10] uppercase tracking-wider">Breakdown Sektor (Bobot)</h3>

                  {/* Pendidikan - 35% */}
                  <div
                    onClick={() => {
                      onOpenTempatUmum?.('pendidikan');
                      if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum");
                      onClose();
                    }}
                    className={`rounded-xl p-5 border-2 ${pendidikanColor.border} ${pendidikanColor.bg} space-y-3 cursor-pointer transition-all duration-200 hover:shadow-lg`}
                    title="Klik untuk membuka tab Pendidikan di Tempat Umum & Layanan Publik"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Library className={`h-5 w-5 ${pendidikanColor.icon}`} />
                        <div>
                          <p className="text-xs font-black text-[#8b7e66] uppercase">Pendidikan</p>
                          <p className="text-sm font-bold text-[#5c3c10]">35% Bobot</p>
                        </div>
                      </div>
                      <span className={`text-3xl font-black ${pendidikanColor.text}`}>{pendidikanActualScore}</span>
                    </div>
                    <div className="space-y-1 text-xs text-[#5c3c10] font-bold">
                      <p>• Fasilitas Pendidikan: <span className="font-black">{kesejahteraan.detail.pendidikan.totalFacilities}</span> unit</p>
                      <p>• Indeks Kepuasan Rakyat: <span className="font-black">{pendidikanActualScore}/100</span></p>
                      <p>• Mencakup: Prasekolah, SD, SMP, SMA, Universitas, Lembaga Pendidikan, Lab, Observatorium, Pusat Penelitian</p>
                    </div>
                  </div>

                  {/* Kesehatan - 40% */}
                  <div
                    onClick={() => {
                      onOpenTempatUmum?.('kesehatan');
                      if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum");
                      onClose();
                    }}
                    className={`rounded-xl p-5 border-2 ${kesehatanColor.border} ${kesehatanColor.bg} space-y-3 cursor-pointer transition-all duration-200 hover:shadow-lg`}
                    title="Klik untuk membuka tab Kesehatan di Tempat Umum & Layanan Publik"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Hospital className={`h-5 w-5 ${kesehatanColor.icon}`} />
                        <div>
                          <p className="text-xs font-black text-[#8b7e66] uppercase">Kesehatan</p>
                          <p className="text-sm font-bold text-[#5c3c10]">40% Bobot (Prioritas)</p>
                        </div>
                      </div>
                      <span className={`text-3xl font-black ${kesehatanColor.text}`}>{kesehatanActualScore}</span>
                    </div>
                    <div className="space-y-1 text-xs text-[#5c3c10] font-bold">
                      <p>• Fasilitas Kesehatan: <span className="font-black">{kesejahteraan.detail.kesehatan.totalFacilities}</span> unit</p>
                      <p>• Indeks Kepuasan Rakyat: <span className="font-black">{kesehatanActualScore}/100</span></p>
                      <p>• Harapan Hidup: <span className="font-black">{kesejahteraan.detail.kesehatan.detail.harapanHidup.toFixed(1)}</span> tahun {kesejahteraan.detail.kesehatan.detail.harapanHidup >= 75 ? '✓' : '⚠'}</p>
                      <p>• Indeks Kesehatan: <span className="font-black">{kesejahteraan.detail.kesehatan.detail.indeksKesehatan}</span></p>
                    </div>
                  </div>

                  {/* Tempat Umum - 25% */}
                  <div
                    onClick={() => {
                      onOpenTempatUmum?.('infrastruktur');
                      if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum");
                      onClose();
                    }}
                    className={`rounded-xl p-5 border-2 ${tempatUmumColor.border} ${tempatUmumColor.bg} space-y-3 cursor-pointer transition-all duration-200 hover:shadow-lg`}
                    title="Klik untuk membuka tab Infrastruktur di Tempat Umum & Layanan Publik"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Landmark className={`h-5 w-5 ${tempatUmumColor.icon}`} />
                        <div>
                          <p className="text-xs font-black text-[#8b7e66] uppercase">Tempat Umum</p>
                          <p className="text-sm font-bold text-[#5c3c10]">25% Bobot</p>
                        </div>
                      </div>
                      <span className={`text-3xl font-black ${tempatUmumColor.text}`}>{infrastrukturActualScore}</span>
                    </div>
                    <div className="space-y-1 text-xs text-[#5c3c10] font-bold">
                      <p>• Total Fasilitas: <span className="font-black">{kesejahteraan.detail.tempatUmum.totalFacilities}</span> unit</p>
                      <p>• Indeks Kepuasan Rakyat: <span className="font-black">{infrastrukturActualScore}/100</span></p>
                      <p>• Transportasi: <span className="font-black">{kesejahteraan.detail.tempatUmum.detail.transportasi}</span></p>
                      <p>• Rekreasi: <span className="font-black">{kesejahteraan.detail.tempatUmum.detail.rekreasi}</span></p>
                      <p>• Komersial: <span className="font-black">{kesejahteraan.detail.tempatUmum.detail.komersial}</span></p>
                    </div>
                  </div>

                  {/* Pangan */}
                  <div
                    onClick={() => {
                      onOpenIndustriPangan
                        ? onOpenIndustriPangan()
                        : setActiveMenu?.("Menu:IndustriPangan");
                      onClose();
                    }}
                    className={`rounded-xl p-5 border-2 ${panganColor.border} ${panganColor.bg} space-y-3 cursor-pointer transition-all duration-200 hover:shadow-lg`}
                    title="Klik untuk membuka Industri Pangan & Konsumsi Masyarakat"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wheat className={`h-5 w-5 ${panganColor.icon}`} />
                        <div>
                          <p className="text-xs font-black text-[#8b7e66] uppercase">Pangan</p>
                          <p className="text-sm font-bold text-[#5c3c10]">Kepuasan Rakyat</p>
                        </div>
                      </div>
                      <span className={`text-3xl font-black ${panganColor.text}`}>{panganActualScore}</span>
                    </div>
                    <div className="space-y-1 text-xs text-[#5c3c10] font-bold">
                      <p>• Indeks Kepuasan Rakyat (Pangan): <span className="font-black">{panganActualScore}/100</span></p>
                      <p>• Status: {panganActualScore >= 70 ? '✓ Aman' : panganActualScore >= 50 ? '⚠ Cukup' : '❌ Kurang'}</p>
                    </div>
                  </div>

                  {/* Hunian */}
                  <div
                    onClick={() => {
                      setActiveMenu?.("Menu:HunianPermukiman");
                      onClose();
                    }}
                    className={`rounded-xl p-5 border-2 ${hunianColor.border} ${hunianColor.bg} space-y-3 cursor-pointer transition-all duration-200 hover:shadow-lg`}
                    title="Klik untuk membuka menu Hunian & Permukiman"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Home className={`h-5 w-5 ${hunianColor.icon}`} />
                        <div>
                          <p className="text-xs font-black text-[#8b7e66] uppercase">Hunian & Permukiman</p>
                          <p className="text-sm font-bold text-[#5c3c10]">Kepuasan Rakyat</p>
                        </div>
                      </div>
                      <span className={`text-3xl font-black ${hunianColor.text}`}>{hunianActualScore}</span>
                    </div>
                    <div className="space-y-1 text-xs text-[#5c3c10] font-bold">
                      <p>• Indeks Kepuasan Rakyat (Hunian): <span className="font-black">{hunianActualScore}/100</span></p>
                      <p>• Status: {hunianActualScore >= 70 ? '✓ Baik' : hunianActualScore >= 50 ? '⚠ Sedang' : '❌ Kurang'}</p>
                    </div>
                  </div>
                </div>

                {/* Rekomendasi */}
                <div className="bg-[#e4dac3]/20 border-2 border-[#C4B49C]/30 p-6 rounded-2xl">
                  <h3 className="text-md font-black text-[#5c3c10] uppercase tracking-wider mb-4">Rekomendasi Peningkatan</h3>
                  <div className="space-y-3">
                    {pendidikanActualScore < 60 && (
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Library className="h-5 w-5 text-blue-700 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-black text-blue-700">Tingkatkan Pendidikan</p>
                          <p className="text-xs text-blue-600 font-bold">Bangun lebih banyak sekolah, universitas, dan pusat penelitian</p>
                        </div>
                      </div>
                    )}
                    {kesehatanActualScore < 60 && (
                      <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <Hospital className="h-5 w-5 text-red-700 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-black text-red-700">Tingkatkan Kesehatan</p>
                          <p className="text-xs text-red-600 font-bold">Investasi besar dalam rumah sakit, klinik, dan program kesehatan masyarakat</p>
                        </div>
                      </div>
                    )}
                    {infrastrukturActualScore < 60 && (
                      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <Landmark className="h-5 w-5 text-purple-700 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-black text-purple-700">Tingkatkan Fasilitas Publik</p>
                          <p className="text-xs text-purple-600 font-bold">Bangun infrastruktur transportasi, rekreasi, dan komersial</p>
                        </div>
                      </div>
                    )}
                    {panganActualScore < 60 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Wheat className="h-5 w-5 text-yellow-700 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-black text-yellow-700">Tingkatkan Ketahanan Pangan</p>
                          <p className="text-xs text-yellow-600 font-bold">Dukung sektor pertanian dan distribusi pangan yang lebih baik</p>
                        </div>
                      </div>
                    )}
                    {hunianActualScore < 60 && (
                      <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                        <Home className="h-5 w-5 text-cyan-700 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-black text-cyan-700">Tingkatkan Hunian Layak</p>
                          <p className="text-xs text-cyan-600 font-bold">Program pembangunan perumahan dan perbaikan permukiman</p>
                        </div>
                      </div>
                    )}
                    {overallScore >= 60 && (
                      <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <CheckCircle className="h-5 w-5 text-emerald-700 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-black text-emerald-700">Status Kesejahteraan Baik</p>
                          <p className="text-xs text-emerald-600 font-bold">Lanjutkan investasi seimbang di semua sektor untuk pertumbuhan berkelanjutan</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <NaikkanKesejahteraanTab
                countryDetail={countryDetail}
                setCountryDetail={setCountryDetail || (() => {})}
                selectedCountry={selectedCountry}
                currentDate={currentDate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}