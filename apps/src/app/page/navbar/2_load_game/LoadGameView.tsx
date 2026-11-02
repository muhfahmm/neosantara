'use client';

import React from 'react';
import { ArrowLeft, Calendar, Globe, Trash2 } from 'lucide-react';
import type { LoadGameSave } from './loadGameLogic';

interface LoadGameViewProps {
    saves: LoadGameSave[];
    isLoading: boolean;
    onBack: () => void;
    onLoad: (save: LoadGameSave) => void;
    onDelete: (id: number, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function LoadGameView({ saves, isLoading, onBack, onLoad, onDelete }: LoadGameViewProps) {
    return (
        <div className="flex flex-1 flex-col justify-between overflow-hidden">
            <div className="mb-4 flex items-center gap-2 border-b border-[#00FFAA]/20 pb-2 text-left">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Kembali"
                    className="rounded p-1 text-[#6B8A8A] transition-all hover:bg-[#00FFAA]/10 hover:text-[#00FFAA] cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-extrabold tracking-wider text-[#00FFAA]">MUAT PERMAINAN</span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {isLoading ? (
                    <p className="py-16 text-center text-xs font-bold text-[#6B8A8A]">Memuat data simpanan...</p>
                ) : saves.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-xs font-bold tracking-wider text-[#6B8A8A]">TIDAK ADA DATA SIMPANAN</p>
                        <p className="mx-auto mt-2 max-w-[220px] text-[10px] text-[#6B8A8A]/70">Simpan permainan Anda melalui tombol “Simpan Permainan” terlebih dahulu.</p>
                    </div>
                ) : saves.map(save => (
                    <div
                        key={save.id}
                        onClick={() => onLoad(save)}
                        className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#00FFAA]/20 bg-[#0A1A1A] p-3 text-left hover:border-[#00FFAA]/50"
                    >
                        <div className="flex min-w-0 items-start gap-2.5">
                            <img
                                src={`https://flagcdn.com/w80/${save.country_iso?.toLowerCase() || 'un'}.png`}
                                className="mt-0.5 h-5 w-8 rounded-sm border border-[#00FFAA]/20 object-cover"
                                alt="flag"
                                onError={event => { event.currentTarget.src = 'https://flagcdn.com/w80/un.png'; }}
                            />
                            <div className="min-w-0">
                                <p className="truncate text-xs font-black text-[#E0E0E0] group-hover:text-[#00FFAA]">{save.save_name}</p>
                                <p className="mt-1 flex items-center gap-2 text-[9px] font-bold text-[#6B8A8A]">
                                    <Globe className="h-3 w-3" />{save.country_name}
                                    <Calendar className="h-3 w-3" />
                                    {new Date(save.game_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={event => onDelete(save.id, event)}
                            title="Hapus Save File"
                            className="z-10 shrink-0 rounded bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}