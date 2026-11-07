export interface TradeAgreement {
  no: number;
  mitra: string;
  type: string;
  status: string;
}

export interface TradeAgreementDataRow {
  country_slug: string;
  mitra_no: number;
  mitra_country: string;
  trade_type: string;
  status: string;
}

const normalizeSlug = (name?: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

let tradeAgreementMap: Record<string, TradeAgreement[]> = {};

export function setTradeAgreementData(rows: TradeAgreementDataRow[]): void {
  const nextTradeAgreementMap: Record<string, TradeAgreement[]> = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row && row.country_slug && row.mitra_country) {
      const slug = row.country_slug;
      (nextTradeAgreementMap[slug] ??= []).push({
        no: row.mitra_no || 1,
        mitra: row.mitra_country,
        type: row.trade_type || 'Perdagangan',
        status: row.status || 'Aktif',
      });
    }
  }

  if (rows.length === 0) {
    throw new Error('database_mitra_perdagangan returned no rows');
  }

  Object.values(nextTradeAgreementMap).forEach(agreements => {
    agreements.sort((a, b) => a.no - b.no);
  });
  tradeAgreementMap = nextTradeAgreementMap;
}

/**
 * Returns array of country names that have active trade agreements with the target country.
 */
export function getTradePartnersForCountry(countryName?: string): string[] {
  if (!countryName) return [];
  const slug = normalizeSlug(countryName);
  return (tradeAgreementMap[slug] || [])
    .filter(agreement => agreement.status.toLowerCase() === 'aktif')
    .map(agreement => agreement.mitra);
}

/**
 * Returns structured trade agreement records.
 */
export function getTradeAgreementsForCountry(countryName?: string): TradeAgreement[] {
  if (!countryName) return [];
  return (tradeAgreementMap[normalizeSlug(countryName)] || [])
    .filter(agreement => agreement.status.toLowerCase() === 'aktif');
}

export default getTradeAgreementsForCountry;
