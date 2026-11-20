// kelistrikanLogic.ts
// Logika dan generator event untuk notifikasi kelistrikan kurang
// Setiap notifikasi kelistrikan kurang akan menurunkan peringkat sebesar 1

import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface KelistrikanNotification extends NotificationMessage {
  tradeType: 'kelistrikan_kurang';
  eventNameKey: string;
  deficitAmount: number; // Jumlah kelistrikan yang kurang dalam MW
  affectedAreas: string[]; // Area yang terkena dampak
  severity: 'ringan' | 'sedang' | 'berat' | 'kritis';
  durationDays?: number;
  remainingDurationDays?: number;
  startDate?: string;
  isHandled?: boolean;
}

interface KelistrikanEventItem {
  nameKey: string;
  deficitRange: [number, number]; // MW
  affectedAreasTemplate: () => string[];
  severity: 'ringan' | 'sedang' | 'berat' | 'kritis';
  weight: number;
}

export const KELISTRIKAN_KURANG_POOL: KelistrikanEventItem[] = [
  // Kekurangan Ringan (40%)
  {
    nameKey: 'side_inbox.dynamicEventTranslations.electricity.eventNames.mildShortage',
    deficitRange: [100, 500],
    affectedAreasTemplate: () => {
      const areas = [
        'side_inbox.dynamicEventTranslations.electricity.areas.mediumHousing',
        'side_inbox.dynamicEventTranslations.electricity.areas.commercialArea',
        'side_inbox.dynamicEventTranslations.electricity.areas.lightIndustry',
      ];
      return areas.slice(0, 1 + Math.floor(Math.random() * 2));
    },
    severity: 'ringan',
    weight: 10
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.electricity.eventNames.substationMaintenance',
    deficitRange: [200, 800],
    affectedAreasTemplate: () => [
      'side_inbox.dynamicEventTranslations.electricity.areas.cityCenterDistrict',
      'side_inbox.dynamicEventTranslations.electricity.areas.industrialZone',
    ],
    severity: 'ringan',
    weight: 8
  },
  
  // Kekurangan Sedang (30%)
  {
    nameKey: 'side_inbox.dynamicEventTranslations.electricity.eventNames.gasShortage',
    deficitRange: [500, 1500],
    affectedAreasTemplate: () => {
      const areas = [
        'side_inbox.dynamicEventTranslations.electricity.areas.primaryGasPlant',
        'side_inbox.dynamicEventTranslations.electricity.areas.manufacturingIndustry',
        'side_inbox.dynamicEventTranslations.electricity.areas.tradeDistrict',
      ];
      return areas.slice(0, 2 + Math.floor(Math.random() * 1));
    },
    severity: 'sedang',
    weight: 6
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.electricity.eventNames.transmissionFault',
    deficitRange: [800, 2000],
    affectedAreasTemplate: () => {
      const areas = [
        'side_inbox.dynamicEventTranslations.electricity.areas.metropolitanArea',
        'side_inbox.dynamicEventTranslations.electricity.areas.heavyIndustryZone',
        'side_inbox.dynamicEventTranslations.electricity.areas.dataCenter',
      ];
      return areas;
    },
    severity: 'sedang',
    weight: 5
  },
  
  // Kekurangan Berat (20%)
  {
    nameKey: 'side_inbox.dynamicEventTranslations.electricity.eventNames.hydropowerDrought',
    deficitRange: [1500, 3500],
    affectedAreasTemplate: () => {
      const areas = [
        'side_inbox.dynamicEventTranslations.electricity.areas.primaryHydroSystem',
        'side_inbox.dynamicEventTranslations.electricity.areas.energyIntensiveIndustry',
        'side_inbox.dynamicEventTranslations.electricity.areas.hospital',
        'side_inbox.dynamicEventTranslations.electricity.areas.governmentCenter',
      ];
      return areas.slice(0, 3);
    },
    severity: 'berat',
    weight: 3
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.electricity.eventNames.turbineFailure',
    deficitRange: [2000, 5000],
    affectedAreasTemplate: () => {
      const areas = [
        'side_inbox.dynamicEventTranslations.electricity.areas.mainCoalPlant',
        'side_inbox.dynamicEventTranslations.electricity.areas.strategicIndustrialZone',
        'side_inbox.dynamicEventTranslations.electricity.areas.internationalAirport',
        'side_inbox.dynamicEventTranslations.electricity.areas.mainPort',
      ];
      return areas;
    },
    severity: 'berat',
    weight: 2
  },
  
  // Kekurangan Kritis (10%)
  {
    nameKey: 'side_inbox.dynamicEventTranslations.electricity.eventNames.nationalEnergyCrisis',
    deficitRange: [3000, 8000],
    affectedAreasTemplate: () => {
      const areas = [
        'side_inbox.dynamicEventTranslations.electricity.areas.nationalGrid',
        'side_inbox.dynamicEventTranslations.electricity.areas.vitalIndustry',
        'side_inbox.dynamicEventTranslations.electricity.areas.healthFacilities',
        'side_inbox.dynamicEventTranslations.electricity.areas.transportSystem',
        'side_inbox.dynamicEventTranslations.electricity.areas.nationalCommunications',
      ];
      return areas;
    },
    severity: 'kritis',
    weight: 1
  },
  {
    nameKey: 'side_inbox.dynamicEventTranslations.electricity.eventNames.systemicBlackout',
    deficitRange: [5000, 10000],
    affectedAreasTemplate: () => {
      const areas = [
        'side_inbox.dynamicEventTranslations.electricity.areas.nationwideGrid',
        'side_inbox.dynamicEventTranslations.electricity.areas.interconnectionGrid',
        'side_inbox.dynamicEventTranslations.electricity.areas.criticalInfrastructure',
        'side_inbox.dynamicEventTranslations.electricity.areas.financialSector',
        'side_inbox.dynamicEventTranslations.electricity.areas.emergencyServices',
      ];
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
  const eventName = getDefaultInboxText(selectedEvent.nameKey);
  const severityKey = `side_inbox.dynamicEventTranslations.electricity.severities.${actualSeverity}`;
  const titleKey = 'side_inbox.dynamicEventTranslations.electricity.title';
  const titleParams = { eventName, severity: getDefaultInboxText(severityKey) };
  const messageKey = 'side_inbox.dynamicEventTranslations.electricity.message';
  const messageParams = {
    eventName,
    country,
    deficit: deficitAmount,
    duration: { ringan: 7, sedang: 14, berat: 21, kritis: 30 }[actualSeverity],
    areaCount: affectedAreas.length,
  };

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
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    titleParamKeys: {
      eventName: selectedEvent.nameKey,
      severity: severityKey,
    },
    sender: getDefaultInboxText('side_inbox.dynamicEventTranslations.electricity.sender', { country }),
    senderKey: 'side_inbox.dynamicEventTranslations.electricity.sender',
    senderParams: { country },
    ...createInboxNotificationText(messageKey, messageParams, {
      eventName: selectedEvent.nameKey,
    }),
    timestamp: dateStr,
    type: 'peringkat', // Menggunakan type 'peringkat' untuk memicu penurunan rating
    value: -ratingPenalty, // Nilai negatif untuk menurunkan rating
    isRead: false,
    tradeType: 'kelistrikan_kurang',
    eventNameKey: selectedEvent.nameKey,
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