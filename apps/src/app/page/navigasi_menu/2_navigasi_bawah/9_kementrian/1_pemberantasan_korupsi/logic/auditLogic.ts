import { getCorruptionMetrics, type CorruptionCountryDetail } from './corruptionLogic';

export interface CorruptionActionResult {
  updatedDetail: CorruptionCountryDetail;
  message: string;
  cost: number;
}

export function upgradeAntiCorruptionAgency(
  detail: CorruptionCountryDetail,
  date: Date
): CorruptionActionResult | null {
  const metrics = getCorruptionMetrics(detail);
  if (metrics.agencyLevel >= 10) return null;

  const cost = Math.round(25_000 * (metrics.agencyLevel + 1) ** 1.65);
  const budget = Math.max(0, Number(detail.anggaran) || 0);
  if (budget < cost) return null;

  const nextLevel = metrics.agencyLevel + 1;
  const dateString = date.toISOString().slice(0, 10);
  return {
    cost,
    message: `Lembaga antikorupsi ditingkatkan ke level ${nextLevel}.`,
    updatedDetail: {
      ...detail,
      anggaran: budget - cost,
      anti_corruption_agency_level: nextLevel,
      corruption_index: Math.max(0, metrics.index - 1),
      corruption_last_agency_upgrade: dateString,
    },
  };
}

export function improveWhistleblowerProtection(
  detail: CorruptionCountryDetail,
  date: Date
): CorruptionActionResult | null {
  const metrics = getCorruptionMetrics(detail);
  if (metrics.whistleblowerProtection >= 10) return null;

  const cost = Math.round(15_000 * (metrics.whistleblowerProtection + 1) ** 1.55);
  const budget = Math.max(0, Number(detail.anggaran) || 0);
  if (budget < cost) return null;

  const nextLevel = metrics.whistleblowerProtection + 1;
  return {
    cost,
    message: `Perlindungan pelapor ditingkatkan ke level ${nextLevel}.`,
    updatedDetail: {
      ...detail,
      anggaran: budget - cost,
      whistleblower_protection: nextLevel,
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
