"use client"

import { useState, useMemo, useEffect } from "react";
import {
  X, Info, TrendingUp, TrendingDown, BookOpen, Heart, MapPin,
  Wheat, Home, Library, Hospital, Landmark, CheckCircle, Sprout, Globe, Zap, ShieldCheck
} from "lucide-react";
import {
  calculateKesejahteraan,
  getKesejahteraanStatus,
  getKesejahteraanBreakdown,
  type KesejahteraanIndex,
} from "@/app/logic/kesejahteraanCalculator";
import {
  calculateKesehatanScore,
  calculateKeterbukaanScore,
  calculateListrikScore,
  calculatePanganScore,
  calculateHunianScore,
} from "@/app/logic/kepuasanCalculator";
import { fetchBuildingMetadata } from "@/lib/buildingMetadata";
import { getEducationResearchModifier } from "@/app/page/downgrade_logic";
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
  const [showPendidikanInfoModal, setShowPendidikanInfoModal] = useState(false);
  const [showKesehatanInfoModal, setShowKesehatanInfoModal] = useState(false);
  const [showPenegakanHukumInfoModal, setShowPenegakanHukumInfoModal] = useState(false);

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
    return calculateKesejahteraan(countryDetail, metadata);
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
   * Gunakan skor kesehatan bersama agar sama dengan kartu Kepuasan Rakyat.
   */
  const kesehatanActualScore = useMemo(() => {
    return calculateKesehatanScore(countryDetail);
  }, [countryDetail]);

  /**
   * Skor infrastruktur dan transportasi — bagian dari kategori Tempat Umum.
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
   * Skor pangan menggunakan perhitungan cakupan kelompok yang sama dengan kepuasan
   * Prioritaskan satisfaction.food jika metadata belum tersedia
   */
  const panganActualScore = useMemo(() => {
    if (!countryDetail) return 1;
    const stored = countryDetail?.satisfaction?.food;
    // Jika metadata belum siap, pakai nilai tersimpan atau 0
    if (!metadata || Object.keys(metadata).length === 0) return stored !== undefined && stored !== null ? Math.round(Number(stored)) : 0;
    return calculatePanganScore(countryDetail, metadata);
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
    if (!metadata || Object.keys(metadata).length === 0) return stored !== undefined && stored !== null ? Math.round(Number(stored)) : 0;
    return calculateHunianScore(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const listrikActualScore = useMemo(() => {
    if (!countryDetail) return 0;
    const stored = countryDetail?.satisfaction?.electricity;
    if (!metadata || Object.keys(metadata).length === 0) return stored !== undefined && stored !== null ? Math.round(Number(stored)) : 50;
    return calculateListrikScore(countryDetail, metadata);
  }, [countryDetail, metadata]);

  /**
   * Skor KETERBUKAAN — formula terpusat dari kepuasanCalculator
   */
  const keterbukaanActualScore = useMemo(() => {
    return calculateKeterbukaanScore(countryDetail);
  }, [countryDetail]);

  const overallScore = kesejahteraan?.overallScore ?? 50;

  if (!isOpen || !kesejahteraan) return null;

  const countryName = selectedCountry?.country || "Indonesia";
  const status = getKesejahteraanStatus(overallScore);

  // Warna berdasarkan score (Command Center Dark Theme)
  const getScoreColor = (score: number) => {
    if (score >= 81) return { bg: 'bg-[#0F2424]', border: 'border-emerald-500/40', text: 'text-emerald-400', icon: 'text-emerald-400' };
    if (score >= 61) return { bg: 'bg-[#0F2424]', border: 'border-green-500/40', text: 'text-green-400', icon: 'text-green-400' };
    if (score >= 41) return { bg: 'bg-[#0F2424]', border: 'border-yellow-500/40', text: 'text-yellow-400', icon: 'text-yellow-400' };
    if (score >= 21) return { bg: 'bg-[#0F2424]', border: 'border-amber-500/40', text: 'text-amber-400', icon: 'text-amber-400' };
    return { bg: 'bg-[#0F2424]', border: 'border-rose-500/40', text: 'text-rose-400', icon: 'text-rose-400' };
  };

  const scoreColor = getScoreColor(overallScore);
  const pendidikanColor = getScoreColor(pendidikanActualScore);
  const kesehatanColor = getScoreColor(kesehatanActualScore);
  const tempatUmumColor = getScoreColor(infrastrukturActualScore);
  const penegakanHukumColor = getScoreColor(kesejahteraan.penegakanHukumScore);
  const panganColor = getScoreColor(panganActualScore);
  const hunianColor = getScoreColor(hunianActualScore);
  const listrikColor = getScoreColor(listrikActualScore);
  const keterbukaanColor = getScoreColor(keterbukaanActualScore);

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] shrink-0">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Indeks Kesejahteraan</h2>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sub-Header Tab Bar */}
        <div className="px-4 lg:px-6 py-2 lg:py-2.5 bg-[#0A1A1A] border-b border-[#00FFAA]/20 flex items-center justify-start shrink-0 relative z-10">
          <div className="flex items-center bg-[#0F2424] p-1 rounded-xl border border-[#00FFAA]/30">
            <button
              onClick={() => setActiveTab("statistik")}
              className={`px-3 lg:px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "statistik"
                  ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                  : "text-[#6B8A8A] hover:text-[#E0E0E0]"
              }`}
            >
              Statistik
            </button>
            <button
              onClick={() => setActiveTab("naikkan")}
              className={`px-3 lg:px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "naikkan"
                  ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                  : "text-[#6B8A8A] hover:text-[#E0E0E0]"
              }`}
            >
              Naikkan Kesejahteraan
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <div className="animate-in fade-in duration-500">
            {activeTab === "statistik" ? (
              <div className="space-y-6">
                {/* Main Score Card */}
                <div className="rounded-2xl p-8 border border-[#00FFAA]/30 bg-[#0F2424]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#6B8A8A] font-black uppercase tracking-wider mb-2">Indeks Kesejahteraan Keseluruhan</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-[#00FFAA]">{overallScore}</span>
                        <span className="text-lg font-bold text-[#6B8A8A]">/100</span>
                      </div>
                      <p className="text-sm font-black mt-2 text-[#00FFAA]">{status}</p>
                      <p className="text-[10px] text-[#6B8A8A] font-medium mt-1">Rata-rata 8 komponen layanan dan keterbukaan</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(kesejahteraan.trend)}
                      <span className="text-xs font-bold text-[#00FFAA] uppercase">{kesejahteraan.trend}</span>
                    </div>
                  </div>
                </div>

                {/* Interpretasi */}
                <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-6 rounded-2xl">
                  <h3 className="text-md font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5 text-[#00FFAA]" />
                    Interpretasi
                  </h3>
                  <p className="text-sm text-[#E0E0E0] font-medium leading-relaxed">
                    {overallScore >= 81 && (
                      <>Negara <span className="font-bold text-[#00FFAA]">{countryName}</span> memiliki indeks kesejahteraan yang <span className="text-emerald-400 font-bold">luar biasa baik</span>. Investasi dalam pendidikan, kesehatan, fasilitas publik, pangan, dan hunian telah menciptakan lingkungan yang sangat kondusif.</>
                    )}
                    {overallScore >= 61 && overallScore < 81 && (
                      <>Negara <span className="font-bold text-[#00FFAA]">{countryName}</span> memiliki indeks kesejahteraan yang <span className="text-emerald-400 font-bold">baik</span>. Infrastruktur dasar sudah memadai, namun masih ada ruang untuk peningkatan di beberapa sektor.</>
                    )}
                    {overallScore >= 41 && overallScore < 61 && (
                      <>Negara <span className="font-bold text-[#00FFAA]">{countryName}</span> memiliki indeks kesejahteraan yang <span className="text-yellow-400 font-bold">sedang</span>. Perlu perhatian lebih pada sektor‑sektor yang masih lemah untuk mencapai kualitas hidup yang lebih baik.</>
                    )}
                    {overallScore >= 21 && overallScore < 41 && (
                      <>Negara <span className="font-bold text-[#00FFAA]">{countryName}</span> memiliki indeks kesejahteraan yang <span className="text-amber-400 font-bold">buruk</span>. Investasi signifikan diperlukan di semua sektor untuk mengangkat kualitas hidup masyarakat.</>
                    )}
                    {overallScore < 21 && (
                      <>Negara <span className="font-bold text-[#00FFAA]">{countryName}</span> menghadapi <span className="text-rose-400 font-bold">krisis kesejahteraan</span>. Urgensi tinggi untuk membangun infrastruktur dasar di bidang pendidikan, kesehatan, fasilitas publik, pangan, dan perumahan.</>
                    )}
                  </p>
                </div>

                <div className="border-l-2 border-[#00FFAA]/40 pl-4 py-1">
                  <p className="text-xs text-[#9BB2B2] leading-relaxed">
                    Indeks ini merangkum pendidikan, kesehatan, fasilitas umum, kepolisian, pangan, listrik, hunian, dan keterbukaan, lalu menambahkan bonus serta mengurangi decay. Indeks kesejahteraan bukan pengali langsung populasi; beberapa sektor yang sama dapat memengaruhi kepuasan, coverage, atau faktor kesehatan secara tidak langsung.
                  </p>
                </div>

                {/* Breakdown Komponen */}
                <div className="space-y-4">
                  <h3 className="text-md font-black text-[#00FFAA] uppercase tracking-wider">Breakdown Sektor & Layanan Dasar</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => {
                        setActiveMenu?.("Menu:Kelistrikan");
                        onClose();
                      }}
                      className={`rounded-xl p-5 border-2 ${listrikColor.border} ${listrikColor.bg} space-y-3 cursor-pointer transition-all duration-200 hover:shadow-lg`}
                      title="Klik untuk membuka menu Kelistrikan"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Zap className={`h-5 w-5 ${listrikColor.icon}`} />
                          <div>
                            <p className="text-xs font-black text-[#6B8A8A] uppercase">Kelistrikan</p>
                            <p className="text-sm font-bold text-[#E0E0E0]">Cakupan pasokan</p>
                          </div>
                        </div>
                        <span className={`text-3xl font-black ${listrikColor.text}`}>{listrikActualScore}</span>
                      </div>
                      <p className="text-xs text-[#E0E0E0] font-semibold">
                        Indeks kecukupan listrik: <span className="font-black text-[#00FFAA]">{listrikActualScore}/100</span>
                      </p>
                    </div>

                    {/* Pendidikan - 35% */}
                    {(() => {
                      const pop = Number(countryDetail?.jumlah_penduduk) || 1;
                      const targetPendidikan = Math.ceil(pop * 0.0001);
                      const currentPendidikan = kesejahteraan?.detail?.pendidikan?.totalFacilities ?? 0;
                      const neededPendidikan = Math.max(0, targetPendidikan - currentPendidikan);

                      return (
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
                                <p className="text-xs font-black text-[#6B8A8A] uppercase">Pendidikan</p>
                                <p className="text-sm font-bold text-[#E0E0E0]">35% Bobot</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-3xl font-black ${pendidikanColor.text}`}>{pendidikanActualScore}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowPendidikanInfoModal(true);
                                }}
                                title="Lihat Informasi Efek Poin Pendidikan & Petunjuk Riset"
                                className="p-1.5 rounded-full bg-[#0A1A1A]/80 border border-[#00FFAA]/50 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer shadow-md flex items-center justify-center shrink-0"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1 text-xs text-[#E0E0E0] font-semibold">
                            <p>• Fasilitas Saat Ini: <span className="font-black text-[#00FFAA]">{currentPendidikan.toLocaleString("id-ID")}</span> unit</p>
                            <p>• Target Ideal (100%): <span className="font-black text-[#00FFAA]">{targetPendidikan.toLocaleString("id-ID")}</span> unit (1 per 10.000 jiwa)</p>
                            {neededPendidikan > 0 ? (
                              <p className="text-rose-400 bg-rose-500/10 p-1.5 rounded border border-rose-500/30 mt-1">
                                • Kebutuhan Tambahan: <span className="font-black">+{neededPendidikan.toLocaleString("id-ID")}</span> unit sekolah/kampus lagi untuk mencapai 100%
                              </p>
                            ) : (
                              <p className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/30 mt-1">
                                • Status: ✓ Fasilitas pendidikan sudah memenuhi target 100%
                              </p>
                            )}
                            <p className="pt-1 text-[11px] text-[#6B8A8A]">Mencakup: Prasekolah, SD, SMP, SMA, Universitas, Lembaga Pendidikan, Lab, Observatorium, Pusat Penelitian</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Kesehatan - 40% */}
                    {(() => {
                      const pop = Number(countryDetail?.jumlah_penduduk) || 1;
                      const targetKesehatan = Math.ceil(pop * 0.00004);
                      const currentKesehatan = kesejahteraan?.detail?.kesehatan?.totalFacilities ?? 0;
                      const neededKesehatan = Math.max(0, targetKesehatan - currentKesehatan);
                      const risikoWabahPercent = Math.max(0, Math.min(100, Math.round(100 - kesehatanActualScore)));

                      return (
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
                                <p className="text-xs font-black text-[#6B8A8A] uppercase">Kesehatan</p>
                                <p className="text-sm font-bold text-[#E0E0E0]">40% Bobot (Prioritas)</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-3xl font-black ${kesehatanColor.text}`}>{kesehatanActualScore}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowKesehatanInfoModal(true);
                                }}
                                title="Lihat Informasi Risiko Wabah & Detail Kesehatan"
                                className="p-1.5 rounded-full bg-[#0A1A1A]/80 border border-[#00FFAA]/50 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer shadow-md flex items-center justify-center shrink-0"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1 text-xs text-[#E0E0E0] font-semibold">
                            <p>• Skor Kepuasan Kesehatan: <span className="font-black text-[#00FFAA]">{kesehatanActualScore}/100</span></p>
                            <p>• Risiko Wabah Penyakit (Epidemi & Pandemi): <span className="font-black text-rose-400">{risikoWabahPercent}%</span></p>
                            <p>• Fasilitas Saat Ini: <span className="font-black text-[#00FFAA]">{currentKesehatan.toLocaleString("id-ID")}</span> unit</p>
                            <p>• Target Ideal (100%): <span className="font-black text-[#00FFAA]">{targetKesehatan.toLocaleString("id-ID")}</span> unit (1 per 25.000 jiwa)</p>
                            {neededKesehatan > 0 ? (
                              <p className="text-rose-400 bg-rose-500/10 p-1.5 rounded border border-rose-500/30 mt-1">
                                • Kebutuhan Tambahan: <span className="font-black">+{neededKesehatan.toLocaleString("id-ID")}</span> unit rumah sakit/pusat diagnosa lagi untuk mencapai 100%
                              </p>
                            ) : (
                              <p className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/30 mt-1">
                                • Status: ✓ Fasilitas kesehatan sudah memenuhi target 100%
                              </p>
                            )}
                            <p className="pt-1 text-[11px] text-[#6B8A8A]">Harapan Hidup: <span className="font-black text-[#00FFAA]">{kesejahteraan?.detail?.kesehatan?.detail?.harapanHidup?.toFixed(1) ?? "0.0"}</span> tahun | Indeks Kesehatan: {kesejahteraan?.detail?.kesehatan?.detail?.indeksKesehatan ?? 0}</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Infrastruktur dan transportasi - 25% */}
                    {(() => {
                      const pop = Number(countryDetail?.jumlah_penduduk) || 1;
                      const targetTempatUmum = Math.ceil(pop * 0.00005);
                      const currentTempatUmum = kesejahteraan?.detail?.tempatUmum?.totalFacilities ?? 0;
                      const neededTempatUmum = Math.max(0, targetTempatUmum - currentTempatUmum);

                      return (
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
                                <p className="text-xs font-black text-[#6B8A8A] uppercase">Infrastruktur & Transportasi</p>
                                <p className="text-sm font-bold text-[#E0E0E0]">25% Bobot</p>
                              </div>
                            </div>
                            <span className={`text-3xl font-black ${tempatUmumColor.text}`}>{infrastrukturActualScore}</span>
                          </div>
                          <div className="space-y-1 text-xs text-[#E0E0E0] font-semibold">
                            <p>• Fasilitas Saat Ini: <span className="font-black text-[#00FFAA]">{currentTempatUmum.toLocaleString("id-ID")}</span> unit</p>
                            <p>• Target Ideal (100%): <span className="font-black text-[#00FFAA]">{targetTempatUmum.toLocaleString("id-ID")}</span> unit (1 per 20.000 jiwa)</p>
                            {neededTempatUmum > 0 ? (
                              <p className="text-rose-400 bg-rose-500/10 p-1.5 rounded border border-rose-500/30 mt-1">
                                • Kebutuhan Tambahan: <span className="font-black">+{neededTempatUmum.toLocaleString("id-ID")}</span> unit sarana umum/transportasi lagi untuk mencapai 100%
                              </p>
                            ) : (
                              <p className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/30 mt-1">
                                • Status: ✓ Fasilitas tempat umum sudah memenuhi target 100%
                              </p>
                            )}
                            <p className="pt-1 text-[11px] text-[#6B8A8A]">Transportasi: {kesejahteraan?.detail?.tempatUmum?.detail?.transportasi ?? 0} | Rekreasi: {kesejahteraan?.detail?.tempatUmum?.detail?.rekreasi ?? 0}</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Penegakan Hukum & Kepolisian */}
                    {(() => {
                      const detail = kesejahteraan.detail.penegakanHukum;
                      const healthAndLawScore = (kesehatanActualScore + kesejahteraan.penegakanHukumScore) / 2;
                      const securityRiskPercent = Math.max(0, Math.min(100, Math.round(100 - healthAndLawScore)));

                      return (
                        <div
                          onClick={() => {
                            onOpenTempatUmum?.("penegakan_hukum");
                            if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum");
                            onClose();
                          }}
                          className={`rounded-xl p-5 border-2 ${penegakanHukumColor.border} ${penegakanHukumColor.bg} space-y-3 cursor-pointer transition-all duration-200 hover:shadow-lg`}
                          title="Klik untuk membuka tab Penegakan Hukum di Tempat Umum & Layanan Publik"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <ShieldCheck className={`h-5 w-5 ${penegakanHukumColor.icon}`} />
                              <div>
                                <p className="text-xs font-black text-[#6B8A8A] uppercase">Penegakan Hukum & Kepolisian</p>
                                <p className="text-sm font-bold text-[#E0E0E0]">Kepuasan Rakyat</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-3xl font-black ${penegakanHukumColor.text}`}>{kesejahteraan.penegakanHukumScore}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowPenegakanHukumInfoModal(true);
                                }}
                                title="Lihat Informasi Risiko Kriminalitas & Detail Penegakan Hukum"
                                className="p-1.5 rounded-full bg-[#0A1A1A]/80 border border-[#00FFAA]/50 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer shadow-md flex items-center justify-center shrink-0"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1 text-xs text-[#E0E0E0] font-semibold">
                            <p>• Skor Kepuasan Penegakan Hukum: <span className="font-black text-[#00FFAA]">{kesejahteraan.penegakanHukumScore}/100</span></p>
                            <p>• Risiko Keamanan (Peluang Kejahatan): <span className="font-black text-rose-400">{securityRiskPercent}%</span></p>
                            <p>• Fasilitas Saat Ini: <span className="font-black text-[#00FFAA]">{detail.totalFacilities.toLocaleString("id-ID")}</span> unit</p>
                            <p className="pt-1 text-[11px] text-[#6B8A8A]">Bantuan Hukum: {detail.detail.pusatBantuanHukum} | Pengadilan: {detail.detail.pengadilan} | Kejaksaan: {detail.detail.kejaksaan} | Pos Polisi: {detail.detail.posPolisi} | Akademi Polisi: {detail.detail.akademiPolisi}</p>
                          </div>
                        </div>
                      );
                    })()}

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
                            <p className="text-xs font-black text-[#6B8A8A] uppercase">Pangan</p>
                            <p className="text-sm font-bold text-[#E0E0E0]">Kepuasan Rakyat</p>
                          </div>
                        </div>
                        <span className={`text-3xl font-black ${panganColor.text}`}>{panganActualScore}</span>
                      </div>
                      <div className="space-y-1 text-xs text-[#E0E0E0] font-semibold">
                        <p>• Indeks Kepuasan Pangan: <span className="font-black text-[#00FFAA]">{panganActualScore}/100</span></p>
                        {panganActualScore < 100 ? (
                          <p className="text-rose-400 bg-rose-500/10 p-1.5 rounded border border-rose-500/30 mt-1">
                            • Kebutuhan Tambahan: Tingkatkan produksi industri pangan / pertanian untuk mencukupi konsumsi nasional 100%
                          </p>
                        ) : (
                          <p className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/30 mt-1">
                            • Status: ✓ Pasokan pangan nasional sudah terpenuhi 100%
                          </p>
                        )}
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
                            <p className="text-xs font-black text-[#6B8A8A] uppercase">Hunian & Permukiman</p>
                            <p className="text-sm font-bold text-[#E0E0E0]">Kepuasan Rakyat</p>
                          </div>
                        </div>
                        <span className={`text-3xl font-black ${hunianColor.text}`}>{hunianActualScore}</span>
                      </div>
                      <div className="space-y-1 text-xs text-[#E0E0E0] font-semibold">
                        <p>• Indeks Kepuasan Hunian: <span className="font-black text-[#00FFAA]">{hunianActualScore}/100</span></p>
                        {hunianActualScore < 100 ? (
                          <p className="text-rose-400 bg-rose-500/10 p-1.5 rounded border border-rose-500/30 mt-1">
                            • Kebutuhan Tambahan: Tambah proyek rumah subsidi & apartemen untuk menampung seluruh populasi 100%
                          </p>
                        ) : (
                          <p className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/30 mt-1">
                            • Status: ✓ Hunian rakyat telah menampung 100% populasi
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Doktrin & Keterbukaan */}
                    <div
                      onClick={() => {
                        setActiveMenu?.("Menu:DoktrinKeterbukaan");
                        onClose();
                      }}
                      className={`rounded-xl p-5 border-2 ${keterbukaanColor.border} ${keterbukaanColor.bg} space-y-3 cursor-pointer transition-all duration-200 hover:shadow-lg`}
                      title="Klik untuk membuka menu Doktrin & Keterbukaan Negara"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className={`h-5 w-5 ${keterbukaanColor.icon}`} />
                          <div>
                            <p className="text-xs font-black text-[#6B8A8A] uppercase">Doktrin & Keterbukaan</p>
                            <p className="text-sm font-bold text-[#E0E0E0]">Kebebasan & HAM</p>
                          </div>
                        </div>
                        <span className={`text-3xl font-black ${keterbukaanColor.text}`}>{keterbukaanActualScore}</span>
                      </div>
                      <div className="space-y-1 text-xs text-[#E0E0E0] font-semibold">
                        <p>• Indeks Keterbukaan: <span className="font-black text-[#00FFAA]">{keterbukaanActualScore}/100</span></p>
                        {keterbukaanActualScore < 100 ? (
                          <p className="text-rose-400 bg-rose-500/10 p-1.5 rounded border border-rose-500/30 mt-1">
                            • Kebutuhan Tambahan: Jamin kebebasan pers, internet bebas, transparansi APBN, & hak sipil untuk tingkatkan indeks
                          </p>
                        ) : (
                          <p className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/30 mt-1">
                            • Status: ✓ Jaminan kebebasan sipil & media negara sudah optimal 100%
                          </p>
                        )}
                      </div>
                    </div>
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

      {/* MODAL INFO EFEK POIN PENDIDIKAN & PENELITIAN */}
      {showPendidikanInfoModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl p-6 sm:p-8 overflow-y-auto custom-scrollbar"
          >
            <button
              onClick={() => setShowPendidikanInfoModal(false)}
              className="absolute top-4 right-4 p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
              title="Tutup Modal"
            >
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pr-16 border-b border-[#00FFAA]/20 pb-4">
              <div className="p-3 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/40 text-[#00FFAA] shrink-0 shadow-inner">
                <Library className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#00FFAA] uppercase tracking-wide leading-tight">
                  Pengaruh Poin Pendidikan Terhadap Penelitian
                </h3>
                <p className="text-xs sm:text-sm text-[#6B8A8A] font-semibold mt-1">
                  Detail Efek Kecepatan Riset & Panduan Strategis Pemain
                </p>
              </div>
            </div>

            {/* Content */}
            {(() => {
              const eduModifier = getEducationResearchModifier(pendidikanActualScore);
              return (
                <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
                  {/* Skor & Status Aktif Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30">
                      <span className="text-xs sm:text-sm font-bold text-[#E0E0E0]">Poin Pendidikan Saat Ini:</span>
                      <span className="text-2xl sm:text-3xl font-black text-amber-400">{pendidikanActualScore} / 100</span>
                    </div>

                    <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between ${
                      eduModifier.isPenalty
                        ? 'bg-[#2A141A] border-rose-500/50 text-rose-300'
                        : 'bg-[#0E2A20] border-emerald-500/50 text-emerald-300'
                    }`}>
                      <span>Pengaruh Waktu Riset:</span>
                      <span className="font-black text-base">{eduModifier.label}</span>
                    </div>
                  </div>

                  {/* Skala Efek */}
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-black text-[#00FFAA] uppercase tracking-wider">
                      Tabel Skala Poin Pendidikan & Efek Waktu Penelitian:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {[
                        { range: '0 - 25 Poin', effect: '+25% Waktu Penelitian', penalty: true, isCurrent: pendidikanActualScore <= 25 },
                        { range: '26 - 40 Poin', effect: '+20% Waktu Penelitian', penalty: true, isCurrent: pendidikanActualScore >= 26 && pendidikanActualScore <= 40 },
                        { range: '41 - 65 Poin', effect: '+15% Waktu Penelitian', penalty: true, isCurrent: pendidikanActualScore >= 41 && pendidikanActualScore <= 65 },
                        { range: '66 - 80 Poin', effect: '-5% Waktu Penelitian', penalty: false, isCurrent: pendidikanActualScore >= 66 && pendidikanActualScore <= 80 },
                        { range: '81 - 100 Poin', effect: '-10% Waktu Penelitian', penalty: false, isCurrent: pendidikanActualScore >= 81 },
                      ].map((tier, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            tier.isCurrent
                              ? tier.penalty
                                ? 'bg-rose-500/25 border-rose-500 text-rose-200 font-black shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                                : 'bg-emerald-500/25 border-emerald-500 text-emerald-200 font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                              : 'bg-[#0A1A1A] border-[#00FFAA]/10 text-[#6B8A8A]'
                          }`}
                        >
                          <span className="font-mono font-bold text-xs">{tier.range}</span>
                          <span className="text-xs font-bold">{tier.effect} {tier.isCurrent ? '★ (Aktif)' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Box Petunjuk & Panduan Tindakan */}
                  <div className="p-5 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30 space-y-3">
                    <p className="text-sm font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-2">
                      <Info className="w-5 h-5 text-[#00FFAA] shrink-0" />
                      Petunjuk & Panduan Tindakan Pemain:
                    </p>
                    {eduModifier.isPenalty ? (
                      <p className="text-xs sm:text-sm text-[#E0E0E0] font-medium leading-relaxed">
                        ⚠️ <span className="font-bold text-rose-400">Pendidikan Masih Rendah!</span> Poin pendidikan negara Anda saat ini (<span className="font-bold text-amber-400">{pendidikanActualScore}/100</span>) menyebabkan waktu penelitian bertambah <span className="font-bold text-rose-400">+{eduModifier.percentageChange}% lebih lambat</span>.
                        <br /><br />
                        💡 <span className="font-bold text-[#00FFAA]">Saran Tindakan:</span> Segera bangun fasilitas pendidikan seperti <span className="text-[#00FFAA] font-bold">Sekolah, Universitas, Lembaga Pendidikan, Lab, Observatorium, dan Pusat Penelitian</span> di menu <i>Tempat Umum & Layanan Publik</i> hingga poin pendidikan berada di atas <span className="font-bold text-emerald-400">65 poin</span> agar waktu penelitian teknologi Anda menjadi lebih cepat!
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-[#E0E0E0] font-medium leading-relaxed">
                        ✅ <span className="font-bold text-emerald-400">Pendidikan Sudah Baik!</span> Poin pendidikan negara Anda saat ini (<span className="font-bold text-amber-400">{pendidikanActualScore}/100</span>) memberikan bonus efisiensi waktu penelitian sebesar <span className="font-bold text-emerald-400">{eduModifier.percentageChange}% (lebih cepat)</span>.
                        <br /><br />
                        💡 <span className="font-bold text-[#00FFAA]">Saran Tindakan:</span> Pertahankan dan tingkatkan terus fasilitas pendidikan hingga mencapai <span className="font-bold text-emerald-400">81 - 100 poin</span> untuk memperoleh pengurangan waktu riset maksimal sebesar -10%!
                      </p>
                    )}
                  </div>

                  {/* Tombol Pintas Aksi */}
                  <button
                    onClick={() => {
                      setShowPendidikanInfoModal(false);
                      onOpenTempatUmum?.('pendidikan');
                      if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum");
                      onClose();
                    }}
                    className="w-full py-3 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#00FFAA]/80 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <Library className="w-5 h-5" />
                    Bangun Fasilitas Pendidikan Sekarang
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL INFO EFEK KESEHATAN & WABAH */}
      {showKesehatanInfoModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl p-6 sm:p-8 overflow-y-auto custom-scrollbar"
          >
            <button
              onClick={() => setShowKesehatanInfoModal(false)}
              className="absolute top-4 right-4 p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
              title="Tutup Modal"
            >
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pr-16 border-b border-[#00FFAA]/20 pb-4">
              <div className="p-3 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/40 text-[#00FFAA] shrink-0 shadow-inner">
                <Hospital className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#00FFAA] uppercase tracking-wide leading-tight">
                  Pengaruh Pelayanan Kesehatan Terhadap Negara
                </h3>
                <p className="text-xs sm:text-sm text-[#6B8A8A] font-semibold mt-1">
                  Detail Risiko Wabah Penyakit & Panduan Layanan Medis
                </p>
              </div>
            </div>

            {/* Content */}
            {(() => {
              const risikoWabahPercent = Math.max(0, Math.min(100, Math.round(100 - kesehatanActualScore)));
              const isPenalty = kesehatanActualScore <= 65;
              return (
                <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
                  {/* Skor & Risiko Wabah Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30">
                      <span className="text-xs sm:text-sm font-bold text-[#E0E0E0]">Skor Kepuasan Kesehatan:</span>
                      <span className="text-2xl sm:text-3xl font-black text-amber-400">{kesehatanActualScore} / 100</span>
                    </div>

                    <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between ${
                      isPenalty
                        ? 'bg-[#2A141A] border-rose-500/50 text-rose-300'
                        : 'bg-[#0E2A20] border-emerald-500/50 text-emerald-300'
                    }`}>
                      <span>Risiko Wabah Penyakit (Epidemi):</span>
                      <span className="font-black text-base">{risikoWabahPercent}%</span>
                    </div>
                  </div>

                  {/* Skala Tingkat Kesehatan */}
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-black text-[#00FFAA] uppercase tracking-wider">
                      Tabel Skala Kesehatan & Risiko Pandemi:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {[
                        { range: '0 - 25 Poin', effect: 'Kritis! Risiko Wabah 75-100%', penalty: true, isCurrent: kesehatanActualScore <= 25 },
                        { range: '26 - 40 Poin', effect: 'Tinggi! Risiko Wabah 60-74%', penalty: true, isCurrent: kesehatanActualScore >= 26 && kesehatanActualScore <= 40 },
                        { range: '41 - 65 Poin', effect: 'Sedang. Risiko Wabah 35-59%', penalty: true, isCurrent: kesehatanActualScore >= 41 && kesehatanActualScore <= 65 },
                        { range: '66 - 80 Poin', effect: 'Baik. Risiko Wabah 20-34%', penalty: false, isCurrent: kesehatanActualScore >= 66 && kesehatanActualScore <= 80 },
                        { range: '81 - 100 Poin', effect: 'Sangat Baik! Risiko Wabah 0-19%', penalty: false, isCurrent: kesehatanActualScore >= 81 },
                      ].map((tier, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            tier.isCurrent
                              ? tier.penalty
                                ? 'bg-rose-500/25 border-rose-500 text-rose-200 font-black shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                                : 'bg-emerald-500/25 border-emerald-500 text-emerald-200 font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                              : 'bg-[#0A1A1A] border-[#00FFAA]/10 text-[#6B8A8A]'
                          }`}
                        >
                          <span className="font-mono font-bold text-xs">{tier.range}</span>
                          <span className="text-xs font-bold">{tier.effect} {tier.isCurrent ? '★ (Aktif)' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Box Petunjuk & Panduan Tindakan */}
                  <div className="p-5 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30 space-y-3">
                    <p className="text-sm font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-2">
                      <Info className="w-5 h-5 text-[#00FFAA] shrink-0" />
                      Petunjuk & Panduan Tindakan Pemain:
                    </p>
                    {isPenalty ? (
                      <p className="text-xs sm:text-sm text-[#E0E0E0] font-medium leading-relaxed">
                        ⚠️ <span className="font-bold text-rose-400">Kesehatan Masyarakat Rentan!</span> Skor kesehatan negara Anda saat ini (<span className="font-bold text-amber-400">{kesehatanActualScore}/100</span>) berada di zona berisiko dengan tingkat potensi wabah sebesar <span className="font-bold text-rose-400">{risikoWabahPercent}%</span>.
                        <br /><br />
                        💡 <span className="font-bold text-[#00FFAA]">Saran Tindakan:</span> Segera bangun fasilitas kesehatan seperti <span className="text-[#00FFAA] font-bold">Puskesmas, Rumah Sakit, Klinik Diagnosa, Laboratorium Medis, dan Apotek</span> di menu <i>Tempat Umum & Layanan Publik</i> hingga skor mencapai di atas <span className="font-bold text-emerald-400">65 poin</span> untuk menekan ancaman wabah penyakit!
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-[#E0E0E0] font-medium leading-relaxed">
                        ✅ <span className="font-bold text-emerald-400">Pelayanan Kesehatan Baik!</span> Skor kesehatan negara Anda (<span className="font-bold text-amber-400">{kesehatanActualScore}/100</span>) mampu menjaga tingkat potensi wabah tetap rendah (<span className="font-bold text-emerald-400">{risikoWabahPercent}%</span>).
                        <br /><br />
                        💡 <span className="font-bold text-[#00FFAA]">Saran Tindakan:</span> Pertahankan dan tingkatkan terus ke <span className="font-bold text-emerald-400">81 - 100 poin</span> untuk menjamin imunitas masyarakat dan harapan hidup populasi maksimal.
                      </p>
                    )}
                  </div>

                  {/* Tombol Pintas Aksi */}
                  <button
                    onClick={() => {
                      setShowKesehatanInfoModal(false);
                      onOpenTempatUmum?.('kesehatan');
                      if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum");
                      onClose();
                    }}
                    className="w-full py-3 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#00FFAA]/80 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <Hospital className="w-5 h-5" />
                    Bangun Fasilitas Kesehatan Sekarang
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL INFO EFEK PENEGAKAN HUKUM & KEPOLISIAN */}
      {showPenegakanHukumInfoModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl p-6 sm:p-8 overflow-y-auto custom-scrollbar"
          >
            <button
              onClick={() => setShowPenegakanHukumInfoModal(false)}
              className="absolute top-4 right-4 p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
              title="Tutup Modal"
            >
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pr-16 border-b border-[#00FFAA]/20 pb-4">
              <div className="p-3 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/40 text-[#00FFAA] shrink-0 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#00FFAA] uppercase tracking-wide leading-tight">
                  Pengaruh Penegakan Hukum & Kepolisian
                </h3>
                <p className="text-xs sm:text-sm text-[#6B8A8A] font-semibold mt-1">
                  Detail Risiko Keamanan Kriminalitas & Panduan Hukum Nasional
                </p>
              </div>
            </div>

            {/* Content */}
            {(() => {
              const lawScore = kesejahteraan.penegakanHukumScore;
              const healthAndLawScore = (kesehatanActualScore + lawScore) / 2;
              const securityRiskPercent = Math.max(0, Math.min(100, Math.round(100 - healthAndLawScore)));
              const isPenalty = lawScore <= 65;
              return (
                <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
                  {/* Skor & Risiko Keamanan Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30">
                      <span className="text-xs sm:text-sm font-bold text-[#E0E0E0]">Skor Penegakan Hukum:</span>
                      <span className="text-2xl sm:text-3xl font-black text-amber-400">{lawScore} / 100</span>
                    </div>

                    <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between ${
                      isPenalty
                        ? 'bg-[#2A141A] border-rose-500/50 text-rose-300'
                        : 'bg-[#0E2A20] border-emerald-500/50 text-emerald-300'
                    }`}>
                      <span>Risiko Keamanan (Kriminalitas):</span>
                      <span className="font-black text-base">{securityRiskPercent}%</span>
                    </div>
                  </div>

                  {/* Skala Keamanan */}
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-black text-[#00FFAA] uppercase tracking-wider">
                      Tabel Skala Penegakan Hukum & Risiko Kejahatan:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {[
                        { range: '0 - 25 Poin', effect: 'Krisis! Kriminalitas Sangat Tinggi', penalty: true, isCurrent: lawScore <= 25 },
                        { range: '26 - 40 Poin', effect: 'Rawan! Kejahatan Meningkat', penalty: true, isCurrent: lawScore >= 26 && lawScore <= 40 },
                        { range: '41 - 65 Poin', effect: 'Sedang. Keamanan Perlu Ditingkatkan', penalty: true, isCurrent: lawScore >= 41 && lawScore <= 65 },
                        { range: '66 - 80 Poin', effect: 'Aman. Stabilitas Hukum Terjaga', penalty: false, isCurrent: lawScore >= 66 && lawScore <= 80 },
                        { range: '81 - 100 Poin', effect: 'Sangat Aman! Kriminalitas Minimal', penalty: false, isCurrent: lawScore >= 81 },
                      ].map((tier, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            tier.isCurrent
                              ? tier.penalty
                                ? 'bg-rose-500/25 border-rose-500 text-rose-200 font-black shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                                : 'bg-emerald-500/25 border-emerald-500 text-emerald-200 font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                              : 'bg-[#0A1A1A] border-[#00FFAA]/10 text-[#6B8A8A]'
                          }`}
                        >
                          <span className="font-mono font-bold text-xs">{tier.range}</span>
                          <span className="text-xs font-bold">{tier.effect} {tier.isCurrent ? '★ (Aktif)' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Box Petunjuk & Panduan Tindakan */}
                  <div className="p-5 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30 space-y-3">
                    <p className="text-sm font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-2">
                      <Info className="w-5 h-5 text-[#00FFAA] shrink-0" />
                      Petunjuk & Panduan Tindakan Pemain:
                    </p>
                    {isPenalty ? (
                      <p className="text-xs sm:text-sm text-[#E0E0E0] font-medium leading-relaxed">
                        ⚠️ <span className="font-bold text-rose-400">Penegakan Hukum Lemah!</span> Skor penegakan hukum & kepolisian saat ini (<span className="font-bold text-amber-400">{lawScore}/100</span>) memicu risiko kriminalitas sebesar <span className="font-bold text-rose-400">{securityRiskPercent}%</span>.
                        <br /><br />
                        💡 <span className="font-bold text-[#00FFAA]">Saran Tindakan:</span> Segera bangun sarana penegakan hukum seperti <span className="text-[#00FFAA] font-bold">Pos Polisi, Polsek, Polres, Pengadilan, Kejaksaan, dan Akademi Polisi</span> di menu <i>Tempat Umum & Layanan Publik</i> hingga skor mencapai di atas <span className="font-bold text-emerald-400">65 poin</span> untuk menciptakan ketertiban nasional!
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-[#E0E0E0] font-medium leading-relaxed">
                        ✅ <span className="font-bold text-emerald-400">Penegakan Hukum Baik!</span> Skor kepuasan hukum saat ini (<span className="font-bold text-amber-400">{lawScore}/100</span>) mampu menjaga tingkat ketertiban dan menekan risiko kriminalitas ke angka rendah (<span className="font-bold text-emerald-400">{securityRiskPercent}%</span>).
                        <br /><br />
                        💡 <span className="font-bold text-[#00FFAA]">Saran Tindakan:</span> Pertahankan dan tingkatkan ke <span className="font-bold text-emerald-400">81 - 100 poin</span> untuk mencapai stabilitas hukum dan keamanan publik yang sempurna.
                      </p>
                    )}
                  </div>

                  {/* Tombol Pintas Aksi */}
                  <button
                    onClick={() => {
                      setShowPenegakanHukumInfoModal(false);
                      onOpenTempatUmum?.('penegakan_hukum');
                      if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum");
                      onClose();
                    }}
                    className="w-full py-3 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#00FFAA]/80 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Bangun Sarana Penegakan Hukum Sekarang
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}