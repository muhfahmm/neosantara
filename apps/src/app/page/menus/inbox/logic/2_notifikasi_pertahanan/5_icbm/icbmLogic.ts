import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText } from '../../notificationMessage';

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
  return {
    id: `icbm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `☢️ DETEKSI PELUNCURAN RUDAL NUKLIR (ICBM)!`,
    sender: `Komando Pertahanan Udara & Antariksa Nasional`,
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
    effectText: 'Kehancuran Kota Total & Jutaan Korban jika Gagal Dicegat',
    isHandled: false
  };
}

export function generateProgramNuklirDimulaiNotification(
  userCountryName: string,
  endDateStr: string,
  dateStr: string
): ICBMNotification {
  return {
    id: `nuklir-dimulai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `☢️ PROYEK RAHASIA: Pembangunan Program Nuklir Dimulai!`,
    sender: `Komando Strategis Nuklir & Kementerian Pertahanan`,
    ...createInboxNotificationText('side_inbox.notificationMessages.icbm.programStarted', {
      country: userCountryName || 'Indonesia',
      startDate: dateStr,
      endDate: endDateStr,
    }),
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'program_nuklir_dimulai',
    endDateStr,
    effectText: `Estimasi Rampung: ${endDateStr}`,
    isHandled: false
  };
}

export function generateProgramNuklirSelesaiNotification(
  userCountryName: string,
  dateStr: string
): ICBMNotification {
  return {
    id: `nuklir-selesai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `⚛️ NUKLIR AKTIF: Program Nuklir Nasional Resmi Beroperasi!`,
    sender: `Komando Strategis Nuklir & Dewan Keamanan Nasional`,
    ...createInboxNotificationText('side_inbox.notificationMessages.icbm.programCompleted', {
      country: userCountryName || 'Indonesia',
    }),
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 100,
    isRead: false,
    tradeType: 'program_nuklir_selesai',
    effectText: 'Fasilitas Pengayaan Nuklir Aktif & Akses Perakitan ICBM Terbuka',
    isHandled: true
  };
}

export function generateUjicobaNuklirAINotification(
  testerCountry: string,
  targetLocation: string,
  remainingIcbm: number,
  dateStr: string
): ICBMNotification {
  return {
    id: `ujicoba-nuklir-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `🚀 UJI COBA NUKLIR & RUDAL ICBM: ${testerCountry}`,
    sender: `Badan Intelijen Strategis & Deteksi Seismik Global`,
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
    effectText: `Status Persediaan Rudal ${testerCountry}: ${remainingIcbm} Unit Siap Tempur`,
    isHandled: true
  };
}
