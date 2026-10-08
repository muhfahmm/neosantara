/**
 * DeepSeek AI Battle Engine - TypeScript Module
 * Folder: app/page/detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/
 */

export interface BattleInput {
  attackerPower: number;
  targetPower: number;
  terrain?: 'normal' | 'mountain' | 'pegunungan' | 'fortress' | 'benteng';
  attackerTech?: number;
  targetTech?: number;
  damageRate?: number;
  maxRounds?: number;
}

export interface BattleResult {
  winner: 'attacker' | 'target' | 'draw';
  isVictory: boolean;
  totalRounds: number;
  attackerInitialPower: number;
  targetInitialPower: number;
  attackerFinalPower: number;
  targetFinalPower: number;
  attackerPct: number;
  targetPct: number;
  log: string[];
  message: string;
}

/**
 * Algoritma Utama Simulasi Perang Multi-Ronde Berbasis DeepSeek AI Recommendation
 */
export function simulateBattleTs(input: BattleInput): BattleResult {
  const {
    attackerPower,
    targetPower,
    terrain = 'normal',
    attackerTech = 1.0,
    targetTech = 1.0,
    damageRate = 0.15,
    maxRounds = 1000,
  } = input;

  const total = attackerPower + targetPower;
  if (total <= 0) {
    return {
      winner: 'draw',
      isVictory: false,
      totalRounds: 0,
      attackerInitialPower: 0,
      targetInitialPower: 0,
      attackerFinalPower: 0,
      targetFinalPower: 0,
      attackerPct: 50.0,
      targetPct: 50.0,
      log: ['Kekuatan kedua belah pihak 0. Pertempuran dibatalkan.'],
      message: 'Seri (Tidak ada kekuatan)',
    };
  }

  const attackerPct = (attackerPower / total) * 100;
  const targetPct = (targetPower / total) * 100;

  // Fase 6: 100% vs 0% (Anomali - Pendudukan Instan)
  if (attackerPower > 0 && targetPower <= 0) {
    return {
      winner: 'attacker',
      isVictory: true,
      totalRounds: 0,
      attackerInitialPower: Math.round(attackerPower),
      targetInitialPower: 0,
      attackerFinalPower: Math.round(attackerPower),
      targetFinalPower: 0,
      attackerPct: 100.0,
      targetPct: 0.0,
      log: ['Pendudukan wilayah instan (Kekuatan Target 0).'],
      message: 'Kemenangan Mutlak Instan',
    };
  } else if (attackerPower <= 0 && targetPower > 0) {
    return {
      winner: 'target',
      isVictory: false,
      totalRounds: 0,
      attackerInitialPower: 0,
      targetInitialPower: Math.round(targetPower),
      attackerFinalPower: 0,
      targetFinalPower: Math.round(targetPower),
      attackerPct: 0.0,
      targetPct: 100.0,
      log: ['Pasukan Penyerang 0 unit. Pertahanan Target tidak tersentuh.'],
      message: 'Kekalahan Instan',
    };
  }

  // Terrain Defense Buff
  let terrainDefBuff = 1.0;
  if (terrain === 'mountain' || terrain === 'pegunungan') {
    terrainDefBuff = 0.8; // Target bertahan di pegunungan (Damage diterima -20%)
  } else if (terrain === 'fortress' || terrain === 'benteng') {
    terrainDefBuff = 0.7; // Target dalam benteng (Damage diterima -30%)
  }

  let curAtk = attackerPower;
  let curTgt = targetPower;

  const logs: string[] = [];
  let round = 1;

  let atkMorale = 1.0;
  let tgtMorale = 1.0;

  while (curAtk > 0 && curTgt > 0 && round <= maxRounds) {
    // Random Number Generator (0.8 hingga 1.2 per ronde)
    const rngAtk = 0.8 + Math.random() * 0.4;
    const rngTgt = 0.8 + Math.random() * 0.4;

    const dmgToTarget = (curAtk * damageRate * rngAtk * attackerTech * atkMorale) * terrainDefBuff;
    const dmgToAttacker = curTgt * damageRate * rngTgt * targetTech * tgtMorale;

    curTgt -= dmgToTarget;
    curAtk -= dmgToAttacker;

    if (curTgt < 0) curTgt = 0;
    if (curAtk < 0) curAtk = 0;

    // Adjust Morale & Fatigue based on damage dealt
    if (dmgToAttacker > dmgToTarget) {
      atkMorale = Math.max(0.4, atkMorale - 0.02);
      tgtMorale = Math.min(1.2, tgtMorale + 0.01);
    } else if (dmgToTarget > dmgToAttacker) {
      tgtMorale = Math.max(0.4, tgtMorale - 0.02);
      atkMorale = Math.min(1.2, atkMorale + 0.01);
    }

    // Logistics Support & Regeneration after 50 rounds
    if (round > 50) {
      if (curAtk > 0) curAtk *= 1.002;
      if (curTgt > 0) curTgt *= 1.002;
    }

    if (round <= 15) {
      logs.push(`Ronde ${round}: Penyerang ${Math.round(curAtk).toLocaleString('id-ID')} | Target ${Math.round(curTgt).toLocaleString('id-ID')}`);
    }

    round++;
  }

  let winner: 'attacker' | 'target' | 'draw' = 'draw';
  let isVictory = false;
  let message = 'Seri (Mutual Destruction)';

  if (curAtk <= 0 && curTgt <= 0) {
    winner = 'draw';
    isVictory = false;
    message = 'Seri (Mutual Destruction)';
  } else if (curAtk <= 0) {
    winner = 'target';
    isVictory = false;
    message = 'TARGET MENANG';
  } else {
    winner = 'attacker';
    isVictory = true;
    message = 'PENYERANG MENANG';
  }

  return {
    winner,
    isVictory,
    totalRounds: round - 1,
    attackerInitialPower: Math.round(attackerPower),
    targetInitialPower: Math.round(targetPower),
    attackerFinalPower: Math.round(curAtk),
    targetFinalPower: Math.round(curTgt),
    attackerPct: Number(attackerPct.toFixed(2)),
    targetPct: Number(targetPct.toFixed(2)),
    log: logs,
    message,
  };
}

