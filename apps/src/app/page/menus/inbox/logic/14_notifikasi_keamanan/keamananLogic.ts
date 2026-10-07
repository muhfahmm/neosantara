import { NotificationMessage } from '../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface KeamananNotification extends NotificationMessage {
  tradeType: 'keamanan';
  category: 'Insiden Kepolisian';
  eventName: string;
  eventType: 'police';
  securityRiskPercent: number;
  korban: number;
  totalKerugian: number;
  bantuanCost: number;
  responseCost: number;
  isHandled?: boolean;
}

interface KejahatanEvent {
  name: string;
  weight: number;
  korbanRange: [number, number];
  kerugianRange: [number, number];
  responseCostRange: [number, number];
  descriptionTemplate: (country: string) => string;
}

const KEJAHATAN_POOL: KejahatanEvent[] = [
  {
    name: 'Perampokan Bersenjata',
    weight: 2,
    korbanRange: [1, 5],
    kerugianRange: [50000, 800000],
    responseCostRange: [10000, 80000],
    descriptionTemplate: (country) => `Kepolisian melaporkan perampokan bersenjata di ${country}. Aparat mengamankan warga terdampak dan memburu pelaku.`,
  },
  {
    name: 'Perampokan Pusat Keuangan',
    weight: 1,
    korbanRange: [1, 4],
    kerugianRange: [100000, 1500000],
    responseCostRange: [15000, 100000],
    descriptionTemplate: (country) => `Aksi perampokan menyasar bank atau pusat keuangan di ${country}. Kepolisian menyelidiki kasus dan mengejar pelaku.`,
  },
  {
    name: 'Pembobolan dan Pencurian',
    weight: 1,
    korbanRange: [1, 5],
    kerugianRange: [30000, 500000],
    responseCostRange: [8000, 60000],
    descriptionTemplate: (country) => `Pembobolan dan pencurian dilaporkan di beberapa kawasan ${country}. Kepolisian meningkatkan patroli dan mengumpulkan bukti.`,
  },
  {
    name: 'Jaringan Kejahatan Terorganisasi',
    weight: 1,
    korbanRange: [2, 8],
    kerugianRange: [100000, 1200000],
    responseCostRange: [20000, 120000],
    descriptionTemplate: (country) => `Aparat mengungkap jaringan kejahatan terorganisasi di ${country}. Operasi gabungan diperlukan untuk menangkap pelaku dan melindungi saksi.`,
  },
  {
    name: 'Kerusuhan dan Gangguan Ketertiban',
    weight: 1,
    korbanRange: [2, 10],
    kerugianRange: [100000, 1000000],
    responseCostRange: [15000, 100000],
    descriptionTemplate: (country) => `Kerusuhan lokal mengganggu ketertiban umum di ${country}. Kepolisian dikerahkan untuk melindungi warga dan memulihkan keamanan.`,
  },
  {
    name: 'Pencopetan di Area Publik',
    weight: 2,
    korbanRange: [1, 3],
    kerugianRange: [1000, 30000],
    responseCostRange: [3000, 18000],
    descriptionTemplate: (country) => `Warga melaporkan pencopetan di kawasan ramai ${country}. Kepolisian membuka penyelidikan dan meningkatkan patroli.`,
  },
  {
    name: 'Pencurian Kendaraan',
    weight: 2,
    korbanRange: [1, 3],
    kerugianRange: [10000, 150000],
    responseCostRange: [5000, 25000],
    descriptionTemplate: (country) => `Pencurian kendaraan dilaporkan di ${country}. Aparat menelusuri bukti dan laporan kehilangan warga.`,
  },
  {
    name: 'Penipuan Digital',
    weight: 2,
    korbanRange: [1, 8],
    kerugianRange: [5000, 250000],
    responseCostRange: [5000, 30000],
    descriptionTemplate: (country) => `Laporan penipuan digital merugikan warga ${country}. Unit siber kepolisian menelusuri transaksi dan membantu korban melapor.`,
  },
  {
    name: 'Vandalisme Fasilitas Umum',
    weight: 1,
    korbanRange: [1, 2],
    kerugianRange: [5000, 80000],
    responseCostRange: [3000, 20000],
    descriptionTemplate: (country) => `Fasilitas umum di ${country} dirusak dalam aksi vandalisme. Kepolisian mengumpulkan keterangan saksi dan mengamankan lokasi.`,
  },
  {
    name: 'Penculikan',
    weight: 1,
    korbanRange: [1, 2],
    kerugianRange: [10000, 100000],
    responseCostRange: [12000, 60000],
    descriptionTemplate: (country) => `Kepolisian ${country} menyelidiki laporan penculikan dan mengerahkan tim untuk mencari korban serta melindungi keluarga.`,
  },
  {
    name: 'Pemerasan terhadap Pelaku Usaha',
    weight: 1,
    korbanRange: [1, 6],
    kerugianRange: [5000, 120000],
    responseCostRange: [8000, 40000],
    descriptionTemplate: (country) => `Pelaku usaha di ${country} melaporkan pemerasan. Kepolisian membuka penyelidikan dan menyediakan saluran pelaporan aman.`,
  },
  {
    name: 'Perdagangan Manusia',
    weight: 1,
    korbanRange: [1, 10],
    kerugianRange: [20000, 200000],
    responseCostRange: [20000, 100000],
    descriptionTemplate: (country) => `Aparat ${country} menyelidiki dugaan perdagangan manusia dan mengutamakan perlindungan serta pendampingan korban.`,
  },
];

function randomInRange([min, max]: [number, number]): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateKeamananNotification(
  countryName: string,
  date: string,
  securityRiskPercent: number,
): KeamananNotification {
  if (KEJAHATAN_POOL.length === 0) {
    throw new Error('Tidak ada skenario kejahatan yang tersedia.');
  }

  const totalWeight = KEJAHATAN_POOL.reduce((sum, event) => sum + event.weight, 0);
  let roll = Math.random() * totalWeight;
  let selectedEvent = KEJAHATAN_POOL[0];
  for (const event of KEJAHATAN_POOL) {
    if (roll < event.weight) {
      selectedEvent = event;
      break;
    }
    roll -= event.weight;
  }

  const country = countryName || 'Indonesia';
  const korban = Math.min(10, randomInRange(selectedEvent.korbanRange));
  const totalKerugian = randomInRange(selectedEvent.kerugianRange);
  const responseCost = randomInRange(selectedEvent.responseCostRange);
  const clampedRiskPercent = Math.min(100, Math.max(0, securityRiskPercent));

  return {
    id: `keamanan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: `🚔 INSIDEN KEPOLISIAN: ${selectedEvent.name.toUpperCase()}`,
    sender: `KEPOLISIAN NEGARA (${country.toUpperCase()})`,
    message: selectedEvent.descriptionTemplate(country),
    timestamp: date,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'keamanan',
    category: 'Insiden Kepolisian',
    eventName: selectedEvent.name,
    eventType: 'police',
    securityRiskPercent: clampedRiskPercent,
    korban,
    totalKerugian,
    bantuanCost: korban,
    responseCost,
  };
}
