'use client';

import React, { memo, useCallback, useRef, useState, useEffect } from 'react';
import {
  Swords, Zap, X, Map as MapIcon, Sun, Mountain, Crosshair, Shield,
  Navigation, Radio, Waves, Building2, Target, Trees, Loader2
} from 'lucide-react';

export type TerrainType = 'default' | 'desert' | 'snow' | 'jungle' | 'urban';

interface PageWarProps {
  attackerName: string;
  targetName: string;
  onAutoResult: () => void;
  onClose?: () => void;
  terrainType?: TerrainType;
}

/* ───────────────────────── THEMES ───────────────────────── */
const THEMES = {
  default: { bgColor: '#0F172A', accent: '#00FFAA', accentRgb: '0, 255, 170', water: '#3b82f6', terrainName: 'Dataran Standar', gradient: 'radial-gradient(circle at 50% 45%, #22314a 0%, #0F172A 100%)' },
  desert:  { bgColor: '#27180C', accent: '#F59E0B', accentRgb: '245, 158, 11', water: '#22b8cf', terrainName: 'Gurun Pasir',    gradient: 'radial-gradient(circle at 50% 45%, #4a2b14 0%, #1A0E05 100%)' },
  snow:    { bgColor: '#0F172A', accent: '#38BDF8', accentRgb: '56, 189, 248', water: '#7dd3fc', terrainName: 'Tundra Salju',   gradient: 'radial-gradient(circle at 50% 45%, #1E3A8A 0%, #0F172A 100%)' },
  jungle:  { bgColor: '#052E16', accent: '#10B981', accentRgb: '16, 185, 129', water: '#2dd4bf', terrainName: 'Hutan Tropis',   gradient: 'radial-gradient(circle at 50% 45%, #065f46 0%, #022C22 100%)' },
  urban:   { bgColor: '#1F2937', accent: '#94A3B8', accentRgb: '148, 163, 184', water: '#60a5fa', terrainName: 'Zona Perkotaan', gradient: 'radial-gradient(circle at 50% 45%, #3f4b5e 0%, #111827 100%)' },
} as const;

/* ───────────────── DATA STATIS (dihitung sekali) ───────────────── */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GREENS = ['#064e3b', '#065f46', '#047857', '#166534', '#14532d', '#0f766e'];
type Tree = { x: number; y: number; r: number; c: string };

function makeForest(cx: number, cy: number, rx: number, ry: number, n: number, seed: number): Tree[] {
  const r = rng(seed);
  const out: Tree[] = [];
  while (out.length < n) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    out.push({ x: cx + Math.cos(a) * d * rx, y: cy + Math.sin(a) * d * ry, r: 6 + r() * 8, c: GREENS[Math.floor(r() * GREENS.length)] });
  }
  return out.sort((a, b) => a.y - b.y);
}

const FOREST_A = makeForest(240, 235, 140, 70, 46, 7);
const FOREST_B = makeForest(660, 510, 90, 42, 22, 21);
const RIVER = 'M -40,430 C 150,480 300,330 470,350 S 760,300 1040,420';

const PEAKS: [number, number, number, number][] = [
  [800, 150, 150, 125], [690, 170, 130, 95], [880, 200, 120, 90], [740, 215, 140, 100], [640, 225, 110, 70],
];

const BUILDINGS: [number, number, number, number, number][] = [
  [470, 262, 26, 22, 22], [505, 238, 30, 24, 34], [585, 252, 24, 20, 26], [600, 300, 20, 16, 16], [560, 322, 22, 18, 18],
];

/* ───────────────── INFO TOOLTIP ───────────────── */
type InfoId = 'river' | 'highland' | 'forest' | 'urban' | 'objective' | 'attacker' | 'defender';
type Tone = 'good' | 'bad' | 'neutral';
interface Info {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  name: string; tag: string; desc: string;
  stats: { k: string; v: string; tone: Tone }[];
}
const TONE: Record<Tone, string> = { good: 'text-emerald-300', bad: 'text-rose-300', neutral: 'text-gray-200' };

/* ───────────────── PETA SVG (memo) ───────────────── */
interface MapProps { accent: string; water: string; isSimulating: boolean }

