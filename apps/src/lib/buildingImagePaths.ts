type BuildingImageCategory =
  | "production-electricity"
  | "production-mineral-energy"
  | "production-manufacturing"
  | "production-livestock"
  | "production-agriculture"
  | "production-fisheries"
  | "production-processed-food"
  | "public-infrastructure"
  | "public-education"
  | "public-healthcare"
  | "public-law-enforcement"
  | "public-sports"
  | "public-commercial"
  | "housing"
  | "defense-land"
  | "defense-sea"
  | "defense-air"
  | "defense-infrastructure";

const directories: Record<BuildingImageCategory, string> = {
  "production-electricity": "/images/game/buildings/production/electricity/",
  "production-mineral-energy": "/images/game/buildings/production/mineral-energy/",
  "production-manufacturing": "/images/game/buildings/production/manufacturing/",
  "production-livestock": "/images/game/buildings/production/livestock/",
  "production-agriculture": "/images/game/buildings/production/agriculture/",
  "production-fisheries": "/images/game/buildings/production/fisheries/",
  "production-processed-food": "/images/game/buildings/production/processed-food/",
  "public-infrastructure": "/images/game/buildings/public/infrastructure/",
  "public-education": "/images/game/buildings/public/education/",
  "public-healthcare": "/images/game/buildings/public/healthcare/",
  "public-law-enforcement": "/images/game/buildings/public/law-enforcement/",
  "public-sports": "/images/game/buildings/public/sports/",
  "public-commercial": "/images/game/buildings/public/commercial/",
  housing: "/images/game/buildings/housing/",
  "defense-land": "/images/game/defense/land/",
  "defense-sea": "/images/game/defense/sea/",
  "defense-air": "/images/game/defense/air/",
  "defense-infrastructure": "/images/game/defense/infrastructure/",
};

const namedAssetCategories: Partial<Record<string, BuildingImageCategory>> = {};

const registerNamedAssets = (category: BuildingImageCategory, keys: string[]) => {
  keys.forEach((key) => {
    namedAssetCategories[key] = category;
  });
};

registerNamedAssets("production-electricity", [
  "pembangkit_listrik_tenaga_nuklir",
  "pembangkit_listrik_tenaga_air",
  "pembangkit_listrik_tenaga_surya",
  "pembangkit_listrik_tenaga_uap",
  "pembangkit_listrik_tenaga_gas",
  "pembangkit_listrik_tenaga_angin",
  "pembangkit_listrik_tenaga_panas_bumi",
  "pembangkit_listrik_tenaga_hidrogen",
  "pembangkit_listrik_tenaga_gelombang_laut",
  "pembangkit_listrik_tenaga_fusi_nuklir",
]);
registerNamedAssets("production-mineral-energy", [
  "emas", "uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam",
  "litium", "logam_tanah_jarang", "bijih_besi",
]);
registerNamedAssets("production-manufacturing", [
  "pabrik_semikonduktor", "pabrik_mesin", "pabrik_besi", "semen_beton", "kayu",
]);
registerNamedAssets("production-livestock", ["ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing"]);
registerNamedAssets("production-agriculture", [
  "padi", "gandum", "jagung", "umbi", "kedelai", "kelapa_sawit",
  "teh", "kopi", "kakao", "tebu", "sayur", "karet",
]);
registerNamedAssets("production-fisheries", ["udang", "ikan", "mutiara"]);
registerNamedAssets("public-education", [
  "prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan",
  "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan",
]);
registerNamedAssets("public-healthcare", ["rumah_sakit_besar", "rumah_sakit_kecil", "pusat_diagnostik"]);
registerNamedAssets("housing", ["rumah_subsidi", "apartemen", "mansion"]);
registerNamedAssets("defense-sea", [
  "kapal_induk", "kapal_induk_nuklir", "kapal_destroyer", "kapal_korvet",
  "kapal_selam_nuklir", "kapal_selam_regular", "kapal_ranjau", "kapal_logistik",
]);
registerNamedAssets("defense-air", [
  "jet_tempur_siluman", "jet_tempur_interceptor", "pesawat_pengebom", "helikopter_serang",
  "pesawat_pengintai", "drone_intai_uav", "drone_kamikaze", "pesawat_angkut",
]);
registerNamedAssets("defense-infrastructure", [
  "barak", "gudang_senjata", "hangar_tank", "pangkalan_udara", "pangkalan_laut",
]);

const genericAssets: Partial<Record<BuildingImageCategory, string>> = {
  "production-processed-food": "processed-food-asset-01.svg",
  "public-infrastructure": "infrastructure-asset-01.svg",
  "public-law-enforcement": "law-enforcement-asset-01.svg",
  "public-sports": "sports-asset-01.svg",
  "public-commercial": "commercial-asset-01.svg",
  "defense-land": "defense-land-asset-01.svg",
};

export function getBuildingImagePath(key: string, category: BuildingImageCategory): string {
  const assetCategory = namedAssetCategories[key] ?? category;
  const genericAsset = genericAssets[assetCategory];
  if (genericAsset) return `${directories[assetCategory]}${genericAsset}`;

  return `${directories[assetCategory]}${key.replace(/_/g, "-")}.svg`;
}

export type { BuildingImageCategory };
