'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FlaskConical, X, Sparkles, Cpu, Shield, Zap, BookOpen, Leaf, Globe2,
  Palette, Lock, CheckCircle2, Clock, Coins, Beaker, Atom, Rocket,
  Wifi, Crosshair, HeartPulse, Wheat, Banknote, Search, TrendingUp,
  ChevronUp,
} from 'lucide-react';
import {
  applyAtheismResearchSpeedBonus,
  ATHEISM_RESEARCH_SPEED_BONUS,
} from '@/app/page/bonus_logic/agama_bonus_logic/ateisme';
import {
  calculateEducationPoints,
  getEducationResearchModifier,
  calculateCombinedResearchDurationModifier,
  applyCombinedResearchDuration,
} from '@/app/page/downgrade_logic';
import { isMemberOfUNESCO, isMemberOfITU } from '@/app/page/bonus_logic';
import { RESEARCH_CARD_LEVEL_BONUS } from '@/app/page/bonus_logic/researchCardLevelBonus';
import {
  getMilitaryResearchBaseBonus,
  getMilitaryResearchLevelBonus,
} from '@/app/page/bonus_logic/militaryResearchBonus';
import { generateResearchStartNotification } from '../inbox/logic/11_notifikasi_penelitian/researchChangeLogic';

export type CategoryKey = 'ekonomi' | 'militer' | 'lingkungan' | 'diplomasi';

interface ResearchEffect {
  stat: string;
  value: number;
  label: string;
}

interface Research {
  id: string;
  name: string;
  category: CategoryKey;
  tier: number; // Tier 1, 2, 3, 4, 5
  cost: number;
  duration: number;
  prerequisites: string[];
  effects: ResearchEffect[];
  icon: React.ElementType;
  description: string;
}

const MAX_CARD_LEVEL = 5;

const CARD_UPGRADE_COST_MULTIPLIER = [0, 1, 1.5, 2.2, 3.2, 4.5];
const CARD_UPGRADE_DURATION_MULTIPLIER = [0, 1, 1.3, 1.7, 2.2, 3];

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

export const getCardUpgradeCost = (research: Research, targetLevel: number): number => {
  return Math.floor(research.cost * CARD_UPGRADE_COST_MULTIPLIER[targetLevel]);
};

export const getCardUpgradeDuration = (research: Research, targetLevel: number): number => {
  return Math.ceil(research.duration * CARD_UPGRADE_DURATION_MULTIPLIER[targetLevel]);
};

export function processActiveResearch(
  countryDetail: any,
  currentDateInput?: Date | string | null
): { updatedDetail: any; hasChanged: boolean } {
  if (!countryDetail || !countryDetail.active_research) {
    return { updatedDetail: countryDetail, hasChanged: false };
  }

  const activeResearchIdStr = String(countryDetail.active_research);
  let researchId = activeResearchIdStr;
  let targetLevel = 1;

  if (activeResearchIdStr.startsWith('upgrade:')) {
    const parts = activeResearchIdStr.split(':');
    researchId = parts[1];
    targetLevel = Number(parts[2]) || 2;
  }

  const research = RESEARCH_DATA.find((r) => r.id === researchId);
  if (!research) {
    return { updatedDetail: countryDetail, hasChanged: false };
  }

  let currentDateObj: Date;
  if (currentDateInput) {
    currentDateObj = currentDateInput instanceof Date ? currentDateInput : new Date(currentDateInput);
  } else if (countryDetail.game_date) {
    currentDateObj = new Date(countryDetail.game_date);
  } else {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('simulation_date') : null;
    currentDateObj = stored ? new Date(stored) : new Date();
  }

  if (isNaN(currentDateObj.getTime())) {
    currentDateObj = new Date();
  }

  const getZeroTimeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = getZeroTimeDate(currentDateObj);

  let endDateStr = countryDetail.active_research_end_date;
  let startDateStr = countryDetail.active_research_start_date;

  if (!endDateStr) {
    return { updatedDetail: countryDetail, hasChanged: false };
  }

  let endDateObj = new Date(endDateStr);
  if (isNaN(endDateObj.getTime())) {
    return { updatedDetail: countryDetail, hasChanged: false };
  }
  endDateObj = getZeroTimeDate(endDateObj);

  let updatedDetail = { ...countryDetail };
  let hasChanged = false;

  let completedResearch: string[] = Array.isArray(updatedDetail.completed_research)
    ? [...updatedDetail.completed_research]
    : [];
  let researchLevels: Record<string, number> = { ...(updatedDetail.research_levels || {}) };
  let currentMoney = Number(updatedDetail.anggaran || 0);

  const religion = updatedDetail.religion ?? updatedDetail.agama_utama ?? updatedDetail.agama;
  const researchContracts = Array.isArray(updatedDetail.researchContracts) ? updatedDetail.researchContracts : [];
  const educationPoints = calculateEducationPoints(updatedDetail);

  const getEffectiveDuration = (durationDays: number) => {
    return applyCombinedResearchDuration(durationDays, educationPoints, religion, researchContracts);
  };

  if (today.getTime() >= endDateObj.getTime()) {
    hasChanged = true;

    if (!completedResearch.includes(researchId)) {
      completedResearch.push(researchId);
    }
    researchLevels[researchId] = targetLevel;

    updatedDetail.completed_research = completedResearch;
    updatedDetail.research_levels = researchLevels;
    updatedDetail.active_research = null;
    updatedDetail.active_research_start_date = null;
    updatedDetail.active_research_end_date = null;
    updatedDetail.active_research_progress = 0;
  }

  if (updatedDetail.active_research && updatedDetail.active_research_end_date) {
    const curEndObj = getZeroTimeDate(new Date(updatedDetail.active_research_end_date));
    let curStartObj: Date;
    if (updatedDetail.active_research_start_date) {
      curStartObj = getZeroTimeDate(new Date(updatedDetail.active_research_start_date));
    } else {
      const isUpgrade = String(updatedDetail.active_research).startsWith('upgrade:');
      const targetLvl = isUpgrade ? Number(String(updatedDetail.active_research).split(':')[2]) || 1 : 1;
      const dur = getEffectiveDuration(isUpgrade ? getCardUpgradeDuration(research, targetLvl) : research.duration);
      curStartObj = new Date(curEndObj);
      curStartObj.setDate(curStartObj.getDate() - dur);
    }

    const totalTime = Math.max(1, curEndObj.getTime() - curStartObj.getTime());
    const elapsedTime = today.getTime() - curStartObj.getTime();
    const calculatedProgress = Math.min(99, Math.max(0, Math.floor((elapsedTime / totalTime) * 100)));

    if (updatedDetail.active_research_progress !== calculatedProgress) {
      updatedDetail.active_research_progress = calculatedProgress;
      hasChanged = true;
    }
  } else {
    if (updatedDetail.active_research_progress !== 0) {
      updatedDetail.active_research_progress = 0;
      hasChanged = true;
    }
  }

  return { updatedDetail, hasChanged };
}

const getCardBonus = (level: number): number => {
  if (level < 1) return 0;
  if (level > MAX_CARD_LEVEL) return RESEARCH_CARD_LEVEL_BONUS[MAX_CARD_LEVEL];
  return RESEARCH_CARD_LEVEL_BONUS[level];
};

const getResearchTier = (research: Research, data: Research[]): number => {
  if (research.tier) return research.tier;
  if (research.prerequisites.length === 0) return 1;
  const prereqObj = data.find((r) => research.prerequisites.includes(r.id));
  if (!prereqObj) return 1;
  return Math.min(5, getResearchTier(prereqObj, data) + 1);
};

