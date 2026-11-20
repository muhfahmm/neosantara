// bencanaLogic.ts
// Logika dan generator event Bencana Alam (Weight 60%)

import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import {
  applyKementerianLingkunganHidupDisasterImpactReduction,
  applyLayananDaruratDisasterDeathReduction,
} from '@/app/page/bonus_logic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface BencanaAlamNotification extends NotificationMessage {
  tradeType: 'bencana_alam';
  category: string;
  categoryKey: string;
  eventName: string;
  eventNameKey: string;
  korban: number; // Jumlah korban jiwa/terdampak
  totalKerugian: number; // Dalam NEO
  bantuanCost: number; // 1 NEO / Korban = korban
  durationDays?: number;
  remainingDurationDays?: number;
  startDate?: string;
  isHandled?: boolean;
}

interface BencanaEventItem {
  nameKey: string;
  category: string;
  weight: number;
  korbanRange: [number, number];
  kerugianRange: [number, number];
}

export const BENCANA_ALAM_POOL: BencanaEventItem[] = [
  // Bencana Geologi (10%)
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.earthquakeLight',
    category: 'Bencana Geologi',
    weight: 4,
    korbanRange: [100, 800],
    kerugianRange: [100000, 500000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.earthquakeMajor',
    category: 'Bencana Geologi',
    weight: 2,
    korbanRange: [2000, 15000],
    kerugianRange: [2000000, 15000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.volcanicEruption',
    category: 'Bencana Geologi',
    weight: 2,
    korbanRange: [1500, 10000],
    kerugianRange: [1500000, 10000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.tsunami',
    category: 'Bencana Geologi',
    weight: 1,
    korbanRange: [5000, 40000],
    kerugianRange: [5000000, 30000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.landslide',
    category: 'Bencana Geologi',
    weight: 1,
    korbanRange: [300, 2000],
    kerugianRange: [200000, 1200000],
  },

  // Bencana Hidrometeorologi (20%)
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.majorFlood',
    category: 'Bencana Hidrometeorologi',
    weight: 6,
    korbanRange: [1000, 8000],
    kerugianRange: [800000, 4000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.flashFlood',
    category: 'Bencana Hidrometeorologi',
    weight: 3,
    korbanRange: [800, 5000],
    kerugianRange: [600000, 3000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.drought',
    category: 'Bencana Hidrometeorologi',
    weight: 4,
    korbanRange: [2000, 12000],
    kerugianRange: [1000000, 6000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.tropicalStorm',
    category: 'Bencana Hidrometeorologi',
    weight: 4,
    korbanRange: [1200, 7000],
    kerugianRange: [900000, 4500000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.cyclone',
    category: 'Bencana Hidrometeorologi',
    weight: 1,
    korbanRange: [3000, 20000],
    kerugianRange: [3000000, 18000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.tornado',
    category: 'Bencana Hidrometeorologi',
    weight: 1,
    korbanRange: [200, 1500],
    kerugianRange: [150000, 800000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.hailstorm',
    category: 'Bencana Hidrometeorologi',
    weight: 1,
    korbanRange: [150, 1000],
    kerugianRange: [100000, 600000],
  },

  // Bencana Kebakaran (12%)
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.forestFire',
    category: 'Bencana Kebakaran',
    weight: 5,
    korbanRange: [1500, 10000],
    kerugianRange: [1200000, 7000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.peatFire',
    category: 'Bencana Kebakaran',
    weight: 3,
    korbanRange: [1000, 6000],
    kerugianRange: [800000, 4000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.industrialFire',
    category: 'Bencana Kebakaran',
    weight: 2,
    korbanRange: [400, 3000],
    kerugianRange: [1000000, 5000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.settlementFire',
    category: 'Bencana Kebakaran',
    weight: 2,
    korbanRange: [500, 4000],
    kerugianRange: [400000, 2500000],
  },

  // Bencana Laut & Pesisir (8%)
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.coastalErosion',
    category: 'Bencana Laut & Pesisir',
    weight: 4,
    korbanRange: [200, 1500],
    kerugianRange: [150000, 900000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.waterspout',
    category: 'Bencana Laut & Pesisir',
    weight: 2,
    korbanRange: [300, 2000],
    kerugianRange: [250000, 1200000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.seaLevelRise',
    category: 'Bencana Laut & Pesisir',
    weight: 2,
    korbanRange: [800, 5000],
    kerugianRange: [600000, 3500000],
  },

  // Krisis Kesehatan Lingkungan (10%)
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.foodPoisoning',
    category: 'Krisis Kesehatan Lingkungan',
    weight: 4,
    korbanRange: [300, 2500],
    kerugianRange: [200000, 1000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.waterContamination',
    category: 'Krisis Kesehatan Lingkungan',
    weight: 3,
    korbanRange: [500, 4000],
    kerugianRange: [350000, 1800000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.airPollution',
    category: 'Krisis Kesehatan Lingkungan',
    weight: 2,
    korbanRange: [1000, 7000],
    kerugianRange: [500000, 2500000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.hazardousWaste',
    category: 'Krisis Kesehatan Lingkungan',
    weight: 1,
    korbanRange: [400, 3000],
    kerugianRange: [400000, 2000000],
  },
  // Bencana Ekstrem Anomali / Cuaca Tak Terduga
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.heatwave',
    category: 'Bencana Hidrometeorologi',
    weight: 2,
    korbanRange: [800, 6000],
    kerugianRange: [700000, 3500000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.snowstorm',
    category: 'Bencana Hidrometeorologi',
    weight: 1.5,
    korbanRange: [500, 4500],
    kerugianRange: [600000, 3000000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.sinkhole',
    category: 'Bencana Geologi',
    weight: 1,
    korbanRange: [200, 1800],
    kerugianRange: [400000, 2200000],
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.disaster.eventNames.refineryFire',
    category: 'Bencana Kebakaran',
    weight: 1.5,
    korbanRange: [400, 3500],
    kerugianRange: [1500000, 8000000],
  },
];

function generateIncidentNotification(
  userCountryName: string,
  dateStr: string,
  countryDetail?: Record<string, unknown> | null,
): BencanaAlamNotification {
  if (BENCANA_ALAM_POOL.length === 0) {
    throw new Error('Tidak ada kejadian yang tersedia untuk dibuat menjadi notifikasi.');
  }

  // 🎲 Randomisasi Acak Dinamis (Noise berat agar tidak tertebak urutan maupun bobotnya)
  const randomizedPool = [...BENCANA_ALAM_POOL].map(item => ({
    ...item,
    // Fluktuasi bobot dinamis ±40% agar variasi bencana yang muncul selalu tak terduga
    dynamicWeight: item.weight * (0.6 + Math.random() * 0.8)
  }));

  const totalWeight = randomizedPool.reduce((acc, item) => acc + item.dynamicWeight, 0);
  let roll = Math.random() * totalWeight;

  let selectedEvent = randomizedPool[0];
  for (const item of randomizedPool) {
    if (roll < item.dynamicWeight) {
      selectedEvent = item;
      break;
    }
    roll -= item.dynamicWeight;
  }

  // Variabilitas Skala Kejadian (Bisa Skala Kecil/Lokal, Sedang, hingga Skala Ekstrem / Mega Disasters)
  const severityRoll = Math.random();
  let severityMultiplier = 1.0;
  let severityNoteKey: string | undefined;

  if (severityRoll < 0.15) {
    // 15% Kemungkinan Kejadian Anomali Ringan / Terisolasi
    severityMultiplier = 0.4 + Math.random() * 0.3; // 40% - 70%
    severityNoteKey = 'side_inbox.dynamicEventTranslations.disaster.isolatedScale';
  } else if (severityRoll > 0.85) {
    // 15% Kemungkinan Kejadian Katastropik Ekstrem Tak Terduga
    severityMultiplier = 1.6 + Math.random() * 0.9; // 160% - 250%
    severityNoteKey = 'side_inbox.dynamicEventTranslations.disaster.catastrophicScale';
  } else {
    // 70% Fluktuasi Reguler
    severityMultiplier = 0.8 + Math.random() * 0.5; // 80% - 130%
  }

  const [minK, maxK] = selectedEvent.korbanRange;
  const rawKorban = Math.floor((Math.random() * (maxK - minK + 1) + minK) * severityMultiplier);
  const baseKorban = Math.max(50, rawKorban);
  const lingkunganReducedKorban = applyKementerianLingkunganHidupDisasterImpactReduction(baseKorban, countryDetail);
  const korban = applyLayananDaruratDisasterDeathReduction(lingkunganReducedKorban, countryDetail);

  const [minR, maxR] = selectedEvent.kerugianRange;
  const rawKerugian = Math.floor((Math.random() * (maxR - minR + 1) + minR) * severityMultiplier);
  const baseKerugian = Math.max(50000, rawKerugian);
  const totalKerugian = applyKementerianLingkunganHidupDisasterImpactReduction(baseKerugian, countryDetail);

  // For natural disasters, emergency aid is calculated at 1 NEO per affected person.
  const bantuanCost = korban;

  const country = userCountryName || 'Indonesia';
  const eventName = getDefaultInboxText(selectedEvent.nameKey);
  const categoryKeyByLabel: Record<string, string> = {
    'Bencana Geologi': 'side_inbox.dynamicEventTranslations.disaster.categories.geological',
    'Bencana Hidrometeorologi': 'side_inbox.dynamicEventTranslations.disaster.categories.hydrometeorological',
    'Bencana Kebakaran': 'side_inbox.dynamicEventTranslations.disaster.categories.fire',
    'Bencana Laut & Pesisir': 'side_inbox.dynamicEventTranslations.disaster.categories.coastal',
    'Krisis Kesehatan Lingkungan': 'side_inbox.dynamicEventTranslations.disaster.categories.environmentalHealth',
  };
  const categoryKey = categoryKeyByLabel[selectedEvent.category];
  if (!categoryKey) throw new Error(`Missing disaster category translation key: ${selectedEvent.category}`);
  const titleKey = 'side_inbox.disaster.naturalTitle';
  const titleParams = { name: eventName, province: country };
  const messageKey = severityNoteKey
    ? 'side_inbox.dynamicEventTranslations.disaster.messageWithScale'
    : 'side_inbox.dynamicEventTranslations.disaster.message';
  const messageParams = {
    eventName,
    country,
    victims: korban.toLocaleString('id-ID'),
    loss: totalKerugian.toLocaleString('id-ID'),
    ...(severityNoteKey ? { severityNote: getDefaultInboxText(severityNoteKey) } : {}),
  };

  return {
    id: `bencana-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    titleParamKeys: { name: selectedEvent.nameKey },
    sender: getDefaultInboxText('side_inbox.dynamicEventTranslations.disaster.sender', { country }),
    senderKey: 'side_inbox.dynamicEventTranslations.disaster.sender',
    senderParams: { country },
    ...createInboxNotificationText(messageKey, messageParams, {
      eventName: selectedEvent.nameKey,
      ...(severityNoteKey ? { severityNote: severityNoteKey } : {}),
    }),
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'bencana_alam',
    category: selectedEvent.category,
    categoryKey,
    eventName,
    eventNameKey: selectedEvent.nameKey,
    korban,
    totalKerugian,
    bantuanCost,
    durationDays: 30,
    remainingDurationDays: 30,
    startDate: dateStr,
  };
}

export function generateBencanaAlamNotification(
  userCountryName: string,
  dateStr: string,
  countryDetail?: Record<string, unknown> | null,
): BencanaAlamNotification {
  return generateIncidentNotification(userCountryName, dateStr, countryDetail);
}
