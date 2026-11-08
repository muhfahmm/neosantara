'use client';

import { useEffect } from 'react';
import { setBaseRelationData, type BaseRelationRow } from '../../../json/4_database_hubungan_antar_negara/relationsRegistry';
import { setEmbassyData, type EmbassyDataRow } from '../../../json/6_database_kedutaan_besar/embassyRegistry';
import { setTradeAgreementData, type TradeAgreementDataRow } from '../../../json/9_database_mitra_perdagangan/tradeAgreementRegistry';
import { setBuildingMetadata, type BuildingMetadata } from '@/lib/buildingMetadataRegistry';
import { resolveApiUrl, patchGlobalFetch } from '@/lib/apiHelper';
import { getClientCache, setClientCache } from '@/lib/clientDataCache';
import { preloadMapAssets } from '@/app/page/map_system/mapLoader';

if (typeof window !== 'undefined') {
  patchGlobalFetch();
}

interface BootstrapBundle {
  relations: BaseRelationRow[];
  embassies: EmbassyDataRow[];
  tradeAgreements: TradeAgreementDataRow[];
  buildingMetadata: BuildingMetadata;
}

const BOOTSTRAP_CACHE_KEY = 'game_bootstrap_bundle';
const CLIENT_CACHE_TIMEOUT_MS = 300;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isBaseRelationRow(value: unknown): value is BaseRelationRow {
  return isRecord(value) &&
    typeof value.country_slug === 'string' &&
    typeof value.target_country === 'string' &&
    typeof value.relation === 'number';
}

function isEmbassyDataRow(value: unknown): value is EmbassyDataRow {
  return isRecord(value) &&
    typeof value.country_slug === 'string' &&
    typeof value.mitra_country === 'string';
}

function isTradeAgreementDataRow(value: unknown): value is TradeAgreementDataRow {
  return isRecord(value) &&
    typeof value.country_slug === 'string' &&
    typeof value.mitra_country === 'string';
}

function isBuildingMetadata(value: unknown): value is BuildingMetadata {
  return isRecord(value) && Object.keys(value).length > 0 && Object.values(value).every(isRecord);
}

const isFastArray = <T,>(
  value: unknown,
  sampleValidator: (item: unknown) => item is T,
): value is T[] => Array.isArray(value) && value.length > 0 && sampleValidator(value[0]);

function isBootstrapBundle(value: unknown): value is BootstrapBundle {
  if (!isRecord(value)) return false;
  return (
    isFastArray(value.relations, isBaseRelationRow) &&
    isFastArray(value.embassies, isEmbassyDataRow) &&
    isFastArray(value.tradeAgreements, isTradeAgreementDataRow) &&
    isBuildingMetadata(value.buildingMetadata)
  );
}

function applyBundleData(bundle: BootstrapBundle) {
  setBaseRelationData(bundle.relations);
  setEmbassyData(bundle.embassies);
  setTradeAgreementData(bundle.tradeAgreements);
  setBuildingMetadata(bundle.buildingMetadata);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('country_relations_updated'));
  }
}

async function fetchBootstrapBundle(cachedEtag: string | null = null): Promise<{ bundle: BootstrapBundle | null; etag: string | null }> {
  const targetUrl = resolveApiUrl('/api/game-bootstrap');
  const headers: Record<string, string> = {};
  if (cachedEtag) {
    headers['If-None-Match'] = cachedEtag;
  }

  const response = await fetch(targetUrl, {
    cache: 'no-store',
    headers,
  });

  if (response.status === 304) {
    return { bundle: null, etag: cachedEtag };
  }

  if (!response.ok) {
    throw new Error(`Bootstrap failed with status ${response.status}`);
  }

  const etag = response.headers.get('ETag');
  const payload = await response.json();
  if (!isBootstrapBundle(payload)) {
    throw new Error('Invalid bootstrap payload format');
  }

  return { bundle: payload, etag };
}

async function getClientCacheQuickly<T>(key: string): Promise<{ data: T; etag: string | null } | null> {
  let timeoutId: number | undefined;
  try {
    return await Promise.race([
      getClientCache<T>(key),
      new Promise<null>(resolve => {
        timeoutId = window.setTimeout(() => resolve(null), CLIENT_CACHE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
}

export default function RelationsDataLoader({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let isMounted = true;
    preloadMapAssets();

    async function loadRelationData() {
      try {
        const cached = await getClientCacheQuickly<BootstrapBundle>(BOOTSTRAP_CACHE_KEY);
        if (!isMounted) return;
        if (cached && cached.data) {
          applyBundleData(cached.data);
          void fetchBootstrapBundle(cached.etag).then(result => {
            if (result.bundle) {
              if (isMounted) applyBundleData(result.bundle);
              void setClientCache(BOOTSTRAP_CACHE_KEY, result.bundle, result.etag);
            }
          }).catch(err => {
            console.warn('Background revalidation skipped:', err);
          });
          return;
        }

        const { bundle, etag } = await fetchBootstrapBundle(null);
        if (bundle) {
          if (isMounted) applyBundleData(bundle);
          void setClientCache(BOOTSTRAP_CACHE_KEY, bundle, etag);
        }
      } catch (error) {
        console.error('Failed to load database-backed game metadata:', error);
      }
    }

    void loadRelationData();
    return () => {
      isMounted = false;
    };
  }, []);

  return children;
}
