"use client";

import { Search } from "lucide-react";
import { useViewportMode } from "@/app/hooks/useViewportMode";
import RootModalTabs, { type RootModalTabItem } from "./RootModalTabs";

interface RootModalSearchToolbarProps {
  items: RootModalTabItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchAriaLabel: string;
  layout?: "default" | "inline";
  showSearch?: boolean;
  className?: string;
  tabsClassName?: string;
  searchContainerClassName?: string;
}

export default function RootModalSearchToolbar({
  items,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  layout = "default",
  showSearch = true,
  className = "",
  tabsClassName = "",
  searchContainerClassName = "",
}: RootModalSearchToolbarProps) {
  const isCompactViewport = useViewportMode() !== "desktop";
  const compactTabClassName =
    "!min-w-0 !px-1.5 !py-[5px] !text-[9px] !tracking-[0.04em]";
  const isInlineLayout = layout === "inline";
  const verticalPaddingClassName = isCompactViewport ? "py-1.5" : "py-2";
  const toolbarClassName = isInlineLayout
    ? `flex w-full min-w-0 shrink-0 flex-col items-stretch ${
        isCompactViewport
          ? `gap-[6px] ${verticalPaddingClassName}`
          : `gap-3 ${verticalPaddingClassName} xl:flex-row xl:items-center`
      }`
    : `flex shrink-0 border-b border-root-accent/20 bg-root-canvas ${
        isCompactViewport
          ? `flex-row flex-nowrap items-center gap-[5px] px-2 ${verticalPaddingClassName}`
          : `flex-col gap-2 px-4 ${verticalPaddingClassName} sm:flex-row sm:items-center sm:justify-between sm:px-6`
      }`;

  return (
    <div className={`${toolbarClassName} ${className}`}>
      <RootModalTabs
        compact
        className={`${isInlineLayout ? "w-full" : "w-fit"} ${
          isCompactViewport
            ? "!h-auto !flex-[0_1_auto] !flex-nowrap !gap-0.5 !p-[3px] [&_svg]:!h-[13px] [&_svg]:!w-[13px]"
            : ""
        } ${tabsClassName}`}
        items={items.map((item) => ({
          ...item,
          className: [
            item.className,
            isCompactViewport ? compactTabClassName : "",
          ]
            .filter(Boolean)
            .join(" "),
        }))}
      />

      {showSearch && (
        <div
          className={`relative ${
            isInlineLayout
              ? "w-full min-w-0"
              : isCompactViewport
                ? "min-w-[92px] flex-[0_1_150px]"
                : "w-full sm:max-w-64"
          } ${searchContainerClassName}`}
          style={
            isCompactViewport && !isInlineLayout
              ? { width: "clamp(92px, 18vw, 150px)" }
              : undefined
          }
        >
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-root-accent/60"
          />
          <input
            type="search"
            aria-label={searchAriaLabel}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className={`h-9 w-full rounded-lg border border-root-accent/30 bg-[#051111] py-1 pl-8 pr-3 text-xs text-root-text placeholder-root-subtle transition-colors focus:border-root-accent focus:outline-none ${
              isCompactViewport
                ? "!h-[29px] !pl-[27px] !pr-[6px] !text-[10px]"
                : ""
            }`}
          />
        </div>
      )}
    </div>
  );
}
