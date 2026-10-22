"use client"

import { useState, useMemo, useEffect } from "react";
import {
  X, Info, TrendingUp, TrendingDown, BookOpen, Heart, MapPin,
  Wheat, Home, Library, Hospital, Landmark, CheckCircle, Sprout, Globe, Zap, ShieldCheck,
  Minus, AlertTriangle, Lightbulb, CheckCircle2, Star
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
import { isMemberOfInterpol, getInterpolCrimeRiskModifier, isMemberOfWHO, getWHOPandemicRiskModifier } from "@/app/page/bonus_logic";
import {
  EPIDEMIC_BASE_CHANCE_PERCENT,
  PANDEMIC_BASE_CHANCE_PERCENT,
  getPandemicBaseChancePercentByYear,
} from "@/app/page/menus/inbox/logic/6_notifikasi_bencana/2_wabah_penyakit/wabahLogic";
import NaikkanKesejahteraanTab from "./NaikkanKesejahteraanTab";
import NotebookModalWrapper from "../../NotebookModalWrapper";

// ── Kelas CSS untuk Scrollbar (Tailwind Murni) ──
const scrollbarDark = `[&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0A1A1A] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-[#00FFAA]/20 [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#00FFAA] [&::-webkit-scrollbar-thumb]:to-[#00B37A] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#0A1A1A] [&::-webkit-scrollbar-thumb]:shadow-[0_0_10px_rgba(0,255,170,0.6)] hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-[#00FFAA] [&::-webkit-scrollbar-button]:hidden`;

const scrollbarInner = `[&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0F2424] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-[#00FFAA]/20 [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#00FFAA] [&::-webkit-scrollbar-thumb]:to-[#00B37A] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#0F2424] [&::-webkit-scrollbar-thumb]:shadow-[0_0_10px_rgba(0,255,170,0.6)] hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-[#00FFAA] [&::-webkit-scrollbar-button]:hidden`;

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
  const [activeTab, setActiveTab] = useState<"statistik" | "naikkan">("statistik");
  const [showPendidikanInfoModal, setShowPendidikanInfoModal] = useState(false);
  const [showKesehatanInfoModal, setShowKesehatanInfoModal] = useState(false);
  const [showPenegakanHukumInfoModal, setShowPenegakanHukumInfoModal] = useState(false);

  const [metadata, setMetadata] = useState<any>(null);
  useEffect(() => {
    if (!isOpen) return;
    fetchBuildingMetadata().then((data) => setMetadata(data || {}));
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab ?? "statistik");
    } else {
      setActiveTab("statistik");
    }
  }, [isOpen, initialTab]);

  const kesejahteraan = useMemo(() => {
    if (!countryDetail) return null;
    return calculateKesejahteraan(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const pendidikanActualScore = useMemo(() => {
    if (!countryDetail) return 0;
    const pop = Number(countryDetail.jumlah_penduduk) || 1;
    const keys = ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan"];
    const total = keys.reduce((s, k) => s + (Number(countryDetail[k]) || 0), 0);
    const index = total / pop;
    return Math.min(100, Math.round((index / 0.0001) * 100));
  }, [countryDetail]);

  const kesehatanActualScore = useMemo(() => {
    return calculateKesehatanScore(countryDetail);
  }, [countryDetail]);

  const infrastrukturActualScore = useMemo(() => {
    if (!countryDetail) return 0;
    const pop = Number(countryDetail.jumlah_penduduk) || 1;
    const keys = ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"];
    const total = keys.reduce((s, k) => s + (Number(countryDetail[k]) || 0), 0);
    const index = total / pop;
    return Math.min(100, Math.round((index / 0.00005) * 100));
  }, [countryDetail]);

  const panganActualScore = useMemo(() => {
    if (!countryDetail) return 1;
    const stored = countryDetail?.satisfaction?.food;
    if (!metadata || Object.keys(metadata).length === 0) return stored !== undefined && stored !== null ? Math.round(Number(stored)) : 0;
    return calculatePanganScore(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const hunianActualScore = useMemo(() => {
    if (!countryDetail) return 1;
    const stored = countryDetail?.satisfaction?.housing;
    if (!metadata || Object.keys(metadata).length === 0) return stored !== undefined && stored !== null ? Math.round(Number(stored)) : 0;
    return calculateHunianScore(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const listrikActualScore = useMemo(() => {
    if (!countryDetail) return 0;
    const stored = countryDetail?.satisfaction?.electricity;
    if (!metadata || Object.keys(metadata).length === 0) return stored !== undefined && stored !== null ? Math.round(Number(stored)) : 50;
    return calculateListrikScore(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const keterbukaanActualScore = useMemo(() => {
    return calculateKeterbukaanScore(countryDetail);
  }, [countryDetail]);

  const overallScore = kesejahteraan?.overallScore ?? 50;

  if (!isOpen || !kesejahteraan) return null;

  const countryName = selectedCountry?.country || "Indonesia";
  const status = getKesejahteraanStatus(overallScore);

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
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <>
      <NotebookModalWrapper onClose={onClose}>
        <div className="flex flex-col h-full overflow-hidden bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 shadow-[0_0_30px_rgba(0,255,170,0.15)]">
          {/* Header */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] shrink-0 shadow-[0_0_10px_rgba(0,255,170,0.2)]">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase drop-shadow-[0_0_8px_rgba(0,255,170,0.5)]">
                  Indeks Kesejahteraan
                </h2>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] hover:shadow-[0_0_15px_rgba(0,255,170,0.3)] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
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

          {/* Content (Scrollable) */}
          <div className={`flex-1 overflow-y-auto p-3 sm:p-5 bg-[#0A1A1A]/80 relative z-10 ${scrollbarDark}`}>
            <div className="animate-in fade-in duration-500">
              {activeTab === "statistik" ? (
                <div className="space-y-4 sm:space-y-5">
                  {/* Main Score Card */}
                  <div className="rounded-xl p-4 sm:p-5 border border-[#00FFAA]/30 bg-[#0F2424] shadow-[inset_0_0_20px_rgba(0,255,170,0.03)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFAA]/5 blur-3xl rounded-full pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-black uppercase tracking-wider mb-1">Indeks Kesejahteraan Keseluruhan</p>
                        <div className="flex items-baseline gap-2">
                          {/* Ukuran font diperkecil */}
                          <span className="text-3xl sm:text-4xl font-black text-[#00FFAA] tracking-tight drop-shadow-[0_0_10px_rgba(0,255,170,0.4)]">{overallScore}</span>
                          <span className="text-sm font-bold text-[#6B8A8A]">/100</span>
                        </div>
                        <p className="text-xs font-black mt-1 text-[#00FFAA] uppercase">{status}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-[#0A1A1A] px-2.5 py-1.5 rounded-lg border border-[#00FFAA]/20">
                        {getTrendIcon(kesejahteraan.trend)}
                        <span className="text-[10px] font-bold text-[#00FFAA] uppercase">{kesejahteraan.trend}</span>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Komponen */}
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1 h-3 bg-[#00FFAA] rounded-full inline-block"></span>
                      Breakdown Sektor & Layanan Dasar
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                      {/* Kelistrikan */}
                      <div
                        onClick={() => { setActiveMenu?.("Menu:Kelistrikan"); onClose(); }}
                        className={`rounded-xl p-3 sm:p-4 border ${listrikColor.border} ${listrikColor.bg} cursor-pointer transition-all duration-200 hover:bg-[#00FFAA]/5 hover:shadow-[0_0_15px_rgba(0,255,170,0.15)] group`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-[#0A1A1A] rounded-md border border-[#00FFAA]/30 group-hover:scale-110 transition-transform">
                              <Zap className={`h-3.5 w-3.5 ${listrikColor.icon}`} />
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0] uppercase">Kelistrikan</p>
                              <p className="text-[9px] sm:text-[10px] text-[#6B8A8A] font-medium">Cakupan pasokan</p>
                            </div>
                          </div>
                          <span className={`text-xl sm:text-2xl font-black ${listrikColor.text}`}>{listrikActualScore}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-[#E0E0E0] font-semibold bg-[#0A1A1A] p-1.5 rounded border border-[#00FFAA]/10">
                          Indeks kecukupan listrik: <span className="font-black text-[#00FFAA]">{listrikActualScore}/100</span>
                        </p>
                      </div>

                      {/* Pendidikan */}
                      {(() => {
                        const pop = Number(countryDetail?.jumlah_penduduk) || 1;
                        const targetPendidikan = Math.ceil(pop * 0.0001);
                        const currentPendidikan = kesejahteraan?.detail?.pendidikan?.totalFacilities ?? 0;
                        const neededPendidikan = Math.max(0, targetPendidikan - currentPendidikan);

                        return (
                          <div
                            onClick={() => { onOpenTempatUmum?.('pendidikan'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }}
                            className={`rounded-xl p-3 sm:p-4 border ${pendidikanColor.border} ${pendidikanColor.bg} cursor-pointer transition-all duration-200 hover:bg-[#00FFAA]/5 hover:shadow-[0_0_15px_rgba(0,255,170,0.15)] group`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-[#0A1A1A] rounded-md border border-[#00FFAA]/30 group-hover:scale-110 transition-transform">
                                  <Library className={`h-3.5 w-3.5 ${pendidikanColor.icon}`} />
                                </div>
                                <div>
                                  <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0] uppercase">Pendidikan</p>
                                  <p className="text-[9px] sm:text-[10px] text-[#6B8A8A] font-medium">35% Bobot</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xl sm:text-2xl font-black ${pendidikanColor.text}`}>{pendidikanActualScore}</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setShowPendidikanInfoModal(true); }}
                                  className="p-1 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/50 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all"
                                >
                                  <Info className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1 text-[10px] sm:text-xs text-[#E0E0E0] font-semibold bg-[#0A1A1A] p-1.5 rounded border border-[#00FFAA]/10">
                              <p>• Fasilitas: <span className="font-black text-[#00FFAA]">{currentPendidikan.toLocaleString("id-ID")}</span> unit</p>
                              <p>• Target: <span className="font-black text-[#00FFAA]">{targetPendidikan.toLocaleString("id-ID")}</span> unit</p>
                              {neededPendidikan > 0 ? (
                                <p className="text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/30 mt-1">
                                  • Kurang: <span className="font-black">+{neededPendidikan.toLocaleString("id-ID")}</span> unit
                                </p>
                              ) : (
                                <p className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/30 mt-1 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Target tercapai
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Kesehatan */}
                      {(() => {
                        const countryName = selectedCountry?.country || countryDetail?.country || "";
                        const whoModifier = getWHOPandemicRiskModifier(countryName, countryDetail);
                        const isWHOMember = isMemberOfWHO(countryName);
                        const currentDateStr = currentDate instanceof Date
                          ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
                          : typeof currentDate === 'string' ? currentDate : new Date().toISOString().slice(0, 10);
                        const pandemicBase = getPandemicBaseChancePercentByYear(countryDetail, currentDateStr);
                        const risikoEpidemiPercent = Math.max(0, EPIDEMIC_BASE_CHANCE_PERCENT + whoModifier);
                        const risikoPandemiPercent = Math.max(0, pandemicBase + whoModifier);

                        return (
                          <div
                            onClick={() => { onOpenTempatUmum?.('kesehatan'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }}
                            className={`rounded-xl p-3 sm:p-4 border ${kesehatanColor.border} ${kesehatanColor.bg} cursor-pointer transition-all duration-200 hover:bg-[#00FFAA]/5 hover:shadow-[0_0_15px_rgba(0,255,170,0.15)] group`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-[#0A1A1A] rounded-md border border-[#00FFAA]/30 group-hover:scale-110 transition-transform">
                                  <Hospital className={`h-3.5 w-3.5 ${kesehatanColor.icon}`} />
                                </div>
                                <div>
                                  <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0] uppercase">Kesehatan</p>
                                  <p className="text-[9px] sm:text-[10px] text-[#6B8A8A] font-medium">40% Bobot</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xl sm:text-2xl font-black ${kesehatanColor.text}`}>{kesehatanActualScore}</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setShowKesehatanInfoModal(true); }}
                                  className="p-1 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/50 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all"
                                >
                                  <Info className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1 text-[10px] sm:text-xs text-[#E0E0E0] font-semibold bg-[#0A1A1A] p-1.5 rounded border border-[#00FFAA]/10">
                              <p>• Skor: <span className="font-black text-[#00FFAA]">{kesehatanActualScore}/100</span></p>
                              <div className="flex items-center gap-1 flex-wrap">
                                <p>• Epidemi: <span className="font-black text-rose-400">{risikoEpidemiPercent}%</span></p>
                                <p>• Pandemi: <span className="font-black text-rose-400">{risikoPandemiPercent}%</span></p>
                                {isWHOMember && (
                                  <span className="px-1 py-0.5 text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/50 rounded">WHO -5%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Infrastruktur */}
                      <div
                        onClick={() => { onOpenTempatUmum?.('infrastruktur'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }}
                        className={`rounded-xl p-3 sm:p-4 border ${tempatUmumColor.border} ${tempatUmumColor.bg} cursor-pointer transition-all duration-200 hover:bg-[#00FFAA]/5 hover:shadow-[0_0_15px_rgba(0,255,170,0.15)] group`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-[#0A1A1A] rounded-md border border-[#00FFAA]/30 group-hover:scale-110 transition-transform">
                              <Landmark className={`h-3.5 w-3.5 ${tempatUmumColor.icon}`} />
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0] uppercase">Infrastruktur</p>
                              <p className="text-[9px] sm:text-[10px] text-[#6B8A8A] font-medium">25% Bobot</p>
                            </div>
                          </div>
                          <span className={`text-xl sm:text-2xl font-black ${tempatUmumColor.text}`}>{infrastrukturActualScore}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-[#E0E0E0] font-semibold bg-[#0A1A1A] p-1.5 rounded border border-[#00FFAA]/10">
                          Skor transportasi & infrastruktur: <span className="font-black text-[#00FFAA]">{infrastrukturActualScore}/100</span>
                        </p>
                      </div>

                      {/* Penegakan Hukum */}
                      {(() => {
                        const lawScore = kesejahteraan.penegakanHukumScore;
                        const healthAndLawScore = (kesehatanActualScore + lawScore) / 2;
                        const baseSecurityRisk = Math.max(0, Math.min(100, Math.round(100 - healthAndLawScore)));
                        const countryName = selectedCountry?.country || countryDetail?.country || "";
                        const interpolModifier = getInterpolCrimeRiskModifier(countryName, countryDetail);
                        const isInterpolMember = isMemberOfInterpol(countryName);
                        const securityRiskPercent = Math.max(0, Math.min(100, baseSecurityRisk + interpolModifier));

                        return (
                          <div
                            onClick={() => { onOpenTempatUmum?.("penegakan_hukum"); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }}
                            className={`rounded-xl p-3 sm:p-4 border ${penegakanHukumColor.border} ${penegakanHukumColor.bg} cursor-pointer transition-all duration-200 hover:bg-[#00FFAA]/5 hover:shadow-[0_0_15px_rgba(0,255,170,0.15)] group`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-[#0A1A1A] rounded-md border border-[#00FFAA]/30 group-hover:scale-110 transition-transform">
                                  <ShieldCheck className={`h-3.5 w-3.5 ${penegakanHukumColor.icon}`} />
                                </div>
                                <div>
                                  <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0] uppercase">Penegakan Hukum</p>
                                  <p className="text-[9px] sm:text-[10px] text-[#6B8A8A] font-medium">Kepuasan Rakyat</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xl sm:text-2xl font-black ${penegakanHukumColor.text}`}>{lawScore}</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setShowPenegakanHukumInfoModal(true); }}
                                  className="p-1 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/50 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all"
                                >
                                  <Info className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1 text-[10px] sm:text-xs text-[#E0E0E0] font-semibold bg-[#0A1A1A] p-1.5 rounded border border-[#00FFAA]/10">
                              <p>• Skor Hukum: <span className="font-black text-[#00FFAA]">{lawScore}/100</span></p>
                              <div className="flex items-center gap-1 flex-wrap">
                                <p>• Risiko Kriminal: <span className="font-black text-rose-400">{securityRiskPercent}%</span></p>
                                {isInterpolMember && (
                                  <span className="px-1 py-0.5 text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/50 rounded">Interpol -5%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Pangan */}
                      <div
                        onClick={() => { onOpenIndustriPangan ? onOpenIndustriPangan() : setActiveMenu?.("Menu:IndustriPangan"); onClose(); }}
                        className={`rounded-xl p-3 sm:p-4 border ${panganColor.border} ${panganColor.bg} cursor-pointer transition-all duration-200 hover:bg-[#00FFAA]/5 hover:shadow-[0_0_15px_rgba(0,255,170,0.15)] group`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-[#0A1A1A] rounded-md border border-[#00FFAA]/30 group-hover:scale-110 transition-transform">
                              <Wheat className={`h-3.5 w-3.5 ${panganColor.icon}`} />
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0] uppercase">Pangan</p>
                              <p className="text-[9px] sm:text-[10px] text-[#6B8A8A] font-medium">Kepuasan Rakyat</p>
                            </div>
                          </div>
                          <span className={`text-xl sm:text-2xl font-black ${panganColor.text}`}>{panganActualScore}</span>
                        </div>
                        <div className="space-y-1 text-[10px] sm:text-xs text-[#E0E0E0] font-semibold bg-[#0A1A1A] p-1.5 rounded border border-[#00FFAA]/10">
                          <p>• Indeks: <span className="font-black text-[#00FFAA]">{panganActualScore}/100</span></p>
                          {panganActualScore < 100 ? (
                            <p className="text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/30 mt-1">Tingkatkan produksi pangan</p>
                          ) : (
                            <p className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/30 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Terpenuhi 100%</p>
                          )}
                        </div>
                      </div>

                      {/* Hunian */}
                      <div
                        onClick={() => { setActiveMenu?.("Menu:HunianPermukiman"); onClose(); }}
                        className={`rounded-xl p-3 sm:p-4 border ${hunianColor.border} ${hunianColor.bg} cursor-pointer transition-all duration-200 hover:bg-[#00FFAA]/5 hover:shadow-[0_0_15px_rgba(0,255,170,0.15)] group`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-[#0A1A1A] rounded-md border border-[#00FFAA]/30 group-hover:scale-110 transition-transform">
                              <Home className={`h-3.5 w-3.5 ${hunianColor.icon}`} />
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0] uppercase">Hunian</p>
                              <p className="text-[9px] sm:text-[10px] text-[#6B8A8A] font-medium">Kepuasan Rakyat</p>
                            </div>
                          </div>
                          <span className={`text-xl sm:text-2xl font-black ${hunianColor.text}`}>{hunianActualScore}</span>
                        </div>
                        <div className="space-y-1 text-[10px] sm:text-xs text-[#E0E0E0] font-semibold bg-[#0A1A1A] p-1.5 rounded border border-[#00FFAA]/10">
                          <p>• Indeks: <span className="font-black text-[#00FFAA]">{hunianActualScore}/100</span></p>
                          {hunianActualScore < 100 ? (
                            <p className="text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/30 mt-1">Tambah rumah subsidi</p>
                          ) : (
                            <p className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/30 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Terpenuhi 100%</p>
                          )}
                        </div>
                      </div>

                      {/* Doktrin & Keterbukaan */}
                      <div
                        onClick={() => { setActiveMenu?.("Menu:DoktrinKeterbukaan"); onClose(); }}
                        className={`rounded-xl p-3 sm:p-4 border ${keterbukaanColor.border} ${keterbukaanColor.bg} cursor-pointer transition-all duration-200 hover:bg-[#00FFAA]/5 hover:shadow-[0_0_15px_rgba(0,255,170,0.15)] group`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-[#0A1A1A] rounded-md border border-[#00FFAA]/30 group-hover:scale-110 transition-transform">
                              <Globe className={`h-3.5 w-3.5 ${keterbukaanColor.icon}`} />
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs font-black text-[#E0E0E0] uppercase">Keterbukaan</p>
                              <p className="text-[9px] sm:text-[10px] text-[#6B8A8A] font-medium">HAM & Kebebasan</p>
                            </div>
                          </div>
                          <span className={`text-xl sm:text-2xl font-black ${keterbukaanColor.text}`}>{keterbukaanActualScore}</span>
                        </div>
                        <div className="space-y-1 text-[10px] sm:text-xs text-[#E0E0E0] font-semibold bg-[#0A1A1A] p-1.5 rounded border border-[#00FFAA]/10">
                          <p>• Indeks: <span className="font-black text-[#00FFAA]">{keterbukaanActualScore}/100</span></p>
                          {keterbukaanActualScore < 100 ? (
                            <p className="text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/30 mt-1">Jamin kebebasan pers</p>
                          ) : (
                            <p className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/30 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Optimal 100%</p>
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
      </NotebookModalWrapper>

      {/* MODAL INFO EFEK POIN PENDIDIKAN */}
      {showPendidikanInfoModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-2xl lg:max-w-[700px] h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans shadow-2xl p-4 sm:p-5 overflow-y-auto pointer-events-auto ${scrollbarInner}`}
          >
            <button
              onClick={() => setShowPendidikanInfoModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pr-16 border-b border-[#00FFAA]/20 pb-3">
              <div className="p-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/40 text-[#00FFAA] shrink-0 shadow-inner">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#00FFAA] uppercase tracking-wide leading-tight">Pengaruh Poin Pendidikan</h3>
                <p className="text-[10px] text-[#6B8A8A] font-semibold mt-0.5">Efek Kecepatan Riset & Panduan Strategis</p>
              </div>
            </div>

            {(() => {
              const eduModifier = getEducationResearchModifier(pendidikanActualScore);
              return (
                <div className="space-y-3 flex-1 pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/30">
                      <span className="text-[10px] font-bold text-[#E0E0E0]">Poin Saat Ini:</span>
                      <span className="text-sm font-black text-amber-400">{pendidikanActualScore} / 100</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-[10px] font-bold flex items-center justify-between ${eduModifier.isPenalty ? 'bg-[#2A141A] border-rose-500/50 text-rose-300' : 'bg-[#0E2A20] border-emerald-500/50 text-emerald-300'}`}>
                      <span>Waktu Riset:</span>
                      <span className="font-black text-xs">{eduModifier.label}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Skala Efek:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        { range: '0-25', effect: '+25% Waktu', penalty: true, isCurrent: pendidikanActualScore <= 25 },
                        { range: '26-40', effect: '+20% Waktu', penalty: true, isCurrent: pendidikanActualScore >= 26 && pendidikanActualScore <= 40 },
                        { range: '41-65', effect: '+15% Waktu', penalty: true, isCurrent: pendidikanActualScore >= 41 && pendidikanActualScore <= 65 },
                        { range: '66-80', effect: '-5% Waktu', penalty: false, isCurrent: pendidikanActualScore >= 66 && pendidikanActualScore <= 80 },
                        { range: '81-100', effect: '-10% Waktu', penalty: false, isCurrent: pendidikanActualScore >= 81 },
                      ].map((tier, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-2 rounded-lg border text-[10px] transition-all ${tier.isCurrent ? (tier.penalty ? 'bg-rose-500/25 border-rose-500 text-rose-200 font-black' : 'bg-emerald-500/25 border-emerald-500 text-emerald-200 font-black') : 'bg-[#0A1A1A] border-[#00FFAA]/10 text-[#6B8A8A]'}`}>
                          <span className="font-mono font-bold text-[9px]">{tier.range} Poin</span>
                          <span className="font-bold flex items-center gap-1">{tier.effect} {tier.isCurrent && <Star className="w-2.5 h-2.5 fill-current" />}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/30 space-y-1.5">
                    <p className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-1"><Info className="w-3 h-3" /> Petunjuk:</p>
                    {eduModifier.isPenalty ? (
                      <div className="text-[10px] text-[#E0E0E0] font-medium leading-relaxed space-y-1">
                        <p className="flex items-start gap-1 text-rose-400"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Pendidikan rendah! Waktu riset +{eduModifier.percentageChange}% lebih lambat.</span></p>
                        <p className="flex items-start gap-1 text-[#00FFAA]"><Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Segera bangun fasilitas hingga skor &gt;65 poin!</span></p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#E0E0E0] font-medium leading-relaxed space-y-1">
                        <p className="flex items-start gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Pendidikan baik! Efisiensi riset {eduModifier.percentageChange}%.</span></p>
                        <p className="flex items-start gap-1 text-[#00FFAA]"><Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Tingkatkan ke 81-100 poin untuk maksimal.</span></p>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setShowPendidikanInfoModal(false); onOpenTempatUmum?.('pendidikan'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }} className="w-full py-2 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-[10px] uppercase tracking-wider hover:bg-[#00FFAA]/80 hover:shadow-[0_0_15px_rgba(0,255,170,0.4)] transition-all flex items-center justify-center gap-1.5">
                    <Library className="w-4 h-4" /> Bangun Fasilitas Pendidikan
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL INFO KESEHATAN */}
      {showKesehatanInfoModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-2xl lg:max-w-[700px] h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans shadow-2xl p-4 sm:p-5 overflow-y-auto pointer-events-auto ${scrollbarInner}`}
          >
            <button onClick={() => setShowKesehatanInfoModal(false)} className="absolute top-4 right-4 p-1.5 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
              <span className="text-[10px] font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pr-16 border-b border-[#00FFAA]/20 pb-3">
              <div className="p-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/40 text-[#00FFAA] shrink-0 shadow-inner">
                <Hospital className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#00FFAA] uppercase tracking-wide leading-tight">Pengaruh Pelayanan Kesehatan</h3>
                <p className="text-[10px] text-[#6B8A8A] font-semibold mt-0.5">Risiko Wabah & Panduan Layanan Medis</p>
              </div>
            </div>

            {(() => {
              const countryName = selectedCountry?.country || countryDetail?.country || "";
              const whoModifier = getWHOPandemicRiskModifier(countryName, countryDetail);
              const isWHOMember = isMemberOfWHO(countryName);
              const currentDateStr = currentDate instanceof Date ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}` : typeof currentDate === 'string' ? currentDate : new Date().toISOString().slice(0, 10);
              const pandemicBase = getPandemicBaseChancePercentByYear(countryDetail, currentDateStr);
              const risikoEpidemiPercent = Math.max(0, EPIDEMIC_BASE_CHANCE_PERCENT + whoModifier);
              const risikoPandemiPercent = Math.max(0, pandemicBase + whoModifier);
              const isPenalty = kesehatanActualScore <= 65;
              
              return (
                <div className="space-y-3 flex-1 pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/30">
                      <span className="text-[10px] font-bold text-[#E0E0E0]">Skor Saat Ini:</span>
                      <span className="text-sm font-black text-amber-400">{kesehatanActualScore} / 100</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-[10px] font-bold flex items-center justify-between ${isPenalty ? 'bg-[#2A141A] border-rose-500/50 text-rose-300' : 'bg-[#0E2A20] border-emerald-500/50 text-emerald-300'}`}>
                      <div className="space-y-0.5">
                        <p className="flex justify-between gap-2"><span>Epidemi:</span><span className="font-black">{risikoEpidemiPercent}%</span></p>
                        <p className="flex justify-between gap-2"><span>Pandemi:</span><span className="font-black">{risikoPandemiPercent}%</span></p>
                      </div>
                      {isWHOMember && <span className="ml-2 px-1.5 py-0.5 text-[8px] font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/60 rounded">WHO -5%</span>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Skala Kesehatan & Wabah:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        { range: '0-25', effect: 'Kritis! 75-100%', penalty: true, isCurrent: kesehatanActualScore <= 25 },
                        { range: '26-40', effect: 'Tinggi! 60-74%', penalty: true, isCurrent: kesehatanActualScore >= 26 && kesehatanActualScore <= 40 },
                        { range: '41-65', effect: 'Sedang. 35-59%', penalty: true, isCurrent: kesehatanActualScore >= 41 && kesehatanActualScore <= 65 },
                        { range: '66-80', effect: 'Baik. 20-34%', penalty: false, isCurrent: kesehatanActualScore >= 66 && kesehatanActualScore <= 80 },
                        { range: '81-100', effect: 'Sangat Baik! 0-19%', penalty: false, isCurrent: kesehatanActualScore >= 81 },
                      ].map((tier, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-2 rounded-lg border text-[10px] transition-all ${tier.isCurrent ? (tier.penalty ? 'bg-rose-500/25 border-rose-500 text-rose-200 font-black' : 'bg-emerald-500/25 border-emerald-500 text-emerald-200 font-black') : 'bg-[#0A1A1A] border-[#00FFAA]/10 text-[#6B8A8A]'}`}>
                          <span className="font-mono font-bold text-[9px]">{tier.range} Poin</span>
                          <span className="font-bold flex items-center gap-1">{tier.effect} {tier.isCurrent && <Star className="w-2.5 h-2.5 fill-current" />}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/30 space-y-1.5">
                    <p className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-1"><Info className="w-3 h-3" /> Petunjuk:</p>
                    {isPenalty ? (
                      <div className="text-[10px] text-[#E0E0E0] font-medium leading-relaxed space-y-1">
                        <p className="flex items-start gap-1 text-rose-400"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Kesehatan Rentan! Risiko wabah tinggi.</span></p>
                        <p className="flex items-start gap-1 text-[#00FFAA]"><Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Bangun fasilitas kesehatan &gt;65 poin.</span></p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#E0E0E0] font-medium leading-relaxed space-y-1">
                        <p className="flex items-start gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Kesehatan Baik! Risiko wabah rendah.</span></p>
                        <p className="flex items-start gap-1 text-[#00FFAA]"><Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Pertahankan & capai 81-100 poin.</span></p>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setShowKesehatanInfoModal(false); onOpenTempatUmum?.('kesehatan'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }} className="w-full py-2 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-[10px] uppercase tracking-wider hover:bg-[#00FFAA]/80 hover:shadow-[0_0_15px_rgba(0,255,170,0.4)] transition-all flex items-center justify-center gap-1.5">
                    <Hospital className="w-4 h-4" /> Bangun Fasilitas Kesehatan
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL INFO PENEGAKAN HUKUM */}
      {showPenegakanHukumInfoModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-2xl lg:max-w-[700px] h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans shadow-2xl p-4 sm:p-5 overflow-y-auto pointer-events-auto ${scrollbarInner}`}
          >
            <button onClick={() => setShowPenegakanHukumInfoModal(false)} className="absolute top-4 right-4 p-1.5 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
              <span className="text-[10px] font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pr-16 border-b border-[#00FFAA]/20 pb-3">
              <div className="p-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/40 text-[#00FFAA] shrink-0 shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#00FFAA] uppercase tracking-wide leading-tight">Pengaruh Penegakan Hukum</h3>
                <p className="text-[10px] text-[#6B8A8A] font-semibold mt-0.5">Risiko Kriminalitas & Panduan Hukum</p>
              </div>
            </div>

            {(() => {
              const lawScore = kesejahteraan.penegakanHukumScore;
              const healthAndLawScore = (kesehatanActualScore + lawScore) / 2;
              const baseSecurityRisk = Math.max(0, Math.min(100, Math.round(100 - healthAndLawScore)));
              const countryName = selectedCountry?.country || countryDetail?.country || "";
              const interpolModifier = getInterpolCrimeRiskModifier(countryName, countryDetail);
              const isInterpolMember = isMemberOfInterpol(countryName);
              const securityRiskPercent = Math.max(0, Math.min(100, baseSecurityRisk + interpolModifier));
              const isPenalty = lawScore <= 65;
              
              return (
                <div className="space-y-3 flex-1 pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/30">
                      <span className="text-[10px] font-bold text-[#E0E0E0]">Skor Saat Ini:</span>
                      <span className="text-sm font-black text-amber-400">{lawScore} / 100</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-[10px] font-bold flex items-center justify-between ${isPenalty ? 'bg-[#2A141A] border-rose-500/50 text-rose-300' : 'bg-[#0E2A20] border-emerald-500/50 text-emerald-300'}`}>
                      <span>Risiko Kriminal:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs">{securityRiskPercent}%</span>
                        {isInterpolMember && <span className="px-1 py-0.5 text-[8px] font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/60 rounded">Interpol -5%</span>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Skala Penegakan Hukum:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        { range: '0-25', effect: 'Krisis! Kriminal Tinggi', penalty: true, isCurrent: lawScore <= 25 },
                        { range: '26-40', effect: 'Rawan! Meningkat', penalty: true, isCurrent: lawScore >= 26 && lawScore <= 40 },
                        { range: '41-65', effect: 'Sedang. Perlu Ditingkatkan', penalty: true, isCurrent: lawScore >= 41 && lawScore <= 65 },
                        { range: '66-80', effect: 'Aman. Stabil', penalty: false, isCurrent: lawScore >= 66 && lawScore <= 80 },
                        { range: '81-100', effect: 'Sangat Aman! Minimal', penalty: false, isCurrent: lawScore >= 81 },
                      ].map((tier, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-2 rounded-lg border text-[10px] transition-all ${tier.isCurrent ? (tier.penalty ? 'bg-rose-500/25 border-rose-500 text-rose-200 font-black' : 'bg-emerald-500/25 border-emerald-500 text-emerald-200 font-black') : 'bg-[#0A1A1A] border-[#00FFAA]/10 text-[#6B8A8A]'}`}>
                          <span className="font-mono font-bold text-[9px]">{tier.range} Poin</span>
                          <span className="font-bold flex items-center gap-1">{tier.effect} {tier.isCurrent && <Star className="w-2.5 h-2.5 fill-current" />}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/30 space-y-1.5">
                    <p className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-1"><Info className="w-3 h-3" /> Petunjuk:</p>
                    {isPenalty ? (
                      <div className="text-[10px] text-[#E0E0E0] font-medium leading-relaxed space-y-1">
                        <p className="flex items-start gap-1 text-rose-400"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Hukum Lemah! Kriminalitas tinggi.</span></p>
                        <p className="flex items-start gap-1 text-[#00FFAA]"><Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Bangun Pos Polisi, Pengadilan, dll &gt;65 poin.</span></p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#E0E0E0] font-medium leading-relaxed space-y-1">
                        <p className="flex items-start gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Hukum Baik! Risiko kriminal rendah.</span></p>
                        <p className="flex items-start gap-1 text-[#00FFAA]"><Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Pertahankan & capai 81-100 poin.</span></p>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setShowPenegakanHukumInfoModal(false); onOpenTempatUmum?.('penegakan_hukum'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }} className="w-full py-2 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-[10px] uppercase tracking-wider hover:bg-[#00FFAA]/80 hover:shadow-[0_0_15px_rgba(0,255,170,0.4)] transition-all flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Bangun Sarana Hukum
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}