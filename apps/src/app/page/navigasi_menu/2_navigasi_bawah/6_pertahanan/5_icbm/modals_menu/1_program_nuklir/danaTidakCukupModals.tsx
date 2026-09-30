"use client"
import React from "react";
import { X, AlertCircle, Coins, Banknote } from "lucide-react";

interface DanaTidakCukupModalsProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  requiredBudget: number;
  // 🔥 Tambahkan prop baru untuk fungsi ambil hutang
  onTakeLoan?: () => void; 
}

export default function DanaTidakCukupModals({ 
  isOpen, 
  onClose, 
  currentBudget, 
  requiredBudget,
  onTakeLoan
}: DanaTidakCukupModalsProps) {
  if (!isOpen) return null;

  const kekurangan = requiredBudget - currentBudget;

  const handleTakeLoan = () => {
    if (onTakeLoan) {
      onTakeLoan(); // Jalankan logika hutang dari parent
      onClose(); // Tutup modal setelah aksi
    } else {
      alert("Fitur ambil hutang belum terhubung ke sistem keuangan negara.");
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-4 border-[#C4B49C] rounded-2xl w-full max-w-6xl h-[84vh] overflow-hidden shadow-2xl flex flex-col relative font-sans pointer-events-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />
        
        {/* Header Modal */}
        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-600 animate-pulse" />
              <div>
                <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Dana Tidak Mencukupi</h2>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b7e66] mt-1">Gagal melakukan pendanaan program nuklir</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl space-y-6">
            
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-rose-100/50 border border-rose-600/20 inline-block mx-auto">
                <Coins className="w-16 h-16 text-rose-600" />
              </div>
              <p className="text-sm font-semibold text-[#5c3c10]">
                Saldo kas negara Anda tidak mencukupi untuk memulai riset pengayaan uranium.
              </p>
              <p className="text-xs text-[#8b7e66] leading-relaxed text-justify">
                Anda perlu mengumpulkan dana lebih banyak melalui pajak, perdagangan, atau pinjaman internasional sebelum dapat membangun hulu ledak nuklir pertama.
              </p>
            </div>

            <div className="bg-[#e4dac3]/20 border border-[#C4B49C]/30 p-6 rounded-xl space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#5c3c10]">
                <span>Kas Anggaran Saat Ini:</span>
                <span className="text-rose-700">{currentBudget.toLocaleString("id-ID")} NEO</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#5c3c10]">
                <span>Biaya yang Dibutuhkan:</span>
                <span className="text-emerald-700">{requiredBudget.toLocaleString("id-ID")} NEO</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-rose-700 border-t border-[#C4B49C]/20 pt-3">
                <span>Total Kekurangan Dana:</span>
                <span>- {kekurangan.toLocaleString("id-ID")} NEO</span>
              </div>
            </div>

            {/* 🔥 Footer dengan 2 tombol (Kembali & Ambil Hutang) */}
            <div className="flex gap-4 justify-end pt-4 border-t border-[#C4B49C]/20">
              <button 
                onClick={onClose}
                className="px-8 py-3 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 transition-all font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Kembali
              </button>
              <button 
                onClick={handleTakeLoan}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-b from-[#ffe07d] via-[#fcae1e] to-[#c77a00] text-[#5c3c10] font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Banknote className="w-4 h-4" />
                Ambil Hutang
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}