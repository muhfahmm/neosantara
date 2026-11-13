"use client";

import React from "react";
import { rootBorderRadius } from "./rootBorderRadius";

interface BuildingCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  highlighted?: boolean;
  unavailable?: boolean;
}

interface BuildingCardGridRootProps {
  children: React.ReactNode;
  className?: string;
}

export function BuildingCardRoot({
  children,
  className = "",
  highlighted = false,
  unavailable = false,
  ...props
}: BuildingCardRootProps) {
  return (
    <div
      {...props}
      className={`building-card-root relative flex min-w-0 flex-col justify-between overflow-visible border ${rootBorderRadius.card} bg-root-canvas shadow-sm transition-all ${
        unavailable
          ? "border-rose-500/30 bg-rose-500/10 opacity-70"
          : "border-root-accent/20 hover:border-root-accent/50 hover:shadow-md"
      } ${highlighted ? "border-root-accent border-2 shadow-[0_0_12px_rgba(0,255,170,0.3)]" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function BuildingCardGridRoot({ children, className = "" }: BuildingCardGridRootProps) {
  return (
    <div className={`building-card-grid-root grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-2 max-w-full ${className}`}>
      {children}
    </div>
  );
}
