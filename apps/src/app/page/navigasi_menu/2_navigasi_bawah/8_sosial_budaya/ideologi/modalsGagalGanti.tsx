"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertCircle } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <NotebookModalWrapper compact onClose={onClose} zIndexClass="z-[200]">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <RootInfoModalHeader
          title="Dana Tidak Cukup"
          onClose={onClose}
          size="standard"
          icon={<AlertCircle aria-hidden="true" className="text-rose-400" />}
        />

        {/* CONTENT */}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto bg-root-surface p-4 custom-scrollbar sm:p-6">
          <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-rose-500/30 bg-root-canvas p-5 shadow-xl sm:p-8">
            <div className="w-20 h-20 rounded-full bg-rose-950/50 border border-rose-500/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>

            <h3 className="text-2xl font-black text-root-text mb-2 text-center">Dana Tidak Cukup!</h3>
            <p className="text-sm text-root-subtle text-center mb-6 leading-relaxed">
              Anda memerlukan <span className="font-black text-root-accent">{cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span> untuk perubahan ini.
              <br />
              Kas negara Anda saat ini: <span className="font-black text-rose-400">{currentMoney.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span>
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
      </div>
    </NotebookModalWrapper>,
    document.body
  );
}