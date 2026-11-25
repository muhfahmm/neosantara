'use client';

import { useState } from 'react';
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import Image from 'next/image';
import { DEFENSE_UNIT_LABELS, getDefenseUnitCardImage } from '../navigasi_menu/2_navigasi_bawah/buildingCardImages';
import NotebookModalWrapper from '../navigasi_menu/2_navigasi_bawah/NotebookModalWrapper';
import ModalCloseButton from '../root_modals_design_menu/ModalCloseButton';
import RootInfoModalHeader from '../root_modals_design_menu/RootInfoModalHeader';
import { AlertTriangle, Swords, ShieldAlert, Flag } from 'lucide-react';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getIsoForCountryName } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbCountryIso';

export interface WarUnitLoss {
    unitKey: string;
    quantity: number;
}

export interface WarCountryParty {
    name: string;
    iso?: string;
    losses: WarUnitLoss[];
}

export interface ResultModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    losses?: WarUnitLoss[];
    attackerParty?: WarCountryParty;
    targetParty?: WarCountryParty;
    type?: 'success' | 'error' | 'info';
    compact?: boolean;
    hideLosses?: boolean;
    onClose: () => void;
}

export default function ResultModal({
    isOpen,
    title,
    message,
    losses = [],
    attackerParty,
    targetParty,
    type = 'success',
    compact = false,
    hideLosses = false,
    onClose,
}: ResultModalProps) {
    const { t } = useLanguage();
    const [selectedTab, setSelectedTab] = useState<'attacker' | 'target'>('attacker');
    if (typeof document === 'undefined' || !isOpen) return null;

    const hasParties = Boolean(attackerParty || targetParty);
    const activeParty = selectedTab === 'attacker'
        ? (attackerParty || { name: 'Pasukan Anda', losses })
        : (targetParty || { name: 'Pasukan Musuh', losses: [] });

    const currentLosses = hasParties ? (activeParty.losses || []) : losses;
    const isLosses = currentLosses.length > 0;
    const isError = type === 'error';

    // Helper render avatar/bendera party
    const renderFlag = (iso?: string, countryName?: string) => {
        let effectiveIso = String(iso || '').trim().toLowerCase();
        if (!effectiveIso || effectiveIso === 'un' || effectiveIso.length !== 2) {
            const resolved = countryName ? getIsoForCountryName(countryName) : '';
            if (resolved && resolved !== 'un') {
                effectiveIso = resolved.toLowerCase();
            }
        }

        if (!effectiveIso) {
            return (
                <div className="flex h-5 w-7 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-white shadow-inner">
                    <Flag className="h-3 w-3 text-root-accent" />
                </div>
            );
        }
        return (
            <Image
                src={`https://flagcdn.com/w80/${effectiveIso}.png`}
                alt={countryName || effectiveIso}
                width={28}
                height={20}
                className="h-4 w-6 rounded-sm object-cover shadow"
                onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
                }}
            />
        );
    };

    // Helper untuk mengambil nama alutsista sesuai bahasa yang sedang aktif dari database translasi
    const getUnitLabel = (unitKey: string): string => {
        const lookupKey = unitKey === 'pasukan_infanteri' ? 'barak' : unitKey;
        const militerTrans = t(`navigation_military_menu.units.${lookupKey}`);
        if (militerTrans && militerTrans !== `navigation_military_menu.units.${lookupKey}`) {
            return militerTrans;
        }
        const pertahananTrans = t(`navigation_defense_attack.units.${lookupKey}`);
        if (pertahananTrans && pertahananTrans !== `navigation_defense_attack.units.${lookupKey}`) {
            return pertahananTrans;
        }
        return DEFENSE_UNIT_LABELS[unitKey] || unitKey.replace(/_/g, ' ');
    };

    const renderLossCards = (items: WarUnitLoss[]) => {
        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <ShieldAlert className="mb-2 h-10 w-10 text-slate-500/70" />
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
                        Tidak Ada Kerugian Alutsista Tercatat
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3">
                {items.map((loss) => {
                    const imageKey = loss.unitKey === 'pasukan_infanteri' ? 'barak' : loss.unitKey;
                    const image = getDefenseUnitCardImage(imageKey);
                    const label = getUnitLabel(loss.unitKey);
                    return (
                        <article
                            key={loss.unitKey}
                            className="flex items-center gap-2.5 lg:gap-3 rounded-lg border border-root-accent/20 bg-root-canvas p-2.5 lg:p-3 shadow-sm hover:border-root-accent/40 transition-colors"
                        >
                            {image && (
                                <Image
                                    src={image}
                                    alt={label}
                                    width={40}
                                    height={40}
                                    className="h-9 w-9 lg:h-11 lg:w-11 shrink-0 object-contain"
                                />
                            )}
                            <div className="min-w-0">
                                <p className="text-xs lg:text-sm font-bold uppercase leading-tight text-[#A0B0B0] truncate">
                                    {label}
                                </p>
                                <p className="text-base lg:text-lg font-black text-rose-400">
                                    −{loss.quantity.toLocaleString('id-ID')}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>
        );
    };

    if (compact) {
        return (
            <NotebookModalWrapper compact zIndexClass="z-[500000]">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="result-modal-title"
                    className="w-full min-w-0 flex flex-col p-4 sm:p-5 font-sans text-white"
                >
                    <RootInfoModalHeader
                        title={title}
                        titleId="result-modal-title"
                        onClose={onClose}
                        icon={isError ? <AlertTriangle /> : <Swords />}
                        size="compact"
                    />
                    <div className="flex-1">
                        {Boolean(title && (!isLosses || hideLosses)) && (
                            <p className="text-sm sm:text-base text-[#A0B0B0] leading-relaxed font-medium whitespace-pre-wrap">
                                {message}
                            </p>
                        )}

                        {!hideLosses && hasParties && (
                            <div className="mt-2 mb-4 flex border-b border-root-accent/20">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTab('attacker')}
                                    className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                                        selectedTab === 'attacker'
                                            ? 'border-root-accent text-root-accent bg-root-accent/10'
                                            : 'border-transparent text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    {renderFlag(attackerParty?.iso, attackerParty?.name)}
                                    <span>{attackerParty?.name || 'Pasukan Anda'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedTab('target')}
                                    className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                                        selectedTab === 'target'
                                            ? 'border-rose-400 text-rose-400 bg-rose-400/10'
                                            : 'border-transparent text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    {renderFlag(targetParty?.iso, targetParty?.name)}
                                    <span>{targetParty?.name || 'Pasukan Lawan'}</span>
                                </button>
                            </div>
                        )}

                        {!hideLosses && (
                            <section aria-label={t('game.warResultModal.lossesAria')} className="pt-1">
                                <div className="mb-3 flex items-center justify-between">
                                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-root-accent">
                                        {t('game.warResultModal.lossesTitle')}
                                    </h4>
                                    {hasParties && (
                                        <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400">
                                            {activeParty.name}
                                        </span>
                                    )}
                                </div>
                                {renderLossCards(currentLosses)}
                            </section>
                        )}
                    </div>
                    <div className="mt-6 flex flex-col justify-end gap-3 border-t border-root-accent/20 pt-4 sm:flex-row">
                        <ModalCloseButton
                            onClick={onClose}
                            appearance="custom"
                            className={`w-full rounded-xl border px-6 py-2 text-center text-[11px] font-black uppercase tracking-widest transition-all sm:w-auto sm:text-xs ${isError ? 'border-rose-500/50 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'border-root-accent/30 bg-root-canvas text-root-text hover:bg-[#142A2A]'}`}
                        >{t('common.close')}</ModalCloseButton>
                    </div>
                </div>
            </NotebookModalWrapper>
        );
    }

    const modalContent = (
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="result-modal-title"
                className={`relative flex h-full flex-col overflow-hidden rounded-xl border ${isError ? 'border-rose-500/40' : 'border-root-accent/20'} bg-root-canvas font-sans shadow-[0_0_30px_rgba(0,255,170,0.15)]`}
            >
                <RootInfoModalHeader
                    title={isError ? t('game.warResultModal.defeatTitle') : t('game.warResultModal.victoryTitle')}
                    titleId="result-modal-title"
                    onClose={onClose}
                    icon={isError ? <AlertTriangle /> : <Swords />}
                    size="standard"
                />

                {/* Body Content */}
                <div className="relative z-10 flex-1 min-h-0 p-4 sm:p-5 lg:p-6 overflow-y-auto bg-root-canvas/80 [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-root-canvas [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-root-accent/20 [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-root-accent [&::-webkit-scrollbar-thumb]:to-[#00B37A] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-root-canvas [&::-webkit-scrollbar-thumb]:shadow-[0_0_10px_rgba(0,255,170,0.6)] hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-root-accent [&::-webkit-scrollbar-button]:hidden">
                    {Boolean(title && (!isLosses || hideLosses)) && (
                        <h3
                            className={`text-base sm:text-lg lg:text-xl font-black uppercase tracking-wide mb-3 lg:mb-4 ${isError ? 'text-rose-400' : 'text-root-text'}`}
                        >
                            {title}
                        </h3>
                    )}
                    {Boolean(message && (!isLosses || hideLosses)) && (
                        <p className="text-xs sm:text-sm lg:text-base text-[#A0B0B0] leading-relaxed font-medium whitespace-pre-wrap">
                            {message}
                        </p>
                    )}

                    {/* Tab Menu jika terdapat kedua belah pihak */}
                    {!hideLosses && hasParties && (
                        <div className="mb-4 flex items-center gap-2 border-b border-root-accent/20 pb-1">
                            <button
                                type="button"
                                onClick={() => setSelectedTab('attacker')}
                                className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    selectedTab === 'attacker'
                                        ? 'border border-root-accent/60 bg-root-accent/20 text-root-accent shadow-[0_0_12px_rgba(0,255,170,0.2)]'
                                        : 'border border-transparent bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                }`}
                            >
                                {renderFlag(attackerParty?.iso, attackerParty?.name)}
                                <span>{attackerParty?.name || 'Pasukan Anda'}</span>
                                {attackerParty?.losses && attackerParty.losses.length > 0 && (
                                    <span className="rounded-full bg-root-accent/20 px-2 py-0.5 text-[10px] font-black text-root-accent">
                                        {attackerParty.losses.length}
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedTab('target')}
                                className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    selectedTab === 'target'
                                        ? 'border border-rose-500/60 bg-rose-500/20 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                                        : 'border border-transparent bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                }`}
                            >
                                {renderFlag(targetParty?.iso, targetParty?.name)}
                                <span>{targetParty?.name || 'Pasukan Lawan'}</span>
                                {targetParty?.losses && targetParty.losses.length > 0 && (
                                    <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-black text-rose-400">
                                        {targetParty.losses.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                    {!hideLosses && (
                        <section aria-label={t('game.warResultModal.lossesAria')} className="pt-1">
                            <div className="mb-3 lg:mb-4 flex items-center justify-between">
                                <h4 className="text-xs sm:text-sm lg:text-base font-black uppercase tracking-wider text-root-accent">
                                    {t('game.warResultModal.lossesTitle')}
                                </h4>
                                {hasParties && (
                                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-300">
                                        {activeParty.name}
                                    </span>
                                )}
                            </div>
                            {renderLossCards(currentLosses)}
                        </section>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-4 border-t border-root-accent/20 bg-root-canvas flex justify-end shrink-0">
                    <SharedModalCloseButton
                        type="button"
                        onClick={onClose}
                        className={`px-5 lg:px-6 py-1.5 lg:py-2 rounded-lg font-black text-xs lg:text-sm uppercase tracking-wider cursor-pointer transition-all ${isError
                            ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30'
                            : 'bg-root-accent text-root-canvas hover:bg-root-accent/80 shadow-[0_0_10px_rgba(0,255,170,0.2)]'
                        }`}
                     appearance="custom">
                        {t('common.close')}
                    </SharedModalCloseButton>
                </div>
            </div>
    );

    return <NotebookModalWrapper zIndexClass="z-[500000]">{modalContent}</NotebookModalWrapper>;
}