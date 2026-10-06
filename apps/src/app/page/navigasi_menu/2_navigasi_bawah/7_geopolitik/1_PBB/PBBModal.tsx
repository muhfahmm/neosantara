"use client"
import React, { useState } from "react";
import { X, Award, Info } from "lucide-react";
import ResolusiPBB from "./1_resolusi_PBB/menus/1_resolusiPBB";
import KeamananPBB from "./2_keamanan_PBB/menus/1_keamananPBB";
import SuaraPBB from "./3_suara_negara_PBB/suaraPBB";
import SecurityCouncilElectionPanel from "./2_keamanan_PBB/logika_anggota_tidak_tetap/SecurityCouncilElectionPanel";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: any;
  countryDetail: Record<string, unknown> | null;
  setCountryDetail?: (update: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
  currentDate?: Date;
}

export default function PBBModal({ isOpen, onClose, selectedCountry, countryDetail, setCountryDetail, currentDate }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"resolusi" | "keamanan" | "suara">("resolusi");
  const [isElectionInfoOpen, setIsElectionInfoOpen] = useState(false);

  if (!isOpen) return null;
  const countryName = selectedCountry?.country || "Indonesia";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA] animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Sidang Umum Perserikatan Bangsa-Bangsa</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">{countryName}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar">
          {/* 3 TAB MENU */}
          <div className="flex w-full items-center justify-between gap-3 mb-6">
            <div className="bg-[#0A1A1A] p-1 rounded-xl border border-[#00FFAA]/20 inline-flex shadow-sm">
              <button
                onClick={() => setActiveTab("resolusi")}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === "resolusi"
                    ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20"
                    : "text-[#6B8A8A] hover:text-[#00FFAA]"
                }`}
              >
                Resolusi PBB
              </button>
              <button
                onClick={() => setActiveTab("keamanan")}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === "keamanan"
                    ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20"
                    : "text-[#6B8A8A] hover:text-[#00FFAA]"
                }`}
              >
                Dewan Keamanan
              </button>
              <button
                onClick={() => setActiveTab("suara")}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === "suara"
                    ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20"
                    : "text-[#6B8A8A] hover:text-[#00FFAA]"
                }`}
              >
                Suara Negara
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsElectionInfoOpen(open => !open)}
              aria-label="Informasi pemilihan anggota tidak tetap Dewan Keamanan PBB"
              aria-expanded={isElectionInfoOpen}
              aria-controls="pbb-security-council-election-info"
              title="Pemilihan anggota tidak tetap DK PBB"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                isElectionInfoOpen
                  ? "border-[#00FFAA] bg-[#00FFAA] text-[#0A1A1A]"
                  : "border-[#00FFAA]/30 bg-[#0A1A1A] text-[#00FFAA] hover:border-[#00FFAA] hover:bg-[#00FFAA]/10"
              }`}
            >
              <Info className="h-5 w-5" />
            </button>
          </div>

          {isElectionInfoOpen && (
            <div id="pbb-security-council-election-info" className="mb-6">
              <SecurityCouncilElectionPanel
                selectedCountry={selectedCountry}
                currentDate={currentDate}
                countryDetail={countryDetail}
                setCountryDetail={setCountryDetail}
              />
            </div>
          )}

          {/* Render 3 Komponen Berdasarkan Active Tab */}
          {activeTab === "resolusi" && <ResolusiPBB selectedCountry={selectedCountry} />}
          {activeTab === "keamanan" && (
            <KeamananPBB
              selectedCountry={selectedCountry}
              countryDetail={countryDetail}
              setCountryDetail={setCountryDetail}
            />
          )}
          {activeTab === "suara" && <SuaraPBB countryDetail={selectedCountry} />}
          
        </div>
      </div>
    </div>
  );
}