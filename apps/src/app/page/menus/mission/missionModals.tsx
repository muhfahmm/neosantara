'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Target, X, Compass, Award, Rocket,
  Music, Trophy, PartyPopper, Coins, Landmark, TrendingUp, TrendingDown, Zap,
  Battery, Droplet, Atom, Wind, Waves, Home, Building2, Swords, Plane,
  Ship, Radio, Play, Users2, HeartHandshake, Eye, Globe, Star, Shield,
  Utensils, Tag, FileText, CreditCard, Scale, HandHelping,
  Gem, Factory, Beef, Wheat, Fish, Milk, Activity, Smile, Microscope,
  Gavel, HeartPulse, Leaf, Siren, Ambulance, Banknote, BookOpen,
  Bike, Route, Bus, Train, Gamepad2, Film, Theater, Egg, Package,
  Sparkles, Crown,
  Gift,
} from 'lucide-react';
import { formatProductionProductName } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog';

interface MissionModalsProps {
  isOpen?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  onStartMission?: (destination: MissionNavigationTarget) => void;
}

export type MissionCategory =
  | 'event'
  | 'kesejahteraan'
  | 'ekonomi'
  | 'produksi'
  | 'pangan'
  | 'layanan_publik'
  | 'hunian'
  | 'penelitian'
  | 'pertahanan'
  | 'geopolitik'
  | 'resolusi_pbb'
  | 'resolusi_dk_pbb'
  | 'organisasi_pbb'
  | 'organisasi_regional'
  | 'sosial_budaya'
  | 'kementerian'
  | 'kabinet'
  | 'krisis'
  | 'populasi';

interface MissionCard {
  id: string;
  category: MissionCategory;
  categoryLabel: string;
  icon: React.ElementType;
  accent: string;
  title: string;
  progress?: string;
}

export interface MissionNavigationTarget {
  menuId: string;
  productionDeepLink?: { tab: string; key: string };
  tempatUmumTab?: string;
  openWelfareActions?: boolean;
}

// =====================================================================
// MAPPING KATEGORI → MENU
// =====================================================================
const MISSION_CATEGORY_MENU: Record<MissionCategory, string> = {
  event: 'Action:NaikkanKepuasan',
  kesejahteraan: 'Dashboard:Populasi:Overview',
  ekonomi: 'Menu:Pajak',
  produksi: 'Menu:Produksi',
  pangan: 'Menu:Produksi',
  layanan_publik: 'Menu:TempatUmum',
  hunian: 'Menu:HunianPermukiman',
  penelitian: 'Menu:Penelitian',
  pertahanan: 'Menu:Armada',
  geopolitik: 'Menu:KedutaanBesar',
  resolusi_pbb: 'Menu:PBB',
  resolusi_dk_pbb: 'Menu:PBB',
  organisasi_pbb: 'Menu:OrganisasiInternasional:organisasi_pbb',
  organisasi_regional: 'Menu:OrganisasiInternasional:organisasi_regional',
  sosial_budaya: 'Menu:Agama',
  kementerian: 'Dashboard:Kementerian',
  kabinet: 'Dashboard:Kementerian',
  krisis: 'Menu:TempatUmum',
  populasi: 'Dashboard:Populasi:Overview',
};

// =====================================================================
// MAPPING MISI → PRODUCTION KEY
// =====================================================================
const PRODUCTION_KEYS_BY_MISSION: Record<string, string> = {
  bangun_pltn: 'pembangkit_listrik_tenaga_nuklir',
  bangun_plta: 'pembangkit_listrik_tenaga_air',
  bangun_plts: 'pembangkit_listrik_tenaga_surya',
  bangun_pltu: 'pembangkit_listrik_tenaga_uap',
  bangun_pltg: 'pembangkit_listrik_tenaga_gas',
  bangun_pltb: 'pembangkit_listrik_tenaga_angin',
  bangun_pltp: 'pembangkit_listrik_tenaga_panas_bumi',
  bangun_plth: 'pembangkit_listrik_tenaga_hidrogen',
  bangun_pltgl: 'pembangkit_listrik_tenaga_gelombang_laut',
  bangun_pltfn: 'pembangkit_listrik_tenaga_fusi_nuklir',
  tambang_emas: 'emas',
  tambang_uranium: 'uranium',
  tambang_batu_bara: 'batu_bara',
  kilang_minyak_bumi: 'minyak_bumi',
  kilang_gas_alam: 'gas_alam',
  tambang_garam: 'garam',
  tambang_litium: 'litium',
  tambang_ltj: 'logam_tanah_jarang',
  tambang_bijih_besi: 'bijih_besi',
  pabrik_semikonduktor: 'pabrik_semikonduktor',
  pabrik_mesin: 'pabrik_mesin',
  pabrik_besi: 'pabrik_besi',
  pabrik_semen_beton: 'semen_beton',
  pabrik_kayu: 'kayu',
  peternakan_ayam: 'ayam_unggas',
  peternakan_sapi_perah: 'sapi_perah',
  peternakan_sapi_potong: 'sapi_potong',
  peternakan_domba: 'domba_kambing',
  sawah_padi: 'padi',
  ladang_gandum: 'gandum',
  ladang_jagung: 'jagung',
  kebun_sayur: 'sayur',
  ladang_umbi: 'umbi',
  ladang_kedelai: 'kedelai',
  kebun_sawit: 'kelapa_sawit',
  kebun_kopi: 'kopi',
  kebun_teh: 'teh',
  kebun_kakao: 'kakao',
  kebun_tebu: 'tebu',
  kebun_karet: 'karet',
  tambak_udang: 'udang',
  budidaya_mutiara: 'mutiara',
  perikanan_ikan: 'ikan',
  pabrik_air_mineral: 'air_mineral',
  pabrik_gula: 'gula',
  pabrik_roti: 'roti',
  pabrik_daging: 'pengolahan_daging',
  pabrik_mie_instan: 'mie_instan',
  pabrik_minyak_goreng: 'minyak_goreng',
  pabrik_susu: 'susu',
  pabrik_beras: 'beras',
};

// =====================================================================
// SISTEM HADIAH BERJENJANG (Progressive Scaling)
// =====================================================================
const MISSION_COMPLETION_STORAGE_KEY = 'presiden_simulator_mission_completions';

const NEO_REWARD_TIERS = [5000, 7500, 10000, 12500, 15000, 17500, 20000, 22500, 25000] as const;
const NEO_BASE_INCREMENT = 2500;

const SDA_REWARD_TIERS = [5000, 10000, 15000, 20000, 25000] as const;
const SDA_BASE_INCREMENT = 5000;

export const MIN_DIAMOND_REWARD = 5;
export const MAX_DIAMOND_REWARD = 100;
export const DIAMOND_TIER_INCREMENT = 5;

export function getProgressiveDiamondReward(completionCount = 0): number {
  const safeCount = Math.max(0, Math.floor(completionCount));
  const calculated = MIN_DIAMOND_REWARD + safeCount * DIAMOND_TIER_INCREMENT;
  return Math.min(calculated, MAX_DIAMOND_REWARD);
}

