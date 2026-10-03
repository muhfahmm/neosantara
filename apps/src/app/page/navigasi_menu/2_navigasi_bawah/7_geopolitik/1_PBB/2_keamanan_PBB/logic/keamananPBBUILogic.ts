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
  lastProcessedDate?: string;
  notifiedDay1?: boolean;
  notified10Days?: boolean;
  notifiedFinished?: boolean;
}

export const STORAGE_KEY_PBB_KEAMANAN = 'pbb_active_keamanan_v4';
export const TOTAL_SECURITY_MEMBERS = 15;

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
 * Hitung kalkulasi perolehan 15 suara Dewan Keamanan PBB (5 Tetap + 10 Tidak Tetap).
 * Dimulai dari 0 pada hari ke-0 (Sisa 30 hari), terakumulasi seiring waktu kalender.
 * Suara kalkulasi dinamis berdasarkan hubungan Pengusul, Target, dan Tipe Resolusi.
 */
export function calculate15SecurityCouncilVotes(
  daysRemaining: number,
  userVote: 'yes' | 'no' | 'abstain' | null = null,
  proposerName: string = 'Amerika Serikat',
  targetName: string = 'Korea Utara',
  resolutionType: string = 'military'
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

  const seedStr = `${proposerName}_${targetName}_${resolutionType}`;
  const seed = stringHash(seedStr);

  let supporterRatio: number;
  let opponentRatio: number;

  if (resolutionType === 'war_ban' || targetName.includes('Global') || targetName.includes('Dunia')) {
    supporterRatio = 0.65 + ((seed % 20) / 100);
    opponentRatio = 0.10 + (((seed * 3) % 15) / 100);
  } else {
    const rawSupporter = 0.30 + ((seed % 40) / 100);
    const rawOpponent = 0.20 + (((seed * 5) % 40) / 100);
    const totalRatio = rawSupporter + rawOpponent;
    if (totalRatio > 0.85) {
      supporterRatio = (rawSupporter / totalRatio) * 0.85;
      opponentRatio = (rawOpponent / totalRatio) * 0.85;
    } else {
      supporterRatio = rawSupporter;
      opponentRatio = rawOpponent;
    }
  }

  let supportersCount = Math.round(votesCastSoFar * supporterRatio);
  let opponentsCount = Math.round(votesCastSoFar * opponentRatio);
  let abstainCount = votesCastSoFar - supportersCount - opponentsCount;

  // Veto terjadi jika penentang dari Anggota Tetap (misal >= 2 pada voting akhir)
  const vetoCount = (opponentsCount >= 2 && votesCastSoFar >= 10) ? 1 : 0;

  if (userVote === 'yes') supportersCount += 1;
  if (userVote === 'no') opponentsCount += 1;
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
  if (typeof window === 'undefined') return getInitialActiveSecurityCouncilItems();
  try {
    const data = localStorage.getItem(STORAGE_KEY_PBB_KEAMANAN);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
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

export function getInitialActiveSecurityCouncilItems(userCountryName: string = 'Indonesia'): ActiveSecurityCouncilItem[] {
  const activeUser = getActiveUserCountryName(userCountryName);
  const availableProposers = DEFAULT_SECURITY_PROPOSERS.filter(p => 
    p.name.toLowerCase() !== activeUser.toLowerCase() && 
    p.iso.toLowerCase() !== activeUser.toLowerCase()
  );
  const proposersList = availableProposers.length > 0 ? availableProposers : DEFAULT_SECURITY_PROPOSERS;
  const proposer = proposersList[Math.floor(Math.random() * proposersList.length)];

  const availableTargets = DEFAULT_SECURITY_TARGETS.filter(t => 
    t.name.toLowerCase() !== proposer.name.toLowerCase()
  );
  const target = availableTargets[Math.floor(Math.random() * availableTargets.length)] || DEFAULT_SECURITY_TARGETS[0];
  const tmpl = SECURITY_TEMPLATES[Math.floor(Math.random() * SECURITY_TEMPLATES.length)];

  const initialDaysRemaining = 30; // Mulai dari 30 hari
  const initialVotes = calculate15SecurityCouncilVotes(initialDaysRemaining, null, proposer.name, target.name, tmpl.type);
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
  const activeUser = getActiveUserCountryName();

  let updated: ActiveSecurityCouncilItem[] = currentItems
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

      // Jika sidang DK PBB sudah selesai (passed / vetoed / rejected), hitung cooldown 30 hari untuk penghapusan
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
      const votes = calculate15SecurityCouncilVotes(newDaysRemaining, item.userVote, proposer?.name, item.target?.name, item.type);
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
      if (newDaysRemaining <= 10 && !item.userVote && !notified) {
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
        if (votes.vetoCount > 0) {
          finalStatus = 'vetoed';
        } else {
          finalStatus = votes.supportersCount >= 9 ? 'passed' : 'rejected';
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
            finishCard.message = `Pemungutan suara Dewan Keamanan PBB untuk draf "${item.label}" (Pengusul: ${proposer.name}, Target: ${item.target.name}) secara resmi telah SELESAI. Perolehan suara akhir: ${votes.supportersCount} Setuju, ${votes.opponentsCount} Menolak, ${votes.abstainCount} Abstain, ${votes.vetoCount} Veto. Status resmi: RESOLUSI ${statusLabel}.`;
            onTriggerNotification(finishCard);
          }
        }
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

  if (updated.length === 0) {
    updated = getInitialActiveSecurityCouncilItems();
  }

  saveActiveSecurityCouncilItems(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pbb_active_resolutions_updated'));
  }
  return updated;
}
