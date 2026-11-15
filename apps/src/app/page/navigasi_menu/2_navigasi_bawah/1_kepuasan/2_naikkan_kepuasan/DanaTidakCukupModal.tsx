"use client";

import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { AlertCircle } from "lucide-react";
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
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[100000001]">
      <div className="root-modal-util-52b6b298fe">
        <header className="satisfaction-modal-header root-modal-util-4450f1d9ee">
          <div className="satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar">
            <div className="root-modal-util-08dfbca033">
              <div className="root-modal-util-acd42b9a36 !border-rose-500/30 !bg-rose-500/10">
                <AlertCircle className="root-modal-util-ea2c28151c !text-root-danger" />
              </div>
              <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                <span className="text-root-danger">Dana Tidak Mencukupi</span>
              </h2>
            </div>
          </div>
          <div className="root-modal-util-08dfbca033">
            <RootModalCloseButton
              type="button"
              onClick={onClose}
              ariaLabel="Tutup modal dana tidak mencukupi"
            />
          </div>
        </header>

        <div className="root-modal-util-64d21c5606 relative z-10">
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
      </div>
    </NotebookModalWrapper>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}