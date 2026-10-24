from ..shared.schemas import NPCState

def normalize_state(state: NPCState) -> NPCState:
    state.anger_level = max(0, min(100, state.anger_level))
    state.trust_level = max(0, min(100, state.trust_level))
    state.patience = max(0, state.patience)
    return state
