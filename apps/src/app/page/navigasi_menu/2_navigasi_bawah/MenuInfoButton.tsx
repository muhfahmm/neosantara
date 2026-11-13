"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import MenuInfoModal from "./MenuInfoModal";
import { MENU_INFO_MODAL_VISIBILITY_EVENT } from "./NotebookModalWrapper";

interface MenuInfoButtonProps {
  title: string;
  description: string;
}

export default function MenuInfoButton({ title, description }: MenuInfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const setInfoModalOpen = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen);
    window.dispatchEvent(new CustomEvent(MENU_INFO_MODAL_VISIBILITY_EVENT, {
      detail: { isOpen: nextIsOpen },
    }));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setInfoModalOpen(true)}
        aria-label={`Informasi ${title}`}
        title={`Informasi ${title}`}
        className="root-modal-info-button flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-root-accent/40 bg-root-surface text-root-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-accent"
      >
        <Info className="h-4 w-4" />
      </button>
      {isOpen && typeof document !== "undefined" && createPortal(
        <MenuInfoModal
          isOpen
          onClose={() => setInfoModalOpen(false)}
          title={`Informasi ${title}`}
          description={description}
        />,
        document.body
      )}
    </>
  );
}