/**
 * coupChanceCalculator.ts
 * Logika perhitungan probabilitas (persentase) keberhasilan kudeta oleh pemain ke negara lain.
 *
 * Faktor Penentu:
 * 1. Base Success Rate: 35%
 * 2. Stabilitas / Kepuasan Rakyat Target (-15% s/d +30%):
 *    - Kepuasan rendah (< 50) membuat rakyat rentan membelot, memperbesar peluang kudeta.
 *    - Kepuasan tinggi (> 50) memperkuat loyalitas rakyat pada pemerintah target.
 * 3. Kapabilitas Intelijen & Spionase Pemain (0% s/d +20%):
 *    - Bonus riset militer "spionase_strategis" pemain (0 s/d +15%).
 *    - Bonus jika target memiliki kementerian intelijen/keamanan pemain atau jaringan spionase aktif (+5%).
 * 4. Riset Operasi Kudeta (+2% s/d +10%).
 * 5. Pertahanan & Stabilitas Militer Target (-25% s/d +5%):
 *    - Berdasarkan total pasukan armada target / kekuatan militer target.
 *    - Semakin kuat militer target, semakin sulit tentara digerakkan untuk kudeta.
 * 6. Keselarasan / Kedekatan Ideologi & Diplomasi (-10% s/d +15%):
 *    - Jika ideologi pemain sama atau serumpun dengan target: +10%
 *    - Jika hubungan diplomatik sangat buruk (< 20): target lebih waspada terhadap pengaruh asing (-10%)
 *    - Jika hubungan baik: infiltrasi diplomatik lebih mudah (+5%)
 *
 * Batas akhir: Clamped between 5% (minimal selalu ada secercah harapan) dan 95% (tidak pernah 100% mutlak).
 */

import { getMilitaryResearchLevelBonus } from '@/app/page/bonus_logic/militaryResearchBonus';
import { getCoupSuccessResearchBonusPercent } from '@/app/page/bonus_logic/penelitian_bonus_logic/3_riset_diplomasi_intelijen/25_Operasi Kudeta Strategis';

export interface CoupChanceBreakdown {
  baseChance: number;
  stabilityModifier: number;
  intelligenceBonus: number;
  coupResearchBonus: number;
  militaryDefensePenalty: number;
  ideologyDiplomacyModifier: number;
  totalChance: number;
}

export interface CoupChanceContext {
  playerCountryDetail?: Record<string, unknown> | null;
  targetCountryDetail?: Record<string, unknown> | null;
  targetSatisfactionScore?: number;
  relationValue?: number;
}

export const COUP_BASE_CHANCE = 35;
export const COUP_MIN_CHANCE = 5;
export const COUP_MAX_CHANCE = 95;

/**
 * Menghitung rincian persentase keberhasilan kudeta berdasarkan 5 faktor.
 */
