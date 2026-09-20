// Compatibility module for Database Hubungan Antar Negara

export interface CountryRelation {
  id: number;
  name: string;
  relation: number;
}

export function getRelationValue(sourceCountry?: string, targetCountry?: string): number {
  if (!sourceCountry || !targetCountry) return 50;
  if (sourceCountry.toLowerCase() === targetCountry.toLowerCase()) return 100;
  return 50;
}

export default getRelationValue;
