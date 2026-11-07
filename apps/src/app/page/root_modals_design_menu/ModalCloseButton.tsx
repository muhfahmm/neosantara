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

    if (appearance === 'custom') {
        return (
            <button
                {...buttonProps}
                type={buttonProps.type ?? 'button'}
                onClick={onClick}
                aria-label={buttonProps['aria-label'] ?? ariaLabel}
                className={`${closeButtonClassName} !rounded-lg`}
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
                className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-root-accent/30 bg-root-surface p-1.5 text-root-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-accent focus-visible:ring-offset-2 focus-visible:ring-offset-root-canvas ${closeButtonClassName} !rounded-lg`}
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
            className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-root-accent/30 bg-root-surface p-1.5 text-xs font-bold uppercase text-root-subtle transition-all sm:p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-accent focus-visible:ring-offset-2 focus-visible:ring-offset-root-canvas ${closeButtonClassName} !rounded-lg`}
        >
            <span className="pl-1 text-xs font-semibold uppercase tracking-widest">{children ?? 'Tutup'}</span>
            <X aria-hidden="true" className="h-4 w-4" />
        </button>
    );
}

export default ModalCloseButton;
