"use client"
import React, { useEffect, useState } from "react";
import { X, Shield, Atom, Rocket, Bomb, Clock, Target, Lock, Check, Globe, Flame } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import { fetchBuildingMetadata } from "@/lib/buildingMetadata";
import { calculateProductionIncrement, formatDate, getDaysElapsed } from "@/app/logic/production_logic";
import ProgramNuklirModals from "./modals_menu/1_program_nuklir/programNuklirModals";
import IcbmDetailModal from "./modals_menu/2_ICBM/IcbmDetailModal";
import IcbmBuildStatusModal from "./modals_menu/2_ICBM/IcbmBuildStatusModal";
import PerangNuklirDetailModal from "./modals_menu/3_perang_nuklir/PerangNuklirDetailModal";
import StatusNuklirIcbmDuniaModal from "./modals_menu/4_status_nuklir_icbm_dunia/StatusNuklirIcbmDuniaModal";
import UjicobaIcbmModal from "./modals_menu/5_ujicoba_icbm/UjicobaIcbmModal";
import { generateProgramNuklirSelesaiNotification } from "@/app/page/menus/inbox/logic/2_notifikasi_pertahanan/5_icbm/icbmLogic";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate?: string | Date;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onOpenDebt?: () => void;
  onGotoProduction?: (tab: string, key: string) => void;
  prefetchedAllCountries?: any[];
}

