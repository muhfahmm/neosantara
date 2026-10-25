"""
Modul logika taktis AI perang: pergerakan (manuver taktis, flanking, chase, kite)
dan penentuan tembakan (pembagian target, jangkauan serang, kalkulasi akurasi).
"""

import math
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Jangkauan serang referensi per jenis unit (dalam koordinat peta)
# Disesuaikan agar unit AI agresif menjangkau unit user yang baru keluar dari hangar/barak/gudang
ATTACK_RANGES: Dict[str, float] = {
    "artileriBerat": 1600.0,
    "peluncurRoket": 1650.0,
    "tank": 950.0,
    "apcIfv": 850.0,
    "kendaraanTaktis": 750.0,
    "infanteri": 680.0,
    "pertahananUdaraMobile": 1400.0,
    # Udara
    "jetTempurSiluman": 1300.0,
    "jetTempurInterceptor": 1150.0,
    "pesawatPengebom": 1500.0,
    "helikopterSerang": 950.0,
    "droneKamikaze": 1050.0,
    # Laut
    "destroyer": 1350.0,
    "korvet": 1050.0,
    "kapalSelamNuklir": 1250.0,
    "kapalSelamReguler": 950.0,
}

SPEED_RATES: Dict[str, float] = {
    "udara": 720.0,
    "darat": 420.0,
    "laut": 280.0,
}


class UnitState(BaseModel):
    id: str
    kind: str
    group: str  # "darat", "udara", "laut"
    label: str
    quantity: int
    x: float
    y: float
    vx: float = 0.0
    vy: float = 0.0
    is_enemy: bool = False
    is_visible: bool = True


class MovementDecision(BaseModel):
    unit_id: str
    action: str  # "intercept", "flank", "kite", "hold"
    target_x: float
    target_y: float
    speed: float


class AttackDecision(BaseModel):
    attacker_id: str
    target_unit_id: str
    target_x: float
    target_y: float
    weapon_type: int
    damage_potential: float
    hit_chance: float = 0.85
    penetration: float = 1.0
    in_range: bool


class TacticalAIResponse(BaseModel):
    alert_level: int
    tactical_message: str
    movements: List[MovementDecision] = Field(default_factory=list)
    attacks: List[AttackDecision] = Field(default_factory=list)


def distance(x1: float, y1: float, x2: float, y2: float) -> float:
    return math.hypot(x2 - x1, y2 - y1)


def score_target_priority(enemy: UnitState, user_unit: UnitState) -> float:
    """
    Menghitung skor prioritas sasaran untuk unit AI.
    Unit berdaya tembak tinggi (Artileri, MLRS, Tank, Pesawat) atau yang paling dekat
    dengan pasukan AI akan mendapat skor prioritas tertinggi agar langsung diserang.
    """
    dist = distance(enemy.x, enemy.y, user_unit.x, user_unit.y)
    
    # Ancaman nilai strategis unit user
    threat_multiplier = 1.0
    if user_unit.kind in ("artileriBerat", "peluncurRoket"):
        threat_multiplier = 2.4  # Sangat berbahaya jika dibiarkan bebas
    elif user_unit.kind in ("tank", "apcIfv"):
        threat_multiplier = 1.8  # Kendaraan tempur garis depan
    elif user_unit.kind in ("jetTempurSiluman", "jetTempurInterceptor", "helikopterSerang"):
        threat_multiplier = 2.0  # Ancaman udara
    elif user_unit.kind == "pertahananUdaraMobile":
        threat_multiplier = 1.6
    else:
        threat_multiplier = 1.2

    # Semakin dekat jarak dan semakin besar ancamannya, skor prioritas semakin tinggi
    return (10000.0 / (dist + 50.0)) * threat_multiplier


