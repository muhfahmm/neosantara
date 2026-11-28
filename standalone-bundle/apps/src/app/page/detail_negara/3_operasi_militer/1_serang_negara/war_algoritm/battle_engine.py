import sys
import json
import math
import random

def is_finite_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)

def validate_battle_input(
    attacker_power: float,
    target_power: float,
    attacker_tech: float,
    target_tech: float,
    terrain: str,
    damage_rate: float,
    max_rounds: int,
    seed: int | None,
) -> None:
    if not all(is_finite_number(value) and value >= 0 for value in (attacker_power, target_power)):
        raise ValueError("Kekuatan pasukan harus berupa angka terbatas yang tidak negatif.")
    if not is_finite_number(attacker_power + target_power):
        raise ValueError("Total kekuatan pasukan harus berupa angka terbatas.")
    if not all(is_finite_number(value) and value >= 0 for value in (attacker_tech, target_tech)):
        raise ValueError("Teknologi harus berupa angka terbatas yang tidak negatif.")
    if terrain not in ("normal", "mountain", "pegunungan", "fortress", "benteng"):
        raise ValueError("terrain bukan jenis medan yang didukung.")
    if not is_finite_number(damage_rate) or not 0 <= damage_rate <= 1:
        raise ValueError("damageRate harus berada di antara 0 dan 1.")
    if (
        not is_finite_number(max_rounds)
        or max_rounds != math.trunc(max_rounds)
        or not 1 <= max_rounds <= 10000
    ):
        raise ValueError("maxRounds harus berupa bilangan bulat antara 1 dan 10000.")
    if seed is not None and (
        not is_finite_number(seed)
        or seed != math.trunc(seed)
        or abs(seed) > 9007199254740991
    ):
        raise ValueError("seed harus berupa bilangan bulat.")

