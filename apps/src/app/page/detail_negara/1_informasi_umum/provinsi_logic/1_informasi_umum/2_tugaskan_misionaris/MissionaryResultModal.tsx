'use client';

import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

interface MissionaryResultModalProps {
  targetCountry: string;
  succeeded: boolean;
  successChance: number;
  message: string;
  actionLabel: string;
  onClose: () => void;
}

export default function MissionaryResultModal({
  targetCountry,
  succeeded,
  successChance,
  message,
  actionLabel,
  onClose
}: MissionaryResultModalProps) {
  const { t } = useLanguage();
  const ResultIcon = succeeded ? CheckCircle2 : XCircle;
  const resultColor = succeeded ? 'text-root-accent' : 'text-red-400';

  return (
    <div className="fixed inset-0 z-[200001] flex items-center justify-center p-4 bg-transparent pointer-events-none">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="missionary-result-header"
        className="modal-responsive-shell bg-root-surface border-2 sm:border-3 border-root-accent/30 rounded-2xl overflow-hidden flex flex-col relative font-sans pointer-events-auto shadow-2xl"
      >
        <RootInfoModalHeader
          title={`${t('detail_negara_ai.province.resultPrefix')} ${actionLabel}`}
          titleId="missionary-result-header"
          onClose={onClose}
          icon={<ResultIcon />}
          size="standard"
        />
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-center">
          <ResultIcon className={`mx-auto mb-3 h-12 w-12 ${resultColor}`} aria-hidden="true" />
          <h3 className={`mb-2 text-lg font-black uppercase ${resultColor}`}>
            {actionLabel} {succeeded ? t('detail_negara_ai.province.succeeded') : t('detail_negara_ai.province.failed')}
          </h3>
          <p className="mb-4 text-sm text-[#B7D5CD]">
            {t('detail_negara_ai.province.actionResultFor')} {actionLabel.toLowerCase()} {t('detail_negara_ai.province.for')} <strong>{targetCountry}</strong>.
          </p>
          <div className="mb-5 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#B7D5CD]">{t('detail_negara_ai.province.successChance')}</p>
            <p className="mt-1 text-2xl font-black text-root-accent">{successChance}%</p>
          </div>
          <p className="mb-6 text-sm text-white">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-root-accent px-4 py-3 text-xs font-black uppercase text-root-canvas transition-colors hover:bg-[#00D991]"
          >
            {t('detail_negara_ai.common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}