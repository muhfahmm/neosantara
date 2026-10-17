// wabahLogic.ts
// Logika dan generator event Wabah Penyakit (Epidemi 30% + Pandemi 10% = Weight 40%)

import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface WabahPenyakitNotification extends NotificationMessage {
  tradeType: 'wabah_penyakit';
  category: string; // Wabah Penyakit Menular, Penyakit Hewan & Tumbuhan, Penyakit Baru & Mutasi, Pandemi Global
  eventName: string;
  korban: number; // Jumlah pasien terinfeksi / korban terdampak
  perkiraanKematian: number;
  durationDays: number;
  skenario?: string;
  persentaseTerinfeksi?: number;
  persentaseKematian?: number;
  totalKerugian: number; // Dalam NEO (Kerugian ekonomi / medis)
  bantuanCost: number; // 1 NEO / Korban = korban
  isHandled?: boolean;
}

interface WabahEventItem {
  name: string;
  category: string;
  weight: number;
  korbanRange: [number, number];
  kerugianRange: [number, number];
  descriptionTemplate: (country: string, korban: number, kerugian: number) => string;
}

const SKENARIO_PANDEMI = [
  { nama: 'Ringan', persentaseTerinfeksi: 0.1 },
  { nama: 'Menengah', persentaseTerinfeksi: 0.25 },
  { nama: 'Berat', persentaseTerinfeksi: 0.4 },
  { nama: 'Sangat berat', persentaseTerinfeksi: 0.5 },
] as const;

const POPULASI_ACUAN = 50_000_000;

export const EPIDEMIC_BASE_CHANCE_PERCENT = 50;
export const PANDEMIC_BASE_CHANCE_PERCENT = 25;

