import { generateAIKeamananPBBNotification } from '@/app/page/menus/inbox/logic/5_notifikasi_geopolitik/5_pbb/2_keamanan/keamananPBBLogic';
import { STATIC_PBB_VOTES } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/3_suara_negara_PBB/staticVoteData";
import { getIsoForCountryName } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbCountryIso";
import {
  chooseAIResolutionDuration,
  getResolutionDurationDays
} from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/resolusiPBBUILogic";
import {
  getAnnexedCountryCount,
  getEligibleReplacementProposer,
  isCountryAnnexed,
} from "../../pbbVotingEligibility";
import {
  getCouncilRoster,
  getCouncilVoteMultiplier,
  getStoredCouncilMembers,
  isLimitedVetoAvailable,
  markLimitedVetoUsed,
  PERMANENT_SECURITY_COUNCIL_MEMBERS,
} from "../logika_anggota_tidak_tetap/securityCouncilElection";

const PERMANENT_SECURITY_COUNCIL_MEMBER_ISOS = new Set(
  PERMANENT_SECURITY_COUNCIL_MEMBERS.map(member => member.iso)
);

export function isPermanentSecurityCouncilMember(countryIso: string): boolean {
  return PERMANENT_SECURITY_COUNCIL_MEMBER_ISOS.has(countryIso.toLowerCase().trim());
}

export function canUseSecurityCouncilVeto(countryIso: string, resolutionId?: string): boolean {
  const normalizedIso = countryIso.toLowerCase().trim();
  return isPermanentSecurityCouncilMember(normalizedIso) || isLimitedVetoAvailable(normalizedIso, resolutionId);
}

export interface ActiveSecurityCouncilItem {
  id: string;
  proposer: {
    name: string;
    iso: string;
  };
  target: {
    name: string;
    iso: string;
  };
  type: string;
  label: string;
  desc: string;
  duration: string;
  daysRemaining: number;
  voteStats: {
    supportersCount: number;
    opponentsCount: number;
    abstainCount: number;
    vetoCount: number;
  };
  userVote: 'yes' | 'no' | 'abstain' | null;
  userVeto?: boolean;
  userVetoIso?: string;
  status: 'voting' | 'passed' | 'vetoed' | 'rejected';
  createdAt: string;
  finishedAt?: string;
  lastProcessedDate?: string;
  violationId?: string;
  bribedCountries?: Record<string, 'yes' | 'no' | 'abstain' | 'veto'>;
  vetoedBy?: string[];
  notifiedDay1?: boolean;
  notified10Days?: boolean;
  notifiedFinished?: boolean;
}

export const STORAGE_KEY_PBB_KEAMANAN = 'pbb_active_keamanan_v4';
export const TOTAL_SECURITY_MEMBERS = 15;

let sessionOnlySecurityItems: ActiveSecurityCouncilItem[] = [];
let initializedSessionOnlySecurityItems = false;

function initializeSessionOnlySecurityItems(): void {
  if (typeof window === 'undefined' || initializedSessionOnlySecurityItems) return;
  initializedSessionOnlySecurityItems = true;

  try {
    localStorage.removeItem(STORAGE_KEY_PBB_KEAMANAN);
  } catch (error) {
    console.error('Failed to clear persisted PBB Security Council agenda:', error);
  }
}

export function getSimulationDateString(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('neosantara_current_game_date');
    if (saved) return saved;

    try {
      const saveStr = localStorage.getItem('presiden_simulator_load_save');
      if (saveStr) {
        const parsed = JSON.parse(saveStr);
        if (parsed?.game_date) return parsed.game_date;
      }
    } catch (e) {}
  }
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_SECURITY_PROPOSERS = [
  { name: 'Amerika Serikat', iso: 'us' },
  { name: 'Inggris', iso: 'gb' },
  { name: 'Perancis', iso: 'fr' },
  { name: 'Rusia', iso: 'ru' },
  { name: 'China', iso: 'cn' }
];

const DEFAULT_SECURITY_TARGETS = [
  { name: 'Korea Utara', iso: 'kp' },
  { name: 'Iran', iso: 'ir' },
  { name: 'Suriah', iso: 'sy' },
  { name: 'Myanmar', iso: 'mm' },
  { name: 'Sudan', iso: 'sd' }
];

