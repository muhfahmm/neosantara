'use client';

import React from 'react';
import { rootBorderRadius } from './rootBorderRadius';

export interface RootModalSidebarItem {
  id: string;
  isActive: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}

interface RootModalSidebarLayoutProps {
  items: RootModalSidebarItem[];
  children: React.ReactNode;
  ariaLabel: string;
  activeItemId?: string;
  scrollKey?: string | number | boolean;
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
}

export default function RootModalSidebarLayout({
  items,
  children,
  ariaLabel,
  activeItemId,
  scrollKey,
  className = '',
  sidebarClassName = '',
  contentClassName = '',
}: RootModalSidebarLayoutProps) {
  const activeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    activeButtonRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [activeItemId, scrollKey]);

  return (
    <div className={`relative z-10 flex min-h-0 min-w-0 flex-1 ${className}`}>
      <nav
        aria-label={ariaLabel}
        className={`flex w-40 shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-root-accent/30 bg-root-canvas p-2 neon-scrollbar sm:w-44 sm:p-3 lg:w-48 ${sidebarClassName}`}
      >
        {items.map((item) => (
          <button
            key={item.id}
            ref={item.id === activeItemId ? activeButtonRef : undefined}
            type="button"
            aria-current={item.isActive ? 'page' : undefined}
            onClick={item.onSelect}
            className={`flex min-h-[29px] w-full items-center gap-2 border px-2 py-1.5 text-left transition-all cursor-pointer sm:min-h-[33px] sm:px-2.5 sm:py-2 ${rootBorderRadius.card} ${
              item.isActive
                ? 'border-root-accent bg-root-accent text-root-canvas font-black shadow-md'
                : 'border-root-accent/20 bg-root-surface text-root-text hover:border-root-accent hover:text-root-accent'
            } ${item.description ? 'items-start' : ''}`}
          >
            {item.icon}
            <span className={`min-w-0 flex-1 ${item.description ? 'flex flex-col' : 'truncate'}`}>
              <span className="truncate text-[10px] font-bold uppercase tracking-wider lg:text-[11px]">
                {item.label}
              </span>
              {item.description && (
                <span className={`mt-0.5 text-[8px] lg:text-[10px] ${item.isActive ? 'text-root-canvas/80 font-semibold' : 'text-root-subtle'}`}>
                  {item.description}
                </span>
              )}
            </span>
            {item.trailing}
          </button>
        ))}
      </nav>
      <main className={`min-h-0 min-w-0 flex-1 overflow-y-auto bg-root-surface neon-scrollbar ${contentClassName}`}>
        {children}
      </main>
    </div>
  );
}
