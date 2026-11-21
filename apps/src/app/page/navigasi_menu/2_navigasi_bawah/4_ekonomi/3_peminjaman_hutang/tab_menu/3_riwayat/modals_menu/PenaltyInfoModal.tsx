"use client";
import React from "react";
import { Info } from "lucide-react";
import NotebookModalWrapper from "../../../../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { LoanRecord } from "../../utils";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanRecord | null;
}

export default function PenaltyInfoModal({ isOpen, onClose, loan }: Props) {
  const { language, t } = useLanguage();
  if (!isOpen || !loan) return null;

  const outstanding = Number(loan.totalRepayment) || 0;
  const missed = Number(loan.missedMonths || 0);
  const formatNumber = (value: number) => value.toLocaleString(language, { maximumFractionDigits: 0 });

  return (
    <NotebookModalWrapper
      onClose={onClose}
      zIndexClass="z-[80]"
      contentSized
      frameClassName="loan-modal-frame content-sized-info-frame"
    >
      <div className="flex h-full min-w-0 w-full flex-col overflow-hidden bg-root-surface font-sans">
        <RootInfoModalHeader
          title={t("navigation_economy_loans.penalties.detailTitle")}
          onClose={onClose}
          size="standard"
          icon={<Info aria-hidden="true" />}
        />

        <div className="loan-modal-content min-h-0 flex-1 overflow-y-auto bg-root-canvas/80 p-4 custom-scrollbar sm:p-5">
          <div className="loan-penalty-modal-copy loan-penalty-detail-copy space-y-3 text-sm font-semibold text-root-text">
            <section className="loan-penalty-detail-section">
              <h3 className="loan-penalty-detail-heading text-sm font-black text-root-accent">{t("navigation_economy_loans.penalties.loanData")}</h3>
              <div className="loan-penalty-detail-grid grid grid-cols-2 gap-2">
                <div className="loan-penalty-detail-item">
                  <span className="loan-penalty-detail-label">{t("navigation_economy_loans.confirmation.amount")}</span>
                  <span className="font-bold text-root-accent">{formatNumber(Number(loan.amount || 0))} NEO</span>
                </div>
                <div className="loan-penalty-detail-item">
                  <span className="loan-penalty-detail-label">{t("navigation_economy_loans.history.headers.interest")}</span>
                  <span className="font-bold text-root-accent">{Number(loan.interest || 0)}%</span>
                </div>
                <div className="loan-penalty-detail-item">
                  <span className="loan-penalty-detail-label">{t("navigation_economy_loans.history.headers.currentTotal")}</span>
                  <span className="font-bold text-root-accent">{formatNumber(outstanding)} NEO</span>
                </div>
                <div className="loan-penalty-detail-item">
                  <span className="loan-penalty-detail-label">{t("navigation_economy_loans.history.headers.paid")}</span>
                  <span className="font-bold text-emerald-400">{formatNumber(Number(loan.paidAmount) || 0)} NEO</span>
                </div>
                <div className="loan-penalty-detail-item">
                  <span className="loan-penalty-detail-label">{t("navigation_economy_loans.penalties.accumulated")}</span>
                  <span className="font-bold text-rose-400">{formatNumber(Number(loan.accumulatedPenalty) || 0)} NEO</span>
                </div>
                <div className="loan-penalty-detail-item">
                  <span className="loan-penalty-detail-label">{t("navigation_economy_loans.penalties.missed")}</span>
                  <span className="font-bold text-rose-400">{missed} {t("navigation_economy_loans.monthUnit")}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}
