"use client";

import React, { useMemo } from "react";
import {
  Scale,
  Sliders,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Briefcase,
  Layers,
  CheckCircle2,
} from "lucide-react";
import {
  getEconomicSystemDetails,
  ECONOMIC_POLICIES,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/4_ekonomi/7_sistem_ekonomi/logic/logikaSistemEkonomi";
import {
  NATIONALIZATION_SECTORS,
  NATIONALIZATION_LEVELS,
  getNationalizationLevel,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/4_ekonomi/7_sistem_ekonomi/logic/nationalizationLogic";

interface SistemEkonomiSectionProps {
  countryDetail: Record<string, any> | null;
}

export default function SistemEkonomiSection({
  countryDetail,
}: SistemEkonomiSectionProps) {
  const [dbData, setDbData] = React.useState<Record<string, any> | null>(null);

  React.useEffect(() => {
    // Jika countryDetail sudah lengkap memiliki kebijakan ekonomi dan spektrum, tidak perlu fetch ulang
    if (
      countryDetail?.sistem_ekonomi_val !== undefined &&
      countryDetail?.policy_price_control !== undefined &&
      countryDetail?.policy_trade_policy !== undefined
    ) {
      setDbData(null);
      return;
    }

    const slug = countryDetail?.country_slug || countryDetail?.slug;
    const countryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en;
    if (!slug && !countryName) return;

    let isMounted = true;
    const pathQuery = slug ? `${encodeURIComponent(slug)}.ts` : `${encodeURIComponent(countryName)}.ts`;
    fetch(`/api/country-data?path=${pathQuery}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data || data.error) return;
        setDbData(data);
      })
      .catch((err) => {
        console.error("Gagal mengambil data sistem ekonomi negara:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [
    countryDetail?.country_slug,
    countryDetail?.slug,
    countryDetail?.country,
    countryDetail?.nama_negara,
    countryDetail?.name_id,
    countryDetail?.sistem_ekonomi_val,
    countryDetail?.policy_price_control,
    countryDetail?.policy_trade_policy,
  ]);

  const activeData = dbData ? { ...dbData, ...countryDetail } : countryDetail;

  // Slider spektrum ekonomi negara (0 = Komando, 100 = Pasar Bebas Murni)
  const sliderValue = Number(activeData?.sistem_ekonomi_val ?? 50);

  // Detail dampak spektrum sistem ekonomi
  const systemDetails = useMemo(() => {
    return getEconomicSystemDetails(sliderValue);
  }, [sliderValue]);

  // Status kartu pilihan 7 kebijakan ekonomi
  const policyChoices = useMemo<Record<string, "A" | "B">>(() => {
    return {
      price_control: activeData?.policy_price_control || "A",
      strategic_ownership: activeData?.policy_strategic_ownership || "A",
      trade_policy: activeData?.policy_trade_policy || "A",
      labor_regulation: activeData?.policy_labor_regulation || "A",
      land_property_rights: activeData?.policy_land_property_rights || "A",
      labor_unions_rights: activeData?.policy_labor_unions_rights || "A",
      monetary_banking: activeData?.policy_monetary_banking || "A",
    };
  }, [activeData]);

  // Status nasionalisasi per sektor
  const sectorLevels = useMemo(() => {
    return (activeData?.sector_nationalization as Record<string, any>) || {};
  }, [activeData]);

  return (
    <div className="space-y-4">
      {/* HEADER SECTION SISTEM EKONOMI */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A1A1A]/80 border border-[#00FFAA]/20 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/30">
            <Scale className="w-5 h-5 text-[#00FFAA]" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#00FFAA] flex items-center gap-2">
              Sistem Ekonomi & Spektrum Kebijakan
            </h4>
            <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold">
              Keseimbangan intervensi negara terhadap pasar bebas dan kebijakan struktural
            </p>
          </div>
        </div>

        {/* Badge Kategori Sistem */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-xl border ${
              systemDetails.category === "Terpusat"
                ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                : systemDetails.category === "Pasar Bebas"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
            }`}
          >
            {systemDetails.category}
          </span>
        </div>
      </div>

      {/* TOP SUMMARY: SPEKTRUM SISTEM AKTIF */}
      <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">
              Sistem yang Berlaku
            </p>
            <h5 className="text-base sm:text-lg font-black text-[#00FFAA] uppercase">
              {systemDetails.title}
            </h5>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-[#6B8A8A] uppercase">Posisi Spektrum:</span>
            <span className="text-base font-black text-[#00FFAA] ml-1.5">{sliderValue} / 100</span>
          </div>
        </div>

        {/* Progress Slider visual */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-[#0F2424] rounded-full overflow-hidden border border-[#00FFAA]/25 relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-[#00FFAA] transition-all"
              style={{ width: `${Math.min(100, Math.max(0, sliderValue))}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-[#6B8A8A]">
            <span>Komando Terpusat (0)</span>
            <span>Campuran (50)</span>
            <span>Pasar Bebas Murni (100)</span>
          </div>
        </div>

        <p className="text-xs text-[#E0E0E0] bg-[#0F2424] p-3 rounded-xl border border-[#00FFAA]/15 font-medium leading-relaxed">
          {systemDetails.description}
        </p>

        {/* Parameter Dampak Makro Ekonomi */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-[#0F2424] border border-[#00FFAA]/15 p-2.5 rounded-xl">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B8A8A]">
              Bonus PDB
            </span>
            <p className="text-sm font-black text-emerald-400 mt-0.5">
              +{systemDetails.gdpGrowthBonus}%
            </p>
          </div>
          <div className="bg-[#0F2424] border border-[#00FFAA]/15 p-2.5 rounded-xl">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B8A8A]">
              Dampak Inflasi
            </span>
            <p className="text-sm font-black text-rose-400 mt-0.5">
              {systemDetails.inflationImpact > 0 ? "+" : ""}
              {systemDetails.inflationImpact}%
            </p>
          </div>
          <div className="bg-[#0F2424] border border-[#00FFAA]/15 p-2.5 rounded-xl">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B8A8A]">
              Kepuasan Buruh
            </span>
            <p
              className={`text-sm font-black mt-0.5 ${
                systemDetails.workerSatisfactionBonus >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {systemDetails.workerSatisfactionBonus >= 0 ? "+" : ""}
              {systemDetails.workerSatisfactionBonus}
            </p>
          </div>
          <div className="bg-[#0F2424] border border-[#00FFAA]/15 p-2.5 rounded-xl">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B8A8A]">
              Kepuasan Investor
            </span>
            <p
              className={`text-sm font-black mt-0.5 ${
                systemDetails.capitalistSatisfactionBonus >= 0
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {systemDetails.capitalistSatisfactionBonus >= 0 ? "+" : ""}
              {systemDetails.capitalistSatisfactionBonus}
            </p>
          </div>
        </div>
      </div>

      {/* 7 KARTU KEBIJAKAN EKONOMI */}
      <div>
        <h5 className="text-xs font-black uppercase tracking-wider text-[#00FFAA] flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4" /> Kebijakan Struktural Perekonomian (7 Kebijakan)
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ECONOMIC_POLICIES.map((policy) => {
            const currentChoice = policyChoices[policy.id] || "A";
            const chosenOption = currentChoice === "A" ? policy.optionA : policy.optionB;
            const isOpsiA = currentChoice === "A";

            return (
              <div
                key={policy.id}
                className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm hover:border-[#00FFAA]/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h6 className="text-xs font-black text-[#E0E0E0] uppercase tracking-wider">
                      {policy.name}
                    </h6>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        isOpsiA
                          ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                          : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      }`}
                    >
                      {chosenOption.type}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/15 mt-2">
                    <div className="flex items-center gap-1.5 text-[#00FFAA] text-xs font-bold mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{chosenOption.label}</span>
                    </div>
                    <p className="text-[10px] text-[#6B8A8A] font-semibold leading-relaxed">
                      {chosenOption.effect}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TINGKAT NASIONALISASI SEKTOR STRATEGIS */}
      <div>
        <h5 className="text-xs font-black uppercase tracking-wider text-[#00FFAA] flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4" /> Tingkat Penguasaan & Nasionalisasi Sektor Strategis
        </h5>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {NATIONALIZATION_SECTORS.map((sector) => {
            const levelVal = getNationalizationLevel(sectorLevels, sector.id);
            const levelObj =
              NATIONALIZATION_LEVELS.find((l) => l.value === levelVal) || NATIONALIZATION_LEVELS[0];
            return (
              <div
                key={sector.id}
                className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-2xl p-3 flex flex-col justify-between shadow-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-[#8AB0A8] truncate">
                  {sector.name}
                </p>
                <div className="mt-2">
                  <span className="text-[9px] font-bold text-[#00FFAA] block leading-tight">
                    {levelObj.name}
                  </span>
                  <span className="text-[8px] text-[#6B8A8A] block mt-0.5">
                    Negara: {levelObj.stateProfitSharePercent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
