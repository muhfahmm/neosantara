'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Anchor, Building2, Compass, Crosshair, Info as InfoIcon, Loader2, Map as MapIcon, Maximize2,
  Mountain, Navigation, Radio, Shield, Ship, Swords, Target, Trees, Waves, X, Zap, ZoomIn, ZoomOut,
} from 'lucide-react';
import UnitMarker from './units/unitMarker';
import {
  formatUnitQuantity,
  getWarUnitComposition,
  type WarUnit,
} from './units/warUnitComposition';
import {
  Airbase, Defs, Extruded, MAP_CSS, MilitaryFacilities, PALETTES, Peak, Smoke,
  blobPath, makeCity, makeForest, rng, smoothPath,
  type TerrainType,
} from './TacticalMap';
import {
  attachMapSnapshot,
  flushViewportPreview,
  loadRustViewport,
  panViewport,
  scheduleViewportPreview,
  zoomViewport,
} from './warMapViewport';

export type { TerrainType };

interface SeaWarMapProps {
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

/* ───────────────────────── KONSTANTA PETA ───────────────────────── */
const MAP_W = 8800;
const MAP_H = 4800;
const MAP_AR = MAP_W / MAP_H;
const GRID = 200;
const MIN_ZOOM_W = MAP_W / 8;
const OBJ = { x: 4400, y: 2400 };
// Area gambar diperluas supaya zoom-out / layar sempit tidak menampilkan ruang kosong.
const EX = { x: -400, y: -2400, w: 9600, h: 9600 };

const ACCENT = '#22d3ee';
const ACCENT_RGB = '34, 211, 238';
const ENEMY = '#fb7185';
const BG = '#041522';

type SimPhase = 'idle' | 'clash' | 'done';
interface View { x: number; y: number; w: number; h: number }

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function cellLabel(col: number, row: number) {
  const letter = col < 26 ? String.fromCharCode(65 + col) : `A${String.fromCharCode(65 + col - 26)}`;
  return `${letter}-${row + 1}`;
}

/** Lebar view maksimum: tinggi view dibatasi 2× tinggi peta, lebar tidak melebihi peta. */
const maxViewW = (ar: number) => Math.min(MAP_W, MAP_H * 2 * ar);

function fitView(ar: number): View {
  const w = maxViewW(ar);
  const h = w / ar;
  return { x: (MAP_W - w) / 2, y: (MAP_H - h) / 2, w, h };
}

function clampView(v: View, ar: number): View {
  const w = clamp(v.w, MIN_ZOOM_W, maxViewW(ar));
  const h = w / ar;
  const x = clamp(v.x, 0, MAP_W - w);
  const y = h >= MAP_H ? (MAP_H - h) / 2 : clamp(v.y, 0, MAP_H - h);
  return { x, y, w, h };
}

function readDeploymentConfig(): Record<string, unknown> {
  try {
    const stored = window.localStorage.getItem('deployed_units_config');
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    return parsed !== null && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch (error) {
    console.error('Gagal membaca konfigurasi pengerahan unit.', error);
    return {};
  }
}

/* ═════════════════════════ GEOMETRI PANTAI & LAUT ═════════════════════════ */
const TOP_COAST: number[][] = [[-400, 1720], [0, 1720], [700, 1640], [1300, 1790], [1900, 1740], [2900, 1700], [3880, 1780], [4900, 1900], [5900, 1760], [6900, 1650], [8000, 1740], [8800, 1720], [9200, 1720]];
const BOT_COAST: number[][] = [[-400, 3050], [0, 3050], [650, 3020], [1500, 3120], [2740, 3030], [3800, 2900], [4850, 3000], [5900, 3130], [6940, 3030], [8000, 2950], [8800, 3040], [9200, 3040]];
const BOT_REV = [...BOT_COAST].reverse();
const WATER_PATH = `${smoothPath(TOP_COAST)} L ${BOT_REV[0][0]},${BOT_REV[0][1]} ${smoothPath(BOT_REV).replace(/^M[^C]*/, '')} Z`;

function lerpY(pts: number[][], x: number) {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const t = (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0] || 1);
      return pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1]);
    }
  }
  return pts[pts.length - 1][1];
}
const topY = (x: number) => lerpY(TOP_COAST, x);
const botY = (x: number) => lerpY(BOT_COAST, x);
/** true bila titik berada di laut atau terlalu dekat pantai. */
const inBand = (x: number, y: number, pad: number) => y > topY(x) - pad && y < botY(x) + pad;

/* ── Pangkalan di darat ── */
const PORT_OWN = { x: 2600, y: topY(2600) };
const PORT_ENEMY = { x: 6600, y: botY(6600) };
const AIRBASE_OWN = { x: 1550, y: 1170 };
const AIRBASE_ENEMY = { x: 7250, y: 3530 };

const ROADS: number[][][] = [
  [[1000, 980], [1250, 1080], [1550, 1170]],
  [[1550, 1170], [2000, 1420], [2400, 1560], [2600, PORT_OWN.y - 30]],
  [[7800, 3850], [7500, 3700], [7250, 3530]],
  [[7250, 3530], [6900, 3320], [6600, PORT_ENEMY.y + 40]],
];
function distToPoly(pts: number[][], x: number, y: number) {
  let m = 1e9;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const dx = bx - ax;
    const dy = by - ay;
    const t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    m = Math.min(m, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
  }
  return m;
}
const nearRoad = (x: number, y: number) => Math.min(...ROADS.map((r) => distToPoly(r, x, y)));

const KEEP = [
  { ...AIRBASE_OWN, r: 680 }, { ...AIRBASE_ENEMY, r: 680 },
  { x: PORT_OWN.x, y: PORT_OWN.y - 120, r: 330 }, { x: PORT_ENEMY.x, y: PORT_ENEMY.y + 120, r: 330 },
  { x: 1000, y: 950, r: 380 }, { x: 7800, y: 3850, r: 380 },
];
const blocked = (x: number, y: number, pad: number) =>
  inBand(x, y, 140 + pad) || nearRoad(x, y) < 50 + pad || KEEP.some((k) => Math.hypot(k.x - x, k.y - y) < k.r + pad);

function scatter(count: number, seed: number, x0: number, x1: number, y0: number, y1: number, pad: number, gap: number, check = true) {
  const r = rng(seed);
  const out: { x: number; y: number }[] = [];
  let tries = 0;
  while (out.length < count && tries < count * 60) {
    tries++;
    const x = x0 + r() * (x1 - x0);
    const y = y0 + r() * (y1 - y0);
    if (check && blocked(x, y, pad)) continue;
    if (out.some((o) => Math.hypot(o.x - x, o.y - y) < gap)) continue;
    out.push({ x, y });
  }
  return out;
}

/* ── Tanah: bercak rumput & tanah ── */
function makePatches(n: number, seed: number, y0: number, y1: number, rmin: number, rmax: number) {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const cx = -400 + r() * 9600;
    const cy = y0 + r() * (y1 - y0);
    const rx = rmin + r() * (rmax - rmin);
    const ry = rx * (0.4 + r() * 0.3);
    return { ci: i % 3, d: blobPath(cx, cy, rx, ry, seed * 100 + i, 12), d2: blobPath(cx + rx * 0.05, cy, rx * 0.58, ry * 0.55, seed * 100 + i + 500, 10) };
  });
}
const GRASS_PATCHES = [
  ...makePatches(30, 11, 0, 1700, 300, 600), ...makePatches(14, 12, -2400, 0, 300, 600),
  ...makePatches(30, 13, 3050, 4800, 300, 600), ...makePatches(14, 14, 4800, 7200, 300, 600),
];
const SOIL_PATCHES = [
  ...makePatches(16, 21, 0, 1700, 220, 440), ...makePatches(8, 22, -2400, 0, 220, 440),
  ...makePatches(16, 23, 3050, 4800, 220, 440), ...makePatches(8, 24, 4800, 7200, 220, 440),
];

/* ── Batuan ── */
type Rock = { pts: string; hi: string; x: number; y: number; rx: number; ry: number; ci: number };
function makeRock(cx: number, cy: number, r: number, rg: () => number): Rock {
  const n = 7;
  const a0 = rg() * Math.PI * 2;
  const P = Array.from({ length: n }, (_, i) => {
    const a = a0 + (i / n) * Math.PI * 2;
    const k = 0.7 + rg() * 0.45;
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k * 0.78];
  });
  const H = P.map((q) => [cx + (q[0] - cx) * 0.62 - r * 0.12, cy + (q[1] - cy) * 0.55 - r * 0.16]);
  const f = (p: number[][]) => p.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
  return { pts: f(P), hi: f(H), x: cx, y: cy, rx: r * 1.1, ry: r * 0.42, ci: Math.floor(rg() * 2) };
}
const ROCKS: Rock[] = (() => {
  const rg = rng(909);
  const spots = [
    ...scatter(24, 9, 0, 8800, 0, 1650, 60, 260),
    ...scatter(24, 10, 0, 8800, 3150, 4800, 60, 260),
    ...scatter(8, 11, 0, 8800, -2300, -60, 0, 260, false),
    ...scatter(8, 12, 0, 8800, 4860, 7000, 0, 260, false),
  ];
  return spots.flatMap((s) => Array.from({ length: 1 + Math.floor(rg() * 3) }, () => makeRock(s.x + (rg() - 0.5) * 120, s.y + (rg() - 0.5) * 64, 12 + rg() * 26, rg)));
})();

