import { NotificationMessage } from '../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface ResearchChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_fokus_riset';
  categoryKey: 'ekonomi' | 'militer' | 'diplomasi';
  categoryName: string;
  focusScope: string;
}

const RESEARCH_LABELS: Record<string, { name: string; scope: string; desc: string }> = {
  ekonomi: {
    name: 'Riset Ekonomi & Industri',
    scope: 'Produksi, Manufaktur, Pertambangan & Logistik',
    desc: 'Pengembangan teknologi manufaktur, efisiensi rantai pasok pertambangan, otomatisasi produksi, dan peningkatan penerimaan devisa negara.'
  },
  militer: {
    name: 'Riset Militer & Pertahanan',
    scope: 'Alutsista, Perang Siber & Pertahanan Nuklir',
    desc: 'Modernisasi armada tempur darat/laut/udara, pertahanan ruang siber, sistem pencegat rudal balistik, dan pengembangan energi nuklir militer.'
  },
  diplomasi: {
    name: 'Riset Diplomasi & Intelijen',
    scope: 'Geopolitik, Kriptografi & Intelijen Global',
    desc: 'Penguatan jaringan spionase internasional, sistem enkripsi kriptografi tingkat tinggi, dan peningkatan daya tawar diplomasi PBB.'
  }
};

export function generateResearchChangeNotification(
  categoryKey: 'ekonomi' | 'militer' | 'diplomasi',
  dateStr: string
): ResearchChangeNotification {
  const info = RESEARCH_LABELS[categoryKey] || {
    name: 'Riset Strategis Nasional',
    scope: 'Inovasi Teknologi & Pembangunan',
    desc: 'Pemerintah menetapkan fokus riset strategis baru untuk mendukung percepatan kemajuan nasional.'
  };

  return {
    id: `research-focus-${categoryKey}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: `🔬 PERUBAHAN FOKUS RISET: ${info.name}`,
    sender: `Badan Riset & Inovasi Nasional (BRIN)`,
    message: `Pemerintah resmi mengarahkan laboratorium dan alokasi anggaran riset nasional untuk memprioritaskan ${info.name} (${info.scope}). ${info.desc}`,
    timestamp: dateStr,
    type: 'kepuasan',
    value: 10,
    isRead: false,
    tradeType: 'perubahan_fokus_riset',
    categoryKey,
    categoryName: info.name,
    focusScope: info.scope,
  };
}
