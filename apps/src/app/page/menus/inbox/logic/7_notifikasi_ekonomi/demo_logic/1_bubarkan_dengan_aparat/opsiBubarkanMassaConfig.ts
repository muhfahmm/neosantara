export type OpsiBubarkanMassa =
  | 'water_cannon'
  | 'gas_air_mata'
  | 'brimob'
  | 'militer'
  | 'jam_malam';

export interface DetailOpsiBubarkan {
  id: OpsiBubarkanMassa;
  title: string;
  subtitle: string;
  icon: string; // Emoji
  description: string;
  cost: number;
  costLabel: string;
  effectivenessPercent: number; // Peluang sukses (%)
  effectivenessLabel: string;
  casualtiesRange: [number, number]; // [min, max]
  casualtiesLabel: string;
  impactDescription: string;
  kepuasanPenalty: number;
  ratingPenalty: number;
  unNotificationRisk: 'none' | 'low' | 'high' | 'sanctions';
}

export const OPSI_BUBARKAN_MASSA: DetailOpsiBubarkan[] = [
  {
    id: 'water_cannon',
    title: 'Water Cannon (Kamera Air)',
    subtitle: 'Semprotan Air Bertekanan Tinggi',
    icon: '💦',
    description: 'Menyemprotkan air bertekanan tinggi untuk membubarkan massa tanpa melukai secara fatal.',
    cost: 50_000,
    costLabel: '50.000 NEO',
    effectivenessPercent: 40,
    effectivenessLabel: 'Rendah (40% Peluang Bubar)',
    casualtiesRange: [0, 0],
    casualtiesLabel: '0 Korban Jiwa',
    impactDescription: 'Kepuasan -5, Peringkat -2. Jika gagal, massa makin agresif & mengolok-olok aparat.',
    kepuasanPenalty: 5,
    ratingPenalty: 2,
    unNotificationRisk: 'none',
  },
  {
    id: 'gas_air_mata',
    title: 'Gas Air Mata (Tear Gas)',
    subtitle: 'Pelepasan Gas CS Pengurai Kerumunan',
    icon: '💨',
    description: 'Menembakkan gas CS ke tengah kerumunan untuk memicu iritasi mata dan pernapasan.',
    cost: 100_000,
    costLabel: '100.000 NEO',
    effectivenessPercent: 70,
    effectivenessLabel: 'Sedang (70% Peluang Bubar)',
    casualtiesRange: [5, 20],
    casualtiesLabel: '5 - 20 Orang (Terinjak / Asma)',
    impactDescription: 'Kepuasan -10, Peringkat -5. Memicu notifikasi keprihatinan kecil dari PBB.',
    kepuasanPenalty: 10,
    ratingPenalty: 5,
    unNotificationRisk: 'low',
  },
  {
    id: 'jam_malam',
    title: 'Jam Malam & Blokade (Curfew)',
    subtitle: 'Darurat Sipil, Pemadaman Internet & Penutupan Jalan',
    icon: '🚫',
    description: 'Memberlakukan status darurat sipil, memutus akses jalan raya ibu kota, dan mematikan jaringan telekomunikasi internet.',
    cost: 150_000,
    costLabel: '150.000 NEO',
    effectivenessPercent: 75,
    effectivenessLabel: 'Sedang (Butuh Waktu 2 Hari)',
    casualtiesRange: [0, 0],
    casualtiesLabel: '0 Korban Jiwa',
    impactDescription: 'Kepuasan -8, Peringkat -5. Arus kas harian ekonomi negara melambat sementara karena aktivitas bisnis lumpuh.',
    kepuasanPenalty: 8,
    ratingPenalty: 5,
    unNotificationRisk: 'none',
  },
  {
    id: 'brimob',
    title: 'Brimob / Aparat Bersenjata (Riot Police)',
    subtitle: 'Pasukan Pengendali Huru-Hara Bertameng',
    icon: '🛡️',
    description: 'Mengirim pasukan antihuru-hara dengan tameng dan pentungan untuk menangkap dan memukul mundur demonstran.',
    cost: 200_000,
    costLabel: '200.000 NEO',
    effectivenessPercent: 85,
    effectivenessLabel: 'Tinggi (85% Peluang Bubar)',
    casualtiesRange: [50, 200],
    casualtiesLabel: '50 - 200 Korban Jiwa / Kritis',
    impactDescription: 'Kepuasan -15, Peringkat -10. Pasti memicu Kecaman Pelanggaran HAM PBB (Hubungan Diplomatik -20).',
    kepuasanPenalty: 15,
    ratingPenalty: 10,
    unNotificationRisk: 'high',
  },
  {
    id: 'militer',
    title: 'Militer / TNI (Bersenjata Lengkap)',
    subtitle: 'Pengerahan Ranpur, Tank & Personel Bersenjata',
    icon: '🪖',
    description: 'Menggunakan kendaraan lapis baja tempur, tank, dan senjata api untuk menakut-nakuti dan membubarkan massa secara represif.',
    cost: 300_000,
    costLabel: '300.000 NEO',
    effectivenessPercent: 95,
    effectivenessLabel: 'Sangat Tinggi (95% Peluang Bubar)',
    casualtiesRange: [300, 1000],
    casualtiesLabel: '300 - 1.000+ Korban Jiwa',
    impactDescription: 'Kepuasan -25, Peringkat -20. PBB langsung menggelar Rapat Darurat Sanksi Embargo Ekonomi!',
    kepuasanPenalty: 25,
    ratingPenalty: 20,
    unNotificationRisk: 'sanctions',
  },
];
