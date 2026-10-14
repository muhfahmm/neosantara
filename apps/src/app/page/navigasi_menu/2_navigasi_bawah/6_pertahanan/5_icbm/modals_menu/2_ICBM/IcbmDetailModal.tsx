"use client"
import React, { useEffect, useState } from "react";
import { X, Rocket, ArrowUp, Plus, Clock, Gem } from "lucide-react";
import { fetchBuildingMetadata } from "@/lib/buildingMetadata";
import { calculateProductionIncrement, formatDate, getDaysElapsed } from "@/app/logic/production_logic";
import ConfirmBuildIcbmModal from "./ConfirmBuildIcbmModal";
import IcbmInsufficientFundsModal from "./IcbmInsufficientFundsModal";

interface IcbmDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  currentDate?: string | Date;
  onGotoProduction?: (tab: string, key: string) => void;
  onIcbmBuild?: (task: { quantity: number; startDate: string; endDate: string }) => void;
  // handler to open Pinjaman & Hutang
  onOpenDebt?: () => void;
  // allow child to update country detail directly for immediate UI updates
  setCountryDetail?: (updater: any) => void;
}

export default function IcbmDetailModal({ isOpen, onClose, countryDetail, currentDate, onGotoProduction, onIcbmBuild, onOpenDebt, setCountryDetail }: IcbmDetailModalProps) {
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  
  // 🔥 State untuk Kuantitas (Gambar ke-2)
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
      if (!isOpen) return;
      fetchBuildingMetadata()
        .then((data) => setMetadata(data || {}))
        .catch(() => setMetadata({}));
    }, [isOpen]);

    const currentCash = Number(countryDetail?.anggaran) || 0;
    const uraniumBuildingCount = Number(countryDetail?.uranium) || 0;
    const uraniumStock = Number(countryDetail?.inventory_uranium) || 0;
    const uraniumProductionPerUnit = Number(metadata?.uranium?.produksi) || 0;

    // compute production total consistent with ProduksiModal.calculateProductionAmount
    const safeDateString = (() => {
      if (!currentDate) return formatDate(new Date());
      if (typeof currentDate === 'string') return currentDate;
      if (currentDate instanceof Date && !isNaN(currentDate.getTime())) return formatDate(currentDate);
      return formatDate(new Date());
    })();
    const buildDateKey = `build_date_uranium`;
    const buildDate = countryDetail?.[buildDateKey] || safeDateString;
    const totalProd = calculateProductionIncrement(uraniumProductionPerUnit, uraniumBuildingCount, buildDate, safeDateString);
    const daysElapsed = getDaysElapsed(buildDate, safeDateString);
    const consumptionPerPlant = 1; // uranium consumption per plant per day
    const totalCons = (Number(countryDetail?.pembangkit_listrik_tenaga_nuklir) || 0) * consumptionPerPlant * daysElapsed;
    const uraniumNet = Math.max(0, uraniumStock + totalProd - totalCons);

    const cashCostPerUnit = 25000;
    const uraniumCostPerUnit = 1;
    const buildDurationPerUnitDays = 30;
    const totalCashCost = cashCostPerUnit * quantity;
    const totalUraniumCost = uraniumCostPerUnit * quantity;
    const totalBuildDays = buildDurationPerUnitDays * quantity;

    const formatTanggalIndo = (dateStr: string | Date) => {
      const dateObj = typeof dateStr === 'string' ? new Date(`${dateStr}T00:00:00`) : dateStr;
      if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return String(dateStr);
      const day = dateObj.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      const month = monthNames[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      return `${day} ${month} ${year}`;
    };

    const completionDate = (() => {
      const baseDate = new Date(`${safeDateString}T00:00:00`);
      baseDate.setDate(baseDate.getDate() + totalBuildDays);
      return formatTanggalIndo(baseDate);
    })();

    const completionIso = (() => {
      const baseDate = new Date(`${safeDateString}T00:00:00`);
      baseDate.setDate(baseDate.getDate() + totalBuildDays);
      return baseDate.toISOString().slice(0, 10);
    })();

  const [isConfirmBuildOpen, setIsConfirmBuildOpen] = useState(false);
  const [isInsufficientFundsOpen, setIsInsufficientFundsOpen] = useState(false);

  if (!isOpen) return null;

  // 🔥 Fungsi pembantu untuk tombol kuantitas
  const handleSetQuantity = (val: number) => {
    setQuantity(Math.max(1, val));
  };

  const handleBuildClick = () => {
    if (currentCash < totalCashCost) {
      setIsInsufficientFundsOpen(true);
      return;
    }
    setIsConfirmBuildOpen(true);
  };

  const handleConfirmBuild = () => {
    const task = {
      quantity,
      startDate: safeDateString,
      endDate: completionIso,
    };

    // Deduct resources immediately if parent provided setter (ensures UI updates)
    if (setCountryDetail) {
      const cashCostPerUnit = 25000;
      const uraniumCostPerUnit = 1;
      const totalCashCost = cashCostPerUnit * quantity;
      const totalUraniumCost = uraniumCostPerUnit * quantity;

      setCountryDetail((prev: any) => {
        const prevAnggaran = Number(prev?.anggaran) || 0;
        const prevUraniumStock = Number(prev?.inventory_uranium) || 0;
        return {
          ...(prev || {}),
          anggaran: Math.max(0, prevAnggaran - totalCashCost),
          inventory_uranium: Math.max(0, prevUraniumStock - totalUraniumCost),
          icbmBuildTask: task,
        };
      });
    }

    if (onIcbmBuild) onIcbmBuild(task);
    setIsConfirmBuildOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-[#00FFAA] tracking-tight leading-none uppercase">ICBM Strategis</h2>            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0F2424] relative z-10 custom-scrollbar">
          <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-5">
            <div className="text-center space-y-3">
              <div className="p-4 sm:p-5 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/30 inline-flex items-center justify-center mx-auto shadow-md">
                <Rocket className="w-12 h-12 sm:w-14 sm:h-14 text-rose-500" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#E0E0E0]">Kas Negara & Produksi Uranium</p>
              </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4 sm:p-5">
                <h3 className="text-[10px] sm:text-xs font-black text-[#6B8A8A] uppercase tracking-wider mb-2">Stok Uranium</h3>
                <div className="text-lg sm:text-xl font-black leading-tight text-amber-400 break-words">{uraniumStock.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4 sm:p-5">
                <h3 className="text-[10px] sm:text-xs font-black text-[#6B8A8A] uppercase tracking-wider mb-2">Selesai Pada</h3>
                <div className="text-lg sm:text-xl font-black leading-tight text-emerald-400 break-words">{completionDate}</div>
              </div>
            </div>

            {/* KUANTITAS & BANGUN */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-2xl p-4 sm:p-5 mt-2">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
                
                {/* Kuantitas */}
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
                  <span className="whitespace-nowrap text-[11px] sm:text-xs font-bold text-[#E0E0E0]">Kuantitas:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => handleSetQuantity(parseInt(e.target.value) || 1)}
                      className="w-20 sm:w-24 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] px-2 sm:px-3 py-2 text-center font-bold text-[#00FFAA] shadow-sm focus:border-[#00FFAA] focus:outline-none text-xs sm:text-sm"
                    />
                    <button
                      onClick={() => handleSetQuantity(quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F2424] border border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-colors cursor-pointer"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleSetQuantity(quantity + 10)}
                      className="flex h-9 items-center justify-center rounded-xl bg-[#0F2424] border border-[#00FFAA]/30 px-2 sm:px-3 text-[10px] sm:text-xs font-bold text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-colors cursor-pointer"
                    >
                      +10
                    </button>
                  </div>
                </div>

                <div className="flex w-full min-w-0 flex-col gap-3 lg:w-auto lg:flex-1 lg:flex-row lg:items-center lg:gap-3">
                  <div className="flex shrink-0 items-center justify-center">
                    <button
                      onClick={() => console.log(`Membangun ${quantity} ICBM secara instan!`)}
                      className="flex w-full min-w-0 items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/20 px-3 py-2.5 text-[10px] font-bold uppercase text-amber-400 transition-all hover:bg-amber-500/30 active:scale-95 sm:gap-2 sm:px-4 sm:text-xs"
                    >
                      <Gem className="h-4 w-4 text-amber-400" />
                      <span className="whitespace-nowrap">Seketika</span>
                      <span className="whitespace-nowrap rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-black text-amber-300">{quantity * 6}</span>
                    </button>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center lg:gap-3">
                    <div className="flex shrink-0 flex-col gap-1 text-[10px] font-bold text-rose-400">
                      <span className="whitespace-nowrap">-{totalCashCost.toLocaleString('id-ID', { maximumFractionDigits: 0 })} NEO</span>
                      <span className="whitespace-nowrap">-{totalUraniumCost} uranium</span>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center">
                      <button
                        onClick={handleBuildClick}
                        className="flex w-full min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[#00FFAA] px-3 py-2.5 text-[10px] font-black uppercase text-[#0A1A1A] shadow-md transition-all hover:bg-[#00FFAA]/80 active:scale-95 sm:gap-2 sm:px-4 sm:text-xs"
                      >
                        <Clock className="h-4 w-4 text-[#0A1A1A]" />
                        <span className="whitespace-nowrap">Bangun</span>
                        <span className="whitespace-nowrap rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-black text-[#0A1A1A]">{totalBuildDays} hari</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 🔥 END BAGIAN BARU */}

          </div>
        </div>
      </div>
      <IcbmInsufficientFundsModal
        isOpen={isInsufficientFundsOpen}
        onClose={() => setIsInsufficientFundsOpen(false)}
        currentBudget={currentCash}
        requiredBudget={totalCashCost}
        onOpenDebt={onOpenDebt}
      />
      <ConfirmBuildIcbmModal
        isOpen={isConfirmBuildOpen}
        onClose={() => setIsConfirmBuildOpen(false)}
        onConfirm={handleConfirmBuild}
        quantity={quantity}
        totalCashCost={totalCashCost}
        totalUraniumCost={totalUraniumCost}
        totalBuildDays={totalBuildDays}
        completionDate={completionDate}
      />
    </div>
  );
}