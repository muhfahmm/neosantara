'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useViewportMode } from '@/app/hooks/useViewportMode';

export interface TutorialWelcomeModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onSkip: () => void;
  playerName?: string;
  advisorImageSrc?: string;
}

export function TutorialWelcomeModal({
  isOpen,
  onContinue,
  onSkip,
  playerName = 'Presiden',
  advisorImageSrc = '/images/game/buildings/introduction/introduction.svg',
}: TutorialWelcomeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const labelId = useId();
  const viewportMode = useViewportMode();
  const isLandscapePhone = viewportMode === 'landscapePhone';
  const isPortraitPhone = viewportMode === 'portraitPhone';
  const imageClass = isLandscapePhone
    ? 'w-28 max-h-[70vh] origin-bottom scale-[1.8]'
    : isPortraitPhone
    ? 'w-32 max-h-[55vh] origin-bottom scale-150'
    : 'w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 max-h-[55vh] origin-bottom';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setImageFailed(false);
  }, [advisorImageSrc]);

  useEffect(() => {
    if (!isOpen || !mounted) return;
    const timer = window.requestAnimationFrame(() => {
      continueButtonRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(timer);
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!isOpen || !mounted) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onSkip();
      } else if (event.key === 'Enter') {
        const active = document.activeElement;
        if (active instanceof HTMLButtonElement && active !== continueButtonRef.current) {
          return;
        }
        event.preventDefault();
        onContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mounted, onContinue, onSkip]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="tutorial-welcome-overlay fixed inset-0 z-[1000] pointer-events-none flex items-end justify-center px-3 sm:px-6 pb-20 sm:pb-24 lg:pb-28 font-sans">
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={labelId}
        className={`tutorial-welcome-dialog pointer-events-auto relative flex items-end justify-center gap-2 sm:gap-4 w-full animate-in fade-in slide-in-from-bottom-3 duration-300 ${
          isLandscapePhone ? 'max-w-[88vw]' : isPortraitPhone ? 'max-w-[calc(100vw-1.5rem)]' : 'max-w-4xl'
        }`}
      >
        {!imageFailed && (
          <img
            src={advisorImageSrc}
            alt="Penasihat Negara"
            onError={() => setImageFailed(true)}
            className={`${imageClass} object-contain object-bottom shrink-0 select-none pointer-events-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)]`}
          />
        )}

        <div className={`relative flex-1 min-w-0 rounded-2xl border border-root-accent/30 bg-root-surface text-root-text shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_24px_rgba(0,255,170,0.12)] ${
          isLandscapePhone ? 'p-2' : 'p-3 sm:p-4'
        }`}>
          {/* Segitiga / ekor dialog menunjuk ke kiri ke arah karakter */}
          <svg
            aria-hidden="true"
            viewBox="0 0 12 20"
            className="pointer-events-none absolute -left-[11px] bottom-7 h-5 w-3 overflow-visible"
          >
            <path
              d="M 12 1 L 1 10 L 12 19 Z"
              fill="#0D2020"
            />
            <path
              d="M 12 1 L 1 10 L 12 19"
              fill="none"
              stroke="rgba(0, 255, 170, 0.3)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>

          <p
            id={labelId}
            className="text-sm sm:text-[15px] leading-relaxed font-medium text-root-text"
          >
            Selamat datang, {playerName}. Hari ini adalah hari pertama Anda sebagai kepala negara.
          </p>

          <div className={`${isLandscapePhone ? 'mt-1 pt-1' : 'mt-2 pt-2'} border-t border-root-accent/20 flex items-center justify-end gap-3 sm:gap-4`}>
            <button
              type="button"
              onClick={onSkip}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-root-subtle hover:text-root-text transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-root-accent"
            >
              AKHIRI
            </button>
            <button
              ref={continueButtonRef}
              type="button"
              onClick={onContinue}
              className="px-4 sm:px-5 py-2 rounded-lg bg-root-accent hover:bg-root-accent/85 active:scale-[0.98] text-xs sm:text-sm font-black text-root-canvas tracking-wide transition-all cursor-pointer shadow-[0_0_16px_rgba(0,255,170,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-root-accent"
            >
              LANJUT
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default TutorialWelcomeModal;
