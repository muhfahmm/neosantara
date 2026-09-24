"use client";

import React, { useState, useEffect } from "react";
import { X, HandHelping, Check } from "lucide-react";
import { 
  INITIAL_SUBSIDY_ITEMS, 
  SubsidyItem, 
  calculateSubsidySummary, 
  TotalSubsidySummary,
  formatCurrencyCompact 
} from "./logic/logikaSubsidi";

import SemuaSektorTab from "./tab_menu/1_semua_sektor/SemuaSektorTab";
import EnergiTab from "./tab_menu/2_energi/EnergiTab";
import PanganTab from "./tab_menu/3_pangan/PanganTab";
import PendidikanKesehatanTab from "./tab_menu/4_pendidikan_kesehatan/PendidikanKesehatanTab";
import TransportasiPerumahanTab from "./tab_menu/5_transportasi_perumahan/TransportasiPerumahanTab";
import UmkmEkonomiTab from "./tab_menu/6_umkm_ekonomi/UmkmEkonomiTab";
import PerlindunganSosialTab from "./tab_menu/7_perlindungan_sosial/PerlindunganSosialTab";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  setCountryDetail?: (detail: any | ((prev: any) => any)) => void;
}

export default function SubsidiModal({ isOpen, onClose, countryDetail, setCountryDetail }: ModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const [subsidyItems, setSubsidyItems] = useState<SubsidyItem[]>(INITIAL_SUBSIDY_ITEMS);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  // Fetch status subsidi dari database_alokasi_subsidi berdasarkan country_slug
  useEffect(() => {
    if (!isOpen) return;

    // Derive slug: prioritize explicit slug fields, then fall back to name_id conversion
    const slug =
      countryDetail?.slug ||
      countryDetail?.country_slug ||
      countryDetail?.name?.toLowerCase().replace(/\s+/g, '-') ||
      (countryDetail?.name_id ? String(countryDetail.name_id).toLowerCase().replace(/\s+/g, '-') : null) ||
      'indonesia';

    setIsLoadingDb(true);

    fetch(`/api/alokasi-subsidi?slug=${slug}`)
      .then((res) => res.json())
      .then((dbData) => {
        if (dbData && typeof dbData === 'object' && !Array.isArray(dbData)) {
          setSubsidyItems(
            INITIAL_SUBSIDY_ITEMS.map((item) => {
              const dbVal = dbData[item.id] ?? dbData[item.id.toLowerCase()];
              let isSub = item.isSubsidized;
              if (dbVal !== undefined && dbVal !== null) {
                if (dbVal === 0 || dbVal === "0" || dbVal === false || dbVal === "false") {
                  isSub = false;
                } else if (dbVal === 1 || dbVal === "1" || dbVal === true || dbVal === "true") {
                  isSub = true;
                }
              }
              return {
                ...item,
                isSubsidized: isSub,
              };
            })
          );
        } else if (countryDetail?.subsidy_states) {
          setSubsidyItems(
            INITIAL_SUBSIDY_ITEMS.map((item) => ({
              ...item,
              isSubsidized: (countryDetail.subsidy_states as Record<string, boolean>)[item.id] ?? item.isSubsidized,
            }))
          );
        } else {
          setSubsidyItems(INITIAL_SUBSIDY_ITEMS);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat status subsidi dari database:", err);
        setSubsidyItems(INITIAL_SUBSIDY_ITEMS);
      })
      .finally(() => {
        setIsLoadingDb(false);
      });
  }, [isOpen, countryDetail?.slug, countryDetail?.country_slug, countryDetail?.name, countryDetail?.name_id]);

  if (!isOpen) return null;

  const toggleSubsidy = (id: string) => {
    setSubsidyItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isSubsidized: !item.isSubsidized } : item))
    );
  };

  const handleSaveSubsidy = async () => {
    const subsidyStatesRecord: Record<string, boolean> = {};
    subsidyItems.forEach((item) => {
      subsidyStatesRecord[item.id] = item.isSubsidized;
    });

    const summary = calculateSubsidySummary(subsidyItems);

    if (setCountryDetail) {
      setCountryDetail((prev: any) => ({
        ...prev,
        subsidy_states: subsidyStatesRecord,
        total_subsidy_cost: summary.totalCost,
        subsidy_approval_bonus: summary.totalApprovalBonus,
      }));
    }

    const slug = countryDetail?.slug || countryDetail?.country_slug || 'indonesia';

    try {
      await fetch('/api/alokasi-subsidi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_slug: slug,
          country_id: countryDetail?.id || 0,
          country_name: countryDetail?.name || countryDetail?.country_name || slug,
          iso: countryDetail?.iso || 'id',
          ...subsidyStatesRecord,
        }),
      });
    } catch (err) {
      console.error("Gagal menyimpan subsidi ke database:", err);
    }

    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2500);
  };

  const categories = [
    { id: "Semua", label: "Semua Sektor" },
    { id: "Energi", label: "Energi" },
    { id: "Pangan", label: "Pangan" },
    { id: "Pendidikan & Kesehatan", label: "Pendidikan & Kesehatan" },
    { id: "Transportasi & Perumahan", label: "Transportasi & Perumahan" },
    { id: "UMKM & Ekonomi", label: "UMKM & Ekonomi" },
    { id: "Perlindungan Sosial", label: "Perlindungan Sosial" },
  ];

  const summary: TotalSubsidySummary = calculateSubsidySummary(subsidyItems);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <HandHelping className="h-6 w-6 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#00FFAA] tracking-wider uppercase">Alokasi & Kebijakan Subsidi</h2>
              <p className="text-xs text-[#6B8A8A] font-semibold mt-0.5">Kelola Jaring Pengaman Sosial, Beban APBN, & Stabilitas Publik</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSubsidy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-[#0A1A1A] font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm shrink-0"
            >
              <Check className="w-4 h-4" />
              Terapkan Subsidi
            </button>

            <button 
              onClick={onClose} 
              className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
            >
              <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* TOP STATS SUMMARY BANNER */}
        <div className="px-6 py-4 bg-[#0A1A1A]/80 border-b border-[#00FFAA]/15 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
          <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-3 rounded-xl">
            <p className="text-[9px] font-black text-[#6B8A8A] uppercase tracking-wider">Total Beban APBN Subsidi</p>
            <p className="text-sm font-black text-[#00FFAA] mt-0.5">{formatCurrencyCompact(summary.totalCost)}</p>
          </div>

          <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-3 rounded-xl">
            <p className="text-[9px] font-black text-[#6B8A8A] uppercase tracking-wider">Sektor Aktif / Total</p>
            <p className="text-sm font-black text-[#E0E0E0] mt-0.5">{summary.activeCount} dari {summary.totalCount} Sektor</p>
          </div>

          <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-3 rounded-xl">
            <p className="text-[9px] font-black text-[#6B8A8A] uppercase tracking-wider">Dukungan Kepuasan Rakyat</p>
            <p className="text-sm font-black text-emerald-400 mt-0.5">+{summary.totalApprovalBonus}% Approval</p>
          </div>

          <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-3 rounded-xl">
            <p className="text-[9px] font-black text-[#6B8A8A] uppercase tracking-wider">Risiko Gejolak Demo</p>
            <p className={`text-sm font-black mt-0.5 ${
              summary.highestDemoRisk === "Kritis" ? "text-rose-500" :
              summary.highestDemoRisk === "Tinggi" ? "text-amber-400" : "text-emerald-400"
            }`}>
              {summary.highestDemoRisk}
            </p>
          </div>
        </div>

        {/* FEEDBACK SUCCESS TOAST */}
        {isSavedSuccess && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 px-6 py-2.5 rounded-xl bg-emerald-500 text-[#0A1A1A] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95">
            <Check className="w-4 h-4" /> Alokasi Subsidi Berhasil Diperbarui!
          </div>
        )}

        {/* MAIN BODY WITH SIDEBAR TAB MENU */}
        <div className="flex-1 flex min-h-0 relative z-10">
          
          {/* SIDEBAR TABS */}
          <div className="w-64 border-r border-[#00FFAA]/30 bg-[#0A1A1A] p-4 flex flex-col gap-2 overflow-y-auto no-scrollbar shrink-0">
            {categories.map((cat) => {
              const activeCountInCat = subsidyItems.filter(
                (i) => (cat.id === "Semua" || i.category === cat.id) && i.isSubsidized
              ).length;
              const totalCountInCat = subsidyItems.filter(
                (i) => cat.id === "Semua" || i.category === cat.id
              ).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center justify-between w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md"
                      : "bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]"
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">{cat.label}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    selectedCategory === cat.id ? "bg-[#0A1A1A] text-[#00FFAA]" : "bg-[#0A1A1A] text-[#6B8A8A]"
                  }`}>
                    {activeCountInCat}/{totalCountInCat}
                  </span>
                </button>
              );
            })}
          </div>

          {/* RIGHT CONTENT AREA - SECTOR GRID FROM SEPARATE TAB COMPONENTS */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#0F2424] no-scrollbar">
            {selectedCategory === "Semua" && (
              <SemuaSektorTab items={subsidyItems} toggleSubsidy={toggleSubsidy} />
            )}

            {selectedCategory === "Energi" && (
              <EnergiTab items={subsidyItems} toggleSubsidy={toggleSubsidy} />
            )}

            {selectedCategory === "Pangan" && (
              <PanganTab items={subsidyItems} toggleSubsidy={toggleSubsidy} />
            )}

            {selectedCategory === "Pendidikan & Kesehatan" && (
              <PendidikanKesehatanTab items={subsidyItems} toggleSubsidy={toggleSubsidy} />
            )}

            {selectedCategory === "Transportasi & Perumahan" && (
              <TransportasiPerumahanTab items={subsidyItems} toggleSubsidy={toggleSubsidy} />
            )}

            {selectedCategory === "UMKM & Ekonomi" && (
              <UmkmEkonomiTab items={subsidyItems} toggleSubsidy={toggleSubsidy} />
            )}

            {selectedCategory === "Perlindungan Sosial" && (
              <PerlindunganSosialTab items={subsidyItems} toggleSubsidy={toggleSubsidy} />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
