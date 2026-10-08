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

export type CategoryKey = 'ekonomi' | 'militer' | 'sosial' | 'lingkungan' | 'diplomasi' | 'budaya';

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
// Bonus riset militer bervariasi per kartu dan meningkat bertahap.
// =====================================================================



// ================= EKONOMI & INDUSTRI =================
// Empat tier, masing-masing lima kartu yang terhubung ke produk di lima menu produksi.
// TIER 1
{ id: 'otomasi_industri', name: 'Otomasi Fabrikasi Elektronik & Kendaraan', category: 'ekonomi', tier: 1, cost: 2000, duration: 15, prerequisites: [], icon: Cpu, description: 'Otomasi lini Pabrik Semikonduktor, Pabrik Mesin Mobil, dan Pabrik Mesin Motor.', effects: [{ stat: 'manufaktur', value: 2, label: '+2% Produksi Manufaktur' }] },
{ id: 'peternakan_modern', name: 'Peternakan Presisi', category: 'ekonomi', tier: 1, cost: 1800, duration: 14, prerequisites: [], icon: Beaker, description: 'Peningkatan budidaya Ayam Unggas, Sapi Perah, dan Sapi Potong.', effects: [{ stat: 'peternakan', value: 2, label: '+2% Produksi Peternakan' }] },
{ id: 'pertanian_presisi', name: 'Budidaya Pangan Pokok', category: 'ekonomi', tier: 1, cost: 1500, duration: 12, prerequisites: [], icon: Wheat, description: 'Teknik budidaya Padi, Gandum, Jagung, Sayur, Umbi, dan Kedelai.', effects: [{ stat: 'agrikultur', value: 2, label: '+2% Produksi Agrikultur' }] },
{ id: 'perikanan_modern', name: 'Budidaya Perikanan Terpadu', category: 'ekonomi', tier: 1, cost: 1400, duration: 11, prerequisites: [], icon: Leaf, description: 'Peningkatan produksi Ikan, Udang, dan Mutiara melalui budidaya serta armada tangkap.', effects: [{ stat: 'perikanan', value: 2, label: '+2% Produksi Perikanan' }] },
{ id: 'pengolahan_pangan', name: 'Pengolahan Pangan Dasar', category: 'ekonomi', tier: 1, cost: 1900, duration: 14, prerequisites: [], icon: Wheat, description: 'Teknologi produksi Air Mineral, Gula, Roti, Susu, dan Beras.', effects: [{ stat: 'olahan pangan', value: 2, label: '+2% Produksi Olahan Pangan' }] },

// TIER 2
{ id: 'manufaktur_material', name: 'Rekayasa Material Manufaktur', category: 'ekonomi', tier: 2, cost: 3500, duration: 22, prerequisites: ['otomasi_industri'], icon: Cpu, description: 'Proses material dan komponen untuk Pabrik Semikonduktor, Pabrik Mesin Mobil, Pabrik Mesin Motor, Semen Beton, dan Kayu.', effects: [{ stat: 'manufaktur', value: 2, label: '+2% Produksi Manufaktur' }] },
{ id: 'peternakan_genetika', name: 'Genetika & Pakan Ternak', category: 'ekonomi', tier: 2, cost: 3300, duration: 21, prerequisites: ['peternakan_modern'], icon: Beaker, description: 'Peningkatan hasil Ayam Unggas, Sapi Perah, Sapi Potong, dan Domba Kambing.', effects: [{ stat: 'peternakan', value: 2, label: '+2% Produksi Peternakan' }] },
{ id: 'perkebunan_komoditas', name: 'Teknologi Perkebunan Komoditas', category: 'ekonomi', tier: 2, cost: 3200, duration: 20, prerequisites: ['pertanian_presisi'], icon: Wheat, description: 'Optimalisasi Kelapa Sawit, Kopi, Teh, Kakao, Tebu, dan Karet.', effects: [{ stat: 'agrikultur', value: 2, label: '+2% Produksi Agrikultur' }] },
{ id: 'perikanan_pascapanen', name: 'Teknologi Perikanan & Pascapanen', category: 'ekonomi', tier: 2, cost: 3100, duration: 19, prerequisites: ['perikanan_modern'], icon: Leaf, description: 'Peningkatan hasil Ikan, Udang, dan Mutiara serta penanganan hasil tangkap.', effects: [{ stat: 'perikanan', value: 2, label: '+2% Produksi Perikanan' }] },
{ id: 'pengawetan_pangan', name: 'Pengawetan & Pengolahan Pangan', category: 'ekonomi', tier: 2, cost: 3400, duration: 21, prerequisites: ['pengolahan_pangan'], icon: Wheat, description: 'Teknologi untuk Gula, Roti, Pengolahan Daging, Mi Instan, Minyak Goreng, Susu, dan Beras.', effects: [{ stat: 'olahan pangan', value: 2, label: '+2% Produksi Olahan Pangan' }] },

// TIER 3
{ id: 'manufaktur_terintegrasi', name: 'Integrasi Rantai Manufaktur', category: 'ekonomi', tier: 3, cost: 6500, duration: 34, prerequisites: ['manufaktur_material'], icon: Cpu, description: 'Integrasi produksi Pabrik Semikonduktor, Pabrik Mesin Mobil, Pabrik Mesin Motor, Semen Beton, dan Kayu.', effects: [{ stat: 'manufaktur', value: 2, label: '+2% Produksi Manufaktur' }] },
{ id: 'peternakan_otomatis', name: 'Peternakan Terotomasi', category: 'ekonomi', tier: 3, cost: 6200, duration: 32, prerequisites: ['peternakan_genetika'], icon: Beaker, description: 'Otomasi fasilitas Ayam Unggas, Sapi Perah, Sapi Potong, dan Domba Kambing.', effects: [{ stat: 'peternakan', value: 2, label: '+2% Produksi Peternakan' }] },
{ id: 'agrikultur_cerdas', name: 'Agrikultur Cerdas Multi-Komoditas', category: 'ekonomi', tier: 3, cost: 6000, duration: 31, prerequisites: ['perkebunan_komoditas'], icon: Wheat, description: 'Pengelolaan Padi, Gandum, Jagung, Sayur, Umbi, Kedelai, Kelapa Sawit, Kopi, Teh, Kakao, Tebu, dan Karet.', effects: [{ stat: 'agrikultur', value: 2, label: '+2% Produksi Agrikultur' }] },
{ id: 'perikanan_cerdas', name: 'Perikanan Budidaya Cerdas', category: 'ekonomi', tier: 3, cost: 5900, duration: 30, prerequisites: ['perikanan_pascapanen'], icon: Leaf, description: 'Pemantauan dan peningkatan hasil Ikan, Udang, serta Mutiara.', effects: [{ stat: 'perikanan', value: 2, label: '+2% Produksi Perikanan' }] },
{ id: 'pangan_efisien', name: 'Efisiensi Industri Pangan', category: 'ekonomi', tier: 3, cost: 6300, duration: 33, prerequisites: ['pengawetan_pangan'], icon: Wheat, description: 'Efisiensi produksi Air Mineral, Gula, Roti, Pengolahan Daging, Mi Instan, Minyak Goreng, Susu, dan Beras.', effects: [{ stat: 'olahan pangan', value: 2, label: '+2% Produksi Olahan Pangan' }] },

