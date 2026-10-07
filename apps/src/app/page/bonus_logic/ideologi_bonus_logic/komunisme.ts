import { PRODUCTION_BAN_PRODUCTS } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog';

export const COMMUNISM_PRODUCTION_BONUS = 0.1;

const COMMUNISM_BONUS_RESOURCES = new Set<string>(
  PRODUCTION_BAN_PRODUCTS.map(product => product.key)
);

export function getCommunismProductionMultiplier(
  resourceKey: string,
  ideology: unknown
): number {
  if (String(ideology || '').trim().toLowerCase() !== 'komunisme') return 1;

  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, '');
  return COMMUNISM_BONUS_RESOURCES.has(normalizedKey)
    ? 1 + COMMUNISM_PRODUCTION_BONUS
    : 1;
}
