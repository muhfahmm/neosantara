'use client';

import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Users, HeartCrack, Activity } from 'lucide-react';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

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
    withinForumDialog?: boolean;
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
    withinForumDialog = false,
    onClose,
}: HasilBubarkanMassaModalProps) {
    const { t } = useLanguage();
    if (typeof window === 'undefined' || !isOpen) return null;

    const isError = type === 'error';
    const isKerusuhan = isError;
    const finalDead = deadCount !== undefined ? deadCount : casualties;

    // Warna border dan background disesuaikan dengan konteks (Kerusuhan vs Sukses)
    const borderColor = isKerusuhan ? 'border-rose-500/40' : 'border-root-accent/30';
    const shadowColor = isKerusuhan ? 'shadow-[0_0_40px_rgba(225,29,72,0.15)]' : 'shadow-[0_0_40px_rgba(0,255,170,0.15)]';

    const modalContent = (
        <div className={`fixed inset-0 ${withinForumDialog ? 'z-[2147483647]' : 'z-[100000001]'} flex items-center justify-center p-4 font-sans text-white pointer-events-none`}>
            <div className={`modal-responsive-shell flex min-h-0 flex-col overflow-y-auto bg-root-surface ${borderColor} rounded-2xl p-4 sm:p-6 ${shadowColor} relative pointer-events-auto`}>
                
                {/* Area Konten */}
                <div className="flex-1 flex flex-col">
                    
                    <RootInfoModalHeader
                        title={t(isKerusuhan ? 'side_inbox.demo.reportTitleClash' : 'side_inbox.demo.reportTitleSuccess')}
                        onClose={onClose}
                        icon={isKerusuhan ? <AlertTriangle /> : <CheckCircle2 />}
                        size="standard"
                        actions={
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                isKerusuhan
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-root-accent/15 text-root-accent border-root-accent/30'
                            }`}>
                                {t('side_inbox.demo.securityUnit')}
                            </span>
                        }
                    />

                    {/* Ringkasan Status Tindakan Opsi */}
                    <div className="p-4 sm:p-5 rounded-xl border border-root-accent/20 bg-root-canvas mb-6">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <h3 className={`text-base sm:text-lg font-black uppercase tracking-wide ${
                                isKerusuhan ? 'text-rose-400' : 'text-white'
                            }`}>
                                {title}
                            </h3>
                            {actionName && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/40 border border-root-accent/20 text-root-accent">
                                    {actionName?.startsWith('side_inbox.') ? t(actionName) : actionName}
                                </span>
                            )}
                        </div>
                        <p className="text-sm sm:text-base text-[#A0B0B0] leading-relaxed font-medium whitespace-pre-wrap">
                            {message}
                        </p>
                    </div>

                    {/* Rincian Dampak: Terluka, Tewas, dan Sisa Demonstran */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-root-accent mb-3 flex items-center gap-1.5">
                            <Activity className="w-4 h-4" />
                            {t('side_inbox.demo.crowdImpact')}
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Korban Terluka */}
                            <div className="bg-root-canvas border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">{t('side_inbox.demo.injured')}</span>
                                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                                </div>
                                <div className="mt-3">
                                    <p className="text-xl sm:text-2xl font-black text-amber-300">
                                        {injuredCount.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-400">{t('side_inbox.demo.people')}</span>
                                    </p>
                                    <p className="text-[10px] text-amber-400/80 mt-1 font-medium">
                                        {t('side_inbox.demo.injuryImpact')}
                                    </p>
                                </div>
                            </div>

                            {/* Korban Tewas */}
                            <div className="bg-root-canvas border border-rose-500/30 rounded-xl p-4 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">{t('side_inbox.demo.killed')}</span>
                                    <HeartCrack className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                                </div>
                                <div className="mt-3">
                                    <p className="text-xl sm:text-2xl font-black text-rose-400">
                                        {finalDead.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-400">{t('side_inbox.demo.people')}</span>
                                    </p>
                                    <p className="text-[10px] text-rose-400/80 mt-1 font-medium">
                                        {t('side_inbox.demo.populationImpact')}
                                    </p>
                                </div>
                            </div>

                            {/* Sisa Demonstran di Jalan */}
                            <div className="bg-root-canvas border border-root-accent/30 rounded-xl p-4 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">{t('side_inbox.demo.remainingProtesters')}</span>
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-root-accent" />
                                </div>
                                <div className="mt-3">
                                    <p className="text-xl sm:text-2xl font-black text-root-accent">
                                        {(remainingMassa !== undefined ? remainingMassa : 0).toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-400">{t('side_inbox.demo.people')}</span>
                                    </p>
                                    <p className="text-[10px] text-root-accent/70 mt-1 font-medium">
                                        {t(remainingMassa === 0 ? 'side_inbox.demo.dispersed' : 'side_inbox.demo.stillAtSite')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Area Tombol (Diperkecil & disamakan) */}
                <div className="flex justify-end mt-6 pt-4 border-t border-root-accent/20">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`w-full sm:w-auto px-6 py-2 rounded-xl text-center font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98] ${
                            isKerusuhan
                                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500 hover:text-white'
                                : 'bg-root-accent text-root-canvas hover:bg-[#00e699] border border-root-accent'
                        }`}
                    >
                        {t('side_inbox.demo.understood')}
                    </button>
                </div>

            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}