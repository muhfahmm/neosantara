"use client";

import React, { useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootInfoModalHeader from "./RootInfoModalHeader";

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
  confirmLabel = "Konfirmasi",
  cancelLabel,
  onConfirm,
  confirmDisabled = false,
  confirmButtonClassName,
  isDestructive = false,
  footerBorderClassName = "border-root-accent/20",
  zIndexClass = "z-[100000001]",
}: RootConfirmModalProps) {
  const titleId = useId();

  if (!isOpen) return null;

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
              className="w-full sm:w-auto px-6 bg-root-accent hover:bg-[#00e699] border border-root-accent rounded-xl py-2 text-center text-root-canvas font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
            >
              {cancelLabel || "Mengerti"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
              >
                {cancelLabel || "Batal"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirmDisabled) return;
                  onConfirm();
                  onClose();
                }}
                disabled={confirmDisabled}
                className={`w-full sm:w-auto px-6 rounded-xl py-2 text-center font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 shadow hover:shadow-md active:scale-[0.98] ${
                  confirmDisabled
                    ? "bg-root-canvas text-root-subtle border border-root-accent/20 opacity-40 cursor-not-allowed"
                    : confirmButtonClassName
                    ? confirmButtonClassName
                    : isDestructive
                    ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-500 text-white cursor-pointer"
                    : "bg-root-accent hover:bg-[#00e699] border border-root-accent text-root-canvas cursor-pointer"
                }`}
              >
                {confirmLabel}
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
