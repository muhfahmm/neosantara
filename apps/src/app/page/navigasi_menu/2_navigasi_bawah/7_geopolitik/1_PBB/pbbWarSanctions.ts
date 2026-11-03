import {
  loadActiveResolutions,
  spawnAIResolutionFromTrigger
} from './1_resolusi_PBB/logic/resolusiPBBUILogic';
import {
  loadActiveSecurityCouncilItems,
  spawnAISecurityCouncilFromTrigger
} from './2_keamanan_PBB/logic/keamananPBBUILogic';
import { getIsoForCountryName } from './pbbCountryIso';
import { getEligibleReplacementProposer, isCountryAnnexed } from './pbbVotingEligibility';
import { getWarCountryIdentity } from '@/app/page/detail_negara/3_operasi_militer/1_serang_negara/warCountryIdentity';
import type { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { chooseAIResolutionDuration } from './1_resolusi_PBB/logic/resolusiPBBUILogic';
import { isCountryUnderEconomicEmbargo } from './1_resolusi_PBB/logic/3_economicEmbargoLogic';

const WAR_SANCTION_HISTORY_KEY = 'pbb_war_sanction_history_v1';
const LEGACY_REPORTED_VIOLATIONS_KEY = 'pbb_reported_war_ban_violations_v1';
const ATTACK_COUNTER_KEY_PREFIX = 'pbb_war_attack_counter_v1:';

export const PBB_REGULAR_TRIGGER_PROBABILITIES = {
  generalAssembly: 0.15,
  securityCouncil: 0.05,
} as const;

export type WarSanctionType =
  | 'arms_embargo'
  | 'economic_embargo'
  | 'economic'
  | 'naval'
  | 'full'
  | 'military';

export type WarSanctionAttackResult = 'aneksasi' | 'jarah' | 'failed';

export interface ApprovedInvasionMandateSnapshot {
  proposerName: string;
  targetName: string;
  status: string;
  daysRemaining: number;
}

interface ViolationHistoryEntry {
  attackId: string;
  date: string;
  attackerIdentity: string;
  targetIdentity: string;
}

interface ViolationHistoryByAttacker {
  [attackerIdentity: string]: ViolationHistoryEntry[];
}

export const WAR_SANCTION_CONFIG = {
  historyWindowMonths: 12,
  tiers: {
    1: {
      types: [
        { type: 'arms_embargo', weight: 1 },
        { type: 'economic_embargo', weight: 1 },
      ],
    },
    2: {
      types: [
        { type: 'economic', weight: 1 },
        { type: 'naval', weight: 1 },
      ],
    },
    3: {
      types: [
        { type: 'full', weight: 1 },
        { type: 'military', weight: 1 },
      ],
    },
  },
} as const;

let violationHistory: ViolationHistoryByAttacker = {};
let historyInitialized = false;
let attackIdCounter = 0;
const reportedViolationIds = new Set<string>();

function ensureHistoryLoaded(): void {
  if (typeof window === 'undefined' || historyInitialized) return;
  historyInitialized = true;
  try {
    const stored = localStorage.getItem(WAR_SANCTION_HISTORY_KEY);
    if (!stored) return;
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Stored PBB war-sanction history has an invalid shape.');
    }

    const normalized: ViolationHistoryByAttacker = {};
    for (const [identity, entries] of Object.entries(parsed)) {
      if (!Array.isArray(entries)) continue;
      normalized[identity] = entries.filter((entry): entry is ViolationHistoryEntry =>
        Boolean(entry) &&
        typeof entry === 'object' &&
        typeof (entry as ViolationHistoryEntry).attackId === 'string' &&
        typeof (entry as ViolationHistoryEntry).date === 'string' &&
        typeof (entry as ViolationHistoryEntry).attackerIdentity === 'string' &&
        typeof (entry as ViolationHistoryEntry).targetIdentity === 'string'
      );
    }
    violationHistory = normalized;
    for (const entries of Object.values(violationHistory)) {
      for (const entry of entries) reportedViolationIds.add(makeViolationId(entry.attackId, entry.attackerIdentity, entry.targetIdentity));
    }
  } catch (error) {
    console.error('Failed to load PBB war-sanction history:', error);
    violationHistory = {};
  }
}

function persistHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WAR_SANCTION_HISTORY_KEY, JSON.stringify(violationHistory));
  } catch (error) {
    console.error('Failed to persist PBB war-sanction history:', error);
  }
}

export function createWarAttackId(gameDate: string): string {
  const counterKey = `${ATTACK_COUNTER_KEY_PREFIX}${gameDate}`;
  if (typeof window !== 'undefined') {
    try {
      const savedCounter = Number(localStorage.getItem(counterKey)) || 0;
      attackIdCounter = Math.max(attackIdCounter, savedCounter);
    } catch (error) {
      console.error('Failed to load PBB war attack counter:', error);
    }
  }
  attackIdCounter += 1;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(counterKey, String(attackIdCounter));
    } catch (error) {
      console.error('Failed to persist PBB war attack counter:', error);
    }
  }
  return `atk-${gameDate}-${attackIdCounter}`;
}

export function getApprovedInvasionMandatesSnapshot(): ApprovedInvasionMandateSnapshot[] {
  const assemblyMandates = loadActiveResolutions()
    .filter(item => item.type === 'military_invasion')
    .map(item => ({
      proposerName: item.proposer.name,
      targetName: item.target.name,
      status: item.status,
      daysRemaining: item.daysRemaining,
    }));
  const securityCouncilMandates = loadActiveSecurityCouncilItems()
    .filter(item => item.type === 'military')
    .map(item => ({
      proposerName: item.proposer.name,
      targetName: item.target.name,
      status: item.status,
      daysRemaining: item.daysRemaining,
    }));
  return [...assemblyMandates, ...securityCouncilMandates];
}

export function isUnauthorizedInvasion(input: {
  attacker: string;
  target: string;
  isPbbCoalition: boolean;
  approvedMandates: readonly ApprovedInvasionMandateSnapshot[];
  attackerAnnexed?: boolean;
}): boolean {
  if (!input.attacker.trim() || !input.target.trim() || input.isPbbCoalition || input.attackerAnnexed) {
    return false;
  }

  const attackerIdentity = getWarCountryIdentity(input.attacker);
  const targetIdentity = getWarCountryIdentity(input.target);
  const hasMatchingMandate = input.approvedMandates.some(mandate =>
    mandate.status === 'passed' &&
    mandate.daysRemaining > 0 &&
    getWarCountryIdentity(mandate.proposerName) === attackerIdentity &&
    getWarCountryIdentity(mandate.targetName) === targetIdentity
  );
  return !hasMatchingMandate;
}

export function pickSanctionTier(input: {
  attackResult: WarSanctionAttackResult;
  violationCount: number;
}): 1 | 2 | 3 {
  if (input.violationCount >= 3) return 3;
  if (input.attackResult === 'aneksasi' || input.violationCount >= 2) return 2;
  return 1;
}

export function selectSanctionTypes(input: {
  attackResult: WarSanctionAttackResult;
  violationCount: number;
  activeSanctions: readonly WarSanctionType[];
  rng?: () => number;
}): { tier: 1 | 2 | 3; types: WarSanctionType[] } {
  const tier = pickSanctionTier(input);
  const tierOptions = WAR_SANCTION_CONFIG.tiers[tier].types;
  if (tierOptions.some(option => input.activeSanctions.includes(option.type as WarSanctionType))) {
    return { tier, types: [] };
  }
  const candidates = tierOptions;

  const totalWeight = candidates.reduce((sum, option) => sum + option.weight, 0);
  let roll = (input.rng || Math.random)() * totalWeight;
  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll < 0) return { tier, types: [candidate.type as WarSanctionType] };
  }
  return { tier, types: [candidates[candidates.length - 1].type as WarSanctionType] };
}

function makeViolationId(attackId: string, attackerIdentity: string, targetIdentity: string): string {
  return [attackId, attackerIdentity, targetIdentity].join('|');
}

