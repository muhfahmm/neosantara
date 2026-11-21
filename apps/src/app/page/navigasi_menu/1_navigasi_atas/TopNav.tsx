'use client';

import { Crosshair, Map, Smile, type LucideIcon } from 'lucide-react';
import { useViewportMode } from '@/app/hooks/useViewportMode';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

interface TopNavProps {
  activeView: 'map' | 'diplomacy';
  onSelect: (view: 'map' | 'diplomacy') => void;
  onFocusHome: () => void;
}

export default function TopNav({ activeView, onSelect, onFocusHome }: TopNavProps) {
  const { t } = useLanguage();
  const viewportMode = useViewportMode();
  const isLandscapePhone = viewportMode === 'landscapePhone';
  const isPortraitPhone = viewportMode === 'portraitPhone';
  const isMobile = isLandscapePhone || isPortraitPhone;

  const handleSelect = (nextView: 'map' | 'diplomacy') => {
    onSelect(nextView);
  };

  const containerClasses = isLandscapePhone
    ? 'fixed left-1/2 z-[200] flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-root-accent/30 bg-root-surface/90 px-1 py-0.5 max-h-[38px]'
    : isPortraitPhone
    ? 'fixed left-1/2 z-[200] flex -translate-x-1/2 items-center gap-1 rounded-xl border border-root-accent/30 bg-root-surface/90 px-1.5 py-1 max-h-[44px]'
    : 'fixed bottom-[4.25rem] left-1/2 z-[200] flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-root-accent/30 bg-root-surface/90 px-1.5 py-1 lg:bottom-[4.5rem] lg:gap-1 lg:rounded-2xl lg:px-2 lg:py-1.5 xl:bottom-[5.25rem] 2xl:bottom-[7rem]';

  return (
    <div
      style={isMobile ? {
        bottom: 'calc(var(--safe-bottom) + var(--bottom-nav-height) + 0.45rem)',
      } : undefined}
      className={`${containerClasses} pointer-events-none`}
      role="group"
      aria-label={t('navbar.navigation.top.groupLabel')}
    >
      <NavButton
        label={t('navbar.navigation.top.map')}
        Icon={Map}
        active={activeView === 'map'}
        onClick={() => handleSelect('map')}
        isLandscapePhone={isLandscapePhone}
        isPortraitPhone={isPortraitPhone}
      />
      <NavButton
        label={t('navbar.navigation.top.diplomacy')}
        Icon={Smile}
        active={activeView === 'diplomacy'}
        onClick={() => handleSelect(activeView === 'diplomacy' ? 'map' : 'diplomacy')}
        isLandscapePhone={isLandscapePhone}
        isPortraitPhone={isPortraitPhone}
      />
      <NavButton
        label={t('navbar.navigation.top.focusHome')}
        Icon={Crosshair}
        active={false}
        onClick={onFocusHome}
        isLandscapePhone={isLandscapePhone}
        isPortraitPhone={isPortraitPhone}
      />
    </div>
  );
}

function NavButton({
  label,
  Icon,
  active,
  onClick,
  isLandscapePhone = false,
  isPortraitPhone = false,
}: {
  label: string;
  Icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  isLandscapePhone?: boolean;
  isPortraitPhone?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`pointer-events-auto flex cursor-pointer items-center justify-center rounded-lg transition-all ${
        isLandscapePhone
          ? 'px-1.5 py-1 min-h-[30px]'
          : isPortraitPhone
          ? 'px-2 py-1.5 min-h-[34px]'
          : 'px-2 py-1.5 lg:px-2.5 lg:py-2 2xl:px-4 2xl:py-3'
      } ${
        active
          ? 'bg-root-accent text-root-canvas font-bold border border-root-accent'
          : 'text-root-subtle hover:bg-root-accent/10 hover:text-root-accent'
      }`}
    >
      <Icon
        className={`${
          isLandscapePhone
            ? 'h-3 w-3'
            : isPortraitPhone
            ? 'h-3.5 w-3.5'
            : 'h-3.5 w-3.5 lg:h-4 lg:w-4 2xl:h-5 2xl:w-5'
        } ${active ? 'text-root-canvas' : ''}`}
      />
    </button>
  );
}