'use client';

import React, { useId } from 'react';
import { createPortal } from 'react-dom';
import { HandHeart } from 'lucide-react';
import NotebookModalWrapper from '@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper';
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getLocalizedCountryName } from '@/app/logic/countryNameLogic';

interface MintaBantuanKonfirmasiModalProps {
  isOpen: boolean;
  countryName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function MintaBantuanKonfirmasiModal({
  isOpen,
  countryName,
  onClose,
  onConfirm,
}: MintaBantuanKonfirmasiModalProps) {
  const { t, language } = useLanguage();
  const titleId = useId();

  if (!isOpen) return null;

  const dialog = (
    <NotebookModalWrapper
      onClose={onClose}
      zIndexClass="z-[100000001]"
      compact
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full flex flex-col p-4 sm:p-5 font-sans text-white"
      >
        <RootInfoModalHeader
          title={t('detail_negara_ai.geopolitics.requestHelpTitle')}
          titleId={titleId}
          icon={<HandHeart className="h-4 w-4 text-root-accent" />}
          onClose={onClose}
          size="compact"
        />

        <p className="text-sm sm:text-base text-root-text leading-relaxed">
          {t('detail_negara_ai.geopolitics.requestHelpPromptPrefix')}{' '}
          <strong className="text-root-accent uppercase">
            {getLocalizedCountryName(countryName, language)}
          </strong>
          ?{' '}{t('detail_negara_ai.geopolitics.requestHelpPromptSuffix')}
        </p>

        <footer className="mt-6 pt-4 border-t border-root-accent/20 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-6 bg-root-surface hover:bg-root-surface-hover border border-root-border rounded-md py-2 text-center text-root-text font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            {t('detail_negara_ai.common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full sm:w-auto min-h-[44px] px-6 bg-root-accent hover:brightness-110 border border-root-accent rounded-md py-2 text-center text-root-accent-ink font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            {t('detail_negara_ai.geopolitics.requestHelpConfirm')}
          </button>
        </footer>
      </div>
    </NotebookModalWrapper>
  );

  return typeof window !== 'undefined'
    ? createPortal(dialog, document.body)
    : dialog;
}
