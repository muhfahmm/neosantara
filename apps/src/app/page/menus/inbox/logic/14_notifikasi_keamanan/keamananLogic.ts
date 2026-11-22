import { NotificationMessage } from '../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../notificationMessage';
import { roundNeo } from '@/app/logic/economic_logic/neoCurrency';

export interface KeamananNotification extends NotificationMessage {
  tradeType: 'keamanan';
  category: 'Insiden Kepolisian';
  categoryKey: string;
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
  nameKey: string;
  weight: number;
  korbanRange: [number, number];
  kerugianRange: [number, number];
  responseCostRange: [number, number];
}

const KEJAHATAN_POOL: KejahatanEvent[] = [
  {
    nameKey: 'side_inbox.dynamicNotifications.security.events.armedRobbery',
    weight: 2,
    korbanRange: [1, 5],
    kerugianRange: [50000, 800000],
    responseCostRange: [10000, 80000],
  },
  {
    nameKey: 'side_inbox.dynamicNotifications.security.events.financialRobbery',
    weight: 1,
    korbanRange: [1, 4],
    kerugianRange: [100000, 1500000],
    responseCostRange: [15000, 100000],
  },
  {
    nameKey: 'side_inbox.dynamicNotifications.security.events.burglary',
    weight: 1,
    korbanRange: [1, 5],
    kerugianRange: [30000, 500000],
    responseCostRange: [8000, 60000],
  },
  {
    nameKey: 'side_inbox.dynamicNotifications.security.events.organizedCrime',
    weight: 1,
    korbanRange: [2, 8],
    kerugianRange: [100000, 1200000],
    responseCostRange: [20000, 120000],
  },
  {
    nameKey: 'side_inbox.dynamicNotifications.security.events.unrest',
    weight: 1,
    korbanRange: [2, 10],
    kerugianRange: [100000, 1000000],
    responseCostRange: [15000, 100000],
  },
  {
    nameKey: 'side_inbox.dynamicNotifications.security.events.pickpocketing',
    weight: 2,
    korbanRange: [1, 3],
    kerugianRange: [1000, 30000],
    responseCostRange: [3000, 18000],
  },
  {
    nameKey: 'side_inbox.dynamicNotifications.security.events.vehicleTheft',
    weight: 2,
    korbanRange: [1, 3],
    kerugianRange: [10000, 150000],
    responseCostRange: [5000, 25000],
  },
  {
    nameKey: 'side_inbox.dynamicNotifications.security.events.digitalFraud',
    weight: 2,
    korbanRange: [1, 8],
    kerugianRange: [5000, 250000],
    responseCostRange: [5000, 30000],
  },
  {
    nameKey: 'side_inbox.dynamicNotifications.security.events.vandalism',
    weight: 1,
    korbanRange: [1, 2],
    kerugianRange: [5000, 80000],
    responseCostRange: [3000, 20000],
  },
  {
    nameKey: 'side_inbox.dynamicNotifications.security.events.kidnapping',
    weight: 1,
    korbanRange: [1, 2],
    kerugianRange: [10000, 100000],
    responseCostRange: [12000, 60000],
  },
  {
    nameKey: 'side_inbox.dynamicNotifications.security.events.extortion',
    weight: 1,
    korbanRange: [1, 6],
    kerugianRange: [5000, 120000],
    responseCostRange: [8000, 40000],
  },
  {
    nameKey: 'side_inbox.dynamicNotifications.security.events.humanTrafficking',
    weight: 1,
    korbanRange: [1, 10],
    kerugianRange: [20000, 200000],
    responseCostRange: [20000, 100000],
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
  const totalKerugian = roundNeo(randomInRange(selectedEvent.kerugianRange));
  const responseCost = roundNeo(randomInRange(selectedEvent.responseCostRange));
  const clampedRiskPercent = Math.min(100, Math.max(0, securityRiskPercent));
  const titleKey = 'side_inbox.dynamicNotifications.security.title';
  const titleParams = { eventName: getDefaultInboxText(selectedEvent.nameKey) };
  const messageKey = 'side_inbox.dynamicNotifications.security.message';
  const messageParams = { eventName: getDefaultInboxText(selectedEvent.nameKey), country };

  return {
    id: `keamanan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    titleParamKeys: { eventName: selectedEvent.nameKey },
    sender: getDefaultInboxText('side_inbox.dynamicNotifications.security.sender', { country }),
    senderKey: 'side_inbox.dynamicNotifications.security.sender',
    senderParams: { country },
    ...createInboxNotificationText(messageKey, messageParams, {
      eventName: selectedEvent.nameKey,
    }),
    timestamp: date,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'keamanan',
    category: 'Insiden Kepolisian',
    categoryKey: 'side_inbox.dynamicNotifications.security.category',
    eventName: titleParams.eventName,
    eventType: 'police',
    securityRiskPercent: clampedRiskPercent,
    korban,
    totalKerugian,
    bantuanCost: korban,
    responseCost,
  };
}
