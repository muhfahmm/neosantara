import { NotificationMessage } from '../1_kepuasan/kepuasanLogic';

/**
 * Logika pesan peringatan dini untuk Indeks Kesejahteraan Rakyat.
 * Dipicu ketika kesejahteraan turun ke angka 15-20 (di atas batas kritis modal 10).
 */
export function getKesejahteraanWarningMessage(value: number, dateStr: string): NotificationMessage {
  return {
    id: `kesejahteraan-warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: "⚠️ Peringatan Dini: Krisis Kesejahteraan Rakyat!",
    sender: "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan",
    message: `Lapor Presiden, Indeks Kesejahteraan Rakyat telah turun mencapai angka ${Math.round(value)}/100. Kurangnya fasilitas dasar seperti pendidikan, layanan kesehatan, dan infrastruktur publik mulai memicu penurunan kualitas hidup yang masif. Jika terus memburuk ke bawah angka 10, krisis kemanusiaan parah akan melanda negeri ini! Segera bangun sekolah, rumah sakit, tempat umum, atau salurkan program BLT.`,
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: Math.round(value),
    isRead: false
  };
}
