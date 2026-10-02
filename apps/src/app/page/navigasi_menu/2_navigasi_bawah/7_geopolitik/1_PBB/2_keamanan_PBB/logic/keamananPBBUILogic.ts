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

/**
 * Membuat data awal resolusi Dewan Keamanan PBB oleh negara AI Anggota Tetap.
 */
export function getInitialActiveSecurityCouncilItems(userCountryName: string = 'Indonesia'): ActiveSecurityCouncilItem[] {
  const proposer = DEFAULT_SECURITY_PROPOSERS[Math.floor(Math.random() * DEFAULT_SECURITY_PROPOSERS.length)];
  const target = DEFAULT_SECURITY_TARGETS[Math.floor(Math.random() * DEFAULT_SECURITY_TARGETS.length)];
  const tmpl = SECURITY_TEMPLATES[Math.floor(Math.random() * SECURITY_TEMPLATES.length)];

  return [
    {
      id: `sec-ai-1`,
      proposer: proposer,
      target: target,
      type: tmpl.type,
      label: tmpl.label,
      desc: tmpl.desc,
      duration: '6 bulan',
      daysRemaining: 18,
      voteStats: {
        supportersCount: 9,
        opponentsCount: 4,
        abstainCount: 2,
        vetoCount: 0
      },
      userVote: null,
      status: 'voting',
      createdAt: '2026-10-02'
    }
  ];
}
