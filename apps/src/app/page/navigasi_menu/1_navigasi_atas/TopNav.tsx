'use client';

import { Map, Smile, type LucideIcon } from 'lucide-react';

interface TopNavProps {
  activeView: 'map' | 'diplomacy';
  onSelect: (view: 'map' | 'diplomacy') => void;
}

export default function TopNav({ activeView, onSelect }: TopNavProps) {
  return (
    <div
      className="fixed bottom-[4.25rem] left-1/2 z-[200] flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424]/90 px-1.5 py-1 shadow-lg backdrop-blur-md lg:bottom-[4.5rem] lg:gap-1 lg:rounded-2xl lg:px-2 lg:py-1.5 xl:bottom-[5.25rem] 2xl:bottom-[7rem]"
      role="group"
      aria-label="Navigasi tampilan peta"
    >
      <NavButton
        label="Peta Taktis"
        Icon={Map}
        active={activeView === 'map'}
        onClick={() => onSelect('map')}
      />
      <NavButton
        label="Hubungan Diplomatik"
        Icon={Smile}
        active={activeView === 'diplomacy'}
        onClick={() => onSelect(activeView === 'diplomacy' ? 'map' : 'diplomacy')}
      />
    </div>
  );
}

function NavButton({
  label,
  Icon,
  active,
  onClick,
}: {
  label: string;
  Icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      title={label}
      className={`flex cursor-pointer items-center justify-center rounded-lg px-2 py-1.5 transition-all lg:px-2.5 lg:py-2 2xl:px-4 2xl:py-3 ${
        active
          ? 'bg-[#00FFAA] text-[#0A1A1A] font-bold'
          : 'text-[#6B8A8A] hover:bg-[#00FFAA]/10 hover:text-[#00FFAA]'
      }`}
    >
      <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5" />
    </button>
  );
}