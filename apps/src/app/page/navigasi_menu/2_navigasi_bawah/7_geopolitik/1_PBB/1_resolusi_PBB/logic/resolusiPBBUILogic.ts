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
  finishedAt?: string;
  notifiedDay1?: boolean;
  notified10Days?: boolean;
}

export const STORAGE_KEY_PBB_RESOLUSI = 'pbb_active_resolutions_v4';
export const TOTAL_UN_MEMBERS = 206;

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
    const data = localStorage.getItem(STORAGE_KEY_PBB_RESOLUSI);
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
    localStorage.setItem(STORAGE_KEY_PBB_RESOLUSI, JSON.stringify(items));
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
  const dateStr = getSimulationDateString();

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
      createdAt: dateStr,
      notified10Days: false
    }
  ];
}

/**
 * Pemrosesan daily tick kalender untuk Resolusi PBB:
 * - Menurunkan sisa hari (30 -> 0) berdasarkan selisih tanggal kalender
 * - Memperbarui partisipasi 206 negara AI secara progresif dari 0 hingga 206
 * - Memicu notifikasi popup Inbox jika sisa hari <= 10 dan user belum vote.
 */
export function tickPBBResolutions(dateStr: string, onTriggerNotification?: (notif: any) => void): ActiveResolutionItem[] {
  const currentItems = loadActiveResolutions();

  const updated = currentItems
    .map(item => {
      let startDate = item.createdAt || dateStr;
      let elapsedDays = getDaysDiff(startDate, dateStr);

      if (elapsedDays < 0) {
        startDate = dateStr;
        elapsedDays = 0;
      }

      // Jika resolusi sudah selesai (passed / rejected), hitung cooldown 30 hari untuk penghapusan
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
      const votes = calculate206AIVotes(newDaysRemaining, item.userVote);
      let notified = item.notified10Days || false;
      let notifiedDay1 = item.notifiedDay1 || false;

      // Trigger notifikasi inbox saat usulan baru dibuat / hari pertama (30 hari tersisa)
      if (newDaysRemaining >= 29 && !notifiedDay1) {
        notifiedDay1 = true;
        if (onTriggerNotification) {
          const notifCard = generateAIResolusiPBBNotification(
            item.proposer.name,
            item.target.name,
            15,
            dateStr
          );
          notifCard.title = `🏛️ USULAN RESOLUSI PBB BARU: ${item.proposer.name} ➔ ${item.target.name}`;
          notifCard.message = `Negara ${item.proposer.name} secara resmi mengajukan usulan "${item.label}" yang menargetkan ${item.target.name} di Majelis Umum PBB. Pemungutan suara telah dibuka selama 30 hari!`;
          onTriggerNotification(notifCard);
        }
      }

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
      let finishedAtDate: string | undefined = item.finishedAt;

      if (newDaysRemaining === 0) {
        finalStatus = votes.supportersCount > votes.opponentsCount ? 'passed' : 'rejected';
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
          abstainCount: votes.abstainCount
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

  saveActiveResolutions(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pbb_active_resolutions_updated'));
  }
  return updated;
}
