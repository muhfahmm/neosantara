"use client";

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import { AlertCircle, X } from "lucide-react";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
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
    <NotebookModalWrapper compact zIndexClass="z-[100000001]">
      <div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-rose-500/20 pb-4">
            <h3 className="text-xl sm:text-2xl font-black text-rose-400 tracking-wide uppercase">
              Dana Tidak Mencukupi
            </h3>
            <SharedModalCloseButton
              type="button"
              onClick={onClose}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-rose-500/30 bg-root-surface px-3 py-2 text-xs font-bold uppercase text-rose-400 transition-colors hover:border-rose-500"
             appearance="custom">
              <span className="font-semibold tracking-wider">Tutup</span>
              <X className="h-4 w-4" />
            </SharedModalCloseButton>
          </div>

          <div className="rounded-2xl border border-rose-500/30 bg-root-canvas/60 p-5 text-center">
            <div className="mb-3 flex justify-center">
              <div className="rounded-full border border-rose-500/20 bg-rose-500/10 p-3 text-rose-400">
                <AlertCircle size={32} />
              </div>
            </div>
            <h4 className="mb-2 text-lg font-black uppercase tracking-wide text-root-text">
              {actionName} gagal!
            </h4>
            <p className="mb-4 text-sm font-semibold leading-relaxed text-root-subtle">
              Kas negara tidak mencukupi untuk melaksanakan aksi ini.
            </p>

            <div className="space-y-2 rounded-xl border border-root-accent/20 bg-root-canvas p-4 text-left text-xs text-root-text">
              <div className="flex justify-between gap-4">
                <span className="font-bold text-root-subtle">Dana dibutuhkan:</span>
                <span className="font-black text-rose-400">{requiredCost.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-bold text-root-subtle">Kas tersedia:</span>
                <span className="font-black text-root-accent">{currentBudget.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
              </div>
              <div className="mt-1 flex justify-between gap-4 border-t border-root-accent/20 pt-2">
                <span className="font-bold text-root-subtle">Kekurangan dana:</span>
                <span className="font-black text-rose-400">- {shortage.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
              </div>
            </div>
          </div>
        </div>

        {onTakeLoan && (
          <div className="mt-6 flex justify-end gap-3 border-t border-rose-500/20 pt-4">
            <button
              onClick={onTakeLoan}
              className="w-full sm:w-auto cursor-pointer rounded-xl border border-root-accent bg-root-accent px-6 py-2 text-center text-[11px] font-black uppercase tracking-widest text-root-canvas shadow transition-all duration-150 hover:bg-[#00e699] sm:text-xs"
            >
              Ambil Pinjaman
            </button>
          </div>
        )}
      </div>
    </NotebookModalWrapper>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}