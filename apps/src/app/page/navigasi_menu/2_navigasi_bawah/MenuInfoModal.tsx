"use client";

import { Info } from "lucide-react";
import NotebookModalWrapper from "./NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface MenuInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export default function MenuInfoModal({
  isOpen,
  onClose,
  title,
  description,
}: MenuInfoModalProps) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper
      compact
      maxWidthClass="max-w-2xl"
      onClose={onClose}
      zIndexClass="z-[200]"
      hideWhenInfoModalOpen={false}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-info-modal-title"
        className="flex min-w-0 flex-col overflow-hidden"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-root-accent/20 bg-root-canvas px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="shrink-0 rounded-lg border border-root-accent/30 bg-root-surface p-1 sm:p-1.5">
              <Info className="h-4 w-4 text-root-accent" aria-hidden="true" />
            </div>
            <h2 id="menu-info-modal-title" className={rootModalTypography.title}>{title}</h2>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>
        <div className="bg-root-surface p-4 sm:p-5">
          <p className={`${rootModalTypography.body} ${rootModalTypography.muted} break-words`}>
            {description}
          </p>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}