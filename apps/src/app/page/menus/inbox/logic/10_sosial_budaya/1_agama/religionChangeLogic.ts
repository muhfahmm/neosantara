import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface ReligionEventChainItem {
  delayDays: number;
  message: string;
  effect: string;
}

export interface ReligionChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_agama';
  fromReligion: string;
  toReligion: string;
  approvalDelta: number;
  mood: 'protes' | 'senang' | 'campuran' | 'panik' | 'netral';
  eventChain?: ReligionEventChainItem[];
}

const RELIGION_MATRIX: Record<string, { mood: 'protes' | 'senang' | 'campuran' | 'panik' | 'netral'; approvalDelta: number; title: string; message: string }> = {
  'Islam->Katolik': {
    mood: 'protes',
    approvalDelta: -20,
    title: '📢 Protes Publik: Penolakan Pergantian Agama Negara',
    message: 'Umat Muslim menyampaikan gelombang protes keras atas penetapan Katolik sebagai agama resmi negara!'
  },
  'Islam->Ateisme': {
    mood: 'panik',
    approvalDelta: -30,
    title: '😱 Panik & Aksi Massa: Ateisme Ditolak Keras',
    message: 'Ateisme ditolak secara masif oleh masyarakat luas! Gelombang aksi demonstrasi dan aksi mogok terjadi di 10 kota besar.'
  },
  'Islam->Hindu': {
    mood: 'campuran',
    approvalDelta: -8,
    title: '⚖️ Respon Keagamaan: Transisi Hindu',
    message: 'Komunitas minoritas Hindu menyambut penetapan ini, namun mayoritas umat Muslim merasa resah dan kecewa.'
  },
  'Katolik->Protestan': {
    mood: 'senang',
    approvalDelta: 8,
    title: '🎉 Reformasi Gereja Disambut Baik',
    message: 'Masyarakat dan jamaah gereja menyambut positif langkah pembaruan doktrin serta transisi denominasi ini.'
  },
  'Katolik->Islam': {
    mood: 'protes',
    approvalDelta: -18,
    title: '📢 Gelombang Protes Umat Katolik',
    message: 'Umat Katolik dan organisasi keagamaan memprotes pergantian agama resmi negara.'
  },
  'Protestan->Katolik': {
    mood: 'netral',
    approvalDelta: 2,
    title: '🕊️ Transisi Damai Antar Denominasi',
    message: 'Perubahan berlangsung dalam suasana kondusif dan saling menghormati antar denominasi Kristen.'
  },
  'Hindu->Buddha': {
    mood: 'senang',
    approvalDelta: 6,
    title: '☯️ Kerukunan Umat Beragama Timur',
    message: 'Kerukunan dan keselarasan spiritual antar umat beragama tradisi Timur tetap terjaga dengan sangat baik.'
  },
  'Buddha->Shinto': {
    mood: 'netral',
    approvalDelta: 3,
    title: '⛩️ Pergeseran Simbolis Keimanan',
    message: 'Perubahan atribut keagamaan negara bersifat simbolis dan dapat diterima dengan tenang oleh masyarakat.'
  },
  'Yahudi->Ateisme': {
    mood: 'protes',
    approvalDelta: -22,
    title: '📢 Komunitas Yahudi Menolak Sekularisasi',
    message: 'Komunitas keagamaan Yahudi menolak tegas penghapusan identitas iman dalam hukum negara.'
  },
  'Ateisme->Islam': {
    mood: 'senang',
    approvalDelta: 15,
    title: '🕌 Kebangkitan Spiritual Nasional',
    message: 'Masyarakat luas merayakan kembali masuknya nilai-nilai keimanan dan spiritualitas Islam dalam tatanan bernegara!'
  },
  'Ateisme->Katolik': {
    mood: 'senang',
    approvalDelta: 12,
    title: '⛪ Sambutan Era Baru Keimanan',
    message: 'Rakyat menyambut hangat era baru keimanan dan perlindungan tempat ibadah oleh pemerintah.'
  },
};

const RELIGION_EVENT_CHAIN_MAP: Record<string, ReligionEventChainItem[]> = {
  'Ateisme': [
    { delayDays: 7, message: 'Demonstrasi besar digelar di depan masjid & gereja utama.', effect: '-10% Stabilitas' },
    { delayDays: 7, message: 'Tokoh-tokoh agama nasional menuntut referendum keagamaan.', effect: '-5% Approval' },
    { delayDays: 7, message: 'Hubungan diplomatik dengan negara-negara religius memburuk.', effect: '-15 Diplomasi' },
  ],
  'Ateisme->Islam': [
    { delayDays: 7, message: 'Kebangkitan kegiatan keagamaan dan sosial di seluruh negeri.', effect: '+10% Kepuasan' },
    { delayDays: 7, message: 'Pembangunan pusat studi dan tempat ibadah baru berlangsung masif.', effect: '+5% Pembangunan' },
    { delayDays: 7, message: 'Investasi dan hibah dari negara-negara Timur Tengah mengalir.', effect: '+15% Modal' },
  ],
  'Ateisme->Katolik': [
    { delayDays: 7, message: 'Kebangkitan spiritual dan aksi kemanusiaan keagamaan.', effect: '+10% Kepuasan' },
    { delayDays: 7, message: 'Pembangunan sarana ibadah dan pendidikan agama masif.', effect: '+5% Pembangunan' },
    { delayDays: 7, message: 'Kerja sama erat dengan Vatikan dan lembaga donor Eropa.', effect: '+10 Diplomasi' },
  ],
};

export function generateReligionChangeNotification(
  fromReligion: string,
  toReligion: string,
  dateStr: string
): ReligionChangeNotification {
  const key = `${fromReligion}->${toReligion}`;
  const matched = RELIGION_MATRIX[key];

  const mood = matched?.mood || (fromReligion === toReligion ? 'netral' : 'campuran');
  const approvalDelta = matched?.approvalDelta || (fromReligion === toReligion ? 0 : -5);
  const title = matched?.title || `☪️ Perubahan Agama Resmi Negara: ${fromReligion} ➔ ${toReligion}`;
  const message = matched?.message || `Pemerintah resmi menetapkan perubahan status agama resmi negara dari ${fromReligion} menjadi ${toReligion}. Keputusan ini memicu dinamika sosial di tengah masyarakat.`;

  const chainKey = fromReligion === 'Ateisme' ? `Ateisme->${toReligion}` : toReligion;
  const eventChain = RELIGION_EVENT_CHAIN_MAP[chainKey];

  return {
    id: `religion-change-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    sender: `Kementerian Agama & Kebudayaan Nasional`,
    message,
    timestamp: dateStr,
    type: approvalDelta >= 0 ? 'kepuasan' : 'kesejahteraan',
    value: approvalDelta,
    isRead: false,
    tradeType: 'perubahan_agama',
    fromReligion,
    toReligion,
    approvalDelta,
    mood,
    eventChain,
  };
}
