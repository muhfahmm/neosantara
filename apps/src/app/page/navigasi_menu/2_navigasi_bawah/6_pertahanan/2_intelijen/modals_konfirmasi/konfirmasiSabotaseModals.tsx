"use client"
import React from "react";
import { X, Bomb, AlertTriangle, Shield } from "lucide-react";

interface KonfirmasiSabotaseModalsProps {
  isOpen: boolean;
  onClose: () => void;
  targetCountry: any;
  onConfirm: () => void;
}

export default function KonfirmasiSabotaseModals({
  isOpen,
  onClose,
  targetCountry,
  onConfirm,
}: KonfirmasiSabotaseModalsProps) {
  if (!isOpen || !targetCountry) return null;

  const targetName = targetCountry.countryName || "Target";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 pointer-events-auto backdrop-blur-sm">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col relative font-sans pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <Bomb className="h-6 w-6 text-orange-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#00FFAA] tracking-wider uppercase">Konfirmasi Sabotase</h2>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-0.5">
                  Target: {targetName}
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar flex flex-col items-center justify-center">
          <div className="w-full max-w-lg space-y-6">
            <div className="flex justify-center">
              <div className="p-5 rounded-full bg-[#0A1A1A] border border-orange-500/30 shadow-inner">
                <AlertTriangle className="w-16 h-16 text-orange-400" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-lg font-black text-[#00FFAA] uppercase tracking-wider">
                Lancarkan Operasi Khusus!
              </p>
              <p className="text-xs text-[#6B8A8A] font-medium leading-relaxed max-w-lg mx-auto">
                Kirim tim operasi khusus untuk melumpuhkan fasilitas vital di negara <span className="text-[#E0E0E0] font-bold">{targetName}</span>.
                Biaya operasional diperkirakan sebesar <span className="font-black text-[#00FFAA]">20.000.000 EM</span>.
              </p>
            </div>

            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl shadow-sm flex flex-col items-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#6B8A8A] mb-1">Target Operasi</p>
              <p className="text-base font-black text-orange-400">{targetName}</p>
              <p className="text-xs text-[#6B8A8A] mt-1">
                Kekuatan Militer: <span className="font-black text-[#E0E0E0]">{targetCountry?.totalPower?.toLocaleString("id-ID") || "Tidak diketahui"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-[#00FFAA]/30 bg-[#0A1A1A] relative z-10 shrink-0 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all font-black text-xs uppercase tracking-wider cursor-pointer">
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-900/30 font-black text-xs uppercase tracking-wider hover:bg-orange-400 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <Bomb className="w-4 h-4" />
            Luncurkan Sabotase
          </button>
        </div>
      </div>
    </div>
  );
}