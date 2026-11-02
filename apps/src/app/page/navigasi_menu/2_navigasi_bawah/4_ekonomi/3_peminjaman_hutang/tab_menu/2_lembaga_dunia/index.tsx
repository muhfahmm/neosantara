"use client";
import React, { useState } from "react";
import { Landmark, ArrowUp, ArrowDown } from "lucide-react";
import PilihTenorModal from "./PilihTenorModal";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

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
  flag: string | null;
  interest: number;
  maxCap: number;
}

const LEMBAGA_MULTILATERAL: LembagaInstitution[] = [
  { id: 9991, name: "IMF (Dana Moneter Internasional)", flag: null, interest: 4.8, maxCap: 15_000_000 },
  { id: 9992, name: "Bank Dunia (World Bank)", flag: "🏦", interest: 3.5, maxCap: 15_000_000 },
];

const formatIdDate = (date: Date) => date.toLocaleDateString("id-ID");

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const TENOR_OPTIONS = [
  { label: "6 bulan", days: 180 },
  { label: "9 bulan", days: 270 },
  { label: "1 tahun", days: 365 },
  { label: "2 tahun", days: 730 },
  { label: "3 tahun", days: 1095 },
  { label: "4 tahun", days: 1460 },
  { label: "5y", days: 1825 },
];