const randomInRange = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const WABAH_PENYAKIT_POOL: WabahEventItem[] = [
  // Wabah Penyakit Menular (20%) - Epidemi
  {
    name: 'Wabah Demam Berdarah',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 5,
    korbanRange: [800, 5000],
    kerugianRange: [500000, 2500000],
    descriptionTemplate: (country) => `Peningkatan populasi nyamuk Aedes aegypti memicu lonjakan kasus Demam Berdarah Dengue (DBD) di sejumlah provinsi di ${country}.`,
  },
  {
    name: 'Wabah Malaria',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 4,
    korbanRange: [600, 4000],
    kerugianRange: [400000, 2000000],
    descriptionTemplate: (country) => `Kasus malaria endemik melonjak tajam di area pemukiman perbatasan dan pesisir tropis ${country}.`,
  },
  {
    name: 'Wabah Kolera',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 3,
    korbanRange: [500, 3500],
    kerugianRange: [300000, 1500000],
    descriptionTemplate: (country) => `Kontaminasi saluran pencemaran air bersih memicu penularan infeksi kolera massal di permukiman padat ${country}.`,
  },
  {
    name: 'Wabah Tifus',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 2,
    korbanRange: [400, 2500],
    kerugianRange: [250000, 1200000],
    descriptionTemplate: (country) => `Infeksi bakteri tifus menyebar luas akibat penurunan sanitasi lingkungan pasca banjir di ${country}.`,
  },
  {
    name: 'Wabah Tuberkulosis',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 2,
    korbanRange: [700, 4500],
    kerugianRange: [450000, 2200000],
    descriptionTemplate: (country) => `Penularan tuberkulosis paru meningkat secara signifikan di kawasan industri dan perkotaan ${country}.`,
  },
  {
    name: 'Wabah Hepatitis A',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 1,
    korbanRange: [300, 2000],
    kerugianRange: [200000, 1000000],
    descriptionTemplate: (country) => `Penyebaran virus Hepatitis A dilaporkan terinfeksi melalui jajanan publik yang tercemar di ${country}.`,
  },
  {
    name: 'Wabah Campak',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 1,
    korbanRange: [400, 2500],
    kerugianRange: [250000, 1100000],
    descriptionTemplate: (country) => `Penurunan cakupan imunisasi memicu munculnya outbreak kasus campak pada anak-anak di ${country}.`,
  },
  {
    name: 'Wabah Polio',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 1,
    korbanRange: [200, 1500],
    kerugianRange: [150000, 900000],
    descriptionTemplate: (country) => `Kementerian Kesehatan ${country} mendeteksi transmisi lokal virus polio dan menetapkan status KLB medis.`,
  },
  {
    name: 'Wabah Difteri',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 0.5,
    korbanRange: [150, 1000],
    kerugianRange: [100000, 600000],
    descriptionTemplate: (country) => `Infeksi difteri menyerang saluran pernapasan warga di permukiman padat penduduk ${country}.`,
  },
  {
    name: 'Wabah Rabies',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 0.5,
    korbanRange: [100, 800],
    kerugianRange: [80000, 500000],
    descriptionTemplate: (country) => `Gigitan hewan penular rabies meningkat pesat memicu kepanikan warga di pedesaan ${country}.`,
  },

  // Penyakit Hewan & Tumbuhan (8%) - Epidemi
  {
    name: 'Flu Burung H5N1',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 2,
    korbanRange: [1000, 6000],
    kerugianRange: [800000, 4000000],
    descriptionTemplate: (country) => `Penyebaran virus H5N1 pada ternak unggas memaksa pemusnahan massal di peternakan ${country}.`,
  },
  {
    name: 'Penyakit Mulut & Kuku (PMK)',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 2,
    korbanRange: [1200, 8000],
    kerugianRange: [900000, 4500000],
    descriptionTemplate: (country) => `Wabah PMK menyerang ribuan ekor sapi dan hewan ternak produktif di pusat peternakan ${country}.`,
  },
  {
    name: 'Hama Wereng Padi',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 1.5,
    korbanRange: [1500, 9000],
    kerugianRange: [1000000, 5000000],
    descriptionTemplate: (country) => `Serangan hama wereng cokelat merusak ratusan hektar tanaman padi produktif di ${country}.`,
  },
  {
    name: 'Jamur Ganoderma',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 1,
    korbanRange: [800, 5000],
    kerugianRange: [600000, 3000000],
    descriptionTemplate: (country) => `Infeksi jamur Ganoderma membusukkan akar perkebunan kelapa sawit utama di ${country}.`,
  },
  {
    name: 'Virus Tungro',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 0.5,
    korbanRange: [500, 3000],
    kerugianRange: [400000, 2000000],
    descriptionTemplate: (country) => `Virus tungro kerdil tanaman padi meluas menurunkan ketersediaan beras nasional di ${country}.`,
  },
  {
    name: 'Hama Tikus Massal',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 0.5,
    korbanRange: [1000, 7000],
    kerugianRange: [700000, 3500000],
    descriptionTemplate: (country) => `Ledakan populasi hama tikus merusak lumbung pangan dan tanaman siap panen di ${country}.`,
  },
  {
    name: 'Layu Bakteri Pisang',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 0.3,
    korbanRange: [400, 2500],
    kerugianRange: [300000, 1500000],
    descriptionTemplate: (country) => `Penyakit darah pisang mematikan perkebunan holtikultura di wilayah selatan ${country}.`,
  },
  {
    name: 'Flu Babi Afrika (ASF)',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 0.2,
    korbanRange: [800, 5000],
    kerugianRange: [600000, 3000000],
    descriptionTemplate: (country) => `Virus African Swine Fever memicu kematian ternak babi skala besar di peternakan ${country}.`,
  },

  // Penyakit Baru & Mutasi (2%) - Epidemi
  {
    name: 'Wabah Superbug Resistant',
    category: 'Mutasi Genetik & Superbug',
    weight: 1,
    korbanRange: [1500, 9000],
    kerugianRange: [1200000, 6000000],
    descriptionTemplate: (country) => `Bakteri resisten multi-obat (Superbug) merebak di rumah sakit kota ${country} dan tidak mempan antibiotik biasa.`,
  },
  {
    name: 'Wabah Jamur Mematikan (Candida Auris)',
    category: 'Mutasi Genetik & Superbug',
    weight: 0.5,
    korbanRange: [1000, 6000],
    kerugianRange: [800000, 4000000],
    descriptionTemplate: (country) => `Patogen jamur mematikan menular di fasilitas kesehatan publik ${country} memicu krisis karantina medis.`,
  },
  {
    name: 'Penyakit Autoimun Massal',
    category: 'Mutasi Genetik & Superbug',
    weight: 0.5,
    korbanRange: [800, 5000],
    kerugianRange: [700000, 3500000],
    descriptionTemplate: (country) => `Gangguan autoimun misterius terdeteksi meluas pada ribuan pekerja industri di ${country}.`,
  },

  // Pandemi Global (10%) - Pandemi
  {
    name: 'Pandemi Influenza Global',
    category: 'Pandemi Global',
    weight: 4,
    korbanRange: [8000, 50000],
    kerugianRange: [6000000, 30000000],
    descriptionTemplate: (country) => `Mutasi virus influenza baru menyebar cepat antarnegara, memicu pandemi flu global yang menginfeksi warga ${country}.`,
  },
  {
    name: 'Pandemi Virus Corona Mutasi',
    category: 'Pandemi Global',
    weight: 3,
    korbanRange: [10000, 70000],
    kerugianRange: [8000000, 40000000],
    descriptionTemplate: (country) => `Varian baru virus Corona dengan daya tular tinggi merebak masif. Rumah sakit di ${country} kelebihan kapasitas rawat.`,
  },
  {
    name: 'Pandemi Virus Baru (Pathogen X)',
    category: 'Pandemi Global',
    weight: 1,
    korbanRange: [15000, 90000],
    kerugianRange: [10000000, 50000000],
    descriptionTemplate: (country) => `Organisasi Kesehatan Dunia menetapkan status Pandemi Global atas merebaknya virus baru (Pathogen X) yang menjangkiti ${country}.`,
  },
  {
    name: 'Pandemi Cacar Monyet (Mpox)',
    category: 'Pandemi Global',
    weight: 1,
    korbanRange: [5000, 30000],
    kerugianRange: [4000000, 20000000],
    descriptionTemplate: (country) => `Penularan Mpox skala internasional meluas cepat ke wilayah pemukiman di ${country}.`,
  },
  {
    name: 'Pandemi HIV/AIDS Varian Baru',
    category: 'Pandemi Global',
    weight: 0.5,
    korbanRange: [4000, 25000],
    kerugianRange: [3000000, 15000000],
    descriptionTemplate: (country) => `Varian baru penyakit imunitas menular terdeteksi di berbagai kota di ${country}.`,
  },
  {
    name: 'Virus Zombie (Bio-Lab Outbreak)',
    category: 'Pandemi Global',
    weight: 0.3,
    korbanRange: [20000, 120000],
    kerugianRange: [15000000, 80000000],
    descriptionTemplate: (country) => `DARURAT NASIONAL! Kebocoran sampel patogen neuro-virus di laboratorium senjata biologis memicu anomali perilaku agresif warga di ${country}.`,
  },
  {
    name: 'Mutasi Flu Spanyol Rekayasa',
    category: 'Pandemi Global',
    weight: 0.2,
    korbanRange: [12000, 80000],
    kerugianRange: [9000000, 45000000],
    descriptionTemplate: (country) => `Mutasi ganas virus influenza klasik merebak masif mengancam keselamatan sistem kesehatan nasional ${country}.`,
  },
  // Varian Baru Tak Terduga
  {
    name: 'Wabah Ensefalitis Misterius',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 1.5,
    korbanRange: [700, 4800],
    kerugianRange: [600000, 3200000],
    descriptionTemplate: (country) => `Gejala peradangan otak misterius menyebar cepat pada masyarakat perkotaan ${country}, memicu kepanikan dokter spesialis.`,
  },
  {
    name: 'Wabah Demam Berdarah Kongo (CCHF)',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 1.0,
    korbanRange: [400, 3200],
    kerugianRange: [500000, 2800000],
    descriptionTemplate: (country) => `Transmisi virus Crimean-Congo Hemorrhagic Fever yang ditularkan kutu parasit terdeteksi di beberapa distrik ${country}.`,
  },
  {
    name: 'Pandemi Virus Marburg Subtipe Baru',
    category: 'Pandemi Global',
    weight: 0.8,
    korbanRange: [6000, 38000],
    kerugianRange: [5000000, 25000000],
    descriptionTemplate: (country) => `Peringatan darurat kesehatan internasional diterbitkan setelah virus demam berdarah Marburg subtipe baru meluas ke perbatasan ${country}.`,
  },
  {
    name: 'Anomali Bio-Toksin Laut (Red Tide)',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 1.2,
    korbanRange: [900, 6500],
    kerugianRange: [800000, 4200000],
    descriptionTemplate: (country) => `Ledakan alga beracun (Red Tide) mencemari biota laut dan tambak nelayan pesisir ${country}, melumpuhkan ekspor perikanan.`,
  }
];

