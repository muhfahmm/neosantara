'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import UnitMarker from './units/unitMarker';
import { formatUnitQuantity, type WarUnit } from './units/warUnitComposition';
import type { FacilitySide, UnitFacility } from './UnitSelectionModal';
import { loadRustViewport, prepareUnitAttack } from './warMapViewport';
import type { UnitCommandMode } from './AttackControls';

/* ═════════════════════════ TIPE & KONSTANTA (dipakai juga oleh PageWar) ═════════════════════════ */
export type TerrainType = 'default' | 'desert' | 'snow' | 'jungle' | 'urban';
export type SimPhase = 'idle' | 'clash' | 'done';
export type PlayerSide = 'attacker' | 'defender';
export type ViewBox = { x: number; y: number; w: number; h: number };

export const BASE_W = 6400;
export const BASE_H = 2400;
export const MIN_VIEW_W = BASE_W;
export const MAX_VIEW_W = 900;
export const MAP_MIN_Y = 0;
export const MAP_MAX_Y = BASE_H;
const MAP_HEIGHT = MAP_MAX_Y - MAP_MIN_Y;
export const GRID_SIZE = 100;

const EX = { x: -1200, y: -1400, w: 8800, h: 5200 };

export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
export const getColName = (n: number) => {
  let s = '';
  while (n >= 0) { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; }
  return s;
};
export const cellLabel = (col: number, row: number) =>
  row >= 0 ? `${getColName(col)}-${row + 1}` : `${getColName(col)}-N${-row}`;

export const getMinViewW = (ar: number) => Math.max(MAX_VIEW_W, Math.min(BASE_W, BASE_H * 2 * ar));
export function clampView(v: ViewBox, ar: number): ViewBox {
  const w = clamp(v.w, MAX_VIEW_W, getMinViewW(ar));
  const h = w / ar;
  const x = clamp(v.x, 0, Math.max(0, BASE_W - w));
  const y = h >= MAP_HEIGHT
    ? (MAP_MIN_Y + MAP_MAX_Y - h) / 2
    : clamp(v.y, MAP_MIN_Y, MAP_MAX_Y - h);
  return { x, y, w, h };
}
export const fitView = (ar: number) => clampView({ x: 0, y: 0, w: BASE_W, h: BASE_W / ar }, ar);
export function viewScale(box: { width: number; height: number }, v: ViewBox) {
  const scale = Math.min(box.width / v.w, box.height / v.h);
  return { scale, ox: (box.width - v.w * scale) / 2, oy: (box.height - v.h * scale) / 2 };
}

export interface MapProps {
  accent: string;
  water: string;
  terrainType: TerrainType;
  simPhase: SimPhase;
  attackerUnits: WarUnit[];
  defenderUnits: WarUnit[];
  viewBox: ViewBox;
  svgRef?: React.Ref<SVGSVGElement>;
  playerSide?: PlayerSide;
  fogEnabled?: boolean;
  onFacilityClick?: (facility: UnitFacility, side: FacilitySide) => void;
  commandMode?: UnitCommandMode;
  onUnitSelectionChange?: (unit: WarUnit | null) => void;
  onAttackRadiusChange?: (radius: number | null) => void;
  onAttack?: (attacker: WarUnit, target: WarUnit | null, inRange: boolean) => void;
}

/* ═════════════════════════ PALET PER MEDAN ═════════════════════════ */
type C3 = [string, string, string];
interface Palette {
  ground: string; grass: C3; soil: C3; rock: C3; tuft: C3;
  mt: [string, string, string, string];
  tree: string[]; treeHi: string; under: string;
  bank: string; road: string; roadLine: string; foot: string; roof: C3;
}
export const PALETTES: Record<TerrainType, Palette> = {
  default: { ground: '#3a5a33', grass: ['#486f3c', '#3c6234', '#557f45'], soil: ['#6b5a3c', '#584a30', '#7d6a47'], rock: ['#7b8494', '#5d6574', '#9aa3b2'], tuft: ['#7fae56', '#5f8f42', '#9cc468'], mt: ['#94a3b8', '#475569', '#475569', '#0f172a'], tree: ['#064e3b', '#065f46', '#047857', '#166534', '#14532d', '#0f766e'], treeHi: '#6ee7b7', under: '#04261a', bank: '#6b7a5c', road: '#3a3a36', roadLine: '#d8d2c0', foot: '#0b1220', roof: ['#475569', '#64748b', '#52607a'] },
  desert:  { ground: '#b8995f', grass: ['#9a9650', '#8a8744', '#a8a460'], soil: ['#a47c4f', '#8f6c42', '#c4a070'], rock: ['#9c8a70', '#7d6c55', '#bba98c'], tuft: ['#a8a45a', '#8f8c48', '#c0bb70'], mt: ['#d6b384', '#a47c4f', '#a47c4f', '#4a3220'], tree: ['#6b7a3a', '#556b2f', '#7c8a44'], treeHi: '#d9f99d', under: '#3a2c14', bank: '#c9a878', road: '#5b4630', roadLine: '#e8d5a8', foot: '#3a2412', roof: ['#a8906a', '#8f7a58', '#b59d74'] },
  snow:    { ground: '#c9d6e3', grass: ['#aec3d2', '#9db5c6', '#bccfdc'], soil: ['#8a97a6', '#76828f', '#a2adba'], rock: ['#6b778a', '#4d586b', '#97a3b5'], tuft: ['#e6eef6', '#d3e0ec', '#f3f8fc'], mt: ['#e2e8f0', '#94a3b8', '#94a3b8', '#1e293b'], tree: ['#0f3d3a', '#134e4a', '#14532d', '#1e4d3a'], treeHi: '#e0f2fe', under: '#0b2a2e', bank: '#e0f2fe', road: '#475569', roadLine: '#e2e8f0', foot: '#0f1f3d', roof: ['#cbd5e1', '#94a3b8', '#e2e8f0'] },
  jungle:  { ground: '#1d4727', grass: ['#27622f', '#1d5326', '#327a38'], soil: ['#4a3a24', '#3a2e1c', '#5c4830'], rock: ['#5c685e', '#46514a', '#788579'], tuft: ['#3d9648', '#2f7d3a', '#54b45c'], mt: ['#6b8f71', '#2f5d3e', '#2f5d3e', '#06281a'], tree: ['#052e16', '#064e3b', '#065f46', '#14532d', '#166534'], treeHi: '#86efac', under: '#021a0e', bank: '#3f6212', road: '#3a2f1e', roadLine: '#a8a29e', foot: '#021a10', roof: ['#475569', '#3f4b5e', '#566073'] },
  urban:   { ground: '#464f5c', grass: ['#46633a', '#3b5530', '#557442'], soil: ['#5c5850', '#6c675d', '#4b4841'], rock: ['#8892a0', '#697280', '#a6aebb'], tuft: ['#6a8f4c', '#557a3c', '#80a45c'], mt: ['#a1a8b3', '#5b6472', '#5b6472', '#1f2937'], tree: ['#365314', '#3f6212', '#4d7c0f', '#166534'], treeHi: '#bef264', under: '#14301a', bank: '#6b7280', road: '#1f2937', roadLine: '#e5e7eb', foot: '#0b1019', roof: ['#64748b', '#475569', '#7b8798'] },
};

/* ═════════════════════════ GENERATOR PROSEDURAL ═════════════════════════ */
export function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function blobPath(cx: number, cy: number, rx: number, ry: number, seed: number, n = 14): string {
  const r = rng(seed);
  const p = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 0.75 + r() * 0.4;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  });
  const f = (v: number) => v.toFixed(1);
  let d = `M ${f(p[0][0])},${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    d += ` C ${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + ' Z';
}

