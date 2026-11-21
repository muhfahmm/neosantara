"use client";

import React, { useState } from "react";
import RootConfirmModal from "@/app/page/root_modals_design_menu/RootConfirmModal";
import { UserPlus, Bomb, Plus, Minus } from "lucide-react";
import { RECRUIT_COST_PER_PERSON } from "../covertPersonnelStorage";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface RekrutPenyabotModalProps {
  isOpen: boolean;
  currentPersonnelCount: number;
  currentBudget?: number;
  onClose: () => void;
  onConfirm: (count: number, totalCost: number) => void;
}

export default function RekrutPenyabotModal({
  isOpen,
  currentPersonnelCount,
  currentBudget = 0,
  onClose,
  onConfirm,
}: RekrutPenyabotModalProps) {
  const { t, language } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_defense_sabotage.${key}`, params);
  const [count, setCount] = useState<number>(1);

  if (!isOpen) return null;

  const totalCost = count * RECRUIT_COST_PER_PERSON;
  const hasBudget = currentBudget >= totalCost;
  const maxPossible = Math.max(1, Math.floor(currentBudget / RECRUIT_COST_PER_PERSON));

  const handleIncrement = (delta: number) => {
    setCount(prev => Math.max(1, prev + delta));
  };

  const handleSetMax = () => {
    if (maxPossible > 0) {
      setCount(maxPossible);
    }
  };

  return (
    <RootConfirmModal
      isOpen={isOpen}
      title={tr('recruit.title')}
      icon={<UserPlus className="w-5 h-5 text-rose-400" />}
      onClose={onClose}
      onConfirm={() => {
        if (hasBudget && count > 0) {
          onConfirm(count, totalCost);
        }
      }}
      confirmLabel={hasBudget ? tr('recruit.confirm', { count }) : tr('recruit.insufficientFunds')}
      confirmDisabled={!hasBudget || count <= 0}
      confirmButtonClassName="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-500 text-white cursor-pointer"
      footerBorderClassName="border-rose-500/20"
    >
      <div className="flex flex-col gap-4 font-sans text-white">
        {/* Info Ringkasan Status */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-root-canvas border border-rose-500/20 rounded-xl text-xs">
          <div>
            <span className="text-root-subtle block mb-0.5">{tr('recruit.personnelNow')}</span>
            <span className="font-bold text-rose-400 flex items-center gap-1.5">
              <Bomb className="w-3.5 h-3.5" />
              {currentPersonnelCount} {tr('recruit.person')}
            </span>
          </div>
          <div>
            <span className="text-root-subtle block mb-0.5">{tr('recruit.costPerPerson')}</span>
            <span className="font-bold text-white">{RECRUIT_COST_PER_PERSON.toLocaleString(language)} NEO</span>
          </div>
        </div>

        {/* Counter Pemilihan Jumlah */}
        <div className="flex flex-col gap-2 p-4 bg-root-canvas border border-rose-500/30 rounded-xl">
          <div className="flex items-center justify-between text-xs font-bold text-root-subtle">
            <span>{tr('recruit.count')}</span>
            <button
              type="button"
              onClick={handleSetMax}
              className="text-[10px] text-rose-400 uppercase tracking-wider underline hover:text-rose-300 cursor-pointer"
            >
              {tr('recruit.maximum', { count: maxPossible })}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleIncrement(-1)}
              disabled={count <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-root-surface border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="number"
              min={1}
              value={count}
              aria-label={tr('recruit.count')}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (Number.isNaN(val) || val < 1) setCount(1);
                else setCount(val);
              }}
              className="flex-1 h-10 bg-root-surface border border-rose-500/30 rounded-lg text-center font-black text-rose-400 text-lg focus:outline-none focus:border-rose-400"
            />

            <button
              type="button"
              onClick={() => handleIncrement(1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-root-surface border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Preset buttons */}
          <div className="flex gap-2 pt-1">
            {[1, 5, 10, 25].map(step => (
              <button
                key={step}
                type="button"
                onClick={() => setCount(step)}
                className={`flex-1 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                  count === step
                    ? "bg-rose-600 text-white border-rose-500"
                    : "bg-root-surface text-root-subtle border-rose-500/20 hover:text-white"
                }`}
              >
                +{step}
              </button>
            ))}
          </div>
        </div>

        {/* Biaya dan Saldo */}
        <div className="p-3 bg-root-canvas border border-rose-500/20 rounded-xl space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-root-subtle">{tr('recruit.totalCost')}</span>
            <span className="font-bold text-rose-400 text-sm">
              {totalCost.toLocaleString(language)} NEO
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-root-subtle">{tr('recruit.availableBalance')}</span>
            <span className={hasBudget ? "text-root-text font-bold" : "text-rose-400 font-bold"}>
              {currentBudget.toLocaleString(language, { maximumFractionDigits: 0 })} NEO
            </span>
          </div>
        </div>
      </div>
    </RootConfirmModal>
  );
}
