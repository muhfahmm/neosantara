import type { TutorialStep } from './tutorialTypes';

export const Tutorial2_TampilanUtama: TutorialStep = {
  id: 'tampilan-utama',
  title: 'Tampilan Utama',
  body: 'Peta menunjukkan wilayah negara; tanggal simulasi menunjukkan waktu dalam permainan. Anggaran menunjukkan kas dan saldo bersih, populasi menunjukkan jumlah penduduk, sedangkan kepuasan menggambarkan penilaian rakyat.',
  targetSelector: '[data-tutorial="navbar-ringkasan"]',
  placement: 'bottom',
};
