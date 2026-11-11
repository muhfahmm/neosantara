import { applyWarLossesToUserArmada } from '../war_algoritm/battleEngine';
import { generateInvasionNews } from '@/app/page/menus/news/logic/1_berita_invasi/beritaInvasiLogic';
import { generateResourceLootNews } from '@/app/page/menus/news/logic/3_berita_pengambilan_sda/beritaPengambilanSDALogic';
import type { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import {
  getNpcCountrySimulationSnapshot,
  updateNpcCountrySimulationState,
} from '@/app/logic/npc_country_simulation/npcCountrySimulation';

const LOOTED_RESOURCES = { emas: 500, minyak_bumi: 1000, beras: 2000 };

export function lootUserProductionInventory(
  countryDetail: Record<string, unknown>,
  currentDateStr: string,
): { updatedDetail: Record<string, unknown>; lootedSummaryText: string } {
  const nextDetail = JSON.parse(JSON.stringify(countryDetail)) as Record<string, unknown>;
  const productionKeys = [
    'emas', 'uranium', 'batu_bara', 'minyak_bumi', 'gas_alam', 'garam', 'litium', 'logam_tanah_jarang', 'bijih_besi',
    'pabrik_semikonduktor', 'pabrik_mesin', 'pabrik_besi', 'semen_beton', 'kayu',
    'ayam_unggas', 'sapi_perah', 'sapi_potong', 'domba_kambing',
    'padi', 'gandum', 'jagung', 'sayur', 'umbi', 'kedelai', 'kelapa_sawit', 'kopi', 'teh', 'kakao', 'tebu', 'karet',
    'udang', 'mutiara', 'ikan',
    'air_mineral', 'gula', 'roti', 'pengolahan_daging', 'mie_instan', 'minyak_goreng', 'susu', 'beras',
  ];

  productionKeys.forEach((key) => {
    nextDetail[`build_date_${key}`] = currentDateStr;

    if (typeof nextDetail[`stok_${key}`] === 'number') nextDetail[`stok_${key}`] = 0;
    if (typeof nextDetail[`stock_${key}`] === 'number') nextDetail[`stock_${key}`] = 0;
    if (typeof nextDetail[`${key}_stok`] === 'number') nextDetail[`${key}_stok`] = 0;
    if (typeof nextDetail[`${key}_stock`] === 'number') nextDetail[`${key}_stock`] = 0;
    if (typeof nextDetail[`${key}_amount`] === 'number') nextDetail[`${key}_amount`] = 0;
    for (const nestedKey of ['stok', 'stock', 'produksi']) {
      const nestedValue = nextDetail[nestedKey];
      if (nestedValue && typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
        (nestedValue as Record<string, unknown>)[key] = 0;
      }
    }
  });

  return {
    updatedDetail: nextDetail,
    lootedSummaryText: 'Seluruh stok hasil produksi (Mineral & Energi, Manufaktur, Peternakan, Agrikultur, Perikanan, dan Olahan Pangan) telah habis dirampas oleh musuh.',
  };
}

export interface ResolvePlayerLootOperationInput {
  attackerCountry: string;
  attackerIso: string;
  targetCountry: string;
  targetIso: string;
  dateStr: string;
  attackerDetail: unknown;
  targetCountryDetail?: unknown;
  committedArmySnapshot?: unknown;
  troopsCommitted?: boolean;
  attackerLossRatio?: unknown;
  deployedUnitsConfig?: unknown;
}

export interface PlayerLootOperationResult {
  updatedAttackerDetail?: unknown;
  targetTreasuryCleared: boolean;
  transferredCash: number;
  newsItems: ReturnType<typeof generateInvasionNews | typeof generateResourceLootNews>[];
  notification: NotificationMessage;
}

function clearTargetTreasury(targetCountryDetail: unknown): { transferredCash: number } | null {
  if (!targetCountryDetail || typeof targetCountryDetail !== 'object' || Array.isArray(targetCountryDetail)) {
    console.error('[WarLoot] Cannot clear target treasury: target country detail is unavailable.');
    return null;
  }

  const country = targetCountryDetail as Record<string, unknown>;
  const countrySlug = typeof country.country_slug === 'string' ? country.country_slug : '';
  if (!countrySlug) {
    console.error('[WarLoot] Cannot clear target treasury: target country profile has no country_slug.', country);
    return null;
  }

  const simulationCountry = getNpcCountrySimulationSnapshot()?.countries[countrySlug.trim().toLowerCase()];
  const treasuryValue = simulationCountry?.anggaran ?? country.anggaran ?? 0;
  const targetTreasury = Number(treasuryValue);
  if (!Number.isFinite(targetTreasury)) {
    console.error('[WarLoot] Cannot clear target treasury: target country budget is invalid.', {
      countrySlug,
      treasuryValue,
    });
    return null;
  }

  if (!updateNpcCountrySimulationState(countrySlug, { anggaran: 0 })) {
    console.error('[WarLoot] Target treasury could not be cleared in the active NPC simulation.', {
      countrySlug,
    });
    return null;
  }

  return { transferredCash: Math.max(0, targetTreasury) };
}

export function resolvePlayerLootOperation(
  input: ResolvePlayerLootOperationInput,
): PlayerLootOperationResult {
  const attackerDetail = input.attackerDetail &&
    typeof input.attackerDetail === 'object' &&
    !Array.isArray(input.attackerDetail)
    ? input.attackerDetail as Record<string, unknown>
    : null;
  const attackerBudgetValue = attackerDetail?.anggaran ?? 0;
  const attackerBudget = Number(attackerBudgetValue);
  const canReceiveLoot = attackerDetail !== null && Number.isFinite(attackerBudget);
  if (!canReceiveLoot) {
    console.error('[WarLoot] Cannot transfer target treasury: attacker country budget is unavailable or invalid.', {
      attackerBudgetValue,
    });
  }
  const treasuryLoot = canReceiveLoot ? clearTargetTreasury(input.targetCountryDetail) : null;
  const transferredCash = treasuryLoot?.transferredCash ?? 0;
  const targetTreasuryCleared = treasuryLoot !== null;
  const hasCommittedTroops = input.troopsCommitted === true;
  const armySource = hasCommittedTroops && input.committedArmySnapshot
    ? input.committedArmySnapshot
    : input.attackerDetail;
  const reportedLossRatio = Number(input.attackerLossRatio);
  const lossRatio = hasCommittedTroops && Number.isFinite(reportedLossRatio)
    ? Math.min(1, Math.max(0, reportedLossRatio))
    : 0.25;
  const deploymentConfig = input.deployedUnitsConfig &&
    typeof input.deployedUnitsConfig === 'object' &&
    !Array.isArray(input.deployedUnitsConfig)
    ? input.deployedUnitsConfig as Record<string, number>
    : undefined;
  const attackerLossResult = armySource
    ? applyWarLossesToUserArmada(
      armySource,
      lossRatio,
      hasCommittedTroops ? false : true,
      deploymentConfig,
    )
    : null;
  const userLossText = attackerLossResult?.lossSummaryText ?? '';

  const newsItems = [
    generateInvasionNews(
      input.attackerCountry,
      input.attackerIso,
      input.targetCountry,
      input.targetIso,
      input.dateStr,
    ),
    generateResourceLootNews(
      input.attackerCountry,
      input.attackerIso,
      input.targetCountry,
      input.targetIso,
      transferredCash,
      LOOTED_RESOURCES,
      input.dateStr,
    ),
  ];
  const lossPercent = hasCommittedTroops && Number.isFinite(reportedLossRatio)
    ? Math.round(reportedLossRatio * 100)
    : 25;
  const lossNote = userLossText && userLossText !== 'Tidak ada kerugian unit'
    ? ` Kerugian tempur armada Anda (${lossPercent}%): ${userLossText}.`
    : '';
  const updatedArmyDetail = attackerLossResult?.updatedDetail &&
    typeof attackerLossResult.updatedDetail === 'object' &&
    !Array.isArray(attackerLossResult.updatedDetail)
    ? attackerLossResult.updatedDetail as Record<string, unknown>
    : attackerDetail;

  return {
    ...(updatedArmyDetail ? {
      updatedAttackerDetail: {
        ...updatedArmyDetail,
        ...(canReceiveLoot ? { anggaran: attackerBudget + transferredCash } : {}),
      },
    } : {}),
    targetTreasuryCleared,
    transferredCash,
    newsItems,
    notification: {
      id: `notif-player-loot-${Date.now()}`,
      title: '💰 OPERASI PENJARAHAN BERHASIL',
      sender: `Markas Besar Angkatan Bersenjata (${input.attackerCountry})`,
      message: `Operasi penjarahan atas ${input.targetCountry} berhasil dilancarkan! Kas negara sebesar ${transferredCash.toLocaleString('id-ID')} NEO dan sumber daya alam telah diamankan.${lossNote}`,
      timestamp: input.dateStr,
      type: 'peringkat',
      value: 80,
      isRead: false,
    },
  };
}
