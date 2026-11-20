import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText } from '../../notificationMessage';

export type AttackLevel = 'ancaman' | 'serangan_perbatasan' | 'deklarasi_perang' | 'invasi';

export interface DiserangNotification extends NotificationMessage {
  tradeType: 'diserang';
  enemyCountry: string;
  attackLevel: AttackLevel;
  costEM?: number;
  effectText?: string;
  isHandled?: boolean;
}

const ATTACK_POOL = [
  {
    attackLevel: 'ancaman' as AttackLevel,
    title: '🪖 Ancaman Perbatasan: Mobilisasi Pasukan Musuh',
    messageKey: 'side_inbox.notificationMessages.diserang.threat',
    costEM: 100,
    effectText: 'Diplomasi / Mobilisasi Darurat'
  },
  {
    attackLevel: 'serangan_perbatasan' as AttackLevel,
    title: '⚔️ Serangan Perbatasan: Batalyon Musuh Membuka Tembakan!',
    messageKey: 'side_inbox.notificationMessages.diserang.borderAttack',
    costEM: 200,
    effectText: '-5% Kekuatan Militer, Korban 50+ Jiwa'
  },
  {
    attackLevel: 'deklarasi_perang' as AttackLevel,
    title: '📜 Deklarasi Perang Resmi oleh Negara Musuh!',
    messageKey: 'side_inbox.notificationMessages.diserang.warDeclaration',
    costEM: 300,
    effectText: 'Perang Aktif, Ekonomi -15%, Approval -10%'
  },
  {
    attackLevel: 'invasi' as AttackLevel,
    title: '🚨 Invasi Skala Penuh: Perebutan Wilayah!',
    messageKey: 'side_inbox.notificationMessages.diserang.invasion',
    costEM: 400,
    effectText: 'Risiko Kehilangan 1 Provinsi jika Tidak Dipertahankan'
  }
];

const RELATION_ATTACK_CHANCE_POINTS = [
  { relation: 10, chance: 50 },
  { relation: 15, chance: 45 },
  { relation: 20, chance: 40 },
  { relation: 25, chance: 30 },
  { relation: 100, chance: 0 },
];

export function getAttackChancePercentFromRelation(relationScore: number): number {
  if (!Number.isFinite(relationScore)) return 0;

  const score = Math.min(100, Math.max(0, relationScore));
  if (score <= RELATION_ATTACK_CHANCE_POINTS[0].relation) {
    return RELATION_ATTACK_CHANCE_POINTS[0].chance;
  }

  for (let index = 1; index < RELATION_ATTACK_CHANCE_POINTS.length; index += 1) {
    const upperPoint = RELATION_ATTACK_CHANCE_POINTS[index];
    if (score > upperPoint.relation) continue;

    const lowerPoint = RELATION_ATTACK_CHANCE_POINTS[index - 1];
    const progress = (score - lowerPoint.relation) / (upperPoint.relation - lowerPoint.relation);
    return lowerPoint.chance + progress * (upperPoint.chance - lowerPoint.chance);
  }

  return 0;
}

export function generateDiserangNotification(
  enemyCountry: string,
  dateStr: string,
  hasAnnexedTerritories: boolean,
  forcedAttackLevel?: AttackLevel
): DiserangNotification {
  const roll = Math.random();
  let item = ATTACK_POOL[0];
  if (forcedAttackLevel) {
    item = ATTACK_POOL.find(candidate => candidate.attackLevel === forcedAttackLevel) || ATTACK_POOL[0];
  } else if (roll < 0.10) {
    item = ATTACK_POOL[3]; // invasi
  } else if (roll < 0.30) {
    item = ATTACK_POOL[2]; // deklarasi perang
  } else if (roll < 0.60) {
    item = ATTACK_POOL[1]; // serangan perbatasan
  }

  const isInvasionWithoutTerritories = item.attackLevel === 'invasi' && !hasAnnexedTerritories;

  return {
    id: `diserang-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: isInvasionWithoutTerritories
      ? '🚨 Invasi Skala Penuh: Pertahanan Wilayah Nasional!'
      : item.title,
    sender: `Markas Besar Angkatan Bersenjata`,
    ...createInboxNotificationText(
      isInvasionWithoutTerritories
        ? 'side_inbox.notificationMessages.diserang.invasionWithoutTerritories'
        : item.messageKey,
      { enemy: enemyCountry }
    ),
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'diserang',
    enemyCountry,
    attackLevel: item.attackLevel,
    costEM: item.costEM,
    effectText: isInvasionWithoutTerritories
      ? 'Tidak ada wilayah aneksasi yang dapat hilang'
      : item.effectText,
    isHandled: false
  };
}
