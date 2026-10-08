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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  setCountryDetail?: (detail: any | ((prev: any) => any)) => void;
}

const resolveSistemEkonomiForCountry = (countryDetail: any) => {
  const spektrumVal = countryDetail?.sistem_ekonomi_val ?? 50;

  const choices: Record<string, "A" | "B"> = {
    price_control: countryDetail?.policy_price_control || "A",
    strategic_ownership: countryDetail?.policy_strategic_ownership || "A",
    trade_policy: countryDetail?.policy_trade_policy || "A",
    labor_regulation: countryDetail?.policy_labor_regulation || "A",
  };

  return { spektrumVal, choices };
};

export default function SistemEkonomiModal({ isOpen, onClose, countryDetail, setCountryDetail }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"sistem" | "kebijakan">("sistem");

  // Economic System Slider Value & Policy Choices (Loaded Instantly in 0ms)
  const [sliderValue, setSliderValue] = useState<number>(
    () => resolveSistemEkonomiForCountry(countryDetail).spektrumVal
  );

  const [policyChoices, setPolicyChoices] = useState<Record<string, "A" | "B">>(
    () => resolveSistemEkonomiForCountry(countryDetail).choices
  );

  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  // Sinkronisasi instan tanpa network fetch (0ms)
  useEffect(() => {
    if (!isOpen) return;
    const res = resolveSistemEkonomiForCountry(countryDetail);
    setSliderValue(res.spektrumVal);
    setPolicyChoices(res.choices);
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
    countryDetail?.policy_labor_regulation
  ]);

  if (!isOpen) return null;

  const systemDetails: EconomicSystemEffect = getEconomicSystemDetails(sliderValue);

  const handlePolicyChange = (policyId: string, choice: "A" | "B") => {
    setPolicyChoices((prev) => ({
      ...prev,
      [policyId]: choice,
    }));
  };

  const handleSaveSystem = () => {
    const dateStr = getCurrentGameDateString();
    const notif = generateSistemEkonomiChangeNotification(sliderValue, systemDetails.title, policyChoices, dateStr);

    let newPending = Array.isArray(countryDetail?.pending_notifications) ? [...countryDetail.pending_notifications] : [];
    newPending = [notif, ...newPending];

    if (setCountryDetail) {
      setCountryDetail((prev: any) => ({
        ...prev,
        sistem_ekonomi_val: sliderValue,
        sistem_ekonomi_name: systemDetails.title,
        policy_price_control: policyChoices.price_control,
        policy_strategic_ownership: policyChoices.strategic_ownership,
        policy_trade_policy: policyChoices.trade_policy,
        policy_labor_regulation: policyChoices.labor_regulation,
        pending_notifications: newPending,
      }));
    }

    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2500);
  };

  const tabs = [
    { id: "sistem", label: "Spektrum Sistem", desc: "Kontrol Skala Terpusat vs Pasar" },
    { id: "kebijakan", label: "Kartu Kebijakan", desc: "Regulasi Sektoral Spesifik" },
  ];

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
              className="flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1 lg:py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-[#0A1A1A] font-black text-[9px] lg:text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Terapkan Kebijakan
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
                onClick={() => setActiveTab(tab.id as any)}
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
          </div>

        </div>

      </div>
    </div>
  );
}
