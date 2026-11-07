'use client';

import { useSyncExternalStore } from 'react';

export type ViewportMode = 'desktop' | 'landscapePhone' | 'portraitPhone';

const LANDSCAPE_PHONE_QUERY = '(orientation: landscape) and (max-height: 500px)';
const PORTRAIT_PHONE_QUERY = '(orientation: portrait) and (max-width: 640px)';

function getSnapshot(): ViewportMode {
  if (typeof window === 'undefined') return 'desktop';
  if (window.matchMedia(LANDSCAPE_PHONE_QUERY).matches) {
    return 'landscapePhone';
  }
  if (window.matchMedia(PORTRAIT_PHONE_QUERY).matches) {
    return 'portraitPhone';
  }
  return 'desktop';
}

function getServerSnapshot(): ViewportMode {
  return 'desktop';
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mqlLandscape = window.matchMedia(LANDSCAPE_PHONE_QUERY);
  const mqlPortrait = window.matchMedia(PORTRAIT_PHONE_QUERY);

  mqlLandscape.addEventListener('change', callback);
  mqlPortrait.addEventListener('change', callback);
  window.addEventListener('resize', callback);
  window.addEventListener('orientationchange', callback);

  return () => {
    mqlLandscape.removeEventListener('change', callback);
    mqlPortrait.removeEventListener('change', callback);
    window.removeEventListener('resize', callback);
    window.removeEventListener('orientationchange', callback);
  };
}

export function useViewportMode(): ViewportMode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function isMobilePhone(mode: ViewportMode): boolean {
  return mode === 'landscapePhone' || mode === 'portraitPhone';
}

