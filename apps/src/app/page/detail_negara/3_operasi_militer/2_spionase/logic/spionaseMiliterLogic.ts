import { applyNpcCountrySimulationState } from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import { getArmadaUnitBreakdown } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic';
import { countryPaths } from '@/app/page/map_system/mapDataAssets';

export type SpionaseMilitaryGroupId = 'darat' | 'udara' | 'laut';

export interface SpionaseMilitaryUnitIntel {
  unitKey: string;
  quantity: number;
  totalPower: number;
  totalHealth: number;
}

export interface SpionaseMilitaryGroupIntel {
  totalUnits: number;
  totalPower: number;
  totalHealth: number;
  units: SpionaseMilitaryUnitIntel[];
}

export interface SpionaseMilitaryIntelReport {
  targetCountry: string;
  totalUnits: number;
  totalPower: number;
  totalHealth: number;
  groups: Record<SpionaseMilitaryGroupId, SpionaseMilitaryGroupIntel>;
}

function normalizeCountryName(name: unknown): string {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export async function collectSpionaseMilitaryIntel(
  targetCountryName: string,
): Promise<SpionaseMilitaryIntelReport | null> {
  const normalizedTarget = normalizeCountryName(targetCountryName);
  const countryPath = Object.entries(countryPaths as Record<string, string>).find(
    ([name]) => normalizeCountryName(name) === normalizedTarget,
  )?.[1];

  if (!countryPath) {
    console.error('[SpionaseMiliter] Jalur data negara target tidak ditemukan.', {
      targetCountryName,
    });
    return null;
  }

  try {
    const response = await fetch(`/api/country-data?path=${encodeURIComponent(countryPath)}`);
    if (!response.ok) {
      console.error(`[SpionaseMiliter] Gagal memuat data target (${response.status}).`, {
        targetCountryName,
      });
      return null;
    }

    const countryData: unknown = await response.json();
    if (!countryData || typeof countryData !== 'object' || Array.isArray(countryData)) {
      console.error('[SpionaseMiliter] Data target memiliki format tidak valid.', {
        targetCountryName,
      });
      return null;
    }

    const targetDetail = applyNpcCountrySimulationState(countryData as Record<string, unknown>);
    const groups: Record<SpionaseMilitaryGroupId, SpionaseMilitaryGroupIntel> = {
      darat: { totalUnits: 0, totalPower: 0, totalHealth: 0, units: [] },
      udara: { totalUnits: 0, totalPower: 0, totalHealth: 0, units: [] },
      laut: { totalUnits: 0, totalPower: 0, totalHealth: 0, units: [] },
    };

    for (const unit of getArmadaUnitBreakdown(targetDetail)) {
      if (
        unit.quantity <= 0 ||
        (unit.groupId !== 'darat' && unit.groupId !== 'udara' && unit.groupId !== 'laut')
      ) continue;
      const groupId = unit.groupId;
      const group = groups[groupId];
      const unitIntel = {
        unitKey: unit.dataKey,
        quantity: unit.quantity,
        totalPower: unit.totalPower,
        totalHealth: unit.totalHealth,
      };

      group.units.push(unitIntel);
      group.totalUnits += unit.quantity;
      group.totalPower += unit.totalPower;
      group.totalHealth += unit.totalHealth;
    }

    const groupValues = Object.values(groups);
    return {
      targetCountry: targetCountryName,
      totalUnits: groupValues.reduce((total, group) => total + group.totalUnits, 0),
      totalPower: groupValues.reduce((total, group) => total + group.totalPower, 0),
      totalHealth: groupValues.reduce((total, group) => total + group.totalHealth, 0),
      groups,
    };
  } catch (error) {
    console.error('[SpionaseMiliter] Gagal mengumpulkan laporan militer target.', error);
    return null;
  }
}
