'use client';

import { Crosshair, Map, Smile, type LucideIcon } from 'lucide-react';
import { useViewportMode } from '@/app/hooks/useViewportMode';

interface TopNavProps {
  activeView: 'map' | 'diplomacy';
  onSelect: (view: 'map' | 'diplomacy') => void;
  onFocusHome: () => void;
}

export default function TopNav({ activeView, onSelect, onFocusHome }: TopNavProps) {
  const viewportMode = useViewportMode();
  const isLandscapePhone = viewportMode === 'landscapePhone';
  const isPortraitPhone = viewportMode === 'portraitPhone';
  const isMobile = isLandscapePhone || isPortraitPhone;

  const handleSelect = (nextView: 'map' | 'diplomacy') => {
    onSelect(nextView);
  };

  const containerClasses = isLandscapePhone
    ? 'fixed left-1/2 z-[200] grid -translate-x-1/2 grid-cols-2 items-start gap-1'
    : isPortraitPhone
    ? 'fixed left-1/2 z-[200] grid -translate-x-1/2 grid-cols-2 items-start gap-1'
    : 'fixed bottom-[4.25rem] left-1/2 z-[200] flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-root-accent/30 bg-root-surface/90 px-1.5 py-1 shadow-lg lg:bottom-[4.5rem] lg:gap-1 lg:rounded-2xl lg:px-2 lg:py-1.5 xl:bottom-[5.25rem] 2xl:bottom-[7rem]';

  return (
    <div
      style={isMobile ? {
        bottom: 'calc(var(--safe-bottom) + var(--bottom-nav-height) + 1rem)',
      } : undefined}
      className={`${containerClasses} pointer-events-none`}
      role="group"
      aria-label="Navigasi tampilan peta"
    >
      <NavButton
        label="Peta Taktis"
        Icon={Map}
        active={activeView === 'map'}
        onClick={() => handleSelect('map')}
        isCompact={isMobile}
      />
      <NavButton
        label="Hubungan Diplomatik"
        Icon={Smile}
        active={activeView === 'diplomacy'}
        onClick={() => handleSelect(activeView === 'diplomacy' ? 'map' : 'diplomacy')}
        isCompact={isMobile}
      />
      <NavButton
        label="Fokus & Zoom ke Negara Sendiri"
        Icon={Crosshair}
        active={false}
        onClick={onFocusHome}
        isCompact={isMobile}
      />
    </div>
  );
}

function NavButton({
  label,
  Icon,
  active,
  onClick,
  isCompact = false,
}: {
  label: string;
  Icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  isCompact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      title={label}
      className={`pointer-events-auto flex cursor-pointer items-center justify-center rounded-lg transition-all ${
        isCompact
          ? 'h-11 w-11 rounded-xl border border-root-accent/30 bg-root-surface/90 shadow-lg'
          : 'px-2 py-1.5 lg:px-2.5 lg:py-2 2xl:px-4 2xl:py-3'
      } ${
        active
          ? 'bg-root-accent text-root-canvas font-bold'
          : 'text-root-subtle hover:bg-root-accent/10 hover:text-root-accent'
      }`}
    >
      <Icon className={isCompact ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5'} />
    </button>
  );
}