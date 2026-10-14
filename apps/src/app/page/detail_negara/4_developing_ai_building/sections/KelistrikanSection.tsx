"use client";

import React, { useMemo, useState } from "react";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  BatteryCharging,
  Layers,
  ChevronRight,
  Info,
  Building2,
  Home,
  Shield,
  Factory,
} from "lucide-react";
import { getCountryConsumptionBreakdown } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/consumptionLogic";
import { getProductionBonusMultiplier } from "@/app/page/bonus_logic";
import DetailKonsumsiTerestimasiModal from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/DetailKonsumsiTerestimasiModal";

interface KelistrikanSectionProps {
  countryDetail: Record<string, any> | null;
  metadata: Record<string, any>;
}

const SOURCE_ORDER = [
  "pembangkit_listrik_tenaga_nuklir",
  "pembangkit_listrik_tenaga_air",
  "pembangkit_listrik_tenaga_surya",
  "pembangkit_listrik_tenaga_uap",
  "pembangkit_listrik_tenaga_gas",
  "pembangkit_listrik_tenaga_angin",
  "pembangkit_listrik_tenaga_panas_bumi",
  "pembangkit_listrik_tenaga_hidrogen",
  "pembangkit_listrik_tenaga_gelombang_laut",
  "pembangkit_listrik_tenaga_fusi_nuklir",
];

