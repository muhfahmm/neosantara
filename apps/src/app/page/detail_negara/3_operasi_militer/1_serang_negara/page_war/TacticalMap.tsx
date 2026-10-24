'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import UnitMarker from './units/unitMarker';
import { formatUnitQuantity, type WarUnit } from './units/warUnitComposition';

/* ───────────────────────── TIPE & KONSTANTA (dipakai juga oleh PageWar) ───────────────────────── */
export type TerrainType = 'default' | 'desert' | 'snow' | 'jungle' | 'urban';
export type SimPhase = 'idle' | 'advance' | 'clash' | 'done';
export type PlayerSide = 'attacker' | 'defender';
export type ViewBox = { x: number; y: number; w: number; h: number };

export const BASE_W = 4800;
export const BASE_H = 1200;
export const MIN_VIEW_W = 4800;
export const MAX_VIEW_W = 900;
export const GRID_SIZE = 100;

export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
export const getColName = (n: number) => {
  let s = '';
  while (n >= 0) { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; }
  return s;
};
export const cellLabel = (col: number, row: number) => `${getColName(col)}-${row + 1}`;

/* viewBox selalu mengikuti rasio kontainer → tidak ada pemotongan (slice) dan HQ di tepi peta tetap terlihat */
export const getMinViewW = (ar: number) => Math.max(MAX_VIEW_W, Math.min(BASE_W, BASE_H * 2 * ar));
export function clampView(v: ViewBox, ar: number): ViewBox {
  const w = clamp(v.w, MAX_VIEW_W, getMinViewW(ar));
  const h = w / ar;
  const x = clamp(v.x, 0, Math.max(0, BASE_W - w));
  const y = h >= BASE_H ? (BASE_H - h) / 2 : clamp(v.y, 0, BASE_H - h);
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
  isSimulating: boolean;
  simPhase: SimPhase;
  attackerUnits: WarUnit[];
  defenderUnits: WarUnit[];
  viewBox: ViewBox;
  playerSide?: PlayerSide;
  fogEnabled?: boolean;
}

/* ───────────────────────── PALET PER MEDAN ───────────────────────── */
interface Palette {
  mt: [string, string, string, string];
  tree: string[]; treeHi: string; under: string;
  bank: string; patch: [string, string, string];
  road: string; roadLine: string; foot: string; roof: [string, string, string];
}
const PALETTES: Record<TerrainType, Palette> = {
  default: { mt: ['#94a3b8', '#475569', '#475569', '#0f172a'], tree: ['#064e3b', '#065f46', '#047857', '#166534', '#14532d', '#0f766e'], treeHi: '#6ee7b7', under: '#04261a', bank: '#64748b', patch: ['#14532d', '#1e3a5f', '#365314'], road: '#2b3342', roadLine: '#cbd5e1', foot: '#0b1220', roof: ['#475569', '#64748b', '#52607a'] },
  desert:  { mt: ['#d6b384', '#a47c4f', '#a47c4f', '#4a3220'], tree: ['#6b7a3a', '#556b2f', '#7c8a44'], treeHi: '#d9f99d', under: '#3a2c14', bank: '#c9a878', patch: ['#c9a878', '#a07a52', '#8a6e4a'], road: '#5b4630', roadLine: '#e8d5a8', foot: '#3a2412', roof: ['#a8906a', '#8f7a58', '#b59d74'] },
  snow:    { mt: ['#e2e8f0', '#94a3b8', '#94a3b8', '#1e293b'], tree: ['#0f3d3a', '#134e4a', '#14532d', '#1e4d3a'], treeHi: '#e0f2fe', under: '#0b2a2e', bank: '#e0f2fe', patch: ['#e0f2fe', '#93c5fd', '#bfdbfe'], road: '#475569', roadLine: '#e2e8f0', foot: '#0f1f3d', roof: ['#cbd5e1', '#94a3b8', '#e2e8f0'] },
  jungle:  { mt: ['#6b8f71', '#2f5d3e', '#2f5d3e', '#06281a'], tree: ['#052e16', '#064e3b', '#065f46', '#14532d', '#166534'], treeHi: '#86efac', under: '#021a0e', bank: '#3f6212', patch: ['#14532d', '#065f46', '#3f6212'], road: '#3a2f1e', roadLine: '#a8a29e', foot: '#021a10', roof: ['#475569', '#3f4b5e', '#566073'] },
  urban:   { mt: ['#a1a8b3', '#5b6472', '#5b6472', '#1f2937'], tree: ['#365314', '#3f6212', '#4d7c0f', '#166534'], treeHi: '#bef264', under: '#14301a', bank: '#6b7280', patch: ['#475569', '#334155', '#64748b'], road: '#1f2937', roadLine: '#e5e7eb', foot: '#0b1019', roof: ['#64748b', '#475569', '#7b8798'] },
};

/* ───────────────────────── GENERATOR PROSEDURAL (sekali, di level modul) ───────────────────────── */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blobPath(cx: number, cy: number, rx: number, ry: number, seed: number, n = 14): string {
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

/* ── Titik strategis ── */
export const HQ_ATK = { x: 640, y: 600 };
export const HQ_DEF = { x: 4200, y: 985 };
const CAPTURE_POINTS = [
  { id: 'alpha', name: 'OBJ ALPHA', x: 2400, y: 600, main: true },
  { id: 'bravo', name: 'BRAVO', x: 2240, y: 500, main: false },
  { id: 'charlie', name: 'CHARLIE', x: 2560, y: 500, main: false },
];
const RESOURCES = [
  { id: 'fuel', name: 'DEPO BBM', x: 2000, y: 835 },
  { id: 'ammo', name: 'GUDANG AMUNISI', x: 2800, y: 835 },
];

/* ── Hutan ── */
type Tree = { x: number; y: number; r: number; ci: number };
const FOREST_DEFS = [
  { cx: 1400, cy: 470, rx: 380, ry: 190, n: 120, seed: 7 },
  { cx: 3400, cy: 1020, rx: 260, ry: 130, n: 70, seed: 21 },
  { cx: 4200, cy: 400, rx: 300, ry: 170, n: 80, seed: 42 },
  { cx: 600, cy: 300, rx: 240, ry: 120, n: 55, seed: 99 },
];
const FORESTS = FOREST_DEFS.map((f) => {
  const r = rng(f.seed);
  const trees: Tree[] = [];
  while (trees.length < f.n) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    trees.push({ x: f.cx + Math.cos(a) * d * f.rx, y: f.cy + Math.sin(a) * d * f.ry, r: 14 + r() * 12, ci: Math.floor(r() * 10) });
  }
  trees.sort((a, b) => a.y - b.y);
  return { ...f, trees, blob: blobPath(f.cx, f.cy, f.rx * 1.08, f.ry * 1.12, f.seed + 1) };
});

/* ── Tanah, partikel ── */
const PATCHES = (() => {
  const r = rng(3);
  return Array.from({ length: 12 }, (_, i) => ({ ci: i % 3, d: blobPath(200 + r() * 4400, 150 + r() * 900, 260 + r() * 360, 120 + r() * 140, 100 + i) }));
})();
const SPECKS = (() => {
  const r = rng(5);
  return Array.from({ length: 70 }, () => ({ x: r() * 240, y: r() * 240, r: 0.8 + r() * 1.6, light: r() > 0.45, o: 0.05 + r() * 0.09 }));
})();
const PARTICLES = (() => {
  const r = rng(17);
  return Array.from({ length: 70 }, () => ({ x: r() * BASE_W, y: r() * BASE_H, r: 2 + r() * 3.5, dur: 7 + r() * 8, delay: -r() * 14 }));
})();

