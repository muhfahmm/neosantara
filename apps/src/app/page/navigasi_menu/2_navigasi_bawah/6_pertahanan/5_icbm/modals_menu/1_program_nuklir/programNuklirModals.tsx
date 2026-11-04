"use client"
import React, { useState } from "react";
import { X, Atom } from "lucide-react";
import NotebookModalWrapper from "../../../../NotebookModalWrapper";
import DanaTidakCukupModals from "./danaTidakCukupModals";
import ProgramNuklirTimeDetail from "./ProgramNuklirTimeDetail";
import { generateProgramNuklirDimulaiNotification } from "@/app/page/menus/inbox/logic/2_notifikasi_pertahanan/5_icbm/icbmLogic";

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
  const biayaProgram = 2500; // data logika harga 25.000.000 NEO

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

      const userCountryName = prev?.country || prev?.nama || "Indonesia";
      const startNotif = generateProgramNuklirDimulaiNotification(userCountryName, endDateStr, safeCurrentDate);
      const existingPending = Array.isArray(prev?.pending_notifications) ? prev.pending_notifications : [];

      return {
        ...prev,
        anggaran: prevBudget - biayaProgram,
        pending_notifications: [startNotif, ...existingPending],
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
    <>
      {!(isDanaTidakCukupOpen || isTimeDetailOpen) && (
        <NotebookModalWrapper onClose={onClose}>
          <div className="flex h-full flex-col overflow-hidden">
            
            {/* Header Modal */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-root-surface rounded-xl border border-root-accent/30">
                  <Atom className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-root-accent tracking-tight leading-none uppercase">Aktivasi Program Nuklir</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-root-subtle mt-1">Pendanaan Riset & Pengayaan Uranium</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-1.5 lg:p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
              >
                <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 bg-root-surface relative z-10 custom-scrollbar flex flex-col items-center justify-center">
              <div className="w-full max-w-2xl space-y-6">
                
                <div className="text-center space-y-4">
                  <div className="p-4 rounded-2xl bg-root-canvas border border-root-accent/30 inline-block mx-auto shadow-md">
                    <Atom className="w-12 h-12 sm:w-16 sm:h-16 text-root-accent" />
                  </div>
                </div>

                <div className="bg-root-canvas border border-root-accent/20 p-5 sm:p-6 rounded-2xl space-y-3 shadow-inner">
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-root-text">
                    <span>Waktu Pembangunan:</span>
                    <span className="text-root-text">1 Tahun / 365 Hari</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-rose-400 border-t border-root-accent/20 pt-3">
                    <span>Biaya Riset & Pengembangan:</span>
                    <span>- {biayaProgram.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
                  </div>
                </div>
                {isProgramBuilding && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-[11px] font-bold text-amber-400 text-center">
                    Program nuklir sudah dalam tahap pembangunan. Silakan tunggu 1 Tahun / 365 Hari sampai selesai.
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t border-root-accent/20">
                  <button 
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl border border-root-accent/30 bg-root-canvas text-root-subtle hover:text-root-accent hover:border-root-accent transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleBayar}
                    disabled={isProgramBuilding}
                    className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all ${isProgramBuilding ? 'bg-root-subtle/30 text-root-subtle cursor-not-allowed' : 'bg-root-accent text-root-canvas hover:bg-root-accent/80 active:scale-95 cursor-pointer'}`}
                  >
                    Danai Program ({biayaProgram.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO)
                  </button>
                </div>

              </div>
            </div>
          </div>
        </NotebookModalWrapper>
      )}

      {/* Render Modal Dana Tidak Cukup di root level */}
      <DanaTidakCukupModals 
        isOpen={isDanaTidakCukupOpen}
        onClose={() => setIsDanaTidakCukupOpen(false)}
        currentBudget={anggaran}
        requiredBudget={biayaProgram}
        onTakeLoan={onTakeLoan}
      />

      {/* Render Modal Waktu Pembangunan untuk rincian 365 hari di root level */}
      <ProgramNuklirTimeDetail
        isOpen={isTimeDetailOpen}
        onClose={() => setIsTimeDetailOpen(false)}
        durationLabel="1 Tahun"
        durationDays={365}
      />
    </>
  );
}