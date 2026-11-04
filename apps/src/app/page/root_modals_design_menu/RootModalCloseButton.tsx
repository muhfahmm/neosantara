'use client';

import React from 'react';
import { X } from 'lucide-react';

interface RootModalCloseButtonProps {
    onClick?: () => void;
    className?: string;
}

export function RootModalCloseButton({ onClick, className = '' }: RootModalCloseButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Tutup Modal"
            className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-root-accent/30 bg-root-surface p-1.5 text-xs font-bold uppercase text-root-subtle transition-all hover:border-root-accent hover:text-root-accent sm:p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-accent focus-visible:ring-offset-2 focus-visible:ring-offset-root-canvas ${className}`}
        >
            <span className="pl-1 text-xs font-semibold uppercase tracking-widest">Tutup</span>
            <X className="h-4 w-4" />
        </button>
    );
}

export default RootModalCloseButton;