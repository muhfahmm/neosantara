import type { NotificationMessage } from '../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../notificationMessage';
import { areSameWarCountry } from '../../../../detail_negara/3_operasi_militer/1_serang_negara/warCountryIdentity';

export interface AllyDefenseDeployment {
  id: string;
  senderCountry: string;
  targetCountry: string;
  attackerCountry: string;
  attackNotificationId: string;
}

export function getEligibleDefenseAllies(
  defenseAlliances: unknown,
  playerCountry: string,
  attackerCountry: string,
): string[] {
  if (!Array.isArray(defenseAlliances) || !playerCountry.trim() || !attackerCountry.trim()) return [];

  const seen: string[] = [];
  return defenseAlliances.filter((ally): ally is string => {
    if (typeof ally !== 'string' || !ally.trim()) return false;
    if (
      areSameWarCountry(ally, playerCountry) ||
      areSameWarCountry(ally, attackerCountry)
    ) return false;

    if (seen.some(existing => areSameWarCountry(existing, ally))) return false;
    seen.push(ally);
    return true;
  });
}

export function createAllyDefenseDeployments(
  allies: string[],
  targetCountry: string,
  attackerCountry: string,
  attackNotificationId: string,
): AllyDefenseDeployment[] {
  return allies.map((ally, index) => ({
    id: `military-aid-${attackNotificationId}-${index}`,
    senderCountry: ally,
    targetCountry,
    attackerCountry,
    attackNotificationId,
  }));
}

export function createAllyDefenseRequestNotification(
  attackNotificationId: string,
  targetCountry: string,
  attackerCountry: string,
  allyCount: number,
  timestamp: string,
): NotificationMessage {
  const titleKey = 'side_inbox.defense.allyAid.requestSentTitle';
  const senderKey = 'side_inbox.defense.allyAid.sender';
  const messageKey = 'side_inbox.defense.allyAid.requestSentMessage';
  const messageParams = { target: targetCountry, attacker: attackerCountry, count: allyCount };

  return {
    id: `ally-defense-request-${attackNotificationId}`,
    title: getDefaultInboxText(titleKey),
    titleKey,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp,
    type: 'peringkat',
    value: 0,
    isRead: false,
    priority: 'critical',
  };
}

export function createAllyDefenseArrivalNotification(
  deployment: Pick<AllyDefenseDeployment, 'id' | 'senderCountry' | 'targetCountry' | 'attackerCountry'>,
  timestamp: string,
): NotificationMessage {
  const titleKey = 'side_inbox.defense.allyAid.arrivalTitle';
  const senderKey = 'side_inbox.defense.allyAid.sender';
  const messageKey = 'side_inbox.defense.allyAid.arrivalMessage';
  const messageParams = {
    ally: deployment.senderCountry,
    target: deployment.targetCountry,
    attacker: deployment.attackerCountry,
  };

  return {
    id: `ally-defense-arrived-${deployment.id}`,
    title: getDefaultInboxText(titleKey),
    titleKey,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp,
    type: 'peringkat',
    value: 0,
    isRead: false,
    priority: 'critical',
  };
}
