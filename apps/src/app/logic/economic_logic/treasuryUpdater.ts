import { calculateIncomeAtRate } from './2_tax_logic/taxLogic';
import { calculateGoldMiningDailyProduction } from './goldIncome';
import { KEMENTERIAN, KEAMANAN, LAYANAN, Department } from './departments';
import { INITIAL_SUBSIDY_ITEMS, calculateSubsidySummary } from '../../page/navigasi_menu/2_navigasi_bawah/4_ekonomi/8_kebijakan_subsidi/logic/logikaSubsidi';

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

export const calculateTotalTaxIncome = (detail: any) => {
  const incomeTax = getTaxRate(detail, 'income_tax', 15, ['pajak', 'penghasilan', 'tarif']);
  const corporateTax = getTaxRate(detail, 'corporate', 22, ['pajak', 'korporasi', 'tarif']);
  const vat = getTaxRate(detail, 'ppn', 10, ['pajak', 'ppn', 'tarif']);
  const cigaretteTax = getTaxRate(detail, 'cigarette_tax', 15, ['pajak', 'bea_cukai', 'tarif']);
  const environmentTax = getTaxRate(detail, 'environment_tax', 5, ['pajak', 'lingkungan', 'tarif']);

  return (
    calculateIncomeAtRate(incomeTax, 1000) +
    calculateIncomeAtRate(corporateTax, 1000) +
    calculateIncomeAtRate(vat, 1000) +
    calculateIncomeAtRate(cigaretteTax, 1000) +
    calculateIncomeAtRate(environmentTax, 1000)
  );
};

export const getDepartmentLevel = (detail: any, deptOrId: Department | string): number => {
  if (!detail || typeof detail !== 'object') return 1;
  const deptId = typeof deptOrId === 'string' ? deptOrId : deptOrId.id;
  const cleanId = deptId.replace(/-/g, '_');
  const noLayanan = cleanId.replace(/^layanan_/, '');
  const noKem = cleanId.replace(/^kem_/, '');
  const noKeam = cleanId.replace(/^keamanan_/, '');

  const candidates = [
    `level_${deptId}`,
    `level_${cleanId}`,
    `level_${noLayanan}`,
    `level_${noKem}`,
    `level_${noKeam}`,
    `kem_${cleanId}`,
    `keamanan_${cleanId}`,
    `layanan_${cleanId}`,
    `layanan_${noLayanan}`,
    `keamanan_${noKeam}`,
    cleanId,
    deptId
  ];

  for (const k of candidates) {
    if (detail[k] !== undefined && detail[k] !== null && detail[k] !== '') {
      const val = Number(detail[k]);
      if (!isNaN(val) && val > 0) return val;
    }
  }
  return 1;
};

const calculateMinistryDailyIncome = (level: number) => {
  const LEVEL_UP_COST = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  return LEVEL_UP_COST[level] ?? 100;
};

export const calculateTotalMinistryCostPerDay = (detail: any) => {
  if (!detail || typeof detail !== 'object') return 0;

  const departments = [...KEMENTERIAN, ...KEAMANAN, ...LAYANAN];
  return departments.reduce((total, dept) => {
    const level = getDepartmentLevel(detail, dept);
    return total + calculateMinistryDailyIncome(level);
  }, 0);
};

export const calculateCountryGDP = (detail: any) => {
  if (!detail || typeof detail !== 'object') return 0;
  const totalTaxIncome = calculateTotalTaxIncome(detail);
  const goldIncome = calculateGoldMiningDailyProduction(detail);
  return totalTaxIncome + goldIncome;
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
  const ministryCost = calculateTotalMinistryCostPerDay(detail);
  const subsidyCost = calculateActiveSubsidyCost(detail);
  return totalTaxIncome + goldIncome - ministryCost - subsidyCost;
};

export const calculateGoldIncome = calculateGoldMiningDailyProduction;
export const calculateMinistryCost = calculateTotalMinistryCostPerDay;

export const formatCurrencyEM = (amount: number) => {
  return `${Math.round(amount).toLocaleString('id-ID')} EM`;
};
