import idInbox from '@/app/page/paused_menu/terjemahan_paused_menu/id/side_menu/inbox/inbox.json';
import { getLocalizedCountryName, isGlobalCountryTarget, localizeCountryNamesInText } from '@/app/logic/countryNameLogic';

export type InboxMessageParams = Record<string, string | number>;
type TranslationFunction = (key: string, params?: InboxMessageParams) => string;

interface InboxNotificationText {
  message: string;
  messageKey: string;
  messageParams: InboxMessageParams;
  messageParamKeys: Record<string, string>;
}

function getIdTemplate(key: string): string {
  const path = key.split('.').slice(1);
  let value: unknown = idInbox;
  for (const segment of path) {
    if (!value || typeof value !== 'object') {
      throw new Error(`Missing Indonesian inbox message template: ${key}`);
    }
    value = (value as Record<string, unknown>)[segment];
  }
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing Indonesian inbox message template: ${key}`);
  }
  return value;
}

function interpolate(template: string, params: InboxMessageParams): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

const ORGANIZATION_NAME_KEYS: Record<string, string> = {
  interpol: 'interpol',
  organisasikesehatanduniawho: 'who',
  unesco: 'unesco',
  organisasipendidikankeilmuandankebudayaanpbbunesco: 'unesco',
  organisasiperdaganganduniawto: 'wto',
  organisasiburuhinternasionalilo: 'ilo',
  organisasipangandanpertanianfao: 'fao',
  organisasimaritiminternasionalimo: 'imo',
  organisasitelekomunikasiinternasionalitu: 'itu',
  organisasimeteorologiduniawmo: 'wmo',
  perhimpunanbangsabangsaasiatenggaraasean: 'asean',
  unieropaeu: 'eu',
  ligaarab: 'arabLeague',
  uniafrikaau: 'africanUnion',
  organisasikerjasamaislamoki: 'oic',
  bricsbrasilrusiaindiachinaafrikaselatan: 'brics',
  paktapertahananatlantikutaranato: 'nato',
  organisasinegaranegarapengeksporminyakbumiopec: 'opec',
  kelompokduapuluhg20: 'g20',
};

function normalizeOrganizationName(value: string): string {
  return value.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function getOrganizationNameKey(value: string): string | undefined {
  return ORGANIZATION_NAME_KEYS[normalizeOrganizationName(value)];
}

type LegacyPbbNotificationKind = 'singleAttack' | 'batchAttacks' | 'warBan';

function getLegacyPbbNotificationKind(
  notification: { id?: string; title?: string }
): LegacyPbbNotificationKind | undefined {
  const id = notification.id || '';
  const title = (notification.title || '').toLowerCase();
  if (id.startsWith('notif-war-no-mandate-') || title.includes('rencana serangan tanpa mandat')) {
    return 'singleAttack';
  }
  if (id.startsWith('notif-npc-war-no-mandate-') || title.includes('serangan tanpa mandat dibatalkan')) {
    return 'batchAttacks';
  }
  if (id.startsWith('notif-war-ban-ai-block-') || title.includes('larangan perang pbb menghentikan serangan')) {
    return 'warBan';
  }
  return undefined;
}

function getLegacyPbbTranslationKey(
  kind: LegacyPbbNotificationKind,
  section: 'Title' | 'Message'
): string {
  const suffix = kind === 'singleAttack'
    ? 'unauthorizedAttackCancelled'
    : kind === 'batchAttacks'
      ? 'unauthorizedAttacksCancelled'
      : 'warBanCancelled';
  return `side_inbox.dynamicNotifications.pbb.${suffix}${section}`;
}

export function getLocalizedInboxDuration(
  duration: string,
  t: TranslationFunction
): string {
  const match = duration.match(/^\s*(\d+)\s*(bulan|tahun)\s*$/i);
  if (!match) return duration;

  const count = Number(match[1]);
  const unit = match[2].toLowerCase() === 'tahun' ? 'year' : 'month';
  const plural = count === 1 ? 'One' : 'Many';
  return t(`side_inbox.durationUnits.${unit}${plural}`, { count });
}

export function getLocalizedOrganizationName(
  value: string,
  t: TranslationFunction
): string {
  const key = getOrganizationNameKey(value);
  return key
    ? t(`side_inbox.dynamicNotifications.organization.names.${key}`)
    : value;
}

function localizeInboxParams(
  params: InboxMessageParams,
  t?: TranslationFunction
): InboxMessageParams {
  const countryParam = /(country|partner|proposer|target|attacker|ally|enemy|sekutu|penyerang|mitra|pihak|user)/i;
  return Object.fromEntries(
    Object.entries(params).map(([name, value]) => [
      name,
      typeof value !== 'string'
        ? value
        : name.toLowerCase() === 'duration' && t
          ? getLocalizedInboxDuration(value, t)
        : countryParam.test(name)
          ? isGlobalCountryTarget(value)
            ? t
              ? t('side_inbox.geopolitics.globalTarget')
              : getIdTemplate('side_inbox.geopolitics.globalTarget')
            : getLocalizedCountryName(value)
          : name === 'organization' && getOrganizationNameKey(value)
            ? t
              ? getLocalizedOrganizationName(value, t)
              : getIdTemplate(`side_inbox.dynamicNotifications.organization.names.${getOrganizationNameKey(value)}`)
            : value,
    ])
  );
}

export function getDefaultInboxText(
  key: string,
  params: InboxMessageParams = {}
): string {
  return localizeCountryNamesInText(interpolate(getIdTemplate(key), localizeInboxParams(params)));
}

export function createInboxNotificationText(
  messageKey: string,
  messageParams: InboxMessageParams,
  messageParamKeys: Record<string, string> = {}
): InboxNotificationText {
  return {
    message: getDefaultInboxText(messageKey, messageParams),
    messageKey,
    messageParams,
    messageParamKeys,
  };
}

export function getInboxNotificationTitle(
  notification: {
    title: string;
    titleKey?: string;
    titleParams?: InboxMessageParams;
    titleParamKeys?: Record<string, string>;
    tradeType?: string;
    isOffensive?: boolean;
    operationResult?: string;
    partnerCountry?: string;
    targetCountry?: string;
    id?: string;
  },
  t: TranslationFunction
): string {
  if (!notification.titleKey) {
    const pbbKind = getLegacyPbbNotificationKind(notification);
    if (pbbKind) return t(getLegacyPbbTranslationKey(pbbKind, 'Title'));
    if (notification.tradeType === 'spionase') {
      if (notification.isOffensive) {
        const key = notification.operationResult === 'success'
          ? 'side_inbox.dynamicNotifications.espionage.offensiveSuccessTitle'
          : 'side_inbox.dynamicNotifications.espionage.offensiveFailureTitle';
        return t(key, {
          country: getLocalizedCountryName(notification.targetCountry || notification.partnerCountry || ''),
        });
      }
      return t('side_inbox.defense.spionaseTitle', {
        partner: getLocalizedCountryName(notification.partnerCountry || ''),
      });
    }
    if (notification.tradeType === 'sabotase') {
      const country = getLocalizedCountryName(notification.targetCountry || notification.partnerCountry || '');
      const key = notification.isOffensive
        ? `side_inbox.dynamicNotifications.sabotage.${notification.operationResult === 'success' ? 'offensiveSuccessTitle' : 'offensiveFailureTitle'}`
        : 'side_inbox.listTitles.sabotase';
      return t(key, notification.isOffensive ? { country } : { partner: country });
    }
    return localizeCountryNamesInText(notification.title);
  }
  const params = localizeInboxParams({ ...notification.titleParams }, t);
  for (const [name, key] of Object.entries(notification.titleParamKeys ?? {})) {
    params[name] = t(key);
  }
  return t(notification.titleKey, params);
}

export function getInboxNotificationSender(
  notification: {
    sender: string;
    senderKey?: string;
    senderParams?: InboxMessageParams;
    tradeType?: string;
    isOffensive?: boolean;
    partnerCountry?: string;
    id?: string;
    title?: string;
    provinceName?: string;
  },
  t: TranslationFunction
): string {
  if (!notification.senderKey) {
    if (getLegacyPbbNotificationKind(notification)) {
      return t('side_inbox.dynamicNotifications.pbb.sender');
    }
    if (notification.tradeType === 'spionase') {
      const key = notification.isOffensive
        ? 'side_inbox.dynamicNotifications.espionage.offensiveSender'
        : 'side_inbox.dynamicNotifications.espionage.incomingSender';
      return t(key, notification.isOffensive
        ? undefined
        : { partner: getLocalizedCountryName(notification.partnerCountry || '') });
    }
    if (notification.tradeType === 'sabotase') {
      return t(notification.isOffensive
        ? 'side_inbox.dynamicNotifications.sabotage.offensiveSender'
        : 'side_inbox.dynamicNotifications.sabotage.incomingSender');
    }
    return localizeCountryNamesInText(notification.sender);
  }
  if (
    notification.senderKey === 'side_inbox.defense.pemberontakanSender' &&
    !notification.senderParams
  ) {
    return t(notification.senderKey, {
      country: getLocalizedCountryName(notification.provinceName || ''),
    });
  }
  return t(notification.senderKey, localizeInboxParams({ ...notification.senderParams }, t));
}

export function getInboxNotificationEffectText(
  notification: {
    effectText?: string;
    effectTextKey?: string;
    effectTextParams?: InboxMessageParams;
    effectTextParamKeys?: Record<string, string>;
    tradeType?: string;
    isOffensive?: boolean;
    operationResult?: string;
    operationTarget?: string;
    targetCountry?: string;
    partnerCountry?: string;
    level?: string;
    sabotaseType?: string;
    militaryReport?: {
      totalUnits: number;
      groups: { darat: { totalUnits: number }; udara: { totalUnits: number }; laut: { totalUnits: number } };
    };
    economicReport?: { budget: number; estimatedDailyTaxRevenue: number };
  },
  t: TranslationFunction
): string {
  if (!notification.effectTextKey) {
    if (notification.tradeType === 'spionase') {
      if (!notification.isOffensive) {
        return t('side_inbox.dynamicNotifications.espionage.incomingEffect');
      }
      const prefix = 'side_inbox.dynamicNotifications.espionage';
      const target = getEspionageTarget(notification.operationTarget, t);
      if (notification.operationResult !== 'success') {
        return t(`${prefix}.offensiveFailureEffect`, { target });
      }
      if (notification.militaryReport) {
        return t(`${prefix}.offensiveMilitaryEffect`, {
          target,
          totalUnits: notification.militaryReport.totalUnits,
        });
      }
      if (notification.economicReport) {
        return t(`${prefix}.offensiveEconomyEffect`, {
          target,
          budget: notification.economicReport.budget,
          dailyTax: notification.economicReport.estimatedDailyTaxRevenue,
        });
      }
      return t(`${prefix}.offensiveSuccessEffect`, {
        target,
        country: notification.targetCountry || notification.partnerCountry || '',
      });
    }
    if (notification.tradeType === 'sabotase') {
      const target = getSabotageTarget(notification.operationTarget, t);
      if (!notification.isOffensive) {
        return notification.sabotaseType
          ? t(`side_inbox.dynamicNotifications.sabotage.effects.${notification.sabotaseType}`)
          : localizeCountryNamesInText(notification.effectText || '');
      }
      const key = notification.operationResult === 'success'
        ? 'side_inbox.dynamicNotifications.sabotage.offensiveSuccessEffect'
        : 'side_inbox.dynamicNotifications.sabotage.offensiveFailureEffect';
      return t(key, { target });
    }
    return localizeCountryNamesInText(notification.effectText || '');
  }
  const params = localizeInboxParams({ ...notification.effectTextParams }, t);
  for (const [name, key] of Object.entries(notification.effectTextParamKeys ?? {})) {
    params[name] = t(key);
  }
  return t(notification.effectTextKey, params);
}

export function getInboxNotificationMessage(
  notification: {
    message: string;
    messageKey?: string;
    messageParams?: InboxMessageParams;
    messageParamKeys?: Record<string, string>;
    tradeType?: string;
    isOffensive?: boolean;
    operationResult?: string;
    operationTarget?: string;
    targetCountry?: string;
    partnerCountry?: string;
    level?: string;
    sabotaseType?: string;
    militaryReport?: {
      totalUnits: number;
      groups: { darat: { totalUnits: number }; udara: { totalUnits: number }; laut: { totalUnits: number } };
    };
    economicReport?: { budget: number; estimatedDailyTaxRevenue: number };
    id?: string;
    title?: string;
  },
  t: TranslationFunction
): string {
  if (!notification.messageKey) {
    const pbbKind = getLegacyPbbNotificationKind(notification);
    if (pbbKind) {
      if (pbbKind === 'singleAttack') {
        const match = notification.message.match(/^Serangan\s+(.+?)\s+terhadap\s+(.+?)\s+tidak jadi diluncurkan/i);
        if (match) {
          return t(getLegacyPbbTranslationKey(pbbKind, 'Message'), {
            attacker: getLocalizedCountryName(match[1]),
            target: getLocalizedCountryName(match[2]),
            chance: 25,
          });
        }
      } else {
        const count = Number(notification.message.match(/^\s*(\d+)/)?.[1]);
        if (Number.isFinite(count)) {
          return t(getLegacyPbbTranslationKey(pbbKind, 'Message'), {
            count,
            chance: pbbKind === 'warBan' ? 20 : 25,
          });
        }
      }
    }
    if (notification.tradeType === 'spionase') {
      const prefix = 'side_inbox.dynamicNotifications.espionage';
      const country = notification.targetCountry || notification.partnerCountry || '';
      if (!notification.isOffensive) {
        return t(`${prefix}.incomingMessages.${notification.level || 'ringan'}`, {
          partner: getLocalizedCountryName(notification.partnerCountry || ''),
        });
      }
      const target = getEspionageTarget(notification.operationTarget, t);
      if (notification.operationResult !== 'success') {
        return t(`${prefix}.offensiveFailureMessage`, { country, target });
      }
      if (notification.militaryReport) {
        return t(`${prefix}.offensiveMilitaryMessage`, {
          country,
          target,
          totalUnits: notification.militaryReport.totalUnits,
          landUnits: notification.militaryReport.groups.darat.totalUnits,
          airUnits: notification.militaryReport.groups.udara.totalUnits,
          navalUnits: notification.militaryReport.groups.laut.totalUnits,
        });
      }
      if (notification.economicReport) {
        return t(`${prefix}.offensiveEconomyMessage`, {
          country,
          target,
          budget: notification.economicReport.budget,
          dailyTax: notification.economicReport.estimatedDailyTaxRevenue,
        });
      }
      return t(`${prefix}.offensiveGenericMessage`, { country, target });
    }
    if (notification.tradeType === 'sabotase') {
      const prefix = 'side_inbox.dynamicNotifications.sabotage';
      if (!notification.isOffensive) {
        const eventName = notification.sabotaseType
          ? t(`${prefix}.eventNames.${notification.sabotaseType}`)
          : '';
        return t(`${prefix}.incomingMessage`, {
          eventName,
          partner: getLocalizedCountryName(notification.partnerCountry || ''),
        });
      }
      const key = notification.operationResult === 'success'
        ? `${prefix}.offensiveSuccessMessage`
        : `${prefix}.offensiveFailureMessage`;
      return t(key, {
        country: getLocalizedCountryName(notification.targetCountry || notification.partnerCountry || ''),
        target: getSabotageTarget(notification.operationTarget, t),
      });
    }
    return localizeCountryNamesInText(notification.message);
  }
  const params = localizeInboxParams({ ...notification.messageParams }, t);
  for (const [name, key] of Object.entries(notification.messageParamKeys ?? {})) {
    params[name] = t(key);
  }
  return t(notification.messageKey, params);
}

function getEspionageTarget(operationTarget: string | undefined, t: TranslationFunction): string {
  const prefix = 'side_inbox.dynamicNotifications.espionage.targets';
  if (operationTarget === 'Intelijen Militer & Pertahanan') return t(`${prefix}.military`);
  if (operationTarget === 'Intelijen Ekonomi & Anggaran') return t(`${prefix}.economy`);
  return operationTarget || t(`${prefix}.default`);
}

function getSabotageTarget(operationTarget: string | undefined, t: TranslationFunction): string {
  const prefix = 'side_inbox.dynamicNotifications.sabotage';
  if (!operationTarget || operationTarget === 'Fasilitas & Pabrik Militer' || operationTarget === 'Fasilitas Militer') {
    return t(`${prefix}.defaultTarget`);
  }
  const targets: Record<string, string> = {
    'Infrastruktur Listrik & Energi': 'energyInfrastructure',
    'Sabotase Produksi Pangan': 'foodProduction',
    'Sabotase Manufaktur': 'manufacturing',
  };
  const targetKey = targets[operationTarget];
  return targetKey ? t(`${prefix}.targetOptions.${targetKey}`) : operationTarget;
}
