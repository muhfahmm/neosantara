'use client';

import { useState, useEffect } from 'react';
import { Map, Smile, type LucideIcon } from 'lucide-react';

interface TopNavProps {
  activeView: 'map' | 'diplomacy';
  onSelect: (view: 'map' | 'diplomacy') => void;
}

export default function TopNav({ activeView, onSelect }: TopNavProps) {
  const [localActiveView, setLocalActiveView] = useState<'map' | 'diplomacy'>(activeView);

  useEffect(() => {
    setLocalActiveView(activeView);
  }, [activeView]);

  const handleSelect = (nextView: 'map' | 'diplomacy') => {
    setLocalActiveView(nextView);
    onSelect(nextView);
  };

  return (
    <div
      className="fixed bottom-[4.25rem] left-1/2 z-[200] flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-root-accent/30 bg-root-surface/90 px-1.5 py-1 shadow-lg  lg:bottom-[4.5rem] lg:gap-1 lg:rounded-2xl lg:px-2 lg:py-1.5 xl:bottom-[5.25rem] 2xl:bottom-[7rem]"
      role="group"
      aria-label="Navigasi tampilan peta"
    >
      <NavButton
        label="Peta Taktis"
        Icon={Map}
        active={localActiveView === 'map'}
        onClick={() => handleSelect('map')}
      />
      <NavButton
        label="Hubungan Diplomatik"
        Icon={Smile}
        active={localActiveView === 'diplomacy'}
        onClick={() => handleSelect(localActiveView === 'diplomacy' ? 'map' : 'diplomacy')}
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
          ? 'bg-root-accent text-root-canvas font-bold'
          : 'text-root-subtle hover:bg-root-accent/10 hover:text-root-accent'
      }`}
    >
      <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5" />
    </button>
  );
}