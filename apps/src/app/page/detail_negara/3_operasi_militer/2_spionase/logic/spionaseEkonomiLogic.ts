import { calculateTotalTaxIncome } from '@/app/logic/economic_logic/treasuryUpdater';
import { applyNpcCountrySimulationState } from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import { countryPaths } from '@/app/page/map_system/mapDataAssets';

export interface SpionaseEconomicTaxIntel {
  id: string;
  label: string;
  rate: number;
}

export interface SpionaseEconomicIntelReport {
  targetCountry: string;
  budget: number;
  estimatedDailyTaxRevenue: number;
  taxRates: SpionaseEconomicTaxIntel[];
}

const TAX_FIELDS = [
  {
    id: 'income_tax',
    label: 'Pajak Penghasilan Pribadi',
    nestedKey: 'penghasilan',
    flatKey: 'income_tax',
    legacyKey: 'tarif_penghasilan',
  },
  {
    id: 'corporate_tax',
    label: 'Pajak Korporasi',
    nestedKey: 'korporasi',
    flatKey: 'corporate',
    legacyKey: 'tarif_korporasi',
  },
  {
    id: 'vat',
    label: 'Pajak Pertambahan Nilai (PPN)',
    nestedKey: 'ppn',
    flatKey: 'ppn',
    legacyKey: 'tarif_ppn',
  },
  {
    id: 'cigarette_tax',
    label: 'Cukai',
    nestedKey: 'bea_cukai',
    flatKey: 'cigarette_tax',
    legacyKey: 'tarif_bea_cukai',
  },
  {
    id: 'environment_tax',
    label: 'Pajak Lingkungan',
    nestedKey: 'lingkungan',
    flatKey: 'environment_tax',
    legacyKey: 'tarif_lingkungan',
  },
] as const;

function normalizeCountryName(name: unknown): string {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export async function collectSpionaseEconomicIntel(
  targetCountryName: string,
): Promise<SpionaseEconomicIntelReport | null> {
  const normalizedTarget = normalizeCountryName(targetCountryName);
  const countryPath = Object.entries(countryPaths as Record<string, string>).find(
    ([name]) => normalizeCountryName(name) === normalizedTarget,
  )?.[1];

  if (!countryPath) {
    console.error('[SpionaseEkonomi] Jalur data negara target tidak ditemukan.', {
      targetCountryName,
    });
    return null;
  }

  try {
    const response = await fetch(`/api/country-data?path=${encodeURIComponent(countryPath)}`);
    if (!response.ok) {
      console.error(`[SpionaseEkonomi] Gagal memuat data target (${response.status}).`, {
        targetCountryName,
      });
      return null;
    }

    const countryData = asRecord(await response.json());
    if (!countryData) {
      console.error('[SpionaseEkonomi] Data target memiliki format tidak valid.', {
        targetCountryName,
      });
      return null;
    }

    const targetDetail = applyNpcCountrySimulationState(countryData);
    const taxData = asRecord(targetDetail.pajak);
    const taxRates = TAX_FIELDS.map(field => {
      const nestedTax = asRecord(taxData?.[field.nestedKey]);
      const rate = Number(
        nestedTax?.tarif ??
        targetDetail[field.flatKey] ??
        targetDetail[field.legacyKey] ??
        0,
      );
      return {
        id: field.id,
        label: field.label,
        rate: Number.isFinite(rate) ? rate : 0,
      };
    });
    const budget = Number(targetDetail.anggaran);

    return {
      targetCountry: targetCountryName,
      budget: Number.isFinite(budget) ? budget : 0,
      estimatedDailyTaxRevenue: calculateTotalTaxIncome(targetDetail),
      taxRates,
    };
  } catch (error) {
    console.error('[SpionaseEkonomi] Gagal mengumpulkan laporan ekonomi target.', error);
    return null;
  }
}
