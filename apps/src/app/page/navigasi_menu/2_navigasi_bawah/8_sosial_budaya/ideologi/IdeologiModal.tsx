"use client"
import React, { useState, useEffect, useMemo } from "react";
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
  const [activeTab, setActiveTab] = useState<"ideologi" | "dunia">("ideologi");
  const [selectedIdeology, setSelectedIdeology] = useState<string | null>(null);
  
  // 🔥 STATE BARU UNTUK MODAL KONFIRMASI
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [worldIdeologies, setWorldIdeologies] = useState<{ country: string; ideology: string }[]>([]);
  const [sortMode, setSortMode] = useState<"default" | "unavailable-last" | "az" | "za">("default");

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

  if (!isOpen) return null;
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

  return (
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

      <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />
          <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-purple-700" />
              <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Ideologi Dasar Kedaulatan</h2>
            </div>
            <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar">
            <div className="bg-[#e4dac3]/40 p-1 rounded-xl border border-[#C4B49C]/40 inline-flex mb-6 shadow-sm">
              <button onClick={() => setActiveTab("ideologi")}
                className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "ideologi" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md" : "text-[#8b7e66] hover:text-[#5c3c10]"}`}>
                Ideologi & Kedaulatan
              </button>
              <button onClick={() => setActiveTab("dunia")}
                className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "dunia" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md" : "text-[#8b7e66] hover:text-[#5c3c10]"}`}>
                Ideologi Dunia
              </button>
            </div>

            {activeTab === "ideologi" && (
              <div className="space-y-6">
                <div className="bg-[#e4dac3]/20 border border-[#C4B49C]/30 p-4 rounded-xl flex justify-between items-center">
                  <div className="text-xs font-bold text-[#5c3c10]">
                    <span>Ideologi Utama:</span>
                    <span className="ml-1 text-purple-700">{ideology}</span>
                  </div>
                  <div className="text-xs font-bold text-[#5c3c10]">
                    <span>Anggaran:</span>
                    <span className="ml-1 text-[#2e261a]">{anggaran.toLocaleString('id-ID')} EM</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#5c3c10] mb-4">Pilih Ideologi Negara</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {IDEOLOGY_OPTIONS.map((option) => {
                    const isActive = String(countryDetail?.ideology || '').toLowerCase() === String(option).toLowerCase();
                    const isSelected = String(selectedIdeology || '').toLowerCase() === String(option).toLowerCase();
                    
                    return (
                      <button 
                        key={option} 
                        type="button" 
                        onClick={() => handleSelectIdeology(option)}
                        className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all bg-white cursor-pointer text-left ${
                          isActive 
                            ? 'border-amber-600 shadow-md ring-1 ring-amber-600/20' 
                            : 'border-[#C4B49C]/40 hover:border-[#C4B49C]/80'
                        }`}
                      >
                        <div className={`relative w-14 h-16 flex-shrink-0 rounded-md flex items-center justify-center shadow-lg border-b-[4px] bg-[#2e4a4a] border-[#1a2b2b]`}>
                          <div className="absolute top-1 left-2 w-2 h-4 bg-white/20 rounded-full" />
                          <div className="absolute top-1 right-2 w-2 h-4 bg-white/20 rounded-full" />
                          <div className="text-white">
                            {IDEOLOGY_ICONS[option] || <Shield className="w-5 h-5" />}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            {isActive && <Check className="w-4 h-4 text-emerald-500 font-bold" />}
                            <span className={`text-sm font-bold ${isActive ? 'text-[#2e261a]' : 'text-[#5c3c10]'}`}>
                              {option}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-600 mt-0.5 opacity-90 leading-tight">
                            {IDEOLOGY_BONUSES[option] || 'Tidak ada bonus spesifik'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {feedback && feedback.type === 'success' && (
                  <div className="mt-6 p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900">{feedback.message}</div>
                )}
              </div>
            )}

            {activeTab === "dunia" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#C4B49C]/20 mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#5c3c10]" />
                    <h4 className="text-sm font-black text-[#5c3c10] uppercase tracking-wider">Daftar Ideologi Seluruh Negara ({worldIdeologies.length} Negara)</h4>
                  </div>
                </div>
                <div className="overflow-x-auto border border-[#C4B49C]/30 rounded-xl bg-[#FAF6EE]/50 shadow-sm max-h-[400px]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#e4dac3] border-b-2 border-[#C4B49C] sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-black text-[#5c3c10] uppercase tracking-wider w-12 text-center">No</th>
                        <th className="px-4 py-3 font-black text-[#5c3c10] uppercase tracking-wider">Negara</th>
                        <th onClick={cycleSortMode} className="px-4 py-3 font-black text-[#5c3c10] uppercase tracking-wider cursor-pointer hover:bg-[#d6c8b0] transition-colors">
                          Ideologi
                          <span className="ml-2 text-[10px] text-[#8b7e66]">
                            {sortMode === "default" && "↕"}
                            {sortMode === "unavailable-last" && "↑↓"}
                            {sortMode === "az" && "↑"}
                            {sortMode === "za" && "↓"}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C4B49C]/20">
                      {sortedWorldIdeologies.map((item, idx) => {
                        const isUserCountry = countryDetail?.country &&
                          item.country.toLowerCase().trim() === countryDetail.country.toLowerCase().trim();
                        return (
                          <tr key={idx} className={`transition-colors ${isUserCountry ? 'bg-emerald-100/80 hover:bg-emerald-200/80 border-l-4 border-l-emerald-600' : 'hover:bg-[#e4dac3]/20'}`}>
                            <td className={`px-4 py-2.5 text-center font-bold ${isUserCountry ? 'text-emerald-900' : 'text-[#8b7e66]'}`}>{idx + 1}</td>
                            <td className={`px-4 py-2.5 font-bold ${isUserCountry ? 'text-emerald-900' : 'text-[#5c3c10]'}`}>
                              {item.country}
                            </td>
                            <td className={`px-4 py-2.5 ${isUserCountry ? 'text-emerald-600' : 'text-[#5c3c10]'}`}>
                              {item.ideology === 'Belum tersedia' ? (
                                <span className="text-[#C4B49C] italic font-medium">Belum tersedia</span>
                              ) : (
                                <div className="flex items-center gap-2 font-bold">
                                  {IDEOLOGY_ICONS[item.ideology] || <Shield className="w-4 h-4 text-[#2e261a]" />}
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
    </>
  );
}