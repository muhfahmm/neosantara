'use client';

import React from 'react';

export interface RootModalTabItem {
  label: string;
  isActive: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

interface RootModalTabsProps {
  items: RootModalTabItem[];
  className?: string;
  compact?: boolean;
}

export function RootModalTabs({ items, className = '', compact = false }: RootModalTabsProps) {
  return (
    <div className={`inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] p-1 ${compact ? 'h-9' : ''} ${className}`}>
      {items.map(item => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          aria-pressed={item.isActive}
          className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3.5 ${compact ? 'py-1' : 'py-2'} text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
            item.isActive
              ? 'bg-[#00FFAA] text-[#0A1A1A]'
              : 'text-[#6B8A8A] hover:text-[#E0E0E0] hover:ring-1 hover:ring-inset hover:ring-[#00FFAA]/40'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default RootModalTabs;
