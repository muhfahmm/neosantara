import { getKelistrikanFuelRequirements } from "../../5_pembangunan/1_produksi/requirements_logic/1_produksi/1_kelistrikan/fuelLogic";
import { getMaterialStock } from "../../5_pembangunan/build_logic/build_logic";

export function findMeta(metadata: Record<string, any> | undefined, key: string) {
  if (!metadata) return undefined;
  if (metadata[key]) return metadata[key];
  for (const k of Object.keys(metadata)) {
    const entry = metadata[k];
    if (!entry) continue;
    if (entry.dataKey === key) return entry;
    if (k.endsWith(`_${key}`) || k === `1_${key}`) return entry;
  }
  return undefined;
}

const SOURCE_ORDER = [
  "pembangkit_listrik_tenaga_nuklir",
  "pembangkit_listrik_tenaga_air",
  "pembangkit_listrik_tenaga_surya",
  "pembangkit_listrik_tenaga_uap",
  "pembangkit_listrik_tenaga_gas",
  "pembangkit_listrik_tenaga_angin"
];

export function getCountryConsumptionBreakdown(countryData: any, metadata: Record<string, any> = {}) {
  if (!countryData) {
    return {
      totalProductionMW: 0,
      hunianBreakdown: [],
      tempatUmumBreakdown: [],
      pertahananBreakdown: [],
      produksiBreakdown: [],
      totalHunianConsumption: 0,
      totalTempatUmumConsumption: 0,
      totalPertahananConsumption: 0,
      totalProduksiConsumption: 0,
      totalAllBreakdownConsumption: 0,
      balanceMW: 0,
    };
  }

  // 0. Total Produksi Listrik (Pembangkit)
  const totalProductionMW = SOURCE_ORDER.reduce((sum, key) => {
    const bMeta = findMeta(metadata, key);
    const count = Number(countryData?.[key]) || 0;
    const unitProduction = Number(bMeta?.produksi) || 0;
    let isFuelDeficit = false;
    if (count > 0) {
      const fuelReqs = getKelistrikanFuelRequirements(key);
      if (fuelReqs.length > 0) {
        for (const req of fuelReqs) {
          const stock = getMaterialStock(countryData, req.resourceKey);
          const totalNeeded = req.amount * count;
          if (stock < totalNeeded) {
            isFuelDeficit = true;
            break;
          }
        }
      }
    }
    return sum + (isFuelDeficit ? 0 : count * unitProduction);
  }, 0);

  // 1. Sektor Hunian
  const hunianKeys = [
    { key: "rumah_subsidi", label: "Perumahan Subsidi Rakyat", defaultRate: 0.0009 },
    { key: "apartemen", label: "Apartemen Modern & High-Rise", defaultRate: 0.0022 },
    { key: "mansion", label: "Kompleks Mansion Mewah", defaultRate: 0.0055 },
  ];

  const hunianBreakdown = hunianKeys.map((item) => {
    const count = Number(countryData?.[item.key]) || 0;
    const bMeta = findMeta(metadata, item.key);
    const rate = Number(bMeta?.konsumsi_listrik) || item.defaultRate;
    const total = count * rate;
    return {
      key: item.key,
      label: item.label,
      sector: "Hunian & Permukiman",
      count,
      rate,
      total,
    };
  });
  const totalHunianConsumption = hunianBreakdown.reduce((sum, h) => sum + h.total, 0);

  // 2. Sektor Tempat Umum
  const tempatUmumKeys = [
    { key: "jalan_raya", label: "Jalan Raya & Tol", sector: "Infrastruktur" },
    { key: "pelabuhan", label: "Pelabuhan Laut", sector: "Infrastruktur" },
    { key: "bandara", label: "Bandara Udara", sector: "Infrastruktur" },
    { key: "stasiun_kereta", label: "Stasiun Kereta Api", sector: "Infrastruktur" },
    { key: "terminal_bus", label: "Terminal Bus", sector: "Infrastruktur" },
    { key: "jembatan_nasional", label: "Jembatan Nasional", sector: "Infrastruktur" },
    { key: "pembangkit_listrik", label: "Jaringan Listrik Publik", sector: "Infrastruktur" },
    { key: "prasekolah", label: "PAUD & TK", sector: "Pendidikan" },
    { key: "dasar", label: "Sekolah Dasar (SD)", sector: "Pendidikan" },
    { key: "menengah", label: "Sekolah Menengah (SMP/SMA)", sector: "Pendidikan" },
    { key: "universitas", label: "Perguruan Tinggi / Universitas", sector: "Pendidikan" },
    { key: "laboratorium", label: "Laboratorium Riset", sector: "Pendidikan" },
    { key: "observatorium", label: "Observatorium Antariksa", sector: "Pendidikan" },
    { key: "rumah_sakit", label: "Rumah Sakit Umum", sector: "Kesehatan" },
    { key: "puskesmas", label: "Puskesmas Kecamatan", sector: "Kesehatan" },
    { key: "klinik", label: "Klinik Pratama", sector: "Kesehatan" },
    { key: "kantor_polisi", label: "Kantor Polisi", sector: "Hukum & Keamanan" },
    { key: "pos_polisi", label: "Pos Polisi", sector: "Hukum & Keamanan" },
    { key: "pengadilan", label: "Gedung Pengadilan", sector: "Hukum & Keamanan" },
    { key: "lapas", label: "Lembaga Pemasyarakatan", sector: "Hukum & Keamanan" },
    { key: "stadion", label: "Stadion Olahraga", sector: "Olahraga & Hiburan" },
    { key: "kolam_renang", label: "Fasilitas Akuatik", sector: "Olahraga & Hiburan" },
    { key: "taman_kota", label: "Taman Kota", sector: "Olahraga & Hiburan" },
    { key: "pasar_tradisional", label: "Pasar Tradisional", sector: "Komersial" },
    { key: "pusat_perbelanjaan", label: "Pusat Perbelanjaan / Mall", sector: "Komersial" },
    { key: "hotel", label: "Hotel & Penginapan", sector: "Komersial" },
  ];

  const tempatUmumBreakdown = tempatUmumKeys.map((item) => {
    const count = Number(countryData?.[item.key]) || 0;
    const bMeta = findMeta(metadata, item.key);
    const rate = Number(bMeta?.konsumsi_listrik) || 0;
    const total = count * rate;
    return {
      key: item.key,
      label: item.label,
      sector: item.sector,
      count,
      rate,
      total,
    };
  }).filter((item) => item.count > 0 || item.rate > 0);
  const totalTempatUmumConsumption = tempatUmumBreakdown.reduce((sum, t) => sum + t.total, 0);

  // 3. Sektor Pertahanan & Keamanan
  const pertahananKeys = [
    { key: "barak", label: "Barak Militer", defaultRate: 0.5, sector: "Militer & Pertahanan" },
    { key: "gudang_senjata", label: "Gudang Senjata & Amunisi", defaultRate: 0.5, sector: "Militer & Pertahanan" },
    { key: "hangar_tank", label: "Hangar Tank & Kendaraan Tempur", defaultRate: 0.5, sector: "Militer & Pertahanan" },
    { key: "pangkalan_udara", label: "Pangkalan Angkatan Udara", defaultRate: 0.5, sector: "Militer & Pertahanan" },
    { key: "pangkalan_laut", label: "Pangkalan Angkatan Laut", defaultRate: 0.5, sector: "Militer & Pertahanan" },
    { key: "markas_komando", label: "Markas Besar Komando Militer", defaultRate: 0.5, sector: "Militer & Pertahanan" },
    { key: "pos_perbatasan", label: "Pos Pengamanan Perbatasan", defaultRate: 0.2, sector: "Militer & Pertahanan" },
    { key: "sistem_radar", label: "Stasiun Radar Pertahanan Udara", defaultRate: 0.8, sector: "Militer & Pertahanan" },
  ];

  const pertahananBreakdown = pertahananKeys.map((item) => {
    let count = Number(countryData?.[item.key]) || 0;
    if (count <= 0 && countryData?.pertahanan?.[item.key] !== undefined) {
      count = Number(countryData.pertahanan[item.key]) || 0;
    }
    const bMeta = findMeta(metadata, item.key);
    const rate = Number(bMeta?.konsumsi_listrik) || item.defaultRate;
    const total = count * rate;
    return {
      key: item.key,
      label: item.label,
      sector: item.sector,
      count,
      rate,
      total,
    };
  });
  const totalPertahananConsumption = pertahananBreakdown.reduce((sum, p) => sum + p.total, 0);

  // 4. Sektor Produksi & Industri
  const produksiBreakdown: Array<{ key: string; label: string; sector: string; count: number; rate: number; total: number }> = [];
  if (metadata) {
    Object.keys(metadata).forEach((mKey) => {
      const bMeta = metadata[mKey];
      const rate = Number(bMeta?.konsumsi_listrik) || 0;
      if (rate <= 0) return;

      const dataKey = bMeta?.dataKey || mKey.replace(/^\d+_/, "");
      if (hunianKeys.some((h) => h.key === dataKey)) return;
      if (pertahananKeys.some((p) => p.key === dataKey)) return;

      const count = Number(countryData?.[dataKey]) || Number(countryData?.[mKey]) || 0;
      const label = bMeta?.nama_bangunan || bMeta?.label || dataKey.replace(/_/g, " ").toUpperCase();
      const total = count * rate;

      if (!produksiBreakdown.some((l) => l.key === dataKey)) {
        produksiBreakdown.push({
          key: dataKey,
          label,
          sector: "Produksi & Manufaktur",
          count,
          rate,
          total,
        });
      }
    });
  }
  const totalProduksiConsumption = produksiBreakdown.reduce((sum, p) => sum + p.total, 0);

  const totalAllBreakdownConsumption = totalProduksiConsumption + totalTempatUmumConsumption + totalPertahananConsumption + totalHunianConsumption;
  const balanceMW = totalProductionMW - totalAllBreakdownConsumption;

  return {
    totalProductionMW,
    hunianBreakdown,
    tempatUmumBreakdown,
    pertahananBreakdown,
    produksiBreakdown,
    totalHunianConsumption,
    totalTempatUmumConsumption,
    totalPertahananConsumption,
    totalProduksiConsumption,
    totalAllBreakdownConsumption,
    balanceMW,
  };
}