export function getMissionCompletionsMap(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(MISSION_COMPLETION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getMissionCompletionCount(cardId: string): number {
  const map = getMissionCompletionsMap();
  return Number(map[cardId]) || 0;
}

export function recordMissionCompletion(cardId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const map = getMissionCompletionsMap();
    const nextCount = (Number(map[cardId]) || 0) + 1;
    map[cardId] = nextCount;
    localStorage.setItem(MISSION_COMPLETION_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('mission_completions_updated', { detail: { cardId, count: nextCount } }));
    return nextCount;
  } catch {
    return 0;
  }
}

export function getProgressiveNeoReward(completionCount = 0): number {
  const safeCount = Math.max(0, Math.floor(completionCount));
  if (safeCount < NEO_REWARD_TIERS.length) {
    return NEO_REWARD_TIERS[safeCount];
  }
  const maxTier = NEO_REWARD_TIERS[NEO_REWARD_TIERS.length - 1];
  const extraLevels = safeCount - (NEO_REWARD_TIERS.length - 1);
  return maxTier + extraLevels * NEO_BASE_INCREMENT;
}

export function getProgressiveSdaReward(completionCount = 0): number {
  const safeCount = Math.max(0, Math.floor(completionCount));
  if (safeCount < SDA_REWARD_TIERS.length) {
    return SDA_REWARD_TIERS[safeCount];
  }
  const maxTier = SDA_REWARD_TIERS[SDA_REWARD_TIERS.length - 1];
  const extraLevels = safeCount - (SDA_REWARD_TIERS.length - 1);
  return maxTier + extraLevels * SDA_BASE_INCREMENT;
}

// =====================================================================
// SISTEM REWARD BADGE
// =====================================================================
interface MissionRewardBadges {
  neo?: number;
  sda?: { amount: number; productKey: string };
  diamond: number;
}

function getMissionRewardBadges(card: MissionCard, completionCount = 0): MissionRewardBadges {
  const productKey = PRODUCTION_KEYS_BY_MISSION[card.id];
  const productRewardCategories = [
    'Mineral & Energi',
    'Manufaktur',
    'Peternakan',
    'Agrikultur',
    'Perikanan',
    'Olahan Pangan',
  ];

  const diamond = getProgressiveDiamondReward(completionCount);

  if (productKey && productRewardCategories.includes(card.categoryLabel)) {
    return {
      sda: {
        amount: getProgressiveSdaReward(completionCount),
        productKey,
      },
      diamond,
    };
  }

  return {
    neo: getProgressiveNeoReward(completionCount),
    diamond,
  };
}

// =====================================================================
// ROUTING MISI
// =====================================================================
function getMissionRoute(mission: Pick<MissionCard, 'id' | 'category'>): MissionNavigationTarget {
  const { id, category } = mission;
  let menuId = MISSION_CATEGORY_MENU[category];
  const target: MissionNavigationTarget = { menuId };

  if (category === 'ekonomi') {
    if (id.startsWith('pinjam_') || id === 'hutang_lunas') menuId = 'Menu:Hutang';
    else if (id === 'harga_pokok') menuId = 'Menu:Harga';
    else if (id === 'sistem_ekonomi') menuId = 'Menu:SistemEkonomi';
    else if (id === 'subsidi') menuId = 'Menu:KebijakanSubsidi';
    else if (id === 'ekspor_perdagangan' || id === 'impor_perdagangan') menuId = 'Menu:Perdagangan';
    else if (id === 'surplus_apbn') menuId = 'Menu:Budget';
    else if (id === 'pdb_ranking') menuId = 'Menu:PDB';
  }

  if (category === 'pertahanan') {
    if (id.startsWith('operasi_spionase') || id.startsWith('operasi_sabotase')) menuId = 'Menu:Intelijen';
    else if (id === 'operasi_serang_negara') menuId = 'Menu:SerangNegara';
    else if (id === 'pertahankan_wilayah') menuId = 'Menu:WilayahDirebut';
    else if (id === 'program_icbm' || id === 'silo_nuklir') menuId = 'Menu:ICBM';
  }

  if (category === 'geopolitik') {
    if (id === 'naikkan_hubungan') menuId = 'Menu:TingkatHubungan';
  }

  if (category === 'sosial_budaya') {
    if (id.includes('ideologi')) menuId = 'Menu:Ideologi';
    else if (id === 'doktrin_keterbukaan') menuId = 'Menu:DoktrinKeterbukaan';
  }

  if (category === 'krisis' && id === 'krisis_klaim_hadiah') menuId = 'Menu:Hadiah';

  if (category === 'populasi') {
    if (id === 'hapus_tunawisma') menuId = 'Menu:HunianPermukiman';
    else if (id === 'tekan_kematian') menuId = 'Menu:TempatUmum';
  }

  target.menuId = menuId;

  if (category === 'produksi' || category === 'pangan') {
    const key = PRODUCTION_KEYS_BY_MISSION[id];
    if (key) {
      let tab = 'kelistrikan';
      if (category === 'pangan') {
        tab = id.startsWith('peternakan_')
          ? 'peternakan'
          : id.startsWith('sawah_') || id.startsWith('ladang_') || id.startsWith('kebun_')
            ? 'agrikultur'
            : id.startsWith('budidaya_') || id.startsWith('perikanan_')
              ? 'perikanan'
              : 'olahan pangan';
      } else if (id.startsWith('tambang_') || id.startsWith('kilang_')) {
        tab = 'mineral';
      } else if (id.startsWith('pabrik_')) {
        tab = 'manufaktur';
      }
      target.productionDeepLink = { tab, key };
    }
  }

  if (category === 'layanan_publik') {
    target.tempatUmumTab = id.startsWith('edukasi_')
      ? 'pendidikan'
      : id.startsWith('medis_')
        ? 'kesehatan'
        : id.startsWith('hukum_')
          ? 'penegakan_hukum'
          : id.startsWith('sport_')
            ? 'olahraga_hiburan'
            : id.startsWith('komersial_')
              ? 'komersial'
              : 'infrastruktur';
  }

  if (category === 'kesejahteraan' || id === 'indeks_kesejahteraan') {
    target.openWelfareActions = true;
  }

  return target;
}

/** Helper untuk menambah saldo player_diamonds */
export function addPlayerDiamonds(amount: number): number {
  if (typeof window === 'undefined' || amount <= 0) return 0;
  try {
    const saved = localStorage.getItem('player_diamonds');
    const current = saved !== null ? parseInt(saved, 10) || 0 : 150;
    const nextTotal = current + amount;
    localStorage.setItem('player_diamonds', nextTotal.toString());
    window.dispatchEvent(new CustomEvent('player_diamonds_updated', { detail: { diamonds: nextTotal, added: amount } }));
    return nextTotal;
  } catch {
    return 0;
  }
}

// =====================================================================
// DATA MISI
// =====================================================================
const MISSION_CARDS: MissionCard[] = [
  // ═══ 1. GELAR ACARA ═══
  { id: 'event_konser',           category: 'event', categoryLabel: 'Gelar Acara', icon: Music,        accent: '#FBBF24', title: 'Konser Musik Nasional' },
  { id: 'event_festival',         category: 'event', categoryLabel: 'Gelar Acara', icon: PartyPopper,  accent: '#FBBF24', title: 'Festival Budaya Nusantara' },
  { id: 'event_karnaval',         category: 'event', categoryLabel: 'Gelar Acara', icon: Trophy,       accent: '#FBBF24', title: 'Karnaval Rakyat Raya' },
  { id: 'event_piala_davis',      category: 'event', categoryLabel: 'Gelar Acara', icon: Trophy,       accent: '#FBBF24', title: 'Turnamen Piala Davis' },
  { id: 'event_piala_rugbi',      category: 'event', categoryLabel: 'Gelar Acara', icon: Trophy,       accent: '#FBBF24', title: 'Piala Dunia Rugbi' },
  { id: 'event_olimpiade',        category: 'event', categoryLabel: 'Gelar Acara', icon: Award,        accent: '#FBBF24', title: 'Penyelenggaraan Olimpiade' },
  { id: 'event_piala_fifa',       category: 'event', categoryLabel: 'Gelar Acara', icon: Trophy,       accent: '#FBBF24', title: 'Piala Dunia Sepak Bola FIFA' },
  { id: 'event_balap_f1',         category: 'event', categoryLabel: 'Gelar Acara', icon: Rocket,       accent: '#FBBF24', title: 'Grand Prix Balap F1' },
  { id: 'kepuasan_target',        category: 'event', categoryLabel: 'Gelar Acara', icon: Smile,        accent: '#FBBF24', title: 'Capai Indeks Kepuasan Rakyat 80%' },

  // ═══ 2. KESEJAHTERAAN ═══
  { id: 'kes_bantuan_tunai',      category: 'kesejahteraan', categoryLabel: 'Bantuan Sosial', icon: Banknote,   accent: '#22D3EE', title: 'Bantuan Tunai Langsung' },
  { id: 'kes_subsidi_pangan',     category: 'kesejahteraan', categoryLabel: 'Bantuan Sosial', icon: Wheat,      accent: '#22D3EE', title: 'Subsidi Pangan Pokok' },
  { id: 'kes_bantuan_pendidikan', category: 'kesejahteraan', categoryLabel: 'Bantuan Sosial', icon: BookOpen,   accent: '#22D3EE', title: 'Bantuan Pendidikan Siswa' },
  { id: 'kes_jaminan_kesehatan',  category: 'kesejahteraan', categoryLabel: 'Bantuan Sosial', icon: HeartPulse, accent: '#22D3EE', title: 'Jaminan Kesehatan Universal' },
  { id: 'kes_perbaikan_rumah',    category: 'kesejahteraan', categoryLabel: 'Bantuan Sosial', icon: Home,       accent: '#22D3EE', title: 'Perbaikan Perumahan Rakyat' },
  { id: 'kes_pasar_murah',        category: 'kesejahteraan', categoryLabel: 'Bantuan Sosial', icon: Tag,        accent: '#22D3EE', title: 'Pasar Murah Nasional' },

  // ═══ 3. SISTEM EKONOMI ═══
  { id: 'pajak_naik',             category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: TrendingUp,   accent: '#00FFAA', title: 'Naikkan Tarif Pajak' },
  { id: 'pajak_turun',            category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: TrendingDown, accent: '#00FFAA', title: 'Turunkan Tarif Pajak' },
  { id: 'pajak_kelola',           category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: FileText,     accent: '#00FFAA', title: 'Manajemen Kebijakan Pajak' },
  { id: 'pinjam_bank',            category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: Landmark,     accent: '#00FFAA', title: 'Pinjam dari Bank Internasional' },
  { id: 'pinjam_negara',          category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: Coins,        accent: '#00FFAA', title: 'Pinjam dari Negara Lain' },
  { id: 'hutang_lunas',           category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: CreditCard,   accent: '#00FFAA', title: 'Lunasi Cicilan Pinjaman & Hutang' },
  { id: 'harga_pokok',            category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: Tag,          accent: '#00FFAA', title: 'Sesuaikan Harga Barang Pokok' },
  { id: 'sistem_ekonomi',         category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: Scale,        accent: '#00FFAA', title: 'Perubahan Sistem Ekonomi' },
  { id: 'subsidi',                category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: HandHelping,  accent: '#00FFAA', title: 'Alokasi & Kebijakan Subsidi' },
  { id: 'ekspor_perdagangan',     category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: Coins,        accent: '#00FFAA', title: 'Ekspor Komoditas Perdagangan' },
  { id: 'impor_perdagangan',      category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: Coins,        accent: '#00FFAA', title: 'Impor Kebutuhan Barang Pokok' },
  { id: 'surplus_apbn',           category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: TrendingUp,   accent: '#00FFAA', title: 'Capai Surplus Anggaran APBN' },
  { id: 'pdb_ranking',            category: 'ekonomi', categoryLabel: 'Sistem Ekonomi', icon: Trophy,       accent: '#00FFAA', title: 'Naikkan Peringkat PDB Nasional' },

  // ═══ 4. PRODUKSI — KELISTRIKAN ═══
  { id: 'bangun_pltn',            category: 'produksi', categoryLabel: 'Kelistrikan', icon: Atom,      accent: '#8B5CF6', title: 'PLT Nuklir (PLTN)',            progress: '12 / 400' },
  { id: 'bangun_plta',            category: 'produksi', categoryLabel: 'Kelistrikan', icon: Droplet,   accent: '#8B5CF6', title: 'PLT Air (PLTA)',               progress: '297 / 400' },
  { id: 'bangun_plts',            category: 'produksi', categoryLabel: 'Kelistrikan', icon: Zap,       accent: '#8B5CF6', title: 'PLT Surya (PLTS)',             progress: '391 / 400' },
  { id: 'bangun_pltu',            category: 'produksi', categoryLabel: 'Kelistrikan', icon: Factory,   accent: '#8B5CF6', title: 'PLT Uap (PLTU)',               progress: '1 / 400' },
  { id: 'bangun_pltg',            category: 'produksi', categoryLabel: 'Kelistrikan', icon: Zap,       accent: '#8B5CF6', title: 'PLT Gas (PLTG)',               progress: '7 / 400' },
  { id: 'bangun_pltb',            category: 'produksi', categoryLabel: 'Kelistrikan', icon: Wind,      accent: '#8B5CF6', title: 'PLT Angin (PLTB)',             progress: '254 / 400' },
  { id: 'bangun_pltp',            category: 'produksi', categoryLabel: 'Kelistrikan', icon: Waves,     accent: '#8B5CF6', title: 'PLT Panas Bumi (PLTP)',        progress: '0 / 400' },
  { id: 'bangun_plth',            category: 'produksi', categoryLabel: 'Kelistrikan', icon: Battery,   accent: '#8B5CF6', title: 'PLT Hidrogen (PLTH)',          progress: '0 / 400' },
  { id: 'bangun_pltgl',           category: 'produksi', categoryLabel: 'Kelistrikan', icon: Waves,     accent: '#8B5CF6', title: 'PLT Gelombang Laut (PLTGL)',   progress: '0 / 400' },
  { id: 'bangun_pltfn',           category: 'produksi', categoryLabel: 'Kelistrikan', icon: Atom,      accent: '#8B5CF6', title: 'PLT Fusi Nuklir (PLTFN)',      progress: '0 / 400' },

  // ═══ 5. PRODUKSI — MINERAL & ENERGI ═══
  { id: 'tambang_emas',           category: 'produksi', categoryLabel: 'Mineral & Energi', icon: Gem,      accent: '#8B5CF6', title: 'Tambang Emas',                  progress: '30 / 600' },
  { id: 'tambang_uranium',        category: 'produksi', categoryLabel: 'Mineral & Energi', icon: Atom,     accent: '#8B5CF6', title: 'Tambang Uranium',               progress: '16 / 0' },
  { id: 'tambang_batu_bara',      category: 'produksi', categoryLabel: 'Mineral & Energi', icon: Gem,      accent: '#8B5CF6', title: 'Tambang Batu Bara',             progress: '53 / 0' },
  { id: 'kilang_minyak_bumi',     category: 'produksi', categoryLabel: 'Mineral & Energi', icon: Droplet,  accent: '#8B5CF6', title: 'Kilang Minyak Bumi',            progress: '51 / 0' },
  { id: 'kilang_gas_alam',        category: 'produksi', categoryLabel: 'Mineral & Energi', icon: Wind,     accent: '#8B5CF6', title: 'Kilang Gas Alam',               progress: '26 / 0' },
  { id: 'tambang_garam',          category: 'produksi', categoryLabel: 'Mineral & Energi', icon: Gem,      accent: '#8B5CF6', title: 'Tambang Garam',                 progress: '27 / 0' },
  { id: 'tambang_litium',         category: 'produksi', categoryLabel: 'Mineral & Energi', icon: Battery,  accent: '#8B5CF6', title: 'Tambang Litium',                progress: '9 / 0' },
  { id: 'tambang_ltj',            category: 'produksi', categoryLabel: 'Mineral & Energi', icon: Gem,      accent: '#8B5CF6', title: 'Tambang Logam Tanah Jarang',    progress: '9 / 0' },
  { id: 'tambang_bijih_besi',     category: 'produksi', categoryLabel: 'Mineral & Energi', icon: Gem,      accent: '#8B5CF6', title: 'Tambang Bijih Besi',            progress: '150 / 0' },

  // ═══ 6. PRODUKSI — MANUFAKTUR ═══
  { id: 'pabrik_semikonduktor',   category: 'produksi', categoryLabel: 'Manufaktur', icon: Factory,   accent: '#8B5CF6', title: 'Pabrik Semikonduktor',          progress: '3795 / 0' },
  { id: 'pabrik_mesin',           category: 'produksi', categoryLabel: 'Manufaktur', icon: Factory,   accent: '#8B5CF6', title: 'Pabrik Mesin Mobil & Motor',    progress: '4807 / 0' },
  { id: 'pabrik_besi',            category: 'produksi', categoryLabel: 'Manufaktur', icon: Factory,   accent: '#8B5CF6', title: 'Pabrik Besi Baja',              progress: '49 / 0' },
  { id: 'pabrik_semen_beton',     category: 'produksi', categoryLabel: 'Manufaktur', icon: Building2, accent: '#8B5CF6', title: 'Pabrik Semen Beton',            progress: '3795 / 0' },
  { id: 'pabrik_kayu',            category: 'produksi', categoryLabel: 'Manufaktur', icon: Leaf,      accent: '#8B5CF6', title: 'Pabrik Pengolahan Kayu',        progress: '3289 / 0' },

  // ═══ 7. PANGAN — PETERNAKAN ═══
  { id: 'peternakan_ayam',        category: 'pangan', categoryLabel: 'Peternakan', icon: Egg,   accent: '#F97316', title: 'Peternakan Ayam Unggas',        progress: '1409 / 0' },
  { id: 'peternakan_sapi_perah',  category: 'pangan', categoryLabel: 'Peternakan', icon: Milk,  accent: '#F97316', title: 'Peternakan Sapi Perah',         progress: '1127 / 0' },
  { id: 'peternakan_sapi_potong', category: 'pangan', categoryLabel: 'Peternakan', icon: Beef,  accent: '#F97316', title: 'Peternakan Sapi Potong',        progress: '939 / 0' },
  { id: 'peternakan_domba',       category: 'pangan', categoryLabel: 'Peternakan', icon: Beef,  accent: '#F97316', title: 'Peternakan Domba & Kambing',    progress: '392 / 0' },

  // ═══ 8. PANGAN — AGRIKULTUR ═══
  { id: 'sawah_padi',             category: 'pangan', categoryLabel: 'Agrikultur', icon: Wheat, accent: '#F97316', title: 'Sawah Padi',                    progress: '2465 / 0' },
  { id: 'ladang_gandum',          category: 'pangan', categoryLabel: 'Agrikultur', icon: Wheat, accent: '#F97316', title: 'Ladang Gandum',                 progress: '2254 / 0' },
  { id: 'ladang_jagung',          category: 'pangan', categoryLabel: 'Agrikultur', icon: Wheat, accent: '#F97316', title: 'Ladang Jagung',                 progress: '3169 / 0' },
  { id: 'kebun_sayur',            category: 'pangan', categoryLabel: 'Agrikultur', icon: Leaf,  accent: '#F97316', title: 'Kebun Sayur Mayur',             progress: '6500 / 0' },
  { id: 'ladang_umbi',            category: 'pangan', categoryLabel: 'Agrikultur', icon: Wheat, accent: '#F97316', title: 'Ladang Umbi-umbian',            progress: '5634 / 0' },
  { id: 'ladang_kedelai',         category: 'pangan', categoryLabel: 'Agrikultur', icon: Wheat, accent: '#F97316', title: 'Ladang Kedelai',                progress: '8450 / 0' },
  { id: 'kebun_sawit',            category: 'pangan', categoryLabel: 'Agrikultur', icon: Leaf,  accent: '#F97316', title: 'Kebun Kelapa Sawit',            progress: '939 / 0' },
  { id: 'kebun_kopi',             category: 'pangan', categoryLabel: 'Agrikultur', icon: Leaf,  accent: '#F97316', title: 'Kebun Kopi',                    progress: '2790 / 0' },
  { id: 'kebun_teh',              category: 'pangan', categoryLabel: 'Agrikultur', icon: Leaf,  accent: '#F97316', title: 'Kebun Teh',                     progress: '3380 / 0' },
  { id: 'kebun_kakao',            category: 'pangan', categoryLabel: 'Agrikultur', icon: Leaf,  accent: '#F97316', title: 'Kebun Kakao',                   progress: '5634 / 0' },
  { id: 'kebun_tebu',             category: 'pangan', categoryLabel: 'Agrikultur', icon: Wheat, accent: '#F97316', title: 'Kebun Tebu',                    progress: '2486 / 0' },
  { id: 'kebun_karet',            category: 'pangan', categoryLabel: 'Agrikultur', icon: Leaf,  accent: '#F97316', title: 'Kebun Karet',                   progress: '805 / 0' },

  // ═══ 9. PANGAN — PERIKANAN ═══
  { id: 'tambak_udang',           category: 'pangan', categoryLabel: 'Perikanan', icon: Fish, accent: '#F97316', title: 'Tambak Udang',                  progress: '4507 / 0' },
  { id: 'budidaya_mutiara',       category: 'pangan', categoryLabel: 'Perikanan', icon: Gem,  accent: '#F97316', title: 'Budidaya Mutiara',              progress: '904 / 0' },
  { id: 'perikanan_ikan',         category: 'pangan', categoryLabel: 'Perikanan', icon: Fish, accent: '#F97316', title: 'Tambak & Armada Ikan',          progress: '11736 / 0' },

  // ═══ 10. PANGAN — OLAHAN PANGAN ═══
  { id: 'pabrik_air_mineral',     category: 'pangan', categoryLabel: 'Olahan Pangan', icon: Droplet,   accent: '#F97316', title: 'Pabrik Air Mineral',            progress: '70 / 0' },
  { id: 'pabrik_gula',            category: 'pangan', categoryLabel: 'Olahan Pangan', icon: Package,   accent: '#F97316', title: 'Pabrik Gula',                   progress: '9 / 0' },
  { id: 'pabrik_roti',            category: 'pangan', categoryLabel: 'Olahan Pangan', icon: Utensils,  accent: '#F97316', title: 'Pabrik Roti',                   progress: '1683 / 0' },
  { id: 'pabrik_daging',          category: 'pangan', categoryLabel: 'Olahan Pangan', icon: Beef,      accent: '#F97316', title: 'Pengolahan Daging',             progress: '1174 / 0' },
  { id: 'pabrik_mie_instan',      category: 'pangan', categoryLabel: 'Olahan Pangan', icon: Utensils,  accent: '#F97316', title: 'Pabrik Mie Instan',             progress: '705 / 0' },
  { id: 'pabrik_minyak_goreng',   category: 'pangan', categoryLabel: 'Olahan Pangan', icon: Droplet,   accent: '#F97316', title: 'Pabrik Minyak Goreng',          progress: '563 / 0' },
  { id: 'pabrik_susu',            category: 'pangan', categoryLabel: 'Olahan Pangan', icon: Milk,      accent: '#F97316', title: 'Pabrik Susu & Olahan',          progress: '1174 / 0' },
  { id: 'pabrik_beras',           category: 'pangan', categoryLabel: 'Olahan Pangan', icon: Wheat,     accent: '#F97316', title: 'Pabrik Penggilingan Beras',     progress: '1643 / 0' },

  // ═══ 11. LAYANAN PUBLIK — INFRASTRUKTUR ═══
  { id: 'infra_jalur_sepeda',     category: 'layanan_publik', categoryLabel: 'Infrastruktur', icon: Bike,    accent: '#0EA5E9', title: 'Jalur Sepeda',                  progress: '4.335' },
  { id: 'infra_jalan_raya',       category: 'layanan_publik', categoryLabel: 'Infrastruktur', icon: Route,   accent: '#0EA5E9', title: 'Jalan Raya Nasional',           progress: '8.127' },
  { id: 'infra_terminal_bus',     category: 'layanan_publik', categoryLabel: 'Infrastruktur', icon: Bus,     accent: '#0EA5E9', title: 'Terminal Bus',                  progress: '3.251' },
  { id: 'infra_stasiun_kereta',   category: 'layanan_publik', categoryLabel: 'Infrastruktur', icon: Train,   accent: '#0EA5E9', title: 'Stasiun Kereta Api',            progress: '2.168' },
  { id: 'infra_kereta_bawah',     category: 'layanan_publik', categoryLabel: 'Infrastruktur', icon: Train,   accent: '#0EA5E9', title: 'Kereta Bawah Tanah',            progress: '271' },
  { id: 'infra_pelabuhan',        category: 'layanan_publik', categoryLabel: 'Infrastruktur', icon: Ship,    accent: '#0EA5E9', title: 'Pelabuhan Internasional',       progress: '1.084' },
  { id: 'infra_bandara',          category: 'layanan_publik', categoryLabel: 'Infrastruktur', icon: Plane,   accent: '#0EA5E9', title: 'Bandara Internasional',         progress: '813' },
  { id: 'infra_helipad',          category: 'layanan_publik', categoryLabel: 'Infrastruktur', icon: Plane,   accent: '#0EA5E9', title: 'Helipad & Pangkalan Udara Sipil', progress: '1.355' },

  // ═══ 12. LAYANAN PUBLIK — PENDIDIKAN ═══
  { id: 'edukasi_prasekolah',     category: 'layanan_publik', categoryLabel: 'Pendidikan', icon: BookOpen,   accent: '#0EA5E9', title: 'Pras Binaan & PAUD',            progress: '11.034' },
  { id: 'edukasi_dasar',          category: 'layanan_publik', categoryLabel: 'Pendidikan', icon: BookOpen,   accent: '#0EA5E9', title: 'Sekolah Dasar',                 progress: '14.186' },
  { id: 'edukasi_menengah',       category: 'layanan_publik', categoryLabel: 'Pendidikan', icon: BookOpen,   accent: '#0EA5E9', title: 'Sekolah Menengah',              progress: '12.610' },
  { id: 'edukasi_lanjutan',       category: 'layanan_publik', categoryLabel: 'Pendidikan', icon: BookOpen,   accent: '#0EA5E9', title: 'Sekolah Lanjutan Atas',         progress: '9.458' },
  { id: 'edukasi_universitas',    category: 'layanan_publik', categoryLabel: 'Pendidikan', icon: BookOpen,   accent: '#0EA5E9', title: 'Universitas Negeri',            progress: '4.729' },
  { id: 'edukasi_lembaga',        category: 'layanan_publik', categoryLabel: 'Pendidikan', icon: BookOpen,   accent: '#0EA5E9', title: 'Lembaga Pendidikan Khusus',     progress: '3.941' },
  { id: 'edukasi_laboratorium',   category: 'layanan_publik', categoryLabel: 'Pendidikan', icon: Microscope, accent: '#0EA5E9', title: 'Laboratorium Riset',            progress: '2.365' },
  { id: 'edukasi_observatorium',  category: 'layanan_publik', categoryLabel: 'Pendidikan', icon: Microscope, accent: '#0EA5E9', title: 'Observatorium Astronomi',       progress: '789' },
  { id: 'edukasi_pusat_riset',    category: 'layanan_publik', categoryLabel: 'Pendidikan', icon: Microscope, accent: '#0EA5E9', title: 'Pusat Penelitian Nasional',     progress: '2.365' },
  { id: 'edukasi_pusat_kembang',  category: 'layanan_publik', categoryLabel: 'Pendidikan', icon: Microscope, accent: '#0EA5E9', title: 'Pusat Pengembangan Teknologi',  progress: '2.365' },

  // ═══ 13. LAYANAN PUBLIK — KESEHATAN ═══
  { id: 'medis_rs_besar',         category: 'layanan_publik', categoryLabel: 'Kesehatan', icon: HeartPulse, accent: '#0EA5E9', title: 'Rumah Sakit Besar',             progress: '4.624' },
  { id: 'medis_rs_kecil',         category: 'layanan_publik', categoryLabel: 'Kesehatan', icon: HeartPulse, accent: '#0EA5E9', title: 'Rumah Sakit Kecil',             progress: '13.871' },
  { id: 'medis_pusat_diagnostik', category: 'layanan_publik', categoryLabel: 'Kesehatan', icon: Activity,   accent: '#0EA5E9', title: 'Pusat Diagnostik',              progress: '6.936' },

  // ═══ 14. LAYANAN PUBLIK — PENEGAKAN HUKUM ═══
  { id: 'hukum_bantuan',          category: 'layanan_publik', categoryLabel: 'Penegakan Hukum', icon: Gavel,  accent: '#0EA5E9', title: 'Pusat Bantuan Hukum',           progress: '5.780' },
  { id: 'hukum_pengadilan',       category: 'layanan_publik', categoryLabel: 'Penegakan Hukum', icon: Gavel,  accent: '#0EA5E9', title: 'Pengadilan Negeri',             progress: '7.706' },
  { id: 'hukum_kejaksaan',        category: 'layanan_publik', categoryLabel: 'Penegakan Hukum', icon: Gavel,  accent: '#0EA5E9', title: 'Kejaksaan Agung',               progress: '5.780' },
  { id: 'hukum_pos_polisi',       category: 'layanan_publik', categoryLabel: 'Penegakan Hukum', icon: Siren,  accent: '#0EA5E9', title: 'Pos Polisi',                    progress: '14.448' },
  { id: 'hukum_akademi_polisi',   category: 'layanan_publik', categoryLabel: 'Penegakan Hukum', icon: Shield, accent: '#0EA5E9', title: 'Akademi Kepolisian',            progress: '1.927' },

  // ═══ 15. LAYANAN PUBLIK — OLAHRAGA & HIBURAN ═══
  { id: 'sport_kolam_renang',     category: 'layanan_publik', categoryLabel: 'Olahraga & Hiburan', icon: Waves,    accent: '#0EA5E9', title: 'Kolam Renang Umum',             progress: '8.669' },
  { id: 'sport_sirkuit_balap',    category: 'layanan_publik', categoryLabel: 'Olahraga & Hiburan', icon: Rocket,   accent: '#0EA5E9', title: 'Sirkuit Balap',                 progress: '867' },
  { id: 'sport_stadion',          category: 'layanan_publik', categoryLabel: 'Olahraga & Hiburan', icon: Trophy,   accent: '#0EA5E9', title: 'Stadion Nasional',              progress: '4.335' },
  { id: 'sport_stadion_intl',     category: 'layanan_publik', categoryLabel: 'Olahraga & Hiburan', icon: Trophy,   accent: '#0EA5E9', title: 'Stadion Internasional',         progress: '867' },
  { id: 'sport_gym',              category: 'layanan_publik', categoryLabel: 'Olahraga & Hiburan', icon: Activity, accent: '#0EA5E9', title: 'Gym & Pusat Kebugaran',         progress: '17.338' },
  { id: 'sport_golf',             category: 'layanan_publik', categoryLabel: 'Olahraga & Hiburan', icon: Trophy,   accent: '#0EA5E9', title: 'Lapangan Golf',                 progress: '2.601' },
  { id: 'sport_esports',          category: 'layanan_publik', categoryLabel: 'Olahraga & Hiburan', icon: Gamepad2, accent: '#0EA5E9', title: 'Arena Esports',                 progress: '3.468' },
  { id: 'sport_gokart',           category: 'layanan_publik', categoryLabel: 'Olahraga & Hiburan', icon: Rocket,   accent: '#0EA5E9', title: 'Sirkuit Gokart',                progress: '4.335' },
  { id: 'sport_bioskop',          category: 'layanan_publik', categoryLabel: 'Olahraga & Hiburan', icon: Film,     accent: '#0EA5E9', title: 'Bioskop & Cinema',              progress: '20.806' },
  { id: 'sport_teater',           category: 'layanan_publik', categoryLabel: 'Olahraga & Hiburan', icon: Theater,  accent: '#0EA5E9', title: 'Gedung Teater',                 progress: '8.669' },

  // ═══ 16. LAYANAN PUBLIK — KOMERSIAL ═══
  { id: 'komersial_mall',         category: 'layanan_publik', categoryLabel: 'Komersial', icon: Building2, accent: '#0EA5E9', title: 'Mall & Pusat Belanja',          progress: '115' },
  { id: 'komersial_hotel',        category: 'layanan_publik', categoryLabel: 'Komersial', icon: Building2, accent: '#0EA5E9', title: 'Hotel & Penginapan',            progress: '1' },
  { id: 'komersial_grosir',       category: 'layanan_publik', categoryLabel: 'Komersial', icon: Building2, accent: '#0EA5E9', title: 'Pusat Grosir Tekstil',          progress: '10' },

  // ═══ 17. HUNIAN & PERMUKIMAN ═══
  { id: 'hunian_subsidi',         category: 'hunian', categoryLabel: 'Hunian', icon: Home,      accent: '#10B981', title: 'Perumahan Subsidi Rakyat' },
  { id: 'hunian_apartemen',       category: 'hunian', categoryLabel: 'Hunian', icon: Building2, accent: '#10B981', title: 'Apartemen Modern & High-Rise' },
  { id: 'hunian_mansion',         category: 'hunian', categoryLabel: 'Hunian', icon: Home,      accent: '#10B981', title: 'Kompleks Mansion Mewah' },

  // ═══ 18. PERTAHANAN — INFRASTRUKTUR MILITER ═══
  { id: 'bangun_barak',           category: 'pertahanan', categoryLabel: 'Infrastruktur Militer', icon: Radio,   accent: '#FB7185', title: 'Barak Militer' },
  { id: 'bangun_gudang_senjata',  category: 'pertahanan', categoryLabel: 'Infrastruktur Militer', icon: Radio,   accent: '#FB7185', title: 'Gudang Senjata' },
  { id: 'bangun_hangar_tank',     category: 'pertahanan', categoryLabel: 'Infrastruktur Militer', icon: Radio,   accent: '#FB7185', title: 'Hangar Tank' },
  { id: 'bangun_pangkalan_udara', category: 'pertahanan', categoryLabel: 'Infrastruktur Militer', icon: Plane,   accent: '#FB7185', title: 'Pangkalan Udara' },
  { id: 'bangun_pangkalan_laut',  category: 'pertahanan', categoryLabel: 'Infrastruktur Militer', icon: Ship,    accent: '#FB7185', title: 'Pangkalan Laut' },

  // ═══ 19. PERTAHANAN — ARMADA AKTIF ═══
  { id: 'upgrade_darat',          category: 'pertahanan', categoryLabel: 'Armada Aktif', icon: Swords,  accent: '#FB7185', title: 'Peningkatan Kekuatan Darat' },
  { id: 'upgrade_udara',          category: 'pertahanan', categoryLabel: 'Armada Aktif', icon: Plane,   accent: '#FB7185', title: 'Peningkatan Kekuatan Udara' },
  { id: 'upgrade_laut',           category: 'pertahanan', categoryLabel: 'Armada Aktif', icon: Ship,    accent: '#FB7185', title: 'Peningkatan Kekuatan Laut' },

  // ═══ 20. PERTAHANAN — INTELIJEN ═══
  { id: 'operasi_spionase',       category: 'pertahanan', categoryLabel: 'Intelijen', icon: Eye,  accent: '#FB7185', title: 'Operasi Spionase Rahasia' },
  { id: 'operasi_sabotase',       category: 'pertahanan', categoryLabel: 'Intelijen', icon: Eye,  accent: '#FB7185', title: 'Operasi Sabotase Infrastruktur Musuh' },

  // ═══ 21. PERTAHANAN — OPERASI MILITER ═══
  { id: 'operasi_serang_negara',  category: 'pertahanan', categoryLabel: 'Operasi Militer', icon: Swords, accent: '#FB7185', title: 'Deklarasi Invasi Militer' },
  { id: 'pertahankan_wilayah',    category: 'pertahanan', categoryLabel: 'Wilayah Kependudukan', icon: Globe, accent: '#FB7185', title: 'Kelola Wilayah yang Direbut / Aneksasi' },

  // ═══ 22. PERTAHANAN — SENJATA STRATEGIS ═══
  { id: 'program_icbm',           category: 'pertahanan', categoryLabel: 'Senjata Strategis', icon: Atom, accent: '#FB7185', title: 'Pengembangan Fasilitas Rudal ICBM' },
  { id: 'silo_nuklir',            category: 'pertahanan', categoryLabel: 'Senjata Strategis', icon: Atom, accent: '#FB7185', title: 'Kesiapan Peluncuran Hulu Ledak Nuklir' },

  // ═══ 23. GEOPOLITIK ═══
  { id: 'bangun_kedubes',         category: 'geopolitik', categoryLabel: 'Kedutaan Besar',   icon: Landmark,       accent: '#38BDF8', title: 'Bangun Kedutaan Besar Bilateral' },
  { id: 'naikkan_hubungan',       category: 'geopolitik', categoryLabel: 'Tingkat Hubungan', icon: HeartHandshake, accent: '#38BDF8', title: 'Tingkatkan Hubungan Bilateral Positif' },
  { id: 'pakta_non_agresi',       category: 'geopolitik', categoryLabel: 'Diplomasi',         icon: HeartHandshake, accent: '#38BDF8', title: 'Ratifikasi Pakta Non-Agresi' },
  { id: 'aliansi_pertahanan',     category: 'geopolitik', categoryLabel: 'Diplomasi',         icon: Shield,         accent: '#38BDF8', title: 'Bentuk Aliansi Pertahanan Militer' },
  { id: 'kontrak_penelitian',     category: 'geopolitik', categoryLabel: 'Diplomasi',         icon: Atom,           accent: '#38BDF8', title: 'Kerja Sama Kontrak Penelitian Internasional' },

  // ═══ 24. RESOLUSI PBB ═══
  { id: 'resolusi_larangan_perang',    category: 'resolusi_pbb', categoryLabel: 'Resolusi PBB', icon: Shield,   accent: '#38BDF8', title: 'Larangan Perang' },
  { id: 'resolusi_embargo_senjata',    category: 'resolusi_pbb', categoryLabel: 'Resolusi PBB', icon: Swords,   accent: '#38BDF8', title: 'Embargo Penjualan Senjata' },
  { id: 'resolusi_embargo_ekonomi',    category: 'resolusi_pbb', categoryLabel: 'Resolusi PBB', icon: Banknote, accent: '#38BDF8', title: 'Embargo Ekonomi' },
  { id: 'resolusi_invasi',             category: 'resolusi_pbb', categoryLabel: 'Resolusi PBB', icon: Globe,    accent: '#38BDF8', title: 'Resolusi Invasi' },
  { id: 'resolusi_larangan_produksi',  category: 'resolusi_pbb', categoryLabel: 'Resolusi PBB', icon: Factory,  accent: '#38BDF8', title: 'Larangan Produksi' },

  // ═══ 25. RESOLUSI DEWAN KEAMANAN PBB ═══
  { id: 'dk_invasi_militer',      category: 'resolusi_dk_pbb', categoryLabel: 'Dewan Keamanan', icon: Swords,         accent: '#A78BFA', title: 'Invasi Militer' },
  { id: 'dk_dukung_negara',       category: 'resolusi_dk_pbb', categoryLabel: 'Dewan Keamanan', icon: HeartHandshake, accent: '#A78BFA', title: 'Dukung Negara' },
  { id: 'dk_blokade_ekonomi',     category: 'resolusi_dk_pbb', categoryLabel: 'Dewan Keamanan', icon: Banknote,       accent: '#A78BFA', title: 'Blokade Ekonomi' },
  { id: 'dk_blokade_laut',        category: 'resolusi_dk_pbb', categoryLabel: 'Dewan Keamanan', icon: Ship,           accent: '#A78BFA', title: 'Blokade Laut' },
  { id: 'dk_blokade_penuh',       category: 'resolusi_dk_pbb', categoryLabel: 'Dewan Keamanan', icon: Shield,         accent: '#A78BFA', title: 'Blokade Penuh' },
  { id: 'dk_bantuan_logistik',    category: 'resolusi_dk_pbb', categoryLabel: 'Dewan Keamanan', icon: Package,        accent: '#A78BFA', title: 'Bantuan Logistik' },

  // ═══ 26. ORGANISASI PBB ═══
  { id: 'pbb_interpol',           category: 'organisasi_pbb', categoryLabel: 'Badan PBB', icon: Shield,     accent: '#0EA5E9', title: 'Interpol' },
  { id: 'pbb_who',                category: 'organisasi_pbb', categoryLabel: 'Badan PBB', icon: HeartPulse, accent: '#0EA5E9', title: 'WHO - Organisasi Kesehatan Dunia' },
  { id: 'pbb_unesco',             category: 'organisasi_pbb', categoryLabel: 'Badan PBB', icon: Star,       accent: '#0EA5E9', title: 'UNESCO' },
  { id: 'pbb_wto',                category: 'organisasi_pbb', categoryLabel: 'Badan PBB', icon: Coins,      accent: '#0EA5E9', title: 'WTO - Organisasi Perdagangan Dunia' },
  { id: 'pbb_ilo',                category: 'organisasi_pbb', categoryLabel: 'Badan PBB', icon: Users2,     accent: '#0EA5E9', title: 'ILO - Organisasi Buruh Internasional' },
  { id: 'pbb_fao',                category: 'organisasi_pbb', categoryLabel: 'Badan PBB', icon: Wheat,      accent: '#0EA5E9', title: 'FAO - Organisasi Pangan & Pertanian' },
  { id: 'pbb_imo',                category: 'organisasi_pbb', categoryLabel: 'Badan PBB', icon: Ship,       accent: '#0EA5E9', title: 'IMO - Organisasi Maritim Internasional' },
  { id: 'pbb_itu',                category: 'organisasi_pbb', categoryLabel: 'Badan PBB', icon: Radio,      accent: '#0EA5E9', title: 'ITU - Organisasi Telekomunikasi' },
  { id: 'pbb_wmo',                category: 'organisasi_pbb', categoryLabel: 'Badan PBB', icon: Wind,       accent: '#0EA5E9', title: 'WMO - Organisasi Meteorologi Dunia' },

  // ═══ 27. ORGANISASI REGIONAL ═══
  { id: 'reg_asean',              category: 'organisasi_regional', categoryLabel: 'Regional', icon: Globe,   accent: '#10B981', title: 'ASEAN - Asia Tenggara' },
  { id: 'reg_eu',                 category: 'organisasi_regional', categoryLabel: 'Regional', icon: Star,    accent: '#10B981', title: 'Uni Eropa (EU)' },
  { id: 'reg_liga_arab',          category: 'organisasi_regional', categoryLabel: 'Regional', icon: Globe,   accent: '#10B981', title: 'Liga Arab' },
  { id: 'reg_uni_afrika',         category: 'organisasi_regional', categoryLabel: 'Regional', icon: Globe,   accent: '#10B981', title: 'Uni Afrika (AU)' },
  { id: 'reg_oki',                category: 'organisasi_regional', categoryLabel: 'Regional', icon: Star,    accent: '#10B981', title: 'OKI - Organisasi Kerja Sama Islam' },
  { id: 'reg_brics',              category: 'organisasi_regional', categoryLabel: 'Regional', icon: Coins,   accent: '#10B981', title: 'BRICS' },
  { id: 'reg_nato',               category: 'organisasi_regional', categoryLabel: 'Regional', icon: Shield,  accent: '#10B981', title: 'NATO - Pakta Pertahanan Atlantik Utara' },
  { id: 'reg_opec',               category: 'organisasi_regional', categoryLabel: 'Regional', icon: Droplet, accent: '#10B981', title: 'OPEC - Negara Pengekspor Minyak' },
  { id: 'reg_g20',                category: 'organisasi_regional', categoryLabel: 'Regional', icon: Globe,   accent: '#10B981', title: 'G20 - Kelompok Duapuluh' },

  // ═══ 28. SOSIAL, BUDAYA & IDEOLOGI ═══
  { id: 'toleransi_agama',        category: 'sosial_budaya', categoryLabel: 'Agama',       icon: Star,   accent: '#E879F9', title: 'Harmoni & Kehidupan Beragama' },
  { id: 'ganti_agama',            category: 'sosial_budaya', categoryLabel: 'Agama',       icon: Star,   accent: '#E879F9', title: 'Ganti Agama / Kepercayaan Resmi Negara' },
  { id: 'ideologi_negara',        category: 'sosial_budaya', categoryLabel: 'Ideologi',    icon: Shield, accent: '#E879F9', title: 'Penguatan Dasar Ideologi Negara' },
  { id: 'ganti_ideologi',         category: 'sosial_budaya', categoryLabel: 'Ideologi',    icon: Shield, accent: '#E879F9', title: 'Ganti Ideologi Negara' },
  { id: 'doktrin_keterbukaan',    category: 'sosial_budaya', categoryLabel: 'Keterbukaan', icon: Globe,  accent: '#E879F9', title: 'Ubah Doktrin & Keterbukaan Negara' },

  // ═══ 29. KEMENTERIAN & KABINET ═══
  { id: 'upgrade_kemenkeu',       category: 'kementerian', categoryLabel: 'Kementerian', icon: Banknote,   accent: '#F97316', title: 'Upgrade Kementerian Keuangan' },
  { id: 'upgrade_kemendag',       category: 'kementerian', categoryLabel: 'Kementerian', icon: Coins,      accent: '#F97316', title: 'Upgrade Kementerian Perdagangan' },
  { id: 'upgrade_kemenhan',       category: 'kementerian', categoryLabel: 'Kementerian', icon: Shield,     accent: '#F97316', title: 'Upgrade Kementerian Pertahanan' },
  { id: 'upgrade_kemendikbud',    category: 'kementerian', categoryLabel: 'Kementerian', icon: BookOpen,   accent: '#F97316', title: 'Upgrade Kementerian Pendidikan' },
  { id: 'upgrade_kemenkes',       category: 'kementerian', categoryLabel: 'Kementerian', icon: HeartPulse, accent: '#F97316', title: 'Upgrade Kementerian Kesehatan' },
  { id: 'upgrade_kemenpar',       category: 'kementerian', categoryLabel: 'Kementerian', icon: Plane,      accent: '#F97316', title: 'Upgrade Kementerian Pariwisata' },
  { id: 'upgrade_kemenlh',        category: 'kementerian', categoryLabel: 'Kementerian', icon: Leaf,       accent: '#F97316', title: 'Upgrade Kementerian Lingkungan Hidup' },
  { id: 'upgrade_kemenkumham',    category: 'kementerian', categoryLabel: 'Kementerian', icon: Gavel,      accent: '#F97316', title: 'Upgrade Kementerian Kehakiman' },
  { id: 'upgrade_kemensains',     category: 'kementerian', categoryLabel: 'Kementerian', icon: Microscope, accent: '#F97316', title: 'Upgrade Kementerian Sains & Riset' },
  { id: 'upgrade_polisi',         category: 'kementerian', categoryLabel: 'Keamanan',    icon: Siren,      accent: '#F97316', title: 'Peningkatan Efektivitas Kepolisian' },
  { id: 'upgrade_garda_nasional', category: 'kementerian', categoryLabel: 'Keamanan',    icon: Shield,     accent: '#F97316', title: 'Pemberdayaan Garda Nasional' },
  { id: 'layanan_darurat',        category: 'kementerian', categoryLabel: 'Layanan Darurat', icon: Ambulance, accent: '#F97316', title: 'Kesiapan Unit Layanan Darurat Medis' },
  { id: 'kebijakan_bank_sentral', category: 'kementerian', categoryLabel: 'Bank Sentral', icon: Coins,     accent: '#F97316', title: 'Optimalisasi Batas Aman Bank Sentral' },

  // ═══ 30. POPULASI & DEMOGRAFI ═══
  { id: 'angka_kelahiran',        category: 'populasi', categoryLabel: 'Populasi', icon: Users2,     accent: '#10B981', title: 'Tingkatkan Angka Kelahiran Nasional' },
  { id: 'tekan_kematian',         category: 'populasi', categoryLabel: 'Populasi', icon: HeartPulse, accent: '#10B981', title: 'Tekan Angka Kematian & Wabah' },
  { id: 'hapus_tunawisma',        category: 'populasi', categoryLabel: 'Populasi', icon: Home,       accent: '#10B981', title: 'Entaskan Warga Tunawisma ke Hunian Layak' },
  { id: 'indeks_kesejahteraan',   category: 'populasi', categoryLabel: 'Populasi', icon: Activity,   accent: '#10B981', title: 'Capai Indeks Kesejahteraan Rakyat 75%' },

  // ═══ 31. RISET & PENELITIAN ═══
  { id: 'riset_otomasi',          category: 'penelitian', categoryLabel: 'Riset Ekonomi', icon: Microscope, accent: '#00FFAA', title: 'Riset Otomasi Fabrikasi & Semikonduktor' },
  { id: 'riset_rekayasa_material',category: 'penelitian', categoryLabel: 'Riset Ekonomi', icon: Microscope, accent: '#00FFAA', title: 'Riset Rekayasa Material Manufaktur' },
  { id: 'riset_eksplorasi_sda',   category: 'penelitian', categoryLabel: 'Riset Ekonomi', icon: Microscope, accent: '#00FFAA', title: 'Riset Eksplorasi Mineral & Energi' },
  { id: 'riset_peternakan_presisi',category: 'penelitian', categoryLabel: 'Riset Ekonomi', icon: Microscope, accent: '#00FFAA', title: 'Riset Peternakan Presisi Modern' },
  { id: 'riset_agrikultur_cerdas',category: 'penelitian', categoryLabel: 'Riset Ekonomi', icon: Microscope, accent: '#00FFAA', title: 'Riset Agrikultur Cerdas Multi-Komoditas' },
  { id: 'riset_perikanan_terpadu',category: 'penelitian', categoryLabel: 'Riset Ekonomi', icon: Microscope, accent: '#00FFAA', title: 'Riset Budidaya Perikanan Terpadu' },
  { id: 'riset_pangan_dasar',     category: 'penelitian', categoryLabel: 'Riset Ekonomi', icon: Microscope, accent: '#00FFAA', title: 'Riset Pengolahan Pangan Dasar' },
  { id: 'riset_pos_perbatasan',   category: 'penelitian', categoryLabel: 'Riset Militer', icon: Shield,     accent: '#FB7185', title: 'Riset Pos Pertahanan Perbatasan' },
  { id: 'riset_senjata_presisi',  category: 'penelitian', categoryLabel: 'Riset Militer', icon: Target,     accent: '#FB7185', title: 'Riset Senapan Serbu Presisi' },
  { id: 'riset_tank_komposit',    category: 'penelitian', categoryLabel: 'Riset Militer', icon: Shield,     accent: '#FB7185', title: 'Riset Tank Tempur Komposit' },
  { id: 'riset_drone_otonom',     category: 'penelitian', categoryLabel: 'Riset Militer', icon: Radio,      accent: '#FB7185', title: 'Riset Drone Pengintai Taktis' },
  { id: 'riset_radar_pesisir',    category: 'penelitian', categoryLabel: 'Riset Militer', icon: Radio,      accent: '#FB7185', title: 'Riset Radar Pesisir Pantai' },
  { id: 'riset_tank_gen5',        category: 'penelitian', categoryLabel: 'Riset Militer', icon: Shield,     accent: '#FB7185', title: 'Riset Tank Tempur Generasi 5' },
  { id: 'riset_jet_tempur',       category: 'penelitian', categoryLabel: 'Riset Militer', icon: Plane,      accent: '#FB7185', title: 'Riset Jet Tempur Superioritas' },
  { id: 'riset_diplomasi_kedubes',category: 'penelitian', categoryLabel: 'Riset Diplomasi', icon: Landmark, accent: '#38BDF8', title: 'Riset Optimalisasi Manfaat Kedutaan' },
  { id: 'riset_aliansi_tahan',    category: 'penelitian', categoryLabel: 'Riset Diplomasi', icon: Shield,   accent: '#38BDF8', title: 'Riset Protokol Aliansi Pertahanan' },
  { id: 'riset_harmonisasi_fiskal',category: 'penelitian', categoryLabel: 'Riset Diplomasi', icon: Coins,   accent: '#38BDF8', title: 'Riset Harmonisasi Fiskal Global' },
  { id: 'riset_mitigasi_bencana', category: 'penelitian', categoryLabel: 'Riset Diplomasi', icon: Leaf,    accent: '#38BDF8', title: 'Riset Mitigasi Bencana Alam Global' },
  { id: 'riset_upgrade_card',     category: 'penelitian', categoryLabel: 'Riset Umum',     icon: Sparkles, accent: '#00FFAA', title: 'Tingkatkan Kartu Riset ke Level II / III' },

  // ═══ 32. REKRUTMEN MENTERI & KABINET ═══
  { id: 'menteri_rekrut_keuangan',   category: 'kabinet', categoryLabel: 'Rekrutmen Menteri', icon: Banknote,   accent: '#F97316', title: 'Angkat Menteri Keuangan Profesional' },
  { id: 'menteri_rekrut_pertahanan', category: 'kabinet', categoryLabel: 'Rekrutmen Menteri', icon: Shield,     accent: '#F97316', title: 'Angkat Menteri Pertahanan Veteran' },
  { id: 'menteri_rekrut_pendidikan', category: 'kabinet', categoryLabel: 'Rekrutmen Menteri', icon: BookOpen,   accent: '#F97316', title: 'Angkat Menteri Pendidikan Cendekiawan' },
  { id: 'menteri_rekrut_kesehatan',  category: 'kabinet', categoryLabel: 'Rekrutmen Menteri', icon: HeartPulse, accent: '#F97316', title: 'Angkat Menteri Kesehatan Spesialis' },
  { id: 'menteri_rekrut_polisi',     category: 'kabinet', categoryLabel: 'Rekrutmen Menteri', icon: Siren,      accent: '#F97316', title: 'Angkat Kepala Polisi Berintegritas' },
  { id: 'menteri_rekrut_tier_tinggi',category: 'kabinet', categoryLabel: 'Rekrutmen Menteri', icon: Crown,      accent: '#F97316', title: 'Rekrut Tokoh Menteri Berbakat (Tier IV / V)' },

  // ═══ 33. KRISIS, BENCANA & TANGGAP DARURAT ═══
  { id: 'krisis_bencana_alam',    category: 'krisis', categoryLabel: 'Tanggap Darurat', icon: Waves,      accent: '#EF4444', title: 'Salurkan Bantuan Darurat Bencana Alam' },
  { id: 'krisis_wabah_penyakit',  category: 'krisis', categoryLabel: 'Tanggap Darurat', icon: HeartPulse, accent: '#EF4444', title: 'Tangani Wabah Penyakit & Salurkan Vaksin' },
  { id: 'krisis_operasi_polisi',  category: 'krisis', categoryLabel: 'Keamanan Nasional',icon: Siren,     accent: '#EF4444', title: 'Danai Operasi Penumpasan Kriminalitas' },
  { id: 'krisis_separatisme',     category: 'krisis', categoryLabel: 'Keamanan Nasional',icon: Shield,    accent: '#EF4444', title: 'Redam Ketegangan Separatisme Provinsi' },
  { id: 'krisis_klaim_hadiah',    category: 'krisis', categoryLabel: 'Logistik',        icon: Package,   accent: '#EF4444', title: 'Klaim Hadiah Bantuan SDA Harian' },
];

// =====================================================================
// KATEGORI FILTER
// =====================================================================
const CATEGORIES: { key: MissionCategory; label: string; icon: React.ElementType }[] = [
  { key: 'event',               label: 'Gelar Acara',         icon: Trophy },
  { key: 'kesejahteraan',       label: 'Kesejahteraan',       icon: Sparkles },
  { key: 'ekonomi',             label: 'Ekonomi',             icon: Coins },
  { key: 'produksi',            label: 'Produksi',            icon: Factory },
  { key: 'pangan',              label: 'Pangan',              icon: Wheat },
  { key: 'layanan_publik',      label: 'Layanan Publik',      icon: Building2 },
  { key: 'hunian',              label: 'Hunian',              icon: Home },
  { key: 'penelitian',          label: 'Penelitian',          icon: Microscope },
  { key: 'pertahanan',          label: 'Pertahanan',          icon: Radio },
  { key: 'geopolitik',          label: 'Geopolitik',          icon: Globe },
  { key: 'resolusi_pbb',        label: 'Resolusi PBB',        icon: Globe },
  { key: 'resolusi_dk_pbb',     label: 'Dewan Keamanan',      icon: Shield },
  { key: 'organisasi_pbb',      label: 'Organisasi PBB',      icon: Landmark },
  { key: 'organisasi_regional', label: 'Organisasi Regional', icon: Globe },
  { key: 'sosial_budaya',       label: 'Sosial Budaya',       icon: Star },
  { key: 'kementerian',         label: 'Kementerian',         icon: Landmark },
  { key: 'kabinet',             label: 'Pilih Menteri',       icon: Crown },
  { key: 'krisis',              label: 'Krisis & Darurat',    icon: Siren },
  { key: 'populasi',            label: 'Populasi',            icon: Users2 },
];

// =====================================================================
// KOMPONEN UTAMA
// =====================================================================
export default function MissionModals({
  isOpen = false,
  onClose,
  onClick,
  onStartMission,
}: MissionModalsProps) {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MissionCategory>('event');
  const [completionsMap, setCompletionsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
    setCompletionsMap(getMissionCompletionsMap());

    const handleUpdate = () => {
      setCompletionsMap(getMissionCompletionsMap());
    };

    window.addEventListener('mission_completions_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('mission_completions_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const filteredCards = MISSION_CARDS.filter(card => card.category === activeCategory);
  const totalExp = 0;

  return (
    <>
      {/* Icon Tombol Misi */}
      <button
        onClick={onClick}
        title="Misi & Sasaran Strategis"
        className="fixed bottom-14 lg:bottom-16 xl:bottom-20 2xl:bottom-26 left-7 z-[100] w-9 h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer transition-all group"
      >
        <Target className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 transition-transform group-hover:scale-110" />
      </button>

      {/* Modal Misi */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl"
          >
            {/* HEADER */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="p-1 sm:p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] shrink-0">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                    Misi Presiden
                  </h2>
                  <p className="text-[10px] text-[#6B8A8A] font-semibold uppercase tracking-wider mt-1">
                    Jumlah Pengalaman: <span className="text-amber-400 font-black">Ex {totalExp}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5"
              >
                <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FILTER TAB */}
            <div className="px-4 sm:px-6 py-2 bg-[#051111] border-b border-[#00FFAA]/15 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
              <Compass className="w-3.5 h-3.5 text-[#6B8A8A] shrink-0" />
              <span className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider shrink-0 mr-1">
                Kategori:
              </span>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;
                const count = MISSION_CARDS.filter(c => c.category === cat.key).length;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20'
                        : 'bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] border border-[#00FFAA]/20'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {cat.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A1A1A] relative z-10 custom-scrollbar space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[10px] font-semibold text-amber-200/80">
                <Gift className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                Pratinjau hadiah bertingkat: misi awal mulai dari nilai terkecil dan meningkat setiap kali diselesaikan.
              </div>

              {filteredCards.map(card => {
                const Icon = card.icon;
                const completionCount = completionsMap[card.id] || 0;
                const badges = getMissionRewardBadges(card, completionCount);

                return (
                  <div
                    key={card.id}
                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-[#0F2424] border border-[#00FFAA]/20 hover:border-[#00FFAA]/50 transition-all"
                  >
                    {/* ICON BESAR */}
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                      style={{
                        backgroundColor: `${card.accent}15`,
                        border: `1px solid ${card.accent}40`,
                      }}
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: card.accent }} />
                    </div>

                    {/* KONTEN TENGAH */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[9px] font-black uppercase px-2 py-0.5 rounded border"
                          style={{
                            color: card.accent,
                            borderColor: `${card.accent}40`,
                            backgroundColor: `${card.accent}10`,
                          }}
                        >
                          {card.categoryLabel}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-[#E0E0E0] leading-tight">
                          {card.title}
                        </h3>
                        {card.progress && (
                          <span className="text-[10px] text-amber-400 font-black">
                            ({card.progress})
                          </span>
                        )}
                      </div>

                      {/* BADGES HADIAH USULAN */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                          <Gift className="h-3 w-3" />
                          Hadiah usulan
                        </span>

                        {badges.neo !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-400/40 text-blue-200 font-black text-[10px]">
                            <Coins className="h-3 w-3 text-blue-300" />
                            {badges.neo.toLocaleString('id-ID')} NEO
                          </span>
                        )}

                        {badges.sda && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/15 border border-orange-400/40 text-orange-200 font-black text-[10px]">
                            <Package className="h-3 w-3 text-orange-300" />
                            {badges.sda.amount.toLocaleString('id-ID')} {formatProductionProductName(badges.sda.productKey)}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 font-black text-[10px]">
                          <Gem className="h-3 w-3 text-cyan-300" />
                          {badges.diamond} Gems
                        </span>
                      </div>
                    </div>

                    {/* TOMBOL MULAI */}
                    <button
                      type="button"
                      onClick={() => onStartMission?.(getMissionRoute(card))}
                      aria-label={`Mulai misi: ${card.title}`}
                      className="w-full sm:w-auto shrink-0 px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#00FFAA] to-emerald-400 hover:from-[#00e699] hover:to-emerald-500 active:scale-95 text-[#0A1A1A] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#0A1A1A]" />
                      Mulai
                    </button>
                  </div>
                );
              })}

              {filteredCards.length === 0 && (
                <div className="text-center py-12 text-sm font-bold text-[#6B8A8A]">
                  Belum ada misi untuk kategori ini.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}