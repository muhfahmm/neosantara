'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Play, Settings, Save, LogOut, Globe, Shield,
    Signal, Crosshair, ScrollText
} from 'lucide-react';
import Link from 'next/link';
import { ExitConfirmModal } from './paused_menu/ExitConfirmModal';
import { CreditsMenu } from './credits_menu/CreditsMenu';
import { MainMenuContinueScreen, type MainMenuSave } from './main_menu/MainMenuContinueScreen';
import { MainMenuSettingsScreen } from './main_menu/MainMenuSettingsScreen';
import { soundManager } from '@/lib/soundManager';
import { MOBILE_PREBAKED_CONTINENTS } from './map_system/rust_map_mobile/mobilePrebakedPaths';
import { isMobileDevice } from './map_system/rust_map_mobile';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { stagePendingGameSave } from '@/app/logic/pendingGameSave';
import { fetchWithFirebaseAuth } from '@/lib/firebaseClient';

/* ============================================================
   HOLOGRAPHIC WORLD MAP  —  wireframe + network nodes + pings
   ============================================================ */
type MapPoint = readonly [number, number];

function projectMapPoint([longitude, latitude]: MapPoint) {
    return {
        x: ((longitude + 180) / 360) * 1000,
        y: ((90 - latitude) / 180) * 500,
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function worldGeometryToPath(geometry: unknown): string {
    if (!isRecord(geometry) || !Array.isArray(geometry.coordinates)) return '';

    const polygons =
        geometry.type === 'Polygon'
            ? [geometry.coordinates]
            : geometry.type === 'MultiPolygon'
                ? geometry.coordinates
                : [];

    return polygons
        .flatMap(polygon => Array.isArray(polygon) ? polygon : [])
        .map(ring => {
            if (!Array.isArray(ring)) return '';
            const points = ring
                .filter((point): point is number[] =>
                    Array.isArray(point) &&
                    typeof point[0] === 'number' &&
                    typeof point[1] === 'number'
                )
                .map(([longitude, latitude]) => {
                    const { x, y } = projectMapPoint([longitude, latitude]);
                    return `${x.toFixed(1)} ${y.toFixed(1)}`;
                });
            return points.length >= 3 ? `M${points.join('L')}Z` : '';
        })
        .filter(Boolean)
        .join('');
}

const HolographicMap = () => {
    const [landPaths, setLandPaths] = useState<string[]>(() => Object.values(MOBILE_PREBAKED_CONTINENTS));
    useEffect(() => {
        // Di perangkat mobile, HolographicMap tidak perlu mengunduh 10.33 MB /world.geojson
        // karena sudah menggunakan MOBILE_PREBAKED_CONTINENTS secara instan (0ms).
        if (isMobileDevice()) return;

        let isMounted = true;

        async function loadWorldMap() {
            try {
                const response = await fetch('/world.geojson', { cache: 'force-cache' });
                if (!response.ok) {
                    throw new Error(`Failed to load world map data: HTTP ${response.status}`);
                }

                const data: unknown = await response.json();
                if (!isRecord(data) || !Array.isArray(data.features)) {
                    throw new Error('Invalid world map data');
                }

                const paths = data.features
                    .filter(isRecord)
                    .map(feature => worldGeometryToPath(feature.geometry))
                    .filter(Boolean);
                if (isMounted && paths.length > 0) setLandPaths(paths);
            } catch (error) {
                console.error('Failed to load world map for main menu:', error);
            }
        }

        void loadWorldMap();
        return () => {
            isMounted = false;
        };
    }, []);

    const nodeLocations: MapPoint[] = [
        [-100, 40], [-50, -10], [-5, 50], [30, 25], [78, 22], [110, 35], [135, -25],
    ];
    const nodes = nodeLocations.map(projectMapPoint);
    const links: [number, number][] = [
        [0, 2], [2, 4], [2, 3], [3, 5], [4, 5], [5, 6], [2, 5], [1, 3],
    ];
    const pings = [
        { ...projectMapPoint([-122, 37]), delay: 0.4 }, { ...projectMapPoint([-74, 4]), delay: 2.1 },
        { ...projectMapPoint([-46, -23]), delay: 1.3 }, { ...projectMapPoint([2, 48]), delay: 3.2 },
        { ...projectMapPoint([77, 28]), delay: 0.8 }, { ...projectMapPoint([139, 36]), delay: 2.7 },
        { ...projectMapPoint([151, -34]), delay: 4.1 },
    ];

    return (
        <div className="hidden lg:block absolute inset-y-0 right-0 w-[55%] z-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 text-emerald-500">
                <svg
                    viewBox="0 0 1000 500"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-auto max-h-full opacity-[0.14]"
                    preserveAspectRatio="xMidYMid meet"
                    fill="none"
                >
                    <defs>
                        <pattern id="mapDots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                            <circle cx="3" cy="3" r="0.9" fill="currentColor" />
                        </pattern>

                    </defs>

                    {/* Accurate country outlines using the same GeoJSON and projection as the game map. */}
                    <g stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.55">
                        {landPaths.map((path, index) => (
                            <path key={index} d={path} fill="url(#mapDots)" />
                        ))}
                    </g>

                    {/* Network links */}
                    <g stroke="rgba(16,185,129,0.55)" strokeWidth="0.6" strokeDasharray="3 4">
                        {links.map(([a, b], i) => (
                            <motion.line
                                key={i}
                                x1={nodes[a].x} y1={nodes[a].y}
                                x2={nodes[b].x} y2={nodes[b].y}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: [0, 1, 0.4, 1, 0.6] }}
                                transition={{ duration: 4, delay: i * 0.3, repeat: Infinity, repeatType: 'reverse', repeatDelay: 2 }}
                            />
                        ))}
                    </g>

                    {/* Network nodes */}
                    {nodes.map((n, i) => (
                        <g key={i}>
                            <motion.circle
                                cx={n.x} cy={n.y} r={10}
                                fill="none" stroke="rgba(16,185,129,0.4)" strokeWidth="0.6"
                                animate={{ r: [6, 14, 6], opacity: [0.7, 0, 0.7] }}
                                transition={{ duration: 2.4, delay: i * 0.4, repeat: Infinity }}
                            />
                            <circle cx={n.x} cy={n.y} r={2.2} fill="rgba(16,185,129,0.95)" />
                        </g>
                    ))}

                    {/* Random pings */}
                    {pings.map((p, i) => (
                        <motion.circle
                            key={`ping-${i}`}
                            cx={p.x} cy={p.y} r={2}
                            fill="none" stroke="rgba(16,185,129,0.9)" strokeWidth="0.8"
                            initial={{ r: 1, opacity: 0 }}
                            animate={{ r: [1, 12, 22], opacity: [0, 1, 0] }}
                            transition={{ duration: 2.2, delay: p.delay, repeat: Infinity, repeatDelay: 5 + i * 0.6 }}
                        />
                    ))}
                </svg>
            </div>

            {/* Scanning line */}
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
};

/* ============================================================
   RADAR SWEEP
   ============================================================ */
const RadarSweep = () => (
    <div className="hidden md:block absolute bottom-24 right-12 lg:bottom-32 lg:right-24 w-28 h-28 lg:w-40 lg:h-40 rounded-full border border-emerald-500/30 bg-emerald-500/[0.03]  z-0 pointer-events-none">
        <div className="absolute inset-[18%] rounded-full border border-emerald-500/20" />
        <div className="absolute inset-[38%] rounded-full border border-emerald-500/15" />
        <div className="absolute inset-[58%] rounded-full border border-emerald-500/10" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-500/20" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-500/20" />
        <motion.div
            className="absolute inset-0 rounded-full"
            style={{
                background: 'conic-gradient(from 0deg, rgba(16,185,129,0) 0deg, rgba(16,185,129,0) 280deg, rgba(16,185,129,0.15) 320deg, rgba(16,185,129,0.55) 355deg, rgba(16,185,129,0.9) 360deg)',
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
        delay: (i * 0.73) % 12,
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
   ROTATING WIREFRAME GLOBE
   ============================================================ */
const RotatingGlobe = () => (
    <div className="hidden lg:block absolute top-20 left-16 w-[280px] h-[280px] z-0 pointer-events-none opacity-[0.09]">
        <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-400" fill="none" stroke="currentColor" strokeWidth="0.5">
                    <circle cx="100" cy="100" r="90" />
                    <ellipse cx="100" cy="100" rx="90" ry="20" />
                    <ellipse cx="100" cy="100" rx="90" ry="45" />
                    <ellipse cx="100" cy="100" rx="90" ry="70" />
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.ellipse
                            key={i}
                            cx="100" cy="100" rx={90} ry="90"
                            animate={{ rx: [90, 60, 30, 0, 30, 60, 90] }}
                            transition={{ duration: 10, delay: i * 0.7, repeat: Infinity, ease: 'linear' }}
                        />
                    ))}
        </svg>
    </div>
);

/* ============================================================
   SCANLINES
   ============================================================ */
const Scanlines = () => (
    <div
        className="absolute inset-0 z-30 pointer-events-none mix-blend-overlay opacity-[0.035]"
        style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 3px)',
        }}
    />
);

