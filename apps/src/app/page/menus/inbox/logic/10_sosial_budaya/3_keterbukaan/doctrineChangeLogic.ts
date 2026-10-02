import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface DoctrineEffectItem {
  stat: string;
  value: string;
}

export interface DoctrineChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_doktrin';
  sliderKey: string;
  sliderLabel: string;
  fromValue: number;
  toValue: number;
  threshold: 'above70' | 'below30' | 'drastic_down' | 'drastic_up' | 'moderate';
  effects: DoctrineEffectItem[];
}

const SLIDER_LABELS: Record<string, string> = {
  speechScore: 'Kebebasan Berbicara & Pers',
  religionScore: 'Kebebasan Beragama',
  demoScore: 'Hak Demonstrasi & Aksi',
  transparencyScore: 'Transparansi Anggaran & Publik',
  mediaScore: 'Media & Penyiaran',
  internetScore: 'Akses Internet & Digital',
  borderScore: 'Perbatasan & Imigrasi',
  tradeScore: 'Perdagangan & Pasar',
  diplomacyScore: 'Diplomasi & Multilateral',
};

export function generateDoctrineChangeNotification(
  sliderKey: string,
  fromValue: number,
  toValue: number,
  dateStr: string
): DoctrineChangeNotification | null {
  const diff = toValue - fromValue;
  if (Math.abs(diff) < 5) return null; // Abaikan perubahan kecil < 5%

  const sliderLabel = SLIDER_LABELS[sliderKey] || sliderKey;
  let threshold: 'above70' | 'below30' | 'drastic_down' | 'drastic_up' | 'moderate' = 'moderate';
  let title = `📜 Kebijakan Doktrin Baru: ${sliderLabel}`;
  let message = `Pemerintah telah memperbarui indikator ${sliderLabel} dari ${fromValue}% menjadi ${toValue}%.`;
  let effects: DoctrineEffectItem[] = [];

  if (diff <= -30) {
    threshold = 'drastic_down';
    switch (sliderKey) {
      case 'speechScore':
        title = '🛑 Sensor Ketat: Kebebasan Berbicara Dibungkam';
        message = 'Pemangkasan drastis hak bicara! Kebebasan berbicara dibungkam sepenuhnya, memicu gelombang demo di 5 kota.';
        effects = [{ stat: 'Approval', value: '-15%' }];
        break;
      case 'religionScore':
        title = '🔥 Represi Keagamaan: Konflik Meletus';
        message = 'Pemangkasan kebebasan beragama memicu konflik antar kelompok agama secara terbuka di berbagai daerah.';
        effects = [{ stat: 'Stabilitas', value: '-15%' }];
        break;
      case 'demoScore':
        title = '🛡️ Penindakan Demonstrasi Masif';
        message: 'Hak demonstrasi dipangkas drastis. Aksi unjuk rasa dibubarkan paksa dan masyarakat takut menyuarakan pendapat.';
        effects = [{ stat: 'Approval', value: '-10%' }];
        break;
      case 'mediaScore':
        title = '📺 Pelarangan Media Asing';
        message: 'Pengawasan media diperketat secara drastis! Seluruh media dan jurnalis asing dilarang beroperasi.';
        effects = [{ stat: 'Diplomasi', value: '-10%' }];
        break;
      case 'internetScore':
        title = '🌐 Internet Shutdown Total';
        message: 'Pemutusan akses internet secara masif diberlakukan! Ekosistem ekonomi digital nasional mengalami kelumpuhan.';
        effects = [{ stat: 'PDB', value: '-10%' }];
        break;
      case 'borderScore':
        title = '🚨 Eksodus & Emigrasi Massal';
        message: 'Penutupan perbatasan secara drastis memicu aksi pembangkangan sipil dan emigrasi massal warga ke negara tetangga.';
        effects = [{ stat: 'Populasi', value: '-10%' }];
        break;
      case 'tradeScore':
        title = '⚠️ Embargo & Krisis Perdagangan';
        message: 'Pembatasan perdagangan drastis memicu embargo ekonomi. Harga barang kebutuhan pokok melonjak tajam!';
        effects = [{ stat: 'PDB', value: '-10%' }];
        break;
      case 'diplomacyScore':
        title = '🚫 Isolationis & Sanksi Multilateral';
        message: 'Penarikan diri dari komitmen internasional memicu sanksi diplomatik dan ekonomi dari 10 negara mitra.';
        effects = [{ stat: 'Ekonomi', value: '-15%' }];
        break;
      default:
        title = `📉 Pemangkasan Drastis: ${sliderLabel}`;
        message = `Skor ${sliderLabel} dipangkas drastis sebesar ${Math.abs(diff)}%.`;
        effects = [{ stat: 'Approval', value: '-10%' }];
    }
  } else if (diff >= 30) {
    threshold = 'drastic_up';
    if (sliderKey === 'transparencyScore') {
      title = '🎉 Reformasi Transparansi Disambut Positif';
      message = 'Reformasi transparansi publik dan pengawasan anggaran diaudit secara terbuka dan disambut hangat oleh masyarakat.';
      effects = [{ stat: 'Approval', value: '+10%' }];
    } else {
      title = `📈 Kenaikan Pesat: ${sliderLabel}`;
      message = `Pemerintah meningkatkan skor ${sliderLabel} secara signifikan sebesar +${diff}%.`;
      effects = [{ stat: 'Kepuasan', value: '+10%' }];
    }
  } else if (toValue >= 70) {
    threshold = 'above70';
    switch (sliderKey) {
      case 'speechScore':
        title = '🕊️ Kebebasan Pers & Suara Publik';
        message = 'Kebebasan pers dijamin penuh oleh negara. Media kritis dan ruang diskusi publik berkembang pesat.';
        effects = [{ stat: 'HAM', value: '+10' }, { stat: 'Kepuasan', value: '+5' }];
        break;
      case 'religionScore':
        title = '☯️ Kerukunan Beragama Terjaga';
        message: 'Jaminan kebebasan beragama yang tinggi menciptakan iklim toleransi dan kerukunan antar umat.';
        effects = [{ stat: 'Approval', value: '+5%' }];
        break;
      case 'demoScore':
        title = '📢 Ruang Aspirasi & Aksi Damai';
        message: 'Aksi unjuk rasa damai diizinkan penuh sebagai sarana masyarakat menyuarakan aspirasi pembangunan.';
        effects = [{ stat: 'Kepuasan', value: '+5%' }];
        break;
      case 'transparencyScore':
        title = '🔍 Audit Publik & Anti-Korupsi';
        message: 'Seluruh anggaran negara diaudit publik secara terbuka, menekan potensi korupsi dan kebocoran anggaran.';
        effects = [{ stat: 'Korupsi', value: '-15%' }];
        break;
      case 'mediaScore':
        title = '📻 Kebebasan Media & Kebudayaan';
        message: 'Media swasta dan media sosial beroperasi tanpa pengekangan, memperkuat pilar kebebasan informasi.';
        effects = [{ stat: 'HAM', value: '+5' }];
        break;
      case 'internetScore':
        title = '🚀 Ekosistem Digital & Startup';
        message: 'Akses internet bebas tanpa hambatan mendorong pertumbuhan ekonomi digital dan inovasi teknologi.';
        effects = [{ stat: 'PDB', value: '+5%' }];
        break;
      case 'borderScore':
        title = '✈️ Bebas Visa & Pariwisata Membludak';
        message: 'Penerapan bebas visa dan akses perbatasan terbuka meningkatkan kunjungan turis asing secara drastis.';
        effects = [{ stat: 'Pariwisata', value: '+15%' }];
        break;
      case 'tradeScore':
        title = '💼 Arus Investasi Asing Direct';
        message: 'Kebijakan pasar terbuka menarik gelombang penanaman modal asing (PMA) secara deras.';
        effects = [{ stat: 'PMA', value: '+20%' }];
        break;
      case 'diplomacyScore':
        title = '🌐 Penguatan Aliansi Multilateral';
        message: 'Kerja sama diplomatik internasional diperkuat, meningkatkan daya tawar negara di kancah global.';
        effects = [{ stat: 'Diplomasi', value: '+15' }];
        break;
      default:
        title = `🌟 Tingkat Keterbukaan Tinggi: ${sliderLabel}`;
        message = `Skor ${sliderLabel} kini berada pada tingkat tinggi (${toValue}%).`;
        effects = [{ stat: 'Approval', value: '+5%' }];
    }
  } else if (toValue <= 30) {
    threshold = 'below30';
    switch (sliderKey) {
      case 'speechScore':
        title = '🔒 Sensor Media & Pembatasan Bicara';
        message: 'Sensor ketat diberlakukan terhadap institusi media. Kalangan jurnalis memprotes keras kebijakan ini.';
        effects = [{ stat: 'HAM', value: '-10' }, { stat: 'Stabilitas', value: '+15' }];
        break;
      case 'religionScore':
        title = '⛪ Dikontrol Negara: Pembatasan Minoritas';
        message: 'Pemerintah memperketat pengawasan kehidupan beragama. Kelompok minoritas merasakan tekanan sosial.';
        effects = [{ stat: 'HAM', value: '-10' }];
        break;
      case 'demoScore':
        title = '🚫 Pelarangan Demonstrasi';
        message: 'Demonstrasi publik dilarang dan dibubarkan secara tegas demi menjaga ketertiban umum.';
        effects = [{ stat: 'HAM', value: '-10' }, { stat: 'Stabilitas', value: '+10' }];
        break;
      case 'transparencyScore':
        title = '🙈 Transparansi Minim & Kerawanan Anggaran';
        message: 'Pengawasan anggaran minim publik memicu keprihatinan atas potensi meningkatnya praktek korupsi.';
        effects = [{ stat: 'Korupsi', value: '+20%' }];
        break;
      case 'mediaScore':
        title = '📺 Monopoli Penyiaran Negara';
        message: 'Pemerintah menindak media independen dan memonopoli arus berita melalui media resmi negara.';
        effects = [{ stat: 'HAM', value: '-10' }];
        break;
      case 'internetScore':
        title = '📡 Intranet Nasional & Firewall';
        message: 'Akses ke jaringan internet global diputus dan digantikan dengan jaringan intranet tertutup negara.';
        effects = [{ stat: 'PDB', value: '-5%' }];
        break;
      case 'borderScore':
        title = '🚪 Isolationis: Perbatasan Ditutup';
        message: 'Perbatasan negara ditutup rapat. Lalu lintas keluar-masuk warga dan pergerakan internasional dibatasi ketat.';
        effects = [{ stat: 'Stabilitas', value: '+12' }];
        break;
      case 'tradeScore':
        title = '🛡️ Proteksionisme Pasar Total';
        message: 'Kebijakan proteksi pasar total diberlakukan. Impor barang luar negeri dilarang keras demi produksi lokal.';
        effects = [{ stat: 'Industri Lokal', value: '+15' }];
        break;
      case 'diplomacyScore':
        title = '📉 Penarikan Diri Organisasi Internasional';
        message: 'Negara mengambil sikap menolak campur tangan asing dan menarik diri dari keanggotaan organisasi global.';
        effects = [{ stat: 'Diplomasi', value: '-20' }];
        break;
      default:
        title = `🔒 Restriksi Ketat: ${sliderLabel}`;
        message = `Skor ${sliderLabel} mengalami penurunan signifikan ke tingkat ketat (${toValue}%).`;
        effects = [{ stat: 'HAM', value: '-5' }];
    }
  }

  const isPositive = threshold === 'above70' || threshold === 'drastic_up' || (diff > 0 && threshold !== 'drastic_down');

  return {
    id: `doctrine-change-${sliderKey}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    sender: `Kementerian Hukum, HAM & Kebijakan Negara`,
    message,
    timestamp: dateStr,
    type: isPositive ? 'kepuasan' : 'kesejahteraan',
    value: diff,
    isRead: false,
    tradeType: 'perubahan_doktrin',
    sliderKey,
    sliderLabel,
    fromValue,
    toValue,
    threshold,
    effects,
  };
}
