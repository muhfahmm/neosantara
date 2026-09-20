"use client"
import React, { useState, useEffect, useMemo } from "react";
import { X, Star, Globe, MoonStar, Church, Sun, CircleDot, Atom, Check } from "lucide-react";
import { COUNTRIES_DATA } from "../../../../map_system/map-data";
import { PROFILES_RELIGION_DATA } from "@/../../json/semua_fitur_negara/0_profiles/index";

// 🔥 IMPOR MODAL KONFIRMASI DAN GAGAL
import AgamaConfirmModal from "./modalsGanti";
import AgamaGagalModal from "./modalsGagalGanti";

// 🔥 IMPOR LOGIKA DARI FILE LOGIKA (Pastikan file logikaPergantian.ts memiliki attemptChangeReligion dan RELIGION_CHANGE_COST)
import { attemptChangeReligion, RELIGION_CHANGE_COST } from "./logic/logikaPergantian";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDebt?: () => void;
  countryDetail: any;
  setCountryDetail?: (detail: any | ((prev: any) => any)) => void;
}

const RELIGION_OPTIONS = [
  'Islam', 'Katolik', 'Protestan', 'Kristen Ortodoks', 'Hindu', 'Buddha', 'Yahudi', 'Shinto', 'Ateisme',
];

const RELIGION_BONUSES: Record<string, string> = {
  'Islam': 'Jumlah makanan dan sumber daya +10%',
  'Katolik': 'Serangan tentara +10%',
  'Protestan': 'Harga jual +5%, harga beli -5%',
  'Kristen Ortodoks': 'Pertahanan tentara +10%',
  'Hindu': 'Waktu persiapan untuk unit -10%',
  'Buddha': 'Bonus kebahagiaan rakyat +5%',
  'Yahudi': 'Waktu pembangunan pabrik dan tambang -10%',
  'Shinto': 'Pertumbuhan populasi +8%',
  'Ateisme': 'Efisiensi riset sains +10%',
};

const RELIGION_ICONS: Record<string, React.ReactNode> = {
  'Islam': <MoonStar className="w-5 h-5" />,
  'Katolik': <Church className="w-5 h-5" />,
  'Protestan': <Church className="w-5 h-5" />,
  'Kristen Ortodoks': <Church className="w-5 h-5" />,
  'Hindu': <Sun className="w-5 h-5" />,
  'Buddha': <CircleDot className="w-5 h-5" />,
  'Yahudi': <Star className="w-5 h-5" />,
  'Shinto': <Globe className="w-5 h-5" />,
  'Ateisme': <Atom className="w-5 h-5" />,
};