/* ============================================================
   HEX PATTERN
   ============================================================ */
const HexPattern = () => (
    <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='104' viewBox='0 0 60 104'%3E%3Cpath d='M30 0 L60 17 L60 52 L30 69 L0 52 L0 17 Z M30 104 L60 87 L60 52 L30 69 L0 52 L0 87 Z' fill='none' stroke='%2310b981' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 104px',
        }}
    />
);

/* ============================================================
   SCANNING RINGS  —  expanding rings behind title
   ============================================================ */
const ScanningRings = () => (
    <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 pointer-events-none z-0">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/15"
                initial={{ width: 120, height: 120, opacity: 0.5 }}
                animate={{ width: [120, 700], height: [120, 700], opacity: [0.5, 0] }}
                transition={{ duration: 6, delay: i * 2, repeat: Infinity, ease: 'easeOut' }}
            />
        ))}
    </div>
);

/* ============================================================
   GLITCH TITLE  —  CONTINUOUSLY SHAKING
   ============================================================ */
const GlitchTitle = () => {
    return (
        <motion.h1
            className="relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-black tracking-tighter text-white"
            style={{ willChange: 'transform, text-shadow' }}
            animate={{
                // Getaran horizontal + vertikal terus-menerus
                x: [0, -1.2, 1.4, -0.8, 1.6, -1, 0.6, -1.4, 1, 0],
                y: [0, 0.6, -0.8, 0.4, -0.6, 0.8, -0.4, 0.6, -0.5, 0],
                // Chromatic aberration (cyan + merah)
                textShadow: [
                    '0 0 0 transparent',
                    '1.5px 0 0 #22d3ee, -1.5px 0 0 #ef4444',
                    '-1.5px 0 0 #22d3ee, 1.5px 0 0 #ef4444',
                    '1px 0 0 #22d3ee, -1px 0 0 #ef4444',
                    '-1px 0 0 #22d3ee, 1px 0 0 #ef4444',
                    '0.5px 0 0 #22d3ee, -0.5px 0 0 #ef4444',
                    '-1.2px 0 0 #22d3ee, 1.2px 0 0 #ef4444',
                    '1px 0 0 #22d3ee, -1px 0 0 #ef4444',
                    '0 0 0 transparent',
                ],
            }}
            transition={{
                duration: 0.55,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
            }}
        >
            NEO<span className="text-emerald-500">SANTARA</span>
        </motion.h1>
    );
};

