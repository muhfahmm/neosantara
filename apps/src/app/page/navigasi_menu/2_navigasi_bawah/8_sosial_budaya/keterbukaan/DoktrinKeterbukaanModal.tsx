"use client"
import React, { useState, useEffect } from "react";
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
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
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
  }, [countryDetail, countryName]);

  if (!isOpen) return null;

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
        color: "bg-rose-900 text-rose-100 border-rose-700",
        badge: "Tipe Korea Utara",
        desc: "Negara memutus hubungan dengan dunia luar, mengontrol ketat pers, agama, demonstrasi, internet, perbatasan, dan autarki ekonomi.",
      };
    } else if (score <= 40) {
      return {
        label: "Negara Proteksionis & Otoriter",
        color: "bg-amber-800 text-amber-100 border-amber-600",
        badge: "Tipe Terbatas",
        desc: "Pemerintah membatasi imigrasi, menyaring media, serta memperketat izin demonstrasi dan transparansi anggaran.",
      };
    } else if (score <= 60) {
      return {
        label: "Negara Moderat & Campuran",
        color: "bg-blue-800 text-blue-100 border-blue-600",
        badge: "Tipe Moderat",
        desc: "Menyeimbangkan antara kebebasan sipil, kontrol ketertiban publik, dan keterbukaan ekonomi luar negeri.",
      };
    } else if (score <= 80) {
      return {
        label: "Negara Terbuka & Demokratis",
        color: "bg-emerald-800 text-emerald-100 border-emerald-600",
        badge: "Tipe Demokratis",
        desc: "Kebebasan pers & beragama terjamin, perbatasan terbuka, internet bebas, dan transparansi pemerintah yang tinggi.",
      };
    } else {
      return {
        label: "Negara Globalis & Pasar Bebas",
        color: "bg-indigo-900 text-indigo-100 border-indigo-700",
        badge: "Tipe Amerika Serikat / Singapura",
        desc: "Jaminan penuh HAM, kebebasan pers & demonstrasi total, internet terbuka penuh, visa bebas, dan pasar bebas tanpa batas.",
      };
    }
  };

  const regime = getRegimeStatus(overallScore);

  const handleApplyDoctrine = () => {
    if (setCountryDetail) {
      setCountryDetail((prev: any) => ({
        ...prev,
        speechScore,
        religionScore,
        demoScore,
        transparencyScore,
        mediaScore,
        internetScore,
        borderScore,
        tradeScore,
        diplomacyScore,
        opennessIndex: overallScore,
      }));
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* HEADER */}
        <div className="px-6 py-4 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 rounded-xl border border-blue-600/20 text-blue-700">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">
                Doktrin & Keterbukaan Negara
              </h2>
              <p className="text-xs text-[#8b7e66] font-semibold mt-1">
                Pengaturan spektrum negara tertutup (isolasionis) vs terbuka (globalis) di {countryName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* OVERVIEW SPECTRUM BANNER */}
        <div className="p-5 bg-white/70 border-b border-[#C4B49C]/30 shrink-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#8b7e66] uppercase tracking-wider block">
                Status Keterbukaan Nasional
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="text-lg font-bold text-[#5c3c10]">{regime.label}</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${regime.color}`}>
                  {regime.badge}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-[#8b7e66] uppercase block">Indeks Keterbukaan</span>
              <span className="text-2xl font-black text-[#5c3c10]">{overallScore} / 100</span>
            </div>
          </div>

          <p className="text-xs text-[#8b7e66] leading-relaxed">{regime.desc}</p>

          {/* Progress Bar Visual */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] font-bold text-[#8b7e66] uppercase">
              <span className="flex items-center gap-1 text-rose-700">
                <Lock className="w-3 h-3" /> Tertutup Total (0%)
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                Terbuka Bebas (100%) <Unlock className="w-3 h-3" />
              </span>
            </div>
            <div className="h-3 w-full bg-[#C4B49C]/30 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-600 transition-all duration-300"
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>

          {/* TAB CATEGORIES */}
          <div className="flex items-center gap-2 pt-2">
            {[
              { id: "civil", label: "1. Kebebasan Sipil & HAM", icon: Users },
              { id: "media", label: "2. Media & Informasi", icon: Tv },
              { id: "global", label: "3. Perbatasan & Geopolitik", icon: Plane },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#5c3c10] text-[#FAF6EE] shadow-sm"
                      : "bg-white/80 text-[#8b7e66] hover:bg-[#C4B49C]/30 hover:text-[#5c3c10]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT SLIDERS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {/* TAB 1: KEBEBASAN SIPIL & HAM */}
          {activeTab === "civil" && (
            <div className="space-y-4">
              {/* 1. Kebebasan Berbicara */}
              <div className="p-4 bg-white rounded-xl border border-[#C4B49C]/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/10 text-blue-800 rounded-lg">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#5c3c10]">Kebebasan Berbicara & Berekspresi</h4>
                      <p className="text-xs text-[#8b7e66]">Jaminan hak berpendapat tanpa rasa takut akan penangkapan politik.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#5c3c10] bg-[#FAF6EE] px-3 py-1 rounded-lg border border-[#C4B49C]/40">
                    {speechScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speechScore}
                  onChange={(e) => setSpeechScore(Number(e.target.value))}
                  className="w-full accent-[#5c3c10] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-bold block">🔒 Dibatasi Ketat (&lt;30%):</span>
                    <span>+15% Stabilitas Operasional Opini Publik.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="font-bold block">🗣️ Bebas Total (&gt;70%):</span>
                    <span>+10 Indeks Hak Asasi Manusia (HAM), +5 Kepuasan Warga.</span>
                  </div>
                </div>
              </div>

              {/* 2. Kebebasan Beragama */}
              <div className="p-4 bg-white rounded-xl border border-[#C4B49C]/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/10 text-indigo-800 rounded-lg">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#5c3c10]">Kebebasan Beragama & Kepercayaan</h4>
                      <p className="text-xs text-[#8b7e66]">Hak beribadah, pendirian tempat ibadah, dan pengakuan aliran kepercayaan.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#5c3c10] bg-[#FAF6EE] px-3 py-1 rounded-lg border border-[#C4B49C]/40">
                    {religionScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={religionScore}
                  onChange={(e) => setReligionScore(Number(e.target.value))}
                  className="w-full accent-[#5c3c10] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-bold block">🔒 Dikontrol Negara (&lt;30%):</span>
                    <span>Agama resmi tunggal atau ateisme negara (seperti Korut).</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="font-bold block">🕊️ Bebas Beragama (&gt;70%):</span>
                    <span>Kerukunan antar pemeluk agama & perlindungan minoritas.</span>
                  </div>
                </div>
              </div>

              {/* 3. Hak Demonstrasi & Unjuk Rasa */}
              <div className="p-4 bg-white rounded-xl border border-[#C4B49C]/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/10 text-amber-800 rounded-lg">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#5c3c10]">Hak Demonstrasi & Unjuk Rasa</h4>
                      <p className="text-xs text-[#8b7e66]">Legalitas aksi damai, pemogokan buruh, dan kumpul massa di muka umum.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#5c3c10] bg-[#FAF6EE] px-3 py-1 rounded-lg border border-[#C4B49C]/40">
                    {demoScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={demoScore}
                  onChange={(e) => setDemoScore(Number(e.target.value))}
                  className="w-full accent-[#5c3c10] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-bold block">🚫 Dilarang / Dibubarkan Paksa (&lt;30%):</span>
                    <span>Nol aksi unjuk rasa, risko pembangkangan tersembunyi.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="font-bold block">📢 Bebas Berdemonstrasi (&gt;70%):</span>
                    <span>Penyaluran aspirasi terbuka, risiko kemacetan & gelombang protes.</span>
                  </div>
                </div>
              </div>

              {/* 4. Transparansi Pemerintah */}
              <div className="p-4 bg-white rounded-xl border border-[#C4B49C]/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 text-emerald-800 rounded-lg">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#5c3c10]">Transparansi Pemerintah & Akuntabilitas</h4>
                      <p className="text-xs text-[#8b7e66]">Keterbukaan informasi anggaran negara (APBN), audit publik, dan antikorupsi.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#5c3c10] bg-[#FAF6EE] px-3 py-1 rounded-lg border border-[#C4B49C]/40">
                    {transparencyScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={transparencyScore}
                  onChange={(e) => setTransparencyScore(Number(e.target.value))}
                  className="w-full accent-[#5c3c10] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-bold block">🔒 Tertutup / Rahasia Negara (&lt;30%):</span>
                    <span>Pengeluaran pejabat tidak diaudit publik.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
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
              <div className="p-4 bg-white rounded-xl border border-[#C4B49C]/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-500/10 text-purple-800 rounded-lg">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#5c3c10]">Kebebasan Media Konvensional & Sosmed</h4>
                      <p className="text-xs text-[#8b7e66]">Izin stasiun TV, radio, koran, portals berita online, dan platform media sosial.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#5c3c10] bg-[#FAF6EE] px-3 py-1 rounded-lg border border-[#C4B49C]/40">
                    {mediaScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mediaScore}
                  onChange={(e) => setMediaScore(Number(e.target.value))}
                  className="w-full accent-[#5c3c10] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-bold block">📺 Monopoli Media Negara (&lt;30%):</span>
                    <span>Hanya media TV/Koran pemerintah yang diizinkan beroperasi.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="font-bold block">📱 Media Swasta & Sosmed Bebas (&gt;70%):</span>
                    <span>Media swasta & sosmed bebas beroperasi tanpa sensor politik.</span>
                  </div>
                </div>
              </div>

              {/* Internet Freedom */}
              <div className="p-4 bg-white rounded-xl border border-[#C4B49C]/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/10 text-blue-800 rounded-lg">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#5c3c10]">Kebebasan Internet (Internet Freedom)</h4>
                      <p className="text-xs text-[#8b7e66]">Akses jaringan internet global tanpa firewall/blokir situs asing.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#5c3c10] bg-[#FAF6EE] px-3 py-1 rounded-lg border border-[#C4B49C]/40">
                    {internetScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={internetScore}
                  onChange={(e) => setInternetScore(Number(e.target.value))}
                  className="w-full accent-[#5c3c10] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-bold block">🔒 Intranet Nasional / Firewall (&lt;30%):</span>
                    <span>Memutus akses ke situs web & aplikasi luar negeri.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
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
              <div className="p-4 bg-white rounded-xl border border-[#C4B49C]/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/10 text-amber-800 rounded-lg">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#5c3c10]">Akses Perbatasan & Imigrasi</h4>
                      <p className="text-xs text-[#8b7e66]">Pengawasan perbatasan, kemudahan visa, dan aturan masuk/keluar wilayah.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#5c3c10] bg-[#FAF6EE] px-3 py-1 rounded-lg border border-[#C4B49C]/40">
                    {borderScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={borderScore}
                  onChange={(e) => setBorderScore(Number(e.target.value))}
                  className="w-full accent-[#5c3c10] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-bold block">🔒 Tertutup Total (&lt;30%):</span>
                    <span>+12% Stabilitas Internal, Warga dilarang keluar negeri.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="font-bold block">✈️ Bebas Visa (&gt;70%):</span>
                    <span>+15% Pertumbuhan Wisata, +10% Riset & Inovasi.</span>
                  </div>
                </div>
              </div>

              {/* Perdagangan & Modal Asing */}
              <div className="p-4 bg-white rounded-xl border border-[#C4B49C]/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 text-emerald-800 rounded-lg">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#5c3c10]">Perdagangan & Modal Asing (Autarki vs Pasar Bebas)</h4>
                      <p className="text-xs text-[#8b7e66]">Aturan impor-ekspor dan kemudahan Penanaman Modal Asing (PMA).</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#5c3c10] bg-[#FAF6EE] px-3 py-1 rounded-lg border border-[#C4B49C]/40">
                    {tradeScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tradeScore}
                  onChange={(e) => setTradeScore(Number(e.target.value))}
                  className="w-full accent-[#5c3c10] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-bold block">🌾 Autarki Mandiri (&lt;30%):</span>
                    <span>Kebal Sanksi & Embargo Luar Negeri, Produksi Mandiri.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="font-bold block">📈 Pasar Bebas (&gt;70%):</span>
                    <span>+20% Pendapatan PDB, Daya Tarik Modal Asing Melimpah.</span>
                  </div>
                </div>
              </div>

              {/* Orientasi Diplomasi */}
              <div className="p-4 bg-white rounded-xl border border-[#C4B49C]/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/10 text-indigo-800 rounded-lg">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#5c3c10]">Orientasi Diplomasi (Isolasionis vs Multilateralis)</h4>
                      <p className="text-xs text-[#8b7e66]">Partisipasi dalam aliansi internasional, PBB, dan pakta pertahanan bersama.</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#5c3c10] bg-[#FAF6EE] px-3 py-1 rounded-lg border border-[#C4B49C]/40">
                    {diplomacyScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={diplomacyScore}
                  onChange={(e) => setDiplomacyScore(Number(e.target.value))}
                  className="w-full accent-[#5c3c10] cursor-pointer"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-bold block">🛡️ Isolasionis (&lt;30%):</span>
                    <span>Bebas dari Intervensi Luar Negeri, Kemandirian Militer.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="font-bold block">🤝 Multilateralis (&gt;70%):</span>
                    <span>+15% Reputasi Diplomatik, Pengaruh Luar Negeri Kuat.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 border-t-2 border-[#C4B49C]/30 bg-[#FAF6EE] flex items-center justify-between shrink-0 relative z-10">
          {savedSuccess ? (
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Doktrin baru berhasil diterapkan!
            </div>
          ) : (
            <div className="text-xs text-[#8b7e66] font-semibold">
              Perubahan doktrin berdampak langsung pada stabilitas, kebebasan HAM, dan pertumbuhan nasional.
            </div>
          )}

          <button
            onClick={handleApplyDoctrine}
            className="px-5 py-2.5 rounded-xl bg-[#5c3c10] text-[#FAF6EE] font-bold text-xs uppercase tracking-wider hover:bg-[#422b0b] active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-md"
          >
            <Sliders className="w-4 h-4" />
            Terapkan Doktrin
          </button>
        </div>
      </div>
    </div>
  );
}
