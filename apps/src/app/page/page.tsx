'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Settings, Save, LogOut, Globe, Shield, Trash2, Calendar, Landmark, TrendingUp, AlertTriangle, Activity, Radio } from 'lucide-react';
import Link from 'next/link';

/* ============================================================
   HOLOGRAPHIC WORLD MAP
   ============================================================ */
const HolographicMap = () => (
    <div className="hidden lg:block absolute inset-y-0 right-0 w-[55%] z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 text-emerald-500">
            <svg
                viewBox="0 0 1000 500"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-auto max-h-full opacity-[0.13]"
                preserveAspectRatio="xMidYMid meet"
                fill="none"
            >
                <defs>
                    <pattern id="mapDots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                        <circle cx="3" cy="3" r="0.9" fill="currentColor" />
                    </pattern>
                    <filter id="mapGlow">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <g filter="url(#mapGlow)" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.55">
                    <path d="M 80 80 Q 130 50 200 60 Q 250 70 275 110 Q 290 150 270 195 Q 250 230 220 250 Q 195 265 175 255 Q 155 240 145 215 Q 130 185 115 165 Q 95 140 80 115 Z" fill="url(#mapDots)" />
                    <path d="M 280 40 Q 320 30 350 55 Q 355 85 325 100 Q 295 95 280 40 Z" fill="url(#mapDots)" />
                    <path d="M 235 280 Q 270 275 290 300 Q 305 350 295 405 Q 280 455 255 475 Q 235 470 230 425 Q 225 365 230 320 Z" fill="url(#mapDots)" />
                    <path d="M 460 75 Q 500 55 545 65 Q 570 85 560 115 Q 545 145 520 155 Q 490 150 475 130 Q 465 105 460 75 Z" fill="url(#mapDots)" />
                    <path d="M 475 190 Q 520 175 565 195 Q 590 240 580 300 Q 565 360 530 405 Q 510 420 495 400 Q 480 360 470 305 Q 460 240 475 190 Z" fill="url(#mapDots)" />
                    <path d="M 575 65 Q 660 40 760 55 Q 830 70 860 115 Q 870 155 840 185 Q 800 210 750 205 Q 690 195 640 175 Q 600 155 585 125 Z" fill="url(#mapDots)" />
                    <path d="M 720 235 Q 755 230 780 245 Q 790 265 770 275 Q 740 270 725 255 Z" fill="url(#mapDots)" />
                    <path d="M 775 315 Q 825 300 875 320 Q 895 345 875 375 Q 850 395 810 390 Q 780 375 775 345 Z" fill="url(#mapDots)" />
                    <path d="M 100 455 Q 300 440 500 445 Q 700 450 900 445 L 900 480 L 100 480 Z" fill="url(#mapDots)" />
                </g>
            </svg>
        </div>
        <motion.div
            className="absolute inset-x-0 h-[1.5px]"
            style={{
                background: 'linear-gradient(to right, transparent 0%, rgba(16,185,129,0.15) 15%, rgba(16,185,129,0.85) 50%, rgba(16,185,129,0.15) 85%, transparent 100%)',
                boxShadow: '0 0 20px rgba(16,185,129,0.8), 0 0 4px rgba(16,185,129,1)',
            }}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear', repeatDelay: 0.8 }}
        />
    </div>
);

/* ============================================================
   RADAR SWEEP
   ============================================================ */
