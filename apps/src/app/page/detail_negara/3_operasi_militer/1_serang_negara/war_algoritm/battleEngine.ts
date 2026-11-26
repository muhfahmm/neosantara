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
  seed?: number;
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

export interface BattleDamageResolution {
  attackerPower: number;
  targetPower: number;
  attackerDamage: number;
  targetDamage: number;
  tieBreaker: BattleResult['winner'];
  winnerOverride?: Exclude<BattleResult['winner'], 'draw'>;
}

export interface BattleWinProbability {
  attackerWinPct: number;
  targetWinPct: number;
  drawPct: number;
  simulations: number;
  isBalanced: boolean;
}

export function getMinimumLossRatioForCasualty(unitQuantities: readonly number[]): number {
  const largestUnitCount = unitQuantities.reduce(
    (largest, quantity) => Number.isFinite(quantity) ? Math.max(largest, quantity) : largest,
    0,
  );
  return largestUnitCount > 0 ? 1 / largestUnitCount : 0;
}

export function resolveBattleDamage({
  attackerPower,
  targetPower,
  attackerDamage: rawAttackerDamage,
  targetDamage: rawTargetDamage,
  tieBreaker,
  winnerOverride,
}: BattleDamageResolution): {
  winner: BattleResult['winner'];
  attackerDamage: number;
  targetDamage: number;
} {
  const safeAttackerPower = Math.max(0, Math.round(attackerPower));
  const safeTargetPower = Math.max(0, Math.round(targetPower));
  const attackerDamage = Math.min(safeAttackerPower, Math.max(0, Math.round(rawAttackerDamage)));
  const targetDamage = Math.min(safeTargetPower, Math.max(0, Math.round(rawTargetDamage)));
  return { winner: winnerOverride ?? tieBreaker, attackerDamage, targetDamage };
}

export function estimateBattleWinProbability(
  input: Omit<BattleInput, 'seed'> & {
    requestedInvasion?: boolean;
    targetCityIsCapital?: boolean;
  },
  simulations = 1000,
): BattleWinProbability {
  if (!Number.isSafeInteger(simulations) || simulations < 1 || simulations > 10000) {
    throw new RangeError('simulations harus berupa bilangan bulat antara 1 dan 10000.');
  }

  const attackerPower = Math.round(input.attackerPower);
  const targetPower = Math.round(input.targetPower);
  let attackerWins = 0;
  let targetWins = 0;
  let draws = 0;

  for (let index = 0; index < simulations; index += 1) {
    const seed = index + 1;
    const battle = simulateBattle({
      ...input,
      attackerPower,
      targetPower,
      seed,
    }, false);
    const requestedWinner = input.requestedInvasion
      ? (() => {
        const winChance = attackerPower > targetPower ? 0.6 : attackerPower < targetPower ? 0.4 : 0.5;
        const roll = createSeededRandom(seed ^ 0x9e3779b9)();
        return roll < winChance ? 'attacker' : 'target';
      })()
      : undefined;

    const attackerDamage = Math.max(0, attackerPower - battle.attackerFinalPower);
    let targetDamage = Math.max(0, targetPower - battle.targetFinalPower);
    if (
      (requestedWinner ?? battle.winner) === 'attacker' &&
      input.targetCityIsCapital === false
    ) {
      const nonCapitalLossRatio = 0.1 + (Math.abs(Math.sin(seed)) % 1) * 0.05;
      targetDamage = Math.min(
        targetDamage,
        Math.max(1, Math.round(targetPower * nonCapitalLossRatio)),
      );
    }

    const outcome = resolveBattleDamage({
      attackerPower,
      targetPower,
      attackerDamage,
      targetDamage,
      tieBreaker: battle.winner,
      winnerOverride: requestedWinner,
    }).winner;
    if (outcome === 'attacker') attackerWins += 1;
    else if (outcome === 'target') targetWins += 1;
    else draws += 1;
  }

  const attackerWinPct = attackerWins / simulations * 100;
  const targetWinPct = targetWins / simulations * 100;
  const drawPct = draws / simulations * 100;
  const winDifference = attackerWins / simulations - targetWins / simulations;
  const differenceVariance = Math.max(
    0,
    (attackerWins + targetWins) / simulations - winDifference ** 2,
  );
  const uncertaintyMargin = 1.96 * Math.sqrt(differenceVariance / simulations);

  return {
    attackerWinPct,
    targetWinPct,
    drawPct,
    simulations,
    isBalanced: attackerWins + targetWins > 0 &&
      Math.abs(winDifference) <= uncertaintyMargin,
  };
}

