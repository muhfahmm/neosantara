import { generateAIResolusiPBBNotification } from '@/app/page/menus/inbox/logic/5_notifikasi_geopolitik/5_pbb/1_resolusi/resolusiPBBLogic';
import { STATIC_PBB_VOTES } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/3_suara_negara_PBB/staticVoteData";
import { getIsoForCountryName } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbCountryIso";
import {
  getAnnexedCountryCount,
  getEligibleReplacementProposer,
  isCountryAnnexed,
} from "../../pbbVotingEligibility";
import {
  getCouncilVoteMultiplier,
  getCurrentElectionYear,
  getStoredCouncilMembers,
} from "../../2_keamanan_PBB/logika_anggota_tidak_tetap/securityCouncilElection";

export const PBB_RESOLUTION_DURATION_OPTIONS = ['1 bulan', '3 bulan', '6 bulan', '9 bulan', '1 tahun'] as const;

export function getResolutionDurationDays(duration: string | undefined): number {
  if (!duration) return 30;

  const match = duration.match(/(\d+)\s*(bulan|tahun)/i);
  if (!match) return 30;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return 30;
  return amount * (match[2].toLowerCase() === 'tahun' ? 360 : 30);
}

export function chooseAIResolutionDuration(resolutionType?: string, relationScore?: number): string {
  const options = resolutionType === 'economic_embargo' || resolutionType === 'economic' || resolutionType === 'full' ||
    (relationScore !== undefined && relationScore <= 5)
    ? ['6 bulan', '9 bulan', '1 tahun']
    : resolutionType === 'war_ban'
      ? ['3 bulan', '6 bulan', '9 bulan']
      : PBB_RESOLUTION_DURATION_OPTIONS;

  return options[Math.floor(Math.random() * options.length)];
}

export function isPassedResolutionActive(item: {
  status: string;
  daysRemaining: number;
}): boolean {
  return item.status === 'passed' && item.daysRemaining > 0;
}

export function normalizePbbCountryName(countryName: string): string {
  return countryName.toLowerCase().trim().replace(/\s+/g, ' ');
}

export interface ActiveResolutionItem {
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
  productKey?: string;
  duration: string;
  daysRemaining: number;
  voteStats: {
    supportersCount: number;
    opponentsCount: number;
    abstainCount: number;
  };
  userVote: 'yes' | 'no' | 'abstain' | null;
  status: 'voting' | 'passed' | 'rejected';
  createdAt: string;
  finishedAt?: string;
  lastProcessedDate?: string;
  violationId?: string;
  bribedCountries?: Record<string, 'yes' | 'no' | 'abstain'>;
  notifiedDay1?: boolean;
  notified10Days?: boolean;
  notifiedFinished?: boolean;
}

export const STORAGE_KEY_PBB_RESOLUSI = 'pbb_active_resolutions_v4';
export const TOTAL_UN_MEMBERS = 206;

let sessionResolutions: ActiveResolutionItem[] = [];
let initializedSessionResolutions = false;

