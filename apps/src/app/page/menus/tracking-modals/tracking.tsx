'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Route, X } from 'lucide-react';
import { estimateTravelTime } from '../../path_logic/time_logic';
import type { DiplomacyPathKind } from '../../path_logic/diplomacy-path-animation';

const NonAggressionPactPath = dynamic(() => import('../../path_logic/path-non-aggression-pact'), { ssr: false });
const DefenseAlliancePath = dynamic(() => import('../../path_logic/path-defense-alliance'), { ssr: false });
const TradeAgreementPath = dynamic(() => import('../../path_logic/path-trade-agreement'), { ssr: false });
const ResearchContractPath = dynamic(() => import('../../path_logic/path-research-contract'), { ssr: false });
const AidDeliveryPath = dynamic(() => import('../../path_logic/path-aid-delivery'), { ssr: false });
const SpionasePath = dynamic(() => import('../../path_logic/path-spionase'), { ssr: false });
const SabotasePath = dynamic(() => import('../../path_logic/path-sabotase'), { ssr: false });
const IcbmPath = dynamic(() => import('../../path_logic/path-icbm'), { ssr: false });

const DIPLOMACY_PATH_COMPONENTS = {
  'non-aggression-pact': NonAggressionPactPath,
  'defense-alliance': DefenseAlliancePath,
  'trade-agreement': TradeAgreementPath,
  'research-contract': ResearchContractPath,
  'aid-delivery': AidDeliveryPath,
  spionase: SpionasePath,
  sabotase: SabotasePath,
  icbm: IcbmPath,
};

const PATH_DETAILS: Record<DiplomacyPathKind, { document: string; accent: string }> = {
  'non-aggression-pact': { document: 'Dokumen Diplomatik', accent: '#00FFAA' },
  'defense-alliance': { document: 'Perjanjian Pertahanan', accent: '#A78BFA' },
  'trade-agreement': { document: 'Dokumen Perdagangan', accent: '#FBBF24' },
  'research-contract': { document: 'Protokol Penelitian Bersama', accent: '#FB7185' },
  'aid-delivery': { document: 'Konvoi Bantuan Sekutu', accent: '#38BDF8' },
  spionase: { document: 'Operasi Spionase', accent: '#A3E635' },
  sabotase: { document: 'Operasi Sabotase', accent: '#F43F5E' },
  icbm: { document: 'Serangan Rudal Balistik ICBM', accent: '#EF4444' },
};

interface ActiveDiplomacyPath {
  id: string;
  kind: DiplomacyPathKind;
  senderCountry: string;
  targetCountry: string;
  progress: number;
  resourceKey?: string;
  amount?: number;
}

const normalizeCountryName = (name: unknown) => String(name || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/g, '');

