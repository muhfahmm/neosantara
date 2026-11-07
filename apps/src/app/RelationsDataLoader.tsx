'use client';

import { useEffect, useState } from 'react';
import { setBaseRelationData, type BaseRelationRow } from '../../../json/4_database_hubungan_antar_negara/relationsRegistry';
import { setEmbassyData, type EmbassyDataRow } from '../../../json/6_database_kedutaan_besar/embassyRegistry';
import { setTradeAgreementData, type TradeAgreementDataRow } from '../../../json/9_database_mitra_perdagangan/tradeAgreementRegistry';
import { setBuildingMetadata, type BuildingMetadata } from '@/lib/buildingMetadataRegistry';
import { resolveApiUrl, patchGlobalFetch } from '@/lib/apiHelper';

if (typeof window !== 'undefined') {
  patchGlobalFetch();
}

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

async function fetchEndpoint<T>(
  url: string,
  validate: (value: unknown) => value is T,
): Promise<T> {
  const targetUrl = resolveApiUrl(url);
  const response = await fetch(targetUrl, { cache: 'no-store' });
  const contentType = response.headers.get('content-type');
  let payload: unknown;
  try {
    payload = JSON.parse(await response.text());
  } catch {
    const responseMessage = response.ok
      ? 'Response was not valid JSON'
      : `Request failed with status ${response.status}`;
    const contentTypeMessage = contentType ? ` (${contentType})` : '';
    throw new Error(`${url}: ${responseMessage}${contentTypeMessage}`);
  }

  if (!response.ok) {
    const errorMessage =
      isRecord(payload) && typeof payload.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(`${url}: ${errorMessage}`);
  }
  if (!validate(payload)) {
    throw new Error(`Invalid response format from ${url}`);
  }
  return payload;
}

const isFastArray = <T,>(
  value: unknown,
  sampleValidator: (item: unknown) => item is T,
): value is T[] => Array.isArray(value) && value.length > 0 && sampleValidator(value[0]);

export default function RelationsDataLoader({ children }: { children: React.ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('Menghubungkan ke database...');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRelationData() {
      try {
        if (isMounted) setStatusMessage('Memuat data permainan dari database...');
        const [relations, embassies, tradeAgreements, buildingMetadata] = await Promise.all([
          fetchEndpoint('/api/relations-data', (value): value is BaseRelationRow[] =>
            isFastArray(value, isBaseRelationRow)
          ),
          fetchEndpoint('/api/embassy-data', (value): value is EmbassyDataRow[] =>
            isFastArray(value, isEmbassyDataRow)
          ),
          fetchEndpoint('/api/trade-agreement-data', (value): value is TradeAgreementDataRow[] =>
            isFastArray(value, isTradeAgreementDataRow)
          ),
          fetchEndpoint('/api/building-metadata', isBuildingMetadata),
        ]);

        setBaseRelationData(relations);
        setEmbassyData(embassies);
        setTradeAgreementData(tradeAgreements);
        setBuildingMetadata(buildingMetadata);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('country_relations_updated'));
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
