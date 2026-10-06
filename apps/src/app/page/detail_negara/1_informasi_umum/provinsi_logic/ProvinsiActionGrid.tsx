'use client';

import { useState } from 'react';
import type { ProvinceAction, ProvinceActionEventDetail } from './provinceActionTypes';
import { PROVINCE_ACTION_EVENT } from './provinceActionTypes';
import MissionaryResultModal from './2_tugaskan_misionaris/MissionaryResultModal';
import IdeologyResultModal from './5_tanamkan_ideologi/IdeologyResultModal';

interface MissionaryResult {
  targetCountry: string;
  actionLabel: string;
  succeeded: boolean;
  successChance: number;
  message: string;
}

interface ProvinsiActionGridProps {
  actions: ProvinceAction[];
  targetCountry: string;
  occupyingCountry: string;
  playerReligion?: string;
  targetReligion?: string;
  updateTargetReligion?: (religion: string) => void;
  playerIdeology?: string;
  targetIdeology?: string;
  updateTargetIdeology?: (ideology: string) => void;
  provinceBudget?: number;
  provinceNetBalance?: number;
  provinceTension?: number;
  playerCountryDetail?: Record<string, unknown> | null;
  taxedProvinces?: string[];
  updatePlayerCountryDetail?: (updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
  adjustPlayerNetBalance?: (delta: number) => void;
}

export default function ProvinsiActionGrid({
  actions,
  targetCountry,
  occupyingCountry,
  playerReligion,
  targetReligion,
  updateTargetReligion,
  playerIdeology,
  targetIdeology,
  updateTargetIdeology,
  provinceBudget,
  provinceNetBalance,
  playerCountryDetail,
  taxedProvinces,
  updatePlayerCountryDetail,
  adjustPlayerNetBalance,
  provinceTension = 25
}: ProvinsiActionGridProps) {
  const [selectedAction, setSelectedAction] = useState<ProvinceAction | null>(null);
  const [missionaryResult, setMissionaryResult] = useState<MissionaryResult | null>(null);
  const missionaryCompleted = Boolean(
    playerReligion?.trim() &&
    targetReligion?.trim() &&
    playerReligion.trim().toLocaleLowerCase() === targetReligion.trim().toLocaleLowerCase()
  );
  const taxAlreadyEnforced = Boolean(
    taxedProvinces?.some(country => country.toLowerCase().trim() === targetCountry.toLowerCase().trim())
  );
  const ideologyCompleted = Boolean(
    playerIdeology?.trim() &&
    targetIdeology?.trim() &&
    playerIdeology.trim().toLocaleLowerCase() === targetIdeology.trim().toLocaleLowerCase()
  );
  const aidAtMinimum = Number(provinceTension) <= 0;
  const adjustProvinceTension = (delta: number) => {
    if (!updatePlayerCountryDetail) return;
    updatePlayerCountryDetail(previous => {
      if (!previous) return previous;
      const currentTensions = previous.provinceTensions && typeof previous.provinceTensions === 'object'
        ? previous.provinceTensions as Record<string, unknown>
        : {};
      const normalizedTarget = targetCountry.toLowerCase().trim();
      const entry = Object.entries(currentTensions).find(
        ([name]) => name.toLowerCase().trim() === normalizedTarget
      );
      const currentTension = Number(entry?.[1] ?? provinceTension);
      const nextTension = Math.min(100, Math.max(0, currentTension + delta));
      return {
        ...previous,
        provinceTensions: {
          ...currentTensions,
          [targetCountry]: nextTension
        }
      };
    });
  };

  const confirmAction = () => {
    if (!selectedAction) return;
    let actionSucceeded = true;
    let actionMessage: string | undefined;
    let successChance: number | undefined;
    try {
      const result = selectedAction.onConfirm?.({
        targetCountry,
        occupyingCountry,
        playerReligion,
        updateTargetReligion,
        playerIdeology,
        targetIdeology,
        updateTargetIdeology,
        provinceBudget,
        provinceNetBalance,
        playerCountryDetail,
        taxedProvinces,
        updatePlayerCountryDetail,
        adjustPlayerNetBalance,
        provinceTension,
        adjustProvinceTension
      });
      if (typeof result === 'string' || result === undefined) {
        actionMessage = result;
      } else {
        actionSucceeded = result.succeeded;
        actionMessage = result.message;
        successChance = result.successChance;
      }
    } catch (error) {
      actionSucceeded = false;
      actionMessage = error instanceof Error ? error.message : 'Aksi provinsi gagal diproses.';
    }
    if (selectedAction.id === 'tugaskan_misionaris' || selectedAction.id === 'tanamkan_ideologi') {
      setMissionaryResult({
        targetCountry,
        actionLabel: selectedAction.id === 'tanamkan_ideologi' ? 'Ideologi' : 'Misionaris',
        succeeded: actionSucceeded,
        successChance: successChance ?? 90,
        message: actionMessage || `${selectedAction.label} ${actionSucceeded ? 'berhasil' : 'gagal'}.`
      });
    }
    const detail: ProvinceActionEventDetail = {
      actionId: selectedAction.id,
      actionLabel: selectedAction.label,
      targetCountry,
      occupyingCountry,
      actionSucceeded,
      actionMessage,
      successChance
    };
    window.dispatchEvent(new CustomEvent(PROVINCE_ACTION_EVENT, { detail }));
    setSelectedAction(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 items-stretch gap-4 pt-6">
        {actions.map(({ id, label, icon: Icon }) => {
          const missionaryActive = id === 'tugaskan_misionaris' && missionaryCompleted;
          const ideologyActive = id === 'tanamkan_ideologi' && ideologyCompleted;
          const taxActive = id === 'wajibkan_pajak' && taxAlreadyEnforced;
          const aidDisabled = id === 'kirim_bantuan' && aidAtMinimum;
          const isActive = missionaryActive || ideologyActive || taxActive || aidDisabled;
          const displayLabel = missionaryActive
            ? 'Agama Sudah Sama'
            : ideologyActive
              ? 'Ideologi Sudah Sama'
              : taxActive
                ? 'Pajak Diberlakukan'
                : aidDisabled
                  ? 'Ketegangan Minimum'
                : label;
          return (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (!isActive) setSelectedAction(actions.find(action => action.id === id) || null);
            }}
            disabled={isActive}
            className={`w-full min-w-0 h-32 rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-[#00FFAA] transition-all cursor-pointer group ${
              isActive
                ? 'border-2 border-[#00FFAA] bg-[#00FFAA]/20 hover:bg-[#00FFAA]/30'
                : 'bg-[#0A1A1A] border border-[#00FFAA]/20 hover:shadow-md hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/10'
            }`}
            aria-pressed={isActive}
            title={missionaryActive
              ? 'Agama provinsi sudah sama dengan agama negara Anda'
              : ideologyActive
                ? 'Ideologi provinsi sudah sama dengan ideologi negara Anda'
                : taxActive
                  ? 'Pajak sudah diberlakukan di provinsi ini'
                  : aidDisabled
                    ? 'Ketegangan provinsi sudah mencapai 0'
                  : undefined}
          >
            <Icon className="h-8 w-8 text-[#00FFAA] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black uppercase tracking-wider text-center leading-tight">{displayLabel}</span>
          </button>
          );
        })}
      </div>

      {selectedAction && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="province-action-title"
            className="w-full max-w-[460px] bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl p-6 shadow-2xl"
          >
            <h3 id="province-action-title" className="text-lg font-black text-[#00FFAA] mb-3">
              Konfirmasi {selectedAction.label}
            </h3>
            <p className="text-sm text-[#B7D5CD] mb-6">
              {selectedAction.description} Target: <strong>{targetCountry}</strong>.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setSelectedAction(null)}
                className="flex-1 rounded-lg border border-[#00FFAA]/30 px-4 py-2.5 text-xs font-black uppercase text-[#00FFAA] hover:bg-[#00FFAA]/10"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmAction}
                className="flex-1 rounded-lg bg-[#00FFAA] px-4 py-2.5 text-xs font-black uppercase text-[#0A1A1A] hover:bg-[#00D991]"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {missionaryResult && (missionaryResult.actionLabel === 'Ideologi'
        ? (
          <IdeologyResultModal
            targetCountry={missionaryResult.targetCountry}
            succeeded={missionaryResult.succeeded}
            successChance={missionaryResult.successChance}
            message={missionaryResult.message}
            onClose={() => setMissionaryResult(null)}
          />
        )
        : (
          <MissionaryResultModal
            targetCountry={missionaryResult.targetCountry}
            succeeded={missionaryResult.succeeded}
            successChance={missionaryResult.successChance}
            message={missionaryResult.message}
            actionLabel={missionaryResult.actionLabel}
            onClose={() => setMissionaryResult(null)}
          />
        ))}
    </>
  );
}
