'use client';

import { useState } from 'react';
import type { ProvinceAction, ProvinceActionEventDetail } from './provinceActionTypes';
import { PROVINCE_ACTION_EVENT } from './provinceActionTypes';

interface ProvinsiActionGridProps {
  actions: ProvinceAction[];
  targetCountry: string;
  occupyingCountry: string;
}

export default function ProvinsiActionGrid({
  actions,
  targetCountry,
  occupyingCountry
}: ProvinsiActionGridProps) {
  const [selectedAction, setSelectedAction] = useState<ProvinceAction | null>(null);

  const confirmAction = () => {
    if (!selectedAction) return;
    const detail: ProvinceActionEventDetail = {
      actionId: selectedAction.id,
      actionLabel: selectedAction.label,
      targetCountry,
      occupyingCountry
    };
    window.dispatchEvent(new CustomEvent(PROVINCE_ACTION_EVENT, { detail }));
    setSelectedAction(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 items-stretch gap-4 pt-6">
        {actions.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSelectedAction(actions.find(action => action.id === id) || null)}
            className="w-full min-w-0 h-32 rounded-xl p-5 flex flex-col items-center justify-center gap-3 bg-[#0A1A1A] border border-[#00FFAA]/20 text-[#00FFAA] hover:shadow-md hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/10 transition-all cursor-pointer group"
          >
            <Icon className="h-8 w-8 text-[#00FFAA] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black uppercase tracking-wider text-center leading-tight">{label}</span>
          </button>
        ))}
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
    </>
  );
}
