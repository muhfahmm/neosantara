'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { LogOut, AlertTriangle, ArrowLeft } from 'lucide-react';

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
        <div className="fixed inset-0 z-[9999999999] flex items-center justify-center pt-[88px] sm:pt-[100px] lg:pt-[clamp(92px,10dvh,115px)] pb-3 sm:pb-4 lg:pb-5 px-3 sm:px-6 lg:px-10 bg-transparent font-sans pointer-events-none select-none animate-fadeIn">
            
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

                    {/* Header dengan ArrowLeft di samping judul */}
                    <header className="mb-4 flex shrink-0 items-center justify-start border-b border-[#00FFAA]/20 pb-3 text-left">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Kembali ke menu jeda"
                                className="rounded p-1 text-[#6B8A8A] transition-all hover:bg-[#00FFAA]/10 hover:text-[#00FFAA] cursor-pointer"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <h2 className={`text-sm font-extrabold uppercase tracking-wider ${isExitWindow ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
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
                                    : 'bg-[#00FFAA]/15 border-2 border-[#00FFAA]/40 text-[#00FFAA] shadow-[0_0_20px_rgba(0,255,170,0.2)]'
                            }`}>
                                <LogOut className="w-10 h-10 stroke-[2.2]" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#0A1A1A] border border-amber-500/60 flex items-center justify-center text-amber-400">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Teks */}
                        <div className="text-center space-y-3 max-w-lg">
                            <div className={`text-[11px] font-black uppercase tracking-[0.25em] ${isExitWindow ? 'text-rose-400/80' : 'text-[#00FFAA]/70'}`}>
                                {subtitle}
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">
                                {title}
                            </h3>
                            <p className="text-sm font-semibold text-[#6B8A8A] leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Footer Tombol Dihapus */}

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

export default ExitConfirmModal;