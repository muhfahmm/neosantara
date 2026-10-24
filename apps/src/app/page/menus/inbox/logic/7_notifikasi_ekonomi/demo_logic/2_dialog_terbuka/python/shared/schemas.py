from enum import Enum
from typing import Any
from pydantic import BaseModel, Field

class Choice(str, Enum):
    HARD_POWER = "HARD_POWER"
    SOFT_POWER = "SOFT_POWER"
    CONCESSION = "CONCESSION"

class NPCState(BaseModel):
    anger_level: int = Field(75, ge=0, le=100)
    trust_level: int = Field(30, ge=0, le=100)
    patience: int = Field(3, ge=0)
    memory: dict[str, Any] = Field(default_factory=dict)

class PlayerState(BaseModel):
    budget: int = Field(100_000, ge=0)

class ChoiceOption(BaseModel):
    choice: Choice
    text: str

class NegotiateChoiceRequest(BaseModel):
    choice: Choice
    npc_state: NPCState
    player_state: PlayerState = Field(default_factory=PlayerState)

class NegotiateChoiceResponse(BaseModel):
    status: str
    npc_state: NPCState
    player_state: PlayerState
    npc_response: str
    choices: list[ChoiceOption] | None
    events: list[str] = Field(default_factory=list)
