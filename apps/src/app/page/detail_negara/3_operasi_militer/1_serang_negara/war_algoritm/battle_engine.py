import sys
import json
import random

def simulasi_perang(
    kekuatan_penyerang: float,
    kekuatan_target: float,
    terrain: str = "normal",
    attacker_tech: float = 1.0,
    target_tech: float = 1.0,
    damage_rate: float = 0.15,
    max_rounds: int = 1000
) -> dict:
    """
    DeepSeek AI Battle Simulation Engine
    ------------------------------------
    Simulasi pertempuran multi-ronde berbasis persentase kekuatan, RNG,
    modifier medan perang, moral/kelelahan, dan logistik.
    """
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
        rng_atk = random.uniform(0.8, 1.2)
        rng_tgt = random.uniform(0.8, 1.2)

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

        # Logistik & Pemulihan Stamina setelah ronde 50
        if ronde > 50:
            if cur_atk > 0: cur_atk *= 1.002
            if cur_tgt > 0: cur_tgt *= 1.002

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
    else:
        winner = "attacker"
        is_victory = True
        message = "PENYERANG MENANG"

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
            kekuatan_penyerang=float(params.get("attackerPower", 0)),
            kekuatan_target=float(params.get("targetPower", 0)),
            terrain=str(params.get("terrain", "normal")),
            attacker_tech=float(params.get("attackerTech", 1.0)),
            target_tech=float(params.get("targetTech", 1.0)),
            damage_rate=float(params.get("damageRate", 0.15)),
            max_rounds=int(params.get("maxRounds", 1000))
        )
        print(json.dumps(res, indent=2))
    except Exception as e:
        # Fallback default testing jika dipanggil manual tanpa argumen
        demo = simulasi_perang(1724060, 58077260)
        print(json.dumps(demo, indent=2))
