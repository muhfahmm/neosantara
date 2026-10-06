"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Award, Banknote, Check, X } from "lucide-react";

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
    if (hiredTier > 0) return;
    if (availableNetIncome < cost) {
      setInsufficientFunds(cost);
      return;
    }
    setInsufficientFunds(null);
    onHire(tier, cost);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none"
    >
      <div
        className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl"
      >
        <header className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#00FFAA]/10">
              <Icon className="h-5 w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide text-[#E0E0E0]">
                Kandidat Menteri
              </h2>
              <p className="text-[10px] font-semibold text-[#6B8A8A]">{department.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#0F2424] p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-3">
            <p className="text-xs font-semibold text-[#A0B0B0]">
              Pilih satu kandidat untuk meningkatkan efek {department.effectLabel}.
            </p>
            <p className="flex items-center gap-1.5 text-xs font-bold text-[#00FFAA]">
              <Banknote className="h-4 w-4" />
              Netto harian: {availableNetIncome.toLocaleString("id-ID")} NEO
            </p>
          </div>

          {insufficientFunds !== null && (
            <div role="alert" className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300">
              Netto harian negara tidak cukup. Kandidat ini membutuhkan {insufficientFunds.toLocaleString("id-ID")} NEO dari netto.
            </div>
          )}

          {activeCandidate && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
              <Check className="h-4 w-4" />
              Kandidat {activeCandidate.tier} sudah menjabat dengan peningkatan {activeCandidate.effect}%.
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MINISTER_CANDIDATES.map(candidate => {
              const isHired = hiredTier === candidate.tier;
              const insufficientCash = availableNetIncome < candidate.cost;
              const signedEffect = `${department.effectDirection > 0 ? "+" : "-"}${candidate.effect}%`;

              return (
                <article
                  key={candidate.tier}
                  className={`flex flex-col rounded-xl border bg-[#0A1A1A] p-4 ${
                    isHired
                      ? "border-emerald-400/60 shadow-lg shadow-emerald-500/10"
                      : "border-[#00FFAA]/20"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-black text-[#E0E0E0]">
                      <Award className="h-4 w-4 text-[#00FFAA]" />
                      Menteri {candidate.tier}
                    </span>
                    {isHired && <span className="text-[9px] font-black uppercase text-emerald-300">Menjabat</span>}
                  </div>
                  <p className="mb-4 flex-1 text-xs font-bold text-[#00FFAA]">
                    {signedEffect} {department.effectLabel}
                  </p>
                  <div className="mb-3 flex items-center justify-between border-t border-[#00FFAA]/10 pt-3 text-[11px]">
                    <span className="font-semibold text-[#6B8A8A]">Biaya rekrutmen</span>
                    <span className="font-black text-[#E0E0E0]">{candidate.cost.toLocaleString("id-ID")} NEO</span>
                  </div>
                  <button
                    type="button"
                    disabled={hiredTier > 0}
                    onClick={() => handleHire(candidate.tier, candidate.cost)}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-black uppercase transition-colors ${
                      isHired
                        ? "cursor-default bg-emerald-500/20 text-emerald-300"
                        : insufficientCash
                          ? "cursor-pointer border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                          : "bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80"
                    }`}
                  >
                    {isHired ? "Sedang Menjabat" : hiredTier > 0 ? "Posisi Terisi" : insufficientCash ? "Netto Tidak Cukup" : "Rekrut Menteri"}
                  </button>
                  {!isHired && !hiredTier && insufficientCash && (
                    <span className="mt-2 text-center text-[10px] font-semibold text-rose-300">
                      Klik untuk melihat pemberitahuan biaya
                    </span>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
