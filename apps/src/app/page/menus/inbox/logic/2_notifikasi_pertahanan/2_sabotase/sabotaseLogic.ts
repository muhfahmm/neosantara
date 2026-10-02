import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export type SabotaseType = 'infrastruktur' | 'militer' | 'siber' | 'nuklir';

export interface SabotaseNotification extends NotificationMessage {
  tradeType: 'sabotase';
  partnerCountry: string;
  sabotaseType: SabotaseType;
  costEM?: number;
  effectText?: string;
  isHandled?: boolean;
}

const SABOTASE_POOL = [
  {
    sabotaseType: 'infrastruktur' as SabotaseType,
    title: '💣 Sabotase Infrastruktur Nasional',
    message: (partner: string) => `Pipa minyak, jembatan komersial, dan jaringan transportasi utama diduga disabotase oleh kelompok suruhan dari ${partner}!`,
    costEM: 80,
    effectText: '-10% Infrastruktur & -3% PDB'
  },
  {
    sabotaseType: 'militer' as SabotaseType,
    title: '🔥 Sabotase Militer: Ledakan Gudang Amunisi',
    message: (partner: string) => `Gudang alutsista dan instalasi militer utama mengalami ledakan sabotase terencana yang dipicu oleh agen asing ${partner}!`,
    costEM: 150,
    effectText: '-15% Kekuatan Militer (14 hari)'
  },
  {
    sabotaseType: 'siber' as SabotaseType,
    title: '⚡ Sabotase Siber: Kelumpuhan Jaringan Komunikasi',
    message: (partner: string) => `Serangan peretas siber berskala besar melumpuhkan radar dan sistem pertahanan udara nasional selama beberapa hari!`,
    costEM: 100,
    effectText: 'Sistem Pertahanan Lumpuh 3 Hari'
  },
  {
    sabotaseType: 'nuklir' as SabotaseType,
    title: '☢️ Sabotase Fasilitas Nuklir!',
    message: (partner: string) => `BAHAYA MAKSIMAL! Terjadi infiltrasi sabotase pada reaktor nuklir nasional oleh infiltran dari ${partner}! Risiko kebocoran nuklir tinggi!`,
    costEM: 200,
    effectText: 'Risiko Bencana Nuklir (500+ Korban & Approval -20%)'
  }
];

export function generateSabotaseNotification(
  partnerCountry: string,
  dateStr: string
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
    tradeType: 'sabotase',
    partnerCountry,
    sabotaseType: item.sabotaseType,
    costEM: item.costEM,
    effectText: item.effectText,
    isHandled: false
  };
}
