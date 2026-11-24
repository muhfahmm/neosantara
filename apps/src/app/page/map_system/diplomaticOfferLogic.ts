import { getResearchCardBonus, getResearchCardLevel } from "../bonus_logic/researchCardLevelBonus";
import { getRelationTier, RELATION_THRESHOLDS } from "@/app/logic/relationTiers";

export type DiplomaticOfferKind =
  | "trade-agreement"
  | "non-aggression"
  | "research-contract"
  | "defense-alliance";

export interface DiplomaticOfferCandidate {
  countryName: string;
  relationScore: number;
}

export interface PendingDiplomaticOffer {
  kind: MonthlyDiplomaticOfferKind;
  countryName: string;
}

export type MonthlyDiplomaticOfferKind = DiplomaticOfferKind | "embassy";

export interface EmbassyOfferCandidate extends DiplomaticOfferCandidate {
  hasEmbassy: boolean;
  hasPendingOffer: boolean;
  hasOngoingConstruction: boolean;
}

export type EmbassyBuildInitiator = "USER" | "AI";

export interface DiplomaticOfferState {
  lastRollDate: string | null;
  lastOfferMonth: string | null;
  lastOfferByCountry: Record<string, string>;
  lastOfferByType: Partial<Record<DiplomaticOfferKind, string>>;
  lastEmbassyRejectionByCountry: Record<string, string>;
}

export interface DiplomaticOfferContext {
  month: string;
  state: DiplomaticOfferState;
  candidatesByType: Record<DiplomaticOfferKind, readonly DiplomaticOfferCandidate[]>;
  embassyCandidates?: readonly EmbassyOfferCandidate[];
  pendingOffers: readonly PendingDiplomaticOffer[];
  researchBonusPercent: Partial<Record<DiplomaticOfferKind, number>>;
  diplomacyBlocked?: boolean;
  blockedCountryNames?: readonly string[];
}

export interface DailyDiplomaticOfferContext extends DiplomaticOfferContext {
  date: string;
  daysInMonth: number;
}

export interface MonthlyDiplomaticOffer {
  kind: MonthlyDiplomaticOfferKind;
  countryName: string;
}

export interface DiplomaticOfferResult {
  offer: MonthlyDiplomaticOffer | null;
  state: DiplomaticOfferState;
}

export const DIPLOMATIC_OFFER_CONFIG = {
  maxMonthlyWeight: 36,
  countryCooldownMonths: 3,
  minimumGoodRelation: RELATION_THRESHOLDS.POOR_MAX,
  embassy: {
    relationTiers: {
      neutral: { min: RELATION_THRESHOLDS.NEUTRAL_MIN, max: RELATION_THRESHOLDS.NEUTRAL_MAX, chancePercent: 10 },
      good: { min: RELATION_THRESHOLDS.GOOD_MIN, max: 80, chancePercent: 25 },
      veryGood: { min: RELATION_THRESHOLDS.VERY_GOOD_MIN, max: 100, chancePercent: 50 },
    },
    userBuildMinimumRelation: RELATION_THRESHOLDS.EMBASSY_USER_MIN,
    aiOfferBuildMinimumRelation: RELATION_THRESHOLDS.EMBASSY_AI_OFFER_MIN,
    monthlyCapPercent: 35,
    rejectionCooldownMonths: 6,
  },
  offers: {
    "trade-agreement": {
      baseWeight: 15,
      maxWeight: 18,
      cooldownMonths: 2,
      researchId: "perjanjian_dagang",
    },
    "non-aggression": {
      baseWeight: 10,
      maxWeight: 12,
      cooldownMonths: 2,
      researchId: "pakta_non_agresi",
    },
    "research-contract": {
      baseWeight: 8,
      maxWeight: 10,
      cooldownMonths: 2,
      researchId: "bonus_organisasi_pbb",
    },
    "defense-alliance": {
      baseWeight: 3,
      maxWeight: 6,
      cooldownMonths: 12,
      minimumRelationExclusive: 80,
      relationScale: 40,
      researchId: "aliansi_pertahanan",
    },
  },
} as const;

export const DIPLOMATIC_OFFER_KINDS: readonly DiplomaticOfferKind[] = [
  "trade-agreement",
  "non-aggression",
  "research-contract",
  "defense-alliance",
];

