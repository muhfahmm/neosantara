"""
Modul logika taktis AI perang: pergerakan (manuver taktis, flanking, chase, kite)
dan penentuan tembakan (pembagian target, jangkauan serang, kalkulasi akurasi).
"""

import math
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

with Path(__file__).with_name("combat_damage_profiles.json").open(encoding="utf-8") as profile_file:
    COMBAT_DAMAGE_PROFILES = json.load(profile_file)

SPEED_RATES: Dict[str, float] = {
    "udara": 720.0,
    "darat": 420.0,
    "laut": 280.0,
}


def attack_range_for(unit: "UnitState") -> float:
    profile = COMBAT_DAMAGE_PROFILES["units"].get(
        unit.kind,
        {"base_attack_range": 750.0},
    )
    strength_factor = 1.0 + min(math.log(max(0, unit.quantity) + 1.0), 6.0) / 12.0
    return profile["base_attack_range"] * strength_factor


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


# Daftar unit yang memiliki kapabilitas Anti-Air (SAM, SPAAG, Pencegat, Rudal AA Kapal)
ANTI_AIR_KINDS = {
    "pertahananUdaraMobile",  # SAM / SPAAG darat
    "jetTempurInterceptor",   # Pesawat pencegat khusus duel udara
    "jetTempurSiluman",       # Jet multirole siluman dengan AAM
    "destroyer",              # Kapal perusak dengan rudal pertahanan udara
    "korvet",                 # Kapal korvet dengan sistem rudal AA
    "infanteri",              # Infanteri pembawa MANPADS garis depan
}


def can_attack_target(attacker: UnitState, target: UnitState) -> bool:
    """
    Mengecek apakah penyerang diizinkan menembak target berdasarkan domain matra (darat/laut/udara).
    Jika target berada di udara (jet/helikopter/drone), penembak HARUS dari kategori Anti-Air atau sesama unit udara.
    """
    if target.group in ("darat", "laut"):
        return True

    if target.group == "udara":
        return attacker.kind in ANTI_AIR_KINDS or attacker.group == "udara"

    return False


# State Morale & Sejarah Kuantitas Pasukan AI
# Format: { unit_id: { "initial_qty": int, "morale": float } }
AI_UNIT_MORALE: Dict[str, Dict[str, float]] = {}