/* ── Sungai: disampel dari kurva Bezier agar riak, busa tepi, dan posisi kapal mengikuti alirannya ── */
const RIVER = 'M -100,860 C 800,960 1800,660 2400,700 S 3800,600 5000,840';
const RIVER_SEGS: number[][][] = [
  [[-100, 860], [800, 960], [1800, 660], [2400, 700]],
  [[2400, 700], [3000, 740], [3800, 600], [5000, 840]],
];
type RPt = { x: number; y: number; tx: number; ty: number; nx: number; ny: number };
const RIVER_PTS: RPt[] = (() => {
  const out: RPt[] = [];
  const at = (s: number[][], t: number) => {
    const u = 1 - t;
    return [
      u * u * u * s[0][0] + 3 * u * u * t * s[1][0] + 3 * u * t * t * s[2][0] + t * t * t * s[3][0],
      u * u * u * s[0][1] + 3 * u * u * t * s[1][1] + 3 * u * t * t * s[2][1] + t * t * t * s[3][1],
    ];
  };
  RIVER_SEGS.forEach((s) => {
    for (let i = 0; i <= 140; i++) {
      const t = i / 140;
      const [x, y] = at(s, t);
      const [x2, y2] = at(s, Math.min(1, t + 0.004));
      const [x1, y1] = at(s, Math.max(0, t - 0.004));
      const L = Math.hypot(x2 - x1, y2 - y1) || 1;
      const tx = (x2 - x1) / L, ty = (y2 - y1) / L;
      out.push({ x, y, tx, ty, nx: -ty, ny: tx });
    }
  });
  return out;
})();
export function riverY(x: number): number {
  for (let i = 1; i < RIVER_PTS.length; i++) {
    const a = RIVER_PTS[i - 1], b = RIVER_PTS[i];
    if (x >= a.x && x <= b.x && b.x > a.x) return a.y + ((x - a.x) / (b.x - a.x)) * (b.y - a.y);
  }
  return 700;
}
const SHORE = [1, -1].map((side) => {
  const r = rng(77 + side);
  return RIVER_PTS.filter((_, i) => i % 2 === 0)
    .map((p, i) => `${i ? 'L' : 'M'}${(p.x + p.nx * side * (47 + r() * 9)).toFixed(0)},${(p.y + p.ny * side * (47 + r() * 9)).toFixed(0)}`)
    .join(' ');
});
// OPTIMASI: 240 → 140 riak, 70 → 40 kilau (jumlah node SVG turun banyak, tampilan hampir sama)
const RIPPLES = (() => {
  const r = rng(88);
  return Array.from({ length: 140 }, () => {
    const p = RIVER_PTS[Math.floor(r() * RIVER_PTS.length)];
    const off = (r() - 0.5) * 72;
    return { x: p.x + p.nx * off, y: p.y + p.ny * off, a: (Math.atan2(p.ty, p.tx) * 180) / Math.PI, w: 11 + r() * 17, o: 0.16 + r() * 0.28 };
  });
})();
const GLINTS = (() => {
  const r = rng(91);
  return Array.from({ length: 40 }, () => {
    const p = RIVER_PTS[Math.floor(r() * RIVER_PTS.length)];
    const off = (r() - 0.5) * 60;
    return { x: p.x + p.nx * off, y: p.y + p.ny * off, w: 8 + r() * 14, delay: -r() * 6, dur: 2.4 + r() * 3 };
  });
})();

/* ── Medan sekunder: rawa, pasir gembur, kawah (memperlambat unit darat, tidak menghalangi tembakan) ── */
const SWAMPS = [
  { cx: 1150, cy: 975, rx: 300, ry: 95, seed: 201 },
  { cx: 3500, cy: 830, rx: 260, ry: 75, seed: 202 },
].map((s) => {
  const r = rng(s.seed);
  return {
    ...s,
    blob: blobPath(s.cx, s.cy, s.rx, s.ry, s.seed, 12),
    pools: Array.from({ length: 7 }, () => ({ x: s.cx + (r() - 0.5) * s.rx * 1.3, y: s.cy + (r() - 0.5) * s.ry * 1.2, rx: 18 + r() * 36, ry: 8 + r() * 14 })),
    reeds: Array.from({ length: 30 }, () => ({ x: s.cx + (r() - 0.5) * s.rx * 1.5, y: s.cy + (r() - 0.5) * s.ry * 1.4 })),
  };
});
const SANDS = [
  { cx: 2050, cy: 340, rx: 260, ry: 80, seed: 211 },
  { cx: 2950, cy: 990, rx: 280, ry: 85, seed: 212 },
  { cx: 4450, cy: 560, rx: 200, ry: 70, seed: 213 },
].map((s) => ({ ...s, blob: blobPath(s.cx, s.cy, s.rx, s.ry, s.seed, 12) }));
const CRATER_FIELDS = [
  { cx: 2090, cy: 545, r: 90, n: 9, seed: 301 },
  { cx: 2730, cy: 560, r: 100, n: 9, seed: 302 },
  { cx: 2400, cy: 385, r: 110, n: 8, seed: 303 },
].map((f) => {
  const r = rng(f.seed);
  return { ...f, craters: Array.from({ length: f.n }, () => ({ x: f.cx + (r() - 0.5) * f.r * 2, y: f.cy + (r() - 0.5) * f.r * 1.3, r: 14 + r() * 20 })) };
});


/* ── Medan perluasan: mengisi area di atas/bawah peta utama agar tidak ada ruang kosong ── */
const EXT_Y0 = -1000, EXT_Y1 = 2200;
const EXT_PATCHES = (() => {
  const r = rng(404);
  return Array.from({ length: 22 }, (_, i) => {
    const top = i % 2 === 0;
    const cy = top ? -900 + r() * 800 : 1300 + r() * 850;
    return { ci: i % 3, d: blobPath(-100 + r() * 5000, cy, 300 + r() * 420, 140 + r() * 170, 500 + i) };
  });
})();
const EXT_FOREST_DEFS = [
  { cx: 500, cy: -300, rx: 360, ry: 170 }, { cx: 1700, cy: -450, rx: 420, ry: 200 },
  { cx: 2800, cy: -250, rx: 380, ry: 160 }, { cx: 4000, cy: -420, rx: 400, ry: 190 },
  { cx: 1100, cy: -780, rx: 380, ry: 150 }, { cx: 3300, cy: -800, rx: 400, ry: 160 },
  { cx: 4600, cy: -120, rx: 260, ry: 130 },
  { cx: 700, cy: 1450, rx: 380, ry: 170 }, { cx: 1900, cy: 1600, rx: 420, ry: 190 },
  { cx: 3000, cy: 1450, rx: 360, ry: 160 }, { cx: 4200, cy: 1550, rx: 400, ry: 180 },
  { cx: 1300, cy: 1900, rx: 380, ry: 150 }, { cx: 3600, cy: 1950, rx: 400, ry: 150 },
  { cx: 200, cy: 1750, rx: 250, ry: 120 },
].map((d, i) => ({ ...d, n: 38, seed: 600 + i }));
const EXT_FORESTS = EXT_FOREST_DEFS.map((f) => {
  const r = rng(f.seed);
  const trees: Tree[] = [];
  while (trees.length < f.n) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    trees.push({ x: f.cx + Math.cos(a) * d * f.rx, y: f.cy + Math.sin(a) * d * f.ry, r: 14 + r() * 12, ci: Math.floor(r() * 10) });
  }
  trees.sort((a, b) => a.y - b.y);
  return { ...f, trees, blob: blobPath(f.cx, f.cy, f.rx * 1.08, f.ry * 1.12, f.seed + 1) };
});
const EXT_PEAKS: [number, number, number, number][] = ([
  [300, -140, 280, 200], [1300, -200, 300, 230], [2300, -120, 260, 190], [3500, -180, 300, 240], [4400, -240, 260, 200],
  [800, -620, 300, 220], [2000, -660, 320, 250], [2900, -600, 280, 210], [4000, -700, 300, 230],
  [1000, 1560, 280, 180], [2400, 1500, 300, 200], [3600, 1620, 280, 190], [4500, 1480, 260, 170],
  [200, 1900, 300, 220], [1700, 1980, 320, 230], [3000, 2000, 300, 220], [4200, 2060, 320, 240],
] as [number, number, number, number][]).sort((a, b) => a[1] - b[1]);
const EXT_SWAMPS = [
  { cx: 2400, cy: -520, rx: 300, ry: 90, seed: 701 }, { cx: 4200, cy: -30, rx: 240, ry: 70, seed: 702 },
  { cx: 600, cy: 1750, rx: 300, ry: 90, seed: 703 }, { cx: 3300, cy: 1800, rx: 280, ry: 85, seed: 704 },
].map((s) => {
  const r = rng(s.seed);
  return {
    ...s, blob: blobPath(s.cx, s.cy, s.rx, s.ry, s.seed, 12),
    pools: Array.from({ length: 6 }, () => ({ x: s.cx + (r() - 0.5) * s.rx * 1.3, y: s.cy + (r() - 0.5) * s.ry * 1.2, rx: 18 + r() * 34, ry: 8 + r() * 14 })),
    reeds: Array.from({ length: 22 }, () => ({ x: s.cx + (r() - 0.5) * s.rx * 1.5, y: s.cy + (r() - 0.5) * s.ry * 1.4 })),
  };
});
const EXT_SANDS = [
  { cx: 900, cy: -400, rx: 260, ry: 80, seed: 711 }, { cx: 3000, cy: -60, rx: 260, ry: 80, seed: 712 },
  { cx: 1500, cy: 1400, rx: 270, ry: 80, seed: 713 }, { cx: 4300, cy: 1800, rx: 260, ry: 80, seed: 714 },
].map((s) => ({ ...s, blob: blobPath(s.cx, s.cy, s.rx, s.ry, s.seed, 12) }));