const DEFENSE_ALLIANCE_CONFIG = DIPLOMATIC_OFFER_CONFIG.offers["defense-alliance"];

const EMPTY_OFFER_STATE: DiplomaticOfferState = {
  lastRollDate: null,
  lastOfferMonth: null,
  lastOfferByCountry: {},
  lastOfferByType: {},
  lastEmbassyRejectionByCountry: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isValidMonth(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return false;
  return true;
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().slice(0, 10) === value;
}

function normalizeCountryName(countryName: string): string {
  return countryName.trim().toLowerCase();
}

export function getPlayerCountryIdentity(
  countryDetail: Record<string, unknown> | null | undefined,
  fallback = "Indonesia"
): string {
  for (const key of ["country", "nama_negara", "name_id"] as const) {
    const value = countryDetail?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

export function isDiplomaticInteractionBlocked(input: {
  playerUnderEmbargo: boolean;
  partnerUnderEmbargo: boolean;
  bilateralWar: boolean;
}): boolean {
  return input.playerUnderEmbargo || input.partnerUnderEmbargo || input.bilateralWar;
}

export function getDailyChancePercentFromMonthly(
  monthlyChancePercent: number,
  daysInMonth: number
): number {
  const safeChance = Number.isFinite(monthlyChancePercent)
    ? Math.max(0, Math.min(100, monthlyChancePercent)) / 100
    : 0;
  const safeDays = Number.isFinite(daysInMonth)
    ? Math.max(1, Math.floor(daysInMonth))
    : 1;
  return (1 - Math.pow(1 - safeChance, 1 / safeDays)) * 100;
}

export function getAnnualChancePercentFromMonthly(monthlyChancePercent: number): number {
  const safeChance = Number.isFinite(monthlyChancePercent)
    ? Math.max(0, Math.min(100, monthlyChancePercent)) / 100
    : 0;
  return (1 - Math.pow(1 - safeChance, 12)) * 100;
}

export function isEmbassyBuildRelationAllowed(
  initiator: EmbassyBuildInitiator,
  relationScore: number
): boolean {
  const minimum = initiator === "AI"
    ? DIPLOMATIC_OFFER_CONFIG.embassy.aiOfferBuildMinimumRelation
    : DIPLOMATIC_OFFER_CONFIG.embassy.userBuildMinimumRelation;
  return Number.isFinite(relationScore) && relationScore >= minimum;
}

function monthIndex(month: string): number | null {
  if (!isValidMonth(month)) return null;
  const [year, monthNumber] = month.split("-").map(Number);
  return year * 12 + monthNumber - 1;
}

function isWithinCooldown(lastMonth: string | undefined, month: string, duration: number): boolean {
  if (!lastMonth) return false;
  const previous = monthIndex(lastMonth);
  const current = monthIndex(month);
  return previous !== null && current !== null && current - previous < duration;
}

export function createEmptyDiplomaticOfferState(): DiplomaticOfferState {
  return {
    lastRollDate: EMPTY_OFFER_STATE.lastRollDate,
    lastOfferMonth: EMPTY_OFFER_STATE.lastOfferMonth,
    lastOfferByCountry: {},
    lastOfferByType: {},
    lastEmbassyRejectionByCountry: {},
  };
}

export function normalizeDiplomaticOfferState(value: unknown): DiplomaticOfferState {
  if (!isRecord(value)) return createEmptyDiplomaticOfferState();

  const lastOfferByCountry: Record<string, string> = {};
  if (isRecord(value.lastOfferByCountry)) {
    for (const [countryName, month] of Object.entries(value.lastOfferByCountry)) {
      if (countryName.trim() && isValidMonth(month)) {
        lastOfferByCountry[normalizeCountryName(countryName)] = month;
      }
    }
  }

  const lastOfferByType: Partial<Record<DiplomaticOfferKind, string>> = {};
  if (isRecord(value.lastOfferByType)) {
    for (const kind of DIPLOMATIC_OFFER_KINDS) {
      const month = value.lastOfferByType[kind];
      if (isValidMonth(month)) lastOfferByType[kind] = month;
    }
  }

  const lastEmbassyRejectionByCountry: Record<string, string> = {};
  if (isRecord(value.lastEmbassyRejectionByCountry)) {
    for (const [countryName, month] of Object.entries(value.lastEmbassyRejectionByCountry)) {
      if (countryName.trim() && isValidMonth(month)) {
        lastEmbassyRejectionByCountry[normalizeCountryName(countryName)] = month;
      }
    }
  }

  return {
    lastRollDate: isValidDate(value.lastRollDate) ? value.lastRollDate : null,
    lastOfferMonth: isValidMonth(value.lastOfferMonth) ? value.lastOfferMonth : null,
    lastOfferByCountry,
    lastOfferByType,
    lastEmbassyRejectionByCountry,
  };
}

export function recordEmbassyOfferRejection(
  state: DiplomaticOfferState,
  countryName: string,
  month: string
): DiplomaticOfferState {
  if (!countryName.trim() || !isValidMonth(month)) {
    throw new RangeError("Embassy rejection requires a country name and valid game month.");
  }
  return {
    ...state,
    lastEmbassyRejectionByCountry: {
      ...state.lastEmbassyRejectionByCountry,
      [normalizeCountryName(countryName)]: month,
    },
  };
}

function hasPendingOffer(
  context: DiplomaticOfferContext,
  kind: MonthlyDiplomaticOfferKind,
  countryName: string
): boolean {
  const normalizedCountry = normalizeCountryName(countryName);
  return context.pendingOffers.some(offer =>
    offer.kind === kind && normalizeCountryName(offer.countryName) === normalizedCountry
  );
}

function getAvailableCandidates(
  context: DiplomaticOfferContext,
  kind: DiplomaticOfferKind
): DiplomaticOfferCandidate[] {
  if (context.diplomacyBlocked) return [];
  const seenCountries = new Set<string>();
  const blockedCountries = new Set((context.blockedCountryNames || []).map(normalizeCountryName));

  return context.candidatesByType[kind].filter(candidate => {
    const countryName = candidate.countryName.trim();
    const normalizedCountry = normalizeCountryName(countryName);
    if (!countryName || !Number.isFinite(candidate.relationScore) ||
        seenCountries.has(normalizedCountry) || blockedCountries.has(normalizedCountry)) return false;
    seenCountries.add(normalizedCountry);

    if (hasPendingOffer(context, kind, countryName)) return false;
    if (isWithinCooldown(
      context.state.lastOfferByCountry[normalizedCountry],
      context.month,
      DIPLOMATIC_OFFER_CONFIG.countryCooldownMonths
    )) return false;

    if (kind === "research-contract" &&
        candidate.relationScore < DIPLOMATIC_OFFER_CONFIG.minimumGoodRelation) return false;
    if (kind === "defense-alliance" &&
        candidate.relationScore <= DEFENSE_ALLIANCE_CONFIG.minimumRelationExclusive) return false;

    return true;
  });
}

export function getEmbassyChance(relationScore: number): number {
  if (!Number.isFinite(relationScore)) return 0;
  const score = Math.max(0, Math.min(100, Math.round(relationScore)));
  const tier = getRelationTier(score).id;
  const { relationTiers } = DIPLOMATIC_OFFER_CONFIG.embassy;
  if (tier === "sangat_baik" &&
      score >= relationTiers.veryGood.min && score <= relationTiers.veryGood.max) {
    return relationTiers.veryGood.chancePercent;
  }
  if (tier === "baik" && score >= relationTiers.good.min && score <= relationTiers.good.max) {
    return relationTiers.good.chancePercent;
  }
  if (tier === "netral" &&
      score >= relationTiers.neutral.min && score <= relationTiers.neutral.max) {
    return relationTiers.neutral.chancePercent;
  }
  return 0;
}

export function getEmbassyCandidates(
  context: DiplomaticOfferContext
): EmbassyOfferCandidate[] {
  if (!isValidMonth(context.month) ||
      context.state.lastOfferMonth === context.month ||
      context.diplomacyBlocked) return [];

  const blockedCountries = new Set((context.blockedCountryNames || []).map(normalizeCountryName));
  const seenCountries = new Set<string>();
  return (context.embassyCandidates || []).filter(candidate => {
    const countryName = candidate.countryName.trim();
    const normalizedCountry = normalizeCountryName(countryName);
    if (!countryName || !Number.isFinite(candidate.relationScore) ||
        seenCountries.has(normalizedCountry) || blockedCountries.has(normalizedCountry) ||
        getEmbassyChance(candidate.relationScore) === 0 || candidate.hasEmbassy ||
        candidate.hasPendingOffer || candidate.hasOngoingConstruction) return false;
    seenCountries.add(normalizedCountry);

    if (hasPendingOffer(context, "embassy", countryName)) return false;
    if (isWithinCooldown(
      context.state.lastOfferByCountry[normalizedCountry],
      context.month,
      DIPLOMATIC_OFFER_CONFIG.countryCooldownMonths
    )) return false;
    if (isWithinCooldown(
      context.state.lastEmbassyRejectionByCountry[normalizedCountry],
      context.month,
      DIPLOMATIC_OFFER_CONFIG.embassy.rejectionCooldownMonths
    )) return false;

    return true;
  });
}

function getResearchMultiplier(bonusPercent: number | undefined): number {
  const safeBonusPercent = Number.isFinite(bonusPercent)
    ? Math.max(0, Math.min(100, bonusPercent ?? 0))
    : 0;
  return 1 + safeBonusPercent / 100;
}

function getAllianceCandidateWeight(
  candidate: DiplomaticOfferCandidate,
  researchMultiplier: number
): number {
  const relationMultiplier =
    1 + (candidate.relationScore - DEFENSE_ALLIANCE_CONFIG.minimumRelationExclusive) /
      DEFENSE_ALLIANCE_CONFIG.relationScale;
  return Math.min(
    DEFENSE_ALLIANCE_CONFIG.maxWeight,
    DEFENSE_ALLIANCE_CONFIG.baseWeight * relationMultiplier * researchMultiplier
  );
}

export function getDiplomaticOfferResearchBonuses(
  countryDetail: Record<string, unknown> | null | undefined
): Partial<Record<DiplomaticOfferKind, number>> {
  if (!countryDetail) return {};

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research.filter((researchId): researchId is string => typeof researchId === "string")
    : [];
  const researchLevels = countryDetail.research_levels;
  const result: Partial<Record<DiplomaticOfferKind, number>> = {};

  for (const kind of DIPLOMATIC_OFFER_KINDS) {
    const researchId = DIPLOMATIC_OFFER_CONFIG.offers[kind].researchId;
    if (!completedResearch.includes(researchId)) continue;
    const level = getResearchCardLevel(researchLevels, researchId);
    result[kind] = getResearchCardBonus(level);
  }

  return result;
}

export function getOfferChances(
  context: DiplomaticOfferContext
): Record<DiplomaticOfferKind, number> {
  const chances: Record<DiplomaticOfferKind, number> = {
    "trade-agreement": 0,
    "non-aggression": 0,
    "research-contract": 0,
    "defense-alliance": 0,
  };

  if (!isValidMonth(context.month) ||
      context.state.lastOfferMonth === context.month) return chances;

  for (const kind of DIPLOMATIC_OFFER_KINDS) {
    const typeConfig = DIPLOMATIC_OFFER_CONFIG.offers[kind];
    if (isWithinCooldown(context.state.lastOfferByType[kind], context.month, typeConfig.cooldownMonths)) {
      continue;
    }

    const candidates = getAvailableCandidates(context, kind);
    if (candidates.length === 0) continue;

    const multiplier = getResearchMultiplier(context.researchBonusPercent[kind]);
    if (kind === "defense-alliance") {
      const candidateWeights = candidates.map(candidate =>
        getAllianceCandidateWeight(candidate, multiplier)
      );
      chances[kind] = candidateWeights.reduce((sum, weight) => sum + weight, 0) / candidateWeights.length;
    } else {
      chances[kind] = Math.min(typeConfig.maxWeight, typeConfig.baseWeight * multiplier);
    }
  }

  return chances;
}

function nextRandomValue(rng: () => number): number {
  const value = rng();
  if (!Number.isFinite(value)) throw new RangeError("Diplomatic offer RNG must return a finite number.");
  if (value < 0 || value > 1) throw new RangeError("Diplomatic offer RNG must return a value between 0 and 1.");
  return Math.min(1 - Number.EPSILON, value);
}

export function rollDailyOffer(
  context: DailyDiplomaticOfferContext,
  rng: () => number = Math.random
): DiplomaticOfferResult {
  if (!isValidMonth(context.month) ||
      !isValidDate(context.date) ||
      context.date.slice(0, 7) !== context.month ||
      !Number.isFinite(context.daysInMonth) ||
      context.daysInMonth < 1 ||
      context.state.lastRollDate === context.date ||
      context.state.lastOfferMonth === context.month) {
    return { offer: null, state: context.state };
  }

  const chances = getOfferChances(context);
  const totalWeight = DIPLOMATIC_OFFER_KINDS.reduce((sum, kind) => sum + chances[kind], 0);
  const nextState: DiplomaticOfferState = {
    ...context.state,
    lastRollDate: context.date,
  };

  const embassyCandidates = getEmbassyCandidates(context);
  const embassyMonthlyChance = Math.min(
    DIPLOMATIC_OFFER_CONFIG.embassy.monthlyCapPercent / 100,
    1 - embassyCandidates.reduce(
      (noOfferProbability, candidate) =>
        noOfferProbability * (1 - getEmbassyChance(candidate.relationScore) / 100),
      1
    )
  );
  const regularMonthlyChance = Math.min(
    DIPLOMATIC_OFFER_CONFIG.maxMonthlyWeight,
    totalWeight
  ) / 100;
  const combinedMonthlyChance = embassyMonthlyChance +
    (1 - embassyMonthlyChance) * regularMonthlyChance;
  const dailyChance = getDailyChancePercentFromMonthly(
    combinedMonthlyChance * 100,
    context.daysInMonth
  ) / 100;

  if (combinedMonthlyChance <= 0 || nextRandomValue(rng) >= dailyChance) {
    return { offer: null, state: nextState };
  }

  const monthlyOfferChoice = nextRandomValue(rng) * combinedMonthlyChance;
  if (monthlyOfferChoice < embassyMonthlyChance) {
    const totalEmbassyWeight = embassyCandidates.reduce(
      (total, candidate) => total + getEmbassyChance(candidate.relationScore),
      0
    );
    let weightedChoice = nextRandomValue(rng) * totalEmbassyWeight;
    const selectedCandidate = embassyCandidates.find(candidate => {
      weightedChoice -= getEmbassyChance(candidate.relationScore);
      return weightedChoice < 0;
    });
    if (!selectedCandidate) {
      throw new Error("Embassy offer selection failed despite a successful daily roll.");
    }
    const normalizedCountry = normalizeCountryName(selectedCandidate.countryName);
    return {
      offer: { kind: "embassy", countryName: selectedCandidate.countryName },
      state: {
        ...nextState,
        lastOfferMonth: context.month,
        lastOfferByCountry: {
          ...nextState.lastOfferByCountry,
          [normalizedCountry]: context.month,
        },
      },
    };
  }

  if (totalWeight <= 0 || regularMonthlyChance <= 0) {
    return { offer: null, state: nextState };
  }

  let weightedChoice = ((monthlyOfferChoice - embassyMonthlyChance) /
    ((1 - embassyMonthlyChance) * regularMonthlyChance)) * totalWeight;
  let selectedKind: DiplomaticOfferKind | null = null;
  for (const kind of DIPLOMATIC_OFFER_KINDS) {
    weightedChoice -= chances[kind];
    if (chances[kind] > 0 && weightedChoice < 0) {
      selectedKind = kind;
      break;
    }
  }
  if (!selectedKind) return { offer: null, state: nextState };

  const candidates = getAvailableCandidates(context, selectedKind);
  if (candidates.length === 0) return { offer: null, state: nextState };
  const candidateIndex = Math.floor(nextRandomValue(rng) * candidates.length);
  const selectedCandidate = candidates[candidateIndex];
  const normalizedCountry = normalizeCountryName(selectedCandidate.countryName);

  return {
    offer: {
      kind: selectedKind,
      countryName: selectedCandidate.countryName,
    },
    state: {
      ...nextState,
      lastOfferMonth: context.month,
      lastOfferByCountry: {
        ...nextState.lastOfferByCountry,
        [normalizedCountry]: context.month,
      },
      lastOfferByType: {
        ...nextState.lastOfferByType,
        [selectedKind]: context.month,
      },
    },
  };
}
