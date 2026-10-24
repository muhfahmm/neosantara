"use client";

import React, { useState, useEffect } from "react";
import { X, HandHelping, Check } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import {
  INITIAL_SUBSIDY_ITEMS,
  SubsidyItem,
  calculateSubsidySummary,
  TotalSubsidySummary,
  formatCurrencyCompact,
  clampSubsidyCost
} from "../../../../../../../../json/5_database_kebijakan_subsidi/index";

import SemuaSektorTab from "./tab_menu/1_semua_sektor/SemuaSektorTab";
import EnergiTab from "./tab_menu/2_energi/EnergiTab";
import PanganTab from "./tab_menu/3_pangan/PanganTab";
import PendidikanKesehatanTab from "./tab_menu/4_pendidikan_kesehatan/PendidikanKesehatanTab";
import TransportasiPerumahanTab from "./tab_menu/5_transportasi_perumahan/TransportasiPerumahanTab";
import UmkmEkonomiTab from "./tab_menu/6_umkm_ekonomi/UmkmEkonomiTab";
import PerlindunganSosialTab from "./tab_menu/7_perlindungan_sosial/PerlindunganSosialTab";
import DetailSubsidiItemModal from "./DetailSubsidiItemModal";

import { generateSubsidiChangeNotification } from "@/app/page/menus/inbox/logic/7_notifikasi_ekonomi/3_kebijakan_subsidi/subsidiChangeLogic";
import { generateDemonstrasiSubsidiNotification } from "@/app/page/menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/demonstrasiEkonomiLogic";
import { getCurrentGameDateString } from "@/app/logic/gameSessionState";
import { calculateSubsidySatisfaction } from "@/app/logic/kepuasanCalculator";
import { calculateEconomicPopulationImpact } from "@/app/logic/economic_logic/economicPopulationImpact";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  setCountryDetail?: (detail: any | ((prev: any) => any)) => void;
}

const resolveSubsidyItemsForCountry = (countryDetail: any): SubsidyItem[] => {
  if (countryDetail?.subsidy_states) {
    return INITIAL_SUBSIDY_ITEMS.map((item) => ({
      ...item,
      budgetCost: clampSubsidyCost(item.budgetCost),
      isSubsidized: (countryDetail.subsidy_states as Record<string, boolean>)[item.id] ?? item.isSubsidized,
    }));
  }

  return INITIAL_SUBSIDY_ITEMS.map((item) => ({
    ...item,
    budgetCost: clampSubsidyCost(item.budgetCost),
  }));
};

