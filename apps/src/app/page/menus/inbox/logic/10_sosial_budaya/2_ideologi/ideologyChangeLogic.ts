import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface IdeologyEventChainItem {
  delayDays: number;
  message: string;
  effect: string;
}

export interface IdeologyChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_ideologi';
  fromIdeology: string;
  toIdeology: string;
  approvalDelta: number;
  mood: 'protes' | 'senang' | 'campuran' | 'panik' | 'bangga' | 'netral' | 'marah' | 'euforia';
  eventChain?: IdeologyEventChainItem[];
}

const IDEOLOGY_MATRIX: Record<string, { mood: 'protes' | 'senang' | 'campuran' | 'panik' | 'bangga' | 'netral' | 'marah' | 'euforia'; approvalDelta: number; title: string; message: string }> = {
  'Demokrasi->Monarki': {
    mood: 'protes',
    approvalDelta: -15,
    title: '📢 Protes Massal: Penolakan Monarki',
    message: 'Rakyat menolak kembalinya monarki! Demo besar pecah di ibu kota menuntut pemulihan hak kedaulatan rakyat.'
  },
  'Demokrasi->Kapitalisme': {
    mood: 'senang',
    approvalDelta: 10,
    title: '🎉 Sambutan Pengusaha: Era Kapitalisme Baru',
    message: 'Kaum pengusaha dan pasar modal menyambut antusias penerapan era sistem pasar bebas kapitalisme!'
  },
  'Demokrasi->Sosialisme': {
    mood: 'campuran',
    approvalDelta: 5,
    title: '⚖️ Respon Campuran: Transisi ke Sosialisme',
    message: 'Kaum buruh menyambut hangat jaminan sosial negara, namun investor asing mulai mengkhawatirkan iklim investasi.'
  },
  'Demokrasi->Komunisme': {
    mood: 'panik',
    approvalDelta: -25,
    title: '😱 Panik Nasional: Komunisme Diberlakukan',
    message: 'Kebebasan sipil dikurangi secara masif! Gelombang demonstrasi dan aksi mogok nasional terjadi di 5 kota besar.'
  },
  'Demokrasi->Nasionalisme': {
    mood: 'bangga',
    approvalDelta: 8,
    title: '🇺🇳 Kebangkitan Nasionalis',
    message: 'Kelompok nasionalis dan elemen masyarakat menyambut kembalinya semangat kedaulatan serta kebanggaan bangsa!'
  },
  'Demokrasi->Konservatisme': {
    mood: 'netral',
    approvalDelta: 2,
    title: '🏛️ Pergeseran Tradisional',
    message: 'Nilai-nilai tradisional dan stabilitas sosial kembali diutamakan dalam tata kelola pemerintahan.'
  },
  'Demokrasi->Liberalisme': {
    mood: 'senang',
    approvalDelta: 12,
    title: '🕊️ Era Liberalisme Baru',
    message: 'Kebebasan individu, hak asasi manusia, dan keterbukaan publik dijamin secara penuh oleh negara!'
  },
  'Demokrasi->Otoritarianisme': {
    mood: 'marah',
    approvalDelta: -20,
    title: '😡 Amarah Publik: Pengekangan Pers',
    message: 'Kebebasan pers dibatasi ketat! Asosiasi jurnalis dan mahasiswa memprotes keras kebijakan otoriter ini.'
  },
  'Kapitalisme->Sosialisme': {
    mood: 'campuran',
    approvalDelta: 8,
    title: '⚖️ Pergeseran Ekonomi: Jaminan Sosial',
    message: 'Kaum pekerja dan buruh menyambut jaminan sosial, namun para pemilik modal dan korporasi mengekspresikan keresahan.'
  },
  'Kapitalisme->Komunisme': {
    mood: 'panik',
    approvalDelta: -30,
    title: '😱 Gelombang Eksodus Modal',
    message: 'Nasionalisasi aset besar-besaran terjadi! Para investor asing dan pengusaha nasional menarik modal secara masif.'
  },
  'Sosialisme->Kapitalisme': {
    mood: 'protes',
    approvalDelta: -12,
    title: '📢 Protes Serikat Buruh',
    message: 'Serikat pekerja dan buruh memprotes keras pemangkasan subsidi dan hilangnya jaminan sosial negara.'
  },
  'Monarki->Demokrasi': {
    mood: 'senang',
    approvalDelta: 18,
    title: '🎉 Perayaan Demokrasi',
    message: 'Masyarakat merayakan era demokrasi baru dengan antusiasme tinggi setelah berakhirnya era kekuasaan mutlak.'
  },
  'Komunisme->Kapitalisme': {
    mood: 'senang',
    approvalDelta: 15,
    title: '📈 Pembukaan Pasar Bebas',
    message: 'Pasar bebas dan kepemilikan swasta kembali dibuka, membuka kran investasi asing secara luas.'
  },
  'Otoritarianisme->Demokrasi': {
    mood: 'euforia',
    approvalDelta: 25,
    title: '🎉 Euforia Nasional: Pemulihan Kebebasan',
    message: 'Kebebasan sipil dan hak demokrasi dipulihkan sepenuhnya! Gelombang euforia merayapi seluruh pelosok negeri.'
  },
};

