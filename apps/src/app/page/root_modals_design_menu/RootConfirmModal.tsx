"use client";

import React, { useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootInfoModalHeader from "./RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

export interface RootConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  variant?: "confirm" | "info";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmButtonClassName?: string;
  isDestructive?: boolean;
  footerBorderClassName?: string;
  zIndexClass?: string;
}

export default function RootConfirmModal({
  isOpen,
  onClose,
  title,
  children,
  icon,
  variant = "confirm",
  confirmLabel,
  cancelLabel,
  onConfirm,
  confirmDisabled = false,
  confirmButtonClassName,
  isDestructive = false,
  footerBorderClassName = "border-root-border",
  zIndexClass = "z-50",
}: RootConfirmModalProps) {
  const { t } = useLanguage();
  const titleId = useId();

  if (!isOpen) return null;

  const resolvedConfirmLabel = confirmLabel || t('common.rootConfirmModal.confirm');
  const resolvedCancelLabel = cancelLabel || (variant === "info" || !onConfirm ? t('common.rootConfirmModal.understand') : t('common.rootConfirmModal.cancel'));

  const isInfoOnly = variant === "info" || !onConfirm;
  const dialog = (
    <NotebookModalWrapper
      compact
      zIndexClass={zIndexClass}
      frameClassName="root-confirm-modal-frame"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full flex flex-col p-4 sm:p-5 font-sans text-white"
      >
        <RootInfoModalHeader
          title={title}
          titleId={titleId}
          icon={icon}
          onClose={onClose}
          size="compact"
        />

        <div className="flex-1">{children}</div>

        <footer
          className={`flex ${
            isInfoOnly ? "justify-end" : "flex-col sm:flex-row gap-3 justify-end"
          } mt-6 pt-4 border-t ${footerBorderClassName}`}
        >
          {isInfoOnly ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto min-h-[44px] px-6 bg-[var(--root-color-accent)] hover:brightness-110 border border-[var(--root-color-accent)] rounded-[var(--root-radius-md)] py-2 text-center text-[var(--root-color-accent-ink)] font-bold text-xs tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-sm hover:shadow active:scale-[0.98]"
            >
              {resolvedCancelLabel}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto min-h-[44px] px-6 bg-[var(--root-color-surface)] hover:bg-[var(--root-color-surface-hover)] border border-[var(--root-color-border)] rounded-[var(--root-radius-md)] py-2 text-center text-[var(--root-color-text)] font-semibold text-xs tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-sm hover:shadow active:scale-[0.98]"
              >
                {resolvedCancelLabel}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirmDisabled) return;
                  onConfirm();
                  onClose();
                }}
                disabled={confirmDisabled}
                className={`w-full sm:w-auto min-h-[44px] px-6 rounded-[var(--root-radius-md)] py-2 text-center font-bold text-xs tracking-wider uppercase transition-all duration-150 shadow-sm hover:shadow active:scale-[0.98] ${
                  confirmDisabled
                    ? "bg-[var(--root-color-surface)] text-[var(--root-color-subtle)] border border-[var(--root-color-border)] opacity-40 cursor-not-allowed"
                    : confirmButtonClassName
                    ? confirmButtonClassName
                    : isDestructive
                    ? "bg-[var(--root-color-danger)] hover:brightness-110 active:brightness-95 border border-transparent text-white cursor-pointer"
                    : "bg-[var(--root-color-accent)] hover:brightness-110 active:brightness-95 border border-[var(--root-color-accent)] text-[var(--root-color-accent-ink)] cursor-pointer"
                }`}
              >
                {resolvedConfirmLabel}
              </button>
            </>
          )}
        </footer>
      </div>
    </NotebookModalWrapper>
  );

  return typeof window !== "undefined"
    ? createPortal(dialog, document.body)
    : dialog;
}
