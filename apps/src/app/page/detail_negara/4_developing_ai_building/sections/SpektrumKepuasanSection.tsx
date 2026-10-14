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
  ShieldCheck,
  Percent,
} from "lucide-react";
import {
  calculateKepuasan,
  calculateEconomicPolicySatisfaction,
  calculateSubsidySatisfaction,
  getSatisfactionSectorScores,
} from "@/app/logic/kepuasanCalculator";

interface SpektrumKepuasanSectionProps {
  countryDetail: Record<string, any> | null;
  metadata?: Record<string, any>;
  onNavigateTab?: (tabId: string) => void;
}

export default function SpektrumKepuasanSection({
  countryDetail,
  metadata = {},
  onNavigateTab,
}: SpektrumKepuasanSectionProps) {
  // Hitung skor kepuasan secara komprehensif
  const sectorScores = useMemo(() => {
    return getSatisfactionSectorScores(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const generalSatisfaction = useMemo(() => {
    return Math.round(calculateKepuasan(countryDetail, metadata));
  }, [countryDetail, metadata]);

  const economicPolicySatisfaction = useMemo(() => {
    return calculateEconomicPolicySatisfaction(countryDetail);
  }, [countryDetail]);

  const subsidySatisfaction = useMemo(() => {
    return calculateSubsidySatisfaction(countryDetail);
  }, [countryDetail]);

  // Daftar 9 sektor utama persis sesuai menu Kepuasan Rakyat
  const sectors = useMemo(() => [
    {
      id: "pajak",
      name: "PAJAK",
      score: sectorScores.pajak,
      icon: Landmark,
      tabTarget: "pajak",
      desc: "Keterjangkauan beban tarif fiskal bagi masyarakat dan pelaku usaha",
    },
    {
      id: "harga",
      name: "HARGA BARANG POKOK",
      score: sectorScores.harga,
      icon: Coins,
      tabTarget: "harga",
      desc: "Stabilitas dan keterjangkauan 8 bahan pangan pokok kebutuhan harian",
    },
    {
      id: "pangan",
      name: "PRODUKSI PANGAN",
      score: sectorScores.pangan,
      icon: Apple,
      tabTarget: "fasilitas_militer",
      desc: "Kecukupan hasil panen pertanian, peternakan, perikanan dan olahan",
    },
    {
      id: "listrik",
      name: "PRODUKSI LISTRIK",
      score: sectorScores.listrik,
      icon: Plug,
      tabTarget: "kelistrikan",
      desc: "Keandalan kapasitas daya pembangkit terhadap beban puncak konsumsi",
    },
    {
      id: "hunian",
      name: "HUNIAN PERMUKIMAN",
      score: sectorScores.hunian,
      icon: Home,
      tabTarget: "fasilitas_militer",
      desc: "Ketersediaan rumah subsidi, apartemen, dan perumahan bagi seluruh warga",
    },
    {
      id: "layananPublik",
      name: "LAYANAN PUBLIK & TEMPAT UMUM",
      score: sectorScores.layananPublik,
      icon: Landmark,
      tabTarget: "fasilitas_militer",
      desc: "Akses fasilitas pendidikan, kesehatan, fasilitas hukum, dan rekreasi publik",
    },
    {
      id: "keterbukaan",
      name: "DOKTRIN & KETERBUKAAN",
      score: sectorScores.keterbukaan,
      icon: Globe,
      tabTarget: null,
      desc: "Kebebasan berekspresi, pers, toleransi beragama dan transparansi pemerintahan",
    },
    {
      id: "sistem_ekonomi",
      name: "KEBIJAKAN & SISTEM EKONOMI",
      score: economicPolicySatisfaction,
      icon: Scale,
      tabTarget: "sistem_ekonomi",
      desc: "Keseimbangan regulasi pasar bebas, proteksi tenaga kerja, dan investasi",
    },
    {
      id: "subsidi",
      name: "ALOKASI & KEBIJAKAN SUBSIDI",
      score: subsidySatisfaction,
      icon: HandHelping,
      tabTarget: "subsidi",
      desc: "Cakupan perlindungan sosial, bantuan pangan, tarif energi, dan jaring pengaman",
    },
  ], [sectorScores, economicPolicySatisfaction, subsidySatisfaction]);

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

        {/* 9 KARTU GRID SEKTOR UTAMA SESUAI GAMBAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            const isClickable = Boolean(sector.tabTarget && onNavigateTab);

            return (
              <div
                key={sector.id}
                onClick={() => {
                  if (sector.tabTarget && onNavigateTab) {
                    onNavigateTab(sector.tabTarget);
                  }
                }}
                className={`bg-[#0A1A1A] border border-[#00FFAA]/25 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3.5 transition-all relative overflow-hidden group shadow-sm ${
                  isClickable
                    ? "hover:border-[#00FFAA] hover:bg-[#00FFAA]/5 cursor-pointer"
                    : "cursor-default"
                }`}
              >
                <div className="p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/20 text-[#00FFAA] group-hover:border-[#00FFAA] shrink-0 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-black text-[#E0E0E0] uppercase tracking-wide group-hover:text-[#00FFAA] transition-colors">
                    <span className="truncate pr-2">{sector.name}</span>
                    <span className="text-[#00FFAA] shrink-0 font-black">{sector.score}%</span>
                  </div>

                  {/* Progress Bar Glow Hijau Neon */}
                  <div className="h-2 w-full bg-[#0F2424] rounded-full overflow-hidden border border-[#00FFAA]/20">
                    <div
                      className="h-full bg-[#00FFAA] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,255,170,0.4)]"
                      style={{ width: `${Math.min(100, Math.max(0, sector.score))}%` }}
                    />
                  </div>

                  <p className="text-[9px] text-[#6B8A8A] font-medium leading-tight truncate">
                    {sector.desc}
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
