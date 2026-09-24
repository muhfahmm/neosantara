'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Settings, Save, LogOut, Globe, Shield, Trash2, Calendar, Landmark } from 'lucide-react';
import Link from 'next/link';

export default function PlayMenuPage() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Save-related states
    const [isContinueModalOpen, setIsContinueModalOpen] = useState(false);
    const [saveFiles, setSaveFiles] = useState<any[]>([]);
    const [isLoadingSaves, setIsLoadingSaves] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

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

    const openContinueModal = () => {
        fetchSaveFiles();
        setIsContinueModalOpen(true);
    };

    const handleDeleteSave = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent triggering load row click
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
        localStorage.setItem('presiden_simulator_load_save', JSON.stringify(save));
        window.location.href = `/page/map_system?country=${encodeURIComponent(save.country_name)}`;
    };

    const menuItems = [
        { id: 'start', label: 'MULAI SIMULASI', icon: Play, color: '#10b981', path: '/page/map_system/pilih-negara' },
        { id: 'continue', label: 'LANJUTKAN', icon: Save, color: '#3b82f6', path: '#' },
        { id: 'settings', label: 'PENGATURAN', icon: Settings, color: '#f59e0b', path: '#' },
        { id: 'exit', label: 'KELUAR', icon: LogOut, color: '#ef4444', path: '#' },
    ];

    return (
        <div className="relative h-screen max-h-screen bg-[#070b14] flex flex-col items-start justify-center p-4 sm:p-8 md:p-10 lg:p-14 overflow-hidden font-sans">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                
                {/* Floating Orbs */}
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-32 sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 bg-emerald-500/10 rounded-full blur-[100px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -70, 0],
                        y: [0, 60, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/4 right-1/4 w-36 sm:w-48 lg:w-60 h-36 sm:h-48 lg:h-60 bg-blue-500/10 rounded-full blur-[120px]"
                />
            </div>

            {/* Content */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-start gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full max-w-3xl"
            >
                {/* Title Section */}
                <div className="text-left space-y-1 sm:space-y-1.5 lg:space-y-2">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="flex items-center justify-start gap-2.5 sm:gap-3 mb-1.5 sm:mb-2 lg:mb-4"
                    >
                        <div className="p-1.5 sm:p-2 lg:p-2.5 bg-emerald-500/10 rounded-lg sm:rounded-xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                            <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-9 lg:h-9 text-emerald-500" />
                        </div>
                    </motion.div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-black tracking-tighter text-white">
                        PRESIDEN<span className="text-emerald-500">SIMULATOR</span>
                    </h1>
                    <p className="text-slate-400 text-[9px] sm:text-[11px] md:text-xs lg:text-sm tracking-[0.2em] sm:tracking-[0.25em] font-light">
                        STRATEGY & GLOBAL GOVERNANCE
                    </p>
                </div>

                {/* Menu Buttons */}
                <div className="flex flex-col gap-2 sm:gap-2.5 lg:gap-3 w-full max-w-[200px] sm:max-w-[230px] md:max-w-[260px] lg:max-w-[280px]">
                    {menuItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            onHoverStart={() => setHoveredIndex(index)}
                            onHoverEnd={() => setHoveredIndex(null)}
                            className="w-full"
                        >
                            {item.id === 'continue' ? (
                                <button
                                    onClick={openContinueModal}
                                    className={`
                                        group relative w-full flex items-center gap-2.5 lg:gap-3 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl
                                        bg-white/5 border border-white/10 transition-all duration-300
                                        hover:bg-white/10 hover:border-emerald-500/30 hover:scale-[1.02]
                                        overflow-hidden cursor-pointer text-left
                                    `}
                                >
                                    {/* Hover Glow */}
                                    <div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: `radial-gradient(circle at center, ${item.color}15 0%, transparent 100%)` }}
                                    />

                                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
                                    <span className="text-slate-300 group-hover:text-white font-bold tracking-widest text-[10px] sm:text-[11px] lg:text-xs uppercase">
                                        {item.label}
                                    </span>

                                    {/* Active Indicator */}
                                    {hoveredIndex === index && (
                                        <motion.div 
                                            layoutId="active"
                                            className="absolute right-3 w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                    )}
                                </button>
                            ) : item.path === '#' ? (
                                <button
                                    onClick={() => {
                                        if (item.id === 'exit') {
                                            if (window.confirm("Apakah Anda yakin ingin keluar?")) {
                                                window.close();
                                            }
                                        } else {
                                            alert("Fitur pengaturan segera hadir!");
                                        }
                                    }}
                                    className={`
                                        group relative w-full flex items-center gap-2.5 lg:gap-3 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl
                                        bg-white/5 border border-white/10 transition-all duration-300
                                        hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]
                                        overflow-hidden cursor-pointer text-left
                                    `}
                                >
                                    {/* Hover Glow */}
                                    <div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: `radial-gradient(circle at center, ${item.color}15 0%, transparent 100%)` }}
                                    />

                                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
                                    <span className="text-slate-300 group-hover:text-white font-bold tracking-widest text-[10px] sm:text-[11px] lg:text-xs uppercase">
                                        {item.label}
                                    </span>

                                    {/* Active Indicator */}
                                    {hoveredIndex === index && (
                                        <motion.div 
                                            layoutId="active"
                                            className="absolute right-3 w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                    )}
                                </button>
                            ) : (
                                <Link href={item.path} className="w-full block">
                                    <button
                                        className={`
                                            group relative w-full flex items-center gap-2.5 lg:gap-3 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl
                                            bg-white/5 border border-white/10 transition-all duration-300
                                            hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]
                                            overflow-hidden cursor-pointer text-left
                                        `}
                                    >
                                        {/* Hover Glow */}
                                        <div 
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                            style={{ background: `radial-gradient(circle at center, ${item.color}15 0%, transparent 100%)` }}
                                        />

                                        <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
                                        <span className="text-slate-300 group-hover:text-white font-bold tracking-widest text-[10px] sm:text-[11px] lg:text-xs uppercase">
                                            {item.label}
                                        </span>

                                        {/* Active Indicator */}
                                        {hoveredIndex === index && (
                                            <motion.div 
                                                layoutId="active"
                                                className="absolute right-3 w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                        )}
                                    </button>
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Footer Info */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-3 sm:mt-4 lg:mt-6 flex flex-wrap items-center justify-start gap-3 sm:gap-5 lg:gap-6 text-[8px] sm:text-[9px] text-slate-500 tracking-[0.15em] sm:tracking-[0.2em]"
                >
                    <div className="flex items-center gap-1.5">
                        <Globe className="w-2.5 h-2.5" />
                        VERSION 2026.1.0
                    </div>
                    <div className="w-1 h-1 bg-slate-700 rounded-full hidden sm:block" />
                    <div className="hover:text-emerald-500 transition-colors cursor-pointer">
                        SERVER: ASIA-CENTRAL
                    </div>
                </motion.div>
            </motion.div>

            {/* Corner Accents */}
            <div className="hidden sm:block absolute top-4 left-4 sm:top-8 sm:left-8 p-4 border-l border-t border-white/10 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none" />
            <div className="hidden sm:block absolute bottom-4 right-4 sm:bottom-8 sm:right-8 p-4 border-r border-b border-white/10 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none" />

            {/* Continue Save Glassmorphic Modal */}
            <AnimatePresence>
                {isContinueModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-slate-950/95 border-2 border-emerald-500/20 rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl w-[95vw] sm:w-full shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden flex flex-col font-sans max-h-[85vh] text-left"
                        >
                            {/* Decorative Grid and Blur */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05)_0%,transparent_60%)] pointer-events-none" />

                            <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-white/10 pb-3 sm:pb-4 z-10">
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <Save className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0" />
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-widest">LANJUTKAN SIMULASI</h2>
                                </div>
                                <button 
                                    onClick={() => setIsContinueModalOpen(false)}
                                    className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer transition-colors p-1"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar z-10">
                                {isLoadingSaves ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 font-bold">
                                        <div className="w-8 h-8 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                                        <span>Memuat save file dari database...</span>
                                    </div>
                                ) : saveFiles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-white/5 bg-white/2 rounded-xl">
                                        <Globe className="w-12 h-12 text-slate-600" />
                                        <span className="text-slate-400 font-bold tracking-wider uppercase text-sm">Tidak Ditemukan Save File</span>
                                        <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                                            Belum ada permainan yang disimpan ke database. Silakan klik "Mulai Simulasi" untuk membuat game baru.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 font-sans">
                                        {saveFiles.map((save) => (
                                            <div 
                                                key={save.id}
                                                onClick={() => handleLoadSave(save)}
                                                className="group relative flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer hover:scale-[1.01]"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <img 
                                                        src={`https://flagcdn.com/w80/${save.country_iso.toLowerCase()}.png`}
                                                        className="w-12 h-8 rounded object-cover border border-white/10 shadow-md shrink-0 mt-0.5"
                                                        alt="flag"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
                                                        }}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-black text-white group-hover:text-emerald-400 transition-colors uppercase leading-tight">
                                                            {save.save_name}
                                                        </span>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 mt-2 font-bold">
                                                            <span className="flex items-center gap-1.5">
                                                                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                                                                {save.country_name}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                                                {new Date(save.game_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Landmark className="w-3.5 h-3.5 text-amber-500" />
                                                                {save.anggaran ? `${save.anggaran.toLocaleString('id-ID')} EM` : '0 EM'}
                                                            </span>
                                                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider font-extrabold shrink-0">
                                                                {save.ideology || '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    onClick={(e) => handleDeleteSave(save.id, e)}
                                                    title="Hapus Save File"
                                                    className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer z-20 shrink-0 self-center"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 border-t border-white/10 pt-4 flex justify-end z-10 font-sans">
                                <button 
                                    onClick={() => setIsContinueModalOpen(false)}
                                    className="py-2.5 px-6 rounded-xl border border-white/10 hover:bg-white/5 active:bg-white/10 text-slate-300 font-bold text-xs uppercase transition-all cursor-pointer"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
