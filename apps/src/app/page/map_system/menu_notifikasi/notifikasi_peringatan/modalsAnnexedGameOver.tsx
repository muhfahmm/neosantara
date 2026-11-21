'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, RotateCcw, Globe, Swords, Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

interface ModalsAnnexedGameOverProps {
    isOpen: boolean;
    countryName?: string;
    attackerCountry?: string;
    onRestart: () => void;
}

export default function ModalsAnnexedGameOver({
    isOpen,
    countryName = "Indonesia",
    attackerCountry,
    onRestart,
}: ModalsAnnexedGameOverProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const resolvedAttacker = attackerCountry || t('game.annexedModal.defaultAttacker');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => setVisible(true), 100);
            return () => clearTimeout(t);
        } else {
            setVisible(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePilihNegara = () => {
        router.push('/page/map_system/pilih-negara');
    };

    return (
        <div
            className={`fixed inset-0 z-[350] flex items-center justify-center p-4 font-sans select-none transition-all duration-700 ${
                visible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            {/* Dramatic Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-rose-950 via-red-950 to-slate-950 opacity-40 animate-pulse" />
                <div className="modal-responsive-shell absolute top-0 left-1/4 bg-red-600/30 rotate-12" />
                <div className="absolute top-0 right-1/3 w-[2px] h-full bg-rose-600/25 -rotate-12" />
            </div>

            {/* Modal Container */}
            <div
                className={`relative w-full max-w-[520px] transition-all duration-700 delay-150 ${
                    visible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
                }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="annexed-game-over-title"
            >
                    <div className="modal-responsive-shell bg-[#0D0505] border-4 border-red-800/80 rounded-3xl shadow-[0_0_80px_rgba(225,29,72,0.4)] overflow-hidden">
                        <RootInfoModalHeader
                            title={t('game.annexedModal.title')}
                            titleId="annexed-game-over-title"
                            icon={<ShieldAlert />}
                            size="standard"
                            actions={<span className="text-[10px] font-black tracking-wider text-red-300/70 uppercase">{t('game.annexedModal.gameOver')}</span>}
                        />

                    {/* Content Section */}
                    <div className="bg-[#FAF4F0] p-6 flex flex-col gap-5">
                        {/* Details Card */}
                        <div className="flex items-center justify-between bg-red-100/80 border border-red-300 rounded-2xl px-4 py-3.5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-red-600 text-white">
                                    <Flag className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">{t('game.annexedModal.victimCountry')}</p>
                                    <p className="text-sm font-black text-slate-900">{countryName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">{t('game.annexedModal.occupyingCountry')}</p>
                                <p className="text-sm font-black text-red-700 flex items-center gap-1 justify-end">
                                    <Swords className="w-3.5 h-3.5" />
                                    {resolvedAttacker}
                                </p>
                            </div>
                        </div>

                        {/* Narrative Description */}
                        <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-4 shadow-inner">
                            <p className="text-[12px] font-medium text-slate-800 leading-relaxed text-center">
                                {t('game.annexedModal.description', { country: countryName, attacker: resolvedAttacker })}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-red-400/60" />
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">{t('game.annexedModal.nextAction')}</span>
                            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-red-400/60" />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={onRestart}
                                className="w-full flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 border border-slate-700 rounded-xl py-3.5 text-[#FAF6EE] font-black text-[11px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.98] group"
                            >
                                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500 text-amber-400" />
                                {t('game.annexedModal.restartSameCountry')}
                            </button>

                            <button
                                onClick={handlePilihNegara}
                                className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 active:from-red-800 border border-red-500 rounded-xl py-3.5 text-[#FAF6EE] font-black text-[11px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.98] group"
                            >
                                <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300 text-white" />
                                {t('game.annexedModal.chooseNewCountry')}
                            </button>
                        </div>

                        {/* Fine Print */}
                        <p className="text-center text-[9px] text-slate-400 font-medium">
                            {t('game.annexedModal.finePrint')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
