import { getIslamProductionMultiplier } from "./agama_bonus_logic/islam";
import { getShintoElectricityProductionMultiplier } from "./agama_bonus_logic/shinto";
import { getCommunismProductionMultiplier } from "./ideologi_bonus_logic/komunisme";
import { getNationalismProductionMultiplier } from "./ideologi_bonus_logic/nasionalisme";

import { getFAOProductionMultiplier, isMemberOfFAO } from "./organisasi_bonus_logic/organisasi_pbb/fao";
import { getILOProductionMultiplier, isMemberOfILO } from "./organisasi_bonus_logic/organisasi_pbb/ilo";
import { getIMOProductionMultiplier } from "./organisasi_bonus_logic/organisasi_pbb/imo";
import { getOKIFoodProductionMultiplier, isMemberOfOKI } from "./organisasi_bonus_logic/organisasi_regional/oki";
import { getASEANBuildSpeedModifier } from "./organisasi_bonus_logic/organisasi_regional/asean";
import { getUniAfrikaBuildSpeedModifier } from "./organisasi_bonus_logic/organisasi_regional/uni_afrika";
import { PRODUCTION_BAN_CATEGORIES } from "../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";
import {
  getResearchCardBonus,
  getResearchCardLevel,
  normalizeResearchLevels,
} from "./researchCardLevelBonus";
import {
  KERJA_SAMA_ORGANISASI_REGIONAL_RESEARCH_ID,
  getKerjaSamaOrganisasiRegionalBonusPercent,
  applyKerjaSamaRegionalToFlatBonus,
  applyKerjaSamaRegionalToMultiplier,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/4_Kerja Sama Organisasi Regional";
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
  const researchLevels = normalizeResearchLevels(countryDetail.research_levels);

  const sectorBonusPercent = RESEARCH_CARDS_BY_PRODUCTION_SECTOR[sector].reduce((total, researchId) => {
    if (!completedResearch.includes(researchId)) return total;
    return total + getResearchCardBonus(getResearchCardLevel(researchLevels, researchId));
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
  const faoMultiplier = applyKerjaSamaRegionalToMultiplier(
    getFAOProductionMultiplier(countryName, resourceKey),
    countryDetail
  );
  const iloMultiplier = applyKerjaSamaRegionalToMultiplier(
    getILOProductionMultiplier(countryName, resourceKey),
    countryDetail
  );
  const imoMultiplier = applyKerjaSamaRegionalToMultiplier(
    getIMOProductionMultiplier(countryName, resourceKey),
    countryDetail
  );
  const okiMultiplier = applyKerjaSamaRegionalToMultiplier(
    getOKIFoodProductionMultiplier(countryName, resourceKey),
    countryDetail
  );
  const researchMultiplier = getResearchProductionMultiplier(countryDetail, resourceKey);

  return religiousMultiplier * ideologyMultiplier * nationalismMultiplier * faoMultiplier * iloMultiplier * imoMultiplier * okiMultiplier * researchMultiplier;
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

// 3_riset_diplomasi_intelijen
export {
  getWaktuPembangunanKedutaanBonusPercent,
  getEffectiveEmbassyBuildTime
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/1_Manfaat Kedutaan";

export {
  KONTROL_PANDEMI_RESEARCH_ID,
  getKontrolPandemiBonusPercent,
  applyKontrolPandemiFatalityReduction,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/2_Kontrol Pandemi Global";

export {
  ALIANSI_PERTAHANAN_RESEARCH_ID,
  BASE_DEFENSE_ALLIANCE_OFFER_CHANCE_PERCENT,
  getDefenseAllianceOfferChancePercent,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/3_Aliansi Pertahanan";

export {
  KERJA_SAMA_ORGANISASI_REGIONAL_RESEARCH_ID,
  getKerjaSamaOrganisasiRegionalBonusPercent,
  applyKerjaSamaRegionalToMultiplier,
  applyKerjaSamaRegionalToFlatBonus,
};

export {
  HARMONISASI_FISKAL_GLOBAL_RESEARCH_ID,
  getHarmonisasiFiskalGlobalBonusPercent,
  applyHarmonisasiFiskalGlobalTaxRevenueBonus,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/5_Harmonisasi Fiskal Global";

export {
  SUARA_PBB_RESEARCH_ID,
  getSuaraPBBResearchBonus,
  applySuaraPBBResearchBonus,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/6_Suara di PBB";

export {
  DIPLOMASI_ACARA_NASIONAL_RESEARCH_ID,
  getDiplomasiAcaraBonusPercent,
  applyDiplomasiAcaraSatisfactionBonus,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/7_Diplomasi Acara Nasional";

export {
  MITIGASI_BENCANA_RESEARCH_ID,
  getMitigasiBencanaBonusPercent,
  applyMitigasiBencanaFatalityReduction,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/8_Mitigasi Bencana Alam";

export {
  KURSI_TETAP_DEWAN_PBB_RESEARCH_ID,
  KURSI_TETAP_DEWAN_PBB_LEGACY_ID,
  hasPermanentSecurityCouncilSeatResearch,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/9_Kursi Tetap Dewan Keamanan PBB";

export {
  DIPLOMASI_PERDAGANGAN_STRATEGIS_RESEARCH_ID,
  getStrategicTradeBonusPercent,
  applyStrategicTradeSellPriceMultiplier,
  applyStrategicTradeBuyPriceMultiplier,
  applyStrategicTradePrice,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/10_Diplomasi Perdagangan Strategis";

export {
  EFISIENSI_BIAYA_KEDUTAAN_RESEARCH_ID,
  getEfisiensiBiayaKedutaanBonusPercent,
  getEffectiveEmbassyCost,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/11_Efisiensi Biaya Kedutaan";

export {
  PENYEBARAN_IDEOLOGI_RESEARCH_ID,
  BASE_IDEOLOGY_SUCCESS_CHANCE_PERCENT,
  getPenyebaranIdeologiBonusPercent,
  getIdeologySuccessChancePercent,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/12_Penyebaran Ideologi";

export {
  DOKTRIN_PERTAHANAN_DIRI_RESEARCH_ID,
  getDoktrinPertahananDiriBonusPercent,
  applyDoktrinPertahananDiriBonus,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/13_Doktrin Pertahanan Diri";

export {
  PROMOSI_WISATA_DIPLOMATIK_RESEARCH_ID,
  getPromosiWisataDiplomatikBonusPercent,
  applyPromosiWisataDiplomatikBonus,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/14_Promosi Wisata Diplomatik";

export {
  ALOKASI_SUBSIDI_TERPADU_RESEARCH_ID,
  getAlokasiSubsidiTerpaduBonusPercent,
  applyAlokasiSubsidiTerpaduBonus,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/15_Alokasi Subsidi Terpadu";

export {
  PENCEGAHAN_SEPARATISME_RESEARCH_ID,
  getPencegahanSeparatismeBonusPercent,
  applyPencegahanSeparatismeBonus,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/16_Pencegahan Separatisme";

export {
  MISI_KEAGAMAAN_INTERNASIONAL_RESEARCH_ID,
  BASE_MISSIONARY_SUCCESS_CHANCE_PERCENT,
  getMisiKeagamaanInternasionalBonusPercent,
  getMissionarySuccessChancePercent,
} from "./penelitian_bonus_logic/3_riset_diplomasi_intelijen/17_Misi Keagamaan Internasional";

export function getBuildSpeedModifier(countryName: string): number {
  return getASEANBuildSpeedModifier(countryName) + getUniAfrikaBuildSpeedModifier(countryName);
}

export function getEffectiveBuildTime(
  baseDays: number,
  countryName: string,
  countryDetail?: Record<string, unknown> | null
): number {
  const baseSpeedBonus = getBuildSpeedModifier(countryName);
  const speedBonus = applyKerjaSamaRegionalToFlatBonus(baseSpeedBonus, countryDetail);
  if (speedBonus <= 0 || !baseDays) return baseDays;
  const mult = 1 + (speedBonus / 100);
  return Math.max(1, Math.ceil(baseDays / mult));
}
