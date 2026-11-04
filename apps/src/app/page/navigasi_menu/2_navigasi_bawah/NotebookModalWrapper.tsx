'use client';

import React, { useEffect, useState } from 'react';
import { RootNotebookDecorations } from '@/app/page/root_modals_design_menu/RootNotebookDecorations';

export const MENU_INFO_MODAL_VISIBILITY_EVENT = 'neosantara_menu_info_modal_visibility';

interface NotebookModalWrapperProps {
  children: React.ReactNode;
  onClose?: () => void;
  ringCount?: number;
  maxWidthClass?: string;
  zIndexClass?: string;
  isHidden?: boolean;
  compact?: boolean;
  squareCorners?: boolean;
  hideWhenInfoModalOpen?: boolean;
}

export function NotebookModalWrapper({
  children,
  onClose,
  ringCount,
  maxWidthClass = 'max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl',
  zIndexClass = 'z-[60]',
  isHidden = false,
  compact = false,
  squareCorners = false,
  hideWhenInfoModalOpen = true,
}: NotebookModalWrapperProps) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const decorationsCount = ringCount ?? (compact ? 5 : 11);

  useEffect(() => {
    if (!hideWhenInfoModalOpen) return;

    const handleInfoModalVisibility = (event: Event) => {
      const { isOpen } = (event as CustomEvent<{ isOpen: boolean }>).detail;
      setIsInfoModalOpen(isOpen);
    };

    window.addEventListener(MENU_INFO_MODAL_VISIBILITY_EVENT, handleInfoModalVisibility);
    return () => window.removeEventListener(MENU_INFO_MODAL_VISIBILITY_EVENT, handleInfoModalVisibility);
  }, [hideWhenInfoModalOpen]);

  return (
    <div
      className={`notebook-modal-frame ${isHidden || (hideWhenInfoModalOpen && isInfoModalOpen) ? 'hidden' : ''} fixed inset-0 ${zIndexClass} flex items-center justify-center pt-[88px] sm:pt-[100px] lg:pt-[clamp(92px,10dvh,115px)] pb-3 sm:pb-4 lg:pb-5 px-3 sm:px-6 lg:px-10 font-sans pointer-events-none`}
    >
      {/* Notebook Outer Frame */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-root-canvas border-[6px] border-root-surface ${squareCorners ? 'rounded-none' : 'rounded-2xl'} w-full ${maxWidthClass} ${compact ? 'h-auto max-h-[calc(100dvh-100px)] sm:max-h-[calc(100dvh-116px)] lg:max-h-[calc(100dvh-112px)]' : 'h-full max-h-[calc(100dvh-100px)] sm:max-h-[calc(100dvh-116px)] lg:max-h-[calc(100dvh-112px)]'} shadow-2xl relative flex flex-col min-w-0 p-3 sm:p-4 pl-10 sm:pl-12 pointer-events-auto overflow-hidden`}
      >
        <RootNotebookDecorations count={decorationsCount} />

        {/* Main Panel Sheet — Green Theme */}
        <div className={`${compact ? 'flex-none' : 'flex-1'} min-w-0 bg-root-surface border-[3px] border-root-accent/20 ${squareCorners ? 'rounded-none' : 'rounded-r-xl'} shadow-inner relative flex flex-col overflow-hidden`}>
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

          {/* Render Actual Modal Children */}
          <div className={`${compact ? 'flex-none max-h-[calc(100dvh-160px)] overflow-y-auto' : 'flex-1 min-h-0 overflow-hidden'} flex flex-col min-w-0 relative z-10`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotebookModalWrapper;