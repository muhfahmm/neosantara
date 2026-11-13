"use client";

import type { ReactNode } from "react";
import NotebookModalWrapper from "./NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface MenuInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  fillContent?: boolean;
}

export default function MenuInfoModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  fillContent = false,
}: MenuInfoModalProps) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper
      compact
      onClose={onClose}
      zIndexClass="z-[200]"
      hideWhenInfoModalOpen={false}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-info-modal-title"
        className={`flex min-w-0 flex-col overflow-hidden max-h-[calc(100dvh-160px)] sm:max-h-[calc(100dvh-176px)] lg:max-h-[calc(100dvh-172px)] ${fillContent ? "h-full min-h-0 flex-1" : ""}`}
      >
        <RootInfoModalHeader
          title={title}
          titleId="menu-info-modal-title"
          onClose={onClose}
        />
        <div className={`root-info-modal-content min-h-0 overflow-y-auto bg-root-surface p-4 sm:p-5 ${fillContent ? "flex flex-1" : ""}`}>
          {description && (
            <p className={`${rootModalTypography.body} ${rootModalTypography.muted} break-words`}>
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </NotebookModalWrapper>
  );
}