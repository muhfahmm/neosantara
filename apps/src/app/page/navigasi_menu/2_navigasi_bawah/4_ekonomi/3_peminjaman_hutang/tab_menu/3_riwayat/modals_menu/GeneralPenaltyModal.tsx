"use client";
import React from "react";
import { Info } from "lucide-react";
import NotebookModalWrapper from "../../../../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GeneralPenaltyModal({ isOpen, onClose }: Props) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[80]" frameClassName="loan-modal-frame">
      <div className="flex h-full min-w-0 w-full flex-col overflow-hidden bg-root-surface font-sans">
        <RootInfoModalHeader
          title={t("navigation_economy_loans.penalties.generalTitle")}
          onClose={onClose}
          size="standard"
          icon={<Info aria-hidden="true" />}
        />

        <div className="loan-modal-content min-h-0 flex-1 overflow-y-auto bg-root-canvas/80 p-4 custom-scrollbar sm:p-5">
          <div className="loan-penalty-modal-copy space-y-3 text-sm font-semibold leading-relaxed text-root-text">
            <p>{t("navigation_economy_loans.penalties.general.paragraphOne")}</p>
            <p>{t("navigation_economy_loans.penalties.general.paragraphTwo")}</p>
            <p>{t("navigation_economy_loans.penalties.general.paragraphThree")}</p>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}
