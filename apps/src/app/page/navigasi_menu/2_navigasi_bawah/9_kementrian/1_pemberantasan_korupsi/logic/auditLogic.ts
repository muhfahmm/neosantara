import { getCorruptionMetrics, type CorruptionCountryDetail } from './corruptionLogic';
import { calculateCountryNetBalance } from '@/app/logic/economic_logic/treasuryUpdater';
import { getDailyMinistryCost, LEVEL_UP_COST } from '@/app/logic/economic_logic/departments';
import { applyReformasiBirokrasiToUpgradeCost } from '@/app/page/bonus_logic';

export interface CorruptionActionResult {
  updatedDetail: CorruptionCountryDetail;
  message: string;
  cost: number;
}

export type CorruptionUpgradeTrack = 'agency' | 'whistleblower';

const MAX_CORRUPTION_LEVEL = 20;

const getTrackLevel = (detail: CorruptionCountryDetail, track: CorruptionUpgradeTrack) => {
  const metrics = getCorruptionMetrics(detail);
  return track === 'agency' ? metrics.agencyLevel : metrics.whistleblowerProtection;
};

export function getCorruptionUpgradeCost(
  detail: CorruptionCountryDetail,
  fromLevel: number,
  targetLevel: number,
): number {
  let totalCost = 0;
  for (let level = fromLevel + 1; level <= targetLevel; level += 1) {
    totalCost += applyReformasiBirokrasiToUpgradeCost(LEVEL_UP_COST[level] ?? 10, detail);
  }
  return totalCost;
}

export function canUpgradeCorruptionTrack(
  detail: CorruptionCountryDetail,
  track: CorruptionUpgradeTrack,
  targetLevel: number,
  currentNet = calculateCountryNetBalance(detail),
): boolean {
  const currentLevel = getTrackLevel(detail, track);
  if (!Number.isInteger(targetLevel) || targetLevel <= currentLevel || targetLevel > MAX_CORRUPTION_LEVEL) {
    return false;
  }

  const cost = getCorruptionUpgradeCost(detail, currentLevel, targetLevel);
  const budget = Math.max(0, Number(detail.anggaran) || 0);
  if (budget < cost) return false;

  const projectedNet = currentNet + getDailyMinistryCost(currentLevel) - getDailyMinistryCost(targetLevel);
  return projectedNet >= 0;
}

export function upgradeAntiCorruptionAgency(
  detail: CorruptionCountryDetail,
  date: Date,
  targetLevel: number,
): CorruptionActionResult | null {
  const metrics = getCorruptionMetrics(detail);
  if (!canUpgradeCorruptionTrack(detail, 'agency', targetLevel)) return null;
  const cost = getCorruptionUpgradeCost(detail, metrics.agencyLevel, targetLevel);
  const budget = Math.max(0, Number(detail.anggaran) || 0);
  const levelsGained = targetLevel - metrics.agencyLevel;
  const dateString = date.toISOString().slice(0, 10);
  return {
    cost,
    message: `Lembaga antikorupsi ditingkatkan ke level ${targetLevel}.`,
    updatedDetail: {
      ...detail,
      anggaran: budget - cost,
      anti_corruption_agency_level: targetLevel,
      corruption_index: Math.max(0, metrics.index - levelsGained),
      corruption_last_agency_upgrade: dateString,
    },
  };
}

export function improveWhistleblowerProtection(
  detail: CorruptionCountryDetail,
  date: Date,
  targetLevel: number,
): CorruptionActionResult | null {
  const metrics = getCorruptionMetrics(detail);
  if (!canUpgradeCorruptionTrack(detail, 'whistleblower', targetLevel)) return null;
  const cost = getCorruptionUpgradeCost(detail, metrics.whistleblowerProtection, targetLevel);
  const budget = Math.max(0, Number(detail.anggaran) || 0);
  return {
    cost,
    message: `Perlindungan pelapor ditingkatkan ke level ${targetLevel}.`,
    updatedDetail: {
      ...detail,
      anggaran: budget - cost,
      whistleblower_protection: targetLevel,
      corruption_last_whistleblower_upgrade: date.toISOString().slice(0, 10),
    },
  };
}

export function conductBudgetAudit(
  detail: CorruptionCountryDetail,
  date: Date,
  random = Math.random
): CorruptionActionResult | null {
  const metrics = getCorruptionMetrics(detail);
  const month = date.toISOString().slice(0, 7);
  if (detail.corruption_last_audit_month === month || metrics.auditCoverage >= 100) return null;

  const budget = Math.max(0, Number(detail.anggaran) || 0);
  const cost = Math.max(1_000, Math.round(budget * 0.002));
  if (budget < cost) return null;

  const auditIncrease = Math.min(15, 100 - metrics.auditCoverage);
  const indexReduction = 2 + Math.floor(random() * 4) + Math.floor(metrics.agencyLevel / 3);
  let updatedDetail: CorruptionCountryDetail = {
    ...detail,
    anggaran: budget - cost,
    audit_coverage: metrics.auditCoverage + auditIncrease,
    corruption_index: Math.max(0, metrics.index - indexReduction),
    corruption_last_audit_month: month,
  };

  const unresolved = metrics.scandals.filter(scandal => !scandal.resolved);
  const target = unresolved[0];
  if (target && random() * 100 < Math.min(90, 20 + metrics.auditCoverage / 2 + metrics.agencyLevel * 5)) {
    updatedDetail = {
      ...updatedDetail,
      active_scandals: metrics.scandals.map(scandal => scandal.id === target.id
        ? {
            ...scandal,
            investigationStatus: 'bukti_ditemukan',
            lastInvestigationDate: date.toISOString().slice(0, 10),
          }
        : scandal),
    };
  }

  return {
    cost,
    message: target && updatedDetail.active_scandals?.some(scandal => scandal.id === target.id && scandal.investigationStatus === 'bukti_ditemukan')
      ? `Audit selesai: cakupan bertambah ${auditIncrease}% dan bukti kasus "${target.name}" ditemukan.`
      : `Audit selesai: cakupan bertambah ${auditIncrease}% dan indeks korupsi turun ${Math.min(indexReduction, metrics.index)} poin.`,
    updatedDetail,
  };
}
