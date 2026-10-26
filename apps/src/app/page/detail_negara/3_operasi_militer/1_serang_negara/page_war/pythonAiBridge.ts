/**
 * Jembatan komunikasi TypeScript Frontend ke Engine Python AI Perang
 * Mendukung pemanggilan API Server FastAPI (port 8001) dengan fallback kalkulasi lokal jika server offline.
 */

export interface WarUnitState {
  id: string;
  kind: string;
  group: 'darat' | 'udara' | 'laut';
  label: string;
  quantity: number;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  is_enemy?: boolean;
  is_visible?: boolean;
}

export interface MovementDecision {
  unit_id: string;
  action: 'intercept' | 'flank' | 'kite' | 'hold';
  target_x: number;
  target_y: number;
  speed: number;
}

export interface AttackDecision {
  attacker_id: string;
  target_unit_id: string;
  target_x: number;
  target_y: number;
  weapon_type: number;
  damage_potential: number;
  hit_chance: number; // 0.0 - 1.0 probabilitas kena sasaran realistis
  penetration: number; // Faktor penembus armor
  in_range: boolean;
}

export interface TacticalAIResponse {
  alert_level: number;
  tactical_message: string;
  movements: MovementDecision[];
  attacks: AttackDecision[];
}

const PYTHON_API_URL = 'http://127.0.0.1:8001/api/ai-war-cycle';

/**
 * Memanggil Python AI Combat Engine untuk mendapatkan instruksi pergerakan dan sasaran tembak AI.
 */
export async function requestPythonAIWarCycle(
  enemyUnits: WarUnitState[],
  userUnits: WarUnitState[],
  mapBounds: { max_x: number; max_y: number } = { max_x: 6400, max_y: 2400 }
): Promise<TacticalAIResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);

    const res = await fetch(PYTHON_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enemy_units: enemyUnits,
        user_units: userUnits,
        map_bounds: mapBounds,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as TacticalAIResponse;
      return data;
    }
  } catch {
    // Fallback seamless jika service Python belum di-boot
  }

  // Fallback Client Rule Engine yang mencerminkan python/ai_combat_engine.py
  return computeFallbackTacticalCycle(enemyUnits, userUnits, mapBounds);
}

function scoreTargetPriority(enemy: WarUnitState, userUnit: WarUnitState): number {
  const dist = Math.hypot(enemy.x - userUnit.x, enemy.y - userUnit.y);
  let multiplier = 1.0;
  if (userUnit.kind === 'artileriBerat' || userUnit.kind === 'peluncurRoket') {
    multiplier = 2.4;
  } else if (userUnit.kind === 'tank' || userUnit.kind === 'apcIfv') {
    multiplier = 1.8;
  } else if (userUnit.group === 'udara') {
    multiplier = 2.0;
  } else if (userUnit.kind === 'pertahananUdaraMobile') {
    multiplier = 1.6;
  } else {
    multiplier = 1.2;
  }
  return (10000 / (dist + 50)) * multiplier;
}

