export interface SabotaseTargetOption {
  id: string;
  label: string;
  description: string;
}

export const SABOTASE_TARGET_OPTIONS: SabotaseTargetOption[] = [
  {
    id: 'pabrik_militer',
    label: 'Fasilitas & Pabrik Militer',
    description: 'Meledakkan gudang amunisi, pabrik tank, hanggar pesawat, atau dermaga kapal perang musuh.',
  },
  {
    id: 'infrastruktur_energi',
    label: 'Infrastruktur Listrik & Energi',
    description: 'Melumpuhkan gardu induk pembangkit listrik, kilang minyak, atau instalasi reaktor tenaga listrik.',
  },
  {
    id: 'rantai_pasok',
    label: 'Sabotase Produksi Pangan',
    description: 'Menghancurkan 5% bangunan produksi Peternakan, Agrikultur, Perikanan, dan Olahan Pangan (minimal 1 per jenis).',
  },
  {
    id: 'manufaktur',
    label: 'Sabotase Manufaktur',
    description: 'Menghancurkan 5% bangunan pabrik semikonduktor, mesin, besi, semen, dan kayu (minimal 1 per jenis).',
  },
];
