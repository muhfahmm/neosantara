export interface TaxPopulationRates {
  income_tax?: number;
  corporate_tax?: number;
  vat?: number;
  cigarette_tax?: number;
  environment_tax?: number;
}

export interface TaxPopulationImpact {
  burden: number;
  threshold: number;
  monthlyModifierPercent: number;
}

const finiteRate = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(100, value));
};

const getNestedRate = (
  detail: Record<string, unknown>,
  key: string,
  nestedKey: string,
): number | undefined => {
  const taxes = detail.pajak;
  if (taxes && typeof taxes === 'object') {
    const nestedTax = (taxes as Record<string, unknown>)[nestedKey];
    if (nestedTax && typeof nestedTax === 'object') {
      const rate = finiteRate((nestedTax as Record<string, unknown>).tarif);
      if (rate !== undefined) return rate;
    }
  }
  return finiteRate(detail[key]);
};

const normalizeIdeology = (ideology: unknown): string =>
  String(ideology || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function calculateTaxPopulationImpact(
  detail: Record<string, unknown> | null | undefined,
  rates?: TaxPopulationRates,
): TaxPopulationImpact {
  const countryDetail = detail ?? {};
  const incomeTax = finiteRate(rates?.income_tax) ??
    getNestedRate(countryDetail, 'income_tax', 'penghasilan') ?? 0;
  const vat = finiteRate(rates?.vat) ??
    getNestedRate(countryDetail, 'ppn', 'ppn') ?? 0;
  const corporateTax = finiteRate(rates?.corporate_tax) ??
    getNestedRate(countryDetail, 'corporate', 'korporasi') ?? 0;
  const cigaretteTax = finiteRate(rates?.cigarette_tax) ??
    getNestedRate(countryDetail, 'cigarette_tax', 'bea_cukai') ?? 0;
  const environmentTax = finiteRate(rates?.environment_tax) ??
    getNestedRate(countryDetail, 'environment_tax', 'lingkungan') ?? 0;

  const burden =
    incomeTax * 0.4 +
    vat * 0.3 +
    corporateTax * 0.15 +
    cigaretteTax * 0.1 +
    environmentTax * 0.05;

  const ideology = normalizeIdeology(countryDetail.ideology);
  const threshold =
    ideology === 'sosialis' || ideology === 'sosialisme' ||
    ideology === 'socialist' || ideology === 'socialism'
      ? 35
      : ideology === 'kapitalis' || ideology === 'kapitalisme' ||
          ideology === 'capitalist' || ideology === 'capitalism'
        ? 15
        : 25;
  const difference = burden - threshold;
  const monthlyModifierPercent = difference > 0
    ? -(difference * 0.05)
    : Math.min(0.5, Math.abs(difference) * 0.02);

  return { burden, threshold, monthlyModifierPercent };
}
