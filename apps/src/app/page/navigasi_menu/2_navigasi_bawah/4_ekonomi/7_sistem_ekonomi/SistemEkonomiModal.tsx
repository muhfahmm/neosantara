"use client";

import React, { useState, useEffect } from "react";
import { X, Scale, Check } from "lucide-react";
import { 
  getEconomicSystemDetails, 
  EconomicSystemEffect 
} from "./logic/logikaSistemEkonomi";

import SpektrumSistemTab from "./tab_menu/1_spektrum_sistem/SpektrumSistemTab";
import KartuKebijakanTab from "./tab_menu/2_kartu_kebijakan/KartuKebijakanTab";
import { generateSistemEkonomiChangeNotification } from "@/app/page/menus/inbox/logic/7_notifikasi_ekonomi/4_sistem_ekonomi/sistemEkonomiChangeLogic";
import { getCurrentGameDateString } from "@/app/logic/gameSessionState";
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

  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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

  const systemDetails: EconomicSystemEffect = getEconomicSystemDetails(sliderValue);
  const economicPolicyAverage = calculateEconomicPolicyAverage(sliderValue, policyChoices, sectorLevels);

  const handlePolicyChange = (policyId: string, choice: "A" | "B") => {
    setPolicyChoices((prev) => ({
      ...prev,
      [policyId]: choice,
    }));
  };

  const handleSaveSystem = async () => {
    setIsSaving(true);
    setSaveError(null);
    const dateStr = getCurrentGameDateString();
    const notif = generateSistemEkonomiChangeNotification(sliderValue, systemDetails.title, policyChoices, dateStr);

    try {
      const countryName = String(
        countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || ""
      ).trim();
      if (!countryName) throw new Error("Negara aktif tidak ditemukan; kebijakan belum diterapkan.");

      await syncNationalizationDiplomacyRelations(
        countryName,
        sectorLevels,
        countryDetail?.nationalization_diplomacy_month_counter
      );

      if (setCountryDetail) {
        setCountryDetail((prev: any) => {
          const currentPending = Array.isArray(prev?.pending_notifications)
            ? prev.pending_notifications
            : [];
          return {
            ...prev,
            sistem_ekonomi_val: sliderValue,
            sistem_ekonomi_name: systemDetails.title,
            policy_price_control: policyChoices.price_control,
            policy_strategic_ownership: policyChoices.strategic_ownership,
            policy_trade_policy: policyChoices.trade_policy,
            policy_labor_regulation: policyChoices.labor_regulation,
            policy_land_property_rights: policyChoices.land_property_rights,
            policy_labor_unions_rights: policyChoices.labor_unions_rights,
            policy_monetary_banking: policyChoices.monetary_banking,
            sector_nationalization: { ...sectorLevels },
            pending_notifications: [notif, ...currentPending],
          };
        });
      }

      setIsSavedSuccess(true);
      setTimeout(() => setIsSavedSuccess(false), 2500);
    } catch (error) {
      console.error("Gagal menerapkan kebijakan nasionalisasi:", error);
      setSaveError(error instanceof Error ? error.message : "Gagal menerapkan kebijakan ekonomi.");
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Kebijakan & Sistem Ekonomi</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={handleSaveSystem}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1 lg:py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-[#0A1A1A] font-black text-[9px] lg:text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-wait"
            >
              <Check className="w-3.5 h-3.5" />
              {isSaving ? "Menerapkan..." : "Terapkan Kebijakan"}
            </button>

            <button 
              onClick={onClose} 
              className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
            >
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* FEEDBACK SUCCESS TOAST */}
        {isSavedSuccess && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-emerald-500 text-[#0A1A1A] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95">
            <Check className="w-4 h-4" /> Kebijakan Ekonomi Berhasil Diperbarui!
          </div>
        )}

        {/* MAIN BODY WITH SIDEBAR TAB MENU */}
        <div className="flex-1 flex min-h-0 relative z-10">
          
          {/* SIDEBAR TABS */}
          <div className="w-44 lg:w-52 2xl:w-64 border-r border-[#00FFAA]/30 bg-[#0A1A1A] p-2 lg:p-3 flex flex-col gap-1.5 lg:gap-2 overflow-y-auto no-scrollbar shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col w-full p-2 lg:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md"
                    : "bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]"
                }`}
              >
                <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                <span className={`text-[8px] lg:text-[10px] mt-0.5 ${activeTab === tab.id ? "text-[#0A1A1A]/80 font-semibold" : "text-[#6B8A8A]"}`}>
                  {tab.desc}
                </span>
              </button>
            ))}
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-3 lg:p-5 2xl:p-8 bg-[#0F2424] no-scrollbar">
            {saveError && (
              <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-300">
                {saveError}
              </div>
            )}
            {activeTab === "sistem" && (
              <SpektrumSistemTab
                sliderValue={sliderValue}
                setSliderValue={setSliderValue}
                systemDetails={systemDetails}
              />
            )}

            {activeTab === "kebijakan" && (
              <KartuKebijakanTab
                policyChoices={policyChoices}
                handlePolicyChange={handlePolicyChange}
              />
            )}
            {activeTab === "sektor" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4">
                  <h3 className="text-sm font-black uppercase tracking-wide text-[#00FFAA]">Nasionalisasi & Ekonomi Terpusat</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#A7C4C4]">
                    Atur kepemilikan setiap sektor. Bagian negara berlaku saat komoditas dijual melalui Perdagangan;
                    emas mengikuti porsi Mineral & Energi pada pemasukan tambang yang sudah ada. Nasionalisasi aktif
                    secara bertahap menurunkan hubungan dengan negara berideologi Kapitalisme.
                  </p>
                  <p className="mt-2 text-xs font-bold text-amber-300">
                    Hubungan dengan negara terbuka turun 1 poin setiap 6 bulan selama ada sektor yang dinasionalisasi.
                    Penurunan berjalan untuk negara berideologi Kapitalisme.
                  </p>
                  <p className="mt-1 text-[10px] text-[#6B8A8A]">
                    Progres periode berjalan: {diplomacyMonthsToNextPoint}/
                    {NATIONALIZATION_DIPLOMACY_INTERVAL_MONTHS} bulan menuju penurunan 1 poin berikutnya.
                  </p>
                  <p className="mt-1 text-[10px] text-[#6B8A8A]">
                    Tahun acuan estimasi: {NATIONALIZATION_ESTIMATE_YEAR}
                  </p>
                </div>
                <div className="grid gap-3">
                  {NATIONALIZATION_SECTORS.map((sector) => {
                    const level = getNationalizationLevel(sectorLevels, sector.id);
                    const levelDetails = NATIONALIZATION_LEVELS.find((item) => item.value === level) ?? NATIONALIZATION_LEVELS[0];
                    return (
                      <section key={sector.id} className="rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="text-sm font-black text-white">{sector.name}</h4>
                            <p className="mt-1 text-[11px] text-[#A7C4C4]">{levelDetails.description}</p>
                          </div>
                          <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#6B8A8A]">
                            Level
                            <select
                              value={level}
                              onChange={(event) => setSectorLevels((previous) => ({
                                ...previous,
                                [sector.id]: Number(event.target.value),
                              }))}
                              className="rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] px-3 py-2 text-xs font-bold text-[#00FFAA] outline-none"
                            >
                              {NATIONALIZATION_LEVELS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.value}% — {option.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-[#00FFAA]/10 pt-3 text-[11px]">
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
                                Estimasi bagian negara dari surplus: {electricitySurplusMW.toLocaleString("id-ID")} MW ×{" "}
                                {electricityPrice.toLocaleString("id-ID")} NEO × {electricityProfitShare}% ={" "}
                                {electricityEstimatedStateShare.toLocaleString("id-ID")} NEO. Estimasi ini belum
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
            )}

            <div className="mt-6 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-black uppercase tracking-widest text-[#00FFAA]">
                  Indeks Kepuasan Rakyat (Kebijakan Ekonomi)
                </span>
                <span className="shrink-0 text-2xl font-black text-amber-400 sm:text-3xl">
                  {economicPolicyAverage} / 100
                </span>
              </div>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full border border-[#00FFAA]/20 bg-[#0A1A1A]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-200"
                  style={{ width: `${economicPolicyAverage}%` }}
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
