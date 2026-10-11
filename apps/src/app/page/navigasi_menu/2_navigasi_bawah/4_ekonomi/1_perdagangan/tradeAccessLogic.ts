import {
  getAverageNationalization,
} from "../7_sistem_ekonomi/logic/nationalizationLogic";

export { getAverageNationalization };

export type TradeAccessStatus = "aktif" | "waspada" | "dibatasi" | "diblokir";

export interface TradeAccess {
  averageNationalization: number;
  centralizationScore: number;
  status: TradeAccessStatus;
  canBuy: boolean;
  canSell: boolean;
  importTariffModifier: number;
  exportTariffModifier: number;
  ideologyModifier: number;
  religionModifier: number;
  reason: string[];
}

const IDEOLOGY_MODIFIERS: Record<string, number> = {
  demokrasi: 0.7,
  monarki: 0.9,
  otoriter: 1.1,
  otoritarianisme: 1.1,
  sosialisme: 1.1,
  komunisme: 1.3,
  komunis: 1.3,
  fasisme: 1.2,
};

const RELIGION_MODIFIERS: Record<string, number> = {
  islam: 1,
  kristen: 1,
  katolik: 1,
  protestan: 1,
  hindu: 1,
  buddha: 1,
  sekularisme: 1.05,
  ateisme: 1.15,
};

const normalizeLabel = (value: string): string =>
  value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function calculateTradeAccess(
  averageNationalization: number,
  ideology: string,
  religion: string
): TradeAccess {
  const safeAverage = Number.isFinite(averageNationalization)
    ? Math.min(100, Math.max(0, averageNationalization))
    : 0;
  const normalizedIdeology = normalizeLabel(ideology);
  const normalizedReligion = normalizeLabel(religion);
  const ideologyModifier = IDEOLOGY_MODIFIERS[normalizedIdeology] ?? 1;
  const religionModifier = RELIGION_MODIFIERS[normalizedReligion] ?? 1;
  const centralizationScore = safeAverage * ideologyModifier * religionModifier;
  const reason: string[] = [];

  if (centralizationScore < 50) {
    return {
      averageNationalization: safeAverage,
      centralizationScore,
      status: "aktif",
      canBuy: true,
      canSell: true,
      importTariffModifier: 0,
      exportTariffModifier: 0,
      ideologyModifier,
      religionModifier,
      reason,
    };
  }

  if (centralizationScore < 70) {
    reason.push("Tingkat sentralisasi tinggi; perdagangan dipantau komunitas internasional.");
    return {
      averageNationalization: safeAverage,
      centralizationScore,
      status: "waspada",
      canBuy: true,
      canSell: true,
      importTariffModifier: 0.05,
      exportTariffModifier: 0,
      ideologyModifier,
      religionModifier,
      reason,
    };
  }

  reason.push("Sentralisasi ekonomi tinggi membatasi akses impor.");
  if (ideologyModifier > 1) reason.push(`Ideologi ${ideology} meningkatkan skor sentralisasi.`);
  if (religionModifier > 1) {
    reason.push(`Agama ${religion} meningkatkan friksi dengan blok dagang internasional.`);
  }
  if (centralizationScore >= 85) {
    reason[0] = `Sentralisasi ekonomi ekstrem (skor ${Math.round(centralizationScore)}).`;
    return {
      averageNationalization: safeAverage,
      centralizationScore,
      status: "diblokir",
      canBuy: false,
      canSell: false,
      importTariffModifier: 1,
      exportTariffModifier: 1,
      ideologyModifier,
      religionModifier,
      reason,
    };
  }

  return {
    averageNationalization: safeAverage,
    centralizationScore,
    status: "dibatasi",
    canBuy: false,
    canSell: true,
    importTariffModifier: 1,
    exportTariffModifier: 0.1,
    ideologyModifier,
    religionModifier,
    reason,
  };
}