/* ============================================================
   TYPEWRITER SUBTITLE
   ============================================================ */
const TypewriterSubtitle = () => {
    const { t } = useLanguage();
    const fullText = t('menu_utama.subtitle');
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    useEffect(() => {
        let i = 0;
        setDisplayed('');
        setDone(false);
        const timer = setInterval(() => {
            i += 1;
            setDisplayed(fullText.slice(0, i));
            if (i >= fullText.length) {
                clearInterval(timer);
                setDone(true);
            }
        }, 35);
        return () => clearInterval(timer);
    }, [fullText]);
    return (
        <p className="text-slate-400 text-[9px] sm:text-[11px] md:text-xs lg:text-sm tracking-[0.2em] sm:tracking-[0.25em] font-light">
            {displayed}
            {!done && <span className="inline-block w-[2px] h-3 bg-emerald-500 align-middle ml-0.5 animate-pulse" />}
        </p>
    );
};

/* ============================================================
   VERTICAL DATA STREAM  —  right edge
   ============================================================ */
const VerticalDataStream = () => {
    const [lines, setLines] = useState<string[]>([]);
    useEffect(() => {
        const gen = () =>
            Array.from({ length: 4 }, () =>
                Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
            ).join(' ');
        const tick = () => setLines((prev) => [gen(), ...prev].slice(0, 12));
        tick();
        const id = setInterval(tick, 380);
        return () => clearInterval(id);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-2 z-10 flex-col items-end gap-1 font-mono text-[8px] text-emerald-500/40 tracking-widest pointer-events-none"
        >
            {lines.map((l, i) => (
                <motion.span
                    key={`${l}-${i}`}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1 - i * 0.07, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {l}
                </motion.span>
            ))}
            <div className="absolute top-0 bottom-0 -right-1 w-px bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />
        </motion.div>
    );
};

/* ============================================================
   RETICLE CROSSHAIR  —  bottom-left small decoration
   ============================================================ */
const ReticleCrosshair = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.0, duration: 0.6 }}
        className="hidden md:block absolute bottom-14 left-8 z-10 pointer-events-none"
    >
        <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border border-emerald-500/25" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,1)]" />
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-2 bg-emerald-500/50" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-px h-2 bg-emerald-500/50" />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 h-px w-2 bg-emerald-500/50" />
            <div className="absolute top-1/2 -translate-y-1/2 right-0 h-px w-2 bg-emerald-500/50" />
            <motion.div
                className="absolute inset-[-6px] rounded-full border border-dashed border-emerald-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    </motion.div>
);