const findMeta = (metadata: Record<string, any> | undefined, key: string) => {
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

const formatNumber = (val: unknown): string => {
  const num = Number(val ?? 0);
  return Number.isFinite(num) ? num.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "0";
};

export default function KelistrikanSection({
  countryDetail,
  metadata,
}: KelistrikanSectionProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Perhitungan sumber daya pembangkit listrik
  const powerSources = useMemo(() => {
    return SOURCE_ORDER.map((key) => {
      const bMeta = findMeta(metadata, key);
      const count = Number(countryDetail?.[key]) || 0;
      const unitProd = Number(bMeta?.produksi) || 0;
      const bonusMult = countryDetail ? getProductionBonusMultiplier(countryDetail, key) : 1;
      const effectiveUnitProd = unitProd * bonusMult;
      const totalProd = count * effectiveUnitProd;

      return {
        key,
        label: bMeta?.label || key.replace(/_/g, " ").toUpperCase(),
        desc: bMeta?.desc || "Pembangkit energi listrik nasional.",
        count,
        unitProduction: effectiveUnitProd,
        totalProduction: totalProd,
      };
    });
  }, [countryDetail, metadata]);

  const activeSources = useMemo(
    () => powerSources.filter((s) => s.count > 0 || s.unitProduction > 0),
    [powerSources]
  );

  const totalProductionMW = useMemo(
    () => powerSources.reduce((sum, s) => sum + s.totalProduction, 0),
    [powerSources]
  );

  const totalActivePlantsCount = useMemo(
    () => powerSources.reduce((sum, s) => sum + s.count, 0),
    [powerSources]
  );

  // Breakdown konsumsi beban listrik
  const breakdown = useMemo(() => {
    return getCountryConsumptionBreakdown(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const estimatedConsumptionMW = breakdown.totalAllBreakdownConsumption;
  const balanceMW = totalProductionMW - estimatedConsumptionMW;

  const electricitySatisfaction = useMemo(() => {
    if (estimatedConsumptionMW <= 0) return 100;
    const coverage = Math.min(1, Math.max(0, totalProductionMW / estimatedConsumptionMW));
    return Math.round(coverage * 100);
  }, [totalProductionMW, estimatedConsumptionMW]);

  const populationMillions = useMemo(() => {
    const pop = Number(countryDetail?.jumlah_penduduk) || 0;
    return (pop / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 });
  }, [countryDetail]);

  return (
    <div className="space-y-4">
      {/* HEADER SECTION GRID LISTRIK */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A1A1A]/80 border border-[#00FFAA]/20 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/30">
            <Zap className="w-5 h-5 text-[#00FFAA]" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#00FFAA] flex items-center gap-2">
              Statistik Grid Kelistrikan Nasional
            </h4>
            <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold">
              Keseimbangan kapasitas pembangkitan daya terhadap beban konsumsi sektor nasional
            </p>
          </div>
        </div>

        {/* Quick Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2424] border border-[#00FFAA]/30 rounded-xl">
            <TrendingUp className="w-3.5 h-3.5 text-[#00FFAA]" />
            <span className="text-[10px] font-bold text-[#6B8A8A] uppercase">Produksi:</span>
            <span className="text-[11px] font-black text-[#00FFAA]">
              {formatNumber(totalProductionMW)} MW
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2424] border border-rose-500/30 rounded-xl">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[10px] font-bold text-[#6B8A8A] uppercase">Beban:</span>
            <span className="text-[11px] font-black text-rose-400">
              {formatNumber(estimatedConsumptionMW)} MW
            </span>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Total Produksi */}
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Total Pasokan Pembangkit
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {totalActivePlantsCount} Unit Aktif
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 leading-none">
              {formatNumber(totalProductionMW)} <span className="text-sm font-bold text-emerald-300">MW</span>
            </p>
            <p className="text-[10px] text-[#8AB0A8] mt-2 font-medium">
              Dari {powerSources.filter((s) => s.count > 0).length} varian pembangkit energi
            </p>
          </div>
        </div>

        {/* Beban Konsumsi */}
        <div
          onClick={() => setIsDetailModalOpen(true)}
          className="bg-rose-950/30 border border-rose-500/30 hover:border-rose-400 rounded-2xl p-4 flex flex-col justify-between shadow-sm cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" /> Konsumsi Terestimasi
            </span>
            <span className="text-[9px] font-bold text-rose-300 group-hover:underline flex items-center gap-0.5">
              Lihat Detail <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-rose-400 leading-none">
              {formatNumber(estimatedConsumptionMW)} <span className="text-sm font-bold text-rose-300">MW</span>
            </p>
            <p className="text-[10px] text-[#8AB0A8] mt-2 font-medium">
              Beban total sektor sipil, industri, hunian & militer
            </p>
          </div>
        </div>

        {/* Neraca Daya */}
        <div
          className={`rounded-2xl p-4 flex flex-col justify-between shadow-sm border ${
            balanceMW > 0
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
              : balanceMW < 0
              ? "bg-rose-950/30 border-rose-500/30 text-rose-400"
              : "bg-[#0A1A1A] border-[#00FFAA]/20 text-[#6B8A8A]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5" /> Neraca Daya Nasional
            </span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                balanceMW >= 0
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300 animate-pulse"
              }`}
            >
              {balanceMW >= 0 ? "Surplus Daya" : "Defisit Listrik"}
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black leading-none">
              {balanceMW > 0 ? "+" : balanceMW < 0 ? "-" : ""}
              {formatNumber(Math.abs(balanceMW))}{" "}
              <span className="text-sm font-bold opacity-80">MW</span>
            </p>
            <p className="text-[10px] text-[#8AB0A8] mt-2 font-medium">
              Populasi yang terlayani: ~{populationMillions} Juta Jiwa
            </p>
          </div>
        </div>
      </div>

      {/* INDEKS KEPUASAN LISTRIK */}
      <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-xs sm:text-sm font-black text-[#00FFAA] uppercase tracking-wider">
              Indeks Kepuasan Rakyat (Sektor Listrik)
            </span>
            <p className="text-[10px] text-[#6B8A8A] mt-0.5">
              Ketersediaan pasokan listrik bagi fasilitas umum, permukiman, dan lini industri negara
            </p>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#00FFAA]">
            {electricitySatisfaction} <span className="text-sm text-[#6B8A8A]">/ 100</span>
          </span>
        </div>
        <div className="w-full h-3 bg-[#0F2424] rounded-full overflow-hidden border border-[#00FFAA]/20">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              electricitySatisfaction >= 80
                ? "bg-[#00FFAA]"
                : electricitySatisfaction >= 50
                ? "bg-amber-400"
                : "bg-rose-500"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, electricitySatisfaction))}%` }}
          />
        </div>
      </div>

      {/* RINCIAN BEBAN LISTRIK PER SEKTOR & DAFTAR PEMBANGKIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Kolom 1: Beban Konsumsi per Sektor */}
        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-[#00FFAA] flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4" /> Distribusi Beban Sektor
            </h5>

            <div className="space-y-2.5">
              {/* Hunian */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/15">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-teal-400" />
                  <div>
                    <p className="text-xs font-bold text-[#E0E0E0]">Sektor Hunian / Permukiman</p>
                    <p className="text-[10px] text-[#6B8A8A]">Rumah subsidi, apartemen, mansion</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-rose-400">
                    {formatNumber(breakdown.totalHunianConsumption)} MW
                  </span>
                </div>
              </div>

              {/* Tempat Umum */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/15">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-xs font-bold text-[#E0E0E0]">Tempat Umum & Layanan Publik</p>
                    <p className="text-[10px] text-[#6B8A8A]">Sekolah, rumah sakit, kantor, hiburan</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-rose-400">
                    {formatNumber(breakdown.totalTempatUmumConsumption)} MW
                  </span>
                </div>
              </div>

              {/* Produksi */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/15">
                <div className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-[#E0E0E0]">Pabrik & Sentra Produksi</p>
                    <p className="text-[10px] text-[#6B8A8A]">Pabrik manufaktur, tambang, pengolahan</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-rose-400">
                    {formatNumber(breakdown.totalProduksiConsumption)} MW
                  </span>
                </div>
              </div>

              {/* Militer */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/15">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <div>
                    <p className="text-xs font-bold text-[#E0E0E0]">Infrastruktur & Pangkalan Militer</p>
                    <p className="text-[10px] text-[#6B8A8A]">Barak, hangar, pangkalan laut & udara</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-rose-400">
                    {formatNumber(breakdown.totalPertahananConsumption)} MW
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsDetailModalOpen(true)}
            className="w-full mt-4 py-2 rounded-xl bg-[#0F2424] hover:bg-[#00FFAA]/15 border border-[#00FFAA]/30 text-xs font-black uppercase tracking-wider text-[#00FFAA] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Buka Rincian Beban Lengkap <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Kolom 2: Inventaris Pembangkit Listrik */}
        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-[#00FFAA] flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4" /> Pasokan Berdasarkan Jenis Pembangkit
            </h5>

            <div className="space-y-2 max-h-[260px] overflow-y-auto no-scrollbar pr-1">
              {activeSources.map((plant) => (
                <div
                  key={plant.key}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#0F2424]/70 border border-[#00FFAA]/10 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[#E0E0E0] truncate">{plant.label}</p>
                    <p className="text-[9px] text-[#6B8A8A]">
                      {plant.count} unit aktif × {formatNumber(plant.unitProduction)} MW
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-[#00FFAA]">
                      {formatNumber(plant.totalProduction)} MW
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL KONSUMSI BEBAN LISTRIK */}
      {isDetailModalOpen && (
        <DetailKonsumsiTerestimasiModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          countryDetail={countryDetail}
          metadata={metadata}
          estimatedConsumptionMW={estimatedConsumptionMW}
        />
      )}
    </div>
  );
}
