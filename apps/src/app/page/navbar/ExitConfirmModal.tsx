'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { LogOut, AlertTriangle, X } from 'lucide-react';

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
    };

    const isExitWindow = confirmText?.toLowerCase().includes('keluar') ?? false;

    const content = (
        <div className="fixed inset-0 z-[9999999999] flex items-center justify-center p-4 bg-transparent font-sans select-none animate-fadeIn">
            {/* Notebook-style Frame — Green Cyberpunk Theme */}
            <div className="bg-[#0A1A1A] border-[6px] border-[#0F2424] rounded-2xl w-full max-w-[440px] shadow-2xl relative flex flex-col p-4 pl-12 overflow-hidden">
                {/* Silver Binder Spine on the Left */}
                <div className="absolute left-3 top-5 bottom-5 w-2 bg-gradient-to-r from-[#2A3F3F] via-[#3D5252] to-[#1F3030] rounded-full shadow-md z-20 border border-[#0A1A1A]/80" />
                <div className="absolute left-[8px] top-[22px] w-[16px] h-3 bg-[#0F2424] rounded-sm border border-[#0A1A1A] z-21 shadow" />
                <div className="absolute left-[8px] bottom-[22px] w-[16px] h-3 bg-[#0F2424] rounded-sm border border-[#0A1A1A] z-21 shadow" />

                {/* Notebook Rings binding the paper */}
                <div className="absolute left-[24px] top-9 bottom-9 flex flex-col justify-between items-center py-3 pointer-events-none z-30">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full bg-[#0A1A1A] shadow-inner border border-[#00FFAA]/20 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0F2424]" />
                        </div>
                    ))}
                </div>

                {/* Main Panel Sheet — Green Theme */}
                <div className="flex-1 bg-[#0F2424] border-[3px] border-[#00FFAA]/20 rounded-r-xl shadow-inner relative p-6 flex flex-col justify-between overflow-hidden text-center">
                    {/* Subtle radial glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

                    {/* Decorative Elegant Divider at the Top */}
                    <div className="flex items-center justify-center gap-1.5 text-[#00FFAA]/40 mb-3 shrink-0">
                        <div className="h-[1.5px] w-8 bg-gradient-to-r from-transparent to-[#00FFAA]/40" />
                        <span className="text-[9px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                        <div className="h-[1.5px] w-8 bg-gradient-to-l from-transparent to-[#00FFAA]/40" />
                    </div>

                    {/* Close Button Top Right */}
                    <button
                        onClick={onClose}
                        title="Tutup"
                        className="absolute top-4 right-4 p-1 rounded-lg text-[#6B8A8A] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Content Section */}
                    <div className="flex flex-col items-center gap-3 my-2">
                        {/* Icon Glow Badge */}
                        <div className="relative">
                            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg ${
                                isExitWindow
                                    ? 'bg-rose-500/15 border-2 border-rose-500/40 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                                    : 'bg-[#00FFAA]/15 border-2 border-[#00FFAA]/40 text-[#00FFAA] shadow-[0_0_20px_rgba(0,255,170,0.2)]'
                            }`}>
                                <LogOut className="w-6 h-6 stroke-[2.2]" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0A1A1A] border border-amber-500/60 flex items-center justify-center text-amber-400">
                                <AlertTriangle className="w-3 h-3" />
                            </div>
                        </div>

                        {/* Heading & Subtitle */}
                        <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00FFAA]/70">
                                {subtitle}
                            </div>
                            <h3 className="text-base font-black text-white tracking-tight">
                                {title}
                            </h3>
                            <p className="text-[11px] font-semibold text-[#6B8A8A] leading-relaxed max-w-[280px] mx-auto pt-1">
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 shrink-0 pt-3 z-10">
                        <button
                            onClick={onClose}
                            className="bg-[#0A1A1A] hover:bg-[#00FFAA]/10 active:bg-[#00FFAA]/20 border border-[#00FFAA]/30 hover:border-[#00FFAA]/60 rounded-xl py-2.5 text-center text-[#E0E0E0] hover:text-[#00FFAA] font-extrabold text-[11px] tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.98]"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleExit}
                            className={`rounded-xl py-2.5 text-center font-black text-[11px] tracking-wider uppercase transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                                isExitWindow
                                    ? 'bg-rose-500/20 hover:bg-rose-500/30 active:bg-rose-500/40 border border-rose-500/60 hover:border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                                    : 'bg-[#00FFAA]/20 hover:bg-[#00FFAA]/30 active:bg-[#00FFAA]/40 border border-[#00FFAA]/60 hover:border-[#00FFAA] text-[#00FFAA] shadow-[0_0_12px_rgba(0,255,170,0.2)]'
                            }`}
                        >
                            {confirmText}
                        </button>
                    </div>

                    {/* Decorative Elegant Divider at the Bottom */}
                    <div className="flex items-center justify-center gap-1.5 text-[#00FFAA]/40 mt-4 shrink-0">
                        <div className="h-[1.5px] w-8 bg-gradient-to-r from-transparent to-[#00FFAA]/40" />
                        <span className="text-[9px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                        <div className="h-[1.5px] w-8 bg-gradient-to-l from-transparent to-[#00FFAA]/40" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(content, document.body);
    }

    return content;
}

export default ExitConfirmModal;
