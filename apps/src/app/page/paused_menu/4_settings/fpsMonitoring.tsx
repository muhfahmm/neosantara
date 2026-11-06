'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Activity, Copy } from 'lucide-react';

const FPS_MONITOR_STORAGE_KEY = 'neosantara_fps_monitor_enabled';
const FPS_MONITOR_CHANGE_EVENT = 'neosantara_fps_monitor_settings_changed';
let fallbackMonitorEnabled = true;

export type FpsMonitorWasmModule = {
    get_perf_stats_on_map?: () => unknown;
};

type FpsMonitorStats = {
    fps: number;
    minFps: number;
    avgFps: number;
    frameTimeMs: number;
    labelsDrawn: number;
    polysDrawn: number;
    scale: number;
    canvasW: number;
    canvasH: number;
    dpr: number;
    camEventsPerSec: number;
    isPanning: boolean;
    jsTaskTimeMs: number;
};

const INITIAL_STATS: FpsMonitorStats = {
    fps: 60,
    minFps: 60,
    avgFps: 60,
    frameTimeMs: 0,
    labelsDrawn: 0,
    polysDrawn: 0,
    scale: 1,
    canvasW: 0,
    canvasH: 0,
    dpr: 1,
    camEventsPerSec: 0,
    isPanning: false,
    jsTaskTimeMs: 0,
};

export function getFpsMonitorEnabled(): boolean {
    if (typeof window === 'undefined') return true;

    try {
        const savedSetting = window.localStorage.getItem(FPS_MONITOR_STORAGE_KEY);
        fallbackMonitorEnabled = savedSetting === null ? true : savedSetting === 'true';
        return fallbackMonitorEnabled;
    } catch (error) {
        console.error('Gagal membaca pengaturan monitor FPS:', error);
        return fallbackMonitorEnabled;
    }
}

export function setFpsMonitorEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;

    fallbackMonitorEnabled = enabled;
    try {
        window.localStorage.setItem(FPS_MONITOR_STORAGE_KEY, String(enabled));
    } catch (error) {
        console.error('Gagal menyimpan pengaturan monitor FPS:', error);
    }
    window.dispatchEvent(new CustomEvent(FPS_MONITOR_CHANGE_EVENT, { detail: enabled }));
}

