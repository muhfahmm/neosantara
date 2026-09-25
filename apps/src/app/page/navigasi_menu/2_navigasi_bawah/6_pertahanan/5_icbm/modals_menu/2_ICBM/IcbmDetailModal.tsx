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
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">ICBM Strategis</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">Pengelolaan persenjataan dan peluncuran rudal balistik antarbenua</p>
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

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0F2424] relative z-10 custom-scrollbar">
          <div className="w-full max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <div className="p-4 sm:p-5 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/30 inline-flex items-center justify-center mx-auto shadow-md">
                <Rocket className="w-12 h-12 sm:w-14 sm:h-14 text-rose-500" />
              </div>
              <p className="text-sm sm:text-base font-bold text-[#E0E0E0]">Kas Negara & Produksi Uranium</p>
              <p className="text-xs text-[#6B8A8A] leading-relaxed text-center">
                Menampilkan saldo kas negara saat ini dan pendapatan tambang uranium berdasarkan data Produksi & Pembangunan.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-5">
                <h3 className="text-xs sm:text-sm font-black text-[#6B8A8A] uppercase tracking-wider mb-2">Kas Negara</h3>
                <p className="text-[10px] sm:text-[11px] text-[#6B8A8A] mb-3">Saldo anggaran milik pengguna saat ini.</p>
                <div className="text-2xl sm:text-3xl font-black text-[#00FFAA]">{currentCash.toLocaleString('id-ID')} EM</div>
                <p className="text-[11px] text-rose-400 font-bold mt-3">Biaya: -{totalCashCost.toLocaleString('id-ID')} EM</p>
              </div>
              <div className="rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-5">
                <h3 className="text-xs sm:text-sm font-black text-[#6B8A8A] uppercase tracking-wider mb-2">Stok Uranium</h3>
                <p className="text-[10px] sm:text-[11px] text-[#6B8A8A] mb-3">Persediaan uranium yang tersedia.</p>
                <div className="text-2xl sm:text-3xl font-black text-amber-400">{uraniumStock.toLocaleString('id-ID')}</div>
                <p className="text-[11px] text-rose-400 font-bold mt-3">Biaya: -{totalUraniumCost} uranium</p>
              </div>
              <div className="rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-5">
                <h3 className="text-xs sm:text-sm font-black text-[#6B8A8A] uppercase tracking-wider mb-2">Selesai Pada</h3>
                <p className="text-[10px] sm:text-[11px] text-[#6B8A8A] mb-3">Jadwal estimasi penyelesaian.</p>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{completionDate}</div>
                <p className="text-[11px] text-[#6B8A8A] mt-3">Estimasi setelah {totalBuildDays} hari pembangunan.</p>
              </div>
            </div>

            {/* KUANTITAS & BANGUN */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-2xl p-5 sm:p-6 mt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                
                {/* Kuantitas */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#E0E0E0]">Kuantitas:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => handleSetQuantity(parseInt(e.target.value) || 1)}
                      className="w-24 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] px-3 py-2 text-center font-bold text-[#00FFAA] shadow-sm focus:border-[#00FFAA] focus:outline-none text-sm"
                    />
                    <button
                      onClick={() => handleSetQuantity(quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F2424] border border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-colors cursor-pointer"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleSetQuantity(quantity + 10)}
                      className="flex h-9 items-center justify-center rounded-xl bg-[#0F2424] border border-[#00FFAA]/30 px-3 text-xs font-bold text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-colors cursor-pointer"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Tombol Seketika & Bangun */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => console.log(`Membangun ${quantity} ICBM secara instan!`)}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/40 px-5 py-2.5 font-bold text-amber-400 hover:bg-amber-500/30 active:scale-95 transition-all cursor-pointer text-xs uppercase"
                  >
                    <Gem className="h-4 w-4 text-amber-400" />
                    <span>Seketika</span>
                    <span className="text-[10px] font-black bg-amber-400/20 px-2 py-0.5 rounded-full text-amber-300">{quantity * 6}</span>
                  </button>
                  <button
                    onClick={handleBuildClick}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-[#00FFAA] px-5 py-2.5 font-black text-[#0A1A1A] shadow-md hover:bg-[#00FFAA]/80 active:scale-95 transition-all cursor-pointer text-xs uppercase"
                  >
                    <Clock className="h-4 w-4 text-[#0A1A1A]" />
                    <span>Bangun</span>
                    <span className="text-[10px] font-black bg-black/20 px-2 py-0.5 rounded-full text-[#0A1A1A]">{totalBuildDays} hari</span>
                  </button>
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