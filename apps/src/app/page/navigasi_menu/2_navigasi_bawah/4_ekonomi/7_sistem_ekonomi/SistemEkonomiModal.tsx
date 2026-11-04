"use client";

import React, { startTransition, useState, useEffect, useCallback, useMemo, useRef, useDeferredValue } from "react";
import { Scale, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { 
  getEconomicSystemDetails, 
  EconomicSystemEffect 
} from "./logic/logikaSistemEkonomi";

import SpektrumSistemTab from "./tab_menu/1_spektrum_sistem/SpektrumSistemTab";
import KartuKebijakanTab from "./tab_menu/2_kartu_kebijakan/KartuKebijakanTab";
import { fetchBuildingMetadata } from "@/lib/buildingMetadata";
import { getCountryConsumptionBreakdown } from "../../3_produksi_konsumsi/1_grid_nasional/consumptionLogic";
import {
  NATIONALIZATION_LEVELS,
  NATIONALIZATION_SECTORS,
  getNationalizationLevel,
  calculateEconomicPolicyAverage,
  NATIONALIZATION_DIPLOMACY_INTERVAL_MONTHS,
  getStateProfitSharePercent,
  syncNationalizationDiplomacyRelations,
  type NationalizationLevels,
  type NationalizationSectorId,
} from "./logic/nationalizationLogic";

const NATIONALIZATION_ESTIMATE_YEAR = 2026;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  setCountryDetail?: (detail: any | ((prev: any) => any)) => void;
}

interface BuildingMetadataEntry {
  dataKey?: string;
  produksi?: number | string;
  konsumsi_listrik?: number | string;
}

const resolveSistemEkonomiForCountry = (countryDetail: any) => {
  const spektrumVal = countryDetail?.sistem_ekonomi_val ?? 50;

  const choices: Record<string, "A" | "B"> = {
    price_control: countryDetail?.policy_price_control || "A",
    strategic_ownership: countryDetail?.policy_strategic_ownership || "A",
    trade_policy: countryDetail?.policy_trade_policy || "A",
    labor_regulation: countryDetail?.policy_labor_regulation || "A",
    land_property_rights: countryDetail?.policy_land_property_rights || "A",
    labor_unions_rights: countryDetail?.policy_labor_unions_rights || "A",
    monetary_banking: countryDetail?.policy_monetary_banking || "A",
  };

  return { spektrumVal, choices };
};

const resolveNationalizationLevels = (countryDetail: any): NationalizationLevels =>
  countryDetail?.sector_nationalization && typeof countryDetail.sector_nationalization === "object"
    ? countryDetail.sector_nationalization
    : {};

// --- MEMOIZED COMPONENTS UNTUK MENCEGAH RE-RENDER SAAT SLIDER DIGESER ---

const MemoizedKartuKebijakanTab = React.memo(KartuKebijakanTab);

