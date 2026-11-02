'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { tutorialRegistry } from './tutorialRegistry';
import {
  getTutorialProgress,
  getTutorialProgressSnapshot,
  setTutorialProgress,
  subscribeTutorialProgress,
  TUTORIAL_START_EVENT,
} from './tutorialProgress';
import type { TutorialPlacement } from './tutorialTypes';

interface TutorialOverlayProps {
  autoStart?: boolean;
  suppressAutoStart?: boolean;
}

interface TargetRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

interface OverlayLayout {
  targets: TargetRect[];
  card: { top: number; left: number; placement: TutorialPlacement };
}

const CARD_WIDTH = 360;
const CARD_HEIGHT = 270;
const SPOTLIGHT_PADDING = 8;
const subscribeToMount = () => () => {};
const getClientMountSnapshot = () => true;
const getServerMountSnapshot = () => false;

function findTargets(selector: string | undefined): Element[] {
  if (!selector) return [];
  try {
    return Array.from(document.querySelectorAll(selector));
  } catch (error) {
    console.error(`Invalid tutorial target selector "${selector}":`, error);
    return [];
  }
}

function calculateLayout(
  targets: TargetRect[],
  preferredPlacement: TutorialPlacement,
  cardHeight: number,
): OverlayLayout['card'] {
  const cardWidth = Math.min(CARD_WIDTH, window.innerWidth - 32);
  const effectiveCardHeight = Math.min(cardHeight, window.innerHeight - 32);
  const maxLeft = Math.max(16, window.innerWidth - cardWidth - 16);
  const maxTop = Math.max(16, window.innerHeight - effectiveCardHeight - 16);

  if (targets.length === 0 || preferredPlacement === 'center') {
    return {
      top: Math.min(maxTop, Math.max(16, (window.innerHeight - effectiveCardHeight) / 2)),
      left: Math.min(maxLeft, Math.max(16, (window.innerWidth - cardWidth) / 2)),
      placement: 'center',
    };
  }

  // Abaikan elemen yang mencakup hampir seluruh layar (seperti canvas peta) saat menghitung posisi kartu
  const positioningTargets = targets.filter(
    t => t.width < window.innerWidth * 0.85 || t.height < window.innerHeight * 0.7,
  );

  if (positioningTargets.length === 0) {
    return {
      top: Math.min(maxTop, Math.max(16, (window.innerHeight - effectiveCardHeight) / 2)),
      left: Math.min(maxLeft, Math.max(16, (window.innerWidth - cardWidth) / 2)),
      placement: 'center',
    };
  }

  // Gabungkan bounding box target agar kartu tidak menutupi bagian lain dari grup kontrol (misal Time Controller)
  const combinedLeft = Math.min(...positioningTargets.map(t => t.left));
  const combinedTop = Math.min(...positioningTargets.map(t => t.top));
  const combinedRight = Math.max(...positioningTargets.map(t => t.right));
  const combinedBottom = Math.max(...positioningTargets.map(t => t.bottom));
  const target: TargetRect = {
    top: combinedTop,
    right: combinedRight,
    bottom: combinedBottom,
    left: combinedLeft,
    width: combinedRight - combinedLeft,
    height: combinedBottom - combinedTop,
  };

  const gap = 16;
  let placement = preferredPlacement;
  let top = target.top;
  let left = target.right + gap;

  if (placement === 'left') {
    left = target.left - cardWidth - gap;
    top = target.bottom - effectiveCardHeight;
  }
  if (placement === 'top') {
    top = target.top - effectiveCardHeight - gap;
    left = target.left + (target.width - cardWidth) / 2;
  }
  if (placement === 'bottom') {
    top = target.bottom + gap;
    left = target.left + (target.width - cardWidth) / 2;
  }
  if (placement === 'right') left = target.right + gap;

  if ((placement === 'left' || placement === 'right') && (left + cardWidth > window.innerWidth - 16 || left < 16)) {
    placement = target.left + target.width / 2 < window.innerWidth / 2 ? 'right' : 'left';
    left = placement === 'right' ? target.right + gap : target.left - cardWidth - gap;
  }
  if ((placement === 'top' || placement === 'bottom') && (top + effectiveCardHeight > window.innerHeight - 16 || top < 16)) {
    placement = target.top + target.height / 2 < window.innerHeight / 2 ? 'bottom' : 'top';
    top = placement === 'bottom' ? target.bottom + gap : target.top - effectiveCardHeight - gap;
  }

  return {
    top: Math.min(Math.max(16, top), maxTop),
    left: Math.min(Math.max(16, left), maxLeft),
    placement,
  };
}

