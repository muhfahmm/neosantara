export interface CountryProfileSummary {
  id: number;
  country_slug: string;
  name_id: string;
  name_en: string;
  capital: string;
  jumlah_penduduk: number;
  anggaran: number;
  religion: string;
  ideology: string;
}

function isCountryProfileSummary(value: unknown): value is CountryProfileSummary {
  if (typeof value !== 'object' || value === null) return false;
  const summary = value as Record<string, unknown>;
  return typeof summary.id === 'number' &&
    typeof summary.country_slug === 'string' &&
    typeof summary.name_id === 'string' &&
    typeof summary.name_en === 'string' &&
    typeof summary.capital === 'string' &&
    typeof summary.jumlah_penduduk === 'number' &&
    typeof summary.anggaran === 'number' &&
    typeof summary.religion === 'string' &&
    typeof summary.ideology === 'string';
}

let countryProfileSummaries: CountryProfileSummary[] = [];
let countryProfileSummariesPromise: Promise<CountryProfileSummary[]> | null = null;
const COUNTRY_PROFILE_SUMMARIES_READY_EVENT = 'country_profile_summaries_ready';

export function getCountryProfileSummaries(): CountryProfileSummary[] {
  return countryProfileSummaries;
}

export function subscribeToCountryProfileSummaries(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(COUNTRY_PROFILE_SUMMARIES_READY_EVENT, onChange);
  return () => window.removeEventListener(COUNTRY_PROFILE_SUMMARIES_READY_EVENT, onChange);
}

export async function loadCountryProfileSummaries(): Promise<CountryProfileSummary[]> {
  if (countryProfileSummaries.length > 0) return countryProfileSummaries;
  if (countryProfileSummariesPromise) return countryProfileSummariesPromise;

  const request = fetch('/api/country-data?summary=true')
    .then(async response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const summaries: unknown = await response.json();
      if (
        !Array.isArray(summaries) ||
        summaries.length === 0 ||
        !summaries.every((summary: unknown) => isCountryProfileSummary(summary))
      ) {
        throw new Error('Country summary response contains invalid data');
      }
      setCountryProfileSummaries(summaries as CountryProfileSummary[]);
      return countryProfileSummaries;
    })
    .finally(() => {
      if (countryProfileSummariesPromise === request) {
        countryProfileSummariesPromise = null;
      }
    });

  countryProfileSummariesPromise = request;
  return request;
}

export function setCountryProfileSummaries(summaries: CountryProfileSummary[]) {
  countryProfileSummaries = summaries;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COUNTRY_PROFILE_SUMMARIES_READY_EVENT));
  }
}

export function getCountryProfileSummary(countryName: string | null | undefined) {
  const normalizedName = normalizeCountryName(countryName);
  if (!normalizedName) return null;

  return countryProfileSummaries.find(summary =>
    [
      summary.country_slug,
      summary.name_id,
      summary.name_en,
    ].some(name => normalizeCountryName(name) === normalizedName)
  ) || null;
}

function normalizeCountryName(value: string | null | undefined) {
  return value?.toLowerCase().replace(/[\s_-]+/g, '') || '';
}
