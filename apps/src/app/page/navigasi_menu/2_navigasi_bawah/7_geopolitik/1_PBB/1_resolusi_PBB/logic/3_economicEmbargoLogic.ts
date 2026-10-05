import {
  calculateCountryGDP,
  calculateCountryNetBalance
} from '@/app/logic/economic_logic/treasuryUpdater';
import {
  loadActiveResolutions
} from './resolusiPBBUILogic';
import {
  loadActiveSecurityCouncilItems
} from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic';
import { isPassedResolutionActive, normalizePbbCountryName } from './resolusiPBBUILogic';

const ECONOMIC_EMBARGO_REDUCTION = 0.6;

const MINING_RESOURCE_KEYS = new Set([
  'emas',
  'uranium',
  'batu_bara',
  'minyak_bumi',
  'gas_alam',
  'garam',
  'litium',
  'logam_tanah_jarang',
  'bijih_besi',
  'tembaga',
  'bauksit',
  'nikel'
]);

const MANUFACTURING_RESOURCE_KEYS = new Set([
  'semen_beton',
  'kayu',
  'pengolahan_daging',
  'pengolahan_susu',
  'pengolahan_ikan',
  'pengolahan_beras',
  'beras',
  'gula',
  'roti',
  'mie_instan',
  'minyak_goreng',
  'susu'
]);

export function isCountryUnderEconomicEmbargo(countryName: string): boolean {
  const target = normalizePbbCountryName(countryName);
  if (!target) return false;

  const assemblyEmbargo = loadActiveResolutions().some(item =>
    item.type === 'economic_embargo' &&
    normalizePbbCountryName(item.target.name) === target &&
    isPassedResolutionActive(item)
  );
  if (assemblyEmbargo) return true;

  return loadActiveSecurityCouncilItems().some(item =>
    (item.type === 'economic' || item.type === 'full') &&
    normalizePbbCountryName(item.target.name) === target &&
    isPassedResolutionActive(item)
  );
}

function getCountryName(countryDetail: Record<string, unknown>, providedName?: string): string {
  const name = providedName ||
    countryDetail.country ||
    countryDetail.nama_negara ||
    countryDetail.country_name ||
    countryDetail.name_id ||
    countryDetail.name;
  return typeof name === 'string' ? name : '';
}

export function isEconomicEmbargoProductionResource(resourceKey: string): boolean {
  return resourceKey.startsWith('pabrik_') ||
    resourceKey.startsWith('tambang_') ||
    MINING_RESOURCE_KEYS.has(resourceKey) ||
    MANUFACTURING_RESOURCE_KEYS.has(resourceKey);
}

export function getEconomicEmbargoProductionMultiplier(
  countryName: string,
  resourceKey: string
): number {
  return isEconomicEmbargoProductionResource(resourceKey) &&
    isCountryUnderEconomicEmbargo(countryName)
    ? 1 - ECONOMIC_EMBARGO_REDUCTION
    : 1;
}

export function getEconomicEmbargoIncomeMultiplier(countryName: string): number {
  return isCountryUnderEconomicEmbargo(countryName)
    ? 1 - ECONOMIC_EMBARGO_REDUCTION
    : 1;
}

export function applyEconomicEmbargoToIncome(income: number, countryName: string): number {
  return income * getEconomicEmbargoIncomeMultiplier(countryName);
}

export function calculateNetBalanceWithEconomicEmbargo(
  countryDetail: Record<string, unknown>,
  countryName?: string
): number {
  if (!countryDetail || typeof countryDetail !== 'object') return 0;
  const targetCountry = getCountryName(countryDetail, countryName);
  const income = calculateCountryGDP(countryDetail);
  const baseNetBalance = calculateCountryNetBalance(countryDetail);
  const expenses = income - baseNetBalance;
  return applyEconomicEmbargoToIncome(income, targetCountry) - expenses;
}
