"use client"
import React from "react";
import { CreditCard } from "lucide-react";
import { getLocalizedLoanSourceName, getLoanSourceFlagIso, renderFlag } from "../../utils";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface BayarHutangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loanSource: string;
  paymentAmount: number;
  currentMoney: number;
  iso?: string | null;
}

export default function BayarHutangModal({
  isOpen,
  onClose,
  onConfirm,
  loanSource,
  paymentAmount,
  currentMoney,
  iso,
}: BayarHutangModalProps) {
  const { language, t } = useLanguage();
  if (!isOpen) return null;

  const isFundsSufficient = currentMoney >= paymentAmount;
  const displaySource = getLocalizedLoanSourceName(
    loanSource,
    language,
    t("navigation_economy_loans.institutions.imf"),
    t("navigation_economy_loans.institutions.worldBank")
  );
  const formatNumber = (value: number) => value.toLocaleString(language, { maximumFractionDigits: 0 });

  const handlePayClick = () => {
    if (isFundsSufficient) {
      onConfirm();
    } else {
      // 🔥 Ganti dengan alert browser sederhana karena file modal terpisah telah dihapus
      alert(t("navigation_economy_loans.payment.insufficientAlert"));
    }
  };

  return (
    <div className="loan-payment-confirmation-overlay fixed inset-0 z-[70] flex items-center justify-center bg-transparent pointer-events-none">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="loan-payment-confirmation-title"
        className={`modal-responsive-shell loan-payment-confirmation-shell bg-root-surface border border-root-accent/30 ${rootBorderRadius.frame} overflow-hidden relative font-sans pointer-events-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col`}
      >
        <RootInfoModalHeader
          title={t("navigation_economy_loans.payment.title")}
          titleId="loan-payment-confirmation-title"
          onClose={onClose}
          size="standard"
          icon={<CreditCard aria-hidden="true" />}
        />

        <div className="loan-payment-confirmation-content flex min-h-0 flex-1 flex-col items-center justify-start overflow-hidden px-5 py-5 text-center sm:px-8 sm:py-7">
          <div className="loan-payment-confirmation-summary mb-2 flex max-w-sm flex-col items-center text-sm font-medium leading-relaxed text-root-text">
            <span className="mb-1">
              {t("navigation_economy_loans.payment.amountDue", { amount: formatNumber(paymentAmount) })} NEO
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 font-black text-root-accent">
              <span className="text-root-subtle font-normal">{t("navigation_economy_loans.payment.sourceLabel")}</span>
              {renderFlag(getLoanSourceFlagIso(loanSource, iso), displaySource)}
              <span>{displaySource}</span>
            </div>
          </div>

          <div className="loan-payment-confirmation-balance mt-2 text-xs font-bold text-root-subtle flex flex-col items-center gap-1">
            <span>{t("navigation_economy_loans.confirmation.cashBalance")}</span>
            <span className={`text-base font-black ${isFundsSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatNumber(currentMoney)} NEO
            </span>
            {!isFundsSufficient && (
              <span className="loan-payment-confirmation-warning text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full mt-1">
                {t("navigation_economy_loans.payment.insufficient")}
              </span>
            )}
          </div>
        </div>

        <div className="loan-payment-confirmation-actions flex shrink-0 gap-3 border-t border-root-accent/20 bg-root-canvas/60 px-4 py-4 sm:px-6">
          <button
            onClick={onClose}
            className={`flex-1 border border-root-accent/30 bg-root-canvas px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-root-subtle transition-all hover:text-root-text cursor-pointer sm:py-3 sm:text-xs ${rootBorderRadius.card}`}
          >
            {t("navigation_economy_loans.confirmation.cancel")}
          </button>
          <button
            onClick={handlePayClick}
            className={`flex-1 bg-root-accent px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-root-canvas transition-all hover:bg-root-accent/80 active:scale-95 cursor-pointer sm:py-3 sm:text-xs ${rootBorderRadius.card}`}
          >
            {t("navigation_economy_loans.payment.payNow")}
          </button>
        </div>
      </div>
    </div>
  );
}