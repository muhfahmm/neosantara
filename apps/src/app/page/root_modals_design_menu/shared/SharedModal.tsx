'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface SharedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  className?: string;
}

export function SharedModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = 'lg',
  className = '',
}: SharedModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-[95vw]',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className={`relative flex flex-col w-full ${maxWidthClass} max-h-[90vh] bg-[var(--root-color-surface)] border border-[var(--root-color-border)] rounded-[var(--root-radius-xl)] shadow-2xl overflow-hidden text-[var(--root-color-text)] transition-transform duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Baku */}
        {(title || icon) && (
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-[var(--root-color-border)] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="flex items-center justify-center w-8 h-8 rounded-[var(--root-radius-sm)] bg-[var(--root-color-accent)]/15 text-[var(--root-color-accent)] shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold tracking-wide truncate">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-[var(--root-color-muted)] truncate">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[var(--root-radius-full)] text-[var(--root-color-muted)] hover:text-[var(--root-color-text)] hover:bg-[var(--root-color-surface-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--root-color-accent)] cursor-pointer ms-2"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 px-4 py-3 sm:px-6 sm:py-4 border-t border-[var(--root-color-border)] bg-[var(--root-color-surface)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default SharedModal;