export function smoothPath(pts: number[][]): string {
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/* ── Titik strategis ── */
export const HQ_OWN = { x: 700, y: 520 };
export const HQ_ENEMY = { x: 5700, y: 1880 };
const CAPTURE_POINTS = [
  { id: 'alpha', name: 'OBJ ALPHA', x: 3000, y: 1010, main: true },
  { id: 'bravo', name: 'BRAVO', x: 2700, y: 1060, main: false },
  { id: 'charlie', name: 'CHARLIE', x: 3300, y: 930, main: false },
];
export const AIRBASE_OWN = { x: 700, y: 1060 };
export const AIRBASE_ENEMY = { x: 5600, y: 2250 };
const RESOURCES = [
  { id: 'fuel', name: 'DEPO BBM', x: 1850, y: 1000 },
  { id: 'ammo', name: 'GUDANG AMUNISI', x: 4650, y: 1420 },
];

/* ── Danau ── */
const LAKES = [
  { cx: 1500, cy: 1750, rx: 700, ry: 240, seed: 401 },
  { cx: 5000, cy: 950, rx: 650, ry: 220, seed: 402 },
].map((l) => {
  const r = rng(l.seed + 7);
  const inside = (): number[] => {
    for (;;) {
      const x = r() * 2 - 1, y = r() * 2 - 1;
      if (x * x + y * y < 0.8) return [l.cx + x * l.rx, l.cy + y * l.ry];
    }
  };
  return {
    ...l,
    shore: blobPath(l.cx, l.cy, l.rx * 1.12, l.ry * 1.18, l.seed, 18),
    water: blobPath(l.cx, l.cy, l.rx, l.ry, l.seed + 1, 18),
    deep: blobPath(l.cx, l.cy, l.rx * 0.7, l.ry * 0.66, l.seed + 2, 14),
    ripples: Array.from({ length: 50 }, () => { const [x, y] = inside(); return { x, y, w: 15 + r() * 24, o: 0.16 + r() * 0.28 }; }),
    glints: Array.from({ length: 14 }, () => { const [x, y] = inside(); return { x, y, w: 11 + r() * 18, delay: -r() * 6, dur: 2.4 + r() * 3 }; }),
  };
});
const inLake = (x: number, y: number, pad: number) =>
  LAKES.some((l) => ((x - l.cx) / (l.rx + pad)) ** 2 + ((y - l.cy) / (l.ry + pad)) ** 2 < 1);

/* ── Jalan ── */
const ROAD_PTS = [[700, 520], [1100, 540], [1500, 610], [2000, 780], [2500, 930], [3000, 1010], [3300, 1200], [3550, 1420], [4000, 1530], [4400, 1530], [5100, 1800], [5700, 1880]];
const ROAD = smoothPath(ROAD_PTS);
function distToRoad(x: number, y: number) {
  let m = 1e9;
  for (let i = 1; i < ROAD_PTS.length; i++) {
    const [ax, ay] = ROAD_PTS[i - 1], [bx, by] = ROAD_PTS[i];
    const dx = bx - ax, dy = by - ay;
    const t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    m = Math.min(m, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
  }
  return m;
}

const KEEP = [
  { ...HQ_OWN, r: 430 }, { ...HQ_ENEMY, r: 430 },
  ...CAPTURE_POINTS.map((c) => ({ x: c.x, y: c.y, r: c.main ? 280 : 230 })),
  ...RESOURCES.map((c) => ({ x: c.x, y: c.y, r: 150 })),
  { ...AIRBASE_OWN, r: 560 }, { ...AIRBASE_ENEMY, r: 560 },
  // Koordinat Barak Militer Baru (Disesuaikan)
  { x: 1200, y: 180, r: 450 },  // User (Naik 100px)
  { x: 5150, y: 1350, r: 450 }, // Musuh (Hutan dipindah, base tetap)
];
const blocked = (x: number, y: number, pad: number) =>
  inLake(x, y, 120 + pad) || distToRoad(x, y) < 50 + pad || KEEP.some((k) => Math.hypot(k.x - x, k.y - y) < k.r + pad);

function scatter(count: number, seed: number, x0: number, x1: number, y0: number, y1: number, pad: number, gap: number, check = true) {
  const r = rng(seed);
  const out: { x: number; y: number }[] = [];
  let tries = 0;
  while (out.length < count && tries < count * 60) {
    tries++;
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
    if (check && blocked(x, y, pad)) continue;
    if (out.some((o) => Math.hypot(o.x - x, o.y - y) < gap)) continue;
    out.push({ x, y });
  }
  return out;
}

function makePatches(n: number, seed: number, y0: number, y1: number, rmin: number, rmax: number) {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const cx = -200 + r() * 6800, cy = y0 + r() * (y1 - y0);
    const rx = rmin + r() * (rmax - rmin), ry = rx * (0.4 + r() * 0.3);
    return { ci: i % 3, d: blobPath(cx, cy, rx, ry, seed * 100 + i, 12), d2: blobPath(cx + rx * 0.05, cy, rx * 0.58, ry * 0.55, seed * 100 + i + 500, 10) };
  });
}
const GRASS_PATCHES = [...makePatches(34, 11, 0, 2400, 300, 600), ...makePatches(24, 12, -1300, 0, 300, 600), ...makePatches(24, 13, 2400, 3700, 300, 600)];
const SOIL_PATCHES = [...makePatches(22, 21, 0, 2400, 220, 440), ...makePatches(12, 22, -1300, 0, 220, 440), ...makePatches(12, 23, 2400, 3700, 220, 440)];

type Rock = { pts: string; hi: string; x: number; y: number; rx: number; ry: number; ci: number };
function makeRock(cx: number, cy: number, r: number, rg: () => number): Rock {
  const n = 7, a0 = rg() * Math.PI * 2;
  const P = Array.from({ length: n }, (_, i) => {
    const a = a0 + (i / n) * Math.PI * 2, k = 0.7 + rg() * 0.45;
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k * 0.78];
  });
  const H = P.map((q) => [cx + (q[0] - cx) * 0.62 - r * 0.12, cy + (q[1] - cy) * 0.55 - r * 0.16]);
  const f = (p: number[][]) => p.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
  return { pts: f(P), hi: f(H), x: cx, y: cy, rx: r * 1.1, ry: r * 0.42, ci: Math.floor(rg() * 2) };
}
const ROCKS: Rock[] = (() => {
  const rg = rng(909);
  const spots = [
    ...scatter(40, 9, 0, 6400, 0, 2400, 60, 210),
    ...scatter(16, 10, 0, 6400, -1300, -60, 0, 210, false),
    ...scatter(16, 11, 0, 6400, 2460, 3700, 0, 210, false),
  ];
  return spots.flatMap((s) => Array.from({ length: 2 + Math.floor(rg() * 4) }, () => makeRock(s.x + (rg() - 0.5) * 120, s.y + (rg() - 0.5) * 64, 12 + rg() * 26, rg)));
})();

const TUFTS = (() => {
  const r = rng(23);
  return Array.from({ length: 46 }, () => ({ x: r() * 360, y: r() * 360, h: 9 + r() * 13, l: (r() - 0.5) * 8, ci: Math.floor(r() * 3), n: 2 + Math.floor(r() * 2) }));
})();
const PEBBLES = (() => {
  const r = rng(29);
  return Array.from({ length: 32 }, () => ({ x: r() * 260, y: r() * 260, rx: 2 + r() * 4.5, ry: 1.4 + r() * 2.6, light: r() > 0.5 }));
})();
const SPECKS = (() => {
  const r = rng(5);
  return Array.from({ length: 70 }, () => ({ x: r() * 240, y: r() * 240, r: 0.8 + r() * 1.6, light: r() > 0.45, o: 0.05 + r() * 0.09 }));
})();
const PARTICLES = (() => {
  const r = rng(17);
  return Array.from({ length: 70 }, () => ({ x: r() * BASE_W, y: r() * BASE_H, r: 3 + r() * 4.5, dur: 7 + r() * 8, delay: -r() * 14 }));
})();

type Tree = { x: number; y: number; r: number; ci: number };
export function makeForest(f: { cx: number; cy: number; rx: number; ry: number; n: number; seed: number }) {
  const r = rng(f.seed);
  const trees: Tree[] = [];
  while (trees.length < f.n) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    trees.push({ x: f.cx + Math.cos(a) * d * f.rx, y: f.cy + Math.sin(a) * d * f.ry, r: 20 + r() * 16, ci: Math.floor(r() * 10) });
  }
  trees.sort((a, b) => a.y - b.y);
  return { ...f, trees, blob: blobPath(f.cx, f.cy, f.rx * 1.08, f.ry * 1.12, f.seed + 1) };
}

// HUTAN DIPERBARUI: Hutan yang menutupi musuh dipindah ke KANAN DANAU.
const FORESTS = [
  { cx: 800, cy: 1800, rx: 380, ry: 220, n: 90, seed: 7 }, // Samping danau kiri
  { cx: 2700, cy: 1950, rx: 420, ry: 220, n: 85, seed: 21 },
  { cx: 4050, cy: 1850, rx: 450, ry: 250, n: 110, seed: 42 },
  { cx: 4000, cy: 300, rx: 360, ry: 200, n: 70, seed: 99 },
  { cx: 5900, cy: 950, rx: 380, ry: 240, n: 130, seed: 63 }, // DIPINDAH KE KANAN DANAU
  { cx: 250, cy: 1520, rx: 290, ry: 170, n: 55, seed: 77 },
  { cx: 1100, cy: 1900, rx: 320, ry: 180, n: 60, seed: 55 },
].map(makeForest);

const EXT_FORESTS = [
  ...scatter(8, 31, 300, 6100, -1150, -300, 0, 700, false),
  ...scatter(8, 32, 300, 6100, 2700, 3500, 0, 700, false),
].map((p, i) => makeForest({ cx: p.x, cy: p.y, rx: 300 + (i % 3) * 50, ry: 150 + (i % 2) * 30, n: 34, seed: 600 + i }));

const PEAKS: [number, number, number, number][] = ([
  [3300, 270, 300, 220], [2400, 330, 320, 240], [3950, 520, 300, 230],
  [4250, 640, 330, 250], [4600, 620, 360, 300], [4950, 560, 340, 280], [5300, 470, 320, 300], [5700, 380, 360, 320], [6100, 330, 340, 280],
  [500, 2330, 340, 260], [1000, 2360, 360, 280], [1550, 2300, 380, 280], [2050, 2340, 340, 260],
  [2750, 2250, 360, 260], [3500, 2330, 380, 290], [4300, 2350, 360, 280],
] as [number, number, number, number][]).sort((a, b) => a[1] - b[1]);
const EXT_PEAKS: [number, number, number, number][] = [
  ...scatter(9, 41, 200, 6200, -1000, -120, 0, 520, false).map((p, i) => [p.x, p.y, 300 + (i % 3) * 40, 220 + (i % 4) * 25] as [number, number, number, number]),
  ...scatter(9, 42, 200, 6200, 2520, 3500, 0, 520, false).map((p, i) => [p.x, p.y, 300 + (i % 3) * 40, 220 + (i % 4) * 25] as [number, number, number, number]),
].sort((a, b) => a[1] - b[1]);

const SWAMPS = [
  { cx: 950, cy: 1450, rx: 280, ry: 90, seed: 201 },
  { cx: 3850, cy: 880, rx: 300, ry: 90, seed: 202 },
  { cx: 2900, cy: 1620, rx: 300, ry: 90, seed: 203 },
].map((s) => {
  const r = rng(s.seed);
  return {
    ...s,
    blob: blobPath(s.cx, s.cy, s.rx, s.ry, s.seed, 12),
    pools: Array.from({ length: 7 }, () => ({ x: s.cx + (r() - 0.5) * s.rx * 1.3, y: s.cy + (r() - 0.5) * s.ry * 1.2, rx: 24 + r() * 44, ry: 10 + r() * 18 })),
    reeds: Array.from({ length: 30 }, () => ({ x: s.cx + (r() - 0.5) * s.rx * 1.5, y: s.cy + (r() - 0.5) * s.ry * 1.4 })),
  };
});
const SANDS = [
  { cx: 3300, cy: 470, rx: 300, ry: 100, seed: 211 },
  { cx: 200, cy: 300, rx: 200, ry: 80, seed: 212 },
  { cx: 4900, cy: 1380, rx: 240, ry: 80, seed: 213 },
].map((s) => ({ ...s, blob: blobPath(s.cx, s.cy, s.rx, s.ry, s.seed, 12) }));
const CRATER_FIELDS = [
  { cx: 2550, cy: 760, r: 110, n: 9, seed: 301 },
  { cx: 3450, cy: 800, r: 120, n: 9, seed: 302 },
  { cx: 3000, cy: 700, r: 110, n: 8, seed: 303 },
].map((f) => {
  const r = rng(f.seed);
  return { ...f, craters: Array.from({ length: f.n }, () => ({ x: f.cx + (r() - 0.5) * f.r * 2, y: f.cy + (r() - 0.5) * f.r * 1.3, r: 18 + r() * 26 })) };
});