export default function SubsidiModal({ isOpen, onClose, countryDetail, setCountryDetail }: ModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const [subsidyItems, setSubsidyItems] = useState<SubsidyItem[]>(() => resolveSubsidyItemsForCountry(countryDetail));
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<SubsidyItem | null>(null);

  // Sinkronisasi instan tanpa network fetch (0ms)
  useEffect(() => {
    if (!isOpen) return;
    setSubsidyItems(resolveSubsidyItemsForCountry(countryDetail));
  }, [isOpen, countryDetail?.slug, countryDetail?.country_slug, countryDetail?.name, countryDetail?.name_id, countryDetail?.subsidy_states]);

  if (!isOpen) return null;

  const toggleSubsidy = (id: string) => {
    let toggledItemName = "";
    let nextStatus = false;
    let toggledItemCategory = "";

    const nextItems = subsidyItems.map((item) => {
      if (item.id === id) {
        toggledItemName = item.name;
        toggledItemCategory = item.category; // Simpan kategori
        nextStatus = !item.isSubsidized;
        return { ...item, isSubsidized: !item.isSubsidized };
      }
      return item;
    });

    setSubsidyItems(nextItems);

    if (setCountryDetail) {
      const dateStr = getCurrentGameDateString();
      const notif = toggledItemName ? generateSubsidiChangeNotification(toggledItemName, nextStatus, dateStr) : null;
      const subsidyStatesRecord: Record<string, boolean> = {};
      nextItems.forEach((item) => {
        subsidyStatesRecord[item.id] = item.isSubsidized;
      });
      const summary = calculateSubsidySummary(nextItems);
      const newNotifs: any[] = [];
      if (notif) newNotifs.push(notif);

      // --- LOGIKA BARU DIMULAI DI SINI ---

      // 1. Tentukan apakah ini subsidi "Krusial" / Paling Dibutuhkan
      const criticalCategories = ["Pangan", "Energi", "Pendidikan & Kesehatan"]; // Sesuaikan kategori dengan data Anda
      const isCriticalSubsidy = criticalCategories.includes(toggledItemCategory) || id.includes("beras") || id.includes("bbm");

      if (!nextStatus) { // Jika user MENCABUT subsidi
        if (isCriticalSubsidy) {
          // Peluang Demo Sangat Tinggi (90%) untuk kebutuhan pokok
          if (Math.random() < 0.90) {
            const demoNotif = generateDemonstrasiSubsidiNotification(toggledItemName, dateStr);
            newNotifs.unshift(demoNotif);
          }
        } else if (summary.totalApprovalBonus <= 0) {
          // Logika lama: Jika bukan krusial, tapi total approval udah 0
          if (Math.random() < 0.70) {
            const demoNotif = generateDemonstrasiSubsidiNotification(toggledItemName, dateStr);
            newNotifs.unshift(demoNotif);
          }
        }
      }
      // --- LOGIKA BARU SELESAI ---

      setCountryDetail((prev: any) => ({
        ...prev,
        subsidy_states: subsidyStatesRecord,
        total_subsidy_cost: summary.totalCost,
        subsidy_approval_bonus: summary.totalApprovalBonus,
        pending_notifications: [
          ...newNotifs,
          ...(prev?.pending_notifications || [])
        ],
      }));
    }
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
  const subsidySatisfaction = calculateSubsidySatisfaction({
    subsidy_states: Object.fromEntries(subsidyItems.map((item) => [item.id, item.isSubsidized])),
  });

  const subsidyStatesRecord = Object.fromEntries(subsidyItems.map((item) => [item.id, item.isSubsidized]));
  const subsidyPopulationImpact = calculateEconomicPopulationImpact({
    ...(countryDetail || {}),
    subsidy_states: subsidyStatesRecord,
  });
  const subsidyMonthlyPopModifier = subsidyPopulationImpact.subsidyMonthlyModifierPercent * 0.25;

  return (
    <>
      <NotebookModalWrapper onClose={onClose}>
        <div className="flex flex-col h-full overflow-hidden">

          {/* HEADER */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                <HandHelping className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Alokasi & Kebijakan Subsidi</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <button
                onClick={onClose}
                className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
              >
                <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* TOP STATS SUMMARY BANNER */}
          <div className="px-4 lg:px-6 py-2 lg:py-3 bg-[#0A1A1A]/80 border-b border-[#00FFAA]/15 grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-2.5 shrink-0">
            <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-2 lg:p-2.5 rounded-xl">
              <p className="text-[9px] lg:text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider">Total Beban Anggaran Subsidi</p>
              <p className="text-xs lg:text-sm font-black text-[#00FFAA] mt-0.5">{formatCurrencyCompact(summary.totalCost)}</p>
            </div>

            <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-2 lg:p-2.5 rounded-xl">
              <p className="text-[9px] lg:text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider">Sektor Aktif / Total</p>
              <p className="text-xs lg:text-sm font-black text-[#E0E0E0] mt-0.5">{summary.activeCount} dari {summary.totalCount} Sektor</p>
            </div>

            <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-2 lg:p-2.5 rounded-xl">
              <p className="text-[9px] lg:text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider">Dukungan Kepuasan Rakyat</p>
              <p className="text-xs lg:text-sm font-black text-emerald-400 mt-0.5">+{summary.totalApprovalBonus}% Approval</p>
            </div>

            <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-2 lg:p-2.5 rounded-xl">
              <p className="text-[9px] lg:text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider">Dampak Netto Populasi</p>
              <p className={`text-xs lg:text-sm font-black mt-0.5 ${subsidyMonthlyPopModifier >= 0 ? "text-[#00FFAA]" : "text-rose-400"
                }`}>
                {subsidyMonthlyPopModifier >= 0 ? "+" : ""}{subsidyMonthlyPopModifier.toFixed(2)}% / bln
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
            <div className="w-44 lg:w-48 2xl:w-52 border-r border-[#00FFAA]/30 bg-[#0A1A1A] p-2 lg:p-3 flex flex-col gap-1.5 lg:gap-2 overflow-y-auto neon-scrollbar shrink-0">
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
                    className={`flex items-center justify-between w-full p-2 lg:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${selectedCategory === cat.id
                      ? "bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md"
                      : "bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]"
                      }`}
                  >
                    <span className="text-[10px] lg:text-[11px] font-bold uppercase tracking-wider">{cat.label}</span>
                    <span className={`text-[9px] lg:text-[10px] font-black px-1.5 py-0.5 rounded-full ${selectedCategory === cat.id ? "bg-[#0A1A1A] text-[#00FFAA]" : "bg-[#0A1A1A] text-[#6B8A8A]"
                      }`}>
                      {activeCountInCat}/{totalCountInCat}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* RIGHT CONTENT AREA - SECTOR GRID FROM SEPARATE TAB COMPONENTS */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 2xl:p-8 bg-[#0F2424] neon-scrollbar">
              {selectedCategory === "Semua" && (
                <SemuaSektorTab items={subsidyItems} toggleSubsidy={toggleSubsidy} onOpenDetail={(item) => setSelectedDetailItem(item)} />
              )}

              {selectedCategory === "Energi" && (
                <EnergiTab items={subsidyItems} toggleSubsidy={toggleSubsidy} onOpenDetail={(item) => setSelectedDetailItem(item)} />
              )}

              {selectedCategory === "Pangan" && (
                <PanganTab items={subsidyItems} toggleSubsidy={toggleSubsidy} onOpenDetail={(item) => setSelectedDetailItem(item)} />
              )}

              {selectedCategory === "Pendidikan & Kesehatan" && (
                <PendidikanKesehatanTab items={subsidyItems} toggleSubsidy={toggleSubsidy} onOpenDetail={(item) => setSelectedDetailItem(item)} />
              )}

              {selectedCategory === "Transportasi & Perumahan" && (
                <TransportasiPerumahanTab items={subsidyItems} toggleSubsidy={toggleSubsidy} onOpenDetail={(item) => setSelectedDetailItem(item)} />
              )}

              {selectedCategory === "UMKM & Ekonomi" && (
                <UmkmEkonomiTab items={subsidyItems} toggleSubsidy={toggleSubsidy} onOpenDetail={(item) => setSelectedDetailItem(item)} />
              )}

              {selectedCategory === "Perlindungan Sosial" && (
                <PerlindunganSosialTab items={subsidyItems} toggleSubsidy={toggleSubsidy} onOpenDetail={(item) => setSelectedDetailItem(item)} />
              )}

              <div className="mt-6 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black uppercase tracking-widest text-[#00FFAA]">
                    Indeks Kepuasan Rakyat (Subsidi)
                  </span>
                  <span className="shrink-0 text-2xl font-black text-amber-400 sm:text-3xl">
                    {subsidySatisfaction} / 100
                  </span>
                </div>
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full border border-[#00FFAA]/20 bg-[#0A1A1A]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-200"
                    style={{ width: `${subsidySatisfaction}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </NotebookModalWrapper>

      {/* DETAIL ITEM SUBSIDI MODAL */}
      <DetailSubsidiItemModal
        isOpen={!!selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        item={selectedDetailItem ? subsidyItems.find(i => i.id === selectedDetailItem.id) || selectedDetailItem : null}
        toggleSubsidy={toggleSubsidy}
      />
    </>
  );
}
