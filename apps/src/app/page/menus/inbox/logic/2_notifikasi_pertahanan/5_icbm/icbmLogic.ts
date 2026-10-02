import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface ICBMNotification extends NotificationMessage {
  tradeType: 'icbm' | 'program_nuklir_dimulai' | 'program_nuklir_selesai';
  launcherCountry?: string;
  targetCity?: string;
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
    message: `PERINGATAN DARURAT TINGKAT TERTINGGI! Radar pertahanan terdeteksi peluncuran Rudal Balistik Antar-Benua (ICBM) bertulu ledak hulu nuklir dari negara ${launcherCountry} mengarah langsung ke ${targetCity}! Waktu benturan diperkirakan dalam hitungan menit!`,
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
    message: `Lapor Presiden! Proyek Rahasia Pembangunan Program Nuklir Nasional (${userCountryName || 'Indonesia'}) resmi dimulai pada ${dateStr}. Fasilitas pengayaan uranium, reaktor riset, dan fasilitas penunjang strategis sedang dibangun. Perkiraan rampung pada ${endDateStr}.`,
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
    message: `KABAR STRATEGIS KENEGARAAN! Pembangunan Fasilitas Program Nuklir Nasional telah selesai sepenuhnya! Negara ${userCountryName || 'Indonesia'} kini resmi menjadi Negara Berkemampuan Nuklir. Akses perakitan Senjata Rudal ICBM dan Operasi Perang Nuklir telah terbuka sepenuhnya!`,
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 100,
    isRead: false,
    tradeType: 'program_nuklir_selesai',
    effectText: 'Fasilitas Pengayaan Nuklir Aktif & Akses Perakitan ICBM Terbuka',
    isHandled: true
  };
}