type Bld = [number, number, number, number, number];
export function makeCity(x0: number, y0: number, x1: number, y1: number, seed: number, step: number, skip?: (x: number, y: number) => boolean): Bld[] {
  const r = rng(seed);
  const out: Bld[] = [];
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  for (let y = y0; y < y1; y += step * 0.85) {
    for (let x = x0; x < x1; x += step) {
      if (r() < 0.18) continue;
      const bx = x + r() * step * 0.25, by = y + r() * step * 0.2;
      if (skip?.(bx, by)) continue;
      const dist = Math.hypot((bx - cx) / (x1 - x0), (by - cy) / (y1 - y0));
      out.push([bx, by, 40 + r() * 30, 34 + r() * 22, 30 + (1 - Math.min(1, dist * 1.6)) * 80 * r() + r() * 18]);
    }
  }
  return out.sort((a, b) => a[1] - b[1]);
}
const cityBlock = (x: number, y: number) => distToRoad(x + 35, y + 30) < 48 || inLake(x + 35, y + 30, 120);
const CITY_CORE = makeCity(2780, 860, 3240, 1060, 5, 80, (x, y) =>
  cityBlock(x, y) ||
  Math.hypot(x + 35 - 3000, y + 30 - 1010) < 115 ||
  Math.hypot(x + 35 - 2700, y + 30 - 1060) < 100 ||
  Math.hypot(x + 35 - 3300, y + 30 - 930) < 100);
const CITY_SPRAWL = [
  ...makeCity(900, 880, 1250, 1080, 11, 84, cityBlock),
  ...makeCity(4700, 1250, 5050, 1450, 13, 84, cityBlock),
].sort((a, b) => a[1] - b[1]);

const DISTRICT_DEFS = [
  { x0: 2040, y0: 1110, x1: 2460, y1: 1340, seed: 31, label: 'KOTA BARAT' },
  { x0: 3700, y0: 1250, x1: 4040, y1: 1440, seed: 32, label: 'KOTA TIMUR' },
  { x0: 3140, y0: 1760, x1: 3600, y1: 1970, seed: 33, label: 'KOTA SELATAN' },
];
const DISTRICTS = DISTRICT_DEFS.map((d) => ({ ...d, buildings: makeCity(d.x0, d.y0, d.x1, d.y1, d.seed, 80, cityBlock) }));

export interface PlacedUnit { unit: WarUnit; x: number; y: number }
export function layoutUnits(units: WarUnit[], own: boolean): PlacedUnit[] {
  const out: PlacedUnit[] = [];
  const dir = own ? 1 : -1;
  const landX = own ? 1400 : 4900, landY = own ? 330 : 1650;
  const airbase = own ? AIRBASE_OWN : AIRBASE_ENEMY;
  const airUnits = units.filter((u) => u.group === 'udara');
  units.filter((u) => u.group === 'darat').forEach((unit, i) => {
    out.push({ unit, x: landX + dir * (i % 4) * 140, y: landY + Math.floor(i / 4) * 150 });
  });
  airUnits.forEach((unit, i) => {
    const row = Math.floor(i / 4);
    const column = i % 4;
    const rowCount = Math.min(4, airUnits.length - row * 4);
    out.push({
      unit,
      x: airbase.x + dir * (column - (rowCount - 1) / 2) * 190,
      y: airbase.y - 150 + row * 85,
    });
  });
  units.filter((u) => u.group === 'laut').forEach((unit, i) => {
    const lk = own ? LAKES[0] : LAKES[1];
    const x = own ? 1000 + (i % 8) * 150 : 4500 + (i % 8) * 130;
    out.push({ unit, x, y: lk.cy + (i % 2 ? 50 : -50) + Math.floor(i / 8) * 100 });
  });
  return out;
}
const UK = 1.5;
const VISION: Record<string, number> = { darat: 520, laut: 440, udara: 880 };
export const MAP_CSS = `
.map-navigating,.map-navigating *{animation-play-state:paused!important}
.map-navigating .tm-cloud,.map-navigating .nw-drift,.map-navigating .nw-smoke,.map-navigating .tm-fall,.map-navigating .tm-dust,.map-navigating .tm-glint,.map-navigating .tm-fog,.map-navigating .tm-fx{display:none!important}
.map-navigating [filter]{filter:none!important}
.map-navigating .tm-tz{transition:none!important;filter:none!important}
.map-navigating,.map-navigating *{pointer-events:none!important;text-rendering:optimizeSpeed;shape-rendering:optimizeSpeed}
.tm-tz{transition:filter .25s ease}
.tm-tz:hover{filter:brightness(1.15) saturate(1.1)}
.unit-marker{transform-box:fill-box;transform-origin:center}
.unit-marker-air{animation:unit-air-hover 4.8s ease-in-out infinite}
.unit-marker-naval{animation:unit-naval-rock 6.4s ease-in-out infinite}
.unit-marker-ground{animation:unit-ground-idle 5.6s ease-in-out infinite}
.tm-cloud{animation:tm-cloud 90s linear infinite;will-change:transform}
.tm-fall{animation:tm-fall 9s linear infinite}
.tm-dust{animation:tm-dust 14s linear infinite}
.tm-tracer{animation:tm-tracer .5s linear infinite}
.tm-glint{animation:tm-glint 3.2s ease-in-out infinite;opacity:0}
.tm-spin{animation:tm-spin 5s linear infinite;transform-box:fill-box;transform-origin:center}
.tm-spin-slow{animation:tm-spin 70s linear infinite;transform-box:fill-box;transform-origin:center}
@keyframes tm-cloud{from{transform:translateX(-800px)}to{transform:translateX(1600px)}}
@keyframes tm-fall{from{transform:translate(0,-100px)}to{transform:translate(-160px,420px)}}
@keyframes tm-dust{from{transform:translateX(-300px)}to{transform:translateX(1200px)}}
@keyframes tm-tracer{to{stroke-dashoffset:-48}}
@keyframes tm-glint{0%,100%{opacity:0}50%{opacity:.85}}
@keyframes tm-spin{to{transform:rotate(360deg)}}
@keyframes unit-air-hover{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-3px) rotate(-.7deg)}}
@keyframes unit-naval-rock{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(2px) rotate(.45deg)}}
@keyframes unit-ground-idle{0%,100%{transform:translateY(0)}50%{transform:translateY(1.5px)}}
@media (prefers-reduced-motion:reduce){.tm-cloud,.tm-fall,.tm-dust,.tm-tracer,.tm-glint,.tm-spin,.tm-spin-slow,.unit-marker{animation:none!important}}
`;

export const Peak = ({ x, by, w, h, seed, accent, snowDepth }: { x: number; by: number; w: number; h: number; seed: number; accent: string; snowDepth: number }) => {
  const r = rng(seed);
  const j = () => r() - 0.5;
  const ax = x + j() * w * 0.1, ay = by - h;
  const m1x = x - w * 0.2 + j() * w * 0.06, m1y = by - h * (0.5 + j() * 0.12);
  const m2x = x + w * 0.3 + j() * w * 0.06, m2y = by - h * (0.55 + j() * 0.12);
  const kx = x + w * 0.04, ky = by - h * 0.4, bx = x - w * 0.02;
  const t = snowDepth, s = t / 0.22;
  return (
    <g>
      <polygon points={`${x - w * 0.45},${by} ${x + w * 0.45},${by} ${x + w * 0.45 + h * 0.7},${by + h * 0.2} ${x + h * 0.6},${by + h * 0.3}`} fill="url(#tm-shade)" />
      <polygon points={`${x - w / 2},${by} ${m1x},${m1y} ${ax},${ay} ${kx},${ky} ${bx},${by}`} fill="url(#nw-mt-light)" stroke={accent} strokeOpacity="0.28" strokeWidth="1.5" />
      <polygon points={`${ax},${ay} ${m2x},${m2y} ${x + w / 2},${by} ${bx},${by} ${kx},${ky}`} fill="url(#nw-mt-dark)" />
      <polyline points={`${ax},${ay} ${kx},${ky} ${bx},${by}`} fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="2" />
      <path d={`M${ax + w * 0.06},${ay + h * 0.3} L${ax + w * 0.14},${ay + h * 0.62} M${ax + w * 0.12},${ay + h * 0.25} L${ax + w * 0.24},${ay + h * 0.6}`} stroke="#000" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      <polygon points={`${ax},${ay} ${ax - w * 0.1 * s},${ay + h * t} ${ax - w * 0.04},${ay + h * (t - 0.04)} ${ax + w * 0.01},${ay + h * (t + 0.05)} ${ax + w * 0.06},${ay + h * (t - 0.03)} ${ax + w * 0.12 * s},${ay + h * (t + 0.02)}`} fill="#e2e8f0" opacity="0.88" />
    </g>
  );
};

export const Extruded = ({ x, y, w, d, h, roof, stroke, win, i = 0 }: { x: number; y: number; w: number; d: number; h: number; roof: string; stroke: string; win?: boolean; i?: number }) => (
  <g>
    <polygon points={`${x},${y + d} ${x + w},${y + d} ${x + w + h * 0.55},${y + d + h * 0.28} ${x + h * 0.55},${y + d + h * 0.28}`} fill="#000" opacity="0.32" />
    <rect x={x} y={y - h + d} width={w} height={h} fill="url(#tm-wall)" />
    {win && <rect x={x} y={y - h + d} width={w} height={h} fill={i % 2 ? 'url(#tm-win2)' : 'url(#tm-win)'} />}
    <rect x={x} y={y - h} width={w} height={d} fill={roof} stroke={stroke} strokeOpacity="0.45" strokeWidth="1.4" />
  </g>
);

