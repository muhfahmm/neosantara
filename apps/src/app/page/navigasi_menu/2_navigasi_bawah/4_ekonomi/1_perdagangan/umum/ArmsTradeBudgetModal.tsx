"use client";

import { AlertTriangle } from "lucide-react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface ArmsTradeBudgetModalProps {
  availableCash: number;
  requiredCash: number;
  onClose: () => void;
}

const formatCash = (value: number, locale: string) =>
  `${Math.max(0, value).toLocaleString(locale, { maximumFractionDigits: 2 })} NEO`;

export default function ArmsTradeBudgetModal({
  availableCash,
  requiredCash,
  onClose,
}: ArmsTradeBudgetModalProps) {
  const { language, t } = useLanguage();
  const shortfall = Math.max(0, requiredCash - availableCash);

  return (
    <NotebookModalWrapper
      zIndexClass="z-[80]"
      compact
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="arms-trade-budget-title"
        className="overflow-hidden"
      >
        <RootInfoModalHeader
          title={t("navigation_economy_trade.transaction.budgetUnavailableTitle")}
          titleId="arms-trade-budget-title"
          onClose={onClose}
          size="standard"
          icon={<AlertTriangle aria-hidden="true" />}
        />
        <div className="space-y-3 p-4 text-sm sm:p-5">
          <p className="text-[#A7C4C4]">
            {t("navigation_economy_trade.transaction.budgetUnavailableDescription")}
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-root-canvas p-3">
            <span className="text-root-subtle">{t("navigation_economy_trade.transaction.availablePartnerCash")}</span>
            <strong className="text-right text-root-text">{formatCash(availableCash, language)}</strong>
            <span className="text-root-subtle">{t("navigation_economy_trade.transaction.transactionValue")}</span>
            <strong className="text-right text-root-text">{formatCash(requiredCash, language)}</strong>
            <span className="text-amber-300">{t("navigation_economy_trade.transaction.shortfall")}</span>
            <strong className="text-right text-amber-300">{formatCash(shortfall, language)}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-root-canvas transition hover:bg-amber-300"
          >
            {t("navigation_economy_trade.transaction.understand")}
          </button>
        </div>
      </section>
    </NotebookModalWrapper>
  );
}