export default function LembagaDunia({ setPendingLoan, loanCooldowns, currentDate, isLoanRestricted = false }: LembagaDuniaProps) {
  const today = currentDate instanceof Date ? currentDate : new Date();
  
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
        [lembaga.id]: "Pinjaman IMF dan Bank Dunia tidak tersedia bagi negara Komunis dengan rata-rata nasionalisasi di atas 50%.",
      }));
      return;
    }

    if (isCooldownActive) {
      setErrors((prev: Record<number, string>) => ({ ...prev, [lembaga.id]: `Cooldown 90 hari: bisa pinjam lagi setelah ${formatIdDate(cooldownEnd!)}.` }));
      return;
    }

    if (!requestedAmount || requestedAmount <= 0) {
      setErrors((prev: Record<number, string>) => ({ ...prev, [lembaga.id]: "Masukkan jumlah pinjaman yang valid." }));
      return;
    }

    if (requestedAmount > lembaga.maxCap) {
      setErrors((prev: Record<number, string>) => ({ ...prev, [lembaga.id]: `Maksimal pinjaman untuk ${lembaga.name} adalah ${lembaga.maxCap.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO.` }));
      return;
    }

    if (!requestedTerm || requestedTerm < 180 || requestedTerm > 1825) {
      setErrors((prev: Record<number, string>) => ({ ...prev, [lembaga.id]: "Pilih tenor antara 180 dan 1825 hari." }));
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
    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
      {loanRestriction && (
        <div className={`border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-300 ${rootBorderRadius.card}`}>
          Pinjaman IMF dan Bank Dunia diblokir: ideologi Komunis dengan rata-rata nasionalisasi sektor di atas 50%.
        </div>
      )}
      {LEMBAGA_MULTILATERAL.map((lembaga) => {
        const cooldownDate = loanCooldowns?.[lembaga.id];
        const cooldownEnd = cooldownDate ? addDays(new Date(cooldownDate), 90) : null;
        const isCooldownActive = cooldownEnd ? cooldownEnd > today : false;
        const nextAvailable = cooldownEnd ? formatIdDate(cooldownEnd) : null;

        return (
          <div key={lembaga.id} className={`flex min-w-0 flex-col gap-4 border border-[#00FFAA]/30 bg-[#0F2424] p-4 ${rootBorderRadius.card}`}>
            <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`shrink-0 border border-[#00FFAA]/30 bg-[#0A1A1A] p-2 ${rootBorderRadius.card}`}>
                  <Landmark className="h-5 w-5 text-[#00FFAA]" />
                </div>
                <div className="min-w-0">
                  <h4 className={`${rootModalTypography.sectionTitle} break-words text-[#00FFAA]`}>{lembaga.name}</h4>
                  <p className="mt-1 break-words text-[10px] font-medium leading-relaxed text-[#6B8A8A]">
                    Bunga {lembaga.interest}% <span aria-hidden="true">·</span> Maks {lembaga.maxCap.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO <span aria-hidden="true">·</span> Tenor 180–1825 hari
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:shrink-0 sm:justify-end">
                <span className={`${rootModalTypography.label}`}>Cooldown</span>
                <span className={`text-xs font-bold ${isCooldownActive || loanRestriction ? "text-rose-400" : "text-emerald-400"}`}>
                  {loanRestriction
                    ? "Pengajuan diblokir"
                    : isCooldownActive
                      ? `Tersisa sampai ${nextAvailable}`
                      : "Bisa pinjam sekarang"}
                </span>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
              <label className="min-w-0 space-y-1.5 text-[10px] font-black uppercase tracking-wider text-[#00FFAA]">
                Jumlah Pinjaman
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={lembaga.maxCap.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                    value={amounts[lembaga.id] && amounts[lembaga.id] !== "" ? Number(amounts[lembaga.id]).toLocaleString('id-ID', { maximumFractionDigits: 2 }) : ""}
                    onChange={(e) => handleAmountChange(lembaga.id, e.target.value)}
                    className={`h-10 w-full border border-[#00FFAA]/30 bg-[#0A1A1A] px-3 pr-20 text-sm font-bold text-[#E0E0E0] outline-none transition focus:border-[#00FFAA] ${rootBorderRadius.card}`}
                  />
                  <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => decrementLoanAmount(lembaga.id, 1_000_000)}
                      className={`flex h-7 w-7 cursor-pointer items-center justify-center border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] transition-colors hover:bg-[#00FFAA] hover:text-[#0A1A1A] ${rootBorderRadius.card}`}
                      aria-label="Kurangi 1 juta"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickLoanAmount(lembaga.id, 15_000_000)}
                      className={`flex h-7 w-7 cursor-pointer items-center justify-center border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] transition-colors hover:bg-[#00FFAA] hover:text-[#0A1A1A] ${rootBorderRadius.card}`}
                      aria-label="Setel 15 juta"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </label>

              <div className="min-w-0 space-y-1.5 text-[10px] font-black uppercase tracking-wider text-[#00FFAA]">
                <div className="flex items-center justify-between">
                  <span>Tenor Pengembalian</span>
                  <span className="text-[10px] text-[#6B8A8A]">
                    {TENOR_OPTIONS.find((option) => option.days === Number(terms[lembaga.id] ?? 180))?.label ?? "6m"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTermModalTarget(lembaga.id)}
                  className={`h-10 w-full cursor-pointer border border-[#00FFAA]/30 bg-[#0A1A1A] px-3 text-left text-sm font-bold text-[#E0E0E0] outline-none transition hover:border-[#00FFAA] ${rootBorderRadius.card}`}
                >
                  {TENOR_OPTIONS.find((option) => option.days === Number(terms[lembaga.id] ?? 180))?.label ?? "6m"} / {Number(terms[lembaga.id] ?? 180).toLocaleString("id-ID", { maximumFractionDigits: 2 })} hari
                </button>
              </div>
            </div>

            {errors[lembaga.id] && (
              <div className={`break-words border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-400 ${rootBorderRadius.card}`}>
                {errors[lembaga.id]}
              </div>
            )}

            <button
              onClick={() => handleRequestLoan(lembaga)}
              disabled={isCooldownActive || loanRestriction}
              className={`w-full px-5 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all ${rootBorderRadius.card} ${
                isCooldownActive || loanRestriction
                  ? "bg-[#0A1A1A] text-[#6B8A8A] border border-gray-800 cursor-not-allowed"
                  : "cursor-pointer bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 font-bold"
              }`}
            >
              Ajukan Kredit
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