function validateBattleInput(input: BattleInput): void {
  const { attackerPower, targetPower } = input;
  if (!Number.isFinite(attackerPower) || attackerPower < 0) {
    throw new RangeError('attackerPower harus berupa angka terbatas yang tidak negatif.');
  }
  if (!Number.isFinite(targetPower) || targetPower < 0) {
    throw new RangeError('targetPower harus berupa angka terbatas yang tidak negatif.');
  }
  if (!Number.isFinite(attackerPower + targetPower)) {
    throw new RangeError('Total kekuatan pasukan harus berupa angka terbatas.');
  }

  for (const [name, value] of [
    ['attackerTech', input.attackerTech ?? 1],
    ['targetTech', input.targetTech ?? 1],
  ] as const) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`${name} harus berupa angka terbatas yang tidak negatif.`);
    }
  }

  const terrain = input.terrain ?? 'normal';
  if (!['normal', 'mountain', 'pegunungan', 'fortress', 'benteng'].includes(terrain)) {
    throw new RangeError('terrain bukan jenis medan yang didukung.');
  }

  const damageRate = input.damageRate ?? 0.15;
  if (!Number.isFinite(damageRate) || damageRate < 0 || damageRate > 1) {
    throw new RangeError('damageRate harus berada di antara 0 dan 1.');
  }

  const maxRounds = input.maxRounds ?? 1000;
  if (!Number.isSafeInteger(maxRounds) || maxRounds < 1 || maxRounds > 10000) {
    throw new RangeError('maxRounds harus berupa bilangan bulat antara 1 dan 10000.');
  }

  if (input.seed !== undefined && !Number.isSafeInteger(input.seed)) {
    throw new RangeError('seed harus berupa bilangan bulat yang aman.');
  }
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Algoritma Utama Simulasi Perang Multi-Ronde Berbasis DeepSeek AI Recommendation
 */
export function simulateBattleTs(input: BattleInput): BattleResult {
  return simulateBattle(input, true);
}

