'use client';

import React from 'react';
import { SharedModal } from './SharedModal';
import { SharedButton } from './SharedButton';
import { AlertTriangle, Info } from 'lucide-react';

export interface SharedConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function SharedConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  isDestructive = false,
  isLoading = false,
}: SharedConfirmDialogProps) {
  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      icon={
        isDestructive ? (
          <AlertTriangle className="w-5 h-5 text-[var(--root-color-danger)]" />
        ) : (
          <Info className="w-5 h-5 text-[var(--root-color-accent)]" />
        )
      }
      footer={
        <>
          <SharedButton
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </SharedButton>
          <SharedButton
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </SharedButton>
        </>
      }
    >
      <div className="text-sm text-[var(--root-color-body)] leading-relaxed">
        {message}
      </div>
    </SharedModal>
  );
}

export default SharedConfirmDialog;
