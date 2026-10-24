from ..dialog_AI.nlg_templates import reaction_text
from ..dialog_AI.npc_state import normalize_state
from ..shared.game_rules import ACTION_EFFECTS, RIOT_ANGER, SUCCESS_TRUST
from ..shared.schemas import Choice, NPCState, PlayerState

def _escalation_events(npc: NPCState) -> list[str]:
    if npc.anger_level < 80 or npc.trust_level > 20:
        return []
    events = ["Massa memblokade akses menuju pusat pemerintahan."]
    if npc.anger_level >= 90:
        events.append("Bentrok sporadis mulai terjadi di sekitar lokasi aksi.")
    if npc.anger_level >= 100:
        events.append("Kerusuhan meluas; fasilitas umum terancam rusak.")
    return events


def apply_choice(choice: Choice, npc: NPCState, player: PlayerState) -> tuple[str, str, list[str]]:
    effects = ACTION_EFFECTS[choice]
    cost = -effects["budget"]
    if player.budget < cost:
        raise ValueError("Anggaran tidak mencukupi untuk memenuhi tuntutan.")
    player.budget += effects["budget"]
    npc.anger_level += effects["anger"]
    npc.trust_level += effects["trust"]
    npc.patience -= effects["patience"]
    npc.memory[choice.value] = npc.memory.get(choice.value, 0) + 1
    normalize_state(npc)
    events = _escalation_events(npc)
    status = "success" if npc.trust_level >= SUCCESS_TRUST else "riot" if npc.anger_level >= RIOT_ANGER else "walkout" if npc.patience == 0 else "ongoing"
    return status, reaction_text(choice, status, npc), events


def apply_policy_confirmation(
    policy_type: str,
    demand_text: str,
    policy_changes: list[str],
    npc: NPCState,
) -> tuple[str, str, list[str]]:
    effects = {
        "tax": (-12, 16),
        "price": (-14, 18),
        "subsidy": (-18, 22),
    }
    anger_change, trust_change = effects[policy_type]
    npc.anger_level += anger_change
    npc.trust_level += trust_change
    npc.memory["confirmed_policy_count"] = npc.memory.get("confirmed_policy_count", 0) + 1
    npc.memory["last_confirmed_policy"] = policy_type
    normalize_state(npc)

    events = _escalation_events(npc)
    status = (
        "success" if npc.trust_level >= SUCCESS_TRUST
        else "riot" if npc.anger_level >= RIOT_ANGER
        else "walkout" if npc.patience == 0
        else "ongoing"
    )
    action_summary = "; ".join(policy_changes) if policy_changes else "belum ada perubahan rinci yang dicatat"
    policy_subject = {
        "tax": "kebijakan pajak",
        "price": "harga barang pokok",
        "subsidy": "alokasi subsidi",
    }[policy_type]

    if status == "riot":
        response = (
            f"Kami mendengar pemerintah mengonfirmasi tuntutan “{demand_text}”, "
            f"termasuk {action_summary}. Namun, kemarahan massa masih memuncak; "
            "pengumuman ini belum cukup untuk menghentikan kerusuhan."
        )
    elif status == "walkout":
        response = (
            f"Kami mencatat konfirmasi atas “{demand_text}” terkait {policy_subject} "
            f"({action_summary}), tetapi kesabaran perwakilan sudah habis. Kami meninggalkan forum "
            "dan akan menunggu bukti pelaksanaan di lapangan."
        )
    elif status == "success":
        response = (
            f"Kami menerima konfirmasi pemerintah atas tuntutan “{demand_text}”. "
            f"Perubahan {policy_subject} yang dicatat adalah {action_summary}. "
            "Kami akan menyampaikan kesepakatan ini kepada massa dan mengawal pelaksanaannya."
        )
    else:
        response = (
            f"Kami mencatat pemerintah mengonfirmasi tuntutan “{demand_text}”. "
            f"Untuk {policy_subject}, perubahan yang disampaikan adalah {action_summary}. "
            "Ini langkah yang relevan; kami akan menunggu pelaksanaannya dan meminta "
            "perwakilan rakyat ikut mengawasi."
        )

    return status, response, events