// TIER 4
{ id: 'manufaktur_lanjut', name: 'Manufaktur Material & Mesin Terpadu', category: 'ekonomi', tier: 4, cost: 11000, duration: 48, prerequisites: ['manufaktur_terintegrasi'], icon: Cpu, description: 'Peningkatan teknologi untuk Pabrik Semikonduktor, Pabrik Mesin Mobil, Pabrik Mesin Motor, Semen Beton, dan Kayu.', effects: [{ stat: 'manufaktur', value: 2, label: '+2% Produksi Manufaktur' }] },
{ id: 'peternakan_berkelanjutan', name: 'Peternakan Produktif Berkelanjutan', category: 'ekonomi', tier: 4, cost: 10500, duration: 46, prerequisites: ['peternakan_otomatis'], icon: Beaker, description: 'Sistem produksi berkelanjutan untuk Ayam Unggas, Sapi Perah, Sapi Potong, dan Domba Kambing.', effects: [{ stat: 'peternakan', value: 2, label: '+2% Produksi Peternakan' }] },
{ id: 'agrikultur_tangguh', name: 'Agrikultur Tangguh Multi-Komoditas', category: 'ekonomi', tier: 4, cost: 10000, duration: 44, prerequisites: ['agrikultur_cerdas'], icon: Wheat, description: 'Teknologi budidaya tangguh untuk Padi, Gandum, Jagung, Sayur, Umbi, Kedelai, Kelapa Sawit, Kopi, Teh, Kakao, Tebu, dan Karet.', effects: [{ stat: 'agrikultur', value: 2, label: '+2% Produksi Agrikultur' }] },
{ id: 'perikanan_berkelanjutan', name: 'Perikanan Produktif Berkelanjutan', category: 'ekonomi', tier: 4, cost: 9800, duration: 43, prerequisites: ['perikanan_cerdas'], icon: Leaf, description: 'Pengelolaan berkelanjutan untuk hasil Ikan, Udang, dan Mutiara.', effects: [{ stat: 'perikanan', value: 2, label: '+2% Produksi Perikanan' }] },
{ id: 'industri_pangan_terpadu', name: 'Industri Pangan Terintegrasi', category: 'ekonomi', tier: 4, cost: 10800, duration: 47, prerequisites: ['pangan_efisien'], icon: Wheat, description: 'Integrasi produksi Air Mineral, Gula, Roti, Pengolahan Daging, Mi Instan, Minyak Goreng, Susu, dan Beras.', effects: [{ stat: 'olahan pangan', value: 2, label: '+2% Produksi Olahan Pangan' }] },

// ================= MILITER & PERTAHANAN =================
// TIER 1
{ id: 'tank_generasi_baru', name: 'Tank Tempur Komposit', category: 'militer', tier: 1, cost: 2500, duration: 18, prerequisites: [], icon: Shield, description: 'Armor komposit ringan meningkatkan efektivitas Tank Tempur Utama.', effects: [{ stat: 'darat', value: 2, label: '+2% Kekuatan Tank Tempur Utama' }] },
{ id: 'drone_otonom', name: 'Drone Pengintai Taktis', category: 'militer', tier: 1, cost: 2200, duration: 16, prerequisites: [], icon: Wifi, description: 'Sistem otonom meningkatkan efektivitas Drone Intai UAV.', effects: [{ stat: 'intel', value: 2, label: '+2% Kekuatan Drone Intai UAV' }] },
{ id: 'senjata_infanteri', name: 'Senapan Serbu Presisi', category: 'militer', tier: 1, cost: 2000, duration: 15, prerequisites: [], icon: Crosshair, description: 'Senjata otomatis presisi meningkatkan kekuatan pasukan infanteri.', effects: [{ stat: 'infanteri', value: 2, label: '+2% Kekuatan Pasukan Infanteri' }] },
{ id: 'radar_pesisir', name: 'Radar Pesisir Pantai', category: 'militer', tier: 1, cost: 2300, duration: 17, prerequisites: [], icon: Wifi, description: 'Deteksi jarak jauh meningkatkan efektivitas kapal destroyer.', effects: [{ stat: 'radar', value: 2, label: '+2% Kekuatan Kapal Destroyer' }] },
{ id: 'benteng_perbatasan', name: 'Pos Pertahanan Perbatasan', category: 'militer', tier: 1, cost: 2100, duration: 15, prerequisites: [], icon: Shield, description: 'Doktrin pertahanan perbatasan meningkatkan efektivitas APC/IFV.', effects: [{ stat: 'bunker', value: 2, label: '+2% Kekuatan APC / IFV' }] },

// TIER 2
{ id: 'kapal_stealth', name: 'Kapal Korvet Siluman', category: 'militer', tier: 2, cost: 4000, duration: 25, prerequisites: ['tank_generasi_baru'], icon: Shield, description: 'Teknologi siluman meningkatkan efektivitas kapal korvet.', effects: [{ stat: 'laut', value: 2, label: '+2% Kekuatan Kapal Korvet' }] },
{ id: 'perang_siber', name: 'Komando Siber Ofensif', category: 'militer', tier: 2, cost: 3800, duration: 24, prerequisites: ['drone_otonom'], icon: Cpu, description: 'Jaringan komando siber meningkatkan efektivitas operasi sabotase terhadap lawan.', effects: [{ stat: 'sabotase', value: 2, label: '+2% Efektivitas Sabotase' }] },
{ id: 'artileri_presisi', name: 'Artileri Roket Otonom', category: 'militer', tier: 2, cost: 4200, duration: 26, prerequisites: ['senjata_infanteri'], icon: Crosshair, description: 'Sistem bidik otonom meningkatkan efektivitas artileri berat.', effects: [{ stat: 'artileri', value: 2, label: '+2% Kekuatan Artileri Berat' }] },
{ id: 'kapal_selam_diesel', name: 'Kapal Selam Modern', category: 'militer', tier: 2, cost: 4500, duration: 28, prerequisites: ['radar_pesisir'], icon: Shield, description: 'Teknologi patroli laut meningkatkan efektivitas kapal selam reguler.', effects: [{ stat: 'patroli', value: 2, label: '+2% Kekuatan Kapal Selam Reguler' }] },
{ id: 'helikopter_serang', name: 'Helikopter Tempur', category: 'militer', tier: 2, cost: 4100, duration: 25, prerequisites: ['benteng_perbatasan'], icon: Rocket, description: 'Dukungan udara jarak dekat meningkatkan kekuatan helikopter serang.', effects: [{ stat: 'helikopter', value: 2, label: '+2% Kekuatan Helikopter Serang' }] },