export default function DiplomacyTracking() {
  const [activePaths, setActivePaths] = useState<ActiveDiplomacyPath[]>([]);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  useEffect(() => {
    const allowedKinds: DiplomacyPathKind[] = [
      'non-aggression-pact',
      'defense-alliance',
      'trade-agreement',
      'research-contract',
      'aid-delivery',
      'spionase',
      'sabotase',
      'icbm',
    ];

    const addPath = (kindValue: unknown, pathIdValue: unknown, senderValue: unknown, targetValue: unknown, resourceKey?: unknown, amount?: unknown) => {
      const kind = String(kindValue || '') as DiplomacyPathKind;
      const senderCountry = String(senderValue || '').trim();
      const targetCountry = String(targetValue || '').trim();
      if (!allowedKinds.includes(kind) || !senderCountry || !targetCountry) return;

      const id = String(pathIdValue || '').trim() ||
        `diplomacy-path-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setActivePaths(current => current.some(path => path.id === id)
        ? current
        : [...current, { id, kind, senderCountry, targetCountry, progress: 0, resourceKey: typeof resourceKey === 'string' ? resourceKey : undefined, amount: Number(amount) || undefined }]);
    };

    const handleDiplomacyPath = (event: Event) => {
      const detail = (event as CustomEvent<{
        kind?: unknown;
        pathId?: unknown;
        senderCountry?: unknown;
        targetCountry?: unknown;
        resourceKey?: unknown;
        amount?: unknown;
      }>).detail;
      addPath(detail?.kind, detail?.pathId, detail?.senderCountry, detail?.targetCountry, detail?.resourceKey, detail?.amount);
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

    window.addEventListener('neosantara_diplomacy_path', handleDiplomacyPath);
    window.addEventListener('neosantara_non_aggression_pact_path', handlePactPath);
    window.addEventListener('neosantara_cancel_diplomacy_path', handleCancelPath);
    window.addEventListener('neosantara_cancel_non_aggression_pact_path', handleCancelPath);
    return () => {
      window.removeEventListener('neosantara_diplomacy_path', handleDiplomacyPath);
      window.removeEventListener('neosantara_non_aggression_pact_path', handlePactPath);
      window.removeEventListener('neosantara_cancel_diplomacy_path', handleCancelPath);
      window.removeEventListener('neosantara_cancel_non_aggression_pact_path', handleCancelPath);
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
        const Path = DIPLOMACY_PATH_COMPONENTS[path.kind];

        return (
          <Path
            key={path.id}
            senderCountry={path.senderCountry}
            targetCountry={path.targetCountry}
            laneIndex={laneIndex}
            laneCount={sameRoute.length}
            onProgress={progress => setActivePaths(current => current.map(item =>
              item.id === path.id ? { ...item, progress } : item
            ))}
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
              setActivePaths(current => current.filter(item => item.id !== path.id));
            }}
          />
        );
      })}

      {typeof document !== 'undefined' && createPortal(
        <>
          <button
        type="button"
        onClick={() => setIsTrackingOpen(open => !open)}
        title="Pelacakan aktivitas diplomasi"
        aria-label={isTrackingOpen ? 'Tutup pelacakan aktivitas' : 'Buka pelacakan aktivitas'}
        aria-expanded={isTrackingOpen}
        className="fixed bottom-3 left-[7.25rem] z-[100] flex h-12 w-12 cursor-pointer items-center justify-center transition-transform hover:scale-110 group lg:bottom-4 lg:left-[8rem] lg:h-14 lg:w-14 xl:bottom-6 xl:left-[9rem] xl:h-16 xl:w-16 2xl:bottom-12 2xl:left-[10.5rem]"
      >
        <Image
          src="/images/game/interface/menu/diplomacy-activity.svg"
          alt=""
          aria-hidden="true"
          width={72}
          height={72}
          className="h-14 w-14 object-contain brightness-125 saturate-150 drop-shadow-[0_0_6px_rgba(0,255,170,0.55)] lg:h-16 lg:w-16 xl:h-[4.5rem] xl:w-[4.5rem]"
        />
        {activePaths.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
            {activePaths.length}
          </span>
        )}
      </button>

      {isTrackingOpen && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

            {/* HEADER */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] shrink-0">
                  <Route className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
                </div>
                <div>
                  <h2
                    id="diplomacy-tracking-title"
                    className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase"
                  >
                    Pelacakan Aktivitas
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">
                    {activePaths.length} aktivitas berlangsung
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTrackingOpen(false)}
                className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
              >
                <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A1A1A] relative z-10 custom-scrollbar flex flex-col gap-3">
              {activePaths.length === 0 && (
                <div className="rounded-xl border border-[#00FFAA]/20 bg-[#0F2424]/70 px-5 py-8 text-center text-sm font-bold text-[#B9D7D1]">
                  Tidak ada aktivitas yang sedang berlangsung.
                </div>
              )}

              {activePaths.map(path => {
                const details = PATH_DETAILS[path.kind];
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
                    className="w-full shrink-0 rounded-xl border bg-[#0F2424]/80 px-4 py-4 shadow-lg sm:px-5"
                    style={{ borderColor: `${details.accent}66` }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-wider sm:text-xs">
                      <span className="min-w-0 truncate" style={{ color: details.accent }}>{path.senderCountry}</span>
                      <span className="min-w-0 truncate text-center text-[#B9D7D1]">
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
        </div>
      )}
        </>,
        document.body
      )}
    </>
  );
}
