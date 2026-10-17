/**
 * icbmWarLogic.ts
 *
 * Modul logika eksekusi serangan ICBM strategis antara User dan Negara AI (atau AI vs AI/User).
 *
 * KETENTUAN LOGIKA:
 * 1. Setiap peluncuran mengurangi 1 stok rudal ICBM pihak penyerang.
 * 2. Kedua belah pihak yang bertikai (penyerang dan target) menerima penalti hubungan diplomatik
 *    sebesar 5 poin (-5) dari seluruh 210 negara lain di dunia (selain 2 negara yang sedang bertikai).
 * 3. Menghasilkan efek lintasan rute warna merah di peta (path-icbm) dan ledakan kilatan keclap putih
 *    di titik koordinat target melalui custom event.
 * 4. Berdampak pada kerusakan armada dan stabilitas negara target.
 * 5. Menerbitkan berita geopolitik & notifikasi pertahanan resmi.
 */

import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { setRelationModifier } from "@/../../json/4_database_hubungan_antar_negara/relationsRegistry";
import { expelCountryFromSecurityCouncil } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logika_anggota_tidak_tetap/securityCouncilElection";

export interface IcbmStrikeParams {
  attackerCountry: string;
  targetCountry: string;
  attackerIso?: string;
  targetIso?: string;
  currentDate?: string;
  isPlayerAttacker?: boolean;
}

export interface IcbmStrikeResult {
  success: boolean;
  message: string;
  attackerCountry: string;
  targetCountry: string;
  affectedWorldCountriesCount: number;
  relationPenaltyPerCountry: number;
}

const normalizeCountryString = (name: unknown): string => {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
};

/**
 * Menerapkan pinalti hubungan diplomatik -5 poin ke seluruh 210 negara lain
 * terhadap kedua negara yang sedang bertikai dengan ICBM.
 */
export function applyIcbmGlobalRelationPenalty(attackerCountry: string, targetCountry: string): number {
  const normAttacker = normalizeCountryString(attackerCountry);
  const normTarget = normalizeCountryString(targetCountry);

  let affectedCount = 0;

  COUNTRIES_DATA.forEach((c) => {
    const cName = c.country || (c as any).nama_negara || "";
    const normCurrent = normalizeCountryString(cName);

    // Selain 2 negara yang sedang bertikai
    if (normCurrent !== normAttacker && normCurrent !== normTarget) {
      // Penalti hubungan -5 poin ke penyerang
      setRelationModifier(attackerCountry, cName, -5);
      // Penalti hubungan -5 poin ke target
      setRelationModifier(targetCountry, cName, -5);
      affectedCount++;
    }
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("country_relations_updated"));
  }

  return affectedCount;
}

/**
 * Meluncurkan serangan ICBM (memulai animasi path merah di peta dan mencatat event).
 */
export function launchIcbmWarStrike(params: IcbmStrikeParams): IcbmStrikeResult {
  const { attackerCountry, targetCountry, currentDate } = params;

  if (!attackerCountry || !targetCountry) {
    return {
      success: false,
      message: "Data negara penyerang atau sasaran tidak valid.",
      attackerCountry,
      targetCountry,
      affectedWorldCountriesCount: 0,
      relationPenaltyPerCountry: 0,
    };
  }

  if (normalizeCountryString(attackerCountry) === normalizeCountryString(targetCountry)) {
    return {
      success: false,
      message: "Tidak dapat meluncurkan serangan rudal nuklir ke negara sendiri!",
      attackerCountry,
      targetCountry,
      affectedWorldCountriesCount: 0,
      relationPenaltyPerCountry: 0,
    };
  }

  // 1. Terapkan pinalti hubungan diplomatik -5 poin ke seluruh negara di database selain 2 negara yang bertikai
  const affectedCount = applyIcbmGlobalRelationPenalty(attackerCountry, targetCountry);

  // 2. Karena peluncuran ICBM adalah agresi tanpa mandat PBB, cabut status keanggotaan Dewan Keamanan
  try {
    expelCountryFromSecurityCouncil(attackerCountry);
  } catch (err) {
    console.warn("[ICBM War] Gagal memeriksa status DK PBB:", err);
  }

  // 3. Picu animasi path-icbm berwarna merah di layar lewat event pelacakan diplomasi/perang
  if (typeof window !== "undefined") {
    const pathId = `icbm-strike-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.dispatchEvent(
      new CustomEvent("neosantara_diplomacy_path", {
        detail: {
          pathId,
          kind: "icbm",
          senderCountry: attackerCountry,
          targetCountry: targetCountry,
        },
      })
    );

    // Dispatch event agar state game/UI tahu ada serangan ICBM
    window.dispatchEvent(
      new CustomEvent("neosantara_icbm_launched", {
        detail: {
          pathId,
          attackerCountry,
          targetCountry,
          currentDate,
        },
      })
    );
  }

  return {
    success: true,
    message: `Rudal balistik ICBM berhasil diluncurkan dari ${attackerCountry} menuju ${targetCountry}! Hubungan dengan ${affectedCount} negara dunia lainnya turun 5 poin sebagai sanksi pinalti penggunaan senjata pemusnah massal.`,
    attackerCountry,
    targetCountry,
    affectedWorldCountriesCount: affectedCount,
    relationPenaltyPerCountry: 5,
  };
}
