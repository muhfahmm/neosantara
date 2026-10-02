import { NotificationMessage } from '../1_kepuasan/kepuasanLogic';

/**
 * Logika pesan peringatan dini untuk Peringkat Presiden (Approval Rating).
 * Dipicu ketika peringkat turun ke angka 15-20 (di atas batas kritis modal 10).
 */
export function getPeringkatWarningMessage(value: number, dateStr: string): NotificationMessage {
  return {
    id: `peringkat-warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: "⚠️ Peringatan Dini: Kepercayaan Publik Menurun!",
    sender: "Kepala Staf Kepresidenan",
    message: `Presiden, tingkat kepercayaan rakyat (Peringkat Anda) telah merosot ke angka ${Math.round(value)}/100. Parlemen mulai memperhatikan tren negatif ini dan desas-desus oposisi tentang pemakzulan mulai terdengar. Jika peringkat terus merosot di bawah 10, Anda terancam dilengserkan! Tolong segera penuhi aspirasi rakyat, stabilkan harga, dan jaga kesejahteraan mereka.`,
    timestamp: dateStr,
    type: 'peringkat',
    value: Math.round(value),
    isRead: false
  };
}
