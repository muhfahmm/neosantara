"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";

interface AgamaGagalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBorrow?: () => void;
  cost: number;
  currentMoney: number;
}

export default function AgamaGagalModal({
  isOpen,
  onClose,
  onBorrow,
  cost,
  currentMoney,
}: AgamaGagalModalProps) {
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
        aria-labelledby="religion-insufficient-funds-title"
        className="w-full overflow-hidden rounded-xl bg-root-surface"
      >
        <RootInfoModalHeader
          title="Dana Tidak Cukup"
          onClose={onClose}
          size="standard"
          icon={<AlertCircle aria-hidden="true" className="text-rose-400" />}
          titleId="religion-insufficient-funds-title"
        />

        <div className="max-h-[calc(100dvh-120px)] overflow-y-auto bg-root-surface p-4 sm:p-5">
          <div className="flex w-full flex-col items-center rounded-2xl border border-rose-500/30 bg-root-canvas p-5 shadow-xl sm:p-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>

            <h3 className="text-2xl font-bold text-root-text mb-2 text-center">Dana Tidak Cukup!</h3>
            <p className="text-sm text-root-subtle text-center mb-6 leading-relaxed">
              Anda memerlukan <span className="font-bold text-root-accent">{cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span> untuk perubahan ini.
              <br />
              Kas negara Anda saat ini: <span className="font-bold text-rose-400">{currentMoney.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span>
            </p>

            {/* BUTTONS */}
            <div className="flex flex-col gap-3 w-full">
              {onBorrow && (
                <button
                  onClick={() => {
                    onBorrow();
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 text-root-canvas font-black text-xs uppercase shadow-md hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
                >
                  Ambil Hutang
                </button>
              )}
              <SharedModalCloseButton
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-root-accent/30 bg-root-accent/10 text-root-accent font-bold text-xs uppercase shadow-md hover:bg-root-accent/20 active:scale-95 transition-all cursor-pointer"
               appearance="custom">
                Tutup
              </SharedModalCloseButton>
            </div>
          </div>
        </div>
      </section>
    </NotebookModalWrapper>,
    document.body
  );
}