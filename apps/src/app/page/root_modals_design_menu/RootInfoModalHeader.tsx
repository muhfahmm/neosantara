"use client";

import { cloneElement, isValidElement, type ReactNode } from "react";
import { Info } from "lucide-react";
import RootModalCloseButton from "./RootModalCloseButton";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface RootInfoModalHeaderProps {
  title: ReactNode;
  onClose?: () => void;
  icon?: ReactNode;
  actions?: ReactNode;
  centerContent?: ReactNode;
  iconContainerClassName?: string;
  iconClassName?: string;
  size?: "compact" | "standard";
  titleId?: string;
  closeAriaLabel?: string;
}

export default function RootInfoModalHeader({
  title,
  onClose,
  icon,
  actions,
  centerContent,
  iconContainerClassName,
  iconClassName = "root-modal-util-d252947d10",
  size = "compact",
  titleId,
  closeAriaLabel,
}: RootInfoModalHeaderProps) {
  const { t } = useLanguage();
  const isStandard = size === "standard";
  const headerIcon = icon ?? <Info aria-hidden="true" />;
  const renderedIcon =
    isStandard && iconClassName && isValidElement<{ className?: string }>(headerIcon)
      ? cloneElement(headerIcon, {
          className: `${headerIcon.props.className ?? ""} ${iconClassName}`.trim(),
        })
      : headerIcon;

  return (
    <header
      className={
        isStandard
          ? "satisfaction-modal-header root-modal-util-9462ce2345"
          : "root-info-modal-header"
      }
      data-size={isStandard ? undefined : size}
      data-centered={!isStandard && centerContent ? "true" : undefined}
    >
      <div className={isStandard ? "satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar" : "root-info-modal-header-main"}>
        {isStandard ? (
          <div className="root-modal-util-08dfbca033 min-w-0">
            <div className={iconContainerClassName ?? "root-modal-util-739d92b232"}>
              {renderedIcon}
            </div>
            <h2
              id={titleId}
              className="root-modal-util-6b4648c53a root-modal-util-c2385a463d truncate"
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
        <div className="root-info-modal-center mx-2 flex-1 min-w-0">{centerContent}</div>
      )}
      <div className={isStandard ? "root-modal-util-08dfbca033 shrink-0" : "root-info-modal-actions"}>
        {actions}
        {onClose && (
          <RootModalCloseButton
            onClick={onClose}
            ariaLabel={closeAriaLabel ?? t("common.close")}
            className="root-info-modal-close"
          />
        )}
      </div>
    </header>
  );
}
