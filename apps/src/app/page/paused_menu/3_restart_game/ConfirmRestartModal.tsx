'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

interface ConfirmRestartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ConfirmRestartModal({ isOpen, onClose, onConfirm }: ConfirmRestartModalProps) {
    if (!isOpen) return null;

    const content = (
        <div className="fixed inset-0 z-[999999999] flex items-center justify-center pt-[88px] sm:pt-[100px] lg:pt-[clamp(92px,10dvh,115px)] pb-3 sm:pb-4 lg:pb-5 px-3 sm:px-6 lg:px-10 bg-transparent font-sans pointer-events-none select-none animate-fadeIn">
            
            {/* 🔥 Gaya Buku Catatan (Sama persis dengan SaveGameModal) */}
            <section className="bg-[#0A1A1A] border-[6px] border-[#0F2424] rounded-2xl w-full max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl h-full max-h-[calc(100dvh-100px)] sm:max-h-[calc(100dvh-116px)] lg:max-h-[calc(100dvh-112px)] shadow-2xl relative flex flex-col min-w-0 p-3 sm:p-4 pl-10 sm:pl-12 pointer-events-auto overflow-y-auto custom-scrollbar">
                
                {/* Jilid Buku (Spiral & Besi) */}
                <div className="absolute left-3 sm:left-3.5 top-6 bottom-6 w-2 sm:w-2.5 bg-gradient-to-r from-[#2A3F3F] via-[#3D5252] to-[#1F3030] rounded-full shadow-md z-20 border border-[#0A1A1A]/80" />
                <div className="absolute left-[8px] sm:left-[10px] top-[24px] w-[16px] sm:w-[18px] h-3.5 bg-[#0F2424] rounded-sm border border-[#0A1A1A] z-21 shadow" />
                <div className="absolute left-[8px] sm:left-[10px] bottom-[24px] w-[16px] sm:w-[18px] h-3.5 bg-[#0F2424] rounded-sm border border-[#0A1A1A] z-21 shadow" />
                <div className="absolute left-[22px] sm:left-[26px] top-10 bottom-10 flex flex-col justify-between items-center py-4 pointer-events-none z-30">
                    {[...Array(11)].map((_, i) => (
                        <div key={i} className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-[#0A1A1A] shadow-inner border border-[#00FFAA]/20 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0F2424]" />
                        </div>
                    ))}
                </div>

                {/* Kertas / Panel Dalam */}
                <div className="flex-1 bg-[#0F2424] border-[3px] border-[#00FFAA]/20 rounded-r-xl shadow-inner relative p-8 flex flex-col overflow-hidden text-[#E0E0E0]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />
                    
                    {/* Ornamen Atas */}
                    <div className="flex items-center justify-center gap-1.5 text-[#00FFAA]/40 mb-4 shrink-0">
                        <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#00FFAA]/40" />
                        <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                        <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#00FFAA]/40" />
                    </div>

                    {/* Header - Menggunakan ArrowLeft seperti SaveGameModal */}
                    <header className="mb-4 flex shrink-0 items-center justify-between border-b border-[#00FFAA]/20 pb-3 text-left">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Kembali ke menu jeda"
                                className="rounded p-1 text-[#6B8A8A] transition-all hover:bg-[#00FFAA]/10 hover:text-[#00FFAA] cursor-pointer"
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
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-[#0A1A1A] border border-amber-500/60 flex items-center justify-center text-amber-400">
                                <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Teks */}
                        <div className="text-center space-y-2 max-w-md">
                            <h3 className="text-base font-black text-white tracking-tight">
                                Apakah Anda yakin?
                            </h3>
                            <p className="text-xs font-semibold text-[#6B8A8A] leading-relaxed">
                                Seluruh kemajuan waktu, anggaran, dan data simulasi akan dikembalikan ke kondisi awal. Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                    </div>

                    {/* Footer Tombol */}
                    <div className="flex justify-end border-t border-[#00FFAA]/15 pt-4 shrink-0 gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="rounded border border-[#00FFAA]/30 px-5 py-2.5 text-xs font-bold text-[#E0E0E0] hover:bg-[#00FFAA]/10 transition-colors cursor-pointer"
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
                    <div className="flex items-center justify-center gap-1.5 text-[#00FFAA]/40 mt-4 shrink-0">
                        <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#00FFAA]/40" />
                        <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                        <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#00FFAA]/40" />
                    </div>
                </div>
            </section>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(content, document.body);
    }

    return content;
}

export default ConfirmRestartModal;