export function generateWabahPenyakitNotification(
  userCountryName: string,
  dateStr: string,
  jumlahPenduduk?: number,
  jenisWabah?: 'epidemi' | 'pandemi'
): WabahPenyakitNotification {
  const basePool = jenisWabah
    ? WABAH_PENYAKIT_POOL.filter(item =>
        item.category.includes('Pandemi') === (jenisWabah === 'pandemi')
      )
    : WABAH_PENYAKIT_POOL;

  // 🎲 Randomisasi Acak Berfluktuasi: Bobot tiap wabah mengalami noise acak dinamis (0.5x - 1.5x)
  const dynamicEventPool = basePool.map(item => ({
    ...item,
    dynamicWeight: item.weight * (0.5 + Math.random() * 1.0)
  }));

  const totalWeight = dynamicEventPool.reduce((acc, item) => acc + item.dynamicWeight, 0);
  let roll = Math.random() * totalWeight;

  let selectedEvent = dynamicEventPool[0] ?? WABAH_PENYAKIT_POOL[0];
  for (const item of dynamicEventPool) {
    if (roll < item.dynamicWeight) {
      selectedEvent = item;
      break;
    }
    roll -= item.dynamicWeight;
  }

  // 🦠 Mutasi / Tingkat Virulensi Tak Terduga
  const virulensiRoll = Math.random();
  let virulensiMultiplier = 1.0;
  let mutasiLabel = "";

  if (virulensiRoll < 0.20) {
    // 20% Varian Terkendali / Respons Cepat
    virulensiMultiplier = 0.5 + Math.random() * 0.3; // 50% - 80%
    mutasiLabel = " (Klaster Terlokalisir)";
  } else if (virulensiRoll > 0.80) {
    // 20% Mutasi Ganas / Super-Spreader Tak Terduga
    virulensiMultiplier = 1.5 + Math.random() * 0.9; // 150% - 240%
    mutasiLabel = " (Mutasi Strain Super-Spreader)";
  } else {
    // 60% Tingkat Penularan Reguler
    virulensiMultiplier = 0.85 + Math.random() * 0.4; // 85% - 125%
  }

  const [minK, maxK] = selectedEvent.korbanRange;
  const korbanDasar = Math.floor((Math.random() * (maxK - minK + 1) + minK) * virulensiMultiplier);
  const populasiValid = typeof jumlahPenduduk === 'number' && Number.isFinite(jumlahPenduduk)
    ? Math.max(0, Math.floor(jumlahPenduduk))
    : null;
  const faktorPopulasi = populasiValid === null ? 1 : populasiValid / 50_000_000;
  const isPandemi = selectedEvent.category.includes('Pandemi');
  const isNonHumanOutbreak = selectedEvent.category.includes('Hewan') ||
    selectedEvent.category.includes('Tumbuhan');
  let skenario: string | undefined;
  let persentaseTerinfeksi: number | undefined;

  if (populasiValid && populasiValid > 0 && !isNonHumanOutbreak) {
    if (isPandemi) {
      const scenario = SKENARIO_PANDEMI[Math.floor(Math.random() * SKENARIO_PANDEMI.length)];
      skenario = `${scenario.nama}${mutasiLabel ? ` - ${mutasiLabel.replace(/[\(\)]/g, '')}` : ''}`;
      // Variabilitas persentase infeksi dinamis
      persentaseTerinfeksi = Math.min(0.7, scenario.persentaseTerinfeksi * virulensiMultiplier);
    } else {
      skenario = `Epidemi ${mutasiLabel ? mutasiLabel.replace(/[\(\)]/g, '') : 'regional'}`;
      persentaseTerinfeksi = Math.min(0.35, (0.05 + Math.random() * 0.15) * virulensiMultiplier);
    }
  }

  const korban = populasiValid === null || !persentaseTerinfeksi
    ? populasiValid === null
      ? korbanDasar
      : Math.min(populasiValid, populasiValid > 0 ? Math.max(1, Math.floor(korbanDasar * faktorPopulasi)) : 0)
    : Math.min(populasiValid, Math.max(1, Math.round(populasiValid * persentaseTerinfeksi)));

  const [minR, maxR] = selectedEvent.kerugianRange;
  const kerugianDasar = Math.floor((Math.random() * (maxR - minR + 1) + minR) * virulensiMultiplier);
  const totalKerugian = populasiValid === null
    ? kerugianDasar
    : Math.floor(kerugianDasar * faktorPopulasi);

  // Rule: 1 Korban = 1 NEO
  const bantuanCost = korban;
  const durationDays = isNonHumanOutbreak
    ? randomInRange(10, 25)
    : randomInRange(isPandemi ? 45 : 20, isPandemi ? 150 : 75);
  const populationScale = populasiValid === null ? 1 : populasiValid / POPULASI_ACUAN;
  const [minimumDeaths, maximumDeaths] = isPandemi ? [15_000, 90_000] : [3_000, 12_000];
  const estimatedDeaths = isNonHumanOutbreak
    ? 0
    : Math.round(randomInRange(minimumDeaths, maximumDeaths) * populationScale * virulensiMultiplier);
  const perkiraanKematian = Math.min(korban, populasiValid === null
    ? estimatedDeaths
    : Math.min(populasiValid, estimatedDeaths));
  const persentaseKematian = korban > 0 ? perkiraanKematian / korban : 0;

  const country = userCountryName || 'Indonesia';
  const message = `${selectedEvent.descriptionTemplate(country, korban, totalKerugian)}${mutasiLabel ? ` [Laporan Medis: Terkonfirmasi ${mutasiLabel.replace(/[\(\)]/g, '')}]` : ''}`;

  return {
    id: `wabah-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: `${isPandemi ? '☣️ PANDEMI GLOBAL:' : '🦠 WABAH PENYAKIT:'} ${selectedEvent.name.toUpperCase()}${mutasiLabel ? mutasiLabel.toUpperCase() : ''}`,
    sender: `KEMENTERIAN KESEHATAN & WHO (${country.toUpperCase()})`,
    message,
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'wabah_penyakit',
    category: selectedEvent.category,
    eventName: selectedEvent.name,
    korban,
    perkiraanKematian,
    durationDays,
    ...(skenario ? { skenario } : {}),
    ...(persentaseTerinfeksi === undefined ? {} : { persentaseTerinfeksi }),
    ...(!isNonHumanOutbreak ? { persentaseKematian } : {}),
    totalKerugian,
    bantuanCost
  };
}
