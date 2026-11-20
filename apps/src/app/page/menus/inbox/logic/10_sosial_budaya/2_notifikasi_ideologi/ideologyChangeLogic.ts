import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { getDefaultInboxText } from '../../notificationMessage';

export interface IdeologyEventChainItem {
  delayDays: number;
  message: string;
  effect: string;
}

export interface IdeologyChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_ideologi';
  changeStage: 'scheduled' | 'completed';
  completionDate?: string;
  fromIdeology: string;
  toIdeology: string;
  approvalDelta: number;
  mood: 'protes' | 'senang' | 'campuran' | 'panik' | 'bangga' | 'netral' | 'marah' | 'euforia';
  eventChain?: IdeologyEventChainItem[];
}

const IDEOLOGY_MATRIX: Record<string, { mood: 'protes' | 'senang' | 'campuran' | 'panik' | 'bangga' | 'netral' | 'marah' | 'euforia'; approvalDelta: number }> = {
  'Demokrasi->Monarki': {
    mood: 'protes',
    approvalDelta: -15,
  },
  'Demokrasi->Kapitalisme': {
    mood: 'senang',
    approvalDelta: 10,
  },
  'Demokrasi->Sosialisme': {
    mood: 'campuran',
    approvalDelta: 5,
  },
  'Demokrasi->Komunisme': {
    mood: 'panik',
    approvalDelta: -25,
  },
  'Demokrasi->Nasionalisme': {
    mood: 'bangga',
    approvalDelta: 8,
  },
  'Demokrasi->Konservatisme': {
    mood: 'netral',
    approvalDelta: 2,
  },
  'Demokrasi->Liberalisme': {
    mood: 'senang',
    approvalDelta: 12,
  },
  'Demokrasi->Otoritarianisme': {
    mood: 'marah',
    approvalDelta: -20,
  },
  'Kapitalisme->Sosialisme': {
    mood: 'campuran',
    approvalDelta: 8,
  },
  'Kapitalisme->Komunisme': {
    mood: 'panik',
    approvalDelta: -30,
  },
  'Sosialisme->Kapitalisme': {
    mood: 'protes',
    approvalDelta: -12,
  },
  'Monarki->Demokrasi': {
    mood: 'senang',
    approvalDelta: 18,
  },
  'Komunisme->Kapitalisme': {
    mood: 'senang',
    approvalDelta: 15,
  },
  'Otoritarianisme->Demokrasi': {
    mood: 'euforia',
    approvalDelta: 25,
  },
};

const EVENT_CHAIN_MAP: Record<string, IdeologyEventChainItem[]> = {
  'Otoritarianisme': [
    { delayDays: 3, message: 'Demonstrasi mahasiswa merebak di 3 universitas besar.', effect: '-5% Approval' },
    { delayDays: 3, message: 'Media internasional melayangkan kritik keras atas pengekangan kebebasan.', effect: '-10 Diplomasi' },
    { delayDays: 3, message: 'Potensi sanksi diplomatik dari 5 negara demokrasi.', effect: '-5% Ekonomi' },
  ],
  'Demokrasi': [
    { delayDays: 3, message: 'Partai-partai oposisi baru mulai terbentuk dan aktif.', effect: '+5% Demokrasi' },
    { delayDays: 3, message: 'Pers bebas aktif melakukan fungsi pengawasan pemerintah.', effect: '+5 Transparency' },
    { delayDays: 3, message: 'Investor asing mulai kembali meningkatkan kepercayaan pasar.', effect: '+8% PMA' },
  ],
  'Komunisme': [
    { delayDays: 3, message: 'Investor asing menarik modal secara masif dari bursa saham.', effect: '-20% PMA' },
    { delayDays: 3, message: 'Emigrasi besar-besaran kaum profesional dan tenaga ahli.', effect: '-2% Populasi Skill' },
    { delayDays: 3, message: 'Sanksi ekonomi dan pembatasan perdagangan dari blok kapitalis.', effect: '-15% Perdagangan' },
  ],
};

export function generateIdeologyChangeNotification(
  fromIdeology: string,
  toIdeology: string,
  dateStr: string,
  completionDate?: string,
): IdeologyChangeNotification {
  const key = `${fromIdeology}->${toIdeology}`;
  const matched = IDEOLOGY_MATRIX[key];
  const textPrefix = 'side_inbox.dynamicNotifications.socialCultural.ideology';
  const titleKey = `${textPrefix}.${completionDate ? 'scheduledTitle' : 'title'}`;
  const messageKey = `${textPrefix}.${completionDate ? 'scheduledMessage' : 'message'}`;
  const titleParams = { from: fromIdeology, to: toIdeology };
  const valueParamKeys = {
    from: `${textPrefix}.ideologyValues.${fromIdeology}`,
    to: `${textPrefix}.ideologyValues.${toIdeology}`,
  };
  const messageParams = completionDate
    ? { ...titleParams, completionDate }
    : titleParams;

  const mood = matched?.mood || (fromIdeology === toIdeology ? 'netral' : 'campuran');
  const approvalDelta = matched?.approvalDelta || (fromIdeology === toIdeology ? 0 : 5);

  const eventChain = EVENT_CHAIN_MAP[toIdeology];

  return {
    id: `ideology-change-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
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
    tradeType: 'perubahan_ideologi',
    changeStage: completionDate ? 'scheduled' : 'completed',
    completionDate,
    fromIdeology,
    toIdeology,
    approvalDelta,
    mood,
    eventChain,
  };
}
