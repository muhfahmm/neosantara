"use client";

import React, { useMemo } from "react";
import {
  Smile,
  TrendingUp,
  Landmark,
  Coins,
  Apple,
  Plug,
  Home,
  Globe,
  Scale,
  HandHelping,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Percent,
} from "lucide-react";
import type { NpcAiBrainState, NpcAlert } from "@/app/logic/npc_ai_brain/types/alertTypes";
import {
  calculateKepuasan,
  calculateSatisfactionIndicatorScores,
} from "@/app/logic/kepuasanCalculator";

interface SpektrumKepuasanSectionProps {
  countryDetail: Record<string, any> | null;
  metadata?: Record<string, any>;
  onNavigateTab?: (tabId: string) => void;
}

// 5 Kategori Spektrum Warna Persis Gambar Referensi 2:
// 0 - 25:   Sangat Buruk (Merah Terang / Rose Red)
// 26 - 40:  Buruk (Merah Tua Keunguan / Wine Red)
// 41 - 65:  Netral (Kuning / Amber / Gold)
// 66 - 80:  Baik (Hijau Medium / Green)
// 81 - 100: Sangat Baik (Hijau Neon Terang / Mint Cyan-Green)
export function getSatisfactionGrade(score: number) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  if (clamped <= 25) {
    return {
      label: "Sangat Buruk",
      textColor: "text-[#EF4444]", // Merah terang
      barColor: "bg-[#EF4444]",
      glowColor: "shadow-[0_0_8px_rgba(239,68,68,0.5)]",
      badgeBg: "bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]",
    };
  }
  if (clamped <= 40) {
    return {
      label: "Buruk",
      textColor: "text-[#F43F5E]", // Merah raspberry / rose
      barColor: "bg-[#E11D48]",
      glowColor: "shadow-[0_0_8px_rgba(225,29,72,0.5)]",
      badgeBg: "bg-[#881337]/30 border-[#BE123C]/40 text-[#FB7185]",
    };
  }
  if (clamped <= 65) {
    return {
      label: "Netral",
      textColor: "text-[#EAB308]", // Kuning emas
      barColor: "bg-[#EAB308]",
      glowColor: "shadow-[0_0_8px_rgba(234,179,8,0.5)]",
      badgeBg: "bg-[#CA8A04]/15 border-[#EAB308]/30 text-[#FACC15]",
    };
  }
  if (clamped <= 80) {
    return {
      label: "Baik",
      textColor: "text-[#10B981]", // Hijau emerald
      barColor: "bg-[#10B981]",
      glowColor: "shadow-[0_0_8px_rgba(16,185,129,0.5)]",
      badgeBg: "bg-[#064E3B]/40 border-[#059669]/40 text-[#34D399]",
    };
  }
  return {
    label: "Sangat Baik",
    textColor: "text-[#00FFAA]", // Hijau neon / mint
    barColor: "bg-[#00FFAA]",
    glowColor: "shadow-[0_0_8px_rgba(0,255,170,0.5)]",
    badgeBg: "bg-[#064E3B]/60 border-[#00FFAA]/40 text-[#00FFAA]",
  };
}

