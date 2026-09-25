"use client"
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Shield, Globe, Vote, Crown, DollarSign, Handshake, Hammer, Flag, Feather, Sword, Check } from "lucide-react";
import { COUNTRIES_DATA } from "../../../../map_system/map-data";
import { PROFILES_IDEOLOGY_DATA } from "@/../../json/semua_fitur_negara/0_profiles/index";

import IdeologiConfirmModal from "./modalsGanti";
import IdeologiGagalModal from "./modalsGagalGanti";
import { attemptChangeIdeology, IDEOLOGY_CHANGE_COST } from "./logic/logikaPergantian";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDebt?: () => void;
  countryDetail: any;
  setCountryDetail?: (detail: any | ((prev: any) => any)) => void;
}

const IDEOLOGY_OPTIONS = [
  'Demokrasi', 'Monarki', 'Kapitalisme', 'Sosialisme', 'Komunisme', 'Nasionalisme', 'Konservatisme', 'Liberalisme', 'Otoritarianisme',
];

const IDEOLOGY_BONUSES: Record<string, string> = {
  'Demokrasi': 'Penerimaan pajak: +10%',
  'Monarki': 'Pertahanan militer: +10%',
  'Kapitalisme': 'Penerimaan pajak: +50%',
  'Sosialisme': '+10% bonus ke tingkat kelahiran',
  'Komunisme': 'Produksi industri: +20%',
  'Nasionalisme': 'Kecepatan produksi pangan +10%',
  'Konservatisme': 'Penerimaan pajak: +5%',
  'Liberalisme': 'Kebebasan dagang: +15%',
  'Otoritarianisme': 'Produksi sumber daya: +20%',
};

const IDEOLOGY_ICONS: Record<string, React.ReactNode> = {
  'Demokrasi': <Vote className="w-5 h-5" />,
  'Monarki': <Crown className="w-5 h-5" />,
  'Kapitalisme': <DollarSign className="w-5 h-5" />,
  'Sosialisme': <Handshake className="w-5 h-5" />,
  'Komunisme': <Hammer className="w-5 h-5" />,
  'Nasionalisme': <Flag className="w-5 h-5" />,
  'Konservatisme': <Shield className="w-5 h-5" />,
  'Liberalisme': <Feather className="w-5 h-5" />,
  'Otoritarianisme': <Sword className="w-5 h-5" />,
};

