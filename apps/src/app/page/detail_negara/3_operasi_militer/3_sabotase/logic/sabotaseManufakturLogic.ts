import { PRODUCTION_BAN_CATEGORIES } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog';
import {
  applySabotaseBuildingDamageToTarget,
  calculateSabotaseBuildingDamage,
} from './sabotaseInfrastrukturLogic';
import type { SabotageUnitLoss } from '@/app/page/detail_negara/3_operasi_militer/covertEffectsLogic';

export const SABOTASE_MANUFAKTUR_BUILDING_KEYS = PRODUCTION_BAN_CATEGORIES
  .filter(category => category.id === 'manufaktur')
  .flatMap(category => category.products);

export function calculateSabotaseManufakturDamage(
  countryDetail: Readonly<Record<string, unknown>>,
): { updates: Record<string, number>; losses: SabotageUnitLoss[] } {
  return calculateSabotaseBuildingDamage(
    countryDetail,
    SABOTASE_MANUFAKTUR_BUILDING_KEYS,
  );
}

export function applySabotaseManufakturToTarget(
  targetCountryName: string,
  providedTargetDetail?: Record<string, unknown> | null,
): Promise<SabotageUnitLoss[]> {
  return applySabotaseBuildingDamageToTarget(
    targetCountryName,
    SABOTASE_MANUFAKTUR_BUILDING_KEYS,
    providedTargetDetail,
  );
}