function computeFallbackTacticalCycle(
  enemyUnits: WarUnitState[],
  userUnits: WarUnitState[],
  bounds: { max_x: number; max_y: number }
): TacticalAIResponse {
  const movements: MovementDecision[] = [];
  const attacks: AttackDecision[] = [];

  const ranges: Record<string, number> = {
    artileriBerat: 1600,
    peluncurRoket: 1650,
    tank: 950,
    apcIfv: 850,
    kendaraanTaktis: 750,
    infanteri: 680,
    pertahananUdaraMobile: 1400,
    jetTempurSiluman: 1300,
    jetTempurInterceptor: 1150,
    pesawatPengebom: 1500,
    helikopterSerang: 950,
    destroyer: 1350,
    korvet: 1050,
  };

  for (const enemy of enemyUnits) {
    if (userUnits.length === 0) continue;

    // Target dengan skor prioritas taktis tertinggi (artileri/tank/terdekat)
    let bestTarget = userUnits[0];
    let highestScore = -Infinity;
    for (const u of userUnits) {
      const score = scoreTargetPriority(enemy, u);
      if (score > highestScore) {
        highestScore = score;
        bestTarget = u;
      }
    }

    const minDist = Math.hypot(bestTarget.x - enemy.x, bestTarget.y - enemy.y);
    const range = ranges[enemy.kind] || 750;

    // 1. Logika Pergerakan: Doktrin Militer Realistis (Standoff & Hold, Tidak Maju Membabi Buta)
    const effectiveFiringRange = range * 0.85;
    const minSafeStandoff = range * 0.35;

    if (enemy.kind === 'artileriBerat' || enemy.kind === 'peluncurRoket' || enemy.kind === 'pertahananUdaraMobile') {
      // Artileri & SAM: Jaga jarak jauh, tembak dari batas aman
      if (minDist < minSafeStandoff) {
        movements.push({
          unit_id: enemy.id,
          action: 'kite',
          target_x: Math.min(bounds.max_x - 150, enemy.x + 180),
          target_y: enemy.y,
          speed: 320,
        });
      } else if (minDist <= effectiveFiringRange) {
        // Sudah dalam jangkauan tembak: BERHENTI, bidik & tembak!
        movements.push({
          unit_id: enemy.id,
          action: 'hold',
          target_x: enemy.x,
          target_y: enemy.y,
          speed: 320,
        });
      } else {
        // Dekati hingga masuk jangkauan 70%
        const angle = Math.atan2(bestTarget.y - enemy.y, bestTarget.x - enemy.x);
        const advanceDist = minDist - range * 0.7;
        const tx = Math.max(100, Math.min(bounds.max_x - 100, enemy.x + Math.cos(angle) * advanceDist));
        const ty = Math.max(100, Math.min(bounds.max_y - 100, enemy.y + Math.sin(angle) * advanceDist));
        movements.push({
          unit_id: enemy.id,
          action: 'intercept',
          target_x: Math.round(tx),
          target_y: Math.round(ty),
          speed: 320,
        });
      }
    } else if (
      enemy.kind === 'tank' ||
      enemy.kind === 'tankTempurUtama' ||
      enemy.kind === 'apcIfv' ||
      enemy.kind === 'kendaraanLapisBaja'
    ) {
      // Tank MBT & IFV: Garis tempur taktis (Battle Line), tembak dari jarak aman, jangan menabrak musuh
      const battleLineDist = enemy.kind === 'tank' || enemy.kind === 'tankTempurUtama' ? 550 : 450;
      if (minDist < 320) {
        // Terlalu dekat, mundur sedikit untuk mempertahankan sudut elevasi meriam
        const angle = Math.atan2(enemy.y - bestTarget.y, enemy.x - bestTarget.x);
        const tx = Math.max(100, Math.min(bounds.max_x - 100, enemy.x + Math.cos(angle) * 120));
        const ty = Math.max(100, Math.min(bounds.max_y - 100, enemy.y + Math.sin(angle) * 120));
        movements.push({
          unit_id: enemy.id,
          action: 'kite',
          target_x: Math.round(tx),
          target_y: Math.round(ty),
          speed: 260,
        });
      } else if (minDist <= effectiveFiringRange) {
        // Sudah dalam jarak tembak: BERHENTI dan tembakkan meriam!
        movements.push({
          unit_id: enemy.id,
          action: 'hold',
          target_x: enemy.x,
          target_y: enemy.y,
          speed: 260,
        });
      } else {
        // Maju taktis ke garis tempur (menjaga formasi sebar horizontal/vertikal)
        const angle = Math.atan2(bestTarget.y - enemy.y, bestTarget.x - enemy.x);
        const advanceDist = Math.max(0, minDist - battleLineDist);
        // Beri offset sayap agar tidak menumpuk dalam 1 titik
        const lateralAngle = angle + (enemy.kind === 'tank' ? Math.PI / 2.8 : -Math.PI / 2.8);
        const lateralOffset = 140;
        const tx = Math.max(100, Math.min(bounds.max_x - 100, enemy.x + Math.cos(angle) * advanceDist + Math.cos(lateralAngle) * lateralOffset));
        const ty = Math.max(100, Math.min(bounds.max_y - 100, enemy.y + Math.sin(angle) * advanceDist + Math.sin(lateralAngle) * lateralOffset));
        movements.push({
          unit_id: enemy.id,
          action: 'intercept',
          target_x: Math.round(tx),
          target_y: Math.round(ty),
          speed: 300,
        });
      }
    } else if (enemy.kind === 'infanteri') {
      // Infanteri: Mengambil posisi perlindungan (Cover & Hold) saat masuk jangkauan tembak
      if (minDist <= effectiveFiringRange) {
        movements.push({
          unit_id: enemy.id,
          action: 'hold',
          target_x: enemy.x,
          target_y: enemy.y,
          speed: 220,
        });
      } else {
        // Bergerak mendekat secara terukur sampai jarak tembak luar (75% range)
        const angle = Math.atan2(bestTarget.y - enemy.y, bestTarget.x - enemy.x);
        const advanceDist = Math.max(0, minDist - (range * 0.75));
        const tx = Math.max(100, Math.min(bounds.max_x - 100, enemy.x + Math.cos(angle) * advanceDist));
        const ty = Math.max(100, Math.min(bounds.max_y - 100, enemy.y + Math.sin(angle) * advanceDist));
        movements.push({
          unit_id: enemy.id,
          action: 'intercept',
          target_x: Math.round(tx),
          target_y: Math.round(ty),
          speed: 220,
        });
      }
    } else {
      // Udara & Laut / Kendaraan Taktis
      if (minDist <= effectiveFiringRange) {
        movements.push({
          unit_id: enemy.id,
          action: 'hold',
          target_x: enemy.x,
          target_y: enemy.y,
          speed: enemy.group === 'udara' ? 600 : 320,
        });
      } else {
        const angle = Math.atan2(bestTarget.y - enemy.y, bestTarget.x - enemy.x);
        const advanceDist = Math.max(0, minDist - (range * 0.65));
        const tx = Math.max(100, Math.min(bounds.max_x - 100, enemy.x + Math.cos(angle) * advanceDist));
        const ty = Math.max(100, Math.min(bounds.max_y - 100, enemy.y + Math.sin(angle) * advanceDist));
        movements.push({
          unit_id: enemy.id,
          action: 'intercept',
          target_x: Math.round(tx),
          target_y: Math.round(ty),
          speed: enemy.group === 'udara' ? 600 : 320,
        });
      }
    }

    // 2. Logika Tembakan (dengan jangkauan efektif, doktrin Anti-Air, dan toleransi intersepsi)
    const attackEffectiveRange = range * 1.25;
    const isAntiAir = ['pertahananUdaraMobile', 'jetTempurInterceptor', 'jetTempurSiluman', 'destroyer', 'korvet', 'infanteri'].includes(enemy.kind) || enemy.group === 'udara';
    const canHitTarget = bestTarget.group !== 'udara' || isAntiAir;

    if (minDist <= attackEffectiveRange && canHitTarget) {
      let weaponType = 4;
      if (enemy.kind === 'pertahananUdaraMobile' || enemy.kind === 'jetTempurInterceptor' || (bestTarget.group === 'udara' && isAntiAir)) {
        weaponType = 5;
      } else if (enemy.kind === 'artileriBerat' || enemy.kind === 'peluncurRoket') {
        weaponType = 0;
      } else if (enemy.group === 'udara') {
        weaponType = 1;
      }

      attacks.push({
        attacker_id: enemy.id,
        target_unit_id: bestTarget.id,
        target_x: bestTarget.x,
        target_y: bestTarget.y,
        weapon_type: weaponType,
        damage_potential: Math.round(Math.sqrt(enemy.quantity) * 12),
        hit_chance: 0.85,
        penetration: enemy.kind === 'tank' ? 1.4 : (enemy.kind === 'artileriBerat' ? 1.6 : 0.9),
        in_range: true,
      });
    }

  }

  return {
    alert_level: attacks.length > 0 ? 3 : 2,
    tactical_message: `Python AI Controller mengarahkan ${movements.length} formasi dan ${attacks.length} tembakan balasan!`,
    movements,
    attacks,
  };
}