export function TutorialOverlay({
  autoStart = false,
  suppressAutoStart = false,
}: TutorialOverlayProps) {
  const mounted = useSyncExternalStore(subscribeToMount, getClientMountSnapshot, getServerMountSnapshot);
  const progress = useSyncExternalStore(
    subscribeTutorialProgress,
    getTutorialProgressSnapshot,
    getTutorialProgressSnapshot,
  );
  const [layout, setLayout] = useState<OverlayLayout | null>(null);
  const [manualStartAllowed, setManualStartAllowed] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const lastMeasuredHeightRef = useRef<number>(CARD_HEIGHT);

  useEffect(() => {
    const onManualStart = () => {
      setManualStartAllowed(true);
    };
    window.addEventListener(TUTORIAL_START_EVENT, onManualStart);
    return () => {
      window.removeEventListener(TUTORIAL_START_EVENT, onManualStart);
    };
  }, []);

  useEffect(() => {
    if (suppressAutoStart) return;
    if (autoStart) {
      const current = getTutorialProgress();
      if (current.status !== 'in_progress') {
        setTutorialProgress({ stepIndex: 0, status: 'in_progress' });
      }
      return;
    }

  }, [autoStart, suppressAutoStart]);

  const active = progress.status === 'in_progress'
    && (!suppressAutoStart || manualStartAllowed || autoStart);
  const step = tutorialRegistry[progress.stepIndex];

  const updateLayout = useCallback(() => {
    if (!active || !step || !mounted) return;

    const elements = findTargets(step.targetSelector);
    const targets = elements.map(element => {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top - SPOTLIGHT_PADDING,
        right: rect.right + SPOTLIGHT_PADDING,
        bottom: rect.bottom + SPOTLIGHT_PADDING,
        left: rect.left - SPOTLIGHT_PADDING,
        width: rect.width + SPOTLIGHT_PADDING * 2,
        height: rect.height + SPOTLIGHT_PADDING * 2,
      };
    });
    const measuredHeight = cardRef.current?.offsetHeight || lastMeasuredHeightRef.current;
    lastMeasuredHeightRef.current = measuredHeight;
    const card = calculateLayout(targets, step.placement || 'right', measuredHeight);
    setLayout({ targets, card });
  }, [active, mounted, step]);

  useEffect(() => {
    if (!active || !mounted) return;
    let frameId: number | null = null;
    const scheduleLayoutUpdate = () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateLayout();
      });
    };
    scheduleLayoutUpdate();
    window.addEventListener('resize', scheduleLayoutUpdate);
    window.addEventListener('scroll', scheduleLayoutUpdate, true);
    const observer = new MutationObserver(records => {
      if (records.some(record => !(record.target instanceof Element) || !record.target.closest('[data-tutorial-overlay]'))) {
        scheduleLayoutUpdate();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener('resize', scheduleLayoutUpdate);
      window.removeEventListener('scroll', scheduleLayoutUpdate, true);
      observer.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [active, mounted, updateLayout]);

  useEffect(() => {
    if (!active || !mounted || !layout) return;
    const currentHeight = cardRef.current?.offsetHeight;
    if (currentHeight && Math.abs(currentHeight - lastMeasuredHeightRef.current) > 2) {
      updateLayout();
    }
  }, [active, mounted, layout, progress.stepIndex, updateLayout]);

  const finish = useCallback((status: 'completed' | 'skipped') => {
    setTutorialProgress({ stepIndex: progress.stepIndex, status });
  }, [progress.stepIndex]);

  const next = useCallback(() => {
    if (progress.stepIndex >= tutorialRegistry.length - 1) {
      finish('completed');
      return;
    }
    setTutorialProgress({ stepIndex: progress.stepIndex + 1, status: 'in_progress' });
  }, [finish, progress.stepIndex]);

  const previous = useCallback(() => {
    if (progress.stepIndex > 0) {
      setTutorialProgress({ stepIndex: progress.stepIndex - 1, status: 'in_progress' });
    }
  }, [progress.stepIndex]);

  const skip = useCallback(() => finish('skipped'), [finish]);

  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        skip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, skip]);

  if (!mounted || !active || !step) return null;
  if (!layout) return null;

  return createPortal(
    <div data-tutorial-overlay className="fixed inset-0 z-[100000000] pointer-events-none font-sans">
      <svg className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true">
        {layout.targets.map((rect, index) => (
          <rect
            key={`${rect.left}-${rect.top}-${index}`}
            x={rect.left}
            y={rect.top}
            width={rect.width}
            height={rect.height}
            rx="12"
            fill="none"
            stroke="#00FFAA"
            strokeWidth="2"
            className="drop-shadow-[0_0_10px_#00FFAA]"
          />
        ))}
      </svg>

      <section
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-body"
        aria-live="polite"
        className="pointer-events-auto absolute max-h-[calc(100vh-32px)] w-[min(360px,calc(100vw-32px))] overflow-y-auto rounded-2xl border border-[#00FFAA]/50 bg-[#0F2424] p-5 text-[#E0E0E0] shadow-[0_0_36px_rgba(0,255,170,0.2)]"
        style={{ top: layout.card.top, left: layout.card.left }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00FFAA]">
            Langkah {progress.stepIndex + 1} dari {tutorialRegistry.length}
          </p>
          <button
            type="button"
            onClick={skip}
            className="rounded-lg px-2 py-1 text-xs font-bold text-[#6B8A8A] hover:text-[#00FFAA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FFAA]"
          >
            Lewati
          </button>
        </div>
        <h2 id="tutorial-title" className="mb-2 text-lg font-black text-[#00FFAA]">
          {step.title}
        </h2>
        <p id="tutorial-body" className="text-sm leading-relaxed text-[#E0E0E0]">
          {step.body}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={previous}
            disabled={progress.stepIndex === 0}
            className="rounded-lg border border-[#00FFAA]/25 px-3 py-2 text-xs font-bold text-[#6B8A8A] hover:border-[#00FFAA]/60 hover:text-[#00FFAA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FFAA] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-[#00FFAA] px-4 py-2 text-xs font-black text-[#0A1A1A] hover:bg-[#00FFAA]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FFAA]"
          >
            Lanjut
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
