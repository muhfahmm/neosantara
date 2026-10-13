"use client"
import React from "react";
import { X, Clock3 } from "lucide-react";

interface ProgramNuklirTimeDetailProps {
  isOpen: boolean;
  onClose: () => void;
  durationLabel?: string;
  durationDays?: number;
}

export default function ProgramNuklirTimeDetail({
  isOpen,
  onClose,
  durationLabel = "1 Tahun",
  durationDays = 1,
}: ProgramNuklirTimeDetailProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/20 pointer-events-none">
      <div className="bg-[#FAF6EE] border-4 border-[#C4B49C] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col relative font-sans pointer-events-auto">
        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE]">
          <div className="flex items-center gap-3">
            <Clock3 className="h-6 w-6 text-yellow-600" />
            <div>
              <h2 className="text-2xl font-bold text-[#5c3c10] uppercase tracking-tight">Waktu Pembangunan Program Nuklir</h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b7e66] mt-1">Estimasi pembangunan selama program nuklir aktif</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1.5"
          >
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 bg-[#FAF6EE]/90">
          <div className="rounded-3xl border-2 border-[#C4B49C]/30 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-700">
                <Clock3 className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#8b7e66] font-bold">Durasi Pembangunan</p>
                <h3 className="text-3xl font-black text-[#5c3c10] mt-1">{durationLabel}</h3>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 text-sm text-[#5c3c10]">
              <div className="rounded-2xl bg-[#f7f1e4] p-4 border border-[#C4B49C]/20">
                <p className="font-bold">Total Waktu:</p>
                <p className="mt-2 text-base text-[#5c3c10]">{durationDays.toLocaleString("id-ID", { maximumFractionDigits: 2 })} Hari</p>
              </div>
              <div className="rounded-2xl bg-[#f7f1e4] p-4 border border-[#C4B49C]/20">
                <p className="font-bold">Keterangan:</p>
                <p className="mt-2 text-[#8b7e66] leading-relaxed">Program nuklir memerlukan waktu pembangunan selama satu tahun penuh (365 hari) untuk menyelesaikan riset, pengayaan bahan bakar, dan pembangunan fasilitas strategis.</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-yellow-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:bg-yellow-700 active:scale-95 transition-all"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