export default function IcbmModal({ isOpen, onClose, currentDate, countryDetail, setCountryDetail, onOpenDebt, onGotoProduction, prefetchedAllCountries }: ModalProps) {
  if (!isOpen) return null;

  const formatDateString = (date?: string | Date) => {
    if (!date) return "";
    if (typeof date === "string") return date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 🔥 FUNGSI UNTUK MEMFORMAT TANGGAL MENJADI 1-jan-2026
  const formatTanggalIndo = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    const dateObj = new Date(dateStr + 'T00:00:00');
    if (isNaN(dateObj.getTime())) return dateStr;

    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'ags', 'sep', 'okt', 'nov', 'des'];
    const month = monthNames[dateObj.getMonth()];
    
    return `${day}-${month}-${year}`;
  };

  const safeCurrentDate = formatDateString(currentDate) || formatDateString(new Date());

  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [localIcbmBuildTask, setLocalIcbmBuildTask] = useState<any>(null);

  // Selaraskan local task jika countryDetail berubah (misal task dikurangi/dihapus saat uji coba)
  useEffect(() => {
    if (countryDetail?.icbmBuildTask !== undefined) {
      setLocalIcbmBuildTask(countryDetail.icbmBuildTask);
    }
  }, [countryDetail?.icbmBuildTask]);

  useEffect(() => {
    fetchBuildingMetadata()
      .then((data) => setMetadata(data || {}))
      .catch(() => setMetadata({}));
  }, []);

  const currentCash = Number(countryDetail?.anggaran) || 0;
  const uraniumBuildingCount = Number(countryDetail?.uranium) || 0;
  const uraniumStock = Number(countryDetail?.inventory_uranium) || 0;
  const uraniumProductionPerUnit = Number(metadata?.uranium?.produksi) || 0;
  const safeDateString = safeCurrentDate;
  const buildDateKey = `build_date_uranium`;
  const buildDate = countryDetail?.[buildDateKey] || safeDateString;
  const totalProd = calculateProductionIncrement(uraniumProductionPerUnit, uraniumBuildingCount, buildDate, safeDateString);
  const daysElapsed = getDaysElapsed(buildDate, safeDateString);
  const consumptionPerPlant = 1;
  const totalCons = (Number(countryDetail?.pembangkit_listrik_tenaga_nuklir) || 0) * consumptionPerPlant * daysElapsed;
  const uraniumNet = Math.max(0, uraniumStock + totalProd - totalCons);

  const icbmBuildTask = localIcbmBuildTask || countryDetail?.icbmBuildTask || null;
  const icbmBuildEndDate = icbmBuildTask?.endDate || null;
  const icbmBuildQuantity = Number(icbmBuildTask?.quantity || 0);
  const existingIcbmCount = Math.max(
    Number(countryDetail?.icbm_jumlah || 0),
    Number(countryDetail?.icbm || 0)
  );
  const currentIcbmDateObj = new Date(`${safeCurrentDate}T00:00:00`);
  const icbmBuildEndDateObj = icbmBuildEndDate ? new Date(`${icbmBuildEndDate}T00:00:00`) : null;
  const isIcbmBuildQueued = icbmBuildEndDateObj ? icbmBuildEndDateObj >= currentIcbmDateObj : false;
  const formattedIcbmEndDate = icbmBuildEndDate ? formatTanggalIndo(icbmBuildEndDate) : null;

  // 🔥 LOGIKA BARU: HITUNG SISA ICBM YANG SEDANG DIBANGUN & TOTAL YANG SUDAH SELESAI
  const parseDateLocal = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return null;
    const dateObj = typeof dateValue === 'string' ? new Date(`${dateValue}T00:00:00`) : dateValue;
    return dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj : null;
  };
  const getDurationDaysLocal = (start: string | Date | null | undefined, end: string | Date | null | undefined) => {
    const startDate = parseDateLocal(start);
    const endDate = parseDateLocal(end);
    if (!startDate || !endDate) return 0;
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };
  const addDaysLocal = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  let remainingBuildQuantity = 0;
  let completedFromQueue = 0;
  if (icbmBuildTask) {
    const task = icbmBuildTask;
    const quantity = Math.max(0, Number(task?.quantity) || 0);
    const startDate = parseDateLocal(task?.startDate);
    const endDate = parseDateLocal(task?.endDate);
    const totalDurationDays = getDurationDaysLocal(startDate, endDate);
    
    if (task?.completed) {
      completedFromQueue = quantity;
      remainingBuildQuantity = 0;
    } else if (startDate && quantity > 0) {
      const unitDurationDays = quantity > 0 ? Math.max(1, Math.round(totalDurationDays / quantity)) : 0;
      let completedCount = 0;
      // Loop per unit untuk menghitung mana yang sudah lewat tanggal jatuh temponya
      for (let i = 0; i < quantity; i++) {
        const entryEndDate = addDaysLocal(startDate, unitDurationDays * (i + 1));
        if (entryEndDate && currentIcbmDateObj && entryEndDate <= currentIcbmDateObj) {
          completedCount++;
        }
      }
      remainingBuildQuantity = Math.max(0, quantity - completedCount);
      completedFromQueue = completedCount;
    }
  }

  // 🔥 LOGIKA BARU: TOTAL ICBM YANG SUDAH SIAP / SELESAI
  // Total rudal siap tempur adalah persediaan rudal awal + rudal yang telah selesai dibangun dari antrean.
  // Jika rudal telah dikurangi melalui pemakaian/uji coba (icbm_consumed), kurangi dari total tersebut.
  const baseStoredCount = Number(countryDetail?.icbm_jumlah ?? countryDetail?.icbm ?? 0);
  const deliveredFromTask = Number(icbmBuildTask?.deliveredUnits || 0);
  
  // Rudal yang selesai dari antrean: ambil yang terbesar antara deliveredUnits tersimpan atau completedFromQueue berdasarkan tanggal saat ini
  const activeCompleted = Math.max(deliveredFromTask, completedFromQueue);
  
  // Jika icbm_jumlah sudah mencakup deliveredUnits dari map-system, cegah double count
  const effectiveReady = Math.max(baseStoredCount, activeCompleted);
  const consumedIcbm = Math.max(0, Number(countryDetail?.icbm_consumed || 0));

  const totalReadyIcbm = Math.max(0, effectiveReady - consumedIcbm);

  const ongoingConstructions = countryDetail?.ongoingConstructions || [];
  const programBuildTask = ongoingConstructions.find((c: any) => c.buildingKey === "program_nuklir");
  const programCurrentDateObj = new Date(`${safeCurrentDate}T00:00:00`);
  const programBuildEndDateObj = programBuildTask ? new Date(`${programBuildTask.endDate}T00:00:00`) : null;
  const buildCompleted = programBuildEndDateObj ? programBuildEndDateObj <= programCurrentDateObj : false;
  const isNuclearProgramActive = Boolean(countryDetail?.programNuklirActive) || buildCompleted;
  const isNuclearProgramBuilding = Boolean(programBuildTask) && !buildCompleted;
  const isIcbmLocked = !isNuclearProgramActive;
  const icbmCardStatusText = isIcbmLocked
    ? "Terkunci. Aktifkan Program Nuklir terlebih dahulu."
    : "Bangun ICBM untuk melihat jadwal penyelesaian.";
  const buildEndDate = programBuildTask?.endDate || null;

  const handleIcbmBuild = (task: { quantity: number; startDate: string; endDate: string }) => {
    setLocalIcbmBuildTask(task);
    setCountryDetail((prev: any) => ({ ...(prev || {}), icbmBuildTask: task }));
  };

  useEffect(() => {
    if (!isNuclearProgramActive && buildCompleted && programBuildTask) {
      setCountryDetail((prev: any) => {
        const ongoing = prev?.ongoingConstructions || [];
        const userCountryName = prev?.country || prev?.nama || "Indonesia";
        const completeNotif = generateProgramNuklirSelesaiNotification(userCountryName, safeDateString);
        const existingPending = Array.isArray(prev?.pending_notifications) ? prev.pending_notifications : [];

        return {
          ...prev,
          programNuklirActive: true,
          pending_notifications: [completeNotif, ...existingPending],
          ongoingConstructions: ongoing.filter((c: any) => c.buildingKey !== "program_nuklir"),
        };
      });
    }
  }, [buildCompleted, isNuclearProgramActive, programBuildTask, safeDateString, setCountryDetail]);

  useEffect(() => {
    try {
      if (isNuclearProgramActive) sessionStorage.setItem('programNuklirActive', '1');
      else sessionStorage.removeItem('programNuklirActive');
    } catch (e) {}
  }, [isNuclearProgramActive]);

  useEffect(() => {
    try {
      const flag = sessionStorage.getItem('programNuklirActive') === '1';
      if (flag && !Boolean(countryDetail?.programNuklirActive) && countryDetail) {
        setCountryDetail((prev: any) => ({ ...(prev || {}), programNuklirActive: true }));
      }
    } catch (e) {}
  }, [countryDetail, setCountryDetail]);

  const status = (() => {
    if (isNuclearProgramActive) {
      return {
        isActive: true,
        message: "PROGRAM NUKLIR TELAH AKTIF",
        color: "text-emerald-700 border-emerald-600/30 bg-emerald-500/5",
      };
    }
    if (isNuclearProgramBuilding) {
      return {
        isActive: false,
        message: "PROGRAM NUKLIR DALAM PEMBANGUNAN",
        color: "text-amber-700 border-amber-600/30 bg-amber-500/5",
      };
    }
    return {
      isActive: false,
      message: "PROGRAM NUKLIR BELUM AKTIF",
      color: "text-rose-700 border-rose-600/30 bg-rose-500/5",
    };
  })();

  const [isProgramNuklirModalOpen, setIsProgramNuklirModalOpen] = useState(false);
  const [isIcbmDetailOpen, setIsIcbmDetailOpen] = useState(false);
  const [isPerangNuklirDetailOpen, setIsPerangNuklirDetailOpen] = useState(false);
  const [perangNuklirInitialTab, setPerangNuklirInitialTab] = useState<'ranking' | 'icbm_owners'>('ranking');
  const [isStatusNuklirDuniaOpen, setIsStatusNuklirDuniaOpen] = useState(false);
  const [isIcbmBuildStatusOpen, setIsIcbmBuildStatusOpen] = useState(false);
  const [isUjicobaIcbmOpen, setIsUjicobaIcbmOpen] = useState(false);

  // Bersihkan lingering session flag sub-menu ICBM agar selalu berada di menu awal
  useEffect(() => {
    try {
      sessionStorage.removeItem('program_nuklir_modal_open');
      sessionStorage.removeItem('icbm_detail_open');
      sessionStorage.removeItem('perang_nuklir_detail_open');
    } catch (e) {}
  }, []);

  const nuclearOptions = [
    {
      id: 1,
      title: "Program Nuklir",
      icon: Atom,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      isUnlocker: true,
      isAlwaysUnlocked: false
    },
    {
      id: 2,
      title: "ICBM",
      icon: Rocket,
      color: "text-rose-700",
      bg: "bg-rose-100",
      isUnlocker: false,
      isAlwaysUnlocked: false
    },
    {
      id: 3,
      title: "Perang Nuklir",
      icon: Bomb,
      color: "text-orange-600",
      bg: "bg-orange-100",
      isUnlocker: false,
      isAlwaysUnlocked: false
    },
    {
      id: 4,
      title: "Status Nuklir & ICBM Dunia",
      icon: Globe,
      color: "text-[#00FFAA]",
      bg: "bg-[#00FFAA]/10",
      isUnlocker: false,
      isAlwaysUnlocked: true,
    }
  ];

  const handleOptionClick = (option: typeof nuclearOptions[0]) => {
    if (!option.isUnlocker && !option.isAlwaysUnlocked && !isNuclearProgramActive) return;

    if (option.isUnlocker) {
      if (isNuclearProgramActive) return;
      setIsProgramNuklirModalOpen(true);
      return;
    }

    if (option.id === 2) {
      setIsIcbmDetailOpen(true);
      return;
    }

    if (option.id === 3) {
      setPerangNuklirInitialTab('ranking');
      setIsPerangNuklirDetailOpen(true);
      return;
    }

    if (option.id === 4) {
      setIsStatusNuklirDuniaOpen(true);
      return;
    }
  };

  return (
    <>
      {!isUjicobaIcbmOpen && (
        <NotebookModalWrapper onClose={onClose}>
          <div className="flex flex-col h-full overflow-hidden">
          
          {/* HEADER */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Komando Strategis Nuklir</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">
                {countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "Negara"}
              </p>
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

        {/* BODY MODAL */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar flex flex-col items-center">
          <div className="w-full space-y-6">

            {/* STATUS PENGEMBANGAN */}
            <div className="p-6 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/20 shadow-inner">
              <div className="flex justify-center items-center gap-4">
                <div className={`px-6 py-3 rounded-xl border ${status.isActive ? 'border-[#00FFAA]/40 bg-[#00FFAA]/10 text-[#00FFAA]' : isNuclearProgramBuilding ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-rose-500/40 bg-rose-500/10 text-rose-400'} shadow-sm min-w-[200px] text-center transition-colors duration-300`}>
                  <p className="text-[11px] font-black uppercase tracking-wider mb-1">
                    {status.message}
                  </p>
                  {isNuclearProgramBuilding && (
                    <p className="text-[10px] text-amber-400 font-bold">
                      Dalam tahap pembangunan hingga {formatTanggalIndo(buildEndDate)}
                    </p>
                  )}
                  {isNuclearProgramActive && (
                    <p className="text-[10px] text-[#00FFAA] font-bold flex items-center justify-center gap-1">
                      <Target className="w-3.5 h-3.5 text-[#00FFAA]" /> Sistem Siap Meluncur!
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-[#00FFAA]/20 bg-[#0F2424] p-4 text-center shadow-sm flex flex-col justify-center min-h-[140px]">
                  <p className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider mb-2">Kas Negara</p>
                  <div className="text-lg font-black text-[#00FFAA] leading-tight break-words">{currentCash.toLocaleString('id-ID', { maximumFractionDigits: 0 })} <span className="text-[10px] text-[#6B8A8A] font-bold">NEO</span></div>
                </div>

                <div className="rounded-xl border border-[#00FFAA]/20 bg-[#0F2424] p-4 text-center shadow-sm flex flex-col justify-center min-h-[140px]">
                  <p className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider mb-2">Stok Uranium</p>
                  <div className="text-lg font-black text-[#00FFAA] leading-tight break-words">{uraniumStock.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</div>
                </div>

                <div className="relative overflow-visible">
                  {formattedIcbmEndDate && isIcbmBuildQueued && remainingBuildQuantity > 0 ? (
                    <div className="absolute -top-6 left-1/2 z-20 -translate-x-1/2 rounded-sm bg-[#0A1A1A] text-[#00FFAA] text-[10px] font-bold px-2 py-1 border border-[#00FFAA]/30 shadow-md tracking-wider whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Selesai {formattedIcbmEndDate}
                    </div>
                  ) : null}
                  <div className="rounded-xl border border-[#00FFAA]/20 bg-[#0F2424] p-4 text-center shadow-sm flex flex-col justify-center min-h-[140px]">
                    <p className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider mb-2">ICBM</p>
                    
                    <div className="text-lg font-black text-[#00FFAA] leading-tight break-words">
                      {totalReadyIcbm}
                      {isIcbmBuildQueued && remainingBuildQuantity > 0 ? (
                        <span className="text-xs text-emerald-400 font-bold"> +{remainingBuildQuantity}</span>
                      ) : null}
                    </div>

                    {isIcbmLocked ? (
                      <p className="mt-2 text-[10px] text-[#6B8A8A] flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3 text-[#6B8A8A]" /> Terkunci. Aktifkan Program Nuklir terlebih dahulu.
                      </p>
                    ) : isIcbmBuildQueued && remainingBuildQuantity > 0 ? (
                      <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-[#00FFAA]/10 px-3 py-0.5 text-[10px] font-bold text-[#00FFAA]">
                        +{remainingBuildQuantity} sedang dibangun
                      </div>
                    ) : isIcbmBuildQueued && remainingBuildQuantity === 0 ? (
                      <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-[#00FFAA]/20 px-3 py-0.5 text-[10px] font-bold text-[#00FFAA]">
                        <Check className="w-3.5 h-3.5 text-[#00FFAA]" /> Semua ICBM telah selesai dibangun!
                      </div>
                    ) : null}
                    
                    <button
                      onClick={() => setIsIcbmBuildStatusOpen(true)}
                      disabled={isIcbmLocked}
                      className={`mt-3 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-black text-[#0A1A1A] shadow-sm transition-all ${isIcbmLocked ? 'bg-[#6B8A8A]/30 text-[#6B8A8A] cursor-not-allowed' : 'bg-[#00FFAA] hover:bg-[#00FFAA]/80 cursor-pointer'}`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Lihat Status ICBM
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* GRID KARTU STRATEGI & INTELIJEN GLOBAL */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {nuclearOptions.map((option) => {
                const Icon = option.icon;
                const isLockedCard = !option.isUnlocker && !option.isAlwaysUnlocked && !isNuclearProgramActive;
                const isUnlockerCardActive = option.isUnlocker && isNuclearProgramActive;
                const isUnlockerBuilding = option.isUnlocker && isNuclearProgramBuilding;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    disabled={isLockedCard || isUnlockerCardActive || isUnlockerBuilding}
                    className={`group flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl border transition-all duration-200 h-full ${
                        isLockedCard
                          ? 'bg-[#0A1A1A] border-[#00FFAA]/10 opacity-60 cursor-not-allowed'
                          : isUnlockerCardActive
                          ? 'bg-[#00FFAA]/10 border-[#00FFAA]/40 cursor-default'
                          : option.isAlwaysUnlocked
                          ? 'bg-[#0A1A1A] border-[#00FFAA]/30 hover:border-[#00FFAA] hover:bg-[#00FFAA]/5 hover:shadow-lg cursor-pointer ring-1 ring-[#00FFAA]/20'
                          : 'bg-[#0A1A1A] border-[#00FFAA]/20 hover:border-[#00FFAA] hover:shadow-lg cursor-pointer'
                      }`}
                  >
                    <div className={`p-3 sm:p-3.5 rounded-full ${
                        isUnlockerCardActive ? 'bg-[#00FFAA]/20 border-[#00FFAA]/40' : 'bg-[#0F2424] border-[#00FFAA]/20'
                      } border mb-2.5 sm:mb-3 ${
                        isLockedCard || isUnlockerCardActive ? '' : 'group-hover:scale-110 transition-transform'
                      }`}
                    >
                      {isUnlockerCardActive ? (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 text-[#00FFAA] flex items-center justify-center">
                          <Check className="w-6 h-6 sm:w-7 sm:h-7 text-[#00FFAA]" />
                        </div>
                      ) : (
                        <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${isLockedCard ? 'text-[#6B8A8A]' : 'text-[#00FFAA]'}`} />
                      )}
                    </div>
                    
                    <span className={`text-xs sm:text-sm font-black uppercase tracking-wide mb-1 ${
                      isLockedCard ? 'text-[#6B8A8A]' : isUnlockerCardActive ? 'text-[#00FFAA]' : option.isAlwaysUnlocked ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'
                    }`}>
                      {isUnlockerCardActive ? "Program Aktif!" : option.title}
                    </span>
                    
                    {(isLockedCard || isUnlockerBuilding) && (
                      <p className="text-[10px] leading-relaxed text-[#6B8A8A]">
                      {isLockedCard ? (
                        <span className="flex items-center justify-center gap-1">
                          <Lock className="w-3 h-3 inline shrink-0" /> Terkunci. Aktifkan Program Nuklir terlebih dahulu.
                        </span>
                      ) : "Program nuklir sedang dibangun. Tunggu hingga selesai untuk membuka ICBM dan Perang Nuklir."}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TOMBOL UJI COBA ICBM DI BAWAH 4 CARD */}
            <div className="pt-2">
              <button
                onClick={() => setIsUjicobaIcbmOpen(true)}
                disabled={!isNuclearProgramActive || totalReadyIcbm <= 0}
                className={`w-full group relative overflow-hidden rounded-2xl border p-4 sm:p-5 flex items-center justify-between transition-all duration-300 shadow-md ${
                  !isNuclearProgramActive || totalReadyIcbm <= 0
                    ? 'bg-[#0A1A1A] border-[#00FFAA]/10 opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#0F2424] via-[#0A1A1A] to-[#0F2424] border-rose-500/40 hover:border-rose-400 hover:shadow-rose-500/10 cursor-pointer active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-center transition-transform duration-200 ${
                    !isNuclearProgramActive || totalReadyIcbm <= 0
                      ? 'bg-[#0A1A1A] border-[#6B8A8A]/30 text-[#6B8A8A]'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-400 group-hover:scale-105 group-hover:bg-rose-500/20'
                  }`}>
                    <Flame className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm sm:text-base font-black uppercase tracking-wider ${
                        !isNuclearProgramActive || totalReadyIcbm <= 0 ? 'text-[#6B8A8A]' : 'text-rose-400 group-hover:text-rose-300'
                      }`}>
                        Uji Coba ICBM
                      </span>
                      {isNuclearProgramActive && totalReadyIcbm > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Siap Uji
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B8A8A] font-medium mt-0.5">
                      {!isNuclearProgramActive 
                        ? "Terkunci: Memerlukan Program Nuklir Aktif" 
                        : totalReadyIcbm <= 0 
                        ? "Tidak ada rudal ICBM yang siap diluncurkan" 
                        : `Lakukan uji coba balistik samudra (Sisa rudal: ${totalReadyIcbm} unit)`}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-[#0A1A1A] text-xs font-bold text-rose-400 group-hover:border-rose-400">
                  <span>Protokol Luncur</span>
                  <Rocket className="w-3.5 h-3.5 text-rose-400" />
                </div>
              </button>
            </div>

          </div>
        </div>
        </div>
      </NotebookModalWrapper>
      )}

      <ProgramNuklirModals 
        isOpen={isProgramNuklirModalOpen}
        onClose={() => setIsProgramNuklirModalOpen(false)}
        currentDate={currentDate}
        countryDetail={countryDetail}
        setCountryDetail={setCountryDetail}
        onTakeLoan={onOpenDebt}
      />

      <IcbmDetailModal
        isOpen={isIcbmDetailOpen}
        onClose={() => setIsIcbmDetailOpen(false)}
        countryDetail={countryDetail}
        currentDate={safeCurrentDate}
        onGotoProduction={onGotoProduction}
        onOpenDebt={onOpenDebt}
        onIcbmBuild={handleIcbmBuild}
        setCountryDetail={setCountryDetail}
      />

      <IcbmBuildStatusModal
        isOpen={isIcbmBuildStatusOpen}
        onClose={() => setIsIcbmBuildStatusOpen(false)}
        countryDetail={countryDetail}
        currentDate={safeCurrentDate}
        totalReadyIcbm={totalReadyIcbm}
        onOpenDetail={() => {
          setIsIcbmBuildStatusOpen(false);
          setIsIcbmDetailOpen(true);
        }}
      />

      <PerangNuklirDetailModal
        isOpen={isPerangNuklirDetailOpen}
        onClose={() => setIsPerangNuklirDetailOpen(false)}
        countryDetail={countryDetail}
        currentDate={safeCurrentDate}
        prefetchedAllCountries={prefetchedAllCountries}
        initialTab={perangNuklirInitialTab}
        onAction={(target) => {
          alert(`Deklarasi perang nuklir terhadap ${target.countryName}! Konsekuensi global tak terbayangkan telah dimulai.`);
        }}
      />

      <StatusNuklirIcbmDuniaModal
        isOpen={isStatusNuklirDuniaOpen}
        onClose={() => setIsStatusNuklirDuniaOpen(false)}
        countryDetail={countryDetail}
        currentDate={safeCurrentDate}
        prefetchedAllCountries={prefetchedAllCountries}
      />

      <UjicobaIcbmModal
        isOpen={isUjicobaIcbmOpen}
        onClose={() => setIsUjicobaIcbmOpen(false)}
        currentDate={safeCurrentDate}
        countryDetail={countryDetail}
        setCountryDetail={setCountryDetail}
        totalReadyIcbm={totalReadyIcbm}
      />
    </>
  );
}