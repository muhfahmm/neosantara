import { LoanRecord } from "../utils";
import { calculateDelayedInterestAmountForBilateralLoan } from "./loanInterestRiseNegara";
import { calculateDelayedInterestAmountForMultilateralLoan } from "./loanInterestRiseWorldBank";
import { roundNeo } from "@/app/logic/economic_logic/neoCurrency";

interface ProcessDueLoansResult {
  nextLoanList: LoanRecord[];
  availableCash: number;
  updatedTotalHutang: number;
  updated: boolean;
}

const parseIdDate = (dateString: string) => {
  const parts = String(dateString).split("/").map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return new Date(dateString);
  }
  const [day, month, year] = parts;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const formatIdDate = (date: Date) => {
  return date.toLocaleDateString("id-ID");
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const processDueLoans = (
  loans: LoanRecord[],
  currentDate: Date,
  availableCash: number
): ProcessDueLoansResult => {
  const dueDate = new Date(currentDate);
  dueDate.setHours(0, 0, 0, 0);

  let updated = false;
  availableCash = roundNeo(availableCash);

  const nextLoanList = loans.map((entry) => {
    if (!entry?.returnDate) return entry;

    const entryDueDate = parseIdDate(entry.returnDate);
    entryDueDate.setHours(0, 0, 0, 0);

    if (entryDueDate > dueDate) return entry;

    let {
      totalRepayment,
      paidAmount = 0,
      amount,
      interest,
      missedMonths = 0,
      accumulatedPenalty = 0,
      status = "Aktif",
    } = entry;

    totalRepayment = roundNeo(totalRepayment);
    paidAmount = roundNeo(paidAmount);
    amount = roundNeo(amount);
    interest = Number(interest) || 0;

    if (totalRepayment <= 0) return entry;

    const payment = Math.min(availableCash, totalRepayment);
    updated = true;

    if (payment > 0) {
      availableCash -= payment;
      totalRepayment -= payment;
      paidAmount += payment;
    }

    if (totalRepayment > 0) {
      missedMonths += 1;
      const penaltyAmount = roundNeo(entry.type === "multilateral"
        ? calculateDelayedInterestAmountForMultilateralLoan(totalRepayment, missedMonths)
        : calculateDelayedInterestAmountForBilateralLoan(totalRepayment, missedMonths));

      totalRepayment += penaltyAmount;
      accumulatedPenalty = roundNeo(accumulatedPenalty) + penaltyAmount;

      // 🔥 PERBAIKAN: Tambahkan 'as const' agar TypeScript tidak menganggapnya sebagai 'string' biasa
      return {
        ...entry,
        status: "Aktif" as const,
        totalRepayment,
        paidAmount,
        accumulatedPenalty,
        missedMonths,
        returnDate: formatIdDate(addDays(dueDate, 30)),
      };
    }

    // 🔥 PERBAIKAN: Tambahkan 'as const' pada status Lunas
    return {
      ...entry,
      status: "Lunas" as const,
      totalRepayment: 0,
      paidAmount,
      accumulatedPenalty,
    };
  });

  const finalTotalHutang = nextLoanList
    .filter((loan) => loan.status === "Aktif")
    .reduce((sum, loan) => sum + roundNeo(loan.totalRepayment), 0);

  return {
    nextLoanList,
    availableCash,
    updatedTotalHutang: Math.max(0, finalTotalHutang),
    updated,
  };
};