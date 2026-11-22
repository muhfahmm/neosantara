'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
    Volume2, Music, Monitor, Keyboard, Cloud, Info
} from 'lucide-react';
import { KeywordModal } from './5_keyword/keyword';
import { MapSettingsSection } from './4_settings/MapSettingsSection';
import { ThemeSettingsSection } from './4_settings/ThemeSettingsSection';
import { LanguageSettingsSection } from './terjemahan_paused_menu/LanguageSettingsSection';
import { useLanguage } from './terjemahan_paused_menu/languageLogic';
import { ExitConfirmModal } from './ExitConfirmModal';
import { LoadGameView } from './2_load_game/LoadGameView';
import { deleteGameSave, fetchLoadableGameSaves, loadGameSave, type LoadGameSave } from './2_load_game/loadGameLogic';
import PausedMenuFrame from '../root_modals_design_menu/rootFrameMenu';
import { PausedMenuHeader } from '../root_modals_design_menu/PausedMenuHeader';
import { soundManager } from '@/lib/soundManager';

interface GameMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveGameClick: () => void;
    onRestartClick: () => void;
}

export function GameMenuModal({ isOpen, onClose, onSaveGameClick, onRestartClick }: GameMenuModalProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const [subview, setSubview] = useState<'menu' | 'load' | 'options' | 'googleLogin'>('menu');
    const [saveFiles, setSaveFiles] = useState<LoadGameSave[]>([]);
    const [isLoadingSaves, setIsLoadingSaves] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showKeywordModal, setShowKeywordModal] = useState(false);
    const [showGooglePrototypeNotice, setShowGooglePrototypeNotice] = useState(false);

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
            localStorage.removeItem('neosantara_covert_personnel');
            window.dispatchEvent(new CustomEvent('neosantara_covert_personnel_updated', { detail: { mataMata: 0, penyabot: 0 } }));
        } catch (e) {}
        router.replace('/page');
    };

    const isConfirming = showMainMenuConfirm;

    return createPortal(
        <React.Fragment>
            <div className={isConfirming ? 'pointer-events-none' : 'pointer-events-auto'}>
                <PausedMenuFrame zIndexClass="z-[99999999]">
                    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="paused-menu-content relative flex min-h-0 flex-1 flex-col overflow-y-auto p-4 custom-scrollbar sm:p-8">
                        {/* View: MAIN LIST MENU */}
                        {subview === 'menu' && (
                            <div className="paused-main-menu flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="paused-menu-divider flex items-center justify-center gap-1.5 text-root-accent/40 mb-6 shrink-0">
                                        <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-root-accent/40" />
                                        <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                                        <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-root-accent/40" />
                                    </div>
                                    <div className="paused-menu-actions flex flex-col gap-3">
                                    <button
                                        onClick={onClose}
                                        className="paused-menu-action w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        {t('paused_menu.main.resume')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onSaveGameClick();
                                        }}
                                        data-tutorial="tombol-simpan"
                                        className="paused-menu-action w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        {t('paused_menu.main.saveGame')}
                                    </button>
                                    <button
                                        onClick={handleOpenLoad}
                                        className="paused-menu-action w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        {t('paused_menu.main.loadGame')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onRestartClick();
                                        }}
                                        className="paused-menu-action w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        {t('paused_menu.main.restart')}
                                    </button>
                                    <button
                                        onClick={() => setSubview('options')}
                                        className="paused-menu-action w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99]"
                                    >
                                        {t('paused_menu.main.settings')}
                                    </button>
                                    <button
                                        onClick={() => setShowKeywordModal(true)}
                                        className="paused-menu-action paused-menu-keyboard-action w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99] flex items-center justify-center gap-2"
                                    >
                                        <Keyboard className="w-4 h-4 text-root-accent" />
                                        <span>{t('paused_menu.main.keyboardShortcuts')}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowGooglePrototypeNotice(false);
                                            setSubview('googleLogin');
                                        }}
                                        className="paused-menu-action w-full bg-root-canvas hover:bg-root-accent/10 active:bg-root-accent/20 border border-root-accent/30 hover:border-root-accent/60 rounded py-3 text-center text-root-text hover:text-root-accent font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(0,255,170,0.15)] active:scale-[0.99] flex items-center justify-center gap-2"
                                    >
                                        <Cloud className="w-4 h-4 text-root-accent" />
                                        <span>{t('paused_menu.main.googleLogin')}</span>
                                    </button>
                                    </div>
                                </div>

                                <div className="paused-menu-exit pt-12">
                                    <button
                                        onClick={handleExitGame}
                                        className="paused-menu-action w-full bg-root-canvas hover:bg-rose-500/10 active:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 rounded py-3.5 text-center text-root-text hover:text-rose-300 font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_12px_rgba(244,63,94,0.15)] active:scale-[0.99]"
                                    >
                                        {t('paused_menu.main.exitGame')}
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
                                <PausedMenuHeader
                                    title={t('paused_menu.settings.title')}
                                    onBack={() => setSubview('menu')}
                                    backLabel={t('paused_menu.settings.backLabel')}
                                />

                                <div className="flex-1 space-y-6 text-left shrink-0">
                                    {/* Option: Music Volume */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-root-text uppercase tracking-wider flex items-center gap-1.5">
                                            <Music className="w-3.5 h-3.5 text-root-accent" />
                                            <span>{t('paused_menu.settings.musicVolume', { value: musicVol })}</span>
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
                                            <span>{t('paused_menu.settings.sfxVolume', { value: sfxVol })}</span>
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
                                            <span>{t('paused_menu.settings.resolution')}</span>
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

                                    {/* Pengaturan Bahasa */}
                                    <LanguageSettingsSection />

                                    {/* Pengaturan Peta (Batas Negara vs Kota) */}
                                    <MapSettingsSection />
                                </div>
                            </div>
                        )}

                        {subview === 'googleLogin' && (
                            <div className="flex-1">
                                <PausedMenuHeader
                                    title={t('paused_menu.googleLogin.title')}
                                    onBack={() => setSubview('menu')}
                                    backLabel={t('paused_menu.googleLogin.backLabel')}
                                    rightContent={
                                        <span className="shrink-0 rounded border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-amber-300">
                                            {t('paused_menu.googleLogin.prototypeBadge')}
                                        </span>
                                    }
                                />
                                <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 py-8 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-root-accent/30 bg-root-canvas shadow-[0_0_24px_rgba(0,255,170,0.08)]">
                                        <Cloud className="h-8 w-8 text-root-accent" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-extrabold text-root-text">
                                            {t('paused_menu.googleLogin.heading')}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-root-subtle">
                                            {t('paused_menu.googleLogin.description')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-200">
                                        <span className="h-2 w-2 rounded-full bg-amber-300" />
                                        {t('paused_menu.googleLogin.notConnected')}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowGooglePrototypeNotice(true)}
                                        className="flex w-full max-w-sm items-center justify-center gap-3 rounded-lg border border-slate-300/70 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-[0.99]"
                                    >
                                        <span aria-hidden="true" className="text-lg font-black text-[#4285F4]">G</span>
                                        {t('paused_menu.googleLogin.continueButton')}
                                    </button>
                                    {showGooglePrototypeNotice && (
                                        <p role="status" className="flex max-w-sm items-start gap-2 rounded-lg border border-root-accent/20 bg-root-canvas/70 p-3 text-left text-xs leading-relaxed text-root-subtle">
                                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-root-accent" />
                                            <span>{t('paused_menu.googleLogin.prototypeNotice')}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="paused-menu-footer relative flex h-10 shrink-0 items-center justify-center border-t border-root-accent/10 px-4 sm:h-12 sm:px-6">
                        <div className="paused-menu-footer-divider flex items-center gap-1.5 text-root-accent/40">
                            <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-root-accent/40" />
                            <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                            <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-root-accent/40" />
                        </div>
                        <div className="paused-menu-stamp absolute right-4 border-2 border-dashed border-root-accent/30 px-3 py-1 font-mono text-[9px] font-black uppercase tracking-wider text-root-accent/40 rounded rotate-[-4deg] pointer-events-none select-none sm:right-6">
                            PRESIDEN EXEC. 16FA-923
                        </div>
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
                title={t('paused_menu.exitModal.mainMenuTitle')}
                subtitle={t('paused_menu.exitModal.mainMenuSubtitle')}
                message={t('paused_menu.exitModal.mainMenuMessage')}
                confirmText={t('paused_menu.exitModal.mainMenuConfirm')}
            />
        </React.Fragment>,
        document.body
    );
}