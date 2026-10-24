"use client";

import { AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";

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

  const modalContent = (
    <div className="fixed inset-0 z-[100000001] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
      <div className="w-full max-w-2xl min-h-[450px] flex flex-col bg-[#0F2424] border border-rose-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(244,63,94,0.15)] relative pointer-events-auto">
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-black text-rose-400 tracking-wide uppercase mb-6 border-b border-rose-500/20 pb-4">
            Dana Tidak Mencukupi
          </h3>

          <div className="rounded-2xl border border-rose-500/30 bg-[#0A1A1A]/60 p-5 text-center">
            <div className="mb-3 flex justify-center">
              <div className="rounded-full border border-rose-500/20 bg-rose-500/10 p-3 text-rose-400">
                <AlertCircle size={32} />
              </div>
            </div>
            <h4 className="mb-2 text-lg font-black uppercase tracking-wide text-[#E0E0E0]">
              {actionName} gagal!
            </h4>
            <p className="mb-4 text-sm font-semibold leading-relaxed text-[#6B8A8A]">
              Kas negara tidak mencukupi untuk melaksanakan aksi ini.
            </p>

            <div className="space-y-2 rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4 text-left text-xs text-[#E0E0E0]">
              <div className="flex justify-between gap-4">
                <span className="font-bold text-[#6B8A8A]">Dana dibutuhkan:</span>
                <span className="font-black text-rose-400">{requiredCost.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-bold text-[#6B8A8A]">Kas tersedia:</span>
                <span className="font-black text-[#00FFAA]">{currentBudget.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
              </div>
              <div className="mt-1 flex justify-between gap-4 border-t border-[#00FFAA]/20 pt-2">
                <span className="font-bold text-[#6B8A8A]">Kekurangan dana:</span>
                <span className="font-black text-rose-400">- {shortage.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-rose-500/20 pt-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto cursor-pointer rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] px-6 py-2 text-center text-[11px] font-black uppercase tracking-widest text-[#E0E0E0] transition-all duration-150 hover:bg-[#142A2A] sm:text-xs"
          >
            Mengerti
          </button>
          {onTakeLoan && (
            <button
              onClick={onTakeLoan}
              className="w-full sm:w-auto cursor-pointer rounded-xl border border-[#00FFAA] bg-[#00FFAA] px-6 py-2 text-center text-[11px] font-black uppercase tracking-widest text-[#0A1A1A] shadow transition-all duration-150 hover:bg-[#00e699] sm:text-xs"
            >
              Ambil Pinjaman
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}