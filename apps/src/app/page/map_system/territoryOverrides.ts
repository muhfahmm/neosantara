export interface TerritoryOverride {
  sovereignCountry: string;
  sovereignIso: string;
}

export const TERRITORY_OVERRIDES: Record<string, TerritoryOverride> = {
  'vg:britishvirginislands': { sovereignCountry: 'inggris', sovereignIso: 'gb' },
  'vi:christiansted': { sovereignCountry: 'amerika serikat', sovereignIso: 'us' },
  'mf:stmartin': { sovereignCountry: 'prancis', sovereignIso: 'fr' },
  'sx:sintmaarten': { sovereignCountry: 'belanda', sovereignIso: 'nl' },
  'ai:eastend': { sovereignCountry: 'inggris', sovereignIso: 'gb' },
  'ms:saintpeter': { sovereignCountry: 'inggris', sovereignIso: 'gb' },
  'aw:oranjestad': { sovereignCountry: 'belanda', sovereignIso: 'nl' },
};
