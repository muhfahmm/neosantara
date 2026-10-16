const numberedImages = (folder: string, count: number) =>
  Array.from({ length: count }, (_, index) => [
    index,
    `/images/game/buildings/${folder}/${folder.slice(folder.lastIndexOf("/") + 1)}-asset-${String(index + 1).padStart(2, "0")}.svg`,
  ] as const);

const buildNumberedImageMap = (keys: string[], folder: string) =>
  Object.fromEntries(
    numberedImages(folder, keys.length).map(([index, image]) => [keys[index], image])
  ) as Record<string, string>;

const BUILDING_CARD_IMAGES: Record<string, string> = {
  pembangkit_listrik_tenaga_nuklir: "/images/game/buildings/production/electricity/pembangkit-listrik-tenaga-nuklir.svg",
  pembangkit_listrik_tenaga_air: "/images/game/buildings/production/electricity/pembangkit-listrik-tenaga-air.svg",
  pembangkit_listrik_tenaga_surya: "/images/game/buildings/production/electricity/pembangkit-listrik-tenaga-surya.svg",
  pembangkit_listrik_tenaga_uap: "/images/game/buildings/production/electricity/pembangkit-listrik-tenaga-uap.svg",
  pembangkit_listrik_tenaga_gas: "/images/game/buildings/production/electricity/pembangkit-listrik-tenaga-gas.svg",
  pembangkit_listrik_tenaga_angin: "/images/game/buildings/production/electricity/pembangkit-listrik-tenaga-angin.svg",
  pembangkit_listrik_tenaga_panas_bumi: "/images/game/buildings/production/electricity/pembangkit-listrik-tenaga-panas-bumi.svg",
  pembangkit_listrik_tenaga_hidrogen: "/images/game/buildings/production/electricity/pembangkit-listrik-tenaga-hidrogen.svg",
  pembangkit_listrik_tenaga_gelombang_laut: "/images/game/buildings/production/electricity/pembangkit-listrik-tenaga-gelombang-laut.svg",
  pembangkit_listrik_tenaga_fusi_nuklir: "/images/game/buildings/production/electricity/pembangkit-listrik-tenaga-fusi-nuklir.svg",
  emas: "/images/game/buildings/production/mineral-energy/emas.svg",
  uranium: "/images/game/buildings/production/mineral-energy/uranium.svg",
  batu_bara: "/images/game/buildings/production/mineral-energy/batu-bara.svg",
  minyak_bumi: "/images/game/buildings/production/mineral-energy/minyak-bumi.svg",
  gas_alam: "/images/game/buildings/production/mineral-energy/gas-alam.svg",
  garam: "/images/game/buildings/production/mineral-energy/garam.svg",
  litium: "/images/game/buildings/production/mineral-energy/litium.svg",
  logam_tanah_jarang: "/images/game/buildings/production/mineral-energy/logam-tanah-jarang.svg",
  bijih_besi: "/images/game/buildings/production/mineral-energy/bijih-besi.svg",
  pabrik_semikonduktor: "/images/game/buildings/production/manufacturing/pabrik-semikonduktor.svg",
  pabrik_mesin: "/images/game/buildings/production/manufacturing/pabrik-mesin.svg",
  pabrik_besi: "/images/game/buildings/production/manufacturing/pabrik-besi.svg",
  semen_beton: "/images/game/buildings/production/manufacturing/semen-beton.svg",
  kayu: "/images/game/buildings/production/manufacturing/kayu.svg",
  ayam_unggas: "/images/game/buildings/production/livestock/ayam-unggas.svg",
  sapi_perah: "/images/game/buildings/production/livestock/sapi-perah.svg",
  sapi_potong: "/images/game/buildings/production/livestock/sapi-potong.svg",
  domba_kambing: "/images/game/buildings/production/livestock/domba-kambing.svg",
  padi: "/images/game/buildings/production/agriculture/padi.svg",
  gandum: "/images/game/buildings/production/agriculture/gandum.svg",
  jagung: "/images/game/buildings/production/agriculture/jagung.svg",
  umbi: "/images/game/buildings/production/agriculture/umbi.svg",
  kedelai: "/images/game/buildings/production/agriculture/kedelai.svg",
  kelapa_sawit: "/images/game/buildings/production/agriculture/kelapa-sawit.svg",
  teh: "/images/game/buildings/production/agriculture/teh.svg",
  kopi: "/images/game/buildings/production/agriculture/kopi.svg",
  kakao: "/images/game/buildings/production/agriculture/kakao.svg",
  tebu: "/images/game/buildings/production/agriculture/tebu.svg",
  sayur: "/images/game/buildings/production/agriculture/sayur.svg",
  karet: "/images/game/buildings/production/agriculture/karet.svg",
  udang: "/images/game/buildings/production/fisheries/udang.svg",
  ikan: "/images/game/buildings/production/fisheries/ikan.svg",
  mutiara: "/images/game/buildings/production/fisheries/mutiara.svg",
  ...buildNumberedImageMap(
    ["air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu", "beras"],
    "production/processed-food"
  ),
  ...buildNumberedImageMap(
    ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"],
    "public/infrastructure"
  ),
  dasar: "/images/game/buildings/public/education/dasar.svg",
  prasekolah: "/images/game/buildings/public/education/prasekolah.svg",
  menengah: "/images/game/buildings/public/education/menengah.svg",
  lanjutan: "/images/game/buildings/public/education/lanjutan.svg",
  universitas: "/images/game/buildings/public/education/universitas.svg",
  lembaga_pendidikan: "/images/game/buildings/public/education/lembaga-pendidikan.svg",
  laboratorium: "/images/game/buildings/public/education/laboratorium.svg",
  observatorium: "/images/game/buildings/public/education/observatorium.svg",
  pusat_penelitian: "/images/game/buildings/public/education/pusat-penelitian.svg",
  pusat_pengembangan: "/images/game/buildings/public/education/pusat-pengembangan.svg",
  rumah_sakit_besar: "/images/game/buildings/public/healthcare/rumah-sakit-besar.svg",
  rumah_sakit_kecil: "/images/game/buildings/public/healthcare/rumah-sakit-kecil.svg",
  pusat_diagnostik: "/images/game/buildings/public/healthcare/pusat-diagnostik.svg",
  ...buildNumberedImageMap(
    ["pusat_bantuan_hukum", "pengadilan", "kejaksaan", "pos_polisi", "akademi_polisi"],
    "public/law-enforcement"
  ),
  ...buildNumberedImageMap(
    ["kolam_renang", "sirkuit_balap", "stadion", "stadion_internasional", "gym", "golf", "esports", "gokart", "bioskop", "teater"],
    "public/sports"
  ),
  ...buildNumberedImageMap(["mall", "hotel", "pusat_grosir_tekstil"], "public/commercial"),
  rumah_subsidi: "/images/game/buildings/housing/rumah-subsidi.svg",
  apartemen: "/images/game/buildings/housing/apartemen.svg",
  mansion: "/images/game/buildings/housing/mansion.svg",
};