const Peak = ({ x, by, w, h, accent }: { x: number; by: number; w: number; h: number; accent: string }) => (
  <g>
    <polygon points={`${x - w * 0.45},${by} ${x + w * 0.45},${by} ${x + w * 0.45 + h * 0.6},${by + h * 0.22} ${x + h * 0.55},${by + h * 0.3}`} fill="#000" opacity="0.4" filter="url(#nw-soft)" />
    <polygon points={`${x - w / 2},${by} ${x - w * 0.22},${by - h * 0.52} ${x},${by - h} ${x + w * 0.04},${by - h * 0.4} ${x - w * 0.02},${by}`} fill="url(#nw-mt-light)" stroke={accent} strokeOpacity="0.28" strokeWidth="1" />
    <polygon points={`${x},${by - h} ${x + w * 0.28},${by - h * 0.55} ${x + w / 2},${by} ${x - w * 0.02},${by} ${x + w * 0.04},${by - h * 0.4}`} fill="url(#nw-mt-dark)" />
    <polygon points={`${x},${by - h} ${x - w * 0.09},${by - h * 0.8} ${x - w * 0.04},${by - h * 0.84} ${x + w * 0.01},${by - h * 0.75} ${x + w * 0.06},${by - h * 0.83} ${x + w * 0.12},${by - h * 0.77}`} fill="#e2e8f0" opacity="0.85" />
  </g>
);

const Smoke = ({ x, y, n = 5 }: { x: number; y: number; n?: number }) => (
  <g filter="url(#nw-smoke-blur)" pointerEvents="none">
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} className="nw-a nw-smoke" cx={x + (i % 2) * 5} cy={y} r="9" fill="#475569" style={{ animationDelay: `${i * 1.2}s` }} />
    ))}
  </g>
);

const Unit = ({ x, y, kind, hostile, color, label, echelon }: { x: number; y: number; kind: 'tank' | 'heli'; hostile?: boolean; color: string; label?: string; echelon?: string }) => (
  <g>
    {kind === 'heli' && <ellipse cx={x + 8} cy={y + (hostile ? 36 : 30)} rx="13" ry="4" fill="#000" opacity="0.35" filter="url(#nw-soft)" />}
    {hostile ? (
      <polygon points={`${x},${y - 24} ${x + 28},${y} ${x},${y + 24} ${x - 28},${y}`} fill="#12060a" fillOpacity="0.75" stroke={color} strokeWidth="1.6" />
    ) : (
      <rect x={x - 24} y={y - 16} width="48" height="32" rx="3" fill="#050b14" fillOpacity="0.75" stroke={color} strokeWidth="1.6" />
    )}
    <use href={`#nw-ic-${kind}`} x={hostile ? x - 14 : x - 17} y={hostile ? y - 9 : y - 11} width={hostile ? 28 : 34} height={hostile ? 18 : 22} color={color} />
    {echelon && <text x={x} y={hostile ? y - 29 : y - 21} textAnchor="middle" fontSize="10" fontWeight="800" fill={color} fontFamily="monospace">{echelon}</text>}
    {label && (
      <text x={x} y={y + (hostile ? 40 : 30)} textAnchor="middle" fontSize="10" fontWeight="800" letterSpacing="1.5" fill={color} stroke="#000" strokeWidth="3" paintOrder="stroke" fontFamily="monospace">{label}</text>
    )}
  </g>
);

