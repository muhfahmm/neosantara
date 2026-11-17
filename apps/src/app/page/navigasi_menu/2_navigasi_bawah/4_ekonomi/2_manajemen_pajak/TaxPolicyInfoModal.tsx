"use client";

import { Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";

interface TaxPolicyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  satisfaction: number;
}

export default function TaxPolicyInfoModal({
  isOpen,
  onClose,
  satisfaction,
}: TaxPolicyInfoModalProps) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper
      compact
      onClose={onClose}
      zIndexClass="z-[200]"
      contentSized
      frameClassName="content-sized-info-frame"
    >
      <div className="flex min-w-0 flex-col overflow-hidden">
        <RootInfoModalHeader
          title="Informasi Kebijakan Pajak"
          onClose={onClose}
          size="standard"
          icon={<Info aria-hidden="true" />}
        />

        <div className="space-y-4 bg-root-surface p-4 sm:p-5">
          <p className={`${rootModalTypography.body} ${rootModalTypography.muted} break-words`}>
            Sesuaikan tarif pajak nasional untuk membiayai belanja militer dan
            infrastruktur publik. Hati-hati, pajak tinggi memicu protes rakyat!
          </p>
          <div className={`root-satisfaction-index tax-policy-satisfaction-card p-5 ${rootBorderRadius.card} border border-root-accent/30 bg-root-surface`}>
            <div className="flex items-center justify-between gap-3">
              <span className="root-satisfaction-index-title font-black uppercase tracking-widest text-root-text">
                Indeks Kepuasan Rakyat (Pajak)
              </span>
              <span className="root-satisfaction-index-value shrink-0 font-black text-amber-400">
                {satisfaction} / 100
              </span>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full border border-root-accent/20 bg-root-canvas">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-200"
                style={{ width: `${satisfaction}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}