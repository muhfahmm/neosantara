import {
  Truck, BookOpen, Microscope, HeartPulse, Trophy, Gavel, Shield, Globe2,
  Palette, Plane, Leaf, Home, Building2, Handshake, Banknote, Coins,
  ShieldCheck, Siren, ShieldAlert, Ship, Ambulance
} from "lucide-react";

export interface Department {
  id: string;
  name: string;
  icon: React.ElementType;
  baseIncomeCost: number;
}

export const KEMENTERIAN: Department[] = [
  {
    id: "infrastruktur",
    name: "Kementerian Infrastruktur",
    icon: Truck,
    baseIncomeCost: 100,
  },
  {
    id: "pendidikan",
    name: "Kementerian Pendidikan",
    icon: BookOpen,
    baseIncomeCost: 100,
  },
  {
    id: "sains",
    name: "Sains dan Penelitian",
    icon: Microscope,
    baseIncomeCost: 100,
  },
  {
    id: "kesehatan",
    name: "Kementerian Kesehatan",
    icon: HeartPulse,
    baseIncomeCost: 100,
  },
  {
    id: "olahraga",
    name: "Kementerian Olahraga",
    icon: Trophy,
    baseIncomeCost: 100,
  },
  {
    id: "kehakiman",
    name: "Kementerian Kehakiman",
    icon: Gavel,
    baseIncomeCost: 100,
  },
  {
    id: "pertahanan",
    name: "Kementerian Pertahanan",
    icon: Shield,
    baseIncomeCost: 100,
  },
  {
    id: "luar-negeri",
    name: "Kementerian Luar Negeri",
    icon: Globe2,
    baseIncomeCost: 100,
  },
  {
    id: "kebudayaan",
    name: "Kementerian Kebudayaan",
    icon: Palette,
    baseIncomeCost: 100,
  },
  {
    id: "pariwisata",
    name: "Kementerian Pariwisata",
    icon: Plane,
    baseIncomeCost: 100,
  },
  {
    id: "lingkungan",
    name: "Kementerian Lingkungan Hidup",
    icon: Leaf,
    baseIncomeCost: 100,
  },
  {
    id: "perumahan",
    name: "Kementerian Perumahan",
    icon: Home,
    baseIncomeCost: 100,
  },
  {
    id: "pembangunan",
    name: "Kementerian Pembangunan",
    icon: Building2,
    baseIncomeCost: 100,
  },
  {
    id: "perdagangan",
    name: "Kementerian Perdagangan",
    icon: Handshake,
    baseIncomeCost: 100,
  },
  {
    id: "keuangan",
    name: "Kementerian Keuangan",
    icon: Banknote,
    baseIncomeCost: 100,
  },
];

export const KEAMANAN: Department[] = [
  {
    id: "dinas-keamanan",
    name: "Dinas Keamanan",
    icon: ShieldCheck,
    baseIncomeCost: 100,
  },
  {
    id: "polisi",
    name: "Polisi",
    icon: Siren,
    baseIncomeCost: 100,
  },
  {
    id: "garda-nasional",
    name: "Garda Nasional",
    icon: Shield,
    baseIncomeCost: 100,
  },
  {
    id: "komandan-angkatan-darat",
    name: "Komandan Angkatan Darat",
    icon: ShieldAlert,
    baseIncomeCost: 100,
  },
  {
    id: "komandan-armada",
    name: "Komandan Armada",
    icon: Ship,
    baseIncomeCost: 100,
  },
];

export const LAYANAN: Department[] = [
  {
    id: "layanan-darurat",
    name: "Layanan Darurat",
    icon: Ambulance,
    baseIncomeCost: 100,
  },
  {
    id: "bank-sentral",
    name: "Kepala Bank Sentral",
    icon: Coins,
    baseIncomeCost: 100,
  },
];

export const ALL_DEPARTMENTS = [...KEMENTERIAN, ...KEAMANAN, ...LAYANAN];

/**
 * Biaya operasional harian setiap departemen kabinet berdasarkan levelnya.
 * Index = level (0 = belum diaktifkan, 1-10 = tier aktif).
 * Satu-satunya sumber kebenaran untuk seluruh kalkulasi biaya kabinet.
 */
export const LEVEL_UP_COST = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

/** Kembalikan biaya harian sebuah departemen berdasarkan level aktifnya. */
export const getDailyMinistryCost = (level: number): number =>
  LEVEL_UP_COST[level] ?? 50;
