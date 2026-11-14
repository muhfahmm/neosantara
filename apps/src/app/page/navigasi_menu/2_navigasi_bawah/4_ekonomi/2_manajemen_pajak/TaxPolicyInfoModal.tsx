"use client";

import { Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
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
      onClose={onClose}
      zIndexClass="z-[200]"
    >
      <div className="flex min-w-0 flex-col overflow-hidden">
        <RootInfoModalHeader
          title="Informasi Kebijakan Pajak"
          onClose={onClose}
          size="standard"
          icon={<Info aria-hidden="true" />}
        />

        <div className="bg-root-surface p-4 sm:p-5">
          <p className={`${rootModalTypography.body} ${rootModalTypography.muted} break-words`}>
            Sesuaikan tarif pajak nasional untuk membiayai belanja militer dan
            infrastruktur publik. Hati-hati, pajak tinggi memicu protes rakyat!
          </p>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}