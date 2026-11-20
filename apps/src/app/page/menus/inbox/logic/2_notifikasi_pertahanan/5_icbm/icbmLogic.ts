import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface ICBMNotification extends NotificationMessage {
  tradeType: 'icbm' | 'program_nuklir_dimulai' | 'program_nuklir_selesai' | 'ujicoba_nuklir';
  launcherCountry?: string;
  targetCity?: string;
  targetLocation?: string;
  costEM?: number;
  effectText?: string;
  isHandled?: boolean;
  endDateStr?: string;
}

export function generateICBMNotification(
  launcherCountry: string,
  targetCity: string,
  dateStr: string
): ICBMNotification {
  const titleKey = 'side_inbox.defense.icbmTitles.incoming';
  const senderKey = 'side_inbox.defense.icbmSenders.incoming';
  const effectTextKey = 'side_inbox.defense.icbmEffects.incoming';

  return {
    id: `icbm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey),
    titleKey,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText('side_inbox.notificationMessages.icbm.incomingAlert', {
      launcher: launcherCountry,
      target: targetCity,
    }),
    timestamp: dateStr,
    type: 'peringkat',
    value: 0,
    isRead: false,
    tradeType: 'icbm',
    launcherCountry,
    targetCity,
    costEM: 500,
    effectText: getDefaultInboxText(effectTextKey),
    effectTextKey,
    isHandled: false
  };
}

export function generateProgramNuklirDimulaiNotification(
  userCountryName: string,
  endDateStr: string,
  dateStr: string
): ICBMNotification {
  const titleKey = 'side_inbox.defense.icbmTitles.programStarted';
  const senderKey = 'side_inbox.defense.icbmSenders.program';
  const effectTextKey = 'side_inbox.defense.icbmEffects.programStarted';

  return {
    id: `nuklir-dimulai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey),
    titleKey,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText('side_inbox.notificationMessages.icbm.programStarted', {
      country: userCountryName || 'Nusantara',
      startDate: dateStr,
      endDate: endDateStr,
    }),
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'program_nuklir_dimulai',
    endDateStr,
    effectText: getDefaultInboxText(effectTextKey, { endDate: endDateStr }),
    effectTextKey,
    effectTextParams: { endDate: endDateStr },
    isHandled: false
  };
}

export function generateProgramNuklirSelesaiNotification(
  userCountryName: string,
  dateStr: string
): ICBMNotification {
  const titleKey = 'side_inbox.defense.icbmTitles.programCompleted';
  const senderKey = 'side_inbox.defense.icbmSenders.program';
  const effectTextKey = 'side_inbox.defense.icbmEffects.programCompleted';

  return {
    id: `nuklir-selesai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey),
    titleKey,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText('side_inbox.notificationMessages.icbm.programCompleted', {
      country: userCountryName || 'Nusantara',
    }),
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 100,
    isRead: false,
    tradeType: 'program_nuklir_selesai',
    effectText: getDefaultInboxText(effectTextKey),
    effectTextKey,
    isHandled: true
  };
}

export function generateUjicobaNuklirAINotification(
  testerCountry: string,
  targetLocation: string,
  remainingIcbm: number,
  dateStr: string
): ICBMNotification {
  const titleKey = 'side_inbox.defense.icbmTitles.testReport';
  const senderKey = 'side_inbox.defense.icbmSenders.testReport';
  const effectTextKey = 'side_inbox.defense.icbmEffects.testReport';

  return {
    id: `ujicoba-nuklir-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey, { tester: testerCountry }),
    titleKey,
    titleParams: { tester: testerCountry },
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText('side_inbox.notificationMessages.icbm.testReport', {
      tester: testerCountry,
      target: targetLocation,
    }),
    timestamp: dateStr,
    type: 'peringkat',
    value: 0,
    isRead: false,
    tradeType: 'ujicoba_nuklir',
    launcherCountry: testerCountry,
    targetLocation,
    effectText: getDefaultInboxText(effectTextKey, { tester: testerCountry, count: remainingIcbm }),
    effectTextKey,
    effectTextParams: { tester: testerCountry, count: remainingIcbm },
    isHandled: true
  };
}
