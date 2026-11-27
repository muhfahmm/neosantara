'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, LogIn, X, Loader2 } from 'lucide-react';
import PausedMenuFrame from '../../root_modals_design_menu/rootFrameMenu';
import { PausedMenuHeader } from '../../root_modals_design_menu/PausedMenuHeader';
import { useLanguage } from '../terjemahan_paused_menu/languageLogic';
import {
    isFirebaseConfigured,
    signInWithGoogle,
    isGooglePopupCancellation,
} from '@/lib/firebaseClient';

export interface SaveAuthRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess?: () => void;
    errorMessage?: string;
    actionContext?: 'save' | 'load';
}

export function SaveAuthRequiredModal({
    isOpen,
    onClose,
    onLoginSuccess,
    errorMessage,
    actionContext = 'save',
}: SaveAuthRequiredModalProps) {
    const { t } = useLanguage();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleGoogleSignIn = async () => {
        setIsLoggingIn(true);
        setAuthError(null);
        try {
            await signInWithGoogle();
            setIsLoggingIn(false);
            if (onLoginSuccess) {
                onLoginSuccess();
            }
            onClose();
        } catch (error) {
            if (isGooglePopupCancellation(error)) {
                setIsLoggingIn(false);
                return;
            }
            console.error('Google Sign-in failed in SaveAuthRequiredModal:', error);
            setAuthError(error instanceof Error ? error.message : 'Gagal melakukan login dengan Google.');
            setIsLoggingIn(false);
        }
    };

    const isSaveAction = actionContext === 'save';
    const title = isSaveAction ? 'Login Google Diperlukan' : 'Akses Cloud Save';
    const subtitle = isSaveAction ? 'Gagal Menyimpan Permainan' : 'Gagal Memuat Permainan';
    const description = errorMessage || (isSaveAction
        ? 'Silakan login dengan akun Google Anda terlebih dahulu untuk menyimpan progres permainan ke database cloud Neosantara.'
        : 'Silakan login dengan akun Google Anda terlebih dahulu untuk membaca dan memuat file save permainan dari cloud.');

    const content = (
        <PausedMenuFrame zIndexClass="z-[9999999999]" ornamentCount={7}>
            <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-4 text-root-text custom-scrollbar sm:p-8">
                <PausedMenuHeader
                    title={title}
                    onBack={onClose}
                    backLabel={t('paused_menu.exitModal.backLabel') || 'Kembali'}
                />

                {/* Konten Utama */}
                <div className="flex-1 flex flex-col justify-center items-center space-y-6 my-4">
                    {/* Ikon Peringatan & Google Login */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg bg-amber-500/15 border-2 border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                            <LogIn className="w-10 h-10 stroke-[2.2]" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-root-canvas border border-amber-500/60 flex items-center justify-center text-amber-400 shadow">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Deskripsi & Pesan Error */}
                    <div className="text-center space-y-3 max-w-lg">
                        <div className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400/80">
                            {subtitle}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {title}
                        </h3>
                        <p className="text-sm font-semibold text-root-subtle leading-relaxed">
                            {description}
                        </p>

                        {authError && (
                            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                                {authError}
                            </div>
                        )}
                    </div>

                    {/* Tombol Aksi */}
                    <div className="w-full max-w-sm space-y-3 pt-2">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isLoggingIn || !isFirebaseConfigured}
                            className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300/80 bg-white px-5 py-3 text-sm font-extrabold text-slate-800 shadow-md transition hover:bg-slate-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                        >
                            {isLoggingIn ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                                    <span>Menghubungkan Akun Google...</span>
                                </>
                            ) : (
                                <>
                                    <span aria-hidden="true" className="text-lg font-black text-[#4285F4]">G</span>
                                    <span>Login dengan Google</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoggingIn}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-root-accent/30 bg-root-canvas/60 px-5 py-2.5 text-xs font-bold text-root-subtle transition hover:bg-root-surface hover:text-white cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                            <span>Tutup / Batal</span>
                        </button>
                    </div>
                </div>

                {/* Footer Aksesori */}
                <div className="flex items-center justify-center gap-1.5 text-root-accent/40 mt-4 shrink-0">
                    <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-root-accent/40" />
                    <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                    <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-root-accent/40" />
                </div>
            </div>
        </PausedMenuFrame>
    );

    if (typeof document !== 'undefined') {
        return createPortal(content, document.body);
    }

    return content;
}

export default SaveAuthRequiredModal;
