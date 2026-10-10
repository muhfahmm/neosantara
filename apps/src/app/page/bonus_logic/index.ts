import { getIslamProductionMultiplier } from "./agama_bonus_logic/islam";
import { getShintoElectricityProductionMultiplier } from "./agama_bonus_logic/shinto";
import { getCommunismProductionMultiplier } from "./ideologi_bonus_logic/komunisme";
import { getNationalismProductionMultiplier } from "./ideologi_bonus_logic/nasionalisme";

import { getFAOProductionMultiplier, isMemberOfFAO } from "./organisasi_bonus_logic/organisasi_pbb/fao";
import { getILOProductionMultiplier, isMemberOfILO } from "./organisasi_bonus_logic/organisasi_pbb/ilo";
import { getOKIFoodProductionMultiplier, isMemberOfOKI } from "./organisasi_bonus_logic/organisasi_regional/oki";
import { PRODUCTION_BAN_CATEGORIES } from "../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";

const RESEARCH_CARD_LEVEL_BONUS = [0, 2, 4, 7, 10, 15];
const RESEARCH_CARDS_BY_PRODUCTION_SECTOR: Record<string, string[]> = {
  manufaktur: ["otomasi_industri"],
  mineral: ["manufaktur_terintegrasi"],
  peternakan: ["peternakan_modern"],
  agrikultur: ["perkebunan_komoditas"],
  perikanan: ["perikanan_modern"],
  "olahan pangan": ["pengolahan_pangan"],
};

const RESEARCH_SECTOR_BY_PRODUCT = new Map<string, string>();
for (const category of PRODUCTION_BAN_CATEGORIES) {
  if (!Object.prototype.hasOwnProperty.call(RESEARCH_CARDS_BY_PRODUCTION_SECTOR, category.id)) continue;
  for (const product of category.products) {
    RESEARCH_SECTOR_BY_PRODUCT.set(product, category.id);
  }
}

function getResearchProductionMultiplier(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  const normalizedResourceKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  const sector = RESEARCH_SECTOR_BY_PRODUCT.get(normalizedResourceKey);
  if (!sector || !countryDetail) return 1;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  const researchLevels = countryDetail.research_levels && typeof countryDetail.research_levels === "object"
    ? countryDetail.research_levels as Record<string, unknown>
    : {};

  const sectorBonusPercent = RESEARCH_CARDS_BY_PRODUCTION_SECTOR[sector].reduce((total, researchId) => {
    if (!completedResearch.includes(researchId)) return total;
    const storedLevel = Number(researchLevels[researchId]) || 1;
    const level = Math.min(RESEARCH_CARD_LEVEL_BONUS.length - 1, Math.max(1, Math.floor(storedLevel)));
    return total + RESEARCH_CARD_LEVEL_BONUS[level];
  }, 0);

  return 1 + sectorBonusPercent / 100;
}

export function getProductionBonusMultiplier(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  const countryName = String(countryDetail?.country || countryDetail?.nama || "").trim();
  const religion = countryDetail?.religion
    ?? countryDetail?.agama_utama
    ?? countryDetail?.agama;
  const religiousMultiplier = String(religion || "").trim().toLowerCase() === "islam"
    ? getIslamProductionMultiplier(resourceKey)
    : String(religion || "").trim().toLowerCase() === "shinto"
      ? getShintoElectricityProductionMultiplier(resourceKey)
      : 1;
  const ideologyMultiplier = getCommunismProductionMultiplier(
    resourceKey,
    countryDetail?.ideology
  );
  const nationalismMultiplier = getNationalismProductionMultiplier(
    resourceKey,
    countryDetail?.ideology
  );
  const faoMultiplier = getFAOProductionMultiplier(countryName, resourceKey);
  const iloMultiplier = getILOProductionMultiplier(countryName, resourceKey);
  const okiMultiplier = getOKIFoodProductionMultiplier(countryName, resourceKey);
  const researchMultiplier = getResearchProductionMultiplier(countryDetail, resourceKey);

  return religiousMultiplier * ideologyMultiplier * nationalismMultiplier * faoMultiplier * iloMultiplier * okiMultiplier * researchMultiplier;
}

