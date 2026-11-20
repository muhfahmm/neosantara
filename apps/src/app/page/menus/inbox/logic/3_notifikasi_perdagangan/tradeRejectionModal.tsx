'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getLocalizedCountryName } from '@/app/logic/countryNameLogic';

interface TradeRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerCountry: string;
  tradeType: 'jual' | 'beli'; // Tipe perdagangan yang ditolak
  reason?: 'closed_system' | 'high_centralization' | 'custom';
  customReason?: string;
}

export default function TradeRejectionModal({
  isOpen,
  onClose,
  partnerCountry,
  tradeType,
  reason = 'closed_system',
  customReason,
}: TradeRejectionModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const partner = getLocalizedCountryName(partnerCountry || 'Mitra');
  const isClosedEconomy = reason === 'closed_system';
  const isHighCentralization = reason === 'high_centralization';

  const defaultRecommendations = [1, 2, 3].map(index =>
    t(`side_inbox.dynamicNotifications.tradeModal.recommendation${index}`)
  );

  const getReasonDetails = () => {
    if (isClosedEconomy) {
      return {
        title: t('side_inbox.tradeModals.closedAlertTitle'),
        description: t('side_inbox.tradeModals.closedAlertDesc', { partner }),
        recommendations: defaultRecommendations,
      };
    }

    if (isHighCentralization) {
      return {
        title: t('side_inbox.tradeModals.closedAlertTitle'),
        description: t('side_inbox.tradeModals.closedAlertDesc', { partner }),
        recommendations: defaultRecommendations,
      };
    }

    return {
      title: t('side_inbox.tradeModals.closedTitle'),
      description: t('side_inbox.dynamicNotifications.tradeModal.customReason', {
        partner,
        economy: customReason || '',
      }),
      recommendations: defaultRecommendations,
    };
  };

  const details = getReasonDetails();

  return (
    <div className="fixed inset-0 z-[100000002] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0a1818] border-2 border-red-500/50 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.25)] overflow-hidden font-sans">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-500/30 bg-red-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {t('side_inbox.tradeModals.closedTitle')}
              </h3>
              <p className="text-[10px] font-bold text-red-300 uppercase tracking-widest mt-0.5">
                {t('side_inbox.tradeModals.closedSub')}
              </p>
            </div>
          </div>
          <SharedModalCloseButton
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
           appearance="custom">
            <X className="w-4 h-4 text-red-400" />
          </SharedModalCloseButton>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Box Peringatan Utama */}
          <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4">
            <h4 className="text-xs font-black text-red-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{details.title}</span>
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              {details.description}
            </p>
          </div>

          {/* Rekomendasi Langkah */}
          <div className="bg-[#051111] border border-root-accent/20 rounded-xl p-4 space-y-2">
            <h5 className="text-[11px] font-black text-root-accent uppercase tracking-wider">
              {t('side_inbox.tradeModals.stepResolutionTitle')}
            </h5>
            <ul className="space-y-1.5">
              {Array.isArray(details.recommendations) && details.recommendations.map((rec, index) => (
                <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-root-accent shrink-0 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Tombol Tutup */}
        <div className="px-5 py-3 border-t border-red-500/20 bg-[#051111] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 hover:border-red-400 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('side_inbox.tradeModals.dismiss')}
          </button>
        </div>

      </div>
    </div>
  );
}
