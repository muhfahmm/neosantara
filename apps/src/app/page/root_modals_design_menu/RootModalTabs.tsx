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
  compact?: boolean;
}

export function RootModalTabs({ items, className = '', compact = false }: RootModalTabsProps) {
  return (
    <div className={`inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-root-accent/30 bg-root-surface p-1 ${compact ? 'h-9' : ''} ${className}`}>
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
          className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3.5 ${compact ? 'py-1' : 'py-2'} text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
            item.isActive
              ? 'bg-root-accent text-root-canvas'
              : 'text-root-subtle hover:text-root-text hover:ring-1 hover:ring-inset hover:ring-root-accent/40'
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