"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface IdeologiGagalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBorrow?: () => void;
  cost: number;
  currentMoney: number;
}

export default function IdeologiGagalModal({
  isOpen,
  onClose,
  onBorrow,
  cost,
  currentMoney,
}: IdeologiGagalModalProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <NotebookModalWrapper
      compact
      contentSized
      frameClassName="menu-info-content-sized-frame social-confirm-modal-frame"
      onClose={onClose}
      zIndexClass="z-[200]"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ideology-insufficient-funds-title"
        className="w-full overflow-hidden rounded-xl bg-root-surface"
      >
        <RootInfoModalHeader
          title={t('nav_sosial_budaya_ideologi.fundsModal.title') || "Dana Tidak Cukup"}
          onClose={onClose}
          size="standard"
          icon={<AlertCircle aria-hidden="true" className="text-rose-400" />}
          titleId="ideology-insufficient-funds-title"
        />

        <div className="max-h-[calc(100dvh-120px)] overflow-y-auto bg-root-surface p-4 sm:p-5">
          <div className="flex w-full flex-col items-center rounded-2xl border border-rose-500/30 bg-root-canvas p-5 shadow-xl sm:p-6">
            <div className="w-20 h-20 rounded-full bg-rose-950/50 border border-rose-500/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>

            <h3 className="text-2xl font-black text-root-text mb-2 text-center">{t('nav_sosial_budaya_ideologi.fundsModal.title') || 'Dana Tidak Cukup!'}</h3>
            <p className="text-sm text-root-subtle text-center mb-6 leading-relaxed">
              {t('nav_sosial_budaya_ideologi.fundsModal.desc', { cost: cost.toLocaleString('id-ID', { maximumFractionDigits: 2 }) }) || `Anda memerlukan ${cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO untuk perubahan ini.`}
              <br />
              {t('nav_sosial_budaya_ideologi.fundsModal.currentTreasury', { money: currentMoney.toLocaleString('id-ID', { maximumFractionDigits: 2 }) }) || `Kas negara Anda saat ini: ${currentMoney.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO`}
            </p>

            {/* BUTTONS */}
            <div className="flex flex-col gap-3 w-full">
              {onBorrow && (
                <button
                  onClick={() => {
                    onBorrow();
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-black text-xs uppercase shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  {t('nav_sosial_budaya_ideologi.fundsModal.btnTakeLoan') || 'Ambil Hutang'}
                </button>
              )}
              <SharedModalCloseButton
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-root-accent/30 bg-root-accent/10 text-root-accent font-bold text-xs uppercase shadow-md hover:bg-root-accent/20 active:scale-95 transition-all cursor-pointer"
               appearance="custom">
                {t('nav_sosial_budaya_ideologi.fundsModal.btnClose') || 'Tutup'}
              </SharedModalCloseButton>
            </div>
          </div>
        </div>
      </section>
    </NotebookModalWrapper>,
    document.body
  );
}