// TIER 3
{ id: 'jet_siluman', name: 'Jet Tempur Generasi 5', category: 'militer', tier: 3, cost: 7000, duration: 35, prerequisites: ['kapal_stealth'], icon: Rocket, description: 'Teknologi siluman meningkatkan kekuatan jet tempur siluman.', effects: [{ stat: 'udara', value: 2, label: '+2% Kekuatan Jet Tempur Siluman' }] },
{ id: 'satelit_mata_mata', name: 'Satelit Pengintai Optik', category: 'militer', tier: 3, cost: 6800, duration: 34, prerequisites: ['perang_siber'], icon: Wifi, description: 'Data satelit meningkatkan efektivitas pesawat pengintai.', effects: [{ stat: 'spionase', value: 2, label: '+2% Kekuatan Pesawat Pengintai' }] },
{ id: 'rudal_jelajah', name: 'Rudal Jelajah Presisi', category: 'militer', tier: 3, cost: 7200, duration: 36, prerequisites: ['artileri_presisi'], icon: Crosshair, description: 'Sistem rudal presisi meningkatkan kekuatan sistem peluncur roket.', effects: [{ stat: 'rudal', value: 2, label: '+2% Kekuatan Sistem Peluncur Roket' }] },
{ id: 'sistem_sam', name: 'Sistem Anti-Udara (SAM)', category: 'militer', tier: 3, cost: 7100, duration: 35, prerequisites: ['kapal_selam_diesel'], icon: Shield, description: 'Sistem pertahanan udara meningkatkan kekuatan pertahanan udara mobile.', effects: [{ stat: 'sam', value: 2, label: '+2% Kekuatan Pertahanan Udara Mobile' }] },
{ id: 'pasukan_khusus', name: 'Reorganisasi Pasukan Khusus', category: 'militer', tier: 3, cost: 6500, duration: 32, prerequisites: ['helikopter_serang'], icon: Crosshair, description: 'Doktrin komando meningkatkan kekuatan kendaraan taktis.', effects: [{ stat: 'elit', value: 2, label: '+2% Kekuatan Kendaraan Taktis' }] },

// TIER 4
{ id: 'rudal_hipersonik', name: 'Rudal Hipersonik Mach 7', category: 'militer', tier: 4, cost: 11000, duration: 45, prerequisites: ['jet_siluman'], icon: Crosshair, description: 'Rudal hipersonik meningkatkan kekuatan pesawat pengebom.', effects: [{ stat: 'serangan', value: 2, label: '+2% Kekuatan Pesawat Pengebom' }] },
{ id: 'program_nuklir', name: 'Reaktor Pengayaan Nuklir', category: 'militer', tier: 4, cost: 12000, duration: 50, prerequisites: ['satelit_mata_mata'], icon: Atom, description: 'Teknologi nuklir meningkatkan kekuatan kapal induk nuklir.', effects: [{ stat: 'nuklir', value: 2, label: '+2% Kekuatan Kapal Induk Nuklir' }] },
{ id: 'kapal_induk', name: 'Kapal Induk Bertenaga Nuklir', category: 'militer', tier: 4, cost: 13000, duration: 55, prerequisites: ['rudal_jelajah'], icon: Shield, description: 'Teknologi proyeksi armada meningkatkan kekuatan kapal induk.', effects: [{ stat: 'proyeksi', value: 2, label: '+2% Kekuatan Kapal Induk' }] },
{ id: 'laser_defensif', name: 'Senjata Laser Anti-Drone', category: 'militer', tier: 4, cost: 10500, duration: 44, prerequisites: ['sistem_sam'], icon: Zap, description: 'Intersepsi laser meningkatkan kekuatan drone kamikaze.', effects: [{ stat: 'laser', value: 2, label: '+2% Kekuatan Drone Kamikaze' }] },
{ id: 'baju_baja_eksoskeleton', name: 'Avionik & Proteksi Jet Interceptor', category: 'militer', tier: 4, cost: 10000, duration: 42, prerequisites: ['pasukan_khusus'], icon: Cpu, description: 'Avionik dan lapisan proteksi meningkatkan kekuatan jet tempur interceptor.', effects: [{ stat: 'interceptor', value: 2, label: '+2% Kekuatan Jet Tempur Interceptor' }] },

// TIER 5
{ id: 'pertahanan_nuklir', name: 'Kubah Pertahanan Anti-Rudal', category: 'militer', tier: 5, cost: 20000, duration: 75, prerequisites: ['rudal_hipersonik'], icon: Shield, description: 'Perisai anti-rudal meningkatkan kekuatan kapal selam nuklir.', effects: [{ stat: 'kubah', value: 2, label: '+2% Kekuatan Kapal Selam Nuklir' }] },
{ id: 'icbm', name: 'ICBM Balistik Antar Benua', category: 'militer', tier: 5, cost: 25000, duration: 90, prerequisites: ['program_nuklir'], icon: Rocket, description: 'Pengembangan ICBM meningkatkan kemampuan serangan nuklir strategis.', effects: [{ stat: 'icbm', value: 2, label: '+2% Kemampuan Serangan Nuklir Strategis' }] },
{ id: 'senjata_orbit', name: 'Sistem Perang Ranjau Laut', category: 'militer', tier: 5, cost: 22000, duration: 80, prerequisites: ['kapal_induk'], icon: Rocket, description: 'Sistem kendali ranjau meningkatkan kekuatan kapal ranjau.', effects: [{ stat: 'ranjau', value: 2, label: '+2% Kekuatan Kapal Ranjau' }] },
{ id: 'komando_otonom_ai', name: 'Komando Logistik Armada Berbasis AI', category: 'militer', tier: 5, cost: 21000, duration: 78, prerequisites: ['laser_defensif'], icon: Cpu, description: 'Optimasi komando AI meningkatkan kekuatan kapal logistik.', effects: [{ stat: 'ai_war', value: 2, label: '+2% Kekuatan Kapal Logistik' }] },
{ id: 'pasukan_kloning', name: 'Sistem Angkut Udara Strategis', category: 'militer', tier: 5, cost: 19000, duration: 72, prerequisites: ['baju_baja_eksoskeleton'], icon: HeartPulse, description: 'Peningkatan mobilisasi udara memperkuat pesawat angkut.', effects: [{ stat: 'bio_inf', value: 2, label: '+2% Kekuatan Pesawat Angkut' }] },

// ================= SOSIAL & KESEJAHTERAAN =================
// TIER 1
{ id: 'obat_generik', name: 'Obat Generik Nasional', category: 'sosial', tier: 1, cost: 1500, duration: 12, prerequisites: [], icon: HeartPulse, description: 'Produksi obat murah dalam negeri.', effects: [{ stat: 'subsidi', value: 2, label: '-2% Biaya Obat' }] },
{ id: 'pendidikan_digital', name: 'Pendidikan Digital Merata', category: 'sosial', tier: 1, cost: 1800, duration: 14, prerequisites: [], icon: BookOpen, description: 'E-learning nasional sekolah.', effects: [{ stat: 'sekolah', value: 2, label: '+2% Efektivitas Belajar' }] },
{ id: 'air_bersih', name: 'Sanitasi & Air Bersih Desa', category: 'sosial', tier: 1, cost: 1400, duration: 11, prerequisites: [], icon: Leaf, description: 'Pipatisasi air minum warga.', effects: [{ stat: 'sanitasi', value: 2, label: '+2% Kesehatan Warga' }] },
{ id: 'perumahan_rakyat', name: 'Program Perumahan Subsidi', category: 'sosial', tier: 1, cost: 1600, duration: 13, prerequisites: [], icon: Sparkles, description: 'Hunian murah layak huni.', effects: [{ stat: 'hunian', value: 2, label: '+2% Kualitas Hunian' }] },
{ id: 'posyandu_digital', name: 'Posyandu & Gizi Balita', category: 'sosial', tier: 1, cost: 1300, duration: 10, prerequisites: [], icon: HeartPulse, description: 'Pencegahan stunting nasional.', effects: [{ stat: 'gizi', value: 2, label: '-2% Angka Stunting' }] },

