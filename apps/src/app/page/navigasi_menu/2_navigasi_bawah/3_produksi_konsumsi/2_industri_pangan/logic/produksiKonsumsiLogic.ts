import { PROFILES_POPULATION_DATA } from "@/../../json/semua_fitur_negara/0_profiles/index";

const parsePopulationText = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const compact = trimmed.replace(/\s+/g, '').replace(/,/g, '.');

    const millionMatch = compact.match(/^([0-9]+(?:\.[0-9]+)?)\s*M$/i);
    if (millionMatch) {
      return Number(millionMatch[1]) * 1000000;
    }

    const thousandMatch = compact.match(/^([0-9]+(?:\.[0-9]+)?)\s*K$/i);
    if (thousandMatch) {
      return Number(thousandMatch[1]) * 1000;
    }

    const normalized = compact.replace(/[^0-9.\-]/g, '');
    if (normalized === '' || normalized === '-' || normalized === '.') return 0;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const safeNumber = (value: any): number => parsePopulationText(value);

const normalizeNameKey = (value?: string) => `${(value || '').toLowerCase().trim().replace(/\s+/g, ' ')}`;

const getProfilePopulationLookup = () => {
  const map = new Map<string, number>();

  for (const profile of PROFILES_POPULATION_DATA) {
    const key = normalizeNameKey(profile.name_id || profile.name_en);
    const population = safeNumber(profile.jumlah_penduduk);
    if (key && population > 0) {
      map.set(key, population);
    }
  }

  return map;
};

const PROFILE_POPULATION_LOOKUP = getProfilePopulationLookup();

const resolveCountryPopulation = (country: any) => {
  const directPopulation = safeNumber(
    country?.jumlah_penduduk ??
    country?.population ??
    country?.pop ??
    country?.penduduk ??
    country?.total_population
  );

  if (directPopulation > 0) {
    return directPopulation;
  }

  const rawName = country?.name_id || country?.name_en || country?.nama || country?.country || '';
  const lookupKey = normalizeNameKey(rawName);
  const profilePopulation = PROFILE_POPULATION_LOOKUP.get(lookupKey);

  if (profilePopulation && profilePopulation > 0) {
    return profilePopulation;
  }

  const fileName = country?.__fileName || '';
  if (fileName) {
    const derivedFromFile = normalizeNameKey(
      fileName
        .replace(/^\d+_/, '')
        .replace(/\.(ts|js|json)$/i, '')
        .replace(/_/g, ' ')
    );
    const fileLookup = PROFILE_POPULATION_LOOKUP.get(derivedFromFile);
    if (fileLookup && fileLookup > 0) {
      return fileLookup;
    }
  }

  return 0;
};

// Data konsumsi per 1.000 penduduk per hari.
export const FOOD_CONSUMPTION_PER_CAPITA: Record<string, number> = {
  // Peternakan
  ayam_unggas: 0.15,
  sapi_potong: 0.08,
  sapi_perah: 0.12,
  domba_kambing: 0.05,
  // Agrikultur
  padi: 0.35,
  gandum: 0.24,
  jagung: 0.18,
  sayur: 0.30,
  umbi: 0.20,
  kedelai: 0.15,
  kelapa_sawit: 0.10,
  kopi: 0.05,
  teh: 0.06,
  kakao: 0.04,
  tebu: 0.15,
  karet: 0.02,
  // Perikanan
  udang: 0.08,
  ikan: 0.25,
  mutiara: 0.01,
  // Olahan Pangan
  air_mineral: 0.05,
  garam: 0.0005,
  gula: 0.0015,
  roti: 0.18,
  pengolahan_daging: 0.10,
  mie_instan: 0.25,
  minyak_goreng: 0.10,
  susu: 0.15,
  beras: 0.35,
};

export const RAW_MATERIAL_DEFAULT_PROD: Record<string, number> = {
  padi: 200,
  gandum: 150,
  jagung: 80,
  sayur: 65,
  umbi: 50,
  kedelai: 25,
  kelapa_sawit: 150,
  kopi: 25,
  teh: 25,
  kakao: 10,
  tebu: 85,
  karet: 35,
  ayam_unggas: 150,
  sapi_perah: 150,
  sapi_potong: 120,
  domba_kambing: 180,
  udang: 120,
  ikan: 350,
  mutiara: 15,
};

// Helper to find building metadata
export const findMeta = (key: string, metadata: any) => {
  if (!metadata) return undefined;
  if (metadata[key]) return metadata[key];
  const cleanKey = key.replace(/^\d+_/, '').replace(/^pabrik_pengolahan_/, '').replace(/^pabrik_/, '').replace(/^kebun_/, '').replace(/^peternakan_/, '');
  for (const k of Object.keys(metadata)) {
    const entry = metadata[k];
    if (!entry) continue;
    if (entry.dataKey === key || entry.dataKey === cleanKey) return entry;
    if (k === key || k === cleanKey || k.endsWith(`_${key}`) || k.endsWith(`_${cleanKey}`)) return entry;
  }
  return undefined;
};

