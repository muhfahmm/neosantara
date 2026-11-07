import type { NotificationMessage } from '../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { areSameWarCountry } from '../../../../detail_negara/3_operasi_militer/1_serang_negara/warCountryIdentity';

/**
 * Konfigurasi Permintaan Bantuan Sekutu
 */
export const BANTUAN_SEKUTU_CONFIG = {
  // Peluang default kemunculan saat syarat keras terpenuhi (100% untuk panggilan pertama)
  firstRequestChance: 1.0,
  // Peluang pemicu ulang berkala jika perang berlangsung dan sekutu terdesak
  recheckRequestChance: 0.8,
  // Jeda hari minimal sebelum bantuan dapat diminta ulang untuk perang yang sama
  recheckCooldownDays: 14,
  // Ambang progres terdesak sekutu (0.0 - 1.0)
  desperationThreshold: 0.5,
  // Batas waktu menjawab notifikasi dalam hari game
  deadlineDays: 7,
  // Penurunan hubungan diplomatik bila ditolak atau kedaluwarsa tanpa jawaban
  relationPenaltyReject: -3,
  // Penurunan hubungan dengan agresor bila pemain menerima bantuan sekutu
  relationPenaltyWithAttackerOnAccept: -15,
};

export type BantuanSekutuStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface BantuanSekutuNotification extends NotificationMessage {
  tradeType: 'bantuan_sekutu';
  category: 'Aliansi Pertahanan';
  requestId: string;
  allyCountry: string;
  attackerCountry: string;
  allyIso?: string;
  attackerIso?: string;
  deadlineDate: string;
  status: BantuanSekutuStatus;
  isHandled?: boolean;
  warProgress?: number;
  estimatedLosses?: number;
}

export interface AllyRequestContext {
  playerCountry: string;
  playerIso?: string;
  defenseAlliances: string[];
  activeWarsWithPlayer?: string[];
  enemiesOfAlly?: string[];
  attackerCountry: string;
  attackerIso?: string;
  targetCountry: string;
  targetIso?: string;
  currentDateStr: string;
  existingRequests?: BantuanSekutuNotification[];
  warProgress?: number;
  estimatedLosses?: number;
  isRecheck?: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  reason: string;
}

/**
 * Pengecekan syarat keras untuk permintaan bantuan sekutu:
 * 1. AI vs AI (bukan pemain sebagai penyerang atau target)
 * 2. Target memiliki aliansi pertahanan aktif dengan pemain
 * 3. Pemain tidak sedang berperang dengan target dan bukan musuh dari target
 * 4. Tidak ada permintaan pending untuk pasangan (penyerang, target) yang sama
 */
