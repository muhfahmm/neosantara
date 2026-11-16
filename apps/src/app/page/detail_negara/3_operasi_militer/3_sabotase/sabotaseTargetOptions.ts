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
    label: 'Gudang Logistik & Sembako',
    description: 'Membakar cadangan pangan, pasokan logistik bahan baku, atau jaringan distribusi perdagangan.',
  },
  {
    id: 'jaringan_komunikasi',
    label: 'Pusat Komunikasi & Radar',
    description: 'Merusak satelit komunikasi bawah tanah, antena radar pertahanan udara, dan jaringan kendali taktis.',
  },
];
