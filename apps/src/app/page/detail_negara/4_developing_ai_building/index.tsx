"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  ChevronRight,
  Info,
  Warehouse,
  Search,
} from "lucide-react";
import {
  applyNpcCountrySimulationState,
  NPC_COUNTRY_SIMULATION_UPDATED_EVENT,
} from "@/app/logic/npc_country_simulation/npcCountrySimulation";
import { getInfraCapacityDetails } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/infraCapacityHelper";
import { convertBarakToSoldiers } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/1_barak_logic";

interface DevelopingAIBuildingProps {
  countryDetail?: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
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
  accent: string;
  badgeCount?: number;
  items: CivilCardItem[];
}

const CIVIL_CATEGORIES: CivilCategory[] = [
  {
    id: "kelistrikan",
    title: "Kelistrikan",
    icon: Zap,
    description: "Infrastruktur grid pembangkit tenaga listrik nasional",
    accent: "from-amber-500/20 to-yellow-500/5 text-amber-300 border-amber-500/30",
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
    accent: "from-cyan-500/20 to-blue-500/5 text-cyan-300 border-cyan-500/30",
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
    accent: "from-indigo-500/20 to-violet-500/5 text-indigo-300 border-indigo-500/30",
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
    accent: "from-emerald-500/20 to-teal-500/5 text-emerald-300 border-emerald-500/30",
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
    accent: "from-lime-500/20 to-emerald-500/5 text-lime-300 border-lime-500/30",
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
    accent: "from-sky-500/20 to-teal-500/5 text-sky-300 border-sky-500/30",
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
    accent: "from-amber-500/20 to-orange-500/5 text-amber-300 border-amber-500/30",
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
    accent: "from-teal-500/20 to-emerald-500/5 text-teal-300 border-teal-500/30",
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
    accent: "from-blue-500/20 to-indigo-500/5 text-blue-300 border-blue-500/30",
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
    accent: "from-rose-500/20 to-red-500/5 text-rose-300 border-rose-500/30",
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
    accent: "from-amber-500/20 to-yellow-500/5 text-amber-300 border-amber-500/30",
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
    accent: "from-purple-500/20 to-fuchsia-500/5 text-purple-300 border-purple-500/30",
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
    accent: "from-emerald-500/20 to-teal-500/5 text-emerald-300 border-emerald-500/30",
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
    accent: "from-teal-500/20 to-cyan-500/5 text-teal-300 border-teal-500/30",
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

// Helper angka
const formatNumber = (val: unknown): string => {
  const num = Number(val ?? 0);
  return Number.isFinite(num) ? num.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "0";
};

export default function DevelopingAIBuilding({
  countryDetail,
  metadata,
}: DevelopingAIBuildingProps) {
  const [liveCountryDetail, setLiveCountryDetail] = useState<Record<string, any> | null>(
    countryDetail ? (countryDetail as Record<string, any>) : null
  );
  const [selectedMainTab, setSelectedMainTab] = useState<"sipil" | "militer">("sipil");
  const [activeCivilCategory, setActiveCivilCategory] = useState<string>("kelistrikan");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const refreshSimulation = () => {
      setLiveCountryDetail(
        countryDetail ? (applyNpcCountrySimulationState(countryDetail) as Record<string, any>) : null
      );
    };
    window.addEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshSimulation);
    refreshSimulation();
    return () => window.removeEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshSimulation);
  }, [countryDetail]);

  // Helper untuk membaca nilai count dari data negara
  const getBuildingValue = (key: string): number => {
    if (!liveCountryDetail) return 0;
    if (liveCountryDetail[key] !== undefined && liveCountryDetail[key] !== null) {
      const v = Number(liveCountryDetail[key]);
      if (!Number.isNaN(v)) return v;
    }
    if (liveCountryDetail.pertahanan?.[key] !== undefined && liveCountryDetail.pertahanan?.[key] !== null) {
      const v = Number(liveCountryDetail.pertahanan[key]);
      if (!Number.isNaN(v)) return v;
    }
    if (liveCountryDetail.armada?.[key] !== undefined && liveCountryDetail.armada?.[key] !== null) {
      const v = Number(liveCountryDetail.armada[key]);
      if (!Number.isNaN(v)) return v;
    }
    return 0;
  };

  const getMilitaryUnitValue = (key: string, group: "darat" | "laut" | "udara"): number => {
    if (!liveCountryDetail) return 0;
    const values = [
      liveCountryDetail.armada?.[group]?.[key],
      liveCountryDetail[key],
      liveCountryDetail.pertahanan?.[key],
      liveCountryDetail.armada?.[key],
      liveCountryDetail[group]?.[key],
    ];
    const counts = values.map(Number).filter((v) => Number.isFinite(v) && v >= 0);
    return counts.find((v) => v > 0) ?? counts[0] ?? 0;
  };

  // Hitung total unit per kategori untuk indikator badge
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    CIVIL_CATEGORIES.forEach((cat) => {
      stats[cat.id] = cat.items.reduce((sum, it) => sum + getBuildingValue(it.key), 0);
    });
    return stats;
  }, [liveCountryDetail]);

  // Pasukan Infanteri calculation: Pasukan / Kapasitas
  const infantryData = useMemo(() => {
    const currentBarak = getBuildingValue("barak");
    const infantryCount = getMilitaryUnitValue("pasukan_infanteri", "darat");
    const capDetail = getInfraCapacityDetails("barak", liveCountryDetail);
    const maxCapacity = capDetail?.totalCapacity ?? convertBarakToSoldiers(currentBarak);
    return {
      count: infantryCount,
      capacity: maxCapacity,
      barak: currentBarak,
    };
  }, [liveCountryDetail]);

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

  const currentCountryName =
    liveCountryDetail?.country ||
    liveCountryDetail?.nama_negara ||
    liveCountryDetail?.name_id ||
    liveCountryDetail?.name_en ||
    "Negara";

  return (
    <div className="flex flex-col h-full w-full bg-[#0F2424] text-[#E0E0E0] rounded-2xl overflow-hidden border border-[#00FFAA]/20 shadow-2xl">
      {/* TOP HEADER SUB-NAVIGASI PROGRESS PEMBANGUNAN */}
      <div className="bg-[#0A1A1A] border-b border-[#00FFAA]/20 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 rounded-xl bg-[#0F2424] border border-[#00FFAA]/30">
            <Building2 className="w-5 h-5 text-[#00FFAA]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#00FFAA] flex items-center gap-2">
              Status Pembangunan & Militer
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FFAA]/10 border border-[#00FFAA]/30 text-[#00FFAA] normal-case">
                {currentCountryName}
              </span>
            </h3>
            <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold">
              Kompilasi seluruh fasilitas produksi, infrastruktur publik, armada pertahanan & pangkalan
            </p>
          </div>
        </div>

        {/* Tab Switcher: Fasilitas Sipil vs Militer & Pertahanan */}
        <div className="flex items-center gap-1.5 bg-[#0F2424] p-1 rounded-xl border border-[#00FFAA]/30">
          <button
            onClick={() => {
              setSelectedMainTab("sipil");
              setSearchQuery("");
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedMainTab === "sipil"
                ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20"
                : "text-[#6B8A8A] hover:text-[#00FFAA]"
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Fasilitas Sipil</span>
          </button>
          <button
            onClick={() => {
              setSelectedMainTab("militer");
              setSearchQuery("");
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedMainTab === "militer"
                ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20"
                : "text-[#6B8A8A] hover:text-[#00FFAA]"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Militer & Pertahanan</span>
          </button>
        </div>
      </div>

      {/* BODY KONTEN */}
      <div className="flex-1 flex min-h-0 relative">
        {/* ========================================================= */}
        {/* TAB 1: FASILITAS SIPIL & PRODUKSI                         */}
        {/* ========================================================= */}
        {selectedMainTab === "sipil" && (
          <>
            {/* Sidebar Kategori Sipil */}
            <div className="w-48 sm:w-56 lg:w-64 border-r border-[#00FFAA]/20 bg-[#0A1A1A] p-2.5 sm:p-3 flex flex-col gap-1 overflow-y-auto no-scrollbar shrink-0">
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
                    className={`flex items-center justify-between w-full px-2.5 sm:px-3 py-2 rounded-xl text-left border transition-all cursor-pointer group ${
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
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider truncate">
                        {cat.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {cat.badgeCount !== undefined && (
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                            isActive ? "bg-[#0A1A1A]/30 text-[#0A1A1A]" : "bg-[#0A1A1A] text-amber-400 border border-amber-400/30"
                          }`}
                          title={`${cat.badgeCount} sub-fasilitas`}
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
            <div className="flex-1 flex flex-col min-w-0 bg-[#0F2424] overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {/* Category Header & Filter */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-[#0A1A1A]/70 border border-[#00FFAA]/20 p-3 sm:p-4 rounded-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <activeCategoryObj.icon className="w-5 h-5 text-[#00FFAA]" />
                    <h4 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#00FFAA]">
                      {activeCategoryObj.title}
                    </h4>
                    {activeCategoryObj.badgeCount !== undefined && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
                        {activeCategoryObj.badgeCount} Jenis Fasilitas
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold mt-0.5">
                    {activeCategoryObj.description}
                  </p>
                </div>

                {/* Search Bar Kecil */}
                <div className="relative min-w-[200px] sm:min-w-[240px]">
                  <Search className="w-3.5 h-3.5 text-[#6B8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Cari ${activeCategoryObj.title}...`}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/30 text-xs text-[#E0E0E0] placeholder:text-[#6B8A8A] focus:outline-none focus:border-[#00FFAA]"
                  />
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredCivilItems.map((item) => {
                  const count = getBuildingValue(item.key);
                  const isZero = count === 0;
                  return (
                    <div
                      key={item.key}
                      className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between hover:border-[#00FFAA]/50 transition-all shadow-sm group min-h-[105px] relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#8AB0A8] leading-tight line-clamp-2">
                          {item.label}
                        </p>
                        <span className="p-1 rounded-md bg-[#0F2424] text-[#00FFAA]/60 shrink-0">
                          <activeCategoryObj.icon className="w-3 h-3" />
                        </span>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={`text-lg sm:text-xl lg:text-2xl font-black tracking-tight leading-none ${
                              isZero ? "text-[#6B8A8A]" : "text-[#E0E0E0]"
                            }`}
                          >
                            {formatNumber(count)}
                          </span>
                          <span className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider">
                            {item.unitSuffix || "unit"}
                          </span>
                        </div>

                        {item.defaultUnit && (
                          <p className="text-[9px] text-[#6B8A8A] font-semibold mt-1 truncate">
                            {item.defaultUnit}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredCivilItems.length === 0 && (
                  <div className="col-span-full py-12 text-center text-[#6B8A8A] text-xs font-bold uppercase tracking-wider">
                    Tidak ditemukan fasilitas dengan nama &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MILITER & PERTAHANAN                               */}
        {/* ========================================================= */}
        {selectedMainTab === "militer" && (
          <div className="flex-1 flex flex-col min-w-0 bg-[#0F2424] overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6">
            {/* Header Militer */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A1A1A]/70 border border-[#00FFAA]/20 p-3 sm:p-4 rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-500" />
                  <h4 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#00FFAA]">
                    Kekuatan Armada Militer & Infrastruktur
                  </h4>
                </div>
                <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold mt-0.5">
                  Inventaris alutsista darat, laut, udara serta pangkalan pendukung pertahanan
                </p>
              </div>

              {/* Search Bar Kecil */}
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-[#6B8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari alutsista / pangkalan..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/30 text-xs text-[#E0E0E0] placeholder:text-[#6B8A8A] focus:outline-none focus:border-[#00FFAA]"
                />
              </div>
            </div>

            {/* SEKSI 1: ARMADA AKTIF (DARAT, LAUT, UDARA) */}
            <div>
              <div className="flex items-center gap-2 mb-3 border-b border-[#00FFAA]/15 pb-2">
                <Swords className="w-4 h-4 text-[#00FFAA]" />
                <h5 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#00FFAA]">
                  Unit Armada Aktif (23 Jenis Unit)
                </h5>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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

                  return (
                    <div
                      key={unit.key}
                      className={`bg-[#0A1A1A] border rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between transition-all shadow-sm group min-h-[105px] relative overflow-hidden ${
                        isHighlighted
                          ? "border-[#00FFAA]/40 bg-[#0A1A1A]/90 hover:border-[#00FFAA]"
                          : "border-[#00FFAA]/20 hover:border-[#00FFAA]/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#8AB0A8] leading-tight line-clamp-2">
                          {unit.label}
                        </p>
                        <span className="p-1 rounded-md bg-[#0F2424] text-[#00FFAA]/70 shrink-0">
                          <GroupIcon className="w-3 h-3" />
                        </span>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span
                            className={`font-black tracking-tight leading-none ${
                              unit.isInfantry
                                ? "text-sm sm:text-base lg:text-lg text-[#00FFAA]"
                                : "text-lg sm:text-xl lg:text-2xl text-[#E0E0E0]"
                            }`}
                          >
                            {displayText}
                          </span>
                        </div>
                        <p className="text-[9px] sm:text-[10px] font-bold text-[#6B8A8A] mt-1 uppercase tracking-wider">
                          {subText}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEKSI 2: INFRASTRUKTUR MILITER */}
            <div>
              <div className="flex items-center gap-2 mb-3 border-b border-[#00FFAA]/15 pb-2">
                <Warehouse className="w-4 h-4 text-amber-400" />
                <h5 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#00FFAA]">
                  Infrastruktur Militer & Pangkalan (5 Fasilitas)
                </h5>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredMilitaryInfra.map((infra) => {
                  const count = getBuildingValue(infra.key);
                  const isZero = count === 0;
                  return (
                    <div
                      key={infra.key}
                      className="bg-[#0A1A1A] border border-[#00FFAA]/25 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between hover:border-[#00FFAA] transition-all shadow-sm group min-h-[110px] relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#8AB0A8] leading-tight line-clamp-2">
                          {infra.label}
                        </p>
                        <span className="p-1 rounded-md bg-[#0F2424] text-amber-400 shrink-0">
                          <Warehouse className="w-3 h-3" />
                        </span>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={`text-lg sm:text-xl lg:text-2xl font-black tracking-tight leading-none ${
                              isZero ? "text-[#6B8A8A]" : "text-[#00FFAA]"
                            }`}
                          >
                            {formatNumber(count)}
                          </span>
                          <span className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider">
                            Pangkalan
                          </span>
                        </div>
                        <p className="text-[9px] font-semibold text-[#6B8A8A] mt-1 leading-tight line-clamp-1">
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
