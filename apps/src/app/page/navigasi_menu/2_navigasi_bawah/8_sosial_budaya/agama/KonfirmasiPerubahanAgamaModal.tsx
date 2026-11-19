"use client"
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Coins, Church } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { SOCIAL_CULTURAL_CHANGE_DELAY_DAYS } from "@/app/page/menus/inbox/logic/10_sosial_budaya/socialCulturalChangeLogic";

interface AgamaConfirmModalProps {
  isOpen: boolean;
  isInfoMode?: boolean;
  onClose: () => void;
  onInstantChange: () => void;
  onConfirm: () => void;
  title: string;
  icon: React.ReactNode;
  bonusText: string;
  cost: number;
}

export default function AgamaConfirmModal({
  isOpen,
  isInfoMode = false,
  onClose,
  onInstantChange,
  onConfirm,
  title,
  icon,
  bonusText,
  cost,
}: AgamaConfirmModalProps) {
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
        aria-labelledby="religion-confirm-title"
        className="w-full overflow-hidden rounded-xl bg-root-surface"
      >
        <RootInfoModalHeader
          title={isInfoMode ? "Efektivitas Agama" : "Konfirmasi Perubahan Agama"}
          onClose={onClose}
          size="standard"
          icon={<Church aria-hidden="true" className="text-root-accent" />}
          titleId="religion-confirm-title"
        />

        <div className="bg-root-surface p-4 sm:p-5">
          <div className="flex w-full flex-col items-center rounded-2xl border border-root-accent/20 bg-root-canvas p-5 shadow-xl sm:p-6">
            <div className="relative w-16 h-20 flex-shrink-0 rounded-md flex items-center justify-center shadow-lg border-b-[4px] bg-[#051111] border-root-accent/40">
              <div className="absolute top-1 left-2 w-2 h-4 bg-root-accent/20 rounded-full" />
              <div className="absolute top-1 right-2 w-2 h-4 bg-root-accent/20 rounded-full" />
              <div className="text-root-accent transform scale-110">
                {icon}
              </div>
            </div>

            <h3 className="text-xl font-bold text-root-text mt-4 text-center">{title}</h3>
            {isInfoMode && (
              <span className="mt-2 text-[10px] font-black uppercase tracking-wider text-root-subtle">
                Efek agama yang sedang aktif
              </span>
            )}
            <p className="text-[#00D68F] text-sm font-semibold mt-1 text-center">{bonusText}</p>

            {!isInfoMode && (
              <div className="flex items-center gap-2.5 mt-4 text-sm font-bold text-root-text bg-[#051111] px-4 py-2 rounded-xl border border-root-accent/20">
                <Coins className="w-4 h-4 text-[#00D68F]" />
                <span>{cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span>
              </div>
            )}

            {!isInfoMode && (
              <p className="mt-3 text-center text-xs text-root-subtle">
                Pilih Seketika untuk perubahan langsung atau Ubah untuk perubahan dalam {SOCIAL_CULTURAL_CHANGE_DELAY_DAYS} hari.
              </p>
            )}

            {!isInfoMode && (
              <div className="flex w-full gap-4 mt-6">
                <button
                  type="button"
                  onClick={onInstantChange}
                  className="flex-1 py-2.5 rounded-xl bg-[#00D68F] hover:bg-[#00C282] text-root-canvas font-extrabold text-xs uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Seketika
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-[#00D68F] hover:bg-[#00C282] text-root-canvas font-extrabold text-xs uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Ubah
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </NotebookModalWrapper>,
    document.body
  );
}