export default function SpektrumKepuasanSection({
  countryDetail,
  metadata = {},
  onNavigateTab,
}: SpektrumKepuasanSectionProps) {
  // Hitung skor kepuasan secara komprehensif
  const indicatorScores = useMemo(
    () => calculateSatisfactionIndicatorScores(countryDetail, metadata),
    [countryDetail, metadata],
  );

  const generalSatisfaction = useMemo(() => {
    return Math.round(calculateKepuasan(countryDetail, metadata));
  }, [countryDetail, metadata]);

  // Daftar 9 sektor utama persis sesuai menu Kepuasan Rakyat
  const sectors = useMemo(() => [
    {
      id: "pajak",
      name: "PAJAK",
      score: indicatorScores.pajak,
      icon: Landmark,
      tabTarget: "pajak",
      desc: "Keterjangkauan beban tarif fiskal bagi masyarakat dan pelaku usaha",
    },
    {
      id: "harga",
      name: "HARGA BARANG POKOK",
      score: indicatorScores.harga,
      icon: Coins,
      tabTarget: "harga",
      desc: "Stabilitas dan keterjangkauan 8 bahan pangan pokok kebutuhan harian",
    },
    {
      id: "pangan",
      name: "PRODUKSI PANGAN",
      score: indicatorScores.pangan,
      icon: Apple,
      tabTarget: "produksi_pangan",
      desc: "Kecukupan hasil panen pertanian, peternakan, perikanan dan olahan",
    },
    {
      id: "listrik",
      name: "PRODUKSI LISTRIK",
      score: indicatorScores.listrik,
      icon: Plug,
      tabTarget: "kelistrikan",
      desc: "Keandalan kapasitas daya pembangkit terhadap beban puncak konsumsi",
    },
    {
      id: "hunian",
      name: "HUNIAN PERMUKIMAN",
      score: indicatorScores.hunian,
      icon: Home,
      tabTarget: "hunian",
      desc: "Ketersediaan rumah subsidi, apartemen, dan perumahan bagi seluruh warga",
    },
    {
      id: "layananPublik",
      name: "LAYANAN PUBLIK & TEMPAT UMUM",
      score: indicatorScores.layananPublik,
      icon: Landmark,
      tabTarget: "fasilitas_militer",
      desc: "Akses fasilitas pendidikan, kesehatan, fasilitas hukum, dan rekreasi publik",
    },
    {
      id: "keterbukaan",
      name: "DOKTRIN & KETERBUKAAN",
      score: indicatorScores.keterbukaan,
      icon: Globe,
      tabTarget: "keterbukaan",
      desc: "Kebebasan berekspresi, pers, toleransi beragama dan transparansi pemerintahan",
    },
    {
      id: "sistem_ekonomi",
      name: "KEBIJAKAN & SISTEM EKONOMI",
      score: indicatorScores.sistemEkonomi,
      icon: Scale,
      tabTarget: "sistem_ekonomi",
      desc: "Keseimbangan regulasi pasar bebas, proteksi tenaga kerja, dan investasi",
    },
    {
      id: "subsidi",
      name: "ALOKASI & KEBIJAKAN SUBSIDI",
      score: indicatorScores.subsidi,
      icon: HandHelping,
      tabTarget: "subsidi",
      desc: "Cakupan perlindungan sosial, bantuan pangan, tarif energi, dan jaring pengaman",
    },
  ], [indicatorScores]);

  // Map alert AI aktif per indikator
  const alertMap = useMemo(() => {
    const map: Record<string, NpcAlert | undefined> = {};
    const brain = countryDetail?.ai_brain_state as NpcAiBrainState | undefined;
    if (brain?.alerts) {
      for (const a of brain.alerts) {
        if (a.status !== "selesai") {
          // Normalisasi key
          const key = a.indikator === "sistemEkonomi" ? "sistem_ekonomi" : a.indikator;
          map[key] = a;
        }
      }
    }
    return map;
  }, [countryDetail]);

  const totalActiveAlerts = useMemo(() => {
    return Object.keys(alertMap).length;
  }, [alertMap]);

  // Statistik ringkasan
  const highestSector = useMemo(() => {
    return [...sectors].sort((a, b) => b.score - a.score)[0];
  }, [sectors]);

  const lowestSector = useMemo(() => {
    return [...sectors].sort((a, b) => a.score - b.score)[0];
  }, [sectors]);

  return (
    <div className="space-y-4">
      {/* HEADER SECTION SPEKTRUM KEPUASAN */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A1A1A]/80 border border-[#00FFAA]/20 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/30">
            <Smile className="w-5 h-5 text-[#00FFAA]" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#00FFAA] flex items-center gap-2">
              Spektrum Kepuasan Rakyat
            </h4>
            <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold">
              Indikator persetujuan umum publik dan kepuasan di seluruh sektor vital nasional
            </p>
          </div>
        </div>

        {/* Quick Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2424] border border-[#00FFAA]/30 rounded-xl">
            <TrendingUp className="w-3.5 h-3.5 text-[#00FFAA]" />
            <span className="text-[10px] font-bold text-[#6B8A8A] uppercase">Status Sosial:</span>
            <span className="text-[11px] font-black text-[#00FFAA]">
              {generalSatisfaction >= 70 ? "Sangat Stabil" : generalSatisfaction >= 45 ? "Cukup Stabil" : "Kritis / Gejolak"}
            </span>
          </div>
        </div>
      </div>

      {/* KARTU UTAMA: PERSETUJUAN UMUM RAKYAT (PERSIS SEPERTI GAMBAR) */}
      <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-[#00FFAA]/5">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0F2424] border-2 border-[#00FFAA]/40 flex items-center justify-center shrink-0 shadow-inner">
            <Smile className="w-6 h-6 sm:w-7 sm:h-7 text-[#00FFAA]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#E0E0E0] uppercase tracking-wider mb-1">
              Persetujuan Umum Rakyat
            </h3>
            <p className="text-[10px] sm:text-xs text-[#6B8A8A]">
              Agregat sentimen publik terhadap kinerja kepemimpinan dan pelayanan negara
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="text-right bg-[#0F2424] border border-[#00FFAA]/30 px-4 py-2 rounded-xl min-w-[100px]">
            <p className="text-2xl sm:text-3xl font-black text-[#00FFAA] tracking-tight leading-none">
              {generalSatisfaction}%
            </p>
            <p className="text-[9px] text-[#00FFAA] font-black uppercase tracking-widest mt-1 flex items-center justify-end gap-1">
              <TrendingUp className="w-3 h-3" /> Stabil
            </p>
          </div>
        </div>
      </div>

      {/* SUMMARY STATS KECIL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#6B8A8A] block mb-0.5">
              Sektor Tertinggi
            </span>
            <span className="text-xs font-black text-emerald-400 uppercase">
              {highestSector.name}
            </span>
          </div>
          <span className="text-lg font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
            {highestSector.score}%
          </span>
        </div>

        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#6B8A8A] block mb-0.5">
              Perlu Ditingkatkan
            </span>
            <span className="text-xs font-black text-amber-400 uppercase">
              {lowestSector.name}
            </span>
          </div>
          <span className="text-lg font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
            {lowestSector.score}%
          </span>
        </div>
      </div>

      {/* SECTION TITLE SEKTOR UTAMA */}
      <div className="pt-2">
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div className="p-1 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30">
            <TrendingUp className="h-3.5 w-3.5 text-[#00FFAA]" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-[#E0E0E0] uppercase tracking-wider italic">
            Sektor Utama
          </h4>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#00FFAA]/30 to-transparent ml-2" />
        </div>

        {/* LEGENDA SPEKTRUM WARNA (PERSIS GAMBAR 2) */}
        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3 rounded-2xl mb-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold">
            <span className="text-[#6B8A8A] uppercase tracking-wider font-black text-[9px] flex items-center gap-1">
              <Percent className="w-3 h-3 text-[#00FFAA]" /> Spektrum Kepuasan:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                0 - 25: Sangat Buruk
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#881337]/30 border border-[#BE123C]/40 text-[#FB7185]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                26 - 40: Buruk
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#CA8A04]/15 border border-[#EAB308]/30 text-[#FACC15]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
                41 - 65: Netral
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#064E3B]/40 border border-[#059669]/40 text-[#34D399]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                66 - 80: Baik
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#064E3B]/60 border border-[#00FFAA]/40 text-[#00FFAA]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FFAA]" />
                81 - 100: Sangat Baik
              </span>
            </div>
          </div>
        </div>

        {/* 9 KARTU GRID SEKTOR UTAMA SESUAI GAMBAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            const isClickable = Boolean(sector.tabTarget && onNavigateTab);
            const grade = getSatisfactionGrade(sector.score);

              const activeAlert = alertMap[sector.id];

              return (
              <div
                key={sector.id}
                onClick={() => {
                  if (sector.tabTarget && onNavigateTab) {
                    onNavigateTab(sector.tabTarget);
                  }
                }}
                className={`bg-[#0A1A1A] border p-3.5 sm:p-4 rounded-2xl flex items-center gap-3.5 transition-all relative overflow-hidden group shadow-sm ${
                  activeAlert?.tingkat === "KRITIS"
                    ? "border-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                    : activeAlert?.tingkat === "TINGGI"
                    ? "border-rose-500/50"
                    : activeAlert?.tingkat === "SEDANG"
                    ? "border-amber-500/40"
                    : grade.textColor.includes("00FFAA")
                    ? "border-[#00FFAA]/30 hover:border-[#00FFAA]"
                    : grade.textColor.includes("10B981")
                    ? "border-emerald-500/30 hover:border-emerald-400"
                    : grade.textColor.includes("EAB308")
                    ? "border-amber-500/30 hover:border-amber-400"
                    : grade.textColor.includes("E11D48") || grade.textColor.includes("F43F5E")
                    ? "border-rose-700/40 hover:border-rose-500"
                    : "border-red-500/35 hover:border-red-500"
                } ${
                  isClickable
                    ? "hover:bg-[#0F2424]/80 cursor-pointer"
                    : "cursor-default"
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl bg-[#0F2424] border shrink-0 transition-colors ${
                    activeAlert?.tingkat === "KRITIS"
                      ? "border-red-500 text-red-400"
                      : activeAlert?.tingkat === "TINGGI"
                      ? "border-rose-500 text-rose-400"
                      : grade.textColor.includes("00FFAA")
                      ? "border-[#00FFAA]/30 text-[#00FFAA]"
                      : grade.textColor.includes("10B981")
                      ? "border-emerald-500/30 text-emerald-400"
                      : grade.textColor.includes("EAB308")
                      ? "border-amber-500/30 text-amber-400"
                      : grade.textColor.includes("E11D48") || grade.textColor.includes("F43F5E")
                      ? "border-rose-700/40 text-rose-400"
                      : "border-red-500/40 text-red-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-black text-[#E0E0E0] uppercase tracking-wide transition-colors">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="truncate">{sector.name}</span>
                      {activeAlert && (
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border shrink-0 animate-pulse ${
                            activeAlert.tingkat === "KRITIS"
                              ? "bg-red-500/20 border-red-500 text-red-400"
                              : activeAlert.tingkat === "TINGGI"
                              ? "bg-rose-500/20 border-rose-500 text-rose-300"
                              : "bg-amber-500/20 border-amber-500 text-amber-300"
                          }`}
                          title={activeAlert.penyebab}
                        >
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>{activeAlert.tingkat}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${grade.badgeBg}`}>
                        {grade.label}
                      </span>
                      <span className={`shrink-0 font-black ${grade.textColor}`}>
                        {sector.score}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Dinamis Mengikuti Spektrum Persentase */}
                  <div className="h-2 w-full bg-[#0F2424] rounded-full overflow-hidden border border-[#00FFAA]/15">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${grade.barColor} ${grade.glowColor}`}
                      style={{ width: `${Math.min(100, Math.max(0, sector.score))}%` }}
                    />
                  </div>

                  <p className="text-[9px] text-[#6B8A8A] font-medium leading-tight truncate">
                    {activeAlert ? activeAlert.penyebab : sector.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
