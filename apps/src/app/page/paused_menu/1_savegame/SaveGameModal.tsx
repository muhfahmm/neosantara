'use client';

import React, { useState } from 'react';
import { Calendar, Globe, Plus, RotateCw } from 'lucide-react';
import PausedMenuFrame from '../../root_modals_design_menu/rootFrameMenu';
import { PausedMenuHeader } from '../../root_modals_design_menu/PausedMenuHeader';
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
        <PausedMenuFrame zIndexClass="z-[99999999]">
                <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-4 text-root-text custom-scrollbar sm:p-8">
                    <PausedMenuHeader
                        title={isCreatingNewSlot ? 'Buat Simpanan Baru' : 'Simpan Permainan'}
                        onBack={handleBack}
                        rightContent={
                            !isCreatingNewSlot ? (
                                <button
                                    type="button"
                                    onClick={onCreateNewSlot}
                                    className="flex items-center gap-1 rounded border border-root-accent/40 bg-root-accent/15 px-3 py-1.5 text-[11px] font-extrabold uppercase text-root-accent cursor-pointer"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Slot Baru
                                </button>
                            ) : null
                        }
                    />

                    {!isCreatingNewSlot ? (
                        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                            <div className="space-y-2">
                                {isLoading ? (
                                    <p className="py-12 text-center text-xs text-root-subtle">Memuat data simpanan...</p>
                                ) : existingSaveFiles.length === 0 ? (
                                    <p className="py-12 text-center text-xs text-root-subtle">Belum ada simpanan sebelumnya.</p>
                                ) : existingSaveFiles.map(save => (
                                    <div key={save.id} className="flex items-center justify-between gap-3 rounded-lg border border-root-accent/20 bg-root-canvas p-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-black">{save.save_name}</p>
                                            <p className="mt-1 flex items-center gap-2 text-[10px] text-root-subtle">
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
                                <div className="rounded-lg border border-root-accent/25 bg-root-canvas p-3">
                                    <p className="text-xs font-black">{selectedCountry?.country ?? 'Negara'}</p>
                                    <p className="mt-1 text-[10px] text-root-subtle">{dateLabel} · Anggaran: {budget || '-'} NEO</p>
                                </div>
                                <label className="block text-[10px] font-bold uppercase text-root-subtle">
                                    Nama Simpanan
                                    <input
                                        value={saveName}
                                        onChange={event => onSaveNameChange(event.target.value)}
                                        maxLength={100}
                                        autoFocus
                                        className="mt-2 w-full rounded border border-root-accent/30 bg-root-canvas px-3 py-2 text-sm text-root-text outline-none focus:border-root-accent"
                                    />
                                </label>
                            </div>
                            <div className="flex justify-end border-t border-root-accent/15 pt-4">
                                <button type="button" onClick={() => onSave(null, saveName)} disabled={isSaving} className="rounded border border-root-accent/60 bg-root-accent/20 px-5 py-2.5 text-xs font-extrabold uppercase text-root-accent disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                                    {isSaving ? 'Menyimpan...' : 'Simpan Baru'}
                                </button>
                            </div>
                        </div>
                    )}

                    {saveToOverwrite && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-root-canvas/90 p-6">
                            <div className="w-full max-w-sm space-y-4 rounded-xl border-2 border-amber-500/60 bg-root-canvas p-5 text-center">
                                <RotateCw className="mx-auto h-6 w-6 text-amber-400" />
                                <h3 className="text-sm font-extrabold">Timpa “{saveToOverwrite.save_name}”?</h3>
                                <p className="text-xs text-root-subtle">Progres permainan saat ini akan menimpa slot ini.</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => setSaveToOverwrite(null)} disabled={isSaving} className="rounded border border-root-accent/30 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Batal</button>
                                    <button type="button" onClick={() => onSave(saveToOverwrite.id, saveToOverwrite.save_name)} disabled={isSaving} className="rounded border border-amber-500 bg-amber-500/25 py-2 text-xs font-extrabold text-amber-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                                        {isSaving ? 'Menyimpan...' : 'Ya, Timpa'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
        </PausedMenuFrame>
    );
}