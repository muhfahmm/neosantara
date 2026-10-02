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

/**
 * Membuat data awal resolusi aktif Majelis Umum PBB oleh negara AI.
 */
export function getInitialActiveResolutions(userCountryName: string = 'Indonesia'): ActiveResolutionItem[] {
  const proposer = DEFAULT_AI_PROPOSERS[Math.floor(Math.random() * DEFAULT_AI_PROPOSERS.length)];
  const target = DEFAULT_AI_TARGETS[Math.floor(Math.random() * DEFAULT_AI_TARGETS.length)];
  const tmpl = RESOLUTION_TEMPLATES[Math.floor(Math.random() * RESOLUTION_TEMPLATES.length)];

  return [
    {
      id: `res-ai-1`,
      proposer: proposer,
      target: target,
      type: tmpl.type,
      label: tmpl.label,
      desc: tmpl.desc,
      duration: '3 bulan',
      daysRemaining: 24,
      voteStats: {
        supportersCount: 48,
        opponentsCount: 32,
        abstainCount: 15
      },
      userVote: null,
      status: 'voting',
      createdAt: '2026-10-01'
    }
  ];
}
