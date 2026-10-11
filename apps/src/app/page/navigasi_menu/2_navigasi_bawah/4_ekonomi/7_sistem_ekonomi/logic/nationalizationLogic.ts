import { replaceRelationSourceModifiers } from "@/../../json/database_hubungan_antar_negara/relationsRegistry";

export const NATIONALIZATION_LEVELS = [
  {
    value: 0,
    name: "Pasar Bebas",
    stateProfitSharePercent: 20,
    description: "Sektor dikelola swasta; negara menerima pajak dan royalti dasar.",
  },
  {
    value: 25,
    name: "Regulasi Ketat",
    stateProfitSharePercent: 35,
    description: "Negara mengatur harga dan kuota, sementara swasta masih dominan.",
  },
  {
    value: 50,
    name: "Ekonomi Campuran",
    stateProfitSharePercent: 55,
    description: "Negara memiliki saham mayoritas dan mengawasi operator swasta.",
  },
  {
    value: 75,
    name: "Dominasi Negara",
    stateProfitSharePercent: 75,
    description: "Negara menguasai hampir seluruh aset produktif.",
  },
  {
    value: 100,
    name: "Nasionalisasi Penuh",
    stateProfitSharePercent: 95,
    description: "Seluruh aset produktif dikelola negara.",
  },
] as const;

export const NATIONALIZATION_SECTORS = [
  {
    id: "kelistrikan",
    name: "Kelistrikan",
    productKeys: [],
  },
  {
    id: "mineral_energi",
    name: "Mineral & Energi",
    productKeys: [
      "uranium",
      "batu_bara",
      "minyak_bumi",
      "gas_alam",
      "garam",
      "litium",
      "logam_tanah_jarang",
      "bijih_besi",
    ],
  },
  {
    id: "manufaktur",
    name: "Manufaktur",
    productKeys: [
      "pabrik_semikonduktor",
      "pabrik_mesin_mobil",
      "pabrik_mesin_motor",
      "semen_beton",
      "kayu",
    ],
  },
  {
    id: "peternakan",
    name: "Peternakan",
    productKeys: ["ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing"],
  },
  {
    id: "agrikultur",
    name: "Agrikultur",
    productKeys: [
      "padi",
      "gandum",
      "jagung",
      "sayur",
      "umbi",
      "kedelai",
      "kelapa_sawit",
      "kopi",
      "teh",
      "kakao",
      "tebu",
      "karet",
    ],
  },
  {
    id: "perikanan",
    name: "Perikanan",
    productKeys: ["udang", "mutiara", "ikan"],
  },
  {
    id: "olahan_pangan",
    name: "Olahan Pangan",
    productKeys: [
      "air_mineral",
      "gula",
      "roti",
      "pengolahan_daging",
      "mie_instan",
      "minyak_goreng",
      "susu",
    ],
  },
] as const;

export type NationalizationSectorId = (typeof NATIONALIZATION_SECTORS)[number]["id"];

export type NationalizationLevels = Partial<Record<NationalizationSectorId, number>>;
export const NATIONALIZATION_DIPLOMACY_INTERVAL_MONTHS = 6;

interface CountryProfileSummary {
  name_id?: unknown;
  country?: unknown;
  nama_negara?: unknown;
  ideology?: unknown;
}

const synchronizedDiplomacy = new Map<string, string>();
const pendingDiplomacySyncs = new Map<string, Promise<void>>();
let countryProfilesCache: CountryProfileSummary[] | null = null;
let countryProfilesRequest: Promise<CountryProfileSummary[]> | null = null;

async function fetchCountryProfiles(): Promise<CountryProfileSummary[]> {
  if (countryProfilesCache) return countryProfilesCache;
  if (countryProfilesRequest) return countryProfilesRequest;

  countryProfilesRequest = (async () => {
    const response = await fetch("/api/country-data?all=true", { cache: "no-store" });
    if (!response.ok) throw new Error(`Data profil negara gagal dimuat (${response.status}).`);
    const countries: unknown = await response.json();
    if (!Array.isArray(countries)) {
      throw new Error("Data profil negara tidak tersedia untuk menerapkan dampak diplomatik.");
    }
    countryProfilesCache = countries as CountryProfileSummary[];
    return countryProfilesCache;
  })();

  try {
    return await countryProfilesRequest;
  } finally {
    countryProfilesRequest = null;
  }
}

export function getNationalizationLevel(
  levels: unknown,
  sectorId: NationalizationSectorId
): number {
  if (!levels || typeof levels !== "object") return 0;
  const value = Number((levels as Record<string, unknown>)[sectorId]);
  return NATIONALIZATION_LEVELS.some((level) => level.value === value) ? value : 0;
}

export function getAverageNationalization(levels: unknown): number {
  const total = NATIONALIZATION_SECTORS.reduce(
    (sum, sector) => sum + getNationalizationLevel(levels, sector.id),
    0
  );
  return total / NATIONALIZATION_SECTORS.length;
}