export const MilitaryFacilities = ({
  at,
  color,
  scale = 1,
  side,
  onFacilityClick,
}: {
  at: { x: number; y: number };
  color: string;
  scale?: number;
  side?: FacilitySide;
  onFacilityClick?: (facility: UnitFacility, side: FacilitySide) => void;
}) => {
  const facilitySide = side ?? 'left';
  const facilityButton = (
    facility: UnitFacility,
    label: string,
    children: React.ReactNode,
  ) => (
    <g
      aria-label={onFacilityClick ? `${label}, buka pilihan unit` : undefined}
      onClick={onFacilityClick ? (event) => {
        event.stopPropagation();
        onFacilityClick(facility, facilitySide);
      } : undefined}
      onDoubleClick={onFacilityClick ? (event) => event.stopPropagation() : undefined}
      onKeyDown={onFacilityClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onFacilityClick(facility, facilitySide);
        }
      } : undefined}
      onPointerDown={onFacilityClick ? (event) => event.stopPropagation() : undefined}
      role={onFacilityClick ? 'button' : undefined}
      style={onFacilityClick ? { cursor: 'pointer' } : undefined}
      tabIndex={onFacilityClick ? 0 : undefined}
    >
      {children}
    </g>
  );

  return (
    <g transform={`translate(${at.x} ${at.y}) scale(${scale})`}>
      <rect x="-390" y="-155" width="780" height="310" rx="26" fill="#0b1220" fillOpacity="0.48" stroke={color} strokeOpacity="0.5" strokeWidth="3" pointerEvents="none" />
      <path d="M-360 118 H360" stroke="#64748b" strokeWidth="12" strokeOpacity="0.5" pointerEvents="none" />

      {facilityButton('barak', 'Barak Militer', <>
        <Extruded x={-345} y={-5} w={195} d={78} h={64} roof="#64748b" stroke={color} win />
        <g fill="#fbbf24" opacity="0.75">
          {[-320, -280, -240, -200, -160].map((x) => <rect key={x} x={x} y="23" width="14" height="17" rx="2" />)}
        </g>
        <text x="-247" y="104" textAnchor="middle" fill="#f8fafc" stroke="#020617" strokeWidth="5" paintOrder="stroke" fontSize="18" fontWeight="900" letterSpacing="1" fontFamily="monospace">BARAK MILITER</text>
      </>)}

      {facilityButton('gudang', 'Gudang Senjata', <>
        <Extruded x={-105} y={-5} w={190} d={78} h={58} roof="#475569" stroke={color} />
        <path d="M-80 66 V40 Q-80 26 -70 26 Q-60 26 -60 40 V66 M-35 66 V40 Q-35 26 -25 26 Q-15 26 -15 40 V66 M10 66 V40 Q10 26 20 26 Q30 26 30 40 V66 M55 66 V40 Q55 26 65 26 Q75 26 75 40 V66" fill="#1e293b" stroke={color} strokeWidth="3" />
        <text x="-10" y="104" textAnchor="middle" fill="#f8fafc" stroke="#020617" strokeWidth="5" paintOrder="stroke" fontSize="18" fontWeight="900" letterSpacing="1" fontFamily="monospace">GUDANG SENJATA</text>
      </>)}

      {facilityButton('hangar', 'Hangar Tank', <>
        <Extruded x={135} y={-5} w={205} d={78} h={62} roof="#334155" stroke={color} />
        <rect x="166" y="20" width="143" height="44" rx="4" fill="#1e293b" stroke={color} strokeWidth="3" />
        <path d="M180 22 V62 M198 22 V62 M216 22 V62 M234 22 V62 M252 22 V62 M270 22 V62 M288 22 V62" stroke="#94a3b8" strokeOpacity="0.7" strokeWidth="3" />
        <text x="237" y="104" textAnchor="middle" fill="#f8fafc" stroke="#020617" strokeWidth="5" paintOrder="stroke" fontSize="18" fontWeight="900" letterSpacing="1" fontFamily="monospace">HANGAR TANK</text>
      </>)}
    </g>
  );
};

export const Smoke = ({ x, y, n = 5 }: { x: number; y: number; n?: number }) => (
  <g filter="url(#nw-smoke-blur)" pointerEvents="none">
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} className="nw-a nw-smoke" cx={x + (i % 2) * 10} cy={y} r="22" fill="#475569" style={{ animationDelay: `${i * 1.2}s` }} />
    ))}
  </g>
);

export const Defs = memo(function Defs({ accent, terrainType }: { accent: string; terrainType: TerrainType }) {
  const P = PALETTES[terrainType];
  return (
    <defs>
      <filter id="nw-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
      <filter id="nw-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
      <filter id="nw-smoke-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8" /></filter>

      <linearGradient id="nw-mt-light" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.mt[0]} /><stop offset="1" stopColor={P.mt[1]} /></linearGradient>
      <linearGradient id="nw-mt-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.mt[2]} /><stop offset="1" stopColor={P.mt[3]} /></linearGradient>
      <linearGradient id="tm-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity="0.45" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
      <linearGradient id="tm-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1e293b" /><stop offset="1" stopColor="#0b1220" /></linearGradient>
      <radialGradient id="tm-foot"><stop offset="0" stopColor={P.foot} stopOpacity="0.6" /><stop offset="1" stopColor={P.foot} stopOpacity="0" /></radialGradient>
      <radialGradient id="tm-fire"><stop offset="0" stopColor="#fff7c2" /><stop offset="0.35" stopColor="#fb923c" stopOpacity="0.9" /><stop offset="1" stopColor="#ef4444" stopOpacity="0" /></radialGradient>
      <radialGradient id="tm-cloud"><stop offset="0" stopColor="#000" stopOpacity="0.28" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      <radialGradient id="nw-sun" cx="0.2" cy="0.1" r="0.8"><stop offset="0" stopColor="#fff7e0" stopOpacity="0.22" /><stop offset="1" stopColor="#fff7e0" stopOpacity="0" /></radialGradient>
      <radialGradient id="nw-vignette" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
      <radialGradient id="tm-v-black"><stop offset="0" stopColor="#000" /><stop offset="0.55" stopColor="#000" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>

      <pattern id="tm-speck" width="240" height="240" patternUnits="userSpaceOnUse">
        {SPECKS.filter((s) => !s.light).map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#000" opacity={s.o} />)}
      </pattern>
      <pattern id="tm-tufts" width="360" height="360" patternUnits="userSpaceOnUse">
        {TUFTS.map((t, i) => (
          <path key={i} d={Array.from({ length: t.n }, (_, k) => `M${t.x + k * 5},${t.y} q${t.l},${-t.h * 0.6} ${t.l * 2 + k * 2 - 2},${-t.h}`).join(' ')} stroke={P.tuft[t.ci]} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.7" />
        ))}
      </pattern>
      <pattern id="tm-pebbles" width="260" height="260" patternUnits="userSpaceOnUse">
        {PEBBLES.map((p, i) => <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill={p.light ? P.rock[2] : P.rock[1]} opacity={p.light ? 0.55 : 0.45} />)}
      </pattern>

      <pattern id="tm-win" width="24" height="20" patternUnits="userSpaceOnUse"><rect x="3" y="4" width="6" height="8" fill="#FFEB3B" opacity="0.75" /><rect x="15" y="4" width="6" height="8" fill="#94a3b8" opacity="0.25" /></pattern>
      <pattern id="tm-win2" width="24" height="20" patternUnits="userSpaceOnUse"><rect x="3" y="4" width="6" height="8" fill="#94a3b8" opacity="0.25" /><rect x="15" y="4" width="6" height="8" fill="#FFEB3B" opacity="0.65" /></pattern>

      <marker id="nw-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="12" markerHeight="12" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={accent} opacity="0.9" /></marker>
      <marker id="nw-arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="12" markerHeight="12" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#f43f5e" opacity="0.9" /></marker>
    </defs>
  );
});

