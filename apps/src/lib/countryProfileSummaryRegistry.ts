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

let countryProfileSummaries: CountryProfileSummary[] = [];

export function setCountryProfileSummaries(summaries: CountryProfileSummary[]) {
  countryProfileSummaries = summaries;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('country_profile_summaries_ready'));
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