const RESEARCH_DATA: Research[] = [
// =====================================================================
// ⚠️ CATATAN:
//   - Kategori 'lingkungan' DIHAPUS.
//   - Kategori 'diplomasi' SUDAH UPDATE dengan data baru user.
//   - Ekonomi sekarang 3 kolom × 4 tier = 12 kartu:
//       • Kolom 1: Manufaktur → Mineral & Energi
//       • Kolom 2: Peternakan → Agrikultur
//       • Kolom 3: Perikanan → Olahan Pangan
//   - Semua value = 2 (kecuali flag khusus).
// =====================================================================

// ╔══════════════════════════════════════════════════════════════════╗
// ║  1. EKONOMI & INDUSTRI (12 kartu — 3 kolom × 4 tier)            ║
// ╚══════════════════════════════════════════════════════════════════╝
// ── KOLOM 1: MANUFAKTUR → MINERAL & ENERGI ──
{ id: 'otomasi_industri',        name: 'Otomasi Fabrikasi Elektronik & Kendaraan', category: 'ekonomi', tier: 1, cost: 2000,  duration: 15, prerequisites: [],                           icon: Cpu,    description: 'Otomasi lini Pabrik Semikonduktor, Pabrik Mesin Mobil, dan Pabrik Mesin Motor.', effects: [{ stat: 'manufaktur',                             value:  2, label: '+2% Produksi Manufaktur' }] },
{ id: 'manufaktur_material',     name: 'Rekayasa Material Manufaktur',              category: 'ekonomi', tier: 2, cost: 3500,  duration: 22, prerequisites: ['otomasi_industri'],        icon: Cpu,    description: 'Proses material dan komponen untuk mempercepat pembangunan pabrik manufaktur.',  effects: [{ stat: 'waktu_pembangunan_manufaktur',           value: -2, label: '-2% Waktu Pembangunan Manufaktur' }] },
{ id: 'manufaktur_terintegrasi', name: 'Eksplorasi Mineral & Energi',                category: 'ekonomi', tier: 3, cost: 6500,  duration: 34, prerequisites: ['manufaktur_material'],     icon: Beaker, description: 'Teknologi eksplorasi untuk meningkatkan produksi Emas, Uranium, Batu Bara, Minyak Bumi, Gas Alam, Garam, Litium, Logam Tanah Jarang, dan Bijih Besi.', effects: [{ stat: 'mineral_energi',                            value:  2, label: '+2% Produksi Mineral & Energi' }] },
{ id: 'manufaktur_lanjut',       name: 'Infrastruktur Mineral & Energi Terpadu',    category: 'ekonomi', tier: 4, cost: 11000, duration: 48, prerequisites: ['manufaktur_terintegrasi'], icon: Beaker, description: 'Metode konstruksi cepat untuk mempercepat pembangunan tambang dan kilang mineral & energi.', effects: [{ stat: 'waktu_pembangunan_mineral_energi',          value: -2, label: '-2% Waktu Pembangunan Mineral & Energi' }] },

// ── KOLOM 2: PETERNAKAN → AGRIKULTUR ──
{ id: 'peternakan_modern',       name: 'Peternakan Presisi',                        category: 'ekonomi', tier: 1, cost: 1800,  duration: 14, prerequisites: [],                           icon: Beaker, description: 'Peningkatan budidaya Ayam Unggas, Sapi Perah, dan Sapi Potong.',                  effects: [{ stat: 'peternakan',                            value:  2, label: '+2% Produksi Peternakan' }] },
{ id: 'peternakan_genetika',     name: 'Genetika & Pakan Ternak',                   category: 'ekonomi', tier: 2, cost: 3300,  duration: 21, prerequisites: ['peternakan_modern'],        icon: Beaker, description: 'Rekayasa pakan dan percepatan pembangunan fasilitas peternakan modern.',          effects: [{ stat: 'waktu_pembangunan_peternakan',          value: -2, label: '-2% Waktu Pembangunan Peternakan' }] },
{ id: 'perkebunan_komoditas',    name: 'Agrikultur Cerdas Multi-Komoditas',         category: 'ekonomi', tier: 3, cost: 6000,  duration: 31, prerequisites: ['peternakan_genetika'],      icon: Wheat,  description: 'Pengelolaan Padi, Gandum, Jagung, Sayur, Umbi, Kedelai, Kelapa Sawit, Kopi, Teh, Kakao, Tebu, dan Karet.', effects: [{ stat: 'agrikultur',                             value:  2, label: '+2% Produksi Agrikultur' }] },
{ id: 'agrikultur_cerdas',       name: 'Agrikultur Tangguh Multi-Komoditas',        category: 'ekonomi', tier: 4, cost: 10000, duration: 44, prerequisites: ['perkebunan_komoditas'],     icon: Wheat,  description: 'Teknologi budidaya tangguh untuk mempercepat pembangunan lahan agrikultur.',       effects: [{ stat: 'waktu_pembangunan_agrikultur',          value: -2, label: '-2% Waktu Pembangunan Agrikultur' }] },

// ── KOLOM 3: PERIKANAN → OLAHAN PANGAN ──
{ id: 'perikanan_modern',        name: 'Budidaya Perikanan Terpadu',                category: 'ekonomi', tier: 1, cost: 1400,  duration: 11, prerequisites: [],                           icon: Leaf,   description: 'Peningkatan produksi Ikan, Udang, dan Mutiara melalui budidaya serta armada tangkap.', effects: [{ stat: 'perikanan',                             value:  2, label: '+2% Produksi Perikanan' }] },
{ id: 'perikanan_pascapanen',    name: 'Teknologi Perikanan & Pascapanen',          category: 'ekonomi', tier: 2, cost: 3100,  duration: 19, prerequisites: ['perikanan_modern'],         icon: Leaf,   description: 'Penanganan hasil tangkap untuk mempercepat pembangunan fasilitas perikanan.',       effects: [{ stat: 'waktu_pembangunan_perikanan',           value: -2, label: '-2% Waktu Pembangunan Perikanan' }] },
{ id: 'pengolahan_pangan',       name: 'Pengolahan Pangan Dasar',                   category: 'ekonomi', tier: 3, cost: 6300,  duration: 33, prerequisites: ['perikanan_pascapanen'],     icon: Wheat,  description: 'Teknologi produksi Air Mineral, Gula, Roti, Pengolahan Daging, Mi Instan, Minyak Goreng, Susu, dan Beras.', effects: [{ stat: 'olahan_pangan',                          value:  2, label: '+2% Produksi Olahan Pangan' }] },
{ id: 'industri_pangan_terpadu', name: 'Industri Pangan Terintegrasi',               category: 'ekonomi', tier: 4, cost: 10800, duration: 47, prerequisites: ['pengolahan_pangan'],        icon: Wheat,  description: 'Integrasi produksi untuk mempercepat pembangunan pabrik olahan pangan.',           effects: [{ stat: 'waktu_pembangunan_olahan_pangan',       value: -2, label: '-2% Waktu Pembangunan Olahan Pangan' }] },

// ╔══════════════════════════════════════════════════════════════════╗
// ║  2. MILITER & PERTAHANAN (25 kartu — 5 tier)                    ║
// ╚══════════════════════════════════════════════════════════════════╝
// ---- TIER 1 ----
{ id: 'tank_generasi_baru',  name: 'Tank Tempur Komposit',          category: 'militer', tier: 1, cost: 2500, duration: 18, prerequisites: [], icon: Shield,    description: 'Armor komposit ringan meningkatkan efektivitas Tank Tempur Utama.',                effects: [{ stat: 'darat',      value: 2, label: '+2% Kekuatan Tank Tempur Utama' }] },
{ id: 'drone_otonom',        name: 'Drone Pengintai Taktis',        category: 'militer', tier: 1, cost: 2200, duration: 16, prerequisites: [], icon: Wifi,      description: 'Sistem otonom meningkatkan efektivitas Drone Intai UAV.',                          effects: [{ stat: 'intel',      value: 2, label: '+2% Kekuatan Drone Intai UAV' }] },
{ id: 'senjata_infanteri',   name: 'Senapan Serbu Presisi',         category: 'militer', tier: 1, cost: 2000, duration: 15, prerequisites: [], icon: Crosshair, description: 'Senjata otomatis presisi meningkatkan kekuatan pasukan infanteri.',                effects: [{ stat: 'infanteri',  value: 2, label: '+2% Kekuatan Pasukan Infanteri' }] },
{ id: 'radar_pesisir',       name: 'Radar Pesisir Pantai',          category: 'militer', tier: 1, cost: 2300, duration: 17, prerequisites: [], icon: Wifi,      description: 'Deteksi jarak jauh meningkatkan efektivitas kapal destroyer.',                     effects: [{ stat: 'radar',      value: 2, label: '+2% Kekuatan Kapal Destroyer' }] },
{ id: 'benteng_perbatasan',  name: 'Pos Pertahanan Perbatasan',     category: 'militer', tier: 1, cost: 2100, duration: 15, prerequisites: [], icon: Shield,    description: 'Doktrin pertahanan perbatasan meningkatkan efektivitas APC/IFV.',                  effects: [{ stat: 'bunker',     value: 2, label: '+2% Kekuatan APC / IFV' }] },

// ---- TIER 2 ----
{ id: 'kapal_stealth',       name: 'Kapal Korvet Siluman',           category: 'militer', tier: 2, cost: 4000, duration: 25, prerequisites: ['tank_generasi_baru'], icon: Shield,    description: 'Teknologi siluman meningkatkan efektivitas kapal korvet.',                    effects: [{ stat: 'laut',      value: 2, label: '+2% Kekuatan Kapal Korvet' }] },
{ id: 'perang_siber',        name: 'Komando Siber Ofensif',          category: 'militer', tier: 2, cost: 3800, duration: 24, prerequisites: ['drone_otonom'],       icon: Cpu,       description: 'Jaringan komando siber meningkatkan efektivitas operasi sabotase terhadap lawan.', effects: [{ stat: 'sabotase',  value: 2, label: '+2% Efektivitas Sabotase' }] },
{ id: 'artileri_presisi',    name: 'Artileri Roket Otonom',          category: 'militer', tier: 2, cost: 4200, duration: 26, prerequisites: ['senjata_infanteri'],  icon: Crosshair, description: 'Sistem bidik otonom meningkatkan efektivitas artileri berat.',                effects: [{ stat: 'artileri',  value: 2, label: '+2% Kekuatan Artileri Berat' }] },
{ id: 'kapal_selam_diesel',  name: 'Kapal Selam Modern',             category: 'militer', tier: 2, cost: 4500, duration: 28, prerequisites: ['radar_pesisir'],      icon: Shield,    description: 'Teknologi patroli laut meningkatkan efektivitas kapal selam reguler.',        effects: [{ stat: 'patroli',   value: 2, label: '+2% Kekuatan Kapal Selam Reguler' }] },
{ id: 'helikopter_serang',   name: 'Helikopter Tempur',              category: 'militer', tier: 2, cost: 4100, duration: 25, prerequisites: ['benteng_perbatasan'], icon: Rocket,    description: 'Dukungan udara jarak dekat meningkatkan kekuatan helikopter serang.',         effects: [{ stat: 'helikopter',value: 2, label: '+2% Kekuatan Helikopter Serang' }] },

// ---- TIER 3 ----
{ id: 'jet_siluman',         name: 'Jet Tempur Generasi 5',          category: 'militer', tier: 3, cost: 7000, duration: 35, prerequisites: ['kapal_stealth'],     icon: Rocket,    description: 'Teknologi siluman meningkatkan kekuatan jet tempur siluman.',                effects: [{ stat: 'udara',     value: 2, label: '+2% Kekuatan Jet Tempur Siluman' }] },
{ id: 'satelit_mata_mata',   name: 'Satelit Pengintai Optik',        category: 'militer', tier: 3, cost: 6800, duration: 34, prerequisites: ['perang_siber'],      icon: Wifi,      description: 'Data satelit meningkatkan efektivitas pesawat pengintai.',                   effects: [{ stat: 'spionase',  value: 2, label: '+2% Kekuatan Pesawat Pengintai' }] },
{ id: 'rudal_jelajah',       name: 'Rudal Jelajah Presisi',          category: 'militer', tier: 3, cost: 7200, duration: 36, prerequisites: ['artileri_presisi'],  icon: Crosshair, description: 'Sistem rudal presisi meningkatkan kekuatan sistem peluncur roket.',          effects: [{ stat: 'rudal',     value: 2, label: '+2% Kekuatan Sistem Peluncur Roket' }] },
{ id: 'sistem_sam',          name: 'Sistem Anti-Udara (SAM)',        category: 'militer', tier: 3, cost: 7100, duration: 35, prerequisites: ['kapal_selam_diesel'], icon: Shield,   description: 'Sistem pertahanan udara meningkatkan kekuatan pertahanan udara mobile.',    effects: [{ stat: 'sam',       value: 2, label: '+2% Kekuatan Pertahanan Udara Mobile' }] },
{ id: 'pasukan_khusus',      name: 'Reorganisasi Pasukan Khusus',    category: 'militer', tier: 3, cost: 6500, duration: 32, prerequisites: ['helikopter_serang'],  icon: Crosshair, description: 'Doktrin komando meningkatkan kekuatan kendaraan taktis.',                   effects: [{ stat: 'elit',      value: 2, label: '+2% Kekuatan Kendaraan Taktis' }] },

// ---- TIER 4 ----
{ id: 'rudal_hipersonik',       name: 'Rudal Hipersonik Mach 7',            category: 'militer', tier: 4, cost: 11000, duration: 45, prerequisites: ['jet_siluman'],           icon: Crosshair, description: 'Rudal hipersonik meningkatkan kekuatan pesawat pengebom.',             effects: [{ stat: 'serangan',    value: 2, label: '+2% Kekuatan Pesawat Pengebom' }] },
{ id: 'program_nuklir',         name: 'Reaktor Pengayaan Nuklir',           category: 'militer', tier: 4, cost: 12000, duration: 50, prerequisites: ['satelit_mata_mata'],      icon: Atom,      description: 'Teknologi nuklir meningkatkan kekuatan kapal induk nuklir.',           effects: [{ stat: 'nuklir',      value: 2, label: '+2% Kekuatan Kapal Induk Nuklir' }] },
{ id: 'kapal_induk',            name: 'Kapal Induk Bertenaga Nuklir',       category: 'militer', tier: 4, cost: 13000, duration: 55, prerequisites: ['rudal_jelajah'],          icon: Shield,    description: 'Teknologi proyeksi armada meningkatkan kekuatan kapal induk.',         effects: [{ stat: 'proyeksi',    value: 2, label: '+2% Kekuatan Kapal Induk' }] },
{ id: 'laser_defensif',         name: 'Senjata Laser Anti-Drone',           category: 'militer', tier: 4, cost: 10500, duration: 44, prerequisites: ['sistem_sam'],             icon: Zap,       description: 'Intersepsi laser meningkatkan kekuatan drone kamikaze.',               effects: [{ stat: 'laser',       value: 2, label: '+2% Kekuatan Drone Kamikaze' }] },
{ id: 'baju_baja_eksoskeleton', name: 'Avionik & Proteksi Jet Interceptor', category: 'militer', tier: 4, cost: 10000, duration: 42, prerequisites: ['pasukan_khusus'],         icon: Cpu,       description: 'Avionik dan lapisan proteksi meningkatkan kekuatan jet tempur interceptor.', effects: [{ stat: 'interceptor', value: 2, label: '+2% Kekuatan Jet Tempur Interceptor' }] },

// ---- TIER 5 ----
{ id: 'pertahanan_nuklir',   name: 'Kubah Pertahanan Anti-Rudal',      category: 'militer', tier: 5, cost: 20000, duration: 75, prerequisites: ['rudal_hipersonik'],       icon: Shield,  description: 'Perisai anti-rudal meningkatkan kekuatan kapal selam nuklir.',            effects: [{ stat: 'kubah',    value: 2, label: '+2% Kekuatan Kapal Selam Nuklir' }] },
{ id: 'icbm',                name: 'ICBM Balistik Antar Benua',         category: 'militer', tier: 5, cost: 25000, duration: 90, prerequisites: ['program_nuklir'],         icon: Rocket,  description: 'Pengembangan ICBM meningkatkan kemampuan serangan nuklir strategis.',     effects: [{ stat: 'icbm',     value: 2, label: '+2% Kemampuan Serangan Nuklir Strategis' }] },
{ id: 'senjata_orbit',       name: 'Sistem Perang Ranjau Laut',         category: 'militer', tier: 5, cost: 22000, duration: 80, prerequisites: ['kapal_induk'],            icon: Rocket,  description: 'Sistem kendali ranjau meningkatkan kekuatan kapal ranjau.',                effects: [{ stat: 'ranjau',   value: 2, label: '+2% Kekuatan Kapal Ranjau' }] },
{ id: 'komando_otonom_ai',   name: 'Komando Logistik Armada Berbasis AI', category: 'militer', tier: 5, cost: 21000, duration: 78, prerequisites: ['laser_defensif'],    icon: Cpu,     description: 'Optimasi komando AI meningkatkan kekuatan kapal logistik.',              effects: [{ stat: 'ai_war',   value: 2, label: '+2% Kekuatan Kapal Logistik' }] },
{ id: 'pasukan_kloning',     name: 'Sistem Angkut Udara Strategis',     category: 'militer', tier: 5, cost: 19000, duration: 72, prerequisites: ['baju_baja_eksoskeleton'], icon: HeartPulse, description: 'Peningkatan mobilisasi udara memperkuat pesawat angkut.',          effects: [{ stat: 'bio_inf',  value: 2, label: '+2% Kekuatan Pesawat Angkut' }] },

// ╔══════════════════════════════════════════════════════════════════╗
// ║  3. DIPLOMASI & INTELIJEN (25 kartu — 5 tier)                   ║
// ╚══════════════════════════════════════════════════════════════════╝
// ---- TIER 1 ----
{ id: 'manfaat_kedutaan',   name: 'Manfaat Kedutaan',             category: 'diplomasi', tier: 1, cost: 1800, duration: 12, prerequisites: [], icon: Globe2,   description: 'Metode konstruksi cepat untuk kedutaan besar di seluruh dunia. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.', effects: [{ stat: 'waktu_kedutaan', value: -2, label: '-2% Waktu Pembangunan Kedutaan' }] },
{ id: 'suara_pbb',          name: 'Suara di PBB',                 category: 'diplomasi', tier: 1, cost: 2000, duration: 14, prerequisites: [], icon: Sparkles, description: 'Meningkatkan jumlah suara negara di forum PBB. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',                 effects: [{ stat: 'suara_pbb',      value:  2, label: '+2 Suara PBB' }] },
{ id: 'biaya_kedutaan',     name: 'Efisiensi Biaya Kedutaan',     category: 'diplomasi', tier: 1, cost: 1900, duration: 13, prerequisites: [], icon: Banknote, description: 'Penghematan biaya operasional kedutaan besar. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',                  effects: [{ stat: 'biaya_kedutaan', value: -2, label: '-2% Biaya Kedutaan Besar' }] },
{ id: 'kontra_separatisme', name: 'Pencegahan Separatisme',       category: 'diplomasi', tier: 1, cost: 1700, duration: 11, prerequisites: [], icon: Shield,   description: 'Badan khusus untuk menekan gerakan separatisme. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',                effects: [{ stat: 'separatisme',    value: -2, label: '-2% Separatisme' }] },
{ id: 'perjanjian_dagang',  name: 'Pakta Perdagangan Bipartit',   category: 'diplomasi', tier: 1, cost: 1600, duration: 10, prerequisites: [], icon: Globe2,   description: 'Tim negosiator handal untuk mempercepat perjanjian dagang. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',     effects: [{ stat: 'peluang_dagang', value:  2, label: '+2% Peluang Perjanjian Dagang' }] },

// ---- TIER 2 ----
{ id: 'pandemi_kontrol',     name: 'Kontrol Pandemi Global',       category: 'diplomasi', tier: 2, cost: 3500, duration: 22, prerequisites: ['manfaat_kedutaan'],   icon: HeartPulse, description: 'Kerja sama internasional untuk menekan pandemi & epidemi. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.', effects: [{ stat: 'kematian_pandemi', value: -2, label: '-2% Kematian Pandemi/Epidemi' }] },
{ id: 'efek_acara',          name: 'Diplomasi Acara Nasional',     category: 'diplomasi', tier: 2, cost: 3800, duration: 24, prerequisites: ['suara_pbb'],          icon: Sparkles,   description: 'Penyelenggaraan acara internasional yang berdampak luas. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',  effects: [{ stat: 'efek_acara',       value:  2, label: '+2% Efek Acara' }] },
{ id: 'penyebaran_ideologi', name: 'Penyebaran Ideologi',          category: 'diplomasi', tier: 2, cost: 3600, duration: 23, prerequisites: ['kontra_separatisme'], icon: Palette,    description: 'Promosi ideologi nasional ke negara lain. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',                 effects: [{ stat: 'ideologi',         value:  2, label: '+2% Keberhasilan Ideologi' }] },
{ id: 'misionaris',          name: 'Misi Keagamaan Internasional', category: 'diplomasi', tier: 2, cost: 3700, duration: 23, prerequisites: ['biaya_kedutaan'],     icon: HeartPulse, description: 'Pengiriman misionaris resmi ke negara sahabat. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',            effects: [{ stat: 'misionaris',       value:  2, label: '+2% Keberhasilan Misionaris' }] },
{ id: 'pakta_non_agresi',    name: 'Pakta Non-Agresi',             category: 'diplomasi', tier: 2, cost: 3400, duration: 20, prerequisites: ['perjanjian_dagang'],  icon: Shield,     description: 'Doktrin diplomasi untuk mempercepat pakta non-agresi. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',     effects: [{ stat: 'peluang_nap',      value:  2, label: '+2% Peluang Pakta Non-Agresi' }] },

// ---- TIER 3 ----
{ id: 'aliansi_pertahanan',   name: 'Aliansi Pertahanan',          category: 'diplomasi', tier: 3, cost: 6500, duration: 35, prerequisites: ['pakta_non_agresi'],     icon: Shield,     description: 'Jaringan kerja sama untuk membangun aliansi pertahanan. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',  effects: [{ stat: 'peluang_aliansi',  value:  2, label: '+2% Peluang Aliansi Pertahanan' }] },
{ id: 'mitigasi_bencana',     name: 'Mitigasi Bencana Alam',       category: 'diplomasi', tier: 3, cost: 6800, duration: 36, prerequisites: ['pandemi_kontrol'],      icon: Leaf,       description: 'Sistem peringatan & bantuan bencana lintas negara. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',       effects: [{ stat: 'kematian_bencana', value: -2, label: '-2% Kematian Bencana Alam' }] },
{ id: 'pertahanan_diri',      name: 'Doktrin Pertahanan Diri',     category: 'diplomasi', tier: 3, cost: 6200, duration: 33, prerequisites: ['efek_acara'],           icon: Shield,     description: 'Postur pertahanan yang menurunkan peluang diserang. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',      effects: [{ stat: 'peluang_diserang', value: -2, label: '-2% Peluang Diserang Negara Lain' }] },
{ id: 'perlindungan_perang',  name: 'Perlindungan Sipil Perang',   category: 'diplomasi', tier: 3, cost: 6400, duration: 34, prerequisites: ['penyebaran_ideologi'],  icon: HeartPulse, description: 'Protokol perlindungan sipil saat konflik bersenjata. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',     effects: [{ stat: 'kematian_perang',  value: -2, label: '-2% Kematian Populasi Perang' }] },
{ id: 'bonus_organisasi_pbb', name: 'Kontribusi Organisasi PBB',   category: 'diplomasi', tier: 3, cost: 6000, duration: 32, prerequisites: ['misionaris'],           icon: Globe2,     description: 'Kontribusi aktif di PBB untuk bonus diplomasi. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',           effects: [{ stat: 'bonus_pbb',        value:  2, label: '+2% Bonus Organisasi PBB' }] },

// ---- TIER 4 ----
{ id: 'bonus_organisasi_regional', name: 'Kerja Sama Organisasi Regional', category: 'diplomasi', tier: 4, cost: 11000, duration: 48, prerequisites: ['aliansi_pertahanan'],    icon: Globe2,  description: 'Peran aktif di organisasi regional (ASEAN, EU, dll). Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',  effects: [{ stat: 'bonus_regional',        value:  2, label: '+2% Bonus Organisasi Regional' }] },
{ id: 'kursi_tetap_dewan_pbb',     name: 'Kursi Tetap Dewan Keamanan PBB', category: 'diplomasi', tier: 4, cost: 25000, duration: 60, prerequisites: ['bonus_organisasi_pbb'], icon: Sparkles, description: 'Klaim permanen kursi Dewan Keamanan PBB. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',              effects: [{ stat: 'kursi_dewan_keamanan',  value:  1, label: 'Ambil Kursi Tetap Dewan Keamanan PBB' }] },
{ id: 'bonus_tempat_wisata',       name: 'Promosi Wisata Diplomatik',      category: 'diplomasi', tier: 4, cost: 9500,  duration: 44, prerequisites: ['mitigasi_bencana'],     icon: Palette,  description: 'Diplomasi wisata ke negara sahabat. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',                   effects: [{ stat: 'bonus_wisata',          value:  2, label: '+2% Bonus Tempat Wisata' }] },
{ id: 'sanksi_ekonomi',            name: 'Perangkat Sanksi Ekonomi',       category: 'diplomasi', tier: 4, cost: 10800, duration: 47, prerequisites: ['bonus_organisasi_regional'], icon: Banknote, description: 'Pembekuan aset musuh. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.',                           effects: [{ stat: 'sanksi',                value:  2, label: '+2% Efek Sanksi Musuh' }] },
{ id: 'suara_dewan_keamanan',      name: 'Reformasi Birokrasi Kabinet',    category: 'diplomasi', tier: 4, cost: 12500, duration: 54, prerequisites: ['pertahanan_diri'],      icon: Globe2,   description: 'Restrukturisasi tata kelola Dewan Kabinet Menteri untuk menekan biaya upgrade. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.', effects: [{ stat: 'biaya_upgrade_kabinet', value: -2, label: '-2% Biaya Upgrade Dewan Kabinet' }] },

// ---- TIER 5 ----
{ id: 'hegemoni_diplomasi',        name: 'Harmonisasi Fiskal Global',      category: 'diplomasi', tier: 5, cost: 20000, duration: 80, prerequisites: ['bonus_organisasi_regional'], icon: Banknote, description: 'Sinkronisasi kebijakan fiskal dengan standar internasional untuk memaksimalkan penerimaan pajak di semua lini. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.', effects: [{ stat: 'pajak_semua_lini',    value: 2, label: '+2% Penerimaan Pajak Seluruh Lini' }] },
{ id: 'kriptografi_kuantum',       name: 'Diplomasi Perdagangan Strategis', category: 'diplomasi', tier: 5, cost: 22000, duration: 85, prerequisites: ['kursi_tetap_dewan_pbb'],     icon: Lock,     description: 'Jaringan negosiasi dagang tingkat tinggi untuk menekan harga beli dan menaikkan harga jual komoditas nasional. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.', effects: [{ stat: 'harga_beli', value: -2, label: '-2% Harga Beli Komoditas' }, { stat: 'harga_jual', value: 2, label: '+2% Harga Jual Komoditas' }] },
{ id: 'intelijen_satelit_quantum', name: 'Alokasi Subsidi Terpadu',         category: 'diplomasi', tier: 5, cost: 21000, duration: 82, prerequisites: ['bonus_tempat_wisata'],       icon: Wifi,     description: 'Sistem distribusi subsidi yang efisien dan tepat sasaran untuk menekan kebocoran anggaran. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.', effects: [{ stat: 'biaya_subsidi',     value: -2, label: '-2% Biaya Subsidi Negara' }] },
{ id: 'isolasi_total_musuh',       name: 'Program Permukiman Diplomatik',   category: 'diplomasi', tier: 5, cost: 19000, duration: 76, prerequisites: ['sanksi_ekonomi'],            icon: Globe2,   description: 'Pembangunan kawasan hunian berstandar internasional untuk menampung populasi dan tenaga ahli asing. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.', effects: [{ stat: 'kapasitas_permukiman', value: 2, label: '+2% Kapasitas Permukiman' }] },
{ id: 'tatanan_dunia_baru',        name: 'Sinergi Ekonomi Global',          category: 'diplomasi', tier: 5, cost: 25000, duration: 90, prerequisites: ['suara_dewan_keamanan'],      icon: Sparkles, description: 'Integrasi ekonomi lintas sektor nasional melalui jaringan diplomasi global untuk mendorong produktivitas semua lini. Efek penurunan peringkat diperbarui setiap 2 tahun sekali.', effects: [{ stat: 'produksi_semua_lini', value: 2, label: '+2% Produksi Semua Lini' }] },
];

