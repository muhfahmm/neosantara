import { generateAIResolusiPBBNotification } from '@/app/page/menus/inbox/logic/5_notifikasi_geopolitik/5_pbb/1_resolusi/resolusiPBBLogic';
import { STATIC_PBB_VOTES } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/3_suara_negara_PBB/staticVoteData";

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
  lastProcessedDate?: string;
  bribedCountries?: Record<string, 'yes' | 'no' | 'abstain'>;
  notifiedDay1?: boolean;
  notified10Days?: boolean;
  notifiedFinished?: boolean;
}

export const STORAGE_KEY_PBB_RESOLUSI = 'pbb_active_resolutions_v4';
export const TOTAL_UN_MEMBERS = 206;

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
  resolutionType: string = 'arms_embargo'
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

  let supportersCount = Math.round(votesCastSoFar * supporterRatio);
  let opponentsCount = Math.round(votesCastSoFar * opponentRatio);
  let abstainCount = votesCastSoFar - supportersCount - opponentsCount;

  if (userVote === 'yes') supportersCount += 1;
  if (userVote === 'no') opponentsCount += 1;
  if (userVote === 'abstain') abstainCount += 1;

  return {
    supportersCount: Math.max(0, supportersCount),
    opponentsCount: Math.max(0, opponentsCount),
    abstainCount: Math.max(0, abstainCount),
    totalVotesCast: votesCastSoFar + (userVote ? 1 : 0)
  };
}

