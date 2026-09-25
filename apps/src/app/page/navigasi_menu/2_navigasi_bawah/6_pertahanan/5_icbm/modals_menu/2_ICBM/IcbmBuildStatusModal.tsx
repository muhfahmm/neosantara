"use client"
import React, { useState } from "react";
import { X, Clock, ShieldCheck, Rocket } from "lucide-react";
import TabelDalamPembangunan from "./tab_menu/tabelDalamPembangunan";
import TabelSelesai from "./tab_menu/tabelSelesai";

interface IcbmBuildStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  currentDate?: string | Date;
  onOpenDetail?: () => void;
}

const formatTanggalIndo = (dateStr: string | Date) => {
  if (!dateStr) return "-";
  const dateObj = typeof dateStr === "string" ? new Date(`${dateStr}T00:00:00`) : dateStr;
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return String(dateStr);
  
  const day = dateObj.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
};

export default function IcbmBuildStatusModal({ 
  isOpen, 
  onClose, 
  countryDetail, 
  currentDate, 
  onOpenDetail 
}: IcbmBuildStatusModalProps) {
  if (!isOpen) return null;

  const safeDateString = (() => {
    if (!currentDate) return formatTanggalIndo(new Date());
    if (typeof currentDate === 'string') return currentDate;
    if (currentDate instanceof Date && !isNaN(currentDate.getTime())) return currentDate.toISOString().slice(0, 10);
    return formatTanggalIndo(new Date());
  })();

  const icbmBuildTask = countryDetail?.icbmBuildTask || null;
  const buildTasks = Array.isArray(icbmBuildTask) ? icbmBuildTask : icbmBuildTask ? [icbmBuildTask] : [];

  const parseDate = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return null;
    const dateObj = typeof dateValue === 'string' ? new Date(`${dateValue}T00:00:00`) : dateValue;
    return dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj : null;
  };

  const getDurationDays = (start: string | Date | null | undefined, end: string | Date | null | undefined) => {
    const startDate = parseDate(start);
    const endDate = parseDate(end);
    if (!startDate || !endDate) return 0;
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const todayDate = parseDate(safeDateString);

  // 🔥 PEMBANGKITAN DATA ANTRIAN (Tanpa kata "selesai dalam X hari")
  const scheduledEntries = (() => {
    let runningIndex = 0;
    return buildTasks.flatMap((task) => {
      const quantity = Math.max(0, Number(task?.quantity) || 0);
      const startDate = parseDate(task?.startDate) || todayDate || new Date();
      const endDate = parseDate(task?.endDate);
      const totalDurationDays = getDurationDays(startDate, endDate);
      const unitDurationDays = quantity > 0 ? Math.max(1, Math.round(totalDurationDays / quantity)) : 0;

      return Array.from({ length: quantity }, (_, idx) => {
        runningIndex += 1;
        const entryDuration = unitDurationDays * (idx + 1);
        const entryEndDate = startDate ? addDays(startDate, entryDuration) : null;

        return {
          id: `${task?.startDate || 'task'}-${idx}-${runningIndex}`,
          label: `ICBM ${runningIndex}`, // 🔥 Bersih, tanpa durasi lagi
          amount: 1,
          endDate: entryEndDate,
        };
      });
    });
  })();

  const pendingEntries = scheduledEntries.filter((entry) => {
    if (!entry.endDate || !todayDate) return true;
    return entry.endDate >= todayDate;
  });

  const completedEntries = scheduledEntries.filter((entry) => {
    if (!entry.endDate || !todayDate) return false;
    return entry.endDate < todayDate;
  });

  const activeTabOptions = ['Dalam Pembangunan', 'Selesai'] as const;
  type ActiveTab = (typeof activeTabOptions)[number];
  const [activeTab, setActiveTab] = useState<ActiveTab>('Dalam Pembangunan');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Status Pembangunan ICBM</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">Pantau perkembangan produksi rudal balistik antarbenua</p>
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
        <div className="p-4 sm:p-6 bg-[#0F2424] flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">

            {/* TAB MENU */}
            <div className="bg-[#0A1A1A] p-1 rounded-xl border border-[#00FFAA]/20 inline-flex shadow-sm">
              {activeTabOptions.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#00FFAA] text-[#0A1A1A] font-black shadow-md'
                      : 'text-[#E0E0E0] hover:text-[#00FFAA]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* WRAPPER TABEL */}
            <div className="rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] shadow-sm overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                {activeTab === 'Dalam Pembangunan' ? (
                  <TabelDalamPembangunan entries={pendingEntries} />
                ) : (
                  <TabelSelesai entries={completedEntries} />
                )}
              </div>
            </div>

            {/* PANEL INFORMASI BAWAH */}
            <div className="rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col gap-2.5">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#6B8A8A]">Informasi Tambahan</p>
                <p className="text-xs sm:text-sm text-[#E0E0E0] leading-relaxed">
                  Tabel tab pertama menampilkan daftar ICBM yang sedang dibangun. Tab kedua menyimpan total ICBM yang sudah selesai.
                </p>
                <button
                  onClick={onOpenDetail}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00FFAA] px-4 py-2 text-xs font-black text-[#0A1A1A] uppercase tracking-wider shadow-sm hover:bg-[#00FFAA]/80 transition-all cursor-pointer mt-1"
                >
                  <Clock className="h-4 w-4" />
                  Lihat Detail Pembangunan
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}