export function calculateEconomicPolicyAverage(
  spectrumValue: number,
  policyChoices: Record<string, "A" | "B">,
  sectorLevels: unknown
): number {
  const safeSpectrum = Math.min(100, Math.max(0, Number(spectrumValue) || 0));
  const policyScores = Object.values(policyChoices).map((choice) => choice === "B" ? 100 : 0);
  const sectorMarketScores = NATIONALIZATION_SECTORS.map(
    (sector) => 100 - getNationalizationLevel(sectorLevels, sector.id)
  );
  const allScores = [safeSpectrum, ...policyScores, ...sectorMarketScores];
  return Math.round(allScores.reduce((total, score) => total + score, 0) / allScores.length);
}

export function isCommunistMultilateralLoanRestricted(
  ideology: unknown,
  levels: unknown
): boolean {
  const normalizedIdeology = String(ideology ?? "")
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return (
    (normalizedIdeology === "komunisme" || normalizedIdeology === "komunis") &&
    getAverageNationalization(levels) > 50
  );
}

export function getStateProfitSharePercent(level: number): number {
  return NATIONALIZATION_LEVELS.find((item) => item.value === level)?.stateProfitSharePercent ?? 20;
}

export function getTradeProductNationalizationSector(
  productKey: string
): NationalizationSectorId | null {
  const sector = NATIONALIZATION_SECTORS.find((item) =>
    item.productKeys.some((key) => key === productKey)
  );
  return sector?.id ?? null;
}

export function getTradeProductStateProfitSharePercent(
  countryDetail: Record<string, unknown> | null | undefined,
  productKey: string
): number {
  const sectorId = getTradeProductNationalizationSector(productKey);
  const levels = countryDetail?.sector_nationalization;
  const level = sectorId ? getNationalizationLevel(levels, sectorId) : 0;
  return getStateProfitSharePercent(level);
}

export function getGoldStateProfitSharePercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const level = getNationalizationLevel(countryDetail?.sector_nationalization, "mineral_energi");
  return getStateProfitSharePercent(level);
}

export function hasActiveNationalization(levels: unknown): boolean {
  return NATIONALIZATION_SECTORS.some(
    (sector) => getNationalizationLevel(levels, sector.id) > 0
  );
}

export function getNationalizationDiplomacyDecline(monthCounter: unknown): number {
  const months = Math.max(0, Math.floor(Number(monthCounter) || 0));
  return -Math.floor(months / NATIONALIZATION_DIPLOMACY_INTERVAL_MONTHS);
}

export async function syncNationalizationDiplomacyRelations(
  sourceCountry: string,
  levels: unknown,
  diplomacyMonthCounter: unknown = 0
): Promise<void> {
  const countryName = sourceCountry.trim();
  if (!countryName) throw new Error("Negara aktif tidak ditemukan untuk dampak diplomatik.");

  const normalizedLevels = Object.fromEntries(
    NATIONALIZATION_SECTORS.map((sector) => [
      sector.id,
      getNationalizationLevel(levels, sector.id),
    ])
  );
  const normalizedCountry = countryName.toLowerCase();
  const diplomacyDecline = getNationalizationDiplomacyDecline(diplomacyMonthCounter);
  const fingerprint = JSON.stringify({ levels: normalizedLevels, diplomacyDecline });
  if (synchronizedDiplomacy.get(normalizedCountry) === fingerprint) return;

  const pendingKey = `${normalizedCountry}:${fingerprint}`;
  const pendingSync = pendingDiplomacySyncs.get(pendingKey);
  if (pendingSync) return pendingSync;

  const syncPromise = (async () => {
    const countries = await fetchCountryProfiles();
    const relationModifiers: Record<string, number> = {};
    let kapitalisFound = false;
    countries.forEach((country: CountryProfileSummary) => {
      const targetName = String(country?.name_id || country?.country || country?.nama_negara || "").trim();
      if (
        !targetName ||
        targetName.toLowerCase() === normalizedCountry ||
        String(country?.ideology || "").trim().toLowerCase() !== "kapitalisme"
      ) {
        return;
      }
      kapitalisFound = true;
      relationModifiers[targetName] = diplomacyDecline;
    });
    if (diplomacyDecline !== 0 && !kapitalisFound) {
      throw new Error("Tidak ditemukan negara berideologi Kapitalisme untuk menerima dampak diplomatik.");
    }

    replaceRelationSourceModifiers(
      countryName,
      `nationalisasi-sektor:${normalizedCountry}`,
      relationModifiers
    );
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("country_relations_updated"));
    }
    synchronizedDiplomacy.set(normalizedCountry, fingerprint);
  })();

  pendingDiplomacySyncs.set(pendingKey, syncPromise);
  try {
    await syncPromise;
  } finally {
    pendingDiplomacySyncs.delete(pendingKey);
  }
}
