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

function normalizeInboxTemplateKey(key: string): string {
  const basicNeedsPrefix = 'side_inbox.basicNeeds.';
  if (
    key.startsWith(basicNeedsPrefix) &&
    !key.startsWith('side_inbox.dynamicNotifications.basicNeeds.')
  ) {
    const subPath = key.slice(basicNeedsPrefix.length);
    const validCategories = ['electricity', 'housing', 'food', 'publicServices', 'population'];
    if (validCategories.some((cat) => subPath.startsWith(cat))) {
      return `side_inbox.dynamicNotifications.basicNeeds.${subPath}`;
    }
  }
  return key;
}

function getIdTemplate(key: string): string {
  const normalizedKey = normalizeInboxTemplateKey(key);
  const path = normalizedKey.split('.').slice(1);
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
const PLAYER_LOOT_NOTIFICATION_PREFIX = 'notif-player-loot-';
const PLAYER_LOOT_MESSAGE_KEY = 'side_inbox.dynamicNotifications.playerLoot.message';
const PLAYER_ANNEX_NOTIFICATION_PREFIX = 'notif-player-annex-';
const AI_WAR_ANNEX_NOTIFICATION_PREFIX = 'notif-ai-war-annex-';
const AI_WAR_LOOT_NOTIFICATION_PREFIX = 'notif-ai-war-loot-';
const COVERT_ESPIONAGE_RESULT_PREFIX = 'notif-covert-espionage-active-';
const COVERT_SABOTAGE_RESULT_PREFIX = 'notif-covert-sabotage-result-';

const LEGACY_LOOT_UNIT_KEYS: Record<string, string> = {
  'prajurit infanteri': 'barak',
  'tank tempur utama': 'tank_tempur_utama',
  'apc ifv': 'apc_ifv',
  'artileri berat': 'artileri_berat',
  'sistem peluncur roket': 'sistem_peluncur_roket',
  'pertahanan udara mobile': 'pertahanan_udara_mobile',
  'kendaraan taktis': 'kendaraan_taktis',
  'kapal induk': 'kapal_induk',
  'kapal induk nuklir': 'kapal_induk_nuklir',
  'kapal destroyer': 'kapal_destroyer',
  'kapal korvet': 'kapal_korvet',
  'kapal selam nuklir': 'kapal_selam_nuklir',
  'kapal selam regular': 'kapal_selam_regular',
  'kapal ranjau': 'kapal_ranjau',
  'kapal logistik': 'kapal_logistik',
  'jet tempur siluman': 'jet_tempur_siluman',
  'jet tempur interceptor': 'jet_tempur_interceptor',
  'pesawat pengebom': 'pesawat_pengebom',
  'helikopter serang': 'helikopter_serang',
  'pesawat pengintai': 'pesawat_pengintai',
  'drone intai uav': 'drone_intai_uav',
  'drone kamikaze': 'drone_kamikaze',
  'pesawat angkut': 'pesawat_angkut',
};

interface PlayerLootNotificationFields {
  id?: string;
  message: string;
  sender?: string;
  attackerCountry?: string;
  targetCountry?: string;
  transferredCash?: number;
  lossPercent?: number;
  lootLosses?: Array<{ unitKey: string; quantity: number }>;
}

function isPlayerLootNotification(notification: { id?: string }): boolean {
  return notification.id?.startsWith(PLAYER_LOOT_NOTIFICATION_PREFIX) ?? false;
}

function isPlayerAnnexNotification(notification: { id?: string }): boolean {
  return notification.id?.startsWith(PLAYER_ANNEX_NOTIFICATION_PREFIX) ?? false;
}

function isLegacyAnnexationCancellation(notification: { id?: string; title?: string }): boolean {
  return Boolean(
    notification.id?.startsWith(`${PLAYER_ANNEX_NOTIFICATION_PREFIX}no-city-`) ||
    notification.title?.toLowerCase().includes('aneksasi kota dibatalkan')
  );
}

function isLegacyPbbOccupation(notification: { title?: string; sender?: string }): boolean {
  return /wilayah diduduki pbb/i.test(notification.title || '') ||
    /pasukan gabungan pbb/i.test(notification.sender || '');
}

function parseInboxNumber(value: string): number | undefined {
  const normalized = value.trim().replace(/\s/g, '');
  const parsed = Number(normalized.includes(',')
    ? normalized.replace(/\./g, '').replace(',', '.')
    : normalized.replace(/[.,]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatInboxNumber(value: number): string {
  const locale = typeof document !== 'undefined' && document.documentElement.lang
    ? document.documentElement.lang
    : 'id';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

function getPlayerLootLegacyData(message: string): {
  targetCountry?: string;
  transferredCash?: number;
  lossPercent?: number;
  lootLosses: Array<{ unitKey: string; quantity: number }>;
} {
  const match = message.match(
    /^Operasi penjarahan atas\s+(.+?)\s+berhasil dilancarkan!\s+Kas negara sebesar\s+([\d.,]+)\s+NEO dan sumber daya alam telah diamankan\.(.*)$/i,
  );
  const lossMatch = match?.[3].match(
    /Kerugian tempur armada Anda\s*\(([\d.,]+)%\):\s*(.+?)(?:\.\s*)?$/i,
  );
  const lootLosses = (lossMatch?.[2] ?? '')
    .split(/,\s*/)
    .flatMap((item) => {
      const itemMatch = item.match(/^([\d.,]+)\s+(.+)$/);
      if (!itemMatch) return [];
      const quantity = parseInboxNumber(itemMatch[1]);
      const unitKey = LEGACY_LOOT_UNIT_KEYS[itemMatch[2].trim().toLowerCase()];
      return quantity !== undefined && unitKey ? [{ unitKey, quantity }] : [];
    });

  return {
    targetCountry: match?.[1],
    transferredCash: match ? parseInboxNumber(match[2]) : undefined,
    lossPercent: lossMatch ? parseInboxNumber(lossMatch[1]) : undefined,
    lootLosses,
  };
}

function getPlayerLootMessage(
  notification: PlayerLootNotificationFields,
  t: TranslationFunction,
): string {
  const legacyData = getPlayerLootLegacyData(notification.message);
  const targetCountry = notification.targetCountry || legacyData.targetCountry || '';
  const cash = notification.transferredCash ?? legacyData.transferredCash;
  const losses = notification.lootLosses ?? legacyData.lootLosses;
  const lossPercent = notification.lossPercent ?? legacyData.lossPercent;
  if (!targetCountry || cash === undefined) {
    return localizeCountryNamesInText(notification.message);
  }
  const localizedLosses = losses
    .map(({ unitKey, quantity }) => {
      const normalizedUnitKey = unitKey === 'pasukan_infanteri' ? 'barak' : unitKey;
      const unitName = t(`navigation_defense_attack.units.${normalizedUnitKey}`);
      return `${formatInboxNumber(quantity)} ${unitName}`;
    })
    .join(', ');
  const lossNote = localizedLosses && lossPercent !== undefined
    ? t('side_inbox.dynamicNotifications.playerLoot.lossNote', {
      percent: lossPercent,
      losses: localizedLosses,
    })
    : '';

  return t(PLAYER_LOOT_MESSAGE_KEY, {
    target: getLocalizedCountryName(targetCountry),
    cash: cash === undefined ? '' : formatInboxNumber(cash),
    lossNote,
  });
}

type PlayerAnnexationResult = {
  attackerCountry: string;
  targetCountry: string;
  cityName?: string;
  pbbOccupation: boolean;
  countryCollapsed: boolean;
  cityFound: boolean;
  lossPercent: number;
  losses: Array<{ unitKey: string; quantity: number }>;
};

function parseLegacyAnnexationLosses(text: string): {
  lossPercent: number;
  losses: Array<{ unitKey: string; quantity: number }>;
} {
  const lossMatch = text.match(
    /Kerugian tempur armada Anda\s*\(([\d.,]+)%\):\s*(.+?)(?:\.\s*)?$/i,
  );
  const lossPercent = lossMatch ? parseInboxNumber(lossMatch[1]) : undefined;
  const losses = (lossMatch?.[2] ?? '')
    .split(/,\s*/)
    .flatMap((item) => {
      const itemMatch = item.match(/^([\d.,]+)\s+(.+)$/);
      if (!itemMatch) return [];
      const quantity = parseInboxNumber(itemMatch[1]);
      const unitKey = LEGACY_LOOT_UNIT_KEYS[itemMatch[2].trim().toLowerCase()];
      return quantity !== undefined && unitKey ? [{ unitKey, quantity }] : [];
    });
  return { lossPercent: lossPercent ?? 0, losses };
}

function getLegacyAnnexationResult(notification: {
  id?: string;
  title?: string;
  sender?: string;
  message: string;
}): PlayerAnnexationResult | undefined {
  const pbbOccupation = isLegacyPbbOccupation(notification);
  const cancellation = isLegacyAnnexationCancellation(notification);
  const noCityMatch = notification.message.match(
    /^Kota target di\s+(.+?)\s+tidak ditemukan pada data peta\.\s+Tidak ada wilayah yang diubah\.$/i,
  ) || notification.message.match(
    /^Aneksasi\s+(.+?)\s+tidak dapat diterapkan karena kota target tidak ditemukan pada data peta\.$/i,
  );
  if (cancellation && noCityMatch) {
    return {
      attackerCountry: '',
      targetCountry: noCityMatch[1],
      pbbOccupation: false,
      countryCollapsed: false,
      cityFound: false,
      ...parseLegacyAnnexationLosses(notification.message),
    };
  }

  if (pbbOccupation) {
    const match = notification.message.match(
      /^Pasukan gabungan PBB berhasil menduduki Kota\s+(.+?)\s+di\s+(.+?)\.\s+Wilayah berada di bawah administrasi PBB, bukan negara peserta\.(.*)$/i,
    );
    if (!match) return undefined;
    return {
      attackerCountry: '',
      targetCountry: match[2],
      cityName: match[1],
      pbbOccupation: true,
      countryCollapsed: false,
      cityFound: true,
      ...parseLegacyAnnexationLosses(match[3]),
    };
  }

  const match = notification.message.match(
    /^Pasukan\s+(.+?)\s+berhasil menaklukkan Kota\s+(.+?)\s+di\s+(.+?)\.\s+([\s\S]*?)\s+Wilayah taklukan ditandai hijau terang pada peta\.$/i,
  );
  if (!match) return undefined;
  return {
    attackerCountry: match[1],
    targetCountry: match[3],
    cityName: match[2],
    pbbOccupation: false,
    countryCollapsed: /^Ibu kota atau seluruh kota yang terdata telah jatuh;/i.test(match[4]),
    cityFound: true,
    ...parseLegacyAnnexationLosses(match[4]),
  };
}

function getPlayerAnnexationMessage(
  notification: {
    id?: string;
    title?: string;
    sender?: string;
    message: string;
    messageKey?: string;
    annexationResult?: PlayerAnnexationResult;
  },
  t: TranslationFunction,
): string {
  const result = notification.annexationResult ??
    getLegacyAnnexationResult(notification);
  if (!result) return localizeCountryNamesInText(notification.message);

  const prefix = 'side_inbox.dynamicNotifications.conquest';
  const target = getLocalizedCountryName(result.targetCountry);
  const losses = result.losses
    .map(({ unitKey, quantity }) => {
      const normalizedUnitKey = unitKey === 'pasukan_infanteri' ? 'barak' : unitKey;
      return `${formatInboxNumber(quantity)} ${t(`navigation_defense_attack.units.${normalizedUnitKey}`)}`;
    })
    .join(', ');
  const lossNote = losses
    ? t(`${prefix}.lossNote`, { percent: result.lossPercent, losses })
    : '';

  if (!result.cityFound) {
    return t(notification.messageKey || `${prefix}.noCityMessage`, { target });
  }

  const city = result.cityName || '';
  if (result.pbbOccupation) {
    return t(notification.messageKey || `${prefix}.pbbMessage`, {
      city,
      target,
      lossNote,
    });
  }

  const outcomeKey = result.countryCollapsed ? 'fullCollapse' : 'remainingCities';
  const outcome = t(`${prefix}.${outcomeKey}`, { target });
  return t(notification.messageKey || `${prefix}.cityMessage`, {
    attacker: getLocalizedCountryName(result.attackerCountry),
    city,
    target,
    outcome,
    lossNote,
  });
}

function getLegacyEspionageResultMessage(
  message: string,
  t: TranslationFunction,
): string {
  const remainingDays = message.match(/([\d.,]+)\s+hari\b/i)?.[1];
  const parsedDays = remainingDays ? parseInboxNumber(remainingDays) : undefined;
  if (parsedDays === undefined) return localizeCountryNamesInText(message);
  const messageKey = /memperpanjang atau mempertahankan/i.test(message)
    ? 'side_inbox.dynamicNotifications.espionage.extendedMessage'
    : 'side_inbox.dynamicNotifications.espionage.activeMessage';
  return t(messageKey, { remainingDays: parsedDays });
}

function parseLegacySabotageLosses(
  message: string,
  infrastructure: boolean,
): Array<{ unitKey: string; lostQuantity: number; remainingQuantity: number }> | undefined {
  const details = infrastructure
    ? message.match(/Kerusakan:\s*(.*?)\.\s*$/i)?.[1]
    : message.match(/Kerugian:\s*(.*?)\.\s*Personel\/infanteri/i)?.[1];
  if (details === undefined) return undefined;
  if (/^Tidak ada alutsista|^Tidak ada bangunan listrik/i.test(details)) return [];

  const parsedLosses: Array<{
    unitKey: string;
    lostQuantity: number;
    remainingQuantity: number;
  } | undefined> = details.split(/;\s*/).map((detail) => {
    const match = detail.match(/^(.+?):\s*-\s*([\d.,]+)\s*\(sisa\s+([\d.,]+)\)$/i);
    if (!match) return undefined;
    const lostQuantity = parseInboxNumber(match[2]);
    const remainingQuantity = parseInboxNumber(match[3]);
    if (lostQuantity === undefined || remainingQuantity === undefined) return undefined;
    return {
      unitKey: match[1].trim().toLowerCase().replace(/\s+/g, '_'),
      lostQuantity,
      remainingQuantity,
    };
  });
  const validLosses = parsedLosses.filter(
    (loss): loss is { unitKey: string; lostQuantity: number; remainingQuantity: number } =>
      loss !== undefined,
  );
  return validLosses.length === parsedLosses.length ? validLosses : undefined;
}

function getLocalizedSabotageLosses(
  losses: Array<{ unitKey: string; lostQuantity: number; remainingQuantity: number }>,
  infrastructure: boolean,
  t: TranslationFunction,
): string {
  if (losses.length === 0) {
    return t(infrastructure
      ? 'side_inbox.dynamicNotifications.sabotage.noInfrastructureLosses'
      : 'side_inbox.dynamicNotifications.sabotage.noMilitaryLosses');
  }
  return losses.map((loss) => {
    let unitName: string;
    if (!infrastructure) {
      unitName = t(`navigation_defense_attack.units.${loss.unitKey}`);
    } else if (loss.unitKey.startsWith('pembangkit_listrik_')) {
      unitName = t(`navigation_electricity_grid.plantDescriptions.${loss.unitKey}`);
    } else if (['litium', 'logam_tanah_jarang', 'bijih_besi'].includes(loss.unitKey)) {
      unitName = t(`side_inbox.dynamicNotifications.sabotage.infrastructureItems.${loss.unitKey}`);
    } else {
      unitName = t(`navigation_electricity_grid.detail.buildings.${loss.unitKey}`);
    }
    return t('side_inbox.dynamicNotifications.sabotage.lossEntry', {
      unit: unitName,
      lost: formatInboxNumber(loss.lostQuantity),
      remaining: formatInboxNumber(loss.remainingQuantity),
    });
  }).join('; ');
}

function getCovertSabotageResultMessage(
  notification: {
    message: string;
    messageKey?: string;
    messageParams?: InboxMessageParams;
    sabotageResult?: {
      infrastructure: boolean;
      losses: Array<{ unitKey: string; lostQuantity: number; remainingQuantity: number }>;
    };
  },
  t: TranslationFunction,
): string {
  const infrastructure = notification.sabotageResult?.infrastructure ??
    /^Sabotase mengurangi bangunan listrik/i.test(notification.message);
  const losses = notification.sabotageResult?.losses ??
    parseLegacySabotageLosses(notification.message, infrastructure);
  if (!losses) return localizeCountryNamesInText(notification.message);
  const messageKey = notification.messageKey ||
    `side_inbox.dynamicNotifications.sabotage.${infrastructure ? 'infrastructureResultMessage' : 'militaryResultMessage'}`;
  return t(messageKey, {
    ...notification.messageParams,
    losses: getLocalizedSabotageLosses(losses, infrastructure, t),
  });
}

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
    if (notification.id?.startsWith('notif-npc-war-')) {
      return t('side_inbox.dynamicNotifications.npcWar.title');
    }
    if (notification.id?.startsWith(AI_WAR_ANNEX_NOTIFICATION_PREFIX)) {
      return t('side_inbox.dynamicNotifications.aiWar.annexTitle');
    }
    if (notification.id?.startsWith(AI_WAR_LOOT_NOTIFICATION_PREFIX)) {
      return t('side_inbox.dynamicNotifications.aiWar.lootTitle');
    }
    if (notification.title.toLowerCase().includes('pembangunan kedutaan dimulai')) {
      return t('side_inbox.dynamicNotifications.embassyConstruction.title');
    }
    if (isPlayerAnnexNotification(notification)) {
      if (isLegacyAnnexationCancellation(notification)) {
        return t('side_inbox.dynamicNotifications.conquest.noCityTitle');
      }
      if (isLegacyPbbOccupation(notification)) {
        return t('side_inbox.dynamicNotifications.conquest.pbbTitle');
      }
      return t('side_inbox.dynamicNotifications.conquest.title');
    }
    if (notification.id?.startsWith(COVERT_ESPIONAGE_RESULT_PREFIX)) {
      return t('side_inbox.dynamicNotifications.espionage.activeTitle');
    }
    if (notification.id?.startsWith(COVERT_SABOTAGE_RESULT_PREFIX)) {
      return t('side_inbox.dynamicNotifications.sabotage.impactTitle');
    }
    if (isPlayerLootNotification(notification)) {
      return t('side_inbox.dynamicNotifications.playerLoot.title');
    }
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
  const titleParams = { ...notification.titleParams };
  if (
    notification.titleKey === 'side_inbox.disaster.naturalTitle' &&
    typeof titleParams.province === 'string'
  ) {
    titleParams.province = getLocalizedCountryName(titleParams.province);
  }
  const params = localizeInboxParams(titleParams, t);
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
    attackerCountry?: string;
  },
  t: TranslationFunction
): string {
  if (!notification.senderKey) {
    if (notification.id?.startsWith('notif-npc-war-')) {
      const attackerCountry = notification.attackerCountry ||
        notification.sender.match(/^Kementerian Luar Negeri\s*[—-]\s*(.+)$/i)?.[1] ||
        '';
      return t('side_inbox.dynamicNotifications.npcWar.sender', {
        attacker: getLocalizedCountryName(attackerCountry),
      });
    }
    if (
      notification.id?.startsWith(AI_WAR_ANNEX_NOTIFICATION_PREFIX) ||
      notification.id?.startsWith(AI_WAR_LOOT_NOTIFICATION_PREFIX)
    ) {
      const attackerCountry = notification.attackerCountry ||
        notification.sender.match(/^Laporan Perang\s+(.+)$/i)?.[1] ||
        '';
      return t('side_inbox.dynamicNotifications.aiWar.sender', {
        attacker: getLocalizedCountryName(attackerCountry),
      });
    }
    if (notification.title?.toLowerCase().includes('pembangunan kedutaan dimulai')) {
      const country = notification.sender.match(/^Kementerian Luar Negeri\s+(.+)$/i)?.[1] || '';
      return t('side_inbox.dynamicNotifications.embassyConstruction.sender', {
        country: getLocalizedCountryName(country),
      });
    }
    if (isPlayerAnnexNotification(notification)) {
      if (isLegacyAnnexationCancellation(notification)) {
        return t('side_inbox.dynamicNotifications.conquest.noCitySender');
      }
      if (isLegacyPbbOccupation(notification)) {
        return t('side_inbox.dynamicNotifications.conquest.pbbSender');
      }
      const attackerCountry = notification.attackerCountry ||
        notification.sender.match(/\(([^()]*)\)\s*$/)?.[1];
      return attackerCountry
        ? t('side_inbox.dynamicNotifications.conquest.sender', {
          attacker: getLocalizedCountryName(attackerCountry),
        })
        : localizeCountryNamesInText(notification.sender);
    }
    if (notification.id?.startsWith(COVERT_ESPIONAGE_RESULT_PREFIX)) {
      return t('side_inbox.dynamicNotifications.espionage.activeSender');
    }
    if (notification.id?.startsWith(COVERT_SABOTAGE_RESULT_PREFIX)) {
      return t('side_inbox.dynamicNotifications.sabotage.impactSender');
    }
    if (isPlayerLootNotification(notification)) {
      const attackerCountry = notification.attackerCountry ||
        notification.sender.match(/\(([^()]*)\)\s*$/)?.[1] ||
        '';
      return t('side_inbox.dynamicNotifications.playerLoot.sender', {
        attacker: getLocalizedCountryName(attackerCountry),
      });
    }
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
    attackerCountry?: string;
    transferredCash?: number;
    lossPercent?: number;
    lootLosses?: Array<{ unitKey: string; quantity: number }>;
    sabotageResult?: {
      infrastructure: boolean;
      losses: Array<{ unitKey: string; lostQuantity: number; remainingQuantity: number }>;
    };
    annexationResult?: PlayerAnnexationResult;
  },
  t: TranslationFunction
): string {
  if (!notification.messageKey && notification.id?.startsWith('notif-npc-war-')) {
    const match = notification.message.match(/^(.+?) melancarkan serangan terhadap (.+?)\./i);
    return t('side_inbox.dynamicNotifications.npcWar.message', {
      attacker: getLocalizedCountryName(notification.attackerCountry || match?.[1] || ''),
      target: getLocalizedCountryName(notification.targetCountry || match?.[2] || ''),
    });
  }
  if (
    !notification.messageKey &&
    (notification.id?.startsWith(AI_WAR_ANNEX_NOTIFICATION_PREFIX) ||
      notification.id?.startsWith(AI_WAR_LOOT_NOTIFICATION_PREFIX))
  ) {
    const isAnnexation = notification.id.startsWith(AI_WAR_ANNEX_NOTIFICATION_PREFIX);
    if (isAnnexation) {
      const match = notification.message.match(
        /^(.+?) memenangkan perang dan menganeksasi seluruh wilayah (.+?)\.$/i
      );
      const attacker = getLocalizedCountryName(notification.attackerCountry || match?.[1] || '');
      return t('side_inbox.dynamicNotifications.aiWar.annexMessage', {
        attacker,
        target: getLocalizedCountryName(notification.targetCountry || match?.[2] || ''),
      });
    }
    const match = notification.message.match(
      /^(.+?) memenangkan perang dan menjarah kas negara \((.+?) NEO\) serta sumber daya (.+?)\./i
    );
    const attacker = getLocalizedCountryName(notification.attackerCountry || match?.[1] || '');
    return t('side_inbox.dynamicNotifications.aiWar.lootMessage', {
      attacker,
      cash: match?.[2] || '',
      target: getLocalizedCountryName(notification.targetCountry || match?.[3] || ''),
    });
  }
  if (
    !notification.messageKey &&
    notification.title?.toLowerCase().includes('pembangunan kedutaan dimulai')
  ) {
    const match = notification.message.match(
      /Kedutaan Besar di\s+(.+?)\s+dimulai dan dijadwalkan selesai pada\s+(.+?)\./i
    );
    return t('side_inbox.dynamicNotifications.embassyConstruction.message', {
      target: getLocalizedCountryName(match?.[1] || ''),
      date: match?.[2] || '',
    });
  }
  if (notification.id?.startsWith(COVERT_ESPIONAGE_RESULT_PREFIX)) {
    return notification.messageKey
      ? t(notification.messageKey, notification.messageParams)
      : getLegacyEspionageResultMessage(notification.message, t);
  }
  if (notification.id?.startsWith(COVERT_SABOTAGE_RESULT_PREFIX)) {
    return getCovertSabotageResultMessage(notification, t);
  }
  if (isPlayerLootNotification(notification)) {
    return getPlayerLootMessage(notification, t);
  }
  if (isPlayerAnnexNotification(notification) || notification.annexationResult) {
    return getPlayerAnnexationMessage(notification, t);
  }
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
