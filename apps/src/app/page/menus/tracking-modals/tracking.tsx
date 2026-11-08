'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ComponentType } from 'react';
import Image from 'next/image';
import { Route } from 'lucide-react';
import PausedMenuFrame from '@/app/page/root_modals_design_menu/rootFrameMenu';
import RootModalCloseButton from '@/app/page/root_modals_design_menu/RootModalCloseButton';
import { useViewportMode } from '@/app/hooks/useViewportMode';
import { estimateTravelTime } from '../../path_logic/time_logic';
import {
  type DiplomacyPathKind,
  type DiplomacyPathMetadata,
  type DiplomacyPathProps,
} from '../../path_logic/diplomasi/diplomacy-path-animation';
import NonAggressionPactPath, { PATH_METADATA as nonAggressionPactMetadata } from '../../path_logic/diplomasi/path-non-aggression-pact';
import DefenseAlliancePath, { PATH_METADATA as defenseAllianceMetadata } from '../../path_logic/diplomasi/path-defense-alliance';
import TradeAgreementPath, { PATH_METADATA as tradeAgreementMetadata } from '../../path_logic/diplomasi/path-trade-agreement';
import ResearchContractPath, { PATH_METADATA as researchContractMetadata } from '../../path_logic/diplomasi/path-research-contract';
import AidDeliveryPath, { PATH_METADATA as aidDeliveryMetadata } from '../../path_logic/path-aid-delivery';
import SpionasePath, { PATH_METADATA as spionaseMetadata } from '../../path_logic/path-spionase';
import SabotasePath, { PATH_METADATA as sabotaseMetadata } from '../../path_logic/path-sabotase';
import IcbmPath, { PATH_METADATA as icbmMetadata } from '../../path_logic/path-icbm';
import SerangNegaraPath, { PATH_METADATA as serangNegaraMetadata } from '../../path_logic/path-serang-negara';

const PATH_REGISTRY: Record<DiplomacyPathKind, {
  Component: ComponentType<DiplomacyPathProps>;
  metadata: DiplomacyPathMetadata;
}> = {
  'non-aggression-pact': { Component: NonAggressionPactPath, metadata: nonAggressionPactMetadata },
  'defense-alliance': { Component: DefenseAlliancePath, metadata: defenseAllianceMetadata },
  'trade-agreement': { Component: TradeAgreementPath, metadata: tradeAgreementMetadata },
  'research-contract': { Component: ResearchContractPath, metadata: researchContractMetadata },
  'aid-delivery': { Component: AidDeliveryPath, metadata: aidDeliveryMetadata },
  spionase: { Component: SpionasePath, metadata: spionaseMetadata },
  sabotase: { Component: SabotasePath, metadata: sabotaseMetadata },
  icbm: { Component: IcbmPath, metadata: icbmMetadata },
  'serang-negara': { Component: SerangNegaraPath, metadata: serangNegaraMetadata },
};

interface ActiveDiplomacyPath {
  id: string;
  kind: DiplomacyPathKind;
  senderCountry: string;
  targetCountry: string;
  progress: number;
  resourceKey?: string;
  amount?: number;
  isPlayerAttacker?: boolean;
}

interface DiplomacyTrackingProps {
  onOpen?: () => void;
  isUiHidden?: boolean;
}

const normalizeCountryName = (name: unknown) => String(name || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/g, '');

