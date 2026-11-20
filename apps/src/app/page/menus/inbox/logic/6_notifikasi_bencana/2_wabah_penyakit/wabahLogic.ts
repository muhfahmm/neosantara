// wabahLogic.ts
// Logika dan generator event Wabah Penyakit (Epidemi 40% + Pandemi 10% per tahun)

import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import {
  canPandemicOccur,
  canEpidemicOccur,
  getRemainingOutbreakQuota,
  getActiveOutbreakPopulationLoss,
  handleMedicalAssistance,
  deactivateOutbreak,
  PANDEMIC_YEARLY_DISTRIBUTION,
  PANDEMIC_YEARLY_PERCENTAGE_CYCLE,
  getDailyOutbreakChancePercent,
  getPandemicBaseChancePercentByYear,
  getPandemicYearlyDistribution,
  getMonthlyOutbreakChancePercent,
  EPIDEMIC_YEARLY_DISTRIBUTION,
  determineYearlyOutbreakCount,
  parseYearMonth,
} from './outbreakManagement';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export {
  PANDEMIC_YEARLY_PERCENTAGE_CYCLE,
  getDailyOutbreakChancePercent,
  getPandemicBaseChancePercentByYear,
  getPandemicYearlyDistribution,
  getMonthlyOutbreakChancePercent,
};

export interface WabahPenyakitNotification extends NotificationMessage {
  tradeType: 'wabah_penyakit';
  category: string; // Wabah Penyakit Menular, Penyakit Hewan & Tumbuhan, Penyakit Baru & Mutasi, Pandemi Global
  categoryKey: string;
  eventName: string;
  eventNameKey: string;
  korban: number; // Jumlah pasien terinfeksi / korban terdampak
  perkiraanKematian: number;
  durationDays: number;
  remainingDurationDays?: number;
  startDate?: string;
  skenario?: string;
  persentaseTerinfeksi?: number;
  persentaseKematian?: number;
  totalKerugian: number; // Dalam NEO (Kerugian ekonomi / medis)
  bantuanCost: number; // 1 NEO / Korban = korban
  isHandled?: boolean;
}

interface WabahEventItem {
  nameKey: string;
  category: string;
  weight: number;
  korbanRange: [number, number];
  kerugianRange: [number, number];
}

const SKENARIO_PANDEMI = [
  { nama: 'Ringan', persentaseTerinfeksi: 0.1 },
  { nama: 'Menengah', persentaseTerinfeksi: 0.25 },
  { nama: 'Berat', persentaseTerinfeksi: 0.4 },
  { nama: 'Sangat berat', persentaseTerinfeksi: 0.5 },
] as const;

const POPULASI_ACUAN = 50_000_000;

export const EPIDEMIC_BASE_CHANCE_PERCENT = 40;
export const PANDEMIC_BASE_CHANCE_PERCENT = 10;

