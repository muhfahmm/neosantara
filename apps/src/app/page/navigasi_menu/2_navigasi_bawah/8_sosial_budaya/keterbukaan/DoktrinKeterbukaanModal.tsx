import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Globe,
  Lock,
  Unlock,
  Shield,
  Radio,
  TrendingUp,
  CheckCircle2,
  Sliders,
  Plane,
  ShoppingBag,
  HeartHandshake,
  MessageSquare,
  BookOpen,
  Users,
  Eye,
  Tv,
  Wifi,
} from "lucide-react";

import { getDoktrinKeterbukaan } from "@/../../json/database_doktrin_keterbukaan/index";

interface DoktrinKeterbukaanModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  setCountryDetail?: (detail: any) => void;
  selectedCountry?: any;
}

export default function DoktrinKeterbukaanModal({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
  selectedCountry,
}: DoktrinKeterbukaanModalProps) {
  const [mounted, setMounted] = useState(false);
  const countryName = selectedCountry?.country || countryDetail?.nama_negara || countryDetail?.country || "Negara";
  const initialData = getDoktrinKeterbukaan(countryName) || {};

  // --- 1. KEBEBASAN SIPIL & HAM ---
  const [speechScore, setSpeechScore] = useState<number>(countryDetail?.speechScore ?? initialData.speechScore ?? 50);
  const [religionScore, setReligionScore] = useState<number>(countryDetail?.religionScore ?? initialData.religionScore ?? 60);
  const [demoScore, setDemoScore] = useState<number>(countryDetail?.demoScore ?? initialData.demoScore ?? 45);
  const [transparencyScore, setTransparencyScore] = useState<number>(countryDetail?.transparencyScore ?? initialData.transparencyScore ?? 55);

  // --- 2. MEDIA & INFORMASI ---
  const [mediaScore, setMediaScore] = useState<number>(countryDetail?.mediaScore ?? initialData.mediaScore ?? 50);
  const [internetScore, setInternetScore] = useState<number>(countryDetail?.internetScore ?? initialData.internetScore ?? 60);

  // --- 3. PERBATASAN & GEOPOLITIK ---
  const [borderScore, setBorderScore] = useState<number>(countryDetail?.borderScore ?? initialData.borderScore ?? 40);
  const [tradeScore, setTradeScore] = useState<number>(countryDetail?.tradeScore ?? initialData.tradeScore ?? 60);
  const [diplomacyScore, setDiplomacyScore] = useState<number>(countryDetail?.diplomacyScore ?? initialData.diplomacyScore ?? 55);

  const [activeTab, setActiveTab] = useState<"civil" | "media" | "global">("civil");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const dbData = getDoktrinKeterbukaan(countryName) || {};
    setSpeechScore(countryDetail?.speechScore ?? dbData.speechScore ?? 50);
    setReligionScore(countryDetail?.religionScore ?? dbData.religionScore ?? 60);
    setDemoScore(countryDetail?.demoScore ?? dbData.demoScore ?? 45);
    setTransparencyScore(countryDetail?.transparencyScore ?? dbData.transparencyScore ?? 55);
    setMediaScore(countryDetail?.mediaScore ?? dbData.mediaScore ?? 50);
    setInternetScore(countryDetail?.internetScore ?? dbData.internetScore ?? 60);
    setBorderScore(countryDetail?.borderScore ?? dbData.borderScore ?? 40);
    setTradeScore(countryDetail?.tradeScore ?? dbData.tradeScore ?? 60);
    setDiplomacyScore(countryDetail?.diplomacyScore ?? dbData.diplomacyScore ?? 55);
  }, [isOpen, countryName]);

  if (!isOpen || !mounted) return null;

  // Rata-rata skor dari 9 indikator
  const overallScore = Math.round(
    (speechScore +
      religionScore +
      demoScore +
      transparencyScore +
      mediaScore +
      internetScore +
      borderScore +
      tradeScore +
      diplomacyScore) /
      9
  );

  // Status Rezim berdasarkan skor
  const getRegimeStatus = (score: number) => {
    if (score <= 20) {
      return {
        label: "Negara Terisolasi Total (Autarki)",
        color: "bg-rose-950/80 text-rose-300 border-rose-500/50",
        badge: "Tipe Korea Utara",
        desc: "Negara memutus hubungan dengan dunia luar, mengontrol ketat pers, agama, demonstrasi, internet, perbatasan, dan autarki ekonomi.",
      };
    } else if (score <= 40) {
      return {
        label: "Negara Proteksionis & Otoriter",
        color: "bg-amber-950/80 text-amber-300 border-amber-500/50",
        badge: "Tipe Terbatas",
        desc: "Pemerintah membatasi imigrasi, menyaring media, serta memperketat izin demonstrasi dan transparansi anggaran.",
      };
    } else if (score <= 60) {
      return {
        label: "Negara Moderat & Campuran",
        color: "bg-cyan-950/80 text-cyan-300 border-cyan-500/50",
        badge: "Tipe Moderat",
        desc: "Menyeimbangkan antara kebebasan sipil, kontrol ketertiban publik, dan keterbukaan ekonomi luar negeri.",
      };
    } else if (score <= 80) {
      return {
        label: "Negara Terbuka & Demokratis",
        color: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50",
        badge: "Tipe Demokratis",
        desc: "Kebebasan pers & beragama terjamin, perbatasan terbuka, internet bebas, dan transparansi pemerintah yang tinggi.",
      };
    } else {
      return {
        label: "Negara Globalis & Pasar Bebas",
        color: "bg-teal-950/80 text-[#00FFAA] border-[#00FFAA]/50",
        badge: "Tipe Amerika Serikat / Singapura",
        desc: "Jaminan penuh HAM, kebebasan pers & demonstrasi total, internet terbuka penuh, visa bebas, dan pasar bebas tanpa batas.",
      };
    }
  };

  const regime = getRegimeStatus(overallScore);

  const updateCountryDetailWithScores = (updatedScores: {
    speechScore?: number;
    religionScore?: number;
    demoScore?: number;
    transparencyScore?: number;
    mediaScore?: number;
    internetScore?: number;
    borderScore?: number;
    tradeScore?: number;
    diplomacyScore?: number;
  }) => {
    const nextSpeech = updatedScores.speechScore ?? speechScore;
    const nextReligion = updatedScores.religionScore ?? religionScore;
    const nextDemo = updatedScores.demoScore ?? demoScore;
    const nextTransparency = updatedScores.transparencyScore ?? transparencyScore;
    const nextMedia = updatedScores.mediaScore ?? mediaScore;
    const nextInternet = updatedScores.internetScore ?? internetScore;
    const nextBorder = updatedScores.borderScore ?? borderScore;
    const nextTrade = updatedScores.tradeScore ?? tradeScore;
    const nextDiplomacy = updatedScores.diplomacyScore ?? diplomacyScore;

    const nextOverall = Math.round(
      (nextSpeech + nextReligion + nextDemo + nextTransparency + nextMedia + nextInternet + nextBorder + nextTrade + nextDiplomacy) / 9
    );

    if (setCountryDetail) {
      setCountryDetail((prev: any) => ({
        ...prev,
        speechScore: nextSpeech,
        religionScore: nextReligion,
        demoScore: nextDemo,
        transparencyScore: nextTransparency,
        mediaScore: nextMedia,
        internetScore: nextInternet,
        borderScore: nextBorder,
        tradeScore: nextTrade,
        diplomacyScore: nextDiplomacy,
        opennessIndex: nextOverall,
      }));
    }
  };

  const handleSpeechChange = (val: number) => {
    setSpeechScore(val);
    updateCountryDetailWithScores({ speechScore: val });
  };

  const handleReligionChange = (val: number) => {
    setReligionScore(val);
    updateCountryDetailWithScores({ religionScore: val });
  };

  const handleDemoChange = (val: number) => {
    setDemoScore(val);
    updateCountryDetailWithScores({ demoScore: val });
  };

  const handleTransparencyChange = (val: number) => {
    setTransparencyScore(val);
    updateCountryDetailWithScores({ transparencyScore: val });
  };

  const handleMediaChange = (val: number) => {
    setMediaScore(val);
    updateCountryDetailWithScores({ mediaScore: val });
  };

  const handleInternetChange = (val: number) => {
    setInternetScore(val);
    updateCountryDetailWithScores({ internetScore: val });
  };

  const handleBorderChange = (val: number) => {
    setBorderScore(val);
    updateCountryDetailWithScores({ borderScore: val });
  };

  const handleTradeChange = (val: number) => {
    setTradeScore(val);
    updateCountryDetailWithScores({ tradeScore: val });
  };

  const handleDiplomacyChange = (val: number) => {
    setDiplomacyScore(val);
    updateCountryDetailWithScores({ diplomacyScore: val });
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/30">
              <Globe className="h-5 w-5 text-[#00FFAA]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#E0E0E0] tracking-wide uppercase">
              Doktrin & Keterbukaan Negara
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY LAYOUT WITH LEFT SIDEBAR & RIGHT CONTENT */}
        <div className="flex-1 flex min-h-0 relative z-10">
          {/* LEFT SIDEBAR TABS */}
          <div className="w-48 sm:w-56 lg:w-64 border-r border-[#00FFAA]/30 bg-[#0A1A1A] p-2.5 sm:p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar shrink-0">
            {[
              { id: "civil", label: "Kebebasan Sipil & HAM", icon: Users },
              { id: "media", label: "Media & Informasi", icon: Tv },
              { id: "global", label: "Perbatasan & Geopolitik", icon: Plane },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2.5 w-full px-3.5 py-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md"
                      : "bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0F2424] custom-scrollbar space-y-6">
            {/* OVERVIEW SPECTRUM BANNER */}
            <div className="p-4 sm:p-5 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-2xl space-y-3 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider block">
                    Status Keterbukaan Nasional
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="text-base sm:text-lg font-bold text-[#E0E0E0]">{regime.label}</h3>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${regime.color}`}>
                      {regime.badge}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#6B8A8A] uppercase block">Indeks Keterbukaan</span>
                  <span className="text-xl sm:text-2xl font-black text-[#00FFAA]">{overallScore} / 100</span>
                </div>
              </div>

              <p className="text-xs text-[#6B8A8A] leading-relaxed">{regime.desc}</p>

              {/* Progress Bar Visual */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="flex items-center gap-1 text-rose-400">
                    <Lock className="w-3 h-3" /> Tertutup Total (0%)
                  </span>
                  <span className="flex items-center gap-1 text-[#00FFAA]">
                    Terbuka Bebas (100%) <Unlock className="w-3 h-3" />
                  </span>
                </div>
                <div className="h-2.5 sm:h-3 w-full bg-[#0F2424] rounded-full overflow-hidden border border-[#00FFAA]/20 relative">
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-[#00FFAA] transition-all duration-300"
                    style={{ width: `${overallScore}%` }}
                  />
                </div>
              </div>
            </div>
          {/* TAB 1: KEBEBASAN SIPIL & HAM */}
          {activeTab === "civil" && (
            <div className="space-y-4">
              {/* 1. Kebebasan Berbicara */}
              <div className="p-4 bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#00FFAA]/10 text-[#00FFAA] rounded-lg border border-[#00FFAA]/30">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#E0E0E0]">Kebebasan Berbicara & Berekspresi</h4>
                      <p className="text-xs text-[#6B8A8A]">Jaminan hak berpendapat tanpa rasa takut akan penangkapan politik.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/30">
                    {speechScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speechScore}
                  onChange={(e) => handleSpeechChange(Number(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                    <span className="font-bold block">🔒 Dibatasi Ketat (&lt;30%):</span>
                    <span>+15% Stabilitas Operasional Opini Publik.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <span className="font-bold block">🗣️ Bebas Total (&gt;70%):</span>
                    <span>+10 Indeks Hak Asasi Manusia (HAM), +5 Kepuasan Warga.</span>
                  </div>
                </div>
              </div>

              {/* 2. Kebebasan Beragama */}
              <div className="p-4 bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#00FFAA]/10 text-[#00FFAA] rounded-lg border border-[#00FFAA]/30">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#E0E0E0]">Kebebasan Beragama & Kepercayaan</h4>
                      <p className="text-xs text-[#6B8A8A]">Hak beribadah, pendirian tempat ibadah, dan pengakuan aliran kepercayaan.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/30">
                    {religionScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={religionScore}
                  onChange={(e) => handleReligionChange(Number(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                    <span className="font-bold block">🔒 Dikontrol Negara (&lt;30%):</span>
                    <span>Agama resmi tunggal atau ateisme negara (seperti Korut).</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <span className="font-bold block">🕊️ Bebas Beragama (&gt;70%):</span>
                    <span>Kerukunan antar pemeluk agama & perlindungan minoritas.</span>
                  </div>
                </div>
              </div>

              {/* 3. Hak Demonstrasi & Unjuk Rasa */}
              <div className="p-4 bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#00FFAA]/10 text-[#00FFAA] rounded-lg border border-[#00FFAA]/30">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#E0E0E0]">Hak Demonstrasi & Unjuk Rasa</h4>
                      <p className="text-xs text-[#6B8A8A]">Legalitas aksi damai, pemogokan buruh, dan kumpul massa di muka umum.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/30">
                    {demoScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={demoScore}
                  onChange={(e) => handleDemoChange(Number(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                    <span className="font-bold block">🚫 Dilarang / Dibubarkan Paksa (&lt;30%):</span>
                    <span>Nol aksi unjuk rasa, risko pembangkangan tersembunyi.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <span className="font-bold block">📢 Bebas Berdemonstrasi (&gt;70%):</span>
                    <span>Penyaluran aspirasi terbuka, risiko kemacetan & gelombang protes.</span>
                  </div>
                </div>
              </div>

              {/* 4. Transparansi Pemerintah */}
              <div className="p-4 bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#00FFAA]/10 text-[#00FFAA] rounded-lg border border-[#00FFAA]/30">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#E0E0E0]">Transparansi Pemerintah & Akuntabilitas</h4>
                      <p className="text-xs text-[#6B8A8A]">Keterbukaan informasi anggaran negara (APBN), audit publik, dan antikorupsi.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/30">
                    {transparencyScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={transparencyScore}
                  onChange={(e) => handleTransparencyChange(Number(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                    <span className="font-bold block">🔒 Tertutup / Rahasia Negara (&lt;30%):</span>
                    <span>Pengeluaran pejabat tidak diaudit publik.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <span className="font-bold block">🔍 Transparan Real-Time (&gt;70%):</span>
                    <span>Menurunkan tingkat korupsi, +Kepuasan Publik.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA & INFORMASI */}
          {activeTab === "media" && (
            <div className="space-y-4">
              {/* Media Konvensional & Sosmed */}
              <div className="p-4 bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#00FFAA]/10 text-[#00FFAA] rounded-lg border border-[#00FFAA]/30">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#E0E0E0]">Kebebasan Media Konvensional & Sosmed</h4>
                      <p className="text-xs text-[#6B8A8A]">Izin stasiun TV, radio, koran, portals berita online, dan platform media sosial.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/30">
                    {mediaScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mediaScore}
                  onChange={(e) => handleMediaChange(Number(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                    <span className="font-bold block">📺 Monopoli Media Negara (&lt;30%):</span>
                    <span>Hanya media TV/Koran pemerintah yang diizinkan beroperasi.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <span className="font-bold block">📱 Media Swasta & Sosmed Bebas (&gt;70%):</span>
                    <span>Media swasta & sosmed bebas beroperasi tanpa sensor politik.</span>
                  </div>
                </div>
              </div>

              {/* Internet Freedom */}
              <div className="p-4 bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#00FFAA]/10 text-[#00FFAA] rounded-lg border border-[#00FFAA]/30">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#E0E0E0]">Kebebasan Internet (Internet Freedom)</h4>
                      <p className="text-xs text-[#6B8A8A]">Akses jaringan internet global tanpa firewall/blokir situs asing.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/30">
                    {internetScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={internetScore}
                  onChange={(e) => handleInternetChange(Number(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                    <span className="font-bold block">🔒 Intranet Nasional / Firewall (&lt;30%):</span>
                    <span>Memutus akses ke situs web & aplikasi luar negeri.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <span className="font-bold block">🌐 Internet Bebas Global (&gt;70%):</span>
                    <span>Meningkatkan pertumbuhan ekonomi digital & teknologi.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERBATASAN & GEOPOLITIK */}
          {activeTab === "global" && (
            <div className="space-y-4">
              {/* Akses Perbatasan */}
              <div className="p-4 bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#00FFAA]/10 text-[#00FFAA] rounded-lg border border-[#00FFAA]/30">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#E0E0E0]">Akses Perbatasan & Imigrasi</h4>
                      <p className="text-xs text-[#6B8A8A]">Pengawasan perbatasan, kemudahan visa, dan aturan masuk/keluar wilayah.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/30">
                    {borderScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={borderScore}
                  onChange={(e) => handleBorderChange(Number(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                    <span className="font-bold block">🔒 Tertutup Total (&lt;30%):</span>
                    <span>+12% Stabilitas Internal, Warga dilarang keluar negeri.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <span className="font-bold block">✈️ Bebas Visa (&gt;70%):</span>
                    <span>+15% Pertumbuhan Wisata, +10% Riset & Inovasi.</span>
                  </div>
                </div>
              </div>

              {/* Perdagangan & Modal Asing */}
              <div className="p-4 bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#00FFAA]/10 text-[#00FFAA] rounded-lg border border-[#00FFAA]/30">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#E0E0E0]">Perdagangan Bebas & Investasi Asing (PMA)</h4>
                      <p className="text-xs text-[#6B8A8A]">Keterbukaan pasar domestik untuk barang impor, saham asing, dan perusahaan multinasional.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/30">
                    {tradeScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tradeScore}
                  onChange={(e) => handleTradeChange(Number(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                    <span className="font-bold block">🔒 Autarki Ekonomi (&lt;30%):</span>
                    <span>Proteksi pasar domestik total, embargo barang luar.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <span className="font-bold block">📈 Pasar Bebas Global (&gt;70%):</span>
                    <span>+20% Investasi Asing (PMA), Kemudahan Ekspor/Impor.</span>
                  </div>
                </div>
              </div>

              {/* Multilateralisme & Aliansi */}
              <div className="p-4 bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#00FFAA]/10 text-[#00FFAA] rounded-lg border border-[#00FFAA]/30">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#E0E0E0]">Kerjasama Multilateral & Aliansi Global</h4>
                      <p className="text-xs text-[#6B8A8A]">Partisipasi dalam aliansi internasional, PBB, dan pakta pertahanan bersama.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/30">
                    {diplomacyScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={diplomacyScore}
                  onChange={(e) => handleDiplomacyChange(Number(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                    <span className="font-bold block">🛡️ Isolasionis (&lt;30%):</span>
                    <span>Bebas dari Intervensi Luar Negeri, Kemandirian Militer.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <span className="font-bold block">🤝 Multilateralis (&gt;70%):</span>
                    <span>+15% Reputasi Diplomatik, Pengaruh Luar Negeri Kuat.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 border-t border-[#00FFAA]/20 bg-[#0F2424] flex items-center justify-between shrink-0 relative z-10">
          <div className="text-xs text-[#6B8A8A] font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00FFAA]" /> Perubahan doktrin terupdate secara otomatis & berdampak langsung pada negara.
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-bold text-xs uppercase tracking-wider hover:bg-[#00FFAA]/80 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-md"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

