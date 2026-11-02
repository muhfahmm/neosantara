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
        <div className={`border border-[#00FFAA]/20 bg-[#0F2424] px-4 py-8 text-center ${rootBorderRadius.card}`}>
          <p className={`${rootModalTypography.body} ${rootModalTypography.muted}`}>
            Tidak ada negara yang cocok dengan pencarian.
          </p>
        </div>
      ) : (
      <div className="grid max-h-[450px] min-w-0 grid-cols-1 gap-3 overflow-y-auto pr-2 custom-scrollbar md:grid-cols-2">
        {filteredCountries.map((negara) => (
          <div key={negara.id ?? negara.name} className={`min-w-0 border border-[#00FFAA]/30 bg-[#0F2424] p-4 transition-colors duration-300 hover:border-[#00FFAA]/60 ${rootBorderRadius.card}`}>
            <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {renderFlag(negara.iso, negara.name)}
                <span className="break-words text-sm font-black text-[#00FFAA]">{negara.name}</span>
              </div>
              <span className={`shrink-0 border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs font-black text-rose-400 ${rootBorderRadius.card}`}>{negara.interest}%</span>
            </div>
            <div className="space-y-2 text-[10px] font-bold text-[#6B8A8A]">
              <p className="flex flex-wrap justify-between gap-x-3 gap-y-1"><span>Plafon Pinjaman</span><span className="font-black text-[#E0E0E0]">{negara.maxLoan.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span></p>
              <p className="flex flex-wrap justify-between gap-x-3 gap-y-1"><span>Masa Tenggang</span><span className="font-black text-[#00FFAA]">{negara.term} Hari</span></p>
            </div>
            <button
              onClick={() => setPendingLoan(negara)}
              className={`mt-4 flex w-full cursor-pointer items-center justify-center gap-2 bg-[#00FFAA] px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#0A1A1A] transition-all hover:bg-[#00FFAA]/80 active:scale-[0.99] ${rootBorderRadius.card}`}
            >
              <span>Pinjam Dana</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
