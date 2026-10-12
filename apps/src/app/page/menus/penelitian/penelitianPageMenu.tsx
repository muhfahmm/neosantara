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
import { getSainsPenelitianResearchSpeedBonusPercent } from '@/app/page/bonus_logic/kementerian_bonus_logic/3_Sains_Penelitian';
import {
  getResearchCardBonus,
  getResearchCardLevel,
  normalizeResearchLevels,
  RESEARCH_CARD_LEVEL_BONUS,
} from '@/app/page/bonus_logic/researchCardLevelBonus';
import {
  getMilitaryResearchBaseBonus,
  getMilitaryResearchLevelBonus,
} from '@/app/page/bonus_logic/militaryResearchBonus';
import { generateResearchStartNotification } from '../inbox/logic/11_notifikasi_penelitian/researchChangeLogic';

export type CategoryKey = 'ekonomi' | 'militer' | 'diplomasi';

interface ResearchEffect {
  stat: string;
  value: number;
  label: string;
}

interface Research {
  id: string;
  name: string;
  category: CategoryKey;
  tier: number;
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
  if (!countryDetail) {
    return { updatedDetail: countryDetail, hasChanged: false };
  }

  const parseDateString = (dateStr: string | Date | null | undefined): Date => {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
    const str = String(dateStr).trim();
    if (str.includes('-')) {
      const parts = str.split('T')[0].split('-').map(Number);
      if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? new Date() : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const today = parseDateString(currentDateInput || countryDetail.game_date);
  let updatedDetail = { ...countryDetail };
  let hasChanged = false;

  let completedResearch: string[] = Array.isArray(updatedDetail.completed_research)
    ? [...updatedDetail.completed_research]
    : [];
  let researchLevels = { ...normalizeResearchLevels(updatedDetail.research_levels) };

  const religion = updatedDetail.religion ?? updatedDetail.agama_utama ?? updatedDetail.agama;
  const researchContracts = Array.isArray(updatedDetail.researchContracts) ? updatedDetail.researchContracts : [];
  const educationPoints = calculateEducationPoints(updatedDetail);

  const getEffectiveDuration = (durationDays: number, catKey?: string) => {
    return applyCombinedResearchDuration(durationDays, educationPoints, religion, researchContracts, countryDetail?.country, catKey, countryDetail);
  };

  // Migrasi / Normalisasi data antrean per kategori
  let activeCategoryMap: Record<string, { id: string; startDate: string; endDate: string; progress: number } | null> = {
    ekonomi: updatedDetail.active_research_by_category?.ekonomi || null,
    militer: updatedDetail.active_research_by_category?.militer || null,
    diplomasi: updatedDetail.active_research_by_category?.diplomasi || null,
  };

  // Kompatibilitas mundur (Legacy active_research single slot)
  if (updatedDetail.active_research && !updatedDetail.active_research_by_category) {
    const legacyIdStr = String(updatedDetail.active_research);
    let realResId = legacyIdStr.startsWith('upgrade:') ? legacyIdStr.split(':')[1] : legacyIdStr;
    const matchRes = RESEARCH_DATA.find((r) => r.id === realResId);
    if (matchRes) {
      activeCategoryMap[matchRes.category] = {
        id: legacyIdStr,
        startDate: updatedDetail.active_research_start_date || countryDetail.game_date,
        endDate: updatedDetail.active_research_end_date || countryDetail.game_date,
        progress: updatedDetail.active_research_progress || 0,
      };
    }
  }

  const categories: CategoryKey[] = ['ekonomi', 'militer', 'diplomasi'];

  categories.forEach((cat) => {
    const slotData = activeCategoryMap[cat];
    if (!slotData || !slotData.id || !slotData.endDate) return;

    const activeResearchIdStr = String(slotData.id);
    let researchId = activeResearchIdStr;
    let targetLevel = 1;

    if (activeResearchIdStr.startsWith('upgrade:')) {
      const parts = activeResearchIdStr.split(':');
      researchId = parts[1];
      targetLevel = Number(parts[2]) || 2;
    }

    const research = RESEARCH_DATA.find((r) => r.id === researchId);
    if (!research) return;

    const endDateObj = parseDateString(slotData.endDate);

    if (today.getTime() >= endDateObj.getTime()) {
      if (!completedResearch.includes(researchId)) {
        completedResearch.push(researchId);
      }
      researchLevels[researchId] = targetLevel;
      activeCategoryMap[cat] = null;
      hasChanged = true;
    } else {
      let curStartObj: Date;
      if (slotData.startDate) {
        curStartObj = parseDateString(slotData.startDate);
      } else {
        const isUpgrade = activeResearchIdStr.startsWith('upgrade:');
        const targetLvl = isUpgrade ? Number(activeResearchIdStr.split(':')[2]) || 1 : 1;
        const dur = getEffectiveDuration(isUpgrade ? getCardUpgradeDuration(research, targetLvl) : research.duration, cat);
        curStartObj = new Date(endDateObj);
        curStartObj.setDate(curStartObj.getDate() - dur);
      }

      const totalTime = Math.max(1, endDateObj.getTime() - curStartObj.getTime());
      const elapsedTime = today.getTime() - curStartObj.getTime();
      const calculatedProgress = Math.min(99, Math.max(0, Math.floor((elapsedTime / totalTime) * 100)));

      if (slotData.progress !== calculatedProgress) {
        activeCategoryMap[cat] = {
          ...slotData,
          progress: calculatedProgress,
        };
        hasChanged = true;
      }
    }
  });

  if (hasChanged) {
    updatedDetail = {
      ...updatedDetail,
      completed_research: completedResearch,
      research_levels: researchLevels,
      active_research_by_category: activeCategoryMap,
      // Sinkronkan active_research legacy agar tetap kompatibel
      active_research: activeCategoryMap.ekonomi?.id || activeCategoryMap.militer?.id || activeCategoryMap.diplomasi?.id || null,
      active_research_start_date: activeCategoryMap.ekonomi?.startDate || activeCategoryMap.militer?.startDate || activeCategoryMap.diplomasi?.startDate || null,
      active_research_end_date: activeCategoryMap.ekonomi?.endDate || activeCategoryMap.militer?.endDate || activeCategoryMap.diplomasi?.endDate || null,
      active_research_progress: activeCategoryMap.ekonomi?.progress || activeCategoryMap.militer?.progress || activeCategoryMap.diplomasi?.progress || 0,
    };
  }

  return { updatedDetail, hasChanged };
}

const getCardBonus = (level: number): number => {
  return getResearchCardBonus(level);
};

const getResearchTier = (research: Research, data: Research[]): number => {
  if (research.tier) return research.tier;
  if (research.prerequisites.length === 0) return 1;
  const prereqObj = data.find((r) => research.prerequisites.includes(r.id));
  if (!prereqObj) return 1;
  return Math.min(5, getResearchTier(prereqObj, data) + 1);
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║  RESEARCH_DATA — FINAL                                          ║
// ║  Ekonomi: 12 kartu (3 kolom × 4 tier)                           ║
// ║  Militer: 16 kartu (5/5/3/3)                                    ║
// ║  Diplomasi: 25 kartu (5×5)                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
const RESEARCH_DATA: Research[] = [
  // ══════════════════════════════════════════════════════════════════
  // 1. EKONOMI & INDUSTRI
  // ══════════════════════════════════════════════════════════════════
  // KOLOM 1: MANUFAKTUR → MINERAL & ENERGI
  { id: 'otomasi_industri', name: 'Otomasi Fabrikasi Elektronik & Mesin', category: 'ekonomi', tier: 1, cost: 2000, duration: 30, prerequisites: [], icon: Cpu, description: 'Otomasi lini Pabrik Semikonduktor dan Pabrik Mesin.', effects: [{ stat: 'manufaktur', value: 2, label: '+2% Produksi Manufaktur' }] },
  { id: 'manufaktur_material', name: 'Rekayasa Material Manufaktur', category: 'ekonomi', tier: 2, cost: 3500, duration: 60, prerequisites: ['otomasi_industri'], icon: Cpu, description: 'Proses material dan komponen untuk mempercepat pembangunan pabrik manufaktur.', effects: [{ stat: 'waktu_pembangunan_manufaktur', value: -2, label: '-2% Waktu Pembangunan Manufaktur' }] },
  { id: 'manufaktur_terintegrasi', name: 'Eksplorasi Mineral & Energi', category: 'ekonomi', tier: 3, cost: 6500, duration: 90, prerequisites: ['manufaktur_material'], icon: Beaker, description: 'Teknologi eksplorasi untuk meningkatkan produksi Emas, Uranium, Batu Bara, Minyak Bumi, Gas Alam, Garam, Litium, Logam Tanah Jarang, dan Bijih Besi.', effects: [{ stat: 'mineral_energi', value: 2, label: '+2% Produksi Mineral & Energi' }] },
  { id: 'manufaktur_lanjut', name: 'Infrastruktur Mineral & Energi Terpadu', category: 'ekonomi', tier: 4, cost: 11000, duration: 120, prerequisites: ['manufaktur_terintegrasi'], icon: Beaker, description: 'Metode konstruksi cepat untuk mempercepat pembangunan tambang dan kilang mineral & energi.', effects: [{ stat: 'waktu_pembangunan_mineral_energi', value: -2, label: '-2% Waktu Pembangunan Mineral & Energi' }] },

  // KOLOM 2: PETERNAKAN → AGRIKULTUR
  { id: 'peternakan_modern', name: 'Peternakan Presisi', category: 'ekonomi', tier: 1, cost: 1800, duration: 30, prerequisites: [], icon: Beaker, description: 'Peningkatan budidaya Ayam Unggas, Sapi Perah, dan Sapi Potong.', effects: [{ stat: 'peternakan', value: 2, label: '+2% Produksi Peternakan' }] },
  { id: 'peternakan_genetika', name: 'Genetika & Pakan Ternak', category: 'ekonomi', tier: 2, cost: 3300, duration: 60, prerequisites: ['peternakan_modern'], icon: Beaker, description: 'Rekayasa pakan dan percepatan pembangunan fasilitas peternakan modern.', effects: [{ stat: 'waktu_pembangunan_peternakan', value: -2, label: '-2% Waktu Pembangunan Peternakan' }] },
  { id: 'perkebunan_komoditas', name: 'Agrikultur Cerdas Multi-Komoditas', category: 'ekonomi', tier: 3, cost: 6000, duration: 90, prerequisites: ['peternakan_genetika'], icon: Wheat, description: 'Pengelolaan Padi, Gandum, Jagung, Sayur, Umbi, Kedelai, Kelapa Sawit, Kopi, Teh, Kakao, Tebu, dan Karet.', effects: [{ stat: 'agrikultur', value: 2, label: '+2% Produksi Agrikultur' }] },
  { id: 'agrikultur_cerdas', name: 'Agrikultur Tangguh Multi-Komoditas', category: 'ekonomi', tier: 4, cost: 10000, duration: 120, prerequisites: ['perkebunan_komoditas'], icon: Wheat, description: 'Teknologi budidaya tangguh untuk mempercepat pembangunan lahan agrikultur.', effects: [{ stat: 'waktu_pembangunan_agrikultur', value: -2, label: '-2% Waktu Pembangunan Agrikultur' }] },

  // KOLOM 3: PERIKANAN → OLAHAN PANGAN
  { id: 'perikanan_modern', name: 'Budidaya Perikanan Terpadu', category: 'ekonomi', tier: 1, cost: 1400, duration: 30, prerequisites: [], icon: Leaf, description: 'Peningkatan produksi Ikan, Udang, dan Mutiara melalui budidaya serta armada tangkap.', effects: [{ stat: 'perikanan', value: 2, label: '+2% Produksi Perikanan' }] },
  { id: 'perikanan_pascapanen', name: 'Teknologi Perikanan & Pascapanen', category: 'ekonomi', tier: 2, cost: 3100, duration: 60, prerequisites: ['perikanan_modern'], icon: Leaf, description: 'Penanganan hasil tangkap untuk mempercepat pembangunan fasilitas perikanan.', effects: [{ stat: 'waktu_pembangunan_perikanan', value: -2, label: '-2% Waktu Pembangunan Perikanan' }] },
  { id: 'pengolahan_pangan', name: 'Pengolahan Pangan Dasar', category: 'ekonomi', tier: 3, cost: 6300, duration: 90, prerequisites: ['perikanan_pascapanen'], icon: Wheat, description: 'Teknologi produksi Air Mineral, Gula, Roti, Pengolahan Daging, Mi Instan, Minyak Goreng, Susu, dan Beras.', effects: [{ stat: 'olahan_pangan', value: 2, label: '+2% Produksi Olahan Pangan' }] },
  { id: 'industri_pangan_terpadu', name: 'Industri Pangan Terintegrasi', category: 'ekonomi', tier: 4, cost: 10800, duration: 120, prerequisites: ['pengolahan_pangan'], icon: Wheat, description: 'Integrasi produksi untuk mempercepat pembangunan pabrik olahan pangan.', effects: [{ stat: 'waktu_pembangunan_olahan_pangan', value: -2, label: '-2% Waktu Pembangunan Olahan Pangan' }] },

  // ══════════════════════════════════════════════════════════════════
  // 2. MILITER & PERTAHANAN (16 kartu — 5/5/3/3)
  // ══════════════════════════════════════════════════════════════════
  // TIER 1 — WAKTU PEMBANGUNAN (5 kartu)
  { id: 'benteng_perbatasan', name: 'Pos Pertahanan Perbatasan', category: 'militer', tier: 1, cost: 2100, duration: 30, prerequisites: [], icon: Shield, description: 'Doktrin konstruksi cepat untuk pembangunan Barak Militer tempat pelatihan pasukan infanteri.', effects: [{ stat: 'waktu_pembangunan_barak_militer', value: -2, label: '-2% Waktu Pembangunan Barak Militer' }] },
  { id: 'senjata_infanteri', name: 'Senapan Serbu Presisi', category: 'militer', tier: 1, cost: 2000, duration: 30, prerequisites: [], icon: Crosshair, description: 'Standarisasi produksi senjata untuk mempercepat pembangunan Gudang Senjata militer.', effects: [{ stat: 'waktu_pembangunan_gudang_senjata', value: -2, label: '-2% Waktu Pembangunan Gudang Senjata' }] },
  { id: 'tank_generasi_baru', name: 'Tank Tempur Komposit', category: 'militer', tier: 1, cost: 2500, duration: 30, prerequisites: [], icon: Shield, description: 'Armor komposit ringan untuk mempercepat konstruksi Hangar Tank kendaraan lapis baja.', effects: [{ stat: 'waktu_pembangunan_hangar_tank', value: -2, label: '-2% Waktu Pembangunan Hangar Tank' }] },
  { id: 'drone_otonom', name: 'Drone Pengintai Taktis', category: 'militer', tier: 1, cost: 2200, duration: 30, prerequisites: [], icon: Wifi, description: 'Sistem kendali drone untuk mempercepat pembangunan Pangkalan Udara & landasan armada udara.', effects: [{ stat: 'waktu_pembangunan_pangkalan_udara', value: -2, label: '-2% Waktu Pembangunan Pangkalan Udara' }] },
  { id: 'radar_pesisir', name: 'Radar Pesisir Pantai', category: 'militer', tier: 1, cost: 2300, duration: 30, prerequisites: [], icon: Wifi, description: 'Deteksi maritim untuk mempercepat pembangunan Pangkalan Laut & dermaga kapal perang.', effects: [{ stat: 'waktu_pembangunan_pangkalan_laut', value: -2, label: '-2% Waktu Pembangunan Pangkalan Laut' }] },

  // TIER 2 — KAPASITAS (5 kartu)
  { id: 'kapal_stealth', name: 'Kapal Korvet Siluman', category: 'militer', tier: 2, cost: 4000, duration: 60, prerequisites: ['benteng_perbatasan'], icon: Shield, description: 'Teknologi siluman untuk memperluas kapasitas Barak Militer.', effects: [{ stat: 'kapasitas_barak_militer', value: 2, label: '+2% Kapasitas Barak Militer' }] },
  { id: 'perang_siber', name: 'Komando Siber Ofensif', category: 'militer', tier: 2, cost: 3800, duration: 60, prerequisites: ['senjata_infanteri'], icon: Cpu, description: 'Jaringan komando siber untuk memperluas kapasitas Gudang Senjata.', effects: [{ stat: 'kapasitas_gudang_senjata', value: 2, label: '+2% Kapasitas Gudang Senjata' }] },
  { id: 'artileri_presisi', name: 'Artileri Roket Otonom', category: 'militer', tier: 2, cost: 4200, duration: 60, prerequisites: ['tank_generasi_baru'], icon: Crosshair, description: 'Sistem bidik otonom untuk memperluas kapasitas Hangar Tank.', effects: [{ stat: 'kapasitas_hangar_tank', value: 2, label: '+2% Kapasitas Hangar Tank' }] },
  { id: 'kapal_selam_diesel', name: 'Kapal Selam Modern', category: 'militer', tier: 2, cost: 4500, duration: 60, prerequisites: ['drone_otonom'], icon: Shield, description: 'Teknologi patroli laut untuk memperluas kapasitas Pangkalan Udara.', effects: [{ stat: 'kapasitas_pangkalan_udara', value: 2, label: '+2% Kapasitas Pangkalan Udara' }] },
  { id: 'helikopter_serang', name: 'Helikopter Tempur', category: 'militer', tier: 2, cost: 4100, duration: 60, prerequisites: ['radar_pesisir'], icon: Rocket, description: 'Dukungan udara jarak dekat untuk memperluas kapasitas Pangkalan Laut.', effects: [{ stat: 'kapasitas_pangkalan_laut', value: 2, label: '+2% Kapasitas Pangkalan Laut' }] },

  // TIER 3 — KEKUATAN (3 kartu)
  { id: 'tank_generasi5', name: 'Tank Tempur Generasi 5', category: 'militer', tier: 3, cost: 7000, duration: 90, prerequisites: ['kapal_stealth'], icon: Shield, description: 'Teknologi tank terbaru meningkatkan kekuatan tempur pasukan darat.', effects: [{ stat: 'kekuatan_darat', value: 2, label: '+2% Kekuatan Darat' }] },
  { id: 'jet_superioritas', name: 'Jet Tempur Superioritas', category: 'militer', tier: 3, cost: 7200, duration: 90, prerequisites: ['artileri_presisi'], icon: Rocket, description: 'Jet tempur generasi terbaru meningkatkan kekuatan tempur udara.', effects: [{ stat: 'kekuatan_udara', value: 2, label: '+2% Kekuatan Udara' }] },
  { id: 'kapal_perang_multiperan', name: 'Kapal Perang Multi-Peran', category: 'militer', tier: 3, cost: 6500, duration: 90, prerequisites: ['helikopter_serang'], icon: Shield, description: 'Kapal perang serbaguna meningkatkan kekuatan tempur laut.', effects: [{ stat: 'kekuatan_laut', value: 2, label: '+2% Kekuatan Laut' }] },

  // TIER 4 — HP / DURABILITAS (3 kartu)
  { id: 'armor_reaktif', name: 'Armor Reaktif Tank', category: 'militer', tier: 4, cost: 11000, duration: 120, prerequisites: ['tank_generasi5'], icon: Shield, description: 'Lapisan armor reaktif meningkatkan daya tahan pasukan darat.', effects: [{ stat: 'hp_darat', value: 2, label: '+2% HP Darat' }] },
  { id: 'struktur_jet', name: 'Struktur Jet Diperkuat', category: 'militer', tier: 4, cost: 13000, duration: 120, prerequisites: ['jet_superioritas'], icon: Rocket, description: 'Rangka pesawat diperkuat meningkatkan daya tahan armada udara.', effects: [{ stat: 'hp_udara', value: 2, label: '+2% HP Udara' }] },
  { id: 'hull_kapal_diperkuat', name: 'Hull Kapal Diperkuat', category: 'militer', tier: 4, cost: 10000, duration: 120, prerequisites: ['kapal_perang_multiperan'], icon: Shield, description: 'Lambung kapal diperkuat meningkatkan daya tahan armada laut.', effects: [{ stat: 'hp_laut', value: 2, label: '+2% HP Laut' }] },

  // ══════════════════════════════════════════════════════════════════
  // 3. DIPLOMASI & INTELIJEN (25 kartu — 5×5)
  // ══════════════════════════════════════════════════════════════════
  // TIER 1
  { id: 'manfaat_kedutaan', name: 'Manfaat Kedutaan', category: 'diplomasi', tier: 1, cost: 1800, duration: 30, prerequisites: [], icon: Globe2, description: 'Metode konstruksi cepat untuk kedutaan besar di seluruh dunia.', effects: [{ stat: 'waktu_kedutaan', value: -2, label: '-2% Waktu Pembangunan Kedutaan' }] },
  { id: 'suara_pbb', name: 'Suara di PBB', category: 'diplomasi', tier: 1, cost: 2000, duration: 30, prerequisites: [], icon: Sparkles, description: 'Meningkatkan jumlah suara negara di forum PBB.', effects: [{ stat: 'suara_pbb', value: 2, label: '+2 Suara PBB' }] },
  { id: 'biaya_kedutaan', name: 'Efisiensi Biaya Kedutaan', category: 'diplomasi', tier: 1, cost: 1900, duration: 30, prerequisites: [], icon: Banknote, description: 'Mengurangi biaya pembangunan kedutaan dari 10 NEO sesuai level penelitian (2–15%).', effects: [{ stat: 'biaya_kedutaan', value: -2, label: '-2% Biaya Kedutaan Besar' }] },
  { id: 'kontra_separatisme', name: 'Pencegahan Separatisme', category: 'diplomasi', tier: 1, cost: 1700, duration: 30, prerequisites: [], icon: Shield, description: 'Mengurangi risiko separatisme sebesar 2–15 poin persentase sesuai level penelitian.', effects: [{ stat: 'separatisme', value: -2, label: '-2% Separatisme' }] },
  { id: 'perjanjian_dagang', name: 'Pakta Perdagangan Bipartit', category: 'diplomasi', tier: 1, cost: 1600, duration: 30, prerequisites: [], icon: Globe2, description: 'Tim negosiator handal untuk mempercepat perjanjian dagang.', effects: [{ stat: 'peluang_dagang', value: 2, label: '+2% Peluang Perjanjian Dagang' }] },

  // TIER 2
  { id: 'pandemi_kontrol', name: 'Kontrol Pandemi Global', category: 'diplomasi', tier: 2, cost: 3500, duration: 60, prerequisites: ['manfaat_kedutaan'], icon: HeartPulse, description: 'Kerja sama internasional mengurangi estimasi korban jiwa epidemi dan pandemi sebesar 2% hingga 15% sesuai level riset.', effects: [{ stat: 'kematian_pandemi', value: -2, label: '-2% Kematian Pandemi/Epidemi' }] },
  { id: 'efek_acara', name: 'Diplomasi Acara Nasional', category: 'diplomasi', tier: 2, cost: 3800, duration: 60, prerequisites: ['suara_pbb'], icon: Sparkles, description: 'Penyelenggaraan acara internasional yang berdampak luas.', effects: [{ stat: 'efek_acara', value: 2, label: '+2% Efek Acara' }] },
  { id: 'penyebaran_ideologi', name: 'Penyebaran Ideologi', category: 'diplomasi', tier: 2, cost: 3600, duration: 60, prerequisites: ['kontra_separatisme'], icon: Palette, description: 'Meningkatkan peluang dasar keberhasilan penanaman ideologi sebesar 2–15% sesuai level penelitian.', effects: [{ stat: 'ideologi', value: 2, label: '+2% Keberhasilan Ideologi' }] },
  { id: 'misionaris', name: 'Misi Keagamaan Internasional', category: 'diplomasi', tier: 2, cost: 3700, duration: 60, prerequisites: ['biaya_kedutaan'], icon: HeartPulse, description: 'Meningkatkan peluang dasar keberhasilan misionaris 75% sebesar 2–15 poin persentase sesuai level penelitian.', effects: [{ stat: 'misionaris', value: 2, label: '+2% Keberhasilan Misionaris' }] },
  { id: 'pakta_non_agresi', name: 'Pakta Non-Agresi', category: 'diplomasi', tier: 2, cost: 3400, duration: 60, prerequisites: ['perjanjian_dagang'], icon: Shield, description: 'Doktrin diplomasi untuk mempercepat pakta non-agresi.', effects: [{ stat: 'peluang_nap', value: 2, label: '+2% Peluang Pakta Non-Agresi' }] },

  // TIER 3
  { id: 'aliansi_pertahanan', name: 'Aliansi Pertahanan', category: 'diplomasi', tier: 3, cost: 6500, duration: 90, prerequisites: ['pakta_non_agresi'], icon: Shield, description: 'Meningkatkan peluang menerima tawaran aliansi pertahanan dari 25% hingga 40% per bulan, sesuai level riset.', effects: [{ stat: 'peluang_aliansi', value: 2, label: '+2% Peluang Aliansi Pertahanan' }] },
  { id: 'mitigasi_bencana', name: 'Mitigasi Bencana Alam', category: 'diplomasi', tier: 3, cost: 6800, duration: 90, prerequisites: ['pandemi_kontrol'], icon: Leaf, description: 'Sistem peringatan & bantuan bencana lintas negara.', effects: [{ stat: 'kematian_bencana', value: -2, label: '-2% Kematian Bencana Alam' }] },
  { id: 'pertahanan_diri', name: 'Doktrin Pertahanan Diri', category: 'diplomasi', tier: 3, cost: 6200, duration: 90, prerequisites: ['efek_acara'], icon: Shield, description: 'Mengurangi peluang serangan yang dihitung dari hubungan bilateral sebesar 2–15% sesuai level penelitian.', effects: [{ stat: 'peluang_diserang', value: -2, label: '-2% Peluang Diserang Negara Lain' }] },
  { id: 'perlindungan_perang', name: 'Perlindungan Sipil Perang', category: 'diplomasi', tier: 3, cost: 6400, duration: 90, prerequisites: ['penyebaran_ideologi'], icon: HeartPulse, description: 'Protokol perlindungan sipil saat konflik bersenjata.', effects: [{ stat: 'kematian_perang', value: -2, label: '-2% Kematian Populasi Perang' }] },
  { id: 'bonus_organisasi_pbb', name: 'Peluang Kontrak Penelitian', category: 'diplomasi', tier: 3, cost: 6000, duration: 90, prerequisites: ['misionaris'], icon: Globe2, description: 'Meningkatkan peluang keberhasilan penawaran dan penerimaan Kontrak Penelitian sebesar 2–15% sesuai level penelitian.', effects: [{ stat: 'peluang_kontrak', value: 2, label: '+2% Peluang Kontrak Penelitian' }] },

  // TIER 4
  { id: 'bonus_organisasi_regional', name: 'Kerja Sama Organisasi Internasional', category: 'diplomasi', tier: 4, cost: 11000, duration: 120, prerequisites: ['aliansi_pertahanan'], icon: Globe2, description: 'Memperkuat manfaat organisasi PBB dan regional yang diikuti sebesar 2% hingga 15% sesuai level riset.', effects: [{ stat: 'bonus_organisasi_regional', value: 2, label: '+2% Manfaat Organisasi Internasional' }] },
  { id: 'kursi_tetap_dewan_pbb', name: 'Kursi Tetap Dewan Keamanan PBB', category: 'diplomasi', tier: 4, cost: 25000, duration: 120, prerequisites: ['bonus_organisasi_pbb'], icon: Sparkles, description: 'Klaim permanen kursi Dewan Keamanan PBB.', effects: [{ stat: 'kursi_dewan_keamanan', value: 1, label: 'Ambil Kursi Tetap Dewan Keamanan PBB' }] },
  { id: 'bonus_tempat_wisata', name: 'Promosi Wisata Diplomatik', category: 'diplomasi', tier: 4, cost: 9500, duration: 120, prerequisites: ['mitigasi_bencana'], icon: Palette, description: 'Meningkatkan pendapatan destinasi wisata di PDB dan neraca keuangan sebesar 2–15% sesuai level penelitian.', effects: [{ stat: 'bonus_wisata', value: 2, label: '+2% Bonus Tempat Wisata' }] },
  { id: 'sanksi_ekonomi', name: 'Perangkat Sanksi Ekonomi', category: 'diplomasi', tier: 4, cost: 10800, duration: 120, prerequisites: ['bonus_organisasi_regional'], icon: Banknote, description: 'Pembekuan aset musuh.', effects: [{ stat: 'sanksi', value: 2, label: '+2% Efek Sanksi Musuh' }] },
  { id: 'suara_dewan_keamanan', name: 'Reformasi Birokrasi Kabinet', category: 'diplomasi', tier: 4, cost: 12500, duration: 120, prerequisites: ['pertahanan_diri'], icon: Globe2, description: 'Restrukturisasi tata kelola Dewan Kabinet Menteri untuk menekan biaya upgrade.', effects: [{ stat: 'biaya_upgrade_kabinet', value: -2, label: '-2% Biaya Upgrade Dewan Kabinet' }] },

  // TIER 5
  { id: 'hegemoni_diplomasi', name: 'Harmonisasi Fiskal Global', category: 'diplomasi', tier: 5, cost: 20000, duration: 150, prerequisites: ['bonus_organisasi_regional'], icon: Banknote, description: 'Sinkronisasi kebijakan fiskal dengan standar internasional untuk memaksimalkan penerimaan pajak di semua lini.', effects: [{ stat: 'pajak_semua_lini', value: 2, label: '+2% Penerimaan Pajak Seluruh Lini' }] },
  { id: 'kriptografi_kuantum', name: 'Diplomasi Perdagangan Strategis', category: 'diplomasi', tier: 5, cost: 22000, duration: 150, prerequisites: ['kursi_tetap_dewan_pbb'], icon: Lock, description: 'Jaringan negosiasi dagang tingkat tinggi untuk menekan harga beli dan menaikkan harga jual komoditas nasional.', effects: [{ stat: 'harga_beli', value: -2, label: '-2% Harga Beli Komoditas' }, { stat: 'harga_jual', value: 2, label: '+2% Harga Jual Komoditas' }] },
  { id: 'intelijen_satelit_quantum', name: 'Alokasi Subsidi Terpadu', category: 'diplomasi', tier: 5, cost: 21000, duration: 150, prerequisites: ['bonus_tempat_wisata'], icon: Wifi, description: 'Mengurangi biaya subsidi negara sebesar 2–15% sesuai level penelitian.', effects: [{ stat: 'biaya_subsidi', value: -2, label: '-2% Biaya Subsidi Negara' }] },
  { id: 'isolasi_total_musuh', name: 'Program Permukiman Terpadu', category: 'diplomasi', tier: 5, cost: 19000, duration: 150, prerequisites: ['sanksi_ekonomi'], icon: Globe2, description: 'Pembangunan kawasan hunian berstandar internasional untuk menampung populasi dan tenaga ahli asing.', effects: [{ stat: 'kapasitas_permukiman', value: 2, label: '+2% Kapasitas Permukiman' }] },
  { id: 'tatanan_dunia_baru', name: 'Sinergi Ekonomi Global', category: 'diplomasi', tier: 5, cost: 25000, duration: 150, prerequisites: ['suara_dewan_keamanan'], icon: Sparkles, description: 'Integrasi ekonomi lintas sektor nasional melalui jaringan diplomasi global untuk mendorong produktivitas semua lini.', effects: [{ stat: 'produksi_semua_lini', value: 2, label: '+2% Produksi Semua Lini' }] },
];

const CATEGORIES: { key: CategoryKey; label: string; icon: React.ElementType }[] = [
  { key: 'ekonomi', label: 'Ekonomi & Industri', icon: Banknote },
  { key: 'militer', label: 'Militer & Pertahanan', icon: Shield },
  { key: 'diplomasi', label: 'Diplomasi & Intelijen', icon: Globe2 },
];

export type SelectionCategoryKey = 'ekonomi' | 'militer' | 'diplomasi';

const FOCUS_CATEGORIES_MAP: Record<SelectionCategoryKey, CategoryKey[]> = {
  ekonomi: ['ekonomi'],
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
  currentDate?: Date;
}

export default function PenelitianPageModal({
  isOpen,
  onClose,
  initialCategory,
  onBackToSelection,
  countryDetail,
  setCountryDetail,
  currentDate,
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

  const activeResId = countryDetail?.active_research || '';
  const activeResEndDate = countryDetail?.active_research_end_date || '';
  const gameDateStr = countryDetail?.game_date || (currentDate ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}` : '');

  useEffect(() => {
    if (!isOpen || !activeResId || !setCountryDetail) return;
    const { updatedDetail, hasChanged } = processActiveResearch(countryDetail, currentDate);
    if (hasChanged) {
      setCountryDetail(updatedDetail);
    }
  }, [isOpen, activeResId, activeResEndDate, gameDateStr, currentDate, setCountryDetail]);

  if (!isOpen || !mounted) return null;

  const completedResearch: string[] = countryDetail?.completed_research || [];
  const activeCategoryMap = countryDetail?.active_research_by_category || {};
  const currentCategorySlot = activeCategoryMap[activeCategory] || (
    // Fallback legacy jika active_research milik kategori yang sedang aktif
    countryDetail?.active_research && RESEARCH_DATA.find(r => r.id === (String(countryDetail.active_research).startsWith('upgrade:') ? String(countryDetail.active_research).split(':')[1] : String(countryDetail.active_research)))?.category === activeCategory
      ? {
        id: countryDetail.active_research,
        startDate: countryDetail.active_research_start_date,
        endDate: countryDetail.active_research_end_date,
        progress: countryDetail.active_research_progress || 0,
      }
      : null
  );

  const activeCategoryResearchId: string | null = currentCategorySlot?.id || null;
  const activeCategoryResearchProgress: number = currentCategorySlot?.progress || 0;

  const money = Number(countryDetail?.anggaran || 0);
  const religion = countryDetail?.religion ?? countryDetail?.agama_utama ?? countryDetail?.agama;
  const hasAtheismResearchBonus = String(religion || '').trim().toLowerCase() === 'ateisme';
  const researchContracts = Array.isArray(countryDetail?.researchContracts) ? countryDetail.researchContracts : [];

  const educationPoints = calculateEducationPoints(countryDetail);
  const educationModifier = getEducationResearchModifier(educationPoints);

  const getEffectiveResearchDuration = (durationDays: number, category?: string) => {
    return applyCombinedResearchDuration(
      durationDays,
      educationPoints,
      religion,
      researchContracts,
      countryDetail?.country,
      category,
      countryDetail
    );
  };

  const isUnlocked = (id: string) => completedResearch.includes(id);
  const isActive = (id: string, cat?: CategoryKey) => {
    const targetCat = cat || RESEARCH_DATA.find((r) => r.id === id)?.category || activeCategory;
    const slot = activeCategoryMap[targetCat];
    if (slot && slot.id) {
      const realId = slot.id.startsWith('upgrade:') ? slot.id.split(':')[1] : slot.id;
      return realId === id;
    }
    // Fallback legacy
    if (countryDetail?.active_research) {
      const legacyStr = String(countryDetail.active_research);
      const realId = legacyStr.startsWith('upgrade:') ? legacyStr.split(':')[1] : legacyStr;
      return realId === id;
    }
    return false;
  };

  const getLevel = (id: string) =>
    isUnlocked(id) ? getResearchCardLevel(countryDetail?.research_levels, id) : 0;

  const isLocked = (research: Research) => {
    if (research.prerequisites.length === 0) return false;
    return !research.prerequisites.every((p) => getLevel(p) >= MAX_CARD_LEVEL);
  };

  const canAfford = (cost: number) => money >= cost;

  const getSafeDateString = (): string => {
    if (currentDate) {
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, '0');
      const d = String(currentDate.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
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
    if (isUnlocked(research.id) || isActive(research.id, research.category)) return;
    if (isLocked(research) || !canAfford(research.cost)) return;
    if (activeCategoryResearchId) return; // slot sektor aktif ini penuh

    const safeDate = getSafeDateString();
    const duration = getEffectiveResearchDuration(research.duration, research.category);
    const endDateStr = addDays(safeDate, duration);

    const notif = generateResearchStartNotification(research.name, research.category, duration, safeDate, false, 1);
    const currentPending = Array.isArray(countryDetail.pending_notifications) ? countryDetail.pending_notifications : [];

    const newCategoryMap = {
      ...activeCategoryMap,
      [research.category]: {
        id: research.id,
        startDate: safeDate,
        endDate: endDateStr,
        progress: 0,
      },
    };

    setCountryDetail({
      ...countryDetail,
      anggaran: money - research.cost,
      active_research_by_category: newCategoryMap,
      // legacy field
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
    if (activeCategoryResearchId) return; // slot sektor aktif ini penuh

    const safeDate = getSafeDateString();
    const duration = getEffectiveResearchDuration(getCardUpgradeDuration(research, targetLevel), research.category);
    const endDateStr = addDays(safeDate, duration);

    const notif = generateResearchStartNotification(research.name, research.category, duration, safeDate, true, targetLevel);
    const currentPending = Array.isArray(countryDetail.pending_notifications) ? countryDetail.pending_notifications : [];

    const upgradeIdStr = `upgrade:${research.id}:${targetLevel}`;
    const newCategoryMap = {
      ...activeCategoryMap,
      [research.category]: {
        id: upgradeIdStr,
        startDate: safeDate,
        endDate: endDateStr,
        progress: 0,
      },
    };

    setCountryDetail({
      ...countryDetail,
      anggaran: money - cost,
      active_research_by_category: newCategoryMap,
      // legacy field
      active_research: upgradeIdStr,
      active_research_start_date: safeDate,
      active_research_progress: 0,
      active_research_end_date: endDateStr,
      pending_notifications: [notif, ...currentPending],
    });
    setConfirmUpgrade(null);
  };

  const activeResearch = (() => {
    if (!activeCategoryResearchId) return null;
    const realId = activeCategoryResearchId.startsWith('upgrade:') ? activeCategoryResearchId.split(':')[1] : activeCategoryResearchId;
    return RESEARCH_DATA.find((r) => r.id === realId) || null;
  })();

  const activeUpgradeData = (() => {
    if (!activeCategoryResearchId || !activeCategoryResearchId.startsWith('upgrade:')) return null;
    const parts = activeCategoryResearchId.split(':');
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

  // 🆕 Hitung jumlah kartu maksimum per tier untuk render ghost slot
  const maxCardsPerTier = Math.max(
    ...Array.from({ length: tierCount }, (_, i) => i + 1).map(
      (t) => filteredData.filter((r) => getResearchTier(r, RESEARCH_DATA) === t).length
    ),
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
    const isFlat = !effect.label.includes('%');
    if (level <= 0) return effect.label;

    const bonus = getCardBonus(level);
    const amplified = levelValue ?? (bonus > 0 ? bonus : baseValue);

    const cleanLabel = effect.label.replace(/^[+-]?\d+(\.\d+)?%?\s*/, '');

    if (isFlat) {
      const isReduction = effect.label.trim().startsWith('-');
      return `${isReduction ? '-' : '+'}${amplified} ${cleanLabel}`;
    }

    const isReduction = effect.label.trim().startsWith('-') ||
      ['emisi', 'polusi', 'kriminalitas', 'pengangguran', 'penyakit', 'kebocoran', 'inflasi', 'subsidi'].some((s) => effect.stat.includes(s));

    const formattedPercent = Number(amplified.toFixed(1)).toString();
    if (isReduction) {
      return `-${Math.abs(Number(formattedPercent))}% ${cleanLabel}`;
    }
    return `+${formattedPercent}% ${cleanLabel}`;
  };

  return createPortal(
    <div className="fixed top-16 sm:top-20 inset-x-0 bottom-0 z-[200] bg-[#0A1A1A] flex flex-col font-sans animate-in fade-in duration-300">

      {/* HEADER */}
      <div className="px-4 sm:px-8 py-3 bg-[#0F2424] border-b border-[#00FFAA]/30 flex flex-col xl:flex-row xl:items-center justify-between shadow-lg relative z-20 shrink-0 gap-3">
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
            <div className="p-3 rounded-xl bg-[#0F2424] border border-[#00FFAA]/40 mt-4">
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
                  style={{ width: `${activeCategoryResearchProgress}%` }}
                />
              </div>
              <p className="text-[10px] font-black text-[#00FFAA] mt-1.5">
                {activeCategoryResearchProgress}% selesai
              </p>
            </div>
          )}

          {/* STATUS PENDIDIKAN */}
          <div className="mt-2 p-3 rounded-2xl bg-[#0F2424] border border-[#00FFAA]/30 space-y-2.5">
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

            <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold ${educationModifier.isPenalty
              ? 'bg-[#2A141A] border-rose-500/50 text-rose-300'
              : 'bg-[#0E2A20] border-emerald-500/50 text-emerald-300'
              }`}>
              <span className="font-bold">Pengaruh Waktu Riset:</span>
              <span className="font-black">{educationModifier.label}</span>
            </div>

            {hasAtheismResearchBonus && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0E2A20] border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                <span className="font-bold">Bonus Ateisme:</span>
                <span className="font-black">-15% Waktu Penelitian</span>
              </div>
            )}

            {isMemberOfUNESCO(countryDetail?.country || '') && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0E2A20] border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                <span className="font-bold">Keanggotaan UNESCO:</span>
                <span className="font-black">+5% Kecepatan Riset</span>
              </div>
            )}

            {isMemberOfITU(countryDetail?.country || '') && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0E2A20] border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                <span className="font-bold">Keanggotaan ITU:</span>
                <span className="font-black">+5% Kecepatan Riset</span>
              </div>
            )}

            {getSainsPenelitianResearchSpeedBonusPercent(countryDetail) > 0 && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0E2A20] border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                <span className="font-bold">Sains dan Penelitian:</span>
                <span className="font-black">-{getSainsPenelitianResearchSpeedBonusPercent(countryDetail).toFixed(1)}% Waktu Riset</span>
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

          {/* ═══════════════════════════════════════════════════════════════
              LAYOUT GRID — kartu dirapikan dengan items-start &
              ghost slot agar tinggi kolom seimbang antar tier
          ═══════════════════════════════════════════════════════════════ */}
          {/* ═══════════════════════════════════════════════════════════════
    LAYOUT GRID — Kolom stretch otomatis setinggi yang tertinggi.
    Tidak ada ghost slot, tidak ada spacer.
═══════════════════════════════════════════════════════════════ */}
          <div className="overflow-x-auto custom-scrollbar pb-6 pt-4">
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
                  <div key={tierNum} className="flex flex-col gap-7 relative z-10">

                    {/* Header Tier Badge */}
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 shrink-0">
                      <span className="text-xs font-black text-[#00FFAA] uppercase tracking-wider">
                        TIER {ROMAN_NUMERALS[tierNum - 1]}
                      </span>
                      <span className="text-[10px] font-bold text-[#6B8A8A]">
                        {tierItems.filter((r) => isUnlocked(r.id)).length}/{tierItems.length}
                      </span>
                    </div>

                    {/* Kartu dalam tier ini */}
                    {tierItems.map((research) => {
                      const unlocked = isUnlocked(research.id);
                      const active = isActive(research.id);
                      const locked = isLocked(research);
                      const level = getLevel(research.id);
                      const canUnlock = canAfford(research.cost);
                      const isMaxed = level >= MAX_CARD_LEVEL;
                      const nextLevel = level + 1;
                      const upgradeCost = !isMaxed && unlocked ? getCardUpgradeCost(research, nextLevel) : 0;
                      const canUpgrade = !isMaxed && unlocked && canAfford(upgradeCost) && !activeCategoryResearchId;
                      const Icon = research.icon;
                      const isResearching = active || (activeUpgradeData !== null && activeUpgradeData.research.id === research.id);

                      return (
                        <div key={research.id} className={`relative group ${isResearching ? 'pt-5' : ''}`}>
                          {tierNum < tierCount && (
                            <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-6 border-t-2 border-dashed border-[#00FFAA]/30 z-0 pointer-events-none" />
                          )}

                          <div
                            className={`relative rounded-xl overflow-visible border transition-all z-10 flex flex-col justify-between min-h-[195px] ${isMaxed
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
                            {/* TANGGAL SELESAI */}
                            {isResearching && (() => {
                              const durationDays = getEffectiveResearchDuration(
                                activeUpgradeData ? getCardUpgradeDuration(research, activeUpgradeData.targetLevel) : research.duration
                              );
                              const remainingDays = Math.max(1, Math.ceil(durationDays * (100 - activeCategoryResearchProgress) / 100));
                              const endDateStr = currentCategorySlot?.endDate || countryDetail?.active_research_end_date || addDays(getSafeDateString(), remainingDays);

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

                            {/* Top Portion (Header + Body Effects) */}
                            <div className="flex flex-col">
                              {/* Header Card */}
                              <div className="p-3 pb-2 flex items-center justify-between gap-2 border-b border-[#00FFAA]/10 bg-[#0F2424] rounded-t-xl min-h-[44px]">
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

                                <div className="px-1.5 py-0.5 rounded border border-[#00FFAA]/30 bg-[#0A1A1A] text-[9px] font-black text-[#00FFAA] shrink-0 uppercase tracking-widest">
                                  {ROMAN_NUMERALS[tierNum - 1]}
                                </div>
                              </div>

                              {/* Body Card (Effects) */}
                              <div className="p-2.5">
                                <div className="space-y-1 min-h-[28px] flex flex-col justify-center">
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
                              </div>
                            </div>

                            {/* Bottom Portion (Progress & Action Button Footer) */}
                            <div className="p-2.5 pt-0">
                              <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-[#00FFAA]/10">
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
                                          ? activeCategoryResearchProgress
                                          : (level / MAX_CARD_LEVEL) * 100
                                        }%`,
                                    }}
                                  />
                                </div>

                                <div className="text-[9px] font-black text-[#00FFAA] shrink-0 tracking-wider">
                                  {level}/{MAX_CARD_LEVEL}
                                </div>
                              </div>

                              <div className="mt-2 min-h-[30px] flex flex-col justify-end">
                                {!unlocked && !active && (
                                  locked ? (
                                    <div className="w-full py-1 rounded bg-gray-800/40 border border-gray-700/50 flex items-center justify-center gap-1 text-gray-500 text-[9px] font-black uppercase">
                                      <Lock className="w-2.5 h-2.5" />
                                      Terkunci
                                    </div>
                                  ) : activeCategoryResearchId ? (
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
                                    Diteliti ({activeCategoryResearchProgress}%)
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
                                      Diteliti ({activeCategoryResearchProgress}%)
                                    </div>
                                  ) : activeCategoryResearchId ? (
                                    <div className="w-full py-1 rounded bg-[#0A1A1A] border border-[#6B8A8A]/30 flex items-center justify-center gap-1 text-[#6B8A8A] text-[9px] font-black uppercase">
                                      <Clock className="w-2.5 h-2.5" />
                                      Antrian Penuh
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-1">
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
                                      <div className="text-[8px] font-bold text-[#00FFAA] text-center tracking-tight">
                                        Efek Berikutnya: {applyLevelBonus(
                                          research.effects[0],
                                          nextLevel,
                                          research.category === 'militer'
                                            ? getMilitaryResearchBaseBonus(research.id) ?? research.effects[0].value
                                            : research.effects[0].value,
                                          research.category === 'militer'
                                            ? getMilitaryResearchLevelBonus(research.id, nextLevel)
                                            : undefined
                                        )}
                                      </div>
                                    </div>
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
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60"
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
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Biaya Riset</span>
                <span className="text-sm font-black text-[#00FFAA]">
                  {confirmTarget.cost.toLocaleString('id-ID')} NEO
                </span>
              </div>

              {(() => {
                const effDur = getEffectiveResearchDuration(confirmTarget.duration, confirmTarget.category);
                const endDateStr = addDays(getSafeDateString(), effDur);
                const [y, m, d] = endDateStr.split('-').map(Number);
                const date = new Date(y, m - 1, d);
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
                const formattedEndDate = `${d} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
                const hasDiscount = effDur < confirmTarget.duration;

                return (
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#6B8A8A] uppercase">Durasi</span>
                      <span className="text-sm font-black text-sky-300 flex items-center gap-2">
                        {hasDiscount && (
                          <span className="text-rose-400 line-through">{confirmTarget.duration} hari</span>
                        )}
                        <span className={hasDiscount ? 'text-emerald-400 font-extrabold' : ''}>
                          {effDur} hari
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2 border-t border-[#00FFAA]/10 pt-2">
                      <span className="text-xs font-bold text-[#6B8A8A] uppercase">Estimasi Selesai</span>
                      <span className="text-xs font-black text-[#00FFAA]">
                        {formattedEndDate}
                      </span>
                    </div>
                  </div>
                );
              })()}
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
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60"
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
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Biaya Upgrade</span>
                <span className="text-sm font-black text-[#00FFAA]">
                  {getCardUpgradeCost(confirmUpgrade.research, confirmUpgrade.targetLevel).toLocaleString('id-ID')} NEO
                </span>
              </div>

              {(() => {
                const baseDur = getCardUpgradeDuration(confirmUpgrade.research, confirmUpgrade.targetLevel);
                const effDur = getEffectiveResearchDuration(baseDur, confirmUpgrade.research.category);
                const endDateStr = addDays(getSafeDateString(), effDur);
                const [y, m, d] = endDateStr.split('-').map(Number);
                const date = new Date(y, m - 1, d);
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
                const formattedEndDate = `${d} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
                const hasDiscount = effDur < baseDur;

                return (
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#6B8A8A] uppercase">Durasi</span>
                      <span className="text-sm font-black text-sky-300 flex items-center gap-2">
                        {hasDiscount && (
                          <span className="text-rose-400 line-through">{baseDur} hari</span>
                        )}
                        <span className={hasDiscount ? 'text-emerald-400 font-extrabold' : ''}>
                          {effDur} hari
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2 border-t border-[#00FFAA]/10 pt-2">
                      <span className="text-xs font-bold text-[#6B8A8A] uppercase">Estimasi Selesai</span>
                      <span className="text-xs font-black text-[#00FFAA]">
                        {formattedEndDate}
                      </span>
                    </div>
                  </div>
                );
              })()}
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