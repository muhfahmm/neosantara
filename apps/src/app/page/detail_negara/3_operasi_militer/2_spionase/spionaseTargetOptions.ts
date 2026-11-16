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
    description: 'Mengungkap saldo anggaran negara, tarif pajak, dan estimasi penerimaan pajak harian.',
  },
];
