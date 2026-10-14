"use client";

import React, { useMemo } from "react";
import {
  Zap,
  Gem,
  Factory,
  Wheat,
  Fish,
  ShoppingBag,
  Building2,
  GraduationCap,
  HeartPulse,
  Scale,
  Smile,
  Home,
  Shield,
  Swords,
  Ship,
  Plane,
  Warehouse,
  Search,
} from "lucide-react";
import { getInfraCapacityDetails } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/infraCapacityHelper";
import { convertBarakToSoldiers } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/1_barak_logic";

interface PembangunanSipilMiliterSectionProps {
  countryDetail: Record<string, any> | null;
  metadata: Record<string, any>;
  initialBuildingKey?: string;
}

// ----------------------------------------------------
// DEFINISI KATEGORI & KARTU PEMBANGUNAN SIPIL / PRODUKSI
// ----------------------------------------------------

interface CivilCardItem {
  key: string;
  label: string;
  defaultUnit?: string;
  unitSuffix?: string;
}

interface CivilCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  badgeCount?: number;
  items: CivilCardItem[];
}

const CIVIL_CATEGORIES: CivilCategory[] = [
  {
    id: "kelistrikan_infra",
    title: "Kelistrikan (Pembangkit)",
    icon: Zap,
    description: "Infrastruktur grid pembangkit tenaga listrik nasional",
    items: [
      { key: "pembangkit_listrik_tenaga_nuklir", label: "PLT Nuklir (PLTN)", unitSuffix: "unit" },
      { key: "pembangkit_listrik_tenaga_air", label: "PLT Air (PLTA)", unitSuffix: "unit" },
      { key: "pembangkit_listrik_tenaga_surya", label: "PLT Surya (PLTS)", unitSuffix: "unit" },
      { key: "pembangkit_listrik_tenaga_uap", label: "PLT Uap (PLTU)", unitSuffix: "unit" },
      { key: "pembangkit_listrik_tenaga_gas", label: "PLT Gas (PLTG)", unitSuffix: "unit" },
      { key: "pembangkit_listrik_tenaga_angin", label: "PLT Angin (PLTB)", unitSuffix: "unit" },
      { key: "pembangkit_listrik_tenaga_panas_bumi", label: "PLT Panas Bumi (PLTP)", unitSuffix: "unit" },
      { key: "pembangkit_listrik_tenaga_hidrogen", label: "PLT Hidrogen", unitSuffix: "unit" },
      { key: "pembangkit_listrik_tenaga_gelombang_laut", label: "PLT Gelombang Laut", unitSuffix: "unit" },
      { key: "pembangkit_listrik_tenaga_fusi_nuklir", label: "PLT Fusi Nuklir", unitSuffix: "unit" },
    ],
  },
  {
    id: "mineral_energi",
    title: "Mineral & Energi",
    icon: Gem,
    description: "Tambang, pengeboran dan ekstraksi mineral kritis energi",
    items: [
      { key: "emas", label: "Tambang Emas", unitSuffix: "unit" },
      { key: "uranium", label: "Tambang Uranium", unitSuffix: "unit" },
      { key: "batu_bara", label: "Tambang Batu Bara", unitSuffix: "unit" },
      { key: "minyak_bumi", label: "Kilang Minyak Bumi", unitSuffix: "unit" },
      { key: "gas_alam", label: "Kilang Gas Alam", unitSuffix: "unit" },
      { key: "garam", label: "Tambang Garam", unitSuffix: "unit" },
      { key: "litium", label: "Tambang Litium", unitSuffix: "unit" },
      { key: "logam_tanah_jarang", label: "Logam Tanah Jarang", unitSuffix: "unit" },
      { key: "bijih_besi", label: "Tambang Bijih Besi", unitSuffix: "unit" },
    ],
  },
  {
    id: "manufaktur",
    title: "Manufaktur",
    icon: Factory,
    description: "Pabrik peleburan besi, semikonduktor, mesin, dan material dasar",
    items: [
      { key: "pabrik_semikonduktor", label: "Pabrik Semikonduktor", unitSuffix: "unit" },
      { key: "pabrik_mesin", label: "Pabrik Mesin", unitSuffix: "unit" },
      { key: "pabrik_besi", label: "Pabrik Baja / Besi", unitSuffix: "unit" },
      { key: "semen_beton", label: "Pabrik Semen & Beton", unitSuffix: "unit" },
      { key: "kayu", label: "Industri Kayu", unitSuffix: "unit" },
    ],
  },
  {
    id: "peternakan",
    title: "Peternakan",
    icon: ShoppingBag,
    description: "Sentra pembiakan ternak ruminansia dan unggas nasional",
    items: [
      { key: "ayam_unggas", label: "Peternakan Ayam Unggas", unitSuffix: "unit" },
      { key: "sapi_perah", label: "Peternakan Sapi Perah", unitSuffix: "unit" },
      { key: "sapi_potong", label: "Peternakan Sapi Potong", unitSuffix: "unit" },
      { key: "domba_kambing", label: "Peternakan Domba & Kambing", unitSuffix: "unit" },
    ],
  },
  {
    id: "agrikultur",
    title: "Agrikultur",
    icon: Wheat,
    description: "Perkebunan pangan, hortikultura, dan komoditas perkebunan",
    items: [
      { key: "padi", label: "Lahan Padi", unitSuffix: "unit" },
      { key: "gandum", label: "Lahan Gandum", unitSuffix: "unit" },
      { key: "jagung", label: "Lahan Jagung", unitSuffix: "unit" },
      { key: "sayur", label: "Kebun Sayuran", unitSuffix: "unit" },
      { key: "umbi", label: "Kebun Umbi-umbian", unitSuffix: "unit" },
      { key: "kedelai", label: "Lahan Kedelai", unitSuffix: "unit" },
      { key: "kelapa_sawit", label: "Perkebunan Kelapa Sawit", unitSuffix: "unit" },
      { key: "kopi", label: "Perkebunan Kopi", unitSuffix: "unit" },
      { key: "teh", label: "Perkebunan Teh", unitSuffix: "unit" },
      { key: "kakao", label: "Perkebunan Kakao", unitSuffix: "unit" },
      { key: "tebu", label: "Perkebunan Tebu", unitSuffix: "unit" },
      { key: "karet", label: "Perkebunan Karet", unitSuffix: "unit" },
    ],
  },
  {
    id: "perikanan",
    title: "Perikanan",
    icon: Fish,
    description: "Sentra budidaya dan tangkap sumber daya laut & air tawar",
    items: [
      { key: "ikan", label: "Perikanan Tangkap Laut", unitSuffix: "unit" },
      { key: "udang", label: "Tambak Udang", unitSuffix: "unit" },
      { key: "mutiara", label: "Budidaya Mutiara", unitSuffix: "unit" },
    ],
  },
  {
    id: "olahan_pangan",
    title: "Olahan Pangan",
    icon: ShoppingBag,
    description: "Pabrik pengolahan bahan mentah pangan menjadi komoditas siap saji",
    items: [
      { key: "beras", label: "Pabrik Pengolahan Beras", unitSuffix: "unit" },
      { key: "gula", label: "Pabrik Gula", unitSuffix: "unit" },
      { key: "roti", label: "Pabrik Roti", unitSuffix: "unit" },
      { key: "mie_instan", label: "Pabrik Mie Instan", unitSuffix: "unit" },
      { key: "minyak_goreng", label: "Pabrik Minyak Goreng", unitSuffix: "unit" },
      { key: "susu", label: "Pabrik Pengolahan Susu", unitSuffix: "unit" },
      { key: "pengolahan_daging", label: "Pabrik Pengolahan Daging", unitSuffix: "unit" },
      { key: "air_mineral", label: "Pabrik Air Mineral", unitSuffix: "unit" },
    ],
  },
  {
    id: "infrastruktur",
    title: "Infrastruktur",
    icon: Building2,
    description: "Jaringan transportasi massal, logistik darat, laut dan udara (8 Jenis Fasilitas)",
    badgeCount: 8,
    items: [
      { key: "jalur_sepeda", label: "Jalur Sepeda", unitSuffix: "fasilitas" },
      { key: "jalan_raya", label: "Jalan Raya Nasional", unitSuffix: "fasilitas" },
      { key: "terminal_bus", label: "Terminal Bus", unitSuffix: "fasilitas" },
      { key: "stasiun_kereta_api", label: "Stasiun Kereta Api", unitSuffix: "fasilitas" },
      { key: "kereta_bawah_tanah", label: "Kereta Bawah Tanah (MRT)", unitSuffix: "fasilitas" },
      { key: "pelabuhan", label: "Pelabuhan Internasional", unitSuffix: "fasilitas" },
      { key: "bandara", label: "Bandara Internasional", unitSuffix: "fasilitas" },
      { key: "helipad", label: "Helipad Taktis", unitSuffix: "fasilitas" },
    ],
  },
  {
    id: "pendidikan",
    title: "Pendidikan",
    icon: GraduationCap,
    description: "Lembaga pendidikan berjenjang dan pusat riset inovasi (10 Jenis Fasilitas)",
    badgeCount: 10,
    items: [
      { key: "prasekolah", label: "Prasekolah / PAUD", unitSuffix: "gedung" },
      { key: "dasar", label: "Sekolah Dasar", unitSuffix: "gedung" },
      { key: "menengah", label: "Sekolah Menengah Pertama", unitSuffix: "gedung" },
      { key: "lanjutan", label: "Sekolah Menengah Atas", unitSuffix: "gedung" },
      { key: "universitas", label: "Universitas", unitSuffix: "kampus" },
      { key: "lembaga_pendidikan", label: "Lembaga Pendidikan Vokasi", unitSuffix: "gedung" },
      { key: "laboratorium", label: "Laboratorium Sains", unitSuffix: "fasilitas" },
      { key: "observatorium", label: "Observatorium Astronomi", unitSuffix: "fasilitas" },
      { key: "pusat_penelitian", label: "Pusat Penelitian Nasional", unitSuffix: "fasilitas" },
      { key: "pusat_pengembangan", label: "Pusat Riset & Pengembangan", unitSuffix: "fasilitas" },
    ],
  },
  {
    id: "kesehatan",
    title: "Kesehatan",
    icon: HeartPulse,
    description: "Pusat pelayanan medis dan fasilitas diagnostik kesehatan (3 Jenis Fasilitas)",
    badgeCount: 3,
    items: [
      { key: "rumah_sakit_besar", label: "Rumah Sakit Besar (Pusat)", unitSuffix: "gedung" },
      { key: "rumah_sakit_kecil", label: "Rumah Sakit Daerah / Klinik", unitSuffix: "gedung" },
      { key: "pusat_diagnostik", label: "Pusat Diagnostik Medis", unitSuffix: "fasilitas" },
    ],
  },
  {
    id: "penegakan_hukum",
    title: "Penegakan Hukum",
    icon: Scale,
    description: "Sistem peradilan, kepolisian, dan pengayoman hukum (5 Jenis Fasilitas)",
    badgeCount: 5,
    items: [
      { key: "pusat_bantuan_hukum", label: "Pusat Bantuan Hukum", unitSuffix: "kantor" },
      { key: "pengadilan", label: "Gedung Pengadilan", unitSuffix: "kantor" },
      { key: "kejaksaan", label: "Gedung Kejaksaan", unitSuffix: "kantor" },
      { key: "pos_polisi", label: "Pos & Markas Polisi", unitSuffix: "pos" },
      { key: "akademi_polisi", label: "Akademi Kepolisian", unitSuffix: "kampus" },
    ],
  },
  {
    id: "olahraga_hiburan",
    title: "Olahraga & Hiburan",
    icon: Smile,
    description: "Arena pertandingan, gelanggang rekreasi, dan fasilitas seni budaya (10 Jenis Fasilitas)",
    badgeCount: 10,
    items: [
      { key: "kolam_renang", label: "Kolam Renang Akuatik", unitSuffix: "kompleks" },
      { key: "sirkuit_balap", label: "Sirkuit Balap Internasional", unitSuffix: "sirkuit" },
      { key: "stadion", label: "Stadion Olahraga", unitSuffix: "stadion" },
      { key: "stadion_internasional", label: "Stadion Internasional", unitSuffix: "stadion" },
      { key: "gym", label: "Pusat Kebugaran / Gym", unitSuffix: "pusat" },
      { key: "golf", label: "Lapangan Golf Eksklusif", unitSuffix: "lapangan" },
      { key: "esports", label: "Arena Esports", unitSuffix: "arena" },
      { key: "gokart", label: "Sirkuit Gokart", unitSuffix: "arena" },
      { key: "bioskop", label: "Gedung Bioskop Modern", unitSuffix: "gedung" },
      { key: "teater", label: "Gedung Teater & Seni", unitSuffix: "gedung" },
    ],
  },
  {
    id: "komersial",
    title: "Komersial",
    icon: ShoppingBag,
    description: "Sentra perdagangan ritel terpadu dan perhotelan (3 Jenis Fasilitas)",
    badgeCount: 3,
    items: [
      { key: "mall", label: "Pusat Perbelanjaan (Mall)", unitSuffix: "mall" },
      { key: "hotel", label: "Hotel & Resor Komersial", unitSuffix: "hotel" },
      { key: "pusat_grosir_tekstil", label: "Pusat Grosir Tekstil", unitSuffix: "kompleks" },
    ],
  },
  {
    id: "perumahan",
    title: "Perumahan",
    icon: Home,
    description: "Kawasan pemukiman, apartemen vertikal, dan hunian mewah",
    items: [
      { key: "rumah_subsidi", label: "Perumahan Subsidi", unitSuffix: "unit", defaultUnit: "Kapasitas 5 jiwa/unit" },
      { key: "apartemen", label: "Apartemen Vertikal", unitSuffix: "gedung", defaultUnit: "Kapasitas 6.000 jiwa/tower" },
      { key: "mansion", label: "Kawasan Mansion Mewah", unitSuffix: "unit", defaultUnit: "Kapasitas 10 jiwa/mansion" },
    ],
  },
];

