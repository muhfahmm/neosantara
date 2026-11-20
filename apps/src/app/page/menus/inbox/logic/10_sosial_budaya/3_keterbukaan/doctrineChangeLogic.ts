import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { getDefaultInboxText } from '../../notificationMessage';

export interface DoctrineEffectItem {
  stat: string;
  statKey?: string;
  value: string;
}

export interface DoctrineChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_doktrin';
  sliderKey: string;
  sliderLabel: string;
  fromValue: number;
  toValue: number;
  threshold: 'above70' | 'below30' | 'drastic_down' | 'drastic_up' | 'moderate';
  effects: DoctrineEffectItem[];
}

const SLIDER_LABEL_KEYS: Record<string, string> = {
  speechScore: 'speechScore',
  religionScore: 'religionScore',
  demoScore: 'demoScore',
  transparencyScore: 'transparencyScore',
  mediaScore: 'mediaScore',
  internetScore: 'internetScore',
  borderScore: 'borderScore',
  tradeScore: 'tradeScore',
  diplomacyScore: 'diplomacyScore',
};

const DOCTRINE_STAT_KEYS: Record<string, string> = {
  Approval: 'approval',
  Stabilitas: 'stability',
  Diplomasi: 'diplomacy',
  Ekonomi: 'economy',
  PDB: 'gdp',
  Populasi: 'population',
  Kepuasan: 'satisfaction',
  HAM: 'humanRights',
  Pariwisata: 'tourism',
  PMA: 'foreignInvestment',
  'Industri Lokal': 'localIndustry',
};

export function generateDoctrineChangeNotification(
  sliderKey: string,
  fromValue: number,
  toValue: number,
  dateStr: string
): DoctrineChangeNotification | null {
  const diff = toValue - fromValue;
  if (Math.abs(diff) < 5) return null;

  const sliderTranslationKey = SLIDER_LABEL_KEYS[sliderKey];
  if (!sliderTranslationKey) {
    throw new Error(`Missing inbox doctrine slider translation: ${sliderKey}`);
  }

  let threshold: DoctrineChangeNotification['threshold'] = 'moderate';
  let effects: DoctrineEffectItem[] = [];

  if (diff <= -30) {
    threshold = 'drastic_down';
    switch (sliderKey) {
      case 'speechScore':
      case 'demoScore':
        effects = [{ stat: 'Approval', value: sliderKey === 'speechScore' ? '-15%' : '-10%' }];
        break;
      case 'religionScore':
        effects = [{ stat: 'Stabilitas', value: '-15%' }];
        break;
      case 'mediaScore':
      case 'diplomacyScore':
        effects = [{ stat: sliderKey === 'mediaScore' ? 'Diplomasi' : 'Ekonomi', value: sliderKey === 'mediaScore' ? '-10%' : '-15%' }];
        break;
      case 'internetScore':
      case 'tradeScore':
        effects = [{ stat: 'PDB', value: '-10%' }];
        break;
      case 'borderScore':
        effects = [{ stat: 'Populasi', value: '-10%' }];
        break;
      default:
        effects = [{ stat: 'Approval', value: '-10%' }];
    }
  } else if (diff >= 30) {
    threshold = 'drastic_up';
    effects = [{ stat: sliderKey === 'transparencyScore' ? 'Approval' : 'Kepuasan', value: '+10%' }];
  } else if (toValue >= 70) {
    threshold = 'above70';
    switch (sliderKey) {
      case 'speechScore':
        effects = [{ stat: 'HAM', value: '+10' }, { stat: 'Kepuasan', value: '+5' }];
        break;
      case 'religionScore':
        effects = [{ stat: 'Approval', value: '+5%' }];
        break;
      case 'demoScore':
        effects = [{ stat: 'Kepuasan', value: '+5%' }];
        break;
      case 'mediaScore':
        effects = [{ stat: 'HAM', value: '+5' }];
        break;
      case 'internetScore':
        effects = [{ stat: 'PDB', value: '+5%' }];
        break;
      case 'borderScore':
        effects = [{ stat: 'Pariwisata', value: '+15%' }];
        break;
      case 'tradeScore':
        effects = [{ stat: 'PMA', value: '+20%' }];
        break;
      case 'diplomacyScore':
        effects = [{ stat: 'Diplomasi', value: '+15' }];
        break;
      default:
        effects = [{ stat: 'Approval', value: '+5%' }];
    }
  } else if (toValue <= 30) {
    threshold = 'below30';
    switch (sliderKey) {
      case 'speechScore':
        effects = [{ stat: 'HAM', value: '-10' }, { stat: 'Stabilitas', value: '+15' }];
        break;
      case 'religionScore':
        effects = [{ stat: 'HAM', value: '-10' }];
        break;
      case 'demoScore':
        effects = [{ stat: 'HAM', value: '-10' }, { stat: 'Stabilitas', value: '+10' }];
        break;
      case 'mediaScore':
        effects = [{ stat: 'HAM', value: '-10' }];
        break;
      case 'internetScore':
        effects = [{ stat: 'PDB', value: '-5%' }];
        break;
      case 'borderScore':
        effects = [{ stat: 'Stabilitas', value: '+12' }];
        break;
      case 'tradeScore':
        effects = [{ stat: 'Industri Lokal', value: '+15' }];
        break;
      case 'diplomacyScore':
        effects = [{ stat: 'Diplomasi', value: '-20' }];
        break;
      default:
        effects = [{ stat: 'HAM', value: '-5' }];
    }
  }

  const isPositive = threshold === 'above70' || threshold === 'drastic_up' || (diff > 0 && threshold !== 'drastic_down');
  const textPrefix = 'side_inbox.dynamicNotifications.socialCultural.doctrine';
  const titleKey = `${textPrefix}.title`;
  const messageKey = `${textPrefix}.message`;
  const sliderLabelKey = `${textPrefix}.sliders.${sliderTranslationKey}`;
  const titleParams = { sliderLabel: getDefaultInboxText(sliderLabelKey) };
  const messageParams = { ...titleParams, fromValue, toValue };
  const localizedEffects = effects.map((effect) => {
    const statKey = DOCTRINE_STAT_KEYS[effect.stat];
    if (!statKey) {
      throw new Error(`Missing inbox doctrine stat translation: ${effect.stat}`);
    }
    return { ...effect, statKey: `${textPrefix}.stats.${statKey}` };
  });

  return {
    id: `doctrine-change-${sliderKey}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    titleParamKeys: { sliderLabel: sliderLabelKey },
    sender: getDefaultInboxText(`${textPrefix}.sender`),
    senderKey: `${textPrefix}.sender`,
    message: getDefaultInboxText(messageKey, messageParams),
    messageKey,
    messageParams,
    messageParamKeys: { sliderLabel: sliderLabelKey },
    timestamp: dateStr,
    type: isPositive ? 'kepuasan' : 'kesejahteraan',
    value: diff,
    isRead: false,
    tradeType: 'perubahan_doktrin',
    sliderKey,
    sliderLabel: getDefaultInboxText(sliderLabelKey),
    fromValue,
    toValue,
    threshold,
    effects: localizedEffects,
  };
}