def decide_tactical_action(
    enemy_unit: UnitState,
    threats: List[UnitState],
    map_bounds: Dict[str, float]
) -> tuple[str, float, float]:
    """
    Menentukan perilaku gerakan unit AI (Intersep/Menyerbu, Flanking, Kiting, atau Routing/Retreat jika morale hancur).
    Secara proaktif memburu semua unit user termasuk yang baru dideploy dari hangar/barak/gudang.
    """
    if not threats:
        # Standby di posisi saat ini
        return "hold", enemy_unit.x, enemy_unit.y

    # SISTEM MORALE & ROUTING (TACTICAL REALISM):
    # Jika unit kehilangan >40% pasukan aslinya, morale anjlok. Jika morale < 25, unit panik dan retreat mundur ke markas.
    morale_data = AI_UNIT_MORALE.setdefault(enemy_unit.id, {"initial_qty": float(enemy_unit.quantity), "morale": 100.0})
    initial_qty = morale_data["initial_qty"]
    if initial_qty > 0:
        health_ratio = enemy_unit.quantity / initial_qty
        morale_data["morale"] = max(0.0, min(100.0, health_ratio * 100.0))

    if morale_data["morale"] < 25.0:
        # Unit ROUTING: Mundur ke garis belakang pertahanan (x mendekati batas timur peta)
        retreat_x = min(map_bounds.get("max_x", 6400.0) - 150.0, enemy_unit.x + 400.0)
        return "kite", retreat_x, enemy_unit.y

    # Cari target user dengan skor ancaman/kedekatan tertinggi
    target = max(threats, key=lambda t: score_target_priority(enemy_unit, t))

    # PREDIKSI PERGERAKAN (LEAD TARGET INTERCEPTION):
    # Proyeksikan posisi target 1.0 detik ke depan berdasarkan vektor kecepatannya (vx, vy)
    predicted_target_x = target.x + (target.vx * 1.0)
    predicted_target_y = target.y + (target.vy * 1.0)

    dist = distance(enemy_unit.x, enemy_unit.y, target.x, target.y)
    my_range = attack_range_for(enemy_unit)

    # Doktrin Tempur Realistis:
    # Jika unit sudah berada dalam radius tembak efektif (in firing range), unit mengambil posisi bertahan/menembak (HOLD / STAND-OFF)
    # Tidak menyerbu langsung secara membabi buta ("tidak maju langsung!")
    effective_firing_range = my_range * 0.85
    min_safe_standoff = my_range * 0.35

    # 0. Unit Udara (Air Combat Maneuver Doctrine):
    # Pesawat tidak boleh diam/hover (kecuali helikopter). Jika target terlalu dekat atau pasca tembak,
    # pesawat melakukan manuver fly-by / kite untuk berputar dan menyiapkan lintasan serang baru.
    if enemy_unit.group == "udara" and enemy_unit.kind != "helikopterSerang":
        if dist < 450.0:
            # Fly-by: Melintas melewati target lalu berputar
            angle = math.atan2(target.y - enemy_unit.y, target.x - enemy_unit.x)
            flyby_x = target.x + math.cos(angle) * 800.0
            flyby_y = target.y + math.sin(angle) * 800.0
            return "kite", flyby_x, flyby_y
        else:
            # Intercept dari jarak jauh dengan manuver sweeping
            angle = math.atan2(predicted_target_y - enemy_unit.y, predicted_target_x - enemy_unit.x)
            advance_dist = max(500.0, dist - (my_range * 0.7))
            tx = enemy_unit.x + math.cos(angle) * advance_dist
            ty = enemy_unit.y + math.sin(angle) * advance_dist
            return "intercept", tx, ty

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


# Global AI Memory untuk Last Known Position (LKP) unit musuh
# Format: { unit_id: { "x": float, "y": float, "kind": str, "group": str, "quantity": int, "label": str, "timestamp": float } }
AI_LKP_MEMORY: Dict[str, Dict[str, Any]] = {}