const CATEGORIES: { key: CategoryKey; label: string; icon: React.ElementType }[] = [
  { key: 'ekonomi',   label: 'Ekonomi & Industri',    icon: Banknote },
  { key: 'militer',   label: 'Militer & Pertahanan',  icon: Shield },
  { key: 'diplomasi', label: 'Diplomasi & Intelijen', icon: Globe2 },
];

export type SelectionCategoryKey = 'ekonomi' | 'militer' | 'diplomasi';

const FOCUS_CATEGORIES_MAP: Record<SelectionCategoryKey, CategoryKey[]> = {
  ekonomi: ['ekonomi', 'lingkungan'],
  militer: ['militer'],
  diplomasi: ['diplomasi'],
};

interface PenelitianPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory: SelectionCategoryKey;
  onBackToSelection?: () => void;
  countryDetail?: any;
  setCountryDetail?: (detail: any) => void;
}

export default function PenelitianPageModal({
  isOpen,
  onClose,
  initialCategory,
  onBackToSelection,
  countryDetail,
  setCountryDetail,
}: PenelitianPageModalProps) {
  const allowedCategories = FOCUS_CATEGORIES_MAP[initialCategory] || ['ekonomi'];
  const defaultCategory = CATEGORIES.find((cat) => allowedCategories.includes(cat.key))?.key || allowedCategories[0];
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(defaultCategory);
  const [confirmTarget, setConfirmTarget] = useState<Research | null>(null);
  const [confirmUpgrade, setConfirmUpgrade] = useState<{ research: Research; targetLevel: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const categories = FOCUS_CATEGORIES_MAP[initialCategory] || ['ekonomi'];
    const firstAvail = CATEGORIES.find((cat) => categories.includes(cat.key))?.key || categories[0];
    setActiveCategory(firstAvail);
  }, [initialCategory]);

  useEffect(() => {
    if (!isOpen || !countryDetail || !setCountryDetail) return;
    const { updatedDetail, hasChanged } = processActiveResearch(countryDetail);
    if (hasChanged) {
      setCountryDetail(updatedDetail);
    }
  }, [isOpen, countryDetail, setCountryDetail]);

  if (!isOpen || !mounted) return null;

  const completedResearch: string[] = countryDetail?.completed_research || [];
  const researchLevels: Record<string, number> = countryDetail?.research_levels || {};
  const activeResearchId: string | null = countryDetail?.active_research || null;
  const activeResearchProgress: number = countryDetail?.active_research_progress || 0;
  const money = Number(countryDetail?.anggaran || 0);
  const religion = countryDetail?.religion ?? countryDetail?.agama_utama ?? countryDetail?.agama;
  const hasAtheismResearchBonus = String(religion || '').trim().toLowerCase() === 'ateisme';
  const researchContracts = Array.isArray(countryDetail?.researchContracts) ? countryDetail.researchContracts : [];
  
  const educationPoints = calculateEducationPoints(countryDetail);
  const educationModifier = getEducationResearchModifier(educationPoints);
  const combinedModifier = calculateCombinedResearchDurationModifier(educationPoints, religion, researchContracts);

  const getEffectiveResearchDuration = (durationDays: number, category?: string) => {
    return applyCombinedResearchDuration(durationDays, educationPoints, religion, researchContracts, countryDetail?.country, category);
  };

  const isUnlocked = (id: string) => completedResearch.includes(id);
  const isActive = (id: string) => activeResearchId === id;
  const getLevel = (id: string) => researchLevels[id] || (isUnlocked(id) ? 1 : 0);

  const isLocked = (research: Research) => {
    if (research.prerequisites.length === 0) return false;
    return !research.prerequisites.every((p) => getLevel(p) >= MAX_CARD_LEVEL);
  };

  const canAfford = (cost: number) => money >= cost;

  const getSafeDateString = (): string => {
    if (countryDetail?.game_date) return countryDetail.game_date;
    const stored = typeof window !== 'undefined' ? localStorage.getItem('simulation_date') : null;
    if (stored) return stored;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const addDays = (dateString: string, days: number): string => {
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  const handleStartResearch = (research: Research) => {
    if (!setCountryDetail || !countryDetail) return;
    if (isUnlocked(research.id) || isActive(research.id)) return;
    if (isLocked(research) || !canAfford(research.cost)) return;
    if (activeResearchId) return;

    const safeDate = getSafeDateString();
    const duration = getEffectiveResearchDuration(research.duration, research.category);
    const endDateStr = addDays(safeDate, duration);

    const notif = generateResearchStartNotification(research.name, research.category, duration, safeDate, false, 1);
    const currentPending = Array.isArray(countryDetail.pending_notifications) ? countryDetail.pending_notifications : [];

    setCountryDetail({
      ...countryDetail,
      anggaran: money - research.cost,
      active_research: research.id,
      active_research_start_date: safeDate,
      active_research_progress: 0,
      active_research_end_date: endDateStr,
      pending_notifications: [notif, ...currentPending],
    });
    setConfirmTarget(null);
  };

  const handleUpgradeResearch = () => {
    if (!confirmUpgrade || !setCountryDetail || !countryDetail) return;
    const { research, targetLevel } = confirmUpgrade;
    const cost = getCardUpgradeCost(research, targetLevel);
    if (money < cost) return;
    if (activeResearchId) return;

    const safeDate = getSafeDateString();
    const duration = getEffectiveResearchDuration(getCardUpgradeDuration(research, targetLevel), research.category);
    const endDateStr = addDays(safeDate, duration);

    const notif = generateResearchStartNotification(research.name, research.category, duration, safeDate, true, targetLevel);
    const currentPending = Array.isArray(countryDetail.pending_notifications) ? countryDetail.pending_notifications : [];

    setCountryDetail({
      ...countryDetail,
      anggaran: money - cost,
      active_research: `upgrade:${research.id}:${targetLevel}`,
      active_research_start_date: safeDate,
      active_research_progress: 0,
      active_research_end_date: endDateStr,
      pending_notifications: [notif, ...currentPending],
    });
    setConfirmUpgrade(null);
  };

  const activeResearch = RESEARCH_DATA.find((r) => r.id === activeResearchId) || null;
  const activeUpgradeData = (() => {
    if (!activeResearchId || !activeResearchId.startsWith('upgrade:')) return null;
    const parts = activeResearchId.split(':');
    const research = RESEARCH_DATA.find((r) => r.id === parts[1]);
    return research ? { research, targetLevel: Number(parts[2]) } : null;
  })();

  const filteredData = RESEARCH_DATA.filter((r) => {
    if (r.category !== activeCategory) return false;
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.effects.some((e) => e.label.toLowerCase().includes(q))
    );
  });
  const tierCount = Math.max(
    ...RESEARCH_DATA
      .filter((research) => research.category === activeCategory)
      .map((research) => getResearchTier(research, RESEARCH_DATA)),
    0
  );

  const categoryStats = (cat: CategoryKey) => {
    const items = RESEARCH_DATA.filter((r) => r.category === cat);
    const done = items.filter((r) => isUnlocked(r.id)).length;
    return { done, total: items.length };
  };

  const globalStats = {
    done: completedResearch.length,
    total: RESEARCH_DATA.length,
  };

  const applyLevelBonus = (
    effect: ResearchEffect,
    level: number,
    baseValue = effect.value,
    levelValue?: number
  ): string => {
    if (level <= 0 && baseValue === effect.value) return effect.label;
    const bonus = getCardBonus(level);
    const amplified = levelValue ?? (level > 0 ? (bonus > 0 ? bonus : baseValue) : baseValue);
    const formattedPercent = Number(amplified.toFixed(1)).toString();
    const isReduction = effect.label.trim().startsWith('-') ||
      ['emisi', 'polusi', 'kriminalitas', 'pengangguran', 'penyakit', 'kebocoran', 'inflasi', 'subsidi'].some((s) => effect.stat.includes(s));

    if (isReduction) {
      return `-${Math.abs(Number(formattedPercent)).toFixed(1)}% ${effect.label.replace(/^[+-]?\d+(\.\d+)?%\s*/, '')}`;
    }
    return `+${formattedPercent}% ${effect.label.replace(/^[+-]?\d+(\.\d+)?%\s*/, '')}`;
  };

  return createPortal(
    <div className="fixed top-16 sm:top-20 inset-x-0 bottom-0 z-[200] bg-[#0A1A1A] flex flex-col font-sans animate-in fade-in duration-300">

      {/* HEADER */}
      <div className="px-4 sm:px-8 py-3 bg-[#0F2424] border-b border-[#00FFAA]/30 flex flex-col xl:flex-row xl:items-center justify-between shadow-lg relative z-20 shrink-0 gap-3">
        {/* BARIS UTAMA: ICON, TITLE, SUBTITLE & BUTTON TUTUP */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 rounded-xl bg-[#00FFAA]/10 border border-[#00FFAA]/40 text-[#00FFAA] shrink-0">
              <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black text-[#00FFAA] tracking-wider uppercase leading-none">
                Pusat Penelitian & Riset Nasional
              </h1>
              <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold mt-0.5">
                Setiap riset dapat di-upgrade hingga Level 5
              </p>
            </div>
          </div>

          <button onClick={onClose} className="xl:hidden p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* KONTROL & STATISTIK */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-[#6B8A8A] font-black uppercase">Riset Selesai:</span>
            <span className="text-[11px] font-black text-[#00FFAA]">{globalStats.done}/{globalStats.total}</span>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Cari riset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 text-xs font-bold text-[#E0E0E0] outline-none focus:border-[#00FFAA] w-36 sm:w-48 xl:w-56 transition-all placeholder:text-[#6B8A8A]"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B8A8A]" />
          </div>

          {onBackToSelection && (
            <button
              onClick={onBackToSelection}
              title="Ganti Sektor Utama"
              className="px-3 py-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#00FFAA] hover:bg-[#00FFAA]/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Ganti Sektor</span>
            </button>
          )}

          <button onClick={onClose} className="hidden xl:flex p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase items-center gap-1 shadow-sm shrink-0 ml-auto">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex min-h-0 relative z-10">

        {/* SIDEBAR */}
        <div className="w-52 sm:w-60 lg:w-64 border-r border-[#00FFAA]/30 bg-[#0A1A1A] p-2.5 sm:p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar shrink-0">
          <div className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-widest px-2 py-1.5">
            Kategori Riset
          </div>
          {CATEGORIES.filter((cat) => allowedCategories.includes(cat.key)).map((cat) => {
            const isActiveTab = activeCategory === cat.key;
            const stats = categoryStats(cat.key);
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${isActiveTab
                    ? 'bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md'
                    : 'bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]'
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                    {cat.label}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded ml-1 shrink-0 ${isActiveTab ? 'bg-[#0A1A1A]/20 text-[#0A1A1A]' : 'bg-[#0A1A1A] text-[#00FFAA]'
                    }`}
                >
                  {stats.done}/{stats.total}
                </span>
              </button>
            );
          })}

          {/* PANEL RISET AKTIF */}
          {(activeResearch || activeUpgradeData) && (
            <div className="mt-[#00FFAA]/10 p-3 rounded-xl bg-[#0F2424] border border-[#00FFAA]/40 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5 text-[#00FFAA] animate-pulse" />
                <span className="text-[10px] font-black text-[#00FFAA] uppercase tracking-widest">
                  {activeUpgradeData ? 'Upgrade Aktif' : 'Riset Aktif'}
                </span>
              </div>
              <p className="text-xs font-bold text-[#E0E0E0] truncate">
                {activeUpgradeData ? activeUpgradeData.research.name : activeResearch?.name}
              </p>
              {activeUpgradeData && (
                <p className="text-[10px] text-amber-300 font-black mt-0.5">
                  → Level {activeUpgradeData.targetLevel}
                </p>
              )}
              <div className="w-full h-2 bg-[#0A1A1A] rounded-full mt-2 overflow-hidden border border-[#00FFAA]/20">
                <div
                  className="h-full bg-[#00FFAA] transition-all duration-300"
                  style={{ width: `${activeResearchProgress}%` }}
                />
              </div>
              <p className="text-[10px] font-black text-[#00FFAA] mt-1.5">
                {activeResearchProgress}% selesai
              </p>
            </div>
          )}

          {/* STATUS PENDIDIKAN & PENELITIAN */}
          <div className="mt-2 p-3 rounded-2xl bg-[#0F2424] border border-[#00FFAA]/30 space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#00FFAA]" />
                <span className="text-xs font-black text-[#00FFAA] uppercase tracking-wider">
                  POIN PENDIDIKAN
                </span>
              </div>
              <span className="text-base sm:text-lg font-black text-amber-400">
                {educationPoints} / 100
              </span>
            </div>

            {/* Box 1: Pengaruh Poin Pendidikan */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold ${
              educationModifier.isPenalty
                ? 'bg-[#2A141A] border-rose-500/50 text-rose-300'
                : 'bg-[#0E2A20] border-emerald-500/50 text-emerald-300'
            }`}>
              <span className="font-bold">Pengaruh Waktu Riset:</span>
              <span className="font-black">{educationModifier.label}</span>
            </div>

            {/* Box 2: Bonus Ateisme (jika aktif) */}
            {combinedModifier.hasAtheismBonus && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0E2A20] border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                <span className="font-bold">Bonus Ateisme:</span>
                <span className="font-black">-15% Waktu Penelitian</span>
              </div>
            )}

            {/* Box 3: UNESCO Bonus (jika anggota) */}
            {isMemberOfUNESCO(countryDetail?.country || '') && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0E2A20] border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                <span className="font-bold">Keanggotaan UNESCO:</span>
                <span className="font-black">+5% Kecepatan Riset</span>
              </div>
            )}

            {/* Box 4: ITU Bonus (jika anggota) */}
            {isMemberOfITU(countryDetail?.country || '') && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0E2A20] border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                <span className="font-bold">Keanggotaan ITU:</span>
                <span className="font-black">+5% Kecepatan Riset</span>
              </div>
            )}
          </div>

          {/* INFO SISTEM */}
          <div className="mt-2 p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/20">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3 h-3 text-[#00FFAA]" />
              <span className="text-[9px] font-black text-[#00FFAA] uppercase tracking-widest">
                Bonus Level Card
              </span>
            </div>
            <div className="space-y-1 pr-1">
              {Array.from({ length: 5 }, (_, i) => i + 1).map((lvl) => (
                <div key={lvl} className="flex items-center justify-between px-2 py-0.5 rounded bg-[#0A1A1A]">
                  <span className="text-[9px] font-black text-[#6B8A8A]">Level {lvl}</span>
                  <span className="text-[9px] font-black text-[#00FFAA]">+{RESEARCH_CARD_LEVEL_BONUS[lvl]}%</span>
                </div>
              ))}
            </div>
            <p className="text-[8px] text-[#6B8A8A] font-semibold mt-2 leading-tight">
              Setiap card riset bisa di-upgrade dari Level 1 hingga Level 5. Bonus level mengamplifikasi semua efek riset tersebut.
            </p>
          </div>
        </div>

        {/* KONTEN UTAMA */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[#0F2424] custom-scrollbar">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-[#00FFAA] uppercase tracking-wider">
              {CATEGORIES.find((c) => c.key === activeCategory)?.label}
            </h2>
            <p className="text-[11px] text-[#6B8A8A] font-semibold">
              {filteredData.length} teknologi tersedia
            </p>
          </div>

          {/* Layout horizontal by research tier with dashed connector lines */}
          <div className="overflow-x-auto custom-scrollbar pb-6 pt-2">
            <div
              className="grid gap-6 relative"
              style={{
                minWidth: `${tierCount * 250}px`,
                gridTemplateColumns: `repeat(${tierCount}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: tierCount }, (_, index) => index + 1).map((tierNum) => {
                const tierItems = filteredData.filter((r) => getResearchTier(r, RESEARCH_DATA) === tierNum);

                return (
                  <div key={tierNum} className="flex flex-col gap-4 relative z-10">
                    {/* Header Tier Badge */}
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30">
                      <span className="text-xs font-black text-[#00FFAA] uppercase tracking-wider">
                        TIER {ROMAN_NUMERALS[tierNum - 1]}
                      </span>
                      <span className="text-[10px] font-bold text-[#6B8A8A]">
                        {tierItems.filter((r) => isUnlocked(r.id)).length}/{tierItems.length}
                      </span>
                    </div>

                    {/* Node Cards in this Tier Column */}
                    {tierItems.map((research) => {
                      const unlocked = isUnlocked(research.id);
                      const active = isActive(research.id);
                      const locked = isLocked(research);
                      const level = getLevel(research.id);
                      const canUnlock = canAfford(research.cost);
                      const isMaxed = level >= MAX_CARD_LEVEL;
                      const nextLevel = level + 1;
                      const upgradeCost = !isMaxed && unlocked ? getCardUpgradeCost(research, nextLevel) : 0;
                      const canUpgrade = !isMaxed && unlocked && canAfford(upgradeCost) && !activeResearchId;
                      const Icon = research.icon;
                      const isResearching = active || (activeUpgradeData !== null && activeUpgradeData.research.id === research.id);

                      return (
                        <div key={research.id} className="relative group">
                          {/* Garis Konektor Horisontal ke Tier Selanjutnya */}
                          {tierNum < tierCount && (
                            <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-6 border-t-2 border-dashed border-[#00FFAA]/30 z-0 pointer-events-none" />
                          )}

                          <div
                            className={`relative rounded-xl overflow-visible border transition-all z-10 ${isResearching ? 'mt-6' : ''
                              } ${isMaxed
                                ? 'bg-gradient-to-r from-[#0F2424] via-[#0A1A1A] to-[#122E2E] border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                : unlocked
                                  ? 'bg-[#0F2424] border-[#00FFAA]/50 shadow-[0_2px_10px_rgba(0,255,170,0.1)]'
                                  : active
                                    ? 'bg-[#0F2424] border-[#00FFAA] shadow-[0_0_20px_rgba(0,255,170,0.2)]'
                                    : locked
                                      ? 'bg-[#0A1A1A]/80 border-gray-800 opacity-60'
                                      : 'bg-[#0A1A1A] border-[#00FFAA]/25 hover:border-[#00FFAA]/60'
                              }`}
                          >
                            {/* TANGGAL SELESAI RISET/PEMBANGUNAN */}
                            {isResearching && (() => {
                              const durationDays = getEffectiveResearchDuration(
                                activeUpgradeData ? getCardUpgradeDuration(research, activeUpgradeData.targetLevel) : research.duration
                              );
                              const remainingDays = Math.max(1, Math.ceil(durationDays * (100 - activeResearchProgress) / 100));
                              const endDateStr = countryDetail?.active_research_end_date || addDays(getSafeDateString(), remainingDays);

                              const [y, m, d] = endDateStr.split('-').map(Number);
                              const date = new Date(y, m - 1, d);
                              const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
                              const formattedDateStr = `${d} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;

                              return (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-[#00FFAA] text-[10px] font-bold px-2 py-1 border border-[#00FFAA]/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">
                                  {formattedDateStr}
                                </div>
                              );
                            })()}

                            {/* Node Card Header (Icon, Title, Roman Numeral Badge) */}
                            <div className="p-3 pb-2 flex items-center justify-between gap-2 border-b border-[#00FFAA]/10 bg-[#0F2424] rounded-t-xl">
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className={`p-1.5 rounded-lg border shrink-0 ${isMaxed
                                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                      : unlocked
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                        : 'bg-[#00FFAA]/10 border-[#00FFAA]/30 text-[#00FFAA]'
                                    }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-[11px] font-bold text-[#E0E0E0] truncate leading-tight">
                                    {research.name}
                                  </h3>
                                </div>
                              </div>

                              {/* Badge Romawi (I, II, III, IV, V) */}
                              <div className="px-1.5 py-0.5 rounded border border-[#00FFAA]/30 bg-[#0A1A1A] text-[9px] font-black text-[#00FFAA] shrink-0 uppercase tracking-widest">
                                {ROMAN_NUMERALS[tierNum - 1]}
                              </div>
                            </div>

                            {/* Body Card */}
                            <div className="p-2.5">
                              {/* Efek Riset */}
                              <div className="space-y-1 mb-2">
                                {research.effects.map((eff, i) => {
                                  const baseValue = research.category === 'militer'
                                    ? getMilitaryResearchBaseBonus(research.id) ?? eff.value
                                    : eff.value;
                                  const amplifiedLabel = applyLevelBonus(
                                    eff,
                                    level,
                                    baseValue,
                                    research.category === 'militer'
                                      ? getMilitaryResearchLevelBonus(research.id, Math.max(1, level))
                                      : undefined
                                  );
                                  return (
                                    <div key={i} className="flex items-center gap-1 text-[9px] font-bold">
                                      <Sparkles className="w-2.5 h-2.5 text-[#00FFAA] shrink-0" />
                                      <span className="text-[#E0E0E0] truncate">{amplifiedLabel}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Footer Row (Durasi ⏱️, Progress Bar, Level 0/5) */}
                              <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-[#00FFAA]/10">
                                {/* Left: Duration */}
                                <div className="flex items-center gap-0.5 text-[9px] font-bold text-[#6B8A8A] shrink-0">
                                  <Clock className="w-2.5 h-2.5 text-sky-400" />
                                  {(() => {
                                    const baseDur = unlocked && !isMaxed ? getCardUpgradeDuration(research, nextLevel) : research.duration;
                                    const effDur = getEffectiveResearchDuration(baseDur, research.category);
                                    const hasDiscount = effDur < baseDur;
                                    const hasPenalty = effDur > baseDur;

                                    return (
                                      <span className="flex items-center gap-1">
                                        {hasDiscount && (
                                          <span className="text-rose-400/80 line-through">
                                            {baseDur}h
                                          </span>
                                        )}
                                        <span className={hasDiscount ? 'text-emerald-400 font-extrabold' : hasPenalty ? 'text-rose-400 font-extrabold' : ''}>
                                          {effDur}h
                                        </span>
                                      </span>
                                    );
                                  })()}
                                </div>

                                {/* Center: Progress Bar */}
                                <div className="flex-1 h-1.5 bg-[#0A1A1A] rounded-full overflow-hidden border border-[#00FFAA]/20">
                                  <div
                                    className={`h-full transition-all duration-300 ${isMaxed
                                        ? 'bg-amber-400'
                                        : isResearching
                                          ? 'bg-[#00FFAA] animate-pulse'
                                          : unlocked
                                            ? 'bg-emerald-400'
                                            : 'bg-gray-700'
                                      }`}
                                    style={{
                                      width: `${isMaxed
                                          ? 100
                                          : isResearching
                                            ? activeResearchProgress
                                            : (level / MAX_CARD_LEVEL) * 100
                                        }%`,
                                    }}
                                  />
                                </div>

                                {/* Right: Level Counter 0/5 */}
                                <div className="text-[9px] font-black text-[#00FFAA] shrink-0 tracking-wider">
                                  {level}/{MAX_CARD_LEVEL}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-2">
                                {!unlocked && !active && (
                                  locked ? (
                                    <div className="w-full py-1 rounded bg-gray-800/40 border border-gray-700/50 flex items-center justify-center gap-1 text-gray-500 text-[9px] font-black uppercase">
                                      <Lock className="w-2.5 h-2.5" />
                                      Terkunci
                                    </div>
                                  ) : activeResearchId ? (
                                    <div className="w-full py-1 rounded bg-[#0A1A1A] border border-[#6B8A8A]/30 flex items-center justify-center gap-1 text-[#6B8A8A] text-[9px] font-black uppercase">
                                      <Clock className="w-2.5 h-2.5" />
                                      Antrian Penuh
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => canUnlock && setConfirmTarget(research)}
                                      disabled={!canUnlock}
                                      className={`w-full py-1 rounded border flex items-center justify-center gap-1 text-[9px] font-black uppercase transition-all cursor-pointer ${canUnlock
                                          ? 'bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA] hover:bg-[#00FFAA]/80 active:scale-95 shadow-md'
                                          : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                      <Rocket className="w-2.5 h-2.5" />
                                      {canUnlock ? `Riset (${research.cost.toLocaleString('id-ID')})` : 'Kas Tidak Cukup'}
                                    </button>
                                  )
                                )}

                                {active && (
                                  <div className="w-full py-1 rounded bg-[#00FFAA]/20 border border-[#00FFAA]/50 flex items-center justify-center gap-1 text-[#00FFAA] text-[9px] font-black uppercase">
                                    <Clock className="w-2.5 h-2.5 animate-pulse" />
                                    Diteliti ({activeResearchProgress}%)
                                  </div>
                                )}

                                {unlocked && (
                                  isMaxed ? (
                                    <div className="w-full py-1 rounded bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/50 flex items-center justify-center gap-1 text-amber-300 text-[9px] font-black uppercase">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      MAX (5/5)
                                    </div>
                                  ) : isResearching ? (
                                    <div className="w-full py-1 rounded bg-[#00FFAA]/20 border border-[#00FFAA]/50 flex items-center justify-center gap-1 text-[#00FFAA] text-[9px] font-black uppercase">
                                      <Clock className="w-2.5 h-2.5 animate-pulse" />
                                      Diteliti ({activeResearchProgress}%)
                                    </div>
                                  ) : activeResearchId ? (
                                    <div className="w-full py-1 rounded bg-[#0A1A1A] border border-[#6B8A8A]/30 flex items-center justify-center gap-1 text-[#6B8A8A] text-[9px] font-black uppercase">
                                      <Clock className="w-2.5 h-2.5" />
                                      Antrian Penuh
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => canUpgrade && setConfirmUpgrade({ research, targetLevel: nextLevel })}
                                      disabled={!canUpgrade}
                                      className={`w-full py-1 rounded border flex items-center justify-center gap-1 text-[9px] font-black uppercase transition-all cursor-pointer ${canUpgrade
                                          ? 'bg-gradient-to-r from-[#00FFAA] to-emerald-400 text-[#0A1A1A] border-[#00FFAA] hover:opacity-90 active:scale-95 shadow-md'
                                          : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                      <ChevronUp className="w-2.5 h-2.5" />
                                      {canUpgrade ? `Upgrade Lv.${nextLevel}` : 'Kas Tidak Cukup'}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12 text-[#6B8A8A] text-sm font-bold">
              Tidak ada riset yang cocok dengan "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* MODAL KONFIRMASI MULAI RISET */}
      {confirmTarget && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
          >
            <button onClick={() => setConfirmTarget(null)} className="absolute top-3 right-3 text-[#6B8A8A] hover:text-[#00FFAA] cursor-pointer">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 flex items-center justify-center shrink-0">
                <confirmTarget.icon className="h-6 w-6 text-[#00FFAA]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#E0E0E0] uppercase leading-tight">
                  {confirmTarget.name}
                </h3>
                <p className="text-[10px] text-[#6B8A8A] font-semibold mt-0.5">
                  Mulai Riset — Level 1
                </p>
              </div>
            </div>

            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Biaya Riset</span>
                <span className="text-sm font-black text-[#00FFAA]">
                  {confirmTarget.cost.toLocaleString('id-ID')} NEO
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Durasi</span>
                <span className="text-sm font-black text-sky-300 flex items-center gap-2">
                  {hasAtheismResearchBonus && (
                    <span className="text-rose-400 line-through">{confirmTarget.duration} hari</span>
                  )}
                  <span className={hasAtheismResearchBonus ? 'text-emerald-400' : ''}>
                    {getEffectiveResearchDuration(confirmTarget.duration)} hari
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#00FFAA]/20 pt-3">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Kas Setelah</span>
                <span className="text-sm font-black text-amber-400">
                  {(money - confirmTarget.cost).toLocaleString('id-ID')} NEO
                </span>
              </div>
            </div>

            <div className="bg-[#00FFAA]/5 border border-[#00FFAA]/20 rounded-lg p-3 mb-5">
              <p className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider mb-2">
                Efek pada Level 1:
              </p>
              {confirmTarget.effects.map((eff, i) => (
                <p key={i} className="text-[11px] font-bold text-[#E0E0E0]">
                  • {applyLevelBonus(
                    eff,
                    1,
                    confirmTarget.category === 'militer'
                      ? getMilitaryResearchBaseBonus(confirmTarget.id) ?? eff.value
                      : eff.value,
                    confirmTarget.category === 'militer'
                      ? getMilitaryResearchLevelBonus(confirmTarget.id, 1)
                      : undefined
                  )}
                </p>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#E0E0E0] active:scale-95 transition-all font-bold text-xs uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleStartResearch(confirmTarget)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 active:scale-95 transition-all font-bold text-xs uppercase cursor-pointer shadow-md"
              >
                Mulai Riset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI UPGRADE */}
      {confirmUpgrade && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmUpgrade(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
          >
            <button onClick={() => setConfirmUpgrade(null)} className="absolute top-3 right-3 text-[#6B8A8A] hover:text-[#00FFAA] cursor-pointer">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 flex items-center justify-center shrink-0">
                <confirmUpgrade.research.icon className="h-6 w-6 text-[#00FFAA]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#E0E0E0] uppercase leading-tight">
                  {confirmUpgrade.research.name}
                </h3>
                <p className="text-[10px] text-[#00FFAA] font-black mt-0.5">
                  Upgrade ke Level {confirmUpgrade.targetLevel}
                </p>
              </div>
            </div>

            {/* Level Transition */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-center">
                <p className="text-[9px] text-[#6B8A8A] font-black uppercase">Sekarang</p>
                <p className="text-lg font-black text-[#6B8A8A]">
                  LV.{getLevel(confirmUpgrade.research.id)}
                </p>
                <p className="text-[10px] text-[#6B8A8A] font-bold">
                  +{getCardBonus(getLevel(confirmUpgrade.research.id))}%
                </p>
              </div>
              <ChevronUp className="w-5 h-5 text-[#00FFAA] rotate-90" />
              <div className="text-center">
                <p className="text-[9px] text-[#00FFAA] font-black uppercase">Target</p>
                <p className="text-lg font-black text-[#00FFAA]">LV.{confirmUpgrade.targetLevel}</p>
                <p className="text-[10px] text-[#00FFAA] font-bold">
                  +{getCardBonus(confirmUpgrade.targetLevel)}%
                </p>
              </div>
            </div>

            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Biaya Upgrade</span>
                <span className="text-sm font-black text-[#00FFAA]">
                  {getCardUpgradeCost(confirmUpgrade.research, confirmUpgrade.targetLevel).toLocaleString('id-ID')} NEO
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Durasi</span>
                <span className="text-sm font-black text-sky-300 flex items-center gap-2">
                  {hasAtheismResearchBonus && (
                    <span className="text-rose-400 line-through">
                      {getCardUpgradeDuration(confirmUpgrade.research, confirmUpgrade.targetLevel)} hari
                    </span>
                  )}
                  <span className={hasAtheismResearchBonus ? 'text-emerald-400' : ''}>
                    {getEffectiveResearchDuration(
                      getCardUpgradeDuration(confirmUpgrade.research, confirmUpgrade.targetLevel)
                    )} hari
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#00FFAA]/20 pt-3">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Kas Setelah</span>
                <span className="text-sm font-black text-amber-400">
                  {(money - getCardUpgradeCost(confirmUpgrade.research, confirmUpgrade.targetLevel)).toLocaleString('id-ID')} NEO
                </span>
              </div>
            </div>

            <div className="bg-[#00FFAA]/5 border border-[#00FFAA]/20 rounded-lg p-3 mb-5">
              <p className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider mb-2">
                Efek Baru (Level {confirmUpgrade.targetLevel} +{getCardBonus(confirmUpgrade.targetLevel)}%):
              </p>
              {confirmUpgrade.research.effects.map((eff, i) => (
                <p key={i} className="text-[11px] font-bold text-[#E0E0E0]">
                  • {applyLevelBonus(
                    eff,
                    confirmUpgrade.targetLevel,
                    confirmUpgrade.research.category === 'militer'
                      ? getMilitaryResearchBaseBonus(confirmUpgrade.research.id) ?? eff.value
                      : eff.value,
                    confirmUpgrade.research.category === 'militer'
                      ? getMilitaryResearchLevelBonus(confirmUpgrade.research.id, confirmUpgrade.targetLevel)
                      : undefined
                  )}
                </p>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmUpgrade(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#E0E0E0] active:scale-95 transition-all font-bold text-xs uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleUpgradeResearch}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#00FFAA] to-emerald-400 text-[#0A1A1A] hover:opacity-90 active:scale-95 transition-all font-bold text-xs uppercase cursor-pointer shadow-md"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
