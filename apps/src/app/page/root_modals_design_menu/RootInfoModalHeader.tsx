"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import RootModalCloseButton from "./RootModalCloseButton";

interface RootInfoModalHeaderProps {
  title: ReactNode;
  onClose: () => void;
  icon?: ReactNode;
  actions?: ReactNode;
  centerContent?: ReactNode;
  size?: "compact" | "standard";
  titleId?: string;
}

export default function RootInfoModalHeader({
  title,
  onClose,
  icon,
  actions,
  centerContent,
  size = "compact",
  titleId,
}: RootInfoModalHeaderProps) {
  return (
    <header
      className="root-info-modal-header"
      data-size={size}
      data-centered={centerContent ? "true" : undefined}
    >
      <div className="root-info-modal-header-main">
        <div className="root-info-modal-icon">
          {icon ?? <Info aria-hidden="true" />}
        </div>
        <h2 id={titleId} className="root-info-modal-title">
          {title}
        </h2>
      </div>
      {centerContent && (
        <div className="root-info-modal-center">{centerContent}</div>
      )}
      <div className="root-info-modal-actions">
        {actions}
        <RootModalCloseButton onClick={onClose} className="root-info-modal-close" />
      </div>
    </header>
  );
}