const RadarSweep = () => (
    <div className="hidden md:block absolute bottom-24 right-12 lg:bottom-32 lg:right-24 w-28 h-28 lg:w-40 lg:h-40 rounded-full border border-emerald-500/30 bg-emerald-500/[0.03] backdrop-blur-sm z-0 pointer-events-none">
        <div className="absolute inset-[18%] rounded-full border border-emerald-500/20" />
        <div className="absolute inset-[38%] rounded-full border border-emerald-500/15" />
        <div className="absolute inset-[58%] rounded-full border border-emerald-500/10" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-500/20" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-500/20" />
        <motion.div
            className="absolute inset-0 rounded-full"
            style={{
                background:
                    'conic-gradient(from 0deg, rgba(16,185,129,0) 0deg, rgba(16,185,129,0) 280deg, rgba(16,185,129,0.15) 320deg, rgba(16,185,129,0.55) 355deg, rgba(16,185,129,0.9) 360deg)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,1)]" />
        <div className="absolute top-[30%] left-[45%] w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse" />
        <div className="absolute top-[62%] left-[72%] w-1 h-1 rounded-full bg-emerald-400/80 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[72%] left-[32%] w-1 h-1 rounded-full bg-emerald-400/60 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse" style={{ animationDelay: '1.2s' }} />
    </div>
);

/* ============================================================
   DATA STREAM PARTICLES
   ============================================================ */
const DataParticles = () => {
    const particles = Array.from({ length: 26 }, (_, i) => ({
        left: (i * 37 + 11) % 100,
        delay: ((i * 0.73) % 12),
        duration: 9 + ((i * 3) % 7),
        size: 1 + ((i * 5) % 3) * 0.8,
        opacity: 0.4 + ((i * 7) % 5) * 0.12,
    }));

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {particles.map((p, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-emerald-400"
                    style={{
                        left: `${p.left}%`,
                        bottom: '-10px',
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        opacity: p.opacity,
                        boxShadow: `0 0 ${p.size * 4}px rgba(16,185,129,0.85)`,
                        animation: `neosantara-float-up ${p.duration}s linear ${p.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    );
};

/* ============================================================
   GLITCH TITLE
   ============================================================ */
const GlitchTitle = () => {
    const [glitching, setGlitching] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setGlitching(false), 1700);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.h1
            className="relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-black tracking-tighter text-white"
            animate={
                glitching
                    ? {
                          x: [0, -3, 3, -2, 2, -1, 1, 0],
                          textShadow: [
                              '0 0 0 transparent',
                              '3px 0 0 #22d3ee, -3px 0 0 #ef4444',
                              '-3px 0 0 #22d3ee, 3px 0 0 #ef4444',
                              '2px 0 0 #22d3ee, -2px 0 0 #ef4444',
                              '0 0 0 transparent',
                          ],
                      }
                    : { x: 0, textShadow: '0 0 0 transparent' }
            }
            transition={
                glitching
                    ? { duration: 0.28, repeat: 5, repeatDelay: 0.08 }
                    : { duration: 0.3 }
            }
        >
            NEO<span className="text-emerald-500">SANTARA</span>
        </motion.h1>
    );
};

/* ============================================================
   TYPEWRITER SUBTITLE
   ============================================================ */
const TypewriterSubtitle = () => {
    const fullText = 'SIMULASI GEOPOLITIK & TATA KELOLA GLOBAL';
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            i += 1;
            setDisplayed(fullText.slice(0, i));
            if (i >= fullText.length) {
                clearInterval(timer);
                setDone(true);
            }
        }, 35);
        return () => clearInterval(timer);
    }, []);

    return (
        <p className="text-slate-400 text-[9px] sm:text-[11px] md:text-xs lg:text-sm tracking-[0.2em] sm:tracking-[0.25em] font-light">
            {displayed}
            {!done && (
                <span className="inline-block w-[2px] h-3 bg-emerald-500 align-middle ml-0.5 animate-pulse" />
            )}
        </p>
    );
};

/* ============================================================
   IN-GAME CLOCK (top-right)
   ============================================================ */
const GameClock = () => {
    const [time, setTime] = useState('');

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const datePart = now.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }).toUpperCase();
            const timePart = now.toLocaleTimeString('en-GB', { hour12: false });
            setTime(`${datePart} • ${timePart} UTC`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="hidden sm:flex absolute top-6 right-6 md:top-8 md:right-8 z-20 items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-500/20 bg-slate-950/60 backdrop-blur-md text-[9px] md:text-[10px] font-mono text-emerald-400 tracking-widest"
        >
            <Radio className="w-3 h-3 animate-pulse" />
            {time}
        </motion.div>
    );
};

/* ============================================================
   GLOBAL STATS PANEL (right side, mid)
   ============================================================ */
const GlobalStatsPanel = () => {
    const stats = [
        { label: 'TENSION', value: 64, icon: AlertTriangle, color: '#f59e0b' },
        { label: 'ECONOMY', value: 78, icon: TrendingUp, color: '#10b981' },
        { label: 'CONFLICTS', value: 3, icon: Activity, color: '#ef4444', suffix: ' ACTIVE' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="hidden xl:flex flex-col gap-2 absolute top-1/2 -translate-y-1/2 right-8 xl:right-12 z-20 w-[190px] pointer-events-none"
        >
            <div className="text-[9px] tracking-[0.3em] text-emerald-500/70 font-bold mb-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                GLOBAL FEED
            </div>
            {stats.map((s, i) => (
                <motion.div
                    key={s.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.15 }}
                    className="border border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-lg px-3 py-2"
                >
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 tracking-widest font-bold">
                            <s.icon className="w-3 h-3" style={{ color: s.color }} />
                            {s.label}
                        </div>
                        <span
                            className="text-[11px] font-mono font-bold"
                            style={{ color: s.color }}
                        >
                            {s.value}{s.suffix ?? '%'}
                        </span>
                    </div>
                    {!s.suffix && (
                        <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${s.value}%` }}
                                transition={{ delay: 1.5 + i * 0.15, duration: 0.8, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{
                                    background: s.color,
                                    boxShadow: `0 0 8px ${s.color}`,
                                }}
                            />
                        </div>
                    )}
                </motion.div>
            ))}
        </motion.div>
    );
};