function subscribeFpsMonitor(onChange: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(FPS_MONITOR_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(FPS_MONITOR_CHANGE_EVENT, onChange);
}

function useFpsMonitorEnabled(): boolean {
    return useSyncExternalStore(subscribeFpsMonitor, getFpsMonitorEnabled, () => true);
}

export function FpsMonitoring({
    wasmModuleRef,
}: {
    wasmModuleRef: React.RefObject<FpsMonitorWasmModule | null>;
}) {
    const [stats, setStats] = useState(INITIAL_STATS);
    const [history, setHistory] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const isEnabled = useFpsMonitorEnabled();

    useEffect(() => {
        if (!isEnabled) return;

        let frameCount = 0;
        let lastTime = performance.now();
        const fpsSamples: number[] = [];
        let cameraEventCount = 0;
        let lastCameraSecond = performance.now();
        let cameraEventsPerSecond = 0;

        const onCameraMove = () => {
            cameraEventCount++;
        };
        window.addEventListener('neosantara_map_camera', onCameraMove);

        const interval = window.setInterval(() => {
            const now = performance.now();
            const elapsed = now - lastTime;
            const currentFps = elapsed > 0 ? Math.round((frameCount * 1000) / elapsed) : 0;
            frameCount = 0;
            lastTime = now;

            fpsSamples.push(currentFps);
            if (fpsSamples.length > 20) fpsSamples.shift();
            const minFps = Math.min(...fpsSamples);
            const avgFps = Math.round(fpsSamples.reduce((total, sample) => total + sample, 0) / fpsSamples.length);

            const cameraElapsed = now - lastCameraSecond;
            if (cameraElapsed >= 1000) {
                cameraEventsPerSecond = Math.round((cameraEventCount * 1000) / cameraElapsed);
                cameraEventCount = 0;
                lastCameraSecond = now;
            }

            const canvas = document.getElementById('map-canvas') as HTMLCanvasElement | null;
            const wasmModule = wasmModuleRef.current ||
                (window as Window & { __neosantara_wasm?: { get_perf_stats_on_map?: () => unknown } }).__neosantara_wasm;
            let wasmStats: Partial<FpsMonitorStats> & { renderTimeMs?: number } = {};
            try {
                if (wasmModule?.get_perf_stats_on_map) {
                    const result = wasmModule.get_perf_stats_on_map();
                    if (result && typeof result === 'object') {
                        wasmStats = result as typeof wasmStats;
                    }
                }
            } catch (error) {
                console.warn('Gagal membaca statistik performa WASM:', error);
            }

            const jsTaskTime = (window as Window & { __neosantara_js_task_time_ms?: number }).__neosantara_js_task_time_ms || 0;
            const nextStats: FpsMonitorStats = {
                fps: currentFps,
                minFps,
                avgFps,
                frameTimeMs: Math.round((wasmStats.renderTimeMs || 0) * 10) / 10,
                labelsDrawn: wasmStats.labelsDrawn || 0,
                polysDrawn: wasmStats.polysDrawn || 0,
                scale: Math.round((wasmStats.scale || 1) * 100) / 100,
                canvasW: canvas?.width || 0,
                canvasH: canvas?.height || 0,
                dpr: window.devicePixelRatio || 1,
                camEventsPerSec: cameraEventsPerSecond,
                isPanning: Boolean(wasmStats.isPanning),
                jsTaskTimeMs: Math.round(jsTaskTime * 10) / 10,
            };

            setStats(nextStats);
            setHistory(previous => {
                const line = `[${new Date().toISOString().slice(14, 19)}] FPS:${nextStats.fps} (min:${nextStats.minFps}, avg:${nextStats.avgFps}) | Render:${nextStats.frameTimeMs}ms | JS:${nextStats.jsTaskTimeMs}ms | Labels:${nextStats.labelsDrawn} | Polys:${nextStats.polysDrawn} | Scale:${nextStats.scale}x | CamEvents/s:${nextStats.camEventsPerSec}`;
                return [line, ...previous.slice(0, 14)];
            });
        }, 500);

        let animationFrameId = 0;
        const countFrame = () => {
            frameCount++;
            animationFrameId = requestAnimationFrame(countFrame);
        };
        animationFrameId = requestAnimationFrame(countFrame);

        return () => {
            window.clearInterval(interval);
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('neosantara_map_camera', onCameraMove);
        };
    }, [isEnabled, wasmModuleRef]);

    if (!isEnabled) return null;

    return (
        <div className="relative z-20 flex shrink-0 self-stretch font-mono pointer-events-auto">
            <button
                type="button"
                onClick={() => setIsExpanded(value => !value)}
                aria-expanded={isExpanded}
                aria-label="Buka detail monitor FPS"
                className="flex h-full w-[112px] flex-col justify-center gap-0 rounded-xl border border-root-accent/30 bg-root-surface/90 px-1.5 text-left shadow-2xl transition-colors hover:border-root-accent/70"
            >
                <span className="flex items-center gap-1.5 text-[8px] font-black tracking-wide text-root-accent lg:text-[9px]">
                    <Activity className="h-3 w-3" />
                    FPS MONITOR
                </span>
                <span className={`text-lg font-black leading-none tabular-nums lg:text-xl ${stats.fps < 40 ? 'text-rose-400' : stats.fps < 55 ? 'text-amber-400' : 'text-emerald-300'}`}>
                    {stats.fps} <span className="text-[10px] font-bold text-gray-300">FPS</span>
                </span>
                <span className="text-[8px] font-semibold text-gray-400 lg:text-[9px]">
                    MIN {stats.minFps} <span className="px-1 text-root-accent/50">/</span> AVG {stats.avgFps}
                </span>
            </button>

            {isExpanded && (
                <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-root-accent/40 bg-root-canvas/[.97] p-3 text-white shadow-2xl ">
                    <div className="mb-2 flex items-center justify-between border-b border-root-accent/25 pb-1.5">
                        <span className="text-[10px] font-bold text-root-accent">DETAIL PERFORMA PETA</span>
                        <button
                            type="button"
                            onClick={() => {
                                void navigator.clipboard.writeText(history.join('\n')).catch(error => {
                                    console.error('Gagal menyalin log monitor FPS:', error);
                                });
                            }}
                            className="flex cursor-pointer items-center gap-1 rounded bg-root-accent/15 px-1.5 py-1 text-[9px] text-root-accent hover:bg-root-accent/25"
                        >
                            <Copy className="h-3 w-3" />
                            Salin Log
                        </button>
                    </div>
                    <div className="space-y-1 text-[10px]">
                        <Stat label="Waktu Render" value={`${stats.frameTimeMs} ms`} />
                        <Stat label="JS Non-Render" value={`${stats.jsTaskTimeMs} ms`} />
                        <Stat label="Label Kota" value={stats.labelsDrawn} />
                        <Stat label="Poligon Diisi" value={stats.polysDrawn} />
                        <Stat label="Zoom Scale" value={`${stats.scale}x`} />
                        <Stat label="Canvas (WxH @ DPR)" value={`${stats.canvasW}x${stats.canvasH} @ ${stats.dpr}x`} />
                        <Stat label="Camera Events" value={`${stats.camEventsPerSec}/detik`} />
                    </div>
                </div>
            )}
        </div>
    );
}

export function FpsMonitoringSettings() {
    const isEnabled = useFpsMonitorEnabled();

    const toggleMonitor = () => {
        const nextEnabled = !isEnabled;
        setFpsMonitorEnabled(nextEnabled);
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            onClick={toggleMonitor}
            className="flex w-full cursor-pointer items-center justify-between rounded border border-root-accent/20 bg-root-canvas/80 p-2 text-left transition-colors hover:border-root-accent/40"
        >
            <span className="flex items-center gap-2 text-[11px] font-semibold text-gray-200">
                <Activity className="h-3.5 w-3.5 text-root-accent" />
                Monitor FPS di layar
            </span>
            <span className={`flex h-[18px] w-8 items-center rounded-full p-0.5 transition-colors ${isEnabled ? 'bg-root-accent' : 'bg-root-subtle/50'}`}>
                <span className={`h-3.5 w-3.5 rounded-full bg-root-accent-ink shadow-sm transition-transform ${isEnabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </span>
        </button>
    );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-3">
            <span>{label}:</span>
            <span className="text-right text-root-accent">{value}</span>
        </div>
    );
}