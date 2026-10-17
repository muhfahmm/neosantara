export interface TempatWisata {
  id: number;
  country_id?: number;
  country_slug: string;
  nama_wisata: string;
  penghasilan: number;
}

export interface TempatWisataResponse {
  status?: string;
  country?: string;
  data?: TempatWisata[];
  tempat_wisata?: Array<{ nama: string; penghasilan: number }>;
}

export async function fetchTempatWisataFromDb(countryNameOrSlug?: string): Promise<TempatWisata[]> {
  try {
    const url = countryNameOrSlug
      ? `/api/tourism-data?country=${encodeURIComponent(countryNameOrSlug)}`
      : `/api/tourism-data`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json: TempatWisataResponse = await res.json();
    if (json.data && Array.isArray(json.data)) return json.data;
    if (json.tempat_wisata && Array.isArray(json.tempat_wisata)) {
      return json.tempat_wisata.map((item, idx) => ({
        id: idx + 1,
        country_slug: countryNameOrSlug || '',
        nama_wisata: item.nama,
        penghasilan: item.penghasilan,
      }));
    }
    return [];
  } catch (err) {
    console.error('Failed to fetch tempat wisata from database API:', err);
    return [];
  }
}

export async function fetchAllTempatWisataFromDb(): Promise<TempatWisata[]> {
  try {
    const res = await fetch('/api/tourism-data');
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error('Failed to fetch all tempat wisata from database API:', err);
    return [];
  }
}

// Helper utility aliases matching standard structure
export const TOURISM_ALIAS_MAP: Record<string, string> = {
  "amerika_serikat": "america_serikat",
  "us": "america_serikat",
  "usa": "america_serikat",
  "brazil": "brasil",
  "chile": "chili",
  "bolivia": "dinasti",
  "costa_rica": "kostrika",
  "komoro": "komori",
  "republik_demokratik_kongo": "demokratik_kongo",
  "saint_lucia": "santo_lucia",
  "saint_kitts_dan_nevis": "santo_kitts_nevis",
  "saint_vincent_dan_grenadine": "santo_vincent_grenadines",
  "saint_vincent_dan_grenadines": "santo_vincent_grenadines",
  "selandia_baru": "negara_neuzelandi",
  "new_zealand": "negara_neuzelandi",
  "trinidad_dan_tobago": "trinidat_tobago",
  "trinidad_&_tobago": "trinidat_tobago",
  "cape_verde": "cabo_verde",
  "tanjung_verde": "cabo_verde",
  "afghanistan": "afganistan",
  "algeria": "aljazair",
  "egypt": "mesir",
  "japan": "jepang",
  "south_korea": "korea_selatan",
  "north_korea": "korea_utara",
  "united_kingdom": "inggris",
  "germany": "jerman",
  "france": "prancis",
  "spain": "spanyol",
  "italy": "italia",
  "netherlands": "belanda",
  "russia": "rusia",
  "china": "china",
  "indonesia": "indonesia",
  "thailand": "thailand",
  "vietnam": "vietnam",
  "philippines": "filipina",
  "singapore": "singapura",
  "malaysia": "malaysia",
  "saudi_arabia": "arab_saudi",
  "turkey": "turki",
  "greece": "yunani",
  "madagaskar": "madagascar",
  "tahiti": "fiji_prancis",
  "polinesia_prancis": "fiji_prancis",
  "french_polynesia": "fiji_prancis",
  "republik_dominika": "dominika_republik",
  "kongo": "congo",
  "republic_of_the_congo": "congo",
  "solomon": "kepulauan_solomon",
  "solomon_islands": "kepulauan_solomon",
  "cook_islands": "muanui",
  "kepulauan_cook": "muanui",
  "turks_and_caicos": "turks_caicos",
  "turks_dan_caicos": "turks_caicos",
  "virgin_islands": "kepulauan_virgin"
};

export const normalizeCountrySlug = (countryNameOrSlug: any): string => {
  if (!countryNameOrSlug) return '';
  const raw = String(countryNameOrSlug).toLowerCase().trim();
  const clean = raw.replace(/[\s-]+/g, '_').replace(/['"]/g, '');
  if (TOURISM_ALIAS_MAP[clean]) return TOURISM_ALIAS_MAP[clean];
  return clean;
};
