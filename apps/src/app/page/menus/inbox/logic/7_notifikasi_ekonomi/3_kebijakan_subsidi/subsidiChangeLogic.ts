import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface SubsidiChangeNotification extends NotificationMessage {
  tradeType: 'kebijakan_subsidi';
  subsidyName: string;
  isSubsidized: boolean;
}

export function generateSubsidiChangeNotification(
  subsidyName: string,
  isSubsidized: boolean,
  dateStr: string
): SubsidiChangeNotification {
  const title = isSubsidized
    ? `✨ Alokasi Subsidi: ${subsidyName} Resmi Diberikan`
    : `⚠️ Gejolak Ketidakpuasan: Pencabutan ${subsidyName}`;

  const message = isSubsidized
    ? `Keputusan pemerintah mengalokasikan program ${subsidyName} disambut gembira oleh publik. Bantuan subsidi ini dinilai sangat nyata dalam membantu daya beli dan kesejahteraan masyarakat.`
    : `Gelombang ketidakpuasan dan gejolak protes muncul di berbagai kalangan setelah pemerintah resmi mencabut ${subsidyName}. Penyesuaian anggaran ini dikhawatirkan memicu lonjakan beban hidup rakyat.`;

  return {
    id: `subsidi-change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    sender: `Kementerian Keuangan & Organisasi Masyarakat`,
    message,
    timestamp: dateStr,
    type: isSubsidized ? 'kesejahteraan' : 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'kebijakan_subsidi',
    subsidyName,
    isSubsidized
  };
}
