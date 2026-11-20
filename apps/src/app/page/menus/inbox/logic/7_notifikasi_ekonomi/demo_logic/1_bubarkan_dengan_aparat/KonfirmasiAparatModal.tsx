import React from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

interface KonfirmasiAparatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cost?: number;
}

export default function KonfirmasiAparatModal({
  isOpen,
  onClose,
  onConfirm,
  cost = 250000,
}: KonfirmasiAparatModalProps) {
  const { t } = useLanguage();
  if (typeof window === 'undefined' || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[500000] flex items-center justify-center p-4 pointer-events-auto animate-fade-in font-sans">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="police-action-confirmation-title"
        className="modal-responsive-shell relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1A0A0E] via-[#120508] to-[#0A0304] border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.25)] flex flex-col"
      >
        <RootInfoModalHeader
          title={t('side_inbox.demo.confirmTitle')}
          titleId="police-action-confirmation-title"
          onClose={onClose}
          icon={<ShieldAlert />}
          size="standard"
          actions={<span className="text-[10px] text-rose-400/80 uppercase font-semibold">{t('side_inbox.demo.confirmSubtitle')}</span>}
        />

        {/* Content */}
        <div className="p-5 space-y-4 text-left">
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 leading-relaxed space-y-2">
            <p className="font-medium">
              {t('side_inbox.demo.confirmWarning')}
            </p>
            <div className="pt-2 border-t border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{t('side_inbox.demo.operationCost')}: <strong className="text-white font-black">{cost.toLocaleString('id-ID')} NEO</strong></span>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-wider">
            {t('side_inbox.demo.confirmQuestion')}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-rose-500/30 bg-[#0A0304] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            {t('side_inbox.demo.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl border border-rose-500 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] cursor-pointer hover:scale-[1.02]"
          >
            {t('side_inbox.demo.confirmDisperse')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
