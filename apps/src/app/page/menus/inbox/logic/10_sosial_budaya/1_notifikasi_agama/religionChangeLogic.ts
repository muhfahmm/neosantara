import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { getDefaultInboxText } from '../../notificationMessage';

export interface ReligionEventChainItem {
  delayDays: number;
  message: string;
  effect: string;
}

export interface ReligionChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_agama';
  changeStage: 'scheduled' | 'completed';
  completionDate?: string;
  fromReligion: string;
  toReligion: string;
  approvalDelta: number;
  mood: 'protes' | 'senang' | 'campuran' | 'panik' | 'netral';
  eventChain?: ReligionEventChainItem[];
}

const RELIGION_MATRIX: Record<string, { mood: 'protes' | 'senang' | 'campuran' | 'panik' | 'netral'; approvalDelta: number }> = {
  'Islam->Katolik': {
    mood: 'protes',
    approvalDelta: -20,
  },
  'Islam->Ateisme': {
    mood: 'panik',
    approvalDelta: -30,
  },
  'Islam->Hindu': {
    mood: 'campuran',
    approvalDelta: -8,
  },
  'Katolik->Protestan': {
    mood: 'senang',
    approvalDelta: 8,
  },
  'Katolik->Islam': {
    mood: 'protes',
    approvalDelta: -18,
  },
  'Protestan->Katolik': {
    mood: 'netral',
    approvalDelta: 2,
  },
  'Hindu->Buddha': {
    mood: 'senang',
    approvalDelta: 6,
  },
  'Buddha->Shinto': {
    mood: 'netral',
    approvalDelta: 3,
  },
  'Yahudi->Ateisme': {
    mood: 'protes',
    approvalDelta: -22,
  },
  'Ateisme->Islam': {
    mood: 'senang',
    approvalDelta: 15,
  },
  'Ateisme->Katolik': {
    mood: 'senang',
    approvalDelta: 12,
  },
};

const RELIGION_EVENT_CHAIN_MAP: Record<string, ReligionEventChainItem[]> = {
  'Ateisme': [
    { delayDays: 7, message: 'Demonstrasi besar digelar di depan masjid & gereja utama.', effect: '-10% Stabilitas' },
    { delayDays: 7, message: 'Tokoh-tokoh agama nasional menuntut referendum keagamaan.', effect: '-5% Approval' },
    { delayDays: 7, message: 'Hubungan diplomatik dengan negara-negara religius memburuk.', effect: '-15 Diplomasi' },
  ],
  'Ateisme->Islam': [
    { delayDays: 7, message: 'Kebangkitan kegiatan keagamaan dan sosial di seluruh negeri.', effect: '+10% Kepuasan' },
    { delayDays: 7, message: 'Pembangunan pusat studi dan tempat ibadah baru berlangsung masif.', effect: '+5% Pembangunan' },
    { delayDays: 7, message: 'Investasi dan hibah dari negara-negara Timur Tengah mengalir.', effect: '+15% Modal' },
  ],
  'Ateisme->Katolik': [
    { delayDays: 7, message: 'Kebangkitan spiritual dan aksi kemanusiaan keagamaan.', effect: '+10% Kepuasan' },
    { delayDays: 7, message: 'Pembangunan sarana ibadah dan pendidikan agama masif.', effect: '+5% Pembangunan' },
    { delayDays: 7, message: 'Kerja sama erat dengan Vatikan dan lembaga donor Eropa.', effect: '+10 Diplomasi' },
  ],
};

export function generateReligionChangeNotification(
  fromReligion: string,
  toReligion: string,
  dateStr: string,
  completionDate?: string,
): ReligionChangeNotification {
  const key = `${fromReligion}->${toReligion}`;
  const matched = RELIGION_MATRIX[key];
  const textPrefix = 'side_inbox.dynamicNotifications.socialCultural.religion';
  const titleKey = `${textPrefix}.${completionDate ? 'scheduledTitle' : 'title'}`;
  const messageKey = `${textPrefix}.${completionDate ? 'scheduledMessage' : 'message'}`;
  const titleParams = { from: fromReligion, to: toReligion };
  const valueParamKeys = {
    from: `${textPrefix}.religionValues.${fromReligion}`,
    to: `${textPrefix}.religionValues.${toReligion}`,
  };
  const messageParams = completionDate
    ? { ...titleParams, completionDate }
    : titleParams;

  const mood = matched?.mood || (fromReligion === toReligion ? 'netral' : 'campuran');
  const approvalDelta = matched?.approvalDelta || (fromReligion === toReligion ? 0 : -5);

  const chainKey = fromReligion === 'Ateisme' ? `Ateisme->${toReligion}` : toReligion;
  const eventChain = RELIGION_EVENT_CHAIN_MAP[chainKey];

  return {
    id: `religion-change-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    titleParamKeys: valueParamKeys,
    sender: getDefaultInboxText(`${textPrefix}.sender`),
    senderKey: `${textPrefix}.sender`,
    message: getDefaultInboxText(messageKey, messageParams),
    messageKey,
    messageParams,
    messageParamKeys: valueParamKeys,
    timestamp: dateStr,
    type: approvalDelta >= 0 ? 'kepuasan' : 'kesejahteraan',
    value: approvalDelta,
    isRead: false,
    tradeType: 'perubahan_agama',
    changeStage: completionDate ? 'scheduled' : 'completed',
    completionDate,
    fromReligion,
    toReligion,
    approvalDelta,
    mood,
    eventChain,
  };
}