const SektorTab = React.memo(({
  sectorLevels,
  handleSectorLevelChange,
  isElectricityMetadataLoading,
  electricityMetadataError,
  electricitySurplusMW,
  electricityPrice,
  electricityProfitShare,
  electricityEstimatedStateShare,
  diplomacyMonthsToNextPoint
}: any) => {
  return (
    <div className="space-y-4">
      <div className={`border border-root-accent/20 bg-root-canvas p-4 ${rootBorderRadius.card}`}>
        <h3 className="text-sm font-black uppercase tracking-wide text-root-accent">Nasionalisasi & Ekonomi Terpusat</h3>
        <p className="mt-2 text-xs leading-relaxed text-root-body">
          Atur kepemilikan setiap sektor. Bagian negara berlaku saat komoditas dijual melalui Perdagangan;
          emas mengikuti porsi Mineral & Energi pada pemasukan tambang yang sudah ada. Nasionalisasi aktif
          secara bertahap menurunkan hubungan dengan negara berideologi Kapitalisme.
        </p>
        <p className="mt-2 text-xs font-bold text-amber-300">
          Hubungan dengan negara terbuka turun 1 poin setiap 6 bulan selama ada sektor yang dinasionalisasi.
          Penurunan berjalan untuk negara berideologi Kapitalisme.
        </p>
        <p className="mt-1 text-[10px] text-root-subtle">
          Progres periode berjalan: {diplomacyMonthsToNextPoint}/
          {NATIONALIZATION_DIPLOMACY_INTERVAL_MONTHS} bulan menuju penurunan 1 poin berikutnya.
        </p>
        <p className="mt-1 text-[10px] text-root-subtle">
          Tahun acuan estimasi: {NATIONALIZATION_ESTIMATE_YEAR}
        </p>
      </div>
      <div className="grid gap-3">
        {NATIONALIZATION_SECTORS.map((sector) => {
          const level = getNationalizationLevel(sectorLevels, sector.id);
          const levelDetails = NATIONALIZATION_LEVELS.find((item) => item.value === level) ?? NATIONALIZATION_LEVELS[0];
          return (
            <section
              key={sector.id}
              className={`border border-root-accent/20 bg-root-canvas p-4 ${rootBorderRadius.card}`}
              style={{ contentVisibility: "auto", containIntrinsicSize: "170px" }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-black text-root-text">{sector.name}</h4>
                  <p className="mt-1 text-[11px] text-root-body">{levelDetails.description}</p>
                </div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-root-subtle">
                  Level
                  <select
                    value={level}
                    onChange={(event) => handleSectorLevelChange(sector.id, Number(event.target.value))}
                    className="rounded-lg border border-root-accent/30 bg-root-surface px-3 py-2 text-xs font-bold text-root-accent outline-none"
                  >
                    {NATIONALIZATION_LEVELS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.value}% — {option.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-root-accent/10 pt-3 text-[11px]">
                <span className="text-emerald-300">Bagian negara: {levelDetails.stateProfitSharePercent}%</span>
              </div>
              {sector.id === "kelistrikan" && (
                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-200">
                  {isElectricityMetadataLoading ? (
                    <p>Menghitung estimasi surplus listrik...</p>
                  ) : electricityMetadataError ? (
                    <p>{electricityMetadataError}</p>
                  ) : (
                    <p>
                      Estimasi bagian negara dari surplus: {electricitySurplusMW.toLocaleString("id-ID", { maximumFractionDigits: 2 })} MW ×{" "}
                      {electricityPrice.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO × {electricityProfitShare}% ={" "}
                      {electricityEstimatedStateShare.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO. Estimasi ini belum
                      dimasukkan ke APBN karena listrik belum memiliki transaksi jual-beli.
                    </p>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
});

const SatisfactionBar = React.memo(({ average }: { average: number }) => {
  return (
    <div className={`mt-6 border border-root-accent/30 bg-root-surface p-5 ${rootBorderRadius.card}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black uppercase tracking-widest text-root-accent">
          Indeks Kepuasan Rakyat (Kebijakan Ekonomi)
        </span>
        <span className="shrink-0 text-2xl font-black text-amber-400 sm:text-3xl">
          {average} / 100
        </span>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full border border-root-accent/20 bg-root-canvas">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-200"
          style={{ width: `${average}%` }}
        />
      </div>
    </div>
  );
});

// --- MAIN COMPONENT ---

export default function SistemEkonomiModal({ isOpen, onClose, countryDetail, setCountryDetail }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"sistem" | "kebijakan" | "sektor">("sistem");

  // Economic System Slider Value & Policy Choices (Loaded Instantly in 0ms)
  const [sliderValue, setSliderValue] = useState<number>(
    () => resolveSistemEkonomiForCountry(countryDetail).spektrumVal
  );

  const [policyChoices, setPolicyChoices] = useState<Record<string, "A" | "B">>(
    () => resolveSistemEkonomiForCountry(countryDetail).choices
  );
  const [sectorLevels, setSectorLevels] = useState<NationalizationLevels>(
    () => resolveNationalizationLevels(countryDetail)
  );
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const [electricityMetadata, setElectricityMetadata] = useState<Record<string, BuildingMetadataEntry>>({});
  const [isElectricityMetadataLoading, setIsElectricityMetadataLoading] = useState(true);
  const [electricityMetadataError, setElectricityMetadataError] = useState<string | null>(null);

  // Sinkronisasi instan tanpa network fetch (0ms)
  useEffect(() => {
    if (!isOpen) return;
    const res = resolveSistemEkonomiForCountry(countryDetail);
    setSliderValue(res.spektrumVal);
    setPolicyChoices(res.choices);
    setSectorLevels(resolveNationalizationLevels(countryDetail));
  }, [
    isOpen,
    countryDetail?.country_slug,
    countryDetail?.slug,
    countryDetail?.country,
    countryDetail?.nama_negara,
    countryDetail?.name_id,
    countryDetail?.sistem_ekonomi_val,
    countryDetail?.policy_price_control,
    countryDetail?.policy_strategic_ownership,
    countryDetail?.policy_trade_policy,
    countryDetail?.policy_labor_regulation,
    countryDetail?.policy_land_property_rights,
    countryDetail?.policy_labor_unions_rights,
    countryDetail?.policy_monetary_banking,
    countryDetail?.sector_nationalization
  ]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetchBuildingMetadata()
      .then((metadata) => {
        if (cancelled) return;
        if (Object.keys(metadata).length === 0) {
          setIsElectricityMetadataLoading(false);
          setElectricityMetadataError("Metadata pembangkit listrik tidak tersedia; estimasi surplus belum dapat dihitung.");
          return;
        }
        setElectricityMetadata(metadata);
        setIsElectricityMetadataLoading(false);
        setElectricityMetadataError(null);
      })
      .catch((error) => {
        console.error("Gagal memuat metadata listrik untuk nasionalisasi:", error);
        if (!cancelled) {
          setIsElectricityMetadataLoading(false);
          setElectricityMetadataError("Gagal memuat metadata pembangkit listrik.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // OPTIMASI: Gunakan useDeferredValue untuk nilai yang memicu kalkulasi berat.
  // Ini memungkinkan slider bergerak mulus (60fps) tanpa tertahan oleh render UI di bawahnya.
  const deferredSliderValue = useDeferredValue(sliderValue);

  const systemDetails: EconomicSystemEffect = useMemo(
    () => getEconomicSystemDetails(sliderValue), // Tetap gunakan sliderValue asli untuk teks deskripsi instan
    [sliderValue]
  );

  const economicPolicyAverage = useMemo(
    () => calculateEconomicPolicyAverage(deferredSliderValue, policyChoices, sectorLevels),
    [deferredSliderValue, policyChoices, sectorLevels]
  );

  const handlePolicyChange = useCallback((policyId: string, choice: "A" | "B") => {
    setPolicyChoices((prev) => {
      if (prev[policyId] === choice) return prev;
      return {
        ...prev,
        [policyId]: choice,
      };
    });

    startTransition(() => {
      setCountryDetail?.((prev: any) => {
        if (!prev || prev[`policy_${policyId}`] === choice) return prev;
        return {
          ...prev,
          [`policy_${policyId}`]: choice,
        };
      });
    });
  }, [setCountryDetail]);

  const handleSpectrumChange = useCallback((value: number) => {
    setSliderValue(value);
    const details = getEconomicSystemDetails(value);
    
    // OPTIMASI: Bungkus update global state dengan startTransition
    startTransition(() => {
      setCountryDetail?.((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          sistem_ekonomi_val: value,
          sistem_ekonomi_name: details.title,
        };
      });
    });
  }, [setCountryDetail]);

  const handleSectorLevelChange = useCallback((sectorId: NationalizationSectorId, value: number) => {
    setSectorLevels((prev) => {
      if (prev[sectorId] === value) return prev;
      const nextLevels = { ...prev, [sectorId]: value };
      const countryName = String(countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || "").trim();
      if (countryName) {
        void syncNationalizationDiplomacyRelations(
          countryName,
          nextLevels,
          countryDetail?.nationalization_diplomacy_month_counter,
        ).catch((error) => console.error("Gagal menyinkronkan nasionalisasi:", error));
      }
      return nextLevels;
    });

    startTransition(() => {
      setCountryDetail?.((prev: any) => ({
        ...prev,
        sector_nationalization: { ...(prev?.sector_nationalization || {}), [sectorId]: value },
      }));
    });
  }, [countryDetail?.country, countryDetail?.nama_negara, countryDetail?.name_id, countryDetail?.nationalization_diplomacy_month_counter, setCountryDetail]);

  const tabs: { id: typeof activeTab; label: string; desc: string }[] = [
    { id: "sistem", label: "Spektrum Sistem", desc: "Kontrol Skala Terpusat vs Pasar" },
    { id: "kebijakan", label: "Kartu Kebijakan", desc: "Regulasi Sektoral Spesifik" },
    { id: "sektor", label: "Kepemilikan Produksi", desc: "Nasionalisasi per sektor" },
  ];
  const electricityLevel = getNationalizationLevel(sectorLevels, "kelistrikan");
  const diplomacyMonthCounter = Math.max(
    0,
    Math.floor(Number(countryDetail?.nationalization_diplomacy_month_counter) || 0)
  );
  const diplomacyMonthsToNextPoint =
    diplomacyMonthCounter % NATIONALIZATION_DIPLOMACY_INTERVAL_MONTHS;
  const electricityProfitShare = getStateProfitSharePercent(electricityLevel);
  const electricityBalanceMW = electricityMetadataError
    ? 0
    : getCountryConsumptionBreakdown(countryDetail, electricityMetadata).balanceMW;
  const electricitySurplusMW = Math.max(0, electricityBalanceMW);
  const electricityPrice = Math.max(0, Number(countryDetail?.harga?.harga_listrik) || 0);
  const electricityEstimatedStateShare = Math.round(
    electricitySurplusMW * electricityPrice * electricityProfitShare / 100
  );

  return (
    <>
    {!isInfoOpen && <NotebookModalWrapper onClose={onClose}>
      <div className="flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
            </div>
            <div className="min-w-0">
              <h2 className={rootModalTypography.title}>Kebijakan & Sistem Ekonomi</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <button type="button" onClick={() => setIsInfoOpen(true)} title="Informasi kebijakan dan sistem ekonomi" aria-label="Informasi kebijakan dan sistem ekonomi" className="flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-root-accent/50 bg-root-canvas p-1 text-root-accent transition-all hover:bg-root-accent hover:text-root-canvas">
              <Info className="h-3.5 w-3.5" />
            </button>
            <RootModalCloseButton onClick={onClose} />
          </div>
        </div>

        {/* MAIN BODY WITH SIDEBAR TAB MENU */}
        <div className="flex-1 flex min-h-0 relative z-10">
          
          {/* SIDEBAR TABS */}
          <div className="w-44 lg:w-52 2xl:w-64 border-r border-root-accent/30 bg-root-canvas p-2 lg:p-3 flex flex-col gap-1.5 lg:gap-2 overflow-y-auto neon-scrollbar shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full flex-col border p-2 text-left transition-all cursor-pointer lg:p-2.5 ${rootBorderRadius.card} ${
                  activeTab === tab.id
                    ? "bg-root-accent border-root-accent text-root-canvas font-black shadow-md"
                    : "bg-root-surface border-root-accent/20 text-root-text hover:border-root-accent hover:text-root-accent"
                }`}
              >
                <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                <span className={`text-[8px] lg:text-[10px] mt-0.5 ${activeTab === tab.id ? "text-root-canvas/80 font-semibold" : "text-root-subtle"}`}>
                  {tab.desc}
                </span>
              </button>
            ))}
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-3 lg:p-5 2xl:p-8 bg-root-surface neon-scrollbar">
            {activeTab === "sistem" && (
              <SpektrumSistemTab
                sliderValue={sliderValue}
                setSliderValue={setSliderValue}
                onCommit={handleSpectrumChange}
                systemDetails={systemDetails}
                countryDetail={countryDetail}
              />
            )}

            {activeTab === "kebijakan" && (
              <MemoizedKartuKebijakanTab
                policyChoices={policyChoices}
                handlePolicyChange={handlePolicyChange}
              />
            )}
            
            {activeTab === "sektor" && (
              <SektorTab
                sectorLevels={sectorLevels}
                handleSectorLevelChange={handleSectorLevelChange}
                isElectricityMetadataLoading={isElectricityMetadataLoading}
                electricityMetadataError={electricityMetadataError}
                electricitySurplusMW={electricitySurplusMW}
                electricityPrice={electricityPrice}
                electricityProfitShare={electricityProfitShare}
                electricityEstimatedStateShare={electricityEstimatedStateShare}
                diplomacyMonthsToNextPoint={diplomacyMonthsToNextPoint}
              />
            )}

            <SatisfactionBar average={economicPolicyAverage} />
          </div>

        </div>

      </div>
    </NotebookModalWrapper>}
    <MenuInfoModal
      isOpen={isInfoOpen}
      onClose={() => setIsInfoOpen(false)}
      title="Informasi Kebijakan & Sistem Ekonomi"
      description="Atur spektrum sistem ekonomi, pilih kebijakan sektoral, dan sesuaikan kepemilikan atau tingkat nasionalisasi sektor produksi. Perubahan kebijakan membentuk arah ekonomi serta porsi keuntungan negara."
    />
    </>
  );
}