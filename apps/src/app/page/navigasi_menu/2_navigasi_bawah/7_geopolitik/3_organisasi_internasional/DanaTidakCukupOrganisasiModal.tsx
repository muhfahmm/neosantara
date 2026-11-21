"use client";

import { AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { useGeopoliticsMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useGeopoliticsMenuTranslation";

interface DanaTidakCukupOrganisasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCost: number;
  currentBudget: number;
}

export default function DanaTidakCukupOrganisasiModal({
  isOpen,
  onClose,
  requiredCost,
  currentBudget,
}: DanaTidakCukupOrganisasiModalProps) {
  const { organizations, language } = useGeopoliticsMenuTranslation();
  if (!isOpen || typeof document === "undefined") return null;

  const shortage = Math.max(0, requiredCost - currentBudget);
  const formatNeo = (amount: number) =>
    `${amount.toLocaleString(language, { maximumFractionDigits: 2 })} NEO`;

  return createPortal(
    <NotebookModalWrapper
      onClose={onClose}
      compact
      contentSized
      frameClassName="menu-info-content-sized-frame organization-info-content-sized-frame"
      zIndexClass="z-[260]"
      hideWhenApplicationModalOpen={false}
      hideWhenInfoModalOpen={false}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="insufficient-organization-funds-title"
        className="flex max-h-[var(--modal-max-height)] min-w-0 flex-col overflow-hidden"
      >
        <header className="flex items-center justify-between border-b border-root-accent/30 bg-root-canvas px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h2
              id="insufficient-organization-funds-title"
              className="text-sm font-black text-root-danger sm:text-base"
            >
              {organizations("insufficientFunds.title")}
            </h2>
          </div>
          <RootModalCloseButton
            onClick={onClose}
            ariaLabel={organizations("insufficientFunds.close")}
          />
        </header>

        <div className="space-y-4 bg-root-surface p-4 text-sm text-root-text sm:p-6">
          <p className="text-root-subtle">
            {organizations("insufficientFunds.description")}
          </p>
          <div className="space-y-2 rounded-xl border border-root-accent/20 bg-root-canvas p-4 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-root-subtle">{organizations("insufficientFunds.fee")}</span>
              <span className="font-black text-rose-400">{formatNeo(requiredCost)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-root-subtle">{organizations("insufficientFunds.available")}</span>
              <span className="font-black text-root-accent">{formatNeo(currentBudget)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-root-accent/20 pt-2">
              <span className="text-root-subtle">{organizations("insufficientFunds.shortage")}</span>
              <span className="font-black text-rose-400">{formatNeo(shortage)}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-root-accent/30 bg-root-canvas px-5 py-2 text-xs font-black uppercase tracking-wider text-root-subtle transition-colors hover:border-root-accent hover:text-root-accent"
            >
              {organizations("common.understand")}
            </button>
          </div>
        </div>
      </section>
    </NotebookModalWrapper>,
    document.body
  );
}
