'use client';

import React from 'react';
import { rootBorderRadius } from './rootBorderRadius';
import { RootNotebookDecorations } from './RootNotebookDecorations';
import { useViewportMode } from '@/app/hooks/useViewportMode';

interface PausedMenuFrameProps {
    children: React.ReactNode;
    zIndexClass?: string;
    ornamentCount?: number;
}

export function PausedMenuFrame({
    children,
    zIndexClass = 'z-[99999999]',
    ornamentCount = 11,
}: PausedMenuFrameProps) {
    const viewportMode = useViewportMode();

    return (
        <div
            data-viewport-mode={viewportMode === 'desktop' ? undefined : viewportMode}
            className={`responsive-modal-frame paused-menu-frame fixed inset-0 ${zIndexClass} flex items-center justify-center font-sans pointer-events-auto select-none`}
        >
            <section className={`modal-responsive-shell relative flex min-w-0 flex-col overflow-hidden ${rootBorderRadius.frame} border-[6px] border-root-surface bg-root-canvas p-3 pl-10 shadow-2xl pointer-events-auto sm:p-4 sm:pl-12`}>
                <RootNotebookDecorations count={ornamentCount} />
                <div className="notebook-modal-sheet relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-r-xl border-[3px] border-root-accent/20 bg-root-surface shadow-inner">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.03)_0%,transparent_100%)]" />
                    <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
                        {children}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default PausedMenuFrame;