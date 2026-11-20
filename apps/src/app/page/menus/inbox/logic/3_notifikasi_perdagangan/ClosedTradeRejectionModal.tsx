'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { NotebookModalWrapper } from '@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper'; 
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getLocalizedCountryName } from '@/app/logic/countryNameLogic';

export interface ClosedTradeRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerCountry?: string;
  centralizationScore?: number;
  averageNationalization?: number;
  ideologyModifier?: number;
  religionModifier?: number;
  reasons?: string[];
}

export default function ClosedTradeRejectionModal({
  isOpen,
  onClose,
  partnerCountry,
  centralizationScore = 128.1,
  averageNationalization = 85.7,
  ideologyModifier = 1.3,
  religionModifier = 1.15,
  reasons,
}: ClosedTradeRejectionModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const partner = getLocalizedCountryName(partnerCountry || 'Mitra');
  const defaultReasons = [1, 2, 3].map(index => t(`side_inbox.dynamicNotifications.tradeModal.reason${index}`));
  const displayReasons = reasons && reasons.length > 0
    ? reasons.map(reason => reason.startsWith('side_inbox.') ? t(reason) : reason)
    : defaultReasons;

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[500000]">
      <div className="flex flex-col h-full overflow-hidden">
        
        <RootInfoModalHeader
          title={t('side_inbox.tradeModals.closedTitle')}
          onClose={onClose}
          icon={<AlertTriangle />}
          size="standard"
        />

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-root-canvas/80 relative z-10 custom-scrollbar">
          
          <div className="max-w-2xl mx-auto space-y-4">
            
            {/* ALERT BOX UTAMA */}
            <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 flex gap-3.5 items-start">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-red-300 uppercase tracking-wide">
                  {t('side_inbox.tradeModals.closedAlertTitle')}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t('side_inbox.tradeModals.closedAlertDesc', { partner })}
                </p>
              </div>
            </div>

            {/* RINCIAN STATISTIK SENTRALISASI */}
            <div className="bg-[#051111] border border-root-accent/20 rounded-xl p-4 space-y-3">
              <h5 className="text-xs font-black text-root-accent uppercase tracking-wider">
                {t('side_inbox.tradeModals.indicatorsTitle')}
              </h5>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-root-canvas/60 p-2.5 rounded-lg border border-root-accent/10">
                  <div className="text-[10px] text-slate-400 uppercase">
                    {t('side_inbox.tradeModals.scoreCentralization')}
                  </div>
                  <div className="text-sm font-black text-red-400 mt-0.5">{centralizationScore}</div>
                </div>
                <div className="bg-root-canvas/60 p-2.5 rounded-lg border border-root-accent/10">
                  <div className="text-[10px] text-slate-400 uppercase">
                    {t('side_inbox.tradeModals.nationalization')}
                  </div>
                  <div className="text-sm font-black text-amber-400 mt-0.5">{averageNationalization}%</div>
                </div>
                <div className="bg-root-canvas/60 p-2.5 rounded-lg border border-root-accent/10">
                  <div className="text-[10px] text-slate-400 uppercase">
                    {t('side_inbox.tradeModals.ideologyFactor')}
                  </div>
                  <div className="text-sm font-black text-white mt-0.5">x{ideologyModifier}</div>
                </div>
                <div className="bg-root-canvas/60 p-2.5 rounded-lg border border-root-accent/10">
                  <div className="text-[10px] text-slate-400 uppercase">
                    {t('side_inbox.tradeModals.religionFactor')}
                  </div>
                  <div className="text-sm font-black text-white mt-0.5">x{religionModifier}</div>
                </div>
              </div>
            </div>

            {/* ALASAN RINCI */}
            <div className="bg-[#051111] border border-root-accent/20 rounded-xl p-4 space-y-2">
              <h5 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                {t('side_inbox.tradeModals.blockingReasonsTitle')}
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {Array.isArray(displayReasons) && displayReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* TOMBOL AKSI */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-black uppercase tracking-wider bg-root-accent hover:bg-emerald-400 text-root-canvas rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,170,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('side_inbox.tradeModals.dismissInfo')}
              </button>
            </div>

          </div>

        </div>

      </div>
    </NotebookModalWrapper>
  );
}
