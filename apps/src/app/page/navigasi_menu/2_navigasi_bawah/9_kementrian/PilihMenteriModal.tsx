"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Award, Banknote, Check } from "lucide-react";
import NotebookModalWrapper from "../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";

export interface MinisterCandidateDepartment {
  id: string;
  name: string;
  effectLabel: string;
  effectDirection: 1 | -1;
  icon: React.ElementType;
}

export const MINISTER_CANDIDATES = [
  { tier: 1, effect: 5, cost: 500 },
  { tier: 2, effect: 10, cost: 1500 },
  { tier: 3, effect: 15, cost: 3000 },
  { tier: 4, effect: 20, cost: 5000 },
  { tier: 5, effect: 50, cost: 10000 },
] as const;

interface Props {
  department: MinisterCandidateDepartment;
  availableNetIncome: number;
  hiredTier: number;
  onClose: () => void;
  onHire: (tier: number, cost: number) => void;
}

export default function PilihMenteriModal({
  department,
  availableNetIncome,
  hiredTier,
  onClose,
  onHire,
}: Props) {
  const Icon = department.icon;
  const activeCandidate = MINISTER_CANDIDATES.find(candidate => candidate.tier === hiredTier);
  const [insufficientFunds, setInsufficientFunds] = React.useState<number | null>(null);

  const handleHire = (tier: number, cost: number) => {
    if (availableNetIncome < cost) {
      setInsufficientFunds(cost);
      return;
    }
    setInsufficientFunds(null);
    onHire(tier, cost);
  };

  return createPortal(
    <NotebookModalWrapper onClose={onClose}>
      <div className="root-modal-util-b74379da23">
        <RootInfoModalHeader
          title="Kandidat Menteri"
          icon={<Icon aria-hidden="true" />}
          onClose={onClose}
          closeAriaLabel="Tutup kandidat menteri"
          size="standard"
        />

        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-root-surface p-3 sm:p-4 lg:p-5 neon-scrollbar">
          {insufficientFunds !== null && (
            <div role="alert" className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300">
              Netto harian negara tidak cukup. Kandidat ini membutuhkan {insufficientFunds.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO dari netto.
            </div>
          )}

          {activeCandidate && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
              <Check className="h-4 w-4" />
              Kandidat {activeCandidate.tier} sudah menjabat dengan peningkatan {activeCandidate.effect}%.
            </div>
          )}

          <div className="flex min-w-0 flex-col gap-2.5">
            {MINISTER_CANDIDATES.map(candidate => {
              const isHired = hiredTier === candidate.tier;
              const insufficientCash = availableNetIncome < candidate.cost;
              const signedEffect = `${department.effectDirection > 0 ? "+" : "-"}${candidate.effect}%`;

              return (
                <article
                  key={candidate.tier}
                  className={`flex min-w-0 flex-col overflow-hidden rounded-xl border bg-root-canvas p-3 md:grid md:min-h-[68px] md:grid-cols-[100px_minmax(0,1fr)_135px_150px] md:items-center md:gap-[25px] xl:grid-cols-[128px_minmax(180px,1fr)_168px_200px] ${
                    isHired
                      ? "border-emerald-400/60"
                      : "border-root-accent/20"
                  }`}
                >
                  <div className="mb-2 flex min-w-0 items-center justify-between whitespace-nowrap lg:mb-0">
                    <span className="flex items-center gap-1.5 text-xs font-black text-root-text xl:text-sm">
                      <Award className="h-4 w-4 shrink-0 text-root-accent" />
                      Menteri {candidate.tier}
                    </span>
                    {isHired && <span className="ml-2 text-[9px] font-black uppercase text-emerald-300">Menjabat</span>}
                  </div>
                  <p className="mb-2 min-w-0 truncate text-[11px] font-bold text-root-accent lg:mb-0 xl:text-xs">
                    {signedEffect} {department.effectLabel}
                  </p>
                  <div className="mb-2 flex min-w-0 items-center justify-between whitespace-nowrap border-t border-root-accent/10 pt-2 text-[10px] lg:mb-0 lg:border-l lg:border-t-0 lg:px-2 lg:pt-0">
                    <span className="font-semibold text-root-subtle">Biaya rekrutmen</span>
                    <span className="ml-1.5 text-[11px] font-black text-root-text xl:text-xs">{candidate.cost.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
                  </div>
                  <button
                    type="button"
                    disabled={isHired}
                    onClick={() => handleHire(candidate.tier, candidate.cost)}
                    className={`w-full whitespace-nowrap rounded-lg px-3 py-2.5 text-[11px] font-black uppercase leading-tight transition-colors ${
                      isHired
                        ? "cursor-default bg-emerald-500/20 text-emerald-300"
                        : insufficientCash
                          ? "cursor-pointer border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                          : "bg-root-accent text-root-canvas hover:bg-root-accent/80"
                    }`}
                  >
                    {isHired
                      ? "Sedang Menjabat"
                      : hiredTier > 0
                        ? "Ganti Menteri"
                        : insufficientCash
                          ? "Netto Tidak Cukup"
                          : "Rekrut Menteri"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </NotebookModalWrapper>,
    document.body
  );
}