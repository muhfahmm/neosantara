"use client";

import { Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface TaxPolicyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TaxPolicyInfoModal({
  isOpen,
  onClose,
}: TaxPolicyInfoModalProps) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper
      compact
      maxWidthClass="max-w-2xl"
      onClose={onClose}
      zIndexClass="z-[200]"
    >
      <div className="flex min-w-0 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="shrink-0 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] p-1 sm:p-1.5">
              <Info className="h-4 w-4 text-[#00FFAA] sm:h-5 sm:w-5" />
            </div>
            <h2 className={rootModalTypography.title}>Informasi Kebijakan Pajak</h2>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className="bg-[#0F2424] p-4 sm:p-5">
          <p className={`${rootModalTypography.body} ${rootModalTypography.muted} break-words`}>
            Sesuaikan tarif pajak nasional untuk membiayai belanja militer dan
            infrastruktur publik. Hati-hati, pajak tinggi memicu protes rakyat!
          </p>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}
