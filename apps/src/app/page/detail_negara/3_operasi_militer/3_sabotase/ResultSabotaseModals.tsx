"use client";

import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import { createPortal } from "react-dom";
import { CheckCircle2, Bomb, XCircle } from "lucide-react";
import type { SabotaseOperationResult } from "./logic/sabotaseLogic";
import { SABOTASE_TARGET_OPTIONS } from "./sabotaseTargetOptions";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface ResultSabotaseModalsProps {
  result: SabotaseOperationResult | null;
  onClose: () => void;
}

export default function ResultSabotaseModals({
  result,
  onClose,
}: ResultSabotaseModalsProps) {
  const { t, language } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_defense_sabotage.${key}`, params);
  if (!result) return null;

  const ResultIcon = result.succeeded ? CheckCircle2 : XCircle;
  const resultColor = result.succeeded ? "text-root-accent" : "text-rose-400";
  const operationTargetId = SABOTASE_TARGET_OPTIONS.find(
    option => option.label === result.operationTarget,
  )?.id;
  const normalizedTarget = result.operationTarget?.toLowerCase() || '';
  const isInfrastructureTarget = operationTargetId === 'infrastruktur_energi' ||
    /listrik|energi|infrastruktur/.test(normalizedTarget);
  const isFoodProductionTarget = operationTargetId === 'rantai_pasok' ||
    /pangan|sembako|rantai_pasok/.test(normalizedTarget);
  const isManufacturingTarget = operationTargetId === 'manufaktur' ||
    /manufaktur/.test(normalizedTarget);
  const lossCategory = isFoodProductionTarget
    ? 'Food'
    : isManufacturingTarget
      ? 'Manufacturing'
      : isInfrastructureTarget
        ? 'Energy'
        : 'Military';
  const operationTarget = result.operationTarget
    ? ` (${operationTargetId
      ? tr(`confirmation.targets.${operationTargetId}.label`)
      : result.operationTarget})`
    : '';
  const lossLabels: Record<string, string> = {
    'lossTitleMilitary': tr('result.lossTitleMilitary'),
    'lossTitleEnergy': tr('result.lossTitleEnergy'),
    'lossTitleFood': tr('result.lossTitleFood'),
    'lossTitleManufacturing': tr('result.lossTitleManufacturing'),
    'lossDescriptionMilitary': tr('result.lossDescriptionMilitary'),
    'lossDescriptionEnergy': tr('result.lossDescriptionEnergy'),
    'lossDescriptionFood': tr('result.lossDescriptionFood'),
    'lossDescriptionManufacturing': tr('result.lossDescriptionManufacturing'),
  };
  const formatNumber = (value: number) =>
    value.toLocaleString(language, { maximumFractionDigits: 0 });
  const translateLossUnit = (unitKey: string) => {
    const militaryKey = `navigation_defense_attack.units.${unitKey}`;
    const militaryLabel = t(militaryKey);
    if (militaryLabel !== militaryKey) return militaryLabel;
    if (isInfrastructureTarget && unitKey.startsWith('pembangkit_listrik_')) {
      const plantKey = `navigation_electricity_grid.plantDescriptions.${unitKey}`;
      const plantLabel = t(plantKey);
      if (plantLabel !== plantKey) return plantLabel;
    }
    if (isInfrastructureTarget && ['litium', 'logam_tanah_jarang', 'bijih_besi'].includes(unitKey)) {
      const mineralKey = `side_inbox.dynamicNotifications.sabotage.infrastructureItems.${unitKey}`;
      const mineralLabel = t(mineralKey);
      if (mineralLabel !== mineralKey) return mineralLabel;
    }
    return unitKey.replace(/_/g, ' ');
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sabotase-result-title"
    >
      <div className="modal-responsive-shell overflow-y-auto rounded-2xl border border-rose-500/30 bg-root-surface text-white shadow-2xl">
        <RootInfoModalHeader
          title={tr('result.title')}
          titleId="sabotase-result-header-title"
          onClose={onClose}
          icon={<Bomb className="text-rose-400" />}
          size="standard"
        />

        <div className="space-y-4 p-6 text-center">
          <ResultIcon className={`mx-auto h-14 w-14 ${resultColor}`} />
          <div>
            <h3
              id="sabotase-result-title"
              className={`text-xl font-black uppercase tracking-wide ${resultColor}`}
            >
              {result.succeeded ? tr('result.success') : tr('result.failure')}
            </h3>
            <p className="mt-2 text-sm text-root-text">
              {tr(result.succeeded ? 'result.successMessage' : 'result.failureMessage', {
                operationTarget,
                target: result.targetCountry,
              })}
            </p>
          </div>

          {result.succeeded && result.losses && result.losses.length > 0 && (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-root-canvas p-4 text-left">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-rose-500/20">
                <Bomb className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                  {lossLabels[`lossTitle${lossCategory}`]}
                </span>
              </div>
              <p className="text-[11px] text-root-subtle mb-3 leading-relaxed">
                {lossLabels[`lossDescription${lossCategory}`]}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                {result.losses.map((loss) => (
                  <div
                    key={loss.unitKey}
                    className="flex items-center justify-between p-2 rounded-lg bg-root-surface border border-root-accent/10 text-xs"
                  >
                    <span className="font-semibold text-root-text capitalize truncate pr-2">
                      {translateLossUnit(loss.unitKey)}
                    </span>
                    <span className="font-mono font-bold text-rose-400 shrink-0">
                      -{formatNumber(loss.lostQuantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs font-semibold text-root-subtle">
            {tr('result.successChance')}{" "}
            <span className="font-black text-rose-400">{result.successChance}%</span>
          </p>
        </div>

        <div className="border-t border-rose-500/20 bg-root-canvas p-4">
          <SharedModalCloseButton
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-colors"
            appearance="custom"
          >
            {tr('result.close')}
          </SharedModalCloseButton>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
