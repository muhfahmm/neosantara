"use client";

import { Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface LoanInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoanInfoModal({ isOpen, onClose }: LoanInfoModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper
      onClose={onClose}
      zIndexClass="z-[200]"
      contentSized
      frameClassName="loan-modal-frame content-sized-info-frame"
    >
      <div className="flex h-full min-w-0 w-full flex-col overflow-hidden bg-root-surface font-sans">
        <RootInfoModalHeader
          title={t("navigation_economy_loans.info.title")}
          onClose={onClose}
          size="standard"
          icon={<Info aria-hidden="true" />}
        />

        <div className="loan-modal-content min-h-0 flex-1 overflow-y-auto space-y-3 bg-root-surface p-4 sm:p-5 custom-scrollbar">
          <p className={`${rootModalTypography.body} ${rootModalTypography.muted} break-words`}>
            {t("navigation_economy_loans.info.paragraphOne")}
          </p>
          <p className={`${rootModalTypography.body} ${rootModalTypography.muted} break-words`}>
            {t("navigation_economy_loans.info.paragraphTwo")}
          </p>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}