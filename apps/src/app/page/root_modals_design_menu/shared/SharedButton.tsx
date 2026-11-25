'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface SharedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const SharedButton = React.forwardRef<HTMLButtonElement, SharedButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Ukuran baku dengan touch target min 44px di mobile jika size >= md
    const sizeClasses = {
      sm: 'min-h-[32px] px-3 py-1 text-xs gap-1.5',
      md: 'min-h-[40px] sm:min-h-[38px] px-4 py-2 text-sm gap-2',
      lg: 'min-h-[48px] px-6 py-2.5 text-base font-semibold gap-2.5',
    }[size];

    // Varian warna baku berbasis token semantik
    const variantClasses = {
      primary:
        'bg-[var(--root-color-accent)] text-[var(--root-color-accent-ink)] hover:brightness-110 active:brightness-95 shadow-sm',
      secondary:
        'bg-[var(--root-color-surface)] text-[var(--root-color-text)] border border-[var(--root-color-border)] hover:bg-[var(--root-color-surface-hover)] active:opacity-90',
      danger:
        'bg-[var(--root-color-danger)] text-white hover:brightness-110 active:brightness-95 shadow-sm',
      success:
        'bg-[var(--root-color-success)] text-white hover:brightness-110 active:brightness-95 shadow-sm',
      ghost:
        'bg-transparent text-[var(--root-color-body)] hover:bg-[var(--root-color-surface)] hover:text-[var(--root-color-text)]',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium rounded-[var(--root-radius-md)] cursor-pointer select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--root-color-accent)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

SharedButton.displayName = 'SharedButton';
export default SharedButton;
