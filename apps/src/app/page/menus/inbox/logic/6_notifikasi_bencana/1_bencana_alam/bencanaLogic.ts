// bencanaLogic.ts
// Logika dan generator event Bencana Alam (Weight 60%)

import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface BencanaAlamNotification extends NotificationMessage {
  tradeType: 'bencana_alam';
  category: string;
  eventName: string;
  korban: number; // Jumlah korban jiwa/terdampak
  totalKerugian: number; // Dalam NEO
  bantuanCost: number; // 1 NEO / Korban = korban
  isHandled?: boolean;
}

interface BencanaEventItem {
  name: string;
  category: string;
  weight: number;
  korbanRange: [number, number];
  kerugianRange: [number, number];
  descriptionTemplate: (country: string, korban: number, kerugian: number) => string;
}

export const BENCANA_ALAM_POOL: BencanaEventItem[] = [
  // Bencana Geologi (10%)
  {
    name: 'Gempa Bumi Ringan',
    category: 'Bencana Geologi',
    weight: 4,
    korbanRange: [100, 800],
    kerugianRange: [100000, 500000],
    descriptionTemplate: (country) => `Gempa bumi tektonik berkekuatan sedang mengguncang wilayah pesisir ${country}. Beberapa bangunan pemukiman warga mengalami retak dan kerusakan parsial.`,
  },
  {
    name: 'Gempa Bumi Besar',
    category: 'Bencana Geologi',
    weight: 2,
    korbanRange: [2000, 15000],
    kerugianRange: [2000000, 15000000],
    descriptionTemplate: (country) => `Gempa bumi dahsyat mengguncang pusat kota ${country}, merobohkan berbagai fasilitas umum dan infrastruktur publik. Posko darurat telah didirikan untuk evakuasi warga.`,
  },
  {
    name: 'Letusan Gunung Berapi',
    category: 'Bencana Geologi',
    weight: 2,
    korbanRange: [1500, 10000],
    kerugianRange: [1500000, 10000000],
    descriptionTemplate: (country) => `Gunung berapi aktif melontarkan abu vulkanik pekat dan awan panas di sekitar wilayah lereng pemukiman ${country}. Warga radius 15 km diminta segera mengungsi.`,
  },
  {
    name: 'Tsunami',
    category: 'Bencana Geologi',
    weight: 1,
    korbanRange: [5000, 40000],
    kerugianRange: [5000000, 30000000],
    descriptionTemplate: (country) => `Gelombang tsunami menerjang kawasan pantai ${country} menyusul gempa bawah laut mendalam. Terjadi kerusakan masif pada wilayah pelabuhan dan pemukiman pesisir.`,
  },
  {
    name: 'Tanah Longsor',
    category: 'Bencana Geologi',
    weight: 1,
    korbanRange: [300, 2000],
    kerugianRange: [200000, 1200000],
    descriptionTemplate: (country) => `Hujan deras terus-menerus memicu material tanah tebing longsor menimbun jalan utama dan perkampungan di wilayah dataran tinggi ${country}.`,
  },

  // Bencana Hidrometeorologi (20%)
  {
    name: 'Banjir Besar',
    category: 'Bencana Hidrometeorologi',
    weight: 6,
    korbanRange: [1000, 8000],
    kerugianRange: [800000, 4000000],
    descriptionTemplate: (country) => `Luapan sungai utama merendam ribuan rumah warga di kawasan perkotaan ${country}. Aktivitas ekonomi dan transportasi lumpuh total.`,
  },
  {
    name: 'Banjir Bandang',
    category: 'Bencana Hidrometeorologi',
    weight: 3,
    korbanRange: [800, 5000],
    kerugianRange: [600000, 3000000],
    descriptionTemplate: (country) => `Banjir bandang membawa lumpur dan material kayu menerjang pemukiman warga di sekitar DAS ${country} secara mendadak.`,
  },
  {
    name: 'Kekeringan Panjang',
    category: 'Bencana Hidrometeorologi',
    weight: 4,
    korbanRange: [2000, 12000],
    kerugianRange: [1000000, 6000000],
    descriptionTemplate: (country) => `Fenomena kemarau ekstrem menyebabkan krisis air bersih dan kegagalan panen serentak di sektor pertanian ${country}.`,
  },
  {
    name: 'Badai Tropis',
    category: 'Bencana Hidrometeorologi',
    weight: 4,
    korbanRange: [1200, 7000],
    kerugianRange: [900000, 4500000],
    descriptionTemplate: (country) => `Badai tropis disertai angin kencang merobohkan tiang listrik dan merusak atap bangunan pemukiman warga di ${country}.`,
  },
  {
    name: 'Siklon Tropis',
    category: 'Bencana Hidrometeorologi',
    weight: 1,
    korbanRange: [3000, 20000],
    kerugianRange: [3000000, 18000000],
    descriptionTemplate: (country) => `Siklon tropis skala besar menerjang garis pantai ${country} memicu hujan lebat dan angin destruktif berkecepatan tinggi.`,
  },
  {
    name: 'Angin Puting Beliung',
    category: 'Bencana Hidrometeorologi',
    weight: 1,
    korbanRange: [200, 1500],
    kerugianRange: [150000, 800000],
    descriptionTemplate: (country) => `Puting beliung berputar merusak permukiman padat penduduk dan pasar tradisional di beberapa kawasan ${country}.`,
  },
  {
    name: 'Hujan Es Ekstrem',
    category: 'Bencana Hidrometeorologi',
    weight: 1,
    korbanRange: [150, 1000],
    kerugianRange: [100000, 600000],
    descriptionTemplate: (country) => `Fenomena hujan es berukuran sedang merusak kendaraan publik dan lahan pertanian produktif di ${country}.`,
  },

  // Bencana Kebakaran (12%)
  {
    name: 'Kebakaran Hutan',
    category: 'Bencana Kebakaran',
    weight: 5,
    korbanRange: [1500, 10000],
    kerugianRange: [1200000, 7000000],
    descriptionTemplate: (country) => `Kebakaran hutan hebat meluas di kawasan konservasi ${country}, memicu kabut asap tebal dan gangguan saluran pernapasan warga.`,
  },
  {
    name: 'Kebakaran Lahan Gambut',
    category: 'Bencana Kebakaran',
    weight: 3,
    korbanRange: [1000, 6000],
    kerugianRange: [800000, 4000000],
    descriptionTemplate: (country) => `Kebakaran bawah tanah di lahan gambut ${country} membara dan menyebarkan asap pekat ke wilayah sekitar.`,
  },
  {
    name: 'Kebakaran Industri',
    category: 'Bencana Kebakaran',
    weight: 2,
    korbanRange: [400, 3000],
    kerugianRange: [1000000, 5000000],
    descriptionTemplate: (country) => `Ledakan dan kebakaran hebat melanda kawasan pabrik manufaktur di zona industri ${country}.`,
  },
  {
    name: 'Kebakaran Permukiman Padat',
    category: 'Bencana Kebakaran',
    weight: 2,
    korbanRange: [500, 4000],
    kerugianRange: [400000, 2500000],
    descriptionTemplate: (country) => `Kebakaran meluas menghanguskan ratusan rumah di kawasan permukiman padat ibu kota ${country}.`,
  },

  // Bencana Laut & Pesisir (8%)
  {
    name: 'Abrasi Pantai',
    category: 'Bencana Laut & Pesisir',
    weight: 4,
    korbanRange: [200, 1500],
    kerugianRange: [150000, 900000],
    descriptionTemplate: (country) => `Pengikisan garis pantai mengancam pondasi bangunan desa nelayan dan infrastruktur pesisir di ${country}.`,
  },
  {
    name: 'Puting Beliung Laut',
    category: 'Bencana Laut & Pesisir',
    weight: 2,
    korbanRange: [300, 2000],
    kerugianRange: [250000, 1200000],
    descriptionTemplate: (country) => `Puting beliung di kawasan perairan menghempaskan kapal-kapal nelayan dan merusak fasilitas dermaga ${country}.`,
  },
  {
    name: 'Kenaikan Air Laut',
    category: 'Bencana Laut & Pesisir',
    weight: 2,
    korbanRange: [800, 5000],
    kerugianRange: [600000, 3500000],
    descriptionTemplate: (country) => `Fenomena banjir rob pasang laut merendam jalan perkotaan dan fasilitas pelabuhan utama di ${country}.`,
  },

  // Krisis Kesehatan Lingkungan (10%)
  {
    name: 'Keracunan Massal Pangan',
    category: 'Krisis Kesehatan Lingkungan',
    weight: 4,
    korbanRange: [300, 2500],
    kerugianRange: [200000, 1000000],
    descriptionTemplate: (country) => `Insiden keracunan bahan pangan terkontaminasi menyebabkan ratusan warga di ${country} harus dirawat intensif.`,
  },
  {
    name: 'Keracunan Air Bersih',
    category: 'Krisis Kesehatan Lingkungan',
    weight: 3,
    korbanRange: [500, 4000],
    kerugianRange: [350000, 1800000],
    descriptionTemplate: (country) => `Pencemaran zat kimia pada sumber air minum publik mengakibatkan krisis pasokan air bersih di ${country}.`,
  },
  {
    name: 'Polusi Udara Ekstrem',
    category: 'Krisis Kesehatan Lingkungan',
    weight: 2,
    korbanRange: [1000, 7000],
    kerugianRange: [500000, 2500000],
    descriptionTemplate: (country) => `Indeks kualitas udara memburuk ke tingkat berbahaya di perkotaan ${country}, meningkatkan kasus ISPA massal.`,
  },
  {
    name: 'Krisis Limbah B3',
    category: 'Krisis Kesehatan Lingkungan',
    weight: 1,
    korbanRange: [400, 3000],
    kerugianRange: [400000, 2000000],
    descriptionTemplate: (country) => `Kebocoran limbah bahan berbahaya dan beracun dari industri mencemari area permukiman warga ${country}.`,
  }
];

