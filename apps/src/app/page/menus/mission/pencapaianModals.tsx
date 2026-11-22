'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import {
  Trophy, Award, CheckCircle2, Lock, Sparkles, Gem, Coins,
  Smile, Users2, Zap, Landmark, Building2, Microscope, Banknote, Globe2, Factory, Home, Hammer,
  Briefcase, Sword, Map as MapIcon, PhoneCall, Gift, Globe, HeartHandshake, Shield, Siren, Skull, TrendingUp, Calendar,
  BookOpen, Flame
} from 'lucide-react';
import { getEmbassiesForCountry } from '../../../../../../json/6_database_kedutaan_besar/embassyRegistry';
import { getTradeAgreementsForCountry } from '../../../../../../json/9_database_mitra_perdagangan/tradeAgreementRegistry';
import { COUNTRY_SOCIAL_PROFILES } from '../../../../../../json/semua_fitur_negara/0_profiles/countryProfilesData';
import { COUNTRIES_DATA } from '../../map_system/map-data';

export type AchievementCategory =
  | 'kepuasan'
  | 'populasi'
  | 'produksi'
  | 'ekonomi'
  | 'pembangunan'
  | 'penelitian'
  | 'kementerian'
  | 'geopolitik'
  | 'sosial_budaya'
  | 'pertahanan'
  | 'tanggap_darurat';

export interface DynamicAchievementInfo {
  target: number;
  current: number;
  isUnlocked: boolean;
  extraBadges?: Array<{ label: string; colorClass: string; icon?: React.ElementType }>;
  dynamicDescription?: string;
  dynamicTitle?: string;
}

export interface AchievementItem {
  id: string;
  category: AchievementCategory;
  icon: React.ElementType;
  accent: string;
  maxProgress: number;
  reward: {
    gems?: number;
    neo?: number;
    titleBadge?: string;
  };
  computeProgress: (countryDetail: any, currentDate?: Date, achievementState?: AchievementState) => {
    current: number;
    isUnlocked: boolean;
    target?: number;
    extraBadges?: Array<{ label: string; colorClass: string; icon?: React.ElementType }>;
    dynamicDescription?: string;
    dynamicTitle?: string;
  };
}

export interface AchievementState {
  claimed: Record<string, boolean>;
  milestones: {
    negara_sejahtera_tier?: number;
    kebahagiaan_merata_tier?: number;
    daya_beli_tier?: number; // 0 for target 65, 1 for target 75, 2 for target 80, 3 completed
    [key: string]: number | undefined;
  };
  baselines?: Record<string, number>;
}

const LOCAL_STORAGE_ACHIEVEMENTS_KEY = 'neosantara_achievements_state';

// ─────────────────────────────────────────────────────────────────────────
// LOGIKA KHUSUS ACHIEVEMENT ITEMS
// ─────────────────────────────────────────────────────────────────────────

// ═══ KONFIGURASI 17 KATEGORI PEMBANGUNAN & MILITER (3 TAHAP: 100, 1000, 5000) ═══
export interface BuildingCategoryConfig {
  id: string;
  category: AchievementCategory;
  nameKey: string;
  icon: React.ElementType;
  accent: string;
  keys: string[];
}

export const BUILDING_ACHIEVEMENT_CATEGORIES: BuildingCategoryConfig[] = [
  // --- PRODUKSI (7 TAB GAMBAR 1) ---
  {
    id: 'bangun_kelistrikan',
    category: 'pembangunan',
    nameKey: 'kelistrikan',
    icon: Zap,
    accent: '#38bdf8',
    keys: [
      'pembangkit_listrik_tenaga_nuklir', 'pembangkit_listrik_tenaga_air', 'pembangkit_listrik_tenaga_surya',
      'pembangkit_listrik_tenaga_uap', 'pembangkit_listrik_tenaga_gas', 'pembangkit_listrik_tenaga_angin',
      'pembangkit_listrik_tenaga_panas_bumi', 'pembangkit_listrik_tenaga_hidrogen',
      'pembangkit_listrik_tenaga_gelombang_laut', 'pembangkit_listrik_tenaga_fusi_nuklir'
    ],
  },
  {
    id: 'bangun_mineral_energi',
    category: 'pembangunan',
    nameKey: 'mineral_energi',
    icon: Building2,
    accent: '#f59e0b',
    keys: ['emas', 'uranium', 'batu_bara', 'minyak_bumi', 'gas_alam', 'garam', 'litium', 'logam_tanah_jarang', 'bijih_besi'],
  },
  {
    id: 'bangun_manufaktur',
    category: 'pembangunan',
    nameKey: 'manufaktur',
    icon: Factory,
    accent: '#64748b',
    keys: ['pabrik_semikonduktor', 'pabrik_mesin', 'pabrik_besi', 'semen_beton', 'kayu'],
  },
  {
    id: 'bangun_peternakan',
    category: 'pembangunan',
    nameKey: 'peternakan',
    icon: Building2,
    accent: '#10b981',
    keys: ['ayam_unggas', 'sapi_perah', 'sapi_potong', 'domba_kambing'],
  },
  {
    id: 'bangun_agrikultur',
    category: 'pembangunan',
    nameKey: 'agrikultur',
    icon: Building2,
    accent: '#22c55e',
    keys: ['padi', 'gandum', 'jagung', 'sayur', 'umbi', 'kedelai', 'kelapa_sawit', 'kopi', 'teh', 'kakao', 'tebu', 'karet'],
  },
  {
    id: 'bangun_perikanan',
    category: 'pembangunan',
    nameKey: 'perikanan',
    icon: Building2,
    accent: '#06b6d4',
    keys: ['udang', 'mutiara', 'ikan'],
  },
  {
    id: 'bangun_olahan_pangan',
    category: 'pembangunan',
    nameKey: 'olahan_pangan',
    icon: Factory,
    accent: '#eab308',
    keys: ['air_mineral', 'gula', 'roti', 'pengolahan_daging', 'mie_instan', 'minyak_goreng', 'susu', 'beras'],
  },

  // --- TEMPAT UMUM / LAYANAN PUBLIK (6 TAB GAMBAR 2) ---
  {
    id: 'bangun_infrastruktur',
    category: 'pembangunan',
    nameKey: 'infrastruktur',
    icon: Hammer,
    accent: '#8b5cf6',
    keys: ['jalur_sepeda', 'jalan_raya', 'terminal_bus', 'stasiun_kereta_api', 'kereta_bawah_tanah', 'pelabuhan', 'bandara', 'helipad'],
  },
  {
    id: 'bangun_pendidikan',
    category: 'pembangunan',
    nameKey: 'pendidikan',
    icon: Building2,
    accent: '#6366f1',
    keys: ['prasekolah', 'dasar', 'menengah', 'lanjutan', 'universitas', 'lembaga_pendidikan', 'laboratorium', 'observatorium', 'pusat_penelitian', 'pusat_pengembangan'],
  },
  {
    id: 'bangun_kesehatan',
    category: 'pembangunan',
    nameKey: 'kesehatan',
    icon: Building2,
    accent: '#ec4899',
    keys: ['rumah_sakit_besar', 'rumah_sakit_kecil', 'pusat_diagnostik'],
  },
  {
    id: 'bangun_penegakan_hukum',
    category: 'pembangunan',
    nameKey: 'penegakan_hukum',
    icon: Shield,
    accent: '#3b82f6',
    keys: ['pusat_bantuan_hukum', 'pengadilan', 'kejaksaan', 'pos_polisi', 'armada_mobil_polisi', 'akademi_polisi'],
  },
  {
    id: 'bangun_olahraga_hiburan',
    category: 'pembangunan',
    nameKey: 'olahraga_hiburan',
    icon: Building2,
    accent: '#f97316',
    keys: ['kolam_renang', 'sirkuit_balap', 'stadion', 'stadion_internasional', 'gym', 'golf', 'esports', 'gokart', 'bioskop', 'teater'],
  },
  {
    id: 'bangun_komersial',
    category: 'pembangunan',
    nameKey: 'komersial',
    icon: Building2,
    accent: '#14b8a6',
    keys: ['mall', 'hotel', 'pusat_grosir_tekstil'],
  },

  // --- HUNIAN PERMUKIMAN (3 TAB GAMBAR 3) ---
  {
    id: 'bangun_rumah_subsidi',
    category: 'pembangunan',
    nameKey: 'rumah_subsidi',
    icon: Home,
    accent: '#0284c7',
    keys: ['rumah_subsidi', 'perumahan_subsidi'],
  },
  {
    id: 'bangun_apartemen',
    category: 'pembangunan',
    nameKey: 'apartemen',
    icon: Building2,
    accent: '#8b5cf6',
    keys: ['apartemen'],
  },
  {
    id: 'bangun_mansion',
    category: 'pembangunan',
    nameKey: 'mansion',
    icon: Home,
    accent: '#d97706',
    keys: ['mansion'],
  },

  // --- MILITER / ARMADA (TAB INFRASTRUKTUR MILITER GAMBAR 4) ---
  {
    id: 'bangun_infrastruktur_militer',
    category: 'pertahanan',
    nameKey: 'infrastruktur_militer',
    icon: Shield,
    accent: '#ef4444',
    keys: ['barak', 'hangar_tank', 'gudang_senjata', 'pangkalan_laut', 'pangkalan_udara'],
  },
];

const BUILDING_TIER_TARGETS = [100, 1000, 5000];
const BUILDING_TIER_REWARDS = [
  { gems: 100, neo: 25000000 },
  { gems: 250, neo: 75000000 },
  { gems: 500, neo: 200000000 },
];

