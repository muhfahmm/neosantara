import { convertBarakToSoldiers } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/1_barak_logic";
import type { UnitKind } from "./unitIconProps";

export type WarUnitGroup = "darat" | "laut" | "udara";

export interface WarUnit {
  kind: UnitKind;
  group: WarUnitGroup;
  label: string;
  quantity: number;
}

const UNIT_CATALOG: Record<WarUnitGroup, Array<{ key: string; kind: UnitKind; label: string }>> = {
  darat: [
    { key: "barak", kind: "infanteri", label: "INF" },
    { key: "tank_tempur_utama", kind: "tank", label: "MBT" },
    { key: "apc_ifv", kind: "apcIfv", label: "APC" },
    { key: "artileri_berat", kind: "artileriBerat", label: "ART" },
    { key: "sistem_peluncur_roket", kind: "peluncurRoket", label: "MLRS" },
    { key: "pertahanan_udara_mobile", kind: "pertahananUdaraMobile", label: "SAM" },
    { key: "kendaraan_taktis", kind: "kendaraanTaktis", label: "TAC" },
  ],
  laut: [
    { key: "kapal_induk", kind: "kapalInduk", label: "CV" },
    { key: "kapal_induk_nuklir", kind: "kapalIndukNuklir", label: "CVN" },
    { key: "kapal_destroyer", kind: "destroyer", label: "DDG" },
    { key: "kapal_korvet", kind: "korvet", label: "FFL" },
    { key: "kapal_selam_nuklir", kind: "kapalSelamNuklir", label: "SSN" },
    { key: "kapal_selam_regular", kind: "kapalSelamReguler", label: "SSK" },
    { key: "kapal_ranjau", kind: "kapalRanjau", label: "MCM" },
    { key: "kapal_logistik", kind: "kapalLogistik", label: "AUX" },
  ],
  udara: [
    { key: "jet_tempur_siluman", kind: "jetTempurSiluman", label: "STL" },
    { key: "jet_tempur_interceptor", kind: "jetTempurInterceptor", label: "INT" },
    { key: "pesawat_pengebom", kind: "pesawatPengebom", label: "BMB" },
    { key: "helikopter_serang", kind: "helikopterSerang", label: "HEL" },
    { key: "pesawat_pengintai", kind: "pesawatPengintai", label: "ISR" },
    { key: "drone_intai_uav", kind: "droneIntaiUav", label: "UAV" },
    { key: "drone_kamikaze", kind: "droneKamikaze", label: "KMD" },
    { key: "pesawat_angkut", kind: "pesawatAngkut", label: "TRN" },
  ],
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" ? value as Record<string, unknown> : {};

const numericValue = (value: unknown): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const firstPositive = (...values: unknown[]): number =>
  values.map(numericValue).find((value) => value > 0) ?? 0;

const resolveUnitQuantity = (
  source: Record<string, unknown>,
  group: WarUnitGroup,
  key: string,
): number => {
  const payload = asRecord(source.armada);
  const armada = Object.keys(payload).length > 0 ? payload : source;
  const groupData = asRecord(armada[group]);

  if (key === "barak") {
    const storedInfantry = firstPositive(
      groupData.pasukan_infanteri,
      asRecord(payload[group]).pasukan_infanteri,
      armada.pasukan_infanteri,
      payload.pasukan_infanteri,
      asRecord(source[group]).pasukan_infanteri,
      source.pasukan_infanteri,
    );
    if (storedInfantry > 0) return storedInfantry;

    return convertBarakToSoldiers(
      firstPositive(source.barak, armada.barak, groupData.barak),
    );
  }

  return firstPositive(
    groupData[key],
    payload[key],
    asRecord(source[group])[key],
    asRecord(asRecord(source.armada)[group])[key],
    source[key],
  );
};

export function getWarUnitComposition(
  countryDetail: unknown,
  deploymentConfig: Record<string, unknown>,
  applyDeployment: boolean,
): WarUnit[] {
  const source = asRecord(countryDetail);

  return (Object.entries(UNIT_CATALOG) as Array<[WarUnitGroup, typeof UNIT_CATALOG[WarUnitGroup]]>)
    .flatMap(([group, units]) => units.flatMap(({ key, kind, label }) => {
      const rawQuantity = resolveUnitQuantity(source, group, key);
      const deployedPercent = deploymentConfig[key];
      const quantity = applyDeployment && typeof deployedPercent === "number"
        ? Math.round((rawQuantity * deployedPercent) / 100)
        : rawQuantity;

      return quantity > 0 ? [{ kind, group, label, quantity }] : [];
    }));
}

export function formatUnitQuantity(quantity: number): string {
  if (quantity >= 1_000_000) return `${(quantity / 1_000_000).toFixed(1)}m`;
  if (quantity >= 1_000) return `${(quantity / 1_000).toFixed(1)}k`;
  return String(Math.round(quantity));
}