// TIER 2
{ id: 'vaksin_universal', name: 'Vaksinasi Universal', category: 'sosial', tier: 2, cost: 2500, duration: 16, prerequisites: ['obat_generik'], icon: HeartPulse, description: 'Pencegahan wabah nasional.', effects: [{ stat: 'wabah', value: 2, label: '-2% Risiko Wabah' }] },
{ id: 'beasiswa_nasional', name: 'Beasiswa Sarjana Daerah', category: 'sosial', tier: 2, cost: 2200, duration: 15, prerequisites: ['pendidikan_digital'], icon: BookOpen, description: 'Kuliah gratis untuk putra daerah.', effects: [{ stat: 'sarjana', value: 2, label: '+2% Pemuda Terdidik' }] },
{ id: 'puskesmas_keliling', name: 'Puskesmas Mobil Terpadu', category: 'sosial', tier: 2, cost: 2400, duration: 16, prerequisites: ['air_bersih'], icon: HeartPulse, description: 'Layanan medis terpencil.', effects: [{ stat: 'akses', value: 2, label: '+2% Akses Medis' }] },
{ id: 'subsidi_energi', name: 'Subsidi Tepat Sasaran', category: 'sosial', tier: 2, cost: 2300, duration: 15, prerequisites: ['perumahan_rakyat'], icon: Banknote, description: 'Bantuan langsung tunai.', effects: [{ stat: 'kemiskinan', value: 2, label: '-2% Kemiskinan Ekstrem' }] },
{ id: 'pelatihan_kerja', name: 'Balai Latihan Kerja AI', category: 'sosial', tier: 2, cost: 2100, duration: 14, prerequisites: ['posyandu_digital'], icon: Cpu, description: 'Sertifikasi keahlian pemuda.', effects: [{ stat: 'kerja', value: 2, label: '-2% Pengangguran' }] },

// TIER 3
{ id: 'kesehatan_mental', name: 'Layanan Kesehatan Mental', category: 'sosial', tier: 3, cost: 4000, duration: 25, prerequisites: ['vaksin_universal'], icon: HeartPulse, description: 'Konseling psikologis publik.', effects: [{ stat: 'bahagia', value: 2, label: '+2% Kepuasan Hidup' }] },
{ id: 'smart_city', name: 'Kota Pintar & Terintegrasi', category: 'sosial', tier: 3, cost: 4500, duration: 28, prerequisites: ['beasiswa_nasional'], icon: Cpu, description: 'Layanan publik serba otomatis.', effects: [{ stat: 'layanan', value: 2, label: '+2% Efisiensi Kota' }] },
{ id: 'rumah_sakit_rujukan', name: 'RS Rujukan Antar Provinsi', category: 'sosial', tier: 3, cost: 4200, duration: 26, prerequisites: ['puskesmas_keliling'], icon: HeartPulse, description: 'Spesialis bedah & jantung.', effects: [{ stat: 'harapan', value: 2, label: '+2% Harapan Hidup' }] },
{ id: 'asuransi_tenaga_kerja', name: 'Jaminan Sosial Buruh', category: 'sosial', tier: 3, cost: 4300, duration: 27, prerequisites: ['subsidi_energi'], icon: Shield, description: 'Perlindungan pekerja industri.', effects: [{ stat: 'buruh', value: 2, label: '+2% Keamanan Buruh' }] },
{ id: 'taman_kota_hijau', name: 'Taman Rekreasi & Olahraga', category: 'sosial', tier: 3, cost: 3800, duration: 23, prerequisites: ['pelatihan_kerja'], icon: Leaf, description: 'Ruang terbuka hijau warga.', effects: [{ stat: 'stres', value: 2, label: '-2% Stres Perkotaan' }] },

// TIER 4
{ id: 'rumah_pintar', name: 'Rumah Pintar Terjangkau', category: 'sosial', tier: 4, cost: 7000, duration: 38, prerequisites: ['kesehatan_mental'], icon: Sparkles, description: 'IoT hunian hemat energi.', effects: [{ stat: 'hunian_pintar', value: 2, label: '+2% Kenyamanan Kota' }] },
{ id: 'transportasi_otonom', name: 'Transportasi Massal Listrik', category: 'sosial', tier: 4, cost: 7500, duration: 40, prerequisites: ['smart_city'], icon: Rocket, description: 'Bus & MRT tanpa pengemudi.', effects: [{ stat: 'macet', value: 2, label: '-2% Kemacetan Kota' }] },
{ id: 'telemedis_nasional', name: 'Platform Operasi Telemedis', category: 'sosial', tier: 4, cost: 7200, duration: 39, prerequisites: ['rumah_sakit_rujukan'], icon: Wifi, description: 'Bedah robotik jarak jauh.', effects: [{ stat: 'bedah', value: 2, label: '+2% Keberhasilan Medis' }] },
{ id: 'dana_pensiun_universal', name: 'Dana Pensiun Terjamin', category: 'sosial', tier: 4, cost: 7800, duration: 42, prerequisites: ['asuransi_tenaga_kerja'], icon: Banknote, description: 'Jaminan hari tua lansia.', effects: [{ stat: 'pensiun', value: 2, label: '+2% Kesejahteraan Lansia' }] },
{ id: 'kesetaraan_gender', name: 'Program Pemberdayaan Ekonomi', category: 'sosial', tier: 4, cost: 6800, duration: 36, prerequisites: ['taman_kota_hijau'], icon: BookOpen, description: 'Kemandirian ekonomi keluarga.', effects: [{ stat: 'keluarga', value: 2, label: '+2% Ekonomi Keluarga' }] },

// TIER 5
{ id: 'jaminan_universal', name: 'Jaminan Sosial Seumur Hidup', category: 'sosial', tier: 5, cost: 15000, duration: 60, prerequisites: ['rumah_pintar'], icon: HeartPulse, description: 'Layanan sosial gratis seumur hidup.', effects: [{ stat: 'bahagia_max', value: 2, label: '+2% Kepuasan Rakyat' }] },
{ id: 'kota_utopia', name: 'Kota Bebas Emisi & Kejahatan', category: 'sosial', tier: 5, cost: 17000, duration: 68, prerequisites: ['transportasi_otonom'], icon: Cpu, description: 'Hunian ideal bebas kriminal.', effects: [{ stat: 'kriminal', value: 2, label: '-2% Kriminalitas' }] },
{ id: 'regenerasi_sel', name: 'Terapi Panjang Umur Nasional', category: 'sosial', tier: 5, cost: 16000, duration: 65, prerequisites: ['telemedis_nasional'], icon: HeartPulse, description: 'Penghambat penuaan dini.', effects: [{ stat: 'umur_max', value: 2, label: '+2% Angka Harapan Hidup' }] },
{ id: 'pendidikan_gratis', name: 'Pendidikan Tinggi Gratis', category: 'sosial', tier: 5, cost: 14000, duration: 58, prerequisites: ['dana_pensiun_universal'], icon: BookOpen, description: 'Bebas biaya universitas 100%.', effects: [{ stat: 'iq', value: 2, label: '+2% Kapasitas SDM' }] },
{ id: 'kesetaraan_total', name: 'Indeks Kesejahteraan Maksimum', category: 'sosial', tier: 5, cost: 18000, duration: 70, prerequisites: ['kesetaraan_gender'], icon: Sparkles, description: 'Penghapusan kesenjangan sosial.', effects: [{ stat: 'harmoni', value: 2, label: '+2% Stabilitas Sosial' }] },

