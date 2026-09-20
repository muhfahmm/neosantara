"use client";
import React from "react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GeneralPenaltyModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        <div className="px-8 py-6 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10">
          <div>
            <h3 className="text-2xl font-black text-[#00FFAA] tracking-tight leading-none uppercase">Penjelasan Denda Telat Bayar</h3>
            <p className="text-xs text-[#6B8A8A] font-semibold mt-1">Rincian aturan denda bila pembayaran pinjaman terlewat.</p>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <div className="space-y-3 text-sm text-[#E0E0E0] font-semibold leading-relaxed">
            <p>Jika sebuah pinjaman jatuh tempo dan tidak bisa dibayar penuh, sistem akan mencoba membayar sebanyak mungkin dari kas negara.</p>
            <p>Jika masih ada sisa, sistem menandainya sebagai <strong className="text-rose-400">terlewat</strong> dan menambahkan denda setiap bulannya.</p>
            <p>Rumus denda yang digunakan: <strong className="text-[#00FFAA]">denda = outstanding × (0.015 × jumlah_bulan_terlewat)</strong>.</p>
            <p>Contoh: jika outstanding = 10.000 EM dan bulan terlewat = 1, maka denda = 10.000 × (0.015 × 1) = 150 EM.</p>
            <p>Perhitungan ini sama untuk pinjaman bilateral dan multilateral di game saat ini.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