def simulasi_perang(
    kekuatan_penyerang: float,
    kekuatan_target: float,
    terrain: str = "normal",
    attacker_tech: float = 1.0,
    target_tech: float = 1.0,
    damage_rate: float = 0.15,
    max_rounds: int = 1000,
    seed: int | None = None,
) -> dict:
    """
    DeepSeek AI Battle Simulation Engine
    ------------------------------------
    Simulasi pertempuran multi-ronde berbasis persentase kekuatan, RNG,
    modifier medan perang, moral/kelelahan, dan logistik.
    """
    validate_battle_input(
        kekuatan_penyerang,
        kekuatan_target,
        attacker_tech,
        target_tech,
        terrain,
        damage_rate,
        max_rounds,
        seed,
    )
    max_rounds = int(max_rounds)
    if seed is not None:
        seed = int(seed)
    if seed is None:
        random_value = random.random
    else:
        rng_state = seed & 0xFFFFFFFF

        def random_value() -> float:
            nonlocal rng_state
            rng_state = (rng_state + 0x6D2B79F5) & 0xFFFFFFFF
            value = rng_state
            value = ((value ^ (value >> 15)) * (value | 1)) & 0xFFFFFFFF
            multiplied = ((value ^ (value >> 7)) * (value | 61)) & 0xFFFFFFFF
            value = (value ^ ((value + multiplied) & 0xFFFFFFFF)) & 0xFFFFFFFF
            value = (value ^ (value >> 14)) & 0xFFFFFFFF
            return value / 4294967296

    total_power = kekuatan_penyerang + kekuatan_target
    if total_power <= 0:
        return {
            "winner": "draw",
            "isVictory": False,
            "totalRounds": 0,
            "attackerFinalPower": 0,
            "targetFinalPower": 0,
            "attackerPct": 50.0,
            "targetPct": 50.0,
            "log": ["Kekuatan kedua belah pihak 0. Pertempuran dibatalkan."],
            "message": "Seri (Tidak ada kekuatan)"
        }

    pct_penyerang = (kekuatan_penyerang / total_power) * 100.0
    pct_target = (kekuatan_target / total_power) * 100.0

    # Fase 6: 100% vs 0% (Anomali - Pendudukan Instan)
    if kekuatan_penyerang > 0 and kekuatan_target <= 0:
        return {
            "winner": "attacker",
            "isVictory": True,
            "totalRounds": 0,
            "attackerFinalPower": round(kekuatan_penyerang),
            "targetFinalPower": 0,
            "attackerPct": 100.0,
            "targetPct": 0.0,
            "log": ["Pendudukan wilayah instan (Kekuatan Target 0)."],
            "message": "Kemenangan Mutlak Instan"
        }
    elif kekuatan_penyerang <= 0 and kekuatan_target > 0:
        return {
            "winner": "target",
            "isVictory": False,
            "totalRounds": 0,
            "attackerFinalPower": 0,
            "targetFinalPower": round(kekuatan_target),
            "attackerPct": 0.0,
            "targetPct": 100.0,
            "log": ["Pasukan Penyerang 0 unit. Pertahanan Target tidak tersentuh."],
            "message": "Kekalahan Instan"
        }

    # Modifier Medan Perang (Terrain Buff for Defender)
    terrain_def_buff = 1.0
    if terrain in ["mountain", "pegunungan"]:
        terrain_def_buff = 0.8  # Defender menerima 20% damage lebih sedikit
    elif terrain in ["fortress", "benteng"]:
        terrain_def_buff = 0.7  # Defender menerima 30% damage lebih sedikit

    cur_atk = float(kekuatan_penyerang)
    cur_tgt = float(kekuatan_target)

    rounds_log = []
    ronde = 1

    atk_morale = 1.0
    tgt_morale = 1.0

    while cur_atk > 0 and cur_tgt > 0 and ronde <= max_rounds:
        # Faktor keberuntungan RNG (0.8 hingga 1.2)
        rng_atk = 0.8 + random_value() * 0.4
        rng_tgt = 0.8 + random_value() * 0.4

        # Hitung damage per ronde
        dmg_to_target = (cur_atk * damage_rate * rng_atk * attacker_tech * atk_morale) * terrain_def_buff
        dmg_to_attacker = (cur_tgt * damage_rate * rng_tgt * target_tech * tgt_morale)

        cur_tgt -= dmg_to_target
        cur_atk -= dmg_to_attacker

        if cur_tgt < 0: cur_tgt = 0
        if cur_atk < 0: cur_atk = 0

        # Logika Moral & Kelelahan (Fatigue/Morale Adjustment)
        if dmg_to_attacker > dmg_to_target:
            atk_morale = max(0.4, atk_morale - 0.02)
            tgt_morale = min(1.2, tgt_morale + 0.01)
        elif dmg_to_target > dmg_to_attacker:
            tgt_morale = max(0.4, tgt_morale - 0.02)
            atk_morale = min(1.2, atk_morale + 0.01)

        rounds_log.append(
            f"Ronde {ronde}: Penyerang {round(cur_atk):,} | Target {round(cur_tgt):,}"
        )

        ronde += 1

    # Penentuan Pemenang
    if cur_atk <= 0 and cur_tgt <= 0:
        winner = "draw"
        is_victory = False
        message = "Seri (Mutual Destruction)"
    elif cur_atk <= 0:
        winner = "target"
        is_victory = False
        message = "TARGET MENANG"
    elif cur_tgt <= 0:
        winner = "attacker"
        is_victory = True
        message = "PENYERANG MENANG"
    elif cur_atk > cur_tgt:
        winner = "attacker"
        is_victory = True
        message = "PENYERANG MENANG (SISA KEKUATAN LEBIH BESAR)"
    else:
        winner = "target"
        is_victory = False
        message = (
            "TARGET MENANG (KEKUATAN SAMA, PERTAHANAN BERTAHAN)"
            if cur_atk == cur_tgt
            else "TARGET MENANG (SISA KEKUATAN LEBIH BESAR)"
        )

    return {
        "winner": winner,
        "isVictory": is_victory,
        "totalRounds": ronde - 1,
        "attackerInitialPower": round(kekuatan_penyerang),
        "targetInitialPower": round(kekuatan_target),
        "attackerFinalPower": round(cur_atk),
        "targetFinalPower": round(cur_tgt),
        "attackerPct": round(pct_penyerang, 2),
        "targetPct": round(pct_target, 2),
        "log": rounds_log[:15],  # 15 ronde awal/cuplikan
        "message": message
    }

if __name__ == "__main__":
    # Dukungan via CLI / Standard Input JSON
    try:
        if len(sys.argv) > 1:
            raw_input = sys.argv[1]
            params = json.loads(raw_input)
        else:
            params = json.load(sys.stdin)

        res = simulasi_perang(
            kekuatan_penyerang=params.get("attackerPower", 0),
            kekuatan_target=params.get("targetPower", 0),
            terrain=params.get("terrain", "normal"),
            attacker_tech=params.get("attackerTech", 1.0),
            target_tech=params.get("targetTech", 1.0),
            damage_rate=params.get("damageRate", 0.15),
            max_rounds=params.get("maxRounds", 1000),
            seed=params.get("seed"),
        )
        print(json.dumps(res, indent=2))
    except (TypeError, ValueError, json.JSONDecodeError) as error:
        print(json.dumps({"error": str(error)}), file=sys.stderr)
        sys.exit(1)
