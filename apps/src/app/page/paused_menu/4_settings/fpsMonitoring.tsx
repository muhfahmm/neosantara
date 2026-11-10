'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Copy } from 'lucide-react';
import { useViewportMode } from '@/app/hooks/useViewportMode';

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

export function FpsMonitoring({
    wasmModuleRef,
}: {
    wasmModuleRef: React.RefObject<FpsMonitorWasmModule | null>;
}) {
    const [stats, setStats] = useState(INITIAL_STATS);
    const [history, setHistory] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const isMobileDevice = useViewportMode() !== 'desktop';

    useEffect(() => {
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
    }, [wasmModuleRef]);

    return (
        <div className="relative z-20 flex shrink-0 self-stretch font-mono pointer-events-auto">
            <button
                type="button"
                onClick={() => setIsExpanded(value => !value)}
                aria-expanded={isExpanded}
                aria-label="Buka detail monitor FPS"
                className={`flex h-full ${
                    isMobileDevice
                        ? 'w-[60px] flex-row items-center justify-center gap-1 rounded-lg px-1'
                        : 'w-[112px] flex-col justify-center gap-0 rounded-xl px-1.5'
                } border border-root-accent/30 bg-root-surface/90 text-left shadow-2xl transition-colors hover:border-root-accent/70`}
            >
                {isMobileDevice ? (
                    <>
                        <Activity className="h-3 w-3 shrink-0 text-root-accent" />
                        <span className={`text-sm font-black leading-none tabular-nums ${stats.fps < 40 ? 'text-rose-400' : stats.fps < 55 ? 'text-amber-400' : 'text-emerald-300'}`}>
                            {stats.fps}
                        </span>
                        <span className="text-[7px] font-bold text-gray-300">FPS</span>
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </button>

            {isExpanded && (
                <div className={`absolute top-full z-[240] mt-2 w-64 max-w-[calc(100vw-1rem)] rounded-xl border border-root-accent/40 bg-root-canvas/[.97] p-3 text-white shadow-2xl ${isMobileDevice ? 'right-0' : 'left-0'}`}>
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

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-3">
            <span>{label}:</span>
            <span className="text-right text-root-accent">{value}</span>
        </div>
    );
}