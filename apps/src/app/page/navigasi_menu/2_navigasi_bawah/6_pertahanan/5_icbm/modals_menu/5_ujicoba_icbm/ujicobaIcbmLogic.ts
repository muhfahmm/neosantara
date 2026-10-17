import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { setRelationModifier } from "@/../../json/4_database_hubungan_antar_negara/relationsRegistry";
import {
  loadActiveResolutions,
  saveActiveResolutions,
  calculate206AIVotes,
  type ActiveResolutionItem,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/resolusiPBBUILogic";
import {
  loadActiveSecurityCouncilItems,
  saveActiveSecurityCouncilItems,
  calculate15SecurityCouncilVotes,
  type ActiveSecurityCouncilItem,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic";

export interface SanctionApplied {
  name: string;
  type: string;
  desc: string;
  source: "Majelis Umum PBB" | "Dewan Keamanan PBB";
}

export interface NeighborImpact {
  country: string;
  penalty: number;
}

export interface TestLaunchResult {
  success: boolean;
  message: string;
  consumedIcbm: number;
  remainingIcbm: number;
  testDate: string;
  targetLocation?: string;
  coordinates?: { x: number; y: number };
  isDomesticTest?: boolean;
  isSeaTest?: boolean;
  affectedNeighbors?: NeighborImpact[];
  imposedSanctions?: SanctionApplied[];
  inboxNotifications?: any[];
}

/**
 * Format nama lokasi sasaran agar lebih realistis.
 * Jika pemain menguji coba ke negaranya sendiri (misal China -> China),
 * ubah menjadi nama fasilitas uji coba militer domestik resmi.
 */
export function getRealisticTargetLocationName(
  rawLocationName: string,
  userCountryName: string
): { realisticName: string; isDomestic: boolean; isSea: boolean } {
  const normUser = (userCountryName || "").toLowerCase().trim();
  const normRaw = (rawLocationName || "").toLowerCase().trim();

  // Deteksi uji coba di wilayah sendiri
  const isDomestic =
    normRaw === normUser ||
    (normUser === "china" && (normRaw === "china" || normRaw === "tiongkok")) ||
    (normUser === "indonesia" && normRaw === "indonesia") ||
    (normUser === "rusia" && normRaw === "rusia") ||
    (normUser === "amerika serikat" && (normRaw === "amerika serikat" || normRaw === "us" || normRaw === "usa"));

  if (isDomestic) {
    if (normUser === "china" || normUser === "tiongkok") {
      return {
        realisticName: "Pangkalan Uji Coba Rudal & Nuklir Lop Nur (Xinjiang, China)",
        isDomestic: true,
        isSea: false,
      };
    }
    if (normUser === "rusia") {
      return {
        realisticName: "Pusat Uji Balistik Antarbenua Plesetsk & Poligon Kura (Rusia)",
        isDomestic: true,
        isSea: false,
      };
    }
    if (normUser === "amerika serikat") {
      return {
        realisticName: "Kawasan Uji Coba Rudal Strategis White Sands (New Mexico, AS)",
        isDomestic: true,
        isSea: false,
      };
    }
    if (normUser === "indonesia") {
      return {
        realisticName: "Pusat Riset Peluncuran Roket Strategis Pameungpeuk (Indonesia)",
        isDomestic: true,
        isSea: false,
      };
    }
    return {
      realisticName: `Fasilitas Uji Coba Senjata Strategis Nasional (${userCountryName})`,
      isDomestic: true,
      isSea: false,
    };
  }

  // Deteksi perairan / samudra
  const isSea =
    normRaw.includes("samudra") ||
    normRaw.includes("laut") ||
    normRaw.includes("perairan") ||
    normRaw.includes("koordinat") ||
    normRaw.includes("ocean") ||
    normRaw.includes("sea");

  if (isSea) {
    if (normUser === "china" || normUser === "tiongkok") {
      return {
        realisticName: "Zona Latihan Perairan Bebas Samudra Pasifik Barat",
        isDomestic: false,
        isSea: true,
      };
    }
    return {
      realisticName: rawLocationName || "Zona Latihan Samudra Internasional",
      isDomestic: false,
      isSea: true,
    };
  }

  return {
    realisticName: rawLocationName || "Target Latihan Terpilih",
    isDomestic: false,
    isSea: false,
  };
}

/**
 * Mencari negara-negara tetangga yang dekat dengan negara pemain
 * berdasarkan koordinat ibukota (jarak geosfer/euclidean).
 */
export function findNearbyNeighborCountries(
  userCountryName: string,
  limit = 5
): Array<{ country: string; iso: string; distance: number }> {
  const normUser = (userCountryName || "").toLowerCase().trim();
  const userEntry = COUNTRIES_DATA.find(
    (c) => c.country.toLowerCase().trim() === normUser
  );

  if (!userEntry || userEntry.latitude === undefined || userEntry.longitude === undefined) {
    // Fallback negara tetangga umum jika koordinat tidak lengkap
    if (normUser === "china" || normUser === "tiongkok") {
      return [
        { country: "Jepang", iso: "jp", distance: 15 },
        { country: "Korea Selatan", iso: "kr", distance: 10 },
        { country: "Korea Utara", iso: "kp", distance: 8 },
        { country: "Taiwan", iso: "tw", distance: 12 },
        { country: "Vietnam", iso: "vn", distance: 18 },
      ];
    }
    return [];
  }

  const uLat = userEntry.latitude;
  const uLng = userEntry.longitude;

  const neighbors = COUNTRIES_DATA.filter((c) => c.country.toLowerCase().trim() !== normUser)
    .map((c) => {
      const cLat = c.latitude ?? 0;
      const cLng = c.longitude ?? 0;
      const dist = Math.hypot(cLat - uLat, cLng - uLng);
      return { country: c.country, iso: c.iso, distance: dist };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return neighbors;
}

/**
 * Menerapkan usulan sanksi global dari negara-negara tetangga yang terganggu
 * Setiap sanksi dievaluasi dengan peluang 50%.
 * Jika lolos 50%, sanksi akan diajukan ke sidang PBB dengan status 'voting' (30 hari sidang)
 * oleh negara tetangga yang terdampak, serta mengirimkan notifikasi resmi ke inbox user.
 */
export function applyIcbmSanctionRisks(
  userCountryName: string,
  testDate: string,
  affectedNeighbors: NeighborImpact[] = []
): {
  proposedSanctions: SanctionApplied[];
  inboxNotifications: any[];
} {
  const proposedSanctions: SanctionApplied[] = [];
  const inboxNotifications: any[] = [];
  const suffix = Date.now().toString(36);

  if (affectedNeighbors.length === 0) {
    return { proposedSanctions, inboxNotifications };
  }

  // Pool 1: Sanksi Sidang Majelis Umum PBB
  const pbbSanctionCandidates = [
    {
      type: "arms_embargo",
      name: "Embargo Penjualan Senjata",
      desc: "Larangan seluruh anggota PBB memasok peralatan militer dan alutsista akibat ancaman uji coba rudal balistik.",
      duration: "6 bulan",
    },
    {
      type: "economic_embargo",
      name: "Embargo Ekonomi",
      desc: "Produksi industri manufaktur, tambang, dan pendapatan perdagangan non-emas dikenai pemotongan akibat pelanggaran stabilitas keamanan regional.",
      duration: "6 bulan",
    },
    {
      type: "production_ban",
      name: "Larangan Produksi",
      desc: "Penghentian sementara dan pembatasan kuota manufaktur fasilitas strategis nasional.",
      duration: "6 bulan",
    },
  ];

  // Pool 2: Tindakan Kritis Sidang Dewan Keamanan PBB
  const dkSanctionCandidates = [
    {
      type: "economic" as const,
      name: "Blokade Ekonomi",
      desc: "Dewan Keamanan PBB membatasi kuota produksi industri dan membekukan jalur transaksi ekonomi strategis.",
      duration: "6 bulan",
    },
    {
      type: "naval" as const,
      name: "Blokade Laut",
      desc: "Armada patroli multinasional memblokade koridor maritim dan jalur logistik laut utama.",
      duration: "6 bulan",
    },
    {
      type: "full" as const,
      name: "Blokade Penuh",
      desc: "Isolasi diplomatik dan embargo perdagangan internasional total tanpa izin transaksi kontrak.",
      duration: "6 bulan",
    },
  ];

  const currentResolutions = loadActiveResolutions();
  const updatedResolutions = [...currentResolutions];

  // Evaluasi 3 sanksi Majelis Umum PBB (peluang 50% masing-masing)
  pbbSanctionCandidates.forEach((cand, idx) => {
    if (Math.random() < 0.5) {
      // Pilih salah satu negara tetangga yang terganggu sebagai pengusul
      const neighbor = affectedNeighbors[idx % affectedNeighbors.length];
      const proposerCountry = neighbor.country;
      const proposerIso =
        COUNTRIES_DATA.find((c) => c.country.toLowerCase().trim() === proposerCountry.toLowerCase().trim())?.iso || "un";

      const resolutionId = `res-icbm-${cand.type}-${suffix}-${Math.random().toString(36).substr(2, 4)}`;

      // Hitung perolehan suara awal (hari ke-0 pemungutan suara)
      const initialVotes = calculate206AIVotes(30, null, proposerCountry, userCountryName, cand.type, userCountryName);

      const resItem: ActiveResolutionItem = {
        id: resolutionId,
        proposer: { name: proposerCountry, iso: proposerIso },
        target: { name: userCountryName, iso: "target" },
        type: cand.type,
        label: `${cand.name} atas Uji Coba ICBM`,
        desc: cand.desc,
        duration: cand.duration,
        daysRemaining: 30, // 30 hari pemungutan suara aktif
        voteStats: initialVotes,
        userVote: null,
        status: "voting",
        createdAt: testDate,
        notifiedDay1: true,
      };

      updatedResolutions.unshift(resItem);
      proposedSanctions.push({
        name: cand.name,
        type: cand.type,
        desc: cand.desc,
        source: "Majelis Umum PBB",
      });

      // Notifikasi ke inbox pengguna
      inboxNotifications.push({
        id: `notif-pbb-icbm-${resolutionId}`,
        title: `🏛️ USULAN RESOLUSI PBB: ${proposerCountry} ➔ ${userCountryName}`,
        sender: `Sekretariat Jenderal Majelis Umum PBB`,
        message: `Kabar Diplomasi PBB! Negara ${proposerCountry} yang merasa terancam akibat uji coba peluncuran rudal ICBM secara resmi mengajukan draf "${cand.name}" terhadap ${userCountryName} selama ${cand.duration}. Usulan ini: ${cand.desc}. Sidang pemungutan suara Majelis Umum PBB selama 30 hari telah dibuka!`,
        timestamp: testDate,
        type: "peringkat",
        value: neighbor.penalty,
        isRead: false,
        tradeType: "usulan_resolusi_pbb",
        proposerCountry,
        targetCountry: userCountryName,
        relationScore: Math.max(1, 50 - neighbor.penalty),
        resolutionType: cand.type,
        resolutionTitle: cand.name,
        duration: cand.duration,
      });
    }
  });

  if (proposedSanctions.some((s) => s.source === "Majelis Umum PBB")) {
    saveActiveResolutions(updatedResolutions);
  }

  // Evaluasi 3 tindakan Dewan Keamanan PBB (peluang 50% masing-masing)
  const currentSecurityItems = loadActiveSecurityCouncilItems();
  const updatedSecurityItems = [...currentSecurityItems];

  dkSanctionCandidates.forEach((cand, idx) => {
    if (Math.random() < 0.5) {
      // Pilih negara tetangga pengusul
      const neighbor = affectedNeighbors[(idx + 1) % affectedNeighbors.length];
      const proposerCountry = neighbor.country;
      const proposerIso =
        COUNTRIES_DATA.find((c) => c.country.toLowerCase().trim() === proposerCountry.toLowerCase().trim())?.iso || "un";

      const securityId = `dk-icbm-${cand.type}-${suffix}-${Math.random().toString(36).substr(2, 4)}`;

      // Hitung perolehan suara awal Dewan Keamanan
      const initialDkVotes = calculate15SecurityCouncilVotes(
        30,
        null,
        proposerCountry,
        userCountryName,
        cand.type,
        userCountryName,
        securityId
      );

      const dkItem: ActiveSecurityCouncilItem = {
        id: securityId,
        proposer: { name: proposerCountry, iso: proposerIso },
        target: { name: userCountryName, iso: "target" },
        type: cand.type,
        label: `${cand.name} Dewan Keamanan`,
        desc: cand.desc,
        duration: cand.duration,
        daysRemaining: 30, // 30 hari sidang voting aktif
        voteStats: initialDkVotes,
        userVote: null,
        status: "voting",
        createdAt: testDate,
        notifiedDay1: true,
      };

      updatedSecurityItems.unshift(dkItem);
      proposedSanctions.push({
        name: cand.name,
        type: cand.type,
        desc: cand.desc,
        source: "Dewan Keamanan PBB",
      });

      // Notifikasi ke inbox pengguna
      inboxNotifications.push({
        id: `notif-dk-icbm-${securityId}`,
        title: `🛡️ DEWAN KEAMANAN PBB: ${proposerCountry} ➔ ${userCountryName}`,
        sender: `Dewan Keamanan Tertinggi PBB`,
        message: `DARURAT DEWAN KEAMANAN PBB! Negara ${proposerCountry} mengajukan draf sanksi darurat "${cand.name}" terhadap ${userCountryName} ke Dewan Keamanan PBB sebagai tanggapan atas peluncuran rudal balistik strategis. Sidang darurat pemungutan suara telah dimulai!`,
        timestamp: testDate,
        type: "peringkat",
        value: neighbor.penalty,
        isRead: false,
        tradeType: "usulan_keamanan_pbb",
        proposerCountry,
        targetCountry: userCountryName,
        relationScore: Math.max(1, 50 - neighbor.penalty),
        securityAction: cand.type,
        actionTitle: cand.name,
        duration: cand.duration,
      });
    }
  });

  if (proposedSanctions.some((s) => s.source === "Dewan Keamanan PBB")) {
    saveActiveSecurityCouncilItems(updatedSecurityItems);
  }

  return { proposedSanctions, inboxNotifications };
}

/**
 * Eksekusi utama peluncuran uji coba ICBM
 */
export function executeIcbmTestLaunch(
  currentIcbmCount: number,
  testDate: string,
  countryName = "Indonesia",
  rawTargetLocation = "Area Koordinat Terpilih",
  coordinates?: { x: number; y: number }
): TestLaunchResult {
  if (currentIcbmCount <= 0) {
    return {
      success: false,
      message: `Uji coba gagal: Stok rudal ICBM ${countryName} tidak tersedia (0 unit). Rakit rudal ICBM terlebih dahulu.`,
      consumedIcbm: 0,
      remainingIcbm: 0,
      testDate,
      targetLocation: rawTargetLocation,
      coordinates,
    };
  }

  const remaining = Math.max(0, currentIcbmCount - 1);

  // 1. Dapatkan nama lokasi sasaran yang realistis
  const { realisticName, isDomestic, isSea } = getRealisticTargetLocationName(
    rawTargetLocation,
    countryName
  );

  const affectedNeighbors: NeighborImpact[] = [];
  let imposedSanctions: SanctionApplied[] = [];
  const inboxNotifications: any[] = [];

  // 2. Jika diuji coba ke laut / perairan dekat tetangga:
  // Hubungan dengan negara tetangga dekat turun 5 - 10 poin
  // dan berisiko terkena sanksi (embargo senjata, embargo ekonomi, larangan produksi, blokade ekonomi, blokade laut, blokade penuh) sebesar 50% masing-masing
  if (isSea) {
    const nearby = findNearbyNeighborCountries(countryName, 5);
    nearby.forEach((n) => {
      // Penurunan hubungan 5 - 10 poin secara acak
      const penalty = Math.floor(Math.random() * 6) + 5; // 5..10
      setRelationModifier(countryName, n.country, -penalty);
      affectedNeighbors.push({ country: n.country, penalty });
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("country_relations_updated"));
    }

    // Terapkan risiko sanksi 50% yang diajukan oleh negara tetangga terdampak
    const sanctionResult = applyIcbmSanctionRisks(countryName, testDate, affectedNeighbors);
    imposedSanctions = sanctionResult.proposedSanctions;
    (sanctionResult.inboxNotifications || []).forEach((notif) => {
      inboxNotifications.push(notif);
    });
  }

  let launchMsg = isDomestic
    ? `Uji coba balistik rudal ICBM domestik ${countryName} sukses diluncurkan dan menghantam sasaran uji di ${realisticName} dengan presisi militer sempurna tanpa risiko diplomatik.`
    : isSea
    ? `Uji coba peluncuran rudal ICBM strategis ${countryName} diarahkan ke ${realisticName}. Manuver ini memicu ketegangan regional dan gugatan resolusi sanksi di PBB!`
    : `Uji coba peluncuran rudal ICBM strategis ${countryName} berhasil mencapai sasaran latihan di ${realisticName}.`;

  return {
    success: true,
    message: launchMsg,
    consumedIcbm: 1,
    remainingIcbm: remaining,
    testDate,
    targetLocation: realisticName,
    coordinates,
    isDomesticTest: isDomestic,
    isSeaTest: isSea,
    affectedNeighbors,
    imposedSanctions,
    inboxNotifications,
  };
}