export function loadActiveResolutions(): ActiveResolutionItem[] {
  if (typeof window === 'undefined') return getInitialActiveResolutions();
  try {
    const data = localStorage.getItem(STORAGE_KEY_PBB_RESOLUSI);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
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

export function getInitialActiveResolutions(userCountryName: string = 'Indonesia'): ActiveResolutionItem[] {
  const activeUser = getActiveUserCountryName(userCountryName);
  const availableProposers = DEFAULT_AI_PROPOSERS.filter(p => 
    p.name.toLowerCase() !== activeUser.toLowerCase() && 
    p.iso.toLowerCase() !== activeUser.toLowerCase()
  );
  const proposersList = availableProposers.length > 0 ? availableProposers : DEFAULT_AI_PROPOSERS;
  const proposer = proposersList[Math.floor(Math.random() * proposersList.length)];

  const availableTargets = DEFAULT_AI_TARGETS.filter(t => 
    t.name.toLowerCase() !== proposer.name.toLowerCase()
  );
  const target = availableTargets[Math.floor(Math.random() * availableTargets.length)] || DEFAULT_AI_TARGETS[0];
  const tmpl = RESOLUTION_TEMPLATES[Math.floor(Math.random() * RESOLUTION_TEMPLATES.length)];

  const initialDaysRemaining = 30; // Mulai dari 30 hari
  const initialVotes = calculate206AIVotes(initialDaysRemaining, null, proposer.name, target.name, tmpl.type);
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
  const activeUser = getActiveUserCountryName();

  let updated: ActiveResolutionItem[] = currentItems
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

      // Jika resolusi sudah selesai (passed / rejected), hitung cooldown 30 hari untuk penghapusan
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
      const votes = calculate206AIVotes(newDaysRemaining, item.userVote, proposer?.name, item.target?.name, item.type);
      let notified = item.notified10Days || false;
      let notifiedDay1 = item.notifiedDay1 || false;

      // Trigger notifikasi inbox saat usulan baru dibuat / hari pertama (30 hari tersisa)
      // Proteksi: Hanya kirim jika bukan atas nama user (kecuali resolusi yang memang dibuat user sendiri)
      const isUserProposer = proposer?.name?.toLowerCase() === activeUser.toLowerCase();
      const allowNotification = isUserSubmitted || !isUserProposer;

      if (newDaysRemaining >= 29 && !notifiedDay1) {
        notifiedDay1 = true;
        if (onTriggerNotification && allowNotification) {
          const notifCard = generateAIResolusiPBBNotification(
            proposer.name,
            item.target.name,
            15,
            dateStr
          );
          notifCard.title = `🏛️ USULAN RESOLUSI PBB BARU: ${proposer.name} ➔ ${item.target.name}`;
          notifCard.message = `Negara ${proposer.name} secara resmi mengajukan usulan "${item.label}" yang menargetkan ${item.target.name} di Majelis Umum PBB. Pemungutan suara telah dibuka selama 30 hari!`;
          onTriggerNotification(notifCard);
        }
      }

      // Trigger popup inbox jika sisa hari <= 10 dan user belum vote
      if (newDaysRemaining <= 10 && !item.userVote && !notified) {
        notified = true;
        if (onTriggerNotification && allowNotification) {
          const notifCard = generateAIResolusiPBBNotification(
            proposer.name,
            item.target.name,
            15,
            dateStr
          );
          notifCard.title = `⚠️ PERINGATAN VOTING PBB (Sisa ${newDaysRemaining} Hari): ${proposer.name} ➔ ${item.target.name}`;
          notifCard.message = `Batas waktu tersisa ${newDaysRemaining} hari! Sidang Umum Majelis PBB membutuhkan suara ${activeUser} untuk usulan "${item.label}" yang menargetkan ${item.target.name}. Sejauh ini ${votes.supportersCount} negara setuju dan ${votes.opponentsCount} menolak.`;
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
              item.target.name,
              15,
              dateStr
            );
            finishCard.title = `🏛️ HASIL RESOLUSI PBB: ${item.label} (${statusLabel})`;
            finishCard.message = `Pemungutan suara Sidang Umum Majelis PBB untuk usulan "${item.label}" (Pengusul: ${proposer.name}, Target: ${item.target.name}) telah SELESAI. Perolehan suara akhir: ${votes.supportersCount} Setuju, ${votes.opponentsCount} Menolak, ${votes.abstainCount} Abstain. Status resmi: RESOLUSI ${statusLabel}.`;
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

  if (updated.length === 0) {
    updated = getInitialActiveResolutions();
  }

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

  const targetSupporterCount = Math.max(1, resItem.voteStats.supportersCount);
  const targetOpponentCount = Math.max(1, resItem.voteStats.opponentsCount);

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

  // Proposer is ALWAYS #1 in supporters (Setuju)
  const supporters: (typeof safeCountries[0] & { isProposer?: boolean; isTarget?: boolean; isUser?: boolean })[] = [
    { ...proposerObj, isProposer: true, isUser: isUserProposer }
  ];

  // If User voted 'yes' and user is not proposer/target
  if (!isUserProposer && !isUserTarget && resItem.userVote === 'yes') {
    supporters.push({ ...userObj, isUser: true });
  }

  // Target is ALWAYS #1 in opponents (Menolak)
  const opponents: (typeof safeCountries[0] & { isProposer?: boolean; isTarget?: boolean; isUser?: boolean })[] = [];
  if (targetObj) {
    opponents.push({ ...targetObj, isTarget: true, isUser: isUserTarget });
  }

  // If User voted 'no' and user is not proposer/target
  if (!isUserProposer && !isUserTarget && resItem.userVote === 'no') {
    opponents.push({ ...userObj, isUser: true });
  }

  const abstain: (typeof safeCountries[0] & { isProposer?: boolean; isTarget?: boolean; isUser?: boolean })[] = [];

  // If User voted 'abstain' and user is not proposer/target
  if (!isUserProposer && !isUserTarget && resItem.userVote === 'abstain') {
    abstain.push({ ...userObj, isUser: true });
  }

  const bribedMap = resItem.bribedCountries || {};
  const unbribedPool = seededPool.filter(item => !bribedMap[item.country.iso.toLowerCase()]);
  const bribedList = seededPool.filter(item => Boolean(bribedMap[item.country.iso.toLowerCase()]));

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
    } else {
      abstain.push(item.country);
    }
  });

  return { supporters, opponents, abstain };
}

export function getCountryPBBVote(countryName: string): number {
  if (!countryName) return 100;
  const norm = countryName.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const found = STATIC_PBB_VOTES.find(v => v.name_id.toLowerCase().replace(/[^a-z0-9]+/g, "") === norm);
  if (found && found.un_vote) return found.un_vote;
  return 100;
}

export function formatBribeCost(countryName: string): string {
  const vote = getCountryPBBVote(countryName);
  return `${vote.toLocaleString('id-ID')}.000`;
}