function isWithinHistoryWindow(date: string, currentDate: string): boolean {
  const [year, month] = date.split('-').map(Number);
  const [currentYear, currentMonth] = currentDate.split('-').map(Number);
  if (![year, month, currentYear, currentMonth].every(Number.isFinite)) return false;
  const monthDifference = (currentYear - year) * 12 + currentMonth - month;
  return monthDifference >= 0 && monthDifference <= WAR_SANCTION_CONFIG.historyWindowMonths;
}

function getActiveSanctionTypes(attackerIdentity: string): WarSanctionType[] {
  const activeAssemblySanctions = loadActiveResolutions()
    .filter(item =>
      getWarCountryIdentity(item.target.name) === attackerIdentity &&
      (item.status === 'voting' || (item.status === 'passed' && item.daysRemaining > 0)) &&
      ['arms_embargo', 'economic_embargo'].includes(item.type)
    )
    .map(item => item.type as WarSanctionType);
  const activeSecuritySanctions = loadActiveSecurityCouncilItems()
    .filter(item =>
      getWarCountryIdentity(item.target.name) === attackerIdentity &&
      (item.status === 'voting' || (item.status === 'passed' && item.daysRemaining > 0)) &&
      ['economic', 'naval', 'full', 'military'].includes(item.type)
    )
    .map(item => item.type as WarSanctionType);
  return [...activeAssemblySanctions, ...activeSecuritySanctions];
}

function getSanctionTitle(type: WarSanctionType): string {
  switch (type) {
    case 'arms_embargo': return 'Embargo Penjualan Senjata';
    case 'economic_embargo': return 'Embargo Ekonomi';
    case 'economic': return 'Blokade Ekonomi';
    case 'naval': return 'Blokade Laut';
    case 'full': return 'Blokade Penuh';
    case 'military': return 'Invasi Militer';
  }
}

function getEligibleSanctionProposer(excludedNames: string[]): { name: string; iso: string } | null {
  const replacement = getEligibleReplacementProposer(excludedNames);
  if (!replacement) return null;
  return { name: replacement.name, iso: replacement.iso || getIsoForCountryName(replacement.name) };
}

export function clearReportedInvasionViolations(): void {
  reportedViolationIds.clear();
  violationHistory = {};
  historyInitialized = true;
  attackIdCounter = 0;
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(WAR_SANCTION_HISTORY_KEY);
    localStorage.removeItem(LEGACY_REPORTED_VIOLATIONS_KEY);
    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index);
      if (key?.startsWith(ATTACK_COUNTER_KEY_PREFIX)) localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Failed to clear PBB violation records:', error);
  }
}

export function forgetReportedInvasionViolation(
  _attackerCountry: string,
  _targetCountry: string,
  _reason: 'war_ban' | 'missing_military_resolution' | 'wrong_military_target'
): void {
  // Confirmed attack history is additive; a later mandate does not erase past violations.
}

