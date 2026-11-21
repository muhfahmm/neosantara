"use client";
import React, { useState } from "react";
import { Landmark, ArrowUp, ArrowDown } from "lucide-react";
import PilihTenorModal from "./PilihTenorModal";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface LoanCooldowns {
  [key: number]: string;
  [key: string]: string;
}

interface LembagaDuniaProps {
  setPendingLoan: (loan: any) => void;
  loanCooldowns?: LoanCooldowns;
  currentDate?: Date;
  isLoanRestricted?: boolean;
}

interface LembagaInstitution {
  id: number;
  name: string;
  iso: string;
  interest: number;
  maxCap: number;
}

const LEMBAGA_MULTILATERAL: LembagaInstitution[] = [
  { id: 9991, name: "IMF", iso: "un", interest: 4.8, maxCap: 15_000_000 },
  { id: 9992, name: "Bank Dunia", iso: "un", interest: 3.5, maxCap: 15_000_000 },
];

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const TENOR_OPTIONS = [
  { days: 180, labelKey: "sixMonths" },
  { days: 270, labelKey: "nineMonths" },
  { days: 365, labelKey: "oneYear" },
  { days: 730, labelKey: "twoYears" },
  { days: 1095, labelKey: "threeYears" },
  { days: 1460, labelKey: "fourYears" },
  { days: 1825, labelKey: "fiveYears" },
];

