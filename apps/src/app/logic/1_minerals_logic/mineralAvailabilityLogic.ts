export const MINERAL_SDA_BUILDING_KEYS = [
  'emas',
  'uranium',
  'batu_bara',
  'minyak_bumi',
  'gas_alam',
  'garam',
  'litium',
  'logam_tanah_jarang',
  'bijih_besi',
] as const;

const MINERAL_SDA_LOOKUP = new Map<string, Record<string, boolean>>();
const MINERAL_SDA_REQUESTS = new Map<string, Promise<Record<string, boolean> | null>>();
let allMineralSdaRequest: Promise<void> | null = null;
let hasLoadedAllMineralSda = false;

const normalizeSdaCountryName = (countryName: string) => {
  if (!countryName) return '';
  return countryName.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
};

export const getMineralSDAStatusForCountry = async (countryName: string): Promise<Record<string, boolean> | null> => {
  const normalized = normalizeSdaCountryName(countryName);
  if (!normalized) return null;

  const cached = MINERAL_SDA_LOOKUP.get(normalized);
  if (cached) {
    return cached;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const pendingRequest = MINERAL_SDA_REQUESTS.get(normalized);
  if (pendingRequest) return pendingRequest;

  const request = (async (): Promise<Record<string, boolean> | null> => {
    try {
      if (!hasLoadedAllMineralSda) {
        if (!allMineralSdaRequest) {
          allMineralSdaRequest = (async () => {
            const response = await fetch('/api/sda-data', { cache: 'no-store' });
            if (!response.ok) {
              throw new Error(`Failed to fetch mineral SDA data: HTTP ${response.status}`);
            }

            const data: unknown = await response.json();
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
              throw new Error('Invalid response from /api/sda-data');
            }

            for (const [country, status] of Object.entries(data)) {
              if (status && typeof status === 'object' && !Array.isArray(status)) {
                MINERAL_SDA_LOOKUP.set(normalizeSdaCountryName(country), status as Record<string, boolean>);
              }
            }
            hasLoadedAllMineralSda = true;
          })().catch((error: unknown) => {
            console.error('getMineralSDAStatusForCountry error', error);
            throw error;
          }).finally(() => {
            allMineralSdaRequest = null;
          });
        }
        await allMineralSdaRequest;
      }

      const loadedStatus = MINERAL_SDA_LOOKUP.get(normalized);
      if (loadedStatus) return loadedStatus;

      const response = await fetch(`/api/sda-data?country=${encodeURIComponent(normalized)}`, { cache: 'no-store' });
      if (!response.ok) return null;

      const data: unknown = await response.json();
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const status = data as Record<string, boolean>;
        MINERAL_SDA_LOOKUP.set(normalized, status);
        return status;
      }
    } catch {
      return null;
    }

    return null;
  })();
  MINERAL_SDA_REQUESTS.set(normalized, request);

  try {
    return await request;
  } finally {
    MINERAL_SDA_REQUESTS.delete(normalized);
  }
};

export const getDisabledMineralBuildingsForCountry = (
  countryName: string,
  sdaStatus?: Record<string, boolean> | null
): Set<string> => {
  const disabled = new Set<string>();
  const normalized = normalizeSdaCountryName(countryName);
  if (!normalized) return disabled;

  const resolvedStatus = sdaStatus ?? MINERAL_SDA_LOOKUP.get(normalized) ?? null;

  if (!resolvedStatus) {
    void getMineralSDAStatusForCountry(countryName);
    return disabled;
  }

  for (const resourceKey of MINERAL_SDA_BUILDING_KEYS) {
    if (resolvedStatus[resourceKey] === false) {
      disabled.add(resourceKey);
    }
  }

  return disabled;
};

export const isMineralBuildingAvailable = (
  buildingKey: string,
  countryName: string,
  sdaStatus?: Record<string, boolean> | null
): boolean => {
  const disabled = getDisabledMineralBuildingsForCountry(countryName, sdaStatus);
  return !disabled.has(buildingKey);
};
