const normalizeCountryName = (value: unknown) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/g, '');

// Data map uses some English names while other game data uses Indonesian names.
const INDONESIAN_COUNTRY_NAMES: Record<string, string> = {
  afghanistan: 'Afganistan', algeria: 'Aljazair', brazil: 'Brasil',
  cambodia: 'Kamboja', cameroon: 'Kamerun', canada: 'Kanada', czechrepublic: 'Ceko',
  democraticrepublicofthecongo: 'Republik Demokratik Kongo', egypt: 'Mesir',
  france: 'Prancis', germany: 'Jerman', greece: 'Yunani', hungary: 'Hungaria',
  iceland: 'Islandia', ireland: 'Irlandia', italy: 'Italia', japan: 'Jepang',
  netherlands: 'Belanda', newzealand: 'Selandia Baru', philippines: 'Filipina',
  republicofthecongo: 'Republik Kongo', russia: 'Rusia', saudiarabia: 'Arab Saudi',
  southafrica: 'Afrika Selatan', southkorea: 'Korea Selatan', spain: 'Spanyol',
  sweden: 'Swedia', switzerland: 'Swiss', syria: 'Suriah', turkey: 'Turki',
  unitedarabemirates: 'Uni Emirat Arab', unitedkingdom: 'Inggris',
  unitedstates: 'Amerika Serikat', unitedstatesofamerica: 'Amerika Serikat',
};

export function getDisplayCountryName(value: unknown): string {
  const rawName = String(value || '').trim();
  return INDONESIAN_COUNTRY_NAMES[normalizeCountryName(rawName)] || rawName;
}