/**
 * Interface publik yang menyambungkan logika perang dengan Python AI jika tersedia,
 * atau eksekusi algoritma TypeScript secara langsung.
 */
export async function runDeepSeekWarSimulation(input: BattleInput): Promise<BattleResult> {
  // Dalam browser / React client, langsung gunakan algoritma DeepSeek TypeScript
  return simulateBattleTs(input);
}

/**
 * Fungsi untuk mengurangi 75% dari unit armada yang DIKERAHKAN oleh user ketika mengalami kekalahan / terpukul mundur.
 * Pengurangan ini hanya memutasi state/localStorage user aktif tanpa mengubah template default database.
 */
export function applyWarLossesToUserArmada(countryDetail: any, lossRatio: number = 0.75): { updatedDetail: any; lossSummaryText: string } {
  if (!countryDetail || typeof window === "undefined") {
    return { updatedDetail: countryDetail, lossSummaryText: "" };
  }

  let savedConfig: Record<string, number> = {};
  try {
    const raw = localStorage.getItem("deployed_units_config");
    if (raw) savedConfig = JSON.parse(raw);
  } catch (e) {}

  const nextDetail = JSON.parse(JSON.stringify(countryDetail));

  const ALL_UNIT_KEYS = [
    'barak', 'pasukan_infanteri', 'tank_tempur_utama', 'apc_ifv', 'artileri_berat',
    'sistem_peluncur_roket', 'pertahanan_udara_mobile', 'kendaraan_taktis',
    'kapal_induk', 'kapal_induk_nuklir', 'kapal_destroyer', 'kapal_korvet',
    'kapal_selam_nuklir', 'kapal_selam_regular', 'kapal_ranjau', 'kapal_logistik',
    'jet_tempur_siluman', 'jet_tempur_interceptor', 'pesawat_pengebom',
    'helikopter_serang', 'pesawat_pengintai', 'drone_intai_uav', 'drone_kamikaze', 'pesawat_angkut'
  ];

  const lostSummaryItems: string[] = [];

  ALL_UNIT_KEYS.forEach((key) => {
    const deployedPct = savedConfig[key] ?? 0;
    if (deployedPct <= 0) return;

    let currentQty = Number(nextDetail[key] ?? nextDetail?.armada?.[key] ?? 0);
    if (key === 'barak' && currentQty > 0) {
      const currentInfantry = Number(nextDetail?.pasukan_infanteri ?? (currentQty * 800));
      const deployedInfantry = Math.round((currentInfantry * deployedPct) / 100);
      const lostInfantry = Math.round(deployedInfantry * lossRatio);

      if (lostInfantry > 0) {
        const remainingInfantry = Math.max(0, currentInfantry - lostInfantry);
        nextDetail.pasukan_infanteri = remainingInfantry;
        nextDetail.barak = Math.max(0, Math.floor(remainingInfantry / 800));
        if (nextDetail.armada) {
          nextDetail.armada.pasukan_infanteri = remainingInfantry;
          nextDetail.armada.barak = nextDetail.barak;
        }
        lostSummaryItems.push(`${lostInfantry.toLocaleString('id-ID')} Prajurit Infanteri`);
      }
    } else if (key !== 'pasukan_infanteri' && currentQty > 0) {
      const deployedQty = Math.round((currentQty * deployedPct) / 100);
      const lostQty = Math.round(deployedQty * lossRatio);

      if (lostQty > 0) {
        const remainingQty = Math.max(0, currentQty - lostQty);
        nextDetail[key] = remainingQty;
        if (nextDetail.armada) {
          nextDetail.armada[key] = remainingQty;
        }
        const unitName = key.replace(/_/g, ' ').toUpperCase();
        lostSummaryItems.push(`${lostQty.toLocaleString('id-ID')} ${unitName}`);
      }
    }
  });

  return {
    updatedDetail: nextDetail,
    lossSummaryText: lostSummaryItems.length > 0 ? lostSummaryItems.join(', ') : 'Tidak ada kerugian unit',
  };
}