const randomInRange = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const WABAH_PENYAKIT_POOL: WabahEventItem[] = [
  // Wabah Penyakit Menular (20%) - Epidemi
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.dengue',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 5,
    korbanRange: [800, 5000],
    kerugianRange: [500000, 2500000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.malaria',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 4,
    korbanRange: [600, 4000],
    kerugianRange: [400000, 2000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.cholera',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 3,
    korbanRange: [500, 3500],
    kerugianRange: [300000, 1500000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.typhoid',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 2,
    korbanRange: [400, 2500],
    kerugianRange: [250000, 1200000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.tuberculosis',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 2,
    korbanRange: [700, 4500],
    kerugianRange: [450000, 2200000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.hepatitisA',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 1,
    korbanRange: [300, 2000],
    kerugianRange: [200000, 1000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.measles',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 1,
    korbanRange: [400, 2500],
    kerugianRange: [250000, 1100000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.polio',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 1,
    korbanRange: [200, 1500],
    kerugianRange: [150000, 900000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.diphtheria',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 0.5,
    korbanRange: [150, 1000],
    kerugianRange: [100000, 600000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.rabies',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 0.5,
    korbanRange: [100, 800],
    kerugianRange: [80000, 500000],
  },

  // Penyakit Hewan & Tumbuhan (8%) - Epidemi
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.avianFlu',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 2,
    korbanRange: [1000, 6000],
    kerugianRange: [800000, 4000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.footAndMouth',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 2,
    korbanRange: [1200, 8000],
    kerugianRange: [900000, 4500000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.ricePlanthopper',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 1.5,
    korbanRange: [1500, 9000],
    kerugianRange: [1000000, 5000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.ganoderma',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 1,
    korbanRange: [800, 5000],
    kerugianRange: [600000, 3000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.tungro',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 0.5,
    korbanRange: [500, 3000],
    kerugianRange: [400000, 2000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.ratInfestation',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 0.5,
    korbanRange: [1000, 7000],
    kerugianRange: [700000, 3500000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.bananaWilt',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 0.3,
    korbanRange: [400, 2500],
    kerugianRange: [300000, 1500000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.africanSwineFever',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 0.2,
    korbanRange: [800, 5000],
    kerugianRange: [600000, 3000000],
  },

  // Penyakit Baru & Mutasi (2%) - Epidemi
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.superbug',
    category: 'Mutasi Genetik & Superbug',
    weight: 1,
    korbanRange: [1500, 9000],
    kerugianRange: [1200000, 6000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.candidaAuris',
    category: 'Mutasi Genetik & Superbug',
    weight: 0.5,
    korbanRange: [1000, 6000],
    kerugianRange: [800000, 4000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.autoimmune',
    category: 'Mutasi Genetik & Superbug',
    weight: 0.5,
    korbanRange: [800, 5000],
    kerugianRange: [700000, 3500000],
  },

  // Pandemi Global (10%) - Pandemi
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.globalInfluenza',
    category: 'Pandemi Global',
    weight: 4,
    korbanRange: [8000, 50000],
    kerugianRange: [6000000, 30000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.coronavirusVariant',
    category: 'Pandemi Global',
    weight: 3,
    korbanRange: [10000, 70000],
    kerugianRange: [8000000, 40000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.pathogenX',
    category: 'Pandemi Global',
    weight: 1,
    korbanRange: [15000, 90000],
    kerugianRange: [10000000, 50000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.mpox',
    category: 'Pandemi Global',
    weight: 1,
    korbanRange: [5000, 30000],
    kerugianRange: [4000000, 20000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.hivVariant',
    category: 'Pandemi Global',
    weight: 0.5,
    korbanRange: [4000, 25000],
    kerugianRange: [3000000, 15000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.zombieVirus',
    category: 'Pandemi Global',
    weight: 0.3,
    korbanRange: [20000, 120000],
    kerugianRange: [15000000, 80000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.engineeredSpanishFlu',
    category: 'Pandemi Global',
    weight: 0.2,
    korbanRange: [12000, 80000],
    kerugianRange: [9000000, 45000000],
  },
  // Varian Baru Tak Terduga
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.mysteriousEncephalitis',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 1.5,
    korbanRange: [700, 4800],
    kerugianRange: [600000, 3200000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.congoHemorrhagicFever',
    category: 'Wabah Penyakit Menular (Epidemi)',
    weight: 1.0,
    korbanRange: [400, 3200],
    kerugianRange: [500000, 2800000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.marburgVariant',
    category: 'Pandemi Global',
    weight: 0.8,
    korbanRange: [6000, 38000],
    kerugianRange: [5000000, 25000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.outbreak.eventNames.redTide',
    category: 'Penyakit Hewan & Tumbuhan (Epidemi)',
    weight: 1.2,
    korbanRange: [900, 6500],
    kerugianRange: [800000, 4200000],
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
  let mutasiKey: string | undefined;

  if (virulensiRoll < 0.20) {
    // 20% Varian Terkendali / Respons Cepat
    virulensiMultiplier = 0.5 + Math.random() * 0.3; // 50% - 80%
    mutasiLabel = "Klaster Terlokalisir";
    mutasiKey = 'side_inbox.dynamicEventTranslations.outbreak.localizedCluster';
  } else if (virulensiRoll > 0.80) {
    // 20% Mutasi Ganas / Super-Spreader Tak Terduga
    virulensiMultiplier = 1.5 + Math.random() * 0.9; // 150% - 240%
    mutasiLabel = "Mutasi Strain Super-Spreader";
    mutasiKey = 'side_inbox.dynamicEventTranslations.outbreak.superSpreader';
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
  const eventName = getDefaultInboxText(selectedEvent.nameKey);
  const categoryKeyByLabel: Record<string, string> = {
    'Wabah Penyakit Menular (Epidemi)': 'side_inbox.dynamicEventTranslations.outbreak.categories.infectious',
    'Penyakit Hewan & Tumbuhan (Epidemi)': 'side_inbox.dynamicEventTranslations.outbreak.categories.animalAndPlant',
    'Mutasi Genetik & Superbug': 'side_inbox.dynamicEventTranslations.outbreak.categories.mutations',
    'Pandemi Global': 'side_inbox.dynamicEventTranslations.outbreak.categories.pandemic',
  };
  const categoryKey = categoryKeyByLabel[selectedEvent.category];
  if (!categoryKey) throw new Error(`Missing outbreak category translation key: ${selectedEvent.category}`);
  const outbreakTypeKey = isPandemi
    ? 'side_inbox.dynamicEventTranslations.outbreak.pandemic'
    : 'side_inbox.dynamicEventTranslations.outbreak.epidemic';
  const titleKey = mutasiKey
    ? 'side_inbox.dynamicEventTranslations.outbreak.titleWithVariant'
    : 'side_inbox.dynamicEventTranslations.outbreak.title';
  const titleParams = {
    outbreakType: getDefaultInboxText(outbreakTypeKey),
    eventName,
    ...(mutasiKey ? { variant: getDefaultInboxText(mutasiKey) } : {}),
  };
  const messageKey = mutasiKey
    ? 'side_inbox.dynamicEventTranslations.outbreak.messageWithVariant'
    : 'side_inbox.dynamicEventTranslations.outbreak.message';
  const messageParams = {
    country,
    eventName,
    infected: korban.toLocaleString('id-ID'),
    deaths: perkiraanKematian.toLocaleString('id-ID'),
    duration: durationDays,
    ...(mutasiKey ? { variant: getDefaultInboxText(mutasiKey) } : {}),
  };

  return {
    id: `wabah-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    titleParamKeys: {
      outbreakType: outbreakTypeKey,
      eventName: selectedEvent.nameKey,
      ...(mutasiKey ? { variant: mutasiKey } : {}),
    },
    sender: getDefaultInboxText('side_inbox.dynamicEventTranslations.outbreak.sender', { country }),
    senderKey: 'side_inbox.dynamicEventTranslations.outbreak.sender',
    senderParams: { country },
    ...createInboxNotificationText(messageKey, messageParams, {
      eventName: selectedEvent.nameKey,
      ...(mutasiKey ? { variant: mutasiKey } : {}),
    }),
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'wabah_penyakit',
    category: selectedEvent.category,
    categoryKey,
    eventName,
    eventNameKey: selectedEvent.nameKey,
    korban,
    perkiraanKematian,
    durationDays,
    remainingDurationDays: durationDays,
    startDate: dateStr,
    ...(skenario ? { skenario } : {}),
    ...(persentaseTerinfeksi === undefined ? {} : { persentaseTerinfeksi }),
    ...(!isNonHumanOutbreak ? { persentaseKematian } : {}),
    totalKerugian,
    bantuanCost
  };
}

// Export re-exports dari outbreakManagement untuk convenience
export {
  canPandemicOccur,
  canEpidemicOccur,
  getRemainingOutbreakQuota,
  handleMedicalAssistance,
  deactivateOutbreak,
  applyOutbreakPopulationLoss,
  PANDEMIC_YEARLY_DISTRIBUTION,
  EPIDEMIC_YEARLY_DISTRIBUTION,
  determineYearlyOutbreakCount,
  parseYearMonth,
  getDaysDifference,
  getMonthsDifference,
} from './outbreakManagement';
