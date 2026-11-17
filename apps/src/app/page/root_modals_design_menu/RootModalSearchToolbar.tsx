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
}

export default function RootModalSearchToolbar({
  items,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
}: RootModalSearchToolbarProps) {
  const isCompactViewport = useViewportMode() !== "desktop";
  const compactTabClassName =
    "!min-w-0 !px-1.5 !py-[5px] !text-[9px] !tracking-[0.04em]";

  return (
    <div
      className={`flex shrink-0 border-b border-root-accent/20 bg-root-canvas ${
        isCompactViewport
          ? "flex-row flex-nowrap items-center gap-[5px] px-2 py-1.5"
          : "flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      }`}
    >
      <RootModalTabs
        compact
        className={`w-fit ${
          isCompactViewport
            ? "!h-auto !flex-[0_1_auto] !flex-nowrap !gap-0.5 !p-[3px] [&_svg]:!h-[13px] [&_svg]:!w-[13px]"
            : ""
        }`}
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

      <div
        className={`relative ${
          isCompactViewport
            ? "min-w-[92px] flex-[0_1_150px]"
            : "w-full sm:max-w-64"
        }`}
        style={
          isCompactViewport
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
    </div>
  );
}
