'use client';

import React from 'react';

interface RootNotebookDecorationsProps {
    count?: number;
}

export function RootNotebookDecorations({ count = 11 }: RootNotebookDecorationsProps) {
    const ornaments = Array.from({ length: Math.max(0, Math.floor(count)) }, (_, index) => index);
    const railStyle: React.CSSProperties = {
        background: 'linear-gradient(90deg, var(--root-frame-rail-start), var(--root-frame-rail-middle), var(--root-frame-rail-end))',
    };
    const capStyle: React.CSSProperties = {
        backgroundColor: 'var(--root-frame-rail-cap)',
        border: '1px solid var(--root-frame-rail-cap-border)',
    };

    return (
        <>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-6 bottom-6 z-20 w-2.5 rounded-full shadow-md"
                style={railStyle}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[9px] top-[24px] z-[21] h-3.5 w-[18px] rounded-sm shadow"
                style={capStyle}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[9px] bottom-[24px] z-[21] h-3.5 w-[18px] rounded-sm shadow"
                style={capStyle}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[34px] top-10 bottom-10 z-30 flex flex-col items-center justify-between py-4"
            >
                {ornaments.map(index => (
                    <div
                        key={index}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-root-accent/20 bg-root-canvas shadow-inner"
                    >
                        <div className="h-1.5 w-1.5 rounded-full bg-root-surface" />
                    </div>
                ))}
            </div>
        </>
    );
}

export default RootNotebookDecorations;