const SECURITY_TEMPLATES = [
  { type: 'military', label: 'Invasi Militer Gabungan PBB', desc: 'Semua tentara bersatu dari semua negara menyerang negara yang dipilih.' },
  { type: 'support', label: 'Dukungan Diplomatik Internasional', desc: 'Dukungan kepada negara yang dipilih meningkatkan hubungan diplomatiknya dengan semua negara lain sebesar 10 unit.' },
  { type: 'economic', label: 'Blokade Ekonomi & Sanksi Industri', desc: 'Selama resolusi aktif, produksi manufaktur, peternakan, agrikultur, perikanan, olahan pangan, serta tambang selain emas berkurang 50%.' },
  { type: 'naval', label: 'Blokade Laut & Maritim', desc: 'Selama resolusi aktif, produksi manufaktur, peternakan, agrikultur, perikanan, olahan pangan, serta tambang selain emas berkurang 25%.' },
  { type: 'full', label: 'Blokade Penuh & Isolasi Perdagangan', desc: 'Selama periode yang dipilih, negara ini tidak dapat menandatangani kontrak apa pun atau berdagang.' },
  { type: 'treasure', label: 'Bantuan Logistik & Sumber Daya', desc: 'Memberikan bantuan sumber daya dan logistik ke negara yang dipilih.' }
];

