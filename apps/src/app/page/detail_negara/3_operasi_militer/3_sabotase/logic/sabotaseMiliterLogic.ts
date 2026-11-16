import { applySabotageLosses, type SabotageUnitLoss } from '@/app/page/detail_negara/3_operasi_militer/covertEffectsLogic';
import {
  getArmadaPowerSummary,
  getArmadaUnitBreakdown,
} from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic';
import {
  applyNpcCountrySimulationState,
  getNpcCountrySimulationSnapshot,
  updateNpcCountrySimulationState,
} from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import { countryPaths } from '@/app/page/map_system/mapDataAssets';

function normalizeCountryName(name: unknown): string {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Mengurangi alutsista target dan menyimpan hasilnya ke simulasi NPC.
 */
export async function applySabotaseMiliterToTarget(
  targetCountryName: string,
  providedTargetDetail?: Record<string, unknown> | null,
): Promise<SabotageUnitLoss[]> {
  const normTarget = normalizeCountryName(targetCountryName);
  const simSnapshot = getNpcCountrySimulationSnapshot();
  const providedSlug = String(providedTargetDetail?.country_slug || '').trim().toLowerCase();
  let targetSlugFromSimulation: string | undefined;
  let targetDetail = providedTargetDetail ? { ...providedTargetDetail } : null;

  if (simSnapshot?.countries) {
    let simulatedTarget = providedSlug
      ? simSnapshot.countries[providedSlug]
      : undefined;
    if (simulatedTarget) {
      targetSlugFromSimulation = providedSlug;
    } else {
      for (const [slug, country] of Object.entries(simSnapshot.countries)) {
        if (
          normalizeCountryName(slug) === normTarget ||
          normalizeCountryName(country.country) === normTarget ||
          normalizeCountryName(country.name_id) === normTarget
        ) {
          targetSlugFromSimulation = slug;
          simulatedTarget = country;
          break;
        }
      }
    }

    if (targetSlugFromSimulation && simulatedTarget) {
      targetDetail = applyNpcCountrySimulationState({
        ...targetDetail,
        country_slug: targetSlugFromSimulation,
      });
    } else if (!targetDetail) {
      targetDetail = null;
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
        } else {
          console.error(`[SabotaseMiliter] Gagal memuat detail negara target (${res.status}).`);
        }
      } catch (error) {
        console.error('[SabotaseMiliter] Gagal memuat detail negara target.', error);
      }
    }
  }

  if (!targetDetail) {
    console.error('[SabotaseMiliter] Detail negara target tidak ditemukan.', {
      targetCountryName,
    });
    return [];
  }

  const breakdown = getArmadaUnitBreakdown(targetDetail);
  const equipment: Record<string, number> = {};
  for (const unit of breakdown) {
    equipment[unit.dataKey] = unit.quantity;
  }

  const { equipment: updatedEquipment, losses } = applySabotageLosses(equipment);
  if (losses.length === 0) {
    console.warn('[SabotaseMiliter] Tidak ada alutsista yang dapat disabotase.', {
      targetCountryName,
    });
    return [];
  }

  const matchedPathEntry = Object.entries(countryPaths as Record<string, string>).find(
    ([name]) => normalizeCountryName(name) === normTarget
  );
  const pathFilename = matchedPathEntry?.[1]?.split(/[\\/]/).pop()?.replace(/\.ts$/i, '') || '';
  const slugFromPath = pathFilename.replace(/^\d+_/, '').toLowerCase();

  const targetSlug = String(
    targetSlugFromSimulation ||
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

  const armyUpdates: Record<string, number> = {};

  for (const unit of breakdown) {
    const quantity = updatedEquipment[unit.dataKey];
    if (quantity === undefined) continue;

    const currentGroup = armada[unit.groupId];
    armada[unit.groupId] = {
      ...(currentGroup && typeof currentGroup === 'object'
        ? currentGroup as Record<string, unknown>
        : {}),
      [unit.dataKey]: quantity,
    };
    armada[unit.dataKey] = quantity;
    armyUpdates[unit.dataKey] = quantity;
  }

  const updatedTargetDetail = { ...targetDetail, ...armyUpdates, armada };
  const previousStrength = getArmadaPowerSummary(targetDetail).totals.totalPower;
  const reducedStrength = getArmadaPowerSummary(updatedTargetDetail).totals.totalPower;
  if (!(reducedStrength < previousStrength)) {
    console.error('[SabotaseMiliter] Kerugian alutsista tidak mengurangi kekuatan militer target.', {
      targetCountryName,
      previousStrength,
      reducedStrength,
    });
    return [];
  }

  if (!updateNpcCountrySimulationState(targetSlug, { ...armyUpdates, armada })) {
    console.error('[SabotaseMiliter] Kerugian tidak diterapkan: state simulasi negara target tidak ditemukan.', {
      targetCountryName,
      targetSlug,
    });
    return [];
  }

  const persistedTarget = getNpcCountrySimulationSnapshot()?.countries[targetSlug];
  if (!persistedTarget) {
    console.error('[SabotaseMiliter] State hasil sabotase tidak ditemukan setelah diperbarui.', {
      targetCountryName,
      targetSlug,
    });
    return [];
  }
  const persistedStrength = getArmadaPowerSummary({
    ...updatedTargetDetail,
    ...persistedTarget,
    country_slug: targetSlug,
  }).totals.totalPower;
  if (!(persistedStrength < previousStrength)) {
    console.error('[SabotaseMiliter] Kekuatan target tidak turun pada state simulasi setelah sabotase.', {
      targetCountryName,
      previousStrength,
      persistedStrength,
    });
    return [];
  }

  if (providedTargetDetail) {
    Object.assign(providedTargetDetail, armyUpdates, { armada });
  }

  return losses;
}
