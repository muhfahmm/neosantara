import {
  CORRUPTION_SCHEMES,
  getCorruptionMetrics,
  initializeCorruptionProfile,
  type ActiveCorruptionScandal,
  type CorruptionCountryDetail,
} from './corruptionLogic';

const monthKey = (date: Date) => date.toISOString().slice(0, 7);

function monthDistance(from: string, to: string): number {
  const [fromYear, fromMonth] = from.split('-').map(Number);
  const [toYear, toMonth] = to.split('-').map(Number);
  return (toYear - fromYear) * 12 + toMonth - fromMonth;
}

function addSatisfactionLoss(detail: CorruptionCountryDetail, loss: number) {
  const next = { ...detail };
  if (typeof detail.kepuasan === 'number') next.kepuasan = Math.max(0, detail.kepuasan - loss);
  if (typeof detail.kepuasan_masyarakat === 'number') {
    next.kepuasan_masyarakat = Math.max(0, detail.kepuasan_masyarakat - loss);
  }
  if (typeof detail.presidentRating === 'number') {
    next.presidentRating = Math.max(0, detail.presidentRating - loss);
  }
  return next;
}

export function processCorruptionMonth(
  detail: CorruptionCountryDetail,
  date: Date,
  random = Math.random,
): CorruptionCountryDetail {
  const initializedDetail = initializeCorruptionProfile(detail);
  const currentMonth = monthKey(date);
  const lastMonth = typeof initializedDetail.corruption_last_processed_month === 'string'
    ? initializedDetail.corruption_last_processed_month
    : '';

  if (!lastMonth) {
    return { ...initializedDetail, corruption_last_processed_month: currentMonth };
  }
  const monthsToProcess = Math.min(120, Math.max(0, monthDistance(lastMonth, currentMonth)));
  if (monthsToProcess === 0) return initializedDetail;

  let next: CorruptionCountryDetail = { ...initializedDetail };
  let processedMonth = lastMonth;

  for (let monthOffset = 0; monthOffset < monthsToProcess; monthOffset += 1) {
    const [year, month] = processedMonth.split('-').map(Number);
    const nextDate = new Date(Date.UTC(year, month, 1));
    processedMonth = monthKey(nextDate);
    const metrics = getCorruptionMetrics(next);
    const chance = Math.min(0.75, Math.max(0.01,
      0.02 +
      metrics.index * 0.003 +
      metrics.auditCoverage * 0.001 +
      metrics.agencyLevel * 0.015 +
      metrics.whistleblowerProtection * 0.012,
    ));

    if (random() >= chance) continue;

    const unresolvedSchemeIds = new Set(
      metrics.scandals.filter(scandal => !scandal.resolved).map(scandal => scandal.schemeId),
    );
    const availableSchemes = CORRUPTION_SCHEMES.filter(scheme => !unresolvedSchemeIds.has(scheme.id));
    if (availableSchemes.length === 0) continue;

    const scheme = availableSchemes[Math.floor(random() * availableSchemes.length)];
    const severity: ActiveCorruptionScandal['severity'] = metrics.index >= 75
      ? 'berat'
      : metrics.index >= 45
        ? 'sedang'
        : 'ringan';
    const satisfactionLoss = severity === 'berat' ? 4 : severity === 'sedang' ? 2 : 1;
    const lossRate = severity === 'berat' ? 0.02 : severity === 'sedang' ? 0.01 : 0.005;
    const budget = Math.max(0, Number(next.anggaran) || 0);
    const budgetLoss = Math.min(budget, Math.round(budget * lossRate));
    const exposedDate = `${processedMonth}-01`;
    const scandal: ActiveCorruptionScandal = {
      ...scheme,
      id: `scandal-${scheme.id}-${processedMonth}`,
      schemeId: scheme.id,
      severity,
      investigationStatus: 'belum_diselidiki',
      investigationAttempts: 0,
      exposedDate,
      budgetLoss,
      satisfactionLoss,
      resolved: false,
    };
    const resolvedHistory = [...metrics.scandals]
      .filter(item => item.resolved)
      .sort((a, b) => b.exposedDate.localeCompare(a.exposedDate))
      .slice(0, 50);
    const retainedScandals = [
      ...metrics.scandals.filter(item => !item.resolved),
      ...resolvedHistory,
      scandal,
    ];

    const pending = Array.isArray(next.pending_notifications) ? next.pending_notifications : [];
    
    // Generate narasi yang lebih detail berdasarkan severity
    const severityLabel = severity === 'berat' ? 'KASUS BERAT' : severity === 'sedang' ? 'KASUS SEDANG' : 'KASUS RINGAN';
    const detailMessage = `${scheme.description}. Kerugian negara diperkirakan ${budgetLoss.toLocaleString('id-ID')} NEO. Tingkat kepuasan rakyat turun ${satisfactionLoss} poin akibat skandal ini. Segera buka menu Pemberantasan Korupsi untuk menyelidiki dan menuntaskan kasus.`;
    
    const notification = {
      id: `corruption-scandal-${scheme.id}-${processedMonth}`,
      title: `🚨 [${severityLabel}] ${scheme.name} - ${scheme.ministry}`,
      sender: 'Komisi Pemberantasan Korupsi',
      message: detailMessage,
      timestamp: exposedDate,
      type: 'peringkat' as const,
      value: Math.max(0, metrics.index + 1),
      isRead: false,
    };

    next = addSatisfactionLoss({
      ...next,
      anggaran: budget - budgetLoss,
      corruption_index: Math.min(100, metrics.index + (severity === 'berat' ? 5 : severity === 'sedang' ? 3 : 1)),
      pending_notifications: [notification, ...pending].slice(0, 100),
      active_scandals: retainedScandals,
    }, satisfactionLoss);
  }

  return { ...next, corruption_last_processed_month: currentMonth };
}

