"use client";
import React, { type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface NegaraLainProps {
  loanSources: Array<{
    id?: number | string;
    name: string;
    iso?: string | null;
    interest: number;
    maxLoan: number;
    term: number;
  }>;
  renderFlag: (iso: string | undefined | null, altName: string) => ReactNode;
  setPendingLoan: (loan: any) => void;
  searchQuery: string;
}

export default function NegaraLain({ loanSources, renderFlag, setPendingLoan, searchQuery }: NegaraLainProps) {
  const filteredCountries = loanSources.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-w-0">
      {filteredCountries.length === 0 ? (
        <div className={`border border-root-accent/20 bg-root-surface px-4 py-8 text-center ${rootBorderRadius.card}`}>
          <p className={`${rootModalTypography.body} ${rootModalTypography.muted}`}>
            Tidak ada negara yang cocok dengan pencarian.
          </p>
        </div>
      ) : (
      <div className="loan-country-grid grid max-h-[450px] min-w-0 grid-cols-4 gap-1.5 overflow-y-auto pr-1 custom-scrollbar">
        {filteredCountries.map((negara) => (
          <div key={negara.id ?? negara.name} className={`loan-country-card flex min-w-0 flex-col border border-root-accent/30 bg-root-surface p-2 transition-colors duration-300 hover:border-root-accent/60 ${rootBorderRadius.card}`}>
            <div className="loan-country-card-header mb-2 flex min-w-0 flex-col items-start gap-1.5">
              <div className="flex min-w-0 w-full items-center gap-1.5">
                {renderFlag(negara.iso, negara.name)}
                <span className="min-w-0 break-words text-[10px] font-black leading-tight text-root-accent">{negara.name}</span>
              </div>
              <span className={`shrink-0 border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-black text-rose-400 ${rootBorderRadius.card}`}>{negara.interest}%</span>
            </div>
            <div className="loan-country-card-details min-w-0 flex-1 space-y-1.5 text-[9px] font-bold text-root-subtle">
              <p className="flex min-w-0 flex-col gap-0.5"><span>Plafon</span><span className="break-words font-black text-root-text">{negara.maxLoan.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span></p>
              <p className="flex min-w-0 flex-col gap-0.5"><span>Masa Tenggang</span><span className="font-black text-root-accent">{negara.term} Hari</span></p>
            </div>
            <button
              onClick={() => setPendingLoan(negara)}
              className={`loan-country-card-action mt-2 flex w-full cursor-pointer items-center justify-center gap-1 bg-root-accent px-1 py-1.5 text-[9px] font-black uppercase leading-tight tracking-wide text-root-canvas transition-all hover:bg-root-accent/80 active:scale-[0.99] ${rootBorderRadius.card}`}
            >
              <span>Pinjam</span>
              <ArrowRight className="h-3 w-3 shrink-0" />
            </button>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}