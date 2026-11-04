'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Volume2, Music, Monitor, Keyboard
} from 'lucide-react';
import { KeywordModal } from './5_keyword/keyword';
import { MapSettingsSection } from './4_settings/MapSettingsSection';
import { ThemeSettingsSection } from './4_settings/ThemeSettingsSection';
import { ExitConfirmModal } from './ExitConfirmModal';
import { LoadGameView } from './2_load_game/LoadGameView';
import { deleteGameSave, fetchLoadableGameSaves, loadGameSave, type LoadGameSave } from './2_load_game/loadGameLogic';
import PausedMenuFrame from '../root_modals_design_menu/rootFrameMenu';
import { soundManager } from '@/lib/soundManager';

interface GameMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveGameClick: () => void;
    onRestartClick: () => void;
}

export function GameMenuModal({ isOpen, onClose, onSaveGameClick, onRestartClick }: GameMenuModalProps) {
    const router = useRouter();
    const [subview, setSubview] = useState<'menu' | 'load' | 'options'>('menu');
    const [saveFiles, setSaveFiles] = useState<LoadGameSave[]>([]);
    const [isLoadingSaves, setIsLoadingSaves] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showKeywordModal, setShowKeywordModal] = useState(false);

    // Options states terhubung ke soundManager
    const [musicVol, setMusicVol] = useState(() => soundManager ? soundManager.getMusicVolume() : 80);
    const [sfxVol, setSfxVol] = useState(() => soundManager ? soundManager.getSfxVolume() : 70);
    const [resolution, setResolution] = useState('1920x1080');
    const [showMainMenuConfirm, setShowMainMenuConfirm] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (soundManager) {
            setMusicVol(soundManager.getMusicVolume());
            setSfxVol(soundManager.getSfxVolume());
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSubview('menu');
            setShowKeywordModal(false);
            setShowMainMenuConfirm(false);
            if (soundManager) {
                setMusicVol(soundManager.getMusicVolume());
                setSfxVol(soundManager.getSfxVolume());
            }
            // Auto pause simulation game time when menu modal is opened
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('pause_game_time', { detail: { source: 'game-menu' } }));
            }
        }
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const fetchSaveFiles = async () => {
        setIsLoadingSaves(true);
        try {
            setSaveFiles(await fetchLoadableGameSaves());
        } catch (error) {
            console.error("Error fetching save files:", error);
        } finally {
            setIsLoadingSaves(false);
        }
    };

    const handleOpenLoad = () => {
        fetchSaveFiles();
        setSubview('load');
    };

    const handleDeleteSave = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!window.confirm("Apakah Anda yakin ingin menghapus save file ini secara permanen?")) {
            return;
        }

        try {
            await deleteGameSave(id);
            setSaveFiles(prev => prev.filter(save => save.id !== id));
        } catch (error) {
            console.error("Error deleting save:", error);
            alert(error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus");
        }
    };

    const handleExitGame = () => {
        setShowMainMenuConfirm(true);
    };

    const executeMainMenu = () => {
        try {
            localStorage.removeItem('dailyRewardData');
            sessionStorage.removeItem('programNuklirActive');
            sessionStorage.removeItem('program_nuklir_modal_open');
            sessionStorage.removeItem('icbm_detail_open');
            sessionStorage.removeItem('perang_nuklir_detail_open');
            sessionStorage.removeItem('presiden_simulator_load_save');
            localStorage.removeItem('programNuklirActive');
            localStorage.removeItem('icbmBuildTask');
        } catch (e) {}
        router.replace('/page');
    };

    const isConfirming = showMainMenuConfirm;

    return createPortal(
        <React.Fragment>
            <div className={isConfirming ? 'pointer-events-none' : 'pointer-events-auto'}>
                <PausedMenuFrame zIndexClass="z-[99999999]">
                    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-4 custom-scrollbar sm:p-8">
                        {/* Decorative Elegant Divider at the Top */}
                        <div className="flex items-center justify-center gap-1.5 text-root-accent/40 mb-6 shrink-0">
                            <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-root-accent/40" />
                            <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                            <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-root-accent/40" />
                        </div>

                        {/* View: MAIN LIST MENU */}
                        {subview === 'menu' && (
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <button
                                        onClick={onClose}
                                        className="w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        Lanjutkan
                                    </button>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onSaveGameClick();
                                        }}
                                        data-tutorial="tombol-simpan"
                                        className="w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        Simpan Permainan
                                    </button>
                                    <button
                                        onClick={handleOpenLoad}
                                        className="w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        Muat Permainan
                                    </button>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onRestartClick();
                                        }}
                                        className="w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        Mulai Ulang
                                    </button>
                                    <button
                                        onClick={() => setSubview('options')}
                                        className="w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        Pengaturan
                                    </button>
                                    <button
                                        onClick={() => setShowKeywordModal(true)}
                                        className="w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99] flex items-center justify-center gap-2"
                                    >
                                        <Keyboard className="w-4 h-4 text-root-accent" />
                                        <span>Pintasan Keyboard</span>
                                    </button>
                                </div>

                                <div className="pt-12">
                                    <button
                                        onClick={handleExitGame}
                                        className="w-full bg-root-canvas hover:bg-rose-500/10 active:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 rounded py-3.5 text-center text-root-text hover:text-rose-300 font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(244,63,94,0.15)] active:scale-[0.99]"
                                    >
                                        Keluar Permainan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* View: LOAD GAME LIST */}
                        {subview === 'load' && (
                            <LoadGameView
                                saves={saveFiles}
                                isLoading={isLoadingSaves}
                                onBack={() => setSubview('menu')}
                                onLoad={loadGameSave}
                                onDelete={handleDeleteSave}
                            />
                        )}

                        {/* View: OPTIONS CONFIG */}
                        {subview === 'options' && (
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex items-center gap-2 border-b border-root-accent/20 pb-2 mb-6 shrink-0 text-left">
                                    <button
                                        onClick={() => setSubview('menu')}
                                        className="p-1 rounded hover:bg-root-accent/10 text-root-subtle hover:text-root-accent cursor-pointer transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <span className="font-extrabold text-[14px] text-root-accent uppercase tracking-wider">PENGATURAN</span>
                                </div>

                                <div className="flex-1 space-y-6 text-left shrink-0">
                                    {/* Option: Music Volume */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-root-text uppercase tracking-wider flex items-center gap-1.5">
                                            <Music className="w-3.5 h-3.5 text-root-accent" />
                                            <span>Volume Musik ({musicVol}%)</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={musicVol}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setMusicVol(val);
                                                soundManager?.setMusicVolume(val);
                                            }}
                                            className="w-full accent-root-accent cursor-pointer"
                                        />
                                    </div>

                                    {/* Option: Sound Effects */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-root-text uppercase tracking-wider flex items-center gap-1.5">
                                            <Volume2 className="w-3.5 h-3.5 text-root-accent" />
                                            <span>Efek Suara ({sfxVol}%)</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={sfxVol}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setSfxVol(val);
                                                soundManager?.setSfxVolume(val);
                                            }}
                                            className="w-full accent-root-accent cursor-pointer"
                                        />
                                    </div>

                                    {/* Option: Resolution */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-root-text uppercase tracking-wider flex items-center gap-1.5">
                                            <Monitor className="w-3.5 h-3.5 text-root-accent" />
                                            <span>Resolusi Layar</span>
                                        </label>
                                        <select
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value)}
                                            className="w-full bg-root-canvas border border-root-accent/30 rounded px-3 py-2 text-xs font-bold text-root-text focus:outline-none focus:border-root-accent cursor-pointer transition-colors"
                                        >
                                            <option value="1920x1080">1920 x 1080 (16:9)</option>
                                            <option value="1600x900">1600 x 900 (16:9)</option>
                                            <option value="1280x720">1280 x 720 (16:9)</option>
                                        </select>
                                    </div>

                                    <ThemeSettingsSection />

                                    {/* Pengaturan Peta (Batas Negara vs Kota) */}
                                    <MapSettingsSection />
                                </div>
                            </div>
                        )}

                        {/* Ink Stamp at the Bottom Right — Green Theme */}
                        <div className="absolute bottom-6 right-6 border-2 border-dashed border-root-accent/30 text-root-accent/40 px-3 py-1 font-mono text-[9px] font-black uppercase tracking-wider rounded rotate-[-4deg] pointer-events-none select-none">
                            PRESIDEN EXEC. 16FA-923
                        </div>

                        {/* Decorative Elegant Divider at the Bottom */}
                        <div className="flex items-center justify-center gap-1.5 text-root-accent/40 mt-6 shrink-0">
                            <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-root-accent/40" />
                            <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                            <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-root-accent/40" />
                        </div>
                    </div>
                </PausedMenuFrame>
            </div>
            <KeywordModal
                isOpen={showKeywordModal}
                onClose={() => setShowKeywordModal(false)}
            />
            {/* Modal konfirmasi sebelum kembali ke menu utama */}
            <ExitConfirmModal
                isOpen={showMainMenuConfirm}
                onClose={() => setShowMainMenuConfirm(false)}
                onConfirm={executeMainMenu}
                title="Keluar Permainan?"
                subtitle="KONFIRMASI KELUAR"
                message="Anda akan kembali ke Menu Utama. Progres yang belum disimpan akan hilang."
                confirmText="Ya, Keluar Permainan"
            />
        </React.Fragment>,
        document.body
    );
}