// ----------------------------------------------------
// DEFINISI KARTU MILITER: ARMADA AKTIF & INFRASTRUKTUR
// ----------------------------------------------------

interface MilitaryUnitItem {
  key: string;
  label: string;
  group: "darat" | "laut" | "udara";
  isInfantry?: boolean;
  unitLabel: string;
}

const MILITARY_UNITS: MilitaryUnitItem[] = [
  // Pasukan Darat
  { key: "barak", label: "Pasukan Infanteri", group: "darat", isInfantry: true, unitLabel: "Pasukan / Kapasitas" },
  { key: "tank_tempur_utama", label: "Tank Tempur Utama", group: "darat", unitLabel: "unit" },
  { key: "apc_ifv", label: "APC / IFV", group: "darat", unitLabel: "unit" },
  { key: "artileri_berat", label: "Artileri Berat", group: "darat", unitLabel: "unit" },
  { key: "sistem_peluncur_roket", label: "Sistem Peluncur Roket", group: "darat", unitLabel: "unit" },
  { key: "pertahanan_udara_mobile", label: "Pertahanan Udara Mobile", group: "darat", unitLabel: "unit" },
  { key: "kendaraan_taktis", label: "Kendaraan Taktis", group: "darat", unitLabel: "unit" },

  // Armada Laut
  { key: "kapal_induk", label: "Kapal Induk", group: "laut", unitLabel: "unit" },
  { key: "kapal_induk_nuklir", label: "Kapal Induk Nuklir", group: "laut", unitLabel: "unit" },
  { key: "kapal_destroyer", label: "Kapal Destroyer", group: "laut", unitLabel: "unit" },
  { key: "kapal_korvet", label: "Kapal Korvet", group: "laut", unitLabel: "unit" },
  { key: "kapal_selam_nuklir", label: "Kapal Selam Nuklir", group: "laut", unitLabel: "unit" },
  { key: "kapal_selam_regular", label: "Kapal Selam Reguler", group: "laut", unitLabel: "unit" },
  { key: "kapal_ranjau", label: "Kapal Ranjau", group: "laut", unitLabel: "unit" },
  { key: "kapal_logistik", label: "Kapal Logistik", group: "laut", unitLabel: "unit" },

  // Armada Udara
  { key: "jet_tempur_siluman", label: "Jet Tempur Siluman", group: "udara", unitLabel: "unit" },
  { key: "jet_tempur_interceptor", label: "Jet Tempur Interceptor", group: "udara", unitLabel: "unit" },
  { key: "pesawat_pengebom", label: "Pesawat Pengebom", group: "udara", unitLabel: "unit" },
  { key: "helikopter_serang", label: "Helikopter Serang", group: "udara", unitLabel: "unit" },
  { key: "pesawat_pengintai", label: "Pesawat Pengintai", group: "udara", unitLabel: "unit" },
  { key: "drone_intai_uav", label: "Drone Intai UAV", group: "udara", unitLabel: "unit" },
  { key: "drone_kamikaze", label: "Drone Kamikaze", group: "udara", unitLabel: "unit" },
  { key: "pesawat_angkut", label: "Pesawat Angkut", group: "udara", unitLabel: "unit" },
];