/* ── Hutan ── */
type ForestDef = { cx: number; cy: number; rx: number; ry: number; n: number; seed: number };
const FOREST_DEFS: ForestDef[] = [
  { cx: 3400, cy: 1150, rx: 400, ry: 170, n: 40, seed: 7 },
  { cx: 5000, cy: 1120, rx: 400, ry: 190, n: 38, seed: 21 },
  { cx: 6500, cy: 1050, rx: 420, ry: 200, n: 40, seed: 42 },
  { cx: 2400, cy: 650, rx: 360, ry: 170, n: 28, seed: 55 },
  { cx: 7700, cy: 1200, rx: 330, ry: 170, n: 28, seed: 63 },
  { cx: 2200, cy: 3750, rx: 420, ry: 200, n: 40, seed: 77 },
  { cx: 4200, cy: 3850, rx: 420, ry: 200, n: 42, seed: 88 },
  { cx: 5600, cy: 3650, rx: 380, ry: 190, n: 35, seed: 99 },
  { cx: 3300, cy: 3950, rx: 380, ry: 180, n: 33, seed: 66 },
  { cx: 1200, cy: 3600, rx: 330, ry: 170, n: 28, seed: 101 },
];
const FORESTS = FOREST_DEFS.map(makeForest).map((f) => ({ ...f, trees: f.trees.filter((t) => !blocked(t.x, t.y, 10)) }));
const EXT_FORESTS = [
  ...scatter(8, 31, 400, 8400, -2100, -300, 0, 700, false),
  ...scatter(8, 32, 400, 8400, 5000, 6800, 0, 700, false),
].map((p, i) => makeForest({ cx: p.x, cy: p.y, rx: 300 + (i % 3) * 50, ry: 150 + (i % 2) * 30, n: 18, seed: 600 + i }));

/* ── Gunung ── */
const PEAKS: [number, number, number, number][] = ([
  [400, 600, 300, 220], [1900, 420, 340, 250], [3300, 380, 360, 270], [4300, 560, 330, 260],
  [5200, 430, 360, 290], [6300, 520, 340, 270], [7500, 430, 350, 260], [8500, 600, 300, 220],
  [700, 4500, 340, 260], [1900, 4400, 360, 270], [3100, 4560, 360, 280], [4300, 4420, 350, 270],
  [5400, 4560, 360, 280], [6400, 4650, 340, 260], [7600, 4560, 330, 250],
] as [number, number, number, number][]).sort((a, b) => a[1] - b[1]);
const EXT_PEAKS: [number, number, number, number][] = [
  ...scatter(9, 41, 200, 8600, -2000, -120, 0, 520, false).map((p, i) => [p.x, p.y, 300 + (i % 3) * 40, 220 + (i % 4) * 25] as [number, number, number, number]),
  ...scatter(9, 42, 200, 8600, 4900, 6900, 0, 520, false).map((p, i) => [p.x, p.y, 300 + (i % 3) * 40, 220 + (i % 4) * 25] as [number, number, number, number]),
].sort((a, b) => a[1] - b[1]);

/* ── Medan sekunder: rawa, pantai berpasir, kawah ── */
const SWAMPS = [
  { cx: 4400, cy: 1600, rx: 300, ry: 90, seed: 201 },
  { cx: 6000, cy: 1540, rx: 280, ry: 90, seed: 202 },
  { cx: 800, cy: 1560, rx: 260, ry: 80, seed: 203 },
  { cx: 2300, cy: 3300, rx: 300, ry: 90, seed: 204 },
  { cx: 4000, cy: 3180, rx: 300, ry: 90, seed: 205 },
  { cx: 7500, cy: 3200, rx: 260, ry: 80, seed: 206 },
].map((s) => {
  const r = rng(s.seed);
  return {
    ...s,
    blob: blobPath(s.cx, s.cy, s.rx, s.ry, s.seed, 12),
    pools: Array.from({ length: 4 }, () => ({ x: s.cx + (r() - 0.5) * s.rx * 1.3, y: s.cy + (r() - 0.5) * s.ry * 1.2, rx: 24 + r() * 44, ry: 10 + r() * 18 })),
    reeds: Array.from({ length: 12 }, () => ({ x: s.cx + (r() - 0.5) * s.rx * 1.5, y: s.cy + (r() - 0.5) * s.ry * 1.4 })),
  };
});
const SANDS = [
  { cx: 3200, cy: 1600, rx: 300, ry: 70, seed: 211 },
  { cx: 5300, cy: 1700, rx: 260, ry: 70, seed: 212 },
  { cx: 7000, cy: 1520, rx: 280, ry: 70, seed: 213 },
  { cx: 1800, cy: 3220, rx: 300, ry: 70, seed: 214 },
  { cx: 5300, cy: 3160, rx: 260, ry: 70, seed: 215 },
  { cx: 8100, cy: 3150, rx: 240, ry: 70, seed: 216 },
].map((s) => ({ ...s, blob: blobPath(s.cx, s.cy, s.rx, s.ry, s.seed, 12) }));
const CRATER_FIELDS = [
  { cx: 3900, cy: 1350, r: 110, n: 5, seed: 301 },
  { cx: 5100, cy: 3480, r: 120, n: 5, seed: 302 },
  { cx: 6000, cy: 650, r: 110, n: 5, seed: 303 },
].map((f) => {
  const r = rng(f.seed);
  return { ...f, craters: Array.from({ length: f.n }, () => ({ x: f.cx + (r() - 0.5) * f.r * 2, y: f.cy + (r() - 0.5) * f.r * 1.3, r: 18 + r() * 26 })) };
});

/* ── Kota ── */
const cityBlock = (x: number, y: number) => inBand(x + 35, y + 30, 120) || nearRoad(x + 35, y + 30) < 48;
const DISTRICT_DEFS = [
  { x0: 2950, y0: 1320, x1: 3420, y1: 1540, seed: 5, label: 'KOTA PELABUHAN' },
  { x0: 5780, y0: 3230, x1: 6260, y1: 3450, seed: 6, label: 'KOTA PELABUHAN' },
  { x0: 4600, y0: 1250, x1: 4960, y1: 1440, seed: 7, label: 'KOTA UTARA' },
  { x0: 3000, y0: 3330, x1: 3400, y1: 3530, seed: 8, label: 'KOTA SELATAN' },
];
const DISTRICTS = DISTRICT_DEFS.map((d) => ({ ...d, buildings: makeCity(d.x0, d.y0, d.x1, d.y1, d.seed, 110, cityBlock) }));

/* ── Pulau ── */
const ISLAND_DEFS = [
  { cx: 3050, cy: 2300, rx: 270, ry: 150, seed: 601, trees: 10, peak: true },
  { cx: 5800, cy: 2580, rx: 310, ry: 160, seed: 602, trees: 11, peak: true },
  { cx: 4040, cy: 2690, rx: 130, ry: 70, seed: 603, trees: 3, peak: false },
  { cx: 4880, cy: 2070, rx: 130, ry: 70, seed: 604, trees: 3, peak: false },
];
const ISLANDS = ISLAND_DEFS.map((d) => ({
  ...d,
  shore: blobPath(d.cx, d.cy, d.rx * 1.3, d.ry * 1.35, d.seed, 14),
  land: blobPath(d.cx, d.cy, d.rx, d.ry, d.seed + 1, 14),
  hill: blobPath(d.cx, d.cy, d.rx * 0.55, d.ry * 0.5, d.seed + 2, 10),
  forest: makeForest({ cx: d.cx + d.rx * 0.15, cy: d.cy + d.ry * 0.1, rx: d.rx * 0.62, ry: d.ry * 0.5, n: d.trees, seed: d.seed + 3 }),
}));

/* ═════════════════════════ INFO TOOLTIP ═════════════════════════ */
type InfoId =
  | 'deep' | 'shoal' | 'island' | 'coast' | 'objective'
  | 'forest' | 'highland' | 'urban' | 'swamp' | 'sand' | 'crater'
  | 'portOwn' | 'portEnemy' | 'airbaseOwn' | 'airbaseEnemy' | 'fleetOwn' | 'fleetEnemy';
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

