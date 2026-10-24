'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, CheckCircle2, AlertTriangle, Users, HeartHandshake } from 'lucide-react';

export interface HasilBubarkanMassaModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    casualties?: number;
    remainingMassa?: number;
    onClose: () => void;
}

export default function HasilBubarkanMassaModal({
    isOpen,
    title,
    message,
    type = 'success',
    casualties = 0,
    remainingMassa,
    onClose,
}: HasilBubarkanMassaModalProps) {
    if (typeof window === 'undefined' || !isOpen) return null;

    const isError = type === 'error';
    const isKerusuhan = title.toLowerCase().includes('kerusuhan') || title.toLowerCase().includes('gagal');

    return createPortal(
        <div className="fixed inset-0 z-[500000] flex items-center justify-center p-4 pointer-events-auto font-sans">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="hasil-bubarkan-modal-title"
                className={`relative bg-[#0F2424] border ${
                    isKerusuhan || isError ? 'border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.25)]' : 'border-[#00FFAA]/40 shadow-[0_0_25px_rgba(0,255,170,0.2)]'
                } rounded-2xl overflow-hidden w-full max-w-md max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] pointer-events-auto flex flex-col font-sans animate-in fade-in zoom-in-95 duration-200`}
            >
                {/* Header */}
                <div className="px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 lg:py-4 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] shrink-0">
                    <div className="flex items-center gap-2.5 lg:gap-3">
                        <div className={`p-2 rounded-xl border ${
                            isKerusuhan || isError 
                                ? 'border-rose-500/40 bg-rose-950/60 text-rose-400' 
                                : 'border-[#00FFAA]/40 bg-[#00FFAA]/10 text-[#00FFAA]'
                        }`}>
                            {isKerusuhan || isError ? (
                                <AlertTriangle className="w-5 h-5 text-rose-400" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5 text-[#00FFAA]" />
                            )}
                        </div>
                        <div>
                            <h2 className={`text-xs sm:text-sm font-black tracking-wider uppercase ${
                                isKerusuhan || isError ? 'text-rose-400' : 'text-[#00FFAA]'
                            }`}>
                                {isKerusuhan ? '⚠️ Kerusuhan & Bentrokan' : isError ? 'Peringatan Operasi' : '🛡️ Laporan Operasi Pembubaran'}
                            </h2>
                            <p className="text-[10px] text-[#6B8A8A] uppercase font-bold tracking-wider">
                                Satuan Tugas Pengamanan Dalam Negeri
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup modal"
                        className={`p-1.5 rounded-lg border ${
                            isKerusuhan || isError 
                                ? 'border-rose-500/30 bg-rose-950/30 text-rose-400 hover:bg-rose-500 hover:text-white' 
                                : 'border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A]'
                        } transition-all cursor-pointer font-bold text-xs uppercase flex items-center justify-center w-7 h-7`}
                    >
                        <span aria-hidden="true" className="text-lg leading-none">×</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 min-h-0 p-4 sm:p-5 lg:p-6 overflow-y-auto space-y-4 custom-scrollbar">
                    <div>
                        <h3
                            id="hasil-bubarkan-modal-title"
                            className={`text-base sm:text-lg font-black uppercase tracking-wide mb-2 ${
                                isKerusuhan || isError ? 'text-rose-400' : 'text-[#E0E0E0]'
                            }`}
                        >
                            {title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#A0B0B0] leading-relaxed font-medium whitespace-pre-wrap">
                            {message}
                        </p>
                    </div>

                    {/* Stat Badges jika ada korban jiwa atau sisa massa */}
                    {(casualties > 0 || remainingMassa !== undefined) && (
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#00FFAA]/15">
                            {casualties > 0 && (
                                <div className="bg-[#0A1A1A] border border-rose-500/30 rounded-xl p-2.5 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Korban Jiwa/Luka</p>
                                        <p className="text-xs font-black text-rose-400">
                                            {casualties.toLocaleString('id-ID')} Jiwa
                                        </p>
                                    </div>
                                </div>
                            )}

                            {remainingMassa !== undefined && (
                                <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-xl p-2.5 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-[#00FFAA] shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Sisa Demonstran</p>
                                        <p className="text-xs font-black text-[#00FFAA]">
                                            {remainingMassa.toLocaleString('id-ID')} Jiwa
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-4 sm:px-5 lg:px-6 py-3 border-t border-[#00FFAA]/20 bg-[#0A1A1A] flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all ${
                            isKerusuhan || isError
                                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500 hover:text-white'
                                : 'bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 shadow-[0_0_12px_rgba(0,255,170,0.3)]'
                        }`}
                    >
                        Dimengerti
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
