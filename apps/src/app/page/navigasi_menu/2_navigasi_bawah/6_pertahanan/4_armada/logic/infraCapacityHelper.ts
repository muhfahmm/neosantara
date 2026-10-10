// Helper utilities untuk menghitung penggunaan kapasitas infrastruktur militer

export interface CapacityDetail {
  used: number;
  totalCapacity: number;
  infraCount: number;
  capacityPerUnit: number;
  baseCapacityPerUnit: number;
  capacityBonusPct: number;
  unitLabel: string;
  isFull: boolean;
  supportedUnits: string[];
}

export function getInfraCapacityDetails(infraKey: string, countryDetail: any): CapacityDetail | null {
  if (!countryDetail) return null;

  const getData = (key: string, group?: string): number => {
    if (countryDetail?.[key] !== undefined && countryDetail?.[key] !== null) {
      const val = Number(countryDetail[key]); if (!Number.isNaN(val)) return val;
    }
    if (countryDetail?.pertahanan?.[key] !== undefined && countryDetail?.pertahanan?.[key] !== null) {
      const val = Number(countryDetail.pertahanan[key]); if (!Number.isNaN(val)) return val;
    }
    if (countryDetail?.armada?.[key] !== undefined && countryDetail?.armada?.[key] !== null) {
      const val = Number(countryDetail.armada[key]); if (!Number.isNaN(val)) return val;
    }
    if (group && countryDetail?.armada?.[group]?.[key] !== undefined && countryDetail?.armada?.[group]?.[key] !== null) {
      const val = Number(countryDetail.armada[group][key]); if (!Number.isNaN(val)) return val;
    }
    if (group && countryDetail?.[group]?.[key] !== undefined && countryDetail?.[group]?.[key] !== null) {
      const val = Number(countryDetail[group][key]); if (!Number.isNaN(val)) return val;
    }
    return 0;
  };

  const getCapacityResearchInfo = (researchId: string): { mult: number; bonusPct: number } => {
    const completedResearch = Array.isArray(countryDetail?.completed_research)
      ? countryDetail.completed_research
      : [];
    if (!completedResearch.includes(researchId)) return { mult: 1, bonusPct: 0 };

    const researchLevels = countryDetail?.research_levels && typeof countryDetail.research_levels === "object"
      ? countryDetail.research_levels
      : {};
    const storedLevel = Number(researchLevels[researchId]) || 1;
    const LEVEL_BONUS = [0, 2, 4, 7, 10, 15];
    const lvlIndex = Math.min(LEVEL_BONUS.length - 1, Math.max(1, Math.floor(storedLevel)));
    const bonusPct = LEVEL_BONUS[lvlIndex];
    return { mult: 1 + bonusPct / 100, bonusPct };
  };

  if (infraKey === "barak") {
    const count = getData("barak");
    const used = getData("pasukan_infanteri", "darat");
    const { mult, bonusPct } = getCapacityResearchInfo("kapal_stealth");
    const baseCapacityPerUnit = 10000;
    const capacityPerUnit = Math.round(baseCapacityPerUnit * mult);
    const totalCapacity = count * capacityPerUnit;
    return {
      used,
      totalCapacity,
      infraCount: count,
      capacityPerUnit,
      baseCapacityPerUnit,
      capacityBonusPct: bonusPct,
      unitLabel: "Pasukan Infanteri",
      isFull: count > 0 && used >= totalCapacity,
      supportedUnits: ["Pasukan Infanteri"]
    };
  }

  if (infraKey === "gudang_senjata") {
    const count = getData("gudang_senjata");
    const artileri = getData("artileri_berat", "darat");
    const roket = getData("sistem_peluncur_roket", "darat");
    const pertahananUdara = getData("pertahanan_udara_mobile", "darat");
    const kensTaktis = getData("kendaraan_taktis", "darat");
    const used = artileri + roket + pertahananUdara + kensTaktis;
    const { mult, bonusPct } = getCapacityResearchInfo("perang_siber");
    const baseCapacityPerUnit = 2500;
    const capacityPerUnit = Math.round(baseCapacityPerUnit * mult);
    const totalCapacity = count * capacityPerUnit;
    return {
      used,
      totalCapacity,
      infraCount: count,
      capacityPerUnit,
      baseCapacityPerUnit,
      capacityBonusPct: bonusPct,
      unitLabel: "Unit Persenjataan",
      isFull: count > 0 && used >= totalCapacity,
      supportedUnits: [
        "Artileri Berat",
        "Sistem Peluncur Roket",
        "Pertahanan Udara Mobile",
        "Kendaraan Taktis"
      ]
    };
  }

  if (infraKey === "hangar_tank") {
    const count = getData("hangar_tank");
    const mbt = getData("tank_tempur_utama", "darat");
    const apc = getData("apc_ifv", "darat");
    const used = mbt + apc;
    const { mult, bonusPct } = getCapacityResearchInfo("artileri_presisi");
    const baseCapacityPerUnit = 3000;
    const capacityPerUnit = Math.round(baseCapacityPerUnit * mult);
    const totalCapacity = count * capacityPerUnit;
    return {
      used,
      totalCapacity,
      infraCount: count,
      capacityPerUnit,
      baseCapacityPerUnit,
      capacityBonusPct: bonusPct,
      unitLabel: "Unit Kendaraan Lapis Baja",
      isFull: count > 0 && used >= totalCapacity,
      supportedUnits: [
        "Tank Tempur Utama (MBT)",
        "APC / IFV"
      ]
    };
  }

  if (infraKey === "pangkalan_udara") {
    const count = getData("pangkalan_udara");
    const siluman = getData("jet_tempur_siluman", "udara");
    const interceptor = getData("jet_tempur_interceptor", "udara");
    const pengebom = getData("pesawat_pengebom", "udara");
    const helikopter = getData("helikopter_serang", "udara");
    const pengintai = getData("pesawat_pengintai", "udara");
    const droneIntai = getData("drone_intai_uav", "udara");
    const droneKamikaze = getData("drone_kamikaze", "udara");
    const angkut = getData("pesawat_angkut", "udara");
    const used = siluman + interceptor + pengebom + helikopter + pengintai + droneIntai + droneKamikaze + angkut;
    const { mult, bonusPct } = getCapacityResearchInfo("kapal_selam_diesel");
    const baseCapacityPerUnit = 500;
    const capacityPerUnit = Math.round(baseCapacityPerUnit * mult);
    const totalCapacity = count * capacityPerUnit;
    return {
      used,
      totalCapacity,
      infraCount: count,
      capacityPerUnit,
      baseCapacityPerUnit,
      capacityBonusPct: bonusPct,
      unitLabel: "Unit Armada Udara",
      isFull: count > 0 && used >= totalCapacity,
      supportedUnits: [
        "Jet Tempur Siluman & Interceptor",
        "Pesawat Pengebom",
        "Helikopter Serang",
        "Pesawat Pengintai & Angkut",
        "Drone Intai UAV & Drone Kamikaze"
      ]
    };
  }

  if (infraKey === "pangkalan_laut") {
    const count = getData("pangkalan_laut");
    const kInduk = getData("kapal_induk", "laut");
    const kIndukNuklir = getData("kapal_induk_nuklir", "laut");
    const kDestroyer = getData("kapal_destroyer", "laut");
    const kKorvet = getData("kapal_korvet", "laut");
    const kSelamNuklir = getData("kapal_selam_nuklir", "laut");
    const kSelamReguler = getData("kapal_selam_regular", "laut");
    const kRanjau = getData("kapal_ranjau", "laut");
    const kLogistik = getData("kapal_logistik", "laut");
    const used = kInduk + kIndukNuklir + kDestroyer + kKorvet + kSelamNuklir + kSelamReguler + kRanjau + kLogistik;
    const { mult, bonusPct } = getCapacityResearchInfo("helikopter_serang");
    const baseCapacityPerUnit = 50;
    const capacityPerUnit = Math.round(baseCapacityPerUnit * mult);
    const totalCapacity = count * capacityPerUnit;
    return {
      used,
      totalCapacity,
      infraCount: count,
      capacityPerUnit,
      baseCapacityPerUnit,
      capacityBonusPct: bonusPct,
      unitLabel: "Unit Kapal Perang",
      isFull: count > 0 && used >= totalCapacity,
      supportedUnits: [
        "Kapal Induk & Kapal Induk Nuklir",
        "Kapal Destroyer & Kapal Korvet",
        "Kapal Selam Nuklir & Reguler",
        "Kapal Ranjau & Kapal Logistik"
      ]
    };
  }

  return null;
}

