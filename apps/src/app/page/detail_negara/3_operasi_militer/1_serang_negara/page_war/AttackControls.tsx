'use client';

import React from 'react';
import { MoveRight, Swords, Undo2 } from 'lucide-react';
import type { WarUnit } from './units/warUnitComposition';

export type UnitCommandMode = 'move' | 'attack' | null;

interface AttackControlsProps {
  unit: WarUnit | null;
  mode: UnitCommandMode;
  attackRadius: number | null;
  accent: string;
  disabled?: boolean;
  onModeChange: (mode: UnitCommandMode) => void;
  onReturnToHangar?: () => void;
}

export default function AttackControls({
  unit,
  mode,
  attackRadius,
  accent,
  disabled = false,
  onModeChange,
  onReturnToHangar,
}: AttackControlsProps) {
  if (!unit) return null;

  const buttonClass = (active: boolean) =>
    `flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
      active ? 'text-slate-950' : 'bg-black/70 text-white hover:bg-white/10'
    }`;

  return (
    <div
      className="absolute bottom-16 left-4 z-30 flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-2 rounded-xl border border-white/15 bg-slate-950/90 p-2 shadow-xl backdrop-blur"
      onPointerDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      aria-label={`Perintah untuk ${unit.label}`}
    >
      <span className="px-1 text-xs font-bold text-white">
        {unit.label} · {unit.quantity.toLocaleString('id-ID')}
      </span>
      <button
        type="button"
        className={buttonClass(mode === 'move')}
        style={mode === 'move' ? { backgroundColor: accent, borderColor: accent } : { borderColor: `${accent}80` }}
        disabled={disabled}
        aria-pressed={mode === 'move'}
        onClick={() => onModeChange(mode === 'move' ? null : 'move')}
      >
        <MoveRight className="h-4 w-4" />
        Pindah
      </button>
      <button
        type="button"
        className={buttonClass(mode === 'attack')}
        style={mode === 'attack' ? { backgroundColor: '#fb7185', borderColor: '#fb7185' } : { borderColor: '#fb718580' }}
        disabled={disabled}
        aria-pressed={mode === 'attack'}
        onClick={() => onModeChange(mode === 'attack' ? null : 'attack')}
      >
        <Swords className="h-4 w-4" />
        Serang
      </button>
      {unit.group === 'udara' && onReturnToHangar && (
        <button
          type="button"
          className={buttonClass(false)}
          style={{ borderColor: `${accent}80` }}
          disabled={disabled}
          onClick={onReturnToHangar}
        >
          <Undo2 className="h-4 w-4" />
          Kembali ke Hangar
        </button>
      )}
      {mode === 'attack' && (
        <span className="w-full px-1 font-mono text-[10px] text-rose-200" aria-live="polite">
          {attackRadius === null
            ? 'Menghitung jangkauan serang...'
            : `Radius serang: ${Math.round(attackRadius).toLocaleString('id-ID')} unit peta · klik unit musuh atau klik kanan untuk menembak`}
        </span>
      )}
    </div>
  );
}
