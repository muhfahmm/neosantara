'use client';

import { useEffect, useState } from 'react';
import { setBaseRelationData, type BaseRelationRow } from '../../../json/4_database_hubungan_antar_negara/relationsRegistry';
import { setEmbassyData, type EmbassyDataRow } from '../../../json/6_database_kedutaan_besar/embassyRegistry';
import { setTradeAgreementData, type TradeAgreementDataRow } from '../../../json/9_database_mitra_perdagangan/tradeAgreementRegistry';
import { setBuildingMetadata, type BuildingMetadata } from '@/lib/buildingMetadataRegistry';
import { resolveApiUrl, patchGlobalFetch } from '@/lib/apiHelper';
import { getClientCache, setClientCache } from '@/lib/clientDataCache';

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

export default function RelationsDataLoader({ children }: { children: React.ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('Menghubungkan ke database...');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRelationData() {
      try {
        if (isMounted) setStatusMessage('Memeriksa cache data lokal...');
        
        // 1. Check client-side persistent cache (IndexedDB) for instant load
        const cached = await getClientCache<BootstrapBundle>(BOOTSTRAP_CACHE_KEY);
        if (cached && cached.data) {
          applyBundleData(cached.data);
          if (isMounted) {
            setLoadError(null);
            setIsLoaded(true);
          }
          // Revalidate in background with 304 Not Modified
          void fetchBootstrapBundle(cached.etag).then(result => {
            if (result.bundle) {
              applyBundleData(result.bundle);
              void setClientCache(BOOTSTRAP_CACHE_KEY, result.bundle, result.etag);
            }
          }).catch(err => {
            console.warn('Background revalidation skipped:', err);
          });
          return;
        }

        // 2. Cold start (no cache): fetch bundled bootstrap endpoint
        if (isMounted) setStatusMessage('Mengunduh paket data permainan...');
        const { bundle, etag } = await fetchBootstrapBundle(null);
        if (bundle) {
          applyBundleData(bundle);
          void setClientCache(BOOTSTRAP_CACHE_KEY, bundle, etag);
        }

        if (isMounted) {
          setLoadError(null);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load database-backed game metadata:', error);
        if (isMounted) {
          const detail = (error as Error)?.message || String(error);
          setLoadError(`Gagal memuat data permainan: ${detail}`);
        }
      }
    }

    void loadRelationData();
    return () => {
      isMounted = false;
    };
  }, [attempt]);

  if (isLoaded) {
    return children;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-emerald-100">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="font-mono text-sm tracking-wide">{loadError ?? statusMessage}</p>
      </div>
      {loadError && (
        <button
          type="button"
          onClick={() => {
            setLoadError(null);
            setAttempt(current => current + 1);
          }}
          className="mt-2 rounded border border-emerald-500/40 px-4 py-2 text-sm hover:bg-emerald-500/10 active:scale-95"
        >
          Coba Lagi
        </button>
      )}
    </main>
  );
}
