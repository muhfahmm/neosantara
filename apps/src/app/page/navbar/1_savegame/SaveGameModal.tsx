'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar, Globe, Plus, RotateCw } from 'lucide-react';
import type { GameSaveRecord } from './saveGameLogic';

interface SaveGameModalProps {
    selectedCountry: { country: string; iso: string } | null;
    existingSaveFiles: GameSaveRecord[];
    isLoading: boolean;
    isSaving: boolean;
    isCreatingNewSlot: boolean;
    saveName: string;
    dateLabel: string;
    budget: number | string;
    onSaveNameChange: (name: string) => void;
    onBackToMenu: () => void;
    onCreateNewSlot: () => void;
    onBackToSlots: () => void;
    onSave: (saveId: number | null, saveName: string) => void;
}

export function SaveGameModal({
    selectedCountry,
    existingSaveFiles,
    isLoading,
    isSaving,
    isCreatingNewSlot,
    saveName,
    dateLabel,
    budget,
    onSaveNameChange,
    onBackToMenu,
    onCreateNewSlot,
    onBackToSlots,
    onSave,
}: SaveGameModalProps) {
    const [saveToOverwrite, setSaveToOverwrite] = useState<GameSaveRecord | null>(null);
    const handleBack = () => {
        if (isCreatingNewSlot && existingSaveFiles.length > 0) {
            onBackToSlots();
            return;
        }
        onBackToMenu();
    };

    return (
        <div className="fixed inset-0 z-[99999999] flex items-center justify-center pt-[88px] sm:pt-[100px] lg:pt-[clamp(92px,10dvh,115px)] pb-3 sm:pb-4 lg:pb-5 px-3 sm:px-6 lg:px-10 bg-transparent font-sans pointer-events-none select-none">
            <section className="bg-[#0A1A1A] border-[6px] border-[#0F2424] rounded-2xl w-full max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl h-full max-h-[calc(100dvh-100px)] sm:max-h-[calc(100dvh-116px)] lg:max-h-[calc(100dvh-112px)] shadow-2xl relative flex flex-col min-w-0 p-3 sm:p-4 pl-10 sm:pl-12 pointer-events-auto overflow-y-auto custom-scrollbar">
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
                <div className="flex-1 bg-[#0F2424] border-[3px] border-[#00FFAA]/20 rounded-r-xl shadow-inner relative p-8 flex flex-col overflow-hidden text-[#E0E0E0]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />
                    <div className="flex items-center justify-center gap-1.5 text-[#00FFAA]/40 mb-4 shrink-0">
                        <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#00FFAA]/40" />
                        <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                        <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#00FFAA]/40" />
                    </div>
                    <header className="mb-4 flex shrink-0 items-center justify-between border-b border-[#00FFAA]/20 pb-3 text-left">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleBack}
                                aria-label="Kembali"
                                className="rounded p-1 text-[#6B8A8A] transition-all hover:bg-[#00FFAA]/10 hover:text-[#00FFAA] cursor-pointer"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#00FFAA]">
                                {isCreatingNewSlot ? 'BUAT SIMPANAN BARU' : 'SIMPAN PERMAINAN'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isCreatingNewSlot && (
                                <button
                                    type="button"
                                    onClick={onCreateNewSlot}
                                    className="flex items-center gap-1 rounded border border-[#00FFAA]/40 bg-[#00FFAA]/15 px-3 py-1.5 text-[11px] font-extrabold uppercase text-[#00FFAA] cursor-pointer"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Slot Baru
                                </button>
                            )}
                        </div>
                    </header>

                    {!isCreatingNewSlot ? (
                        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                            <div className="space-y-2">
                                {isLoading ? (
                                    <p className="py-12 text-center text-xs text-[#6B8A8A]">Memuat data simpanan...</p>
                                ) : existingSaveFiles.length === 0 ? (
                                    <p className="py-12 text-center text-xs text-[#6B8A8A]">Belum ada simpanan sebelumnya.</p>
                                ) : existingSaveFiles.map(save => (
                                    <div key={save.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#00FFAA]/20 bg-[#0A1A1A] p-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-black">{save.save_name}</p>
                                            <p className="mt-1 flex items-center gap-2 text-[10px] text-[#6B8A8A]">
                                                <Globe className="h-3 w-3" />{save.country_name}
                                                <Calendar className="h-3 w-3" />
                                                {new Date(save.game_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSaveToOverwrite(save)}
                                            disabled={isSaving}
                                            className="shrink-0 rounded border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-[10px] font-extrabold uppercase text-amber-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            Timpa
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col justify-between gap-6">
                            <div className="space-y-4">
                                <div className="rounded-lg border border-[#00FFAA]/25 bg-[#0A1A1A] p-3">
                                    <p className="text-xs font-black">{selectedCountry?.country ?? 'Negara'}</p>
                                    <p className="mt-1 text-[10px] text-[#6B8A8A]">{dateLabel} · Anggaran: {budget || '-'} NEO</p>
                                </div>
                                <label className="block text-[10px] font-bold uppercase text-[#6B8A8A]">
                                    Nama Simpanan
                                    <input
                                        value={saveName}
                                        onChange={event => onSaveNameChange(event.target.value)}
                                        maxLength={100}
                                        autoFocus
                                        className="mt-2 w-full rounded border border-[#00FFAA]/30 bg-[#0A1A1A] px-3 py-2 text-sm text-[#E0E0E0] outline-none focus:border-[#00FFAA]"
                                    />
                                </label>
                            </div>
                            <div className="flex justify-end border-t border-[#00FFAA]/15 pt-4">
                                <button type="button" onClick={() => onSave(null, saveName)} disabled={isSaving} className="rounded border border-[#00FFAA]/60 bg-[#00FFAA]/20 px-5 py-2.5 text-xs font-extrabold uppercase text-[#00FFAA] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                                    {isSaving ? 'Menyimpan...' : 'Simpan Baru'}
                                </button>
                            </div>
                        </div>
                    )}

                    {saveToOverwrite && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0A1A1A]/90 p-6">
                            <div className="w-full max-w-sm space-y-4 rounded-xl border-2 border-amber-500/60 bg-[#0A1A1A] p-5 text-center">
                                <RotateCw className="mx-auto h-6 w-6 text-amber-400" />
                                <h3 className="text-sm font-extrabold">Timpa “{saveToOverwrite.save_name}”?</h3>
                                <p className="text-xs text-[#6B8A8A]">Progres permainan saat ini akan menimpa slot ini.</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => setSaveToOverwrite(null)} disabled={isSaving} className="rounded border border-[#00FFAA]/30 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Batal</button>
                                    <button type="button" onClick={() => onSave(saveToOverwrite.id, saveToOverwrite.save_name)} disabled={isSaving} className="rounded border border-amber-500 bg-amber-500/25 py-2 text-xs font-extrabold text-amber-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                                        {isSaving ? 'Menyimpan...' : 'Ya, Timpa'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}