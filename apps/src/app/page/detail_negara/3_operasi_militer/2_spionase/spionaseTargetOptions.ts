export interface SpionaseTargetOption {
  id: string;
  label: string;
  description: string;
}

export const SPIONASE_TARGET_OPTIONS: SpionaseTargetOption[] = [
  {
    id: 'militer',
    label: 'Intelijen Militer & Pertahanan',
    description: 'Menyusup ke markas militer untuk mengungkap jumlah armada, teknologi tempur, dan kesiapan pasukan.',
  },
  {
    id: 'ekonomi',
    label: 'Intelijen Ekonomi & Anggaran',
    description: 'Mencari data cadangan kas negara, devisa rahasia, kapasitas produksi, dan jalur pasokan perdagangan.',
  },
  {
    id: 'teknologi',
    label: 'Intelijen Riset & Teknologi',
    description: 'Mencuri cetak biru penelitian strategis, riset nuklir, dan proyek rekayasa sains target.',
  },
  {
    id: 'politik',
    label: 'Intelijen Politik & Stabilitas',
    description: 'Memantau stabilitas rezim, tensi internal diplomatik, serta kelemahan tokoh-tokoh kunci pemerintahan.',
  },
];
