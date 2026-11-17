"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import MenuInfoModal from "./MenuInfoModal";

interface MenuInfoButtonProps {
  title: string;
  description: string;
}

export default function MenuInfoButton({ title, description }: MenuInfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Informasi ${title}`}
        title={`Informasi ${title}`}
        className="root-modal-info-button root-modal-util-1697100c43 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-root-accent/40 bg-root-surface text-root-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-accent"
      >
        <Info className="h-4 w-4" />
      </button>
      {isOpen && typeof document !== "undefined" && createPortal(
        <MenuInfoModal
          isOpen
          onClose={() => setIsOpen(false)}
          title={`Informasi ${title}`}
          description={description}
        />,
        document.body
      )}
    </>
  );
}