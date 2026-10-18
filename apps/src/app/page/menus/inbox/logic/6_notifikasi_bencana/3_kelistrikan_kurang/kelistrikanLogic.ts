// kelistrikanLogic.ts
// Logika dan generator event untuk notifikasi kelistrikan kurang
// Setiap notifikasi kelistrikan kurang akan menurunkan peringkat sebesar 1

import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface KelistrikanNotification extends NotificationMessage {
  tradeType: 'kelistrikan_kurang';
  deficitAmount: number; // Jumlah kelistrikan yang kurang dalam MW
  affectedAreas: string[]; // Area yang terkena dampak
  severity: 'ringan' | 'sedang' | 'berat' | 'kritis';
  durationDays?: number;
  remainingDurationDays?: number;
  startDate?: string;
  isHandled?: boolean;
}

interface KelistrikanEventItem {
  name: string;
  description: (country: string, deficit: number) => string;
  deficitRange: [number, number]; // MW
  affectedAreasTemplate: () => string[];
  severity: 'ringan' | 'sedang' | 'berat' | 'kritis';
  weight: number;
}

export const KELISTRIKAN_KURANG_POOL: KelistrikanEventItem[] = [
  // Kekurangan Ringan (40%)
  {
    name: 'Defisit Listrik Ringan',
    description: (country, deficit) => `Pasokan listrik di ${country} mengalami defisit ringan sebesar ${deficit} MW akibat peningkatan konsumsi di jam sibuk. Beberapa daerah mengalami pemadaman bergilir selama 2-3 jam.`,
    deficitRange: [100, 500],
    affectedAreasTemplate: () => {
      const areas = ['Perumahan menengah', 'Kawasan komersial', 'Industri ringan'];
      return areas.slice(0, 1 + Math.floor(Math.random() * 2));
    },
    severity: 'ringan',
    weight: 10
  },
  {
    name: 'Pemeliharaan Gardu Induk',
    description: (country, deficit) => `Pemeliharaan rutin gardu induk utama menyebabkan penurunan kapasitas transmisi sebesar ${deficit} MW di wilayah ${country}.`,
    deficitRange: [200, 800],
    affectedAreasTemplate: () => ['Distrik pusat kota', 'Kawasan industri'],
    severity: 'ringan',
    weight: 8
  },
  
  // Kekurangan Sedang (30%)
  {
    name: 'Krisis Pasokan Gas untuk PLTG',
    description: (country, deficit) => `Keterlambatan pasokan gas alam menyebabkan operasional PLTG berkurang, menciptakan defisit ${deficit} MW di sistem kelistrikan ${country}.`,
    deficitRange: [500, 1500],
    affectedAreasTemplate: () => {
      const areas = ['PLTG utama', 'Industri manufaktur', 'Kawasan perdagangan'];
      return areas.slice(0, 2 + Math.floor(Math.random() * 1));
    },
    severity: 'sedang',
    weight: 6
  },
  {
    name: 'Gangguan Transmisi Jalur Utama',
    description: (country, deficit) => `Gangguan pada jalur transmisi tegangan tinggi menyebabkan defisit ${deficit} MW dan memaksa PLN menerapkan pemadaman bergilir di berbagai daerah ${country}.`,
    deficitRange: [800, 2000],
    affectedAreasTemplate: () => {
      const areas = ['Kawasan metropolitan', 'Zona industri berat', 'Pusat data'];
      return areas;
    },
    severity: 'sedang',
    weight: 5
  },
  
  // Kekurangan Berat (20%)
  {
    name: 'Kekeringan Parah Mengurangi PLTA',
    description: (country, deficit) => `Kekeringan ekstrem menurunkan kapasitas waduk PLTA hingga 60%, menyebabkan defisit listrik mencapai ${deficit} MW di seluruh ${country}.`,
    deficitRange: [1500, 3500],
    affectedAreasTemplate: () => {
      const areas = ['Sistem PLTA utama', 'Industri energi-intensif', 'Rumah sakit', 'Pusat pemerintahan'];
      return areas.slice(0, 3);
    },
    severity: 'berat',
    weight: 3
  },
  {
    name: 'Rusaknya Turbin PLTU',
    description: (country, deficit) => `Kerusakan mendadak pada turbin PLTU skala besar mengurangi kapasitas pembangkitan sebesar ${deficit} MW. Perbaikan diperkirakan memakan waktu beberapa minggu.`,
    deficitRange: [2000, 5000],
    affectedAreasTemplate: () => {
      const areas = ['PLTU utama', 'Kawasan industri strategis', 'Bandara internasional', 'Pelabuhan utama'];
      return areas;
    },
    severity: 'berat',
    weight: 2
  },
  
  // Kekurangan Kritis (10%)
  {
    name: 'Krisis Energi Nasional',
    description: (country, deficit) => `Kombinasi faktor cuaca ekstrem, gangguan pasokan bahan bakar, dan kerusakan infrastruktur menyebabkan defisit listrik kritis sebesar ${deficit} MW di ${country}. Sistem kelistrikan nasional dalam kondisi darurat.`,
    deficitRange: [3000, 8000],
    affectedAreasTemplate: () => {
      const areas = ['Seluruh sistem kelistrikan nasional', 'Industri vital', 'Fasilitas kesehatan', 'Sistem transportasi', 'Komunikasi nasional'];
      return areas;
    },
    severity: 'kritis',
    weight: 1
  },
  {
    name: 'Blackout Sistemik Skala Besar',
    description: (country, deficit) => `Kaskade kegagalan sistem menyebabkan blackout masif dengan defisit mencapai ${deficit} MW. Ribuan rumah tangga dan industri terpengaruh, mengancam stabilitas ekonomi ${country}.`,
    deficitRange: [5000, 10000],
    affectedAreasTemplate: () => {
      const areas = ['Seluruh wilayah nasional', 'Grid interkoneksi', 'Infrastruktur kritis', 'Sektor keuangan', 'Layanan darurat'];
      return areas;
    },
    severity: 'kritis',
    weight: 1
  }
];

