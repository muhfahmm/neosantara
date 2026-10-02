import { generateAIResolusiPBBNotification } from '@/app/page/menus/inbox/logic/5_notifikasi_geopolitik/5_pbb/1_resolusi/resolusiPBBLogic';

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
  notified10Days?: boolean;
}

const STORAGE_KEY = 'pbb_active_resolutions_v3';
export const TOTAL_UN_MEMBERS = 206;

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
  { type: 'economic_embargo', label: 'Embargo Perdagangan Ekonomi', desc: 'Pembekuan transaksi ekspor-impor utama dengan negara target.' },
  { type: 'production_ban', label: 'Larangan Produksi & Sektor Strategis', desc: 'Menghentikan eksplorasi dan manufaktur komoditas penting.' }
];

/**
 * Hitung kalkulasi perolehan 206 suara negara AI berdasarkan hari berjalan (30 hari).
 * Dimulai dari 0 pada hari ke-0 (Sisa 30 hari), dan terakumulasi seiring berjalannya kalender.
 * Negara yang SETUJU adalah negara yang memiliki hubungan diplomatik/kedubes dengan pengusul.
 */
export function calculate206AIVotes(
  daysRemaining: number,
  userVote: 'yes' | 'no' | 'abstain' | null = null,
  embassyCount: number = 38
) {
  const elapsedDays = Math.max(0, Math.min(30, 30 - daysRemaining));
  const progressRatio = elapsedDays / 30;

  // Total AI countries = 205 (selain user)
  const baseAiCount = 205;
  const votesCastSoFar = Math.min(baseAiCount, Math.round(baseAiCount * progressRatio));

  if (votesCastSoFar === 0) {
    return {
      supportersCount: userVote === 'yes' ? 1 : 0,
      opponentsCount: userVote === 'no' ? 1 : 0,
      abstainCount: userVote === 'abstain' ? 1 : 0,
      totalVotesCast: userVote ? 1 : 0
    };
  }

  // Negara yang punya kedubes/hubungan diplomatik memberikan suara SETUJU
  const supporterRatio = Math.max(0.20, Math.min(0.60, embassyCount / baseAiCount));
  
  let supportersCount = Math.round(votesCastSoFar * supporterRatio);
  let opponentsCount = Math.round(votesCastSoFar * (0.80 - supporterRatio));
  let abstainCount = votesCastSoFar - supportersCount - opponentsCount;

  if (userVote === 'yes') supportersCount += 1;
  if (userVote === 'no') opponentsCount += 1;
  if (userVote === 'abstain') abstainCount += 1;

  return { supportersCount, opponentsCount, abstainCount, totalVotesCast: votesCastSoFar + (userVote ? 1 : 0) };
}

export function loadActiveResolutions(): ActiveResolutionItem[] {
  if (typeof window === 'undefined') return getInitialActiveResolutions();
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed loading PBB resolutions:', e);
  }
  const init = getInitialActiveResolutions();
  saveActiveResolutions(init);
  return init;
}

export function saveActiveResolutions(items: ActiveResolutionItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed saving PBB resolutions:', e);
  }
}

export function getInitialActiveResolutions(userCountryName: string = 'Indonesia'): ActiveResolutionItem[] {
  const proposer = DEFAULT_AI_PROPOSERS[Math.floor(Math.random() * DEFAULT_AI_PROPOSERS.length)];
  const target = DEFAULT_AI_TARGETS[Math.floor(Math.random() * DEFAULT_AI_TARGETS.length)];
  const tmpl = RESOLUTION_TEMPLATES[Math.floor(Math.random() * RESOLUTION_TEMPLATES.length)];

  const initialDaysRemaining = 30; // Mulai dari 30 hari
  const initialVotes = calculate206AIVotes(initialDaysRemaining, null);

  return [
    {
      id: `res-ai-1`,
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
        abstainCount: initialVotes.abstainCount
      },
      userVote: null,
      status: 'voting',
      createdAt: '2026-10-01',
      notified10Days: false
    }
  ];
}

/**
 * Pemrosesan daily tick kalender untuk Resolusi PBB:
 * - Menurunkan sisa hari (30 -> 0)
 * - Memperbarui partisipasi 206 negara AI secara progresif dari 0 hingga 206
 * - Memicu notifikasi popup Inbox jika sisa hari <= 10 dan user belum vote.
 */
export function tickPBBResolutions(dateStr: string, onTriggerNotification?: (notif: any) => void): ActiveResolutionItem[] {
  const currentItems = loadActiveResolutions();

  const updated = currentItems.map(item => {
    if (item.status !== 'voting') return item;

    const newDaysRemaining = Math.max(0, item.daysRemaining - 1);
    const votes = calculate206AIVotes(newDaysRemaining, item.userVote);
    let notified = item.notified10Days || false;

    // Trigger popup inbox jika sisa hari <= 10 dan user belum vote
    if (newDaysRemaining <= 10 && !item.userVote && !notified) {
      notified = true;
      if (onTriggerNotification) {
        const notifCard = generateAIResolusiPBBNotification(
          item.proposer.name,
          item.target.name,
          15,
          dateStr
        );
        notifCard.title = `⚠️ PERINGATAN VOTING PBB (Sisa ${newDaysRemaining} Hari): ${item.proposer.name} ➔ ${item.target.name}`;
        notifCard.message = `Batas waktu tersisa ${newDaysRemaining} hari! Sidang Umum Majelis PBB membutuhkan suara Indonesia untuk usulan "${item.label}" yang menargetkan ${item.target.name}. Sejauh ini ${votes.supportersCount} negara setuju dan ${votes.opponentsCount} menolak.`;
        onTriggerNotification(notifCard);
      }
    }

    let finalStatus: 'voting' | 'passed' | 'rejected' = 'voting';
    if (newDaysRemaining === 0) {
      finalStatus = votes.supportersCount > votes.opponentsCount ? 'passed' : 'rejected';
    }

    return {
      ...item,
      daysRemaining: newDaysRemaining,
      voteStats: {
        supportersCount: votes.supportersCount,
        opponentsCount: votes.opponentsCount,
        abstainCount: votes.abstainCount
      },
      status: finalStatus,
      notified10Days: notified
    };
  });

  saveActiveResolutions(updated);
  return updated;
}
