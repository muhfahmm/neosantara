"use client";

import { useEffect, type ReactNode } from "react";
import NotebookModalWrapper, { MENU_INFO_MODAL_VISIBILITY_EVENT } from "./NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface MenuInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  fillContent?: boolean;
  contentSized?: boolean;
}

export default function MenuInfoModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  fillContent = false,
  contentSized = true,
}: MenuInfoModalProps) {
  const shouldSizeToContent = contentSized && !fillContent;

  useEffect(() => {
    if (!isOpen) return;

    const dispatchVisibility = (nextIsOpen: boolean) => {
      window.dispatchEvent(new CustomEvent(MENU_INFO_MODAL_VISIBILITY_EVENT, {
        detail: { isOpen: nextIsOpen },
      }));
    };

    dispatchVisibility(true);
    return () => dispatchVisibility(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <NotebookModalWrapper
      onClose={onClose}
      zIndexClass="z-[200]"
      hideWhenInfoModalOpen={false}
      contentSized={shouldSizeToContent}
      frameClassName={shouldSizeToContent ? "menu-info-content-sized-frame" : ""}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-info-modal-title"
        className={`root-modal-util-b74379da23 ${shouldSizeToContent ? "menu-info-content-sized-dialog" : "h-full min-h-0 flex-1"}`}
      >
        <RootInfoModalHeader
          title={title}
          titleId="menu-info-modal-title"
          onClose={onClose}
          size="standard"
        />
        <div className={`root-info-modal-content min-h-0 ${shouldSizeToContent ? "" : "flex-1 overflow-y-auto"} bg-root-surface p-4 sm:p-5 lg:p-6 ${fillContent ? "flex" : ""}`}>
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