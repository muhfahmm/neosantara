"use client";
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import { useIcbmMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useIcbmMenuTranslation";

export type NeonAlertVariant = "error" | "success" | "info";

interface NeonAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: NeonAlertVariant;
  buttonLabel?: string;
}

export default function NeonAlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = "error",
  buttonLabel,
}: NeonAlertModalProps) {
  const { translate } = useIcbmMenuTranslation();
  if (!isOpen) return null;
  const variants = {
    error: { color: "var(--root-modal-alert-error)", Icon: AlertTriangle, title: translate("alerts.warning") },
    success: { color: "var(--root-modal-positive)", Icon: CheckCircle2, title: translate("alerts.success") },
    info: { color: "var(--root-modal-info)", Icon: Info, title: translate("alerts.information") },
  } as const;
  const { color, Icon, title: defaultTitle } = variants[variant];

  return (
    <NotebookModalWrapper
      onClose={onClose}
      compact
      zIndexClass="z-[120]"
    >
      <div
        className="font-sans overflow-hidden"
        style={{ border: `2px solid ${color}` }}
      >
        <div className="flex items-center justify-between border-b bg-root-canvas px-3 py-2 sm:px-5 sm:py-2.5" style={{ borderColor: `${color}33` }}>
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6" style={{ color }} />
            <h3 className="text-lg font-black uppercase tracking-wide" style={{ color }}>
              {title || defaultTitle}
            </h3>
          </div>
          <SharedModalCloseButton
            onClick={onClose}
            aria-label={translate("alerts.close")}
            className="p-2 rounded-lg border text-root-subtle hover:text-root-text hover:border-root-accent transition-all cursor-pointer"
            style={{ borderColor: `${color}55` }}
           appearance="custom">
            <X className="h-4 w-4" />
          </SharedModalCloseButton>
        </div>
        <div className="px-4 sm:px-5 py-4 bg-root-surface">
          <p className="text-sm leading-relaxed text-root-body">{message}</p>
        </div>
        <div className="px-4 sm:px-5 py-3 bg-root-canvas flex justify-end border-t" style={{ borderColor: `${color}33` }}>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-root-accent-ink transition-all active:scale-95 hover:brightness-95 cursor-pointer"
            style={{ background: color }}
          >
            {buttonLabel || translate("alerts.understand")}
          </button>
        </div>
    </div>
    </NotebookModalWrapper>
  );
}