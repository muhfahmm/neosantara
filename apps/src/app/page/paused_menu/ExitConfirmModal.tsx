'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { LogOut, AlertTriangle, ArrowLeft } from 'lucide-react';
import PausedMenuFrame from '../root_modals_design_menu/rootFrameMenu';

interface ExitConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title?: string;
    subtitle?: string;
    message?: string;
    confirmText?: string;
}

export function ExitConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Akhiri Sesi Simulasi?",
    subtitle = "PROTOKOL TERMINASI",
    message = "Apakah Anda yakin ingin keluar dari NEOSANTARA? Pastikan seluruh kemajuan simulasi Anda telah tersimpan.",
    confirmText = "Keluar Game",
}: ExitConfirmModalProps) {
    if (!isOpen) return null;

    const handleExit = () => {
        if (onConfirm) {
            onConfirm();
        } else if (typeof window !== 'undefined') {
            window.close();
        }
        onClose();
    };

    const isExitWindow = confirmText?.toLowerCase().includes('keluar') ?? false;

    const content = (
        <PausedMenuFrame zIndexClass="z-[9999999999]">
                <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-8 text-root-text custom-scrollbar">
                    
                    {/* Ornamen Atas */}
                    <div className="flex items-center justify-center gap-1.5 text-root-accent/40 mb-4 shrink-0">
                        <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-root-accent/40" />
                        <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                        <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-root-accent/40" />
                    </div>

                    {/* Header dengan ArrowLeft di samping judul */}
                    <header className="mb-4 flex shrink-0 items-center justify-start border-b border-root-accent/20 pb-3 text-left">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Kembali ke menu jeda"
                                className="rounded p-1 text-root-subtle transition-all hover:bg-root-accent/10 hover:text-root-accent cursor-pointer"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <h2 className={`text-sm font-extrabold uppercase tracking-wider ${isExitWindow ? 'text-rose-400' : 'text-root-accent'}`}>
                                {title}
                            </h2>
                        </div>
                    </header>

                    {/* Konten Utama */}
                    <div className="flex-1 flex flex-col justify-center items-center space-y-6 my-4">
                        
                        {/* Ikon Peringatan */}
                        <div className="relative">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${
                                isExitWindow
                                    ? 'bg-rose-500/15 border-2 border-rose-500/40 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                                    : 'bg-root-accent/15 border-2 border-root-accent/40 text-root-accent shadow-[0_0_20px_rgba(0,255,170,0.2)]'
                            }`}>
                                <LogOut className="w-10 h-10 stroke-[2.2]" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-root-canvas border border-amber-500/60 flex items-center justify-center text-amber-400">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Teks */}
                        <div className="text-center space-y-3 max-w-lg">
                            <div className={`text-[11px] font-black uppercase tracking-[0.25em] ${isExitWindow ? 'text-rose-400/80' : 'text-root-accent/70'}`}>
                                {subtitle}
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">
                                {title}
                            </h3>
                            <p className="text-sm font-semibold text-root-subtle leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>

                    <footer className="flex shrink-0 justify-center border-t border-rose-500/20 pt-5">
                        <button
                            type="button"
                            onClick={handleExit}
                            className="inline-flex min-w-56 items-center justify-center gap-2 rounded-lg border border-rose-500/60 bg-rose-600 px-6 py-3 text-sm font-black uppercase tracking-wider text-white shadow-[0_0_18px_rgba(244,63,94,0.2)] transition-all hover:border-rose-400 hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-root-surface active:scale-[0.98] cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            {confirmText}
                        </button>
                    </footer>

                    {/* Ornamen Bawah */}
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

export default ExitConfirmModal;