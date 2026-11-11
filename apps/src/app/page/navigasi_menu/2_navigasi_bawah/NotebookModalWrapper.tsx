'use client';

import React, { useEffect, useState } from 'react';
import { RootNotebookDecorations } from '@/app/page/root_modals_design_menu/RootNotebookDecorations';
import { useViewportMode } from '@/app/hooks/useViewportMode';

export const MENU_INFO_MODAL_VISIBILITY_EVENT = 'neosantara_menu_info_modal_visibility';

interface NotebookModalWrapperProps {
  children: React.ReactNode;
  onClose?: () => void;
  ringCount?: number;
  zIndexClass?: string;
  isHidden?: boolean;
  compact?: boolean;
  squareCorners?: boolean;
  hideWhenInfoModalOpen?: boolean;
  frameClassName?: string;
}

export function NotebookModalWrapper({
  children,
  onClose,
  ringCount,
  zIndexClass = 'z-[60]',
  isHidden = false,
  compact = false,
  squareCorners = false,
  hideWhenInfoModalOpen = true,
  frameClassName = '',
}: NotebookModalWrapperProps) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const decorationsCount = ringCount ?? (compact ? 5 : 11);
  const viewportMode = useViewportMode();

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
      data-viewport-mode={viewportMode === 'desktop' ? undefined : viewportMode}
      className={`responsive-modal-frame notebook-modal-frame ${frameClassName} ${isHidden || (hideWhenInfoModalOpen && isInfoModalOpen) ? 'hidden' : ''} fixed inset-0 ${zIndexClass} flex items-center justify-center font-sans pointer-events-auto`}
    >
      {/* Notebook Outer Frame */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`modal-responsive-shell bg-root-canvas border-[6px] border-root-surface ${squareCorners ? 'rounded-none' : 'rounded-2xl'} shadow-2xl relative flex flex-col min-w-0 p-3 sm:p-4 pl-10 sm:pl-12 pointer-events-auto overflow-hidden`}
      >
        <RootNotebookDecorations count={decorationsCount} />

        {/* Main Panel Sheet — Green Theme */}
        <div className={`notebook-modal-sheet flex-1 min-h-0 min-w-0 bg-root-surface border-[3px] border-root-accent/20 ${squareCorners ? 'rounded-none' : 'rounded-r-xl'} shadow-inner relative flex flex-col overflow-hidden`}>
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

          {/* Render Actual Modal Children */}
          <div className="notebook-modal-content flex-1 min-h-0 overflow-y-auto flex flex-col min-w-0 relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotebookModalWrapper;