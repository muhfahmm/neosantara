"use client"
import React, { useState } from "react";
import { X, Award } from "lucide-react";
import ResolusiPBB from "./1_resolusi_PBB/1_resolusiPBB";
import KeamananPBB from "./2_keamanan_PBB/1_keamananPBB";
import SuaraPBB from "./3_suara_negara_PBB/suaraPBB";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: any;
}

export default function PBBModal({ isOpen, onClose, selectedCountry }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"resolusi" | "keamanan" | "suara">("resolusi");

  if (!isOpen) return null;
  const countryName = selectedCountry?.country || "Indonesia";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <Award className="h-6 w-6 text-[#00FFAA] animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#00FFAA] tracking-wider uppercase">Sidang Umum Perserikatan Bangsa-Bangsa</h2>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar">
          {/* 3 TAB MENU */}
          <div className="bg-[#0A1A1A] p-1 rounded-xl border border-[#00FFAA]/20 inline-flex mb-6 shadow-sm">
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

          {/* Render 3 Komponen Berdasarkan Active Tab */}
          {activeTab === "resolusi" && <ResolusiPBB selectedCountry={selectedCountry} />}
          {activeTab === "keamanan" && <KeamananPBB selectedCountry={selectedCountry} />}
          {activeTab === "suara" && <SuaraPBB countryDetail={selectedCountry} />}
          
        </div>
      </div>
    </div>
  );
}