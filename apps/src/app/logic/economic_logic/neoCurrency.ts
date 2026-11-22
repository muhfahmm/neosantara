export const roundNeo = (amount: unknown): number => {
  if (amount === null || amount === undefined) return 0;

  const numericAmount =
    typeof amount === "number"
      ? amount
      : typeof amount === "string" && amount.trim() !== ""
        ? Number(amount)
        : Number.NaN;
  if (!Number.isFinite(numericAmount)) {
    throw new TypeError("Nilai NEO harus berupa angka yang valid.");
  }
  return Math.round(numericAmount);
};

export function formatNeo(amount: unknown, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(roundNeo(amount));
}

const LOAN_CURRENCY_FIELDS = [
  "amount",
  "totalRepayment",
  "paidAmount",
  "accumulatedPenalty",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeCountryFinancialState<T extends Record<string, unknown> | null | undefined>(
  detail: T,
): T {
  if (detail === null || detail === undefined) return detail;
  if (!isRecord(detail)) {
    throw new TypeError("Data keuangan negara harus berupa objek.");
  }

  const normalized: Record<string, unknown> = { ...detail };
  for (const key of ["anggaran", "kas_negara", "kas", "totalHutang"]) {
    if (key in normalized) normalized[key] = roundNeo(normalized[key]);
  }
  if (Array.isArray(normalized.pinjamanList)) {
    normalized.pinjamanList = normalized.pinjamanList.map((loan: unknown) => {
      if (!isRecord(loan)) return loan;
      const normalizedLoan = { ...loan };
      for (const key of LOAN_CURRENCY_FIELDS) {
        if (key in normalizedLoan) normalizedLoan[key] = roundNeo(normalizedLoan[key]);
      }
      return normalizedLoan;
    });
  }
  return normalized as T;
}