const DEFENSE_UNIT_IMAGES: Record<string, string> = {
  barak: "/images/game/defense/land/defense-land-asset-01.svg",
  tank_tempur_utama: "/images/game/defense/land/defense-land-asset-02.svg",
  apc_ifv: "/images/game/defense/land/defense-land-asset-03.svg",
  artileri_berat: "/images/game/defense/land/defense-land-asset-04.svg",
  sistem_peluncur_roket: "/images/game/defense/land/defense-land-asset-05.svg",
  pertahanan_udara_mobile: "/images/game/defense/land/defense-land-asset-06.svg",
  kendaraan_taktis: "/images/game/defense/land/defense-land-asset-07.svg",
  kapal_induk: "/images/game/defense/sea/kapal-induk.svg",
  kapal_induk_nuklir: "/images/game/defense/sea/kapal-induk-nuklir.svg",
  kapal_destroyer: "/images/game/defense/sea/kapal-destroyer.svg",
  kapal_korvet: "/images/game/defense/sea/kapal-korvet.svg",
  kapal_selam_nuklir: "/images/game/defense/sea/kapal-selam-nuklir.svg",
  kapal_selam_regular: "/images/game/defense/sea/kapal-selam-regular.svg",
  kapal_ranjau: "/images/game/defense/sea/kapal-ranjau.svg",
  kapal_logistik: "/images/game/defense/sea/kapal-logistik.svg",
  jet_tempur_siluman: "/images/game/defense/air/jet-tempur-siluman.svg",
  jet_tempur_interceptor: "/images/game/defense/air/jet-tempur-interceptor.svg",
  pesawat_pengebom: "/images/game/defense/air/pesawat-pengebom.svg",
  helikopter_serang: "/images/game/defense/air/helikopter-serang.svg",
  pesawat_pengintai: "/images/game/defense/air/pesawat-pengintai.svg",
  drone_intai_uav: "/images/game/defense/air/drone-intai-uav.svg",
  drone_kamikaze: "/images/game/defense/air/drone-kamikaze.svg",
  pesawat_angkut: "/images/game/defense/air/pesawat-angkut.svg",
};

export const DEFENSE_UNIT_LABELS: Record<string, string> = {
  pasukan_infanteri: "Prajurit Infanteri",
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

const DEFENSE_INFRASTRUCTURE_IMAGES: Record<string, string> = {
  barak: "/images/game/defense/infrastructure/barak.svg",
  gudang_senjata: "/images/game/defense/infrastructure/gudang-senjata.svg",
  hangar_tank: "/images/game/defense/infrastructure/hangar-tank.svg",
  pangkalan_laut: "/images/game/defense/infrastructure/pangkalan-laut.svg",
  pangkalan_udara: "/images/game/defense/infrastructure/pangkalan-udara.svg",
};

export const getBuildingCardImage = (key: string) => BUILDING_CARD_IMAGES[key];

export const getDefenseUnitCardImage = (key: string) => DEFENSE_UNIT_IMAGES[key];

export const getDefenseInfrastructureCardImage = (key: string) =>
  DEFENSE_INFRASTRUCTURE_IMAGES[key];
