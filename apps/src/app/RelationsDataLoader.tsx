'use client';

import { useEffect, useState } from 'react';
import { setBaseRelationData, type BaseRelationRow } from '../../../json/4_database_hubungan_antar_negara/relationsRegistry';
import { setEmbassyData, type EmbassyDataRow } from '../../../json/6_database_kedutaan_besar/embassyRegistry';
import { setTradeAgreementData, type TradeAgreementDataRow } from '../../../json/9_database_mitra_perdagangan/tradeAgreementRegistry';
import { setBuildingMetadata, type BuildingMetadata } from '@/lib/buildingMetadataRegistry';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isBaseRelationRow(value: unknown): value is BaseRelationRow {
  return isRecord(value) &&
    typeof value.country_slug === 'string' &&
    typeof value.target_country === 'string' &&
    typeof value.relation === 'number' &&
    Number.isInteger(value.relation) &&
    value.relation >= 0 &&
    value.relation <= 100;
}

function isEmbassyDataRow(value: unknown): value is EmbassyDataRow {
  return isRecord(value) &&
    typeof value.country_slug === 'string' &&
    typeof value.mitra_country === 'string' &&
    typeof value.embassy_type === 'string' &&
    typeof value.status === 'string';
}

function isTradeAgreementDataRow(value: unknown): value is TradeAgreementDataRow {
  return isRecord(value) &&
    typeof value.country_slug === 'string' &&
    typeof value.mitra_no === 'number' &&
    Number.isInteger(value.mitra_no) &&
    typeof value.mitra_country === 'string' &&
    typeof value.trade_type === 'string' &&
    typeof value.status === 'string';
}

function isBuildingMetadata(value: unknown): value is BuildingMetadata {
  return isRecord(value) && Object.keys(value).length > 0 && Object.values(value).every(isRecord);
}

async function fetchEndpoint<T>(
  url: string,
  validate: (value: unknown) => value is T,
): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const errorMessage =
      isRecord(payload) && typeof payload.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(`${url}: ${errorMessage}`);
  }
  if (!validate(payload)) {
    throw new Error(`Invalid response from ${url}`);
  }
  return payload;
}

const isNonEmptyArray = <T,>(
  value: unknown,
  validate: (item: unknown) => item is T,
): value is T[] => Array.isArray(value) && value.length > 0 && value.every(validate);

export default function RelationsDataLoader({ children }: { children: React.ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRelationData() {
      try {
        const [relations, embassies, tradeAgreements, buildingMetadata] = await Promise.all([
          fetchEndpoint('/api/relations-data', (value): value is BaseRelationRow[] =>
            isNonEmptyArray(value, isBaseRelationRow)),
          fetchEndpoint('/api/embassy-data', (value): value is EmbassyDataRow[] =>
            isNonEmptyArray(value, isEmbassyDataRow)),
          fetchEndpoint('/api/trade-agreement-data', (value): value is TradeAgreementDataRow[] =>
            isNonEmptyArray(value, isTradeAgreementDataRow)),
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
          setLoadError('Data awal permainan gagal dimuat dari database.');
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
      <p>{loadError ?? 'Memuat data permainan dari database...'}</p>
      {loadError && (
        <button
          type="button"
          onClick={() => {
            setLoadError(null);
            setAttempt(current => current + 1);
          }}
          className="rounded border border-emerald-500/40 px-4 py-2 text-sm hover:bg-emerald-500/10"
        >
          Coba lagi
        </button>
      )}
    </main>
  );
}
