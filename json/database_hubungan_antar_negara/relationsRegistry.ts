// Compatibility module for Database Hubungan Antar Negara

export interface CountryRelation {
  id: number;
  name: string;
  relation: number;
}

export interface NonAggressionPactPeriod {
  country: string;
  partner: string;
  startDate: string;
  endDate?: string;
}

// Memory store for custom relation modifiers or custom scores per pair
// Pair key format: "country_a:country_b" (alphabetical)
const relationModifiersMap = new Map<string, number>();
const relationSanctionModifiersMap = new Map<string, number>();
let nonAggressionPactHistory: NonAggressionPactPeriod[] = [];

// Track baseline game start date (defaulting to 1 Jan 2026 if not set)
let baselineStartYear: number = 2026;
let currentSimulationDate: Date = new Date(2026, 0, 1);

// Annual decay rate towards neutral score (50). Default: 1 point shift per year.
const YEARLY_DECAY_RATE = 1;
const NON_AGGRESSION_PACT_DECAY_INTERVAL_YEARS = 3;


/**
 * Normalizes country pair key alphabetically for consistent lookup.
 */
function getPairKey(countryA: string, countryB: string): string {
  const s1 = countryA.trim().toLowerCase();
  const s2 = countryB.trim().toLowerCase();
  return s1 < s2 ? `${s1}:${s2}` : `${s2}:${s1}`;
}

function parseSimulationDate(value: Date | string): Date {
  if (value instanceof Date) return new Date(value);
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnlyMatch) {
    return new Date(
      Number(dateOnlyMatch[1]),
      Number(dateOnlyMatch[2]) - 1,
      Number(dateOnlyMatch[3])
    );
  }
  return new Date(value);
}

function isDateWithinPactPeriod(date: Date, period: NonAggressionPactPeriod): boolean {
  const startDate = parseSimulationDate(period.startDate);
  const endDate = period.endDate ? parseSimulationDate(period.endDate) : null;
  return date >= startDate && (!endDate || date <= endDate);
}

function countNaturalDecayPoints(
  sourceCountry: string,
  targetCountry: string,
  evalDate: Date
): number {
  const source = sourceCountry.trim().toLowerCase();
  const target = targetCountry.trim().toLowerCase();
  const pactPeriods = nonAggressionPactHistory.filter(period => {
    const country = period.country.trim().toLowerCase();
    const partner = period.partner.trim().toLowerCase();
    return ((country === source && partner === target) || (country === target && partner === source)) &&
      !isNaN(parseSimulationDate(period.startDate).getTime());
  });
  let decayPoints = 0;

  for (let year = baselineStartYear + 1; year <= evalDate.getFullYear(); year += 1) {
    const annualMilestone = new Date(year, 0, 1);
    if (annualMilestone <= evalDate &&
      !pactPeriods.some(period => isDateWithinPactPeriod(annualMilestone, period))) {
      decayPoints += YEARLY_DECAY_RATE;
    }
  }

  pactPeriods.forEach(period => {
    const startDate = parseSimulationDate(period.startDate);
    const periodEndDate = period.endDate ? parseSimulationDate(period.endDate) : evalDate;
    const finalDate = periodEndDate < evalDate ? periodEndDate : evalDate;

    for (let yearsElapsed = NON_AGGRESSION_PACT_DECAY_INTERVAL_YEARS;
      yearsElapsed <= finalDate.getFullYear() - startDate.getFullYear() + 1;
      yearsElapsed += NON_AGGRESSION_PACT_DECAY_INTERVAL_YEARS) {
      const anniversary = new Date(startDate);
      anniversary.setFullYear(startDate.getFullYear() + yearsElapsed);
      if (anniversary <= finalDate) {
        decayPoints += YEARLY_DECAY_RATE;
      }
    }
  });

  return decayPoints;
}

import relationsDataJson from './relationsData.json';

const relationsDb: Record<string, Record<string, number>> = relationsDataJson as Record<string, Record<string, number>>;

