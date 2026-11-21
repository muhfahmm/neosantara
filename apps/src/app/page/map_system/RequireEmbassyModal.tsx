'use client';

import React from 'react';
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import { Building2, ArrowRight } from 'lucide-react';
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

interface RequireEmbassyModalProps {
  isOpen: boolean;
  partnerName: string | null;
  onClose: () => void;
  onProceedToDetail: (partnerName: string) => void;
}

export function RequireEmbassyModal({
  isOpen,
  partnerName,
  onClose,
  onProceedToDetail
}: RequireEmbassyModalProps) {
  const { t } = useLanguage();
  if (!isOpen || !partnerName) return null;

  const foundCountry = COUNTRIES_DATA?.find(
    c => c.country?.toLowerCase().trim() === partnerName?.toLowerCase().trim()
  );
  const iso = foundCountry?.iso?.toLowerCase() || '';

  return (
    <NotebookModalWrapper compact zIndexClass="z-[300]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="require-embassy-title"
        className="relative w-full overflow-hidden flex flex-col font-sans pointer-events-auto"
      >
        <RootInfoModalHeader
          title={t('game.requireEmbassy.title')}
          titleId="require-embassy-title"
          onClose={onClose}
          icon={<Building2 />}
          size="compact"
          actions={
            <span className="text-[10px] font-extrabold text-root-accent uppercase tracking-wider">
              {t('game.requireEmbassy.badge')}
            </span>
          }
        />

        {/* Body Content */}
        <div className="space-y-4 relative z-10">
          {/* Flag & Country Badge */}
          <div className="bg-root-canvas border border-root-accent/30 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-7 rounded overflow-hidden border border-root-accent/30 bg-[#051111] shrink-0 shadow">
              {iso ? (
                <img
                  src={`https://flagcdn.com/w80/${iso}.png`}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-root-accent">🌐</div>
              )}
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#A0C0C0] uppercase">{t('game.requireEmbassy.proposingCountry')}</div>
              <div className="text-sm font-extrabold text-root-accent uppercase tracking-wide">{partnerName}</div>
            </div>
          </div>

          <p className="text-xs text-root-text leading-relaxed">
            {t('game.requireEmbassy.description', { country: partnerName })}
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-300 font-medium leading-normal flex items-start gap-2">
            <span className="text-base leading-none">⚠️</span>
            <span>{t('game.requireEmbassy.redirectNotice', { country: partnerName })}</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-3 mt-6 relative z-10 pt-2 border-t border-root-accent/15">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-root-accent/30 bg-root-canvas text-[#A0C0C0] hover:text-white hover:bg-root-accent/10 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer text-center"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onProceedToDetail(partnerName)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-root-accent hover:bg-root-accent/80 text-root-canvas transition-all font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.4)] flex items-center justify-center gap-1.5"
          >
            <span>{t('game.requireEmbassy.openDetail')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </NotebookModalWrapper>
  );
}