/* ── Kota ── */
type Bld = [number, number, number, number, number];
function makeCity(x0: number, y0: number, x1: number, y1: number, seed: number, step: number, skip?: (x: number, y: number) => boolean): Bld[] {
  const r = rng(seed);
  const out: Bld[] = [];
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  for (let y = y0; y < y1; y += step * 0.85) {
    for (let x = x0; x < x1; x += step) {
      if (r() < 0.18) continue;
      const bx = x + r() * step * 0.25, by = y + r() * step * 0.2;
      if (skip?.(bx, by)) continue;
      const dist = Math.hypot((bx - cx) / (x1 - x0), (by - cy) / (y1 - y0));
      out.push([bx, by, 30 + r() * 24, 26 + r() * 18, 22 + (1 - Math.min(1, dist * 1.6)) * 60 * r() + r() * 14]);
    }
  }
  return out.sort((a, b) => a[1] - b[1]);
}
const CITY_CORE = makeCity(2190, 420, 2620, 580, 5, 64, (x, y) =>
  Math.hypot(x + 25 - 2400, y + 20 - 600) < 70 ||
  Math.hypot(x + 25 - 2240, y + 20 - 500) < 62 ||
  Math.hypot(x + 25 - 2560, y + 20 - 500) < 62 ||
  (Math.abs(y + 20 - 600) < 30 && x < 2420) || (Math.abs(x + 25 - 2400) < 30 && y >= 560));
const CITY_SPRAWL = [...makeCity(950, 380, 1250, 560, 11, 70), ...makeCity(3850, 230, 4120, 420, 13, 70)].sort((a, b) => a[1] - b[1]);

const ROAD = 'M -50,560 C 700,600 1500,540 2000,610 L 2400,600 L 2400,790 C 2400,900 3000,880 3400,940 S 4300,900 4850,960';

const PEAKS: [number, number, number, number][] = ([
  [3200, 300, 300, 250], [3000, 340, 260, 190], [3400, 400, 240, 180],
  [3100, 430, 280, 200], [2900, 450, 220, 140], [3600, 360, 260, 210],
  [4500, 780, 260, 160], [800, 1090, 240, 130], [3880, 1140, 180, 100],
] as [number, number, number, number][]).sort((a, b) => a[1] - b[1]);

/* ── Penempatan unit (dipakai untuk render DAN jangkauan pandang Fog of War) ── */
export interface PlacedUnit { unit: WarUnit; x: number; y: number; moves: boolean }
export function layoutUnits(units: WarUnit[], hostile: boolean): PlacedUnit[] {
  const startX = hostile ? 3000 : 1800;
  const dir = hostile ? -1 : 1;
  const out: PlacedUnit[] = [];
  (['darat', 'laut', 'udara'] as const).forEach((group, gi) => {
    units.filter((u) => u.group === group).forEach((unit, index) => {
      if (group === 'laut') {
        // unit maritim berlabuh di jalur air (bukan di daratan)
        const x = (hostile ? 2950 : 1000) + (index % 8) * 150;
        out.push({ unit, x, y: riverY(x), moves: false });
      } else {
        out.push({ unit, x: startX + dir * (index % 4) * 90, y: 136 + gi * 310 + Math.floor(index / 4) * 96, moves: !hostile });
      }
    });
  });
  return out;
}
const VISION: Record<string, number> = { darat: 380, laut: 320, udara: 650 };

/* ───────────────────────── CSS LOKAL PETA (prefix tm-) ───────────────────────── */
// OPTIMASI: hover tanpa drop-shadow (berat pada grup besar), will-change pada awan.
const MAP_CSS = `
.tm-tz{transition:filter .25s ease}
.tm-tz:hover{filter:brightness(1.18) saturate(1.12)}
.tm-cloud{animation:tm-cloud 90s linear infinite;will-change:transform}
.tm-fall{animation:tm-fall 9s linear infinite}
.tm-dust{animation:tm-dust 14s linear infinite}
.tm-tracer{animation:tm-tracer .5s linear infinite}
.tm-glint{animation:tm-glint 3.2s ease-in-out infinite;opacity:0}
.tm-spin{animation:tm-spin 5s linear infinite;transform-box:fill-box;transform-origin:center}
.tm-spin-slow{animation:tm-spin 70s linear infinite;transform-box:fill-box;transform-origin:center}
@keyframes tm-cloud{from{transform:translateX(-600px)}to{transform:translateX(1200px)}}
@keyframes tm-fall{from{transform:translate(0,-80px)}to{transform:translate(-120px,320px)}}
@keyframes tm-dust{from{transform:translateX(-200px)}to{transform:translateX(900px)}}
@keyframes tm-tracer{to{stroke-dashoffset:-48}}
@keyframes tm-glint{0%,100%{opacity:0}50%{opacity:.85}}
@keyframes tm-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.tm-cloud,.tm-fall,.tm-dust,.tm-tracer,.tm-glint,.tm-spin,.tm-spin-slow{animation:none!important}}
`;