export default function LembagaDunia({ setPendingLoan, loanCooldowns, currentDate, isLoanRestricted = false }: LembagaDuniaProps) {
  const { language, t } = useLanguage();
  const today = currentDate instanceof Date ? currentDate : new Date();
  const formatDate = (date: Date) => date.toLocaleDateString(language);
  const formatNumber = (value: number) => value.toLocaleString(language, { maximumFractionDigits: 0 });
  const termLabel = (days: number) => {
    const option = TENOR_OPTIONS.find((item) => item.days === days);
    return option ? t(`navigation_economy_loans.terms.options.${option.labelKey}`) : t("navigation_economy_loans.terms.shortDefault");
  };
  const institutionName = (id: number) => id === 9991
    ? t("navigation_economy_loans.institutions.imf")
    : t("navigation_economy_loans.institutions.worldBank");
  
  // 🔥 DEKLARASI STATE (Ini yang menyebabkan error "Cannot find name")
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [terms, setTerms] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [termModalTarget, setTermModalTarget] = useState<number | null>(null);
  const loanRestriction = isLoanRestricted;

  // 🔥 PERBAIKAN: Tambahkan tipe `: Record<number, string>` pada param `prev` agar TypeScript tidak error 'any'
  const handleAmountChange = (id: number, value: string) => {
    const rawValue = value.replace(/[^0-9]/g, "");
    setAmounts((prev: Record<number, string>) => ({ ...prev, [id]: rawValue }));
    setErrors((prev: Record<number, string>) => ({ ...prev, [id]: "" }));
  };

  const setQuickLoanAmount = (id: number, amount: number) => {
    setAmounts((prev: Record<number, string>) => ({ ...prev, [id]: String(amount) }));
    setErrors((prev: Record<number, string>) => ({ ...prev, [id]: "" }));
  };

  const decrementLoanAmount = (id: number, decrement: number) => {
    setAmounts((prev: Record<number, string>) => {
      const current = Number(prev[id] || 0);
      const next = Math.max(0, current - decrement);
      return { ...prev, [id]: String(next) };
    });
    setErrors((prev: Record<number, string>) => ({ ...prev, [id]: "" }));
  };

  const handleTermChange = (id: number, value: string) => {
    setTerms((prev: Record<number, string>) => ({ ...prev, [id]: value }));
    setErrors((prev: Record<number, string>) => ({ ...prev, [id]: "" }));
  };

  const handleRequestLoan = (lembaga: LembagaInstitution) => {
    const rawAmount = amounts[lembaga.id] ?? "";
    const rawTerm = terms[lembaga.id] ?? "180";
    const requestedAmount = Number(rawAmount.replace(/[^0-9]/g, ""));
    const requestedTerm = Number(rawTerm);
    const cooldownDate = loanCooldowns?.[lembaga.id];
    const cooldownEnd = cooldownDate ? addDays(new Date(cooldownDate), 90) : null;
    const isCooldownActive = cooldownEnd ? cooldownEnd > today : false;

    if (loanRestriction) {
      setErrors((prev: Record<number, string>) => ({
        ...prev,
        [lembaga.id]: t("navigation_economy_loans.institution.errors.restricted"),
      }));
      return;
    }

    if (isCooldownActive) {
      setErrors((prev: Record<number, string>) => ({ ...prev, [lembaga.id]: t("navigation_economy_loans.institution.errors.cooldown", { date: formatDate(cooldownEnd!) }) }));
      return;
    }

    if (!requestedAmount || requestedAmount <= 0) {
      setErrors((prev: Record<number, string>) => ({ ...prev, [lembaga.id]: t("navigation_economy_loans.institution.errors.invalidAmount") }));
      return;
    }

    if (requestedAmount > lembaga.maxCap) {
      setErrors((prev: Record<number, string>) => ({ ...prev, [lembaga.id]: t("navigation_economy_loans.institution.errors.maximum", { institution: institutionName(lembaga.id), amount: formatNumber(lembaga.maxCap) }) }));
      return;
    }

    if (!requestedTerm || requestedTerm < 180 || requestedTerm > 1825) {
      setErrors((prev: Record<number, string>) => ({ ...prev, [lembaga.id]: t("navigation_economy_loans.institution.errors.termRange") }));
      return;
    }

    setPendingLoan({
      ...lembaga,
      maxLoan: requestedAmount,
      term: requestedTerm,
      requestedAmount,
      requestedTerm,
      maxCap: lembaga.maxCap,
      type: "multilateral",
    });
  };

  return (
    <div className="loan-institution-list space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
      {loanRestriction && (
        <div className={`border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-300 ${rootBorderRadius.card}`}>
          {t("navigation_economy_loans.institution.restrictedBanner")}
        </div>
      )}
      {LEMBAGA_MULTILATERAL.map((lembaga) => {
        const cooldownDate = loanCooldowns?.[lembaga.id];
        const cooldownEnd = cooldownDate ? addDays(new Date(cooldownDate), 90) : null;
        const isCooldownActive = cooldownEnd ? cooldownEnd > today : false;
        const nextAvailable = cooldownEnd ? formatDate(cooldownEnd) : null;
        const selectedTerm = Number(terms[lembaga.id] ?? 180);

        return (
          <div key={lembaga.id} className={`loan-institution-card flex min-w-0 flex-col gap-4 border border-root-accent/30 bg-root-surface p-4 ${rootBorderRadius.card}`}>
            <div className="loan-institution-header flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`loan-institution-icon shrink-0 border border-root-accent/30 bg-root-canvas p-2 ${rootBorderRadius.card}`}>
                  <Landmark className="h-5 w-5 text-root-accent" />
                </div>
                <div className="min-w-0">
                  <h4 className={`loan-institution-name ${rootModalTypography.sectionTitle} break-words text-root-accent`}>{institutionName(lembaga.id)}</h4>
                  <p className="loan-institution-description mt-1 break-words text-[10px] font-medium leading-relaxed text-root-subtle">
                    {t("navigation_economy_loans.institution.interest", { percent: lembaga.interest })}
                  </p>
                </div>
              </div>
              <div className="loan-institution-status flex flex-wrap items-center gap-x-2 gap-y-1 sm:shrink-0 sm:justify-end">
                <span className={`text-xs font-bold ${isCooldownActive || loanRestriction ? "text-rose-400" : "text-emerald-400"}`}>
                  {loanRestriction
                    ? t("navigation_economy_loans.institution.blocked")
                    : isCooldownActive
                      ? t("navigation_economy_loans.institution.cooldownRemaining", { date: nextAvailable ?? "" })
                      : t("navigation_economy_loans.institution.available")}
                </span>
              </div>
            </div>

            <div className="loan-institution-fields grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
              <label className="loan-institution-field min-w-0 space-y-1.5 text-[10px] font-black uppercase tracking-wider text-root-accent">
                {t("navigation_economy_loans.institution.amount")}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={formatNumber(lembaga.maxCap)}
                    value={amounts[lembaga.id] && amounts[lembaga.id] !== "" ? formatNumber(Number(amounts[lembaga.id])) : ""}
                    onChange={(e) => handleAmountChange(lembaga.id, e.target.value)}
                    className={`loan-institution-input h-10 w-full border border-root-accent/30 bg-root-canvas px-3 pr-20 text-sm font-bold text-root-text outline-none transition focus:border-root-accent ${rootBorderRadius.card}`}
                  />
                  <div className="loan-institution-amount-controls absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => decrementLoanAmount(lembaga.id, 1_000_000)}
                      className={`loan-institution-stepper flex h-7 w-7 cursor-pointer items-center justify-center border border-root-accent/30 bg-root-surface text-root-accent transition-colors hover:bg-root-accent hover:text-root-canvas ${rootBorderRadius.card}`}
                      aria-label={t("navigation_economy_loans.institution.decreaseAmount")}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickLoanAmount(lembaga.id, 15_000_000)}
                      className={`loan-institution-stepper flex h-7 w-7 cursor-pointer items-center justify-center border border-root-accent/30 bg-root-surface text-root-accent transition-colors hover:bg-root-accent hover:text-root-canvas ${rootBorderRadius.card}`}
                      aria-label={t("navigation_economy_loans.institution.setMaximumAmount")}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </label>

              <div className="loan-institution-field min-w-0 space-y-1.5 text-[10px] font-black uppercase tracking-wider text-root-accent">
                <div className="flex items-center justify-between">
                  <span>{t("navigation_economy_loans.institution.repaymentTerm")}</span>
                  <span className="text-[10px] text-root-subtle">
                    {termLabel(selectedTerm)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTermModalTarget(lembaga.id)}
                  className={`loan-institution-term-button h-10 w-full cursor-pointer border border-root-accent/30 bg-root-canvas px-3 text-left text-sm font-bold text-root-text outline-none transition hover:border-root-accent ${rootBorderRadius.card}`}
                >
                  {termLabel(selectedTerm)} / {selectedTerm.toLocaleString(language, { maximumFractionDigits: 0 })} {t("navigation_economy_loans.dayUnit")}
                </button>
              </div>
            </div>

            {errors[lembaga.id] && (
              <div className={`loan-institution-error break-words border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-400 ${rootBorderRadius.card}`}>
                {errors[lembaga.id]}
              </div>
            )}

            <button
              onClick={() => handleRequestLoan(lembaga)}
              disabled={isCooldownActive || loanRestriction}
              className={`loan-institution-submit w-full px-5 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all ${rootBorderRadius.card} ${
                isCooldownActive || loanRestriction
                  ? "bg-root-canvas text-root-subtle border border-gray-800 cursor-not-allowed"
                  : "cursor-pointer bg-root-accent text-root-canvas hover:bg-root-accent/80 font-bold"
              }`}
            >
              {t("navigation_economy_loans.institution.submit")}
            </button>
          </div>
        );
      })}

      <PilihTenorModal
        isOpen={termModalTarget !== null}
        selectedTerm={Number(terms[termModalTarget ?? 0] ?? 180)}
        onSelectTerm={(days) => {
          if (termModalTarget === null) return;
          setTerms((prev: Record<number, string>) => ({ ...prev, [termModalTarget]: String(days) }));
          setTermModalTarget(null);
        }}
        onClose={() => setTermModalTarget(null)}
      />
    </div>
  );
}