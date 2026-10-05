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
import type { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

const REPORTED_VIOLATIONS_KEY = 'pbb_reported_war_ban_violations_v1';

export { isCountryUnderEconomicEmbargo } from './1_resolusi_PBB/logic/3_economicEmbargoLogic';

export function isTradeEmbargoActive(countryA: string, countryB: string): boolean {
  return isCountryUnderEconomicEmbargo(countryA) || isCountryUnderEconomicEmbargo(countryB);
}

function getReportedViolationIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REPORTED_VIOLATIONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch (error) {
    console.error('Failed loading reported PBB war-ban violations:', error);
    return [];
  }
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

  const violationId = makeViolationId(dateStr, attackerCountry, targetCountry, reason);
  const reportedIds = getReportedViolationIds();
  const legacyViolationId = [dateStr, attackerCountry, targetCountry]
    .map(normalizePbbCountryName)
    .join('|');
  if (reportedIds.includes(violationId) || reportedIds.includes(legacyViolationId)) return [];

  const proposer = {
    name: targetCountry,
    iso: getIsoForCountryName(targetCountry)
  };
  const attacker = {
    name: attackerCountry,
    iso: getIsoForCountryName(attackerCountry)
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
          ? `Embargo perdagangan ekonomi terhadap ${attackerCountry} karena menggunakan mandat invasi Dewan Keamanan PBB untuk menyerang negara yang bukan target resolusi.`
          : `Embargo perdagangan ekonomi terhadap ${attackerCountry} karena menyerang ${targetCountry} tanpa mengajukan Resolusi Invasi Militer Dewan Keamanan PBB.`,
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
          ? `Sanksi ekonomi terhadap ${attackerCountry} karena mandat invasi Dewan Keamanan PBB berlaku untuk target lain, bukan ${targetCountry}.`
          : `Sanksi ekonomi terhadap ${attackerCountry} karena menyerang ${targetCountry} tanpa mengajukan Resolusi Invasi Militer Dewan Keamanan PBB.`,
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

  try {
    localStorage.setItem(REPORTED_VIOLATIONS_KEY, JSON.stringify([...reportedIds, violationId]));
  } catch (error) {
    console.error('Failed saving reported PBB war-ban violations:', error);
  }

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
          ? `${attackerCountry} menyerang ${targetCountry}, padahal mandat Resolusi Invasi Militer Dewan Keamanan PBB yang dimilikinya tidak mencakup negara tersebut. Usulan sanksi ekonomi telah diajukan ke Dewan Keamanan dan Sidang Umum PBB; embargo hanya berlaku jika resolusi terkait disetujui.`
          : `${attackerCountry} menyerang ${targetCountry} tanpa mengajukan Resolusi Invasi Militer Dewan Keamanan PBB. Usulan sanksi ekonomi telah diajukan ke Dewan Keamanan dan Sidang Umum PBB; embargo hanya berlaku jika resolusi terkait disetujui.`,
      timestamp: dateStr,
      type: 'peringkat',
      value: 100,
      isRead: false
    }
  ];
}