// Organisasi PBB
export { isMemberOfInterpol, getInterpolCrimeRiskModifier } from "./organisasi_bonus_logic/organisasi_pbb/interpol";
export { isMemberOfWHO, getWHOPandemicRiskModifier } from "./organisasi_bonus_logic/organisasi_pbb/who";
export { isMemberOfUNESCO, getUNESCOResearchModifier } from "./organisasi_bonus_logic/organisasi_pbb/unesco";
export { isMemberOfWTO, getWTOSellPriceMultiplier, getWTOBuyPriceMultiplier } from "./organisasi_bonus_logic/organisasi_pbb/wto";
export { isMemberOfFAO, getFAOProductionMultiplier } from "./organisasi_bonus_logic/organisasi_pbb/fao";
export { isMemberOfILO, getILOProductionMultiplier } from "./organisasi_bonus_logic/organisasi_pbb/ilo";
export { isMemberOfITU, getITUResearchModifier } from "./organisasi_bonus_logic/organisasi_pbb/itu";
export { isMemberOfWMO, getWMODisasterRiskModifier } from "./organisasi_bonus_logic/organisasi_pbb/wmo";

// Organisasi Regional
export { isMemberOfASEAN, getASEANBuildSpeedModifier } from "./organisasi_bonus_logic/organisasi_regional/asean";
export { isMemberOfEU, getEUTaxRevenueMultiplier } from "./organisasi_bonus_logic/organisasi_regional/eu";
export { isMemberOfLigaArab, getLigaArabUNVoteBonus } from "./organisasi_bonus_logic/organisasi_regional/liga_arab";
export { isMemberOfUniAfrika, getUniAfrikaBuildSpeedModifier } from "./organisasi_bonus_logic/organisasi_regional/uni_afrika";
export { isMemberOfOKI, getOKIFoodProductionMultiplier } from "./organisasi_bonus_logic/organisasi_regional/oki";
export { isMemberOfBRICS, getBRICSTaxRevenueMultiplier } from "./organisasi_bonus_logic/organisasi_regional/brics";
export { isMemberOfNATO, getNATOMilitaryMultiplier } from "./organisasi_bonus_logic/organisasi_regional/nato";
export { isMemberOfOPEC, getOPECSellPriceMultiplier, getOPECBuyPriceMultiplier } from "./organisasi_bonus_logic/organisasi_regional/opec";
export { isMemberOfG20, getG20TaxRevenueMultiplier } from "./organisasi_bonus_logic/organisasi_regional/g20";

// Penelitian Bonus Logic
export {
  getOtomasiIndustriBonusPercent,
  getOtomasiIndustriProductionMultiplier,
  OTOMASI_INDUSTRI_RESOURCES,
} from "./penelitian_bonus_logic/1_riset_ekonomi_industri/1_Otomasi Fabrikasi Elektronik & Kendaraan";

export {
  getManufakturMaterialBonusPercent,
  MANUFAKTUR_MATERIAL_RESOURCES,
} from "./penelitian_bonus_logic/1_riset_ekonomi_industri/2_Rekayasa Material Manufaktur";

export {
  getEksplorasiMineralEnergiBonusPercent,
  getEksplorasiMineralEnergiProductionMultiplier,
  MINERAL_ENERGI_RESOURCES,
} from "./penelitian_bonus_logic/1_riset_ekonomi_industri/3_Eksplorasi Mineral & Energi";

export {
  getInfrastrukturMineralEnergiBonusPercent,
  INFRASTRUKTUR_MINERAL_ENERGI_RESOURCES,
} from "./penelitian_bonus_logic/1_riset_ekonomi_industri/4_Infrastruktur Mineral & Energi Terpadu";

export {
  getPeternakanPresisiBonusPercent,
  getPeternakanPresisiProductionMultiplier,
  PETERNAKAN_RESOURCES,
} from "./penelitian_bonus_logic/1_riset_ekonomi_industri/5_Peternakan Presisi";

export {
  getGenetikaPakanTernakBonusPercent,
  PETERNAKAN_GENETIKA_RESOURCES,
} from "./penelitian_bonus_logic/1_riset_ekonomi_industri/6_Genetika & Pakan Ternak";

