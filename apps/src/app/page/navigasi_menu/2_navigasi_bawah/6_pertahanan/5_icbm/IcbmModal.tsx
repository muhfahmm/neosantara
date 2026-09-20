"use client"
import React, { useEffect, useState } from "react";
import { X, Shield, Atom, Rocket, Bomb, Clock } from "lucide-react";
import { fetchBuildingMetadata } from "@/lib/buildingMetadata";
import { calculateProductionIncrement, formatDate, getDaysElapsed } from "@/app/logic/production_logic";
import ProgramNuklirModals from "./modals_menu/1_program_nuklir/programNuklirModals";
import IcbmDetailModal from "./modals_menu/2_ICBM/IcbmDetailModal";
import IcbmBuildStatusModal from "./modals_menu/2_ICBM/IcbmBuildStatusModal";
import PerangNuklirDetailModal from "./modals_menu/3_perang_nuklir/PerangNuklirDetailModal";

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
  const existingIcbmCount = Number(countryDetail?.icbm || 0);
  const currentIcbmDateObj = new Date(`${safeCurrentDate}T00:00:00`);
  const icbmBuildEndDateObj = icbmBuildEndDate ? new Date(`${icbmBuildEndDate}T00:00:00`) : null;
  const isIcbmBuildQueued = icbmBuildEndDateObj ? icbmBuildEndDateObj > currentIcbmDateObj : false;
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
    
    if (startDate && quantity > 0) {
      const unitDurationDays = quantity > 0 ? Math.max(1, Math.round(totalDurationDays / quantity)) : 0;
      let completedCount = 0;
      // Loop per unit untuk menghitung mana yang sudah lewat tanggal jatuh temponya
      for (let i = 0; i < quantity; i++) {
        const entryEndDate = addDaysLocal(startDate, unitDurationDays * (i + 1));
        if (entryEndDate && currentIcbmDateObj && entryEndDate < currentIcbmDateObj) {
          completedCount++;
        }
      }
      remainingBuildQuantity = Math.max(0, quantity - completedCount);
      completedFromQueue = completedCount;
    }
  }

  // 🔥 LOGIKA BARU: TOTAL ICBM YANG SUDAH SIAP / SELESAI (Angka 0 nya akan bertambah!)
  const totalReadyIcbm = existingIcbmCount + completedFromQueue;

  const ongoingConstructions = countryDetail?.ongoingConstructions || [];
  const programBuildTask = ongoingConstructions.find((c: any) => c.buildingKey === "program_nuklir");
  const programCurrentDateObj = new Date(`${safeCurrentDate}T00:00:00`);
  const programBuildEndDateObj = programBuildTask ? new Date(`${programBuildTask.endDate}T00:00:00`) : null;
  const buildCompleted = programBuildEndDateObj ? programBuildEndDateObj <= programCurrentDateObj : false;
  const isNuclearProgramActive = Boolean(countryDetail?.programNuklirActive) || buildCompleted;
  const isNuclearProgramBuilding = Boolean(programBuildTask) && !buildCompleted;
  const isIcbmLocked = !isNuclearProgramActive;
  const icbmCardStatusText = isIcbmLocked
    ? "🔒 Terkunci. Aktifkan Program Nuklir terlebih dahulu."
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
        return {
          ...prev,
          programNuklirActive: true,
          ongoingConstructions: ongoing.filter((c: any) => c.buildingKey !== "program_nuklir"),
        };
      });
    }
  }, [buildCompleted, isNuclearProgramActive, programBuildTask, setCountryDetail]);

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
  const [isIcbmBuildStatusOpen, setIsIcbmBuildStatusOpen] = useState(false);

  useEffect(() => {
    try {
      const p = sessionStorage.getItem('program_nuklir_modal_open') === '1';
      const i = sessionStorage.getItem('icbm_detail_open') === '1';
      const pe = sessionStorage.getItem('perang_nuklir_detail_open') === '1';
      if (p) setIsProgramNuklirModalOpen(true);
      if (i) setIsIcbmDetailOpen(true);
      if (pe) setIsPerangNuklirDetailOpen(true);
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      if (isProgramNuklirModalOpen) sessionStorage.setItem('program_nuklir_modal_open', '1');
      else sessionStorage.removeItem('program_nuklir_modal_open');
    } catch {}
  }, [isProgramNuklirModalOpen]);
  useEffect(() => {
    try {
      if (isIcbmDetailOpen) sessionStorage.setItem('icbm_detail_open', '1');
      else sessionStorage.removeItem('icbm_detail_open');
    } catch {}
  }, [isIcbmDetailOpen]);
  useEffect(() => {
    try {
      if (isPerangNuklirDetailOpen) sessionStorage.setItem('perang_nuklir_detail_open', '1');
      else sessionStorage.removeItem('perang_nuklir_detail_open');
    } catch {}
  }, [isPerangNuklirDetailOpen]);

  const nuclearOptions = [
    {
      id: 1,
      title: "Program Nuklir",
      icon: Atom,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      desc: "Mempercepat riset pengayaan uranium untuk membangun hulu ledak nuklir pertama.",
      isUnlocker: true 
    },
    {
      id: 2,
      title: "ICBM",
      icon: Rocket,
      color: "text-rose-700",
      bg: "bg-rose-100",
      desc: "Mengaktifkan silo rudal balistik antarbenua untuk mencapai target di benua mana pun.",
      isUnlocker: false
    },
    {
      id: 3,
      title: "Perang Nuklir",
      icon: Bomb,
      color: "text-orange-600",
      bg: "bg-orange-100",
      desc: "Mendeklarasikan serangan nuklir pertama. Ini akan memicu bencana global yang tak terbayangkan.",
      isUnlocker: false
    }
  ];

  const handleOptionClick = (option: typeof nuclearOptions[0]) => {
    if (!option.isUnlocker && !isNuclearProgramActive) return;

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
      setIsPerangNuklirDetailOpen(true);
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <Shield className="h-6 w-6 text-rose-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#00FFAA] tracking-wider uppercase">Komando Strategis Nuklir</h2>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-0.5">Pilih opsi persenjataan berat Anda</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar flex flex-col items-center">
          <div className="w-full space-y-6">

            {/* STATUS PENGEMBANGAN */}
            <div className="p-6 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/20 shadow-inner">
              <p className="text-center text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider mb-3">
                STATUS PENGEMBANGAN SENJATA NUKLIR
              </p>
              <div className="flex justify-center items-center gap-4">
                <div className={`px-6 py-3 rounded-xl border ${status.isActive ? 'border-[#00FFAA]/40 bg-[#00FFAA]/10 text-[#00FFAA]' : isNuclearProgramBuilding ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-rose-500/40 bg-rose-500/10 text-rose-400'} shadow-sm min-w-[200px] text-center transition-colors duration-300`}>
                  <p className="text-[11px] font-black uppercase tracking-wider mb-1">
                    {status.message}
                  </p>
                  {!isNuclearProgramActive && !isNuclearProgramBuilding && (
                    <p className="text-[10px] text-[#6B8A8A]">Klik kartu "Program Nuklir" untuk membuka akses</p>
                  )}
                  {isNuclearProgramBuilding && (
                    <p className="text-[10px] text-amber-400 font-bold">
                      Dalam tahap pembangunan hingga {formatTanggalIndo(buildEndDate)}
                    </p>
                  )}
                  {isNuclearProgramActive && (
                    <p className="text-[10px] text-[#00FFAA] font-bold">🎯 Sistem Siap Meluncur!</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-[#00FFAA]/20 bg-[#0F2424] p-4 text-center shadow-sm flex flex-col justify-center min-h-[140px]">
                  <p className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider mb-2">Kas Negara</p>
                  <div className="text-lg font-black text-[#00FFAA] leading-tight break-words">{currentCash.toLocaleString('id-ID')} <span className="text-[10px] text-[#6B8A8A] font-bold">EM</span></div>
                </div>

                <div className="rounded-xl border border-[#00FFAA]/20 bg-[#0F2424] p-4 text-center shadow-sm flex flex-col justify-center min-h-[140px]">
                  <p className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider mb-2">Stok Uranium</p>
                  <div className="text-lg font-black text-[#00FFAA] leading-tight break-words">{uraniumStock.toLocaleString('id-ID')}</div>
                </div>

                <div className="relative overflow-visible">
                  {formattedIcbmEndDate && isIcbmBuildQueued && remainingBuildQuantity > 0 ? (
                    <div className="absolute -top-6 left-1/2 z-20 -translate-x-1/2 rounded-sm bg-[#0A1A1A] text-[#00FFAA] text-[10px] font-bold px-2 py-1 border border-[#00FFAA]/30 shadow-md tracking-wider whitespace-nowrap">
                      Selesai {formattedIcbmEndDate}
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
                      <p className="mt-2 text-[10px] text-[#6B8A8A]">🔒 Terkunci. Aktifkan Program Nuklir terlebih dahulu.</p>
                    ) : isIcbmBuildQueued && remainingBuildQuantity > 0 ? (
                      <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-[#00FFAA]/10 px-3 py-0.5 text-[10px] font-bold text-[#00FFAA]">
                        +{remainingBuildQuantity} sedang dibangun
                      </div>
                    ) : isIcbmBuildQueued && remainingBuildQuantity === 0 ? (
                      <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-[#00FFAA]/20 px-3 py-0.5 text-[10px] font-bold text-[#00FFAA]">
                        ✔️ Semua ICBM telah selesai dibangun!
                      </div>
                    ) : (
                      <p className="mt-2 text-[10px] text-[#6B8A8A]">Bangun ICBM untuk melihat jadwal penyelesaian.</p>
                    )}
                    
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

            {/* GRID 3 KARTU STRATEGI */}
            <div className="grid grid-cols-3 gap-4">
              {nuclearOptions.map((option) => {
                const Icon = option.icon;
                const isLockedCard = !option.isUnlocker && !isNuclearProgramActive;
                const isUnlockerCardActive = option.isUnlocker && isNuclearProgramActive;
                const isUnlockerBuilding = option.isUnlocker && isNuclearProgramBuilding;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    disabled={isLockedCard || isUnlockerCardActive || isUnlockerBuilding}
                    className={`group flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-200 h-full ${
                        isLockedCard
                          ? 'bg-[#0A1A1A] border-[#00FFAA]/10 opacity-60 cursor-not-allowed'
                          : isUnlockerCardActive
                          ? 'bg-[#00FFAA]/10 border-[#00FFAA]/40 cursor-default'
                          : 'bg-[#0A1A1A] border-[#00FFAA]/20 hover:border-[#00FFAA] hover:shadow-lg cursor-pointer'
                      }`}
                  >
                    <div className={`p-3.5 rounded-full ${
                        isUnlockerCardActive ? 'bg-[#00FFAA]/20 border-[#00FFAA]/40' : 'bg-[#0F2424] border-[#00FFAA]/20'
                      } border mb-3 ${
                        isLockedCard || isUnlockerCardActive ? '' : 'group-hover:scale-110 transition-transform'
                      }`}
                    >
                      {isUnlockerCardActive ? (
                        <div className="w-10 h-10 text-[#00FFAA] flex items-center justify-center">
                          <span className="text-2xl">✔️</span>
                        </div>
                      ) : (
                        <Icon className={`w-10 h-10 ${isLockedCard ? 'text-[#6B8A8A]' : 'text-[#00FFAA]'}`} />
                      )}
                    </div>
                    
                    <span className={`text-sm font-black uppercase tracking-wide mb-1 ${
                      isLockedCard ? 'text-[#6B8A8A]' : isUnlockerCardActive ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'
                    }`}>
                      {isUnlockerCardActive ? "Program Aktif!" : option.title}
                    </span>
                    
                    <p className={`text-[10px] leading-relaxed ${
                      isLockedCard ? 'text-[#6B8A8A]' : isUnlockerCardActive ? 'text-[#00FFAA]' : 'text-[#6B8A8A]'
                    }`}>
                      {isLockedCard 
                        ? "🔒 Terkunci. Aktifkan Program Nuklir terlebih dahulu." 
                        : isUnlockerCardActive 
                        ? "Program nuklir telah diaktifkan. Kini Anda dapat mengakses ICBM dan Perang Nuklir."
                        : isUnlockerBuilding
                        ? "Program nuklir sedang dibangun. Tunggu hingga selesai untuk membuka ICBM dan Perang Nuklir."
                        : option.desc
                      }
                    </p>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>

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
        onOpenDetail={() => {
          setIsIcbmBuildStatusOpen(false);
          setIsIcbmDetailOpen(true);
        }}
      />

      <PerangNuklirDetailModal
        isOpen={isPerangNuklirDetailOpen}
        onClose={() => setIsPerangNuklirDetailOpen(false)}
        countryDetail={countryDetail}
        prefetchedAllCountries={prefetchedAllCountries}
        onAction={(target) => {
          alert(`Deklarasi perang nuklir terhadap ${target.countryName}! Konsekuensi global tak terbayangkan telah dimulai.`);
        }}
      />
    </div>
  );
}