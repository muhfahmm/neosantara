'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    ArrowLeft, Volume2, Music, Monitor, Keyboard
} from 'lucide-react';
import { KeywordModal } from '../keyword/keyword';
import { MapSettingsSection } from './4_settings/MapSettingsSection';
import { ExitConfirmModal } from './ExitConfirmModal';
import { LoadGameView } from './2_load_game/LoadGameView';
import { deleteGameSave, fetchLoadableGameSaves, loadGameSave, type LoadGameSave } from './2_load_game/loadGameLogic';
import { soundManager } from '@/lib/soundManager';

interface GameMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveGameClick: () => void;
    onRestartClick: () => void;
    onOpenTutorial?: () => void;
}

export function GameMenuModal({ isOpen, onClose, onSaveGameClick, onRestartClick, onOpenTutorial }: GameMenuModalProps) {
    const [subview, setSubview] = useState<'menu' | 'load' | 'options'>('menu');
    const [saveFiles, setSaveFiles] = useState<LoadGameSave[]>([]);
    const [isLoadingSaves, setIsLoadingSaves] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showKeywordModal, setShowKeywordModal] = useState(false);

    // Options states terhubung ke soundManager
    const [musicVol, setMusicVol] = useState(() => soundManager ? soundManager.getMusicVolume() : 80);
    const [sfxVol, setSfxVol] = useState(() => soundManager ? soundManager.getSfxVolume() : 70);
    const [resolution, setResolution] = useState('1920x1080');
    const [showExitConfirm, setShowExitConfirm] = useState(false);
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
            setShowExitConfirm(false);
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

    const handleCloseWindow = () => {
        setShowExitConfirm(true);
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
        window.location.href = '/page';
    };

    const executeCloseWindow = () => {
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
        if (soundManager) {
            soundManager.stopMusic();
        }
        window.close();
    };

    const isConfirming = showExitConfirm || showMainMenuConfirm;

    return createPortal(
        <React.Fragment>
            <div className={`fixed inset-0 z-[99999999] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent font-sans pointer-events-none transition-opacity duration-150 ${isConfirming ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {/* Notebook-style Game Menu Frame — Green Theme */}
                <div className="bg-[#0A1A1A] border-[6px] border-[#0F2424] rounded-2xl w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] shadow-2xl relative flex flex-col p-4 pl-12 pointer-events-auto select-none overflow-y-auto custom-scrollbar">
                    {/* Silver Binder Spine on the Left */}
                    <div className="absolute left-3.5 top-6 bottom-6 w-2.5 bg-gradient-to-r from-[#2A3F3F] via-[#3D5252] to-[#1F3030] rounded-full shadow-md z-20 border border-[#0A1A1A]/80" />
                    <div className="absolute left-[10px] top-[24px] w-[18px] h-3.5 bg-[#0F2424] rounded-sm border border-[#0A1A1A] z-21 shadow" />
                    <div className="absolute left-[10px] bottom-[24px] w-[18px] h-3.5 bg-[#0F2424] rounded-sm border border-[#0A1A1A] z-21 shadow" />

                    {/* Notebook Rings binding the paper */}
                    <div className="absolute left-[26px] top-12 bottom-12 flex flex-col justify-between items-center py-6 pointer-events-none z-30">
                        {[...Array(11)].map((_, i) => (
                            <div key={i} className="w-3.5 h-3.5 rounded-full bg-[#0A1A1A] shadow-inner border border-[#00FFAA]/20 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#0F2424]" />
                            </div>
                        ))}
                    </div>

                    {/* Main Panel Sheet — Green Theme */}
                    <div className="flex-1 bg-[#0F2424] border-[3px] border-[#00FFAA]/20 rounded-r-xl shadow-inner relative p-8 flex flex-col overflow-hidden">
                        {/* Subtle radial glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

                        {/* Decorative Elegant Divider at the Top */}
                        <div className="flex items-center justify-center gap-1.5 text-[#00FFAA]/40 mb-6 shrink-0">
                            <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#00FFAA]/40" />
                            <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                            <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#00FFAA]/40" />
                        </div>

                        {/* View: MAIN LIST MENU */}
                        {subview === 'menu' && (
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <button
                                        onClick={onClose}
                                        className="w-full bg-[#0A1A1A] hover:bg-[#00FFAA]/10 active:bg-[#00FFAA]/20 border border-[#00FFAA]/30 hover:border-[#00FFAA]/60 rounded py-3 text-center text-[#E0E0E0] hover:text-[#00FFAA] font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        Lanjutkan
                                    </button>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onSaveGameClick();
                                        }}
                                        data-tutorial="tombol-simpan"
                                        className="w-full bg-[#0A1A1A] hover:bg-[#00FFAA]/10 active:bg-[#00FFAA]/20 border border-[#00FFAA]/30 hover:border-[#00FFAA]/60 rounded py-3 text-center text-[#E0E0E0] hover:text-[#00FFAA] font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        Simpan Permainan
                                    </button>
                                    {onOpenTutorial && (
                                        <button
                                            onClick={() => {
                                                onClose();
                                                onOpenTutorial();
                                            }}
                                            className="w-full bg-[#0A1A1A] hover:bg-[#00FFAA]/10 active:bg-[#00FFAA]/20 border border-[#00FFAA]/30 hover:border-[#00FFAA]/60 rounded py-3 text-center text-[#E0E0E0] hover:text-[#00FFAA] font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                        >
                                            Panduan Tutorial
                                        </button>
                                    )}
                                    <button
                                        onClick={handleOpenLoad}
                                        className="w-full bg-[#0A1A1A] hover:bg-[#00FFAA]/10 active:bg-[#00FFAA]/20 border border-[#00FFAA]/30 hover:border-[#00FFAA]/60 rounded py-3 text-center text-[#E0E0E0] hover:text-[#00FFAA] font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        Muat Permainan
                                    </button>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onRestartClick();
                                        }}
                                        className="w-full bg-[#0A1A1A] hover:bg-[#00FFAA]/10 active:bg-[#00FFAA]/20 border border-[#00FFAA]/30 hover:border-[#00FFAA]/60 rounded py-3 text-center text-[#E0E0E0] hover:text-[#00FFAA] font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        Mulai Ulang
                                    </button>
                                    <button
                                        onClick={() => setSubview('options')}
                                        className="w-full bg-[#0A1A1A] hover:bg-[#00FFAA]/10 active:bg-[#00FFAA]/20 border border-[#00FFAA]/30 hover:border-[#00FFAA]/60 rounded py-3 text-center text-[#E0E0E0] hover:text-[#00FFAA] font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        Pengaturan
                                    </button>
                                    <button
                                        onClick={() => setShowKeywordModal(true)}
                                        className="w-full bg-[#0A1A1A] hover:bg-[#00FFAA]/10 active:bg-[#00FFAA]/20 border border-[#00FFAA]/30 hover:border-[#00FFAA]/60 rounded py-3 text-center text-[#E0E0E0] hover:text-[#00FFAA] font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99] flex items-center justify-center gap-2"
                                    >
                                        <Keyboard className="w-4 h-4 text-[#00FFAA]" />
                                        <span>Pintasan Keyboard</span>
                                    </button>
                                </div>

                                <div className="space-y-4 pt-12">
                                    <button
                                        onClick={handleExitGame}
                                        className="w-full bg-[#0A1A1A] hover:bg-[#00FFAA]/10 active:bg-[#00FFAA]/20 border border-[#00FFAA]/30 hover:border-[#00FFAA]/60 rounded py-3.5 text-center text-[#E0E0E0] hover:text-[#00FFAA] font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        Menu Utama
                                    </button>
                                    <button
                                        onClick={handleCloseWindow}
                                        className="w-full bg-[#0A1A1A] hover:bg-rose-500/10 active:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 rounded py-3.5 text-center text-[#E0E0E0] hover:text-rose-300 font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(244,63,94,0.15)] active:scale-[0.99]"
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
                                <div className="flex items-center gap-2 border-b border-[#00FFAA]/20 pb-2 mb-6 shrink-0 text-left">
                                    <button
                                        onClick={() => setSubview('menu')}
                                        className="p-1 rounded hover:bg-[#00FFAA]/10 text-[#6B8A8A] hover:text-[#00FFAA] cursor-pointer transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <span className="font-extrabold text-[14px] text-[#00FFAA] uppercase tracking-wider">PENGATURAN</span>
                                </div>

                                <div className="flex-1 space-y-6 text-left shrink-0">
                                    {/* Option: Music Volume */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-[#E0E0E0] uppercase tracking-wider flex items-center gap-1.5">
                                            <Music className="w-3.5 h-3.5 text-[#00FFAA]" />
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
                                            className="w-full accent-[#00FFAA] cursor-pointer"
                                        />
                                    </div>

                                    {/* Option: Sound Effects */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-[#E0E0E0] uppercase tracking-wider flex items-center gap-1.5">
                                            <Volume2 className="w-3.5 h-3.5 text-[#00FFAA]" />
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
                                            className="w-full accent-[#00FFAA] cursor-pointer"
                                        />
                                    </div>

                                    {/* Option: Resolution */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-[#E0E0E0] uppercase tracking-wider flex items-center gap-1.5">
                                            <Monitor className="w-3.5 h-3.5 text-[#00FFAA]" />
                                            <span>Resolusi Layar</span>
                                        </label>
                                        <select
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value)}
                                            className="w-full bg-[#0A1A1A] border border-[#00FFAA]/30 rounded px-3 py-2 text-xs font-bold text-[#E0E0E0] focus:outline-none focus:border-[#00FFAA] cursor-pointer transition-colors"
                                        >
                                            <option value="1920x1080">1920 x 1080 (16:9)</option>
                                            <option value="1600x900">1600 x 900 (16:9)</option>
                                            <option value="1280x720">1280 x 720 (16:9)</option>
                                        </select>
                                    </div>

                                    {/* Pengaturan Peta (Batas Negara vs Kota) */}
                                    <MapSettingsSection />
                                </div>
                            </div>
                        )}

                        {/* Ink Stamp at the Bottom Right — Green Theme */}
                        <div className="absolute bottom-6 right-6 border-2 border-dashed border-[#00FFAA]/30 text-[#00FFAA]/40 px-3 py-1 font-mono text-[9px] font-black uppercase tracking-wider rounded rotate-[-4deg] pointer-events-none select-none">
                            PRESIDEN EXEC. 16FA-923
                        </div>

                        {/* Decorative Elegant Divider at the Bottom */}
                        <div className="flex items-center justify-center gap-1.5 text-[#00FFAA]/40 mt-6 shrink-0">
                            <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#00FFAA]/40" />
                            <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                            <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#00FFAA]/40" />
                        </div>
                    </div>
                </div>
            </div>
            <KeywordModal
                isOpen={showKeywordModal}
                onClose={() => setShowKeywordModal(false)}
            />
            {/* Modal Konfirmasi Exit Game */}
            <ExitConfirmModal
                isOpen={showExitConfirm}
                onClose={() => setShowExitConfirm(false)}
                onConfirm={executeCloseWindow}
                title="Keluar dari Permainan?"
                subtitle="TERMINASI SESI"
                message="Apakah Anda yakin ingin keluar dari permainan? Progres yang belum disimpan akan hilang."
                confirmText="Keluar Game"
            />
            {/* Modal Konfirmasi Kembali ke Main Menu */}
            <ExitConfirmModal
                isOpen={showMainMenuConfirm}
                onClose={() => setShowMainMenuConfirm(false)}
                onConfirm={executeMainMenu}
                title="Kembali ke Main Menu?"
                subtitle="NAVIGASI UTAMA"
                message="Apakah Anda yakin ingin kembali ke Menu Utama? Progres yang tidak disimpan akan hilang."
                confirmText="Ke Main Menu"
            />
        </React.Fragment>,
        document.body
    );
}