export {
  getAgrikulturCerdasBonusPercent,
  getAgrikulturCerdasProductionMultiplier,
  AGRIKULTUR_RESOURCES,
} from "./penelitian_bonus_logic/1_riset_ekonomi_industri/7_Agrikultur Cerdas Multi-Komoditas";

export {
  getAgrikulturTangguhBonusPercent,
  AGRIKULTUR_TANGGUH_RESOURCES,
} from "./penelitian_bonus_logic/1_riset_ekonomi_industri/8_Agrikultur Tangguh Multi-Komoditas";

export {
  getBudidayaPerikananTerpaduBonusPercent,
  getBudidayaPerikananTerpaduProductionMultiplier,
  PERIKANAN_RESOURCES,
} from "./penelitian_bonus_logic/1_riset_ekonomi_industri/9_Budidaya Perikanan Terpadu";

export {
  getTeknologiPerikananPascapanenBonusPercent,
  PERIKANAN_PASCAPANEN_RESOURCES,
} from "./penelitian_bonus_logic/1_riset_ekonomi_industri/10_Teknologi Perikanan & Pascapanen";

export {
  getPengolahanPanganDasarBonusPercent,
  getPengolahanPanganDasarProductionMultiplier,
  OLAHAN_PANGAN_RESOURCES,
} from "./penelitian_bonus_logic/1_riset_ekonomi_industri/11_Pengolahan Pangan Dasar";

export {
  getIndustriPanganTerintegrasiBonusPercent,
  OLAHAN_PANGAN_TERPADU_RESOURCES,
} from "./penelitian_bonus_logic/1_riset_ekonomi_industri/12_Industri Pangan Terintegrasi";

// 2_riset_militer_pertahanan
export { getWaktuPembangunanBarakMiliterBonusPercent } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/1_Pos Pertahanan Perbatasan";
export { getWaktuPembangunanGudangSenjataBonusPercent } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/2_Senapan Serbu Presisi";
export { getWaktuPembangunanHangarTankBonusPercent } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/3_Tank Tempur Komposit";
export { getWaktuPembangunanPangkalanUdaraBonusPercent } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/4_Drone Pengintai Taktis";
export { getWaktuPembangunanPangkalanLautBonusPercent } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/5_Radar Pesisir Pantai";

export { getKapasitasBarakMiliterBonusPercent } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/6_Kapal Korvet Siluman";
export { getKapasitasGudangSenjataBonusPercent } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/7_Komando Siber Ofensif";
export { getKapasitasHangarTankBonusPercent } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/8_Artileri Roket Otonom";
export { getKapasitasPangkalanUdaraBonusPercent } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/9_Kapal Selam Modern";
export { getKapasitasPangkalanLautBonusPercent } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/10_Helikopter Tempur";

export { getKekuatanDaratBonusPercent, getKekuatanDaratMultiplier } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/11_Tank Tempur Generasi 5";
export { getKekuatanUdaraBonusPercent, getKekuatanUdaraMultiplier } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/12_Jet Tempur Superioritas";
export { getKekuatanLautBonusPercent, getKekuatanLautMultiplier } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/13_Kapal Perang Multi-Peran";

export { getHPDaratBonusPercent, getHPDaratMultiplier } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/14_Armor Reaktif Tank";
export { getHPUdaraBonusPercent, getHPUdaraMultiplier } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/15_Struktur Jet Diperkuat";
export { getHPLautBonusPercent, getHPLautMultiplier } from "./penelitian_bonus_logic/2_riset_militer_pertahanan/16_Hull Kapal Diperkuat";


import { getASEANBuildSpeedModifier } from "./organisasi_bonus_logic/organisasi_regional/asean";
import { getUniAfrikaBuildSpeedModifier } from "./organisasi_bonus_logic/organisasi_regional/uni_afrika";

export function getBuildSpeedModifier(countryName: string): number {
  return getASEANBuildSpeedModifier(countryName) + getUniAfrikaBuildSpeedModifier(countryName);
}

export function getEffectiveBuildTime(baseDays: number, countryName: string): number {
  const speedBonus = getBuildSpeedModifier(countryName);
  if (speedBonus <= 0 || !baseDays) return baseDays;
  const mult = 1 + (speedBonus / 100);
  return Math.max(1, Math.ceil(baseDays / mult));
}