/* ───────────────────────── ELEMEN KECIL ───────────────────────── */
const Peak = ({ x, by, w, h, seed, accent, snowDepth }: { x: number; by: number; w: number; h: number; seed: number; accent: string; snowDepth: number }) => {
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

const Extruded = ({ x, y, w, d, h, roof, stroke, win, i = 0 }: { x: number; y: number; w: number; d: number; h: number; roof: string; stroke: string; win?: boolean; i?: number }) => (
  <g>
    <polygon points={`${x},${y + d} ${x + w},${y + d} ${x + w + h * 0.55},${y + d + h * 0.28} ${x + h * 0.55},${y + d + h * 0.28}`} fill="#000" opacity="0.32" />
    <rect x={x} y={y - h + d} width={w} height={h} fill="url(#tm-wall)" />
    {win && <rect x={x} y={y - h + d} width={w} height={h} fill={i % 2 ? 'url(#tm-win2)' : 'url(#tm-win)'} />}
    <rect x={x} y={y - h} width={w} height={d} fill={roof} stroke={stroke} strokeOpacity="0.45" strokeWidth="1.4" />
  </g>
);

const Smoke = ({ x, y, n = 5 }: { x: number; y: number; n?: number }) => (
  <g filter="url(#nw-smoke-blur)" pointerEvents="none">
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} className="nw-a nw-smoke" cx={x + (i % 2) * 10} cy={y} r="18" fill="#475569" style={{ animationDelay: `${i * 1.2}s` }} />
    ))}
  </g>
);

const GridOverlay = memo(function GridOverlay({ accent }: { accent: string }) {
  const lines: React.ReactNode[] = [];
  for (let gx = 0; gx <= BASE_W; gx += GRID_SIZE) lines.push(<line key={`gx${gx}`} x1={gx} y1={EXT_Y0} x2={gx} y2={EXT_Y1} stroke={accent} strokeOpacity="0.07" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />);
  for (let gy = EXT_Y0; gy <= EXT_Y1; gy += GRID_SIZE) lines.push(<line key={`gy${gy}`} x1={0} y1={gy} x2={BASE_W} y2={gy} stroke={accent} strokeOpacity="0.07" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />);
  return <g pointerEvents="none">{lines}</g>;
});

/* ───────────────────────── DEFS ───────────────────────── */
// ID lama dipertahankan agar UnitMarker & komponen lain yang merujuknya tidak rusak.
const Defs = memo(function Defs({ accent, terrainType }: { accent: string; terrainType: TerrainType }) {
  const P = PALETTES[terrainType];
  return (
    <defs>
      <filter id="nw-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10" result="b" /><feComposite in="SourceGraphic" in2="b" operator="over" /></filter>
      <filter id="nw-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10" /></filter>
      <filter id="nw-smoke-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter>
      <filter id="nw-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>

      <linearGradient id="nw-mt-light" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.mt[0]} /><stop offset="1" stopColor={P.mt[1]} /></linearGradient>
      <linearGradient id="nw-mt-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.mt[2]} /><stop offset="1" stopColor={P.mt[3]} /></linearGradient>
      <linearGradient id="tm-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity="0.45" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
      <linearGradient id="tm-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1e293b" /><stop offset="1" stopColor="#0b1220" /></linearGradient>
      <radialGradient id="tm-foot"><stop offset="0" stopColor={P.foot} stopOpacity="0.6" /><stop offset="1" stopColor={P.foot} stopOpacity="0" /></radialGradient>
      <radialGradient id="tm-fire"><stop offset="0" stopColor="#fff7c2" /><stop offset="0.35" stopColor="#fb923c" stopOpacity="0.9" /><stop offset="1" stopColor="#ef4444" stopOpacity="0" /></radialGradient>
      <radialGradient id="tm-cloud"><stop offset="0" stopColor="#000" stopOpacity="0.32" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      <radialGradient id="nw-fog"><stop offset="0" stopColor="#cbd5e1" stopOpacity="0.5" /><stop offset="1" stopColor="#cbd5e1" stopOpacity="0" /></radialGradient>
      <radialGradient id="nw-sun" cx="0.2" cy="0.1" r="0.8"><stop offset="0" stopColor="#fff7e0" stopOpacity="0.22" /><stop offset="1" stopColor="#fff7e0" stopOpacity="0" /></radialGradient>
      <radialGradient id="nw-vignette" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>

      <pattern id="tm-speck" width="240" height="240" patternUnits="userSpaceOnUse">
        {SPECKS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.light ? '#fff' : '#000'} opacity={s.o} />)}
      </pattern>
      <pattern id="tm-win" width="24" height="20" patternUnits="userSpaceOnUse"><rect x="3" y="4" width="6" height="8" fill="#FFEB3B" opacity="0.75" /><rect x="15" y="4" width="6" height="8" fill="#94a3b8" opacity="0.25" /></pattern>
      <pattern id="tm-win2" width="24" height="20" patternUnits="userSpaceOnUse"><rect x="3" y="4" width="6" height="8" fill="#94a3b8" opacity="0.25" /><rect x="15" y="4" width="6" height="8" fill="#FFEB3B" opacity="0.65" /></pattern>
      <pattern id="tm-hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="18" stroke="#94a3b8" strokeOpacity="0.22" strokeWidth="3" /></pattern>

      <marker id="nw-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="12" markerHeight="12" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={accent} opacity="0.9" /></marker>
      <path id="nw-river-path" d={RIVER} />
    </defs>
  );
});