const TacticalMap = memo(function TacticalMap({ accent, water, isSimulating }: MapProps) {
  // Posisi unit attacker saat simulasi (bergerak maju)
  const attackerTranslate = isSimulating ? 'translate(120px, 80px)' : 'translate(0px, 0px)';

  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Peta taktis operasi">
      <defs>
        <filter id="nw-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="b" /><feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
        <filter id="nw-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="nw-smoke-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="nw-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" />
          <feColorMatrix type="saturate" values="0" />
        </filter>

        <linearGradient id="nw-mt-light" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#94a3b8" /><stop offset="1" stopColor="#475569" /></linearGradient>
        <linearGradient id="nw-mt-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#475569" /><stop offset="1" stopColor="#0f172a" /></linearGradient>
        <radialGradient id="nw-fog"><stop offset="0" stopColor="#cbd5e1" stopOpacity="0.5" /><stop offset="1" stopColor="#cbd5e1" stopOpacity="0" /></radialGradient>
        <radialGradient id="nw-sun" cx="0.2" cy="0.1" r="0.8"><stop offset="0" stopColor="#fff7e0" stopOpacity="0.22" /><stop offset="1" stopColor="#fff7e0" stopOpacity="0" /></radialGradient>
        <radialGradient id="nw-vignette" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
        <radialGradient id="nw-patch"><stop offset="0" stopColor={accent} stopOpacity="0.09" /><stop offset="1" stopColor={accent} stopOpacity="0" /></radialGradient>

        <symbol id="nw-ic-tank" viewBox="0 0 48 28">
          <rect x="4" y="18" width="36" height="7" rx="3.5" fill="currentColor" opacity="0.55" />
          {[9, 16, 23, 30, 37].map((cx) => <circle key={cx} cx={cx} cy="21.5" r="2.2" fill="currentColor" />)}
          <path d="M8 18 L11 11 H35 L39 18 Z" fill="currentColor" />
          <path d="M16 11 L18.5 5 H29 L31.5 11 Z" fill="currentColor" />
          <rect x="30" y="6.6" width="17" height="2.4" rx="1" fill="currentColor" />
        </symbol>
        <symbol id="nw-ic-heli" viewBox="0 0 48 30">
          <g className="nw-a nw-rotor"><ellipse cx="22" cy="6" rx="21" ry="1.5" fill="currentColor" opacity="0.8" /></g>
          <rect x="21" y="6" width="2" height="4" fill="currentColor" />
          <ellipse cx="22" cy="16" rx="12" ry="6" fill="currentColor" />
          <path d="M30 14 L46 11 V14.5 L32 19 Z" fill="currentColor" />
          <circle cx="46" cy="12.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M12 25 H30 M16 22 V25 M26 22 V25" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M11 14 Q13 11 17 11 V16 H11 Z" fill="#050b14" opacity="0.55" />
        </symbol>
      </defs>

      <ellipse cx="260" cy="230" rx="260" ry="170" fill="url(#nw-patch)" />
      <ellipse cx="780" cy="470" rx="240" ry="150" fill="url(#nw-patch)" />
      <rect width="1000" height="600" filter="url(#nw-grain)" opacity="0.07" style={{ mixBlendMode: 'overlay' }} />

      <g className="nw-tz" data-terrain="river">
        <path d={RIVER} fill="none" stroke="#000" strokeWidth="52" opacity="0.28" filter="url(#nw-soft)" />
        <path d={RIVER} fill="none" stroke="#0b1d3a" strokeWidth="34" strokeLinecap="round" opacity="0.9" />
        <path d={RIVER} fill="none" stroke={water} strokeWidth="24" strokeLinecap="round" opacity="0.7" filter="url(#nw-glow)" />
        <path d={RIVER} fill="none" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" strokeDasharray="18 22" opacity="0.7" className="nw-flow" />
        <path d={RIVER} fill="none" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="8 32" opacity="0.5" className="nw-flow-slow" transform="translate(0 6)" />
        <rect x="492" y="328" width="16" height="54" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
        <line x1="500" y1="330" x2="500" y2="380" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
      </g>

      {[FOREST_A, FOREST_B].map((forest, fi) => (
        <g key={fi} className="nw-tz" data-terrain="forest">
          <ellipse cx={fi ? 660 : 240} cy={fi ? 510 : 235} rx={fi ? 110 : 170} ry={fi ? 60 : 90} fill="transparent" />
          {forest.map((t, i) => (
            <g key={i}>
              <circle cx={t.x + 3} cy={t.y + 5} r={t.r} fill="#000" opacity="0.38" />
              <circle cx={t.x} cy={t.y} r={t.r} fill={t.c} />
              <circle cx={t.x - t.r * 0.3} cy={t.y - t.r * 0.35} r={t.r * 0.45} fill="#34d399" opacity="0.28" />
            </g>
          ))}
        </g>
      ))}

      <g className="nw-tz" data-terrain="highland">
        {PEAKS.map(([x, by, w, h], i) => <Peak key={i} x={x} by={by} w={w} h={h} accent={accent} />)}
      </g>

      <g className="nw-tz" data-terrain="urban">
        <rect x="455" y="225" width="170" height="125" fill="transparent" />
        {BUILDINGS.map(([x, y, w, d, h], i) => (
          <g key={i}>
            <polygon points={`${x},${y + d} ${x + w},${y + d} ${x + w + h * 0.6},${y + d + h * 0.25} ${x + h * 0.6},${y + d + h * 0.3}`} fill="#000" opacity="0.4" filter="url(#nw-soft)" />
            <rect x={x} y={y - h + d} width={w} height={h} fill="#1e293b" />
            <rect x={x} y={y - h} width={w} height={d} fill={i % 2 ? '#64748b' : '#475569'} stroke={accent} strokeOpacity="0.35" strokeWidth="0.8" />
            {[0, 1].map((row) =>
              Array.from({ length: Math.max(1, Math.floor(w / 9)) }, (_, c) => (
                <rect key={`${row}-${c}`} x={x + 3 + c * 8} y={y - h + d + 4 + row * 9} width="4" height="4" fill="#FFEB3B" opacity={(i + row + c) % 3 === 0 ? 0.15 : 0.6} />
              ))
            )}
          </g>
        ))}
      </g>

      <g className="nw-tz" data-terrain="objective">
        <circle cx="545" cy="292" r="30" fill="transparent" />
        <circle className="nw-a nw-ping" cx="545" cy="292" r="18" fill="none" stroke="#FFEB3B" strokeWidth="2" />
        <circle className="nw-a nw-ping" cx="545" cy="292" r="18" fill="none" stroke="#FFEB3B" strokeWidth="1" style={{ animationDelay: '1s' }} />
        <circle cx="545" cy="292" r="7" fill="#FFEB3B" filter="url(#nw-glow)" />
        <text x="562" y="285" fontSize="11" fontWeight="900" letterSpacing="2" fill="#FFEB3B" stroke="#000" strokeWidth="3" paintOrder="stroke" fontFamily="monospace">STRATEGIC POINT</text>
      </g>

      {/* Unit Penyerang bergerak mendekat saat simulasi */}
      <g className="nw-tz" data-terrain="attacker" style={{ transform: attackerTranslate, transition: 'transform 3s ease-in-out' }}>
        <circle cx="205" cy="120" r="78" fill={accent} fillOpacity="0.07" />
        <circle className="nw-a nw-spin" cx="205" cy="120" r="64" fill="none" stroke={accent} strokeOpacity="0.45" strokeWidth="1" strokeDasharray="6 10" />
        <Unit x={175} y={132} kind="tank" color={accent} />
        <Unit x={232} y={150} kind="tank" color={accent} />
        <Unit x={205} y={96} kind="heli" color={accent} label="ARMOR DIV" echelon="XX" />
      </g>

      <g className="nw-tz" data-terrain="defender">
        <circle cx="820" cy="455" r="82" fill="#f43f5e" fillOpacity="0.07" />
        <circle className="nw-a nw-ping" cx="820" cy="455" r="34" fill="none" stroke="#f43f5e" strokeWidth="1.2" />
        <Unit x={790} y={470} kind="tank" hostile color="#f43f5e" />
        <Unit x={850} y={438} kind="tank" hostile color="#f43f5e" label="DEF TANK" echelon="X" />
        <g className="nw-a nw-lock" opacity="0.85"><path d="M 805,500 H 835 M 820,485 V 515" stroke="#f43f5e" strokeWidth="1.6" /></g>
      </g>

      <circle className="nw-flicker" cx="735" cy="500" r="5" fill="#f97316" filter="url(#nw-glow)" />
      <Smoke x={735} y={496} />
      <Smoke x={600} y={262} n={3} />

      <g pointerEvents="none">
        <ellipse className="nw-a nw-drift" cx="330" cy="330" rx="260" ry="55" fill="url(#nw-fog)" style={{ animationDuration: '26s' }} />
        <ellipse className="nw-a nw-drift" cx="760" cy="270" rx="220" ry="45" fill="url(#nw-fog)" style={{ animationDuration: '34s', animationDirection: 'alternate-reverse' }} />
        <ellipse className="nw-a nw-drift" cx="520" cy="520" rx="300" ry="50" fill="url(#nw-fog)" style={{ animationDuration: '40s' }} />
        <rect width="1000" height="600" fill="url(#nw-sun)" style={{ mixBlendMode: 'screen' }} />
        <rect width="1000" height="600" fill="url(#nw-vignette)" />
      </g>
    </svg>
  );
});

