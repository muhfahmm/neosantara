import {
  calculate206AIVotes,
  loadActiveResolutions,
  saveActiveResolutions,
  type ActiveResolutionItem
} from './1_resolusi_PBB/logic/resolusiPBBUILogic';
import {
  calculate15SecurityCouncilVotes,
  loadActiveSecurityCouncilItems,
  saveActiveSecurityCouncilItems,
  type ActiveSecurityCouncilItem
} from './2_keamanan_PBB/logic/keamananPBBUILogic';
import { getIsoForCountryName } from './pbbCountryIso';
import { chooseAIResolutionDuration, normalizePbbCountryName } from './1_resolusi_PBB/logic/resolusiPBBUILogic';
import { isCountryUnderEconomicEmbargo } from './1_resolusi_PBB/logic/3_economicEmbargoLogic';
import { getEligibleReplacementProposer, isCountryAnnexed } from './pbbVotingEligibility';
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import type { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

const REPORTED_VIOLATIONS_KEY = 'pbb_reported_war_ban_violations_v1';
const reportedViolationIds = new Set<string>();
let initializedViolationTracking = false;

function initializeViolationTracking(): void {
  if (typeof window === 'undefined' || initializedViolationTracking) return;
  initializedViolationTracking = true;

  try {
    localStorage.removeItem(REPORTED_VIOLATIONS_KEY);
  } catch (error) {
    console.error('Failed to clear persisted PBB violation records:', error);
  }
}

initializeViolationTracking();

export function clearReportedInvasionViolations(): void {
  reportedViolationIds.clear();
  initializeViolationTracking();
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(REPORTED_VIOLATIONS_KEY);
  } catch (error) {
    console.error('Failed to clear PBB violation records:', error);
  }
}

export function forgetReportedInvasionViolation(
  attackerCountry: string,
  targetCountry: string,
  reason: 'war_ban' | 'missing_military_resolution' | 'wrong_military_target'
): void {
  const normalizeInvasionCountry = (countryName: string) => {
    const normalized = normalizePbbCountryName(countryName);
    return normalized === 'afghanistan' ? 'afganistan' : normalized;
  };
  const attacker = normalizeInvasionCountry(attackerCountry);
  const target = normalizeInvasionCountry(targetCountry);

  for (const violationId of reportedViolationIds) {
    const [, recordedAttacker, recordedTarget, recordedReason] = violationId.split('|');
    if (
      normalizeInvasionCountry(recordedAttacker || '') === attacker &&
      normalizeInvasionCountry(recordedTarget || '') === target &&
      recordedReason === reason
    ) {
      reportedViolationIds.delete(violationId);
    }
  }
}

export { isCountryUnderEconomicEmbargo } from './1_resolusi_PBB/logic/3_economicEmbargoLogic';

export function isTradeEmbargoActive(countryA: string, countryB: string): boolean {
  return isCountryUnderEconomicEmbargo(countryA) || isCountryUnderEconomicEmbargo(countryB);
}

function makeViolationId(dateStr: string, attackerCountry: string, targetCountry: string, reason: string): string {
  return [dateStr, attackerCountry, targetCountry, reason]
    .map(normalizePbbCountryName)
    .join('|');
}

