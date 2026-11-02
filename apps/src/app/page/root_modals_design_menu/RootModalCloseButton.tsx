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
            className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] p-1.5 text-xs font-bold uppercase text-[#6B8A8A] transition-all hover:border-[#00FFAA] hover:text-[#00FFAA] sm:p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFAA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1A1A] ${className}`}
        >
            <span className="pl-1 text-xs font-semibold uppercase tracking-widest">Tutup</span>
            <X className="h-4 w-4" />
        </button>
    );
}

export default RootModalCloseButton;