function getDaysDiff(d1Str: string, d2Str: string): number {
  try {
    const p1 = d1Str.split('-').map(Number);
    const p2 = d2Str.split('-').map(Number);
    const t1 = Date.UTC(p1[0], p1[1] - 1, p1[2]);
    const t2 = Date.UTC(p2[0], p2[1] - 1, p2[2]);
    return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
}

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getSecurityCouncilOpponentRatio(
  seed: number,
  resolutionType: string,
  targetName: string
): number {
  if (resolutionType === 'war_ban' || targetName.toLowerCase().includes('global') || targetName.toLowerCase().includes('dunia')) {
    return 0.10 + (((seed * 3) % 15) / 100);
  }

  const rawSupporter = 0.30 + ((seed % 40) / 100);
  const rawOpponent = 0.20 + (((seed * 5) % 40) / 100);
  const totalRatio = rawSupporter + rawOpponent;
  return totalRatio > 0.85
    ? (rawOpponent / totalRatio) * 0.85
    : rawOpponent;
}

export function getSimulatedSecurityCouncilVetoerIsos(
  proposerName: string,
  targetName: string,
  resolutionType: string,
  votesCastSoFar: number,
  excludedCountryName = "",
  resolutionId?: string
): string[] {
  if (votesCastSoFar < 10) return [];

  const seedStr = `${proposerName}_${targetName}_${resolutionType}_${resolutionId || ""}`;
  const seed = stringHash(seedStr);
  const opponentRatio = getSecurityCouncilOpponentRatio(seed, resolutionType, targetName);
  const excludedNames = new Set([
    proposerName.toLowerCase().trim(),
    targetName.toLowerCase().trim(),
    excludedCountryName.toLowerCase().trim(),
  ]);

  const permanentVetoers = PERMANENT_SECURITY_COUNCIL_MEMBERS
    .filter(member =>
      !excludedNames.has(member.name.toLowerCase()) &&
      !isCountryAnnexed(member.name, member.iso) &&
      stringHash(`${seedStr}_${member.iso}_vote`) % 100 < opponentRatio * 100
    )
    .map(member => member.iso);
  if (!resolutionId) return permanentVetoers;

  const limitedVetoers = getStoredCouncilMembers()
    .filter(member =>
      !excludedNames.has(member.name.toLowerCase()) &&
      !isCountryAnnexed(member.name, member.iso) &&
      isLimitedVetoAvailable(member.iso, resolutionId) &&
      stringHash(`${seedStr}_${member.iso}_limited_veto`) % 100 < opponentRatio * 20
    )
    .map(member => member.iso);
  return [...permanentVetoers, ...limitedVetoers];
}

export function getSecurityCouncilVetoerIsos(
  proposerName: string,
  targetName: string,
  resolutionType: string,
  votesCastSoFar: number,
  activeUserCountryName = "",
  userVote: 'yes' | 'no' | 'abstain' | null = null,
  bribedCountries: Record<string, 'yes' | 'no' | 'abstain' | 'veto'> = {},
  resolutionId?: string,
  userVeto = false,
  userVetoIso?: string
): string[] {
  const vetoers = new Set(
    getSimulatedSecurityCouncilVetoerIsos(
      proposerName,
      targetName,
      resolutionType,
      votesCastSoFar,
      activeUserCountryName,
      resolutionId
    ).filter(iso => {
      const forcedVote = bribedCountries[iso.toLowerCase()];
      return !forcedVote || forcedVote === 'veto';
    })
  );
  vetoers.forEach(iso => {
    if (!isPermanentSecurityCouncilMember(iso)) markLimitedVetoUsed(iso, resolutionId || "");
  });

  Object.entries(bribedCountries).forEach(([iso, vote]) => {
    if (vote === 'veto' && isPermanentSecurityCouncilMember(iso)) {
      vetoers.add(iso.toLowerCase());
    }
  });

  const userIso = (userVetoIso || getIsoForCountryName(activeUserCountryName)).toLowerCase();
  if (
    userVote === 'no' &&
    userVeto &&
    canUseSecurityCouncilVeto(userIso, resolutionId) &&
    !isCountryAnnexed(activeUserCountryName, userIso)
  ) {
    vetoers.add(userIso);
  }

  return [...vetoers];
}

/**
 * Hitung kalkulasi perolehan 15 suara Dewan Keamanan PBB (5 Tetap + 10 Tidak Tetap).
 * Dimulai dari 0 pada hari ke-0 (Sisa 30 hari), terakumulasi seiring waktu kalender.
 * Suara kalkulasi dinamis berdasarkan hubungan Pengusul, Target, dan Tipe Resolusi.
 */
export function calculate15SecurityCouncilVotes(
  daysRemaining: number,
  userVote: 'yes' | 'no' | 'abstain' | null = null,
  proposerName: string = 'Amerika Serikat',
  targetName: string = 'Korea Utara',
  resolutionType: string = 'military',
  activeUserCountryName: string = getActiveUserCountryName(),
  resolutionId?: string,
  userVeto = false,
  userVetoIso?: string
) {
  const elapsedDays = Math.max(0, Math.min(30, 30 - daysRemaining));
  const progressRatio = elapsedDays / 30;

  const baseCouncilCount = Math.max(
    0,
    getCouncilRoster().length - getAnnexedCountryCount(getCouncilRoster())
  );
  const votesCastSoFar = Math.min(baseCouncilCount, Math.round(baseCouncilCount * progressRatio));

  if (votesCastSoFar === 0) {
    const hasTarget = targetName && !targetName.toLowerCase().includes('global') && !targetName.toLowerCase().includes('dunia');
    let supportersCount = isCountryAnnexed(proposerName, getIsoForCountryName(proposerName)) ? 0 : 1;
    let opponentsCount = hasTarget && !isCountryAnnexed(targetName, getIsoForCountryName(targetName)) ? 1 : 0;
    let abstainCount = 0;

    if (userVote === 'yes') supportersCount += 1;
    if (userVote === 'no' && !userVeto) opponentsCount += 1;
    if (userVote === 'abstain') abstainCount += 1;

    return {
      supportersCount,
      opponentsCount,
      abstainCount,
      vetoCount: userVote === 'no' &&
        userVeto &&
        canUseSecurityCouncilVeto(userVetoIso || getIsoForCountryName(activeUserCountryName), resolutionId) &&
        !isCountryAnnexed(activeUserCountryName, userVetoIso || getIsoForCountryName(activeUserCountryName))
          ? 1
          : 0,
      totalVotesCast: supportersCount + opponentsCount + abstainCount
    };
  }

  const seedStr = `${proposerName}_${targetName}_${resolutionType}`;
  const seed = stringHash(seedStr);

  let supporterRatio: number;
  let opponentRatio: number;

  if (resolutionType === 'war_ban' || targetName.toLowerCase().includes('global') || targetName.toLowerCase().includes('dunia')) {
    supporterRatio = 0.65 + ((seed % 20) / 100);
    opponentRatio = getSecurityCouncilOpponentRatio(seed, resolutionType, targetName);
  } else {
    const rawSupporter = 0.30 + ((seed % 40) / 100);
    const rawOpponent = 0.20 + (((seed * 5) % 40) / 100);
    const totalRatio = rawSupporter + rawOpponent;
    if (totalRatio > 0.85) {
      supporterRatio = (rawSupporter / totalRatio) * 0.85;
      opponentRatio = getSecurityCouncilOpponentRatio(seed, resolutionType, targetName);
    } else {
      supporterRatio = rawSupporter;
      opponentRatio = getSecurityCouncilOpponentRatio(seed, resolutionType, targetName);
    }
  }

  let supportersCount = Math.round(votesCastSoFar * supporterRatio);
  let opponentsCount = Math.round(votesCastSoFar * opponentRatio);
  let abstainCount = votesCastSoFar - supportersCount - opponentsCount;

  const vetoCount = getSecurityCouncilVetoerIsos(
    proposerName,
    targetName,
    resolutionType,
    votesCastSoFar,
    activeUserCountryName,
    userVote,
    {},
    resolutionId,
    userVeto,
    userVetoIso
  ).length;

  if (userVote === 'yes') supportersCount += 1;
  if (userVote === 'no' && !userVeto) opponentsCount += 1;
  if (userVote === 'abstain') abstainCount += 1;

  return {
    supportersCount: Math.max(0, supportersCount),
    opponentsCount: Math.max(0, opponentsCount),
    abstainCount: Math.max(0, abstainCount),
    vetoCount,
    totalVotesCast: votesCastSoFar + (userVote ? 1 : 0)
  };
}

export function loadActiveSecurityCouncilItems(): ActiveSecurityCouncilItem[] {
  if (typeof window === 'undefined') return [];
  initializeSessionOnlySecurityItems();
  return [...sessionOnlySecurityItems];
}

export function saveActiveSecurityCouncilItems(items: ActiveSecurityCouncilItem[]) {
  if (typeof window === 'undefined') return;
  initializeSessionOnlySecurityItems();
  sessionOnlySecurityItems = [...items];
}

export function clearActiveSecurityCouncilItems(): void {
  sessionOnlySecurityItems = [];
  initializedSessionOnlySecurityItems = true;
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY_PBB_KEAMANAN);
  } catch (error) {
    console.error('Failed to clear PBB Security Council agenda:', error);
  }
}

