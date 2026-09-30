"use client"
import React from "react";
import { X, AlertCircle, Banknote } from "lucide-react";

interface IcbmInsufficientFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  requiredBudget: number;
  // 🔥 Tambahkan prop untuk membuka menu Pinjaman & Hutang
  onOpenDebt?: () => void; 
}

export default function IcbmInsufficientFundsModal({
  isOpen,
  onClose,
  currentBudget,
  requiredBudget,
  onOpenDebt,
}: IcbmInsufficientFundsModalProps) {
  if (!isOpen) return null;

  const deficit = Math.max(0, requiredBudget - currentBudget);

  return (
    <div className="fixed inset-0 z-[92] flex items-center justify-center p-4 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-4 border-[#C4B49C] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative font-sans pointer-events-auto">
        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE]">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600" />
            <div>
              <h3 className="text-xl font-black text-[#5c3c10]">Dana Tidak Cukup</h3>
              <p className="text-[11px] text-[#8b7e66] mt-1">Kas negara Anda tidak mencukupi untuk membangun ICBM.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 bg-[#FAF6EE]/40">
          <div className="space-y-4 text-sm text-[#5c3c10]">
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-bold text-rose-700">Dana saat ini tidak mencukupi</p>
              <p className="text-xs text-[#8b7e66] mt-1">Silakan kumpulkan lebih banyak sumber daya sebelum memulai pembangunan.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 text-[#5c3c10]">
              <div className="flex justify-between text-xs font-bold">
                <span>Kas Negara Sekarang:</span>
                <span>{currentBudget.toLocaleString("id-ID")} NEO</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span>Biaya Pembangunan ICBM:</span>
                <span>{requiredBudget.toLocaleString("id-ID")} NEO</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-rose-700 border-t border-[#C4B49C]/20 pt-3">
                <span>Kekurangan Dana:</span>
                <span>-{deficit.toLocaleString("id-ID")} NEO</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 FOOTER DIPERBARUI: Tombol "Pinjam Dana" & "Kembali" menjadi sama lebar */}
        <div className="px-6 py-4 border-t border-[#C4B49C]/30 bg-[#FAF6EE] flex w-full gap-3">
          
          {/* Tombol Baru: Pinjam Dana */}
          <button
            onClick={() => {
              onOpenDebt?.(); // Buka modal Pinjaman & Hutang
              onClose();      // Tutup modal kekurangan dana ini
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-[#5c3c10] text-[#FAF6EE] font-black text-xs uppercase tracking-wider shadow-sm hover:bg-[#8b7e66] hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <Banknote className="h-4 w-4" />
            Pinjam Dana
          </button>

          {/* Tombol Kembali (Diperlebar dengan flex-1) */}
          <button 
            onClick={onClose} 
            className="flex-1 py-3 rounded-lg border-2 border-[#C4B49C] bg-white text-[#5c3c10] font-black text-xs uppercase tracking-wider hover:bg-[#f7f2e8] hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            Kembali
          </button>

        </div>
      </div>
    </div>
  );
}