export function generateKelistrikanKurangNotification(
  userCountryName: string,
  dateStr: string,
  currentDeficit?: number // Optional: jika sudah ada data defisit aktual
): KelistrikanNotification {
  if (KELISTRIKAN_KURANG_POOL.length === 0) {
    throw new Error('Tidak ada template notifikasi kelistrikan yang tersedia.');
  }

  // Menghitung total weight untuk random selection
  const totalWeight = KELISTRIKAN_KURANG_POOL.reduce((acc, item) => acc + item.weight, 0);
  let roll = Math.random() * totalWeight;
  
  let selectedEvent = KELISTRIKAN_KURANG_POOL[0];
  for (const item of KELISTRIKAN_KURANG_POOL) {
    if (roll < item.weight) {
      selectedEvent = item;
      break;
    }
    roll -= item.weight;
  }

  // Generate deficit amount
  const [minDeficit, maxDeficit] = selectedEvent.deficitRange;
  const deficitAmount = currentDeficit !== undefined 
    ? currentDeficit 
    : Math.floor(Math.random() * (maxDeficit - minDeficit + 1) + minDeficit);

  // Apply severity multiplier based on actual deficit
  let actualSeverity = selectedEvent.severity;
  if (deficitAmount > maxDeficit * 0.8 && selectedEvent.severity !== 'kritis') {
    actualSeverity = 'berat';
  } else if (deficitAmount > maxDeficit * 0.6 && selectedEvent.severity === 'ringan') {
    actualSeverity = 'sedang';
  }

  // Get affected areas
  const affectedAreas = selectedEvent.affectedAreasTemplate();
  
  const country = userCountryName || 'Indonesia';
  const message = selectedEvent.description(country, deficitAmount);

  // Duration based on severity
  const durationDays = {
    'ringan': 7,
    'sedang': 14,
    'berat': 21,
    'kritis': 30
  }[actualSeverity];

  // Calculate rating penalty based on severity
  const ratingPenalty = {
    'ringan': 1,
    'sedang': 2,
    'berat': 3,
    'kritis': 5
  }[actualSeverity];

  return {
    id: `kelistrikan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: `⚡ KRISIS LISTRIK: ${selectedEvent.name.toUpperCase()} [${actualSeverity.toUpperCase()}]`,
    sender: `PERUSAHAAN LISTRIK NEGARA (PLN) - ${country.toUpperCase()}`,
    message: `${message}\n\n📊 DATA KRISIS:\n• Defisit: ${deficitAmount} MW\n• Area Terdampak: ${affectedAreas.join(', ')}\n• Durasi Perkiraan: ${durationDays} hari\n• Dampak Peringkat: -${ratingPenalty} poin`,
    timestamp: dateStr,
    type: 'peringkat', // Menggunakan type 'peringkat' untuk memicu penurunan rating
    value: -ratingPenalty, // Nilai negatif untuk menurunkan rating
    isRead: false,
    tradeType: 'kelistrikan_kurang',
    deficitAmount,
    affectedAreas,
    severity: actualSeverity,
    durationDays,
    remainingDurationDays: durationDays,
    startDate: dateStr,
  };
}

// Fungsi untuk mengecek apakah ada defisit kelistrikan berdasarkan data negara
export function shouldTriggerKelistrikanNotification(
  countryDetail?: Record<string, unknown> | null
): boolean {
  if (!countryDetail) return false;
  
  // Ambil data surplus_listrik dari countryDetail
  const surplusListrik = countryDetail.surplus_listrik as number | undefined;
  
  // Trigger notification jika surplus_listrik negatif (defisit)
  if (surplusListrik !== undefined && surplusListrik < 0) {
    // Probability based on deficit severity
    const deficitSeverity = Math.abs(surplusListrik);
    let probability = 0;
    
    if (deficitSeverity > 0 && deficitSeverity <= 50) {
      probability = 0.3; // 30% chance for small deficit
    } else if (deficitSeverity > 50 && deficitSeverity <= 100) {
      probability = 0.6; // 60% chance for medium deficit
    } else if (deficitSeverity > 100) {
      probability = 0.9; // 90% chance for large deficit
    }
    
    return Math.random() < probability;
  }
  
  return false;
}