export function generateBencanaAlamNotification(
  userCountryName: string,
  dateStr: string
): BencanaAlamNotification {
  const totalWeight = BENCANA_ALAM_POOL.reduce((acc, item) => acc + item.weight, 0);
  let roll = Math.random() * totalWeight;

  let selectedEvent = BENCANA_ALAM_POOL[0];
  for (const item of BENCANA_ALAM_POOL) {
    if (roll < item.weight) {
      selectedEvent = item;
      break;
    }
    roll -= item.weight;
  }

  const [minK, maxK] = selectedEvent.korbanRange;
  const korban = Math.floor(Math.random() * (maxK - minK + 1)) + minK;

  const [minR, maxR] = selectedEvent.kerugianRange;
  const totalKerugian = Math.floor(Math.random() * (maxR - minR + 1)) + minR;

  // Rule: 1 Korban = 1 NEO
  const bantuanCost = korban;

  const country = userCountryName || 'Indonesia';
  const message = selectedEvent.descriptionTemplate(country, korban, totalKerugian);

  return {
    id: `bencana-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: `🚨 BENCANA ALAM: ${selectedEvent.name.toUpperCase()}`,
    sender: `BADAN NASIONAL PENANGGULANGAN BENCANA (${country.toUpperCase()})`,
    message,
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'bencana_alam',
    category: selectedEvent.category,
    eventName: selectedEvent.name,
    korban,
    totalKerugian,
    bantuanCost
  };
}
