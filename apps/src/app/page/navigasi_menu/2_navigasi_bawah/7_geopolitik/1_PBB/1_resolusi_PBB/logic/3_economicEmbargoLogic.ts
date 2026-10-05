import {
  calculateCountryGDP,
  calculateCountryNetBalance,
  calculateGoldIncome
} from '@/app/logic/economic_logic/treasuryUpdater';
import {
  loadActiveResolutions
} from './resolusiPBBUILogic';
import {
  loadActiveSecurityCouncilItems
} from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic';
import { isPassedResolutionActive, normalizePbbCountryName } from './resolusiPBBUILogic';
import {
  getSecurityCouncilEconomicBlockadeMultiplier,
  isEconomicBlockadeProductionResource,
  isGoldResource
} from '../../2_keamanan_PBB/logic/3_blokadeEkonomi';
import { getSecurityCouncilNavalBlockadeMultiplier } from '../../2_keamanan_PBB/logic/4_blokadeLaut';
import { isCountryUnderFullBlockade } from '../../2_keamanan_PBB/logic/5_blokadePenuh';

const ECONOMIC_EMBARGO_REDUCTION = 0.6;

const MINING_RESOURCE_KEYS = new Set([
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

  return isCountryUnderFullBlockade(countryName) ||
    loadActiveSecurityCouncilItems().some(item =>
    item.type === 'economic' &&
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
  const normalizedKey = resourceKey.trim().toLowerCase();
  return !isGoldResource(normalizedKey) && (
    isEconomicBlockadeProductionResource(normalizedKey) ||
    MINING_RESOURCE_KEYS.has(normalizedKey) ||
    MANUFACTURING_RESOURCE_KEYS.has(normalizedKey)
  );
}

export function getEconomicEmbargoProductionMultiplier(
  countryName: string,
  resourceKey: string
): number {
  if (isGoldResource(resourceKey)) return 1;

  const target = normalizePbbCountryName(countryName);
  const activeAssemblyEmbargoCount = target ? loadActiveResolutions().filter(item =>
    item.type === 'economic_embargo' &&
    normalizePbbCountryName(item.target.name) === target &&
    isPassedResolutionActive(item)
  ).length : 0;
  const embargoMultiplier = isEconomicEmbargoProductionResource(resourceKey)
    ? (1 - ECONOMIC_EMBARGO_REDUCTION) ** activeAssemblyEmbargoCount
    : 1;

  const councilMultiplier = Math.min(
    getSecurityCouncilEconomicBlockadeMultiplier(countryName, resourceKey),
    getSecurityCouncilNavalBlockadeMultiplier(countryName, resourceKey)
  );
  return embargoMultiplier * councilMultiplier;
}

export function getEconomicEmbargoIncomeMultiplier(countryName: string): number {
  const target = normalizePbbCountryName(countryName);
  const activeAssemblyEmbargoCount = target ? loadActiveResolutions().filter(item =>
    item.type === 'economic_embargo' &&
    normalizePbbCountryName(item.target.name) === target &&
    isPassedResolutionActive(item)
  ).length : 0;
  return (1 - ECONOMIC_EMBARGO_REDUCTION) ** activeAssemblyEmbargoCount;
}

export function applyEconomicEmbargoToIncome(
  income: number,
  countryName: string,
  protectedGoldIncome = 0
): number {
  const goldIncome = Math.min(Math.max(0, protectedGoldIncome), Math.max(0, income));
  return goldIncome + (income - goldIncome) * getEconomicEmbargoIncomeMultiplier(countryName);
}

export function calculateNetBalanceWithEconomicEmbargo(
  countryDetail: Record<string, unknown>,
  countryName?: string
): number {
  if (!countryDetail || typeof countryDetail !== 'object') return 0;
  const targetCountry = getCountryName(countryDetail, countryName);
  const income = calculateCountryGDP(countryDetail);
  const goldIncome = calculateGoldIncome(countryDetail);
  const baseNetBalance = calculateCountryNetBalance(countryDetail);
  const expenses = income - baseNetBalance;
  return applyEconomicEmbargoToIncome(income, targetCountry, goldIncome) - expenses;
}
