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
import { setRelationModifier, setRelationSourceValue } from "@/../../json/4_database_hubungan_antar_negara/relationsRegistry";
import { expelCountryFromSecurityCouncil } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logika_anggota_tidak_tetap/securityCouncilElection";
import { getNegaraNuklirBaseIcbm } from "@/app/logic/npc_ai_brain/military/nuclearControllerAI";
import { getNpcCountrySimulationSnapshot, updateNpcCountrySimulationState } from "@/app/logic/npc_country_simulation/npcCountrySimulation";

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
 * Memeriksa apakah sebuah negara target memiliki stok rudal ICBM siap tempur.
 * Sumber pengecekan:
 * 1. State simulasi NPC dinamis (activeNpcSimulationState).
 * 2. Fallback stok dasar negara nuklir bawaan (nuclearControllerAI / database_icbm_negara).
 */
export function getCountryIcbmCount(countryName: string, iso?: string): number {
  const norm = normalizeCountryString(countryName);
  const match = COUNTRIES_DATA.find((c) => {
    const cNorm = normalizeCountryString(c.country || (c as any).nama_negara);
    return cNorm === norm || (iso && c.iso && c.iso.toLowerCase() === iso.toLowerCase());
  });

  const slug = match?.country?.toLowerCase().replace(/[^a-z0-9]/g, "_") || norm;
  const targetIso = iso || match?.iso;

  // Cek state simulasi dinamis NPC
  const snapshot = getNpcCountrySimulationSnapshot();
  if (snapshot?.countries) {
    const simState = snapshot.countries[slug] || (match?.country ? snapshot.countries[match.country.toLowerCase()] : null);
    if (simState) {
      const liveCount = Number((simState as any).icbm_jumlah ?? (simState as any).icbm ?? -1);
      if (liveCount >= 0) {
        return liveCount;
      }
    }
  }

  // Fallback ke negara nuklir bawaan (US, Rusia, China, Korut, India)
  return getNegaraNuklirBaseIcbm(slug, match?.country || countryName, targetIso);
}

/**
 * Mengurangi 1 stok ICBM dari negara target jika melancarkan serangan balasan ICBM.
 */
export function consumeCountryIcbm(countryName: string, iso?: string): void {
  const norm = normalizeCountryString(countryName);
  const match = COUNTRIES_DATA.find((c) => {
    const cNorm = normalizeCountryString(c.country || (c as any).nama_negara);
    return cNorm === norm || (iso && c.iso && c.iso.toLowerCase() === iso.toLowerCase());
  });
  const slug = match?.country?.toLowerCase().replace(/[^a-z0-9]/g, "_") || norm;

  const currentCount = getCountryIcbmCount(countryName, iso);
  const nextCount = Math.max(0, currentCount - 1);

  try {
    updateNpcCountrySimulationState(slug, {
      icbm_jumlah: nextCount,
      icbm: nextCount,
      icbm_status: nextCount > 0,
    });
  } catch (err) {
    console.warn("[ICBM] Gagal mengupdate stok ICBM NPC:", err);
  }
}
/**
 * Mengurangi 30% kekuatan militer (armada) negara target yang terkena ledakan ICBM.
 */
