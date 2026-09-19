let cache: Record<string, any> | null = null;
let fetchPromise: Promise<Record<string, any>> | null = null;

export async function fetchBuildingMetadata(): Promise<Record<string, any>> {
  if (cache) return cache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async (): Promise<Record<string, any>> => {
    try {
      const res = await fetch('/api/building-metadata');
      if (!res.ok) throw new Error('Failed to fetch building metadata');
      const data = await res.json();
      const validData: Record<string, any> = data && typeof data === 'object' ? data : {};
      cache = validData;
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