def compute_ai_war_cycle(
    enemy_units: List[UnitState],
    user_units: List[UnitState],
    map_bounds: Optional[Dict[str, float]] = None
) -> TacticalAIResponse:
    """
    Siklus utama pemikiran AI perang:
    1. Memperbarui memori posisi terakhir (LKP) jika musuh terlihat, dan memburu LKP jika musuh menghilang di Fog of War.
    2. Target Claiming: Mencegah overkill dengan membatasi maksimal 2 unit AI mengklaim target yang sama.
    """
    bounds = map_bounds or {"max_x": 6400.0, "max_y": 2400.0}
    movements: List[MovementDecision] = []
    attacks: List[AttackDecision] = []

    # Bersihkan memori dari unit yang sudah hancur (quantity <= 0)
    active_user_ids = {u.id for u in user_units if u.quantity > 0}
    for mem_id in list(AI_LKP_MEMORY.keys()):
        if mem_id not in active_user_ids:
            del AI_LKP_MEMORY[mem_id]

    # Update memori untuk unit user yang saat ini terlihat (is_visible)
    for u in user_units:
        if u.is_visible and u.quantity > 0:
            AI_LKP_MEMORY[u.id] = {
                "x": u.x,
                "y": u.y,
                "vx": u.vx,
                "vy": u.vy,
                "kind": u.kind,
                "group": u.group,
                "quantity": u.quantity,
                "label": u.label,
            }

    # Kumpulkan target potensial: Prioritaskan yang terlihat langsung; jika tidak ada, gunakan memori LKP
    visible_targets = [u for u in user_units if u.is_visible and u.quantity > 0]
    
    # Jika tidak ada yang terlihat langsung, buat unit bayangan dari LKP untuk diselidiki AI
    investigation_targets: List[UnitState] = []
    if not visible_targets and AI_LKP_MEMORY:
        for u_id, mem in AI_LKP_MEMORY.items():
            investigation_targets.append(UnitState(
                id=u_id,
                kind=mem["kind"],
                group=mem["group"],
                label=mem["label"],
                quantity=mem["quantity"],
                x=mem["x"],
                y=mem["y"],
                vx=mem.get("vx", 0.0),
                vy=mem.get("vy", 0.0),
                is_enemy=False,
                is_visible=False,
            ))

    effective_movement_targets = visible_targets if visible_targets else investigation_targets

    if not effective_movement_targets:
        return TacticalAIResponse(
            alert_level=0,
            tactical_message="Tidak ada kontak musuh. Radar pertahanan dalam status siaga.",
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

    # ─────────────────────────────────────────────────────────────
    # 1. LOGIKA VANGUARD & RESERVE (Mencegah AI Menyerbu Bersamaan)
    # ─────────────────────────────────────────────────────────────
    # Urutkan unit AI berdasarkan jarak terdekat ke sasaran
    sorted_enemies = sorted(
        enemy_units,
        key=lambda e: min([distance(e.x, e.y, t.x, t.y) for t in effective_movement_targets] or [99999.0])
    )

    # Hanya 40% unit terdekat yang boleh maju menyerang (Vanguard), sisanya cadangan (Reserve)
    max_vanguard = max(2, int(len(enemy_units) * 0.4))
    vanguard_count = 0

    for enemy in sorted_enemies:
        is_vanguard = vanguard_count < max_vanguard

        if is_vanguard:
            # Pertahankan posisi sampai pasukan pemain memasuki jangkauan tembak.
            nearest_target = min(
                effective_movement_targets,
                key=lambda target: distance(enemy.x, enemy.y, target.x, target.y),
            )
            firing_range = attack_range_for(enemy) * 0.85
            if distance(enemy.x, enemy.y, nearest_target.x, nearest_target.y) > firing_range:
                action, tx, ty = "hold", enemy.x, enemy.y
            else:
                action, tx, ty = decide_tactical_action(enemy, effective_movement_targets, bounds)
            speed_multiplier = 1.0
            vanguard_count += 1
        else:
            # Barisan cadangan bertahan atau bergerak lambat di staging area (Kecepatan 40%)
            action = "hold"
            tx, ty = enemy.x, enemy.y
            speed_multiplier = 0.4

        base_speed = SPEED_RATES.get(enemy.group, 360.0)
        final_speed = base_speed * speed_multiplier

        movements.append(MovementDecision(
            unit_id=enemy.id,
            action=action,
            target_x=round(tx, 1),
            target_y=round(ty, 1),
            speed=round(final_speed, 1)
        ))


    # ─────────────────────────────────────────────────────────────
    # 2. STRICT TARGET CLAIMING & FORWARD OBSERVER (Anti Overkill)
    # ─────────────────────────────────────────────────────────────
    claimed_target_counts: Dict[str, int] = {u.id: 0 for u in visible_targets}
    spotter_units = [e for e in enemy_units if e.kind in ("infanteri", "apcIfv", "kendaraanTaktis", "droneKamikaze", "helikopterSerang")]

    # Ambil ID unit-unit yang bertindak sebagai vanguard (bergerak aktif)
    active_vanguard_ids = {m.unit_id for m in movements if m.action != "hold"}

    for enemy in enemy_units:
        # Unit diizinkan menembak jika berada dalam jangkauan tembak (baik sedang manuver maupun hold/stand-off)


        is_artillery = enemy.kind in ("artileriBerat", "peluncurRoket")
        attack_range = attack_range_for(enemy)

        # FILTERING: Hanya masukkan target yang BOLEH diserang oleh unit ini (Logika Anti-Air Domain)
        in_range_targets = [
            u for u in visible_targets
            if distance(enemy.x, enemy.y, u.x, u.y) <= attack_range
            and can_attack_target(enemy, u)
        ]

        if is_artillery and in_range_targets:
            # Forward observer requirement untuk artileri
            spotted_targets = [
                u for u in in_range_targets
                if any(distance(sp.x, sp.y, u.x, u.y) <= 900.0 for sp in spotter_units) or distance(enemy.x, enemy.y, u.x, u.y) <= 600.0
            ]
            in_range_targets = spotted_targets

        if not in_range_targets and not is_artillery:
            valid_closest = [u for u in visible_targets if can_attack_target(enemy, u)]
            if valid_closest:
                closest = min(valid_closest, key=lambda t: distance(enemy.x, enemy.y, t.x, t.y))
                if distance(enemy.x, enemy.y, closest.x, closest.y) <= attack_range * 1.25:
                    in_range_targets = [closest]

        if in_range_targets:
            sorted_targets = sorted(
                in_range_targets,
                key=lambda t: score_target_priority(enemy, t),
                reverse=True
            )

            # Strict Target Claiming: Batasi penembak per target (Artileri butuh tembakan salvo max 3, unit lain max 1)
            selected_target = None
            for t in sorted_targets:
                limit = 3 if enemy.kind in ("artileriBerat", "peluncurRoket") else 1
                if claimed_target_counts.get(t.id, 0) < limit:
                    selected_target = t
                    break

            # JIKA SEMUA TARGET SUDAH DIKLAIM PENUH: Tahan tembakan (Hold Fire)
            if not selected_target:
                continue

            claimed_target_counts[selected_target.id] = claimed_target_counts.get(selected_target.id, 0) + 1

            # Profil Senjata Realistis:
            # 5: Rudal Anti-Air (SAM / Interceptor / Destroyer AA)
            # 0: Artileri / MLRS
            # 1: Rudal Serang Udara-ke-Darat
            # 4: Kanon Darat / Senapan Mesin / Meriam Tank
            if enemy.kind in ("pertahananUdaraMobile", "jetTempurInterceptor") or (selected_target.group == "udara" and enemy.kind in ANTI_AIR_KINDS):
                weapon_type = 5
            elif enemy.kind in ("artileriBerat", "peluncurRoket"):
                weapon_type = 0
            elif enemy.group == "udara":
                weapon_type = 1
            else:
                weapon_type = 4

            damage_profile = COMBAT_DAMAGE_PROFILES["units"].get(
                enemy.kind,
                {"base_damage": 20.0, "damage_per_sqrt_unit": 2.0, "penetration": 0.75},
            )
            base_dmg = damage_profile["base_damage"] + math.sqrt(max(0, enemy.quantity)) * damage_profile["damage_per_sqrt_unit"]

            # Hit chance realistis (menurun seiring bertambahnya jarak tembak)
            target_dist = distance(enemy.x, enemy.y, selected_target.x, selected_target.y)
            accuracy = max(0.60, min(0.95, 1.0 - (target_dist / (attack_range * 2.0))))
            penetration = damage_profile["penetration"]

            attacks.append(AttackDecision(
                attacker_id=enemy.id,
                target_unit_id=selected_target.id,
                target_x=round(selected_target.x, 1),
                target_y=round(selected_target.y, 1),
                weapon_type=weapon_type,
                damage_potential=round(base_dmg, 1),
                hit_chance=round(accuracy, 2),
                penetration=penetration,
                in_range=True
            ))

    alert = 3 if attacks else (2 if any(m.action != "hold" for m in movements) else 1)
    msg = f"AI mengerahkan {vanguard_count} unit Vanguard. {len(attacks)} tembakan terdistribusi rapi!"

    return TacticalAIResponse(
        alert_level=alert,
        tactical_message=msg,
        movements=movements,
        attacks=attacks
    )
