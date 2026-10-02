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
  notified10Days?: boolean;
}

const STORAGE_KEY = 'pbb_active_keamanan_v3';
export const TOTAL_SECURITY_MEMBERS = 15;

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
    const data = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
      createdAt: '2026-10-02',
      notified10Days: false
    }
  ];
}

/**
 * Pemrosesan daily tick kalender untuk Dewan Keamanan PBB:
 * - Menurunkan sisa hari (30 -> 0)
 * - Memperbarui partisipasi 15 anggota DK PBB dari 0 hingga 15
 * - Memicu notifikasi popup Inbox jika sisa hari <= 10 dan user belum vote.
 */
export function tickPBBSecurityCouncil(dateStr: string, onTriggerNotification?: (notif: any) => void): ActiveSecurityCouncilItem[] {
  const currentItems = loadActiveSecurityCouncilItems();

  const updated = currentItems.map(item => {
    if (item.status !== 'voting') return item;

    const newDaysRemaining = Math.max(0, item.daysRemaining - 1);
    const votes = calculate15SecurityCouncilVotes(newDaysRemaining, item.userVote);
    let notified = item.notified10Days || false;

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
    if (newDaysRemaining === 0) {
      if (votes.vetoCount > 0) {
        finalStatus = 'vetoed';
      } else {
        finalStatus = votes.supportersCount >= 9 ? 'passed' : 'rejected';
      }
    }

    return {
      ...item,
      daysRemaining: newDaysRemaining,
      voteStats: {
        supportersCount: votes.supportersCount,
        opponentsCount: votes.opponentsCount,
        abstainCount: votes.abstainCount,
        vetoCount: votes.vetoCount
      },
      status: finalStatus,
      notified10Days: notified
    };
  });

  saveActiveSecurityCouncilItems(updated);
  return updated;
}
