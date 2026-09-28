export interface DoktrinKeterbukaan {
  id: number;
  country: string;
  name_en: string;
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

export async function fetchDoktrinKeterbukaanFromDb(countryName?: string): Promise<DoktrinKeterbukaan | null> {
  try {
    const url = countryName 
      ? `/api/doktrin-keterbukaan?country=${encodeURIComponent(countryName)}` 
      : `/api/doktrin-keterbukaan`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) return data[0] || null;
    return data;
  } catch (err) {
    console.error('Failed to fetch doktrin keterbukaan from database API:', err);
    return null;
  }
}