/* ───────────────────────── LAYER MEDAN (statis) ───────────────────────── */
const TerrainLayer = memo(function TerrainLayer({ accent, water, terrainType }: { accent: string; water: string; terrainType: TerrainType }) {
  const P = PALETTES[terrainType];
  const isDesert = terrainType === 'desert';
  const isUrban = terrainType === 'urban';
  const isSnow = terrainType === 'snow';
  const showForest = !isDesert && !isUrban;
  const waterStroke = isDesert ? '#8a6e4a' : isSnow ? '#93c5fd' : water;

  return (
    <g>
      {/* TANAH (diperluas ke area luar peta supaya zoom-out tidak menampilkan ruang kosong) */}
      <rect x="-1000" y="-1000" width="6800" height="3200" fill="url(#tm-speck)" />
      {PATCHES.map((p, i) => <path key={i} d={p.d} fill={P.patch[p.ci]} opacity="0.14" />)}
      <rect x="-1000" y="-1000" width="6800" height="3200" fill={P.patch[0]} opacity="0.1" />
      {EXT_PATCHES.map((p, i) => <path key={`xp${i}`} d={p.d} fill={P.patch[p.ci]} opacity="0.2" />)}
      {EXT_SANDS.map((q, i) => (
        <g key={`xs${i}`} className="nw-tz tm-tz" data-terrain="sand">
          <path d={q.blob} fill="#d9bf8c" opacity="0.5" stroke="#f3e2b8" strokeOpacity="0.4" strokeWidth="2" />
          {[-0.5, -0.15, 0.2, 0.5].map((k, j) => (
            <path key={j} d={`M${q.cx - q.rx * 0.5},${q.cy + q.ry * k * 1.2} q ${q.rx * 0.25},-18 ${q.rx * 0.5},0 t ${q.rx * 0.5},0`} fill="none" stroke="#a8875a" strokeOpacity="0.45" strokeWidth="2.4" />
          ))}
        </g>
      ))}
      {EXT_SWAMPS.map((q, i) => (
        <g key={`xw${i}`} className="nw-tz tm-tz" data-terrain="swamp">
          <path d={q.blob} fill="#2c4a36" opacity="0.82" stroke="#6b8f5b" strokeOpacity="0.5" strokeWidth="2.4" />
          {q.pools.map((p, j) => <ellipse key={j} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill="#3f7d7a" opacity="0.6" stroke="#9bd0c8" strokeOpacity="0.35" strokeWidth="1.5" />)}
          {q.reeds.map((p, j) => <path key={j} d={`M${p.x},${p.y} v-15 M${p.x - 4},${p.y} v-10 M${p.x + 4},${p.y} v-11`} stroke="#b7c58f" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />)}
        </g>
      ))}
      <ellipse cx="3250" cy="380" rx="780" ry="280" fill="url(#tm-foot)" />
      <ellipse cx="4500" cy="800" rx="360" ry="200" fill="url(#tm-foot)" opacity="0.7" />
      <g fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth="1.5" strokeDasharray="10 8" pointerEvents="none">
        {[1, 1.25, 1.5].map((k, i) => <path key={i} d={blobPath(3250, 380, 420 * k, 150 * k, 61 + i, 16)} />)}
      </g>

      {/* PASIR GEMBUR (medan lambat) */}
      {SANDS.map((s, i) => (
        <g key={i} className="nw-tz tm-tz" data-terrain="sand">
          <path d={s.blob} fill="#d9bf8c" opacity="0.5" stroke="#f3e2b8" strokeOpacity="0.4" strokeWidth="2" />
          {[-0.5, -0.15, 0.2, 0.5].map((k, j) => (
            <path key={j} d={`M${s.cx - s.rx * 0.5},${s.cy + s.ry * k * 1.2} q ${s.rx * 0.25},-18 ${s.rx * 0.5},0 t ${s.rx * 0.5},0`} fill="none" stroke="#a8875a" strokeOpacity="0.45" strokeWidth="2.4" />
          ))}
        </g>
      ))}

      {/* RAWA (medan lambat) */}
      {SWAMPS.map((s, i) => (
        <g key={i} className="nw-tz tm-tz" data-terrain="swamp">
          <path d={s.blob} fill="#2c4a36" opacity="0.82" stroke="#6b8f5b" strokeOpacity="0.5" strokeWidth="2.4" />
          {s.pools.map((p, j) => <ellipse key={j} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill="#3f7d7a" opacity="0.6" stroke="#9bd0c8" strokeOpacity="0.35" strokeWidth="1.5" />)}
          {s.reeds.map((p, j) => <path key={j} d={`M${p.x},${p.y} v-15 M${p.x - 4},${p.y} v-10 M${p.x + 4},${p.y} v-11`} stroke="#b7c58f" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />)}
        </g>
      ))}

      {/* JALAN */}
      <g fill="none" pointerEvents="none" strokeLinejoin="round">
        <path d={ROAD} stroke="#000" strokeWidth="30" opacity="0.35" />
        <path d={ROAD} stroke={P.road} strokeWidth="20" />
        <path d={ROAD} stroke={P.roadLine} strokeWidth="2.5" strokeDasharray="16 18" opacity="0.5" />
      </g>

      {/* SUNGAI — air alami: kedalaman berlapis, riak, kilau, busa tepi */}
      <g className="nw-tz tm-tz" data-terrain="river">
        <path d={RIVER} fill="none" stroke={P.bank} strokeWidth="170" strokeLinecap="round" opacity="0.3" />
        <path d={RIVER} fill="none" stroke={waterStroke} strokeWidth="124" strokeLinecap="round" opacity="0.32" />
        <path d={RIVER} fill="none" stroke="#0b1d3a" strokeWidth="96" strokeLinecap="round" opacity="0.92" />
        <path d={RIVER} fill="none" stroke={waterStroke} strokeWidth="84" strokeLinecap="round" opacity="0.62" />
        <path d={RIVER} fill="none" stroke="#06142b" strokeWidth="36" strokeLinecap="round" opacity="0.42" />
        {SHORE.map((d, i) => <path key={i} d={d} fill="none" stroke="#e0f2fe" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" opacity="0.4" />)}
        <g fill="none" stroke="#dbeafe" strokeWidth="2" strokeLinecap="round">
          {RIPPLES.map((r, i) => (
            <path key={i} d={`M${-r.w},0 q${r.w / 2},-4 ${r.w},0 t${r.w},0`} transform={`translate(${r.x.toFixed(0)} ${r.y.toFixed(0)}) rotate(${r.a.toFixed(0)})`} opacity={r.o} />
          ))}
        </g>
        <g stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
          {GLINTS.map((g, i) => <line key={i} className="tm-glint" x1={g.x} y1={g.y} x2={g.x + g.w} y2={g.y - 2} style={{ animationDelay: `${g.delay}s`, animationDuration: `${g.dur}s` }} />)}
        </g>
        {/* jembatan */}
        <rect x="2380" y="630" width="40" height="140" rx="4" fill={P.road} />
        <path d="M2380,632 V768 M2420,632 V768" stroke="#94a3b8" strokeWidth="2.4" />
        <path d="M2400,634 V766" stroke={P.roadLine} strokeWidth="2" strokeDasharray="10 12" opacity="0.5" />
      </g>

      {/* KAWAH BEKAS LEDAKAN (medan lambat) */}
      {CRATER_FIELDS.map((f, i) => (
        <g key={i} className="nw-tz tm-tz" data-terrain="crater">
          <ellipse cx={f.cx} cy={f.cy} rx={f.r * 1.35} ry={f.r * 0.95} fill="#000" opacity="0.12" stroke="#f59e0b" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="8 10" />
          {f.craters.map((c, j) => (
            <g key={j}>
              <ellipse cx={c.x + 3} cy={c.y + 4} rx={c.r * 1.1} ry={c.r * 0.8} fill="#000" opacity="0.3" />
              <ellipse cx={c.x} cy={c.y} rx={c.r} ry={c.r * 0.72} fill="#0b0f14" opacity="0.8" />
              <ellipse cx={c.x - 1.5} cy={c.y - 1.5} rx={c.r} ry={c.r * 0.72} fill="none" stroke="#a89884" strokeOpacity="0.55" strokeWidth="2.4" />
            </g>
          ))}
        </g>
      ))}

      {isDesert && (
        <g pointerEvents="none">
          <ellipse cx="1400" cy="400" rx="360" ry="100" fill="#a07a52" opacity="0.35" /><ellipse cx="1400" cy="400" rx="320" ry="70" fill="#c9a878" opacity="0.5" />
          <ellipse cx="3600" cy="240" rx="280" ry="80" fill="#a07a52" opacity="0.35" /><ellipse cx="3600" cy="240" rx="240" ry="56" fill="#c9a878" opacity="0.5" />
        </g>
      )}

      {/* HUTAN */}
      {showForest && FORESTS.map((f, fi) => (
        <g key={fi} className="nw-tz tm-tz" data-terrain="forest">
          <path d={f.blob} fill={P.under} opacity="0.9" />
          {f.trees.map((t, i) => {
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
          })}
        </g>
      ))}

      {/* HUTAN & GUNUNG PERLUASAN (atas/bawah peta) */}
      {!isDesert && !isUrban && EXT_FORESTS.map((f, fi) => (
        <g key={`xf${fi}`} className="nw-tz tm-tz" data-terrain="forest">
          <path d={f.blob} fill={P.under} opacity="0.9" />
          {f.trees.map((t, i) => {
            const c = P.tree[t.ci % P.tree.length];
            return isSnow ? (
              <g key={i}>
                <polygon points={`${t.x},${t.y - t.r * 1.7} ${t.x - t.r * 0.85},${t.y + t.r * 0.7} ${t.x + t.r * 0.85},${t.y + t.r * 0.7}`} fill={c} />
                <polygon points={`${t.x},${t.y - t.r * 1.7} ${t.x - t.r * 0.85},${t.y + t.r * 0.7} ${t.x},${t.y + t.r * 0.7}`} fill={P.treeHi} opacity="0.55" />
              </g>
            ) : (
              <g key={i}>
                <circle cx={t.x} cy={t.y} r={t.r} fill={c} />
                <circle cx={t.x - t.r * 0.3} cy={t.y - t.r * 0.35} r={t.r * 0.5} fill={P.treeHi} opacity="0.3" />
              </g>
            );
          })}
        </g>
      ))}
      <g className="nw-tz tm-tz" data-terrain="highland">
        {EXT_PEAKS.map(([x, by, w, h], i) => <Peak key={`xk${i}`} x={x} by={by} w={w} h={h} seed={800 + i} accent={accent} snowDepth={isSnow ? 0.45 : h > 200 ? 0.22 : 0.14} />)}
      </g>

      {/* PEGUNUNGAN */}
      <g className="nw-tz tm-tz" data-terrain="highland">
        {PEAKS.map(([x, by, w, h], i) => <Peak key={i} x={x} by={by} w={w} h={h} seed={31 + i} accent={accent} snowDepth={isSnow ? 0.45 : h > 180 ? 0.22 : 0.14} />)}
      </g>

      {/* KOTA */}
      <g className="nw-tz tm-tz" data-terrain="urban">
        <rect x="2170" y="400" width="470" height="220" rx="36" fill="#111827" opacity="0.55" />
        {CITY_CORE.map((b, i) => <Extruded key={i} x={b[0]} y={b[1]} w={b[2]} d={b[3]} h={b[4]} roof={P.roof[i % 3]} stroke={accent} win i={i} />)}
      </g>
      {isUrban && (
        <g className="nw-tz tm-tz" data-terrain="urban">
          {CITY_SPRAWL.map((b, i) => <Extruded key={i} x={b[0]} y={b[1]} w={b[2]} d={b[3]} h={b[4]} roof={P.roof[i % 3]} stroke={accent} win i={i + 1} />)}
        </g>
      )}

      {/* LABEL MEDAN: putih terang + outline gelap agar terbaca di semua latar */}
      <g pointerEvents="none" fontFamily="monospace" fontWeight="900" textAnchor="middle" fill="#f8fafc" stroke="#020617" strokeWidth="9" paintOrder="stroke" strokeLinejoin="round" opacity="0.92" letterSpacing="14" fontSize="46">
        <text dy="-68"><textPath href="#nw-river-path" startOffset="14%">SUNGAI</textPath></text>
        <text x="3250" y="505">PEGUNUNGAN</text>
        <text x="2400" y="335">KOTA</text>
        {showForest && <text x="1400" y="250">HUTAN</text>}
        <text x="1150" y="1055" fontSize="34" letterSpacing="10">RAWA</text>
        <text x="3500" y="905" fontSize="34" letterSpacing="10">RAWA</text>
      </g>
    </g>
  );
});

/* ───────────────────────── MARKAS, CAPTURE POINT, SUMBER DAYA ───────────────────────── */
type Owner = 'neutral' | 'contested' | 'attacker' | 'defender';
const RED = '#f43f5e';

const Headquarters = ({ x, y, color, fallen, name, sub, id }: { x: number; y: number; color: string; fallen: boolean; name: string; sub: string; id: string }) => {
  const c = fallen ? '#64748b' : color;
  const fy = fallen ? 42 : 0;
  return (
    <g className="nw-tz" data-terrain={id}>
      <circle cx={x} cy={y} r="215" fill={c} fillOpacity="0.05" />
      <circle className="tm-spin-slow" cx={x} cy={y} r="215" fill="none" stroke={c} strokeOpacity="0.45" strokeWidth="3" strokeDasharray="22 16" />
      <rect x={x - 150} y={y - 100} width="300" height="200" rx="14" fill="#0b1220" fillOpacity="0.62" stroke={c} strokeOpacity="0.75" strokeWidth="3" strokeDasharray="16 8" />
      <Extruded x={x - 125} y={y - 70} w={64} d={34} h={22} roof="#475569" stroke={c} />
      <Extruded x={x - 125} y={y + 30} w={64} d={34} h={22} roof="#475569" stroke={c} />
      <Extruded x={x + 60} y={y + 30} w={60} d={30} h={20} roof="#475569" stroke={c} />
      <Extruded x={x - 40} y={y - 20} w={80} d={44} h={36} roof="#64748b" stroke={c} />
      {/* helipad */}
      <circle cx={x + 85} cy={y - 48} r="30" fill="#111827" stroke={c} strokeWidth="2.4" />
      <text x={x + 85} y={y - 38} textAnchor="middle" fontSize="28" fontWeight="900" fill={c} fontFamily="monospace">H</text>
      {/* radar */}
      <circle cx={x - 20} cy={y + 62} r="16" fill="#111827" stroke={c} strokeWidth="2" />
      <g className="tm-spin"><path d={`M${x - 34},${y + 62} H${x - 6}`} stroke={c} strokeWidth="3" strokeLinecap="round" /></g>
      {/* menara jaga di sudut */}
      {[[-150, -100], [134, -100], [-150, 84], [134, 84]].map(([dx, dy], i) => <rect key={i} x={x + dx} y={y + dy} width="16" height="16" fill="#1f2937" stroke={c} strokeWidth="2" />)}
      {/* antena + bendera */}
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
      {/* label + integritas + kondisi menang */}
      <text x={x} y={y + 132} textAnchor="middle" fontSize="26" fontWeight="900" letterSpacing="3" fill={c} stroke="#000" strokeWidth="5" paintOrder="stroke" fontFamily="monospace">{name}</text>
      <rect x={x - 100} y={y + 142} width="200" height="9" rx="4.5" fill="#000" opacity="0.6" />
      <rect x={x - 100} y={y + 142} width={fallen ? 14 : 200} height="9" rx="4.5" fill={c} style={{ transition: 'width 1s ease' }} />
      <text x={x} y={y + 176} textAnchor="middle" fontSize="17" fontWeight="800" letterSpacing="2" fill="#e2e8f0" stroke="#000" strokeWidth="4" paintOrder="stroke" fontFamily="monospace">{fallen ? 'HQ DIREBUT' : sub}</text>
    </g>
  );
};

const CapturePoint = ({ x, y, name, main, owner, accent, id }: { x: number; y: number; name: string; main: boolean; owner: Owner; accent: string; id: string }) => {
  const col = owner === 'attacker' ? accent : owner === 'defender' ? RED : owner === 'contested' ? '#f97316' : main ? '#FFEB3B' : '#e5e7eb';
  const R = main ? 92 : 68;
  const circ = 2 * Math.PI * R;
  const prog = owner === 'neutral' ? 0 : owner === 'contested' ? 0.5 : 1;
  return (
    <g className="nw-tz" data-terrain={id}>
      <circle cx={x} cy={y} r={R} fill={col} fillOpacity="0.1" />
      <circle cx={x} cy={y} r={R} fill="none" stroke={col} strokeOpacity="0.4" strokeWidth="3" strokeDasharray="8 10" />
      <circle cx={x} cy={y} r={R} fill="none" stroke={col} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${circ * prog} ${circ}`} transform={`rotate(-90 ${x} ${y})`} style={{ transition: 'stroke-dasharray 1s ease' }} />
      {owner === 'contested' && <circle className="nw-a nw-ping" cx={x} cy={y} r={R * 0.6} fill="none" stroke={col} strokeWidth="3" />}
      <line x1={x} y1={y} x2={x} y2={y - 54} stroke="#e2e8f0" strokeWidth="3" />
      <polygon points={`${x},${y - 54} ${x + 36},${y - 45} ${x},${y - 36}`} fill={col} stroke="#000" strokeWidth="1.2" />
      <circle cx={x} cy={y} r="7" fill={col} stroke="#000" strokeWidth="2" />
      <text x={x} y={y + R + 26} textAnchor="middle" fontSize={main ? 24 : 20} fontWeight="900" letterSpacing="3" fill={col} stroke="#000" strokeWidth="5" paintOrder="stroke" fontFamily="monospace">{name}</text>
    </g>
  );
};

const ResourceNode = ({ x, y, name, owned, accent }: { x: number; y: number; name: string; owned: boolean; accent: string }) => {
  const col = owned ? accent : '#fbbf24';
  return (
    <g className="nw-tz" data-terrain="resource">
      <circle cx={x} cy={y} r="58" fill={col} fillOpacity="0.08" stroke={col} strokeOpacity="0.5" strokeWidth="3" strokeDasharray="6 8" />
      <rect x={x - 30} y={y - 6} width="26" height="20" fill="#78350f" stroke={col} strokeWidth="1.6" />
      <rect x={x - 2} y={y - 12} width="26" height="26" fill="#92400e" stroke={col} strokeWidth="1.6" />
      <rect x={x - 12} y={y + 12} width="18" height="22" rx="3" fill="#475569" stroke={col} strokeWidth="1.6" />
      <polygon points={`${x},${y - 56} ${x + 11},${y - 45} ${x},${y - 34} ${x - 11},${y - 45}`} fill={col} stroke="#000" strokeWidth="1.2" />
      <text x={x} y={y + 84} textAnchor="middle" fontSize="19" fontWeight="900" letterSpacing="2" fill={col} stroke="#000" strokeWidth="5" paintOrder="stroke" fontFamily="monospace">{name}</text>
    </g>
  );
};

const BasesLayer = memo(function BasesLayer({ accent, simPhase }: { accent: string; simPhase: SimPhase }) {
  const owner: Owner = simPhase === 'clash' ? 'contested' : simPhase === 'done' ? 'attacker' : 'neutral';
  return (
    <g>
      <Headquarters id="hqAttacker" x={HQ_ATK.x} y={HQ_ATK.y} color={accent} fallen={false} name="HQ PENYERANG" sub="SYARAT MENANG: REBUT HQ MUSUH" />
      <Headquarters id="hqDefender" x={HQ_DEF.x} y={HQ_DEF.y} color={RED} fallen={simPhase === 'done'} name="HQ BERTAHAN" sub="SYARAT MENANG: HANCURKAN PENYERANG" />
      {CAPTURE_POINTS.map((c) => <CapturePoint key={c.id} id={c.main ? 'objective' : 'capture'} x={c.x} y={c.y} name={c.name} main={c.main} owner={owner} accent={accent} />)}
      {RESOURCES.map((r) => <ResourceNode key={r.id} x={r.x} y={r.y} name={r.name} owned={simPhase === 'done'} accent={accent} />)}
    </g>
  );
});

/* ───────────────────────── LAYER UNIT & SIMULASI ───────────────────────── */
interface UnitsProps { accent: string; isSimulating: boolean; simPhase: SimPhase; atk: PlacedUnit[]; def: PlacedUnit[]; fogActive: boolean; playerSide: PlayerSide }

const UnitsLayer = memo(function UnitsLayer({ accent, isSimulating, simPhase, atk, def, fogActive, playerSide }: UnitsProps) {
  const mk = (p: PlacedUnit, i: number, hostile: boolean) => (
    <UnitMarker
      key={`${p.unit.group}-${p.unit.kind}-${i}`}
      x={p.x} y={p.y} kind={p.unit.kind}
      color={hostile ? RED : accent}
      quantity={p.unit.quantity}
      label={`${p.unit.label} ${formatUnitQuantity(p.unit.quantity)}`}
    />
  );
  const advance = isSimulating ? 'translate(400px, 160px)' : 'translate(0px, 0px)';
  const attackLineActive = simPhase === 'advance' || simPhase === 'clash';
  const done = simPhase === 'done';
  const mask = (hidden: boolean) => (hidden ? 'url(#tm-vision)' : undefined);

  return (
    <g>
      {atk.length > 0 && !done && (
        <path d="M 1700,610 Q 2200,540 2300,600" fill="none" stroke={accent} strokeWidth={attackLineActive ? 4.4 : 2.8} strokeDasharray="14 14" markerEnd="url(#nw-arrow)" opacity={attackLineActive ? 0.95 : 0.55} className="nw-flow" pointerEvents="none" />
      )}

      {/* PENYERANG — unit darat/udara maju; unit maritim tetap di jalur air */}
      <g mask={mask(fogActive && playerSide === 'defender')}>
        <g className="nw-tz" data-terrain="attacker">
          <g style={{ transform: advance, transition: 'transform 3s ease-in-out' }}>
            {atk.map((p, i) => (p.moves ? mk(p, i, false) : null))}
          </g>
          {atk.map((p, i) => (p.moves ? null : mk(p, i, false)))}
          {atk.length === 0 && <text x="1800" y="610" textAnchor="middle" fill={accent} fontSize="20" fontWeight="800" fontFamily="monospace">TIDAK ADA UNIT TERDATA</text>}
        </g>
      </g>

      {/* BERTAHAN — tersembunyi oleh Fog of War sampai terlihat sekutu */}
      <g mask={mask(fogActive && playerSide === 'attacker')}>
        <g className="nw-tz" data-terrain="defender" style={{ transition: 'opacity .8s, filter .8s', opacity: done ? 0.45 : 1, filter: done ? 'grayscale(1) brightness(.7)' : 'none' }}>
          {def.map((p, i) => mk(p, i, true))}
          {def.length === 0 && <text x="3000" y="730" textAnchor="middle" fill={RED} fontSize="20" fontWeight="800" fontFamily="monospace">TIDAK ADA UNIT TERDATA</text>}
        </g>
      </g>

      {simPhase === 'clash' && (
        <g pointerEvents="none">
          <circle className="nw-a nw-ping" cx="2490" cy="584" r="80" fill="none" stroke="#f97316" strokeWidth="6" />
          <circle className="nw-a nw-ping" cx="2490" cy="584" r="160" fill="none" stroke="#f97316" strokeWidth="3" style={{ animationDelay: '0.5s' }} />
          {([[2600, 700, 70], [2380, 500, 50], [2560, 590, 90]] as const).map(([x, y, r], i) => (
            <circle key={i} className="nw-pulse" cx={x} cy={y} r={r} fill="url(#tm-fire)" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
          <path className="tm-tracer" d="M 2480,520 L 2740,560 M 2480,660 L 2740,610" fill="none" stroke="#fde047" strokeWidth="3" strokeDasharray="14 34" />
          <path className="tm-tracer" d="M 2920,540 L 2540,580" fill="none" stroke="#fb7185" strokeWidth="3" strokeDasharray="14 34" />
        </g>
      )}
      {done && (
        <g pointerEvents="none">
          <ellipse cx="2560" cy="580" rx="120" ry="50" fill="#000" opacity="0.45" />
          <ellipse cx="2440" cy="520" rx="60" ry="24" fill="#000" opacity="0.4" />
          <ellipse cx="2640" cy="660" rx="70" ry="28" fill="#000" opacity="0.4" />
          <Smoke x={2560} y={560} n={5} />
        </g>
      )}
    </g>
  );
});

/* ───────────────────────── FOG OF WAR ───────────────────────── */
// Sumber pandang = unit pemain + HQ pemain. Hutan & area di balik pegunungan (lee zone) gelap total
// sampai ada unit sekutu mendekat (radius separuh). Musuh hanya tampil di dalam jangkauan pandang.
interface Src { x: number; y: number; r: number; moves: boolean }
const FogLayer = memo(function FogLayer({ sources, isSimulating, playerSide, showForest }: { sources: Src[]; isSimulating: boolean; playerSide: PlayerSide; showForest: boolean }) {
  const adv = isSimulating ? 'translate(400px, 160px)' : 'translate(0px, 0px)';
  const lee = playerSide === 'attacker' ? { cx: 3750, cy: 400 } : { cx: 2650, cy: 400 };
  const circles = (fill: string, k: number) => (
    <>
      {sources.filter((s) => !s.moves).map((s, i) => <circle key={`s${i}`} cx={s.x} cy={s.y} r={s.r * k} fill={fill} />)}
      <g style={{ transform: adv, transition: 'transform 3s ease-in-out' }}>
        {sources.filter((s) => s.moves).map((s, i) => <circle key={`m${i}`} cx={s.x} cy={s.y} r={s.r * k} fill={fill} />)}
      </g>
    </>
  );
  const M = { maskUnits: 'userSpaceOnUse' as const, x: -1000, y: -1000, width: 6800, height: 3400 };
  return (
    <g pointerEvents="none">
      <defs>
        <radialGradient id="tm-v-white"><stop offset="0" stopColor="#fff" /><stop offset="0.62" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <radialGradient id="tm-v-black"><stop offset="0" stopColor="#000" /><stop offset="0.62" stopColor="#000" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <mask id="tm-vision" {...M}><rect x={-1000} y={-1000} width={6800} height={3400} fill="#000" />{circles('url(#tm-v-white)', 1)}</mask>
        <mask id="tm-fog-wide" {...M}><rect x={-1000} y={-1000} width={6800} height={3400} fill="#fff" />{circles('url(#tm-v-black)', 1)}</mask>
        <mask id="tm-fog-near" {...M}><rect x={-1000} y={-1000} width={6800} height={3400} fill="#fff" />{circles('url(#tm-v-black)', 0.5)}</mask>
      </defs>
      {/* area belum terpantau: gelap tipis */}
      <rect x={-1000} y={-1000} width={6800} height={3400} fill="#02060d" opacity="0.5" mask="url(#tm-fog-wide)" />
      {/* kantong tertutup (hutan, balik gunung): gelap tebal + arsir, hilang saat didekati */}
      <g mask="url(#tm-fog-near)">
        {showForest && FORESTS.map((f, i) => (
          <g key={i}>
            <path d={f.blob} fill="#02060d" opacity="0.82" />
            <path d={f.blob} fill="url(#tm-hatch)" />
            <text x={f.cx} y={f.cy + 22} textAnchor="middle" fontSize="64" fontWeight="900" fill="#fff" opacity="0.45" fontFamily="monospace">?</text>
          </g>
        ))}
        <g>
          <ellipse cx={lee.cx} cy={lee.cy} rx="320" ry="170" fill="#02060d" opacity="0.82" />
          <ellipse cx={lee.cx} cy={lee.cy} rx="320" ry="170" fill="url(#tm-hatch)" />
          <text x={lee.cx} y={lee.cy + 22} textAnchor="middle" fontSize="64" fontWeight="900" fill="#fff" opacity="0.45" fontFamily="monospace">?</text>
        </g>
      </g>
    </g>
  );
});

/* ───────────────────────── LAYER ATMOSFER ───────────────────────── */
const EffectsLayer = memo(function EffectsLayer({ terrainType, accent }: { terrainType: TerrainType; accent: string }) {
  return (
    <g pointerEvents="none">
      <circle className="nw-flicker" cx="3070" cy="1000" r="10" fill="#f97316" filter="url(#nw-glow)" />
      <Smoke x={3070} y={992} />
      <Smoke x={2600} y={524} n={3} />

      {[[600, 300, 520, 150, 0], [2200, 860, 640, 170, -35], [3800, 520, 560, 140, -60]].map(([x, y, rx, ry, delay], i) => (
        <ellipse key={i} className="tm-cloud" cx={x} cy={y} rx={rx} ry={ry} fill="url(#tm-cloud)" style={{ animationDelay: `${delay}s` }} />
      ))}
      <ellipse className="nw-a nw-drift" cx="1400" cy="660" rx="700" ry="130" fill="url(#nw-fog)" style={{ animationDuration: '26s' }} />
      <ellipse className="nw-a nw-drift" cx="3200" cy="540" rx="600" ry="110" fill="url(#nw-fog)" style={{ animationDuration: '34s', animationDirection: 'alternate-reverse' }} />
      <ellipse className="nw-a nw-drift" cx="2400" cy="1040" rx="800" ry="120" fill="url(#nw-fog)" style={{ animationDuration: '40s' }} />
      <ellipse className="nw-a nw-drift" cx="4000" cy="800" rx="600" ry="100" fill="url(#nw-fog)" style={{ animationDuration: '45s' }} />

      {terrainType === 'snow' && PARTICLES.map((p, i) => <circle key={i} className="tm-fall" cx={p.x} cy={p.y} r={p.r} fill="#fff" opacity="0.7" style={{ animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />)}
      {terrainType === 'desert' && PARTICLES.slice(0, 40).map((p, i) => <ellipse key={i} className="tm-dust" cx={p.x} cy={p.y} rx={p.r * 14} ry={p.r * 0.9} fill="#e8d5a8" opacity="0.22" style={{ animationDuration: `${p.dur + 6}s`, animationDelay: `${p.delay}s` }} />)}

      <rect x={-600} y={-900} width={6000} height={3000} fill="url(#nw-sun)" style={{ mixBlendMode: 'screen' }} />
      <rect x={-600} y={-900} width={6000} height={3000} fill="url(#nw-vignette)" />
    </g>
  );
});

/* ───────────────────────── PENGGARIS KOORDINAT (overlay DOM di tepi layar) ───────────────────────── */
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
          {hv && <div className="absolute border" style={{ left: hv.left, top: hv.top, width: hv.size, height: hv.size, borderColor: `${accent}AA`, backgroundColor: `${accent}14` }} />}
          {sel && (
            <div className="absolute border-2" style={{ left: sel.left, top: sel.top, width: sel.size, height: sel.size, borderColor: '#FFEB3B', backgroundColor: 'rgba(255,235,59,0.12)' }}>
              <span className="absolute left-0.5 top-0.5 rounded bg-black/70 px-1 font-mono text-[10px] font-black text-[#FFEB3B]">{cellLabel(sel.c, sel.r)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
});

/* ───────────────────────── KOMPONEN PETA ───────────────────────── */
export const TacticalMap = memo(function TacticalMap({
  accent, water, terrainType, isSimulating, simPhase, attackerUnits, defenderUnits, viewBox,
  playerSide = 'attacker', fogEnabled = true,
}: MapProps) {
  const fogActive = fogEnabled && (simPhase === 'idle' || simPhase === 'advance');
  const showForest = terrainType !== 'desert' && terrainType !== 'urban';
  const atk = useMemo(() => layoutUnits(attackerUnits, false), [attackerUnits]);
  const def = useMemo(() => layoutUnits(defenderUnits, true), [defenderUnits]);
  const sources = useMemo<Src[]>(() => {
    const own = playerSide === 'attacker' ? atk : def;
    const hq = playerSide === 'attacker' ? HQ_ATK : HQ_DEF;
    return [...own.map((p) => ({ x: p.x, y: p.y, r: VISION[p.unit.group] ?? 380, moves: p.moves })), { x: hq.x, y: hq.y, r: 440, moves: false }];
  }, [atk, def, playerSide]);

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Peta taktis operasi"
    >
      <style>{MAP_CSS}</style>
      <Defs accent={accent} terrainType={terrainType} />
      <TerrainLayer accent={accent} water={water} terrainType={terrainType} />
      <GridOverlay accent={accent} />
      <BasesLayer accent={accent} simPhase={simPhase} />
      <UnitsLayer accent={accent} isSimulating={isSimulating} simPhase={simPhase} atk={atk} def={def} fogActive={fogActive} playerSide={playerSide} />
      {fogActive && <FogLayer sources={sources} isSimulating={isSimulating} playerSide={playerSide} showForest={showForest} />}
      <EffectsLayer terrainType={terrainType} accent={accent} />
    </svg>
  );
});