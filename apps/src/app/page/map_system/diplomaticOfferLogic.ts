import { getResearchCardBonus, getResearchCardLevel } from "../bonus_logic/researchCardLevelBonus";
import { getRelationTier } from "@/app/logic/relationTiers";

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
  lastRollMonth: string | null;
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

export interface MonthlyDiplomaticOffer {
  kind: MonthlyDiplomaticOfferKind;
  countryName: string;
}

export interface MonthlyDiplomaticOfferResult {
  offer: MonthlyDiplomaticOffer | null;
  state: DiplomaticOfferState;
}

export const DIPLOMATIC_OFFER_CONFIG = {
  maxMonthlyWeight: 36,
  countryCooldownMonths: 3,
  minimumGoodRelation: 40,
  embassy: {
    relationTiers: {
      neutral: { min: 41, max: 65, chancePercent: 10 },
      good: { min: 66, max: 80, chancePercent: 25 },
      veryGood: { min: 81, max: 100, chancePercent: 50 },
    },
    userBuildMinimumRelation: 65,
    aiOfferBuildMinimumRelation: 41,
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
  lastRollMonth: null,
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
    lastRollMonth: EMPTY_OFFER_STATE.lastRollMonth,
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
    lastRollMonth: isValidMonth(value.lastRollMonth) ? value.lastRollMonth : null,
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
      context.state.lastRollMonth === context.month ||
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
      context.state.lastRollMonth === context.month ||
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

export function rollMonthlyOffer(
  context: DiplomaticOfferContext,
  rng: () => number = Math.random
): MonthlyDiplomaticOfferResult {
  if (!isValidMonth(context.month) ||
      context.state.lastRollMonth === context.month ||
      context.state.lastOfferMonth === context.month) {
    return { offer: null, state: context.state };
  }

  const chances = getOfferChances(context);
  const totalWeight = DIPLOMATIC_OFFER_KINDS.reduce((sum, kind) => sum + chances[kind], 0);
  const nextState: DiplomaticOfferState = {
    ...context.state,
    lastRollMonth: context.month,
  };

  const embassyCandidates = getEmbassyCandidates(context);
  if (embassyCandidates.length > 0) {
    const combinedEmbassyChance = Math.min(
      DIPLOMATIC_OFFER_CONFIG.embassy.monthlyCapPercent / 100,
      1 - embassyCandidates.reduce(
        (noOfferProbability, candidate) =>
          noOfferProbability * (1 - getEmbassyChance(candidate.relationScore) / 100),
        1
      )
    );
    if (nextRandomValue(rng) < combinedEmbassyChance) {
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
        throw new Error("Embassy offer selection failed despite a successful monthly roll.");
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
  }

  if (totalWeight <= 0 ||
      nextRandomValue(rng) * 100 >= Math.min(DIPLOMATIC_OFFER_CONFIG.maxMonthlyWeight, totalWeight)) {
    return { offer: null, state: nextState };
  }

  let weightedChoice = nextRandomValue(rng) * totalWeight;
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
