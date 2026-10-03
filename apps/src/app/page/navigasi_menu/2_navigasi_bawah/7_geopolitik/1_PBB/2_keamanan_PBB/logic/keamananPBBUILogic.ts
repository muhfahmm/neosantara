import { generateAIKeamananPBBNotification } from '@/app/page/menus/inbox/logic/5_notifikasi_geopolitik/5_pbb/2_keamanan/keamananPBBLogic';

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
  status: 'voting' | 'passed' | 'vetoed' | 'rejected';
  createdAt: string;
  finishedAt?: string;
  notifiedDay1?: boolean;
  notified10Days?: boolean;
}

export const STORAGE_KEY_PBB_KEAMANAN = 'pbb_active_keamanan_v4';
export const TOTAL_SECURITY_MEMBERS = 15;

export function getSimulationDateString(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('neosantara_current_game_date');
    if (saved) return saved;
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
  { type: 'military', label: 'Resolusi Invasi Militer Gabungan PBB', desc: 'Otorisasi penggunaan kekuatan militer gabungan internasional.' },
  { type: 'economic', label: 'Blokade Ekonomi & Sanksi Perbankan', desc: 'Pembekuan modal internasional dan sanksi sistem pembayaran global.' },
  { type: 'naval', label: 'Blokade Perairan Laut & Navigasi', desc: 'Penutupan jalur perdagangan perairan internasional untuk kapal kargo target.' },
  { type: 'full', label: 'Isolasi Diplomatik Penuh', desc: 'Pemutusan hubungan konsuler dan penutupan seluruh perwakilan diplomasi.' }
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

/**
 * Hitung kalkulasi perolehan 15 suara Dewan Keamanan PBB (5 Tetap + 10 Tidak Tetap).
 * Dimulai dari 0 pada hari ke-0 (Sisa 30 hari), terakumulasi seiring waktu kalender.
 * Suara SETUJU diberikan oleh anggota DK yang memiliki hubungan diplomatik/kedubes.
 */
export function calculate15SecurityCouncilVotes(
  daysRemaining: number,
  userVote: 'yes' | 'no' | 'abstain' | null = null,
  alliedCouncilCount: number = 5
) {
  const elapsedDays = Math.max(0, Math.min(30, 30 - daysRemaining));
  const progressRatio = elapsedDays / 30;

  const baseCouncilCount = 15;
  const votesCastSoFar = Math.min(baseCouncilCount, Math.round(baseCouncilCount * progressRatio));

  if (votesCastSoFar === 0) {
    return {
      supportersCount: userVote === 'yes' ? 1 : 0,
      opponentsCount: userVote === 'no' ? 1 : 0,
      abstainCount: userVote === 'abstain' ? 1 : 0,
      vetoCount: 0,
      totalVotesCast: userVote ? 1 : 0
    };
  }

  // Porsi anggota DK yang memiliki hubungan diplomatik/kedubes (Setuju)
  const supporterRatio = Math.max(0.20, Math.min(0.60, alliedCouncilCount / baseCouncilCount));
  let supportersCount = Math.round(votesCastSoFar * supporterRatio);
  let opponentsCount = Math.round(votesCastSoFar * (0.80 - supporterRatio));
  let abstainCount = votesCastSoFar - supportersCount - opponentsCount;
  const vetoCount = opponentsCount >= 3 ? 1 : 0;

  if (userVote === 'yes') supportersCount += 1;
  if (userVote === 'no') opponentsCount += 1;
  if (userVote === 'abstain') abstainCount += 1;

  return { supportersCount, opponentsCount, abstainCount, vetoCount, totalVotesCast: votesCastSoFar + (userVote ? 1 : 0) };
}

export function loadActiveSecurityCouncilItems(): ActiveSecurityCouncilItem[] {
  if (typeof window === 'undefined') return getInitialActiveSecurityCouncilItems();
  try {
    const data = localStorage.getItem(STORAGE_KEY_PBB_KEAMANAN);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed loading PBB security council resolutions:', e);
  }
  const init = getInitialActiveSecurityCouncilItems();
  saveActiveSecurityCouncilItems(init);
  return init;
}

export function saveActiveSecurityCouncilItems(items: ActiveSecurityCouncilItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PBB_KEAMANAN, JSON.stringify(items));
  } catch (e) {
    console.error('Failed saving PBB security council resolutions:', e);
  }
}

