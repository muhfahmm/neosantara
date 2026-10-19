import { INITIAL_SUBSIDY_ITEMS } from '../../../../../json/5_database_kebijakan_subsidi/index';
import {
  calculateEconomicPolicyAverage,
  getNationalizationLevel,
  NATIONALIZATION_SECTORS,
} from '@/app/page/navigasi_menu/2_navigasi_bawah/4_ekonomi/7_sistem_ekonomi/logic/nationalizationLogic';

export interface EconomicPopulationImpact {
  priceScore: number;
  policyScore: number;
  subsidyScore: number;
  priceMonthlyModifierPercent: number;
  systemMonthlyModifierPercent: number;
  subsidyMonthlyModifierPercent: number;
  totalMonthlyModifierPercent: number;
}

export interface PriceCommodityImpact {
  key: string;
  price: number;
  score: number;
  monthlyModifierPercent: number;
}

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;

export function calculatePriceCommodityImpacts(detail: Record<string, unknown>): PriceCommodityImpact[] {
  const prices = asRecord(detail.harga);
  if (!prices) return [];

  const entries = Object.entries(prices)
    .filter(([key, value]) => key.startsWith('harga_') && typeof value === 'number' && Number.isFinite(value));
  const subsidyBonus = detail.subsidyActive === true ? 5 : 0;

  return entries.map(([key, value]) => {
    const price = value as number;
    const score = Math.max(0, Math.min(100, 100 - ((price - 10_000) / 90_000) * 100 + subsidyBonus));
    return {
      key,
      price,
      score,
      // Each commodity contributes independently; the country total is their mean.
      monthlyModifierPercent: Math.max(-1, Math.min(0.5, (score - 50) * (score < 50 ? 0.02 : 0.01))),
    };
  });
}

const calculatePriceSatisfaction = (detail: Record<string, unknown>): number => {
  const impacts = calculatePriceCommodityImpacts(detail);
  if (impacts.length === 0) return 50;
  return impacts.reduce((total, impact) => total + impact.score, 0) / impacts.length;
};

const calculateSubsidyScore = (detail: Record<string, unknown>): number => {
  const states = asRecord(detail.subsidy_states);
  const totalApprovalImpact = INITIAL_SUBSIDY_ITEMS.reduce(
    (total, item) => total + item.approvalImpact,
    0,
  );
  if (totalApprovalImpact <= 0) return 50;

  const activeApprovalImpact = INITIAL_SUBSIDY_ITEMS.reduce((total, item) => {
    const isSubsidized = states?.[item.id] ?? item.isSubsidized;
    return total + (isSubsidized === true ? item.approvalImpact : 0);
  }, 0);

  return Math.max(0, Math.min(100, (activeApprovalImpact / totalApprovalImpact) * 100));
};

const resolvePolicyChoice = (choice: unknown): 'A' | 'B' => choice === 'B' ? 'B' : 'A';

export function calculateEconomicPopulationImpact(
  detail: Record<string, unknown> | null | undefined,
): EconomicPopulationImpact {
  const countryDetail = detail || {};
  const priceScore = calculatePriceSatisfaction(countryDetail);
  const priceImpacts = calculatePriceCommodityImpacts(countryDetail);
  const priceMonthlyModifierPercent = priceImpacts.length === 0
    ? 0
    : priceImpacts.reduce((total, impact) => total + impact.monthlyModifierPercent, 0) / priceImpacts.length;

  const policyChoices = {
    price_control: resolvePolicyChoice(countryDetail.policy_price_control),
    strategic_ownership: resolvePolicyChoice(countryDetail.policy_strategic_ownership),
    trade_policy: resolvePolicyChoice(countryDetail.policy_trade_policy),
    labor_regulation: resolvePolicyChoice(countryDetail.policy_labor_regulation),
    land_property_rights: resolvePolicyChoice(countryDetail.policy_land_property_rights),
    labor_unions_rights: resolvePolicyChoice(countryDetail.policy_labor_unions_rights),
    monetary_banking: resolvePolicyChoice(countryDetail.policy_monetary_banking),
  };
  const spectrum = countryDetail.sistem_ekonomi_val;
  const policyScore = calculateEconomicPolicyAverage(
    typeof spectrum === 'number' && Number.isFinite(spectrum) ? spectrum : 50,
    policyChoices,
    countryDetail.sector_nationalization,
  );
  const highNationalizationPenalty = NATIONALIZATION_SECTORS.reduce((total, sector) => {
    const level = getNationalizationLevel(countryDetail.sector_nationalization, sector.id);
    return total + (level >= 75 ? ((level - 50) / 50) * 0.1 : 0);
  }, 0);
  // Sistem ekonomi: Nilai policyScore sekitar 50 (campuran) adalah titik netral.
  // Nilai < 35 menandakan komando sangat otoriter/penuh yang menekan tren demografi.
  const systemMonthlyModifierPercent = policyScore < 40
    ? -Math.min(0.6, (40 - policyScore) * 0.015)
    : policyScore > 60
      ? Math.min(0.4, (policyScore - 60) * 0.010)
      : 0;
  const nationalizationAdjustedSystemModifierPercent = Math.max(
    -0.8,
    systemMonthlyModifierPercent - highNationalizationPenalty,
  );

  const subsidyScore = calculateSubsidyScore(countryDetail);
  const subsidyMonthlyModifierPercent = Math.max(
    -0.80,
    Math.min(0.60, (subsidyScore - 50) * 0.020),
  );

  return {
    priceScore,
    policyScore,
    subsidyScore,
    priceMonthlyModifierPercent,
    systemMonthlyModifierPercent: nationalizationAdjustedSystemModifierPercent,
    subsidyMonthlyModifierPercent,
    totalMonthlyModifierPercent:
      priceMonthlyModifierPercent + nationalizationAdjustedSystemModifierPercent + subsidyMonthlyModifierPercent,
  };
}