// ================= LINGKUNGAN & ENERGI =================
// TIER 1 (WAKTU PEMBANGUNAN - GROUP 1)
{ id: 'waktu_pltn', name: 'Pembangunan PLTN', category: 'lingkungan', tier: 1, cost: 2000, duration: 15, prerequisites: [], icon: Atom, description: 'Riset efisiensi metode & percepatan konstruksi PLTN (Nuklir).', effects: [{ stat: 'pltn_waktu', value: -2, label: 'Waktu pembangunan -2%' }] },
{ id: 'waktu_plta', name: 'Pembangunan PLTA', category: 'lingkungan', tier: 1, cost: 1800, duration: 14, prerequisites: [], icon: Zap, description: 'Riset efisiensi metode & percepatan konstruksi PLTA (Air).', effects: [{ stat: 'plta_waktu', value: -2, label: 'Waktu pembangunan -2%' }] },
{ id: 'waktu_plts', name: 'Pembangunan PLTS', category: 'lingkungan', tier: 1, cost: 1700, duration: 13, prerequisites: [], icon: Zap, description: 'Riset efisiensi metode & percepatan konstruksi PLTS (Surya).', effects: [{ stat: 'plts_waktu', value: -2, label: 'Waktu pembangunan -2%' }] },
{ id: 'waktu_pltu', name: 'Pembangunan PLTU', category: 'lingkungan', tier: 1, cost: 1900, duration: 14, prerequisites: [], icon: Zap, description: 'Riset efisiensi metode & percepatan konstruksi PLTU (Uap).', effects: [{ stat: 'pltu_waktu', value: -2, label: 'Waktu pembangunan -2%' }] },
{ id: 'waktu_pltg', name: 'Pembangunan PLTG', category: 'lingkungan', tier: 1, cost: 1850, duration: 13, prerequisites: [], icon: Zap, description: 'Riset efisiensi metode & percepatan konstruksi PLTG (Gas).', effects: [{ stat: 'pltg_waktu', value: -2, label: 'Waktu pembangunan -2%' }] },

// TIER 2 (PRODUKSI / OUTPUT - GROUP 1)
{ id: 'output_pltn', name: 'Output PLTN', category: 'lingkungan', tier: 2, cost: 4000, duration: 25, prerequisites: ['waktu_pltn'], icon: Atom, description: 'Optimasi & peningkatan kapasitas output Pembangkit Listrik Tenaga Nuklir.', effects: [{ stat: 'pltn_output', value: 2, label: '+2% Output PLTN' }] },
{ id: 'output_plta', name: 'Output PLTA', category: 'lingkungan', tier: 2, cost: 3800, duration: 24, prerequisites: ['waktu_plta'], icon: Zap, description: 'Optimasi & peningkatan kapasitas output Pembangkit Listrik Tenaga Air.', effects: [{ stat: 'plta_output', value: 2, label: '+2% Output PLTA' }] },
{ id: 'output_plts', name: 'Output PLTS', category: 'lingkungan', tier: 2, cost: 3600, duration: 23, prerequisites: ['waktu_plts'], icon: Zap, description: 'Optimasi & peningkatan kapasitas output Pembangkit Listrik Tenaga Surya.', effects: [{ stat: 'plts_output', value: 2, label: '+2% Output PLTS' }] },
{ id: 'output_pltu', name: 'Output PLTU', category: 'lingkungan', tier: 2, cost: 4200, duration: 26, prerequisites: ['waktu_pltu'], icon: Zap, description: 'Optimasi & peningkatan kapasitas output Pembangkit Listrik Tenaga Uap.', effects: [{ stat: 'pltu_output', value: 2, label: '+2% Output PLTU' }] },
{ id: 'output_pltg', name: 'Output PLTG', category: 'lingkungan', tier: 2, cost: 3900, duration: 24, prerequisites: ['waktu_pltg'], icon: Zap, description: 'Optimasi & peningkatan kapasitas output Pembangkit Listrik Tenaga Gas.', effects: [{ stat: 'pltg_output', value: 2, label: '+2% Output PLTG' }] },

// TIER 3 (WAKTU PEMBANGUNAN - GROUP 2)
{ id: 'waktu_pltb', name: 'Pembangunan PLTB', category: 'lingkungan', tier: 3, cost: 6500, duration: 35, prerequisites: ['output_pltn'], icon: Zap, description: 'Riset efisiensi metode & percepatan konstruksi PLTB (Angin/Bayu).', effects: [{ stat: 'pltb_waktu', value: -2, label: 'Waktu pembangunan -2%' }] },
{ id: 'waktu_pltp', name: 'Pembangunan PLTP', category: 'lingkungan', tier: 3, cost: 6800, duration: 36, prerequisites: ['output_plta'], icon: Zap, description: 'Riset efisiensi metode & percepatan konstruksi PLTP (Panas Bumi).', effects: [{ stat: 'pltp_waktu', value: -2, label: 'Waktu pembangunan -2%' }] },
{ id: 'waktu_plth', name: 'Pembangunan PLTH', category: 'lingkungan', tier: 3, cost: 6200, duration: 32, prerequisites: ['output_plts'], icon: Zap, description: 'Riset efisiensi metode & percepatan konstruksi PLTH (Hidrogen).', effects: [{ stat: 'plth_waktu', value: -2, label: 'Waktu pembangunan -2%' }] },
{ id: 'waktu_pltgl', name: 'Pembangunan PLTGL', category: 'lingkungan', tier: 3, cost: 6400, duration: 34, prerequisites: ['output_pltu'], icon: Zap, description: 'Riset efisiensi metode & percepatan konstruksi PLTGL (Gelombang Laut).', effects: [{ stat: 'pltgl_waktu', value: -2, label: 'Waktu pembangunan -2%' }] },
{ id: 'waktu_pltfn', name: 'Pembangunan PLTFN', category: 'lingkungan', tier: 3, cost: 6100, duration: 31, prerequisites: ['output_pltg'], icon: Atom, description: 'Riset efisiensi metode & percepatan konstruksi PLTFN (Fusi Nuklir).', effects: [{ stat: 'pltfn_waktu', value: -2, label: 'Waktu pembangunan -2%' }] },