const TerrainLayer = memo(function TerrainLayer({ accent, water, terrainType }: { accent: string; water: string; terrainType: TerrainType }) {
  const P = PALETTES[terrainType];
  const isDesert = terrainType === 'desert';
  const isUrban = terrainType === 'urban';
  const isSnow = terrainType === 'snow';
  const showForest = !isDesert && !isUrban;
  const waterStroke = isDesert ? '#8a6e4a' : isSnow ? '#93c5fd' : water;
  const forests = showForest ? [...FORESTS, ...EXT_FORESTS] : [];

  const renderTrees = (f: ReturnType<typeof makeForest>) =>
    f.trees.map((t, i) => {
      const c = P.tree[t.ci % P.tree.length];
      return isSnow ? (
        <g key={i}>
          <polygon points={`${t.x + t.r * 0.5},${t.y - t.r * 1.4} ${t.x - t.r * 0.3},${t.y + t.r * 0.9} ${t.x + t.r * 1.3},${t.y + t.r * 0.9}`} fill="#000" opacity="0.3" />
          <polygon points={`${t.x},${t.y - t.r * 1.7} ${t.x - t.r * 0.85},${t.y + t.r * 0.7} ${t.x + t.r * 0.85},${t.y + t.r * 0.7}`} fill={c} />
          <polygon points={`${t.x},${t.y - t.r * 1.7} ${t.x - t.r * 0.85},${t.y + t.r * 0.7} ${t.x},${t.y + t.r * 0.7}`} fill={P.treeHi} opacity="0.55" />
        </g>
      ) : (
        <g key={i}>
          <ellipse cx={t.x + t.r * 0.35} cy={t.y + t.r * 0.5} rx={t.r} ry={t.r * 0.8} fill="#000" opacity="0.3" />
          <circle cx={t.x} cy={t.y} r={t.r} fill={c} />
          <circle cx={t.x - t.r * 0.3} cy={t.y - t.r * 0.35} r={t.r * 0.5} fill={P.treeHi} opacity="0.3" />
        </g>
      );
    });

  const sandDunes = (s: { cx: number; cy: number; rx: number; ry: number }) =>
    [-0.5, -0.15, 0.2, 0.5].map((k, j) => (
      <path key={j} d={`M${s.cx - s.rx * 0.5},${s.cy + s.ry * k * 1.2} q ${s.rx * 0.25},-18 ${s.rx * 0.5},0 t ${s.rx * 0.5},0`} fill="none" stroke="#a8875a" strokeOpacity="0.45" strokeWidth="2.4" />
    ));

  return (
    <g>
      <rect x={EX.x} y={EX.y} width={EX.w} height={EX.h} fill={P.ground} />
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

      <ellipse cx="5000" cy="480" rx="1100" ry="360" fill="url(#tm-foot)" />
      <ellipse cx="3000" cy="2200" rx="1300" ry="260" fill="url(#tm-foot)" opacity="0.7" />

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

      <g fill="none" pointerEvents="none" strokeLinejoin="round" strokeLinecap="round">
        <path d={ROAD} stroke="#000" strokeWidth="44" opacity="0.3" />
        <path d={ROAD} stroke={P.road} strokeWidth="30" />
        <path d={ROAD} stroke={P.roadLine} strokeWidth="3.4" strokeDasharray="22 24" opacity="0.5" />
      </g>

      {LAKES.map((l, i) => (
        <g key={`lk${i}`} className="nw-tz tm-tz" data-terrain="lake">
          <path d={l.shore} fill={P.bank} opacity="0.35" />
          <path d={l.water} fill="#0b1d3a" opacity="0.92" stroke={waterStroke} strokeWidth="30" strokeOpacity="0.55" strokeLinejoin="round" />
          <path d={l.water} fill="none" stroke="#e0f2fe" strokeWidth="4" opacity="0.4" strokeLinejoin="round" />
          <path d={l.deep} fill="#06142b" opacity="0.45" />
          <g fill="none" stroke="#dbeafe" strokeWidth="2.6" strokeLinecap="round">
            {l.ripples.map((r, j) => <path key={j} d={`M${-r.w},0 q${r.w / 2},-5 ${r.w},0 t${r.w},0`} transform={`translate(${r.x.toFixed(0)} ${r.y.toFixed(0)})`} opacity={r.o} />)}
          </g>
          <g stroke="#fff" strokeWidth="3.4" strokeLinecap="round">
            {l.glints.map((g, j) => <line key={j} className="tm-glint" x1={g.x} y1={g.y} x2={g.x + g.w} y2={g.y - 2} style={{ animationDelay: `${g.delay}s`, animationDuration: `${g.dur}s` }} />)}
          </g>
        </g>
      ))}

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

      {isDesert && (
        <g pointerEvents="none">
          <ellipse cx="2600" cy="420" rx="380" ry="100" fill="#a07a52" opacity="0.35" /><ellipse cx="2600" cy="420" rx="340" ry="70" fill="#c9a878" opacity="0.5" />
          <ellipse cx="4700" cy="1500" rx="330" ry="90" fill="#a07a52" opacity="0.35" /><ellipse cx="4700" cy="1500" rx="290" ry="62" fill="#c9a878" opacity="0.5" />
        </g>
      )}

      {forests.map((f, fi) => (
        <g key={`fo${fi}`} className="nw-tz tm-tz" data-terrain="forest">
          <path d={f.blob} fill={P.under} opacity="0.85" />
          {renderTrees(f)}
        </g>
      ))}

      <g className="nw-tz tm-tz" data-terrain="highland">
        {EXT_PEAKS.map(([x, by, w, h], i) => <Peak key={`xk${i}`} x={x} by={by} w={w} h={h} seed={800 + i} accent={accent} snowDepth={isSnow ? 0.45 : h > 250 ? 0.22 : 0.14} />)}
        {PEAKS.map(([x, by, w, h], i) => <Peak key={i} x={x} by={by} w={w} h={h} seed={31 + i} accent={accent} snowDepth={isSnow ? 0.45 : h > 250 ? 0.22 : 0.14} />)}
      </g>

      <g className="nw-tz tm-tz" data-terrain="urban">
        <rect x="2760" y="840" width="560" height="240" rx="44" fill="#111827" opacity="0.5" />
        {CITY_CORE.map((b, i) => <Extruded key={i} x={b[0]} y={b[1]} w={b[2]} d={b[3]} h={b[4]} roof={P.roof[i % 3]} stroke={accent} win i={i} />)}
      </g>
      {DISTRICTS.map((d, di) => (
        <g key={`dist${di}`} className="nw-tz tm-tz" data-terrain="urban">
          <rect x={d.x0 - 30} y={d.y0 - 30} width={d.x1 - d.x0 + 80} height={d.y1 - d.y0 + 60} rx="40" fill="#111827" opacity="0.5" />
          {d.buildings.map((b, i) => <Extruded key={i} x={b[0]} y={b[1]} w={b[2]} d={b[3]} h={b[4]} roof={P.roof[i % 3]} stroke={accent} win i={i + di} />)}
        </g>
      ))}
      {isUrban && (
        <g className="nw-tz tm-tz" data-terrain="urban">
          {CITY_SPRAWL.map((b, i) => <Extruded key={i} x={b[0]} y={b[1]} w={b[2]} d={b[3]} h={b[4]} roof={P.roof[i % 3]} stroke={accent} win i={i + 1} />)}
        </g>
      )}

      <g pointerEvents="none" fontFamily="monospace" fontWeight="900" textAnchor="middle" fill="#f8fafc" stroke="#020617" strokeWidth="10" paintOrder="stroke" strokeLinejoin="round" opacity="0.92" letterSpacing="14" fontSize="60">
        {LAKES.map((l, i) => <text key={i} x={l.cx} y={l.cy - l.ry - 60}>DANAU</text>)}
        <text x="5050" y="250">PEGUNUNGAN</text>
        <text x="3000" y="800">KOTA</text>
        {DISTRICTS.map((d) => <text key={d.label} x={(d.x0 + d.x1) / 2 + 20} y={d.y0 - 50} fontSize="40" letterSpacing="8">{d.label}</text>)}
        {showForest && <text x="800" y="1500">HUTAN</text>} 
        {SWAMPS.map((s, i) => <text key={i} x={s.cx} y={s.cy + s.ry + 56} fontSize="44" letterSpacing="10">RAWA</text>)}
      </g>
    </g>
  );
});

type Owner = 'neutral' | 'contested' | 'own' | 'enemy';
const RED = '#f43f5e';

const Headquarters = ({ at, color, fallen, name, sub, id }: { at: { x: number; y: number }; color: string; fallen: boolean; name: string; sub: string; id: string }) => {
  const x = 0, y = 0;
  const c = fallen ? '#64748b' : color;
  const fy = fallen ? 42 : 0;
  return (
    <g className="nw-tz" data-terrain={id} transform={`translate(${at.x} ${at.y}) scale(1.25)`}>
      <circle cx={x} cy={y} r="215" fill={c} fillOpacity="0.05" />
      <circle cx={x} cy={y} r="215" fill="none" stroke={c} strokeOpacity="0.45" strokeWidth="3" />
      <rect x={x - 150} y={y - 100} width="300" height="200" rx="14" fill="#0b1220" fillOpacity="0.62" stroke={c} strokeOpacity="0.75" strokeWidth="3" />
      <Extruded x={x - 125} y={y - 70} w={64} d={34} h={22} roof="#475569" stroke={c} />
      <Extruded x={x - 125} y={y + 30} w={64} d={34} h={22} roof="#475569" stroke={c} />
      <Extruded x={x + 60} y={y + 30} w={60} d={30} h={20} roof="#475569" stroke={c} />
      <Extruded x={x - 40} y={y - 20} w={80} d={44} h={36} roof="#64748b" stroke={c} />
      <circle cx={x + 85} cy={y - 48} r="30" fill="#111827" stroke={c} strokeWidth="2.4" />
      <text x={x + 85} y={y - 38} textAnchor="middle" fontSize="28" fontWeight="900" fill={c} fontFamily="monospace">H</text>
      <circle cx={x - 20} cy={y + 62} r="16" fill="#111827" stroke={c} strokeWidth="2" />
      <g className="tm-spin"><path d={`M${x - 34},${y + 62} H${x - 6}`} stroke={c} strokeWidth="3" strokeLinecap="round" /></g>
      {[[-150, -100], [134, -100], [-150, 84], [134, 84]].map(([dx, dy], i) => <rect key={i} x={x + dx} y={y + dy} width="16" height="16" fill="#1f2937" stroke={c} strokeWidth="2" />)}
      <line x1={x + 30} y1={y - 56} x2={x + 30} y2={y - 92} stroke="#cbd5e1" strokeWidth="2" />
      <circle className="nw-flicker" cx={x + 30} cy={y - 94} r="3.5" fill="#ef4444" />
      <line x1={x - 5} y1={y - 56} x2={x - 5} y2={y - 128} stroke="#cbd5e1" strokeWidth="3" />
      <polygon points={`${x - 5},${y - 128 + fy} ${x + 42},${y - 118 + fy} ${x - 5},${y - 106 + fy}`} fill={c} stroke="#000" strokeWidth="1" />
      {fallen && (
        <g pointerEvents="none">
          <circle className="nw-pulse" cx={x - 30} cy={y - 8} r="46" fill="url(#tm-fire)" />
          <circle className="nw-pulse" cx={x + 70} cy={y + 20} r="34" fill="url(#tm-fire)" style={{ animationDelay: '.4s' }} />
          <Smoke x={x - 30} y={y - 20} n={4} />
        </g>
      )}
      <text x={x} y={y + 132} textAnchor="middle" fontSize="26" fontWeight="900" letterSpacing="3" fill={c} stroke="#000" strokeWidth="5" paintOrder="stroke" fontFamily="monospace">{name}</text>
      <rect x={x - 100} y={y + 142} width="200" height="9" rx="4.5" fill="#000" opacity="0.6" />
      <rect x={x - 100} y={y + 142} width={fallen ? 14 : 200} height="9" rx="4.5" fill={c} style={{ transition: 'width 1s ease' }} />
      <text x={x} y={y + 176} textAnchor="middle" fontSize="17" fontWeight="800" letterSpacing="2" fill="#e2e8f0" stroke="#000" strokeWidth="4" paintOrder="stroke" fontFamily="monospace">{fallen ? 'HQ DIREBUT' : sub}</text>
    </g>
  );
};