def decide_tactical_action(
    enemy_unit: UnitState,
    threats: List[UnitState],
    map_bounds: Dict[str, float]
) -> tuple[str, float, float]:
    """
    Menentukan perilaku gerakan unit AI (Intersep/Menyerbu, Flanking memutar, atau Kiting/Menjauh jika artileri).
    Secara proaktif memburu semua unit user termasuk yang baru dideploy dari hangar/barak/gudang.
    """
    if not threats:
        # Standby di posisi saat ini
        return "hold", enemy_unit.x, enemy_unit.y

    # Cari target user dengan skor ancaman/kedekatan tertinggi
    target = max(threats, key=lambda t: score_target_priority(enemy_unit, t))

    # PREDIKSI PERGERAKAN (LEAD TARGET INTERCEPTION):
    # Proyeksikan posisi target 1.0 detik ke depan berdasarkan vektor kecepatannya (vx, vy)
    predicted_target_x = target.x + (target.vx * 1.0)
    predicted_target_y = target.y + (target.vy * 1.0)

    dist = distance(enemy_unit.x, enemy_unit.y, target.x, target.y)
    my_range = ATTACK_RANGES.get(enemy_unit.kind, 750.0)

    # Doktrin Tempur Realistis:
    # Jika unit sudah berada dalam radius tembak efektif (in firing range), unit mengambil posisi bertahan/menembak (HOLD / STAND-OFF)
    # Tidak menyerbu langsung secara membabi buta ("tidak maju langsung!")
    effective_firing_range = my_range * 0.85
    min_safe_standoff = my_range * 0.35

    # 1. Artileri/MLRS/Pertahanan Udara: Menjaga jarak jauh aman (Standoff Artillery Doctrine)
    if enemy_unit.kind in ("artileriBerat", "peluncurRoket", "pertahananUdaraMobile"):
        if dist < min_safe_standoff:
            # Musuh terlalu dekat: mundur secara terukur ke perimeter aman
            retreat_x = min(map_bounds.get("max_x", 6400.0) - 150, enemy_unit.x + 180.0)
            return "kite", retreat_x, enemy_unit.y
        elif dist <= effective_firing_range:
            # Sudah dalam jangkauan tembak: BERHENTI & TEMBAK DARI JARAK JAUH
            return "hold", enemy_unit.x, enemy_unit.y
        else:
            # Di luar jangkauan: maju secara perlahan ke arah prediksi pergerakan musuh
            angle = math.atan2(predicted_target_y - enemy_unit.y, predicted_target_x - enemy_unit.x)
            advance_dist = dist - (my_range * 0.75)
            tx = enemy_unit.x + math.cos(angle) * max(0.0, advance_dist)
            ty = enemy_unit.y + math.sin(angle) * max(0.0, advance_dist)
            return "intercept", tx, ty

    # 2. Tank MBT & APC/IFV: Membentuk Garis Tempur Tersebar (Spread Battle Line)
    # Menembak dari jarak aman, menjaga formasi sayap agar tidak menumpuk dalam 1 titik
    if enemy_unit.kind in ("tank", "apcIfv"):
        if dist < 320.0:
            # Terlalu dekat: reposisi mundur sedikit untuk menjaga sudut elevasi meriam
            angle = math.atan2(target.y - enemy_unit.y, target.x - enemy_unit.x)
            tx = enemy_unit.x - math.cos(angle) * 120.0
            ty = enemy_unit.y - math.sin(angle) * 120.0
            return "kite", tx, ty
        elif dist <= effective_firing_range:
            # Jarak ideal pertempuran kavaleri/baja: BERHENTI, BIDIK & TEMBAK!
            return "hold", enemy_unit.x, enemy_unit.y
        else:
            # Di luar jangkauan: maju berhati-hati dengan formasi sayap terpisah menuju arah prediksi
            angle = math.atan2(predicted_target_y - enemy_unit.y, predicted_target_x - enemy_unit.x)
            battle_dist = 550.0 if enemy_unit.kind == "tank" else 450.0
            advance_dist = max(0.0, dist - battle_dist)
            lateral_angle = angle + (math.pi / 2.8 if enemy_unit.kind == "tank" else -math.pi / 2.8)
            lateral_offset = 140.0
            tx = enemy_unit.x + math.cos(angle) * advance_dist + math.cos(lateral_angle) * lateral_offset
            ty = enemy_unit.y + math.sin(angle) * advance_dist + math.sin(lateral_angle) * lateral_offset
            return "intercept", tx, ty

    # 3. Kendaraan Taktis: Manuver Penjagaan Sayap (Flank Patrol) dari jarak aman
    if enemy_unit.kind == "kendaraanTaktis":
        if dist <= effective_firing_range:
            return "hold", enemy_unit.x, enemy_unit.y
        else:
            offset_y = 120.0 if enemy_unit.y < target.y else -120.0
            angle = math.atan2(predicted_target_y - enemy_unit.y, predicted_target_x - enemy_unit.x)
            advance_dist = dist - (my_range * 0.6)
            flank_x = enemy_unit.x + math.cos(angle) * max(0.0, advance_dist)
            flank_y = enemy_unit.y + math.sin(angle) * max(0.0, advance_dist) + offset_y
            return "flank", flank_x, flank_y

    # 4. Infanteri & Unit Lainnya: Mengambil Posisi Perlindungan (Cover & Fire)
    if dist <= effective_firing_range:
        return "hold", enemy_unit.x, enemy_unit.y

    # Maju secara disiplin menuju arah prediksi target
    angle = math.atan2(predicted_target_y - enemy_unit.y, predicted_target_x - enemy_unit.x)
    advance_dist = dist - (my_range * 0.6)
    tx = enemy_unit.x + math.cos(angle) * max(0.0, advance_dist)
    ty = enemy_unit.y + math.sin(angle) * max(0.0, advance_dist)

    # Batasi agar tidak keluar peta
    tx = max(100.0, min(map_bounds.get("max_x", 6400.0) - 100.0, tx))
    ty = max(100.0, min(map_bounds.get("max_y", 2400.0) - 100.0, ty))

    return "intercept", tx, ty


