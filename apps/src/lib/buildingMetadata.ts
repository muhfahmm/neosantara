import { getBuildingMetadata as getRegistryBuildingMetadata } from '@/lib/buildingMetadataRegistry';

let fetchPromise: Promise<Record<string, any>> | null = null;
let cachedMetadata: Record<string, any> | null = null;

export async function fetchBuildingMetadata(): Promise<Record<string, any>> {
  // 1. Cek cache lokal memori modul ini jika sudah terisi
  if (cachedMetadata && Object.keys(cachedMetadata).length > 0) {
    return cachedMetadata;
  }

  // 2. Cek apakah building metadata sudah di-hydrate oleh RelationsDataLoader / game-bootstrap
  const registryMeta = getRegistryBuildingMetadata();
  if (registryMeta && Object.keys(registryMeta).length > 0) {
    cachedMetadata = registryMeta;
    return registryMeta;
  }

  // 3. Jika sedang ada fetch yang berjalan, tunggu promise yang sama (deduplikasi)
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async (): Promise<Record<string, any>> => {
    try {
      const res = await fetch('/api/building-metadata');
      if (!res.ok) throw new Error('Failed to fetch building metadata');
      const data = await res.json();
      const validData: Record<string, any> = data && typeof data === 'object' ? data : {};
      cachedMetadata = validData;
      return validData;
    } catch (err) {
      console.error('fetchBuildingMetadata error', err);
      return {};
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export async function getBuildingCost(key: string) {
  const meta = await fetchBuildingMetadata();
  return meta?.[key]?.biaya_pembangunan ?? null;
}
