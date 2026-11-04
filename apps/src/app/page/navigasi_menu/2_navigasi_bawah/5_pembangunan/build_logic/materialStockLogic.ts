export function getMaterialStock(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string,
  _metadata?: Record<string, unknown>,
): number {
  void _metadata;
  if (!countryDetail) return 0;
  const inventoryKey = `inventory_${resourceKey}`;
  const stock = countryDetail[inventoryKey];
  if (stock !== undefined && stock !== null) {
    return Number(stock) || 0;
  }
  return 0;
}