export function isEligibleForAllyRequest(context: AllyRequestContext): EligibilityResult {
  const {
    playerCountry,
    playerIso,
    defenseAlliances,
    activeWarsWithPlayer = [],
    attackerCountry,
    attackerIso,
    targetCountry,
    targetIso,
    existingRequests = [],
    isRecheck = false,
    warProgress = 0,
  } = context;

  if (!playerCountry || !attackerCountry || !targetCountry) {
    return { eligible: false, reason: 'Data negara tidak lengkap' };
  }

  // Syarat 1a: Bukan pemain sebagai penyerang
  if (areSameWarCountry(playerCountry, attackerCountry, playerIso, attackerIso)) {
    return { eligible: false, reason: 'Pemain adalah penyerang (bukan perang AI vs AI)' };
  }

  // Syarat 1b: Bukan pemain sebagai target
  if (areSameWarCountry(playerCountry, targetCountry, playerIso, targetIso)) {
    return { eligible: false, reason: 'Pemain adalah target langsung (bukan perang AI vs AI)' };
  }

  // Syarat 1c: Penyerang dan target bukan entitas yang sama
  if (areSameWarCountry(attackerCountry, targetCountry, attackerIso, targetIso)) {
    return { eligible: false, reason: 'Penyerang dan target adalah negara yang sama' };
  }

  // Syarat 2: Target memiliki aliansi pertahanan aktif dengan pemain
  const hasActiveAlliance = Array.isArray(defenseAlliances) && defenseAlliances.some(ally =>
    areSameWarCountry(ally, targetCountry, undefined, targetIso)
  );

  if (!hasActiveAlliance) {
    return { eligible: false, reason: 'Target tidak memiliki aliansi pertahanan aktif dengan pemain' };
  }

  // Syarat 3: Pemain tidak sedang berperang dengan target
  const isAtWarWithTarget = activeWarsWithPlayer.some(warCountry =>
    areSameWarCountry(warCountry, targetCountry, undefined, targetIso)
  );
  if (isAtWarWithTarget) {
    return { eligible: false, reason: 'Pemain sedang berperang dengan target aliansi' };
  }

  // Syarat 4: Cek permintaan yang sudah ada untuk pasangan perang yang sama
  const matchingRequests = existingRequests.filter(req =>
    req.tradeType === 'bantuan_sekutu' &&
    areSameWarCountry(req.allyCountry, targetCountry, req.allyIso, targetIso) &&
    areSameWarCountry(req.attackerCountry, attackerCountry, req.attackerIso, attackerIso)
  );

  const hasPending = matchingRequests.some(req => req.status === 'pending' && !req.isHandled);
  if (hasPending) {
    return { eligible: false, reason: 'Sudah ada permintaan bantuan sekutu yang masih berstatus pending' };
  }

  // Jika ini adalah evaluasi recheck berkala
  if (isRecheck) {
    if (warProgress < BANTUAN_SEKUTU_CONFIG.desperationThreshold) {
      return {
        eligible: false,
        reason: `Progres perang (${warProgress.toFixed(2)}) belum mencapai ambang terdesak (${BANTUAN_SEKUTU_CONFIG.desperationThreshold})`,
      };
    }

    // Cek cooldown dari permintaan terakhir
    const lastRequest = matchingRequests.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
    if (lastRequest) {
      const lastDate = new Date(lastRequest.timestamp).getTime();
      const curDate = new Date(context.currentDateStr).getTime();
      const diffDays = Math.floor((curDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays < BANTUAN_SEKUTU_CONFIG.recheckCooldownDays) {
        return {
          eligible: false,
          reason: `Masih dalam masa jeda ulang bantuan sekutu (${diffDays}/${BANTUAN_SEKUTU_CONFIG.recheckCooldownDays} hari)`,
        };
      }
    }
  }

  return { eligible: true, reason: 'Semua syarat keras terpenuhi' };
}

/**
 * Membuat notifikasi permintaan bantuan sekutu (Fungsi Murni)
 * rng diinjeksi untuk determinisme pengujian.
 */
export function createAllyHelpRequest(
  context: AllyRequestContext,
  rng: () => number = Math.random
): BantuanSekutuNotification | null {
  const eligibility = isEligibleForAllyRequest(context);

  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[BantuanSekutu] Evaluasi Kelayakan: ${eligibility.eligible ? 'Lolos' : 'Gagal'} - Alasan: ${eligibility.reason}`, {
      sekutu: context.targetCountry,
      penyerang: context.attackerCountry,
    });
  }

  if (!eligibility.eligible) {
    return null;
  }

  const roll = rng();
  const threshold = context.isRecheck
    ? BANTUAN_SEKUTU_CONFIG.recheckRequestChance
    : BANTUAN_SEKUTU_CONFIG.firstRequestChance;

  if (roll > threshold) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[BantuanSekutu] Roll peluang gagal: ${roll.toFixed(3)} > ${threshold}`);
    }
    return null;
  }

  const curDate = new Date(context.currentDateStr);
  const deadline = new Date(curDate);
  deadline.setDate(deadline.getDate() + BANTUAN_SEKUTU_CONFIG.deadlineDays);

  const deadlineDateStr = [
    deadline.getFullYear(),
    String(deadline.getMonth() + 1).padStart(2, '0'),
    String(deadline.getDate()).padStart(2, '0'),
  ].join('-');

  const uniqueId = `bantuan-sekutu-${context.targetCountry}-${context.attackerCountry}-${context.currentDateStr}`.replace(/\s+/g, '-').toLowerCase();

  const notification: BantuanSekutuNotification = {
    id: uniqueId,
    requestId: uniqueId,
    title: `🛡️ PERMINTAAN BANTUAN: ${context.targetCountry.toUpperCase()}`,
    sender: `KEMENTERIAN PERTAHANAN — ${context.targetCountry.toUpperCase()}`,
    message: `${context.targetCountry} diserang secara mendadak oleh kekuatan militer ${context.attackerCountry}. Berdasarkan Traktat Aliansi Pertahanan Bersama, sekutu meminta bantuan militer untuk mempertahankan kedaulatan wilayahnya.`,
    timestamp: context.currentDateStr,
    type: 'peringkat',
    tradeType: 'bantuan_sekutu',
    category: 'Aliansi Pertahanan',
    priority: 'critical',
    value: 100,
    isRead: false,
    allyCountry: context.targetCountry,
    attackerCountry: context.attackerCountry,
    allyIso: context.targetIso,
    attackerIso: context.attackerIso,
    deadlineDate: deadlineDateStr,
    status: 'pending',
    isHandled: false,
    warProgress: context.warProgress ?? 0,
    estimatedLosses: context.estimatedLosses ?? 0,
  };

  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[BantuanSekutu] Notifikasi Bantuan Dibuat: ${notification.id}`);
  }

  return notification;
}

/**
 * Mengevaluasi kedaluwarsa notifikasi (Fungsi Murni)
 */
export function expireAllyHelpRequest(
  request: BantuanSekutuNotification,
  context: {
    currentDateStr: string;
    isWarEnded: boolean;
    hasActiveAlliance: boolean;
  }
): BantuanSekutuNotification {
  if (request.status !== 'pending' || request.isHandled) {
    return request;
  }

  const isPastDeadline = context.currentDateStr > request.deadlineDate;
  const shouldExpire = isPastDeadline || context.isWarEnded || !context.hasActiveAlliance;

  if (shouldExpire) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[BantuanSekutu] Notifikasi ${request.id} Kedaluwarsa. Alasan: deadline=${isPastDeadline}, warEnded=${context.isWarEnded}, allianceLost=${!context.hasActiveAlliance}`);
    }
    return {
      ...request,
      status: 'expired',
      isHandled: true,
    };
  }

  return request;
}