interface MilitaryInfraItem {
  key: string;
  label: string;
  supportedUnitsLabel: string;
}

const MILITARY_INFRASTRUCTURES: MilitaryInfraItem[] = [
  { key: "barak", label: "Barak Militer", supportedUnitsLabel: "Pasukan Infanteri" },
  { key: "gudang_senjata", label: "Gudang Senjata", supportedUnitsLabel: "Unit Persenjataan" },
  { key: "hangar_tank", label: "Hangar Tank", supportedUnitsLabel: "Unit Kendaraan Tempur Lapis Baja" },
  { key: "pangkalan_udara", label: "Pangkalan Udara", supportedUnitsLabel: "Unit Armada Udara" },
  { key: "pangkalan_laut", label: "Pangkalan Laut", supportedUnitsLabel: "Unit Kapal Perang" },
];

const formatNumber = (val: unknown): string => {
  const num = Number(val ?? 0);
  return Number.isFinite(num) ? num.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "0";
};

const formatCompletionDate = (value: unknown): string => {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

export default function PembangunanSipilMiliterSection({
  countryDetail,
  initialBuildingKey,
}: PembangunanSipilMiliterSectionProps) {
  const initialCivilCategory = CIVIL_CATEGORIES.find((category) =>
    category.items.some((item) => item.key === initialBuildingKey),
  );
  const initialMilitaryItem = [...MILITARY_UNITS, ...MILITARY_INFRASTRUCTURES].find(
    (item) => item.key === initialBuildingKey,
  );
  const [subTab, setSubTab] = React.useState<"sipil" | "militer">(
    initialCivilCategory ? "sipil" : initialMilitaryItem ? "militer" : "sipil",
  );
  const [activeCivilCategory, setActiveCivilCategory] = React.useState<string>(
    initialCivilCategory?.id || "kelistrikan_infra",
  );
  const [searchQuery, setSearchQuery] = React.useState<string>(
    initialCivilCategory?.items.find((item) => item.key === initialBuildingKey)?.label ||
      initialMilitaryItem?.label ||
      "",
  );

  const pendingCivilianConstructions = Array.isArray(countryDetail?.ai_civilian_construction_queue)
    ? countryDetail.ai_civilian_construction_queue as Array<{
        buildingKey: string;
        jumlah: number;
        completionDate?: string;
        daysRemaining?: number;
      }>
    : [];
  const pendingMilitaryInfra = Array.isArray(countryDetail?.ai_military_infra_queue)
    ? countryDetail.ai_military_infra_queue as Array<{
        infraKey: string;
        jumlah: number;
        completionDate?: string;
        daysRemaining?: number;
      }>
    : [];
  const pendingMilitaryUnits = Array.isArray(countryDetail?.ai_military_unit_queue)
    ? countryDetail.ai_military_unit_queue as Array<{
        unitKey: string;
        jumlah: number;
        completionDate?: string;
        daysRemaining?: number;
      }>
    : [];

  const getBuildingValue = (key: string): number => {
    if (!countryDetail) return 0;
    if (countryDetail[key] !== undefined && countryDetail[key] !== null) {
      const v = Number(countryDetail[key]);
      if (!Number.isNaN(v)) return v;
    }
    if (countryDetail.pertahanan?.[key] !== undefined && countryDetail.pertahanan?.[key] !== null) {
      const v = Number(countryDetail.pertahanan[key]);
      if (!Number.isNaN(v)) return v;
    }
    if (countryDetail.armada?.[key] !== undefined && countryDetail.armada?.[key] !== null) {
      const v = Number(countryDetail.armada[key]);
      if (!Number.isNaN(v)) return v;
    }
    return 0;
  };

  const getMilitaryUnitValue = (key: string, group: "darat" | "laut" | "udara"): number => {
    if (!countryDetail) return 0;
    const values = [
      countryDetail.armada?.[group]?.[key],
      countryDetail[key],
      countryDetail.pertahanan?.[key],
      countryDetail.armada?.[key],
      countryDetail[group]?.[key],
    ];
    const counts = values.map(Number).filter((v) => Number.isFinite(v) && v >= 0);
    return counts.find((v) => v > 0) ?? counts[0] ?? 0;
  };

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    CIVIL_CATEGORIES.forEach((cat) => {
      stats[cat.id] = cat.items.reduce((sum, it) => sum + getBuildingValue(it.key), 0);
    });
    return stats;
  }, [countryDetail]);

  const infantryData = useMemo(() => {
    const currentBarak = getBuildingValue("barak");
    const infantryCount = getMilitaryUnitValue("pasukan_infanteri", "darat");
    const capDetail = getInfraCapacityDetails("barak", countryDetail);
    const maxCapacity = capDetail?.totalCapacity ?? convertBarakToSoldiers(currentBarak);
    return {
      count: infantryCount,
      capacity: maxCapacity,
      barak: currentBarak,
    };
  }, [countryDetail]);

  const activeCategoryObj = useMemo(
    () => CIVIL_CATEGORIES.find((c) => c.id === activeCivilCategory) || CIVIL_CATEGORIES[0],
    [activeCivilCategory]
  );

  const filteredCivilItems = useMemo(() => {
    if (!searchQuery.trim()) return activeCategoryObj.items;
    const q = searchQuery.toLowerCase();
    return activeCategoryObj.items.filter((item) => item.label.toLowerCase().includes(q));
  }, [activeCategoryObj, searchQuery]);

  const filteredMilitaryUnits = useMemo(() => {
    if (!searchQuery.trim()) return MILITARY_UNITS;
    const q = searchQuery.toLowerCase();
    return MILITARY_UNITS.filter((item) => item.label.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredMilitaryInfra = useMemo(() => {
    if (!searchQuery.trim()) return MILITARY_INFRASTRUCTURES;
    const q = searchQuery.toLowerCase();
    return MILITARY_INFRASTRUCTURES.filter((item) => item.label.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0F2424] text-[#E0E0E0] rounded-2xl overflow-hidden border border-[#00FFAA]/20 shadow-sm">
      {/* HEADER SUB SWITCHER */}
      <div className="bg-[#0A1A1A] border-b border-[#00FFAA]/20 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1.5 bg-[#0F2424] p-1 rounded-xl border border-[#00FFAA]/30">
          <button
            onClick={() => {
              setSubTab("sipil");
              setSearchQuery("");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === "sipil"
                ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20"
                : "text-[#6B8A8A] hover:text-[#00FFAA]"
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Fasilitas Sipil</span>
          </button>
          <button
            onClick={() => {
              setSubTab("militer");
              setSearchQuery("");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === "militer"
                ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20"
                : "text-[#6B8A8A] hover:text-[#00FFAA]"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Militer & Infrastruktur</span>
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#6B8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari item pembangunan..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/30 text-xs text-[#E0E0E0] placeholder:text-[#6B8A8A] focus:outline-none focus:border-[#00FFAA]"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex min-h-[480px] relative">
        {subTab === "sipil" && (
          <>
            {/* Sidebar Kategori */}
            <div className="w-48 sm:w-56 border-r border-[#00FFAA]/20 bg-[#0A1A1A] p-2.5 flex flex-col gap-1 overflow-y-auto no-scrollbar shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A] px-2 py-1 mb-1">
                Kategori Sektor
              </p>
              {CIVIL_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCivilCategory === cat.id;
                const totalCount = categoryStats[cat.id] ?? 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCivilCategory(cat.id);
                      setSearchQuery("");
                    }}
                    className={`flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer group ${
                      isActive
                        ? "bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA] font-black shadow-md shadow-[#00FFAA]/20"
                        : "bg-[#0F2424]/60 border-[#00FFAA]/15 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/10 hover:text-[#00FFAA]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? "text-[#0A1A1A]" : "text-[#00FFAA] group-hover:scale-110"
                        } transition-transform`}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                        {cat.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {cat.badgeCount !== undefined && (
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                            isActive ? "bg-[#0A1A1A]/30 text-[#0A1A1A]" : "bg-[#0A1A1A] text-amber-400 border border-amber-400/30"
                          }`}
                        >
                          {cat.badgeCount}
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive ? "bg-[#0A1A1A] text-[#00FFAA]" : "bg-[#0A1A1A] text-[#6B8A8A]"
                        }`}
                      >
                        {formatNumber(totalCount)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Grid Kartu Sipil */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0F2424] overflow-y-auto p-4 custom-scrollbar">
              <div className="mb-3">
                <h4 className="text-sm font-black uppercase tracking-wider text-[#00FFAA] flex items-center gap-2">
                  <activeCategoryObj.icon className="w-4 h-4 text-[#00FFAA]" />
                  {activeCategoryObj.title}
                </h4>
                <p className="text-[10px] text-[#6B8A8A] font-semibold">
                  {activeCategoryObj.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredCivilItems.map((item) => {
                  const count = getBuildingValue(item.key);
                  const isZero = count === 0;
                  const pending = pendingCivilianConstructions.filter((entry) => entry.buildingKey === item.key);
                  const pendingCount = pending.reduce((total, entry) => total + (Number(entry.jumlah) || 0), 0);
                  const completionDate = pending
                    .map((entry) => entry.completionDate)
                    .filter((date): date is string => Boolean(date))
                    .sort()
                    .at(-1);
                  const remainingDays = pending.length > 0
                    ? Math.min(...pending.map((entry) => Math.max(0, Number(entry.daysRemaining) || 0)))
                    : 0;
                  return (
                    <div
                      key={item.key}
                      className="relative overflow-visible bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-2xl p-3 flex flex-col justify-between hover:border-[#00FFAA]/50 transition-all shadow-sm min-h-[95px]"
                    >
                      {pendingCount > 0 && completionDate && (
                        <div className="absolute -top-3 left-2 z-10 bg-[#0A1A1A] text-amber-300 text-[9px] font-bold px-2 py-0.5 border border-amber-400/40 rounded whitespace-nowrap">
                          Dalam pembangunan · selesai {formatCompletionDate(completionDate)}
                          {remainingDays > 0 ? ` · ${remainingDays} hari` : ""}
                        </div>
                      )}
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#8AB0A8] leading-tight line-clamp-2">
                        {item.label}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-lg font-black tracking-tight leading-none ${
                              isZero ? "text-[#6B8A8A]" : "text-[#E0E0E0]"
                            }`}
                          >
                            {formatNumber(count)}
                          </span>
                          <span className="text-[9px] font-bold text-[#6B8A8A] uppercase">
                            {item.unitSuffix || "unit"}
                          </span>
                        </div>
                        {pendingCount > 0 && (
                          <p className="text-[9px] font-bold text-amber-300 mt-1">
                            +{formatNumber(pendingCount)} dalam pembangunan
                          </p>
                        )}
                        {item.defaultUnit && (
                          <p className="text-[8px] text-[#6B8A8A] font-semibold mt-0.5 truncate">
                            {item.defaultUnit}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {subTab === "militer" && (
          <div className="flex-1 flex flex-col min-w-0 bg-[#0F2424] overflow-y-auto p-4 custom-scrollbar space-y-5">
            {/* Unit Armada */}
            <div>
              <div className="flex items-center gap-2 mb-2.5 border-b border-[#00FFAA]/15 pb-1.5">
                <Swords className="w-3.5 h-3.5 text-[#00FFAA]" />
                <h5 className="text-xs font-black uppercase tracking-wider text-[#00FFAA]">
                  Unit Armada Aktif (23 Jenis Unit)
                </h5>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredMilitaryUnits.map((unit) => {
                  let displayText = "";
                  let subText = unit.unitLabel;
                  let isHighlighted = false;

                  if (unit.isInfantry) {
                    displayText = `${formatNumber(infantryData.count)} / ${formatNumber(infantryData.capacity)}`;
                    subText = "Pasukan / Kapasitas";
                    isHighlighted = true;
                  } else {
                    const count = getMilitaryUnitValue(unit.key, unit.group);
                    displayText = formatNumber(count);
                  }

                  const GroupIcon =
                    unit.group === "darat" ? Swords : unit.group === "laut" ? Ship : Plane;
                  const pending = pendingMilitaryUnits.filter((entry) => entry.unitKey === unit.key);
                  const pendingCount = pending.reduce((total, entry) => total + (Number(entry.jumlah) || 0), 0);
                  const completionDate = pending
                    .map((entry) => entry.completionDate)
                    .filter((date): date is string => Boolean(date))
                    .sort()
                    .at(-1);
                  const remainingDays = pending.length > 0
                    ? Math.min(...pending.map((entry) => Math.max(0, Number(entry.daysRemaining) || 0)))
                    : 0;

                  return (
                    <div
                      key={unit.key}
                      className={`relative overflow-visible bg-[#0A1A1A] border rounded-2xl p-3 flex flex-col justify-between transition-all shadow-sm min-h-[95px] ${
                        isHighlighted
                          ? "border-[#00FFAA]/40 bg-[#0A1A1A]/90 hover:border-[#00FFAA]"
                          : "border-[#00FFAA]/20 hover:border-[#00FFAA]/50"
                      }`}
                    >
                      {pendingCount > 0 && completionDate && (
                        <div className="absolute -top-3 left-2 z-10 bg-[#0A1A1A] text-amber-300 text-[9px] font-bold px-2 py-0.5 border border-amber-400/40 rounded whitespace-nowrap">
                          Dalam pembuatan · selesai {formatCompletionDate(completionDate)}
                          {remainingDays > 0 ? ` · ${remainingDays} hari` : ""}
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#8AB0A8] leading-tight line-clamp-2">
                          {unit.label}
                        </p>
                        <span className="p-1 rounded-md bg-[#0F2424] text-[#00FFAA]/70 shrink-0">
                          <GroupIcon className="w-2.5 h-2.5" />
                        </span>
                      </div>

                      <div className="mt-auto">
                        <span
                          className={`font-black tracking-tight leading-none ${
                            unit.isInfantry ? "text-sm text-[#00FFAA]" : "text-lg text-[#E0E0E0]"
                          }`}
                        >
                          {displayText}
                        </span>
                        <p className="text-[9px] font-bold text-[#6B8A8A] mt-0.5 uppercase tracking-wider">
                          {subText}
                        </p>
                        {pendingCount > 0 && (
                          <p className="text-[9px] font-bold text-amber-300 mt-1">
                            +{formatNumber(pendingCount)} dalam pembuatan
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Infrastruktur Militer */}
            <div>
              <div className="flex items-center gap-2 mb-2.5 border-b border-[#00FFAA]/15 pb-1.5">
                <Warehouse className="w-3.5 h-3.5 text-amber-400" />
                <h5 className="text-xs font-black uppercase tracking-wider text-[#00FFAA]">
                  Infrastruktur Militer & Pangkalan (5 Fasilitas)
                </h5>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {filteredMilitaryInfra.map((infra) => {
                  const count = getBuildingValue(infra.key);
                  const isZero = count === 0;
                  const pending = pendingMilitaryInfra.filter((entry) => entry.infraKey === infra.key);
                  const pendingCount = pending.reduce((total, entry) => total + (Number(entry.jumlah) || 0), 0);
                  const completionDate = pending
                    .map((entry) => entry.completionDate)
                    .filter((date): date is string => Boolean(date))
                    .sort()
                    .at(-1);
                  const remainingDays = pending.length > 0
                    ? Math.min(...pending.map((entry) => Math.max(0, Number(entry.daysRemaining) || 0)))
                    : 0;
                  return (
                    <div
                      key={infra.key}
                      className="relative overflow-visible bg-[#0A1A1A] border border-[#00FFAA]/25 rounded-2xl p-3 flex flex-col justify-between hover:border-[#00FFAA] transition-all shadow-sm min-h-[95px]"
                    >
                      {pendingCount > 0 && completionDate && (
                        <div className="absolute -top-3 left-2 z-10 bg-[#0A1A1A] text-amber-300 text-[9px] font-bold px-2 py-0.5 border border-amber-400/40 rounded whitespace-nowrap">
                          Dalam pembangunan · selesai {formatCompletionDate(completionDate)}
                          {remainingDays > 0 ? ` · ${remainingDays} hari` : ""}
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#8AB0A8] leading-tight line-clamp-2">
                          {infra.label}
                        </p>
                        <span className="p-1 rounded-md bg-[#0F2424] text-amber-400 shrink-0">
                          <Warehouse className="w-2.5 h-2.5" />
                        </span>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-lg font-black tracking-tight leading-none ${
                              isZero ? "text-[#6B8A8A]" : "text-[#00FFAA]"
                            }`}
                          >
                            {formatNumber(count)}
                          </span>
                          <span className="text-[9px] font-bold text-[#6B8A8A] uppercase">
                            Pangkalan
                          </span>
                        </div>
                        {pendingCount > 0 && (
                          <p className="text-[9px] font-bold text-amber-300 mt-1">
                            +{formatNumber(pendingCount)} dalam pembangunan
                          </p>
                        )}
                        <p className="text-[8px] font-semibold text-[#6B8A8A] mt-0.5 leading-tight truncate">
                          {infra.supportedUnitsLabel}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
