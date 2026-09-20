// Compatibility module for Database Doktrin Keterbukaan

export interface DoktrinKeterbukaan {
  country: string;
  name_en: string;
  ideology: string;
  speechScore: number;
  religionScore: number;
  demoScore: number;
  transparencyScore: number;
  mediaScore: number;
  internetScore: number;
  borderScore: number;
  tradeScore: number;
  diplomacyScore: number;
  opennessIndex: number;
}

export const defaultDoktrin: DoktrinKeterbukaan = {
  country: "Demokrasi",
  name_en: "Default",
  ideology: "Demokrasi",
  speechScore: 75,
  religionScore: 80,
  demoScore: 70,
  transparencyScore: 75,
  mediaScore: 75,
  internetScore: 80,
  borderScore: 60,
  tradeScore: 75,
  diplomacyScore: 70,
  opennessIndex: 73
};

export function getDoktrinKeterbukaan(countryName?: string): DoktrinKeterbukaan {
  return defaultDoktrin;
}

export default getDoktrinKeterbukaan;
