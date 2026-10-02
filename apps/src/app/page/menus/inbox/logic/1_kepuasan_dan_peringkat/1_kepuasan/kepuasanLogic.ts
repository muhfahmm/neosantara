export interface NotificationMessage {
  id: string;
  title: string;
  sender: string;
  message: string;
  timestamp: string;
  type: 'kepuasan' | 'peringkat' | 'kesejahteraan';
  value: number;
  isRead: boolean;
}

/**
 * Logika pesan peringatan dini untuk indikator Kepuasan Rakyat.
 * Dipicu ketika nilai kepuasan turun ke angka 20-25 (di atas batas kritis modal 10).
 */
export function getKepuasanWarningMessage(value: number, dateStr: string): NotificationMessage {
  return {
    id: `kepuasan-warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: "⚠️ Peringatan Dini: Kepuasan Rakyat Menurun!",
    sender: "Kementerian Dalam Negeri",
    message: `Lapor Presiden! Indeks kepuasan rakyat telah merosot ke angka ${Math.round(value)}/100. Ketidakpuasan mulai menyebar di berbagai provinsi. Jika terus dibiarkan hingga di bawah 10, gelombang aksi protes besar-besaran tidak akan terhindarkan dan stabilitas negara akan terancam! Mohon segera luncurkan festival budaya atau turunkan tarif pajak barang pokok.`,
    timestamp: dateStr,
    type: 'kepuasan',
    value: Math.round(value),
    isRead: false
  };
}