export interface InvestigationResult {
  updatedDetail: CorruptionCountryDetail;
  message: string;
  cost: number;
  success: boolean;
}

export function investigateScandal(
  detail: CorruptionCountryDetail,
  scandalId: string,
  date: Date,
  random = Math.random,
): InvestigationResult | null {
  const metrics = getCorruptionMetrics(detail);
  const scandal = metrics.scandals.find(item => item.id === scandalId && !item.resolved);
  if (!scandal || scandal.investigationStatus === 'bukti_ditemukan') return null;

  const severityCost = scandal.severity === 'berat' ? 50_000 : scandal.severity === 'sedang' ? 25_000 : 10_000;
  const cost = Math.round(severityCost * (1 + scandal.investigationAttempts * 0.35));
  const budget = Math.max(0, Number(detail.anggaran) || 0);
  if (budget < cost) return null;

  const chance = Math.min(0.9, 0.2 + metrics.agencyLevel * 0.05 + metrics.auditCoverage * 0.002 + metrics.whistleblowerProtection * 0.02);
  const success = random() < chance;
  const updatedDetail: CorruptionCountryDetail = {
    ...detail,
    anggaran: budget - cost,
    active_scandals: metrics.scandals.map(item => item.id === scandalId
      ? {
          ...item,
          investigationAttempts: item.investigationAttempts + 1,
          investigationStatus: success ? 'bukti_ditemukan' : 'diselidiki',
          lastInvestigationDate: date.toISOString().slice(0, 10),
        }
      : item),
  };

  return {
    updatedDetail,
    cost,
    success,
    message: success
      ? `Bukti kuat ditemukan untuk kasus "${scandal.name}". Kasus siap dituntut.`
      : `Penyelidikan "${scandal.name}" belum menemukan bukti yang cukup. Tingkatkan kapasitas atau coba kembali.`,
  };
}

export function prosecuteScandal(
  detail: CorruptionCountryDetail,
  scandalId: string,
  date: Date,
): InvestigationResult | null {
  const metrics = getCorruptionMetrics(detail);
  const scandal = metrics.scandals.find(item => item.id === scandalId && !item.resolved);
  if (!scandal || scandal.investigationStatus !== 'bukti_ditemukan') return null;

  const recoveryRate = scandal.severity === 'berat' ? 0.75 : scandal.severity === 'sedang' ? 0.85 : 1;
  const recovered = Math.round(scandal.budgetLoss * recoveryRate);
  const resolvedDate = date.toISOString().slice(0, 10);
  const updatedScandals = metrics.scandals.map(item => item.id === scandalId
    ? { ...item, resolved: true, resolvedDate }
    : item);
  const next: CorruptionCountryDetail = {
    ...detail,
    anggaran: Math.max(0, Number(detail.anggaran) || 0) + recovered,
    corruption_index: Math.max(0, metrics.index - (scandal.severity === 'berat' ? 5 : 3)),
    active_scandals: updatedScandals,
  };
  if (typeof detail.kepuasan === 'number') next.kepuasan = Math.min(100, detail.kepuasan + 1);
  if (typeof detail.kepuasan_masyarakat === 'number') {
    next.kepuasan_masyarakat = Math.min(100, detail.kepuasan_masyarakat + 1);
  }
  if (typeof detail.presidentRating === 'number') next.presidentRating = Math.min(100, detail.presidentRating + 2);

  return {
    updatedDetail: next,
    cost: 0,
    success: true,
    message: `Kasus "${scandal.name}" berhasil dituntut. ${recovered.toLocaleString('id-ID')} NEO dipulihkan ke kas negara.`,
  };
}

export function resolveScandal(
  detail: CorruptionCountryDetail,
  scandalId: string,
  resolvedDate: string,
): CorruptionCountryDetail {
  const metrics = getCorruptionMetrics(detail);
  const scandal = metrics.scandals.find(item => item.id === scandalId && !item.resolved);
  if (!scandal) return detail;

  return {
    ...detail,
    corruption_index: Math.max(0, metrics.index - (scandal.severity === 'berat' ? 5 : 3)),
    active_scandals: metrics.scandals.map(item =>
      item.id === scandalId ? { ...item, resolved: true, resolvedDate } : item
    ),
  };
}