/* ═════════════════════════ ELEMEN PETA ═════════════════════════ */
type Palette = (typeof PALETTES)[TerrainType];
type Tree = { x: number; y: number; r: number; ci: number };

function renderTrees(trees: Tree[], P: Palette, isSnow: boolean) {
  return trees.map((t) => {
    const c = P.tree[t.ci % P.tree.length];
    return isSnow ? (
      <polygon
        key={`${t.x}-${t.y}`}
        points={`${t.x},${t.y - t.r * 1.7} ${t.x - t.r * 0.85},${t.y + t.r * 0.7} ${t.x + t.r * 0.85},${t.y + t.r * 0.7}`}
        fill={c}
      />
    ) : (
      <circle key={`${t.x}-${t.y}`} cx={t.x} cy={t.y} r={t.r} fill={c} />
    );
  });
}

/** Pelabuhan: s = 1 bila daratan di atas laut (pantai utara), s = -1 bila daratan di bawah laut. */
const Port = ({ x, y, s, color, name, id }: { x: number; y: number; s: 1 | -1; color: string; name: string; id: InfoId }) => {
  const boxes = ['#b45309', '#1d4ed8', '#15803d', '#b91c1c', '#475569'];
  return (
    <g className="nw-tz" data-terrain={id} transform={`translate(${x} ${y})`}>
      <g transform={`scale(1 ${s})`}>
        <rect x={-330} y={-260} width={660} height={280} rx={22} fill="#0b1220" fillOpacity=".5" stroke={color} strokeOpacity=".5" strokeWidth="3" strokeDasharray="18 10" />
        <rect x={-300} y={-30} width={600} height={50} rx={6} fill="#2a2f38" stroke="#000" strokeOpacity=".5" strokeWidth="2" />
        {[-220, -70, 80, 230].map((px) => (
          <g key={px}>
            <rect x={px} y={10} width={36} height={190} rx={4} fill="#3a414d" stroke={color} strokeOpacity=".7" strokeWidth="2.4" />
            <line x1={px + 18} y1={26} x2={px + 18} y2={190} stroke="#e5e7eb" strokeOpacity=".5" strokeWidth="2.4" strokeDasharray="10 12" />
            <path d={`M${px},0V-90M${px + 36},0V-90M${px - 6},-90H${px + 84}M${px + 30},-90L${px + 80},-124`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={-300 + i * 42} y={-84 - (i % 2) * 20} width={34} height={16} fill={boxes[i % 5]} opacity=".85" stroke="#000" strokeOpacity=".4" strokeWidth="1.2" />
        ))}
        <rect x={-300} y={-236} width={170} height={64} rx={4} fill="#475569" stroke={color} strokeOpacity=".7" strokeWidth="2.4" />
        <rect x={40} y={-236} width={230} height={64} rx={4} fill="#475569" stroke={color} strokeOpacity=".7" strokeWidth="2.4" />
        <path d="M-290,-216H-140M-290,-196H-140M50,-216H260M50,-196H260" stroke="#0b1220" strokeOpacity=".4" strokeWidth="3" />
        <circle className="nw-flicker" cx={-300} cy={-30} r={4} fill="#ef4444" />
        <circle className="nw-flicker" cx={300} cy={-30} r={4} fill="#ef4444" />
      </g>
      <text x={0} y={s * -285} textAnchor="middle" fontSize="30" fontWeight="900" letterSpacing="3" fill={color} stroke="#000" strokeWidth="5" paintOrder="stroke" fontFamily="monospace">{name}</text>
    </g>
  );
};

/* ── Lapisan medan dasar (tanah, rumput, batu, rawa, pasir, jalan, kawah) ── */
const GroundLayer = memo(function GroundLayer({ terrainType }: { terrainType: TerrainType }) {
  const P = PALETTES[terrainType];
  const isDesert = terrainType === 'desert';
  const sandDunes = (s: { cx: number; cy: number; rx: number; ry: number }) =>
    [-0.5, -0.15, 0.2, 0.5].map((k, j) => (
      <path key={j} d={`M${s.cx - s.rx * 0.5},${s.cy + s.ry * k * 1.2} q ${s.rx * 0.25},-18 ${s.rx * 0.5},0 t ${s.rx * 0.5},0`} fill="none" stroke="#a8875a" strokeOpacity="0.45" strokeWidth="2.4" />
    ));
  return (
    <g>
      <g data-terrain="coast">
        <rect x={EX.x} y={EX.y} width={EX.w} height={EX.h} fill={P.ground} />
        <g className="battle-scenery-detail">
          {SOIL_PATCHES.map((p, i) => (
            <g key={`so${i}`}>
              <path d={p.d} fill={P.soil[p.ci]} opacity="0.55" />
              <path d={p.d2} fill={P.soil[(p.ci + 1) % 3]} opacity="0.4" />
            </g>
          ))}
          {GRASS_PATCHES.map((p, i) => (
            <g key={`gr${i}`}>
              <path d={p.d} fill={P.grass[p.ci]} opacity="0.55" />
              <path d={p.d2} fill={P.grass[(p.ci + 2) % 3]} opacity="0.45" />
            </g>
          ))}
          <rect x={EX.x} y={EX.y} width={EX.w} height={EX.h} fill="url(#tm-speck)" />
          <rect x={EX.x} y={EX.y} width={EX.w} height={EX.h} fill="url(#tm-pebbles)" />
          <rect x={EX.x} y={EX.y} width={EX.w} height={EX.h} fill="url(#tm-tufts)" />
          {ROCKS.map((k, i) => (
            <g key={`rk${i}`} pointerEvents="none">
              <ellipse cx={k.x + k.rx * 0.2} cy={k.y + k.ry * 1.7} rx={k.rx} ry={k.ry} fill="#000" opacity="0.28" />
              <polygon points={k.pts} fill={P.rock[k.ci]} stroke="#000" strokeOpacity="0.35" strokeWidth="1.2" strokeLinejoin="round" />
              <polygon points={k.hi} fill={P.rock[2]} opacity="0.65" />
            </g>
          ))}
        </g>
      </g>

      <g className="battle-scenery-detail">
        <ellipse cx="5000" cy="520" rx="2200" ry="340" fill="url(#tm-foot)" pointerEvents="none" />
        <ellipse cx="4200" cy="4450" rx="2600" ry="300" fill="url(#tm-foot)" opacity="0.7" pointerEvents="none" />

        {SANDS.map((s, i) => (
          <g key={`sd${i}`} className="nw-tz tm-tz" data-terrain="sand">
            <path d={s.blob} fill="#d9bf8c" opacity="0.6" stroke="#f3e2b8" strokeOpacity="0.4" strokeWidth="2" />
            {sandDunes(s)}
          </g>
        ))}

        {SWAMPS.map((s, i) => (
          <g key={`sw${i}`} className="nw-tz tm-tz" data-terrain="swamp">
            <path d={s.blob} fill="#2c4a36" opacity="0.85" stroke="#6b8f5b" strokeOpacity="0.5" strokeWidth="2.4" />
            {s.pools.map((p, j) => <ellipse key={j} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill="#3f7d7a" opacity="0.6" stroke="#9bd0c8" strokeOpacity="0.35" strokeWidth="1.5" />)}
            {s.reeds.map((p, j) => <path key={j} d={`M${p.x},${p.y} v-20 M${p.x - 5},${p.y} v-14 M${p.x + 5},${p.y} v-15`} stroke="#b7c58f" strokeOpacity="0.7" strokeWidth="2.4" strokeLinecap="round" />)}
          </g>
        ))}

      {isDesert && (
        <g pointerEvents="none">
          <ellipse cx="2600" cy="420" rx="380" ry="100" fill="#a07a52" opacity="0.35" /><ellipse cx="2600" cy="420" rx="340" ry="70" fill="#c9a878" opacity="0.5" />
          <ellipse cx="6700" cy="3700" rx="330" ry="90" fill="#a07a52" opacity="0.35" /><ellipse cx="6700" cy="3700" rx="290" ry="62" fill="#c9a878" opacity="0.5" />
        </g>
      )}

        {CRATER_FIELDS.map((f, i) => (
          <g key={`cr${i}`} className="nw-tz tm-tz" data-terrain="crater">
            <ellipse cx={f.cx} cy={f.cy} rx={f.r * 1.4} ry={f.r * 0.95} fill="#000" opacity="0.14" stroke="#f59e0b" strokeOpacity="0.25" strokeWidth="2.4" strokeDasharray="10 12" />
            {f.craters.map((c, j) => (
              <g key={j}>
                <ellipse cx={c.x + 4} cy={c.y + 5} rx={c.r * 1.1} ry={c.r * 0.8} fill="#000" opacity="0.3" />
                <ellipse cx={c.x} cy={c.y} rx={c.r} ry={c.r * 0.72} fill="#0b0f14" opacity="0.8" />
                <ellipse cx={c.x - 2} cy={c.y - 2} rx={c.r} ry={c.r * 0.72} fill="none" stroke="#a89884" strokeOpacity="0.55" strokeWidth="3" />
              </g>
            ))}
          </g>
        ))}
      </g>
    </g>
  );
});

/* ── Lapisan laut (air dan pulau) ── */
const SeaLayer = memo(function SeaLayer({ terrainType }: { terrainType: TerrainType }) {
  const P = PALETTES[terrainType];
  const isSnow = terrainType === 'snow';
  const showForest = terrainType !== 'desert' && terrainType !== 'urban';
  return (
    <g>
      <g data-terrain="deep">
        <path d={WATER_PATH} fill="url(#sw-water)" />
      </g>

      {ISLANDS.map((isl) => (
        <g key={isl.seed} className="nw-tz tm-tz" data-terrain="island">
          <path d={isl.shore} fill="#7dd3fc" fillOpacity=".28" />
          <path d={isl.land} fill="#d9bf8c" />
          <path d={isl.land} fill={P.grass[1]} opacity=".8" transform={`translate(${isl.cx} ${isl.cy}) scale(.86) translate(${-isl.cx} ${-isl.cy})`} />
          <path d={isl.hill} fill={P.soil[0]} opacity=".7" />
          {showForest && (
            <g>
              <path d={isl.forest.blob} fill={P.under} opacity=".7" />
              {renderTrees(isl.forest.trees, P, isSnow)}
            </g>
          )}
          {isl.peak && <Peak x={isl.cx - isl.rx * 0.1} by={isl.cy + isl.ry * 0.2} w={isl.rx * 0.9} h={isl.ry * 1.5} seed={isl.seed} accent={ACCENT} snowDepth={isSnow ? 0.45 : 0.18} />}
        </g>
      ))}

    </g>
  );
});

/* ── Lapisan fitur darat di atas laut (hutan, gunung, kota, pangkalan) ── */
const LandFeatures = memo(function LandFeatures({ terrainType }: { terrainType: TerrainType }) {
  const P = PALETTES[terrainType];
  const isUrban = terrainType === 'urban';
  const isSnow = terrainType === 'snow';
  const showForest = terrainType !== 'desert' && !isUrban;
  const forests = showForest ? [...FORESTS, ...EXT_FORESTS] : [];
  return (
    <g>
      {forests.map((f, fi) => (
        <g key={`fo${fi}`} className="nw-tz tm-tz" data-terrain="forest">
          <path d={f.blob} fill={P.under} opacity="0.85" />
          {renderTrees(f.trees, P, isSnow)}
        </g>
      ))}

      <g className="nw-tz tm-tz" data-terrain="highland">
        {EXT_PEAKS.map(([x, by, w, h], i) => <Peak key={`xk${i}`} x={x} by={by} w={w} h={h} seed={800 + i} accent={ACCENT} snowDepth={isSnow ? 0.45 : h > 250 ? 0.22 : 0.14} />)}
        {PEAKS.map(([x, by, w, h], i) => <Peak key={i} x={x} by={by} w={w} h={h} seed={31 + i} accent={ACCENT} snowDepth={isSnow ? 0.45 : h > 250 ? 0.22 : 0.14} />)}
      </g>

      {DISTRICTS.map((d, di) => (
        <g key={`dist${di}`} className="nw-tz tm-tz battle-scenery-detail" data-terrain="urban">
          <rect x={d.x0 - 30} y={d.y0 - 30} width={d.x1 - d.x0 + 80} height={d.y1 - d.y0 + 60} rx="40" fill="#111827" opacity="0.5" />
          {d.buildings.map((b, i) => <Extruded key={i} x={b[0]} y={b[1]} w={b[2]} d={b[3]} h={b[4]} roof={P.roof[i % 3]} stroke={ACCENT} win i={i + di} />)}
        </g>
      ))}

      <Port id="portOwn" x={PORT_OWN.x} y={PORT_OWN.y} s={1} color={ACCENT} name="PELABUHAN ANDA" />
      <Port id="portEnemy" x={PORT_ENEMY.x} y={PORT_ENEMY.y} s={-1} color={ENEMY} name="PELABUHAN MUSUH" />
      <Airbase id="airbaseOwn" at={AIRBASE_OWN} color={ACCENT} name="PANGKALAN UDARA ANDA" />
      <Airbase id="airbaseEnemy" at={AIRBASE_ENEMY} color={ENEMY} name="PANGKALAN UDARA MUSUH" />
      <MilitaryFacilities at={{ x: 850, y: 680 }} color={ACCENT} scale={0.9} />
      <MilitaryFacilities at={{ x: 8350, y: 3100 }} color={ENEMY} scale={0.9} />

      <g className="battle-scenery-detail" pointerEvents="none" fontFamily="monospace" fontWeight="900" textAnchor="middle" fill="#f8fafc" stroke="#020617" strokeWidth="10" paintOrder="stroke" strokeLinejoin="round" opacity="0.92" letterSpacing="14" fontSize="60">
        <text x="4900" y="250">PEGUNUNGAN</text>
        <text x="4200" y="4750">PEGUNUNGAN</text>
        {showForest && <text x="5000" y="1000">HUTAN</text>}
        {showForest && <text x="4200" y="3680">HUTAN</text>}
        {SWAMPS.slice(0, 2).map((s, i) => <text key={i} x={s.cx} y={s.cy + s.ry + 56} fontSize="44" letterSpacing="10">RAWA</text>)}
        {DISTRICTS.slice(0, 2).map((d) => <text key={d.seed} x={(d.x0 + d.x1) / 2 + 20} y={d.y0 - 50} fontSize="38" letterSpacing="8">{d.label}</text>)}
      </g>
    </g>
  );
});

/* ── Atmosfer ── */
const EffectsLayer = memo(function EffectsLayer() {
  return (
    <g className="battle-scenery-detail" pointerEvents="none">
      <Smoke x={PORT_OWN.x + 190} y={PORT_OWN.y - 190} n={3} />
      <Smoke x={PORT_ENEMY.x + 190} y={PORT_ENEMY.y + 190} n={3} />
      {[[1200, 700, 620, 170, 0], [4400, 1300, 700, 190, -35], [7000, 3900, 640, 160, -60], [3000, 4000, 700, 180, -20]].map(([x, y, rx, ry, delay], i) => (
        <ellipse key={i} className="tm-cloud" cx={x} cy={y} rx={rx} ry={ry} fill="url(#tm-cloud)" style={{ animationDelay: `${delay}s` }} />
      ))}
      <rect x={EX.x} y={EX.y} width={EX.w} height={EX.h} fill="url(#nw-sun)" opacity="0.35" />
      <rect x={EX.x} y={EX.y} width={EX.w} height={EX.h} fill="url(#nw-vignette)" />
    </g>
  );
});

/* ═════════════════════════ PENEMPATAN UNIT ═════════════════════════ */
type Placed = { unit: WarUnit; x: number; y: number };

function placeGroup(units: WarUnit[], group: WarUnit['group'], east: boolean): Placed[] {
  const dir = east ? -1 : 1;
  const cx = east ? 7100 : 1700;
  const list = units.filter((u) => u.group === group);
  if (group === 'laut') {
    return list.map((unit, i) => ({ unit, x: cx + dir * (i % 5) * 145, y: 2350 + Math.floor(i / 5) * 100 }));
  }
  if (group === 'udara') {
    const airbase = east ? AIRBASE_ENEMY : AIRBASE_OWN;
    return list.map((unit, i) => {
      const row = Math.floor(i / 4);
      const column = i % 4;
      const rowCount = Math.min(4, list.length - row * 4);
      return {
        unit,
        x: airbase.x + dir * (column - (rowCount - 1) / 2) * 190,
        y: airbase.y - 155 + row * 85,
      };
    });
  }
  return list.map((unit, i) => ({
    unit,
    x: (east ? 7900 : 900) + dir * (i % 3) * 105,
    y: (east ? 3750 : 850) + Math.floor(i / 3) * 90,
  }));
}

const UNIT_GROUPS: WarUnit['group'][] = ['laut', 'udara', 'darat'];
type UnitPosition = { x: number; y: number };
type UnitMovePath = { id: string; start: UnitPosition; target: UnitPosition };

const fleetUnitId = (unit: WarUnit, side: 'own' | 'enemy', index: number) =>
  `${side}:${unit.group}:${unit.kind}:${unit.echelon ?? 'base'}:${index}`;

const Fleet = memo(function Fleet({
  units, east, color, side, dataId, positions, selectedUnitId, movingUnitIds, onSelectUnit,
}: {
  units: WarUnit[];
  east: boolean;
  color: string;
  side: 'own' | 'enemy';
  dataId: InfoId;
  positions: Record<string, UnitPosition>;
  selectedUnitId: string | null;
  movingUnitIds: string[];
  onSelectUnit: (id: string) => void;
}) {
  const placedGroups = useMemo(
    () => UNIT_GROUPS.map((group) => ({ group, units: placeGroup(units, group, east) })),
    [units, east],
  );
  return (
    <g data-terrain={dataId}>
      {placedGroups.map(({ group, units: placedUnits }) => {
        return (
          <g key={group}>
            {placedUnits.map(({ unit, x, y }, i) => {
              const id = fleetUnitId(unit, side, i);
              const position = positions[id] ?? { x, y };
              const selected = side === 'own' && selectedUnitId === id;
              const moving = movingUnitIds.includes(id);
              return (
                <g
                  key={id}
                  data-unit-id={side === 'own' ? id : undefined}
                  role={side === 'own' ? 'button' : undefined}
                  aria-label={side === 'own' ? `Pilih ${unit.label} ${formatUnitQuantity(unit.quantity)}` : undefined}
                  aria-pressed={side === 'own' ? selected : undefined}
                  tabIndex={side === 'own' ? 0 : undefined}
                  style={side === 'own' ? { cursor: selected ? 'crosshair' : 'grab' } : undefined}
                  onPointerDown={side === 'own' ? (event) => {
                    event.stopPropagation();
                  } : undefined}
                  onClick={side === 'own' ? (event) => {
                    event.stopPropagation();
                    onSelectUnit(id);
                  } : undefined}
                  onKeyDown={side === 'own' ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectUnit(id);
                    }
                  } : undefined}
                >
                  {(selected || moving) && (
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={27}
                      fill={color}
                      fillOpacity={selected ? 0.2 : 0.12}
                      stroke={color}
                      strokeWidth={3}
                      strokeDasharray={moving ? '7 5' : undefined}
                    />
                  )}
                  <UnitMarker
                    x={position.x} y={position.y} kind={unit.kind} color={color} quantity={unit.quantity}
                    label={`${unit.label} ${formatUnitQuantity(unit.quantity)}`}
                    disableEffects
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
});

const NW_CSS = `
.map-navigating,.map-navigating *{animation-play-state:paused!important}
.battle-active .battle-scenery-detail{display:none!important}
.nw-a{transform-box:fill-box;transform-origin:center}
.nw-ping{animation:nw-ping 2.2s ease-out infinite}
.nw-pulse{animation:nw-pulse 1.2s ease-in-out infinite}
.nw-smoke{animation:nw-smoke 6s ease-out infinite;opacity:0}
.nw-drift{animation:nw-drift 30s ease-in-out infinite alternate;will-change:transform}
.nw-flicker{animation:nw-flicker 3s ease-in-out infinite}
.nw-tz{cursor:crosshair}
@keyframes nw-ping{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.4);opacity:0}}
@keyframes nw-pulse{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes nw-smoke{0%{transform:translate(0,0) scale(.5);opacity:0}15%{opacity:.5}100%{transform:translate(70px,-250px) scale(2.6);opacity:0}}
@keyframes nw-drift{from{transform:translateX(-140px)}to{transform:translateX(180px)}}
@keyframes nw-flicker{0%,100%{opacity:.85}50%{opacity:.55}}
@media (prefers-reduced-motion:reduce){.nw-ping,.nw-pulse,.nw-smoke,.nw-drift,.nw-flicker{animation:none!important}}
`;

/* ═════════════════════════ KOMPONEN UTAMA ═════════════════════════ */
export default function SeaWarMap({
  attackerName,
  targetName,
  onAutoResult,
  onClose,
  terrainType = 'default',
  attackerDetail,
  targetDetail,
  isUserDefender = false,
  isCoalitionForce = false,
}: SeaWarMapProps) {
  const deploymentConfig = useMemo(
    () => (typeof window === 'undefined' ? {} : readDeploymentConfig()),
    [],
  );
  const attackerUnits = useMemo(
    () => getWarUnitComposition(attackerDetail, deploymentConfig, !isUserDefender && !isCoalitionForce),
    [attackerDetail, deploymentConfig, isUserDefender, isCoalitionForce],
  );
  const defenderUnits = useMemo(
    () => getWarUnitComposition(targetDetail, deploymentConfig, isUserDefender),
    [targetDetail, deploymentConfig, isUserDefender],
  );

  // Pasukan Anda selalu di barat (kiri, cyan), musuh di timur (kanan, merah) — apa pun perannya
  const ownUnits = isUserDefender ? defenderUnits : attackerUnits;
  const enemyUnits = isUserDefender ? attackerUnits : defenderUnits;
  const ownName = isUserDefender ? targetName : attackerName;
  const enemyName = isUserDefender ? attackerName : targetName;
  const ownTotal = useMemo(() => ownUnits.reduce((s, u) => s + (u.quantity || 0), 0), [ownUnits]);
  const enemyTotal = useMemo(() => enemyUnits.reduce((s, u) => s + (u.quantity || 0), 0), [enemyUnits]);
  const ownPlacedUnits = useMemo(
    () => UNIT_GROUPS.flatMap((group) =>
      placeGroup(ownUnits, group, false).map((placed, index) => ({
        ...placed,
        id: fleetUnitId(placed.unit, 'own', index),
      }))
    ),
    [ownUnits],
  );
  const [unitPositions, setUnitPositions] = useState<Record<string, UnitPosition>>({});
  const unitPositionsRef = useRef(unitPositions);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [movingUnitIds, setMovingUnitIds] = useState<string[]>([]);
  const [movePaths, setMovePaths] = useState<UnitMovePath[]>([]);
  const movementFramesRef = useRef<Record<string, number>>({});

  /* ─── Simulasi & log ─── */
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPhase, setSimPhase] = useState<SimPhase>('idle');
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const timerIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battleLogs]);

  useEffect(() => () => {
    timerIdsRef.current.forEach(clearTimeout);
    timerIdsRef.current = [];
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    timerIdsRef.current.push(setTimeout(fn, ms));
  };
  const addLog = (msg: string) => {
    setBattleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString('id-ID', { hour12: false })}] ${msg}`]);
  };

  const handleStartSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    const timestamp = `[${new Date().toLocaleTimeString('id-ID', { hour12: false })}] `;
    setBattleLogs([
      `${timestamp}Kontak radar! Armada musuh memasuki jangkauan rudal anti-kapal.`,
      `${timestamp}Salvo rudal diluncurkan, kapal perusak melakukan manuver menghindar.`,
    ]);
    setSimPhase('clash');

    schedule(() => {
      setSimPhase('done');
      addLog('Pertempuran laut mereda. Menghitung kerugian unit dan hasil operasi...');
      schedule(() => onAutoResult(), 2000);
    }, 3000);
  };

  /* ─── Zoom / pan / tooltip ─── */
  const mapRef = useRef<HTMLDivElement>(null);
  const viewportSvgRef = useRef<SVGSVGElement>(null);
  const arRef = useRef(MAP_AR);
  const [vb, setVb] = useState<View>(() => fitView(MAP_AR));
  const viewRef = useRef(vb);
  const pendingViewRef = useRef<View | null>(null);
  const viewFrameRef = useRef<number | null>(null);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rustViewportRef = useRef<Awaited<ReturnType<typeof loadRustViewport>> | undefined>(undefined);
  const hoverCellRef = useRef<string | null>(null);
  const [selCell, setSelCell] = useState<string | null>(null);
  const dragRef = useRef<{ sx: number; sy: number; vbX: number; vbY: number; vbW: number; moved: boolean } | null>(null);
  const [hovered, setHovered] = useState<InfoId | null>(null);
  const lastId = useRef<InfoId>('objective');
  const tipRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => () => {
    Object.values(movementFramesRef.current).forEach(cancelAnimationFrame);
  }, []);

  useEffect(() => {
    if (simPhase === 'idle') return;
    Object.values(movementFramesRef.current).forEach(cancelAnimationFrame);
    movementFramesRef.current = {};
  }, [simPhase]);

  const handleSelectUnit = (id: string) => {
    if (isSimulating || simPhase !== 'idle') return;
    setSelectedUnitId((current) => current === id ? null : id);
  };

  const handleMovementClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedUnitId || isSimulating || simPhase !== 'idle') return;
    const svg = event.currentTarget;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const destination = point.matrixTransform(matrix.inverse());
    const placedUnit = ownPlacedUnits.find((placed) => placed.id === selectedUnitId);
    if (!placedUnit) return;
    const group = placedUnit.unit.group;
    const move = (engine: Awaited<ReturnType<typeof loadRustViewport>>) => {
      const start = unitPositionsRef.current[selectedUnitId] ?? { x: placedUnit.x, y: placedUnit.y };
      const [targetX, targetY, speed] = engine.prepare_unit_movement(
        destination.x,
        destination.y,
        MAP_W,
        MAP_H,
        group,
      );
      const target = { x: targetX, y: targetY };
      const currentFrame = movementFramesRef.current[selectedUnitId];
      if (currentFrame !== undefined) cancelAnimationFrame(currentFrame);
      setMovingUnitIds((current) => current.includes(selectedUnitId) ? current : [...current, selectedUnitId]);
      setMovePaths((current) => [
        ...current.filter((path) => path.id !== selectedUnitId),
        { id: selectedUnitId, start, target },
      ]);

      let elapsedMs = 0;
      let lastFrame = performance.now();
      const animate = (now: number) => {
        const deltaMs = Math.min(now - lastFrame, 64);
        lastFrame = now;
        const [x, y, nextElapsed, done] = engine.step_unit_movement(
        start.x,
        start.y,
        target.x,
        target.y,
        elapsedMs,
        deltaMs,
        speed,
        group,
      );
        elapsedMs = nextElapsed;
        const nextPosition = { x, y };
        unitPositionsRef.current = { ...unitPositionsRef.current, [selectedUnitId]: nextPosition };
        setUnitPositions(unitPositionsRef.current);

        if (done >= 0.5) {
          delete movementFramesRef.current[selectedUnitId];
          setMovingUnitIds((current) => current.filter((id) => id !== selectedUnitId));
          setMovePaths((current) => current.filter((path) => path.id !== selectedUnitId));
        } else {
          movementFramesRef.current[selectedUnitId] = requestAnimationFrame(animate);
        }
      };
      movementFramesRef.current[selectedUnitId] = requestAnimationFrame(animate);
    };

    const engine = rustViewportRef.current;
    if (engine) {
      move(engine);
      return;
    }
    void loadRustViewport()
      .then((loadedEngine) => {
        rustViewportRef.current = loadedEngine;
        move(loadedEngine);
      })
      .catch((error: unknown) => {
        console.error('[SeaWarMap] Failed to load Rust unit movement engine', error);
      });
  };

  const commitView = useCallback(() => {
    if (commitTimerRef.current !== null) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
    const nextView = flushViewportPreview(
      viewportSvgRef, viewRef, pendingViewRef, viewFrameRef,
    );
    if (nextView) setVb(nextView);
  }, []);

  const scheduleView = useCallback((nextView: View, commitAfterIdle = true) => {
    scheduleViewportPreview(
      nextView, viewportSvgRef, viewRef, pendingViewRef, viewFrameRef, commitAfterIdle,
    );
    if (!commitAfterIdle) return;
    if (commitTimerRef.current !== null) clearTimeout(commitTimerRef.current);
    commitTimerRef.current = setTimeout(commitView, 350);
  }, [commitView]);

  const snapshotRef = useRef<ReturnType<typeof attachMapSnapshot> | null>(null);
  useEffect(() => {
    const svg = viewportSvgRef.current;
    if (!svg) return;
    const snapshot = attachMapSnapshot(svg, { x: 0, y: -MAP_H / 2, w: MAP_W, h: MAP_H * 2 });
    snapshotRef.current = snapshot;
    snapshot.refresh(800);
    return () => { snapshot.dispose(); snapshotRef.current = null; };
  }, []);
  useEffect(() => {
    snapshotRef.current?.refresh(1200);
  }, [terrainType, simPhase, ownUnits, enemyUnits]);

  useEffect(() => {
    let mounted = true;
    const activeFrameRef = viewFrameRef;
    void loadRustViewport()
      .then((module) => { if (mounted) rustViewportRef.current = module; })
      .catch((error: unknown) => console.error('Gagal memuat kalkulasi viewport Rust; menggunakan kalkulasi cadangan.', error));
    return () => {
      mounted = false;
      if (activeFrameRef.current !== null) cancelAnimationFrame(activeFrameRef.current);
      if (commitTimerRef.current !== null) clearTimeout(commitTimerRef.current);
    };
  }, []);

  const INFO: Record<InfoId, Info> = useMemo(() => ({
    deep:     { icon: Waves,      name: 'Laut Dalam',       tag: 'Perairan terbuka', desc: 'Kedalaman cukup untuk semua kapal besar dan kapal selam.', stats: [{ k: 'Manuver', v: 'Bebas', tone: 'good' }, { k: 'Kapal selam', v: 'Aktif', tone: 'good' }] },
    shoal:    { icon: Waves,      name: 'Perairan Dangkal', tag: 'Dekat pantai',     desc: 'Dasar laut dangkal membatasi kapal bertonase besar dan kapal selam.', stats: [{ k: 'Kapal besar', v: 'Terbatas', tone: 'bad' }, { k: 'Kapal patroli', v: '+10%', tone: 'good' }] },
    island:   { icon: Mountain,   name: 'Pulau Karang',     tag: 'Posisi bertahan',  desc: 'Pulau berhutan tempat radar dan baterai rudal pantai dapat ditempatkan.', stats: [{ k: 'Radar', v: '+20% jangkauan', tone: 'good' }, { k: 'Rudal pantai', v: 'Aktif', tone: 'good' }] },
    coast:    { icon: Mountain,   name: 'Daratan',          tag: 'Pesisir',          desc: 'Daratan terbuka di luar koridor laut. Tempat pangkalan dan pasukan darat.', stats: [{ k: 'Unit laut', v: 'Tidak bisa', tone: 'bad' }] },
    forest:   { icon: Trees,      name: 'Hutan Lebat',      tag: 'Penyamaran',       desc: 'Kanopi rapat melindungi pasukan darat dari pengamatan udara.', stats: [{ k: 'Pertahanan', v: '+15%', tone: 'good' }, { k: 'Visibilitas', v: '-20%', tone: 'bad' }] },
    highland: { icon: Mountain,   name: 'Dataran Tinggi',   tag: 'Posisi bertahan',  desc: 'Lereng curam menguntungkan pihak yang menguasai puncak dan menjadi pos radar pantai.', stats: [{ k: 'Pertahanan', v: '+25%', tone: 'good' }, { k: 'Kecepatan', v: '-50%', tone: 'bad' }] },
    urban:    { icon: Building2,  name: 'Kota Pelabuhan',   tag: 'Medan kota',       desc: 'Gedung memecah formasi dan memaksa pertempuran jarak dekat.', stats: [{ k: 'Mode tempur', v: 'CQC', tone: 'neutral' }] },
    swamp:    { icon: Waves,      name: 'Rawa Pesisir',     tag: 'Medan lambat',     desc: 'Tanah berlumpur menahan kendaraan berat.', stats: [{ k: 'Kecepatan', v: '-40%', tone: 'bad' }] },
    sand:     { icon: Mountain,   name: 'Pantai Berpasir',  tag: 'Medan lambat',     desc: 'Pasir lepas menyulitkan pendaratan kendaraan.', stats: [{ k: 'Kecepatan', v: '-30%', tone: 'bad' }] },
    crater:   { icon: Crosshair,  name: 'Kawah Ledakan',    tag: 'Medan rusak',      desc: 'Bekas pemboman. Permukaan tidak rata memperlambat unit darat.', stats: [{ k: 'Kecepatan', v: '-20%', tone: 'bad' }, { k: 'Pertahanan', v: '+10%', tone: 'good' }] },
    objective:{ icon: Target,     name: 'Objektif Maritim', tag: 'Titik utama',      desc: 'Kuasai perairan ini untuk memenangkan operasi laut.', stats: [{ k: 'Prioritas', v: 'Utama', tone: 'neutral' }] },
    portOwn:  { icon: Anchor,     name: 'Pelabuhan Anda',   tag: 'Basis laut',       desc: 'Dermaga tempat armada berlabuh, mengisi bahan bakar, dan diperbaiki.', stats: [{ k: 'Logistik', v: 'Aktif', tone: 'good' }, { k: 'Perbaikan', v: 'Tersedia', tone: 'good' }] },
    portEnemy:{ icon: Anchor,     name: 'Pelabuhan Musuh',  tag: 'Basis laut',       desc: 'Dermaga armada lawan. Menghancurkannya memutus suplai mereka.', stats: [{ k: 'Logistik', v: 'Musuh', tone: 'bad' }, { k: 'Prioritas', v: 'Tinggi', tone: 'neutral' }] },
    airbaseOwn:   { icon: Navigation, name: 'Pangkalan Udara Anda',  tag: 'Basis udara', desc: 'Landasan pacu untuk patroli maritim dan dukungan udara armada.', stats: [{ k: 'Dukungan udara', v: 'Aktif', tone: 'good' }, { k: 'Sortie', v: 'Cepat', tone: 'good' }] },
    airbaseEnemy: { icon: Navigation, name: 'Pangkalan Udara Musuh', tag: 'Basis udara', desc: 'Landasan pacu lawan. Menghancurkannya melemahkan perlindungan udara armada mereka.', stats: [{ k: 'Dukungan udara', v: 'Musuh', tone: 'bad' }, { k: 'Prioritas', v: 'Tinggi', tone: 'neutral' }] },
    fleetOwn:   { icon: Swords, name: ownName,   tag: isUserDefender ? 'Armada Anda (bertahan)' : 'Armada Anda (menyerang)', desc: 'Kapal, pesawat, dan pasukan pendukung milik Anda.', stats: [{ k: 'Total unit', v: formatUnitQuantity(ownTotal), tone: 'good' }] },
    fleetEnemy: { icon: Shield, name: enemyName, tag: isUserDefender ? 'Armada musuh (menyerang)' : 'Armada musuh (bertahan)', desc: 'Kekuatan lawan yang harus dikalahkan.', stats: [{ k: 'Total unit', v: formatUnitQuantity(enemyTotal), tone: 'bad' }] },
  }), [ownName, enemyName, isUserDefender, ownTotal, enemyTotal]);

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
      scheduleView(isFirst ? fitView(ar) : clampView({ ...current, h: current.w / ar }, ar), false);
      commitView();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [commitView, scheduleView]);

  const zoomAt = useCallback((clientX: number, clientY: number, factor: number) => {
    const el = mapRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const ar = box.width / box.height;
    const nextView = zoomViewport(viewRef.current, {
      boxWidth: box.width,
      boxHeight: box.height,
      minWidth: MIN_ZOOM_W,
      maxWidth: maxViewW(ar),
      worldWidth: MAP_W,
      worldHeight: MAP_H,
    }, clientX - box.left, clientY - box.top, factor, rustViewportRef.current);
    scheduleView(clampView(nextView, ar));
  }, [scheduleView]);

  const zoomCenter = useCallback((factor: number) => {
    const el = mapRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    zoomAt(box.left + box.width / 2, box.top + box.height / 2, factor);
  }, [zoomAt]);

  const resetZoom = useCallback(() => scheduleView(fitView(arRef.current)), [scheduleView]);

  // Listener native (passive: false) agar preventDefault benar-benar mencegah scroll halaman
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
    const scale = box.width / current.w;
    const gx = clamp(Math.floor(current.x + (clientX - box.left) / scale), 0, MAP_W - 1);
    const gy = clamp(Math.floor(current.y + (clientY - box.top) / scale), 0, MAP_H - 1);
    const col = Math.floor(gx / GRID);
    const row = Math.floor(gy / GRID);
    const key = `${col},${row}`;
    hoverCellRef.current = key;
    if (coordRef.current) {
      coordRef.current.textContent = `X ${String(gx).padStart(4, '0')}  Y ${String(gy).padStart(4, '0')}  GRID ${cellLabel(col, row)}`;
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSimulating || selectedUnitId || e.button !== 0) return;
    if (e.target instanceof Element && e.target.closest('button')) return;
    commitView();
    e.currentTarget.setPointerCapture(e.pointerId);
    const current = viewRef.current;
    dragRef.current = { sx: e.clientX, sy: e.clientY, vbX: current.x, vbY: current.y, vbW: current.w, moved: false };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSimulating) return;
    const box = e.currentTarget.getBoundingClientRect();
    const drag = dragRef.current;

    if (drag) {
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if (!drag.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) drag.moved = true;
      if (drag.moved) {
        const ar = box.width / box.height;
        const nextView = panViewport(
          { x: drag.vbX, y: drag.vbY, w: drag.vbW, h: drag.vbW / ar },
          {
            boxWidth: box.width,
            boxHeight: box.height,
            minWidth: MIN_ZOOM_W,
            maxWidth: maxViewW(ar),
            worldWidth: MAP_W,
            worldHeight: MAP_H,
          },
          dx,
          dy,
          rustViewportRef.current,
        );
        scheduleView(clampView(nextView, ar), false);
        return;
      }
    }

    updateHud(e.clientX, e.clientY, box);
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    const id = (e.target as Element).closest?.('[data-terrain]')?.getAttribute('data-terrain') as InfoId | null | undefined;
    setHovered(id && id in INFO ? id : null);
    const tip = tipRef.current;
    if (tip) {
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      let x = px + 18;
      let y = py + 18;
      if (x + w > box.width - 8) x = px - w - 18;
      if (y + h > box.height - 8) y = py - h - 18;
      tip.style.transform = `translate3d(${Math.max(8, x)}px, ${Math.max(8, y)}px, 0)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (dragRef.current && !dragRef.current.moved) setSelCell(hoverCellRef.current);
    dragRef.current = null;
    commitView();
  };

  const handlePointerLeave = () => {
    setHovered(null);
    if (!dragRef.current) hoverCellRef.current = null;
  };

  const activeSelectedUnitId = simPhase === 'idle' ? selectedUnitId : null;
  const activeMovingUnitIds = simPhase === 'idle' ? movingUnitIds : [];

  return (
    <div className="fixed inset-0 z-[300] flex select-none flex-col justify-between overflow-hidden p-4 font-sans text-white sm:p-6" style={{ backgroundColor: BG }}>
      <style dangerouslySetInnerHTML={{ __html: NW_CSS }} />

      {/* HEADER */}
      <div className="relative z-30 flex shrink-0 items-center justify-between border-b pb-3" style={{ borderColor: `${ACCENT}4D` }}>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border p-2.5" style={{ backgroundColor: `${ACCENT}15`, borderColor: `${ACCENT}66`, color: ACCENT, boxShadow: `0 0 20px rgba(${ACCENT_RGB}, 0.2)` }}>
            <Ship className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-black uppercase leading-none tracking-widest sm:text-lg" style={{ color: ACCENT }}>Naval Command Center</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-300 sm:text-xs">
              Operasi Tempur Laut: {attackerName} <span className="mx-1 text-rose-500">VS</span> {targetName}
              <span className="ml-2 rounded border bg-black/40 px-2 py-0.5 text-[9px]" style={{ borderColor: `${ACCENT}80`, color: ACCENT }}>Koridor Maritim</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onAutoResult} disabled={isSimulating}
            className={`hidden sm:flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-all ${isSimulating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'}`}>
            <Crosshair className="h-4 w-4" /> Hasil Otomatis
          </button>

          <button onClick={handleStartSimulation} disabled={isSimulating}
            className={`group flex transform items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${isSimulating ? 'opacity-70 cursor-wait' : 'cursor-pointer hover:scale-105'}`}
            style={{ backgroundColor: isSimulating ? '#f43f5e' : ACCENT, color: '#050B0B', boxShadow: `0 0 20px rgba(${isSimulating ? '244, 63, 94' : ACCENT_RGB}, 0.4)` }}>
            {isSimulating
              ? <><Loader2 className="h-4 w-4 animate-spin" /> <span className="hidden sm:inline">Menyimulasikan...</span></>
              : <><Zap className="h-4 w-4 fill-current transition-transform group-hover:rotate-12" /> <span className="hidden sm:inline">Mulai Simulasi</span></>}
          </button>

          <button onClick={() => setShowInfo(!showInfo)} aria-label="Legenda"
            className={`rounded-xl border p-2.5 transition-colors focus-visible:outline focus-visible:outline-2 ${showInfo ? 'bg-white/10' : 'hover:bg-white/10'}`}
            style={{ borderColor: `${ACCENT}4D`, color: ACCENT }}>
            <InfoIcon className="h-5 w-5" />
          </button>

          {onClose && (
            <button onClick={onClose} disabled={isSimulating} aria-label="Tutup"
              className={`rounded-xl border p-2.5 transition-colors focus-visible:outline focus-visible:outline-2 ${isSimulating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'}`}
              style={{ borderColor: `${ACCENT}4D`, color: ACCENT }}>
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* LEGENDA */}
      {showInfo && (
        <div className="absolute right-4 top-[70px] z-50 max-h-[calc(100vh-110px)] w-[270px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border bg-black/90 p-4 shadow-2xl backdrop-blur-xl sm:right-6 sm:top-[80px]" style={{ borderColor: `${ACCENT}80` }}>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider" style={{ color: ACCENT }}><Shield className="h-4 w-4" /> Legenda & Intel</h3>
          <div className="space-y-3 text-[10px] font-bold text-gray-300">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-cyan-300/40 bg-[#082f49]" /> Laut dalam (manuver bebas)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#1b7a96]" /> Perairan dangkal (kapal besar terbatas)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#d9bf8c]" /> Pantai berpasir (-30% Speed)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#2c4a36] border border-emerald-300/30" /> Rawa pesisir (-40% Speed)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-black border border-amber-400/50" /> Kawah (-20% Speed)</div>
            <div className="my-1 h-px bg-white/10" />
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-emerald-400/40 bg-emerald-800" /> Hutan Lebat (+15% Def)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 border border-slate-400/40 bg-gradient-to-b from-slate-400 to-slate-800" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} /> Dataran Tinggi (+25% Def)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#486f3c]" /> Rerumputan (medan terbuka)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#6b5a3c]" /> Tanah (medan terbuka)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 bg-[#7b8494]" style={{ clipPath: 'polygon(20% 0, 80% 10%, 100% 60%, 70% 100%, 10% 90%, 0 40%)' }} /> Bebatuan (dekorasi medan)</div>
            <div className="flex items-center gap-2"><Building2 className="h-3 w-3 text-slate-300" /> Kota pelabuhan</div>
            <div className="my-1 h-px bg-white/10" />
            <div className="flex items-center gap-2"><Target className="h-3 w-3 text-amber-200" /> Objektif maritim</div>
            <div className="flex items-center gap-2"><Anchor className="h-3 w-3 text-cyan-300" /> Pelabuhan</div>
            <div className="flex items-center gap-2"><Navigation className="h-3 w-3 text-cyan-300" /> Pangkalan udara</div>
            <div className="my-1 h-px bg-white/10" />
            <div className="flex items-center gap-2"><span className="h-3 w-4 rounded-sm border" style={{ borderColor: ACCENT }} /> Armada & base Anda (kiri / barat)</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rotate-45 border border-rose-500" /> Armada & base musuh (kanan / timur)</div>
            <div className="my-1 h-px bg-white/10" />
            <div className="text-[9px] leading-relaxed text-gray-400">
              <span className="font-black" style={{ color: ACCENT }}>Kontrol peta:</span> scroll = zoom, drag = geser, klik = tandai sel koordinat, double-click = reset, tombol +/− untuk zoom bertahap.
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
            background: '#041522',
            borderColor: isSimulating ? '#f43f5e' : `${ACCENT}4D`,
            touchAction: 'none',
            overscrollBehavior: 'contain',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={() => { dragRef.current = null; commitView(); }}
          onPointerLeave={handlePointerLeave}
          onDoubleClick={resetZoom}
        >
            <svg
              ref={viewportSvgRef}
              className={`absolute inset-0 h-full w-full${isSimulating ? ' battle-active' : ''}`}
              viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Peta operasi tempur laut"
              onClick={handleMovementClick}
            >
            <style>{MAP_CSS}</style>
            <Defs accent={ACCENT} terrainType={terrainType} />
            <defs>
              <linearGradient id="sw-water" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#0b4665" />
                <stop offset="0.5" stopColor="#082f49" />
                <stop offset="1" stopColor="#041c31" />
              </linearGradient>
            </defs>

            {/* URUTAN: tanah → laut → fitur darat → objektif → unit → atmosfer */}
            <GroundLayer terrainType={terrainType} />
            <SeaLayer terrainType={terrainType} />
            <LandFeatures terrainType={terrainType} />

            {/* OBJEKTIF */}
            <g data-terrain="objective">
              <text x={OBJ.x} y={OBJ.y - 110} textAnchor="middle" fill="#fff7cc" fontSize="38" fontWeight="900" fontFamily="monospace" stroke="#000" strokeWidth="6" paintOrder="stroke">OBJEKTIF MARITIM</text>
            </g>

            <g pointerEvents="none" fontFamily="monospace" fontWeight="900" fontSize="46" letterSpacing="8" textAnchor="middle" stroke="#000" strokeWidth="8" paintOrder="stroke">
              <text x="1700" y="2160" fill={ACCENT}>ARMADA ANDA</text>
              <text x="7100" y="2160" fill="#fda4af">ARMADA MUSUH</text>
            </g>

            {simPhase === 'idle' && movePaths.map((movePath) => (
              <path
                key={movePath.id}
                d={`M ${movePath.start.x} ${movePath.start.y} L ${movePath.target.x} ${movePath.target.y}`}
                fill="none"
                stroke={ACCENT}
                strokeWidth="7"
                strokeDasharray="18 14"
                opacity="0.75"
                pointerEvents="none"
              />
            ))}
            <Fleet
              units={ownUnits}
              east={false}
              color={ACCENT}
              side="own"
              dataId="fleetOwn"
              positions={unitPositions}
              selectedUnitId={activeSelectedUnitId}
              movingUnitIds={activeMovingUnitIds}
              onSelectUnit={handleSelectUnit}
            />
            <Fleet
              units={enemyUnits}
              east
              color={ENEMY}
              side="enemy"
              dataId="fleetEnemy"
              positions={unitPositions}
              selectedUnitId={activeSelectedUnitId}
              movingUnitIds={activeMovingUnitIds}
              onSelectUnit={handleSelectUnit}
            />

            <EffectsLayer />

            </svg>

          <div className="pointer-events-none absolute bottom-14 left-6 z-20 rounded bg-black/70 px-2 py-1 font-mono text-[9px] font-bold tracking-wider" style={{ color: ACCENT }}>
            {activeSelectedUnitId ? 'KLIK POSISI TUJUAN PASUKAN' : 'PILIH PASUKAN, LALU KLIK TUJUAN'}
          </div>

          {/* KOMPAS */}
          <div className="pointer-events-none absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border bg-black/40" style={{ borderColor: `${ACCENT}4D`, color: ACCENT }}>
            <Compass className="h-5 w-5" />
            <span className="absolute top-0.5 text-[8px] font-black tracking-widest">N</span>
          </div>

          {/* KONTROL ZOOM */}
          <div className="absolute right-4 top-4 z-20 flex flex-col gap-1.5" onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
            {[
              { label: 'Zoom in', Icon: ZoomIn, fn: () => zoomCenter(1.5) },
              { label: 'Zoom out', Icon: ZoomOut, fn: () => zoomCenter(1 / 1.5) },
              { label: 'Reset zoom', Icon: Maximize2, fn: resetZoom },
            ].map(({ label, Icon, fn }) => (
              <button key={label} onClick={fn} disabled={isSimulating} aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-md border bg-black/50 transition-colors hover:bg-black/70 disabled:opacity-40"
                style={{ borderColor: `${ACCENT}4D`, color: ACCENT }}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <Corners c={isSimulating ? '#f43f5e' : ACCENT} />

          {/* TOOLTIP */}
          {!isSimulating && (
            <div ref={tipRef} aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-30 w-[230px] rounded-md border bg-black/80 transition-opacity duration-150"
              style={{ opacity: hovered ? 1 : 0, borderColor: `${ACCENT}80`, boxShadow: `0 0 18px rgba(${ACCENT_RGB}, 0.25), inset 0 0 20px rgba(${ACCENT_RGB}, 0.06)`, willChange: 'transform' }}>
              <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: `${ACCENT}40` }}>
                <TipIcon size={14} style={{ color: ACCENT }} />
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
          <div className="pointer-events-none absolute bottom-5 left-6 z-20 flex items-center gap-4 rounded bg-black/60 px-2 py-1 font-mono text-[9px]" style={{ color: isSimulating ? '#f43f5e' : ACCENT }}>
            <span ref={coordRef}>X 0000  Y 0000  GRID A-1</span>
            <span className="flex items-center gap-1"><Navigation size={10} /> N 45°</span>
            <span className="opacity-60">ZOOM {(MAP_W / vb.w).toFixed(1)}×</span>
            {selCell && (() => {
              const [c, r] = selCell.split(',').map(Number);
              return <span className="flex items-center gap-1 text-amber-200"><Radio size={10} /> TANDA {cellLabel(c, r)}</span>;
            })()}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 flex shrink-0 flex-col gap-3 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest sm:text-xs" style={{ color: isSimulating ? '#f43f5e' : ACCENT }}>
            <MapIcon className="h-4 w-4" />
            {isSimulating ? 'Simulasi Pertempuran Laut Sedang Berlangsung...' : 'Pelajari Medan & Atur Strategi Sebelum Memulai'}
          </div>

        </div>

        {battleLogs.length > 0 && (
          <div
            ref={logRef}
            className="max-h-[88px] overflow-y-auto rounded-lg border bg-black/50 px-2.5 py-1.5 font-mono text-[9px] leading-relaxed"
            style={{ borderColor: `${ACCENT}4D` }}
            aria-live="polite"
          >
            {battleLogs.map((log, i) => (
              <div key={i} style={{ color: i === battleLogs.length - 1 ? ACCENT : '#94a3b8' }}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}