/* ============================================================
   NEWS TICKER (bottom)
   ============================================================ */
const NewsTicker = () => {
    const headlines = [
        { tag: 'DIPLOMASI', text: 'Presiden NEOSANTARA menjadwalkan pertemuan puncak dengan negara-negara ASEAN pekan depan' },
        { tag: 'EKONOMI', text: 'Indeks pasar global naik 2.4% setelah pengumuman paket stimulus baru' },
        { tag: 'MILITER', text: 'Latihan gabungan angkatan laut digelar di perairan Selat Malaka' },
        { tag: 'TEKNOLOGI', text: 'Revolusi AI mencapai milestone baru dalam prediksi geopolitik' },
        { tag: 'LINGKUNGAN', text: 'Komitmen karbon netral 2050 diperkuat oleh 12 negara tambahan' },
    ];

    // Duplicate for seamless loop
    const loop = [...headlines, ...headlines];

    return (
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
            {/* Top border */}
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            <div className="bg-slate-950/80 backdrop-blur-md border-t border-emerald-500/10 flex items-center overflow-hidden h-9">
                {/* Fixed "LIVE" badge */}
                <div className="flex items-center gap-1.5 px-3 h-full bg-emerald-500/10 border-r border-emerald-500/20 shrink-0">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                    </span>
                    <span className="text-[9px] font-black tracking-[0.25em] text-emerald-400">LIVE</span>
                </div>

                {/* Marquee */}
                <div className="relative flex-1 overflow-hidden h-full">
                    <motion.div
                        className="flex items-center h-full whitespace-nowrap"
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                    >
                        {loop.map((h, i) => (
                            <div key={i} className="flex items-center gap-2 px-6 text-[10px] tracking-wider">
                                <span className="text-emerald-500 font-black">[{h.tag}]</span>
                                <span className="text-slate-400">{h.text}</span>
                                <span className="text-slate-700 ml-6">◆</span>
                            </div>
                        ))}
                    </motion.div>
                    {/* Edge fades */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-950 to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-950 to-transparent" />
                </div>
            </div>
        </div>
    );
};

/* ============================================================
   CLASSIFICATION BANNER (top center)
   ============================================================ */
const ClassificationBanner = () => (
    <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="hidden md:flex absolute top-0 left-0 right-0 z-20 justify-center pointer-events-none"
    >
        <div className="px-6 py-1 bg-emerald-500/5 border-x border-b border-emerald-500/20 backdrop-blur-sm">
            <span className="text-[8px] tracking-[0.5em] font-black text-emerald-500/70">
                ◆ CLASSIFIED — LEVEL 4 CLEARANCE ◆
            </span>
        </div>
    </motion.div>
);

/* ============================================================
   HUD CORNER MARKS (4 corners, subtle)
   ============================================================ */
const HudCorners = () => (
    <>
        <div className="hidden md:block absolute top-16 left-4 w-6 h-6 border-l border-t border-emerald-500/30 pointer-events-none z-10" />
        <div className="hidden md:block absolute top-16 right-4 w-6 h-6 border-r border-t border-emerald-500/30 pointer-events-none z-10" />
        <div className="hidden md:block absolute bottom-12 left-4 w-6 h-6 border-l border-b border-emerald-500/30 pointer-events-none z-10" />
        <div className="hidden md:block absolute bottom-12 right-4 w-6 h-6 border-r border-b border-emerald-500/30 pointer-events-none z-10" />
    </>
);

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function PlayMenuPage() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
        e.stopPropagation();
        if (!window.confirm("Apakah Anda yakin ingin menghapus save file ini secara permanen?")) {
            return;
        }
        try {
            const response = await fetch(`/api/game-save?id=${id}`, { method: 'DELETE' });
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

    // Menu items now include sublabels
    const menuItems = [
        { id: 'start', label: 'MULAI SIMULASI', sub: 'INISIASI PEMERINTAHAN BARU', icon: Play, color: '#10b981', path: '/page/map_system/pilih-negara' },
        { id: 'continue', label: 'LANJUTKAN', sub: 'MUAT DATA STRATEGIS', icon: Save, color: '#3b82f6', path: '#' },
        { id: 'settings', label: 'PENGATURAN', sub: 'KONFIGURASI SISTEM', icon: Settings, color: '#f59e0b', path: '#' },
        { id: 'exit', label: 'KELUAR', sub: 'AKHIRI SESI', icon: LogOut, color: '#ef4444', path: '#' },
    ];

    return (
        <>
            <style>{`
                @keyframes neosantara-float-up {
                    0%   { transform: translateY(0); opacity: 0; }
                    10%  { opacity: 1; }
                    85%  { opacity: 0.7; }
                    100% { transform: translateY(-100vh); opacity: 0; }
                }
                /* Hide scrollbar for save modal list */
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="relative h-screen max-h-screen bg-[#070b14] flex flex-col items-start justify-center p-4 sm:p-8 md:p-10 lg:p-14 overflow-hidden font-sans pb-12">

                {/* Subtle global grid overlay */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Background Orbs */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0], y: [0, -50, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-32 sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 bg-emerald-500/10 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [0, -70, 0], y: [0, 60, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-1/4 w-36 sm:w-48 lg:w-60 h-36 sm:h-48 lg:h-60 bg-blue-500/10 rounded-full blur-[120px]"
                    />
                </div>

                {/* Vignette */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

                {/* FX Layers */}
                <HolographicMap />
                <DataParticles />
                <RadarSweep />
                <HudCorners />
                <ClassificationBanner />
                <GameClock />
                <GlobalStatsPanel />
                <NewsTicker />

                {/* ============ Main Content ============ */}
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

                        <GlitchTitle />
                        <TypewriterSubtitle />
                    </div>

                    {/* Menu Buttons */}
                    <div className="flex flex-col gap-2 sm:gap-2.5 lg:gap-3 w-full max-w-[220px] sm:max-w-[260px] md:max-w-[290px] lg:max-w-[310px]">
                        {menuItems.map((item, index) => {
                            const isActive = hoveredIndex === index;

                            const inner = (
                                <>
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: `radial-gradient(circle at center, ${item.color}15 0%, transparent 100%)` }}
                                    />

                                    {/* Left edge accent bar */}
                                    <span
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-3/5 rounded-r-full transition-all duration-300"
                                        style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }}
                                    />

                                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-400 group-hover:text-white transition-colors shrink-0" />

                                    <div className="flex flex-col items-start leading-tight min-w-0">
                                        <span className="text-slate-300 group-hover:text-white font-bold tracking-widest text-[10px] sm:text-[11px] lg:text-xs uppercase">
                                            {item.label}
                                        </span>
                                        <span className="text-slate-500 group-hover:text-slate-400 text-[8px] sm:text-[9px] tracking-[0.15em] font-medium uppercase mt-0.5 truncate">
                                            {item.sub}
                                        </span>
                                    </div>

                                    {isActive && (
                                        <motion.div
                                            layoutId="active"
                                            className="absolute right-3 w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                    )}
                                </>
                            );

                            const btnClass = `
                                group relative w-full flex items-center gap-2.5 lg:gap-3 pl-3 pr-2 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl
                                bg-white/5 border border-white/10 transition-all duration-300
                                hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]
                                overflow-hidden cursor-pointer text-left
                            `;

                            return (
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
                                        <button onClick={openContinueModal} className={btnClass}>
                                            {inner}
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
                                            className={btnClass}
                                        >
                                            {inner}
                                        </button>
                                    ) : (
                                        <Link href={item.path} className="w-full block">
                                            <button className={btnClass}>
                                                {inner}
                                            </button>
                                        </Link>
                                    )}
                                </motion.div>
                            );
                        })}
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
                        <div className="hover:text-emerald-500 transition-colors cursor-pointer flex items-center gap-1.5">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            SERVER: ASIA-CENTRAL
                        </div>
                    </motion.div>
                </motion.div>

                {/* Old corner accents (kept for style consistency) */}
                <div className="hidden sm:block absolute top-4 left-4 sm:top-8 sm:left-8 p-4 border-l border-t border-white/10 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none" />
                <div className="hidden sm:block absolute bottom-4 right-4 sm:bottom-8 sm:right-8 p-4 border-r border-b border-white/10 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none" />

                {/* ============ Continue Modal ============ */}
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
                                                Belum ada permainan yang disimpan ke database. Silakan klik &quot;Mulai Simulasi&quot; untuk membuat game baru.
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
        </>
    );
}