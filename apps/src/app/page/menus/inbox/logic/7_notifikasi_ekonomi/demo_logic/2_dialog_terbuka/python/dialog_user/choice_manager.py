from ..dialog_AI.nlg_templates import choice_text
from ..shared.schemas import Choice, ChoiceOption, NPCState

def generate_choices(state: NPCState) -> list[ChoiceOption]:
    return [ChoiceOption(choice=choice, text=choice_text(choice, state)) for choice in Choice]