export const Airbase = ({
  at,
  color,
  name,
  id,
  side,
  onFacilityClick,
}: {
  at: { x: number; y: number };
  color: string;
  name: string;
  id: string;
  side?: FacilitySide;
  onFacilityClick?: (facility: UnitFacility, side: FacilitySide) => void;
}) => {
  return (
    <g
      className="nw-tz"
      data-terrain={id}
      transform={`translate(${at.x} ${at.y}) scale(1.25)`}
      aria-label={onFacilityClick ? `${name}, buka pilihan unit udara` : undefined}
      onClick={onFacilityClick ? (event) => {
        event.stopPropagation();
        onFacilityClick('bandara', side ?? 'left');
      } : undefined}
      onDoubleClick={(event) => event.stopPropagation()}
      onKeyDown={onFacilityClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onFacilityClick('bandara', side ?? 'left');
        }
      } : undefined}
      onPointerDown={onFacilityClick ? (event) => event.stopPropagation() : undefined}
      role={onFacilityClick ? 'button' : undefined}
      style={onFacilityClick ? { cursor: 'pointer' } : undefined}
      tabIndex={onFacilityClick ? 0 : undefined}
    >
      <rect x="-470" y="-215" width="940" height="290" rx="22" fill="#0b1220" fillOpacity="0.55" stroke={color} strokeOpacity="0.5" strokeWidth="3" />
      <rect x="-440" y="-35" width="880" height="70" rx="6" fill="#2a2f38" stroke="#000" strokeOpacity="0.5" strokeWidth="2" />
      <line x1="-410" y1="0" x2="410" y2="0" stroke="#e5e7eb" strokeWidth="3" opacity="0.8" />
      {[-1, 1].map((sd) => (
        <g key={sd} stroke="#e5e7eb" strokeWidth="3" opacity="0.75">
          {[-22, -11, 0, 11, 22].map((o) => <line key={o} x1={sd * 424} y1={o} x2={sd * 396} y2={o} />)}
        </g>
      ))}
      <g fill={color} opacity="0.9">
        <circle className="nw-flicker" cx="-440" cy="-38" r="4" /><circle className="nw-flicker" cx="440" cy="-38" r="4" />
        <circle className="nw-flicker" cx="-440" cy="38" r="4" /><circle className="nw-flicker" cx="440" cy="38" r="4" />
      </g>
      <rect x="-260" y="-120" width="28" height="86" fill="#2a2f38" />
      <rect x="80" y="-120" width="28" height="86" fill="#2a2f38" />
      <rect x="-420" y="-125" width="560" height="14" fill="#2a2f38" />
      <Extruded x={-420} y={-205} w={90} d={44} h={26} roof="#475569" stroke={color} />
      <Extruded x={-310} y={-205} w={90} d={44} h={26} roof="#475569" stroke={color} />
      <Extruded x={-200} y={-205} w={90} d={44} h={26} roof="#475569" stroke={color} />
      <Extruded x={150} y={-190} w={34} d={30} h={58} roof="#64748b" stroke={color} />
      <circle className="nw-flicker" cx="167" cy="-236" r="4" fill="#ef4444" />
      {[230, 290, 350].map((cx) => <circle key={cx} cx={cx} cy="-165" r="22" fill="#334155" stroke={color} strokeWidth="2" />)}
      <line x1="420" y1="-120" x2="420" y2="-160" stroke="#cbd5e1" strokeWidth="2.4" />
      <polygon points="420,-160 452,-153 420,-146" fill="#f97316" stroke="#000" strokeWidth="1" />
      <text x="0" y="112" textAnchor="middle" fontSize="26" fontWeight="900" letterSpacing="3" fill={color} stroke="#000" strokeWidth="5" paintOrder="stroke" fontFamily="monospace">{name}</text>
    </g>
  );
};