export const getFoodIngredientsRequirements = (factoryKey: string, metadata: any): Array<{ key: string; label: string; amount: number }> => {
  const meta = findMeta(factoryKey, metadata);
  if (meta && Array.isArray(meta.konsumsi_bahan_baku)) {
    return meta.konsumsi_bahan_baku;
  }
  // Hardcoded fallback requirement if metadata is not provided
  const HARDCODED_INGREDIENTS: Record<string, Array<{ key: string; label: string; amount: number }>> = {
    beras: [{ key: 'padi', label: 'padi', amount: 10 }],
    gula: [{ key: 'tebu', label: 'tebu', amount: 10 }],
    roti: [{ key: 'gandum', label: 'gandum', amount: 15 }],
    mie_instan: [{ key: 'gandum', label: 'gandum', amount: 20 }],
    minyak_goreng: [{ key: 'kelapa_sawit', label: 'kelapa sawit', amount: 12 }],
    susu: [{ key: 'sapi_perah', label: 'sapi perah', amount: 8 }],
    pengolahan_daging: [
      { key: 'ayam_unggas', label: 'ayam unggas', amount: 5 },
      { key: 'sapi_potong', label: 'sapi potong', amount: 2 },
      { key: 'domba_kambing', label: 'domba & kambing', amount: 3 }
    ],
  };
  return HARDCODED_INGREDIENTS[factoryKey] || [];
};

export const isFoodRawMaterialDeficit = (factoryKey: string, countryDetail: any, metadata: any): boolean => {
  const reqIngredients = getFoodIngredientsRequirements(factoryKey, metadata);
  if (!reqIngredients || reqIngredients.length === 0) return false;

  const pop = safeNumber(countryDetail?.jumlah_penduduk);

  for (const ing of reqIngredients) {
    const rawKey = ing.key;
    const rawCount = safeNumber(countryDetail?.[rawKey]);
    const bMeta = findMeta(rawKey, metadata);
    const baseProd = safeNumber(bMeta?.produksi) || RAW_MATERIAL_DEFAULT_PROD[rawKey] || 0;
    const rawGrossProd = baseProd * rawCount;

    const rawPopCons = FOOD_CONSUMPTION_PER_CAPITA[rawKey] !== undefined
      ? (pop / 1000) * safeNumber(FOOD_CONSUMPTION_PER_CAPITA[rawKey])
      : 0;

    let rawFactoryCons = 0;
    // Hitung total konsumsi pabrik untuk bahan baku ini (dari semua pabrik konsumen)
    const foodKeys = ['gula', 'roti', 'pengolahan_daging', 'mie_instan', 'minyak_goreng', 'susu', 'beras'];
    for (const fk of foodKeys) {
      const fIngredients = getFoodIngredientsRequirements(fk, metadata);
      const matchedIng = fIngredients.find(item => item.key === rawKey);
      if (matchedIng) {
        const fCount = safeNumber(countryDetail?.[fk]);
        rawFactoryCons += fCount * matchedIng.amount;
      }
    }

    // Pastikan kapasitas produksi pertanian/peternakan mentah mencukupi kebutuhan giling pabrik
    const finalSaldo = rawGrossProd - rawFactoryCons;

    if (rawCount <= 0 || rawGrossProd <= 0 || finalSaldo < 0) {
      return true;
    }
  }

  return false;
};

// Calculate production based on building count and metadata
export const calculateProduction = (buildingKey: string, countryDetail: any, metadata: any) => {
  const count = safeNumber(countryDetail?.[buildingKey]);
  const bMeta = findMeta(buildingKey, metadata);
  const baseProd = safeNumber(bMeta?.produksi);

  if (isFoodRawMaterialDeficit(buildingKey, countryDetail, metadata)) {
    return 0;
  }

  return baseProd * count;
};

// Calculate consumption based on population and consumption per capita
export const calculateConsumption = (population: number, consumptionPerCapita: number) => {
  const safePopulation = safeNumber(population);
  const safePerCapita = safeNumber(consumptionPerCapita);
  return (safePopulation / 1000) * safePerCapita;
};

// Calculate total production, consumption and balance for a country (Flat list)
export const calculateCountryFoodAggregate = (country: any, metadata: any) => {
  let totalProduction = 0;
  let totalConsumption = 0;
  
  const population = resolveCountryPopulation(country);

  Object.entries(FOOD_CONSUMPTION_PER_CAPITA).forEach(([key, consumptionPerCapita]) => {
    const prod = calculateProduction(key, country, metadata);
    const cons = calculateConsumption(population, consumptionPerCapita);
    totalProduction += prod;
    totalConsumption += cons;
  });

  return {
    totalProduction: Number.isFinite(totalProduction) ? totalProduction : 0,
    totalConsumption: Number.isFinite(totalConsumption) ? Math.round(totalConsumption) : 0,
    balance: Number.isFinite(totalProduction - totalConsumption) ? Math.round(totalProduction - totalConsumption) : 0,
  };
};

// Calculate detailed commodity food info for a country (Flat list)
export const calculateCountryFoodDetails = (country: any, metadata: any) => {
  const population = resolveCountryPopulation(country);

  return Object.entries(FOOD_CONSUMPTION_PER_CAPITA).map(([key, consumptionPerCapita]) => {
    const production = calculateProduction(key, country, metadata);
    const consumption = calculateConsumption(population, consumptionPerCapita);
    return {
      key,
      label: metadata?.[key]?.label || key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()),
      production: Number.isFinite(production) ? production : 0,
      consumption: Number.isFinite(consumption) ? Math.round(consumption) : 0,
      balance: Number.isFinite(production - consumption) ? Math.round(production - consumption) : 0,
      population,
      consumptionPerCapita: Number.isFinite(consumptionPerCapita) ? consumptionPerCapita : 0,
    };
  });
};