/* ───────────────── KOMPONEN UTAMA ───────────────── */
const Corners = ({ c }: { c: string }) => (
  <>
    {['top-2 left-2 border-t-2 border-l-2', 'top-2 right-2 border-t-2 border-r-2', 'bottom-2 left-2 border-b-2 border-l-2', 'bottom-2 right-2 border-b-2 border-r-2'].map((p) => (
      <span key={p} className={`pointer-events-none absolute z-20 h-4 w-4 ${p}`} style={{ borderColor: c }} />
    ))}
  </>
);

export default function PageWar({ attackerName, targetName, onAutoResult, onClose, terrainType = 'default' }: PageWarProps) {
  const theme = THEMES[terrainType] ?? THEMES.default;
  const { accent, accentRgb } = theme;

  // State Simulasi
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPhase, setSimPhase] = useState<'idle' | 'advance' | 'clash' | 'done'>('idle');
  const [battleLogs, setBattleLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setBattleLogs(prev => [...prev, `[${new Date().toLocaleTimeString('id-ID', { hour12: false })}] ${msg}`]);
  };

  const handleStartSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setBattleLogs([]);
    setSimPhase('advance');
    addLog('Menginisiasi protokol serangan. Pasukan maju ke titik objektif.');

    // Fase 1: Maju (3 detik)
    setTimeout(() => {
      setSimPhase('clash');
      addLog('Kontak senjata! Terjadi baku tembak di area urban.');
      addLog('Artileri penyerang meluncurkan tembakan pendukung.');
      
      // Fase 2: Bentrok (3 detik)
      setTimeout(() => {
        setSimPhase('done');
        addLog('Garis pertahanan musuh hancur.');
        addLog('Menghitung kerugian unit dan hasil operasi...');

        // Fase 3: Selesai (2 detik sebelum pindah ke hasil)
        setTimeout(() => {
          onAutoResult();
        }, 2000);

      }, 3000);
    }, 3000);
  };

  const [hovered, setHovered] = useState<InfoId | null>(null);
  const lastId = useRef<InfoId>('objective');
  const tipRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);

  const INFO: Record<InfoId, Info> = {
    river:     { icon: Waves,     name: 'Sungai Deras',   tag: 'Rintangan alam',  desc: 'Arus kuat menahan kendaraan berat. Jembatan menjadi titik sempit.', stats: [{ k: 'Kecepatan', v: '-50%', tone: 'bad' }, { k: 'Pergerakan', v: 'Terhalang', tone: 'bad' }] },
    highland:  { icon: Mountain,  name: 'Dataran Tinggi', tag: 'Posisi bertahan', desc: 'Lereng curam menguntungkan pihak yang menguasai puncak.',          stats: [{ k: 'Pertahanan', v: '+25%', tone: 'good' }, { k: 'Kecepatan', v: '-50%', tone: 'bad' }] },
    forest:    { icon: Trees,     name: 'Hutan Lebat',    tag: 'Penyamaran',      desc: 'Kanopi rapat melindungi pasukan dari pengamatan udara.',          stats: [{ k: 'Pertahanan', v: '+15%', tone: 'good' }, { k: 'Visibilitas', v: '-20%', tone: 'bad' }] },
    urban:     { icon: Building2, name: 'Zona Urban',     tag: 'Medan kota',      desc: 'Gedung memecah formasi dan memaksa pertempuran jarak dekat.',     stats: [{ k: 'Mode tempur', v: 'CQC', tone: 'neutral' }] },
    objective: { icon: Target,    name: 'Titik Strategis', tag: 'Objektif utama', desc: 'Kuasai titik ini untuk memenangkan operasi.',                      stats: [{ k: 'Prioritas', v: 'Utama', tone: 'neutral' }] },
    attacker:  { icon: Swords,    name: attackerName,     tag: 'Pasukan penyerang', desc: 'Divisi lapis baja dengan dukungan helikopter serang.',           stats: [{ k: 'Satuan', v: 'Divisi (XX)', tone: 'neutral' }] },
    defender:  { icon: Shield,    name: targetName,       tag: 'Pasukan bertahan',  desc: 'Unit tank bertahan di sektor tenggara.',                          stats: [{ k: 'Satuan', v: 'Brigade (X)', tone: 'neutral' }] },
  };

  if (hovered) lastId.current = hovered;
  const info = INFO[hovered ?? lastId.current];
  const TipIcon = info.icon;

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isSimulating) return; // Nonaktifkan hover tooltip saat simulasi
    const box = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    const gx = Math.max(0, Math.min(999, Math.round((px / box.width) * 1000)));
    const gy = Math.max(0, Math.min(999, Math.round((py / box.height) * 1000)));
    if (coordRef.current) {
      coordRef.current.textContent = `X ${String(gx).padStart(3, '0')}  Y ${String(gy).padStart(3, '0')}  GRID ${String.fromCharCode(65 + Math.floor(gx / 100))}-${Math.floor(gy / 100) + 1}`;
    }
    const id = (e.target as Element).closest?.('[data-terrain]')?.getAttribute('data-terrain') as InfoId | null | undefined;
    setHovered(id ?? null);
    const tip = tipRef.current;
    if (tip) {
      const w = tip.offsetWidth, h = tip.offsetHeight;
      let x = px + 18, y = py + 18;
      if (x + w > box.width - 8) x = px - w - 18;
      if (y + h > box.height - 8) y = py - h - 18;
      tip.style.transform = `translate3d(${Math.max(8, x)}px, ${Math.max(8, y)}px, 0)`;
    }
  }, [isSimulating]);

  const panel = 'rounded-2xl border bg-black/30 p-4 shadow-xl backdrop-blur-md transition-colors duration-1000';

  return (
    <div className="fixed inset-0 z-[300] flex select-none flex-col justify-between overflow-hidden p-4 font-sans transition-colors duration-1000 sm:p-6" style={{ backgroundColor: theme.bgColor }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .nw-a{transform-box:fill-box;transform-origin:center}
        .nw-ping{animation:nw-ping 2.2s ease-out infinite}
        .nw-lock{animation:nw-lock 1.1s ease-in-out infinite}
        .nw-spin{animation:nw-spin 40s linear infinite}
        .nw-smoke{animation:nw-smoke 6s ease-out infinite;opacity:0}
        .nw-drift{animation:nw-drift 30s ease-in-out infinite alternate}
        .nw-rotor{animation:nw-rotor .18s linear infinite}
        .nw-flow{animation:nw-flow 2.4s linear infinite}
        .nw-flow-slow{animation:nw-flow 4.2s linear infinite}
        .nw-flicker{animation:nw-flicker 1.3s ease-in-out infinite}
        .nw-sweep{animation:nw-sweep 9s linear infinite}
        .nw-tz{cursor:crosshair;transition:filter .25s ease}
        .nw-tz:hover{filter:brightness(1.3) saturate(1.2) drop-shadow(0 0 6px var(--nw-accent))}
        @keyframes nw-ping{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.4);opacity:0}}
        @keyframes nw-lock{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(1.15);opacity:1}}
        @keyframes nw-spin{to{transform:rotate(360deg)}}
        @keyframes nw-sweep{to{transform:rotate(360deg)}}
        @keyframes nw-flow{to{stroke-dashoffset:-80}}
        @keyframes nw-smoke{0%{transform:translate(0,0) scale(.5);opacity:0}15%{opacity:.5}100%{transform:translate(26px,-95px) scale(2.6);opacity:0}}
        @keyframes nw-drift{from{transform:translateX(-50px)}to{transform:translateX(70px)}}
        @keyframes nw-flicker{0%,100%{opacity:.9}40%{opacity:.5}70%{opacity:1}}
        @keyframes nw-rotor{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.55)}}
        @media (prefers-reduced-motion:reduce){.nw-a,.nw-flow,.nw-flow-slow,.nw-sweep,.nw-flicker{animation:none!important}}
      ` }} />

      {/* HEADER */}
      <div className="relative z-10 flex shrink-0 items-center justify-between border-b pb-3 transition-colors duration-1000" style={{ borderColor: `${accent}4D` }}>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border p-2.5 transition-colors duration-1000" style={{ backgroundColor: `${accent}15`, borderColor: `${accent}66`, color: accent, boxShadow: `0 0 20px rgba(${accentRgb}, 0.2)` }}>
            <Swords className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-base font-black uppercase leading-none tracking-widest transition-colors duration-1000 sm:text-lg" style={{ color: accent }}>Tactical Command Center</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-300 sm:text-xs">
              Operasi Militer: {attackerName} <span className="mx-1 text-rose-500">VS</span> {targetName}
              <span className="ml-2 rounded border bg-black/40 px-2 py-0.5 text-[9px]" style={{ borderColor: `${accent}80`, color: accent }}>{theme.terrainName}</span>
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} disabled={isSimulating} aria-label="Tutup" className={`rounded-xl border p-2.5 transition-colors focus-visible:outline focus-visible:outline-2 ${isSimulating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'}`} style={{ borderColor: `${accent}4D`, color: accent }}>
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* AREA PETA */}
      <div className="relative z-10 my-4 flex min-h-0 flex-1 gap-4">
        {/* HUD KIRI */}
        <div className="hidden w-[280px] shrink-0 flex-col gap-3 lg:flex">
          <div className={panel} style={{ borderColor: `${accent}4D` }}>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider" style={{ color: accent }}><Radio className="h-4 w-4 animate-pulse" /> Status Operasi</h3>
            <div className="space-y-2 text-[10px] font-bold">
              <div className="flex justify-between"><span className="text-gray-400">Cuaca</span><span className="flex items-center gap-1 text-gray-100"><Sun size={12} /> Cerah</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Topografi</span><span className="text-gray-100">{theme.terrainName}</span></div>
            </div>
          </div>

          <div className={`${panel} flex-1`} style={{ borderColor: `${accent}4D` }}>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider" style={{ color: accent }}><Shield className="h-4 w-4" /> Legenda & Intel</h3>
            <div className="space-y-3 text-[10px] font-bold text-gray-300">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-emerald-400/40 bg-emerald-800" /> Hutan Lebat (+15% Def)</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 border border-slate-400/40 bg-gradient-to-b from-slate-400 to-slate-800" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} /> Dataran Tinggi (+25% Def)</div>
              <div className="flex items-center gap-2"><span className="h-1.5 w-3 rounded-full" style={{ backgroundColor: theme.water }} /> Sungai (-50% Speed)</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#FFEB3B] shadow-[0_0_8px_#FFEB3B]" /> Objektif Utama</div>
              <div className="my-1 h-px bg-white/10" />
              <div className="flex items-center gap-2"><span className="h-3 w-4 rounded-sm border" style={{ borderColor: accent }} /> Pasukan sendiri</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rotate-45 border border-rose-500" /> Pasukan musuh</div>
            </div>
          </div>

          {/* BATTLE LOG SELAMA SIMULASI */}
          {isSimulating && (
            <div className={`${panel} flex flex-col h-48 border-rose-500/50`} style={{ borderColor: `rgba(244, 63, 94, 0.5)` }}>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-400">
                <Target className="h-4 w-4 animate-pulse" /> Live Battle Log
              </h3>
              <div className="flex-1 overflow-y-auto font-mono text-[9px] text-gray-300 space-y-1 scrollbar-thin scrollbar-thumb-rose-500/50 pr-2">
                {battleLogs.map((log, i) => (
                  <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PETA */}
        <div
          className={`relative flex-1 overflow-hidden rounded-2xl border shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] transition-colors duration-1000 ${isSimulating ? 'cursor-wait' : 'cursor-crosshair'}`}
          style={{ background: theme.gradient, borderColor: isSimulating ? '#f43f5e' : `${accent}4D`, ['--nw-accent' as string]: accent }}
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
        >
          <TacticalMap accent={accent} water={theme.water} isSimulating={isSimulating} />

          {/* Efek Ledakan / Tembakan saat Fase Clash */}
          {simPhase === 'clash' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 600">
              <circle cx="545" cy="292" r="40" fill="none" stroke="#f97316" strokeWidth="4" className="animate-ping" />
              <circle cx="545" cy="292" r="80" fill="none" stroke="#f97316" strokeWidth="2" className="animate-ping" style={{ animationDelay: '0.5s' }} />
              <circle cx="600" cy="350" r="30" fill="#f97316" filter="url(#nw-glow)" className="animate-pulse" opacity="0.6" />
              <circle cx="490" cy="250" r="20" fill="#ef4444" filter="url(#nw-glow)" className="animate-pulse" opacity="0.6" style={{ animationDelay: '0.3s' }} />
            </svg>
          )}

          {/* Overlay saat Simulasi Aktif (Redupkan layar sedikit) */}
          {isSimulating && (
            <div className="absolute inset-0 bg-black/10 pointer-events-none transition-opacity duration-1000" />
          )}

          {/* Sapuan radar */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2" aria-hidden>
            <div className="nw-sweep h-full w-full rounded-full" style={{ background: `conic-gradient(from 0deg, rgba(${accentRgb},0) 0deg, rgba(${accentRgb},0.16) 50deg, rgba(${accentRgb},0) 52deg)` }} />
          </div>
          <Corners c={isSimulating ? '#f43f5e' : accent} />

          {/* TOOLTIP (Sembunyikan saat simulasi) */}
          {!isSimulating && (
            <div
              ref={tipRef}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-30 w-[230px] rounded-md border bg-black/80 backdrop-blur-md transition-opacity duration-150"
              style={{ opacity: hovered ? 1 : 0, borderColor: `${accent}80`, boxShadow: `0 0 18px rgba(${accentRgb}, 0.25), inset 0 0 20px rgba(${accentRgb}, 0.06)`, willChange: 'transform' }}
            >
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

          {/* HUD koordinat */}
          <div className="pointer-events-none absolute bottom-5 left-6 z-20 flex items-center gap-4 rounded bg-black/60 px-2 py-1 font-mono text-[9px] backdrop-blur-sm" style={{ color: isSimulating ? '#f43f5e' : accent }}>
            <span ref={coordRef}>X 000  Y 000  GRID A-1</span>
            <span className="flex items-center gap-1"><Navigation size={10} /> N 45°</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 flex shrink-0 flex-col items-center justify-between gap-3 pt-3 sm:flex-row">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest sm:text-xs" style={{ color: isSimulating ? '#f43f5e' : accent }}>
          <MapIcon className="h-4 w-4" /> {isSimulating ? 'Simulasi Pertempuran Sedang Berlangsung...' : 'Pilih Target & Modifikasi Strategi Sebelum Memulai'}
        </div>
        <div className="flex w-full gap-3 sm:w-auto">
          <button 
            onClick={onAutoResult} 
            disabled={isSimulating}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border border-[#FFEB3B]/50 bg-[#FFEB3B]/10 px-6 py-3 text-xs font-black uppercase tracking-widest text-[#FFEB3B] transition-all sm:w-auto ${isSimulating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#FFEB3B]/20'}`}
          >
            <Crosshair className="h-4 w-4" /> Hasil Otomatis
          </button>
          
          <button
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className={`group flex w-full transform items-center justify-center gap-2 rounded-xl px-8 py-3 text-xs font-black uppercase tracking-widest transition-all sm:w-auto ${
              isSimulating ? 'opacity-70 cursor-wait scale-100' : 'cursor-pointer hover:scale-105'
            }`}
            style={{ backgroundColor: isSimulating ? '#f43f5e' : accent, color: '#050B0B', boxShadow: `0 0 20px rgba(${isSimulating ? '244, 63, 94' : accentRgb}, 0.4)` }}
          >
            {isSimulating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Menyimulasikan...</>
            ) : (
              <><Zap className="h-4 w-4 fill-current transition-transform group-hover:rotate-12" /> Mulai Simulasi</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}