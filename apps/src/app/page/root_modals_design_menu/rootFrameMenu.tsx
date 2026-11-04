'use client';

import React from 'react';
import { rootBorderRadius } from './rootBorderRadius';

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
    const ornaments = Array.from({ length: Math.max(0, ornamentCount) }, (_, index) => index);

    return (
        <div className={`paused-menu-frame fixed inset-0 ${zIndexClass} flex items-center justify-center pt-[88px] sm:pt-[100px] lg:pt-[clamp(92px,10dvh,115px)] pb-3 sm:pb-4 lg:pb-5 px-3 sm:px-6 lg:px-10  font-sans pointer-events-none select-none`}>
            <section className={`relative flex h-full max-h-[calc(100dvh-100px)] w-full min-w-0 flex-col overflow-hidden ${rootBorderRadius.frame} border-[6px] border-root-surface bg-root-canvas p-3 pl-10 shadow-2xl pointer-events-auto sm:max-h-[calc(100dvh-116px)] sm:p-4 sm:pl-12 lg:max-h-[calc(100dvh-112px)] max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl`}>
                <div
                    className="paused-menu-rail absolute left-3 top-6 bottom-6 z-20 w-2.5 rounded-full border border-root-canvas/80 shadow-md"
                    style={{
                        background: 'linear-gradient(90deg, var(--root-frame-rail-start), var(--root-frame-rail-middle), var(--root-frame-rail-end))',
                    }}
                />
                <div className="absolute left-[9px] top-[24px] z-[21] h-3.5 w-[18px] rounded-sm border border-root-canvas bg-root-surface shadow" />
                <div className="absolute left-[9px] bottom-[24px] z-[21] h-3.5 w-[18px] rounded-sm border border-root-canvas bg-root-surface shadow" />
                <div className="pointer-events-none absolute left-[34px] top-10 bottom-10 z-30 flex flex-col items-center justify-between py-4">
                    {ornaments.map(index => (
                        <div key={index} className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-root-accent/20 bg-root-canvas shadow-inner">
                            <div className="h-1.5 w-1.5 rounded-full bg-root-surface" />
                        </div>
                    ))}
                </div>
                <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-r-xl border-[3px] border-root-accent/20 bg-root-surface shadow-inner">
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