/* ============================================================
   COORDINATES + AUDIO VISUALIZER  —  bottom-right
   ============================================================ */
const CoordinatesReadout = () => {
    const [coord, setCoord] = useState({ lat: -6.2088, lng: 106.8456 });
    useEffect(() => {
        const id = setInterval(() => {
            setCoord({
                lat: -6.2088 + (Math.random() - 0.5) * 0.02,
                lng: 106.8456 + (Math.random() - 0.5) * 0.02,
            });
        }, 2000);
        return () => clearInterval(id);
    }, []);
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="hidden md:flex absolute bottom-14 right-14 z-20 items-center gap-4 font-mono text-[9px] text-emerald-500/70 tracking-widest pointer-events-none"
        >
            <div className="flex items-center gap-2">
                <Crosshair className="w-3 h-3" />
                <span>{coord.lat.toFixed(4)}°S</span>
                <span className="text-emerald-500/30">|</span>
                <span>{coord.lng.toFixed(4)}°E</span>
            </div>
            <span className="text-emerald-500/20">•</span>
            <div className="flex items-end gap-[2px] h-3">
                {[0, 1, 2, 3, 4].map((i) => (
                    <motion.span
                        key={i}
                        className="w-[2px] bg-emerald-500/70 rounded-full"
                        animate={{ height: ['20%', '100%', '40%', '80%', '20%'] }}
                        transition={{ duration: 1.4, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}
            </div>
            <Signal className="w-3 h-3 text-emerald-500/50" />
        </motion.div>
    );
};

/* ============================================================
   NEWS TICKER  —  bottom bar
   ============================================================ */
const NewsTicker = () => {
    const { t } = useLanguage();
    const headlines = [
        { tag: t('menu_utama.ticker_diplomacy_tag'), text: t('menu_utama.ticker_diplomacy_text') },
        { tag: t('menu_utama.ticker_economy_tag'), text: t('menu_utama.ticker_economy_text') },
        { tag: t('menu_utama.ticker_military_tag'), text: t('menu_utama.ticker_military_text') },
        { tag: t('menu_utama.ticker_tech_tag'), text: t('menu_utama.ticker_tech_text') },
        { tag: t('menu_utama.ticker_env_tag'), text: t('menu_utama.ticker_env_text') },
    ];
    const loop = [...headlines, ...headlines];
    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
            <div className="bg-slate-950/90 backdrop-blur-sm border-t border-emerald-500/10 flex items-center overflow-hidden h-8 sm:h-9 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center gap-1.5 px-3 h-full bg-emerald-500/10 border-r border-emerald-500/20 shrink-0">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                    </span>
                    <span className="text-[9px] font-black tracking-[0.25em] text-emerald-400">LIVE</span>
                </div>
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
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-950 to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-950 to-transparent" />
                </div>
            </div>
        </div>
    );
};

/* ============================================================
   HUD CORNERS
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
    const { t } = useLanguage();
    const [isLoaded, setIsLoaded] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const [mainMenuScreen, setMainMenuScreen] = useState<'menu' | 'continue' | 'settings' | 'credits'>('menu');
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [saveFiles, setSaveFiles] = useState<MainMenuSave[]>([]);
    const [isLoadingSaves, setIsLoadingSaves] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
        if (soundManager) {
            soundManager.playMusic();
        }
    }, []);

    const fetchSaveFiles = async () => {
        setIsLoadingSaves(true);
        try {
            const response = await fetchWithFirebaseAuth('/api/game-save');
            if (!response.ok) throw new Error('Gagal memuat save file.');
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error('Respons daftar save tidak valid.');
            setSaveFiles(data);
        } catch (error) {
            console.error("Error fetching save files:", error);
            alert(error instanceof Error ? error.message : 'Gagal memuat save file.');
        } finally {
            setIsLoadingSaves(false);
        }
    };

    const openContinueScreen = () => {
        fetchSaveFiles();
        setMainMenuScreen('continue');
    };

    const handleDeleteSave = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm(t('menu_utama.confirm_delete_save'))) return;
        try {
            const response = await fetchWithFirebaseAuth(`/api/game-save?id=${id}`, { method: 'DELETE' });
            if (response.ok) {
                setSaveFiles(prev => prev.filter(save => save.id !== id));
            } else {
                alert(t('menu_utama.delete_save_failed'));
            }
        } catch (error) {
            console.error("Error deleting save:", error);
            alert(t('menu_utama.delete_save_error'));
        }
    };

    const handleLoadSave = async (save: MainMenuSave) => {
        try {
            const response = await fetchWithFirebaseAuth(`/api/game-save?id=${save.id}`);
            if (!response.ok) throw new Error('Gagal memuat detail save game.');
            await stagePendingGameSave(await response.json());
            window.location.href = `/page/map_system?country=${encodeURIComponent(save.country_name)}`;
        } catch (error) {
            console.error('Gagal menyiapkan save untuk dimuat:', error);
            alert(error instanceof Error ? error.message : 'Gagal membuka save game.');
        }
    };

    if (mainMenuScreen === 'continue') {
        return (
            <MainMenuContinueScreen
                saves={saveFiles}
                isLoading={isLoadingSaves}
                onBack={() => setMainMenuScreen('menu')}
                onLoad={handleLoadSave}
                onDelete={handleDeleteSave}
            />
        );
    }

    if (mainMenuScreen === 'settings') {
        return <MainMenuSettingsScreen onBack={() => setMainMenuScreen('menu')} />;
    }

    if (mainMenuScreen === 'credits') {
        return <CreditsMenu onBack={() => setMainMenuScreen('menu')} />;
    }

    const menuItems = [
        { id: 'start', label: t('menu_utama.start_label'), sub: t('menu_utama.start_sub'), icon: Play, color: '#10b981', path: '/page/map_system/pilih-negara' },
        { id: 'continue', label: t('menu_utama.continue_label'), sub: t('menu_utama.continue_sub'), icon: Save, color: '#3b82f6', path: '#' },
        { id: 'settings', label: t('menu_utama.settings_label'), sub: t('menu_utama.settings_sub'), icon: Settings, color: '#f59e0b', path: '#' },
        { id: 'credits', label: t('menu_utama.credits_label'), sub: t('menu_utama.credits_sub'), icon: ScrollText, color: '#10b981', path: '#' },
        { id: 'exit', label: t('menu_utama.exit_label'), sub: t('menu_utama.exit_sub'), icon: LogOut, color: '#ef4444', path: '#' },
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
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                /* Mobile landscape specific optimizations */
                @media (orientation: landscape) and (max-height: 500px) {
                    .landscape-main-shell {
                        justify-content: flex-start !important;
                        padding-top: max(0.75rem, env(safe-area-inset-top)) !important;
                        padding-bottom: max(3.5rem, calc(env(safe-area-inset-bottom) + 2.75rem)) !important;
                        padding-left: max(1rem, env(safe-area-inset-left)) !important;
                        padding-right: max(1rem, env(safe-area-inset-right)) !important;
                    }
                    .landscape-content-grid {
                        display: grid !important;
                        grid-template-columns: minmax(280px, 1fr) minmax(220px, 320px) !important;
                        column-gap: 2rem !important;
                        row-gap: 0.75rem !important;
                        align-items: start !important;
                        width: 100% !important;
                        max-width: 1000px !important;
                    }
                }
            `}</style>

            <div className="landscape-main-shell relative min-h-screen min-h-[100dvh] bg-[#070b14] flex flex-col items-start justify-center p-4 sm:p-8 md:p-10 lg:p-14 overflow-x-hidden overflow-y-auto font-sans pb-14 pt-[max(1rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">

                {/* Global grid */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                <HexPattern />

                {/* Background Orbs */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0], y: [0, -50, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-1/4 left-1/4 w-32 sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 bg-emerald-500/10 rounded-full "
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [0, -70, 0], y: [0, 60, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute bottom-1/4 right-1/4 w-36 sm:w-48 lg:w-60 h-36 sm:h-48 lg:h-60 bg-blue-500/10 rounded-full "
                    />
                </div>

                {/* ============================================
                    FX Layers
                    ============================================ */}
                <ScanningRings />
                <HolographicMap />
                <DataParticles />
                <RotatingGlobe />
                <RadarSweep />
                <HudCorners />
                <VerticalDataStream />
                <ReticleCrosshair />
                <CoordinatesReadout />
                <NewsTicker />
                <Scanlines />

                {/* ============================================
                    MAIN CONTENT (Opacity 1 CSS-First, Robust)
                    ============================================ */}
                <div
                    className="landscape-content-grid relative z-10 flex flex-col items-start gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full max-w-3xl opacity-100"
                >
                    {/* Left Column in Landscape / Top in Portrait */}
                    <div className="flex flex-col items-start gap-2.5 sm:gap-3.5 w-full max-w-[340px]">
                        {/* Title Section */}
                        <div className="text-left space-y-1 sm:space-y-1.5 lg:space-y-2">
                            <div className="flex items-center justify-start gap-2 sm:gap-3 mb-1 sm:mb-2 lg:mb-3">
                                <div className="p-1 sm:p-2 lg:p-2.5 bg-emerald-500/10 rounded-lg sm:rounded-xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                    <Shield className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-9 lg:h-9 text-emerald-500" />
                                </div>
                            </div>

                            <GlitchTitle />
                            <TypewriterSubtitle />
                        </div>

                        {/* Menu Buttons */}
                        <div className="flex flex-col gap-1.5 sm:gap-2.5 lg:gap-3 w-full">
                            {menuItems.map((item, index) => {
                                const isActive = hoveredIndex === index;

                                const inner = (
                                    <>
                                        <div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                            style={{ background: `radial-gradient(circle at center, ${item.color}15 0%, transparent 100%)` }}
                                        />
                                        <span
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-3/5 rounded-r-full transition-all duration-300"
                                            style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }}
                                        />
                                        <item.icon className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
                                        <div className="flex flex-col items-start leading-tight min-w-0">
                                            <span className="text-slate-200 group-hover:text-white font-bold tracking-widest text-[11px] sm:text-[11px] lg:text-xs uppercase">
                                                {item.label}
                                            </span>
                                            <span className="text-slate-400 group-hover:text-slate-300 text-[8px] sm:text-[9px] tracking-[0.15em] font-medium uppercase mt-0.5 truncate">
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
                                    group relative w-full min-h-[46px] flex items-center gap-2.5 lg:gap-3 pl-3 pr-2 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl
                                    bg-white/5 border border-white/10 transition-all duration-300
                                    hover:bg-white/10 hover:border-white/20 active:bg-white/15 active:scale-[0.98]
                                    overflow-hidden cursor-pointer text-left select-none touch-manipulation
                                `;

                                return (
                                    <div
                                        key={item.id}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className="w-full opacity-100"
                                    >
                                        {item.id === 'continue' ? (
                                            <button type="button" onClick={openContinueScreen} className={btnClass}>{inner}</button>
                                        ) : item.path === '#' ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (item.id === 'exit') {
                                                        setIsExitModalOpen(true);
                                                    } else if (item.id === 'settings') {
                                                        setMainMenuScreen('settings');
                                                    } else if (item.id === 'credits') {
                                                        setMainMenuScreen('credits');
                                                    } else {
                                                        alert(t('menu_utama.settings_coming_soon'));
                                                    }
                                                }}
                                                className={btnClass}
                                            >{inner}</button>
                                        ) : (
                                            <Link href={item.path} className="w-full block select-none touch-manipulation">
                                                <div className={btnClass}>{inner}</div>
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer Info */}
                        <div
                            className="mt-1 sm:mt-3 lg:mt-6 flex flex-wrap items-center justify-start gap-2.5 sm:gap-4 lg:gap-6 text-[8px] sm:text-[9px] text-slate-500 tracking-[0.15em] sm:tracking-[0.2em]"
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
                        </div>
                    </div>

                </div>

                {/* Corner accents (outside) */}
                <div className="hidden sm:block absolute top-4 left-4 sm:top-8 sm:left-8 p-4 border-l border-t border-white/10 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none" />
                <div className="hidden sm:block absolute bottom-4 right-4 sm:bottom-8 sm:right-8 p-4 border-r border-b border-white/10 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none" />

                <ExitConfirmModal
                    isOpen={isExitModalOpen}
                    onClose={() => setIsExitModalOpen(false)}
                    onConfirm={() => {
                        if (soundManager) {
                            soundManager.stopMusic();
                        }
                        if (typeof window !== 'undefined') {
                            window.close();
                        }
                    }}
                />
            </div>
        </>
    );
}