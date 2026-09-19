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
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />

        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#5c3c10]/10 rounded-xl border border-[#5c3c10]/20">
              <Rocket className="h-6 w-6 text-[#5c3c10]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">ICBM Strategis</h2>
              <p className="text-xs text-[#8b7e66] font-medium">Pengelolaan persenjataan dan peluncuran rudal balistik antarbenua</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar">
          <div className="w-full max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <div className="p-5 rounded-full bg-rose-100 border border-rose-200 inline-flex items-center justify-center mx-auto">
                <Rocket className="w-14 h-14 text-rose-700" />
              </div>
              <p className="text-sm font-semibold text-[#5c3c10]">Kas Negara & Produksi Uranium</p>
              <p className="text-xs text-[#8b7e66] leading-relaxed text-justify">
                Menampilkan saldo kas negara saat ini dan pendapatan tambang uranium berdasarkan data Produksi & Pembangunan.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-[#C4B49C]/30 bg-white/80 p-6">
                <h3 className="text-sm font-black text-[#5c3c10] uppercase tracking-wider mb-2">Kas Negara</h3>
                <p className="text-[11px] text-[#8b7e66] mb-3">Saldo anggaran milik pengguna saat ini.</p>
                <div className="text-3xl font-black text-emerald-700">{currentCash.toLocaleString('id-ID')} EM</div>
                <p className="text-[11px] text-rose-600 font-bold mt-3">Biaya: -{totalCashCost.toLocaleString('id-ID')} EM</p>
              </div>
              <div className="rounded-2xl border border-[#C4B49C]/30 bg-white/80 p-6">
                <h3 className="text-sm font-black text-[#5c3c10] uppercase tracking-wider mb-2">Stok Uranium</h3>
                <div className="text-3xl font-black text-lime-600">{uraniumStock.toLocaleString('id-ID')}</div>
                <p className="text-[11px] text-rose-600 font-bold mt-3">Biaya: -{totalUraniumCost} uranium</p>
              </div>
              <div className="rounded-2xl border border-[#C4B49C]/30 bg-white/80 p-6">
                <h3 className="text-sm font-black text-[#5c3c10] uppercase tracking-wider mb-2">Selesai</h3>
                <div className="text-3xl font-black text-[#1d5c4b]">{completionDate}</div>
                <p className="text-[11px] text-[#5c3c10] mt-3">Estimasi selesai setelah {totalBuildDays} hari pembangunan.</p>
              </div>
            </div>

            {/* 🔥 BAGIAN BARU: KUANTITAS & BANGUN / SEKETIKA (Sesuai gambar ke-2) */}
            <div className="bg-[#e4dac3]/30 border-2 border-[#C4B49C]/30 rounded-2xl p-6 mt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                
                {/* Sisi Kiri: Kuantitas & tombol +1 / +10 */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-black text-[#5c3c10]">Kuantitas:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => handleSetQuantity(parseInt(e.target.value) || 1)}
                      className="w-24 rounded-lg border-2 border-[#C4B49C]/40 bg-white px-3 py-2 text-center font-bold text-[#5c3c10] shadow-sm focus:border-[#5c3c10] focus:outline-none"
                    />
                    <button
                      onClick={() => handleSetQuantity(quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2d5a4c] text-white shadow-sm hover:bg-[#1d4036] transition-colors cursor-pointer"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleSetQuantity(quantity + 10)}
                      className="flex h-8 items-center justify-center rounded-md bg-[#2d5a4c] px-3 text-xs font-bold text-white shadow-sm hover:bg-[#1d4036] transition-colors cursor-pointer"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Sisi Kanan: Tombol Seketika & Bangun */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => console.log(`Membangun ${quantity} ICBM secara instan!`)}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-amber-300 to-yellow-500 px-6 py-2.5 font-black text-[#4a3b20] shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Gem className="h-5 w-5 text-rose-700" />
                    <span className="text-sm">Seketika</span>
                    <span className="text-xs font-bold bg-yellow-800/20 px-2 py-0.5 rounded-full text-[#4a3b20]">{quantity * 6}</span>
                  </button>
                  <button
                    onClick={handleBuildClick}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-[#1d5c4b] px-6 py-2.5 font-black text-white shadow-md hover:bg-[#154a3c] active:scale-95 transition-all cursor-pointer"
                  >
                    <Clock className="h-5 w-5 text-emerald-200" />
                    <span className="text-sm">Bangun</span>
                    <span className="text-xs font-bold bg-emerald-900/30 px-2 py-0.5 rounded-full text-emerald-200">{totalBuildDays} hari</span>
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