const normalizeSlug = (name?: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

/**
 * Calculates initial baseline relation score (0 - 100) from database_hubungan_antar_negara.sql.
 */
export function getBaseRelationValue(sourceCountry?: string, targetCountry?: string): number {
  if (!sourceCountry || !targetCountry) return 50;

  const s1 = sourceCountry.trim().toLowerCase();
  const s2 = targetCountry.trim().toLowerCase();

  if (s1 === s2) return 100;

  const slug = normalizeSlug(sourceCountry);
  const targetMap = relationsDb[slug];
  if (targetMap && targetMap[s2] !== undefined) {
    return targetMap[s2];
  }

  // Fallback to pair key hash if slug not found
  const pairKey = getPairKey(s1, s2);
  let hash = 5381;
  for (let i = 0; i < pairKey.length; i++) {
    hash = (hash * 33) ^ pairKey.charCodeAt(i);
  }
  return 15 + (Math.abs(hash) % 81);
}

/**
 * Checks whether an embassy exists between source and target countries.
 * Checks against active embassies array if provided, or defaults to checking relation score.
 */
export function hasEmbassy(sourceCountry?: string, targetCountry?: string, activeEmbassyList?: string[]): boolean {
  if (!sourceCountry || !targetCountry) return false;
  const s1 = sourceCountry.trim().toLowerCase();
  const s2 = targetCountry.trim().toLowerCase();
  if (s1 === s2) return true;

  if (Array.isArray(activeEmbassyList) && activeEmbassyList.length > 0) {
    return activeEmbassyList.some(e => e.trim().toLowerCase() === s2);
  }

  return getRelationValue(sourceCountry, targetCountry) >= 50;
}

/**
 * Sets current simulation date (called when simulation time ticks).
 * Updates yearly relation decay whenever date passes 1 January of a new year.
 */
export function setSimulationDate(date: Date | string): void {
  const parsedDate = parseSimulationDate(date);
  if (!isNaN(parsedDate.getTime())) {
    currentSimulationDate = parsedDate;
  }
}

export function setNonAggressionPactHistory(history: NonAggressionPactPeriod[]): void {
  nonAggressionPactHistory = history.filter(period =>
    typeof period?.country === 'string' &&
    typeof period?.partner === 'string' &&
    typeof period?.startDate === 'string' &&
    !isNaN(parseSimulationDate(period.startDate).getTime()) &&
    (!period.endDate || !isNaN(parseSimulationDate(period.endDate).getTime()))
  );
}

/**
 * Legacy support for updating year directly.
 */
export function setSimulationYear(year: number): void {
  if (year > 0) {
    currentSimulationDate = new Date(year, 0, 1);
  }
}

/**
 * Manual override or adjustment for a relation score (e.g. diplomacy action).
 */
export function setRelationModifier(sourceCountry: string, targetCountry: string, delta: number): void {
  const key = getPairKey(sourceCountry, targetCountry);
  const currentMod = relationModifiersMap.get(key) || 0;
  relationModifiersMap.set(key, currentMod + delta);
}

export function setRelationSanctionModifiers(sourceCountry: string, modifiers: Record<string, unknown>): void {
  const normalizedSource = sourceCountry.trim().toLowerCase();
  if (!normalizedSource) {
    relationSanctionModifiersMap.clear();
    return;
  }
  for (const key of relationSanctionModifiersMap.keys()) {
    if (key.startsWith(`${normalizedSource}:`) || key.endsWith(`:${normalizedSource}`)) {
      relationSanctionModifiersMap.delete(key);
    }
  }
  Object.entries(modifiers).forEach(([targetCountry, value]) => {
    const target = targetCountry.trim().toLowerCase();
    const delta = Number(value);
    if (target && Number.isFinite(delta) && delta !== 0) {
      relationSanctionModifiersMap.set(getPairKey(sourceCountry, targetCountry), delta);
    }
  });
}

export function addRelationSanctionModifier(sourceCountry: string, targetCountry: string, delta: number): number {
  const key = getPairKey(sourceCountry, targetCountry);
  const total = (relationSanctionModifiersMap.get(key) || 0) + delta;
  relationSanctionModifiersMap.set(key, total);
  return total;
}

/**
 * Gets effective relation value between two countries factoring:
 * 1. Base initial relation
 * 2. Natural decay once per year, or once every three years while a pact is active
 * 3. Manual diplomatic modifiers
 */
export function getRelationValue(
  sourceCountry?: string,
  targetCountry?: string,
  customDateOrYear?: Date | string | number
): number {
  if (!sourceCountry || !targetCountry) return 50;

  const s1 = sourceCountry.trim().toLowerCase();
  const s2 = targetCountry.trim().toLowerCase();

  if (s1 === s2) return 100;

  const baseScore = getBaseRelationValue(s1, s2);
  const key = getPairKey(s1, s2);
  const manualModifier = (relationModifiersMap.get(key) || 0) + (relationSanctionModifiersMap.get(key) || 0);

  // Determine evaluation date
  let evalDate = currentSimulationDate;
  if (typeof customDateOrYear === 'number') {
    evalDate = new Date(customDateOrYear, 0, 1);
  } else if (customDateOrYear instanceof Date) {
    evalDate = customDateOrYear;
  } else if (typeof customDateOrYear === 'string') {
    evalDate = parseSimulationDate(customDateOrYear);
  }

  const naturalDecay = countNaturalDecayPoints(s1, s2, evalDate);
  let yearlyMilestonesPassed = naturalDecay;

  // If current date is in the baseline start year before 1 Jan (not applicable) or 
  // checking if 1st Jan of the current year has already arrived:
  // If we haven't reached 1st Jan of current year yet, minus 1 milestone
  // Natural decay converges the baseline relation score towards neutral.
  let decayedScore = baseScore;
  if (yearlyMilestonesPassed > 0) {
    const totalDecay = yearlyMilestonesPassed * YEARLY_DECAY_RATE;
    if (baseScore > 50) {
      decayedScore = Math.max(50, baseScore - totalDecay);
    } else if (baseScore < 50) {
      decayedScore = Math.min(50, baseScore + totalDecay);
    }
  }

  // Apply manual diplomatic modifiers & clamp score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, decayedScore + manualModifier));

  return Math.round(finalScore);
}

export default getRelationValue;
