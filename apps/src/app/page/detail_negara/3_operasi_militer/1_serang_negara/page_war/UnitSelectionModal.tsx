'use client';

import React, { useEffect, useState } from 'react';
import { Boxes, Users, X } from 'lucide-react';
import type { UnitKind } from './units/unitIconProps';
import type { WarUnit } from './units/warUnitComposition';

export type UnitFacility = 'barak' | 'hangar' | 'gudang' | 'bandara';
export type FacilitySide = 'left' | 'right';
export type BattalionId = 'I' | 'II' | 'III';
export type BattalionSelection = Record<BattalionId, number>;
export type UnitSelection = Partial<Record<UnitKind, BattalionSelection>>;

const BATTALIONS: BattalionId[] = ['I', 'II', 'III'];

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
  bandara: [
    { kind: 'jetTempurSiluman', label: 'Jet Tempur Siluman' },
    { kind: 'jetTempurInterceptor', label: 'Jet Tempur Interceptor' },
    { kind: 'pesawatPengebom', label: 'Pesawat Pengebom' },
    { kind: 'helikopterSerang', label: 'Helikopter Serang' },
    { kind: 'pesawatPengintai', label: 'Pesawat Pengintai' },
    { kind: 'droneIntaiUav', label: 'Drone Intai UAV' },
    { kind: 'droneKamikaze', label: 'Drone Kamikaze' },
    { kind: 'pesawatAngkut', label: 'Pesawat Angkut' },
  ],
};

const FACILITY_TITLES: Record<UnitFacility, string> = {
  barak: 'Barak Militer',
  hangar: 'Hangar Tank',
  gudang: 'Gudang Senjata',
  bandara: 'Pangkalan Udara',
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
    Object.fromEntries(options.map(({ kind }) => [
      kind,
      selectedUnits[kind] ?? { I: 0, II: 0, III: 0 },
    ])),
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

  const distributeQuantity = (kind: UnitKind) => {
    const inventory = inventoryFor(kind);
    const baseQuantity = Math.floor(inventory / BATTALIONS.length);
    const remainder = inventory % BATTALIONS.length;
    const selection = Object.fromEntries(
      BATTALIONS.map((battalion, index) => [
        battalion,
        baseQuantity + (index < remainder ? 1 : 0),
      ]),
    ) as BattalionSelection;

    setDraft((current) => ({
      ...current,
      [kind]: selection,
    }));
  };

  const assignBattalionQuantity = (kind: UnitKind, battalion: BattalionId) => {
    const inventory = inventoryFor(kind);
    const battalionIndex = BATTALIONS.indexOf(battalion);
    const baseQuantity = Math.floor(inventory / BATTALIONS.length);
    const targetQuantity = baseQuantity + (battalionIndex < inventory % BATTALIONS.length ? 1 : 0);

    setDraft((current) => {
      const currentSelection = current[kind] ?? { I: 0, II: 0, III: 0 };
      const assignedElsewhere = BATTALIONS.reduce(
        (total, currentBattalion) =>
          total + (currentBattalion === battalion ? 0 : currentSelection[currentBattalion]),
        0,
      );
      const quantity = currentSelection[battalion] > 0
        ? 0
        : Math.min(targetQuantity, Math.max(0, inventory - assignedElsewhere));

      return {
        ...current,
        [kind]: {
          ...currentSelection,
          [battalion]: quantity,
        },
      };
    });
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
        className="w-full max-w-5xl overflow-hidden rounded-2xl border border-[#00FFAA]/50 bg-[#050B0B] text-white shadow-[0_0_40px_rgba(0,255,170,0.2)]"
        role="dialog"
      >
        <header className="flex items-center justify-between border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-5 py-4">
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
              <p className="mt-1 text-xs text-[#6B8A8A]">
                {side === 'left' ? 'Sisi kiri peta' : 'Sisi kanan peta'} · Atur pasukan untuk tiap batalyon
              </p>
            </div>
          </div>
          <button
            aria-label="Tutup modal"
            className="cursor-pointer rounded-lg p-2 text-[#6B8A8A] transition hover:bg-[#00FFAA]/10 hover:text-[#00FFAA]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[65vh] overflow-y-auto p-5">
          <div className="mb-4 rounded-lg border border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-2 text-center text-sm font-black uppercase tracking-wider text-[#00FFAA]">
            Formasi Detasemen
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {options.map(({ kind, label }) => {
              const inventory = inventoryFor(kind);
              const battalionSelection = draft[kind] ?? { I: 0, II: 0, III: 0 };
              const assignedTotal = BATTALIONS.reduce(
                (total, battalion) => total + battalionSelection[battalion],
                0,
              );
              const availableQuantity = Math.max(0, inventory - assignedTotal);
              return (
                <div
                  key={kind}
                  className="cursor-pointer rounded-xl border border-[#00FFAA]/25 bg-[#0A1A1A] p-4 shadow-[inset_0_0_22px_rgba(0,255,170,0.035)] transition hover:border-[#00FFAA]/50"
                >
                  <div className="mb-3 border-b border-[#00FFAA]/15 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <Users className="h-4 w-4 shrink-0" style={{ color: accent }} />
                        <span>{label}</span>
                      </div>
                      <button
                        className="shrink-0 cursor-pointer rounded-md border border-[#00FFAA]/30 bg-[#00FFAA]/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-[#00FFAA] transition hover:bg-[#00FFAA] hover:text-[#050B0B] disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={inventory <= 0}
                        onClick={() => distributeQuantity(kind)}
                        type="button"
                      >
                        Bagi rata
                      </button>
                    </div>
                    <div className="mt-2 flex justify-between gap-2 text-xs">
                      <span className="text-[#6B8A8A]">Tersedia: {formatQuantity(availableQuantity)}</span>
                      <span className="font-mono font-bold text-[#00FFAA]">
                        Dipilih: {formatQuantity(assignedTotal)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {BATTALIONS.map((battalion) => {
                      const quantity = battalionSelection[battalion];
                      return (
                        <button
                          key={battalion}
                          aria-pressed={quantity > 0}
                          aria-label={`Alokasikan pasukan untuk batalyon ${battalion}`}
                          className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-2 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FFAA] ${
                            quantity > 0
                              ? 'border-[#00FFAA]/60 bg-[#00FFAA]/10'
                              : 'border-[#00FFAA]/15 bg-[#071313] hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/5'
                          } disabled:cursor-not-allowed disabled:opacity-40`}
                          disabled={inventory <= 0 || (quantity <= 0 && availableQuantity <= 0)}
                          onClick={() => assignBattalionQuantity(kind, battalion)}
                          type="button"
                        >
                          <span className="flex h-8 w-9 items-center justify-center rounded-full border border-[#00FFAA]/40 bg-[#00FFAA]/10 text-xs font-black text-[#00FFAA] shadow-[0_0_10px_rgba(0,255,170,0.12)]">
                            {battalion}
                          </span>
                          <span aria-live="polite" className="font-mono text-sm font-bold text-white">
                            {formatQuantity(quantity)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-[#00FFAA]/20 bg-[#0A1A1A] px-5 py-4">
          <button
            className="cursor-pointer rounded-lg border border-[#00FFAA]/25 px-4 py-2 text-sm font-bold text-[#6B8A8A] transition hover:bg-[#00FFAA]/10 hover:text-[#00FFAA]"
            onClick={onClose}
            type="button"
          >
            Batal
          </button>
          <button
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-black text-[#050B0B] shadow-[0_0_18px_rgba(0,255,170,0.25)] transition hover:brightness-110"
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