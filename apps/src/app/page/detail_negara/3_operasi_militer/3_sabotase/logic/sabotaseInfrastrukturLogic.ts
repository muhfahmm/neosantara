import { applyNpcCountrySimulationState, getNpcCountrySimulationSnapshot, updateNpcCountrySimulationState } from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import { MINERAL_SDA_BUILDING_KEYS } from '@/app/logic/1_minerals_logic/mineralSdaLogic';
import { countryPaths } from '@/app/page/map_system/mapDataAssets';
import { ELECTRICITY_PLANT_KEYS } from '@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/consumptionLogic';
import type { SabotageUnitLoss } from '@/app/page/detail_negara/3_operasi_militer/covertEffectsLogic';

const SABOTAGE_BUILDING_LOSS_RATE = 0.05;
const SABOTAGE_MINIMUM_BUILDING_LOSS = 1;
const SABOTAGE_INFRASTRUCTURE_BUILDINGS: readonly string[] = [
  ...ELECTRICITY_PLANT_KEYS,
  ...MINERAL_SDA_BUILDING_KEYS,
];

function normalizeCountryName(name: unknown): string {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function calculateSabotaseBuildingDamage(
  countryDetail: Readonly<Record<string, unknown>>,
  buildingKeys: readonly string[],
): { updates: Record<string, number>; losses: SabotageUnitLoss[] } {
  const updates: Record<string, number> = {};
  const losses: SabotageUnitLoss[] = [];

  for (const buildingKey of buildingKeys) {
    const rawQuantity = Number(countryDetail[buildingKey] ?? 0);
    if (!Number.isFinite(rawQuantity) || rawQuantity <= 0) continue;

    const previousQuantity = Math.floor(rawQuantity);
    if (previousQuantity <= 0) continue;

    const lostQuantity = Math.min(
      previousQuantity,
      Math.max(
        SABOTAGE_MINIMUM_BUILDING_LOSS,
        Math.floor(previousQuantity * SABOTAGE_BUILDING_LOSS_RATE),
      ),
    );
    const remainingQuantity = previousQuantity - lostQuantity;
    updates[buildingKey] = remainingQuantity;
    losses.push({
      unitKey: buildingKey,
      previousQuantity,
      lostQuantity,
      remainingQuantity,
    });
  }

  return { updates, losses };
}

export function calculateSabotaseInfrastructureDamage(
  countryDetail: Readonly<Record<string, unknown>>,
) {
  return calculateSabotaseBuildingDamage(countryDetail, SABOTAGE_INFRASTRUCTURE_BUILDINGS);
}

export async function applySabotaseBuildingDamageToTarget(
  targetCountryName: string,
  buildingKeys: readonly string[],
  providedTargetDetail?: Record<string, unknown> | null,
): Promise<SabotageUnitLoss[]> {
  const normalizedTarget = normalizeCountryName(targetCountryName);
  const matchedPath = Object.entries(countryPaths as Record<string, string>).find(
    ([name]) => normalizeCountryName(name) === normalizedTarget,
  )?.[1];
  let targetDetail = providedTargetDetail
    ? applyNpcCountrySimulationState(providedTargetDetail)
    : null;

  if (!targetDetail && matchedPath) {
    try {
      const response = await fetch(`/api/country-data?path=${encodeURIComponent(matchedPath)}`);
      if (!response.ok) {
        console.error(`[SabotaseBangunan] Gagal memuat detail target (${response.status}).`);
        return [];
      }

      const result: unknown = await response.json();
      if (!result || typeof result !== 'object' || Array.isArray(result)) {
        console.error('[SabotaseBangunan] Data target memiliki format tidak valid.');
        return [];
      }
      targetDetail = applyNpcCountrySimulationState(result as Record<string, unknown>);
    } catch (error) {
      console.error('[SabotaseBangunan] Gagal memuat detail negara target.', error);
      return [];
    }
  }

  if (!targetDetail) {
    console.error('[SabotaseBangunan] Detail negara target tidak ditemukan.', {
      targetCountryName,
    });
    return [];
  }

  const filename = matchedPath?.split(/[\\/]/).pop()?.replace(/\.ts$/i, '') || '';
  const slugFromPath = filename.replace(/^\d+_/, '').toLowerCase();
  const targetSlug = String(
    targetDetail.country_slug || slugFromPath || targetDetail.iso || '',
  ).trim().toLowerCase();
  if (!targetSlug) {
    console.error('[SabotaseBangunan] Slug negara target tidak ditemukan.', {
      targetCountryName,
    });
    return [];
  }

  const { updates, losses } = calculateSabotaseBuildingDamage(targetDetail, buildingKeys);
  if (losses.length === 0) {
    console.warn('[SabotaseBangunan] Target tidak memiliki bangunan pada kategori sabotase.');
    return [];
  }

  if (!updateNpcCountrySimulationState(targetSlug, updates)) {
    console.error('[SabotaseBangunan] Kerusakan tidak diterapkan ke simulasi NPC.', {
      targetCountryName,
      targetSlug,
    });
    return [];
  }

  const persistedTarget = getNpcCountrySimulationSnapshot()?.countries[targetSlug];
  if (!persistedTarget || losses.some(
    loss => Number(persistedTarget[loss.unitKey]) !== loss.remainingQuantity,
  )) {
    console.error('[SabotaseBangunan] Kerusakan bangunan tidak tersimpan pada state NPC.', {
      targetCountryName,
      targetSlug,
    });
    return [];
  }

  if (providedTargetDetail) Object.assign(providedTargetDetail, updates);
  return losses;
}

export function applySabotaseInfrastrukturToTarget(
  targetCountryName: string,
  providedTargetDetail?: Record<string, unknown> | null,
): Promise<SabotageUnitLoss[]> {
  return applySabotaseBuildingDamageToTarget(
    targetCountryName,
    SABOTAGE_INFRASTRUCTURE_BUILDINGS,
    providedTargetDetail,
  );
}