// TIER 4 (PRODUKSI / OUTPUT - GROUP 2)
{ id: 'output_pltb', name: 'Output PLTB', category: 'lingkungan', tier: 4, cost: 10000, duration: 48, prerequisites: ['waktu_pltb'], icon: Zap, description: 'Optimasi & peningkatan kapasitas output Pembangkit Listrik Tenaga Angin.', effects: [{ stat: 'pltb_output', value: 2, label: '+2% Output PLTB' }] },
{ id: 'output_pltp', name: 'Output PLTP', category: 'lingkungan', tier: 4, cost: 10500, duration: 50, prerequisites: ['waktu_pltp'], icon: Zap, description: 'Optimasi & peningkatan kapasitas output Pembangkit Listrik Panas Bumi.', effects: [{ stat: 'pltp_output', value: 2, label: '+2% Output PLTP' }] },
{ id: 'output_plth', name: 'Output PLTH', category: 'lingkungan', tier: 4, cost: 9800, duration: 46, prerequisites: ['waktu_plth'], icon: Zap, description: 'Optimasi & peningkatan kapasitas output Pembangkit Listrik Hidrogen.', effects: [{ stat: 'plth_output', value: 2, label: '+2% Output PLTH' }] },
{ id: 'output_pltgl', name: 'Output PLTGL', category: 'lingkungan', tier: 4, cost: 11000, duration: 52, prerequisites: ['waktu_pltgl'], icon: Zap, description: 'Optimasi & peningkatan kapasitas output Pembangkit Listrik Gelombang Laut.', effects: [{ stat: 'pltgl_output', value: 2, label: '+2% Output PLTGL' }] },
{ id: 'output_pltfn', name: 'Output PLTFN', category: 'lingkungan', tier: 4, cost: 10800, duration: 51, prerequisites: ['waktu_pltfn'], icon: Atom, description: 'Optimasi & peningkatan kapasitas output Pembangkit Listrik Fusi Nuklir.', effects: [{ stat: 'pltfn_output', value: 2, label: '+2% Output PLTFN' }] },

// ================= DIPLOMASI & INTELIJEN =================
// TIER 1
{ id: 'diplomasi_digital', name: 'Diplomasi Digital Global', category: 'diplomasi', tier: 1, cost: 1800, duration: 12, prerequisites: [], icon: Globe2, description: 'Kanal diplomasi daring resmi.', effects: [{ stat: 'pbb', value: 2, label: '+2% Resolusi PBB' }] },
{ id: 'soft_power_cultural', name: 'Diplomasi Budaya & Seni', category: 'diplomasi', tier: 1, cost: 2000, duration: 14, prerequisites: [], icon: Palette, description: 'Promosi karya seni di luar negeri.', effects: [{ stat: 'unesco', value: 2, label: '+2% Pengaruh UNESCO' }] },
{ id: 'kedutaan_besar', name: 'Modernisasi Kedutaan Besar', category: 'diplomasi', tier: 1, cost: 1900, duration: 13, prerequisites: [], icon: Globe2, description: 'Atase pertahanan & dagang.', effects: [{ stat: 'atase', value: 2, label: '+2% Pengaruh Kedutaan' }] },
{ id: 'intelijen_taktis', name: 'Badan Intelijen Daerah', category: 'diplomasi', tier: 1, cost: 1700, duration: 11, prerequisites: [], icon: Shield, description: 'Pengumpulan informasi batas.', effects: [{ stat: 'intel_dasar', value: 2, label: '+2% Info Teritorial' }] },
{ id: 'perjanjian_dagang', name: 'Pakta Perdagangan Bipartit', category: 'diplomasi', tier: 1, cost: 1600, duration: 10, prerequisites: [], icon: Banknote, description: 'Penurunan tarif bea masuk.', effects: [{ stat: 'tarif', value: 2, label: '-2% Tarif Impor' }] },

// TIER 2
{ id: 'diplomasi_multilateral', name: 'Blok Diplomasi Regional', category: 'diplomasi', tier: 2, cost: 3500, duration: 22, prerequisites: ['diplomasi_digital'], icon: Globe2, description: 'Aliansi politik kawasan.', effects: [{ stat: 'aliansi', value: 2, label: '+2% Suara Regional' }] },
{ id: 'kriptografi', name: 'Enkripsi Data Kriptografi', category: 'diplomasi', tier: 2, cost: 3800, duration: 24, prerequisites: ['soft_power_cultural'], icon: Lock, description: 'Pengamanan data diplomatik.', effects: [{ stat: 'enkripsi', value: 2, label: '-2% Risiko Bocor' }] },
{ id: 'bantuan_kemanusiaan', name: 'Misi Perdamaian Dunia', category: 'diplomasi', tier: 2, cost: 3600, duration: 23, prerequisites: ['kedutaan_besar'], icon: HeartPulse, description: 'Pengiriman pasukan perdamaian.', effects: [{ stat: 'reputasi', value: 2, label: '+2% Reputasi Dunia' }] },
{ id: 'kontra_spionase', name: 'Penangkal Agensi Asing', category: 'diplomasi', tier: 2, cost: 3700, duration: 23, prerequisites: ['intelijen_taktis'], icon: Shield, description: 'Penangkapan agen rahasia.', effects: [{ stat: 'kontra', value: 2, label: '-2% Spionase Asing' }] },
{ id: 'bebas_visa', name: 'Kesepakatan Bebas Visa', category: 'diplomasi', tier: 2, cost: 3400, duration: 20, prerequisites: ['perjanjian_dagang'], icon: Globe2, description: 'Kemudahan perjalanan paspor.', effects: [{ stat: 'paspor', value: 2, label: '+2% Kekuatan Paspor' }] },

// TIER 3
{ id: 'jaringan_intelijen', name: 'Jaringan Agen Global', category: 'diplomasi', tier: 3, cost: 6500, duration: 35, prerequisites: ['diplomasi_multilateral'], icon: Shield, description: 'Operasi rahasia luar negeri.', effects: [{ stat: 'agen', value: 2, label: '+2% Akurasi Spionase' }] },
{ id: 'kontra_intelijen', name: 'Sistem Kripto Militer', category: 'diplomasi', tier: 3, cost: 6800, duration: 36, prerequisites: ['kriptografi'], icon: Lock, description: 'Enkripsi saluran militer.', effects: [{ stat: 'kripto_militer', value: 2, label: '-2% Sabotase Data' }] },
{ id: 'lobi_geopolitik', name: 'Konsultan Lobi Geopolitik', category: 'diplomasi', tier: 3, cost: 6200, duration: 33, prerequisites: ['bantuan_kemanusiaan'], icon: Globe2, description: 'Pengaruh keputusan Dewan PBB.', effects: [{ stat: 'lobi', value: 2, label: '+2% Veto Resolusi' }] },
{ id: 'analitik_data_diplomatik', name: 'AI Analisis Geopolitik', category: 'diplomasi', tier: 3, cost: 6400, duration: 34, prerequisites: ['kontra_spionase'], icon: Cpu, description: 'Prediksi konflik antar negara.', effects: [{ stat: 'prediksi_konflik', value: 2, label: '+2% Akurasi Konflik' }] },
{ id: 'ekstradisi_internasional', name: 'Perjanjian Ekstradisi Lawan', category: 'diplomasi', tier: 3, cost: 6000, duration: 32, prerequisites: ['bebas_visa'], icon: Shield, description: 'Penangkapan buron negara.', effects: [{ stat: 'hukum', value: 2, label: '+2% Penegakan Hukum' }] },

