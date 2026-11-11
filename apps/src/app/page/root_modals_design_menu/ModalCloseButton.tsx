'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface ModalCloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    ariaLabel?: string;
    appearance?: 'standard' | 'icon' | 'custom';
}

function getBorderOnlyHoverClasses(className: string) {
    const nonBorderHoverClasses = className
        .split(/\s+/)
        .filter((classToken) => !/(?:^|:)hover:!?((?:bg|text)-)/.test(classToken));

    return [...nonBorderHoverClasses, 'hover:!border-root-accent'].join(' ');
}

export function ModalCloseButton({
    onClick,
    ariaLabel = 'Tutup modal',
    className = '',
    appearance = 'standard',
    children,
    ...buttonProps
}: ModalCloseButtonProps) {
    const closeButtonClassName = getBorderOnlyHoverClasses(className);
    const sharedModalCloseClasses =
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-xl border border-root-accent/30 bg-root-surface p-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-root-subtle shadow-sm transition-all hover:text-root-accent hover:border-root-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-accent focus-visible:ring-offset-2 focus-visible:ring-offset-root-canvas lg:p-2 lg:text-xs';

    if (appearance === 'custom') {
        return (
            <button
                {...buttonProps}
                type={buttonProps.type ?? 'button'}
                onClick={onClick}
                aria-label={buttonProps['aria-label'] ?? ariaLabel}
                className={`${sharedModalCloseClasses} ${closeButtonClassName} !rounded-lg`}
            >
                {children}
            </button>
        );
    }

    if (appearance === 'icon') {
        return (
            <button
                type="button"
                onClick={onClick}
                aria-label={ariaLabel}
                className={`${sharedModalCloseClasses} p-1.5 text-root-accent ${closeButtonClassName} !rounded-lg`}
            >
                <X aria-hidden="true" className="h-4 w-4" />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            className={`${sharedModalCloseClasses} ${closeButtonClassName} !rounded-lg`}
        >
            <span className="pl-1 text-[10px] font-semibold uppercase tracking-[0.2em] lg:text-xs">{children ?? 'Tutup'}</span>
            <X aria-hidden="true" className="h-4 w-4" />
        </button>
    );
}

export default ModalCloseButton;