export function getInitialActiveSecurityCouncilItems(userCountryName: string = 'Indonesia'): ActiveSecurityCouncilItem[] {
  const proposer = DEFAULT_SECURITY_PROPOSERS[Math.floor(Math.random() * DEFAULT_SECURITY_PROPOSERS.length)];
  const target = DEFAULT_SECURITY_TARGETS[Math.floor(Math.random() * DEFAULT_SECURITY_TARGETS.length)];
  const tmpl = SECURITY_TEMPLATES[Math.floor(Math.random() * SECURITY_TEMPLATES.length)];

  const initialDaysRemaining = 30; // Mulai dari 30 hari
  const initialVotes = calculate15SecurityCouncilVotes(initialDaysRemaining, null);
  const dateStr = getSimulationDateString();

  return [
    {
      id: `sec-ai-1`,
      proposer: proposer,
      target: target,
      type: tmpl.type,
      label: tmpl.label,
      desc: tmpl.desc,
      duration: '30 hari',
      daysRemaining: initialDaysRemaining,
      voteStats: {
        supportersCount: initialVotes.supportersCount,
        opponentsCount: initialVotes.opponentsCount,
        abstainCount: initialVotes.abstainCount,
        vetoCount: initialVotes.vetoCount
      },
      userVote: null,
      status: 'voting',
      createdAt: dateStr,
      notified10Days: false
    }
  ];
}

/**
 * Pemrosesan daily tick kalender untuk Dewan Keamanan PBB:
 * - Menurunkan sisa hari (30 -> 0) berdasarkan selisih tanggal kalender
 * - Memperbarui partisipasi 15 anggota DK PBB dari 0 hingga 15
 * - Memicu notifikasi popup Inbox jika sisa hari <= 10 dan user belum vote.
 */
export function tickPBBSecurityCouncil(dateStr: string, onTriggerNotification?: (notif: any) => void): ActiveSecurityCouncilItem[] {
  const currentItems = loadActiveSecurityCouncilItems();

  const updated = currentItems
    .map(item => {
      let startDate = item.createdAt || dateStr;
      let elapsedDays = getDaysDiff(startDate, dateStr);

      if (elapsedDays < 0) {
        startDate = dateStr;
        elapsedDays = 0;
      }

      // Jika sidang DK PBB sudah selesai (passed / vetoed / rejected), hitung cooldown 30 hari untuk penghapusan
      if (item.status !== 'voting') {
        const finishDate = item.finishedAt || dateStr;
        const cooldownElapsed = Math.max(0, getDaysDiff(finishDate, dateStr));
        const cooldownRemaining = Math.max(0, 30 - cooldownElapsed);

        return {
          ...item,
          finishedAt: finishDate,
          daysRemaining: cooldownRemaining
        };
      }

      const newDaysRemaining = Math.max(0, 30 - elapsedDays);
      const votes = calculate15SecurityCouncilVotes(newDaysRemaining, item.userVote);
      let notified = item.notified10Days || false;
      let notifiedDay1 = item.notifiedDay1 || false;

      // Trigger notifikasi inbox saat usulan baru dibuat / hari pertama (30 hari tersisa)
      if (newDaysRemaining >= 29 && !notifiedDay1) {
        notifiedDay1 = true;
        if (onTriggerNotification) {
          const notifCard = generateAIKeamananPBBNotification(
            item.proposer.name,
            item.target.name,
            10,
            dateStr
          );
          notifCard.title = `🛡️ USULAN DEWAN KEAMANAN PBB BARU: ${item.proposer.name} ➔ ${item.target.name}`;
          notifCard.message = `Negara ${item.proposer.name} secara resmi mengajukan draf Operasi Kritis "${item.label}" terhadap ${item.target.name} di Dewan Keamanan PBB. Pemungutan suara telah dimulai!`;
          onTriggerNotification(notifCard);
        }
      }

      // Trigger popup inbox jika sisa hari <= 10 dan user belum vote
      if (newDaysRemaining <= 10 && !item.userVote && !notified) {
        notified = true;
        if (onTriggerNotification) {
          const notifCard = generateAIKeamananPBBNotification(
            item.proposer.name,
            item.target.name,
            10,
            dateStr
          );
          notifCard.title = `🚨 PANGGILAN DARURAT DEWAN KEAMANAN PBB (Sisa ${newDaysRemaining} Hari): ${item.proposer.name} ➔ ${item.target.name}`;
          notifCard.message = `Batas waktu sidang tersisa ${newDaysRemaining} hari! Dewan Keamanan PBB memanggil Indonesia untuk memberikan suara atas draf "${item.label}" yang menargetkan ${item.target.name}.`;
          onTriggerNotification(notifCard);
        }
      }

      let finalStatus: 'voting' | 'passed' | 'vetoed' | 'rejected' = 'voting';
      let finishedAtDate: string | undefined = item.finishedAt;

      if (newDaysRemaining === 0) {
        if (votes.vetoCount > 0) {
          finalStatus = 'vetoed';
        } else {
          finalStatus = votes.supportersCount >= 9 ? 'passed' : 'rejected';
        }
        finishedAtDate = dateStr;
      }

      return {
        ...item,
        createdAt: startDate,
        finishedAt: finishedAtDate,
        daysRemaining: finalStatus !== 'voting' ? 30 : newDaysRemaining,
        voteStats: {
          supportersCount: votes.supportersCount,
          opponentsCount: votes.opponentsCount,
          abstainCount: votes.abstainCount,
          vetoCount: votes.vetoCount
        },
        status: finalStatus,
        notifiedDay1: notifiedDay1,
        notified10Days: notified
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
