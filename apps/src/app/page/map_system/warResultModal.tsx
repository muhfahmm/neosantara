'use client';

import { createPortal } from 'react-dom';

export interface ResultModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

export default function ResultModal({
    isOpen,
    title,
    message,
    type = 'success',
    onClose,
}: ResultModalProps) {
    if (typeof window === 'undefined' || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[500000] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 animate-fadeIn pointer-events-none">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="result-modal-title"
                className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl"
            >
                <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0 rounded-t-2xl">
                    <h2 className={`text-base sm:text-xl font-bold tracking-tight leading-none uppercase ${type === 'error' ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
                        {type === 'error' ? 'Peringatan — Informasi Hasil' : 'Informasi Transaksi & Hasil'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup modal"
                        className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5"
                    >
                        <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                        <span aria-hidden="true" className="text-lg leading-none">×</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="w-full max-w-4xl mx-auto">
                        <h3
                            id="result-modal-title"
                            className={`text-lg sm:text-2xl font-black uppercase tracking-wide mb-4 ${type === 'error' ? 'text-rose-400' : 'text-[#E0E0E0]'}`}
                        >
                            {title}
                        </h3>
                        <p className="text-sm sm:text-base lg:text-lg text-[#A0B0B0] leading-relaxed mb-6 font-medium whitespace-pre-wrap">
                            {message}
                        </p>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`min-w-32 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all ${type === 'error'
                                    ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30'
                                    : 'bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 shadow-[0_0_20px_rgba(0,255,170,0.3)]'
                                }`}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