export function getArmadaCapacityInfo(armadaKey: string, countryDetail: any): { used: number; totalCapacity: number; infraName: string; isFull: boolean } | null {
  let infraKey = "";
  if (armadaKey === "barak") {
    infraKey = "barak";
  } else if (["tank_tempur_utama", "apc_ifv"].includes(armadaKey)) {
    infraKey = "hangar_tank";
  } else if (["artileri_berat", "sistem_peluncur_roket", "pertahanan_udara_mobile", "kendaraan_taktis"].includes(armadaKey)) {
    infraKey = "gudang_senjata";
  } else if (["jet_tempur_siluman", "jet_tempur_interceptor", "pesawat_pengebom", "helikopter_serang", "pesawat_pengintai", "drone_intai_uav", "drone_kamikaze", "pesawat_angkut"].includes(armadaKey)) {
    infraKey = "pangkalan_udara";
  } else if (["kapal_induk", "kapal_induk_nuklir", "kapal_destroyer", "kapal_korvet", "kapal_selam_nuklir", "kapal_selam_regular", "kapal_ranjau", "kapal_logistik"].includes(armadaKey)) {
    infraKey = "pangkalan_laut";
  }

  if (!infraKey) return null;

  const detail = getInfraCapacityDetails(infraKey, countryDetail);
  if (!detail) return null;

  const infraNames: Record<string, string> = {
    barak: "Barak Militer",
    hangar_tank: "Hangar Tank",
    gudang_senjata: "Gudang Senjata",
    pangkalan_udara: "Pangkalan Udara",
    pangkalan_laut: "Pangkalan Laut"
  };

  return {
    used: detail.used,
    totalCapacity: detail.totalCapacity,
    infraName: infraNames[infraKey] || infraKey,
    isFull: detail.isFull
  };
}