export default function DiplomacyTracking({ onOpen, isUiHidden = false }: DiplomacyTrackingProps) {
  const [activePaths, setActivePaths] = useState<ActiveDiplomacyPath[]>([]);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const viewportMode = useViewportMode();
  const isLandscapePhone = viewportMode === 'landscapePhone';
  const isPortraitPhone = viewportMode === 'portraitPhone';
  const isMobile = isLandscapePhone || isPortraitPhone;

  useEffect(() => {
    const allowedKinds = Object.keys(PATH_REGISTRY) as DiplomacyPathKind[];

    const addPath = (
      kindValue: unknown,
      pathIdValue: unknown,
      senderValue: unknown,
      targetValue: unknown,
      resourceKey?: unknown,
      amount?: unknown,
      isPlayerAttacker?: boolean
    ) => {
      const kind = String(kindValue || '') as DiplomacyPathKind;
      const senderCountry = String(senderValue || '').trim();
      const targetCountry = String(targetValue || '').trim();
      if (!allowedKinds.includes(kind) || !senderCountry || !targetCountry) return;

      const id = String(pathIdValue || '').trim() ||
        `diplomacy-path-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setActivePaths(current => current.some(path => path.id === id)
        ? current
        : [...current, {
            id,
            kind,
            senderCountry,
            targetCountry,
            progress: 0,
            resourceKey: typeof resourceKey === 'string' ? resourceKey : undefined,
            amount: Number(amount) || undefined,
            isPlayerAttacker: isPlayerAttacker === true,
          }]);
    };

    const handleDiplomacyPath = (event: Event) => {
      const detail = (event as CustomEvent<{
        kind?: unknown;
        pathId?: unknown;
        senderCountry?: unknown;
        targetCountry?: unknown;
        resourceKey?: unknown;
        amount?: unknown;
        isPlayerAttacker?: boolean;
      }>).detail;
      addPath(
        detail?.kind,
        detail?.pathId,
        detail?.senderCountry,
        detail?.targetCountry,
        detail?.resourceKey,
        detail?.amount,
        detail?.isPlayerAttacker
      );
    };

    const handlePactPath = (event: Event) => {
      const detail = (event as CustomEvent<{
        pathId?: unknown;
        senderCountry?: unknown;
        targetCountry?: unknown;
      }>).detail;
      addPath('non-aggression-pact', detail?.pathId, detail?.senderCountry, detail?.targetCountry);
    };

    const handleCancelPath = (event: Event) => {
      const detail = (event as CustomEvent<{ targetCountry?: unknown }>).detail;
      const targetCountry = normalizeCountryName(detail?.targetCountry);
      if (!targetCountry) return;
      setActivePaths(current =>
        current.filter(path => normalizeCountryName(path.targetCountry) !== targetCountry)
      );
    };

    const handleSerangNegaraPath = (event: Event) => {
      const detail = (event as CustomEvent<{
        pathId?: unknown;
        senderCountry?: unknown;
        targetCountry?: unknown;
        isPlayerAttacker?: boolean;
      }>).detail;
      addPath('serang-negara', detail?.pathId, detail?.senderCountry, detail?.targetCountry, undefined, undefined, detail?.isPlayerAttacker);
    };

    window.addEventListener('neosantara_diplomacy_path', handleDiplomacyPath);
    window.addEventListener('neosantara_non_aggression_pact_path', handlePactPath);
    window.addEventListener('neosantara_cancel_diplomacy_path', handleCancelPath);
    window.addEventListener('neosantara_serang_negara_path', handleSerangNegaraPath);
    window.addEventListener('neosantara_cancel_non_aggression_pact_path', handleCancelPath);
    return () => {
      window.removeEventListener('neosantara_diplomacy_path', handleDiplomacyPath);
      window.removeEventListener('neosantara_non_aggression_pact_path', handlePactPath);
      window.removeEventListener('neosantara_cancel_diplomacy_path', handleCancelPath);
      window.removeEventListener('neosantara_cancel_non_aggression_pact_path', handleCancelPath);
      window.removeEventListener('neosantara_serang_negara_path', handleSerangNegaraPath);
    };
  }, []);

  return (
    <>
      {activePaths.map(path => {
        const sameRoute = activePaths.filter(candidate =>
          normalizeCountryName(candidate.senderCountry) === normalizeCountryName(path.senderCountry) &&
          normalizeCountryName(candidate.targetCountry) === normalizeCountryName(path.targetCountry)
        );
        const laneIndex = sameRoute.findIndex(candidate => candidate.id === path.id);
        const { Component: Path } = PATH_REGISTRY[path.kind];

        return (
          <Path
            key={path.id}
            senderCountry={path.senderCountry}
            targetCountry={path.targetCountry}
            laneIndex={laneIndex}
            laneCount={sameRoute.length}
            isPlayerAttacker={path.isPlayerAttacker}
            onProgress={progress => {
              if (isTrackingOpen) {
                setActivePaths(current => current.map(item =>
                  item.id === path.id ? { ...item, progress } : item
                ));
              }
            }}
            onArrive={() => {
              if (path.kind === 'aid-delivery') {
                window.dispatchEvent(new CustomEvent('neosantara_aid_arrived', { detail: path }));
              }
              if (path.kind === 'spionase' || path.kind === 'sabotase') {
                window.dispatchEvent(new CustomEvent('neosantara_covert_operation_arrived', {
                  detail: { ...path, pathId: path.id },
                }));
              }
              if (path.kind === 'icbm') {
                window.dispatchEvent(new CustomEvent('neosantara_icbm_strike_arrived', {
                  detail: { ...path, pathId: path.id },
                }));
              }
              if (path.kind === 'serang-negara') {
                window.dispatchEvent(new CustomEvent('neosantara_serang_negara_arrived', {
                  detail: { ...path, pathId: path.id },
                }));
              }
              setActivePaths(current => current.filter(item => item.id !== path.id));
            }}
          />
        );
      })}

      {typeof document !== 'undefined' && createPortal(
        <>
          {!isUiHidden && (
            <>
          <button
        type="button"
        onClick={() => {
          if (!isTrackingOpen) {
            onOpen?.();
          }
          setIsTrackingOpen(open => !open);
        }}
        title="Pelacakan aktivitas diplomasi"
        aria-label={isTrackingOpen ? 'Tutup pelacakan aktivitas' : 'Buka pelacakan aktivitas'}
        aria-expanded={isTrackingOpen}
        style={{
          bottom: isLandscapePhone ? 'calc(var(--safe-bottom) + 0.5rem)' : isPortraitPhone ? 'calc(var(--safe-bottom) + 10rem)' : undefined,
          left: isLandscapePhone ? 'calc(var(--safe-left) + 9.5rem)' : isPortraitPhone ? 'calc(var(--safe-left) + 0.5rem)' : undefined,
        }}
        className={`fixed z-[100] flex cursor-pointer items-center justify-center transition-transform hover:scale-110 active:scale-95 group ${
          isLandscapePhone
            ? 'h-11 w-11 rounded-xl border border-root-accent/40 bg-root-surface/90 shadow-lg'
            : isPortraitPhone
            ? 'h-11 w-11 rounded-xl border border-root-accent/40 bg-root-surface/90 shadow-lg'
            : 'bottom-3 left-[7.25rem] h-12 w-12 lg:bottom-4 lg:left-[8rem] lg:h-14 lg:w-14 xl:bottom-6 xl:left-[9rem] xl:h-16 xl:w-16 2xl:bottom-12 2xl:left-[10.5rem]'
        }`}
      >
        <Image
          src="/images/game/interface/menu/diplomacy-activity.svg"
          alt=""
          aria-hidden="true"
          width={72}
          height={72}
          className={`object-contain brightness-125 saturate-150 drop-shadow-[0_0_6px_rgba(0,255,170,0.55)] ${
            isLandscapePhone
              ? 'h-11 w-11'
              : isPortraitPhone
              ? 'h-11 w-11'
              : 'h-14 w-14 lg:h-16 lg:w-16 xl:h-[4.5rem] xl:w-[4.5rem]'
          }`}
        />
        {activePaths.length > 0 && (
          <span className={`absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-black text-white ${
            isLandscapePhone ? 'h-3.5 min-w-3.5 text-[8px]' : 'h-4 text-[9px]'
          }`}>
            {activePaths.length}
          </span>
        )}
      </button>

      {isTrackingOpen && (
        <PausedMenuFrame zIndexClass="z-[200]">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden font-sans">

            {/* HEADER */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 rounded-lg border border-root-accent/30 bg-root-surface shrink-0">
                  <Route className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
                </div>
                <div>
                  <h2
                    id="diplomacy-tracking-title"
                    className="text-base sm:text-xl font-bold text-root-accent tracking-tight leading-none uppercase"
                  >
                    Pelacakan Aktivitas
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-root-subtle mt-1">
                    {activePaths.length} aktivitas berlangsung
                  </p>
                </div>
              </div>
              <RootModalCloseButton onClick={() => setIsTrackingOpen(false)} />
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-root-canvas relative z-10 custom-scrollbar flex flex-col gap-3">
              {activePaths.length === 0 && (
                <div className="rounded-xl border border-root-accent/20 bg-root-surface/70 px-5 py-8 text-center text-sm font-bold text-[#B9D7D1]">
                  Tidak ada aktivitas yang sedang berlangsung.
                </div>
              )}

              {activePaths.map(path => {
                const details = PATH_REGISTRY[path.kind].metadata;
                const estimate = estimateTravelTime(path.senderCountry, path.targetCountry);
                if (!estimate) {
                  console.error('[DiplomacyTracking] No travel estimate for active route', {
                    senderCountry: path.senderCountry,
                    targetCountry: path.targetCountry,
                  });
                  return null;
                }

                return (
                  <div
                    key={path.id}
                    className="w-full shrink-0 rounded-xl border bg-root-surface/80 px-4 py-4 shadow-lg sm:px-5"
                    style={{ borderColor: `${details.accent}66` }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-wider sm:text-xs">
                      <span className="min-w-0 truncate" style={{ color: details.accent }}>{path.senderCountry}</span>
                      <span className="flex min-w-0 items-center justify-center gap-1.5 truncate text-center text-[#B9D7D1]">
                        <svg viewBox="-8 -8 16 16" aria-hidden="true" className="h-4 w-4 shrink-0">
                          <details.Icon accent={details.accent} />
                        </svg>
                        {details.document} · {estimate.days} HARI
                      </span>
                      <span className="min-w-0 truncate text-right" style={{ color: details.accent }}>{path.targetCountry}</span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-[#021010]"
                      role="progressbar"
                      aria-label={`${details.document}: ${path.senderCountry} menuju ${path.targetCountry}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(path.progress * 100)}
                    >
                      <div
                        className="h-full origin-left rounded-full transition-transform duration-100"
                        style={{
                          transform: `scaleX(${path.progress})`,
                          background: `linear-gradient(to right, ${details.accent}, #9AFF7B, ${details.accent})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PausedMenuFrame>
      )}
        </>
      )}
        </>,
        document.body
      )}
    </>
  );
}