const CapturePoint = ({ x, y, name, main, owner, accent, id }: { x: number; y: number; name: string; main: boolean; owner: Owner; accent: string; id: string }) => {
  const col = owner === 'own' ? accent : owner === 'enemy' ? RED : owner === 'contested' ? '#f97316' : main ? '#FFEB3B' : '#e5e7eb';
  const R = main ? 92 : 68;
  const circ = 2 * Math.PI * R;
  const prog = owner === 'neutral' ? 0 : owner === 'contested' ? 0.5 : 1;
  return (
    <g className="nw-tz" data-terrain={id} transform={`translate(${x} ${y}) scale(1.4)`}>
      <circle r={R} fill={col} fillOpacity="0.1" />
      <circle r={R} fill="none" stroke={col} strokeOpacity="0.4" strokeWidth="3" strokeDasharray="8 10" />
      <circle r={R} fill="none" stroke={col} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${circ * prog} ${circ}`} transform="rotate(-90)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      {owner === 'contested' && <circle className="nw-a nw-ping" r={R * 0.6} fill="none" stroke={col} strokeWidth="3" />}
      <line x1="0" y1="0" x2="0" y2="-54" stroke="#e2e8f0" strokeWidth="3" />
      <polygon points="0,-54 36,-45 0,-36" fill={col} stroke="#000" strokeWidth="1.2" />
      <circle r="7" fill={col} stroke="#000" strokeWidth="2" />
      <text y={R + 26} textAnchor="middle" fontSize={main ? 24 : 20} fontWeight="900" letterSpacing="3" fill={col} stroke="#000" strokeWidth="5" paintOrder="stroke" fontFamily="monospace">{name}</text>
    </g>
  );
};

const ResourceNode = ({ x, y, name, col }: { x: number; y: number; name: string; col: string }) => (
  <g className="nw-tz" data-terrain="resource" transform={`translate(${x} ${y}) scale(1.4)`}>
    <circle r="58" fill={col} fillOpacity="0.08" stroke={col} strokeOpacity="0.5" strokeWidth="3" strokeDasharray="6 8" />
    <rect x={-30} y={-6} width="26" height="20" fill="#78350f" stroke={col} strokeWidth="1.6" />
    <rect x={-2} y={-12} width="26" height="26" fill="#92400e" stroke={col} strokeWidth="1.6" />
    <rect x={-12} y={12} width="18" height="22" rx="3" fill="#475569" stroke={col} strokeWidth="1.6" />
    <polygon points="0,-56 11,-45 0,-34 -11,-45" fill={col} stroke="#000" strokeWidth="1.2" />
    <text y={84} textAnchor="middle" fontSize="19" fontWeight="900" letterSpacing="2" fill={col} stroke="#000" strokeWidth="5" paintOrder="stroke" fontFamily="monospace">{name}</text>
  </g>
);

const BasesLayer = memo(function BasesLayer({ accent, simPhase, playerSide, onFacilityClick }: {
  accent: string;
  simPhase: SimPhase;
  playerSide: PlayerSide;
  onFacilityClick?: (facility: UnitFacility, side: FacilitySide) => void;
}) {
  const ownIsAtk = playerSide === 'attacker';
  const done = simPhase === 'done';
  const owner: Owner = simPhase === 'clash' ? 'contested' : done ? (ownIsAtk ? 'own' : 'enemy') : 'neutral';
  const resCol = done ? (ownIsAtk ? accent : RED) : '#fbbf24';
  return (
    <g>
      <Headquarters id={ownIsAtk ? 'hqAttacker' : 'hqDefender'} at={HQ_OWN} color={accent} fallen={done && !ownIsAtk}
        name="HQ ANDA" sub={ownIsAtk ? 'SYARAT MENANG: REBUT HQ MUSUH' : 'SYARAT MENANG: HANCURKAN PENYERANG'} />
      <Headquarters id={ownIsAtk ? 'hqDefender' : 'hqAttacker'} at={HQ_ENEMY} color={RED} fallen={done && ownIsAtk}
        name="HQ MUSUH" sub={ownIsAtk ? 'SYARAT MENANG: HANCURKAN PENYERANG' : 'SYARAT MENANG: REBUT HQ ANDA'} />
      <Airbase id="airbaseOwn" at={AIRBASE_OWN} color={accent} name="PANGKALAN UDARA ANDA" side="left" onFacilityClick={onFacilityClick} />
      <Airbase id="airbaseEnemy" at={AIRBASE_ENEMY} color={RED} name="PANGKALAN UDARA MUSUH" side="right" onFacilityClick={onFacilityClick} />
      
      {/* ── BARAK MILITER DISESUAIKAN DENGAN PANAH MERAH ── */}
      {/* User: Naik 100px ke Atas (y: 180) */}
      <MilitaryFacilities at={{ x: 1200, y: 180 }} color={accent} side="left" onFacilityClick={onFacilityClick} />
      
      {/* Musuh: Hutan dipindah, base tetap di tengah lapang */}
      <MilitaryFacilities at={{ x: 5150, y: 1350 }} color={RED} side="right" onFacilityClick={onFacilityClick} />
      
      {CAPTURE_POINTS.map((c) => <CapturePoint key={c.id} id={c.main ? 'objective' : 'capture'} x={c.x} y={c.y} name={c.name} main={c.main} owner={owner} accent={accent} />)}
      {RESOURCES.map((r) => <ResourceNode key={r.id} x={r.x} y={r.y} name={r.name} col={resCol} />)}
    </g>
  );
});

type UnitPosition = { x: number; y: number };
type UnitMovePath = { id: string; start: UnitPosition; target: UnitPosition };
type UnitAttackEffect = UnitMovePath & { weaponType: number; travelMs: number };

const attackVisual = (weaponType: number) => {
  switch (weaponType) {
    case 0: return { color: '#fde047', width: 8, dash: '16 10' };
    case 1: return { color: '#fb7185', width: 6, dash: '24 14' };
    case 2: return { color: '#38bdf8', width: 5, dash: '8 14' };
    case 3: return { color: '#f97316', width: 7, dash: '14 10' };
    default: return { color: '#a3e635', width: 4, dash: '5 10' };
  }
};

const unitId = (unit: WarUnit, side: 'own' | 'enemy') =>
  `${side}:${unit.group}:${unit.kind}:${unit.echelon ?? 'base'}`;

interface UnitsProps {
  accent: string;
  simPhase: SimPhase;
  own: PlacedUnit[];
  enemy: PlacedUnit[];
  playerSide: PlayerSide;
  positions: Record<string, UnitPosition>;
  selectedUnitId: string | null;
  movingUnitIds: string[];
  movePaths: UnitMovePath[];
  commandMode: UnitCommandMode;
  attackRadius: number | null;
  attackStrike: UnitAttackEffect | null;
  onSelectUnit: (id: string) => void;
}

const UnitsLayer = memo(function UnitsLayer({
  accent, simPhase, own, enemy, playerSide, positions, selectedUnitId, movingUnitIds, movePaths,
  commandMode, attackRadius, attackStrike, onSelectUnit,
}: UnitsProps) {
  const renderUnit = (placed: PlacedUnit, index: number, hostile: boolean) => {
    const side = hostile ? 'enemy' : 'own';
    const id = unitId(placed.unit, side);
    const position = positions[id] ?? { x: placed.x, y: placed.y };
    const selected = !hostile && selectedUnitId === id;
    const moving = movingUnitIds.includes(id);
    const color = hostile ? RED : accent;

    return (
      <g
        key={`${id}-${index}`}
        data-unit-id={id}
        role={hostile ? undefined : 'button'}
        aria-label={hostile ? undefined : `Pilih ${placed.unit.label} ${formatUnitQuantity(placed.unit.quantity)}`}
        aria-pressed={hostile ? undefined : selected}
        tabIndex={hostile ? undefined : 0}
        style={hostile ? undefined : { cursor: selected ? 'crosshair' : 'grab' }}
        onClick={hostile ? undefined : (event) => {
          event.stopPropagation();
          onSelectUnit(id);
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
        }}
        onKeyDown={hostile ? undefined : (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelectUnit(id);
          }
        }}
        transform={`scale(${UK})`}
      >
        {(selected || moving) && (
          <circle
            cx={position.x / UK}
            cy={position.y / UK}
            r={24}
            fill={color}
            fillOpacity={selected ? 0.2 : 0.12}
            stroke={color}
            strokeWidth={2}
            strokeDasharray={moving ? '5 4' : undefined}
          />
        )}
        <UnitMarker
          x={position.x / UK} y={position.y / UK} kind={placed.unit.kind}
          color={color}
          quantity={placed.unit.quantity}
          echelon={placed.unit.echelon}
          label={`${placed.unit.label} ${formatUnitQuantity(placed.unit.quantity)}`}
        />
      </g>
    );
  };
  const ownIsAtk = playerSide === 'attacker';
  const done = simPhase === 'done';
  const fade = (on: boolean): React.CSSProperties => ({ transition: 'opacity .8s, filter .8s', opacity: on ? 0.45 : 1, filter: on ? 'grayscale(1) brightness(.7)' : 'none' });

  return (
    <g>
      {selectedUnitId && attackRadius !== null && (
        commandMode === 'attack' || movingUnitIds.includes(selectedUnitId)
      ) && (() => {
        const selected = own.find((placed) => unitId(placed.unit, 'own') === selectedUnitId);
        const position = selected ? positions[selectedUnitId] ?? { x: selected.x, y: selected.y } : null;
        return position ? (
          <circle
            cx={position.x}
            cy={position.y}
            r={attackRadius}
            fill="#fb7185"
            fillOpacity="0.08"
            stroke="#fb7185"
            strokeWidth={4}
            strokeDasharray="18 14"
            pointerEvents="none"
          />
        ) : null;
      })()}
      {attackStrike && (
        (() => {
          const visual = attackVisual(attackStrike.weaponType);
          return (
            <path
              key={attackStrike.id}
              className="tm-tracer"
              d={`M ${attackStrike.start.x} ${attackStrike.start.y} L ${attackStrike.target.x} ${attackStrike.target.y}`}
              fill="none"
              stroke={visual.color}
              strokeWidth={visual.width}
              strokeDasharray={visual.dash}
              style={{ animationDuration: `${Math.max(100, attackStrike.travelMs / 3)}ms` }}
              pointerEvents="none"
            />
          );
        })()
      )}
      {movePaths.map((movePath) => (
        <path
          key={movePath.id}
          d={`M ${movePath.start.x} ${movePath.start.y} L ${movePath.target.x} ${movePath.target.y}`}
          fill="none"
          stroke={accent}
          strokeWidth="5"
          strokeDasharray="14 12"
          opacity="0.75"
          pointerEvents="none"
        />
      ))}
      <g className="nw-tz" data-terrain={ownIsAtk ? 'attacker' : 'defender'} style={fade(done && !ownIsAtk)}>
        {own.map((placed, index) => renderUnit(placed, index, false))}
      </g>

      <g className="nw-tz" data-terrain={ownIsAtk ? 'defender' : 'attacker'} style={fade(done && ownIsAtk)}>
        {enemy.map((placed, index) => renderUnit(placed, index, true))}
      </g>

      {simPhase === 'clash' && (
        <g pointerEvents="none">
          <circle className="nw-a nw-ping" cx="3000" cy="1010" r="120" fill="none" stroke="#f97316" strokeWidth="8" />
          <circle className="nw-a nw-ping" cx="3000" cy="1010" r="240" fill="none" stroke="#f97316" strokeWidth="4" style={{ animationDelay: '0.5s' }} />
          {([[3150, 1090, 100], [2860, 930, 75], [3060, 1020, 130]] as const).map(([x, y, r], i) => (
            <circle key={i} className="nw-pulse" cx={x} cy={y} r={r} fill="url(#tm-fire)" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
          <path className="tm-tracer" d="M 2850,900 L 3260,980 M 2850,1110 L 3260,1050" fill="none" stroke="#fde047" strokeWidth="4" strokeDasharray="18 40" />
          <path className="tm-tracer" d="M 3500,1200 L 3080,1040" fill="none" stroke="#fb7185" strokeWidth="4" strokeDasharray="18 40" />
        </g>
      )}
      {done && (
        <g pointerEvents="none">
          <ellipse cx="3060" cy="1020" rx="170" ry="70" fill="#000" opacity="0.45" />
          <ellipse cx="2900" cy="940" rx="90" ry="36" fill="#000" opacity="0.4" />
          <ellipse cx="3200" cy="1090" rx="100" ry="40" fill="#000" opacity="0.4" />
          <Smoke x={3060} y={990} n={5} />
        </g>
      )}
    </g>
  );
});

interface Src { x: number; y: number; r: number }
const FogLayer = memo(function FogLayer({ sources, active }: { sources: Src[]; active: boolean }) {
  return (
    <g className="tm-fog" pointerEvents="none" style={{ opacity: active ? 1 : 0, transition: 'opacity .9s ease' }}>
      <defs>
        <mask id="tm-fog-mask" maskUnits="userSpaceOnUse" x={EX.x} y={EX.y} width={EX.w} height={EX.h}>
          <rect x={EX.x} y={EX.y} width={EX.w} height={EX.h} fill="#fff" />
          {sources.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="url(#tm-v-black)" />)}
        </mask>
      </defs>
      <rect x={EX.x} y={EX.y} width={EX.w} height={EX.h} fill="#04101c" opacity="0.42" mask="url(#tm-fog-mask)" />
    </g>
  );
});

const EffectsLayer = memo(function EffectsLayer({ terrainType }: { terrainType: TerrainType }) {
  return (
    <g pointerEvents="none">
      <circle className="nw-flicker" cx="3900" cy="1460" r="14" fill="#f97316" filter="url(#nw-glow)" />
      <Smoke x={3900} y={1450} />
      <Smoke x={3160} y={880} n={3} />

      {[[800, 500, 620, 170, 0], [3000, 1750, 700, 190, -35], [5200, 1200, 640, 160, -60]].map(([x, y, rx, ry, delay], i) => (
        <ellipse key={i} className="tm-cloud" cx={x} cy={y} rx={rx} ry={ry} fill="url(#tm-cloud)" style={{ animationDelay: `${delay}s` }} />
      ))}
      {terrainType === 'snow' && PARTICLES.map((p, i) => <circle key={i} className="tm-fall" cx={p.x} cy={p.y} r={p.r} fill="#fff" opacity="0.7" style={{ animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />)}
      {terrainType === 'desert' && PARTICLES.slice(0, 40).map((p, i) => <ellipse key={i} className="tm-dust" cx={p.x} cy={p.y} rx={p.r * 14} ry={p.r * 0.9} fill="#e8d5a8" opacity="0.22" style={{ animationDuration: `${p.dur + 6}s`, animationDelay: `${p.delay}s` }} />)}

      <rect x={EX.x} y={EX.y} width={EX.w} height={EX.h} fill="url(#nw-sun)" opacity="0.35" />
      <rect x={EX.x} y={EX.y} width={EX.w} height={EX.h} fill="url(#nw-vignette)" />
    </g>
  );
});

const Brackets = ({ c }: { c: string }) => (
  <>
    {['left-0 top-0 border-l-2 border-t-2', 'right-0 top-0 border-r-2 border-t-2', 'left-0 bottom-0 border-l-2 border-b-2', 'right-0 bottom-0 border-r-2 border-b-2'].map((p) => (
      <span key={p} className={`absolute h-2.5 w-2.5 ${p}`} style={{ borderColor: c }} />
    ))}
  </>
);

export const GridRulers = memo(function GridRulers({ vb, accent, hover, selected }: { vb: ViewBox; accent: string; hover?: string | null; selected?: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ width: e.contentRect.width, height: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ready = box.width > 0 && box.height > 0;
  const { scale, ox, oy } = viewScale(ready ? box : { width: 1, height: 1 }, vb);
  const px = (wx: number) => (wx - vb.x) * scale + ox;
  const py = (wy: number) => (wy - vb.y) * scale + oy;

  const cell = (key: string | null | undefined) => {
    if (!key) return null;
    const [c, r] = key.split(',').map(Number);
    return { c, r, left: px(c * GRID_SIZE), top: py(r * GRID_SIZE), size: GRID_SIZE * scale };
  };
  const hv = cell(hover), sel = cell(selected);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-[15] overflow-hidden" aria-hidden>
      {ready && (
        <>
          {hv && (
            <div className="absolute" style={{ left: hv.left, top: hv.top, width: hv.size, height: hv.size, backgroundColor: `${accent}1A` }}>
              <Brackets c={accent} />
            </div>
          )}
          {sel && (
            <div className="absolute" style={{ left: sel.left, top: sel.top, width: sel.size, height: sel.size, backgroundColor: 'rgba(255,235,59,0.14)' }}>
              <Brackets c="#FFEB3B" />
              <span className="absolute left-1 top-1 rounded bg-black/70 px-1 font-mono text-[10px] font-black text-[#FFEB3B]">{cellLabel(sel.c, sel.r)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export const TacticalMap = memo(function TacticalMap({
  accent, water, terrainType, simPhase, attackerUnits, defenderUnits, viewBox,
  svgRef, playerSide = 'attacker', fogEnabled = true, onFacilityClick,
  commandMode = null, onUnitSelectionChange, onAttackRadiusChange, onAttack,
}: MapProps) {
  const ownIsAtk = playerSide === 'attacker';
  const fogActive = fogEnabled && simPhase === 'idle';
  const own = useMemo(() => layoutUnits(ownIsAtk ? attackerUnits : defenderUnits, true), [ownIsAtk, attackerUnits, defenderUnits]);
  const enemy = useMemo(() => layoutUnits(ownIsAtk ? defenderUnits : attackerUnits, false), [ownIsAtk, attackerUnits, defenderUnits]);
  const [positions, setPositions] = useState<Record<string, UnitPosition>>({});
  const positionsRef = useRef(positions);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const selectedUnitIdRef = useRef<string | null>(null);
  const [attackRadius, setAttackRadius] = useState<number | null>(null);
  const [attackStrike, setAttackStrike] = useState<UnitAttackEffect | null>(null);
  const attackStrikeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [movingUnitIds, setMovingUnitIds] = useState<string[]>([]);
  const [movePaths, setMovePaths] = useState<UnitMovePath[]>([]);
  const movementFramesRef = useRef<Record<string, number>>({});
  const movementEngineRef = useRef<Awaited<ReturnType<typeof loadRustViewport>> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadRustViewport()
      .then((engine) => {
        if (!cancelled) movementEngineRef.current = engine;
      })
      .catch((error: unknown) => {
        console.error('[TacticalMap] Failed to load Rust unit movement engine', error);
      });
    return () => {
      cancelled = true;
        Object.values(movementFramesRef.current).forEach(cancelAnimationFrame);
        if (attackStrikeTimerRef.current !== null) clearTimeout(attackStrikeTimerRef.current);
    };
  }, []);

  const selectUnit = (id: string) => {
    if (simPhase !== 'idle') return;
    const nextId = selectedUnitId === id ? null : id;
    selectedUnitIdRef.current = nextId;
    setSelectedUnitId(nextId);
    const selected = nextId ? own.find((placed) => unitId(placed.unit, 'own') === nextId) : null;
    onUnitSelectionChange?.(selected?.unit ?? null);
    setAttackRadius(null);
    onAttackRadiusChange?.(null);
    if (selected) {
      const updateRadius = (engine: Awaited<ReturnType<typeof loadRustViewport>>) => {
        if (selectedUnitIdRef.current !== nextId) return;
        const radius = engine.calculate_attack_radius(selected.unit.quantity, selected.unit.group, selected.unit.kind);
        setAttackRadius(radius);
        onAttackRadiusChange?.(radius);
      };
      const engine = movementEngineRef.current;
      if (engine) {
        updateRadius(engine);
      } else {
        void loadRustViewport()
          .then((loadedEngine) => {
            movementEngineRef.current = loadedEngine;
            updateRadius(loadedEngine);
          })
          .catch((error: unknown) => {
            console.error('[TacticalMap] Failed to calculate Rust attack radius', error);
          });
      }
    }
  };

  useEffect(() => {
    if (simPhase === 'idle') return;
    Object.values(movementFramesRef.current).forEach(cancelAnimationFrame);
    movementFramesRef.current = {};
  }, [simPhase, onUnitSelectionChange]);

  const handleMapClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedUnitId || simPhase !== 'idle') return;
    const svg = event.currentTarget;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const destination = point.matrixTransform(matrix.inverse());
    const placedUnit = own.find((placed) => unitId(placed.unit, 'own') === selectedUnitId);
    if (!placedUnit) return;

    const start = positionsRef.current[selectedUnitId] ?? { x: placedUnit.x, y: placedUnit.y };
    const group = placedUnit.unit.group;
    const move = (engine: Awaited<ReturnType<typeof loadRustViewport>>) => {
      const [targetX, targetY, speed] = engine.prepare_unit_movement(
        destination.x,
        destination.y,
        BASE_W,
        BASE_H,
        group,
      );
      const id = selectedUnitId;
      const currentFrame = movementFramesRef.current[id];
      if (currentFrame !== undefined) cancelAnimationFrame(currentFrame);
      const target = { x: targetX, y: targetY };
      setMovingUnitIds((current) => current.includes(id) ? current : [...current, id]);
      setMovePaths((current) => [...current.filter((path) => path.id !== id), { id, start, target }]);

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
        positionsRef.current = { ...positionsRef.current, [id]: nextPosition };
        setPositions(positionsRef.current);

        if (done >= 0.5) {
          delete movementFramesRef.current[id];
          setMovingUnitIds((current) => current.filter((movingId) => movingId !== id));
          setMovePaths((current) => current.filter((path) => path.id !== id));
        } else {
          movementFramesRef.current[id] = requestAnimationFrame(animate);
        }
      };

      movementFramesRef.current[id] = requestAnimationFrame(animate);
    };

    const engine = movementEngineRef.current;
    if (engine) {
      move(engine);
      return;
    }
    loadRustViewport()
      .then((loadedEngine) => {
        movementEngineRef.current = loadedEngine;
        move(loadedEngine);
      })
      .catch((error: unknown) => {
        console.error('[TacticalMap] Failed to load Rust unit movement engine', error);
      });
  };

  const handleAttackUnit = (target: WarUnit | null, targetPosition: UnitPosition) => {
    if (!selectedUnitId || simPhase !== 'idle') return;
    const attacker = own.find((placed) => unitId(placed.unit, 'own') === selectedUnitId);
    if (!attacker) return;
    const fire = (engine: Awaited<ReturnType<typeof loadRustViewport>>) => {
      const { radius, projectileSpeed, weaponType } = prepareUnitAttack(
        engine,
        attacker.unit.quantity,
        attacker.unit.group,
        attacker.unit.kind,
      );
      setAttackRadius(radius);
      const origin = positionsRef.current[selectedUnitId] ?? { x: attacker.x, y: attacker.y };
      const inRange = engine.is_target_in_attack_range(
        origin.x, origin.y, targetPosition.x, targetPosition.y, radius,
      );
      if (inRange) {
        const distance = Math.hypot(targetPosition.x - origin.x, targetPosition.y - origin.y);
        const travelMs = Math.max(180, Math.min(1800, (distance / projectileSpeed) * 1000));
        setAttackStrike({
          id: `${selectedUnitId}-${Date.now()}`,
          start: origin,
          target: targetPosition,
          weaponType,
          travelMs,
        });
        if (attackStrikeTimerRef.current !== null) clearTimeout(attackStrikeTimerRef.current);
        attackStrikeTimerRef.current = setTimeout(() => setAttackStrike(null), travelMs);
      }
      onAttack?.(attacker.unit, target, inRange);
    };
    const engine = movementEngineRef.current;
    if (engine) {
      fire(engine);
    } else {
      void loadRustViewport()
        .then((loadedEngine) => {
          movementEngineRef.current = loadedEngine;
          fire(loadedEngine);
        })
        .catch((error: unknown) => {
          console.error('[TacticalMap] Failed to load Rust attack engine', error);
        });
    }
  };

  const handleMapContextMenu = (event: React.MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    if (!selectedUnitId || simPhase !== 'idle') return;
    const svg = event.currentTarget;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const target = point.matrixTransform(matrix.inverse());
    const enemyElement = event.target instanceof Element
      ? event.target.closest<SVGGElement>('[data-unit-id]')
      : null;
    if (enemyElement?.getAttribute('data-unit-id')?.startsWith('own:')) return;
    const enemyUnit = enemyElement
      ? enemy.find((placed) => unitId(placed.unit, 'enemy') === enemyElement.getAttribute('data-unit-id'))
      : null;
    handleAttackUnit(enemyUnit?.unit ?? null, { x: target.x, y: target.y });
  };

  const sources = useMemo<Src[]>(
    () => [...own.map((p) => ({ x: p.x, y: p.y, r: VISION[p.unit.group] ?? 520 })), { x: HQ_OWN.x, y: HQ_OWN.y, r: 640 }],
    [own],
  );

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 h-full w-full"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Peta taktis operasi"
      onClick={handleMapClick}
      onContextMenu={handleMapContextMenu}
    >
      <style>{MAP_CSS}</style>
      <Defs accent={accent} terrainType={terrainType} />
      <TerrainLayer accent={accent} water={water} terrainType={terrainType} />
      <BasesLayer accent={accent} simPhase={simPhase} playerSide={playerSide} onFacilityClick={onFacilityClick} />
      {fogEnabled && <FogLayer sources={sources} active={fogActive} />}
      <UnitsLayer
        accent={accent}
        simPhase={simPhase}
        own={own}
        enemy={enemy}
        playerSide={playerSide}
        positions={positions}
        selectedUnitId={simPhase === 'idle' ? selectedUnitId : null}
        movingUnitIds={simPhase === 'idle' ? movingUnitIds : []}
        movePaths={simPhase === 'idle' ? movePaths : []}
        commandMode={simPhase === 'idle' ? commandMode : null}
        attackRadius={simPhase === 'idle' ? attackRadius : null}
        attackStrike={simPhase === 'idle' ? attackStrike : null}
        onSelectUnit={selectUnit}
      />
      <EffectsLayer terrainType={terrainType} />
    </svg>
  );
});