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
      logs.push(`Ronde ${round}: Penyerang ${Math.round(curAtk).toLocaleString('id-ID', { maximumFractionDigits: 2 })} | Target ${Math.round(curTgt).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`);
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

function sampleBinomialLoss(deployedQty: number, lossRatio: number): number {
  const trials = Math.max(0, Math.floor(deployedQty));
  const probability = Math.max(0, Math.min(1, lossRatio));
  if (trials === 0 || probability === 0) return 0;
  if (probability === 1) return trials;

  if (trials <= 100) {
    let losses = 0;
    for (let index = 0; index < trials; index += 1) {
      if (Math.random() < probability) losses += 1;
    }
    return losses;
  }

  const mean = trials * probability;
  const standardDeviation = Math.sqrt(trials * probability * (1 - probability));
  const firstUniform = Math.max(Number.EPSILON, Math.random());
  const secondUniform = Math.random();
  const standardNormal = Math.sqrt(-2 * Math.log(firstUniform)) *
    Math.cos(2 * Math.PI * secondUniform);

  return Math.max(0, Math.min(trials, Math.round(mean + standardDeviation * standardNormal)));
}

/**
 * Mengambil sampel jumlah unit yang hilang dengan peluang kerugian sesuai lossRatio.
 * Pengurangan ini hanya memutasi state/localStorage user aktif tanpa mengubah template default database.
 */
export function applyWarLossesToUserArmada(
  countryDetail: any,
  lossRatio: number = 0.75,
  randomizeLosses = false,
): {
  updatedDetail: any;
  lossSummaryText: string;
  losses: Array<{ unitKey: string; quantity: number }>;
} {
  if (!countryDetail || typeof window === "undefined") {
    return { updatedDetail: countryDetail, lossSummaryText: "", losses: [] };
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
  const losses: Array<{ unitKey: string; quantity: number }> = [];

  ALL_UNIT_KEYS.forEach((key) => {
    // Jika user belum pernah menyetel slider, anggap 100% unit dikerahkan untuk pertahanan
    const deployedPct = typeof savedConfig[key] === 'number' ? savedConfig[key] : 100;
    if (deployedPct <= 0) return;

    let currentQty = Number(
      nextDetail[key] ??
      nextDetail?.armada?.[key] ??
      nextDetail?.armada?.darat?.[key] ??
      nextDetail?.armada?.laut?.[key] ??
      nextDetail?.armada?.udara?.[key] ??
      0
    );

    if (key === 'barak' && currentQty > 0) {
      const currentInfantry = Number(
        nextDetail?.pasukan_infanteri ??
        nextDetail?.armada?.pasukan_infanteri ??
        nextDetail?.armada?.darat?.pasukan_infanteri ??
        (currentQty * 800)
      );
      const deployedInfantry = Math.round((currentInfantry * deployedPct) / 100);
      const lostInfantry = randomizeLosses
        ? sampleBinomialLoss(deployedInfantry, lossRatio)
        : Math.round(deployedInfantry * lossRatio);

      if (lostInfantry > 0) {
        const remainingInfantry = Math.max(0, currentInfantry - lostInfantry);
        nextDetail.pasukan_infanteri = remainingInfantry;
        nextDetail.barak = Math.max(0, Math.floor(remainingInfantry / 800));
        if (nextDetail.armada) {
          nextDetail.armada.pasukan_infanteri = remainingInfantry;
          nextDetail.armada.barak = nextDetail.barak;
          if (nextDetail.armada.darat) {
            nextDetail.armada.darat.pasukan_infanteri = remainingInfantry;
            nextDetail.armada.darat.barak = nextDetail.barak;
          }
        }
        lostSummaryItems.push(`${lostInfantry.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Prajurit Infanteri`);
        losses.push({ unitKey: "pasukan_infanteri", quantity: lostInfantry });
      }
    } else if (key !== 'pasukan_infanteri' && currentQty > 0) {
      const deployedQty = Math.round((currentQty * deployedPct) / 100);
      const lostQty = randomizeLosses
        ? sampleBinomialLoss(deployedQty, lossRatio)
        : Math.round(deployedQty * lossRatio);

      if (lostQty > 0) {
        const remainingQty = Math.max(0, currentQty - lostQty);
        nextDetail[key] = remainingQty;
        if (nextDetail.armada) {
          nextDetail.armada[key] = remainingQty;
          if (nextDetail.armada.darat && key in nextDetail.armada.darat) nextDetail.armada.darat[key] = remainingQty;
          if (nextDetail.armada.laut && key in nextDetail.armada.laut) nextDetail.armada.laut[key] = remainingQty;
          if (nextDetail.armada.udara && key in nextDetail.armada.udara) nextDetail.armada.udara[key] = remainingQty;
        }
        const unitName = key.replace(/_/g, ' ').toUpperCase();
        lostSummaryItems.push(`${lostQty.toLocaleString('id-ID', { maximumFractionDigits: 2 })} ${unitName}`);
        losses.push({ unitKey: key, quantity: lostQty });
      }
    }
  });

  return {
    updatedDetail: nextDetail,
    lossSummaryText: lostSummaryItems.length > 0 ? lostSummaryItems.join(', ') : 'Tidak ada kerugian unit',
    losses,
  };
}