// TIER 4
{ id: 'analitik_geopolitik', name: 'Pusat Analisis Konflik Dunia', category: 'diplomasi', tier: 4, cost: 11000, duration: 48, prerequisites: ['jaringan_intelijen'], icon: Globe2, description: 'Prediksi krisis internasional.', effects: [{ stat: 'krisis', value: 2, label: '+2% Kesiapan Krisis' }] },
{ id: 'cyber_defense', name: 'Pertahanan Siber Pertahanan', category: 'diplomasi', tier: 4, cost: 11500, duration: 50, prerequisites: ['kontra_intelijen'], icon: Cpu, description: 'Benteng siber nasional.', effects: [{ stat: 'cyber_defense', value: 2, label: '+2% Pertahanan Siber' }] },
{ id: 'aliansi_militer_global', name: 'Pakta Pertahanan Bersama', category: 'diplomasi', tier: 4, cost: 12000, duration: 52, prerequisites: ['lobi_geopolitik'], icon: Shield, description: 'Jaminan bantuan militer.', effects: [{ stat: 'pakta', value: 2, label: '+2% Bantuan Perang' }] },
{ id: 'sanksi_ekonomi', name: 'Perangkat Sanksi Ekonomi', category: 'diplomasi', tier: 4, cost: 10800, duration: 47, prerequisites: ['analitik_data_diplomatik'], icon: Banknote, description: 'Pembekuan aset musuh.', effects: [{ stat: 'sanksi', value: 2, label: '+2% Efek Sanksi Musuh' }] },
{ id: 'suara_dewan_keamanan', name: 'Kursi Anggota Dewan PBB', category: 'diplomasi', tier: 4, cost: 12500, duration: 54, prerequisites: ['ekstradisi_internasional'], icon: Globe2, description: 'Hak suara penentu PBB.', effects: [{ stat: 'veto', value: 2, label: '+2% Pengaruh PBB' }] },

// TIER 5
{ id: 'hegemoni_diplomasi', name: 'Hegemoni Diplomasi Dunia', category: 'diplomasi', tier: 5, cost: 20000, duration: 80, prerequisites: ['analitik_geopolitik'], icon: Globe2, description: 'Pemimpin blok koalisi dunia.', effects: [{ stat: 'hegemoni', value: 2, label: '+2% Kepemimpinan Dunia' }] },
{ id: 'kriptografi_kuantum', name: 'Kriptografi Kuantum Mutlak', category: 'diplomasi', tier: 5, cost: 22000, duration: 85, prerequisites: ['cyber_defense'], icon: Lock, description: 'Enkripsi tak terretas selamanya.', effects: [{ stat: 'enkripsi_max', value: 2, label: '+2% Keamanan Enkripsi' }] },
{ id: 'intelijen_satelit_quantum', name: 'Pengawasan Masa Nyata Global', category: 'diplomasi', tier: 5, cost: 21000, duration: 82, prerequisites: ['aliansi_militer_global'], icon: Wifi, description: 'Monitor posisi seluruh armada.', effects: [{ stat: 'vision', value: 2, label: '+2% Penglihatan Peta' }] },
{ id: 'isolasi_total_musuh', name: 'Embargo Ekonomi Global', category: 'diplomasi', tier: 5, cost: 19000, duration: 76, prerequisites: ['sanksi_ekonomi'], icon: Banknote, description: 'Isolasi perdagangan lawan.', effects: [{ stat: 'embargo', value: 2, label: '+2% Kelumpuhan Musuh' }] },
{ id: 'tatanan_dunia_baru', name: 'Tatanan Dunia Baru (Pax)', category: 'diplomasi', tier: 5, cost: 25000, duration: 90, prerequisites: ['suara_dewan_keamanan'], icon: Sparkles, description: 'Perjanjian perdamaian abadi.', effects: [{ stat: 'pax', value: 2, label: '+2% Stabilitas Dunia' }] },

// ================= BUDAYA & IDENTITAS =================
// TIER 1
{ id: 'digitalisasi_warisan', name: 'Digitalisasi Warisan Sejarah', category: 'budaya', tier: 1, cost: 1500, duration: 12, prerequisites: [], icon: Palette, description: 'Arsip & museum virtual kebudayaan.', effects: [{ stat: 'unesco', value: 2, label: '+2% Peluang UNESCO' }] },
{ id: 'bahasa_global', name: 'Promosi Bahasa Nasional', category: 'budaya', tier: 1, cost: 1600, duration: 13, prerequisites: [], icon: Globe2, description: 'Pusat pengajaran bahasa di luar negeri.', effects: [{ stat: 'bahasa', value: 2, label: '+2% Pengaruh Bahasa' }] },
{ id: 'kuliner_nusantara', name: 'Festival Kuliner Tradisional', category: 'budaya', tier: 1, cost: 1400, duration: 11, prerequisites: [], icon: Palette, description: 'Diplomasi kuliner rempah & sajian khas.', effects: [{ stat: 'kuliner', value: 2, label: '+2% Popularitas Kuliner' }] },
{ id: 'musik_tradisional', name: 'Konser Etnik Nasional', category: 'budaya', tier: 1, cost: 1300, duration: 10, prerequisites: [], icon: Sparkles, description: 'Pertunjukan instrumen musik tradisional.', effects: [{ stat: 'musik', value: 2, label: '+2% Kebanggaan Seni' }] },
{ id: 'kain_wasutra', name: 'Galeri Wastra & Tekstil', category: 'budaya', tier: 1, cost: 1550, duration: 12, prerequisites: [], icon: Palette, description: 'Promosi tenun & tekstil tradisional.', effects: [{ stat: 'tenun', value: 2, label: '+2% Nilai Ekspor Wastra' }] },

// TIER 2
{ id: 'industri_kreatif', name: 'Studio Animasi & Game', category: 'budaya', tier: 2, cost: 2800, duration: 18, prerequisites: ['digitalisasi_warisan'], icon: Palette, description: 'Game & animasi komersial.', effects: [{ stat: 'game', value: 2, label: '+2% PDB Ekonomi Kreatif' }] },
{ id: 'festival_internasional', name: 'Festival Film & Musik Dunia', category: 'budaya', tier: 2, cost: 2600, duration: 17, prerequisites: ['bahasa_global'], icon: Palette, description: 'Pentas seni internasional.', effects: [{ stat: 'pariwisata', value: 2, label: '+2% Turis Asing' }] },
{ id: 'restorasi_cagar', name: 'Restorasi Situs Sejarah', category: 'budaya', tier: 2, cost: 2700, duration: 17, prerequisites: ['kuliner_nusantara'], icon: Sparkles, description: 'Pemugaran cagar budaya.', effects: [{ stat: 'cagar', value: 2, label: '+2% Daya Tarik Wisata' }] },
{ id: 'sanggar_seni_daerah', name: 'Sanggar Seni Pemuda', category: 'budaya', tier: 2, cost: 2400, duration: 15, prerequisites: ['musik_tradisional'], icon: BookOpen, description: 'Pendidikan tari & seni rakyat.', effects: [{ stat: 'sanggar', value: 2, label: '+2% Pemuda Berbudaya' }] },
{ id: 'literasi_sejarah', name: 'Penerbitan Buku Sejarah', category: 'budaya', tier: 2, cost: 2500, duration: 16, prerequisites: ['kain_wasutra'], icon: BookOpen, description: 'Arsip literatur kebudayaan bangsa.', effects: [{ stat: 'buku', value: 2, label: '+2% Literasi Bangsa' }] },