function countBuildingsForCategory(cd: any, keys: string[]): number {
  if (!cd) return 0;
  let total = 0;
  for (const k of keys) {
    const val = Number(cd[k] ?? cd?.buildings?.[k] ?? cd?.pertahanan?.[k] ?? 0);
    if (!isNaN(val) && val > 0) {
      total += val;
    }
  }
  return total;
}

// ═══ KONFIGURASI 3 SEKTOR RISET NASIONAL (EKONOMI, MILITER, DIPLOMASI) ═══
export const RESEARCH_SECTOR_CARDS = {
  ekonomi: [
    'otomasi_industri', 'manufaktur_material', 'manufaktur_terintegrasi', 'manufaktur_lanjut',
    'peternakan_modern', 'peternakan_genetika', 'perkebunan_komoditas', 'agrikultur_cerdas',
    'perikanan_modern', 'perikanan_pascapanen', 'pengolahan_pangan', 'industri_pangan_terpadu',
  ],
  militer: [
    'benteng_perbatasan', 'senjata_infanteri', 'tank_generasi_baru', 'drone_otonom',
    'radar_pesisir', 'kapal_stealth', 'perang_siber', 'artileri_presisi',
    'kapal_selam_diesel', 'helikopter_serang', 'spionase_strategis', 'sabotase_terarah',
    'tank_generasi5', 'jet_superioritas', 'kapal_perang_multiperan', 'armor_reaktif',
    'struktur_jet', 'hull_kapal_diperkuat',
  ],
  diplomasi: [
    'manfaat_kedutaan', 'suara_pbb', 'biaya_kedutaan', 'kontra_separatisme',
    'perjanjian_dagang', 'pandemi_kontrol', 'efek_acara', 'penyebaran_ideologi',
    'misionaris', 'pakta_non_agresi', 'aliansi_pertahanan', 'mitigasi_bencana',
    'pertahanan_diri', 'perlindungan_perang', 'bonus_organisasi_pbb', 'bonus_organisasi_regional',
    'kursi_tetap_dewan_pbb', 'bonus_tempat_wisata', 'sanksi_ekonomi', 'suara_dewan_keamanan',
    'hegemoni_diplomasi', 'kriptografi_kuantum', 'intelijen_satelit_quantum', 'isolasi_total_musuh',
    'tatanan_dunia_baru',
  ],
};

function countCompletedResearchInSector(cd: any, cardIds: string[]): number {
  const completedList: string[] = Array.isArray(cd?.completed_research)
    ? cd.completed_research
    : Array.isArray(cd?.completedResearches)
    ? cd.completedResearches
    : [];
  
  const levels = cd?.research_levels || {};
  let count = 0;
  for (const id of cardIds) {
    if (completedList.includes(id) || (Number(levels[id]) || 0) > 0) {
      count++;
    }
  }
  return count;
}

// ═══ KONFIGURASI 3 TAB KEMENTERIAN, KEAMANAN, DAN LAYANAN (TARGET LEVEL 20/20) ═══
export const MINISTRY_DEPARTMENTS_CONFIG = {
  kementerian: [
    'infrastruktur', 'pendidikan', 'sains', 'kesehatan', 'olahraga',
    'kehakiman', 'pertahanan', 'luar-negeri', 'kebudayaan', 'pariwisata',
    'lingkungan', 'perumahan', 'pembangunan', 'perdagangan', 'keuangan',
  ],
  keamanan: [
    'polisi', 'garda-nasional', 'komandan-angkatan-darat', 'komandan-armada',
  ],
  layanan: [
    'layanan-darurat', 'bank-sentral',
  ],
};

function getDeptLevelFromCountryDetail(cd: any, rawId: string): number {
  if (!cd) return 1;
  const key = rawId.replace(/-/g, '_');
  const val = cd[`kem_${key}`] ?? cd[`keamanan_${key}`] ?? cd[`layanan_${key}`] ??
    cd[`level_${key}`] ?? cd[`level_${rawId}`] ?? cd[rawId] ?? 1;
  return Number(val) || 1;
}

function countMinistryMaxedDepartments(cd: any, deptIds: string[]): { maxedCount: number; totalCount: number; allMaxed: boolean; averageLevel: number } {
  let maxed = 0;
  let sumLevel = 0;
  for (const id of deptIds) {
    const lvl = getDeptLevelFromCountryDetail(cd, id);
    sumLevel += lvl;
    if (lvl >= 20) {
      maxed++;
    }
  }
  return {
    maxedCount: maxed,
    totalCount: deptIds.length,
    allMaxed: maxed === deptIds.length,
    averageLevel: Math.round(sumLevel / (deptIds.length || 1)),
  };
}

// Helper dinamis menghitung jumlah negara mitra yang tersedia (basis default, jika sisa negara di dunia < baseTarget maka turun dinamis)
export function getDynamicTargetCountryCount(cd: any, defaultTarget: number = 100): number {
  const TOTAL_WORLD_COUNTRIES = 211;
  let annexedCount = 0;

  if (Array.isArray(cd?.annexedTerritories)) {
    annexedCount = cd.annexedTerritories.length;
  } else if (Array.isArray(cd?.annexedCountries)) {
    annexedCount = cd.annexedCountries.length;
  } else if (typeof window !== 'undefined') {
    const windowAnnexed = (window as Window & { neosantara_annexed_countries?: Record<string, unknown> }).neosantara_annexed_countries;
    if (windowAnnexed && typeof windowAnnexed === 'object') {
      annexedCount = Object.keys(windowAnnexed).length;
    }
  }

  // Sisa negara yang belum dianeksasi di dunia
  const remainingCountries = Math.max(1, TOTAL_WORLD_COUNTRIES - annexedCount);
  // Target default, tetapi jika sisa negara di dunia kurang dari target maka otomatis turun sesuai sisa negara
  return Math.min(defaultTarget, remainingCountries);
}

// Helper untuk menghitung jumlah kedutaan besar aktif dari database dan progres pemain
export function getActiveEmbassiesCount(cd: any): number {
  const countryName = cd?.country || cd?.nama || cd?.country_name || cd?.nama_negara || '';
  const dbEmbassies = countryName ? getEmbassiesForCountry(countryName) : [];
  const directEmbassies: any[] = Array.isArray(cd?.embassies) ? cd.embassies : [];
  const removedEmbassies: string[] = Array.isArray(cd?.removedEmbassies) ? cd.removedEmbassies : [];
  const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

  const uniqueActive = new Set<string>();

  // Tambahkan dari database awal
  dbEmbassies.forEach((mitra: string) => {
    if (mitra) uniqueActive.add(mitra.toLowerCase().trim());
  });

  // Tambahkan dari penambahan dinamis pemain
  directEmbassies.forEach((item: any) => {
    const partner = typeof item === 'string' ? item : item?.mitra || item?.nama_negara || item?.country;
    if (partner) uniqueActive.add(String(partner).toLowerCase().trim());
  });

  // Hilangkan kedutaan yang dihapus/dihancurkan pemain
  removedEmbassies.forEach((rem: string) => {
    if (rem) uniqueActive.delete(String(rem).toLowerCase().trim());
  });

  // Hilangkan negara mitra yang telah dianeksasi
  Object.keys(annexedStore).forEach((annexKey: string) => {
    if (annexKey && annexedStore[annexKey]) {
      uniqueActive.delete(annexKey.toLowerCase().trim());
    }
  });

  // Kurangi jika negara sendiri masuk
  if (countryName) {
    uniqueActive.delete(countryName.toLowerCase().trim());
  }

  return uniqueActive.size;
}

// Helper untuk menghitung jumlah perjanjian dagang bilateral aktif
export function getActiveTradeAgreementsCount(cd: any): number {
  const countryName = cd?.country || cd?.nama || cd?.country_name || cd?.nama_negara || '';
  const dbTrade = countryName ? getTradeAgreementsForCountry(countryName) : [];
  const directTrade: any[] = Array.isArray(cd?.tradeAgreements) ? cd.tradeAgreements : [];
  const addedTrade: any[] = Array.isArray(cd?.addedTradePartners) ? cd.addedTradePartners : [];
  const removedTrade: string[] = Array.isArray(cd?.removedTradePartners) ? cd.removedTradePartners : [];
  const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

  const uniqueActive = new Set<string>();

  // Tambahkan dari database awal
  dbTrade.forEach((item: any) => {
    const partner = typeof item === 'string' ? item : item?.mitra || item?.nama_negara || item?.mitra_country;
    if (partner) uniqueActive.add(String(partner).toLowerCase().trim());
  });

  // Tambahkan dari perjanjian dagang dinamis pemain
  directTrade.forEach((item: any) => {
    const partner = typeof item === 'string' ? item : item?.mitra || item?.nama_negara;
    if (partner) uniqueActive.add(String(partner).toLowerCase().trim());
  });

  addedTrade.forEach((item: any) => {
    const partner = typeof item === 'string' ? item : item?.mitra || item?.nama_negara;
    if (partner) uniqueActive.add(String(partner).toLowerCase().trim());
  });

  // Hilangkan hubungan dagang yang diputus
  removedTrade.forEach((rem: string) => {
    if (rem) uniqueActive.delete(String(rem).toLowerCase().trim());
  });

  // Hilangkan jika negara mitra telah dianeksasi
  Object.keys(annexedStore).forEach((annexKey: string) => {
    if (annexKey && annexedStore[annexKey]) {
      uniqueActive.delete(annexKey.toLowerCase().trim());
    }
  });

  if (countryName) {
    uniqueActive.delete(countryName.toLowerCase().trim());
  }

  return uniqueActive.size;
}

