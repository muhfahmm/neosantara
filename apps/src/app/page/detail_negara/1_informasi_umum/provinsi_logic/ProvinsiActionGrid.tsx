'use client';

import { useState } from 'react';
import type { ProvinceAction, ProvinceActionEventDetail } from './provinceActionTypes';
import { PROVINCE_ACTION_EVENT } from './provinceActionTypes';
import MissionaryResultModal from './1_informasi_umum/2_tugaskan_misionaris/MissionaryResultModal';
import IdeologyResultModal from './1_informasi_umum/5_tanamkan_ideologi/IdeologyResultModal';
import ProvinceAidModal from './1_informasi_umum/4_kirim_bantuan/ProvinceAidModal';
import { applyProvinceTensionChange } from './ketegangan_provinsi';

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
  updateTargetReligion?: (religion: string) => void | Promise<void>;
  playerIdeology?: string;
  targetIdeology?: string;
  updateTargetIdeology?: (ideology: string) => void | Promise<void>;
  provinceBudget?: number;
  provinceNetBalance?: number;
  provinceTension?: number;
  currentDate?: Date;
  provinceData?: Record<string, unknown> | null;
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
  provinceTension = 25,
  currentDate,
  provinceData
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
  const adjustProvinceTension = (delta: number) => {
    if (!updatePlayerCountryDetail) return;
    applyProvinceTensionChange({
      targetCountry,
      occupyingCountry,
      currentTension: provinceTension,
      delta,
      currentDate: currentDate ?? new Date(),
      updatePlayerCountryDetail
    });
  };

  const confirmAction = async (aidCategory?: string, aidItemLabel?: string) => {
    if (!selectedAction) return;
    let actionSucceeded = true;
    let actionMessage: string | undefined;
    let successChance: number | undefined;
    try {
      const result = await selectedAction.onConfirm?.({
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
        adjustProvinceTension,
        provinceData,
        aidCategory,
        aidItemLabel
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
        successChance: successChance ?? 75,
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
          const isActive = missionaryActive || ideologyActive || taxActive;
          const displayLabel = missionaryActive
            ? 'Agama Sudah Sama'
            : ideologyActive
              ? 'Ideologi Sudah Sama'
              : taxActive
                ? 'Pajak Diberlakukan'
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
                  : undefined}
          >
            <Icon className="h-8 w-8 text-[#00FFAA] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black uppercase tracking-wider text-center leading-tight">{displayLabel}</span>
          </button>
          );
        })}
      </div>

      {selectedAction?.id === 'kirim_bantuan' && (
        <ProvinceAidModal
          targetCountry={targetCountry}
          provinceData={provinceData}
          provinceTension={provinceTension}
          onClose={() => setSelectedAction(null)}
          onConfirm={(category, itemLabel) => confirmAction(category, itemLabel)}
        />
      )}

      {selectedAction && selectedAction.id !== 'kirim_bantuan' && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="province-action-title"
            className="bg-[#0F2424] border-2 sm:border-3 border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col justify-center relative font-sans pointer-events-auto shadow-2xl p-6 sm:p-10"
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
                onClick={() => confirmAction()}
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
