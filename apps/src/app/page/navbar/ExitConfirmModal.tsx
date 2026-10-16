'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

    const content = (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none font-sans">
                {/* Backdrop Click */}
                <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 12 }}
                    transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
                    className="relative w-full max-w-[440px] bg-[#071313]/98 border border-[#00FFAA]/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(0,255,170,0.25)] overflow-hidden z-20"
                >
                    {/* Futuristic Background Accents */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00FFAA]/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Corner Tech Lines */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#00FFAA]/60 rounded-tl-xl pointer-events-none" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#00FFAA]/60 rounded-tr-xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#00FFAA]/60 rounded-bl-xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#00FFAA]/60 rounded-br-xl pointer-events-none" />

                    {/* Close Button Top Right */}
                    <button
                        onClick={onClose}
                        title="Tutup"
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Modal Content */}
                    <div className="flex flex-col items-center text-center pt-2">
                        {/* Icon Glow Badge */}
                        <div className="relative mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-900/30 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.25)]">
                                <LogOut className="w-6 h-6 stroke-[2.2]" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0A1A1A] border border-amber-500/50 flex items-center justify-center text-amber-400">
                                <AlertTriangle className="w-3 h-3" />
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="space-y-1 mb-2">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00FFAA]/70">
                                {subtitle}
                            </div>
                            <h3 className="text-lg font-black text-white tracking-tight">
                                {title}
                            </h3>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-300/80 leading-relaxed max-w-[320px] mb-6">
                            {message}
                        </p>

                        {/* Action Buttons */}
                        <div className="w-full grid grid-cols-2 gap-3">
                            <button
                                onClick={onClose}
                                className="py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-200 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Batalkan
                            </button>
                            <button
                                onClick={handleExit}
                                className="py-2.5 px-4 rounded-xl border border-red-500/60 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.35)] transition-all cursor-pointer"
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>

                    {/* Bottom Status Ticker */}
                    <div className="mt-5 pt-3 border-t border-[#00FFAA]/10 flex items-center justify-between text-[9px] font-mono text-slate-500">
                        <span>SYS.TERM_ID: 16FA-923</span>
                        <span className="text-red-400/80 uppercase">SESSION ABORT</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    if (typeof document !== 'undefined') {
        return createPortal(content, document.body);
    }

    return content;
}

export default ExitConfirmModal;