export default function AgamaModal({ isOpen, onClose, onOpenDebt, countryDetail, setCountryDetail }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"agama" | "dunia">("agama");
  const [selectedReligion, setSelectedReligion] = useState<string | null>(null);
  
  // 🔥 STATE UNTUK MODAL KONFIRMASI & GAGAL
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [worldReligions, setWorldReligions] = useState<{ country: string; religion: string }[]>([]);
  const [sortMode, setSortMode] = useState<"default" | "unavailable-last" | "az" | "za">("default");

  useEffect(() => {
    if (!isOpen) return;
    const profileLookup = new Map<string, string>();
    for (const p of PROFILES_RELIGION_DATA) {
      profileLookup.set(p.name_id.toLowerCase().trim(), p.religion);
    }

    const data = COUNTRIES_DATA.map((c) => {
      const countryNameLower = c.country.toLowerCase().trim();
      if (
        countryDetail?.country &&
        c.country.toLowerCase().trim() === countryDetail.country.toLowerCase().trim() &&
        countryDetail?.religion
      ) {
        return { country: c.country, religion: countryDetail.religion };
      }
      const profileReligion = profileLookup.get(countryNameLower);
      return { country: c.country, religion: profileReligion || 'Belum tersedia' };
    });
    setWorldReligions(data);
  }, [isOpen, countryDetail]);

  const sortedWorldReligions = useMemo(() => {
    if (sortMode === "default") return worldReligions;
    return [...worldReligions].sort((a, b) => {
      const aUnav = a.religion === 'Belum tersedia';
      const bUnav = b.religion === 'Belum tersedia';

      if (sortMode === "unavailable-last") {
        if (aUnav && !bUnav) return 1;
        if (!aUnav && bUnav) return -1;
        return a.religion.localeCompare(b.religion);
      }
      const compare = a.religion.localeCompare(b.religion);
      return sortMode === "az" ? compare : -compare;
    });
  }, [worldReligions, sortMode]);

  const cycleSortMode = () => {
    setSortMode((prev) => {
      if (prev === "default") return "unavailable-last";
      if (prev === "unavailable-last") return "az";
      if (prev === "az") return "za";
      return "default";
    });
  };

  if (!isOpen) return null;
  const religion = countryDetail?.religion || "Mayoritas Muslim";
  const anggaran = Number(countryDetail?.anggaran) || 0;

  const handleSelectReligion = (religionName: string) => {
    setSelectedReligion(religionName);
    setIsConfirmOpen(true);
  };

  const handleConfirmChange = () => {
    if (!selectedReligion) return;
    // 🔥 Gunakan logika attemptChangeReligion
    const result = attemptChangeReligion(anggaran);
    if (!result.success) {
      setShowErrorModal(true);
      return;
    }
    setCountryDetail?.((prev: any) => ({
      ...(prev || {}),
      religion: selectedReligion,
      anggaran: result.newAnggaran,
      message: `Agama negara diubah ke ${selectedReligion}. Biaya perubahan ${RELIGION_CHANGE_COST.toLocaleString('id-ID')} EM.`
    }));
    setFeedback({
      type: "success",
      message: `Agama berhasil diubah menjadi ${selectedReligion}. Biaya ${RELIGION_CHANGE_COST.toLocaleString('id-ID')} EM telah dipotong.`
    });
    setIsConfirmOpen(false);
  };

  return (
    <>
      {/* 🔥 RENDER KONFIRMASI & GAGAL MODAL */}
      <AgamaConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmChange}
        title={selectedReligion || ''}
        icon={selectedReligion ? RELIGION_ICONS[selectedReligion] : <Globe className="w-5 h-5" />}
        bonusText={selectedReligion ? RELIGION_BONUSES[selectedReligion] || 'Tidak ada bonus spesifik' : ''}
        cost={RELIGION_CHANGE_COST}
      />
      <AgamaGagalModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onBorrow={onOpenDebt}
        cost={RELIGION_CHANGE_COST}
        currentMoney={anggaran}
      />

      {/* MODAL UTAMA AGAMA */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
          <div className="px-8 py-5 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30">
                <Star className="h-6 w-6 text-[#00FFAA] animate-spin" style={{ animationDuration: '12s' }} />
              </div>
              <h2 className="text-xl font-bold text-[#E0E0E0] tracking-wide leading-none uppercase">Agama & Kebebasan Berkeyakinan</h2>
            </div>
            <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#00FFAA]/10 text-[#00FFAA] hover:bg-[#00FFAA]/20 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#0F2424] relative z-10 custom-scrollbar">
            <div className="bg-[#051111] p-1 rounded-xl border border-[#00FFAA]/20 inline-flex mb-6 shadow-sm">
              <button onClick={() => setActiveTab("agama")}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "agama" ? "bg-[#00FFAA] text-[#0A1A1A] shadow-lg shadow-[#00FFAA]/20" : "text-[#6B8A8A] hover:text-[#E0E0E0]"}`}>
                Agama & Kebebasan Berkeyakinan
              </button>
              <button onClick={() => setActiveTab("dunia")}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "dunia" ? "bg-[#00FFAA] text-[#0A1A1A] shadow-lg shadow-[#00FFAA]/20" : "text-[#6B8A8A] hover:text-[#E0E0E0]"}`}>
                Agama Dunia
              </button>
            </div>

            {activeTab === "agama" && (
              <div className="space-y-6">
                <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl flex justify-between items-center">
                  <div className="text-xs font-bold text-[#E0E0E0]">
                    <span>Agama Saat Ini:</span>
                    <span className="ml-1.5 text-[#00FFAA]">{religion}</span>
                  </div>
                  <div className="text-xs font-bold text-[#E0E0E0]">
                    <span>Anggaran:</span>
                    <span className="ml-1.5 text-[#00FFAA]">{anggaran.toLocaleString('id-ID')} EM</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#00FFAA] uppercase tracking-wider mb-4">Pilih Agama Baru</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {RELIGION_OPTIONS.map((r) => {
                    const isActive = String(countryDetail?.religion || '').toLowerCase() === String(r).toLowerCase();
                    const isSelected = String(selectedReligion || '').toLowerCase() === String(r).toLowerCase();
                    
                    return (
                      <button 
                        key={r} 
                        type="button" 
                        onClick={() => handleSelectReligion(r)}
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
                            {RELIGION_ICONS[r] || <Globe className="w-5 h-5" />}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            {isActive && <Check className="w-4 h-4 text-[#00FFAA] font-bold" />}
                            <span className={`text-sm font-bold ${isActive ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'}`}>
                              {r}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B8A8A] mt-1 leading-tight">
                            {RELIGION_BONUSES[r] || 'Tidak ada bonus spesifik'}
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
                    <h4 className="text-sm font-bold text-[#E0E0E0] uppercase tracking-wider">Daftar Agama Seluruh Negara ({worldReligions.length} Negara)</h4>
                  </div>
                </div>
                <div className="overflow-x-auto border border-[#00FFAA]/20 rounded-xl bg-[#0A1A1A] shadow-sm max-h-[400px] custom-scrollbar">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-[#051111] border-b border-[#00FFAA]/20 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-bold text-[#00FFAA] uppercase tracking-wider w-12 text-center">No</th>
                        <th className="px-4 py-3 font-bold text-[#00FFAA] uppercase tracking-wider">Negara</th>
                        <th onClick={cycleSortMode} className="px-4 py-3 font-bold text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors">
                          Agama
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
                      {sortedWorldReligions.map((item, idx) => {
                        const isUserCountry = countryDetail?.country &&
                          item.country.toLowerCase().trim() === countryDetail.country.toLowerCase().trim();
                        return (
                          <tr key={idx} className={`transition-colors ${isUserCountry ? 'bg-[#00FFAA]/15 hover:bg-[#00FFAA]/25 border-l-4 border-l-[#00FFAA]' : 'hover:bg-[#00FFAA]/5'}`}>
                            <td className={`px-4 py-2.5 text-center font-bold ${isUserCountry ? 'text-[#00FFAA]' : 'text-[#6B8A8A]'}`}>{idx + 1}</td>
                            <td className={`px-4 py-2.5 font-bold ${isUserCountry ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'}`}>
                              {item.country}
                            </td>
                            <td className={`px-4 py-2.5 ${isUserCountry ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'}`}>
                              {item.religion === 'Belum tersedia' ? (
                                <span className="text-[#6B8A8A] italic font-medium">Belum tersedia</span>
                              ) : (
                                <div className="flex items-center gap-2 font-bold">
                                  {RELIGION_ICONS[item.religion] || <Globe className="w-4 h-4 text-[#00FFAA]" />}
                                  {item.religion}
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