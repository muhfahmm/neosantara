from ..shared.schemas import PlayerState

def can_afford(player: PlayerState, cost: int) -> bool:
    return player.budget >= cost
