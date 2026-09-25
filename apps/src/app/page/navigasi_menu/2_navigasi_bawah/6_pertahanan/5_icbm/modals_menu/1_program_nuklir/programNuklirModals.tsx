"use client"
import React, { useState } from "react";
import { X, Atom } from "lucide-react";
import DanaTidakCukupModals from "./danaTidakCukupModals";
import ProgramNuklirTimeDetail from "./ProgramNuklirTimeDetail";

interface ProgramNuklirModalsProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate?: string | Date;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onTakeLoan?: () => void;
}

export default function ProgramNuklirModals({ 
  isOpen, 
  onClose,
  currentDate,
  countryDetail, 
  setCountryDetail,
  onTakeLoan
}: ProgramNuklirModalsProps) {
  if (!isOpen) return null;

  const anggaran = countryDetail?.anggaran || 0;
  const biayaProgram = 2500; // data logika harga 25.000.000 EM

  const formatDateString = (date?: string | Date) => {
    if (!date) return "";
    if (typeof date === "string") return date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const addDays = (dateString: string, days: number) => {
    const [y, m, d] = dateString.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const safeCurrentDate = formatDateString(currentDate) || formatDateString(new Date());
  const isProgramBuilding = !countryDetail?.programNuklirActive && (countryDetail?.ongoingConstructions || []).some((c: any) => c.buildingKey === "program_nuklir");

  // 🔥 State untuk membuka modal "Dana Tidak Cukup"
  const [isDanaTidakCukupOpen, setIsDanaTidakCukupOpen] = useState(false);

  const [isTimeDetailOpen, setIsTimeDetailOpen] = useState(false);

  const handleBayar = () => {
    if (anggaran < biayaProgram) {
      // 🔥 Alih-alih alert, buka modal baru
      setIsDanaTidakCukupOpen(true);
      return;
    }

    setCountryDetail((prev: any) => {
      const prevBudget = Number(prev?.anggaran) || 0;
      const ongoing = prev?.ongoingConstructions || [];
      const existingBuilds = ongoing.filter((c: any) => c.buildingKey === "program_nuklir");
      const startDateStr = existingBuilds.length > 0 ? existingBuilds[existingBuilds.length - 1].endDate : safeCurrentDate;
      const endDateStr = addDays(startDateStr, 1); // data logika durasi pembangunan nuklir

      return {
        ...prev,
        anggaran: prevBudget - biayaProgram,
        ongoingConstructions: [
          ...ongoing,
          {
            id: Date.now() + Math.random(),
            buildingKey: "program_nuklir",
            startDate: startDateStr,
            endDate: endDateStr,
          },
        ],
      };
    });

    setIsTimeDetailOpen(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* Header Modal */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Atom className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Aktivasi Program Nuklir</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">Pendanaan Riset & Pengayaan Uranium</p>
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

        {/* Body Modal */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 bg-[#0F2424] relative z-10 custom-scrollbar flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl space-y-6">
            
            <div className="text-center space-y-4">
              <div className="p-4 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30 inline-block mx-auto shadow-md">
                <Atom className="w-12 h-12 sm:w-16 sm:h-16 text-[#00FFAA]" />
              </div>
              <p className="text-sm sm:text-base font-bold text-[#E0E0E0]">
                Anda akan memulai riset pengayaan uranium skala besar untuk membangun hulu ledak nuklir pertama negara.
              </p>
              <p className="text-xs text-[#6B8A8A] leading-relaxed text-center">
                Pendanaan ini mencakup pembangunan fasilitas sentrifugal rahasia, pengadaan bahan baku, hingga pengujian sistem detonasi bawah tanah. 
                Dengan mengaktifkan program ini, Anda akan membuka akses ke teknologi rudal balistik antarbenua (ICBM) dan opsi perang nuklir.
              </p>
            </div>

            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-5 sm:p-6 rounded-2xl space-y-3 shadow-inner">
              <div className="flex justify-between text-xs sm:text-sm font-bold text-[#E0E0E0]">
                <span>Kas Anggaran Negara:</span>
                <span className="text-[#00FFAA]">{anggaran.toLocaleString("id-ID")} EM</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm font-bold text-[#E0E0E0]">
                <span>Waktu Pembangunan:</span>
                <span className="text-[#E0E0E0]">1 Tahun / 365 Hari</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm font-bold text-rose-400 border-t border-[#00FFAA]/20 pt-3">
                <span>Biaya Riset & Pengembangan:</span>
                <span>- {biayaProgram.toLocaleString("id-ID")} EM</span>
              </div>
            </div>
            {isProgramBuilding && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-[11px] font-bold text-amber-400 text-center">
                Program nuklir sudah dalam tahap pembangunan. Silakan tunggu 1 Tahun / 365 Hari sampai selesai.
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-[#00FFAA]/20">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleBayar}
                disabled={isProgramBuilding}
                className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all ${isProgramBuilding ? 'bg-[#6B8A8A]/30 text-[#6B8A8A] cursor-not-allowed' : 'bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 active:scale-95 cursor-pointer'}`}
              >
                Danai Program ({biayaProgram.toLocaleString("id-ID")} EM)
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 🔥 Render Modal Dana Tidak Cukup di sini */}
      <DanaTidakCukupModals 
        isOpen={isDanaTidakCukupOpen}
        onClose={() => setIsDanaTidakCukupOpen(false)}
        currentBudget={anggaran}
        requiredBudget={biayaProgram}
        onTakeLoan={onTakeLoan}
      />

      {/* 🔥 Render Modal Waktu Pembangunan untuk rincian 365 hari */}
      <ProgramNuklirTimeDetail
        isOpen={isTimeDetailOpen}
        onClose={() => setIsTimeDetailOpen(false)}
        durationLabel="1 Tahun"
        durationDays={365}
      />
      
    </div>
  );
}