export function applyIcbmMilitaryDamageToNpc(countryName: string, iso?: string): {
  reducedCount: number;
  losses: Array<{ unitKey: string; quantity: number }>;
} {
  const norm = normalizeCountryString(countryName);
  const match = COUNTRIES_DATA.find((c) => {
    const cNorm = normalizeCountryString(c.country || (c as any).nama_negara);
    return cNorm === norm || (iso && c.iso && c.iso.toLowerCase() === iso.toLowerCase());
  });
  const slug = match?.country?.toLowerCase().replace(/[^a-z0-9]/g, "_") || norm;

  const snapshot = getNpcCountrySimulationSnapshot();
  const currentSim = (snapshot?.countries?.[slug] || {}) as Record<string, any>;
  const baseArmada = (currentSim.armada || match || {}) as Record<string, any>;

  const ALL_UNIT_KEYS = [
    'barak', 'pasukan_infanteri', 'tank_tempur_utama', 'apc_ifv', 'artileri_berat',
    'sistem_peluncur_roket', 'pertahanan_udara_mobile', 'kendaraan_taktis',
    'kapal_induk', 'kapal_induk_nuklir', 'kapal_destroyer', 'kapal_korvet',
    'kapal_selam_nuklir', 'kapal_selam_regular', 'kapal_ranjau', 'kapal_logistik',
    'jet_tempur_siluman', 'jet_tempur_interceptor', 'pesawat_pengebom',
    'helikopter_serang', 'pesawat_pengintai', 'drone_intai_uav', 'drone_kamikaze', 'pesawat_angkut'
  ];

  const updatedArmada: Record<string, any> = {
    ...(typeof currentSim.armada === 'object' ? currentSim.armada : {}),
    darat: { ...(currentSim.armada?.darat || baseArmada?.darat || {}) },
    laut: { ...(currentSim.armada?.laut || baseArmada?.laut || {}) },
    udara: { ...(currentSim.armada?.udara || baseArmada?.udara || {}) },
  };

  let reducedCount = 0;
  const losses: Array<{ unitKey: string; quantity: number }> = [];

  ALL_UNIT_KEYS.forEach((unitKey) => {
    let currentQty = Number(
      currentSim[unitKey] ??
      currentSim?.armada?.[unitKey] ??
      updatedArmada?.darat?.[unitKey] ??
      updatedArmada?.laut?.[unitKey] ??
      updatedArmada?.udara?.[unitKey] ??
      (match as any)?.[unitKey] ??
      0
    );

    if (unitKey === 'barak' && currentQty > 0) {
      const currentInfantry = Number(
        currentSim?.pasukan_infanteri ??
        currentSim?.armada?.pasukan_infanteri ??
        updatedArmada?.darat?.pasukan_infanteri ??
        (currentQty * 800)
      );
      const lostInfantry = Math.round(currentInfantry * 0.30);
      if (lostInfantry > 0) {
        const remainingInfantry = Math.max(0, currentInfantry - lostInfantry);
        const remainingBarak = Math.max(0, Math.floor(remainingInfantry / 800));
        currentSim.pasukan_infanteri = remainingInfantry;
        currentSim.barak = remainingBarak;
        updatedArmada.pasukan_infanteri = remainingInfantry;
        updatedArmada.barak = remainingBarak;
        if (updatedArmada.darat) {
          updatedArmada.darat.pasukan_infanteri = remainingInfantry;
          updatedArmada.darat.barak = remainingBarak;
        }
        reducedCount += lostInfantry;
        losses.push({ unitKey: 'pasukan_infanteri', quantity: lostInfantry });
      }
    } else if (unitKey !== 'pasukan_infanteri' && currentQty > 0) {
      // Potong 30% kekuatan militer
      const remaining = Math.max(0, Math.floor(currentQty * 0.70));
      const lostQty = currentQty - remaining;
      if (lostQty > 0) {
        reducedCount += lostQty;
        losses.push({ unitKey, quantity: lostQty });
      }

      currentSim[unitKey] = remaining;
      updatedArmada[unitKey] = remaining;
      if (unitKey in updatedArmada.darat) updatedArmada.darat[unitKey] = remaining;
      if (unitKey in updatedArmada.laut) updatedArmada.laut[unitKey] = remaining;
      if (unitKey in updatedArmada.udara) updatedArmada.udara[unitKey] = remaining;
    }
  });

  try {
    updateNpcCountrySimulationState(slug, {
      ...currentSim,
      armada: updatedArmada,
    });
  } catch (err) {
    console.warn("[ICBM War] Gagal memotong kekuatan militer negara target:", err);
  }

  return { reducedCount, losses };
}
/**
 * Mengatur hubungan bilateral khusus antara negara penyerang dan negara target.
 * Saat pertama kali diserang: diset ke 1.
 * Saat serangan selesai: diubah ke 20 secara default.
 */
export function setIcbmBilateralRelation(
  attackerCountry: string,
  targetCountry: string,
  value: 1 | 20
): void {
  const normA = normalizeCountryString(attackerCountry);
  const normB = normalizeCountryString(targetCountry);

  const matchA = COUNTRIES_DATA.find(c => normalizeCountryString(c.country || (c as any).nama_negara) === normA)?.country || attackerCountry;
  const matchB = COUNTRIES_DATA.find(c => normalizeCountryString(c.country || (c as any).nama_negara) === normB)?.country || targetCountry;

  setRelationSourceValue(matchA, matchB, "icbm-strike", value);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("country_relations_updated"));
  }
}

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

  // 1. Hubungan dengan negara yang diserang langsung turun ke 1 terlebih dulu saat pertama kali diserang
  setIcbmBilateralRelation(attackerCountry, targetCountry, 1);

  // 2. Terapkan pinalti hubungan diplomatik -5 poin ke seluruh negara di database selain 2 negara yang bertikai
  const affectedCount = applyIcbmGlobalRelationPenalty(attackerCountry, targetCountry);

  // 3. Karena peluncuran ICBM adalah agresi tanpa mandat PBB, cabut status keanggotaan Dewan Keamanan
  try {
    expelCountryFromSecurityCouncil(attackerCountry);
  } catch (err) {
    console.warn("[ICBM War] Gagal memeriksa status DK PBB:", err);
  }

  // 4. Picu animasi path-icbm berwarna merah di layar lewat event pelacakan diplomasi/perang
  if (typeof window !== "undefined") {
    const pathId = `icbm-strike-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.dispatchEvent(
      new CustomEvent("neosantara_diplomacy_path", {
        detail: {
          pathId,
          kind: "icbm",
          senderCountry: attackerCountry,
          targetCountry: targetCountry,
          isPlayerAttacker: params.isPlayerAttacker === true,
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
    message: `Rudal balistik ICBM berhasil diluncurkan dari ${attackerCountry} menuju ${targetCountry}! Hubungan bilateral turun ke level 1. Hubungan dengan ${affectedCount} negara dunia lainnya turun 5 poin sebagai sanksi pinalti.`,
    attackerCountry,
    targetCountry,
    affectedWorldCountriesCount: affectedCount,
    relationPenaltyPerCountry: 5,
  };
}
