import armadaMetadata from "../../../../../../../../../json/semua_fitur_negara/2_pertahanan/1_armada_militer/metadata_armada_militer.json";

type ArmadaMetadataRecord = {
  dataKey: string;
  groupId: string;
  kekuatan?: number;
  kesehatan?: number;
};

type ArmadaData = {
  barak?: number;
  darat?: Record<string, number>;
  laut?: Record<string, number>;
  udara?: Record<string, number>;
  [key: string]: unknown;
};

type ArmadaUnitBreakdown = {
  key: string;
  dataKey: string;
  groupId: string;
  quantity: number;
  powerPerUnit: number;
  healthPerUnit: number;
  totalPower: number;
  totalHealth: number;
};

const normalizeNumber = (value: unknown): number => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

const metadataByDataKey = Object.values(armadaMetadata as Record<string, ArmadaMetadataRecord>).reduce(
  (accumulator, item) => {
    accumulator[item.dataKey] = item;
    return accumulator;
  },
  {} as Record<string, ArmadaMetadataRecord>,
);

const resolveCountryArmada = (source: unknown): ArmadaData => {
  if (!source || typeof source !== "object") {
    return {};
  }

  const candidate = source as Record<string, unknown>;
  const nestedArmada = candidate.armada;
  const baseArmada = nestedArmada && typeof nestedArmada === "object" ? (nestedArmada as ArmadaData) : candidate;

  // Extract nested or flat values from MySQL tables
  const daratObj: Record<string, number> = {};
  const lautObj: Record<string, number> = {};
  const udaraObj: Record<string, number> = {};

  Object.values(metadataByDataKey).forEach((meta) => {
    const key = meta.dataKey;
    const group = meta.groupId;

    // Check nested first
    const groupObj = baseArmada[group as keyof ArmadaData] as Record<string, number> | undefined;
    let val = groupObj && typeof groupObj === "object" ? groupObj[key] : undefined;

    // Fallback to flat property on candidate/baseArmada (from MySQL)
    if (val === undefined && baseArmada[key] !== undefined) {
      val = baseArmada[key] as number;
    }
    if (val === undefined && candidate[key] !== undefined) {
      val = candidate[key] as number;
    }

    const numVal = normalizeNumber(val);

    if (group === "darat") daratObj[key] = numVal;
    if (group === "laut") lautObj[key] = numVal;
    if (group === "udara") udaraObj[key] = numVal;
  });

  return {
    barak: normalizeNumber(baseArmada.barak ?? candidate.barak),
    darat: daratObj,
    laut: lautObj,
    udara: udaraObj,
  };
};

const resolveQuantity = (armada: ArmadaData, dataKey: string): number => {
  if (dataKey === "barak") {
    return normalizeNumber(armada.barak);
  }

  const group = metadataByDataKey[dataKey]?.groupId;
  if (!group) {
    return 0;
  }

  const groupValues = armada[group as keyof ArmadaData] as Record<string, number> | undefined;
  return normalizeNumber(groupValues?.[dataKey]);
};

export function getArmadaUnitBreakdown(source: unknown): ArmadaUnitBreakdown[] {
  const armada = resolveCountryArmada(source);

  return Object.values(metadataByDataKey).map((metadata) => {
    const quantity = resolveQuantity(armada, metadata.dataKey);
    const powerPerUnit = normalizeNumber(metadata.kekuatan);
    const healthPerUnit = normalizeNumber(metadata.kesehatan);

    return {
      key: metadata.dataKey,
      dataKey: metadata.dataKey,
      groupId: metadata.groupId,
      quantity,
      powerPerUnit,
      healthPerUnit,
      totalPower: quantity * powerPerUnit,
      totalHealth: quantity * healthPerUnit,
    };
  });
}

export function getArmadaPowerSummary(source: unknown) {
  const breakdown = getArmadaUnitBreakdown(source);

  const totals = breakdown.reduce(
    (summary, item) => {
      summary.totalPower += item.totalPower;
      summary.totalHealth += item.totalHealth;
      summary.groups[item.groupId] = summary.groups[item.groupId] ?? { power: 0, health: 0, count: 0 };
      summary.groups[item.groupId].power += item.totalPower;
      summary.groups[item.groupId].health += item.totalHealth;
      summary.groups[item.groupId].count += item.quantity;
      return summary;
    },
    {
      totalPower: 0,
      totalHealth: 0,
      groups: {} as Record<string, { power: number; health: number; count: number }>,
    },
  );

  return {
    breakdown,
    totals,
  };
}
