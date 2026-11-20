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
  effectivenessPercent: number; // Peluang sukses (%)
  effectivenessLabel: string;
  casualtyPercentRange: [number, number]; // [min%, max%] dari total massa
  casualtiesLabel: string;
  impactDescription: string;
  kepuasanPenalty: number;
  ratingPenalty: number;
  unNotificationRisk: 'none' | 'low' | 'high' | 'sanctions';
}

export const OPSI_BUBARKAN_MASSA: DetailOpsiBubarkan[] = [
  {
    id: 'water_cannon',
    title: 'side_inbox.demo.options.water_cannon.title',
    subtitle: 'side_inbox.demo.options.water_cannon.subtitle',
    icon: '💦',
    description: 'side_inbox.demo.options.water_cannon.description',
    cost: 50_000,
    effectivenessPercent: 40,
    effectivenessLabel: 'side_inbox.demo.options.water_cannon.effectiveness',
    casualtyPercentRange: [0, 0],
    casualtiesLabel: 'side_inbox.demo.options.water_cannon.casualties',
    impactDescription: 'side_inbox.demo.options.water_cannon.impact',
    kepuasanPenalty: 5,
    ratingPenalty: 2,
    unNotificationRisk: 'none',
  },
  {
    id: 'gas_air_mata',
    title: 'side_inbox.demo.options.gas_air_mata.title',
    subtitle: 'side_inbox.demo.options.gas_air_mata.subtitle',
    icon: '💨',
    description: 'side_inbox.demo.options.gas_air_mata.description',
    cost: 100_000,
    effectivenessPercent: 70,
    effectivenessLabel: 'side_inbox.demo.options.gas_air_mata.effectiveness',
    casualtyPercentRange: [1, 3],
    casualtiesLabel: 'side_inbox.demo.options.gas_air_mata.casualties',
    impactDescription: 'side_inbox.demo.options.gas_air_mata.impact',
    kepuasanPenalty: 10,
    ratingPenalty: 5,
    unNotificationRisk: 'low',
  },
  {
    id: 'jam_malam',
    title: 'side_inbox.demo.options.jam_malam.title',
    subtitle: 'side_inbox.demo.options.jam_malam.subtitle',
    icon: '🚫',
    description: 'side_inbox.demo.options.jam_malam.description',
    cost: 150_000,
    effectivenessPercent: 75,
    effectivenessLabel: 'side_inbox.demo.options.jam_malam.effectiveness',
    casualtyPercentRange: [0, 0],
    casualtiesLabel: 'side_inbox.demo.options.jam_malam.casualties',
    impactDescription: 'side_inbox.demo.options.jam_malam.impact',
    kepuasanPenalty: 8,
    ratingPenalty: 5,
    unNotificationRisk: 'none',
  },
  {
    id: 'brimob',
    title: 'side_inbox.demo.options.brimob.title',
    subtitle: 'side_inbox.demo.options.brimob.subtitle',
    icon: '🛡️',
    description: 'side_inbox.demo.options.brimob.description',
    cost: 200_000,
    effectivenessPercent: 85,
    effectivenessLabel: 'side_inbox.demo.options.brimob.effectiveness',
    casualtyPercentRange: [5, 12],
    casualtiesLabel: 'side_inbox.demo.options.brimob.casualties',
    impactDescription: 'side_inbox.demo.options.brimob.impact',
    kepuasanPenalty: 15,
    ratingPenalty: 10,
    unNotificationRisk: 'high',
  },
  {
    id: 'militer',
    title: 'side_inbox.demo.options.militer.title',
    subtitle: 'side_inbox.demo.options.militer.subtitle',
    icon: '🪖',
    description: 'side_inbox.demo.options.militer.description',
    cost: 300_000,
    effectivenessPercent: 95,
    effectivenessLabel: 'side_inbox.demo.options.militer.effectiveness',
    casualtyPercentRange: [20, 35],
    casualtiesLabel: 'side_inbox.demo.options.militer.casualties',
    impactDescription: 'side_inbox.demo.options.militer.impact',
    kepuasanPenalty: 25,
    ratingPenalty: 20,
    unNotificationRisk: 'sanctions',
  },
];