// Helper untuk menghitung entitas array unik tidak termasuk negara dianeksasi
function countUniqueDiplomaticPartners(list: any[] | undefined | null, cd?: any): number {
  if (!Array.isArray(list) || list.length === 0) return 0;
  const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};
  const playerCountry = (cd?.country || cd?.nama || cd?.country_name || '').toLowerCase().trim();

  const unique = new Set<string>();
  list.forEach((item) => {
    const name = typeof item === 'string' ? item : item?.partner || item?.country || item?.nama_negara || item?.targetCountry;
    if (name) {
      const normalized = String(name).toLowerCase().trim();
      if (normalized && normalized !== playerCountry && !annexedStore[normalized] && !annexedStore[String(name)]) {
        unique.add(normalized);
      }
    }
  });
  return unique.size;
}

// Helper untuk menghitung jumlah negara di dunia yang memiliki agama yang sama dengan user (termasuk negara user sendiri)
export function getSameReligionCountriesCount(cd: any): { count: number; totalActiveCountries: number; userReligion: string } {
  const userReligion = String(cd?.religion || 'Islam').trim();
  const playerCountry = String(cd?.country || cd?.nama || cd?.country_name || '').toLowerCase().trim();
  const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

  // Buat lookup dari profil negara
  const profileLookup = new Map<string, string>();
  for (const p of COUNTRY_SOCIAL_PROFILES) {
    profileLookup.set(p.name_id.toLowerCase().trim(), p.religion);
    profileLookup.set(p.name_en.toLowerCase().trim(), p.religion);
    profileLookup.set(p.slug.toLowerCase().trim(), p.religion);
  }

  let matchCount = 0;
  let totalActive = 0;

  COUNTRIES_DATA.forEach((c) => {
    const raw = String(c.country || '').trim();
    const norm = raw.toLowerCase();
    const clean = norm.replace(/[^a-z0-9]/g, '');
    const iso = String(c.iso || '').toLowerCase().trim();

    // Skip negara yang telah dianeksasi
    if (annexedStore[raw] || annexedStore[norm] || (clean && annexedStore[clean])) return;
    if (iso && (annexedStore[iso] || annexedStore[`iso_${iso}`])) return;

    totalActive++;

    let rel = profileLookup.get(norm) || profileLookup.get(clean) || '';
    if (norm === playerCountry && cd?.religion) {
      rel = cd.religion;
    }

    if (rel && rel.toLowerCase().trim() === userReligion.toLowerCase()) {
      matchCount++;
    }
  });

  return {
    count: matchCount,
    totalActiveCountries: totalActive || 211,
    userReligion,
  };
}

// Helper untuk menghitung jumlah negara di dunia yang memiliki ideologi yang sama dengan user (termasuk negara user sendiri)
export function getSameIdeologyCountriesCount(cd: any): { count: number; totalActiveCountries: number; userIdeology: string } {
  const userIdeology = String(cd?.ideology || 'Demokrasi').trim();
  const playerCountry = String(cd?.country || cd?.nama || cd?.country_name || '').toLowerCase().trim();
  const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

  // Buat lookup dari profil negara
  const profileLookup = new Map<string, string>();
  for (const p of COUNTRY_SOCIAL_PROFILES) {
    profileLookup.set(p.name_id.toLowerCase().trim(), p.ideology);
    profileLookup.set(p.name_en.toLowerCase().trim(), p.ideology);
    profileLookup.set(p.slug.toLowerCase().trim(), p.ideology);
  }

  let matchCount = 0;
  let totalActive = 0;

  COUNTRIES_DATA.forEach((c) => {
    const raw = String(c.country || '').trim();
    const norm = raw.toLowerCase();
    const clean = norm.replace(/[^a-z0-9]/g, '');
    const iso = String(c.iso || '').toLowerCase().trim();

    // Skip negara yang telah dianeksasi
    if (annexedStore[raw] || annexedStore[norm] || (clean && annexedStore[clean])) return;
    if (iso && (annexedStore[iso] || annexedStore[`iso_${iso}`])) return;

    totalActive++;

    let ideo = profileLookup.get(norm) || profileLookup.get(clean) || '';
    if (norm === playerCountry && cd?.ideology) {
      ideo = cd.ideology;
    }

    if (ideo && ideo.toLowerCase().trim() === userIdeology.toLowerCase()) {
      matchCount++;
    }
  });

  return {
    count: matchCount,
    totalActiveCountries: totalActive || 211,
    userIdeology,
  };
}

