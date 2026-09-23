// Logic helper for Kedutaan Besar actions
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

/**
 * Check whether playerCountry has a trade agreement with viewedCountry.
 * If playerCountryName is not provided, falls back to checking whether viewedCountry
 * has any agreements at all (legacy behavior).
 */
export const countryHasTradePartners = (
  viewedCountryName?: string | null,
  playerCountryName?: string | null,
  removedTradePartners?: string[]
): boolean => {
  if (!viewedCountryName) return false;

  const normViewed = normalizeName(viewedCountryName);
  if (Array.isArray(removedTradePartners) && removedTradePartners.some(r => normalizeName(r) === normViewed)) {
    return false;
  }

  try {
    // If player country provided, check player's agreements for a matching mitra
    if (playerCountryName) {
      const playerAgreements: TradeAgreement[] = getTradeAgreementsForCountry(playerCountryName);
      if (!Array.isArray(playerAgreements) || playerAgreements.length === 0) return false;

      return playerAgreements.some(a => normalizeName(a.mitra) === normViewed);
    }

    // Fallback: check whether the viewed country has any agreements at all
    const agreements: TradeAgreement[] = getTradeAgreementsForCountry(viewedCountryName);
    return Array.isArray(agreements) && agreements.length > 0;
  } catch (e) {
    console.error('kedutaanBesarLogic: failed to check trade partners', e);
    return false;
  }
};

export const playerHasEmbassyWith = (viewedCountryName?: string | null, playerEmbassies?: any[]): boolean => {
  if (!viewedCountryName || !Array.isArray(playerEmbassies) || playerEmbassies.length === 0) return false;
  const normViewed = normalizeName(viewedCountryName);
  return playerEmbassies.some((embassy) => normalizeName(embassy?.mitra) === normViewed);
};

export const playerHasEmbassyOrTradePartners = (
  viewedCountryName?: string | null,
  playerCountryName?: string | null,
  playerEmbassies?: any[],
  removedEmbassies?: string[],
  removedTradePartners?: string[]
): boolean => {
  if (!viewedCountryName) return false;
  const normViewed = normalizeName(viewedCountryName);
  if (Array.isArray(removedEmbassies) && removedEmbassies.some(r => normalizeName(r) === normViewed)) {
    return false;
  }

  return (
    playerHasEmbassyWith(viewedCountryName, playerEmbassies) ||
    countryHasTradePartners(viewedCountryName, playerCountryName, removedTradePartners)
  );
};

export const getEmbassyButtonLabel = (
  viewedCountryName?: string | null,
  playerCountryName?: string | null,
  playerEmbassies?: any[],
  removedEmbassies?: string[],
  removedTradePartners?: string[]
): string => {
  return playerHasEmbassyOrTradePartners(viewedCountryName, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners)
    ? 'Hancurkan Kedutaan'
    : 'Bangun Kedutaan';
};

export const getEmbassyButtonClass = (
  viewedCountryName?: string | null,
  playerCountryName?: string | null,
  playerEmbassies?: any[],
  removedEmbassies?: string[],
  removedTradePartners?: string[]
): string => {
  if (playerHasEmbassyOrTradePartners(viewedCountryName, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners)) {
    return 'border-2 border-[#00FFAA] bg-[#00FFAA]/20 text-[#00FFAA] hover:bg-[#00FFAA]/30';
  }
  return 'bg-[#0A1A1A] border border-[#00FFAA]/20 text-[#00FFAA]';
};

export default {
  countryHasTradePartners,
  getEmbassyButtonLabel,
  getEmbassyButtonClass,
};

