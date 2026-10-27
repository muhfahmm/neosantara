import { convertBarakToSoldiers } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/1_barak_logic";

export type UnitKind =
  | "infanteri"
  | "tank"
  | "apcIfv"
  | "artileriBerat"
  | "peluncurRoket"
  | "pertahananUdaraMobile"
  | "kendaraanTaktis"
  | "kapalInduk"
  | "kapalIndukNuklir"
  | "destroyer"
  | "korvet"
  | "kapalSelamNuklir"
  | "kapalSelamReguler"
  | "kapalRanjau"
  | "kapalLogistik"
  | "jetTempurSiluman"
  | "jetTempurInterceptor"
  | "pesawatPengebom"
  | "helikopterSerang"
  | "pesawatPengintai"
  | "droneIntaiUav"
  | "droneKamikaze"
  | "pesawatAngkut";

export type WarUnitGroup = "darat" | "laut" | "udara";

export interface WarUnit {
  kind: UnitKind;
  group: WarUnitGroup;
  label: string;
  displayName?: string;
  quantity: number;
  echelon?: "I" | "II" | "III";
  instanceId?: string;
}

const UNIT_CATALOG: Record<WarUnitGroup, Array<{ key: string; kind: UnitKind; label: string; displayName: string }>> = {
  darat: [
    { key: "barak", kind: "infanteri", label: "INF", displayName: "Pasukan Infanteri" },
    { key: "tank_tempur_utama", kind: "tank", label: "MBT", displayName: "Tank Tempur Utama" },
    { key: "apc_ifv", kind: "apcIfv", label: "APC", displayName: "APC / IFV" },
    { key: "artileri_berat", kind: "artileriBerat", label: "ART", displayName: "Artileri Berat" },
    { key: "sistem_peluncur_roket", kind: "peluncurRoket", label: "MLRS", displayName: "Sistem Peluncur Roket" },
    { key: "pertahanan_udara_mobile", kind: "pertahananUdaraMobile", label: "SAM", displayName: "Pertahanan Udara Mobile" },
    { key: "kendaraan_taktis", kind: "kendaraanTaktis", label: "TAC", displayName: "Kendaraan Taktis" },
  ],
  laut: [
    { key: "kapal_induk", kind: "kapalInduk", label: "CV", displayName: "Kapal Induk" },
    { key: "kapal_induk_nuklir", kind: "kapalIndukNuklir", label: "CVN", displayName: "Kapal Induk Nuklir" },
    { key: "kapal_destroyer", kind: "destroyer", label: "DDG", displayName: "Kapal Destroyer" },
    { key: "kapal_korvet", kind: "korvet", label: "FFL", displayName: "Kapal Korvet" },
    { key: "kapal_selam_nuklir", kind: "kapalSelamNuklir", label: "SSN", displayName: "Kapal Selam Nuklir" },
    { key: "kapal_selam_regular", kind: "kapalSelamReguler", label: "SSK", displayName: "Kapal Selam Reguler" },
    { key: "kapal_ranjau", kind: "kapalRanjau", label: "MCM", displayName: "Kapal Ranjau" },
    { key: "kapal_logistik", kind: "kapalLogistik", label: "AUX", displayName: "Kapal Logistik" },
  ],
  udara: [
    { key: "jet_tempur_siluman", kind: "jetTempurSiluman", label: "STL", displayName: "Jet Tempur Siluman" },
    { key: "jet_tempur_interceptor", kind: "jetTempurInterceptor", label: "INT", displayName: "Jet Tempur Interceptor" },
    { key: "pesawat_pengebom", kind: "pesawatPengebom", label: "BMB", displayName: "Pesawat Pengebom" },
    { key: "helikopter_serang", kind: "helikopterSerang", label: "HEL", displayName: "Helikopter Serang" },
    { key: "pesawat_pengintai", kind: "pesawatPengintai", label: "ISR", displayName: "Pesawat Pengintai" },
    { key: "drone_intai_uav", kind: "droneIntaiUav", label: "UAV", displayName: "Drone Intai UAV" },
    { key: "drone_kamikaze", kind: "droneKamikaze", label: "KMD", displayName: "Drone Kamikaze" },
    { key: "pesawat_angkut", kind: "pesawatAngkut", label: "TRN", displayName: "Pesawat Angkut" },
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
  const hasDeploymentConfig = Object.values(deploymentConfig).some(
    (value) => typeof value === "number"
  );

  return (Object.entries(UNIT_CATALOG) as Array<[WarUnitGroup, typeof UNIT_CATALOG[WarUnitGroup]]>)
    .flatMap(([group, units]) => units.flatMap(({ key, kind, label, displayName }) => {
      const rawQuantity = resolveUnitQuantity(source, group, key);
      const deployedPercent = deploymentConfig[key];
      const quantity = applyDeployment && hasDeploymentConfig
        ? Math.round((rawQuantity * (typeof deployedPercent === "number" ? deployedPercent : 0)) / 100)
        : rawQuantity;

      return quantity > 0 ? [{ kind, group, label, displayName, quantity }] : [];
    }));
}

export function formatUnitQuantity(quantity: number): string {
  if (quantity >= 1_000_000) return `${(quantity / 1_000_000).toFixed(1)}m`;
  if (quantity >= 1_000) return `${(quantity / 1_000).toFixed(1)}k`;
  return String(Math.round(quantity));
}

export function formatUnitMarkerQuantity(quantity: number): string {
  return Math.round(quantity).toLocaleString('id-ID');
}
