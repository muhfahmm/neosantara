'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PausedMenuHeaderProps {
    title: string;
    onBack?: () => void;
    backLabel?: string;
    rightContent?: React.ReactNode;
}

export function PausedMenuHeader({
    title,
    onBack,
    backLabel = 'Kembali',
    rightContent,
}: PausedMenuHeaderProps) {
    return (
        <header className="mb-4 flex shrink-0 items-center justify-between gap-3 border-b border-root-accent/20 pb-3 text-left">
            <div className="flex min-w-0 items-center gap-2">
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        aria-label={backLabel}
                        className="shrink-0 cursor-pointer rounded p-1 text-root-subtle transition-all hover:bg-root-accent/10 hover:text-root-accent"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                )}
                <h2 className="truncate text-sm font-extrabold uppercase tracking-wider text-root-accent">
                    {title}
                </h2>
            </div>
            {rightContent}
        </header>
    );
}

export default PausedMenuHeader;
