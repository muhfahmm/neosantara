import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { setRelationModifier } from "@/../../json/4_database_hubungan_antar_negara/relationsRegistry";

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

  // 2. Jika diuji coba ke laut / perairan dekat tetangga:
  // Hubungan dengan negara tetangga dekat turun 5 - 10 poin
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

  }

  const launchMsg = isDomestic
    ? `Uji coba balistik rudal ICBM domestik ${countryName} sukses diluncurkan dan menghantam sasaran uji di ${realisticName} dengan presisi militer sempurna tanpa risiko diplomatik.`
    : isSea
    ? `Uji coba peluncuran rudal ICBM strategis ${countryName} diarahkan ke ${realisticName}. Manuver ini memicu ketegangan regional.`
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
  };
}