// TIER 3
{ id: 'pariwisata_virtual', name: 'Pariwisata VR & AR', category: 'budaya', tier: 3, cost: 5000, duration: 28, prerequisites: ['industri_kreatif'], icon: Globe2, description: 'Tur situs sejarah berbasis Metaverse.', effects: [{ stat: 'devisa_vr', value: 2, label: '+2% Devisa Pariwisata' }] },
{ id: 'sinema_nasional', name: 'Bioskop & Film Layar Lebar', category: 'budaya', tier: 3, cost: 5200, duration: 30, prerequisites: ['festival_internasional'], icon: Palette, description: 'Film nasional pemenang penghargaan.', effects: [{ stat: 'soft_power_film', value: 2, label: '+2% Soft Power Film' }] },
{ id: 'taman_budaya_nasional', name: 'Kompleks Taman Budaya', category: 'budaya', tier: 3, cost: 4800, duration: 27, prerequisites: ['restorasi_cagar'], icon: Sparkles, description: 'Pusat teater & pameran nasional.', effects: [{ stat: 'teater', value: 2, label: '+2% Kunjungan Budaya' }] },
{ id: 'arsip_digital_nasional', name: 'Arsip Manuskrip Kuno', category: 'budaya', tier: 3, cost: 4900, duration: 28, prerequisites: ['sanggar_seni_daerah'], icon: BookOpen, description: 'Digitalisasi naskah sejarah kuno.', effects: [{ stat: 'naskah', value: 2, label: '+2% Pengetahuan Kuno' }] },
{ id: 'desain_arsitektur', name: 'Arsitektur Khas Modern', category: 'budaya', tier: 3, cost: 5100, duration: 29, prerequisites: ['literasi_sejarah'], icon: Sparkles, description: 'Gedung bernuansa estetika etnik.', effects: [{ stat: 'ikon', value: 2, label: '+2% Estetika Kota' }] },

// TIER 4
{ id: 'diplomasi_budaya', name: 'Pusat Kebudayaan Dunia', category: 'budaya', tier: 4, cost: 9000, duration: 42, prerequisites: ['pariwisata_virtual'], icon: Globe2, description: 'Gedung kebudayaan di 50 negara.', effects: [{ stat: 'global_culture', value: 2, label: '+2% Pengaruh Budaya' }] },
{ id: 'ekspor_konten_kreatif', name: 'Lisensi Hak Cipta Ekspor', category: 'budaya', tier: 4, cost: 9500, duration: 44, prerequisites: ['sinema_nasional'], icon: Banknote, description: 'Ekspor komik, game, & musik.', effects: [{ stat: 'royalti', value: 2, label: '+2% Royalti Konten' }] },
{ id: 'destinasi_super_prioritas', name: 'Kawasan Wisata Bahari', category: 'budaya', tier: 4, cost: 9200, duration: 43, prerequisites: ['taman_budaya_nasional'], icon: Globe2, description: 'Resort eco-tourism maritim.', effects: [{ stat: 'turis_max', value: 2, label: '+2% Devisa Wisatawan' }] },
{ id: 'olahraga_tradisional', name: 'Kompetisi Bela Diri Dunia', category: 'budaya', tier: 4, cost: 8800, duration: 40, prerequisites: ['arsip_digital_nasional'], icon: Shield, description: 'Kejuaraan olahraga bela diri.', effects: [{ stat: 'silat', value: 2, label: '+2% Prestasi Olahraga' }] },
{ id: 'pusat_fashion_etnik', name: 'Pekan Mode Etnik Dunia', category: 'budaya', tier: 4, cost: 9100, duration: 42, prerequisites: ['desain_arsitektur'], icon: Palette, description: 'Fashion show etnik internasional.', effects: [{ stat: 'fashion', value: 2, label: '+2% Pasar Mode Etnik' }] },

// TIER 5
{ id: 'hegemoni_kultural', name: 'Gelombang Budaya Global', category: 'budaya', tier: 5, cost: 16000, duration: 70, prerequisites: ['diplomasi_budaya'], icon: Sparkles, description: 'Tren gaya hidup & lagu dunia.', effects: [{ stat: 'wave', value: 2, label: '+2% Trendsetter Dunia' }] },
{ id: 'metaverse_nusantara', name: 'Metaverse Kebudayaan Global', category: 'budaya', tier: 5, cost: 18000, duration: 75, prerequisites: ['ekspor_konten_kreatif'], icon: Cpu, description: 'Dunia virtual kebudayaan penuh.', effects: [{ stat: 'metaverse', value: 2, label: '+2% Pendapatan Virtual' }] },
{ id: 'keajaiban_dunia_baru', name: 'Monumen Kebudayaan Megalitikum', category: 'budaya', tier: 5, cost: 20000, duration: 85, prerequisites: ['destinasi_super_prioritas'], icon: Sparkles, description: 'Monumen keajaiban dunia baru.', effects: [{ stat: 'wonder', value: 2, label: '+2% Kehormatan Bangsa' }] },
{ id: 'filsafat_kebijaksanaan', name: 'Akademi Filsafat & Kebijaksanaan', category: 'budaya', tier: 5, cost: 15000, duration: 65, prerequisites: ['olahraga_tradisional'], icon: BookOpen, description: 'Filsafat kedamaian bagi dunia.', effects: [{ stat: 'filsafat', value: 2, label: '+2% Etika & Karakter' }] },
{ id: 'identitas_abadi', name: 'Warisan Kebudayaan Abadi', category: 'budaya', tier: 5, cost: 22000, duration: 90, prerequisites: ['pusat_fashion_etnik'], icon: Palette, description: 'Pengakuan mutlak sejarah peradaban.', effects: [{ stat: 'peradaban', value: 2, label: '+2% Legasi Peradaban' }] },
];

const CATEGORIES: { key: CategoryKey; label: string; icon: React.ElementType }[] = [
  { key: 'ekonomi', label: 'Ekonomi & Industri', icon: Banknote },
  { key: 'militer', label: 'Militer & Pertahanan', icon: Shield },
  { key: 'sosial', label: 'Sosial & Kesejahteraan', icon: HeartPulse },
  { key: 'lingkungan', label: 'Lingkungan & Energi', icon: Leaf },
  { key: 'diplomasi', label: 'Diplomasi & Intelijen', icon: Globe2 },
  { key: 'budaya', label: 'Budaya & Identitas', icon: Palette },
];

export type SelectionCategoryKey = 'ekonomi' | 'militer' | 'diplomasi';

const FOCUS_CATEGORIES_MAP: Record<SelectionCategoryKey, CategoryKey[]> = {
  ekonomi: ['ekonomi', 'lingkungan'],
  militer: ['militer'],
  diplomasi: ['diplomasi', 'sosial', 'budaya'],
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
    const endDateStr = addDays(safeDate, getEffectiveResearchDuration(research.duration, research.category));

    setCountryDetail({
      ...countryDetail,
      anggaran: money - research.cost,
      active_research: research.id,
      active_research_start_date: safeDate,
      active_research_progress: 0,
      active_research_end_date: endDateStr,
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

    setCountryDetail({
      ...countryDetail,
      anggaran: money - cost,
      active_research: `upgrade:${research.id}:${targetLevel}`,
      active_research_start_date: safeDate,
      active_research_progress: 0,
      active_research_end_date: endDateStr,
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
    const amplified = levelValue ?? (level > 0 ? baseValue * (1 + bonus / 100) : baseValue);
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
