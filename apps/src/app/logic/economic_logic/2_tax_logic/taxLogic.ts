/**
 * Tax Logic Module
 * 
 * Tax calculation logic with satisfaction impact analysis.
 * All monetary values are in NEO currency.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TaxConfig {
  id: string;
  name: string;
  baseRate: number;
  minRate: number;
  maxRate: number;
  maxIncome: number; // Maximum income at 100% rate
}

export interface TaxBreakdown {
  taxName: string;
  currentRate: number;
  incomeAtCurrentRate: number;
  incomeAtMaxRate: number;
  difference: number;
}

export interface TaxCalculationResult {
  totalIncome: number;
  breakdown: TaxBreakdown[];
  totalAtMaxRate: number;
  satisfactionImpact: number;
}

// ============================================================================
// TAX CONFIGURATION
// ============================================================================

export const TAX_CONFIGS: TaxConfig[] = [
  {
    id: "income_tax",
    name: "Pajak Penghasilan Pribadi",
    baseRate: 15,
    minRate: 0,
    maxRate: 100,
    maxIncome: 500
  },
  {
    id: "corporate_tax",
    name: "Pajak Korporasi",
    baseRate: 22,
    minRate: 0,
    maxRate: 100,
    maxIncome: 500
  },
  {
    id: "vat",
    name: "Pajak Pertambahan Nilai (PPN)",
    baseRate: 10,
    minRate: 0,
    maxRate: 100,
    maxIncome: 500
  },
  {
    id: "cigarette_tax",
    name: "Cukai",
    baseRate: 15,
    minRate: 0,
    maxRate: 100,
    maxIncome: 500
  },
  {
    id: "environment_tax",
    name: "Pajak Lingkungan",
    baseRate: 5,
    minRate: 0,
    maxRate: 100,
    maxIncome: 500
  }
];

// ============================================================================
// TAX CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate income for a specific tax rate
 * @param taxRate - Tax rate percentage (0-100)
 * @param maxIncome - Maximum income at 100% rate
 * @returns Income amount in NEO
 */
export function calculateIncomeAtRate(taxRate: number, maxIncome: number = 500): number {
  if (taxRate <= 0) return 0;
  if (taxRate >= 100) return maxIncome;
  
  // Linear calculation: rate% of maxIncome
  const income = (taxRate / 100) * maxIncome;
  return Math.round(income);
}

/**
 * Calculate total income from all taxes at current rates
 */
export function calculateTotalIncome(taxes: Record<string, number>): number {
  let total = 0;
  
  for (const config of TAX_CONFIGS) {
    const rate = taxes[config.id] || config.baseRate;
    total += calculateIncomeAtRate(rate, config.maxIncome);
  }
  
  return total;
}

/**
 * Calculate tax breakdown for each tax type
 */
export function calculateTaxBreakdown(taxes: Record<string, number>): TaxBreakdown[] {
  return TAX_CONFIGS.map(config => {
    const currentRate = taxes[config.id] || config.baseRate;
    const incomeAtCurrent = calculateIncomeAtRate(currentRate, config.maxIncome);
    const incomeAtMax = calculateIncomeAtRate(100, config.maxIncome);
    
    return {
      taxName: config.name,
      currentRate: currentRate,
      incomeAtCurrentRate: incomeAtCurrent,
      incomeAtMaxRate: incomeAtMax,
      difference: incomeAtMax - incomeAtCurrent
    };
  });
}

/**
 * Calculate satisfaction based on current tax rates
 * Satisfaction inversely correlates with average tax rate
 * Formula: satisfaction = 100 - (average tax rate across all taxes * 1)
 * @param taxRates - Object mapping tax IDs to their current rates
 * @param baseSatisfaction - Base satisfaction percentage (unused, for backward compatibility)
 * @returns Current satisfaction percentage (clamped 0-100)
 */
export function calculateSatisfactionFromRates(
  taxRates: Record<string, number>,
  baseSatisfaction: number = 100
): number {
  let totalTaxRate = 0;
  let taxCount = 0;
  
  for (const config of TAX_CONFIGS) {
    const rate = taxRates[config.id] ?? config.baseRate;
    totalTaxRate += rate;
    taxCount++;
  }
  
  // Calculate average tax rate
  const averageTaxRate = taxCount > 0 ? totalTaxRate / taxCount : 0;
  
  // Satisfaction = 100 - average tax rate
  // This way: 0% avg = 100% satisfaction, 50% avg = 50% satisfaction, 100% avg = 0% satisfaction
  const satisfaction = 100 - averageTaxRate;
  
  // Clamp to 0-100 range
  return Math.min(100, Math.max(0, satisfaction));
}

/**
 * Calculate satisfaction impact when changing a specific tax rate
 * @param currentTaxRates - Current tax rates object
 * @param taxId - The tax ID being changed
 * @param newRate - The new rate value
 * @param baseSatisfaction - Base satisfaction percentage
 * @returns New satisfaction percentage after the change
 */
export function calculateSatisfactionWithNewRate(
  currentTaxRates: Record<string, number>,
  taxId: string,
  newRate: number,
  baseSatisfaction: number = 100
): number {
  const updatedRates = { ...currentTaxRates, [taxId]: newRate };
  return calculateSatisfactionFromRates(updatedRates, baseSatisfaction);
}

/**
 * Calculate satisfaction color and label based on percentage
 */
export function getSatisfactionLevel(satisfaction: number): { color: string; label: string; bgColor: string } {
  if (satisfaction >= 90) {
    return { color: "text-green-600", label: "Sangat Hijau", bgColor: "#16a34a" };
  } else if (satisfaction >= 70) {
    return { color: "text-green-400", label: "Hijau", bgColor: "#4ade80" };
  } else if (satisfaction >= 50) {
    return { color: "text-yellow-500", label: "Kuning", bgColor: "#eab308" };
  } else if (satisfaction >= 30) {
    return { color: "text-red-500", label: "Merah", bgColor: "#ef4444" };
  } else {
    return { color: "text-red-700", label: "Sangat Merah", bgColor: "#b91c1c" };
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("id-ID") + " NEO";
}

/**
 * Format percentage for display
 */
export function formatPercent(rate: number): string {
  return rate + "%";
}
