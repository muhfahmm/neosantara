'use client';

import React, { useState, useEffect } from 'react';
import { 
    Save, Trash2, Calendar, Globe, Landmark, ArrowLeft, Volume2, Music, Monitor
} from 'lucide-react';

interface GameMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveGameClick: () => void;
    onRestartClick: () => void;
}

export function GameMenuModal({ isOpen, onClose, onSaveGameClick, onRestartClick }: GameMenuModalProps) {
    const [subview, setSubview] = useState<'menu' | 'load' | 'options'>('menu');
    const [saveFiles, setSaveFiles] = useState<any[]>([]);
    const [isLoadingSaves, setIsLoadingSaves] = useState(false);

    // Mock options states
    const [musicVol, setMusicVol] = useState(80);
    const [sfxVol, setSfxVol] = useState(70);
    const [resolution, setResolution] = useState('1920x1080');

    useEffect(() => {
        if (isOpen) {
            setSubview('menu');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const fetchSaveFiles = async () => {
        setIsLoadingSaves(true);
        try {
            const response = await fetch('/api/game-save');
            if (response.ok) {
                const data = await response.json();
                setSaveFiles(data);
            } else {
                console.error("Gagal memuat save file");
            }
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

    const handleDeleteSave = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Apakah Anda yakin ingin menghapus save file ini secara permanen?")) {
            return;
        }

        try {
            const response = await fetch(`/api/game-save?id=${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setSaveFiles(prev => prev.filter(save => save.id !== id));
            } else {
                alert("Gagal menghapus save file");
            }
        } catch (error) {
            console.error("Error deleting save:", error);
            alert("Terjadi kesalahan saat menghapus");
        }
    };

    const handleLoadSave = (save: any) => {
        sessionStorage.setItem('presiden_simulator_load_save', JSON.stringify(save));
        window.location.href = `/page/map_system?country=${encodeURIComponent(save.country_name)}`;
    };

    const handleExitGame = () => {
        if (window.confirm("Apakah Anda yakin ingin kembali ke Menu Utama? Progres yang tidak disimpan akan hilang.")) {
            window.location.href = '/page';
        }
    };

    const handleCloseWindow = () => {
        if (window.confirm("Apakah Anda yakin ingin keluar dari permainan?")) {
            window.close();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
            
            {/* Skeuomorphic Clipboard Game Menu Frame */}
            <div className="bg-[#101720] border-[6px] border-slate-950 rounded-2xl w-full max-w-[480px] shadow-2xl relative flex flex-col p-4 pl-12 min-h-[580px] select-none">
                
                {/* Silver Binder Spine on the Left */}
                <div className="absolute left-3.5 top-6 bottom-6 w-2.5 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-full shadow-md z-20 border border-slate-600/50" />
                <div className="absolute left-[10px] top-[24px] w-[18px] h-3.5 bg-slate-800 rounded-sm border border-slate-950 z-21 shadow" />
                <div className="absolute left-[10px] bottom-[24px] w-[18px] h-3.5 bg-slate-800 rounded-sm border border-slate-950 z-21 shadow" />

                {/* Notebook Rings binding the paper */}
                <div className="absolute left-[26px] top-12 bottom-12 flex flex-col justify-between items-center py-6 pointer-events-none z-30">
                    {[...Array(11)].map((_, i) => (
                        <div key={i} className="w-3.5 h-3.5 rounded-full bg-slate-950 shadow-inner border border-slate-800 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                        </div>
                    ))}
                </div>

                {/* Parchment Paper Sheet */}
                <div className="flex-1 bg-[#FAF6EE] border-[3px] border-[#dcc9a3]/40 rounded-r-xl shadow-inner relative p-8 flex flex-col overflow-hidden">
                    {/* Parchment background subtle gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.015)_0%,transparent_100%)] pointer-events-none" />
                    
                    {/* Decorative Elegant Divider at the Top */}
                    <div className="flex items-center justify-center gap-1.5 text-sky-800/50 mb-6 shrink-0">
                        <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-sky-800/50" />
                        <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                        <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-sky-800/50" />
                    </div>

                    {/* View: MAIN LIST MENU */}
                    {subview === 'menu' && (
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="space-y-4">
                                <button 
                                    onClick={onClose}
                                    className="w-full bg-[#FAF6EE] hover:bg-[#e4dac3]/40 active:bg-[#dcc9a3]/60 border border-[#c4b49c]/80 rounded py-3.5 text-center text-slate-800 font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow active:scale-[0.99]"
                                >
                                    Resume
                                </button>
                                <button 
                                    onClick={() => {
                                        onClose();
                                        onSaveGameClick();
                                    }}
                                    className="w-full bg-[#FAF6EE] hover:bg-[#e4dac3]/40 active:bg-[#dcc9a3]/60 border border-[#c4b49c]/80 rounded py-3.5 text-center text-slate-800 font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow active:scale-[0.99]"
                                >
                                    Save Game
                                </button>
                                <button 
                                    onClick={handleOpenLoad}
                                    className="w-full bg-[#FAF6EE] hover:bg-[#e4dac3]/40 active:bg-[#dcc9a3]/60 border border-[#c4b49c]/80 rounded py-3.5 text-center text-slate-800 font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow active:scale-[0.99]"
                                >
                                    Load Game
                                </button>
                                <button 
                                    onClick={() => {
                                        onClose();
                                        onRestartClick();
                                    }}
                                    className="w-full bg-[#FAF6EE] hover:bg-[#e4dac3]/40 active:bg-[#dcc9a3]/60 border border-[#c4b49c]/80 rounded py-3.5 text-center text-slate-800 font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow active:scale-[0.99]"
                                >
                                    Restart
                                </button>
                                <button 
                                    onClick={() => setSubview('options')}
                                    className="w-full bg-[#FAF6EE] hover:bg-[#e4dac3]/40 active:bg-[#dcc9a3]/60 border border-[#c4b49c]/80 rounded py-3.5 text-center text-slate-800 font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow active:scale-[0.99]"
                                >
                                    Options
                                </button>
                            </div>

                            <div className="space-y-4 pt-12">
                                <button 
                                    onClick={handleExitGame}
                                    className="w-full bg-[#FAF6EE] hover:bg-[#e4dac3]/40 active:bg-[#dcc9a3]/60 border border-[#c4b49c]/80 rounded py-3.5 text-center text-slate-800 font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow active:scale-[0.99]"
                                >
                                    Main Menu
                                </button>
                                <button 
                                    onClick={handleCloseWindow}
                                    className="w-full bg-[#FAF6EE] hover:bg-[#e4dac3]/40 active:bg-[#dcc9a3]/60 border border-[#c4b49c]/80 rounded py-3.5 text-center text-slate-800 font-extrabold text-[13px] tracking-wider transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow active:scale-[0.99]"
                                >
                                    Exit Game
                                </button>
                            </div>
                        </div>
                    )}

                    {/* View: LOAD GAME LIST */}
                    {subview === 'load' && (
                        <div className="flex-1 flex flex-col justify-between overflow-hidden">
                            <div className="flex items-center gap-2 border-b border-[#c4b49c]/50 pb-2 mb-4 shrink-0 text-left">
                                <button 
                                    onClick={() => setSubview('menu')}
                                    className="p-1 rounded hover:bg-[#e4dac3]/50 text-slate-700 cursor-pointer transition-all"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <span className="font-extrabold text-[14px] text-slate-800 uppercase tracking-wider">LOAD GAME</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 no-scrollbar shrink-0">
                                {isLoadingSaves ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500 font-bold text-xs">
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" />
                                        <span>Memuat save file...</span>
                                    </div>
                                ) : saveFiles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">TIDAK ADA SAVE FILE</span>
                                        <p className="text-slate-500 text-[10px] max-w-[200px]">Simpan permainan Anda melalui tombol "Save Game" terlebih dahulu.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {saveFiles.map((save) => (
                                            <div 
                                                key={save.id}
                                                onClick={() => handleLoadSave(save)}
                                                className="group relative flex items-center justify-between p-3 rounded-lg border border-[#c4b49c]/80 bg-[#FAF6EE] hover:bg-[#e4dac3]/40 active:scale-[0.99] transition-all cursor-pointer text-left"
                                            >
                                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                                    <img 
                                                        src={`https://flagcdn.com/w80/${save.country_iso.toLowerCase()}.png`}
                                                        className="w-8 h-5 rounded-sm object-cover border border-black/10 shadow-sm shrink-0 mt-0.5"
                                                        alt="flag"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
                                                        }}
                                                    />
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="text-[12px] font-black text-slate-800 truncate leading-tight">
                                                            {save.save_name}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold mt-1">
                                                            <span className="flex items-center gap-0.5 truncate">
                                                                <Globe className="w-2.5 h-2.5 text-slate-400" />
                                                                {save.country_name}
                                                            </span>
                                                            <span className="flex items-center gap-0.5 shrink-0">
                                                                <Calendar className="w-2.5 h-2.5 text-slate-400" />
                                                                {new Date(save.game_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    onClick={(e) => handleDeleteSave(save.id, e)}
                                                    title="Hapus Save File"
                                                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 transition-all cursor-pointer z-20 shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* View: OPTIONS CONFIG */}
                    {subview === 'options' && (
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex items-center gap-2 border-b border-[#c4b49c]/50 pb-2 mb-6 shrink-0 text-left">
                                <button 
                                    onClick={() => setSubview('menu')}
                                    className="p-1 rounded hover:bg-[#e4dac3]/50 text-slate-700 cursor-pointer transition-all"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <span className="font-extrabold text-[14px] text-slate-800 uppercase tracking-wider">OPTIONS</span>
                            </div>

                            <div className="flex-1 space-y-6 text-left shrink-0">
                                {/* Option: Music Volume */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <Music className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Music Volume ({musicVol}%)</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={musicVol} 
                                        onChange={(e) => setMusicVol(Number(e.target.value))}
                                        className="w-full accent-slate-800 cursor-pointer"
                                    />
                                </div>

                                {/* Option: Sound Effects */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Sound Effects ({sfxVol}%)</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={sfxVol} 
                                        onChange={(e) => setSfxVol(Number(e.target.value))}
                                        className="w-full accent-slate-800 cursor-pointer"
                                    />
                                </div>

                                {/* Option: Resolution */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <Monitor className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Screen Resolution</span>
                                    </label>
                                    <select 
                                        value={resolution} 
                                        onChange={(e) => setResolution(e.target.value)}
                                        className="w-full bg-[#FAF6EE] border border-[#c4b49c] rounded px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-800 cursor-pointer"
                                    >
                                        <option value="1920x1080">1920 x 1080 (16:9)</option>
                                        <option value="1600x900">1600 x 900 (16:9)</option>
                                        <option value="1280x720">1280 x 720 (16:9)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ink Stamp at the Bottom Right */}
                    <div className="absolute bottom-6 right-6 border-2 border-dashed border-cyan-600/40 text-cyan-600/40 px-3 py-1 font-mono text-[9px] font-black uppercase tracking-wider rounded rotate-[-4deg] pointer-events-none select-none">
                        PRESIDEN EXEC. 16FA-923
                    </div>

                    {/* Decorative Elegant Divider at the Bottom */}
                    <div className="flex items-center justify-center gap-1.5 text-sky-800/50 mt-6 shrink-0">
                        <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-sky-800/50" />
                        <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                        <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-sky-800/50" />
                    </div>
                </div>
            </div>
        </div>
    );
}
