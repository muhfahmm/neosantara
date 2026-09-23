// Logic helper for Perjanjian Dagang card in Detail Negara
import getTradeAgreementsForCountry from '../../../../../../../../json/database_mitra_perdagangan/tradeAgreementRegistry';

export type TradeAgreement = {
  no: number;
  mitra: string;
  type: string;
  status: string;
};

const normalizeName = (value?: string | null): string => {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

export const playerHasTradeWith = (
  viewedCountryName?: string | null,
  playerCountryName?: string | null,
  removedTradePartners?: string[]
): boolean => {
  if (!viewedCountryName || !playerCountryName) return false;
  const normViewed = normalizeName(viewedCountryName);
  if (Array.isArray(removedTradePartners) && removedTradePartners.some(r => normalizeName(r) === normViewed)) {
    return false;
  }
  try {
    const playerAgreements: TradeAgreement[] = getTradeAgreementsForCountry(playerCountryName);
    if (!Array.isArray(playerAgreements) || playerAgreements.length === 0) return false;
    return playerAgreements.some(a => normalizeName(a.mitra) === normViewed);
  } catch (e) {
    console.error('perjanjianDagangLogic: failed to check trade partners', e);
    return false;
  }
};

export const getTradeButtonClass = (
  viewedCountryName?: string | null,
  playerCountryName?: string | null,
  removedTradePartners?: string[]
): string => {
  if (playerHasTradeWith(viewedCountryName, playerCountryName, removedTradePartners)) {
    return 'border-2 border-[#00FFAA] bg-[#00FFAA]/20 text-[#00FFAA] hover:bg-[#00FFAA]/30';
  }
  return 'bg-[#0A1A1A] border border-[#00FFAA]/20 text-[#00FFAA]';
};

export const getTradeButtonLabel = (
  viewedCountryName?: string | null,
  playerCountryName?: string | null,
  removedTradePartners?: string[]
): string => {
  return playerHasTradeWith(viewedCountryName, playerCountryName, removedTradePartners) ? 'Putus Hubungan Dagang' : 'Perjanjian Dagang';
};

export default {
  playerHasTradeWith,
  getTradeButtonClass,
  getTradeButtonLabel,
};