export default function IdeologiModal({ isOpen, onClose, onOpenDebt, countryDetail, setCountryDetail }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ideologi" | "dunia">("ideologi");
  const [selectedIdeology, setSelectedIdeology] = useState<string | null>(null);
  
  // 🔥 STATE BARU UNTUK MODAL KONFIRMASI
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [worldIdeologies, setWorldIdeologies] = useState<{ country: string; ideology: string }[]>([]);
  const [sortMode, setSortMode] = useState<"default" | "unavailable-last" | "az" | "za">("default");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const profileLookup = new Map<string, string>();
    for (const p of PROFILES_IDEOLOGY_DATA) {
      profileLookup.set(p.name_id.toLowerCase().trim(), p.ideology);
    }

    const data = COUNTRIES_DATA.map((c) => {
      const countryNameLower = c.country.toLowerCase().trim();
      if (
        countryDetail?.country &&
        c.country.toLowerCase().trim() === countryDetail.country.toLowerCase().trim() &&
        countryDetail?.ideology
      ) {
        return { country: c.country, ideology: countryDetail.ideology };
      }
      const profileIdeology = profileLookup.get(countryNameLower);
      return { country: c.country, ideology: profileIdeology || 'Belum tersedia' };
    });
    setWorldIdeologies(data);
  }, [isOpen, countryDetail]);

  const sortedWorldIdeologies = useMemo(() => {
    if (sortMode === "default") return worldIdeologies;
    return [...worldIdeologies].sort((a, b) => {
      const aUnav = a.ideology === 'Belum tersedia';
      const bUnav = b.ideology === 'Belum tersedia';

      if (sortMode === "unavailable-last") {
        if (aUnav && !bUnav) return 1;
        if (!aUnav && bUnav) return -1;
        return a.ideology.localeCompare(b.ideology);
      }
      const compare = a.ideology.localeCompare(b.ideology);
      return sortMode === "az" ? compare : -compare;
    });
  }, [worldIdeologies, sortMode]);

  const cycleSortMode = () => {
    setSortMode((prev) => {
      if (prev === "default") return "unavailable-last";
      if (prev === "unavailable-last") return "az";
      if (prev === "az") return "za";
      return "default";
    });
  };

  if (!isOpen || !mounted) return null;
  const ideology = countryDetail?.ideology || "Demokratis Pancasila";
  const anggaran = Number(countryDetail?.anggaran) || 0;

  const handleSelectIdeology = (option: string) => {
    setSelectedIdeology(option);
    setIsConfirmOpen(true); // 🔥 Buka modal konfirmasi baru
  };

  const handleConfirmChange = () => {
    if (!selectedIdeology) return;
    const result = attemptChangeIdeology(anggaran);
    if (!result.success) {
      setShowErrorModal(true);
      return;
    }
    setCountryDetail?.((prev: any) => ({
      ...(prev || {}),
      ideology: selectedIdeology,
      anggaran: result.newAnggaran,
      message: `Ideologi negara diubah ke ${selectedIdeology}. Biaya perubahan ${IDEOLOGY_CHANGE_COST.toLocaleString('id-ID')} EM.`
    }));
    setFeedback({
      type: "success",
      message: `Ideologi berhasil diubah menjadi ${selectedIdeology}. Biaya ${IDEOLOGY_CHANGE_COST.toLocaleString('id-ID')} EM telah dipotong.`
    });
    setIsConfirmOpen(false);
  };

  return createPortal(
    <>
      {/* 🔥 RENDER KONFIRMASI MODAL BARU */}
      <IdeologiConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmChange}
        title={selectedIdeology || ''}
        icon={selectedIdeology ? IDEOLOGY_ICONS[selectedIdeology] : <Shield className="w-5 h-5" />}
        bonusText={selectedIdeology ? IDEOLOGY_BONUSES[selectedIdeology] || 'Tidak ada bonus spesifik' : ''}
        cost={IDEOLOGY_CHANGE_COST}
      />
      <IdeologiGagalModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onBorrow={onOpenDebt}
        cost={IDEOLOGY_CHANGE_COST}
        currentMoney={anggaran}
      />

      <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/30">
                <Shield className="h-5 w-5 text-[#00FFAA]" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#E0E0E0] tracking-wide uppercase">Ideologi Dasar Kedaulatan</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
            >
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#0F2424] relative z-10 custom-scrollbar">
            <div className="bg-[#051111] p-1 rounded-xl border border-[#00FFAA]/20 inline-flex mb-6 shadow-sm">
              <button onClick={() => setActiveTab("ideologi")}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "ideologi" ? "bg-[#00FFAA] text-[#0A1A1A] shadow-lg shadow-[#00FFAA]/20" : "text-[#6B8A8A] hover:text-[#E0E0E0]"}`}>
                Ideologi & Kedaulatan
              </button>
              <button onClick={() => setActiveTab("dunia")}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "dunia" ? "bg-[#00FFAA] text-[#0A1A1A] shadow-lg shadow-[#00FFAA]/20" : "text-[#6B8A8A] hover:text-[#E0E0E0]"}`}>
                Ideologi Dunia
              </button>
            </div>

            {activeTab === "ideologi" && (
              <div className="space-y-6">
                <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl flex justify-between items-center">
                  <div className="text-xs font-bold text-[#E0E0E0]">
                    <span>Ideologi Utama:</span>
                    <span className="ml-1.5 text-[#00FFAA]">{ideology}</span>
                  </div>
                  <div className="text-xs font-bold text-[#E0E0E0]">
                    <span>Anggaran:</span>
                    <span className="ml-1.5 text-[#00FFAA]">{anggaran.toLocaleString('id-ID')} EM</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#00FFAA] uppercase tracking-wider mb-4">Pilih Ideologi Negara</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {IDEOLOGY_OPTIONS.map((option) => {
                    const isActive = String(countryDetail?.ideology || '').toLowerCase() === String(option).toLowerCase();
                    const isSelected = String(selectedIdeology || '').toLowerCase() === String(option).toLowerCase();
                    
                    return (
                      <button 
                        key={option} 
                        type="button" 
                        onClick={() => handleSelectIdeology(option)}
                        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer text-left ${
                          isActive 
                            ? 'border-[#00FFAA] bg-[#00FFAA]/15 shadow-md' 
                            : 'border-[#00FFAA]/20 bg-[#0A1A1A] hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/5'
                        }`}
                      >
                        <div className={`relative w-14 h-16 flex-shrink-0 rounded-md flex items-center justify-center shadow-lg border-b-[4px] bg-[#051111] border-[#00FFAA]/40`}>
                          <div className="absolute top-1 left-2 w-2 h-4 bg-[#00FFAA]/20 rounded-full" />
                          <div className="absolute top-1 right-2 w-2 h-4 bg-[#00FFAA]/20 rounded-full" />
                          <div className="text-[#00FFAA]">
                            {IDEOLOGY_ICONS[option] || <Shield className="w-5 h-5" />}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            {isActive && <Check className="w-4 h-4 text-[#00FFAA] font-bold" />}
                            <span className={`text-sm font-bold ${isActive ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'}`}>
                              {option}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B8A8A] mt-1 leading-tight">
                            {IDEOLOGY_BONUSES[option] || 'Tidak ada bonus spesifik'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {feedback && feedback.type === 'success' && (
                  <div className="mt-6 p-4 rounded-xl border border-[#00FFAA]/30 bg-[#00FFAA]/10 text-[#00FFAA]">{feedback.message}</div>
                )}
              </div>
            )}

            {activeTab === "dunia" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#00FFAA]/15 mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#00FFAA]" />
                    <h4 className="text-sm font-bold text-[#E0E0E0] uppercase tracking-wider">Daftar Ideologi Seluruh Negara ({worldIdeologies.length} Negara)</h4>
                  </div>
                </div>
                <div className="overflow-x-auto border border-[#00FFAA]/20 rounded-xl bg-[#0A1A1A] shadow-sm max-h-[400px] custom-scrollbar">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-[#051111] border-b border-[#00FFAA]/20 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-bold text-[#00FFAA] uppercase tracking-wider w-12 text-center">No</th>
                        <th className="px-4 py-3 font-bold text-[#00FFAA] uppercase tracking-wider">Negara</th>
                        <th onClick={cycleSortMode} className="px-4 py-3 font-bold text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors">
                          Ideologi
                          <span className="ml-2 text-[10px] text-[#6B8A8A]">
                            {sortMode === "default" && "↕"}
                            {sortMode === "unavailable-last" && "↑↓"}
                            {sortMode === "az" && "↑"}
                            {sortMode === "za" && "↓"}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#00FFAA]/10">
                      {sortedWorldIdeologies.map((item, idx) => {
                        const isUserCountry = countryDetail?.country &&
                          item.country.toLowerCase().trim() === countryDetail.country.toLowerCase().trim();
                        return (
                          <tr key={idx} className={`transition-colors ${isUserCountry ? 'bg-[#00FFAA]/15 hover:bg-[#00FFAA]/25 border-l-4 border-l-[#00FFAA]' : 'hover:bg-[#00FFAA]/5'}`}>
                            <td className={`px-4 py-2.5 text-center font-bold ${isUserCountry ? 'text-[#00FFAA]' : 'text-[#6B8A8A]'}`}>{idx + 1}</td>
                            <td className={`px-4 py-2.5 font-bold ${isUserCountry ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'}`}>
                              {item.country}
                            </td>
                            <td className={`px-4 py-2.5 ${isUserCountry ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'}`}>
                              {item.ideology === 'Belum tersedia' ? (
                                <span className="text-[#6B8A8A] italic font-medium">Belum tersedia</span>
                              ) : (
                                <div className="flex items-center gap-2 font-bold">
                                  {IDEOLOGY_ICONS[item.ideology] || <Shield className="w-4 h-4 text-[#00FFAA]" />}
                                  {item.ideology}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}