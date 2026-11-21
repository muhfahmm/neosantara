"use client";
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { X } from "lucide-react";
import NotebookModalWrapper from "../../../../NotebookModalWrapper";
import { useIcbmMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useIcbmMenuTranslation";

interface ConfirmBuildIcbmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quantity: number;
  totalCashCost: number;
  totalUraniumCost: number;
  totalBuildDays: number;
  completionDate: string;
}

export default function ConfirmBuildIcbmModal({
  isOpen,
  onClose,
  onConfirm,
  quantity,
  totalCashCost,
  totalUraniumCost,
  totalBuildDays,
  completionDate,
}: ConfirmBuildIcbmModalProps) {
  const { language, translate } = useIcbmMenuTranslation();
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper onClose={onClose} compact zIndexClass="z-[100]">
      <div className="flex flex-col font-sans">
        <div className="px-4 sm:px-5 py-3 border-b border-root-accent/20 bg-root-canvas flex items-center justify-between">
          <div>
            <h3 className="text-[length:var(--modal-font-title)] font-black text-root-accent uppercase tracking-wide">{translate("buildConfirm.title")}</h3>
            <p className="text-[11px] text-root-subtle mt-1">{translate("buildConfirm.subtitle")}</p>
          </div>
          <SharedModalCloseButton onClick={onClose} className="p-2.5 rounded-xl border border-root-accent/40 text-root-subtle hover:text-root-accent hover:bg-root-accent/10 transition-all cursor-pointer flex items-center gap-1.5" appearance="custom">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">{translate("common.close")}</span>
            <X className="h-5 w-5" />
          </SharedModalCloseButton>
        </div>

        <div className="p-4 sm:p-5 bg-root-surface">
          <div className="space-y-4 text-sm text-root-body">
            <p className="font-bold">
              {translate("buildConfirm.summaryLead")}{" "}
              <span className="text-root-accent">{quantity.toLocaleString(language)}</span>{" "}
              {translate("buildConfirm.summaryTail")}
            </p>
            <ul className="space-y-2 pl-4 list-disc marker:text-root-accent">
              <li>{totalCashCost.toLocaleString(language, { maximumFractionDigits: 0 })} NEO</li>
              <li>{totalUraniumCost.toLocaleString(language)} uranium</li>
              <li>{translate("buildConfirm.duration", { count: totalBuildDays.toLocaleString(language) })}</li>
              <li>{translate("buildConfirm.completion", { date: completionDate })}</li>
            </ul>
            <p className="text-root-subtle">{translate("buildConfirm.returnHint")}</p>
          </div>
        </div>

        <div className="px-4 sm:px-5 py-3 border-t border-root-accent/20 bg-root-canvas flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg border border-root-accent/40 text-root-muted font-bold hover:border-root-accent hover:text-root-accent transition-all cursor-pointer">{translate("common.cancel")}</button>
          <button onClick={() => { onConfirm(); }} className="px-5 py-2 rounded-lg bg-root-accent text-root-accent-ink font-black hover:brightness-95 active:scale-95 transition-all cursor-pointer">{translate("buildConfirm.ok")}</button>
        </div>
    </div>
    </NotebookModalWrapper>
  );
}