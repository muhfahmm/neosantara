"use client";

import { AlertTriangle, X } from "lucide-react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";

interface ArmsTradeBudgetModalProps {
  availableCash: number;
  requiredCash: number;
  onClose: () => void;
}

const formatCash = (value: number) =>
  `${Math.max(0, value).toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO`;

export default function ArmsTradeBudgetModal({
  availableCash,
  requiredCash,
  onClose,
}: ArmsTradeBudgetModalProps) {
  const shortfall = Math.max(0, requiredCash - availableCash);

  return (
    <NotebookModalWrapper
      zIndexClass="z-[80]"
      maxWidthClass="max-w-md"
      compact
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="arms-trade-budget-title"
        className="overflow-hidden"
      >
        <header className="flex items-center justify-between border-b border-amber-500/20 bg-root-canvas px-5 py-4">
          <div className="flex items-center gap-3 text-amber-300">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <h2 id="arms-trade-budget-title" className="text-sm font-black uppercase tracking-wide">
              Kas Mitra Tidak Mencukupi
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup informasi kas mitra"
            className="rounded-lg p-1.5 text-root-subtle transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="space-y-3 p-5 text-sm">
          <p className="text-[#A7C4C4]">
            Mitra belum memiliki anggaran yang cukup untuk membeli alutsista ini. Transaksi tidak dilakukan.
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-root-canvas p-3">
            <span className="text-root-subtle">Kas mitra tersedia</span>
            <strong className="text-right text-root-text">{formatCash(availableCash)}</strong>
            <span className="text-root-subtle">Nilai transaksi</span>
            <strong className="text-right text-root-text">{formatCash(requiredCash)}</strong>
            <span className="text-amber-300">Kekurangan</span>
            <strong className="text-right text-amber-300">{formatCash(shortfall)}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-root-canvas transition hover:bg-amber-300"
          >
            Mengerti
          </button>
        </div>
      </section>
    </NotebookModalWrapper>
  );
}