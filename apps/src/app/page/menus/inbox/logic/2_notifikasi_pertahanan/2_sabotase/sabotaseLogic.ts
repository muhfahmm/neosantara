import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export type SabotaseType = 'infrastruktur' | 'militer' | 'siber' | 'nuklir';

export interface SabotaseNotification extends NotificationMessage {
  tradeType: 'sabotase';
  partnerCountry: string;
  targetCountry?: string;
  sabotaseType: SabotaseType;
  costEM?: number;
  effectText?: string;
  isHandled?: boolean;
  remainingResponseDays?: number;
}

const SABOTASE_POOL = [
  {
    sabotaseType: 'infrastruktur' as SabotaseType,
    title: '💣 Sabotase Infrastruktur Nasional',
    message: (partner: string) => `Pipa minyak, jembatan komersial, dan jaringan transportasi utama diduga disabotase oleh kelompok suruhan dari ${partner}!`,
    costEM: 8000,
    effectText: '-5% Alutsista (permanen jika dibiarkan)'
  },
  {
    sabotaseType: 'militer' as SabotaseType,
    title: '🔥 Sabotase Militer: Ledakan Gudang Amunisi',
    message: (partner: string) => `Gudang alutsista dan instalasi militer utama mengalami ledakan sabotase terencana yang dipicu oleh agen asing ${partner}!`,
    costEM: 15000,
    effectText: '-5% Alutsista (permanen jika dibiarkan)'
  },
  {
    sabotaseType: 'siber' as SabotaseType,
    title: '⚡ Sabotase Siber: Kelumpuhan Jaringan Komunikasi',
    message: (partner: string) => `Serangan peretas siber berskala besar melumpuhkan radar dan sistem pertahanan udara nasional selama beberapa hari!`,
    costEM: 10000,
    effectText: '-5% Alutsista (permanen jika dibiarkan)'
  },
  {
    sabotaseType: 'nuklir' as SabotaseType,
    title: '☢️ Sabotase Fasilitas Nuklir!',
    message: (partner: string) => `BAHAYA MAKSIMAL! Terjadi infiltrasi sabotase pada reaktor nuklir nasional oleh infiltran dari ${partner}! Risiko kebocoran nuklir tinggi!`,
    costEM: 200,
    effectText: '-5% Alutsista (permanen jika dibiarkan)'
  }
];

export function generateSabotaseNotification(
  partnerCountry: string,
  dateStr: string,
  targetCountry?: string,
): SabotaseNotification {
  const roll = Math.random();
  let item = SABOTASE_POOL[0];
  if (roll < 0.10) {
    item = SABOTASE_POOL[3]; // nuklir
  } else if (roll < 0.35) {
    item = SABOTASE_POOL[2]; // siber
  } else if (roll < 0.65) {
    item = SABOTASE_POOL[1]; // militer
  }

  return {
    id: `sabotase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: item.title,
    sender: `Kementerian Pertahanan & Keamanan`,
    message: item.message(partnerCountry),
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 0,
    isRead: false,
    priority: 'critical',
    tradeType: 'sabotase',
    partnerCountry,
    ...(targetCountry ? { targetCountry } : {}),
    sabotaseType: item.sabotaseType,
    costEM: item.costEM,
    effectText: item.effectText,
    isHandled: false
  };
}
