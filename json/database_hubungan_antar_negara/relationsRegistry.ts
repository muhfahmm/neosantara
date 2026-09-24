// Compatibility module for Database Hubungan Antar Negara

export interface CountryRelation {
  id: number;
  name: string;
  relation: number;
}

/**
 * Calculates a dynamic, deterministic relation score (0 - 100) between two countries.
 * - Same country: 100
 * - Unspecified country: 50
 * - Other country pairs: deterministic pseudo-random hash between 15 and 95
 */
export function getRelationValue(sourceCountry?: string, targetCountry?: string): number {
  if (!sourceCountry || !targetCountry) return 50;

  const s1 = sourceCountry.trim().toLowerCase();
  const s2 = targetCountry.trim().toLowerCase();

  if (s1 === s2) return 100;

  // Alphabetical pair order so relation(A, B) === relation(B, A)
  const pairKey = s1 < s2 ? `${s1}:${s2}` : `${s2}:${s1}`;

  // Simple string hash algorithm (djb2 variant)
  let hash = 5381;
  for (let i = 0; i < pairKey.length; i++) {
    hash = (hash * 33) ^ pairKey.charCodeAt(i);
  }

  // Map hash positively to range [15, 95] with healthy distribution across all 5 legend tiers:
  // 15 - 35: Sangat Buruk (Red)
  // 36 - 49: Buruk (Rose)
  // 50 - 65: Netral (Yellow)
  // 66 - 80: Baik (Green)
  // 81 - 95: Sangat Baik (Neon Green)
  const rawScore = 15 + (Math.abs(hash) % 81);

  return rawScore;
}

export default getRelationValue;