export function calculateCoupSuccessChance(context: CoupChanceContext): CoupChanceBreakdown {
  const {
    playerCountryDetail,
    targetCountryDetail,
    targetSatisfactionScore,
    relationValue = 50,
  } = context;

  // 1. Base Chance
  const baseChance = COUP_BASE_CHANCE;

  // 2. Faktor Kepuasan / Stabilitas Rakyat Target
  // Nilai kepuasan target biasanya 0 - 100. Default 50 jika tidak terdefinisi.
  const satisfaction = typeof targetSatisfactionScore === 'number'
    ? targetSatisfactionScore
    : Number(targetCountryDetail?.kepuasan ?? targetCountryDetail?.satisfaction ?? 50);

  // Jika kepuasan = 0 -> modifier = +30%
  // Jika kepuasan = 50 -> modifier = 0%
  // Jika kepuasan = 100 -> modifier = -15%
  let stabilityModifier = 0;
  if (satisfaction < 50) {
    stabilityModifier = Math.round(((50 - satisfaction) / 50) * 30); // 0 s/d +30%
  } else {
    stabilityModifier = -Math.round(((satisfaction - 50) / 50) * 15); // 0 s/d -15%
  }

  // 3. Faktor Kapabilitas Intelijen & Spionase Pemain
  let intelligenceBonus = 0;
  const completedResearch = Array.isArray(playerCountryDetail?.completed_research)
    ? playerCountryDetail.completed_research
    : [];
  const researchId = 'spionase_strategis';
  if (completedResearch.includes(researchId)) {
    const researchLevels = playerCountryDetail?.research_levels &&
      typeof playerCountryDetail.research_levels === 'object'
      ? (playerCountryDetail.research_levels as Record<string, unknown>)
      : {};
    const level = Number(researchLevels[researchId]) || 1;
    const bonus = getMilitaryResearchLevelBonus(researchId, level) || 5;
    intelligenceBonus += bonus; // +2 s/d +15%
  } else {
    // Riset dasar intelijen jika belum ada riset khusus
    intelligenceBonus += 2;
  }

  // Bonus tambahan jika pemain memiliki departemen keamanan / intelijen level tinggi
  const ministries = playerCountryDetail?.ministries || playerCountryDetail?.kementerian;
  if (ministries && typeof ministries === 'object') {
    intelligenceBonus += 3;
  }

  const coupResearchBonus = getCoupSuccessResearchBonusPercent(playerCountryDetail);

  // 4. Pertahanan & Stabilitas Militer Target
  // Dihitung dari armada militer target atau skor kekuatan militer
  let militaryDefensePenalty = 0;
  const targetArmada = targetCountryDetail?.armada || targetCountryDetail?.military_units;
  let targetMilitaryScore = 0;
  if (Array.isArray(targetArmada)) {
    targetMilitaryScore = targetArmada.reduce((acc, curr) => {
      const count = Number(curr?.jumlah || curr?.count || 0);
      return acc + (isNaN(count) ? 0 : count);
    }, 0);
  } else if (typeof targetCountryDetail?.total_militer === 'number') {
    targetMilitaryScore = targetCountryDetail.total_militer;
  } else if (typeof targetCountryDetail?.skor_militer === 'number') {
    targetMilitaryScore = targetCountryDetail.skor_militer;
  }

  // Penalti militer berkisar antara +5% (target sangat lemah/tanpa tentara) s/d -25% (target negara adidaya)
  if (targetMilitaryScore > 5000) {
    militaryDefensePenalty = -25;
  } else if (targetMilitaryScore > 2000) {
    militaryDefensePenalty = -20;
  } else if (targetMilitaryScore > 1000) {
    militaryDefensePenalty = -15;
  } else if (targetMilitaryScore > 500) {
    militaryDefensePenalty = -10;
  } else if (targetMilitaryScore > 100) {
    militaryDefensePenalty = -5;
  } else {
    // Militer sangat minim / lemah
    militaryDefensePenalty = 5;
  }

  // 5. Keselarasan Ideologi & Diplomasi
  let ideologyDiplomacyModifier = 0;
  const playerIdeology = String(playerCountryDetail?.ideology || playerCountryDetail?.ideologi || '').trim().toLowerCase();
  const targetIdeology = String(targetCountryDetail?.ideology || targetCountryDetail?.ideologi || '').trim().toLowerCase();

  if (playerIdeology && targetIdeology && playerIdeology === targetIdeology) {
    // Kesamaan ideologi memudahkan konsolidasi faksi pro-pemain
    ideologyDiplomacyModifier += 10;
  }

  // Pengaruh relasi diplomatik
  if (relationValue < 20) {
    // Hubungan sangat tegang, target sangat waspada kontra-spionase
    ideologyDiplomacyModifier -= 10;
  } else if (relationValue >= 70) {
    // Hubungan bersahabat memudahkan infiltrasi
    ideologyDiplomacyModifier += 5;
  }

  // Hitung total peluang
  const rawTotal = baseChance + stabilityModifier + intelligenceBonus + coupResearchBonus + militaryDefensePenalty + ideologyDiplomacyModifier;
  const totalChance = Math.max(COUP_MIN_CHANCE, Math.min(COUP_MAX_CHANCE, Math.round(rawTotal)));

  return {
    baseChance,
    stabilityModifier,
    intelligenceBonus,
    coupResearchBonus,
    militaryDefensePenalty,
    ideologyDiplomacyModifier,
    totalChance,
  };
}

/**
 * Menentukan apakah kudeta berhasil berdasarkan probabilitas total.
 * @param chance persentase 0-100
 * @param deterministicRoll optional untuk testing (0.0 - 1.0)
 */
export function rollCoupAttempt(chance: number, deterministicRoll?: number): boolean {
  const roll = typeof deterministicRoll === 'number' ? deterministicRoll : Math.random();
  return (roll * 100) < chance;
}
