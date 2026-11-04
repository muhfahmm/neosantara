'use client';

import React from 'react';
import { rootBorderRadius } from './rootBorderRadius';

interface PausedMenuFrameProps {
    children: React.ReactNode;
    zIndexClass?: string;
}

export function PausedMenuFrame({
    children,
    zIndexClass = 'z-[99999999]',
}: PausedMenuFrameProps) {
    return (
        <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center pt-[88px] sm:pt-[100px] lg:pt-[clamp(92px,10dvh,115px)] pb-3 sm:pb-4 lg:pb-5 px-3 sm:px-6 lg:px-10  font-sans pointer-events-none select-none`}>
            <section className={`relative flex h-full max-h-[calc(100dvh-100px)] w-full min-w-0 flex-col overflow-hidden ${rootBorderRadius.frame} border-[6px] border-root-surface bg-root-canvas p-3 pl-10 shadow-2xl pointer-events-auto sm:max-h-[calc(100dvh-116px)] sm:p-4 sm:pl-12 lg:max-h-[calc(100dvh-112px)] max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl`}>
                <div className="absolute left-3 top-6 bottom-6 z-20 w-2 rounded-full border border-root-canvas/80 bg-gradient-to-r from-[#2A3F3F] via-[#3D5252] to-[#1F3030] shadow-md sm:left-3.5 sm:w-2.5" />
                <div className="absolute left-[8px] top-[24px] z-[21] h-3.5 w-[16px] rounded-sm border border-root-canvas bg-root-surface shadow sm:left-[10px] sm:w-[18px]" />
                <div className="absolute left-[8px] bottom-[24px] z-[21] h-3.5 w-[16px] rounded-sm border border-root-canvas bg-root-surface shadow sm:left-[10px] sm:w-[18px]" />
                <div className="pointer-events-none absolute left-[22px] top-10 bottom-10 z-30 flex flex-col items-center justify-between py-4 sm:left-[26px]">
                    {[...Array(11)].map((_, index) => (
                        <div key={index} className="flex h-3 w-3 items-center justify-center rounded-full border border-root-accent/20 bg-root-canvas shadow-inner sm:h-3.5 sm:w-3.5">
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