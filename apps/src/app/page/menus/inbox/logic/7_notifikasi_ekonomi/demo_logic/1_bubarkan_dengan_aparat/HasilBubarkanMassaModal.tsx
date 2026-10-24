'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, CheckCircle2, AlertTriangle, Users, HeartCrack, Activity, X } from 'lucide-react';

export interface HasilBubarkanMassaModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    casualties?: number;
    deadCount?: number;
    injuredCount?: number;
    remainingMassa?: number;
    actionName?: string;
    onClose: () => void;
}

export default function HasilBubarkanMassaModal({
    isOpen,
    title,
    message,
    type = 'success',
    casualties = 0,
    deadCount,
    injuredCount = 0,
    remainingMassa,
    actionName,
    onClose,
}: HasilBubarkanMassaModalProps) {
    if (typeof window === 'undefined' || !isOpen) return null;

    const isError = type === 'error';
    const isKerusuhan = title.toLowerCase().includes('kerusuhan') || title.toLowerCase().includes('gagal') || isError;
    const finalDead = deadCount !== undefined ? deadCount : casualties;

    // Warna border dan background disesuaikan dengan konteks (Kerusuhan vs Sukses)
    const borderColor = isKerusuhan ? 'border-rose-500/40' : 'border-[#00FFAA]/30';
    const shadowColor = isKerusuhan ? 'shadow-[0_0_40px_rgba(225,29,72,0.15)]' : 'shadow-[0_0_40px_rgba(0,255,170,0.15)]';

    const modalContent = (
        <div className="fixed inset-0 z-[100000001] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
            {/* 🔥 PERBAIKAN: Struktur Container disamakan persis dengan EmbassyRelationRequirementModal */}
            <div className={`w-full max-w-2xl min-h-[450px] flex flex-col bg-[#0F2424] ${borderColor} rounded-2xl p-6 sm:p-8 ${shadowColor} relative pointer-events-auto`}>
                
                {/* Area Konten */}
                <div className="flex-1 flex flex-col">
                    
                    {/* Header disesuaikan agar rapi di dalam container baru */}
                    <div className="flex items-center justify-between mb-6 border-b border-[#00FFAA]/20 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={`shrink-0 rounded-lg border p-2 ${
                                isKerusuhan
                                    ? 'border-rose-500/40 bg-rose-950/60 text-rose-400'
                                    : 'border-[#00FFAA]/40 bg-[#0A1A1A] text-[#00FFAA]'
                            }`}>
                                {isKerusuhan ? (
                                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                                ) : (
                                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        isKerusuhan 
                                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                                            : 'bg-[#00FFAA]/15 text-[#00FFAA] border-[#00FFAA]/30'
                                    }`}>
                                        Satuan Pengamanan Dalam Negeri
                                    </span>
                                </div>
                                <h2 className={`text-xl sm:text-2xl font-black tracking-wide uppercase ${
                                    isKerusuhan ? 'text-rose-400' : 'text-[#00FFAA]'
                                }`}>
                                    {isKerusuhan ? 'Laporan Bentrokan / Kerusuhan' : 'Laporan Operasi Pembubaran Massa'}
                                </h2>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer shadow-sm shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Ringkasan Status Tindakan Opsi */}
                    <div className="p-4 sm:p-5 rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] mb-6">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <h3 className={`text-base sm:text-lg font-black uppercase tracking-wide ${
                                isKerusuhan ? 'text-rose-400' : 'text-white'
                            }`}>
                                {title}
                            </h3>
                            {actionName && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/40 border border-[#00FFAA]/20 text-[#00FFAA]">
                                    {actionName}
                                </span>
                            )}
                        </div>
                        <p className="text-sm sm:text-base text-[#A0B0B0] leading-relaxed font-medium whitespace-pre-wrap">
                            {message}
                        </p>
                    </div>

                    {/* Rincian Dampak: Terluka, Tewas, dan Sisa Demonstran */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#00FFAA] mb-3 flex items-center gap-1.5">
                            <Activity className="w-4 h-4" />
                            Dampak Terhadap Massa Demonstran
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Korban Terluka */}
                            <div className="bg-[#0A1A1A] border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Korban Terluka</span>
                                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                                </div>
                                <div className="mt-3">
                                    <p className="text-xl sm:text-2xl font-black text-amber-300">
                                        {injuredCount.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-400">Jiwa</span>
                                    </p>
                                    <p className="text-[10px] text-amber-400/80 mt-1 font-medium">
                                        Iritasi gas, terinjak & cedera fisik
                                    </p>
                                </div>
                            </div>

                            {/* Korban Tewas */}
                            <div className="bg-[#0A1A1A] border border-rose-500/30 rounded-xl p-4 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Korban Tewas</span>
                                    <HeartCrack className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                                </div>
                                <div className="mt-3">
                                    <p className="text-xl sm:text-2xl font-black text-rose-400">
                                        {finalDead.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-400">Jiwa</span>
                                    </p>
                                    <p className="text-[10px] text-rose-400/80 mt-1 font-medium">
                                        Mengurangi populasi resmi negara
                                    </p>
                                </div>
                            </div>

                            {/* Sisa Demonstran di Jalan */}
                            <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-xl p-4 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Sisa Massa</span>
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FFAA]" />
                                </div>
                                <div className="mt-3">
                                    <p className="text-xl sm:text-2xl font-black text-[#00FFAA]">
                                        {(remainingMassa !== undefined ? remainingMassa : 0).toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-400">Jiwa</span>
                                    </p>
                                    <p className="text-[10px] text-[#00FFAA]/70 mt-1 font-medium">
                                        {remainingMassa === 0 ? 'Massa berhasil dibubarkan' : 'Masih bertahan di lapangan'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Area Tombol (Diperkecil & disamakan) */}
                <div className="flex justify-end mt-6 pt-4 border-t border-[#00FFAA]/20">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`w-full sm:w-auto px-6 py-2 rounded-xl text-center font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98] ${
                            isKerusuhan
                                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500 hover:text-white'
                                : 'bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00e699] border border-[#00FFAA]'
                        }`}
                    >
                        Dimengerti
                    </button>
                </div>

            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}