const EVENT_CHAIN_MAP: Record<string, IdeologyEventChainItem[]> = {
  'Otoritarianisme': [
    { delayDays: 3, message: 'Demonstrasi mahasiswa merebak di 3 universitas besar.', effect: '-5% Approval' },
    { delayDays: 3, message: 'Media internasional melayangkan kritik keras atas pengekangan kebebasan.', effect: '-10 Diplomasi' },
    { delayDays: 3, message: 'Potensi sanksi diplomatik dari 5 negara demokrasi.', effect: '-5% Ekonomi' },
  ],
  'Demokrasi': [
    { delayDays: 3, message: 'Partai-partai oposisi baru mulai terbentuk dan aktif.', effect: '+5% Demokrasi' },
    { delayDays: 3, message: 'Pers bebas aktif melakukan fungsi pengawasan pemerintah.', effect: '+5 Transparency' },
    { delayDays: 3, message: 'Investor asing mulai kembali meningkatkan kepercayaan pasar.', effect: '+8% PMA' },
  ],
  'Komunisme': [
    { delayDays: 3, message: 'Investor asing menarik modal secara masif dari bursa saham.', effect: '-20% PMA' },
    { delayDays: 3, message: 'Emigrasi besar-besaran kaum profesional dan tenaga ahli.', effect: '-2% Populasi Skill' },
    { delayDays: 3, message: 'Sanksi ekonomi dan pembatasan perdagangan dari blok kapitalis.', effect: '-15% Perdagangan' },
  ],
};

export function generateIdeologyChangeNotification(
  fromIdeology: string,
  toIdeology: string,
  dateStr: string
): IdeologyChangeNotification {
  const key = `${fromIdeology}->${toIdeology}`;
  const matched = IDEOLOGY_MATRIX[key];

  const mood = matched?.mood || (fromIdeology === toIdeology ? 'netral' : 'campuran');
  const approvalDelta = matched?.approvalDelta || (fromIdeology === toIdeology ? 0 : 5);
  const title = matched?.title || `🏛️ Perubahan Ideologi Negara: ${fromIdeology} ➔ ${toIdeology}`;
  const message = matched?.message || `Pemerintah resmi mengubah arah ideologi negara dari ${fromIdeology} menjadi ${toIdeology}. Perubahan ini membawa dampak pada struktur kebijakan sosial dan ekonomi nasional.`;

  const eventChain = EVENT_CHAIN_MAP[toIdeology];

  return {
    id: `ideology-change-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    sender: `Dewan Pertimbangan Perubahan Ideologi Negara`,
    message,
    timestamp: dateStr,
    type: approvalDelta >= 0 ? 'kepuasan' : 'kesejahteraan',
    value: approvalDelta,
    isRead: false,
    tradeType: 'perubahan_ideologi',
    fromIdeology,
    toIdeology,
    approvalDelta,
    mood,
    eventChain,
  };
}
