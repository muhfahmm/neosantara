'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';
import PausedMenuFrame from '../../root_modals_design_menu/rootFrameMenu';

interface ConfirmRestartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ConfirmRestartModal({ isOpen, onClose, onConfirm }: ConfirmRestartModalProps) {
    if (!isOpen) return null;

    const content = (
        <PausedMenuFrame zIndexClass="z-[999999999]">
                <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-8 text-root-text custom-scrollbar">
                    
                    {/* Ornamen Atas */}
                    <div className="flex items-center justify-center gap-1.5 text-root-accent/40 mb-4 shrink-0">
                        <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-root-accent/40" />
                        <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                        <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-root-accent/40" />
                    </div>

                    {/* Header - Menggunakan ArrowLeft seperti SaveGameModal */}
                    <header className="mb-4 flex shrink-0 items-center justify-between border-b border-root-accent/20 pb-3 text-left">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Kembali ke menu jeda"
                                className="rounded p-1 text-root-subtle transition-all hover:bg-root-accent/10 hover:text-root-accent cursor-pointer"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
                                ATUR ULANG PROGRES?
                            </h2>
                        </div>
                    </header>

                    {/* Konten Utama */}
                    <div className="flex-1 flex flex-col justify-center items-center space-y-5 my-4">
                        {/* Ikon Peringatan */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                <RotateCcw className="w-8 h-8 stroke-[2.2]" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-root-canvas border border-amber-500/60 flex items-center justify-center text-amber-400">
                                <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Teks */}
                        <div className="text-center space-y-2 max-w-md">
                            <h3 className="text-base font-black text-white tracking-tight">
                                Apakah Anda yakin?
                            </h3>
                            <p className="text-xs font-semibold text-root-subtle leading-relaxed">
                                Seluruh kemajuan waktu, anggaran, dan data simulasi akan dikembalikan ke kondisi awal. Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                    </div>

                    {/* Footer Tombol */}
                    <div className="flex justify-end border-t border-root-accent/15 pt-4 shrink-0 gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="rounded border border-root-accent/30 px-5 py-2.5 text-xs font-bold text-root-text hover:bg-root-accent/10 transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { onConfirm(); onClose(); }} 
                            className="rounded border border-amber-500 bg-amber-500/25 px-5 py-2.5 text-xs font-extrabold text-amber-300 hover:bg-amber-500/40 transition-colors cursor-pointer"
                        >
                            Atur Ulang
                        </button>
                    </div>

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

export default ConfirmRestartModal;