"use client"
import React, { useState } from "react";
import { X, AlertCircle, Coins, Banknote } from "lucide-react";
import NeonAlertModal from "../NeonAlertModal";

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
  const [showLoanUnavailable, setShowLoanUnavailable] = useState(false);

  if (!isOpen) return null;

  const kekurangan = requiredBudget - currentBudget;

  const handleTakeLoan = () => {
    if (onTakeLoan) {
      onTakeLoan(); // Jalankan logika hutang dari parent
      onClose(); // Tutup modal setelah aksi
    } else {
      setShowLoanUnavailable(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
      <div className="bg-[#061312] border-2 border-[#FF2D55] rounded-2xl w-full max-w-6xl h-[84vh] overflow-hidden shadow-[0_0_34px_rgba(255,45,85,0.35)] flex flex-col relative font-sans">
        {/* Header Modal */}
        <div className="px-8 py-6 border-b border-[#FF2D55]/25 flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-[#FF2D55] animate-pulse drop-shadow-[0_0_6px_#FF2D55]" />
            <div>
              <h2 className="text-2xl font-bold text-[#FF2D55] tracking-tight leading-none uppercase">Dana Tidak Mencukupi</h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B8A8A] mt-1">Gagal melakukan pendanaan program nuklir</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl border border-[#FF2D55]/40 text-[#6B8A8A] hover:text-[#FF2D55] hover:bg-[#FF2D55]/10 transition-all cursor-pointer flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="flex-1 min-h-0 overflow-y-auto p-8 relative z-10 neon-scrollbar flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-[#FF2D55]/10 border border-[#FF2D55]/40 inline-block mx-auto">
                <Coins className="w-16 h-16 text-[#FF2D55] drop-shadow-[0_0_8px_#FF2D55]" />
              </div>
              <p className="text-sm font-semibold text-[#D6F5EC]">
                Saldo kas negara Anda tidak mencukupi untuk memulai riset pengayaan uranium.
              </p>
              <p className="text-xs text-[#9CC9BD] leading-relaxed text-justify">
                Anda perlu mengumpulkan dana lebih banyak melalui pajak, perdagangan, atau pinjaman internasional sebelum dapat membangun hulu ledak nuklir pertama.
              </p>
            </div>

            <div className="bg-[#0A1D1B] border border-[#00FFAA]/20 p-6 rounded-xl space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#D6F5EC]">
                <span>Kas Anggaran Saat Ini:</span>
                <span className="text-[#FF6B88]">{currentBudget.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#D6F5EC]">
                <span>Biaya yang Dibutuhkan:</span>
                <span className="text-[#00FFAA]">{requiredBudget.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#FF6B88] border-t border-[#FF2D55]/20 pt-3">
                <span>Total Kekurangan Dana:</span>
                <span>- {kekurangan.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
              </div>
            </div>

            {/* 🔥 Footer dengan 2 tombol (Kembali & Ambil Hutang) */}
            <div className="flex gap-4 justify-end pt-4 border-t border-[#FF2D55]/20">
              <button 
                onClick={onClose}
                className="px-8 py-3 rounded-xl border border-[#FF2D55]/50 text-[#FF6B88] hover:bg-[#FF2D55]/10 transition-all font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Kembali
              </button>
              <button 
                onClick={handleTakeLoan}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00FFAA] text-[#04100F] font-black text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(0,255,170,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Banknote className="w-4 h-4" />
                Ambil Hutang
              </button>
            </div>
          </div>
        </div>
      </div>

      <NeonAlertModal
        isOpen={showLoanUnavailable}
        onClose={() => setShowLoanUnavailable(false)}
        variant="info"
        title="Fitur Belum Tersedia"
        message="Fitur ambil hutang belum terhubung ke sistem keuangan negara."
      />
    </div>
  );
}