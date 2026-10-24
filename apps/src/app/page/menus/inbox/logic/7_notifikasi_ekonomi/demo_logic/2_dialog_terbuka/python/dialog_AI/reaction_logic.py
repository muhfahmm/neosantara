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
