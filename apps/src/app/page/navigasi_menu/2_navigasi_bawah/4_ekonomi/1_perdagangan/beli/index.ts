// beli/index.ts

// ===========================
// 1. MINERAL KRITIS
// ===========================
export const hasUraniumBuilding = (data: any) => Number(data?.uranium || 0) > 0;
export const hasBatubaraBuilding = (data: any) => Number(data?.batu_bara || 0) > 0;
export const hasMinyakBumiBuilding = (data: any) => Number(data?.minyak_bumi || 0) > 0;
export const hasGasAlamBuilding = (data: any) => Number(data?.gas_alam || 0) > 0;
export const hasGaramBuilding = (data: any) => Number(data?.garam || 0) > 0;
export const hasLitiumBuilding = (data: any) => Number(data?.litium || 0) > 0;
export const hasLogamTanahJarangBuilding = (data: any) => Number(data?.logam_tanah_jarang || 0) > 0;
export const hasBijihBesiBuilding = (data: any) => Number(data?.bijih_besi || 0) > 0;

// ===========================
// 2. MANUFAKTUR
// ===========================
export const hasSemikonduktorBuilding = (data: any) => Number(data?.semikonduktor || 0) > 0;
export const hasPabrikMesinBuilding = (data: any) => Number(data?.pabrik_mesin || 0) > 0;
export const hasPabrikBesiBuilding = (data: any) => Number(data?.pabrik_besi || 0) > 0;
export const hasSemenBetonBuilding = (data: any) => Number(data?.semen_beton || 0) > 0;
export const hasKayuBuilding = (data: any) => Number(data?.kayu || 0) > 0;

// ===========================
// 3. PETERNAKAN
// ===========================
export const hasAyamUnggasBuilding = (data: any) => Number(data?.ayam_unggas || 0) > 0;
export const hasSapiPerahBuilding = (data: any) => Number(data?.sapi_perah || 0) > 0;
export const hasSapiPotongBuilding = (data: any) => Number(data?.sapi_potong || 0) > 0;
export const hasDombaKambingBuilding = (data: any) => Number(data?.domba_kambing || 0) > 0;

// ===========================
// 4. AGRIKULTUR
// ===========================
export const hasPadiBuilding = (data: any) => Number(data?.padi || 0) > 0;
export const hasGandumBuilding = (data: any) => Number(data?.gandum || 0) > 0;
export const hasJagungBuilding = (data: any) => Number(data?.jagung || 0) > 0;
export const hasUmbiBuilding = (data: any) => Number(data?.umbi || 0) > 0;
export const hasKedelaiBuilding = (data: any) => Number(data?.kedelai || 0) > 0;
export const hasKelapaSawitBuilding = (data: any) => Number(data?.kelapa_sawit || 0) > 0;
export const hasTehBuilding = (data: any) => Number(data?.teh || 0) > 0;
export const hasKopiBuilding = (data: any) => Number(data?.kopi || 0) > 0;
export const hasKakaoBuilding = (data: any) => Number(data?.kakao || 0) > 0;
export const hasTebuBuilding = (data: any) => Number(data?.tebu || 0) > 0;
export const hasSayurBuilding = (data: any) => Number(data?.sayur || 0) > 0;
export const hasKaretBuilding = (data: any) => Number(data?.karet || 0) > 0;

// ===========================
// 5. PERIKANAN
// ===========================
export const hasUdangBuilding = (data: any) => Number(data?.udang || 0) > 0;
export const hasIkanBuilding = (data: any) => Number(data?.ikan || 0) > 0;
export const hasMutiaraBuilding = (data: any) => Number(data?.mutiara || 0) > 0;

// ===========================
// 6. OLAHAN PANGAN
// ===========================
export const hasAirMineralBuilding = (data: any) => Number(data?.air_mineral || 0) > 0;
export const hasGulaBuilding = (data: any) => Number(data?.gula || 0) > 0;
export const hasRotiBuilding = (data: any) => Number(data?.roti || 0) > 0;
export const hasPengolahanDagingBuilding = (data: any) => Number(data?.pengolahan_daging || 0) > 0;
export const hasMieInstanBuilding = (data: any) => Number(data?.mie_instan || 0) > 0;
export const hasMinyakGorengBuilding = (data: any) => Number(data?.minyak_goreng || 0) > 0;
export const hasSusuBuilding = (data: any) => Number(data?.susu || 0) > 0;