from .schemas import Choice

SUCCESS_TRUST = 80
RIOT_ANGER = 100
ACTION_EFFECTS = {
    Choice.HARD_POWER: {"anger": 20, "trust": -15, "patience": -1, "budget": 0},
    Choice.SOFT_POWER: {"anger": -10, "trust": 8, "patience": -1, "budget": 0},
    Choice.CONCESSION: {"anger": -18, "trust": 22, "patience": 0, "budget": -20_000},
}