def compute_ai_war_cycle(
    enemy_units: List[UnitState],
    user_units: List[UnitState],
    map_bounds: Optional[Dict[str, float]] = None
) -> TacticalAIResponse:
    """
    Siklus utama pemikiran AI perang: menghitung pergerakan dan tembakan seluruh unit AI.
    Menjamin setiap unit user yang terdeteksi (termasuk unit yang baru dikeluarkan) diserang.
    """
    bounds = map_bounds or {"max_x": 6400.0, "max_y": 2400.0}
    movements: List[MovementDecision] = []
    attacks: List[AttackDecision] = []

    # AI hanya dapat menargetkan unit user yang terlihat (Fog of War)
    visible_targets = [u for u in user_units if u.is_visible]
    if not visible_targets:
        return TacticalAIResponse(
            alert_level=0,
            tactical_message="Target tidak terlihat dalam pantauan radar pertahanan.",
            movements=[
                MovementDecision(
                    unit_id=enemy.id,
                    action="hold",
                    target_x=enemy.x,
                    target_y=enemy.y,
                    speed=SPEED_RATES.get(enemy.group, 360.0)
                ) for enemy in enemy_units
            ],
            attacks=[]
        )

    for enemy in enemy_units:
        # 1. Tentukan Gerakan Manuver Taktis AI
        action, tx, ty = decide_tactical_action(enemy, visible_targets, bounds)
        speed = SPEED_RATES.get(enemy.group, 360.0)
        movements.append(MovementDecision(
            unit_id=enemy.id,
            action=action,
            target_x=round(tx, 1),
            target_y=round(ty, 1),
            speed=speed
        ))

        # 2. Tentukan Tembakan Serangan AI
        attack_range = ATTACK_RANGES.get(enemy.kind, 750.0)
        in_range_targets = [
            u for u in visible_targets
            if distance(enemy.x, enemy.y, u.x, u.y) <= attack_range
        ]

        # Jika target belum persis di dalam range dasar, beri toleransi intersepsi proaktif
        if not in_range_targets:
            closest = min(visible_targets, key=lambda t: distance(enemy.x, enemy.y, t.x, t.y))
            if distance(enemy.x, enemy.y, closest.x, closest.y) <= attack_range * 1.25:
                in_range_targets = [closest]

        if in_range_targets:
            # Pilih target dengan prioritas taktis tertinggi (artileri/tank/unit terdekat)
            best_target = max(in_range_targets, key=lambda t: score_target_priority(enemy, t))
            weapon_type = 0 if enemy.kind in ("artileriBerat", "peluncurRoket") else (
                1 if enemy.group == "udara" else 4
            )
            base_dmg = math.sqrt(enemy.quantity) * 12.0

            # Hit chance realistis (menurun seiring bertambahnya jarak tembak)
            target_dist = distance(enemy.x, enemy.y, best_target.x, best_target.y)
            accuracy = max(0.60, min(0.95, 1.0 - (target_dist / (attack_range * 2.0))))
            penetration = 1.4 if enemy.kind in ("tank", "artileriBerat") else (
                0.8 if enemy.kind == "infanteri" else 1.0
            )

            attacks.append(AttackDecision(
                attacker_id=enemy.id,
                target_unit_id=best_target.id,
                target_x=round(best_target.x, 1),
                target_y=round(best_target.y, 1),
                weapon_type=weapon_type,
                damage_potential=round(base_dmg, 1),
                hit_chance=round(accuracy, 2),
                penetration=penetration,
                in_range=True
            ))

    alert = 3 if attacks else (2 if any(m.action != "hold" for m in movements) else 1)
    msg = f"AI mengarahkan {len(movements)} formasi manuver dan meluncurkan {len(attacks)} serangan tembakan!"

    return TacticalAIResponse(
        alert_level=alert,
        tactical_message=msg,
        movements=movements,
        attacks=attacks
    )