export function submitInvasionViolationSanctions(
  attackerCountry: string,
  targetCountry: string,
  dateStr: string,
  reason: 'war_ban' | 'missing_military_resolution' | 'wrong_military_target'
): NotificationMessage[] {
  if (typeof window === 'undefined') return [];
  initializeViolationTracking();

  const violationId = makeViolationId(dateStr, attackerCountry, targetCountry, reason);
  if (reportedViolationIds.has(violationId)) return [];

  const attacker = {
    name: attackerCountry,
    iso: getIsoForCountryName(attackerCountry)
  };
  const target = {
    name: targetCountry,
    iso: getIsoForCountryName(targetCountry)
  };
  const eligibleReplacement = isCountryAnnexed(target.name, target.iso)
    ? getEligibleReplacementProposer([attacker.name, target.name])
    : target;
  const eligibleProposer = eligibleReplacement || (
    isCountryAnnexed(target.name, target.iso)
      ? COUNTRIES_DATA.find(country =>
          normalizePbbCountryName(country.country) !== normalizePbbCountryName(attacker.name) &&
          normalizePbbCountryName(country.country) !== normalizePbbCountryName(target.name) &&
          !isCountryAnnexed(country.country, country.iso)
        )
      : undefined
  );
  if (!eligibleProposer) return [];
  const proposer = {
    name: 'name' in eligibleProposer ? eligibleProposer.name : eligibleProposer.country,
    iso: eligibleProposer.iso || getIsoForCountryName(
      'name' in eligibleProposer ? eligibleProposer.name : eligibleProposer.country
    )
  };
  const duration = chooseAIResolutionDuration('economic_embargo', 1);
  const suffix = encodeURIComponent(violationId);
  const createdAt = dateStr;

  const resolutions = loadActiveResolutions();
  const securityItems = loadActiveSecurityCouncilItems();
  const resolutionAlreadyExists = resolutions.some(item => item.violationId === violationId);
  const securityAlreadyExists = securityItems.some(item => item.violationId === violationId);

  if (!resolutionAlreadyExists) {
    const votes = calculate206AIVotes(30, null, proposer.name, attacker.name, 'economic_embargo');
    const item: ActiveResolutionItem = {
      id: `res-user-violation-${suffix}`,
      proposer,
      target: attacker,
      type: 'economic_embargo',
      label: 'Embargo Ekonomi atas Pelanggaran Resolusi PBB',
      desc: reason === 'war_ban'
        ? `Embargo perdagangan ekonomi terhadap ${attackerCountry} sebagai sanksi atas pelanggaran larangan perang PBB.`
        : reason === 'wrong_military_target'
          ? `Embargo perdagangan ekonomi terhadap ${attackerCountry} karena menggunakan mandat invasi PBB untuk menyerang negara yang bukan target resolusi.`
          : `Embargo perdagangan ekonomi terhadap ${attackerCountry} karena menyerang ${targetCountry} tanpa mandat Resolusi Invasi PBB yang disetujui untuk target tersebut.`,
      duration,
      daysRemaining: 30,
      voteStats: {
        supportersCount: votes.supportersCount,
        opponentsCount: votes.opponentsCount,
        abstainCount: votes.abstainCount
      },
      userVote: null,
      status: 'voting',
      createdAt,
      lastProcessedDate: createdAt,
      notifiedDay1: true,
      violationId
    };
    saveActiveResolutions([item, ...resolutions]);
  }

  if (!securityAlreadyExists) {
    const votes = calculate15SecurityCouncilVotes(30, null, proposer.name, attacker.name, 'economic');
    const item: ActiveSecurityCouncilItem = {
      id: `sec-user-violation-${suffix}`,
      proposer,
      target: attacker,
      type: 'economic',
      label: 'Sanksi Ekonomi Dewan Keamanan atas Pelanggaran Resolusi PBB',
      desc: reason === 'war_ban'
        ? `Sanksi ekonomi Dewan Keamanan terhadap ${attackerCountry} sebagai respons atas pelanggaran larangan perang PBB.`
        : reason === 'wrong_military_target'
          ? `Sanksi ekonomi terhadap ${attackerCountry} karena mandat invasi PBB berlaku untuk target lain, bukan ${targetCountry}.`
          : `Sanksi ekonomi terhadap ${attackerCountry} karena menyerang ${targetCountry} tanpa mandat Resolusi Invasi PBB yang disetujui untuk target tersebut.`,
      duration,
      daysRemaining: 30,
      voteStats: {
        supportersCount: votes.supportersCount,
        opponentsCount: votes.opponentsCount,
        abstainCount: votes.abstainCount,
        vetoCount: votes.vetoCount
      },
      userVote: null,
      status: 'voting',
      createdAt,
      lastProcessedDate: createdAt,
      notifiedDay1: true,
      violationId
    };
    saveActiveSecurityCouncilItems([item, ...securityItems]);
  }

  reportedViolationIds.add(violationId);

  window.dispatchEvent(new CustomEvent('pbb_active_resolutions_updated'));

  return [
    {
      id: `notif-invasion-sanctions-${suffix}`,
      title: reason === 'war_ban'
        ? '⚠️ PELANGGARAN LARANGAN PERANG PBB'
        : '⚠️ INVASI TANPA RESOLUSI DEWAN KEAMANAN PBB',
      sender: 'Sekretariat Perserikatan Bangsa-Bangsa',
      message: reason === 'war_ban'
        ? `${attackerCountry} menyerang ${targetCountry} saat larangan perang global berlaku. Sanksi ekonomi telah diajukan bersamaan ke Dewan Keamanan dan Sidang Umum PBB; sanksi hanya berlaku jika resolusi masing-masing disetujui.`
        : reason === 'wrong_military_target'
          ? `${attackerCountry} menyerang ${targetCountry}, padahal mandat Resolusi Invasi PBB yang dimilikinya tidak mencakup negara tersebut. Usulan sanksi ekonomi telah diajukan ke Dewan Keamanan dan Sidang Umum PBB; embargo hanya berlaku jika resolusi terkait disetujui.`
          : `${attackerCountry} menyerang ${targetCountry} tanpa mandat Resolusi Invasi PBB yang disetujui untuk target tersebut. Usulan sanksi ekonomi telah diajukan ke Dewan Keamanan dan Sidang Umum PBB; embargo hanya berlaku jika resolusi terkait disetujui.`,
      timestamp: dateStr,
      type: 'peringkat',
      value: 100,
      isRead: false
    }
  ];
}
