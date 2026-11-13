"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import RootModalCloseButton from "./RootModalCloseButton";
import { rootModalTypography } from "./rootModalTypography";

interface RootInfoModalHeaderProps {
  title: ReactNode;
  onClose: () => void;
  icon?: ReactNode;
  titleId?: string;
}

export default function RootInfoModalHeader({
  title,
  onClose,
  icon,
  titleId,
}: RootInfoModalHeaderProps) {
  return (
    <header className="root-info-modal-header flex shrink-0 items-center justify-between gap-2 border-b border-root-accent/20 bg-root-canvas px-3 py-2 sm:px-5 sm:py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <div className="root-info-modal-icon flex shrink-0 items-center justify-center rounded-lg border border-root-accent/30 bg-root-surface">
          {icon ?? <Info aria-hidden="true" />}
        </div>
        <h2 id={titleId} className={`root-info-modal-title min-w-0 ${rootModalTypography.title}`}>
          {title}
        </h2>
      </div>
      <RootModalCloseButton onClick={onClose} className="root-info-modal-close" />
    </header>
  );
}
