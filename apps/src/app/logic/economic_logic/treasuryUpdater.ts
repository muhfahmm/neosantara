import { calculateIncomeAtRate } from './2_tax_logic/taxLogic';
import { calculateGoldMiningDailyProduction } from './goldIncome';
import { KEMENTERIAN, KEAMANAN, LAYANAN, Department, getDailyMinistryCost } from './departments';
import { INITIAL_SUBSIDY_ITEMS, calculateSubsidySummary } from "@/../../json/database_kebijakan_subsidi/index";

const getNestedValue = (obj: any, path: string[]) => {
  return path.reduce((current, key) => {
    if (current == null || typeof current !== 'object') return undefined;
    return current[key];
  }, obj);
};

const toNumber = (value: any, fallback: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const getTaxRate = (detail: any, key: string, fallback: number, legacyPath: string[]) => {
  const value = getNestedValue(detail, [key]) ?? getNestedValue(detail, legacyPath);
  return toNumber(value, fallback);
};

export const getTourismTotalIncome = (detail: any): number => {
  if (!detail || typeof detail !== 'object') return 0;
  if (typeof detail.total_wisata_penghasilan === 'number') return detail.total_wisata_penghasilan;
  if (typeof detail.wisata_penghasilan === 'number') return detail.wisata_penghasilan;
  
  if (Array.isArray(detail.tempat_wisata)) {
    return detail.tempat_wisata.reduce((sum: number, item: any) => sum + (Number(item?.penghasilan) || 0), 0);
  }
  if (Array.isArray(detail.wisata_items)) {
    return detail.wisata_items.reduce((sum: number, item: any) => sum + (Number(item?.penghasilan) || 0), 0);
  }
  return 0;
};

export const calculateTotalTaxIncome = (detail: any) => {
  if (!detail || typeof detail !== 'object') return 0;

  const ppnRate = getTaxRate(detail, 'tarif_ppn', 10, ['pajak', 'ppn', 'tarif']);
  const korporasiRate = getTaxRate(detail, 'tarif_korporasi', 22, ['pajak', 'korporasi', 'tarif']);
  const penghasilanRate = getTaxRate(detail, 'tarif_penghasilan', 15, ['pajak', 'penghasilan', 'tarif']);
  const beaCukaiRate = getTaxRate(detail, 'tarif_bea_cukai', 5, ['pajak', 'bea_cukai', 'tarif']);
  const lingkunganRate = getTaxRate(detail, 'tarif_lingkungan', 5, ['pajak', 'lingkungan', 'tarif']);

  const ppnIncome = calculateIncomeAtRate(ppnRate, 500);
  const korporasiIncome = calculateIncomeAtRate(korporasiRate, 500);
  const penghasilanIncome = calculateIncomeAtRate(penghasilanRate, 500);
  const beaCukaiIncome = calculateIncomeAtRate(beaCukaiRate, 200);
  const lingkunganIncome = calculateIncomeAtRate(lingkunganRate, 200);

  return ppnIncome + korporasiIncome + penghasilanIncome + beaCukaiIncome + lingkunganIncome;
};

export const getDepartmentLevel = (detail: any, dept: Department): number => {
  if (!detail || typeof detail !== 'object') return 1;
  const key = dept.id.replace(/-/g, '_');
  const fieldName = KEMENTERIAN.some(k => k.id === dept.id) ? `kem_${key}` :
                    KEAMANAN.some(k => k.id === dept.id) ? `keamanan_${key}` :
                    `layanan_${key}`;
  const val = detail[fieldName] ?? detail[`level_${key}`] ?? detail[key] ?? getNestedValue(detail, ['kabinet', fieldName]);
  return toNumber(val, 1);
};

export const calculateTotalMinistryCostPerDay = (detail: any) => {
  if (!detail || typeof detail !== 'object') return 0;

  const allDepts: Department[] = [...KEMENTERIAN, ...KEAMANAN, ...LAYANAN];
  return allDepts.reduce((total, dept) => {
    const level = getDepartmentLevel(detail, dept);
    return total + getDailyMinistryCost(level);
  }, 0);
};

export const calculateTotalPDB = (detail: any) => {
  if (!detail || typeof detail !== 'object') return 0;
  const totalTaxIncome = calculateTotalTaxIncome(detail);
  const goldIncome = calculateGoldMiningDailyProduction(detail);
  const tourismIncome = getTourismTotalIncome(detail);
  return totalTaxIncome + goldIncome + tourismIncome;
};

export const calculateActiveSubsidyCost = (detail: any) => {
  if (!detail || typeof detail !== 'object') return 0;
  if (typeof detail?.total_subsidy_cost === 'number') {
    return detail.total_subsidy_cost;
  }
  const subsidyStates = detail?.subsidy_states as Record<string, boolean> | undefined;
  const items = INITIAL_SUBSIDY_ITEMS.map((item) => {
    const isSub = subsidyStates
      ? (subsidyStates[item.id] ?? item.isSubsidized)
      : (detail[item.id] ?? detail[item.id.toLowerCase()] ?? item.isSubsidized);
    const normalizedIsSub = (isSub === 0 || isSub === "0" || isSub === false || isSub === "false") ? false : Boolean(isSub);
    return { ...item, isSubsidized: normalizedIsSub };
  });
  return calculateSubsidySummary(items).totalCost;
};

export const calculateCountryNetBalance = (detail: any) => {
  if (!detail || typeof detail !== 'object') return 0;
  const totalTaxIncome = calculateTotalTaxIncome(detail);
  const goldUnits = calculateGoldMiningDailyProduction(detail);
  const goldIncome = goldUnits; // use production units (from metadata), do not multiply by price
  const tourismIncome = getTourismTotalIncome(detail);
  const ministryCost = calculateTotalMinistryCostPerDay(detail);
  const subsidyCost = calculateActiveSubsidyCost(detail);
  return totalTaxIncome + goldIncome + tourismIncome - ministryCost - subsidyCost;
};

export const calculateGoldIncome = calculateGoldMiningDailyProduction;
export const calculateMinistryCost = calculateTotalMinistryCostPerDay;

export const formatCurrencyEM = (amount: number) => {
  return `${Math.round(amount).toLocaleString('id-ID')} NEO`;
};
