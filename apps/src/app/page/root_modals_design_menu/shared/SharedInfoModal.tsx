'use client';

import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X, Info } from 'lucide-react';
import { modalStack } from './modalStack';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { MENU_INFO_MODAL_VISIBILITY_EVENT } from '@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper';

export interface SharedInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  triggerRef?: React.RefObject<HTMLButtonElement | HTMLElement | null>;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SharedInfoModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  triggerRef,
  maxWidth = 'md',
  className = '',
}: SharedInfoModalProps) {
  const modalId = useId();
  const { t } = useLanguage();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [zIndex, setZIndex] = React.useState(70);

  useEffect(() => {
    if (!isOpen) return;

    const assignedZ = modalStack.push(modalId, onClose);
    setZIndex(assignedZ);

    window.dispatchEvent(
      new CustomEvent(MENU_INFO_MODAL_VISIBILITY_EVENT, {
        detail: { isOpen: true },
      })
    );

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalStack.getTopId() === modalId) {
          e.stopPropagation();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      modalStack.pop(modalId);
      window.dispatchEvent(
        new CustomEvent(MENU_INFO_MODAL_VISIBILITY_EVENT, {
          detail: { isOpen: false },
        })
      );
      window.removeEventListener('keydown', handleKeyDown);
      triggerRef?.current?.focus();
    };
  }, [isOpen, modalId, onClose, triggerRef]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  const modalNode = (
    <div
      style={{ zIndex }}
      className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-[1px] transition-opacity duration-150"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`info-title-${modalId}`}
        onClick={(e) => e.stopPropagation()}
        className={`relative flex flex-col w-full ${maxWidthClass} max-h-[85vh] bg-[var(--root-color-surface)] border border-[var(--root-color-accent)]/30 rounded-[var(--root-radius-xl)] shadow-2xl text-[var(--root-color-text)] overflow-hidden transition-all duration-150 ${className}`}
      >
        {/* Header Ringkas */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[var(--root-color-border)] bg-[var(--root-color-canvas)]/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-[var(--root-radius-sm)] bg-[var(--root-color-accent)]/15 text-[var(--root-color-accent)] shrink-0">
              {icon || <Info className="w-4 h-4 text-[var(--root-color-accent)]" />}
            </div>
            <div className="min-w-0">
              <h3 id={`info-title-${modalId}`} className="text-sm sm:text-base font-bold tracking-wide truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-[var(--root-color-muted)] truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label={t('common.close')}
            className="p-1.5 rounded-[var(--root-radius-full)] text-[var(--root-color-muted)] hover:text-[var(--root-color-text)] hover:bg-[var(--root-color-surface-hover)] transition-colors cursor-pointer ms-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Isi Info Scrollable */}
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain text-xs sm:text-sm text-[var(--root-color-body)] leading-relaxed space-y-3">
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}

export default SharedInfoModal;