function simulateBattle(input: BattleInput, includeLogs: boolean): BattleResult {
  validateBattleInput(input);

  const {
    attackerPower,
    targetPower,
    terrain = 'normal',
    attackerTech = 1.0,
    targetTech = 1.0,
    damageRate = 0.15,
    maxRounds = 1000,
    seed,
  } = input;
  const random = seed === undefined ? Math.random : createSeededRandom(seed);

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
    const rngAtk = 0.8 + random() * 0.4;
    const rngTgt = 0.8 + random() * 0.4;

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

    if (includeLogs && round <= 15) {
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
  } else if (curTgt <= 0) {
    winner = 'attacker';
    isVictory = true;
    message = 'PENYERANG MENANG';
  } else if (curAtk > curTgt) {
    winner = 'attacker';
    isVictory = true;
    message = 'PENYERANG MENANG (SISA KEKUATAN LEBIH BESAR)';
  } else {
    winner = 'target';
    isVictory = false;
    message = curAtk === curTgt
      ? 'TARGET MENANG (KEKUATAN SAMA, PERTAHANAN BERTAHAN)'
      : 'TARGET MENANG (SISA KEKUATAN LEBIH BESAR)';
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
const ALL_UNIT_KEYS = [
  'barak', 'tank_tempur_utama', 'apc_ifv', 'artileri_berat',
  'sistem_peluncur_roket', 'pertahanan_udara_mobile', 'kendaraan_taktis',
  'kapal_induk', 'kapal_induk_nuklir', 'kapal_destroyer', 'kapal_korvet',
  'kapal_selam_nuklir', 'kapal_selam_regular', 'kapal_ranjau', 'kapal_logistik',
  'jet_tempur_siluman', 'jet_tempur_interceptor', 'pesawat_pengebom',
  'helikopter_serang', 'pesawat_pengintai', 'drone_intai_uav', 'drone_kamikaze', 'pesawat_angkut'
];

const firstPositive = (...values: unknown[]) => values
  .map(value => Number(value))
  .find(value => Number.isFinite(value) && value > 0) ?? 0;

type ArmyDetail = Record<string, unknown>;

const asArmyDetail = (value: unknown): ArmyDetail | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as ArmyDetail
    : null;

const getArmyUnitQuantity = (detail: unknown, key: string) => {
  const record = asArmyDetail(detail);
  if (!record) return 0;
  const armada = asArmyDetail(record.armada);
  const darat = asArmyDetail(armada?.darat);
  const laut = asArmyDetail(armada?.laut);
  const udara = asArmyDetail(armada?.udara);
  const armadaQuantity = firstPositive(
    record[key],
    armada?.[key],
    darat?.[key],
    laut?.[key],
    udara?.[key],
  );
  return key === 'barak'
    ? firstPositive(
      record.pasukan_infanteri,
      armada?.pasukan_infanteri,
      darat?.pasukan_infanteri,
      armadaQuantity * 800,
    )
    : armadaQuantity;
};

export function restoreCommittedArmyDeployment(
  currentDetail: ArmyDetail | null,
  armySnapshot: unknown,
  committedDetail: unknown,
): ArmyDetail | null {
  if (!currentDetail || !armySnapshot || !committedDetail) return currentDetail;

  const nextDetail = JSON.parse(JSON.stringify(currentDetail)) as ArmyDetail;
  ALL_UNIT_KEYS.forEach(key => {
    const deployedQuantity = Math.max(
      0,
      getArmyUnitQuantity(armySnapshot, key) - getArmyUnitQuantity(committedDetail, key),
    );
    if (deployedQuantity <= 0) return;

    const currentQuantity = getArmyUnitQuantity(nextDetail, key);
    if (key === 'barak') {
      const infantry = currentQuantity + deployedQuantity;
      nextDetail.pasukan_infanteri = infantry;
      nextDetail.barak = Math.floor(infantry / 800);
      const armada = asArmyDetail(nextDetail.armada);
      if (armada) {
        nextDetail.armada = {
          ...armada,
          pasukan_infanteri: infantry,
          barak: nextDetail.barak,
          darat: {
            ...asArmyDetail(armada.darat),
            pasukan_infanteri: infantry,
            barak: nextDetail.barak,
          },
        };
      }
      return;
    }

    const restoredQuantity = currentQuantity + deployedQuantity;
    nextDetail[key] = restoredQuantity;
    const armada = asArmyDetail(nextDetail.armada);
    if (!armada) return;

    const group = key.startsWith('kapal_')
      ? 'laut'
      : /^(jet_|pesawat_|helikopter_|drone_)/.test(key)
        ? 'udara'
        : 'darat';
    nextDetail.armada = {
      ...armada,
      [key]: restoredQuantity,
      [group]: {
        ...asArmyDetail(armada[group]),
        [key]: restoredQuantity,
      },
    };
  });

  return nextDetail;
}

export function applyWarLossesToUserArmada(
  countryDetail: any,
  lossRatio: number = 0.75,
  randomizeLosses = false,
  deploymentConfigOverride?: Record<string, number>,
): {
  updatedDetail: any;
  lossSummaryText: string;
  losses: Array<{ unitKey: string; quantity: number }>;
} {
  if (!countryDetail || typeof window === "undefined") {
    return { updatedDetail: countryDetail, lossSummaryText: "", losses: [] };
  }

  let savedConfig = deploymentConfigOverride ?? {};
  if (!deploymentConfigOverride) {
    try {
      const raw = localStorage.getItem("deployed_units_config");
      if (raw) savedConfig = JSON.parse(raw);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("[battleEngine] Gagal mem-parse deployed_units_config dari localStorage:", e);
      }
    }
  }

  const nextDetail = JSON.parse(JSON.stringify(countryDetail));
  const lostSummaryItems: string[] = [];
  const losses: Array<{ unitKey: string; quantity: number }> = [];

  ALL_UNIT_KEYS.forEach((key) => {
    // Jika user belum pernah menyetel slider, anggap 100% unit dikerahkan untuk pertahanan
    const deployedPct = typeof savedConfig[key] === 'number' ? savedConfig[key] : 100;
    if (deployedPct <= 0) return;

    const currentQty = firstPositive(
      nextDetail[key],
      nextDetail?.armada?.[key],
      nextDetail?.armada?.darat?.[key],
      nextDetail?.armada?.laut?.[key],
      nextDetail?.armada?.udara?.[key],
    );
    const currentInfantry = key === 'barak'
      ? firstPositive(
        nextDetail?.pasukan_infanteri,
        nextDetail?.armada?.pasukan_infanteri,
        nextDetail?.armada?.darat?.pasukan_infanteri,
        currentQty * 800,
      )
      : 0;

    if (key === 'barak' && currentInfantry > 0) {
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
