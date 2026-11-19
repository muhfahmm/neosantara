import RootModalCloseButton from '@/app/page/root_modals_design_menu/RootModalCloseButton';
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Globe,
  Lock,
  Unlock,
} from "lucide-react";

import { fetchDoktrinKeterbukaanFromDb } from "../../../../../../../../json/2_database_doktrin_keterbukaan/index";
import { generateDoctrineChangeNotification } from "@/app/page/menus/inbox/logic/10_sosial_budaya/3_keterbukaan/doctrineChangeLogic";
import { getRelationColor } from "@/app/logic/relationTiers";
import { markMissionAsClaimable } from "@/app/page/menus/mission/missionModals";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalSidebarLayout from "@/app/page/root_modals_design_menu/RootModalSidebarLayout";
import MenuInfoButton from "../../MenuInfoButton";

interface DoktrinKeterbukaanModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  setCountryDetail?: (detail: any) => void;
  selectedCountry?: any;
}

const DOCTRINE_TABS = [
  { id: "civil", label: "Kebebasan Sipil & HAM" },
  { id: "media", label: "Media & Informasi" },
  { id: "global", label: "Perbatasan & Geopolitik" },
] as const;

export default function DoktrinKeterbukaanModal({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
  selectedCountry,
}: DoktrinKeterbukaanModalProps) {
  const [mounted, setMounted] = useState(false);
  const countryName = selectedCountry?.country || countryDetail?.nama_negara || countryDetail?.country || "Negara";

  // --- 1. KEBEBASAN SIPIL & HAM ---
  const [speechScore, setSpeechScore] = useState<number>(countryDetail?.speechScore ?? 50);
  const [religionScore, setReligionScore] = useState<number>(countryDetail?.religionScore ?? 60);
  const [demoScore, setDemoScore] = useState<number>(countryDetail?.demoScore ?? 45);
  const [transparencyScore, setTransparencyScore] = useState<number>(countryDetail?.transparencyScore ?? 55);

  // --- 2. MEDIA & INFORMASI ---
  const [mediaScore, setMediaScore] = useState<number>(countryDetail?.mediaScore ?? 50);
  const [internetScore, setInternetScore] = useState<number>(countryDetail?.internetScore ?? 60);

  // --- 3. PERBATASAN & GEOPOLITIK ---
  const [borderScore, setBorderScore] = useState<number>(countryDetail?.borderScore ?? 40);
  const [tradeScore, setTradeScore] = useState<number>(countryDetail?.tradeScore ?? 60);
  const [diplomacyScore, setDiplomacyScore] = useState<number>(countryDetail?.diplomacyScore ?? 55);

  const [activeTab, setActiveTab] = useState<"civil" | "media" | "global">("civil");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchDoktrinKeterbukaanFromDb(countryName).then((dbData: any) => {
      if (!dbData) return;
      setSpeechScore(countryDetail?.speechScore ?? dbData.speechScore ?? dbData.speech_score ?? 50);
      setReligionScore(countryDetail?.religionScore ?? dbData.religionScore ?? dbData.religion_score ?? 60);
      setDemoScore(countryDetail?.demoScore ?? dbData.demoScore ?? dbData.demo_score ?? 45);
      setTransparencyScore(countryDetail?.transparencyScore ?? dbData.transparencyScore ?? dbData.transparency_score ?? 55);
      setMediaScore(countryDetail?.mediaScore ?? dbData.mediaScore ?? dbData.media_score ?? 50);
      setInternetScore(countryDetail?.internetScore ?? dbData.internetScore ?? dbData.internet_score ?? 60);
      setBorderScore(countryDetail?.borderScore ?? dbData.borderScore ?? dbData.border_score ?? 40);
      setTradeScore(countryDetail?.tradeScore ?? dbData.tradeScore ?? dbData.trade_score ?? 60);
      setDiplomacyScore(countryDetail?.diplomacyScore ?? dbData.diplomacyScore ?? dbData.diplomacy_score ?? 55);
    });
  }, [isOpen, countryName, countryDetail]);

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
        badge: "Isolasionis Ekstrem",
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
        color: "bg-teal-950/80 text-root-accent border-root-accent/50",
        badge: "Hegemon Pasar Bebas",
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

    const dateStr = countryDetail?.current_date || new Date().toISOString().split('T')[0];
    let newPending = Array.isArray(countryDetail?.pending_notifications) ? [...countryDetail.pending_notifications] : [];

    const sliderMap: Array<{ key: string; oldVal: number; newVal: number }> = [
      { key: 'speechScore', oldVal: speechScore, newVal: nextSpeech },
      { key: 'religionScore', oldVal: religionScore, newVal: nextReligion },
      { key: 'demoScore', oldVal: demoScore, newVal: nextDemo },
      { key: 'transparencyScore', oldVal: transparencyScore, newVal: nextTransparency },
      { key: 'mediaScore', oldVal: mediaScore, newVal: nextMedia },
      { key: 'internetScore', oldVal: internetScore, newVal: nextInternet },
      { key: 'borderScore', oldVal: borderScore, newVal: nextBorder },
      { key: 'tradeScore', oldVal: tradeScore, newVal: nextTrade },
      { key: 'diplomacyScore', oldVal: diplomacyScore, newVal: nextDiplomacy },
    ];

    sliderMap.forEach(({ key, oldVal, newVal }) => {
      if (oldVal !== newVal) {
        const notif = generateDoctrineChangeNotification(key, oldVal, newVal, dateStr);
        if (notif) {
          newPending = [notif, ...newPending];
        }
      }
    });

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
        pending_notifications: newPending,
      }));
      if (sliderMap.some(({ oldVal, newVal }) => oldVal !== newVal)) {
        markMissionAsClaimable('doktrin_keterbukaan');
      }
      if (religionScore !== nextReligion) {
        markMissionAsClaimable('toleransi_agama');
      }
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
    <NotebookModalWrapper onClose={onClose}>
      <div className="root-modal-util-52b6b298fe">
        <div className="satisfaction-modal-header root-modal-util-4450f1d9ee">
          <div className="satisfaction-modal-header-main root-modal-util-935108d13c no-scrollbar">
            <div className="root-modal-util-c7c918256f">
              <div className="root-modal-util-acd42b9a36">
                <Globe aria-hidden="true" className="root-modal-util-ea2c28151c" />
              </div>
              <div>
                <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                  Doktrin & Keterbukaan Negara
                </h2>
              </div>
            </div>
          </div>
          <div className="root-modal-util-6cfc7e6ab3">
            <MenuInfoButton
              title="Doktrin & Keterbukaan"
              description="Atur kebijakan keterbukaan negara pada kebebasan sipil dan HAM, media dan informasi, serta perbatasan dan geopolitik. Perubahan indikator memengaruhi karakter kebijakan dalam negeri dan hubungan dengan dunia."
            >
              <div className="mt-4 space-y-3 rounded-2xl border border-root-accent/20 bg-root-canvas p-4 shadow-md sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-root-subtle">
                      Status Keterbukaan Nasional
                    </span>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-root-text sm:text-lg">{regime.label}</h3>
                      <span className={`rounded border px-2 py-0.5 text-[11px] font-bold ${regime.color}`}>
                        {regime.badge}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold uppercase text-root-subtle">Indeks Keterbukaan</span>
                    <span className="text-xl font-black text-root-accent sm:text-2xl">{overallScore} / 100</span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-root-subtle">{regime.desc}</p>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="flex items-center gap-1 text-rose-400">
                      <Lock className="h-3 w-3" /> Tertutup Total (0%)
                    </span>
                    <span className="flex items-center gap-1 text-root-accent">
                      Terbuka Bebas (100%) <Unlock className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-root-accent/20 bg-root-surface sm:h-3">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${overallScore}%`,
                        backgroundColor: getRelationColor(overallScore),
                      }}
                    />
                  </div>
                </div>
              </div>
            </MenuInfoButton>
            <RootModalCloseButton onClick={onClose} />
          </div>
        </div>

        <RootModalSidebarLayout
          ariaLabel="Bagian doktrin dan keterbukaan"
          activeItemId={activeTab}
          contentClassName="root-modal-util-9c12d57a09 space-y-4"
          items={DOCTRINE_TABS.map((tab) => ({
            id: tab.id,
            isActive: activeTab === tab.id,
            onSelect: () => setActiveTab(tab.id),
            label: tab.label,
          }))}
        >
            {/* TAB 1: KEBEBASAN SIPIL & HAM */}
            {activeTab === "civil" && (
              <div className="space-y-4">
                {/* 1. Kebebasan Berbicara */}
                <div className="p-4 bg-root-canvas rounded-xl border border-root-accent/20 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                        <Image src="/images/game/interface/sub-tabs/sosial-budaya/doktrin-keterbukaan/kebebasan-sipil-ham/kebebasan-sipil-ham-asset-01.svg" alt="" aria-hidden="true" width={56} height={56} className="h-14 w-14 object-contain" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-root-text">Kebebasan Berbicara & Berekspresi</h4>
                        <p className="text-xs text-root-subtle">Jaminan hak berpendapat tanpa rasa takut akan penangkapan politik.</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-root-accent bg-root-surface px-3 py-1 rounded-lg border border-root-accent/30">
                      {speechScore}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={speechScore}
                    onChange={(e) => handleSpeechChange(Number(e.target.value))}
                    className="w-full accent-root-accent cursor-pointer"
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
                <div className="p-4 bg-root-canvas rounded-xl border border-root-accent/20 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                        <Image src="/images/game/interface/sub-tabs/sosial-budaya/doktrin-keterbukaan/kebebasan-sipil-ham/kebebasan-sipil-ham-asset-02.svg" alt="" aria-hidden="true" width={56} height={56} className="h-14 w-14 object-contain" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-root-text">Kebebasan Beragama & Kepercayaan</h4>
                        <p className="text-xs text-root-subtle">Hak beribadah, pendirian tempat ibadah, dan pengakuan aliran kepercayaan.</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-root-accent bg-root-surface px-3 py-1 rounded-lg border border-root-accent/30">
                      {religionScore}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={religionScore}
                    onChange={(e) => handleReligionChange(Number(e.target.value))}
                    className="w-full accent-root-accent cursor-pointer"
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
                <div className="p-4 bg-root-canvas rounded-xl border border-root-accent/20 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                        <Image src="/images/game/interface/sub-tabs/sosial-budaya/doktrin-keterbukaan/kebebasan-sipil-ham/kebebasan-sipil-ham-asset-03.svg" alt="" aria-hidden="true" width={56} height={56} className="h-14 w-14 object-contain" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-root-text">Hak Demonstrasi & Unjuk Rasa</h4>
                        <p className="text-xs text-root-subtle">Legalitas aksi damai, pemogokan buruh, dan kumpul massa di muka umum.</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-root-accent bg-root-surface px-3 py-1 rounded-lg border border-root-accent/30">
                      {demoScore}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={demoScore}
                    onChange={(e) => handleDemoChange(Number(e.target.value))}
                    className="w-full accent-root-accent cursor-pointer"
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
                <div className="p-4 bg-root-canvas rounded-xl border border-root-accent/20 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                        <Image src="/images/game/interface/sub-tabs/sosial-budaya/doktrin-keterbukaan/kebebasan-sipil-ham/kebebasan-sipil-ham-asset-04.svg" alt="" aria-hidden="true" width={56} height={56} className="h-14 w-14 object-contain" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-root-text">Transparansi Pemerintah & Akuntabilitas</h4>
                        <p className="text-xs text-root-subtle">Keterbukaan informasi anggaran negara dan audit publik.</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-root-accent bg-root-surface px-3 py-1 rounded-lg border border-root-accent/30">
                      {transparencyScore}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={transparencyScore}
                    onChange={(e) => handleTransparencyChange(Number(e.target.value))}
                    className="w-full accent-root-accent cursor-pointer"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                      <span className="font-bold block">🔒 Tertutup / Rahasia Negara (&lt;30%):</span>
                      <span>Pengeluaran pejabat tidak diaudit publik.</span>
                    </div>
                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                      <span className="font-bold block">🔍 Transparan Real-Time (&gt;70%):</span>
                      <span>Anggaran dapat diawasi publik, +Kepuasan Publik.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MEDIA & INFORMASI */}
            {activeTab === "media" && (
              <div className="space-y-4">
                {/* Media Konvensional & Sosmed */}
                <div className="p-4 bg-root-canvas rounded-xl border border-root-accent/20 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                        <Image src="/images/game/interface/sub-tabs/sosial-budaya/doktrin-keterbukaan/media-informasi/media-informasi-asset-01.svg" alt="" aria-hidden="true" width={56} height={56} className="h-14 w-14 object-contain" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-root-text">Kebebasan Media Konvensional & Sosmed</h4>
                        <p className="text-xs text-root-subtle">Izin stasiun TV, radio, koran, portals berita online, dan platform media sosial.</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-root-accent bg-root-surface px-3 py-1 rounded-lg border border-root-accent/30">
                      {mediaScore}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={mediaScore}
                    onChange={(e) => handleMediaChange(Number(e.target.value))}
                    className="w-full accent-root-accent cursor-pointer"
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
                <div className="p-4 bg-root-canvas rounded-xl border border-root-accent/20 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                        <Image src="/images/game/interface/sub-tabs/sosial-budaya/doktrin-keterbukaan/media-informasi/media-informasi-asset-02.svg" alt="" aria-hidden="true" width={56} height={56} className="h-14 w-14 object-contain" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-root-text">Kebebasan Internet (Internet Freedom)</h4>
                        <p className="text-xs text-root-subtle">Akses jaringan internet global tanpa firewall/blokir situs asing.</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-root-accent bg-root-surface px-3 py-1 rounded-lg border border-root-accent/30">
                      {internetScore}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={internetScore}
                    onChange={(e) => handleInternetChange(Number(e.target.value))}
                    className="w-full accent-root-accent cursor-pointer"
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
                <div className="p-4 bg-root-canvas rounded-xl border border-root-accent/20 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                        <Image src="/images/game/interface/sub-tabs/sosial-budaya/doktrin-keterbukaan/perbatasan-geopolitik/perbatasan-geopolitik-asset-01.svg" alt="" aria-hidden="true" width={56} height={56} className="h-14 w-14 object-contain" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-root-text">Akses Perbatasan & Imigrasi</h4>
                        <p className="text-xs text-root-subtle">Pengawasan perbatasan, kemudahan visa, dan aturan masuk/keluar wilayah.</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-root-accent bg-root-surface px-3 py-1 rounded-lg border border-root-accent/30">
                      {borderScore}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={borderScore}
                    onChange={(e) => handleBorderChange(Number(e.target.value))}
                    className="w-full accent-root-accent cursor-pointer"
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
                <div className="p-4 bg-root-canvas rounded-xl border border-root-accent/20 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                        <Image src="/images/game/interface/sub-tabs/sosial-budaya/doktrin-keterbukaan/perbatasan-geopolitik/perbatasan-geopolitik-asset-02.svg" alt="" aria-hidden="true" width={56} height={56} className="h-14 w-14 object-contain" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-root-text">Perdagangan Bebas & Investasi Asing (PMA)</h4>
                        <p className="text-xs text-root-subtle">Keterbukaan pasar domestik untuk barang impor, saham asing, dan perusahaan multinasional.</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-root-accent bg-root-surface px-3 py-1 rounded-lg border border-root-accent/30">
                      {tradeScore}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tradeScore}
                    onChange={(e) => handleTradeChange(Number(e.target.value))}
                    className="w-full accent-root-accent cursor-pointer"
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
                <div className="p-4 bg-root-canvas rounded-xl border border-root-accent/20 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                        <Image src="/images/game/interface/sub-tabs/sosial-budaya/doktrin-keterbukaan/perbatasan-geopolitik/perbatasan-geopolitik-asset-03.svg" alt="" aria-hidden="true" width={56} height={56} className="h-14 w-14 object-contain" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-root-text">Kerjasama Multilateral & Aliansi Global</h4>
                        <p className="text-xs text-root-subtle">Partisipasi dalam aliansi internasional, PBB, dan pakta pertahanan bersama.</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-root-accent bg-root-surface px-3 py-1 rounded-lg border border-root-accent/30">
                      {diplomacyScore}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={diplomacyScore}
                    onChange={(e) => handleDiplomacyChange(Number(e.target.value))}
                    className="w-full accent-root-accent cursor-pointer"
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

          <div className="flex items-center gap-1.5 border-t border-root-accent/20 pt-3 text-xs font-semibold text-root-subtle">
            <span className="text-root-accent" aria-hidden="true">✓</span>
            Perubahan doktrin terupdate secara otomatis & berdampak langsung pada negara.
          </div>
        </RootModalSidebarLayout>
      </div>
    </NotebookModalWrapper>,
    document.body
  );
}