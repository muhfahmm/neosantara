'use client';

import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  Swords, Zap, X, Map as MapIcon, Crosshair, Shield,
  Navigation, Waves, Mountain, Building2, Target, Trees, Loader2, Info as InfoIcon,
  ZoomIn, ZoomOut, Maximize2, Compass,
} from 'lucide-react';
import {
  TacticalMap, GridRulers,
  BASE_W, BASE_H, GRID_SIZE, MAP_MIN_Y, MAP_MAX_Y, MAX_VIEW_W, getMinViewW,
  clamp, cellLabel, fitView, clampView, viewScale,
  type ViewBox, type SimPhase, type TerrainType,
} from './TacticalMap';
import { loadRustViewport, panViewport, scheduleViewportCommit, zoomViewport } from './warMapViewport';
import {
  formatUnitQuantity,
  getWarUnitComposition,
} from './units/warUnitComposition';

export type { TerrainType };

interface PageWarProps {
  attackerName: string;
  targetName: string;
  onAutoResult: () => void;
  onClose?: () => void;
  terrainType?: TerrainType;
  attackerDetail?: unknown;
  targetDetail?: unknown;
  isUserDefender?: boolean;
  isCoalitionForce?: boolean;
}

/* ───────────────────────── THEMES ───────────────────────── */
const THEMES = {
  default: { bgColor: '#0F172A', accent: '#00FFAA', accentRgb: '0, 255, 170', water: '#3b82f6', terrainName: 'Dataran Standar', gradient: 'radial-gradient(circle at 50% 45%, #22314a 0%, #0F172A 100%)' },
  desert:  { bgColor: '#27180C', accent: '#F59E0B', accentRgb: '245, 158, 11', water: '#22b8cf', terrainName: 'Gurun Pasir',    gradient: 'radial-gradient(circle at 50% 45%, #4a2b14 0%, #1A0E05 100%)' },
  snow:    { bgColor: '#0F172A', accent: '#38BDF8', accentRgb: '56, 189, 248', water: '#7dd3fc', terrainName: 'Tundra Salju',   gradient: 'radial-gradient(circle at 50% 45%, #1E3A8A 0%, #0F172A 100%)' },
  jungle:  { bgColor: '#052E16', accent: '#10B981', accentRgb: '16, 185, 129', water: '#2dd4bf', terrainName: 'Hutan Tropis',   gradient: 'radial-gradient(circle at 50% 45%, #065f46 0%, #022C22 100%)' },
  urban:   { bgColor: '#1F2937', accent: '#94A3B8', accentRgb: '148, 163, 184', water: '#60a5fa', terrainName: 'Zona Perkotaan', gradient: 'radial-gradient(circle at 50% 45%, #3f4b5e 0%, #111827 100%)' },
} as const;

/* ───────────────── INFO TOOLTIP ───────────────── */
type InfoId =
  | 'lake' | 'highland' | 'forest' | 'urban' | 'objective' | 'attacker' | 'defender'
  | 'airbaseOwn' | 'airbaseEnemy' | 'sand' | 'swamp' | 'crater' | 'capture' | 'resource' | 'hqAttacker' | 'hqDefender';
type Tone = 'good' | 'bad' | 'neutral';
interface Info {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  name: string; tag: string; desc: string;
  stats: { k: string; v: string; tone: Tone }[];
}
const TONE: Record<Tone, string> = { good: 'text-emerald-300', bad: 'text-rose-300', neutral: 'text-gray-200' };

const Corners = ({ c }: { c: string }) => (
  <>
    {['top-2 left-2 border-t-2 border-l-2', 'top-2 right-2 border-t-2 border-r-2', 'bottom-2 left-2 border-b-2 border-l-2', 'bottom-2 right-2 border-b-2 border-r-2'].map((p) => (
      <span key={p} className={`pointer-events-none absolute z-20 h-4 w-4 ${p}`} style={{ borderColor: c }} />
    ))}
  </>
);

