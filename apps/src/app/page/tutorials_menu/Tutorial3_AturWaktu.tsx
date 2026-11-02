import type { TutorialStep } from './tutorialTypes';

export const Tutorial3_AturWaktu: TutorialStep = {
  id: 'atur-waktu',
  title: 'Atur Waktu',
  body: 'Gunakan tombol mulai/jeda dan pengatur kecepatan untuk mengendalikan simulasi; kondisi negara berubah saat waktu berjalan. Coba mulai lalu jeda, atau lanjutkan setelah membaca.',
  targetSelector: '[data-tutorial="time-controller"], [data-tutorial="time-controller-play"], [data-tutorial="time-controller-speed"]',
  placement: 'top',
};
