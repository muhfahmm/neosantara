export interface ResourceLootNewsData {
  id: string;
  type: 'pengambilan_sda';
  attackerCountry: string;
  attackerIso: string;
  targetCountry: string;
  targetIso: string;
  lootedCash: number;
  lootedResources: Record<string, number>;
  headline: string;
  content: string;
  timestamp: string;
  dateStr: string;
}

export interface CountryAssetState {
  countryName: string;
  cash: number;
  resources: Record<string, number>;
}

export interface AssetTransferResult {
  updatedAttacker: CountryAssetState;
  updatedTarget: CountryAssetState;
  transferredCash: number;
  transferredResources: Record<string, number>;
}

/**
 * Menangani skenario kemenangan invasi tanpa aneksasi wilayah (perampasan kas & SDA).
 */
export function generateResourceLootNews(
  attackerCountry: string,
  attackerIso: string,
  targetCountry: string,
  targetIso: string,
  lootedCash: number,
  lootedResources: Record<string, number>,
  dateStr: string
): ResourceLootNewsData {
  const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formattedCash = new Intl.NumberFormat('id-ID').format(lootedCash);
  const resourceSummary = Object.entries(lootedResources)
    .filter(([_, qty]) => qty > 0)
    .map(([res, qty]) => `${res}: +${qty.toLocaleString('id-ID')}`)
    .join(', ');

  const headline = `💰 PERAMPASAN ASET: ${attackerCountry} Merampas Kas & SDA ${targetCountry}!`;
  const content = `Invasi kilat berhasil! Pasukan ${attackerCountry} menaklukkan fasilitas vital ${targetCountry} tanpa mencaplok wilayah. Seluruh simpanan kas sebesar ${formattedCash} NEO serta cadangan Sumber Daya Alam (${resourceSummary || 'SDA Strategis'}) milik ${targetCountry} telah disita dan dipindahkan sepenuhnya ke perbendaharaan ${attackerCountry}.`;

  return {
    id: `news-loot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'pengambilan_sda',
    attackerCountry,
    attackerIso,
    targetCountry,
    targetIso,
    lootedCash,
    lootedResources,
    headline,
    content,
    timestamp,
    dateStr
  };
}

/**
 * Mengintegrasikan kalkulasi perpindahan total aset kas dan SDA dari state negara target ke negara penyerang.
 */
export function transferAssetsBetweenCountries(
  attackerState: CountryAssetState,
  targetState: CountryAssetState
): AssetTransferResult {
  const transferredCash = Math.max(0, targetState.cash);
  const transferredResources: Record<string, number> = {};

  const updatedTargetResources = { ...targetState.resources };
  const updatedAttackerResources = { ...attackerState.resources };

  Object.keys(updatedTargetResources).forEach((resourceKey) => {
    const amount = Math.max(0, updatedTargetResources[resourceKey] || 0);
    if (amount > 0) {
      transferredResources[resourceKey] = amount;
      updatedAttackerResources[resourceKey] = (updatedAttackerResources[resourceKey] || 0) + amount;
      updatedTargetResources[resourceKey] = 0;
    }
  });

  const updatedAttacker: CountryAssetState = {
    ...attackerState,
    cash: attackerState.cash + transferredCash,
    resources: updatedAttackerResources
  };

  const updatedTarget: CountryAssetState = {
    ...targetState,
    cash: 0,
    resources: updatedTargetResources
  };

  return {
    updatedAttacker,
    updatedTarget,
    transferredCash,
    transferredResources
  };
}