export default function LandWarMap({
  attackerName,
  targetName,
  onAutoResult,
  onClose,
  terrainType = 'default',
  attackerDetail,
  targetDetail,
  isUserDefender = false,
  isCoalitionForce = false,
}: PageWarProps) {
  const theme = THEMES[terrainType] ?? THEMES.default;
  const { accent, accentRgb } = theme;
  const playerSide = isUserDefender ? 'defender' : 'attacker';

  const deploymentConfig = useMemo<Record<string, unknown>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const savedConfig = window.localStorage.getItem('deployed_units_config');
      if (!savedConfig) return {};
      const parsed: unknown = JSON.parse(savedConfig);
      return parsed !== null && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
    } catch (error) {
      console.error('Gagal membaca konfigurasi pengerahan unit.', error);
      return {};
    }
  }, []);

  const attackerUnits = useMemo(
    () => getWarUnitComposition(attackerDetail, deploymentConfig, !isUserDefender && !isCoalitionForce),
    [attackerDetail, deploymentConfig, isUserDefender, isCoalitionForce],
  );
  const defenderUnits = useMemo(
    () => getWarUnitComposition(targetDetail, deploymentConfig, isUserDefender),
    [targetDetail, deploymentConfig, isUserDefender],
  );

  /* ─── State Simulasi & Log ─── */
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPhase, setSimPhase] = useState<SimPhase>('idle');
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const timerIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battleLogs]);

  useEffect(() => {
    return () => {
      timerIdsRef.current.forEach(clearTimeout);
      timerIdsRef.current = [];
    };
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timerIdsRef.current.push(id);
  };

  const addLog = (msg: string) => {
    setBattleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString('id-ID', { hour12: false })}] ${msg}`]);
  };

  const handleStartSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setBattleLogs([]);
    setSimPhase('advance');
    addLog('Menginisiasi protokol serangan. Pasukan maju ke titik objektif.');

    schedule(() => {
      setSimPhase('clash');
      addLog('Kontak senjata! Terjadi baku tembak di area urban.');
      addLog('Artileri penyerang meluncurkan tembakan pendukung.');

      schedule(() => {
        setSimPhase('done');
        addLog('Garis pertahanan musuh hancur.');
        addLog('Menghitung kerugian unit dan hasil operasi...');

        schedule(() => { onAutoResult(); }, 2000);
      }, 3000);
    }, 3000);
  };

  /* ─── Zoom / Pan / Tooltip ─── */
  const mapRef = useRef<HTMLDivElement>(null);
  const arRef = useRef(BASE_W / BASE_H);
  const [vb, setVb] = useState<ViewBox>(() => fitView(BASE_W / BASE_H));
  const viewRef = useRef(vb);
  const pendingViewRef = useRef<ViewBox | null>(null);
  const viewFrameRef = useRef<number | null>(null);
  const rustViewportRef = useRef<Awaited<ReturnType<typeof loadRustViewport>> | undefined>(undefined);
  const [hoverCell, setHoverCell] = useState<string | null>(null);
  const [selCell, setSelCell] = useState<string | null>(null);
  const dragRef = useRef<{ sx: number; sy: number; vbX: number; vbY: number; vbW: number; vbH: number; moved: boolean } | null>(null);
  const [hovered, setHovered] = useState<InfoId | null>(null);
  const lastId = useRef<InfoId>('objective');
  const tipRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);

  const scheduleView = useCallback((nextView: ViewBox) => {
    scheduleViewportCommit(nextView, viewRef, pendingViewRef, viewFrameRef, setVb);
  }, []);

  useEffect(() => {
    let mounted = true;
    const activeFrameRef = viewFrameRef;
    void loadRustViewport()
      .then((module) => { if (mounted) rustViewportRef.current = module; })
      .catch((error: unknown) => console.error('Gagal memuat kalkulasi viewport Rust; menggunakan kalkulasi cadangan.', error));
    return () => {
      mounted = false;
      if (activeFrameRef.current !== null) cancelAnimationFrame(activeFrameRef.current);
    };
  }, []);

  const INFO: Record<InfoId, Info> = useMemo(() => ({
    lake:       { icon: Waves,     name: 'Danau',          tag: 'Perairan',          desc: 'Perairan tenang tempat unit laut berlabuh. Menghalangi unit darat.', stats: [{ k: 'Kecepatan', v: '-50%', tone: 'bad' }, { k: 'Unit laut', v: 'Berlabuh', tone: 'good' }] },
    highland:   { icon: Mountain,  name: 'Dataran Tinggi', tag: 'Posisi bertahan',   desc: 'Lereng curam menguntungkan pihak yang menguasai puncak.',          stats: [{ k: 'Pertahanan', v: '+25%', tone: 'good' }, { k: 'Kecepatan', v: '-50%', tone: 'bad' }] },
    forest:     { icon: Trees,     name: 'Hutan Lebat',    tag: 'Penyamaran',        desc: 'Kanopi rapat melindungi pasukan dari pengamatan udara.',          stats: [{ k: 'Pertahanan', v: '+15%', tone: 'good' }, { k: 'Visibilitas', v: '-20%', tone: 'bad' }] },
    urban:      { icon: Building2, name: 'Zona Urban',     tag: 'Medan kota',        desc: 'Gedung memecah formasi dan memaksa pertempuran jarak dekat.',     stats: [{ k: 'Mode tempur', v: 'CQC', tone: 'neutral' }] },
    objective:  { icon: Target,    name: 'Titik Strategis', tag: 'Objektif utama',   desc: 'Kuasai titik ini untuk memenangkan operasi.',                      stats: [{ k: 'Prioritas', v: 'Utama', tone: 'neutral' }] },
    attacker:   { icon: Swords,    name: attackerName,     tag: 'Pasukan penyerang', desc: 'Divisi lapis baja dengan dukungan helikopter serang.',            stats: [{ k: 'Satuan', v: 'Divisi (XX)', tone: 'neutral' }] },
    defender:   { icon: Shield,    name: targetName,       tag: 'Pasukan bertahan',  desc: 'Unit tank bertahan di sektor yang dijaga.',                        stats: [{ k: 'Satuan', v: 'Brigade (X)', tone: 'neutral' }] },
    sand:       { icon: Mountain,  name: 'Pasir Gembur',   tag: 'Medan lambat',      desc: 'Pasir lepas membuat roda dan track sulit bergerak.',              stats: [{ k: 'Kecepatan', v: '-30%', tone: 'bad' }] },
    swamp:      { icon: Waves,     name: 'Rawa',           tag: 'Medan lambat',      desc: 'Tanah berlumpur menahan kendaraan berat.',                         stats: [{ k: 'Kecepatan', v: '-40%', tone: 'bad' }] },
    crater:     { icon: Crosshair, name: 'Kawah Ledakan',  tag: 'Medan rusak',       desc: 'Permukaan tidak rata memperlambat unit darat.',                    stats: [{ k: 'Kecepatan', v: '-20%', tone: 'bad' }, { k: 'Pertahanan', v: '+10%', tone: 'good' }] },
    capture:    { icon: Target,    name: 'Titik Rebut',    tag: 'Objektif sekunder', desc: 'Menguasai titik ini mendukung objektif utama.',                    stats: [{ k: 'Prioritas', v: 'Sekunder', tone: 'neutral' }] },
    resource:   { icon: Building2, name: 'Sumber Daya',    tag: 'Logistik',          desc: 'Depo yang menopang suplai pasukan.',                               stats: [{ k: 'Efek', v: 'Suplai', tone: 'good' }] },
    airbaseOwn:   { icon: Navigation, name: 'Pangkalan Udara Anda', tag: 'Basis udara', desc: 'Landasan pacu dan hanggar di dekat HQ Anda untuk operasi pesawat dan helikopter.', stats: [{ k: 'Dukungan udara', v: 'Aktif', tone: 'good' }, { k: 'Sortie', v: 'Cepat', tone: 'good' }] },
    airbaseEnemy: { icon: Navigation, name: 'Pangkalan Udara Musuh', tag: 'Basis udara', desc: 'Landasan pacu musuh di dekat HQ mereka. Menghancurkannya melemahkan dukungan udara lawan.', stats: [{ k: 'Dukungan udara', v: 'Musuh', tone: 'bad' }, { k: 'Prioritas', v: 'Tinggi', tone: 'neutral' }] },
    hqAttacker: { icon: Swords,    name: isUserDefender ? 'HQ Musuh (Penyerang)' : 'HQ Anda (Penyerang)', tag: 'Markas', desc: isUserDefender ? 'Pusat komando pasukan penyerang di kanan bawah.' : 'Pusat komando pasukan Anda di kiri atas.', stats: [{ k: 'Status', v: 'Aktif', tone: isUserDefender ? 'bad' : 'good' }] },
    hqDefender: { icon: Shield,    name: isUserDefender ? 'HQ Anda (Bertahan)' : 'HQ Musuh (Bertahan)', tag: 'Markas', desc: isUserDefender ? 'Pertahankan markas ini dari serangan musuh.' : 'Rebut markas di kanan bawah ini untuk memenangkan operasi.', stats: [{ k: 'Status', v: isUserDefender ? 'Pertahankan' : 'Target', tone: isUserDefender ? 'good' : 'bad' }] },
  }), [attackerName, targetName, isUserDefender]);

  if (hovered) lastId.current = hovered;
  const info = INFO[hovered ?? lastId.current];
  const TipIcon = info.icon;

  // viewBox selalu mengikuti rasio kontainer
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    let first = true;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (!width || !height) return;
      const ar = width / height;
      arRef.current = ar;
      const isFirst = first;
      first = false;
      const current = viewRef.current;
      scheduleView(isFirst ? fitView(ar) : clampView({ ...current, h: current.w / ar }, ar));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [scheduleView]);

  const zoomAt = useCallback((clientX: number, clientY: number, factor: number) => {
    const el = mapRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const aspect = box.width / box.height;
    const nextView = zoomViewport(viewRef.current, {
      boxWidth: box.width,
      boxHeight: box.height,
      minWidth: MAX_VIEW_W,
      maxWidth: getMinViewW(aspect),
      worldWidth: BASE_W,
      worldHeight: MAP_MAX_Y - MAP_MIN_Y,
    }, clientX - box.left, clientY - box.top, factor, rustViewportRef.current);
    scheduleView(clampView(nextView, aspect));
  }, [scheduleView]);

  const zoomCenter = useCallback((factor: number) => {
    const el = mapRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    zoomAt(box.left + box.width / 2, box.top + box.height / 2, factor);
  }, [zoomAt]);

  const resetZoom = useCallback(() => scheduleView(fitView(arRef.current)), [scheduleView]);

  // Listener native (passive: false) supaya preventDefault benar-benar mencegah scroll halaman
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (isSimulating) return;
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 1 / 1.15);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isSimulating, zoomAt]);

  const updateHud = useCallback((clientX: number, clientY: number, box: DOMRect) => {
    const current = viewRef.current;
    const { scale, ox, oy } = viewScale(box, current);
    const gx = clamp(Math.floor(current.x + (clientX - box.left - ox) / scale), 0, BASE_W);
    const gy = clamp(Math.floor(current.y + (clientY - box.top - oy) / scale), MAP_MIN_Y, MAP_MAX_Y - 1);
    const col = clamp(Math.floor(gx / GRID_SIZE), 0, BASE_W / GRID_SIZE - 1);
    const row = Math.floor(gy / GRID_SIZE);
    const key = `${col},${row}`;
    setHoverCell((prev) => (prev === key ? prev : key));
    if (coordRef.current) {
      const yText = `${gy < 0 ? '-' : ''}${String(Math.abs(gy)).padStart(4, '0')}`;
      coordRef.current.textContent = `X ${String(gx).padStart(4, '0')}  Y ${yText}  GRID ${cellLabel(col, row)}`;
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSimulating || e.button !== 0) return;
    if (e.target instanceof Element && e.target.closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const current = viewRef.current;
    dragRef.current = { sx: e.clientX, sy: e.clientY, vbX: current.x, vbY: current.y, vbW: current.w, vbH: current.h, moved: false };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSimulating) return;
    const box = e.currentTarget.getBoundingClientRect();
    const drag = dragRef.current;

    if (drag) {
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) drag.moved = true;
      if (drag.moved) {
        const aspect = box.width / box.height;
        const nextView = panViewport(
          { x: drag.vbX, y: drag.vbY, w: drag.vbW, h: drag.vbH },
          {
            boxWidth: box.width,
            boxHeight: box.height,
            minWidth: MAX_VIEW_W,
            maxWidth: getMinViewW(aspect),
            worldWidth: BASE_W,
            worldHeight: MAP_MAX_Y - MAP_MIN_Y,
          },
          dx,
          dy,
          rustViewportRef.current,
        );
        scheduleView(clampView(nextView, aspect));
        return;
      }
    }

    updateHud(e.clientX, e.clientY, box);
    const px = e.clientX - box.left, py = e.clientY - box.top;
    const id = (e.target as Element).closest?.('[data-terrain]')?.getAttribute('data-terrain') as InfoId | null | undefined;
    setHovered(id && id in INFO ? id : null);
    const tip = tipRef.current;
    if (tip) {
      const w = tip.offsetWidth, h = tip.offsetHeight;
      let x = px + 18, y = py + 18;
      if (x + w > box.width - 8) x = px - w - 18;
      if (y + h > box.height - 8) y = py - h - 18;
      tip.style.transform = `translate3d(${Math.max(8, x)}px, ${Math.max(8, y)}px, 0)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (dragRef.current && !dragRef.current.moved) setSelCell(hoverCell); // klik = pilih sel grid
    dragRef.current = null;
  };

  const handlePointerLeave = () => {
    setHovered(null);
    if (!dragRef.current) setHoverCell(null);
  };

  const handleLostPointerCapture = () => {
    dragRef.current = null;
  };

  // Pasukan Anda selalu di kiri atas (hijau), musuh di kanan bawah (merah) — apa pun perannya
  const attackerTotal = useMemo(() => attackerUnits.reduce((s, u) => s + (u.quantity || 0), 0), [attackerUnits]);
  const defenderTotal = useMemo(() => defenderUnits.reduce((s, u) => s + (u.quantity || 0), 0), [defenderUnits]);
  const ownTotal = isUserDefender ? defenderTotal : attackerTotal;
  const enemyTotal = isUserDefender ? attackerTotal : defenderTotal;
  const totalTroops = ownTotal + enemyTotal || 1;
  const ownPct = Math.round((ownTotal / totalTroops) * 100);

  return (
    <div className="fixed inset-0 z-[300] flex select-none flex-col justify-between overflow-hidden p-4 font-sans transition-colors duration-1000 sm:p-6" style={{ backgroundColor: theme.bgColor }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .nw-a{transform-box:fill-box;transform-origin:center}
        .nw-ping{animation:nw-ping 2.2s ease-out infinite}
        .nw-ping-slow{animation:nw-ping-slow 3s ease-out infinite}
        .nw-pulse{animation:nw-pulse 1.2s ease-in-out infinite}
        .nw-lock{animation:nw-lock 1.1s ease-in-out infinite}
        .nw-smoke{animation:nw-smoke 6s ease-out infinite;opacity:0}
        .nw-drift{animation:nw-drift 30s ease-in-out infinite alternate;will-change:transform}
        .nw-rotor{animation:nw-rotor .18s linear infinite}
        .nw-flow{animation:nw-flow 2.4s linear infinite}
        .nw-flow-slow{animation:nw-flow 4.2s linear infinite}
        .nw-flicker{animation:nw-flicker 3s ease-in-out infinite}
        .nw-tz{cursor:crosshair;}
        @keyframes nw-ping{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.4);opacity:0}}
        @keyframes nw-ping-slow{0%{transform:scale(.7);opacity:.7}100%{transform:scale(2.6);opacity:0}}
        @keyframes nw-pulse{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes nw-lock{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(1.15);opacity:1}}
        @keyframes nw-flow{to{stroke-dashoffset:-80}}
        @keyframes nw-smoke{0%{transform:translate(0,0) scale(.5);opacity:0}15%{opacity:.5}100%{transform:translate(70px,-250px) scale(2.6);opacity:0}}
        @keyframes nw-drift{from{transform:translateX(-140px)}to{transform:translateX(180px)}}
        @keyframes nw-flicker{0%,100%{opacity:.85}50%{opacity:.55}}
        @keyframes nw-rotor{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.55)}}
        @media (prefers-reduced-motion:reduce){.nw-a,.nw-flow,.nw-flow-slow,.nw-flicker,.nw-ping,.nw-ping-slow,.nw-pulse{animation:none!important}}
      ` }} />

      {/* HEADER */}
      <div className="relative z-30 flex shrink-0 items-center justify-between border-b pb-3 transition-colors duration-1000" style={{ borderColor: `${accent}4D` }}>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border p-2.5 transition-colors duration-1000" style={{ backgroundColor: `${accent}15`, borderColor: `${accent}66`, color: accent, boxShadow: `0 0 20px rgba(${accentRgb}, 0.2)` }}>
            <Swords className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-black uppercase leading-none tracking-widest transition-colors duration-1000 sm:text-lg" style={{ color: accent }}>Tactical Command Center</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-300 sm:text-xs">
              Operasi Militer: {attackerName} <span className="mx-1 text-rose-500">VS</span> {targetName}
              <span className="ml-2 rounded border bg-black/40 px-2 py-0.5 text-[9px]" style={{ borderColor: `${accent}80`, color: accent }}>{theme.terrainName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onAutoResult} disabled={isSimulating}
            className={`hidden sm:flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-all ${isSimulating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'}`}>
            <Crosshair className="h-4 w-4" /> Hasil Otomatis
          </button>

          <button onClick={handleStartSimulation} disabled={isSimulating}
            className={`group flex transform items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${isSimulating ? 'opacity-70 cursor-wait scale-100' : 'cursor-pointer hover:scale-105'}`}
            style={{ backgroundColor: isSimulating ? '#f43f5e' : accent, color: '#050B0B', boxShadow: `0 0 20px rgba(${isSimulating ? '244, 63, 94' : accentRgb}, 0.4)` }}>
            {isSimulating
              ? <><Loader2 className="h-4 w-4 animate-spin" /> <span className="hidden sm:inline">Menyimulasikan...</span></>
              : <><Zap className="h-4 w-4 fill-current transition-transform group-hover:rotate-12" /> <span className="hidden sm:inline">Mulai Simulasi</span></>}
          </button>

          <button onClick={() => setShowInfo(!showInfo)} aria-label="Legenda"
            className={`rounded-xl border p-2.5 transition-colors focus-visible:outline focus-visible:outline-2 ${showInfo ? 'bg-white/10' : 'hover:bg-white/10'}`}
            style={{ borderColor: `${accent}4D`, color: accent }}>
            <InfoIcon className="h-5 w-5" />
          </button>

          {onClose && (
            <button onClick={onClose} disabled={isSimulating} aria-label="Tutup"
              className={`rounded-xl border p-2.5 transition-colors focus-visible:outline focus-visible:outline-2 ${isSimulating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'}`}
              style={{ borderColor: `${accent}4D`, color: accent }}>
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* DROPDOWN INFO / LEGENDA */}
      {showInfo && (
        <div className="absolute right-4 top-[70px] z-50 max-h-[calc(100vh-110px)] w-[270px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border bg-black/90 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 sm:right-6 sm:top-[80px]" style={{ borderColor: `${accent}80` }}>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider" style={{ color: accent }}><Shield className="h-4 w-4" /> Legenda & Intel</h3>
          <div className="space-y-3 text-[10px] font-bold text-gray-300">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-emerald-400/40 bg-emerald-800" /> Hutan Lebat (+15% Def)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 border border-slate-400/40 bg-gradient-to-b from-slate-400 to-slate-800" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} /> Dataran Tinggi (+25% Def)</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-3 rounded-full" style={{ backgroundColor: theme.water }} /> Danau (-50% Speed)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#2c4a36] border border-emerald-300/30" /> Rawa (-40% Speed)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#d9bf8c]" /> Pasir Gembur (-30% Speed)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-black border border-amber-400/50" /> Kawah (-20% Speed)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-white shadow-[0_0_8px_#ffffff]" /> Objektif Utama</div>
            <div className="my-1 h-px bg-white/10" />
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#486f3c]" /> Rerumputan (medan terbuka)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#6b5a3c]" /> Tanah (medan terbuka)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 bg-[#7b8494]" style={{ clipPath: 'polygon(20% 0, 80% 10%, 100% 60%, 70% 100%, 10% 90%, 0 40%)' }} /> Bebatuan (dekorasi medan)</div>
            <div className="my-1 h-px bg-white/10" />
            <div className="flex items-center gap-2"><span className="h-3 w-4 rounded-sm border" style={{ borderColor: accent }} /> Pasukan & base Anda (kiri atas)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rotate-45 border border-rose-500" /> Pasukan & base musuh (kanan bawah)</div>
            <div className="my-1 h-px bg-white/10" />
            <div className="text-[9px] leading-relaxed text-gray-400">
              <span className="font-black" style={{ color: accent }}>Kabut pandang:</span> area di luar jangkauan unit & HQ Anda diredupkan lembut.<br />
              <span className="font-black" style={{ color: accent }}>Kontrol peta:</span> scroll = zoom, drag = geser, klik = tandai sel koordinat, double-click = reset, tombol +/− untuk zoom bertahap.
            </div>
          </div>
        </div>
      )}

      {/* AREA PETA */}
      <div className="relative z-10 my-4 flex min-h-0 flex-1 gap-4">
        <div
          ref={mapRef}
          className={`relative flex-1 overflow-hidden rounded-2xl border shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] transition-colors duration-1000 ${isSimulating ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing'}`}
          style={{
            background: theme.gradient,
            borderColor: isSimulating ? '#f43f5e' : `${accent}4D`,
            ['--nw-accent' as string]: accent,
            touchAction: 'none',
            overscrollBehavior: 'contain',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handleLostPointerCapture}
          onPointerLeave={handlePointerLeave}
          onDoubleClick={resetZoom}
        >
          <TacticalMap
            accent={accent}
            water={theme.water}
            terrainType={terrainType}
            isSimulating={isSimulating}
            simPhase={simPhase}
            attackerUnits={attackerUnits}
            defenderUnits={defenderUnits}
            viewBox={vb}
            playerSide={playerSide}
          />

          {/* KURSOR SEL KOORDINAT (tanpa garis grid) */}
          <GridRulers vb={vb} accent={accent} hover={hoverCell} selected={selCell} />

          {/* KOMPAS */}
          <div className="pointer-events-none absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border bg-black/40 backdrop-blur-sm" style={{ borderColor: `${accent}4D`, color: accent }}>
            <Compass className="h-5 w-5" />
            <span className="absolute top-0.5 text-[8px] font-black tracking-widest">N</span>
          </div>

          {/* KONTROL ZOOM */}
          <div className="absolute right-4 top-4 z-20 flex flex-col gap-1.5" onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
            <button onClick={() => zoomCenter(1.5)} disabled={isSimulating} aria-label="Zoom in"
              className="flex h-8 w-8 items-center justify-center rounded-md border bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-40"
              style={{ borderColor: `${accent}4D`, color: accent }}>
              <ZoomIn className="h-4 w-4" />
            </button>
            <button onClick={() => zoomCenter(1 / 1.5)} disabled={isSimulating} aria-label="Zoom out"
              className="flex h-8 w-8 items-center justify-center rounded-md border bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-40"
              style={{ borderColor: `${accent}4D`, color: accent }}>
              <ZoomOut className="h-4 w-4" />
            </button>
            <button onClick={resetZoom} disabled={isSimulating} aria-label="Reset zoom"
              className="flex h-8 w-8 items-center justify-center rounded-md border bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-40"
              style={{ borderColor: `${accent}4D`, color: accent }}>
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          <Corners c={isSimulating ? '#f43f5e' : accent} />

          {/* TOOLTIP */}
          {!isSimulating && (
            <div ref={tipRef} aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-30 w-[230px] rounded-md border bg-black/80 backdrop-blur-md transition-opacity duration-150"
              style={{ opacity: hovered ? 1 : 0, borderColor: `${accent}80`, boxShadow: `0 0 18px rgba(${accentRgb}, 0.25), inset 0 0 20px rgba(${accentRgb}, 0.06)`, willChange: 'transform' }}>
              <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: `${accent}40` }}>
                <TipIcon size={14} style={{ color: accent }} />
                <div>
                  <div className="text-[11px] font-black uppercase leading-none tracking-wider text-white">{info.name}</div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">{info.tag}</div>
                </div>
              </div>
              <div className="space-y-2 p-3">
                <p className="text-[10px] leading-snug text-gray-300">{info.desc}</p>
                {info.stats.map((s) => (
                  <div key={s.k} className="flex justify-between font-mono text-[10px] font-bold">
                    <span className="text-gray-500">{s.k}</span>
                    <span className={TONE[s.tone]}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HUD KOORDINAT */}
          <div className="pointer-events-none absolute bottom-5 left-6 z-20 flex items-center gap-4 rounded bg-black/60 px-2 py-1 font-mono text-[9px] backdrop-blur-sm" style={{ color: isSimulating ? '#f43f5e' : accent }}>
            <span ref={coordRef}>X 0000  Y 0000  GRID A-1</span>
            <span className="flex items-center gap-1"><Navigation size={10} /> N 45°</span>
            <span className="opacity-60">ZOOM {(BASE_W / vb.w).toFixed(1)}×</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 flex shrink-0 flex-col gap-3 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest sm:text-xs" style={{ color: isSimulating ? '#f43f5e' : accent }}>
            <MapIcon className="h-4 w-4" />
            {isSimulating ? 'Simulasi Pertempuran Sedang Berlangsung...' : 'Pilih Target & Modifikasi Strategi Sebelum Memulai'}
          </div>

          {(ownTotal > 0 || enemyTotal > 0) && (
            <div className="flex min-w-[220px] max-w-[340px] flex-1 items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-emerald-300">{formatUnitQuantity(ownTotal)}</span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-rose-900/70">
                <div className="h-full rounded-full bg-emerald-400/90 transition-all duration-700" style={{ width: `${ownPct}%` }} />
              </div>
              <span className="font-mono text-[10px] font-bold text-rose-300">{formatUnitQuantity(enemyTotal)}</span>
              <span className="ml-1 font-mono text-[9px] font-bold text-gray-400">{ownPct}%</span>
            </div>
          )}
        </div>

        {battleLogs.length > 0 && (
          <div
            ref={logRef}
            className="max-h-[88px] overflow-y-auto rounded-lg border bg-black/50 px-2.5 py-1.5 font-mono text-[9px] leading-relaxed backdrop-blur-sm"
            style={{ borderColor: `${accent}4D` }}
            aria-live="polite"
          >
            {battleLogs.map((log, i) => (
              <div key={i} style={{ color: i === battleLogs.length - 1 ? accent : '#94a3b8' }}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}