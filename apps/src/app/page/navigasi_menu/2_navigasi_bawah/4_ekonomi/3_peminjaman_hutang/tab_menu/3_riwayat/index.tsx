"use client";
import RootTable from "@/app/page/root_modals_design_menu/RootTable";
import React, { useState } from "react";
import { getLocalizedLoanSourceName, getLoanSourceFlagIso, renderFlag, LoanRecord } from "../utils";
import { Info } from "lucide-react";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface RiwayatProps {
  loanHistory: LoanRecord[];
  setPendingPaymentLoan: (loan: LoanRecord) => void;
  setPenaltyInfoLoan?: (loan: LoanRecord | null) => void;
  setGeneralPenaltyOpen?: (v: boolean) => void;
}

export default function Riwayat({ loanHistory, setPendingPaymentLoan, setPenaltyInfoLoan, setGeneralPenaltyOpen }: RiwayatProps) {
  const { language, t } = useLanguage();
  const [historySubTab, setHistorySubTab] = useState<"active" | "paid">("active");
  const activeLoans = loanHistory.filter((loan) => loan.status !== "Lunas");
  const paidLoans = loanHistory.filter((loan) => loan.status === "Lunas");

  // 🔥 FUNGSI UNTUK MENGUBAH FORMAT TANGGAL 1/1/2026 MENJADI 1 Jan 2026
  const formatReturnDate = (dateString: string) => {
    if (!dateString) return "-";
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;

    const day = Number(parts[0]);
    const monthIndex = parseInt(parts[1], 10);
    const year = Number(parts[2]);
    if (!day || monthIndex < 1 || monthIndex > 12 || !year) return dateString;
    return new Date(year, monthIndex - 1, day).toLocaleDateString(language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const sourceName = (source: string) => getLocalizedLoanSourceName(
    source,
    language,
    t("navigation_economy_loans.institutions.imf"),
    t("navigation_economy_loans.institutions.worldBank")
  );
  const formatNumber = (value: number) => value.toLocaleString(language, { maximumFractionDigits: 0 });

  return (
    <div>
      <RootModalTabs
        className="loan-history-tabs mb-3 w-2/3 xl:w-2/5 [&>button]:min-w-0 [&>button]:flex-1"
        items={[
          { label: t("navigation_economy_loans.history.active", { count: activeLoans.length }), isActive: historySubTab === "active", onClick: () => setHistorySubTab("active") },
          { label: t("navigation_economy_loans.history.paid", { count: paidLoans.length }), isActive: historySubTab === "paid", onClick: () => setHistorySubTab("paid") },
        ]}
      />

      <div className={`loan-history-table-scroll overflow-x-auto border border-root-accent/30 bg-root-surface ${rootBorderRadius.card}`}>
        <RootTable className="loan-history-table w-full min-w-[720px] table-fixed text-xs">
          <thead className="bg-root-canvas border-b border-root-accent/30 sticky top-0 z-10">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-black text-root-accent uppercase tracking-wider">{t("navigation_economy_loans.history.headers.source")}</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-black text-root-accent uppercase tracking-wider">{t("navigation_economy_loans.history.headers.principal")}</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-black text-root-accent uppercase tracking-wider">{t("navigation_economy_loans.history.headers.interest")}</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-black text-emerald-400 uppercase tracking-wider">{t("navigation_economy_loans.history.headers.paid")}</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-black text-rose-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>{t("navigation_economy_loans.history.headers.penalty")}</span>
                  <button
                    onClick={() => setGeneralPenaltyOpen?.(true)}
                    className="p-1 rounded-full bg-root-surface border border-root-accent/30 text-root-accent hover:bg-root-accent hover:text-root-canvas transition-all cursor-pointer"
                    title={t("navigation_economy_loans.penalties.generalTitle")}
                    aria-label={t("navigation_economy_loans.penalties.generalTitle")}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-black text-root-accent uppercase tracking-wider">{t("navigation_economy_loans.history.headers.currentTotal")}</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-black text-root-accent uppercase tracking-wider">{t("navigation_economy_loans.history.headers.dueDate")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-root-accent/10">
            {historySubTab === "active" ? (
              activeLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm font-bold text-root-subtle">
                    {t("navigation_economy_loans.history.emptyActive")}
                  </td>
                </tr>
              ) : (
                activeLoans.map((pinjam) => (
                  <tr
                    key={pinjam.id}
                    onClick={() => setPendingPaymentLoan(pinjam)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setPendingPaymentLoan(pinjam);
                      }
                    }}
                    tabIndex={0}
                    aria-label={t("navigation_economy_loans.history.paymentAria", { source: sourceName(pinjam.source) })}
                    className="cursor-pointer hover:bg-root-canvas/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-root-accent transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-root-text">
                      <div className="flex min-w-0 items-center gap-2">
                        {renderFlag(getLoanSourceFlagIso(pinjam.source, pinjam.iso, pinjam.type), sourceName(pinjam.source))}
                        <span className="min-w-0 truncate" title={sourceName(pinjam.source)}>{sourceName(pinjam.source)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-root-text">{formatNumber(pinjam.amount || 0)} NEO</td>
                    <td className="px-4 py-3 font-bold text-rose-400">{pinjam.interest}%</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">+{formatNumber(pinjam.paidAmount || 0)} NEO</td>
                    <td className="px-4 py-3 font-bold text-rose-400 flex items-center gap-3">
                      <span>+{formatNumber(pinjam.accumulatedPenalty || 0)} NEO</span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setPenaltyInfoLoan?.(pinjam);
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                        className="p-1 rounded-full bg-root-canvas border border-root-accent/30 text-root-accent hover:bg-root-accent hover:text-root-canvas transition-all cursor-pointer"
                        title={t("navigation_economy_loans.penalties.detailTitle")}
                        aria-label={t("navigation_economy_loans.penalties.detailTitle")}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3 font-bold text-root-accent">{formatNumber(pinjam.totalRepayment || 0)} NEO</td>
                    <td className="px-4 py-3 font-bold text-root-text">
                      {formatReturnDate(pinjam.returnDate)}
                    </td>

                  </tr>
                ))
              )
            ) : paidLoans.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm font-bold text-root-subtle">
                  {t("navigation_economy_loans.history.emptyPaid")}
                </td>
              </tr>
            ) : (
              paidLoans.map((pinjam) => (
                <tr key={pinjam.id} className="bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                  <td className="px-4 py-3 font-bold text-root-text">
                    <div className="flex min-w-0 items-center gap-2">
                      {renderFlag(getLoanSourceFlagIso(pinjam.source, pinjam.iso, pinjam.type), sourceName(pinjam.source))}
                      <span className="min-w-0 truncate" title={sourceName(pinjam.source)}>{sourceName(pinjam.source)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-root-text">{formatNumber(pinjam.amount || 0)} NEO</td>
                  <td className="px-4 py-3 font-bold text-root-text">{pinjam.interest}%</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">+{formatNumber(pinjam.paidAmount || 0)} NEO</td>
                  <td className="px-4 py-3 font-bold text-root-text">+{formatNumber(pinjam.accumulatedPenalty || 0)} NEO</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">{formatNumber(pinjam.totalRepayment || 0)} NEO</td>

                  <td className="px-4 py-3 font-bold text-root-text">
                    {formatReturnDate(pinjam.returnDate)}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </RootTable>
      </div>
    </div>
  );
}