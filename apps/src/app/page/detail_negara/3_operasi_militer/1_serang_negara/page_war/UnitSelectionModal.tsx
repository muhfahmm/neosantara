'use client';

import React, { useEffect, useState } from 'react';
import { Boxes, Minus, Plus, Users, X } from 'lucide-react';
import type { UnitKind } from './units/unitIconProps';
import type { WarUnit } from './units/warUnitComposition';

export type UnitFacility = 'barak' | 'hangar' | 'gudang';
export type FacilitySide = 'left' | 'right';
export type UnitSelection = Partial<Record<UnitKind, number>>;

const FACILITY_OPTIONS: Record<UnitFacility, Array<{ kind: UnitKind; label: string }>> = {
  barak: [{ kind: 'infanteri', label: 'Infanteri' }],
  hangar: [
    { kind: 'tank', label: 'Tank Tempur Utama (MBT)' },
    { kind: 'apcIfv', label: 'APC / IFV' },
  ],
  gudang: [
    { kind: 'artileriBerat', label: 'Artileri Berat' },
    { kind: 'peluncurRoket', label: 'Sistem Peluncur Roket' },
    { kind: 'pertahananUdaraMobile', label: 'Pertahanan Udara Mobile' },
    { kind: 'kendaraanTaktis', label: 'Kendaraan Taktis' },
  ],
};

const FACILITY_TITLES: Record<UnitFacility, string> = {
  barak: 'Barak Militer',
  hangar: 'Hangar Tank',
  gudang: 'Gudang Senjata',
};

const formatQuantity = (quantity: number) =>
  quantity.toLocaleString('id-ID', { maximumFractionDigits: 0 });

interface UnitSelectionModalProps {
  facility: UnitFacility;
  side: FacilitySide;
  units: WarUnit[];
  selectedUnits: UnitSelection;
  accent: string;
  onClose: () => void;
  onConfirm: (selection: UnitSelection) => void;
}

export default function UnitSelectionModal({
  facility,
  side,
  units,
  selectedUnits,
  accent,
  onClose,
  onConfirm,
}: UnitSelectionModalProps) {
  const options = FACILITY_OPTIONS[facility];
  const [draft, setDraft] = useState<UnitSelection>(() =>
    Object.fromEntries(options.map(({ kind }) => [kind, selectedUnits[kind] ?? 0])),
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const inventoryFor = (kind: UnitKind) =>
    units.find((unit) => unit.kind === kind)?.quantity ?? 0;

  const updateQuantity = (kind: UnitKind, value: string) => {
    const inventory = inventoryFor(kind);
    const parsed = Number(value);
    const quantity = Number.isFinite(parsed)
      ? Math.max(0, Math.min(inventory, Math.floor(parsed)))
      : 0;
    setDraft((current) => ({ ...current, [kind]: quantity }));
  };

  return (
    <div
      className="fixed inset-0 z-[450] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="unit-selection-title"
        aria-modal="true"
        className="w-full max-w-lg overflow-hidden rounded-2xl border bg-slate-950 text-white shadow-2xl"
        role="dialog"
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className="rounded-xl border p-2"
              style={{ borderColor: `${accent}66`, backgroundColor: `${accent}18`, color: accent }}
            >
              <Boxes className="h-5 w-5" />
            </span>
            <div>
              <h2 id="unit-selection-title" className="font-black uppercase tracking-wider">
                {FACILITY_TITLES[facility]}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {side === 'left' ? 'Sisi kiri peta' : 'Sisi kanan peta'} · Pilih jumlah unit yang ditampilkan
              </p>
            </div>
          </div>
          <button
            aria-label="Tutup modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
          {options.map(({ kind, label }) => {
            const inventory = inventoryFor(kind);
            const quantity = draft[kind] ?? 0;
            return (
              <div
                key={kind}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div>
                  <label htmlFor={`unit-quantity-${kind}`} className="flex items-center gap-2 font-semibold">
                    <Users className="h-4 w-4" style={{ color: accent }} />
                    {label}
                  </label>
                  <p className="mt-1 pl-6 text-xs text-slate-400">
                    Tersedia: {formatQuantity(inventory)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label={`Kurangi ${label}`}
                    className="rounded-md border border-white/15 p-2 text-slate-300 disabled:opacity-40"
                    disabled={quantity <= 0}
                    onClick={() => updateQuantity(kind, String(quantity - 1))}
                    type="button"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    id={`unit-quantity-${kind}`}
                    aria-label={`Jumlah ${label}`}
                    className="w-28 rounded-md border border-white/15 bg-slate-900 px-2 py-2 text-right font-mono text-sm outline-none focus:border-current"
                    disabled={inventory <= 0}
                    max={inventory}
                    min={0}
                    onChange={(event) => updateQuantity(kind, event.target.value)}
                    type="number"
                    value={quantity}
                  />
                  <button
                    aria-label={`Tambah ${label}`}
                    className="rounded-md border border-white/15 p-2 text-slate-300 disabled:opacity-40"
                    disabled={quantity >= inventory}
                    onClick={() => updateQuantity(kind, String(quantity + 1))}
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
          <button
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            Batal
          </button>
          <button
            className="rounded-lg px-4 py-2 text-sm font-black text-slate-950 transition hover:brightness-110"
            onClick={() => onConfirm(draft)}
            style={{ backgroundColor: accent }}
            type="button"
          >
            Tampilkan Unit
          </button>
        </footer>
      </section>
    </div>
  );
}
