import { getMilitaryResearchLevelBonus } from '@/app/page/bonus_logic/militaryResearchBonus';
import { applySabotageLosses, type SabotageUnitLoss } from '@/app/page/detail_negara/3_operasi_militer/covertEffectsLogic';
import { getArmadaUnitBreakdown } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic';
import {
  applyNpcCountrySimulationState,
  getNpcCountrySimulationSnapshot,
  updateNpcCountrySimulationState,
} from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import { countryPaths } from '@/app/page/map_system/mapDataAssets';

export interface SabotaseOperationResult {
  operation: 'sabotase';
  targetCountry: string;
  operationTarget?: string;
  successChance: number;
  succeeded: boolean;
  losses?: SabotageUnitLoss[];
}

export const SABOTASE_BASE_SUCCESS_CHANCE = 50;

export function getSabotaseSuccessChance(
  countryDetail?: Record<string, unknown> | null,
): number {
  const researchId = 'sabotase_terarah';
  const completedResearch = Array.isArray(countryDetail?.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(researchId)) return SABOTASE_BASE_SUCCESS_CHANCE;

  const researchLevels = countryDetail?.research_levels &&
    typeof countryDetail.research_levels === 'object'
    ? countryDetail.research_levels as Record<string, unknown>
    : {};
  const level = Number(researchLevels[researchId]) || 1;
  const researchBonus = getMilitaryResearchLevelBonus(researchId, level) || 0;

  return Math.min(100, SABOTASE_BASE_SUCCESS_CHANCE + researchBonus);
}

export function resolveSabotaseOperation(
  countryDetail?: Record<string, unknown> | null,
  operationTarget?: string,
): { operationTarget?: string; successChance: number; succeeded: boolean } {
  const successChance = getSabotaseSuccessChance(countryDetail);
  return {
    operationTarget,
    successChance,
    succeeded: Math.random() * 100 < successChance,
  };
}

const NPC_WAR_UNIT_GROUPS = {
  darat: [
    'pasukan_infanteri', 'tank_tempur_utama', 'apc_ifv', 'artileri_berat',
    'sistem_peluncur_roket', 'pertahanan_udara_mobile', 'kendaraan_taktis',
  ],
  laut: [
    'kapal_induk', 'kapal_induk_nuklir', 'kapal_destroyer', 'kapal_korvet',
    'kapal_selam_nuklir', 'kapal_selam_regular', 'kapal_ranjau', 'kapal_logistik',
  ],
  udara: [
    'jet_tempur_siluman', 'jet_tempur_interceptor', 'pesawat_pengebom',
    'helikopter_serang', 'pesawat_pengintai', 'drone_intai_uav',
    'drone_kamikaze', 'pesawat_angkut',
  ],
} as const;

function normalizeCountryName(name: unknown): string {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Logika khusus sabotase fasilitas & pabrik militer negara target:
 * Mengurangi alutsista mesin musuh sebesar 5% (minimal 1 per kategori yang ada, infanteri dikecualikan)
 * dan menyimpan armada yang berkurang langsung ke simulasi NPC.
 */
export async function applySabotaseMiliterToTarget(
  targetCountryName: string,
  providedTargetDetail?: Record<string, unknown> | null,
): Promise<SabotageUnitLoss[]> {
  let targetDetail = providedTargetDetail;
  const normTarget = normalizeCountryName(targetCountryName);

  if (!targetDetail) {
    const simSnapshot = getNpcCountrySimulationSnapshot();
    if (simSnapshot?.countries) {
      for (const [slug, cData] of Object.entries(simSnapshot.countries)) {
        if (
          normalizeCountryName(slug) === normTarget ||
          normalizeCountryName(cData.country) === normTarget ||
          normalizeCountryName(cData.name_id) === normTarget
        ) {
          targetDetail = { country_slug: slug, ...cData };
          break;
        }
      }
    }

    if (!targetDetail) {
      const relPath = Object.entries(countryPaths as Record<string, string>).find(
        ([name]) => normalizeCountryName(name) === normTarget
      )?.[1];

      if (relPath) {
        try {
          const res = await fetch(`/api/country-data?path=${encodeURIComponent(relPath)}`);
          if (res.ok) {
            targetDetail = applyNpcCountrySimulationState(await res.json());
          }
        } catch (e) {
          console.warn('[SabotaseMiliter] Gagal fetch detail negara target:', e);
        }
      }
    }
  }

  if (!targetDetail) {
    return [];
  }

  const breakdown = getArmadaUnitBreakdown(targetDetail);
  const equipment: Record<string, number> = {};
  for (const unit of breakdown) {
    equipment[unit.dataKey] = unit.quantity;
  }

  const { equipment: updatedEquipment, losses } = applySabotageLosses(equipment);
  if (losses.length === 0) {
    return [];
  }

  const matchedPathEntry = Object.entries(countryPaths as Record<string, string>).find(
    ([name]) => normalizeCountryName(name) === normTarget
  );
  const pathFilename = matchedPathEntry?.[1]?.split(/[\\/]/).pop()?.replace(/\.ts$/i, '') || '';
  const slugFromPath = pathFilename.replace(/^\d+_/, '').toLowerCase();

  const targetSlug = String(
    targetDetail.country_slug ||
    slugFromPath ||
    targetDetail.iso ||
    targetCountryName
  ).toLowerCase().trim();

  const armadaSource = (targetDetail.armada && typeof targetDetail.armada === 'object')
    ? targetDetail.armada as Record<string, unknown>
    : {};
  const armada: Record<string, unknown> = {
    ...armadaSource,
    darat: { ...((armadaSource.darat && typeof armadaSource.darat === 'object') ? armadaSource.darat as Record<string, unknown> : {}) },
    laut: { ...((armadaSource.laut && typeof armadaSource.laut === 'object') ? armadaSource.laut as Record<string, unknown> : {}) },
    udara: { ...((armadaSource.udara && typeof armadaSource.udara === 'object') ? armadaSource.udara as Record<string, unknown> : {}) },
  };

  const armadaGroups = {
    darat: armada.darat as Record<string, unknown>,
    laut: armada.laut as Record<string, unknown>,
    udara: armada.udara as Record<string, unknown>,
  };
  const armyUpdates: Record<string, number> = {};

  for (const [group, unitKeys] of Object.entries(NPC_WAR_UNIT_GROUPS)) {
    for (const unitKey of unitKeys) {
      if (updatedEquipment[unitKey] !== undefined) {
        const qty = updatedEquipment[unitKey];
        armyUpdates[unitKey] = qty;
        armadaGroups[group as keyof typeof armadaGroups][unitKey] = qty;
        armada[unitKey] = qty;
      }
    }
  }

  armada.darat = armadaGroups.darat;
  armada.laut = armadaGroups.laut;
  armada.udara = armadaGroups.udara;

  updateNpcCountrySimulationState(targetSlug, { ...armyUpdates, armada });
  Object.assign(targetDetail, armyUpdates, { armada });

  return losses;
}