export function getActiveUserCountryName(userCountryName?: string): string {
  if (userCountryName && userCountryName.toLowerCase() !== 'indonesia') {
    return userCountryName;
  }
  if (typeof window !== 'undefined') {
    try {
      const saveStr = localStorage.getItem('presiden_simulator_load_save');
      if (saveStr) {
        const parsed = JSON.parse(saveStr);
        if (parsed.countryName) return parsed.countryName;
      }
    } catch (e) {}
  }
  return userCountryName || 'Indonesia';
}

/**
 * Default awal game / setelah refresh: KOSONG.
 * Sidang DK PBB baru hanya muncul dari pemicu bulanan (25%/bulan) atau dibuat oleh pemain.
 */
export function getInitialActiveSecurityCouncilItems(_userCountryName: string = 'Indonesia'): ActiveSecurityCouncilItem[] {
  return [];
}

/**
 * Membuat sidang Dewan Keamanan PBB nyata dari hasil pemicu bulanan AI.
 * Notifikasi inbox sudah dikirim oleh pemicu bulanan, jadi notifiedDay1 = true agar tidak dobel.
 */
export function spawnAISecurityCouncilFromTrigger(
  trigger: { proposerCountry: string; targetCountry: string; securityAction: string; duration?: string },
  dateStr: string
): void {
  if (typeof window === 'undefined') return;
  if (isCountryAnnexed(trigger.proposerCountry, getIsoForCountryName(trigger.proposerCountry))) return;

  const tmpl = SECURITY_TEMPLATES.find(t => t.type === trigger.securityAction) || SECURITY_TEMPLATES[0];

  const proposer = { name: trigger.proposerCountry, iso: getIsoForCountryName(trigger.proposerCountry) };
  const target = { name: trigger.targetCountry, iso: getIsoForCountryName(trigger.targetCountry) };

  const items = loadActiveSecurityCouncilItems();

  const votes = calculate15SecurityCouncilVotes(30, null, proposer.name, target.name, tmpl.type);

  const newItem: ActiveSecurityCouncilItem = {
    id: `sec-ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    proposer,
    target,
    type: tmpl.type,
    label: tmpl.label,
    desc: tmpl.desc,
    duration: trigger.duration || chooseAIResolutionDuration(),
    daysRemaining: 30,
    voteStats: {
      supportersCount: votes.supportersCount,
      opponentsCount: votes.opponentsCount,
      abstainCount: votes.abstainCount,
      vetoCount: votes.vetoCount
    },
    userVote: null,
    status: 'voting',
    createdAt: dateStr,
    lastProcessedDate: dateStr,
    notifiedDay1: true,
    notified10Days: false
  };

  saveActiveSecurityCouncilItems([newItem, ...items]);
  window.dispatchEvent(new CustomEvent('pbb_active_resolutions_updated'));
}

/**
 * Pemrosesan daily tick kalender untuk Dewan Keamanan PBB:
 * - Menurunkan sisa hari (30 -> 0) berdasarkan selisih tanggal kalender
 * - Memperbarui partisipasi 15 anggota DK PBB dari 0 hingga 15
 * - Memicu notifikasi popup Inbox jika sisa hari <= 10 dan user belum vote.
 */
export function tickPBBSecurityCouncil(
  dateStr: string,
  onTriggerNotification?: (notif: any) => void,
  userCountryName?: string
): ActiveSecurityCouncilItem[] {
  const currentItems = loadActiveSecurityCouncilItems();
  const activeUser = getActiveUserCountryName(userCountryName);
  const activeUserAnnexed = isCountryAnnexed(activeUser, getIsoForCountryName(activeUser));
  const eligibleItems = currentItems.flatMap(item => {
    if (item.status !== 'voting' || !isCountryAnnexed(item.proposer.name, item.proposer.iso)) {
      return [item];
    }

    if (!item.violationId) return [];

    const replacement = getEligibleReplacementProposer([
      item.proposer.name,
      item.target.name,
      activeUser,
    ]);
    if (!replacement) return [];

    return [{
      ...item,
      proposer: { name: replacement.name, iso: replacement.iso || getIsoForCountryName(replacement.name) },
    }];
  });

  let updated: ActiveSecurityCouncilItem[] = eligibleItems
    .map(item => {
      let startDate = item.createdAt || dateStr;
      const lastDate = item.lastProcessedDate || startDate;

      let dayStep = getDaysDiff(lastDate, dateStr);
      if (dayStep < 0) {
        dayStep = 0;
      }
      // Step Cap: maksimal berkurang 3 hari per tick untuk mencegah lonjakan akibat restart/refresh/date fallback
      const step = Math.min(dayStep, 3);

      // Protect: Ubah pengusul AI jika tidak sengaja sama dengan negara aktif user
      let proposer = item.proposer;
      const isUserSubmitted = item.id.startsWith('sec-user-');
      if (!isUserSubmitted && proposer?.name && proposer.name.toLowerCase() === activeUser.toLowerCase()) {
        const availableProposers = DEFAULT_SECURITY_PROPOSERS.filter(p => p.name.toLowerCase() !== activeUser.toLowerCase());
        proposer = availableProposers[Math.floor(Math.random() * availableProposers.length)] || { name: 'Amerika Serikat', iso: 'us' };
      }

      // Passed resolutions remain active for their selected term; failed items use a 30-day cleanup window.
      if (item.status !== 'voting') {
        const finishDate = item.finishedAt || dateStr;
        const cooldownRemaining = Math.max(0, item.daysRemaining - step);

        return {
          ...item,
          proposer,
          finishedAt: finishDate,
          daysRemaining: cooldownRemaining,
          lastProcessedDate: dateStr
        };
      }

      const newDaysRemaining = Math.max(0, item.daysRemaining - step);
      const eligibleUserVote = activeUserAnnexed ? null : item.userVote;
      const finalUserVote = newDaysRemaining === 0 && !activeUserAnnexed
        ? eligibleUserVote || 'abstain'
        : eligibleUserVote;
      const votes = calculate15SecurityCouncilVotes(
        newDaysRemaining,
        finalUserVote,
        proposer?.name,
        item.target?.name,
        item.type,
        activeUser,
        item.id,
        item.userVeto,
        item.userVetoIso
      );
      const eligibleCouncilCount = Math.max(
        0,
        getCouncilRoster().length - getAnnexedCountryCount(getCouncilRoster())
      );
      const elapsedRatio = Math.max(0, Math.min(1, (30 - newDaysRemaining) / 30));
      const vetoCount = getSecurityCouncilVetoerIsos(
        proposer?.name || "",
        item.target?.name || "",
        item.type,
        Math.round(eligibleCouncilCount * elapsedRatio),
        activeUser,
        finalUserVote,
        item.bribedCountries,
        item.id,
        item.userVeto,
        item.userVetoIso
      ).length;
      let notified = item.notified10Days || false;
      let notifiedDay1 = item.notifiedDay1 || false;

      // Trigger notifikasi inbox saat usulan baru dibuat / hari pertama (30 hari tersisa)
      // Proteksi: Hanya kirim jika bukan atas nama user (kecuali resolusi yang memang dibuat user sendiri)
      const isUserProposer = proposer?.name?.toLowerCase() === activeUser.toLowerCase();
      const allowNotification = isUserSubmitted || !isUserProposer;

      if (newDaysRemaining >= 29 && !notifiedDay1) {
        notifiedDay1 = true;
        if (onTriggerNotification && allowNotification) {
          const notifCard = generateAIKeamananPBBNotification(
            proposer.name,
            item.target.name,
            10,
            dateStr
          );
          notifCard.title = `🛡️ USULAN DEWAN KEAMANAN PBB BARU: ${proposer.name} ➔ ${item.target.name}`;
          notifCard.message = `Negara ${proposer.name} secara resmi mengajukan draf Operasi Kritis "${item.label}" terhadap ${item.target.name} di Dewan Keamanan PBB. Pemungutan suara telah dimulai!`;
          onTriggerNotification(notifCard);
        }
      }

      // Trigger popup inbox jika sisa hari <= 10 dan user belum vote
      if (newDaysRemaining <= 10 && !eligibleUserVote && !notified) {
        notified = true;
        if (onTriggerNotification && allowNotification) {
          const notifCard = generateAIKeamananPBBNotification(
            proposer.name,
            item.target.name,
            10,
            dateStr
          );
          notifCard.title = `🚨 PANGGILAN DARURAT DEWAN KEAMANAN PBB (Sisa ${newDaysRemaining} Hari): ${proposer.name} ➔ ${item.target.name}`;
          notifCard.message = `Batas waktu sidang tersisa ${newDaysRemaining} hari! Dewan Keamanan PBB memanggil ${activeUser} untuk memberikan suara atas draf "${item.label}" yang menargetkan ${item.target.name}.`;
          onTriggerNotification(notifCard);
        }
      }

      let finalStatus: 'voting' | 'passed' | 'vetoed' | 'rejected' = 'voting';
      let finishedAtDate: string | undefined = item.finishedAt;
      let notifiedFinished = item.notifiedFinished || false;

      if (newDaysRemaining === 0) {
        if (vetoCount > 0) {
          finalStatus = 'vetoed';
        } else {
          finalStatus = votes.supportersCount > votes.opponentsCount ? 'passed' : 'rejected';
        }
        finishedAtDate = dateStr;

        if (!notifiedFinished) {
          notifiedFinished = true;
          // Kirimkan notifikasi selesai khusus jika ini resolusi buatan user atau mengikutsertakan negara user
          if (onTriggerNotification && (isUserSubmitted || isUserProposer)) {
            const statusLabel = finalStatus === 'passed' ? 'DITERIMA' : (finalStatus === 'vetoed' ? 'DIVETO' : 'DITOLAK');
            const finishCard = generateAIKeamananPBBNotification(
              proposer.name,
              item.target.name,
              10,
              dateStr
            );
            finishCard.title = `🛡️ HASIL DEWAN KEAMANAN PBB: ${item.label} (${statusLabel})`;
            finishCard.message = `Pemungutan suara Dewan Keamanan PBB untuk draf "${item.label}" (Pengusul: ${proposer.name}, Target: ${item.target.name}) secara resmi telah SELESAI. Perolehan suara akhir: ${votes.supportersCount} Setuju, ${votes.opponentsCount} Menolak, ${votes.abstainCount} Abstain, ${vetoCount} Veto. Status resmi: RESOLUSI ${statusLabel}.`;
            onTriggerNotification(finishCard);
          }
        }
      }

      return {
        ...item,
        createdAt: startDate,
        finishedAt: finishedAtDate,
        userVote: finalUserVote,
        vetoedBy: getSecurityCouncilVetoerIsos(
          proposer?.name || "",
          item.target?.name || "",
          item.type,
          Math.round(eligibleCouncilCount * elapsedRatio),
          activeUser,
          finalUserVote,
          item.bribedCountries,
          item.id,
          item.userVeto,
          item.userVetoIso
        ),
        daysRemaining: finalStatus === 'passed'
          ? getResolutionDurationDays(item.duration)
          : finalStatus === 'vetoed' || finalStatus === 'rejected'
            ? 30
            : newDaysRemaining,
        voteStats: {
          supportersCount: votes.supportersCount,
          opponentsCount: votes.opponentsCount,
          abstainCount: votes.abstainCount,
          vetoCount
        },
        status: finalStatus,
        notifiedDay1: notifiedDay1,
        notified10Days: notified,
        notifiedFinished: notifiedFinished,
        lastProcessedDate: dateStr
      };
    })
    // Filter out item jika masa cooldown 30 hari pasca pemungutan suara telah habis (daysRemaining === 0 pada status finished)
    .filter(item => {
      if (item.status !== 'voting' && item.daysRemaining <= 0) {
        return false; // Terhapus secara otomatis
      }
      return true;
    });

  saveActiveSecurityCouncilItems(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pbb_active_resolutions_updated'));
  }
  return updated;
}

export function getCountryPBBVote(countryName: string): number {
  if (!countryName) return 100;
  const norm = countryName.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const found = STATIC_PBB_VOTES.find(v => v.name_id.toLowerCase().replace(/[^a-z0-9]+/g, "") === norm);
  const baseVote = found?.un_vote || 100;
  const countryIso = getIsoForCountryName(countryName).toLowerCase();
  return Math.round(baseVote * getCouncilVoteMultiplier(countryIso));
}

export function formatBribeCost(countryName: string): string {
  const vote = getCountryPBBVote(countryName);
  return `${vote.toLocaleString('id-ID')}.000`;
}

export function getSecurityCouncilCountryBreakdown(
  secItem: ActiveSecurityCouncilItem,
  allCountries: { id: number; name: string; iso: string; continent: string }[],
  activeUserCountry: string = 'Indonesia'
) {
  const safeCountries = Array.isArray(allCountries) && allCountries.length > 0
    ? allCountries
    : [
        { id: 1, name: 'Amerika Serikat', iso: 'us', continent: 'Amerika Utara' },
        { id: 2, name: 'Inggris', iso: 'gb', continent: 'Eropa' },
        { id: 3, name: 'Perancis', iso: 'fr', continent: 'Eropa' },
        { id: 4, name: 'Rusia', iso: 'ru', continent: 'Eropa' },
        { id: 5, name: 'China', iso: 'cn', continent: 'Asia' },
        { id: 6, name: 'Brazil', iso: 'br', continent: 'Amerika Selatan' },
        { id: 7, name: 'Jepang', iso: 'jp', continent: 'Asia' },
        { id: 8, name: 'India', iso: 'in', continent: 'Asia' },
        { id: 9, name: 'Jerman', iso: 'de', continent: 'Eropa' },
        { id: 10, name: 'Afrika Selatan', iso: 'za', continent: 'Afrika' },
        { id: 11, name: 'Mesir', iso: 'eg', continent: 'Afrika' },
        { id: 12, name: 'Meksiko', iso: 'mx', continent: 'Amerika Utara' },
        { id: 13, name: 'Indonesia', iso: 'id', continent: 'Asia' },
        { id: 14, name: 'Polandia', iso: 'pl', continent: 'Eropa' },
        { id: 15, name: 'Australia', iso: 'au', continent: 'Oseania' },
      ];

  const targetSupporterCount = secItem.voteStats.supportersCount;
  const targetOpponentCount = secItem.voteStats.opponentsCount;
  const activeCouncilMembers = getCouncilRoster().filter(member =>
    !isCountryAnnexed(member.name, member.iso)
  );
  const councilCountries = activeCouncilMembers.map((member, index) =>
    safeCountries.find(country => country.iso.toLowerCase() === member.iso.toLowerCase()) || {
      id: 9994 + index,
      name: member.name,
      iso: member.iso,
      continent: 'Dewan Keamanan PBB'
    }
  );
  const councilIsoSet = new Set(activeCouncilMembers.map(member => member.iso.toLowerCase()));
  const elapsedRatio = Math.max(0, Math.min(1, (30 - secItem.daysRemaining) / 30));
  const votesCastSoFar = Math.round(activeCouncilMembers.length * elapsedRatio);
  const fallbackVetoedIsos = secItem.status === 'voting' || secItem.voteStats.vetoCount > 0
    ? getSecurityCouncilVetoerIsos(
        secItem.proposer.name,
        secItem.target.name,
        secItem.type,
        secItem.status === 'voting' ? votesCastSoFar : activeCouncilMembers.length,
        activeUserCountry,
        secItem.userVote,
        secItem.bribedCountries,
        secItem.id,
        secItem.userVeto,
        secItem.userVetoIso
      )
    : [];
  const vetoedIsos = new Set(
    (Array.isArray(secItem.vetoedBy) ? secItem.vetoedBy : fallbackVetoedIsos)
      .map(iso => iso.toLowerCase())
  );

  const proposerName = secItem.proposer.name.toLowerCase();
  const targetName = secItem.target.name.toLowerCase();
  const userCountryName = activeUserCountry.toLowerCase();

  let userObj = councilCountries.find(c => c.name.toLowerCase() === userCountryName);
  if (!userObj) {
    userObj = { id: 9990, name: activeUserCountry, iso: 'id', continent: 'Asia' };
  }

  let proposerObj = councilCountries.find(c => c.name.toLowerCase() === proposerName || c.iso.toLowerCase() === secItem.proposer.iso.toLowerCase());
  if (!proposerObj) {
    proposerObj = { id: 9991, name: secItem.proposer.name, iso: secItem.proposer.iso, continent: 'Global' };
  }

  let targetObj: typeof safeCountries[0] | null = null;
  if (!targetName.includes('global') && !targetName.includes('dunia')) {
    targetObj = councilCountries.find(c => c.name.toLowerCase() === targetName || c.iso.toLowerCase() === secItem.target.iso.toLowerCase()) || null;
    if (!targetObj && secItem.target.name) {
      targetObj = { id: 9992, name: secItem.target.name, iso: secItem.target.iso, continent: 'Global' };
    }
  }

  const pool = councilCountries.filter(c => {
    const cName = c.name.toLowerCase();
    if (cName === proposerName) return false;
    if (targetObj && cName === targetName) return false;
    if (cName === userCountryName) return false;
    return true;
  });

  const seededPool = pool.map(c => ({
    country: c,
    score: stringHash(`${secItem.id}_${c.iso}_${secItem.proposer.name}`)
  })).sort((a, b) => a.score - b.score);

  const isUserProposer = userCountryName === proposerName;
  const isUserTarget = Boolean(targetObj && userCountryName === targetName);

  const isProposerAnnexed = isCountryAnnexed(secItem.proposer.name, secItem.proposer.iso);
  const isTargetAnnexed = Boolean(targetObj && isCountryAnnexed(secItem.target.name, secItem.target.iso));
  const isUserAnnexed = isCountryAnnexed(activeUserCountry, userObj.iso);

  const supporters: (typeof safeCountries[0] & { isProposer?: boolean; isTarget?: boolean; isUser?: boolean })[] = [];
  if (!isProposerAnnexed) {
    if (councilIsoSet.has(proposerObj.iso.toLowerCase())) {
      supporters.push({ ...proposerObj, isProposer: true, isUser: isUserProposer });
    }
  }

  if (councilIsoSet.has(userObj.iso.toLowerCase()) && !isUserProposer && !isUserTarget && !isUserAnnexed && secItem.userVote === 'yes') {
    supporters.push({ ...userObj, isUser: true });
  }

  const opponents: (typeof safeCountries[0] & { isProposer?: boolean; isTarget?: boolean; isUser?: boolean })[] = [];
  const veto: (typeof safeCountries[0] & { isProposer?: boolean; isTarget?: boolean; isUser?: boolean })[] = [];
  if (targetObj && councilIsoSet.has(targetObj.iso.toLowerCase()) && !isTargetAnnexed) {
    opponents.push({ ...targetObj, isTarget: true, isUser: isUserTarget });
  }

  if (councilIsoSet.has(userObj.iso.toLowerCase()) && !isUserProposer && !isUserTarget && !isUserAnnexed && secItem.userVote === 'no') {
    if (secItem.userVeto && canUseSecurityCouncilVeto(secItem.userVetoIso || userObj.iso, secItem.id)) {
      veto.push({ ...userObj, isUser: true });
    } else {
      opponents.push({ ...userObj, isUser: true });
    }
  }

  const abstain: (typeof safeCountries[0] & { isProposer?: boolean; isTarget?: boolean; isUser?: boolean })[] = [];
  if (councilIsoSet.has(userObj.iso.toLowerCase()) && !isUserProposer && !isUserTarget && !isUserAnnexed && secItem.userVote === 'abstain') {
    abstain.push({ ...userObj, isUser: true });
  }

  const bribedMap = secItem.bribedCountries || {};
  const unbribedPool = seededPool.filter(item =>
    !bribedMap[item.country.iso.toLowerCase()] &&
    !vetoedIsos.has(item.country.iso.toLowerCase()) &&
    !isCountryAnnexed(item.country.name, item.country.iso)
  );
  const bribedList = seededPool.filter(item =>
    Boolean(bribedMap[item.country.iso.toLowerCase()]) && !isCountryAnnexed(item.country.name, item.country.iso)
  );

  bribedList.forEach(item => {
    const forcedVote = bribedMap[item.country.iso.toLowerCase()];
    if (forcedVote === 'yes') supporters.push(item.country);
    else if (forcedVote === 'no') opponents.push(item.country);
    else if (forcedVote === 'abstain') abstain.push(item.country);
    else if (forcedVote === 'veto' && isPermanentSecurityCouncilMember(item.country.iso)) {
      opponents.push(item.country);
      veto.push(item.country);
    } else if (forcedVote === 'veto') {
      opponents.push(item.country);
      veto.push(item.country);
    }
  });

  vetoedIsos.forEach(iso => {
    if (veto.some(member => member.iso.toLowerCase() === iso)) return;
    const member = getCouncilRoster().find(country => country.iso === iso);
    if (!member || isCountryAnnexed(member.name, member.iso)) return;
    const country = councilCountries.find(candidate => candidate.iso.toLowerCase() === iso) || {
      id: 9993 + veto.length,
      name: member.name,
      iso: member.iso,
      continent: 'Dewan Keamanan PBB'
    };
    if (!opponents.some(country => country.iso.toLowerCase() === iso)) {
      opponents.push(country);
    }
    veto.push({
      ...country,
      isProposer: member.name.toLowerCase() === proposerName,
      isTarget: member.name.toLowerCase() === targetName,
      isUser: member.name.toLowerCase() === userCountryName
    });
  });

  unbribedPool.forEach((item) => {
    if (supporters.length < targetSupporterCount) {
      supporters.push(item.country);
    } else if (opponents.length < targetOpponentCount) {
      opponents.push(item.country);
    } else if (abstain.length < secItem.voteStats.abstainCount) {
      abstain.push(item.country);
    }
  });

  supporters.length = Math.min(supporters.length, Math.max(0, secItem.voteStats.supportersCount));
  opponents.length = Math.min(opponents.length, Math.max(0, targetOpponentCount));
  abstain.length = Math.min(abstain.length, Math.max(0, secItem.voteStats.abstainCount));
  veto.length = Math.min(veto.length, Math.max(0, secItem.voteStats.vetoCount));

  return { supporters, opponents, abstain, veto };
}
