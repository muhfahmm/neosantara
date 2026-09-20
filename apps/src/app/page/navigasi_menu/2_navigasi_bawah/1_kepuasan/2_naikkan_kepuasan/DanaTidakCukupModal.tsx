"use client";

import { X, Coins, AlertCircle } from "lucide-react";

interface DanaTidakCukupModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCost: number;
  currentBudget: number;
  actionName?: string;
  onTakeLoan?: () => void; // Opsional: jika ingin menambahkan tombol pinjaman
}

export default function DanaTidakCukupModal({
  isOpen,
  onClose,
  requiredCost,
  currentBudget,
  actionName = "Aksi ini",
  onTakeLoan,
}: DanaTidakCukupModalProps) {
  if (!isOpen) return null;

  const shortage = Math.max(0, requiredCost - currentBudget);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424]/90 backdrop-blur-md border border-[#00FFAA]/30 rounded-2xl w-full max-w-6xl h-[84vh] overflow-hidden flex flex-col relative font-sans pointer-events-auto">

        {/* Header */}
        <div className="px-8 py-6 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertCircle className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-rose-400 tracking-tight leading-none uppercase">Dana Tidak Mencukupi</h2>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Treasury Bar */}
        <div className="px-8 py-4 bg-[#0A1A1A] border-b border-[#00FFAA]/20 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <Coins className="h-5 w-5 text-[#00FFAA]" />
            <span className="text-xs font-bold text-[#6B8A8A] uppercase tracking-wide">
              Kas Negara Saat Ini:
            </span>
            <span className="text-sm font-black text-[#00FFAA]">
              {currentBudget.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#6B8A8A] uppercase tracking-wide">
              Dibutuhkan:
            </span>
            <span className="text-sm font-black text-rose-400">
              {requiredCost.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <div className="space-y-6 animate-in fade-in duration-500">

            {/* Pesan utama */}
            <div className="bg-[#0F2424] border border-rose-500/30 rounded-2xl p-6 text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertCircle size={40} />
                </div>
              </div>
              <h3 className="text-xl font-black text-[#E0E0E0] uppercase tracking-wide">
                {actionName} gagal!
              </h3>
              <p className="text-sm text-[#6B8A8A] font-semibold">
                Kas negara tidak mencukupi untuk melaksanakan aksi ini.
              </p>
              <div className="mt-2 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-4 text-xs space-y-1 text-[#E0E0E0]">
                <div className="flex justify-between">
                  <span className="font-bold text-[#6B8A8A]">Dana dibutuhkan:</span>
                  <span className="text-rose-400 font-black">{requiredCost.toLocaleString("id-ID")} EM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#6B8A8A]">Kas tersedia:</span>
                  <span className="text-[#00FFAA] font-black">{currentBudget.toLocaleString("id-ID")} EM</span>
                </div>
                <div className="flex justify-between border-t border-[#00FFAA]/20 pt-2 mt-1">
                  <span className="font-bold text-[#6B8A8A]">Kekurangan dana:</span>
                  <span className="text-rose-400 font-black">- {shortage.toLocaleString("id-ID")} EM</span>
                </div>
              </div>
              <p className="text-xs text-[#6B8A8A] mt-2">
                Kumpulkan lebih banyak dana melalui pajak, perdagangan, atau tunggu pemasukan negara berikutnya.
              </p>
            </div>

            {/* Tombol aksi */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Kembali
              </button>
              {onTakeLoan && (
                <button
                  onClick={onTakeLoan}
                  className="px-8 py-3 rounded-xl bg-[#00FFAA] text-[#0A1A1A] border border-[#00FFAA] transition-all font-black text-xs uppercase cursor-pointer"
                >
                  Ambil Pinjaman Darurat
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}