export function submitInvasionViolationSanctions(
  attackerCountry: string,
  targetCountry: string,
  dateStr: string,
  reason: 'war_ban' | 'missing_military_resolution' | 'wrong_military_target',
  options: {
    attackId?: string;
    approvedMandates?: readonly ApprovedInvasionMandateSnapshot[];
    isPbbCoalition?: boolean;
    attackResult?: WarSanctionAttackResult;
    rng?: () => number;
  } = {}
): NotificationMessage[] {
  if (typeof window === 'undefined') return [];
  ensureHistoryLoaded();

  const attackId = options.attackId || createWarAttackId(dateStr);
  const attackerIdentity = getWarCountryIdentity(attackerCountry);
  const targetIdentity = getWarCountryIdentity(targetCountry);
  const violationId = makeViolationId(attackId, attackerIdentity, targetIdentity);
  const approvedMandates = options.approvedMandates || getApprovedInvasionMandatesSnapshot();
  const attackerIso = getIsoForCountryName(attackerCountry);
  const matchedMandate = approvedMandates.find(mandate =>
    mandate.status === 'passed' &&
    mandate.daysRemaining > 0 &&
    getWarCountryIdentity(mandate.proposerName) === attackerIdentity &&
    getWarCountryIdentity(mandate.targetName) === targetIdentity
  );
  const unauthorized = isUnauthorizedInvasion({
    attacker: attackerCountry,
    target: targetCountry,
    isPbbCoalition: options.isPbbCoalition === true,
    approvedMandates,
    attackerAnnexed: isCountryAnnexed(attackerCountry, attackerIso),
  });
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[PBBWarSanctions] Violation check', {
      attackId,
      unauthorized,
      reason,
      attackResult: options.attackResult || 'failed',
      matchedMandate,
      attackerAnnexed: isCountryAnnexed(attackerCountry, attackerIso),
      isPbbCoalition: options.isPbbCoalition === true,
    });
  }
  if (!unauthorized) return [];
  if (reportedViolationIds.has(violationId)) return [];

  const resolutions = loadActiveResolutions();
  const securityItems = loadActiveSecurityCouncilItems();
  if (
    resolutions.some(item => item.violationId === violationId) ||
    securityItems.some(item => item.violationId === violationId)
  ) {
    reportedViolationIds.add(violationId);
    return [];
  }

  const currentHistory = violationHistory[attackerIdentity] || [];
  const recentHistory = currentHistory.filter(entry => isWithinHistoryWindow(entry.date, dateStr));
  const violationCount = recentHistory.length + 1;
  reportedViolationIds.add(violationId);
  violationHistory[attackerIdentity] = [
    ...currentHistory,
    { attackId, date: dateStr, attackerIdentity, targetIdentity },
  ];
  persistHistory();
  const activeSanctions = getActiveSanctionTypes(attackerIdentity);
  const selection = selectSanctionTypes({
    attackResult: options.attackResult || 'failed',
    violationCount,
    activeSanctions,
    rng: options.rng,
  });
  if (selection.types.length === 0) return [];

  const proposer = getEligibleSanctionProposer([attackerCountry, targetCountry]);
  if (!proposer) return [];
  const selectedType = selection.types[0];
  const duration = chooseAIResolutionDuration(selectedType, 1);
  const suffix = encodeURIComponent(violationId);
  const isAssemblySanction = selectedType === 'arms_embargo' || selectedType === 'economic_embargo';

  if (isAssemblySanction) {
    spawnAIResolutionFromTrigger({
      proposerCountry: proposer.name,
      targetCountry: attackerCountry,
      resolutionType: selectedType,
      duration,
      violationId,
    }, dateStr);
  } else {
    spawnAISecurityCouncilFromTrigger({
      proposerCountry: proposer.name,
      targetCountry: attackerCountry,
      securityAction: selectedType,
      duration,
      violationId,
    }, dateStr);
  }

  window.dispatchEvent(new CustomEvent('pbb_active_resolutions_updated'));

  const sanctionGroup = isAssemblySanction ? 'Sidang Umum PBB' : 'Dewan Keamanan PBB';
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[PBBWarSanctions] Sanction selected', {
      attackId,
      tier: selection.tier,
      type: selectedType,
      violationCount,
      date: dateStr,
    });
  }
  return [{
    id: `notif-invasion-sanctions-${suffix}`,
    title: '⚠️ INVASI TANPA RESOLUSI DEWAN KEAMANAN PBB',
    sender: 'Sekretariat Perserikatan Bangsa-Bangsa',
    message: `${attackerCountry} menyerang ${targetCountry} tanpa mandat Resolusi Invasi PBB yang disetujui dan masih berlaku untuk target tersebut. ${getSanctionTitle(selectedType)} diajukan ke ${sanctionGroup}; sanksi hanya berlaku jika resolusi disetujui.`,
    timestamp: dateStr,
    type: 'peringkat',
    value: 100,
    isRead: false,
    priority: 'critical',
  }];
}

export function isTradeEmbargoActive(countryA: string, countryB: string): boolean {
  return isCountryUnderEconomicEmbargo(countryA) || isCountryUnderEconomicEmbargo(countryB);
}

export { isCountryUnderEconomicEmbargo } from './1_resolusi_PBB/logic/3_economicEmbargoLogic';
