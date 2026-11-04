export interface LoanRecord {
  id: number | string;
  source: string;
  iso: string | null;
  amount: number;
  interest: number;
  term?: number;
  type?: "bilateral" | "multilateral";
  status?: "Aktif" | "Lunas";
  totalRepayment: number;
  paidAmount: number;
  accumulatedPenalty: number;
  missedMonths?: number;
  date?: string;
  returnDate: string;
}

export const renderFlag = (iso: string | undefined | null, altName: string) => {
  if (!iso || iso.length !== 2) {
    return (
      <div className="w-8 h-5 rounded-sm bg-root-canvas border border-root-accent/30 flex-shrink-0" />
    );
  }

  return (
    <div className="w-8 h-5 rounded-sm overflow-hidden border border-root-accent/30 flex-shrink-0 bg-root-canvas relative">
      <img
        src={`https://flagcdn.com/w80/${iso.toLowerCase()}.png`}
        alt={altName}
        className="w-full h-full object-cover absolute inset-0"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
};