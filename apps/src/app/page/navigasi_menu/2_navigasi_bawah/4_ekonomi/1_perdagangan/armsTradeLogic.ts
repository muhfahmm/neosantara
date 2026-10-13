import { getBuildingMetadata } from "@/lib/buildingMetadataRegistry";

export interface ArmsTradeProduct {
  dataKey: string;
  groupId: "darat" | "laut" | "udara";
  label: string;
  unitPrice: number;
}

const productLabels: Record<string, string> = {
  tank_tempur_utama: "Tank Tempur Utama",
  apc_ifv: "APC / IFV",
  artileri_berat: "Artileri Berat",
  sistem_peluncur_roket: "Sistem Peluncur Roket",
  pertahanan_udara_mobile: "Pertahanan Udara Mobile",
  kendaraan_taktis: "Kendaraan Taktis",
  kapal_induk: "Kapal Induk",
  kapal_induk_nuklir: "Kapal Induk Nuklir",
  kapal_destroyer: "Kapal Destroyer",
  kapal_korvet: "Kapal Korvet",
  kapal_selam_nuklir: "Kapal Selam Nuklir",
  kapal_selam_regular: "Kapal Selam Reguler",
  kapal_ranjau: "Kapal Ranjau",
  kapal_logistik: "Kapal Logistik",
  jet_tempur_siluman: "Jet Tempur Siluman",
  jet_tempur_interceptor: "Jet Tempur Interceptor",
  pesawat_pengebom: "Pesawat Pengebom",
  helikopter_serang: "Helikopter Serang",
  pesawat_pengintai: "Pesawat Pengintai",
  drone_intai_uav: "Drone Intai UAV",
  drone_kamikaze: "Drone Kamikaze",
  pesawat_angkut: "Pesawat Angkut",
};

type ArmadaMetadata = {
  dataKey: string;
  groupId: string;
  biaya_pembangunan: number;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

export const getArmsTradeProducts = (): ArmsTradeProduct[] =>
  Object.values(getBuildingMetadata())
  .map(item => item as ArmadaMetadata)
  .filter((item) => item.dataKey in productLabels && ["darat", "laut", "udara"].includes(item.groupId))
  .map((item) => ({
    dataKey: item.dataKey,
    groupId: item.groupId as ArmsTradeProduct["groupId"],
    label: productLabels[item.dataKey],
    unitPrice: Number(item.biaya_pembangunan) || 0,
  }));

export const getArmsUnitCount = (country: Record<string, unknown>, product: ArmsTradeProduct): number => {
  const armada = asRecord(country.armada);
  const group = asRecord(armada[product.groupId]);
  const defense = asRecord(country.pertahanan);
  const defenseGroup = asRecord(defense[product.groupId]);
  const countryGroup = asRecord(country[product.groupId]);
  const rawCount =
    group[product.dataKey] ??
    armada[product.dataKey] ??
    countryGroup[product.dataKey] ??
    defenseGroup[product.dataKey] ??
    defense[product.dataKey] ??
    country[product.dataKey];
  const count = Number(rawCount ?? 0);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
};

export const getArmsTransferUpdate = (
  country: Record<string, unknown>,
  product: ArmsTradeProduct,
  quantityChange: number,
): { armada: Record<string, unknown> } => {
  const currentArmada = asRecord(country.armada);
  const currentGroup = asRecord(currentArmada[product.groupId]);
  return {
    armada: {
      ...currentArmada,
      [product.groupId]: {
        ...currentGroup,
        [product.dataKey]: Math.max(0, getArmsUnitCount(country, product) + quantityChange),
      },
    },
  };
};
