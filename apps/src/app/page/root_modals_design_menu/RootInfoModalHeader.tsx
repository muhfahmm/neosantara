"use client";

import { cloneElement, isValidElement, type ReactNode } from "react";
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
  const isStandard = size === "standard";
  const headerIcon = icon ?? <Info aria-hidden="true" />;
  const renderedIcon =
    isStandard && isValidElement<{ className?: string }>(headerIcon)
      ? cloneElement(headerIcon, {
          className: `${headerIcon.props.className ?? ""} root-modal-util-d252947d10`.trim(),
        })
      : headerIcon;

  return (
    <header
      className={
        isStandard
          ? `satisfaction-modal-header root-modal-util-9462ce2345 ${centerContent ? "root-info-modal-header" : ""}`
          : "root-info-modal-header"
      }
      data-size={isStandard ? (centerContent ? size : undefined) : size}
      data-centered={centerContent ? "true" : undefined}
    >
      <div className={isStandard ? "satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar" : "root-info-modal-header-main"}>
        {isStandard ? (
          <div className="root-modal-util-08dfbca033">
            <div className="root-modal-util-739d92b232">{renderedIcon}</div>
            <h2
              id={titleId}
              className="root-modal-util-6b4648c53a root-modal-util-c2385a463d"
            >
              {title}
            </h2>
          </div>
        ) : (
          <>
            <div className="root-info-modal-icon">{headerIcon}</div>
            <h2 id={titleId} className="root-info-modal-title">
              {title}
            </h2>
          </>
        )}
      </div>
      {centerContent && (
        <div className="root-info-modal-center">{centerContent}</div>
      )}
      <div className={isStandard ? "root-modal-util-08dfbca033" : "root-info-modal-actions"}>
        {actions}
        <RootModalCloseButton onClick={onClose} className="root-info-modal-close" />
      </div>
    </header>
  );
}
