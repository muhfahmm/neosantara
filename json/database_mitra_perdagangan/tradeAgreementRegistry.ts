// tradeAgreementRegistry.ts - registry for trade agreements loaded from tradeAgreementData.json
import tradeAgreementData from './tradeAgreementData.json';

export interface TradeAgreement {
  no: number;
  mitra: string;
  type: string;
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

const tradeAgreementMap: Record<string, string[]> = tradeAgreementData as Record<string, string[]>;

/**
 * Returns array of country names that have active trade agreements with the target country.
 */
export function getTradePartnersForCountry(countryName?: string): string[] {
  if (!countryName) return [];
  const slug = normalizeSlug(countryName);
  return tradeAgreementMap[slug] || [];
}

/**
 * Returns structured trade agreement records.
 */
export function getTradeAgreementsForCountry(countryName?: string): TradeAgreement[] {
  const mitras = getTradePartnersForCountry(countryName);
  return mitras.map((mitra, index) => ({
    no: index + 1,
    mitra,
    type: 'Perdagangan',
    status: 'Aktif',
  }));
}

export default getTradeAgreementsForCountry;