function initializeSessionResolutions(): void {
  if (typeof window === 'undefined' || initializedSessionResolutions) return;

  try {
    localStorage.removeItem(STORAGE_KEY_PBB_RESOLUSI);
    initializedSessionResolutions = true;
  } catch (error) {
    console.error('Failed to clear persisted PBB General Assembly resolutions:', error);
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

const DEFAULT_AI_PROPOSERS = [
  { name: 'Amerika Serikat', iso: 'us' },
  { name: 'Rusia', iso: 'ru' },
  { name: 'China', iso: 'cn' },
  { name: 'Inggris', iso: 'gb' },
  { name: 'Perancis', iso: 'fr' },
  { name: 'Jerman', iso: 'de' },
  { name: 'Jepang', iso: 'jp' },
  { name: 'India', iso: 'in' },
  { name: 'Korea Utara', iso: 'kp' },
  { name: 'Iran', iso: 'ir' }
];

const DEFAULT_AI_TARGETS = [
  { name: 'Israel', iso: 'il' },
  { name: 'Ukraina', iso: 'ua' },
  { name: 'Taiwan', iso: 'tw' },
  { name: 'Korea Selatan', iso: 'kr' },
  { name: 'Arab Saudi', iso: 'sa' },
  { name: 'Suriah', iso: 'sy' },
  { name: 'Venezuela', iso: 've' }
];

const RESOLUTION_TEMPLATES = [
  { type: 'war_ban', label: 'Larangan Perang & Embargo Militer', desc: 'Penghentian kontak militer dan pelarangan transaksi alutsista.' },
  { type: 'arms_embargo', label: 'Embargo Penjualan Senjata Global', desc: 'Melarang seluruh anggota PBB memasok peralatan tempur ke negara target.' },
  { type: 'economic_embargo', label: 'Embargo Perdagangan Ekonomi', desc: 'Produksi sektor industri dan tambang selain emas serta pendapatan non-emas turun 60% selama periode yang dipilih.' },
  { type: 'production_ban', label: 'Larangan Produksi & Sektor Strategis', desc: 'Menghentikan eksplorasi dan manufaktur komoditas penting.' }
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

/**
 * Hitung kalkulasi perolehan 206 suara negara AI berdasarkan hari berjalan (30 hari).
 * Dimulai dari 0 pada hari ke-0 (Sisa 30 hari), dan terakumulasi seiring berjalannya kalender.
 * Suara kalkulasi dinamis berdasarkan hubungan Pengusul, Target, dan Tipe Resolusi.
 */
export function calculate206AIVotes(
  daysRemaining: number,
  userVote: 'yes' | 'no' | 'abstain' | null = null,
  proposerName: string = 'Amerika Serikat',
  targetName: string = 'Korea Selatan',
  resolutionType: string = 'arms_embargo',
  activeUserCountryName: string = getActiveUserCountryName()
) {
  const elapsedDays = Math.max(0, Math.min(30, 30 - daysRemaining));
  const progressRatio = elapsedDays / 30;

  // Total AI countries = 205 (selain user)
  const baseAiCount = Math.max(
    0,
    205 - getAnnexedCountryCount(
      STATIC_PBB_VOTES.map(country => ({
        name: country.name_id,
        iso: getIsoForCountryName(country.name_id),
      })),
      activeUserCountryName
    )
  );
  const votesCastSoFar = Math.min(baseAiCount, Math.round(baseAiCount * progressRatio));
  const activeUserIso = getIsoForCountryName(activeUserCountryName).toLowerCase();
  const currentElectionYear = getCurrentElectionYear();
  const activeLimitedMembers = getStoredCouncilMembers().filter(member =>
    currentElectionYear >= member.termStartYear &&
    currentElectionYear <= member.termEndYear
  );
  const limitedMemberVotesCast = activeLimitedMembers.filter(member =>
    member.iso !== activeUserIso &&
    !isCountryAnnexed(member.name, member.iso)
  ).length * progressRatio;
  const extraCouncilInfluenceVotes = limitedMemberVotesCast * 0.5;
  const userVoteWeight = activeLimitedMembers.some(member => member.iso === activeUserIso) ? 1.5 : 1;

  if (votesCastSoFar === 0) {
    const hasTarget = targetName && !targetName.toLowerCase().includes('global') && !targetName.toLowerCase().includes('dunia');
    let supportersCount = isCountryAnnexed(proposerName, getIsoForCountryName(proposerName)) ? 0 : 1;
    let opponentsCount = hasTarget && !isCountryAnnexed(targetName, getIsoForCountryName(targetName)) ? 1 : 0;
    let abstainCount = 0;

    if (userVote === 'yes') supportersCount += userVoteWeight;
    if (userVote === 'no') opponentsCount += userVoteWeight;
    if (userVote === 'abstain') abstainCount += userVoteWeight;

    return {
      supportersCount,
      opponentsCount,
      abstainCount,
      totalVotesCast: supportersCount + opponentsCount + abstainCount
    };
  }

  const seedStr = `${proposerName}_${targetName}_${resolutionType}`;
  const seed = stringHash(seedStr);

  let supporterRatio: number;
  let opponentRatio: number;

  if (resolutionType === 'war_ban' || targetName.includes('Global') || targetName.includes('Dunia')) {
    // Larangan Perang Global: mayoritas mendukung perdamaian
    supporterRatio = 0.60 + ((seed % 20) / 100); // 60% - 80%
    opponentRatio = 0.05 + (((seed * 3) % 15) / 100); // 5% - 20%
  } else {
    // Resolusi spesifik ke negara lain:
    // Tergantung seed unik pengusul & target
    const rawSupporter = 0.25 + ((seed % 35) / 100); // 25% - 60%
    const rawOpponent = 0.25 + (((seed * 7) % 35) / 100); // 25% - 60%

    // Batasi supporter + opponent max 85% agar ada porsi Abstain (dilema dua teman / netral)
    const totalRatio = rawSupporter + rawOpponent;
    if (totalRatio > 0.85) {
      supporterRatio = (rawSupporter / totalRatio) * 0.85;
      opponentRatio = (rawOpponent / totalRatio) * 0.85;
    } else {
      supporterRatio = rawSupporter;
      opponentRatio = rawOpponent;
    }
  }

  let supportersCount = Math.round(votesCastSoFar * supporterRatio) + (extraCouncilInfluenceVotes * supporterRatio);
  let opponentsCount = Math.round(votesCastSoFar * opponentRatio) + (extraCouncilInfluenceVotes * opponentRatio);
  let abstainCount =
    votesCastSoFar - Math.round(votesCastSoFar * supporterRatio) - Math.round(votesCastSoFar * opponentRatio) +
    (extraCouncilInfluenceVotes * (1 - supporterRatio - opponentRatio));

  if (userVote === 'yes') supportersCount += userVoteWeight;
  if (userVote === 'no') opponentsCount += userVoteWeight;
  if (userVote === 'abstain') abstainCount += userVoteWeight;

  return {
    supportersCount: Math.max(0, supportersCount),
    opponentsCount: Math.max(0, opponentsCount),
    abstainCount: Math.max(0, abstainCount),
    totalVotesCast: votesCastSoFar + extraCouncilInfluenceVotes + (userVote ? userVoteWeight : 0)
  };
}

export function loadActiveResolutions(): ActiveResolutionItem[] {
  if (typeof window === 'undefined') return getInitialActiveResolutions();
  initializeSessionResolutions();
  return [...sessionResolutions];
}

export function saveActiveResolutions(items: ActiveResolutionItem[]) {
  if (typeof window === 'undefined') return;
  initializeSessionResolutions();
  sessionResolutions = [...items];
}

export function clearActiveResolutionsForSession(): void {
  sessionResolutions = [];
  initializedSessionResolutions = true;
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY_PBB_RESOLUSI);
  } catch (error) {
    console.error('Failed to clear PBB General Assembly resolutions:', error);
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
 * Sidang baru hanya muncul dari pemicu bulanan (25%/bulan) atau dibuat oleh pemain.
 */
export function getInitialActiveResolutions(_userCountryName: string = 'Indonesia'): ActiveResolutionItem[] {
  return [];
}

const RESOLUTION_TYPE_META: Record<string, { label: string; desc: string }> = {
  war_ban: { label: 'Larangan Perang', desc: 'Dilarang melakukan peperangan antar negara di seluruh dunia selama periode yang dipilih.' },
  arms_embargo: { label: 'Embargo Penjualan Senjata', desc: 'Perdagangan senjata dilarang selama periode yang dipilih.' },
  economic_embargo: { label: 'Embargo Ekonomi', desc: 'Produksi sektor industri dan tambang selain emas serta pendapatan non-emas turun 60% selama periode yang dipilih.' },
  military_invasion: { label: 'Resolusi Invasi', desc: 'Resolusi memungkinkan negara diinvasi tanpa kecaman oleh negara lain.' },
  production_ban: { label: 'Larangan Produksi', desc: 'Produksi produk yang dipilih dihentikan selama periode yang dipilih.' }
};

/**
 * Membuat sidang Majelis Umum PBB nyata dari hasil pemicu bulanan AI.
 * Notifikasi inbox sudah dikirim oleh pemicu bulanan, jadi notifiedDay1 = true agar tidak dobel.
 */
export function spawnAIResolutionFromTrigger(
  trigger: { proposerCountry: string; targetCountry: string; resolutionType: string; duration?: string; productKey?: string },
  dateStr: string
): void {
  if (typeof window === 'undefined') return;
  if (isCountryAnnexed(trigger.proposerCountry, getIsoForCountryName(trigger.proposerCountry))) return;

  const meta = RESOLUTION_TYPE_META[trigger.resolutionType] || RESOLUTION_TYPE_META.arms_embargo;
  const isNoTarget = trigger.resolutionType === 'war_ban' || trigger.resolutionType === 'production_ban';
  const resolutionLabel = trigger.resolutionType === 'production_ban' && trigger.productKey
    ? `${meta.label}: ${trigger.productKey.replace(/_/g, ' ')}`
    : meta.label;
  const resolutionDescription = trigger.resolutionType === 'production_ban' && trigger.productKey
    ? `Produksi ${trigger.productKey.replace(/_/g, ' ')} dihentikan selama periode yang dipilih.`
    : meta.desc;

  const proposer = { name: trigger.proposerCountry, iso: getIsoForCountryName(trigger.proposerCountry) };
  const target = isNoTarget
    ? { name: trigger.resolutionType === 'production_ban' ? 'Sektor Komoditas Global' : 'Seluruh Dunia (Global)', iso: 'un' }
    : { name: trigger.targetCountry, iso: getIsoForCountryName(trigger.targetCountry) };

  const items = loadActiveResolutions();

  const votes = calculate206AIVotes(30, null, proposer.name, target.name, trigger.resolutionType);

  const newItem: ActiveResolutionItem = {
    id: `res-ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    proposer,
    target,
    type: trigger.resolutionType,
    label: resolutionLabel,
    desc: resolutionDescription,
    productKey: trigger.productKey,
    duration: trigger.duration || chooseAIResolutionDuration(),
    daysRemaining: 30,
    voteStats: {
      supportersCount: votes.supportersCount,
      opponentsCount: votes.opponentsCount,
      abstainCount: votes.abstainCount
    },
    userVote: null,
    status: 'voting',
    createdAt: dateStr,
    lastProcessedDate: dateStr,
    notifiedDay1: true,
    notified10Days: false
  };

  saveActiveResolutions([newItem, ...items]);
  window.dispatchEvent(new CustomEvent('pbb_active_resolutions_updated'));
}

/**
 * Pemrosesan daily tick kalender untuk Resolusi PBB:
 * - Menurunkan sisa hari (30 -> 0) berdasarkan selisih tanggal kalender
 * - Memperbarui partisipasi 206 negara AI secara progresif dari 0 hingga 206
 * - Memicu notifikasi popup Inbox jika sisa hari <= 10 dan user belum vote.
 */
export function tickPBBResolutions(
  dateStr: string,
  onTriggerNotification?: (notif: any) => void,
  userCountryName?: string
): ActiveResolutionItem[] {
  const currentItems = loadActiveResolutions();
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

  let updated: ActiveResolutionItem[] = eligibleItems
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
      const isUserSubmitted = item.id.startsWith('res-user-');
      if (!isUserSubmitted && proposer?.name && proposer.name.toLowerCase() === activeUser.toLowerCase()) {
        const availableProposers = DEFAULT_AI_PROPOSERS.filter(p => p.name.toLowerCase() !== activeUser.toLowerCase());
        proposer = availableProposers[Math.floor(Math.random() * availableProposers.length)] || { name: 'Rusia', iso: 'ru' };
      }

      // Passed resolutions remain active for their selected term; rejected items use a 30-day cleanup window.
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
      const votes = calculate206AIVotes(
        newDaysRemaining,
        eligibleUserVote,
        proposer?.name,
        item.target?.name,
        item.type,
        activeUser
      );
      let notified = item.notified10Days || false;
      let notifiedDay1 = item.notifiedDay1 || false;

      // Trigger notifikasi inbox saat usulan baru dibuat / hari pertama (30 hari tersisa)
      // Proteksi: Hanya kirim jika bukan atas nama user (kecuali resolusi yang memang dibuat user sendiri)
      const isUserProposer = proposer?.name?.toLowerCase() === activeUser.toLowerCase();
      const allowNotification = isUserSubmitted || !isUserProposer;

      const isNoTarget = item.type === 'war_ban' || item.type === 'production_ban' || 
        item.target.name.toLowerCase().includes('dunia') || 
        item.target.name.toLowerCase().includes('global') ||
        item.target.name.toLowerCase().includes('sektor');
        
      const durationText = item.duration || '30 Hari';
      const defaultTargetName = item.type === 'production_ban' ? 'Sektor Komoditas Global' : 'Seluruh Dunia (Global)';

      if (newDaysRemaining >= 29 && !notifiedDay1) {
        notifiedDay1 = true;
        if (onTriggerNotification && allowNotification) {
          const notifCard = generateAIResolusiPBBNotification(
            proposer.name,
            isNoTarget ? defaultTargetName : item.target.name,
            15,
            dateStr
          );
          if (isNoTarget) {
            notifCard.title = `🏛️ USULAN RESOLUSI PBB BARU: ${proposer.name}`;
            notifCard.message = `Negara ${proposer.name} secara resmi mengajukan usulan "${item.label}" selama ${durationText} untuk ${defaultTargetName} di Majelis Umum PBB. Pemungutan suara telah dibuka selama 30 hari!`;
          } else {
            notifCard.title = `🏛️ USULAN RESOLUSI PBB BARU: ${proposer.name} ➔ ${item.target.name}`;
            notifCard.message = `Negara ${proposer.name} secara resmi mengajukan usulan "${item.label}" yang menargetkan ${item.target.name} selama ${durationText} di Majelis Umum PBB. Pemungutan suara telah dibuka selama 30 hari!`;
          }
          notifCard.resolutionTitle = `${item.label} (${durationText})`;
          onTriggerNotification(notifCard);
        }
      }

      // Trigger popup inbox jika sisa hari <= 10 dan user belum vote
      if (newDaysRemaining <= 10 && !eligibleUserVote && !notified) {
        notified = true;
        if (onTriggerNotification && allowNotification) {
          const notifCard = generateAIResolusiPBBNotification(
            proposer.name,
            isNoTarget ? defaultTargetName : item.target.name,
            15,
            dateStr
          );
          if (isNoTarget) {
            notifCard.title = `⚠️ PERINGATAN VOTING PBB (SISA ${newDaysRemaining} HARI): ${proposer.name}`;
            notifCard.message = `Batas waktu tersisa ${newDaysRemaining} hari! Sidang Umum Majelis PBB membutuhkan suara ${activeUser} untuk usulan "${item.label}" selama ${durationText} untuk ${defaultTargetName}. Sejauh ini ${votes.supportersCount} negara setuju dan ${votes.opponentsCount} menolak.`;
          } else {
            notifCard.title = `⚠️ PERINGATAN VOTING PBB (SISA ${newDaysRemaining} HARI): ${proposer.name} ➔ ${item.target.name}`;
            notifCard.message = `Batas waktu tersisa ${newDaysRemaining} hari! Sidang Umum Majelis PBB membutuhkan suara ${activeUser} untuk usulan "${item.label}" yang menargetkan ${item.target.name} selama ${durationText}. Sejauh ini ${votes.supportersCount} negara setuju dan ${votes.opponentsCount} menolak.`;
          }
          notifCard.resolutionTitle = `${item.label} (${durationText})`;
          onTriggerNotification(notifCard);
        }
      }

      let finalStatus: 'voting' | 'passed' | 'rejected' = 'voting';
      let finishedAtDate: string | undefined = item.finishedAt;
      let notifiedFinished = item.notifiedFinished || false;

      if (newDaysRemaining === 0) {
        finalStatus = votes.supportersCount > votes.opponentsCount ? 'passed' : 'rejected';
        finishedAtDate = dateStr;

        if (!notifiedFinished) {
          notifiedFinished = true;
          // Kirimkan notifikasi selesai khusus jika ini resolusi buatan user atau mengikutsertakan negara user
          if (onTriggerNotification && (isUserSubmitted || isUserProposer)) {
            const statusLabel = finalStatus === 'passed' ? 'DITERIMA' : 'DITOLAK';
            const finishCard = generateAIResolusiPBBNotification(
              proposer.name,
              isNoTarget ? defaultTargetName : item.target.name,
              15,
              dateStr
            );
            finishCard.title = `🏛️ HASIL RESOLUSI PBB: ${item.label} (${statusLabel})`;
            if (isNoTarget) {
              finishCard.message = `Pemungutan suara Sidang Umum Majelis PBB untuk usulan "${item.label}" selama ${durationText} (Pengusul: ${proposer.name}, Target: ${defaultTargetName}) telah SELESAI. Perolehan suara akhir: ${votes.supportersCount} Setuju, ${votes.opponentsCount} Menolak, ${votes.abstainCount} Abstain. Status resmi: RESOLUSI ${statusLabel}.`;
            } else {
              finishCard.message = `Pemungutan suara Sidang Umum Majelis PBB untuk usulan "${item.label}" selama ${durationText} (Pengusul: ${proposer.name}, Target: ${item.target.name}) telah SELESAI. Perolehan suara akhir: ${votes.supportersCount} Setuju, ${votes.opponentsCount} Menolak, ${votes.abstainCount} Abstain. Status resmi: RESOLUSI ${statusLabel}.`;
            }
            finishCard.resolutionTitle = `${item.label} (${durationText})`;
            onTriggerNotification(finishCard);
          }
        }
      }

      return {
        ...item,
        createdAt: startDate,
        finishedAt: finishedAtDate,
        userVote: eligibleUserVote,
        daysRemaining: finalStatus === 'passed'
          ? getResolutionDurationDays(item.duration)
          : finalStatus === 'rejected'
            ? 30
            : newDaysRemaining,
        voteStats: {
          supportersCount: votes.supportersCount,
          opponentsCount: votes.opponentsCount,
          abstainCount: votes.abstainCount
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
        return false; // Terhapus secara otomatis setelah 30 hari cooldown selesai
      }
      return true;
    });

  saveActiveResolutions(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pbb_active_resolutions_updated'));
  }
  return updated;
}

export function getResolutionCountryBreakdown(
  resItem: ActiveResolutionItem,
  allCountries: { id: number; name: string; iso: string; continent: string }[],
  activeUserCountry: string = 'Indonesia'
): {
  supporters: { id: number; name: string; iso: string; continent: string; isProposer?: boolean; isTarget?: boolean; isUser?: boolean }[];
  opponents: { id: number; name: string; iso: string; continent: string; isProposer?: boolean; isTarget?: boolean; isUser?: boolean }[];
  abstain: { id: number; name: string; iso: string; continent: string; isProposer?: boolean; isTarget?: boolean; isUser?: boolean }[];
} {
  const safeCountries = Array.isArray(allCountries) && allCountries.length > 0
    ? allCountries
    : [{ id: 1, name: 'Indonesia', iso: 'id', continent: 'Asia' }];

  const targetSupporterCount = Math.max(0, resItem.voteStats.supportersCount);
  const targetOpponentCount = Math.max(0, resItem.voteStats.opponentsCount);
  const targetAbstainCount = Math.max(0, resItem.voteStats.abstainCount);

  const proposerName = resItem.proposer.name.toLowerCase();
  const targetName = resItem.target.name.toLowerCase();
  const userCountryName = activeUserCountry.toLowerCase();

  // User country object
  let userObj = safeCountries.find(c => c.name.toLowerCase() === userCountryName || c.iso.toLowerCase() === 'id');
  if (!userObj) {
    userObj = { id: 9990, name: activeUserCountry, iso: 'id', continent: 'Asia' };
  }

  // Proposer country object
  let proposerObj = safeCountries.find(c => c.name.toLowerCase() === proposerName || c.iso.toLowerCase() === resItem.proposer.iso.toLowerCase());
  if (!proposerObj) {
    proposerObj = { id: 9991, name: resItem.proposer.name, iso: resItem.proposer.iso, continent: 'Global' };
  }

  // Target country object
  let targetObj: typeof safeCountries[0] | null = null;
  if (!targetName.includes('global') && !targetName.includes('dunia')) {
    targetObj = safeCountries.find(c => c.name.toLowerCase() === targetName || c.iso.toLowerCase() === resItem.target.iso.toLowerCase()) || null;
    if (!targetObj && resItem.target.name) {
      targetObj = { id: 9992, name: resItem.target.name, iso: resItem.target.iso, continent: 'Global' };
    }
  }

  // Filter pool excluding proposer, target, and user country
  const pool = safeCountries.filter(c => {
    const cName = c.name.toLowerCase();
    if (cName === proposerName) return false;
    if (targetObj && cName === targetName) return false;
    if (cName === userCountryName) return false;
    return true;
  });

  const seededPool = pool.map(c => ({
    country: c,
    score: stringHash(`${resItem.id}_${c.iso}_${resItem.proposer.name}`)
  })).sort((a, b) => a.score - b.score);

  const isUserProposer = userCountryName === proposerName;
  const isUserTarget = Boolean(targetObj && userCountryName === targetName);
  const isProposerAnnexed = isCountryAnnexed(resItem.proposer.name, resItem.proposer.iso);
  const isTargetAnnexed = Boolean(targetObj && isCountryAnnexed(resItem.target.name, resItem.target.iso));
  const isUserAnnexed = isCountryAnnexed(activeUserCountry, userObj.iso);

  const supporters: (typeof safeCountries[0] & { isProposer?: boolean; isTarget?: boolean; isUser?: boolean })[] = [];
  if (!isProposerAnnexed) {
    supporters.push({ ...proposerObj, isProposer: true, isUser: isUserProposer });
  }

  if (!isUserProposer && !isUserTarget && !isUserAnnexed && resItem.userVote === 'yes') {
    supporters.push({ ...userObj, isUser: true });
  }

  // Target is ALWAYS #1 in opponents (Menolak)
  const opponents: (typeof safeCountries[0] & { isProposer?: boolean; isTarget?: boolean; isUser?: boolean })[] = [];
  if (targetObj && !isTargetAnnexed) {
    opponents.push({ ...targetObj, isTarget: true, isUser: isUserTarget });
  }

  // If User voted 'no' and user is not proposer/target
  if (!isUserProposer && !isUserTarget && !isUserAnnexed && resItem.userVote === 'no') {
    opponents.push({ ...userObj, isUser: true });
  }

  const abstain: (typeof safeCountries[0] & { isProposer?: boolean; isTarget?: boolean; isUser?: boolean })[] = [];

  // If User voted 'abstain' and user is not proposer/target
  if (!isUserProposer && !isUserTarget && !isUserAnnexed && resItem.userVote === 'abstain') {
    abstain.push({ ...userObj, isUser: true });
  }

  const bribedMap = resItem.bribedCountries || {};
  const unbribedPool = seededPool.filter(item =>
    !bribedMap[item.country.iso.toLowerCase()] && !isCountryAnnexed(item.country.name, item.country.iso)
  );
  const bribedList = seededPool.filter(item =>
    Boolean(bribedMap[item.country.iso.toLowerCase()]) && !isCountryAnnexed(item.country.name, item.country.iso)
  );

  bribedList.forEach(item => {
    const forcedVote = bribedMap[item.country.iso.toLowerCase()];
    if (forcedVote === 'yes') supporters.push(item.country);
    else if (forcedVote === 'no') opponents.push(item.country);
    else if (forcedVote === 'abstain') abstain.push(item.country);
  });

  unbribedPool.forEach((item) => {
    if (supporters.length < targetSupporterCount) {
      supporters.push(item.country);
    } else if (opponents.length < targetOpponentCount) {
      opponents.push(item.country);
    } else if (abstain.length < targetAbstainCount) {
      abstain.push(item.country);
    }
  });

  return { supporters, opponents, abstain };
}

export function getCountryPBBVote(countryName: string): number {
  if (!countryName) return 100;
  const norm = countryName.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const found = STATIC_PBB_VOTES.find(v => v.name_id.toLowerCase().replace(/[^a-z0-9]+/g, "") === norm);
  const baseVote = found?.un_vote || 100;
  return Math.round(baseVote * getCouncilVoteMultiplier(getIsoForCountryName(countryName)));
}

export function formatBribeCost(countryName: string): string {
  const vote = getCountryPBBVote(countryName);
  return `${vote.toLocaleString('id-ID')}.000`;
}