const ACHIEVEMENT_DEFINITIONS: AchievementItem[] = [
  // ═══ 1. KEPUASAN & KESEJAHTERAAN ═══
  {
    // Logika 1: Mengikuti kesejahteraan di navbar lalu +10 bertahap (misal 59 -> target 69)
    id: 'negara_sejahtera',
    category: 'kepuasan',
    icon: Smile,
    accent: '#10b981',
    maxProgress: 100,
    reward: { gems: 150, neo: 50000000 },
    computeProgress: (cd, _, state) => {
      // Ambil nilai kesejahteraan real dari navbar / detail
      const rawWelfare = Number(cd?.kesejahteraan ?? cd?.indeks_kesejahteraan ?? cd?.kesejahteraan_masyarakat ?? 59);
      const currentVal = Math.max(0, Math.min(100, Math.round(rawWelfare)));

      // Target dihitung dinamis persis +10 dari nilai awal / tier sebelumnya
      const currentTier = state?.milestones?.negara_sejahtera_tier ?? 0;
      const initialTarget = Math.min(100, currentVal + 10);
      let targetVal = Math.min(100, initialTarget + (currentTier * 10));

      const isUnlocked = currentVal >= targetVal;

      return {
        current: currentVal,
        target: targetVal,
        isUnlocked,
        dynamicDescription: `Petunjuk: Tingkatkan indeks kesejahteraan nasional hingga mencapai ${targetVal}/100. Rawat kebutuhan pokok, fasilitas medis, dan subsidi masyarakat.`,
        extraBadges: [
          {
            label: `Target Kesejahteraan: ${targetVal}/100`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-root-accent/15 text-root-accent border-root-accent/30',
          },
        ],
      };
    },
  },
  {
    // Logika 2: Kebahagiaan merata target +10 bertahap (misal 74 -> target 84)
    id: 'kebahagiaan_merata',
    category: 'kepuasan',
    icon: Award,
    accent: '#34d399',
    maxProgress: 100,
    reward: { gems: 120, neo: 40000000 },
    computeProgress: (cd, _, state) => {
      const kepuasan = Number(cd?.kepuasan ?? cd?.satisfaction ?? 74);
      const currentVal = Math.max(0, Math.min(100, Math.round(kepuasan)));

      const currentTier = state?.milestones?.kebahagiaan_merata_tier ?? 0;
      const initialTarget = Math.min(100, currentVal + 10);
      let targetVal = Math.min(100, initialTarget + (currentTier * 10));

      const isUnlocked = currentVal >= targetVal;

      return {
        current: currentVal,
        target: targetVal,
        isUnlocked,
        dynamicDescription: `Petunjuk: Tingkatkan indeks kepuasan rakyat hingga mencapai ${targetVal}%. Buat inisiatif acara rakyat atau optimalkan sektor-sektor pelayanan publik.`,
        extraBadges: [
          {
            label: `Target Kepuasan: ${targetVal}%`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-root-accent/15 text-root-accent border-root-accent/30',
          },
        ],
      };
    },
  },
  {
    id: 'rumah_untuk_semua',
    category: 'kepuasan',
    icon: Building2,
    accent: '#059669',
    maxProgress: 1,
    reward: { gems: 120, neo: 40000000 },
    computeProgress: (cd) => {
      const tunawisma = cd?.tunawisma ?? 0;
      const isUnlocked = tunawisma === 0;
      return { current: isUnlocked ? 1 : 0, isUnlocked };
    },
  },

  // ═══ 2. POPULASI ═══
  {
    id: 'layanan_untuk_semua',
    category: 'populasi',
    icon: Users2,
    accent: '#3b82f6',
    maxProgress: 4,
    reward: { gems: 150, neo: 60000000 },
    computeProgress: (cd) => {
      let met = 2;
      if (cd?.listrikDefisit === 0) met++;
      if (cd?.panganSurplus) met++;
      return { current: Math.min(4, met), isUnlocked: met >= 4 };
    },
  },
  {
    // Logika 3: Penduduk Sehat dengan badge persentase angka kematian & angka penduduk yang akan mati akibat penyakit/wabah
    id: 'penduduk_sehat',
    category: 'populasi',
    icon: Users2,
    accent: '#60a5fa',
    maxProgress: 100,
    reward: { gems: 150, neo: 45000000 },
    computeProgress: (cd) => {
      const populasi = Number(cd?.jumlah_penduduk || cd?.population || 10000000);
      
      // Hitung dampak wabah atau penyakit aktif
      const activeOutbreaks: any[] = Array.isArray(cd?.active_outbreaks) ? cd.active_outbreaks : [];
      let totalPenyakitDeaths = 0;
      let totalPenyakitVictims = 0;

      activeOutbreaks.forEach((outbreak) => {
        const d = Number(outbreak.perkiraanKematian || 0);
        const k = Number(outbreak.korban || d * 2 || 1);
        totalPenyakitDeaths += d;
        totalPenyakitVictims += k;
      });

      // Jika tidak ada wabah aktif, gunakan estimasi rasio kematian kesehatan harian
      const baseHealthRate = totalPenyakitVictims > 0
        ? (totalPenyakitDeaths / totalPenyakitVictims) * 100
        : Math.max(0.1, Number(cd?.healthDeathRatePercent ?? 1.8));

      const deathsCount = totalPenyakitDeaths > 0
        ? totalPenyakitDeaths
        : Math.round((populasi * (baseHealthRate / 100)) / 365);

      const isUnlocked = baseHealthRate <= 20;
      const current = Math.min(100, Math.max(0, Math.round(100 - baseHealthRate)));

      return {
        current,
        target: 100,
        isUnlocked,
        extraBadges: [
          {
            label: `Mortalitas Penyakit: ${baseHealthRate.toFixed(1)}%`,
            colorClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
            icon: Skull,
          },
          {
            label: `Estimasi Jiwa Terancam: ${deathsCount.toLocaleString('id-ID')} jiwa`,
            colorClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
            icon: Users2,
          },
        ],
      };
    },
  },
  {
    // Logika 4: Pertumbuhan Terjaga (Populasi tetap surplus 6 bulan berturut-turut tanpa defisit)
    id: 'pertumbuhan_terjaga',
    category: 'populasi',
    icon: TrendingUp,
    accent: '#2563eb',
    maxProgress: 6,
    reward: { gems: 200, neo: 60000000 },
    computeProgress: (cd) => {
      // Ambil streak bulan surplus populasi
      const surplusStreak = Number(cd?.population_surplus_months_streak ?? 6);
      const current = Math.min(6, Math.max(0, surplusStreak));
      const isUnlocked = current >= 6;

      return {
        current,
        target: 6,
        isUnlocked,
        extraBadges: [
          {
            label: `Surplus Berjalan: ${current} / 6 Bulan`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
            icon: TrendingUp,
          },
        ],
      };
    },
  },

  // ═══ 3. PRODUKSI & KONSUMSI ═══
  {
    id: 'mandiri_energi',
    category: 'produksi',
    icon: Zap,
    accent: '#f59e0b',
    maxProgress: 100,
    reward: { gems: 200, neo: 80000000 },
    computeProgress: (cd) => {
      const defisit = cd?.listrikDefisit ?? 0;
      return { current: defisit === 0 ? 100 : 50, isUnlocked: defisit === 0 };
    },
  },
  {
    id: 'lumbung_pangan',
    category: 'produksi',
    icon: Zap,
    accent: '#fbbf24',
    maxProgress: 1,
    reward: { gems: 180, neo: 70000000 },
    computeProgress: (cd) => {
      const surplus = cd?.panganSurplus ?? true;
      return { current: surplus ? 1 : 0, isUnlocked: Boolean(surplus) };
    },
  },
  // Note: 'rantai_produksi_lengkap' dihapus sesuai poin permintaan nomor 5!

  // ═══ 4. EKONOMI ═══
  {
    // Logika 6: Anggaran Sehat (Surplus anggaran stabil selama 1 atau 2 tahun dengan tanggal evaluasi)
    id: 'anggaran_sehat',
    category: 'ekonomi',
    icon: Landmark,
    accent: '#10b981',
    maxProgress: 12,
    reward: { gems: 250, neo: 100000000 },
    computeProgress: (cd, currentDate) => {
      const now = currentDate || new Date();
      const currentYear = now.getFullYear();
      const targetYear = currentYear + 1;
      const targetDateFormatted = `31/12/${targetYear}`;

      const surplusMonths = Number(cd?.budgetSurplusMonths ?? cd?.surplus_months ?? 12);
      const current = Math.min(12, Math.max(0, surplusMonths));
      const isUnlocked = current >= 12;

      return {
        current,
        target: 12,
        isUnlocked,
        extraBadges: [
          {
            label: `Durasi Target: 1 Tahun (hingga ${targetDateFormatted})`,
            colorClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
            icon: Calendar,
          },
          {
            label: `Surplus Tercatat: ${current} / 12 Bulan`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          },
        ],
      };
    },
  },
  {
    id: 'bebas_utang',
    category: 'ekonomi',
    icon: Landmark,
    accent: '#059669',
    maxProgress: 1,
    reward: { gems: 300, neo: 150000000 },
    computeProgress: (cd) => {
      const loans = cd?.activeLoans ?? 0;
      return { current: loans === 0 ? 1 : 0, isUnlocked: loans === 0 };
    },
  },
  {
    // Logika 7: Mitra Dagang Dunia (Terhubung dengan Pasar Perdagangan Global jika menekan Jual, Beli, atau Jual Semua menambah kas)
    id: 'mitra_dagang_dunia',
    category: 'ekonomi',
    icon: Globe,
    accent: '#34d399',
    maxProgress: 1,
    reward: { gems: 200, neo: 75000000 },
    computeProgress: (cd) => {
      const history = Array.isArray(cd?.tradeHistory) ? cd.tradeHistory : [];
      // Cek apakah ada riwayat jual atau beli atau aksi pasar global
      const hasExecutedTrade = history.some((t: any) => t && (t.tipe === 'jual' || t.tipe === 'beli') && Number(t.biaya) > 0);
      const manualTradeCounter = Number(cd?.globalMarketTransactionsCount || (hasExecutedTrade ? 1 : 0));
      const isUnlocked = manualTradeCounter >= 1;

      return {
        current: isUnlocked ? 1 : 0,
        target: 1,
        isUnlocked,
        extraBadges: [
          {
            label: isUnlocked ? 'Transaksi Pasar Global: Selesai' : 'Belum Ada Transaksi Global',
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          },
        ],
      };
    },
  },
  {
    // Logika 8: Daya Beli Terjaga (Target bertahap: 65 -> 75 -> 80 untuk Kepuasan Harga Barang Pokok)
    id: 'daya_beli_terjaga',
    category: 'ekonomi',
    icon: Landmark,
    accent: '#6ee7b7',
    maxProgress: 100,
    reward: { gems: 200, neo: 60000000 },
    computeProgress: (cd, _, state) => {
      // Ambil skor kepuasan harga barang pokok yang identik dengan modal Info Daya Beli (HargaModal)
      const prices = cd?.harga || {};
      const subsidyActive = Boolean(cd?.subsidyActive);
      const priceEntries = Object.entries(prices).filter(([k]) => k.startsWith('harga_'));

      let calculatedHarga = 50;
      if (priceEntries.length > 0) {
        const minPrice = 10000;
        const maxPrice = 100000;
        let totalScore = 0;
        for (const [, value] of priceEntries) {
          const valNum = Number(value) || 0;
          let score = 100 - ((valNum - minPrice) / (maxPrice - minPrice)) * 100;
          score = Math.min(100, Math.max(0, score));
          totalScore += score;
        }
        let avgScore = totalScore / priceEntries.length;
        if (subsidyActive) avgScore = Math.min(100, avgScore + 5);
        calculatedHarga = Math.round(avgScore);
      } else if (cd?.satisfaction?.price !== undefined) {
        calculatedHarga = Number(cd.satisfaction.price);
      } else if (cd?.priceSatisfaction !== undefined) {
        calculatedHarga = Number(cd.priceSatisfaction);
      } else if (cd?.sectorsSatisfaction?.harga !== undefined) {
        calculatedHarga = Number(cd.sectorsSatisfaction.harga);
      }

      const currentVal = Math.max(0, Math.min(100, Math.round(calculatedHarga)));

      // Tingkat target: 0 -> 65, 1 -> 75, 2 -> 80
      const tierIndex = state?.milestones?.daya_beli_tier ?? 0;
      const targets = [65, 75, 80];
      const targetVal = targets[Math.min(tierIndex, targets.length - 1)];

      const isUnlocked = currentVal >= targetVal;

      return {
        current: currentVal,
        target: targetVal,
        isUnlocked,
        dynamicDescription: `Petunjuk: Pertahankan indeks kepuasan rakyat atas harga barang pokok hingga mencapai minimal ${targetVal}/100. Atur harga kebutuhan pokok pada Menu Daya Beli atau aktifkan subsidi harga.`,
        extraBadges: [
          {
            label: `Target Tahap ${tierIndex + 1}: ${targetVal}/100`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          },
          {
            label: `Indeks Kepuasan Harga Pokok: ${currentVal}/100`,
            colorClass: 'bg-root-accent/15 text-root-accent border-root-accent/30',
          },
        ],
      };
    },
  },

  // ═══ 5. PEMBANGUNAN (16 Kategori Tab: Produksi, Layanan Umum, Hunian) ═══
  ...BUILDING_ACHIEVEMENT_CATEGORIES.filter(c => c.category === 'pembangunan').map((cfg) => {
    return {
      id: cfg.id,
      category: 'pembangunan' as AchievementCategory,
      icon: cfg.icon,
      accent: cfg.accent,
      maxProgress: 100,
      reward: BUILDING_TIER_REWARDS[0],
      computeProgress: (cd: any, _curDate?: Date, state?: AchievementState) => {
        const tier = Number(state?.milestones?.[`${cfg.id}_tier`] ?? 0);
        const stage = Math.min(3, tier + 1);
        const target = BUILDING_TIER_TARGETS[Math.min(2, tier)];
        const totalNow = countBuildingsForCategory(cd, cfg.keys);
        
        // Baseline initial bangunan saat pertama kali misi aktif
        const baseline = state?.baselines?.[cfg.id] ?? totalNow;
        const currentDelta = Math.max(0, totalNow - baseline);
        const isUnlocked = tier >= 3 || currentDelta >= target;
        const progressCurrent = Math.min(target, currentDelta);

        return {
          current: progressCurrent,
          target,
          isUnlocked,
          extraBadges: [
            {
              label: tier >= 3 
                ? 'Pembangunan Selesai (+5.000 Bangunan)'
                : `Target Tahap ${stage}: +${target.toLocaleString()} Bangunan Baru`,
              colorClass: isUnlocked 
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                : 'bg-root-accent/15 text-root-accent border-root-accent/30',
            },
            {
              label: `Bangunan Baru: ${progressCurrent.toLocaleString()} / ${target.toLocaleString()}`,
              colorClass: isUnlocked
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-root-accent/15 text-root-accent border-root-accent/30',
            },
            {
              label: `Total Fasilitas: ${totalNow.toLocaleString()}`,
              colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
            },
          ],
        };
      },
    };
  }),

  // ═══ 6. PENELITIAN (3 Sektor: Riset Ekonomi & Industri [12], Riset Militer & Pertahanan [18], Riset Diplomasi & Intelijen [25]) ═══
  {
    id: 'riset_ekonomi_industri',
    category: 'penelitian',
    icon: Banknote,
    accent: '#38bdf8',
    maxProgress: 12,
    reward: { gems: 250, neo: 100000000 },
    computeProgress: (cd) => {
      const current = countCompletedResearchInSector(cd, RESEARCH_SECTOR_CARDS.ekonomi);
      const target = 12;
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: 'Petunjuk: Selesaikan seluruh 12 proyek penelitian di sektor Riset Ekonomi & Industri pada Pusat Penelitian & Riset Nasional.',
        extraBadges: [
          {
            label: isUnlocked ? 'Sektor Selesai (12/12)' : 'Target: Selesaikan 12 Riset',
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-root-accent/15 text-root-accent border-root-accent/30',
          },
          {
            label: `Progres Riset: ${current} / 12 Selesai`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'riset_militer_pertahanan',
    category: 'penelitian',
    icon: Shield,
    accent: '#f43f5e',
    maxProgress: 18,
    reward: { gems: 350, neo: 150000000 },
    computeProgress: (cd) => {
      const current = countCompletedResearchInSector(cd, RESEARCH_SECTOR_CARDS.militer);
      const target = 18;
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: 'Petunjuk: Selesaikan seluruh 18 proyek penelitian di sektor Riset Militer & Pertahanan pada Pusat Penelitian & Riset Nasional.',
        extraBadges: [
          {
            label: isUnlocked ? 'Sektor Selesai (18/18)' : 'Target: Selesaikan 18 Riset',
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          },
          {
            label: `Progres Riset: ${current} / 18 Selesai`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'riset_diplomasi_intelijen',
    category: 'penelitian',
    icon: Globe2,
    accent: '#06b6d4',
    maxProgress: 25,
    reward: { gems: 500, neo: 250000000 },
    computeProgress: (cd) => {
      const current = countCompletedResearchInSector(cd, RESEARCH_SECTOR_CARDS.diplomasi);
      const target = 25;
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: 'Petunjuk: Selesaikan seluruh 25 proyek penelitian di sektor Riset Diplomasi & Intelijen pada Pusat Penelitian & Riset Nasional.',
        extraBadges: [
          {
            label: isUnlocked ? 'Sektor Selesai (25/25)' : 'Target: Selesaikan 25 Riset',
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          },
          {
            label: `Progres Riset: ${current} / 25 Selesai`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },

  // ═══ 7. KEMENTERIAN & KABINET (3 Tab: Kementerian [15], Keamanan [4], Layanan [2] - Seluruh 20 Kotak/Level Terisi) ═══
  {
    id: 'kementerian_sempurna',
    category: 'kementerian',
    icon: Briefcase,
    accent: '#0ea5e9',
    maxProgress: 15,
    reward: { gems: 300, neo: 120000000 },
    computeProgress: (cd) => {
      const { maxedCount, totalCount, allMaxed } = countMinistryMaxedDepartments(cd, MINISTRY_DEPARTMENTS_CONFIG.kementerian);
      const isUnlocked = allMaxed;
      return {
        current: maxedCount,
        target: totalCount,
        isUnlocked,
        dynamicDescription: 'Petunjuk: Tingkatkan seluruh 15 kementerian pada tab Kementerian hingga mencapai Level 20/20 (seluruh 20 kotak terisi).',
        extraBadges: [
          {
            label: isUnlocked ? 'Seluruh 20 Kotak Terisi (15/15)' : 'Target: 15 Kementerian Level 20/20',
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-root-accent/15 text-root-accent border-root-accent/30',
          },
          {
            label: `Maksimal 20/20: ${maxedCount} / ${totalCount} Departemen`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'keamanan_sempurna',
    category: 'kementerian',
    icon: Shield,
    accent: '#f43f5e',
    maxProgress: 4,
    reward: { gems: 250, neo: 90000000 },
    computeProgress: (cd) => {
      const { maxedCount, totalCount, allMaxed } = countMinistryMaxedDepartments(cd, MINISTRY_DEPARTMENTS_CONFIG.keamanan);
      const isUnlocked = allMaxed;
      return {
        current: maxedCount,
        target: totalCount,
        isUnlocked,
        dynamicDescription: 'Petunjuk: Tingkatkan seluruh 4 departemen keamanan pada tab Keamanan hingga mencapai Level 20/20 (seluruh 20 kotak terisi).',
        extraBadges: [
          {
            label: isUnlocked ? 'Seluruh 20 Kotak Terisi (4/4)' : 'Target: 4 Keamanan Level 20/20',
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          },
          {
            label: `Maksimal 20/20: ${maxedCount} / ${totalCount} Departemen`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'layanan_sempurna',
    category: 'kementerian',
    icon: Landmark,
    accent: '#eab308',
    maxProgress: 2,
    reward: { gems: 200, neo: 75000000 },
    computeProgress: (cd) => {
      const { maxedCount, totalCount, allMaxed } = countMinistryMaxedDepartments(cd, MINISTRY_DEPARTMENTS_CONFIG.layanan);
      const isUnlocked = allMaxed;
      return {
        current: maxedCount,
        target: totalCount,
        isUnlocked,
        dynamicDescription: 'Petunjuk: Tingkatkan seluruh 2 institusi layanan pada tab Layanan hingga mencapai Level 20/20 (seluruh 20 kotak terisi).',
        extraBadges: [
          {
            label: isUnlocked ? 'Seluruh 20 Kotak Terisi (2/2)' : 'Target: 2 Layanan Level 20/20',
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          },
          {
            label: `Maksimal 20/20: ${maxedCount} / ${totalCount} Departemen`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },

  // ═══ 8. GEOPOLITIK & DIPLOMASI (10 Misi Target 100 Negara - Dinamis Berkurang Jika Sisa Negara di Dunia < 100) ═══
  {
    id: 'membangun_kedutaan_besar',
    category: 'geopolitik',
    icon: Building2,
    accent: '#38bdf8',
    maxProgress: 100,
    reward: { gems: 350, neo: 150000000 },
    computeProgress: (cd) => {
      const target = getDynamicTargetCountryCount(cd);
      const count = getActiveEmbassiesCount(cd);
      const current = Math.min(target, Math.max(0, count));
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: `Petunjuk: Bangun kedutaan besar resmi di seluruh ${target} negara mitra di dunia.`,
        extraBadges: [
          {
            label: isUnlocked ? `Kedutaan Lengkap (${target}/${target})` : `Target: ${target} Negara`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-root-accent/15 text-root-accent border-root-accent/30',
          },
          {
            label: `Progres: ${current} / ${target} Negara`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'pakta_non_agresi',
    category: 'geopolitik',
    icon: Shield,
    accent: '#60a5fa',
    maxProgress: 100,
    reward: { gems: 350, neo: 150000000 },
    computeProgress: (cd) => {
      const target = getDynamicTargetCountryCount(cd);
      const pacts = Array.isArray(cd?.nonAggressionPacts) ? cd.nonAggressionPacts : [];
      const count = countUniqueDiplomaticPartners(pacts, cd) || Number(cd?.nonAggressionPactsCount ?? 0);
      const current = Math.min(target, Math.max(0, count));
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: `Petunjuk: Sepakati dan tandatangani perjanjian pakta non-agresi bersama seluruh ${target} negara mitra di dunia.`,
        extraBadges: [
          {
            label: isUnlocked ? `Pakta Lengkap (${target}/${target})` : `Target: ${target} Negara`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-root-accent/15 text-root-accent border-root-accent/30',
          },
          {
            label: `Progres: ${current} / ${target} Negara`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'aliansi_pertahanan',
    category: 'geopolitik',
    icon: Shield,
    accent: '#3b82f6',
    maxProgress: 100,
    reward: { gems: 500, neo: 250000000 },
    computeProgress: (cd) => {
      const target = getDynamicTargetCountryCount(cd);
      const alliances = Array.isArray(cd?.defenseAlliances) ? cd.defenseAlliances : [];
      const count = countUniqueDiplomaticPartners(alliances, cd) || Number(cd?.defenseAlliancesCount ?? 0);
      const current = Math.min(target, Math.max(0, count));
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: `Petunjuk: Bentuk pakta pertahanan militer aliansi bersama seluruh ${target} negara mitra di dunia.`,
        extraBadges: [
          {
            label: isUnlocked ? `Aliansi Lengkap (${target}/${target})` : `Target: ${target} Negara`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-root-accent/15 text-root-accent border-root-accent/30',
          },
          {
            label: `Progres: ${current} / ${target} Negara`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'perjanjian_dagang',
    category: 'geopolitik',
    icon: HeartHandshake,
    accent: '#10b981',
    maxProgress: 100,
    reward: { gems: 400, neo: 200000000 },
    computeProgress: (cd) => {
      const target = getDynamicTargetCountryCount(cd);
      const count = getActiveTradeAgreementsCount(cd);
      const current = Math.min(target, Math.max(0, count));
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: `Petunjuk: Jalin kerja sama kemitraan ekonomi dan ratifikasi perjanjian dagang bilateral dengan seluruh ${target} negara mitra di dunia.`,
        extraBadges: [
          {
            label: isUnlocked ? `Perjanjian Lengkap (${target}/${target})` : `Target: ${target} Negara`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-root-accent/15 text-root-accent border-root-accent/30',
          },
          {
            label: `Progres: ${current} / ${target} Negara`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'kontrak_penelitian',
    category: 'geopolitik',
    icon: Microscope,
    accent: '#06b6d4',
    maxProgress: 100,
    reward: { gems: 400, neo: 200000000 },
    computeProgress: (cd) => {
      const target = getDynamicTargetCountryCount(cd);
      const contracts = Array.isArray(cd?.researchContracts) ? cd.researchContracts : [];
      const count = countUniqueDiplomaticPartners(contracts, cd) || Number(cd?.researchContractsCount ?? 0);
      const current = Math.min(target, Math.max(0, count));
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: `Petunjuk: Sepakati kontrak kerja sama riset dan sains bilateral bersama seluruh ${target} negara mitra di dunia.`,
        extraBadges: [
          {
            label: isUnlocked ? `Kontrak Lengkap (${target}/${target})` : `Target: ${target} Negara`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-root-accent/15 text-root-accent border-root-accent/30',
          },
          {
            label: `Progres: ${current} / ${target} Negara`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'beri_tentara',
    category: 'geopolitik',
    icon: Sword,
    accent: '#ef4444',
    maxProgress: 100,
    reward: { gems: 450, neo: 220000000 },
    computeProgress: (cd) => {
      const target = getDynamicTargetCountryCount(cd);
      const troops = Array.isArray(cd?.diplomaticTroopsSent) ? cd.diplomaticTroopsSent : [];
      const count = countUniqueDiplomaticPartners(troops, cd) || Number(cd?.troopsSentCount ?? 0);
      const current = Math.min(target, Math.max(0, count));
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: `Petunjuk: Salurkan kontribusi bantuan pasukan tentara militer ke seluruh ${target} negara mitra di dunia.`,
        extraBadges: [
          {
            label: isUnlocked ? `Bantuan Lengkap (${target}/${target})` : `Target: ${target} Negara`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          },
          {
            label: `Progres: ${current} / ${target} Negara`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'beri_hadiah',
    category: 'geopolitik',
    icon: Gift,
    accent: '#ec4899',
    maxProgress: 100,
    reward: { gems: 350, neo: 150000000 },
    computeProgress: (cd) => {
      const target = getDynamicTargetCountryCount(cd);
      const gifts = Array.isArray(cd?.diplomaticGiftsSent) ? cd.diplomaticGiftsSent : [];
      const count = countUniqueDiplomaticPartners(gifts, cd) || Number(cd?.diplomaticGiftsSentCount ?? 0);
      const current = Math.min(target, Math.max(0, count));
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: `Petunjuk: Kirimkan dana bantuan dan hibah hadiah diplomasi ke seluruh ${target} negara mitra di dunia.`,
        extraBadges: [
          {
            label: isUnlocked ? `Hadiah Lengkap (${target}/${target})` : `Target: ${target} Negara`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-pink-500/15 text-pink-300 border-pink-500/30',
          },
          {
            label: `Progres: ${current} / ${target} Negara`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'tingkatkan_hubungan',
    category: 'geopolitik',
    icon: HeartHandshake,
    accent: '#f97316',
    maxProgress: 100,
    reward: { gems: 350, neo: 160000000 },
    computeProgress: (cd) => {
      const target = getDynamicTargetCountryCount(cd);
      const improved = Array.isArray(cd?.relationsImproved) ? cd.relationsImproved : [];
      const count = countUniqueDiplomaticPartners(improved, cd) || Number(cd?.relationsImprovedCount ?? 0);
      const current = Math.min(target, Math.max(0, count));
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: `Petunjuk: Lakukan diplomasi bilateral intensif guna meningkatkan hubungan dengan seluruh ${target} negara mitra di dunia.`,
        extraBadges: [
          {
            label: isUnlocked ? `Hubungan Lengkap (${target}/${target})` : `Target: ${target} Negara`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-orange-500/15 text-orange-300 border-orange-500/30',
          },
          {
            label: `Progres: ${current} / ${target} Negara`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'minta_bantuan',
    category: 'geopolitik',
    icon: PhoneCall,
    accent: '#a855f7',
    maxProgress: 100,
    reward: { gems: 400, neo: 180000000 },
    computeProgress: (cd) => {
      const target = getDynamicTargetCountryCount(cd);
      const requests = Array.isArray(cd?.aidRequests) ? cd.aidRequests : [];
      const count = countUniqueDiplomaticPartners(requests, cd) || Number(cd?.aidRequestedCount ?? 0);
      const current = Math.min(target, Math.max(0, count));
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: `Petunjuk: Ajukan dan terima permohonan bantuan diplomasi dari seluruh ${target} negara mitra di dunia.`,
        extraBadges: [
          {
            label: isUnlocked ? `Bantuan Lengkap (${target}/${target})` : `Target: ${target} Negara`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          },
          {
            label: `Progres: ${current} / ${target} Negara`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'berikan_wilayah',
    category: 'geopolitik',
    icon: MapIcon,
    accent: '#eab308',
    maxProgress: 25,
    reward: { gems: 500, neo: 250000000 },
    computeProgress: (cd) => {
      const target = getDynamicTargetCountryCount(cd, 25);
      const ceded = Array.isArray(cd?.territoriesCeded) ? cd.territoriesCeded : [];
      const count = countUniqueDiplomaticPartners(ceded, cd) || Number(cd?.territoriesCededCount ?? 0);
      const current = Math.min(target, Math.max(0, count));
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: `Petunjuk: Selesaikan kesepakatan geopolitik transfer wilayah dengan ${target} negara mitra di dunia.`,
        extraBadges: [
          {
            label: isUnlocked ? `Transfer Selesai (${target}/${target})` : `Target: ${target} Negara`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          },
          {
            label: `Progres: ${current} / ${target} Negara`,
            colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },

  // ═══ 9. SOSIAL & BUDAYA (Hanya 2 Misi: Agama & Ideologi Menyesuaikan Jumlah Kesamaan Dunia) ═══
  {
    id: 'kesamaan_agama',
    category: 'sosial_budaya',
    icon: BookOpen,
    accent: '#ec4899',
    maxProgress: 100,
    reward: { gems: 200, neo: 80000000 },
    computeProgress: (cd) => {
      const data = getSameReligionCountriesCount(cd);
      const current = data.count;
      const target = data.totalActiveCountries;
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: `Petunjuk: Saat ini ${current} dari ${target} negara di dunia menganut ${data.userReligion}. Selaraskan keyakinan dunia untuk mencapai kesatuan keyakinan global.`,
        extraBadges: [
          {
            label: `Agama: ${data.userReligion}`,
            colorClass: 'bg-root-accent/15 text-root-accent border-root-accent/30',
          },
          {
            label: `Seagama: ${current} / ${target} Negara`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },
  {
    id: 'kesamaan_ideologi',
    category: 'sosial_budaya',
    icon: Flame,
    accent: '#f43f5e',
    maxProgress: 100,
    reward: { gems: 200, neo: 80000000 },
    computeProgress: (cd) => {
      const data = getSameIdeologyCountriesCount(cd);
      const current = data.count;
      const target = data.totalActiveCountries;
      const isUnlocked = current >= target;
      return {
        current,
        target,
        isUnlocked,
        dynamicDescription: `Petunjuk: Saat ini ${current} dari ${target} negara di dunia berideologi ${data.userIdeology}. Perluas pengaruh doktrin ideologi Anda ke seluruh negara di dunia.`,
        extraBadges: [
          {
            label: `Ideologi: ${data.userIdeology}`,
            colorClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          },
          {
            label: `Seideologi: ${current} / ${target} Negara`,
            colorClass: isUnlocked ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-root-surface/50 text-root-text/80 border-root-border/40',
          },
        ],
      };
    },
  },

  // ═══ 10. PERTAHANAN (Termasuk Tab Infrastruktur Militer) ═══
  ...BUILDING_ACHIEVEMENT_CATEGORIES.filter(c => c.category === 'pertahanan').map((cfg) => {
    return {
      id: cfg.id,
      category: 'pertahanan' as AchievementCategory,
      icon: cfg.icon,
      accent: cfg.accent,
      maxProgress: 100,
      reward: BUILDING_TIER_REWARDS[0],
      computeProgress: (cd: any, _curDate?: Date, state?: AchievementState) => {
        const tier = Number(state?.milestones?.[`${cfg.id}_tier`] ?? 0);
        const stage = Math.min(3, tier + 1);
        const target = BUILDING_TIER_TARGETS[Math.min(2, tier)];
        const totalNow = countBuildingsForCategory(cd, cfg.keys);
        
        // Baseline initial bangunan saat pertama kali misi aktif
        const baseline = state?.baselines?.[cfg.id] ?? totalNow;
        const currentDelta = Math.max(0, totalNow - baseline);
        const isUnlocked = tier >= 3 || currentDelta >= target;
        const progressCurrent = Math.min(target, currentDelta);

        return {
          current: progressCurrent,
          target,
          isUnlocked,
          extraBadges: [
            {
              label: tier >= 3 
                ? 'Pembangunan Selesai (+5.000 Bangunan)'
                : `Target Tahap ${stage}: +${target.toLocaleString()} Bangunan Baru`,
              colorClass: isUnlocked 
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                : 'bg-root-accent/15 text-root-accent border-root-accent/30',
            },
            {
              label: `Bangunan Baru: ${progressCurrent.toLocaleString()} / ${target.toLocaleString()}`,
              colorClass: isUnlocked
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-root-accent/15 text-root-accent border-root-accent/30',
            },
            {
              label: `Total Fasilitas: ${totalNow.toLocaleString()}`,
              colorClass: 'bg-root-surface/50 text-root-text/80 border-root-border/40',
            },
          ],
        };
      },
    };
  }),
  
  {
    id: 'penjaga_negeri',
    category: 'pertahanan',
    icon: Shield,
    accent: '#ef4444',
    maxProgress: 10,
    reward: { gems: 220, neo: 85000000 },
    computeProgress: (cd) => {
      const militaryUnits = cd?.militaryPower ?? 8;
      const current = Math.min(10, militaryUnits);
      return { current, isUnlocked: current >= 10 };
    },
  },
  {
    id: 'mata_dan_telinga_negara',
    category: 'pertahanan',
    icon: Shield,
    accent: '#f87171',
    maxProgress: 3,
    reward: { gems: 180, neo: 65000000 },
    computeProgress: (cd) => {
      const spySuccess = cd?.intelOperationsSuccess ?? 1;
      const current = Math.min(3, spySuccess);
      return { current, isUnlocked: current >= 3 };
    },
  },
  {
    id: 'wilayah_terkelola',
    category: 'pertahanan',
    icon: Shield,
    accent: '#b91c1c',
    maxProgress: 1,
    reward: { gems: 250, neo: 100000000 },
    computeProgress: (cd) => {
      const hasAnnexed = (cd?.annexedTerritories?.length || 0) > 0;
      const isUnlocked = !hasAnnexed || Boolean(cd?.annexedStabilized);
      return { current: isUnlocked ? 1 : 0, isUnlocked };
    },
  },
  {
    id: 'kesiapan_strategis',
    category: 'pertahanan',
    icon: Shield,
    accent: '#dc2626',
    maxProgress: 1,
    reward: { gems: 300, neo: 120000000 },
    computeProgress: (cd) => {
      const hasDefenseHQ = Boolean(cd?.buildings?.markas_pertahanan || cd?.hasDefenseTech);
      return { current: hasDefenseHQ ? 1 : 0, isUnlocked: hasDefenseHQ };
    },
  },

  // ═══ 11. TANGGAP DARURAT ═══
  {
    id: 'tanggap_bencana',
    category: 'tanggap_darurat',
    icon: Siren,
    accent: '#eab308',
    maxProgress: 3,
    reward: { gems: 180, neo: 70000000 },
    computeProgress: (cd) => {
      const disasterResolved = cd?.disasterResolvedCount ?? 1;
      const current = Math.min(3, disasterResolved);
      return { current, isUnlocked: current >= 3 };
    },
  },
  {
    id: 'krisis_teratasi',
    category: 'tanggap_darurat',
    icon: Siren,
    accent: '#ca8a04',
    maxProgress: 2,
    reward: { gems: 200, neo: 80000000 },
    computeProgress: (cd) => {
      const epidemicHandled = cd?.epidemicHandledCount ?? 1;
      const current = Math.min(2, epidemicHandled);
      return { current, isUnlocked: current >= 2 };
    },
  },
  {
    id: 'negara_tangguh',
    category: 'tanggap_darurat',
    icon: Siren,
    accent: '#a16207',
    maxProgress: 1,
    reward: { gems: 250, neo: 90000000 },
    computeProgress: (cd) => {
      const resilient = cd?.postCrisisRestored ?? true;
      return { current: resilient ? 1 : 0, isUnlocked: Boolean(resilient) };
    },
  },
];

interface PencapaianModalsProps {
  countryDetail?: any;
  setCountryDetail?: (updater: any) => void;
  currentDate?: Date;
}

export function PencapaianContent({ countryDetail, setCountryDetail, currentDate }: PencapaianModalsProps) {
  const { t } = useLanguage();
  const [filterStatus, setFilterStatus] = useState<'all' | 'locked' | 'unlocked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load state from localStorage or countryDetail
  const [achievementState, setAchievementState] = useState<AchievementState>(() => {
    if (typeof window === 'undefined') {
      return { claimed: {}, milestones: {}, baselines: {} };
    }
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ACHIEVEMENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          claimed: parsed.claimed || {},
          milestones: parsed.milestones || {},
          baselines: parsed.baselines || {},
        };
      }
    } catch {}
    return {
      claimed: countryDetail?.achievementsClaimed || {},
      milestones: countryDetail?.achievementMilestones || {},
      baselines: countryDetail?.achievementBaselines || {},
    };
  });

  const saveAchievementState = (nextState: AchievementState) => {
    setAchievementState(nextState);
    try {
      localStorage.setItem(LOCAL_STORAGE_ACHIEVEMENTS_KEY, JSON.stringify(nextState));
    } catch {}
    if (setCountryDetail) {
      setCountryDetail((prev: any) => ({
        ...prev,
        achievementsClaimed: nextState.claimed,
        achievementMilestones: nextState.milestones,
        achievementBaselines: nextState.baselines,
      }));
    }
  };

  // Inisialisasi Baseline Jumlah Bangunan saat ini jika belum tercatat
  // Agar bangunan bawaan/sebelumnya tidak langsung terhitung (hanya bangunan baru yang dihitung!)
  useEffect(() => {
    if (!countryDetail) return;
    let baselinesChanged = false;
    const currentBaselines = { ...(achievementState.baselines || {}) };

    BUILDING_ACHIEVEMENT_CATEGORIES.forEach((cfg) => {
      if (currentBaselines[cfg.id] === undefined) {
        const totalNow = countBuildingsForCategory(countryDetail, cfg.keys);
        currentBaselines[cfg.id] = totalNow;
        baselinesChanged = true;
      }
    });

    if (baselinesChanged) {
      saveAchievementState({
        ...achievementState,
        baselines: currentBaselines,
      });
    }
  }, [countryDetail]);

  // Evaluate all achievements
  const evaluatedAchievements = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      const computed = def.computeProgress(countryDetail, currentDate, achievementState);
      const isClaimed = Boolean(achievementState.claimed[def.id]);
      const isReadyToClaim = computed.isUnlocked && !isClaimed;
      const maxTarget = computed.target ?? def.maxProgress;

      // Dynamic reward calculation for 3-tier building achievements
      let currentReward = def.reward;
      if (def.id.startsWith('bangun_')) {
        const tier = Number(achievementState.milestones?.[`${def.id}_tier`] ?? 0);
        currentReward = BUILDING_TIER_REWARDS[Math.min(2, tier)] || def.reward;
      }

      return {
        ...def,
        currentProgress: computed.current,
        maxProgress: maxTarget,
        isUnlocked: computed.isUnlocked,
        isClaimed,
        isReadyToClaim,
        extraBadges: computed.extraBadges,
        dynamicDescription: computed.dynamicDescription,
        dynamicTitle: computed.dynamicTitle,
      };
    });
  }, [countryDetail, currentDate, achievementState]);

  const totalUnlocked = useMemo(() => {
    return evaluatedAchievements.filter((a) => a.isUnlocked).length;
  }, [evaluatedAchievements]);

  // Filtered list
  const filteredList = useMemo(() => {
    return evaluatedAchievements.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (filterStatus === 'unlocked' && !item.isUnlocked) {
        return false;
      }
      if (filterStatus === 'locked' && item.isUnlocked) {
        return false;
      }
      return true;
    });
  }, [evaluatedAchievements, selectedCategory, filterStatus]);

  const handleClaim = (item: typeof evaluatedAchievements[0]) => {
    if (!item.isReadyToClaim) return;

    // Handle multistep milestone progression
    let nextMilestones = { ...achievementState.milestones };
    let shouldLockAgainForNextTier = false;

    // Cek 17 kategori pembangunan & militer (3 tahap: 100 -> 1000 -> 5000)
    let nextBaselines = { ...(achievementState.baselines || {}) };
    if (item.id.startsWith('bangun_')) {
      const tierKey = `${item.id}_tier`;
      const currentTier = nextMilestones[tierKey] ?? 0;
      const bConfig = BUILDING_ACHIEVEMENT_CATEGORIES.find(c => c.id === item.id);
      const totalNow = bConfig ? countBuildingsForCategory(countryDetail, bConfig.keys) : 0;

      if (currentTier < 2) {
        // Tahap 1 (100) -> Tahap 2 (1000) -> Tahap 3 (5000)
        nextMilestones[tierKey] = currentTier + 1;
        // Reset baseline ke total bangunan saat ini agar tahap berikutnya menghitung +1.000 / +5.000 bangunan baru lagi
        nextBaselines[item.id] = totalNow;
        shouldLockAgainForNextTier = true; // resets claimed so user can claim next stage!
      } else {
        // Tahap 3 claimed -> Completed
        nextMilestones[tierKey] = 3;
        nextBaselines[item.id] = totalNow;
        shouldLockAgainForNextTier = false;
      }
    } else if (item.id === 'negara_sejahtera') {
      const currentTier = nextMilestones.negara_sejahtera_tier ?? 0;
      if (item.maxProgress < 100) {
        nextMilestones.negara_sejahtera_tier = currentTier + 1;
        shouldLockAgainForNextTier = true; // resets claimed so user can claim next tier when reached!
      }
    } else if (item.id === 'kebahagiaan_merata') {
      const currentTier = nextMilestones.kebahagiaan_merata_tier ?? 0;
      if (item.maxProgress < 100) {
        nextMilestones.kebahagiaan_merata_tier = currentTier + 1;
        shouldLockAgainForNextTier = true;
      }
    } else if (item.id === 'daya_beli_terjaga') {
      const currentTier = nextMilestones.daya_beli_tier ?? 0;
      if (currentTier < 2) {
        // Tier 0 (65) -> Tier 1 (75) -> Tier 2 (80)
        nextMilestones.daya_beli_tier = currentTier + 1;
        shouldLockAgainForNextTier = true;
      }
    }

    const nextState: AchievementState = {
      ...achievementState,
      claimed: {
        ...achievementState.claimed,
        [item.id]: !shouldLockAgainForNextTier,
      },
      milestones: nextMilestones,
      baselines: nextBaselines,
    };
    saveAchievementState(nextState);

    // Apply reward to countryDetail
    if (setCountryDetail) {
      setCountryDetail((prev: any) => {
        const next = { ...prev };
        if (item.reward.gems) {
          next.gems = (next.gems || 0) + item.reward.gems;
        }
        if (item.reward.neo) {
          next.uangKas = (next.uangKas || 0) + item.reward.neo;
        }
        return next;
      });
    }

    const title = item.dynamicTitle || t(`side_pencapaian.items.${item.id}.title`) || item.id;
    const rewardText = [
      item.reward.gems ? `${item.reward.gems} Gems` : null,
      item.reward.neo ? `${item.reward.neo.toLocaleString('id-ID')} NEO` : null,
    ].filter(Boolean).join(' + ');

    const toast = (t('side_pencapaian.claimedToast') || '🎉 Selamat! Hadiah {title} diklaim: {reward}')
      .replace('{title}', title)
      .replace('{reward}', rewardText);

    setToastMessage(toast);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const categories = [
    { id: 'all', label: t('side_pencapaian.categories.all') },
    { id: 'kepuasan', label: t('side_pencapaian.categories.kepuasan') },
    { id: 'populasi', label: t('side_pencapaian.categories.populasi') },
    { id: 'produksi', label: t('side_pencapaian.categories.produksi') },
    { id: 'ekonomi', label: t('side_pencapaian.categories.ekonomi') },
    { id: 'pembangunan', label: t('side_pencapaian.categories.pembangunan') },
    { id: 'penelitian', label: t('side_pencapaian.categories.penelitian') },
    { id: 'kementerian', label: t('side_pencapaian.categories.kementerian') },
    { id: 'geopolitik', label: t('side_pencapaian.categories.geopolitik') },
    { id: 'sosial_budaya', label: t('side_pencapaian.categories.sosial_budaya') },
    { id: 'pertahanan', label: t('side_pencapaian.categories.pertahanan') },
    { id: 'tanggap_darurat', label: t('side_pencapaian.categories.tanggap_darurat') },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-root-canvas overflow-hidden">
      {/* HEADER / TOOLBAR FILTER */}
      <div className="shrink-0 p-3 sm:p-4 border-b border-root-accent/20 bg-root-surface/50 space-y-3">
        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
            <h2 className="text-sm font-black text-root-text uppercase tracking-wider">
              {t('side_pencapaian.title')}
            </h2>
            <span className="rounded-full bg-root-accent/15 border border-root-accent/30 px-2 py-0.5 text-[10px] font-black text-root-accent">
              {totalUnlocked} / {ACHIEVEMENT_DEFINITIONS.length} {t('side_pencapaian.totalUnlocked')}
            </span>
          </div>

          {/* Quick status filters */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase transition-colors ${
                filterStatus === 'all'
                  ? 'bg-root-accent text-root-accent-ink'
                  : 'bg-root-surface border border-root-accent/20 text-root-subtle hover:text-root-text'
              }`}
            >
              {t('side_pencapaian.filterAll')}
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('unlocked')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase transition-colors ${
                filterStatus === 'unlocked'
                  ? 'bg-root-accent text-root-accent-ink'
                  : 'bg-root-surface border border-root-accent/20 text-root-subtle hover:text-root-text'
              }`}
            >
              {t('side_pencapaian.filterUnlocked')}
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('locked')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase transition-colors ${
                filterStatus === 'locked'
                  ? 'bg-root-accent text-root-accent-ink'
                  : 'bg-root-surface border border-root-accent/20 text-root-subtle hover:text-root-text'
              }`}
            >
              {t('side_pencapaian.filterLocked')}
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'border-root-accent bg-root-accent/20 text-root-accent shadow-sm'
                    : 'border-root-accent/15 bg-root-surface text-root-subtle hover:border-root-accent/40 hover:text-root-text'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="m-3 p-3 rounded-xl border border-emerald-400/50 bg-emerald-500/15 text-xs font-black text-emerald-300 shadow-lg animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ACHIEVEMENT CARDS LIST */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar space-y-2.5">
        {filteredList.map((item) => {
          const Icon = item.icon;
          let title = item.dynamicTitle || t(`side_pencapaian.items.${item.id}.title`) || item.id;
          let description = item.dynamicDescription || t(`side_pencapaian.items.${item.id}.description`) || '';

          // Format dinamis untuk 17 kategori pembangunan & militer bertahap
          if (item.id.startsWith('bangun_')) {
            const bConfig = BUILDING_ACHIEVEMENT_CATEGORIES.find(c => c.id === item.id);
            if (bConfig) {
              const tier = Number(achievementState.milestones?.[`${item.id}_tier`] ?? 0);
              const stage = Math.min(3, tier + 1);
              const target = item.maxProgress || BUILDING_TIER_TARGETS[Math.min(2, tier)];
              
              const bldDoc = t('side_pencapaian.building_achievements') as any;
              const catName = bldDoc?.names?.[bConfig.nameKey] || bConfig.nameKey;
              
              if (bldDoc?.title_template) {
                title = bldDoc.title_template.replace('{name}', catName);
              }
              if (tier >= 3 && bldDoc?.finished_desc) {
                description = bldDoc.finished_desc.replace('{name}', catName).replace('{target}', '5.000');
              } else if (bldDoc?.desc_template) {
                description = bldDoc.desc_template.replace('{name}', catName).replace('{target}', target.toLocaleString());
              }
            }
          }
          // Inject {target} dinamis untuk misi diplomasi (target 100 negara atau sisa negara di dunia)
          if (item.category === 'geopolitik' && description.includes('{target}')) {
            description = description.replace(/{target}/g, String(item.maxProgress || 100));
          }

          // Inject template variables like {periodText} and {targetDate} for anggaran_sehat
          if (item.id === 'anggaran_sehat') {
            const now = currentDate || new Date();
            const targetYear = now.getFullYear() + 1;
            description = description
              .replace('{periodText}', '1 Tahun')
              .replace('{targetDate}', `31/12/${targetYear}`);
          }

          const categoryName = t(`side_pencapaian.categories.${item.category}`) || item.category;
          const pct = Math.min(100, Math.round((item.currentProgress / item.maxProgress) * 100));

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.isClaimed
                  ? 'border-emerald-500/30 bg-root-surface/60 opacity-90'
                  : item.isReadyToClaim
                  ? 'border-amber-400/60 bg-amber-500/10 shadow-md ring-1 ring-amber-400/30'
                  : item.isUnlocked
                  ? 'border-root-accent/30 bg-root-surface'
                  : 'border-root-accent/15 bg-root-surface/40 opacity-75'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: item.isUnlocked ? `${item.accent}20` : 'rgba(100,100,100,0.1)',
                    borderColor: item.isUnlocked ? `${item.accent}50` : 'rgba(100,100,100,0.2)',
                  }}
                >
                  {item.isClaimed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : item.isUnlocked ? (
                    <Icon className="h-5 w-5" style={{ color: item.accent }} />
                  ) : (
                    <Lock className="h-4 w-4 text-root-subtle" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-wider text-root-subtle">
                      {categoryName}
                    </span>
                    {item.isClaimed && (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 text-[8px] font-black uppercase">
                        {t('side_pencapaian.rewardClaimed')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-black text-root-text tracking-wide mt-0.5 truncate">
                    {title}
                  </h3>
                  <p className="text-[11px] text-root-subtle mt-0.5 line-clamp-3">
                    {description}
                  </p>

                  {/* Extra custom badges for dynamic indicators */}
                  {item.extraBadges && item.extraBadges.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {item.extraBadges.map((badge, bIdx) => {
                        const BadgeIcon = badge.icon;
                        return (
                          <span
                            key={bIdx}
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-bold ${badge.colorClass}`}
                          >
                            {BadgeIcon && <BadgeIcon className="h-2.5 w-2.5" />}
                            {badge.label}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-semibold text-root-subtle">
                      <span>{t('side_pencapaian.progress')}</span>
                      <span>
                        {item.currentProgress} / {item.maxProgress} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-root-canvas rounded-full overflow-hidden border border-root-accent/15">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.isUnlocked ? item.accent : 'var(--root-accent)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Reward & Action */}
              <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-root-accent/10">
                {/* Rewards preview */}
                <div className="flex items-center gap-1.5">
                  {item.reward.gems && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                      <Gem className="h-2.5 w-2.5 text-cyan-400" />
                      +{item.reward.gems}
                    </span>
                  )}
                  {item.reward.neo && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                      <Coins className="h-2.5 w-2.5 text-amber-400" />
                      +{(item.reward.neo / 1000000).toFixed(0)}M
                    </span>
                  )}
                </div>

                {/* Claim Button */}
                {item.isReadyToClaim ? (
                  <button
                    type="button"
                    onClick={() => handleClaim(item)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    {t('side_pencapaian.rewardReady')}
                  </button>
                ) : item.isClaimed ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('side_pencapaian.rewardClaimed')}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-root-subtle flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    {t('side_pencapaian.rewardLocked')}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="p-8 text-center text-root-subtle text-xs">
            Tidak ada pencapaian yang sesuai dengan filter.
          </div>
        )}
      </div>
    </div>
  );
}

export default PencapaianContent;
