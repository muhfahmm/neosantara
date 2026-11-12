"use client";

import { Info } from "lucide-react";
import type { ReactNode } from "react";
import NotebookModalWrapper from "./NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface MenuInfoModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fillContent?: boolean;
}

type MenuInfoModalProps = MenuInfoModalBaseProps & (
  | { description: string; children?: never }
  | { description?: never; children: ReactNode }
);

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
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-root-accent/20 bg-root-canvas px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="shrink-0 rounded-lg border border-root-accent/30 bg-root-surface p-1 sm:p-1.5">
              <Info className="h-4 w-4 text-root-accent" aria-hidden="true" />
            </div>
            <h2 id="menu-info-modal-title" className={rootModalTypography.title}>{title}</h2>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>
        {children !== undefined ? (
          <div className={`min-h-0 flex-1 overflow-y-auto bg-root-surface p-4 sm:p-5 ${fillContent ? "flex" : ""}`}>
            {children}
          </div>
        ) : (
          <div className="bg-root-surface p-4 sm:p-5">
            <p className={`${rootModalTypography.body} ${rootModalTypography.muted} break-words`}>
              {description}
            </p>
          </div>
        )}
      </div>
    </NotebookModalWrapper>
  );
}