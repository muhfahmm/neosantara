'use client';

import React from 'react';

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md';

export interface SharedBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

export function SharedBadge({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
  ...props
}: SharedBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded-[var(--root-radius-xs)] font-medium',
    md: 'text-xs px-2.5 py-1 rounded-[var(--root-radius-sm)] font-medium',
  }[size];

  const variantClasses = {
    neutral: 'bg-white/10 text-[var(--root-color-text)] border border-white/10',
    accent: 'bg-[var(--root-color-accent)]/15 text-[var(--root-color-accent)] border border-[var(--root-color-accent)]/30',
    success: 'bg-[var(--root-color-success)]/15 text-[var(--root-color-success)] border border-[var(--root-color-success)]/30',
    warning: 'bg-[var(--root-color-warning)]/15 text-[var(--root-color-warning)] border border-[var(--root-color-warning)]/30',
    danger: 'bg-[var(--root-color-danger)]/15 text-[var(--root-color-danger)] border border-[var(--root-color-danger)]/30',
  }[variant];

  return (
    <span
      className={`inline-flex items-center justify-center tracking-wide shrink-0 ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default SharedBadge;
