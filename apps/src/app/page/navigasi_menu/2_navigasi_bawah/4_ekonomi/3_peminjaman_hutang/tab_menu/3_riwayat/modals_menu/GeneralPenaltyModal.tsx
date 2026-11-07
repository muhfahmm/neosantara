"use client";
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
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
      <div className="modal-responsive-shell bg-root-surface border border-root-accent/30 rounded-2xl overflow-hidden flex flex-col relative font-sans pointer-events-auto">

        <div className="px-8 py-6 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10">
          <div>
            <h3 className="text-2xl font-black text-root-accent tracking-tight leading-none uppercase">Penjelasan Denda Telat Bayar</h3>
            <p className="text-xs text-root-subtle font-semibold mt-1">Rincian aturan denda bila pembayaran pinjaman terlewat.</p>
          </div>
          <SharedModalCloseButton onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-root-accent/30 bg-root-surface text-root-accent hover:bg-root-accent hover:text-root-canvas transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5" appearance="custom">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </SharedModalCloseButton>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-root-canvas/80 relative z-10 custom-scrollbar">
          <div className="space-y-3 text-sm text-root-text font-semibold leading-relaxed">
            <p>Jika sebuah pinjaman jatuh tempo dan tidak bisa dibayar penuh, sistem akan mencoba membayar sebanyak mungkin dari kas negara.</p>
            <p>Jika masih ada sisa, sistem menandainya sebagai <strong className="text-rose-400">terlewat</strong> dan menambahkan denda setiap bulannya.</p>
            <p>Rumus denda yang digunakan: <strong className="text-root-accent">denda = outstanding × (0.015 × jumlah_bulan_terlewat)</strong>.</p>
            <p>Contoh: jika outstanding = 10.000 NEO dan bulan terlewat = 1, maka denda = 10.000 × (0.015 × 1) = 150 NEO.</p>
            <p>Perhitungan ini sama untuk pinjaman bilateral dan multilateral di game saat ini.</p>
          </div>
        </div>

      </div>
    </div>
  );
}