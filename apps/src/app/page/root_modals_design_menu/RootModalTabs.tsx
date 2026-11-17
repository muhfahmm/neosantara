'use client';

import React from 'react';

export interface RootModalTabItem {
  label: string;
  isActive: boolean;
  onClick?: () => void;
  onMouseDown?: () => void;
  onPointerDown?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

interface RootModalTabsProps {
  items: RootModalTabItem[];
  className?: string;
}

export function RootModalTabs({ items, className = '' }: RootModalTabsProps) {
  return (
    <div className={`root-modal-tabs inline-flex max-w-full flex-wrap items-center rounded-lg border border-root-accent/20 bg-root-canvas ${className}`}>
      {items.map(item => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          onMouseDown={item.onMouseDown}
          onPointerDown={item.onPointerDown}
          onTouchEnd={(e) => {
            if (item.onClick) {
              e.preventDefault();
              item.onClick();
            }
          }}
          aria-pressed={item.isActive}
          className={`root-modal-tab-button inline-flex items-center justify-center whitespace-nowrap rounded-md text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-accent/40 ${
            item.isActive
              ? 'bg-root-accent text-root-accent-ink'
              : 'text-root-subtle hover:bg-root-surface hover:text-root-text'
          } ${item.className ?? ''}`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default RootModalTabs;